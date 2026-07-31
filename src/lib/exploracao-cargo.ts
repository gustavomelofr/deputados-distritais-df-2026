// Lógica pura de exploração por cargo — usada tanto pelo server (página
// /eleicoes-2026) quanto pelo client component (ExploracaoPorCargo).
//
// Este módulo NÃO tem `'use client'`: é puro e pode ser invocado em
// server components durante o prerender. As constantes compartilhadas
// (ROTULOS_CARGO, ROTULOS_ESTAGIO, DESCRICOES_ESTAGIO, formatarData
// Exploracao, classesEstagio, ItemExploracao) também ficam aqui para
// que o server possa usá-las sem precisar importar o arquivo do
// componente, que é client-only.
//
// O componente React em si (ExploracaoPorCargo) continua em
// src/components/exploracao-cargo.tsx com `'use client'`; ele importa
// deste módulo para reaproveitar as funções puras.

import type {
  CargoEleitoral,
  EstagioEleitoral,
  PessoaEleitoral,
} from '@/types';

export interface ItemExploracao {
  id: string;
  nome: string;
  slug: string;
  cargo: CargoEleitoral;
  partido: string | null;
  estagio: EstagioEleitoral;
  /** dataEvidencia mais recente (ISO 8601). Usada para ordenar e filtrar. */
  dataEvidencia: string;
  /** Evidência mais recente — usada para resumo e link de fonte. */
  fonte: string;
  url: string;
  descricao: string;
}

/**
 * Conjunto canônico dos 5 cargos. Centralizado para validação de URL
 * (defesa contra parâmetros desconhecidos).
 */
export const CARGOS_VALIDOS: ReadonlySet<CargoEleitoral> = new Set([
  'governador',
  'vice_governador',
  'senador',
  'deputado_federal',
  'deputado_distrital',
]);

/**
 * Conjunto canônico dos 5 estágios. Usado para validar parâmetros de
 * URL.
 */
export const ESTAGIOS_VALIDOS: ReadonlySet<EstagioEleitoral> = new Set([
  'nome_monitorado',
  'pre_candidatura_declarada',
  'anunciado_pelo_partido',
  'movimentacao_publica',
  'registro_oficial',
]);

/**
 * Comprimento máximo aceito para `q` (busca textual). Defesa contra
 * payload gigante na URL.
 */
export const COMPRIMENTO_MAXIMO_BUSCA = 80;

/**
 * Estado consolidado dos filtros da exploração por cargo. Forma canônica
 * passada entre o server (lendo searchParams), o componente client
 * (estado local) e a URL (parâmetros ?cargo=&partido=&estagio=&data=&q=).
 * Os valores "vazio" usam os sentinelas públicos abaixo — não usamos
 * `undefined` para diferenciá-los no payload.
 */
export interface FiltrosExploracao {
  cargo: CargoEleitoral | 'todos';
  partido: string | 'todos';
  estagio: EstagioEleitoral | 'todos';
  data: string | 'todas';
  busca: string;
}

/**
 * Estado "vazio" dos filtros (sentinelas públicos). É o ponto de
 * partida para limpar e o estado restaurado quando não há params.
 */
export const FILTROS_VAZIOS: FiltrosExploracao = Object.freeze({
  cargo: 'todos',
  partido: 'todos',
  estagio: 'todos',
  data: 'todas',
  busca: '',
});

/**
 * Resultado seguro de `parsearFiltrosBusca`. Nunca lança — em URL
 * adversária, devolve o filtro neutro e a descrição do problema.
 */
export interface ParseFiltrosResultado {
  filtros: FiltrosExploracao;
  /** Quantos parâmetros foram descartados por inválidos. Útil para UI. */
  ignorados: number;
}

/**
 * Converte um valor de searchParam em um CargoEleitoral válido ou
 * devolve o sentinela `'todos'`. Defesa contra `?cargo=hacker`.
 */
export function parsearCargo(
  valor: string | string[] | undefined,
): CargoEleitoral | 'todos' {
  const v = Array.isArray(valor) ? valor[0] : valor;
  if (!v) return 'todos';
  if (CARGOS_VALIDOS.has(v as CargoEleitoral)) {
    return v as CargoEleitoral;
  }
  return 'todos';
}

/**
 * Converte um valor de searchParam em um EstagioEleitoral válido ou
 * devolve o sentinela `'todos'`. Defesa contra `?estagio=foo`.
 */
export function parsearEstagio(
  valor: string | string[] | undefined,
): EstagioEleitoral | 'todos' {
  const v = Array.isArray(valor) ? valor[0] : valor;
  if (!v) return 'todos';
  if (ESTAGIOS_VALIDOS.has(v as EstagioEleitoral)) {
    return v as EstagioEleitoral;
  }
  return 'todos';
}

/**
 * Converte um searchParam em um partido válido dentro do universo
 * observado em `itens`. Se o partido não existir na base atual, devolve
 * `'todos'` e marca como ignorado. Isso preserva o invariante: a URL
 * nunca persiste um partido desconhecido.
 */
export function parsearPartido(
  valor: string | string[] | undefined,
  partidosValidos: ReadonlySet<string>,
): { valor: string | 'todos'; valido: boolean } {
  const v = Array.isArray(valor) ? valor[0] : valor;
  if (!v) return { valor: 'todos', valido: true };
  if (partidosValidos.has(v)) return { valor: v, valido: true };
  return { valor: 'todos', valido: false };
}

/**
 * Converte um searchParam em uma data válida (ISO 8601) dentro do
 * universo observado em `itens`. Se a data não existir, devolve
 * `'todas'` e marca como ignorado.
 */
export function parsearData(
  valor: string | string[] | undefined,
  datasValidas: ReadonlySet<string>,
): { valor: string | 'todas'; valido: boolean } {
  const v = Array.isArray(valor) ? valor[0] : valor;
  if (!v) return { valor: 'todas', valido: true };
  if (datasValidas.has(v)) return { valor: v, valido: true };
  return { valor: 'todas', valido: false };
}

/**
 * Sanitiza o termo de busca textual. Aplica:
 *  - trim nas extremidades;
 *  - limite de comprimento (defesa contra payload gigante);
 *  - remoção de caracteres de controle/Unicode privados.
 */
export function parsearBusca(
  valor: string | string[] | undefined,
): { valor: string; ignorado: boolean } {
  const v = Array.isArray(valor) ? valor[0] : valor;
  if (!v) return { valor: '', ignorado: false };
  const limpo = v
    .replace(/[\u0000-\u001f\u007f-\u009f\u2028\u2029\ufeff]/g, '')
    .slice(0, COMPRIMENTO_MAXIMO_BUSCA)
    .trim();
  if (!limpo) return { valor: '', ignorado: false };
  if (limpo !== v.trim()) {
    return { valor: limpo, ignorado: true };
  }
  return { valor: limpo, ignorado: false };
}

/**
 * Deriva os partidos válidos a partir dos itens — o mesmo critério
 * usado pela UI client. Isso garante que `?partido=` rejeite valores
 * fora da base atual sem precisar importar a UI.
 */
export function partidosDosItens(
  itens: ReadonlyArray<ItemExploracao>,
): ReadonlySet<string> {
  const s = new Set<string>();
  for (const item of itens) {
    if (item.partido) s.add(item.partido);
  }
  return s;
}

/**
 * Deriva as datas válidas a partir dos itens.
 */
export function datasDosItens(
  itens: ReadonlyArray<ItemExploracao>,
): ReadonlySet<string> {
  const s = new Set<string>();
  for (const item of itens) {
    if (item.dataEvidencia) s.add(item.dataEvidencia);
  }
  return s;
}

/**
 * Parser unificado. Recebe o searchParams cru do Next.js e a lista
 * canônica de itens; devolve filtros normalizados e a contagem de
 * parâmetros ignorados.
 */
export function parsearFiltrosBusca(
  searchParams: Readonly<Record<string, string | string[] | undefined>>,
  itens: ReadonlyArray<ItemExploracao>,
): ParseFiltrosResultado {
  const partidos = partidosDosItens(itens);
  const datas = datasDosItens(itens);
  const cargo = parsearCargo(searchParams.cargo);
  const estagio = parsearEstagio(searchParams.estagio);
  const partido = parsearPartido(searchParams.partido, partidos);
  const data = parsearData(searchParams.data, datas);
  const busca = parsearBusca(searchParams.q);
  const ignorados =
    Number(!partido.valido) +
    Number(!data.valido) +
    Number(busca.ignorado);
  return {
    filtros: {
      cargo,
      estagio,
      partido: partido.valor,
      data: data.valor,
      busca: busca.valor,
    },
    ignorados,
  };
}

/**
 * Serializa os filtros em uma query string começando com `?`. Parâmetros
 * em estado sentinela (`'todos'`, `'todas'`, `''`) são omitidos para
 * manter a URL curta. Ordem canônica: cargo, partido, estagio, data,
 * busca.
 */
export function serializarFiltrosBusca(filtros: FiltrosExploracao): string {
  const params = new URLSearchParams();
  if (filtros.cargo !== 'todos') params.set('cargo', filtros.cargo);
  if (filtros.partido !== 'todos') params.set('partido', filtros.partido);
  if (filtros.estagio !== 'todos') params.set('estagio', filtros.estagio);
  if (filtros.data !== 'todas') params.set('data', filtros.data);
  if (filtros.busca) params.set('q', filtros.busca);
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

/**
 * Verifica se há algum filtro ativo fora dos sentinelas.
 */
export function filtrosAtivos(filtros: FiltrosExploracao): boolean {
  return (
    filtros.cargo !== 'todos' ||
    filtros.partido !== 'todos' ||
    filtros.estagio !== 'todos' ||
    filtros.data !== 'todas' ||
    filtros.busca !== ''
  );
}

/**
 * Aplica os filtros a uma lista de itens. A busca textual é case-
 * insensitive e considera nome + partido. A busca ignora acentos
 * (normalização NFD) para aproximar a UX brasileira.
 */
export function aplicarFiltrosExploracao(
  itens: ReadonlyArray<ItemExploracao>,
  filtros: FiltrosExploracao,
): ItemExploracao[] {
  const termo = normalizarBusca(filtros.busca);
  return itens.filter((i) => {
    if (filtros.cargo !== 'todos' && i.cargo !== filtros.cargo) return false;
    if (filtros.partido !== 'todos' && i.partido !== filtros.partido)
      return false;
    if (filtros.estagio !== 'todos' && i.estagio !== filtros.estagio)
      return false;
    if (filtros.data !== 'todas' && i.dataEvidencia !== filtros.data)
      return false;
    if (termo) {
      const alvo = normalizarBusca(`${i.nome} ${i.partido ?? ''}`);
      if (!alvo.includes(termo)) return false;
    }
    return true;
  });
}

/**
 * Normaliza para busca case-insensitive e sem acentos: decompõe
 * Unicode NFD, remove marcas diacríticas e baixa caixa. Robusto a
 * entradas vazias.
 */
function normalizarBusca(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Rótulo humano para um cargo eleitoral. Centralizado para que filtros e
 * cards usem a mesma nomenclatura.
 */
export const ROTULOS_CARGO: Record<CargoEleitoral, string> = {
  governador: 'Governador',
  vice_governador: 'Vice-governador',
  senador: 'Senador',
  deputado_federal: 'Deputado federal',
  deputado_distrital: 'Deputado distrital',
};

/**
 * Rótulo humano para cada estágio eleitoral (5 valores do schema).
 */
export const ROTULOS_ESTAGIO: Record<EstagioEleitoral, string> = {
  nome_monitorado: 'Nome monitorado',
  pre_candidatura_declarada: 'Pré-candidatura declarada',
  anunciado_pelo_partido: 'Anunciado pelo partido',
  movimentacao_publica: 'Movimentação pública',
  registro_oficial: 'Registro oficial (TSE)',
};

/**
 * Descrição curta do estágio, conforme metodologia do brief.
 */
export const DESCRICOES_ESTAGIO: Record<EstagioEleitoral, string> = {
  nome_monitorado:
    'Pessoa aparece em fontes relevantes sem declaração de candidatura.',
  pre_candidatura_declarada:
    'A própria pessoa declarou intenção em site ou perfil oficial.',
  anunciado_pelo_partido:
    'Partido anunciou formalmente a pré-candidatura.',
  movimentacao_publica:
    'Articulação com fonte primária ou duas reportagens independentes.',
  registro_oficial:
    'Candidatura registrada no TSE/DivulgaCand — único estágio em que vale "candidato oficial".',
};

/**
 * Converte uma PessoaEleitoral em ItemExploracao. Pureza: só lê os campos
 * já validados — não infere nem acrescenta dados.
 */
export function pessoaParaItem(p: PessoaEleitoral): ItemExploracao | null {
  if (!p.evidencias || p.evidencias.length === 0) return null;
  const maisRecente = p.evidencias
    .slice()
    .sort((a, b) => b.dataEvidencia.localeCompare(a.dataEvidencia))[0];
  return {
    id: p.id,
    nome: p.nome,
    slug: p.slug,
    cargo: p.cargo,
    partido: p.partido ?? null,
    estagio: p.estagio,
    dataEvidencia: maisRecente.dataEvidencia,
    fonte: maisRecente.fonte,
    url: maisRecente.url,
    descricao: maisRecente.descricao,
  };
}

/**
 * Formata data ISO 8601 em pt-BR sem depender de runtime externo.
 */
export function formatarDataExploracao(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return iso;
  const [, ano, mes, dia] = m;
  return `${dia}/${mes}/${ano}`;
}

/**
 * Badge de estágio — classes consistentes com a página /cenario-2026.
 */
export function classesEstagio(estagio: EstagioEleitoral): string {
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
