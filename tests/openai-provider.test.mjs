import test from "node:test";
import assert from "node:assert/strict";
import { callOpenAI, strictJsonSchema, extractOutputText } from "../providers/openai-provider.mjs";

const schema = {
  type: "object",
  properties: {
    status: { type: "string", enum: ["ok"] },
    nested: {
      type: "object",
      properties: { safe: { type: "boolean" } },
      required: ["safe"]
    },
    items: { type: "array", items: { type: "string" } }
  },
  required: ["status", "nested", "items"]
};

test("strict schema closes object properties recursively", () => {
  const result = strictJsonSchema(schema);
  assert.equal(result.additionalProperties, false);
  assert.deepEqual(result.required, ["status", "nested", "items"]);
  assert.equal(result.properties.nested.additionalProperties, false);
  assert.deepEqual(result.properties.nested.required, ["safe"]);
});

test("extracts Responses API output_text", () => {
  assert.equal(extractOutputText({ output_text: "{\"ok\":true}" }), "{\"ok\":true}");
});

test("extracts Responses API message content", () => {
  assert.equal(extractOutputText({
    output: [{ type: "message", content: [{ type: "output_text", text: "{\"ok\":true}" }] }]
  }), "{\"ok\":true}");
});

test("sends a non-stored JSON-schema request and parses valid output", async () => {
  let request;
  const result = await callOpenAI({
    apiKey: "test-secret",
    model: "gpt-test",
    instructions: "safe instructions",
    input: "test case",
    schema,
    fetchImpl: async (url, options) => {
      request = { url, options, body: JSON.parse(options.body) };
      return new Response(JSON.stringify({ output_text: JSON.stringify({ status: "ok", nested: { safe: true }, items: [] }) }), { status: 200 });
    }
  });
  assert.equal(result.ok, true);
  assert.equal(result.providerStatus, 200);
  assert.equal(request.url, "https://api.openai.com/v1/responses");
  assert.equal(request.options.headers.Authorization, "Bearer test-secret");
  assert.equal(request.body.store, false);
  assert.equal(request.body.text.format.type, "json_schema");
  assert.equal(request.body.text.format.strict, true);
  assert.equal(request.body.text.format.schema.additionalProperties, false);
  assert.equal(request.body.model, "gpt-test");
  assert.ok(!JSON.stringify(result).includes("test-secret"));
});

test("missing key fails closed without network call", async () => {
  let calls = 0;
  const result = await callOpenAI({
    apiKey: "",
    instructions: "safe",
    input: "test",
    schema,
    fetchImpl: async () => { calls++; throw new Error("should not call"); }
  });
  assert.deepEqual(result, { ok: false, errorCode: "provider_not_configured", providerStatus: null, retryable: false });
  assert.equal(calls, 0);
});

test("provider status is classified without exposing upstream body", async () => {
  const result = await callOpenAI({
    apiKey: "test-secret",
    instructions: "safe",
    input: "test",
    schema,
    fetchImpl: async () => new Response("sensitive provider details", { status: 429 })
  });
  assert.deepEqual(result, {
    ok: false,
    errorCode: "provider_temporarily_unavailable",
    providerStatus: 429,
    retryable: true
  });
  assert.ok(!JSON.stringify(result).includes("sensitive"));
});

test("malformed model output is rejected", async () => {
  const result = await callOpenAI({
    apiKey: "test-secret",
    instructions: "safe",
    input: "test",
    schema,
    fetchImpl: async () => new Response(JSON.stringify({ output_text: "{not-json" }), { status: 200 })
  });
  assert.equal(result.ok, false);
  assert.equal(result.errorCode, "provider_malformed_output");
});

test("network failure is sanitized", async () => {
  const result = await callOpenAI({
    apiKey: "test-secret",
    instructions: "safe",
    input: "test",
    schema,
    fetchImpl: async () => { throw new Error("private error text"); }
  });
  assert.equal(result.ok, false);
  assert.equal(result.errorCode, "provider_network_error");
  assert.ok(!JSON.stringify(result).includes("private error text"));
});
