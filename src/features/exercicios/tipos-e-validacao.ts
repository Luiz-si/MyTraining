/**
 * FORMATO E VALIDAÇÃO DOS DADOS DOS EXERCÍCIOS
 * Define LocalExercise, as quatro séries, cargas e repetições.
 * Também contém regras para valores válidos, contas decimais e cópias.
 * Não desenha nenhuma tela.
 * Guia de localização: docs/onde-mexer-no-codigo.md
 */

// null significa "ainda não preenchido". Zero continua sendo um valor explícito válido.
export type ExerciseSet = { weight: string | null; repetitions: number | null };
// Nome antigo preservado por compatibilidade; rotinas pessoais aceitam 1 a 12 séries.
export type FourSets = ExerciseSet[];
export type LocalExercise = {
  id: string;
  dayId: string;
  name: string;
  imageFile: string | null;
  libraryImageId?: string | null;
  recommendationId?: string | null;
  position: number;
  sets: FourSets;
};

export function emptySets(unfilled = false): FourSets {
  return Array.from({ length: 4 }, () => ({ weight: unfilled ? null : '0', repetitions: unfilled ? null : 0 }));
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

export function stepWeight(weight: string | null, delta: 1 | -1): string | null {
  if (weight === null) return delta > 0 ? '1' : null;
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

export function stepRepetitions(value: number | null, delta: 1 | -1): number | null {
  if (value === null) return delta > 0 ? 1 : null;
  return Math.min(Number.MAX_SAFE_INTEGER, Math.max(0, value + delta));
}

export function validateExercise(exercise: LocalExercise) {
  const personal = exercise.dayId.startsWith('personal:');
  if (!exercise.id || !exercise.dayId || !exercise.name.trim() || exercise.name.length > 100 ||
    (exercise.libraryImageId != null && (typeof exercise.libraryImageId !== 'string' || !exercise.libraryImageId || exercise.imageFile !== null)) ||
    (exercise.imageFile !== null && !/^[\w.-]+$/.test(exercise.imageFile)) ||
    !Number.isSafeInteger(exercise.position) || exercise.position < 0 ||
    (exercise.dayId.startsWith('personal:') ? exercise.sets.length < 1 || exercise.sets.length > 12 : exercise.sets.length !== 4) ||
    !exercise.sets.every((set) => (personal && set.weight === null || typeof set.weight === 'string' && parseWeight(set.weight) !== null) &&
      (personal && set.repetitions === null || typeof set.repetitions === 'number' && Number.isSafeInteger(set.repetitions) && set.repetitions >= 0))) {
    throw new Error('Dados do exercício inválidos');
  }
}
