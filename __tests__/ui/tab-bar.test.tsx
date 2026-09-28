import { render } from '@testing-library/react-native';

jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text: MockText } = require('react-native');

  return {
    Ionicons: ({ name, color, size }: { name: string; color: string; size: number }) => (
      React.createElement(MockText, null, `${name}:${color}:${size}`)
    ),
  };
});

import { tabBarIcon } from '@/ui/tabBar';

describe('barra de navegação', () => {
  it('usa ícones semânticos para cada área e diferencia o estado ativo', () => {
    const active = render(tabBarIcon('hoje')({ color: '#f2c94c', focused: true }));
    const inactive = render(tabBarIcon('dados')({ color: '#777777', focused: false }));

    expect(active.getByText('home:#f2c94c:22')).toBeTruthy();
    expect(inactive.getByText('cloud-upload-outline:#777777:22')).toBeTruthy();
  });
});
