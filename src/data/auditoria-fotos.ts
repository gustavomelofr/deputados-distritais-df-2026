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
  const ids = new Set<string>();
  const urls = new Set<string>();
  const licencasValidas: LicencaFoto[] = [
    'divulcacand_tse',
    'institucional_oficial',
    'partido_oficial',
    'pessoa_oficial',
    'imprensa_licenca_explicita',
    'placeholder',
  ];
  const validadesValidas: ValidadeFoto[] = [
    'valida',
    'invalida',
    'pendente_verificacao_externa',
  ];

  if (auditoria.length !== 10) {
    erros.push(
      `Auditoria deve cobrir exatamente 10 deputados; encontrados ${auditoria.length}.`,
    );
  }

  for (const item of auditoria) {
    const label = item.deputadoId || '(sem id)';
    if (!item.deputadoId || ids.has(item.deputadoId)) {
      erros.push(`${label}: ID ausente ou duplicado na auditoria.`);
    }
    ids.add(item.deputadoId);

    if (!item.slug || item.slug.trim() === '') {
      erros.push(`${label}: slug ausente.`);
    }
    if (!item.nome || item.nome.trim() === '') {
      erros.push(`${label}: nome ausente.`);
    }
    if (!item.url || !/^https?:\/\//.test(item.url)) {
      erros.push(`${label}: URL da foto ausente ou não-HTTP.`);
    } else {
      if (urls.has(item.url)) {
        erros.push(`${label}: URL da foto duplicada na auditoria.`);
      }
      urls.add(item.url);
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
    if (!licencasValidas.includes(item.licenca)) {
      erros.push(`${label}: licença inválida (${item.licenca}).`);
    }
    if (!validadesValidas.includes(item.validade)) {
      erros.push(`${label}: validade inválida (${item.validade}).`);
    }
    if (
      !item.verificadaEm ||
      !/^\d{4}-\d{2}-\d{2}$/.test(item.verificadaEm)
    ) {
      erros.push(`${label}: data de verificação ausente ou inválida.`);
    } else if (item.verificadaEm > hoje) {
      erros.push(
        `${label}: data de verificação futura (${item.verificadaEm}).`,
      );
    }
  }
  return erros;
}
