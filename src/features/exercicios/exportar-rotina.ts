/**
 * CRIAÇÃO DO ARQUIVO JSON DE EXPORTAÇÃO
 * Reúne exercícios, séries e imagens locais e salva/compartilha o arquivo.
 * Não é uma importação nem uma sincronização automática com outros celulares.
 * Guia de localização: docs/onde-mexer-no-codigo.md
 */

import { Directory, File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { getRepository } from './conexao-banco';
import { imageUri } from './fotos-do-celular';
import { validateExercise } from './tipos-e-validacao';
import { waitForExerciseSaving } from './estado-exercicios';

export async function exportRoutine(mode: 'save' | 'share' = 'share') {
  if (mode === 'share' && !await Sharing.isAvailableAsync()) throw new Error('O compartilhamento não está disponível. Tente a opção “Salvar no celular”.');
  await waitForExerciseSaving();
  const exercises = await (await getRepository()).loadAll();
  if (!exercises.length) throw new Error('Nenhum exercício foi encontrado neste aplicativo. Faça a exportação no Expo Go onde você cadastrou sua rotina.');
  exercises.forEach(validateExercise);
  const images: Record<string, string> = {};
  for (const exercise of exercises) {
    if (exercise.imageFile && !images[exercise.imageFile]) {
      const uri = imageUri(exercise.imageFile)!;
      const file = new File(uri);
      if (!file.exists) throw new Error(`A foto de “${exercise.name}” não foi encontrada. Escolha outra imagem para esse exercício e tente novamente.`);
      images[exercise.imageFile] = await file.base64();
    }
  }
  const backup = {
    format: 'meutreino-routine', version: 1, exportedAt: new Date().toISOString(), exercises, images,
  };
  const filename = `meutreino-rotina-${Date.now()}.json`;
  const content = JSON.stringify(backup, null, 2);
  if (mode === 'save') {
    const folder = await Directory.pickDirectoryAsync();
    const destination = folder.createFile(filename, 'application/json');
    await destination.write(content);
    return;
  }
  const output = new File(Paths.cache, filename);
  await output.write(content);
  await Sharing.shareAsync(output.uri, {
    mimeType: 'application/octet-stream', UTI: 'public.json', dialogTitle: 'Compartilhar minha rotina',
  });
}
