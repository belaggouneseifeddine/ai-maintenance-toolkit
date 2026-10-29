const test = require("node:test");
const assert = require("node:assert/strict");
const providerPromise = import("../providers/cloudflare-provider.mjs");

test("Cloudflare provider sends structured JSON request through AI binding", async () => {
  const { callCloudflareAI, DEFAULT_MODEL } = await providerPromise;
  let received;
  const ai = {
    async run(model, options) {
      received = { model, options };
      return { response: { status: "needs_clarification", question: "What is the suction pressure?" }, usage: { neurons: 6 } };
    }
  };
  const schema = { type: "object", properties: { status: { type: "string" } }, required: ["status"] };
  const result = await callCloudflareAI({
    ai, instructions: "Return JSON only.", input: "Pump low flow.", schema
  });
  assert.equal(result.ok, true);
  assert.equal(result.model, DEFAULT_MODEL);
  assert.deepEqual(JSON.parse(result.outputText), {
    status: "needs_clarification", question: "What is the suction pressure?"
  });
  assert.equal(received.options.response_format.type, "json_schema");
  assert.equal(received.options.messages[0].role, "system");
  assert.equal(received.options.messages[1].role, "user");
  assert.equal(received.options.max_tokens, 1200);
});

test("Cloudflare provider accepts chat-completion JSON content", async () => {
  const { extractOutputText } = await providerPromise;
  assert.equal(extractOutputText({ choices: [{ message: { content: '{"ok":true}' } }] }), '{"ok":true}');
});

test("Cloudflare provider fails closed when binding is missing", async () => {
  const { callCloudflareAI } = await providerPromise;
  const result = await callCloudflareAI({
    ai: null, instructions: "system", input: "case", schema: { type: "object" }
  });
  assert.equal(result.ok, false);
  assert.equal(result.errorCode, "provider_not_configured");
});

test("Cloudflare provider rejects malformed model output", async () => {
  const { callCloudflareAI } = await providerPromise;
  const result = await callCloudflareAI({
    ai: { async run() { return { response: "not json" }; } },
    instructions: "system", input: "case", schema: { type: "object" }
  });
  assert.equal(result.ok, false);
  assert.equal(result.errorCode, "provider_malformed_output");
});
