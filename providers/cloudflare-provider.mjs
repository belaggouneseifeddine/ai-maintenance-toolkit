const DEFAULT_MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";

function extractOutputText(data) {
  if (typeof data?.response === "string" && data.response.trim()) return data.response.trim();
  if (data?.response && typeof data.response === "object") return JSON.stringify(data.response);
  if (typeof data?.output_text === "string" && data.output_text.trim()) return data.output_text.trim();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content === "string" && content.trim()) return content.trim();
  if (content && typeof content === "object") return JSON.stringify(content);
  return "";
}

/**
 * Calls Cloudflare Workers AI through the native env.AI binding.
 * No provider API key is required. The caller validates the full diagnosis
 * contract and applies the app's evidence and safety gates.
 */
export async function callCloudflareAI({
  ai,
  model = DEFAULT_MODEL,
  instructions,
  input,
  schema,
  timeoutMs = 15000
}) {
  if (!ai || typeof ai.run !== "function") {
    return { ok: false, errorCode: "provider_not_configured", retryable: false };
  }
  if (typeof instructions !== "string" || typeof input !== "string" || !schema) {
    return { ok: false, errorCode: "invalid_provider_request", retryable: false };
  }

  let data;
  let lastError = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    let timeoutId;
    try {
      data = await Promise.race([
        ai.run(model, {
          messages: [
            { role: "system", content: instructions },
            { role: "user", content: input }
          ],
          response_format: { type: "json_schema", json_schema: schema },
          max_tokens: 1800,
          temperature: 0.2
        }),
        new Promise((_, reject) => {
          timeoutId = setTimeout(() => reject(new Error("timeout")), timeoutMs);
        })
      ]);
      lastError = null;
      break;
    } catch (error) {
      lastError = error;
      const message = String(error?.message || error || "").toLowerCase();
      const capacityError = message.includes("429") || message.includes("503") ||
        message.includes("busy") || message.includes("capacity") ||
        message.includes("temporarily unavailable");
      if (attempt === 0 && capacityError) {
        await new Promise(resolve => setTimeout(resolve, 350));
        continue;
      }
      const timedOut = message.includes("timeout");
      return {
        ok: false,
        errorCode: timedOut ? "provider_timeout" : capacityError ? "provider_temporarily_unavailable" : "provider_request_failed",
        retryable: timedOut || capacityError
      };
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }
  }
  if (lastError || !data) {
    const message = String(lastError?.message || lastError || "").toLowerCase();
    const timedOut = message.includes("timeout");
    return { ok: false, errorCode: timedOut ? "provider_timeout" : "provider_request_failed", retryable: true };
  }

  const outputText = extractOutputText(data);
  if (!outputText) return { ok: false, errorCode: "provider_empty_output", retryable: true };
  try {
    JSON.parse(outputText);
  } catch {
    return { ok: false, errorCode: "provider_malformed_output", retryable: true };
  }
  return { ok: true, outputText, model, usage: data?.usage || null };
}

export { DEFAULT_MODEL, extractOutputText };
