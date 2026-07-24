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
        Movimentações políticas, pré-candidaturas e análise do cenário eleitoral
        para as eleições de 2026 no Distrito Federal.
      </p>

      {/* Overview */}
      <section className="rounded-xl border border-zinc-200 bg-white p-6 mb-8">
        <h2 className="text-xl font-semibold text-zinc-900 mb-3">
          Panorama atual
        </h2>
        <p className="text-zinc-600 leading-relaxed">
          As 24 cadeiras da Câmara Legislativa do Distrito Federal estarão em
          disputa nas eleições de 2026. Dos atuais 24 deputados distritais, vários
          devem buscar reeleição, enquanto outros podem migrar para candidaturas
          à Câmara Federal ou ao Senado.
        </p>
        <p className="text-zinc-600 leading-relaxed mt-3">
          Partidos como MDB (maior bancada atual, com 5 deputados), PL (4),
          PT (3), PSOL (2) e Republicanos (2) já articulam suas nominatas.
          Partidos menores como Avante e Republicanos miram crescimento.
        </p>
      </section>

      {/* Current composition */}
      <section className="rounded-xl border border-zinc-200 bg-white p-6 mb-8">
        <h2 className="text-xl font-semibold text-zinc-900 mb-4">
          Composição atual da CLDF
        </h2>
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
      </section>

      {/* Key topics */}
      <section className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-zinc-900 mb-3">
          Temas em destaque
        </h2>
        <div className="space-y-4 text-sm text-zinc-600">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
            <div>
              <span className="font-medium text-zinc-800">BRB e finanças públicas:</span>{' '}
              A capitalização do BRB e o caso Master dominaram a pauta da CLDF no
              primeiro semestre de 2026, gerando embate entre base e oposição.
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="mt-0.5 h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
            <div>
              <span className="font-medium text-zinc-800">Reeleição de deputados:</span>{' '}
              Pelo menos 18 dos 24 atuais deputados devem disputar a reeleição. Os
              demais podem concorrer a outros cargos ou se aposentar.
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="mt-0.5 h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
            <div>
              <span className="font-medium text-zinc-800">Novos partidos:</span>{' '}
              Partidos como Avante, Republicanos e PSD buscam ampliar suas bancadas
              na CLDF, enquanto federações partidárias podem alterar a correlação de
              forças.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
