import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 12, fontFamily: "Helvetica" },
  title: { fontSize: 20, marginBottom: 8, fontWeight: 700 },
  subtitle: { fontSize: 11, marginBottom: 24, color: "#555" },
  block: { marginBottom: 24 },
  prompt: { fontSize: 13, marginBottom: 10, fontWeight: 700 },
  line: { borderBottom: "1pt solid #999", height: 26 },
});

export interface WritingPrompt {
  prompt: string;
  lines: number;
}

export default function WritingLinesWorksheet({
  title,
  instructions,
  prompts,
}: {
  title: string;
  instructions: string;
  prompts: WritingPrompt[];
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{instructions}</Text>
        {prompts.map((p, i) => (
          <View key={i} style={styles.block}>
            <Text style={styles.prompt}>{p.prompt}</Text>
            {Array.from({ length: p.lines }).map((_, j) => (
              <View key={j} style={styles.line} />
            ))}
          </View>
        ))}
      </Page>
    </Document>
  );
}
