import { render } from '@testing-library/react-native';

import ExpenseForm from '@/features/expenses/ExpenseForm';

describe('expense form', () => {
  it('asks for the required exit data', () => {
    const { getByLabelText, getByRole } = render(<ExpenseForm onSubmit={jest.fn()} />);

    expect(getByLabelText('Descrição da saída')).toBeTruthy();
    expect(getByLabelText('Valor da saída')).toBeTruthy();
    expect(getByLabelText('Data da saída')).toBeTruthy();
    expect(getByRole('button', { name: 'Registrar saída' })).toBeTruthy();
  });
});
