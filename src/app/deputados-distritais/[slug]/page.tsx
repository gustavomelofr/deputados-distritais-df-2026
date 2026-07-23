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
        className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-blue-600 transition mb-8"
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
            <div className="mt-4 flex flex-wrap gap-3">
              {dep.contatos.instagram && (
                <a
                  href={`https://instagram.com/${dep.contatos.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  Instagram
                </a>
              )}
              {dep.contatos.twitter && (
                <a
                  href={`https://twitter.com/${dep.contatos.twitter}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  Twitter/X
                </a>
              )}
              {dep.contatos.email && (
                <span className="text-sm text-zinc-500">
                  {dep.contatos.email}
                </span>
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
                className="block rounded-lg border border-zinc-200 bg-white p-4 hover:border-blue-200 transition"
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
