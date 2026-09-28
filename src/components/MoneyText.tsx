import { StyleSheet, Text, type TextStyle } from 'react-native';

import { formatCentsToBRL } from '@/domain/money';
import { colors, typeScale } from '@/ui/tokens';

type MoneyTextProps = {
  label: string;
  cents: number;
  style?: TextStyle;
};

export default function MoneyText({ label, cents, style }: MoneyTextProps) {
  return <Text style={[styles.text, style]}>{label} {formatCentsToBRL(cents)}</Text>;
}

const styles = StyleSheet.create({
  text: { ...typeScale.money, color: colors.content.primary },
});
