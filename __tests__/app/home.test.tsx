import { render } from '@testing-library/react-native';

import HomeScreen from '@/app/index';

describe('Hoje', () => {
  it('mostra o estado vazio inicial', () => {
    const { getByText } = render(<HomeScreen />);

    expect(getByText('Hoje')).toBeTruthy();
    expect(getByText('Nada pendente por enquanto.')).toBeTruthy();
  });
});
