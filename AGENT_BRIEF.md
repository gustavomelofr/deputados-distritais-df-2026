# AGENT_BRIEF — Monitor Eleitoral DF 2026

## Missão

Construir e manter o **Monitor Eleitoral DF 2026**, um monitor independente das eleições de 2026 no Distrito Federal para os cargos de governador e vice, senador, deputado federal e deputado distrital.

O produto deve combinar notícias recentes, nomes monitorados, evidências de pré-candidatura, registros oficiais quando disponíveis, perfis, fotos atribuídas e contexto metodológico. Toda informação deve ser factual, datada e ligada à fonte específica.

## Fontes permitidas

Prioridade de fontes:

1. TSE, DivulgaCand e TRE-DF;
2. CLDF, Câmara dos Deputados, Senado Federal e demais órgãos públicos;
3. páginas e documentos oficiais de partidos;
4. declaração pública da própria pessoa em site ou perfil oficial;
5. veículos jornalísticos identificáveis;
6. Google News RSS somente como mecanismo de descoberta.

Regras:

- uma notícia deve apontar para a matéria específica ou para o item específico do agregador, nunca apenas para a página inicial do veículo;
- não use rumor anônimo, publicação sem autoria identificável ou conteúdo sem data;
- resumo não pode acrescentar fatos ausentes na fonte;
- antes do registro no TSE, use “nome monitorado”, “pré-candidatura declarada”, “anunciado pelo partido” ou “movimentação pública”; nunca “candidato oficial”;
- pesquisa de opinião, menção ou presença em evento não comprova intenção de candidatura;
- “movimentação pública” exige uma fonte primária ou duas reportagens independentes;
- Instagram serve somente para confirmar e exibir links de perfis oficiais. Não colete posts, frequência ou métricas;
- fotografia de imprensa só pode ser copiada quando a licença ou autorização de reutilização estiver explícita. Crédito isolado não substitui licença;
- na ausência de foto reutilizável, mantenha placeholder honesto.

## Arquitetura autônoma

O processo `loop-runner.js` é o único orquestrador:

```text
worktree isolado → implementer → TypeScript/build → verifier → PR → auto-merge
```

### Escopo de cada ciclo

- Execute somente a tarefa recebida pelo orquestrador.
- Faça uma melhoria pequena e verificável, preferencialmente em 1 a 4 arquivos.
- Rotinas de dados podem adicionar no máximo a quantidade indicada em “Limite por ciclo”.
- Se a tarefa for maior, entregue a menor parte que cumpra integralmente o critério atual; não invente subtarefas nem altere outros checkboxes.
- Não faça exploração ampla, redesign oportunista, SEO não solicitado ou refatoração fora do item.
- Não faça commit, push, merge ou alteração em caminhos protegidos.
- Não rode TypeScript, build ou testes pesados; o orquestrador valida depois.

### Estados das tarefas

- `[ ]`: pendente; é elegível para execução.
- `[x]`: concluída; só marque no mesmo diff que cumpre o critério de aceite.
- `[!]`: bloqueada por dependência externa; informe logo abaixo `Bloqueio:` e `Ação humana necessária:`.
- `[r]`: rotina recorrente; nunca altere para `[x]` após uma execução normal.

O primeiro item `[ ]` sempre tem prioridade. Não execute itens `[!]`, `[x]` ou tarefas fora da fila. Quando não houver `[ ]`, o orquestrador executa no máximo uma rotina `[r]` vencida.

Para rotina recorrente sem novidade válida, não edite arquivos e finalize a resposta com:

```text
LOOP_RESULT: NO_CHANGE — motivo objetivo
```

Para bloqueio real, documente o bloqueio no brief quando a tarefa for única e finalize com:

```text
LOOP_RESULT: BLOCKED — motivo objetivo
HUMAN_ACTION: ação necessária
```

## Regras de dados

- Nunca invente pessoa, cargo pretendido, partido, declaração, notícia, data, fotografia ou vínculo eleitoral.
- Preserve histórico; não substitua evidência antiga sem uma tarefa explícita.
- Separe `publicadaEm`, `coletadaEm` e `verificadaEm`.
- Deduplicate notícias por URL canônica, título normalizado e pauta/veículo/data.
- Associe uma notícia a uma pessoa apenas quando ela for citada ou estiver diretamente relacionada na fonte.
- Cada evidência eleitoral deve registrar pessoa, cargo, estágio, fonte, URL, data da evidência e data de verificação.
- Quando o DivulgaCand estiver disponível, registro oficial prevalece sobre classificação anterior.

## Fotografias

Ordem de preferência:

1. DivulgaCand/TSE;
2. página institucional oficial;
3. site oficial do partido;
4. site ou assessoria oficial da pessoa;
5. imprensa com licença explícita de reutilização.

Toda foto deve registrar arquivo ou URL, fonte, URL da fonte, data de verificação e licença/base de uso. Valide identidade, resposta HTTP, MIME de imagem e dimensões mínimas. Não use hotlink de imprensa sem permissão.

## Verificação e resumo humano

O verifier deve rejeitar:

- fonte ausente ou link genérico;
- classificação eleitoral sem evidência;
- foto sem origem e base de uso;
- datas futuras ou inconsistentes;
- duplicatas;
- lote acima do limite;
- associação incorreta de pessoa, partido ou cargo;
- alteração fora do item;
- testes falhos ou caminhos protegidos.

Além do parecer técnico, o verifier produz um resumo curto e factual do resultado visível. Esse resumo será enviado ao Telegram junto do PR.

## Fila de melhorias priorizada

Execute exatamente na ordem. As rotinas recorrentes ficam suspensas enquanto existir qualquer item `[ ]` nesta fila.

### P0 — Identidade e modelo editorial

- [x] Atualizar marca e metadados globais para “Monitor Eleitoral DF 2026”.
  Critério: título, descrição, cabeçalho e rodapé deixam claro que a cobertura inclui governo, Senado, Câmara Federal e CLDF, sem quebrar rotas atuais.

- [x] Atualizar a mensagem principal da Home para o novo escopo eleitoral.
  Critério: hero explica cargos cobertos, independência editorial e uso de evidências, preservando CTAs funcionais.

- [x] Atualizar metodologia para notícias, evidências eleitorais, fotos e links oficiais.
  Critério: explicar fontes, estágios, datas, licenças de imagem, limites e diferença entre pré-candidatura e registro oficial.

- [x] Criar tipos de pessoa eleitoral, evidência, fotografia e notícia eleitoral.
  Critério: tipos contemplam os quatro grupos de cargos, fonte, URL, datas separadas, estágio e licença da foto sem quebrar dados atuais.

- [x] Criar base eleitoral independente das notícias.
  Critério: cenário deixa de depender de palavras-chave nos títulos; base inicial pode estar vazia, com schema, validação e estado honesto.

- [x] Criar validação automatizada de integridade editorial.
  Critério: detectar IDs e URLs duplicados, links genéricos, datas inválidas, fonte ausente, slug inexistente e evidência sem cargo.

### P1 — Corrigir as 25 notícias atuais

- [x] Corrigir links e metadados das notícias 1–5.
  Critério: URL específica, publicação, coleta, tipo e associações verificadas; remover item que não puder ser confirmado.

- [x] Corrigir links e metadados das notícias 6–10.
  Critério: mesmos requisitos do lote anterior.

- [x] Corrigir links e metadados das notícias 11–15.
  Critério: mesmos requisitos do lote anterior.

- [x] Corrigir links e metadados das notícias 16–20.
  Critério: mesmos requisitos do lote anterior.

- [x] Corrigir links e metadados das notícias 21–25.
  Critério: mesmos requisitos do lote anterior.

- [x] Criar coletor de descoberta de notícias eleitorais.
  Critério: buscar fontes permitidas dos últimos sete dias, produzir candidatos deduplicados e não publicar automaticamente sem revisão do agente.

### P2 — Ampliar para 100 notícias dos últimos seis meses

- [x] Adicionar notícias verificadas até atingir 35 registros válidos.
  Critério: no máximo 10 novas, recentes, relevantes aos cargos do DF e com URL específica.

- [ ] Adicionar notícias verificadas até atingir 45 registros válidos.
  Critério: mesmos requisitos do lote anterior.

- [ ] Adicionar notícias verificadas até atingir 55 registros válidos.
  Critério: mesmos requisitos do lote anterior.

- [ ] Adicionar notícias verificadas até atingir 65 registros válidos.
  Critério: mesmos requisitos do lote anterior.

- [ ] Adicionar notícias verificadas até atingir 75 registros válidos.
  Critério: mesmos requisitos do lote anterior.

- [ ] Adicionar notícias verificadas até atingir 85 registros válidos.
  Critério: mesmos requisitos do lote anterior.

- [ ] Adicionar notícias verificadas até atingir 95 registros válidos.
  Critério: mesmos requisitos do lote anterior.

- [ ] Adicionar notícias verificadas até atingir 100 registros válidos.
  Critério: completar a meta sem duplicatas, links genéricos ou conteúdo fora da janela de seis meses.

### P3 — Nomes monitorados para 2026

- [ ] Mapear nomes para governador e vice-governador do DF.
  Critério: incluir apenas pré-candidatura declarada, anúncio partidário ou movimentação com evidência suficiente; fonte e data obrigatórias.

- [ ] Mapear nomes para as duas vagas do Senado pelo DF.
  Critério: mesmos requisitos de evidência.

- [ ] Mapear nomes para deputado federal pelo DF.
  Critério: lote inicial de até 10 nomes com evidência individual.

- [ ] Ampliar nomes para deputado federal pelo DF.
  Critério: até 10 nomes adicionais, sem inferir candidatura apenas por mandato atual.

- [ ] Mapear nomes para deputado distrital.
  Critério: lote inicial de até 10 nomes, incluindo incumbentes somente quando houver evidência eleitoral.

- [ ] Ampliar nomes para deputado distrital.
  Critério: até 10 nomes adicionais, incluindo novos nomes quando sustentados por fonte.

- [ ] Criar histórico de evidências por pessoa.
  Critério: preservar mudança de estágio, partido ou cargo com fonte e data, sem apagar o registro anterior.

- [ ] Preparar integração com DivulgaCand/TSE.
  Critério: detectar disponibilidade da eleição 2026 e manter estado indisponível até existir dado oficial; sem credenciais secretas no Git.

### P4 — Fotos e perfis oficiais

- [ ] Auditar fotos dos deputados distritais 1–10.
  Critério: identidade, fonte, licença/base de uso, validade e data de verificação registradas.

- [ ] Auditar fotos dos deputados distritais 11–20.
  Critério: mesmos requisitos do lote anterior.

- [ ] Auditar fotos dos deputados distritais 21–24.
  Critério: mesmos requisitos do lote anterior.

- [ ] Criar placeholder e metadados padronizados de fotografia.
  Critério: perfil funciona sem foto; nenhuma imagem sem fonte e base de uso.

- [ ] Adicionar fotos verificadas aos nomes monitorados 1–10.
  Critério: no máximo 10, respeitando a ordem de fontes e licenças.

- [ ] Adicionar fotos verificadas aos nomes monitorados 11–20.
  Critério: mesmos requisitos do lote anterior.

- [ ] Catalogar links oficiais de Instagram dos nomes monitorados.
  Critério: apenas links confirmados em fonte oficial; sem posts ou métricas.

### P5 — Nova experiência eleitoral

- [ ] Criar página geral “Eleições 2026 no DF”.
  Critério: oferecer caminhos para governo, Senado, deputado federal e deputado distrital, com metodologia visível.

- [ ] Criar exploração por cargo.
  Critério: filtros de cargo, partido, estágio e data funcionam em desktop e mobile.

- [ ] Criar perfil eleitoral individual.
  Critério: foto atribuída ou placeholder, cargo, estágio, evidências, notícias e links oficiais.

- [ ] Migrar a página de cenário 2026 para a nova base eleitoral.
  Critério: manter compatibilidade da rota atual e não classificar por palavras-chave de notícia.

- [ ] Atualizar navegação para o novo foco.
  Critério: hierarquia clara e acessível sem remover acesso à atividade legislativa histórica.

## Rotinas recorrentes

Estas rotinas só ficam elegíveis quando não houver item `[ ]` na fila acima. Uma execução normal mantém `[r]`. Se uma rotina ficar estruturalmente bloqueada, altere para `[!]` em PR revisado e documente o motivo.

- [r] noticias-eleitorais: Notícias eleitorais recentes
  Frequência: 24h
  Limite por ciclo: 10
  Instrução: buscar notícias dos últimos sete dias sobre as eleições de 2026 no DF e os nomes monitorados; adicionar somente itens novos, relevantes, deduplicados e com URL específica, fonte, publicação, coleta, tipo, cargo e pessoas relacionadas.
  Critério: no máximo 10 itens por PR; sem novidade válida, retornar NO_CHANGE sem editar arquivos.

- [r] evidencias-eleitorais: Evidências de pré-candidaturas
  Frequência: 24h
  Limite por ciclo: 10
  Instrução: verificar novas declarações, anúncios partidários, movimentações públicas e registros oficiais para governo, Senado, deputado federal e deputado distrital no DF; atualizar histórico sem apagar evidência anterior.
  Critério: no máximo 10 alterações por PR; classificação exige fonte suficiente; sem novidade válida, retornar NO_CHANGE.

- [r] fotos-e-perfis: Fotos e perfis oficiais
  Frequência: 24h
  Limite por ciclo: 10
  Instrução: verificar fotos ausentes ou quebradas, fontes oficiais mais recentes, licença/base de uso e links oficiais de Instagram; atualizar somente quando identidade e permissão estiverem confirmadas.
  Critério: no máximo 10 alterações por PR; imprensa somente com licença explícita; sem novidade válida, retornar NO_CHANGE.

## Saída humana

Telegram recebe somente mudanças aprovadas, entregas pendentes, bloqueios, escalonamentos, falhas e transição real para idle. Ciclo recorrente sem novidade não envia mensagem.

Toda mensagem deve conter `Resumo:` com uma frase curta e factual sobre o resultado do ciclo. O estado técnico completo permanece em `.loop/`.
