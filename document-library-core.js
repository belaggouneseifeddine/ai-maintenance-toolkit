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
    if (!docs.length) return [];
    const tokenLists = docs.map(doc => doc.tokens || tokenize(doc.text));
    const lengths = tokenLists.map(tokens => tokens.length);
    const averageLength = lengths.reduce((sum, length) => sum + length, 0) / Math.max(1, lengths.length);
    const documentFrequency = new Map(queryTokens.map(term => [
      term,
      tokenLists.reduce((count, tokens) => count + (tokens.includes(term) ? 1 : 0), 0)
    ]));
    const k1 = 1.2;
    const b = 0.75;
    const normalizedQuery = normalizeText(query).trim();
    const scored = docs.map((doc, index) => {
      const tokens = tokenLists[index];
      const counts = new Map();
      tokens.forEach(token => counts.set(token, (counts.get(token) || 0) + 1));
      let score = 0;
      let matched = 0;
      for (const term of queryTokens) {
        const tf = counts.get(term) || 0;
        if (!tf) continue;
        matched++;
        const df = documentFrequency.get(term) || 0;
        const idf = Math.log(1 + (docs.length - df + 0.5) / (df + 0.5));
        const lengthNorm = 1 - b + b * (tokens.length / Math.max(1, averageLength));
        score += idf * (tf * (k1 + 1)) / (tf + k1 * lengthNorm);
      }
      if (matched) {
        const normalizedText = normalizeText(doc.text);
        if (normalizedQuery && normalizedText.includes(normalizedQuery)) score += 2.5;
        score *= 0.5 + 0.5 * matched / queryTokens.length;
      }
      return { doc, score, matched };
    }).filter(item => item.score > 0);
    scored.sort((a, b) => b.score - a.score || (a.doc.pageNumber || 0) - (b.doc.pageNumber || 0));
    return scored.slice(0, Math.max(1, limit || 12));
  }

  function canonicalEquipmentFamily(value) {
    const text = normalizeText(value).normalize("NFD").replace(/\p{M}/gu, "")
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
    return normalizeText(value).normalize("NFD").replace(/\p{M}/gu, "")
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
      /[-+]?\d+(?:[.,]\d+)?(?:\s*(?:to|a|à|–|—|-)\s*[-+]?\d+(?:[.,]\d+)?)?\s*(?:mm|cm|km|bar|kpa|mpa|psi|°\s*[cf]|hz|khz|mhz|kw|mw|w|ma|mv|v|rpm|r\/min|m(?:3|³)?\/h|l\/min|l\/s|m\/s|mm\/s|n[·.]?m|kg|ml|g|l|%)(?![\p{L}])/giu,
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

  function extractKnowledgeCandidates(pageText, options) {
    const pageNumber = Number(options && options.pageNumber);
    const source = String(pageText || "");
    const patterns = [
      ["safety", /\b(?:danger|warning|caution|hazard|safety|lockout|tagout|isolate|de-energize)\b|\b(?:danger|avertissement|attention|sécurité|consignation|isoler)\b|خطر|تحذير|تنبيه|سلامة|افصل|عزل/i],
      ["fault", /\b(?:fault|failure|malfunction|alarm|trip|cause|symptom|troubleshoot|overload|overheat)\b|\b(?:panne|défaut|défaillance|alarme|déclenchement|cause|symptôme)\b|عطل|خلل|فشل|إنذار|سبب|أعراض|ارتفاع الحرارة/i],
      ["maintenance", /\b(?:maintenance|lubricat\w*|greas\w*|inspect\w*|replace\w*|interval|service life)\b|\b(?:maintenance|graiss\w*|lubrifi\w*|inspect\w*|remplac\w*|périodicité|entretien)\b|صيانة|تشحيم|تزييت|فحص|استبدال|فترة الصيانة/i],
      ["procedure", /\b(?:check|verify|measure|adjust|test|ensure|tighten|disconnect|connect|start|stop)\b|\b(?:vérifier|contrôler|mesurer|régler|tester|serrer|débrancher|démarrer|arrêter)\b|تحقق|افحص|قِس|قياس|اضبط|اختبر|أحكم|افصل|شغل|أوقف/i],
      ["specification", /\b(?:minimum|maximum|nominal|rated|limit|range|tolerance|pressure|flow|temperature|voltage|current|speed|frequency|capacity)\b|\b(?:minimum|maximum|nominal|limite|plage|tolérance|pression|débit|température|tension|courant|vitesse|fréquence|capacité)\b|الحد الأدنى|الحد الأقصى|اسمي|ضغط|تدفق|حرارة|درجة|جهد|تيار|سرعة|تردد|سعة/i],
      ["component", /\b(?:bearing|mechanical seal|seal|impeller|shaft|rotor|stator|coupling|valve|filter|gasket|winding|terminal)\b|\b(?:roulement|garniture mécanique|joint|roue|arbre|rotor|stator|accouplement|vanne|filtre|bobinage|borne)\b|محمل|رولمان|مانع التسرب|مروحة|عمود|دوار|ثابت|قارنة|صمام|مرشح|حشية|ملف|طرف/i]
    ];
    const candidates = [];
    for (const match of source.matchAll(/[^\n]+/g)) {
      const raw = match[0];
      const text = raw.trim();
      if (text.length < 16 || text.length > 900) continue;
      const tags = patterns.filter(([, pattern]) => pattern.test(text)).map(([tag]) => tag);
      const criticalTokens = extractCriticalTokens(text);
      if (!tags.length && !criticalTokens.length) continue;
      if (criticalTokens.length && !tags.includes("specification")) tags.push("specification");
      const startOffset = match.index + raw.indexOf(text);
      candidates.push({
        id: "p" + (Number.isInteger(pageNumber) && pageNumber > 0 ? pageNumber : 0) + ":line" + candidates.length,
        pageNumber: Number.isInteger(pageNumber) && pageNumber > 0 ? pageNumber : null,
        kind: tags[0] || "technical_reference",
        tags,
        text,
        startOffset,
        endOffset: startOffset + text.length,
        criticalTokens,
        reviewStatus: "candidate",
        eligibleForDiagnosis: false
      });
      if (candidates.length >= 100) break;
    }
    return candidates;
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

  return { normalizeText, tokenize, chunkPage, buildPostings, rankChunks, canonicalEquipmentFamily, equipmentFamilyMatches, normalizeModelDesignation, modelApplicabilityMatches, extractCriticalTokens, extractKnowledgeCandidates, makeCitation, isDiagnosticEligible, makeSourceRef };
});
