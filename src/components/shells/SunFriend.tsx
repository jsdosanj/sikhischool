// The Little Sparks (K-2) mascot — a simple rising-sun character. Purely
// symbolic: ties to Chardi Kala ("rising spirits") the same way the badge
// ladder does, and is deliberately NOT a person or any depiction of the
// Gurus — see CLAUDE.md's content policy.
export default function SunFriend({
  size = 64,
  mood = "happy",
  className,
}: {
  size?: number;
  mood?: "happy" | "cheering";
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="sunfriend-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--shell-sunrise-1, #ffd24c)" />
          <stop offset="100%" stopColor="var(--shell-sunrise-2, #ff8a3d)" />
        </linearGradient>
      </defs>
      {/* rays */}
      <g stroke="var(--shell-sunrise-2, #ff8a3d)" strokeWidth="5" strokeLinecap="round">
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i * Math.PI) / 4;
          const x1 = 50 + Math.cos(angle) * 34;
          const y1 = 50 + Math.sin(angle) * 34;
          const x2 = 50 + Math.cos(angle) * 44;
          const y2 = 50 + Math.sin(angle) * 44;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />;
        })}
      </g>
      {/* face */}
      <circle cx="50" cy="50" r="30" fill="url(#sunfriend-gradient)" />
      <circle cx="40" cy="46" r="4" fill="var(--shell-ink, #3a2e1f)" />
      <circle cx="60" cy="46" r="4" fill="var(--shell-ink, #3a2e1f)" />
      {mood === "cheering" ? (
        <path d="M38 58 Q50 72 62 58" stroke="var(--shell-ink, #3a2e1f)" strokeWidth="4" fill="none" strokeLinecap="round" />
      ) : (
        <path d="M40 58 Q50 66 60 58" stroke="var(--shell-ink, #3a2e1f)" strokeWidth="4" fill="none" strokeLinecap="round" />
      )}
    </svg>
  );
}
