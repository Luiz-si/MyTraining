# Como funciona “Seu próprio treino”

Esta área permite manter várias rotinas independentes no celular. O perfil e a divisão do criador continuam separados. Não há conta, servidor ou banco na nuvem.

## 1. O que aparece na tela

Na página inicial, “Seu próprio treino” abre o botão **Explorar modelos** e a seção **Minhas rotinas**. Todos os cartões têm bordas verdes e degradê. Esse botão abre a escolha entre modelos e a opção **Criar do zero**, sem dois atalhos para o mesmo lugar.

Uma lista virtualizada (`FlatList`) desenha os cartões conforme são necessários, sem montar de uma vez uma tela enorme. O botão `⋯` abre renomear, duplicar e excluir. Você pode abrir diretamente qualquer rotina, sem definir uma como ativa.

Na primeira preparação do banco, criamos **Minha divisão semanal**, com superiores na segunda e quinta, inferiores na terça e sexta e descanso nos demais dias. Ela começa sem exercícios: você escolhe os seus. A rotina antiga do criador não é movida, apagada ou copiada para esta área.

## 2. Arquivos: onde mexer

Os números das linhas podem mudar conforme você edita. Use Ctrl+P para abrir o caminho e Ctrl+F para encontrar o nome indicado.

| Arquivo | Responsabilidade e trecho para localizar |
| --- | --- |
| [src/app/seu-treino.tsx](../src/app/seu-treino.tsx) | Tela de entrada, lista de rotinas e botões. Procure `PersonalWorkoutScreen` e `open` |
| [src/app/rotina/[id].tsx](../src/app/rotina/[id].tsx) | Divisão semanal da rotina selecionada. Procure `RoutineScreen` |
| [src/app/rotina/[id]/dia/[diaId].tsx](../src/app/rotina/[id]/dia/[diaId].tsx) | Exercícios de um dia pessoal. Procure `PersonalDayScreen` |
| [src/data/modelos-rotinas.ts](../src/data/modelos-rotinas.ts) | Nomes, descrições e sete sessões de cada modelo. Procure `routineModels` |
| [componentes-rotinas.tsx](../src/features/rotinas/componentes-rotinas.tsx) | `RoutineCard` desenha um cartão; `RoutineSheet` desenha a janela; `SmallAction` desenha um botão discreto |
| [catalogo-modelos.tsx](../src/features/rotinas/catalogo-modelos.tsx) | Lista de modelos, prévia dos dias e formulário de nome |
| [menu-rotina.tsx](../src/features/rotinas/menu-rotina.tsx) | Renomear, duplicar e confirmação de exclusão |
| [editor-dia.tsx](../src/features/rotinas/editor-dia.tsx) | Nome da sessão, grupos musculares e chave de descanso |
| [estilos-rotinas.ts](../src/features/rotinas/estilos-rotinas.ts) | Aparência própria desta área, sem alterar o perfil |
| [tipos-rotina.ts](../src/features/rotinas/tipos-rotina.ts) | Formato TypeScript de rotina e dia |
| [estado-rotinas.ts](../src/features/rotinas/estado-rotinas.ts) | Lê e salva dados, atualiza telas e coordena cópias de fotos |
| [consultas-rotinas.ts](../src/features/rotinas/consultas-rotinas.ts) | Criação de tabelas, validação, consultas e transações SQLite |
| [fila-banco.ts](../src/features/rotinas/fila-banco.ts) | Impede consultas concorrentes de entrarem dentro da transação de outra operação |
| [conexao-banco.ts](../src/features/exercicios/conexao-banco.ts) | Abre `meutreino.db`, inicializa as duas áreas e compartilha a fila |

Componentes reaproveitados:

| Arquivo | O que continua fazendo |
| --- | --- |
| [cartao-dia-treino.tsx](../src/components/cartao-dia-treino.tsx) | Cartão de dia semanal, agora com opções de sessão, descanso e quantidade de exercícios |
| [lista-exercicios-dia.tsx](../src/features/exercicios/lista-exercicios-dia.tsx) | Cadastro de exercícios e escolha na biblioteca ou galeria |
| [cartao-exercicio.tsx](../src/features/exercicios/cartao-exercicio.tsx) | Imagem, nome, carga, repetições, séries e ações do exercício |
| [estado-exercicios.ts](../src/features/exercicios/estado-exercicios.ts) | Cache por dia, fila de salvamento, cópia, reordenação e sincronização dentro da mesma rotina |
| [consultas-banco.ts](../src/features/exercicios/consultas-banco.ts) | Guarda e consulta os exercícios na tabela existente |
| [tipos-e-validacao.ts](../src/features/exercicios/tipos-e-validacao.ts) | Valida o exercício; quatro séries no criador, de uma a doze nas rotinas pessoais |
| [seletor-dia-para-copiar.tsx](../src/features/exercicios/seletor-dia-para-copiar.tsx) | Oferece como destino somente dias de treino da mesma rotina |
| [cronometro-descanso.tsx](../src/components/cronometro-descanso.tsx) | O mesmo componente de descanso de três minutos, com áudio |

## 3. Como adicionar um modelo

Para mudar o **nome da rotina inicial** pelo código, edite `DEFAULT_ROUTINE_NAME` no início de `src/features/rotinas/consultas-rotinas.ts`. Ao recarregar o aplicativo, a rotina padrão já salva também acompanha esse nome. Um marcador guarda seu ID e o último nome padrão: cópias, outras rotinas e nomes personalizados pelo usuário não são substituídos, e uma rotina excluída não é recriada. Essa atualização muda somente o nome, preservando os dias e exercícios.

Em `src/data/modelos-rotinas.ts`, acrescente um objeto ao array `routineModels`. Não reutilize um `id` existente. `sessions` deve ter exatamente sete posições, de segunda a domingo; `null` significa descanso.

```ts
{
  id: 'meu-modelo',
  name: 'Minha divisão de exemplo',
  description: 'Descrição da organização.',
  sessions: [
    { name: 'A', muscles: ['Peito', 'Tríceps'] }, // segunda
    null,                                     // terça
    { name: 'B', muscles: ['Costas', 'Bíceps'] },// quarta
    null,                                     // quinta
    { name: 'C', muscles: ['Pernas'] },         // sexta
    null,                                     // sábado
    null,                                     // domingo
  ],
}
```

Isso adiciona uma opção à biblioteca. **Não altera rotinas já criadas**: ao escolher um modelo, seus dados são copiados para uma nova rotina, que passa a ser independente do modelo.

Para criar do zero, escolha essa opção, dê um nome e use **Editar** nos dias desejados. Desative “Dia de descanso”, escreva o nome da sessão e os grupos separados por vírgula e salve. A quantidade de dias é calculada pelos dias de treino ativados, de zero a sete; inclusive domingo pode ser treino.

## 4. Como mudar o visual e os textos

Em `estilos-rotinas.ts`, `card` controla o cartão da rotina; `greenCard` controla a borda verde e o degradê de todos os cartões; `input` controla os campos e `panel` controla a janela. Exemplos:

```ts
borderRadius: 22, // arredondamento dos cantos
padding: 20,      // espaço dentro do componente
gap: 14,          // distância entre seus elementos
borderWidth: 1,   // espessura da borda
```

`backgroundColor` muda o fundo, `borderColor` muda a borda e `fontSize` muda o tamanho da letra. `flexDirection: 'row'` organiza elementos lado a lado. As cores vêm de `src/constants/cores-app.ts`: mudar esse arquivo afeta outras áreas do app também.

Os textos dos botões ficam na propriedade `label` dos componentes, por exemplo `<Button label="Explorar modelos" ... />` na tela `seu-treino.tsx`. As janelas usam a animação suave `fade` do `Modal`. O visual dos **dias** continua em `src/components/cartao-dia-treino.tsx`, compartilhado com a divisão do criador; suas opções novas são usadas apenas quando fornecidas.

## 5. Como funciona a navegação

O Expo Router associa os arquivos dentro de `src/app` às telas. Para abrir uma rotina, a função `open` usa:

```tsx
router.push({ pathname: '/rotina/[id]', params: { id } });
```

`id` identifica qual rotina deve ser lida. Na tela, `useLocalSearchParams` recebe esse valor. O caminho dos exercícios também recebe o dia:

```tsx
router.push({
  pathname: '/rotina/[id]/dia/[diaId]',
  params: { id: routine.id, diaId: String(day.weekday) },
});
```

O `diaId` da URL vai de `0` (segunda) a `6` (domingo). A tela procura esse dia **dentro da rotina recebida**. Só então passa seu identificador completo para `<DayExercises dayId={day.id} />`. Os botões de voltar usam `router.dismissTo`, e o botão Voltar do Android segue a pilha do Router.

## 6. Como os dados ficam salvos

Continuamos usando o mesmo SQLite, `meutreino.db`, na pasta privada do app no celular:

- `personal_routines`: nome, modelo e datas. A antiga coluna `active` permanece apenas para compatibilidade com bancos já instalados; o aplicativo não a utiliza.
- `personal_routine_days`: sete dias por rotina, sessão, músculos e descanso.
- `creator_exercises`: tabela existente de exercícios, reutilizada pelas duas áreas. Apesar do nome histórico, também armazena exercícios pessoais.
- `creator_metadata`: guarda o marcador de que a rotina pessoal inicial já foi preparada.

O dia pessoal possui um ID como `personal:ID-DA-ROTINA:0`. O exercício guarda esse valor em `day_id`. Os dias antigos do criador continuam `segunda`, `terca` etc. Eles não são renomeados pela migração. Os IDs não mudam ao editar nomes, por isso renomear não perde exercícios.

O nome do modelo fica como referência; editar uma rotina não muda as outras. Os agrupamentos são guardados como JSON: uma lista como `["Peito", "Tríceps"]` convertida em texto para uma coluna SQL. As séries usam JSON da mesma forma.

Ao abrir o app, criamos as tabelas que faltarem com `CREATE TABLE IF NOT EXISTS`. O marcador de inicialização impede recriar rotinas excluídas. Uma instalação usada mantém todos os exercícios do criador. As operações de criação, duplicação e exclusão usam **transações**: uma confirmação conjunta ou reversão se houver erro. A fila compartilhada impede transações de operações diferentes de se misturarem na mesma conexão.

## 7. Exercícios, cópias, séries e exclusão

Adicionar um exercício reaproveita a biblioteca, o seletor de fotos e o formulário atuais. Os exercícios novos começam com quatro séries. Nas rotinas pessoais, **+ Série** e **− Série** permitem de uma a doze séries, sem mudar o padrão do criador. Remover a última série pede confirmação. **Mover acima/abaixo** muda a ordem somente naquele dia.

Alterações de carga e repetições continuam sincronizando exercícios de mesmo nome **dentro da mesma rotina**. Outra rotina, uma cópia da rotina e o criador mantêm seus próprios valores. A quantidade de séries é específica de cada exercício; aumentar ou diminuir não altera a quantidade dos outros.

**Duplicar** cria IDs novos para a rotina, os dias e os exercícios. As séries são copiadas como dados independentes. Imagens da biblioteca reutilizam a referência ao arquivo incluído no app; fotos da galeria recebem cópias físicas próprias. Se a cópia falhar, a nova rotina não fica gravada pela metade e as fotos temporárias são limpas.

**Excluir** pede confirmação e remove somente exercícios e dias associados ao ID daquela rotina. As fotos próprias são limpas após confirmar a exclusão no banco. Se não restar nenhuma rotina, aparece o estado vazio. O marcador permanece, portanto a rotina padrão não reaparece na próxima abertura.

**Descanso** não significa exclusão: marcar um dia como descanso guarda seus exercícios e impede cadastrar novos naquele dia até reativá-lo. É possível depois recuperar o mesmo treino desativando o descanso.

## 8. Como ampliar depois

Para uma funcionalidade nova, identifique primeiro se muda a tela, as regras ou o banco. Por exemplo, para adicionar uma observação à rotina, crie uma coluna por migração sem apagar tabelas, acrescente o campo ao tipo, leia e salve no repositório e só então conecte um campo da interface. Escreva um teste que feche e reabra um banco temporário para verificar a persistência.

Não é preciso editar os exercícios para adicionar um novo modelo. Não é preciso mexer em SQL para mudar bordas ou letras. Nunca teste migrações apagando o banco real de alguém.

## Exercícios sugeridos nos modelos

Em **Explorar modelos**, selecione Full Body, AB, ABC, ABCD, ABCDE, Push/Pull/Legs ou Upper/Lower. A tela mostra os sete dias, músculos e exercícios com miniaturas. Dê um nome e escolha **Criar rotina com estes exercícios** ou **Criar somente a divisão, sem exercícios**. A opção **Criar do zero** continua vazia.

As sugestões são pontos de partida editáveis, não uma prescrição individual. As sessões têm listas moderadas e as versões A e B variam os movimentos. A divisão pré-definida já instalada e as outras rotinas existentes não são preenchidas retroativamente.

### Onde editar as sugestões e as imagens

Em [src/data/exercicios-recomendados.ts](../src/data/exercicios-recomendados.ts), `recommendedExercises` guarda o nome, grupo muscular e ID da imagem de cada sugestão. O campo `imageId` corresponde exatamente ao `id` do catálogo `exercise-images.generated.ts`, que aponta para o arquivo físico. Não há pesquisa aproximada, download ou troca automática por exercício parecido.

```ts
supino: {
  id: 'supino',
  name: 'Supino reto',
  muscles: 'Peito',
  imageId: 'bench-press-start.webp',
},
```

`recommendationsByModel` usa sete listas de IDs, de segunda a domingo. Para incluir o supino em uma sessão, adicione `'supino'` à lista daquele dia. Um dia de descanso tem lista vazia. Ao acrescentar uma sugestão, use um ID único e confira o movimento na imagem antes de associá-lo. Rode `npm run images:sync` se tiver incluído arquivos novos: esse comando atualiza o catálogo da biblioteca.

O cartão continua mostrando uma imagem, como antes desta entrega. Os arquivos de início/fim permanecem disponíveis na biblioteca; as sugestões usam a imagem inicial. Se um arquivo deixar de existir no catálogo, `prepareModelRecommendations` usa imagem nula e o componente existente mostra seu placeholder, sem escolher uma imagem incorreta.

### Por que os campos ficam vazios

As séries pessoais podem ser `{ weight: null, repetitions: null }`. `null` quer dizer **não preenchido**, enquanto `'0'`/`0` representam valores explicitamente informados pelo usuário. Não alteramos zeros já salvos em instalações antigas. Não é necessário trocar o tipo da coluna: as séries já são guardadas como JSON, que aceita `null`.

`NumericControl` mostra um placeholder para vazio. Digitar um número preenche o campo; apagar tudo salva `null`; o botão **+** em um campo vazio insere 1 por ação do usuário; **−** fica desabilitado em vazio ou zero. A validação rejeita valores negativos. A edição de um campo não preenche automaticamente o outro. O criador mantém os dados e o comportamento numérico anteriores.

### Criação, personalização e arquivos alterados

Os exercícios sugeridos são inseridos pela mesma transação que cria a rotina e os sete dias. Cada exercício recebe ID próprio, ordem, imagem, referência opcional `recommendation_id` e quatro séries vazias. A coluna opcional é acrescentada com `ALTER TABLE`, preservando as linhas existentes. O botão usa uma trava contra toques repetidos. Abrir uma rotina não chama a inserção de sugestões, portanto não recria exercícios removidos nem sobrescreve valores ou nomes editados.

Depois da criação, você pode remover, renomear, trocar a imagem, copiar, mudar séries e ordem ou adicionar outro exercício com os controles existentes. Alterações futuras no arquivo de sugestões só afetam novas rotinas. A sincronização de cargas continua limitada à mesma rotina.

| Arquivo criado ou modificado nesta atualização | Responsabilidade |
| --- | --- |
| `src/data/exercicios-recomendados.ts` (novo) | Catálogo explícito e distribuição das sugestões por modelo/dia |
| `src/data/modelos-rotinas.ts` | Comentário indicando onde ficam as sugestões |
| `src/features/rotinas/catalogo-modelos.tsx` | Prévia com imagens e opções com/sem exercícios |
| `src/features/rotinas/componentes-rotinas.tsx` | Reinicia a rolagem ao selecionar um modelo |
| `src/features/rotinas/estilos-rotinas.ts` | Estilo da miniatura ao lado do nome na prévia |
| `src/features/rotinas/estado-rotinas.ts` | Prepara as sugestões quando o usuário confirma a criação |
| `src/features/rotinas/consultas-rotinas.ts` | Insere sugestões na transação e preserva sua origem nas cópias |
| `src/features/exercicios/tipos-e-validacao.ts` | Séries pessoais nulas e regras de incremento |
| `src/features/exercicios/consultas-banco.ts` | Migração opcional, persistência e limpeza de campos com `null` |
| `src/features/exercicios/estado-exercicios.ts` | Campos inicialmente vazios em cadastros pessoais |
| `src/features/exercicios/campo-carga-repeticoes.tsx` | Placeholder e digitação/limpeza de valores vazios |
| `src/features/exercicios/cartao-exercicio.tsx` | Identifica sugestões editáveis e exibe séries vazias |
| `tests/recommended-exercises.test.mjs` (novo) | Testes de sugestões, imagens, campos vazios, persistência e isolamento |
| `README.md`, `docs/onde-mexer-no-codigo.md` e este guia | Explicações atualizadas |

Os testes verificam os sete modelos, os IDs de imagem contra os arquivos e o catálogo reais, quatro séries nulas, edição e reabertura do banco, exclusão independente, criação sem sugestões, ausência de duplicação e reversão de inserção parcial. Também foi feita inspeção visual das 22 imagens escolhidas; as ilustrações existentes não foram modificadas. A aparência e os toques no aparelho precisam de teste manual no Android.

## Referências dos modelos de treino

A [NSCA, Determination of Resistance Training Frequency](https://www.nsca.com/education/articles/kinetic-select/determination-of-resistance-training-frequency/) discute sessões de corpo inteiro, divisões por partes do corpo ou movimentos e um exemplo de superiores/inferiores em quatro dias. A escolha depende da experiência, carga de treino, recuperação e disponibilidade.

A [atualização da ACSM de 2026](https://acsm.org/resistance-training-guidelines-update-2026/) destaca consistência, individualização e frequência dos grandes grupos musculares. Os exemplos ABC, ABCD e ABCDE implementados seguem a organização solicitada para o MeuTreino e **não são programas prescritos ou aprovados individualmente por essas entidades**. Modelos com uma sessão por grupo na semana não devem ser apresentados como superiores aos demais nem como cumprimento automático da frequência discutida pela ACSM.

## Validação e limites

Inventário desta implementação:

- **Criados:** as duas telas `src/app/rotina/[id].tsx` e `src/app/rotina/[id]/dia/[diaId].tsx`; `src/data/modelos-rotinas.ts`; os nove arquivos de `src/features/rotinas/` listados na tabela acima; `tests/personal-routines.test.mjs`; e este documento.
- **Modificados:** `src/app/seu-treino.tsx` (entrada da área pessoal), `src/app/_layout.tsx` (registro das rotas), `src/components/cartao-dia-treino.tsx` (opções de sessão, descanso e contagem), `src/features/exercicios/conexao-banco.ts` (conexão compartilhada), `consultas-banco.ts` (separação de rotinas e ordem), `estado-exercicios.ts` (cache e sincronização por rotina), `tipos-e-validacao.ts` (quantidade de séries), `cartao-exercicio.tsx` (controles pessoais), `seletor-dia-para-copiar.tsx` (destinos na mesma rotina), `README.md` e `docs/onde-mexer-no-codigo.md`.
- O componente de descanso e seus testes já existiam da tarefa anterior; foram reutilizados. Nenhuma dependência nova foi instalada. O perfil, a tela da divisão do criador, seus dados iniciais e sua tela de exercícios não foram editados nesta tarefa.

`node --test tests/*.test.mjs` executa os testes automatizados em bancos temporários com Node.js 24. `npx tsc --noEmit` verifica os tipos sem gerar arquivos. `npx expo lint` verifica problemas no código. Nenhum desses comandos apaga o banco do celular.

Resultado desta entrega: **52 testes passaram**, incluindo testes de rotinas e recomendações; TypeScript e lint sem erros; exportação do bundle Android de produção concluída. A execução visual e o uso de fotos/áudio num aparelho Android não foram realizados aqui.

Os testes incluem criação inicial, migração, reabertura, isolamento entre rotinas, compatibilidade com bancos antigos, validação, descanso no domingo, duplicação, exclusão, falhas de transação, séries e ordem. A biblioteca e o cronômetro mantêm seus testes anteriores.

O cronômetro é o mesmo componente de três minutos. Calcula o tempo real ao retornar à tela, mas não agenda notificação/alarme garantido em segundo plano, nem mantém a contagem após fechar o processo ou sair da tela. Não há pausa nesta versão.

A exportação do perfil continua exportando **apenas a rotina do criador**, sem incluir rotinas pessoais. Não há importação ou sincronização na nuvem, histórico por data ou gráficos de evolução nesta entrega. Fechar normalmente o app preserva o banco; desinstalar ou limpar os dados do sistema pode removê-lo.

Verificação manual no Android: abrir a área pessoal, criar ABC e um modelo vazio, ativar domingo, adicionar imagem da biblioteca e foto, editar séries e cargas, alternar rotinas, duplicar, excluir a original, reabrir o APK e conferir a cópia. Testar também teclado, rolagem, voltar do Android e áudio. Testes de SQLite e compilação não substituem essa conferência visual em um aparelho.
