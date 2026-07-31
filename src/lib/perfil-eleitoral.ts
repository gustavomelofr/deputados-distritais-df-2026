// Lógica pura do perfil eleitoral individual — usada pelo server component
// da página /perfil-eleitoral/[slug].
//
// Este módulo NÃO tem `'use client'`: é puro e pode ser invocado em server
// components durante o prerender. Ele agrega dados já validados da base
// eleitoral independente (cenario-eleitoral.ts) com:
//
//   1. Foto atribuída ou placeholder honesto (foto-placeholder.ts);
//   2. Mapeamento para a foto CLDF já auditada (auditoria-fotos.ts) quando o
//      slug do nome monitorado coincide com o slug de um deputado distrital
//      em exercício — preservando a rastreabilidade da auditoria;
//   3. Notícias relacionadas da base validada (noticias.ts);
//
// Nada aqui inventa pessoa, partido, cargo, estágio, evidência, notícia,
// data ou link. Cada fonte permanece identificável no próprio dado de
// origem. Quem renderiza o componente decide a apresentação visual.

import type {
  CargoEleitoral,
  CategoriaFonte,
  EstagioEleitoral,
  EvidenciaEleitoral,
  FotografiaEleitoral,
  Noticia,
  NoticiaEleitoral,
  PessoaEleitoral,
} from '@/types';
import {
  PLACEHOLDER_FONTE,
  PLACEHOLDER_FONTE_URL,
  PLACEHOLDER_LICENCA,
  PLACEHOLDER_VERIFICADA_EM,
} from '@/data/foto-placeholder';

// Constantes do arquivo /public/foto-placeholder.svg. Replicadas aqui para
// que o módulo não dependa de detalhes não-exportados de foto-placeholder.ts
// (que trata esses campos como detalhes internos do helper `placeholderFoto`).
const PLACEHOLDER_URL = '/foto-placeholder.svg';
const PLACEHOLDER_MIME = 'image/svg+xml';
const PLACEHOLDER_LARGURA = 240;
const PLACEHOLDER_ALTURA = 240;
import { cenarioEleitoral } from '@/data/cenario-eleitoral';

// ---------------------------------------------------------------------------
// Tipos públicos do perfil eleitoral.
// ---------------------------------------------------------------------------

/** Identidade humana-legível de uma pessoa no perfil. */
export interface IdentidadePerfil {
  id: string;
  slug: string;
  nome: string;
  nomeCompleto: string;
  cargo: CargoEleitoral;
  partido: string | null;
  estagio: EstagioEleitoral;
}

/**
 * Foto atribuída ao perfil, sempre presente. Pode ser uma foto real
 * (atribuída via auditoria) ou o placeholder honesto desta constante.
 * O consumidor sabe diferenciar pelo campo `placeholder: boolean`.
 */
export interface FotoPerfil {
  /** Fonte humana-legível da foto. */
  fonte: string;
  /** URL da fonte onde a licença/autorização está explícita. */
  urlFonte: string;
  /** URL específica da imagem servida. */
  url: string;
  /** MIME reportado quando conhecido. */
  mime: string | null;
  /** Largura em pixels quando conhecida. */
  largura: number | null;
  /** Altura em pixels quando conhecida. */
  altura: number | null;
  /** Licença/base de uso conforme ordem de preferência do brief. */
  licenca: FotografiaEleitoral['licenca'];
  /** Data de verificação editorial (ISO 8601). */
  verificadaEm: string;
  /** Crédito/observação registrada na estrutura de origem. */
  credito: string | null;
  /** true quando a foto é o placeholder honesto desta constante. */
  placeholder: boolean;
}

/**
 * Notícia relacionada para o perfil — apenas os campos consumidos pela
 * página. Derivada de `noticias.ts` (base validada P1) filtrada por ID
 * dentro de `pessoa.noticiasRelacionadas`. Sem acréscimo de fatos.
 */
export interface NoticiaRelacionada {
  id: string;
  titulo: string;
  fonte: string;
  fonteCategoria: CategoriaFonte;
  url: string;
  publicadaEm: string;
  /** Resumo factual; não pode acrescentar fatos ausentes na fonte. */
  resumo: string;
}

/**
 * Link oficial confirmado em fonte institucional. Apenas links cuja fonte
 * é conhecida e foi validada pela origem do dado. Sem hotlink de imprensa
 * sem licença.
 */
export interface LinkOficialPerfil {
  /** Rótulo humano-legível (ex.: "Instagram", "CLDF"). */
  rotulo: string;
  /** URL canônica (HTTPS, sem query/hash/tracking). */
  url: string;
  /** Fonte institucional que PUBLICA o link. */
  fonte: string;
  /** URL da fonte institucional quando distinta da URL do link. */
  urlFonte: string;
}

/**
 * Item unificado da timeline cronológica — combina evidências e notícias
 * em uma única sequência temporal. Cada item preserva sua origem (evidência
 * ou notícia) e todos os campos de data exigidos pelo brief.
 */
export interface ItemTimeline {
  tipo: 'evidencia' | 'noticia';
  id: string;
  dataOrdenacao: string;
  cargo: CargoEleitoral | null;
  estagio: EstagioEleitoral | null;
  partido: string | null;
  titulo: string;
  descricao: string;
  fonte: string;
  fonteCategoria: CategoriaFonte;
  url: string;
  publicadaEm: string;
  coletadaEm: string;
  verificadaEm: string;
}

/**
 * Agregação completa do perfil eleitoral individual. Todos os campos são
 * derivados de dados já validados; nada é inventado. Quem consome decide
 * a apresentação visual.
 */
export interface PerfilEleitoral {
  identidade: IdentidadePerfil;
  foto: FotoPerfil;
  /** Histórico completo de evidências da pessoa (P3). */
  historicoEvidencias: EvidenciaEleitoral[];
  /** Evidência mais recente — usada em destaque no topo do perfil. */
  evidenciaDestaque: EvidenciaEleitoral;
  noticias: NoticiaRelacionada[];
  linksOficiais: LinkOficialPerfil[];
  /** Timeline cronológica unificada de evidências e notícias. */
  timeline: ItemTimeline[];
  /**
   * Total de evidências registradas para esta pessoa. Útil para mostrar a
   * evolução histórica em uma única linha ("X evidências com fonte e data").
   */
  totalEvidencias: number;
  /**
   * Data ISO 8601 da evidência mais recente. Para ordenação e rótulo
   * factual ("evidência mais recente em dd/mm/aaaa").
   */
  dataEvidenciaMaisRecente: string;
}

// ---------------------------------------------------------------------------
// Implementação
// ---------------------------------------------------------------------------

/**
 * Constrói a foto atribuída ao perfil. Regras:
 *
 *   - Retorna sempre o placeholder honesto até que exista foto verificada
 *     especificamente para a pessoa e o contexto eleitoral/cargo monitorado.
 *     O vínculo automático por slug com a auditoria CLDF foi removido para
 *     evitar retrato de mandato em exercício como foto de pré-candidatura.
 *
 * Nenhuma foto é fabricada. A proveniência do placeholder permanece no objeto.
 */
export function fotoParaPerfil(_pessoa: PessoaEleitoral): FotoPerfil {
  return {
    fonte: PLACEHOLDER_FONTE,
    urlFonte: PLACEHOLDER_FONTE_URL,
    url: PLACEHOLDER_URL,
    mime: PLACEHOLDER_MIME,
    largura: PLACEHOLDER_LARGURA,
    altura: PLACEHOLDER_ALTURA,
    licenca: PLACEHOLDER_LICENCA,
    verificadaEm: PLACEHOLDER_VERIFICADA_EM,
    credito:
      'Foto pendente de verificação para o cargo pretendido em 2026 — placeholder honesto. Nenhuma foto institucional ou de imprensa com licença explícita foi anexada ao registro atual.',
    placeholder: true,
  };
}

/**
 * Seleciona a evidência de destaque do perfil — a mais recente por
 * `dataEvidencia` (ISO 8601). Estável, determinística e sem criar dado
 * novo. Quando há empate, mantém a ordem de aparição no array.
 */
export function evidenciaDestaqueParaPerfil(
  pessoa: PessoaEleitoral,
): EvidenciaEleitoral {
  if (pessoa.evidencias.length === 0) {
    // Defesa: o brief exige evidência para entrar na base. Se a pessoa
    // foi parar no perfil sem evidência, retorna um placeholder mínimo
    // para evitar null pointer; nunca usamos isto para publicar.
    throw new Error(
      `Pessoa '${pessoa.id}' sem evidências — base não íntegra.`,
    );
  }
  return pessoa.evidencias
    .slice()
    .sort((a, b) => b.dataEvidencia.localeCompare(a.dataEvidencia))[0];
}

/**
 * Filtra notícias da base por `pessoa.noticiasRelacionadas`. Apenas IDs
 * existentes são mantidos; entradas inválidas são descartadas com aviso
 * via log silencioso (não inventamos notícia).
 */
export function noticiasRelacionadasParaPerfil(
  pessoa: PessoaEleitoral,
  noticias: ReadonlyArray<Noticia | NoticiaEleitoral>,
): NoticiaRelacionada[] {
  const ids = new Set(pessoa.noticiasRelacionadas);
  const resultado: NoticiaRelacionada[] = [];
  for (const id of ids) {
    const noticia = noticias.find((n) => n.id === id);
    if (!noticia) continue;
    resultado.push({
      id: noticia.id,
      titulo: noticia.titulo,
      fonte: noticia.fonte,
      fonteCategoria:
        (noticia as NoticiaEleitoral).fonteCategoria ?? 'veiculo_jornalistico',
      url: noticia.url,
      publicadaEm:
        (noticia as NoticiaEleitoral).publicadaEm ??
        (noticia as Noticia).data ??
        '',
      resumo: noticia.resumo,
    });
  }
  return resultado;
}

/**
 * Constrói a lista de links oficiais do perfil a partir do próprio registro
 * `linksOficiais` da pessoa (P3) e da auditoria de Instagram (P4). Apenas
 * links cuja fonte é conhecida são retornados.
 *
 * Não inventamos links. Quando a pessoa não possui `linksOficiais`
 * registrado nem slug coincidente com a auditoria de Instagram, a lista
 * pode ser vazia — nesse caso a UI mostra estado honesto "sem links
 * oficiais catalogados".
 */
export interface OrigemLinkInstagram {
  readonly slug: string;
  readonly handle: string;
  readonly url: string;
  readonly fonte: string;
  readonly urlFonte: string;
  readonly verificadaEm: string;
}

export function linksOficiaisParaPerfil(
  pessoa: PessoaEleitoral,
  auditoriaInstagram: ReadonlyArray<OrigemLinkInstagram>,
): LinkOficialPerfil[] {
  const links: LinkOficialPerfil[] = [];

  // Links do próprio registro (P3) — apenas quando definidos.
  if (pessoa.linksOficiais) {
    const lo = pessoa.linksOficiais;
    if (lo.site) {
      links.push({
        rotulo: 'Site oficial',
        url: lo.site,
        fonte: 'Declaração pública / partido',
        urlFonte: lo.site,
      });
    }
    if (lo.instagram) {
      links.push({
        rotulo: 'Instagram',
        url: lo.instagram,
        fonte: 'Declaração pública / partido',
        urlFonte: lo.instagram,
      });
    }
    if (lo.twitter) {
      links.push({
        rotulo: 'Twitter/X',
        url: lo.twitter,
        fonte: 'Declaração pública / partido',
        urlFonte: lo.twitter,
      });
    }
    if (lo.camara) {
      links.push({
        rotulo: 'Câmara dos Deputados',
        url: lo.camara,
        fonte: 'Câmara dos Deputados',
        urlFonte: lo.camara,
      });
    }
    if (lo.senado) {
      links.push({
        rotulo: 'Senado Federal',
        url: lo.senado,
        fonte: 'Senado Federal',
        urlFonte: lo.senado,
      });
    }
    if (lo.cldf) {
      links.push({
        rotulo: 'CLDF — Câmara Legislativa do DF',
        url: lo.cldf,
        fonte: 'CLDF — Câmara Legislativa do DF',
        urlFonte: lo.cldf,
      });
    }
  }

  // Link do Instagram a partir da auditoria oficial P4, somente quando
  // existir e o slug coincidir (caso dos deputados distritais em exercício).
  const ig = auditoriaInstagram.find((i) => i.slug === pessoa.slug);
  if (ig) {
    // Evita duplicar quando o link já veio do próprio registro.
    if (!links.some((l) => l.url === ig.url)) {
      links.push({
        rotulo: 'Instagram',
        url: ig.url,
        fonte: ig.fonte,
        urlFonte: ig.urlFonte,
      });
    }
  }

  return links;
}

/**
 * Constrói a timeline cronológica unificada de evidências e notícias
 * relacionadas ao perfil. Combina ambos os tipos em uma única sequência
 * ordenada por data (mais antiga → mais recente), preservando todos os
 * campos de data exigidos pelo brief (publicadaEm/coletadaEm/verificadaEm).
 *
 * Regras:
 *  - Apenas itens já presentes em `pessoa.evidencias` e nas notícias
 *    relacionadas são incluídos — nada é inventado.
 *  - A ordenação é determinística: ISO 8601 (localeCompare preserva ordem
 *    cronológica em formato aaaa-mm-dd); empate fica pela ordem de aparição.
 *  - Campos ausentes usam string vazia (estado honesto para a UI).
 */
export function timelineParaPerfil(
  pessoa: PessoaEleitoral,
  noticias: ReadonlyArray<Noticia | NoticiaEleitoral>,
): ItemTimeline[] {
  const itens: ItemTimeline[] = [];

  for (const ev of pessoa.evidencias) {
    itens.push({
      tipo: 'evidencia',
      id: ev.id,
      dataOrdenacao: ev.dataEvidencia,
      cargo: ev.cargo,
      estagio: ev.estagio,
      partido: ev.partido ?? null,
      titulo: ev.descricao,
      descricao: ev.descricao,
      fonte: ev.fonte,
      fonteCategoria: ev.fonteCategoria,
      url: ev.url,
      publicadaEm: ev.dataEvidencia,
      coletadaEm: ev.coletadaEm,
      verificadaEm: ev.verificadaEm,
    });
  }

  const noticiasRelacionadas = noticiasRelacionadasParaPerfil(
    pessoa,
    noticias,
  );
  for (const n of noticiasRelacionadas) {
    itens.push({
      tipo: 'noticia',
      id: n.id,
      dataOrdenacao: n.publicadaEm,
      cargo: pessoa.cargo,
      estagio: null,
      partido: pessoa.partido ?? null,
      titulo: n.titulo,
      descricao: n.resumo,
      fonte: n.fonte,
      fonteCategoria: n.fonteCategoria,
      url: n.url,
      publicadaEm: n.publicadaEm,
      coletadaEm: '',
      verificadaEm: '',
    });
  }

  return itens.sort((a, b) => a.dataOrdenacao.localeCompare(b.dataOrdenacao));
}

/**
 * Constrói o perfil agregado completo de uma pessoa. Quando a pessoa não é
 * encontrada em `cenarioEleitoral`, retorna `null` (quem chama decide o 404).
 */
export function perfilEleitoralDePessoa(
  pessoa: PessoaEleitoral,
  noticias: ReadonlyArray<Noticia | NoticiaEleitoral>,
  auditoriaInstagram: ReadonlyArray<OrigemLinkInstagram>,
): PerfilEleitoral {
  const destaque = evidenciaDestaqueParaPerfil(pessoa);
  return {
    identidade: {
      id: pessoa.id,
      slug: pessoa.slug,
      nome: pessoa.nome,
      nomeCompleto: pessoa.nomeCompleto ?? pessoa.nome,
      cargo: pessoa.cargo,
      partido: pessoa.partido ?? null,
      estagio: pessoa.estagio,
    },
    foto: fotoParaPerfil(pessoa),
    historicoEvidencias: pessoa.evidencias,
    evidenciaDestaque: destaque,
    noticias: noticiasRelacionadasParaPerfil(pessoa, noticias),
    linksOficiais: linksOficiaisParaPerfil(pessoa, auditoriaInstagram),
    timeline: timelineParaPerfil(pessoa, noticias),
    totalEvidencias: pessoa.evidencias.length,
    dataEvidenciaMaisRecente: destaque.dataEvidencia,
  };
}

/**
 * Localiza uma pessoa na base eleitoral pelo slug. Retorna `null` quando
 * o slug não corresponde a nenhum registro — usado pelo server component
 * para decidir entre renderizar o perfil ou chamar `notFound()`.
 */
export function pessoaEleitoralPorSlug(
  slug: string,
): PessoaEleitoral | null {
  return cenarioEleitoral.find((p) => p.slug === slug) ?? null;
}

/**
 * Lista os slugs válidos para `generateStaticParams` — apenas pessoas com
 * evidência (a base eleitoral só publica pessoas com fonte específica).
 */
export function slugsPerfilEleitoral(): string[] {
  return cenarioEleitoral
    .filter((p) => p.evidencias.length > 0)
    .map((p) => p.slug);
}

// ---------------------------------------------------------------------------
// Helpers de apresentação — puros, sem JSX, para uso em server ou client.
// ---------------------------------------------------------------------------

/** Formata ISO 8601 (aaaa-mm-dd) em dd/mm/aaaa. */
export function formatarDataPerfil(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return iso;
  return `${m[3]}/${m[2]}/${m[1]}`;
}

/** Rótulo humano-legível do cargo, derivado do schema. */
export function rotuloCargo(cargo: CargoEleitoral): string {
  switch (cargo) {
    case 'governador':
      return 'Governador';
    case 'vice_governador':
      return 'Vice-governador';
    case 'senador':
      return 'Senador';
    case 'deputado_federal':
      return 'Deputado federal';
    case 'deputado_distrital':
      return 'Deputado distrital';
  }
}

/** Rótulo humano-legível do estágio, derivado do schema. */
export function rotuloEstagio(estagio: EstagioEleitoral): string {
  switch (estagio) {
    case 'nome_monitorado':
      return 'Nome monitorado';
    case 'pre_candidatura_declarada':
      return 'Pré-candidatura declarada';
    case 'anunciado_pelo_partido':
      return 'Anunciado pelo partido';
    case 'movimentacao_publica':
      return 'Movimentação pública';
    case 'registro_oficial':
      return 'Registro oficial (TSE)';
  }
}

/** Classes Tailwind para badge do estágio. */
export function classesEstagioPerfil(estagio: EstagioEleitoral): string {
  switch (estagio) {
    case 'registro_oficial':
      return 'bg-green-100 text-green-700';
    case 'pre_candidatura_declarada':
    case 'anunciado_pelo_partido':
      return 'bg-blue-100 text-blue-700';
    case 'movimentacao_publica':
      return 'bg-amber-100 text-amber-700';
    case 'nome_monitorado':
      return 'bg-zinc-200 text-zinc-700';
  }
}

/** Rótulo humano-legível da categoria de fonte (P1 do brief). */
export function rotuloFonteCategoria(c: CategoriaFonte): string {
  switch (c) {
    case 'tse_divulcacand_tre':
      return 'TSE/DivulgaCand/TRE';
    case 'orgaos_publicos':
      return 'Órgãos públicos';
    case 'partido_oficial':
      return 'Partido oficial';
    case 'declaracao_pessoa':
      return 'Declaração da pessoa';
    case 'veiculo_jornalistico':
      return 'Veículo jornalístico';
    case 'google_news_rss':
      return 'Google News RSS';
  }
}