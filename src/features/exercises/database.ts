import { openDatabaseAsync } from 'expo-sqlite';

import { createRepository, initializeDatabase } from './repository';
import { getInitialRoutine } from './initial-routine';

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
