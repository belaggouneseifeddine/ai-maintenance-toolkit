const DEFAULT_MODEL = "gpt-4.1-mini";
const ENDPOINT = "https://api.openai.com/v1/responses";

function strictJsonSchema(schema) {
  if (!schema || typeof schema !== "object" || Array.isArray(schema)) return schema;
  const out = {};
  for (const [key, value] of Object.entries(schema)) {
    if (key === "properties" && value && typeof value === "object" && !Array.isArray(value)) {
      out.properties = Object.fromEntries(
        Object.entries(value).map(([name, child]) => [name, strictJsonSchema(child)])
      );
      out.required = Object.keys(out.properties);
      out.additionalProperties = false;
    } else if (key === "items") {
      out.items = strictJsonSchema(value);
    } else {
      out[key] = value;
    }
  }
  if (out.type === "object" && !out.additionalProperties) {
    out.properties ||= {};
    out.required ||= Object.keys(out.properties);
    out.additionalProperties = false;
  }
  return out;
}

function extractOutputText(data) {
  if (typeof data?.output_text === "string" && data.output_text.trim()) {
    return data.output_text.trim();
  }
  const parts = [];
  for (const item of Array.isArray(data?.output) ? data.output : []) {
    if (item?.type !== "message" && item?.type !== "output_text") continue;
    for (const content of Array.isArray(item.content) ? item.content : []) {
      if (content?.type === "output_text" && typeof content.text === "string") parts.push(content.text);
    }
  }
  return parts.join("\n").trim();
}

/**
 * Calls OpenAI Responses API without exposing provider response bodies or secrets.
 * The caller remains responsible for validating the parsed JSON against the app's
 * full diagnosis contract and applying evidence/safety gates.
 */
export async function callOpenAI({
  apiKey,
  model = DEFAULT_MODEL,
  instructions,
  input,
  schema,
  fetchImpl = fetch,
  timeoutMs = 17000
}) {
  if (typeof apiKey !== "string" || !apiKey.trim()) {
    return { ok: false, errorCode: "provider_not_configured", providerStatus: null, retryable: false };
  }
  if (typeof instructions !== "string" || typeof input !== "string" || !schema) {
    return { ok: false, errorCode: "invalid_provider_request", providerStatus: null, retryable: false };
  }

  let response;
  try {
    response = await fetchImpl(ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + apiKey,
        "Content-Type": "application/json"
      },
      signal: AbortSignal.timeout(timeoutMs),
      body: JSON.stringify({
        model,
        instructions,
        input,
        text: {
          format: {
            type: "json_schema",
            name: "maintenance_diagnosis",
            strict: true,
            schema: strictJsonSchema(schema)
          }
        },
        max_output_tokens: 1800,
        store: false
      })
    });
  } catch {
    return { ok: false, errorCode: "provider_network_error", providerStatus: null, retryable: true };
  }

  if (!response.ok) {
    const retryable = [408, 429, 500, 502, 503, 504].includes(response.status);
    return {
      ok: false,
      errorCode: retryable ? "provider_temporarily_unavailable" : "provider_request_rejected",
      providerStatus: response.status,
      retryable
    };
  }

  let data;
  try {
    data = await response.json();
  } catch {
    return { ok: false, errorCode: "provider_invalid_json", providerStatus: response.status, retryable: true };
  }
  const outputText = extractOutputText(data);
  if (!outputText) {
    return { ok: false, errorCode: "provider_empty_output", providerStatus: response.status, retryable: true };
  }
  try {
    JSON.parse(outputText);
  } catch {
    return { ok: false, errorCode: "provider_malformed_output", providerStatus: response.status, retryable: true };
  }
  return { ok: true, outputText, providerStatus: response.status, model };
}

export { DEFAULT_MODEL, strictJsonSchema, extractOutputText };
