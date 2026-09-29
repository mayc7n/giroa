import { useState } from 'react';
import { Alert } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';

import type { CashSummary } from '@/application/paymentUseCases';
import CashScreen from '@/features/cash/CashScreen';

const summary: CashSummary = {
  entriesCents: 30000,
  exitsCents: 50000,
  periodBalanceCents: -20000,
  pendingCents: 55000,
  movements: [
    {
      id: 'payment-1',
      date: '2026-09-27',
      description: 'Instalação',
      category: 'pix',
      amountCents: 30000,
      kind: 'entry',
      status: 'active',
    },
    {
      id: 'expense-1',
      date: '2026-09-28',
      description: 'Material',
      category: 'material',
      amountCents: 50000,
      kind: 'exit',
      status: 'active',
    },
    {
      id: 'payment-2',
      date: '2026-09-26',
      description: 'Manutenção',
      category: 'dinheiro',
      amountCents: 10000,
      kind: 'entry',
      status: 'reversed',
    },
  ],
};

describe('cash screen', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('shows active entries, active exits and reversed movements with auditable details', () => {
    const { getByText, getByRole, getAllByText } = render(
      <CashScreen summary={summary} onRegisterExpense={jest.fn()} onReverseMovement={jest.fn()} />,
    );

    expect(getByText('27/09/2026')).toBeTruthy();
    expect(getByText('28/09/2026')).toBeTruthy();
    expect(getByText('Instalação')).toBeTruthy();
    expect(getByText('Material')).toBeTruthy();
    expect(getByText('Entrada · Pix')).toBeTruthy();
    expect(getByText('Saída · Material')).toBeTruthy();
    expect(getByText('+R$ 300,00')).toBeTruthy();
    expect(getByText('-R$ 500,00')).toBeTruthy();
    expect(getAllByText('Ativa')).toHaveLength(2);
    expect(getByText('Estornada')).toBeTruthy();
    expect(getByRole('button', { name: 'Estornar Instalação' })).toBeTruthy();
    expect(getByRole('button', { name: 'Estornar Material' })).toBeTruthy();
  });

  it('does not reverse a movement when the confirmation is cancelled', () => {
    const onReverseMovement = jest.fn();
    const alert = jest.spyOn(Alert, 'alert').mockImplementation((_title, _message, buttons) => {
      buttons?.find((button) => button.text === 'Cancelar')?.onPress?.();
    });

    const { getByRole } = render(
      <CashScreen summary={summary} onRegisterExpense={jest.fn()} onReverseMovement={onReverseMovement} />,
    );

    fireEvent.press(getByRole('button', { name: 'Estornar Instalação' }));

    expect(alert).toHaveBeenCalledWith(
      'Confirmar estorno?',
      expect.stringContaining('O registro continuará no histórico como estornado.'),
      expect.any(Array),
    );
    expect(onReverseMovement).not.toHaveBeenCalled();
  });

  it('reflects the updated summary after a confirmed reversal', async () => {
    const alert = jest.spyOn(Alert, 'alert').mockImplementation((_title, _message, buttons) => {
      buttons?.find((button) => button.text === 'Estornar')?.onPress?.();
    });
    const Wrapper = () => {
      const [currentSummary, setCurrentSummary] = useState<CashSummary>({
        ...summary,
        entriesCents: 30000,
        exitsCents: 0,
        periodBalanceCents: 30000,
        movements: [summary.movements[0]],
      });

      return (
        <CashScreen
          summary={currentSummary}
          onRegisterExpense={jest.fn()}
          onReverseMovement={(movement) => setCurrentSummary({
            ...currentSummary,
            entriesCents: 0,
            periodBalanceCents: 0,
            movements: [{ ...movement, status: 'reversed' }],
          })}
        />
      );
    };

    const { getByRole, getByText } = render(<Wrapper />);
    fireEvent.press(getByRole('button', { name: 'Estornar Instalação' }));

    expect(alert).toHaveBeenCalled();
    expect(getByText('Estornada')).toBeTruthy();
    expect(getByText('R$ 0,00')).toBeTruthy();
  });
});
