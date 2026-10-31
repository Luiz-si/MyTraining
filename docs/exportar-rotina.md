# Incluir a rotina do criador no aplicativo

Primeiro precisamos trazer os exercícios do celular para o computador. O código do projeto não tem acesso automático ao banco do Expo Go.

1. No terminal do VS Code, dentro da pasta do projeto, execute `npm start`. `npm` executa comandos do projeto; `start` sincroniza as imagens e inicia o servidor do Expo.
2. Abra o projeto atualizado no Expo Go, no mesmo celular onde cadastrou os exercícios. Celular e computador devem estar na mesma rede Wi-Fi.
3. No perfil, abaixo de Iniciar treino, toque em **Exportar minha rotina**.
4. Escolha **Salvar no celular** e selecione uma pasta no seletor do Android (crie uma subpasta se o sistema não permitir selecionar a raiz de Downloads). Aguarde a mensagem de que o arquivo foi salvo. Você também pode escolher **Compartilhar arquivo** para enviá-lo a um aplicativo. O arquivo se chama `meutreino-rotina-....json`.
5. Coloque o arquivo no projeto ou anexe-o à conversa para prepararmos a rotina inicial.

O JSON inclui os exercícios de todos os dias, nomes, ordem, cargas, repetições e referências das imagens da biblioteca. Fotos escolhidas da galeria são incluídas dentro do arquivo em formato base64. Não envie fotos que você não deseja distribuir junto com o aplicativo.

A exportação não altera nem apaga os exercícios. Ela espera os salvamentos pendentes; se houver falha de salvamento ou foto ausente, mostra uma mensagem para corrigir o problema antes de continuar. Sem exercícios, ela pede que você faça a operação no aplicativo onde os cadastrou.

Depois de recebermos o arquivo, incluiremos essa rotina como dados iniciais de novas instalações, sem sobrescrever os dados de quem já usa o aplicativo. Essa etapa e um novo APK ainda são necessários: criar a exportação não inclui automaticamente os exercícios no APK anterior. Alterações posteriores feitas no seu celular não serão distribuídas automaticamente.

## Rotina incluída na versão 1.0.1

O arquivo exportado em 29/10/2026 foi incorporado em `src/data/creator-routine.json`, com 40 exercícios e imagens da biblioteca. A função `getInitialRoutine` valida os dados e o banco executa `seedIfEmpty` antes de abrir as telas dos dias. Bancos novos e vazios recebem a rotina uma única vez. Bancos com exercícios são preservados integralmente. Uma marca persistente impede que exercícios excluídos voltem ao reiniciar ou atualizar.

Quem já instalou o APK anterior e cadastrou exercícios não receberá substituições automáticas. A rotina é uma cópia inicial para novas instalações; cada pessoa mantém suas próprias alterações locais. Para distribuir mudanças futuras na rotina oficial, será necessário preparar outra atualização com uma estratégia explícita de atualização dos dados.
