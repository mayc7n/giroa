import * as mockReact from 'react';
import { Text as mockText } from 'react-native';
import { act, render, waitFor } from '@testing-library/react-native';

import TodayDashboard from '@/features/today/TodayDashboard';

const mockFocusListeners = new Set<() => void>();
const mockClientsList = jest.fn(async () => [{ id: 'client-1', name: 'Ana Souza' }]);
const mockServicesList = jest.fn(async () => [{
  id: 'service-1',
  clientId: 'client-1',
  quoteId: 'quote-1',
  description: 'Instalação',
  totalCents: 50000,
  workStatus: 'planned' as const,
  createdAt: '2026-09-20T12:00:00.000Z',
  updatedAt: '2026-09-27T12:00:00.000Z',
}]);
const mockPaymentsListAll = jest.fn(async () => []);
const mockExpensesListAll = jest.fn(async () => []);

jest.mock('expo-router', () => {
  return {
    router: { push: jest.fn() },
    useFocusEffect: (effect: () => void | (() => void)) => {
      const effectRef = mockReact.useRef(effect);
      effectRef.current = effect;
      mockReact.useEffect(() => {
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

jest.mock('expo-sqlite', () => {
  const database = {};
  return {
    useSQLiteContext: () => database,
  };
});

jest.mock('@/data/database', () => ({
  createSqliteRepositories: () => ({
    clients: {
      list: mockClientsList,
    },
    services: {
      list: mockServicesList,
    },
    payments: { listAll: mockPaymentsListAll },
    expenses: { listAll: mockExpensesListAll },
  }),
}));

jest.mock('@/features/today/TodayScreen', () => {
  return function MockTodayScreen({ summary, isLoading }: { summary: { pendingCents: number } | null; isLoading: boolean }) {
    return mockReact.createElement(mockText, null, summary ? `loaded:${summary.pendingCents}` : isLoading ? 'loading' : 'empty');
  };
});

describe('TodayDashboard', () => {
  afterEach(() => {
    mockFocusListeners.clear();
    jest.clearAllMocks();
  });

  it('loads local records and passes the summary to the screen', async () => {
    const { findByText } = render(<TodayDashboard />);

    expect(await findByText('loaded:50000')).toBeTruthy();
  });

  it('reloads local records when the tab receives focus again', async () => {
    const { findByText } = render(<TodayDashboard />);
    expect(await findByText('loaded:50000')).toBeTruthy();

    await act(async () => {
      mockFocusListeners.forEach((listener) => listener());
    });

    await waitFor(() => {
      expect(mockClientsList).toHaveBeenCalledTimes(2);
      expect(mockServicesList).toHaveBeenCalledTimes(2);
      expect(mockPaymentsListAll).toHaveBeenCalledTimes(2);
      expect(mockExpensesListAll).toHaveBeenCalledTimes(2);
    });
  });
});
