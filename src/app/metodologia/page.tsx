import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Metodologia — Monitor Eleitoral DF 2026',
  description:
    'Metodologia do Monitor Eleitoral DF 2026: fontes (TSE, DivulgaCand, TRE-DF, CLDF, Câmara, Senado, partidos, veículos), estágios eleitorais, datas separadas, licenças de imagem, limites de interpretação e diferença entre pré-candidatura e registro oficial.',
  alternates: {
    canonical: '/metodologia',
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Monitor Eleitoral DF 2026',
    title: 'Metodologia — Monitor Eleitoral DF 2026',
    description:
      'Fontes, estágios, datas, licenças de imagem e limites de interpretação do monitor independente das eleições de 2026 no DF.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Metodologia — Monitor Eleitoral DF 2026',
    description:
      'Fontes, estágios, datas, licenças de imagem e limites de interpretação do monitor independente das eleições de 2026 no DF.',
  },
};

export default function MetodologiaPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-zinc-900 mb-2">Metodologia</h1>
      <p className="text-zinc-500 mb-10">
        Como o Monitor Eleitoral DF 2026 é construído: fontes, estágios,
        datas, licenças de imagem e limites de interpretação.
      </p>

      <div className="space-y-8">
        {/* Sobre */}
        <section className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="text-xl font-semibold text-zinc-900 mb-3">
            Sobre o projeto
          </h2>
          <p className="text-zinc-600 leading-relaxed">
            Este é um monitor independente das eleições de 2026 no Distrito
            Federal para os cargos de <strong>governador e vice</strong>,{' '}
            <strong>senador</strong>, <strong>deputado federal</strong> e{' '}
            <strong>deputado distrital</strong>. O site é operado por um{' '}
            <strong>agente autônomo contínuo</strong> (inteligência artificial)
            que trabalha 24 horas por dia: coleta dados de fontes oficiais e
            abertas, atualiza o site automaticamente e reporta novidades
            relevantes.
          </p>
          <p className="text-zinc-600 leading-relaxed mt-3">
            Todo o código-fonte é aberto e está disponível no{' '}
            <a
              href="https://github.com/gustavomelofr/deputados-distritais-df-2026"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label="Repositório do projeto no GitHub (abre em nova aba)"
            >
              GitHub
            </a>
            . Cada alteração no site é commitada automaticamente com mensagem
            descritiva.
          </p>
        </section>

        {/* Fontes */}
        <section className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="text-xl font-semibold text-zinc-900 mb-3">
            Fontes de dados
          </h2>
          <p className="text-sm text-zinc-600 mb-4 leading-relaxed">
            As fontes são usadas em ordem de prioridade. Uma notícia ou
            evidência só é registrada quando aponta para a fonte específica —
            nunca para a página inicial de um veículo.
          </p>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-zinc-800 text-sm">
                1. TSE, DivulgaCand e TRE-DF (prioridade 1)
              </h3>
              <p className="text-sm text-zinc-600 mt-1">
                Dados oficiais de candidatura, prestação de contas e histórico
                eleitoral. Quando o DivulgaCand está disponível para a eleição
                2026, o registro oficial prevalece sobre qualquer classificação
                anterior. Disponível em{' '}
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
            <div>
              <h3 className="font-semibold text-zinc-800 text-sm">
                2. CLDF, Câmara dos Deputados, Senado Federal e demais órgãos
                públicos (prioridade 2)
              </h3>
              <p className="text-sm text-zinc-600 mt-1">
                Dados institucionais de mandato atual: biografias, fotos,
                partidos, comissões, proposições e atividade legislativa. CLDF
                em{' '}
                <a
                  href="https://www.cl.df.gov.br/deputados-2023-2026"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  aria-label="Lista oficial dos deputados distritais 2023-2026 no site da CLDF (abre em nova aba)"
                >
                  cl.df.gov.br
                </a>
                ; proposições em{' '}
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
                3. Páginas e documentos oficiais de partidos (prioridade 3)
              </h3>
              <p className="text-sm text-zinc-600 mt-1">
                Anúncios partidários formais de pré-candidatura, convenções e
                documentos públicos nos sites oficiais das legendas.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-zinc-800 text-sm">
                4. Declaração pública da própria pessoa (prioridade 4)
              </h3>
              <p className="text-sm text-zinc-600 mt-1">
                Site oficial ou perfil oficial verificado da própria pessoa
                confirmando intenção de candidatura. Instagram serve somente
                para confirmar e exibir links de perfis oficiais — sem coleta
                de posts, frequência ou métricas.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-zinc-800 text-sm">
                5. Veículos jornalísticos identificáveis (prioridade 5)
              </h3>
              <p className="text-sm text-zinc-600 mt-1">
                Reportagens com autoria identificável e data, de veículos como
                G1, Correio Braziliense, Brasil de Fato, GPS Brasília, Congresso
                em Foco, Folha de S.Paulo, entre outros. Exige URL da matéria
                específica.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-zinc-800 text-sm">
                6. Google News RSS (prioridade 6 — descoberta)
              </h3>
              <p className="text-sm text-zinc-600 mt-1">
                Usado somente como mecanismo de descoberta de reportagens. O
                item só é publicado quando a matéria específica é confirmada
                com fonte, autoria e data.
              </p>
            </div>
          </div>
        </section>

        {/* Estágios eleitorais */}
        <section className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="text-xl font-semibold text-zinc-900 mb-3">
            Estágios eleitorais
          </h2>
          <p className="text-sm text-zinc-600 mb-4 leading-relaxed">
            Antes do registro no TSE, ninguém é chamado de{' '}
            <strong>candidato oficial</strong>. A classificação reflete
            somente o que a evidência suporta, nos estágios abaixo:
          </p>
          <ul className="space-y-2 text-sm text-zinc-600">
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-zinc-400 flex-shrink-0" />
              <span>
                <strong className="text-zinc-800">Nome monitorado:</strong>{' '}
                pessoa que aparece em fontes relevantes ao contexto eleitoral,
                sem declaração de intenção de candidatura.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0" />
              <span>
                <strong className="text-zinc-800">
                  Pré-candidatura declarada:
                </strong>{' '}
                a própria pessoa declarou publicamente, em site ou perfil
                oficial, a intenção de se candidatar.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0" />
              <span>
                <strong className="text-zinc-800">
                  Anunciado pelo partido:
                </strong>{' '}
                a legenda anunciou formalmente a pré-candidatura em página ou
                documento oficial.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-500 flex-shrink-0" />
              <span>
                <strong className="text-zinc-800">
                  Movimentação pública:
                </strong>{' '}
                indicação de movimentação eleitoral com fonte primária ou duas
                reportagens independentes. Pesquisa de opinião, menção ou
                presença em evento não comprova intenção de candidatura.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-green-600 flex-shrink-0" />
              <span>
                <strong className="text-zinc-800">Registro oficial:</strong>{' '}
                candidatura registrada no TSE/DivulgaCand. Somente neste
                estágio o termo “candidato oficial” é usado.
              </span>
            </li>
          </ul>
        </section>

        {/* Pré-candidatura vs registro oficial */}
        <section className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="text-xl font-semibold text-zinc-900 mb-3">
            Pré-candidatura x registro oficial
          </h2>
          <p className="text-sm text-zinc-600 leading-relaxed mb-3">
            A diferença é factual, não editorial. <strong>Pré-candidatura</strong>{' '}
            é uma intenção declarada — pela pessoa ou pelo partido — antes do
            prazo oficial de registro. <strong>Registro oficial</strong> é o
            ato formal perante a Justiça Eleitoral, publicado no DivulgaCand/TSE.
          </p>
          <ul className="space-y-2 text-sm text-zinc-600">
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-zinc-400 flex-shrink-0" />
              Antes do registro no TSE, usamos somente “nome monitorado”,
              “pré-candidatura declarada”, “anunciado pelo partido” ou
              “movimentação pública”.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-zinc-400 flex-shrink-0" />
              Quando o DivulgaCand estiver disponível, o registro oficial
              prevalece sobre a classificação anterior.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-zinc-400 flex-shrink-0" />
              Mandato atual (ex.: deputado distrital em exercício) não implica
              candidatura em 2026; é somente mandato.
            </li>
          </ul>
        </section>

        {/* Datas */}
        <section className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="text-xl font-semibold text-zinc-900 mb-3">Datas</h2>
          <p className="text-sm text-zinc-600 mb-4 leading-relaxed">
            Cada registro mantém três datas separadas, para preservar a
            distinção entre o fato, a coleta e a verificação:
          </p>
          <ul className="space-y-2 text-sm text-zinc-600">
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0" />
              <span>
                <strong className="text-zinc-800">publicadaEm:</strong> data
                em que a fonte publicou o conteúdo (data da reportagem, do
                anúncio ou do registro oficial).
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0" />
              <span>
                <strong className="text-zinc-800">coletadaEm:</strong> data em
                que o agente coletou o dado pela primeira vez.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0" />
              <span>
                <strong className="text-zinc-800">verificadaEm:</strong> data
                da última verificação do agente contra a fonte.
              </span>
            </li>
          </ul>
          <p className="text-sm text-zinc-600 mt-4 leading-relaxed">
            Datas futuras ou inconsistentes são rejeitadas. Ausência de data
            significa que a coleta ainda não foi registrada.
          </p>
        </section>

        {/* Fotografias e licenças */}
        <section className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="text-xl font-semibold text-zinc-900 mb-3">
            Fotografias e licenças de imagem
          </h2>
          <p className="text-sm text-zinc-600 mb-4 leading-relaxed">
            Toda foto registra arquivo ou URL, fonte, URL da fonte, data de
            verificação e licença/base de uso. A ordem de preferência é:
          </p>
          <ol className="space-y-2 text-sm text-zinc-600 list-decimal pl-5">
            <li>
              <strong className="text-zinc-800">DivulgaCand/TSE</strong> — foto
              oficial da candidatura registrada.
            </li>
            <li>
              <strong className="text-zinc-800">
                Página institucional oficial
              </strong>{' '}
              (CLDF, Câmara dos Deputados, Senado Federal).
            </li>
            <li>
              <strong className="text-zinc-800">Site oficial do partido</strong>.
            </li>
            <li>
              <strong className="text-zinc-800">
                Site ou assessoria oficial da pessoa
              </strong>.
            </li>
            <li>
              <strong className="text-zinc-800">
                Imprensa com licença explícita
              </strong>{' '}
              de reutilização. Crédito isolado não substitui licença.
            </li>
          </ol>
          <p className="text-sm text-zinc-600 mt-4 leading-relaxed">
            Na ausência de foto reutilizável, mantemos um{' '}
            <strong>placeholder honesto</strong>. Não usamos hotlink de imprensa
            sem permissão. Validamos identidade, resposta HTTP, MIME de imagem e
            dimensões mínimas.
          </p>
        </section>

        {/* Limites de interpretação */}
        <section className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="text-xl font-semibold text-zinc-900 mb-3">
            Limites de interpretação
          </h2>
          <p className="text-sm text-zinc-600 leading-relaxed mb-4">
            Este monitor prioriza <strong>fatos atribuídos</strong> sobre
            interpretações. Em particular:
          </p>
          <ul className="space-y-2 text-sm text-zinc-600">
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-zinc-400 flex-shrink-0" />
              <span>
                <strong className="text-zinc-800">
                  Sem rumor anônimo ou conteúdo sem data.
                </strong>{' '}
                Não usamos publicação sem autoria identificável, rumor anônimo
                ou conteúdo sem data. O resumo não acrescenta fatos ausentes na
                fonte.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-zinc-400 flex-shrink-0" />
              <span>
                <strong className="text-zinc-800">
                  Volume não mede popularidade, apoio ou intenção de voto.
                </strong>{' '}
                A quantidade de notícias, proposições ou menções reflete
                apenas atividade registrada nas fontes monitoradas.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-zinc-400 flex-shrink-0" />
              <span>
                <strong className="text-zinc-800">Cobertura não é exaustiva.</strong>{' '}
                A ausência de uma notícia ou evidência não significa que o fato
                não ocorreu — apenas que não foi capturado pelas fontes
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
                nome) e não constituem um ranking de mérito político.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-zinc-400 flex-shrink-0" />
              <span>
                <strong className="text-zinc-800">
                  Associação exige citação na fonte.
                </strong>{' '}
                Uma notícia é associada a uma pessoa apenas quando ela é citada
                ou está diretamente relacionada na fonte. Pesquisa de opinião,
                menção ou presença em evento não comprova intenção de
                candidatura.
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
              O DivulgaCand/TSE para a eleição 2026 pode ainda não estar
              disponível; até lá, o monitor registra somente pré-candidaturas e
              movimentações públicas, nunca candidatos oficiais.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-500 flex-shrink-0" />
              As notícias são agregadas automaticamente via RSS e podem não
              representar a totalidade da cobertura jornalística.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-500 flex-shrink-0" />
              O monitoramento de Instagram serve somente para confirmar links
              oficiais; não coleta posts, frequência ou métricas.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-500 flex-shrink-0" />
              Este site não é oficial e não tem vínculo com o TSE, CLDF,
              partidos políticos ou candidatos.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-500 flex-shrink-0" />
              Erros podem ocorrer. Se encontrar algum problema, abra uma issue
              no{' '}
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
            href="/cenario-2026"
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            aria-label="Ver cenário eleitoral 2026 no DF"
          >
            Cenário 2026
          </Link>
          <Link
            href="/noticias"
            className="rounded-lg border border-zinc-300 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            aria-label="Ver últimas notícias eleitorais do DF"
          >
            Últimas notícias
          </Link>
        </div>
      </div>
    </div>
  );
}
