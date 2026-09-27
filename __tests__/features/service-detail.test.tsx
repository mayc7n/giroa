import { render } from '@testing-library/react-native';

import type { ServiceRecord } from '@/data/sqliteTypes';
import ServiceDetail from '@/features/services/ServiceDetail';

const service: ServiceRecord = {
  id: 'service-1',
  clientId: 'client-1',
  quoteId: 'quote-1',
  description: 'Instalação',
  totalCents: 85000,
  workStatus: 'planned',
  createdAt: '2026-09-27T12:00:00.000Z',
  updatedAt: '2026-09-27T12:00:00.000Z',
};

describe('service detail', () => {
  it('shows total, received and pending balance without misleading labels', () => {
    const { getByText, queryByText } = render(
      <ServiceDetail
        service={service}
        summary={{ totalCents: 85000, receivedCents: 30000, balanceCents: 55000 }}
        onRegisterPayment={jest.fn()}
      />,
    );

    expect(getByText('Total R$ 850,00')).toBeTruthy();
    expect(getByText('Recebido R$ 300,00')).toBeTruthy();
    expect(getByText('Saldo a receber R$ 550,00')).toBeTruthy();
    expect(queryByText(/lucro líquido|saldo bancário/i)).toBeNull();
  });
});
