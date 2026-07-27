import { notFound } from 'next/navigation';
import Link from 'next/link';
import { deputados, getDeputadoBySlug } from '@/data/deputados';
import { noticias } from '@/data/noticias';
import { proposicoesPorDeputado } from '@/data/proposicoes';
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

  const proposicoesDeputado = (proposicoesPorDeputado[dep.slug] || []).slice(0, 8);

  const totalProposicoes = proposicoesPorDeputado[dep.slug]?.length || 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      {/* Back link */}
      <Link
        href="/deputados-distritais"
        className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-blue-600 transition mb-8 rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        ← Todos os deputados
      </Link>

      {/* Resumo executivo — indicadores rápidos do mandato */}
      <section
        aria-labelledby="resumo-titulo"
        className="rounded-xl border border-zinc-200 bg-gradient-to-br from-blue-50/60 to-white p-5 mb-8"
      >
        <h2 id="resumo-titulo" className="sr-only">
          Resumo executivo do mandato
        </h2>
        <dl className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <dt className="text-xs uppercase tracking-wide text-zinc-500">Partido</dt>
            <dd className="mt-1 text-sm font-semibold text-zinc-900">{dep.partido}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-zinc-500">Status</dt>
            <dd
              className={`mt-1 text-sm font-semibold ${
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
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-zinc-500">Comissões</dt>
            <dd className="mt-1 text-sm font-semibold text-zinc-900">
              {dep.comissoes.length > 0
                ? `${dep.comissoes.length} ${
                    dep.comissoes.length === 1 ? 'comissão' : 'comissões'
                  }`
                : 'Não registrada'}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-zinc-500">Proposições 2026</dt>
            <dd className="mt-1 text-sm font-semibold text-zinc-900">
              {totalProposicoes > 0
                ? `${totalProposicoes} ${
                    totalProposicoes === 1 ? 'proposição' : 'proposições'
                  }`
                : 'Sem amostra'}
            </dd>
          </div>
        </dl>
        <p className="text-xs text-zinc-400 mt-4">
          Resumo consolidado. Fonte:{' '}
          <a
            href="https://www.cl.df.gov.br/deputados-2023-2026"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="CLDF — Câmara Legislativa do DF (abre em nova aba)"
            className="text-blue-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
          >
            CLDF — Câmara Legislativa do DF
          </a>{' '}
          — Legislatura 2023–2026.
        </p>
      </section>

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
          <p className="text-xs text-zinc-400 mt-2">
            Fonte: <a href="https://www.cl.df.gov.br/deputados-2023-2026" target="_blank" rel="noopener noreferrer" aria-label="CLDF — Câmara Legislativa do DF (abre em nova aba)" className="text-blue-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded">CLDF — Câmara Legislativa do DF</a> — Legislatura 2023–2026
          </p>

          {/* Contact */}
          {dep.contatos && (
            <div className="mt-4">
              <div className="flex flex-wrap items-center gap-3">
              {dep.contatos.instagram && (
                <a
                  href={`https://instagram.com/${dep.contatos.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Perfil @${dep.contatos.instagram} de ${dep.nome} no Instagram (abre em nova aba)`}
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
                  aria-label={`Perfil @${dep.contatos.twitter} de ${dep.nome} no Twitter/X (abre em nova aba)`}
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
              {dep.contatos.telefone && (
                <a
                  href={`tel:${dep.contatos.telefone.replace(/[^\d+]/g, '')}`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 text-zinc-700 text-sm font-medium px-3 py-1 hover:bg-zinc-200 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" strokeLinejoin="round" />
                  </svg>
                  {dep.contatos.telefone}
                </a>
              )}
              </div>
              <p className="text-xs text-zinc-400 mt-2">
                Fonte: <a href="https://www.cl.df.gov.br/deputados-2023-2026" target="_blank" rel="noopener noreferrer" aria-label="CLDF — contatos oficiais (abre em nova aba)" className="text-blue-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded">CLDF</a> — contatos oficiais da legislatura 2023–2026
              </p>
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
            <p className="text-sm text-zinc-400">
              Nenhuma comissão registrada na fonte oficial. Se o deputado
              participa de comissão não listada, a atualização será feita na
              próxima coleta da CLDF.
            </p>
          )}
          <p className="text-xs text-zinc-400 mt-4">
            Fonte: <a href="https://www.cl.df.gov.br/deputados-2023-2026" target="_blank" rel="noopener noreferrer" aria-label="CLDF — comissões (abre em nova aba)" className="text-blue-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded">CLDF</a> — Legislatura 2023–2026
          </p>
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
              <span className="text-zinc-700 text-sm font-medium">
                {totalProposicoes} em 2026
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Presenças</span>
              <span className="text-zinc-400 text-sm italic">
                ainda não coletado
              </span>
            </div>
          </div>
          <p className="text-xs text-zinc-400 mt-4">
            Fonte: <a href="https://www.cl.df.gov.br/deputados-2023-2026" target="_blank" rel="noopener noreferrer" aria-label="CLDF — proposições (abre em nova aba)" className="text-blue-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded">CLDF</a> — Legislatura 2023–2026
          </p>
        </div>
      </div>

      {/* News related */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-zinc-900 mb-4">
          Notícias relacionadas
        </h2>
        {noticiasRelacionadas.length > 0 ? (
          <>
            <div className="space-y-3">
              {noticiasRelacionadas.map((n) => (
                <a
                  key={n.id}
                  href={n.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Abrir notícia "${n.titulo}" de ${n.fonte} em nova aba`}
                  className="block rounded-lg border border-zinc-200 bg-white p-4 hover:border-blue-200 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-medium text-zinc-900 text-sm">{n.titulo}</p>
                      <p className="text-xs text-zinc-500 mt-1">
                        Fonte: {n.fonte} —{' '}
                        <time dateTime={n.data}>
                          {new Date(n.data).toLocaleDateString('pt-BR')}
                        </time>
                      </p>
                    </div>
                    <time
                      dateTime={n.data}
                      className="text-xs text-zinc-400 whitespace-nowrap"
                    >
                      {new Date(n.data).toLocaleDateString('pt-BR')}
                    </time>
                  </div>
                  <p className="text-sm text-zinc-600 mt-2 line-clamp-2">
                    {n.resumo}
                  </p>
                </a>
              ))}
            </div>
            <p className="text-xs text-zinc-400 mt-3">
              Fonte: Google News RSS (P1) — data de publicação original em cada item.
            </p>
          </>
        ) : (
          <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-5">
            <p className="text-sm text-zinc-500 leading-relaxed">
              Nenhuma notícia relacionada a {dep.nome} foi capturada nas fontes
              monitoradas até o momento. A ausência aqui não significa ausência
              de cobertura jornalística — apenas que nenhuma menção foi
              associada a este deputado na coleta atual do Google News RSS.
            </p>
            <p className="text-xs text-zinc-400 mt-3">
              Fonte prevista: Google News RSS (P1).{' '}
              <Link
                href="/noticias"
                aria-label="Ver todas as notícias coletadas da CLDF"
                className="text-blue-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
              >
                Ver todas as notícias →
              </Link>
            </p>
          </div>
        )}
      </section>

      {/* Proposições */}
      <section className="rounded-xl border border-zinc-200 bg-white p-6 mb-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-zinc-900">Proposições</h2>
          <Link
            href={`/atualizacoes?tipo=proposicao`}
            aria-label={`Ver proposições de ${dep.nome} no feed de atualizações`}
            className="text-sm text-blue-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
          >
            Ver no feed →
          </Link>
        </div>
        {proposicoesDeputado.length > 0 ? (
          <div className="space-y-3">
            {proposicoesDeputado.map((p) => (
              <a
                key={p.id}
                href={p.link}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Abrir proposição ${p.sigla} — ${p.tipoOriginal} de ${p.autor} em nova aba`}
                className="block rounded-lg border border-zinc-200 p-4 hover:border-blue-200 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium text-zinc-900 text-sm">
                      {p.sigla} — {p.tipoOriginal}
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">
                      {p.autor} · {p.etapa}
                    </p>
                  </div>
                  <time
                    dateTime={p.data}
                    className="text-xs text-zinc-400 whitespace-nowrap"
                  >
                    {new Date(p.data).toLocaleDateString('pt-BR')}
                  </time>
                </div>
                <p className="text-sm text-zinc-600 mt-2 line-clamp-2">
                  {p.descricao}
                </p>
              </a>
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-400">
            Nenhuma proposição com dataLeitura em 2026 foi encontrada para
            este(a) deputado(a) na amostra coletada. A base completa está
            disponível na fonte oficial.
          </p>
        )}
        <p className="text-xs text-zinc-400 mt-3">
          Fonte: <a href="https://dados.cl.df.gov.br/id/dataset/proposicoes" target="_blank" rel="noopener noreferrer" aria-label="CLDF — SAPL (PLE) (abre em nova aba)" className="text-blue-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded">CLDF — SAPL (PLE)</a> (P1) — API pública do Processo Legislativo Eletrônico.
        </p>
      </section>

      {/* Presença em sessões */}
      <section
        aria-labelledby="presenca-titulo"
        className="rounded-xl border border-zinc-200 bg-white p-6 mb-10"
      >
        <h2 id="presenca-titulo" className="font-semibold text-zinc-900 mb-3">
          Presença em sessões
        </h2>
        {dep.presenca.length > 0 ? (
          <ul className="space-y-2">
            {dep.presenca.map((s) => (
              <li
                key={s.id}
                className="flex items-start justify-between gap-4 text-sm text-zinc-600"
              >
                <span className="min-w-0">
                  <span className="font-medium text-zinc-900">{s.descricao}</span>
                  <time dateTime={s.data} className="block text-xs text-zinc-400 mt-0.5">
                    {new Date(s.data).toLocaleDateString('pt-BR')}
                  </time>
                </span>
                <span
                  className={`whitespace-nowrap text-xs font-medium ${
                    s.presente ? 'text-green-600' : 'text-amber-600'
                  }`}
                >
                  {s.presente ? 'Presente' : 'Ausente'}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-zinc-400 leading-relaxed">
            A presença em sessões plenárias e comissões ainda não foi coletada
            para este(a) deputado(a). A fonte oficial é o sistema de presença
            da Câmara Legislativa do DF. Quando a coleta estiver disponível,
            cada sessão será exibida com data e status (presente/ausente).
          </p>
        )}
        <p className="text-xs text-zinc-400 mt-4">
          Fonte prevista: <a href="https://www.cl.df.gov.br/deputados-2023-2026" target="_blank" rel="noopener noreferrer" aria-label="CLDF — presença em sessões (abre em nova aba)" className="text-blue-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded">CLDF — presença em sessões</a> (P1) — ainda não coletado.
        </p>
      </section>

      {/* Gastos da cota parlamentar */}
      <section
        aria-labelledby="gastos-titulo"
        className="rounded-xl border border-zinc-200 bg-white p-6 mb-10"
      >
        <h2 id="gastos-titulo" className="font-semibold text-zinc-900 mb-3">
          Gastos da cota parlamentar
        </h2>
        {dep.gastos.length > 0 ? (
          <ul className="space-y-2">
            {dep.gastos.map((g) => (
              <li
                key={g.id}
                className="flex items-start justify-between gap-4 text-sm text-zinc-600"
              >
                <span className="min-w-0">
                  <span className="font-medium text-zinc-900">{g.tipo}</span>
                  <span className="block text-xs text-zinc-400 mt-0.5">
                    {g.descricao} —{' '}
                    <time dateTime={g.data}>
                      {new Date(g.data).toLocaleDateString('pt-BR')}
                    </time>
                  </span>
                </span>
                <span className="whitespace-nowrap text-sm font-medium text-zinc-700">
                  R$ {g.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-zinc-400 leading-relaxed">
            Os gastos da cota parlamentar ainda não foram coletados para
            este(a) deputado(a). A fonte oficial é a Câmara Legislativa do DF,
            que disponibiliza as despesas da verba de gabinete. Quando a coleta
            estiver disponível, cada despesa será exibida com tipo, valor, data
            e descrição.
          </p>
        )}
        <p className="text-xs text-zinc-400 mt-4">
          Fonte prevista: <a href="https://www.cl.df.gov.br/deputados-2023-2026" target="_blank" rel="noopener noreferrer" aria-label="CLDF — cota parlamentar (abre em nova aba)" className="text-blue-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded">CLDF — cota parlamentar</a> (P1) — ainda não coletado.
        </p>
      </section>

      {/* Atividade pública (Instagram) */}
      <section
        aria-labelledby="atividade-publica-titulo"
        className="rounded-xl border border-zinc-200 bg-white p-6 mb-10"
      >
        <div className="flex items-center justify-between mb-3">
          <h2 id="atividade-publica-titulo" className="font-semibold text-zinc-900">
            Atividade pública
          </h2>
          {dep.contatos?.instagram && (
            <a
              href={`https://instagram.com/${dep.contatos.instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Ver perfil @${dep.contatos.instagram} de ${dep.nome} no Instagram (abre em nova aba)`}
              className="text-sm text-blue-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
            >
              Ver perfil no Instagram →
            </a>
          )}
        </div>
        <p className="text-sm text-zinc-400 leading-relaxed">
          O monitoramento da atividade pública no Instagram ainda não foi
          iniciado para este(a) deputado(a). Nenhum dado de posts, frequência,
          temas ou engajamento está disponível neste momento. O volume de posts
          não mede popularidade, apoio ou intenção de voto — apenas atividade
          registrada na fonte monitorada.
        </p>
        <p className="text-xs text-zinc-400 mt-4">
          Fonte prevista: Instagram público (P2) — ainda não coletado.{' '}
          <Link href="/monitor-instagram" aria-label="Ver radar geral de atividade pública no Instagram" className="text-blue-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded">
            Ver radar geral →
          </Link>
        </p>
      </section>

      {/* Navegação entre deputados */}
      <nav
        aria-label="Navegação entre perfis de deputados"
        className="mt-8 flex items-center justify-between gap-4 border-t border-zinc-200 pt-6"
      >
        {(() => {
          const idx = deputados.findIndex((d) => d.slug === dep.slug);
          const anterior = idx > 0 ? deputados[idx - 1] : null;
          const proximo = idx < deputados.length - 1 ? deputados[idx + 1] : null;
          return (
            <>
              {anterior ? (
                <Link
                  href={`/deputados-distritais/${anterior.slug}`}
                  className="group flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-600 hover:text-blue-600 hover:bg-blue-50 transition flex-1 min-w-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  aria-label={`Perfil anterior: ${anterior.nome} (${anterior.partido})`}
                >
                  <span className="text-zinc-400 group-hover:text-blue-500 transition" aria-hidden="true">←</span>
                  <span className="min-w-0">
                    <span className="block text-xs text-zinc-400">Anterior</span>
                    <span className="block truncate font-medium">{anterior.nome}</span>
                  </span>
                </Link>
              ) : (
                <span className="flex-1" aria-hidden="true" />
              )}
              {proximo ? (
                <Link
                  href={`/deputados-distritais/${proximo.slug}`}
                  className="group flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-600 hover:text-blue-600 hover:bg-blue-50 transition flex-1 min-w-0 text-right justify-end focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  aria-label={`Próximo perfil: ${proximo.nome} (${proximo.partido})`}
                >
                  <span className="min-w-0">
                    <span className="block text-xs text-zinc-400">Próximo</span>
                    <span className="block truncate font-medium">{proximo.nome}</span>
                  </span>
                  <span className="text-zinc-400 group-hover:text-blue-500 transition" aria-hidden="true">→</span>
                </Link>
              ) : (
                <span className="flex-1" aria-hidden="true" />
              )}
            </>
          );
        })()}
      </nav>
    </div>
  );
}
