"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateClassroomForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="mt-4 flex flex-wrap items-end gap-3"
      onSubmit={async (e) => {
        e.preventDefault();
        setPending(true);
        setError(null);
        const res = await fetch("/api/teacher/classrooms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        });
        setPending(false);
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as { error?: string };
          setError(body.error ?? "Something went wrong.");
          return;
        }
        setName("");
        router.refresh();
      }}
    >
      <div>
        <label className="block text-sm font-medium" htmlFor="classroom-name">
          Classroom name
        </label>
        <input
          id="classroom-name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Mrs. Kaur's Grade 2"
          className="mt-1 rounded border border-[var(--foreground)]/20 bg-transparent px-3 py-1.5 outline-none focus:border-[var(--color-saffron)]"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-[var(--color-saffron)] px-4 py-1.5 text-sm font-semibold text-[#2a1c06] hover:brightness-105 disabled:opacity-60"
      >
        {pending ? "Creating…" : "Create classroom"}
      </button>
      {error && <p className="w-full text-sm text-red-600">{error}</p>}
    </form>
  );
}
