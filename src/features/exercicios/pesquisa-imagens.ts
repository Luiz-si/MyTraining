/**
 * REGRAS DE PESQUISA DA BIBLIOTECA
 * Edite aqui: palavras relacionadas e categorias como costas ou antebraço.
 * Normaliza acentos e maiúsculas para facilitar encontrar as imagens.
 * Não confunda com scripts/exercise-names-pt.cjs, que traduz os nomes exibidos.
 * Guia de localização: docs/onde-mexer-no-codigo.md
 */

export function filterLibrary<T extends { filename: string; name: string }>(images: readonly T[], query: string): T[] {
  const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[-_]+/g, ' ').replace(/\bante\s+bracos?\b/g, 'antebraco').replace(/\bantebracos\b/g, 'antebraco');
  const terms = normalize(query.trim()).split(/\s+/).filter(Boolean);
  return images.filter((image) => {
    // Categorias de pesquisa não alteram os nomes nem as associações salvas.
    const forearm = /(?:^|-)(?:wrist-(?:curl|roller|stretch)|reverse-curl|hammer-curl|zottman-curl|plate-pinch|farmers-walk)(?:-|\.)/i.test(image.filename)
      || /rosca (?:de punho|inversa|martelo|zottman)|rolo de punho|pinca de anilhas/.test(normalize(image.name));
    const cableCurl = /(?:cable curl|rosca direta no cross over)/.test(normalize(`${image.filename} ${image.name}`));
    const filename = normalize(image.filename);
    const displayName = normalize(image.name);
    const backRow = /\brow\b/.test(filename) && !/\bupright\b|rear delt/.test(filename);
    const back = backRow || /\b(?:pulldown|pullover)\b|pull ups?\b|chin ups?\b|back extension/.test(filename)
      || /remada (?!alta|para deltoide)|puxada alta|barra fixa|extensao lombar|pullover/.test(displayName);
    const lowerBack = /back extension|hyperextension/.test(filename) || /lombar/.test(displayName);
    const searchable = normalize(`${image.filename} ${image.name} ${forearm ? 'antebraco forearm' : ''} ${cableCurl ? 'rosca direta biceps polia cabo crossover cross over' : ''} ${back || lowerBack ? 'costas dorsais dorsal dorso back' : ''} ${lowerBack ? 'lombar lombares' : ''}`);
    return terms.every((term) => searchable.includes(term));
  });
}
