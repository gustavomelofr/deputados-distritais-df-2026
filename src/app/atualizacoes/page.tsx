import type { Metadata } from 'next';
import Link from 'next/link';
import { noticias } from '@/data/noticias';
import { deputados } from '@/data/deputados';
import { proposicoes } from '@/data/proposicoes';

export const metadata: Metadata = {
  title: 'Atualizações Monitoradas — Deputados Distritais DF 2026',
  description:
    'Feed unificado de notícias, proposições e atividade pública dos deputados distritais do DF. Cada item mostra fonte, data e deputado relacionado.',
  alternates: {
    canonical: '/atualizacoes',
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Deputados Distritais DF 2026',
    title: 'Atualizações Monitoradas — Deputados Distritais DF 2026',
    description:
      'Feed unificado de notícias, proposições e atividade pública da CLDF.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Atualizações Monitoradas — Deputados Distritais DF 2026',
    description:
      'Feed unificado de notícias, proposições e atividade pública da CLDF.',
  },
};

// Lookup de slug -> nome do deputado, derivado dos dados (sem hardcoding).
const deputadoPorSlug = Object.fromEntries(
  deputados.map((d) => [d.slug, d.nome])
);

type TipoAtualizacao = 'noticia' | 'proposicao' | 'atividade-publica';

interface ItemAtualizacao {
  id: string;
  tipo: TipoAtualizacao;
  titulo: string;
  fonte: string;
  url?: string;
  data: string;
  resumo: string;
  deputadosRelacionados: string[];
}

// Constrói o feed unificado a partir das fontes disponíveis.
// - Notícias: agregadas via Google News RSS (P1) — disponível.
// - Proposições: API pública do PLE/CLDF (P1) — disponível (coleta julho/2026).
// - Atividade pública (Instagram): Instagram público (P2) — ainda não coletado.
function buildFeed(): ItemAtualizacao[] {
  const items: ItemAtualizacao[] = [];

  for (const n of noticias) {
    items.push({
      id: `noticia-${n.id}`,
      tipo: 'noticia',
      titulo: n.titulo,
      fonte: n.fonte,
      url: n.url,
      data: n.data,
      resumo: n.resumo,
      deputadosRelacionados: n.deputadosRelacionados,
    });
  }

  // Proposições reais coletadas da API pública do PLE/CLDF (P1).
  // Cada proposição já vem vinculada ao deputado autor via slug.
  for (const p of proposicoes) {
    items.push({
      id: `proposicao-${p.id}`,
      tipo: 'proposicao',
      titulo: p.titulo,
      fonte: 'CLDF — SAPL (PLE)',
      url: p.link || undefined,
      data: p.data,
      resumo: p.descricao,
      deputadosRelacionados: [p.deputadoSlug],
    });
  }

  // Atividade pública (Instagram): sem dados coletados ainda.
  // Quando a coleta P2 for iniciada, os posts entram aqui automaticamente.

  return items.sort(
    (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
  );
}

const tipoConfig: Record<
  TipoAtualizacao,
  { label: string; badgeClass: string; origem: string }
> = {
  noticia: {
    label: 'Notícia',
    badgeClass: 'bg-blue-100 text-blue-700',
    origem: 'Google News RSS (P1)',
  },
  proposicao: {
    label: 'Proposição',
    badgeClass: 'bg-purple-100 text-purple-700',
    origem: 'CLDF — SAPL (P1)',
  },
  'atividade-publica': {
    label: 'Atividade pública',
    badgeClass: 'bg-pink-100 text-pink-700',
    origem: 'Instagram público (P2)',
  },
};

interface Props {
  searchParams: Promise<{ tipo?: string }>;
}

export default async function AtualizacoesPage({ searchParams }: Props) {
  const { tipo: filtroTipo } = await searchParams;
  const feed = buildFeed();

  const tipos: TipoAtualizacao[] = [
    'noticia',
    'proposicao',
    'atividade-publica',
  ];
  const counts: Record<TipoAtualizacao, number> = {
    noticia: feed.filter((i) => i.tipo === 'noticia').length,
    proposicao: feed.filter((i) => i.tipo === 'proposicao').length,
    'atividade-publica': feed.filter(
      (i) => i.tipo === 'atividade-publica'
    ).length,
  };

  const tipoValido =
    filtroTipo && tipos.includes(filtroTipo as TipoAtualizacao)
      ? (filtroTipo as TipoAtualizacao)
      : null;

  const feedFiltrado = tipoValido
    ? feed.filter((i) => i.tipo === tipoValido)
    : feed;

  const ultimaData =
    feed.length > 0
      ? new Date(
          Math.max(...feed.map((i) => new Date(i.data).getTime()))
        ).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        })
      : null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-2">
          Atualizações monitoradas
        </h1>
        <p className="text-lg text-zinc-500 max-w-2xl">
          Feed unificado da atividade monitorada da Câmara Legislativa do
          Distrito Federal: notícias, proposições e atividade pública dos
          deputados distritais. Cada item mostra fonte, data, deputado
          relacionado e link externo quando disponível.
        </p>
        <p className="text-xs text-zinc-400 mt-2">
          Fontes: Google News RSS (P1) · CLDF — SAPL (P1) · Instagram público
          (P2)
          {ultimaData && <> · Última atualização: {ultimaData}</>}
        </p>
      </div>

      {/* Filtros por tipo — links de navegação que filtram via query string,
          não tabs que alternam conteúdo in-place. Por isso sem role="tablist"
          (que exigiria role="tab" e aria-selected nos filhos). */}
      <div className="flex flex-wrap gap-2 mb-8" aria-label="Filtrar atualizações por tipo">
        <Link
          href="/atualizacoes"
          aria-label="Exibir todas as atualizações"
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
            !tipoValido
              ? 'bg-zinc-900 text-white'
              : 'bg-white border border-zinc-200 text-zinc-600 hover:border-zinc-300'
          }`}
        >
          Todas ({feed.length})
        </Link>
        {tipos.map((t) => {
          const config = tipoConfig[t];
          const ativo = tipoValido === t;
          return (
            <Link
              key={t}
              href={ativo ? '/atualizacoes' : `/atualizacoes?tipo=${t}`}
              aria-label={`Filtrar por ${config.label} (${counts[t]} itens)`}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                ativo
                  ? 'bg-zinc-900 text-white'
                  : 'bg-white border border-zinc-200 text-zinc-600 hover:border-zinc-300'
              }`}
            >
              {config.label} ({counts[t]})
            </Link>
          );
        })}
      </div>

      {/* Estados vazios por tipo não coletado */}
      {counts.proposicao === 0 && (!tipoValido || tipoValido === 'proposicao') && (
        <div className="rounded-xl border border-zinc-200 bg-white p-6 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className={`rounded-full text-xs font-medium px-2.5 py-0.5 ${tipoConfig.proposicao.badgeClass}`}>
              {tipoConfig.proposicao.label}
            </span>
            <span className="rounded-full bg-amber-100 text-amber-700 text-xs font-medium px-2.5 py-0.5">
              ainda não coletado
            </span>
          </div>
          <p className="text-sm text-zinc-500 leading-relaxed">
            Projetos de lei, indicações, requerimentos e emendas apresentados
            na CLDF ainda não foram coletados. Quando a integração com a fonte
            oficial estiver ativa, cada proposição entrará automaticamente
            neste feed com fonte, data e deputado autor.
          </p>
          <p className="text-xs text-zinc-400 mt-3">
            Fonte prevista: {tipoConfig.proposicao.origem}
          </p>
        </div>
      )}
      {counts['atividade-publica'] === 0 &&
        (!tipoValido || tipoValido === 'atividade-publica') && (
          <div className="rounded-xl border border-zinc-200 bg-white p-6 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className={`rounded-full text-xs font-medium px-2.5 py-0.5 ${tipoConfig['atividade-publica'].badgeClass}`}>
                {tipoConfig['atividade-publica'].label}
              </span>
              <span className="rounded-full bg-amber-100 text-amber-700 text-xs font-medium px-2.5 py-0.5">
                ainda não coletado
              </span>
            </div>
            <p className="text-sm text-zinc-500 leading-relaxed">
              O monitoramento da atividade pública dos deputados distritais
              no Instagram ainda não foi iniciado. Quando ativo, cada post
              entrará neste feed com perfil de origem, data e link externo.
              O volume de posts não mede popularidade, apoio ou intenção de
              voto — apenas atividade registrada na fonte.
            </p>
            <p className="text-xs text-zinc-400 mt-3">
              Fonte prevista: {tipoConfig['atividade-publica'].origem}
            </p>
          </div>
        )}

      {/* Feed */}
      {feedFiltrado.length === 0 ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-12 text-center">
          <p className="text-zinc-400 text-lg">
            {tipoValido
              ? 'Nenhuma atualização deste tipo coletada ainda.'
              : 'Nenhuma atualização coletada ainda.'}
          </p>
          <p className="text-zinc-400 text-sm mt-2">
            As atualizações são agregadas de fontes públicas (P1/P2) e
            aparecerão aqui assim que coletadas.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-zinc-400">
            {feedFiltrado.length}{' '}
            {feedFiltrado.length === 1
              ? 'atualização'
              : 'atualizações'}
            {tipoValido ? ` de tipo ${tipoConfig[tipoValido].label.toLowerCase()}` : ''}
          </p>
          {feedFiltrado.map((item) => {
            const config = tipoConfig[item.tipo];
            return (
              <article
                key={item.id}
                className="flex flex-col rounded-xl border border-zinc-200 bg-white p-5 hover:border-blue-200 hover:shadow-sm transition-all"
              >
                <div className="flex items-center justify-between gap-3 mb-2">
                  <span
                    className={`rounded-full text-xs font-medium px-2.5 py-0.5 ${config.badgeClass}`}
                  >
                    {config.label}
                  </span>
                  <time
                    dateTime={item.data}
                    className="text-xs text-zinc-400 whitespace-nowrap"
                  >
                    {new Date(item.data).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </time>
                </div>
                <h2 className="font-semibold text-zinc-900 leading-snug">
                  {item.titulo}
                </h2>
                <p className="mt-2 text-sm text-zinc-600 leading-relaxed line-clamp-3">
                  {item.resumo}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-zinc-400">
                  <span>
                    <span className="text-zinc-500">Fonte:</span>{' '}
                    {item.url ? (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Abrir fonte "${item.fonte}" em nova aba`}
                        className="text-blue-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
                      >
                        {item.fonte}
                      </a>
                    ) : (
                      item.fonte
                    )}
                  </span>
                  {item.deputadosRelacionados.length > 0 && (
                    <span className="flex flex-wrap gap-1 items-center">
                      <span className="text-zinc-500">Deputado(s):</span>
                      {item.deputadosRelacionados.map((slug) => (
                        <Link
                          key={slug}
                          href={`/deputados-distritais/${slug}`}
                          aria-label={`Ver perfil de ${deputadoPorSlug[slug] || slug}`}
                          className="rounded-full bg-blue-50 text-blue-700 px-2 py-0.5 hover:bg-blue-100 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                        >
                          {deputadoPorSlug[slug] || slug}
                        </Link>
                      ))}
                    </span>
                  )}
                </div>
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Abrir ${config.label.toLowerCase()} "${item.titulo}" de ${item.fonte} em nova aba`}
                    className="mt-3 inline-flex items-center gap-1 text-xs text-blue-600 font-medium hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
                  >
                    Abrir fonte externa <span aria-hidden="true">→</span>
                  </a>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
