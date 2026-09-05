# Sikhi School — deferred work

Tracked here per gstack CEO-review convention: nothing deferred is silently forgotten.

## From the 2026-09 expansion plan CEO review (`docs/plans/expansion-plan-2026-09.md`)

- **Scoped AI "Ask for Help" companion** — COPPA-safe, answers grounded only in the current
  lesson's content, no open-ended chat, no memory of the child. Deferred (not cut) because it
  needs its own safety/threat-model pass and the plan's riskier infra bets (games engine,
  dictionary, premium design system) should prove out on the Spanish vertical slice first.
  Revisit as its own reviewed mini-plan after Phase 1 (Spanish slice) ships.

- **Stand up a test framework (vitest recommended for this Next.js/TS stack)** — the repo
  currently has zero automated tests. The new auto-merge/auto-deploy pipeline
  (docs/plans/expansion-plan-2026-09.md §14) works around this by requiring a human look
  at anything touching `drizzle/`, `src/app/api/`, or `.github/workflows/` — but that's a
  stopgap, not a fix. Priority: at minimum, cover the games-engine ownership check, the
  speaking-prompt client-ephemeral-audio rule, and the mastery-points-never-decreases
  invariant before those paths are trusted to auto-merge unattended.

- **Cloudflare Workers preview/staging deploys** — `deploy.yml` ships straight to
  production on merge to main. Cloudflare Workers supports preview deployments per-PR;
  wiring that in would let a PR's actual deploy artifact get eyes-on before it's live,
  closing the "first real test of deployability is production" gap the eng review
  outside-voice pass flagged. Real workstream, not a one-line fix.

- **Site chrome outside the lesson shells still runs the old saffron/navy brand tokens**
  (2026-09-05, A2-A5 implementation). DESIGN.md's real values now live in the `[data-shell]`
  system (`src/app/globals.css`), which covers `/courses/*` (course/lesson/pacing-guide pages)
  and the games engine — since the existing six subjects render through this same shared
  shell system, they picked up the new look "for free," which is a good outcome, not scope
  creep past what A2 intended (the shells were always meant to be one shared system). What's
  genuinely still on the old identity: `/dashboard`, `/login`, `/santhya-path/*`, and
  `/teacher/dashboard` — 16 files reading `--color-saffron`/`--color-navy` directly rather
  than the shell tokens. Bringing those onto DESIGN.md is real, separate work (these pages
  don't go through `Shell.tsx` at all today) worth its own approved pass, not a mechanical
  find-replace.

- **Dark-mode toggle across all three shells** (2026-09-05, A2-A5 implementation). No
  `prefers-color-scheme`-aware toggle exists yet. `sikhi-school-studio` adopted DESIGN.md's
  actual dark-theme token values as its fixed identity (it already had a fixed dark look
  pre-DESIGN.md); `little-sparks`/`rising-school` ship the light tokens as theirs. A real
  toggle that lets any of the three shells flip light/dark on the visitor's preference is a
  genuine follow-on — see DESIGN.md's Decisions Log (2026-09-05 entries) for the reasoning.
