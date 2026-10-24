import test from "node:test";
import assert from "node:assert/strict";
import worker from "../worker.js";

const allowedOrigins = [
  "https://maintenance-ai-toolkit.pages.dev",
  "https://belaggouneseifeddine.github.io"
];

for (const origin of allowedOrigins) {
  test(`preflight allows the configured frontend origin: ${origin}`, async () => {
    const request = new Request("https://api.example.workers.dev/api/chat", {
      method: "OPTIONS",
      headers: {
        Origin: origin,
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "Content-Type"
      }
    });
    const response = await worker.fetch(request, {});
    assert.equal(response.status, 204);
    assert.equal(response.headers.get("access-control-allow-origin"), origin);
    assert.match(response.headers.get("access-control-allow-methods") || "", /POST/);
  });

  test(`health response allows the configured frontend origin: ${origin}`, async () => {
    const request = new Request("https://api.example.workers.dev/health", {
      headers: { Origin: origin }
    });
    const response = await worker.fetch(request, {});
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("access-control-allow-origin"), origin);
  });
}

test("preflight does not grant an unlisted origin", async () => {
  const request = new Request("https://api.example.workers.dev/api/chat", {
    method: "OPTIONS",
    headers: {
      Origin: "https://untrusted.example",
      "Access-Control-Request-Method": "POST"
    }
  });
  const response = await worker.fetch(request, {});
  assert.equal(response.status, 204);
  assert.equal(response.headers.get("access-control-allow-origin"), "null");
});

test("POST from an unlisted origin is rejected before provider access", async () => {
  const request = new Request("https://api.example.workers.dev/api/chat", {
    method: "POST",
    headers: {
      Origin: "https://untrusted.example",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ machine: "pump", symptom: "low flow", language: "en" })
  });
  const response = await worker.fetch(request, {});
  assert.equal(response.status, 403);
  const body = await response.json();
  assert.match(body.error, /Origin not allowed/);
});
