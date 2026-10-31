# Gerar e instalar o MeuTreino no Android

O perfil `preview` do arquivo `eas.json` produz um APK de uso pessoal, que abre sem Expo Go e sem o servidor de desenvolvimento. Não é necessário publicar na Play Store para instalá-lo.

Execute os comandos no terminal do VS Code, na pasta `C:\Users\luizp\MeuTreinoNovo`.

## Entrar na conta Expo

```sh
npx eas-cli@latest login
```

`npx` executa uma ferramenta, `eas-cli@latest` seleciona a versão atual da ferramenta de builds do Expo e `login` conecta sua conta. Digite as credenciais somente no terminal. Se ainda não tiver uma conta, crie uma no site do Expo.

## Solicitar o APK

```sh
npx eas-cli@latest build --platform android --profile preview
```

`build` solicita a compilação nos servidores do Expo; `--platform android` escolhe Android e `--profile preview` usa a configuração de APK instalável. Na primeira execução, a ferramenta pode pedir para criar/vincular o projeto EAS e gerar a chave de assinatura Android. Essa chave é necessária para instalar futuras atualizações sobre o mesmo aplicativo. A geração está sujeita à fila e aos limites da sua conta Expo.

O hook `eas-build-post-install` atualiza o catálogo das imagens automaticamente durante o build. O código, as imagens catalogadas e o áudio são empacotados no aplicativo.

Ao concluir, o EAS informa um link para baixar o APK. Abra o link no celular, baixe o arquivo e siga o instalador do Android. Se solicitado, permita a instalação de aplicativos para o navegador que fez o download. O identificador Android configurado é `com.luiznpa.meutreino`; mantenha esse identificador e a chave de assinatura nas próximas versões.

## Seus exercícios cadastrados

O banco e as fotos cadastradas no Expo Go ficam em um espaço diferente do APK. A primeira instalação não transfere esses dados automaticamente. Preserve o Expo Go e seus dados até exportarmos/importarmos os treinos ou recadastrá-los no APK. As imagens da biblioteca e a divisão semanal do código já estarão incluídas no APK.

Para preservar os dados de uma versão instalada do APK, instale futuras versões assinadas sobre a anterior. Desinstalar o aplicativo ou limpar seus dados remove o armazenamento local.

## Limite atual do cronômetro

O contador atual foi implementado para a tela do treino aberta. O aviso de descanso com aplicativo em segundo plano ou tela bloqueada ainda precisa de uma implementação própria e testes no dispositivo.
