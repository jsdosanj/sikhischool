"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Child {
  id: string;
  displayName: string;
}

export default function MarkCompleteWidget({
  lessonId,
  kids,
  alreadyDoneChildIds,
}: {
  lessonId: string;
  kids: Child[];
  alreadyDoneChildIds: string[];
}) {
  const router = useRouter();
  const [childId, setChildId] = useState(kids[0]?.id ?? "");
  const [pending, setPending] = useState(false);

  if (kids.length === 0) return null;

  const alreadyDone = alreadyDoneChildIds.includes(childId);

  return (
    <div
      className="mt-8 flex flex-wrap items-center gap-3 p-4"
      style={{
        borderRadius: "var(--shell-radius, 0.5rem)",
        border: "1px solid color-mix(in srgb, var(--shell-ink, #000) 15%, transparent)",
      }}
    >
      <label className="text-sm font-medium" htmlFor="progress-child">
        Mark complete for
      </label>
      <select
        id="progress-child"
        value={childId}
        onChange={(e) => setChildId(e.target.value)}
        className="rounded border border-[color-mix(in_srgb,var(--shell-ink,#000)_20%,transparent)] bg-transparent px-2 py-1.5 text-sm"
      >
        {kids.map((c) => (
          <option key={c.id} value={c.id}>
            {c.displayName}
          </option>
        ))}
      </select>
      <button
        type="button"
        disabled={pending || alreadyDone}
        onClick={async () => {
          setPending(true);
          await fetch("/api/progress", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ childProfileId: childId, lessonId }),
          });
          setPending(false);
          router.refresh();
        }}
        className="rounded px-4 py-1.5 text-sm font-semibold disabled:opacity-60"
        style={{ background: "var(--shell-accent, #f4b21a)", color: "#2a1c06" }}
      >
        {alreadyDone ? "Done ✓" : pending ? "Saving…" : "Mark complete"}
      </button>
    </div>
  );
}
