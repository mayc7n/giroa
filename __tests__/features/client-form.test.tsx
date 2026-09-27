import { fireEvent, render } from '@testing-library/react-native';

import ClientForm from '@/features/clients/ClientForm';
import ClientList from '@/features/clients/ClientList';

describe('client UI', () => {
  it('shows an accessible error when the name is missing', () => {
    const { getByRole, getByText } = render(<ClientForm onSubmit={jest.fn()} />);

    fireEvent.press(getByRole('button', { name: 'Salvar cliente' }));

    expect(getByText('Informe o nome do cliente.')).toBeTruthy();
  });

  it('shows empty state and explicit homonym candidates with contact', () => {
    const { getByText } = render(
      <ClientList
        clients={[]}
        onRegister={jest.fn()}
        selection={{
          kind: 'requiresChoice',
          clients: [
            { id: 'client-1', name: 'Ana Souza', contact: '111' },
            { id: 'client-2', name: 'Ana Souza', contact: '222' },
          ],
        }}
        onSelectClient={jest.fn()}
      />,
    );

    expect(getByText('Nenhum cliente cadastrado.')).toBeTruthy();
    expect(getByText('Escolha o cliente correto')).toBeTruthy();
    expect(getByText('111')).toBeTruthy();
    expect(getByText('222')).toBeTruthy();
  });
});
