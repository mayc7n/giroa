import { render } from '@testing-library/react-native';

import type { ServiceRecord } from '@/data/sqliteTypes';
import ServiceList from '@/features/services/ServiceList';

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

describe('service list', () => {
  it('shows saved services and the action to create another quote', () => {
    const { getByText, getByRole } = render(
      <ServiceList
        services={[{ service, clientName: 'Ana Souza' }]}
        onSelect={jest.fn()}
        onCreateQuote={jest.fn()}
      />,
    );

    expect(getByText('Serviços')).toBeTruthy();
    expect(getByText('Instalação')).toBeTruthy();
    expect(getByText('Ana Souza')).toBeTruthy();
    expect(getByText('Total R$ 850,00')).toBeTruthy();
    expect(getByRole('button', { name: 'Novo orçamento' })).toBeTruthy();
  });
});
