/**
 * APARÊNCIA DA PÁGINA MINHA PROPOSTA
 * Edite aqui: tamanho das letras, espaços, cartões, cores e bordas das seções.
 * hero = destaque do topo; body = parágrafos; muscleCard = cartão de um músculo.
 * Para mudar frases ou fotos, abra data/conteudo-minha-proposta.ts.
 * Guia de localização: docs/onde-mexer-no-codigo.md
 */

import { StyleSheet } from 'react-native';

import { workoutColors as colors } from '@/constants/cores-app';

export const aboutStyles = StyleSheet.create({
  // PÁGINA: fundo, largura máxima, espaço nas laterais e distância entre seções.
  screen: { flex: 1, backgroundColor: colors.background },
  content: { width: '100%', maxWidth: 680, alignSelf: 'center', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40 },
  separator: { height: 36 },
  section: { gap: 18 },
  // TEXTOS: label = legenda verde; title = título de seção; body = parágrafo.
  label: { color: colors.accent, fontSize: 10, fontWeight: '700', letterSpacing: 2, lineHeight: 17 },
  title: { color: colors.text, fontSize: 28, lineHeight: 34, fontWeight: '800', letterSpacing: -0.8 },
  body: { color: colors.textSecondary, fontSize: 15, lineHeight: 25 },
  // DESTAQUE DO TOPO: caixa, degradê, título grande, subtítulo e traço verde.
  hero: { padding: 24, paddingTop: 32, borderRadius: 28, overflow: 'hidden', gap: 22, backgroundColor: colors.surface, backgroundImage: 'linear-gradient(145deg, #244A30 0%, #13291E 45%, #0C100F 100%)', borderWidth: 1, borderColor: colors.border },
  heroTitle: { color: colors.text, fontSize: 42, lineHeight: 46, fontWeight: '900', letterSpacing: -1.7 },
  heroSubtitle: { color: '#DFEAD9', fontSize: 18, lineHeight: 27 },
  accentLine: { width: 44, height: 4, borderRadius: 4, backgroundColor: colors.accent },
  // FILOSOFIA: distância entre parágrafos, etiquetas de objetivos e nota de equilíbrio.
  paragraph: { gap: 16 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { borderWidth: 1, borderColor: colors.borderStrong, borderRadius: 30, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: colors.surface },
  tagText: { color: colors.accent, fontSize: 12, fontWeight: '600' },
  balance: { paddingLeft: 16, borderLeftWidth: 2, borderLeftColor: colors.accent },
  // MÚSCULOS: grade, cartões, nome do grupo e fundo do ícone.
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  muscleCard: { flexGrow: 1, flexBasis: 220, borderWidth: 1, borderColor: colors.border, borderRadius: 22, padding: 20, gap: 14, backgroundColor: colors.surface, backgroundImage: 'linear-gradient(145deg, #203A29 0%, #171F1B 85%)' },
  muscleTitle: { color: colors.text, fontSize: 19, fontWeight: '700' },
  icon: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#29422C', alignItems: 'center', justifyContent: 'center' },
  // DICAS: linha de cada dica, número à esquerda e conteúdo à direita.
  tip: { paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', gap: 16 },
  tipNumber: { color: colors.accent, fontSize: 12, fontWeight: '700', lineHeight: 25 },
  tipContent: { flex: 1, gap: 8 },
  // ASSINATURA: área final com o nome do criador e a frase de encerramento.
  signature: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 28, gap: 10, alignItems: 'center' },
  signatureName: { color: colors.text, fontSize: 22, fontWeight: '700', letterSpacing: -0.4 },
  signatureText: { color: colors.textSecondary, textAlign: 'center', fontSize: 13, lineHeight: 21 },
});
