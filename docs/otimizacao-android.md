# Tamanho do aplicativo Android

## Alterações aplicadas

- Removidos `@expo/ui` e `expo-device`: não são usados pelas telas atuais. O primeiro era uma dependência opcional do Router para componentes de interface que o MeuTreino não utiliza.
- Mantidas as bibliotecas utilizadas pelas telas e pelo próprio Expo, incluindo navegação, imagens, áudio, SQLite, animações e compartilhamento. Algumas bibliotecas sem importação direta ainda são necessárias como dependências de outras.
- Adicionado `expo-build-properties`, um plugin de configuração da compilação, sem uma nova funcionalidade nativa em execução.
- Ativados R8 (`enableMinifyInReleaseBuilds`) e remoção de recursos nativos sem uso (`enableShrinkResourcesInReleaseBuilds`). Essas opções se aplicam às compilações de lançamento, não ao Expo Go.
- Ativada compressão do código JavaScript (`enableBundleCompression`). Diminui o APK, mas pode aumentar o tempo de abertura; conferir em um celular ao instalar a nova versão.
- A biblioteca de exercícios, as fotos e o banco de dados não foram reduzidos ou apagados.

## Opções de geração

O `app.json` guarda as otimizações comuns. O `app.config.js` lê essas configurações e limita a arquitetura apenas quando o perfil `preview-arm64` define a variável `MEUTREINO_ANDROID_ARCH`.

| Perfil no eas.json | Arquivo | Uso |
| --- | --- | --- |
| `preview` | APK universal | Instalar e compartilhar, mantendo as arquiteturas padrão do Expo. |
| `preview-arm64` | APK para ARM64 | Arquivo menor, exclusivo para aparelhos Android com suporte a aplicativos ARM de 64 bits. Não serve para aparelhos de 32 bits ou emuladores x86. |
| `production` | AAB | Futura publicação na Play Store. A loja entrega os componentes adequados ao aparelho. O AAB não é instalado diretamente como um APK. |

Não é necessário gerar os três. O perfil universal continua sendo a escolha quando não sabemos quais aparelhos receberão o APK.

## Comandos para quando for gerar outra versão

Execute na pasta do projeto. `npx` executa a ferramenta, `eas-cli@latest` seleciona a ferramenta atual do Expo, `build` solicita uma compilação na nuvem, `--platform android` escolhe Android e `--profile` seleciona uma das configurações da tabela. A geração utiliza a fila e os limites da conta Expo.

APK universal:

```sh
npx eas-cli@latest build --platform android --profile preview
```

APK menor, somente para aparelhos compatíveis com ARM64:

```sh
npx eas-cli@latest build --platform android --profile preview-arm64
```

Arquivo para futura publicação na Play Store:

```sh
npx eas-cli@latest build --platform android --profile production
```

## Como medir o resultado

A análise de vinculação dos módulos Expo no Android passou de 23 para 21 módulos. Isso confirma a remoção dos dois módulos, mas não informa quantos MB o APK economizará.

Compare os tamanhos de dois APKs do mesmo perfil: um anterior e outro após estas alterações. Compare separadamente o tamanho do download e o espaço instalado indicado nas configurações do Android; são medidas diferentes. Um AAB também não deve ser comparado diretamente ao tamanho de um APK universal.

A compilação nativa e o teste em um aparelho ainda são necessários para validar R8 e a remoção de recursos. Depois de instalar a nova versão sobre a anterior, conferir abertura, navegação, biblioteca de imagens, cadastro e edição de séries, persistência após reabrir, exportação e som do descanso. Mantenha o identificador e a assinatura Android para atualizar sem desinstalar o aplicativo.

Validações desta revisão: lint e TypeScript aprovados, 20 testes aprovados, exportação Android concluída e configurações nativas conferidas por introspecção nos modos universal e ARM64. A consulta `expo install --check` também indicou atualizações de correção disponíveis para Expo, áudio, Router, SQLite e screens; essas atualizações não foram aplicadas nesta revisão de tamanho.

Estas configurações não alteram um APK já instalado. Nenhuma nova compilação na nuvem foi iniciada como parte desta revisão.

Referências: [BuildProperties no SDK 58](https://docs.expo.dev/versions/v58.0.0/sdk/build-properties/) e [tamanho de aplicativos no Expo](https://docs.expo.dev/distribution/app-size/).
