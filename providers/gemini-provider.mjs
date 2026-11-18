const DEFAULT_MODEL = "gemini-3.8-flash";
const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504]);
const DEFAULT_RETRY_DELAYS = [700, 1600];

export function extractInteractionText(data) {
  if (typeof data?.output_text === "string") return data.output_text.trim();
  const steps = Array.isArray(data?.output) ? data.output : Array.isArray(data?.steps) ? data.steps : [];
  const texts = [];
  for (const step of steps) {
    if (step?.type !== "model_output" && step?.type !== "text") continue;
    const content = Array.isArray(step.content) ? step.content : [];
    for (const item of content) {
      if (typeof item?.text === "string") texts.push(item.text);
    }
  }
  return texts.join("\n").trim();
}

function retryDelay(response, fallbackMs) {
  const seconds = Number(response?.headers?.get("Retry-After") || 0);
  return seconds > 0 ? Math.min(seconds * 1000, 5000) : fallbackMs;
}

/**
 * Gemini Interactions API adapter. Provider-specific HTTP/retry behavior is kept
 * outside the Worker route; callers still own diagnosis schema and safety gates.
 * No raw provider response or credential is returned to the client.
 */
export async function callGeminiAI({
  apiKey,
  model = DEFAULT_MODEL,
  input,
  systemInstruction,
  schema,
  fetchImpl = fetch,
  timeoutMs = 17000,
  retryDelays = DEFAULT_RETRY_DELAYS,
  sleep = ms => new Promise(resolve => setTimeout(resolve, ms))
} = {}) {
  if (typeof apiKey !== "string" || !apiKey.trim()) {
    return { ok: false, errorCode: "provider_not_configured", retryable: false };
  }
  if (typeof input !== "string" || typeof systemInstruction !== "string" || !schema ||
      typeof fetchImpl !== "function" || !Number.isFinite(timeoutMs) || timeoutMs < 1) {
    return { ok: false, errorCode: "invalid_provider_request", retryable: false };
  }

  const requestBody = JSON.stringify({
    model,
    input,
    system_instruction: systemInstruction,
    response_format: { type: "text", mime_type: "application/json", schema },
    generation_config: { max_output_tokens: 1800 },
    store: false
  });
  let upstream = null;
  let lastNetworkError = false;

  for (let attempt = 0; attempt <= retryDelays.length; attempt++) {
    try {
      upstream = await fetchImpl("https://generativelanguage.googleapis.com/v1beta/interactions", {
        method: "POST",
        headers: { "x-goog-api-key": apiKey, "Content-Type": "application/json" },
        signal: AbortSignal.timeout(timeoutMs),
        body: requestBody
      });
      lastNetworkError = false;
    } catch {
      lastNetworkError = true;
      if (attempt < retryDelays.length) {
        await sleep(retryDelays[attempt]);
        continue;
      }
      break;
    }

    if (!RETRYABLE_STATUSES.has(upstream.status) || attempt >= retryDelays.length) break;
    await sleep(retryDelay(upstream, retryDelays[attempt]));
  }

  if (lastNetworkError) {
    return { ok: false, errorCode: "provider_network_error", retryable: true };
  }
  if (!upstream) {
    return { ok: false, errorCode: "provider_network_error", retryable: true };
  }
  if (!upstream.ok) {
    return {
      ok: false,
      errorCode: RETRYABLE_STATUSES.has(upstream.status) ? "provider_temporarily_unavailable" : "provider_http_error",
      status: upstream.status,
      retryable: RETRYABLE_STATUSES.has(upstream.status)
    };
  }

  let data;
  try {
    data = await upstream.json();
  } catch {
    return { ok: false, errorCode: "provider_unreadable_response", retryable: true };
  }
  const outputText = extractInteractionText(data);
  if (!outputText) return { ok: false, errorCode: "provider_empty_output", retryable: true };
  try {
    JSON.parse(outputText);
  } catch {
    return {
      ok: false,
      errorCode: "provider_malformed_output",
      retryable: true,
      outputLength: outputText.length
    };
  }
  return { ok: true, outputText, model, usage: data?.usage || null };
}

export { DEFAULT_MODEL, RETRYABLE_STATUSES };
