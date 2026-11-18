const test = require("node:test");
const assert = require("node:assert/strict");

require("../document-semantic-search.js");
const semanticSearch = globalThis.MaintenanceDocumentSemanticSearch;

test("semantic index retries IndexedDB open after a transient failure", async () => {
  const previous = globalThis.indexedDB;
  let attempts = 0;
  const makeDb = () => ({
    transaction() {
      return {
        objectStore() {
          return {
            count() {
              const request = {};
              queueMicrotask(() => {
                request.result = 0;
                request.onsuccess();
              });
              return request;
            }
          };
        }
      };
    }
  });

  globalThis.indexedDB = {
    open() {
      attempts += 1;
      const request = {};
      queueMicrotask(() => {
        if (attempts === 1) {
          request.error = new Error("transient IndexedDB open failure");
          request.onerror();
        } else {
          request.result = makeDb();
          request.onsuccess();
        }
      });
      return request;
    }
  };

  try {
    await assert.rejects(semanticSearch.status(), /transient IndexedDB open failure/);
    const state = await semanticSearch.status();
    assert.equal(attempts, 2);
    assert.equal(state.vectorCount, 0);
    assert.equal(state.firstUseRequiresModelDownload, true);
  } finally {
    if (previous === undefined) delete globalThis.indexedDB;
    else globalThis.indexedDB = previous;
  }
});
