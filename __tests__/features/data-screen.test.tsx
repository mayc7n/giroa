import { render } from '@testing-library/react-native';

import DataScreen from '@/features/data/DataScreen';

jest.mock('expo-sqlite', () => ({
  useSQLiteContext: () => ({}),
}));

describe('tela de dados', () => {
  it('concentra backup e restauração fora da tela Hoje', () => {
    const { getByText, getByRole } = render(<DataScreen />);

    expect(getByText('Dados')).toBeTruthy();
    expect(getByRole('button', { name: 'Exportar dados' })).toBeTruthy();
    expect(getByRole('button', { name: 'Restaurar dados' })).toBeTruthy();
  });
});
