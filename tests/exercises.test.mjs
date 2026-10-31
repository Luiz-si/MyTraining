import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';

import { createExerciseCopy, emptySets, parseRepetitions, parseWeight, stepWeight, validateExercise } from '../src/features/exercises/model.ts';
import { createRepository, initializeDatabase } from '../src/features/exercises/repository.ts';
import { applySetChanges, exerciseKey } from '../src/features/exercises/repository.ts';
import { createWriteQueue } from '../src/features/exercises/write-queue.ts';

function connect(path) {
  const native = new DatabaseSync(path);
  const adapter = {
    async execAsync(sql) { native.exec(sql); },
    async runAsync(sql, ...params) { return native.prepare(sql).run(...params); },
    async getAllAsync(sql, ...params) { return native.prepare(sql).all(...params); },
  };
  return { native, adapter, repo: createRepository(adapter) };
}

const exercise = (id, dayId, position = 0) => ({ id, dayId, name: 'Nome informado pelo usuário', imageFile: null, position, sets: emptySets() });

test('grupos musculares persistem ao reabrir o banco e não alteram exercícios nem outros dias', async () => {
  const folder = await mkdtemp(join(tmpdir(), 'meutreino-groups-'));
  const path = join(folder, 'routine.db');
  let connection;
  try {
    connection = connect(path);
    await initializeDatabase(connection.adapter);
    const original = exercise('existing', 'segunda');
    await connection.repo.save(original);
    assert.deepEqual(await connection.repo.loadDayGroups(), {});
    await connection.repo.saveDayGroups('segunda', [' Costas ', '', 'Bíceps']);
    await connection.repo.saveDayGroups('sabado', ['Ombro', 'Antebraço']);
    await connection.repo.saveDayGroups('segunda', ['Peito']);
    connection.native.close();
    connection = connect(path);
    await initializeDatabase(connection.adapter);
    assert.deepEqual(await connection.repo.loadDayGroups(), {
      segunda: ['Peito'], sabado: ['Ombro', 'Antebraço'],
    });
    assert.deepEqual(await connection.repo.loadAll(), [original]);
  } finally {
    connection?.native.close();
    await rm(folder, { recursive: true, force: true });
  }
});

test('edição de grupos rejeita dados vazios e falhas de gravação preservam os grupos anteriores', async () => {
  const connection = connect(':memory:');
  try {
    await initializeDatabase(connection.adapter);
    await connection.repo.saveDayGroups('segunda', ['Peito']);
    await assert.rejects(connection.repo.saveDayGroups('segunda', [' ', '']), /pelo menos um/);
    await assert.rejects(connection.repo.saveDayGroups('inexistente', ['Costas']), /dia de treino/);
    await assert.rejects(connection.repo.saveDayGroups('segunda', ['a'.repeat(101)]), /100 caracteres/);
    connection.native.exec(`CREATE TRIGGER reject_group_update BEFORE UPDATE ON workout_day_groups
      BEGIN SELECT RAISE(ABORT, 'falha simulada'); END;`);
    await assert.rejects(connection.repo.saveDayGroups('segunda', ['Costas']), /falha simulada/);
    assert.deepEqual(await connection.repo.loadDayGroups(), { segunda: ['Peito'] });
  } finally { connection.native.close(); }
});

test('instalação nova recebe os 40 exercícios reais e não recria itens excluídos', async () => {
  const routine = JSON.parse(await readFile(new URL('../src/data/creator-routine.json', import.meta.url), 'utf8'));
  const connection = connect(':memory:');
  try {
    await initializeDatabase(connection.adapter);
    assert.equal(routine.exercises.length, 40);
    routine.exercises.forEach(validateExercise);
    assert.equal(await connection.repo.seedIfEmpty(routine.exercises), true);
    const saved = await connection.repo.loadAll();
    assert.equal(saved.length, 40);
    for (const original of routine.exercises) assert.deepEqual(saved.find((item) => item.id === original.id), original);
    assert.equal((await connection.repo.load('segunda')).length, 6);
    assert.equal((await connection.repo.load('quarta')).length, 8);
    for (const item of saved) await connection.repo.remove(item.dayId, item.id);
    assert.equal(await connection.repo.seedIfEmpty(routine.exercises), false);
    assert.deepEqual(await connection.repo.loadAll(), []);
  } finally { connection.native.close(); }
});

test('rotina inicial não sobrescreve nem acrescenta dados a um banco existente', async () => {
  const connection = connect(':memory:');
  try {
    await initializeDatabase(connection.adapter);
    const existing = exercise('personal', 'sexta');
    existing.sets[0] = { weight: '22.75', repetitions: 9 };
    await connection.repo.save(existing);
    assert.equal(await connection.repo.seedIfEmpty([exercise('seed', 'segunda')]), false);
    assert.deepEqual(await connection.repo.loadAll(), [existing]);
    await connection.repo.remove(existing.dayId, existing.id);
    assert.equal(await connection.repo.seedIfEmpty([exercise('seed', 'segunda')]), false);
    assert.deepEqual(await connection.repo.loadAll(), []);
  } finally { connection.native.close(); }
});

test('falha ao carregar rotina inicial desfaz todos os registros e permite nova tentativa', async () => {
  const connection = connect(':memory:');
  try {
    await initializeDatabase(connection.adapter);
    const valid = exercise('valid', 'segunda');
    const invalid = { ...exercise('invalid', 'terca'), name: '' };
    await assert.rejects(connection.repo.seedIfEmpty([valid, invalid]));
    assert.deepEqual(await connection.repo.loadAll(), []);
    assert.equal(await connection.repo.seedIfEmpty([valid]), true);
    assert.deepEqual(await connection.repo.loadAll(), [valid]);
  } finally { connection.native.close(); }
});

test('exportação lê todos os dias, séries e referências de fotos sem alterar os registros', async () => {
  const connection = connect(':memory:');
  try {
    await initializeDatabase(connection.adapter);
    const monday = { ...exercise('m', 'segunda'), imageFile: 'minha-foto.jpg' };
    monday.sets[0] = { weight: '17.25', repetitions: 12 };
    const friday = { ...exercise('f', 'sexta'), libraryImageId: 'barbell-row-start.webp' };
    await connection.repo.save(monday);
    await connection.repo.save(friday);
    const all = await connection.repo.loadAll();
    assert.equal(all.length, 2);
    assert.deepEqual(all.find((item) => item.id === 'm'), monday);
    assert.deepEqual(all.find((item) => item.id === 'f'), friday);
    assert.deepEqual(await connection.repo.load('segunda'), [monday]);
    assert.deepEqual(await connection.repo.load('sexta'), [friday]);
  } finally { connection.native.close(); }
});

test('cópia recebe novo ID e dia, mantém quatro séries e imagem e sobrevive à exclusão do original', async () => {
  const folder = await mkdtemp(join(tmpdir(), 'meutreino-copy-'));
  const path = join(folder, 'copy.db');
  let connection;
  try {
    connection = connect(path);
    await initializeDatabase(connection.adapter);
    const source = { ...exercise('original', 'segunda'), libraryImageId: 'bench-press-start.webp' };
    source.sets[0] = { weight: '25.5', repetitions: 12 };
    const copy = createExerciseCopy(source, 'copy', 'quarta', 3, null);
    validateExercise(copy);
    assert.notEqual(copy.sets, source.sets);
    assert.notEqual(copy.sets[0], source.sets[0]);
    assert.equal(copy.libraryImageId, source.libraryImageId);
    await connection.repo.save(source);
    await connection.repo.save(copy);
    await connection.repo.remove('segunda', source.id);
    connection.native.close();
    connection = connect(path);
    assert.deepEqual(await connection.repo.load('quarta'), [copy]);
    assert.deepEqual(await connection.repo.load('segunda'), []);
    const gallerySource = { ...source, libraryImageId: null, imageFile: 'original.jpg' };
    const galleryCopy = createExerciseCopy(gallerySource, 'photo-copy', 'sexta', 0, 'copia.jpg');
    assert.equal(gallerySource.imageFile, 'original.jpg');
    assert.equal(galleryCopy.imageFile, 'copia.jpg');
  } finally { connection?.native.close(); await rm(folder, { recursive: true, force: true }); }
});

test('mesmo exercício sincroniza campos entre dias e mantém imagens, ordem e outras séries ao reabrir', async () => {
  const folder = await mkdtemp(join(tmpdir(), 'meutreino-shared-'));
  const path = join(folder, 'shared.db');
  let connection;
  try {
    connection = connect(path);
    await initializeDatabase(connection.adapter);
    const monday = { ...exercise('mon', 'segunda', 1), name: 'Rosca de bíceps', imageFile: 'segunda.jpg' };
    const wednesday = { ...exercise('wed', 'quarta', 3), name: '  ROSCA de BICEPS  ', imageFile: null, libraryImageId: 'barbell-curl-start.webp' };
    wednesday.sets[0].repetitions = 8;
    wednesday.sets[1].weight = '30';
    const other = { ...exercise('other', 'quarta'), name: 'Rosca martelo' };
    for (const item of [monday, wednesday, other]) await connection.repo.save(item);
    await connection.repo.syncSets(monday.name, [{ index: 0, weight: '12.75' }]);
    assert.deepEqual((await connection.repo.load('quarta'))[1], {
      ...wednesday, sets: applySetChanges(wednesday.sets, [{ index: 0, weight: '12.75' }]),
    });
    await connection.repo.syncSets(wednesday.name, [{ index: 2, repetitions: 15 }]);
    connection.native.close();
    connection = connect(path);
    await initializeDatabase(connection.adapter);
    const [savedMonday] = await connection.repo.load('segunda');
    const [savedOther, savedWednesday] = await connection.repo.load('quarta');
    assert.equal(savedMonday.sets[0].weight, '12.75');
    assert.equal(savedMonday.sets[2].repetitions, 15);
    assert.equal(savedWednesday.sets[2].repetitions, 15);
    assert.equal(savedWednesday.sets[0].repetitions, 8);
    assert.equal(savedWednesday.sets[1].weight, '30');
    assert.deepEqual(savedOther, other);
    assert.equal(savedMonday.imageFile, 'segunda.jpg');
    assert.equal(savedWednesday.libraryImageId, 'barbell-curl-start.webp');
    assert.equal(exerciseKey(' Supino   RETO '), exerciseKey('supino reto'));
  } finally { connection?.native.close(); await rm(folder, { recursive: true, force: true }); }
});

test('fila preserva sincronização em cem alterações rápidas e não recria exercício excluído', async () => {
  const connection = connect(':memory:');
  try {
    await initializeDatabase(connection.adapter);
    await connection.repo.save(exercise('a', 'segunda'));
    await connection.repo.save(exercise('b', 'quarta'));
    const queue = createWriteQueue(() => {});
    for (let index = 1; index <= 100; index++) {
      queue.enqueue(() => connection.repo.syncSets(exercise('a', 'segunda').name, [{ index: 3, repetitions: index }]));
    }
    await queue.whenSettled();
    assert.equal((await connection.repo.load('segunda'))[0].sets[3].repetitions, 100);
    assert.equal((await connection.repo.load('quarta'))[0].sets[3].repetitions, 100);
    await connection.repo.remove('quarta', 'b');
    await connection.repo.syncSets(exercise('a', 'segunda').name, [{ index: 3, repetitions: 101 }]);
    assert.deepEqual(await connection.repo.load('quarta'), []);
  } finally { connection.native.close(); }
});

test('cargas aceitam vírgula e decimais sem arredondamento e rejeitam entradas inválidas', () => {
  assert.equal(parseWeight('12,34567890123456789'), '12.34567890123456789');
  assert.equal(stepWeight('12.34567890123456789', 1), '13.34567890123456789');
  assert.equal(stepWeight('13.34567890123456789', -1), '12.34567890123456789');
  assert.equal(parseWeight('.5'), '0.5');
  assert.equal(parseWeight('00012,500'), '12.5');
  for (const value of ['', '-1', 'NaN', 'Infinity', '1e3', '1.2.3', '1,2,3']) assert.equal(parseWeight(value), null);
  assert.equal(stepWeight('0.5', -1), '0');
  assert.equal(stepWeight('0', -1), '0');
});

test('repetições aceitam somente inteiros não negativos representáveis', () => {
  assert.equal(parseRepetitions('12'), 12);
  assert.equal(parseRepetitions('0'), 0);
  for (const value of ['', '-1', '1.5', '1,5', 'NaN', '9007199254740992']) assert.equal(parseRepetitions(value), null);
});

test('quatro séries independentes e validação do cadastro', () => {
  const first = exercise('a', 'segunda');
  first.sets[0].weight = '12.5';
  first.sets[1].repetitions = 10;
  assert.deepEqual(first.sets[2], { weight: '0', repetitions: 0 });
  assert.deepEqual(exercise('b', 'terca').sets[0], { weight: '0', repetitions: 0 });
  assert.doesNotThrow(() => validateExercise(first));
  assert.throws(() => validateExercise({ ...first, name: ' ' }));
  assert.throws(() => validateExercise({ ...first, sets: first.sets.slice(1) }));
});

test('SQLite mantém cadastro, edição, imagem, ordem e quatro séries ao reabrir; dias são independentes', async () => {
  const folder = await mkdtemp(join(tmpdir(), 'meutreino-test-'));
  const path = join(folder, 'meutreino.db');
  let connection;
  try {
    connection = connect(path);
    await initializeDatabase(connection.adapter);
    const monday = exercise('monday', 'segunda', 1);
    monday.sets = [
      { weight: '10.5', repetitions: 12 }, { weight: '11.25', repetitions: 10 },
      { weight: '12.125', repetitions: 8 }, { weight: '13.0625', repetitions: 6 },
    ];
    await connection.repo.save(monday);
    await connection.repo.save(exercise('first', 'segunda', 0));
    const tuesday = exercise('tuesday', 'terca');
    await connection.repo.save(tuesday);
    await connection.repo.save({ ...monday, name: 'Nome editado', imageFile: 'foto-antiga.jpg' });
    const edited = { ...monday, name: 'Nome editado', imageFile: 'foto-nova.jpg' };
    await connection.repo.save(edited);
    connection.native.close();
    connection = connect(path);
    await initializeDatabase(connection.adapter);
    assert.deepEqual(await connection.repo.load('segunda'), [exercise('first', 'segunda', 0), edited]);
    assert.deepEqual(await connection.repo.load('terca'), [tuesday]);
    await connection.repo.remove('terca', 'monday');
    assert.equal((await connection.repo.load('segunda')).length, 2);
    await connection.repo.remove('segunda', 'monday');
    assert.deepEqual(await connection.repo.load('segunda'), [exercise('first', 'segunda', 0)]);
    assert.deepEqual(await connection.repo.load('terca'), [tuesday]);
    assert.deepEqual(await connection.repo.load('sabado'), []);
  } finally {
    connection?.native.close();
    await rm(folder, { recursive: true, force: true });
  }
});

test('100 alterações rápidas são gravadas em ordem e preservadas após reiniciar SQLite', async () => {
  const connection = connect(':memory:');
  try {
    await initializeDatabase(connection.adapter);
    let status;
    const queue = createWriteQueue((state) => { status = state; });
    let current = exercise('rapid', 'quarta');
    for (let index = 0; index < 100; index++) {
      current = { ...current, sets: current.sets.map((set, i) => i === 0 ? { ...set, weight: stepWeight(set.weight, 1) } : set) };
      const snapshot = current;
      queue.enqueue(() => connection.repo.save(snapshot));
    }
    await queue.whenSettled();
    assert.deepEqual(status, { pending: 0, error: false });
    const [saved] = await connection.repo.load('quarta');
    assert.equal(saved.sets[0].weight, '100');
    assert.deepEqual(saved.sets.slice(1), emptySets().slice(1));
  } finally { connection.native.close(); }
});

test('falha no salvamento mantém a fila e permite tentar novamente sem trocar a ordem', async () => {
  const output = [];
  let shouldFail = true;
  let status;
  const queue = createWriteQueue((state) => { status = state; });
  queue.enqueue(async () => {
    if (shouldFail) throw new Error('Disco indisponível');
    output.push(1);
  });
  queue.enqueue(async () => { output.push(2); });
  await queue.whenSettled();
  assert.deepEqual(status, { pending: 2, error: true });
  assert.deepEqual(output, []);
  shouldFail = false;
  queue.retry();
  await queue.whenSettled();
  assert.deepEqual(output, [1, 2]);
  assert.deepEqual(status, { pending: 0, error: false });
});

test('migração preserva banco antigo e salva biblioteca, troca e remoção sem alterar séries ou outros exercícios', async () => {
  const connection = connect(':memory:');
  try {
    connection.native.exec(`CREATE TABLE creator_exercises (
      id TEXT PRIMARY KEY NOT NULL, day_id TEXT NOT NULL, name TEXT NOT NULL,
      image_file TEXT, position INTEGER NOT NULL, sets_json TEXT NOT NULL
    )`);
    const old = exercise('old', 'segunda');
    old.imageFile = 'foto-antiga.jpg';
    old.sets[0] = { weight: '12.5', repetitions: 9 };
    connection.native.prepare('INSERT INTO creator_exercises VALUES (?, ?, ?, ?, ?, ?)')
      .run(old.id, old.dayId, old.name, old.imageFile, old.position, JSON.stringify(old.sets));
    await initializeDatabase(connection.adapter);
    await initializeDatabase(connection.adapter);
    assert.deepEqual(await connection.repo.load('segunda'), [old]);
    const other = exercise('other', 'terca');
    await connection.repo.save(other);
    const library = { ...old, imageFile: null, libraryImageId: 'supino-reto.png' };
    await connection.repo.save(library);
    assert.deepEqual(await connection.repo.load('segunda'), [library]);
    const restored = createRepository(connection.adapter);
    assert.equal((await restored.load('segunda'))[0].libraryImageId, 'supino-reto.png');
    assert.deepEqual(await restored.load('terca'), [other]);
    await restored.save({ ...library, imageFile: 'nova.jpg', libraryImageId: null });
    assert.deepEqual(await restored.load('segunda'), [{ ...old, imageFile: 'nova.jpg' }]);
    await restored.save({ ...library, imageFile: null, libraryImageId: null });
    assert.deepEqual(await restored.load('segunda'), [{ ...old, imageFile: null }]);
    assert.deepEqual(await restored.load('terca'), [other]);
  } finally { connection.native.close(); }
});
