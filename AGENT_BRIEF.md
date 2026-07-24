# AGENT_BRIEF — Deputados Distritais DF 2026

## Missão
Criar e manter, com informação factual e atribuída, o site de monitoramento dos 24 deputados distritais do Distrito Federal para 2026.

## Fontes permitidas
- P1: CLDF e Google News RSS;
- P2: Instagram público e DivulgaCand/TSE;
- toda informação sem fonte deve ser omitida ou marcada explicitamente como placeholder.

## Arquitetura autônoma
O processo `loop-runner.js` é o único orquestrador. Cada ciclo:

```text
worktree isolado → implementer → TypeScript/build → verifier → PR → auto-merge
```

### Implementer
- Faz uma única melhoria concreta por ciclo;
- trabalha somente no worktree fornecido;
- não faz commit, push, merge ou alteração em arquivos protegidos;
- quando receber feedback, corrige somente os pontos do feedback.

### Verifier
- É independente, não escreve arquivos e não executa shell;
- revisa o diff e as evidências dos testes;
- devolve apenas `APPROVE` ou `REJECT` em JSON;
- uma rejeição gera um novo prompt de correção para o implementer.

### Entrega
- Máximo de duas tentativas por tarefa no mesmo ciclo;
- aprovação cria PR contra `main` e solicita auto-merge após CI;
- duas rejeições, teste falho, erro do verifier ou resposta malformada impedem entrega e geram alerta Telegram;
- push direto na `main` é proibido.

## Regras de dados
- Nunca invente dados de deputados, votos, gastos, biografia, notícias ou redes sociais;
- atribua fonte oficial quando publicar informação factual;
- não delete histórico de dados sem uma tarefa explícita;
- não altere `.env`, secrets, dependências, configurações do loop nem workflows.

## Stack
Next.js, TypeScript, Tailwind, App Router. A validação obrigatória é `npx tsc --noEmit` e `npm run build`.

## Saída humana
Telegram recebe somente PRs aprovados/auto-merge solicitado, escalonamentos ou falhas. O estado técnico fica em `.loop/`, fora do Git.
