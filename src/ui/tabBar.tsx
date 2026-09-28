import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

export type TabRoute = 'hoje' | 'servicos' | 'caixa' | 'clientes' | 'dados';

type IconName = ComponentProps<typeof Ionicons>['name'];
type TabIconProps = {
  color: ComponentProps<typeof Ionicons>['color'];
  focused: boolean;
};

const icons: Record<TabRoute, { active: IconName; inactive: IconName }> = {
  hoje: { active: 'home', inactive: 'home-outline' },
  servicos: { active: 'briefcase', inactive: 'briefcase-outline' },
  caixa: { active: 'wallet', inactive: 'wallet-outline' },
  clientes: { active: 'people', inactive: 'people-outline' },
  dados: { active: 'cloud-upload', inactive: 'cloud-upload-outline' },
};

export function tabBarIcon(route: TabRoute) {
  function TabBarIcon({ color, focused }: TabIconProps) {
    return (
      <Ionicons
        name={focused ? icons[route].active : icons[route].inactive}
        color={color}
        size={22}
      />
    );
  }

  return TabBarIcon;
}
