import assert from 'node:assert/strict';
import { copyFileSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import generator from '../scripts/sync-exercise-images.cjs';
import translations from '../scripts/exercise-names-pt.cjs';
import { filterLibrary } from '../src/features/exercises/library-search.ts';

test('catálogo vazio válido, formatos, ordem, nomes, referências estáticas e arquivos intactos', () => {
  const root = mkdtempSync(join(tmpdir(), 'meutreino-catalog-'));
  try {
    const folder = join(root, 'assets');
    const output = join(root, 'data/catalog.ts');
    assert.deepEqual(generator.generateCatalog(folder, output), []);
    assert.match(readFileSync(output, 'utf8'), /exerciseImages: readonly LibraryImage\[\] = \[/);
    for (const filename of ['supino-reto.png', 'agachamento.jpg', 'rosca-direta.jpeg', 'elevacao_lateral.webp', 'supino-reto@2x.png']) {
      copyFileSync(new URL('../assets/images/icon.png', import.meta.url), join(folder, filename));
    }
    writeFileSync(join(folder, 'ignorar.txt'), 'Não é imagem');
    mkdirSync(join(folder, 'pasta.png'));
    const entries = generator.generateCatalog(folder, output);
    assert.deepEqual(entries.map((entry) => entry.name), ['Agachamento', 'Elevacao lateral', 'Rosca direta', 'Supino reto']);
    assert.equal(entries[3].id, 'supino-reto.png');
    const content = readFileSync(output, 'utf8');
    assert.match(content, /require\("\.\.\/assets\/supino-reto.png"\)/);
    assert.equal(content.includes('ignorar.txt'), false);
    assert.equal(readFileSync(join(folder, 'supino-reto.png')).equals(readFileSync(new URL('../assets/images/icon.png', import.meta.url))), true);
    generator.generateCatalog(folder, output);
    assert.equal(readFileSync(output, 'utf8'), content);
    copyFileSync(new URL('../assets/images/icon.png', import.meta.url), join(folder, 'outra.PNG'));
    assert.throws(() => generator.generateCatalog(folder, output), /extensão em minúsculas/);
    assert.equal(readFileSync(output, 'utf8'), content);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('pesquisa pelo arquivo ou nome, ignorando acentos e maiúsculas', () => {
  const images = [{ id: 'a', name: 'Elevação lateral', filename: 'ombro.webp' }, { id: 'b', name: 'Supino reto', filename: 'supino-reto.png' }];
  assert.deepEqual(filterLibrary(images, ' elevacao '), [images[0]]);
  assert.deepEqual(filterLibrary(images, 'OMBRO'), [images[0]]);
  assert.deepEqual(filterLibrary(images, 'supino'), [images[1]]);
  assert.deepEqual(filterLibrary(images, 'inexistente'), []);
  assert.deepEqual(filterLibrary([], ''), []);
});

test('nomes em português preservam identificadores e permitem pesquisar também em inglês', () => {
  const images = ['bench-press-start.webp', 'incline-db-press-peak.webp', 'cable-tricep-pushdown-main.webp'].map((filename) => ({
    id: filename, filename, name: translations.displayName(filename),
  }));
  assert.equal(images[0].name, 'Supino reto — posição inicial');
  assert.equal(images[1].name, 'Supino inclinado com halteres — posição final');
  assert.equal(filterLibrary(images, 'supino halter')[0].id, 'incline-db-press-peak.webp');
  assert.equal(filterLibrary(images, 'supino')[0].id, 'bench-press-start.webp');
  assert.equal(filterLibrary(images, 'bench press')[0].id, 'bench-press-start.webp');
  assert.equal(filterLibrary(images, 'TRICEPS polia')[0].id, 'cable-tricep-pushdown-main.webp');
  assert.equal(translations.displayName('arquivo-novo.webp'), 'Arquivo novo');
});

test('pesquisa por antebraço encontra exercícios relacionados e aceita variações de escrita', () => {
  const images = ['barbell-wrist-curl-start.webp', 'db-reverse-wrist-curl-peak.webp',
    'reverse-curl-start.webp', 'hammer-curl-peak.webp', 'zottman-curl-start.webp',
    'plate-pinch-start.webp', 'wrist-roller-peak.webp', 'dumbbell-farmers-walk-main.webp',
    'bench-press-start.webp', 'dumbbell-shoulder-press-start.webp'].map((filename) => ({
    filename, name: translations.displayName(filename),
  }));
  for (const query of ['antebraco', 'ANTEBRAÇO', 'ante braço', 'antebraços', 'ante bracos']) {
    assert.deepEqual(filterLibrary(images, query), images.slice(0, 8));
  }
  assert.deepEqual(filterLibrary(images, 'antebraco barra'), [images[0]]);
  assert.deepEqual(filterLibrary(images, 'antebraco inexistente'), []);
});

test('rosca direta no crossover pode ser encontrada pelos nomes em português', () => {
  const filename = 'Rosca Direta no Cross Over.png';
  const images = [{ filename, name: translations.displayName(filename) }];
  for (const query of ['rosca direta', 'bíceps', 'biceps polia', 'crossover', 'cross over', 'rosca cabo']) {
    assert.deepEqual(filterLibrary(images, query), images);
  }
});

test('categoria costas encontra remadas, puxadas, barra fixa e lombar, sem exercícios de outros grupos', () => {
  const images = ['barbell-row-start.webp', 'seated-cable-row-peak.webp', 'lat-pulldown-start.webp',
    'straight-arm-pulldown-peak.webp', 'pull-up-start.webp', 'chin-ups-peak.webp',
    'back-extension-start.webp', 'hyperextension-hold-bench-main.webp',
    'bench-press-start.webp', 'upright-row-start.webp', 'barbell-rear-delt-row-start.webp',
    'rowing-machine-main.webp', 'hammer-curl-start.webp'].map((filename) => ({
    filename, name: translations.displayName(filename),
  }));
  for (const query of ['costas', 'COSTAS', 'dorsais', 'dorsal', 'dorso']) {
    assert.deepEqual(filterLibrary(images, query), images.slice(0, 8));
  }
  assert.deepEqual(filterLibrary(images, 'costas polia'), [images[1]]);
  assert.deepEqual(filterLibrary(images, 'costas lombar'), images.slice(6, 8));
  assert.deepEqual(filterLibrary(images, 'costas inexistente'), []);
});
