/**
 * SUGESTÕES EDITÁVEIS DOS MODELOS, sem pesos ou repetições prescritos.
 * imageId é o ID EXATO do catálogo gerado: não procuramos por semelhança de nome.
 * Os arquivos de início e fim permanecem na biblioteca; o cartão usa a posição inicial.
 * Para mudar uma sessão, edite a lista de IDs em recommendationsByModel abaixo.
 */
export type RecommendedExercise = { id: string; name: string; muscles: string; imageId: string };
export type RoutineSuggestion = Omit<RecommendedExercise, 'imageId'> & { imageId: string | null };
export const recommendedExercises: Record<string, RecommendedExercise> = {
  supino: { id: 'supino', name: 'Supino reto', muscles: 'Peito', imageId: 'bench-press-start.webp' },
  inclinado: { id: 'inclinado', name: 'Supino inclinado com halteres', muscles: 'Peito', imageId: 'incline-db-press-start.webp' },
  crucifixo: { id: 'crucifixo', name: 'Crucifixo com halteres', muscles: 'Peito', imageId: 'db-fly-start.webp' },
  desenvolvimento: { id: 'desenvolvimento', name: 'Desenvolvimento com halteres', muscles: 'Ombros', imageId: 'dumbbell-shoulder-press-start.webp' },
  lateral: { id: 'lateral', name: 'Elevação lateral', muscles: 'Ombros', imageId: 'lateral-raise-start.webp' },
  inverso: { id: 'inverso', name: 'Crucifixo inverso com halteres', muscles: 'Ombros posteriores', imageId: 'dumbbell-reverse-fly-start.webp' },
  facepull: { id: 'facepull', name: 'Face pull', muscles: 'Ombros posteriores e costas', imageId: 'face-pull-start.webp' },
  triceps: { id: 'triceps', name: 'Tríceps na polia', muscles: 'Tríceps', imageId: 'tricep-pushdown-start.webp' },
  puxada: { id: 'puxada', name: 'Puxada frontal', muscles: 'Costas', imageId: 'lat-pulldown-start.webp' },
  remada: { id: 'remada', name: 'Remada baixa na polia', muscles: 'Costas', imageId: 'seated-cable-row-start.webp' },
  unilateral: { id: 'unilateral', name: 'Remada unilateral com halter', muscles: 'Costas', imageId: 'single-arm-db-row-start.webp' },
  rosca: { id: 'rosca', name: 'Rosca direta com barra', muscles: 'Bíceps', imageId: 'barbell-curl-start.webp' },
  martelo: { id: 'martelo', name: 'Rosca martelo', muscles: 'Bíceps e antebraços', imageId: 'hammer-curl-start.webp' },
  agachamento: { id: 'agachamento', name: 'Agachamento taça com halter', muscles: 'Pernas e glúteos', imageId: 'db-goblet-squat-start.webp' },
  legpress: { id: 'legpress', name: 'Leg press', muscles: 'Pernas', imageId: 'leg-press-start.webp' },
  extensora: { id: 'extensora', name: 'Cadeira extensora', muscles: 'Quadríceps', imageId: 'leg-extension-start.webp' },
  flexora: { id: 'flexora', name: 'Mesa flexora', muscles: 'Posteriores de coxa', imageId: 'leg-curl-start.webp' },
  romeno: { id: 'romeno', name: 'Levantamento romeno com halteres', muscles: 'Posteriores de coxa e glúteos', imageId: 'dumbbell-romanian-deadlift-start.webp' },
  ponte: { id: 'ponte', name: 'Ponte de glúteos', muscles: 'Glúteos', imageId: 'glute-bridge-start.webp' },
  panturrilha: { id: 'panturrilha', name: 'Panturrilha em pé com peso corporal', muscles: 'Panturrilhas', imageId: 'bodyweight-calf-raise-start.webp' },
  panturrilhaSentada: { id: 'panturrilhaSentada', name: 'Panturrilha sentada', muscles: 'Panturrilhas', imageId: 'seated-calf-raise-start.webp' },
  abdomen: { id: 'abdomen', name: 'Abdominal dead bug', muscles: 'Abdômen', imageId: 'dead-bug-start.webp' },
};

const upperA = ['supino', 'puxada', 'lateral', 'rosca', 'triceps'];
const upperB = ['inclinado', 'remada', 'desenvolvimento', 'martelo', 'facepull'];
const lowerA = ['agachamento', 'flexora', 'ponte', 'panturrilha'];
const lowerB = ['legpress', 'romeno', 'extensora', 'panturrilhaSentada'];
const push = ['supino', 'inclinado', 'crucifixo', 'desenvolvimento', 'lateral', 'triceps'];
const pull = ['puxada', 'remada', 'unilateral', 'rosca', 'martelo'];
const legs = ['agachamento', 'legpress', 'extensora', 'flexora', 'panturrilha'];

// Sete listas por modelo: segunda a domingo. Descanso sempre recebe lista vazia.
export const recommendationsByModel: Record<string, readonly (readonly string[])[]> = {
  'full-body': [['agachamento', 'supino', 'remada', 'abdomen'], [], ['legpress', 'inclinado', 'puxada', 'ponte'], [], ['romeno', 'desenvolvimento', 'unilateral', 'panturrilha', 'abdomen'], [], []],
  ab: [upperA, lowerA, [], upperB, lowerB, [], []],
  abc: [push, [], pull, [], [...legs, 'abdomen'], [], []],
  abcd: [['supino', 'inclinado', 'crucifixo', 'triceps'], ['puxada', 'remada', 'rosca', 'martelo'], [], legs, ['desenvolvimento', 'lateral', 'inverso', 'abdomen'], [], []],
  abcde: [['supino', 'inclinado', 'crucifixo'], ['puxada', 'remada', 'unilateral'], ['agachamento', 'legpress', 'flexora', 'romeno', 'extensora'], ['desenvolvimento', 'lateral', 'inverso'], ['rosca', 'martelo', 'triceps', 'abdomen'], [], []],
  ppl: [push, [], pull, [], legs, [], []],
  'upper-lower': [upperA, lowerA, [], upperB, lowerB, [], []],
  custom: [[], [], [], [], [], [], []],
};

export function getModelRecommendations(modelId: string): RecommendedExercise[][] {
  return (recommendationsByModel[modelId] ?? [[], [], [], [], [], [], []]).map((ids) => ids.map((id) => {
    const exercise = recommendedExercises[id];
    if (!exercise) throw new Error(`Sugestão não cadastrada: ${id}`);
    return { ...exercise };
  }));
}

// Se um arquivo sair da biblioteca, mantém o exercício com o placeholder existente.
// Nunca troca silenciosamente por uma imagem de outro movimento.
export function prepareModelRecommendations(modelId: string, available: ReadonlySet<string>): RoutineSuggestion[][] {
  return getModelRecommendations(modelId).map((day) => day.map((exercise) => ({
    ...exercise, imageId: available.has(exercise.imageId) ? exercise.imageId : null,
  })));
}
