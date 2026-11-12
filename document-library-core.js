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

  function makeCitation(document, pageNumber) {
    const title = document && (document.title || document.fileName) || "Unknown document";
    return title + ", p. " + String(pageNumber || "?");
  }

  return { normalizeText, tokenize, chunkPage, buildPostings, rankChunks, makeCitation };
});
