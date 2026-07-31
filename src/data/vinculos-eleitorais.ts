import type { VinculoEleitoral } from '@/types';

// ---------------------------------------------------------------------------
// Vínculos eleitorais — Eleições 2026 no DF
//
// Cada registro documenta uma chapa, apoio, federação, coligação ou frente
// anunciada em fonte específica (URL canônica). Versões conflitantes para o
// mesmo papel são preservadas como registros separados, identificados pelo
// `grupoDivergencia`, sem transformação em registro oficial nem inferência
// de vínculo sem fonte.
//
// IDs de pessoas referenciam `cenarioEleitoral` (src/data/cenario-eleitoral.ts);
// IDs de evidências referenciam o mesmo cadastro. Notícias relacionadas
// apontam para `src/data/noticias.ts` quando a fonte do vínculo coincide
// com a notícia já validada.
//
// Escopo deste lote inicial: chapa Celina Leão/Gustavo Rocha (PP + Republicanos,
// com apoio PL/Senado), chapa Leandro Grass com Tetê Monteiro (Federação PT-PV-
// PCdoB + Federação PSOL-Rede) coexistindo com o anúncio anterior do PV-DF
// indicando Dora Gomes como vice (divergência preservada), chapa Samara
// Mineiro/Thaís Oliveira (UP) e chapa Agir (Elisson Ferreira/Tiago Tarsis),
// além de apoios cruzados (Leila Barros PDT ao Senado, Erika Kokay PT ao
// Senado). Sem novos nomes nem chapas inventadas.
// ---------------------------------------------------------------------------

export const vinculosEleitorais: VinculoEleitoral[] = [
  // 1. Chapa PP + Republicanos para o GDF (Celina Leão / Gustavo Rocha).
  {
    id: 'v-chapa-celina-gustavo',
    tipo: 'chapa',
    status: 'anunciado',
    pessoas: [
      { pessoaId: 'celina-leao', papel: 'titular' },
      { pessoaId: 'gustavo-rocha', papel: 'vice' },
    ],
    cargos: ['governador', 'vice_governador'],
    partidoOuFederacao: 'PP + Republicanos',
    inicioEm: '2026-07-18',
    fonte: 'G1',
    fonteCategoria: 'veiculo_jornalistico',
    url: 'https://g1.globo.com/df/distrito-federal/noticia/2026/07/18/pp-lanca-pre-candidatura-de-celina-leao-ao-governo-do-df.ghtml',
    descricao:
      'Progressistas oficializou, em evento na Ceilândia, a pré-candidatura da governadora Celina Leão ao GDF e confirmou o ex-secretário da Casa Civil Gustavo Rocha (Republicanos) como pré-candidato a vice-governador.',
    evidenciaApoioId: 'e-celina-leao-n48',
    noticiasRelacionadas: ['n48', 'n94', 'n95'],
    coletadaEm: '2026-07-28',
    verificadaEm: '2026-07-30',
  },

  // 2. Federação PT-PV-PCdoB (Brasil da Esperança) — chapa Leandro Grass ao
  //    GDF homologada pela federação.
  {
    id: 'v-federacao-brasil-esperanca',
    tipo: 'federacao',
    status: 'anunciado',
    pessoas: [
      { pessoaId: 'leandro-grass', papel: 'titular' },
      { pessoaId: 'erika-kokay', papel: 'integrante' },
    ],
    cargos: ['governador', 'senador'],
    partidoOuFederacao: 'Federação Brasil da Esperança (PT + PV + PCdoB)',
    inicioEm: '2026-05-19',
    fonte: 'Brasil de Fato',
    fonteCategoria: 'veiculo_jornalistico',
    url: 'https://www.brasildefato.com.br/2026/05/19/pt-df-lanca-pre-candidaturas-de-leandro-grass-ao-gdf-e-erika-kokay-ao-senado-nesta-terca-19/',
    descricao:
      'PT-DF lançou, em 19 de maio, as pré-candidaturas de Leandro Grass ao GDF e de Erika Kokay ao Senado, sob a Federação Brasil da Esperança (PT-PV-PCdoB).',
    evidenciaApoioId: 'e-leandro-grass-n33',
    noticiasRelacionadas: ['n33', 'n44'],
    coletadaEm: '2026-07-27',
    verificadaEm: '2026-07-30',
  },

  // 3. Anúncio inicial do PV-DF: Dora Gomes como vice de Leandro Grass.
  //    Versão conflitante — preservada como registro próprio do grupo de
  //    divergência 'vice-leandro-grass'.
  {
    id: 'v-apoio-pv-dora-vice',
    tipo: 'apoio',
    status: 'contestado',
    pessoas: [
      { pessoaId: 'leandro-grass', papel: 'titular' },
      { pessoaId: 'dora-gomes', papel: 'vice' },
    ],
    cargos: ['governador', 'vice_governador'],
    partidoOuFederacao: 'PV-DF',
    grupoDivergencia: 'vice-leandro-grass',
    inicioEm: '2026-07-23',
    fimEm: '2026-07-25',
    fonte: 'Revista 61 Brasília',
    fonteCategoria: 'veiculo_jornalistico',
    url: 'https://61brasilia.com/pv-df-homologa-candidaturas-e-reafirma-apoio-a-chapa-da-federacao-brasil-da-esperanca-para-2026/',
    descricao:
      'PV-DF anunciou apoio à chapa Leandro Grass (PT) ao GDF com Dora Gomes (PV) como candidata a vice-governadora, em convenção distrital de 23 de julho.',
    evidenciaApoioId: 'e-dora-gomes-n40',
    noticiasRelacionadas: ['n40', 'n54'],
    coletadaEm: '2026-07-27',
    verificadaEm: '2026-07-30',
  },

  // 4. Federação PSOL-Rede indica Tetê Monteiro como vice de Leandro Grass
  //    em convenção posterior (25 de julho) — versão divergente.
  {
    id: 'v-apoio-psol-rede-tete-vice',
    tipo: 'apoio',
    status: 'divergente',
    pessoas: [
      { pessoaId: 'leandro-grass', papel: 'titular' },
      { pessoaId: 'tete-monteiro', papel: 'vice' },
    ],
    cargos: ['governador', 'vice_governador'],
    partidoOuFederacao: 'Federação PSOL-Rede',
    grupoDivergencia: 'vice-leandro-grass',
    inicioEm: '2026-07-25',
    fonte: 'Correio Braziliense',
    fonteCategoria: 'veiculo_jornalistico',
    url: 'https://www.correiobraziliense.com.br/cidades-df/2026/07/7467965-unidade-da-esquerda-marca-convencao-do-psol.html',
    descricao:
      'A Federação PSOL-Rede oficializou apoio a Leandro Grass e indicou Tetê Monteiro para vice-governadora em convenção na CLDF.',
    evidenciaApoioId: 'e-tete-monteiro-n43',
    noticiasRelacionadas: ['n35', 'n43', 'n45', 'n53'],
    coletadaEm: '2026-07-27',
    verificadaEm: '2026-07-30',
  },

  // 5. Frente ampla no Senado pelo DF: Leila Barros (PDT) à reeleição com
  //    apoio de Erika Kokay (PT), Bia Kicis (PL) e Michelle Bolsonaro (PL).
  {
    id: 'v-frente-leila-reeleicao',
    tipo: 'frente',
    status: 'anunciado',
    pessoas: [
      { pessoaId: 'leila-barros', papel: 'titular' },
      { pessoaId: 'erika-kokay', papel: 'apoiador' },
    ],
    cargos: ['senador'],
    partidoOuFederacao: 'Frente ampla de oposição no DF',
    inicioEm: '2026-04-22',
    fonte: 'Brasil de Fato',
    fonteCategoria: 'veiculo_jornalistico',
    url: 'https://www.brasildefato.com.br/2026/04/22/senadora-leila-do-volei-lanca-pre-candidatura-a-reeleicao-com-frente-ampla-no-distrito-federal/',
    descricao:
      'A senadora Leila do Vôlei (PDT) anunciou pré-candidatura à reeleição em evento com lideranças da oposição no DF, incluindo apoio da Federação Brasil da Esperança (Erika Kokay/PT).',
    evidenciaApoioId: 'e-leila-barros-n30',
    noticiasRelacionadas: ['n30', 'n43', 'n53'],
    coletadaEm: '2026-07-27',
    verificadaEm: '2026-07-30',
  },

  // 6. Chapa pura Agir (Elisson Ferreira ao GDF, Tiago Tarsis ao Senado),
  //    oficializada em convenção de 20 de julho sem coligações.
  {
    id: 'v-chapa-agir-pura',
    tipo: 'chapa',
    status: 'anunciado',
    pessoas: [
      { pessoaId: 'elisson-ferreira', papel: 'titular' },
      { pessoaId: 'tiago-tarsis', papel: 'integrante' },
    ],
    cargos: ['governador', 'senador'],
    partidoOuFederacao: 'Agir',
    inicioEm: '2026-07-20',
    fonte: 'G1',
    fonteCategoria: 'veiculo_jornalistico',
    url: 'https://g1.globo.com/df/distrito-federal/eleicoes/2026/noticia/2026/07/20/agir-lanca-elisson-ferreira-como-candidato-ao-governo-do-distrito-federal.ghtml',
    descricao:
      'O Agir confirmou em convenção em Brasília a candidatura de Elisson Ferreira ao GDF com Tiago Tarsis ao Senado pelo DF em chapa pura sem coligações anunciadas.',
    evidenciaApoioId: 'e-elisson-ferreira-n26',
    noticiasRelacionadas: ['n26', 'n84'],
    coletadaEm: '2026-07-27',
    verificadaEm: '2026-07-30',
  },

  // 7. Chapa UP (Samara Mineiro / Thaís Oliveira ao GDF + Guilherme Amorim
  //    ao Senado), homologada em convenção distrital no Sindsep-DF.
  {
    id: 'v-chapa-up',
    tipo: 'chapa',
    status: 'anunciado',
    pessoas: [
      { pessoaId: 'samara-mineiro', papel: 'titular' },
      { pessoaId: 'thais-oliveira', papel: 'vice' },
      { pessoaId: 'guilherme-amorim', papel: 'integrante' },
    ],
    cargos: ['governador', 'vice_governador', 'senador'],
    partidoOuFederacao: 'Unidade Popular (UP)',
    inicioEm: '2026-07-23',
    fonte: 'NC News',
    fonteCategoria: 'veiculo_jornalistico',
    url: 'https://ncnews.com.br/2026/07/23/up-homologa-candidaturas-e-aprova-programa-de-governo-em-convencao-distrital-no-df/',
    descricao:
      'A Unidade Popular oficializou em convenção no Sindsep-DF a chapa Samara Mineiro ao GDF com Thaís Oliveira como vice-governadora e Guilherme Amorim ao Senado.',
    evidenciaApoioId: 'e-samara-n42',
    noticiasRelacionadas: ['n42'],
    coletadaEm: '2026-07-27',
    verificadaEm: '2026-07-30',
  },

  // 8. Federação PSOL-Rede: apoio cruzado a Leila Barros (PDT) ao Senado
  //    ratificado em convenção de 25 de julho.
  {
    id: 'v-apoio-psol-rede-leila',
    tipo: 'apoio',
    status: 'ratificado',
    pessoas: [
      { pessoaId: 'leila-barros', papel: 'titular' },
      { pessoaId: 'fabio-felix', papel: 'integrante' },
      { pessoaId: 'max-maciel', papel: 'integrante' },
    ],
    cargos: ['senador', 'deputado_federal', 'deputado_distrital'],
    partidoOuFederacao: 'Federação PSOL-Rede',
    inicioEm: '2026-07-25',
    fonte: 'Correio Braziliense',
    fonteCategoria: 'veiculo_jornalistico',
    url: 'https://www.correiobraziliense.com.br/cidades-df/2026/07/7467965-unidade-da-esquerda-marca-convencao-do-psol.html',
    descricao:
      'A Federação PSOL-Rede oficializou apoio à pré-candidatura de Leila do Vôlei (PDT) ao Senado em convenção na CLDF e lançou Fábio Felix para a Câmara dos Deputados e Max Maciel para a CLDF.',
    evidenciaApoioId: 'e-leila-barros-n43',
    noticiasRelacionadas: ['n35', 'n43', 'n45', 'n53'],
    coletadaEm: '2026-07-27',
    verificadaEm: '2026-07-30',
  },

  // 9. Coligação PSD/Avante com José Roberto Arruda ao GDF (aliança
  //    mencionada em cobertura de convenções; Paulo Octávio ao Senado
  //    consta da mesma aliança).
  {
    id: 'v-coligacao-psd-avante-arruda',
    tipo: 'coligacao',
    status: 'anunciado',
    pessoas: [
      { pessoaId: 'jose-roberto-arruda', papel: 'titular' },
      { pessoaId: 'paulo-octavio', papel: 'integrante' },
    ],
    cargos: ['governador', 'senador'],
    partidoOuFederacao: 'PSD + Avante',
    inicioEm: '2026-07-20',
    fonte: 'Clica DF',
    fonteCategoria: 'veiculo_jornalistico',
    url: 'https://clicadf.com.br/partidos-e-federacoes-vao-definir-nos-proximos-15-dias-as-selecoes-que-vao-entrar-em-campo-para-disputar-as-eleicoes-em-4-de-outubro/',
    descricao:
      'Clica DF registra a expectativa de definição da aliança PSD/Avante para a disputa ao GDF com José Roberto Arruda e ao Senado com Paulo Octávio.',
    noticiasRelacionadas: ['n100', 'n62'],
    coletadaEm: '2026-07-28',
    verificadaEm: '2026-07-30',
  },

  // 10. Chapa Novo (Kiko Caputo ao GDF + Sebastião Coelho ao Senado),
  //     oficializada em convenção estadual em 20 de julho.
  {
    id: 'v-chapa-novo',
    tipo: 'chapa',
    status: 'anunciado',
    pessoas: [
      { pessoaId: 'kiko-caputo', papel: 'titular' },
      { pessoaId: 'sebastiao-coelho', papel: 'integrante' },
    ],
    cargos: ['governador', 'senador'],
    partidoOuFederacao: 'Partido Novo',
    inicioEm: '2026-07-20',
    fonte: 'Metrópoles',
    fonteCategoria: 'veiculo_jornalistico',
    url: 'https://www.metropoles.com/colunas/grande-angular/novo-oficializa-candidaturas-de-kiko-caputo-e-sebastiao-coelho-no-df',
    descricao:
      'Partido Novo oficializou em convenção estadual realizada em 20 de julho as candidaturas de Kiko Caputo ao GDF e Sebastião Coelho ao Senado pelo DF.',
    evidenciaApoioId: 'e-caputo-n50',
    noticiasRelacionadas: ['n50', 'n62'],
    coletadaEm: '2026-07-28',
    verificadaEm: '2026-07-30',
  },
];