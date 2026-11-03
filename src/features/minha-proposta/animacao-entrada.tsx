/**
 * ANIMAÇÃO DOS BLOCOS DA PÁGINA MINHA PROPOSTA
 * Controla a entrada suave das seções quando são montadas pela lista.
 * Não contém os textos nem as fotos da página.
 * Guia de localização: docs/onde-mexer-no-codigo.md
 */

import type { PropsWithChildren } from 'react';
import Animated, { FadeInDown, ReduceMotion } from 'react-native-reanimated';

const entrance = FadeInDown.duration(280).reduceMotion(ReduceMotion.System);

// FlatList monta os blocos progressivamente durante a rolagem.
export function AboutReveal({ children }: PropsWithChildren) {
  return <Animated.View entering={entrance}>{children}</Animated.View>;
}
