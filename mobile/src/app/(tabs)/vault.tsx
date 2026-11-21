import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/card';
import { Screen } from '@/components/screen';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function VaultTab() {
  const theme = useTheme();
  return (
    <Screen eyebrow="Private · Encrypted · Local" title="Vault" subtitle="Your passwords, encrypted on this device.">
      <Card style={styles.card}>
        <View style={[styles.icon, { backgroundColor: theme.surfaceMuted }]}>
          <MaterialCommunityIcons name="shield-lock-outline" size={30} color={theme.primaryText} />
        </View>
        <Text style={[styles.title, { color: theme.text }]}>Vault coming next</Text>
        <Text style={{ color: theme.textSecondary, textAlign: 'center', lineHeight: 21 }}>
          AES-256 encrypted entries, biometric unlock, autofill, change reminders and a password health report.
        </Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { alignItems: 'center', paddingVertical: Spacing.six },
  icon: { width: 64, height: 64, borderRadius: Radius.card, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: '800' },
});
