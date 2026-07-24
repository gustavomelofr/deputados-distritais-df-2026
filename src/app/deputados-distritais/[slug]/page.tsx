import { notFound } from 'next/navigation';
import Link from 'next/link';
import { deputados, getDeputadoBySlug } from '@/data/deputados';
import { noticias } from '@/data/noticias';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return deputados.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const dep = getDeputadoBySlug(slug);
  if (!dep) return { title: 'Deputado não encontrado' };
  return {
    title: `${dep.nome} (${dep.partido}) — Deputado Distrital DF`,
    description: `Perfil do deputado distrital ${dep.nome} (${dep.partido}) na Câmara Legislativa do DF. Biografia, proposições e notícias relacionadas.`,
  };
}

export default async function DeputadoPage({ params }: Props) {
  const { slug } = await params;
  const dep = getDeputadoBySlug(slug);
  if (!dep) notFound();

  const noticiasRelacionadas = noticias.filter((n) =>
    n.deputadosRelacionados.includes(dep.slug)
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      {/* Back link */}
      <Link
        href="/deputados-distritais"
        className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-blue-600 transition mb-8 rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        ← Todos os deputados
      </Link>

      {/* Profile header */}
      <div className="flex flex-col md:flex-row gap-6 md:gap-10 mb-10">
        <div className="flex-shrink-0">
          <div className="h-32 w-32 md:h-40 md:w-40 rounded-2xl overflow-hidden bg-zinc-100 ring-4 ring-zinc-100">
            <img
              src={dep.foto}
              alt={dep.nome}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h1 className="text-2xl md:text-3xl font-bold text-zinc-900">
              {dep.nome}
            </h1>
            <span className="rounded-full bg-blue-100 text-blue-700 text-sm font-semibold px-3 py-1">
              {dep.partido}
            </span>
          </div>
          <p className="text-zinc-500 text-sm mb-3">{dep.nomeCompleto}</p>
          <p className="text-zinc-600 leading-relaxed">{dep.biografia}</p>

          {/* Contact */}
          {dep.contatos && (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {dep.contatos.instagram && (
                <a
                  href={`https://instagram.com/${dep.contatos.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full bg-pink-50 text-pink-700 text-sm font-medium px-3 py-1 hover:bg-pink-100 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                    <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16Zm0 1.62c-3.15 0-3.5.01-4.74.07-.9.04-1.39.19-1.71.32-.43.17-.74.37-1.06.69-.32.32-.52.63-.69 1.06-.13.32-.28.81-.32 1.71-.06 1.24-.07 1.59-.07 4.74s.01 3.5.07 4.74c.04.9.19 1.39.32 1.71.17.43.37.74.69 1.06.32.32.63.52 1.06.69.32.13.81.28 1.71.32 1.24.06 1.59.07 4.74.07s3.5-.01 4.74-.07c.9-.04 1.39-.19 1.71-.32.43-.17.74-.37 1.06-.69.32-.32.52-.63.69-1.06.13-.32.28-.81.32-1.71.06-1.24.07-1.59.07-4.74s-.01-3.5-.07-4.74c-.04-.9-.19-1.39-.32-1.71a2.85 2.85 0 0 0-.69-1.06 2.85 2.85 0 0 0-1.06-.69c-.32-.13-.81-.28-1.71-.32-1.24-.06-1.59-.07-4.74-.07Zm0 2.76a5.46 5.46 0 1 1 0 10.92 5.46 5.46 0 0 1 0-10.92Zm0 1.62a3.84 3.84 0 1 0 0 7.68 3.84 3.84 0 0 0 0-7.68Zm5.65-2.88a1.28 1.28 0 1 1 0 2.56 1.28 1.28 0 0 1 0-2.56Z" />
                  </svg>
                  Instagram
                </a>
              )}
              {dep.contatos.twitter && (
                <a
                  href={`https://twitter.com/${dep.contatos.twitter}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 text-sky-700 text-sm font-medium px-3 py-1 hover:bg-sky-100 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                    <path d="M18.9 2.5h3.3l-7.2 8.2 8.5 11.3h-6.6l-5.2-6.8-6 6.8H2.4l7.7-8.8L2 2.5h6.8l4.7 6.2 5.4-6.2Zm-1.2 17.5h1.8L7.4 4.3H5.5l12.2 15.7Z" />
                  </svg>
                  Twitter/X
                </a>
              )}
              {dep.contatos.email && (
                <a
                  href={`mailto:${dep.contatos.email}`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 text-zinc-700 text-sm font-medium px-3 py-1 hover:bg-zinc-200 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M3 6.5h18v11H3z" strokeLinejoin="round" />
                    <path d="m3.5 7 8.5 6 8.5-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {dep.contatos.email}
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Info cards */}
      <div className="grid md:grid-cols-2 gap-6 mb-10">
        {/* Comissões */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="font-semibold text-zinc-900 mb-3">Comissões</h2>
          {dep.comissoes.length > 0 ? (
            <ul className="space-y-2">
              {dep.comissoes.map((c) => (
                <li key={c} className="flex items-start gap-2 text-sm text-zinc-600">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                  {c}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-zinc-400">Nenhuma comissão registrada.</p>
          )}
        </div>

        {/* Status */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="font-semibold text-zinc-900 mb-3">Mandato</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-500">Status</span>
              <span
                className={`font-medium ${
                  dep.statusMandato === 'exercicio'
                    ? 'text-green-600'
                    : dep.statusMandato === 'licenca'
                    ? 'text-amber-600'
                    : 'text-zinc-600'
                }`}
              >
                {dep.statusMandato === 'exercicio'
                  ? 'Em exercício'
                  : dep.statusMandato === 'licenca'
                  ? 'Licença'
                  : 'Suplente'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Legislatura</span>
              <span className="text-zinc-700">2023–2026</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Proposições</span>
              <span className="text-zinc-700">
                {dep.proposicoes.length} registradas
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Presenças</span>
              <span className="text-zinc-700">
                {dep.presenca.length} sessões registradas
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* News related */}
      {noticiasRelacionadas.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold text-zinc-900 mb-4">
            Notícias relacionadas
          </h2>
          <div className="space-y-3">
            {noticiasRelacionadas.map((n) => (
              <a
                key={n.id}
                href={n.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-lg border border-zinc-200 bg-white p-4 hover:border-blue-200 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium text-zinc-900 text-sm">{n.titulo}</p>
                    <p className="text-xs text-zinc-500 mt-1">{n.fonte}</p>
                  </div>
                  <span className="text-xs text-zinc-400 whitespace-nowrap">
                    {new Date(n.data).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <p className="text-sm text-zinc-600 mt-2 line-clamp-2">
                  {n.resumo}
                </p>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Proposições placeholder */}
      <section className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="font-semibold text-zinc-900 mb-2">Proposições</h2>
        <p className="text-sm text-zinc-400">
          As proposições do(a) deputado(a) serão carregadas automaticamente da
          base de dados da CLDF nas próximas atualizações do sistema.
        </p>
      </section>
    </div>
  );
}
