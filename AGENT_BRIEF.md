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
- pode executar por até 45 minutos;
- trabalha somente no worktree fornecido;
- não faz commit, push, merge ou alteração em arquivos protegidos;
- quando receber feedback, corrige somente os pontos do feedback.

### Continuação após timeout
- O implementer pode executar por até 45 minutos;
- se houver diff no timeout, o patch fica em `.loop/partial/` e o mesmo worktree é retomado no próximo ciclo;
- após dois timeouts na mesma tarefa, o loop escala para Telegram;
- um trabalho parcial expira após 24 horas e é escalado.

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
Next.js, TypeScript, Tailwind, App Router. O orquestrador executa obrigatoriamente `npx tsc --noEmit` e `npm run build` após cada implementação aprovada para revisão.

## Saída humana
Telegram recebe somente PRs aprovados/auto-merge solicitado, escalonamentos ou falhas. O estado técnico fica em `.loop/`, fora do Git.

## Direção editorial e visual

O site deve se inspirar na clareza editorial e na arquitetura de informação de um monitor eleitoral independente: explicar o recorte, indicar fontes e datas, separar fatos de interpretação e oferecer caminhos claros de navegação. Não copiar design, textos, marca ou conteúdo de outros sites.

A página inicial deve comunicar: atividade legislativa do DF, deputados distritais, proposições, notícias, atividade pública e cenário de 2026. Dados sem fonte devem ser omitidos ou apresentados como indisponíveis, nunca inventados.

## Fila de melhorias priorizada

Execute os itens na ordem abaixo. Faça uma única melhoria concreta por ciclo. Comece sempre pelo primeiro checkbox não concluído de P0 antes de considerar P1, P2 ou P3. Evite exploração ampla: leia apenas os arquivos necessários para a tarefa escolhida e comece a implementação. Marque um item como concluído somente quando os critérios de aceite forem atendidos e o PR tiver sido integrado.

### P0 — Confiança editorial e dados

- [x] Criar uma seção “Situação das bases” na Home.
  Critério: mostrar última atualização e disponibilidade de notícias, Instagram, proposições e presença, usando dados reais ou estado “Ainda não coletado”.

- [x] Exibir fonte e data de coleta em notícias, proposições e dados factuais dos perfis.
  Critério: nenhum dado factual publicado fica sem fonte e data visíveis ou acessíveis.

- [x] Fortalecer a página de metodologia.
  Critério: explicar fontes P1/P2, frequência de coleta, limites de interpretação e que volume de posts/notícias não mede popularidade, apoio ou intenção de voto.

- [x] Padronizar estados vazios e indisponíveis.
  Critério: ausência de dados usa linguagem honesta, explica a origem esperada e não exibe métricas fictícias.

### P1 — Página inicial e navegação

- [x] Reestruturar a Home com hero editorial.
  Critério: título claro sobre atividade legislativa do DF, subtítulo contextual e CTAs para deputados, notícias e metodologia.

- [x] Criar três caminhos de navegação na Home.
  Critério: “Deputados em exercício”, “Atividade legislativa” e “Cenário eleitoral de 2026”, cada um com descrição curta e destino funcional.

- [x] Melhorar a seção de cobertura atual.
  Critério: métricas verificáveis de deputados monitorados, proposições catalogadas, notícias organizadas e fontes ativas.

- [x] Criar feed de atualizações monitoradas.
  Critério: diferenciar notícias, proposições e atividade pública, com fonte, data, deputado relacionado e link externo quando disponível.

### P2 — Perfis e exploração

- [ ] Organizar o perfil individual do deputado.
  Critério: resumo, contatos, comissões, proposições, presença, gastos, notícias e atividade pública, com estados vazios explicativos.

- [ ] Criar filtros combináveis na listagem.
  Critério: nome, partido, comissão, situação, região administrativa, tema e período funcionam em desktop e mobile.

- [ ] Criar comparação entre deputados.
  Critério: usar somente indicadores de fonte clara, sem ranking editorial enganoso e com contexto metodológico.

- [ ] Criar página de atividade legislativa.
  Critério: listar proposições recentes, temas, status e deputados relacionados, com fontes.

### P3 — Cenário de 2026 e análise

- [ ] Estruturar o cenário de 2026 por estágio de evidência.
  Critério: usar “pré-candidatura declarada”, “movimentação pública” e “em observação”; cada estágio exige fonte e data.

- [ ] Criar análise descritiva de temas e volume.
  Critério: declarar que volume não representa popularidade, apoio ou intenção de voto.

- [ ] Melhorar responsividade e acessibilidade.
  Critério: navegação, filtros, tabelas e cards funcionam em telas pequenas, com foco visível e labels acessíveis.
