import { StyleSheet, Text } from 'react-native';

import { Card } from '@/components/card';
import { Screen } from '@/components/screen';
import { useTheme } from '@/hooks/use-theme';

export default function SettingsTab() {
  const theme = useTheme();
  return (
    <Screen eyebrow="Preferences" title="Settings" subtitle="Security and reminders.">
      <Card>
        <Text style={[styles.title, { color: theme.text }]}>Coming with the vault</Text>
        <Text style={{ color: theme.textSecondary, lineHeight: 21 }}>
          Biometric unlock, auto-lock, screenshot blocking, change-password reminders and autofill setup.
        </Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({ title: { fontSize: 17, fontWeight: '800' } });
