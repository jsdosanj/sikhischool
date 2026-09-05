import type { Metadata } from "next";
import { Geist, Geist_Mono, Baloo_2, Atkinson_Hyperlegible, Source_Sans_3, Fraunces, Noto_Sans_Gurmukhi } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

// Age-banded shell fonts (see DESIGN.md and src/design/tokens.ts) — loaded
// once here as CSS variables, applied per shell via the [data-shell]
// selectors in globals.css so switching shells never triggers a new font
// download. little-sparks (K-2) keeps its own Baloo 2 / Atkinson Hyperlegible
// pairing (see globals.css's shell comment for why); rising-school and
// sikhi-school-studio share DESIGN.md's Fraunces (display) + Source Sans 3
// (body) system — "one system" per DESIGN.md, not a per-shell typeface.
const balloo = Baloo_2({ variable: "--font-little-sparks-display", subsets: ["latin"], weight: ["600", "700", "800"] });
const atkinson = Atkinson_Hyperlegible({ variable: "--font-little-sparks-body", subsets: ["latin"], weight: ["400", "700"] });
const sourceSans3 = Source_Sans_3({ variable: "--font-body-sans", subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const fraunces = Fraunces({
  variable: "--font-display-serif",
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
});
// For Gurmukhi script text (Punjabi/Sikhi lessons) — the Latin display/body
// fonts above don't cover Gurmukhi glyphs.
const notoGurmukhi = Noto_Sans_Gurmukhi({ variable: "--font-gurmukhi", subsets: ["gurmukhi"], weight: ["400", "700"] });

export const metadata: Metadata = {
  title: "Sikhi School",
  description: "A free K-12 curriculum for worldly subjects, Punjabi, and Sikhi — sibling to sikhiuni.com and sikhi.io.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${balloo.variable} ${atkinson.variable} ${sourceSans3.variable} ${fraunces.variable} ${notoGurmukhi.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
