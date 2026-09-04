"use client";

import { useState } from "react";
import { shuffle } from "./shuffle";
import type { GameStepProps } from "./types";

interface Pair {
  left: string;
  right: string;
}

// Matching pairs, played by picking one tile then its partner.
//
// On WCAG AA (plan §3 B1's spec-review finding): there is no separate "keyboard
// mode" here because there's nothing to retrofit — every tile is a real
// <button>, so tab-and-Enter is the same interaction the mouse and the finger
// get, announced through one live region. A drag-and-drop version would have
// needed a parallel keyboard path; select-then-select needs none, which is both
// the accessible answer and the smaller one.
export default function MatchingPairsStep({ config, onFinish }: GameStepProps) {
  const pairs = (config.pairs as Pair[] | undefined) ?? [];
  const instructions = (config.instructions as string | undefined) ?? "Pick a card on the left, then its match on the right.";

  // Shuffled once per run — the run's key changes on retry, remounting this.
  const [rightColumn] = useState(() => shuffle(pairs.map((p, i) => ({ pairIndex: i, text: p.right }))));
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [matched, setMatched] = useState<number[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [feedback, setFeedback] = useState("");

  if (pairs.length === 0) return null;

  function pickRight(pairIndex: number) {
    if (selectedLeft === null) {
      setFeedback("Pick a card on the left first.");
      return;
    }
    if (pairIndex === selectedLeft) {
      const nowMatched = [...matched, pairIndex];
      setMatched(nowMatched);
      setSelectedLeft(null);
      setFeedback(`Matched! ${nowMatched.length} of ${pairs.length}.`);
      if (nowMatched.length === pairs.length) {
        // One wrong guess costs one point; a clean run scores full marks.
        onFinish({ correct: Math.max(pairs.length - mistakes, 0), total: pairs.length });
      }
      return;
    }
    setMistakes((m) => m + 1);
    setSelectedLeft(null);
    setFeedback("Not a match — try again.");
  }

  const tileStyle = {
    borderRadius: "var(--shell-radius, 0.5rem)",
    minHeight: "var(--shell-touch, 2.75rem)",
    border: "1px solid color-mix(in srgb, var(--shell-ink, #000) 20%, transparent)",
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm opacity-80">{instructions}</p>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          {pairs.map((p, i) => {
            const isMatched = matched.includes(i);
            return (
              <button
                key={i}
                type="button"
                disabled={isMatched}
                aria-pressed={selectedLeft === i}
                onClick={() => setSelectedLeft(i)}
                className="px-3 py-2 text-sm font-medium disabled:opacity-45"
                style={{
                  ...tileStyle,
                  background:
                    selectedLeft === i
                      ? "color-mix(in srgb, var(--shell-accent, #f4b21a) 30%, transparent)"
                      : isMatched
                        ? "color-mix(in srgb, var(--shell-accent-2, #4fb8a8) 20%, transparent)"
                        : "transparent",
                }}
              >
                {p.left}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-2">
          {rightColumn.map((r) => {
            const isMatched = matched.includes(r.pairIndex);
            return (
              <button
                key={r.pairIndex}
                type="button"
                disabled={isMatched}
                onClick={() => pickRight(r.pairIndex)}
                className="px-3 py-2 text-sm font-medium disabled:opacity-45"
                style={{
                  ...tileStyle,
                  background: isMatched
                    ? "color-mix(in srgb, var(--shell-accent-2, #4fb8a8) 20%, transparent)"
                    : "transparent",
                }}
              >
                {r.text}
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-sm font-medium" role="status">
        {feedback}
      </p>
    </div>
  );
}
