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

  it('shows loading, local search and no-result states in the client list', () => {
    const onSearchChange = jest.fn();
    const loading = render(
      <ClientList
        clients={[]}
        isLoading
        onRegister={jest.fn()}
        onSearchChange={onSearchChange}
        onSelectClient={jest.fn()}
        searchQuery=""
      />,
    );

    expect(loading.getByText('Carregando clientes…')).toBeTruthy();
    fireEvent.changeText(loading.getByLabelText('Buscar cliente'), 'Carlos');
    expect(onSearchChange).toHaveBeenCalledWith('Carlos');

    const noResults = render(
      <ClientList
        clients={[]}
        onRegister={jest.fn()}
        onSearchChange={onSearchChange}
        onSelectClient={jest.fn()}
        searchQuery="Carlos"
      />,
    );

    expect(noResults.getByText('Nenhum cliente encontrado para essa busca.')).toBeTruthy();
  });

  it('exposes each client row as an explicit detail action', () => {
    const onSelectClient = jest.fn();
    const client = { id: 'client-1', name: 'Ana Souza', contact: '111' };
    const { getByRole } = render(
      <ClientList
        clients={[client]}
        onRegister={jest.fn()}
        onSelectClient={onSelectClient}
      />,
    );

    fireEvent.press(getByRole('button', { name: 'Ana Souza' }));
    expect(onSelectClient).toHaveBeenCalledWith(client);
  });

  it('prefills editable client data and exposes an edit action label', () => {
    const { getByDisplayValue, getByRole, getByText } = render(
      <ClientForm
        initialContact="111"
        initialName="Ana Souza"
        onSubmit={jest.fn()}
        submitLabel="Salvar alterações"
        title="Editar cliente"
      />,
    );

    expect(getByText('Editar cliente')).toBeTruthy();
    expect(getByDisplayValue('Ana Souza')).toBeTruthy();
    expect(getByDisplayValue('111')).toBeTruthy();
    expect(getByRole('button', { name: 'Salvar alterações' })).toBeTruthy();
  });
});
