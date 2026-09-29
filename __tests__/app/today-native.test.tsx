import { render } from '@testing-library/react-native';

jest.mock('@/features/today/TodayDashboard', () => {
  const React = require('react');
  const { Text: MockText } = require('react-native');

  return function MockTodayDashboard() {
    return React.createElement(MockText, null, 'today-dashboard-marker');
  };
});

import TodayNativeScreen from '@/app/(tabs)/hoje.native';

describe('Hoje nativo', () => {
  it('não mostra manutenção de dados como ação principal', () => {
    const { getByText, queryByText } = render(<TodayNativeScreen />);

    expect(getByText('today-dashboard-marker')).toBeTruthy();
    expect(queryByText('backup-actions-marker')).toBeNull();
  });
});
