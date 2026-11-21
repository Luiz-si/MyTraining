/** Sugestões e campos vazios: usa apenas arquivos reais e bancos SQLite temporários. */
import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';
import { routineModels } from '../src/data/modelos-rotinas.ts';
import { getModelRecommendations, prepareModelRecommendations, recommendedExercises } from '../src/data/exercicios-recomendados.ts';
import { createRoutineRepository, initializeRoutines } from '../src/features/rotinas/consultas-rotinas.ts';
import { applySetChanges, createRepository, initializeDatabase } from '../src/features/exercicios/consultas-banco.ts';
import { emptySets, stepRepetitions, stepWeight, validateExercise } from '../src/features/exercicios/tipos-e-validacao.ts';

let serial = 0;
const model = (id) => routineModels.find((item) => item.id === id);
function connect(path = ':memory:') {
  const native = new DatabaseSync(path);
  const db = {
    async execAsync(sql) { native.exec(sql); },
    async runAsync(sql, ...args) { return native.prepare(sql).run(...args); },
    async getAllAsync(sql, ...args) { return native.prepare(sql).all(...args); },
  };
  return { native, db, exercises: createRepository(db), routines: createRoutineRepository(db, () => `recommended-${++serial}`) };
}
async function initialize(h) { await initializeDatabase(h.db); await initializeRoutines(h.db); }

test('sete modelos possuem sugestões moderadas em todos os treinos e nenhuma em descanso; personalizado é vazio', () => {
  for (const division of routineModels) {
    const suggestions = getModelRecommendations(division.id);
    assert.equal(suggestions.length, 7);
    division.sessions.forEach((session, index) => {
      if (!session) assert.equal(suggestions[index].length, 0);
      else {
        assert.ok(suggestions[index].length >= 3 && suggestions[index].length <= 6);
        assert.equal(new Set(suggestions[index].map((exercise) => exercise.id)).size, suggestions[index].length);
      }
    });
  }
  assert.equal(getModelRecommendations('custom').flat().length, 0);
});

test('todos os mapeamentos apontam para imagens e fases existentes no catálogo gerado', async () => {
  const files = new Set(await readdir(new URL('../assets/images/exercicios/', import.meta.url)));
  const generated = await readFile(new URL('../src/data/exercise-images.generated.ts', import.meta.url), 'utf8');
  const entries = [...generated.matchAll(/id: "([^"]+)", filename: "([^"]+)".*source: require\("([^"\n]+)"\)/g)];
  const byId = new Map(entries.map((entry) => [entry[1], entry]));
  for (const exercise of Object.values(recommendedExercises)) {
    assert.ok(files.has(exercise.imageId), exercise.name);
    const entry = byId.get(exercise.imageId);
    assert.ok(entry, exercise.name);
    assert.equal(entry[2], exercise.imageId);
    assert.equal(entry[3], `../../assets/images/exercicios/${exercise.imageId}`);
    assert.ok(exercise.imageId.endsWith('-start.webp'));
    assert.ok(files.has(exercise.imageId.replace('-start.webp', '-peak.webp')));
  }
});

test('ABC e Upper/Lower distribuem os exercícios por sessão e retornam cópias independentes', () => {
  const abc = getModelRecommendations('abc');
  assert.deepEqual(abc[0].map((exercise) => exercise.id), ['supino', 'inclinado', 'crucifixo', 'desenvolvimento', 'lateral', 'triceps']);
  assert.deepEqual(abc[2].map((exercise) => exercise.id), ['puxada', 'remada', 'unilateral', 'rosca', 'martelo']);
  assert.ok(abc[4].some((exercise) => exercise.id === 'flexora'));
  assert.ok(abc[4].some((exercise) => exercise.id === 'panturrilha'));
  const upperLower = getModelRecommendations('upper-lower');
  assert.notDeepEqual(upperLower[0], upperLower[3]);
  assert.notDeepEqual(upperLower[1], upperLower[4]);
  abc[0][0].name = 'Personalização';
  assert.equal(getModelRecommendations('abc')[0][0].name, 'Supino reto');
});

test('criação automática salva quatro séries nulas, imagens corretas e ordem; reler não duplica', async () => {
  const h = connect();
  try {
    await initialize(h);
    for (const division of routineModels.filter((item) => item.id !== 'custom')) {
      const suggestions = getModelRecommendations(division.id);
      const id = await h.routines.create(division.name, division, suggestions);
      const routine = (await h.routines.list()).find((item) => item.id === id);
      for (const day of routine.days) {
        const rows = await h.exercises.load(day.id);
        assert.equal(rows.length, suggestions[day.weekday].length);
        for (const [position, row] of rows.entries()) {
          assert.equal(row.position, position);
          assert.equal(row.libraryImageId, suggestions[day.weekday][position].imageId);
          assert.equal(row.recommendationId, suggestions[day.weekday][position].id);
          assert.deepEqual(row.sets, emptySets(true)); validateExercise(row);
        }
        assert.deepEqual(await h.exercises.load(day.id), rows);
        assert.deepEqual(await h.exercises.load(day.id), rows);
      }
    }
  } finally { h.native.close(); }
});

test('peso, repetições e campos vazios são preservados ao fechar e reabrir; apagar salva null', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'meutreino-null-')); const path = join(directory, 'test.db');
  let h = connect(path);
  try {
    await initialize(h);
    await h.routines.create('ABC', model('abc'), getModelRecommendations('abc'));
    const [routine] = await h.routines.list(); const dayId = routine.days[0].id;
    const [exercise] = await h.exercises.load(dayId);
    exercise.sets[0] = { weight: '22.5', repetitions: 8 };
    exercise.sets[1] = { weight: '0', repetitions: null };
    await h.exercises.save(exercise);
    h.native.close(); h = connect(path); await initialize(h);
    const [restored] = await h.exercises.load(dayId);
    assert.deepEqual(restored.sets, exercise.sets);
    await h.exercises.syncSets(restored.name, [{ index: 0, weight: null }], dayId);
    const [cleared] = await h.exercises.load(dayId);
    assert.deepEqual(cleared.sets[0], { weight: null, repetitions: 8 });
    assert.deepEqual(cleared.sets[2], { weight: null, repetitions: null });
    assert.deepEqual(applySetChanges(cleared.sets, [{ index: 0, repetitions: null }])[0], { weight: null, repetitions: null });
  } finally { h.native.close(); await rm(directory, { recursive: true, force: true }); }
});

test('criar sem exercícios, criar outra rotina e excluir sugestão não altera outras rotinas ou o criador', async () => {
  const h = connect();
  try {
    await initialize(h);
    const creator = { id: 'creator', dayId: 'segunda', name: 'Supino reto', imageFile: null, position: 0, sets: emptySets() };
    creator.sets[0].weight = '80'; await h.exercises.save(creator);
    await h.routines.seedOnce(model('upper-lower'));
    const emptyId = await h.routines.create('Manual', model('abc'));
    const first = await h.routines.create('ABC A', model('abc'), getModelRecommendations('abc'));
    const second = await h.routines.create('ABC B', model('abc'), getModelRecommendations('abc'));
    const routines = await h.routines.list();
    assert.ok(routines.find((item) => item.id === emptyId).days.every((day) => day.exerciseCount === 0));
    const dayA = routines.find((item) => item.id === first).days[0].id;
    const dayB = routines.find((item) => item.id === second).days[0].id;
    const [item] = await h.exercises.load(dayA); item.sets[0].weight = '30'; await h.exercises.save(item);
    await h.exercises.syncSets(item.name, [{ index: 0, weight: '30' }], dayA);
    assert.equal((await h.exercises.load(dayB))[0].sets[0].weight, null);
    await h.exercises.remove(dayA, item.id);
    assert.equal((await h.exercises.load(dayA)).length, 5);
    assert.equal((await h.exercises.load(dayB)).length, 6);
    await h.routines.seedOnce(model('upper-lower'));
    assert.equal((await h.exercises.load(dayA)).length, 5);
    assert.deepEqual(await h.exercises.load('segunda'), [creator]);
  } finally { h.native.close(); }
});

test('falha durante inserção das sugestões desfaz rotina e dias sem tocar dados anteriores', async () => {
  const h = connect();
  try {
    await initialize(h); await h.routines.create('Já existente', model('custom'));
    h.native.exec("CREATE TRIGGER fail_suggestion BEFORE INSERT ON creator_exercises WHEN NEW.position=2 BEGIN SELECT RAISE(ABORT,'simulated'); END");
    await assert.rejects(h.routines.create('ABC', model('abc'), getModelRecommendations('abc')), /simulated/);
    assert.equal((await h.routines.list()).length, 1);
    assert.equal(h.native.prepare('SELECT COUNT(*) AS n FROM personal_routine_days').get().n, 7);
    assert.equal(h.native.prepare('SELECT COUNT(*) AS n FROM creator_exercises').get().n, 0);
  } finally { h.native.close(); }
});

test('incrementos aceitam vazio, não ficam negativos e não confundem vazio com zero explícito', () => {
  assert.equal(stepWeight(null, 1), '1'); assert.equal(stepWeight(null, -1), null);
  assert.equal(stepRepetitions(null, 1), 1); assert.equal(stepRepetitions(null, -1), null);
  assert.equal(stepWeight('0', -1), '0'); assert.equal(stepRepetitions(0, -1), 0);
  const exercise = { id: 'blank', dayId: 'personal:example:0', name: 'Exemplo', imageFile: null, position: 0, sets: emptySets(true) };
  validateExercise(exercise);
  assert.throws(() => validateExercise({ ...exercise, dayId: 'segunda' }), /inválidos/);
  assert.throws(() => validateExercise({ ...exercise, sets: [{ weight: '-1', repetitions: 0 }] }), /inválidos/);
  assert.throws(() => validateExercise({ ...exercise, sets: [{ weight: '0', repetitions: -1 }] }), /inválidos/);
});

test('imagem ausente produz placeholder, sem associar um arquivo de outro exercício', async () => {
  const suggestions = prepareModelRecommendations('abc', new Set(['bench-press-start.webp', 'imagem-nao-relacionada.webp']));
  assert.equal(suggestions[0][0].imageId, 'bench-press-start.webp');
  assert.equal(suggestions[0][1].imageId, null);
  const h = connect();
  try {
    await initialize(h); await h.routines.create('Com placeholder', model('abc'), suggestions);
    const [routine] = await h.routines.list();
    const exercises = await h.exercises.load(routine.days[0].id);
    assert.equal(exercises[0].libraryImageId, 'bench-press-start.webp');
    assert.equal(exercises[1].libraryImageId, undefined);
    assert.equal(exercises[1].imageFile, null);
    exercises.forEach(validateExercise);
  } finally { h.native.close(); }
});

test('duplicar uma rotina sugerida mantém a origem, imagem e campos vazios sem compartilhar edições', async () => {
  const h = connect();
  try {
    await initialize(h); const id = await h.routines.create('ABC', model('abc'), getModelRecommendations('abc'));
    const [routine] = await h.routines.list();
    const copies = [];
    for (const day of routine.days) for (const exercise of await h.exercises.load(day.id)) {
      copies.push({ sourceId: exercise.id, id: `copied-${copies.length}`, imageFile: null });
    }
    const copyId = await h.routines.duplicate(id, 'ABC cópia', copies);
    const copy = (await h.routines.list()).find((item) => item.id === copyId);
    const [original] = await h.exercises.load(routine.days[0].id);
    const [copied] = await h.exercises.load(copy.days[0].id);
    assert.equal(copied.recommendationId, original.recommendationId);
    assert.equal(copied.libraryImageId, original.libraryImageId);
    assert.deepEqual(copied.sets, emptySets(true));
    copied.sets[0].repetitions = 12; await h.exercises.save(copied);
    assert.equal((await h.exercises.load(routine.days[0].id))[0].sets[0].repetitions, null);
  } finally { h.native.close(); }
});
