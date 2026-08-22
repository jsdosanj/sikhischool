import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { theme, WorksheetHeader, WorksheetFooter, MixedScriptText, GURMUKHI_FONT, INK_SOFT } from "./worksheetTheme";

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    borderBottom: `1pt solid #e6e1d6`,
    paddingVertical: 16,
  },
  traceBox: {
    minWidth: 80,
    minHeight: 80,
    paddingHorizontal: 10,
    border: "1.5pt solid #16335c",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  traceChar: { fontFamily: GURMUKHI_FONT, color: "#c7c0b0" },
  labelCol: { flex: 1 },
  label: { fontSize: 13, marginBottom: 6 },
  practiceLine: { borderBottom: `1pt dashed ${INK_SOFT}`, height: 26 },
});

export interface TraceAndWriteRow {
  // The character/word to trace — may be Gurmukhi or plain text.
  trace: string;
  label: string;
}

// A single-letter trace (like ਸ) can stay large; a multi-character word (like
// ਵੱਡਾ or ਪੜ੍ਹਨਾ) needs a smaller size to fit inside the box without clipping —
// counting Unicode codepoints (not .length) so Gurmukhi combining marks don't
// inflate the count and shrink the font unnecessarily.
function traceFontSize(text: string): number {
  const len = Array.from(text).length;
  if (len <= 1) return 42;
  if (len === 2) return 34;
  if (len === 3) return 28;
  if (len === 4) return 23;
  if (len === 5) return 19;
  return 16;
}

export default function TraceAndWriteWorksheet({
  title,
  instructions,
  rows,
  gradeLevel,
  subject,
}: {
  title: string;
  instructions: string;
  rows: TraceAndWriteRow[];
  gradeLevel?: string;
  subject?: string;
}) {
  return (
    <Document>
      <Page size="A4" style={theme.page}>
        <WorksheetHeader title={title} subtitle={instructions} gradeLevel={gradeLevel} subject={subject} />
        {rows.map((row, i) => (
          <View key={i} style={styles.row} wrap={false}>
            <View style={styles.traceBox}>
              <Text style={[styles.traceChar, { fontSize: traceFontSize(row.trace) }]}>{row.trace}</Text>
            </View>
            <View style={styles.labelCol}>
              <MixedScriptText style={styles.label}>{row.label}</MixedScriptText>
              <View style={styles.practiceLine} />
            </View>
          </View>
        ))}
        <WorksheetFooter />
      </Page>
    </Document>
  );
}
