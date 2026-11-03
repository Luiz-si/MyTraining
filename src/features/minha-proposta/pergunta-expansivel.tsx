/**
 * PERGUNTA QUE ABRE E FECHA UMA RESPOSTA
 * Edite aqui: botão da pergunta, seta e animação de expansão.
 * Os enunciados e as respostas vêm de data/conteudo-minha-proposta.ts.
 * Guia de localização: docs/onde-mexer-no-codigo.md
 */

import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition, ReduceMotion, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { workoutColors as colors } from '@/constants/cores-app';
import type { AboutGuideItem } from '@/data/conteudo-minha-proposta';

const layout = LinearTransition.duration(180).reduceMotion(ReduceMotion.System);
const enter = FadeIn.duration(180).reduceMotion(ReduceMotion.System);
const exit = FadeOut.duration(120).reduceMotion(ReduceMotion.System);

export function AboutAccordion({ item }: { item: AboutGuideItem }) {
  const [open, setOpen] = useState(false);
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withTiming(open ? 1 : 0, { duration: 180, reduceMotion: ReduceMotion.System });
  }, [open, progress]);
  const arrowStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${progress.value * 180}deg` }] }));

  return (
    <Animated.View layout={layout} style={local.card}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen((value) => !value)}
        style={({ pressed }) => [local.heading, pressed && local.pressed]}
      >
        <Text style={local.title}>{item.title}</Text>
        <Animated.Text accessible={false} style={[local.arrow, arrowStyle]}>⌄</Animated.Text>
      </Pressable>
      {open && (
        <Animated.View entering={enter} exiting={exit} style={local.answer}>
          <View style={local.rule} />
          <Text style={local.text}>{item.text}</Text>
        </Animated.View>
      )}
    </Animated.View>
  );
}

const local = StyleSheet.create({
  card: { borderWidth: 1, borderColor: colors.border, borderRadius: 18, backgroundColor: colors.surface, overflow: 'hidden' },
  heading: { minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 16, padding: 18 },
  title: { flex: 1, color: colors.text, fontSize: 15, fontWeight: '600', lineHeight: 23 },
  arrow: { color: colors.accent, fontSize: 24, lineHeight: 28 },
  pressed: { opacity: 0.75 },
  answer: { paddingHorizontal: 18, paddingBottom: 20, gap: 16 },
  rule: { height: 1, backgroundColor: colors.border },
  text: { color: colors.textSecondary, fontSize: 14, lineHeight: 24 },
});
