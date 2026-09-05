"use client";

import { useEffect, useRef, useState } from "react";
import { shuffle } from "./shuffle";
import type { GameStepProps } from "./types";

interface DeckItem {
  prompt: string;
  answer: string;
}

const ADVANCE_MS = 550;

// Rapid-fire flashcard drill for large vocabularies (language words, spelling
// lists, science terms): one prompt at a time, four choices, no submit button,
// auto-advance on tap, running streak. Written natively — the speed/streak
// drilling *feel* is the reference (plan §0), none of its code.
//
// Distractors are drawn from the deck itself, so a 40-word deck needs no
// separate wrong-answer authoring — the config stays a flat prompt/answer list.
export default function SpeedDrillStep({ config, onFinish }: GameStepProps) {
  const deck = (config.deck as DeckItem[] | undefined) ?? [];
  const rounds = (config.rounds as number | undefined) ?? deck.length;

  // The whole run — order and options — is decided once, up front. Rebuilding
  // options per render would reshuffle the buttons mid-tap.
  const [run] = useState(() =>
    shuffle(deck)
      .slice(0, Math.min(rounds, deck.length))
      .map((item) => ({
        prompt: item.prompt,
        answer: item.answer,
        options: shuffle([
          item.answer,
          ...shuffle([...new Set(deck.map((d) => d.answer))].filter((a) => a !== item.answer)).slice(0, 3),
        ]),
      })),
  );

  const [index, setIndex] = useState(0);
  const [answered, setAnswered] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  if (run.length === 0) return null;
  const current = run[index];

  function choose(option: string) {
    if (answered !== null) return; // mid-advance; ignore double taps
    const isRight = option === current.answer;
    const nextCorrect = correct + (isRight ? 1 : 0);
    const nextStreak = isRight ? streak + 1 : 0;
    setAnswered(option);
    setCorrect(nextCorrect);
    setStreak(nextStreak);
    setBestStreak((b) => Math.max(b, nextStreak));

    timer.current = setTimeout(() => {
      setAnswered(null);
      if (index + 1 >= run.length) {
        onFinish({ correct: nextCorrect, total: run.length });
      } else {
        setIndex(index + 1);
      }
    }, ADVANCE_MS);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between text-sm">
        <span className="opacity-70">
          {index + 1} / {run.length}
        </span>
        <span className="font-semibold" style={{ color: "var(--shell-accent, #f4b21a)" }}>
          Streak {streak}
          {bestStreak > 0 && <span className="ms-2 font-normal opacity-70">best {bestStreak}</span>}
        </span>
      </div>

      <p className="py-6 text-center text-3xl font-bold" style={{ fontFamily: "var(--shell-display-font)" }}>
        {current.prompt}
      </p>

      <div className="grid grid-cols-2 gap-2">
        {current.options.map((option) => {
          const isAnswer = option === current.answer;
          const isPicked = answered === option;
          return (
            <button
              key={option}
              type="button"
              disabled={answered !== null}
              onClick={() => choose(option)}
              className="px-3 py-3 text-sm font-medium transition disabled:opacity-100"
              style={{
                borderRadius: "var(--shell-radius, 0.5rem)",
                minHeight: "var(--shell-touch, 2.75rem)",
                border: "1px solid color-mix(in srgb, var(--shell-ink, #000) 20%, transparent)",
                background:
                  answered !== null && isAnswer
                    ? "color-mix(in srgb, var(--color-success) 25%, transparent)"
                    : isPicked
                      ? "color-mix(in srgb, var(--color-error) 25%, transparent)"
                      : "transparent",
              }}
            >
              {option}
            </button>
          );
        })}
      </div>

      <p className="text-sm font-medium" role="status">
        {answered === null ? "" : answered === current.answer ? "Correct!" : `The answer was ${current.answer}.`}
      </p>
    </div>
  );
}
