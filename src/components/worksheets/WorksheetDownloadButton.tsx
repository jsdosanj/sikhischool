"use client";

import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import CountAndWriteWorksheet, { type CountAndWriteRow } from "./CountAndWriteWorksheet";
import TraceAndWriteWorksheet, { type TraceAndWriteRow } from "./TraceAndWriteWorksheet";
import PracticeProblemsWorksheet, { type PracticeProblemRow } from "./PracticeProblemsWorksheet";
import WritingLinesWorksheet, { type WritingPrompt } from "./WritingLinesWorksheet";

const TEMPLATE_KEYS = ["count-and-write-v1", "trace-and-write-v1", "practice-problems-v1", "writing-lines-v1"];

// PDF generation runs here, client-side, not on the server: @react-pdf/renderer's
// layout engine (yoga-layout) instantiates WebAssembly dynamically, which
// Cloudflare Workers blocks server-side ("Wasm code generation disallowed by
// embedder") — verified directly against a real deploy, not assumed. Works fine
// in a browser.
export default function WorksheetDownloadButton({
  templateKey,
  title,
  data,
  gradeLevel,
  subject,
}: {
  templateKey: string;
  title: string;
  data: Record<string, unknown>;
  gradeLevel?: string;
  subject?: string;
}) {
  const [pending, setPending] = useState(false);

  if (!TEMPLATE_KEYS.includes(templateKey)) {
    return null;
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        try {
          let doc;
          if (templateKey === "count-and-write-v1") {
            doc = (
              <CountAndWriteWorksheet
                title={title}
                rows={(data.rows as CountAndWriteRow[] | undefined) ?? []}
                gradeLevel={gradeLevel}
                subject={subject}
              />
            );
          } else if (templateKey === "trace-and-write-v1") {
            doc = (
              <TraceAndWriteWorksheet
                title={title}
                instructions={(data.instructions as string | undefined) ?? "Trace each letter, then write it on your own."}
                rows={(data.rows as TraceAndWriteRow[] | undefined) ?? []}
                gradeLevel={gradeLevel}
                subject={subject}
              />
            );
          } else if (templateKey === "practice-problems-v1") {
            doc = (
              <PracticeProblemsWorksheet
                title={title}
                instructions={(data.instructions as string | undefined) ?? "Solve each problem and write your answer in the box."}
                rows={(data.rows as PracticeProblemRow[] | undefined) ?? []}
                gradeLevel={gradeLevel}
                subject={subject}
              />
            );
          } else {
            doc = (
              <WritingLinesWorksheet
                title={title}
                instructions={(data.instructions as string | undefined) ?? "Respond to each prompt in complete sentences."}
                prompts={(data.prompts as WritingPrompt[] | undefined) ?? []}
                gradeLevel={gradeLevel}
                subject={subject}
              />
            );
          }
          const blob = await pdf(doc).toBlob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.pdf`;
          a.click();
          URL.revokeObjectURL(url);
        } finally {
          setPending(false);
        }
      }}
      className="px-5 py-3 text-sm font-semibold transition hover:brightness-105 disabled:opacity-60"
      style={{
        borderRadius: "var(--shell-radius, 0.5rem)",
        minHeight: "var(--shell-touch, 2.75rem)",
        background: "var(--shell-accent, var(--color-saffron))",
        color: "#2a1c06",
      }}
    >
      {pending ? "Generating…" : "Download worksheet (PDF)"}
    </button>
  );
}
