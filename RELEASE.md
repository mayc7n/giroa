# Checklist de release

Use este checklist antes de distribuir uma versão do Giroa.

## Código e dependências

- [ ] Confirmar que a branch de release está limpa e aponta para a revisão correta.
- [ ] Executar `npm ci` usando o `package-lock.json` atualizado.
- [ ] Executar `npm run check`.
- [ ] Executar `npm test -- --runInBand`.
- [ ] Executar `npm run lint` sem erros ou avisos.
- [ ] Conferir a versão em `package.json` e `app.json`.

## Dados e compatibilidade

- [ ] Revisar qualquer migration nova como aditiva e compatível com dados existentes.
- [ ] Testar abertura do banco em uma instalação existente.
- [ ] Exportar um backup e conferir que ele contém formato, versão e versão do banco.
- [ ] Testar restauração válida, arquivo corrompido e versão incompatível.
- [ ] Confirmar que a restauração exige confirmação e é transacional.

## Smoke test

- [ ] Abrir o app no Android ou iOS e verificar Hoje, Clientes, Serviços e Caixa.
- [ ] Verificar criação de cliente, orçamento, serviço e recebimento.
- [ ] Verificar exportação/compartilhamento do backup e dos documentos aplicáveis.
- [ ] Verificar a versão web com `npm run web` quando houver alteração de rota compartilhada.

## Publicação

- [ ] Revisar os resultados das verificações de qualidade.
- [ ] Confirmar que nenhum segredo, token ou arquivo `.env` foi commitado.
- [ ] Registrar notas de release e limitações conhecidas.
- [ ] A configuração de EAS e os perfis de desenvolvimento, preview e produção
  só entram neste checklist quando a fatia de infraestrutura estiver concluída.
