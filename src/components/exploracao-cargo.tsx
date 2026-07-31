// Exploração por cargo — componente interativo em /eleicoes-2026.
//
// Filtros: cargo, partido, estágio, data e busca textual (case-
// insensitive e sem acentos). Funciona em desktop (grid horizontal)
// e em mobile (selects empilhados, ordem de leitura preservada).
//
// Os filtros são codificados em URL via `?cargo=&partido=&estagio=&data=&q=`
// e restaurados ao abrir a URL. Parâmetros desconhecidos ou inválidos
// são descartados (defesa contra payload adversário). Os dados são
// derivados apenas da base eleitoral independente
// (src/data/cenario-eleitoral.ts) — não inventa nomes, partidos,
// cargos, estágios ou datas.
//
// Toda a lógica pura (parse, serialize, validação, normalização) fica
// em src/lib/exploracao-cargo.ts para que testes e outros componentes
// possam consumi-la sem dependência de React.

'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { CargoEleitoral, EstagioEleitoral } from '@/types';
import {
  ROTULOS_CARGO,
  ROTULOS_ESTAGIO,
  DESCRICOES_ESTAGIO,
  pessoaParaItem,
  formatarDataExploracao,
  classesEstagio,
  FILTROS_VAZIOS,
  aplicarFiltrosExploracao,
  filtrosAtivos,
  serializarFiltrosBusca,
  type FiltrosExploracao,
  type ItemExploracao,
} from '@/lib/exploracao-cargo';
import {
  classesEstadoFoto,
  classesEstadoLinkOficial,
  rotuloEstadoFoto,
  rotuloEstadoLinkOficial,
  type EstadoFoto,
  type EstadoLinkOficial,
} from '@/lib/perfil-eleitoral';

// Reexporta a API pública para preservar compatibilidade com imports
// existentes (página /eleicoes-2026 e testes determinísticos).
export {
  ROTULOS_CARGO,
  ROTULOS_ESTAGIO,
  DESCRICOES_ESTAGIO,
  pessoaParaItem,
  formatarDataExploracao,
  classesEstagio,
  FILTROS_VAZIOS,
  aplicarFiltrosExploracao,
  filtrosAtivos,
  serializarFiltrosBusca,
  type FiltrosExploracao,
  type ItemExploracao,
};

export interface ExploracaoPorCargoProps {
  /**
   * Lista derivada da base eleitoral. O componente não recalcula — recebe
   * itens já normalizados para manter a página leve e o limite de
   * manipulação de dados.
   */
  itens: ItemExploracao[];
  /**
   * Filtros iniciais já validados pelo server (parsing defensivo em
   * /eleicoes-2026/page.tsx). O componente usa esses valores como ponto
   * de partida do estado, compartilhando o estado com a URL.
   */
  filtrosIniciais?: FiltrosExploracao;
}

const ORDEM_CARGOS: CargoEleitoral[] = [
  'governador',
  'vice_governador',
  'senador',
  'deputado_federal',
  'deputado_distrital',
];

const ORDEM_ESTAGIOS: EstagioEleitoral[] = [
  'registro_oficial',
  'pre_candidatura_declarada',
  'anunciado_pelo_partido',
  'movimentacao_publica',
  'nome_monitorado',
];

/**
 * Estilos compartilhados pelos selects. O seletor `style` foi descartado
 * em favor de classes utilitárias para suportar Tailwind/estados de foco.
 */
const classesSelect =
  'w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1';

export function ExploracaoPorCargo({
  itens,
  filtrosIniciais = FILTROS_VAZIOS,
}: ExploracaoPorCargoProps) {
  const router = useRouter();
  const [cargoFiltro, setCargoFiltro] = useState<
    'todos' | CargoEleitoral
  >(filtrosIniciais.cargo);
  const [partidoFiltro, setPartidoFiltro] = useState<string>(
    filtrosIniciais.partido,
  );
  const [estagioFiltro, setEstagioFiltro] = useState<
    'todos' | EstagioEleitoral
  >(filtrosIniciais.estagio);
  const [dataFiltro, setDataFiltro] = useState<string>(filtrosIniciais.data);
  const [buscaFiltro, setBuscaFiltro] = useState<string>(
    filtrosIniciais.busca,
  );

  // Bloqueia primeira emissão de URL sincronizada: o SSR já pintou
  // com os filtros iniciais, então só sincronizamos após a hidratação
  // inicial. Isso evita redirecionar a página antes mesmo do usuário
  // interagir.
  const hidratado = useRef(false);
  useEffect(() => {
    hidratado.current = true;
  }, []);

  // Partidos distintos — derivados da base, garantindo que partidos só
  // apareçam se houver pelo menos uma pessoa monitorada.
  const partidos = useMemo(() => {
    const set = new Set<string>();
    for (const item of itens) {
      if (item.partido) set.add(item.partido);
    }
    return [...set].sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [itens]);

  // Datas distintas — uma opção por dataEvidencia presente. Mobile mantém
  // a ordem cronológica decrescente (mais recente no topo).
  const datas = useMemo(() => {
    const set = new Set<string>();
    for (const item of itens) set.add(item.dataEvidencia);
    return [...set].sort((a, b) => b.localeCompare(a));
  }, [itens]);

  const estadoAtual = useMemo<FiltrosExploracao>(
    () => ({
      cargo: cargoFiltro,
      partido: partidoFiltro,
      estagio: estagioFiltro,
      data: dataFiltro,
      busca: buscaFiltro,
    }),
    [cargoFiltro, partidoFiltro, estagioFiltro, dataFiltro, buscaFiltro],
  );

  const itensFiltrados = useMemo(() => {
    return aplicarFiltrosExploracao(itens, estadoAtual).sort((a, b) =>
      b.dataEvidencia.localeCompare(a.dataEvidencia),
    );
  }, [itens, estadoAtual]);

  // Sincroniza o estado com a URL após a hidratação. Usa router.replace
  // (não push) para não empilhar histórico a cada troca de select.
  // Também evita disparar durante a primeira hidratação: o estado já
  // vem da URL nesse momento.
  useEffect(() => {
    if (!hidratado.current) return;
    const qs = serializarFiltrosBusca(estadoAtual);
    const url = qs ? `/eleicoes-2026${qs}` : '/eleicoes-2026';
    router.replace(url, { scroll: false });
  }, [estadoAtual, router]);

  const totalFiltrados = itensFiltrados.length;
  const totalGeral = itens.length;

  const temFiltroAtivo = filtrosAtivos(estadoAtual);

  const limparFiltros = useCallback(() => {
    setCargoFiltro(FILTROS_VAZIOS.cargo);
    setPartidoFiltro(FILTROS_VAZIOS.partido);
    setEstagioFiltro(FILTROS_VAZIOS.estagio);
    setDataFiltro(FILTROS_VAZIOS.data);
    setBuscaFiltro(FILTROS_VAZIOS.busca);
  }, []);

  return (
    <section
      className="rounded-xl border border-zinc-200 bg-white p-6 mb-10"
      aria-labelledby="heading-exploracao"
    >
      <header className="mb-5">
        <h2
          id="heading-exploracao"
          className="text-xl font-semibold text-zinc-900 mb-1"
        >
          Exploração por cargo
        </h2>
        <p className="text-sm text-zinc-500 leading-relaxed">
          Filtre por cargo, partido, estágio de evidência, data da fonte
          mais recente ou busca textual por nome. Os registros vêm da base
          eleitoral independente — sem classificação por palavra-chave de
          notícia. Os filtros podem ser compartilhados copiando a URL
          desta página.
        </p>
      </header>

      {/* Filtros: grid em desktop, coluna em mobile. Mesma ordem visual
          em ambas as larguras para reduzir o custo de releitura. */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4"
        role="group"
        aria-label="Filtros de exploração"
      >
        <div>
          <label
            htmlFor="filtro-cargo"
            className="block text-xs font-semibold text-zinc-600 mb-1"
          >
            Cargo
          </label>
          <select
            id="filtro-cargo"
            value={cargoFiltro}
            onChange={(e) =>
              setCargoFiltro(e.target.value as 'todos' | CargoEleitoral)
            }
            className={classesSelect}
            aria-label="Filtrar por cargo"
          >
            <option value="todos">Todos os cargos</option>
            {ORDEM_CARGOS.map((c) => (
              <option key={c} value={c}>
                {ROTULOS_CARGO[c]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="filtro-partido"
            className="block text-xs font-semibold text-zinc-600 mb-1"
          >
            Partido
          </label>
          <select
            id="filtro-partido"
            value={partidoFiltro}
            onChange={(e) => setPartidoFiltro(e.target.value)}
            className={classesSelect}
            aria-label="Filtrar por partido"
          >
            <option value="todos">Todos os partidos</option>
            {partidos.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="filtro-estagio"
            className="block text-xs font-semibold text-zinc-600 mb-1"
          >
            Estágio de evidência
          </label>
          <select
            id="filtro-estagio"
            value={estagioFiltro}
            onChange={(e) =>
              setEstagioFiltro(e.target.value as 'todos' | EstagioEleitoral)
            }
            className={classesSelect}
            aria-label="Filtrar por estágio de evidência"
          >
            <option value="todos">Todos os estágios</option>
            {ORDEM_ESTAGIOS.map((e) => (
              <option key={e} value={e}>
                {ROTULOS_ESTAGIO[e]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="filtro-data"
            className="block text-xs font-semibold text-zinc-600 mb-1"
          >
            Data da fonte
          </label>
          <select
            id="filtro-data"
            value={dataFiltro}
            onChange={(e) => setDataFiltro(e.target.value)}
            className={classesSelect}
            aria-label="Filtrar por data da evidência mais recente"
          >
            <option value="todas">Qualquer data</option>
            {datas.map((d) => (
              <option key={d} value={d}>
                {formatarDataExploracao(d)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Busca textual livre — full-width para acomodar frases longas.
          case-insensitive e sem acentos; vide aplicarFiltrosExploracao. */}
      <div className="mb-4">
        <label
          htmlFor="filtro-busca"
          className="block text-xs font-semibold text-zinc-600 mb-1"
        >
          Buscar por nome ou partido
        </label>
        <input
          id="filtro-busca"
          type="search"
          value={buscaFiltro}
          onChange={(e) => setBuscaFiltro(e.target.value)}
          placeholder="Ex.: Celina, PT, PSDB…"
          aria-label="Buscar por nome ou partido na exploração eleitoral"
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-800 shadow-sm placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
        />
      </div>

      {/* Linha de estado: total + limpar filtros quando aplicável. */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
        <p
          className="text-sm text-zinc-600"
          aria-live="polite"
          aria-atomic="true"
        >
          <span className="font-semibold text-zinc-800">{totalFiltrados}</span>{' '}
          de {totalGeral} registro{totalGeral !== 1 ? 's' : ''} exibido
          {totalFiltrados !== 1 ? 's' : ''}.
        </p>
        {temFiltroAtivo && (
          <button
            type="button"
            onClick={limparFiltros}
            className="text-sm font-semibold text-blue-600 hover:text-blue-500 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            aria-label="Limpar todos os filtros"
          >
            Limpar filtros
          </button>
        )}
      </div>

      {/* Lista de resultados. Cards empilhados em mobile; mesma estrutura
          em desktop. */}
      {totalFiltrados === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-5">
          <p className="text-sm text-zinc-600 leading-relaxed">
            <strong className="text-zinc-800">
              Nenhum registro corresponde aos filtros selecionados.
            </strong>{' '}
            Ajuste os critérios ou{' '}
            <button
              type="button"
              onClick={limparFiltros}
              className="text-blue-600 hover:text-blue-500 underline rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              limpe os filtros
            </button>{' '}
            para ver todos os registros.
          </p>
        </div>
      ) : (
        <ul
          className="space-y-3"
          aria-label="Resultados filtrados da exploração por cargo"
        >
          {itensFiltrados.map((item) => (
            <li
              key={item.id}
              className="rounded-lg border border-zinc-200 bg-zinc-50 p-4"
              data-estado-foto={item.estadoFoto}
              data-estado-link={item.estadoLinkOficial}
            >
              <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
                <h3 className="font-semibold text-zinc-900 text-sm">
                  {item.nome}
                  {item.partido && (
                    <span className="text-zinc-500 font-normal">
                      {' '}
                      ({item.partido})
                    </span>
                  )}
                </h3>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${classesEstagio(item.estagio)}`}
                >
                  {ROTULOS_ESTAGIO[item.estagio]}
                </span>
              </div>
              <p className="text-xs text-zinc-500 mb-2">
                {ROTULOS_CARGO[item.cargo]} · evidência mais recente em{' '}
                {formatarDataExploracao(item.dataEvidencia)}
              </p>
              <p className="text-sm text-zinc-600 leading-relaxed mb-3">
                {item.descricao}
              </p>
              <div className="flex flex-wrap items-center gap-1.5 mb-3">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${classesEstadoFoto(item.estadoFoto)}`}
                  aria-label={`Estado da foto: ${rotuloEstadoFoto(item.estadoFoto)}`}
                >
                  {rotuloEstadoFoto(item.estadoFoto)}
                </span>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${classesEstadoLinkOficial(item.estadoLinkOficial)}`}
                  aria-label={`Estado do link oficial: ${rotuloEstadoLinkOficial(item.estadoLinkOficial)}`}
                >
                  {rotuloEstadoLinkOficial(item.estadoLinkOficial)}
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-xs text-zinc-500">
                  <span className="text-zinc-600">Fonte:</span>{' '}
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Abrir fonte "${item.fonte}" para ${item.nome} em nova aba`}
                    className="text-blue-600 hover:underline rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    {item.fonte}
                  </a>
                </div>
                <a
                  href={`/perfil-eleitoral/${item.slug}`}
                  aria-label={`Abrir perfil eleitoral individual de ${item.nome}`}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-500 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                >
                  Ver perfil eleitoral →
                </a>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
