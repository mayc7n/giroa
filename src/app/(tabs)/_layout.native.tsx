import { Tabs } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';

import { migrateDatabase } from '@/data/migrations';

export default function TabsLayout() {
  return (
    <SQLiteProvider databaseName="giroa.db" onInit={migrateDatabase}>
      <Tabs
        initialRouteName="hoje"
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#0B776D',
          tabBarInactiveTintColor: '#65716D',
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
