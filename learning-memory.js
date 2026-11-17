(function (root) {
  "use strict";

  const DB_NAME = "maintenance-ai-learning-memory";
  const DB_VERSION = 1;
  const STORE = "events";
  const MAX_EVENTS = 5000;

  function openDb() {
    return new Promise((resolve, reject) => {
      if (!root.indexedDB) return reject(new Error("IndexedDB is unavailable."));
      const request = root.indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE)) {
          const store = db.createObjectStore(STORE, { keyPath: "id" });
          store.createIndex("eventType", "eventType", { unique: false });
          store.createIndex("caseId", "caseId", { unique: false });
          store.createIndex("createdAt", "createdAt", { unique: false });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error("Could not open learning memory."));
    });
  }

  function bounded(value, max) {
    return typeof value === "string" ? value.trim().slice(0, max) : "";
  }

  function id() {
    return root.crypto && typeof root.crypto.randomUUID === "function"
      ? root.crypto.randomUUID()
      : "learn-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
  }

  async function put(event) {
    const db = await openDb();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(event);
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error || new Error("Could not store learning event."));
      tx.onabort = () => reject(tx.error || new Error("Learning event write aborted."));
    });
    const count = await new Promise((resolve, reject) => {
      const request = db.transaction(STORE, "readonly").objectStore(STORE).count();
      request.onsuccess = () => resolve(request.result || 0);
      request.onerror = () => reject(request.error);
    });
    if (count > MAX_EVENTS) {
      const all = await list();
      const remove = all.slice(0, count - MAX_EVENTS);
      await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, "readwrite");
        remove.forEach(item => tx.objectStore(STORE).delete(item.id));
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
      });
    }
    return event;
  }

  async function list() {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const request = db.transaction(STORE, "readonly").objectStore(STORE).getAll();
      request.onsuccess = () => resolve((request.result || []).sort((a, b) => a.createdAt.localeCompare(b.createdAt)));
      request.onerror = () => reject(request.error || new Error("Could not read learning memory."));
    });
  }

  async function recordDocumentIngested(input) {
    const item = input || {};
    if (!bounded(item.documentId, 120) || !bounded(item.sha256, 64)) throw new Error("Document identity and SHA-256 are required.");
    return put({
      id: id(), eventType: "document_ingested", schemaVersion: 1,
      documentId: bounded(item.documentId, 120), sha256: bounded(item.sha256, 64),
      sourceType: item.sourceType === "image" ? "image" : "pdf",
      extractionMethod: bounded(item.extractionMethod, 40),
      extractionStatus: bounded(item.extractionStatus, 60),
      pageCount: Number.isInteger(item.pageCount) ? Math.max(1, Math.min(1200, item.pageCount)) : 1,
      chunkCount: Number.isInteger(item.chunkCount) ? Math.max(0, Math.min(100000, item.chunkCount)) : 0,
      ocrLanguages: Array.isArray(item.ocrLanguages) ? item.ocrLanguages.filter(x => ["ara", "eng", "fra"].includes(x)).slice(0, 3) : [],
      reviewStatus: "unreviewed", eligibleForDiagnosis: false,
      createdAt: new Date().toISOString()
    });
  }

  async function recordDiagnostic(input) {
    const item = input || {};
    const caseId = bounded(item.caseId, 120) || id();
    const hypotheses = Array.isArray(item.hypotheses) ? item.hypotheses.slice(0, 5).map((hypothesis, index) => ({
      faultId: bounded(hypothesis && hypothesis.id, 120),
      rank: index + 1,
      scoreType: "heuristic-not-calibrated-probability"
    })).filter(h => h.faultId) : [];
    const measurementSources = Array.isArray(item.measurementSources)
      ? [...new Set(item.measurementSources.filter(x => ["direct_measurement", "plc_value", "historian_value", "estimated", "user_reported", "unknown"].includes(x)))].slice(0, 6) : [];
    const qualityWarnings = Array.isArray(item.qualityWarnings)
      ? [...new Set(item.qualityWarnings.map(x => bounded(x, 80)).filter(Boolean))].slice(0, 12) : [];
    await put({
      id: id(), eventType: "diagnostic_prediction", schemaVersion: 1, caseId,
      equipmentFamily: bounded(item.equipmentFamily, 100),
      hypothesisIds: hypotheses.map(h => h.faultId), hypotheses,
      measurementSources, qualityWarnings,
      evidenceDocumentIds: Array.isArray(item.evidenceDocumentIds) ? item.evidenceDocumentIds.map(x => bounded(x, 120)).filter(Boolean).slice(0, 10) : [],
      outcomeStatus: "unknown", createdAt: new Date().toISOString()
    });
    return { caseId };
  }

  async function recordOutcome(input) {
    const item = input || {};
    const caseId = bounded(item.caseId, 120);
    const outcome = item.outcome;
    if (!caseId) throw new Error("A diagnostic case ID is required.");
    if (!["confirmed", "not_confirmed", "inconclusive"].includes(outcome)) throw new Error("Invalid diagnostic outcome.");
    const confirmedFaultId = bounded(item.confirmedFaultId, 120);
    if (outcome === "confirmed" && !confirmedFaultId) throw new Error("A confirmed fault ID is required.");
    const evidenceSummary = bounded(item.evidenceSummary, 1000);
    if (!evidenceSummary) throw new Error("Inspection or repair evidence is required for every recorded outcome.");
    const prediction = (await list()).find(event => event.eventType === "diagnostic_prediction" && event.caseId === caseId);
    if (!prediction) throw new Error("The diagnostic prediction for this case was not found.");
    if (outcome === "confirmed" && !(prediction.hypothesisIds || []).includes(confirmedFaultId)) {
      throw new Error("The confirmed fault must match one of the recorded diagnostic hypotheses.");
    }
    return put({
      id: id(), eventType: "diagnostic_outcome", schemaVersion: 1, caseId,
      outcome, confirmedFaultId: outcome === "confirmed" ? confirmedFaultId : "",
      evidenceSummary, verificationMethod: bounded(item.verificationMethod, 80),
      contributorConfirmed: item.contributorConfirmed === true,
      createdAt: new Date().toISOString()
    });
  }

  async function getEvaluationCandidates() {
    const events = await list();
    const predictions = new Map(events.filter(x => x.eventType === "diagnostic_prediction").map(x => [x.caseId, x]));
    const outcomes = events.filter(x => x.eventType === "diagnostic_outcome" && x.contributorConfirmed === true);
    return outcomes.map(outcome => {
      const prediction = predictions.get(outcome.caseId);
      return prediction ? { caseId: outcome.caseId, equipmentFamily: prediction.equipmentFamily,
        predictedFaultIds: prediction.hypothesisIds, outcome: outcome.outcome,
        confirmedFaultId: outcome.confirmedFaultId, evidenceSummary: outcome.evidenceSummary,
        reviewStatus: "candidate-requires-technical-review" } : null;
    }).filter(Boolean);
  }

  async function removeDocument(documentId) {
    const target = bounded(documentId, 120);
    if (!target) return;
    const events = await list();
    const db = await openDb();
    const toDelete = events.filter(event => event.eventType === "document_ingested" && event.documentId === target);
    const updated = events.filter(event => event.eventType === "diagnostic_prediction" &&
      Array.isArray(event.evidenceDocumentIds) && event.evidenceDocumentIds.includes(target));
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      const store = tx.objectStore(STORE);
      toDelete.forEach(event => store.delete(event.id));
      updated.forEach(event => {
        event.evidenceDocumentIds = event.evidenceDocumentIds.filter(id => id !== target);
        store.put(event);
      });
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error || new Error("Could not remove document learning references."));
    });
  }

  async function clear() {
    const db = await openDb();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).clear();
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
  }

  root.MaintenanceLearningMemory = Object.freeze({
    version: "1.0.0",
    storage: "device-local-indexeddb",
    recordDocumentIngested,
    recordDiagnostic,
    recordOutcome,
    getEvaluationCandidates,
    removeDocument,
    list,
    clear
  });
  if (typeof module !== "undefined" && module.exports) module.exports = root.MaintenanceLearningMemory;
})(typeof globalThis !== "undefined" ? globalThis : this);
