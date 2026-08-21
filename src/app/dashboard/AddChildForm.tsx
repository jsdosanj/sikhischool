"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GRADE_ORDER } from "@/lib/grades";

export default function AddChildForm() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [gradeLevel, setGradeLevel] = useState("K");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="mt-4 flex flex-wrap items-end gap-3"
      onSubmit={async (e) => {
        e.preventDefault();
        setPending(true);
        setError(null);
        const res = await fetch("/api/children", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ displayName, gradeLevel }),
        });
        setPending(false);
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as { error?: string };
          setError(body.error ?? "Something went wrong.");
          return;
        }
        setDisplayName("");
        router.refresh();
      }}
    >
      <div>
        <label className="block text-sm font-medium" htmlFor="child-name">
          Child&apos;s first name
        </label>
        <input
          id="child-name"
          required
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="mt-1 rounded border border-[var(--foreground)]/20 bg-transparent px-3 py-1.5 outline-none focus:border-[var(--color-saffron)]"
        />
      </div>
      <div>
        <label className="block text-sm font-medium" htmlFor="child-grade">
          Grade
        </label>
        <select
          id="child-grade"
          value={gradeLevel}
          onChange={(e) => setGradeLevel(e.target.value)}
          className="mt-1 rounded border border-[var(--foreground)]/20 bg-transparent px-3 py-1.5 outline-none focus:border-[var(--color-saffron)]"
        >
          {GRADE_ORDER.map((g) => (
            <option key={g} value={g}>
              {g === "K" ? "Kindergarten" : `Grade ${g}`}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-[var(--color-saffron)] px-4 py-1.5 text-sm font-semibold text-[#2a1c06] hover:brightness-105 disabled:opacity-60"
      >
        {pending ? "Adding…" : "Add child"}
      </button>
      {error && <p className="w-full text-sm text-red-600">{error}</p>}
    </form>
  );
}
