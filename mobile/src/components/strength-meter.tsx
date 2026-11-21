import { StyleSheet, Text, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = { level: number; maxLevel?: number; label: string; bits?: number };

/** Segmented strength bar; `level` runs 0..maxLevel (4 for the generator, 5 for the checker). */
export function StrengthMeter({ level, maxLevel = 4, label, bits }: Props) {
  const theme = useTheme();
  const colors = [theme.border, theme.danger, theme.warning, theme.success, theme.primary, theme.primary];

  return (
    <View
      accessible
      accessibilityLabel={`Strength: ${label}${bits !== undefined ? `, ${Math.round(bits)} bits` : ''}`}
      style={styles.row}>
      <View style={styles.bars}>
        {Array.from({ length: maxLevel }, (_, i) => (
          <View
            key={i}
            style={[styles.bar, { backgroundColor: i < level ? colors[Math.min(level, colors.length - 1)] : theme.border }]}
          />
        ))}
      </View>
      <Text style={[styles.label, { color: theme.textSecondary }]}>
        {label}
        {bits !== undefined ? ` · ${Math.round(bits)} bits` : ''}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  bars: { flexDirection: 'row', gap: 4, flex: 1 },
  bar: { height: 6, flex: 1, borderRadius: 3 },
  label: { fontSize: 13, fontWeight: '700' },
});
