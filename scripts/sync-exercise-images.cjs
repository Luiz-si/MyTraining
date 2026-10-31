const fs = require('node:fs');
const path = require('node:path');
const { displayName } = require('./exercise-names-pt.cjs');

function catalogEntries(folder) {
  const files = fs.readdirSync(folder, { withFileTypes: true })
    .filter((entry) => entry.isFile() && /\.(png|jpe?g|webp)$/i.test(entry.name))
    .map((entry) => entry.name).sort();
  const seen = new Set();
  return files.flatMap((filename) => {
    const extension = path.extname(filename);
    if (extension !== extension.toLowerCase()) {
      throw new Error(`Use a extensão em minúsculas para o Metro reconhecer a imagem: renomeie "${filename}" para "${filename.slice(0, -extension.length)}${extension.toLowerCase()}".`);
    }
    const id = filename.normalize('NFC').toLowerCase();
    if (seen.has(id)) return [];
    // Variantes de densidade pertencem à imagem base, não são itens separados.
    if (/@[23]x\./i.test(filename) && files.some((file) => file.toLowerCase() === filename.replace(/@[23]x(?=\.)/i, '').toLowerCase())) return [];
    seen.add(id);
    return [{ id, filename, name: displayName(filename) }];
  }).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR') || a.filename.localeCompare(b.filename, 'pt-BR'));
}

function generateCatalog(folder, output) {
  fs.mkdirSync(folder, { recursive: true });
  const entries = catalogEntries(folder);
  const relative = path.relative(path.dirname(output), folder).split(path.sep).join('/');
  const content = `// Gerado por npm run images:sync. Não editar manualmente.\nimport type { ImageSourcePropType } from 'react-native';\n\nexport type LibraryImage = { id: string; filename: string; name: string; source: ImageSourcePropType };\n\nexport const exerciseImages: readonly LibraryImage[] = [\n${entries.map((entry) => `  { id: ${JSON.stringify(entry.id)}, filename: ${JSON.stringify(entry.filename)}, name: ${JSON.stringify(entry.name)}, source: require(${JSON.stringify(`${relative.startsWith('.') ? relative : './' + relative}/${entry.filename}`)}) },`).join('\n')}\n];\n`;
  fs.mkdirSync(path.dirname(output), { recursive: true });
  if (!fs.existsSync(output) || fs.readFileSync(output, 'utf8') !== content) fs.writeFileSync(output, content);
  return entries;
}

if (require.main === module) {
  const root = path.resolve(__dirname, '..');
  try {
    const entries = generateCatalog(path.join(root, 'assets/images/exercicios'), path.join(root, 'src/data/exercise-images.generated.ts'));
    console.log(`Biblioteca atualizada: ${entries.length} imagem(ns).`);
  } catch (error) {
    console.error(`Não foi possível atualizar a biblioteca: ${error.message}`);
    process.exitCode = 1;
  }
}

module.exports = { catalogEntries, generateCatalog };
