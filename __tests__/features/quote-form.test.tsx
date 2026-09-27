import { render } from '@testing-library/react-native';

import QuoteDetail from '@/features/quotes/QuoteDetail';
import type { QuoteRecord } from '@/data/sqliteTypes';

describe('quote UI', () => {
  it('renders the total in Brazilian reais and offers manual approval', () => {
    const quote: QuoteRecord = {
      id: 'quote-1',
      clientId: 'client-1',
      description: 'Instalação',
      discountCents: 0,
      validUntil: null,
      status: 'draft',
      totalCents: 85000,
      items: [],
      createdAt: '2026-09-27T12:00:00.000Z',
      updatedAt: '2026-09-27T12:00:00.000Z',
    };

    const { getByText, getByRole } = render(<QuoteDetail quote={quote} onApprove={jest.fn()} />);

    expect(getByText('Total R$ 850,00')).toBeTruthy();
    expect(getByText('Rascunho')).toBeTruthy();
    expect(getByRole('button', { name: 'Aprovar orçamento' })).toBeTruthy();
  });
});
