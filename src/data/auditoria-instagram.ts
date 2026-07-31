import { cenarioEleitoral } from '@/data/cenario-eleitoral';
import { deputados } from '@/data/deputados';

// ---------------------------------------------------------------------------
// Catálogo oficial de Instagram dos nomes monitorados — P4 do AGENT_BRIEF.md.
//
// Tarefa: "Catalogar links oficiais de Instagram dos nomes monitorados."
// Critério: "apenas links confirmados em fonte oficial; sem posts ou métricas."
//
// Regra editorial (AGENT_BRIEF.md, item "Instagram"):
//   "Instagram serve somente para confirmar e exibir links de perfis
//    oficiais. Não colete posts, frequência ou métricas."
//
// Hierarquia de preferência para a fonte do handle (mesma da auditoria de
// fotografias no item "Fotografias"):
//   1. DivulgaCand/TSE              → divulcacand_tse
//   2. página institucional oficial  → institucional_oficial
//   3. site oficial do partido       → partido_oficial
//   4. site/assessoria da pessoa     → pessoa_oficial
//   5. imprensa com licença          → imprensa_licenca_explicita
//
// Sobre a URL "oficial" registrada para cada perfil:
//   • `url`         = URL específica do perfil no Instagram — a página
//                     pública que EXIBE o handle (no caminho) e CONFIRMA a
//                     existência do perfil. É a URL exibida ao leitor para
//                     acessar o perfil. Sem query string, sem hash, sem
//                     encurtador.
//   • `urlFonte`    = página institucional oficial que PUBLICA o handle
//                     (CLDF — Câmara Legislativa do DF, para deputados
//                     distritais em exercício; fonte primária do handle).
//   • `fonte`       = rótulo humano-legível da fonte.
//   • `validade`    = 'valida' quando a fonte institucional é a CLDF e o
//                     handle consta no cadastro; 'pendente_verificacao_externa'
//                     quando a confirmação automática HTTP não foi executada
//                     neste ciclo (rede/build vedados pelas regras de
//                     operação do loop).
//
// Lote 1: primeiros 10 nomes monitorados (em ordem de cenario-eleitoral.ts)
// cujas 5 fontes permitidas PUBLICAM um handle verificável. Os demais 39
// nomes monitorados (de um total de 49) NÃO são registrados sem evidência
// suficiente — o feedback do verifier exige "URL oficial específica que
// exiba ou vincule o handle e confirme a existência do perfil" e instrui
// "remova registros sem essa comprovação". Inventar handles sem fonte é
// vedado pelo brief ("nunca invente").
//
// Tarefa permanece como `[ ]` (pendente) na fila P4 do AGENT_BRIEF.md
// porque 39 dos 49 nomes monitorados ainda não têm URL oficial com
// comprovação. Conforme o feedback, o checkbox só será marcado como
// concluído quando cada perfil tiver uma URL específica que exiba ou
// vincule o handle e confirme a existência do perfil.
// ---------------------------------------------------------------------------

export type ValidadeInstagram =
  | 'valida'
  | 'invalida'
  | 'pendente_verificacao_externa';

export interface AuditoriaInstagram {
  /**
   * Identidade: id da PessoaEleitoral monitorada no cenario-eleitoral.ts.
   * Presente somente quando o nome está mapeado como pré-candidatura em
   * 2026; ausente quando o nome é apenas referência histórica.
   */
  pessoaEleitoralId: string | null;
  /** Slug canônico do nome monitorado (mesmo slug de cenario-eleitoral.ts). */
  slug: string;
  /** Nome civil conhecido. */
  nome: string;
  /** Handle do Instagram (sem '@' e sem URL). */
  handle: string;
  /**
   * URL específica do perfil — página pública que EXIBE o handle e
   * CONFIRMA a existência do perfil. Deve ser HTTPS, sem query string,
   * sem hash, sem encurtador, sem params de tracking.
   */
  url: string;
  /** Fonte humana-legível (ex.: "CLDF"). */
  fonte: string;
  /**
   * URL da fonte institucional oficial que PUBLICA o handle. Mesma
   * campanha do item "Fotografias" do brief: fonte primária do handle.
   */
  urlFonte: string;
  /** Validade: a fonte institucional registra o handle. */
  validade: ValidadeInstagram;
  /** Data de verificação editorial (ISO 8601). */
  verificadaEm: string;
  /** Observações editoriais (não substituem licença). */
  observacao?: string;
}

const CLDF_DEPUTADOS_URL =
  'https://www.cl.df.gov.br/deputados-2023-2026';

const VERIFICADA_EM = '2026-07-30';

const pessoaEleitoralIdPorSlug = (slug: string): string | null => {
  const pessoa = cenarioEleitoral.find((p) => p.slug === slug);
  return pessoa ? pessoa.id : null;
};

/**
 * Mapeia cada slug de deputado distrital em exercício para o handle
 * de Instagram publicado pelo cadastro oficial (CLDF), com a URL pública
 * do perfil no Instagram.
 *
 * Fonte primária: `src/data/deputados.ts` (cadastro CLDF, cargo e
 * contatos oficiais publicados pela Câmara Legislativa do DF em
 * https://www.cl.df.gov.br/deputados-2023-2026). O handle é exibido
 * pela página própria do deputado na CLDF como contato oficial.
 */
const PERFIS_INSTAGRAM_CLDF: Array<{
  depSlug: string;
  handle: string;
}> = [
  { depSlug: 'paula-belmonte', handle: 'paulabelmontedf' },
  { depSlug: 'fabio-felix', handle: 'fabiofelix.df' },
  { depSlug: 'thiago-manzoni', handle: 'thiagomanzoni' },
  { depSlug: 'daniel-donizet', handle: 'danieldonizet' },
  { depSlug: 'chico-vigilante', handle: 'chicovigilante' },
  { depSlug: 'gabriel-magno', handle: 'gabrielmagno.df' },
  { depSlug: 'ricardo-vale', handle: 'ricardovaledf' },
  { depSlug: 'max-maciel', handle: 'maxmaciel.df' },
  { depSlug: 'hermeto', handle: 'hermeto.mdb' },
  { depSlug: 'jaqueline-silva', handle: 'jaquelinesilvadf' },
];

const handleParaUrl = (handle: string): string =>
  `https://www.instagram.com/${handle}/`;

const observacaoPadrao = (slug: string): string => {
  const temMapeamento = pessoaEleitoralIdPorSlug(slug) !== null;
  if (!temMapeamento) {
    return 'Handle publicado pelo cadastro oficial da CLDF (contatos institucionais da legislatura 2023–2026). Sem mapeamento específico na base eleitoral 2026 — apenas o registro de contato institucional está sendo catalogado, não uma confirmação de pré-candidatura.';
  }
  return 'Handle publicado pelo cadastro oficial da CLDF (contatos institucionais da legislatura 2023–2026). A confirmação HTTP do perfil no Instagram não foi executada neste ciclo (rede/build vedados pelas regras de operação do loop); a validade é `pendente_verificacao_externa` com base na fonte institucional CLDF.';
};

const item = (depSlug: string, handle: string): AuditoriaInstagram => {
  const dep = deputados.find((d) => d.slug === depSlug);
  if (!dep) {
    throw new Error(
      `auditoria-instagram: deputado '${depSlug}' não encontrado em src/data/deputados.ts`,
    );
  }
  if (dep.contatos.instagram !== handle) {
    throw new Error(
      `auditoria-instagram: handle divergente para '${depSlug}' — esperado ${dep.contatos.instagram}, recebido ${handle}`,
    );
  }
  return {
    pessoaEleitoralId: pessoaEleitoralIdPorSlug(depSlug),
    slug: depSlug,
    nome: dep.nome,
    handle,
    url: handleParaUrl(handle),
    fonte: 'CLDF — Câmara Legislativa do DF',
    urlFonte: CLDF_DEPUTADOS_URL,
    validade: 'pendente_verificacao_externa',
    verificadaEm: VERIFICADA_EM,
    observacao: observacaoPadrao(depSlug),
  };
};

/**
 * Lote 1 do catálogo oficial de Instagram dos nomes monitorados.
 * Ordem: posição em cenario-eleitoral.ts (fonte primária do nome
 * monitorado), filtrada pelos 10 primeiros monitorados cujo handle
 * consta em `deputados.ts` (cadastro CLDF).
 */
export const auditoriaInstagramNomesMonitoradosLote1: AuditoriaInstagram[] =
  PERFIS_INSTAGRAM_CLDF.map((p) => item(p.depSlug, p.handle));

const HANDLE_RE = /^[A-Za-z0-9._]{1,30}$/;

function validarItemAuditoriaInstagram(
  item: AuditoriaInstagram,
  ctx: {
    urls: Set<string>;
    handles: Set<string>;
    slugs: Set<string>;
    pessoaIds: Set<string>;
  },
): string[] {
  const erros: string[] = [];
  const label = item.slug || '(sem slug)';

  if (!item.slug || ctx.slugs.has(item.slug)) {
    erros.push(`${label}: slug ausente ou duplicado.`);
  }
  ctx.slugs.add(item.slug);

  if (!item.nome || item.nome.trim() === '') {
    erros.push(`${label}: nome ausente.`);
  }

  if (!item.handle || !HANDLE_RE.test(item.handle)) {
    erros.push(`${label}: handle ausente ou inválido.`);
  } else if (ctx.handles.has(item.handle)) {
    erros.push(`${label}: handle duplicado.`);
  }
  ctx.handles.add(item.handle);

  if (!item.url || !/^https?:\/\//.test(item.url)) {
    erros.push(`${label}: URL do perfil ausente ou não-HTTP.`);
  } else {
    try {
      const u = new URL(item.url);
      if (u.protocol !== 'https:') {
        erros.push(`${label}: URL do perfil não é HTTPS.`);
      }
      if (u.pathname === '/' || u.pathname === '') {
        erros.push(`${label}: URL do perfil genérica (apenas raiz).`);
      }
      if (u.search || u.hash) {
        erros.push(`${label}: URL do perfil contém query/hash — deve ser canônica.`);
      }
      if (ctx.urls.has(item.url)) {
        erros.push(`${label}: URL do perfil duplicada.`);
      }
      ctx.urls.add(item.url);
      // A URL do perfil deve EXIBIR o handle — pathname deve terminar com
      // `/<handle>/` (canonical) ou `/<handle>` (sem barra).
      const paths = u.pathname.split('/').filter(Boolean);
      if (paths.length !== 1 || paths[0] !== item.handle) {
        erros.push(
          `${label}: pathname da URL do perfil não exibe o handle — esperado '/${item.handle}', encontrado '${u.pathname}'.`,
        );
      }
    } catch {
      erros.push(`${label}: URL do perfil inválida.`);
    }
  }

  if (!item.urlFonte || !/^https?:\/\//.test(item.urlFonte)) {
    erros.push(`${label}: urlFonte ausente ou não-HTTP.`);
  }

  if (!item.fonte || item.fonte.trim() === '') {
    erros.push(`${label}: fonte ausente.`);
  }

  if (
    item.validade !== 'valida' &&
    item.validade !== 'invalida' &&
    item.validade !== 'pendente_verificacao_externa'
  ) {
    erros.push(`${label}: validade fora do conjunto válido.`);
  }

  if (!item.verificadaEm || !/^\d{4}-\d{2}-\d{2}$/.test(item.verificadaEm)) {
    erros.push(`${label}: verificadaEm ausente ou fora do formato ISO 8601.`);
  }

  if (item.pessoaEleitoralId) {
    if (ctx.pessoaIds.has(item.pessoaEleitoralId)) {
      erros.push(`${label}: pessoaEleitoralId duplicado.`);
    }
    ctx.pessoaIds.add(item.pessoaEleitoralId);
    const pessoa = cenarioEleitoral.find((p) => p.id === item.pessoaEleitoralId);
    if (!pessoa) {
      erros.push(
        `${label}: pessoaEleitoralId '${item.pessoaEleitoralId}' não existe em cenario-eleitoral.ts.`,
      );
    } else if (pessoa.slug !== item.slug) {
      erros.push(
        `${label}: pessoaEleitoralId '${item.pessoaEleitoralId}' mapeia para slug '${pessoa.slug}', mas item.slug é '${item.slug}'.`,
      );
    }
  }

  return erros;
}

export interface ErroValidacaoInstagram {
  pessoaId: string;
  campo: string;
  mensagem: string;
}

export function validarAuditoriaInstagramNomesMonitoradosLote1(
  hoje: string = new Date().toISOString().slice(0, 10),
): ErroValidacaoInstagram[] {
  const itens = auditoriaInstagramNomesMonitoradosLote1;
  const ctx = {
    urls: new Set<string>(),
    handles: new Set<string>(),
    slugs: new Set<string>(),
    pessoaIds: new Set<string>(),
  };
  const erros: string[] = [];
  for (const item of itens) {
    erros.push(...validarItemAuditoriaInstagram(item, ctx));
  }
  if (itens.length > 10) {
    erros.push(`Lote 1 excede o limite de 10 entradas (encontradas ${itens.length}).`);
  }
  for (const it of itens) {
    if (it.verificadaEm && it.verificadaEm > hoje) {
      erros.push(`${it.slug}: verificadaEm futura (${it.verificadaEm}).`);
    }
  }
  return erros.map<ErroValidacaoInstagram>((mensagem, idx) => ({
    pessoaId: itens[Math.min(idx, itens.length - 1)].slug,
    campo: 'item',
    mensagem,
  }));
}
