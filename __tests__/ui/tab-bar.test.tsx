import * as mockReact from 'react';
import { Text as mockText } from 'react-native';
import { render } from '@testing-library/react-native';

import { tabBarIcon } from '@/ui/tabBar';

jest.mock('@expo/vector-icons', () => {
  return {
    Ionicons: ({ name, color, size }: { name: string; color: string; size: number }) => (
      mockReact.createElement(mockText, null, `${name}:${color}:${size}`)
    ),
  };
});

describe('barra de navegação', () => {
  it('usa ícones semânticos para cada área e diferencia o estado ativo', () => {
    const active = render(tabBarIcon('hoje')({ color: '#f2c94c', focused: true }));
    const inactive = render(tabBarIcon('dados')({ color: '#777777', focused: false }));

    expect(active.getByText('home:#f2c94c:22')).toBeTruthy();
    expect(inactive.getByText('cloud-upload-outline:#777777:22')).toBeTruthy();
  });
});
