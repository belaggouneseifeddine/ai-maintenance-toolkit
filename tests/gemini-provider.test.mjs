import test from "node:test";
import assert from "node:assert/strict";
import { callGeminiAI, extractInteractionText } from "../providers/gemini-provider.mjs";

const schema = { type: "object", properties: { ok: { type: "boolean" } } };
const input = "Industrial pump low flow";
const systemInstruction = "Return structured JSON only.";
const validPayload = {
  output: [{ type: "model_output", content: [{ type: "text", text: JSON.stringify({ ok: true }) }] }]
};
const response = (payload, status = 200, headers = {}) =>
  new Response(typeof payload === "string" ? payload : JSON.stringify(payload), {
    status, headers: { "content-type": "application/json", ...headers }
  });

test("Gemini adapter refuses missing credentials without making a request", async () => {
  let called = false;
  const result = await callGeminiAI({
    input, systemInstruction, schema,
    fetchImpl: async () => { called = true; return response(validPayload); }
  });
  assert.equal(result.ok, false);
  assert.equal(result.errorCode, "provider_not_configured");
  assert.equal(called, false);
});

test("Gemini adapter sends the expected private Interactions request and parses structured output", async () => {
  let captured;
  const result = await callGeminiAI({
    apiKey: "test-secret",
    model: "test-model",
    input, systemInstruction, schema,
    fetchImpl: async (url, options) => {
      captured = { url, options, body: JSON.parse(options.body) };
      return response(validPayload);
    }
  });
  assert.equal(result.ok, true);
  assert.deepEqual(JSON.parse(result.outputText), { ok: true });
  assert.equal(captured.url, "https://generativelanguage.googleapis.com/v1beta/interactions");
  assert.equal(captured.options.method, "POST");
  assert.equal(captured.options.headers["x-goog-api-key"], "test-secret");
  assert.equal(captured.body.model, "test-model");
  assert.equal(captured.body.store, false);
  assert.deepEqual(captured.body.response_format.schema, schema);
  assert.equal(captured.body.input, input);
  assert.equal(captured.body.system_instruction, systemInstruction);
  assert.equal(JSON.stringify(captured.body).includes("test-secret"), false);
});

test("Gemini adapter retries a rate-limited response and respects bounded Retry-After", async () => {
  let calls = 0;
  const sleeps = [];
  const result = await callGeminiAI({
    apiKey: "test-secret", input, systemInstruction, schema,
    retryDelays: [10],
    sleep: async ms => sleeps.push(ms),
    fetchImpl: async () => ++calls === 1
      ? response({ error: "busy" }, 429, { "Retry-After": "9" })
      : response(validPayload)
  });
  assert.equal(result.ok, true);
  assert.equal(calls, 2);
  assert.deepEqual(sleeps, [5000]);
});

test("Gemini adapter does not retry a non-retryable client error", async () => {
  let calls = 0;
  const result = await callGeminiAI({
    apiKey: "test-secret", input, systemInstruction, schema,
    retryDelays: [1, 2],
    sleep: async () => {},
    fetchImpl: async () => { calls++; return response({ error: "bad request" }, 400); }
  });
  assert.equal(result.ok, false);
  assert.equal(result.errorCode, "provider_http_error");
  assert.equal(result.status, 400);
  assert.equal(result.retryable, false);
  assert.equal(calls, 1);
});

test("Gemini adapter retries transient network errors", async () => {
  let calls = 0;
  const sleeps = [];
  const result = await callGeminiAI({
    apiKey: "test-secret", input, systemInstruction, schema,
    retryDelays: [15],
    sleep: async ms => sleeps.push(ms),
    fetchImpl: async () => {
      calls++;
      if (calls === 1) throw new Error("temporary network error");
      return response(validPayload);
    }
  });
  assert.equal(result.ok, true);
  assert.equal(calls, 2);
  assert.deepEqual(sleeps, [15]);
});

test("Gemini adapter rejects malformed and empty provider output", async () => {
  const malformed = await callGeminiAI({
    apiKey: "test-secret", input, systemInstruction, schema,
    fetchImpl: async () => response({
      output: [{ type: "model_output", content: [{ text: "{not-json" }] }]
    })
  });
  assert.equal(malformed.ok, false);
  assert.equal(malformed.errorCode, "provider_malformed_output");

  const empty = await callGeminiAI({
    apiKey: "test-secret", input, systemInstruction, schema,
    fetchImpl: async () => response({ output: [] })
  });
  assert.equal(empty.ok, false);
  assert.equal(empty.errorCode, "provider_empty_output");
});

test("Interactions response extraction supports output_text and text steps", () => {
  assert.equal(extractInteractionText({ output_text: "  {\"ok\":true}  " }), '{"ok":true}');
  assert.equal(extractInteractionText({
    output: [{ type: "model_output", content: [{ text: "one" }, { text: "two" }] }]
  }), "one\ntwo");
  assert.equal(extractInteractionText({ output: [{ type: "reasoning", content: [{ text: "ignored" }] }] }), "");
});
