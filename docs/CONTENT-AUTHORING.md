# Content authoring reference

Fast-reference companion to `drizzle/schema.ts` — not a replacement for it. When in
doubt about a field's exact type/constraints, check the schema; this doc exists so a
session doesn't have to reverse-engineer the *shape* from an example file every time.

Added per the DX review in `docs/plans/expansion-plan-2026-09.md` §16 — 178 PRs proved
the pattern works, but every new content type (dictionary entries, game configs,
language-course units, placement-quiz items — all landing via that plan) hits the same
discovery cost fresh without this.

## Lesson JSON shape

One file per lesson: `data/flagship-lessons/<subject>-<grade>-<week>-<day>.json`
(e.g. `ela-1-1-1.json` = ELA, grade 1, week 1, day 1). Seeded via
`npx tsx scripts/seed-flagship-lesson.ts <path>`.

```json
{
  "unit": {
    "id": "unit-<subject>-<grade>-<week>",
    "courseId": "course-<subject>-<grade>",
    "order": 1,
    "title": "The week's theme, e.g. 'Reading CVC Words and Simple Sentences'",
    "weekOfYear": 1
  },
  "lesson": {
    "id": "lesson-<subject>-<grade>-<week>-<day>",
    "unitId": "unit-<subject>-<grade>-<week>",
    "order": 1,
    "dayOfWeek": 1,
    "title": "The specific day's lesson title",
    "gradeLevel": "1",
    "subject": "ela",
    "contentBlocks": [
      {
        "type": "text",
        "ref": "hook",
        "text": "Opens the lesson — 2-4 sentences connecting to what the kid already knows."
      }
      // more blocks: type is "text" | "video" | "interactive" | "image" | "audio".
      // "ref" is a semantic label ("hook", "explanation", "closing", ...), free text.
      // For image/video/audio blocks: "src" carries the real URL/YouTube-ID/R2-key,
      // "caption" carries attribution — never fabricate a URL or video ID.
    ],
    "aiGenerated": true,
    "aiReviewStatus": "pending"
    // aiReviewStatus is always "pending" at authoring time — the human/scholar
    // review pipeline advances it later. Never set this to "human-reviewed" yourself.
  },
  "teacherGuide": {
    "id": "guide-<same-id-as-lesson>",
    "lessonId": "lesson-<subject>-<grade>-<week>-<day>",
    "objectives": ["1-3 concrete, observable learning objectives"],
    "materialsNeeded": ["What a teacher/parent needs on hand"],
    "facilitationScript": "Numbered steps a non-expert adult can follow to teach this.",
    "differentiationTips": ["Struggling: ...", "Advanced: ...", "..."],
    "estimatedMinutes": 15,
    "answerKey": "What correct completion looks like, for the worksheet/activity.",
    "standardsRationale": "Why THIS content, THIS week, for THIS grade — ties to the
      course's stated scope-and-sequence, not just 'because the standard says so'."
  },
  "worksheet": {
    "id": "worksheet-<same-id-as-lesson>",
    "lessonId": "lesson-<subject>-<grade>-<week>-<day>",
    "title": "Worksheet title",
    "generationTemplateKey": "trace-and-write-v1",
    // ^ picks which client-side react-pdf template renders this — see
    // src/components/worksheets/ for the available template keys.
    "generationData": {
      // shape is template-specific — match an existing worksheet using the
      // same generationTemplateKey to see the expected fields.
    }
  }
}
```

**Every lesson gets a Worksheet + TeacherGuide — no exceptions** (CLAUDE.md's
load-bearing constraint). A lesson JSON missing either object is incomplete, not a
valid partial submission.

## Quiz JSON shape

`data/quizzes/<subject>-<grade>-<week>-<day>.json`, seeded via
`npx tsx scripts/seed-lesson-quiz.ts <path>`:

```json
{
  "lessonId": "lesson-<subject>-<grade>-<week>-<day>",
  "quiz": {
    "id": "quiz-<subject>-<grade>-<week>-<day>",
    "level": "lesson",
    "masteryWeight": 1,
    "questions": [
      { "q": "Question text", "options": ["A", "B", "C", "D"], "answer": 0 }
      // "answer" is the 0-indexed position of the correct option in "options".
    ]
  }
}
```

## Marking a word for dictionary lookup — `[[word]]`

Inside any **text** content block, wrap a word in double square brackets to make it
tappable. The reader sees a dotted underline; clicking or tapping it opens the word's
dictionary entry — a small popover under the word on desktop, a bottom sheet on phones.
Reading never leaves the page.

```json
{
  "type": "text",
  "ref": "explanation",
  "text": "A [[glacier]] is a river of ice that moves very slowly downhill."
}
```

Rules worth knowing before you author against it:

- **The word must exist in the `dictionary` table for that lesson's language**, matched
  exactly (case doesn't matter, but spelling and any diacritics do). If it isn't there
  yet, the word still underlines and still opens — it just says *"No definition yet."*
  That's a deliberate non-error: passages get authored before dictionary rows land.
- **Language comes from the lesson's `subject`, not from the markup.** Today `ela` looks
  up the `english` dictionary, and `punjabi` and `sikhi` both look up `punjabi`. In any
  other subject the brackets are simply stripped and the word renders as ordinary text —
  so marking a word in a science lesson is harmless, just inert until that subject gets a
  dictionary mapping.
- **Mark the word, not the phrase.** One entry per lookup; `[[glacier]]`, not
  `[[a river of ice]]`. Nested or unclosed brackets aren't parsed as markup.
- Use it where a word is genuinely likely to stop a reader at that grade level. A passage
  with a lookup on every third word reads as noise and stops meaning anything.

## New content types (this doc grows as each workstream ships)

`docs/plans/expansion-plan-2026-09.md` adds dictionary entries (§5), game
`activityRefs` configs (§4), language-course lesson units (§3), and placement-quiz
items (§3) — each gets its own annotated section here once that workstream's schema
lands, following the same pattern as the two sections above.
