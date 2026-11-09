"""Validate candidate benchmark manifests without network access."""
import json
import unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
class BenchmarkManifestTests(unittest.TestCase):
 def load(self,name): return json.loads((ROOT/"knowledge/candidates/benchmarks"/name).read_text(encoding="utf-8"))
 def test_uci(self):
  x=self.load("uci-hydraulic-447.json"); self.assertEqual(x["source"]["license"],"CC-BY-4.0"); self.assertEqual(x["scope"]["cycles"],2205); self.assertFalse(x["runtimeImport"]); self.assertTrue(any("group-aware" in s for s in x["limitations"]))
 def test_urma(self):
  x=self.load("urma-crti-2026.json"); self.assertEqual(x["source"]["license"],"CC-BY-4.0"); self.assertEqual(x["scope"]["recordings"],23); self.assertEqual(x["scope"]["samplingHz"],25600); self.assertEqual(x["scope"]["expectedSha256"],"e0e976d1298dfdab98d6935b789b4483b47c357469fc4643a14bda70095e88d2"); self.assertFalse(x["runtimeImport"]); self.assertTrue(any("unit" in s.lower() for s in x["caveats"]))
 def test_pump_extract(self):
  x=json.loads((ROOT/"knowledge/candidates/industrial-ops-rag-agent/pump-candidate-extract.json").read_text(encoding="utf-8")); self.assertEqual(x["status"],"candidate-quarantine-not-runtime"); self.assertEqual(x["extractedRecordCount"],9); self.assertTrue(all(c["qualityReview"]["status"]=="candidate-unverified" for c in x["candidates"])); self.assertFalse(any(c["maintenanceActionsImported"] for c in x["candidates"]))
if __name__=="__main__": unittest.main()
