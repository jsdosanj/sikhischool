"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

// Role determines only the destination page after sign-in (/dashboard vs
// /teacher/dashboard) — that page lazily provisions the matching ParentAccount
// or TeacherAccount row on first visit. Not plumbed through NextAuth's own
// events.createUser: that fires once per new *email identity*, with no access
// to which role the person intended, and a person can legitimately hold both
// roles (same pattern sikhiuni uses for multi-hat accounts).
export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"parent" | "teacher">("parent");
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (sent) {
    return (
      <p className="mt-6 text-sm text-[var(--foreground)]/70">
        Check your email for a sign-in link.
      </p>
    );
  }

  return (
    <form
      className="mt-6 flex flex-col gap-3"
      onSubmit={async (e) => {
        e.preventDefault();
        // A "+" (e.g. Gmail plus-addressing) in the query-string identifier gets
        // corrupted en route to the callback handler in this deployment — see
        // the comment in lib/auth.ts. Blocking it here beats a confusing
        // "Verification failed" after the email arrives.
        if (email.includes("+")) {
          setError('Sign-in email addresses with a "+" aren\'t supported yet — please use your address without it.');
          return;
        }
        setError(null);
        setPending(true);
        const callbackUrl = role === "teacher" ? "/teacher/dashboard" : "/dashboard";
        await signIn("email", { email, callbackUrl, redirect: false });
        setPending(false);
        setSent(true);
      }}
    >
      <fieldset className="flex gap-4">
        <legend className="text-sm font-medium">I am joining as a…</legend>
        <label className="flex items-center gap-1.5 text-sm">
          <input
            type="radio"
            name="role"
            checked={role === "parent"}
            onChange={() => setRole("parent")}
          />
          Parent
        </label>
        <label className="flex items-center gap-1.5 text-sm">
          <input
            type="radio"
            name="role"
            checked={role === "teacher"}
            onChange={() => setRole("teacher")}
          />
          Teacher
        </label>
      </fieldset>
      <label className="text-sm font-medium" htmlFor="email">
        Email
      </label>
      <input
        id="email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className="rounded border border-[var(--foreground)]/20 bg-transparent px-3 py-2 outline-none focus:border-[var(--color-saffron)]"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-[var(--color-saffron)] px-4 py-2 text-sm font-semibold text-[#2a1c06] hover:brightness-105 disabled:opacity-60"
      >
        {pending ? "Sending…" : "Send magic link"}
      </button>
    </form>
  );
}
