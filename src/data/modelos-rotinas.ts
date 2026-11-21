/**
 * MODELOS EDITÁVEIS DE DIVISÃO. Sugestões de exercícios: exercicios-recomendados.ts.
 * Cada posição de sessions representa segunda a domingo; null é descanso.
 * Para acrescentar um modelo, siga o mesmo formato e use um id exclusivo.
 * Referências e limites das sugestões: docs/como-funciona-meu-treino.md.
 */
export const weekNames = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'] as const;
export type SessionModel = { name: string; muscles: string[] };
export type RoutineModel = { id: string; name: string; description: string; sessions: (SessionModel | null)[] };
const session = (name: string, ...muscles: string[]): SessionModel => ({ name, muscles });
const upper = ['Peito', 'Costas', 'Ombros', 'Bíceps', 'Tríceps'];
const lower = ['Pernas', 'Panturrilhas'];
const full = ['Peito', 'Costas', 'Ombros', 'Braços', 'Pernas'];

export const routineModels: RoutineModel[] = [
  { id: 'full-body', name: 'Full Body — Corpo inteiro', description: 'Três sessões de corpo inteiro, intercaladas com descanso.', sessions: [session('Corpo inteiro A', ...full), null, session('Corpo inteiro B', ...full), null, session('Corpo inteiro C', ...full), null, null] },
  { id: 'ab', name: 'AB — Superiores e inferiores', description: 'Duas sessões diferentes repetidas ao longo de quatro dias.', sessions: [session('Superiores A', ...upper), session('Inferiores B', ...lower), null, session('Superiores A', ...upper), session('Inferiores B', ...lower), null, null] },
  { id: 'abc', name: 'ABC — Três divisões', description: 'ABC indica três grupos de sessões. Os agrupamentos podem variar conforme sua preferência.', sessions: [session('A', 'Peito', 'Ombros', 'Tríceps'), null, session('B', 'Costas', 'Bíceps'), null, session('C', 'Pernas', 'Panturrilhas', 'Abdômen'), null, null] },
  { id: 'abcd', name: 'ABCD — Quatro divisões', description: 'Quatro sessões distribuídas entre segunda e sexta.', sessions: [session('A', 'Peito', 'Tríceps'), session('B', 'Costas', 'Bíceps'), null, session('C', 'Pernas', 'Panturrilhas'), session('D', 'Ombros', 'Abdômen'), null, null] },
  { id: 'abcde', name: 'ABCDE — Cinco divisões', description: 'Uma opção com mais dias na semana; não é uma evolução obrigatória dos outros modelos.', sessions: [session('A', 'Peito'), session('B', 'Costas'), session('C', 'Pernas'), session('D', 'Ombros'), session('E', 'Braços', 'Abdômen'), null, null] },
  { id: 'ppl', name: 'Push, Pull, Legs — Empurrar, puxar e pernas', description: 'Três sessões organizadas por padrões de movimento.', sessions: [session('Push', 'Peito', 'Ombros', 'Tríceps'), null, session('Pull', 'Costas', 'Bíceps'), null, session('Legs', 'Pernas', 'Panturrilhas'), null, null] },
  { id: 'upper-lower', name: 'Upper/Lower — Quatro dias', description: 'Duas sessões de superiores e duas de inferiores. É também a divisão inicial desta área.', sessions: [session('Superiores A', ...upper), session('Inferiores A', ...lower), null, session('Superiores B', ...upper), session('Inferiores B', ...lower), null, null] },
  { id: 'custom', name: 'Criar do zero', description: 'Escolha os dias, nomes e grupos musculares. Os sete dias começam como descanso.', sessions: [null, null, null, null, null, null, null] },
];

export const modelSources = [
  { label: 'ACSM · Diretrizes de treinamento de força (2026)', url: 'https://acsm.org/resistance-training-guidelines-update-2026/' },
  { label: 'NSCA · Frequência do treinamento de força', url: 'https://www.nsca.com/education/articles/kinetic-select/determination-of-resistance-training-frequency/' },
];
