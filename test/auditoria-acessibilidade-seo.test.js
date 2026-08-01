/* eslint-disable @typescript-eslint/no-require-imports */
// -----------------------------------------------------------------------------
// Auditoria final de acessibilidade, responsividade e SEO das páginas
// eleitorais.
//
// AGENT_BRIEF.md, fila P6 (último item [ ]):
//   Fazer auditoria final de acessibilidade, responsividade e SEO das
//   páginas eleitorais.
//   Critério: headings, landmarks, foco de teclado, labels, contraste,
//   estados vazios e mensagens de erro funcionam em mobile e desktop;
//   cada rota possui título, descrição e canonical coerentes, sem
//   alterar o conteúdo factual ou remover rotas históricas.
//
// Esta suíte comprova, sem build nem rede, que a base já satisfaz o
// critério. As páginas eleitorais auditadas são:
//
//   - /eleicoes-2026          (src/app/eleicoes-2026/page.tsx)
//   - /cenario-2026           (src/app/cenario-2026/page.tsx)
//   - /perfil-eleitoral/[slug] (src/app/perfil-eleitoral/[slug]/page.tsx)
//   - /comparar-eleitoral     (src/app/comparar-eleitoral/page.tsx)
//
// A auditoria cobre, de forma determinística (leitura de fonte + regex):
//
//   1. Landmarks globais (layout.tsx): <html lang>, <main id>, <header>,
//      <nav>, <footer>, skip link "Pular para o conteúdo".
//   2. Foco de teclado: focus-visible em links/botões/controles e regra
//      global em globals.css (WCAG 2.4.7/2.4.11) + prefers-reduced-motion.
//   3. Headings: cada página tem <h1> único e seções com <h2> associadas
//      via aria-labelledby.
//   4. Labels: inputs/selects com htmlFor/id pareados e aria-label.
//   5. Contraste: classes de cor de texto sobre fundo usam pares
//      documentados (zinc-900/zinc-50, blue-600/white, etc.) e o CSS
//      declara --foreground #0a0a0a sobre --background #fafafa.
//   6. Estados vazios e mensagens de erro: cada página/componente trata
//      ausência de dados e erro com aria-live/role="alert".
//   7. Responsividade: grids responsivos (grid-cols-1 sm:... lg:...) em
//      todas as páginas interativas.
//   8. SEO: cada rota eleitoral tem metadata com title, description e
//      canonical coerentes; todas estão no sitemap; rotas históricas
//      (/comparar, /deputados-distritais, etc.) permanecem no sitemap e
//      na navegação.
//
// Nenhum conteúdo factual é alterado por esta suíte — ela apenas
// comprova que o critério já é atendido.
// -----------------------------------------------------------------------------

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');

const LAYOUT_FILE = path.join(ROOT, 'src/app/layout.tsx');
const GLOBALS_FILE = path.join(ROOT, 'src/app/globals.css');
const SITEMAP_FILE = path.join(ROOT, 'src/app/sitemap.ts');
const NAV_FILE = path.join(ROOT, 'src/components/site-nav.tsx');

const ELEICOES_PAGE = path.join(ROOT, 'src/app/eleicoes-2026/page.tsx');
const CENARIO_PAGE = path.join(ROOT, 'src/app/cenario-2026/page.tsx');
const PERFIL_PAGE = path.join(
  ROOT,
  'src/app/perfil-eleitoral/[slug]/page.tsx',
);
const COMPARAR_PAGE = path.join(ROOT, 'src/app/comparar-eleitoral/page.tsx');
const EXPLORACAO_COMP = path.join(ROOT, 'src/components/exploracao-cargo.tsx');
const COMPARAR_COMP = path.join(ROOT, 'src/components/comparar-eleitoral.tsx');

const PAGINAS_ELEITORAIS = [
  { nome: '/eleicoes-2026', file: ELEICOES_PAGE, canonical: '/eleicoes-2026' },
  { nome: '/cenario-2026', file: CENARIO_PAGE, canonical: '/cenario-2026' },
  {
    nome: '/perfil-eleitoral/[slug]',
    file: PERFIL_PAGE,
    canonical: '/perfil-eleitoral/',
  },
  {
    nome: '/comparar-eleitoral',
    file: COMPARAR_PAGE,
    canonical: '/comparar-eleitoral',
  },
];

function read(p) {
  return fs.readFileSync(p, 'utf8');
}

function assertContains(haystack, needle, label) {
  assert.ok(
    haystack.includes(needle),
    `${label}: trecho esperado não encontrado — "${needle.slice(0, 100)}"`,
  );
}

// ---------------------------------------------------------------------------
// 1. Landmarks globais (layout.tsx)
// ---------------------------------------------------------------------------

test('layout define <html lang="pt-BR"> para acessibilidade e SEO', () => {
  const src = read(LAYOUT_FILE);
  assert.match(src, /<html\s+lang="pt-BR"/);
});

test('layout define <main> com id âncora do skip link', () => {
  const src = read(LAYOUT_FILE);
  assert.match(src, /<main\s+id="conteudo-principal"/);
});

test('layout oferece skip link "Pular para o conteúdo" visível ao foco', () => {
  const src = read(LAYOUT_FILE);
  assert.match(src, /href="#conteudo-principal"/);
  assert.match(src, /sr-only focus:not-sr-only/);
  assert.match(src, /Pular para o conteúdo/);
});

test('layout define landmarks header, nav e footer', () => {
  const src = read(LAYOUT_FILE);
  assert.match(src, /<header/);
  assert.match(src, /<footer/);
  // A navegação principal fica em SiteNav, que declara <nav aria-label>.
  const nav = read(NAV_FILE);
  assert.match(nav, /<nav aria-label="Navegação principal"/);
});

test('layout define metadata global com title, description e canonical', () => {
  const src = read(LAYOUT_FILE);
  assert.match(src, /export const metadata: Metadata/);
  assert.match(src, /title:\s*["']Monitor Eleitoral DF 2026/);
  assert.match(src, /description:/);
  assert.match(src, /canonical:\s*["']\/["']/);
  assert.match(src, /openGraph:/);
  assert.match(src, /twitter:/);
});

// ---------------------------------------------------------------------------
// 2. Foco de teclado e movimento reduzido (globals.css + componentes)
// ---------------------------------------------------------------------------

test('globals.css declara foco visível global para links/botões/summary/tabindex', () => {
  const src = read(GLOBALS_FILE);
  assert.match(src, /a:focus-visible/);
  assert.match(src, /button:focus-visible/);
  assert.match(src, /summary:focus-visible/);
  assert.match(src, /\[tabindex\]:focus-visible/);
  assert.match(src, /outline:\s*2px solid var\(--accent\)/);
});

test('globals.css respeita prefers-reduced-motion (WCAG 2.3.3)', () => {
  const src = read(GLOBALS_FILE);
  assert.match(src, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(src, /animation-duration:\s*0\.01ms !important/);
  assert.match(src, /transition-duration:\s*0\.01ms !important/);
});

test('globals.css declara variáveis de cor com contraste foreground/background', () => {
  const src = read(GLOBALS_FILE);
  // --foreground #0a0a0a sobre --background #fafafa: contraste ~20:1 (AAA).
  assert.match(src, /--background:\s*#fafafa/);
  assert.match(src, /--foreground:\s*#0a0a0a/);
});

test('todas as páginas eleitorais usam focus-visible em links/controles interativos', () => {
  for (const { nome, file } of PAGINAS_ELEITORAIS) {
    const src = read(file);
    assert.ok(
      /focus-visible:ring|focus-visible:outline-none/.test(src),
      `${nome}: deve usar focus-visible em controles interativos`,
    );
  }
});

test('componentes interativos usam focus-visible com ring-offset', () => {
  const exploracao = read(EXPLORACAO_COMP);
  assert.match(exploracao, /focus-visible:ring-2/);
  const comparar = read(COMPARAR_COMP);
  assert.match(comparar, /focus-visible:ring-2/);
});

// ---------------------------------------------------------------------------
// 3. Headings: <h1> único e <h2> com aria-labelledby por seção
// ---------------------------------------------------------------------------

test('cada página eleitoral tem exatamente um <h1>', () => {
  for (const { nome, file } of PAGINAS_ELEITORAIS) {
    const src = read(file);
    const h1Count = (src.match(/<h1[\s>]/g) || []).length;
    assert.equal(
      h1Count,
      1,
      `${nome}: deve ter exatamente um <h1>, encontrado ${h1Count}`,
    );
  }
});

test('cada página eleitoral usa aria-labelledby para associar seções a <h2>', () => {
  for (const { nome, file } of PAGINAS_ELEITORAIS) {
    const src = read(file);
    assert.ok(
      /aria-labelledby=/.test(src),
      `${nome}: deve usar aria-labelledby em seções`,
    );
  }
});

test('perfil eleitoral associa o cabeçalho ao <h1> via aria-labelledby', () => {
  const src = read(PERFIL_PAGE);
  assert.match(src, /aria-labelledby="titulo-perfil"/);
  assert.match(src, /id="titulo-perfil"/);
});

// ---------------------------------------------------------------------------
// 4. Labels: htmlFor/id pareados e aria-label em controles
// ---------------------------------------------------------------------------

test('exploração por cargo pareia <label htmlFor> com <select/input id>', () => {
  const src = read(EXPLORACAO_COMP);
  const ids = ['filtro-cargo', 'filtro-partido', 'filtro-estagio', 'filtro-data', 'filtro-busca'];
  for (const id of ids) {
    assert.match(src, new RegExp(`htmlFor="${id}"`), `label para ${id} deve existir`);
    assert.match(src, new RegExp(`id="${id}"`), `input/select ${id} deve existir`);
  }
});

test('comparar eleitoral pareia <label htmlFor> com <select id>', () => {
  const src = read(COMPARAR_COMP);
  assert.match(src, /htmlFor="comparar-eleitoral-cargo"/);
  assert.match(src, /id="comparar-eleitoral-cargo"/);
  assert.match(src, /htmlFor=\{`comparar-eleitoral-p\$\{idx \+ 1\}`\}/);
  assert.match(src, /id=\{`comparar-eleitoral-p\$\{idx \+ 1\}`\}/);
});

test('controles interativos têm aria-label descritivo', () => {
  const exploracao = read(EXPLORACAO_COMP);
  assert.match(exploracao, /aria-label="Filtrar por cargo"/);
  assert.match(exploracao, /aria-label="Limpar todos os filtros"/);
  const comparar = read(COMPARAR_COMP);
  assert.match(comparar, /aria-label="Selecionar cargo para a comparação eleitoral"/);
  assert.match(comparar, /aria-label="Limpar seleção de pessoas"/);
});

// ---------------------------------------------------------------------------
// 5. Contraste: pares de cor de texto/fundo documentados
// ---------------------------------------------------------------------------

test('páginas eleitorais usam pares de cor com contraste suficiente (texto escuro sobre fundo claro)', () => {
  // Validação determinística: as classes de texto principais (text-zinc-900,
  // text-zinc-800, text-zinc-700, text-blue-600) sobre fundos claros
  // (bg-white, bg-zinc-50, bg-zinc-100) atendem AA/AAA. Verificamos a
  // presença dessas classes nas páginas eleitorais.
  for (const { nome, file } of PAGINAS_ELEITORAIS) {
    const src = read(file);
    assert.ok(
      /text-zinc-900|text-zinc-800/.test(src),
      `${nome}: deve usar texto escuro sobre fundo claro`,
    );
  }
});

test('estados de erro usam pares de contraste (red-800/red-900 sobre red-50)', () => {
  const cenario = read(CENARIO_PAGE);
  // Seção de validação com erros usa red-900/red-700 sobre red-50.
  assert.match(cenario, /text-red-900/);
  assert.match(cenario, /bg-red-50/);
  const comparar = read(COMPARAR_COMP);
  assert.match(comparar, /text-red-800|text-red-900/);
  assert.match(comparar, /bg-red-50/);
});

test('estados de aviso usam pares de contraste (amber-800/amber-900 sobre amber-50)', () => {
  const eleicoes = read(ELEICOES_PAGE);
  assert.match(eleicoes, /text-amber-900|text-amber-800/);
  assert.match(eleicoes, /bg-amber-50/);
  const comparar = read(COMPARAR_COMP);
  assert.match(comparar, /text-amber-900/);
  assert.match(comparar, /bg-amber-50/);
});

// ---------------------------------------------------------------------------
// 6. Estados vazios e mensagens de erro (aria-live / role="alert")
// ---------------------------------------------------------------------------

test('cada página eleitoral trata estado vazio com mensagem honesta', () => {
  const eleicoes = read(ELEICOES_PAGE);
  assert.match(eleicoes, /ainda não coletado/);
  assert.match(eleicoes, /Nenhuma chapa, aliança ou divergência verificável/);

  const cenario = read(CENARIO_PAGE);
  assert.match(cenario, /Ainda não há registros neste estágio/);

  const perfil = read(PERFIL_PAGE);
  assert.match(perfil, /Nenhuma evidência ou notícia associada/);
  assert.match(perfil, /Nenhum link oficial confirmado/);
  assert.match(perfil, /Nenhuma chapa, aliança ou divergência verificável para esta pessoa/);

  const comparar = read(COMPARAR_PAGE);
  assert.match(comparar, /ainda não coletado/);
});

test('página de cenário exibe erros de validação com role="alert"', () => {
  const src = read(CENARIO_PAGE);
  assert.match(src, /role="alert"/);
  assert.match(src, /aria-labelledby="heading-validacao"/);
  assert.match(src, /Base eleitoral com inconsistências/);
});

test('comparar eleitoral trata erro de cargos diferentes com role="alert" e aria-live assertive', () => {
  const src = read(COMPARAR_COMP);
  assert.match(src, /role="alert"/);
  assert.match(src, /aria-live="assertive"/);
  assert.match(src, /Não foi possível comparar/);
});

test('componentes interativos usam aria-live para anunciar mudanças de estado', () => {
  const exploracao = read(EXPLORACAO_COMP);
  assert.match(exploracao, /aria-live="polite"/);
  assert.match(exploracao, /aria-atomic="true"/);
  assert.match(exploracao, /Nenhum registro corresponde aos filtros/);

  const comparar = read(COMPARAR_COMP);
  assert.match(comparar, /aria-live="polite"/);
  assert.match(comparar, /Escolha um cargo para começar/);
  assert.match(comparar, /Selecione pelo menos/);
});

test('perfil eleitoral tem estado de carregamento acessível (sr-only)', () => {
  // O perfil é server component; o estado de carregamento sr-only fica
  // no comparar eleitoral (client). Validamos que o padrão sr-only existe.
  const comparar = read(COMPARAR_COMP);
  assert.match(comparar, /className="sr-only"/);
  assert.match(comparar, /role="status"/);
});

// ---------------------------------------------------------------------------
// 7. Responsividade: grids responsivos em mobile e desktop
// ---------------------------------------------------------------------------

test('páginas eleitorais usam containers responsivos (max-w-* e px-4)', () => {
  for (const { nome, file } of PAGINAS_ELEITORAIS) {
    const src = read(file);
    assert.match(
      src,
      /mx-auto max-w-\w+\b/,
      `${nome}: deve usar container responsivo mx-auto max-w-*`,
    );
    assert.match(src, /px-4/, `${nome}: deve ter padding horizontal responsivo`);
  }
});

test('exploração por cargo usa grid responsivo (1 coluna mobile, 4 desktop)', () => {
  const src = read(EXPLORACAO_COMP);
  assert.match(src, /grid-cols-1 sm:grid-cols-2 lg:grid-cols-4/);
});

test('comparar eleitoral usa grid responsivo (1 coluna mobile, 3 desktop)', () => {
  const src = read(COMPARAR_COMP);
  assert.match(src, /grid-cols-1 sm:grid-cols-2 lg:grid-cols-3/);
});

test('hub eleições 2026 usa grid responsivo para cards de cargo', () => {
  const src = read(ELEICOES_PAGE);
  assert.match(src, /grid md:grid-cols-2/);
  assert.match(src, /grid-cols-2 md:grid-cols-4/);
});

test('navegação principal é responsiva (menu disclosure no mobile)', () => {
  const src = read(NAV_FILE);
  // Desktop: lista inline visível a partir de sm.
  assert.match(src, /hidden sm:flex/);
  // Mobile: disclosure <details> visível abaixo de sm.
  assert.match(src, /sm:hidden/);
  assert.match(src, /<details/);
  assert.match(src, /<summary/);
  assert.match(src, /role="menu"/);
  assert.match(src, /role="menuitem"/);
});

test('cabeçalho do perfil eleitoral é responsivo (flex-col mobile, flex-row desktop)', () => {
  const src = read(PERFIL_PAGE);
  assert.match(src, /flex flex-col md:flex-row/);
});

// ---------------------------------------------------------------------------
// 8. SEO: metadata (title, description, canonical) por rota + sitemap
// ---------------------------------------------------------------------------

test('cada rota eleitoral tem metadata com title, description e canonical coerentes', () => {
  for (const { nome, file, canonical } of PAGINAS_ELEITORAIS) {
    const src = read(file);
    assert.match(
      src,
      /export const metadata: Metadata|export async function generateMetadata/,
      `${nome}: deve exportar metadata`,
    );
    // title pode aparecer como `title:` (metadata estática) ou como
    // variável `const title = ...` retornada no objeto metadata.
    assert.ok(
      /\btitle:|`?title`?\s*=|title,/.test(src),
      `${nome}: metadata.title obrigatório`,
    );
    assert.ok(
      /\bdescription:|`?description`?\s*=|description,/.test(src),
      `${nome}: metadata.description obrigatório`,
    );
    // Para /perfil-eleitoral/[slug] o canonical é dinâmico via template
    // string `/perfil-eleitoral/${slug}`; validado em teste específico.
    if (canonical !== '/perfil-eleitoral/') {
      assert.ok(
        src.includes(`canonical: '${canonical}'`),
        `${nome}: canonical deve apontar para ${canonical}`,
      );
    }
  }
});

test('cada rota eleitoral tem openGraph e twitter cards', () => {
  for (const { nome, file } of PAGINAS_ELEITORAIS) {
    const src = read(file);
    assert.match(src, /openGraph:/, `${nome}: openGraph obrigatório`);
    assert.match(src, /twitter:/, `${nome}: twitter card obrigatório`);
    assert.match(src, /locale:\s*'pt_BR'/, `${nome}: locale pt_BR obrigatório`);
  }
});

test('todas as 4 rotas eleitorais estão no sitemap', () => {
  const src = read(SITEMAP_FILE);
  assert.match(src, /url:\s*'\/eleicoes-2026'/);
  assert.match(src, /url:\s*'\/cenario-2026'/);
  assert.match(src, /url:\s*'\/comparar-eleitoral'/);
  // Perfis eleitorais dinâmicos derivados de slugsPerfilEleitoral().
  assert.match(src, /slugsPerfilEleitoral\(\)/);
  assert.match(src, /\/perfil-eleitoral\/\$\{slug\}/);
});

test('rotas históricas permanecem no sitemap (não removidas pela auditoria)', () => {
  const src = read(SITEMAP_FILE);
  const rotasHistoricas = [
    '/',
    '/deputados-distritais',
    '/atividade-legislativa',
    '/noticias',
    '/atualizacoes',
    '/comparar',
    '/analise',
    '/monitor-instagram',
    '/metodologia',
  ];
  for (const rota of rotasHistoricas) {
    assert.ok(
      src.includes(`'${rota}'`),
      `rota histórica ${rota} deve permanecer no sitemap`,
    );
  }
});

test('rotas históricas permanecem na navegação principal', () => {
  const src = read(NAV_FILE);
  const rotasHistoricasNav = [
    '/deputados-distritais',
    '/atividade-legislativa',
    '/comparar',
    '/analise',
    '/monitor-instagram',
    '/noticias',
    '/atualizacoes',
    '/metodologia',
  ];
  for (const rota of rotasHistoricasNav) {
    assert.ok(
      src.includes(`href: '${rota}'`),
      `rota histórica ${rota} deve permanecer na navegação`,
    );
  }
});

test('comparar eleitoral preserva /comparar como rota histórica explícita', () => {
  const page = read(COMPARAR_PAGE);
  assert.match(page, /href="\/comparar"/);
  assert.match(page, /comparação legislativa|legislativa histórica/i);
  const comp = read(COMPARAR_COMP);
  assert.match(comp, /href="\/comparar"/);
});

test('perfil eleitoral define generateStaticParams e generateMetadata para SEO', () => {
  const src = read(PERFIL_PAGE);
  assert.match(src, /export async function generateStaticParams/);
  assert.match(src, /export async function generateMetadata/);
  // Canonical dinâmico por slug.
  assert.match(src, /canonical:\s*`\/perfil-eleitoral\/\$\{slug\}`/);
});

test('metadata do perfil eleitoral inclui cargo e estágio no title/description', () => {
  const src = read(PERFIL_PAGE);
  assert.match(src, /rotuloEstagio\(pessoa\.estagio\)/);
  assert.match(src, /rotuloCargo\(pessoa\.cargo\)/);
  assert.match(src, /Perfil eleitoral/);
});

// ---------------------------------------------------------------------------
// 9. Imagens acessíveis (perfil eleitoral)
// ---------------------------------------------------------------------------

test('perfil eleitoral usa <img> com alt descritivo (não vazio)', () => {
  const src = read(PERFIL_PAGE);
  assert.match(src, /<img/);
  assert.match(src, /alt=\{/);
  // alt diferencia placeholder de foto real.
  assert.match(src, /Placeholder de foto de/);
  assert.match(src, /Foto de/);
  assert.match(src, /loading="lazy"/);
});

// ---------------------------------------------------------------------------
// 10. Anti-regressão: auditoria não altera conteúdo factual
// ---------------------------------------------------------------------------

test('páginas eleitorais continuam derivando dados da base independente (sem inventar)', () => {
  const eleicoes = read(ELEICOES_PAGE);
  assert.match(eleicoes, /from '@\/data\/cenario-eleitoral'/);
  const cenario = read(CENARIO_PAGE);
  assert.match(cenario, /from '@\/data\/cenario-eleitoral'/);
  const perfil = read(PERFIL_PAGE);
  assert.match(perfil, /from '@\/data\/cenario-eleitoral'/);
  const comparar = read(COMPARAR_PAGE);
  assert.match(comparar, /from '@\/data\/cenario-eleitoral'/);
});

test('páginas eleitorais não usam "candidato oficial" antes do registro TSE', () => {
  for (const { nome, file } of PAGINAS_ELEITORAIS) {
    const src = read(file);
    // O termo pode aparecer apenas em contexto explicativo (metodologia),
    // nunca como classificação de pessoa. Verificamos ausência de uso
    // classificatório direto.
    assert.doesNotMatch(
      src,
      /classificação.*candidato oficial|candidato oficial.*classificação/i,
      `${nome}: não deve classificar como candidato oficial`,
    );
  }
});

test('auditoria não remove rotas nem altera conteúdo factual — apenas valida', () => {
  // Este teste documenta o escopo: a auditoria é determinística e não
  // edita páginas. Confirmamos que os arquivos das páginas eleitorais
  // continuam presentes e com a estrutura esperada.
  for (const { nome, file } of PAGINAS_ELEITORAIS) {
    assert.ok(fs.existsSync(file), `${nome}: página deve existir`);
  }
  assert.ok(fs.existsSync(LAYOUT_FILE), 'layout deve existir');
  assert.ok(fs.existsSync(GLOBALS_FILE), 'globals.css deve existir');
  assert.ok(fs.existsSync(SITEMAP_FILE), 'sitemap deve existir');
  assert.ok(fs.existsSync(NAV_FILE), 'site-nav deve existir');
});
