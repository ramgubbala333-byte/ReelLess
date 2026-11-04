import { Tabs } from 'expo-router';
import { ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Glyph, { GlyphName } from '@/components/Glyph';
import { colors, fonts } from '@/theme';

function tabIcon(name: GlyphName) {
  return ({ color, size }: { color: ColorValue; size: number }) => (
    <Glyph name={name} size={size ?? 22} color={String(color)} />
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 0);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // Raised game-console bar: navy panel, rounded top corners, soft
        // shadow. Height and bottom padding always include the device
        // safe-area inset so Android system navigation never covers it.
        tabBarStyle: {
          backgroundColor: colors.panel,
          borderTopColor: colors.line,
          borderTopWidth: 1,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          height: 74 + bottomInset,
          paddingTop: 8,
          paddingBottom: Math.max(8, bottomInset),
          shadowColor: '#04070F',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.35,
          shadowRadius: 10,
          elevation: 10,
        },
        // Active tab gets a filled pill highlight with an orange icon.
        tabBarActiveTintColor: colors.amber,
        tabBarInactiveTintColor: colors.muted,
        tabBarActiveBackgroundColor: colors.panelAlt,
        tabBarItemStyle: {
          borderRadius: 999,
          marginHorizontal: 4,
          marginVertical: 4,
        },
        tabBarLabelStyle: { fontFamily: fonts.bodyBold, fontSize: 11 },
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Today', tabBarIcon: tabIcon('today') }} />
      <Tabs.Screen name="feed" options={{ title: 'Reels', tabBarIcon: tabIcon('reels') }} />
      <Tabs.Screen name="stats" options={{ title: 'Stats', tabBarIcon: tabIcon('stats') }} />
      <Tabs.Screen name="challenge" options={{ title: 'Duel', tabBarIcon: tabIcon('duel') }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarIcon: tabIcon('settings') }} />
    </Tabs>
  );
}
