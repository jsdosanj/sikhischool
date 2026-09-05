# Design System — Sikhi School

Written by `/design-consultation` per docs/plans/expansion-plan-2026-09.md §2 Workstream A (A0/A1). This is the blocking prerequisite the design review (§15) required before any component in A2-A5 is built — real values, not vibes.

**Memorable thing:** "This doesn't feel like a free thing." Every decision below should serve that one sentence. A choice that doesn't serve it is decoration, not design.

## Product Context
- **What this is:** A free K-12 curriculum platform (math, ELA, science, social studies, world languages, Punjabi, Sikhi) for families and classrooms.
- **Who it's for:** Parents and kids ages 5-18, and public-school/homeschool teachers — not adult self-directed learners (that's sikhiuni.com's audience, a separate design system).
- **Space/industry:** K-12 ed-tech, homeschool curriculum, world-language learning.
- **Project type:** Web app (Next.js/Cloudflare Workers), three grade-banded shells sharing one system.
- **Reference sites researched (2026-09-04):** Khan Academy (bot-blocked, not captured — general knowledge only), Duolingo, IXL, Apple.com, Linear.app.

## Aesthetic Direction
- **Direction:** Quiet Confidence — a restrained, editorial register for older bands; warmth and illustration earned only by the youngest.
- **Decoration level:** intentional (subtle depth/shadow per Apple HIG's "Depth" principle; warmth concentrated in `little-sparks` and achievement moments, restrained everywhere else).
- **Mood:** Considered, edited, unhurried. The opposite of a dashboard that's trying to look busy to justify its price — this one is free and should look like it wasn't.
- **The gap found in research:** every K-12 competitor (Duolingo, IXL, and Khan Academy from prior knowledge) treats "kid-friendly" as synonymous with cartoon-mascot illustration. That's a ceiling, not a floor — it caps how credible the same visual language can look to a skeptical teacher or a 12-year-old. Apple and Linear hit "premium" the same way: real content as the hero, one confident message per section, generous whitespace, restrained color. No K-12 platform currently borrows that register. This system does, for grades 3-12; `little-sparks` (K-2) keeps the warmth a 6-year-old actually needs.
- **Reference sites:** https://apple.com, https://linear.app (premium register to emulate — not to copy); https://www.duolingo.com, https://www.ixl.com (category defaults to differentiate from).

## Typography
- **Display/Hero:** Fraunces, 600 weight (500 italic for asides/quotes) — a literary serif with real character. Signals "someone with taste made this," not "another SaaS template." [RISK — most ed-tech competitors use a rounded friendly sans for headlines; this is the single fastest way to not look like them.]
- **Body:** Source Sans 3 — chosen over the [overused list] specifically for legibility at small sizes, since a meaningful share of this audience is an early reader sounding out words.
- **UI/Labels:** Source Sans 3, 600 weight for labels/buttons.
- **Data/Tables:** Geist, tabular-nums — mastery percentages, streak counts, roster tables must align in a grid.
- **Code:** not applicable (no developer-facing surface in the kid/family/teacher product).
- **Loading:** Google Fonts (`Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,500`, `Source+Sans+3:wght@400;500;600;700`, `Geist:wght@400;500;600`).
- **Scale:** hero 40-68px (clamp, fluid) / section-title 34px / card-display 30px / body 16-17px (never below 16px, §1.1's accessibility floor) / label 12-13px, all with generous line-height (1.6-1.75 for body copy).

## Color
- **Approach:** restrained — one signature accent, warm neutrals, semantic colors used sparingly. [RISK — warm amber instead of the blue/green every competitor converges on.]
- **Primary (amber-600):** `#C7691A` (light) / `#E0923D` (dark) — the signature accent. Used for primary actions, active nav state, progress indicators. Never as a background wash.
- **Ink (text, dark surfaces):** `#211D1A` (light-mode text) / `#F3EDE6` (dark-mode text) — warm near-black/near-white, not pure `#000`/`#FFF`.
- **Ink-500 (muted text):** `#766C62` (light) / `#A69A8D` (dark).
- **Ink-100 (borders/dividers):** `#E4DDD3` (light) / `#3A332D` (dark).
- **Background (cream-50):** `#FBF8F4` (light) / `#1A1614` (dark) — warm, not stark white or pure black.
- **Card/surface:** `#FFFFFF` (light) / `#241F1C` (dark) — floats one step lighter than the page background for HIG-style depth.
- **Semantic:** success (sage) `#5B7A5B`/`#8FB08C`, warning (gold) `#B8860B`/`#D9B23D`, error (brick) `#B34A3A`/`#D9776A`, info (dusk) `#5B7A9A`/`#8CAAC7` — all warm-shifted to sit inside the same family as the primary, not generic Bootstrap red/green/blue.
- **Dark mode:** full token swap (not just inverted lightness) — surfaces get warmer and slightly desaturated, matching how the DESIGN preview's dark pass actually renders (verified via screenshot, both themes).

## Spacing
- **Base unit:** 8px.
- **Density:** comfortable-to-spacious — generous whitespace is load-bearing for the "millions of dollars" bar, and it aids readability for early/struggling readers.
- **Scale:** 2xs(4) xs(8) sm(12) md(16) lg(24) xl(32) 2xl(48) 3xl(64) 4xl(96).

## Layout
- **Approach:** grid-disciplined, content-first. One primary action per screen — matches the design review's existing lesson-hierarchy work (§15 Pass 1) and Apple's "one message per section."
- **Grid:** single-column content max-width ~56-60ch for reading passages; 2-3 column card grids for dashboards/rosters; `little-sparks` uses a large-tile 2-3 column grid, never a dense list.
- **Max content width:** 1180px for marketing/system surfaces; lesson reading columns stay narrower (56ch) for legibility regardless of viewport.
- **Border radius:** sm 6px (inputs, small controls) / md 12px (buttons, cards) / lg 20px (feature cards, mockup frames) / `little-sparks` tiles use a larger 28px radius — the one place radius gets playful, matching that shell's decoration level.

## Motion
- **Approach:** intentional — subtle entrance/state transitions only (e.g. theme toggle, popover appearance), never decorative. Honors `prefers-reduced-motion`.
- **Easing:** enter `ease-out`, exit `ease-in`, move `ease-in-out`.
- **Duration:** micro 100ms (hover/focus) / short 200ms (toggles, popovers) / medium 300ms (theme swap, page transitions) / long 500ms (celebratory/achievement moments only, and only in `little-sparks`).

## Accessibility floor (binding, carries §1.1/§15's existing commitments)
- Body text never below 16px; contrast ≥4.5:1 in both themes.
- Touch targets ≥44px generally, ≥60px in `little-sparks` (smaller fingers, less precision).
- `little-sparks` navigation is icon-first with tap-and-hold audio labels (§2 A1a) — never text-only.
- Keyboard parity for every interactive element (no mouse/touch-only interactions) — already binding on the games engine (§4 C1).

## Three shells, one system
| Shell | Grades | Decoration | What changes |
|---|---|---|---|
| `little-sparks` | K-2 | expressive-within-restraint | Illustration/mascot warmth allowed, icon-first nav, largest touch targets, warm gradient backgrounds (see preview) |
| `rising-school` | 3-8 | intentional | Content-first, editorial serif headlines, restrained color, real UI (no mascots) |
| `sikhi-school-studio` | 9-12 | minimal-intentional | Same tokens as rising-school, tightened density, most "adult SaaS"-adjacent of the three (teacher-dashboard register) |

All three read as one brand because every token (color, type, spacing, radius scale) is shared — only decoration level and density shift.

## Preview artifact
Full interactive HTML preview (font specimens, color palette + components, three realistic mockups — rising-school lesson with dictionary lookup + embedded matching game, little-sparks home, teacher dashboard — light/dark toggle) generated 2026-09-04. Not committed to the repo (design artifacts are working references, not source) — regenerate via `/design-consultation` if needed, or ask the session that built it.

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-09-04 | Initial design system created | `/design-consultation`, grounded in Apple HIG (founder directive) + live research (Duolingo/IXL/Apple/Linear screenshots via gstack browse) + the design review's prior findings (§15) |
| 2026-09-04 | Fraunces + amber accent chosen as deliberate risks | Every K-12 competitor uses a friendly rounded sans + blue/green — this is the fastest way to not look like them, in service of "this doesn't feel like a free thing" |
| 2026-09-04 | Illustration warmth reserved for `little-sparks` only | Research finding: competitors apply cartoon-mascot visual language uniformly K-12, which caps credibility with teachers/older kids — a genuine differentiation, not just taste |
