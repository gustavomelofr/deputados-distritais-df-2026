# AGENTS.md — Monitor Eleitoral DF 2026

## Autorização do loop

O processo `loop-runner.js` opera em L3 com autorização humana permanente para executar a tarefa específica enviada pelo orquestrador dentro de um worktree isolado.

- Leia `AGENT_BRIEF.md` antes de editar.
- Execute somente a tarefa exata recebida.
- Não selecione tarefa alternativa e não altere outros checkboxes.
- Uma tarefa por ciclo; escopo pequeno e verificável.
- O implementer edita, mas nunca faz commit, push, merge ou checkout da `main`.
- O verifier não edita nem executa shell.
- O orquestrador é o único responsável por testes, commit, PR e auto-merge.

## Segurança editorial

- Nunca invente notícia, pessoa, candidatura, partido, cargo, declaração, data, foto ou fonte.
- Antes do registro no TSE, não chame ninguém de candidato oficial.
- Notícia exige URL específica; homepage de veículo não é evidência.
- Foto exige origem e base de uso; imprensa somente com licença explícita.
- Respeite o limite de registros declarado para a tarefa recorrente.
- Sem novidade recorrente, não edite arquivos e retorne `LOOP_RESULT: NO_CHANGE`.

## Segurança operacional

- Nunca altere `.env`, secrets, credenciais, dependências, workflows, configuração do loop ou caminhos bloqueados em `loop-gate.json`.
- Nunca use `git commit`, `git push`, `git merge`, `git reset --hard` ou `rm -rf`.
- Não rode TypeScript, build ou testes pesados; o orquestrador executa a validação.
- Em bloqueio externo real, siga o formato definido em `AGENT_BRIEF.md`.
