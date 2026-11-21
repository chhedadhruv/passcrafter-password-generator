import * as Clipboard from 'expo-clipboard';
import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Screen } from '@/components/screen';
import { Slider } from '@/components/slider';
import { StrengthMeter } from '@/components/strength-meter';
import { ToggleChip } from '@/components/toggle-chip';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { MAX_LENGTH, MIN_LENGTH, entropyBits, generatePassword, poolSize, strengthLabel } from '@lib/password';

type CharKey = 'lowercase' | 'uppercase' | 'numbers' | 'symbols';

const CHARS: { key: CharKey; label: string; hint: string }[] = [
  { key: 'lowercase', label: 'Lowercase', hint: 'a–z' },
  { key: 'uppercase', label: 'Uppercase', hint: 'A–Z' },
  { key: 'numbers', label: 'Numbers', hint: '0–9' },
  { key: 'symbols', label: 'Symbols', hint: '!@#$' },
];

export function Generate() {
  const theme = useTheme();
  const [opts, setOpts] = useState({
    length: 16,
    lowercase: true,
    uppercase: true,
    numbers: true,
    symbols: false,
    excludeAmbiguous: false,
  });
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const regenerate = useCallback(() => setPassword(generatePassword(opts)), [opts]);
  useEffect(regenerate, [regenerate]);
  useEffect(() => () => clearTimeout(copyTimer.current), []);

  const toggle = (key: CharKey | 'excludeAmbiguous') => {
    const next = { ...opts, [key]: !opts[key] };
    // Always keep at least one character type selected.
    if (!next.lowercase && !next.uppercase && !next.numbers && !next.symbols) return;
    setOpts(next);
  };

  const copy = async () => {
    await Clipboard.setStringAsync(password);
    setCopied(true);
    clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(false), 2000);
  };

  const bits = entropyBits(opts.length, poolSize(opts));
  const { label, level } = strengthLabel(bits);

  return (
    <Screen
      eyebrow="Free · Private · Offline"
      title="Password generator"
      subtitle="Random passwords made on this phone with secure randomness. Nothing is sent anywhere.">
      <Card>
        <View style={[styles.output, { backgroundColor: theme.bg, borderColor: theme.border }]}>
          <Text selectable testID="password" style={[styles.password, { color: theme.text, fontFamily: Fonts.mono }]}>
            {password}
          </Text>
        </View>
        <StrengthMeter level={level} label={label} bits={bits} />
        <View style={styles.actions}>
          <Button
            label={copied ? 'Copied' : 'Copy'}
            icon={copied ? 'check' : 'content-copy'}
            onPress={copy}
            style={styles.grow}
          />
          <Button label="Regenerate" icon="refresh" variant="outline" onPress={regenerate} style={styles.grow} />
        </View>
      </Card>

      <Card>
        <Slider
          label="Length"
          value={opts.length}
          min={MIN_LENGTH}
          max={MAX_LENGTH}
          onChange={(length) => setOpts((o) => ({ ...o, length }))}
        />
        <Text style={[styles.group, { color: theme.text }]}>Characters</Text>
        <View style={styles.grid}>
          {CHARS.map(({ key, label: l, hint }) => (
            <ToggleChip key={key} half label={l} hint={hint} selected={opts[key]} onToggle={() => toggle(key)} />
          ))}
        </View>
        <ToggleChip
          label="Avoid look-alike characters"
          hint="0 O 1 l I"
          selected={opts.excludeAmbiguous}
          onToggle={() => toggle('excludeAmbiguous')}
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  output: { minHeight: 84, justifyContent: 'center', padding: Spacing.four, borderRadius: Radius.md, borderWidth: 1 },
  password: { fontSize: 22, lineHeight: 30 },
  actions: { flexDirection: 'row', gap: Spacing.two },
  grow: { flex: 1 },
  group: { fontSize: 14, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two, justifyContent: 'space-between' },
});
