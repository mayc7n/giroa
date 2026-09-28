import { fireEvent, render } from '@testing-library/react-native';

import AreaPlaceholder from '@/features/shared/AreaPlaceholder';

describe('estado vazio de área', () => {
  it('pode oferecer uma ação para continuar o fluxo', () => {
    const onAction = jest.fn();
    const { getByRole } = render(
      <AreaPlaceholder
        title="Serviços"
        description="Cadastre um cliente antes de criar um orçamento."
        actionLabel="Ir para Clientes"
        onAction={onAction}
      />,
    );

    fireEvent.press(getByRole('button', { name: 'Ir para Clientes' }));

    expect(onAction).toHaveBeenCalledTimes(1);
  });
});
