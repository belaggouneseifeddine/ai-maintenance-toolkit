#!/usr/bin/env bash
set -euo pipefail

OUT_DIR="${1:-_site}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

mkdir -p "$OUT_DIR/vendor/pdfjs" "$OUT_DIR/vendor/tesseract/core" "$OUT_DIR/vendor/tessdata" "$OUT_DIR/vendor/transformers"

npm install --prefix "$TMP_DIR" --no-save --no-audit --no-fund \
  "pdfjs-dist@4.10.38" "tesseract.js@5.1.1" "tesseract.js-core@5.1.1" "@huggingface/transformers@3.8.1"

cp -R "$TMP_DIR/node_modules/@huggingface/transformers/dist/." "$OUT_DIR/vendor/transformers/"
cp "$TMP_DIR/node_modules/pdfjs-dist/build/pdf.min.mjs" "$OUT_DIR/vendor/pdfjs/"
cp "$TMP_DIR/node_modules/pdfjs-dist/build/pdf.worker.min.mjs" "$OUT_DIR/vendor/pdfjs/"
cp "$TMP_DIR/node_modules/tesseract.js/dist/tesseract.min.js" "$OUT_DIR/vendor/tesseract/"
cp "$TMP_DIR/node_modules/tesseract.js/dist/worker.min.js" "$OUT_DIR/vendor/tesseract/"
cp "$TMP_DIR"/node_modules/tesseract.js-core/tesseract-core-simd-lstm.wasm.js "$OUT_DIR/vendor/tesseract/core/"
cp "$TMP_DIR"/node_modules/tesseract.js-core/tesseract-core-simd-lstm.wasm "$OUT_DIR/vendor/tesseract/core/"

for language in ara eng fra; do
  curl --fail --location --silent --show-error \
    "https://raw.githubusercontent.com/tesseract-ocr/tessdata_fast/main/${language}.traineddata" \
    -o "$TMP_DIR/${language}.traineddata"
  gzip -9 -c "$TMP_DIR/${language}.traineddata" > "$OUT_DIR/vendor/tessdata/${language}.traineddata.gz"
done

test -s "$OUT_DIR/vendor/transformers/transformers.min.js"
test -s "$OUT_DIR/vendor/pdfjs/pdf.min.mjs"
test -s "$OUT_DIR/vendor/pdfjs/pdf.worker.min.mjs"
test -s "$OUT_DIR/vendor/tesseract/tesseract.min.js"
test -s "$OUT_DIR/vendor/tesseract/worker.min.js"
test -s "$OUT_DIR/vendor/tesseract/core/tesseract-core-simd-lstm.wasm.js"
test -s "$OUT_DIR/vendor/tesseract/core/tesseract-core-simd-lstm.wasm"
for language in ara eng fra; do test -s "$OUT_DIR/vendor/tessdata/${language}.traineddata.gz"; done

cat > "$OUT_DIR/vendor/THIRD-PARTY-NOTICES.txt" <<'NOTICE'
Transformers.js 3.8.1: Apache-2.0. See https://github.com/huggingface/transformers.js
Model Xenova/paraphrase-multilingual-MiniLM-L12-v2: Apache-2.0 model family; quantized ONNX weights downloaded on explicit user activation from Hugging Face. See https://huggingface.co/Xenova/paraphrase-multilingual-MiniLM-L12-v2
PDF.js 4.10.38: Apache-2.0. See https://github.com/mozilla/pdf.js
Tesseract.js 5.1.1: Apache-2.0. See https://github.com/naptha/tesseract.js
Tesseract.js-core 5.1.1: Apache-2.0. See https://github.com/naptha/tesseract.js
Tesseract tessdata_fast language data (ara, eng, fra): Apache-2.0. See https://github.com/tesseract-ocr/tessdata_fast
Versions are pinned in scripts/vendor-document-runtime.sh. Preserve these notices with the distributed assets.
NOTICE

echo "Vendored offline document runtime into $OUT_DIR/vendor"
