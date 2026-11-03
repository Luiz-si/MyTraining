# Por trás do MeuTreino

## Onde acessar

No perfil, o título “Por trás do MeuTreino” permanece no topo do cartão. O botão “Conheça minha proposta” fica abaixo da descrição do criador, com subtítulo e seta. Ele abre a rota `/sobre-meutreino`, sem substituir a página do perfil ou a divisão semanal. Os botões de retorno usam `router.dismissTo('/perfil')`; o botão voltar do Android também funciona pela pilha do Expo Router.

## Arquivos desta página

- `src/app/sobre-meutreino.tsx`: monta e ordena as seções da página. A rolagem usa `FlatList`, com poucos blocos renderizados inicialmente.
- `src/data/conteudo-minha-proposta.ts`: todos os textos, grupos musculares, dicas, perguntas e configuração das fotos.
- `src/features/minha-proposta/botao-minha-proposta.tsx`: botão de acesso no perfil.
- `src/features/minha-proposta/estilos.ts`: aparência da página, usando a paleta verde compartilhada.
- `src/features/minha-proposta/foto-com-degrade.tsx`: fotografia com degradê e alternativa visual quando ainda não existe foto ou ocorre falha ao carregar.
- `src/features/minha-proposta/pergunta-expansivel.tsx`: perguntas que abrem e fecham com texto explicativo.
- `src/features/minha-proposta/animacao-entrada.tsx`: entrada discreta dos blocos.
- `assets/images/sobre-meutreino/`: pasta preparada para as fotos reais.

Foram alterados somente `src/app/perfil.tsx` (entrada) e `src/app/_layout.tsx` (registro da rota) entre os arquivos existentes desta funcionalidade. Banco, exercícios, séries, imagens da biblioteca, cronômetro e sons não foram alterados. Não houve instalação de dependências nesta implementação.

## Como editar os textos

Abra `src/data/conteudo-minha-proposta.ts`:

- `title`, `heading`, `subtitle`: apresentação principal.
- `introduction.paragraphs`: parágrafos de apresentação.
- `philosophy`: filosofia, objetivos e texto sobre equilíbrio da rotina.
- `groups.items`: cartões de costas, ombros, peitoral e braços.
- `gallery`: textos da galeria e do espaço sem foto.
- `tips.items`: dicas; cada uma tem um `id` único, `title` e `text`.
- `guide.items`: perguntas e respostas sobre as funções reais do app.
- `signature`: assinatura do criador.

Para adicionar uma dica, acrescente outro objeto ao array `tips.items`, com um identificador diferente dos existentes. Para remover uma dica, remova o objeto dela. Preserve as vírgulas e aspas do TypeScript.

O guia explica as funções atuais. Não apresenta histórico de sessões, gráficos, sincronização entre celulares ou notificações de descanso como funcionalidades prontas.

## Adicionar a primeira foto

1. Coloque sua fotografia em `assets/images/sobre-meutreino/apresentacao.jpg`.
2. Abra `src/data/conteudo-minha-proposta.ts` e encontre o objeto `id: 'apresentacao'` dentro de `aboutPhotos`.
3. Substitua somente `source: null` desse objeto por:

```tsx
source: require('../../assets/images/sobre-meutreino/apresentacao.jpg'),
```

4. Mantenha `visible: true` e `placement: 'hero'` para a imagem aparecer antes da filosofia.
5. Edite `alt` para descrever a fotografia, e personalize `title` e `description`. Os dois últimos são opcionais.

O `require` precisa ter um caminho literal e o arquivo deve existir. Não use `require(variavel)` nem copie caminhos do Windows como `C:\Users\...`. A referência parte da pasta do arquivo de configuração.

## Adicionar outras fotos

Os objetos `experiencia`, `consistencia` e `adicional` já estão preparados. Coloque o arquivo na mesma pasta, troque `source: null` por um `require` literal e altere `visible: false` para `visible: true`.

Você também pode acrescentar outro objeto:

```tsx
{
  id: 'meu-novo-registro',
  source: require('../../assets/images/sobre-meutreino/meu-registro.jpg'),
  alt: 'Descreva aqui o que aparece na sua fotografia',
  title: 'Título opcional',
  description: 'Texto opcional sobre este registro.',
  order: 5,
  visible: true,
  placement: 'gallery',
  position: 'center',
},
```

Esse exemplo só deve ser adicionado depois de criar o arquivo referido. `placement: 'gallery'` coloca a foto entre os cartões musculares e as dicas. `order` organiza as fotos de cada área do menor número para o maior. `position` pode ser `'top'`, `'center'` ou `'bottom'`, para ajustar o enquadramento. `visible: false` esconde o item; para retirar sua imagem do pacote final também remova a referência `require`.

As imagens não são enviadas por uma função de upload do aplicativo nem buscadas na internet: são recursos locais incorporados ao app na compilação. Ao compartilhar o APK, as fotos nele incluídas também ficam disponíveis para quem o instala. Para a compilação na nuvem, os arquivos precisam acompanhar o projeto enviado ao EAS, assim como a foto atual do perfil. Não adicione uma regra de exclusão para essas fotos no `.easignore` sem uma exceção para os arquivos usados.

## Como funciona o efeito visual

`PhotoStory` usa `expo-image`, já instalado. A imagem ocupa uma área responsiva e usa `contentFit="cover"`, com posição configurável. O tamanho de exibição e o downscaling ajudam a controlar a memória; o cache é de memória e disco.

Acima da foto ficam duas camadas `View` com `backgroundImage: 'linear-gradient(...)'`, suportado pelo React Native 0.88 do projeto. A camada vertical passa de transparente para a cor exata do fundo (`#0C100F`); a horizontal suaviza as laterais. Isso cria uma fusão progressiva, em vez de um retângulo opaco. As legendas ficam fora da área da foto, para preservar a legibilidade.

Quando `source` é `null`, não há tentativa de carregar uma imagem inexistente. O espaço principal mostra um fundo verde abstrato discreto. Os espaços adicionais começam ocultos, evitando uma página cheia de fotografias vazias.

Use fotos previamente redimensionadas, por exemplo com 1200 a 1600 pixels no maior lado, e compressão JPEG ou WebP adequada. Uma imagem enorme continua aumentando o APK, mesmo que a tela use downscaling. Recorte e remova metadados de localização no editor antes de adicionar suas imagens, se estiverem presentes. O aplicativo não solicita nem cadastra localização para esta página.

## Animações e acessibilidade

As animações usam o Reanimated que já existia. Os blocos entram com fade e deslocamento discreto de 280 ms quando montados pela lista. As perguntas usam transições de layout, fade e giro de seta de aproximadamente 180 ms. `ReduceMotion.System` respeita a preferência de redução de movimento. A transição das fotografias também é desativada quando a preferência está ativa ao abrir o app.

As perguntas anunciam seu estado expandido ao leitor de tela; imagens têm descrição; ícones decorativos não precisam ser lidos. Os cartões musculares passam para uma coluna em telas estreitas e com fonte ampliada. A página respeita as áreas seguras do Android.

## Verificação no celular

- Abrir o perfil, tocar na entrada e retornar pelo botão e pelo voltar do Android.
- Rolar a página em uma tela pequena e com fonte ampliada.
- Abrir e fechar cada pergunta.
- Adicionar uma foto real e conferir enquadramento, fade e descrição.
- Conferir novamente os treinos e o contador.

A verificação automática de compilação não substitui esses testes visuais no aparelho. Nenhuma fotografia nova foi fornecida nesta implementação. Esta página não entra no APK que já estava na fila antes da alteração; será necessária uma compilação posterior.

Validações executadas nesta implementação: lint, TypeScript, 22 testes de regressão existentes, leitura e validação da configuração de conteúdo/fotos, inicialização do Metro em modo offline na porta 8083 e exportação Android completa. O servidor temporário de verificação foi encerrado depois dos testes. Toques, retorno pelo botão físico, renderização de fotos reais, animações e diferentes tamanhos de tela não foram testados em aparelho ou emulador nesta execução.
