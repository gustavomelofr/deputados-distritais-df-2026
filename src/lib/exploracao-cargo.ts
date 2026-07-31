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
