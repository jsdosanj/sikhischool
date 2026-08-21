import type { ShellKey } from "@/design/tokens";

// Wraps a page in the age-banded visual identity for its grade band. Sets
// [data-shell], which globals.css uses to scope the --shell-* CSS variables;
// components read those variables rather than hardcoding colors, so the same
// component looks right under any shell.
export default function Shell({
  shell,
  children,
}: {
  shell: ShellKey;
  children: React.ReactNode;
}) {
  return (
    <div
      data-shell={shell}
      className="flex flex-1 flex-col"
      style={{
        background: "var(--shell-bg)",
        color: "var(--shell-ink)",
        fontFamily: "var(--shell-body-font)",
      }}
    >
      {children}
    </div>
  );
}
