// Página de perfil eleitoral individual — /perfil-eleitoral/[slug].
//
// Cada pessoa monitorada em cenario-eleitoral.ts (49 nomes atualmente
// com evidência) ganha um perfil estático em build time. O perfil exibe:
//
//   - Foto atribuída ou placeholder honesto (fotoPlaceholder.ts);
//   - Identidade (nome, nome completo, cargo, partido, estágio);
//   - Evidência de destaque (mais recente por dataEvidencia);
//   - Histórico completo de evidências (P3);
//   - Notícias relacionadas filtradas por pessoa.noticiasRelacionadas
//     (base validada em src/data/noticias.ts; sem acrescentar fatos);
//   - Links oficiais confirmados em fonte institucional (P3 + auditoria
//     de Instagram P4 quando aplicável);
//
// Toda informação vem da base eleitoral independente validada em build
// pelo script validar-cenario-eleitoral.ts. Nenhum nome, cargo, partido,
// estágio, evidência, notícia, data ou link é inventado pela página. O
// DivulgaCand/TSE 2026 é consultado em estado inicial (rede é vedada
// pelas regras do loop).

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { PessoaEleitoral } from '@/types';
import { noticias } from '@/data/noticias';
import { auditoriaInstagramNomesMonitoradosLote1 } from '@/data/auditoria-instagram';
import {
  classesEstagioPerfil,
  formatarDataPerfil,
  linksOficiaisParaPerfil,
  perfilEleitoralDePessoa,
  pessoaEleitoralPorSlug,
  rotuloCargo,
  rotuloEstagio,
  rotuloFonteCategoria,
  slugsPerfilEleitoral,
} from '@/lib/perfil-eleitoral';

interface Props {
  params: Promise<{ slug: string }>;
}

/** Lista os slugs válidos para gerar rotas estáticas (Next 16). */
export async function generateStaticParams(): Promise<{ slug: string }[]> {
  return slugsPerfilEleitoral().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { slug } = await params;
  const pessoa = pessoaEleitoralPorSlug(slug);
  if (!pessoa) return { title: 'Perfil não encontrado' };

  const estagioHumano = rotuloEstagio(pessoa.estagio);
  const cargo = rotuloCargo(pessoa.cargo);
  const partido = pessoa.partido ? ` (${pessoa.partido})` : '';

  const title = `${pessoa.nome}${partido} — Perfil eleitoral ${cargo} 2026 DF`;
  const description = `Perfil de ${pessoa.nome}${partido}: ${cargo} em 2026 no DF, estágio atual ${estagioHumano}, com histórico de evidências, notícias e links oficiais.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/perfil-eleitoral/${slug}`,
    },
    openGraph: {
      type: 'profile',
      locale: 'pt_BR',
      siteName: 'Monitor Eleitoral DF 2026',
      title,
      description,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

function pessoaPorSlug(slug: string): PessoaEleitoral | null {
  return pessoaEleitoralPorSlug(slug);
}

export default async function PerfilEleitoralPage({ params }: Props) {
  const { slug } = await params;
  const pessoa = pessoaPorSlug(slug);
  if (!pessoa) notFound();

  // Mapeamento da auditoria de Instagram no formato que a lógica pura
  // espera. Apenas handle/url/fonte/urlFonte/verificadaEm entram — sem
  // métrica, sem posts, sem frequência.
  const auditoriaInstagram = auditoriaInstagramNomesMonitoradosLote1.map(
    (it) => ({
      slug: it.slug,
      handle: it.handle,
      url: it.url,
      fonte: it.fonte,
      urlFonte: it.urlFonte,
      verificadaEm: it.verificadaEm,
    })
  );

  const perfil = perfilEleitoralDePessoa(
    pessoa,
    noticias,
    auditoriaInstagram,
  );

  // Documento auxiliar para o link oficial não repetir imports extra.
  void linksOficiaisParaPerfil;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      {/* Back link */}
      <Link
        href="/eleicoes-2026"
        aria-label="Voltar para o hub Eleições 2026"
        className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-blue-600 transition mb-8 rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        <span aria-hidden="true">←</span> Eleições 2026
      </Link>

      {/* Cabeçalho do perfil — identidade + foto atribuída ou placeholder */}
      <header
        className="flex flex-col md:flex-row gap-6 md:gap-10 mb-10"
        aria-labelledby="titulo-perfil"
      >
        <div className="flex-shrink-0">
          <div className="h-32 w-32 md:h-40 md:w-40 rounded-2xl overflow-hidden bg-zinc-100 ring-4 ring-zinc-100">
            <img
              src={perfil.foto.url}
              alt={
                perfil.foto.placeholder
                  ? `Placeholder de foto de ${perfil.identidade.nome}`
                  : `Foto de ${perfil.identidade.nome}`
              }
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>
          {perfil.foto.placeholder ? (
            <p className="text-xs text-zinc-400 mt-2 max-w-[10rem] leading-tight">
              Placeholder honesto — foto não verificada para o cargo
              pretendido em 2026.
            </p>
          ) : (
            <p className="text-xs text-zinc-400 mt-2 max-w-[10rem] leading-tight">
              Foto: <a
                href={perfil.foto.urlFonte}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >{perfil.foto.fonte}</a>
              {perfil.foto.credito ? null : null}
              {' '}· verificada em {perfil.foto.verificadaEm}
            </p>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs uppercase tracking-wider text-blue-600 font-semibold mb-3">
            Perfil eleitoral · {formatarDataPerfil(perfil.dataEvidenciaMaisRecente)}
          </p>
          <h1
            id="titulo-perfil"
            className="text-2xl md:text-3xl font-bold text-zinc-900 mb-2"
          >
            {perfil.identidade.nome}
          </h1>
          <p className="text-zinc-500 text-sm mb-4">
            {perfil.identidade.nomeCompleto}
          </p>

          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="rounded-full bg-blue-100 text-blue-700 text-sm font-semibold px-3 py-1">
              {rotuloCargo(perfil.identidade.cargo)}
            </span>
            {perfil.identidade.partido && (
              <span className="rounded-full bg-zinc-100 text-zinc-700 text-sm font-semibold px-3 py-1">
                {perfil.identidade.partido}
              </span>
            )}
            <span
              className={`rounded-full text-xs font-medium px-2.5 py-1 ${classesEstagioPerfil(
                perfil.identidade.estagio,
              )}`}
            >
              {rotuloEstagio(perfil.identidade.estagio)}
            </span>
          </div>

          <p className="text-sm text-zinc-600 leading-relaxed mb-2">
            <strong className="text-zinc-800">{perfil.totalEvidencias}</strong>{' '}
            {perfil.totalEvidencias === 1 ? 'evidência' : 'evidências'}{' '}
            registrada{perfil.totalEvidencias === 1 ? '' : 's'} com fonte
            específica e data para este nome.
          </p>
          <p className="text-xs text-zinc-400">
            Perfil gerado a partir da base eleitoral independente
            (src/data/cenario-eleitoral.ts). Nada aqui é inventado.
          </p>
        </div>
      </header>

      {/* Evidência mais recente — destaque factual */}
      <section
        aria-labelledby="titulo-destaque"
        className="rounded-xl border border-zinc-200 bg-white p-6 mb-8"
      >
        <h2
          id="titulo-destaque"
          className="text-lg font-semibold text-zinc-900 mb-3"
        >
          Evidência mais recente
        </h2>
        <p className="text-xs text-zinc-500 mb-3">
          {formatarDataPerfil(perfil.evidenciaDestaque.dataEvidencia)} ·{' '}
          {rotuloFonteCategoria(perfil.evidenciaDestaque.fonteCategoria)}
        </p>
        <p className="text-sm text-zinc-700 leading-relaxed mb-3">
          {perfil.evidenciaDestaque.descricao}
        </p>
        <p className="text-xs text-zinc-500">
          <span className="text-zinc-600">Fonte:</span>{' '}
          <a
            href={perfil.evidenciaDestaque.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Abrir fonte "${perfil.evidenciaDestaque.fonte}" da evidência mais recente em nova aba`}
            className="text-blue-600 hover:underline rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            {perfil.evidenciaDestaque.fonte}
          </a>
        </p>
      </section>

      {/* Histórico completo de evidências (P3) */}
      <section
        aria-labelledby="titulo-historico"
        className="rounded-xl border border-zinc-200 bg-white p-6 mb-8"
      >
        <h2
          id="titulo-historico"
          className="text-lg font-semibold text-zinc-900 mb-3"
        >
          Histórico de evidências
        </h2>
        <p className="text-sm text-zinc-500 leading-relaxed mb-4">
          Lista cronológica das evidências registradas para esta pessoa. A
          ordem cronológica preserva mudança de estágio, partido ou cargo sem
          apagar o registro anterior.
        </p>
        <ol className="space-y-4 list-decimal pl-5">
          {perfil.historicoEvidencias
            .slice()
            .sort((a, b) => a.dataEvidencia.localeCompare(b.dataEvidencia))
            .map((ev) => (
              <li key={ev.id}>
                <div className="flex flex-wrap items-center gap-2 text-sm mb-1">
                  <strong className="text-zinc-800">
                    {formatarDataPerfil(ev.dataEvidencia)}
                  </strong>
                  <span
                    className={`rounded-full text-xs font-medium px-2 py-0.5 ${classesEstagioPerfil(
                      ev.estagio,
                    )}`}
                  >
                    {rotuloEstagio(ev.estagio)}
                  </span>
                  {ev.partido && (
                    <span className="rounded-full bg-zinc-100 text-zinc-700 text-xs font-medium px-2 py-0.5">
                      {ev.partido}
                    </span>
                  )}
                </div>
                <p className="text-sm text-zinc-700 leading-relaxed mb-1">
                  {ev.descricao}
                </p>
                <p className="text-xs text-zinc-500">
                  Fonte:{' '}
                  <a
                    href={ev.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Abrir fonte "${ev.fonte}" da evidência de ${formatarDataPerfil(
                      ev.dataEvidencia,
                    )} em nova aba`}
                    className="text-blue-600 hover:underline rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    {ev.fonte}
                  </a>
                </p>
              </li>
            ))}
        </ol>
      </section>

      {/* Notícias relacionadas */}
      <section
        aria-labelledby="titulo-noticias"
        className="rounded-xl border border-zinc-200 bg-white p-6 mb-8"
      >
        <h2
          id="titulo-noticias"
          className="text-lg font-semibold text-zinc-900 mb-3"
        >
          Notícias relacionadas
        </h2>
        <p className="text-sm text-zinc-500 leading-relaxed mb-4">
          Apenas matérias da base validada (P1) explicitamente associadas a
          esta pessoa em cenario-eleitoral.ts. Quando a lista está vazia, o
          motivo é ausência de vínculo direto na fonte — não ausência de
          cobertura.
        </p>
        {perfil.noticias.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-4">
            <p className="text-sm text-zinc-500 leading-relaxed">
              Nenhuma notícia da base validada está explicitamente
              associada a esta pessoa no momento. A ausência aqui não
              significa ausência de cobertura jornalística — apenas que
              nenhuma matéria foi marcada como relacionada na coleta
              atual.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {perfil.noticias.map((n) => (
              <li
                key={n.id}
                className="rounded-lg border border-zinc-200 bg-zinc-50 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
                  <h3 className="font-semibold text-zinc-900 text-sm">
                    {n.titulo}
                  </h3>
                  <span className="text-xs text-zinc-400 whitespace-nowrap">
                    {formatarDataPerfil(n.publicadaEm)}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 mb-2">
                  Fonte:{' '}
                  <a
                    href={n.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Abrir notícia "${n.titulo}" de ${n.fonte} em nova aba`}
                    className="text-blue-600 hover:underline rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    {n.fonte}
                  </a>
                </p>
                <p className="text-sm text-zinc-600 leading-relaxed">
                  {n.resumo}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Links oficiais confirmados */}
      <section
        aria-labelledby="titulo-links"
        className="rounded-xl border border-zinc-200 bg-white p-6 mb-8"
      >
        <h2
          id="titulo-links"
          className="text-lg font-semibold text-zinc-900 mb-3"
        >
          Links oficiais
        </h2>
        <p className="text-sm text-zinc-500 leading-relaxed mb-4">
          Apenas links confirmados em fonte institucional. Sem hotlink de
          imprensa sem licença. Quando a lista está vazia, o motivo é
          ausência de fonte oficial que publique o link.
        </p>
        {perfil.linksOficiais.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-4">
            <p className="text-sm text-zinc-500 leading-relaxed">
              Nenhum link oficial confirmado para esta pessoa no momento.
              Links de imprensa exigem licença explícita de reutilização
              conforme o brief; o endereço correto do site/perfil é
              acrescentado quando uma fonte oficial é localizada.
            </p>
          </div>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {perfil.linksOficiais.map((l, i) => (
              <li key={`${l.url}-${i}`}>
                <a
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Abrir ${l.rotulo} de ${perfil.identidade.nome} (fonte: ${l.fonte}) em nova aba`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-medium px-3 py-1 hover:bg-blue-100 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  {l.rotulo}
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Navegação */}
      <nav
        aria-label="Navegação entre perfis eleitorais"
        className="mt-8 flex items-center justify-between gap-4 border-t border-zinc-200 pt-6"
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
      </nav>
    </div>
  );
}
