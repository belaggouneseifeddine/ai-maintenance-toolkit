import hashlib
import importlib.util
import json
import tempfile
import unittest
from pathlib import Path

MODULE_PATH = Path(__file__).with_name("extract-pdf-pages.py")
SPEC = importlib.util.spec_from_file_location("extract_pdf_pages", MODULE_PATH)
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


class PdfExtractionTests(unittest.TestCase):
    def test_page_text_is_hashed_and_page_numbered(self):
        try:
            from pypdf import PdfWriter
        except ImportError:
            self.skipTest("pypdf is installed in the extraction workflow")
        # Build a valid one-page PDF with no text; image-only/empty text is OCR-required.
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "scan.pdf"
            writer = PdfWriter()
            writer.add_blank_page(width=200, height=200)
            with path.open("wb") as output:
                writer.write(output)
            result = MODULE.extract_one(path, __import__("pypdf").PdfReader)
        self.assertEqual(result["pages"][0]["page_number"], 1)
        self.assertEqual(result["pages"][0]["extraction_status"], "ocr_required")
        self.assertEqual(result["pages"][0]["text"], "")
        self.assertFalse(result["extraction"]["ocr_performed"])

    def test_file_hash_is_sha256(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "manual.pdf"
            path.write_bytes(b"%PDF-test")
            expected = hashlib.sha256(b"%PDF-test").hexdigest()
            self.assertEqual(MODULE.sha256_file(path), expected)


if __name__ == "__main__":
    unittest.main(verbosity=2)
