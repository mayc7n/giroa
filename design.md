# Giroa — Design system

Status: aprovado para implementação em 27/09/2026.

## Direção

O Giroa é uma ferramenta de operação diária para MEIs prestadores de serviço.
Sua interface deve transmitir controle, calma e clareza financeira: a pessoa
precisa saber o que exige atenção, quanto já recebeu e qual é o próximo passo
sem navegar por uma tela ornamental.

A direção visual é uma interface escura, nativa e contida, com verde-lima como
accent funcional. O produto não usa gradientes, glassmorphism, ilustrações
decorativas ou cartões empilhados sem função.

## Referências e aprendizados

As referências foram usadas para extrair padrões de produto, não para copiar
marca, logotipo, layout ou identidade visual.

- [Jobber — Home no app](https://help.getjobber.com/en/articles/home-in-the-jobber-app/):
  prioriza o dia atual, próximos atendimentos, tarefas e receita esperada.
  Para o Giroa, isso vira uma tela Hoje que responde primeiro “o que precisa
  da minha atenção?”.
- [Housecall Pro — aplicativo móvel](https://www.housecallpro.com/features/mobile-app/):
  aproxima painel, orçamento, serviço, cobrança e modo offline. Para o Giroa,
  o fluxo cliente → orçamento → serviço → recebimento deve permanecer linear.
- [Bonsai — projetos e portal do cliente](https://help.hellobonsai.com/en/articles/5588945-how-to-get-started-with-bonsai):
  mantém cliente, projeto, documentos e cobrança no mesmo contexto. Para o
  Giroa, detalhes de cliente, orçamento e serviço devem parecer partes de uma
  mesma história, e não módulos desconectados.

## Tokens de cor

Os valores abaixo são a única fonte de cor da interface. Componentes devem
consumir os tokens semânticos; não devem inserir hex diretamente em seus
`StyleSheet`s.

### Primitivos

| Token | HEX | Uso de referência |
| --- | --- | --- |
| `ink.950` | `#0B1412` | fundo profundo da aplicação |
| `ink.900` | `#12201C` | superfície principal |
| `ink.800` | `#192C26` | superfície elevada, modal e resumo |
| `ink.700` | `#1E3A31` | superfície pressionada ou selecionada |
| `ink.600` | `#294239` | borda e divisor refinado |
| `lime.500` | `#C7F36B` | accent principal e ação primária |
| `lime.400` | `#A9D858` | accent pressionado/hover |
| `neutral.50` | `#F4F7EF` | texto principal sobre fundo escuro |
| `neutral.300` | `#AAB8B0` | texto secundário |
| `neutral.500` | `#73867C` | texto auxiliar e metadados |
| `amber.400` | `#F1C46B` | pendência e atenção |
| `red.400` | `#FF8B87` | erro e ação destrutiva |

### Semânticos

```ts
background.canvas = ink.950
background.surface = ink.900
background.elevated = ink.800
background.pressed = ink.700
border.default = ink.600
content.primary = neutral.50
content.secondary = neutral.300
content.muted = neutral.500
interactive.accent = lime.500
interactive.accentPressed = lime.400
status.pending = amber.400
status.negative = red.400
```

O texto em `interactive.accent` deve usar `ink.950`, nunca branco. Texto
principal e accent precisam manter contraste forte em telas pequenas. Estados
de erro não dependem somente de cor: devem ter texto explicativo próximo ao
campo ou à ação.

## Tipografia

Usar a família nativa do sistema: SF Pro no iOS e Roboto no Android. Não
adicionar fonte externa para esta versão. Pesos disponíveis:

| Estilo | Tamanho / linha | Peso | Uso |
| --- | --- | --- | --- |
| `display` | `32 / 38` | `700` | total ou título de Hoje |
| `title` | `24 / 30` | `700` | título de tela |
| `section` | `17 / 23` | `700` | seção e nome de entidade |
| `body` | `15 / 22` | `400` | conteúdo principal |
| `bodyStrong` | `15 / 22` | `600` | labels e ações secundárias |
| `caption` | `13 / 18` | `500` | data, status e metadados |
| `money` | `28 / 32` | `700` | valor financeiro destacado |

Títulos usam no máximo duas linhas. Textos auxiliares não competem com o
conteúdo principal. Valores monetários usam `fontVariant: ['tabular-nums']`
quando o runtime oferecer suporte.

## Espaçamento

O grid é baseado em múltiplos de 4:

```ts
space.1 = 4
space.2 = 8
space.3 = 12
space.4 = 16
space.5 = 20
space.6 = 24
space.8 = 32
space.10 = 40
```

Regras de composição:

- margem horizontal de tela: `space.5` (`20`);
- distância entre título e descrição: `space.2` (`8`);
- distância entre seções: `space.8` (`32`);
- padding interno de superfície: `space.4` (`16`);
- linha de lista: mínimo de `56` de altura e `space.4` de respiro vertical;
- ação primária: mínimo de `52` de altura;
- qualquer controle acionável: área mínima de `44 × 44`.

Não usar números soltos para espaçamento em telas ou componentes novos.

## Bordas, superfícies e sombras

```ts
radius.sm = 8
radius.md = 12
radius.lg = 16
radius.xl = 20
radius.pill = 999
border.width = 1
```

- Inputs e botões usam `radius.md`.
- Resumos e superfícies contextuais usam `radius.lg`.
- Status e filtros compactos usam `radius.pill`.
- Listas são planas, com `borderBottomWidth: 1` e `border.default`; não
  transformar cada item em um cartão.
- A borda é visível, mas discreta. Nunca usar borda branca pura.
- Sombras existem apenas em superfície elevada, modal ou menu flutuante:
  `shadowColor: #000000`, `shadowOpacity: 0.24`, `shadowRadius: 12`,
  `shadowOffset: { width: 0, height: 6 }` e `elevation: 4` no Android.
- O fundo e as superfícies não recebem gradientes.

## Interação e acabamento

- Ação primária: fundo `interactive.accent`, texto `background.canvas`.
- Ação secundária: fundo transparente, borda `interactive.accent`, texto
  `interactive.accent`.
- Ação terciária: texto `content.secondary`, sem cápsula decorativa.
- `pressed` aplica `interactive.accentPressed` ou `background.pressed` e uma
  redução sutil de opacidade (`0.92`), sem deslocar o layout.
- No web, `hover` usa `background.pressed` em áreas escuras e
  `interactive.accentPressed` em ações primárias. No Android/iOS, o mesmo
  componente mantém o comportamento de toque sem depender de hover.
- Foco deve ser perceptível com uma borda de accent de `2 px` ou uma camada
  equivalente, sem remover o indicador nativo de acessibilidade.
- Estado desabilitado usa `content.muted`, superfície `background.surface` e
  não simula disponibilidade com sombra.
- Loading preserva a geometria do controle e informa o estado no texto ou
  acessibilidade; não usar shimmer ou gradiente.

## Componentes

Os componentes são semânticos e pequenos, não uma coleção de cartões
genéricos:

- `GiroaButton`: primário, secundário e textual, com estados pressed/hover,
  foco e disabled.
- `GiroaSurface`: apenas para resumo financeiro, estado vazio, seleção ou
  contexto que realmente precisa de agrupamento.
- `GiroaField`: label, input, erro próximo e estado de foco.
- `GiroaStatus`: texto curto de status com cor e label compreensível.
- `GiroaSectionHeader`: título de seção e ação opcional, sem slogan.
- `GiroaListRow`: nome, metadado, valor/status e área de toque acessível.

## Aplicação nas telas do Giroa

### Hoje

Cabeçalho curto, resumo do que exige atenção, recebimentos pendentes e próxima
ação. O estado vazio explica o próximo passo e oferece uma ação concreta, sem
ilustração genérica.

### Serviços

Lista plana com descrição, cliente, status e total. O orçamento novo é a ação
primária no topo. O detalhe concentra o total histórico, status do serviço,
recebimentos e saldo.

### Caixa

Resumo elevado para recebido, a receber e saídas. Movimentações aparecem como
linhas com data, tipo e valor; pendências usam `status.pending` sem transformar a
tela em um painel de métricas decorativas.

### Clientes

Lista de nomes e contatos, busca/seleção sem duplicidade silenciosa, estado vazio
objetivo e cadastro com campos claros. Clientes homônimos continuam exigindo
escolha explícita.

### Formulários e detalhes

Campos agrupados por tarefa, labels persistentes, erros junto ao campo e CTA
principal fixado apenas quando isso não esconder o teclado ou o conteúdo.
Detalhes usam hierarquia de entidade → status → valor → ações.

## Contrato de implementação

- Criar `src/ui/tokens.ts` com tokens de cor, tipografia, espaçamento, radius,
  borda e sombra.
- Migrar estilos de tela e feature para os tokens semânticos.
- Não adicionar dependência de fonte, ícones ou biblioteca visual nesta fatia.
- Não alterar regras de domínio, persistência local ou contratos financeiros.
- Manter acessibilidade: roles existentes, labels compreensíveis, contraste,
  áreas de toque e suporte a texto ampliado.
- Os arquivos nativos e web devem compartilhar tokens; diferenças de interação
  devem ficar limitadas a hover web e comportamento nativo de toque.

## Critérios de aceitação visual

1. Nenhum componente novo usa hex de cor ou espaçamento literal fora de
   `src/ui/tokens.ts`.
2. A navegação, Hoje, Serviços, Caixa, Clientes, formulários e detalhes usam a
   mesma paleta e escala tipográfica.
3. Não existem gradientes, sombras decorativas ou cartões genéricos repetidos.
4. Estados pressed/hover, erro, foco, desabilitado e vazio são visíveis e
   compreensíveis.
5. `npm run check`, `npm test` e `npm run lint` passam após a migração.
