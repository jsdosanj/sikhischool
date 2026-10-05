import test from "node:test";
import assert from "node:assert/strict";
import { safeAudioFallback } from "../src/lib/safe-redirect.ts";

test("allows the recording host and its subdomains over https", () => {
  assert.equal(safeAudioFallback("https://gurmatveechar.com/a/b.mp3"), "https://gurmatveechar.com/a/b.mp3");
  assert.ok(safeAudioFallback("https://media.gurmatveechar.com/x.mp3"));
});
test("rejects other hosts, look-alikes, http, credentials, and junk (no open redirect)", () => {
  for (const bad of ["https://evil.example/x", "https://gurmatveechar.com.evil.example/x", "https://evilgurmatveechar.com/x",
    "http://gurmatveechar.com/x", "https://user:pw@gurmatveechar.com/x", "//evil.example", "javascript:alert(1)", "", null, undefined, "not a url"]) {
    assert.equal(safeAudioFallback(bad), null, String(bad));
  }
});
