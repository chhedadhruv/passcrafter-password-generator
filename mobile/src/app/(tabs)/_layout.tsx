import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

import { useTheme } from '@/hooks/use-theme';

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

const TABS: { name: string; title: string; icon: IconName }[] = [
  { name: 'index', title: 'Generate', icon: 'key-variant' },
  { name: 'tools', title: 'Tools', icon: 'toolbox-outline' },
  { name: 'vault', title: 'Vault', icon: 'shield-lock-outline' },
  { name: 'settings', title: 'Settings', icon: 'cog-outline' },
];

export default function TabsLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primaryText,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: { backgroundColor: theme.surface, borderTopColor: theme.border },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '700' },
        sceneStyle: { backgroundColor: theme.bg },
      }}>
      {TABS.map(({ name, title, icon }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title,
            // Stable ids for UI tests (debug builds float a dev "Tools" button that text matching can hit).
            tabBarButtonTestID: `tab-${name}`,
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name={icon} size={size} color={color as string} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
