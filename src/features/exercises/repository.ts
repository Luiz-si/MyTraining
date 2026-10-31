import type { FourSets, LocalExercise } from './model';

export type SetChange = { index: number; weight?: string; repetitions?: number };

export function exerciseKey(name: string) {
  return name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase().replace(/\s+/g, ' ');
}

export function applySetChanges(sets: FourSets, changes: readonly SetChange[]): FourSets {
  return sets.map((set, index) => {
    const changed = changes.find((change) => change.index === index);
    return changed ? { weight: changed.weight ?? set.weight, repetitions: changed.repetitions ?? set.repetitions } : { ...set };
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
  `);
  const columns = await db.getAllAsync<{ name: string }>('PRAGMA table_info(creator_exercises)');
  if (!columns.some((column) => column.name === 'library_image_id')) {
    await db.execAsync('ALTER TABLE creator_exercises ADD COLUMN library_image_id TEXT');
  }
}

type Row = { id: string; day_id: string; name: string; image_file: string | null; library_image_id: string | null; position: number; sets_json: string };

function fromRow(row: Row): LocalExercise {
  return { id: row.id, dayId: row.day_id, name: row.name,
    imageFile: row.image_file, ...(row.library_image_id ? { libraryImageId: row.library_image_id } : {}),
    position: row.position, sets: JSON.parse(row.sets_json) };
}

export function createRepository(db: ExerciseDatabase) {
  const repository = {
    async load(dayId: string): Promise<LocalExercise[]> {
      const rows = await db.getAllAsync<Row>(
        'SELECT * FROM creator_exercises WHERE day_id = ? ORDER BY position, id', dayId);
      return rows.map(fromRow);
    },
    async loadAll(): Promise<LocalExercise[]> {
      const rows = await db.getAllAsync<Row>('SELECT * FROM creator_exercises ORDER BY day_id, position, id');
      return rows.map(fromRow);
    },
    async save(exercise: LocalExercise) {
      // Uma única gravação atômica mantém as quatro séries juntas.
      await db.runAsync(`INSERT INTO creator_exercises (id, day_id, name, image_file, position, sets_json, library_image_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET name=excluded.name, image_file=excluded.image_file,
        position=excluded.position, sets_json=excluded.sets_json, library_image_id=excluded.library_image_id
        WHERE creator_exercises.day_id=excluded.day_id`,
      exercise.id, exercise.dayId, exercise.name, exercise.imageFile, exercise.position, JSON.stringify(exercise.sets), exercise.libraryImageId ?? null);
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
    async syncSets(name: string, changes: readonly SetChange[]) {
      if (!changes.length) return;
      const rows = await db.getAllAsync<{ id: string; name: string; sets_json: string }>(
        'SELECT id, name, sets_json FROM creator_exercises');
      const matching = rows.filter((row) => exerciseKey(row.name) === exerciseKey(name));
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
