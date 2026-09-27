import { StyleSheet, Text, type TextStyle } from 'react-native';

import { formatCentsToBRL } from '@/domain/money';

type MoneyTextProps = {
  label: string;
  cents: number;
  style?: TextStyle;
};

export default function MoneyText({ label, cents, style }: MoneyTextProps) {
  return <Text style={[styles.text, style]}>{label} {formatCentsToBRL(cents)}</Text>;
}

const styles = StyleSheet.create({
  text: { color: '#173C35', fontSize: 20, fontWeight: '800' },
});
