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

- **Existing six-subjects lesson-surface redesign** — Workstream A's premium design system
  (docs/plans/expansion-plan-2026-09.md §2 A1) is scoped to Phase 0/1's new surfaces (Spanish
  slice, games, dictionary) only. Applying that same design system to the six existing
  subjects' already-shipped lesson/worksheet/teacher-guide pages is a mechanical follow-on
  once A1 ships — not a Phase 1 blocker, but real work worth its own approved pass so the
  whole product reads as one coherent premium system, not two eras of design bolted together.
