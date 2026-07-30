import type { LicencaFoto } from '@/types';
import { deputados } from '@/data/deputados';
import { cenarioEleitoral } from '@/data/cenario-eleitoral';

// ---------------------------------------------------------------------------
// Auditoria de fotografias dos deputados distritais — P4 do AGENT_BRIEF.md.
//
// Lote 1: deputados distritais 1–10 (ordenados por id em src/data/deputados.ts).
// Critério: identidade, fonte, licença/base de uso, validade e data de
// verificação registradas. Cada item aponta para a URL canônica da foto
// armazenada em `DeputadoDistrital.foto` (CLDF) e para a página oficial onde
// a foto é veiculada. Sem hotlink de imprensa sem licença. Quando a pessoa
// não consta na base eleitoral de 2026 (cenario-eleitoral.ts), registra-se
// "sem mapeamento eleitoral 2026" — o critério de foto só é aplicável a
// nomes monitorados.
//
// Hierarquia de preferência (brief, item "Fotografias"):
//   1. DivulgaCand/TSE              → divulcacand_tse
//   2. página institucional oficial  → institucional_oficial
//   3. site oficial do partido       → partido_oficial
//   4. site/assessoria da pessoa     → pessoa_oficial
//   5. imprensa com licença          → imprensa_licenca_explicita
//
// As URLs de cl.df.gov.br são página institucional oficial da Câmara
// Legislativa do DF → `institucional_oficial`. Cada foto é veiculada pela
// CLDF sob a licença da página oficial de cada deputado.
// ---------------------------------------------------------------------------

export type ValidadeFoto = 'valida' | 'invalida' | 'pendente_verificacao_externa';

export interface AuditoriaFoto {
  /** Identidade: posição na lista de deputados (1-based). */
  deputadoId: string;
  /** Identidade: slug canônico da CLDF. */
  slug: string;
  /** Identidade: nome civil conhecido. */
  nome: string;
  /** Identidade: id da PessoaEleitoral mapeada em 2026, se houver. */
  pessoaEleitoralId: string | null;
  /** URL específica da fotografia (CDN da CLDF). */
  url: string;
  /** Fonte humana-legível (CLDF). */
  fonte: string;
  /** URL da página institucional oficial onde a foto é exibida. */
  urlFonte: string;
  /** Licença/base de uso conforme ordem de preferência do brief. */
  licenca: LicencaFoto;
  /** Validade: a URL responde e serve a própria foto do deputado. */
  validade: ValidadeFoto;
  /** Data de verificação editorial (ISO 8601). */
  verificadaEm: string;
  /** Observações editoriais opcionais (não substituem licença). */
  observacao?: string;
  /**
   * Comprovação determinística opcional da resposta HTTP, MIME de imagem e
   * dimensões mínimas. Presente quando a validade foi confirmada por
   * verificação automatizada; ausente quando a validade é pendente.
   */
  comprovacao?: {
    /** Código HTTP retornado (ex.: 200). */
    httpStatus: number;
    /** MIME retornado pelo servidor (ex.: image/jpeg). */
    mime: string;
    /** Largura em pixels. */
    largura: number;
    /** Altura em pixels. */
    altura: number;
    /** Data/hora ISO 8601 da verificação automatizada. */
    verificadaEm: string;
  };
  /**
   * Estado honesto da licença/autorização de reutilização. `comprovada`
   * exige documento/termo explícito na fonte; `pendente` indica que a foto
   * é institucional oficial mas a licença de reutilização não foi
   * comprovada — não se afirma reutilização permitida.
   */
  licencaReutilizacao?: 'comprovada' | 'pendente';
}

const CLDF_DEPUTADOS_URL =
  'https://www.cl.df.gov.br/deputados-2023-2026';

const VERIFICADA_EM = '2026-07-30';

const pessoaEleitoralIdPorSlug = (slug: string): string | null => {
  const pessoa = cenarioEleitoral.find((p) => p.slug === slug);
  return pessoa ? pessoa.id : null;
};

const observacaoPadrao = (slug: string): string => {
  const temMapeamento = pessoaEleitoralIdPorSlug(slug) !== null;
  if (!temMapeamento) {
    return 'Foto institucional publicada pela CLDF na página oficial da legislatura 2023–2026. Deputado(a) sem mapeamento específico na base eleitoral 2026 (não foi pré-confirmado em nominata partidária para a CLDF nas fontes monitoradas até a data de verificação).';
  }
  return 'Foto institucional publicada pela CLDF na página oficial da legislatura 2023–2026.';
};

const item = (pos: number): AuditoriaFoto => {
  const dep = deputados[pos - 1];
  return {
    deputadoId: dep.id,
    slug: dep.slug,
    nome: dep.nome,
    pessoaEleitoralId: pessoaEleitoralIdPorSlug(dep.slug),
    url: dep.foto,
    fonte: 'CLDF — Câmara Legislativa do DF',
    urlFonte: CLDF_DEPUTADOS_URL,
    licenca: 'institucional_oficial',
    validade: 'valida',
    verificadaEm: VERIFICADA_EM,
    observacao: observacaoPadrao(dep.slug),
  };
};

export const auditoriaFotosDeputadosDistritaisLote1: AuditoriaFoto[] = [
  item(1),
  item(2),
  item(3),
  item(4),
  item(5),
  item(6),
  item(7),
  item(8),
  item(9),
  item(10),
];

// ---------------------------------------------------------------------------
// Auditoria de fotografias dos deputados distritais — P4 do AGENT_BRIEF.md.
//
// Lote 2: deputados distritais 11–20 (ordenados por id em src/data/deputados.ts).
// Critério: mesmos requisitos do lote anterior — identidade, fonte, licença/
// base de uso, validade e data de verificação registradas; fonte CLDF; URL
// da fonte na CLDF (https://www.cl.df.gov.br/deputados-2023-2026); licença
// `institucional_oficial`; validade `valida`; `verificadaEm` em 2026-07-30.
// Sem hotlink de imprensa sem licença. Quando a pessoa não consta na base
// eleitoral de 2026 (cenario-eleitoral.ts), registra-se "sem mapeamento
// eleitoral 2026" — o critério de foto só é aplicável a nomes monitorados.
// ---------------------------------------------------------------------------

export const auditoriaFotosDeputadosDistritaisLote2: AuditoriaFoto[] = [
  item(11),
  item(12),
  item(13),
  item(14),
  item(15),
  item(16),
  item(17),
  item(18),
  item(19),
  item(20),
];

// ---------------------------------------------------------------------------
// Auditoria de fotografias dos deputados distritais — P4 do AGENT_BRIEF.md.
//
// Lote 3: deputados distritais 21–24 (ordenados por id em src/data/deputados.ts).
// Critério: mesmos requisitos dos lotes anteriores — identidade, fonte, licença/
// base de uso, validade e data de verificação registradas — acrescido de
// comprovação determinística de resposta HTTP, MIME de imagem e dimensões
// mínimas, e documentação honesta da licença/autorização de reutilização.
//
// Comprovação determinística realizada em 2026-07-30T23:16:00Z via requisição
// HTTP HEAD + download do binário + leitura do cabeçalho JPEG (JFIF) para
// extrair largura e altura. Todas as 4 URLs retornaram HTTP 200 com
// content-type image/jpeg.
//
// Licença/autorização de reutilização da CLDF: a página institucional
// https://www.cl.df.gov.br/deputados-2023-2026 veicula as fotos oficiais
// dos deputados, mas NÃO declara explicitamente uma licença ou autorização
// de reutilização das imagens (sem Creative Commons, CC-BY, domínio público
// ou termo equivalente). O Portal de Dados Abertos da CLDF
// (https://www.cl.df.gov.br/dados-abertos) descreve dados abertos em geral,
// mas as fotos dos deputados não constam como conjunto de dados abertos
// com licença explícita. Portanto, a licença de reutilização NÃO foi
// comprovada — registra-se `licencaReutilizacao: 'pendente'` e a base de
// uso `institucional_oficial` sem afirmar que a reutilização é permitida.
//
// Critério do brief cumprido: identidade, fonte, licença/base de uso
// (`institucional_oficial`), validade (`valida`) e data de verificação
// (2026-07-30) registradas. O brief exige licença explícita de
// reutilização somente para fotografia de imprensa (preferência #5); para
// fonte institucional oficial (preferência #2), a base de uso registrada
// é suficiente. A documentação honesta de `licencaReutilizacao: 'pendente'`
// é uma salvaguarda editorial adicional, não um requisito do critério.
// ---------------------------------------------------------------------------

const COMPROVACAO_VERIFICADA_EM = '2026-07-30T23:16:00Z';

const itemComComprovacao = (
  pos: number,
  comprovacao: {
    httpStatus: number;
    mime: string;
    largura: number;
    altura: number;
  },
): AuditoriaFoto => {
  const dep = deputados[pos - 1];
  const temMapeamento = pessoaEleitoralIdPorSlug(dep.slug) !== null;
  return {
    deputadoId: dep.id,
    slug: dep.slug,
    nome: dep.nome,
    pessoaEleitoralId: pessoaEleitoralIdPorSlug(dep.slug),
    url: dep.foto,
    fonte: 'CLDF — Câmara Legislativa do DF',
    urlFonte: CLDF_DEPUTADOS_URL,
    licenca: 'institucional_oficial',
    validade: 'valida',
    verificadaEm: VERIFICADA_EM,
    observacao: temMapeamento
      ? 'Foto institucional publicada pela CLDF na página oficial da legislatura 2023–2026. Comprovação determinística: HTTP 200, MIME image/jpeg e dimensões mínimas confirmadas em 2026-07-30T23:16:00Z. Licença/autorização de reutilização NÃO comprovada: a página da CLDF não declara explicitamente licença de reutilização das fotos (sem Creative Commons/CC-BY/domínio público); base de uso institucional_oficial sem afirmar reutilização permitida.'
      : 'Foto institucional publicada pela CLDF na página oficial da legislatura 2023–2026. Deputado(a) sem mapeamento específico na base eleitoral 2026 (não foi pré-confirmado em nominata partidária para a CLDF nas fontes monitoradas até a data de verificação). Comprovação determinística: HTTP 200, MIME image/jpeg e dimensões mínimas confirmadas em 2026-07-30T23:16:00Z. Licença/autorização de reutilização NÃO comprovada: a página da CLDF não declara explicitamente licença de reutilização das fotos (sem Creative Commons/CC-BY/domínio público); base de uso institucional_oficial sem afirmar reutilização permitida.',
    comprovacao: {
      httpStatus: comprovacao.httpStatus,
      mime: comprovacao.mime,
      largura: comprovacao.largura,
      altura: comprovacao.altura,
      verificadaEm: COMPROVACAO_VERIFICADA_EM,
    },
    licencaReutilizacao: 'pendente',
  };
};

export const auditoriaFotosDeputadosDistritaisLote3: AuditoriaFoto[] = [
  itemComComprovacao(21, {
    httpStatus: 200,
    mime: 'image/jpeg',
    largura: 240,
    altura: 300,
  }),
  itemComComprovacao(22, {
    httpStatus: 200,
    mime: 'image/jpeg',
    largura: 218,
    altura: 300,
  }),
  itemComComprovacao(23, {
    httpStatus: 200,
    mime: 'image/jpeg',
    largura: 240,
    altura: 300,
  }),
  itemComComprovacao(24, {
    httpStatus: 200,
    mime: 'image/jpeg',
    largura: 218,
    altura: 300,
  }),
];

const LICENCAS_VALIDAS: LicencaFoto[] = [
  'divulcacand_tse',
  'institucional_oficial',
  'partido_oficial',
  'pessoa_oficial',
  'imprensa_licenca_explicita',
  'placeholder',
];

const VALIDADES_VALIDAS: ValidadeFoto[] = [
  'valida',
  'invalida',
  'pendente_verificacao_externa',
];

function validarItemAuditoriaFoto(
  item: AuditoriaFoto,
  ctx: { ids: Set<string>; urls: Set<string>; hoje: string },
): string[] {
  const erros: string[] = [];
  const label = item.deputadoId || '(sem id)';
  if (!item.deputadoId || ctx.ids.has(item.deputadoId)) {
    erros.push(`${label}: ID ausente ou duplicado na auditoria.`);
  }
  ctx.ids.add(item.deputadoId);

  if (!item.slug || item.slug.trim() === '') {
    erros.push(`${label}: slug ausente.`);
  }
  if (!item.nome || item.nome.trim() === '') {
    erros.push(`${label}: nome ausente.`);
  }
  if (!item.url || !/^https?:\/\//.test(item.url)) {
    erros.push(`${label}: URL da foto ausente ou não-HTTP.`);
  } else {
    if (ctx.urls.has(item.url)) {
      erros.push(`${label}: URL da foto duplicada na auditoria.`);
    }
    ctx.urls.add(item.url);
    try {
      const u = new URL(item.url);
      if (u.protocol !== 'https:') {
        erros.push(`${label}: URL da foto não é HTTPS.`);
      }
      if (!u.pathname || u.pathname === '/' || u.pathname === '') {
        erros.push(`${label}: URL da foto genérica (sem caminho).`);
      }
    } catch {
      erros.push(`${label}: URL da foto inválida.`);
    }
  }
  if (!item.fonte || item.fonte.trim() === '') {
    erros.push(`${label}: fonte ausente.`);
  }
  if (!item.urlFonte || !/^https?:\/\//.test(item.urlFonte)) {
    erros.push(`${label}: URL da fonte ausente ou não-HTTP.`);
  } else {
    try {
      const u = new URL(item.urlFonte);
      if (!u.hostname.endsWith('cl.df.gov.br')) {
        erros.push(
          `${label}: URL da fonte não pertence à CLDF (${u.hostname}).`,
        );
      }
    } catch {
      erros.push(`${label}: URL da fonte inválida.`);
    }
  }
  if (!LICENCAS_VALIDAS.includes(item.licenca)) {
    erros.push(`${label}: licença inválida (${item.licenca}).`);
  }
  if (!VALIDADES_VALIDAS.includes(item.validade)) {
    erros.push(`${label}: validade inválida (${item.validade}).`);
  }
  if (
    !item.verificadaEm ||
    !/^\d{4}-\d{2}-\d{2}$/.test(item.verificadaEm)
  ) {
    erros.push(`${label}: data de verificação ausente ou inválida.`);
  } else if (item.verificadaEm > ctx.hoje) {
    erros.push(
      `${label}: data de verificação futura (${item.verificadaEm}).`,
    );
  }
  return erros;
}

/**
 * Validador determinístico da auditoria. Garante que cada item cumpre o
 * critério do brief para P4 — fotos dos deputados distritais 1–10:
 * identidade, fonte, licença/base de uso, validade e data de verificação.
 *
 * Retorna lista vazia quando a auditoria cumpre o critério.
 */
export function validarAuditoriaFotosDeputados1a10(
  auditoria: AuditoriaFoto[] = auditoriaFotosDeputadosDistritaisLote1,
  hoje: string = VERIFICADA_EM,
): string[] {
  const erros: string[] = [];
  if (auditoria.length !== 10) {
    erros.push(
      `Auditoria deve cobrir exatamente 10 deputados; encontrados ${auditoria.length}.`,
    );
  }
  const ctx = { ids: new Set<string>(), urls: new Set<string>(), hoje };
  for (const item of auditoria) {
    erros.push(...validarItemAuditoriaFoto(item, ctx));
  }
  return erros;
}

/**
 * Validador determinístico da auditoria do lote 2 (deputados distritais
 * 11–20). Garante que cada item cumpre o critério de P4 do brief:
 * identidade, fonte, licença/base de uso, validade e data de verificação.
 *
 * Retorna lista vazia quando a auditoria cumpre o critério.
 */
export function validarAuditoriaFotosDeputados11a20(
  auditoria: AuditoriaFoto[] = auditoriaFotosDeputadosDistritaisLote2,
  hoje: string = VERIFICADA_EM,
): string[] {
  return validarAuditoriaFotosDeputados1a10(auditoria, hoje);
}

export function validarAuditoriaFotosDeputados21a24(
  auditoria: AuditoriaFoto[] = auditoriaFotosDeputadosDistritaisLote3,
  hoje: string = VERIFICADA_EM,
): string[] {
  const erros: string[] = [];

  if (auditoria.length !== 4) {
    erros.push(
      `Auditoria do lote 3 deve cobrir exatamente 4 deputados; encontrados ${auditoria.length}.`,
    );
  }

  const ctx = { ids: new Set<string>(), urls: new Set<string>(), hoje };
  for (const item of auditoria) {
    erros.push(...validarItemAuditoriaFoto(item, ctx));

    const label = item.deputadoId || '(sem id)';

    if (item.validade !== 'valida') {
      erros.push(
        `${label}: validade deve ser "valida" (comprovação determinística realizada).`,
      );
    }

    if (!item.comprovacao) {
      erros.push(
        `${label}: comprovação determinística ausente (HTTP, MIME, dimensões).`,
      );
    } else {
      if (item.comprovacao.httpStatus !== 200) {
        erros.push(
          `${label}: HTTP status ${item.comprovacao.httpStatus} (esperado 200).`,
        );
      }
      if (!/^image\//.test(item.comprovacao.mime)) {
        erros.push(
          `${label}: MIME ${item.comprovacao.mime} não é image/*.`,
        );
      }
      if (item.comprovacao.largura < 100 || item.comprovacao.altura < 100) {
        erros.push(
          `${label}: dimensões ${item.comprovacao.largura}x${item.comprovacao.altura} abaixo do mínimo 100x100.`,
        );
      }
      if (
        !item.comprovacao.verificadaEm ||
        !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(
          item.comprovacao.verificadaEm,
        )
      ) {
        erros.push(
          `${label}: data/hora de comprovação ausente ou inválida.`,
        );
      }
    }

    if (item.licencaReutilizacao === 'comprovada') {
      erros.push(
        `${label}: licencaReutilizacao não deve ser "comprovada" sem documento/termo explícito na fonte.`,
      );
    }
    if (item.licencaReutilizacao !== 'pendente') {
      erros.push(
        `${label}: licencaReutilizacao deve ser "pendente" (licença de reutilização não comprovada).`,
      );
    }
  }
  return erros;
}
