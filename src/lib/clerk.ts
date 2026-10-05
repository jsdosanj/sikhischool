// One login for Sikhi.io, Sikhi University and PunjabiUni.
//
// Sikhi.io signs people in with Clerk (clerk.sikhi.io). Clients such as the native Sikhi app send that session
// token as `Authorization: Bearer <jwt>`. We verify it against Clerk's PUBLIC keys (no secret needed), take the
// verified email, and map it to this site's ParentAccount by email. The web magic-link login (NextAuth) is
// unchanged; this is an additional way in. Bearer sessions only ever act as a parent; they never provision a
// teacher account or touch another family's children (those checks live in the routes, keyed off parent.id).

export const CLERK_ISSUER = "https://clerk.sikhi.io";
const JWKS_TTL_MS = 60 * 60 * 1000;
let jwksCache: { at: number; keys: any[] | null } = { at: 0, keys: null };

function b64urlToBytes(s: string): Uint8Array {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (s.length % 4)) % 4);
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
function decodeJson(part: string): any {
  try { return JSON.parse(new TextDecoder().decode(b64urlToBytes(part))); } catch { return null; }
}

export function bearerToken(header: string | null | undefined): string | null {
  const m = (header ?? "").match(/^Bearer\s+([A-Za-z0-9._-]+)$/);
  return m ? m[1] : null;
}

async function loadKeys(env: Record<string, string | undefined>, fresh: boolean): Promise<any[]> {
  if (!fresh && jwksCache.keys && Date.now() - jwksCache.at < JWKS_TTL_MS) return jwksCache.keys;
  const r = await fetch(env.CLERK_JWKS_URL || `${CLERK_ISSUER}/.well-known/jwks.json`, { headers: { Accept: "application/json" } });
  if (!r.ok) throw new Error("jwks " + r.status);
  const body = (await r.json()) as { keys?: any[] };
  jwksCache = { at: Date.now(), keys: Array.isArray(body.keys) ? body.keys : [] };
  return jwksCache.keys!;
}
export function resetClerkCache() { jwksCache = { at: 0, keys: null }; }

export type ClerkClaims = { sub: string; iss: string; exp: number; email?: string; email_verified?: boolean };

/** The verified claims, or null. Never throws. */
export async function verifyClerkToken(token: string, env: Record<string, string | undefined> = {}, now = Date.now()): Promise<ClerkClaims | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const header = decodeJson(parts[0]), payload = decodeJson(parts[1]);
    if (!header || !payload || header.alg !== "RS256" || !header.kid) return null;
    let keys = await loadKeys(env, false);
    let jwk = keys.find((k) => k.kid === header.kid);
    if (!jwk) { keys = await loadKeys(env, true); jwk = keys.find((k) => k.kid === header.kid); }   // key rotation
    if (!jwk) return null;
    const key = await crypto.subtle.importKey("jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
    const ok = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, b64urlToBytes(parts[2]) as BufferSource, new TextEncoder().encode(parts[0] + "." + parts[1]));
    if (!ok) return null;
    const sec = Math.floor(now / 1000);
    if (payload.iss !== (env.CLERK_ISSUER || CLERK_ISSUER) || typeof payload.sub !== "string") return null;
    if (typeof payload.exp !== "number" || payload.exp + 5 < sec) return null;
    if (typeof payload.nbf === "number" && payload.nbf - 5 > sec) return null;
    return payload as ClerkClaims;
  } catch { return null; }
}

/** The verified email: the token's `email` claim if the Clerk session token is customised to carry it, else the Clerk Backend API when CLERK_SECRET_KEY is set. */
export async function emailFor(claims: ClerkClaims, env: Record<string, string | undefined> = {}): Promise<string | null> {
  if (typeof claims.email === "string" && claims.email.includes("@") && claims.email_verified !== false) return claims.email.trim().toLowerCase();
  if (!env.CLERK_SECRET_KEY) return null;
  try {
    const r = await fetch(`https://api.clerk.com/v1/users/${encodeURIComponent(claims.sub)}`, { headers: { Authorization: `Bearer ${env.CLERK_SECRET_KEY}` } });
    if (!r.ok) return null;
    const u = (await r.json()) as any;
    const primary = (u.email_addresses || []).find((e: any) => e.id === u.primary_email_address_id) || (u.email_addresses || [])[0];
    if (!primary || (primary.verification?.status && primary.verification.status !== "verified")) return null;
    return String(primary.email_address || "").trim().toLowerCase() || null;
  } catch { return null; }
}
