// Comparação eleitoral — página interativa em /comparar-eleitoral.
//
// Filtros: cargo (obrigatório) e seleção de 2 a 4 pessoas do mesmo
// cargo. Funciona em desktop (grid horizontal de selects) e em
// mobile (selects empilhados, ordem de leitura preservada). Os
// dados são derivados apenas da base eleitoral independente
// (src/data/cenario-eleitoral.ts) — não inventa nomes, partidos,
// cargos, estágios ou datas.
//
// Toda interação é client-side: a base já foi validada em build
// time pelo validarCenarioEleitoral. Não fazemos fetch nem build
// pesado aqui.
//
// Regras editoriais (AGENT_BRIEF.md, P6 item "Criar comparação
// eleitoral em /comparar-eleitoral"):
//
//   - A nova rota aceita SOMENTE pessoas do mesmo cargo. O seletor
//     de cargo é o primeiro filtro; os selects de pessoas só
//     mostram nomes do cargo escolhido.
//   - Comparação puramente descritiva: estágio, partido,
//     evidências, datas de verificação e fontes. Sem ranking, nota
//     ou inferência de intenção de voto.
//   - Links de evidência apontam para a URL específica registrada
//     na base (nunca homepage).
//   - Estados vazio, erro e carregamento são acessíveis (aria-live,
//     aria-label, role="alert" para erro).
//
// A página `/comparar` (comparação legislativa histórica) é
// preservada sem alterações: este componente é estritamente
// aditivo.

'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { CargoEleitoral } from '@/types';
import {
  CARGOS_ORDENADOS,
  MAX_COMPARACAO_ELEITORAL,
  MIN_COMPARACAO_ELEITORAL,
  ROTULO_CARREGAMENTO,
  classesEstagioComparacao,
  comparar,
  contarPorEstagio,
  formatarDataComparacao,
  pessoaParaComparacao,
  pessoasPorCargo,
  rotuloCargoComparacao,
  rotuloEstagioComparacao,
  type ComparacaoEleitoral,
  type PessoaComparacao,
} from '@/lib/comparar-eleitoral';

export {
  CARGOS_ORDENADOS,
  MAX_COMPARACAO_ELEITORAL,
  MIN_COMPARACAO_ELEITORAL,
  ROTULO_CARREGAMENTO,
  classesEstagioComparacao,
  comparar,
  contarPorEstagio,
  formatarDataComparacao,
  pessoaParaComparacao,
  pessoasPorCargo,
  rotuloCargoComparacao,
  rotuloEstagioComparacao,
  type ComparacaoEleitoral,
  type PessoaComparacao,
};

export interface CompararEleitoralProps {
  /**
   * Lista de pessoas da base eleitoral independente, já filtrada
   * para pessoas com evidência. O componente não recalcula —
   * recebe a base completa e filtra por cargo internamente.
   */
  base: ReadonlyArray<import('@/types').PessoaEleitoral>;
  /**
   * Slugs pré-selecionados via URL (?cargo=&p1=&p2=&p3=&p4=).
   * Usados para hidratar o estado inicial do formulário.
   */
  slugsIniciais: ReadonlyArray<string>;
  /**
   * Cargo pré-selecionado via URL. Quando vazio, o usuário
   * escolhe no primeiro select.
   */
  cargoInicial?: CargoEleitoral | '';
}

const classesSelect =
  'w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1';

export function CompararEleitoral({
  base,
  slugsIniciais,
  cargoInicial = '',
}: CompararEleitoralProps) {
  const [cargo, setCargo] = useState<CargoEleitoral | ''>(cargoInicial);
  const [selecionados, setSelecionados] = useState<string[]>(
    slugsIniciais.slice(0, MAX_COMPARACAO_ELEITORAL),
  );

  // Pessoas disponíveis para o cargo selecionado. Derivadas da base
  // eleitoral independente — nada é inventado.
  const pessoasDoCargo = useMemo<PessoaComparacao[]>(() => {
    if (!cargo) return [];
    return pessoasPorCargo(base, cargo).map(pessoaParaComparacao);
  }, [base, cargo]);

  // Quando o cargo muda, limpamos a seleção atual — a regra do
  // critério exige que todas as pessoas sejam do mesmo cargo.
  function trocarCargo(novo: CargoEleitoral | '') {
    setCargo(novo);
    setSelecionados([]);
  }

  function trocarPessoa(idx: number, slug: string) {
    setSelecionados((prev) => {
      const copia = [...prev];
      // Limpa duplicatas: se o mesmo slug aparece em outro slot,
      // remove o anterior para evitar repetição.
      for (let i = 0; i < copia.length; i++) {
        if (i !== idx && copia[i] === slug) copia[i] = '';
      }
      copia[idx] = slug;
      return copia;
    });
  }

  function limparSelecao() {
    setSelecionados([]);
  }

  // Slots visuais: sempre mostramos MIN..MAX selects. Preenchemos
  // com '' quando faltam pessoas selecionadas.
  const slots = useMemo(() => {
    const arr = [...selecionados];
    while (arr.length < MAX_COMPARACAO_ELEITORAL) arr.push('');
    return arr.slice(0, MAX_COMPARACAO_ELEITORAL);
  }, [selecionados]);

  const slugsValidos = slots.filter((s) => Boolean(s));
  const comparacao = useMemo<ComparacaoEleitoral | null>(() => {
    if (!cargo) return null;
    return comparar(base, slugsValidos);
  }, [base, cargo, slugsValidos]);

  const temErro = comparacao?.erro !== null && comparacao?.erro !== undefined;
  const temResultado =
    comparacao !== null &&
    comparacao.erro === null &&
    comparacao.pessoas.length >= MIN_COMPARACAO_ELEITORAL;
  const semSelecao = slugsValidos.length < MIN_COMPARACAO_ELEITORAL;

  // Resumo descritivo por estágio — sem ranking, sem nota.
  const resumoEstagios = useMemo(() => {
    if (!temResultado) return null;
    const contagem = contarPorEstagio(comparacao!.pessoas);
    const partes: string[] = [];
    for (const estagio of [
      'registro_oficial',
      'pre_candidatura_declarada',
      'anunciado_pelo_partido',
      'movimentacao_publica',
      'nome_monitorado',
    ] as const) {
      const n = contagem[estagio];
      if (n > 0) {
        partes.push(
          `${n} ${n === 1 ? 'pessoa' : 'pessoas'} em "${rotuloEstagioComparacao(estagio)}"`,
        );
      }
    }
    return partes.length > 0 ? partes.join(' · ') : null;
  }, [comparacao, temResultado]);

  return (
    <section
      className="rounded-xl border border-zinc-200 bg-white p-6 mb-10"
      aria-labelledby="heading-comparar-eleitoral"
    >
      <header className="mb-5">
        <h2
          id="heading-comparar-eleitoral"
          className="text-xl font-semibold text-zinc-900 mb-1"
        >
          Comparação eleitoral
        </h2>
        <p className="text-sm text-zinc-500 leading-relaxed">
          Selecione um cargo e de {MIN_COMPARACAO_ELEITORAL} a{' '}
          {MAX_COMPARACAO_ELEITORAL} pessoas do mesmo cargo para
          visualizar lado a lado estágio, partido, evidências, datas
          de verificação e fontes. A comparação é{' '}
          <strong>descritiva</strong>: não produz ranking, nota ou
          inferência de intenção de voto. A página{' '}
          <Link
            href="/comparar"
            aria-label="Abrir comparação legislativa histórica dos deputados distritais"
            className="text-blue-600 hover:underline rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            /comparar
          </Link>{' '}
          segue disponível para a comparação legislativa histórica.
        </p>
      </header>

      {/* Formulário: cargo + pessoas. Em desktop, grid horizontal;
          em mobile, coluna única. */}
      <form
        className="mb-6"
        aria-label="Selecionar cargo e pessoas para comparação eleitoral"
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
          <div>
            <label
              htmlFor="comparar-eleitoral-cargo"
              className="block text-xs font-semibold text-zinc-600 mb-1"
            >
              Cargo
            </label>
            <select
              id="comparar-eleitoral-cargo"
              value={cargo}
              onChange={(e) =>
                trocarCargo(e.target.value as CargoEleitoral | '')
              }
              className={classesSelect}
              aria-label="Selecionar cargo para a comparação eleitoral"
            >
              <option value="">— selecionar cargo —</option>
              {CARGOS_ORDENADOS.map((c) => (
                <option key={c} value={c}>
                  {rotuloCargoComparacao(c)}
                </option>
              ))}
            </select>
          </div>

          {slots.map((slug, idx) => (
            <div key={`slot-${idx}`}>
              <label
                htmlFor={`comparar-eleitoral-p${idx + 1}`}
                className="block text-xs font-semibold text-zinc-600 mb-1"
              >
                Pessoa {idx + 1}
                {idx >= MIN_COMPARACAO_ELEITORAL && (
                  <span className="ml-1 text-zinc-400">(opcional)</span>
                )}
              </label>
              <select
                id={`comparar-eleitoral-p${idx + 1}`}
                value={slug}
                onChange={(e) => trocarPessoa(idx, e.target.value)}
                className={classesSelect}
                disabled={!cargo}
                aria-label={`Selecionar pessoa ${idx + 1} para comparação eleitoral`}
                aria-disabled={!cargo}
              >
                <option value="">— selecionar —</option>
                {pessoasDoCargo.map((p) => (
                  <option key={p.id} value={p.slug}>
                    {p.nome}
                    {p.partido ? ` (${p.partido})` : ''}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={limparSelecao}
            disabled={selecionados.every((s) => !s)}
            className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
            aria-label="Limpar seleção de pessoas"
          >
            Limpar seleção
          </button>
          <span className="text-xs text-zinc-400">
            Selecione no mínimo {MIN_COMPARACAO_ELEITORAL} pessoas do
            mesmo cargo.
          </span>
        </div>
      </form>

      {/* Estado: sem cargo selecionado */}
      {!cargo && (
        <div
          className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-5"
          role="status"
          aria-live="polite"
        >
          <p className="text-sm text-zinc-600 leading-relaxed">
            <strong className="text-zinc-800">
              Escolha um cargo para começar.
            </strong>{' '}
            Os selects de pessoas só mostram nomes do cargo
            selecionado — a comparação eleitoral aceita apenas
            pessoas do mesmo cargo.
          </p>
        </div>
      )}

      {/* Estado: cargo selecionado, mas sem pessoas suficientes */}
      {cargo && semSelecao && (
        <div
          className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-5"
          role="status"
          aria-live="polite"
        >
          <p className="text-sm text-zinc-600 leading-relaxed">
            <strong className="text-zinc-800">
              Selecione pelo menos {MIN_COMPARACAO_ELEITORAL} pessoas
              distintas de {rotuloCargoComparacao(cargo)} para iniciar
              a comparação.
            </strong>{' '}
            Os indicadores aparecem lado a lado, sem ranking editorial.
          </p>
        </div>
      )}

      {/* Estado: erro estruturado (cargos diferentes) */}
      {temErro && comparacao?.erro && (
        <div
          className="rounded-lg border border-red-200 bg-red-50 p-5"
          role="alert"
          aria-live="assertive"
        >
          <p className="text-sm text-red-800 leading-relaxed">
            <strong className="text-red-900">
              Não foi possível comparar.
            </strong>{' '}
            {comparacao.erro.mensagem}
          </p>
        </div>
      )}

      {/* Resultado: tabela descritiva */}
      {temResultado && comparacao && (
        <>
          {resumoEstagios && (
            <p
              className="text-xs text-zinc-500 mb-4 leading-relaxed"
              aria-live="polite"
            >
              {resumoEstagios}
            </p>
          )}

          <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
            <table className="w-full text-sm">
              <caption className="sr-only">
                Comparação descritiva entre pessoas monitoradas para{' '}
                {rotuloCargoComparacao(comparacao.cargo)} em 2026 no DF.
                Indicadores: estágio, partido, evidências, datas de
                verificação e fontes. Sem ranking, nota ou inferência
                de intenção de voto.
              </caption>
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50">
                  <th
                    scope="col"
                    className="text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide px-4 py-3 w-44"
                  >
                    Indicador
                  </th>
                  {comparacao.pessoas.map((p) => (
                    <th
                      key={p.id}
                      scope="col"
                      className="text-left px-4 py-3 align-top"
                    >
                      <Link
                        href={`/perfil-eleitoral/${p.slug}`}
                        aria-label={`Ver perfil eleitoral de ${p.nome}`}
                        className="font-semibold text-zinc-900 hover:text-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
                      >
                        {p.nome}
                      </Link>
                      <p className="mt-1 text-xs text-zinc-500">
                        {rotuloCargoComparacao(p.cargo)}
                        {p.partido ? ` · ${p.partido}` : ''}
                      </p>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {/* Estágio */}
                <tr>
                  <th
                    scope="row"
                    className="text-left text-xs font-medium text-zinc-500 px-4 py-3"
                  >
                    Estágio de evidência
                  </th>
                  {comparacao.pessoas.map((p) => (
                    <td key={p.id} className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${classesEstagioComparacao(
                          p.estagio,
                        )}`}
                      >
                        {rotuloEstagioComparacao(p.estagio)}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Partido */}
                <tr>
                  <th
                    scope="row"
                    className="text-left text-xs font-medium text-zinc-500 px-4 py-3"
                  >
                    Partido
                  </th>
                  {comparacao.pessoas.map((p) => (
                    <td key={p.id} className="px-4 py-3 text-zinc-800">
                      {p.partido ?? (
                        <span className="text-zinc-400 italic">
                          sem partido registrado
                        </span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Total de evidências */}
                <tr>
                  <th
                    scope="row"
                    className="text-left text-xs font-medium text-zinc-500 px-4 py-3"
                  >
                    Total de evidências
                  </th>
                  {comparacao.pessoas.map((p) => (
                    <td key={p.id} className="px-4 py-3 text-zinc-800">
                      <span className="font-semibold">
                        {p.totalEvidencias}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Data da fonte mais recente */}
                <tr>
                  <th
                    scope="row"
                    className="text-left text-xs font-medium text-zinc-500 px-4 py-3"
                  >
                    Data da fonte mais recente
                  </th>
                  {comparacao.pessoas.map((p) => (
                    <td
                      key={p.id}
                      className="px-4 py-3 text-zinc-800"
                    >
                      {p.dataEvidenciaMaisRecente ? (
                        formatarDataComparacao(p.dataEvidenciaMaisRecente)
                      ) : (
                        <span className="text-zinc-400 italic">
                          sem evidência
                        </span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Verificada em */}
                <tr>
                  <th
                    scope="row"
                    className="text-left text-xs font-medium text-zinc-500 px-4 py-3"
                  >
                    Verificada em
                  </th>
                  {comparacao.pessoas.map((p) => (
                    <td
                      key={p.id}
                      className="px-4 py-3 text-zinc-800"
                    >
                      {p.dataVerificacaoMaisRecente ? (
                        formatarDataComparacao(p.dataVerificacaoMaisRecente)
                      ) : (
                        <span className="text-zinc-400 italic">
                          sem verificação registrada
                        </span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Evidências com fonte e URL específica */}
                <tr>
                  <th
                    scope="row"
                    className="text-left text-xs font-medium text-zinc-500 px-4 py-3 align-top"
                  >
                    Evidências (fonte e URL)
                  </th>
                  {comparacao.pessoas.map((p) => (
                    <td
                      key={p.id}
                      className="px-4 py-3 align-top"
                    >
                      {p.evidencias.length === 0 ? (
                        <span className="text-zinc-400 italic">
                          sem evidência registrada
                        </span>
                      ) : (
                        <ul className="space-y-2">
                          {p.evidencias.map((e) => (
                            <li
                              key={e.id}
                              className="text-xs leading-relaxed"
                            >
                              <p className="text-zinc-700">
                                {e.descricao}
                              </p>
                              <p className="text-zinc-500 mt-0.5">
                                <span className="text-zinc-600">
                                  Fonte:
                                </span>{' '}
                                <a
                                  href={e.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  aria-label={`Abrir fonte "${e.fonte}" da evidência em nova aba`}
                                  className="text-blue-600 hover:underline rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                                >
                                  {e.fonte}
                                </a>{' '}
                                · {formatarDataComparacao(e.dataEvidencia)}
                              </p>
                            </li>
                          ))}
                        </ul>
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Aviso metodológico */}
          <aside
            className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
            role="note"
            aria-label="Aviso metodológico sobre limites da comparação eleitoral"
          >
            <p className="font-semibold mb-1">Limites da comparação</p>
            <p className="leading-relaxed">
              Os indicadores são <strong>descritivos</strong> e
              derivam da base eleitoral independente. O número de
              evidências não mede popularidade, apoio, intenção de
              voto ou probabilidade de candidatura. Antes do
              registro no TSE, nenhuma pessoa é tratada como
              candidato oficial. Veja{' '}
              <Link
                href="/metodologia"
                aria-label="Ver metodologia completa"
                className="underline rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              >
                metodologia
              </Link>
              .
            </p>
          </aside>

          {/* Acesso aos perfis individuais */}
          <div className="mt-6 flex flex-wrap gap-3">
            {comparacao.pessoas.map((p) => (
              <Link
                key={p.id}
                href={`/perfil-eleitoral/${p.slug}`}
                aria-label={`Ver perfil eleitoral de ${p.nome}`}
                className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition"
              >
                Ver perfil de {p.nome} →
              </Link>
            ))}
          </div>
        </>
      )}

      {/* Estado de carregamento (acessibilidade) — exibido
          somente quando o usuário ainda não interagiu. */}
      {!cargo && semSelecao && (
        <p className="sr-only" role="status" aria-live="polite">
          {ROTULO_CARREGAMENTO}
        </p>
      )}
    </section>
  );
}
