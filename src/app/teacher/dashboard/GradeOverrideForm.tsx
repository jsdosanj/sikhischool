"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function GradeOverrideForm({
  classroomId,
  studentId,
  nodeId,
  currentOverride,
}: {
  classroomId: string;
  studentId: string;
  nodeId: string;
  currentOverride: number | null;
}) {
  const router = useRouter();
  const [value, setValue] = useState(currentOverride?.toString() ?? "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(overrideScore: number | null) {
    setPending(true);
    setError(null);
    const res = await fetch(`/api/teacher/classrooms/${classroomId}/override`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, nodeId, overrideScore }),
    });
    setPending(false);
    if (!res.ok) {
      const resBody = (await res.json().catch(() => ({}))) as { error?: string };
      setError(resBody.error ?? "Something went wrong.");
      return;
    }
    router.refresh();
  }

  return (
    <span className="inline-flex items-center gap-1.5">
      <input
        type="number"
        min={0}
        max={100}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="override"
        className="w-16 rounded border border-[var(--foreground)]/20 bg-transparent px-1.5 py-0.5 text-xs outline-none focus:border-[var(--color-saffron)]"
      />
      <button
        type="button"
        disabled={pending || value === ""}
        onClick={() => submit(Number(value))}
        className="rounded bg-[var(--color-saffron)]/20 px-2 py-0.5 text-xs font-semibold hover:bg-[var(--color-saffron)]/30 disabled:opacity-60"
      >
        Set
      </button>
      {currentOverride !== null && (
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            setValue("");
            submit(null);
          }}
          className="text-xs text-[var(--foreground)]/50 hover:underline disabled:opacity-60"
        >
          Clear
        </button>
      )}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </span>
  );
}
