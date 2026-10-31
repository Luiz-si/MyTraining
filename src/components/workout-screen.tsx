import type { PropsWithChildren } from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function Screen({ children, keyboardShouldPersistTaps = 'never' }: PropsWithChildren<{
  keyboardShouldPersistTaps?: 'never' | 'always' | 'handled';
}>) {
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps={keyboardShouldPersistTaps}>{children}</ScrollView>
    </SafeAreaView>
  );
}

export function Button({ label, onPress, secondary = false }: {
  label: string;
  onPress: () => void;
  secondary?: boolean;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress}
      style={({ pressed }) => [styles.button, secondary && styles.secondaryButton, pressed && styles.pressed]}>
      <Text style={[styles.buttonText, secondary && styles.accent]}>{label}</Text>
    </Pressable>
  );
}

export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0C100F' },
  content: { flexGrow: 1, width: '100%', maxWidth: 600, alignSelf: 'center', padding: 24, gap: 24 },
  brand: { color: '#F4F7F3', fontSize: 26, fontWeight: '800', marginBottom: 20 },
  accent: { color: '#B0F36D' },
  intro: { gap: 14, marginBottom: 12 },
  eyebrow: { color: '#B0F36D', fontSize: 11, fontWeight: '700', letterSpacing: 2 },
  hero: { color: '#F4F7F3', fontSize: 34, fontWeight: '800', letterSpacing: -1 },
  description: { color: '#A8B3AB', fontSize: 15, lineHeight: 23 },
  sectionTitle: { color: '#F4F7F3', fontSize: 21, fontWeight: '700' },
  card: { backgroundColor: '#171F1B', borderRadius: 24, borderWidth: 1, borderColor: '#2D3B31', padding: 24, gap: 18 },
  title: { color: '#F4F7F3', fontSize: 26, fontWeight: '700' },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 32, paddingVertical: 16, borderTopWidth: 1, borderTopColor: '#2D3B31' },
  statValue: { color: '#B0F36D', fontSize: 26, fontWeight: '700' },
  button: { minHeight: 56, borderRadius: 16, backgroundColor: '#B0F36D', padding: 16, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: '#12200B', fontSize: 16, fontWeight: '800', textAlign: 'center' },
  secondaryButton: { backgroundColor: '#1B2520', borderWidth: 1, borderColor: '#34473A' },
  pressed: { opacity: 0.7 },
  note: { borderLeftWidth: 3, borderLeftColor: '#B0F36D', paddingLeft: 16, gap: 8 },
  footer: { color: '#A8B3AB', fontSize: 12, textAlign: 'center', marginTop: 'auto', paddingTop: 16 },
  exerciseCard: { backgroundColor: '#171F1B', borderRadius: 20, padding: 20, flexDirection: 'row', alignItems: 'center', gap: 16, borderWidth: 1, borderColor: '#2D3B31' },
  exerciseNumber: { color: '#B0F36D', fontSize: 24, fontWeight: '800' },
  exerciseDetails: { flex: 1, gap: 8 },
  exerciseName: { color: '#F4F7F3', fontSize: 18, fontWeight: '700' },
});
