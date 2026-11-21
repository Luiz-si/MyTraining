/**
 * CARTÃO DE UM EXERCÍCIO
 * Edite aqui: nome, imagem, botões de ação e apresentação das quatro séries.
 * As ações incluem alterar imagem, renomear, excluir e copiar para outro dia.
 * As regras de salvamento ficam em estado-exercicios.ts.
 * Guia de localização: docs/onde-mexer-no-codigo.md
 */

import { workoutColors } from '@/constants/cores-app';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { styles } from '@/components/tela-base';
import { exerciseImages } from '@/data/exercise-images.generated';

import { ExerciseImage } from './imagem-exercicio';
import { ImageLibraryModal } from './seletor-biblioteca-imagens';
import { imageUri, pickExerciseImage, removeExerciseImage } from './fotos-do-celular';
import { type FourSets, type LocalExercise, stepRepetitions, stepWeight } from './tipos-e-validacao';
import { recommendedExercises } from '@/data/exercicios-recomendados';
import { NumericControl } from './campo-carga-repeticoes';
import { deleteExercise, moveExercise, updateExercise } from './estado-exercicios';
import { CopyExerciseModal } from './seletor-dia-para-copiar';

export function ExerciseCard({ exercise, expanded, onToggle }: {
  exercise: LocalExercise;
  expanded: boolean;
  onToggle: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(exercise.name);
  const [picking, setPicking] = useState(false);
  const [nameError, setNameError] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [showCopy, setShowCopy] = useState(false);
  const uri = imageUri(exercise.imageFile);
  const source = exercise.libraryImageId
    ? exerciseImages.find((image) => image.id === exercise.libraryImageId)?.source
    : uri ? { uri } : undefined;
  const imageKey = exercise.libraryImageId ?? exercise.imageFile ?? 'none';
  const hasImage = Boolean(exercise.libraryImageId || exercise.imageFile);
  const personal = exercise.dayId.startsWith('personal:');
  const recommendation = exercise.recommendationId ? recommendedExercises[exercise.recommendationId] : undefined;

  function chooseLibrary(id: string) {
    updateExercise(exercise.dayId, exercise.id, (current) => ({ ...current, imageFile: null, libraryImageId: id }));
    setShowLibrary(false);
    setShowSources(false);
  }

  function removeImage() {
    updateExercise(exercise.dayId, exercise.id, (current) => ({ ...current, imageFile: null, libraryImageId: null }));
    setShowSources(false);
  }

  function rename() {
    if (!name.trim()) { setNameError(true); return; }
    updateExercise(exercise.dayId, exercise.id, (current) => ({ ...current, name: name.trim() }));
    setEditing(false);
    setNameError(false);
  }

  async function chooseImage() {
    if (picking) return;
    setPicking(true);
    try {
      const filename = await pickExerciseImage();
      if (filename && !updateExercise(exercise.dayId, exercise.id, (current) => ({ ...current, imageFile: filename, libraryImageId: null }))) {
        removeExerciseImage(filename);
      }
    } catch {
      Alert.alert('Imagem não adicionada', 'Não foi possível copiar a foto. Tente escolher outra imagem.');
    } finally { setPicking(false); setShowSources(false); }
  }

  function changeSet(index: number, field: 'weight' | 'repetitions', value: string | null | 1 | -1, stepping: boolean) {
    updateExercise(exercise.dayId, exercise.id, (current) => {
      const sets = current.sets.map((set, i) => {
        if (i !== index) return set;
        if (field === 'weight') return { ...set, weight: stepping ? stepWeight(set.weight, value as 1 | -1) : value === null ? null : String(value) };
        return { ...set, repetitions: stepping
          ? stepRepetitions(set.repetitions, value as 1 | -1) : value === null ? null : Number(value) };
      }) as FourSets;
      return { ...current, sets };
    });
  }

  function confirmDelete() {
    Alert.alert('Excluir exercício?', `“${exercise.name}” e suas ${exercise.sets.length} séries serão excluídos somente deste dia.`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => deleteExercise(exercise.dayId, exercise.id) },
    ]);
  }

  return (
    <View style={local.card}>
      <Pressable accessibilityRole="button" accessibilityState={{ expanded }}
        accessibilityLabel={`${exercise.name}, ${exercise.sets.length} séries`} accessibilityHint={expanded ? 'Fechar detalhes' : 'Expandir detalhes'}
        onPress={onToggle} style={({ pressed }) => [local.header, pressed && styles.pressed]}>
        <ExerciseImage key={`small-${imageKey}`} source={source} small />
        <View style={local.heading}>
          <Text style={local.name}>{exercise.name}</Text>
          <Text style={local.subtitle}>{exercise.sets.length} séries</Text>
          {recommendation && <Text style={local.subtitle}>Sugestão inicial · editável</Text>}
        </View>
        <Text style={styles.accent}>{expanded ? '⌃' : '⌄'}</Text>
      </Pressable>
      {expanded && (
        <View style={local.details}>
          <View style={local.toolbar}>
            <View style={local.tool}>
              <Action label={hasImage ? 'Alterar imagem' : 'Adicionar imagem'} onPress={() => setShowSources((current) => !current)} disabled={picking} />
            </View>
            {!editing && <>
              <View style={local.tool}>
                <Action label="Editar nome" onPress={() => { setName(exercise.name); setEditing(true); }} />
              </View>
              <View style={local.tool}>
                <Action label="Excluir exercício" onPress={confirmDelete} danger />
              </View>
            </>}
          </View>
          {!editing && <Action label="Copiar exercício" onPress={() => setShowCopy(true)} disabled={picking} />}
          {/* A rotina do criador mantém as quatro séries; só a área pessoal ganha estes controles. */}
          {personal && <View style={local.actions}>
            <Action label="Mover acima" onPress={() => moveExercise(exercise.dayId, exercise.id, -1)} />
            <Action label="Mover abaixo" onPress={() => moveExercise(exercise.dayId, exercise.id, 1)} />
            <Action label="+ Série" disabled={exercise.sets.length >= 12} onPress={() => updateExercise(exercise.dayId, exercise.id, (current) => ({ ...current, sets: [...current.sets, { weight: null, repetitions: null }] }))} />
            <Action label="− Série" disabled={exercise.sets.length <= 1} onPress={() => {
              Alert.alert('Remover última série?', 'Os valores desta série serão removidos somente deste exercício.', [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Remover', style: 'destructive', onPress: () => updateExercise(exercise.dayId, exercise.id, (current) => ({ ...current, sets: current.sets.slice(0, -1) })) },
              ]);
            }} />
          </View>}
          {showSources && <View>
            <Action label="Escolher da biblioteca" onPress={() => setShowLibrary(true)} disabled={picking} />
            <Action label={picking ? 'Abrindo galeria…' : 'Escolher da galeria'} onPress={() => { void chooseImage(); }} disabled={picking} />
            {hasImage && <Action label="Remover imagem" onPress={removeImage} disabled={picking} />}
          </View>}
          {editing && (
            <View style={local.edit}>
              <TextInput accessibilityLabel="Nome do exercício" value={name} onChangeText={setName}
                maxLength={100} autoFocus style={local.nameInput} returnKeyType="done" onSubmitEditing={rename} />
              {nameError && <Text style={local.error}>Digite um nome para o exercício.</Text>}
              <View style={local.actions}>
                <Action label="Salvar nome" onPress={rename} />
                <Action label="Cancelar" onPress={() => { setEditing(false); setNameError(false); }} />
              </View>
            </View>
          )}
          <View style={local.labels}>
            <Text style={local.subtitle}>Carga (kg)</Text><Text style={local.subtitle}>Repetições</Text>
          </View>
          {exercise.sets.map((set, index) => (
            <View key={index} style={local.series}>
              <Text style={local.seriesLabel}>Série {index + 1}</Text>
              <View style={local.controls}>
                <NumericControl label={`Carga em kg da série ${index + 1}`} value={set.weight ?? ''} allowEmpty={personal}
                  onValue={(value) => changeSet(index, 'weight', value, false)}
                  onStep={(delta) => changeSet(index, 'weight', delta, true)} />
                <NumericControl label={`Repetições da série ${index + 1}`} value={set.repetitions === null ? '' : String(set.repetitions)} integer allowEmpty={personal}
                  onValue={(value) => changeSet(index, 'repetitions', value, false)}
                  onStep={(delta) => changeSet(index, 'repetitions', delta, true)} />
              </View>
            </View>
          ))}
        </View>
      )}
      {showLibrary && <ImageLibraryModal initialId={exercise.libraryImageId} onSelect={chooseLibrary} onClose={() => setShowLibrary(false)} />}
      {showCopy && <CopyExerciseModal exercise={exercise} onClose={() => setShowCopy(false)} />}
    </View>
  );
}

export function Action({ label, onPress, danger = false, disabled = false }: {
  label: string; onPress: () => void; danger?: boolean; disabled?: boolean;
}) {
  return <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress}
    style={({ pressed }) => [local.action, (pressed || disabled) && styles.pressed]}>
    <Text style={[local.actionText, danger && local.error]}>{label}</Text>
  </Pressable>;
}

const local = StyleSheet.create({
  card: { borderRadius: 18, backgroundColor: workoutColors.surface, borderWidth: 1, borderColor: workoutColors.border, overflow: 'hidden' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, minHeight: 76 },
  heading: { flex: 1, gap: 6 },
  name: { color: workoutColors.text, fontSize: 16, fontWeight: '700' },
  subtitle: { color: workoutColors.textSecondary, fontSize: 12 },
  details: { padding: 12, paddingTop: 4, gap: 10 },
  toolbar: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tool: { flex: 1 },
  action: { minHeight: 44, justifyContent: 'center', paddingVertical: 8, paddingHorizontal: 4 },
  actionText: { color: workoutColors.accent, fontSize: 13, fontWeight: '600' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  edit: { gap: 8 },
  nameInput: { backgroundColor: workoutColors.background, borderRadius: 10, borderWidth: 1, borderColor: workoutColors.borderStrong, minHeight: 48, padding: 12, color: workoutColors.text, fontSize: 16 },
  error: { color: '#FFB4A8' },
  labels: { flexDirection: 'row', justifyContent: 'space-around', gap: 8 },
  series: { gap: 4, borderTopWidth: 1, borderTopColor: workoutColors.border, paddingTop: 6 },
  seriesLabel: { color: workoutColors.textSecondary, fontSize: 11 },
  controls: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
