import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { theme, WorksheetHeader, WorksheetFooter, MixedScriptText, NAVY, INK_SOFT, RULE } from "./worksheetTheme";

const styles = StyleSheet.create({
  item: { marginBottom: 22 },
  itemRow: { flexDirection: "row", alignItems: "flex-start" },
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
  problem: { fontSize: 13, lineHeight: 1.5, flex: 1, paddingTop: 3 },
  answerRow: { flexDirection: "row", alignItems: "center", marginTop: 10, marginLeft: 34 },
  answerLabel: { fontSize: 8, fontFamily: "Helvetica-Bold", color: INK_SOFT, letterSpacing: 1, marginRight: 8 },
  answerLine: { flex: 1, borderBottom: `1pt solid ${INK_SOFT}`, height: 22 },
  divider: { height: 0.75, backgroundColor: RULE, marginTop: 4 },
});

export interface PracticeProblemRow {
  problem: string;
}

export default function PracticeProblemsWorksheet({
  title,
  instructions,
  rows,
  gradeLevel,
  subject,
}: {
  title: string;
  instructions: string;
  rows: PracticeProblemRow[];
  gradeLevel?: string;
  subject?: string;
}) {
  return (
    <Document>
      <Page size="A4" style={theme.page}>
        <WorksheetHeader title={title} subtitle={instructions} gradeLevel={gradeLevel} subject={subject} />
        {rows.map((row, i) => (
          <View key={i} style={styles.item} wrap={false}>
            <View style={styles.itemRow}>
              <View style={styles.numberBadge}>
                <Text style={styles.numberText}>{i + 1}</Text>
              </View>
              <MixedScriptText style={styles.problem}>{row.problem}</MixedScriptText>
            </View>
            <View style={styles.answerRow}>
              <Text style={styles.answerLabel}>ANSWER</Text>
              <View style={styles.answerLine} />
            </View>
            {i < rows.length - 1 ? <View style={styles.divider} /> : null}
          </View>
        ))}
        <WorksheetFooter />
      </Page>
    </Document>
  );
}
