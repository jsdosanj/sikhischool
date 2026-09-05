#!/usr/bin/env bash
# Plan §2 A5: the design system is RTL-ready from day one so Arabic (B8) never
# needs a layout retrofit. Stylelint (.stylelintrc.json) catches physical-
# direction properties in raw CSS, but it can't see inside a JSX `className`
# string — this catches the actual place those violations live: Tailwind's
# physical-direction utility classes (pl-*, mr-*, text-left, etc.) in .tsx
# files. Logical equivalents exist for all of these in Tailwind v4
# (ps-*/pe-*, ms-*/me-*, text-start/text-end, start-*/end-*, rounded-s-*/e-*).
#
# A discipline with nothing exercising it for years tends to rot silently —
# this is the thing that catches a future `pl-4` before it ships.
set -euo pipefail
cd "$(dirname "$0")/.."

PATTERN='\b(pl|pr|ml|mr)-[0-9]+(\.[0-9]+)?\b|\b(left|right)-[0-9]+\b|\btext-(left|right)\b|\bfloat-(left|right)\b|\brounded-[tb]?[lr](-[a-z]+)?-[a-z0-9]+\b'

matches=$(grep -rnoE "$PATTERN" src --include="*.tsx" --include="*.ts" || true)

if [ -n "$matches" ]; then
  echo "RTL-safety check failed — physical-direction Tailwind utility found:" >&2
  echo "$matches" >&2
  echo "" >&2
  echo "Use the logical equivalent: pl-/pr- -> ps-/pe-, ml-/mr- -> ms-/me-," >&2
  echo "text-left/right -> text-start/end, left-N/right-N -> start-N/end-N." >&2
  exit 1
fi

echo "RTL-safety check passed — no physical-direction utilities found."
