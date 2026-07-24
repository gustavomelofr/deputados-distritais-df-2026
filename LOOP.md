# Loop L3 — Deputados Distritais DF 2026

## Ciclo
- Serviço: `deputados-loop.service`;
- Runtime: `node loop-runner.js`;
- Cadência: 15 minutos após o fim do ciclo anterior;
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
