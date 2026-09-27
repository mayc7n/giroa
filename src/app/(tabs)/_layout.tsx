import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
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
  );
}
