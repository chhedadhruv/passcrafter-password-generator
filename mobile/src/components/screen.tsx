import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  children: ReactNode;
};

/** Standard tab/screen wrapper: safe-area padding, large title, scrolling content. */
export function Screen({ title, subtitle, eyebrow, children }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={{ backgroundColor: theme.bg }}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + Spacing.five }]}
      keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        {eyebrow ? <Text style={[styles.eyebrow, { color: theme.primaryText }]}>{eyebrow.toUpperCase()}</Text> : null}
        <Text accessibilityRole="header" style={[styles.title, { color: theme.text }]}>
          {title}
        </Text>
        {subtitle ? <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{subtitle}</Text> : null}
      </View>
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: Spacing.four, paddingBottom: Spacing.six, gap: Spacing.four },
  header: { gap: Spacing.one, marginBottom: Spacing.one },
  eyebrow: { fontSize: 12, fontWeight: '800', letterSpacing: 1.4 },
  title: { fontSize: 30, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { fontSize: 15, lineHeight: 21 },
});
