// Lógica pura de exibição de chapas, vínculos e divergências no hub
// (/eleicoes-2026) e nos perfis (/perfil-eleitoral/[slug]).
//
// Toda informação vem da base já validada em src/data/vinculos-eleitorais.ts
// (vinculosEleitorais) cruzada com src/data/cenario-eleitoral.ts
// (cenarioEleitoral). Nada é inventado: pessoas, partidos, datas, fontes e
// URLs vêm dos próprios registros.
//
// Regras editoriais aplicadas aqui (AGENT_BRIEF.md, P6 item "Exibir chapas,
// vínculos e divergências no hub e nos perfis"):
//
//   - A interface mostra a origem (fonte), a data (inicioEm/fimEm) e o
//     status (anunciado, ratificado, contestado, divergente, encerrado)
//     de cada anúncio.
//   - Confirmação é diferenciada de divergência: versões conflitantes
//     vinculadas por `grupoDivergencia` permanecem separadas e exibidas em
//     conjunto, com status de conflito (contestado/divergente) preservado.
//   - O estado vazio é honesto: quando não há vínculo verificável para
//     uma pessoa ou no hub, exibimos mensagem explícita sem fabricar dados.
//   - Vínculos com status `registro_oficial` NÃO são usados para qualificar
//     qualquer pessoa como "candidato oficial" — apenas `VinculoEleitoral`
//     derivado de fonte específica permanece com status documental.
//
// Esta biblioteca é pura e side-effect free. O componente React e a página
// do Next consomem as funções aqui expostas.

import type {
  CargoEleitoral,
  CategoriaFonte,
  EstagioEleitoral,
  PessoaEleitoral,
  StatusVinculoEleitoral,
  TipoVinculoEleitoral,
  VinculoEleitoral,
} from '@/types';

// ---------------------------------------------------------------------------
// Tipos públicos — consumidos pelo hub e pelos perfis.
// ---------------------------------------------------------------------------

/** Identidade humana-legível de uma pessoa dentro de um vínculo. */
export interface PessoaNoVinculo {
  id: string;
  slug: string;
  nome: string;
  /**
   * Partido atual registrado na base eleitoral. Pode ser `null` quando
   * a pessoa é monitorada sem partido conhecido. Nunca inventamos.
   */
  partido: string | null;
  /**
   * Cargo monitorado atual registrado na base eleitoral. Útil para
   * destacar o cargo de origem da pessoa dentro do vínculo.
   */
  cargo: CargoEleitoral;
  /** Estágio atual registrado na base eleitoral. */
  estagio: EstagioEleitoral;
  /**
   * Papel declarado pela fonte do vínculo (titular, vice, apoiador,
   * integrante, indicado, mencionado). Proveniente de
   * `VinculoEleitoral.pessoas[].papel`.
   */
  papel: string;
}

/**
 * Item de vínculo exibido no hub e nos perfis. Inclui todos os campos
 * derivados da base (fonte, URL, datas, descrição, pessoas, status) e
 * enriquece com nomes de pessoas a partir de `cenarioEleitoral`. Nenhum
 * campo é inventado.
 */
export interface ItemVinculoHub {
  id: string;
  tipo: TipoVinculoEleitoral;
  status: StatusVinculoEleitoral;
  pessoas: PessoaNoVinculo[];
  cargos: CargoEleitoral[];
  partidoOuFederacao: string | null;
  /**
   * Identificador de grupo de versões conflitantes. Quando preenchido,
   * o vínculo é parte de um conjunto de versões divergentes que devem
   * permanecer separadas na exibição (status `contestado`/`divergente`).
   */
  grupoDivergencia: string | null;
  /** Início do vínculo em ISO 8601 (aaaa-mm-dd). */
  inicioEm: string;
  /** Fim do vínculo em ISO 8601 (aaaa-mm-dd). Ausente = vigente. */
  fimEm: string | null;
  fonte: string;
  fonteCategoria: CategoriaFonte;
  url: string;
  descricao: string;
  coletadaEm: string;
  verificadaEm: string;
}

// ---------------------------------------------------------------------------
// Rótulos humanos para tipo e status de vínculo.
// ---------------------------------------------------------------------------

/** Rótulo humano-legível do tipo de vínculo (5 valores do schema). */
export function rotuloTipoVinculo(tipo: TipoVinculoEleitoral): string {
  switch (tipo) {
    case 'chapa':
      return 'Chapa';
    case 'apoio':
      return 'Apoio';
    case 'federacao':
      return 'Federação';
    case 'coligacao':
      return 'Coligação';
    case 'frente':
      return 'Frente';
  }
}

/** Rótulo humano-legível do status documental do anúncio. */
export function rotuloStatusVinculo(status: StatusVinculoEleitoral): string {
  switch (status) {
    case 'anunciado':
      return 'Anunciado';
    case 'ratificado':
      return 'Ratificado';
    case 'contestado':
      return 'Contestado';
    case 'divergente':
      return 'Divergente';
    case 'encerrado':
      return 'Encerrado';
  }
}

/** Classes Tailwind por status — diferencia confirmação de divergência. */
export function classesStatusVinculo(
  status: StatusVinculoEleitoral,
): string {
  switch (status) {
    case 'ratificado':
      return 'bg-green-100 text-green-700';
    case 'anunciado':
      return 'bg-blue-100 text-blue-700';
    case 'contestado':
      return 'bg-orange-100 text-orange-800';
    case 'divergente':
      return 'bg-amber-100 text-amber-800';
    case 'encerrado':
      return 'bg-zinc-200 text-zinc-700';
  }
}

/** Classes Tailwind para o tipo de vínculo. */
export function classesTipoVinculo(tipo: TipoVinculoEleitoral): string {
  switch (tipo) {
    case 'chapa':
      return 'bg-indigo-100 text-indigo-700';
    case 'apoio':
      return 'bg-sky-100 text-sky-700';
    case 'federacao':
      return 'bg-violet-100 text-violet-700';
    case 'coligacao':
      return 'bg-fuchsia-100 text-fuchsia-700';
    case 'frente':
      return 'bg-teal-100 text-teal-700';
  }
}

/**
 * Status que indicam conflito/divergência entre versões de um mesmo
 * papel. Usado para sinalizar visualmente a seção de divergências.
 */
export function statusIndicamConflito(status: StatusVinculoEleitoral): boolean {
  return status === 'contestado' || status === 'divergente';
}

/**
 * Status que indicam confirmação (sem conflito pendente).
 */
export function statusIndicamConfirmacao(
  status: StatusVinculoEleitoral,
): boolean {
  return status === 'anunciado' || status === 'ratificado';
}

/** Formata ISO 8601 (aaaa-mm-dd) em dd/mm/aaaa. */
export function formatarDataVinculo(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return iso;
  return `${m[3]}/${m[2]}/${m[1]}`;
}

// ---------------------------------------------------------------------------
// Indexação e derivação dos vínculos.
// ---------------------------------------------------------------------------

/** Mapa auxiliar: pessoaId -> PessoaEleitoral. */
function mapaPessoas(
  pessoas: ReadonlyArray<PessoaEleitoral>,
): Map<string, PessoaEleitoral> {
  const mapa = new Map<string, PessoaEleitoral>();
  for (const p of pessoas) mapa.set(p.id, p);
  return mapa;
}

/**
 * Enriquece um `VinculoEleitoral` com nomes, partido e cargo atuais das
 * pessoas referenciadas em `cenarioEleitoral`. Quando uma pessoa
 * referenciada não está na base, o vínculo é descartado (defesa contra
 * referência quebrada) — a base de vínculos deve ser coerente com a base
 * eleitoral.
 */
export function itemVinculoDeVinculo(
  vinculo: VinculoEleitoral,
  pessoas: ReadonlyArray<PessoaEleitoral>,
): ItemVinculoHub | null {
  const mapa = mapaPessoas(pessoas);
  const pessoasEnriquecidas: PessoaNoVinculo[] = [];
  for (const part of vinculo.pessoas) {
    const pessoa = mapa.get(part.pessoaId);
    if (!pessoa) {
      // Defesa: o brief proíbe inventar nomes. Se a pessoa não está na
      // base eleitoral, o vínculo é descartado inteiro em vez de fabricar
      // informação faltante.
      return null;
    }
    pessoasEnriquecidas.push({
      id: pessoa.id,
      slug: pessoa.slug,
      nome: pessoa.nome,
      partido: pessoa.partido ?? null,
      cargo: pessoa.cargo,
      estagio: pessoa.estagio,
      papel: part.papel,
    });
  }

  return {
    id: vinculo.id,
    tipo: vinculo.tipo,
    status: vinculo.status,
    pessoas: pessoasEnriquecidas,
    cargos: vinculo.cargos,
    partidoOuFederacao: vinculo.partidoOuFederacao ?? null,
    grupoDivergencia: vinculo.grupoDivergencia ?? null,
    inicioEm: vinculo.inicioEm,
    fimEm: vinculo.fimEm ?? null,
    fonte: vinculo.fonte,
    fonteCategoria: vinculo.fonteCategoria,
    url: vinculo.url,
    descricao: vinculo.descricao,
    coletadaEm: vinculo.coletadaEm,
    verificadaEm: vinculo.verificadaEm,
  };
}

/**
 * Lista completa de vínculos enriquecidos a partir de `cenarioEleitoral`,
 * ordenada por `inicioEm` decrescente (mais recente primeiro). Vínculos
 * com referência quebrada são descartados pela defesa em
 * `itemVinculoDeVinculo`.
 */
export function vinculosParaHub(
  vinculos: ReadonlyArray<VinculoEleitoral>,
  pessoas: ReadonlyArray<PessoaEleitoral>,
): ItemVinculoHub[] {
  const enriquecidos: ItemVinculoHub[] = [];
  for (const v of vinculos) {
    const item = itemVinculoDeVinculo(v, pessoas);
    if (item) enriquecidos.push(item);
  }
  return enriquecidos.sort((a, b) => b.inicioEm.localeCompare(a.inicioEm));
}

/**
 * Lista de vínculos onde a pessoa aparece (em qualquer papel), ordenada
 * por `inicioEm` decrescente. Retorna lista vazia quando não há relação
 * verificável para a pessoa — caso em que a UI exibe estado honesto.
 */
export function vinculosParaPessoa(
  pessoaId: string,
  vinculos: ReadonlyArray<VinculoEleitoral>,
  pessoas: ReadonlyArray<PessoaEleitoral>,
): ItemVinculoHub[] {
  return vinculosParaHub(vinculos, pessoas).filter((v) =>
    v.pessoas.some((p) => p.id === pessoaId),
  );
}

/**
 * Agrupa os vínculos por `grupoDivergencia`. Versões conflitantes do mesmo
 * papel permanecem juntas (status `contestado` ou `divergente`), preservando
 * a separação editorial. Vínculos sem `grupoDivergencia` ficam em entradas
 * individuais.
 */
export interface GrupoDivergencia {
  grupoId: string;
  versoes: ItemVinculoHub[];
}

export function agruparDivergencias(
  itens: ReadonlyArray<ItemVinculoHub>,
): GrupoDivergencia[] {
  const grupos = new Map<string, ItemVinculoHub[]>();
  const isolados: ItemVinculoHub[] = [];

  for (const item of itens) {
    if (item.grupoDivergencia) {
      const lista = grupos.get(item.grupoDivergencia) ?? [];
      lista.push(item);
      grupos.set(item.grupoDivergencia, lista);
    } else {
      isolados.push(item);
    }
  }

  const resultado: GrupoDivergencia[] = [];
  for (const [grupoId, versoes] of grupos) {
    versoes.sort((a, b) => b.inicioEm.localeCompare(a.inicioEm));
    resultado.push({ grupoId, versoes });
  }
  for (const item of isolados) {
    // Cada vínculo isolado vira um grupo de uma versão para tratamento
    // uniforme na renderização.
    resultado.push({ grupoId: item.id, versoes: [item] });
  }
  return resultado;
}

/**
 * Total de versões conflitantes detectadas — usado para destacar a
 * existência de divergências no hub. Conta apenas grupos com mais de
 * uma versão.
 */
export function totalDivergencias(
  itens: ReadonlyArray<ItemVinculoHub>,
): number {
  const contagem = new Map<string, number>();
  for (const item of itens) {
    if (!item.grupoDivergencia) continue;
    contagem.set(
      item.grupoDivergencia,
      (contagem.get(item.grupoDivergencia) ?? 0) + 1,
    );
  }
  let total = 0;
  for (const n of contagem.values()) if (n > 1) total += 1;
  return total;
}
