import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/card';
import { Screen } from '@/components/screen';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

const TOOLS: { name: string; blurb: string; icon: IconName }[] = [
  { name: 'Passphrase generator', blurb: 'Memorable multi-word passphrases from the EFF wordlist.', icon: 'dice-multiple-outline' },
  { name: 'Strength checker', blurb: 'Estimate how long a password would take to crack.', icon: 'speedometer' },
  { name: 'Breach checker', blurb: 'See if a password appeared in a known breach, privately.', icon: 'shield-alert-outline' },
  { name: 'PIN generator', blurb: 'Random numeric PINs that avoid obvious patterns.', icon: 'dialpad' },
  { name: 'Username generator', blurb: 'Readable random usernames in several styles.', icon: 'account-outline' },
  { name: 'Hash generator', blurb: 'SHA-1, SHA-256, SHA-384 and SHA-512 of any text.', icon: 'fingerprint' },
];

export default function ToolsTab() {
  const theme = useTheme();
  return (
    <Screen eyebrow="Toolkit" title="Security tools" subtitle="Everything runs on your phone, with no account.">
      {TOOLS.map(({ name, blurb, icon }) => (
        <Card key={name} style={styles.row}>
          <View style={[styles.icon, { backgroundColor: theme.surfaceMuted }]}>
            <MaterialCommunityIcons name={icon} size={22} color={theme.primaryText} />
          </View>
          <View style={styles.text}>
            <Text style={[styles.name, { color: theme.text }]}>{name}</Text>
            <Text style={{ color: theme.textSecondary, lineHeight: 20 }}>{blurb}</Text>
          </View>
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.four },
  icon: { width: 44, height: 44, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1, gap: 2 },
  name: { fontSize: 17, fontWeight: '800' },
});
