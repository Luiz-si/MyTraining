/** DADOS das rotinas pessoais. O número weekday vai de 0 (segunda) a 6 (domingo). */
export type RoutineDay = {
  id: string; routineId: string; weekday: number; name: string; muscles: string[]; rest: boolean; exerciseCount: number;
};
export type PersonalRoutine = {
  id: string; name: string; modelId: string; createdAt: string; updatedAt: string; days: RoutineDay[];
};
export type DayInput = Pick<RoutineDay, 'name' | 'muscles' | 'rest'>;

