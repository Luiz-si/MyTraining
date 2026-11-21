/**
 * VISUAL DA ÁREA PESSOAL. Não muda o perfil ou os cartões antigos do criador.
 * backgroundColor = fundo; borderRadius = cantos; padding/gap = espaços.
 * flexDirection 'row' coloca elementos lado a lado; flex:1 ocupa o espaço livre.
 */
import { StyleSheet } from 'react-native';
import { workoutColors as colors } from '@/constants/cores-app';

export const routineStyles = StyleSheet.create({
  card: { padding: 20, borderRadius: 22, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, gap: 14 },
  // Todos os cartões recebem esta borda verde e o degradê, sem seleção de rotina ativa.
  greenCard: { borderColor: colors.accent, backgroundImage: 'linear-gradient(135deg, #253F29 0%, #171F1B 85%)' },
  stack: { gap: 16 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' },
  flex: { flex: 1 },
  badge: { color: colors.accent, fontSize: 11, letterSpacing: 1, fontWeight: '700' },
  caption: { color: colors.textSecondary, fontSize: 13, lineHeight: 20 },
  action: { minHeight: 44, minWidth: 44, justifyContent: 'center', paddingHorizontal: 10, alignSelf: 'flex-start' },
  actionText: { color: colors.accent, fontSize: 14, fontWeight: '700' },
  input: { minHeight: 52, borderWidth: 1, borderColor: colors.borderStrong, borderRadius: 12, padding: 14, color: colors.text, backgroundColor: colors.background, fontSize: 16, textAlignVertical: 'center' },
  error: { color: '#FFB4A8', fontSize: 14, lineHeight: 21 },
  backdrop: { flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000000B3' },
  modalWidth: { width: '100%', maxWidth: 560, maxHeight: '92%' },
  panel: { flexShrink: 1, padding: 20, gap: 16, borderRadius: 24, backgroundColor: colors.surface, borderColor: colors.borderStrong, borderWidth: 1 },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  list: { gap: 20, paddingBottom: 20 },
  // Miniatura ao lado do nome na prévia; a coluna flex permite quebrar textos longos.
  recommendationRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
});
