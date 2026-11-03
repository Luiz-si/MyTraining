/**
 * DIVISÃO SEMANAL PADRÃO
 * Define os nomes dos dias e os grupos musculares iniciais.
 * Edições feitas pelo aplicativo são salvas no banco e podem substituir estes grupos.
 * Os exercícios cadastrados ficam no banco; não são os arrays vazios deste arquivo.
 * Guia de localização: docs/onde-mexer-no-codigo.md
 */

export type Exercise = {
  id: string;
  name: string;
  sets?: number;
  repetitions?: number;
};

export type WorkoutDay = {
  id: string;
  name: string;
  muscles: readonly string[];
  exercises: readonly Exercise[];
};

// Adicione os exercícios de cada dia em sua lista "exercises".
export const weeklySplit: readonly WorkoutDay[] = [
  { id: 'segunda', name: 'Segunda-feira', muscles: ['Peito', 'Tríceps', 'Antebraço'], exercises: [] },
  { id: 'terca', name: 'Terça-feira', muscles: ['Ombro', 'Panturrilha', 'Abdômen'], exercises: [] },
  { id: 'quarta', name: 'Quarta-feira', muscles: ['Costas', 'Bíceps', 'Antebraço'], exercises: [] },
  { id: 'quinta', name: 'Quinta-feira', muscles: ['Pernas completas', 'Panturrilha', 'Abdômen'], exercises: [] },
  { id: 'sexta', name: 'Sexta-feira', muscles: ['Costas', 'Bíceps', 'Tríceps'], exercises: [] },
  { id: 'sabado', name: 'Sábado', muscles: ['Ombro', 'Antebraço', 'Abdômen'], exercises: [] },
];

export const restDay = { name: 'Domingo', description: 'Descanso' };
