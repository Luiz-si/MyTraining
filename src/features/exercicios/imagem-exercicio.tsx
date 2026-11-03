/**
 * IMAGEM EXIBIDA NO CARTÃO DO EXERCÍCIO
 * Edite aqui: tamanho, cantos e aparência quando a imagem está ausente.
 * Recebe a imagem escolhida; não realiza a pesquisa da biblioteca.
 * Guia de localização: docs/onde-mexer-no-codigo.md
 */

import { workoutColors } from '@/constants/cores-app';
import { useState } from 'react';
import { Image, StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';

// A chave no cartão reinicia o fallback quando a imagem associada é alterada.
export function ExerciseImage({ source, small = false }: { source?: ImageSourcePropType; small?: boolean }) {
  const [failed, setFailed] = useState(false);
  const size = small ? 80 : 88;
  return source && !failed ? (
    <Image source={source} resizeMode="contain" style={[local.image, { width: size, height: size }]}
      onError={() => setFailed(true)} />
  ) : <View style={[local.image, local.placeholder, { width: size, height: size }]}>
    <Text style={local.icon} accessibilityLabel="Exercício sem imagem disponível">▧</Text>
  </View>;
}

const local = StyleSheet.create({
  image: { borderRadius: 12, backgroundColor: workoutColors.selected },
  placeholder: { alignItems: 'center', justifyContent: 'center' },
  icon: { color: workoutColors.accent, fontSize: 26 },
});
