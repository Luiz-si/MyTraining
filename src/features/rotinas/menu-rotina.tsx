/** Menu discreto: renomear, duplicar ou excluir somente a rotina selecionada. */
import { useRef, useState } from 'react';
import { Alert, Text, TextInput } from 'react-native';
import { Button, styles } from '@/components/tela-base';
import { deleteRoutine, duplicateRoutine, renameRoutine } from './estado-rotinas';
import { RoutineSheet, SmallAction } from './componentes-rotinas';
import type { PersonalRoutine } from './tipos-rotina';
import { routineStyles as local } from './estilos-rotinas';

export function RoutineMenu({ routine, onClose, onDeleted, onDuplicated }: { routine: PersonalRoutine; onClose: () => void; onDeleted: () => void; onDuplicated: (id: string) => void }) {
  const [mode, setMode] = useState<'menu' | 'rename' | 'copy'>('menu');
  const [name, setName] = useState(routine.name);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const working = useRef(false);
  async function run(action: () => Promise<unknown>, after: (result: unknown) => void = onClose) {
    if (working.current) return;
    working.current = true; setBusy(true); setError('');
    try { const result = await action(); after(result); }
    catch (error) { setError(error instanceof Error ? error.message : 'Não foi possível salvar. Tente novamente.'); }
    finally { working.current = false; setBusy(false); }
  }
  function confirmDelete() {
    Alert.alert('Excluir rotina?', `A rotina “${routine.name}”, seus dias e todos os exercícios serão removidos deste celular. As outras rotinas e o perfil do criador serão preservados.`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir rotina', style: 'destructive', onPress: () => { void run(() => deleteRoutine(routine.id), onDeleted); } },
    ]);
  }
  return <RoutineSheet title={mode === 'menu' ? routine.name : mode === 'rename' ? 'Renomear rotina' : 'Duplicar rotina'} onClose={onClose} busy={busy}>
    {mode === 'menu' ? <>
      <Text style={styles.description}>Gerencie apenas esta rotina.</Text>
      <SmallAction label="Renomear" disabled={busy} onPress={() => { setName(routine.name); setMode('rename'); }} />
      <SmallAction label="Duplicar rotina" disabled={busy} onPress={() => { setName(`${routine.name.slice(0, 92)} (cópia)`); setMode('copy'); }} />
      <SmallAction label="Excluir rotina" danger disabled={busy} onPress={confirmDelete} />
    </> : <>
      <Text style={local.caption}>Nome da rotina</Text>
      <TextInput accessibilityLabel="Novo nome da rotina" value={name} onChangeText={setName} maxLength={100} editable={!busy} style={local.input} />
      {!busy && <Button label={mode === 'rename' ? 'Salvar nome' : 'Criar cópia independente'} onPress={() => {
        void run(() => mode === 'rename' ? renameRoutine(routine.id, name) : duplicateRoutine(routine.id, name),
          (result) => { if (mode === 'copy') onDuplicated(result as string); else onClose(); });
      }} />}
      <SmallAction label="Voltar às opções" disabled={busy} onPress={() => setMode('menu')} />
    </>}
    {!!error && <Text accessibilityRole="alert" style={local.error}>{error}</Text>}
  </RoutineSheet>;
}
