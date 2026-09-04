@AGENTS.md

# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

---

## Project-specific (Sikhi School)

Sikhi School is a free K-12 curriculum platform (worldly subjects + Punjabi + Sikhi), sibling to
[sikhiuni.com](https://sikhiuni.com) (adult self-directed university) and
[sikhi.io](https://sikhi.io) (the Sikh Archive — scripture, VR, Sikhflix). See `docs/` for the
content model, migration notes, and design system as they land.

- **This product serves children under 13 — COPPA is a real, load-bearing constraint, not a
  nicety.** `ParentAccount` is the only directly-authenticating identity; `ChildProfile` is a
  non-authenticating sub-record with no email/phone/address/full DOB — never add a field to
  `ChildProfile` that isn't display name, grade level, or avatar config without stopping to ask.
  No ads, no third-party behavioral tracking, ever, in the kid-facing shells.
- **Accuracy is a release gate**, same as sikhiuni: AI-drafted Sikhi/Punjabi doctrinal or
  historical content ships labeled **"Created by AI"** and routed through `aiReviewStatus`
  (`pending` → `human-reviewed` → `scholar-reviewed`) before it's presented as authoritative.
  Never invent Gurbani Aṅg numbers or citations. Validate AI-authored Gurmukhi text against
  `gurmukhifix`'s `Lexicon("gurmukhi").is_word` before it clears review.
- **Content policy on the Ten Gurus:** never animate or literally depict them in motion/character
  form — symbolic imagery only (light, the Khanda, calligraphic representation, historical-
  painting-style stills). This applies to any illustration, video, or game asset.
- **Santhya Path** (the migrated Gurbani-reading pathway, formerly sikhi.io's "Sikhi School") is a
  stage-based skill progression, not grade-banded — never gate it behind a grade level, only show
  a recommended stage as soft guidance.
- **Every Lesson ships with a Worksheet and a TeacherGuide** — these are first-class, always-free
  content types, not an afterthought. A lesson without a TeacherGuide doesn't meet the platform's
  actual goal (public-school teachers and homeschooling parents teaching from it every day).
- **`standardTags` carries both a versioned WA OSPI code and, for Social Studies/Sikhi content, a
  C3 Framework dimension code** — don't drop the C3 tag on Sikh/Punjab-history content, it's what
  makes that content usable by public-school teachers, not just Sikh families.
- **Everything in v1 is free.** No paywall, no premium tier, no Stripe integration — don't add
  monetization logic unless explicitly asked; it's an intentionally deferred, separate decision.

## Resuming a stale session (DX review finding, 2026-09-04)

If you're a fresh session picking this repo up and `git status` shows uncommitted files,
or `.claude/RESUME.md` references a session ID that isn't yours: a prior session likely
hit a context limit mid-wave and checkpointed without finishing. This has happened at
least once (2026-08-22 → 2026-09-04, 12 days, 5 orphaned lesson files — see
`docs/plans/expansion-plan-2026-09.md` §0/§13 for the full story).

**What to do:**
1. Validate the uncommitted files (they're usually genuine finished work, not garbage —
   e.g. `python3 -c "import json; json.load(open('path'))"` for JSON content, and sanity-check
   the content reads like the rest of that subject/grade's lessons).
2. If valid, commit and open a PR the normal way (branch → PR → CI → auto-merge) — don't
   just leave them sitting. See `docs/CONTENT-AUTHORING.md` for the JSON shape reference.
3. Check the wave pattern in recent git log (`git log --oneline -15`) to infer what
   grade/subject/week the pipeline was on, and continue from there unless a plan doc
   says otherwise.
4. `.claude/RESUME.md`'s session ID is not yours to resume — it's informational only,
   showing what the prior session was doing. You don't need `claude --resume` to continue
   this work; a fresh session with the steps above is sufficient.
