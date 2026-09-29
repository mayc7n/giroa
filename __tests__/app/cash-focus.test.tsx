import { act, render, waitFor } from '@testing-library/react-native';

import CashNativeScreen from '@/app/(tabs)/caixa.native';

const mockFocusListeners = new Set<() => void>();
const mockGetCashSummary = jest.fn(async () => ({
  entriesCents: 30000,
  exitsCents: 0,
  periodBalanceCents: 30000,
  pendingCents: 55000,
  movements: [],
}));
const mockDatabase = {};

jest.mock('expo-router', () => {
  const React = require('react');

  return {
    useFocusEffect: (effect: () => void | (() => void)) => {
      const effectRef = React.useRef(effect);
      effectRef.current = effect;
      React.useEffect(() => {
        let cleanup: (() => void) | undefined;
        const run = () => {
          cleanup?.();
          const nextCleanup = effectRef.current();
          cleanup = typeof nextCleanup === 'function' ? nextCleanup : undefined;
        };

        mockFocusListeners.add(run);
        run();
        return () => {
          cleanup?.();
          mockFocusListeners.delete(run);
        };
      }, []);
    },
  };
});

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
    reversePayment: jest.fn(),
  }),
}));

jest.mock('@/application/expenseUseCases', () => ({
  createExpenseUseCases: () => ({
    register: jest.fn(),
    reverse: jest.fn(),
  }),
}));

jest.mock('@/features/cash/CashScreen', () => {
  const React = require('react');
  const { Text } = require('react-native');

  return function MockCashScreen({ summary }: { summary: { entriesCents: number } | null }) {
    return React.createElement(Text, null, summary ? `cash-summary:${summary.entriesCents}` : 'cash-loading');
  };
});

describe('native cash focus refresh', () => {
  afterEach(() => {
    mockFocusListeners.clear();
    jest.clearAllMocks();
  });

  it('reloads the cash summary when the tab receives focus again', async () => {
    const { findByText } = render(<CashNativeScreen />);
    expect(await findByText('cash-summary:30000')).toBeTruthy();

    await act(async () => {
      mockFocusListeners.forEach((listener) => listener());
    });

    await waitFor(() => expect(mockGetCashSummary).toHaveBeenCalledTimes(2));
  });
});
