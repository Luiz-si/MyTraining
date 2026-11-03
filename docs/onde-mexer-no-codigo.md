# Onde mexer no código do MeuTreino

Este é o mapa do projeto. Você não precisa entender todos os arquivos para alterar uma parte do aplicativo.

Cada arquivo de código começa com um comentário explicando o que faz, onde aparece e o que editar nele. Esses comentários são orientações para você; não aparecem no aplicativo.

## Comece pelo que você quer mudar

| Quero alterar… | Abra este arquivo |
| --- | --- |
| Tela que aparece ao abrir o app | [index.tsx](../src/app/index.tsx) |
| Foto, nome e botões na tela do perfil | [perfil.tsx](../src/app/perfil.tsx) |
| Qual foto usar e qual nome mostrar | [perfil-criador.ts](../src/data/perfil-criador.ts) |
| Cartões de segunda, terça e outros dias | [cartao-dia-treino.tsx](../src/components/cartao-dia-treino.tsx) |
| Formulário de edição dos grupos musculares | [treino.tsx](../src/app/treino.tsx) |
| Grupos musculares padrão da semana | [divisao-semanal.ts](../src/data/divisao-semanal.ts) |
| Cabeçalho e posição dos elementos dentro de um dia | [[id].tsx](../src/app/dia/[id].tsx) |
| Aparência do botão de descanso ou seu áudio | [cronometro-descanso.tsx](../src/components/cronometro-descanso.tsx) |
| Cartão de um exercício, imagem e botões | [cartao-exercicio.tsx](../src/features/exercicios/cartao-exercicio.tsx) |
| Campo de carga/repetições e botões + e − | [campo-carga-repeticoes.tsx](../src/features/exercicios/campo-carga-repeticoes.tsx) |
| Botão Adicionar exercício e lista do dia | [lista-exercicios-dia.tsx](../src/features/exercicios/lista-exercicios-dia.tsx) |
| Pesquisa por costas, antebraço e palavras relacionadas | [pesquisa-imagens.ts](../src/features/exercicios/pesquisa-imagens.ts) |
| Traduções dos nomes dos arquivos de imagem | [exercise-names-pt.cjs](../scripts/exercise-names-pt.cjs) |
| Cor verde, fundos, bordas e textos do app | [cores-app.ts](../src/constants/cores-app.ts) |
| Aparência dos botões padrão usados por várias telas | [tela-base.tsx](../src/components/tela-base.tsx) |
| Ícone instalado no celular | [app.json](../app.json), propriedades `icon` |
| Tamanho e borda do botão Minha proposta | [botao-minha-proposta.tsx](../src/features/minha-proposta/botao-minha-proposta.tsx) |
| Frases, filosofia, dicas e fotos de Minha proposta | [conteudo-minha-proposta.ts](../src/data/conteudo-minha-proposta.ts) |
| Tamanho das letras, cartões e espaços de Minha proposta | [estilos.ts](../src/features/minha-proposta/estilos.ts) |
| Enquadramento das fotos e efeito degradê | [foto-com-degrade.tsx](../src/features/minha-proposta/foto-com-degrade.tsx) |
| Perguntas que abrem e fecham | [pergunta-expansivel.tsx](../src/features/minha-proposta/pergunta-expansivel.tsx) |
| Ordem das seções de Minha proposta | [sobre-meutreino.tsx](../src/app/sobre-meutreino.tsx) |

Os caminhos são links: clique no nome para abrir o arquivo. Para encontrar uma propriedade dentro dele, use Ctrl + F e procure o nome, como `photo`, `fontSize` ou `minHeight`. Os números das linhas aparecem na margem do VS Code e mudam quando o código é editado.

## O que cada pasta significa

- **`src/app/` — telas:** cada arquivo de tela representa uma rota. Aqui você decide quais elementos aparecem e quais ações a tela oferece.
- **`src/components/` — peças reutilizáveis:** botões, estrutura de tela, cartões dos dias e contador. Uma peça pode aparecer em mais de uma tela.
- **`src/data/` — conteúdo e dados iniciais:** nomes, frases, grupos padrão e referências das imagens. Não é o banco atualizado do celular.
- **`src/constants/` — valores compartilhados:** principalmente as cores do app.
- **`src/features/` — funcionalidades:** reúne os arquivos de um mesmo assunto. `exercicios/`, `divisao-semanal/` e `minha-proposta/` são os três grupos principais.
- **`src/hooks/` — funções reutilizáveis do React:** os arquivos atuais dessa pasta tratam o tema dos componentes de exemplo.
- **`assets/` — recursos:** arquivos reais de imagem, ícone e som.
- **`scripts/` — ferramentas de desenvolvimento:** por exemplo, atualizar o catálogo de imagens. Não são telas.
- **`tests/` — verificações automatizadas:** exercitam as regras sem usar seu banco pessoal do celular.
- **`docs/` — explicações:** guias para consultar enquanto desenvolve.

## Tela, conteúdo e estilo são coisas diferentes

Exemplo da foto do criador:

1. `data/perfil-criador.ts` informa **qual imagem** usar.
2. `app/perfil.tsx` mostra a imagem e define **onde ela fica e o tamanho**.
3. `constants/cores-app.ts` fornece as **cores compartilhadas** da interface.

Exemplo de Minha proposta:

1. `data/conteudo-minha-proposta.ts` guarda **o que está escrito e quais fotos usar**.
2. `app/sobre-meutreino.tsx` define **a ordem das seções**.
3. `features/minha-proposta/estilos.ts` controla **a aparência geral da página**.
4. Os outros arquivos de `features/minha-proposta/` desenham **partes específicas**, como a foto, o botão e as perguntas.

Essa separação permite mudar uma frase sem precisar mexer no código do degradê, por exemplo.

## Como encontrar uma ação de um botão

Um botão pode receber sua ação de outra tela:

`app/treino.tsx` fornece as ações → `components/cartao-dia-treino.tsx` desenha os botões e chama essas ações ao toque.

Nesse cartão:

- `onPress` abre os exercícios do dia.
- `onEdit` seleciona o dia para editar os grupos.
- `Pressable` vem do React Native e detecta o toque; a função passada determina o que acontece.

Os nomes de funções e componentes existentes foram mantidos nesta organização. Assim, você ainda encontrará `WorkoutDayCard` dentro de `cartao-dia-treino.tsx`, por exemplo. O arquivo ganhou um nome explicativo; o componente continua funcionando como antes.

## Onde ficam os dados salvos

Não confunda três etapas:

1. **Tela:** recebe a digitação e os toques.
2. **Estado:** mantém os valores em memória e atualiza as telas.
3. **Banco:** grava os valores para continuarem disponíveis depois de fechar o app.

| Arquivo | Responsabilidade |
| --- | --- |
| [estado-exercicios.ts](../src/features/exercicios/estado-exercicios.ts) | Coordena cadastro, edição, cópia, exclusão e sincronização entre dias |
| [use-divisao-semanal.ts](../src/features/divisao-semanal/use-divisao-semanal.ts) | Compartilha os grupos musculares atualizados entre as telas |
| [conexao-banco.ts](../src/features/exercicios/conexao-banco.ts) | Abre o banco local `meutreino.db` |
| [consultas-banco.ts](../src/features/exercicios/consultas-banco.ts) | Cria tabelas e executa as leituras e gravações SQL |
| [fila-salvamento.ts](../src/features/exercicios/fila-salvamento.ts) | Salva as alterações em ordem e permite repetir gravações que falharam |
| [tipos-e-validacao.ts](../src/features/exercicios/tipos-e-validacao.ts) | Define o formato dos dados e verifica valores válidos |
| [exportar-rotina.ts](../src/features/exercicios/exportar-rotina.ts) | Gera o JSON para salvar ou compartilhar |

O banco real fica no armazenamento privado do aplicativo no celular. `creator-routine.json` é a cópia inicial incluída no projeto; não acompanha automaticamente as mudanças do celular.

## Por que alguns arquivos continuam em inglês?

- **`index.tsx`** define a rota inicial do Expo Router.
- **`_layout.tsx`** configura a navegação do Expo Router.
- **`[id].tsx`** é uma rota que recebe um identificador, como `segunda`.
- **`.web.tsx`** identifica uma versão escolhida para navegador.
- **`exercise-images.generated.ts`** é gerado pela ferramenta de imagens. O aviso no topo explica para não editá-lo manualmente.
- **`creator-routine.json`** contém os dados exportados usados na primeira inicialização.
- Bibliotecas, propriedades e funções prontas, como `Pressable`, `useState`, `fontSize` e `onPress`, continuam com seus nomes da API.

Arquivos do modelo Expo, como `explore.tsx`, `app-tabs.tsx` e `animated-icon.tsx`, foram identificados no comentário do topo como exemplos. Eles não são a tela principal, o ícone Android nem o contador de descanso do MeuTreino. Foram preservados para evitar apagar conteúdo fora do escopo.

## Nomes antigos → nomes atuais

Se uma aba antiga do VS Code ficou aberta, use esta tabela para localizar o novo arquivo. Todos os caminhos abaixo partem de `src/`.

| Nome antigo | Nome atual |
| --- | --- |
| `components/workout-screen.tsx` | [components/tela-base.tsx](../src/components/tela-base.tsx) |
| `components/workout-day-card.tsx` | [components/cartao-dia-treino.tsx](../src/components/cartao-dia-treino.tsx) |
| `components/rest-timer.tsx` | [components/cronometro-descanso.tsx](../src/components/cronometro-descanso.tsx) |
| `components/home-entrance.tsx` | [components/animacao-inicial.tsx](../src/components/animacao-inicial.tsx) |
| `constants/workout-colors.ts` | [constants/cores-app.ts](../src/constants/cores-app.ts) |
| `data/creator.ts` | [data/perfil-criador.ts](../src/data/perfil-criador.ts) |
| `data/workouts.ts` | [data/divisao-semanal.ts](../src/data/divisao-semanal.ts) |
| `data/about-meutreino.ts` | [data/conteudo-minha-proposta.ts](../src/data/conteudo-minha-proposta.ts) |
| `features/about/about-styles.ts` | [features/minha-proposta/estilos.ts](../src/features/minha-proposta/estilos.ts) |
| `features/about/about-entry.tsx` | [features/minha-proposta/botao-minha-proposta.tsx](../src/features/minha-proposta/botao-minha-proposta.tsx) |
| `features/about/photo-story.tsx` | [features/minha-proposta/foto-com-degrade.tsx](../src/features/minha-proposta/foto-com-degrade.tsx) |
| `features/about/about-reveal.tsx` | [features/minha-proposta/animacao-entrada.tsx](../src/features/minha-proposta/animacao-entrada.tsx) |
| `features/about/about-accordion.tsx` | [features/minha-proposta/pergunta-expansivel.tsx](../src/features/minha-proposta/pergunta-expansivel.tsx) |
| `features/workouts/use-weekly-split.ts` | [features/divisao-semanal/use-divisao-semanal.ts](../src/features/divisao-semanal/use-divisao-semanal.ts) |
| `features/exercises/day-exercises.tsx` | [features/exercicios/lista-exercicios-dia.tsx](../src/features/exercicios/lista-exercicios-dia.tsx) |
| `features/exercises/exercise-card.tsx` | [features/exercicios/cartao-exercicio.tsx](../src/features/exercicios/cartao-exercicio.tsx) |
| `features/exercises/exercise-image.tsx` | [features/exercicios/imagem-exercicio.tsx](../src/features/exercicios/imagem-exercicio.tsx) |
| `features/exercises/numeric-control.tsx` | [features/exercicios/campo-carga-repeticoes.tsx](../src/features/exercicios/campo-carga-repeticoes.tsx) |
| `features/exercises/image-library-modal.tsx` | [features/exercicios/seletor-biblioteca-imagens.tsx](../src/features/exercicios/seletor-biblioteca-imagens.tsx) |
| `features/exercises/copy-exercise-modal.tsx` | [features/exercicios/seletor-dia-para-copiar.tsx](../src/features/exercicios/seletor-dia-para-copiar.tsx) |
| `features/exercises/library-search.ts` | [features/exercicios/pesquisa-imagens.ts](../src/features/exercicios/pesquisa-imagens.ts) |
| `features/exercises/images.ts` | [features/exercicios/fotos-do-celular.ts](../src/features/exercicios/fotos-do-celular.ts) |
| `features/exercises/model.ts` | [features/exercicios/tipos-e-validacao.ts](../src/features/exercicios/tipos-e-validacao.ts) |
| `features/exercises/store.ts` | [features/exercicios/estado-exercicios.ts](../src/features/exercicios/estado-exercicios.ts) |
| `features/exercises/repository.ts` | [features/exercicios/consultas-banco.ts](../src/features/exercicios/consultas-banco.ts) |
| `features/exercises/database.ts` | [features/exercicios/conexao-banco.ts](../src/features/exercicios/conexao-banco.ts) |
| `features/exercises/initial-routine.ts` | [features/exercicios/carregar-rotina-inicial.ts](../src/features/exercicios/carregar-rotina-inicial.ts) |
| `features/exercises/write-queue.ts` | [features/exercicios/fila-salvamento.ts](../src/features/exercicios/fila-salvamento.ts) |
| `features/exercises/export-routine.ts` | [features/exercicios/exportar-rotina.ts](../src/features/exercicios/exportar-rotina.ts) |
| `features/exercises/export-routine-button.tsx` | [features/exercicios/botao-exportar-rotina.tsx](../src/features/exercicios/botao-exportar-rotina.tsx) |

## Atalhos úteis do VS Code

- **Ctrl + P:** procurar um arquivo pelo nome, como `cronometro-descanso`.
- **Ctrl + F:** procurar uma palavra no arquivo aberto.
- **Ctrl + Shift + F:** procurar uma palavra no projeto inteiro.
- **F12 sobre uma função ou componente:** tentar abrir o lugar onde foi definido.
- **Ctrl + S:** salvar suas alterações.

Se a barra do editor mostrar uma aba de um nome antigo, feche essa aba e abra o novo arquivo pelo Ctrl + P.

## Palavras que aparecem nos estilos

| Propriedade | O que controla |
| --- | --- |
| `fontSize` | Tamanho das letras |
| `lineHeight` | Altura de cada linha de texto |
| `color` | Cor do texto |
| `backgroundColor` | Cor do fundo |
| `borderColor` | Cor da borda |
| `borderWidth` | Espessura da borda |
| `borderRadius` | Arredondamento dos cantos |
| `padding` | Espaço interno, entre conteúdo e borda |
| `margin` | Espaço externo |
| `gap` | Espaço entre elementos filhos |
| `minHeight` | Altura mínima |
| `width` e `height` | Largura e altura |
| `flexDirection` | Organiza os filhos em linha ou coluna |
| `alignItems` e `justifyContent` | Alinhamento dentro do contêiner, conforme a direção do layout |

Você não precisa decorar tudo. Use este mapa, procure a propriedade que quer ajustar e faça uma mudança por vez.

