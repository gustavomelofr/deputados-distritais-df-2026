import Link from 'next/link';
import { deputados, partidos } from '@/data/deputados';

interface Props {
  searchParams: Promise<{ partido?: string; q?: string }>;
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

export default async function DeputadosPage({ searchParams }: Props) {
  const { partido: filtroPartido, q: busca } = await searchParams;
  const partidoValido = filtroPartido
    ? partidos.find((p) => p === filtroPartido)
    : null;

  const termoBusca = (busca ?? '').trim().toLowerCase();
  const deputadosFiltrados = deputados.filter((d) => {
    if (partidoValido && d.partido !== partidoValido) return false;
    if (termoBusca) {
      const alvo = `${d.nome} ${d.nomeCompleto ?? ''} ${d.biografia}`.toLowerCase();
      if (!alvo.includes(termoBusca)) return false;
    }
    return true;
  });

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
      </div>

      {/* Busca por nome */}
      <form className="mb-6" action="/deputados-distritais" method="GET" role="search">
        <div className="relative max-w-md">
          <input
            type="search"
            name="q"
            defaultValue={busca ?? ''}
            placeholder="Buscar por nome ou biografia…"
            aria-label="Buscar deputado distrital por nome"
            className="w-full rounded-lg border border-zinc-300 bg-white pl-10 pr-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
          <svg
            viewBox="0 0 24 24"
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </div>
      </form>

      {/* Filter by party */}
      <div className="mb-8 flex flex-wrap gap-2 items-center">
        <span className="text-sm font-medium text-zinc-500 mr-2">
          Partidos:
        </span>
        <Link
          href="/deputados-distritais"
          className={`rounded-full text-xs font-medium px-3 py-1 transition ${
            !partidoValido
              ? 'bg-blue-600 text-white'
              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
          }`}
        >
          Todos
        </Link>
        {partidos.map((p) => (
          <Link
            key={p}
            href={
              partidoValido === p
                ? '/deputados-distritais'
                : `/deputados-distritais?partido=${encodeURIComponent(p)}`
            }
            className={`rounded-full text-xs font-medium px-3 py-1 transition ${
              partidoValido === p
                ? 'bg-blue-600 text-white'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            }`}
          >
            {p}
          </Link>
        ))}
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
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

      {/* Grid of deputies */}
      {(partidoValido || termoBusca) && (
        <p className="text-sm text-zinc-500 mb-4">
          Mostrando {deputadosFiltrados.length} deputado
          {deputadosFiltrados.length !== 1 ? 's' : ''}
          {partidoValido ? ` de ${partidoValido}` : ''}
          {termoBusca ? ` para "${busca}"` : ''}.{' '}
          <Link href="/deputados-distritais" className="text-blue-600 hover:underline">
            Limpar filtros
          </Link>
        </p>
      )}
      {deputadosFiltrados.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-12 text-center">
          <p className="text-zinc-500">
            Nenhum deputado encontrado com os filtros atuais.
          </p>
          <Link
            href="/deputados-distritais"
            className="mt-3 inline-block text-sm font-semibold text-blue-600 hover:underline"
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
            className="group rounded-xl border border-zinc-200 bg-white p-5 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-100/50 transition-all"
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
