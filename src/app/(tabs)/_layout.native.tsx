import { Tabs } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';

import { migrateDatabase } from '@/data/migrations';
import { colors } from '@/ui/tokens';
import { tabBarIcon } from '@/ui/tabBar';

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
        <Tabs.Screen name="hoje" options={{ title: 'Hoje', tabBarIcon: tabBarIcon('hoje') }} />
        <Tabs.Screen name="servicos" options={{ title: 'Serviços', tabBarIcon: tabBarIcon('servicos') }} />
        <Tabs.Screen name="caixa" options={{ title: 'Caixa', tabBarIcon: tabBarIcon('caixa') }} />
        <Tabs.Screen name="clientes" options={{ title: 'Clientes', tabBarIcon: tabBarIcon('clientes') }} />
        <Tabs.Screen name="dados" options={{ title: 'Dados', tabBarIcon: tabBarIcon('dados') }} />
      </Tabs>
    </SQLiteProvider>
  );
}
