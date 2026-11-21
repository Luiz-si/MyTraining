/**
 * EXERCÍCIOS PESSOAIS: id escolhe a rotina; diaId escolhe o dia da semana (0 a 6).
 * A lista recebe o ID estável do DIA, nunca o nome da sessão ou apenas "segunda".
 * Assim, renomear e alternar rotinas não mistura os exercícios.
 */
import { useCallback, useState } from 'react';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native';
import { Button, Screen, styles } from '@/components/tela-base';
import RestTimer from '@/components/cronometro-descanso';
import { DayExercises } from '@/features/exercicios/lista-exercicios-dia';
import { loadRoutines, useRoutines } from '@/features/rotinas/estado-rotinas';
import { DayEditor } from '@/features/rotinas/editor-dia';
import { weekNames } from '@/data/modelos-rotinas';

export default function PersonalDayScreen() {
  const { id, diaId } = useLocalSearchParams<{ id: string; diaId: string }>();
  const state = useRoutines();
  const routine = state.routines.find((item) => item.id === id);
  const day = /^[0-6]$/.test(diaId ?? '') ? routine?.days.find((item) => item.weekday === Number(diaId)) : undefined;
  const [editing, setEditing] = useState(false);
  useFocusEffect(useCallback(() => { void loadRoutines(); }, []));
  return <Screen keyboardShouldPersistTaps="handled">
    <Button label="Voltar à divisão da rotina" onPress={() => router.dismissTo({ pathname: '/rotina/[id]', params: { id } })} secondary />
    {!!state.error && <><Text style={styles.description}>{state.error}</Text><Button label="Tentar novamente" onPress={() => { void loadRoutines(); }} secondary /></>}
    {!day && <Text style={styles.description}>{state.loaded ? 'Dia ou rotina não encontrado.' : 'Carregando treino…'}</Text>}
    {day && <>
      <Text style={styles.eyebrow}>{routine!.name}</Text>
      <Text accessibilityRole="header" style={styles.hero}>{weekNames[day.weekday]}</Text>
      <Text style={styles.sectionTitle}>{day.rest ? 'Descanso' : day.name}</Text>
      <Text style={styles.description}>{day.rest ? 'Este dia está reservado para descanso. Edite-o para incluir um treino. Os exercícios anteriores continuam guardados.' : day.muscles.join(' · ')}</Text>
      {day.rest ? <Button label="Editar este dia" onPress={() => setEditing(true)} secondary /> : <>
        <RestTimer key={`descanso-${day.id}`} />
        <Text accessibilityRole="header" style={styles.sectionTitle}>Exercícios</Text>
        <DayExercises key={`exercicios-${day.id}`} dayId={day.id} />
      </>}
      {editing && <DayEditor day={day} onClose={() => setEditing(false)} />}
    </>}
  </Screen>;
}
