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

    def test_source_fetcher_supports_documented_europe_pmc_xml_endpoints(self):
        registry = json.loads(REGISTRY_PATH.read_text(encoding="utf-8"))
        source_urls = {source["url"] for source in registry["sources"]}
        self.assertIn("https://www.ebi.ac.uk/europepmc/webservices/rest/PMC8234243/fullTextXML", source_urls)
        self.assertIn("https://www.ebi.ac.uk/europepmc/webservices/rest/PMC8747656/fullTextXML", source_urls)
        fetcher = SCRIPT_PATH.read_text(encoding="utf-8")
        self.assertIn('"Accept": "application/xml, text/xml, application/xhtml+xml, text/html;q=0.9"', fetcher)
        self.assertNotIn('application/xhtml+xml, text/html;q=0.9, */*', fetcher)
        self.assertIn('urlparse(final_url).scheme != "https"', fetcher)
        self.assertIn('if content_type not in {', fetcher)
        self.assertIn('if len(text) < 300:', fetcher)
        self.assertIn('"application/xml", "text/xml"', fetcher)

    def test_reference_only_books_have_indexes_and_are_not_fetchable(self):
        registry = json.loads(REGISTRY_PATH.read_text(encoding="utf-8"))
        books = registry.get("reference_only_books", [])
        self.assertGreaterEqual(len(books), 2)
        ids = set()
        for book in books:
            self.assertNotIn(book["id"], ids, "duplicate reference-only book id")
            ids.add(book["id"])
            self.assertFalse(book.get("fetch_allowed", False))
            self.assertEqual(book.get("reuse_status"), "reference_only_no_open_license_recorded")
            index_path = ROOT / book["repository_index"]
            self.assertTrue(index_path.is_file(), f"missing reference index: {index_path}")
            index_text = index_path.read_text(encoding="utf-8")
            self.assertIn("not an oem", index_text.lower())
            self.assertIn("printed page numbers", index_text.lower())
        bolton = next(book for book in books if book["id"] == "automates-programmables-industriels-bolton-2015")
        self.assertEqual(bolton["french_isbn"], "978-2-10-074219-6")
        self.assertEqual(bolton["page_count"], 440)

    def test_supplemental_faults_have_registered_sources_and_no_model_verified_claims(self):
        supplement = json.loads((ROOT / "knowledge" / "faults-supplement.json").read_text(encoding="utf-8"))
        manufacturer_sources = json.loads((ROOT / "knowledge" / "manufacturer-sources.json").read_text(encoding="utf-8"))
        source_ids = {source["id"] for source in manufacturer_sources.get("sources", [])}
        faults = supplement.get("faults", [])
        self.assertEqual(len(faults), 3)
        self.assertEqual({fault["id"] for fault in faults}, {
            "supplement-motor-overheat-general",
            "supplement-compressor-overheat-general",
            "supplement-bearing-vibration-general",
        })
        for fault in faults:
            self.assertEqual(fault.get("evidenceStatus"), "source-informed-general-reference-not-model-verified")
            self.assertTrue(fault.get("sourceRefs"), fault["id"] + " missing source references")
            self.assertTrue(set(fault["sourceRefs"]).issubset(source_ids), fault["id"] + " has an unregistered source reference")
            self.assertFalse(fault.get("modelSpecificEvidence"), fault["id"] + " must not claim model-specific evidence")

    def test_general_faults_do_not_cite_family_only_manuals(self):
        supplement = json.loads((ROOT / "knowledge" / "faults-supplement.json").read_text(encoding="utf-8"))
        manufacturer_sources = json.loads((ROOT / "knowledge" / "manufacturer-sources.json").read_text(encoding="utf-8"))
        source_by_id = {source["id"]: source for source in manufacturer_sources.get("sources", [])}
        for fault in supplement.get("faults", []):
            if fault.get("evidenceStatus") != "source-informed-general-reference-not-model-verified":
                continue
            for source_id in fault.get("sourceRefs", []):
                source = source_by_id[source_id]
                scope = source.get("scope", "").lower()
                self.assertFalse(
                    source.get("type") == "manufacturer-manual" and ("only" in scope or "family" in scope),
                    f"{fault['id']} is general but cites family-scoped manual {source_id}",
                )

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
