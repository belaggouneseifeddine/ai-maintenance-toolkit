/* Device-local IndexedDB storage for untrusted knowledge-import staging records. */
(function (root) {
  "use strict";
  const DB_NAME = "maintenance-knowledge-staging";
  const DB_VERSION = 1;
  const IMPORTS = "imports";

  function openDatabase(indexedDBApi) {
    const api = indexedDBApi || root.indexedDB;
    if (!api) return Promise.reject(new Error("indexeddb_unavailable"));
    return new Promise((resolve, reject) => {
      const request = api.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(IMPORTS)) {
          const store = db.createObjectStore(IMPORTS, { keyPath: "importId" });
          store.createIndex("createdAt", "createdAt", { unique: false });
          store.createIndex("sourceId", "source.sourceId", { unique: false });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error("indexeddb_open_failed"));
    });
  }
  function transact(mode, operation, indexedDBApi) {
    return openDatabase(indexedDBApi).then(db => new Promise((resolve, reject) => {
      const tx = db.transaction(IMPORTS, mode);
      const store = tx.objectStore(IMPORTS);
      let result;
      try { result = operation(store); } catch (error) { db.close(); reject(error); return; }
      tx.oncomplete = () => { db.close(); resolve(result && result.result !== undefined ? result.result : result); };
      tx.onerror = () => { db.close(); reject(tx.error || new Error("indexeddb_transaction_failed")); };
      tx.onabort = () => { db.close(); reject(tx.error || new Error("indexeddb_transaction_aborted")); };
    }));
  }
  function save(batch, indexedDBApi) {
    if (!batch || batch.status !== "staged_only" || batch.runtimeEligible !== false || !batch.source) {
      return Promise.reject(new Error("only_staging_only_imports_can_be_saved"));
    }
    const record = {
      importId: String(batch.source.sourceId) + ":" + Date.now().toString(36),
      createdAt: new Date().toISOString(),
      status: "candidate",
      runtimeEligible: false,
      source: batch.source,
      format: batch.format,
      itemCount: batch.itemCount,
      items: batch.items
    };
    return transact("readwrite", store => store.add(record), indexedDBApi).then(() => record);
  }
  function list(indexedDBApi) {
    return openDatabase(indexedDBApi).then(db => new Promise((resolve, reject) => {
      const tx = db.transaction(IMPORTS, "readonly");
      const request = tx.objectStore(IMPORTS).getAll();
      request.onsuccess = () => resolve((request.result || []).sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
      request.onerror = () => reject(request.error || new Error("indexeddb_list_failed"));
      tx.oncomplete = () => db.close();
      tx.onerror = () => { db.close(); reject(tx.error || new Error("indexeddb_list_failed")); };
    }));
  }
  function remove(importId, indexedDBApi) {
    if (!importId) return Promise.reject(new Error("import_id_required"));
    return transact("readwrite", store => store.delete(importId), indexedDBApi);
  }
  const api = Object.freeze({ openDatabase, save, list, remove });
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.MaintenanceKnowledgeStagingStore = api;
})(typeof window !== "undefined" ? window : globalThis);
