import { useRef, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { weeklySplit } from '@/data/workouts';

import type { LocalExercise } from './model';
import { copyExercise } from './store';

export function CopyExerciseModal({ exercise, onClose }: { exercise: LocalExercise; onClose: () => void }) {
  const [copying, setCopying] = useState(false);
  const [error, setError] = useState('');
  const busy = useRef(false);

  async function selectDay(dayId: string, dayName: string) {
    if (busy.current) return;
    busy.current = true;
    setCopying(true);
    setError('');
    try {
      await copyExercise(exercise.dayId, exercise.id, dayId);
      onClose();
      Alert.alert('Exercício copiado', `${exercise.name} foi adicionado a ${dayName.toLowerCase()}.`);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Não foi possível copiar. Tente novamente.');
    } finally { busy.current = false; setCopying(false); }
  }

  return (
    <Modal visible transparent animationType="fade" onRequestClose={() => { if (!busy.current) onClose(); }}>
      <SafeAreaView style={local.backdrop}>
        <View style={local.panel} accessibilityViewIsModal>
          <Text accessibilityRole="header" style={local.title}>Copiar exercício</Text>
          <Text style={local.description}>Escolha o dia que receberá {exercise.name}, com a imagem e as quatro séries.</Text>
          <ScrollView contentContainerStyle={local.list}>
            {weeklySplit.filter((day) => day.id !== exercise.dayId).map((day) => (
              <Pressable key={day.id} disabled={copying} accessibilityRole="button" accessibilityLabel={`Copiar para ${day.name}`}
                onPress={() => { void selectDay(day.id, day.name); }}
                style={({ pressed }) => [local.day, (pressed || copying) && local.dimmed]}>
                <Text style={local.dayName}>{day.name}</Text>
                <Text style={local.description}>{day.muscles.join(' · ')}</Text>
              </Pressable>
            ))}
          </ScrollView>
          {copying && <ActivityIndicator color="#B0F36D" accessibilityLabel="Copiando exercício" />}
          {!!error && <Text accessibilityLiveRegion="polite" style={local.error}>{error}</Text>}
          <Pressable accessibilityRole="button" disabled={copying} onPress={onClose} style={local.cancel}>
            <Text style={local.dayName}>Cancelar</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const local = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: '#000000B3', justifyContent: 'center', alignItems: 'center', padding: 20 },
  panel: { width: '100%', maxWidth: 520, maxHeight: '90%', backgroundColor: '#171F1B', borderRadius: 24, padding: 20, gap: 14, borderWidth: 1, borderColor: '#34473A' },
  title: { color: '#F4F7F3', fontSize: 22, fontWeight: '700' },
  description: { color: '#A8B3AB', fontSize: 13, lineHeight: 20 },
  list: { gap: 8 },
  day: { borderWidth: 1, borderColor: '#34473A', borderRadius: 12, padding: 12, gap: 4, minHeight: 48 },
  dayName: { color: '#B0F36D', fontSize: 15, fontWeight: '600' },
  cancel: { alignItems: 'center', justifyContent: 'center', minHeight: 44 },
  error: { color: '#FFB4A8', fontSize: 14 },
  dimmed: { opacity: 0.5 },
});
