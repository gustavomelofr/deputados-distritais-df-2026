import Link from 'next/link';
import { deputados } from '@/data/deputados';

export default function Cenario2026Page() {
  const partidosAgrupados = deputados.reduce<Record<string, typeof deputados>>(
    (acc, d) => {
      if (!acc[d.partido]) acc[d.partido] = [];
      acc[d.partido].push(d);
      return acc;
    },
    {}
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-2">
        Cenário 2026
      </h1>
      <p className="text-lg text-zinc-500 mb-10">
        Composição atual da Câmara Legislativa do DF e acompanhamento do
        cenário eleitoral de 2026. Informações sobre pré-candidaturas e
        movimentações serão adicionadas conforme as fontes oficiais são
        integradas.
      </p>

      {/* Overview */}
      <section className="rounded-xl border border-zinc-200 bg-white p-6 mb-8">
        <h2 className="text-xl font-semibold text-zinc-900 mb-3">
          Panorama atual
        </h2>
        <p className="text-zinc-600 leading-relaxed">
          As 24 cadeiras da Câmara Legislativa do Distrito Federal estarão em
          disputa nas eleições de 2026. A composição atual da CLDF — base dos
          possíveis candidatos à reeleição — está listada abaixo com fonte na
          Câmara Legislativa.
        </p>
        <p className="text-zinc-600 leading-relaxed mt-3">
          Informações sobre pré-candidaturas declaradas, movimentações públicas
          e intenções de candidatura ainda não foram coletadas. Quando
          disponíveis, serão apresentadas por estágio de evidência, cada uma
          com fonte e data.
        </p>
        <p className="text-xs text-zinc-400 mt-4">
          Fonte prevista: DivulgaCand/TSE (P2) e Google News RSS (P1) — ainda
          não coletado.
        </p>
      </section>

      {/* Current composition */}
      <section className="rounded-xl border border-zinc-200 bg-white p-6 mb-8">
        <h2 className="text-xl font-semibold text-zinc-900 mb-4">
          Composição atual da CLDF
        </h2>
        <p className="text-sm text-zinc-500 mb-4">
          Distribuição dos 24 deputados distritais em exercício por partido,
          base da possível composição eleitoral de 2026.
        </p>
        <div className="space-y-4">
          {Object.entries(partidosAgrupados)
            .sort(([, a], [, b]) => b.length - a.length)
            .map(([partido, dps]) => (
              <div key={partido}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-zinc-800 text-sm">
                    {partido}
                  </span>
                  <span className="rounded-full bg-zinc-100 text-zinc-600 text-xs px-2 py-0.5">
                    {dps.length} deputado{dps.length > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {dps.map((d) => (
                    <Link
                      key={d.slug}
                      href={`/deputados-distritais/${d.slug}`}
                      className="rounded-lg bg-zinc-50 border border-zinc-200 px-3 py-1.5 text-xs text-zinc-700 hover:bg-blue-50 hover:border-blue-200 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    >
                      {d.nome}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
        </div>
        <p className="text-xs text-zinc-400 mt-5">
          Fonte: <a href="https://www.cl.df.gov.br/deputados-2023-2026" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">CLDF — Câmara Legislativa do DF</a> — Legislatura 2023–2026.
        </p>
      </section>

      {/* Key topics */}
      <section className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-zinc-900 mb-3">
          Temas em destaque
        </h2>
        <p className="text-sm text-zinc-500 leading-relaxed">
          A análise temática do cenário eleitoral de 2026 ainda não foi
          coletada. Quando disponível, cada tema será apresentado com a fonte
          e a data da informação, e o volume de menções será declarado
          explicitamente como atividade registrada — não como popularidade,
          apoio ou intenção de voto.
        </p>
        <p className="text-xs text-zinc-400 mt-4">
          Fonte prevista: Google News RSS (P1) e CLDF — SAPL (P1) — ainda
          não coletado.
        </p>
      </section>
    </div>
  );
}
