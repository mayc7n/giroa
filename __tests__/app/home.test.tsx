import * as mockReact from 'react';
import { Text as mockText } from 'react-native';
import { render } from '@testing-library/react-native';

import HomeScreen from '@/app/index';

jest.mock('expo-router', () => {
  return {
    Redirect: ({ href }: { href: string }) => mockReact.createElement(mockText, { testID: 'home-route-target' }, href),
  };
});

describe('rota inicial', () => {
  it('redireciona a raiz para Hoje dentro da navegação por abas', () => {
    const { getByText } = render(<HomeScreen />);

    expect(getByText('/(tabs)/hoje')).toBeTruthy();
  });
});
