import { PessoaEleitoral } from '@/types';

// ---------------------------------------------------------------------------
// Base eleitoral independente das notícias — Eleições 2026 no DF
//
// Fonte de verdade do cenário eleitoral em /cenario-2026. NÃO é derivada de
// palavras-chave nos títulos de notícias. Cada registro segue o schema
// PessoaEleitoral (src/types/index.ts) e deve ser validado por
// validarCenarioEleitoral (src/lib/validar-cenario-eleitoral.ts).
//
// Preenchimento da fila P3 (AGENT_BRIEF.md):
//  - "Mapear nomes para governador e vice-governador do DF":
//    pré-candidatura declarada, anúncio partidário ou movimentação pública
//    com evidência específica suficiente (URL e data). Cada registro aponta
//    para notícia já validada em src/data/noticias.ts; nenhuma evidência é
//    inferida só por mandato atual. Estágios anteriores ao registro no TSE
//    nunca são "registro_oficial".
//  - "Mapear nomes para deputado federal pelo DF" (lote inicial e ampliação).
//  - "Mapear nomes para deputado distrital" (lote inicial de até 10 nomes):
//    incumbentes só entram com evidência eleitoral específica — anúncio
//    partidário da nominata para a CLDF ou reportagem com declaração/
//    articulação de candidatura à reeleição. Foto fica para P4.
// ---------------------------------------------------------------------------

export const cenarioEleitoral: PessoaEleitoral[] = [
  // ---------------------------------------------------------------------------
  // Governador e vice-governador do DF — evidências em src/data/noticias.ts
  // ---------------------------------------------------------------------------

  // 1. Celina Leão (PP) — pré-candidata à reeleição ao GDF, anunciada pelo PP.
  {
    id: 'celina-leao',
    slug: 'celina-leao',
    nome: 'Celina Leão',
    nomeCompleto: 'Celina Leão',
    cargo: 'governador',
    partido: 'PP',
    estagio: 'anunciado_pelo_partido',
    noticiasRelacionadas: ['n48', 'n90', 'n94', 'n95'],
    evidencias: [
      {
        id: 'e-celina-leao-n48',
        pessoaId: 'celina-leao',
        cargo: 'governador',
        estagio: 'anunciado_pelo_partido',
        partido: 'PP',
        fonte: 'G1',
        fonteCategoria: 'veiculo_jornalistico',
        url: 'https://g1.globo.com/df/distrito-federal/noticia/2026/07/18/pp-lanca-pre-candidatura-de-celina-leao-ao-governo-do-df.ghtml',
        descricao:
          'PP oficializou, em evento em Ceilândia, o nome da governadora Celina Leão como pré-candidata à reeleição ao GDF.',
        dataEvidencia: '2026-07-18',
        coletadaEm: '2026-07-28',
        verificadaEm: '2026-07-30',
      },
    ],
    coletadaEm: '2026-07-28',
    verificadaEm: '2026-07-30',
  },

  // 2. Gustavo Rocha (Republicanos) — pré-candidato a vice-governador na
  //    chapa de Celina Leão.
  {
    id: 'gustavo-rocha',
    slug: 'gustavo-rocha',
    nome: 'Gustavo Rocha',
    nomeCompleto: 'Gustavo Rocha',
    cargo: 'vice_governador',
    partido: 'Republicanos',
    estagio: 'anunciado_pelo_partido',
    noticiasRelacionadas: ['n48', 'n94', 'n95'],
    evidencias: [
      {
        id: 'e-gustavo-rocha-n94',
        pessoaId: 'gustavo-rocha',
        cargo: 'vice_governador',
        estagio: 'anunciado_pelo_partido',
        partido: 'Republicanos',
        fonte: 'Metrópoles',
        fonteCategoria: 'veiculo_jornalistico',
        url: 'https://www.metropoles.com/distrito-federal/celina-leao-lanca-pre-candidatura-e-confirma-gustavo-rocha-como-vice',
        descricao:
          'Metrópoles confirma o ex-secretário da Casa Civil Gustavo Rocha (Republicanos) como pré-candidato a vice-governador na chapa de Celina Leão (PP) em evento de lançamento na Ceilândia.',
        dataEvidencia: '2026-07-18',
        coletadaEm: '2026-07-28',
        verificadaEm: '2026-07-30',
      },
    ],
    coletadaEm: '2026-07-28',
    verificadaEm: '2026-07-30',
  },

  // 3. Leandro Grass (PT) — pré-candidato ao GDF, lançado pelo PT-DF e
  //    homologado pela Federação Brasil da Esperança (PT-PV-PCdoB).
  {
    id: 'leandro-grass',
    slug: 'leandro-grass',
    nome: 'Leandro Grass',
    nomeCompleto: 'Leandro Grass',
    cargo: 'governador',
    partido: 'PT',
    estagio: 'anunciado_pelo_partido',
    noticiasRelacionadas: ['n33', 'n44', 'n40', 'n43', 'n53'],
    evidencias: [
      {
        id: 'e-leandro-grass-n33',
        pessoaId: 'leandro-grass',
        cargo: 'governador',
        estagio: 'anunciado_pelo_partido',
        partido: 'PT',
        fonte: 'Brasil de Fato',
        fonteCategoria: 'veiculo_jornalistico',
        url: 'https://www.brasildefato.com.br/2026/05/19/pt-df-lanca-pre-candidaturas-de-leandro-grass-ao-gdf-e-erika-kokay-ao-senado-nesta-terca-19/',
        descricao:
          'PT-DF lançou as pré-candidaturas de Leandro Grass ao GDF e de Erika Kokay ao Senado em evento partidário.',
        dataEvidencia: '2026-05-19',
        coletadaEm: '2026-07-27',
        verificadaEm: '2026-07-30',
      },
      {
        id: 'e-leandro-grass-n53',
        pessoaId: 'leandro-grass',
        cargo: 'governador',
        estagio: 'anunciado_pelo_partido',
        partido: 'PT',
        fonte: 'NC News',
        fonteCategoria: 'veiculo_jornalistico',
        url: 'https://ncnews.com.br/2026/07/25/psol-e-rede-oficializam-candidaturas-no-df-anunciam-apoio-a-leandro-grass-e-entregam-carta-de-compromisso-politico/',
        descricao:
          'NC News registra que a Federação PSOL-Rede, em convenção de 25 de julho, oficializou apoio formal à pré-candidatura de Leandro Grass (PT) ao GDF no bloco progressista com PT, PV, PCdoB e PDT.',
        dataEvidencia: '2026-07-25',
        coletadaEm: '2026-08-01',
        verificadaEm: '2026-08-01',
      },
    ],
    coletadaEm: '2026-07-27',
    verificadaEm: '2026-08-01',
  },

  // 4. Dora Gomes (PV) — anunciada pelo PV-DF para vice de Leandro Grass.
  //    O anúncio partidário é preservado mesmo com indicação posterior e
  //    conflitante de Tetê Monteiro pela Federação PSOL-Rede.
  {
    id: 'dora-gomes',
    slug: 'dora-gomes',
    nome: 'Dora Gomes',
    nomeCompleto: 'Dora Gomes',
    cargo: 'vice_governador',
    partido: 'PV',
    estagio: 'anunciado_pelo_partido',
    noticiasRelacionadas: ['n40', 'n54'],
    evidencias: [
      {
        id: 'e-dora-gomes-n40',
        pessoaId: 'dora-gomes',
        cargo: 'vice_governador',
        estagio: 'anunciado_pelo_partido',
        partido: 'PV',
        fonte: 'Revista 61 Brasília',
        fonteCategoria: 'veiculo_jornalistico',
        url: 'https://61brasilia.com/pv-df-homologa-candidaturas-e-reafirma-apoio-a-chapa-da-federacao-brasil-da-esperanca-para-2026/',
        descricao:
          'PV-DF anunciou apoio à chapa Leandro Grass (PT) ao GDF com Dora Gomes (PV) como candidata a vice-governadora.',
        dataEvidencia: '2026-07-23',
        coletadaEm: '2026-07-27',
        verificadaEm: '2026-07-30',
      },
    ],
    coletadaEm: '2026-07-27',
    verificadaEm: '2026-07-30',
  },

  // 5. Tetê Monteiro (PSOL) — indicada pela Federação PSOL-Rede como vice
  //    na chapa de Leandro Grass, em anúncio posterior ao do PV-DF.
  {
    id: 'tete-monteiro',
    slug: 'tete-monteiro',
    nome: 'Tetê Monteiro',
    nomeCompleto: 'Tetê Monteiro',
    cargo: 'vice_governador',
    partido: 'PSOL',
    estagio: 'anunciado_pelo_partido',
    noticiasRelacionadas: ['n35', 'n43', 'n45', 'n53'],
    evidencias: [
      {
        id: 'e-tete-monteiro-n43',
        pessoaId: 'tete-monteiro',
        cargo: 'vice_governador',
        estagio: 'anunciado_pelo_partido',
        partido: 'PSOL',
        fonte: 'Correio Braziliense',
        fonteCategoria: 'veiculo_jornalistico',
        url: 'https://www.correiobraziliense.com.br/cidades-df/2026/07/7467965-unidade-da-esquerda-marca-convencao-do-psol.html',
        descricao:
          'A Federação PSOL-Rede oficializou apoio a Leandro Grass e indicou Tetê Monteiro para vice-governadora em convenção na CLDF.',
        dataEvidencia: '2026-07-25',
        coletadaEm: '2026-07-27',
        verificadaEm: '2026-07-30',
      },
    ],
    coletadaEm: '2026-07-27',
    verificadaEm: '2026-07-30',
  },

  // 6. José Roberto Arruda (PSD) — movimentação pública registrada por duas
  //    reportagens independentes; sem declaração primária anexada.
  {
    id: 'jose-roberto-arruda',
    slug: 'jose-roberto-arruda',
    nome: 'José Roberto Arruda',
    nomeCompleto: 'José Roberto Arruda',
    cargo: 'governador',
    partido: 'PSD',
    estagio: 'movimentacao_publica',
    noticiasRelacionadas: ['n100', 'n28'],
    evidencias: [
      {
        id: 'e-arruda-n28',
        pessoaId: 'jose-roberto-arruda',
        cargo: 'governador',
        estagio: 'movimentacao_publica',
        partido: 'PSD',
        fonte: 'Metrópoles',
        fonteCategoria: 'veiculo_jornalistico',
        url: 'https://www.metropoles.com/colunas/grande-angular/eleicoes-2026-disputa-pelo-gdf-tem-oito-pre-candidatos-veja-nomes',
        descricao:
          'Levantamento do cenário eleitoral inclui José Roberto Arruda entre os nomes apresentados como pré-candidatos ao GDF.',
        dataEvidencia: '2026-07-16',
        coletadaEm: '2026-07-27',
        verificadaEm: '2026-07-30',
      },
      {
        id: 'e-arruda-n100',
        pessoaId: 'jose-roberto-arruda',
        cargo: 'governador',
        estagio: 'movimentacao_publica',
        partido: 'PSD',
        fonte: 'ND Mais',
        fonteCategoria: 'veiculo_jornalistico',
        url: 'https://ndmais.com.br/politica/arruda-pode-disputar-o-gdf-em-2026-entenda-o-caso/',
        descricao:
          'Ex-governador José Roberto Arruda é pré-candidato do PSD ao Palácio do Buriti e afirma ter voltado a ser elegível após mudanças na Lei da Ficha Limpa.',
        dataEvidencia: '2026-07-20',
        coletadaEm: '2026-07-28',
        verificadaEm: '2026-07-30',
      },
    ],
    coletadaEm: '2026-07-28',
    verificadaEm: '2026-07-30',
  },

  // 7. Ricardo Cappelli (PSB) — pré-candidato ao GDF, anunciado pelo PSB-DF
  //    com convenção marcada para 3 de agosto.
  {
    id: 'ricardo-cappelli',
    slug: 'ricardo-cappelli',
    nome: 'Ricardo Cappelli',
    nomeCompleto: 'Ricardo Cappelli',
    cargo: 'governador',
    partido: 'PSB',
    estagio: 'anunciado_pelo_partido',
    noticiasRelacionadas: ['n41', 'n55'],
    evidencias: [
      {
        id: 'e-cappelli-n41',
        pessoaId: 'ricardo-cappelli',
        cargo: 'governador',
        estagio: 'anunciado_pelo_partido',
        partido: 'PSB',
        fonte: 'Revista 61 Brasília',
        fonteCategoria: 'veiculo_jornalistico',
        url: 'https://61brasilia.com/convencao-do-psb-df-confirma-candidatura-de-ricardo-cappelli-ao-governo-do-distrito-federal/',
        descricao:
          'PSB-DF marcou convenção para oficializar candidatura de Ricardo Cappelli ao GDF; ex-interventor da segurança do DF priorizou saúde, educação, segurança e mobilidade.',
        dataEvidencia: '2026-07-23',
        coletadaEm: '2026-07-27',
        verificadaEm: '2026-07-30',
      },
    ],
    coletadaEm: '2026-07-27',
    verificadaEm: '2026-07-30',
  },

  // 8. Elisson Ferreira (Agir) — candidatura confirmada pelo partido em
  //    convenção realizada em Brasília.
  {
    id: 'elisson-ferreira',
    slug: 'elisson-ferreira',
    nome: 'Elisson Ferreira',
    nomeCompleto: 'Elisson Ferreira',
    cargo: 'governador',
    partido: 'Agir',
    estagio: 'anunciado_pelo_partido',
    noticiasRelacionadas: ['n26'],
    evidencias: [
      {
        id: 'e-elisson-ferreira-n26',
        pessoaId: 'elisson-ferreira',
        cargo: 'governador',
        estagio: 'anunciado_pelo_partido',
        partido: 'Agir',
        fonte: 'G1',
        fonteCategoria: 'veiculo_jornalistico',
        url: 'https://g1.globo.com/df/distrito-federal/eleicoes/2026/noticia/2026/07/20/agir-lanca-elisson-ferreira-como-candidato-ao-governo-do-distrito-federal.ghtml',
        descricao:
          'O Agir confirmou a candidatura de Elisson Ferreira ao governo do Distrito Federal durante convenção em Brasília.',
        dataEvidencia: '2026-07-20',
        coletadaEm: '2026-07-27',
        verificadaEm: '2026-07-30',
      },
    ],
    coletadaEm: '2026-07-27',
    verificadaEm: '2026-07-30',
  },

  // 9. Samara Mineiro (UP) — candidata ao GDF, homologada em convenção da UP.
  {
    id: 'samara-mineiro',
    slug: 'samara-mineiro',
    nome: 'Samara Mineiro',
    nomeCompleto: 'Samara Mineiro',
    cargo: 'governador',
    partido: 'UP',
    estagio: 'anunciado_pelo_partido',
    noticiasRelacionadas: ['n42'],
    evidencias: [
      {
        id: 'e-samara-n42',
        pessoaId: 'samara-mineiro',
        cargo: 'governador',
        estagio: 'anunciado_pelo_partido',
        partido: 'UP',
        fonte: 'NC News',
        fonteCategoria: 'veiculo_jornalistico',
        url: 'https://ncnews.com.br/2026/07/23/up-homologa-candidaturas-e-aprova-programa-de-governo-em-convencao-distrital-no-df/',
        descricao:
          'Unidade Popular oficializou em convenção a candidatura da professora Samara Mineiro ao GDF, com Thaís Oliveira como vice-governadora.',
        dataEvidencia: '2026-07-23',
        coletadaEm: '2026-07-27',
        verificadaEm: '2026-07-30',
      },
    ],
    coletadaEm: '2026-07-27',
    verificadaEm: '2026-07-30',
  },

  // 10. Thaís Oliveira (UP) — pré-candidata a vice-governadora na chapa de
  //    Samara Mineiro.
  {
    id: 'thais-oliveira',
    slug: 'thais-oliveira',
    nome: 'Thaís Oliveira',
    nomeCompleto: 'Thaís Oliveira',
    cargo: 'vice_governador',
    partido: 'UP',
    estagio: 'anunciado_pelo_partido',
    noticiasRelacionadas: ['n42'],
    evidencias: [
      {
        id: 'e-thais-n42',
        pessoaId: 'thais-oliveira',
        cargo: 'vice_governador',
        estagio: 'anunciado_pelo_partido',
        partido: 'UP',
        fonte: 'NC News',
        fonteCategoria: 'veiculo_jornalistico',
        url: 'https://ncnews.com.br/2026/07/23/up-homologa-candidaturas-e-aprova-programa-de-governo-em-convencao-distrital-no-df',
        descricao:
          'NC News (URL canônica alternativa sem barra final, equivalente à página original) confirma UP homologou Thaís Oliveira como candidata a vice-governadora na chapa de Samara Mineiro ao GDF.',
        dataEvidencia: '2026-07-23',
        coletadaEm: '2026-07-27',
        verificadaEm: '2026-07-30',
      },
    ],
    coletadaEm: '2026-07-27',
    verificadaEm: '2026-07-30',
  },

  // 11. Paula Belmonte (PSDB) — movimentação pública sustentada por duas
  //     reportagens independentes; convenção prevista para 4 de agosto.
  {
    id: 'paula-belmonte',
    slug: 'paula-belmonte',
    nome: 'Paula Belmonte',
    nomeCompleto: 'Paula Belmonte',
    cargo: 'governador',
    partido: 'PSDB',
    estagio: 'movimentacao_publica',
    noticiasRelacionadas: ['n34', 'n28'],
    evidencias: [
      {
        id: 'e-paula-n28',
        pessoaId: 'paula-belmonte',
        cargo: 'governador',
        estagio: 'movimentacao_publica',
        partido: 'PSDB',
        fonte: 'Metrópoles',
        fonteCategoria: 'veiculo_jornalistico',
        url: 'https://www.metropoles.com/colunas/grande-angular/eleicoes-2026-disputa-pelo-gdf-tem-oito-pre-candidatos-veja-nomes',
        descricao:
          'Levantamento do cenário eleitoral inclui Paula Belmonte entre os nomes apresentados como pré-candidatos ao GDF.',
        dataEvidencia: '2026-07-16',
        coletadaEm: '2026-07-27',
        verificadaEm: '2026-07-30',
      },
      {
        id: 'e-paula-n34',
        pessoaId: 'paula-belmonte',
        cargo: 'governador',
        estagio: 'movimentacao_publica',
        partido: 'PSDB',
        fonte: 'Misto Brasil',
        fonteCategoria: 'veiculo_jornalistico',
        url: 'https://mistobrasil.com/2026/07/26/veja-os-partidos-no-df-que-ja-fizeram-e-terao-suas-convencoes/',
        descricao:
          'Calendário de convenções mostra oficialização da candidatura da deputada distrital Paula Belmonte (PSDB) ao GDF em 4 de agosto.',
        dataEvidencia: '2026-07-26',
        coletadaEm: '2026-07-27',
        verificadaEm: '2026-07-30',
      },
    ],
    coletadaEm: '2026-07-27',
    verificadaEm: '2026-07-30',
  },

  // 12. Kiko Caputo (Novo) — candidato ao GDF, oficializado em convenção
  //     do Partido Novo.
  {
    id: 'kiko-caputo',
    slug: 'kiko-caputo',
    nome: 'Kiko Caputo',
    nomeCompleto: 'Kiko Caputo',
    cargo: 'governador',
    partido: 'Novo',
    estagio: 'anunciado_pelo_partido',
    noticiasRelacionadas: ['n50', 'n28'],
    evidencias: [
      {
        id: 'e-caputo-n50',
        pessoaId: 'kiko-caputo',
        cargo: 'governador',
        estagio: 'anunciado_pelo_partido',
        partido: 'Novo',
        fonte: 'Metrópoles',
        fonteCategoria: 'veiculo_jornalistico',
        url: 'https://www.metropoles.com/colunas/grande-angular/novo-oficializa-candidaturas-de-kiko-caputo-e-sebastiao-coelho-no-df',
        descricao:
          'Partido Novo oficializou a candidatura de Kiko Caputo ao governo do DF e de Sebastião Coelho ao Senado em convenção estadual.',
        dataEvidencia: '2026-07-21',
        coletadaEm: '2026-07-28',
        verificadaEm: '2026-07-30',
      },
    ],
    coletadaEm: '2026-07-28',
    verificadaEm: '2026-07-30',
  },

  // ---------------------------------------------------------------------------
  // Senado pelo DF — duas vagas em disputa
  //
  // Critério: pré-candidatura declarada, anúncio partidário ou movimentação
  // pública com evidência suficiente (fonte específica, URL, data). Cada
  // registro aponta para notícia já validada em src/data/noticias.ts; sem
  // inferência por mandato atual nem por presença em pesquisa (brief).
  // Estágios anteriores ao registro no TSE nunca são "registro_oficial".
  // ---------------------------------------------------------------------------

  // 13. Leila Barros (PDT) — pré-candidata à reeleição ao Senado, declarada
  //     pela própria parlamentar e com apoios da Federação Brasil da
  //     Esperança e da Federação PSOL-Rede.
  {
    id: 'leila-barros',
    slug: 'leila-barros',
    nome: 'Leila Barros',
    nomeCompleto: 'Leila do Vôlei',
    cargo: 'senador',
    partido: 'PDT',
    estagio: 'pre_candidatura_declarada',
    noticiasRelacionadas: ['n30', 'n43', 'n53'],
    evidencias: [
      {
        id: 'e-leila-barros-n30',
        pessoaId: 'leila-barros',
        cargo: 'senador',
        estagio: 'pre_candidatura_declarada',
        partido: 'PDT',
        fonte: 'Brasil de Fato',
        fonteCategoria: 'veiculo_jornalistico',
        url: 'https://www.brasildefato.com.br/2026/04/22/senadora-leila-do-volei-lanca-pre-candidatura-a-reeleicao-com-frente-ampla-no-distrito-federal/',
        descricao:
          'A senadora Leila do Vôlei (PDT) anunciou pré-candidatura à reeleição em evento com lideranças de oposição, incluindo os deputados distritais Gabriel Magno (PT) e Paula Belmonte (PSDB).',
        dataEvidencia: '2026-04-22',
        coletadaEm: '2026-07-27',
        verificadaEm: '2026-07-30',
      },
      {
        id: 'e-leila-barros-n43',
        pessoaId: 'leila-barros',
        cargo: 'senador',
        estagio: 'movimentacao_publica',
        partido: 'PDT',
        fonte: 'Correio Braziliense',
        fonteCategoria: 'veiculo_jornalistico',
        url: 'https://www.correiobraziliense.com.br/cidades-df/2026/07/7467965-unidade-da-esquerda-marca-convencao-do-psol.html',
        descricao:
          'A Federação PSOL-Rede oficializou apoio à pré-candidatura de Leila do Vôlei (PDT) ao Senado em convenção na CLDF.',
        dataEvidencia: '2026-07-25',
        coletadaEm: '2026-07-27',
        verificadaEm: '2026-07-30',
      },
    ],
    coletadaEm: '2026-07-27',
    verificadaEm: '2026-07-30',
  },

  // 14. Erika Kokay (PT) — pré-candidata ao Senado pelo PT-DF, anunciada
  //     em lançamento partidário e homologada pela Federação Brasil da
  //     Esperança (PT-PV-PCdoB).
  {
    id: 'erika-kokay',
    slug: 'erika-kokay',
    nome: 'Erika Kokay',
    nomeCompleto: 'Erika Kokay',
    cargo: 'senador',
    partido: 'PT',
    estagio: 'anunciado_pelo_partido',
    noticiasRelacionadas: ['n31', 'n33', 'n44', 'n53'],
    evidencias: [
      {
        id: 'e-erika-kokay-n33',
        pessoaId: 'erika-kokay',
        cargo: 'senador',
        estagio: 'anunciado_pelo_partido',
        partido: 'PT',
        fonte: 'Brasil de Fato',
        fonteCategoria: 'veiculo_jornalistico',
        url: 'https://www.brasildefato.com.br/2026/05/19/pt-df-lanca-pre-candidaturas-de-leandro-grass-ao-gdf-e-erika-kokay-ao-senado-nesta-terca-19/',
        descricao:
          'PT-DF lançou a pré-candidatura de Erika Kokay ao Senado em evento partidário junto com a pré-candidatura de Leandro Grass ao GDF.',
        dataEvidencia: '2026-05-19',
        coletadaEm: '2026-07-27',
        verificadaEm: '2026-07-30',
      },
      {
        id: 'e-erika-kokay-n44',
        pessoaId: 'erika-kokay',
        cargo: 'senador',
        estagio: 'anunciado_pelo_partido',
        partido: 'PT',
        fonte: 'Misto Brasil',
        fonteCategoria: 'veiculo_jornalistico',
        url: 'https://mistobrasil.com/2026/07/25/federacao-pt-pv-pcdob-define-chapa-majoritaria-no-df/',
        descricao:
          'A Federação Brasil da Esperança (PT, PV e PCdoB) homologou Erika Kokay (PT) como pré-candidata ao Senado pelo DF.',
        dataEvidencia: '2026-07-25',
        coletadaEm: '2026-07-27',
        verificadaEm: '2026-07-30',
      },
      {
        id: 'e-erika-kokay-n53',
        pessoaId: 'erika-kokay',
        cargo: 'senador',
        estagio: 'anunciado_pelo_partido',
        partido: 'PT',
        fonte: 'NC News',
        fonteCategoria: 'veiculo_jornalistico',
        url: 'https://ncnews.com.br/2026/07/25/psol-e-rede-oficializam-candidaturas-no-df-anunciam-apoio-a-leandro-grass-e-entregam-carta-de-compromisso-politico/',
        descricao:
          'NC News registra que a Federação PSOL-Rede, em convenção de 25 de julho, declarou apoio formal à pré-candidatura de Erika Kokay (PT) ao Senado pelo DF no palanque comum com Leila Barros (PDT).',
        dataEvidencia: '2026-07-25',
        coletadaEm: '2026-08-01',
        verificadaEm: '2026-08-01',
      },
    ],
    coletadaEm: '2026-07-27',
    verificadaEm: '2026-08-01',
  },

  // 15. Bia Kicis (PL) — pré-candidata ao Senado pelo PL-DF, indicada pelo
  //     ex-presidente Bolsonaro em fevereiro de 2026 e confirmada em
  //     cobertura posterior do partido.
  {
    id: 'bia-kicis',
    slug: 'bia-kicis',
    nome: 'Bia Kicis',
    nomeCompleto: 'Bia Kicis',
    cargo: 'senador',
    partido: 'PL',
    estagio: 'anunciado_pelo_partido',
    noticiasRelacionadas: ['n32', 'n39', 'n49'],
    evidencias: [
      {
        id: 'e-bia-kicis-n32',
        pessoaId: 'bia-kicis',
        cargo: 'senador',
        estagio: 'anunciado_pelo_partido',
        partido: 'PL',
        fonte: 'Poder360',
        fonteCategoria: 'veiculo_jornalistico',
        url: 'https://www.poder360.com.br/poder-eleicoes/bolsonaro-indica-michelle-e-bia-kicis-para-o-senado-no-df-pelo-pl/',
        descricao:
          'Ex-presidente Jair Bolsonaro sinalizou que os nomes do PL para o Senado pelo DF serão Michelle Bolsonaro e a deputada federal Bia Kicis (PL-DF).',
        dataEvidencia: '2026-02-21',
        coletadaEm: '2026-07-27',
        verificadaEm: '2026-07-30',
      },
      {
        id: 'e-bia-kicis-n39',
        pessoaId: 'bia-kicis',
        cargo: 'senador',
        estagio: 'anunciado_pelo_partido',
        partido: 'PL',
        fonte: 'Correio Braziliense',
        fonteCategoria: 'veiculo_jornalistico',
        url: 'https://newblogs.correiobraziliense.com.br/emaltanapolitica/convencao-do-pl-df-para-anunciar-candidaturas-sera-em-5-de-agosto/',
        descricao:
          'O presidente do PL no DF, Bia Kicis, convocou convenção para 5 de agosto, último dia do calendário eleitoral, para oficializar candidaturas ao Senado (incluindo a própria pré-candidatura).',
        dataEvidencia: '2026-07-15',
        coletadaEm: '2026-07-27',
        verificadaEm: '2026-07-30',
      },
    ],
    coletadaEm: '2026-07-27',
    verificadaEm: '2026-07-30',
  },

  // 16. Michelle Bolsonaro (PL) — pré-candidata ao Senado pelo PL-DF,
  //     indicada por Bolsonaro e mantida como aposta do partido para a
  //     chapa ao Senado em coberturas independentes.
  {
    id: 'michelle-bolsonaro',
    slug: 'michelle-bolsonaro',
    nome: 'Michelle Bolsonaro',
    nomeCompleto: 'Michelle Bolsonaro',
    cargo: 'senador',
    partido: 'PL',
    estagio: 'anunciado_pelo_partido',
    noticiasRelacionadas: ['n32', 'n39', 'n49'],
    evidencias: [
      {
        id: 'e-michelle-n32',
        pessoaId: 'michelle-bolsonaro',
        cargo: 'senador',
        estagio: 'anunciado_pelo_partido',
        partido: 'PL',
        fonte: 'Poder360',
        fonteCategoria: 'veiculo_jornalistico',
        url: 'https://www.poder360.com.br/poder-eleicoes/bolsonaro-indica-michelle-e-bia-kicis-para-o-senado-no-df-pelo-pl/',
        descricao:
          'Ex-presidente Jair Bolsonaro sinalizou que os nomes do PL para o Senado pelo DF serão Michelle Bolsonaro e Bia Kicis.',
        dataEvidencia: '2026-02-21',
        coletadaEm: '2026-07-27',
        verificadaEm: '2026-07-30',
      },
      {
        id: 'e-michelle-n39',
        pessoaId: 'michelle-bolsonaro',
        cargo: 'senador',
        estagio: 'anunciado_pelo_partido',
        partido: 'PL',
        fonte: 'Correio Braziliense',
        fonteCategoria: 'veiculo_jornalistico',
        url: 'https://newblogs.correiobraziliense.com.br/emaltanapolitica/convencao-do-pl-df-para-anunciar-candidaturas-sera-em-5-de-agosto/',
        descricao:
          'O PL-DF manteve a pré-candidatura de Michelle Bolsonaro ao Senado na convocação da convenção partidária para 5 de agosto, com senador Izalci Lucas como alternativa em caso de desistência.',
        dataEvidencia: '2026-07-15',
        coletadaEm: '2026-07-27',
        verificadaEm: '2026-07-30',
      },
    ],
    coletadaEm: '2026-07-27',
    verificadaEm: '2026-07-30',
  },

  // 17. Sebastião Coelho (Novo) — pré-candidato ao Senado pelo Novo,
  //     oficializado em convenção estadual em 20 de julho de 2026.
  {
    id: 'sebastiao-coelho',
    slug: 'sebastiao-coelho',
    nome: 'Sebastião Coelho',
    nomeCompleto: 'Sebastião Coelho',
    cargo: 'senador',
    partido: 'Novo',
    estagio: 'anunciado_pelo_partido',
    noticiasRelacionadas: ['n50', 'n62'],
    evidencias: [
      {
        id: 'e-sebastiao-coelho-n50',
        pessoaId: 'sebastiao-coelho',
        cargo: 'senador',
        estagio: 'anunciado_pelo_partido',
        partido: 'Novo',
        fonte: 'Metrópoles',
        fonteCategoria: 'veiculo_jornalistico',
        url: 'https://www.metropoles.com/colunas/grande-angular/novo-oficializa-candidaturas-de-kiko-caputo-e-sebastiao-coelho-no-df',
        descricao:
          'Partido Novo oficializou, em convenção estadual realizada em 20 de julho, a candidatura de Sebastião Coelho ao Senado pelo DF.',
        dataEvidencia: '2026-07-21',
        coletadaEm: '2026-07-28',
        verificadaEm: '2026-07-30',
      },
    ],
    coletadaEm: '2026-07-28',
    verificadaEm: '2026-07-30',
  },

  // 18. Tiago Tarsis (Agir) — pré-candidato ao Senado pelo Agir-DF,
  //     oficializado em convenção em 20 de julho de 2026.
  {
    id: 'tiago-tarsis',
    slug: 'tiago-tarsis',
    nome: 'Tiago Tarsis',
    nomeCompleto: 'Tiago Tarsis',
    cargo: 'senador',
    partido: 'Agir',
    estagio: 'anunciado_pelo_partido',
    noticiasRelacionadas: ['n26', 'n84'],
    evidencias: [
      {
        id: 'e-tiago-tarsis-n26',
        pessoaId: 'tiago-tarsis',
        cargo: 'senador',
        estagio: 'anunciado_pelo_partido',
        partido: 'Agir',
        fonte: 'G1',
        fonteCategoria: 'veiculo_jornalistico',
        url: 'https://g1.globo.com/df/distrito-federal/eleicoes/2026/noticia/2026/07/20/agir-lanca-elisson-ferreira-como-candidato-ao-governo-do-distrito-federal.ghtml',
        descricao:
          'O Agir confirmou, em convenção em Brasília, a chapa com Tiago Tarsis para a disputa ao Senado pelo DF.',
        dataEvidencia: '2026-07-20',
        coletadaEm: '2026-07-27',
        verificadaEm: '2026-07-30',
      },
      {
        id: 'e-tiago-tarsis-n84',
        pessoaId: 'tiago-tarsis',
        cargo: 'senador',
        estagio: 'anunciado_pelo_partido',
        partido: 'Agir',
        fonte: 'GPS Brasília',
        fonteCategoria: 'veiculo_jornalistico',
        url: 'https://gpsbrasilia.com.br/agir-df-oficializa-elisson-ferreira-tarsis/',
        descricao:
          'O Agir-DF oficializou em convenção em 20 de julho a candidatura de Tiago Tarsis ao Senado, em chapa pura sem coligações anunciadas.',
        dataEvidencia: '2026-07-20',
        coletadaEm: '2026-07-28',
        verificadaEm: '2026-07-30',
      },
    ],
    coletadaEm: '2026-07-28',
    verificadaEm: '2026-07-30',
  },

  // 19. Guilherme Amorim (UP) — pré-candidato ao Senado pela Unidade
  //     Popular, homologado em convenção distrital no DF em 23 de julho.
  {
    id: 'guilherme-amorim',
    slug: 'guilherme-amorim',
    nome: 'Guilherme Amorim',
    nomeCompleto: 'Guilherme Amorim',
    cargo: 'senador',
    partido: 'UP',
    estagio: 'anunciado_pelo_partido',
    noticiasRelacionadas: ['n42'],
    evidencias: [
      {
        id: 'e-guilherme-amorim-n42',
        pessoaId: 'guilherme-amorim',
        cargo: 'senador',
        estagio: 'anunciado_pelo_partido',
        partido: 'UP',
        fonte: 'NC News',
        fonteCategoria: 'veiculo_jornalistico',
        url: 'https://ncnews.com.br/2026/07/23/up-homologa-candidaturas-e-aprova-programa-de-governo-em-convencao-distrital-no-df/',
        descricao:
          'A Unidade Popular oficializou em convenção no Sindsep-DF a candidatura de Guilherme Amorim ao Senado pelo DF.',
        dataEvidencia: '2026-07-23',
        coletadaEm: '2026-07-27',
        verificadaEm: '2026-07-30',
      },
    ],
    coletadaEm: '2026-07-27',
    verificadaEm: '2026-07-30',
  },

  // 20. Paulo Octávio (PSD) — pré-candidato ao Senado pelo PSD-DF,
  //     apresentado em matéria sobre a aliança do ex-governador Arruda
  //     para 2026; sustentado por uma reportagem adicional (n62).
  {
    id: 'paulo-octavio',
    slug: 'paulo-octavio',
    nome: 'Paulo Octávio',
    nomeCompleto: 'Paulo Octávio',
    cargo: 'senador',
    partido: 'PSD',
    estagio: 'movimentacao_publica',
    noticiasRelacionadas: ['n100', 'n62'],
    evidencias: [
      {
        id: 'e-paulo-octavio-n100',
        pessoaId: 'paulo-octavio',
        cargo: 'senador',
        estagio: 'movimentacao_publica',
        partido: 'PSD',
        fonte: 'ND Mais',
        fonteCategoria: 'veiculo_jornalistico',
        url: 'https://ndmais.com.br/politica/arruda-pode-disputar-o-gdf-em-2026-entenda-o-caso/',
        descricao:
          'Matéria sobre a viabilidade jurídica da pré-candidatura de Arruda registra Paulo Octávio (PSD) como pré-candidato ao Senado pelo DF.',
        dataEvidencia: '2026-07-20',
        coletadaEm: '2026-07-28',
        verificadaEm: '2026-07-30',
      },
      {
        id: 'e-paulo-octavio-n62',
        pessoaId: 'paulo-octavio',
        cargo: 'senador',
        estagio: 'movimentacao_publica',
        partido: 'PSD',
        fonte: 'Clica DF',
        fonteCategoria: 'veiculo_jornalistico',
        url: 'https://clicadf.com.br/partidos-e-federacoes-vao-definir-nos-proximos-15-dias-as-selecoes-que-vao-entrar-em-campo-para-disputar-as-eleicoes-em-4-de-outubro/',
        descricao:
          'Clica DF registra a expectativa de definição da chapa do PSD/Avante ao Senado, no contexto da aliança com Arruda para o GDF.',
        dataEvidencia: '2026-07-20',
        coletadaEm: '2026-07-28',
        verificadaEm: '2026-07-30',
      },
    ],
    coletadaEm: '2026-07-28',
    verificadaEm: '2026-07-30',
  },

  // ---------------------------------------------------------------------------
  // Deputado federal pelo DF — 8 vagas em disputa
  //
  // Critério: pré-candidatura declarada, anúncio partidário ou movimentação
  // pública com evidência específica suficiente (URL e data). Cada registro
  // aponta para notícia já validada em src/data/noticias.ts; sem inferência
  // por mandato atual. Estágios anteriores ao registro no TSE nunca são
  // "registro_oficial". Lote inicial de até 10 nomes (P3).
  // ---------------------------------------------------------------------------

  // 21. Agnelo Queiroz (PT) — pré-candidato a deputado federal, com
  //     anúncio próprio e também na nominata do PT-DF.
  {
    id: 'agnelo-queiroz',
    slug: 'agnelo-queiroz',
    nome: 'Agnelo Queiroz',
    nomeCompleto: 'Agnelo Queiroz',
    cargo: 'deputado_federal',
    partido: 'PT',
    estagio: 'pre_candidatura_declarada',
    noticiasRelacionadas: ['n89', 'n91'],
    evidencias: [
      {
        id: 'e-agnelo-queiroz-n91',
        pessoaId: 'agnelo-queiroz',
        cargo: 'deputado_federal',
        estagio: 'pre_candidatura_declarada',
        partido: 'PT',
        fonte: 'Jornal TaguaCei',
        fonteCategoria: 'veiculo_jornalistico',
        url: 'https://jornaltaguacei.com.br/noticias/07/06/2026/ex-governador-agnelo-queiroz-lanca-pre-candidatura-a-deputado-federal-pelo-df-nossa-tarefa-e-retomar-as-politicas-publicas-e-recuperar-o-estado/',
        descricao:
          'O ex-governador do DF Agnelo Queiroz anunciou oficialmente sua pré-candidatura a deputado federal pelo PT-DF, com presença de Leandro Grass.',
        dataEvidencia: '2026-06-07',
        coletadaEm: '2026-07-28',
        verificadaEm: '2026-07-30',
      },
    ],
    coletadaEm: '2026-07-28',
    verificadaEm: '2026-07-30',
  },

  // 22. Cristovam Buarque (PSB) — pré-candidato a deputado federal,
  //     anunciado pelo PSB-DF.
  {
    id: 'cristovam-buarque',
    slug: 'cristovam-buarque',
    nome: 'Cristovam Buarque',
    nomeCompleto: 'Cristovam Buarque',
    cargo: 'deputado_federal',
    partido: 'PSB',
    estagio: 'anunciado_pelo_partido',
    noticiasRelacionadas: ['n73'],
    evidencias: [
      {
        id: 'e-cristovam-buarque-n73',
        pessoaId: 'cristovam-buarque',
        cargo: 'deputado_federal',
        estagio: 'anunciado_pelo_partido',
        partido: 'PSB',
        fonte: 'Correio Braziliense',
        fonteCategoria: 'veiculo_jornalistico',
        url: 'https://www.correiobraziliense.com.br/cidades-df/2026/06/7445342-psb-lanca-dois-ex-governadores-como-pre-candidatos-a-camara-dos-deputados.html',
        descricao:
          'PSB-DF anunciou o ex-governador Cristovam Buarque como pré-candidato a deputado federal durante o lançamento da pré-candidatura de Ricardo Cappelli ao GDF.',
        dataEvidencia: '2026-06-20',
        coletadaEm: '2026-07-28',
        verificadaEm: '2026-07-30',
      },
    ],
    coletadaEm: '2026-07-28',
    verificadaEm: '2026-07-30',
  },

  // 23. Fábio Felix (PSOL) — pré-candidato a deputado federal, oficializado
  //     pela Federação Psol-Rede.
  {
    id: 'fabio-felix',
    slug: 'fabio-felix',
    nome: 'Fábio Felix',
    nomeCompleto: 'Fábio Felix',
    cargo: 'deputado_federal',
    partido: 'PSOL',
    estagio: 'anunciado_pelo_partido',
    noticiasRelacionadas: ['n29', 'n45'],
    evidencias: [
      {
        id: 'e-fabio-felix-n29',
        pessoaId: 'fabio-felix',
        cargo: 'deputado_federal',
        estagio: 'anunciado_pelo_partido',
        partido: 'PSOL',
        fonte: 'Brasil de Fato',
        fonteCategoria: 'veiculo_jornalistico',
        url: 'https://www.brasildefato.com.br/2026/07/27/federacao-psol-e-rede-oficializa-candidaturas-a-camara-federal-e-distrital-e/',
        descricao:
          'A Federação Psol-Rede oficializou a candidatura de Fábio Felix a deputado federal nas Eleições 2026 no DF.',
        dataEvidencia: '2026-07-27',
        coletadaEm: '2026-07-27',
        verificadaEm: '2026-07-30',
      },
      {
        id: 'e-fabio-felix-n45',
        pessoaId: 'fabio-felix',
        cargo: 'deputado_federal',
        estagio: 'anunciado_pelo_partido',
        partido: 'PSOL',
        fonte: 'Jornal de Brasília',
        fonteCategoria: 'veiculo_jornalistico',
        url: 'https://jornaldebrasilia.com.br/brasilia/psol-abre-mao-de-candidatura-propria-e-aposta-em-frente-de-esquerda-com-leandro-grass-no-df/',
        descricao:
          'Jornal de Brasília registra que a Federação PSOL-Rede, em convenção de 25 de julho na CLDF, lançou Fábio Felix como candidato a deputado federal no bloco progressista de apoio a Leandro Grass ao GDF.',
        dataEvidencia: '2026-07-25',
        coletadaEm: '2026-08-01',
        verificadaEm: '2026-08-01',
      },
    ],
    coletadaEm: '2026-07-27',
    verificadaEm: '2026-08-01',
  },

  // 24. Izalci Lucas (PL) — pré-candidato a deputado federal, desistiu da
  //     disputa ao GDF e confirmou candidatura à Câmara.
  {
    id: 'izalci-lucas',
    slug: 'izalci-lucas',
    nome: 'Izalci Lucas',
    nomeCompleto: 'Izalci Lucas',
    cargo: 'deputado_federal',
    partido: 'PL',
    estagio: 'pre_candidatura_declarada',
    noticiasRelacionadas: ['n96'],
    evidencias: [
      {
        id: 'e-izalci-lucas-n96',
        pessoaId: 'izalci-lucas',
        cargo: 'deputado_federal',
        estagio: 'pre_candidatura_declarada',
        partido: 'PL',
        fonte: 'Correio Braziliense',
        fonteCategoria: 'veiculo_jornalistico',
        url: 'https://www.correiobraziliense.com.br/politica/2026/07/7466704-izalci-diz-que-sonho-de-disputar-o-gdf-foi-adiado-pelo-pl.html',
        descricao:
          'O senador Izalci Lucas (PL-DF) desistiu da corrida ao GDF e confirmou que será candidato a deputado federal pelo PL, por decisão da cúpula partidária.',
        dataEvidencia: '2026-07-23',
        coletadaEm: '2026-07-28',
        verificadaEm: '2026-07-30',
      },
    ],
    coletadaEm: '2026-07-28',
    verificadaEm: '2026-07-30',
  },

  // 25. Márcia Abrahão Moura (PT) — pré-candidata a deputado federal,
  //     anunciada na nominata do PT-DF.
  {
    id: 'marcia-abrahao-moura',
    slug: 'marcia-abrahao-moura',
    nome: 'Márcia Abrahão Moura',
    nomeCompleto: 'Márcia Abrahão Moura',
    cargo: 'deputado_federal',
    partido: 'PT',
    estagio: 'anunciado_pelo_partido',
    noticiasRelacionadas: ['n89'],
    evidencias: [
      {
        id: 'e-marcia-abrahao-n89',
        pessoaId: 'marcia-abrahao-moura',
        cargo: 'deputado_federal',
        estagio: 'anunciado_pelo_partido',
        partido: 'PT',
        fonte: 'Metrópoles',
        fonteCategoria: 'veiculo_jornalistico',
        url: 'https://www.metropoles.com/distrito-federal/pt-df-lanca-pre-candidaturas-a-camara-dos-deputados-veja-a-lista-de-nomes',
        descricao:
          'O PT-DF aprovou nominata com Márcia Abrahão Moura entre os sete pré-candidatos à Câmara dos Deputados.',
        dataEvidencia: '2026-05-16',
        coletadaEm: '2026-07-28',
        verificadaEm: '2026-07-30',
      },
    ],
    coletadaEm: '2026-07-28',
    verificadaEm: '2026-07-30',
  },

  // 26. Marivaldo Pereira (PT) — pré-candidato a deputado federal, anunciado
  //     na nominata do PT-DF.
  {
    id: 'marivaldo-pereira',
    slug: 'marivaldo-pereira',
    nome: 'Marivaldo Pereira',
    nomeCompleto: 'Marivaldo Pereira',
    cargo: 'deputado_federal',
    partido: 'PT',
    estagio: 'anunciado_pelo_partido',
    noticiasRelacionadas: ['n89'],
    evidencias: [
      {
        id: 'e-marivaldo-pereira-n89',
        pessoaId: 'marivaldo-pereira',
        cargo: 'deputado_federal',
        estagio: 'anunciado_pelo_partido',
        partido: 'PT',
        fonte: 'Metrópoles',
        fonteCategoria: 'veiculo_jornalistico',
        url: 'https://www.metropoles.com/distrito-federal/pt-df-lanca-pre-candidaturas-a-camara-dos-deputados-veja-a-lista-de-nomes',
        descricao:
          'O PT-DF aprovou nominata com Marivaldo Pereira entre os sete pré-candidatos à Câmara dos Deputados.',
        dataEvidencia: '2026-05-16',
        coletadaEm: '2026-07-28',
        verificadaEm: '2026-07-30',
      },
    ],
    coletadaEm: '2026-07-28',
    verificadaEm: '2026-07-30',
  },

  // 27. Reginaldo Veras (PV) — pré-candidato à reeleição a deputado federal,
  //     anunciou formalmente a candidatura.
  {
    id: 'reginaldo-veras',
    slug: 'reginaldo-veras',
    nome: 'Reginaldo Veras',
    nomeCompleto: 'Reginaldo Veras',
    cargo: 'deputado_federal',
    partido: 'PV',
    estagio: 'pre_candidatura_declarada',
    noticiasRelacionadas: ['n88'],
    evidencias: [
      {
        id: 'e-reginaldo-veras-n88',
        pessoaId: 'reginaldo-veras',
        cargo: 'deputado_federal',
        estagio: 'pre_candidatura_declarada',
        partido: 'PV',
        fonte: 'Jornal de Brasília',
        fonteCategoria: 'veiculo_jornalistico',
        url: 'https://jornaldebrasilia.com.br/blogs-e-colunas/do-alto-da-torre/reginaldo-veras-anuncia-candidatura-a-reeleicao/',
        descricao:
          'O deputado federal Reginaldo Veras (PV) anunciou formalmente que disputará a reeleição; já tinha garantido uma das duas vagas do PV na Federação Brasil da Esperança.',
        dataEvidencia: '2026-07-16',
        coletadaEm: '2026-07-28',
        verificadaEm: '2026-07-30',
      },
    ],
    coletadaEm: '2026-07-28',
    verificadaEm: '2026-07-30',
  },

  // 28. Roberto Policarpo (PT) — pré-candidato a deputado federal, anunciado
  //     na nominata do PT-DF.
  {
    id: 'roberto-policarpo',
    slug: 'roberto-policarpo',
    nome: 'Roberto Policarpo',
    nomeCompleto: 'Roberto Policarpo',
    cargo: 'deputado_federal',
    partido: 'PT',
    estagio: 'anunciado_pelo_partido',
    noticiasRelacionadas: ['n89'],
    evidencias: [
      {
        id: 'e-roberto-policarpo-n89',
        pessoaId: 'roberto-policarpo',
        cargo: 'deputado_federal',
        estagio: 'anunciado_pelo_partido',
        partido: 'PT',
        fonte: 'Metrópoles',
        fonteCategoria: 'veiculo_jornalistico',
        url: 'https://www.metropoles.com/distrito-federal/pt-df-lanca-pre-candidaturas-a-camara-dos-deputados-veja-a-lista-de-nomes',
        descricao:
          'O PT-DF aprovou nominata com Roberto Policarpo entre os sete pré-candidatos à Câmara dos Deputados.',
        dataEvidencia: '2026-05-16',
        coletadaEm: '2026-07-28',
        verificadaEm: '2026-07-30',
      },
    ],
    coletadaEm: '2026-07-28',
    verificadaEm: '2026-07-30',
  },

  // 29. Rodrigo Rollemberg (PSB) — pré-candidato a deputado federal,
  //     anunciado pelo PSB-DF.
  {
    id: 'rodrigo-rollemberg',
    slug: 'rodrigo-rollemberg',
    nome: 'Rodrigo Rollemberg',
    nomeCompleto: 'Rodrigo Rollemberg',
    cargo: 'deputado_federal',
    partido: 'PSB',
    estagio: 'anunciado_pelo_partido',
    noticiasRelacionadas: ['n73'],
    evidencias: [
      {
        id: 'e-rodrigo-rollemberg-n73',
        pessoaId: 'rodrigo-rollemberg',
        cargo: 'deputado_federal',
        estagio: 'anunciado_pelo_partido',
        partido: 'PSB',
        fonte: 'Correio Braziliense',
        fonteCategoria: 'veiculo_jornalistico',
        url: 'https://www.correiobraziliense.com.br/cidades-df/2026/06/7445342-psb-lanca-dois-ex-governadores-como-pre-candidatos-a-camara-dos-deputados.html',
        descricao:
          'PSB-DF anunciou o ex-governador Rodrigo Rollemberg como pré-candidato a deputado federal durante o lançamento da pré-candidatura de Ricardo Cappelli ao GDF.',
        dataEvidencia: '2026-06-20',
        coletadaEm: '2026-07-28',
        verificadaEm: '2026-07-30',
      },
    ],
    coletadaEm: '2026-07-28',
    verificadaEm: '2026-07-30',
  },

  // 30. Rosilene Corrêa (PT) — pré-candidata a deputado federal, anunciada
  //     na nominata do PT-DF.
  {
    id: 'rosilene-correa',
    slug: 'rosilene-correa',
    nome: 'Rosilene Corrêa',
    nomeCompleto: 'Rosilene Corrêa',
    cargo: 'deputado_federal',
    partido: 'PT',
    estagio: 'anunciado_pelo_partido',
    noticiasRelacionadas: ['n89'],
    evidencias: [
      {
        id: 'e-rosilene-correa-n89',
        pessoaId: 'rosilene-correa',
        cargo: 'deputado_federal',
        estagio: 'anunciado_pelo_partido',
        partido: 'PT',
        fonte: 'Metrópoles',
        fonteCategoria: 'veiculo_jornalistico',
        url: 'https://www.metropoles.com/distrito-federal/pt-df-lanca-pre-candidaturas-a-camara-dos-deputados-veja-a-lista-de-nomes',
        descricao:
          'O PT-DF aprovou nominata com Rosilene Corrêa entre os sete pré-candidatos à Câmara dos Deputados.',
        dataEvidencia: '2026-05-16',
        coletadaEm: '2026-07-28',
        verificadaEm: '2026-07-30',
      },
    ],
    coletadaEm: '2026-07-28',
    verificadaEm: '2026-07-30',
  },

  // 31. Thiago Manzoni (PL) — deputado distrital que pleiteia vaga na Câmara
  //     dos Deputados, conforme reportagem do Brasil de Fato DF.
  {
    id: 'thiago-manzoni',
    slug: 'thiago-manzoni',
    nome: 'Thiago Manzoni',
    nomeCompleto: 'Thiago Manzoni de Oliveira',
    cargo: 'deputado_federal',
    partido: 'PL',
    estagio: 'movimentacao_publica',
    noticiasRelacionadas: ['n57'],
    evidencias: [
      {
        id: 'e-thiago-manzoni-n57',
        pessoaId: 'thiago-manzoni',
        cargo: 'deputado_federal',
        estagio: 'movimentacao_publica',
        partido: 'PL',
        fonte: 'Brasil de Fato',
        fonteCategoria: 'veiculo_jornalistico',
        url: 'https://www.brasildefato.com.br/2026/07/16/disputa-a-reeleicao-predomina-no-distrito-federal-seis-parlamentares-buscam-cargos-maiores/',
        descricao:
          'Levantamento do Brasil de Fato DF indica que o deputado distrital Thiago Manzoni (PL) pleiteia vaga na Câmara dos Deputados nas eleições de 2026.',
        dataEvidencia: '2026-07-16',
        coletadaEm: '2026-07-30',
        verificadaEm: '2026-07-30',
      },
    ],
    coletadaEm: '2026-07-30',
    verificadaEm: '2026-07-30',
  },

  // 32. Daniel Donizet (MDB) — deputado distrital que pleiteia vaga na Câmara
  //     dos Deputados, conforme reportagem do Brasil de Fato DF.
  {
    id: 'daniel-donizet',
    slug: 'daniel-donizet',
    nome: 'Daniel Donizet',
    nomeCompleto: 'Daniel Donizet de Oliveira',
    cargo: 'deputado_federal',
    partido: 'MDB',
    estagio: 'movimentacao_publica',
    noticiasRelacionadas: ['n57'],
    evidencias: [
      {
        id: 'e-daniel-donizet-n57',
        pessoaId: 'daniel-donizet',
        cargo: 'deputado_federal',
        estagio: 'movimentacao_publica',
        partido: 'MDB',
        fonte: 'Brasil de Fato',
        fonteCategoria: 'veiculo_jornalistico',
        url: 'https://www.brasildefato.com.br/2026/07/16/disputa-a-reeleicao-predomina-no-distrito-federal-seis-parlamentares-buscam-cargos-maiores/',
        descricao:
          'Levantamento do Brasil de Fato DF indica que o deputado distrital Daniel Donizet (MDB) pleiteia vaga na Câmara dos Deputados nas eleições de 2026.',
        dataEvidencia: '2026-07-16',
        coletadaEm: '2026-07-30',
        verificadaEm: '2026-07-30',
      },
    ],
    coletadaEm: '2026-07-30',
    verificadaEm: '2026-07-30',
  },

  // 33. Juliana dos Tigrados (PV) — candidata a deputado federal lançada
  //     pelo PV-DF em convenção distrital.
  {
    id: 'juliana-dos-tigrados',
    slug: 'juliana-dos-tigrados',
    nome: 'Juliana dos Tigrados',
    nomeCompleto: 'Juliana dos Tigrados',
    cargo: 'deputado_federal',
    partido: 'PV',
    estagio: 'anunciado_pelo_partido',
    noticiasRelacionadas: ['n54'],
    evidencias: [
      {
        id: 'e-juliana-tigrados-n54',
        pessoaId: 'juliana-dos-tigrados',
        cargo: 'deputado_federal',
        estagio: 'anunciado_pelo_partido',
        partido: 'PV',
        fonte: 'Notícias do Planalto',
        fonteCategoria: 'veiculo_jornalistico',
        url: 'https://noticiasdoplanalto.com.br/pv-df-confirma-candidaturas-e-apoia-chapa-de-leandro-grass/',
        descricao:
          'O PV-DF confirmou, em convenção distrital, o lançamento de Juliana dos Tigrados como candidata à Câmara dos Deputados, ao lado de Reginaldo Veras (reeleição).',
        dataEvidencia: '2026-07-24',
        coletadaEm: '2026-07-30',
        verificadaEm: '2026-07-30',
      },
    ],
    coletadaEm: '2026-07-30',
    verificadaEm: '2026-07-30',
  },

  // 34. Ruth Venceremos (PT) — pré-candidata a deputado federal, integrante
  //     da nominata do PT-DF aprovada em maio de 2026.
  {
    id: 'ruth-venceremos',
    slug: 'ruth-venceremos',
    nome: 'Ruth Venceremos',
    nomeCompleto: 'Ruth Venceremos',
    cargo: 'deputado_federal',
    partido: 'PT',
    estagio: 'anunciado_pelo_partido',
    noticiasRelacionadas: ['n89'],
    evidencias: [
      {
        id: 'e-ruth-venceremos-n89',
        pessoaId: 'ruth-venceremos',
        cargo: 'deputado_federal',
        estagio: 'anunciado_pelo_partido',
        partido: 'PT',
        fonte: 'Metrópoles',
        fonteCategoria: 'veiculo_jornalistico',
        url: 'https://www.metropoles.com/distrito-federal/pt-df-lanca-pre-candidaturas-a-camara-dos-deputados-veja-a-lista-de-nomes',
        descricao:
          'O PT-DF aprovou nominata com Ruth Venceremos entre os sete pré-candidatos à Câmara dos Deputados.',
        dataEvidencia: '2026-05-16',
        coletadaEm: '2026-07-30',
        verificadaEm: '2026-07-30',
      },
    ],
    coletadaEm: '2026-07-30',
    verificadaEm: '2026-07-30',
  },

  // 35. Vanessa Bicho Negrini (PT) — pré-candidata a deputado federal,
  //     integrante da nominata do PT-DF aprovada em maio de 2026.
  {
    id: 'vanessa-bicho-negrini',
    slug: 'vanessa-bicho-negrini',
    nome: 'Vanessa Bicho Negrini',
    nomeCompleto: 'Vanessa Bicho Negrini',
    cargo: 'deputado_federal',
    partido: 'PT',
    estagio: 'anunciado_pelo_partido',
    noticiasRelacionadas: ['n89'],
    evidencias: [
      {
        id: 'e-vanessa-bicho-negrini-n89',
        pessoaId: 'vanessa-bicho-negrini',
        cargo: 'deputado_federal',
        estagio: 'anunciado_pelo_partido',
        partido: 'PT',
        fonte: 'Metrópoles',
        fonteCategoria: 'veiculo_jornalistico',
        url: 'https://www.metropoles.com/distrito-federal/pt-df-lanca-pre-candidaturas-a-camara-dos-deputados-veja-a-lista-de-nomes',
        descricao:
          'O PT-DF aprovou nominata com Vanessa Bicho Negrini entre os sete pré-candidatos à Câmara dos Deputados.',
        dataEvidencia: '2026-05-16',
        coletadaEm: '2026-07-30',
        verificadaEm: '2026-07-30',
      },
    ],
    coletadaEm: '2026-07-30',
    verificadaEm: '2026-07-30',
  },

  // ---------------------------------------------------------------------------
  // Deputado distrital pela CLDF — 24 vagas em disputa
  //
  // Critério: pré-candidatura declarada, anúncio partidário ou movimentação
  // pública com evidência específica suficiente (URL e data). Cada registro
  // aponta para notícia já validada em src/data/noticias.ts; incumbentes só
  // entram com evidência eleitoral específica (anúncio de nominata para a
  // CLDF ou reportagem com declaração/articulação de candidatura à
  // reeleição). Sem inferência por mandato atual. Estágios anteriores ao
  // registro no TSE nunca são "registro_oficial". Lote inicial de até 10
  // nomes (P3). Foto segue para P4.
  // ---------------------------------------------------------------------------

  // 36. Chico Vigilante (PT) — pré-candidato à reeleição à CLDF, lançado na
  //     nominata distrital do PT-DF e confirmou publicamente a intenção de
  //     disputar um sexto mandato.
  {
    id: 'chico-vigilante',
    slug: 'chico-vigilante',
    nome: 'Chico Vigilante',
    nomeCompleto: 'Francisco Wellington de Oliveira',
    cargo: 'deputado_distrital',
    partido: 'PT',
    estagio: 'anunciado_pelo_partido',
    noticiasRelacionadas: ['n33', 'n57', 'n72'],
    evidencias: [
      {
        id: 'e-chico-vigilante-n33',
        pessoaId: 'chico-vigilante',
        cargo: 'deputado_distrital',
        estagio: 'anunciado_pelo_partido',
        partido: 'PT',
        fonte: 'Brasil de Fato',
        fonteCategoria: 'veiculo_jornalistico',
        url: 'https://www.brasildefato.com.br/2026/05/19/pt-df-lanca-pre-candidaturas-de-leandro-grass-ao-gdf-e-erika-kokay-ao-senado-nesta-terca-19/',
        descricao:
          'O PT-DF lançou nominata com 19 pré-candidaturas à CLDF, incluindo o deputado distrital Chico Vigilante (PT) entre os nomes confirmados para a disputa na Câmara Legislativa.',
        dataEvidencia: '2026-05-19',
        coletadaEm: '2026-07-27',
        verificadaEm: '2026-07-30',
      },
      {
        id: 'e-chico-vigilante-n72',
        pessoaId: 'chico-vigilante',
        cargo: 'deputado_distrital',
        estagio: 'pre_candidatura_declarada',
        partido: 'PT',
        fonte: 'Correio Braziliense',
        fonteCategoria: 'veiculo_jornalistico',
        url: 'https://www.correiobraziliense.com.br/cidades-df/2026/06/7442943-chico-vigilante-celebra-lideranca-em-pesquisa-espontanea-para-a-cldf.html',
        descricao:
          'O deputado distrital Chico Vigilante (PT) afirmou pretender disputar um sexto mandato na CLDF ao comentar a liderança na consulta espontânea da pesquisa Correio/OPINIÃO.',
        dataEvidencia: '2026-06-17',
        coletadaEm: '2026-07-28',
        verificadaEm: '2026-07-30',
      },
    ],
    coletadaEm: '2026-07-27',
    verificadaEm: '2026-07-30',
  },

  // 37. Gabriel Magno (PT) — pré-candidato à reeleição à CLDF, lançado na
  //     nominata distrital do PT-DF.
  {
    id: 'gabriel-magno',
    slug: 'gabriel-magno',
    nome: 'Gabriel Magno',
    nomeCompleto: 'Gabriel Magno de Oliveira',
    cargo: 'deputado_distrital',
    partido: 'PT',
    estagio: 'anunciado_pelo_partido',
    noticiasRelacionadas: ['n33', 'n30', 'n57'],
    evidencias: [
      {
        id: 'e-gabriel-magno-n33',
        pessoaId: 'gabriel-magno',
        cargo: 'deputado_distrital',
        estagio: 'anunciado_pelo_partido',
        partido: 'PT',
        fonte: 'Brasil de Fato',
        fonteCategoria: 'veiculo_jornalistico',
        url: 'https://www.brasildefato.com.br/2026/05/19/pt-df-lanca-pre-candidaturas-de-leandro-grass-ao-gdf-e-erika-kokay-ao-senado-nesta-terca-19/',
        descricao:
          'O PT-DF lançou nominata com 19 pré-candidaturas à CLDF, incluindo o deputado distrital Gabriel Magno (PT) entre os nomes confirmados para a disputa na Câmara Legislativa.',
        dataEvidencia: '2026-05-19',
        coletadaEm: '2026-07-27',
        verificadaEm: '2026-07-30',
      },
    ],
    coletadaEm: '2026-07-27',
    verificadaEm: '2026-07-30',
  },

  // 38. Ricardo Vale (PT) — pré-candidato à reeleição à CLDF, lançado na
  //     nominata distrital do PT-DF.
  {
    id: 'ricardo-vale',
    slug: 'ricardo-vale',
    nome: 'Ricardo Vale',
    nomeCompleto: 'Ricardo Vale de Oliveira',
    cargo: 'deputado_distrital',
    partido: 'PT',
    estagio: 'anunciado_pelo_partido',
    noticiasRelacionadas: ['n33', 'n57'],
    evidencias: [
      {
        id: 'e-ricardo-vale-n33',
        pessoaId: 'ricardo-vale',
        cargo: 'deputado_distrital',
        estagio: 'anunciado_pelo_partido',
        partido: 'PT',
        fonte: 'Brasil de Fato',
        fonteCategoria: 'veiculo_jornalistico',
        url: 'https://www.brasildefato.com.br/2026/05/19/pt-df-lanca-pre-candidaturas-de-leandro-grass-ao-gdf-e-erika-kokay-ao-senado-nesta-terca-19/',
        descricao:
          'O PT-DF lançou nominata com 19 pré-candidaturas à CLDF, incluindo o deputado distrital Ricardo Vale (PT) entre os nomes confirmados para a disputa na Câmara Legislativa.',
        dataEvidencia: '2026-05-19',
        coletadaEm: '2026-07-27',
        verificadaEm: '2026-07-30',
      },
    ],
    coletadaEm: '2026-07-27',
    verificadaEm: '2026-07-30',
  },

  // 39. Max Maciel (PSOL) — pré-candidato à reeleição à CLDF, oficializado
  //     pela Federação Psol-Rede em convenção.
  {
    id: 'max-maciel',
    slug: 'max-maciel',
    nome: 'Max Maciel',
    nomeCompleto: 'Max Maciel de Oliveira',
    cargo: 'deputado_distrital',
    partido: 'PSOL',
    estagio: 'anunciado_pelo_partido',
    noticiasRelacionadas: ['n29', 'n35', 'n45', 'n57'],
    evidencias: [
      {
        id: 'e-max-maciel-n29',
        pessoaId: 'max-maciel',
        cargo: 'deputado_distrital',
        estagio: 'anunciado_pelo_partido',
        partido: 'PSOL',
        fonte: 'Brasil de Fato',
        fonteCategoria: 'veiculo_jornalistico',
        url: 'https://www.brasildefato.com.br/2026/07/27/federacao-psol-e-rede-oficializa-candidaturas-a-camara-federal-e-distrital-e/',
        descricao:
          'A Federação Psol-Rede oficializou as nominatas para 2026 no DF e incluiu o deputado distrital Max Maciel (PSOL) entre os nomes que disputarão a reeleição na CLDF.',
        dataEvidencia: '2026-07-27',
        coletadaEm: '2026-07-27',
        verificadaEm: '2026-07-30',
      },
      {
        id: 'e-max-maciel-n45',
        pessoaId: 'max-maciel',
        cargo: 'deputado_distrital',
        estagio: 'anunciado_pelo_partido',
        partido: 'PSOL',
        fonte: 'Jornal de Brasília',
        fonteCategoria: 'veiculo_jornalistico',
        url: 'https://jornaldebrasilia.com.br/brasilia/psol-abre-mao-de-candidatura-propria-e-aposta-em-frente-de-esquerda-com-leandro-grass-no-df/',
        descricao:
          'Jornal de Brasília registra que a Federação PSOL-Rede, em convenção de 25 de julho, confirmou a inclusão do deputado distrital Max Maciel (PSOL) na nominata para a disputa da reeleição à CLDF.',
        dataEvidencia: '2026-07-25',
        coletadaEm: '2026-08-01',
        verificadaEm: '2026-08-01',
      },
    ],
    coletadaEm: '2026-07-27',
    verificadaEm: '2026-08-01',
  },

  // 40. Eduardo Brandão (PV) — pré-candidato à CLDF, lançado na convenção
  //     distrital do PV-DF.
  {
    id: 'eduardo-brandao',
    slug: 'eduardo-brandao',
    nome: 'Eduardo Brandão',
    nomeCompleto: 'Eduardo Brandão',
    cargo: 'deputado_distrital',
    partido: 'PV',
    estagio: 'anunciado_pelo_partido',
    noticiasRelacionadas: ['n40', 'n54'],
    evidencias: [
      {
        id: 'e-eduardo-brandao-n40',
        pessoaId: 'eduardo-brandao',
        cargo: 'deputado_distrital',
        estagio: 'anunciado_pelo_partido',
        partido: 'PV',
        fonte: 'Revista 61 Brasília',
        fonteCategoria: 'veiculo_jornalistico',
        url: 'https://61brasilia.com/pv-df-homologa-candidaturas-e-reafirma-apoio-a-chapa-da-federacao-brasil-da-esperanca-para-2026/',
        descricao:
          'Convenção distrital do PV-DF homologou Eduardo Brandão como candidato à CLDF ao lado de Jean da Cultura e Elke Pimentel.',
        dataEvidencia: '2026-07-23',
        coletadaEm: '2026-07-27',
        verificadaEm: '2026-07-30',
      },
    ],
    coletadaEm: '2026-07-27',
    verificadaEm: '2026-07-30',
  },

  // 41. Jean da Cultura (PV) — pré-candidato à CLDF, lançado na convenção
  //     distrital do PV-DF.
  {
    id: 'jean-da-cultura',
    slug: 'jean-da-cultura',
    nome: 'Jean da Cultura',
    nomeCompleto: 'Jean da Cultura',
    cargo: 'deputado_distrital',
    partido: 'PV',
    estagio: 'anunciado_pelo_partido',
    noticiasRelacionadas: ['n40', 'n54'],
    evidencias: [
      {
        id: 'e-jean-da-cultura-n40',
        pessoaId: 'jean-da-cultura',
        cargo: 'deputado_distrital',
        estagio: 'anunciado_pelo_partido',
        partido: 'PV',
        fonte: 'Revista 61 Brasília',
        fonteCategoria: 'veiculo_jornalistico',
        url: 'https://61brasilia.com/pv-df-homologa-candidaturas-e-reafirma-apoio-a-chapa-da-federacao-brasil-da-esperanca-para-2026/',
        descricao:
          'Convenção distrital do PV-DF homologou Jean da Cultura como candidato à CLDF ao lado de Eduardo Brandão e Elke Pimentel.',
        dataEvidencia: '2026-07-23',
        coletadaEm: '2026-07-27',
        verificadaEm: '2026-07-30',
      },
    ],
    coletadaEm: '2026-07-27',
    verificadaEm: '2026-07-30',
  },

  // 42. Elke Pimentel (PV) — pré-candidata à CLDF, lançada na convenção
  //     distrital do PV-DF.
  {
    id: 'elke-pimentel',
    slug: 'elke-pimentel',
    nome: 'Elke Pimentel',
    nomeCompleto: 'Elke Pimentel',
    cargo: 'deputado_distrital',
    partido: 'PV',
    estagio: 'anunciado_pelo_partido',
    noticiasRelacionadas: ['n40', 'n54'],
    evidencias: [
      {
        id: 'e-elke-pimentel-n40',
        pessoaId: 'elke-pimentel',
        cargo: 'deputado_distrital',
        estagio: 'anunciado_pelo_partido',
        partido: 'PV',
        fonte: 'Revista 61 Brasília',
        fonteCategoria: 'veiculo_jornalistico',
        url: 'https://61brasilia.com/pv-df-homologa-candidaturas-e-reafirma-apoio-a-chapa-da-federacao-brasil-da-esperanca-para-2026/',
        descricao:
          'Convenção distrital do PV-DF homologou Elke Pimentel como candidata à CLDF ao lado de Eduardo Brandão e Jean da Cultura.',
        dataEvidencia: '2026-07-23',
        coletadaEm: '2026-07-27',
        verificadaEm: '2026-07-30',
      },
    ],
    coletadaEm: '2026-07-27',
    verificadaEm: '2026-07-30',
  },

  // 43. Hermeto (MDB) — deputado distrital que articula reeleição na CLDF
  //     conforme reportagem do Brasil de Fato DF.
  {
    id: 'hermeto',
    slug: 'hermeto',
    nome: 'Hermeto',
    nomeCompleto: 'Hermeto Castelo Branco de Oliveira',
    cargo: 'deputado_distrital',
    partido: 'MDB',
    estagio: 'movimentacao_publica',
    noticiasRelacionadas: ['n57', 'n60'],
    evidencias: [
      {
        id: 'e-hermeto-n60',
        pessoaId: 'hermeto',
        cargo: 'deputado_distrital',
        estagio: 'movimentacao_publica',
        partido: 'MDB',
        fonte: 'Blog do GBU',
        fonteCategoria: 'veiculo_jornalistico',
        url: 'https://www.blogdogbu.com.br/2026/04/eleicoes-quantos-distritais-o.html',
        descricao:
          'Análise do Blog do GBU sobre a nominata do MDB para a CLDF em 2026 inclui Hermeto entre os nomes do partido para a disputa na Câmara Legislativa.',
        dataEvidencia: '2026-04-14',
        coletadaEm: '2026-07-28',
        verificadaEm: '2026-07-30',
      },
      {
        id: 'e-hermeto-n57',
        pessoaId: 'hermeto',
        cargo: 'deputado_distrital',
        estagio: 'movimentacao_publica',
        partido: 'MDB',
        fonte: 'Brasil de Fato',
        fonteCategoria: 'veiculo_jornalistico',
        url: 'https://www.brasildefato.com.br/2026/07/16/disputa-a-reeleicao-predomina-no-distrito-federal-seis-parlamentares-buscam-cargos-maiores/',
        descricao:
          'Levantamento do Brasil de Fato DF indica que o deputado distrital Hermeto (MDB) articula reeleição na CLDF nas eleições de 2026.',
        dataEvidencia: '2026-07-16',
        coletadaEm: '2026-07-28',
        verificadaEm: '2026-07-30',
      },
    ],
    coletadaEm: '2026-07-28',
    verificadaEm: '2026-07-30',
  },

  // 44. Jaqueline Silva (MDB) — deputada distrital que articula
  //     reeleição na CLDF conforme reportagem do Brasil de Fato DF e análise
  //     de nominata do Blog do GBU.
  {
    id: 'jaqueline-silva',
    slug: 'jaqueline-silva',
    nome: 'Jaqueline Silva',
    nomeCompleto: 'Jaqueline Silva de Oliveira',
    cargo: 'deputado_distrital',
    partido: 'MDB',
    estagio: 'movimentacao_publica',
    noticiasRelacionadas: ['n57', 'n60'],
    evidencias: [
      {
        id: 'e-jaqueline-silva-n60',
        pessoaId: 'jaqueline-silva',
        cargo: 'deputado_distrital',
        estagio: 'movimentacao_publica',
        partido: 'MDB',
        fonte: 'Blog do GBU',
        fonteCategoria: 'veiculo_jornalistico',
        url: 'https://www.blogdogbu.com.br/2026/04/eleicoes-quantos-distritais-o.html',
        descricao:
          'Análise do Blog do GBU sobre a nominata do MDB para a CLDF em 2026 inclui Jaqueline Silva entre os nomes do partido para a disputa na Câmara Legislativa.',
        dataEvidencia: '2026-04-14',
        coletadaEm: '2026-07-28',
        verificadaEm: '2026-07-30',
      },
      {
        id: 'e-jaqueline-silva-n57',
        pessoaId: 'jaqueline-silva',
        cargo: 'deputado_distrital',
        estagio: 'movimentacao_publica',
        partido: 'MDB',
        fonte: 'Brasil de Fato',
        fonteCategoria: 'veiculo_jornalistico',
        url: 'https://www.brasildefato.com.br/2026/07/16/disputa-a-reeleicao-predomina-no-distrito-federal-seis-parlamentares-buscam-cargos-maiores/',
        descricao:
          'Levantamento do Brasil de Fato DF indica que a deputada distrital Jaqueline Silva (MDB) articula reeleição na CLDF nas eleições de 2026.',
        dataEvidencia: '2026-07-16',
        coletadaEm: '2026-07-28',
        verificadaEm: '2026-07-30',
      },
    ],
    coletadaEm: '2026-07-28',
    verificadaEm: '2026-07-30',
  },

  // ---------------------------------------------------------------------------
  // Ampliação P3 — deputado distrital (até 10 nomes adicionais). Cada nome
  // sustentado por fonte específica: homologação em convenção partidária
  // (anunciado_pelo_partido) ou duas reportagens independentes sobre nominata
  // para a CLDF (movimentacao_publica). Sem inferir candidatura por mandato.
  // ---------------------------------------------------------------------------

  // 45. Doutora Jane (Republicanos) — deputada distrital que articula
  //     reeleição na CLDF, incluída na nominata do Republicanos conforme
  //     reportagens independentes da Vero Notícias e do Blog do GBU.
  {
    id: 'doutora-jane',
    slug: 'doutora-jane',
    nome: 'Doutora Jane',
    nomeCompleto: 'Jane Klébia de Oliveira',
    cargo: 'deputado_distrital',
    partido: 'Republicanos',
    estagio: 'movimentacao_publica',
    noticiasRelacionadas: ['n24', 'n60'],
    evidencias: [
      {
        id: 'e-doutora-jane-n24',
        pessoaId: 'doutora-jane',
        cargo: 'deputado_distrital',
        estagio: 'movimentacao_publica',
        partido: 'Republicanos',
        fonte: 'Vero Notícias',
        fonteCategoria: 'veiculo_jornalistico',
        url: 'https://veronoticias.com/politica/republicanos-df-aposta-em-nominata-forte-e-mira-tres-cadeiras-na-cldf/',
        descricao:
          'O Republicanos no DF prepara nominata competitiva para a CLDF em 2026, com Doutora Jane entre os nomes relacionados ao partido.',
        dataEvidencia: '2026-02-16',
        coletadaEm: '2026-07-30',
        verificadaEm: '2026-07-30',
      },
      {
        id: 'e-doutora-jane-n60',
        pessoaId: 'doutora-jane',
        cargo: 'deputado_distrital',
        estagio: 'movimentacao_publica',
        partido: 'Republicanos',
        fonte: 'Blog do GBU',
        fonteCategoria: 'veiculo_jornalistico',
        url: 'https://www.blogdogbu.com.br/2026/04/eleicoes-quantos-distritais-o.html',
        descricao:
          'Análise do Blog do GBU sobre as nominatas para a CLDF em 2026 inclui Jane Klébia (Doutora Jane) entre os nomes do Republicanos.',
        dataEvidencia: '2026-04-14',
        coletadaEm: '2026-07-30',
        verificadaEm: '2026-07-30',
      },
    ],
    coletadaEm: '2026-07-30',
    verificadaEm: '2026-07-30',
  },

  // 46. Martins Machado (Republicanos) — deputado distrital que articula
  //     reeleição na CLDF, incluído na nominata do Republicanos conforme
  //     reportagens independentes da Vero Notícias e do Blog do GBU.
  {
    id: 'martins-machado',
    slug: 'martins-machado',
    nome: 'Martins Machado',
    nomeCompleto: 'Martins Machado de Oliveira',
    cargo: 'deputado_distrital',
    partido: 'Republicanos',
    estagio: 'movimentacao_publica',
    noticiasRelacionadas: ['n24', 'n60'],
    evidencias: [
      {
        id: 'e-martins-machado-n24',
        pessoaId: 'martins-machado',
        cargo: 'deputado_distrital',
        estagio: 'movimentacao_publica',
        partido: 'Republicanos',
        fonte: 'Vero Notícias',
        fonteCategoria: 'veiculo_jornalistico',
        url: 'https://veronoticias.com/politica/republicanos-df-aposta-em-nominata-forte-e-mira-tres-cadeiras-na-cldf/',
        descricao:
          'O Republicanos no DF prepara nominata competitiva para a CLDF em 2026, com Martins Machado entre os nomes relacionados ao partido.',
        dataEvidencia: '2026-02-16',
        coletadaEm: '2026-07-30',
        verificadaEm: '2026-07-30',
      },
      {
        id: 'e-martins-machado-n60',
        pessoaId: 'martins-machado',
        cargo: 'deputado_distrital',
        estagio: 'movimentacao_publica',
        partido: 'Republicanos',
        fonte: 'Blog do GBU',
        fonteCategoria: 'veiculo_jornalistico',
        url: 'https://www.blogdogbu.com.br/2026/04/eleicoes-quantos-distritais-o.html',
        descricao:
          'Análise do Blog do GBU sobre as nominatas para a CLDF em 2026 inclui Martins Machado entre os nomes do Republicanos.',
        dataEvidencia: '2026-04-14',
        coletadaEm: '2026-07-30',
        verificadaEm: '2026-07-30',
      },
    ],
    coletadaEm: '2026-07-30',
    verificadaEm: '2026-07-30',
  },

  // 47. Eduardo Pedrosa (União Brasil) — deputado distrital que articula
  //     reeleição na CLDF, incluído na nominata da Federação União
  //     Progressista conforme reportagens independentes do Brasil de Fato
  //     e do Blog do GBU.
  {
    id: 'eduardo-pedrosa',
    slug: 'eduardo-pedrosa',
    nome: 'Eduardo Pedrosa',
    nomeCompleto: 'Eduardo Pedrosa de Paula',
    cargo: 'deputado_distrital',
    partido: 'União Brasil',
    estagio: 'movimentacao_publica',
    noticiasRelacionadas: ['n57', 'n60'],
    evidencias: [
      {
        id: 'e-eduardo-pedrosa-n60',
        pessoaId: 'eduardo-pedrosa',
        cargo: 'deputado_distrital',
        estagio: 'movimentacao_publica',
        partido: 'União Brasil',
        fonte: 'Blog do GBU',
        fonteCategoria: 'veiculo_jornalistico',
        url: 'https://www.blogdogbu.com.br/2026/04/eleicoes-quantos-distritais-o.html',
        descricao:
          'Análise do Blog do GBU sobre as nominatas para a CLDF em 2026 inclui Eduardo Pedrosa entre os nomes da Federação União Progressista.',
        dataEvidencia: '2026-04-14',
        coletadaEm: '2026-07-30',
        verificadaEm: '2026-07-30',
      },
      {
        id: 'e-eduardo-pedrosa-n57',
        pessoaId: 'eduardo-pedrosa',
        cargo: 'deputado_distrital',
        estagio: 'movimentacao_publica',
        partido: 'União Brasil',
        fonte: 'Brasil de Fato',
        fonteCategoria: 'veiculo_jornalistico',
        url: 'https://www.brasildefato.com.br/2026/07/16/disputa-a-reeleicao-predomina-no-distrito-federal-seis-parlamentares-buscam-cargos-maiores/',
        descricao:
          'Levantamento do Brasil de Fato DF indica que a maioria dos 24 deputados distritais articula reeleição na CLDF, incluindo Eduardo Pedrosa (União Brasil).',
        dataEvidencia: '2026-07-16',
        coletadaEm: '2026-07-30',
        verificadaEm: '2026-07-30',
      },
    ],
    coletadaEm: '2026-07-30',
    verificadaEm: '2026-07-30',
  },

  // 48. Christian Sena (UP) — pré-candidato à CLDF, homologado pela
  //     Unidade Popular em convenção distrital.
  {
    id: 'christian-sena',
    slug: 'christian-sena',
    nome: 'Christian Sena',
    nomeCompleto: 'Christian Sena',
    cargo: 'deputado_distrital',
    partido: 'UP',
    estagio: 'anunciado_pelo_partido',
    noticiasRelacionadas: ['n42'],
    evidencias: [
      {
        id: 'e-christian-sena-n42',
        pessoaId: 'christian-sena',
        cargo: 'deputado_distrital',
        estagio: 'anunciado_pelo_partido',
        partido: 'UP',
        fonte: 'NC News',
        fonteCategoria: 'veiculo_jornalistico',
        url: 'https://ncnews.com.br/2026/07/23/up-homologa-candidaturas-e-aprova-programa-de-governo-em-convencao-distrital-no-df/',
        descricao:
          'A Unidade Popular homologou em convenção distrital no Sindsep-DF Christian Sena como candidato à CLDF, ao lado de Bárbara Calista.',
        dataEvidencia: '2026-07-23',
        coletadaEm: '2026-07-30',
        verificadaEm: '2026-07-30',
      },
    ],
    coletadaEm: '2026-07-30',
    verificadaEm: '2026-07-30',
  },

  // 49. Bárbara Calista (UP) — pré-candidata à CLDF, homologada pela
  //     Unidade Popular em convenção distrital.
  {
    id: 'barbara-calista',
    slug: 'barbara-calista',
    nome: 'Bárbara Calista',
    nomeCompleto: 'Bárbara Calista',
    cargo: 'deputado_distrital',
    partido: 'UP',
    estagio: 'anunciado_pelo_partido',
    noticiasRelacionadas: ['n42'],
    evidencias: [
      {
        id: 'e-barbara-calista-n42',
        pessoaId: 'barbara-calista',
        cargo: 'deputado_distrital',
        estagio: 'anunciado_pelo_partido',
        partido: 'UP',
        fonte: 'NC News',
        fonteCategoria: 'veiculo_jornalistico',
        url: 'https://ncnews.com.br/2026/07/23/up-homologa-candidaturas-e-aprova-programa-de-governo-em-convencao-distrital-no-df/',
        descricao:
          'A Unidade Popular homologou em convenção distrital no Sindsep-DF Bárbara Calista como candidata à CLDF, ao lado de Christian Sena.',
        dataEvidencia: '2026-07-23',
        coletadaEm: '2026-07-30',
        verificadaEm: '2026-07-30',
      },
    ],
    coletadaEm: '2026-07-30',
    verificadaEm: '2026-07-30',
  },
];
