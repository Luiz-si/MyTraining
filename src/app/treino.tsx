/**
 * TELA MINHA DIVISÃO SEMANAL
 * Desenha os cartões dos dias e o formulário para editar os grupos musculares.
 * Edite aqui: posição do formulário, campo de texto e botões Salvar/Cancelar.
 * A gravação dos grupos fica em features/divisao-semanal/use-divisao-semanal.ts.
 * Guia de localização: docs/onde-mexer-no-codigo.md
 */

import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, Keyboard, StyleSheet, Text, TextInput, View } from 'react-native';

import { WorkoutDayCard } from '@/components/cartao-dia-treino';
import { Button, Screen, styles } from '@/components/tela-base';
import { workoutColors } from '@/constants/cores-app';
import { restDay } from '@/data/divisao-semanal';
import { loadWeeklySplit, saveDayMuscles, useWeeklySplit } from '@/features/divisao-semanal/use-divisao-semanal';

export default function WeeklySplitScreen() {
  const { days, loaded, error: loadError } = useWeeklySplit();
  const [editingDayId, setEditingDayId] = useState<string | null>(null);
  const [musclesText, setMusclesText] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const busy = useRef(false);

  // SALVAR: espera a gravação no banco antes de fechar o formulário do dia escolhido.
  async function saveMuscles() {
    if (editingDayId === null || busy.current) return;
    busy.current = true;
    setSaving(true);
    setSaveError(null);
    try {
      await saveDayMuscles(editingDayId, musclesText);
      Keyboard.dismiss();
      setEditingDayId(null);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Não foi possível salvar. Tente novamente.');
    } finally {
      busy.current = false;
      setSaving(false);
    }
  }

  return (
    <Screen keyboardShouldPersistTaps="handled">
      <Button label=" Voltar ao início" onPress={() => router.dismissTo('/perfil')} secondary />
      <View style={styles.intro}>
        <Text style={styles.eyebrow}>ROTINA DO CRIADOR</Text>
        <Text accessibilityRole="header" style={styles.hero}>Minha divisão semanal</Text>
        <Text style={styles.description}>Seis dias de treino, um dia de descanso. Selecione um dia para conhecer a sessão.</Text>
      </View>

      {!loaded && !loadError && <ActivityIndicator color={workoutColors.accent} accessibilityLabel="Carregando divisão semanal" />}
      {loadError && (
        <View style={styles.card}>
          <Text accessibilityRole="alert" style={local.error}>{loadError}</Text>
          <Button label="Tentar novamente" onPress={() => { void loadWeeklySplit().catch(() => {}); }} secondary />
        </View>
      )}

      {/* CARTÕES: map cria uma cópia do cartão para cada dia da lista. */}
      {days.map((day, index) => (
        <View key={day.id} style={local.day}>
          <WorkoutDayCard
            day={day}
            position={index + 1}
            onPress={() => router.push({ pathname: '/dia/[id]', params: { id: day.id } })}
            onEdit={() => {
              if (!loaded || busy.current) return;
              setMusclesText(day.muscles.join(', '));
              setSaveError(null);
              setEditingDayId(day.id);
            }}
          />

          {/* EDIÇÃO: este formulário aparece somente no cartão do dia selecionado. */}
          {editingDayId === day.id && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Editar grupos de {day.name}</Text>
              <Text style={styles.description}>
                Separe os grupos musculares por vírgula. Exemplo: Peito, Tríceps, Ombro
              </Text>
              <TextInput
                accessibilityLabel={`Grupos musculares de ${day.name}`}
                value={musclesText}
                onChangeText={(text) => { setMusclesText(text); setSaveError(null); }}
                editable={!saving}
                multiline
                maxLength={1300}
                style={[styles.description, local.input]}
              />
              {saveError && <Text accessibilityRole="alert" style={local.error}>{saveError}</Text>}
              <Button label={saving ? 'Salvando…' : 'Salvar alterações'} onPress={() => { void saveMuscles(); }} />
              <Button
                label="Cancelar"
                onPress={() => {
                  if (busy.current) return;
                  Keyboard.dismiss();
                  setEditingDayId(null);
                  setSaveError(null);
                }}
                secondary
              />
            </View>
          )}
        </View>
      ))}

      <View style={styles.note}>
        <Text style={styles.eyebrow}>RECUPERAÇÃO</Text>
        <Text style={styles.sectionTitle}>{restDay.name}</Text>
        <Text style={styles.description}>{restDay.description}</Text>
      </View>
      <Text style={styles.footer}>Cada dia tem seu foco. O descanso também faz parte.</Text>
    </Screen>
  );
}

const local = StyleSheet.create({
  day: { gap: 12 },
  input: {
    minHeight: 60,
    borderWidth: 1,
    borderColor: workoutColors.accent,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 14,
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  error: { color: '#FFB4A8', fontSize: 14 },
});
