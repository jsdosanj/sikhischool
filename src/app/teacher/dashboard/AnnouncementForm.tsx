"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AnnouncementForm({ classroomId }: { classroomId: string }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="mt-3 flex flex-wrap items-end gap-2"
      onSubmit={async (e) => {
        e.preventDefault();
        setPending(true);
        setError(null);
        const res = await fetch(`/api/teacher/classrooms/${classroomId}/announcements`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ body }),
        });
        setPending(false);
        if (!res.ok) {
          const resBody = (await res.json().catch(() => ({}))) as { error?: string };
          setError(resBody.error ?? "Something went wrong.");
          return;
        }
        setBody("");
        router.refresh();
      }}
    >
      <input
        required
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Post an announcement to this classroom…"
        className="min-w-0 flex-1 rounded border border-[var(--foreground)]/20 bg-transparent px-3 py-1.5 text-sm outline-none focus:border-[var(--color-saffron)]"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-[var(--color-saffron)] px-3 py-1.5 text-sm font-semibold text-[#2a1c06] hover:brightness-105 disabled:opacity-60"
      >
        {pending ? "Posting…" : "Post"}
      </button>
      {error && <p className="w-full text-sm text-red-600">{error}</p>}
    </form>
  );
}
