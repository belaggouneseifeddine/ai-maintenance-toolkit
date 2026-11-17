(function (root) {
  "use strict";

  const DB_NAME = "maintenance-ai-semantic-index";
  const DB_VERSION = 1;
  const MODEL_ID = "Xenova/paraphrase-multilingual-MiniLM-L12-v2";
  const MODEL_VERSION = "minilm-l12-multilingual-q8-v1";
  let dbPromise;
  let pipelinePromise;
  let extractor;

  function openDb() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      if (!root.indexedDB) return reject(new Error("IndexedDB is unavailable."));
      const request = root.indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains("vectors")) {
          const store = db.createObjectStore("vectors", { keyPath: "chunkId" });
          store.createIndex("documentId", "documentId", { unique: false });
          store.createIndex("modelVersion", "modelVersion", { unique: false });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error("Could not open semantic index."));
    });
    return dbPromise;
  }

  function loadPipeline() {
    if (extractor) return Promise.resolve(extractor);
    if (pipelinePromise) return pipelinePromise;
    pipelinePromise = import("./vendor/transformers/transformers.min.js").then(async library => {
      if (!library || typeof library.pipeline !== "function") throw new Error("Local Transformers.js bundle is unavailable.");
      if (library.env) {
        library.env.useBrowserCache = true;
        library.env.useWasmCache = true;
        library.env.allowRemoteModels = true;
        library.env.allowLocalModels = false;
        if (library.env.backends && library.env.backends.onnx && library.env.backends.onnx.wasm) {
          library.env.backends.onnx.wasm.wasmPaths = "./vendor/transformers/";
        }
      }
      extractor = await library.pipeline("feature-extraction", MODEL_ID, {
        dtype: "q8",
        revision: "2c4055b12046f11709e9df2c122e59ffbdc2f900",
        progress_callback: event => {
          if (typeof root.dispatchEvent === "function" && typeof root.CustomEvent === "function") {
            root.dispatchEvent(new root.CustomEvent("maintenance-semantic-progress", { detail: event }));
          }
        }
      });
      return extractor;
    }).catch(error => {
      pipelinePromise = null;
      extractor = null;
      throw error;
    });
    return pipelinePromise;
  }

  async function embed(text) {
    const pipe = await loadPipeline();
    const output = await pipe(String(text || "").slice(0, 1800), { pooling: "mean", normalize: true });
    const vector = output && output.data ? Array.from(output.data) : [];
    if (!vector.length || vector.some(value => !Number.isFinite(value))) throw new Error("Embedding output is invalid.");
    return vector;
  }

  function textFingerprint(value) {
    const text = String(value || "");
    let hash = 2166136261;
    for (let i = 0; i < text.length; i++) { hash ^= text.charCodeAt(i); hash = Math.imul(hash, 16777619); }
    return (hash >>> 0).toString(16).padStart(8, "0");
  }

  async function indexChunks(chunks) {
    if (!Array.isArray(chunks) || !chunks.length) return { indexed: 0, skipped: 0 };
    await loadPipeline();
    const db = await openDb();
    let indexed = 0;
    let skipped = 0;
    for (const chunk of chunks) {
      if (!chunk || !chunk.id || !chunk.documentId || !String(chunk.text || "").trim()) { skipped++; continue; }
      const fingerprint = textFingerprint(chunk.text);
      const existing = await new Promise((resolve, reject) => {
        const request = db.transaction("vectors", "readonly").objectStore("vectors").get(chunk.id);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
      if (existing && existing.modelVersion === MODEL_VERSION && existing.textFingerprint === fingerprint) { skipped++; continue; }
      const vector = await embed(chunk.text);
      await new Promise((resolve, reject) => {
        const tx = db.transaction("vectors", "readwrite");
        tx.objectStore("vectors").put({
          chunkId: chunk.id,
          documentId: chunk.documentId,
          modelVersion: MODEL_VERSION,
          textFingerprint: fingerprint,
          dimensions: vector.length,
          vector,
          embeddedAt: new Date().toISOString()
        });
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error || new Error("Could not persist semantic vector."));
        tx.onabort = () => reject(tx.error || new Error("Semantic vector write aborted."));
      });
      indexed++;
    }
    return { indexed, skipped };
  }

  function cosine(a, b) {
    if (!Array.isArray(a) || a.length !== b.length || !a.length) return -1;
    let dot = 0, aa = 0, bb = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      aa += a[i] * a[i];
      bb += b[i] * b[i];
    }
    return aa && bb ? dot / Math.sqrt(aa * bb) : -1;
  }

  async function search(query, limit) {
    if (!extractor) return [];
    const queryVector = await embed(query);
    const db = await openDb();
    const rows = await new Promise((resolve, reject) => {
      const tx = db.transaction("vectors", "readonly");
      const request = tx.objectStore("vectors").getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error || new Error("Could not read semantic vectors."));
    });
    return rows.filter(row => row.modelVersion === MODEL_VERSION && row.dimensions === queryVector.length)
      .map(row => ({ chunkId: row.chunkId, documentId: row.documentId, score: cosine(queryVector, row.vector) }))
      .filter(row => row.score >= 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, Math.max(1, Math.min(50, Number(limit) || 12)));
  }

  async function removeDocument(documentId) {
    const db = await openDb();
    await new Promise((resolve, reject) => {
      const tx = db.transaction("vectors", "readwrite");
      const request = tx.objectStore("vectors").index("documentId").openCursor(root.IDBKeyRange.only(documentId));
      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) { cursor.delete(); cursor.continue(); }
      };
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error || new Error("Could not remove semantic vectors."));
    });
  }

  async function status() {
    const db = await openDb();
    const count = await new Promise((resolve, reject) => {
      const tx = db.transaction("vectors", "readonly");
      const request = tx.objectStore("vectors").count();
      request.onsuccess = () => resolve(request.result || 0);
      request.onerror = () => reject(request.error);
    });
    return { ready: Boolean(extractor), modelId: MODEL_ID, modelVersion: MODEL_VERSION, vectorCount: count, firstUseRequiresModelDownload: !extractor };
  }

  root.MaintenanceDocumentSemanticSearch = Object.freeze({
    version: "0.1.0",
    modelId: MODEL_ID,
    enable: loadPipeline,
    isReady: () => Boolean(extractor),
    indexChunks,
    search,
    removeDocument,
    status
  });
})(typeof globalThis !== "undefined" ? globalThis : this);
