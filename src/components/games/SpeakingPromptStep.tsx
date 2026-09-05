"use client";

import { useEffect, useRef, useState } from "react";
import type { GameStepProps } from "./types";

interface Item {
  prompt: string;
}

// Say-it-out-loud practice, with self-review playback.
//
// COPPA (plan §3 B1, binding): a recording of a child's voice is sensitive
// wherever it lands, so it lands nowhere. The clip lives as a Blob object URL
// in this component's state for the length of the visit and nothing else — no
// fetch, no upload, no R2, no row on ChildProfile or studentProgress, and it is
// never handed to onFinish or any other parent callback. Re-recording and
// unmounting revoke the URL. Nothing is retained, so no retention policy is
// needed. Anyone adding a "save your recording" feature here is opening a new
// PII surface and needs to go back to the plan first.
//
// Not graded in v1 (plan §10 — no speech-grading infrastructure exists, and
// guessing at pronunciation accuracy in its absence would be worse than not
// scoring). GameResult has no "attempted but unscored" state, so participating
// scores full marks: the honest reading of {correct: total} here is "completed
// the activity", and it keeps an ungraded step from dragging a lesson's mastery
// points down for work the engine can't actually assess.
export default function SpeakingPromptStep({ config, onFinish }: GameStepProps) {
  const items = (config.items as Item[] | undefined) ?? [];
  const [clips, setClips] = useState<(string | null)[]>(new Array(items.length).fill(null));
  const [recordingIndex, setRecordingIndex] = useState<number | null>(null);
  const [notice, setNotice] = useState("");
  // Set when the browser has no MediaRecorder or the mic was refused. Recording
  // is then impossible for the whole visit, so the Done button stops waiting for
  // clips that can never arrive (see below).
  const [micUnavailable, setMicUnavailable] = useState(false);
  const recorder = useRef<MediaRecorder | null>(null);

  // An unmount-only cleanup can't read the latest state through its own empty-
  // dependency closure, so mirror it into a ref for that one purpose.
  const liveClips = useRef<(string | null)[]>([]);
  useEffect(() => {
    liveClips.current = clips;
  }, [clips]);

  useEffect(
    () => () => {
      recorder.current?.stream.getTracks().forEach((track) => track.stop());
      liveClips.current.forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    },
    [],
  );

  if (items.length === 0) return null;

  async function startRecording(index: number) {
    if (typeof MediaRecorder === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setMicUnavailable(true);
      setNotice("This browser can't record audio. You can still say each line out loud and mark yourself done.");
      return;
    }
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setMicUnavailable(true);
      setNotice("We couldn't reach the microphone. Check the mic permission, or say each line out loud and mark yourself done.");
      return;
    }

    // Permission is granted and this prompt's old take is definitely being
    // replaced, so free its object URL now instead of leaking it.
    const previous = clips[index];
    if (previous) {
      URL.revokeObjectURL(previous);
      setClips((prev) => prev.map((url, i) => (i === index ? null : url)));
    }

    const chunks: Blob[] = [];
    const active = new MediaRecorder(stream);
    active.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.push(event.data);
    };
    active.onstop = () => {
      stream.getTracks().forEach((track) => track.stop());
      const url = URL.createObjectURL(new Blob(chunks, { type: active.mimeType }));
      setClips((prev) => prev.map((existing, i) => (i === index ? url : existing)));
      setRecordingIndex(null);
      setNotice("Saved on this device only — have a listen.");
    };
    recorder.current = active;
    active.start();
    setRecordingIndex(index);
    setNotice("Recording — press stop when you're finished.");
  }

  function stopRecording() {
    recorder.current?.stop();
  }

  // Normally Done waits until every prompt has a take. When the mic is
  // unavailable it can't ever be satisfied, and this activity isn't graded, so
  // a child without a working mic is let through rather than trapped.
  const doneDisabled = recordingIndex !== null || (!micUnavailable && clips.some((clip) => clip === null));

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm opacity-80">
        Read each line out loud, then listen back. Recordings stay on this device and are never sent anywhere or saved —
        nothing here is scored.
      </p>

      {items.map((item, i) => (
        <div key={i} className="flex flex-col gap-2">
          <p className="font-medium">
            {i + 1}. {item.prompt}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            {recordingIndex === i ? (
              <button
                type="button"
                onClick={stopRecording}
                className="px-4 py-2 text-sm font-semibold"
                style={{
                  borderRadius: "var(--shell-radius, 0.5rem)",
                  minHeight: "var(--shell-touch, 2.75rem)",
                  background: "color-mix(in srgb, var(--color-error) 25%, transparent)",
                  border: "1px solid var(--color-error)",
                }}
              >
                Stop recording
              </button>
            ) : (
              <button
                type="button"
                disabled={recordingIndex !== null}
                onClick={() => startRecording(i)}
                className="px-4 py-2 text-sm font-medium disabled:opacity-60"
                style={{
                  borderRadius: "var(--shell-radius, 0.5rem)",
                  minHeight: "var(--shell-touch, 2.75rem)",
                  border: "1px solid color-mix(in srgb, var(--shell-ink, #000) 20%, transparent)",
                  background: "transparent",
                }}
              >
                {clips[i] ? "Record again" : "Record"}
              </button>
            )}
            {clips[i] && <audio src={clips[i] ?? undefined} controls className="max-w-full" />}
          </div>
        </div>
      ))}

      <p className="text-sm font-medium" role="status">
        {notice}
      </p>

      <button
        type="button"
        disabled={doneDisabled}
        onClick={() => onFinish({ correct: items.length, total: items.length })}
        className="self-start px-4 py-2 text-sm font-semibold disabled:opacity-60"
        style={{
          borderRadius: "var(--shell-radius, 0.5rem)",
          minHeight: "var(--shell-touch, 2.75rem)",
          background: "var(--shell-accent, #f4b21a)",
          color: "var(--shell-on-accent)",
        }}
      >
        Done
      </button>
    </div>
  );
}
