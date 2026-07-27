import type { Metadata } from 'next';
import Link from 'next/link';
import { deputados } from '@/data/deputados';
import { proposicoesPorDeputado, ProposicaoComAutor } from '@/data/proposicoes';

export const metadata: Metadata = {
  title: 'Comparar Deputados — Deputados Distritais DF 2026',
  description:
    'Comparação lado a lado de até 3 deputados distritais do DF usando indicadores de fonte clara (CLDF). Sem ranking editorial enganoso.',
  alternates: {
    canonical: '/comparar',
  },
  openGraph: {
    title: 'Comparar Deputados — Deputados Distritais DF 2026',
    description:
      'Comparação lado a lado de deputados distritais com indicadores de fonte clara.',
  },
  twitter: {
    title: 'Comparar Deputados — Deputados Distritais DF 2026',
    description:
      'Comparação lado a lado de deputados distritais com indicadores de fonte clara.',
  },
};

interface Props {
  searchParams: Promise<{
    a?: string;
    b?: string;
    c?: string;
  }>;
}

const MAX_COMPARACAO = 3;
const MIN_COMPARACAO = 2;

// Conta proposições por tipo para um deputado (fonte: CLDF/PLE).
function contarPorTipo(
  slug: string,
): Record<string, number> {
  const props = proposicoesPorDeputado[slug] ?? [];
  const porTipo: Record<string, number> = {};
  for (const p of props) {
    const rotulo = p.tipoOriginal || p.tipo;
    porTipo[rotulo] = (porTipo[rotulo] ?? 0) + 1;
  }
  return porTipo;
}

// Conta proposições por status para um deputado (fonte: CLDF/PLE).
function contarPorStatus(
  slug: string,
): Record<string, number> {
  const props = proposicoesPorDeputado[slug] ?? [];
  const porStatus: Record<string, number> = {};
  for (const p of props) {
    porStatus[p.status] = (porStatus[p.status] ?? 0) + 1;
  }
  return porStatus;
}

const rotuloStatus: Record<string, string> = {
  apresentada: 'Apresentada',
  em_tramitacao: 'Em tramitação',
  aprovada: 'Aprovada',
  rejeitada: 'Rejeitada',
};

const rotuloSituacao: Record<string, string> = {
  exercicio: 'Em exercício',
  licenca: 'Em licença',
  suplente: 'Suplente',
};

export default async function CompararPage({ searchParams }: Props) {
  const { a: aSlug, b: bSlug, c: cSlug } = await searchParams;

  // Valida slugs recebidos contra a lista real de deputados (fonte: CLDF).
  const slugsRecebidos = [aSlug, bSlug, cSlug]
    .filter((s): s is string => Boolean(s))
    .filter((s) => deputados.some((d) => d.slug === s));

  // Remove duplicatas mantendo ordem.
  const slugsUnicos = [...new Set(slugsRecebidos)].slice(0, MAX_COMPARACAO);

  const selecionados = slugsUnicos
    .map((slug) => deputados.find((d) => d.slug === slug))
    .filter((d): d is NonNullable<typeof d> => Boolean(d));

  // Monta querystring preservando seleção para links de adicionar/trocar.
  const qs = (slugs: string[]) =>
    slugs
      .map((s, i) => `${['a', 'b', 'c'][i]}=${encodeURIComponent(s)}`)
      .join('&');

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-zinc-900">
          Comparar deputados
        </h1>
        <p className="mt-3 text-lg text-zinc-500 max-w-2xl">
          Selecione de {MIN_COMPARACAO} a {MAX_COMPARACAO} deputados distritais
          para visualizar lado a lado indicadores de fonte clara. Esta página
          descreve fatos, não produz ranking: o objetivo é facilitar inspeção,
          não classificar deputados como “melhores” ou “piores”.
        </p>
      </div>

      {/* Aviso metodológico */}
      <aside
        className="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
        role="note"
        aria-label="Aviso metodológico sobre limites da comparação"
      >
        <p className="font-semibold mb-1">Limites da comparação</p>
        <p className="leading-relaxed">
          Os indicadores abaixo são <strong>descritivos</strong> e provêm de
          fontes oficiais (CLDF e Processo Legislativo Eletrônico). O{' '}
          <strong>volume de proposições</strong> não mede popularidade, apoio,
          intenção de voto, produtividade real nem qualidade legislativa —
          depende do tipo de instrumento (requerimentos e indicações são
          rotineiros; projetos de lei exigem tramitação mais longa). Temas e
          regiões administrativas refletem apenas o que consta na biografia
          oficial. Presença, gastos e atividade pública ainda não foram
          coletados e aparecem como indisponíveis. Veja{' '}
          <Link
            href="/metodologia"
            aria-label="Ver metodologia e limites da comparação"
            className="underline rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
          >
            metodologia
          </Link>
          .
        </p>
      </aside>

      {/* Seletores */}
      <form
        className="mb-8 rounded-xl border border-zinc-200 bg-white p-4 md:p-5"
        action="/comparar"
        method="GET"
        aria-label="Selecionar deputados para comparação"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[0, 1, 2].map((i) => {
            const name = ['a', 'b', 'c'][i];
            const atual = slugsUnicos[i];
            return (
              <div key={name}>
                <label
                  htmlFor={`comparar-${name}`}
                  className="block text-xs font-medium text-zinc-500 mb-1"
                >
                  Deputado {i + 1}
                  {i >= MIN_COMPARACAO && (
                    <span className="ml-1 text-zinc-400">(opcional)</span>
                  )}
                </label>
                <select
                  id={`comparar-${name}`}
                  name={name}
                  defaultValue={atual ?? ''}
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <option value="">— selecionar —</option>
                  {deputados.map((d) => (
                    <option key={d.slug} value={d.slug}>
                      {d.nome} ({d.partido})
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition"
          >
            Comparar
          </button>
          <span className="text-xs text-zinc-400">
            Selecione no mínimo {MIN_COMPARACAO} deputados distintos.
          </span>
        </div>
      </form>

      {/* Estado: sem seleção suficiente */}
      {selecionados.length < MIN_COMPARACAO ? (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-12 text-center">
          <p className="text-zinc-600">
            Selecione pelo menos {MIN_COMPARACAO} deputados distintos para
            iniciar a comparação.
          </p>
          <p className="mt-2 text-sm text-zinc-400">
            Os indicadores aparecem lado a lado, sem ranking editorial.
          </p>
        </div>
      ) : (
        <>
          {/* Tabela comparativa */}
          <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
            <table className="w-full text-sm">
              <caption className="sr-only">
                Comparação de indicadores descritivos entre deputados
                distritais selecionados. Fonte: CLDF e Processo Legislativo
                Eletrônico.
              </caption>
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50">
                  <th
                    scope="col"
                    className="text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide px-4 py-3 w-44"
                  >
                    Indicador
                  </th>
                  {selecionados.map((d) => (
                    <th
                      key={d.slug}
                      scope="col"
                      className="text-left px-4 py-3 align-top"
                    >
                      <Link
                        href={`/deputados-distritais/${d.slug}`}
                        aria-label={`Ver perfil de ${d.nome} (${d.partido})`}
                        className="font-semibold text-zinc-900 hover:text-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
                      >
                        {d.nome}
                      </Link>
                      <p className="mt-1 text-xs text-zinc-500">
                        {d.partido} · {rotuloSituacao[d.statusMandato]}
                      </p>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {/* Partido */}
                <tr>
                  <th
                    scope="row"
                    className="text-left text-xs font-medium text-zinc-500 px-4 py-3"
                  >
                    Partido
                  </th>
                  {selecionados.map((d) => (
                    <td key={d.slug} className="px-4 py-3 text-zinc-800">
                      {d.partido}
                    </td>
                  ))}
                </tr>

                {/* Situação do mandato */}
                <tr>
                  <th
                    scope="row"
                    className="text-left text-xs font-medium text-zinc-500 px-4 py-3"
                  >
                    Situação do mandato
                  </th>
                  {selecionados.map((d) => (
                    <td key={d.slug} className="px-4 py-3 text-zinc-800">
                      {rotuloSituacao[d.statusMandato]}
                    </td>
                  ))}
                </tr>

                {/* Comissões */}
                <tr>
                  <th
                    scope="row"
                    className="text-left text-xs font-medium text-zinc-500 px-4 py-3 align-top"
                  >
                    Comissões
                  </th>
                  {selecionados.map((d) => (
                    <td key={d.slug} className="px-4 py-3 text-zinc-800">
                      {d.comissoes.length > 0 ? (
                        <ul className="list-disc pl-4 space-y-0.5">
                          {d.comissoes.map((c) => (
                            <li key={c}>{c}</li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-zinc-400 italic">
                          Não declarado na biografia oficial
                        </span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Temas declarados */}
                <tr>
                  <th
                    scope="row"
                    className="text-left text-xs font-medium text-zinc-500 px-4 py-3 align-top"
                  >
                    Temas de atuação
                  </th>
                  {selecionados.map((d) => (
                    <td key={d.slug} className="px-4 py-3 text-zinc-800">
                      {(d.temas ?? []).length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {d.temas!.map((t) => (
                            <span
                              key={t}
                              className="rounded-full bg-zinc-100 text-zinc-700 text-xs px-2 py-0.5"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-zinc-400 italic">
                          Não declarado na biografia oficial
                        </span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Regiões administrativas */}
                <tr>
                  <th
                    scope="row"
                    className="text-left text-xs font-medium text-zinc-500 px-4 py-3 align-top"
                  >
                    Regiões administrativas
                  </th>
                  {selecionados.map((d) => (
                    <td key={d.slug} className="px-4 py-3 text-zinc-800">
                      {(d.regioesAdministrativas ?? []).length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {d.regioesAdministrativas!.map((r) => (
                            <span
                              key={r}
                              className="rounded-full bg-zinc-100 text-zinc-700 text-xs px-2 py-0.5"
                            >
                              {r}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-zinc-400 italic">
                          Não declarado na biografia oficial
                        </span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Proposições — total */}
                <tr>
                  <th
                    scope="row"
                    className="text-left text-xs font-medium text-zinc-500 px-4 py-3 align-top"
                  >
                    Proposições catalogadas (total)
                  </th>
                  {selecionados.map((d) => {
                    const total =
                      proposicoesPorDeputado[d.slug]?.length ?? 0;
                    return (
                      <td key={d.slug} className="px-4 py-3 text-zinc-800">
                        {total > 0 ? (
                          <span className="font-semibold">{total}</span>
                        ) : (
                          <span className="text-zinc-400 italic">
                            Sem proposições na amostra
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* Proposições — por tipo */}
                <tr>
                  <th
                    scope="row"
                    className="text-left text-xs font-medium text-zinc-500 px-4 py-3 align-top"
                  >
                    Proposições por tipo
                  </th>
                  {selecionados.map((d) => {
                    const porTipo = contarPorTipo(d.slug);
                    const tipos = Object.keys(porTipo).sort();
                    return (
                      <td key={d.slug} className="px-4 py-3 text-zinc-800">
                        {tipos.length > 0 ? (
                          <ul className="space-y-0.5">
                            {tipos.map((t) => (
                              <li key={t} className="text-xs">
                                <span className="text-zinc-600">{t}:</span>{' '}
                                <span className="font-medium">
                                  {porTipo[t]}
                                </span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-zinc-400 italic">
                            Sem proposições na amostra
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* Proposições — por status */}
                <tr>
                  <th
                    scope="row"
                    className="text-left text-xs font-medium text-zinc-500 px-4 py-3 align-top"
                  >
                    Proposições por status
                  </th>
                  {selecionados.map((d) => {
                    const porStatus = contarPorStatus(d.slug);
                    const status = Object.keys(porStatus).sort();
                    return (
                      <td key={d.slug} className="px-4 py-3 text-zinc-800">
                        {status.length > 0 ? (
                          <ul className="space-y-0.5">
                            {status.map((s) => (
                              <li key={s} className="text-xs">
                                <span className="text-zinc-600">
                                  {rotuloStatus[s] ?? s}:
                                </span>{' '}
                                <span className="font-medium">
                                  {porStatus[s]}
                                </span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-zinc-400 italic">
                            Sem proposições na amostra
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* Presença */}
                <tr>
                  <th
                    scope="row"
                    className="text-left text-xs font-medium text-zinc-500 px-4 py-3 align-top"
                  >
                    Presença em sessões
                  </th>
                  {selecionados.map((d) => (
                    <td key={d.slug} className="px-4 py-3">
                      <span className="text-zinc-400 italic">
                        Ainda não coletado
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Gastos */}
                <tr>
                  <th
                    scope="row"
                    className="text-left text-xs font-medium text-zinc-500 px-4 py-3 align-top"
                  >
                    Gastos da cota parlamentar
                  </th>
                  {selecionados.map((d) => (
                    <td key={d.slug} className="px-4 py-3">
                      <span className="text-zinc-400 italic">
                        Ainda não coletado
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Atividade pública (Instagram) */}
                <tr>
                  <th
                    scope="row"
                    className="text-left text-xs font-medium text-zinc-500 px-4 py-3 align-top"
                  >
                    Atividade pública (Instagram)
                  </th>
                  {selecionados.map((d) => (
                    <td key={d.slug} className="px-4 py-3 text-zinc-800">
                      {d.contatos.instagram ? (
                        <span className="text-xs">
                          @
                          <a
                            href={`https://instagram.com/${d.contatos.instagram}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Perfil @${d.contatos.instagram} de ${d.nome} no Instagram (abre em nova aba)`}
                            className="text-blue-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
                          >
                            {d.contatos.instagram}
                          </a>{' '}
                          <span className="text-zinc-400">
                            (contato declarado; posts não coletados)
                          </span>
                        </span>
                      ) : (
                        <span className="text-zinc-400 italic">
                          Não declarado
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Fonte */}
          <p className="mt-4 text-xs text-zinc-400">
            Fontes: biografias, partidos, comissões, temas e regiões —{' '}
            <a
              href="https://www.cl.df.gov.br/deputados-2023-2026"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Lista oficial dos deputados distritais 2023-2026 no site da CLDF (abre em nova aba)"
              className="text-blue-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
            >
              CLDF — Câmara Legislativa do DF
            </a>
            . Proposições —{' '}
            <a
              href="https://dados.cl.df.gov.br/id/dataset/proposicoes"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Dataset público de proposições da CLDF (abre em nova aba)"
              className="text-blue-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
            >
              Processo Legislativo Eletrônico (PLE/CLDF)
            </a>
            . Coleta: julho de 2026.
          </p>

          {/* Acesso aos perfis individuais */}
          <div className="mt-6 flex flex-wrap gap-3">
            {selecionados.map((d) => (
              <Link
                key={d.slug}
                href={`/deputados-distritais/${d.slug}`}
                aria-label={`Ver perfil de ${d.nome} (${d.partido})`}
                className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition"
              >
                Ver perfil de {d.nome} →
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
