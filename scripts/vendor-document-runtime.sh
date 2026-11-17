#!/usr/bin/env bash
set -euo pipefail

OUT_DIR="${1:-_site}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

mkdir -p "$OUT_DIR/vendor/pdfjs" "$OUT_DIR/vendor/tesseract/core" "$OUT_DIR/vendor/tessdata" "$OUT_DIR/vendor/transformers" "$OUT_DIR/vendor/licenses"

npm install --prefix "$TMP_DIR" --no-save --no-audit --no-fund \
  "pdfjs-dist@4.10.38" "tesseract.js@5.1.1" "tesseract.js-core@5.1.1" "@huggingface/transformers@3.8.1"

cp -R "$TMP_DIR/node_modules/@huggingface/transformers/dist/." "$OUT_DIR/vendor/transformers/"
cp "$TMP_DIR/node_modules/@huggingface/transformers/LICENSE" "$OUT_DIR/vendor/licenses/transformers-LICENSE"
cp "$TMP_DIR/node_modules/pdfjs-dist/build/pdf.min.mjs" "$OUT_DIR/vendor/pdfjs/"
cp "$TMP_DIR/node_modules/pdfjs-dist/build/pdf.worker.min.mjs" "$OUT_DIR/vendor/pdfjs/"
cp "$TMP_DIR/node_modules/pdfjs-dist/LICENSE" "$OUT_DIR/vendor/licenses/pdfjs-LICENSE"
cp "$TMP_DIR/node_modules/tesseract.js/dist/tesseract.min.js" "$OUT_DIR/vendor/tesseract/"
cp "$TMP_DIR/node_modules/tesseract.js/dist/worker.min.js" "$OUT_DIR/vendor/tesseract/"
cp "$TMP_DIR/node_modules/tesseract.js/LICENSE" "$OUT_DIR/vendor/licenses/tesseract-js-LICENSE"
cp "$TMP_DIR/node_modules/tesseract.js-core/LICENSE" "$OUT_DIR/vendor/licenses/tesseract-core-LICENSE"
cp "$TMP_DIR"/node_modules/tesseract.js-core/tesseract-core*.js "$OUT_DIR/vendor/tesseract/core/"
cp "$TMP_DIR"/node_modules/tesseract.js-core/tesseract-core*.wasm "$OUT_DIR/vendor/tesseract/core/"

for language in ara eng fra; do
  curl --fail --location --silent --show-error \
    "https://raw.githubusercontent.com/tesseract-ocr/tessdata_fast/main/${language}.traineddata" \
    -o "$TMP_DIR/${language}.traineddata"
  gzip -9 -c "$TMP_DIR/${language}.traineddata" > "$OUT_DIR/vendor/tessdata/${language}.traineddata.gz"
done
curl --fail --location --silent --show-error "https://raw.githubusercontent.com/tesseract-ocr/tessdata_fast/main/LICENSE" -o "$OUT_DIR/vendor/licenses/tessdata-fast-LICENSE"

test -s "$OUT_DIR/vendor/licenses/transformers-LICENSE"
test -s "$OUT_DIR/vendor/licenses/pdfjs-LICENSE"
test -s "$OUT_DIR/vendor/licenses/tesseract-js-LICENSE"
test -s "$OUT_DIR/vendor/licenses/tesseract-core-LICENSE"
test -s "$OUT_DIR/vendor/licenses/tessdata-fast-LICENSE"
test -s "$OUT_DIR/vendor/transformers/transformers.min.js"
test -s "$OUT_DIR/vendor/pdfjs/pdf.min.mjs"
test -s "$OUT_DIR/vendor/pdfjs/pdf.worker.min.mjs"
test -s "$OUT_DIR/vendor/tesseract/tesseract.min.js"
test -s "$OUT_DIR/vendor/tesseract/worker.min.js"
for core in wasm simd lstm simd-lstm; do
  test -s "$OUT_DIR/vendor/tesseract/core/tesseract-core-${core}.wasm.js"
  test -s "$OUT_DIR/vendor/tesseract/core/tesseract-core-${core}.wasm"
done
for language in ara eng fra; do test -s "$OUT_DIR/vendor/tessdata/${language}.traineddata.gz"; done

cat > "$OUT_DIR/vendor/THIRD-PARTY-NOTICES.txt" <<'NOTICE'
Transformers.js 3.8.1: Apache-2.0. See https://github.com/huggingface/transformers.js
Base model sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2: Apache-2.0. The Xenova ONNX export repository does not show a separately verified license notice in this audit; weights are not bundled or redistributed and are fetched only after user activation. Verify export terms before redistribution. See https://huggingface.co/Xenova/paraphrase-multilingual-MiniLM-L12-v2
PDF.js 4.10.38: Apache-2.0. See https://github.com/mozilla/pdf.js
Tesseract.js 5.1.1: Apache-2.0. See https://github.com/naptha/tesseract.js
Tesseract.js-core 5.1.1: Apache-2.0. See https://github.com/naptha/tesseract.js
Tesseract tessdata_fast language data (ara, eng, fra): Apache-2.0. See https://github.com/tesseract-ocr/tessdata_fast
License texts for bundled packages and language data are copied into vendor/licenses/. Versions are pinned in scripts/vendor-document-runtime.sh. Preserve these notices and license texts with the distributed assets.
NOTICE

echo "Vendored offline document runtime into $OUT_DIR/vendor"
