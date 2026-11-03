/**
 * PEÇAS COMPARTILHADAS DAS TELAS
 * Screen: organiza a área segura e a rolagem. Button: botão padrão do app.
 * styles: aparência compartilhada por perfil, divisão semanal e outras telas.
 * Mudanças aqui podem afetar várias telas ao mesmo tempo.
 * Guia de localização: docs/onde-mexer-no-codigo.md
 */

import { workoutColors } from '@/constants/cores-app';
import type { PropsWithChildren } from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ESTRUTURA DA TELA: children representa os elementos colocados dentro de <Screen>.
export function Screen({ children, keyboardShouldPersistTaps = 'never' }: PropsWithChildren<{
  keyboardShouldPersistTaps?: 'never' | 'always' | 'handled';
}>) {
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps={keyboardShouldPersistTaps}>{children}</ScrollView>
    </SafeAreaView>
  );
}

// BOTÃO REUTILIZÁVEL: label é o texto; onPress é a ação; secondary escolhe o estilo discreto.
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

// APARÊNCIA COMPARTILHADA: não altere aqui se quiser mudar somente uma tela.
export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: workoutColors.background },
  content: { flexGrow: 1, width: '100%', maxWidth: 600, alignSelf: 'center', padding: 24, gap: 24 },
  brand: { color: workoutColors.text, fontSize: 26, fontWeight: '800', marginBottom: 20 },
  accent: { color: workoutColors.accent },
  intro: { gap: 14, marginBottom: 12 },
  eyebrow: { color: workoutColors.accent, fontSize: 11, fontWeight: '700', letterSpacing: 2 },
  hero: { color: workoutColors.text, fontSize: 34, fontWeight: '800', letterSpacing: -1 },
  description: { color: workoutColors.textSecondary, fontSize: 15, lineHeight: 23 },
  sectionTitle: { color: workoutColors.text, fontSize: 21, fontWeight: '700' },
  card: { backgroundColor: workoutColors.surface, borderRadius: 24, borderWidth: 1, borderColor: workoutColors.border, padding: 24, gap: 18 },
  title: { color: workoutColors.text, fontSize: 26, fontWeight: '700' },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 32, paddingVertical: 16, borderTopWidth: 1, borderTopColor: workoutColors.border },
  statValue: { color: workoutColors.accent, fontSize: 26, fontWeight: '700' },
  button: { minHeight: 56, borderRadius: 16, backgroundColor: workoutColors.accent, padding: 16, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: workoutColors.onAccent, fontSize: 16, fontWeight: '800', textAlign: 'center' },
  secondaryButton: { backgroundColor: workoutColors.surfaceRaised, borderWidth: 1, borderColor: workoutColors.border },
  pressed: { opacity: 0.7 },
  note: { borderLeftWidth: 3, borderLeftColor: workoutColors.accent, paddingLeft: 16, gap: 8 },
  footer: { color: workoutColors.textSecondary, fontSize: 12, textAlign: 'center', marginTop: 'auto', paddingTop: 16 },
  exerciseCard: { backgroundColor: workoutColors.surface, borderRadius: 20, padding: 20, flexDirection: 'row', alignItems: 'center', gap: 16, borderWidth: 1, borderColor: workoutColors.border },
  exerciseNumber: { color: workoutColors.accent, fontSize: 24, fontWeight: '800' },
  exerciseDetails: { flex: 1, gap: 8 },
  exerciseName: { color: workoutColors.text, fontSize: 18, fontWeight: '700' },
});
