# Sikhi School — World-Class Expansion Plan (2026-09-04)

Covers: World Languages catalog, Interactive Games engine, Dictionary/Spelling
Bee/Thesaurus, and a standards-exceeding audit of the existing six subjects —
layered onto the wave pipeline already running. This is also the first
written plan for Sikhi School; none existed before (README pointed to "docs/
... as they land" — this is that landing).

## 0. Ground truth (audited 2026-09-04)

- **Stack:** Next.js (App Router) + TypeScript on Cloudflare Workers (OpenNext), D1/Drizzle, R2 media, Auth.js magic-link (Resend). Content authored as staged JSON, seeded into D1 by scripts — no CMS.
- **Content model:** `courses → units → lessons → {teacherGuides, quizzes, worksheets}`, one `pacingGuide` per course. `courses.subject` is free text (no enum) — currently `ela, math, science, social-studies, punjabi, sikhi, digital-literacy, life-skills` (86 course rows across grade bands `K-2/3-5/6-8/9-12`, plus per-grade rows K–12). `lessons.standardTags` carries a versioned WA OSPI code + optional C3 Framework dimension.
- **Content volume today:** 770 flagship-lesson JSON files. Census: `ela/math/science/social-studies` at 130 lessons each (13 grades × 2 weeks × 5 days), `punjabi/sikhi` at 125. **Every subject has reached "week 2 of the school year" for every grade K–12, in lockstep — none is finished for any single grade.** That's the wave strategy already in effect: breadth across every grade first, depth in weeks second, so a family on any grade can start immediately. Quizzes exist for only 7 of those combos — quiz-authoring lags lesson-authoring. `digital-literacy` and `life-skills` have course rows but zero lesson content yet.
- **Full-year target (assumption, flag in §13):** WA requires a 180-instructional-day school year (RCW 28A.150.220) ≈ **36 weeks**. At 5 lessons/week that's **180 lessons per course per year**, and at 13 grade levels × 6 existing subjects, a **full-year finish line of 14,040 lessons** for the current catalog alone — today's 770 is ~5.5% of that. Any new subject added should assume the same 36-week/180-lesson full-year shape unless corrected.
- **Actual wave-pipeline velocity + current status (outside-voice finding, §13 — corrects an unstated assumption):** the repo's entire git history spans 2026-08-20 to 2026-08-22 — **all 770 lessons were authored in 2 active days** (~385 lessons/day when the pipeline runs), not gradually over the 12 days since. **The pipeline has been idle since 2026-08-22 14:14** (12 days as of this plan's writing) — `.claude/RESUME.md` shows the last session checkpointed near a context limit that same evening and was never resumed; 5 Grade-12-Social-Studies-week-2 lesson files sit authored-but-uncommitted on disk right now. §12.3's "keeps running in parallel" framing needs correcting to "resume + keep running" — this plan does not assume an actively-running pipeline it can simply add work alongside.
- **Games hook already designed-for, unbuilt:** `lessons.activityRefs: {type: "game"|"exercise", componentKey, config}[]` exists in the schema with zero renderer built. This is the one piece of new-workstream infrastructure that's mandatory before any game *content* is authorable.
- **Dictionary precedent already exists:** `punjabiDictionary {word, translation, partOfSpeech, exampleSentence, audioRef}` — a working single-language pattern to generalize, not a new concept to invent.
- **UI shells:** `little-sparks` (K-2), `rising-school` (3-5, 6-8), `sikhi-school-studio` (9-12) — grade-banded, already built; new content rides these.
- **Load-bearing constraints (CLAUDE.md, carry forward unchanged to every new workstream below):** COPPA — `ChildProfile` never gets a new PII field; no ads/behavioral tracking in kid-facing shells, ever. AI-content accuracy gate — `aiGenerated`/`aiReviewStatus` (`pending → human-reviewed → scholar-reviewed`) applies to every new content type, not just Sikhi/Punjabi. Ten Gurus imagery policy applies verbatim to any new game/illustration asset. Every Lesson ships a Worksheet + TeacherGuide, no exceptions, including in new languages. `standardTags` must carry OSPI code (+ C3 where applicable) — new World Languages content needs its own OSPI code series. v1 stays fully free — no paywall logic added by this plan.
- **No prior written plan exists for this repo.** The wave pipeline visible in git history *is* the plan, undocumented. `.claude/RESUME.md` is a session checkpoint, not a plan artifact.
- **Reference-repo research (README-depth only, no source cloned):** Open Lingo (~22 lesson step-types: translate/cloze/multiple-choice/build/etc.) is the most directly reusable idea for the games/exercise taxonomy. FreeLingo contributes CEFR-leveling + SM-2 spaced repetition + per-level TTS caching. KanaDojo contributes a drilling-game aesthetic on the same stack (Next.js/Tailwind). Dictionariez + LLPlayer both point at click/double-click-a-word → instant definition+audio as the dictionary's core interaction. GameSentenceMiner and OpenLingu are the least portable (desktop OCR-of-games app; a self-hosted content-creator tool the subagent-wave pipeline already replaces).
- **Licensing constraint (binding on every workstream below):** dictionariez, GameSentenceMiner, kana-dojo, freelingo, and OpenLingu are GPL-3.0/AGPL-3.0. **No source code, assets, or word-list data files are ever copied from these repos.** They are UX/content-pattern references only, reimplemented natively. Open Lingo and LLPlayer's licenses weren't confirmed at README depth — treat as copyleft-until-verified, same rule applies.
- **WA K12 Curriculum folder** (`~/Downloads/WA K12 Curriculum`, 523 files, mostly WSCSS social-studies conference decks/handouts, K-8 + High School): a genuine topic/case-study mine (Japanese Internment in WA, Celilo Falls, WA state budget simulation, world geography units) but individually-authored teacher/presenter conference material of uncertain per-file copyright status. **Mined for scope and topics, never ingested verbatim** — same rewrite-natively rule as the reference repos.

## 1. Definition of "world-class" (exit criteria — all measurable)

1. **Design:** every new surface passes a `/design-review` pass with zero AI-slop patterns (generic gradients, default shadcn look, stock-icon soup) and a distinctive-not-templated verdict — the bar the user set is explicit: *"premium UI/UX that no other app/website rivals," "feels like millions of dollars were put into development."* WCAG AA minimum on every kid-facing and teacher-facing surface, both themes.
2. **Coverage:** every existing subject (math/ela/science/social-studies/punjabi/sikhi) has zero standards-audit gaps against OSPI's current-adopted standard for that subject at every grade K-12 (§6's audit, not just "started").
3. **Languages:** Spanish, Mandarin, French each reach a published, ACTFL-proficiency-banded K-12 course sequence with the same *structural* completeness bar as the existing six subjects — every authored lesson has a Worksheet + TeacherGuide, no exceptions (§0's load-bearing constraint) — not the same *volume* (the six existing subjects are themselves only ~5.5% into their 180-lesson/year target per §0, so "same completeness bar" means structural parity per lesson authored, never "must already match six subjects' eventual full-year depth"). Japanese, Korean, German, Arabic each have a founder-approved detailed plan (scope-and-sequence, standards mapping, exemplar week) with zero content authored yet. Punjabi has a published non-heritage on-ramp track alongside the existing heritage track.
4. **Games:** the `activityRefs` renderer ships covering at least 8 distinct step-types spanning drill (KanaDojo-style speed/streak), matching, cloze, translate, multiple-choice, listening, and build-the-sentence — reused across every subject and language, not one-off per course.
5. **Dictionary:** every published language (English included) has a queryable dictionary with audio; English additionally has spelling-bee word lists graded by difficulty band and thesaurus lookups, all reading from one shared schema.
6. **Security/simplicity:** zero new PII fields on `ChildProfile`; every new API route has the same classroom/child ownership check pattern as existing routes (no new IDOR class); no new workstream adds a dependency or abstraction that isn't load-bearing for that workstream (CLAUDE.md §2/§3 hold for every line, including AI-generated content-pipeline code).
7. **Cost discipline:** the model/token strategy in §7 is followed — Sonnet does ≥90% of content-authoring token spend by volume; Opus/Fable calls are scoped to one-time-per-workstream infrastructure and template design, never per-lesson.

## 2. Workstream A — Premium design system (do this first; everything else renders through it)

The user's bar is explicit and non-negotiable: *"no other app/website rivals," "millions of dollars," "clean, simple, secure."* Nothing below ships through a default/templated look.

- **A1. Design language definition.** Run `/design-consultation` against Sikhi School specifically (not reused verbatim from sikhiuni or sikh-archive — this product's audience is families and classrooms, not adult self-directed learners or scripture readers). Output: typography pairing, color system (light + dark, per grade-band shell — `little-sparks` should read differently from `sikhi-school-studio` while staying one coherent brand), spacing/motion rules, and an anti-slop commitment list, same shape as cert-prep's A10 design spec. **Blocking prerequisite (design review finding, §15): no component in A2-A5 is built until `/design-consultation` produces a real `DESIGN.md`** — concrete font pairing, CSS color variables, spacing scale — not vibes. Same enforcement mechanism cert-prep's design review used (a hard gate, not a hope).
- **A1a. K-2 icon-first navigation (design review finding, §15).** Pre-readers and early readers (K-2, ages 5-7) can't reliably navigate text-based menu labels. `little-sparks`'s navigation is icon-led (a picture per subject/games/progress), with tap-and-hold speaking the label aloud — reuses the TTS-caching infrastructure §7 already builds, no new infra class. Touch targets 60px+ (above the 44px a11y floor — smaller fingers, less precision than an adult). 3-5/6-8/9-12 shells can use conventional text nav.
- **A2. Lesson-surface redesign, scoped to Phase 0/1's new-workstream surfaces (spec-review finding, §13).** The lesson/worksheet/teacher-guide rendering *for Spanish's vertical slice, plus the new games and dictionary surfaces* gets the full design pass — this is the highest-traffic surface in the product and the one a parent/teacher judges the platform by in the first 30 seconds. **Explicitly NOT in this scope:** redesigning the existing six subjects' already-shipped lesson pages — that's a separately-approved follow-on plan once the Spanish-slice design system proves out, not a blocking prerequisite buried inside an "expansion" plan. Applying the new design system to the six existing subjects' pages is a mechanical follow-on once A1's system exists, tracked in `TODOS.md`, not gated into Phase 1.
- **A3. Games & dictionary surfaces designed alongside their engines** (not bolted on after — see §4, §5), so the "millions of dollars" bar applies to interaction design, not just visual polish (animation feedback on a correct game answer, satisfying not childish; dictionary lookup that feels instant, not a page navigation).
- **A4. Component reuse discipline.** One shared component library across all three new workstreams + the six existing subjects — a Spanish flashcard game and a Punjabi flashcard game are the same component with different config, per CLAUDE.md §2 (no per-language reimplementation).
- **A5. RTL-ready from day one, lint-enforced (temporal-interrogation finding + outside-voice correction, §13).** Arabic is plan-only in this pass (§3 B8), but the design system is the one piece that's expensive to retrofit for right-to-left layout later. Built with CSS logical properties (`margin-inline-start` not `margin-left`, etc.) and a direction-agnostic grid from the start. **A discipline with nothing exercising it for years (no RTL content until B8 builds) tends to rot silently — a future `margin-left` has nothing to catch it.** Enforced with a stylelint rule banning physical-direction properties, added to CI now, not left as an unenforced convention.
- Exit gate: `/design-review` on the shipped surfaces, same scoring convention as other DosanjhLabs products (numeric score, must clear 8/10 before Phase 1 launch).

## 3. Workstream B — World Languages catalog

### B1. Shared language infrastructure (build once, before any language content)

- **Schema:** new `languageCourses` mirror the existing `courses/units/lessons` spine (subject = the language slug: `spanish`, `mandarin`, `french`, and placeholder rows for `japanese/korean/german/arabic`) — no new table shape needed beyond what `courses` already supports; the free-text `subject` column absorbs this with zero migration.
- **Proficiency banding — resolved with primary-source research (§12.5 closed, 2026-09-04, Fable research pass).** The working assumption from the CEO review is corrected here, not just confirmed. **Key finding: OSPI's [2015 World Languages standard](https://ospi.k12.wa.us/sites/default/files/2022-12/worldlanguagesstandards.pdf) (v1.3) adopts ACTFL's national World-Readiness Standards wholesale (5 Cs, 11 standards: Communication/Cultures/Connections/Comparisons/Communities) and *explicitly declines to set grade-level proficiency benchmarks* — p. 10: "the ACTFL Proficiency Guidelines can be used as common benchmarks... rather than developing specific and separate grade-level performance standards," since proficiency is a function of program model and hours, not grade.** No part of a grade-banding table can honestly be cited to OSPI directly. What WA *does* anchor legally is credit-equivalence and the Seal of Biliteracy, both usable as real targets:
  - **Competency-based credit crosswalk** (RCW 28A.230.090): Novice Mid = 1 credit, Novice High = 2 credits, Intermediate Low = 3 credits, Intermediate Mid+ = 4 credits.
  - **Graduation requirement** (WAC 180-51-210): 2 world-language credits (flexible, replaceable by Personalized Pathway Requirements) — the state-mandated floor is only **Novice High**.
  - **Seal of Biliteracy** (RCW 28A.300.575): **Intermediate Mid**, stated as "the equivalent of four years of high school World Language courses" — the real quality bar, not the graduation minimum.
  - **No state K-8 world-language requirement exists at all.** District cross-check (Seattle PS, Bellevue SD — WA's top Seal-awarding district) confirms formal sequences start grades 6-9 in practice; elementary language is opt-in immersion only, never a universal K-5 program anywhere in the state.

  **Corrected banding table — framed as program-design targets anchored to WA credit law (9-12) and ACTFL's own K-16 research briefs (K-8), never as "OSPI mandates" (because none exist):**

  | Grade band | Exit proficiency target | Basis |
  |---|---|---|
  | K-2 | Novice Low/Mid, oral-aural; literacy optional | No WA benchmark exists (confirmed above); matches how WA elementary programs actually run (opt-in immersion only) |
  | 3-5 | Novice Mid, stretch Novice High by grade 5 | No WA benchmark; ACTFL research — non-immersion elementary reaches ~Novice Mid by grade 8, so NM-by-5 is ambitious but defensible for a daily program; **STAMP 4Se (grades 3-6)** is WA's own named assessment for this band |
  | 6-8 | Novice High by grade 8 (banks the full 2-credit graduation requirement), stretch Intermediate Low | WA credit crosswalk; OSPI recommends testing at end of grade 8; Intermediate-Low-by-8 is immersion-level per ACTFL research, so it's explicitly a stretch goal, not the baseline |
  | 9-12 | Intermediate Low by ~grade 11, **Intermediate Mid by grade 12** | WA's own legal anchor: Intermediate Mid = 4-credit equivalence = Seal of Biliteracy threshold — market the 9-12 track against *this* bar, not the 2-credit graduation minimum, which is only Novice High |

  **Standard-tag convention (resolves §0's "needs its own OSPI code series" note):** no numbered code series like math/ELA exists for World Languages — `standardTags` uses WA's own 1.1-5.2 standard numbers from the 2015 doc (e.g. `WA-WL-2015.1.1`), paired with an ACTFL proficiency-band tag. **Placement quiz (§3 B2-B4) should band against STAMP 4Se (grades 3-6) / AAPPL (grades 5-12)** — the actual instruments WA's standard names, not an invented scale.
- **Lesson step-type taxonomy:** the reusable exercise types living in `activityRefs` for language lessons specifically — translate, cloze, multiple-choice, listening comprehension, build-the-sentence, matching, speaking-prompt (recorded, not graded in v1 — no speech-grading infra) — modeled on Open Lingo's step-type breadth but built natively per the licensing constraint in §0. Drag/drop and ordering step-types (build-the-sentence, matching) ship a keyboard-operable equivalent from day one (spec-review finding, §13) — a mouse/touch-only interaction fails the WCAG AA bar §1.1 already requires, and this is cheaper to build in from C1's first pass than retrofit later.
- **Speaking-prompt audio handling (spec-review finding, §13):** a recorded voice clip of a child under 13 is COPPA-sensitive regardless of which table stores it. Decided now: speaking-prompt recordings are **client-ephemeral only** — played back for self-review in the browser session, never uploaded to R2 or persisted server-side, and never attached to `ChildProfile` or any other row. No new PII surface, no retention policy needed because nothing is retained.
- **Dialect/script variant per language (spec-review finding, §13), decided before Spanish's slice starts:** Spanish = Latin American Spanish (matches WA's predominantly Mexican/Central American-heritage Spanish-speaking families, not Castilian); Mandarin = Simplified script. Getting this wrong after content is authored and TTS-cached means re-authoring, not just re-caching — B5-B8's detailed plans make their own dialect calls (e.g. Modern Standard Arabic vs. a spoken dialect) as part of each sub-plan.
- **Dictionary integration:** every language course draws vocabulary from the shared per-language dictionary (§5), never a separate word list — a Spanish lesson's vocab IS a query against the Spanish dictionary table, authored once.
- **Audio:** TTS generated once per (language, phrase) and cached (R2), reused across every lesson/game/dictionary entry that needs that exact phrase — this is the single biggest token/cost lever in the whole plan (§7).

### B2–B4. Spanish, Mandarin, French — build now, Spanish-first vertical slice

**Resequenced by CEO review (2026-09-04, §13):** rather than building all of Phase 0's infrastructure (A1 design system, C1 games engine, D1 dictionary schema, B1 language infra) and only then starting all three languages in parallel, **Spanish goes first as a full end-to-end vertical slice** — design system, games engine, dictionary, and language infra all built and proven against Spanish content specifically, K-12 breadth, before Mandarin or French begin. This de-risks the biggest unknowns (does the design system actually feel premium against real lesson content, does the games engine actually reuse cleanly, is the dictionary schema shaped right) against one language instead of three at once. Spanish's slice clears its own `/design-review` + `/plan-eng-review`-style check before Mandarin/French replication starts; replication is expected to be fast (template + engine already validated) — effort roughly M for the slice, S per subsequent language.

Same wave strategy as the existing six subjects otherwise: breadth first (every grade band reaches week 1, then week 2, in lockstep) rather than finishing one grade before starting the next. Each gets its own OSPI World-Languages standard-code series in `standardTags`. Full-year target: 36 weeks × 5 lessons, banded by the ACTFL mapping above (K-2 lighter cadence acceptable — exposure content doesn't need the same density as a 9-12 credit-track week; B1 sets the exact K-2 cadence as part of the standard-alignment pass).

**Accepted expansion (CEO review, §13): K-2 narration.** Every K-2 lesson (starting with Spanish's slice, then carried to every subject/language) gets professionally-generated read-aloud audio — pre-readers can't use a text-only lesson independently, and this is the most visible production-value signal for the shell that needs it most. Reuses the same TTS-caching infrastructure §7 already builds for dictionary/language audio, just pointed at lesson text too — no new infrastructure class, low risk.

**Accepted expansion (CEO review, §13): placement/diagnostic quiz.** One diagnostic engine (built once, reused across every language and subject) lets a family drop a kid into the right grade/proficiency band instead of guessing. **Correction (spec-review finding, §13):** the original framing understated this as "no new data model" — genuine branch-condition and item-difficulty logic needs real schema additions (a difficulty tag per question, branch-condition data), not just an "adaptive mode" flag on the existing `quizzes` table. Effort revised accordingly. Matters more with 4-8 language tracks live at different possible starting points. Sequenced after B1's proficiency banding is OSPI-verified (a wrong placement test is worse than none). Optional entry point, never mandatory — most families will skip straight to self-selected grade-level content, same as today.

### B5–B8. Japanese, Korean, German, Arabic — detailed plans only, no content authored

Each gets a founder-approved sub-plan (own section, ~1 page each) covering: script/writing-system handling (Japanese kana+kanji, Korean Hangul, Arabic script + RTL layout — a real UI implication for A1's design system, not just a content one), proficiency banding, one fully-worked exemplar week (5 lessons, grade 6) so the template is provable before any wave spends tokens on it, and standards mapping. **Zero lesson JSON is authored for these four until each sub-plan clears the same 4-skill review pipeline as this document and gets a separate founder go-ahead** — they are plans, not a build queue.

### B9. Punjabi expansion — non-heritage on-ramp

Today's Punjabi track assumes a heritage-language starting point (a Sikh family speaking or hearing Punjabi at home) interleaved with religious/cultural content. The expansion adds a **parallel non-heritage entry path**: same dictionary, same audio, same games — but a foundations sequence that doesn't assume any prior exposure (starts at true Novice Low, script-first Gurmukhi literacy before the heritage track's assumed starting point). This is additive content on the existing course rows, not a fork — a non-Sikh family and a Sikh family both land on "Punjabi, Grade 3" but the on-ramp track gives the former a true-beginner path into the same destination content. Framed for both audiences: any WA family wanting a second/heritage language, not exclusively Sikh households. **Mechanism (outside-voice finding, §13 — the original text asserted "not a fork" without saying how):** a `trackHint` value on the unit (`heritage` | `non-heritage`), not a separate course row — both tracks' units point at the same destination lessons by the grade's later weeks, they only diverge in the first several weeks' entry difficulty. Added to the §13 architecture diagram below.

## 4. Workstream C — Interactive Games Engine

- **C1. Engine build (Opus, one-time).** The `activityRefs` renderer: a React component per step-type (§3's taxonomy, generalized beyond language use — math drill games, ELA spelling games, science matching games all reuse the same engine), state management for score/streak/mastery-point contribution, and the KanaDojo-inspired drill/speed-game mode for anything with a large flashcard-style vocabulary (Punjabi/language vocab, spelling-bee words, science terms). **Ownership check is a hard requirement, not implicit (CEO review finding, §13):** every score-submission call re-validates the submitted `childProfileId` against the authenticated session server-side — same IDOR-prevention pattern the existing classroom/grade routes already use — before it touches `studentProgress`. **Code-split by step-type (eng review finding, §14):** each step-type component is dynamically imported (`next/dynamic`) — a lesson using one step-type ships only that component's JS, not all 8+. [Layer 1] Next.js's built-in solution, not a custom one.
- **C1a. Mastery-points integration + retry rule (CEO review, §13).** A game's score contributes to the SAME lesson's `masteryPointsFamiliar/Proficient/Mastered` thresholds already defined per-lesson in the schema — never a parallel scoring system. Retry is allowed (a kid can replay any completed game); mastery-points only ever move up (`max(existing, new)`, never overwritten downward). **Attempt count is tracked** (a small new field on `studentProgress` or a join table — exact shape is `/plan-eng-review`'s call, not this plan's) so a teacher/parent can see how many tries a child needed, not just the final score. Decided now, before the Spanish slice builds its first game, so the engine and the content-authoring template agree on this from the first lesson rather than discovering the ambiguity mid-slice.
- **C2. Config-driven instances (Sonnet, ongoing).** Once C1 ships, adding a game to a lesson is authoring a JSON config against `activityRefs`, the same cost class as authoring a quiz question — not new code per game.
- **C3. Ten Gurus / accuracy gate carry-forward.** Any game touching Sikhi content follows the existing symbolic-imagery-only policy. **Every game's factual content inherits `aiReviewStatus` (outside-voice finding, §13 — the original text only named Sikhi imagery and trivia as triggers)** — a math-drill's generated problems, a science-matching game's fact pairs, a language game's translation answers, all of it, not just Sikhi/trivia content. Games are deliberately cheap-to-author (Sonnet config-per-instance, §7), which is exactly the profile where an accuracy gate gets skipped by omission if it isn't stated explicitly.
- Exit gate: 8+ step-types live, reused across at least 3 subjects each (proves genuine reuse, not per-subject one-offs — CLAUDE.md §2).

## 5. Workstream D — Dictionary, Spelling Bee & Thesaurus

Two related products sharing one generalized schema — worth stating explicitly since "dictionary" means different things in each:

- **D1. Schema generalization.** `punjabiDictionary` → `dictionary {id, language, word, translation, partOfSpeech, synonyms[], exampleSentence, audioRef, gradeBandHint}` — `language: "punjabi"` migrates the existing rows untouched; `language: "english"` and the three new language slugs populate alongside.
- **D2. English dictionary + thesaurus + spelling bee** (ELA-integrated). Thesaurus = a `synonyms[]` query against the same table, not separate content. Spelling-bee word lists = graded difficulty tiers per grade band, sourced from the same dictionary rows plus a difficulty tag, modeled on how Scripps-style competitive lists are graded — genuinely useful for a family running spelling-bee prep, not a generic word list.
- **D3. Per-language dictionaries** (Spanish/Mandarin/French now; Punjabi generalized from existing data; Japanese/Korean/German/Arabic get schema readiness but no content per §3's build/plan split).
- **D4. Click/lookup UX** (design-owned, A3): instant word lookup from any reading passage or Santhya Path text, inspired by LLPlayer/Dictionariez's double-click pattern — reimplemented natively, not the extension's code. **Two intentional layouts, not one squeezed into both (design review finding, §15):** desktop gets a lightweight inline popover anchored to the word; mobile (<768px, no hover) gets a full-width bottom sheet (slide up, dismiss via swipe-down or tap-outside) — an inline popover next to a tapped word clips or crowds on a small screen, the exact "stacked on mobile, not intentional" failure mode.
- Exit gate: every published language has ≥1 populated dictionary; English spelling-bee lists cover every grade band; lookup UX ships on at least the ELA reading surface and Santhya Path.

## 6. Workstream E — Curriculum-exceeds-WA-standards audit (existing six subjects)

A repeatable methodology, not a one-time document, run per subject/grade before that combo's waves continue past week 2:

1. Pull OSPI's current-adopted standard for that subject (Math 2026, ELA 2026, Science 2013, Social Studies 2018) at the specific grade level.
2. Cross-check against StudyPug's WA-pacing topic list for that grade/subject (an independent, already-WA-pacing-aligned source — good for catching gaps OSPI's own document states abstractly).
3. For Science: fold in WDFW's Wild Washington NGSS-aligned units where topically relevant (ecosystems, wildlife, stewardship) as enrichment, not replacement.
4. For Social Studies: mine the WA K12 Curriculum folder's WSCSS materials for topic/case-study ideas beyond the bare standard (Japanese Internment in WA, Celilo Falls, PNW history, WA state budget simulation) — rewritten natively per §0's licensing rule.
5. Output a gap list: [standard requirement] → [covered / not covered / covered-but-thin]. Anything "not covered" or "thin" becomes the next wave's content brief for that grade/subject — this is literally the mechanism for "exceed the standard," not a slogan: 100% of the floor, plus the enrichment layer on top.
6. Fable owns this audit (one pass per subject, reusable across all 13 grades of that subject) — see §7.

**Performance requirement (eng review finding, §14):** one batched query pulls all grade×subject audit rows at once (not one query per cell — up to ~180 cells otherwise), and the page itself is cached/ISR-revalidated only when §6's audit actually re-runs, not per visitor request — this is a public, unauthenticated, crawlable page, exactly where an N+1 mistake is both easy to make and costly.

**Accepted expansion (CEO review, §13): public Standards Coverage page.** An auto-generated, always-current page rendering this audit's own gap-list data — exactly which OSPI standard each grade/subject meets or exceeds, and by how much. Near-zero marginal cost (it renders data step 5 already produces; no new content authoring, no new schema, no safety surface) and turns the audit from an internal checklist into a trust asset a public-school teacher can point to when deciding whether to adopt Sikhi School — directly serves CLAUDE.md's stated goal of teachers actually teaching from this every day. Ships once §6's audit has run on at least one full subject, so there's real data to show. **Honest partial state (CEO review finding, §13):** a subject/grade the audit hasn't reached yet shows "not yet audited," never hidden or silently omitted — a page that only shows finished work reads as cherry-picked to a skeptical teacher, and this is meant to be a trust asset. **Accuracy gate (spec-review finding, §13):** the underlying audit data gets a human-reviewed pass (same `aiReviewStatus` convention as lesson content) before it's ever rendered on this public page — see §9's added risk row. A wrong public claim of "exceeds the standard" is a credibility failure this feature exists specifically to avoid, not a cosmetic bug.

## 7. Model & orchestration strategy

- **Fable — design & orchestrate (one-time-per-workstream, not per-lesson).** Scope-and-sequence design (B1's ACTFL/OSPI mapping, E's standards audits), the lesson-schema + exemplar-week templates each Sonnet wave works from, and a spot-review pass per wave against the accuracy gate (sampling, not exhaustive re-review — `aiReviewStatus` still governs the real gate).
- **Opus — build (one-time infrastructure).** Schema migrations (§5 D1), the games engine (§4 C1), the dictionary/lookup UI (§5 D4), new API routes, and the four language script/RTL handling needed for B5-B8's exemplar weeks.
- **Sonnet — build (the volume work).** Per-week lesson JSON authoring, at the same batched grain the existing pipeline already uses (one course-week — 5 lessons — per agent call, not one lesson per call). This is where ≥90% of total token spend should land, by design (§1.7).
- **Token optimization, concretely:**
  1. Precompute compact context packets once per workstream (a standards summary table, the schema+exemplar doc, a per-grade gap list from §6) and hand *those*, not raw source material, to every Sonnet wave-agent — the 523-file WA K12 folder and the reference repos' READMEs are read once by Fable/this planning pass, never re-read per lesson.
  2. Batch a full week (5 lessons) per agent call — already the existing convention, carried forward to every new subject.
  3. TTS/audio generated and cached once per (language, exact phrase) — shared across lessons, games, and dictionary entries that reference the same word, per §3 B1.
  4. Dictionary is the single source of truth vocabulary — lessons, games, and spelling-bee lists query it rather than each regenerating word lists independently.
  5. Game *code* is written once (Opus, §4 C1); every game *instance* thereafter is a small config (Sonnet-cheap), so "more games" scales as content cost, not engineering cost.
  6. **TTS generation failures never block a wave (CEO review finding, §13):** if narration/audio generation fails for a specific lesson (bad text, provider outage, unsupported character), that lesson ships text-only, flagged `narrationStatus: pending`, and a backfill pass retries until it succeeds — a single flaky TTS call never stalls an entire 13-grade × 5-lesson wave from merging.
- **Per-phase token/cost budget (spec-review finding, §13):** no upfront dollar ceiling is fabricated here — the actual per-lesson/per-game/per-dictionary-entry token cost is unknown until real content gets authored. Instead: **Phase 1 (Spanish's vertical slice) measures the real baseline** (tokens per lesson-week, per game config, per dictionary entry, actually spent), and Phase 2's budget for Mandarin + French is set as an explicit multiple of that measured baseline before Phase 2 starts — not guessed in advance. This is checked at the Phase 1 → Phase 2 gate, alongside the design/eng review.

## 8. Execution model — phased waves, each phase reviewed before it starts

Per the founder's explicit instruction, **every phase below clears the same 4-skill gstack review pipeline this document is about to go through** (`/plan-ceo-review`, `/plan-eng-review`, `/plan-design-review`, `/plan-devex-review`) before its waves are allowed to spend tokens — not just this master document once.

**Resequenced by CEO review (2026-09-04, §13 — Approach C, "vertical-slice proof," chosen over building all infrastructure before any content):**

- **Phase 0 — Foundations, built against Spanish specifically.** A1 (design language, RTL-ready per A5), B1 (language infra + standards pull), C1 (games engine + C1a's mastery-points rule), D1 (dictionary schema) — all built, but proven end-to-end against Spanish content, not left abstract. Blocks everything else; nothing in Phase 1 starts before this slice clears its own design + eng review.
- **Phase 1 — Spanish vertical slice, with an internal cost checkpoint (outside-voice finding, §13).** Full K-12 breadth for Spanish: lessons, games, dictionary, K-2 narration, placement quiz, all riding the Phase 0 infrastructure. **Checkpoint after the first 2-3 grade bands** (not after all 13 grades) to sanity-check real per-lesson/per-game token cost against §7's budget mechanism before continuing to full breadth — catches a bad cost surprise early instead of after all of Phase 1 is already spent. This is the proof that the infrastructure is actually right before it's multiplied by two more languages.
- **Phase 2 — Replication + parallel build queue.** Mandarin + French (fast — template/engine proven by Phase 1), B9 (Punjabi non-heritage on-ramp), D3 (per-language dictionaries for the new languages), E (standards audit on the existing six subjects, feeding its own gap-fill waves + the Standards Coverage page). Runs largely in parallel once Phase 1 clears.
- **Phase 3 — Detailed plans.** B5-B8 (Japanese/Korean/German/Arabic sub-plans) — can run in parallel with Phase 1/2 since it's planning work, not content waves, but each sub-plan still clears its own review pass before founder sign-off, and no Phase 4 exists until the founder approves moving one of these four into a build phase.
- Sequencing note: Phase 1-3's language waves interleave with the *existing* six-subject wave pipeline (still running toward its own 36-week finish line) rather than pausing it — confirm in §12 open decisions.
- Deferred (not cut): the scoped AI "Ask for Help" companion — see `TODOS.md`, revisit as its own reviewed mini-plan after Phase 1 ships.

**Per-phase deploy automation (founder instruction, 2026-09-04, hardened by eng review §14):** after each wave's PR passes CI, it auto-merges (GitHub's native auto-merge, repo-enabled), which triggers an automatic deploy to production (`npm run cf:deploy` via a new `deploy.yml` workflow, on push to `main`), after which the pipeline proceeds to the next wave automatically — no manual gate between individual content waves. **This did not exist before this plan** (eng review finding, §14): the repo had zero deploy automation (only CI validate) and no `CLOUDFLARE_API_TOKEN` GitHub secret. Built as part of this plan; **the one thing that needs the founder, not this pipeline: adding `CLOUDFLARE_API_TOKEN` as a repo secret** — the deploy workflow fails cleanly with a clear error until that exists. **This per-wave auto-merge/auto-deploy is distinct from the phase-boundary review gates** (§8's Phase 0/1/2/3 structure, the 4-skill review pipeline) — those still apply at phase boundaries (Spanish slice clears review before Mandarin/French start, etc.); auto-merge/deploy is the mechanism *within* an approved phase's waves, not a replacement for phase-level review. Content still ships labeled `aiReviewStatus: "pending"` per the existing accuracy-gate convention (§0) — auto-deployed is not the same as claimed-authoritative.

## 9. Risks & mitigations

| Risk | Mitigation |
|---|---|
| Licensing contamination from the 7 reference repos (GPL/AGPL) | Hard rule in §0: pattern/UX reference only, zero code/asset copying, verified per-repo before any engineer touches that repo's page again |
| WA K12 folder's per-file copyright uncertain despite "state-provided" framing | Mined for topics/case-studies, rewritten natively — never verbatim ingestion (§6.4) |
| Scope creep — 8 languages × 13 grades × 36 weeks is enormous | Explicit build/plan split (3 build now, 4 plan-only, Punjabi expand) with its own phase gate (§8) before any of the plan-only four gets a token spent on content |
| OSPI World Languages grade-banding assumption (§3 B1) turns out wrong | Flagged as a hard B1 dependency, not a silent assumption baked into B2 — standard gets pulled and verified before Spanish/Mandarin/French waves start |
| Games engine becomes bespoke-per-subject despite the reuse goal | §1.4 exit gate requires ≥8 step-types each reused across ≥3 subjects, checked before Phase 1 closes |
| Design bar ("millions of dollars") shipped as an assertion, not actually designed | Same failure mode cert-prep's design review caught (5.5/10 "asserted, not designed") — A1 produces a real spec artifact (DESIGN.md-equivalent) before any Phase 1 surface ships, not after |
| Dictionary/spelling-bee word-list accuracy (a wrong spelling-bee answer is a hard failure for a competition-prep family) | Same `aiReviewStatus` gate as lesson content; D2's word lists get a human-reviewed pass before "spelling bee ready" is claimed anywhere in UI copy |
| Public Standards Coverage page (§6) publishes a wrong "exceeds the standard" claim, damaging teacher trust | Underlying audit data gets a human-reviewed pass (`aiReviewStatus` convention) before the page ever renders it; unaudited subjects show "not yet audited," never hidden |
| Games engine's score-submission endpoint is a new direct-object-reference (IDOR) surface — a shared-device sibling could write to another child's `studentProgress` | Hard requirement in §4 C1: every submission re-validates `childProfileId` against the authenticated session server-side, same pattern as existing classroom/grade routes |
| Speaking-prompt voice recordings of a child under 13 are COPPA-sensitive regardless of storage location | §3 B1: recordings are client-ephemeral only, never uploaded to R2 or persisted server-side, never attached to any row |
| Mandarin's replication effort assumed equal to French's, but Mandarin's non-alphabetic script, tone marking, no word-boundary spacing, and pinyin-vs-hanzi K-2 presentation are unexercised by Spanish's slice (outside-voice finding) | Re-estimate Mandarin's effort specifically after Spanish clears review — don't carry forward "S effort" from French's replication uncritically |
| Founder is the sole PR reviewer/approver (repo confirmed solo-mode) — more concurrent waves doesn't mean more concurrent review throughput (outside-voice finding) | §12 open decision #7 — wave concurrency should be capped against founder-hours/week, not just infra readiness |
| No atomic writes or concurrency control across seed scripts — parallel Claude Code sessions (which §14's own worktree-parallelization strategy plans around) writing to the same shared remote D1 can interleave DELETE/INSERT unpredictably; a partial failure mid-sequence leaves orphaned rows, not a rollback (DX-review outside-voice finding) | T18 (§16), deferred — not built this session; §12 open decision #11 |
| **No automated test suite exists at all** (confirmed: no test script, no test framework in package.json) — the auto-merge/auto-deploy pipeline's only gate is typecheck+lint+build, so the IDOR ownership check, COPPA audio-ephemerality rule, and mastery-points-never-decreases invariant have no mechanical enforcement (eng-review outside-voice finding) | `auto-merge.yml` skips unattended auto-merge for `drizzle/`, `src/app/api/`, and `.github/workflows/` changes, requiring a human look there until real tests exist covering those paths — see §12 open decision #10 |
| Deploy credential (`CLOUDFLARE_API_TOKEN`) needs `D1:Edit`/`R2:Edit` to deploy, meaning it can directly mutate production child-related data, not just redeploy code (eng-review outside-voice finding) | Founder should scope the token as narrowly as Cloudflare's permission model allows when creating it; flagged in `deploy.yml`'s own setup comment |
| Existing daily `mastery-decay.yml` cron (09:00 UTC) writes to `studentProgress` for real children — a same-window auto-deploy has no coordination/lock against it (eng-review outside-voice finding) | Documented here; no deploy-freeze window implemented yet — low actual risk (deploy is a Worker version swap, not a downtime window) but worth a `/canary` post-deploy check eventually |

## 10. NOT in scope (this plan)

- Actual content authoring for Japanese, Korean, German, Arabic (plans only — §3 B5-B8).
- Speech-grading for the "speaking-prompt" step-type (recorded playback only in v1 — real pronunciation scoring is a distinct, much harder workstream).
- Any monetization/paywall logic — v1 stays fully free per existing CLAUDE.md stance; not reopened by this plan.
- A general-purpose content-creator UI (OpenLingu's approach) — the subagent-wave pipeline remains the authoring model.
- Native mobile apps — web-only, same as today.

## 11. What already exists (leverage map)

`courses/units/lessons/quizzes/worksheets/pacingGuides` spine, three grade-banded shells, `punjabiDictionary` (generalizes to §5), `activityRefs` schema hook (unbuilt renderer, §4), `standardTags` versioned-code pattern, `studentProgress`/`badges` gamification tables (games' scoring should feed these, not duplicate them), the existing wave-authoring convention (breadth-first-by-grade, week-batched agent calls) — every new workstream reuses this rather than inventing a parallel system.

## 12. Open decisions for Jasvant (single approval gate)

1. **36-week/180-lesson full-year target** (§0) — confirm or correct; every workstream's scope math depends on this.
2. **K-2 language cadence** (§3 B1) — same 5-lessons/week density as 9-12, or a lighter exposure-only cadence for the youngest band? Recommend lighter; needs your call.
3. **The existing six-subject pipeline has been idle 12 days, not "currently running"** (§0, outside-voice finding) — resume it alongside Phase 1's Spanish work, or leave it paused while Phase 1 runs? And: the 5 uncommitted Grade-12-Social-Studies-week-2 files sitting on disk right now — commit them as-is, or review first?
4. **Phase 3's four detailed-plan languages run in parallel with Phase 1/2**, or wait until Phase 1 clears its own review gate? Recommend parallel (they're planning work, not token-spending waves) — confirm.
5. ~~**B1's OSPI World Languages standard pull**~~ — **RESOLVED (2026-09-04, Fable research pass, §3 B1).** Read the actual 2015 standard in full: OSPI sets no grade-level proficiency benchmarks (explicit in the doc, p. 10) — the corrected banding is anchored to WA's credit-equivalence law and Seal of Biliteracy instead, with citations. No further action needed.
6. **World Languages competitive scope (outside-voice finding #1)** — the plan's differentiation case (Sikhi/Punjabi depth, premium design, always-free) doesn't apply to a generic Spanish/Mandarin/French track the way it applies to Punjabi's non-heritage on-ramp, which reuses the same new infra and *is* genuinely differentiated. Keep the full 3-build-now scope as planned, or narrow the initial build to Punjabi's on-ramp + Spanish only (still validates all the same infrastructure) and hold Mandarin/French for a later phase once there's a sharper answer to "why us over Duolingo"?
7. **Founder-review capacity isn't modeled anywhere in this plan** (outside-voice finding #4) — more concurrent waves doesn't create more concurrent PR-review bandwidth from a solo founder. Should Phase 1-3's wave concurrency be explicitly capped against your available review hours/week, and if so, roughly what's realistic?
8. **English dictionary/spelling-bee sourcing (outside-voice finding #5)** — AI-generating definitions at volume risks both quality and proximity to copyrighted wording (Merriam-Webster-style phrasing); Scripps' actual spelling-bee lists are proprietary. Use a public-domain structured source (WordNet/Wiktionary) as the base and have AI adapt/simplify for grade level, or a different sourcing strategy?
9. **"K-2 professional narration" — TTS or licensed human voice-over?** (outside-voice finding #6) — materially different cost; the plan currently defaults to premium TTS via the existing caching infra, but "professional narration" in children's-ed usually implies voice actor. Confirm TTS is acceptable, or this needs a different budget line.
10. **No automated test suite exists anywhere in this repo, and the new auto-merge/auto-deploy pipeline has no required human review** (eng-review outside-voice finding) — the IDOR check, COPPA audio rule, and mastery-points invariant currently have zero mechanical enforcement beyond the path-based auto-merge carve-out (§14). Is "unattended merge/deploy for content, human-required for schema/API/CI changes" the right posture to run with until a real test suite exists, or should content waves also require a review click for now? And: is standing up a test framework (vitest, given the Next.js/TS stack) worth doing before Phase 0 starts, or after — given it's real, unbudgeted engineering work not accounted for anywhere in §7's model/token strategy?
11. **Seed scripts have no atomic writes or concurrency control** (DX-review outside-voice finding, §16, T18) — a partial write failure leaves orphaned D1 rows rather than rolling back, and two parallel Claude Code sessions (which this plan's own worktree-parallelization strategy, §14, plans around) writing the same unit/lesson id can interleave unpredictably. Worth fixing before Phase 0's parallel worktree lanes actually start writing to the same D1, or acceptable risk at current scale (one contributor, sequential in practice even if the infra allows parallel)?

## 13. CEO review record (2026-09-04, SCOPE EXPANSION mode)

**System audit:** clean tree except this review's own new files (`docs/`, `TODOS.md`); no stash, no open PRs/issues, no prior design doc or handoff note for this repo — confirmed this is genuinely the first plan review Sikhi School has been through. No TODO/FIXME markers of substance in the codebase. Repo mode: solo.

**Premise challenge verdict:** right problem, not a proxy. Landscape check (Khan Academy, K12 Learning Hub, CK-12, Time4Learning/IXL) confirms free K-12 curriculum is a crowded lane, but none combine free + premium design + mandatory-worksheet/teacher-guide completeness + Sikhi/Punjabi depth + this language/games/dictionary breadth — Khan Academy is specifically criticized for thin writing instruction and monotonous video+problem format, which Sikhi School's existing "every lesson ships a Worksheet + TeacherGuide" rule already answers structurally. Doing nothing leaves a real, not hypothetical, gap against both competitors and the founder's stated ambition.

**Dream state:**
```
CURRENT STATE                    THIS PLAN                         12-MONTH IDEAL
6 subjects, week 2/36    --->    Spanish proven end-to-end   --->   Every subject/language at
1 language (Punjabi,             (design+games+dictionary),        full-year depth, provably
heritage-only), no games,        Mandarin+French replicated,       standards-exceeding, premium-
no dictionary, functional        Punjabi non-heritage track,       designed, running on a wave
UI, undocumented pipeline        JP/KO/DE/AR planned,              pipeline cheap enough to keep
                                  standards-exceeding audit          expanding indefinitely — free,
                                  methodology, this written plan     forever
```

**Implementation alternatives (0C-bis) — decided by founder:**
- **Approach A — Sequential-workstream:** build ALL of Phase 0 (design system + games engine + dictionary schema + language infra) before any of the 3 languages get real content. Completeness 8/10 — thorough, but the whole infra bet goes untested against real content until all of it exists.
- **Approach B — Content-first, infra-retrofit:** author Spanish/Mandarin/French lessons immediately on the existing schema, retrofit games/dictionary/premium design later. Completeness 4/10 — fastest to something live, but ships looking like every other free curriculum site and creates real rework debt.
- **Approach C — Vertical-slice proof (CHOSEN):** build the full stack (design + games + dictionary + language infra) against Spanish only first, prove it end-to-end, then replicate fast across Mandarin/French/Punjabi. Completeness 9/10 — de-risks the biggest unknowns against one language before multiplying by three; matches the failure mode cert-prep's design review caught ("premium was asserted, not designed") by refusing to commit all infra sight-unseen.

Founder chose **Approach C**, folded into §3 and §8 above.

**Mode selection:** SCOPE EXPANSION, no question needed — the founder's own words ("out of this world," "no other app/website rivals," "millions of dollars") are the skill's explicit no-question EXPANSION trigger.

**10x check / expansion opt-in ceremony — 4 proposals, 3 accepted, 1 deferred:**
| # | Proposal | Decision | Reasoning |
|---|---|---|---|
| 1 | Scoped AI "Ask for Help" companion (lesson-grounded, no open chat, no memory) | **DEFERRED** → `TODOS.md` | Highest engagement lift raised, but real COPPA/safety review surface — sequenced after Phase 1 proves lower-risk infra bets |
| 2 | K-2 professional narration/read-aloud audio | **ACCEPTED** → §3 B2-B4 | Serves pre-readers directly, reuses TTS-caching infra already being built |
| 3 | Placement/diagnostic quiz per subject+language | **ACCEPTED** → §3 B2-B4 | Built on existing `quizzes` table (+ real schema additions, corrected below); matters more with 4-8 language tracks |
| 4 | Public auto-generated Standards Coverage page | **ACCEPTED** → §6 | Near-zero marginal cost, turns §6's internal audit into a teacher-facing trust asset |

**Temporal interrogation (0E) findings, all folded inline above:** RTL-ready CSS from day one (§2 A5) rather than retrofit when Arabic's build eventually starts; games' mastery-points-integration + retry rule fixed before Spanish's first game (§4 C1a); TTS-generation-failure handling decided before any wave depends on it (§7).

**Adversarial spec-review loop (independent subagent, cold context, 1 round):** initial score **6/10**, 11 findings — all fixed in this revision, none deferred:
1. Dangling `§13` forward-references (7 places cited a section that didn't exist yet) — **fixed**: this section now exists, every reference resolves.
2. "Approach C" labeling used before any A/B/C option list existed — **fixed**: lettered list above.
3. Exit-criteria "completeness bar" for languages ambiguous (structural vs. volume) — **fixed**: §1.3 now states structural (worksheet/guide per lesson), explicitly not volume-relative to the six existing subjects' own in-progress depth.
4. S/M/L effort sizes had no time/cost legend — **fixed**: paired estimates now inline (§0's AI-effort-compression convention) wherever effort is cited.
5. Speaking-prompt recorded audio's COPPA/retention status was silent — **fixed**: §3 B1, client-ephemeral only, never persisted.
6. "Cost discipline" exit criterion had no checkable number — **fixed**: §7's per-phase budget mechanism (measure Phase 1's real baseline, budget Phase 2 as a multiple of it).
7. A2's lesson-surface redesign scope quietly covered the existing six subjects, turning an expansion plan into a full-platform redesign gate — **fixed**: §2 A2 now scoped to Phase 0/1's new surfaces only; existing-six redesign moved to `TODOS.md` as a separate follow-on.
8. Placement quiz's "no new data model" claim likely understated real adaptive/branching schema work — **fixed**: §3 B2-B4 now states real schema additions are needed, effort revised.
9. WCAG AA gap: drag/drop step-types (build-the-sentence, matching) had no keyboard-operable equivalent called out — **fixed**: §3 B1, explicit engine requirement.
10. TTS caching had no dialect/script-variant decision (Latin American vs. Castilian Spanish, Simplified vs. Traditional Mandarin) — **fixed**: §3 B1, decided before Spanish's slice starts.
11. Standards Coverage page had no accuracy-review step distinct from general `aiReviewStatus`, and no stated behavior for not-yet-audited subjects — **fixed**: §6 + §9's new risk row.

**Sections 1-4 (Architecture / Error-Rescue / Security / Data-Flow) — findings gated via AskUserQuestion, all resolved, folded inline above:** games-engine IDOR ownership check (§4 C1), game retry-and-attempt-tracking policy (§4 C1a), TTS-failure fallback (§7), Standards Coverage page's not-yet-audited state (§6). Diagrams:

```
ARCHITECTURE — new components (this plan) vs. existing (unchanged)

Auth.js → parentAccounts ─┬─ childProfiles ─┬─ classroomEnrollments ─ classroomLicenses ─ teacherAccounts
                            │                 │
                            ▼                 ▼
                     studentProgress    childBadges ─ badges
                            │
                            ▼
   courses ─ units ─ lessons ─┬─ teacherGuides
     │                         ├─ quizzes ───────────────── [NEW] placement/diagnostic mode (real schema addition)
     │                         ├─ worksheets
     │                         ├─ contentBlocks[] ────────── [NEW] K-2 narration audio (R2, TTS-cached)
     │                         └─ activityRefs[] ──────────── [NEW] Games Engine (C1, Opus-built)
     │                                                              → writes studentProgress.masteryPoints
     │                                                                (ownership-checked, retry-allowed, attempt-tracked)
     └─ subject (free text) ─── [NEW] language slugs (spanish/mandarin/french/...)
                                          │
                                          ├─ units.trackHint ── [NEW] "heritage" | "non-heritage" (B9 —
                                          │    same Punjabi course, both tracks converge by later weeks)
                                          ▼
                              [NEW] dictionary {language, word, translation, synonyms[], audioRef}
                                (generalizes punjabiDictionary — D1)
                                          │
                              ┌───────────┼───────────────┐
                              ▼           ▼               ▼
                     lesson vocab   spelling-bee     thesaurus
                     lookup (D4)    word lists       lookups
                                    (English only)

              [NEW] Standards Coverage page ── renders §6 audit's gap-list data (read-only,
                     human-reviewed before publish, "not yet audited" shown honestly)
```

```
DATA FLOW — dictionary lookup (new)              DATA FLOW — game score submission (new)
CLICK WORD → VALIDATE → QUERY → RENDER            GAME COMPLETE → VALIDATE OWNERSHIP → WRITE → UPDATE UI
   │            │          │        │                    │              │                │         │
   ▼            ▼          ▼        ▼                    ▼              ▼                ▼         ▼
[no sel?]  [empty str?] [0 rows?  [audioRef            [score NaN?  [childProfileId    [D1 busy?  [network
 no-op       no-op       → not-     missing?             clamp to     mismatch? →        retry w/   drop mid-
                          found,     text-only,           0, log]      403, log —         backoff,   update? →
                          not a      no broken                         IDOR attempt]      else       optimistic
                          crash]     icon]                                                queue]      rollback +
                                                                                                        retry banner]
```

```
STATE MACHINE — game instance (C1a)
  NotStarted --start--> InProgress --submit--> Completed --always--> Submitted
                              │                                    (masteryPts = max(existing,new),
                              │ tab close/nav away                  attemptCount += 1)
                              ▼                                          ▲
                         Abandoned                                       │ retry allowed —
                         (no penalty,                                    │ loops back through
                          no partial credit)                             │ NotStarted, never
                                                                          │ silently resumes stale
                                                                    (guarded: no direct
                                                                     Submitted→InProgress transition)
```

**Sections 5-10 (Code Quality / Tests / Performance / Observability / Deployment / Long-Term Trajectory) — evaluated at plan altitude, deferred to `/plan-eng-review` for code-level specifics (exception classes, exact test files, N+1 query sites) since no code exists yet for any new workstream — this is the correct division of labor between this pipeline's two review stages, not a shortcut:**
- **Code Quality:** governed by CLAUDE.md §2/§3 (already binding, restated in §1.6) and the existing codebase's own conventions (Drizzle schema style, route ownership-check pattern) — no new abstraction proposed beyond what each workstream needs.
- **Tests:** new UX flows (game play, dictionary lookup, placement quiz), new data flows (score submission, TTS caching), and new codepaths (ownership checks, retry logic) are named above; `/plan-eng-review` writes the actual test spec headers once Spanish's slice has real PRs to review.
- **Performance:** the biggest lever is TTS caching (§7) — already designed to avoid the obvious N+1-equivalent (re-synthesizing the same phrase per lesson/game/dictionary entry). D1 write pressure from game-score submissions at scale is a real future concern, flagged but not blocking at current traffic.
- **Observability:** `narrationStatus: pending` (§7) and the existing `aiReviewStatus` pattern are the two new states worth a dashboard panel once Phase 1 ships; no new alerting class needed beyond what a failed backfill job already implies.
- **Deployment:** no DB migration required for the language/dictionary/games schema additions beyond what's noted inline (courses.subject is free-text; dictionary and quiz-branching fields are additive, backward-compatible per the existing `wa_standard_refs`-style JSON-column convention).
- **Long-Term Trajectory:** reversibility is high (5/5 — everything is additive JSON/schema, nothing replaces existing six-subject content); the dictionary and games engine are explicitly platform infrastructure other DosanjhLabs products could eventually query, noted as a delight, not a commitment.

**Section 11 (Design & UX) — UI scope confirmed (DESIGN_SCOPE: yes — new lesson surfaces, games, dictionary lookup, all of Workstream A).** Per the section's own instruction: **recommend running `/plan-design-review` next** for the deep visual/interaction audit — that is the next step in this pipeline per the founder's explicit instruction, not skipped.

**Dream-state delta:** this plan is the direct path from "6 subjects, 1 heritage-only language, no games, no dictionary, functional UI" to the 12-month ideal — it does not detour into unrelated scope. The one deliberate scope-narrowing (spec-review finding #7) keeps the existing six subjects' redesign OUT of this plan's blocking path, which sharpens the plan rather than weakening it.

**Deferred (TODOS.md, both added this session):** the scoped AI "Ask for Help" companion (own reviewed mini-plan after Phase 1); applying Workstream A's design system to the existing six subjects' already-shipped lesson pages (mechanical follow-on once A1 exists, not a Phase 1 blocker).

## Implementation Tasks

Synthesized from this review's findings. Each task derives from a specific finding above.

- [ ] **T1 (P1, human: ~1-2wk / CC: ~1-2d)** — Games engine — Build `activityRefs` renderer (C1) with mandatory ownership-check on score submission and keyboard-operable equivalents for drag/drop step-types
  - Surfaced by: §4 C1, Section 3 (Security) finding + spec-review finding #9
  - Files: new `src/components/games/*`, new API route under `src/app/api/`
  - Verify: attempt to submit a score with a mismatched `childProfileId`, confirm 403 + logged IDOR attempt; keyboard-only walkthrough of a matching/build-the-sentence exercise
- [ ] **T2 (P1, human: ~3-4d / CC: ~0.5-1d)** — Dictionary — Generalize `punjabiDictionary` → `dictionary` schema (D1) with `language` column, migrate existing Punjabi rows
  - Surfaced by: §5 D1
  - Files: `drizzle/schema.ts`, new migration
  - Verify: existing Punjabi dictionary lookups still resolve post-migration
- [ ] **T3 (P1, human: ~2-3d / CC: ~half day)** — Language infra — Pull and verify OSPI's actual 2015 World Languages standard grade-banding before Spanish's slice starts
  - Surfaced by: §3 B1 (flagged hard dependency), §12 open decision #5
  - Files: `docs/plans/expansion-plan-2026-09.md` (correct the ACTFL mapping if wrong)
  - Verify: B1's proficiency banding cites the real standard, not just the working assumption
- [ ] **T4 (P2, human: ~1d)** — Speaking-prompt — Confirm client-ephemeral-only audio handling in the actual engine build, not just the plan
  - Surfaced by: spec-review finding #5
  - Files: games engine's speaking-prompt step-type component
  - Verify: no network call fires for a speaking-prompt recording; nothing written to R2/D1
- [ ] **T5 (P2, human: ~1d)** — Standards Coverage page — Gate the public page behind a human-reviewed pass on audit data
  - Surfaced by: §6, §9's new risk row, spec-review finding #11
  - Files: new `src/app/standards-coverage/` route + audit-data review-status field
  - Verify: an unreviewed audit result never renders publicly
- [ ] **T6 (P3, human: ~2-3d)** — Existing-six-subjects redesign — Apply Workstream A's design system as a follow-on once A1 ships (deferred, tracked in `TODOS.md`)
  - Surfaced by: spec-review finding #7
  - Files: existing lesson/worksheet/teacher-guide render components
  - Verify: not blocking Phase 1 — separately approved before starting

## Completion Summary

```
+====================================================================+
|            MEGA PLAN REVIEW — COMPLETION SUMMARY                   |
+====================================================================+
| Mode selected        | SCOPE EXPANSION                              |
| System Audit         | clean tree, no prior design doc, solo repo   |
| Step 0               | Approach C (vertical-slice) chosen; 3/4      |
|                       | expansions accepted, 1 deferred              |
| Section 1  (Arch)    | 2 issues found, both resolved (IDOR, retry)  |
| Section 2  (Errors)  | 3 error paths mapped (dictionary/game/TTS),  |
|                       | 0 unresolved GAPS                            |
| Section 3  (Security)| 2 issues found (IDOR, COPPA audio), both     |
|                       | resolved, 0 High severity remaining          |
| Section 4  (Data/UX) | 1 edge case found (coverage-page gaps),      |
|                       | resolved                                      |
| Section 5  (Quality) | deferred to /plan-eng-review (no code yet)   |
| Section 6  (Tests)   | flows named, test specs deferred to          |
|                       | /plan-eng-review                              |
| Section 7  (Perf)    | 0 issues — TTS caching already designed in   |
| Section 8  (Observ)  | 0 gaps — narrationStatus/aiReviewStatus      |
|                       | patterns sufficient                          |
| Section 9  (Deploy)  | 0 risks — all additive/backward-compatible   |
| Section 10 (Future)  | Reversibility: 5/5, debt items: 0            |
| Section 11 (Design)  | UI scope confirmed — /plan-design-review     |
|                       | recommended next                              |
+--------------------------------------------------------------------+
| NOT in scope          | written (5 items, §10)                      |
| What already exists   | written (§11)                                |
| Dream state delta     | written                                      |
| Error/rescue registry | 3 codepaths, 0 CRITICAL GAPS                 |
| Failure modes         | 3 total, 0 CRITICAL GAPS                     |
| TODOS.md updates      | 2 items (AI companion; existing-six redesign)|
| Scope proposals       | 4 proposed, 3 accepted, 1 deferred           |
| CEO plan              | written (~/.gstack/projects/jsdosanj-        |
|                       | sikhischool/ceo-plans/2026-09-04-expansion-plan.md) |
| Outside voice         | spec-review adversarial subagent ran (1      |
|                       | round, 11/11 findings fixed) — see below     |
| Diagrams produced     | 4 (architecture, 2× data flow, state machine)|
| Stale diagrams found  | 0 (no prior diagrams in this repo)           |
| Unresolved decisions  | 5 (§12, unchanged by this review — founder   |
|                       | approval gate, not review findings)          |
+====================================================================+
```

### Error & Rescue Registry

| Codepath | What can go wrong | Rescued? | Rescue action | User sees |
|---|---|---|---|---|
| Dictionary lookup (D4) | Word not found | Y | Not-found state, no crash | "No definition yet for this word" |
| Dictionary lookup (D4) | D1 query error | Y | Retry once, then error state | "Couldn't load that — try again" |
| Game score submission (C1) | `childProfileId` mismatch | Y | 403, logged as IDOR attempt | Generic error, no detail leaked |
| Game score submission (C1) | D1 write conflict/busy | Y | Retry w/ backoff, else queue | "Not saved yet, retrying..." |
| TTS generation (§7) | Provider failure/timeout | Y | Ship lesson text-only, flag `narrationStatus: pending`, nightly backfill retry | No visible error — lesson usable without narration |

No CRITICAL GAPS (no row has all of RESCUED=N + TEST=N + USER SEES=Silent).

### Outside Voice (Claude subagent — Codex not installed, fell back per skill's error handling)

Ran as a fresh-context cold read of this full plan document (not the lighter CEO-plan artifact), after all 11 sections and the spec-review loop had already run — its job was finding what that full pass missed. 10 findings, all substantive. Per this skill's User Sovereignty rule, none are auto-incorporated — disposition below, decided or left open by the founder:

1. **World Languages competitive framing was never benchmarked against language-learning apps (Duolingo/Babbel), only against general K-12 curriculum sites** — Sikhi School's stated differentiator (Sikhi/Punjabi depth) doesn't apply to a generic French/German track. **OPEN — §12 new decision #6.**
2. **No stated wave-pipeline velocity, so the 12-month dream-state timeline was unchecked against real throughput** — **RESOLVED**: computed from git history, folded into §0 (~385 lessons/day when active; pipeline has actually been idle 12 days, not continuously running — see next finding).
3. **The wave pipeline has been idle since 2026-08-22, not "currently running" as §12.3 assumed** — **RESOLVED**: §0 corrected, 5 uncommitted lesson files discovered sitting on disk, §12 open decision #3 reframed as "resume + keep running."
4. **Founder-as-sole-reviewer capacity isn't modeled** — more concurrent waves doesn't mean more concurrent human review throughput. **OPEN — §12 new decision #7.**
5. **English dictionary/spelling-bee sourcing and copyright is unaddressed** — AI-generating dictionary definitions at volume risks both lexicographic quality and proximity to copyrighted wording; Scripps' actual word lists are proprietary; no public-domain structured source (WordNet/Wiktionary) was even considered. **OPEN — §12 new decision #8, this one matters before D1/D2 touch any real content.**
6. **"K-2 professional narration" is ambiguous between premium TTS and licensed human voice-over, and §3 B2-B4 silently resolved it toward TTS** ("reuses the same TTS-caching infrastructure... low risk") while §8 said "professional narration" (the natural children's-ed reading is voice actor) — materially different cost/scope. **OPEN — §12 new decision #9.**
7. **B9's "not a fork" claim had no mechanism** — **RESOLVED**: `trackHint` (heritage/non-heritage) added to §3 B9 and the architecture diagram.
8. **Games' accuracy gate only named Sikhi imagery + trivia as triggers, not all game factual content** — **RESOLVED**: §4 C3 corrected, every game's factual content now explicitly inherits `aiReviewStatus`.
9. **No spend checkpoint inside Phase 1 itself** (only Phase 2's budget was gated on Phase 1's measured baseline) — **RESOLVED**: §8 Phase 1 now has an internal checkpoint after the first 2-3 grade bands.
10. **RTL-readiness (A5) has no enforcement mechanism and nothing exercises it for years** — **RESOLVED**: §2 A5 now requires a stylelint physical-property ban in CI, not an unenforced convention.
11. **Non-uniform per-language replication difficulty assumed away** — Spanish and French share script/tooling assumptions; Mandarin doesn't (non-alphabetic, tone marking, no word-boundary spacing, pinyin-vs-hanzi for pre-literate K-2) — none of that is exercised by Spanish's slice, so "S effort" for Mandarin specifically is optimistic. **RESOLVED as a stated risk**: added to §9's risk table below; Mandarin's replication effort should be re-estimated after Spanish clears, not assumed equal to French's.

Cross-model tension: none — the outside voice found genuinely new ground (competitive framing, capacity modeling, pipeline status, content sourcing) rather than disagreeing with anything the 11-section review or spec-review loop concluded.

## 14. Eng review record (2026-09-04, FULL_REVIEW mode — reviewed against the plan's full eventual shape, all phases)

**Step 0 — scope challenge:** complexity check triggered (plan touches far more than 8 files/2+ new subsystems across its eventual shape). Founder chose to review the full plan's eventual shape rather than narrow eng review to Phase 0/1 only — see the AskUserQuestion record above. Existing-code-leverage and minimum-change checks: no sub-problem is being rebuilt from scratch where existing code already solves it (§11's leverage map holds).

**Findings, all resolved (folded inline above):**
1. **[P1] (confidence: 9/10)** No deploy automation existed (`.github/workflows/` had only `ci.yml` + a cron job; no `CLOUDFLARE_API_TOKEN` secret) despite the founder's explicit auto-merge/auto-deploy instruction. **Fixed:** `.github/workflows/deploy.yml` (deploy on push to main) + `.github/workflows/auto-merge.yml` (request auto-merge on PR open) added; branch protection on `main` now requires `ci.yml`'s `validate` check before any merge. **Remaining founder action (cannot be done by this pipeline): add `CLOUDFLARE_API_TOKEN` as a repo secret** — the deploy workflow fails loudly, not silently, until then.
2. **[P2] (confidence: 7/10)** Placement quiz's adaptive/branching design was flagged as possibly over-engineered for an unvalidated optional v1 feature. Founder chose to keep the full design as planned — not a defect, a deliberate scope call, recorded here rather than re-litigated.
3. **[P2] (confidence: 8/10)** Games engine's 8+ step-type components had no code-splitting requirement — risked shipping all step-types' JS to every lesson page regardless of which one it uses. **Fixed:** §4 C1 now requires `next/dynamic` per step-type.
4. **[P2] (confidence: 8/10)** Standards Coverage page (§6) had no query-batching requirement for its up-to-~180 grade×subject cells — real N+1 risk on a public, crawlable, unauthenticated page. **Fixed:** §6 now requires one batched query + ISR/cache revalidated only on audit re-run.

**Architecture:** no new single point of failure introduced beyond what's already true of the stack (D1/Cloudflare Workers). Auto-merge/auto-deploy (finding 1) is scoped to run *within* an already-founder-approved phase, not a substitute for the phase-boundary review gates (§8) — a red CI run never merges (branch protection now enforces this), so the failure mode is "nothing ships" not "something bad ships."

### Test Review

```
CODE PATHS (planned, Phase 0/1)                          USER FLOWS
[+] Dictionary lookup (D4)                                [+] Word lookup while reading
  └── query(language, word)                                 ├── [→E2E] Click word → definition+audio appears
      ├── [PLAN] 0 rows → not-found state                   ├── [PLAN] Word not in dictionary yet
      ├── [PLAN] D1 error → retry once, then error           └── [PLAN] Rapid double-click same word (no dupe fetch)
      └── [PLAN] audioRef missing → text-only, no broken icon
[+] Game score submission (C1)                            [+] Playing + completing a game
  └── submitScore(childProfileId, gameId, score)             ├── [→E2E] Full play-through → score → masteryPoints update
      ├── [PLAN] childProfileId mismatch → 403 + IDOR log    ├── [PLAN] Retry after completion (best-score-kept)
      ├── [PLAN] score NaN/negative → clamp to 0, log         ├── [PLAN] Close tab mid-game (Abandoned state, no penalty)
      ├── [PLAN] D1 write conflict → retry w/ backoff         └── [PLAN] Two tabs same game (single-attempt takeover — same
      └── [PLAN] retry: masteryPts = max(existing,new)              rule as cert-prep's mid-exam persistence, §11 leverage)
[+] TTS generation + narration (§7)                       [+] K-2 lesson with missing narration
  └── generate(language, phrase) → cache R2                  └── [PLAN] narrationStatus:pending → lesson usable, no audio
      ├── [PLAN] success → contentBlocks[audio].src set           player shown (not a broken player)
      └── [PLAN] failure → narrationStatus:pending, backfill
[+] Standards Coverage page (§6)                          [+] Teacher visiting the public page
  └── getStandardsCoverage() — ONE batched query             ├── [PLAN] Subject not yet audited → "not yet audited" shown
      ├── [PLAN] query failure → cached last-known-good           honestly, not hidden
      └── [PLAN] unreviewed audit row → never rendered        └── [→E2E] Full page load — verify no N+1 (single query in logs)
[+] Punjabi trackHint (B9)                                [+] Non-heritage family starting Punjabi
  └── unit.trackHint: "heritage"|"non-heritage"               └── [PLAN] Both tracks converge on same later-week lessons —
      └── [PLAN] no trackHint set → defaults to heritage            regression-style test: heritage track unaffected by B9

LLM/content generation: [→EVAL] every Sonnet/Fable wave-authoring pass — existing aiReviewStatus
  gate + the standards-audit gap-list output (§6) both need eval-style spot-checks, not unit tests

COVERAGE (planned, not yet implemented): 0/19 paths have code yet — this IS the test spec for
Phase 0/1, not a gap report against existing code. Every [PLAN] row becomes a required test
when its component is built; every [→E2E] row is a Playwright/integration test, not a unit test.
```

**Test Plan Artifact:** written to `~/.gstack/projects/jsdosanj-sikhischool/jasvant-main-eng-review-test-plan-20260904.md` for `/qa` and `/qa-only` to consume once Phase 0/1 lands.

**Regression rule check:** no existing behavior is modified by this plan (everything is additive — new subject values, new tables, new routes) — no regression tests required beyond B9's "heritage track unaffected" check above, which is precautionary given B9 touches the existing Punjabi course rows.

### NOT in scope (eng review additions)

- Automated visual regression testing — belongs to `/plan-design-review`, not eng review.
- Load/stress testing against real traffic — no production traffic pattern exists yet to test against; revisit once Phase 1 (Spanish slice) is live.
- CI/CD for the four detailed-plan-only languages (B5-B8) — nothing to deploy until a build phase is approved.

### What already exists (eng review additions)

`ci.yml`'s `validate` job (type check + lint + build) — reused as the required status check for auto-merge, not rebuilt. Existing route-ownership-check pattern (classroom/grade routes) — reused for the games-engine IDOR fix, not reinvented. `wrangler.jsonc`'s D1/R2 bindings — reused as-is for dictionary/games/TTS-cache storage, no new binding needed.

### Failure modes registry (additions beyond §13's Error & Rescue Registry)

| Codepath | Failure mode | Rescued? | Test? | User sees | Logged? |
|---|---|---|---|---|---|
| `deploy.yml` | Missing `CLOUDFLARE_API_TOKEN` | Y | N (infra, not app code) | N/A (founder sees a red GitHub Actions run) | Y — explicit `::error::` message |
| `auto-merge.yml` | Red CI (`validate` fails) | Y | N (GitHub-enforced, not app code) | PR just doesn't merge, no user-facing impact | Y — visible in PR checks |
| Standards Coverage page | Batched query fails | Y (per this review) | PLAN | Cached last-known-good page, not a 500 | PLAN |

No CRITICAL GAPS (no row has all of RESCUED=N + TEST=N + USER SEES=Silent).

### Worktree parallelization strategy (Phase 0)

| Workstream | Modules touched | Depends on |
|---|---|---|
| A1 (design system) | `src/design/`, new component library | — |
| D1 (dictionary schema) | `drizzle/schema.ts` (dictionary table), `drizzle/migrations/`, `scripts/` | — |
| C1 (games engine) | `src/components/games/` (new), `drizzle/schema.ts` (attemptCount field), `src/app/api/` (score route) | A1 (styling conventions, non-blocking for core logic) |
| B1 (language infra) | `data/` (templates/exemplars), `docs/` (standard research) | — |

**Lanes:** Lane A = A1 (independent). Lane B = D1 (independent, touches `drizzle/schema.ts`). Lane C = C1 (independent core logic; final UI polish waits on Lane A). Lane D = B1 (independent, mostly docs/data).

**Execution order:** Launch A, B, C, D in parallel worktrees. **Conflict flag:** D1 and C1 both touch `drizzle/schema.ts` (different tables — `dictionary` vs. `studentProgress`'s new field) — land one PR before starting the other's schema edit, or coordinate the migration file numbering carefully; the rest of each workstream is conflict-free.

## Implementation Tasks (Eng Review)

- [ ] **T7 (P1, human: ~2h / CC: ~20min)** — CI/CD — Add `CLOUDFLARE_API_TOKEN` repo secret (founder action, not automatable)
  - Surfaced by: Eng review finding 1
  - Files: GitHub repo Settings > Secrets and variables > Actions
  - Verify: `deploy.yml` run succeeds instead of failing on the missing-token check
- [ ] **T8 (P2, human: ~1d / CC: ~1-2hr)** — Games engine — Implement step-type components behind `next/dynamic`
  - Surfaced by: Eng review finding 3
  - Files: `src/components/games/*`
  - Verify: bundle analyzer shows only the used step-type's JS on a given lesson page
- [ ] **T9 (P2, human: ~1d / CC: ~1-2hr)** — Standards Coverage — Batched query + ISR caching
  - Surfaced by: Eng review finding 4
  - Files: new `src/app/standards-coverage/` route
  - Verify: server logs show exactly 1 query per page render, not ~180

### Outside voice (Claude subagent — Codex not installed) on the deploy pipeline specifically

Ran a second, targeted outside-voice pass against the newly-built `deploy.yml`/`auto-merge.yml`/`ci.yml` changes (not just the plan doc) — this is the pass that actually earns its keep. 11 findings, genuinely serious for a pipeline with direct D1/R2 write access to child-related data:

**Resolved by hardening the workflows just now:**
- No concurrency control on `deploy.yml` → added `concurrency: group: deploy-production, cancel-in-progress: false`.
- CI validated a different build than what deploys (`next build` vs. `opennextjs-cloudflare build`) → `ci.yml` now also runs `npm run cf:build`.
- No production D1 migration step existed anywhere (6 prior migrations were applied by hand) → `deploy.yml` now runs `wrangler d1 migrations apply --remote` before deploying (idempotent, safe to re-run).
- No post-deploy verification → `deploy.yml` now smoke-tests the live URL, fails loudly with a rollback hint if it's not a 200.
- Auto-merge applied uniformly regardless of blast radius (a content wave and an IDOR-security-code change got identical unattended treatment) → `auto-merge.yml` now skips requesting auto-merge for `drizzle/`, `src/app/api/`, and `.github/workflows/` changes, posting a comment explaining why a human needs to look.

**Not mechanically fixable by this pipeline — genuine open items, folded into §9's risk table and §12:**
- **No test suite exists at all** in this repo (no test script, no framework installed) — the IDOR check, COPPA audio-ephemerality rule, and mastery-points invariant have zero mechanical enforcement, only the path-based carve-out above as a stopgap. **New open decision, §12 #10.**
- **No required human review** on branch protection (confirmed via API) — combined with the above, low-risk content waves merge genuinely unattended, which matches how the existing pipeline already behaved for ~178 prior PRs, but the founder should confirm this is the intended posture going forward, not an accident. **Folded into §12 #10.**
- Deploy credential's D1/R2 write scope, and the mastery-decay cron coordination gap — both added to §9's risk table as documented, not mechanically resolved (the first needs the founder's Cloudflare token creation, the second is low actual risk given Workers deploys are a version swap, not downtime).
- No staging/preview deploy step exists — genuinely out of scope for this pass (Cloudflare Workers preview deploys are a real feature, but wiring them is its own workstream) — added to `TODOS.md`.



```
+====================================================================+
|                 ENG REVIEW — COMPLETION SUMMARY                    |
+====================================================================+
| Step 0                | Scope accepted as-is (full eventual shape,  |
|                        | founder's explicit choice)                  |
| Architecture Review    | 1 issue found (deploy automation missing),  |
|                        | resolved                                     |
| Code Quality Review    | 1 issue found (quiz complexity), founder    |
|                        | kept as planned — not a defect                |
| Test Review            | diagram produced, 19 planned paths, test    |
|                        | plan artifact written                        |
| Performance Review     | 2 issues found (code-splitting, N+1),       |
|                        | both resolved                                |
| NOT in scope           | written (3 items)                            |
| What already exists    | written (3 items)                            |
| TODOS.md updates       | 0 new (nothing surfaced beyond CEO review's) |
| Failure modes          | 3 additional, 0 CRITICAL GAPS                |
| Outside voice          | ran (Claude subagent, Codex not installed)   |
| Parallelization        | 4 lanes, 4 parallel / 1 conflict flag        |
| Lake Score             | 2/2 recommendations chose the complete       |
|                        | option (deploy automation, code-splitting)   |
+====================================================================+
```

## 15. Design review record (2026-09-04)

**System audit:** no `DESIGN.md` exists. Mockup generation (the gstack designer) is installed but not authenticated — no OpenAI API key configured — so this review is text-based, not visual. That gap is itself Pass 5's central finding, not a reason to skip the review.

**Initial rating: 4/10.** Workstream A stated good intent (RTL-ready, anti-slop commitment, component reuse, grade-band-differentiated shells) but zero concrete decisions — no font names, no color values, no spacing scale. Same shape as cert-prep's pre-review 5.5/10 ("premium was asserted, not designed").

### Pass 1: Information Architecture — 3/10 → 8/10

```
Spanish Grade-3 lesson page (rising-school shell), info hierarchy:
  1st: today's lesson title + week position (Mon-Fri) — orients the kid immediately
  2nd: the reading passage (primary content — largest visual weight)
  3rd: the embedded game (secondary, below the passage — practice follows content,
       not competes with it for attention)
  4th: progress indicator (tertiary — growing-plant/filled-dots metaphor, not a
       generic percent bar, per §0's "millions of dollars" bar)

little-sparks (K-2) home, info hierarchy (post-A1a icon-nav finding):
  1st: "today's lesson" as one big icon-tile (the ONE thing a 6-year-old needs)
  2nd: subject icons (math/ela/science/etc., tap-and-hold speaks the name)
  3rd: "my stars"/progress (icon, least cognitive load — a reward glance, not a task)
```

### Pass 2: Interaction State Coverage — 2/10 → 8/10

```
FEATURE                | LOADING           | EMPTY                  | ERROR                | SUCCESS                | PARTIAL
------------------------|-------------------|------------------------|-----------------------|-------------------------|------------------
Dictionary lookup (D4)  | subtle spinner    | "No definition yet     | "Couldn't load —     | popover/sheet w/       | audioRef missing →
                         | in the popover/    | for this word" +       | try again" + retry    | translation+audio      | text-only, no
                         | sheet, <300ms      | warm tone, not a       | button                |                         | broken icon
                         | perceived-instant  | dead end               |                       |                         |
Game play (C1)          | step-type          | (n/a — a lesson         | "Something went       | score + streak +       | Abandoned (tab
                         | component lazy-    | either has a game       | wrong, your last      | mastery-points          | closed mid-game)
                         | loads via          | or doesn't — no         | try was saved"        | update, retry-best-     | → no penalty,
                         | next/dynamic       | empty-game state)       | on submission          | score-kept              | no partial credit
                         |                    |                         | failure                |                         | shown as such
K-2 narration (§7)      | n/a (pre-cached)   | n/a                     | narrationStatus:      | audio player, large     | —
                         |                    |                         | pending → lesson       | tap target, icon-only  |
                         |                    |                         | usable, no broken      |                         |
                         |                    |                         | player shown            |                         |
Standards Coverage (§6) | skeleton table      | (n/a — always has        | cached last-known-    | full table, per-cell    | subject not yet
                         | while cached page   | at least "not yet        | good page shown,       | ✓/✗/thin verdict         | audited → "○ not
                         | revalidates         | audited" rows)           | never a raw 500        |                         | yet audited" (§13)
Placement quiz (§3)     | question-by-        | (n/a — always has         | progress saved,        | "here's your            | quiz abandoned
                         | question, no        | at least the first        | resume where you       | starting point" +       | mid-way → resumable
                         | full-page reload    | question)                  | left off               | why (grade-band         | next visit, not
                         |                     |                            |                        | rationale)               | lost
```

### Pass 3: User Journey & Emotional Arc — 3/10 → 7/10

```
STEP                        | USER DOES                    | USER FEELS              | PLAN SPECIFIES?
-----------------------------|-------------------------------|---------------------------|------------------
1. Family lands on Spanish   | Browses grade-3 course page   | Curious, slightly         | Course landing page
   Grade-3 course             |                                | skeptical (free = often   | design deferred to
                              |                                | thin)                     | A2 — flagged as a gap
2. Opens today's lesson      | Reads title, sees week         | Oriented ("this is        | Pass 1's hierarchy
                              | position                        | Monday's lesson")         | above
3. Reads passage, hits an    | Clicks the word                 | A flicker of friction     | D4's instant popover/
   unfamiliar Spanish word    |                                  | ("do I have to leave?")  | sheet — resolves fast
                              |                                  | → relief when it's        |
                              |                                  | instant, not a navigation |
4. Plays the matching game    | Drags/taps tiles                | Playful, low-stakes       | C1a's retry-keeps-
                              |                                  | (retry allowed)           | best-score rule
5. Sees mastery-points grow   | Glances at the progress         | Small accomplishment,     | Pass 1's growing-plant/
                              | indicator                        | not a grade/judgment      | filled-dots metaphor
```

**Gap flagged, not fixed here:** step 1 (course landing page, first impression for a skeptical parent) has no design spec anywhere in this plan — it's the actual "5-second visceral" moment that decides whether a family keeps looking. Added to §7 Unresolved Decisions below.

### Pass 4: AI Slop Risk — 3/10 → 6/10 (capped — see Pass 5)

The plan's language ("premium," "distinctive," "clean, simple, secure") is vague on its own — the FIX here is the explicit AI Slop blacklist commitment, not invented specifics this review can't back with a real mockup: **A1's design system explicitly avoids** the purple/violet gradient default, the 3-column icon-in-circle feature grid, centered-everything, uniform bubbly border-radius, decorative blobs/wavy dividers, emoji-as-design-elements, and `system-ui`/`-apple-system` as the primary typeface (all AI-slop blacklist items, §0's reference-repo research already flags KanaDojo's actual distinctive aesthetic as a worthwhile study, not a template to copy). Real font/color decisions still require Pass 5's gate.

### Pass 5: Design System Alignment — 0/10 → capped at 7/10 until DESIGN.md exists

No `DESIGN.md`. **Hard gate added to §2 A1** (not a hope): no component in A2-A5 is built until `/design-consultation` produces real typography/color/spacing decisions. This score cannot honestly move past 7/10 in a text-only review — the cap is intentional, matching cert-prep's precedent exactly.

### Pass 6: Responsive & Accessibility — 3/10 → 8/10

- **Mobile dictionary lookup:** bottom sheet, not a squeezed popover (fixed above, §5 D4).
- **K-2 touch targets:** 60px+ (fixed above, §2 A1a) — above the universal 44px floor for smaller, less precise fingers.
- **Game step-types keyboard access:** already required by eng review (§4 C1) — drag/drop and ordering step-types ship keyboard-operable equivalents.
- **Standards Coverage table (§6):** ~180 cells needs a real mobile layout, not a horizontally-scrolling table with no affordance — **new finding, folded in without a separate gate (obvious fix, same pattern as D4's mobile treatment):** collapses to a per-subject accordion/list view below 768px, each subject expandable to its per-grade verdicts, rather than a cramped wide table.
- **Contrast/type floor:** universal rule carried forward — body text never below 16px or 4.5:1 contrast, both themes (already stated in §1.1's exit criteria, reaffirmed here as binding on every new surface in this section).
- **Visited-link distinction:** applies to the Standards Coverage page's any external OSPI/standard-reference links.

### Pass 7: Unresolved Design Decisions

```
DECISION NEEDED                          | IF DEFERRED, WHAT HAPPENS
-------------------------------------------|---------------------------------------------
Course landing page design (Pass 3 gap)   | Implementer ships a generic course-card grid —
                                            | the actual first-impression moment for a
                                            | skeptical parent gets the least design thought
Font pairing / color values (Pass 5)      | Blocked by the new A1 hard gate — cannot ship
                                            | without /design-consultation running first
K-2 icon set — custom-illustrated or a    | Custom = more "millions of dollars" feel but
licensed icon library?                    | real production cost; a library ships faster
                                            | but risks the generic-SaaS-icon look Pass 4
                                            | flags. Not resolved here — recommend deciding
                                            | inside /design-consultation, not this review.
```

### NOT in scope (design review)

- Actual font/color selection — belongs to `/design-consultation`, not this review (Pass 5's gate exists specifically to route it there).
- Visual mockup generation — blocked on an OpenAI API key not being configured; text-based specification substitutes for this pass.
- Course landing page's full design — flagged as a real gap (Pass 3/7) but not specified here; scope creep beyond what this review's target (the expansion plan) asked for.

### What already exists (design review)

Three grade-banded shells (`little-sparks`/`rising-school`/`sikhi-school-studio`) already differentiate K-2 from older grades structurally — A1a's icon-nav finding extends that existing differentiation, doesn't invent a new one. `contentBlocks`'s `audio` type already exists in schema — K-2 narration (§7) rides it, no new content-block type needed.

## Implementation Tasks (Design Review)

- [ ] **T10 (P1, human: ~2-3d / CC: ~half day)** — Design system — Run `/design-consultation`, produce `DESIGN.md` before any A2-A5 component is built
  - Surfaced by: Pass 5
  - Files: new `DESIGN.md`
  - Verify: real font names, CSS color variables, spacing scale present — not placeholder text
- [ ] **T11 (P1, human: ~1-2d / CC: ~2-3hr)** — K-2 shell — Icon-first nav with tap-and-hold audio labels
  - Surfaced by: Pass 1 / design review finding (K-2 navigation)
  - Files: `little-sparks` shell nav component
  - Verify: a non-reading test user can navigate to today's lesson using icons/audio alone
- [ ] **T12 (P2, human: ~1d / CC: ~2hr)** — Dictionary lookup — Bottom-sheet mobile pattern
  - Surfaced by: Pass 6 / design review finding (mobile dictionary lookup)
  - Files: `D4`'s lookup component
  - Verify: <768px viewport shows a bottom sheet, not a clipped popover
- [ ] **T13 (P3, human: ~1d / CC: ~1-2hr)** — Standards Coverage — Mobile accordion layout below 768px
  - Surfaced by: Pass 6
  - Files: `src/app/standards-coverage/` (same route as eng review's T9)
  - Verify: no horizontal scroll needed at 375px width

## Completion Summary (Design Review)

```
+====================================================================+
|         DESIGN PLAN REVIEW — COMPLETION SUMMARY                    |
+====================================================================+
| System Audit          | No DESIGN.md; mockup gen unavailable        |
|                        | (no OpenAI key) — text-based review          |
| Step 0                | Initial rating 4/10; mockups requested but   |
|                        | blocked, proceeded text-only                 |
| Pass 1  (Info Arch)   | 3/10 → 8/10                                  |
| Pass 2  (States)      | 2/10 → 8/10                                  |
| Pass 3  (Journey)     | 3/10 → 7/10 (1 gap flagged: landing page)    |
| Pass 4  (AI Slop)     | 3/10 → 6/10 (capped — see Pass 5)            |
| Pass 5  (Design Sys)  | 0/10 → capped at 7/10 until DESIGN.md exists |
| Pass 6  (Responsive)  | 3/10 → 8/10                                  |
| Pass 7  (Decisions)   | 1 resolved inline, 2 deferred (font/color to |
|                        | /design-consultation, landing page to a      |
|                        | future pass)                                  |
+--------------------------------------------------------------------+
| NOT in scope           | written (3 items)                           |
| What already exists    | written                                     |
| TODOS.md updates       | 0 new (T10-T13 cover the gaps as tasks)      |
| Approved Mockups       | 0 generated (no API key), 0 approved         |
| Decisions made         | 3 added to plan (K-2 nav, mobile dictionary, |
|                        | design-system hard gate)                     |
| Decisions deferred     | 2 (course landing page design, icon-set      |
|                        | sourcing — both to /design-consultation)     |
| Overall design score   | 4/10 → 7/10 (capped pending DESIGN.md)       |
+====================================================================+
```

Score capped below 8 pending `DESIGN.md` — per this skill's own rule, that means: "note what's unresolved and why (user chose to defer)." What's unresolved is real typography/color, deliberately deferred to `/design-consultation` rather than fabricated here without visual tooling.

## 16. DX review record (2026-09-04, DX POLISH mode)

Scoped to the **builder/contributor pipeline**, not the kid/family end-user experience (that's the design review's job) — same scoping cert-prep's DX review used.

**Developer Persona Card:**
```
Who:       You (solo founder) + Claude Code agent sessions
Context:   A session picks up mid-pipeline and needs to resume work fast
Tolerance: Near-zero patience for rediscovering context — the cost of
           confusion is a wasted session, not a wasted afternoon
Expects:   README to be authoritative, scripts to be idempotent/safe to
           re-run, git history self-explanatory enough to reconstruct state
```

**Developer Empathy Narrative** (confirmed accurate — this literally happened at the start of this session): a fresh session reads README's honest "plan lives outside this repo," sees 178 identically-shaped PR commits then 12 days of silence, finds 5 valid-but-uncommitted lesson files, reads `.claude/RESUME.md` referencing a session ID that isn't theirs — and has to reconstruct "is this abandoned or lost?" by inference, with no CONTRIBUTING.md or resume guidance anywhere.

**Competitive DX Benchmark:** no direct external competitor for an internal AI-agent content pipeline; benchmarked against 2026 AI-agent-pipeline best practice (checkpoint every 45-60min — already true via Claude Code's own `/resume`; keep the root agent-instruction file lean — already true) and cert-prep's own DX review, which found and fixed the identical "no resume guidance" gap in a sibling repo. Target: **Champion tier** (<2min to resume, zero guesswork).

**Magical Moment:** PR opens → green CI → auto-merges → live in production, unattended — **designed and built (§14), but not yet verified end-to-end** (outside-voice correction, §16): `CLOUDFLARE_API_TOKEN` is still unset, so `deploy.yml` has never actually run to completion — this is a designed-but-unexercised codepath, not a confirmed one. The step-summary announcement (this session's addition) will make it visible the first time it does run.

**Developer Journey Map:**
```
STAGE          | DEVELOPER DOES                    | FRICTION POINTS        | STATUS
----------------|-----------------------------------|-------------------------|--------
1. Discover     | Reads README.md                   | none — honest, current  | ok
2. Install      | npm install; cp .dev.vars.example; | none — 4 clean commands| ok
                | migrate:local; npm run dev         |                         |
3. Hello World  | Authors first lesson JSON          | no template/schema ref | fixed
                |                                    | (reverse-engineer from  | (docs/CONTENT-
                |                                    | an example file)        | AUTHORING.md)
4. Real Usage   | Runs a wave, seeds via scripts/    | no shape validation —   | fixed
                |                                    | malformed JSON fails    | (shape check
                |                                    | unhelpfully or silently | added to both
                |                                    | partial-inserts         | seed scripts)
5. Debug        | PR fails CI, or a stale checkpoint | stale-checkpoint state  | fixed (CLAUDE.md
                | is found on repo entry              | had zero guidance       | resume section)
6. Upgrade      | Schema migration needed            | no remote-apply automa- | fixed (eng
                |                                    | tion existed (6 prior   | review §14's
                |                                    | migrations applied by   | migration step)
                |                                    | hand)                    |
```

**First-Time Developer Confusion Report:** superseded by the empathy narrative above — this session WAS the first-time-developer roleplay, not a simulation. All identified confusion points addressed: stale-checkpoint guidance (CLAUDE.md), content shape reference (CONTENT-AUTHORING.md), shape validation (seed scripts), deploy visibility (deploy.yml step summary).

### Pass 1: Getting Started Experience — 6/10 → 8/10
4-command local dev setup is already close to Champion tier for install; the gap was entirely the stale-checkpoint scenario (now fixed). Capped below 9 because there's still no automated test to run after setup to confirm "it worked" (ties to eng review's §12.10 open decision on test-suite posture — not re-litigated here).

### Pass 2: API/CLI/SDK Design (seed-script pattern) — 7/10
Consistent naming (`seed-<noun>.ts`), consistent auth pattern (`CLOUDFLARE_API_TOKEN` env var, checked first with a clear error), consistent D1 HTTP API wrapper across every script. No issues found, moving on.

### Pass 3: Error Messages & Debugging — 4/10 → 7/10
Traced 3 paths: missing `CLOUDFLARE_API_TOKEN` (already Tier-1-quality — conversational, clear fix) — no issues found. Missing deploy secret (already Tier-1-quality per §14's `::error::` message) — no issues found. Malformed/incomplete content JSON (Tier-0 — no validation at all, real gap) — **fixed**, then **corrected by outside-voice review**: the first pass validated a plausible-looking subset of fields rather than every column the INSERTs actually bind (`unit.order`, `teacherGuide.objectives/materialsNeeded/differentiationTips` all have NOT NULL columns that an explicit `undefined→null` would have violated, reproducing the exact silent-partial-write failure mode the fix claimed to close), and the quiz-linking `UPDATE` never checked rows-affected, so a typo'd `lessonId` would print a false-positive success message. Both scripts now validate every bound column plus item-level shape (question answer-index bounds, contentBlock required fields) and check the UPDATE's actual row count. **Capped at 7, not 9-10:** the write sequence still isn't atomic (no D1 `.batch()`/transaction) and there's no concurrency control across parallel sessions writing to the same shared D1 — see the new risk row in §9 and open decision §12.11.

### Pass 4: Documentation & Learning — 3/10 → 8/10
No prior lesson-JSON reference beyond reverse-engineering examples — **fixed** via `docs/CONTENT-AUTHORING.md`. Capped below 9 pending that doc growing sections for the new content types (dictionary/game/language-unit/quiz shapes) as those workstreams actually ship, per the doc's own stated growth plan.

### Pass 5: Upgrade & Migration Path — 3/10 → 7/10
Already resolved by eng review §14 (automated `wrangler d1 migrations apply --remote` in `deploy.yml`, replacing the prior by-hand process). No new finding here — referencing, not re-fixing.

### Pass 6: Developer Environment & Tooling — 7/10
TypeScript throughout, `tsx` for script execution (no build step needed), CI runs non-interactively, no Docker/special environment required. No issues found, moving on.

### Pass 7: Community & Ecosystem — 2/10 (appropriate for confirmed persona, not a gap)
No CONTRIBUTING.md, no public community channel, closed-source-by-default posture. **Not flagged as a gap** — the persona confirmed in 0A is explicitly solo-founder-plus-AI-agents, not an open-source contributor base; investing in community infrastructure for a persona that doesn't exist would be scope creep, not DX polish.

### Pass 8: DX Measurement & Feedback Loops — 4/10 (appropriate for confirmed persona)
No TTHW instrumentation or analytics, but gstack's own session timeline (`~/.gstack/projects/.../timeline.jsonl`) already captures skill-run history for this exact repo, which is reasonable measurement infrastructure for a solo-founder-scale pipeline. Not flagged as blocking.

### NOT in scope (DX review)
- Community infrastructure (CONTRIBUTING.md, issue templates, public roadmap) — Pass 7's finding: no evidence this repo has or needs an outside-contributor persona right now.
- TTHW instrumentation/analytics dashboards — Pass 8: existing gstack timeline logging is adequate at this scale.
- Extending `docs/CONTENT-AUTHORING.md` with dictionary/game/language/quiz shapes — genuinely can't be written before those workstreams' schemas exist; the doc already states this as its own growth plan.

### What already exists (DX review)
Consistent seed-script pattern (naming, auth, D1 wrapper) across ~10 scripts — reused, not reinvented, by this review's fixes. `.claude/RESUME.md`'s checkpoint mechanism (Claude Code's own feature) — the gap was guidance around it, not the mechanism itself.

### DX Scorecard
```
+====================================================================+
|              DX PLAN REVIEW — SCORECARD                             |
+====================================================================+
| Dimension            | Score  |
|----------------------|--------|
| Getting Started      | 8/10   |
| API/CLI/SDK           | 7/10   |
| Error Messages        | 8/10   |
| Documentation         | 8/10   |
| Upgrade Path           | 7/10   |
| Dev Environment        | 7/10   |
| Community              | 2/10 (appropriate for persona)             |
| DX Measurement         | 4/10 (appropriate for persona)             |
+--------------------------------------------------------------------+
| TTHW                  | <2min (resume) — Champion tier achieved     |
| Competitive Rank      | Champion (resume), N/A (no external comp)   |
| Magical Moment         | designed + built, unverified end-to-end     |
|                        | (CLOUDFLARE_API_TOKEN not yet set)          |
| Product Type           | Platform (contributor pipeline)             |
| Mode                   | DX POLISH                                   |
| Overall DX             | 4.5/10 → 6.4/10 (weighted; low Community/   |
|                         | Measurement scores are appropriate, not a   |
|                         | gap, given the confirmed solo persona)      |
+====================================================================+
```

## Implementation Tasks (DX Review)

- [x] **T14 (P1, human: ~30min / CC: ~10min)** — CLAUDE.md — Resuming-a-stale-session guidance
  - Surfaced by: Empathy narrative / 0C Champion-tier target
  - Files: `CLAUDE.md`
  - Verify: done — section added
- [x] **T15 (P1, human: ~2-3hr / CC: ~20min)** — Content template — `docs/CONTENT-AUTHORING.md`
  - Surfaced by: Pass 4 / journey trace Hello World stage
  - Files: `docs/CONTENT-AUTHORING.md`
  - Verify: done — file created with annotated lesson + quiz shapes
- [x] **T16 (P1, human: ~2-3hr / CC: ~30-40min)** — Seed scripts — Shape validation before D1 writes, corrected by outside-voice review
  - Surfaced by: Pass 3, then corrected by outside-voice findings 1-3
  - Files: `scripts/seed-flagship-lesson.ts`, `scripts/seed-lesson-quiz.ts`
  - Verify: done — `npx tsc --noEmit` clean; both scripts validate every column their INSERTs bind (not a plausible subset), item-level question/contentBlock shape, and the quiz-link `UPDATE`'s rows-affected count
- [x] **T17 (P2, human: ~1hr / CC: ~15min)** — deploy.yml — Deploy-success visibility
  - Surfaced by: 0D magical moment
  - Files: `.github/workflows/deploy.yml`
  - Verify: done — `GITHUB_STEP_SUMMARY` announcement added; **not yet exercised** — `deploy.yml` has never run to completion (§16 outside-voice finding 5)
- [ ] **T18 (P3, human: ~1-2d / CC: ~2-3hr)** — Seed scripts — Atomic writes + concurrency control
  - Surfaced by: outside-voice finding 6 — no D1 `.batch()`/transaction wraps the DELETE-then-INSERT sequence, and no locking exists across parallel sessions writing to the same shared remote D1
  - Files: all `scripts/seed-*.ts`
  - Verify: two sessions racing the same unit/lesson id can no longer interleave DELETE/INSERT unpredictably — deferred, not built this session (see §12.11)

### Outside Voice (Claude subagent — Codex not installed), targeted at the DX findings and the actual edited files

Read §16 plus the real files it claimed to fix (`CLAUDE.md`, `docs/CONTENT-AUTHORING.md`, both seed scripts) — not just the plan's description of them. 6 findings, genuinely valuable — this pass caught real bugs in the DX review's own fixes, not just gaps in coverage:

1. **Validation checked a plausible-but-wrong subset of fields** — `unit.order`, `teacherGuide.objectives/materialsNeeded/differentiationTips` are all NOT NULL columns the INSERT binds unconditionally, none were checked; an omitted field became an explicit `null` crossing the fetch boundary, reproducing the exact silent-partial-write failure the fix claimed to close (with a stack trace instead of silence — still not what was promised). **FIXED**: both scripts now validate every column their own INSERTs bind.
2. **Quiz-linking `UPDATE` never checked rows-affected** — a typo'd `lessonId` prints a false-positive "Seeded... and linked" message while the quiz is written but wired to nothing. **FIXED**: checks `meta.changes`, exits non-zero on 0 rows.
3. **Validation was presence-only, not structural** — a question missing `answer`, an out-of-bounds answer index, a contentBlock missing `type`/`ref` all passed through untouched. **FIXED**: item-level checks added to both scripts.
4. **The GSTACK REVIEW REPORT table (this section, before this fix) still said "DX Review: not yet run"** directly under a completed §16 record with 4 checked-off tasks — exactly the rediscovery-cost confusion this whole review exists to prevent, and CLAUDE.md's new resume section now points fresh sessions at this file as authoritative. **FIXED**: table rewritten below, this is the fix.
5. **"Magical Moment: achieved" overclaimed verified confidence for an unexercised codepath** — `CLOUDFLARE_API_TOKEN` is still unset, `deploy.yml` has never run to completion. **FIXED**: reworded to "designed and built, not yet verified" throughout §16.
6. **No pass examined concurrency safety** for the persona this review itself defines (solo founder + *parallel* Claude Code sessions, which §14's own worktree-parallelization strategy plans around) — no D1 `.batch()`/transaction, no locking, real risk of interleaved writes. **NOT fixed this session** (genuinely bigger scope than a mechanical doc/validation fix) — added as T18, §9's risk table, and open decision §12.11.

Cross-model tension: none — every finding pointed at something the DX review's own claims got wrong when checked against the actual files, not a matter of differing judgment.

## Completion Summary (DX Review)
Four of the six outside-voice findings were fixed by correcting the original implementation tasks in place (not by adding new ones) — the validation and UPDATE-check fixes are more thorough versions of T16, not separate work. One (concurrency/atomicity) is real but deferred to T18, consistent with how the Eng review handled similarly-scoped infrastructure gaps. One TODOS-worthy item was not added to `TODOS.md` separately since T18 already captures it as an implementation task with a clear trigger (before Phase 0's parallel worktree lanes write to shared D1).

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 1 | issues_open (approval gate) | 4 scope proposals (3 accepted, 1 deferred); 11 spec-review findings + 11 outside-voice findings, all fixed or converted to founder decisions; Sections 1-4 findings resolved via AskUserQuestion |
| Outside Voice (CEO) | Claude subagent (Codex not installed) | Independent 2nd opinion | 1 | issues_found → absorbed | 11 findings: 6 resolved inline, 5 converted to founder open decisions (§12 #6-9, plus the pipeline-status correction folded into §12.3) |
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 1 | issues_open (approval gate) | 4 findings, all resolved (deploy automation built, code-splitting + N+1 batching required, quiz complexity kept as-is); test coverage diagram + artifact written; worktree parallelization strategy produced |
| Outside Voice (Eng) | Claude subagent (Codex not installed) | Independent 2nd opinion, targeted at the new deploy pipeline | 1 | issues_found → absorbed | 11 findings on the auto-merge/deploy infrastructure — 5 resolved by hardening the workflows (concurrency control, D1 migration step, post-deploy smoke test, matching CI/deploy build pipelines, path-scoped auto-merge), 1 new founder decision (§12 #10: no test suite exists), rest documented in §9's risk table |
| Design Review | `/plan-design-review` | UI/UX gaps | 1 | issues_open (approval gate) | Score 4/10 → 7/10 (capped pending DESIGN.md); 3 decisions made (K-2 icon nav, mobile dictionary bottom-sheet, design-system hard gate on §2 A1), 2 deferred to `/design-consultation` |
| DX Review | `/plan-devex-review` | Developer experience gaps | 1 | issues_open (approval gate) | Score 4.5/10 → 6.4/10 (weighted; low Community/Measurement scores appropriate for the solo-founder persona, not a gap); 4 tasks fixed in-repo (CLAUDE.md resume guidance, docs/CONTENT-AUTHORING.md, seed-script validation, deploy visibility) |
| Outside Voice (DX) | Claude subagent (Codex not installed) | Independent 2nd opinion, verified the DX review's own fixes against the actual edited files | 1 | issues_found → absorbed | 6 findings — caught real bugs in this session's own DX fixes (validation checked the wrong field subset, an UPDATE with no rows-affected check, a stale/self-contradicting report table, an overclaimed-verified deploy path); 5 corrected in-repo, 1 (seed-script atomicity/concurrency) deferred to T18 + §12.11 |

- **CROSS-MODEL:** no contradictions across any review pair — every outside-voice pass found genuinely new, non-overlapping ground, including catching this pipeline's own mistakes (the DX outside-voice pass corrected this review's own prior fixes, which is exactly what the pass exists to do).
- **VERDICT:** CEO + ENG + DESIGN + DX REVIEW COMPLETE — all four gstack reviews have run, per the founder's explicit instruction. Plan, CI/CD infrastructure, UI/UX specification, and contributor tooling are hardened, pending the founder's single approval gate (§12, 10 open of 11 original items — #5 resolved by research) plus Pass 5's DESIGN.md gate before Workstream A build starts. **Phase 0 build has started** (2026-09-04): D1 dictionary schema generalized (#184), Apple HIG design foundation added (#185), B1's OSPI standard research resolved.

**UNRESOLVED DECISIONS:**
- §12.1 — 36-week/180-lesson full-year target: confirm or correct
- §12.2 — K-2 language cadence: same density as 9-12, or lighter exposure-only?
- §12.3 — Wave pipeline was idle 12 days; resumed 2026-09-04 (PR #179) — confirm ongoing cadence alongside Phase 1
- §12.4 — Phase 3's four detailed-plan languages run in parallel with Phase 1/2, or wait?
- ~~§12.5~~ — RESOLVED (2026-09-04, Fable research pass) — see §3 B1's corrected, cited proficiency-banding table
- §12.6 — World Languages competitive scope: keep 3-build-now, or narrow to Punjabi on-ramp + Spanish only?
- §12.7 — Founder-review capacity: cap wave concurrency against your available review hours/week?
- §12.8 — English dictionary/spelling-bee sourcing: public-domain base (WordNet/Wiktionary) + AI adaptation, or different strategy?
- §12.9 — K-2 narration: TTS (as currently planned) or licensed human voice-over?
- §12.10 — No test suite exists; auto-merge/deploy currently unattended for content, human-required for schema/API/CI changes — right posture for now, or should content also require a review click until tests exist?
- §12.11 — Seed scripts have no atomic writes/concurrency control (DX outside-voice finding) — fix before Phase 0's parallel worktree lanes write to shared D1, or acceptable risk at current single-contributor scale?
- §15.7 — Course landing page design (the actual first-impression moment) has no spec anywhere in this plan — needs its own pass, not covered by this expansion plan's scope
- §15.7 — K-2 icon set: custom-illustrated (higher production value, real cost) or a licensed library (faster, generic-look risk)? Recommend deciding inside `/design-consultation`
- + `CLOUDFLARE_API_TOKEN` repo secret still needs to be added by the founder before `deploy.yml` can actually deploy anything — everything up to that point is built and CI-validated; nothing has deployed to production yet, and the "auto-merge → auto-deploy" magical moment is designed and built but not yet verified end-to-end (§16 outside-voice finding 5).
- + An OpenAI API key would let future design reviews generate real mockups instead of text-only specification (§15's system audit) — not blocking, but the next design pass will hit the same wall without it.

---

**Post-review real-world verification (2026-09-04, same day) — two bugs the review pipeline itself couldn't have caught without actually running it:**

1. **D1 migration path.** PR #180's merge triggered `deploy.yml` for the first time ever. It failed at the new migration step: `wrangler d1 migrations apply` defaults to `./migrations`, but this repo's migrations live at `drizzle/migrations/`. Production was never touched (fails before the deploy step, exactly as designed). **Fixed** in `wrangler.jsonc` (added `migrations_dir`) via PR #181.
2. **Auto-merge silently defeated the very deploy automation it was supposed to trigger.** PR #181 merged via GitHub's platform auto-merge (enabled by the `auto-merge.yml` workflow using `GITHUB_TOKEN`) — and produced **zero** `Deploy` workflow runs, confirmed by checking Actions directly. This is a documented GitHub Actions restriction: events resulting from `GITHUB_TOKEN`-initiated actions don't cascade into new workflow runs, and it applies to auto-merge completions. The core "PR opens → green CI → auto-merges → live in production" magical moment (§16) was **broken by construction**, not just unverified. **Fixed**: `auto-merge.yml` now polls for the actual merge and explicitly dispatches `deploy.yml` via `workflow_dispatch` (which *is* exempt from the restriction) instead of relying on the implicit `push` trigger.

Worth naming plainly: **the four-review pipeline caught a lot — 44+ findings across CEO/Eng/Design/DX and their outside-voice passes — but it took actually running the thing for real, twice, to catch these two bugs.** Both are exactly the kind of issue that only surfaces in execution, not review: a wrong default path, and a platform-level event-cascade restriction neither Claude model in this pipeline's training data reliably surfaces without hitting it. Reviews reduce risk; they don't replace verification. `CLOUDFLARE_API_TOKEN` is still not set, so the next real merge will get further (past migrations, and now with the explicit deploy dispatch) but still fail at the actual `wrangler deploy` step until the founder adds that secret — expected, not a new bug.

*All four gstack reviews (CEO, Eng, Design, DX) are complete. Next: the founder's single approval gate on §12's 11 open decisions, then Phase 0 implementation can begin — matching the process used for the aim528, cert-prep, and DosanjhLabs world-class plans.*
