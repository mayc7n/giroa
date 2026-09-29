import { fireEvent, render } from '@testing-library/react-native';

import type { ClientDetails } from '@/application/clientUseCases';
import ClientDetail from '@/features/clients/ClientDetail';

const details: ClientDetails = {
  client: {
    id: 'client-1',
    name: 'Ana Souza',
    normalizedName: 'ana souza',
    contact: '11999990000',
    createdAt: '2026-09-01T12:00:00.000Z',
    updatedAt: '2026-09-01T12:00:00.000Z',
  },
  quotes: [{
    id: 'quote-1',
    clientId: 'client-1',
    description: 'Instalação elétrica',
    discountCents: 0,
    validUntil: null,
    status: 'approved',
    totalCents: 50000,
    items: [],
    createdAt: '2026-09-02T12:00:00.000Z',
    updatedAt: '2026-09-02T12:00:00.000Z',
  }],
  services: [{
    id: 'service-1',
    clientId: 'client-1',
    quoteId: 'quote-1',
    description: 'Instalação elétrica',
    totalCents: 50000,
    workStatus: 'planned',
    createdAt: '2026-09-03T12:00:00.000Z',
    updatedAt: '2026-09-03T12:00:00.000Z',
  }],
  payments: [{
    id: 'payment-1',
    serviceId: 'service-1',
    amountCents: 30000,
    paymentDate: '2026-09-04',
    method: 'pix',
    clientOperationId: 'operation-1',
    status: 'active',
    createdAt: '2026-09-04T12:00:00.000Z',
    reversedAt: null,
  }],
};

describe('client detail', () => {
  it('shows identity and related quote, service and payment history', () => {
    const onEdit = jest.fn();
    const { getByRole, getByText } = render(
      <ClientDetail details={details} onEdit={onEdit} />,
    );

    expect(getByText('Ana Souza')).toBeTruthy();
    expect(getByText('11999990000')).toBeTruthy();
    expect(getByText('Histórico de orçamentos')).toBeTruthy();
    expect(getByText('Aprovado')).toBeTruthy();
    expect(getByText('Histórico de serviços')).toBeTruthy();
    expect(getByText('Planejado')).toBeTruthy();
    expect(getByText('Histórico de recebimentos')).toBeTruthy();
    expect(getByText('R$ 300,00')).toBeTruthy();

    fireEvent.press(getByRole('button', { name: 'Editar cliente' }));
    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it('shows explicit empty states when the client has no related records', () => {
    const emptyDetails: ClientDetails = { ...details, quotes: [], services: [], payments: [] };
    const { getByText } = render(<ClientDetail details={emptyDetails} onEdit={jest.fn()} />);

    expect(getByText('Nenhum orçamento relacionado.')).toBeTruthy();
    expect(getByText('Nenhum serviço relacionado.')).toBeTruthy();
    expect(getByText('Nenhum recebimento relacionado.')).toBeTruthy();
  });
});
