import { render } from '@testing-library/react-native';

jest.mock('expo-sqlite', () => {
  const database = {};
  return {
    useSQLiteContext: () => database,
  };
});

jest.mock('@/data/database', () => ({
  createSqliteRepositories: () => ({
    clients: {
      list: async () => [{ id: 'client-1', name: 'Ana Souza' }],
    },
    services: {
      list: async () => [{
        id: 'service-1',
        clientId: 'client-1',
        quoteId: 'quote-1',
        description: 'Instalação',
        totalCents: 50000,
        workStatus: 'planned',
        createdAt: '2026-09-20T12:00:00.000Z',
        updatedAt: '2026-09-27T12:00:00.000Z',
      }],
    },
    payments: { listAll: async () => [] },
    expenses: { listAll: async () => [] },
  }),
}));

jest.mock('@/features/today/TodayScreen', () => {
  const React = require('react');
  const { Text: MockText } = require('react-native');

  return function MockTodayScreen({ summary, isLoading }: { summary: { pendingCents: number } | null; isLoading: boolean }) {
    return React.createElement(MockText, null, summary ? `loaded:${summary.pendingCents}` : isLoading ? 'loading' : 'empty');
  };
});

import TodayDashboard from '@/features/today/TodayDashboard';

describe('TodayDashboard', () => {
  it('loads local records and passes the summary to the screen', async () => {
    const { findByText } = render(<TodayDashboard />);

    expect(await findByText('loaded:50000')).toBeTruthy();
  });
});
