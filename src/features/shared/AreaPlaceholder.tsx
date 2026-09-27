import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type AreaPlaceholderProps = {
  title: string;
  description: string;
};

export default function AreaPlaceholder({ title, description }: AreaPlaceholderProps) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F5F0',
  },
  content: {
    flex: 1,
    padding: 24,
    gap: 12,
  },
  title: {
    color: '#17211F',
    fontSize: 30,
    fontWeight: '800',
  },
  description: {
    color: '#4A5753',
    fontSize: 17,
    lineHeight: 24,
  },
});
