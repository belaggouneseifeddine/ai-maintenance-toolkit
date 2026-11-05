import hashlib
import importlib.util
import tempfile
import unittest
from pathlib import Path

MODULE_PATH = Path(__file__).with_name("extract-pdf-pages.py")
SPEC = importlib.util.spec_from_file_location("extract_pdf_pages", MODULE_PATH)
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


def make_text_pdf(text: str) -> bytes:
    stream = f"BT /F1 12 Tf 20 200 Td ({text}) Tj ET".encode("ascii")
    objects = [
        b"<< /Type /Catalog /Pages 2 0 R >>",
        b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        b"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 300] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
        b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
        b"<< /Length " + str(len(stream)).encode() + b" >>\nstream\n" + stream + b"\nendstream",
    ]
    output = bytearray(b"%PDF-1.4\n")
    offsets = [0]
    for index, body in enumerate(objects, start=1):
        offsets.append(len(output))
        output.extend(f"{index} 0 obj\n".encode("ascii") + body + b"\nendobj\n")
    xref_offset = len(output)
    output.extend(b"xref\n0 6\n0000000000 65535 f \n")
    for offset in offsets[1:]:
        output.extend(f"{offset:010d} 00000 n \n".encode("ascii"))
    output.extend(
        b"trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n"
        + str(xref_offset).encode("ascii") + b"\n%%EOF\n"
    )
    return bytes(output)


class PdfExtractionTests(unittest.TestCase):
    def test_text_is_extracted_and_page_numbered(self):
        try:
            from pypdf import PdfReader
        except ImportError:
            self.skipTest("pypdf is installed in the extraction workflow")
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "manual.pdf"
            path.write_bytes(make_text_pdf("Pump pressure low"))
            result = MODULE.extract_one(path, PdfReader)
        page = result["pages"][0]
        self.assertEqual(page["page_number"], 1)
        self.assertIn("Pump pressure low", page["text"])
        self.assertEqual(page["text_sha256"], hashlib.sha256(page["text"].encode()).hexdigest())
        self.assertEqual(page["extraction_status"], "text_extracted_review_required")
        self.assertEqual(page["table_extraction_status"], "manual_review_required")
        self.assertFalse(result["extraction"]["ocr_performed"])

    def test_blank_page_is_marked_ocr_required(self):
        try:
            from pypdf import PdfWriter, PdfReader
        except ImportError:
            self.skipTest("pypdf is installed in the extraction workflow")
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "scan.pdf"
            writer = PdfWriter()
            writer.add_blank_page(width=200, height=200)
            with path.open("wb") as output:
                writer.write(output)
            result = MODULE.extract_one(path, PdfReader)
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
