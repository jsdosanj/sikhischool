"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface Entry {
  word: string;
  translation: string;
  partOfSpeech: string | null;
  synonyms: string[] | null;
  exampleSentence: string | null;
  audioRef: string | null;
}

type Status = "idle" | "loading" | "ready" | "error";

// Affordance colour is --color-info (DESIGN.md's "dusk"), not --shell-accent.
// The shells already spend saffron on primary actions (buttons, links, active
// nav); a reading passage can carry a dozen lookup words, and painting each one
// accent-coloured would make the passage compete with the lesson's actual CTA.
// Dusk reads as "reference," which is what a dictionary lookup is.
// (--color-info lands with the A2 design-token branch; the literal is the
// fallback until then, same var-with-fallback style as the games components.)
const INFO = "var(--color-info, #5b7a9a)";
const SURFACE = "var(--shell-surface, #ffffff)";
const INK = "var(--shell-ink, #211d1a)";
const INK_SOFT = "var(--shell-ink-soft, #766c62)";
const RADIUS = "var(--shell-radius, 0.75rem)";
const HAIRLINE = "1px solid color-mix(in srgb, var(--shell-ink, #211d1a) 15%, transparent)";

// Instant word lookup from a reading passage (plan §5 D4). One component, two
// intentional layouts — a popover anchored to the word on desktop, a bottom
// sheet on mobile — because an inline popover beside a tapped word crowds or
// clips on a small screen. Not a duplicated component per breakpoint.
export default function WordLookup({ word, language }: { word: string; language: string }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [entry, setEntry] = useState<Entry | null>(null);
  // Both queries live in one state object so a single effect owns all the
  // media-query listeners; `mobile` starts false so SSR and first paint agree
  // (nothing but the trigger renders until the panel is opened anyway).
  const [env, setEnv] = useState({ mobile: false, reduceMotion: false });
  const [sheetIn, setSheetIn] = useState(false);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const rootRef = useRef<HTMLSpanElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    const mobileQuery = window.matchMedia("(max-width: 767px)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setEnv({ mobile: mobileQuery.matches, reduceMotion: motionQuery.matches });
    sync();
    mobileQuery.addEventListener("change", sync);
    motionQuery.addEventListener("change", sync);
    return () => {
      mobileQuery.removeEventListener("change", sync);
      motionQuery.removeEventListener("change", sync);
    };
  }, []);

  // Focus goes back to the trigger on a deliberate dismissal (Escape, Close,
  // backdrop tap) so a keyboard user lands back in the sentence they were
  // reading. It deliberately does NOT on a click-outside: yanking the caret
  // back to a word because someone clicked elsewhere on the page is focus
  // theft, not focus management.
  const close = useCallback((returnFocus: boolean) => {
    setOpen(false);
    setSheetIn(false);
    if (returnFocus) triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close(true);
    }
    // The mobile backdrop closes via its own handler (it lives inside rootRef,
    // so this outside-check would never fire for it).
    function onPointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) close(false);
    }
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open, close]);

  // Slide-up is driven by a state flip one frame after mount rather than a
  // keyframe, so the whole interaction stays inside this file instead of
  // reaching into globals.css. The reset back to "down" lives in close(), not
  // in an early return here — a setState in an effect body cascades renders.
  useEffect(() => {
    if (!open || !env.mobile) return;
    const frame = requestAnimationFrame(() => {
      setSheetIn(true);
      closeRef.current?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [open, env.mobile]);

  async function load() {
    setStatus("loading");
    try {
      const res = await fetch(
        `/api/dictionary/lookup?word=${encodeURIComponent(word)}&language=${encodeURIComponent(language)}`,
      );
      if (!res.ok) throw new Error(String(res.status));
      setEntry((await res.json()) as Entry | null);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }

  function toggle() {
    if (open) {
      close(false);
      return;
    }
    setOpen(true);
    // A definition can't change while the child is reading the page, so a
    // second open of the same word is instant rather than a second round-trip.
    if (status === "idle" || status === "error") void load();
  }

  const panelBody = (
    <span style={{ display: "block" }} aria-live="polite">
      {status === "loading" && (
        <span style={{ display: "block", fontSize: "0.875rem", color: INK_SOFT }}>Looking it up&hellip;</span>
      )}

      {status === "error" && (
        <span style={{ display: "block", fontSize: "0.875rem" }}>
          <span style={{ display: "block", color: INK_SOFT }}>Couldn&rsquo;t load that.</span>
          <button
            type="button"
            onClick={() => void load()}
            style={{
              marginTop: "0.5rem",
              minHeight: "var(--shell-touch, 2.75rem)",
              padding: "0.25rem 0.75rem",
              borderRadius: RADIUS,
              border: HAIRLINE,
              background: "transparent",
              fontWeight: 600,
              color: INK,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </span>
      )}

      {status === "ready" && !entry && (
        <span style={{ display: "block", fontSize: "0.875rem", color: INK_SOFT }}>
          No definition yet for &ldquo;{word}&rdquo;.
        </span>
      )}

      {status === "ready" && entry && (
        <span style={{ display: "block" }}>
          <span style={{ display: "block", fontWeight: 600 }}>
            {entry.word}
            {entry.partOfSpeech && (
              <span style={{ marginInlineStart: "0.5rem", fontWeight: 400, fontStyle: "italic", color: INK_SOFT }}>
                {entry.partOfSpeech}
              </span>
            )}
          </span>
          <span style={{ display: "block", marginTop: "0.25rem" }}>{entry.translation}</span>
          {entry.exampleSentence && (
            <span style={{ display: "block", marginTop: "0.5rem", fontSize: "0.875rem", fontStyle: "italic", color: INK_SOFT }}>
              {entry.exampleSentence}
            </span>
          )}
          {entry.synonyms && entry.synonyms.length > 0 && (
            <span style={{ display: "block", marginTop: "0.5rem", fontSize: "0.875rem", color: INK_SOFT }}>
              Also: {entry.synonyms.join(", ")}
            </span>
          )}
        </span>
      )}
    </span>
  );

  return (
    // Every element here is phrasing content (span/button, never div): the
    // trigger renders inside a lesson's <p>, and a <div> in a <p> gets
    // auto-closed by the parser, which would tear the paragraph in half.
    <span ref={rootRef} style={{ position: "relative", display: "inline-block" }}>
      <button
        ref={triggerRef}
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-haspopup="dialog"
        style={{
          font: "inherit",
          color: "inherit",
          background: "none",
          border: "none",
          padding: 0,
          textDecoration: "underline",
          textDecorationStyle: "dotted",
          textDecorationColor: INFO,
          textDecorationThickness: "2px",
          textUnderlineOffset: "0.2em",
          cursor: "pointer",
        }}
      >
        {word}
      </button>

      {open && !env.mobile && (
        <span
          role="dialog"
          aria-label={`Definition of ${word}`}
          style={{
            // Anchored to this component's own wrapper span, which is the
            // trigger's immediate parent — NOT to a paragraph or section
            // ancestor, which is how a popover ends up floating at the top of
            // the passage instead of under the word that was clicked.
            position: "absolute",
            top: "calc(100% + 8px)",
            insetInlineStart: 0,
            zIndex: 30,
            display: "block",
            width: "max-content",
            maxWidth: "min(20rem, calc(100vw - 2rem))",
            padding: "0.75rem",
            textAlign: "start",
            background: SURFACE,
            color: INK,
            border: HAIRLINE,
            borderRadius: RADIUS,
            boxShadow: "0 8px 24px color-mix(in srgb, var(--shell-ink, #211d1a) 18%, transparent)",
          }}
        >
          {panelBody}
        </span>
      )}

      {open && env.mobile && (
        <span style={{ display: "block" }}>
          <span
            onClick={() => close(true)}
            aria-hidden="true"
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 40,
              display: "block",
              background: "color-mix(in srgb, #000000 35%, transparent)",
            }}
          />
          <span
            role="dialog"
            aria-modal="true"
            aria-label={`Definition of ${word}`}
            onTouchStart={(e) => {
              touchStartY.current = e.touches[0]?.clientY ?? null;
            }}
            onTouchEnd={(e) => {
              const start = touchStartY.current;
              const end = e.changedTouches[0]?.clientY;
              if (start !== null && end !== undefined && end - start > 60) close(true);
              touchStartY.current = null;
            }}
            style={{
              position: "fixed",
              insetInline: 0,
              bottom: 0,
              zIndex: 41,
              display: "block",
              padding: "1rem 1.25rem calc(1.25rem + env(safe-area-inset-bottom))",
              textAlign: "start",
              background: SURFACE,
              color: INK,
              borderRadius: `${RADIUS} ${RADIUS} 0 0`,
              boxShadow: "0 -8px 32px color-mix(in srgb, var(--shell-ink, #211d1a) 25%, transparent)",
              transform: sheetIn ? "translateY(0)" : "translateY(100%)",
              transition: env.reduceMotion ? "none" : "transform 200ms ease-out",
            }}
          >
            {/* Grab handle — the visual cue that swipe-down dismisses. */}
            <span
              aria-hidden="true"
              style={{
                display: "block",
                width: "2.5rem",
                height: "0.25rem",
                margin: "0 auto 0.75rem",
                borderRadius: "999px",
                background: `color-mix(in srgb, ${INK} 20%, transparent)`,
              }}
            />
            {panelBody}
            <button
              ref={closeRef}
              type="button"
              onClick={() => close(true)}
              style={{
                display: "block",
                width: "100%",
                marginTop: "1rem",
                minHeight: "var(--shell-touch, 2.75rem)",
                borderRadius: RADIUS,
                border: HAIRLINE,
                background: "transparent",
                fontWeight: 600,
                color: INK,
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </span>
        </span>
      )}
    </span>
  );
}
