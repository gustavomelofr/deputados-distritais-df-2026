import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Metodologia — Deputados Distritais DF 2026',
  description:
    'Metodologia, fontes de dados (CLDF, Google News RSS, Instagram, DivulgaCand/TSE), frequência de coleta e limites de interpretação do monitor independente dos 24 deputados distritais do DF.',
  alternates: {
    canonical: '/metodologia',
  },
  openGraph: {
    title: 'Metodologia — Deputados Distritais DF 2026',
    description:
      'Fontes P1/P2, frequência de coleta e limites de interpretação do monitor dos deputados distritais do DF.',
  },
  twitter: {
    title: 'Metodologia — Deputados Distritais DF 2026',
    description:
      'Fontes P1/P2, frequência de coleta e limites de interpretação do monitor dos deputados distritais do DF.',
  },
};

export default function MetodologiaPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-zinc-900 mb-2">Metodologia</h1>
      <p className="text-zinc-500 mb-10">
        Como este monitor é construído, quais as fontes e os limites de cada dado.
      </p>

      <div className="space-y-8">
        {/* Sobre */}
        <section className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="text-xl font-semibold text-zinc-900 mb-3">Sobre o projeto</h2>
          <p className="text-zinc-600 leading-relaxed">
            Este é um monitor independente dos 24 deputados distritais do Distrito
            Federal. O site é operado por um <strong>agente autônomo contínuo</strong>{" "}
            (inteligência artificial) que trabalha 24 horas por dia: coleta dados de
            fontes oficiais e abertas, atualiza o site automaticamente e reporta
            novidades relevantes.
          </p>
          <p className="text-zinc-600 leading-relaxed mt-3">
            Todo o código-fonte é aberto e está disponível no{" "}
            <a
              href="https://github.com/gustavomelofr/deputados-distritais-df-2026"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label="Repositório do projeto no GitHub (abre em nova aba)"
            >
              GitHub
            </a>
            . Cada alteração no site é commitada automaticamente com mensagem descritiva.
          </p>
        </section>

        {/* Fontes */}
        <section className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="text-xl font-semibold text-zinc-900 mb-3">Fontes de dados</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-zinc-800 text-sm">
                CLDF — Câmara Legislativa do Distrito Federal (P1)
              </h3>
              <p className="text-sm text-zinc-600 mt-1">
                Fonte oficial de dados sobre os 24 deputados distritais: biografias,
                fotos, partidos, comissões e links para perfis individuais.
                Disponível em{" "}
                <a
                  href="https://www.cl.df.gov.br/deputados-2023-2026"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  aria-label="Lista oficial dos deputados distritais 2023-2026 no site da CLDF (abre em nova aba)"
                >
                  cl.df.gov.br
                </a>
                .
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-zinc-800 text-sm">
                CLDF — SAPL / Processo Legislativo Eletrônico (P1)
              </h3>
              <p className="text-sm text-zinc-600 mt-1">
                API pública de proposições da CLDF (projetos de lei, indicações,
                requerimentos, moções e outros), com autoria, ementa, data de
                leitura e tramitação. Disponível em{" "}
                <a
                  href="https://dados.cl.df.gov.br/id/dataset/proposicoes"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  aria-label="Portal de Dados Abertos da CLDF — dataset de proposições (abre em nova aba)"
                >
                  dados.cl.df.gov.br
                </a>
                .
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-zinc-800 text-sm">
                Google News RSS (P1)
              </h3>
              <p className="text-sm text-zinc-600 mt-1">
                Agregação de notícias sobre a CLDF e deputados distritais de
                veículos como G1, Correio Braziliense, Brasil de Fato, GPS
                Brasília, Congresso em Foco, Folha de S.Paulo, entre outros.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-zinc-800 text-sm">
                Instagram (P2 — em implementação)
              </h3>
              <p className="text-sm text-zinc-600 mt-1">
                Monitoramento dos perfis públicos de Instagram dos deputados
                distritais para acompanhamento da atividade pública.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-zinc-800 text-sm">
                DivulgaCand/TSE (P2 — em implementação)
              </h3>
              <p className="text-sm text-zinc-600 mt-1">
                Dados oficiais de candidatura, prestação de contas e histórico
                eleitoral dos deputados. Disponível em{" "}
                <a
                  href="https://divulgacandcontas.tse.jus.br/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  aria-label="DivulgaCand/TSE — dados oficiais de candidatura e prestação de contas (abre em nova aba)"
                >
                  divulgacandcontas.tse.jus.br
                </a>
                .
              </p>
            </div>
          </div>
        </section>

        {/* Frequência de coleta */}
        <section className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="text-xl font-semibold text-zinc-900 mb-3">
            Frequência de coleta
          </h2>
          <p className="text-sm text-zinc-600 mb-4 leading-relaxed">
            O agente autônomo opera em ciclo contínuo. A frequência efetiva de
            coleta depende da disponibilidade de cada fonte e pode sofrer
            interrupções por indisponibilidade técnica ou mudanças nas fontes.
            Os estados abaixo descrevem a rotina planejada, não garantias de
            atualização.
          </p>
          <ul className="space-y-2 text-sm text-zinc-600">
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0" />
              <span>
                <strong className="text-zinc-800">CLDF (P1):</strong> consulta
                periódica à lista oficial de deputados, comissões e, quando
                disponível, proposições e presença. A frequência exata ainda
                está em definição conforme a API da CLDF é integrada.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0" />
              <span>
                <strong className="text-zinc-800">Google News RSS (P1):</strong>{' '}
                agregação de notícias em ciclos curtos, com deduplicação e
                atribuição de fonte e data de publicação quando informadas pelo
                feed.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-500 flex-shrink-0" />
              <span>
                <strong className="text-zinc-800">Instagram (P2):</strong>{' '}
                coleta em implementação; sem frequência definida até a fonte
                estar integrada.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-500 flex-shrink-0" />
              <span>
                <strong className="text-zinc-800">DivulgaCand/TSE (P2):</strong>{' '}
                coleta em implementação; atualização prevista conforme o
                calendário eleitoral oficial do TSE.
              </span>
            </li>
          </ul>
        </section>

        {/* Limites de interpretação */}
        <section className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="text-xl font-semibold text-zinc-900 mb-3">
            Limites de interpretação
          </h2>
          <p className="text-sm text-zinc-600 leading-relaxed mb-4">
            Este monitor prioriza <strong>fatos atribuídos</strong> sobre
            interpretações. Os dados apresentados descrevem atividade
            observável, não juízo de valor sobre os deputados. Em particular:
          </p>
          <ul className="space-y-2 text-sm text-zinc-600">
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-zinc-400 flex-shrink-0" />
              <span>
                <strong className="text-zinc-800">
                  Volume não mede popularidade, apoio ou intenção de voto.
                </strong>{' '}
                A quantidade de posts, notícias, proposições ou menções reflete
                apenas atividade registrada nas fontes monitoradas. Não
                representa popularidade, apoio da população, intenção de voto
                nem probabilidade de reeleição ou derrota eleitoral.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-zinc-400 flex-shrink-0" />
              <span>
                <strong className="text-zinc-800">
                  Cobertura não é exaustiva.
                </strong>{' '}
                A ausência de uma notícia, proposição ou post não significa que
                o fato não ocorreu — apenas que não foi capturado pelas fontes
                monitoradas no período.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-zinc-400 flex-shrink-0" />
              <span>
                <strong className="text-zinc-800">
                  Sem ranking editorial enganoso.
                </strong>{' '}
                Listagens e ordenações usam critérios objetivos (ex.: data ou
                nome) e não constituem um ranking de mérito político. Comparações
                entre deputados usam somente indicadores de fonte clara.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-zinc-400 flex-shrink-0" />
              <span>
                <strong className="text-zinc-800">
                  Dados desatualizados são marcados.
                </strong>{' '}
                Cada bloco de informação indica a data de coleta quando
                disponível; ausência de data significa que a coleta ainda não
                foi registrada.
              </span>
            </li>
          </ul>
        </section>

        {/* Limitações */}
        <section className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="text-xl font-semibold text-zinc-900 mb-3">
            Limitações e transparência
          </h2>
          <ul className="space-y-2 text-sm text-zinc-600">
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-500 flex-shrink-0" />
              Os dados de presença e gastos individuais por deputado ainda
              estão sendo integrados da API da CLDF. As proposições já são
              coletadas da API pública do PLE/CLDF, mas a amostra publicada
              prioriza 2026 e pode não incluir todo o histórico.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-500 flex-shrink-0" />
              As notícias são agregadas automaticamente via RSS e podem não
              representar a totalidade da cobertura jornalística.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-500 flex-shrink-0" />
              O monitoramento de redes sociais (Instagram) depende de scraping
              público e pode sofrer limitações de acesso.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-500 flex-shrink-0" />
              Este site não é oficial e não tem vínculo com a CLDF, partidos
              políticos ou candidatos.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-500 flex-shrink-0" />
              Erros podem ocorrer. Se encontrar algum problema, abra uma issue no{' '}
              <a
                href="https://github.com/gustavomelofr/deputados-distritais-df-2026/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                aria-label="Abrir uma issue no GitHub do projeto (abre em nova aba)"
              >
                GitHub
              </a>
              .
            </li>
          </ul>
        </section>

        {/* Stack */}
        <section className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="text-xl font-semibold text-zinc-900 mb-3">
            Stack técnica
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {[
              { label: 'Framework', value: 'Next.js 16 (App Router)' },
              { label: 'Linguagem', value: 'TypeScript' },
              { label: 'Estilo', value: 'Tailwind CSS' },
              { label: 'Deploy', value: 'GitHub' },
              { label: 'Runtime', value: 'systemd (24/7)' },
              { label: 'Agente', value: 'OpenCode (autônomo)' },
            ].map((item) => (
              <div key={item.label}>
                <span className="text-zinc-400">{item.label}:</span>{' '}
                <span className="text-zinc-700 font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Navegação */}
        <div className="flex flex-wrap gap-4">
          <Link
            href="/deputados-distritais"
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            aria-label="Ver lista dos 24 deputados distritais do DF"
          >
            Ver deputados
          </Link>
          <Link
            href="/noticias"
            className="rounded-lg border border-zinc-300 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            aria-label="Ver últimas notícias sobre a CLDF e deputados distritais"
          >
            Últimas notícias
          </Link>
        </div>
      </div>
    </div>
  );
}
