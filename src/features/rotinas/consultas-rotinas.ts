/**
 * SQLITE DAS ROTINAS PESSOAIS. Usa o mesmo meutreino.db do aplicativo.
 * Os exercícios continuam na tabela existente, ligados a dias com IDs personal:…
 * Transações são executadas pela conexão serializada: nada é salvo pela metade.
 * Nenhuma consulta altera os dias antigos da rotina do criador.
 */
import type { RoutineModel } from '../../data/modelos-rotinas';
import type { ExerciseDatabase } from '../exercicios/consultas-banco';
import type { DayInput, PersonalRoutine, RoutineDay } from './tipos-rotina';
import type { RoutineSuggestion } from '../../data/exercicios-recomendados';

// EDITE AQUI: nome da rotina pré-definida. Também atualiza o nome antigo salvo no celular.
export const DEFAULT_ROUTINE_NAME = 'Minha divisão semanal     (pré-definida)';

// Valida antes de gravar para não deixar sessões vazias ou nomes exagerados.
export function validateDay(input: DayInput): DayInput {
  const name = input.name.trim();
  const muscles = input.muscles.map((value) => value.trim()).filter(Boolean);
  if (typeof input.rest !== 'boolean' || name.length > 100 || (!input.rest && !name)) throw new Error('Informe um nome de sessão com até 100 caracteres.');
  if (muscles.length > 12 || muscles.some((value) => value.length > 100) || (!input.rest && !muscles.length)) throw new Error('Informe de 1 a 12 grupos musculares, com até 100 caracteres cada.');
  return { name: name || 'Descanso', muscles, rest: input.rest };
}

function validateRoutineName(value: string) {
  const name = value.trim();
  if (!name || name.length > 100) throw new Error('Informe um nome para a rotina, com até 100 caracteres.');
  return name;
}

export async function initializeRoutines(db: ExerciseDatabase) {
  // A coluna antiga active fica apenas por compatibilidade com bancos já instalados.
  // Ela não é mais lida, escolhida ou atualizada pelo aplicativo.
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS personal_routines (
      id TEXT PRIMARY KEY NOT NULL, name TEXT NOT NULL, model_id TEXT NOT NULL,
      created_at TEXT NOT NULL, updated_at TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 0 CHECK(active IN (0,1))
    );
    CREATE UNIQUE INDEX IF NOT EXISTS one_active_personal_routine ON personal_routines(active) WHERE active=1;
    CREATE TABLE IF NOT EXISTS personal_routine_days (
      id TEXT PRIMARY KEY NOT NULL, routine_id TEXT NOT NULL REFERENCES personal_routines(id),
      weekday INTEGER NOT NULL CHECK(weekday BETWEEN 0 AND 6), name TEXT NOT NULL,
      muscles_json TEXT NOT NULL, rest INTEGER NOT NULL CHECK(rest IN (0,1)), UNIQUE(routine_id, weekday)
    );
    CREATE INDEX IF NOT EXISTS personal_days_routine ON personal_routine_days(routine_id);
    CREATE TRIGGER IF NOT EXISTS personal_exercise_inserted AFTER INSERT ON creator_exercises BEGIN
      UPDATE personal_routines SET updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now')
      WHERE id=(SELECT routine_id FROM personal_routine_days WHERE id=NEW.day_id);
    END;
    CREATE TRIGGER IF NOT EXISTS personal_exercise_updated AFTER UPDATE ON creator_exercises BEGIN
      UPDATE personal_routines SET updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now')
      WHERE id=(SELECT routine_id FROM personal_routine_days WHERE id=NEW.day_id);
    END;
    CREATE TRIGGER IF NOT EXISTS personal_exercise_deleted AFTER DELETE ON creator_exercises BEGIN
      UPDATE personal_routines SET updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now')
      WHERE id=(SELECT routine_id FROM personal_routine_days WHERE id=OLD.day_id);
    END;
  `);
}

type RoutineRow = { id: string; name: string; model_id: string; created_at: string; updated_at: string };
type DayRow = { id: string; routine_id: string; weekday: number; name: string; muscles_json: string; rest: number; exercise_count: number };

export function createRoutineRepository(db: ExerciseDatabase, makeId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`, defaultName = DEFAULT_ROUTINE_NAME) {
  // Todas as etapas se confirmam juntas ou são desfeitas se houver falha.
  async function transaction<T>(action: () => Promise<T>): Promise<T> {
    await db.execAsync('BEGIN IMMEDIATE');
    try { const result = await action(); await db.execAsync('COMMIT'); return result; }
    catch (error) { await db.execAsync('ROLLBACK'); throw error; }
  }
  async function exists(id: string) {
    const rows = await db.getAllAsync<{ id: string }>('SELECT id FROM personal_routines WHERE id=?', id);
    if (!rows.length) throw new Error('Esta rotina não está mais disponível.');
  }
  async function insert(name: string, model: RoutineModel, recommendations?: readonly (readonly RoutineSuggestion[])[]) {
    if (model.sessions.length !== 7) throw new Error('O modelo precisa conter os sete dias.');
    if (recommendations && recommendations.length !== 7) throw new Error('As sugestões precisam conter os sete dias.');
    const id = makeId();
    const stamp = new Date().toISOString();
    await db.runAsync('INSERT INTO personal_routines(id,name,model_id,created_at,updated_at) VALUES(?,?,?,?,?)', id, validateRoutineName(name), model.id, stamp, stamp);
    for (let weekday = 0; weekday < 7; weekday++) {
      const session = model.sessions[weekday];
      const day = validateDay({ name: session?.name ?? 'Descanso', muscles: session?.muscles ?? [], rest: session === null });
      await db.runAsync('INSERT INTO personal_routine_days(id,routine_id,weekday,name,muscles_json,rest) VALUES(?,?,?,?,?,?)',
        `personal:${id}:${weekday}`, id, weekday, day.name, JSON.stringify(day.muscles), Number(day.rest));
      const suggestions = recommendations?.[weekday] ?? [];
      if (day.rest && suggestions.length) throw new Error('Um dia de descanso não pode receber exercícios automáticos.');
      if (new Set(suggestions.map((exercise) => exercise.id)).size !== suggestions.length) throw new Error('Há sugestões repetidas no mesmo dia.');
      // Executado somente na criação, dentro da transação. Não consulta cargas de outras rotinas.
      for (const [position, exercise] of suggestions.entries()) {
        const sets = Array.from({ length: 4 }, () => ({ weight: null, repetitions: null }));
        if (!exercise.id || exercise.imageId !== null && !exercise.imageId) throw new Error('Sugestão ou imagem inválida.');
        await db.runAsync(`INSERT INTO creator_exercises(id,day_id,name,image_file,position,sets_json,library_image_id,recommendation_id)
          VALUES(?,?,?,NULL,?,?,?,?)`, `suggested:${id}:${weekday}:${position}`, `personal:${id}:${weekday}`,
          validateRoutineName(exercise.name), position, JSON.stringify(sets), exercise.imageId, exercise.id);
      }
    }
    return id;
  }
  type DefaultIdentity = { id: string; lastName: string; customized?: boolean } | null;
  async function rememberDefault(identity: DefaultIdentity) {
    await db.runAsync(`INSERT INTO creator_metadata(key,value) VALUES('personal-default-identity',?)
      ON CONFLICT(key) DO UPDATE SET value=excluded.value`, JSON.stringify(identity));
  }
  async function getDefaultIdentity(): Promise<DefaultIdentity | undefined> {
    const rows = await db.getAllAsync<{ value: string }>("SELECT value FROM creator_metadata WHERE key='personal-default-identity'");
    return rows.length ? JSON.parse(rows[0].value) : undefined;
  }
  // Reconhece uma instalação antiga uma única vez. Depois acompanha apenas o ID original.
  // Um nome personalizado, uma cópia ou uma rotina excluída não é substituída/recriada.
  async function syncDefaultName() {
    const desired = validateRoutineName(defaultName);
    let identity = await getDefaultIdentity();
    if (identity === undefined) {
      const [first] = await db.getAllAsync<RoutineRow>('SELECT * FROM personal_routines ORDER BY created_at,id LIMIT 1');
      identity = first?.model_id === 'upper-lower' && ['Minha divisão semanal', desired].includes(first.name)
        ? { id: first.id, lastName: first.name } : null;
      await rememberDefault(identity);
    }
    if (!identity || identity.customized) return;
    const [routine] = await db.getAllAsync<RoutineRow>('SELECT * FROM personal_routines WHERE id=?', identity.id);
    if (!routine) return;
    if (routine.name !== identity.lastName) {
      await rememberDefault({ ...identity, customized: true });
      return;
    }
    if (routine.name !== desired) {
      await db.runAsync('UPDATE personal_routines SET name=?,updated_at=? WHERE id=?', desired, new Date().toISOString(), identity.id);
      await rememberDefault({ ...identity, lastName: desired });
    }
  }
  return {
    async list(): Promise<PersonalRoutine[]> {
      await transaction(syncDefaultName);
      const routines = await db.getAllAsync<RoutineRow>('SELECT * FROM personal_routines ORDER BY created_at,id');
      const days = await db.getAllAsync<DayRow>(`SELECT d.*, COUNT(e.id) AS exercise_count FROM personal_routine_days d
        LEFT JOIN creator_exercises e ON e.day_id=d.id GROUP BY d.id ORDER BY d.weekday`);
      return routines.map((row) => ({ id: row.id, name: row.name, modelId: row.model_id, createdAt: row.created_at, updatedAt: row.updated_at,
        days: days.filter((day) => day.routine_id === row.id).map((day): RoutineDay => ({ id: day.id, routineId: row.id, weekday: day.weekday, name: day.name, muscles: JSON.parse(day.muscles_json), rest: Boolean(day.rest), exerciseCount: day.exercise_count })) }));
    },
    // O marcador permanece mesmo se o usuário excluir TODAS as rotinas.
    async seedOnce(model: RoutineModel) {
      return transaction(async () => {
        const marker = await db.getAllAsync("SELECT value FROM creator_metadata WHERE key='personal-routines-initialized'");
        if (marker.length) { await syncDefaultName(); return; }
        const existing = await db.getAllAsync('SELECT id FROM personal_routines LIMIT 1');
        if (!existing.length) {
          const name = validateRoutineName(defaultName);
          const id = await insert(name, model);
          await rememberDefault({ id, lastName: name });
        }
        await db.runAsync("INSERT INTO creator_metadata(key,value) VALUES('personal-routines-initialized','1')");
        await syncDefaultName();
      });
    },
    async create(name: string, model: RoutineModel, recommendations?: readonly (readonly RoutineSuggestion[])[]) {
      return transaction(() => insert(name, model, recommendations));
    },
    async rename(id: string, name: string) {
      return transaction(async () => {
        await exists(id);
        await db.runAsync('UPDATE personal_routines SET name=?,updated_at=? WHERE id=?', validateRoutineName(name), new Date().toISOString(), id);
        const identity = await getDefaultIdentity();
        if (identity?.id === id) await rememberDefault({ ...identity, customized: true });
      });
    },
    async saveDay(routineId: string, dayId: string, input: DayInput) {
      const day = validateDay(input);
      return transaction(async () => {
        await exists(routineId);
        const rows = await db.getAllAsync('SELECT id FROM personal_routine_days WHERE id=? AND routine_id=?', dayId, routineId);
        if (!rows.length) throw new Error('Dia não encontrado nesta rotina.');
        // Marcar descanso mantém os exercícios guardados, sem apagá-los.
        await db.runAsync('UPDATE personal_routine_days SET name=?,muscles_json=?,rest=? WHERE id=? AND routine_id=?', day.name, JSON.stringify(day.muscles), Number(day.rest), dayId, routineId);
        await db.runAsync('UPDATE personal_routines SET updated_at=? WHERE id=?', new Date().toISOString(), routineId);
      });
    },
    async duplicate(id: string, name: string, copies: { sourceId: string; id: string; imageFile: string | null }[]) {
      return transaction(async () => {
        await exists(id);
        const source = (await db.getAllAsync<RoutineRow>('SELECT * FROM personal_routines WHERE id=?', id))[0];
        const newId = makeId();
        const stamp = new Date().toISOString();
        await db.runAsync('INSERT INTO personal_routines(id,name,model_id,created_at,updated_at) VALUES(?,?,?,?,?)', newId, validateRoutineName(name), source.model_id, stamp, stamp);
        const days = await db.getAllAsync<DayRow>('SELECT * FROM personal_routine_days WHERE routine_id=? ORDER BY weekday', id);
        for (const day of days) {
          const targetDay = `personal:${newId}:${day.weekday}`;
          await db.runAsync('INSERT INTO personal_routine_days(id,routine_id,weekday,name,muscles_json,rest) VALUES(?,?,?,?,?,?)', targetDay, newId, day.weekday, day.name, day.muscles_json, day.rest);
          const exercises = await db.getAllAsync<{ id: string }>('SELECT id FROM creator_exercises WHERE day_id=?', day.id);
          for (const exercise of exercises) {
            const copy = copies.find((item) => item.sourceId === exercise.id);
            if (!copy) throw new Error('A cópia dos exercícios está incompleta. Tente novamente.');
            await db.runAsync(`INSERT INTO creator_exercises(id,day_id,name,image_file,position,sets_json,library_image_id,recommendation_id)
              SELECT ?,?,name,?,position,sets_json,library_image_id,recommendation_id FROM creator_exercises WHERE id=? AND day_id=?`, copy.id, targetDay, copy.imageFile, exercise.id, day.id);
          }
        }
        return newId;
      });
    },
    async remove(id: string) {
      return transaction(async () => {
        await exists(id);
        const photos = await db.getAllAsync<{ image_file: string | null }>('SELECT image_file FROM creator_exercises WHERE day_id IN (SELECT id FROM personal_routine_days WHERE routine_id=?)', id);
        await db.runAsync('DELETE FROM creator_exercises WHERE day_id IN (SELECT id FROM personal_routine_days WHERE routine_id=?)', id);
        await db.runAsync('DELETE FROM personal_routine_days WHERE routine_id=?', id);
        await db.runAsync('DELETE FROM personal_routines WHERE id=?', id);
        return photos.map((row) => row.image_file).filter((file): file is string => file !== null);
      });
    },
  };
}
