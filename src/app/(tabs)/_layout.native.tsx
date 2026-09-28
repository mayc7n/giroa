import { Tabs } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';

import { migrateDatabase } from '@/data/migrations';
import { colors } from '@/ui/tokens';

export default function TabsLayout() {
  return (
    <SQLiteProvider databaseName="giroa.db" onInit={migrateDatabase}>
      <Tabs
        initialRouteName="hoje"
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.interactive.accent,
          tabBarInactiveTintColor: colors.content.muted,
          tabBarStyle: {
            backgroundColor: colors.background.surface,
            borderTopColor: colors.border.default,
          },
        }}
      >
        <Tabs.Screen name="hoje" options={{ title: 'Hoje' }} />
        <Tabs.Screen name="servicos" options={{ title: 'Serviços' }} />
        <Tabs.Screen name="caixa" options={{ title: 'Caixa' }} />
        <Tabs.Screen name="clientes" options={{ title: 'Clientes' }} />
      </Tabs>
    </SQLiteProvider>
  );
}
