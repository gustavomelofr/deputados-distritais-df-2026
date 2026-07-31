// Página /comparar-eleitoral — comparação descritiva entre pessoas
// monitoradas para o mesmo cargo em 2026 no DF.
//
// Esta rota é ADITIVA: a página /comparar (comparação legislativa
// histórica dos deputados distritais) permanece inalterada e
// acessível. A nova rota segue o critério do item P6 do brief:
//
//   - Aceita SOMENTE pessoas do mesmo cargo (validação na lógica
//     pura `comparar` em src/lib/comparar-eleitoral.ts).
//   - Compara estágio, partido, evidências, datas de verificação e
//     fontes — sem ranking, nota ou inferência de intenção de voto.
//   - Links de evidência apontam para a URL específica registrada
//     na base (nunca homepage).
//   - Estados vazio, erro e carregamento são acessíveis (aria-live,
//     aria-label, role="alert").
//
// Toda informação vem da base eleitoral independente
// (src/data/cenario-eleitoral.ts), validada em build por
// `validarCenarioEleitoral`. Nenhum nome, cargo, partido,
// estágio, evidência, notícia, data ou link é inventado pela
// página. O DivulgaCand/TSE 2026 é consultado em estado inicial
// (rede é vedada pelas regras do loop).

import type { Metadata } from 'next';
import Link from 'next/link';
import type { CargoEleitoral } from '@/types';
import { cenarioEleitoral } from '@/data/cenario-eleitoral';
import { CompararEleitoral } from '@/components/comparar-eleitoral';
import {
  CARGOS_ORDENADOS,
  rotuloCargoComparacao,
} from '@/lib/comparar-eleitoral';

export const metadata: Metadata = {
  title: 'Comparar Eleitoral — Monitor Eleitoral DF 2026',
  description:
    'Comparação descritiva entre pessoas monitoradas para o mesmo cargo em 2026 no DF: estágio, partido, evidências, datas de verificação e fontes. Sem ranking, nota ou inferência de intenção de voto.',
  alternates: {
    canonical: '/comparar-eleitoral',
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Monitor Eleitoral DF 2026',
    title: 'Comparar Eleitoral — Monitor Eleitoral DF 2026',
    description:
      'Comparação descritiva entre pessoas monitoradas para o mesmo cargo em 2026 no DF.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Comparar Eleitoral — Monitor Eleitoral DF 2026',
    description:
      'Comparação descritiva entre pessoas monitoradas para o mesmo cargo em 2026 no DF.',
  },
};

interface Props {
  searchParams: Promise<{
    cargo?: string;
    p1?: string;
    p2?: string;
    p3?: string;
    p4?: string;
  }>;
}

const CARGOS_VALIDOS = new Set<CargoEleitoral>([
  'governador',
  'vice_governador',
  'senador',
  'deputado_federal',
  'deputado_distrital',
]);

function parseCargo(valor: string | undefined): CargoEleitoral | '' {
  if (!valor) return '';
  if (CARGOS_VALIDOS.has(valor as CargoEleitoral)) {
    return valor as CargoEleitoral;
  }
  return '';
}

export default async function CompararEleitoralPage({ searchParams }: Props) {
  const { cargo, p1, p2, p3, p4 } = await searchParams;
  const cargoInicial = parseCargo(cargo);
  const slugsIniciais = [p1, p2, p3, p4]
    .filter((s): s is string => Boolean(s))
    .slice(0, 4);

  // Resumo por cargo — derivado da base, sem inventar. Mostra
  // quantas pessoas com evidência existem em cada cargo, para o
  // usuário saber onde a comparação é possível.
  const resumoCargos = CARGOS_ORDENADOS.map((c) => ({
    cargo: c,
    rotulo: rotuloCargoComparacao(c),
    total: cenarioEleitoral.filter(
      (p) => p.cargo === c && p.evidencias.length > 0,
    ).length,
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      {/* Cabeçalho */}
      <header className="mb-8">
        <p className="text-xs uppercase tracking-wider text-blue-600 font-semibold mb-3">
          Eleições 2026 — Distrito Federal
        </p>
        <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-3">
          Comparar eleitoral
        </h1>
        <p className="text-lg text-zinc-600 max-w-3xl leading-relaxed">
          Comparação descritiva entre pessoas monitoradas para o
          mesmo cargo em 2026 no DF. A página aceita somente pessoas
          do mesmo cargo e compara estágio, partido, evidências,
          datas de verificação e fontes — sem ranking, nota ou
          inferência de intenção de voto.
        </p>
        <p className="text-sm text-zinc-500 mt-4 max-w-3xl leading-relaxed">
          A comparação legislativa histórica dos deputados
          distritais continua disponível em{' '}
          <Link
            href="/comparar"
            aria-label="Abrir comparação legislativa histórica dos deputados distritais"
            className="text-blue-600 hover:underline rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            /comparar
          </Link>
          . Esta rota é estritamente eleitoral.
        </p>
      </header>

      {/* Resumo por cargo — estado honesto quando 0 */}
      <section
        className="rounded-xl border border-zinc-200 bg-white p-6 mb-8"
        aria-labelledby="heading-resumo-cargos"
      >
        <h2
          id="heading-resumo-cargos"
          className="text-xl font-semibold text-zinc-900 mb-2"
        >
          Pessoas monitoradas por cargo
        </h2>
        <p className="text-sm text-zinc-500 mb-5 leading-relaxed">
          Números derivados diretamente da base eleitoral
          independente. Apenas pessoas com evidência específica —
          fonte, URL e data — são contabilizadas. Cargos sem
          pessoas monitoradas aparecem como &ldquo;ainda não
          coletado&rdquo;.
        </p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {resumoCargos.map((r) => (
            <li
              key={r.cargo}
              className="rounded-lg border border-zinc-200 bg-zinc-50 p-4"
            >
              <p className="text-sm font-semibold text-zinc-800">
                {r.rotulo}
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                {r.total > 0 ? (
                  <>
                    <span className="font-bold text-zinc-800">
                      {r.total}
                    </span>{' '}
                    {r.total === 1 ? 'pessoa' : 'pessoas'} com
                    evidência
                  </>
                ) : (
                  <span className="italic">ainda não coletado</span>
                )}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* Componente interativo de comparação */}
      <CompararEleitoral
        base={cenarioEleitoral}
        slugsIniciais={slugsIniciais}
        cargoInicial={cargoInicial}
      />

      {/* Navegação */}
      <nav
        aria-label="Navegação a partir da comparação eleitoral"
        className="mt-8 flex flex-wrap items-center gap-3 border-t border-zinc-200 pt-6"
      >
        <Link
          href="/eleicoes-2026"
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-blue-50 hover:text-blue-700 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          aria-label="Voltar para o hub Eleições 2026"
        >
          <span aria-hidden="true">←</span> Eleições 2026
        </Link>
        <Link
          href="/cenario-2026"
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-blue-50 hover:text-blue-700 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          aria-label="Abrir a base completa de evidências do Cenário 2026"
        >
          Ver cenário completo →
        </Link>
        <Link
          href="/metodologia"
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-blue-50 hover:text-blue-700 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          aria-label="Abrir metodologia completa"
        >
          Metodologia
        </Link>
      </nav>
    </div>
  );
}
