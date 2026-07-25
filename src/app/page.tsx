import Link from "next/link";
import { deputados } from "@/data/deputados";
import { noticias } from "@/data/noticias";

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-gradient-to-b from-blue-950 via-blue-900 to-zinc-900 text-white">
        <div className="mx-auto max-w-5xl px-4 py-20 md:py-28 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
            Atividade legislativa do{" "}
            <span className="text-blue-400">Distrito Federal</span> em monitoramento independente
          </h1>
          <p className="mt-6 text-lg md:text-xl text-blue-200 max-w-2xl mx-auto leading-relaxed">
            Os 24 deputados da Câmara Legislativa do Distrito Federal em exercício,
            movimentações para 2026, proposições, votações e atividade pública.
            Cada dado com recorte, data e limite de interpretação.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/deputados-distritais"
              aria-label="Consultar os 24 deputados distritais do DF em exercício"
              className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-500 transition shadow-lg shadow-blue-600/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-900"
            >
              Consultar deputados
            </Link>
            <Link
              href="/noticias"
              aria-label="Ver as últimas notícias sobre a Câmara Legislativa do DF"
              className="rounded-lg border border-white/20 bg-white/5 px-6 py-3 font-semibold text-white hover:bg-white/10 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-900"
            >
              Últimas notícias
            </Link>
            <Link
              href="/metodologia"
              aria-label="Ver a metodologia e as fontes de dados do monitor"
              className="rounded-lg border border-white/20 bg-white/5 px-6 py-3 font-semibold text-white hover:bg-white/10 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-900"
            >
              Metodologia
            </Link>
          </div>
        </div>
      </section>

      {/* Caminhos de navegação */}
      <section className="bg-white border-b border-zinc-200">
        <div className="mx-auto max-w-5xl px-4 py-14">
          <h2 className="text-2xl font-bold text-zinc-900 text-center mb-2">
            O que você quer acompanhar?
          </h2>
          <p className="text-zinc-500 text-center max-w-xl mx-auto mb-10">
            Três caminhos para explorar o monitoramento da Câmara Legislativa
            do Distrito Federal.
          </p>
          <div className="grid md:grid-cols-3 gap-5">
            <Link
              href="/deputados-distritais"
              aria-label="Acessar a lista dos 24 deputados distritais em exercício"
              className="group rounded-xl border border-zinc-200 p-6 hover:border-blue-300 hover:shadow-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <h3 className="font-semibold text-zinc-900 group-hover:text-blue-600 transition">
                Deputados em exercício
              </h3>
              <p className="mt-2 text-sm text-zinc-500 leading-relaxed">
                Os 24 deputados da CLDF na legislatura 2023–2026, com perfil,
                partido, comissões e contatos extraídos da fonte oficial.
              </p>
              <span className="mt-4 inline-flex items-center text-sm font-semibold text-blue-600 group-hover:text-blue-500 transition">
                Ver deputados →
              </span>
            </Link>
            <Link
              href="/noticias"
              aria-label="Acessar a atividade legislativa: notícias e proposições da CLDF"
              className="group rounded-xl border border-zinc-200 p-6 hover:border-blue-300 hover:shadow-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <h3 className="font-semibold text-zinc-900 group-hover:text-blue-600 transition">
                Atividade legislativa
              </h3>
              <p className="mt-2 text-sm text-zinc-500 leading-relaxed">
                Cobertura jornalística da CLDF via Google News RSS, com
                notícias organizadas por deputado. Proposições e votações
                ainda não foram coletadas.
              </p>
              <span className="mt-4 inline-flex items-center text-sm font-semibold text-blue-600 group-hover:text-blue-500 transition">
                Ver notícias →
              </span>
            </Link>
            <Link
              href="/cenario-2026"
              aria-label="Acessar o cenário eleitoral de 2026 para o Distrito Federal"
              className="group rounded-xl border border-zinc-200 p-6 hover:border-blue-300 hover:shadow-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <h3 className="font-semibold text-zinc-900 group-hover:text-blue-600 transition">
                Cenário eleitoral de 2026
              </h3>
              <p className="mt-2 text-sm text-zinc-500 leading-relaxed">
                Pré-candidaturas e movimentações políticas para as eleições
                distritais de 2026, com recorte por partido e posição.
              </p>
              <span className="mt-4 inline-flex items-center text-sm font-semibold text-blue-600 group-hover:text-blue-500 transition">
                Ver cenário 2026 →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <Link
              href="/deputados-distritais"
              className="group rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label="Ver lista dos 24 deputados distritais em exercício"
            >
              <p className="text-3xl font-bold text-blue-600 group-hover:text-blue-500 transition">
                {deputados.length}
              </p>
              <p className="text-sm text-zinc-500 mt-1 group-hover:text-blue-600 transition">
                Deputados em exercício
              </p>
            </Link>
            <Link
              href="/deputados-distritais"
              className="group rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label="Ver lista de deputados distritais por partido"
            >
              <p className="text-3xl font-bold text-blue-600 group-hover:text-blue-500 transition">
                {new Set(deputados.map((d) => d.partido)).size}
              </p>
              <p className="text-sm text-zinc-500 mt-1 group-hover:text-blue-600 transition">
                Partidos representados
              </p>
            </Link>
            <div className="rounded-lg focus:outline-none">
              <p className="text-3xl font-bold text-zinc-300">
                —
              </p>
              <p className="text-sm text-zinc-400 mt-1">
                Proposições{" "}
                <span className="italic">(ainda não coletado)</span>
              </p>
              <p className="text-xs text-zinc-400 mt-1 leading-tight max-w-[160px] mx-auto">
                Fonte prevista: CLDF — SAPL (P1)
              </p>
            </div>
            <Link
              href="/noticias"
              className="group rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label="Ver todas as notícias organizadas sobre a CLDF"
            >
              <p className="text-3xl font-bold text-blue-600 group-hover:text-blue-500 transition">
                {noticias.length}
              </p>
              <p className="text-sm text-zinc-500 mt-1 group-hover:text-blue-600 transition">
                Notícias organizadas
              </p>
            </Link>
          </div>
          <p className="text-xs text-zinc-400 text-center mt-6">
            Deputados: <a href="https://www.cl.df.gov.br/deputados-2023-2026" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">CLDF</a> (Legislatura 2023–2026) &middot; Notícias: Google News RSS (P1)
          </p>
        </div>
      </section>

      {/* Atualizações monitoradas (feed unificado) */}
      <section className="bg-white border-b border-zinc-200">
        <div className="mx-auto max-w-5xl px-4 py-12">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-zinc-900">
                Atualizações monitoradas
              </h2>
              <p className="text-sm text-zinc-500 mt-1">
                Feed unificado de notícias, proposições e atividade pública
                dos deputados distritais. Cada item mostra fonte, data e
                deputado relacionado.
              </p>
            </div>
            <Link
              href="/atualizacoes"
              aria-label="Ver todas as atualizações monitoradas"
              className="text-sm font-semibold text-blue-600 hover:text-blue-500 transition whitespace-nowrap"
            >
              Ver todas →
            </Link>
          </div>
          {/* Resumo do feed por tipo (fonte factual, sem inventar) */}
          <dl
            className="flex flex-wrap gap-2 mb-6"
            aria-label="Contagem de atualizações por tipo no feed unificado"
          >
            <Link
              href="/atualizacoes?tipo=noticia"
              aria-label={`Ver ${noticias.length} notícias no feed`}
              className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 text-blue-700 px-3 py-1 text-xs font-medium hover:bg-blue-100 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <span className="rounded-full bg-blue-100 px-2 py-0.5">Notícia</span>
              <span className="font-semibold" aria-label={`${noticias.length} notícias`}>
                {noticias.length}
              </span>
            </Link>
            <Link
              href="/atualizacoes?tipo=proposicao"
              aria-label={`Ver ${deputados.flatMap((d) => d.proposicoes).length} proposições no feed`}
              className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 text-purple-700 px-3 py-1 text-xs font-medium hover:bg-purple-100 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
            >
              <span className="rounded-full bg-purple-100 px-2 py-0.5">Proposição</span>
              <span className="font-semibold" aria-label={`${deputados.flatMap((d) => d.proposicoes).length} proposições`}>
                {deputados.flatMap((d) => d.proposicoes).length}
              </span>
              {deputados.flatMap((d) => d.proposicoes).length === 0 && (
                <span className="text-purple-400 italic">ainda não coletado</span>
              )}
            </Link>
            <Link
              href="/atualizacoes?tipo=atividade-publica"
              aria-label="Ver atividade pública no feed (Instagram ainda não coletado)"
              className="inline-flex items-center gap-1.5 rounded-full bg-pink-50 text-pink-700 px-3 py-1 text-xs font-medium hover:bg-pink-100 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500"
            >
              <span className="rounded-full bg-pink-100 px-2 py-0.5">Atividade pública</span>
              <span className="font-semibold" aria-label="0 atividade pública">
                0
              </span>
              <span className="text-pink-400 italic">ainda não coletado</span>
            </Link>
          </dl>
          <div className="grid md:grid-cols-3 gap-4">
            {noticias.length === 0 ? (
              <div className="md:col-span-3 rounded-xl border border-zinc-200 p-8 text-center">
                <p className="text-zinc-400">
                  Nenhuma atualização coletada ainda.
                </p>
                <p className="text-zinc-400 text-sm mt-1">
                  As atualizações são agregadas de fontes públicas (P1/P2) e
                  serão exibidas assim que coletadas.
                </p>
              </div>
            ) : (
              [...noticias]
                .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
                .slice(0, 3)
                .map((n) => (
                  <a
                    key={n.id}
                    href={n.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Notícia "${n.titulo}" — ${n.fonte}, abre em nova aba`}
                    className="flex flex-col rounded-xl border border-zinc-200 p-5 hover:border-blue-200 hover:shadow-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
                      <span className="rounded-full bg-blue-100 text-blue-700 font-medium px-2 py-0.5">
                        Notícia
                      </span>
                      <time dateTime={n.data}>
                        {new Date(n.data).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'short',
                        })}
                      </time>
                    </div>
                    <h3 className="font-semibold text-zinc-900 text-sm leading-snug line-clamp-3">
                      {n.titulo}
                    </h3>
                    <p className="mt-2 text-xs text-zinc-500 leading-relaxed line-clamp-2">
                      {n.resumo}
                    </p>
                    <p className="mt-2 text-xs text-zinc-400">
                      Fonte: {n.fonte}
                    </p>
                  </a>
                ))
            )}
          </div>
          <p className="text-xs text-zinc-400 mt-4">
            O feed completo em{' '}
            <Link
              href="/atualizacoes"
              aria-label="Ver feed de atualizações monitoradas"
              className="text-blue-600 hover:underline"
            >
              /atualizacoes
            </Link>{' '}
            diferencia notícias, proposições e atividade pública, com filtro
            por tipo. Proposições (CLDF — SAPL) e atividade pública
            (Instagram) ainda não foram coletadas.
          </p>
        </div>
      </section>

      {/* Distribuição por partido */}
      <section className="bg-zinc-50 border-b border-zinc-200">
        <div className="mx-auto max-w-5xl px-4 py-12">
          <h2 className="text-2xl font-bold text-zinc-900 text-center mb-2">
            Distribuição partidária
          </h2>
          <p className="text-zinc-500 text-center max-w-xl mx-auto mb-10">
            Composição da CLDF por partido. Cada barra representa o número de
            deputados distritais em exercício filiados àquela legenda.
          </p>
          <div className="space-y-3">
            {Object.entries(
              deputados.reduce<Record<string, number>>((acc, d) => {
                acc[d.partido] = (acc[d.partido] ?? 0) + 1;
                return acc;
              }, {})
            )
              .sort((a, b) => b[1] - a[1])
              .map(([partido, count]) => {
                const pct = Math.round((count / deputados.length) * 100);
                return (
                  <Link
                    key={partido}
                    href={`/deputados-distritais?partido=${encodeURIComponent(partido)}`}
                    className="flex items-center gap-3 group rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    title={`Ver deputados filiados a ${partido}`}
                  >
                    <div className="w-20 shrink-0 text-sm font-medium text-zinc-700 text-right group-hover:text-blue-600 transition">
                      {partido}
                    </div>
                    <div className="flex-1 h-7 rounded-md bg-zinc-200 overflow-hidden">
                      <div
                        className="h-full bg-blue-600 transition-all group-hover:bg-blue-500"
                        style={{ width: `${pct}%` }}
                        aria-label={`${count} deputados (${pct}%)`}
                      />
                    </div>
                    <div className="w-16 shrink-0 text-sm text-zinc-500 group-hover:text-blue-600 transition">
                      {count} {count === 1 ? "deputado" : "deputados"}
                    </div>
                  </Link>
                );
              })}
          </div>
        </div>
      </section>

      {/* Coverage */}
      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-4 py-16">
          <h2 className="text-2xl font-bold text-zinc-900 text-center mb-2">
            Cobertura atual
          </h2>
          <p className="text-zinc-500 text-center max-w-xl mx-auto mb-4">
            Resumo verificável do que está sendo monitorado agora. Métricas
            calculadas a partir dos dados publicados, não inventadas.
          </p>
          <p className="text-xs text-zinc-400 text-center mb-10">
            Última atualização da cobertura:{" "}
            {noticias.length > 0
              ? new Date(
                  Math.max(...noticias.map((n) => new Date(n.data).getTime()))
                ).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })
              : "—"}
            {" "}· Deputados: CLDF (Legislatura 2023–2026) · Notícias: Google News RSS (P1)
          </p>

          {/* Métricas verificáveis */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            <Link
              href="/deputados-distritais"
              className="rounded-xl border border-zinc-200 p-5 text-center hover:border-blue-300 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label="Deputados monitorados: acessar lista"
            >
              <p className="text-3xl font-bold text-blue-600">
                {deputados.length}
              </p>
              <p className="text-sm text-zinc-500 mt-1">
                Deputados monitorados
              </p>
              <p className="text-xs text-zinc-400 mt-1">de 24 em exercício</p>
              <p className="text-xs text-zinc-400 mt-2 leading-tight">
                Fonte: CLDF
              </p>
            </Link>
            <div
              className="rounded-xl border border-zinc-200 p-5 text-center"
              aria-label="Proposições catalogadas: ainda não coletado"
            >
              <p className="text-3xl font-bold text-zinc-300">—</p>
              <p className="text-sm text-zinc-500 mt-1">
                Proposições catalogadas
              </p>
              <p className="text-xs text-zinc-400 mt-1">
                <span className="italic">ainda não coletado</span>
              </p>
              <p className="text-xs text-zinc-400 mt-2 leading-tight">
                Fonte prevista: CLDF — SAPL (P1)
              </p>
            </div>
            <Link
              href="/noticias"
              className="rounded-xl border border-zinc-200 p-5 text-center hover:border-blue-300 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label="Notícias organizadas: acessar"
            >
              <p className="text-3xl font-bold text-blue-600">
                {noticias.length}
              </p>
              <p className="text-sm text-zinc-500 mt-1">
                Notícias organizadas
              </p>
              <p className="text-xs text-zinc-400 mt-1">
                {new Set(noticias.map((n) => n.fonte)).size} veículos
              </p>
              <p className="text-xs text-zinc-400 mt-2 leading-tight">
                Fonte: Google News RSS (P1)
              </p>
            </Link>
            <div
              className="rounded-xl border border-zinc-200 p-5 text-center"
              aria-label="Fontes ativas no monitoramento"
            >
              <p className="text-3xl font-bold text-blue-600">
                {noticias.length > 0
                  ? new Set(noticias.map((n) => n.fonte)).size
                  : 0}
              </p>
              <p className="text-sm text-zinc-500 mt-1">Fontes ativas</p>
              <p className="text-xs text-zinc-400 mt-1">
                veículos com notícias coletadas
              </p>
              <p className="text-xs text-zinc-400 mt-2 leading-tight">
                P1: CLDF + Google News · P2: Instagram (não iniciado)
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "CLDF",
                desc: "Perfis dos 24 deputados distritais com biografia, foto, comissões e contatos, extraídos diretamente da Câmara Legislativa.",
                status: "ativo",
              },
              {
                title: "Notícias",
                desc: "Cobertura jornalística sobre a CLDF e cada deputado, agregada do Google News RSS de veículos como G1, Correio Braziliense, Brasil de Fato e outros.",
                status: "ativo",
              },
              {
                title: "Instagram Radar",
                desc: "Monitoramento da atividade pública dos deputados distritais no Instagram: frequência de posts, temas e engajamento. A coleta ainda não foi iniciada.",
                status: "em breve",
                href: "/monitor-instagram",
              },
              {
                title: "Cenário 2026",
                desc: "Pré-candidaturas e movimentações políticas para as eleições distritais de 2026, com recorte por partido e posição.",
                status: "ativo",
                href: "/cenario-2026",
              },
            ].map((item) => {
              const card = (
                <div className="rounded-xl border border-zinc-200 p-6 hover:border-zinc-300 transition h-full">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-zinc-900">{item.title}</h3>
                    <span className={`rounded-full text-xs font-medium px-2.5 py-0.5 ${
                      item.status === 'ativo'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {item.status === 'ativo' ? 'ativo' : 'em breve'}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-500 leading-relaxed">{item.desc}</p>
                </div>
              );
              return item.href ? (
                <Link
                  key={item.title}
                  href={item.href}
                  aria-label={`${item.title}: ${item.desc}`}
                  className="block h-full rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  {card}
                </Link>
              ) : (
                <div key={item.title} className="h-full">{card}</div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Situação das bases */}
      <section className="bg-white border-b border-zinc-200">
        <div className="mx-auto max-w-5xl px-4 py-16">
          <h2 className="text-2xl font-bold text-zinc-900 text-center mb-2">
            Situação das bases de dados
          </h2>
          <p className="text-zinc-500 text-center max-w-xl mx-auto mb-12">
            Situação de cada fonte de dados monitorada. Nenhum dado é inventado:
            o que ainda não foi coletado é informado com transparência.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Notícias */}
            <div className="rounded-xl border border-zinc-200 p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-zinc-900">Notícias</h3>
                <span className="rounded-full bg-green-100 text-green-700 text-xs font-medium px-2.5 py-0.5">
                  disponível
                </span>
              </div>
              <p className="text-sm text-zinc-500 mb-3">
                Agregação de notícias sobre a CLDF e deputados distritais via
                Google News RSS.
              </p>
              <div className="text-xs text-zinc-400 space-y-1">
                <p>
                  <span className="text-zinc-600">Registros:</span>{" "}
                  {noticias.length}
                </p>
                <p>
                  <span className="text-zinc-600">Período:</span>{" "}
                  {new Date(
                    Math.min(...noticias.map((n) => new Date(n.data).getTime()))
                  ).toLocaleDateString("pt-BR")}{" "}
                  a{" "}
                  {new Date(
                    Math.max(...noticias.map((n) => new Date(n.data).getTime()))
                  ).toLocaleDateString("pt-BR")}
                </p>
                <p>
                  <span className="text-zinc-600">Última coleta:</span>{" "}
                  {new Date(
                    Math.max(...noticias.map((n) => new Date(n.data).getTime()))
                  ).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                <p>
                  <span className="text-zinc-600">Fonte:</span> Google News RSS
                  (P1)
                </p>
              </div>
            </div>

            {/* Instagram */}
            <div className="rounded-xl border border-zinc-200 p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-zinc-900">Instagram</h3>
                <span className="rounded-full bg-amber-100 text-amber-700 text-xs font-medium px-2.5 py-0.5">
                  ainda não coletado
                </span>
              </div>
              <p className="text-sm text-zinc-500 mb-3">
                Monitoramento da atividade pública dos deputados distritais no
                Instagram.
              </p>
              <div className="text-xs text-zinc-400 space-y-1">
                <p>
                  <span className="text-zinc-600">Registros:</span>{" "}
                  <span className="text-zinc-300">—</span>
                </p>
                <p>
                  <span className="text-zinc-600">Período:</span>{" "}
                  <span className="text-zinc-300">—</span>
                </p>
                <p>
                  <span className="text-zinc-600">Última coleta:</span>{" "}
                  <span className="text-zinc-300">—</span>
                </p>
                <p>
                  <span className="text-zinc-600">Fonte:</span> Instagram
                  público (P2)
                </p>
              </div>
            </div>

            {/* Proposições */}
            <div className="rounded-xl border border-zinc-200 p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-zinc-900">Proposições</h3>
                <span className="rounded-full bg-amber-100 text-amber-700 text-xs font-medium px-2.5 py-0.5">
                  ainda não coletado
                </span>
              </div>
              <p className="text-sm text-zinc-500 mb-3">
                Projetos de lei, indicações, requerimentos e emendas
                apresentados na CLDF.
              </p>
              <div className="text-xs text-zinc-400 space-y-1">
                <p>
                  <span className="text-zinc-600">Registros:</span>{" "}
                  <span className="text-zinc-300">—</span>
                </p>
                <p>
                  <span className="text-zinc-600">Período:</span>{" "}
                  <span className="text-zinc-300">—</span>
                </p>
                <p>
                  <span className="text-zinc-600">Última coleta:</span>{" "}
                  <span className="text-zinc-300">—</span>
                </p>
                <p>
                  <span className="text-zinc-600">Fonte:</span> CLDF — SAPL
                  (P1)
                </p>
              </div>
            </div>

            {/* Presença */}
            <div className="rounded-xl border border-zinc-200 p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-zinc-900">Presença em sessões</h3>
                <span className="rounded-full bg-amber-100 text-amber-700 text-xs font-medium px-2.5 py-0.5">
                  ainda não coletado
                </span>
              </div>
              <p className="text-sm text-zinc-500 mb-3">
                Registro de presença dos deputados nas sessões ordinárias e
                extraordinárias da CLDF.
              </p>
              <div className="text-xs text-zinc-400 space-y-1">
                <p>
                  <span className="text-zinc-600">Registros:</span>{" "}
                  <span className="text-zinc-300">—</span>
                </p>
                <p>
                  <span className="text-zinc-600">Período:</span>{" "}
                  <span className="text-zinc-300">—</span>
                </p>
                <p>
                  <span className="text-zinc-600">Última coleta:</span>{" "}
                  <span className="text-zinc-300">—</span>
                </p>
                <p>
                  <span className="text-zinc-600">Fonte:</span> CLDF — Dados
                  Abertos (P1)
                </p>
              </div>
            </div>
          </div>
          <p className="text-center text-xs text-zinc-400 mt-6">
            Dados atualizados automaticamente pelo agente de monitoramento. A
            indisponibilidade de uma base não significa que ela deixará de ser
            coletada — a integração é contínua e progressiva.
          </p>
        </div>
      </section>

      {/* Sobre */}
      <section className="bg-zinc-50">
        <div className="mx-auto max-w-5xl px-4 py-16">
          <div className="rounded-xl border border-zinc-200 bg-white p-8">
            <h2 className="text-xl font-bold text-zinc-900 mb-2">
              Como funciona
            </h2>
            <p className="text-zinc-600 leading-relaxed">
              Este monitor é operado por um <strong>agente autônomo contínuo</strong> que
              trabalha 24 horas por dia: coleta dados de fontes oficiais e abertas,
              atualiza o site automaticamente, e reporta novidades.
            </p>
            <p className="text-zinc-600 leading-relaxed mt-3">
              Toda alteração é commitada no{" "}
              <a
                href="https://github.com/gustavomelofr/deputados-distritais-df-2026"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Repositório público no GitHub do monitor dos deputados distritais do DF (abre em nova aba)"
                className="text-blue-600 underline"
              >
                repositório público no GitHub
              </a>
              . O código do agente, as fontes e a metodologia estão disponíveis
              para consulta e contribuição.
            </p>
            <Link
              href="/metodologia"
              aria-label="Ver metodologia e fontes de dados do monitor"
              className="inline-flex items-center gap-1 mt-4 text-sm font-semibold text-blue-600 hover:text-blue-500 transition"
            >
              Ver metodologia e fontes →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
