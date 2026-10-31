import { useEffect, useSyncExternalStore } from 'react';

import { weeklySplit, type WorkoutDay } from '@/data/workouts';
import { getRepository } from '@/features/exercises/database';

// As duas telas consultam a mesma lista, atualizada só depois de gravar no banco.
type State = { days: readonly WorkoutDay[]; loaded: boolean; error: string | null };
let state: State = { days: weeklySplit, loaded: false, error: null };
const listeners = new Set<() => void>();
let loading: Promise<void> | undefined;

function publish(next: State) {
  state = next;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

export function loadWeeklySplit(): Promise<void> {
  if (state.loaded) return Promise.resolve();
  if (loading) return loading;
  publish({ ...state, error: null });
  loading = (async () => {
    const repository = await getRepository();
    const groups = await repository.loadDayGroups();
    publish({
      days: weeklySplit.map((day) => ({ ...day, muscles: groups[day.id] ?? day.muscles })),
      loaded: true,
      error: null,
    });
  })().catch((error) => {
    publish({ ...state, error: 'Não foi possível carregar sua divisão. Tente novamente.' });
    throw error;
  }).finally(() => { loading = undefined; });
  return loading;
}

export async function saveDayMuscles(dayId: string, text: string) {
  await loadWeeklySplit();
  const repository = await getRepository();
  const muscles = await repository.saveDayGroups(dayId, text.split(','));
  publish({
    ...state,
    days: state.days.map((day) => day.id === dayId ? { ...day, muscles } : day),
  });
}

export function useWeeklySplit() {
  const snapshot = useSyncExternalStore(subscribe, () => state, () => state);
  useEffect(() => { void loadWeeklySplit().catch(() => {}); }, []);
  return snapshot;
}
