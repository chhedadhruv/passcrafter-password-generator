import type React from 'react';
import { useRef, useState } from 'react';
import { PanResponder, StyleSheet, Text, View, type AccessibilityActionEvent } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
};

const THUMB = 26;

/** JS-only slider (no native dependency) with a value pill, drag and accessibility actions. */
export function Slider({ label, value, min, max, onChange }: Props) {
  const theme = useTheme();
  const track = useRef<React.ComponentRef<typeof View>>(null);
  const geometry = useRef({ left: 0, width: 1 });
  const latest = useRef({ min, max, onChange });
  latest.current = { min, max, onChange };
  const [width, setWidth] = useState(0);

  const valueAt = (pageX: number) => {
    const { left, width: w } = geometry.current;
    const ratio = Math.min(1, Math.max(0, (pageX - left) / w));
    return Math.round(latest.current.min + ratio * (latest.current.max - latest.current.min));
  };

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (e) => {
        const pageX = e.nativeEvent.pageX;
        track.current?.measureInWindow((x, _y, w) => {
          geometry.current = { left: x, width: w || 1 };
          latest.current.onChange(valueAt(pageX));
        });
      },
      onPanResponderMove: (e) => latest.current.onChange(valueAt(e.nativeEvent.pageX)),
    })
  ).current;

  const onAccessibilityAction = (e: AccessibilityActionEvent) => {
    const step = e.nativeEvent.actionName === 'increment' ? 1 : -1;
    onChange(Math.min(max, Math.max(min, value + step)));
  };

  const ratio = (value - min) / (max - min);
  const x = ratio * Math.max(0, width - THUMB);

  return (
    <View style={styles.wrap}>
      <View style={styles.head}>
        <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
        <View style={[styles.pill, { backgroundColor: theme.surfaceMuted }]}>
          <Text style={[styles.pillText, { color: theme.primaryText }]}>{value}</Text>
        </View>
      </View>
      <View
        ref={track}
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={label}
        accessibilityValue={{ min, max, now: value }}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={onAccessibilityAction}
        style={styles.touch}
        {...pan.panHandlers}>
        <View style={[styles.rail, { backgroundColor: theme.border }]} />
        <View style={[styles.fill, { backgroundColor: theme.primary, width: x + THUMB / 2 }]} />
        <View style={[styles.thumb, { backgroundColor: theme.primary, borderColor: theme.surface, left: x }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.two },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { fontSize: 14, fontWeight: '700' },
  pill: { paddingHorizontal: Spacing.three, paddingVertical: 3, borderRadius: 999 },
  pillText: { fontSize: 13, fontWeight: '800', fontVariant: ['tabular-nums'] },
  touch: { height: 40, justifyContent: 'center' },
  rail: { height: 6, borderRadius: 3 },
  fill: { position: 'absolute', height: 6, borderRadius: 3 },
  thumb: { position: 'absolute', width: THUMB, height: THUMB, borderRadius: THUMB / 2, borderWidth: 3 },
});
