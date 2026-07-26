import Link from 'next/link';
import { noticias } from '@/data/noticias';
import { proposicoes } from '@/data/proposicoes';
import { deputados } from '@/data/deputados';

// Análise descritiva de temas e volume.
// Esta página consolida contagens reais derivadas das fontes monitoradas
// (CLDF — SAPL/PLE e Google News RSS) e declara explicitamente os limites
// de interpretação. Nenhum dado é inventado; o que não foi coletado é
// apresentado como indisponível com a origem esperada.

const tipoLabel: Record<string, string> = {
  projeto_de_lei: 'Projeto de Lei',
  indicacao: 'Indicação',
  requerimento: 'Requerimento',
  emenda: 'Emenda',
};

function formatarData(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function mesChave(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function mesLabel(chave: string): string {
  const [ano, mes] = chave.split('-');
  const d = new Date(Number(ano), Number(mes) - 1, 1);
  return d.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
}

export default function AnalisePage() {
  // --- Proposições: contagens reais por tipo ---
  const proposicoesOrdenadas = [...proposicoes].sort(
    (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
  );
  const tiposDisponiveis = Array.from(
    new Set(proposicoesOrdenadas.map((p) => p.tipo))
  ).sort();

  const countsPorTipo = tiposDisponiveis.reduce<Record<string, number>>(
    (acc, t) => {
      acc[t] = proposicoesOrdenadas.filter((p) => p.tipo === t).length;
      return acc;
    },
    {}
  );

  // --- Notícias: contagens reais por fonte (veículo) ---
  const fontes = Array.from(new Set(noticias.map((n) => n.fonte))).sort();
  const countsPorFonte = fontes.reduce<Record<string, number>>((acc, f) => {
    acc[f] = noticias.filter((n) => n.fonte === f).length;
    return acc;
  }, {});

  // --- Notícias: contagem por mês ---
  const mesesNoticias = Array.from(
    new Set(noticias.map((n) => mesChave(n.data)))
  ).sort();
  const countsPorMesNoticias = mesesNoticias.reduce<Record<string, number>>(
    (acc, m) => {
      acc[m] = noticias.filter((n) => mesChave(n.data) === m).length;
      return acc;
    },
    {}
  );

  // --- Notícias: contagem por deputado relacionado ---
  const deputadoPorSlug = deputados.reduce<Record<string, (typeof deputados)[number]>>(
    (acc, d) => {
      acc[d.slug] = d;
      return acc;
    },
    {}
  );
  const noticiasPorDeputado = deputados
    .map((d) => ({
      slug: d.slug,
      nome: d.nome,
      partido: d.partido,
      total: noticias.filter((n) => n.deputadosRelacionados.includes(d.slug)).length,
    }))
    .filter((d) => d.total > 0)
    .sort((a, b) => b.total - a.total);

  // --- Período coberto ---
  const periodoInicioNoticias =
    noticias.length > 0
      ? new Date(
          Math.min(...noticias.map((n) => new Date(n.data).getTime()))
        )
      : null;
  const periodoFimNoticias =
    noticias.length > 0
      ? new Date(
          Math.max(...noticias.map((n) => new Date(n.data).getTime()))
        )
      : null;
  const periodoInicioProposicoes =
    proposicoesOrdenadas.length > 0
      ? new Date(
          Math.min(...proposicoesOrdenadas.map((p) => new Date(p.data).getTime()))
        )
      : null;
  const periodoFimProposicoes =
    proposicoesOrdenadas.length > 0
      ? new Date(
          Math.max(...proposicoesOrdenadas.map((p) => new Date(p.data).getTime()))
        )
      : null;

  const maxCountFonte = Math.max(...Object.values(countsPorFonte), 1);
  const maxCountMes = Math.max(...Object.values(countsPorMesNoticias), 1);
  const maxCountTipo = Math.max(...Object.values(countsPorTipo), 1);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-2">
          Análise descritiva de temas e volume
        </h1>
        <p className="text-lg text-zinc-500 max-w-2xl">
          Contagens derivadas das fontes monitoradas (proposições da CLDF e
          notícias do Google News RSS), organizadas por tipo, fonte, período e
          deputado relacionado. A página declara explicitamente o que não foi
          coletado e os limites de interpretação.
        </p>
        <p className="text-xs text-zinc-400 mt-2">
          Fontes: CLDF — SAPL (PLE) (P1) e Google News RSS (P1). Nenhum dado
          aqui é inventado; o que não foi coletado é apresentado como
          indisponível.
        </p>
      </div>

      {/* Aviso central de limites de interpretação */}
      <section
        className="rounded-xl border border-amber-300 bg-amber-50 p-6 mb-8"
        aria-label="Limites de interpretação"
      >
        <h2 className="text-lg font-semibold text-zinc-900 mb-2">
          Volume não mede popularidade, apoio ou intenção de voto
        </h2>
        <p className="text-sm text-zinc-700 leading-relaxed">
          As contagens abaixo descrevem apenas <strong>atividade registrada
          nas fontes monitoradas</strong> — quantidade de proposições
          apresentadas e de notícias coletadas. O volume <strong>não
          representa</strong> popularidade, apoio da população, intenção de
          voto, efetividade legislativa nem probabilidade de reeleição ou
          derrota eleitoral. Diferenças de volume podem refletir o recorte do
          período coletado, o tipo de proposição (indicações tendem a ser mais
          numerosas que projetos de lei), a cobertura de cada veículo e o
          estilo de atuação de cada deputado — não mérito político.
        </p>
        <p className="text-xs text-zinc-500 mt-3">
          Ver{' '}
          <Link href="/metodologia" className="text-blue-600 hover:underline">
            metodologia e limites de interpretação
          </Link>{' '}
          para detalhes.
        </p>
      </section>

      {/* Volume de proposições por tipo */}
      <section
        className="rounded-xl border border-zinc-200 bg-white p-6 mb-8"
        aria-label="Volume de proposições por tipo"
      >
        <h2 className="text-xl font-semibold text-zinc-900 mb-1">
          Volume de proposições por tipo
        </h2>
        <p className="text-sm text-zinc-500 mb-4">
          {proposicoesOrdenadas.length} proposições no total
          {periodoInicioProposicoes && periodoFimProposicoes && (
            <>
              {' '}· período de {formatarData(periodoInicioProposicoes.toISOString())} a{' '}
              {formatarData(periodoFimProposicoes.toISOString())}
            </>
          )}
          .
        </p>
        {tiposDisponiveis.length === 0 ? (
          <p className="text-sm text-zinc-500">
            Ainda não há proposições coletadas.
          </p>
        ) : (
          <ul className="space-y-2.5">
            {tiposDisponiveis.map((t) => {
              const pct = proposicoesOrdenadas.length > 0
                ? Math.round((countsPorTipo[t] / proposicoesOrdenadas.length) * 100)
                : 0;
              const largura = Math.round((countsPorTipo[t] / maxCountTipo) * 100);
              return (
                <li key={t} className="flex items-center gap-2">
                  <span className="w-40 shrink-0 text-sm text-zinc-700">
                    {tipoLabel[t] || t}
                  </span>
                  <span
                    className="flex-1 h-2.5 rounded-full bg-zinc-100 overflow-hidden"
                    role="img"
                    aria-label={`${countsPorTipo[t]} proposições (${pct}% do total)`}
                  >
                    <span
                      className="block h-full bg-purple-500"
                      style={{ width: `${largura}%` }}
                      aria-hidden="true"
                    />
                  </span>
                  <span className="w-24 shrink-0 text-right text-xs text-zinc-500">
                    {countsPorTipo[t]} ({pct}%)
                  </span>
                </li>
              );
            })}
          </ul>
        )}
        <p className="text-xs text-zinc-400 mt-4">
          Fonte:{' '}
          <a
            href="https://dados.cl.df.gov.br/id/dataset/proposicoes"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            CLDF — SAPL (PLE)
          </a>
          .
        </p>
      </section>

      {/* Volume de notícias por fonte */}
      <section
        className="rounded-xl border border-zinc-200 bg-white p-6 mb-8"
        aria-label="Volume de notícias por fonte"
      >
        <h2 className="text-xl font-semibold text-zinc-900 mb-1">
          Volume de notícias por fonte
        </h2>
        <p className="text-sm text-zinc-500 mb-4">
          {noticias.length} notícias no total
          {periodoInicioNoticias && periodoFimNoticias && (
            <>
              {' '}· período de {formatarData(periodoInicioNoticias.toISOString())} a{' '}
              {formatarData(periodoFimNoticias.toISOString())}
            </>
          )}
          .
        </p>
        {fontes.length === 0 ? (
          <p className="text-sm text-zinc-500">
            Ainda não há notícias coletadas.
          </p>
        ) : (
          <ul className="space-y-2.5">
            {fontes
              .slice()
              .sort((a, b) => countsPorFonte[b] - countsPorFonte[a])
              .map((f) => {
                const pct = noticias.length > 0
                  ? Math.round((countsPorFonte[f] / noticias.length) * 100)
                  : 0;
                const largura = Math.round((countsPorFonte[f] / maxCountFonte) * 100);
                return (
                  <li key={f} className="flex items-center gap-2">
                    <span className="w-48 shrink-0 text-sm text-zinc-700 truncate">
                      {f}
                    </span>
                    <span
                      className="flex-1 h-2.5 rounded-full bg-zinc-100 overflow-hidden"
                      role="img"
                      aria-label={`${countsPorFonte[f]} notícias (${pct}% do total)`}
                    >
                      <span
                        className="block h-full bg-blue-500"
                        style={{ width: `${largura}%` }}
                        aria-hidden="true"
                      />
                    </span>
                    <span className="w-24 shrink-0 text-right text-xs text-zinc-500">
                      {countsPorFonte[f]} ({pct}%)
                    </span>
                  </li>
                );
              })}
          </ul>
        )}
        <p className="text-xs text-zinc-400 mt-4">
          Fonte: Google News RSS (P1). A contagem por veículo reflete o que o
          agregador retornou no período — não a cobertura total da imprensa
          sobre a CLDF.
        </p>
      </section>

      {/* Volume de notícias por mês */}
      <section
        className="rounded-xl border border-zinc-200 bg-white p-6 mb-8"
        aria-label="Volume de notícias por mês"
      >
        <h2 className="text-xl font-semibold text-zinc-900 mb-1">
          Volume de notícias por mês
        </h2>
        <p className="text-sm text-zinc-500 mb-4">
          Distribuição das {noticias.length} notícias coletadas pelos meses do
          período coberto.
        </p>
        {mesesNoticias.length === 0 ? (
          <p className="text-sm text-zinc-500">
            Ainda não há notícias coletadas.
          </p>
        ) : (
          <ul className="space-y-2.5">
            {mesesNoticias
              .slice()
              .sort((a, b) => a.localeCompare(b))
              .map((m) => {
                const largura = Math.round((countsPorMesNoticias[m] / maxCountMes) * 100);
                return (
                  <li key={m} className="flex items-center gap-2">
                    <span className="w-32 shrink-0 text-sm text-zinc-700 capitalize">
                      {mesLabel(m)}
                    </span>
                    <span
                      className="flex-1 h-2.5 rounded-full bg-zinc-100 overflow-hidden"
                      role="img"
                      aria-label={`${countsPorMesNoticias[m]} notícias em ${mesLabel(m)}`}
                    >
                      <span
                        className="block h-full bg-emerald-500"
                        style={{ width: `${largura}%` }}
                        aria-hidden="true"
                      />
                    </span>
                    <span className="w-16 shrink-0 text-right text-xs text-zinc-500">
                      {countsPorMesNoticias[m]}
                    </span>
                  </li>
                );
              })}
          </ul>
        )}
        <p className="text-xs text-zinc-400 mt-4">
          A variação mensal reflete a frequência de coleta do Google News RSS
          e a sazonalidade da cobertura — não a atividade real da CLDF, que é
          contínua.
        </p>
      </section>

      {/* Notícias por deputado relacionado */}
      <section
        className="rounded-xl border border-zinc-200 bg-white p-6 mb-8"
        aria-label="Notícias por deputado relacionado"
      >
        <h2 className="text-xl font-semibold text-zinc-900 mb-1">
          Notícias por deputado relacionado
        </h2>
        <p className="text-sm text-zinc-500 mb-4">
          Contagem de notícias que mencionam cada deputado. A maioria das
          notícias não cita deputados identificados — a ausência de um
          deputado nesta lista significa apenas que ele não foi citado nas
          notícias coletadas, não que não tenha atividade.
        </p>
        {noticiasPorDeputado.length === 0 ? (
          <p className="text-sm text-zinc-500">
            Nenhum deputado foi citado nas notícias coletadas até agora.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {noticiasPorDeputado.map((d) => (
              <Link
                key={d.slug}
                href={`/deputados-distritais/${d.slug}`}
                aria-label={`Ver perfil de ${d.nome} (${d.total} notícias relacionadas)`}
                className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 text-blue-700 px-3 py-1 text-xs font-medium hover:bg-blue-100 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                {d.nome} ({d.partido})
                <span className="rounded-full bg-blue-100 px-1.5 text-[10px] font-semibold">
                  {d.total}
                </span>
              </Link>
            ))}
          </div>
        )}
        <p className="text-xs text-zinc-400 mt-4">
          A associação notícia–deputado vem das tags do Google News RSS
          processadas na coleta. Não há interpretação editorial sobre o teor
          da menção.
        </p>
      </section>

      {/* Análise de temas — estado honesto */}
      <section
        className="rounded-xl border border-amber-200 bg-amber-50 p-6 mb-8"
        aria-label="Análise de temas"
      >
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-xl font-semibold text-zinc-900">
            Análise de temas
          </h2>
          <span className="rounded-full bg-amber-100 text-amber-700 text-xs font-medium px-2.5 py-0.5">
            ainda não coletado
          </span>
        </div>
        <p className="text-sm text-zinc-700 leading-relaxed mb-3">
          Nenhuma das fontes monitoradas fornece uma <strong>classificação
          temática estruturada</strong>. A API pública do Processo Legislativo
          Eletrônico (PLE/CLDF) não disponibiliza categorização por área
          (saúde, educação, segurança, mobilidade, entre outras) para as
          proposições; o Google News RSS não traz tags temáticas estruturadas
          para as notícias. Produzir uma análise por tema exigiria
          interpretação editorial do conteúdo de cada item, o que não é feito
          aqui para evitar atribuir temas não declarados pela fonte.
        </p>
        <p className="text-sm text-zinc-700 leading-relaxed">
          Por enquanto, a análise descritiva se limita a <strong>volume</strong>{' '}
          (por tipo, fonte, período e deputado). Quando uma classificação
          temática oficial da CLDF ou uma análise atribuída com fonte
          declarada estiver disponível, esta seção passará a exibi-la com
          fonte e data.
        </p>
        <p className="text-xs text-zinc-500 mt-4">
          Origem esperada: classificação temática oficial da CLDF ou análise
          atribuída com fonte declarada. Enquanto indisponível, use o filtro
          por tipo em{' '}
          <Link
            href="/atividade-legislativa"
            className="text-blue-600 hover:underline"
          >
            atividade legislativa
          </Link>{' '}
          e a descrição de cada proposição para identificar a área tratada.
        </p>
      </section>

      {/* Nota metodológica */}
      <section className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-zinc-900 mb-3">
          Sobre esta análise
        </h2>
        <p className="text-sm text-zinc-600 leading-relaxed">
          Esta página consolida contagens reais derivadas das fontes
          monitoradas (CLDF — SAPL/PLE e Google News RSS). Os números são
          fatos verificáveis; as interpretações são limitadas a declarar o
          que os números <strong>não</strong> significam. Volume de proposições
          ou notícias não mede popularidade, apoio, intenção de voto nem
          efetividade legislativa — é apenas um registro de atividade formal
          nas fontes.
        </p>
        <p className="text-xs text-zinc-400 mt-4">
          Ver{' '}
          <Link href="/metodologia" className="text-blue-600 hover:underline">
            metodologia completa
          </Link>{' '}
          e{' '}
          <Link
            href="/atividade-legislativa"
            className="text-blue-600 hover:underline"
          >
            atividade legislativa
          </Link>{' '}
          para detalhes das proposições individuais.
        </p>
      </section>
    </div>
  );
}
