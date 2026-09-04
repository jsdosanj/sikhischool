"use client";

import GameActivity from "./GameActivity";
import { STEP_TYPES } from "./registry";
import type { ActivityRef } from "./types";

interface Child {
  id: string;
  displayName: string;
}

// The activityRefs renderer (plan §4 C1): takes a lesson's authored activity
// list and renders each entry through its step-type component. Games and
// exercises render identically — `type` is an authoring/reporting label, not a
// different rendering path.
//
// This is a Client Component on purpose: Next.js doesn't code-split a Client
// Component that a *Server* Component imports dynamically, so doing the
// registry lookup here rather than in the lesson page is what makes the
// per-step-type chunking in registry.ts actually happen.
export default function LessonActivities({
  lessonId,
  activityRefs,
  kids,
}: {
  lessonId: string;
  activityRefs: ActivityRef[];
  kids: Child[];
}) {
  // A componentKey with no component in this build is skipped, not thrown —
  // content can legitimately be authored ahead of a step-type shipping, and a
  // lesson's text should never 500 because of a game.
  const known = activityRefs.filter((a) => Object.hasOwn(STEP_TYPES, a.componentKey));
  if (known.length === 0) return null;

  return (
    <section className="mt-8 flex flex-col gap-4">
      <h2 className="text-lg font-semibold" style={{ fontFamily: "var(--shell-display-font)" }}>
        Practice &amp; play
      </h2>
      {known.map((activity, i) => (
        <GameActivity
          key={`${activity.componentKey}-${i}`}
          lessonId={lessonId}
          activity={activity}
          kids={kids}
        />
      ))}
    </section>
  );
}
