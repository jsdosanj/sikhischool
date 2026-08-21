export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-[var(--color-saffron)]">
        Free · Open · K-12
      </p>
      <h1 className="text-4xl font-bold">Sikhi School</h1>
      <p className="max-w-xl text-[var(--foreground)]/70">
        A free K-12 curriculum for worldly subjects, Punjabi, and Sikhi — sibling to{" "}
        <a className="underline" href="https://sikhiuni.com">
          sikhiuni.com
        </a>{" "}
        and{" "}
        <a className="underline" href="https://sikhi.io">
          sikhi.io
        </a>
        . Under construction — Wave 0 scaffold.
      </p>
    </main>
  );
}
