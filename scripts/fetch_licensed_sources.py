#!/usr/bin/env python3
"""Fetch allowlisted, explicitly licensed source pages to a temporary cache.

This script does not publish knowledge chunks and never copies source text into
the repository. A later human-reviewed step must summarize useful material and
preserve attribution. Missing/ambiguous license metadata causes a hard failure.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
import time
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlparse
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
REGISTRY = ROOT / "knowledge" / "sources.json"
DEFAULT_CACHE = ROOT / ".source-cache"
USER_AGENT = "MaintenanceAIToolkit-KnowledgeFetcher/0.1 (license-aware; contact repo maintainer)"
MAX_BYTES = 8 * 1024 * 1024
TIMEOUT_SECONDS = 20


class TextExtractor(HTMLParser):
    """Extract a minimal text representation; deliberately ignores scripts/styles."""

    SKIP_TAGS = {"script", "style", "noscript", "svg"}

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.skip_depth = 0
        self.parts: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag in self.SKIP_TAGS:
            self.skip_depth += 1
        elif tag in {"p", "li", "h1", "h2", "h3", "h4", "br"} and not self.skip_depth:
            self.parts.append("\n")

    def handle_endtag(self, tag: str) -> None:
        if tag in self.SKIP_TAGS and self.skip_depth:
            self.skip_depth -= 1
        elif tag in {"p", "li", "h1", "h2", "h3", "h4"} and not self.skip_depth:
            self.parts.append("\n")

    def handle_data(self, data: str) -> None:
        if not self.skip_depth:
            cleaned = re.sub(r"\s+", " ", data).strip()
            if cleaned:
                self.parts.append(cleaned)

    def text(self) -> str:
        return re.sub(r"[ \t]+", " ", "".join(self.parts)).strip()


def load_registry() -> dict:
    data = json.loads(REGISTRY.read_text(encoding="utf-8"))
    if data.get("schema_version") != 1:
        raise ValueError("Unsupported sources.json schema_version")
    if not isinstance(data.get("sources"), list):
        raise ValueError("sources must be a list")
    return data


def validate_source(source: dict, accepted_licenses: set[str]) -> None:
    required = ("id", "title", "url", "license", "license_url", "license_evidence_url", "status")
    missing = [key for key in required if not source.get(key)]
    if missing:
        raise ValueError(f"{source.get('id', '<unknown>')}: missing fields {missing}")
    if source["license"] not in accepted_licenses:
        raise ValueError(f"{source['id']}: license {source['license']!r} is not allowlisted")
    if source["status"] != "candidate":
        raise ValueError(f"{source['id']}: status is {source['status']!r}, not candidate")
    parsed = urlparse(source["url"])
    if parsed.scheme != "https" or not parsed.netloc:
        raise ValueError(f"{source['id']}: source URL must be HTTPS")
    if source["license_verified_on"] == "" or not source.get("license_evidence_url"):
        raise ValueError(f"{source['id']}: license evidence is incomplete")


def fetch_page(source: dict) -> tuple[bytes, str]:
    request = Request(source["url"], headers={"User-Agent": USER_AGENT, "Accept": "application/xml, text/xml, application/xhtml+xml, text/html;q=0.9"})
    with urlopen(request, timeout=TIMEOUT_SECONDS) as response:
        final_url = response.geturl()
        if urlparse(final_url).scheme != "https":
            raise ValueError(f"{source['id']}: redirected to non-HTTPS URL")
        content_type = response.headers.get_content_type()
        if content_type not in {
            "text/html", "application/xhtml+xml", "application/xml", "text/xml"
        }:
            raise ValueError(f"{source['id']}: unexpected content type {content_type}")
        body = response.read(MAX_BYTES + 1)
        if len(body) > MAX_BYTES:
            raise ValueError(f"{source['id']}: response exceeded {MAX_BYTES} bytes")
        charset = response.headers.get_content_charset() or "utf-8"
        return body.decode(charset, errors="replace").encode("utf-8"), final_url


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--cache-dir", default=str(DEFAULT_CACHE))
    parser.add_argument("--validate-only", action="store_true")
    args = parser.parse_args()

    registry = load_registry()
    accepted = set(registry["policy"].get("accepted_licenses", []))
    if registry["policy"].get("reject_missing_or_ambiguous_license") is not True:
        raise ValueError("Safety policy must reject missing/ambiguous licenses")

    cache_dir = Path(args.cache_dir)
    fetched_at = datetime.now(timezone.utc).isoformat(timespec="seconds")
    errors = 0
    for source in registry["sources"]:
        try:
            validate_source(source, accepted)
            if args.validate_only:
                print(f"VALID\t{source['id']}\t{source['license']}")
                continue

            html_bytes, final_url = fetch_page(source)
            parser_obj = TextExtractor()
            parser_obj.feed(html_bytes.decode("utf-8", errors="replace"))
            text = parser_obj.text()
            if len(text) < 300:
                raise ValueError("extracted text is unexpectedly short; requires manual review")

            # License is not inferred from page availability. Human review of the
            # declared license and evidence URL remains mandatory.
            digest = hashlib.sha256(html_bytes).hexdigest()
            record = {
                "id": source["id"],
                "title": source["title"],
                "source_url": source["url"],
                "final_url": final_url,
                "license": source["license"],
                "license_url": source["license_url"],
                "license_evidence_url": source["license_evidence_url"],
                "license_verified_on": source["license_verified_on"],
                "source_last_updated": source.get("source_last_updated"),
                "last_update_status": source.get("last_update_status", "unknown"),
                "fetched_at": fetched_at,
                "sha256": digest,
                "extracted_text": text,
                "review_required": True,
                "note": "Cache only; do not publish extracted text. Summarize in original words with attribution."
            }
            cache_dir.mkdir(parents=True, exist_ok=True)
            (cache_dir / f"{source['id']}.json").write_text(
                json.dumps(record, ensure_ascii=False, indent=2) + "\n",
                encoding="utf-8"
            )
            print(f"FETCHED\t{source['id']}\t{len(text)} chars\tsha256={digest[:12]}")
            time.sleep(1)
        except (ValueError, HTTPError, URLError, TimeoutError, OSError, json.JSONDecodeError) as exc:
            errors += 1
            print(f"REJECTED\t{source.get('id', '<unknown>')}\t{exc}", file=sys.stderr)

    print(f"Finished at {fetched_at}; errors={errors}")
    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
