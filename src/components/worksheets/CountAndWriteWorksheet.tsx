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
  shapes: { flexDirection: "row", flexWrap: "wrap", maxWidth: 340, gap: 4 },
  shape: { width: 12, height: 12, backgroundColor: "#f4b21a", borderRadius: 2 },
  answerBox: { width: 60, height: 32, border: "1.5pt solid #333", borderRadius: 4 },
});

export interface CountAndWriteRow {
  count: number;
  label: string;
}

export default function CountAndWriteWorksheet({
  title,
  rows,
}: {
  title: string;
  rows: CountAndWriteRow[];
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>Count each group, then write the number in the box.</Text>
        {rows.map((row, i) => (
           
          <View key={i} style={styles.row}>
            <View style={styles.shapes}>
              {Array.from({ length: row.count }).map((_, j) => (
                 
                <View key={j} style={styles.shape} />
              ))}
            </View>
            <View style={styles.answerBox} />
          </View>
        ))}
      </Page>
    </Document>
  );
}
