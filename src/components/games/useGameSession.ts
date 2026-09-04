"use client";

import { useEffect, useReducer } from "react";
import type { GameResult } from "./types";

// The game-instance state machine from the plan's §14 spec, verbatim:
//
//   NotStarted --start--> InProgress --finish--> Completed --submit--> Submitted
//                              |                                            |
//                              | tab close / navigate away                  | retry
//                              v                                            v
//                          Abandoned ------------- retry -------------> NotStarted
//
// The guards are the point, not decoration:
//  - "finish" only lands from in-progress, so an abandoned run can never submit
//    partial credit.
//  - there is no submitted -> in-progress edge. Retry always resets to
//    not-started with a fresh runId, so a stale in-progress run is never
//    silently resumed.
//  - abandoning carries no penalty: it just means nothing is ever submitted.

export type GamePhase = "not-started" | "in-progress" | "completed" | "submitted" | "abandoned";

export interface GameSessionState {
  phase: GamePhase;
  result: GameResult | null;
  // Bumped on every retry and used as the step component's React key, so a
  // replay remounts it clean instead of inheriting the previous run's state.
  runId: number;
}

export type GameSessionAction =
  | { type: "start" }
  | { type: "finish"; result: GameResult }
  | { type: "submitted" }
  | { type: "abandon" }
  | { type: "retry" };

const INITIAL: GameSessionState = { phase: "not-started", result: null, runId: 0 };

function reducer(state: GameSessionState, action: GameSessionAction): GameSessionState {
  switch (action.type) {
    case "start":
      return state.phase === "not-started" ? { ...state, phase: "in-progress", result: null } : state;
    case "finish":
      return state.phase === "in-progress" ? { ...state, phase: "completed", result: action.result } : state;
    case "submitted":
      return state.phase === "completed" ? { ...state, phase: "submitted" } : state;
    case "abandon":
      return state.phase === "in-progress" ? { ...state, phase: "abandoned", result: null } : state;
    case "retry":
      return state.phase === "in-progress" || state.phase === "not-started"
        ? state
        : { phase: "not-started", result: null, runId: state.runId + 1 };
  }
}

export function useGameSession() {
  const [state, dispatch] = useReducer(reducer, INITIAL);

  // A run still in progress when the page goes away is Abandoned. Usually the
  // page really is gone and this is moot, but `pagehide` also fires when a
  // mobile browser backgrounds the tab into the bfcache — and there the page
  // comes back with its JS state intact. Marking it Abandoned means the child
  // returns to "no penalty, start again" instead of a stale half-played run.
  useEffect(() => {
    if (state.phase !== "in-progress") return;
    const abandon = () => dispatch({ type: "abandon" });
    window.addEventListener("pagehide", abandon);
    return () => window.removeEventListener("pagehide", abandon);
  }, [state.phase]);

  return [state, dispatch] as const;
}
