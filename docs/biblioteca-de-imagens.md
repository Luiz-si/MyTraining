# Biblioteca local de imagens

1. Baixe no computador uma imagem que você tenha permissão para utilizar.
2. Copie o arquivo para `assets/images/exercicios/`.
3. Formatos aceitos: PNG, JPG, JPEG e WebP. Use extensões em minúsculas (`.png`, `.jpg`, `.jpeg`, `.webp`) para que o Metro reconheça os arquivos. Se houver extensão maiúscula, o script orienta a renomeá-la e mantém o catálogo anterior. A pasta começa vazia.
4. Prefira nomes como `supino-reto.png`, sem espaços. Não renomeie imagens já associadas a exercícios: o nome completo do arquivo é seu identificador.

No terminal do VS Code, dentro da pasta do projeto, execute:

```sh
npm run images:sync
```

`npm` é a ferramenta que executa os comandos do projeto; `run` pede para executar um comando cadastrado; `images:sync` lê a pasta e atualiza o catálogo. Esse comando não baixa, altera nem exclui imagens. Não é necessário editar TypeScript para cada arquivo. Somente arquivos diretamente nessa pasta são catalogados, não subpastas.

Para iniciar o aplicativo com sincronização automática, execute:

```sh
npm start
```

`start` executa o servidor de desenvolvimento do Expo. Antes de iniciar, o npm executa automaticamente a sincronização. Os comandos `npm run android`, `npm run ios` e `npm run web` também sincronizam antes de iniciar suas respectivas versões. Se você usar diretamente `npx expo start`, execute `npm run images:sync` antes, pois `npx` não executa o `prestart` do npm.

Se o servidor já estiver aberto quando você adicionar imagens, execute `npm run images:sync` em outro terminal e recarregue o app se necessário.

No celular: perfil → Iniciar treino → dia → exercício → abrir cartão → Adicionar imagem (ou Alterar imagem) → Escolher da biblioteca. Pesquise, toque na miniatura e confirme. Para cancelar sem alterar a imagem atual, use Cancelar ou o botão Voltar do Android. A galeria do celular continua disponível, assim como Remover imagem.

O catálogo `src/data/exercise-images.generated.ts` contém referências estáticas que o Metro inclui no aplicativo. Não edite esse arquivo manualmente. O SQLite salva apenas o identificador da imagem da biblioteca, sem copiar o arquivo para cada exercício. Fotos da galeria continuam sendo copiadas para a pasta permanente existente.

Antes de gerar um APK/AAB ou uma atualização, execute a sincronização. As imagens catalogadas serão distribuídas com essa versão e poderão ser usadas offline. Adicionar um arquivo no computador não atualiza um APK já instalado: é preciso distribuir uma nova versão ou atualização. Durante o desenvolvimento, o Expo Go ainda precisa carregar o projeto pelo servidor do Expo.

Se você remover ou renomear uma imagem, sincronize novamente: exercícios com o identificador antigo exibirão um ícone substituto. Nome, cargas, repetições e séries permanecem salvos. Escolha outra imagem para reassociá-los.

O script agrupa variantes `@2x` e `@3x` quando a imagem base existe. Arquivos com nomes equivalentes ignorando maiúsculas/minúsculas não geram entradas duplicadas. Use imagens otimizadas para celular; a interface mostra miniaturas sem distorcer as proporções.

Os nomes conhecidos aparecem em português. A pesquisa aceita português, inglês, palavras separadas e texto sem acentos: por exemplo, `supino`, `bench press` ou `supino halter`. Os nomes originais dos arquivos e seus identificadores não são alterados. As fases `start`, `peak` e `main` aparecem como posição inicial, posição final e visão geral. O vocabulário fica em `scripts/exercise-names-pt.cjs`; arquivos novos com termos desconhecidos mantêm um nome derivado do arquivo até que uma tradução seja adicionada.
