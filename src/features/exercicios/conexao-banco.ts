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

let repository: Promise<ReturnType<typeof createRepository>> | undefined;

export function getRepository() {
  repository ??= (async () => {
    const db = await openDatabaseAsync('meutreino.db');
    await initializeDatabase(db);
    const result = createRepository(db);
    await result.seedIfEmpty(getInitialRoutine());
    return result;
  })().catch((error) => {
    repository = undefined;
    throw error;
  });
  return repository;
}
