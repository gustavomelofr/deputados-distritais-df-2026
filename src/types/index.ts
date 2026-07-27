export interface DeputadoDistrital {
  id: string;
  slug: string;
  nome: string;
  nomeCompleto: string;
  partido: string;
  foto: string;
  biografia: string;
  comissoes: string[];
  contatos: {
    email?: string;
    telefone?: string;
    instagram?: string;
    twitter?: string;
  };
  proposicoes: Proposicao[];
  presenca: Sessao[];
  gastos: Gasto[];
  statusMandato: 'exercicio' | 'licenca' | 'suplente';
  // Regiões administrativas do DF explicitamente citadas na biografia oficial
  // (fonte: CLDF). Lista vazia significa "região não declarada na biografia".
  regioesAdministrativas?: string[];
  // Temas de atuação explicitamente citados na biografia oficial (fonte: CLDF).
  // Lista vazia significa "tema não declarado na biografia".
  temas?: string[];
}

export interface Proposicao {
  id: string;
  titulo: string;
  descricao: string;
  data: string;
  tipo: 'projeto_de_lei' | 'indicacao' | 'requerimento' | 'emenda';
  status: 'apresentada' | 'em_tramitacao' | 'aprovada' | 'rejeitada';
  link: string;
}

export interface Sessao {
  id: string;
  data: string;
  descricao: string;
  presente: boolean;
}

export interface Gasto {
  id: string;
  tipo: string;
  valor: number;
  data: string;
  descricao: string;
}

export interface Noticia {
  id: string;
  titulo: string;
  fonte: string;
  url: string;
  data: string;
  resumo: string;
  deputadosRelacionados: string[];
  /** Data de coleta (distinta da publicação e da verificação). */
  coletadaEm?: string;
  /** Data de verificação editorial da URL, fonte e associações. */
  verificadaEm?: string;
  /** Tipo editorial da notícia eleitoral (quando classificada). */
  tipo?: TipoNoticiaEleitoral;
}

export interface PostInstagram {
  id: string;
  autor: string;
  texto: string;
  data: string;
  url: string;
  deputadoSlug: string;
}

// ---------------------------------------------------------------------------
// Tipos eleitorais — Eleições 2026 no Distrito Federal
//
// Cobrem os quatro grupos de cargos do DF 2026: governador/vice, Senado,
// Câmara Federal (deputado federal) e CLDF (deputado distrital).
//
// Regras de fonte, evidência, fotografia e notícia eleitoral seguem
// AGENT_BRIEF.md: fonte específica (nunca homepage), datas separadas
// (publicadaEm/coletadaEm/verificadaEm), estágio anterior ao registro no
// TSE nunca igual a "candidato oficial", e foto somente com licença/base
// de uso explícita — caso contrário, placeholder honesto.
// ---------------------------------------------------------------------------

/** Grupos de cargos eleitorais do DF 2026. */
export type CargoEleitoral =
  | 'governador'
  | 'vice_governador'
  | 'senador'
  | 'deputado_federal'
  | 'deputado_distrital';

/**
 * Estágio da classificação eleitoral de uma pessoa.
 * Antes do registro no TSE, nunca usar "candidato oficial".
 */
export type EstagioEleitoral =
  | 'nome_monitorado'
  | 'pre_candidatura_declarada'
  | 'anunciado_pelo_partido'
  | 'movimentacao_publica'
  | 'registro_oficial';

/** Categorias de fonte permitidas pelo brief (prioridade 1–6). */
export type CategoriaFonte =
  | 'tse_divulcacand_tre'
  | 'orgaos_publicos'
  | 'partido_oficial'
  | 'declaracao_pessoa'
  | 'veiculo_jornalistico'
  | 'google_news_rss';

/**
 * Licença/base de uso da fotografia, em ordem de preferência do brief.
 * "placeholder" indica ausência de foto reutilizável — placeholder honesto.
 */
export type LicencaFoto =
  | 'divulcacand_tse'
  | 'institucional_oficial'
  | 'partido_oficial'
  | 'pessoa_oficial'
  | 'imprensa_licenca_explicita'
  | 'placeholder';

/** Tipo de notícia eleitoral para classificação editorial. */
export type TipoNoticiaEleitoral =
  | 'pre_candidatura'
  | 'anuncio_partidario'
  | 'movimentacao_publica'
  | 'registro_oficial'
  | 'posicao_politica'
  | 'atividade_legislativa'
  | 'outro';

/**
 * Fotografia eleitoral.
 * Toda foto registra arquivo/URL, fonte, URL da fonte, data de verificação
 * e licença/base de uso. Validação exige identidade, resposta HTTP, MIME de
 * imagem e dimensões mínimas. Hotlink de imprensa sem permissão é proibido.
 */
export interface FotografiaEleitoral {
  url: string;
  fonte: string;
  /** URL da fonte onde a licença/autorização está explícita. */
  urlFonte: string;
  /** "placeholder" indica ausência de foto reutilizável — placeholder honesto. */
  licenca: LicencaFoto;
  mime?: string;
  largura?: number;
  altura?: number;
  verificadaEm: string;
  /** Crédito/autor quando aplicável (não substitui licença). */
  credito?: string;
}

/**
 * Evidência eleitoral.
 * Registra pessoa, cargo, estágio, fonte, URL, data da evidência e data de
 * verificação. "movimentacao_publica" exige fonte primária ou duas
 * reportagens independentes (a serem registradas como evidências separadas).
 */
export interface EvidenciaEleitoral {
  id: string;
  pessoaId: string;
  cargo: CargoEleitoral;
  estagio: EstagioEleitoral;
  partido?: string;
  fonte: string;
  fonteCategoria: CategoriaFonte;
  /** URL específica da matéria/item — nunca homepage. */
  url: string;
  /** Descrição factual; não pode acrescentar fatos ausentes na fonte. */
  descricao: string;
  /** Quando ocorreu a declaração/anúncio/registro (distinta de coleta/verificação). */
  dataEvidencia: string;
  coletadaEm: string;
  verificadaEm: string;
}

/**
 * Pessoa eleitoral — nome monitorado para 2026.
 * Antes do registro no TSE, estagio != "registro_oficial".
 */
export interface PessoaEleitoral {
  id: string;
  slug: string;
  nome: string;
  nomeCompleto?: string;
  cargo: CargoEleitoral;
  partido?: string;
  estagio: EstagioEleitoral;
  /** Apenas links confirmados em fonte oficial. */
  linksOficiais?: {
    site?: string;
    instagram?: string;
    twitter?: string;
    camara?: string;
    senado?: string;
    cldf?: string;
  };
  /** Foto atribuída ou placeholder honesto. */
  foto?: FotografiaEleitoral;
  /** Preserva mudança de estágio/partido/cargo — não apagar registro anterior. */
  evidencias: EvidenciaEleitoral[];
  /** Associa-se a uma pessoa apenas quando citada ou diretamente relacionada. */
  noticiasRelacionadas: string[];
  coletadaEm: string;
  verificadaEm: string;
}

/**
 * Notícia eleitoral.
 * URL canônica específica, fonte, datas separadas (publicadaEm/coletadaEm/
 * verificadaEm), tipo, cargos relacionados e pessoas relacionadas.
 * Associa-se a uma pessoa apenas quando citada ou diretamente relacionada.
 */
export interface NoticiaEleitoral {
  id: string;
  titulo: string;
  /** Resumo factual; não pode acrescentar fatos ausentes na fonte. */
  resumo: string;
  fonte: string;
  fonteCategoria: CategoriaFonte;
  /** URL canônica específica da matéria — nunca homepage. */
  url: string;
  tipo: TipoNoticiaEleitoral;
  cargos: CargoEleitoral[];
  pessoasRelacionadas: string[];
  publicadaEm: string;
  coletadaEm: string;
  verificadaEm: string;
}
