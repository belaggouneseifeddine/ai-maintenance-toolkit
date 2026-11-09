#!/usr/bin/env python3
"""Validate the quarantined third-party equipment taxonomy extract."""
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EXTRACT = ROOT / "knowledge" / "open-source-candidate-extracts.json"
REGISTER = ROOT / "knowledge" / "open-knowledge-source-register.json"
WORKER = ROOT / "worker.js"


class OpenSourceCandidateExtractTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.extract = json.loads(EXTRACT.read_text(encoding="utf-8"))
        cls.register = json.loads(REGISTER.read_text(encoding="utf-8"))
        cls.worker = WORKER.read_text(encoding="utf-8")

    def test_extract_is_quarantined_from_runtime(self):
        self.assertEqual(self.extract["status"], "research-only-not-loaded-by-runtime")
        self.assertFalse(self.extract["integrationDecision"]["runtimeImport"])
        self.assertNotIn("open-source-candidate-extracts.json", self.worker)

    def test_equipment_taxonomy_is_unique_and_counts_reconcile(self):
        items = self.extract["extraction"]["equipmentTypes"]
        ids = [item["id"] for item in items]
        self.assertEqual(len(items), 9)
        self.assertEqual(len(ids), len(set(ids)))
        self.assertEqual(
            sum(item["faultRecordCount"] for item in items),
            self.extract["extraction"]["totalFaultRecords"],
        )
        self.assertEqual(self.extract["extraction"]["totalFaultRecords"], 55)

    def test_extract_contains_no_operational_fault_instructions(self):
        for item in self.extract["extraction"]["equipmentTypes"]:
            self.assertNotIn("possible_causes", item)
            self.assertNotIn("diagnosis_steps", item)
            self.assertNotIn("maintenance_actions", item)
        self.assertEqual(
            self.extract["integrationDecision"]["allowedUse"],
            "coverage-gap-analysis-and-schema-design-only",
        )

    def test_quality_warning_matches_reviewed_source_counts(self):
        quality = self.extract["qualityFindings"]
        self.assertEqual(quality["diagnosisStepsIdenticalToPossibleCauses"], 42)
        self.assertAlmostEqual(
            quality["diagnosisStepsIdenticalRatio"],
            42 / 55,
            places=4,
        )

    def test_source_is_registered_and_data_license_is_not_assumed(self):
        source_id = self.extract["source"]["id"]
        matches = [item for item in self.register["sources"] if item["id"] == source_id]
        self.assertEqual(len(matches), 1)
        self.assertIn("no separate data license", matches[0]["licenseStatus"])
        self.assertIn("no-fault-text-import", matches[0]["decision"])


if __name__ == "__main__":
    unittest.main()
