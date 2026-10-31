import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { webcrypto } from "node:crypto";

const source = fs.readFileSync(new URL("../p4-community.js", import.meta.url), "utf8")
  .replace("export async function handleCommunityRequest", "async function handleCommunityRequest")
  + "\nglobalThis.__handleCommunityRequest = handleCommunityRequest;";

function harness({ session = true, staging = true, storage = true, batchFails = false } = {}) {
  const writes = [];
  const deletes = [];
  const statements = [];
  const sessionRow = session ? {
    session_id: "session-1", contributor_id: "contributor-1",
    expires_at: "2099-01-01T00:00:00.000Z", display_name: "Test",
    professional_title: "Technician", qualification: null, profile_completed: 1
  } : null;
  const db = {
    prepare(sql) {
      const statement = {
        sql, args: [],
        bind(...args) { this.args = args; return this; },
        async first() { return sql.includes("SELECT s.id AS session_id") ? sessionRow : null; },
        async run() { statements.push({ sql, args: this.args }); return { success: true }; }
      };
      return statement;
    },
    async batch(items) {
      if (batchFails) throw new Error("simulated D1 failure");
      statements.push(...items.map(item => ({ sql: item.sql, args: item.args })));
      return [];
    }
  };
  const env = {
    COMMUNITY_DB: db,
    P4_STAGING_ENABLED: staging ? "true" : "false",
    P4_UPLOAD_RATE_LIMITER: { async limit() { return { success: true }; } }
  };
  if (storage) env.COMMUNITY_FILES = {
    async put(key, value, options) { writes.push({ key, size: value.byteLength, options }); },
    async delete(key) { deletes.push(key); }
  };
  const context = {
    crypto: webcrypto, btoa, TextEncoder, Request, Response, URL,
    Uint8Array, ArrayBuffer, Date, JSON, Set, String, Number, Math,
    console
  };
  vm.runInNewContext(source, context, { timeout: 1000 });
  return { handler: context.__handleCommunityRequest, env, writes, deletes, statements };
}

const origin = "https://maintenance-ai-toolkit.pages.dev";
function uploadRequest(bytes, mime = "application/pdf", requestOrigin = origin) {
  return new Request("https://worker.test/api/community/documents", {
    method: "POST",
    headers: {
      Origin: requestOrigin,
      Authorization: "Bearer " + "a".repeat(48),
      "Content-Type": mime,
      "X-File-Name": "../unsafe/manual.pdf"
    },
    body: bytes
  });
}

test("CORS preflight returns a valid empty 204 response and permits session revocation", async () => {
  const h = harness();
  const request = new Request("https://worker.test/api/community/session", {
    method: "OPTIONS",
    headers: { Origin: origin, "Access-Control-Request-Method": "DELETE" }
  });
  const response = await h.handler(request, h.env);
  assert.equal(response.status, 204);
  assert.equal(await response.text(), "");
  assert.match(response.headers.get("access-control-allow-methods"), /DELETE/);
  assert.match(response.headers.get("access-control-allow-headers"), /X-File-Name/);
});

test("private upload rejects disallowed origins", async () => {
  const h = harness();
  const request = uploadRequest(new TextEncoder().encode("%PDF-1.7"), "application/pdf", "https://attacker.example");
  const response = await h.handler(request, h.env);
  assert.equal(response.status, 403);
});

test("private upload requires a valid server-issued session", async () => {
  const h = harness({ session: false });
  const response = await h.handler(uploadRequest(new TextEncoder().encode("%PDF-1.7")), h.env);
  assert.equal(response.status, 401);
});

test("private upload stays disabled until staging is explicitly enabled", async () => {
  const h = harness({ staging: false });
  const response = await h.handler(uploadRequest(new TextEncoder().encode("%PDF-1.7")), h.env);
  assert.equal(response.status, 404);
  assert.equal(h.writes.length, 0);
});

test("private upload requires a private R2 binding and rate limiter", async () => {
  const h = harness({ storage: false });
  const response = await h.handler(uploadRequest(new TextEncoder().encode("%PDF-1.7")), h.env);
  assert.equal(response.status, 503);
  assert.equal(h.writes.length, 0);
});

test("private upload requires a dedicated rate limiter", async () => {
  const h = harness();
  delete h.env.P4_UPLOAD_RATE_LIMITER;
  const response = await h.handler(uploadRequest(new TextEncoder().encode("%PDF-1.7")), h.env);
  assert.equal(response.status, 503);
  assert.equal(h.writes.length, 0);
});

test("private upload enforces the size limit while streaming", async () => {
  const h = harness();
  const bytes = new Uint8Array(10 * 1024 * 1024 + 1);
  bytes.set(new TextEncoder().encode("%PDF-"));
  const response = await h.handler(uploadRequest(bytes), h.env);
  assert.equal(response.status, 413);
  assert.equal(h.writes.length, 0);
});

test("private upload rejects MIME/signature mismatches before storage", async () => {
  const h = harness();
  const response = await h.handler(uploadRequest(new TextEncoder().encode("not a PDF")), h.env);
  assert.equal(response.status, 415);
  assert.equal(h.writes.length, 0);
});

test("private PDF upload stores a private object and provenance metadata", async () => {
  const h = harness();
  const bytes = new TextEncoder().encode("%PDF-1.7\nminimal test fixture");
  const response = await h.handler(uploadRequest(bytes), h.env);
  assert.equal(response.status, 201);
  const body = await response.json();
  assert.equal(body.document.visibility, "private");
  assert.equal(body.document.processing_status, "uploaded");
  assert.equal(body.document.byte_size, bytes.byteLength);
  assert.match(body.document.sha256, /^[a-f0-9]{64}$/);
  assert.equal(h.writes.length, 1);
  assert.match(h.writes[0].key, /^private\/contributor-1\//);
  assert.equal(h.writes[0].options.httpMetadata.cacheControl, "private, no-store");
  assert.equal(h.statements.length, 3);
  assert.match(h.statements[0].sql, /UPDATE contributor_sessions SET last_seen_at/);
  assert.match(h.statements[1].sql, /INSERT INTO source_documents/);
  assert.match(h.statements[2].sql, /INSERT INTO audit_events/);
});

test("failed D1 metadata transaction removes the uploaded R2 object", async () => {
  const h = harness({ batchFails: true });
  const response = await h.handler(uploadRequest(new TextEncoder().encode("%PDF-1.7")), h.env);
  assert.equal(response.status, 500);
  assert.equal(h.writes.length, 1);
  assert.equal(h.deletes.length, 1);
  assert.equal(h.deletes[0], h.writes[0].key);
});
