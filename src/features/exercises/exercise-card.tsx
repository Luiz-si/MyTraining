import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { styles } from '@/components/workout-screen';
import { exerciseImages } from '@/data/exercise-images.generated';

import { ExerciseImage } from './exercise-image';
import { ImageLibraryModal } from './image-library-modal';
import { imageUri, pickExerciseImage, removeExerciseImage } from './images';
import { type FourSets, type LocalExercise, stepWeight } from './model';
import { NumericControl } from './numeric-control';
import { deleteExercise, updateExercise } from './store';
import { CopyExerciseModal } from './copy-exercise-modal';

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

  function changeSet(index: number, field: 'weight' | 'repetitions', value: string | 1 | -1, stepping: boolean) {
    updateExercise(exercise.dayId, exercise.id, (current) => {
      const sets = current.sets.map((set, i) => {
        if (i !== index) return set;
        if (field === 'weight') return { ...set, weight: stepping ? stepWeight(set.weight, value as 1 | -1) : String(value) };
        return { ...set, repetitions: stepping
          ? Math.min(Number.MAX_SAFE_INTEGER, Math.max(0, set.repetitions + Number(value))) : Number(value) };
      }) as FourSets;
      return { ...current, sets };
    });
  }

  function confirmDelete() {
    Alert.alert('Excluir exercício?', `“${exercise.name}” e suas quatro séries serão excluídos somente deste dia.`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => deleteExercise(exercise.dayId, exercise.id) },
    ]);
  }

  return (
    <View style={local.card}>
      <Pressable accessibilityRole="button" accessibilityState={{ expanded }}
        accessibilityLabel={`${exercise.name}, 4 séries`} accessibilityHint={expanded ? 'Fechar detalhes' : 'Expandir detalhes'}
        onPress={onToggle} style={({ pressed }) => [local.header, pressed && styles.pressed]}>
        <ExerciseImage key={`small-${imageKey}`} source={source} small />
        <View style={local.heading}>
          <Text style={local.name}>{exercise.name}</Text>
          <Text style={local.subtitle}>4 séries</Text>
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
                <NumericControl label={`Carga em kg da série ${index + 1}`} value={set.weight}
                  onValue={(value) => changeSet(index, 'weight', value, false)}
                  onStep={(delta) => changeSet(index, 'weight', delta, true)} />
                <NumericControl label={`Repetições da série ${index + 1}`} value={String(set.repetitions)} integer
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
  card: { borderRadius: 18, backgroundColor: '#171F1B', borderWidth: 1, borderColor: '#2D3B31', overflow: 'hidden' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, minHeight: 76 },
  heading: { flex: 1, gap: 6 },
  name: { color: '#F4F7F3', fontSize: 16, fontWeight: '700' },
  subtitle: { color: '#A8B3AB', fontSize: 12 },
  details: { padding: 12, paddingTop: 4, gap: 10 },
  toolbar: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tool: { flex: 1 },
  action: { minHeight: 44, justifyContent: 'center', paddingVertical: 8, paddingHorizontal: 4 },
  actionText: { color: '#B0F36D', fontSize: 13, fontWeight: '600' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  edit: { gap: 8 },
  nameInput: { backgroundColor: '#0C100F', borderRadius: 10, borderWidth: 1, borderColor: '#48613A', minHeight: 48, padding: 12, color: '#F4F7F3', fontSize: 16 },
  error: { color: '#FFB4A8' },
  labels: { flexDirection: 'row', justifyContent: 'space-around', gap: 8 },
  series: { gap: 4, borderTopWidth: 1, borderTopColor: '#2D3B31', paddingTop: 6 },
  seriesLabel: { color: '#A8B3AB', fontSize: 11 },
  controls: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
