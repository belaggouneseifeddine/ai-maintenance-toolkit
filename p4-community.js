const MAX_PROFILE = { name: 100, title: 120, qualification: 160 };
const SESSION_DAYS = 30;
const ALLOWED_ORIGINS = new Set([
  "https://maintenance-ai-toolkit.pages.dev",
  "https://belaggouneseifeddine.github.io"
]);
const nowIso = () => new Date().toISOString();
const uuid = () => crypto.randomUUID();
function response(data, status, origin) {
  return new Response(status === 204 ? null : JSON.stringify(data), { status, headers: {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "access-control-allow-origin": ALLOWED_ORIGINS.has(origin) ? origin : "null",
    "access-control-allow-methods": "GET, POST, PATCH, DELETE, OPTIONS",
    "access-control-allow-headers": "Content-Type, Authorization, X-File-Name",
    "vary": "Origin"
  }});
}
function validText(value, max, required=false) {
  return typeof value === "string" && value.length <= max && (!required || value.trim().length > 0);
}
function normalizeProfile(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  const displayName = typeof input.display_name === "string" ? input.display_name.trim() : "";
  const professionalTitle = typeof input.professional_title === "string" ? input.professional_title.trim() : "";
  const qualification = typeof input.qualification === "string" ? input.qualification.trim() : "";
  if (!validText(displayName, MAX_PROFILE.name, true) ||
      !validText(professionalTitle, MAX_PROFILE.title, true) ||
      !validText(qualification, MAX_PROFILE.qualification)) return null;
  return { display_name: displayName, professional_title: professionalTitle, qualification: qualification || null };
}
async function sha256(value) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map(x => x.toString(16).padStart(2, "0")).join("");
}
function randomToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
async function getSession(request, db) {
  const header = request.headers.get("Authorization") || "";
  const match = /^Bearer ([A-Za-z0-9_-]{40,80})$/.exec(header);
  if (!match) return null;
  const hash = await sha256(match[1]);
  const now = nowIso();
  const row = await db.prepare(`
    SELECT s.id AS session_id, s.contributor_id, s.expires_at,
           c.display_name, c.professional_title, c.qualification, c.profile_completed
    FROM contributor_sessions s JOIN contributors c ON c.id=s.contributor_id
    WHERE s.token_sha256=? AND s.revoked_at IS NULL AND s.expires_at>? AND c.status='active'
  `).bind(hash, now).first();
  if (row) await db.prepare("UPDATE contributor_sessions SET last_seen_at=? WHERE id=?").bind(now, row.session_id).run();
  return row || null;
}
async function parseJson(request) {
  const length = Number(request.headers.get("content-length") || 0);
  if (length > 4096) return null;
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).length > 4096) return null;
    return JSON.parse(raw);
  } catch { return null; }
}
export async function handleCommunityRequest(request, env) {
  const url = new URL(request.url);
  const origin = request.headers.get("Origin") || "";
  if (!url.pathname.startsWith("/api/community/")) return null;
  if (request.method === "OPTIONS") return response({ ok: true }, 204, origin);
  if (!ALLOWED_ORIGINS.has(origin)) return response({ error: "Origin not allowed." }, 403, origin);
  if (!env.COMMUNITY_DB) return response({ error: "Community staging database is not configured." }, 503, origin);

  if (url.pathname === "/api/community/enroll" && request.method === "POST") {
    if (env.P4_STAGING_ENABLED !== "true") return response({ error: "Staging enrollment is disabled." }, 404, origin);
    if (!env.P4_RATE_LIMITER) return response({ error: "Staging enrollment rate limiter is not configured." }, 503, origin);
    const key = request.headers.get("cf-connecting-ip") || "unknown";
    const limit = await env.P4_RATE_LIMITER.limit({ key });
    if (!limit.success) return response({ error: "Too many enrollment attempts. Try later." }, 429, origin);
    if (!(request.headers.get("content-type") || "").toLowerCase().includes("application/json")) {
      return response({ error: "Content-Type must be application/json." }, 415, origin);
    }
    const profile = normalizeProfile(await parseJson(request));
    if (!profile) return response({ error: "Name and professional title are required; fields exceed allowed lengths or are invalid." }, 400, origin);
    const contributorId = uuid(), sessionId = uuid(), token = randomToken();
    const created = nowIso();
    const expires = new Date(Date.now() + SESSION_DAYS * 86400000).toISOString();
    const hash = await sha256(token);
    try {
      await env.COMMUNITY_DB.batch([
        env.COMMUNITY_DB.prepare(`INSERT INTO contributors
          (id,display_name,professional_title,qualification,profile_completed,status,created_at,updated_at)
          VALUES (?,?,?,?,1,'active',?,?)`).bind(contributorId, profile.display_name, profile.professional_title, profile.qualification, created, created),
        env.COMMUNITY_DB.prepare(`INSERT INTO contributor_sessions
          (id,contributor_id,token_sha256,created_at,expires_at,last_seen_at)
          VALUES (?,?,?,?,?,?)`).bind(sessionId, contributorId, hash, created, expires, created),
        env.COMMUNITY_DB.prepare(`INSERT INTO audit_events
          (id,actor_contributor_id,action,target_type,target_id,metadata_json,created_at)
          VALUES (?,?,'profile.enrolled','contributor',?,'{}',?)`).bind(uuid(), contributorId, contributorId, created)
      ]);
    } catch (error) {
      return response({ error: "Could not create staging profile.", code: "enrollment_failed" }, 500, origin);
    }
    return response({ profile: { id: contributorId, ...profile, self_declared: true }, session_token: token, expires_at: expires }, 201, origin);
  }

  const session = await getSession(request, env.COMMUNITY_DB);
  if (!session) return response({ error: "A valid staging session is required." }, 401, origin);

  if (url.pathname === "/api/community/documents" && request.method === "POST") {
    if (env.P4_STAGING_ENABLED !== "true") return response({ error: "Staging uploads are disabled." }, 404, origin);
    if (!env.COMMUNITY_FILES) return response({ error: "Private community file storage is not configured." }, 503, origin);
    if (!env.P4_UPLOAD_RATE_LIMITER) return response({ error: "Staging upload rate limiter is not configured." }, 503, origin);
    const rateKey = "upload:" + session.contributor_id;
    const limit = await env.P4_UPLOAD_RATE_LIMITER.limit({ key: rateKey });
    if (!limit.success) return response({ error: "Upload limit reached. Try later." }, 429, origin);

    const allowedTypes = new Set(["application/pdf", "image/jpeg", "image/png", "image/webp"]);
    const mime = (request.headers.get("Content-Type") || "").split(";")[0].trim().toLowerCase();
    if (!allowedTypes.has(mime)) return response({ error: "Only PDF, JPEG, PNG, and WebP files are accepted." }, 415, origin);
    const sizeHeader = request.headers.get("Content-Length");
    const declaredSize = sizeHeader === null ? null : Number(sizeHeader);
    const maxBytes = 10 * 1024 * 1024;
    if (declaredSize !== null && (!Number.isSafeInteger(declaredSize) || declaredSize <= 0 || declaredSize > maxBytes)) {
      return response({ error: "File must be between 1 byte and 10 MiB." }, 413, origin);
    }
    const filename = (request.headers.get("X-File-Name") || "upload").replace(/[\\/\\\\\\u0000-\\u001f\\u007f]/g, "_").slice(0, 180);
    const reader = request.body?.getReader();
    if (!reader) return response({ error: "Upload body is missing." }, 400, origin);
    const chunks = [];
    let totalBytes = 0;
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        totalBytes += value.byteLength;
        if (totalBytes > maxBytes) {
          await reader.cancel();
          return response({ error: "File exceeds the 10 MiB limit." }, 413, origin);
        }
        chunks.push(value);
      }
    } catch {
      try { await reader.cancel(); } catch {}
      return response({ error: "Could not read uploaded file." }, 400, origin);
    }
    if (totalBytes === 0 || (declaredSize !== null && declaredSize !== totalBytes)) {
      return response({ error: "File size is invalid or does not match Content-Length." }, 413, origin);
    }
    const fileData = new Uint8Array(totalBytes);
    let offset = 0;
    for (const chunk of chunks) { fileData.set(chunk, offset); offset += chunk.byteLength; }
    const bytes = fileData.buffer;
    const data = fileData;
    const starts = (...values) => values.every((value, index) => data[index] === value);
    const signatureValid =
      (mime === "application/pdf" && data.length >= 5 && String.fromCharCode(...data.slice(0, 5)) === "%PDF-") ||
      (mime === "image/jpeg" && data.length >= 3 && starts(0xff, 0xd8, 0xff)) ||
      (mime === "image/png" && data.length >= 8 && starts(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) ||
      (mime === "image/webp" && data.length >= 12 && String.fromCharCode(...data.slice(0, 4)) === "RIFF" && String.fromCharCode(...data.slice(8, 12)) === "WEBP");
    if (!signatureValid) return response({ error: "File content does not match the declared type." }, 415, origin);

    const digest = await crypto.subtle.digest("SHA-256", bytes);
    const sha256Hex = [...new Uint8Array(digest)].map(x => x.toString(16).padStart(2, "0")).join("");
    const documentId = uuid();
    const objectKey = "private/" + session.contributor_id + "/" + documentId;
    const created = nowIso();
    try {
      await env.COMMUNITY_FILES.put(objectKey, bytes, {
        httpMetadata: { contentType: mime, cacheControl: "private, no-store" },
        customMetadata: { sha256: sha256Hex, contributorId: session.contributor_id, documentId }
      });
      await env.COMMUNITY_DB.batch([
        env.COMMUNITY_DB.prepare(`INSERT INTO source_documents
          (id,owner_contributor_id,original_filename,mime_type,byte_size,sha256,r2_object_key,visibility,rights_confirmed,processing_status,created_at,updated_at)
          VALUES (?,?,?,?,?,?,?,'private',0,'uploaded',?,?)`)
          .bind(documentId, session.contributor_id, filename || "upload", mime, bytes.byteLength, sha256Hex, objectKey, created, created),
        env.COMMUNITY_DB.prepare(`INSERT INTO audit_events
          (id,actor_contributor_id,action,target_type,target_id,metadata_json,created_at)
          VALUES (?,?,'document.uploaded','source_document',?,?,?)`)
          .bind(uuid(), session.contributor_id, documentId, JSON.stringify({ mime_type: mime, byte_size: bytes.byteLength, visibility: "private" }), created)
      ]);
    } catch {
      try { await env.COMMUNITY_FILES.delete(objectKey); } catch {}
      return response({ error: "Document could not be stored. No document record was created." }, 500, origin);
    }
    return response({
      document: { id: documentId, filename, mime_type: mime, byte_size: bytes.byteLength, sha256: sha256Hex, visibility: "private", processing_status: "uploaded", created_at: created }
    }, 201, origin);
  }

  if (url.pathname === "/api/community/profile" && request.method === "GET") {
    return response({ profile: {
      id: session.contributor_id, display_name: session.display_name,
      professional_title: session.professional_title, qualification: session.qualification,
      profile_completed: !!session.profile_completed, self_declared: true
    }}, 200, origin);
  }
  if (url.pathname === "/api/community/profile" && request.method === "PATCH") {
    const profile = normalizeProfile(await parseJson(request));
    if (!profile) return response({ error: "Invalid profile. Name and professional title are required." }, 400, origin);
    const now = nowIso();
    await env.COMMUNITY_DB.batch([
      env.COMMUNITY_DB.prepare(`UPDATE contributors SET display_name=?,professional_title=?,qualification=?,profile_completed=1,updated_at=? WHERE id=?`)
        .bind(profile.display_name, profile.professional_title, profile.qualification, now, session.contributor_id),
      env.COMMUNITY_DB.prepare(`INSERT INTO audit_events (id,actor_contributor_id,action,target_type,target_id,metadata_json,created_at)
        VALUES (?,?,'profile.updated','contributor',?,'{}',?)`).bind(uuid(), session.contributor_id, session.contributor_id, now)
    ]);
    return response({ profile: { id: session.contributor_id, ...profile, self_declared: true } }, 200, origin);
  }
  if (url.pathname === "/api/community/session" && request.method === "DELETE") {
    const now = nowIso();
    await env.COMMUNITY_DB.prepare("UPDATE contributor_sessions SET revoked_at=? WHERE id=?").bind(now, session.session_id).run();
    return response({ ok: true, revoked: true }, 200, origin);
  }
  return response({ error: "Community endpoint not found." }, 404, origin);
}
