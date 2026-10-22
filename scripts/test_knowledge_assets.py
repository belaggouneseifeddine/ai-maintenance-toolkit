#!/usr/bin/env python3
"""Offline integrity tests for the multilingual maintenance knowledge pack."""
import json
import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REGISTRY_PATH = ROOT / "knowledge" / "sources.json"
PUMP_DRAFT = ROOT / "knowledge" / "CENTRIFUGAL-PUMP-TROUBLESHOOTING-DRAFT.md"
EQUIPMENT_PACK = ROOT / "knowledge" / "EQUIPMENT-TROUBLESHOOTING-AR-FR-EN.md"
UNIVERSAL_ATLAS = ROOT / "knowledge" / "UNIVERSAL-INDUSTRIAL-FAULT-ATLAS-AR-FR-EN.md"
SCRIPT_PATH = ROOT / "scripts" / "fetch_licensed_sources.py"


class KnowledgeAssetsTests(unittest.TestCase):
    def test_registry_has_unique_explicitly_licensed_candidates(self):
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
            self.assertTrue(source.get("equipment"))

    def test_pump_draft_has_multilingual_terms_safety_and_attribution(self):
        text = PUMP_DRAFT.read_text(encoding="utf-8")
        for term in ("العربية", "Français", "English", "LOTO", "راجع دليل المصنع",
                     "Consult the manufacturer's manual", "https://pmc.ncbi.nlm.nih.gov/articles/PMC8747656/"):
            self.assertIn(term, text)
        self.assertIn("needs review", text.lower())

    def test_required_equipment_families_have_sections_and_trilingual_terms(self):
        text = EQUIPMENT_PACK.read_text(encoding="utf-8")
        for section in ("Water and centrifugal pumps", "Valves, check valves and actuators",
                        "Hydraulic systems", "Pneumatic systems",
                        "SCADA, HMI, PLC, sensors and drives", "Air compressors"):
            self.assertIn(section, text)
        for term in ("العربية", "Français", "English", "LOTO",
                     "hydraulic injection", "راجع دليل المصنع",
                     "Consult the manufacturer's manual", "OEM verification"):
            self.assertIn(term, text)

    def test_universal_fault_atlas_covers_cross_domain_diagnostics(self):
        text = UNIVERSAL_ATLAS.read_text(encoding="utf-8")
        for term in ("Electrical power and motors", "Electronics, sensors and instrumentation",
                     "PLC, HMI, SCADA, drives and communications", "Hydraulics",
                     "Pneumatics and compressed air", "Mechanical transmission",
                     "Pumps, fans and compressors", "Cross-domain symptom matrix",
                     "Observed:", "Source-backed:", "Hypothesis:", "Unknown:",
                     "Confirmed cause:", "lockout/tagout", "https://github.com/"):
            self.assertIn(term, text)
        self.assertIn("not a manufacturer service manual", text.lower())
        self.assertIn("Never invent source IDs", text)

    def test_no_numeric_limits_are_invented(self):
        for path in (PUMP_DRAFT, EQUIPMENT_PACK):
            text = path.read_text(encoding="utf-8")
            for pattern in (r"\b\d+(?:\.\d+)?\s*(?:bar|psi|kPa|MPa)\b",
                            r"\b\d+(?:\.\d+)?\s*(?:Nm|N·m)\b",
                            r"\b\d+(?:\.\d+)?\s*(?:A|amp)\b"):
                self.assertIsNone(re.search(pattern, text, re.IGNORECASE), f"{path}: {pattern}")
            self.assertIn("needs review", text.lower())

    def test_fetcher_is_allowlisted_and_review_only(self):
        text = SCRIPT_PATH.read_text(encoding="utf-8")
        for term in ("validate_source", "accepted_licenses", "review_required", "--validate-only"):
            self.assertIn(term, text)
        self.assertNotIn("create_pull_request(", text)


if __name__ == "__main__":
    unittest.main(verbosity=2)
