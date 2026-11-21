import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  label: string;
  hint?: string;
  selected: boolean;
  onToggle: () => void;
  /** Tile fills half the row (2-column grid) when true. */
  half?: boolean;
};

/** Checkbox-style option tile, mirroring the website's character-type toggles. */
export function ToggleChip({ label, hint, selected, onToggle, half }: Props) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      onPress={onToggle}
      style={[
        styles.chip,
        half && styles.half,
        {
          backgroundColor: selected ? `${theme.primary}1a` : theme.bg,
          borderColor: selected ? theme.primary : theme.border,
        },
      ]}>
      <View
        style={[
          styles.box,
          { backgroundColor: selected ? theme.primary : 'transparent', borderColor: selected ? theme.primary : theme.textSecondary },
        ]}>
        {selected ? <MaterialCommunityIcons name="check" size={14} color={theme.onPrimary} /> : null}
      </View>
      <View style={styles.text}>
        <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
        {hint ? <Text style={[styles.hint, { color: theme.textSecondary, fontFamily: Fonts.mono }]}>{hint}</Text> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Radius.md,
    borderWidth: 1.5,
  },
  half: { width: '48.5%' },
  box: { width: 20, height: 20, borderRadius: 6, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  text: { flexShrink: 1 },
  label: { fontSize: 14, fontWeight: '700' },
  hint: { fontSize: 12 },
});
