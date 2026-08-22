import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { theme, WorksheetHeader, WorksheetFooter, NAVY, SAFFRON, INK_SOFT } from "./worksheetTheme";

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: `1pt solid #e6e1d6`,
    paddingVertical: 16,
  },
  shapes: { flexDirection: "row", flexWrap: "wrap", maxWidth: 320, gap: 6 },
  shape: { width: 14, height: 14, backgroundColor: SAFFRON, borderRadius: 3, border: `0.5pt solid ${NAVY}` },
  answerCol: { alignItems: "center" },
  answerLabel: { fontSize: 8, fontFamily: "Helvetica-Bold", color: INK_SOFT, letterSpacing: 1, marginBottom: 4 },
  answerBox: { width: 64, height: 40, border: `1.5pt solid ${NAVY}`, borderRadius: 6 },
});

export interface CountAndWriteRow {
  count: number;
  label: string;
}

export default function CountAndWriteWorksheet({
  title,
  rows,
  gradeLevel,
  subject,
}: {
  title: string;
  rows: CountAndWriteRow[];
  gradeLevel?: string;
  subject?: string;
}) {
  return (
    <Document>
      <Page size="A4" style={theme.page}>
        <WorksheetHeader
          title={title}
          subtitle="Count each group, then write the number in the box."
          gradeLevel={gradeLevel}
          subject={subject}
        />
        {rows.map((row, i) => (
          <View key={i} style={styles.row} wrap={false}>
            <View style={styles.shapes}>
              {Array.from({ length: row.count }).map((_, j) => (
                <View key={j} style={styles.shape} />
              ))}
            </View>
            <View style={styles.answerCol}>
              <Text style={styles.answerLabel}>COUNT</Text>
              <View style={styles.answerBox} />
            </View>
          </View>
        ))}
        <WorksheetFooter />
      </Page>
    </Document>
  );
}
