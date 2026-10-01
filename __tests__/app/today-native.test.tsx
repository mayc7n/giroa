import * as mockReact from 'react';
import { Text as mockText } from 'react-native';
import { render } from '@testing-library/react-native';

import TodayNativeScreen from '@/app/(tabs)/hoje.native';

jest.mock('@/features/today/TodayDashboard', () => {
  return function MockTodayDashboard() {
    return mockReact.createElement(mockText, null, 'today-dashboard-marker');
  };
});

describe('Hoje nativo', () => {
  it('não mostra manutenção de dados como ação principal', () => {
    const { getByText, queryByText } = render(<TodayNativeScreen />);

    expect(getByText('today-dashboard-marker')).toBeTruthy();
    expect(queryByText('backup-actions-marker')).toBeNull();
  });
});
