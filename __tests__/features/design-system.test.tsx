import { fireEvent, render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import ClientForm from '@/features/clients/ClientForm';
import QuoteForm from '@/features/quotes/QuoteForm';
import { colors, dimensions } from '@/ui/tokens';

describe('Giroa interaction tokens', () => {
  it('exposes placeholder, focus and disabled states on client fields', () => {
    const { getByLabelText } = render(<ClientForm onSubmit={jest.fn()} />);
    const input = getByLabelText('Nome do cliente');

    expect(input.props.placeholderTextColor).toBe(colors.content.muted);
    fireEvent(input, 'focus');
    expect(StyleSheet.flatten(input.props.style)).toMatchObject({
      borderColor: colors.interactive.accent,
      borderWidth: 2,
    });

    const disabledRender = render(<ClientForm onSubmit={jest.fn()} submitting />);
    const disabledButton = disabledRender.getByRole('button', { name: 'Salvando…' });
    expect(disabledButton.props.accessibilityState.disabled).toBe(true);
    const disabledStyle = typeof disabledButton.props.style === 'function'
      ? disabledButton.props.style({ pressed: false })
      : disabledButton.props.style;
    expect(StyleSheet.flatten(disabledStyle)).toMatchObject({
      backgroundColor: colors.background.surface,
    });
  });

  it('renders client choices as tokenized flat rows', () => {
    const { getByRole } = render(
      <QuoteForm
        clients={[{ id: 'client-1', name: 'Ana Souza', contact: '111' }]}
        onSubmit={jest.fn()}
      />,
    );

    const clientChoice = getByRole('button', { name: /Ana Souza/ });
    expect(StyleSheet.flatten(clientChoice.props.style)).toMatchObject({
      minHeight: dimensions.row,
      borderBottomWidth: 1,
    });
  });
});
