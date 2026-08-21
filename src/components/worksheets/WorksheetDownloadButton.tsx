"use client";

import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import CountAndWriteWorksheet, { type CountAndWriteRow } from "./CountAndWriteWorksheet";

// PDF generation runs here, client-side, not on the server: @react-pdf/renderer's
// layout engine (yoga-layout) instantiates WebAssembly dynamically, which
// Cloudflare Workers blocks server-side ("Wasm code generation disallowed by
// embedder") — verified directly against a real deploy, not assumed. Works fine
// in a browser.
export default function WorksheetDownloadButton({
  templateKey,
  title,
  data,
}: {
  templateKey: string;
  title: string;
  data: Record<string, unknown>;
}) {
  const [pending, setPending] = useState(false);

  if (templateKey !== "count-and-write-v1") {
    return null;
  }

  const rows = (data.rows as CountAndWriteRow[] | undefined) ?? [];

  return (
    <button
      type="button"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        try {
          const blob = await pdf(<CountAndWriteWorksheet title={title} rows={rows} />).toBlob();
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
