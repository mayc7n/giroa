import { Alert } from 'react-native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

import type { CashSummary } from '@/application/paymentUseCases';
import CashNativeScreen from '@/app/(tabs)/caixa.native';

const mockGetCashSummary = jest.fn();
const mockReversePayment = jest.fn();
const mockReverseExpense = jest.fn();
const mockDatabase = {};

jest.mock('expo-sqlite', () => ({
  useSQLiteContext: () => mockDatabase,
}));

jest.mock('@/data/database', () => ({
  createSqliteRepositories: () => ({
    services: {},
    payments: {},
    expenses: {},
  }),
}));

jest.mock('@/application/paymentUseCases', () => ({
  createPaymentUseCases: () => ({
    getCashSummary: mockGetCashSummary,
    reversePayment: mockReversePayment,
  }),
}));

jest.mock('@/application/expenseUseCases', () => ({
  createExpenseUseCases: () => ({
    register: jest.fn(),
    reverse: mockReverseExpense,
  }),
}));

const initialSummary: CashSummary = {
  entriesCents: 30000,
  exitsCents: 0,
  periodBalanceCents: 30000,
  pendingCents: 55000,
  movements: [{
    id: 'payment-1',
    date: '2026-09-27',
    description: 'Instalação',
    category: 'pix',
    amountCents: 30000,
    kind: 'entry',
    status: 'active',
  }],
};

const reversedSummary: CashSummary = {
  ...initialSummary,
  entriesCents: 0,
  periodBalanceCents: 0,
  movements: [{ ...initialSummary.movements[0], status: 'reversed' }],
};

describe('native cash route', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('reloads the local summary after a confirmed payment reversal', async () => {
    mockGetCashSummary.mockResolvedValueOnce(initialSummary).mockResolvedValueOnce(reversedSummary);
    mockReversePayment.mockResolvedValue(reversedSummary.movements[0]);
    jest.spyOn(Alert, 'alert').mockImplementation((_title, _message, buttons) => {
      buttons?.find((button) => button.text === 'Estornar')?.onPress?.();
    });

    const { findByText, getByRole } = render(<CashNativeScreen />);
    expect(await findByText('R$ 300,00')).toBeTruthy();

    fireEvent.press(getByRole('button', { name: 'Estornar Instalação' }));

    await waitFor(() => expect(mockReversePayment).toHaveBeenCalledWith('payment-1'));
    await waitFor(() => expect(mockGetCashSummary).toHaveBeenCalledTimes(2));
    expect(await findByText('Estornada')).toBeTruthy();
    expect(await findByText('R$ 0,00')).toBeTruthy();
  });
});
