/**
 * CRIAÇÃO DAS TABELAS E CONSULTAS SQL
 * Cria e consulta exercícios, grupos musculares e metadados no SQLite.
 * Edite aqui para mudar como os dados são gravados ou lidos, com cuidado com migrações.
 * A conexão com meutreino.db fica em conexao-banco.ts.
 * Guia de localização: docs/onde-mexer-no-codigo.md
 */

import type { FourSets, LocalExercise } from './tipos-e-validacao';

export type SetChange = { index: number; weight?: string | null; repetitions?: number | null };

export function exerciseKey(name: string) {
  return name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase().replace(/\s+/g, ' ');
}

// O mesmo nome pode sincronizar dias da MESMA rotina, nunca rotinas diferentes.
export function exerciseScope(dayId: string) {
  return dayId.startsWith('personal:') ? dayId.split(':').slice(0, 2).join(':') : 'creator';
}

export function applySetChanges(sets: FourSets, changes: readonly SetChange[]): FourSets {
  return sets.map((set, index) => {
    const changed = changes.find((change) => change.index === index);
    // undefined é "não alterar"; null é "limpar o campo", e precisa ser salvo.
    return changed ? { weight: changed.weight !== undefined ? changed.weight : set.weight, repetitions: changed.repetitions !== undefined ? changed.repetitions : set.repetitions } : { ...set };
  }) as FourSets;
}

// Interface pequena para permitir testar o SQL sem depender de um celular.
export interface ExerciseDatabase {
  execAsync(sql: string): Promise<void>;
  runAsync(sql: string, ...params: (string | number | null)[]): Promise<unknown>;
  getAllAsync<T>(sql: string, ...params: (string | number | null)[]): Promise<T[]>;
}

export async function initializeDatabase(db: ExerciseDatabase) {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS creator_exercises (
      id TEXT PRIMARY KEY NOT NULL,
      day_id TEXT NOT NULL,
      name TEXT NOT NULL CHECK(length(trim(name)) BETWEEN 1 AND 100),
      image_file TEXT,
      position INTEGER NOT NULL CHECK(position >= 0),
      sets_json TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS creator_exercises_day ON creator_exercises(day_id, position);
    CREATE TABLE IF NOT EXISTS creator_metadata (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS workout_day_groups (
      day_id TEXT PRIMARY KEY NOT NULL,
      muscles_json TEXT NOT NULL
    );
  `);
  const columns = await db.getAllAsync<{ name: string }>('PRAGMA table_info(creator_exercises)');
  if (!columns.some((column) => column.name === 'library_image_id')) {
    await db.execAsync('ALTER TABLE creator_exercises ADD COLUMN library_image_id TEXT');
  }
  if (!columns.some((column) => column.name === 'recommendation_id')) {
    await db.execAsync('ALTER TABLE creator_exercises ADD COLUMN recommendation_id TEXT');
  }
}

type Row = { id: string; day_id: string; name: string; image_file: string | null; library_image_id: string | null; recommendation_id: string | null; position: number; sets_json: string };

function fromRow(row: Row): LocalExercise {
  return { id: row.id, dayId: row.day_id, name: row.name,
    imageFile: row.image_file, ...(row.library_image_id ? { libraryImageId: row.library_image_id } : {}),
    ...(row.recommendation_id ? { recommendationId: row.recommendation_id } : {}),
    position: row.position, sets: JSON.parse(row.sets_json) };
}

export function createRepository(db: ExerciseDatabase) {
  const repository = {
    async loadDayGroups(): Promise<Record<string, string[]>> {
      const rows = await db.getAllAsync<{ day_id: string; muscles_json: string }>(
        'SELECT day_id, muscles_json FROM workout_day_groups');
      return Object.fromEntries(rows.map((row) => [row.day_id, JSON.parse(row.muscles_json)]));
    },
    async saveDayGroups(dayId: string, groups: readonly string[]) {
      if (!['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'].includes(dayId)) {
        throw new Error('Escolha um dia de treino válido.');
      }
      const muscles = groups.map((name) => name.trim()).filter(Boolean);
      if (!muscles.length) throw new Error('Informe pelo menos um grupo muscular.');
      if (muscles.length > 12 || muscles.some((name) => name.length > 100)) {
        throw new Error('Use até 12 grupos, com no máximo 100 caracteres em cada nome.');
      }
      await db.runAsync(`INSERT INTO workout_day_groups (day_id, muscles_json) VALUES (?, ?)
        ON CONFLICT(day_id) DO UPDATE SET muscles_json=excluded.muscles_json`,
      dayId, JSON.stringify(muscles));
      return muscles;
    },
    async load(dayId: string): Promise<LocalExercise[]> {
      const rows = await db.getAllAsync<Row>(
        'SELECT * FROM creator_exercises WHERE day_id = ? ORDER BY position, id', dayId);
      return rows.map(fromRow);
    },
    async loadAll(): Promise<LocalExercise[]> {
      // A exportação do perfil continua restrita à rotina do criador.
      const rows = await db.getAllAsync<Row>("SELECT * FROM creator_exercises WHERE day_id NOT LIKE 'personal:%' ORDER BY day_id, position, id");
      return rows.map(fromRow);
    },
    async save(exercise: LocalExercise) {
      if (exercise.dayId.startsWith('personal:')) {
        const day = await db.getAllAsync('SELECT id FROM personal_routine_days WHERE id=? AND rest=0', exercise.dayId);
        if (!day.length) throw new Error('Este dia foi removido ou está marcado como descanso.');
      }
      // Uma única gravação atômica mantém todas as séries juntas.
      await db.runAsync(`INSERT INTO creator_exercises (id, day_id, name, image_file, position, sets_json, library_image_id, recommendation_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET name=excluded.name, image_file=excluded.image_file,
        position=excluded.position, sets_json=excluded.sets_json, library_image_id=excluded.library_image_id, recommendation_id=excluded.recommendation_id
        WHERE creator_exercises.day_id=excluded.day_id`,
      exercise.id, exercise.dayId, exercise.name, exercise.imageFile, exercise.position, JSON.stringify(exercise.sets), exercise.libraryImageId ?? null, exercise.recommendationId ?? null);
    },
    async seedIfEmpty(exercises: readonly LocalExercise[]): Promise<boolean> {
      if (!exercises.length) return false;
      // Executado antes de disponibilizar o banco às telas. A transação evita carga parcial.
      await db.execAsync('BEGIN IMMEDIATE');
      try {
        const markers = await db.getAllAsync<{ value: string }>(
          "SELECT value FROM creator_metadata WHERE key = 'initial-routine'");
        if (markers.length) { await db.execAsync('COMMIT'); return false; }
        const counts = await db.getAllAsync<{ total: number }>('SELECT COUNT(*) AS total FROM creator_exercises');
        const empty = counts[0].total === 0;
        if (empty) for (const exercise of exercises) await repository.save(exercise);
        await db.runAsync("INSERT INTO creator_metadata (key, value) VALUES ('initial-routine', ?)",
          empty ? 'seeded' : 'preserved-existing');
        await db.execAsync('COMMIT');
        return empty;
      } catch (error) {
        await db.execAsync('ROLLBACK');
        throw error;
      }
    },
    async remove(dayId: string, id: string) {
      await db.runAsync('DELETE FROM creator_exercises WHERE id = ? AND day_id = ?', id, dayId);
    },
    async reorder(dayId: string, ids: string[]) {
      await db.execAsync('BEGIN IMMEDIATE');
      try {
        const current = await repository.load(dayId);
        if (new Set(ids).size !== current.length || ids.length !== current.length || current.some((item) => !ids.includes(item.id))) throw new Error('A lista de exercícios mudou. Tente novamente.');
        for (const [position, id] of ids.entries()) await db.runAsync('UPDATE creator_exercises SET position=? WHERE id=? AND day_id=?', position, id, dayId);
        await db.execAsync('COMMIT');
      } catch (error) { await db.execAsync('ROLLBACK'); throw error; }
    },
    async syncSets(name: string, changes: readonly SetChange[], dayId = 'segunda') {
      if (!changes.length) return;
      type SyncRow = { id: string; day_id: string; name: string; sets_json: string };
      const rows = exerciseScope(dayId) === 'creator'
        ? await db.getAllAsync<SyncRow>("SELECT id,day_id,name,sets_json FROM creator_exercises WHERE day_id NOT LIKE 'personal:%'")
        : await db.getAllAsync<SyncRow>(`SELECT e.id,e.day_id,e.name,e.sets_json FROM creator_exercises e
          JOIN personal_routine_days d ON d.id=e.day_id WHERE d.routine_id=?`, dayId.split(':')[1]);
      const matching = rows.filter((row) => exerciseScope(row.day_id) === exerciseScope(dayId) && exerciseKey(row.name) === exerciseKey(name));
      if (!matching.length) return;
      // Uma instrução atômica atualiza somente as séries, preservando os dados de cada dia.
      const params: (string | number | null)[] = [];
      for (const row of matching) {
        params.push(row.id, JSON.stringify(applySetChanges(JSON.parse(row.sets_json), changes)));
      }
      await db.runAsync(`UPDATE creator_exercises SET sets_json = CASE id
        ${matching.map(() => 'WHEN ? THEN ?').join(' ')} END
        WHERE id IN (${matching.map(() => '?').join(',')})`, ...params, ...matching.map((row) => row.id));
    },
  };
  return repository;
}
