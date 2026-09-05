import type { Subject } from "@/design/tokens";

// Original, simple flat-color SVG icons — one per subject, used on course
// cards/detail pages. Deliberately avoids any depiction of the Ten Gurus;
// the Sikhi icon uses a flame/light motif (explicitly sanctioned alongside
// the Khanda in CLAUDE.md's content policy) rather than attempting a
// hand-drawn Khanda, since an inaccurate rendering of a sacred symbol would
// be worse than a safe, still-fitting alternative.
export default function SubjectIcon({
  subject,
  size = 40,
  className,
}: {
  subject: Subject | string;
  size?: number;
  className?: string;
}) {
  const common = { width: size, height: size, viewBox: "0 0 100 100", className, "aria-hidden": true as const };

  switch (subject) {
    case "math":
      return (
        <svg {...common}>
          <circle cx="30" cy="30" r="16" fill="#f4b21a" />
          <rect x="54" y="14" width="32" height="32" rx="4" fill="#3aa0a0" />
          <path d="M30 62 L46 90 L14 90 Z" fill="#e0663f" />
          <path d="M62 66 h20 M72 56 v20" stroke="#3a2e1f" strokeWidth="6" strokeLinecap="round" />
        </svg>
      );
    case "ela":
      return (
        <svg {...common}>
          <path d="M50 24 C40 16 20 16 14 22 V80 C20 74 40 74 50 82 Z" fill="#e0663f" />
          <path d="M50 24 C60 16 80 16 86 22 V80 C80 74 60 74 50 82 Z" fill="#f4b21a" />
          <line x1="50" y1="26" x2="50" y2="80" stroke="#3a2e1f" strokeWidth="2" />
        </svg>
      );
    case "science":
      return (
        <svg {...common}>
          <path d="M42 14 h16 v26 l20 38 a8 8 0 0 1 -7 12 H29 a8 8 0 0 1 -7 -12 l20 -38 Z" fill="#3aa0a0" />
          <rect x="40" y="12" width="20" height="8" rx="2" fill="#3a2e1f" />
          <path d="M32 66 h36" stroke="#ffffff" strokeWidth="5" />
          <circle cx="46" cy="76" r="4" fill="#f4b21a" />
          <circle cx="58" cy="80" r="3" fill="#f4b21a" />
        </svg>
      );
    case "social-studies":
      return (
        <svg {...common}>
          <circle cx="50" cy="50" r="36" fill="#3aa0a0" />
          <ellipse cx="50" cy="50" rx="36" ry="14" fill="none" stroke="#ffffff" strokeWidth="3" />
          <ellipse cx="50" cy="50" rx="14" ry="36" fill="none" stroke="#ffffff" strokeWidth="3" />
          <line x1="14" y1="50" x2="86" y2="50" stroke="#ffffff" strokeWidth="3" />
        </svg>
      );
    case "punjabi":
      return (
        <svg {...common}>
          <path d="M20 30 h60 a6 6 0 0 1 6 6 v28 a6 6 0 0 1 -6 6 H40 l-14 12 v-12 H20 a6 6 0 0 1 -6 -6 V36 a6 6 0 0 1 6 -6 Z" fill="#e0663f" />
          <circle cx="34" cy="50" r="4" fill="#ffffff" />
          <circle cx="50" cy="50" r="4" fill="#ffffff" />
          <circle cx="66" cy="50" r="4" fill="#ffffff" />
        </svg>
      );
    case "sikhi":
      return (
        <svg {...common}>
          <path
            d="M50 12 C58 30 66 36 66 52 C66 68 58 82 50 90 C42 82 34 68 34 52 C34 36 42 30 50 12 Z"
            fill="#f4b21a"
          />
          <path
            d="M50 30 C55 42 60 46 60 56 C60 66 55 76 50 82 C45 76 40 66 40 56 C40 46 45 42 50 30 Z"
            fill="#e0663f"
          />
        </svg>
      );
    case "life-skills":
      return (
        <svg {...common}>
          <circle cx="50" cy="50" r="34" fill="#3aa0a0" />
          <path d="M36 52 l10 10 l18 -22" stroke="#ffffff" strokeWidth="7" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "spanish":
      // A speech bubble (this repo's existing shorthand for "a language",
      // see Punjabi above) carrying an inverted exclamation mark — Spanish's
      // one distinctive punctuation mark, and dialect/country-neutral (no
      // flag colors), matching Latin American Spanish being taught broadly
      // rather than one specific country (plan §3 B1's dialect note).
      return (
        <svg {...common}>
          <path d="M20 26 h60 a6 6 0 0 1 6 6 v28 a6 6 0 0 1 -6 6 H40 l-14 12 v-12 H20 a6 6 0 0 1 -6 -6 V32 a6 6 0 0 1 6 -6 Z" fill="#3aa0a0" />
          <circle cx="50" cy="42" r="4" fill="#ffffff" />
          <rect x="46" y="50" width="8" height="16" rx="3" fill="#ffffff" />
        </svg>
      );
    case "digital-literacy":
      return (
        <svg {...common}>
          <rect x="14" y="24" width="72" height="46" rx="6" fill="#3a2e1f" />
          <rect x="20" y="30" width="60" height="34" rx="2" fill="#3aa0a0" />
          <path d="M40 78 h20 M44 70 l-2 8 M56 70 l2 8" stroke="#3a2e1f" strokeWidth="4" strokeLinecap="round" />
          <path d="M38 40 L28 47 L38 54 M62 40 L72 47 L62 54" stroke="#ffffff" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="50" cy="50" r="36" fill="#f4b21a" />
        </svg>
      );
  }
}
