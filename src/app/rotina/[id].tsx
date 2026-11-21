/**
 * DIVISÃO DA ROTINA PESSOAL indicada pelo id da URL (/rotina/[id]).
 * Reutiliza o cartão semanal existente; Editar abre só o dia escolhido.
 * Para mudar o visual, veja features/rotinas/estilos-rotinas.ts.
 */
import { useCallback, useState } from 'react';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Text } from 'react-native';
import { Button, Screen, styles } from '@/components/tela-base';
import { WorkoutDayCard } from '@/components/cartao-dia-treino';
import { routineModels, weekNames } from '@/data/modelos-rotinas';
import { loadRoutines, useRoutines } from '@/features/rotinas/estado-rotinas';
import { DayEditor } from '@/features/rotinas/editor-dia';
import { RoutineMenu } from '@/features/rotinas/menu-rotina';

export default function RoutineScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const state = useRoutines();
  const routine = state.routines.find((item) => item.id === id);
  const [editing, setEditing] = useState<string | null>(null);
  const [menu, setMenu] = useState(false);
  const editedDay = routine?.days.find((day) => day.id === editing);
  useFocusEffect(useCallback(() => { void loadRoutines(); }, []));
  return <Screen keyboardShouldPersistTaps="handled">
    <Button label="Voltar às minhas rotinas" onPress={() => router.dismissTo('/seu-treino')} secondary />
    {!state.loaded && state.loading && <ActivityIndicator />}
    {!!state.error && <><Text style={styles.description}>{state.error}</Text><Button label="Tentar novamente" onPress={() => { void loadRoutines(); }} secondary /></>}
    {!routine && state.loaded && <Text style={styles.description}>Esta rotina não está mais disponível. Escolha outra ou crie uma nova.</Text>}
    {routine && <>
      <Text style={styles.eyebrow}>ROTINA PESSOAL</Text>
      <Text accessibilityRole="header" style={styles.hero}>{routine.name}</Text>
      <Text style={styles.description}>{routineModels.find((model) => model.id === routine.modelId)?.name ?? 'Personalizado'}</Text>
      <Button label="Editar informações e opções" onPress={() => setMenu(true)} secondary />
      <Text style={styles.sectionTitle}>Divisão semanal</Text>
      {routine.days.map((day) => <WorkoutDayCard key={day.id}
        day={{ id: day.id, name: weekNames[day.weekday], muscles: day.rest ? [] : day.muscles, exercises: [] }}
        position={day.weekday + 1} sessionName={day.name} rest={day.rest} exerciseCount={day.exerciseCount}
        onEdit={() => setEditing(day.id)}
        onPress={() => router.push({ pathname: '/rotina/[id]/dia/[diaId]', params: { id: routine.id, diaId: String(day.weekday) } })}
      />)}
      {editedDay && <DayEditor key={editedDay.id} day={editedDay} onClose={() => setEditing(null)} />}
      {menu && <RoutineMenu routine={routine} onClose={() => setMenu(false)} onDeleted={() => router.dismissTo('/seu-treino')}
        onDuplicated={(newId) => { setMenu(false); router.push({ pathname: '/rotina/[id]', params: { id: newId } }); }} />}
    </>}
  </Screen>;
}
