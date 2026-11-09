"""Validate candidate benchmark manifests without network access."""
import importlib.util
import json
import unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location("benchmark_downloader", ROOT/"scripts"/"download-maintenance-benchmarks.py")
downloader=importlib.util.module_from_spec(spec)
spec.loader.exec_module(downloader)
class BenchmarkManifestTests(unittest.TestCase):
 def load(self,name): return json.loads((ROOT/"knowledge/candidates/benchmarks"/name).read_text(encoding="utf-8"))
 def test_uci(self):
  x=self.load("uci-hydraulic-447.json"); self.assertEqual(x["source"]["license"],"CC-BY-4.0"); self.assertEqual(x["scope"]["cycles"],2205); self.assertFalse(x["runtimeImport"]); self.assertTrue(any("group-aware" in s for s in x["limitations"]))
 def test_urma(self):
  x=self.load("urma-crti-2026.json"); self.assertIsNone(x["source"]["license"]); self.assertEqual(x["source"]["licenseClaim"],"CC-BY-4.0"); self.assertEqual(x["source"]["licenseStatus"],"pending-primary-source-verification"); self.assertEqual(x["scope"]["recordings"],23); self.assertEqual(x["scope"]["samplingHz"],25600); self.assertEqual(x["scope"]["expectedSha256"],"e0e976d1298dfdab98d6935b789b4483b47c357469fc4643a14bda70095e88d2"); self.assertFalse(x["download"]["allowed"]); self.assertTrue(x["download"]["requiresPrimaryLicenseVerification"]); self.assertFalse(x["runtimeImport"]); self.assertTrue(any("unit" in s.lower() for s in x["caveats"]))
 def test_urma_downloader_fails_closed_on_missing_or_incompatible_primary_license(self):
  self.assertEqual(downloader.verify_zenodo_license({"metadata":{"license":{"id":"cc-by-4.0"}}}),"CC-BY-4.0")
  self.assertEqual(downloader.verify_zenodo_license({"metadata":{"license":"CC BY 4.0"}}),"CC-BY-4.0")
  for record in ({"metadata":{}},{"metadata":{"license":{"id":"cc-by-nc-4.0"}}},{"metadata":{"license":{"id":"cc-by"}}}):
   with self.assertRaises(ValueError): downloader.verify_zenodo_license(record)
 def test_unlicensed_industrial_ops_content_is_not_stored(self):
  candidate=ROOT/"knowledge/candidates/industrial-ops-rag-agent"
  self.assertFalse((candidate/"knowledge_base.json").exists())
  self.assertFalse((candidate/"pump-candidate-extract.json").exists())
  register=json.loads((ROOT/"knowledge/open-knowledge-source-register.json").read_text(encoding="utf-8"))
  source=next(x for x in register["sources"] if x["id"]=="industrial-ops-rag-agent-snapshot")
  self.assertEqual(source["dataLicense"],"not-declared-separately")
  self.assertIn("no-fault-text-import",source["decision"])
if __name__=="__main__": unittest.main()
