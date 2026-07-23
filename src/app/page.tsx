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
            Monitor Independente dos{" "}
            <span className="text-blue-400">Deputados Distritais</span> do DF
          </h1>
          <p className="mt-6 text-lg md:text-xl text-blue-200 max-w-2xl mx-auto leading-relaxed">
            Os 24 deputados da Câmara Legislativa do Distrito Federal em exercício,
            movimentações para 2026, proposições, votações e atividade pública.
            Cada dado com recorte, data e limite de interpretação.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/deputados-distritais"
              className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-500 transition shadow-lg shadow-blue-600/25"
            >
              Consultar deputados
            </Link>
            <Link
              href="/noticias"
              className="rounded-lg border border-white/20 bg-white/5 px-6 py-3 font-semibold text-white hover:bg-white/10 transition"
            >
              Últimas notícias
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl font-bold text-blue-600">{deputados.length}</p>
              <p className="text-sm text-zinc-500 mt-1">Deputados em exercício</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-600">
                {new Set(deputados.map((d) => d.partido)).size}
              </p>
              <p className="text-sm text-zinc-500 mt-1">Partidos representados</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-600">
                {deputados.reduce((a, d) => a + d.proposicoes.length, 0)}
              </p>
              <p className="text-sm text-zinc-500 mt-1">Proposições monitoradas</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-600">{noticias.length}</p>
              <p className="text-sm text-zinc-500 mt-1">Notícias organizadas</p>
            </div>
          </div>
        </div>
      </section>

      {/* Coverage */}
      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-4 py-16">
          <h2 className="text-2xl font-bold text-zinc-900 text-center mb-2">
            Cobertura em construção
          </h2>
          <p className="text-zinc-500 text-center max-w-xl mx-auto mb-12">
            Este site está sendo construído continuamente por um agente autônomo.
            Os dados são atualizados automaticamente à medida que novas fontes
            são integradas.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
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
                title: "Redes Sociais",
                desc: "Monitoramento de Instagram e outras redes para acompanhamento da atividade pública dos deputados distritais.",
                status: "em breve",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-zinc-200 p-6 hover:border-zinc-300 transition"
              >
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
            ))}
          </div>
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
                className="text-blue-600 underline"
              >
                repositório público no GitHub
              </a>
              . O código do agente, as fontes e a metodologia estão disponíveis
              para consulta e contribuição.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
