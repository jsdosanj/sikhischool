import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="mx-auto max-w-sm flex-1 p-8">
      <h1 className="text-2xl font-bold">Sign in</h1>
      <p className="mt-2 text-sm text-[var(--foreground)]/70">
        Free, no password — we&apos;ll email you a magic sign-in link. This account is for
        parents and teachers; children never sign in directly.
      </p>
      <LoginForm />
    </main>
  );
}
