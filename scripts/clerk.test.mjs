// Run with: npm run test:auth   (Node's built-in test runner; no extra dependencies)
import test from "node:test";
import assert from "node:assert/strict";
import { verifyClerkToken, emailFor, bearerToken, resetClerkCache } from "../src/lib/clerk.ts";

const ISS = "https://clerk.sikhi.io";
const enc = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
const algo = { name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" };
let pair, jwk;

async function token(claims = {}, { kid = "kid-1", key } = {}) {
  const now = Math.floor(Date.now() / 1000);
  const data = enc({ alg: "RS256", kid }) + "." + enc({ iss: ISS, sub: "user_1", exp: now + 60, email: "Parent@Example.com", ...claims });
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key ?? pair.privateKey, new TextEncoder().encode(data));
  return data + "." + Buffer.from(sig).toString("base64url");
}
test.beforeEach(async () => {
  resetClerkCache();
  pair = await crypto.subtle.generateKey(algo, true, ["sign", "verify"]);
  jwk = { ...(await crypto.subtle.exportKey("jwk", pair.publicKey)), kid: "kid-1", alg: "RS256", use: "sig" };
  globalThis.fetch = async () => new Response(JSON.stringify({ keys: [jwk] }));
});

test("accepts a genuine token and lower-cases the verified email", async () => {
  const claims = await verifyClerkToken(await token());
  assert.equal(claims?.sub, "user_1");
  assert.equal(await emailFor(claims), "parent@example.com");
});
test("rejects expired, wrong-issuer and not-yet-valid tokens", async () => {
  assert.equal(await verifyClerkToken(await token({ exp: Math.floor(Date.now() / 1000) - 120 })), null);
  assert.equal(await verifyClerkToken(await token({ iss: "https://evil.example" })), null);
  assert.equal(await verifyClerkToken(await token({ nbf: Math.floor(Date.now() / 1000) + 600 })), null);
});
test("rejects a token signed by another key, an unknown kid, and alg none", async () => {
  const other = await crypto.subtle.generateKey(algo, true, ["sign", "verify"]);
  assert.equal(await verifyClerkToken(await token({}, { key: other.privateKey })), null);
  assert.equal(await verifyClerkToken(await token({}, { kid: "nope" })), null);
  assert.equal(await verifyClerkToken(enc({ alg: "none", kid: "kid-1" }) + "." + enc({ iss: ISS, sub: "x", exp: 9e9 }) + "."), null);
});
test("no email claim and no secret key means no identity", async () => {
  const claims = await verifyClerkToken(await token({ email: undefined }));
  assert.equal(await emailFor(claims), null);
});
test("falls back to the Clerk Backend API when a secret key is set", async () => {
  const claims = await verifyClerkToken(await token({ email: undefined }));
  globalThis.fetch = async () => new Response(JSON.stringify({ primary_email_address_id: "e1", email_addresses: [{ id: "e1", email_address: "Api@Example.com", verification: { status: "verified" } }] }));
  assert.equal(await emailFor(claims, { CLERK_SECRET_KEY: "sk_test" }), "api@example.com");
});
test("bearerToken parses only well-formed headers", () => {
  assert.equal(bearerToken("Bearer abc.def.ghi"), "abc.def.ghi");
  assert.equal(bearerToken("Basic abc"), null);
  assert.equal(bearerToken(null), null);
});
