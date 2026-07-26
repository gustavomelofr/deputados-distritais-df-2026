// Navegação principal acessível e responsiva.
// Em telas pequenas usa <details>/<summary> nativo (sem JS) como menu disclosure;
// em telas grandes mostra os links inline. Inclui aria-current quando aplicável
// e foco visível consistente.

export interface NavItem {
  href: string;
  label: string;
  ariaLabel: string;
}

export const navItems: NavItem[] = [
  {
    href: '/deputados-distritais',
    label: 'Deputados',
    ariaLabel:
      'Lista dos 24 deputados distritais do DF com perfil, proposições e gastos',
  },
  {
    href: '/comparar',
    ariaLabel:
      'Comparar deputados distritais lado a lado com indicadores de fonte clara',
    label: 'Comparar',
  },
  {
    href: '/atividade-legislativa',
    ariaLabel:
      'Atividade legislativa da CLDF: proposições por tipo, status e deputado autor',
    label: 'Atividade',
  },
  {
    href: '/analise',
    ariaLabel:
      'Análise descritiva de temas e volume das fontes monitoradas',
    label: 'Análise',
  },
  {
    href: '/noticias',
    ariaLabel: 'Feed de notícias sobre a CLDF e os deputados distritais',
    label: 'Notícias',
  },
  {
    href: '/atualizacoes',
    ariaLabel:
      'Feed unificado de atualizações monitoradas: notícias, proposições e atividade pública',
    label: 'Atualizações',
  },
  {
    href: '/cenario-2026',
    ariaLabel:
      'Cenário eleitoral 2026: pré-candidaturas e movimentações para o Distrito Federal',
    label: 'Cenário 2026',
  },
  {
    href: '/monitor-instagram',
    ariaLabel:
      'Radar Instagram dos deputados distritais: posts e atividade nas redes sociais',
    label: 'Instagram',
  },
  {
    href: '/metodologia',
    ariaLabel: 'Metodologia, fontes de dados e critérios de coleta',
    label: 'Metodologia',
  },
];

// Classes de foco visível compartilhadas por todos os links de navegação.
const focusRing =
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded';

export function SiteNav() {
  return (
    <nav aria-label="Navegação principal" className="flex items-center">
      {/* Navegação inline — telas médias e grandes (sm:). */}
      <ul className="hidden sm:flex items-center gap-x-5 lg:gap-x-6 text-sm font-medium text-zinc-600">
        {navItems.map((item) => (
          <li key={item.href}>
            <a
              href={item.href}
              aria-label={item.ariaLabel}
              className={`hover:text-zinc-900 transition ${focusRing}`}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>

      {/* Menu disclosure — telas pequenas (<sm). Usa <details> nativo, sem JS. */}
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
        {/* Fecha o menu ao clicar um link: o <details> perde o estado open
            quando o foco sai via navegação para outra página (navegação
            full-page). O backdrop clica-fora também fecha. */}
        <ul
          className="absolute right-0 z-40 mt-2 w-64 max-w-[calc(100vw-2rem)] rounded-xl border border-zinc-200 bg-white p-2 shadow-lg shadow-zinc-900/5"
          role="menu"
          aria-label="Itens de navegação"
        >
          {navItems.map((item) => (
            <li key={item.href} role="none">
              <a
                href={item.href}
                role="menuitem"
                aria-label={item.ariaLabel}
                className={`block rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-blue-50 hover:text-blue-700 transition ${focusRing}`}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </details>
    </nav>
  );
}
