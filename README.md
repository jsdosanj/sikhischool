# Sikhi School

A free K-12 curriculum — worldly subjects (math, ELA, science, social studies), Punjabi, and
Sikhi — for kids grades K-12. Sibling to [sikhiuni.com](https://sikhiuni.com) (adult
self-directed university) and [sikhi.io](https://sikhi.io) (the Sikh Archive — scripture, VR,
Sikhflix).

**Status: Wave 0 scaffold.** Full plan (naming, architecture decisions, phased waves) lives
outside this repo for now; see `CLAUDE.md` for the load-bearing project-specific constraints
(COPPA, the AI-content accuracy gate, the Ten Gurus content policy) that apply to every
contribution here.

## Stack

- Next.js (App Router) + TypeScript, deployed to Cloudflare Workers via OpenNext
- Cloudflare D1 (SQLite) via Drizzle ORM — own database, separate from sikhiuni's
- Cloudflare R2 for media
- Auth.js (NextAuth v4), magic-link email via Resend — `ParentAccount`/`TeacherAccount` are the
  only directly-authenticating identities; `ChildProfile` never authenticates directly
- Content is authored into staged JSON by parallel subagent waves, same pattern as sikhiuni's
  200+-course catalog — no CMS

## Local dev

```
npm install
cp .dev.vars.example .dev.vars   # fill in RESEND_API_KEY, NEXTAUTH_SECRET
npm run db:migrate:local          # apply the schema to a local D1 simulation
npm run dev
```

## Deploy

```
npm run cf:deploy
```

Migrations against the real D1 database are a manual step, same convention as sikhiuni:

```
npx wrangler d1 execute sikhischool --remote --file=./drizzle/migrations/<file>.sql
```

## Santhya Path migration

`scripts/migrate-santhya-path.ts` is a read-only export pass against a local clone of
`redroyals/sikh-archive` (expects it at `~/Documents/Github/sikh-archive`, override with
`SIKH_ARCHIVE_PATH`) that produces `data/santhya-path-migration.json` — the source dataset for
rebuilding the migrated Gurbani-reading pathway natively on this stack. See the comments at the
top of that script for what it does and doesn't do yet.
