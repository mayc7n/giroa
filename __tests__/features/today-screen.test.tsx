import { fireEvent, render } from '@testing-library/react-native';

import type { TodaySummary } from '@/application/todayUseCases';
import TodayScreen from '@/features/today/TodayScreen';

const emptySummary: TodaySummary = {
  clientsCount: 0,
  serviceCount: 0,
  entriesCents: 0,
  exitsCents: 0,
  periodBalanceCents: 0,
  pendingCents: 0,
  pendingServices: [],
};

const summaryWithPending: TodaySummary = {
  ...emptySummary,
  clientsCount: 1,
  serviceCount: 1,
  entriesCents: 30000,
  exitsCents: 10000,
  periodBalanceCents: 20000,
  pendingCents: 70000,
  pendingServices: [
    {
      service: {
        id: 'service-1',
        clientId: 'client-1',
        quoteId: 'quote-1',
        description: 'Instalação elétrica',
        totalCents: 100000,
        workStatus: 'inProgress',
        createdAt: '2026-09-20T12:00:00.000Z',
        updatedAt: '2026-09-27T12:00:00.000Z',
      },
      clientName: 'Ana Souza',
      balanceCents: 70000,
    },
  ],
};

describe('TodayScreen', () => {
  it('apresenta a marca Giroa no cabeçalho de Hoje', () => {
    const { getByRole, getByText } = render(<TodayScreen />);

    expect(getByRole('image', { name: 'Giroa' })).toBeTruthy();
    expect(getByText('giroa')).toBeTruthy();
  });

  it('offers the first client action when the local workspace is empty', () => {
    const onOpenClients = jest.fn();
    const { getByText } = render(
      <TodayScreen summary={emptySummary} onOpenClients={onOpenClients} />,
    );

    expect(getByText('Comece pelo primeiro cliente.')).toBeTruthy();
    fireEvent.press(getByText('Cadastrar cliente'));
    expect(onOpenClients).toHaveBeenCalledTimes(1);
  });

  it('shows financial attention and opens the services list', () => {
    const onOpenServices = jest.fn();
    const { getAllByText, getByText } = render(
      <TodayScreen summary={summaryWithPending} onOpenServices={onOpenServices} />,
    );

    expect(getAllByText('R$ 700,00')).toHaveLength(2);
    expect(getByText('Precisa de atenção')).toBeTruthy();
    expect(getByText('Instalação elétrica')).toBeTruthy();
    expect(getByText('Ana Souza')).toBeTruthy();
    fireEvent.press(getByText('Ver serviços pendentes'));
    expect(onOpenServices).toHaveBeenCalledTimes(1);
  });
});
