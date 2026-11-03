/**
 * TELA MINHA PROPOSTA
 * Monta as seções da apresentação, filosofia, fotos, dicas e perguntas.
 * Edite aqui para mudar a ordem das seções.
 * Textos e fotos: data/conteudo-minha-proposta.ts. Aparência: features/minha-proposta/estilos.ts.
 * Guia de localização: docs/onde-mexer-no-codigo.md
 */

import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { FlatList, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/tela-base';
import { workoutColors as colors } from '@/constants/cores-app';
import { aboutMeuTreino as content, aboutPhotos, type AboutPhoto } from '@/data/conteudo-minha-proposta';
import { AboutAccordion } from '@/features/minha-proposta/pergunta-expansivel';
import { AboutReveal } from '@/features/minha-proposta/animacao-entrada';
import { aboutStyles as styles } from '@/features/minha-proposta/estilos';
import { PhotoStory } from '@/features/minha-proposta/foto-com-degrade';

type Section = { id: string; kind: 'intro' | 'philosophy' | 'groups' | 'gallery' | 'tips' | 'guide' | 'signature' }
  | { id: string; kind: 'photo'; photo: AboutPhoto };

const visiblePhotos = [...aboutPhotos].filter((photo) => photo.visible).sort((a, b) => a.order - b.order);
const sections: Section[] = [
  { id: 'intro', kind: 'intro' },
  ...visiblePhotos.filter((photo) => photo.placement === 'hero').map((photo): Section => ({ id: `photo-${photo.id}`, kind: 'photo', photo })),
  { id: 'philosophy', kind: 'philosophy' },
  { id: 'groups', kind: 'groups' },
  { id: 'gallery', kind: 'gallery' },
  ...visiblePhotos.filter((photo) => photo.placement === 'gallery').map((photo): Section => ({ id: `photo-${photo.id}`, kind: 'photo', photo })),
  { id: 'tips', kind: 'tips' },
  { id: 'guide', kind: 'guide' },
  { id: 'signature', kind: 'signature' },
];

function Separator() { return <View style={styles.separator} />; }

export default function AboutMeuTreinoScreen() {
  const { width, fontScale } = useWindowDimensions();
  const columns = Math.min(width, 680) - 48 >= 420 && fontScale < 1.3 ? 2 : 1;

  function renderSection({ item }: { item: Section }) {
    switch (item.kind) {
      case 'intro':
        return (
          <View style={styles.section}>
            <View style={styles.hero}>
              <Text style={styles.label}>{content.title}</Text>
              <View style={styles.accentLine} />
              <Text accessibilityRole="header" style={styles.heroTitle}>{content.heading}</Text>
              <Text style={styles.heroSubtitle}>{content.subtitle}</Text>
            </View>
            <Text style={styles.label}>{content.introduction.label}</Text>
            <View style={styles.paragraph}>
              {content.introduction.paragraphs.map((paragraph) => <Text key={paragraph} style={styles.body}>{paragraph}</Text>)}
            </View>
          </View>
        );
      case 'photo':
        return <PhotoStory key={`${item.photo.id}-${item.photo.source}`} photo={item.photo} compact={item.photo.placement !== 'hero'} />;
      case 'philosophy':
        return (
          <View style={styles.section}>
            <Text style={styles.label}>{content.philosophy.label}</Text>
            <Text accessibilityRole="header" style={styles.title}>{content.philosophy.title}</Text>
            {content.philosophy.paragraphs.map((paragraph) => <Text key={paragraph} style={styles.body}>{paragraph}</Text>)}
            <View style={styles.tags}>
              {content.philosophy.objectives.map((objective) => (
                <View key={objective} style={styles.tag}><Text style={styles.tagText}>{objective}</Text></View>
              ))}
            </View>
            <View style={styles.balance}><Text style={styles.body}>{content.philosophy.balance}</Text></View>
          </View>
        );
      case 'groups':
        return (
          <View style={styles.section}>
            <Text style={styles.label}>{content.groups.label}</Text>
            <Text accessibilityRole="header" style={styles.title}>{content.groups.title}</Text>
            <View style={styles.grid}>
              {content.groups.items.map((group) => (
                <View key={group.id} style={[styles.muscleCard, { flexBasis: columns === 2 ? '46%' : '100%' }]}>
                  <View accessible={false} importantForAccessibility="no-hide-descendants" style={styles.icon}>
                    <SymbolView name={{ ios: 'dumbbell', android: group.icon, web: group.icon }} tintColor={colors.accent} size={24} />
                  </View>
                  <Text style={styles.muscleTitle}>{group.title}</Text>
                  <Text style={styles.body}>{group.description}</Text>
                </View>
              ))}
            </View>
          </View>
        );
      case 'gallery':
        return (
          <View style={styles.section}>
            <Text style={styles.label}>{content.gallery.label}</Text>
            <Text accessibilityRole="header" style={styles.title}>{content.gallery.title}</Text>
            <Text style={styles.body}>{content.gallery.description}</Text>
          </View>
        );
      case 'tips':
        return (
          <View style={styles.section}>
            <Text style={styles.label}>{content.tips.label}</Text>
            <Text accessibilityRole="header" style={styles.title}>{content.tips.title}</Text>
            <Text style={styles.body}>{content.tips.description}</Text>
            <View>
              {content.tips.items.map((tip, index) => (
                <View key={tip.id} style={styles.tip}>
                  <Text accessible={false} style={styles.tipNumber}>{String(index + 1).padStart(2, '0')}</Text>
                  <View style={styles.tipContent}>
                    <Text style={styles.muscleTitle}>{tip.title}</Text>
                    <Text style={styles.body}>{tip.text}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        );
      case 'guide':
        return (
          <View style={styles.section}>
            <Text style={styles.label}>{content.guide.label}</Text>
            <Text accessibilityRole="header" style={styles.title}>{content.guide.title}</Text>
            {content.guide.items.map((item) => <AboutAccordion key={item.id} item={item} />)}
          </View>
        );
      case 'signature':
        return (
          <View style={styles.signature}>
            <Text style={styles.label}>{content.signature.label}</Text>
            <Text style={styles.signatureName}>{content.signature.name}</Text>
            <Text style={styles.signatureText}>{content.signature.text}</Text>
            <Button label={content.backLabel} onPress={() => router.dismissTo('/perfil')} secondary />
          </View>
        );
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <FlatList
        data={sections}
        extraData={columns}
        keyExtractor={(section) => section.id}
        renderItem={(props) => <AboutReveal>{renderSection(props)}</AboutReveal>}
        contentContainerStyle={styles.content}
        ItemSeparatorComponent={Separator}
        ListHeaderComponent={(
          <View style={{ paddingBottom: 24 }}>
            <Button label={content.backLabel} onPress={() => router.dismissTo('/perfil')} secondary />
          </View>
        )}
        initialNumToRender={2}
        maxToRenderPerBatch={2}
        windowSize={5}
        removeClippedSubviews={false}
      />
    </SafeAreaView>
  );
}
