/**
 * CARTÃO DE UM DIA NA DIVISÃO SEMANAL
 * Edite aqui: aparência dos botões Editar/Ver exercícios e nome dos grupos.
 * onPress recebe a ação de abrir o treino; onEdit recebe a ação de editar os grupos.
 * As duas ações são fornecidas pela tela src/app/treino.tsx.
 * Guia de localização: docs/onde-mexer-no-codigo.md
 */

import { workoutColors } from '@/constants/cores-app';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { styles } from '@/components/tela-base';
import type { WorkoutDay } from '@/data/divisao-semanal';

export function WorkoutDayCard({ day, position, onPress, onEdit, sessionName, exerciseCount, rest = false }: {
  day: WorkoutDay;
  position: number;
  onPress: () => void;
  onEdit?: () => void;
  // Opcionais: a rotina do criador continua com a mesma aparência e comportamento.
  sessionName?: string;
  exerciseCount?: number;
  rest?: boolean;
}) {
    return (
    <View style={[styles.card, local.card, rest && local.rest]}>
      {/* CABEÇALHO: número do dia à esquerda e botão Editar à direita. */}
      <View style={local.heading}>
        <Text style={styles.eyebrow}>
          DIA {String(position).padStart(2, '0')}
        </Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Editar grupos de ${day.name}`}
          onPress={onEdit}
          style={({ pressed }) => [
            {
              backgroundColor: '#25351F',
              borderColor: '#B0F36D',
              borderWidth: 2,
              borderRadius: 12,
              paddingHorizontal: 16,
              
              minHeight: 0,
              minWidth: 48,
              alignItems: 'center',
              justifyContent: 'center',
            },
            sessionName !== undefined && local.personalEdit,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.accent}>Editar</Text>
        </Pressable>
      </View>

      {/* ABRIR TREINO: área de toque separada do botão Editar. */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${day.name}: ${day.muscles.join(', ')}`}
        accessibilityHint="Abre os exercícios deste dia"
        onPress={onPress}
        style={({ pressed }) => [
          local.card,
          pressed && styles.pressed,
        ]}
      >
        <Text style={styles.sectionTitle}>{day.name}</Text>
        {sessionName && <Text style={styles.accent}>{rest ? 'Descanso' : sessionName}</Text>}
        <Text style={styles.description}>
          {day.muscles.join(' · ')}
        </Text>
        {exerciseCount !== undefined && <Text style={styles.description}>{exerciseCount} exercícios{rest && exerciseCount ? ' guardados' : ''}</Text>}
        <Text style={local.link}>{rest ? 'Dia de descanso →' : 'Ver exercícios →'}</Text>
      </Pressable>
    </View>
  );
}

const local = StyleSheet.create({
  card: { gap: 10 },
  rest: { backgroundColor: workoutColors.background, borderStyle: 'dashed' },
  personalEdit: { minHeight: 44 },
  heading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  link: { 
    color: workoutColors.accent,
    fontWeight: '600',
    fontSize: 13,
    marginTop: 6,
    backgroundColor: '#25351F',
    borderColor: '#B0F36D',
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    overflow: 'hidden',
  }, 
});
