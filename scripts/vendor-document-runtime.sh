#!/usr/bin/env bash
set -euo pipefail

OUT_DIR="${1:-_site}"
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

mkdir -p "$OUT_DIR/vendor/pdfjs" "$OUT_DIR/vendor/tesseract/core" "$OUT_DIR/vendor/tessdata" "$OUT_DIR/vendor/licenses"

NPM_PACKAGES=("pdfjs-dist@4.10.38" "tesseract.js@5.1.1" "tesseract.js-core@5.1.1")
if [[ "${MAINTENANCE_SKIP_EMBEDDINGS:-0}" != "1" ]]; then
  mkdir -p "$OUT_DIR/vendor/transformers"
  NPM_PACKAGES+=("@huggingface/transformers@3.8.1")
fi
npm install --prefix "$TMP_DIR" --no-save --no-audit --no-fund --ignore-scripts "${NPM_PACKAGES[@]}"

if [[ "${MAINTENANCE_SKIP_EMBEDDINGS:-0}" != "1" ]]; then
  cp -R "$TMP_DIR/node_modules/@huggingface/transformers/dist/." "$OUT_DIR/vendor/transformers/"
  cp "$TMP_DIR/node_modules/@huggingface/transformers/LICENSE" "$OUT_DIR/vendor/licenses/transformers-LICENSE"
fi
cp "$TMP_DIR/node_modules/pdfjs-dist/build/pdf.min.mjs" "$OUT_DIR/vendor/pdfjs/"
cp "$TMP_DIR/node_modules/pdfjs-dist/build/pdf.worker.min.mjs" "$OUT_DIR/vendor/pdfjs/"
cp "$TMP_DIR/node_modules/pdfjs-dist/LICENSE" "$OUT_DIR/vendor/licenses/pdfjs-LICENSE"
cp "$TMP_DIR/node_modules/tesseract.js/dist/tesseract.min.js" "$OUT_DIR/vendor/tesseract/"
cp "$TMP_DIR/node_modules/tesseract.js/dist/worker.min.js" "$OUT_DIR/vendor/tesseract/"
curl --fail --location --silent --show-error "https://raw.githubusercontent.com/naptha/tesseract.js/v5.1.1/LICENSE.md" -o "$OUT_DIR/vendor/licenses/tesseract-js-LICENSE"
cp "$TMP_DIR/node_modules/tesseract.js-core/LICENSE" "$OUT_DIR/vendor/licenses/tesseract-core-LICENSE"
cp "$TMP_DIR"/node_modules/tesseract.js-core/tesseract-core*.js "$OUT_DIR/vendor/tesseract/core/"
cp "$TMP_DIR"/node_modules/tesseract.js-core/tesseract-core*.wasm "$OUT_DIR/vendor/tesseract/core/"

for language in ara eng fra; do
  curl --fail --location --silent --show-error \
    "https://raw.githubusercontent.com/tesseract-ocr/tessdata_fast/87416418657359cb625c412a48b6e1d6d41c29bd/${language}.traineddata" \
    -o "$TMP_DIR/${language}.traineddata"
  gzip -9 -c "$TMP_DIR/${language}.traineddata" > "$OUT_DIR/vendor/tessdata/${language}.traineddata.gz"
done
curl --fail --location --silent --show-error "https://raw.githubusercontent.com/tesseract-ocr/tessdata_fast/87416418657359cb625c412a48b6e1d6d41c29bd/LICENSE" -o "$OUT_DIR/vendor/licenses/tessdata-fast-LICENSE"

test -s "$OUT_DIR/vendor/licenses/pdfjs-LICENSE"
test -s "$OUT_DIR/vendor/licenses/tesseract-js-LICENSE"
test -s "$OUT_DIR/vendor/licenses/tesseract-core-LICENSE"
test -s "$OUT_DIR/vendor/licenses/tessdata-fast-LICENSE"
test -s "$OUT_DIR/vendor/pdfjs/pdf.min.mjs"
test -s "$OUT_DIR/vendor/pdfjs/pdf.worker.min.mjs"
test -s "$OUT_DIR/vendor/tesseract/tesseract.min.js"
test -s "$OUT_DIR/vendor/tesseract/worker.min.js"
for core in tesseract-core tesseract-core-simd tesseract-core-lstm tesseract-core-simd-lstm; do
  test -s "$OUT_DIR/vendor/tesseract/core/${core}.wasm.js"
  test -s "$OUT_DIR/vendor/tesseract/core/${core}.wasm"
done
for language in ara eng fra; do test -s "$OUT_DIR/vendor/tessdata/${language}.traineddata.gz"; done

cat > "$OUT_DIR/vendor/THIRD-PARTY-NOTICES.txt" <<'NOTICE'
PDF.js 4.10.38: Apache-2.0. See https://github.com/mozilla/pdf.js
Tesseract.js 5.1.1: Apache-2.0. See https://github.com/naptha/tesseract.js
Tesseract.js-core 5.1.1: Apache-2.0. See https://github.com/naptha/tesseract.js
Tesseract tessdata_fast language data (ara, eng, fra): Apache-2.0. See https://github.com/tesseract-ocr/tessdata_fast
License texts for bundled packages and language data are copied into vendor/licenses/. Versions are pinned in scripts/vendor-document-runtime.sh. Preserve these notices and license texts with the distributed assets.
NOTICE

if [[ "${MAINTENANCE_SKIP_EMBEDDINGS:-0}" != "1" ]]; then
  printf '%s\n' "Transformers.js 3.8.1: Apache-2.0. See https://github.com/huggingface/transformers.js" >> "$OUT_DIR/vendor/THIRD-PARTY-NOTICES.txt"
  printf '%s\n' "Base model sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2: Apache-2.0. The Xenova ONNX export repository does not show a separately verified license notice in this audit; weights are not bundled or redistributed and are fetched only after user activation. Verify export terms before redistribution. See https://huggingface.co/Xenova/paraphrase-multilingual-MiniLM-L12-v2" >> "$OUT_DIR/vendor/THIRD-PARTY-NOTICES.txt"
  test -s "$OUT_DIR/vendor/licenses/transformers-LICENSE"
  test -s "$OUT_DIR/vendor/transformers/transformers.min.js"
fi

echo "Vendored offline document runtime into $OUT_DIR/vendor"
