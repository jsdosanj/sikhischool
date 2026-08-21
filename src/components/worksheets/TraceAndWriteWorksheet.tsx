import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";

// Registered once per module load, not per render. URLs verified live against
// fonts.gstatic.com (Google's Noto Sans Gurmukhi, SIL Open Font License) —
// react-pdf fetches these client-side, where Workers' WASM restriction
// (see WorksheetDownloadButton.tsx) doesn't apply.
Font.register({
  family: "Noto Sans Gurmukhi",
  fonts: [
    { src: "https://fonts.gstatic.com/s/notosansgurmukhi/v29/w8g9H3EvQP81sInb43inmyN9zZ7hb7ATbSWo4q8dJ74a3cVrYFQ_bogT0-gPeG1Oenbx.ttf", fontWeight: 400 },
    { src: "https://fonts.gstatic.com/s/notosansgurmukhi/v29/w8g9H3EvQP81sInb43inmyN9zZ7hb7ATbSWo4q8dJ74a3cVrYFQ_bogT0-gPeG2pfXbx.ttf", fontWeight: 700 },
  ],
});

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 12, fontFamily: "Helvetica" },
  title: { fontSize: 20, marginBottom: 8, fontWeight: 700 },
  subtitle: { fontSize: 11, marginBottom: 24, color: "#555" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    borderBottom: "1pt solid #ddd",
    paddingVertical: 16,
  },
  traceBox: {
    width: 70,
    height: 70,
    border: "1.5pt solid #333",
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  traceChar: { fontFamily: "Noto Sans Gurmukhi", fontSize: 36, color: "#bbb" },
  labelCol: { flex: 1 },
  label: { fontSize: 13, marginBottom: 4 },
  practiceLine: { borderBottom: "1pt dashed #999", height: 24 },
});

export interface TraceAndWriteRow {
  // The character/word to trace — may be Gurmukhi or plain text.
  trace: string;
  label: string;
}

export default function TraceAndWriteWorksheet({
  title,
  instructions,
  rows,
}: {
  title: string;
  instructions: string;
  rows: TraceAndWriteRow[];
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{instructions}</Text>
        {rows.map((row, i) => (
          <View key={i} style={styles.row}>
            <View style={styles.traceBox}>
              <Text style={styles.traceChar}>{row.trace}</Text>
            </View>
            <View style={styles.labelCol}>
              <Text style={styles.label}>{row.label}</Text>
              <View style={styles.practiceLine} />
            </View>
          </View>
        ))}
      </Page>
    </Document>
  );
}
