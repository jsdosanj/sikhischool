import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 12, fontFamily: "Helvetica" },
  title: { fontSize: 20, marginBottom: 8, fontWeight: 700 },
  subtitle: { fontSize: 11, marginBottom: 24, color: "#555" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "1pt solid #ddd",
    paddingVertical: 14,
  },
  problem: { fontSize: 14, flex: 1 },
  answerBox: { width: 80, height: 36, border: "1.5pt solid #333", borderRadius: 4, marginLeft: 16 },
});

export interface PracticeProblemRow {
  problem: string;
}

export default function PracticeProblemsWorksheet({
  title,
  instructions,
  rows,
}: {
  title: string;
  instructions: string;
  rows: PracticeProblemRow[];
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{instructions}</Text>
        {rows.map((row, i) => (
          <View key={i} style={styles.row}>
            <Text style={styles.problem}>{row.problem}</Text>
            <View style={styles.answerBox} />
          </View>
        ))}
      </Page>
    </Document>
  );
}
