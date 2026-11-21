import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { runSelfTests, type TestResult } from '@/utils/self-test';

// Temporary home: runs the shared-code self-tests on the device. Replaced by the real app shell.
export default function Home() {
  const theme = useTheme();
  const [results, setResults] = useState<TestResult[] | null>(null);

  useEffect(() => {
    runSelfTests().then(setResults);
  }, []);

  const failed = results?.filter((r) => !r.ok).length ?? 0;

  return (
    <ScrollView style={{ backgroundColor: theme.bg }} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: theme.text }]}>PassCrafter self-test</Text>
      <Text style={{ color: theme.textSecondary }}>
        {results ? `${results.length - failed}/${results.length} passed` : 'Running…'}
      </Text>
      {results?.map((r) => (
        <View key={r.name} style={[styles.row, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={{ color: r.ok ? theme.success : theme.danger, fontWeight: '700' }}>{r.ok ? 'PASS' : 'FAIL'}</Text>
          <Text style={{ color: theme.text, flex: 1 }}>
            {r.name}
            {r.detail ? `\n${r.detail}` : ''}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingTop: 64, gap: 10 },
  title: { fontSize: 24, fontWeight: '800' },
  row: { flexDirection: 'row', gap: 10, padding: 12, borderRadius: 12, borderWidth: 1 },
});
