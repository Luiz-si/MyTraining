/**
 * COORDENAÇÃO DOS EXERCÍCIOS E DO SALVAMENTO
 * Mantém a lista em memória e avisa os componentes quando algo muda.
 * Adiciona, edita, copia, exclui e sincroniza cargas entre exercícios do mesmo nome.
 * As gravações passam pela fila; o SQL fica em consultas-banco.ts.
 * Guia de localização: docs/onde-mexer-no-codigo.md
 */

import { useSyncExternalStore } from 'react';

import { getRepository } from './conexao-banco';
import { copyExerciseImage, removeExerciseImage } from './fotos-do-celular';
import { createExerciseCopy, emptySets, type LocalExercise, validateExercise } from './tipos-e-validacao';
import { createWriteQueue } from './fila-salvamento';
import { applySetChanges, exerciseKey, exerciseScope, type SetChange } from './consultas-banco';

type DayState = { exercises: LocalExercise[]; loaded: boolean; loading: boolean; loadError: boolean };
const emptyDay: DayState = { exercises: [], loaded: false, loading: false, loadError: false };
const days = new Map<string, DayState>();
const loadingDays = new Map<string, Promise<void>>();
const listeners = new Set<() => void>();
// Mantém edições recentes disponíveis enquanto outro dia ainda está carregando.
const sharedChanges = new Map<string, SetChange[]>();
let serial = 0;
let saveState = { pending: 0, error: false };
const queue = createWriteQueue((state) => { saveState = state; emit(); });
const enqueue = queue.enqueue;
const sharedKey = (dayId: string, name: string) => `${exerciseScope(dayId)}|${exerciseKey(name)}`;

function emit() { listeners.forEach((listener) => listener()); }
function subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; }
function setDay(dayId: string, state: DayState) { days.set(dayId, state); emit(); }

export function retrySaving() {
  queue.retry();
}

export async function waitForExerciseSaving() {
  await queue.whenSettled();
  if (saveState.error || saveState.pending) {
    throw new Error('Há alterações que ainda não foram salvas. Use “Tentar salvar novamente” na tela de exercícios antes de exportar.');
  }
}

export function loadDay(dayId: string): Promise<void> {
  const pending = loadingDays.get(dayId);
  if (pending) return pending;
  const current = days.get(dayId) ?? emptyDay;
  if (current.loaded) return Promise.resolve();
  setDay(dayId, { ...current, loading: true, loadError: false });
  const loading = (async () => {
  try {
    const exercises = (await (await getRepository()).load(dayId)).map((exercise) => ({
      ...exercise, sets: applySetChanges(exercise.sets, sharedChanges.get(sharedKey(dayId, exercise.name)) ?? []),
    }));
    exercises.forEach(validateExercise);
    setDay(dayId, { exercises, loaded: true, loading: false, loadError: false });
  } catch {
    setDay(dayId, { ...current, loading: false, loadError: true });
  }
  })().finally(() => { loadingDays.delete(dayId); });
  loadingDays.set(dayId, loading);
  return loading;
}

export function useExercises(dayId: string) {
  return useSyncExternalStore(subscribe, () => days.get(dayId) ?? emptyDay, () => emptyDay);
}
export function useSaveState() { return useSyncExternalStore(subscribe, () => saveState, () => saveState); }

export function addExercise(dayId: string, name: string, image: {
  imageFile?: string | null;
  libraryImageId?: string | null;
} = {}): string {
  const state = days.get(dayId);
  if (!state?.loaded) throw new Error('Aguarde o carregamento do treino.');
  const exercise: LocalExercise = {
    id: `${Date.now().toString(36)}-${++serial}-${Math.random().toString(36).slice(2)}`,
    dayId, name: name.trim(), imageFile: image.imageFile ?? null,
    libraryImageId: image.libraryImageId ?? null,
    position: Math.max(-1, ...state.exercises.map((item) => item.position)) + 1,
    sets: applySetChanges(emptySets(dayId.startsWith('personal:')), sharedChanges.get(sharedKey(dayId, name)) ?? []),
  };
  validateExercise(exercise);
  setDay(dayId, { ...state, exercises: [...state.exercises, exercise] });
  enqueue(async () => { await (await getRepository()).save(exercise); });
  return exercise.id;
}

// Sempre lê o estado mais recente: toques rápidos não usam valores antigos da tela.
export function updateExercise(dayId: string, id: string, change: (exercise: LocalExercise) => LocalExercise) {
  const state = days.get(dayId);
  const current = state?.exercises.find((item) => item.id === id);
  if (!state || !current) return false;
  const next = change(current);
  validateExercise(next);
  const changes: SetChange[] = next.sets.flatMap((set, index) => {
    const previous = current.sets[index];
    if (!previous) return [];
    const patch: SetChange = { index };
    if (set.weight !== previous.weight) patch.weight = set.weight;
    if (set.repetitions !== previous.repetitions) patch.repetitions = set.repetitions;
    return patch.weight !== undefined || patch.repetitions !== undefined ? [patch] : [];
  });
  days.set(dayId, { ...state, exercises: state.exercises.map((item) => item.id === id ? next : item) });
  if (changes.length) {
    const key = sharedKey(dayId, next.name);
    const merged = new Map((sharedChanges.get(key) ?? []).map((patch) => [patch.index, patch]));
    changes.forEach((patch) => merged.set(patch.index, { ...merged.get(patch.index), ...patch }));
    sharedChanges.set(key, [...merged.values()]);
    for (const [otherDay, otherState] of days) {
      days.set(otherDay, { ...otherState, exercises: otherState.exercises.map((item) =>
        sharedKey(otherDay, item.name) === key ? { ...item, sets: applySetChanges(item.sets, changes) } : item) });
    }
  }
  emit();
  enqueue(async () => {
    const repository = await getRepository();
    await repository.save(next);
    await repository.syncSets(next.name, changes, dayId);
    if (current.imageFile !== next.imageFile) removeExerciseImage(current.imageFile);
  });
  return true;
}

export function deleteExercise(dayId: string, id: string) {
  const state = days.get(dayId);
  const exercise = state?.exercises.find((item) => item.id === id);
  if (!state || !exercise) return;
  setDay(dayId, { ...state, exercises: state.exercises.filter((item) => item.id !== id) });
  enqueue(async () => {
    await (await getRepository()).remove(dayId, id);
    removeExerciseImage(exercise.imageFile);
  });
}

export async function copyExercise(sourceDayId: string, id: string, targetDayId: string) {
  if (exerciseScope(sourceDayId) !== exerciseScope(targetDayId)) throw new Error('Escolha outro dia da mesma rotina.');
  await loadDay(targetDayId);
  const source = days.get(sourceDayId)?.exercises.find((item) => item.id === id);
  const destination = days.get(targetDayId);
  if (!source || !destination?.loaded) throw new Error('Não foi possível carregar o exercício ou o dia escolhido. Tente novamente.');
  const alreadyExists = () => days.get(targetDayId)?.exercises.some((item) => exerciseKey(item.name) === exerciseKey(source.name));
  if (alreadyExists()) throw new Error('Esse exercício já está cadastrado no dia escolhido.');
  let copiedFile: string | null = null;
  try {
    // Fotos da galeria recebem uma cópia própria para não sumirem ao excluir o original.
    copiedFile = source.imageFile ? await copyExerciseImage(source.imageFile) : null;
    if (alreadyExists()) throw new Error('Esse exercício já está cadastrado no dia escolhido.');
    const latestDestination = days.get(targetDayId)!;
    const copied = createExerciseCopy(source,
      `${Date.now().toString(36)}-${++serial}-${Math.random().toString(36).slice(2)}`,
      targetDayId, Math.max(-1, ...latestDestination.exercises.map((item) => item.position)) + 1, copiedFile);
    copied.sets = applySetChanges(copied.sets, sharedChanges.get(sharedKey(targetDayId, copied.name)) ?? []);
    validateExercise(copied);
    setDay(targetDayId, { ...latestDestination, exercises: [...latestDestination.exercises, copied] });
    enqueue(async () => { await (await getRepository()).save(copied); });
    return copied.id;
  } catch (error) {
    removeExerciseImage(copiedFile);
    throw error;
  }
}

// Após excluir/duplicar uma rotina, remove apenas seu cache. O SQLite é a fonte definitiva.
export function forgetRoutineDays(dayIds: string[]) {
  dayIds.forEach((id) => days.delete(id));
  for (const key of sharedChanges.keys()) {
    if (dayIds.some((id) => key.startsWith(`${exerciseScope(id)}|`))) sharedChanges.delete(key);
  }
  emit();
}

// Move apenas dentro do dia escolhido, sem alterar cargas ou os outros dias.
export function moveExercise(dayId: string, id: string, direction: -1 | 1) {
  const state = days.get(dayId);
  if (!state?.loaded) return;
  const exercises = [...state.exercises];
  const from = exercises.findIndex((exercise) => exercise.id === id);
  const to = from + direction;
  if (from < 0 || to < 0 || to >= exercises.length) return;
  [exercises[from], exercises[to]] = [exercises[to], exercises[from]];
  setDay(dayId, { ...state, exercises: exercises.map((item, position) => ({ ...item, position })) });
  enqueue(async () => (await getRepository()).reorder(dayId, exercises.map((item) => item.id)));
}
