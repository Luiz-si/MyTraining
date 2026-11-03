/**
 * LISTA E CADASTRO DOS EXERCÍCIOS DO DIA
 * Edite aqui: botão Adicionar exercício, formulário e organização dos cartões.
 * Coordena a escolha de uma imagem e mostra o estado de carregamento/salvamento.
 * Guia de localização: docs/onde-mexer-no-codigo.md
 */

import { workoutColors } from '@/constants/cores-app';
import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, ActivityIndicator, Alert, LayoutAnimation, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button, styles } from '@/components/tela-base';
import { exerciseImages } from '@/data/exercise-images.generated';

import { Action, ExerciseCard } from './cartao-exercicio';
import { addExercise, loadDay, retrySaving, useExercises, useSaveState } from './estado-exercicios';
import { ImageLibraryModal } from './seletor-biblioteca-imagens';
import { ExerciseImage } from './imagem-exercicio';
import { imageUri, pickExerciseImage, removeExerciseImage } from './fotos-do-celular';

export function DayExercises({ dayId }: { dayId: string }) {
  const state = useExercises(dayId);
  const saving = useSaveState();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [ready, setReady] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [libraryId, setLibraryId] = useState<string | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);
  const ownedPhoto = useRef<string | null>(null);
  const mounted = useRef(true);
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(true);

  useEffect(() => { void loadDay(dayId); }, [dayId]);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; removeExerciseImage(ownedPhoto.current); };
  }, []);
  useEffect(() => {
    let active = true;
    let changed = false;
    const listener = AccessibilityInfo.addEventListener('reduceMotionChanged', (enabled) => {
      changed = true;
      setReduceMotion(enabled);
    });
    AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (active && !changed) setReduceMotion(value);
    }).catch(() => {});
    return () => { active = false; listener.remove(); };
  }, []);

  function toggle(id: string) {
    if (!reduceMotion) LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId((current) => current === id ? null : id);
  }

  function create() {
    if (!name.trim()) { setNameError(true); return; }
    const id = addExercise(dayId, name, { imageFile: photo, libraryImageId: libraryId });
    ownedPhoto.current = null;
    setPhoto(null);
    setLibraryId(null);
    setName('');
    setAdding(false);
    setReady(false);
    setNameError(false);
    setExpandedId(id);
  }

  function cancel() {
    removeExerciseImage(ownedPhoto.current);
    ownedPhoto.current = null;
    setPhoto(null);
    setLibraryId(null);
    setName('');
    setNameError(false);
    setReady(false);
    setAdding(false);
    setShowLibrary(false);
  }

  function selectLibrary(id: string) {
    const image = exerciseImages.find((item) => item.id === id);
    if (!image) return;
    removeExerciseImage(ownedPhoto.current);
    ownedPhoto.current = null;
    setPhoto(null);
    setLibraryId(id);
    if (!name.trim()) setName(image.name.replace(/ — (posição inicial|posição final|visão geral)$/, '').slice(0, 100));
    setReady(true);
    setShowLibrary(false);
  }

  async function selectGallery() {
    if (picking) return;
    setPicking(true);
    try {
      const filename = await pickExerciseImage();
      if (!filename) return;
      if (!mounted.current) { removeExerciseImage(filename); return; }
      removeExerciseImage(ownedPhoto.current);
      ownedPhoto.current = filename;
      setPhoto(filename);
      setLibraryId(null);
      setReady(true);
    } catch {
      if (mounted.current) Alert.alert('Imagem não adicionada', 'Não foi possível carregar a imagem. Tente novamente.');
    } finally { if (mounted.current) setPicking(false); }
  }

  const selectedSource = libraryId ? exerciseImages.find((image) => image.id === libraryId)?.source
    : photo ? { uri: imageUri(photo) } : undefined;

  return (
    <View style={local.list}>
      {!state.loaded && !state.loadError && <ActivityIndicator color={workoutColors.accent} accessibilityLabel="Carregando exercícios" />}
      {state.loadError && (
        <View style={styles.card}>
          <Text style={styles.description}>Não foi possível ler os exercícios. Seus dados não foram alterados.</Text>
          <Button label="Tentar carregar novamente" onPress={() => { void loadDay(dayId); }} secondary />
        </View>
      )}
      {state.loaded && (
        <>
          <Text style={local.status} accessibilityLiveRegion="polite">{saving.error ? 'Alterações pendentes: não foi possível salvar.' : saving.pending ? 'Salvando no celular…' : 'Salvo no celular · disponível offline'}</Text>
          {saving.error && <Button label="Tentar salvar novamente" onPress={retrySaving} secondary />}
          {state.exercises.length === 0 && <Text style={styles.description}>Nenhum exercício cadastrado neste dia. Adicione o primeiro abaixo.</Text>}
          {state.exercises.map((exercise) => (
            <ExerciseCard key={exercise.id} exercise={exercise} expanded={expandedId === exercise.id} onToggle={() => toggle(exercise.id)} />
          ))}
          {adding ? (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Novo exercício</Text>
              <Text style={styles.description}>Escolha primeiro a imagem do exercício.</Text>
              {selectedSource && <ExerciseImage key={libraryId ?? photo} source={selectedSource} />}
              <Action label="Escolher da biblioteca" onPress={() => setShowLibrary(true)} disabled={picking} />
              <Action label={picking ? 'Abrindo galeria…' : 'Escolher da galeria'} onPress={() => { void selectGallery(); }} disabled={picking} />
              {!ready && <Action label="Continuar sem imagem" onPress={() => setReady(true)} disabled={picking} />}
              {ready && <>
              <TextInput accessibilityLabel="Nome do novo exercício" placeholder="Nome do exercício" placeholderTextColor={workoutColors.textSecondary}
                maxLength={100} value={name} onChangeText={setName} style={local.input}
                returnKeyType="done" editable={!picking} onSubmitEditing={() => { if (!picking) create(); }} />
              {nameError && <Text style={local.error}>Digite um nome para o exercício.</Text>}
              <Text style={styles.description}>Confira o nome antes de salvar. O exercício terá quatro séries para configurar carga e repetições.</Text>
              {!picking && <Button label="Salvar exercício" onPress={create} />}
              </>}
              <Action label="Cancelar" onPress={cancel} disabled={picking} />
            </View>
          ) : <Button label="+ Adicionar exercício" onPress={() => {
            setAdding(true);
            setShowLibrary(true);
          }} />}
        </>
      )}
      {showLibrary && <ImageLibraryModal initialId={libraryId} onSelect={selectLibrary} onClose={() => setShowLibrary(false)} />}
    </View>
  );
}

const local = StyleSheet.create({
  list: { gap: 12 },
  status: { color: workoutColors.textSecondary, fontSize: 12 },
  input: { minHeight: 48, color: workoutColors.text, borderWidth: 1, borderColor: workoutColors.borderStrong, borderRadius: 12, padding: 12, backgroundColor: workoutColors.background, fontSize: 16 },
  error: { color: '#FFB4A8' },
});
