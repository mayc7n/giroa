import { act, render, waitFor } from '@testing-library/react-native';

import ServicesScreen from '@/app/(tabs)/servicos.native';

const mockFocusListeners = new Set<() => void>();
const mockClientsList = jest.fn(async () => [{ id: 'client-1', name: 'Ana Souza', contact: null }]);
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
const mockDatabase = {};

jest.mock('expo-router', () => {
  const React = require('react');

  return {
    router: { push: jest.fn() },
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
    clients: { list: mockClientsList },
    services: { list: mockServicesList },
    quotes: {},
    payments: {},
  }),
}));

jest.mock('@/application/quoteUseCases', () => ({
  createQuoteUseCases: () => ({
    create: jest.fn(),
    approve: jest.fn(),
  }),
}));

jest.mock('@/application/serviceUseCases', () => ({
  createServiceUseCases: () => ({
    createFromApprovedQuote: jest.fn(),
  }),
}));

jest.mock('@/application/paymentUseCases', () => ({
  createPaymentUseCases: () => ({
    getServiceFinancialSummary: jest.fn(),
    register: jest.fn(),
  }),
}));

jest.mock('@/features/services/ServiceList', () => {
  const React = require('react');
  const { Text } = require('react-native');

  return function MockServiceList() {
    return React.createElement(Text, null, 'services-loaded');
  };
});

describe('native services focus refresh', () => {
  afterEach(() => {
    mockFocusListeners.clear();
    jest.clearAllMocks();
  });

  it('reloads clients and services when the tab receives focus again', async () => {
    const { findByText } = render(<ServicesScreen />);
    expect(await findByText('services-loaded')).toBeTruthy();

    await act(async () => {
      mockFocusListeners.forEach((listener) => listener());
    });

    await waitFor(() => {
      expect(mockClientsList).toHaveBeenCalledTimes(2);
      expect(mockServicesList).toHaveBeenCalledTimes(2);
    });
  });
});
