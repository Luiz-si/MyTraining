/**
 * FORMATO E VALIDAÇÃO DOS DADOS DOS EXERCÍCIOS
 * Define LocalExercise, as quatro séries, cargas e repetições.
 * Também contém regras para valores válidos, contas decimais e cópias.
 * Não desenha nenhuma tela.
 * Guia de localização: docs/onde-mexer-no-codigo.md
 */

export type ExerciseSet = { weight: string; repetitions: number };
export type FourSets = [ExerciseSet, ExerciseSet, ExerciseSet, ExerciseSet];
export type LocalExercise = {
  id: string;
  dayId: string;
  name: string;
  imageFile: string | null;
  libraryImageId?: string | null;
  position: number;
  sets: FourSets;
};

export function emptySets(): FourSets {
  return Array.from({ length: 4 }, () => ({ weight: '0', repetitions: 0 })) as FourSets;
}

export function createExerciseCopy(source: LocalExercise, id: string, dayId: string, position: number,
  imageFile: string | null): LocalExercise {
  return { ...source, id, dayId, position, imageFile,
    sets: source.sets.map((set) => ({ ...set })) as FourSets };
}

// Cargas são textos decimais: isso evita arredondamentos como 0.1 + 1 = 1.1000000001.
export function parseWeight(input: string): string | null {
  const normalized = input.trim().replace(',', '.');
  if (!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalized) || normalized.length > 24) return null;
  const [whole, fraction = ''] = normalized.split('.');
  const integer = (whole || '0').replace(/^0+(?=\d)/, '');
  const decimal = fraction.replace(/0+$/, '');
  return decimal ? `${integer}.${decimal}` : integer;
}

export function stepWeight(weight: string, delta: 1 | -1): string {
  const normalized = parseWeight(weight);
  if (normalized === null) throw new Error('Carga inválida');
  const [whole, fraction = ''] = normalized.split('.');
  const scale = BigInt(10) ** BigInt(fraction.length);
  const next = BigInt(whole + fraction) + BigInt(delta) * scale;
  if (next <= BigInt(0)) return '0';
  const digits = next.toString().padStart(fraction.length + 1, '0');
  const text = fraction.length ? `${digits.slice(0, -fraction.length)}.${digits.slice(-fraction.length)}` : digits;
  return parseWeight(text) ?? normalized;
}

export function parseRepetitions(input: string): number | null {
  if (!/^\d+$/.test(input.trim())) return null;
  const number = Number(input);
  return Number.isSafeInteger(number) && number >= 0 ? number : null;
}

export function validateExercise(exercise: LocalExercise) {
  if (!exercise.id || !exercise.dayId || !exercise.name.trim() || exercise.name.length > 100 ||
    (exercise.libraryImageId != null && (typeof exercise.libraryImageId !== 'string' || !exercise.libraryImageId || exercise.imageFile !== null)) ||
    (exercise.imageFile !== null && !/^[\w.-]+$/.test(exercise.imageFile)) ||
    !Number.isSafeInteger(exercise.position) || exercise.position < 0 || exercise.sets.length !== 4 ||
    !exercise.sets.every((set) => typeof set.weight === 'string' && parseWeight(set.weight) !== null &&
      Number.isSafeInteger(set.repetitions) && set.repetitions >= 0)) {
    throw new Error('Dados do exercício inválidos');
  }
}
