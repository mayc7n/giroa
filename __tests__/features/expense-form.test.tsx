import { fireEvent, render, waitFor } from '@testing-library/react-native';

import ExpenseForm from '@/features/expenses/ExpenseForm';

describe('expense form', () => {
  it('asks for the required exit data', () => {
    const { getByLabelText, getByRole } = render(<ExpenseForm onSubmit={jest.fn()} />);

    expect(getByLabelText('Descrição da saída')).toBeTruthy();
    expect(getByLabelText('Valor da saída')).toBeTruthy();
    expect(getByLabelText('Data da saída')).toBeTruthy();
    expect(getByRole('button', { name: 'Registrar saída' })).toBeTruthy();
    expect(getByRole('button', { name: 'Material' })).toBeTruthy();
  });

  it('submits a material exit when the amount uses a decimal point', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    const { getByLabelText, getByRole } = render(<ExpenseForm onSubmit={onSubmit} />);

    fireEvent.changeText(getByLabelText('Descrição da saída'), 'Compra de material');
    fireEvent.changeText(getByLabelText('Valor da saída'), '850.00');
    fireEvent.press(getByRole('button', { name: 'Material' }));
    fireEvent.press(getByRole('button', { name: 'Registrar saída' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
      description: 'Compra de material',
      amountCents: 85000,
      category: 'material',
    })));
  });
});
