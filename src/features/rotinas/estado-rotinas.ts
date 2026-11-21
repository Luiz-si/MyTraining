/**
 * ESTADO DAS ROTINAS: liga as telas ao banco, trata erros e impede ações duplicadas.
 * Só atualiza os cartões depois que o SQLite confirma o salvamento.
 * Fotos duplicadas recebem arquivos próprios; excluir a original não quebra a cópia.
 */
import { useSyncExternalStore } from 'react';
import { getRepository, getRoutineRepository } from '../exercicios/conexao-banco';
import { forgetRoutineDays, waitForExerciseSaving } from '../exercicios/estado-exercicios';
import { copyExerciseImage, removeExerciseImage } from '../exercicios/fotos-do-celular';
import { routineModels } from '@/data/modelos-rotinas';
import { prepareModelRecommendations } from '@/data/exercicios-recomendados';
import { exerciseImages } from '@/data/exercise-images.generated';
import type { DayInput, PersonalRoutine } from './tipos-rotina';

let state = { routines: [] as PersonalRoutine[], loaded: false, loading: false, busy: false, error: '' };
const listeners = new Set<() => void>();
function publish(change: Partial<typeof state>) { state = { ...state, ...change }; listeners.forEach((listener) => listener()); }
function subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; }
export function useRoutines() { return useSyncExternalStore(subscribe, () => state, () => state); }
let loading: Promise<void> | null = null;

export function loadRoutines() {
  if (loading) return loading;
  publish({ loading: true, error: '' });
  loading = (async () => {
    try {
      await waitForExerciseSaving();
      publish({ routines: await (await getRoutineRepository()).list(), loaded: true });
    } catch { publish({ error: 'Não foi possível carregar as rotinas. Seus dados não foram apagados.' }); }
    finally { loading = null; publish({ loading: false }); }
  })();
  return loading;
}

async function mutate<T>(action: () => Promise<T>): Promise<T> {
  if (state.busy) throw new Error('Aguarde o salvamento em andamento.');
  publish({ busy: true, error: '' });
  try {
    await waitForExerciseSaving();
    const result = await action();
    // Não confunde uma falha de releitura com falha na criação (evita duplicar ao tentar novamente).
    try { publish({ routines: await (await getRoutineRepository()).list(), loaded: true }); }
    catch { publish({ error: 'Alteração salva. Use Atualizar para reler as rotinas.' }); }
    return result;
  } finally { publish({ busy: false }); }
}

export function createRoutine(name: string, modelId: string, withExercises = false) {
  return mutate(async () => {
    const model = routineModels.find((item) => item.id === modelId);
    if (!model) throw new Error('Escolha um modelo disponível.');
    const suggestions = withExercises
      ? prepareModelRecommendations(modelId, new Set(exerciseImages.map((image) => image.id))) : undefined;
    return (await getRoutineRepository()).create(name, model, suggestions);
  });
}
export function renameRoutine(id: string, name: string) { return mutate(async () => (await getRoutineRepository()).rename(id, name)); }
export function saveRoutineDay(id: string, dayId: string, data: DayInput) {
  return mutate(async () => (await getRoutineRepository()).saveDay(id, dayId, data));
}
export function deleteRoutine(id: string) {
  return mutate(async () => {
    const routine = state.routines.find((item) => item.id === id);
    const files = await (await getRoutineRepository()).remove(id);
    if (routine) forgetRoutineDays(routine.days.map((day) => day.id));
    const remaining = state.routines.filter((item) => item.id !== id);
    // A exclusão já foi confirmada: não exibe o cartão removido se a releitura falhar.
    publish({ routines: remaining });
    files.forEach(removeExerciseImage);
  });
}
export function duplicateRoutine(id: string, name: string) {
  return mutate(async () => {
    const routines = await getRoutineRepository();
    const original = (await routines.list()).find((item) => item.id === id);
    if (!original) throw new Error('Rotina não encontrada.');
    const exercises = await getRepository();
    const copies: { sourceId: string; id: string; imageFile: string | null }[] = [];
    try {
      for (const day of original.days) {
        for (const exercise of await exercises.load(day.id)) {
          copies.push({ sourceId: exercise.id, id: `copy-${Date.now().toString(36)}-${copies.length}-${Math.random().toString(36).slice(2)}`,
            imageFile: exercise.imageFile ? await copyExerciseImage(exercise.imageFile) : null });
        }
      }
      return await routines.duplicate(id, name, copies);
    } catch (error) { copies.forEach((copy) => removeExerciseImage(copy.imageFile)); throw error; }
  });
}
