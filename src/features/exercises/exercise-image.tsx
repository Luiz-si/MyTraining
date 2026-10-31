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
  image: { borderRadius: 12, backgroundColor: '#25351F' },
  placeholder: { alignItems: 'center', justifyContent: 'center' },
  icon: { color: '#B0F36D', fontSize: 26 },
});
