import type {
  CargoEleitoral,
  CategoriaFonte,
  TipoNoticiaEleitoral,
} from '@/types';

// ---------------------------------------------------------------------------
// Coletor de descoberta de notícias eleitorais — Eleições 2026 no DF
//
// Critério da tarefa P1: buscar fontes permitidas dos últimos sete dias,
// produzir candidatos deduplicados e NÃO publicar automaticamente sem revisão
// do agente.
//
// Este módulo é o estágio de DESCoberta: ele produz candidatos a
// NoticiaEleitoral em um buffer separado (descobertas pendentes), que o agente
// revisa e promove manualmente a src/data/noticias.ts. Nenhuma função aqui
// escreve em arquivos de dados publicados — o agente é o único responsável
// pela publicação, conforme AGENT_BRIEF.md.
//
// Fontes permitidas (prioridade do brief): TSE/DivulgaCand/TRE-DF, órgãos
// públicos, partidos oficiais, declaração da pessoa, veículos jornalísticos
// identificáveis e Google News RSS SOMENTE como mecanismo de descoberta
// (prioridade 6). O coletor marca a categoria da fonte de cada candidato.
//
// Deduplicação: por URL canônica, título normalizado e pauta/veículo/data,
// conforme regras de dados do brief. Itens fora da janela de sete dias são
// descartados. Homepage de veículo não é evidência — exige URL específica.
// ---------------------------------------------------------------------------

/** Janela de descoberta em dias (últimos sete dias, conforme o brief). */
export const JANELA_DESCOBERTA_DIAS = 7;

/**
 * Candidato a notícia eleitoral descoberto — ainda não publicado.
 * O agente revisa e promove manualmente a src/data/noticias.ts.
 */
export interface CandidatoNoticia {
  /** ID temporário do candidato (prefixo "c" para distinguir de "n" publicados). */
  id: string;
  titulo: string;
  /** Resumo bruto da fonte; o agente pode reescrever antes de publicar. */
  resumo: string;
  fonte: string;
  fonteCategoria: CategoriaFonte;
  /** URL canônica específica da matéria — nunca homepage. */
  url: string;
  /** Tipo editorial sugerido; o agente confirma antes de publicar. */
  tipo: TipoNoticiaEleitoral;
  cargos: CargoEleitoral[];
  pessoasRelacionadas: string[];
  /** Data de publicação ISO (YYYY-MM-DD). */
  publicadaEm: string;
  /** Data de coleta ISO (YYYY-MM-DD). */
  coletadaEm: string;
  /** Origem da descoberta (ex.: "google_news_rss", "feed_direto"). */
  origemDescoberta: string;
}

/** Item bruto de um feed/agregador antes de normalização e validação. */
export interface ItemBrutoDescoberta {
  titulo: string;
  url: string;
  fonte: string;
  /** Data de publicação ISO (YYYY-MM-DD) ou string parseável. */
  publicadaEm: string;
  resumo?: string;
  origemDescoberta: string;
}

/** Resultado da coleta de descoberta de um ciclo. */
export interface ResultadoDescoberta {
  candidatos: CandidatoNoticia[];
  descartados: { url: string; motivo: string }[];
  /** Data de referência usada para a janela de sete dias. */
  dataReferencia: string;
}

// --- Utilidades de normalização e validação -------------------------------

function isIsoDate(s: string): boolean {
  return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));
}

function normalizarData(s: string): string | null {
  if (!s) return null;
  if (isIsoDate(s)) return s;
  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  return null;
}

/** Link genérico: URL sem caminho significativo (apenas domínio/raiz). */
function isGenericLink(url: string): boolean {
  try {
    const u = new URL(url);
    const path = u.pathname.replace(/\/+$/, '');
    return path === '' || path === '/';
  } catch {
    return false;
  }
}

/**
 * Normaliza URL canônica: remove parâmetros de rastreamento comuns e
 * fragmentos, para deduplicação. Não decodifica o path — apenas remove
 * sufixos de tracking que criam falsos positivos de duplicidade.
 */
export function normalizarUrlCanonica(url: string): string {
  try {
    const u = new URL(url);
    const tracking = new Set([
      'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
      'fbclid', 'gclid', 'ref', 'source',
    ]);
    const params = new URLSearchParams(u.searchParams);
    for (const k of [...params.keys()]) {
      if (tracking.has(k)) params.delete(k);
    }
    const search = params.toString();
    return `${u.origin}${u.pathname.replace(/\/+$/, '') || '/'}${search ? `?${search}` : ''}`;
  } catch {
    return url;
  }
}

/** Normaliza título para comparação: lowercase, sem acentos, sem pontuação. */
export function normalizarTitulo(titulo: string): string {
  return titulo
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Chave de deduplicação por pauta/veículo/data (além da URL canônica). */
function chavePautaVeiculoData(c: {
  fonte: string;
  publicadaEm: string;
  titulo: string;
}): string {
  const veiculo = c.fonte.trim().toLowerCase();
  const titulo = normalizarTitulo(c.titulo);
  return `${veiculo}|${c.publicadaEm}|${titulo}`;
}

/** Termos de elegibilidade eleitoral DF 2026 para filtrar descobertas. */
const TERMOS_ELEITORAIS_DF = [
  'eleição 2026',
  'eleicoes 2026',
  'eleições 2026',
  'eleicao 2026',
  'governador df',
  'governador do df',
  'senador df',
  'senador do df',
  'deputado federal df',
  'deputado distrital df',
  'cenario 2026',
  'cenário 2026',
  'candidato df',
  'candidata df',
  'pré-candidato',
  'pre-candidato',
  'pré-candidata',
  'pre-candidata',
  'nominata',
  'cldf 2026',
  'câmara legislativa 2026',
  'camara legislativa 2026',
];

/** Indica se o título/resumo é relevante para eleições 2026 no DF. */
export function isRelevanteEleitoral(titulo: string, resumo: string = ''): boolean {
  const texto = normalizarTitulo(`${titulo} ${resumo}`);
  return TERMOS_ELEITORAIS_DF.some((t) => texto.includes(normalizarTitulo(t)));
}

/** Sugere tipo editorial a partir do título/resumo (o agente confirma). */
function sugerirTipo(titulo: string, resumo: string = ''): TipoNoticiaEleitoral {
  const texto = normalizarTitulo(`${titulo} ${resumo}`);
  if (texto.includes('registro') || texto.includes('divulcacand') || texto.includes('tse')) {
    return 'registro_oficial';
  }
  if (texto.includes('anunciou') || texto.includes('anuncia') || texto.includes('nominata') || texto.includes('filiação') || texto.includes('filiacao')) {
    return 'anuncio_partidario';
  }
  if (texto.includes('pré-candidato') || texto.includes('pre-candidato') || texto.includes('pré-candidata') || texto.includes('pre-candidata') || texto.includes('pretende') || texto.includes('vai concorrer')) {
    return 'pre_candidatura';
  }
  if (texto.includes('movimentação') || texto.includes('movimentacao') || texto.includes('reunião') || texto.includes('reuniao') || texto.includes('articula')) {
    return 'movimentacao_publica';
  }
  if (texto.includes('posição') || texto.includes('posicao') || texto.includes('pesquisa') || texto.includes('intenção de voto') || texto.includes('intencao de voto')) {
    return 'posicao_politica';
  }
  if (texto.includes('cldf') || texto.includes('câmara legislativa') || texto.includes('camara legislativa') || texto.includes('projeto') || texto.includes('votação') || texto.includes('votacao')) {
    return 'atividade_legislativa';
  }
  return 'outro';
}

/** Sugere cargos relacionados a partir do título/resumo (o agente confirma). */
function sugerirCargos(titulo: string, resumo: string = ''): CargoEleitoral[] {
  const texto = normalizarTitulo(`${titulo} ${resumo}`);
  const cargos: CargoEleitoral[] = [];
  if (texto.includes('governador') || texto.includes('governadora')) {
    cargos.push('governador');
    if (texto.includes('vice')) cargos.push('vice_governador');
  }
  if (texto.includes('senador') || texto.includes('senadora')) cargos.push('senador');
  if (texto.includes('deputado federal')) cargos.push('deputado_federal');
  if (texto.includes('deputado distrital') || texto.includes('distrital')) cargos.push('deputado_distrital');
  return cargos;
}

/** Categoria da fonte a partir da origem de descoberta. */
function categoriaDaFonte(origemDescoberta: string): CategoriaFonte {
  if (origemDescoberta === 'google_news_rss') return 'google_news_rss';
  return 'veiculo_jornalistico';
}

// --- Função principal de descoberta ---------------------------------------

/**
 * Coleta candidatos a notícias eleitorais a partir de itens brutos de
 * descoberta (ex.: itens de Google News RSS ou feeds diretos de veículos).
 *
 * Aplica: filtro de janela de sete dias, filtro de relevância eleitoral DF,
 * rejeição de links genéricos (homepage), deduplicação por URL canônica e por
 * pauta/veículo/data, e normalização de datas. Retorna candidatos em buffer
 * separado — NÃO publica em src/data/noticias.ts.
 *
 * @param itensBrutos Itens brutos do feed/agregador.
 * @param existentes Candidatos já descobertos em ciclos anteriores (para
 *   deduplicação cross-ciclo). Não lê de src/data/noticias.ts: a descoberta é
 *   independente do que já foi publicado, mas deduplica contra descobertas
 *   pendentes anteriores para não reemitir o mesmo candidato.
 * @param dataReferencia Data ISO de referência para a janela (default: hoje).
 */
export function coletarDescobertaNoticias(
  itensBrutos: ItemBrutoDescoberta[],
  existentes: CandidatoNoticia[] = [],
  dataReferencia: string = new Date().toISOString().slice(0, 10),
): ResultadoDescoberta {
  const candidatos: CandidatoNoticia[] = [];
  const descartados: { url: string; motivo: string }[] = [];

  if (!isIsoDate(dataReferencia)) {
    return { candidatos, descartados, dataReferencia };
  }

  const limite = new Date(dataReferencia);
  limite.setUTCDate(limite.getUTCDate() - JANELA_DESCOBERTA_DIAS);
  const limiteStr = limite.toISOString().slice(0, 10);

  // Chaves de deduplicação contra descobertas pendentes anteriores.
  const urlsCanonicas = new Set<string>(
    existentes.map((c) => normalizarUrlCanonica(c.url)),
  );
  const chavesPauta = new Set<string>(existentes.map(chavePautaVeiculoData));

  // Chaves de deduplicação dentro deste ciclo.
  const urlsCiclo = new Set<string>();
  const pautasCiclo = new Set<string>();

  let contador = 0;

  for (const item of itensBrutos) {
    const url = (item.url || '').trim();
    if (!url || !/^https?:\/\//.test(url)) {
      descartados.push({ url: url || '(vazia)', motivo: 'URL ausente ou inválida' });
      continue;
    }
    if (isGenericLink(url)) {
      descartados.push({ url, motivo: 'link genérico (homepage) — não é evidência' });
      continue;
    }

    const publicadaEm = normalizarData(item.publicadaEm);
    if (!publicadaEm) {
      descartados.push({ url, motivo: 'data de publicação inválida' });
      continue;
    }
    if (publicadaEm < limiteStr || publicadaEm > dataReferencia) {
      descartados.push({ url, motivo: `fora da janela de ${JANELA_DESCOBERTA_DIAS} dias (publicadaEm=${publicadaEm})` });
      continue;
    }

    const titulo = (item.titulo || '').trim();
    if (!titulo) {
      descartados.push({ url, motivo: 'título ausente' });
      continue;
    }

    if (!isRelevanteEleitoral(titulo, item.resumo)) {
      descartados.push({ url, motivo: 'não relevante para eleições 2026 no DF' });
      continue;
    }

    const urlCanonica = normalizarUrlCanonica(url);
    const chavePauta = chavePautaVeiculoData({
      fonte: item.fonte,
      publicadaEm,
      titulo,
    });

    if (urlsCanonicas.has(urlCanonica) || urlsCiclo.has(urlCanonica)) {
      descartados.push({ url, motivo: 'URL canônica duplicada' });
      continue;
    }
    if (chavesPauta.has(chavePauta) || pautasCiclo.has(chavePauta)) {
      descartados.push({ url, motivo: 'pauta/veículo/data duplicada' });
      continue;
    }

    urlsCiclo.add(urlCanonica);
    pautasCiclo.add(chavePauta);

    contador += 1;
    candidatos.push({
      id: `c${contador}`,
      titulo,
      resumo: (item.resumo || '').trim(),
      fonte: (item.fonte || '').trim(),
      fonteCategoria: categoriaDaFonte(item.origemDescoberta),
      url: urlCanonica,
      tipo: sugerirTipo(titulo, item.resumo),
      cargos: sugerirCargos(titulo, item.resumo),
      pessoasRelacionadas: [],
      publicadaEm,
      coletadaEm: dataReferencia,
      origemDescoberta: item.origemDescoberta,
    });
  }

  return { candidatos, descartados, dataReferencia };
}

// --- Parser de Google News RSS (mecanismo de descoberta, prioridade 6) ----

/**
 * Extrai itens brutos de um XML de Google News RSS.
 *
 * O Google News RSS é SOMENTE mecanismo de descoberta (prioridade 6 do brief):
 * ele aponta para a matéria específica no veículo, nunca para a homepage do
 * agregador. O parser é tolerante e não depende de bibliotecas externas —
 * usa regex simples sobre o XML, suficiente para o formato estável do RSS do
 * Google News. Não realiza requisições de rede; o chamador é responsável por
 * obter o XML (ex.: via fetch) e por respeitar limites e robots.txt.
 *
 * @param xml String XML do feed Google News RSS.
 * @param origemDescoberta Rótulo da origem (default: "google_news_rss").
 */
export function parseGoogleNewsRss(
  xml: string,
  origemDescoberta: string = 'google_news_rss',
): ItemBrutoDescoberta[] {
  const itens: ItemBrutoDescoberta[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match: RegExpExecArray | null;
  while ((match = itemRegex.exec(xml)) !== null) {
    const bloco = match[1];
    const titulo = extrairTag(bloco, 'title');
    const link = extrairTag(bloco, 'link') || extrairTag(bloco, 'guid');
    const pubDate = extrairTag(bloco, 'pubDate');
    const description = extrairTag(bloco, 'description');
    const source = extrairTag(bloco, 'source');

    if (!titulo || !link) continue;

    // O <source> do Google News RSS identifica o veículo; fallback para domínio.
    let fonte = source || '';
    if (!fonte) {
      try {
        fonte = new URL(link).hostname.replace(/^www\./, '');
      } catch {
        fonte = 'Google News';
      }
    }

    itens.push({
      titulo,
      url: link,
      fonte,
      publicadaEm: pubDate || new Date().toISOString(),
      resumo: description || '',
      origemDescoberta,
    });
  }
  return itens;
}

function extrairTag(bloco: string, tag: string): string | null {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const m = bloco.match(re);
  if (!m) return null;
  // Decodifica entidades básicas e remove CDATA.
  return m[1]
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

// --- Buffer de descobertas pendentes (estado em memória, não publicado) ---

/**
 * Buffer em memória de descobertas pendentes de revisão.
 *
 * NÃO é persistido em src/data/noticias.ts. O agente revisa os candidatos e
 * promove manualmente os aprovados para a base publicada. Este buffer existe
 * apenas para deduplicação cross-ciclo dentro de uma mesma execução de
 * descoberta — não sobrevive a reinícios e não é fonte de verdade editorial.
 */
let bufferDescobertasPendentes: CandidatoNoticia[] = [];

/** Adiciona candidatos ao buffer de pendentes (não publica). */
export function adicionarDescobertasPendentes(
  novos: CandidatoNoticia[],
): CandidatoNoticia[] {
  bufferDescobertasPendentes = [...bufferDescobertasPendentes, ...novos];
  return bufferDescobertasPendentes;
}

/** Lista candidatos pendentes de revisão (somente leitura). */
export function listarDescobertasPendentes(): CandidatoNoticia[] {
  return [...bufferDescobertasPendentes];
}

/** Remove um candidato do buffer após revisão (promoção ou rejeição). */
export function removerDescobertaPendente(id: string): void {
  bufferDescobertasPendentes = bufferDescobertasPendentes.filter((c) => c.id !== id);
}

/** Limpa o buffer de pendentes (usado em testes). */
export function limparDescobertasPendentes(): void {
  bufferDescobertasPendentes = [];
}
