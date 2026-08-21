"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Child {
  id: string;
  displayName: string;
}

export default function JoinClassroomForm({ kids }: { kids: Child[] }) {
  const router = useRouter();
  const [childId, setChildId] = useState(kids[0]?.id ?? "");
  const [joinCode, setJoinCode] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (kids.length === 0) return null;

  return (
    <form
      className="mt-4 flex flex-wrap items-end gap-3"
      onSubmit={async (e) => {
        e.preventDefault();
        setPending(true);
        setError(null);
        setSuccess(null);
        const res = await fetch("/api/classrooms/join", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ childProfileId: childId, joinCode }),
        });
        const body = (await res.json().catch(() => ({}))) as { error?: string; classroomName?: string };
        setPending(false);
        if (!res.ok) {
          setError(body.error ?? "Something went wrong.");
          return;
        }
        setSuccess(`Joined ${body.classroomName}.`);
        setJoinCode("");
        router.refresh();
      }}
    >
      <div>
        <label className="block text-sm font-medium" htmlFor="join-child">
          Child
        </label>
        <select
          id="join-child"
          value={childId}
          onChange={(e) => setChildId(e.target.value)}
          className="mt-1 rounded border border-[var(--foreground)]/20 bg-transparent px-3 py-1.5 outline-none focus:border-[var(--color-saffron)]"
        >
          {kids.map((c) => (
            <option key={c.id} value={c.id}>
              {c.displayName}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium" htmlFor="join-code">
          Classroom join code
        </label>
        <input
          id="join-code"
          required
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
          placeholder="K7QX9M"
          className="mt-1 w-32 rounded border border-[var(--foreground)]/20 bg-transparent px-3 py-1.5 uppercase outline-none focus:border-[var(--color-saffron)]"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-[var(--color-saffron)] px-4 py-1.5 text-sm font-semibold text-[#2a1c06] hover:brightness-105 disabled:opacity-60"
      >
        {pending ? "Joining…" : "Join classroom"}
      </button>
      {error && <p className="w-full text-sm text-red-600">{error}</p>}
      {success && <p className="w-full text-sm text-green-700">{success}</p>}
    </form>
  );
}
