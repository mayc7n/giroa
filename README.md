# Giroa

Giroa é um app mobile local-first para MEIs prestadores de serviço
organizarem clientes, orçamentos, serviços e recebimentos com clareza.

## Requisitos

- Node.js 22 LTS ou versão mais recente compatível com o Expo 57.
- npm instalado com o Node.js.
- Expo Go ou um ambiente nativo configurado para executar Android/iOS.

## Setup local

```bash
npm ci
npm start
```

No menu do Expo, escolha o dispositivo desejado. Também é possível iniciar
diretamente:

```bash
npm run web
npm run android
npm run ios
```

## Verificações

Antes de enviar uma alteração, rode a sequência de qualidade do projeto:

```bash
npm run check
npm test -- --runInBand
npm run lint
```

O lint é executado diretamente pelo ESLint e valida convenções de nomes sem
depender de login ou de perfil global do Expo.

## Arquitetura

- `src/app`: rotas web e nativas, finas e responsáveis por navegação.
- `src/features`: telas e interação de cada área do produto.
- `src/application`: casos de uso que orquestram regras e persistência.
- `src/domain`: regras puras de clientes, dinheiro, datas, orçamentos e caixa.
- `src/data`: SQLite, migrations, repositórios e backup local.
- `src/ui`: tokens visuais e componentes compartilhados.

O domínio não depende de componentes de tela. A persistência continua local e
as diferenças entre web e nativo ficam restritas à interação específica da
plataforma.

## Dados locais e backup

Os dados ficam no SQLite do dispositivo; o Giroa não exige conta, servidor ou
sincronização em nuvem para funcionar. A área **Dados** permite exportar um
arquivo JSON ou restaurar um arquivo compatível.

O arquivo de backup contém formato, versão, versão do banco, data de exportação
e os registros locais. Na importação, o Giroa rejeita JSON corrompido,
incompleto ou incompatível antes de tocar no banco. A restauração substitui os
dados atuais somente após confirmação e ocorre em uma transação exclusiva.

## Limites atuais

Autenticação, sincronização em nuvem, billing, analytics remoto e builds EAS
automatizados ainda não fazem parte do núcleo local-first. A configuração de
EAS e os ambientes de publicação serão adicionados na fatia de infraestrutura
profissional.

## Release

Use o [checklist de release](./RELEASE.md) depois que as verificações locais e
as revisões de migration/backup estiverem concluídas.
