#!/usr/bin/env python3
"""Extract page-aware text from public, redistributable PDFs for P4 staging.

This script does not perform OCR, validate technical claims, or certify copyright.
It emits one JSON sidecar per PDF under knowledge/extracted/.
"""
from __future__ import annotations

import hashlib
import json
import sys
from pathlib import Path

MAX_PDF_BYTES = 20 * 1024 * 1024
MAX_PAGE_CHARS = 80_000
INPUT_ROOT = Path("knowledge/documents")
OUTPUT_ROOT = Path("knowledge/extracted")


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def safe_relative(path: Path, root: Path) -> str:
    return path.relative_to(root).as_posix()


def extract_one(pdf_path: Path, reader_type) -> dict:
    size = pdf_path.stat().st_size
    if size <= 0 or size > MAX_PDF_BYTES:
        raise ValueError(f"PDF size must be between 1 byte and {MAX_PDF_BYTES} bytes")
    digest = sha256_file(pdf_path)
    reader = reader_type(str(pdf_path), strict=False)
    pages = []
    for number, page in enumerate(reader.pages, start=1):
        text = (page.extract_text() or "").replace("\x00", "").strip()
        if len(text) > MAX_PAGE_CHARS:
            text = text[:MAX_PAGE_CHARS]
            extraction_status = "truncated_review_required"
        elif text:
            extraction_status = "text_extracted_review_required"
        else:
            extraction_status = "ocr_required"
        pages.append({
            "page_number": number,
            "text": text,
            "text_sha256": hashlib.sha256(text.encode("utf-8")).hexdigest() if text else None,
            "text_char_count": len(text),
            "extraction_status": extraction_status,
            "table_extraction_status": "manual_review_required" if text else "ocr_required"
        })
    return {
        "schema_version": 1,
        "source": {
            "repository_path": safe_relative(pdf_path, Path(".")),
            "filename": pdf_path.name,
            "mime_type": "application/pdf",
            "byte_size": size,
            "sha256": digest
        },
        "extraction": {
            "engine": "pypdf",
            "engine_version": None,
            "page_count": len(pages),
            "status": "complete" if pages and all(p["text"] for p in pages) else "partial",
            "ocr_performed": False,
            "technical_validation": "not_performed"
        },
        "pages": pages
    }


def main() -> int:
    try:
        from pypdf import PdfReader
    except ImportError:
        print("Missing dependency: install pypdf", file=sys.stderr)
        return 2

    pdfs = sorted(INPUT_ROOT.rglob("*.pdf")) if INPUT_ROOT.exists() else []
    if not pdfs:
        print("No PDFs found; nothing to extract.")
        return 0

    OUTPUT_ROOT.mkdir(parents=True, exist_ok=True)
    failures = 0
    for pdf in pdfs:
        relative = pdf.relative_to(INPUT_ROOT)
        output = (OUTPUT_ROOT / relative).with_suffix(".pages.json")
        output.parent.mkdir(parents=True, exist_ok=True)
        try:
            result = extract_one(pdf, PdfReader)
            output.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
            extracted = sum(1 for page in result["pages"] if page["text"])
            print(f"{pdf}: {extracted}/{result['extraction']['page_count']} pages with text -> {output}")
        except Exception as error:  # malformed or encrypted PDFs must not stop other documents
            failures += 1
            print(f"FAILED {pdf}: {error}", file=sys.stderr)
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
