"use client";

import { useRef, useState } from "react";
import type { GameStepProps } from "./types";

interface Item {
  audioUrl: string;
  question: string;
  options: string[];
  answer: number;
}

// Listen, then answer. Each item pairs a clip with one multiple-choice question
// about what was heard, batched and checked in one go like MultipleChoiceStep —
// a child can replay any clip as often as they like before committing, which is
// the point of comprehension practice rather than a memory test.
//
// audioUrl is whatever the config says it is (a cached TTS phrase, a recorded
// clip): this component only ever plays a URL. Generating or caching that audio
// is separate infrastructure and none of this component's business.
export default function ListeningComprehensionStep({ config, onFinish }: GameStepProps) {
  const items = (config.items as Item[] | undefined) ?? [];
  const [selected, setSelected] = useState<number[]>(new Array(items.length).fill(-1));
  const [checked, setChecked] = useState(false);
  // Native controls already cover play/pause; this ref exists only so "Play
  // again" can rewind to the start, which the native control can't do in one tap.
  const players = useRef<(HTMLAudioElement | null)[]>([]);

  if (items.length === 0) return null;

  const correctCount = items.reduce((n, item, i) => (selected[i] === item.answer ? n + 1 : n), 0);

  function replay(i: number) {
    const el = players.current[i];
    if (!el) return;
    el.currentTime = 0;
    // play() rejects if the clip can't load (bad URL, offline) — the native
    // controls surface that state themselves, so there's nothing to add here
    // beyond not throwing an unhandled rejection.
    void el.play().catch(() => {});
  }

  return (
    <div className="flex flex-col gap-6">
      {items.map((item, qi) => (
        <fieldset key={qi} className="flex flex-col gap-2">
          <legend className="font-medium">
            {qi + 1}. {item.question}
          </legend>

          <div className="flex flex-wrap items-center gap-3">
            <audio
              ref={(el) => {
                players.current[qi] = el;
              }}
              src={item.audioUrl}
              controls
              preload="none"
              className="max-w-full"
            />
            <button
              type="button"
              onClick={() => replay(qi)}
              className="px-3 py-2 text-sm font-medium"
              style={{
                borderRadius: "var(--shell-radius, 0.5rem)",
                minHeight: "var(--shell-touch, 2.75rem)",
                border: "1px solid color-mix(in srgb, var(--shell-ink, #000) 20%, transparent)",
                background: "transparent",
              }}
            >
              Play again
            </button>
          </div>

          {item.options.map((opt, oi) => {
            const isAnswer = oi === item.answer;
            const isPicked = selected[qi] === oi;
            return (
              <label
                key={oi}
                className="flex items-center gap-2 px-2 py-1 text-sm"
                style={{
                  minHeight: "var(--shell-touch, 2.75rem)",
                  borderRadius: "var(--shell-radius, 0.5rem)",
                  background:
                    checked && (isAnswer || isPicked)
                      ? `color-mix(in srgb, ${isAnswer ? "var(--color-success)" : "var(--color-error)"} 20%, transparent)`
                      : "transparent",
                }}
              >
                <input
                  type="radio"
                  name={`listening-${qi}`}
                  disabled={checked}
                  checked={isPicked}
                  onChange={() => setSelected((prev) => prev.map((v, i) => (i === qi ? oi : v)))}
                />
                {opt}
              </label>
            );
          })}
        </fieldset>
      ))}

      {!checked ? (
        <button
          type="button"
          disabled={selected.some((s) => s < 0)}
          onClick={() => setChecked(true)}
          className="self-start px-4 py-2 text-sm font-semibold disabled:opacity-60"
          style={{
            borderRadius: "var(--shell-radius, 0.5rem)",
            minHeight: "var(--shell-touch, 2.75rem)",
            background: "var(--shell-accent, #f4b21a)",
            color: "var(--shell-on-accent)",
          }}
        >
          Check my answers
        </button>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <p className="font-semibold" role="status">
            {correctCount} of {items.length} correct
          </p>
          <button
            type="button"
            onClick={() => onFinish({ correct: correctCount, total: items.length })}
            className="px-4 py-2 text-sm font-semibold"
            style={{
              borderRadius: "var(--shell-radius, 0.5rem)",
              minHeight: "var(--shell-touch, 2.75rem)",
              background: "var(--shell-accent, #f4b21a)",
              color: "var(--shell-on-accent)",
            }}
          >
            Save my score
          </button>
        </div>
      )}
    </div>
  );
}
