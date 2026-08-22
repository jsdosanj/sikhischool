import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { theme, WorksheetHeader, WorksheetFooter, MixedScriptText, NAVY, INK_SOFT } from "./worksheetTheme";

const styles = StyleSheet.create({
  block: { marginBottom: 24 },
  promptRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 12 },
  numberBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: NAVY,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    marginTop: 1,
  },
  numberText: { fontSize: 11, fontFamily: "Helvetica-Bold", color: "#ffffff" },
  prompt: { fontSize: 13, fontFamily: "Helvetica-Bold", flex: 1, lineHeight: 1.5, paddingTop: 3 },
  lines: { marginLeft: 34 },
  line: { borderBottom: `1pt solid ${INK_SOFT}`, height: 28 },
});

export interface WritingPrompt {
  prompt: string;
  lines: number;
}

export default function WritingLinesWorksheet({
  title,
  instructions,
  prompts,
  gradeLevel,
  subject,
}: {
  title: string;
  instructions: string;
  prompts: WritingPrompt[];
  gradeLevel?: string;
  subject?: string;
}) {
  return (
    <Document>
      <Page size="A4" style={theme.page}>
        <WorksheetHeader title={title} subtitle={instructions} gradeLevel={gradeLevel} subject={subject} />
        {prompts.map((p, i) => (
          <View key={i} style={styles.block} wrap={false}>
            <View style={styles.promptRow}>
              <View style={styles.numberBadge}>
                <Text style={styles.numberText}>{i + 1}</Text>
              </View>
              <MixedScriptText style={styles.prompt}>{p.prompt}</MixedScriptText>
            </View>
            <View style={styles.lines}>
              {Array.from({ length: p.lines }).map((_, j) => (
                <View key={j} style={styles.line} />
              ))}
            </View>
          </View>
        ))}
        <WorksheetFooter />
      </Page>
    </Document>
  );
}
