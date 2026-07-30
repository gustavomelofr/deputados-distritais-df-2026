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
//
// A base ainda não inclui deputado distrital, senador, deputado federal nem
// foto desses nomes — estes ficam para os próximos itens da P3/P4.
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
    noticiasRelacionadas: ['n33', 'n44', 'n40', 'n43'],
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
    ],
    coletadaEm: '2026-07-27',
    verificadaEm: '2026-07-30',
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
];
