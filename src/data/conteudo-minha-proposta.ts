/**
 * TEXTOS E FOTOGRAFIAS DA PÁGINA MINHA PROPOSTA
 * Edite aqui: apresentação, filosofia, objetivos, dicas, perguntas e assinatura.
 * aboutPhotos: referências das fotos, legendas, ordem e visibilidade.
 * As dimensões e as bordas ficam em features/minha-proposta/estilos.ts.
 * Guia de localização: docs/onde-mexer-no-codigo.md
 */

// Edite os textos desta página aqui. Não é necessário alterar os componentes.
export const aboutMeuTreino = {
  title: 'POR TRÁS DO MEUTREINO',
  heading: 'Por trás do\nMeuTreino.',
  subtitle: 'Mais do que uma sequência de exercícios, uma proposta de treinamento organizada.',
  access: {
    title: 'Minha proposta',
    hint: 'Abre a apresentação do criador, a galeria e as dicas.',
  },
  backLabel: 'Voltar ao meu perfil',
  introduction: {
    label: '01 / A PROPOSTA',
    paragraphs: [
      'O MeuTreino nasceu da vontade de organizar uma rotina de musculação prática, estruturada e fácil de acompanhar.',
      'A proposta é reunir exercícios, organização e informações que ajudem o usuário a compreender melhor a lógica de cada treinamento.',
      'Nesta página, compartilho os objetivos da minha rotina, minhas experiências e alguns princípios que orientam minhas escolhas.',
    ],
  },
  philosophy: {
    label: '02 / INTENÇÃO EM CADA SESSÃO',
    title: 'A filosofia do meu treino',
    paragraphs: [
      'Minha rotina possui uma atenção especial aos grupos musculares superiores, principalmente costas, ombros, peitoral e braços.',
      'A proposta é organizar os exercícios de maneira estratégica, priorizando técnica, consistência e acompanhamento da evolução.',
      'Mesmo com essa ênfase, considero importante manter um treinamento equilibrado, respeitando os demais grupos musculares, os períodos de recuperação e as necessidades individuais.',
    ],
    balance: 'Pernas, abdômen e recuperação também fazem parte. Esta é uma escolha pessoal de organização, não um padrão físico obrigatório.',
    objectives: ['Técnica', 'Consistência', 'Organização'],
  },
  groups: {
    label: '03 / OS PRINCIPAIS FOCOS',
    title: 'Uma rotina com direção.',
    items: [
      { id: 'costas', title: 'Costas', icon: 'rowing', description: 'Puxadas e remadas para trabalhar a região das costas, com atenção ao controle do movimento.' },
      { id: 'ombros', title: 'Ombros', icon: 'accessibility_new', description: 'Desenvolvimentos e elevações, respeitando a técnica e as possibilidades de cada movimento.' },
      { id: 'peitoral', title: 'Peitoral', icon: 'fitness_center', description: 'Exercícios de empurrar e diferentes padrões de movimento para organizar o trabalho do peitoral.' },
      { id: 'bracos', title: 'Braços', icon: 'exercise', description: 'Exercícios direcionados a bíceps e tríceps, distribuídos ao longo da rotina.' },
    ],
  },
  gallery: {
    label: '04 / ALÉM DOS REGISTROS',
    title: 'A experiência por trás da rotina.',
    description: 'Um espaço para compartilhar meus registros e minha relação com o treinamento.',
    placeholderLabel: 'REGISTROS DO CRIADOR',
    placeholderTitle: 'Uma história\nem construção.',
    placeholderDescription: 'As fotografias pessoais serão adicionadas em breve.',
  },
  tips: {
    label: '05 / O QUE LEVO COMIGO',
    title: 'Dicas e aprendizados',
    description: 'Experiências pessoais e informações gerais para pensar a rotina, sem promessas de resultados.',
    items: [
      { id: 'consistencia', title: 'Consistência', text: 'Manter uma rotina organizada pode ajudar a acompanhar o progresso e entender melhor a evolução ao longo do tempo.' },
      { id: 'tecnica', title: 'Técnica', text: 'Antes de aumentar a dificuldade de um exercício, vale dedicar atenção à execução correta e ao controle do movimento.' },
      { id: 'recuperacao', title: 'Recuperação', text: 'Descanso e recuperação fazem parte do processo de treinamento.' },
      { id: 'organizacao', title: 'Organização', text: 'Registrar séries, repetições e exercícios facilita identificar o que foi realizado em cada sessão.' },
    ],
  },
  guide: {
    label: '06 / SEU GUIA NO APP',
    title: 'Como funciona o MeuTreino?',
    items: [
      { id: 'dias', title: 'Como escolher meu treino?', text: 'No meu perfil, toque em Iniciar treino para abrir Minha divisão semanal. Cada cartão mostra o dia e seus grupos musculares. Toque em Ver exercícios para abrir a sessão. O botão Editar permite mudar os grupos daquele dia no seu celular.' },
      { id: 'exercicios', title: 'Como acompanhar meus exercícios?', text: 'Abra um exercício para ver suas quatro séries. Use os campos de carga e repetições para registrar os valores. Também é possível adicionar exercícios pela biblioteca de imagens, editar o nome, trocar a imagem, copiar para outro dia ou excluir um exercício.' },
      { id: 'descanso', title: 'Como funciona o descanso?', text: 'Dentro do treino, toque no contador para iniciar três minutos de descanso. Tocar novamente reinicia o tempo. Ao voltar de outro aplicativo para a mesma tela, a contagem considera o tempo decorrido. O aviso sonoro com o app em segundo plano ou com a tela bloqueada ainda não é garantido; não há notificação de descanso implementada.' },
      { id: 'evolucao', title: 'Como acompanhar minha evolução?', text: 'Você pode consultar e atualizar suas cargas e repetições. Exercícios com o mesmo nome compartilham essas alterações entre os dias. O aplicativo ainda não possui histórico de sessões concluídas ou gráficos de evolução; os valores são os registros atuais.' },
      { id: 'dados', title: 'Onde ficam meus registros?', text: 'Os dados ficam no seu celular e continuam salvos ao reabrir o aplicativo. Exportar minha rotina permite gerar um arquivo com os exercícios, séries e imagens associadas. Não há sincronização automática entre celulares. Desinstalar o app ou limpar seus dados pode apagar os registros locais.' },
    ],
  },
  signature: { label: 'CRIADO POR', name: 'Luiz Pedro', text: 'Uma rotina pessoal. Um propósito em cada treino.' },
} as const;

export type AboutMuscleGroup = typeof aboutMeuTreino.groups.items[number];
export type AboutGuideItem = typeof aboutMeuTreino.guide.items[number];

// Use require com o caminho literal depois de colocar o arquivo na pasta.
// Exemplo: source: require('../../assets/images/sobre-meutreino/apresentacao.jpg'),
export type AboutPhoto = {
  id: string;
  source: number | null;
  alt: string;
  title?: string;
  description?: string;
  order: number;
  visible: boolean;
  placement: 'hero' | 'gallery';
  // Ajuste o enquadramento sem modificar a fotografia original.
  position?: 'center' | 'top' | 'bottom';
};

export const aboutPhotos: readonly AboutPhoto[] = [
  {
    id: 'apresentacao',
    source: null,
    alt: 'Fotografia de apresentação do criador',
    title: 'Minha relação com o treino.',
    description: 'Organizar, praticar e aprender ao longo do caminho.',
    order: 1,
    visible: true,
    placement: 'hero',
    position: 'center',
  },
  {
    id: 'experiencia',
    source: null,
    alt: 'Registro pessoal de treinamento',
    title: 'Experiência',
    description: 'Espaço para um registro e um texto sobre minha rotina.',
    order: 2,
    visible: false,
    placement: 'gallery',
    position: 'center',
  },
  {
    id: 'consistencia',
    source: null,
    alt: 'Registro pessoal sobre consistência',
    title: 'Consistência',
    description: 'Espaço para compartilhar hábitos e organização.',
    order: 3,
    visible: false,
    placement: 'gallery',
    position: 'center',
  },
  {
    id: 'adicional',
    source: null,
    alt: 'Fotografia adicional do criador',
    order: 4,
    visible: false,
    placement: 'gallery',
    position: 'center',
  },
];
