// Navegação principal acessível e responsiva.
// Hierarquia editorial em 3 grupos (Eleições 2026 / CLDF histórica / Geral),
// derivada de `NAV_GROUPS` e do campo `group` de cada `navItems`. Nenhuma
// rota é removida — apenas reagrupada para deixar o foco eleitoral claro
// sem esconder a atividade legislativa da CLDF.

'use client';

import { usePathname } from 'next/navigation';

export type NavGroupId =
  | 'eleicoes'
  | 'cldf'
  | 'geral';

export interface NavGroup {
  id: NavGroupId;
  label: string;
  ariaLabel: string;
}

export interface NavItem {
  href: string;
  label: string;
  ariaLabel: string;
  group: NavGroupId;
}

export const NAV_GROUPS: NavGroup[] = [
  {
    id: 'eleicoes',
    label: 'Eleições 2026',
    ariaLabel: 'Cobertura eleitoral de 2026 no DF',
  },
  {
    id: 'cldf',
    label: 'Câmara Legislativa do DF',
    ariaLabel: 'Atividade legislativa histórica da CLDF',
  },
  {
    id: 'geral',
    label: 'Geral',
    ariaLabel: 'Feeds transversais e metodologia',
  },
];

export const navItems: NavItem[] = [
  {
    href: '/eleicoes-2026',
    group: 'eleicoes',
    ariaLabel:
      'Eleições 2026 no DF: hub geral da cobertura com caminhos para governo, Senado, deputado federal e deputado distrital',
    label: 'Eleições 2026',
  },
  {
    href: '/cenario-2026',
    group: 'eleicoes',
    ariaLabel:
      'Cenário eleitoral 2026: pré-candidaturas e movimentações para o Distrito Federal',
    label: 'Cenário 2026',
  },
  {
    href: '/deputados-distritais',
    group: 'cldf',
    label: 'Deputados',
    ariaLabel:
      'Lista dos 24 deputados distritais do DF com perfil, proposições e gastos',
  },
  {
    href: '/atividade-legislativa',
    group: 'cldf',
    ariaLabel:
      'Atividade legislativa da CLDF: proposições por tipo, status e deputado autor',
    label: 'Atividade',
  },
  {
    href: '/comparar',
    group: 'cldf',
    ariaLabel:
      'Comparar deputados distritais lado a lado com indicadores de fonte clara',
    label: 'Comparar',
  },
  {
    href: '/analise',
    group: 'cldf',
    ariaLabel:
      'Análise descritiva de temas e volume das fontes monitoradas',
    label: 'Análise',
  },
  {
    href: '/monitor-instagram',
    group: 'cldf',
    ariaLabel:
      'Radar Instagram dos deputados distritais: posts e atividade nas redes sociais',
    label: 'Instagram',
  },
  {
    href: '/noticias',
    group: 'geral',
    ariaLabel: 'Feed de notícias sobre a CLDF e os deputados distritais',
    label: 'Notícias',
  },
  {
    href: '/atualizacoes',
    group: 'geral',
    ariaLabel:
      'Feed unificado de atualizações monitoradas: notícias, proposições e atividade pública',
    label: 'Atualizações',
  },
  {
    href: '/metodologia',
    group: 'geral',
    ariaLabel: 'Metodologia, fontes de dados e critérios de coleta',
    label: 'Metodologia',
  },
];

const focusRing =
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded';

export function grupoDoItem(href: string): NavGroupId | undefined {
  return navItems.find((item) => item.href === href)?.group;
}

const inlineItemGap = 'gap-x-5 lg:gap-x-6';
const mobileItemGap = 'gap-1';
const inlineGroupDivider = 'mx-2 lg:mx-3 h-4 w-px bg-zinc-200 shrink-0';
const mobileGroupHeader =
  'px-3 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-400';
const mobileGroupHeaderFirst =
  'px-3 pt-1 pb-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-400';

export function SiteNav() {
  const pathname = usePathname();
  const isAtivo = (href: string) =>
    href === pathname ||
    (href !== '/' && pathname.startsWith(href + '/'));

  const itensPorGrupo: Record<NavGroupId, NavItem[]> = NAV_GROUPS.reduce(
    (acc, grupo) => {
      acc[grupo.id] = navItems.filter((item) => item.group === grupo.id);
      return acc;
    },
    { eleicoes: [], cldf: [], geral: [] } as Record<NavGroupId, NavItem[]>
  );

  return (
    <nav aria-label="Navegação principal" className="flex items-center">
      <ul
        className={`hidden sm:flex items-center text-sm font-medium text-zinc-600 ${inlineItemGap}`}
      >
        {NAV_GROUPS.map((grupo, grupoIdx) => (
          <li
            key={grupo.id}
            className={`flex items-center ${inlineItemGap}`}
            aria-label={grupo.ariaLabel}
          >
            {grupoIdx > 0 && (
              <span aria-hidden="true" className={inlineGroupDivider} />
            )}
            {itensPorGrupo[grupo.id].map((item) => {
              const ativo = isAtivo(item.href);
              return (
                <a
                  key={item.href}
                  href={item.href}
                  aria-label={item.ariaLabel}
                  aria-current={ativo ? 'page' : undefined}
                  className={`transition ${focusRing} ${
                    ativo
                      ? 'text-zinc-900 font-semibold'
                      : 'hover:text-zinc-900'
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </li>
        ))}
      </ul>

      <details className="sm:hidden relative">
        <summary
          className="flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white cursor-pointer list-none"
          aria-label="Abrir menu de navegação"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
          <span>Menu</span>
        </summary>
        <div
          className="absolute right-0 z-40 mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-xl border border-zinc-200 bg-white p-2 shadow-lg shadow-zinc-900/5"
          role="menu"
          aria-label="Itens de navegação"
        >
          {NAV_GROUPS.map((grupo, grupoIdx) => (
            <div
              key={grupo.id}
              className={`flex flex-col ${mobileItemGap}`}
              aria-label={grupo.ariaLabel}
            >
              <h2
                className={
                  grupoIdx === 0 ? mobileGroupHeaderFirst : mobileGroupHeader
                }
              >
                {grupo.label}
              </h2>
              {itensPorGrupo[grupo.id].map((item) => {
                const ativo = isAtivo(item.href);
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    role="menuitem"
                    aria-label={item.ariaLabel}
                    aria-current={ativo ? 'page' : undefined}
                    className={`block rounded-lg px-3 py-2 text-sm font-medium transition ${focusRing} ${
                      ativo
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-zinc-700 hover:bg-blue-50 hover:text-blue-700'
                    }`}
                  >
                    {item.label}
                  </a>
                );
              })}
            </div>
          ))}
        </div>
      </details>
    </nav>
  );
}
