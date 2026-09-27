import { render } from '@testing-library/react-native';

import PaymentForm from '@/features/payments/PaymentForm';

describe('payment form', () => {
  it('shows the current pending balance before registering a payment', () => {
    const { getByText, getByLabelText, getByRole } = render(
      <PaymentForm balanceCents={55000} onSubmit={jest.fn()} />,
    );

    expect(getByText('Saldo a receber R$ 550,00')).toBeTruthy();
    expect(getByLabelText('Valor recebido')).toBeTruthy();
    expect(getByRole('button', { name: 'Registrar recebimento' })).toBeTruthy();
  });
});
