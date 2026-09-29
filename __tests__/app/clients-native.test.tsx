import { act, fireEvent, render, waitFor } from '@testing-library/react-native';

import ClientsScreen from '@/app/(tabs)/clientes.native';

const mockFocusListeners = new Set<() => void>();
const mockClientsList = jest.fn(async () => [
  { id: 'client-1', name: 'Ana Souza', contact: '111' },
  { id: 'client-2', name: 'Carlos Lima', contact: '222' },
]);
const mockClientGetById = jest.fn(async () => ({
  id: 'client-1',
  name: 'Ana Souza',
  normalizedName: 'ana souza',
  contact: '111',
  createdAt: '2026-09-01T12:00:00.000Z',
  updatedAt: '2026-09-01T12:00:00.000Z',
}));
const mockUpdateClient = jest.fn(async (input) => ({
  ...await mockClientGetById(),
  ...input,
}));
const mockQuoteListByClientId = jest.fn(async () => []);
const mockServiceListByClientId = jest.fn(async () => []);
const mockPaymentListByServiceId = jest.fn(async () => []);
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
    clients: {
      create: jest.fn(),
      update: mockUpdateClient,
      list: mockClientsList,
      getById: mockClientGetById,
    },
    quotes: {
      listByClientId: mockQuoteListByClientId,
    },
    services: {
      listByClientId: mockServiceListByClientId,
    },
    payments: {
      listByServiceId: mockPaymentListByServiceId,
    },
    expenses: {},
  }),
}));

describe('native clients route', () => {
  afterEach(() => {
    mockFocusListeners.clear();
    jest.clearAllMocks();
  });

  it('opens a client detail and safely edits name and contact', async () => {
    const { findByRole, findByText, getByDisplayValue, getByLabelText, getByRole } = render(<ClientsScreen />);

    fireEvent.press(await findByRole('button', { name: 'Ana Souza' }));
    expect(await findByText('Histórico de recebimentos')).toBeTruthy();

    fireEvent.press(getByRole('button', { name: 'Editar cliente' }));
    expect(getByDisplayValue('Ana Souza')).toBeTruthy();
    fireEvent.changeText(getByLabelText('Nome do cliente'), 'Ana Lima');
    fireEvent.press(getByRole('button', { name: 'Salvar alterações' }));

    await waitFor(() => expect(mockUpdateClient).toHaveBeenCalledWith(expect.objectContaining({
      id: 'client-1',
      name: 'Ana Lima',
      normalizedName: 'ana lima',
      contact: '111',
    })));
  });

  it('reloads the client list when the tab receives focus again', async () => {
    const { findByRole } = render(<ClientsScreen />);
    expect(await findByRole('button', { name: 'Ana Souza' })).toBeTruthy();

    await act(async () => {
      mockFocusListeners.forEach((listener) => listener());
    });

    await waitFor(() => expect(mockClientsList).toHaveBeenCalledTimes(2));
  });

  it('filters the local list by the search field without changing stored records', async () => {
    const { findByRole, getByLabelText, queryByRole } = render(<ClientsScreen />);
    expect(await findByRole('button', { name: 'Ana Souza' })).toBeTruthy();
    expect(await findByRole('button', { name: 'Carlos Lima' })).toBeTruthy();

    fireEvent.changeText(getByLabelText('Buscar cliente'), 'Carlos');

    expect(queryByRole('button', { name: 'Ana Souza' })).toBeNull();
    expect(queryByRole('button', { name: 'Carlos Lima' })).toBeTruthy();
  });

  it('shows a recoverable error when the local client list fails', async () => {
    mockClientsList.mockRejectedValueOnce(new Error('storage failure'));
    const { findByRole, getByRole } = render(<ClientsScreen />);

    expect(await findByRole('alert')).toBeTruthy();
    expect(getByRole('button', { name: 'Tentar novamente' })).toBeTruthy();
  });
});
