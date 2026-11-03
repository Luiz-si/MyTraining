/**
 * FOTO COM EFEITO DE FUSÃO AO FUNDO
 * Edite aqui: enquadramento da foto, legendas e camadas de degradê.
 * Mostra um espaço reservado quando a foto ainda não foi adicionada.
 * Escolha os arquivos de imagem em data/conteudo-minha-proposta.ts.
 * Guia de localização: docs/onde-mexer-no-codigo.md
 */

import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import { workoutColors as colors } from '@/constants/cores-app';
import { aboutMeuTreino, type AboutPhoto } from '@/data/conteudo-minha-proposta';

export function PhotoStory({ photo, compact = false }: { photo: AboutPhoto; compact?: boolean }) {
  const [failed, setFailed] = useState(false);
  const reduceMotion = useReducedMotion();
  const hasImage = photo.source !== null && !failed;

  return (
    <View>
      <View style={[local.scene, compact && local.compact]}>
        {hasImage ? (
          <Image
            source={photo.source}
            accessibilityLabel={photo.alt}
            accessible
            contentFit="cover"
            contentPosition={photo.position ?? 'center'}
            cachePolicy="memory-disk"
            allowDownscaling
            transition={reduceMotion ? 0 : 180}
            onError={() => setFailed(true)}
            style={StyleSheet.absoluteFill}
          />
        ) : (
          <View style={local.placeholder}>
            <View accessible={false} style={local.orbit} />
            <View accessible={false} style={local.orbitInner} />
            <Text style={local.label}>{aboutMeuTreino.gallery.placeholderLabel}</Text>
            <Text style={local.placeholderTitle}>{aboutMeuTreino.gallery.placeholderTitle}</Text>
            <Text style={local.placeholderCopy}>{aboutMeuTreino.gallery.placeholderDescription}</Text>
          </View>
        )}
        {hasImage && (
          <>
            <View pointerEvents="none" accessible={false} style={[StyleSheet.absoluteFill, local.fade]} />
            <View pointerEvents="none" accessible={false} style={[StyleSheet.absoluteFill, local.edgeFade]} />
          </>
        )}
      </View>
      {hasImage && (photo.title || photo.description) && (
        <View style={local.caption}>
          {photo.title && <Text style={local.captionTitle}>{photo.title}</Text>}
          {photo.description && <Text style={local.captionText}>{photo.description}</Text>}
        </View>
      )}
    </View>
  );
}

const local = StyleSheet.create({
  scene: { width: '100%', aspectRatio: 0.95, maxHeight: 540, minHeight: 280, overflow: 'hidden', borderTopLeftRadius: 26, borderTopRightRadius: 26, backgroundColor: colors.background },
  compact: { aspectRatio: 1.15, minHeight: 220 },
  placeholder: { flex: 1, padding: 28, justifyContent: 'center', gap: 14, backgroundImage: 'linear-gradient(145deg, #244A30 0%, #13291E 55%, #0C100F 100%)' },
  orbit: { position: 'absolute', width: 280, height: 280, borderRadius: 140, borderWidth: 1, borderColor: '#B0F36D22', top: -100, right: -90 },
  orbitInner: { position: 'absolute', width: 220, height: 220, borderRadius: 110, borderWidth: 1, borderColor: '#B0F36D18', top: -70, right: -60 },
  label: { color: colors.accent, fontSize: 10, fontWeight: '700', letterSpacing: 2, lineHeight: 17 },
  placeholderTitle: { color: colors.text, fontSize: 30, lineHeight: 36, fontWeight: '800', letterSpacing: -0.7 },
  placeholderCopy: { color: colors.textSecondary, fontSize: 13, lineHeight: 21, maxWidth: 250 },
  fade: { backgroundImage: 'linear-gradient(180deg, rgba(12,16,15,0) 35%, rgba(12,16,15,0.4) 65%, #0C100F 100%)' },
  edgeFade: { backgroundImage: 'linear-gradient(90deg, rgba(12,16,15,0.3) 0%, rgba(12,16,15,0) 18%, rgba(12,16,15,0) 82%, rgba(12,16,15,0.3) 100%)' },
  caption: { gap: 8, paddingTop: 8, paddingHorizontal: 4 },
  captionTitle: { color: colors.text, fontSize: 23, fontWeight: '700', lineHeight: 30 },
  captionText: { color: colors.textSecondary, fontSize: 14, lineHeight: 23 },
});
