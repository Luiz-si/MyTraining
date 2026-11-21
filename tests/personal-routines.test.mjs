/** Testes reais de SQLite em bancos temporários; nunca abre o banco do celular. */
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';
import { routineModels } from '../src/data/modelos-rotinas.ts';
import { createRoutineRepository, DEFAULT_ROUTINE_NAME, initializeRoutines } from '../src/features/rotinas/consultas-rotinas.ts';
import { createDatabaseQueue, serializedRepository } from '../src/features/rotinas/fila-banco.ts';
import { createRepository, initializeDatabase } from '../src/features/exercicios/consultas-banco.ts';
import { emptySets, validateExercise } from '../src/features/exercicios/tipos-e-validacao.ts';

const model = (id) => routineModels.find((item) => item.id === id);
let serial = 0;
function connect(path = ':memory:') {
  const native = new DatabaseSync(path);
  const db = {
    async execAsync(sql) { native.exec(sql); },
    async runAsync(sql, ...params) { return native.prepare(sql).run(...params); },
    async getAllAsync(sql, ...params) { return native.prepare(sql).all(...params); },
  };
  const run = createDatabaseQueue();
  return { native, db, exercises: serializedRepository(createRepository(db), run), routines: serializedRepository(createRoutineRepository(db, () => `test-${++serial}`), run) };
}
async function initialize(h) { await initializeDatabase(h.db); await initializeRoutines(h.db); }
const exercise = (id, dayId, position = 0) => ({ id, dayId, position, name: 'Supino reto', imageFile: null, libraryImageId: 'barbell-bench-press-main', sets: emptySets() });

test('instalação nova cria sete dias na ordem e uma rotina padrão apenas uma vez', async () => {
  const h = connect();
  try {
    await initialize(h);
    await h.routines.seedOnce(model('upper-lower'));
    await h.routines.seedOnce(model('upper-lower'));
    const [routine] = await h.routines.list();
    assert.equal(routine.name, DEFAULT_ROUTINE_NAME);
    assert.equal('active' in routine, false);
    assert.equal((await h.routines.list()).length, 1);
    assert.deepEqual(routine.days.map((day) => day.weekday), [0, 1, 2, 3, 4, 5, 6]);
    assert.deepEqual(routine.days.filter((day) => !day.rest).map((day) => day.weekday), [0, 1, 3, 4]);
    assert.equal(routine.days.every((day) => day.exerciseCount === 0), true);
  } finally { h.native.close(); }
});

test('migração preserva banco antigo do criador, imagens e grupos, sem copiar dados para rotinas pessoais', async () => {
  const h = connect();
  try {
    // Simula a estrutura anterior à migração de imagens e de rotinas.
    h.native.exec('CREATE TABLE creator_exercises(id TEXT PRIMARY KEY,day_id TEXT,name TEXT,image_file TEXT,position INTEGER,sets_json TEXT)');
    const original = exercise('creator-1', 'segunda');
    original.imageFile = 'foto-original.jpg'; delete original.libraryImageId;
    h.native.prepare('INSERT INTO creator_exercises VALUES(?,?,?,?,?,?)').run(original.id, original.dayId, original.name, original.imageFile, 0, JSON.stringify(original.sets));
    await initialize(h);
    await h.exercises.saveDayGroups('segunda', ['Peito']);
    await h.routines.seedOnce(model('upper-lower'));
    assert.deepEqual(await h.exercises.load('segunda'), [original]);
    assert.deepEqual(await h.exercises.loadDayGroups(), { segunda: ['Peito'] });
    const [routine] = await h.routines.list();
    assert.deepEqual(await h.exercises.load(routine.days[0].id), []);
    assert.deepEqual(await h.exercises.loadAll(), [original]);
  } finally { h.native.close(); }
});

test('criar, abrir rotinas diferentes, renomear e reabrir mantém dados independentes', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'meutreino-routines-'));
  const path = join(directory, 'test.db');
  let h = connect(path);
  try {
    await initialize(h);
    const a = await h.routines.create('Meu ABC', model('abc'));
    const b = await h.routines.create('Férias', model('full-body'));
    let all = await h.routines.list();
    await h.exercises.save(exercise('a1', all.find((r) => r.id === a).days[0].id));
    const other = exercise('b1', all.find((r) => r.id === b).days[0].id);
    other.sets[0].weight = '22.5'; await h.exercises.save(other);
    await h.routines.rename(a, 'Meu ABC atualizado');
    h.native.close(); h = connect(path); await initialize(h);
    all = await h.routines.list();
    assert.equal(all.length, 2);
    assert.equal(all.find((r) => r.id === a).name, 'Meu ABC atualizado');
    assert.equal((await h.exercises.load(all.find((r) => r.id === a).days[0].id))[0].sets[0].weight, '0');
    assert.equal((await h.exercises.load(all.find((r) => r.id === b).days[0].id))[0].sets[0].weight, '22.5');
    assert.equal(all.every((routine) => routine.days[0].exerciseCount === 1), true);
  } finally { h.native.close(); await rm(directory, { recursive: true, force: true }); }
});

test('cargas sincronizam apenas entre dias da mesma rotina, sem alterar outra rotina ou o criador', async () => {
  const h = connect();
  try {
    await initialize(h);
    const a = await h.routines.create('A', model('abc'));
    const b = await h.routines.create('B', model('abc'));
    const routines = await h.routines.list();
    const [d1, , d2] = routines.find((r) => r.id === a).days;
    const d3 = routines.find((r) => r.id === b).days[0];
    for (const [id, day] of [['a1', d1.id], ['a2', d2.id], ['b1', d3.id], ['c1', 'segunda']]) await h.exercises.save(exercise(id, day));
    await h.exercises.syncSets('Supino reto', [{ index: 0, weight: '60', repetitions: 8 }], d1.id);
    assert.equal((await h.exercises.load(d1.id))[0].sets[0].weight, '60');
    assert.equal((await h.exercises.load(d2.id))[0].sets[0].weight, '60');
    assert.equal((await h.exercises.load(d3.id))[0].sets[0].weight, '0');
    assert.equal((await h.exercises.load('segunda'))[0].sets[0].weight, '0');
    await h.exercises.syncSets('Supino reto', [{ index: 0, weight: '90' }]);
    assert.equal((await h.exercises.load(d1.id))[0].sets[0].weight, '60');
    assert.equal((await h.exercises.load('segunda'))[0].sets[0].weight, '90');
    assert.equal((await h.exercises.loadAll()).length, 1, 'a exportação antiga continua apenas do criador');
  } finally { h.native.close(); }
});

test('domingo pode virar treino; marcar descanso preserva exercícios e não permite novos cadastros', async () => {
  const h = connect();
  try {
    await initialize(h);
    const id = await h.routines.create('Do zero', model('custom'));
    const [routine] = await h.routines.list(); const sunday = routine.days[6];
    assert.equal(routine.days.every((day) => day.rest), true);
    await h.routines.saveDay(id, sunday.id, { name: 'Domingo A', muscles: [' Costas ', ' Bíceps '], rest: false });
    await h.exercises.save(exercise('sun1', sunday.id));
    await h.routines.saveDay(id, sunday.id, { name: 'Domingo A', muscles: ['Costas', 'Bíceps'], rest: true });
    assert.equal((await h.exercises.load(sunday.id)).length, 1);
    await assert.rejects(h.exercises.save(exercise('sun2', sunday.id)), /descanso/);
    await h.routines.saveDay(id, sunday.id, { name: 'Domingo novo', muscles: ['Costas'], rest: false });
    assert.equal((await h.exercises.load(sunday.id)).length, 1);
  } finally { h.native.close(); }
});

test('duplicar copia dias, séries, ordem e imagens com novos IDs; excluir original preserva cópia', async () => {
  const h = connect();
  try {
    await initialize(h); const id = await h.routines.create('Original', model('abc'));
    const [routine] = await h.routines.list();
    const source = exercise('a1', routine.days[0].id, 3); source.imageFile = 'original.jpg'; source.libraryImageId = null;
    source.sets[0].weight = '10.5'; await h.exercises.save(source);
    const copyId = await h.routines.duplicate(id, 'Cópia', [{ sourceId: 'a1', id: 'copy-a1', imageFile: 'foto-copia.jpg' }]);
    const copy = (await h.routines.list()).find((item) => item.id === copyId);
    let [copied] = await h.exercises.load(copy.days[0].id);
    assert.equal(copied.id, 'copy-a1'); assert.equal(copied.imageFile, 'foto-copia.jpg'); assert.equal(copied.position, 3);
    assert.deepEqual(copied.sets, source.sets);
    copied.sets[0].weight = '100'; await h.exercises.save(copied);
    assert.equal((await h.exercises.load(routine.days[0].id))[0].sets[0].weight, '10.5');
    assert.deepEqual(await h.routines.remove(id), ['original.jpg']);
    [copied] = await h.exercises.load(copy.days[0].id); assert.equal(copied.sets[0].weight, '100');
    assert.equal((await h.routines.list())[0].id, copyId);
    await assert.rejects(h.exercises.save(source), /removido/);
  } finally { h.native.close(); }
});

test('excluir a última rotina mantém estado vazio mesmo após reinicializar e rodar seed', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'meutreino-empty-')); const path = join(directory, 'test.db');
  let h = connect(path);
  try {
    await initialize(h); await h.routines.seedOnce(model('upper-lower'));
    const [routine] = await h.routines.list(); await h.routines.remove(routine.id);
    h.native.close(); h = connect(path); await initialize(h); await h.routines.seedOnce(model('upper-lower'));
    assert.deepEqual(await h.routines.list(), []);
  } finally { h.native.close(); await rm(directory, { recursive: true, force: true }); }
});

test('falhas desfazem criação e duplicação sem deixar rotinas incompletas', async () => {
  const h = connect();
  try {
    await initialize(h);
    h.native.exec("CREATE TRIGGER fail_day BEFORE INSERT ON personal_routine_days WHEN NEW.weekday=3 BEGIN SELECT RAISE(ABORT,'simulated'); END");
    await assert.rejects(h.routines.seedOnce(model('upper-lower')), /simulated/);
    assert.deepEqual(await h.routines.list(), []);
    assert.equal(h.native.prepare("SELECT * FROM creator_metadata WHERE key='personal-routines-initialized'").all().length, 0);
    h.native.exec('DROP TRIGGER fail_day'); await h.routines.seedOnce(model('upper-lower'));
    const [routine] = await h.routines.list(); await h.exercises.save(exercise('a1', routine.days[0].id));
    await assert.rejects(h.routines.duplicate(routine.id, 'Cópia incompleta', []), /incompleta/);
    assert.equal((await h.routines.list()).length, 1);
    assert.equal((await h.exercises.load(routine.days[0].id)).length, 1);
  } finally { h.native.close(); }
});

test('validação rejeita nome vazio, grupos inválidos e edição de dia de outra rotina', async () => {
  const h = connect();
  try {
    await initialize(h); await assert.rejects(h.routines.create('  ', model('abc')), /nome/);
    const a = await h.routines.create('A', model('abc')); const b = await h.routines.create('B', model('abc'));
    const [routine] = await h.routines.list();
    await assert.rejects(h.routines.saveDay(b, routine.days[0].id, { name: 'A', muscles: ['Peito'], rest: false }), /nesta rotina/);
    await assert.rejects(h.routines.saveDay(a, routine.days[0].id, { name: 'A', muscles: [], rest: false }), /grupos/);
    await assert.rejects(h.routines.rename(a, 'x'.repeat(101)), /nome/);
    assert.equal((await h.routines.list())[0].days[0].name, 'A');
  } finally { h.native.close(); }
});

test('séries pessoais variam de 1 a 12, quatro continuam obrigatórias para o criador; ordem persiste', async () => {
  const h = connect();
  try {
    await initialize(h); await h.routines.create('A', model('abc'));
    const [routine] = await h.routines.list(); const day = routine.days[0].id;
    const one = exercise('one', day); one.sets = [{ weight: '22.25', repetitions: 8 }]; validateExercise(one); await h.exercises.save(one);
    const twelve = exercise('twelve', day, 1); twelve.sets = Array.from({ length: 12 }, () => ({ weight: '0', repetitions: 12 })); validateExercise(twelve); await h.exercises.save(twelve);
    assert.throws(() => validateExercise({ ...one, dayId: 'segunda' }), /inválidos/);
    assert.throws(() => validateExercise({ ...one, sets: [] }), /inválidos/);
    await h.exercises.reorder(day, ['twelve', 'one']);
    assert.deepEqual((await h.exercises.load(day)).map((item) => item.id), ['twelve', 'one']);
    await assert.rejects(h.exercises.reorder(day, ['twelve']), /mudou/);
    assert.equal((await h.exercises.load(day))[1].sets[0].weight, '22.25');
  } finally { h.native.close(); }
});

test('operações concorrentes compartilham a fila sem misturar transações; falha não bloqueia próximas ações', async () => {
  const h = connect();
  try {
    await initialize(h);
    const ids = await Promise.all(Array.from({ length: 15 }, (_, index) => h.routines.create(`Rotina ${index}`, model('abc'))));
    await Promise.all(ids.map((id, index) => h.routines.rename(id, `Nova rotina ${index}`)));
    assert.equal((await h.routines.list()).length, 15);
    await assert.rejects(h.routines.rename('missing', 'Inexistente'), /disponível/);
    await h.routines.rename(ids[0], 'Fila recuperada');
    assert.equal((await h.routines.list()).find((routine) => routine.id === ids[0]).name, 'Fila recuperada');
  } finally { h.native.close(); }
});

test('banco antigo com rotina ativa continua legível, sem usar a marca antiga', async () => {
  const h = connect();
  try {
    await initialize(h);
    const originalId = await h.routines.create('Antiga', model('abc'));
    h.native.prepare('UPDATE personal_routines SET active=1 WHERE id=?').run(originalId);
    const [original] = await h.routines.list();
    await h.exercises.save(exercise('legacy-exercise', original.days[0].id));
    await initializeRoutines(h.db);
    const secondId = await h.routines.create('Nova', model('custom'));
    const all = await h.routines.list();
    assert.equal(all.length, 2);
    assert.equal(all.every((routine) => !('active' in routine)), true);
    assert.equal(typeof h.routines.activate, 'undefined');
    await h.routines.remove(secondId);
    assert.equal((await h.exercises.load(original.days[0].id))[0].id, 'legacy-exercise');
  } finally { h.native.close(); }
});

test('todos os oito modelos possuem sete posições e as frequências pedidas', () => {
  assert.equal(routineModels.length, 8);
  assert.equal(new Set(routineModels.map((item) => item.id)).size, 8);
  assert.deepEqual(routineModels.map((item) => item.sessions.filter(Boolean).length), [3, 4, 3, 4, 5, 3, 4, 0]);
  assert.equal(routineModels.every((item) => item.sessions.length === 7), true);
});

test('nome do código atualiza a rotina padrão já salva sem mudar seus exercícios ou cópias', async () => {
  const h = connect();
  try {
    await initialize(h);
    const old = createRoutineRepository(h.db, () => 'original-default', 'Minha divisão semanal');
    await old.seedOnce(model('upper-lower'));
    const [original] = await old.list();
    await h.exercises.save(exercise('saved-default-exercise', original.days[0].id));
    await h.routines.duplicate(original.id, 'Minha divisão semanal', [{ sourceId: 'saved-default-exercise', id: 'copy-default-exercise', imageFile: null }]);
    const updated = createRoutineRepository(h.db, undefined, 'Novo nome no código');
    await updated.seedOnce(model('upper-lower'));
    const routines = await updated.list();
    assert.equal(routines.find((routine) => routine.id === original.id).name, 'Novo nome no código');
    assert.equal(routines.find((routine) => routine.id !== original.id).name, 'Minha divisão semanal');
    assert.equal((await h.exercises.load(original.days[0].id))[0].id, 'saved-default-exercise');
    await updated.rename(original.id, 'Nome escolhido no celular');
    const next = createRoutineRepository(h.db, undefined, 'Outra mudança no código');
    await next.seedOnce(model('upper-lower'));
    assert.equal((await next.list()).find((routine) => routine.id === original.id).name, 'Nome escolhido no celular');
  } finally { h.native.close(); }
});

test('migra nome antigo sem marcador de identidade e não recria a rotina se ela foi excluída', async () => {
  const h = connect();
  try {
    await initialize(h);
    const old = createRoutineRepository(h.db, () => 'legacy-default', 'Minha divisão semanal');
    await old.seedOnce(model('upper-lower'));
    await h.db.runAsync("DELETE FROM creator_metadata WHERE key='personal-default-identity'");
    const updated = createRoutineRepository(h.db, undefined, 'Nome atualizado');
    await updated.seedOnce(model('upper-lower'));
    assert.equal((await updated.list())[0].name, 'Nome atualizado');
    await updated.remove('legacy-default');
    await updated.seedOnce(model('upper-lower'));
    assert.deepEqual(await updated.list(), []);
  } finally { h.native.close(); }
});

test('exclusão afeta só a rotina escolhida e falha transacional mantém os dados', async () => {
  const h = connect();
  try {
    await initialize(h);
    const a = await h.routines.create('A', model('abc')); const b = await h.routines.create('B', model('abc'));
    const routines = await h.routines.list();
    const dayA = routines.find((routine) => routine.id === a).days[0].id;
    const dayB = routines.find((routine) => routine.id === b).days[0].id;
    await h.exercises.save(exercise('ea', dayA)); await h.exercises.save(exercise('eb', dayB)); await h.exercises.save(exercise('creator', 'segunda'));
    h.native.exec("CREATE TRIGGER fail_delete BEFORE DELETE ON personal_routines BEGIN SELECT RAISE(ABORT,'simulated'); END");
    await assert.rejects(h.routines.remove(a), /simulated/);
    assert.equal((await h.exercises.load(dayA)).length, 1);
    assert.equal((await h.routines.list()).length, 2);
    h.native.exec('DROP TRIGGER fail_delete'); await h.routines.remove(a);
    assert.equal((await h.exercises.load(dayA)).length, 0);
    assert.equal((await h.exercises.load(dayB))[0].id, 'eb');
    assert.equal((await h.exercises.load('segunda'))[0].id, 'creator');
  } finally { h.native.close(); }
});
