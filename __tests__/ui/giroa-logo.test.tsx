import { render } from '@testing-library/react-native';

import GiroaLogo from '@/ui/GiroaLogo';

describe('GiroaLogo', () => {
  it('apresenta a marca acessível com símbolo e wordmark por padrão', () => {
    const { getByRole, getByText } = render(<GiroaLogo />);

    expect(getByRole('image', { name: 'Giroa' })).toBeTruthy();
    expect(getByText('giroa')).toBeTruthy();
  });

  it('mantém o símbolo acessível quando o wordmark é ocultado', () => {
    const { getByRole, queryByText } = render(<GiroaLogo showWordmark={false} />);

    expect(getByRole('image', { name: 'Giroa' })).toBeTruthy();
    expect(queryByText('giroa')).toBeNull();
  });
});
