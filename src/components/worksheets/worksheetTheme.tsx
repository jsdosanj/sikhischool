import { Font, StyleSheet, Text, View, type TextProps } from "@react-pdf/renderer";

// react-pdf's own type declarations don't re-export a `StyleProp` name (it's
// only used internally in their `export =` namespace) and Text's props are a
// union with an SVG-only variant, so deriving from ComponentProps<typeof
// Text> is ambiguous for overload resolution — TextProps (the non-SVG half)
// is nameable directly and is what every real call site here actually uses.
type TextStyle = TextProps["style"];

// Shared letterhead system for every worksheet template — same brand pair
// (saffron/navy, see src/app/globals.css) used everywhere else in the app,
// so a printed worksheet reads as unmistakably "Sikhi School" regardless of
// which grade/subject generated it. Merriweather is registered once per
// module load (not per render) as the display serif — Lora was tried first
// and dropped after a real, reproduced crash: fontkit's TTF subsetter throws
// ("Offset is outside the bounds of the DataView") embedding Lora whenever a
// document contains the letter "j" in ANY string, at any weight — a defect
// in that specific font file, not a react-pdf/fontkit limitation in general.
// Merriweather was stress-tested clean against all 1,178 real worksheet
// titles/instructions in this codebase (including "j"-bearing titles) before
// being adopted.
Font.register({
  family: "Merriweather",
  fonts: [
    { src: "https://fonts.gstatic.com/s/merriweather/v33/u-4D0qyriQwlOrhSvowK_l5UcA6zuSYEqOzpPe3HOZJ5eX1WtLaQwmYiScCmDxhtNOKl8yDr3icaFF31CPDaYKfF.woff2", fontWeight: 400 },
    { src: "https://fonts.gstatic.com/s/merriweather/v33/u-4D0qyriQwlOrhSvowK_l5UcA6zuSYEqOzpPe3HOZJ5eX1WtLaQwmYiScCmDxhtNOKl8yDrOSAaGl31CPDaYKfFQn0.woff2", fontWeight: 700 },
  ],
});

// Noto SERIF (not Sans) Gurmukhi — deliberate choice, not just a stylistic
// pairing with Lora. Verified directly: fontkit's OpenType shaper throws
// ("Cannot read properties of null (reading 'xCoordinate')") on Noto SANS
// Gurmukhi for extremely common base+matra combinations (e.g. ਸ + ੋ, as in
// ਸੋਹਣਾ) — a real crash, not a cosmetic issue, reproduced against ~240 of 335
// real strings from this codebase's own worksheets. Noto Serif Gurmukhi has
// no such GPOS defect: stress-tested clean against all 172 real Gurmukhi
// strings actually used in data/flagship-lessons worksheets before shipping.
// One known gap: it has no glyph for → (U+2192) — worksheet content must not
// mix that character into Gurmukhi-bearing strings (ASCII fallbacks/words
// instead); everything else in current content is covered.
Font.register({
  family: "Noto Serif Gurmukhi",
  fonts: [{ src: "https://fonts.gstatic.com/s/notoserifgurmukhi/v22/92z-tA9LNqsg7tCYlXdCV1VPnAEeDU0vLoYMbylXk0xTCr6-eRTN.ttf", fontWeight: 400 }],
});

export const GURMUKHI_FONT = "Noto Serif Gurmukhi";
const GURMUKHI_RANGE = /[਀-੿]/;

export function hasGurmukhi(text: string): boolean {
  return GURMUKHI_RANGE.test(text);
}

/**
 * react-pdf's Text doesn't do per-glyph font fallback, so a string mixing
 * English and Gurmukhi (e.g. a worksheet title like "ਦੋਹਾ: A Traditional
 * Two-Line Form") needs to be split into same-script runs, each rendered as
 * its own nested Text with the right family — otherwise the Gurmukhi runs
 * silently render as missing glyphs under a Latin-only font. Neutral
 * characters (spaces/punctuation) stay attached to whichever run they're
 * adjacent to; both registered fonts cover basic ASCII punctuation, so the
 * exact split point there doesn't affect rendering.
 */
function segmentByScript(text: string): { text: string; gurmukhi: boolean }[] {
  const segments: { text: string; gurmukhi: boolean }[] = [];
  let current = "";
  let currentIsGurmukhi: boolean | null = null;
  for (const ch of Array.from(text)) {
    const isGurmukhi = GURMUKHI_RANGE.test(ch);
    if (currentIsGurmukhi === null) {
      currentIsGurmukhi = isGurmukhi;
      current = ch;
    } else if (isGurmukhi === currentIsGurmukhi || /\s/.test(ch)) {
      current += ch;
    } else {
      segments.push({ text: current, gurmukhi: currentIsGurmukhi });
      current = ch;
      currentIsGurmukhi = isGurmukhi;
    }
  }
  if (current) segments.push({ text: current, gurmukhi: currentIsGurmukhi ?? false });
  return segments;
}

/** Renders `children` under `style`, auto-switching to the Gurmukhi font for any Gurmukhi runs within it. */
export function MixedScriptText({ style, children }: { style?: TextStyle; children: string }) {
  if (!hasGurmukhi(children)) {
    return <Text style={style}>{children}</Text>;
  }
  return (
    <Text style={style}>
      {segmentByScript(children).map((seg, i) => (
        <Text key={i} style={seg.gurmukhi ? { fontFamily: GURMUKHI_FONT } : undefined}>
          {seg.text}
        </Text>
      ))}
    </Text>
  );
}

export const NAVY = "#16335c";
export const SAFFRON = "#f4b21a";
export const INK = "#23201a";
export const INK_SOFT = "#5c5548";
export const RULE = "#e6e1d6";

export const theme = StyleSheet.create({
  page: { paddingTop: 44, paddingBottom: 56, paddingHorizontal: 44, fontSize: 12, fontFamily: "Helvetica", color: INK },
  ruleTop: { height: 3, backgroundColor: NAVY, marginBottom: 14 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 18 },
  wordmark: { fontSize: 9, fontFamily: "Helvetica-Bold", color: NAVY, letterSpacing: 2 },
  eyebrow: { fontSize: 9, fontFamily: "Helvetica-Bold", color: SAFFRON, letterSpacing: 1 },
  title: { fontSize: 22, fontFamily: "Merriweather", fontWeight: 700, color: NAVY, marginBottom: 6 },
  subtitle: { fontSize: 11, color: INK_SOFT, lineHeight: 1.5, marginBottom: 16 },
  accentRule: { height: 1.5, backgroundColor: SAFFRON, width: 64, marginBottom: 18 },
  identityRow: { flexDirection: "row", marginBottom: 26 },
  identityField: { flexDirection: "row", alignItems: "flex-end", marginRight: 28 },
  identityLabel: { fontSize: 9, fontFamily: "Helvetica-Bold", color: INK_SOFT, marginRight: 6 },
  identityLine: { borderBottom: `1pt solid ${INK_SOFT}`, width: 130, height: 12 },
  identityLineWide: { borderBottom: `1pt solid ${INK_SOFT}`, width: 90, height: 12 },
  footer: {
    position: "absolute",
    bottom: 26,
    left: 44,
    right: 44,
    borderTop: `0.75pt solid ${RULE}`,
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: { fontSize: 8, color: INK_SOFT, letterSpacing: 0.5 },
});

/** Renders the letterhead every worksheet shares: brand rule, wordmark + grade/subject eyebrow, Lora title, instructions, and a name/date line. */
export function WorksheetHeader({
  title,
  subtitle,
  gradeLevel,
  subject,
}: {
  title: string;
  subtitle?: string;
  gradeLevel?: string;
  subject?: string;
}) {
  const eyebrow = [gradeLevel ? `GRADE ${gradeLevel}` : null, subject ? subject.toUpperCase().replace(/-/g, " ") : null]
    .filter(Boolean)
    .join(" · ");
  return (
    <>
      <View style={theme.ruleTop} />
      <View style={theme.headerRow}>
        <Text style={theme.wordmark}>SIKHI SCHOOL</Text>
        {eyebrow ? <Text style={theme.eyebrow}>{eyebrow}</Text> : null}
      </View>
      <MixedScriptText style={theme.title}>{title}</MixedScriptText>
      {subtitle ? <MixedScriptText style={theme.subtitle}>{subtitle}</MixedScriptText> : null}
      <View style={theme.accentRule} />
      <View style={theme.identityRow}>
        <View style={theme.identityField}>
          <Text style={theme.identityLabel}>NAME</Text>
          <View style={theme.identityLine} />
        </View>
        <View style={theme.identityField}>
          <Text style={theme.identityLabel}>DATE</Text>
          <View style={theme.identityLineWide} />
        </View>
      </View>
    </>
  );
}

/** Fixed footer repeated on every page via react-pdf's `fixed` prop. */
export function WorksheetFooter() {
  return (
    <View style={theme.footer} fixed>
      <Text style={theme.footerText}>Sikhi School · sikhischool.com</Text>
      <Text style={theme.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
    </View>
  );
}
