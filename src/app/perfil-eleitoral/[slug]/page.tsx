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
  type ItemTimeline,
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

      {/* Timeline cronológica unificada — evidências e notícias */}
      <section
        aria-labelledby="titulo-timeline"
        className="rounded-xl border border-zinc-200 bg-white p-6 mb-8"
      >
        <h2
          id="titulo-timeline"
          className="text-lg font-semibold text-zinc-900 mb-3"
        >
          Timeline de evidências e notícias
        </h2>
        <p className="text-sm text-zinc-500 leading-relaxed mb-4">
          Sequência cronológica que combina evidências eleitorais e notícias
          relacionadas. Cada item exibe as três datas do schema —{' '}
          <code className="text-xs bg-zinc-100 px-1 py-0.5 rounded">publicadaEm</code>,{' '}
          <code className="text-xs bg-zinc-100 px-1 py-0.5 rounded">coletadaEm</code>{' '}
          e{' '}
          <code className="text-xs bg-zinc-100 px-1 py-0.5 rounded">verificadaEm</code>{' '}
          — além de cargo, estágio, fonte e URL específica. A ordem cronológica
          preserva mudança de estágio, partido ou cargo sem apagar o registro
          anterior.
        </p>
        {perfil.timeline.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-4">
            <p className="text-sm text-zinc-500 leading-relaxed">
              Nenhuma evidência ou notícia associada a esta pessoa no momento.
              A ausência aqui é um estado honesto — não significa ausência de
              cobertura jornalística.
            </p>
          </div>
        ) : (
          <ol className="space-y-5 list-none pl-0">
            {perfil.timeline.map((item: ItemTimeline) => (
              <li
                key={`${item.tipo}-${item.id}`}
                className="rounded-lg border border-zinc-200 bg-zinc-50 p-4"
              >
                <div className="flex flex-wrap items-center gap-2 text-sm mb-1">
                  <span
                    className={`rounded-full text-xs font-medium px-2 py-0.5 ${
                      item.tipo === 'evidencia'
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {item.tipo === 'evidencia' ? 'Evidência' : 'Notícia'}
                  </span>
                  <strong className="text-zinc-800">
                    {formatarDataPerfil(item.dataOrdenacao)}
                  </strong>
                  {item.estagio && (
                    <span
                      className={`rounded-full text-xs font-medium px-2 py-0.5 ${classesEstagioPerfil(
                        item.estagio,
                      )}`}
                    >
                      {rotuloEstagio(item.estagio)}
                    </span>
                  )}
                  {item.cargo && (
                    <span className="rounded-full bg-blue-100 text-blue-700 text-xs font-medium px-2 py-0.5">
                      {rotuloCargo(item.cargo)}
                    </span>
                  )}
                  {item.partido && (
                    <span className="rounded-full bg-zinc-200 text-zinc-700 text-xs font-medium px-2 py-0.5">
                      {item.partido}
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-zinc-900 text-sm mb-1">
                  {item.tipo === 'noticia' ? item.titulo : null}
                </h3>
                <p className="text-sm text-zinc-700 leading-relaxed mb-2">
                  {item.descricao}
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500 mb-1">
                  <span>
                    <span className="text-zinc-600">Fonte:</span>{' '}
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Abrir fonte "${item.fonte}" em nova aba`}
                      className="text-blue-600 hover:underline rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    >
                      {item.fonte}
                    </a>
                    <span className="ml-1">({rotuloFonteCategoria(item.fonteCategoria)})</span>
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-400">
                  {item.publicadaEm && (
                    <span>
                      Publicada: {formatarDataPerfil(item.publicadaEm)}
                    </span>
                  )}
                  {item.coletadaEm && (
                    <span>
                      Coletada: {formatarDataPerfil(item.coletadaEm)}
                    </span>
                  )}
                  {item.verificadaEm && (
                    <span>
                      Verificada: {formatarDataPerfil(item.verificadaEm)}
                    </span>
                  )}
                  {!item.coletadaEm && !item.verificadaEm && (
                    <span>
                      Datas de coleta e verificação não disponíveis para
                      notícias.
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ol>
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
