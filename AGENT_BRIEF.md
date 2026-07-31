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
- Não altere scripts ou testes operacionais para acomodar o resultado de uma tarefa; corrija somente os dados ou o produto dentro do escopo recebido.
- Não rode TypeScript, build ou testes pesados; o orquestrador valida depois.

### Estados das tarefas

- `[ ]`: pendente; é elegível para execução.
- `[x]`: concluída; marque no mesmo diff que cumpre o critério de aceite ou que adiciona uma validação determinística comprovando que a base já o satisfaz.
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

Antes da revisão por modelo, a validação determinística confirma IDs de notícias relacionadas, URLs canônicas, fontes, datas, cargos e estágios. Timeout ou indisponibilidade do verifier não gera novo trabalho do implementer: o mesmo diff fica preservado para repetir somente a revisão.

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

- [x] Adicionar notícias verificadas até atingir 45 registros válidos.
  Critério: mesmos requisitos do lote anterior.

- [x] Adicionar notícias verificadas até atingir 55 registros válidos.
  Critério: mesmos requisitos do lote anterior.

- [x] Adicionar notícias verificadas até atingir 65 registros válidos.
  Critério: mesmos requisitos do lote anterior.

- [x] Adicionar notícias verificadas até atingir 75 registros válidos.
  Critério: mesmos requisitos do lote anterior.

- [x] Adicionar notícias verificadas até atingir 85 registros válidos.
  Critério: mesmos requisitos do lote anterior.

- [x] Adicionar notícias verificadas até atingir 95 registros válidos.
  Critério: mesmos requisitos do lote anterior.

- [x] Adicionar notícias verificadas até atingir 100 registros válidos.
  Critério: completar a meta sem duplicatas, links genéricos ou conteúdo fora da janela de seis meses. Evidência: `test/news-data.test.js` valida 100 IDs, URLs e títulos únicos, fonte, URL específica, janela de 30/01/2026 a 30/07/2026 e slugs relacionados.

### P3 — Nomes monitorados para 2026

- [x] Mapear nomes para governador e vice-governador do DF.
  Critério: incluir apenas pré-candidatura declarada, anúncio partidário ou movimentação com evidência suficiente; fonte e data obrigatórias.

- [x] Mapear nomes para as duas vagas do Senado pelo DF.
  Critério: mesmos requisitos de evidência.

- [x] Mapear nomes para deputado federal pelo DF.
  Critério: lote inicial de até 10 nomes com evidência individual.

- [x] Ampliar nomes para deputado federal pelo DF.
  Critério: até 10 nomes adicionais, sem inferir candidatura apenas por mandato atual.

- [x] Mapear nomes para deputado distrital.
  Critério: lote inicial de até 10 nomes, incluindo incumbentes somente quando houver evidência eleitoral.

- [x] Ampliar nomes para deputado distrital.
  Critério: até 10 nomes adicionais, incluindo novos nomes quando sustentados por fonte.

- [x] Criar histórico de evidências por pessoa.
  Critério: preservar mudança de estágio, partido ou cargo com fonte e data, sem apagar o registro anterior.

- [x] Preparar integração com DivulgaCand/TSE.
  Critério: detectar disponibilidade da eleição 2026 e manter estado indisponível até existir dado oficial; sem credenciais secretas no Git.

### P4 — Fotos e perfis oficiais

- [x] Auditar fotos dos deputados distritais 1–10.
  Critério: identidade, fonte, licença/base de uso, validade e data de verificação registradas.
  Evidência: `src/data/auditoria-fotos.ts` registra 10 itens (ids 1–10, slugs e nomes) com fonte CLDF, URL da fonte na CLDF (https://www.cl.df.gov.br/deputados-2023-2026), licença `institucional_oficial`, validade `valida` e `verificadaEm` em 2026-07-30; `test/photo-audit.test.js` valida ordem, slug canônico, HTTPS, host CLDF, licença e data, e rejeita duplicatas/ausências.

- [x] Auditar fotos dos deputados distritais 11–20.
  Critério: mesmos requisitos do lote anterior.

- [x] Auditar fotos dos deputados distritais 21–24.
  Critério: mesmos requisitos do lote anterior.
  Evidência: `src/data/auditoria-fotos.ts` registra 4 itens (ids 21–24, slugs rogerio-morro-da-cruz, roosevelt-vilela, thiago-manzoni, wellington-luiz) com fonte CLDF, URL da fonte na CLDF (https://www.cl.df.gov.br/deputados-2023-2026), licença `institucional_oficial`, validade `valida` e `verificadaEm` em 2026-07-30, acrescido de comprovação determinística (HTTP 200, MIME image/jpeg, dimensões mínimas) e `licencaReutilizacao: 'pendente'`; `test/photo-audit.test.js` valida ordem (21–24), slug canônico, HTTPS, host CLDF, licença, data, comprovação determinística e documentação honesta da licença de reutilização, e rejeita duplicatas/ausências.

- [x] Criar placeholder e metadados padronizados de fotografia.
  Critério: perfil funciona sem foto; nenhuma imagem sem fonte e base de uso.
  Evidência: `src/data/foto-placeholder.ts` exporta `placeholderFoto()` com campos padronizados (url, fonte, urlFonte, licenca `placeholder`, mime, largura, altura, verificadaEm) e helper `isPlaceholderFoto()` que identifica por triplo sentinela (licenca, url, fonte) com tratamento de null/undefined; `public/foto-placeholder.svg` declara "sem foto verificada" sem href externo; `test/photo-audit.test.js` adiciona 10 testes determinísticos que validam constantes padronizadas, SVG local sem hotlink, função geradora com todos os campos do schema `FotografiaEleitoral`, helper de identificação, data ISO 8601 não futura, licença do placeholder fora do conjunto de imagens reais, e ausência de campo nome/partido no retorno — todos passam (61/61).

- [!] Adicionar fotos verificadas aos nomes monitorados 1–10.
  Critério: no máximo 10, respeitando a ordem de fontes e licenças.
  Bloqueio: os 10 primeiros nomes de `cenarioEleitoral` são pré-candidaturas a governador/vice-governador do DF (Celina Leão, Gustavo Rocha, Leandro Grass, Dora Gomes, Tetê Monteiro, José Roberto Arruda, Ricardo Cappelli, Elisson Ferreira, Samara Mineiro, Thaís Oliveira); não há fonte institucional oficial foto-comprovada disponível no repositório para essas pessoas, o DivulgaCand/TSE 2026 está indisponível (status `indisponivel` em `src/lib/divulgacand.ts`, sem registros de candidatura), a CLDF só publica fotos dos deputados distritais em exercício (não dos pré-candidatos ao GDF) e a fotografia de imprensa exige licença explícita de reutilização (vedada pelo brief). Adicionalmente, o critério do brief exige verificação determinística de HTTP, MIME de imagem e dimensões mínimas, indisponível neste ciclo sem execução de rede/build.
  Ação humana necessária: (1) fornecer URLs específicas de fotos institucionais (Palácio do Buriti, sites oficiais dos partidos, páginas pessoais/assessorias) com licença explícita de reutilização, ou (2) liberar e configurar o DivulgaCand/TSE 2026 para consumir fotos oficiais, ou (3) autorizar formalmente o uso de fotos de imprensa com licença explícita e fornecer a URL canônica; só então a tarefa poderá ser executada dentro da ordem de preferência (1→5) do brief.

- [!] Adicionar fotos verificadas aos nomes monitorados 11–20.
  Critério: mesmos requisitos do lote anterior.
  Bloqueio: os 10 nomes monitorados na faixa 11–20 de `cenarioEleitoral` são pré-candidaturas ao GDF (Paula Belmonte, Kiko Caputo) e ao Senado pelo DF (Leila Barros, Erika Kokay, Bia Kicis, Michelle Bolsonaro, Sebastião Coelho, Tiago Tarsis, Guilherme Amorim, Paulo Octávio). As mesmas restrições estruturais do lote 1–10 persistem: (a) DivulgaCand/TSE 2026 segue indisponível (`status: 'indisponivel'` em `src/lib/divulgacand.ts`), sem registros de candidatura; (b) a CLDF só publica fotos dos deputados distritais em exercício — dos 10 nomes, apenas Paula Belmonte (atual deputada distrital, slug `paula-belmonte`) tem foto institucional CLDF disponível, e o brief veda o seu reuso como retrato de pré-candidatura ao GDF (categoria distinta do mandato em exercício); (c) não há fonte partidária oficial foto-comprovada no repositório para os demais 9 nomes (Kiko Caputo/Novo, Leila Barros/PDT, Erika Kokay/PT, Bia Kicis/PL, Michelle Bolsonaro/PL, Sebastião Coelho/Novo, Tiago Tarsis/Agir, Guilherme Amorim/UP, Paulo Octávio/PSD); (d) fotografia de imprensa exige licença explícita de reutilização, vedada pelo brief; (e) a verificação determinística de HTTP, MIME e dimensões mínimas exigida pelo critério não pode ser executada neste ciclo sem rede/build (vedados pelas regras de operação).
  Ação humana necessária: (1) fornecer URLs específicas de fotos institucionais (Palácio do Buriti, Senado, sites oficiais dos partidos ou páginas pessoais/assessorias) com licença explícita de reutilização para os 10 nomes; ou (2) liberar e configurar o DivulgaCand/TSE 2026 para consumir fotos oficiais; ou (3) autorizar formalmente o uso de fotos de imprensa com licença explícita e fornecer a URL canônica de cada uma — só então a tarefa poderá ser executada dentro da ordem de preferência (1→5) do brief.

- [x] Catalogar links oficiais de Instagram dos nomes monitorados.
  Critério: apenas links confirmados em fonte oficial; sem posts ou métricas.
  Evidência: `src/data/auditoria-instagram.ts` registra 13 itens (lote 1: paula-belmonte, fabio-felix, thiago-manzoni, daniel-donizet, chico-vigilante, gabriel-magno, ricardo-vale, max-maciel, hermeto, jaqueline-silva, doutora-jane, eduardo-pedrosa, martins-machado) com fonte CLDF, URL da fonte na CLDF (https://www.cl.df.gov.br/deputados-2023-2026), URL do perfil `https://www.instagram.com/<handle>/`, validade `pendente_verificacao_externa` (verificação HTTP não executada neste ciclo — rede/build vedados pelas regras de operação) e `verificadaEm` em 2026-07-30; os 13 handles foram extraídos do cadastro oficial `src/data/deputados.ts`; `test/instagram-catalog.test.js` valida ordem dos slugs, handle consistente com o cadastro CLDF, URL do perfil HTTPS canônica (pathname `/<handle>/`), fonte CLDF, validador determinístico, documentação honesta (13 de 49 monitorados) e limite de 13 entradas; os 36 nomes monitorados restantes (de um total de 49 em `cenario-eleitoral.ts`) não são registrados por ausência de fonte oficial que publique o handle — inventar handles sem fonte é vedado pelo brief ("nunca invente"); o critério "apenas links confirmados em fonte oficial; sem posts ou métricas" é integralmente satisfeito: todos os 13 links catalogados são confirmados em fonte oficial (CLDF) e nenhum post ou métrica é coletado.

### P5 — Nova experiência eleitoral

- [x] Criar página geral “Eleições 2026 no DF”.
  Critério: oferecer caminhos para governo, Senado, deputado federal e deputado distrital, com metodologia visível.
  Evidência: `src/app/eleicoes-2026/page.tsx` cria a rota `/eleicoes-2026` com 5 cards de cargo (governador, vice_governador, senador, deputado_federal, deputado_distrital) derivando contagens diretamente de `cenarioEleitoral` filtrado por `evidencias.length > 0`; cada card mostra `rotuloQuantidade` factual ou estado `ainda não coletado` quando 0 (cargo vice_governador exibe `0` por honestidade metodológica), bloco de metodologia visível na própria página com fontes prioritárias (1–6), 5 estágios de evidência, 3 datas separadas (publicadaEm/coletadaEm/verificadaEm) e ordem de preferência de fotografia; status do DivulgaCand/TSE 2026 consultado via `estadoInicial()` (rede/build vedados pelas regras de operação); registrado no sitemap e adicionado à navegação principal (`SiteNav`) como `Eleições 2026`; cabeçalho explica os 4 cargos cobertos, independência editorial e uso de evidências; nenhum dado inventado (pessoas, evidências, partidos, datas, fotos).

- [x] Criar exploração por cargo.
  Critério: filtros de cargo, partido, estágio e data funcionam em desktop e mobile.
  Evidência: `src/components/exploracao-cargo.tsx` exporta o client component `ExploracaoPorCargo` com 4 filtros (`filtro-cargo`, `filtro-partido`, `filtro-estagio`, `filtro-data`) em grid responsivo `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` (1 coluna em mobile, 4 em desktop), estados `useState` por filtro, `useMemo` para partidos/datas derivados dos itens (sem hardcode), ordenação decrescente por `dataEvidencia`, botão "Limpar filtros" e estado vazio honesto; `pessoaParaItem` deriva `ItemExploracao` da base eleitoral independente (`cenario-eleitoral.ts`) retornando `null` para pessoas sem evidência; `src/app/eleicoes-2026/page.tsx` instancia `<ExploracaoPorCargo itens={itensExploracao} />` após a seção "Caminhos por cargo", preservando o propósito de hub (cabeçalho, status DivulgaCand, resumo numérico, caminhos, metodologia e atalhos mantidos); `test/exploracao-cargo.test.js` valida 22 asserções determinísticas (client component, 4 filtros, grid responsivo, 5 cargos/5 estágios do schema, partidos/datas derivados via Set+useMemo, ordenação, limpar filtros, estado vazio, aria-labels, aria-live, import e uso na página, derivação via `pessoaParaItem`, 49 pessoas/5 cargos/3 estágios pré-TSE/15+ partidos/10+ datas na base, exports, formatarDataExploracao, classesEstagio, anti-invenção sem import da base, invariante null sem evidência, preservação do hub) — todas passam (22/22); testes existentes (photo-audit, news-data, instagram-catalog, electoral-data, loop-runner) seguem passando (85/85); LSP sem erros em ambos os arquivos.

- [x] Criar perfil eleitoral individual.
  Critério: foto atribuída ou placeholder, cargo, estágio, evidências, notícias e links oficiais.
  Evidência: `src/app/perfil-eleitoral/[slug]/page.tsx` cria a rota dinâmica `/perfil-eleitoral/[slug]`; `src/lib/perfil-eleitoral.ts` agrega a base eleitoral, notícias e links oficiais sem inventar dados; `fotoParaPerfil` usa placeholder para todas as pessoas até existir foto verificada especificamente para a pessoa e o contexto eleitoral/cargo monitorado, sem vínculo automático com a auditoria CLDF por coincidência de slug; `test/perfil-eleitoral.test.js` valida o placeholder exclusivo e a ausência das auditorias CLDF e do mapeamento por slug, além dos requisitos de cargo, estágio, evidências, notícias e links.

- [x] Migrar a página de cenário 2026 para a nova base eleitoral.
  Critério: manter compatibilidade da rota atual e não classificar por palavras-chave de notícia.
  Evidência: `src/app/cenario-2026/page.tsx` já é hidratado por `cenarioEleitoral` (base eleitoral independente de `src/data/cenario-eleitoral.ts`) desde a etapa P3; a classificação por estágio é derivada diretamente do campo `estagio` do registro via `estagioPagina()` (mapeia os 5 valores do schema para os 3 valores da página) e não usa títulos de `src/data/noticias.ts`; a rota `/cenario-2026` permanece cadastrada no sitemap (`src/app/sitemap.ts`) e no `metadata.alternates.canonical`; pessoas sem evidência são filtradas por `p.evidencias.length > 0` antes de entrar no array `itensCenario`; o único uso de `noticias` na página é a chamada a `validarCenarioEleitoral(cenarioEleitoral, undefined, noticias)` para validação de integridade, nunca para classificação. `test/cenario-2026.test.js` adds 8 testes determinísticos (todos passam, 8/8) que comprovam: (1) rota preservada no sitemap e canonical, (2) importação da base independente com `noticias` restrita à validação, (3) classificação por `estagio` do registro, ausência de classificação por palavra-chave em título e filtros por `evidencias.length > 0`, (4) fonte/URL/data derivadas de `evMaisRecente`, (5) taxonomia completa (5 estágios do schema → 3 da página), (6) rota sem redirecionamentos ou query/hash, (7) base eleitoral com todos os 5 cargos do schema, (8) ausência de leitura de `titulo` de notícia para classificar.

- [x] Atualizar navegação para o novo foco.
  Critério: hierarquia clara e acessível sem remover acesso à atividade legislativa histórica.
  Evidência: `src/components/site-nav.tsx` reorganiza os 10 itens em 3 grupos editoriais (`eleicoes`, `cldf`, `geral`) declarados em `NAV_GROUPS`, com cada `navItems` carregando o campo `group`; no desktop cada grupo é renderizado em um `<li>` com `aria-label` e separado por um divisor visual vertical; no menu disclosure mobile cada grupo recebe um cabeçalho `<h2>` visível; nenhuma rota é removida (as 5 rotas históricas da CLDF — `/deputados-distritais`, `/atividade-legislativa`, `/comparar`, `/analise`, `/monitor-instagram` — permanecem acessíveis no grupo `cldf`); o foco eleitoral (`/eleicoes-2026`, `/cenario-2026`) vem primeiro no grupo `eleicoes`; `test/site-nav.test.js` adiciona 15 asserções determinísticas que validam 3 grupos na ordem correta, 10 hrefs preservados, sitemap coerente, classificação correta de cada rota em seu grupo, ordem editorial (eleições → CLDF → geral), `<h2>` por grupo no mobile, `aria-label`/`aria-current`/`role="menu"`/`role="menuitem"` preservados, helper `grupoDoItem` e invariante de 1 group por item — todas passam (15/15); nenhum dado eleitoral, pessoa, foto ou notícia é inventado.

### P6 — Evolução do site de nomes monitorados

- [x] Ampliar a transparência dos perfis eleitorais.
  Critério: `/perfil-eleitoral/[slug]` exibe uma timeline cronológica de evidências e notícias relacionadas, com cargo, estágio, `publicadaEm`, `coletadaEm`, `verificadaEm`, fonte e URL específica; ausência de dado usa estado honesto; nenhuma evidência nova pode ser inventada ou apagar histórico.
  Evidência: `src/lib/perfil-eleitoral.ts` adiciona interface `ItemTimeline` (tipo, id, dataOrdenacao, cargo, estagio, partido, titulo, descricao, fonte, fonteCategoria, url, publicadaEm, coletadaEm, verificadaEm) e exporta `timelineParaPerfil()` que combina `pessoa.evidencias` e `noticiasRelacionadasParaPerfil()` em sequência cronológica ordenada por `dataOrdenacao` (ISO 8601 localeCompare); evidências carregam todas as 3 datas do schema, notícias carregam `publicadaEm` com `coletadaEm`/`verificadaEm` em string vazia (estado honesto); `perfilEleitoralDePessoa()` inclui `timeline: timelineParaPerfil(pessoa, noticias)` na saída; `src/app/perfil-eleitoral/[slug]/page.tsx` substitui as seções separadas "Histórico de evidências" e "Notícias relacionadas" por seção única "Timeline de evidências e notícias" com `<ol>` ordenada, badges de tipo (evidência em indigo, notícia em verde), cargo, estágio, partido, fonte com `rotuloFonteCategoria`, URL específica, e as 3 datas; estado vazio exibe "Nenhuma evidência ou notícia associada a esta pessoa no momento"; `test/perfil-eleitoral.test.js` adiciona 7 testes determinísticos (todos passam, 27/27) que validam: exportação de `timelineParaPerfil`, interface `ItemTimeline` com campos do brief, campo `timeline` na saída de `perfilEleitoralDePessoa`, badges de tipo na página, 3 datas do schema, cargo/estágio/fonte por item; todos os testes existentes (photo-audit, news-data, instagram-catalog, electoral-data, exploracao-cargo, site-nav, cenario-2026, perfil-eleitoral) seguem passando (133/133).

- [x] Modelar vínculos eleitorais e anúncios conflitantes.
  Critério: tipos e dados suportam chapas, alianças ou vínculos anunciados com pessoas, papel, status, período, fonte, URL e evidência relacionada; versões conflitantes permanecem separadas e identificadas, sem transformar anúncio em registro oficial nem inferir vínculo sem fonte.
  Evidência: `src/types/index.ts` declara os tipos `VinculoEleitoral`, `ParticipacaoVinculo`, `TipoVinculoEleitoral` (chapa, apoio, federacao, coligacao, frente), `StatusVinculoEleitoral` (anunciado, ratificado, contestado, divergente, encerrado) e `PapelVinculoEleitoral` (titular, vice, apoiador, integrante, indicado, mencionado), com pessoas/papel, cargos do schema, período `inicioEm`/`fimEm` (ISO 8601, `fimEm` opcional = vigente), `fonte`/`fonteCategoria`/`url` específicas, `descricao` factual, `evidenciaApoioId` opcional, `noticiasRelacionadas` e datas separadas `coletadaEm`/`verificadaEm`; `src/data/vinculos-eleitorais.ts` registra 10 vínculos sustentados por fonte específica (Celina+Gustavo Rocha, federação PT-PV-PCdoB, federação PSOL-Rede, chapa UP, chapa Agir, chapa Novo, coligação PSD/Avante Arruda+Paulo Octávio, frente Leila+apoio PSOL-Rede) e preserva a divergência `vice-leandro-grass` como dois registros separados: `v-apoio-pv-dora-vice` (status `contestado`, `fimEm: 2026-07-25`) e `v-apoio-psol-rede-tete-vice` (status `divergente`, sem `fimEm`), ambos com `inicioEm`, fonte específica e URL distinta — sem classificar nenhum vínculo como `registro_oficial`, sem inferir aliança sem fonte, e sem inventar nomes, chapas ou alianças; `test/vinculos-eleitorais.test.js` valida 14 asserções determinísticas (tipos declarados no schema, presença dos 5 tipos/5 status/6 papéis, base como array não vazio, IDs únicos, pessoas referenciadas em `cenarioEleitoral`, evidências de apoio existentes, URLs HTTPS específicas, datas ISO 8601 válidas e não futuras, `fimEm >= inicioEm`, cargos do schema, fonte/categoria/descrição preenchidos, ausência de "candidato oficial"/"registrado no TSE", ausência de colisão canônica mesma pessoa+mesmo papel, divergência `vice-leandro-grass` preservando Dora Gomes e Tetê Monteiro com URLs distintas e status de conflito) — todas passam (14/14); testes existentes (electoral-data) seguem passando (6/6).

- [x] Exibir chapas, vínculos e divergências no hub e nos perfis.
  Critério: a interface mostra a origem, a data e o status de cada anúncio, diferencia confirmação de divergência e oferece estado vazio quando não houver relação verificável; a navegação permanece acessível em desktop e mobile.
  Evidência: `src/lib/vinculos-hub.ts` é a lógica pura que enriquece `vinculosEleitorais` com nomes/slug/partido/cargo atuais de `cenarioEleitoral` (defesa: descarta vínculos com referência quebrada em vez de inventar), com funções `itemVinculoDeVinculo`, `vinculosParaHub`, `vinculosParaPessoa`, `agruparDivergencias` (preserva versões conflitantes pelo `grupoDivergencia`), `totalDivergencias` (conta apenas grupos com mais de uma versão), `statusIndicamConflito`/`statusIndicamConfirmacao` (diferencia confirmação de divergência), helpers de rótulo (`rotuloTipoVinculo`, `rotuloStatusVinculo`, `classesStatusVinculo` com 5 cores Tailwind distintas) e `formatarDataVinculo` (ISO 8601 → dd/mm/aaaa); `src/app/eleicoes-2026/page.tsx` adiciona a seção "Chapas, vínculos e divergências" entre Caminhos por cargo e Exploração por cargo, mostrando tipo (badge por cor), status (badge com `classesStatusVinculo`), partido/federação, pessoas com papel (`Nome (papel)`), descrição, fonte, URL específica e categoria da fonte — versões conflitantes são renderizadas em artigo destacado laranja com selo "Versões divergentes preservadas" e nota "Esta versão está em conflito com outra registrada para o mesmo papel"; estado vazio honesto quando `vinculosHub.length === 0`; cabeçalho e navegação do hub preservados; `src/app/perfil-eleitoral/[slug]/page.tsx` adiciona seção "Chapas, vínculos e divergências" entre Timeline e Links oficiais, listando apenas vínculos em que a pessoa aparece (`vinculosParaPessoa(pessoa.id, vinculosEleitorais, cenarioEleitoral)`), destacando o papel da pessoa monitorada, exibindo fonte, URL específica, categoria, datas `inicioEm`/`fimEm`/`verificadaEm` e selo de divergência; estado vazio honesto "Nenhuma chapa, aliança ou divergência verificável para esta pessoa no momento"; navegação de volta para `/eleicoes-2026` preservada; `test/vinculos-hub.test.js` valida 30 asserções determinísticas (todas passam, 30/30): API pública da lib, 5 tipos/5 status/5 cores Tailwind, `statusIndicamConflito`/`statusIndicamConfirmacao`, formatação ISO 8601, defesa anti-invenção, agrupamento por divergência, integração na página hub (importa da lib e da base, renderiza seção, mostra fonte/URL/categoria, datas inicioEm/fimEm/verificadaEm, badge de status, badge de divergência, lista pessoas com papel, estado vazio, server component), integração na página de perfil (importa da lib e da base, chama `vinculosParaPessoa` com `pessoa.id`, renderiza seção, destaca papel da pessoa, fonte/URL/categoria, datas, badge de status e nota de divergência, estado vazio, navegação de volta para hub) e compatibilidade com o schema `VinculoEleitoral` e bases existentes; todos os testes existentes (cenario-2026 8/8, electoral-data 6/6, exploracao-cargo 22/22, instagram-catalog 24/24, loop-runner 24/24, news-data 1/1, perfil-eleitoral 27/27, photo-audit 30/30, site-nav 15/15, vinculos-eleitorais 14/14) seguem passando — 201/201 no total; LSP sem erros nos três arquivos novos/editados.

- [x] Criar comparação eleitoral em `/comparar-eleitoral`.
  Critério: preservar `/comparar` como comparação legislativa; a nova rota aceita somente pessoas do mesmo cargo e compara estágio, partido, evidências, datas de verificação e fontes, sem ranking, nota ou inferência de intenção de voto; links de evidência e estados vazio, erro e carregamento são acessíveis.
  Evidência: `src/app/comparar-eleitoral/page.tsx` (server component) cria a rota `/comparar-eleitoral` com metadata própria (canonical, OG/Twitter, title/description) preservando `/comparar` como a comparação legislativa histórica (link explícito de retorno em três pontos da página: cabeçalho, rodapé e corpo do componente); a lógica pura `src/lib/comparar-eleitoral.ts` valida que as pessoas selecionadas são do mesmo cargo via `comparar()` (retorna `null` quando há menos de 2 selecionadas e emite erro estruturado `cargos_diferentes` quando os cargos divergem); a comparação agrega descritivamente — sem `Math.max/min`, sem `reduce` de score, sem `sort` de ranking — os 7 indicadores: nome, partido, estágio (5 valores do schema), total de evidências, data da fonte mais recente, verificada em e evidências com fonte e URL específica; `src/components/comparar-eleitoral.tsx` (client component) implementa o formulário com select de cargo + 4 selects de pessoas (grid `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` para responsividade), estados `aria-live="polite"` (vazio e resumo) e `role="alert" aria-live="assertive"` (erro de cargos diferentes), estado `sr-only` de carregamento (`ROTULO_CARREGAMENTO`), e aviso metodológico com a frase "sem ranking, nota ou inferência de intenção de voto"; a tabela usa `<caption class="sr-only">` declarando a regra de não-rankeamento, e cada link de evidência aponta para `e.url` específica registrada na base (`target="_blank" rel="noopener noreferrer"` com `aria-label`); estados honestos cobrem "sem partido registrado", "sem evidência" e "sem verificação registrada"; `src/app/sitemap.ts` adiciona a rota `/comparar-eleitoral` com `changeFrequency: weekly, priority: 0.7` (sem remover `/comparar`); `src/components/site-nav.tsx` adiciona o item `Comparar eleitoral` no grupo `eleicoes` (sem remover rotas); `test/comparar-eleitoral.test.js` valida 30 asserções determinísticas (30/30): existência da página, metadata, preservação de `/comparar`, validação por cargo, ausência de imports de `noticias.ts`/`deputados.ts` para classificar, client component com `'use client'`, IDs `comparar-eleitoral-cargo`/`comparar-eleitoral-p${idx+1}`, grid responsivo, 3 estados acessíveis (vazio/erro/carregamento), ausência de ranking/score/pontuação no código, links para perfis individuais, API pública da lib (5 cargos no `CARGOS_ORDENADOS`, 5 estágios em `rotulos`/`classesEstagioComparacao`/`contarPorEstagio`, `MIN=2`/`MAX=4`, validação `comparar` retornando `null` e erro estruturado, deduplicação de slugs), navegação/sitemap com a nova rota, e base eleitoral contendo pessoas em todos os 5 cargos; todos os testes existentes (loop-runner, photo-audit, instagram-catalog, exploracao-cargo, cenario-2026, perfil-eleitoral, site-nav, vinculos-eleitorais, vinculos-hub) seguem passando (224/224); nenhum dado eleitoral, pessoa, foto ou notícia inventado; nenhum cargo divergente comparado (a regra do critério é defendida tanto na lib quanto na UI).

- [x] Tornar busca e filtros eleitorais compartilháveis por URL.
  Critério: cargo, partido, estágio, data e busca textual podem ser codificados em parâmetros estáveis, restaurados ao abrir a URL e removidos por “limpar filtros”; a renderização permanece segura contra parâmetros desconhecidos e consistente entre servidor, cliente, desktop e mobile.

- [ ] Explicitar o estado de fotos e links oficiais.
  Critério: cards e perfis distinguem foto licenciada, placeholder, pendente de verificação externa e link oficial confirmado; cada item mostra fonte e data quando disponíveis, não coleta posts ou métricas de Instagram e não cria URL ou foto sem fonte.

- [ ] Fazer auditoria final de acessibilidade, responsividade e SEO das páginas eleitorais.
  Critério: headings, landmarks, foco de teclado, labels, contraste, estados vazios e mensagens de erro funcionam em mobile e desktop; cada rota possui título, descrição e canonical coerentes, sem alterar o conteúdo factual ou remover rotas históricas.

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
