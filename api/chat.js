/**
 * Vercel serverless endpoint for Maintenance AI Toolkit.
 * Required environment variable: AI_API_KEY (set in Vercel Project Settings).
 * Optional: AI_BASE_URL, AI_MODEL, ALLOWED_ORIGIN.
 * Never place provider credentials in browser code or public repository files.
 */
const MAX_BODY_BYTES = 8192;
const MAX_TRACKED_IPS = 2000;
const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 12;
const requestsByIp = new Map();

function send(res, status, payload, origin, allowedOrigin) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Origin", origin === allowedOrigin ? allowedOrigin : "null");
  res.end(JSON.stringify(payload));
}

export default async function handler(req, res) {
  const origin = req.headers.origin || "";
  const allowedOrigin = process.env.ALLOWED_ORIGIN || "https://belaggouneseifeddine.github.io";
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.setHeader("Access-Control-Allow-Origin", origin === allowedOrigin ? allowedOrigin : "null");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Vary", "Origin");
    return res.end();
  }
  if (origin !== allowedOrigin) return send(res, 403, { error: "Origin not allowed." }, origin, allowedOrigin);
  if (req.method !== "POST") return send(res, 405, { error: "Use POST." }, origin, allowedOrigin);
  if (!process.env.AI_API_KEY) return send(res, 503, { error: "Backend is not configured yet." }, origin, allowedOrigin);

  const contentType = req.headers["content-type"] || "";
  if (!/^application\/json(?:\s*;|\s*$)/i.test(contentType)) {
    return send(res, 415, { error: "Content-Type must be application/json." }, origin, allowedOrigin);
  }
  let body = req.body;
  if (typeof body === "string") {
    if (Buffer.byteLength(body, "utf8") > MAX_BODY_BYTES) return send(res, 413, { error: "Request body too large." }, origin, allowedOrigin);
    try { body = JSON.parse(body); } catch { return send(res, 400, { error: "Invalid JSON request." }, origin, allowedOrigin); }
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) return send(res, 400, { error: "Invalid JSON request." }, origin, allowedOrigin);
  const { machine, symptom, code = "", observations = "", language = "ar" } = body;
  if (![machine, symptom, code, observations, language].every(v => typeof v === "string")) {
    return send(res, 400, { error: "All fields must be text." }, origin, allowedOrigin);
  }
  if (Buffer.byteLength(JSON.stringify(body), "utf8") > MAX_BODY_BYTES ||
      machine.length > 120 || symptom.length > 240 || code.length > 300 || observations.length > 3000 || !["ar", "fr", "en"].includes(language)) {
    return send(res, 413, { error: "Input too long. Shorten the fault details." }, origin, allowedOrigin);
  }
  if (!machine.trim() || !symptom.trim()) return send(res, 400, { error: "Equipment and symptom are required." }, origin, allowedOrigin);

  // Best-effort per-instance limiter only. It is not shared across serverless instances.
  const ip = String(req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "unknown").split(",")[0].trim();
  const now = Date.now();
  if (requestsByIp.size > MAX_TRACKED_IPS) {
    for (const [key, entry] of requestsByIp) if (now - entry.start > WINDOW_MS || requestsByIp.size > MAX_TRACKED_IPS) requestsByIp.delete(key);
  }
  const previous = requestsByIp.get(ip) || { start: now, count: 0 };
  if (now - previous.start >= WINDOW_MS) { previous.start = now; previous.count = 0; }
  previous.count += 1;
  requestsByIp.set(ip, previous);
  if (previous.count > MAX_REQUESTS_PER_WINDOW) return send(res, 429, { error: "Too many requests. Wait one minute and try again." }, origin, allowedOrigin);

  const base = (process.env.AI_BASE_URL || "https://generativelanguage.googleapis.com/v1beta/openai").replace(/\/+$/, "");
  const model = process.env.AI_MODEL || "gemini-2.5-flash";
  const replyLanguage = language === "fr" ? "French" : language === "en" ? "English" : "Arabic";
  const systemPrompt = `You are a cautious industrial maintenance troubleshooting assistant. Reply in ${replyLanguage}. You are not a substitute for the manufacturer manual, site procedures, or a qualified technician. Never recommend bypassing guards, interlocks, alarms, or protective devices. Never instruct users to touch energized electrical parts, open pressurized systems, or investigate hydraulic leaks by hand. Start with stop-work and isolation warnings when relevant. Do not invent specifications or assert a definite root cause from limited evidence. Structure the response with: (1) uncertainty/summary, (2) plausible causes without false precision, (3) safe non-invasive checks, (4) measurements/evidence needed and that they must be obtained by authorized qualified personnel using approved procedures, (5) stop/escalation conditions, (6) missing information. Remind the user to follow LOTO, manufacturer instructions, and site procedures.`;
  const userPrompt = `Equipment: ${machine}\nSymptom: ${symptom}\nAlarm code: ${code || "not provided"}\nObservations and measurements: ${observations || "not provided"}\nGive a cautious preliminary assessment.`;

  let upstream;
  try {
    upstream = await fetch(base + "/chat/completions", {
      method: "POST",
      headers: { "Authorization": "Bearer " + process.env.AI_API_KEY, "Content-Type": "application/json" },
      signal: AbortSignal.timeout(20_000),
      body: JSON.stringify({ model, temperature: 0.2, max_tokens: 900, messages: [
        { role: "system", content: systemPrompt }, { role: "user", content: userPrompt }
      ] })
    });
  } catch {
    return send(res, 502, { error: "AI provider could not be reached. The local diagnostic mode remains available." }, origin, allowedOrigin);
  }
  if (!upstream.ok) return send(res, 502, { error: "AI provider returned an error (" + upstream.status + "). Check provider settings and quota." }, origin, allowedOrigin);
  let data;
  try { data = await upstream.json(); } catch {
    return send(res, 502, { error: "AI provider returned an unreadable response." }, origin, allowedOrigin);
  }
  const answer = data?.choices?.[0]?.message?.content;
  if (typeof answer !== "string" || !answer.trim()) return send(res, 502, { error: "AI provider response did not contain an answer." }, origin, allowedOrigin);
  return send(res, 200, { answer: answer.slice(0, 12000) }, origin, allowedOrigin);
}
