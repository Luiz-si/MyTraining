/**
 * ABERTURA DO BANCO LOCAL MEUTREINO.DB
 * Abre a conexão SQLite e prepara as tabelas antes de disponibilizar o banco.
 * Também inicializa a rotina do criador quando aplicável.
 * O banco real fica no celular; este arquivo contém apenas o código que o abre.
 * Guia de localização: docs/onde-mexer-no-codigo.md
 */

import { openDatabaseAsync } from 'expo-sqlite';

import { createRepository, initializeDatabase } from './consultas-banco';
import { getInitialRoutine } from './carregar-rotina-inicial';
import { createRoutineRepository, initializeRoutines } from '../rotinas/consultas-rotinas';
import { createDatabaseQueue, serializedRepository } from '../rotinas/fila-banco';
import { routineModels } from '@/data/modelos-rotinas';

let connection: Promise<{
  exercises: ReturnType<typeof createRepository>;
  routines: ReturnType<typeof createRoutineRepository>;
}> | undefined;

function getConnection() {
  connection ??= (async () => {
    const db = await openDatabaseAsync('meutreino.db');
    await initializeDatabase(db);
    const result = createRepository(db);
    await result.seedIfEmpty(getInitialRoutine());
    await initializeRoutines(db);
    const routines = createRoutineRepository(db);
    await routines.seedOnce(routineModels.find((model) => model.id === 'upper-lower')!);
    const run = createDatabaseQueue();
    return { exercises: serializedRepository(result, run), routines: serializedRepository(routines, run) };
  })().catch((error) => {
    connection = undefined;
    throw error;
  });
  return connection;
}

export async function getRepository() { return (await getConnection()).exercises; }
export async function getRoutineRepository() { return (await getConnection()).routines; }
