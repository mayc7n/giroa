import { render } from '@testing-library/react-native';

jest.mock('expo-router', () => {
  const React = require('react');
  const { Text: MockText } = require('react-native');

  return {
    Redirect: ({ href }: { href: string }) => React.createElement(MockText, { testID: 'home-route-target' }, href),
  };
});

import HomeScreen from '@/app/index';

describe('rota inicial', () => {
  it('redireciona a raiz para Hoje dentro da navegação por abas', () => {
    const { getByText } = render(<HomeScreen />);

    expect(getByText('/(tabs)/hoje')).toBeTruthy();
  });
});
