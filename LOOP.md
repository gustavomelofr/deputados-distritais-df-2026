# Loop L3 — Monitor Eleitoral DF 2026

## Ciclo
- Serviço: `deputados-loop.service`;
- Runtime: `node loop-runner.js`;
- Cadência: 15 minutos após o fim do ciclo anterior;
- Implementer: até 45 minutos; verifier: até 8 minutos;
- Timeout com diff: worktree e patch em `.loop/partial/` são retomados no ciclo seguinte;
- Tarefa única: o primeiro item `[ ]` da fila sempre tem prioridade;
- Rotina recorrente: quando a fila não possui `[ ]`, o loop executa no máximo uma rotina `[r]` vencida conforme frequência e limite declarados no brief;
- Sem novidade: `LOOP_RESULT: NO_CHANGE` registra a execução, não cria PR e não envia Telegram;
- Espera: se nenhuma rotina estiver vencida, o estado é `waiting`, sem worktree ou chamada de agente;
- Idle: usado somente quando não existem tarefas únicas nem rotinas recorrentes configuradas;
- Entrega interrompida: branch e metadados ficam em `delivery_pending`; o ciclo seguinte recupera ou cria o PR sem reimplementar;
- Conclusão: uma tarefa só recebe resultado final após o PR ser efetivamente mesclado; CI falho deixa a entrega em `delivery_failed` e impede nova implementação;
- Deduplicação: no máximo um PR aberto por ID semântico de tarefa;
- Revisão interrompida: timeout ou resposta inválida deixa o worktree em `verifier_pending`; o ciclo seguinte repete somente o verifier, sem chamar o implementer ou alterar o diff;
- GitHub e modelo: erros transitórios recebem retry com backoff; criação de PR usa REST como fallback;
- Escalonamento: dois timeouts, 24h de trabalho parcial ou três ciclos consecutivos com falha; erro de créditos abre o circuit breaker imediatamente;
- Modelo: configurado no OpenCode;
- Tentativas: no máximo 2 por tarefa;
- Custo: duração e resultados ficam em `.loop/run-log.jsonl`; o circuit breaker limita repetição inútil, embora não exista teto monetário diário.

## Fluxo obrigatório

```text
origin/main
  → worktree isolado em /root/deputados-loop-worktrees
  → implementer, sem commit/push
  → TypeScript + build
  → verifier independente
     → APPROVE: branch, PR e auto-merge após CI
     → REJECT: prompt de correção no mesmo worktree
     → NO_CHANGE recorrente: registra e aguarda a próxima janela, sem PR
     → BLOCKED: registra motivo e ação humana necessária
     → segunda rejeição: escala ao humano
```

## Guardrails
- `loop-gate.json` bloqueia secrets, infraestrutura, dependências e configuração do loop;
- erro, timeout ou resposta inválida do verifier falha fechada: sem PR;
- o verifier pode ler o estado completo do worktree e não deve exigir que conteúdo já presente na base reapareça no diff;
- `scripts/validate-electoral-data.js` fornece ao verifier relatório protegido de IDs relacionados, URLs canônicas, cargos, estágios e evidências;
- testes locais incluem `test:loop`, TypeScript e build antes da revisão e da criação do PR;
- PR aberto da mesma tarefa, CI falho ou circuit breaker bloqueiam novas chamadas de agente até ação humana;
- `.loop-pause` pausa novas execuções;
- `waiting` e `idle` não desligam o serviço;
- cada Telegram contém tarefa, `Resumo:`, resultado e PR/ação necessária quando aplicável;
- rotina sem novidade permanece silenciosa no Telegram;
- o estado operacional está em `.loop/` e não polui a branch `main`;
- nenhum agente pode enviar mudanças diretamente à `main`.

## Operação

```bash
systemctl status deputados-loop
journalctl -u deputados-loop -f
touch .loop-pause                 # pausar
rm .loop-pause                    # retomar
cat .loop/ledger.json             # estado técnico
```
