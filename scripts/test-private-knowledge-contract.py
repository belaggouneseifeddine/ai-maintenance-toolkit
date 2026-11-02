#!/usr/bin/env python3
"""Stdlib contract tests for the public schema/policy; no private source content."""
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCHEMA_PATH = ROOT / "knowledge" / "schemas" / "private-knowledge-entry.schema.json"
DOC_PATH = ROOT / "docs" / "PRIVATE-KNOWLEDGE-ADAPTER.md"


class PrivateKnowledgeContractTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.schema = json.loads(SCHEMA_PATH.read_text(encoding="utf-8"))
        cls.doc = DOC_PATH.read_text(encoding="utf-8")

    def test_schema_has_closed_record_shape(self):
        self.assertEqual(self.schema["type"], "object")
        self.assertFalse(self.schema["additionalProperties"])
        self.assertIn("source", self.schema["required"])
        self.assertIn("applicability", self.schema["required"])
        self.assertIn("safety", self.schema["required"])
        self.assertIn("publication", self.schema["required"])

    def test_evidence_classes_are_explicit(self):
        self.assertEqual(
            self.schema["properties"]["evidence_type"]["enum"],
            ["SOURCE", "INFERENCE", "OEM_REQUIRED"],
        )

    def test_oem_required_cannot_be_diagnostic_eligible(self):
        rule = self.schema["allOf"][0]["then"]["properties"]["publication"]["properties"]
        self.assertEqual(rule["diagnostic_eligible"]["const"], False)

    def test_example_only_cannot_be_diagnostic_eligible(self):
        rule = self.schema["allOf"][1]["then"]["properties"]["publication"]["properties"]
        self.assertEqual(rule["diagnostic_eligible"]["const"], False)

    def test_unclear_or_private_rights_force_private_visibility(self):
        rule = self.schema["allOf"][2]["then"]["properties"]["publication"]["properties"]
        self.assertEqual(rule["visibility"]["const"], "private")

    def test_policy_prohibits_publishing_extracted_private_source_content(self):
        self.assertIn("Do not commit PDFs", self.doc)
        self.assertIn("private storage", self.doc)
        self.assertIn("community review is not", self.doc.lower())

    def test_safety_prohibitions_are_documented(self):
        for phrase in ("emergency stops", "forced I/O", "LOTO"):
            self.assertIn(phrase, self.doc)

if __name__ == "__main__":
    unittest.main(verbosity=2)
