import { workoutColors } from '@/constants/workout-colors';
import { useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text } from 'react-native';

import { exportRoutine } from './export-routine';

export function ExportRoutineButton() {
  const [exporting, setExporting] = useState(false);
  const busy = useRef(false);

  async function startExport(mode: 'save' | 'share') {
    if (busy.current) return;
    busy.current = true;
    setExporting(true);
    try {
      await exportRoutine(mode);
      if (mode === 'save') Alert.alert('Rotina salva', 'O arquivo meutreino-rotina-….json foi salvo na pasta que você escolheu. Agora você pode enviá-lo pelo aplicativo Arquivos do celular.');
    }
    catch (error) {
      if (error instanceof Error && /cancel|cancell/i.test(error.message)) return;
      Alert.alert('Não foi possível exportar', error instanceof Error ? error.message : 'Tente novamente.');
    } finally { busy.current = false; setExporting(false); }
  }

  function chooseExport() {
    if (busy.current) return;
    Alert.alert('Exportar minha rotina', 'Como você quer guardar o arquivo dos seus treinos?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salvar no celular', onPress: () => { void startExport('save'); } },
      { text: 'Compartilhar arquivo', onPress: () => { void startExport('share'); } },
    ]);
  }

  return (
    <Pressable accessibilityRole="button" disabled={exporting} accessibilityState={{ disabled: exporting, busy: exporting }}
      onPress={chooseExport} style={({ pressed }) => [local.button, pressed && local.pressed]}>
      <Text style={local.text}>{exporting ? 'Preparando arquivo…' : 'Exportar minha rotina'}</Text>
    </Pressable>
  );
}

const local = StyleSheet.create({
  button: { minHeight: 48, borderRadius: 14, borderWidth: 1, borderColor: workoutColors.border, justifyContent: 'center', alignItems: 'center', padding: 12 },
  text: { color: workoutColors.accent, fontSize: 15, fontWeight: '600' },
  pressed: { opacity: 0.7 },
});
