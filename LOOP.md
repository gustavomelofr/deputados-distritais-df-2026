# Loop Configuration — Deputados Distritais DF 2026

## Missão
Agente **contínuo, always-on**, sem cap de tokens. Constrói e mantém o site
de monitoramento dos 24 deputados distritais do DF para as eleições de 2026.

## Active Loops

| Loop | Cadência | Tipo | Comando |
|---|---|---|---|
| Agente contínuo | infinito (15 min entre checks) | L3 — autônomo com report | `node loop-runner.js` (via systemd) |

## Agente README.md atualizado
- Site clone de `eleicaodf2026.com.br` mas para **deputados distritais do DF**
- Fontes P1: CLDF, Google News RSS
- Fontes P2: Instagram, TSE/DivulgaCand
- Output: atualizações do site + notificações Telegram
- Tudo commitado no GitHub

## Cadência
- **Intervalo entre ciclos**: 15 minutos (configurável em `loop-runner.js`)
- **Não dorme**: systemd `Restart=always` mantém rodando 24/7
- **Token cap**: **sem limite** (decisão do humano)
- **Output filter**: só notifica Telegram quando há novidade (silêncio saudável no resto)

## Human Gates
- Mudanças no código: revisão via Git (a cada push)
- Mudanças em conteúdo: visíveis em tempo real no site
- Decisões estruturais: editáveis em `AGENT_BRIEF.md`

## Worktrees
- Implementer (L2+) usa `loop-worktree create --run-id <id> --pattern <p>`
- Verifier rejeita ou aprova; humanos revisam denylist

## Connectors (MCP)
- Opcional para L1. Para GitHub MCP read + comment.
- Para Telegram: via `telegram-notify.js` (script standalone).

## Budget
- **Sem cap de tokens** (decisão explícita do humano)
- Custo monitorado em `loop-runner.log` (write-through do `opencode run`)
- Kill switch: `touch /root/deputados-distritais-df-2026/.loop-pause` pausa o ciclo

## Operations

```bash
# Ver status do serviço
systemctl status deputados-loop
journalctl -u deputados-loop -f

# Reiniciar manualmente
systemctl restart deputados-loop

# Parar
systemctl stop deputados-loop

# Rodar manualmente em foreground
cd /root/deputados-distritais-df-2026 && node loop-runner.js
```

## Links
- Brief: `AGENT_BRIEF.md`
- Estado: `STATE.md`
- Pattern base: [loop-engineering](https://github.com/cobusgreyling/loop-engineering)
