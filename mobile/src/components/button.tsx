import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'danger';
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  disabled?: boolean;
  small?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Button({ label, onPress, variant = 'primary', icon, disabled, small, style }: Props) {
  const theme = useTheme();
  const palette = {
    primary: { bg: theme.primary, fg: theme.onPrimary, border: theme.primary },
    outline: { bg: theme.surface, fg: theme.text, border: theme.border },
    danger: { bg: 'transparent', fg: theme.danger, border: theme.danger },
  }[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      android_ripple={{ color: `${palette.fg}22` }}
      style={({ pressed }) => [
        styles.base,
        small && styles.small,
        { backgroundColor: palette.bg, borderColor: palette.border, opacity: disabled ? 0.5 : pressed ? 0.85 : 1 },
        style,
      ]}>
      {icon ? <MaterialCommunityIcons name={icon} size={small ? 16 : 18} color={palette.fg} /> : null}
      <Text style={[styles.label, small && styles.labelSmall, { color: palette.fg }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingVertical: 13,
    paddingHorizontal: Spacing.five,
    borderRadius: Radius.pill,
    borderWidth: 1,
    overflow: 'hidden',
  },
  small: { paddingVertical: 8, paddingHorizontal: Spacing.three },
  label: { fontSize: 15, fontWeight: '700' },
  labelSmall: { fontSize: 13 },
});
