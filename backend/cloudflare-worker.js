/**
 * Cloudflare Worker backend for Maintenance AI Toolkit.
 * Configure secrets: AI_API_KEY
 * Configure variables: AI_BASE_URL, AI_MODEL, ALLOWED_ORIGIN
 * Never put provider credentials in browser code or public repository files.
 */
const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 12;
const MAX_BODY_BYTES = 8_192;
const MAX_TRACKED_IPS = 5_000;
const UPSTREAM_TIMEOUT_MS = 20_000;
// Best-effort per-isolate guard only; use Cloudflare Rate Limiting/WAF for shared enforcement.
const requestsByIp = new Map();

function corsHeaders(origin, allowedOrigin) {
  return {
    "Access-Control-Allow-Origin": origin === allowedOrigin ? allowedOrigin : "null",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin",
    "Content-Type": "application/json; charset=utf-8",
  };
}
function json(data, status, origin, allowedOrigin) {
  return new Response(JSON.stringify(data), { status, headers: corsHeaders(origin, allowedOrigin) });
}
export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const allowedOrigin = env.ALLOWED_ORIGIN || "https://belaggouneseifeddine.github.io";
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin, allowedOrigin) });
    }
    if (origin !== allowedOrigin) return json({ error: "Origin not allowed." }, 403, origin, allowedOrigin);
    if (request.method !== "POST") return json({ error: "Use POST." }, 405, origin, allowedOrigin);
    if (!env.AI_API_KEY || !env.AI_BASE_URL || !env.AI_MODEL) {
      return json({ error: "Backend is not configured yet." }, 503, origin, allowedOrigin);
    }

    const contentType = request.headers.get("Content-Type") || "";
    if (!/^application\/json(?:\s*;|\s*$)/i.test(contentType)) {
      return json({ error: "Content-Type must be application/json." }, 415, origin, allowedOrigin);
    }
    const declaredLength = Number(request.headers.get("Content-Length") || 0);
    if (declaredLength > MAX_BODY_BYTES) {
      return json({ error: "Request body too large." }, 413, origin, allowedOrigin);
    }

    const ip = request.headers.get("CF-Connecting-IP") || "unknown";
    const now = Date.now();
    // Periodically discard expired entries and cap memory used by this best-effort map.
    if (requestsByIp.size > MAX_TRACKED_IPS || Math.random() < 0.02) {
      for (const [key, value] of requestsByIp) {
        if (now - value.start > WINDOW_MS || requestsByIp.size > MAX_TRACKED_IPS) requestsByIp.delete(key);
      }
    }
    const previous = requestsByIp.get(ip) || { start: now, count: 0 };
    if (now - previous.start > WINDOW_MS) { previous.start = now; previous.count = 0; }
    previous.count += 1;
    requestsByIp.set(ip, previous);
    if (previous.count > MAX_REQUESTS_PER_WINDOW) {
      return json({ error: "Too many requests. Wait one minute and try again." }, 429, origin, allowedOrigin);
    }

    let body;
    try {
      const rawBody = await request.text();
      if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
        return json({ error: "Request body too large." }, 413, origin, allowedOrigin);
      }
      body = JSON.parse(rawBody);
    } catch {
      return json({ error: "Invalid JSON request." }, 400, origin, allowedOrigin);
    }
    const { machine, symptom, code = "", observations = "" } = body || {};
    if (![machine, symptom, code, observations].every(v => typeof v === "string")) {
      return json({ error: "All fields must be text." }, 400, origin, allowedOrigin);
    }
    if (machine.length > 120 || symptom.length > 240 || code.length > 300 || observations.length > 3000) {
      return json({ error: "Input too long. Shorten the fault details." }, 413, origin, allowedOrigin);
    }
    if (!machine.trim() || !symptom.trim()) {
      return json({ error: "Equipment and symptom are required." }, 400, origin, allowedOrigin);
    }

    const systemPrompt = `You are a cautious industrial maintenance troubleshooting assistant. Reply in Arabic. You are not a substitute for the manufacturer manual, site procedures, or a qualified technician. Never recommend bypassing guards, interlocks, alarms, or protective devices. Never instruct users to touch energized electrical parts, open pressurized systems, or investigate hydraulic leaks by hand. Start with stop-work and isolation warnings when relevant. Do not invent specifications or assert a definite root cause from limited evidence. Structure the response with: (1) uncertainty/summary, (2) plausible causes without false precision, (3) safe non-invasive checks, (4) measurements/evidence needed and that they must be obtained by authorized qualified personnel using approved procedures, (5) stop/escalation conditions, (6) missing information. Remind the user to follow LOTO, manufacturer instructions, and site procedures.`;
    const userPrompt = `Equipment: ${machine}\nSymptom: ${symptom}\nAlarm code: ${code || "not provided"}\nObservations and measurements: ${observations || "not provided"}\nGive a cautious preliminary assessment.`;
    const base = env.AI_BASE_URL.replace(/\/+$/, "");
    let upstream;
    try {
      upstream = await fetch(base + "/chat/completions", {
        signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
        method: "POST",
        headers: { "Authorization": "Bearer " + env.AI_API_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: env.AI_MODEL,
          temperature: 0.2,
          max_tokens: 900,
          messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }]
        })
      });
    } catch {
      return json({ error: "AI provider could not be reached. The local diagnostic mode remains available." }, 502, origin, allowedOrigin);
    }
    if (!upstream.ok) {
      return json({ error: "AI provider returned an error (" + upstream.status + "). Check provider settings and quota." }, 502, origin, allowedOrigin);
    }
    let data;
    try { data = await upstream.json(); } catch {
      return json({ error: "AI provider returned an unreadable response." }, 502, origin, allowedOrigin);
    }
    const answer = data?.choices?.[0]?.message?.content;
    if (typeof answer !== "string" || !answer.trim()) {
      return json({ error: "AI provider response did not contain an answer." }, 502, origin, allowedOrigin);
    }
    return json({ answer: answer.slice(0, 12000) }, 200, origin, allowedOrigin);
  }
};
