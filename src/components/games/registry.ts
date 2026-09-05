import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { GameStepProps } from "./types";

// componentKey -> step-type component, one `next/dynamic` import each, so a
// lesson page ships only the JS for the step-types its activityRefs actually
// name rather than all of them (plan §4 C1, eng review §14 finding 3).
//
// Two constraints worth knowing before editing this:
//  - the import path has to stay a literal string; next/dynamic can't match a
//    bundle from a template string or a variable.
//  - dynamic() must stay at module top level, not inside a render.
//
// Adding a step-type is: write the component, add one line here. Nothing else
// in the engine knows how many step-types exist.
export const STEP_TYPES: Record<string, ComponentType<GameStepProps>> = {
  "multiple-choice-v1": dynamic(() => import("./MultipleChoiceStep")),
  "matching-pairs-v1": dynamic(() => import("./MatchingPairsStep")),
  "speed-drill-v1": dynamic(() => import("./SpeedDrillStep")),
  "translate-v1": dynamic(() => import("./TranslateStep")),
  "cloze-v1": dynamic(() => import("./ClozeStep")),
  "listening-comprehension-v1": dynamic(() => import("./ListeningComprehensionStep")),
  "build-the-sentence-v1": dynamic(() => import("./BuildTheSentenceStep")),
  "speaking-prompt-v1": dynamic(() => import("./SpeakingPromptStep")),
};
