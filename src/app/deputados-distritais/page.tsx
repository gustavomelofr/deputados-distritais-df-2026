import Link from 'next/link';
import { deputados, partidos } from '@/data/deputados';

interface Props {
  searchParams: Promise<{ partido?: string }>;
}

export default async function DeputadosPage({ searchParams }: Props) {
  const { partido: filtroPartido } = await searchParams;
  const partidoValido = filtroPartido
    ? partidos.find((p) => p === filtroPartido)
    : null;

  const deputadosFiltrados = partidoValido
    ? deputados.filter((d) => d.partido === partidoValido)
    : deputados;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-zinc-900">
          Deputados Distritais
        </h1>
        <p className="mt-3 text-lg text-zinc-500 max-w-2xl">
          Os 24 deputados da Câmara Legislativa do Distrito Federal na legislatura
          2023–2026. Clique em cada perfil para ver detalhes.
        </p>
      </div>

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
      {partidoValido && (
        <p className="text-sm text-zinc-500 mb-4">
          Mostrando {deputadosFiltrados.length} deputado
          {deputadosFiltrados.length !== 1 ? 's' : ''} de {partidoValido}.{' '}
          <Link href="/deputados-distritais" className="text-blue-600 hover:underline">
            Ver todos
          </Link>
        </p>
      )}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {deputadosFiltrados.map((dep) => (
          <Link
            key={dep.id}
            href={`/deputados-distritais/${dep.slug}`}
            className="group rounded-xl border border-zinc-200 bg-white p-5 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-100/50 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full overflow-hidden bg-zinc-100 flex-shrink-0 ring-2 ring-zinc-100 group-hover:ring-blue-200 transition">
                <img
                  src={dep.foto}
                  alt={dep.nome}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="min-w-0">
                <h2 className="font-semibold text-zinc-900 truncate group-hover:text-blue-600 transition">
                  {dep.nome}
                </h2>
                <p className="text-sm text-zinc-500">{dep.partido}</p>
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
          </Link>
        ))}
      </div>
    </div>
  );
}
