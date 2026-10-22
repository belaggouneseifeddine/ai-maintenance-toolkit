#!/usr/bin/env python3
"""Offline validation for the licensed-source registry and knowledge draft."""
import json
import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REGISTRY_PATH = ROOT / "knowledge" / "sources.json"
DRAFT_PATH = ROOT / "knowledge" / "CENTRIFUGAL-PUMP-TROUBLESHOOTING-DRAFT.md"
SCRIPT_PATH = ROOT / "scripts" / "fetch_licensed_sources.py"


class KnowledgeAssetsTests(unittest.TestCase):
    def test_registry_is_valid_json_and_has_explicit_license_fields(self):
        data = json.loads(REGISTRY_PATH.read_text(encoding="utf-8"))
        self.assertEqual(data.get("schema_version"), 1)
        self.assertTrue(data["policy"]["reject_missing_or_ambiguous_license"])
        self.assertGreater(len(data["sources"]), 0)
        ids = set()
        for source in data["sources"]:
            self.assertNotIn(source["id"], ids, "duplicate source id")
            ids.add(source["id"])
            self.assertTrue(source["url"].startswith("https://"))
            self.assertTrue(source.get("license"))
            self.assertTrue(source.get("license_url"))
            self.assertTrue(source.get("license_evidence_url"))
            self.assertIn(source["license"], data["policy"]["accepted_licenses"])

    def test_draft_has_multilingual_terms_safety_and_attribution(self):
        text = DRAFT_PATH.read_text(encoding="utf-8")
        for term in ("العربية", "Français", "English", "LOTO", "راجع دليل المصنع",
                     "Consult the manufacturer's manual", "https://pmc.ncbi.nlm.nih.gov/articles/PMC8747656/"):
            self.assertIn(term, text)
        self.assertRegex(text, r"(?i)confidence|confidence")
        self.assertRegex(text, r"(?i)needs review")

    def test_script_has_safe_allowlist_and_no_automatic_publication(self):
        text = SCRIPT_PATH.read_text(encoding="utf-8")
        self.assertIn("validate_source", text)
        self.assertIn("accepted_licenses", text)
        self.assertIn("review_required", text)
        self.assertIn("--validate-only", text)
        self.assertNotIn("create_pull_request(", text)

    def test_no_invented_numeric_limits_in_knowledge_draft(self):
        text = DRAFT_PATH.read_text(encoding="utf-8")
        forbidden_patterns = [
            r"\b\d+(?:\.\d+)?\s*(?:bar|psi|kPa|MPa)\b",
            r"\b\d+(?:\.\d+)?\s*(?:Nm|N·m)\b",
            r"\b\d+(?:\.\d+)?\s*(?:A|amp)\b",
        ]
        for pattern in forbidden_patterns:
            self.assertIsNone(re.search(pattern, text, re.IGNORECASE))


if __name__ == "__main__":
    unittest.main(verbosity=2)
