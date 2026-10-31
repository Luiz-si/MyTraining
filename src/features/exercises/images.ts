import { Directory, File, Paths } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';

const directory = () => new Directory(Paths.document, 'exercise-images');

export function imageUri(filename: string | null): string | undefined {
  return filename ? new File(directory(), filename).uri : undefined;
}

export async function copyExerciseImage(filename: string): Promise<string> {
  const folder = directory();
  const source = new File(folder, filename);
  const copyName = `${Date.now()}-${Math.random().toString(36).slice(2)}${source.extension}`;
  await source.copy(new File(folder, copyName));
  return copyName;
}

export async function pickExerciseImage(): Promise<string | null> {
  // O seletor de fotos do sistema não exige acesso geral à galeria no Android.
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.8,
  });
  if (result.canceled) return null;
  const source = new File(result.assets[0].uri);
  const folder = directory();
  folder.create({ intermediates: true, idempotent: true });
  const extension = /^\.[a-z0-9]+$/i.test(source.extension) ? source.extension : '.jpg';
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${extension}`;
  await source.copy(new File(folder, filename));
  return filename;
}

export function removeExerciseImage(filename: string | null) {
  if (!filename || !/^[\w.-]+$/.test(filename)) return;
  try {
    const file = new File(directory(), filename);
    if (file.exists) file.delete();
  } catch {
    // Uma falha ao limpar uma foto antiga não pode desfazer o salvamento do treino.
  }
}
