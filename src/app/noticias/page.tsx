import Link from 'next/link';
import { noticias } from '@/data/noticias';
import { deputados } from '@/data/deputados';

// Build lookup map from data — no hardcoding, scales with any changes to deputados.ts
const deputadoPorSlug = Object.fromEntries(
  deputados.map((d) => [d.slug, d.nome])
);

interface Props {
  searchParams: Promise<{ deputado?: string }>;
}

export default async function NoticiasPage({ searchParams }: Props) {
  const { deputado: filtroDeputado } = await searchParams;

  const noticiasFiltradas = filtroDeputado
    ? noticias.filter((n) => n.deputadosRelacionados.includes(filtroDeputado))
    : noticias;

  const selectedDep = filtroDeputado
    ? deputados.find((d) => d.slug === filtroDeputado)
    : null;

  // Count news per deputy for the filter sidebar
  const newsPerDeputy = deputados
    .map((d) => ({
      slug: d.slug,
      nome: d.nome,
      partido: d.partido,
      foto: d.foto,
      count: noticias.filter((n) => n.deputadosRelacionados.includes(d.slug)).length,
    }))
    .filter((d) => d.count > 0)
    .sort((a, b) => b.count - a.count);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-2">
          {filtroDeputado && selectedDep
            ? `Notícias: ${selectedDep.nome}`
            : 'Notícias'}
        </h1>
        <p className="text-lg text-zinc-500 max-w-2xl">
          {filtroDeputado && selectedDep
            ? `Notícias relacionadas a ${selectedDep.nome} (${selectedDep.partido}) na cobertura da CLDF.`
            : 'Cobertura jornalística sobre a Câmara Legislativa do Distrito Federal e seus 24 deputados distritais. Atualizado automaticamente.'}
        </p>
        {filtroDeputado && (
          <Link
            href="/noticias"
            aria-label="Remover filtro de deputado e exibir todas as notícias"
            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline mt-3"
          >
            ← Limpar filtro e ver todas as notícias
          </Link>
        )}
      </div>

      {/* Filter sidebar + news grid */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar — deputy filter */}
        <aside className="lg:w-64 flex-shrink-0">
          <div className="rounded-xl border border-zinc-200 bg-white p-5 sticky top-4">
            <h2 className="font-semibold text-zinc-900 text-sm mb-3">
              Filtrar por deputado
            </h2>
            {newsPerDeputy.length === 0 ? (
              <p className="text-xs text-zinc-400">
                Nenhum deputado mencionado nas notícias.
              </p>
            ) : (
              <div className="space-y-1">
                {newsPerDeputy.map((d) => (
                  <Link
                    key={d.slug}
                    href={
                      filtroDeputado === d.slug
                        ? '/noticias'
                        : `/noticias?deputado=${d.slug}`
                    }
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                      filtroDeputado === d.slug
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-zinc-600 hover:bg-zinc-50'
                    }`}
                  >
                    <span className="text-xs text-zinc-400 ml-auto font-mono">
                      {d.count}
                    </span>
                    <span className="truncate">{d.nome}</span>
                    <span className="text-xs text-zinc-400 flex-shrink-0">
                      {d.partido}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* News list */}
        <div className="flex-1 min-w-0">
          {noticiasFiltradas.length === 0 ? (
            <div className="rounded-xl border border-zinc-200 bg-white p-12 text-center">
              <p className="text-zinc-400 text-lg">
                {filtroDeputado
                  ? 'Nenhuma notícia encontrada para este deputado.'
                  : 'Nenhuma notícia encontrada ainda.'}
              </p>
              <p className="text-zinc-400 text-sm mt-2">
                {filtroDeputado
                  ? 'Tente remover o filtro para ver todas as notícias.'
                  : 'As notícias serão carregadas automaticamente das fontes.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-zinc-400">
                {noticiasFiltradas.length}{' '}
                {noticiasFiltradas.length === 1 ? 'notícia encontrada' : 'notícias encontradas'}
                {filtroDeputado ? ` sobre ${selectedDep?.nome}` : ''}
              </p>
              {noticiasFiltradas.map((n) => (
                <a
                  key={n.id}
                  href={n.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Abrir notícia "${n.titulo}" de ${n.fonte} em nova aba`}
                  className="block rounded-xl border border-zinc-200 bg-white p-5 hover:border-blue-200 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <h2 className="font-semibold text-zinc-900 leading-snug">
                        {n.titulo}
                      </h2>
                      <p className="text-sm text-zinc-500 mt-1">{n.fonte}</p>
                    </div>
                    <span className="text-xs text-zinc-400 whitespace-nowrap mt-1">
                      {new Date(n.data).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-zinc-600 leading-relaxed line-clamp-2">
                    {n.resumo}
                  </p>
                  {n.deputadosRelacionados.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {n.deputadosRelacionados.map((slug) => (
                        <Link
                          key={slug}
                          href={`/noticias?deputado=${slug}`}
                          className="rounded-full bg-blue-50 text-blue-700 text-xs px-2 py-0.5 hover:bg-blue-100 transition cursor-pointer"
                        >
                          {deputadoPorSlug[slug] || slug}
                        </Link>
                      ))}
                    </div>
                  )}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
