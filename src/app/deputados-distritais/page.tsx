import type { Metadata } from 'next';
import Link from 'next/link';
import { deputados, partidos } from '@/data/deputados';
import { proposicoesPorDeputado } from '@/data/proposicoes';

export const metadata: Metadata = {
  title: 'Deputados Distritais — Lista dos 24 Deputados do DF 2026',
  description:
    'Lista dos 24 deputados distritais da Câmara Legislativa do Distrito Federal na legislatura 2023–2026, com filtros por partido, comissão, situação, região administrativa, tema e período de atividade.',
  alternates: {
    canonical: '/deputados-distritais',
  },
  openGraph: {
    title: 'Deputados Distritais — Lista dos 24 Deputados do DF 2026',
    description:
      'Os 24 deputados da CLDF na legislatura 2023–2026, com filtros combináveis e perfil individual de cada parlamentar.',
  },
  twitter: {
    title: 'Deputados Distritais — Lista dos 24 Deputados do DF 2026',
    description:
      'Os 24 deputados da CLDF na legislatura 2023–2026, com filtros combináveis e perfil individual de cada parlamentar.',
  },
};

interface Props {
  searchParams: Promise<{
    partido?: string;
    q?: string;
    comissao?: string;
    situacao?: string;
    regiao?: string;
    tema?: string;
    periodo?: string;
  }>;
}

// Mapa de cores por partido para identidade visual consistente nos cards.
// Cores baseadas na identidade histórica de cada legenda (aproximada).
const partidoCores: Record<string, string> = {
  PT: 'bg-red-100 text-red-700',
  MDB: 'bg-green-100 text-green-700',
  PSB: 'bg-yellow-100 text-yellow-700',
  Republicanos: 'bg-blue-100 text-blue-700',
  'União Brasil': 'bg-cyan-100 text-cyan-700',
  PSOL: 'bg-orange-100 text-orange-700',
  PL: 'bg-emerald-100 text-emerald-700',
  Democrata: 'bg-indigo-100 text-indigo-700',
  PP: 'bg-rose-100 text-rose-700',
  PSDB: 'bg-sky-100 text-sky-700',
  Podemos: 'bg-lime-100 text-lime-700',
  PSD: 'bg-teal-100 text-teal-700',
};

const corPartido = (partido: string): string =>
  partidoCores[partido] ?? 'bg-zinc-100 text-zinc-700';

const comissoes = [...new Set(deputados.flatMap((d) => d.comissoes))].sort();

const situacoes: { valor: string; rotulo: string }[] = [
  { valor: 'exercicio', rotulo: 'Em exercício' },
  { valor: 'licenca', rotulo: 'Em licença' },
  { valor: 'suplente', rotulo: 'Suplente' },
];

// Regiões administrativas e temas são derivados apenas das biografias oficiais
// (fonte: CLDF). Listas vazias em cada deputado significam "não declarado".
const regioesAdministrativas = [
  ...new Set(deputados.flatMap((d) => d.regioesAdministrativas ?? [])),
].sort();

const temas = [
  ...new Set(deputados.flatMap((d) => d.temas ?? [])),
].sort();

// Períodos derivados das datas das proposições reais catalogadas (fonte: CLDF).
// Quando não há proposições em um período, o filtro retorna lista vazia com
// estado honesto de indisponibilidade.
const periodos: { valor: string; rotulo: string }[] = [
  { valor: '2026-07', rotulo: 'Julho de 2026' },
  { valor: '2026-06', rotulo: 'Junho de 2026' },
  { valor: '2026', rotulo: 'Ano de 2026' },
];

const deputadoTemProposicaoNoPeriodo = (
  slug: string,
  periodo: string,
): boolean => {
  const props = proposicoesPorDeputado[slug];
  if (!props || props.length === 0) return false;
  return props.some((p) => p.data.startsWith(periodo));
};

export default async function DeputadosPage({ searchParams }: Props) {
  const {
    partido: filtroPartido,
    q: busca,
    comissao: filtroComissao,
    situacao: filtroSituacao,
    regiao: filtroRegiao,
    tema: filtroTema,
    periodo: filtroPeriodo,
  } = await searchParams;
  const partidoValido = filtroPartido
    ? partidos.find((p) => p === filtroPartido)
    : null;
  const comissaoValida = filtroComissao
    ? comissoes.find((c) => c === filtroComissao)
    : null;
  const situacaoValida = filtroSituacao
    ? situacoes.find((s) => s.valor === filtroSituacao)?.valor ?? null
    : null;
  const regiaoValida = filtroRegiao
    ? regioesAdministrativas.find((r) => r === filtroRegiao)
    : null;
  const temaValido = filtroTema ? temas.find((t) => t === filtroTema) : null;
  const periodoValido = filtroPeriodo
    ? periodos.find((p) => p.valor === filtroPeriodo)?.valor ?? null
    : null;

  const termoBusca = (busca ?? '').trim().toLowerCase();
  const deputadosFiltrados = deputados.filter((d) => {
    if (partidoValido && d.partido !== partidoValido) return false;
    if (comissaoValida && !d.comissoes.includes(comissaoValida)) return false;
    if (situacaoValida && d.statusMandato !== situacaoValida) return false;
    if (regiaoValida && !(d.regioesAdministrativas ?? []).includes(regiaoValida))
      return false;
    if (temaValido && !(d.temas ?? []).includes(temaValido)) return false;
    if (periodoValido && !deputadoTemProposicaoNoPeriodo(d.slug, periodoValido))
      return false;
    if (termoBusca) {
      const alvo = `${d.nome} ${d.nomeCompleto ?? ''} ${d.biografia}`.toLowerCase();
      if (!alvo.includes(termoBusca)) return false;
    }
    return true;
  });

  const haFiltrosAtivos = Boolean(
    partidoValido ||
      comissaoValida ||
      situacaoValida ||
      regiaoValida ||
      temaValido ||
      periodoValido ||
      termoBusca,
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-zinc-900">
          Deputados Distritais
        </h1>
        <p className="mt-3 text-lg text-zinc-500 max-w-2xl">
          Os 24 deputados da Câmara Legislativa do Distrito Federal na legislatura
          2023–2026. Clique em cada perfil para ver detalhes.
        </p>
        <p className="mt-3 text-sm">
          <Link
            href="/comparar"
            className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 font-medium text-blue-700 hover:bg-blue-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition"
          >
            Comparar deputados lado a lado →
          </Link>
        </p>
      </div>

      {/* Filtros combináveis */}
      <form
        className="mb-8 rounded-xl border border-zinc-200 bg-white p-4 md:p-5"
        action="/deputados-distritais"
        method="GET"
        role="search"
        aria-label="Filtros combináveis da listagem de deputados distritais"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="sm:col-span-2 lg:col-span-3">
            <label
              htmlFor="filtro-nome"
              className="block text-xs font-medium text-zinc-500 mb-1"
            >
              Nome ou biografia
            </label>
            <div className="relative">
              <input
                id="filtro-nome"
                type="search"
                name="q"
                defaultValue={busca ?? ''}
                placeholder="Buscar por nome ou biografia…"
                aria-label="Buscar deputado distrital por nome"
                className="w-full rounded-lg border border-zinc-300 bg-white pl-9 pr-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
              <button
                type="submit"
                aria-label="Buscar deputado distrital por nome"
                className="absolute left-1 top-1/2 -translate-y-1/2 inline-flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="filtro-partido"
              className="block text-xs font-medium text-zinc-500 mb-1"
            >
              Partido
            </label>
            <select
              id="filtro-partido"
              name="partido"
              defaultValue={partidoValido ?? ''}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <option value="">Todos os partidos</option>
              {partidos.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="filtro-comissao"
              className="block text-xs font-medium text-zinc-500 mb-1"
            >
              Comissão
            </label>
            <select
              id="filtro-comissao"
              name="comissao"
              defaultValue={comissaoValida ?? ''}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <option value="">Todas as comissões</option>
              {comissoes.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="filtro-situacao"
              className="block text-xs font-medium text-zinc-500 mb-1"
            >
              Situação
            </label>
            <select
              id="filtro-situacao"
              name="situacao"
              defaultValue={situacaoValida ?? ''}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <option value="">Todas as situações</option>
              {situacoes.map((s) => (
                <option key={s.valor} value={s.valor}>
                  {s.rotulo}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="filtro-regiao"
              className="block text-xs font-medium text-zinc-500 mb-1"
            >
              Região administrativa
            </label>
            <select
              id="filtro-regiao"
              name="regiao"
              defaultValue={regiaoValida ?? ''}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-describedby="filtro-regiao-ajuda"
            >
              <option value="">Todas as regiões</option>
              {regioesAdministrativas.length === 0 ? (
                <option value="" disabled>
                  Nenhuma região declarada nas biografias
                </option>
              ) : (
                regioesAdministrativas.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))
              )}
            </select>
            <p id="filtro-regiao-ajuda" className="mt-1 text-[11px] text-zinc-400">
              {regioesAdministrativas.length === 0
                ? 'Ainda não coletado nas biografias oficiais.'
                : 'Apenas regiões explicitamente citadas nas biografias (CLDF).'}
            </p>
          </div>

          <div>
            <label
              htmlFor="filtro-tema"
              className="block text-xs font-medium text-zinc-500 mb-1"
            >
              Tema de atuação
            </label>
            <select
              id="filtro-tema"
              name="tema"
              defaultValue={temaValido ?? ''}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-describedby="filtro-tema-ajuda"
            >
              <option value="">Todos os temas</option>
              {temas.length === 0 ? (
                <option value="" disabled>
                  Nenhum tema declarado nas biografias
                </option>
              ) : (
                temas.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))
              )}
            </select>
            <p id="filtro-tema-ajuda" className="mt-1 text-[11px] text-zinc-400">
              {temas.length === 0
                ? 'Ainda não coletado nas biografias oficiais.'
                : 'Temas citados nas biografias oficiais (CLDF).'}
            </p>
          </div>

          <div>
            <label
              htmlFor="filtro-periodo"
              className="block text-xs font-medium text-zinc-500 mb-1"
            >
              Período de atividade
            </label>
            <select
              id="filtro-periodo"
              name="periodo"
              defaultValue={periodoValido ?? ''}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-describedby="filtro-periodo-ajuda"
            >
              <option value="">Todos os períodos</option>
              {periodos.map((p) => (
                <option key={p.valor} value={p.valor}>
                  {p.rotulo}
                </option>
              ))}
            </select>
            <p id="filtro-periodo-ajuda" className="mt-1 text-[11px] text-zinc-400">
              Filtra por proposições catalogadas (CLDF). Sem proposições no período, o deputado não aparece.
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition"
          >
            Aplicar filtros
          </button>
          {haFiltrosAtivos && (
            <Link
              href="/deputados-distritais"
              className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition"
            >
              Limpar filtros
            </Link>
          )}
          <span className="text-xs text-zinc-400">
            {deputadosFiltrados.length} de {deputados.length} deputados
          </span>
        </div>
      </form>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-2">
        <div className="rounded-lg border border-zinc-200 bg-white p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{deputados.length}</p>
          <p className="text-xs text-zinc-500 mt-1">Deputados</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{partidos.length}</p>
          <p className="text-xs text-zinc-500 mt-1">Partidos</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">
            {deputados.filter((d) => d.statusMandato === 'exercicio').length}
          </p>
          <p className="text-xs text-zinc-500 mt-1">Em exercício</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">
            {new Set(deputados.map((d) => d.partido)).size}
          </p>
          <p className="text-xs text-zinc-500 mt-1">Partidos/Blocos</p>
        </div>
      </div>
      <p className="text-xs text-zinc-400 mb-10 text-center">
        Fonte: <a href="https://www.cl.df.gov.br/deputados-2023-2026" target="_blank" rel="noopener noreferrer" aria-label="Lista oficial dos deputados distritais 2023-2026 no site da CLDF (abre em nova aba)" className="text-blue-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded">CLDF — Câmara Legislativa do DF</a> — Legislatura 2023–2026
      </p>

      {/* Grid of deputies */}
      {haFiltrosAtivos && (
        <p className="text-sm text-zinc-500 mb-4">
          Mostrando {deputadosFiltrados.length} deputado
          {deputadosFiltrados.length !== 1 ? 's' : ''}
          {partidoValido ? ` · partido ${partidoValido}` : ''}
          {comissaoValida ? ` · comissão ${comissaoValida}` : ''}
          {situacaoValida
            ? ` · situação ${
                situacoes.find((s) => s.valor === situacaoValida)?.rotulo
              }`
            : ''}
          {regiaoValida ? ` · região ${regiaoValida}` : ''}
          {temaValido ? ` · tema ${temaValido}` : ''}
          {periodoValido
            ? ` · período ${
                periodos.find((p) => p.valor === periodoValido)?.rotulo
              }`
            : ''}
          {termoBusca ? ` · busca "${busca}"` : ''}.
        </p>
      )}
      {deputadosFiltrados.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-12 text-center">
          <p className="text-zinc-500">
            Nenhum deputado encontrado com os filtros atuais.
          </p>
          <Link
            href="/deputados-distritais"
            className="mt-3 inline-block text-sm font-semibold text-blue-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
          >
            Limpar filtros
          </Link>
        </div>
      ) : (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {deputadosFiltrados.map((dep) => (
          <Link
            key={dep.id}
            href={`/deputados-distritais/${dep.slug}`}
            aria-label={`Ver perfil de ${dep.nome} (${dep.partido})`}
            className="group rounded-xl border border-zinc-200 bg-white p-5 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-100/50 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <div className="flex items-center gap-4">
              <div className="relative h-14 w-14 flex-shrink-0">
                <div className="h-14 w-14 rounded-full overflow-hidden bg-zinc-100 ring-2 ring-zinc-100 group-hover:ring-blue-200 transition">
                  <img
                    src={dep.foto}
                    alt={dep.nome}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                {dep.statusMandato === 'exercicio' && (
                  <span
                    title="Em exercício"
                    aria-label="Em exercício"
                    className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-green-500 border-2 border-white"
                  />
                )}
              </div>
              <div className="min-w-0">
                <h2 className="font-semibold text-zinc-900 truncate group-hover:text-blue-600 transition">
                  {dep.nome}
                </h2>
                <span
                  className={`inline-block mt-1 rounded-full text-xs font-semibold px-2 py-0.5 ${corPartido(dep.partido)}`}
                >
                  {dep.partido}
                </span>
              </div>
            </div>
            <p className="mt-3 text-sm text-zinc-500 line-clamp-2 leading-relaxed">
              {dep.biografia}
            </p>
            {dep.comissoes.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {dep.comissoes.slice(0, 2).map((c) => (
                  <span
                    key={c}
                    className="rounded-full bg-zinc-100 text-zinc-600 text-xs px-2 py-0.5 truncate max-w-full"
                  >
                    {c}
                  </span>
                ))}
              </div>
            )}
            <div className="mt-3 flex items-center gap-1.5 text-xs">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-zinc-400" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6M9 13h6M9 17h6" />
              </svg>
              {(() => {
                const count = proposicoesPorDeputado[dep.slug]?.length || 0;
                return count > 0 ? (
                  <span className="text-zinc-600">
                    {count} {count === 1 ? 'proposição' : 'proposições'}
                  </span>
                ) : (
                  <span className="text-zinc-400 italic">
                    sem proposições na amostra
                  </span>
                );
              })()}
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-3">
              <div className="flex items-center gap-2 text-zinc-400">
                {dep.contatos.instagram && (
                  <span
                    title={`@${dep.contatos.instagram}`}
                    aria-label={`Instagram: @${dep.contatos.instagram}`}
                    className="inline-flex items-center justify-center"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                      <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16Zm0 1.62c-3.15 0-3.5.01-4.74.07-1.14.05-1.76.24-2.17.4-.55.22-.94.47-1.35.88-.41.41-.66.8-.88 1.35-.16.41-.35 1.03-.4 2.17-.06 1.24-.07 1.59-.07 4.74s.01 3.5.07 4.74c.05 1.14.24 1.76.4 2.17.22.55.47.94.88 1.35.41.41.8.66 1.35.88.41.16 1.03.35 2.17.4 1.24.06 1.59.07 4.74.07s3.5-.01 4.74-.07c1.14-.05 1.76-.24 2.17-.4.55-.22.94-.47 1.35-.88.41-.41.66-.8.88-1.35.16-.41.35-1.03.4-2.17.06-1.24.07-1.59.07-4.74s-.01-3.5-.07-4.74c-.05-1.14-.24-1.76-.4-2.17a3.6 3.6 0 0 0-.88-1.35 3.6 3.6 0 0 0-1.35-.88c-.41-.16-1.03-.35-2.17-.4-1.24-.06-1.59-.07-4.74-.07Zm0 2.76a5.46 5.46 0 1 1 0 10.92 5.46 5.46 0 0 1 0-10.92Zm0 1.62a3.84 3.84 0 1 0 0 7.68 3.84 3.84 0 0 0 0-7.68Zm5.65-2.88a1.28 1.28 0 1 1 0 2.56 1.28 1.28 0 0 1 0-2.56Z" />
                    </svg>
                  </span>
                )}
                {dep.contatos.email && (
                  <span
                    title={dep.contatos.email}
                    aria-label={`E-mail: ${dep.contatos.email}`}
                    className="inline-flex items-center justify-center"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                      <rect x="3" y="5" width="18" height="14" rx="2" />
                      <path d="m3 7 9 6 9-6" />
                    </svg>
                  </span>
                )}
              </div>
              <span className="text-xs font-medium text-blue-600 group-hover:translate-x-0.5 transition-transform">
                Ver perfil →
              </span>
            </div>
          </Link>
        ))}
      </div>
      )}
    </div>
  );
}
