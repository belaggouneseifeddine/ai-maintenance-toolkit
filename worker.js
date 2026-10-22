const ALLOWED_ORIGIN = "https://belaggouneseifeddine.github.io";
const MAX_BODY_BYTES = 8192;
const LANGUAGES = new Set(["ar", "fr", "en"]);

function json(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "vary": "Origin",
      "access-control-allow-origin": origin === ALLOWED_ORIGIN ? ALLOWED_ORIGIN : "null",
      "access-control-allow-methods": "POST, OPTIONS",
      "access-control-allow-headers": "Content-Type"
    }
  });
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const url = new URL(request.url);

    if (url.pathname === "/health" && request.method === "GET") {
      return json({ ok: true, service: "maintenance-ai-toolkit-api" }, 200, origin);
    }
    if (url.pathname !== "/api/chat") return json({ error: "Not found." }, 404, origin);
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: {
        "access-control-allow-origin": origin === ALLOWED_ORIGIN ? ALLOWED_ORIGIN : "null",
        "access-control-allow-methods": "POST, OPTIONS",
        "access-control-allow-headers": "Content-Type",
        "access-control-max-age": "86400",
        "vary": "Origin"
      }});
    }
    if (origin !== ALLOWED_ORIGIN) return json({ error: "Origin not allowed." }, 403, origin);
    if (request.method !== "POST") return json({ error: "Use POST." }, 405, origin);
    if (!env.AI_API_KEY) return json({ error: "Backend is not configured yet." }, 503, origin);
    if (!(request.headers.get("content-type") || "").toLowerCase().includes("application/json")) {
      return json({ error: "Content-Type must be application/json." }, 415, origin);
    }

    const length = Number(request.headers.get("content-length") || 0);
    if (length > MAX_BODY_BYTES) return json({ error: "Request body too large." }, 413, origin);
    let body;
    try {
      const raw = await request.text();
      if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) return json({ error: "Request body too large." }, 413, origin);
      body = JSON.parse(raw);
    } catch {
      return json({ error: "Invalid JSON request." }, 400, origin);
    }
    if (!body || typeof body !== "object" || Array.isArray(body)) return json({ error: "Invalid JSON request." }, 400, origin);

    const { machine, symptom, code = "", observations = "", language = "ar" } = body;
    if (![machine, symptom, code, observations, language].every(v => typeof v === "string")) {
      return json({ error: "All fields must be text." }, 400, origin);
    }
    if (machine.length > 120 || symptom.length > 240 || code.length > 300 || observations.length > 3000 || !LANGUAGES.has(language)) {
      return json({ error: "Input too long or language unsupported." }, 413, origin);
    }
    if (!machine.trim() || !symptom.trim()) return json({ error: "Equipment and symptom are required." }, 400, origin);

    const replyLanguage = language === "fr" ? "French" : language === "en" ? "English" : "Arabic";
    const systemPrompt = `You are a cautious industrial maintenance troubleshooting assistant. Reply in ${replyLanguage}. You are not a substitute for the manufacturer manual, site procedures, or a qualified technician. Never recommend bypassing guards, interlocks, alarms, or protective devices. Never instruct users to touch energized electrical parts, open pressurized systems, or investigate hydraulic leaks by hand. Start with stop-work and isolation warnings when relevant. Do not invent specifications or assert a definite root cause from limited evidence. Structure the response with: (1) uncertainty/summary, (2) plausible causes without false precision, (3) safe non-invasive checks, (4) measurements/evidence needed and that they must be obtained by authorized qualified personnel using approved procedures, (5) stop/escalation conditions, (6) missing information. Remind the user to follow LOTO, manufacturer instructions, and site procedures.`;
    const userPrompt = `Equipment: ${machine}\nSymptom: ${symptom}\nAlarm code: ${code || "not provided"}\nObservations and measurements: ${observations || "not provided"}\nGive a cautious preliminary assessment.`;

    let upstream;
    const model = env.AI_MODEL || "gemini-2.5-flash";
    try {
      upstream = await fetch("https://generativelanguage.googleapis.com/v1beta/models/" + encodeURIComponent(model) + ":generateContent", {
        method: "POST",
        headers: {
          "x-goog-api-key": env.AI_API_KEY,
          "Content-Type": "application/json"
        },
        signal: AbortSignal.timeout(20000),
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: "user", parts: [{ text: userPrompt }] }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 900 }
        })
      });
    } catch {
      return json({ error: "AI provider could not be reached. Local diagnostic mode remains available." }, 502, origin);
    }
    if (!upstream.ok) {
      let providerDetail = "";
      try {
        const errorBody = await upstream.text();
        let parsed;
        try { parsed = JSON.parse(errorBody); } catch {}
        providerDetail = String(parsed?.error?.message || parsed?.message || "").slice(0, 500);
      } catch {}
      return json({
        error: "Gemini API returned an error (" + upstream.status + ").",
        provider_detail: providerDetail || "No error detail returned. Check Gemini API key, model access, and quota."
      }, 502, origin);
    }
    let data;
    try { data = await upstream.json(); } catch { return json({ error: "Gemini returned an unreadable response." }, 502, origin); }
    const answer = data?.candidates?.[0]?.content?.parts?.map(part => part.text || "").join("\n").trim();
    if (typeof answer !== "string" || !answer) {
      const blockReason = data?.promptFeedback?.blockReason;
      return json({ error: blockReason ? "Gemini blocked the request: " + blockReason : "Gemini response did not contain an answer." }, 502, origin);
    }
    return json({ answer: answer.slice(0, 12000) }, 200, origin);
  }
};
