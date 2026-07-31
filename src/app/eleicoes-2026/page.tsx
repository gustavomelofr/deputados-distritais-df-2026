import type { Metadata } from 'next';
import Link from 'next/link';
import type { CargoEleitoral, PessoaEleitoral } from '@/types';
import { cenarioEleitoral } from '@/data/cenario-eleitoral';
import { estadoInicial as divulgacandInicial } from '@/lib/divulgacand';

// Página geral "Eleições 2026 no DF" — hub da cobertura eleitoral do
// Distrito Federal. Oferece caminhos para os quatro grupos de cargos em
// disputa (governo e vice, Senado, Câmara Federal, CLDF) e mantém a
// metodologia visível.
//
// Toda estatística desta página é derivada da base eleitoral independente
// (src/data/cenario-eleitoral.ts), validada por
// src/lib/validar-cenario-eleitoral.ts. Nenhuma pessoa, evidência,
// contagem, partido ou foto é inventada — o que não foi coletado é
// declarado explicitamente. O DivulgaCand/TSE 2026 é consultado em estado
// inicial (rede/build são vedados pelas regras de operação do loop).

export const metadata: Metadata = {
  title: 'Eleições 2026 no DF — Monitor Independente',
  description:
    'Página geral das eleições de 2026 no Distrito Federal: caminhos para governo e vice, Senado, deputado federal e deputado distrital, com metodologia, fontes e estágios de evidência visíveis.',
  alternates: {
    canonical: '/eleicoes-2026',
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Monitor Eleitoral DF 2026',
    title: 'Eleições 2026 no DF — Monitor Independente',
    description:
      'Hub da cobertura independente das eleições de 2026 no DF: governo e vice, Senado, deputado federal e deputado distrital, com metodologia e fontes visíveis.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Eleições 2026 no DF — Monitor Independente',
    description:
      'Hub da cobertura independente das eleições de 2026 no DF: governo e vice, Senado, deputado federal e deputado distrital, com metodologia e fontes visíveis.',
  },
};

interface BlocoCargo {
  id: CargoEleitoral;
  slug: string;
  titulo: string;
  descricao: string;
  /**
   * Texto factual de quantidade. Quando `0`, a página renderiza o estado
   * "ainda não coletado" no card, em vez de fabricar números.
   */
  rotuloQuantidade: string;
  /** Fonte das informações — link para a página que lista os registros. */
  hrefFonte: string;
  /** Texto curto descrevendo o tipo de registro esperado. */
  fontePrevista: string;
}

const BLOCOS: BlocoCargo[] = [
  {
    id: 'governador',
    slug: 'governo',
    titulo: 'Governo do DF',
    descricao:
      'Pré-candidaturas e movimentações para governador do Distrito Federal, com estágio de evidência, partido e fonte específica.',
    rotuloQuantidade: 'pré-candidaturas ao GDF',
    hrefFonte: '/cenario-2026#governo',
    fontePrevista:
      'anúncios partidários, declarações públicas e movimentações reportadas pela imprensa',
  },
  {
    id: 'vice_governador',
    slug: 'governo',
    titulo: 'Vice-governadoria do DF',
    descricao:
      'Pré-candidaturas e movimentações para vice-governador do DF, geralmente vinculadas à chapa majoritária registrada.',
    rotuloQuantidade: 'pré-candidaturas a vice',
    hrefFonte: '/cenario-2026#governo',
    fontePrevista:
      'anúncios de chapa e declarações de partidos e da imprensa',
  },
  {
    id: 'senador',
    slug: 'senado',
    titulo: 'Senado Federal pelo DF',
    descricao:
      'Pré-candidaturas e movimentações para as duas vagas de senador pelo Distrito Federal no ciclo 2026.',
    rotuloQuantidade: 'pré-candidaturas ao Senado',
    hrefFonte: '/cenario-2026#senado',
    fontePrevista:
      'Federações, partidos e veículos jornalísticos cobrindo a disputa majoritária',
  },
  {
    id: 'deputado_federal',
    slug: 'camara-federal',
    titulo: 'Câmara dos Deputados (DF)',
    descricao:
      'Pré-candidaturas e movimentações para as oito cadeiras de deputado federal pelo DF na próxima legislatura.',
    rotuloQuantidade: 'pré-candidaturas à Câmara Federal',
    hrefFonte: '/cenario-2026#camara-federal',
    fontePrevista:
      'nominatas estaduais, declarações partidárias e cobertura da imprensa especializada',
  },
  {
    id: 'deputado_distrital',
    slug: 'cldf',
    titulo: 'Câmara Legislativa do DF (CLDF)',
    descricao:
      'Pré-candidaturas e movimentações para as 24 cadeiras de deputado distrital, com fonte oficial CLDF para o mandato atual.',
    rotuloQuantidade: 'pré-candidaturas à CLDF',
    hrefFonte: '/cenario-2026#cldf',
    fontePrevista:
      'CLDF (mandato atual), partidos, veículos jornalísticos e declarações dos próprios pré-candidatos',
  },
];

function contarPorCargo(
  pessoas: PessoaEleitoral[],
  cargo: CargoEleitoral
): number {
  // Apenas pessoas com pelo menos uma evidência entram na contagem.
  // Pessoas sem evidência não são "pré-candidaturas monitoradas": o
  // critério de exibição exige fonte específica e data.
  return pessoas.filter((p) => p.cargo === cargo && p.evidencias.length > 0)
    .length;
}

function formatarNumero(n: number): string {
  return n.toLocaleString('pt-BR');
}

export default function Eleicoes2026Page() {
  // Estado do DivulgaCand em build time (rede é vedada neste ciclo).
  // O estado é factual e estável: 2026 ainda não disponível.
  const divulgacand = divulgacandInicial();
  const divulgacandIndisponivel = divulgacand.status !== 'disponivel';

  // Total de pessoas monitoradas com evidência (fonte de verdade).
  const totalMonitorados = cenarioEleitoral.filter(
    (p) => p.evidencias.length > 0
  ).length;

  // Total geral de evidências registradas (cobre todas as datas de cada
  // pessoa, sem agregar por pessoa).
  const totalEvidencias = cenarioEleitoral.reduce(
    (acc, p) => acc + p.evidencias.length,
    0
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      {/* Cabeçalho */}
      <header className="mb-10">
        <p className="text-xs uppercase tracking-wider text-blue-600 font-semibold mb-3">
          Eleições 2026 — Distrito Federal
        </p>
        <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-3">
          Eleições 2026 no DF
        </h1>
        <p className="text-lg text-zinc-600 max-w-3xl leading-relaxed">
          Página geral do monitoramento independente das eleições de 2026 no
          Distrito Federal. A partir daqui você escolhe o cargo que quer
          acompanhar — governo, Senado, deputado federal ou deputado
          distrital — e acessa a base eleitoral com fonte, data e estágio
          de evidência para cada registro.
        </p>
        <p className="text-sm text-zinc-500 mt-4 max-w-3xl leading-relaxed">
          Este monitor é independente: não tem vínculo com TSE, TRE-DF, CLDF,
          partidos ou candidatos. Toda informação publicada passa pela
          checagem de fonte específica, datas separadas e distinção entre
          pré-candidatura e registro oficial.
        </p>
      </header>

      {/* Estado do DivulgaCand/TSE — transparência factual */}
      <section
        className={`rounded-xl border p-5 mb-8 ${
          divulgacandIndisponivel
            ? 'border-amber-200 bg-amber-50'
            : 'border-green-200 bg-green-50'
        }`}
        aria-labelledby="heading-divulgacand"
      >
        <h2
          id="heading-divulgacand"
          className={`text-sm font-semibold mb-2 ${
            divulgacandIndisponivel ? 'text-amber-900' : 'text-green-900'
          }`}
        >
          Status do DivulgaCand/TSE 2026
        </h2>
        {divulgacandIndisponivel ? (
          <p className="text-sm text-amber-800 leading-relaxed">
            O sistema oficial do TSE para registro e divulgação de
            candidaturas (DivulgaCand) ainda{' '}
            <strong>não está disponível</strong> para a eleição de 2026.
            Por isso, este monitor publica apenas pré-candidaturas e
            movimentações públicas —{' '}
            <strong>nenhuma pessoa é tratada como candidato oficial</strong>{' '}
            até que o registro no TSE seja publicado. Quando o DivulgaCand
            estiver disponível, a fonte oficial prevalecerá sobre qualquer
            classificação anterior.
          </p>
        ) : (
          <p className="text-sm text-green-800 leading-relaxed">
            O DivulgaCand/TSE está disponível para a eleição de 2026.
            Consulte a base oficial para registros validados pela Justiça
            Eleitoral.
          </p>
        )}
      </section>

      {/* Resumo numérico — derivado da base, sem inventar */}
      <section
        className="rounded-xl border border-zinc-200 bg-white p-6 mb-10"
        aria-labelledby="heading-resumo"
      >
        <h2
          id="heading-resumo"
          className="text-xl font-semibold text-zinc-900 mb-2"
        >
          O que está sendo monitorado agora
        </h2>
        <p className="text-sm text-zinc-500 mb-5 leading-relaxed">
          Números derivados diretamente da base eleitoral independente
          (<code className="text-xs">src/data/cenario-eleitoral.ts</code>).
          Apenas pessoas com evidência específica — fonte, URL e data — são
          contabilizadas.
        </p>
        <dl className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <dt className="text-xs text-zinc-500">Pessoas monitoradas</dt>
            <dd className="text-3xl font-bold text-blue-600 mt-1">
              {formatarNumero(totalMonitorados)}
            </dd>
            <dd className="text-xs text-zinc-400 mt-1">com evidência</dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-500">Evidências registradas</dt>
            <dd className="text-3xl font-bold text-blue-600 mt-1">
              {formatarNumero(totalEvidencias)}
            </dd>
            <dd className="text-xs text-zinc-400 mt-1">com fonte e data</dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-500">Cargos em disputa</dt>
            <dd className="text-3xl font-bold text-blue-600 mt-1">4</dd>
            <dd className="text-xs text-zinc-400 mt-1">
              governo, Senado, Câmara Federal, CLDF
            </dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-500">DivulgaCand 2026</dt>
            <dd className="text-3xl font-bold text-amber-600 mt-1">
              {divulgacandIndisponivel ? 'indisponível' : 'disponível'}
            </dd>
            <dd className="text-xs text-zinc-400 mt-1">
              verificado em {divulgacand.verificadoEm}
            </dd>
          </div>
        </dl>
      </section>

      {/* Caminhos por cargo — núcleo da página */}
      <section
        className="rounded-xl border border-zinc-200 bg-white p-6 mb-10"
        aria-labelledby="heading-caminhos"
      >
        <h2
          id="heading-caminhos"
          className="text-xl font-semibold text-zinc-900 mb-2"
        >
          Escolha um caminho por cargo
        </h2>
        <p className="text-sm text-zinc-500 mb-6 leading-relaxed">
          Cada card abre a base de evidências separada por cargo. Todos os
          registros vêm da base eleitoral independente — não de palavras-chave
          nos títulos de notícia — e exibem fonte específica, data e estágio.
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          {BLOCOS.map((bloco) => {
            const quantidade = contarPorCargo(cenarioEleitoral, bloco.id);
            const semDados = quantidade === 0;
            return (
              <article
                key={bloco.id}
                className="rounded-xl border border-zinc-200 bg-zinc-50 p-5 flex flex-col"
                aria-labelledby={`heading-bloco-${bloco.id}`}
              >
                <h3
                  id={`heading-bloco-${bloco.id}`}
                  className="text-lg font-semibold text-zinc-900 mb-2"
                >
                  {bloco.titulo}
                </h3>
                <p className="text-sm text-zinc-600 leading-relaxed mb-4 flex-1">
                  {bloco.descricao}
                </p>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  {semDados ? (
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full bg-zinc-200 text-zinc-600 px-2.5 py-0.5 text-xs font-medium"
                      aria-label={`Ainda não há pré-candidaturas monitoradas para ${bloco.titulo}`}
                    >
                      ainda não coletado
                    </span>
                  ) : (
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 text-blue-700 px-2.5 py-0.5 text-xs font-medium"
                      aria-label={`${quantidade} ${bloco.rotuloQuantidade}`}
                    >
                      <span className="font-bold">{quantidade}</span>
                      <span>{bloco.rotuloQuantidade}</span>
                    </span>
                  )}
                  <Link
                    href={bloco.hrefFonte}
                    aria-label={`Abrir base de evidências para ${bloco.titulo}`}
                    className="text-sm font-semibold text-blue-600 hover:text-blue-500 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
                  >
                    Ver base de evidências →
                  </Link>
                </div>
                <p className="text-xs text-zinc-400 mt-3 leading-relaxed">
                  Fonte prevista: {bloco.fontePrevista}.
                </p>
              </article>
            );
          })}
        </div>
      </section>

      {/* Metodologia visível — sempre acessível nesta página */}
      <section
        className="rounded-xl border border-zinc-200 bg-white p-6 mb-10"
        aria-labelledby="heading-metodologia"
      >
        <h2
          id="heading-metodologia"
          className="text-xl font-semibold text-zinc-900 mb-2"
        >
          Metodologia em uma tela
        </h2>
        <p className="text-sm text-zinc-500 mb-5 leading-relaxed">
          Os critérios abaixo se aplicam a qualquer card desta página e a
          toda a navegação a partir daqui. Em caso de dúvida, a versão
          completa está em{' '}
          <Link
            href="/metodologia"
            aria-label="Abrir página de metodologia completa"
            className="text-blue-600 hover:underline rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            /metodologia
          </Link>
          .
        </p>
        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <h3 className="text-sm font-semibold text-zinc-800 mb-2">
              Fontes permitidas (em ordem de prioridade)
            </h3>
            <ol className="text-sm text-zinc-600 leading-relaxed list-decimal pl-5 space-y-1">
              <li>TSE, DivulgaCand e TRE-DF;</li>
              <li>CLDF, Câmara dos Deputados, Senado Federal e órgãos públicos;</li>
              <li>páginas e documentos oficiais de partidos;</li>
              <li>declaração pública da própria pessoa em site ou perfil oficial;</li>
              <li>veículos jornalísticos identificáveis (matéria específica);</li>
              <li>Google News RSS somente como mecanismo de descoberta.</li>
            </ol>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-800 mb-2">
              Estágios de evidência
            </h3>
            <ul className="text-sm text-zinc-600 leading-relaxed space-y-1">
              <li>
                <strong className="text-zinc-800">Nome monitorado:</strong>{' '}
                pessoa aparece em fontes relevantes, sem declaração de
                candidatura.
              </li>
              <li>
                <strong className="text-zinc-800">
                  Pré-candidatura declarada:
                </strong>{' '}
                a própria pessoa declarou intenção em site ou perfil oficial.
              </li>
              <li>
                <strong className="text-zinc-800">
                  Anunciado pelo partido:
                </strong>{' '}
                legenda anunciou formalmente a pré-candidatura.
              </li>
              <li>
                <strong className="text-zinc-800">
                  Movimentação pública:
                </strong>{' '}
                articulação com fonte primária ou duas reportagens
                independentes.
              </li>
              <li>
                <strong className="text-zinc-800">Registro oficial:</strong>{' '}
                candidatura registrada no TSE/DivulgaCand — único estágio em
                que o termo &ldquo;candidato oficial&rdquo; se aplica.
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-800 mb-2">
              Datas separadas
            </h3>
            <ul className="text-sm text-zinc-600 leading-relaxed space-y-1">
              <li>
                <strong className="text-zinc-800">publicadaEm:</strong> data
                em que a fonte publicou o conteúdo.
              </li>
              <li>
                <strong className="text-zinc-800">coletadaEm:</strong> data em
                que o agente coletou o dado.
              </li>
              <li>
                <strong className="text-zinc-800">verificadaEm:</strong> data
                da última checagem contra a fonte.
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-800 mb-2">
              Fotografias
            </h3>
            <p className="text-sm text-zinc-600 leading-relaxed">
              Ordem de preferência: DivulgaCand/TSE, página institucional
              oficial, site do partido, site/assessoria da pessoa e, por
              último, imprensa com licença explícita de reutilização. Sem
              licença, mantemos placeholder honesto. Crédito isolado não
              substitui licença.
            </p>
          </div>
        </div>
        <p className="text-xs text-zinc-400 mt-5 leading-relaxed">
          Limites: volume de menções não mede popularidade, apoio ou intenção
          de voto. A ausência de um nome não significa que não exista — apenas
          que não foi capturado pelas fontes monitoradas.
        </p>
      </section>

      {/* Atalho para a base atual de evidências */}
      <section
        className="rounded-xl border border-zinc-200 bg-white p-6 mb-2"
        aria-labelledby="heading-atalhos"
      >
        <h2
          id="heading-atalhos"
          className="text-xl font-semibold text-zinc-900 mb-3"
        >
          Atalhos de navegação
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/cenario-2026"
            aria-label="Abrir base de evidências do Cenário 2026"
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            Base de evidências (Cenário 2026)
          </Link>
          <Link
            href="/noticias"
            aria-label="Abrir feed de notícias sobre as eleições de 2026 no DF"
            className="rounded-lg border border-zinc-300 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            Últimas notícias
          </Link>
          <Link
            href="/metodologia"
            aria-label="Abrir metodologia completa do monitor"
            className="rounded-lg border border-zinc-300 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            Metodologia completa
          </Link>
        </div>
      </section>
    </div>
  );
}
