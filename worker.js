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
    const systemPrompt = "You are a senior industrial maintenance and reliability engineer with hands-on expertise in industrial electrical systems, PLCs, sensors, VFDs, motors, pumps, compressors, hydraulics, pneumatics, mechanical drives, bearings, lubrication, instrumentation, and preventive/predictive maintenance. Reply in the requested language. Deliver a specific, evidence-led troubleshooting assessment, not generic maintenance advice. Use the supplied machine, exact symptom, alarm/code, operating state, and observations as evidence. Explicitly connect each suspected fault to the observed symptoms. Never invent machine details, alarm-code meanings, OEM limits, wiring, component locations, or measurements. If an alarm code is manufacturer-specific and make/model is missing, say so and request the exact model/manual or a photo of the alarm. Rank up to 3 plausible causes. For each, state why it fits, what evidence would support or refute it, and the next discriminating check. Separate confirmed facts from hypotheses. Give an ordered diagnostic decision path with expected outcomes and what each outcome means. Prioritize the fastest, safest, highest-information checks. Avoid an unprioritized list. Specify relevant measurements and where/when they should be taken only when justified. Never fabricate target values. Use the nameplate, OEM manual, trend history, or site baseline for limits. Measurements inside energized panels or pressurized equipment must be performed only by authorized qualified personnel using approved procedures and suitable instruments. Ask only the 2–4 missing questions that would most change the diagnosis. If input is insufficient, give a short provisional differential and identify the exact missing evidence; do not pretend the root cause is confirmed. Use this structure: (1) Initial assessment and confidence, (2) ranked fault hypotheses with evidence, (3) prioritized diagnostic steps with interpretation, (4) required measurements/data, (5) safety/stop conditions, (6) targeted follow-up questions. Be concise but technically useful. Use correct industrial terminology and practical reasoning. Avoid generic filler like 'check the machine' or 'consult a technician' without naming the check and its purpose. Safety: never recommend bypassing guards, interlocks, alarms, or protective devices. Never tell users to touch energized parts, open pressurized systems, or check hydraulic leaks by hand. State isolation/LOTO requirements when relevant. Follow OEM instructions and site procedures.";
    const userPrompt = `Troubleshoot this real industrial maintenance case as a senior field engineer.\nEquipment / type / manufacturer / model: ${machine}\nExact symptom and when it occurs: ${symptom}\nAlarm or fault code (exact text): ${code || "not provided"}\nOperating conditions, recent changes, readings, previous repairs, and observations: ${observations || "not provided"}\nUse only the evidence supplied. Rank plausible causes, show how to distinguish them, and give an ordered safe diagnostic path. If a key fact is missing, state what cannot yet be concluded and ask the few highest-value questions. Do not give a generic checklist.`

    let upstream;
    const model = env.AI_MODEL || "gemini-3.8-flash";
    const requestBody = JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      generationConfig: { temperature: 0.2, maxOutputTokens: 1400 }
    });
    const retryableStatuses = new Set([429, 500, 502, 503, 504]);
    const retryDelays = [700, 1600];
    let lastNetworkError = null;

    for (let attempt = 0; attempt <= retryDelays.length; attempt++) {
      try {
        upstream = await fetch("https://generativelanguage.googleapis.com/v1beta/models/" + encodeURIComponent(model) + ":generateContent", {
          method: "POST",
          headers: {
            "x-goog-api-key": env.AI_API_KEY,
            "Content-Type": "application/json"
          },
          signal: AbortSignal.timeout(55000),
          body: requestBody
        });
        lastNetworkError = null;
      } catch (err) {
        lastNetworkError = err;
        if (attempt < retryDelays.length) {
          await new Promise(resolve => setTimeout(resolve, retryDelays[attempt]));
          continue;
        }
        break;
      }
      if (!retryableStatuses.has(upstream.status) || attempt >= retryDelays.length) break;
      const retryAfter = Number(upstream.headers.get("Retry-After") || 0);
      const delay = retryAfter > 0
        ? Math.min(retryAfter * 1000, 5000)
        : retryDelays[attempt];
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    if (lastNetworkError) {
      const detail = String(lastNetworkError?.message || lastNetworkError || "Unknown network error").slice(0, 300);
      return json({
        error: "AI provider request failed before receiving an HTTP response.",
        provider_detail: detail,
        model: model
      }, 502, origin);
    }
    if (!upstream.ok) {
      let providerDetail = "";
      try {
        const errorBody = await upstream.text();
        let parsed;
        try { parsed = JSON.parse(errorBody); } catch {}
        providerDetail = String(parsed?.error?.message || parsed?.message || "").slice(0, 500);
      } catch {}
      const retryable = retryableStatuses.has(upstream.status);
      return json({
        error: retryable
          ? "Gemini is temporarily busy or rate-limited. Please retry shortly."
          : "Gemini API returned an error (" + upstream.status + ").",
        provider_status: upstream.status,
        provider_detail: providerDetail || "No error detail returned. Check Gemini API key, model access, and quota.",
        retryable: retryable
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
