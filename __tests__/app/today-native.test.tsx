import { render } from '@testing-library/react-native';

jest.mock('@/features/backup/BackupActions', () => {
  const React = require('react');
  const { Text: MockText } = require('react-native');

  return function MockBackupActions() {
    return React.createElement(MockText, null, 'backup-actions-marker');
  };
});

import TodayNativeScreen from '@/app/(tabs)/hoje.native';

describe('Hoje nativo', () => {
  it('não mostra manutenção de dados como ação principal', () => {
    const { queryByText } = render(<TodayNativeScreen />);

    expect(queryByText('backup-actions-marker')).toBeNull();
  });
});
