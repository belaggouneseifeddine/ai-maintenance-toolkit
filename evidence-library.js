/* Curated, offline-first source registry for Maintenance AI Toolkit.
 * These records describe source scope; they do not prove a fault diagnosis.
 * No network fetching occurs in this module.
 */
(function (root) {
  "use strict";
  const SOURCES = Object.freeze([
    Object.freeze({
      id: "osha-loto-1910-147",
      title: "29 CFR 1910.147 — The control of hazardous energy (lockout/tagout)",
      publisher: "U.S. Occupational Safety and Health Administration (OSHA)",
      url: "https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.147",
      topics: Object.freeze(["lockout", "tagout", "loto", "hazardous energy", "isolation", "maintenance safety", "stored energy"]),
      equipmentTypes: Object.freeze(["all"]),
      sourceType: "regulation",
      jurisdiction: "United States",
      scope: "Hazardous-energy control during covered servicing and maintenance.",
      limitation: "U.S. regulation; verify applicable Algerian law, employer procedures, and site-specific isolation requirements."
    }),
    Object.freeze({
      id: "doe-pump-sourcebook",
      title: "Improving Pumping System Performance: A Sourcebook for Industry, Second Edition",
      publisher: "U.S. Department of Energy",
      url: "https://www.energy.gov/sites/prod/files/2014/05/f16/pump.pdf",
      topics: Object.freeze(["pump", "pumping system", "flow", "efficiency", "system performance", "pump curve", "maintenance"]),
      equipmentTypes: Object.freeze(["pump"]),
      sourceType: "technical guide",
      jurisdiction: "General technical guidance",
      scope: "Pumping-system assessment and performance improvement at system level.",
      limitation: "Not a substitute for the exact pump manufacturer's manual, operating limits, or site procedure."
    })
  ]);
  const MAX_QUERY_CHARS = 1200;
  const MAX_RESULTS = 5;
  const STOP_WORDS = new Set([
    "the", "and", "for", "with", "from", "this", "that", "what", "how", "when",
    "les", "des", "une", "pour", "avec", "dans", "sur", "est", "que", "qui",
    "من", "في", "على", "ما", "هل", "هذا", "هذه", "عن", "الى", "إلى", "مع", "و", "أو"
  ]);
  function tokenize(value) {
    return String(value || "")
      .toLocaleLowerCase()
      .normalize("NFKC")
      .replace(/[^\p{L}\p{N}]+/gu, " ")
      .trim()
      .split(/\s+/u)
      .filter(token => token.length > 1 && !STOP_WORDS.has(token));
  }
  function searchSources(input) {
    const request = input && typeof input === "object" && !Array.isArray(input) ? input : {};
    const rawQuery = [request.query, request.intent, request.equipmentType, request.symptom]
      .concat(Array.isArray(request.observations) ? request.observations.slice(0, 8) : [])
      .filter(value => typeof value === "string")
      .join(" ");
    if (!rawQuery.trim() || rawQuery.length > MAX_QUERY_CHARS) {
      return { ok: false, status: "invalid_query", results: [], note: "Provide a short search query (maximum 1200 characters)." };
    }
    const queryTokens = new Set(tokenize(rawQuery));
    const results = SOURCES.map(source => {
      const searchable = tokenize([source.title, source.publisher, source.scope, ...source.topics].join(" "));
      const matched = [...queryTokens].filter(token => searchable.includes(token));
      const equipment = String(request.equipmentType || "").toLocaleLowerCase();
      const equipmentMatch = !equipment || source.equipmentTypes.includes("all") ||
        source.equipmentTypes.some(type => equipment.includes(type));
      const score = matched.length + (equipmentMatch && equipment ? 1 : 0);
      return { source, matched, score };
    })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score || a.source.id.localeCompare(b.source.id))
      .slice(0, MAX_RESULTS)
      .map(item => ({
        citationId: item.source.id,
        source: {
          id: item.source.id,
          title: item.source.title,
          publisher: item.source.publisher,
          url: item.source.url,
          sourceType: item.source.sourceType,
          jurisdiction: item.source.jurisdiction
        },
        scope: item.source.scope,
        limitation: item.source.limitation,
        relevanceTerms: item.matched,
        relevanceScore: item.score,
        interpretation: "Reference for background only; it does not independently confirm a root cause."
      }));
    return {
      ok: true,
      status: results.length ? "sources_found" : "no_matching_sources",
      results,
      note: results.length
        ? "Use each citationId to refer only to the source record returned here. Check the full source and equipment-specific documentation before acting."
        : "No matching source was found in the small built-in registry. Do not invent a citation; search an authoritative manual or source separately."
    };
  }
  const api = Object.freeze({
    version: "0.1.0",
    listSources: () => SOURCES.map(source => ({ ...source, topics: [...source.topics], equipmentTypes: [...source.equipmentTypes] })),
    searchSources
  });
  root.MaintenanceEvidenceLibrary = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
