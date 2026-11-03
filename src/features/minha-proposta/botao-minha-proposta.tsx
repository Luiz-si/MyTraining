/**
 * BOTÃO MINHA PROPOSTA NO PERFIL
 * Edite aqui: altura, borda, fundo, seta e comportamento ao tocar.
 * O texto do botão vem de data/conteudo-minha-proposta.ts.
 * Ao tocar, abre a rota /sobre-meutreino.
 * Guia de localização: docs/onde-mexer-no-codigo.md
 */

import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { workoutColors as colors } from '@/constants/cores-app';
import { aboutMeuTreino } from '@/data/conteudo-minha-proposta';

export function AboutEntry() {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityHint={aboutMeuTreino.access.hint}
      onPress={() => router.push('/sobre-meutreino')}
      style={({ pressed }) => [local.button, pressed && local.pressed]}
    >
      <View style={local.copy}>
        <Text style={local.title}>{aboutMeuTreino.access.title}</Text>
      </View>
      <Text accessible={false} style={local.arrow}>↗</Text>
    </Pressable>
  ); 
}

const local = StyleSheet.create({
  button: { minHeight: 40, borderRadius: 10, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.selected, padding: 8, flexDirection: 'row', alignItems: 'center', gap: 12 },
  copy: { flex: 1, gap: 5 },
  title: { color: colors.accent, fontSize: 15, fontWeight: '700' },
  arrow: { color: colors.accent, fontSize: 24 },
  pressed: { opacity: 0.8, transform: [{ scale: 0.985 }] },
});
