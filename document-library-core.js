(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.MaintenanceDocumentCore = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const STOP_WORDS = new Set([
    "the","and","for","with","from","that","this","into","when","what","where","which","are","was","were","have","has","had","not","but","can","could","should",
    "le","la","les","des","du","de","un","une","et","ou","pour","dans","sur","avec","est","sont","pas","par","que","qui","aux",
    "من","في","على","إلى","الى","عن","هذا","هذه","ذلك","التي","الذي","مع","هو","هي","كان","كانت","تم","لا","ما","أو","و","ثم","عند","بعد","قبل","بين"
  ]);

  function normalizeText(value) {
    return String(value == null ? "" : value)
      .normalize("NFKC")
      .replace(/[\u064B-\u065F\u0670\u0640]/g, "")
      .replace(/[\u200B-\u200F\uFEFF]/g, "")
      .toLocaleLowerCase();
  }

  function tokenize(value) {
    return normalizeText(value).match(/[\p{L}\p{N}][\p{L}\p{N}_-]*/gu)
      ?.filter(token => token.length > 1 && !STOP_WORDS.has(token)) || [];
  }

  function chunkPage(text, options) {
    const settings = Object.assign({ maxChars: 1050, overlap: 140 }, options || {});
    const source = String(text || "").replace(/\r/g, "").replace(/[ \t]+\n/g, "\n").trim();
    if (!source) return [];
    const chunks = [];
    let start = 0;
    while (start < source.length) {
      let end = Math.min(source.length, start + settings.maxChars);
      if (end < source.length) {
        const boundary = Math.max(
          source.lastIndexOf("\n", end),
          source.lastIndexOf(". ", end),
          source.lastIndexOf("。", end),
          source.lastIndexOf("؛", end),
          source.lastIndexOf("; ", end)
        );
        if (boundary > start + Math.floor(settings.maxChars * 0.55)) end = boundary + 1;
      }
      const value = source.slice(start, end).trim();
      if (value) chunks.push({ text: value, start, end, tokens: tokenize(value) });
      if (end >= source.length) break;
      start = Math.max(start + 1, end - settings.overlap);
    }
    return chunks;
  }

  function buildPostings(chunks) {
    const postings = new Map();
    for (const chunk of chunks || []) {
      const counts = new Set(chunk.tokens || tokenize(chunk.text));
      for (const token of counts) {
        if (!postings.has(token)) postings.set(token, []);
        postings.get(token).push(chunk.id);
      }
    }
    return postings;
  }

  function rankChunks(query, chunks, limit) {
    const queryTokens = [...new Set(tokenize(query))];
    if (!queryTokens.length) return [];
    const docs = chunks || [];
    const df = new Map(queryTokens.map(term => [term, docs.filter(doc => (doc.tokens || tokenize(doc.text)).includes(term)).length]));
    const scored = docs.map(doc => {
      const tokens = doc.tokens || tokenize(doc.text);
      const counts = new Map();
      tokens.forEach(token => counts.set(token, (counts.get(token) || 0) + 1));
      let score = 0;
      let matched = 0;
      for (const term of queryTokens) {
        const tf = counts.get(term) || 0;
        if (tf) {
          matched++;
          score += (1 + Math.log(tf)) * (1 + Math.log((docs.length + 1) / ((df.get(term) || 0) + 1)));
        }
      }
      if (matched) {
        const normalized = normalizeText(doc.text);
        if (normalized.includes(normalizeText(query).trim())) score += 3;
        score *= 0.7 + 0.3 * matched / queryTokens.length;
      }
      return { doc, score, matched };
    }).filter(item => item.score > 0);
    scored.sort((a, b) => b.score - a.score || (a.doc.pageNumber || 0) - (b.doc.pageNumber || 0));
    return scored.slice(0, Math.max(1, limit || 12));
  }

  function canonicalEquipmentFamily(value) {
    const text = normalizeText(value)
      .replace(/[._-]+/g, " ")
      .replace(/[()[\],]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (!text) return "";
    const patterns = [
      ["centrifugal_pump", /centrifugal\s+pumps?|pompe[s]?\s+centrifuge(?:e|es)?|مضخ(?:ة|ات)\s+طرد\s+مركزي/],
      ["gear_pump", /gear\s+pumps?|pompe[s]?\s+a\s+engrenages?|مضخ(?:ة|ات)\s+(?:تروس|مسنن[ةه])/],
      ["screw_pump", /screw\s+pumps?|pompe[s]?\s+a\s+vis|مضخ(?:ة|ات)\s+لولبي[ةه]/],
      ["diaphragm_pump", /diaphragm\s+pumps?|pompe[s]?\s+a\s+membrane|مضخ(?:ة|ات)\s+غشائي[ةه]/],
      ["submersible_pump", /submersible\s+pumps?|pompe[s]?\s+immerge(?:e|es)?|مضخ(?:ة|ات)\s+غاطس[ةه]/],
      ["positive_displacement_pump", /positive\s+displacement\s+pumps?|pompe[s]?\s+volumetrique[s]?|مضخ(?:ة|ات)\s+ازاحة\s+موجب[ةه]/],
      ["pump", /\bpumps?\b|\bpompes?\b|مضخ(?:ة|ات)/],
      ["electric_motor", /electric\s+motors?|moteur[s]?\s+electrique[s]?|محرك(?:ات)?\s+كهربائي[ةه]/],
      ["motor", /\bmotor[s]?\b|\bmoteur[s]?\b|محرك(?:ات)?/],
      ["compressor", /\bcompressors?\b|\bcompresseurs?\b|ضواغط?|ضاغط/],
      ["valve", /\bvalves?\b|\bvannes?\b|صمام(?:ات)?/],
      ["bearing", /\bbearings?\b|\broulements?\b|محامل?|محمل/]
    ];
    const found = patterns.find(([, pattern]) => pattern.test(text));
    return found ? found[0] : text;
  }

  function equipmentFamilyMatches(scope, observed) {
    const expected = canonicalEquipmentFamily(scope);
    const actual = canonicalEquipmentFamily(observed);
    if (!expected || !actual) return false;
    if (expected === actual) return true;
    return (expected === "pump" && actual.endsWith("_pump")) ||
      (expected === "motor" && actual === "electric_motor");
  }

  function normalizeModelDesignation(value) {
    return normalizeText(value)
      .replace(/[‐‑‒–—−]/g, "-")
      .replace(/[^\p{L}\p{N}]+/gu, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function modelApplicabilityMatches(scope, observed) {
    const generic = normalizeText(scope)
      .replace(/[-_]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (/^(?:generic|all models|family wide|not model specific|générique|generique|غير مرتبط بموديل|جميع الموديلات|كل الموديلات|عام)$/.test(generic)) return true;
    const actual = normalizeModelDesignation(observed);
    if (!actual) return false;
    const alternatives = String(scope || "").split(/[;,|]/)
      .map(normalizeModelDesignation)
      .filter(Boolean);
    return alternatives.includes(actual);
  }

  function extractCriticalTokens(value) {
    const source = String(value || "");
    const found = [];
    const patterns = [
      /[-+]?\d+(?:[.,]\d+)?(?:\s*(?:to|a|à|–|—|-)\s*[-+]?\d+(?:[.,]\d+)?)?\s*(?:mm|cm|km|bar|kpa|mpa|psi|°\s*[cf]|hz|khz|mhz|kw|mw|w|ma|mv|v|rpm|r\/min|m³?\/h|l\/min|l\/s|m\/s|mm\/s|n[·.]?m|kg|ml|g|l|%)(?![\p{L}])/giu,
      /\b[A-Z]{1,10}[\s-]?\d[A-Z0-9]*(?:[-/][A-Z0-9]+)*/gi,
      /\b\d{3,}(?:[-/][A-Z0-9]+)+\b/gi
    ];
    for (const pattern of patterns) {
      for (const match of source.matchAll(pattern)) {
        const token = String(match[0] || "").trim().replace(/\s+/g, " ");
        if (token && !found.includes(token)) found.push(token);
        if (found.length >= 40) return found;
      }
    }
    return found;
  }

  function isDiagnosticEligible(document) {
    return Boolean(document &&
      document.eligibleForDiagnosis === true &&
      document.reviewStatus === "approved" &&
      document.rightsStatus === "verified");
  }

  function makeSourceRef(document, chunk) {
    return {
      documentId: document && document.id || chunk && chunk.documentId || null,
      fileName: document && document.fileName || null,
      sha256: document && document.sha256 || null,
      pageNumber: chunk && chunk.pageNumber || null,
      printedPageNumber: chunk && chunk.printedPageNumber || null,
      chunkId: chunk && chunk.id || null,
      extractionMethod: chunk && chunk.extractionMethod || "unknown",
      ocrConfidence: chunk && Number.isFinite(chunk.ocrConfidence) ? chunk.ocrConfidence : null,
      extractionStatus: document && document.extractionStatus || "unknown",
      reviewStatus: document && document.reviewStatus || "unreviewed",
      rightsStatus: document && document.rightsStatus || "unknown",
      evidenceClass: document && document.evidenceClass || null
    };
  }

  function makeCitation(document, pageNumber) {
    const title = document && (document.title || document.fileName) || "Unknown document";
    return title + ", p. " + String(pageNumber || "?");
  }

  return { normalizeText, tokenize, chunkPage, buildPostings, rankChunks, canonicalEquipmentFamily, equipmentFamilyMatches, normalizeModelDesignation, modelApplicabilityMatches, extractCriticalTokens, makeCitation, isDiagnosticEligible, makeSourceRef };
});
