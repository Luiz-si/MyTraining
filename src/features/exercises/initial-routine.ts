import routine from '@/data/creator-routine.json';
import { exerciseImages } from '@/data/exercise-images.generated';
import { weeklySplit } from '@/data/workouts';

import { type LocalExercise, validateExercise } from './model';

export function getInitialRoutine(): LocalExercise[] {
  if (routine.format !== 'meutreino-routine' || routine.version !== 1) throw new Error('Formato inválido da rotina inicial.');
  const ids = new Set<string>();
  const libraryIds = new Set(exerciseImages.map((image) => image.id));
  const days = new Set(weeklySplit.map((day) => day.id));
  return routine.exercises.map((item) => {
    const exercise = item as LocalExercise;
    validateExercise(exercise);
    if (ids.has(exercise.id) || !days.has(exercise.dayId) || exercise.imageFile !== null ||
      (exercise.libraryImageId && !libraryIds.has(exercise.libraryImageId))) {
      throw new Error('A rotina inicial possui dados ou imagens inconsistentes.');
    }
    ids.add(exercise.id);
    return exercise;
  });
}
