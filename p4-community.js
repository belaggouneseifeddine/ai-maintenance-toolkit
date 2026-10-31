const MAX_PROFILE = { name: 100, title: 120, qualification: 160 };
const SESSION_DAYS = 30;
const ALLOWED_ORIGINS = new Set([
  "https://maintenance-ai-toolkit.pages.dev",
  "https://belaggouneseifeddine.github.io"
]);
const nowIso = () => new Date().toISOString();
const uuid = () => crypto.randomUUID();
function response(data, status, origin) {
  return new Response(JSON.stringify(data), { status, headers: {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "access-control-allow-origin": ALLOWED_ORIGINS.has(origin) ? origin : "null",
    "access-control-allow-methods": "GET, POST, PATCH, OPTIONS",
    "access-control-allow-headers": "Content-Type, Authorization",
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
    if (env.P4_RATE_LIMITER) {
      const key = request.headers.get("cf-connecting-ip") || "unknown";
      const limit = await env.P4_RATE_LIMITER.limit({ key });
      if (!limit.success) return response({ error: "Too many enrollment attempts. Try later." }, 429, origin);
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
