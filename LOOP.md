# Loop L3 — Deputados Distritais DF 2026

## Ciclo
- Serviço: `deputados-loop.service`;
- Runtime: `node loop-runner.js`;
- Cadência: 15 minutos após o fim do ciclo anterior;
- Implementer: até 45 minutos; verifier: até 3 minutos;
- Timeout com diff: worktree e patch em `.loop/partial/` são retomados no ciclo seguinte;
- Fila concluída: o loop entra em `idle`, sem criar worktree ou chamar agentes, e retoma ao detectar novo checkbox pendente;
- Entrega interrompida: branch e metadados ficam em `delivery_pending`; o ciclo seguinte recupera ou cria o PR sem reimplementar;
- GitHub e modelo: erros transitórios recebem retry com backoff; criação de PR usa REST como fallback;
- Escalonamento: dois timeouts ou 24h de trabalho parcial;
- Modelo: configurado no OpenCode;
- Tentativas: no máximo 2 por tarefa;
- Custo: sem teto diário por decisão do operador; duração e resultados ficam em `.loop/run-log.jsonl`.

## Fluxo obrigatório

```text
origin/main
  → worktree isolado em /root/deputados-loop-worktrees
  → implementer, sem commit/push
  → TypeScript + build
  → verifier independente
     → APPROVE: branch, PR e auto-merge após CI
     → REJECT: prompt de correção no mesmo worktree
     → segunda rejeição: escala ao humano
```

## Guardrails
- `loop-gate.json` bloqueia secrets, infraestrutura, dependências e configuração do loop;
- erro, timeout ou resposta inválida do verifier falha fechada: sem PR;
- `.loop-pause` pausa novas execuções;
- `idle` não desliga o serviço: ele apenas aguarda uma nova tarefa na fila;
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
