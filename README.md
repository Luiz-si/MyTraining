# MeuTreino

<img src="assets/images/meutreino-icon.png" alt="Ícone do MeuTreino" width="120" />

**Minha rotina de musculação, organizada dia a dia.**

**Está procurando onde mudar alguma coisa? Comece pelo [guia de localização do código](docs/onde-mexer-no-codigo.md).** Os arquivos próprios do app têm nomes em português e explicações no topo.

Aplicativo desenvolvido por Luiz Pedro para registrar e acompanhar sua rotina pessoal de musculação. O MeuTreino reúne divisão semanal, exercícios com imagens, cargas, repetições e descanso em uma interface escura com detalhes em verde.

O projeto também faz parte do meu aprendizado em programação e Sistemas de Informação. A proposta inicial é apresentar a rotina do criador; a área para montar uma rotina própria ainda está em desenvolvimento.

## Funcionalidades disponíveis

- **Divisão semanal:** seis dias de treino e domingo reservado ao descanso.
- **Grupos musculares editáveis:** alteração por dia, salva no celular e exibida também dentro do treino.
- **Exercícios:** cadastro, edição do nome, exclusão e cópia para outro dia.
- **Biblioteca local de imagens:** pesquisa por nomes em português e termos relacionados, com opção de escolher uma imagem do celular.
- **Controle de séries:** quatro séries por exercício, com carga e repetições editáveis.
- **Cargas entre dias:** exercícios com o mesmo nome compartilham alterações de cargas e repetições.
- **Descanso:** contador de três minutos, calculado pelo horário de término para considerar o tempo decorrido ao voltar de outro aplicativo para a mesma tela.
- **Armazenamento local:** exercícios e grupos musculares permanecem salvos ao reabrir o app.
- **Exportação:** geração de um arquivo JSON com exercícios, séries e referências de imagens, incluindo fotos locais associadas aos exercícios.
- **Minha proposta:** página sobre a filosofia dos treinos, dicas, perguntas expansíveis e estrutura para fotografias pessoais opcionais.

## Tecnologias

| Tecnologia | Papel no projeto |
| --- | --- |
| TypeScript | Linguagem principal do código |
| React e React Native 0.88 | Componentes, estado e interface mobile |
| Expo SDK 58 | Ferramentas e módulos do aplicativo |
| Expo Router | Navegação entre as telas |
| Expo SQLite | Banco de dados local |
| Expo Image e Image Picker | Exibição e seleção de imagens |
| Expo Audio | Som do descanso |
| React Native Reanimated | Animações e transições |
| Expo Build / EAS CLI | Geração do APK e assinatura Android |

A implementação atual prioriza **Android**. Não há backend Python, autenticação ou serviço de sincronização na nuvem.

## Executar no celular com Expo Go

Use Node.js compatível com o Expo SDK 58, npm e uma versão do Expo Go que suporte esse SDK. Os testes locais do repositório são executados com Node.js 24.

Execute os comandos no terminal, dentro da pasta que contém este README e o `package.json`.

### 1. Instalar as dependências

`npm ci` instala as versões registradas em `package-lock.json`. É usado ao preparar uma cópia do projeto.

```sh
npm ci
```

### 2. Conferir a foto do perfil

A foto pessoal usada em [perfil-criador.ts](src/data/perfil-criador.ts) não é versionada no Git. Se ela não estiver na sua cópia, escolha uma destas opções antes de iniciar:

- Adicione sua imagem em `assets/images/` e ajuste o `require` da propriedade `photo`.
- Use `photo: null` para exibir o espaço reservado, sem depender de uma foto.

A imagem referenciada precisa existir. Para gerar o APK na nuvem, ela também deve estar incluída nas regras de envio do [.easignore](.easignore).

### 3. Iniciar o projeto

`npm start` atualiza o catálogo local de imagens e inicia o servidor de desenvolvimento do Expo.

```sh
npm start
```

Abra o Expo Go no Android e leia o QR Code. Para a conexão local, mantenha computador e celular na mesma rede Wi-Fi.

Durante esse modo de desenvolvimento, o servidor precisa continuar funcionando no computador. O **APK instalado funciona sem esse servidor e sem Expo Go**.

## Gerar um APK Android

É necessário ter uma conta Expo conectada à EAS CLI. O passo a passo de login, assinatura e instalação está em [Instalar no Android](docs/instalar-no-android.md).

O comando abaixo solicita uma compilação na nuvem: `npx eas-cli@latest` executa a ferramenta, `build` solicita a geração, `--platform android` escolhe Android e `--profile preview` seleciona o APK universal configurado no projeto.

```sh
npx eas-cli@latest build --platform android --profile preview
```

Ao concluir, o serviço fornece um link de download. A geração está sujeita à fila e aos limites da conta.

| Perfil em eas.json | Resultado |
| --- | --- |
| `preview` | APK universal para instalação direta |
| `preview-arm64` | APK apenas para aparelhos compatíveis com ARM de 64 bits |
| `production` | AAB para futura publicação na Play Store; não é instalado diretamente como um APK |

O APK não funciona no iPhone. Uma distribuição iOS exige compilação e configuração próprias.

Para atualizar uma instalação existente, mantenha o identificador Android e a mesma assinatura, instalando a versão nova sobre a anterior. **Desinstalar o app ou limpar seus dados pode apagar os registros locais.**

## Dados, exportação e funcionamento offline

O banco `meutreino.db` fica no armazenamento privado do aplicativo no celular. Ele não é um arquivo de código para abrir no VS Code.

Cada instalação mantém seus próprios dados. O Expo Go e o APK também usam armazenamentos separados: instalar um APK não transfere automaticamente os registros feitos no Expo Go.

A rotina incluída em [creator-routine.json](src/data/creator-routine.json) é carregada como ponto de partida quando o banco de exercícios está vazio e ainda não foi inicializado. Atualizar esse arquivo no projeto **não sobrescreve os treinos de uma instalação já utilizada**.

A biblioteca e os registros locais podem ser usados sem internet depois da instalação. Alterações em um celular não são enviadas automaticamente para outros usuários.

No perfil, **Exportar minha rotina** permite salvar ou compartilhar o JSON. A exportação atual contém os exercícios e suas séries; não é um backup completo dos grupos musculares personalizados, do perfil ou dos textos da página Minha proposta. Ainda não há uma tela de importação desse arquivo.

## Organização do código

```text
src/
  app/                  Telas e rotas do Expo Router
    index.tsx           Página principal
    perfil.tsx          Perfil do criador e acesso aos treinos
    treino.tsx          Divisão semanal e edição dos grupos
    dia/[id].tsx        Tela dos exercícios do dia escolhido
    sobre-meutreino.tsx Página Minha proposta
    seu-treino.tsx      Área de rotina própria, em desenvolvimento
    _layout.tsx         Configuração da navegação
  components/           Componentes compartilhados e contador de descanso
  constants/            Cores e estilos de tema
  data/                 Perfil, rotina inicial e conteúdo da proposta
  features/
    exercicios/         Exercícios, séries, imagens, exportação e banco
    divisao-semanal/    Estado compartilhado da divisão semanal
    minha-proposta/     Galeria, apresentação e perguntas expansíveis
assets/
  images/               Ícone, fotografias e biblioteca de exercícios
  sounds/               Áudio do descanso
scripts/                Geração do catálogo e nomes das imagens
tests/                  Testes automatizados
docs/                   Guias de uso e manutenção
```

### Onde personalizar

| Alteração | Arquivo ou pasta |
| --- | --- |
| Nome e foto do criador | [src/data/perfil-criador.ts](src/data/perfil-criador.ts) |
| Cores do app | [src/constants/cores-app.ts](src/constants/cores-app.ts) |
| Divisão semanal padrão | [src/data/divisao-semanal.ts](src/data/divisao-semanal.ts) |
| Apresentação, filosofia, dicas e registro das fotos | [src/data/conteudo-minha-proposta.ts](src/data/conteudo-minha-proposta.ts) |
| Fotos da página Minha proposta | `assets/images/sobre-meutreino/` |
| Imagens dos exercícios | `assets/images/exercicios/` |
| Ícone e configurações nativas | [app.json](app.json) |
| Perfis de compilação | [eas.json](eas.json) |

Depois de adicionar ou renomear imagens de exercícios, `npm run images:sync` regenera o catálogo usado pela biblioteca. Não edite o arquivo gerado manualmente.

```sh
npm run images:sync
```

Para instalar novos módulos, use `npx expo install <pacote>`: o Expo seleciona uma versão compatível com o SDK do projeto.

## Verificações de desenvolvimento

`npx expo lint` procura problemas de código com ESLint.

```sh
npx expo lint
```

`npx tsc --noEmit` confere os tipos TypeScript sem gerar arquivos compilados.

```sh
npx tsc --noEmit
```

O comando abaixo executa os testes de exercícios, banco SQLite, persistência, grupos musculares e pesquisa da biblioteca. Use Node.js 24, pois esses testes utilizam recursos do próprio Node para TypeScript e SQLite.

```sh
node --test tests/exercises.test.mjs tests/image-library.test.mjs
```

`npx expo-doctor` verifica dependências e configuração do Expo. Essa consulta pode precisar de internet.

```sh
npx expo-doctor
```

## Em desenvolvimento

- Criação de uma rotina própria na área Seu próprio treino.
- Notificação com tempo restante e aviso de descanso confiável em segundo plano.
- Histórico de sessões concluídas e gráficos de evolução.
- Importação de rotina pelo aplicativo.

O som do contador atual não é garantido com o aplicativo em segundo plano ou a tela bloqueada. As fotografias adicionais da página Minha proposta dependem dos arquivos escolhidos pelo criador.

## Guias do projeto

- [Biblioteca de imagens e pesquisa de exercícios](docs/biblioteca-de-imagens.md)
- [Exportação da rotina](docs/exportar-rotina.md)
- [Instalação no Android](docs/instalar-no-android.md)
- [Otimizações da compilação Android](docs/otimizacao-android.md)
- [Textos e fotografias da página Minha proposta](docs/por-tras-do-meutreino.md)

Referências oficiais: [Expo SDK 58](https://docs.expo.dev/versions/v58.0.0/), [Expo Router](https://docs.expo.dev/router/introduction/) e [distribuição interna do APK](https://docs.expo.dev/build/internal-distribution/).

---

Desenvolvido por **Luiz Pedro** como projeto pessoal e de aprendizado.
