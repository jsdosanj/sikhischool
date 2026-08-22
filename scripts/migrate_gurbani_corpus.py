#!/usr/bin/env python3
"""Real, verbatim page-level migration of sikh-archive's production Gurbani
corpus (BaniDB-sourced) into sikhischool's own `scripture_pages` table.

Source: sikh-archive's live `sikhi-io-prod` D1 database (Cloudflare account
751487ee9fad43101841aa2b6aa2c449) — read-only, no writes to that database.
  - sggs_pages(lang, ang, content)         WHERE lang='punjabi'  -> source 'G'
  - scripture_pages(text, lang, page, payload) WHERE text='dasam', lang='punjabi'   -> source 'D'
  - scripture_pages(text, lang, page, payload) WHERE text='sarbloh', lang='punjabi' -> source 'B'

Destination: sikhischool's own D1 database (Cloudflare account
0d4412e40181808b16cce0225ddb5152), table `scripture_pages` (drizzle/schema.ts).
`payload` is copied verbatim (no reshaping) so nothing is lost or altered in
transit — it's the source's own structured JSON (gurmukhi text + line-by-line
Punjabi meaning). This is real scripture text, not AI-generated content; no
aiGenerated/aiReviewStatus flag applies to it.

Idempotent: uses INSERT OR REPLACE keyed on the (source, page_number) unique
index, so re-running is safe.
"""

import json
import os
import subprocess
import sys
import time
import uuid

SOURCE_ACCOUNT = "751487ee9fad43101841aa2b6aa2c449"
SOURCE_DB = "f7872c23-d2e6-426f-9f7f-4c1a6f7f267e"
DEST_ACCOUNT = "0d4412e40181808b16cce0225ddb5152"
DEST_DB = "1ccc6190-dab9-45f0-a31e-ff88a9b43de0"

TOKEN = subprocess.run(
    ["bash", "-c", "grep -i oauth_token ~/.wrangler/config/default.toml | cut -d'\"' -f2"],
    capture_output=True, text=True, check=True,
).stdout.strip()

import urllib.request
import urllib.error


def d1_query(account_id, db_id, sql, params=None, retries=4):
    url = f"https://api.cloudflare.com/client/v4/accounts/{account_id}/d1/database/{db_id}/query"
    body = {"sql": sql}
    if params is not None:
        body["params"] = params
    data = json.dumps(body).encode("utf-8")
    req = urllib.request.Request(
        url, data=data, method="POST",
        headers={"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"},
    )
    for attempt in range(retries):
        try:
            with urllib.request.urlopen(req, timeout=60) as resp:
                out = json.loads(resp.read())
                if not out.get("success"):
                    raise RuntimeError(f"D1 query failed: {out.get('errors')}")
                return out["result"][0]["results"]
        except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError) as e:
            if attempt == retries - 1:
                raise
            print(f"  retry {attempt+1}/{retries} after error: {e}", file=sys.stderr)
            time.sleep(2 * (attempt + 1))


# (source_table_kind, source_filter, source_code, section_id, page_count)
JOBS = [
    ("sggs_pages", None, "G", "section-sggs"),
    ("scripture_pages", "dasam", "D", "section-dasam"),
    ("scripture_pages", "sarbloh", "B", "section-sarbloh"),
]

BATCH = 15  # keeps bound params (BATCH * 5) safely under D1's per-statement variable limit


def fetch_batch(kind, text_filter, offset, limit):
    if kind == "sggs_pages":
        sql = "SELECT ang as page, content as payload FROM sggs_pages WHERE lang='punjabi' ORDER BY ang LIMIT ? OFFSET ?"
        return d1_query(SOURCE_ACCOUNT, SOURCE_DB, sql, [str(limit), str(offset)])
    else:
        sql = "SELECT page, payload FROM scripture_pages WHERE text=? AND lang='punjabi' ORDER BY page LIMIT ? OFFSET ?"
        return d1_query(SOURCE_ACCOUNT, SOURCE_DB, sql, [text_filter, str(limit), str(offset)])


def insert_batch(rows, source_code, section_id):
    if not rows:
        return
    placeholders = ", ".join(["(?, ?, ?, ?, ?)"] * len(rows))
    sql = (
        "INSERT OR REPLACE INTO scripture_pages (id, section_id, source, page_number, payload) "
        f"VALUES {placeholders}"
    )
    params = []
    for row in rows:
        params.extend([str(uuid.uuid4()), section_id, source_code, str(row["page"]), row["payload"]])
    d1_query(DEST_ACCOUNT, DEST_DB, sql, params)


def main():
    total_migrated = 0
    for kind, text_filter, source_code, section_id in JOBS:
        offset = 0
        migrated = 0
        print(f"=== {source_code} ({section_id}) ===")
        while True:
            rows = fetch_batch(kind, text_filter, offset, BATCH)
            if not rows:
                break
            insert_batch(rows, source_code, section_id)
            migrated += len(rows)
            offset += BATCH
            print(f"  {source_code}: {migrated} pages migrated (offset {offset})")
        print(f"{source_code} done: {migrated} pages")
        total_migrated += migrated

    print(f"\nTotal pages migrated: {total_migrated}")


if __name__ == "__main__":
    main()
