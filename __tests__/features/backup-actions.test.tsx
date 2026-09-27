import { render } from '@testing-library/react-native';

import BackupActions from '@/features/backup/BackupActions';

jest.mock('expo-sqlite', () => ({
  useSQLiteContext: () => ({}),
}));

describe('backup actions', () => {
  it('exposes export and restore actions', () => {
    const { getByRole } = render(<BackupActions />);

    expect(getByRole('button', { name: 'Exportar dados' })).toBeTruthy();
    expect(getByRole('button', { name: 'Restaurar dados' })).toBeTruthy();
  });
});
