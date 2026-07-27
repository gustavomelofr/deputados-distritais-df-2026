import Link from 'next/link';
import { proposicoes, type ProposicaoComAutor } from '@/data/proposicoes';
import { deputados } from '@/data/deputados';

// Lookup de slug -> nome do deputado, derivado dos dados (sem hardcoding).
const deputadoPorSlug = Object.fromEntries(
  deputados.map((d) => [d.slug, d.nome])
);

// Rótulos legíveis por tipo e status, derivados do tipo original da CLDF.
const tipoLabel: Record<string, string> = {
  projeto_de_lei: 'Projeto de Lei',
  indicacao: 'Indicação',
  requerimento: 'Requerimento',
  emenda: 'Emenda',
};

const statusConfig: Record<string, { label: string; badgeClass: string }> = {
  apresentada: {
    label: 'Apresentada',
    badgeClass: 'bg-blue-100 text-blue-700',
  },
  em_tramitacao: {
    label: 'Em tramitação',
    badgeClass: 'bg-amber-100 text-amber-700',
  },
  aprovada: {
    label: 'Aprovada',
    badgeClass: 'bg-green-100 text-green-700',
  },
  rejeitada: {
    label: 'Rejeitada',
    badgeClass: 'bg-red-100 text-red-700',
  },
};

interface Props {
  searchParams: Promise<{ tipo?: string; status?: string }>;
}

export default async function AtividadeLegislativaPage({ searchParams }: Props) {
  const { tipo: filtroTipo, status: filtroStatus } = await searchParams;

  // Ordena por data decrescente (mais recentes primeiro).
  const ordenadas = [...proposicoes].sort(
    (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
  );

  const tiposDisponiveis = Array.from(
    new Set(ordenadas.map((p) => p.tipo))
  ).sort() as ProposicaoComAutor['tipo'][];

  const statusDisponiveis = Array.from(
    new Set(ordenadas.map((p) => p.status))
  ).sort() as ProposicaoComAutor['status'][];

  const tipoValido =
    filtroTipo && (tiposDisponiveis as string[]).includes(filtroTipo)
      ? (filtroTipo as ProposicaoComAutor['tipo'])
      : null;
  const statusValido =
    filtroStatus && (statusDisponiveis as string[]).includes(filtroStatus)
      ? (filtroStatus as ProposicaoComAutor['status'])
      : null;

  const filtradas = ordenadas.filter(
    (p) =>
      (!tipoValido || p.tipo === tipoValido) &&
      (!statusValido || p.status === statusValido)
  );

  // Contagens por tipo e status (para os filtros).
  const countsPorTipo = tiposDisponiveis.reduce<Record<string, number>>(
    (acc, t) => {
      acc[t] = ordenadas.filter((p) => p.tipo === t).length;
      return acc;
    },
    {}
  );
  const countsPorStatus = statusDisponiveis.reduce<Record<string, number>>(
    (acc, s) => {
      acc[s] = ordenadas.filter((p) => p.status === s).length;
      return acc;
    },
    {}
  );

  // Deputados autores únicos (com contagem de proposições).
  const autores = Array.from(
    new Set(ordenadas.map((p) => p.deputadoSlug))
  )
    .map((slug) => ({
      slug,
      nome: deputadoPorSlug[slug] || slug,
      total: ordenadas.filter((p) => p.deputadoSlug === slug).length,
    }))
    .sort((a, b) => b.total - a.total);

  const ultimaData =
    ordenadas.length > 0
      ? new Date(ordenadas[0].data).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        })
      : null;

  const periodoInicio =
    ordenadas.length > 0
      ? new Date(
          Math.min(...ordenadas.map((p) => new Date(p.data).getTime()))
        ).toLocaleDateString('pt-BR')
      : null;
  const periodoFim =
    ordenadas.length > 0
      ? new Date(
          Math.max(...ordenadas.map((p) => new Date(p.data).getTime()))
        ).toLocaleDateString('pt-BR')
      : null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-2">
          Atividade legislativa
        </h1>
        <p className="text-lg text-zinc-500 max-w-2xl">
          Proposições apresentadas na Câmara Legislativa do Distrito Federal,
          organizadas por tipo, status e deputado autor. Cada item mostra
          fonte, data e link para o documento original na CLDF.
        </p>
        <p className="text-xs text-zinc-400 mt-2">
          Fonte: CLDF — SAPL (PLE) (P1) ·{' '}
          <a
            href="https://dados.cl.df.gov.br/id/dataset/proposicoes"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Dataset oficial de proposições da CLDF (abre em nova aba)"
            className="text-blue-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
          >
            dataset oficial
          </a>
          {ultimaData && <> · Última atualização: {ultimaData}</>}
          {periodoInicio && periodoFim && (
            <> · Período coberto: {periodoInicio} a {periodoFim}</>
          )}
        </p>
      </div>

      {/* Resumo por status */}
      <section className="mb-10" aria-label="Resumo por status">
        <h2 className="text-sm font-semibold text-zinc-700 mb-3">
          Status das proposições
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {statusDisponiveis.map((s) => {
            const config = statusConfig[s] || {
              label: s,
              badgeClass: 'bg-zinc-100 text-zinc-700',
            };
            const ativo = statusValido === s;
            return (
              <Link
                key={s}
                href={ativo ? '/atividade-legislativa' : `/atividade-legislativa?status=${s}`}
                aria-label={`Filtrar por status ${config.label} (${countsPorStatus[s]} proposições)`}
                className={`rounded-xl border p-4 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  ativo
                    ? 'border-blue-400 bg-blue-50'
                    : 'border-zinc-200 bg-white hover:border-zinc-300'
                }`}
              >
                <span
                  className={`inline-block rounded-full text-xs font-medium px-2.5 py-0.5 mb-2 ${config.badgeClass}`}
                >
                  {config.label}
                </span>
                <p className="text-2xl font-bold text-zinc-900">
                  {countsPorStatus[s]}
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  {countsPorStatus[s] === 1
                    ? 'proposição'
                    : 'proposições'}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Filtros por tipo */}
      <section className="mb-8" aria-label="Filtros por tipo">
        <h2 className="text-sm font-semibold text-zinc-700 mb-3">
          Filtrar por tipo
        </h2>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtro por tipo de proposição">
          <Link
            href="/atividade-legislativa"
            aria-label="Exibir todos os tipos"
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
              !tipoValido
                ? 'bg-zinc-900 text-white'
                : 'bg-white border border-zinc-200 text-zinc-600 hover:border-zinc-300'
            }`}
          >
            Todos ({ordenadas.length})
          </Link>
          {tiposDisponiveis.map((t) => {
            const ativo = tipoValido === t;
            return (
              <Link
                key={t}
                href={ativo ? '/atividade-legislativa' : `/atividade-legislativa?tipo=${t}`}
                aria-label={`Filtrar por ${tipoLabel[t] || t} (${countsPorTipo[t]} proposições)`}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  ativo
                    ? 'bg-zinc-900 text-white'
                    : 'bg-white border border-zinc-200 text-zinc-600 hover:border-zinc-300'
                }`}
              >
                {tipoLabel[t] || t} ({countsPorTipo[t]})
              </Link>
            );
          })}
        </div>
      </section>

      {/* Temas */}
      <section className="mb-10" aria-label="Temas das proposições">
        <h2 className="text-sm font-semibold text-zinc-700 mb-3">
          Temas
        </h2>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="rounded-full bg-amber-100 text-amber-700 text-xs font-medium px-2.5 py-0.5">
              ainda não coletado
            </span>
          </div>
          <p className="text-sm text-zinc-600 leading-relaxed">
            A API pública do Processo Legislativo Eletrônico (PLE/CLDF) não
            disponibiliza uma classificação temática estruturada para as
            proposições. A categorização por área (saúde, educação,
            segurança, mobilidade, entre outras) exigiria interpretação
            editorial do conteúdo de cada proposição, o que não é feito
            aqui para evitar atribuir temas não declarados pela fonte.
          </p>
          <p className="text-xs text-zinc-400 mt-3">
            Origem esperada: classificação temática oficial da CLDF ou
            análise atribuída com fonte declarada. Enquanto indisponível,
            use o filtro por tipo e a descrição de cada proposição para
            identificar a área tratada.
          </p>
        </div>
      </section>

      {/* Análise descritiva de volume */}
      <section className="mb-10" aria-label="Análise descritiva de volume">
        <h2 className="text-sm font-semibold text-zinc-700 mb-3">
          Análise descritiva de volume
        </h2>
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <p className="text-sm text-zinc-600 leading-relaxed">
            No período de {periodoInicio} a {periodoFim}, a base reúne{' '}
            <strong className="text-zinc-800">{ordenadas.length} proposições</strong>{' '}
            de {autores.length} deputados autores. A distribuição por tipo é:
          </p>
          <ul className="mt-3 space-y-1.5 text-sm text-zinc-600">
            {tiposDisponiveis.map((t) => {
              const pct = ordenadas.length > 0
                ? Math.round((countsPorTipo[t] / ordenadas.length) * 100)
                : 0;
              return (
                <li key={t} className="flex items-center gap-2">
                  <span className="w-40 shrink-0 text-zinc-700">
                    {tipoLabel[t] || t}
                  </span>
                  <span
                    className="flex-1 h-2 rounded-full bg-zinc-100 overflow-hidden"
                    role="img"
                    aria-label={`${countsPorTipo[t]} proposições (${pct}% do total)`}
                  >
                    <span
                      className="block h-full bg-purple-500"
                      style={{ width: `${pct}%` }}
                      aria-hidden="true"
                    />
                  </span>
                  <span className="w-20 shrink-0 text-right text-xs text-zinc-500">
                    {countsPorTipo[t]} ({pct}%)
                  </span>
                </li>
              );
            })}
          </ul>
          <p className="mt-4 text-xs text-zinc-500 leading-relaxed">
            <strong className="text-zinc-700">
              Volume não mede popularidade, apoio ou intenção de voto.
            </strong>{' '}
            A quantidade de proposições por deputado, tipo ou período é apenas
            um registro de atividade formal na fonte (CLDF — SAPL/PLE). Não
            representa efetividade legislativa, apoio popular, intenção de
            voto nem probabilidade de reeleição. Diferenças de volume podem
            refletir recorte do período coletado, tipo de proposição
            (indicações tendem a ser mais numerosas que projetos de lei) e
            estilo de atuação, não mérito político. Ver{' '}
            <Link
              href="/metodologia"
              aria-label="Ver metodologia e limites de interpretação dos dados de atividade legislativa"
              className="text-blue-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
            >
              metodologia e limites de interpretação
            </Link>
            .
          </p>
        </div>
      </section>

      {/* Deputados autores */}
      <section className="mb-10" aria-label="Deputados autores">
        <h2 className="text-sm font-semibold text-zinc-700 mb-3">
          Deputados autores ({autores.length})
        </h2>
        <div className="flex flex-wrap gap-2">
          {autores.map((a) => (
            <Link
              key={a.slug}
              href={`/deputados-distritais/${a.slug}`}
              aria-label={`Ver perfil de ${a.nome} (${a.total} proposições)`}
              className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 text-blue-700 px-3 py-1 text-xs font-medium hover:bg-blue-100 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              {a.nome}
              <span className="rounded-full bg-blue-100 px-1.5 text-[10px] font-semibold">
                {a.total}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Lista de proposições */}
      <section aria-label="Proposições recentes">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-zinc-900">
            Proposições recentes
          </h2>
          <p className="text-sm text-zinc-400">
            {filtradas.length}{' '}
            {filtradas.length === 1 ? 'proposição' : 'proposições'}
            {(tipoValido || statusValido) && ' (filtradas)'}
          </p>
        </div>

        {filtradas.length === 0 ? (
          <div className="rounded-xl border border-zinc-200 bg-white p-12 text-center">
            <p className="text-zinc-400 text-lg">
              Nenhuma proposição corresponde aos filtros selecionados.
            </p>
            <Link
              href="/atividade-legislativa"
              aria-label="Limpar filtros e exibir todas as proposições"
              className="inline-flex items-center gap-1 mt-3 text-sm font-semibold text-blue-600 hover:text-blue-500 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
            >
              Limpar filtros <span aria-hidden="true">→</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filtradas.map((p) => {
              const config = statusConfig[p.status] || {
                label: p.status,
                badgeClass: 'bg-zinc-100 text-zinc-700',
              };
              return (
                <article
                  key={p.id}
                  className="flex flex-col rounded-xl border border-zinc-200 bg-white p-5 hover:border-blue-200 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="rounded-full bg-purple-100 text-purple-700 text-xs font-medium px-2.5 py-0.5">
                        {tipoLabel[p.tipo] || p.tipoOriginal}
                      </span>
                      <span
                        className={`rounded-full text-xs font-medium px-2.5 py-0.5 ${config.badgeClass}`}
                      >
                        {config.label}
                      </span>
                    </div>
                    <time
                      dateTime={p.data}
                      className="text-xs text-zinc-400 whitespace-nowrap"
                    >
                      {new Date(p.data).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </time>
                  </div>
                  <h3 className="font-semibold text-zinc-900 leading-snug">
                    {p.sigla}
                  </h3>
                  <p className="mt-2 text-sm text-zinc-600 leading-relaxed line-clamp-3">
                    {p.descricao}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-zinc-400">
                    <span>
                      <span className="text-zinc-500">Etapa:</span> {p.etapa}
                    </span>
                    <span>
                      <span className="text-zinc-500">Autor:</span>{' '}
                      <Link
                        href={`/deputados-distritais/${p.deputadoSlug}`}
                        aria-label={`Ver perfil de ${deputadoPorSlug[p.deputadoSlug] || p.autor} na lista de deputados distritais`}
                        className="rounded-full bg-blue-50 text-blue-700 px-2 py-0.5 hover:bg-blue-100 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                      >
                        {deputadoPorSlug[p.deputadoSlug] || p.autor}
                      </Link>
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-zinc-400">
                    <span>
                      <span className="text-zinc-500">Fonte:</span>{' '}
                      <a
                        href={p.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Abrir fonte da proposição ${p.sigla} na CLDF em nova aba`}
                        className="text-blue-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
                      >
                        CLDF — SAPL (PLE)
                      </a>
                    </span>
                  </div>
                  <a
                    href={p.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Abrir proposição ${p.sigla} na CLDF em nova aba`}
                    className="mt-3 inline-flex items-center gap-1 text-xs text-blue-600 font-medium hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
                  >
                    Abrir na CLDF <span aria-hidden="true">→</span>
                  </a>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Nota metodológica */}
      <section className="mt-12">
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-6">
          <h2 className="text-sm font-semibold text-zinc-700 mb-2">
            Sobre estes dados
          </h2>
          <p className="text-sm text-zinc-500 leading-relaxed">
            As proposições listadas são{' '}
            {tiposDisponiveis.map((t, i) => {
              const label = (tipoLabel[t] || t).toLowerCase();
              const sep =
                i === 0
                  ? ''
                  : i === tiposDisponiveis.length - 1
                    ? ' e '
                    : ', ';
              return <span key={t}>{sep}{label}</span>;
            })}{' '}
            apresentados na Câmara Legislativa do Distrito Federal, coletados
            da API pública do Processo Legislativo Eletrônico (PLE/CLDF). O
            volume de proposições por deputado não mede efetividade
            legislativa, apoio popular ou intenção de voto — é apenas um
            registro de atividade formal na fonte. Cada item vincula-se ao
            deputado autor via slug e ao documento original na CLDF.
          </p>
          <p className="text-xs text-zinc-400 mt-3">
            Ver{' '}
            <Link
              href="/metodologia"
              aria-label="Ver metodologia e fontes dos dados de atividade legislativa"
              className="text-blue-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
            >
              metodologia e fontes
            </Link>{' '}
            para detalhes sobre coleta, frequência e limites de interpretação.
          </p>
        </div>
      </section>
    </div>
  );
}
