/** Formulário do dia escolhido: nome, músculos e treino/descanso, sem apagar exercícios. */
import { useRef, useState } from 'react';
import { Switch, Text, TextInput, View } from 'react-native';
import { Button, styles } from '@/components/tela-base';
import { weekNames } from '@/data/modelos-rotinas';
import { workoutColors as colors } from '@/constants/cores-app';
import { RoutineSheet } from './componentes-rotinas';
import { saveRoutineDay } from './estado-rotinas';
import type { RoutineDay } from './tipos-rotina';
import { routineStyles as local } from './estilos-rotinas';

export function DayEditor({ day, onClose }: { day: RoutineDay; onClose: () => void }) {
  const [name, setName] = useState(day.name === 'Descanso' ? '' : day.name);
  const [muscles, setMuscles] = useState(day.muscles.join(', '));
  const [rest, setRest] = useState(day.rest);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const working = useRef(false);
  async function save() {
    if (working.current) return;
    working.current = true; setBusy(true); setError('');
    try {
      await saveRoutineDay(day.routineId, day.id, { name, muscles: muscles.split(','), rest });
      onClose();
    } catch (error) { setError(error instanceof Error ? error.message : 'Não foi possível salvar o dia.'); }
    finally { working.current = false; setBusy(false); }
  }
  return <RoutineSheet title={`Editar ${weekNames[day.weekday]}`} onClose={onClose} busy={busy}>
    <View style={local.switchRow}>
      <Text style={[styles.description, local.flex]}>Dia de descanso</Text>
      <Switch accessibilityLabel="Dia de descanso" value={rest} onValueChange={setRest} disabled={busy} trackColor={{ true: colors.accent }} />
    </View>
    <Text style={styles.description}>{rest ? 'Os exercícios já cadastrados ficam guardados. Desative o descanso para usar este dia como treino.' : 'Este dia estará disponível para adicionar e editar exercícios.'}</Text>
    <Text style={local.caption}>Nome da sessão</Text>
    <TextInput accessibilityLabel="Nome da sessão" value={name} onChangeText={setName} maxLength={100} editable={!busy} placeholder="Ex.: Treino A" placeholderTextColor={colors.textSecondary} style={local.input} />
    <Text style={local.caption}>Grupos musculares separados por vírgula</Text>
    <TextInput accessibilityLabel="Grupos musculares" value={muscles} onChangeText={setMuscles} maxLength={1210} editable={!busy} multiline placeholder="Ex.: Peito, ombros, tríceps" placeholderTextColor={colors.textSecondary} style={local.input} />
    {!!error && <Text accessibilityRole="alert" style={local.error}>{error}</Text>}
    {!busy && <Button label="Salvar dia" onPress={() => { void save(); }} />}
  </RoutineSheet>;
}
