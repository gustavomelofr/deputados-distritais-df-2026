import type { Metadata } from 'next';
import Link from 'next/link';
import { deputados } from '@/data/deputados';
import { cenarioEleitoral } from '@/data/cenario-eleitoral';
import { noticias } from '@/data/noticias';
import { validarCenarioEleitoral } from '@/lib/validar-cenario-eleitoral';
import type { PessoaEleitoral } from '@/types';

export const metadata: Metadata = {
  title: 'Cenário Eleitoral 2026 — Deputados Distritais DF',
  description:
    'Cenário eleitoral de 2026 para a Câmara Legislativa do DF, organizado por estágio de evidência: pré-candidatura declarada, movimentação pública e em observação.',
  alternates: {
    canonical: '/cenario-2026',
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Deputados Distritais DF 2026',
    title: 'Cenário Eleitoral 2026 — Deputados Distritais DF',
    description:
      'Pré-candidaturas e movimentações políticas para as eleições distritais de 2026, por estágio de evidência.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cenário Eleitoral 2026 — Deputados Distritais DF',
    description:
      'Pré-candidaturas e movimentações políticas para as eleições distritais de 2026, por estágio de evidência.',
  },
};

// Estágios de evidência para o cenário eleitoral de 2026.
// Cada item publicado deve trazer fonte e data — nenhum dado é inventado.
// A classificação por estágio descreve o nível de evidência observável,
// não juízo sobre probabilidade de candidatura.

type EstagioEvidencia = 'pre-candidatura-declarada' | 'movimentacao-publica' | 'em-observacao';

interface ItemCenario {
  id: string;
  titulo: string;
  resumo: string;
  fonte: string;
  url: string;
  data: string;
  deputadosRelacionados: string[];
  estagio: EstagioEvidencia;
}

// Mapeia o estágio eleitoral do schema (5 valores) para o estágio de
// evidência da página (3 valores). "pre_candidatura_declarada",
// "anunciado_pelo_partido" e "registro_oficial" são evidência direta;
// "movimentacao_publica" é indireta; "nome_monitorado" é circunstancial.
function estagioPagina(estagio: PessoaEleitoral['estagio']): EstagioEvidencia {
  switch (estagio) {
    case 'pre_candidatura_declarada':
    case 'anunciado_pelo_partido':
    case 'registro_oficial':
      return 'pre-candidatura-declarada';
    case 'movimentacao_publica':
      return 'movimentacao-publica';
    case 'nome_monitorado':
      return 'em-observacao';
  }
}

// Base eleitoral independente das notícias (src/data/cenario-eleitoral.ts).
// A classificação por estágio vem do campo `estagio` do registro, NÃO de
// palavras-chave em títulos de notícia. Pessoas sem evidência não são exibidas.
const itensCenario: ItemCenario[] = cenarioEleitoral
  .filter((p) => p.evidencias.length > 0)
  .map((p) => {
    const evMaisRecente = p.evidencias
      .slice()
      .sort((a, b) => b.dataEvidencia.localeCompare(a.dataEvidencia))[0];
    return {
      id: p.id,
      titulo: p.nome,
      resumo: evMaisRecente.descricao,
      fonte: evMaisRecente.fonte,
      url: evMaisRecente.url,
      data: evMaisRecente.dataEvidencia,
      deputadosRelacionados: [p.slug],
      estagio: estagioPagina(p.estagio),
    };
  });

const errosValidacao = validarCenarioEleitoral(cenarioEleitoral, undefined, noticias);

const ESTAGIOS: {
  id: EstagioEvidencia;
  titulo: string;
  descricao: string;
  badge: string;
  badgeClass: string;
  fontePrevista: string;
}[] = [
  {
    id: 'pre-candidatura-declarada',
    titulo: 'Pré-candidatura declarada',
    descricao:
      'Declaração pública — pelo próprio interessado, por partido ou em registro oficial — de que a pessoa pretende concorrer a um cargo nas eleições de 2026. É o estágio de evidência mais alto nesta página.',
    badge: 'evidência direta',
    badgeClass: 'bg-blue-100 text-blue-700',
    fontePrevista: 'DivulgaCand/TSE (P2) e declarações públicas reportadas pela imprensa (P1)',
  },
  {
    id: 'movimentacao-publica',
    titulo: 'Movimentação pública',
    descricao:
      'Articulações partidárias, preparo de nominatas, análises sobre a composição do quadro eleitoral e movimentos políticos que indicam disposição de candidatura sem declaração formal. Evidência indireta.',
    badge: 'evidência indireta',
    badgeClass: 'bg-amber-100 text-amber-700',
    fontePrevista: 'Google News RSS (P1)',
  },
  {
    id: 'em-observacao',
    titulo: 'Em observação',
    descricao:
      'Menções, pesquisas de opinião ou sinalizações que merecem acompanhamento, mas que por si só não indicam candidatura nem intenção declarada. Evidência circunstancial.',
    badge: 'evidência circunstancial',
    badgeClass: 'bg-zinc-200 text-zinc-700',
    fontePrevista: 'Google News RSS (P1)',
  },
];

function formatarData(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export default function Cenario2026Page() {
  const partidosAgrupados = deputados.reduce<Record<string, typeof deputados>>(
    (acc, d) => {
      if (!acc[d.partido]) acc[d.partido] = [];
      acc[d.partido].push(d);
      return acc;
    },
    {}
  );

  const deputadoPorSlug = deputados.reduce<Record<string, (typeof deputados)[number]>>(
    (acc, d) => {
      acc[d.slug] = d;
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
        Acompanhamento do cenário eleitoral de 2026 para a Câmara Legislativa
        do DF, organizado por <strong>estágio de evidência</strong>. Cada item
        publicado traz fonte e data; o que ainda não foi coletado é informado
        com transparência.
      </p>

      {errosValidacao.length > 0 && (
        <section
          className="rounded-xl border border-red-200 bg-red-50 p-6 mb-8"
          role="alert"
          aria-labelledby="heading-validacao"
        >
          <h2 id="heading-validacao" className="text-xl font-semibold text-red-900 mb-2">
            Base eleitoral com inconsistências
          </h2>
          <p className="text-sm text-red-700 leading-relaxed mb-3">
            A validação de integridade detectou {errosValidacao.length} inconsistência
            {errosValidacao.length > 1 ? 's' : ''} na base eleitoral. Os registros
            afetados não devem ser considerados confiáveis até a correção.
          </p>
          <ul className="space-y-1 text-xs text-red-700">
            {errosValidacao.slice(0, 10).map((e, i) => (
              <li key={i}>
                {e.pessoaId} — {e.campo}: {e.mensagem}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Explicação dos estágios */}
      <section className="rounded-xl border border-zinc-200 bg-white p-6 mb-8">
        <h2 className="text-xl font-semibold text-zinc-900 mb-3">
          Como ler os estágios de evidência
        </h2>
        <p className="text-zinc-600 leading-relaxed mb-4">
          Os estágios descrevem o <strong>nível de evidência</strong> de cada
          informação, da mais direta à mais circunstancial. Eles não indicam
          probabilidade de candidatura nem intenção de voto — apenas o que é
          possível verificar nas fontes monitoradas.
        </p>
        <ul className="space-y-2 text-sm text-zinc-600">
          {ESTAGIOS.map((e) => (
            <li key={e.id} className="flex items-start gap-2">
              <span className={`mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0 ${
                e.id === 'pre-candidatura-declarada'
                  ? 'bg-blue-500'
                  : e.id === 'movimentacao-publica'
                    ? 'bg-amber-500'
                    : 'bg-zinc-400'
              }`} />
              <span>
                <strong className="text-zinc-800">{e.titulo}:</strong>{' '}
                {e.descricao}
              </span>
            </li>
          ))}
        </ul>
        <p className="text-xs text-zinc-400 mt-4">
          Volume de menções não mede popularidade, apoio ou intenção de voto.
          Ver{' '}
          <Link
            href="/metodologia"
            aria-label="Ver metodologia e limites de interpretação"
            className="text-blue-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
          >
            metodologia
          </Link>.
        </p>
      </section>

      {/* Estágios de evidência */}
      {ESTAGIOS.map((estagio) => {
        const itens = itensCenario.filter((i) => i.estagio === estagio.id);
        const temDados = itens.length > 0;
        return (
          <section
            key={estagio.id}
            className="rounded-xl border border-zinc-200 bg-white p-6 mb-8"
            aria-labelledby={`heading-${estagio.id}`}
          >
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <h2
                id={`heading-${estagio.id}`}
                className="text-xl font-semibold text-zinc-900"
              >
                {estagio.titulo}
              </h2>
              <span
                className={`rounded-full text-xs font-medium px-2.5 py-0.5 ${estagio.badgeClass}`}
              >
                {estagio.badge}
              </span>
            </div>
            <p className="text-sm text-zinc-500 leading-relaxed mb-5">
              {estagio.descricao}
            </p>

            {temDados ? (
              <div className="space-y-4">
                {itens
                  .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
                  .map((item) => (
                    <article
                      key={item.id}
                      className="rounded-lg border border-zinc-200 bg-zinc-50 p-4"
                    >
                      <h3 className="font-semibold text-zinc-900 text-sm mb-1.5">
                        {item.titulo}
                      </h3>
                      <p className="text-sm text-zinc-600 leading-relaxed mb-3">
                        {item.resumo}
                      </p>
                      {item.deputadosRelacionados.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {item.deputadosRelacionados.map((slug) => {
                            const dep = deputadoPorSlug[slug];
                            if (!dep) return null;
                            return (
                              <Link
                                key={slug}
                                href={`/deputados-distritais/${dep.slug}`}
                                aria-label={`Ver perfil de ${dep.nome} (${dep.partido})`}
                                className="rounded-md bg-white border border-zinc-200 px-2.5 py-1 text-xs text-zinc-700 hover:bg-blue-50 hover:border-blue-200 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                              >
                                {dep.nome} ({dep.partido})
                              </Link>
                            );
                          })}
                        </div>
                      )}
                      <div className="text-xs text-zinc-400 flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span>
                          <span className="text-zinc-600">Fonte:</span>{' '}
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Abrir fonte "${item.fonte}" em nova aba`}
                            className="text-blue-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
                          >
                            {item.fonte}
                          </a>
                        </span>
                        <span>
                          <span className="text-zinc-600">Data:</span>{' '}
                          {formatarData(item.data)}
                        </span>
                      </div>
                    </article>
                  ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-5">
                <p className="text-sm text-zinc-500 leading-relaxed">
                  <strong className="text-zinc-700">
                    Ainda não há registros neste estágio.
                  </strong>{' '}
                  Nenhuma fonte monitorada registrou, até o momento,
                  informação que atenda ao critério de evidência deste
                  estágio. A ausência aqui não significa que não existam
                  movimentações — apenas que elas não foram capturadas nas
                  fontes monitoradas.
                </p>
                <p className="text-xs text-zinc-400 mt-3">
                  Fonte prevista: {estagio.fontePrevista} — ainda não coletado.
                </p>
              </div>
            )}
          </section>
        );
      })}

      {/* Composição atual da CLDF */}
      <section className="rounded-xl border border-zinc-200 bg-white p-6 mb-8">
        <h2 className="text-xl font-semibold text-zinc-900 mb-4">
          Composição atual da CLDF
        </h2>
        <p className="text-sm text-zinc-500 mb-4">
          Distribuição dos 24 deputados distritais em exercício por partido,
          base da possível composição eleitoral de 2026. A composição atual
          é fato verificável; a candidatura de qualquer um deles pertence ao
          estágio “Pré-candidatura declarada” quando houver declaração.
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
                      aria-label={`Ver perfil de ${d.nome} (${d.partido})`}
                      className="rounded-lg bg-zinc-50 border border-zinc-200 px-3 py-1.5 text-xs text-zinc-700 hover:bg-blue-50 hover:border-blue-200 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    >
                      {d.nome}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
        </div>
        <p className="text-xs text-zinc-400 mt-5">
          Fonte:{' '}
          <a
            href="https://www.cl.df.gov.br/deputados-2023-2026"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Lista oficial dos deputados distritais 2023-2026 no site da CLDF (abre em nova aba)"
            className="text-blue-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
          >
            CLDF — Câmara Legislativa do DF
          </a>{' '}
          — Legislatura 2023–2026.
        </p>
      </section>

      {/* Nota metodológica */}
      <section className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-zinc-900 mb-3">
          Sobre esta página
        </h2>
        <p className="text-sm text-zinc-500 leading-relaxed">
          Os itens publicados nos estágios de evidência vêm de uma{' '}
          <strong>base eleitoral independente</strong>{' '}
          (<code className="text-xs">src/data/cenario-eleitoral.ts</code>), não de
          palavras-chave nos títulos de notícias. Cada registro exige fonte
          específica, data e estágio de evidência. A base inicial é vazia;
          conforme as tarefas P3 coletam evidências para cada cargo, os
          registros são adicionados. Quando a fonte oficial de candidaturas
          (DivulgaCand/TSE — P2) estiver integrada, o estágio “Pré-candidatura
          declarada” passará a exibir registros oficiais com fonte e data.
        </p>
        <p className="text-xs text-zinc-400 mt-4">
          Volume de menções não representa popularidade, apoio ou intenção de
          voto.{' '}
          <Link
            href="/metodologia"
            aria-label="Ver metodologia completa"
            className="text-blue-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
          >
            Ver metodologia completa
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
