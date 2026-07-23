import Link from 'next/link';

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
              className="text-blue-600 underline"
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
                  className="text-blue-600 underline"
                >
                  cl.df.gov.br
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
                eleitoral dos deputados.
              </p>
            </div>
          </div>
        </section>

        {/* Limitações */}
        <section className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="text-xl font-semibold text-zinc-900 mb-3">
            Limitações e transparência
          </h2>
          <ul className="space-y-2 text-sm text-zinc-600">
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-500 flex-shrink-0" />
              Os dados de proposições, presença e gastos individuais por deputado
              ainda estão sendo integrados da API da CLDF.
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
              Erros podem ocorrer. Se encontrar algum problema, abra uma issue no
              GitHub.
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
              { label: 'Framework', value: 'Next.js 15 (App Router)' },
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
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 transition"
          >
            Ver deputados
          </Link>
          <Link
            href="/noticias"
            className="rounded-lg border border-zinc-300 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition"
          >
            Últimas notícias
          </Link>
        </div>
      </div>
    </div>
  );
}
