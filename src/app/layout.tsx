import type { Metadata } from "next";
import { Geist, Geist_Mono, Baloo_2, Atkinson_Hyperlegible, Outfit, Inter, Fraunces } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

// Age-banded shell fonts (see src/design/tokens.ts and CLAUDE.md's design
// notes) — loaded once here as CSS variables, applied per shell via the
// [data-shell] selectors in globals.css so switching shells never triggers a
// new font download.
const balloo = Baloo_2({ variable: "--font-little-sparks-display", subsets: ["latin"], weight: ["600", "700", "800"] });
const atkinson = Atkinson_Hyperlegible({ variable: "--font-little-sparks-body", subsets: ["latin"], weight: ["400", "700"] });
const outfit = Outfit({ variable: "--font-rising-school-display", subsets: ["latin"], weight: ["500", "600", "700"] });
const inter = Inter({ variable: "--font-body-sans", subsets: ["latin"] });
const fraunces = Fraunces({ variable: "--font-studio-display", subsets: ["latin"], weight: ["500", "600"] });

export const metadata: Metadata = {
  title: "Sikhi School",
  description: "A free K-12 curriculum for worldly subjects, Punjabi, and Sikhi — sibling to sikhiuni.com and sikhi.io.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${balloo.variable} ${atkinson.variable} ${outfit.variable} ${inter.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
