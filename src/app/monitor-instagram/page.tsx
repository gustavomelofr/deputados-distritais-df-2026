import Link from 'next/link';

export default function MonitorInstagramPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-2">
        Radar Instagram
      </h1>
      <p className="text-lg text-zinc-500 mb-10">
        Monitoramento da atividade pública dos deputados distritais no Instagram.
        A coleta ainda não foi iniciada.
      </p>

      <div className="rounded-xl border border-zinc-200 bg-white p-12 text-center">
        <h2 className="text-xl font-semibold text-zinc-900 mb-2">
          Ainda não coletado
        </h2>
        <p className="text-zinc-500 max-w-md mx-auto leading-relaxed">
          O monitoramento da atividade pública dos 24 deputados distritais no
          Instagram ainda não foi iniciado. Nenhum dado de posts, frequência,
          temas ou engajamento está disponível neste momento.
        </p>
        <p className="text-zinc-500 max-w-md mx-auto leading-relaxed mt-3">
          Quando a coleta estiver ativa, os dados serão apresentados aqui com
          a data de cada post e o perfil de origem. O volume de posts não
          mede popularidade, apoio ou intenção de voto — apenas atividade
          registrada na fonte monitorada.
        </p>
        <p className="text-xs text-zinc-400 mt-5">
          Fonte prevista: Instagram público (P2) — ainda não coletado.
        </p>
      </div>

      <p className="text-xs text-zinc-400 mt-6 text-center">
        Ver{' '}
        <Link
          href="/metodologia"
          aria-label="Ver metodologia e detalhes sobre as fontes P2 (Instagram e DivulgaCand/TSE)"
          className="text-blue-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
        >
          metodologia e fontes de dados
        </Link>{' '}
        para detalhes sobre a coleta P2 e seus limites de interpretação.
      </p>
    </div>
  );
}
