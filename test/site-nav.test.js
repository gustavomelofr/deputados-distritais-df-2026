/* eslint-disable @typescript-eslint/no-require-imports */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const NAV_FILE = path.join(ROOT, 'src/components/site-nav.tsx');

function read(p) {
  return fs.readFileSync(p, 'utf8');
}

test('arquivo site-nav.tsx existe e é client component', () => {
  const src = read(NAV_FILE);
  assert.match(src, /^\s*'use client'/m, 'deve declarar "use client" no topo');
  assert.match(src, /import \{ usePathname \} from 'next\/navigation'/);
});

test('declara 3 grupos editoriais na ordem: eleicoes, cldf, geral', () => {
  const src = read(NAV_FILE);
  // Cada grupo é um objeto com `id`, `label` e `ariaLabel`.
  const expectedGroups = [
    { id: 'eleicoes', label: 'Eleições 2026' },
    { id: 'cldf', label: 'Câmara Legislativa do DF' },
    { id: 'geral', label: 'Geral' },
  ];
  for (const g of expectedGroups) {
    assert.ok(
      src.includes(`id: '${g.id}'`),
      `grupo '${g.id}' deve aparecer na NAV_GROUPS`
    );
    assert.ok(
      src.includes(`label: '${g.label}'`),
      `rótulo '${g.label}' deve aparecer na NAV_GROUPS`
    );
  }
  // Ordem: eleicoes vem antes de cldf, cldf antes de geral.
  const idxEleicoes = src.indexOf("id: 'eleicoes'");
  const idxCldf = src.indexOf("id: 'cldf'");
  const idxGeral = src.indexOf("id: 'geral'");
  assert.ok(idxEleicoes > -1 && idxCldf > -1 && idxGeral > -1);
  assert.ok(idxEleicoes < idxCldf, 'eleicoes deve vir antes de cldf');
  assert.ok(idxCldf < idxGeral, 'cldf deve vir antes de geral');
});

test('cada item de navegação declara seu grupo editorial', () => {
  const src = read(NAV_FILE);
  // Cada objeto em navItems deve ter `group: '<id>'`.
  for (const g of ['eleicoes', 'cldf', 'geral']) {
    const re = new RegExp(`group:\\s*'${g}'`, 'g');
    const matches = src.match(re) || [];
    assert.ok(
      matches.length >= 1,
      `esperado >=1 item com group: '${g}', encontrado ${matches.length}`
    );
  }
});

test('nenhuma rota foi removida: 10 hrefs distintos preservados', () => {
  const src = read(NAV_FILE);
  const expectedHrefs = [
    '/deputados-distritais',
    '/comparar',
    '/atividade-legislativa',
    '/analise',
    '/noticias',
    '/atualizacoes',
    '/cenario-2026',
    '/eleicoes-2026',
    '/monitor-instagram',
    '/metodologia',
  ];
  for (const href of expectedHrefs) {
    assert.ok(
      src.includes(`href: '${href}'`),
      `rota '${href}' deve permanecer na navegação`
    );
  }
  // Sitemap deve continuar declarando todas essas rotas também.
  const sitemap = fs.readFileSync(
    path.join(ROOT, 'src/app/sitemap.ts'),
    'utf8'
  );
  for (const href of expectedHrefs) {
    assert.ok(
      sitemap.includes(`url: '${href}'`),
      `rota '${href}' deve continuar no sitemap`
    );
  }
});

test('hierarquia: rotas da atividade legislativa histórica permanecem acessíveis', () => {
  const src = read(NAV_FILE);
  // Critério: "sem remover acesso à atividade legislativa histórica".
  // As 5 rotas históricas da CLDF continuam no array navItems e são
  // agrupadas em 'cldf' (não foram escondidas nem removidas).
  const rotasHistoricas = [
    '/deputados-distritais',
    '/comparar',
    '/atividade-legislativa',
    '/analise',
    '/monitor-instagram',
  ];
  for (const rota of rotasHistoricas) {
    assert.ok(
      src.includes(`href: '${rota}'`),
      `rota histórica '${rota}' deve permanecer em navItems`
    );
  }
});

test('ordem dos itens dentro de cada grupo preserva o foco editorial primeiro', () => {
  const src = read(NAV_FILE);
  // Em navItems, /eleicoes-2026 deve ser o primeiro href declarado
  // (foco principal do monitor) e o grupo eleicoes contém apenas ele
  // e /cenario-2026, nesta ordem.
  const idxEleicoes2026 = src.indexOf("href: '/eleicoes-2026'");
  const idxCenario2026 = src.indexOf("href: '/cenario-2026'");
  const idxDeputados = src.indexOf("href: '/deputados-distritais'");
  assert.ok(idxEleicoes2026 > -1 && idxCenario2026 > -1 && idxDeputados > -1);
  assert.ok(
    idxEleicoes2026 < idxCenario2026,
    '/eleicoes-2026 deve vir antes de /cenario-2026'
  );
  assert.ok(
    idxCenario2026 < idxDeputados,
    '/cenario-2026 deve vir antes de /deputados-distritais (entrada do grupo cldf)'
  );
});

test('desktop: cada grupo é renderizado em um <li> com aria-label', () => {
  const src = read(NAV_FILE);
  // No nav desktop (ul.hidden sm:flex), o componente itera NAV_GROUPS com
  // .map() e gera um <li> com aria-label=grupo.ariaLabel por grupo. Em
  // runtime isso produz 3 <li>; no código fonte a expressão aparece
  // uma única vez dentro do callback do map, mas é aplicada a cada
  // elemento do array NAV_GROUPS (3 grupos). Verificamos a estrutura
  // iterativa, não a contagem literal.
  const desktopMatch = src.match(
    /<ul\s+className=\{`hidden sm:flex[\s\S]*?<\/ul>/
  );
  assert.ok(
    desktopMatch,
    'bloco <ul> desktop deve estar presente na navegação'
  );
  const desktop = desktopMatch[0];
  // 3 grupos em NAV_GROUPS + iterador map = renderização de 3 <li>.
  assert.match(
    desktop,
    /NAV_GROUPS\.map\(\(grupo,\s*grupoIdx\)\s*=>\s*\(\s*<li[^>]*aria-label=\{grupo\.ariaLabel\}/
  );
  // Divisor visual entre grupos (span com aria-hidden + classe de divider).
  assert.match(
    desktop,
    /aria-hidden="true"[\s\S]*?inlineGroupDivider/
  );
});

test('mobile (menu disclosure): cada grupo renderiza <h2> visível como cabeçalho', () => {
  const src = read(NAV_FILE);
  // O menu <details> itera NAV_GROUPS e renderiza um <h2> por grupo com
  // o label visível. Verificamos a estrutura iterativa (NAV_GROUPS.map
  // com <h2>{grupo.label}</h2>) e a presença das classes de cabeçalho.
  assert.match(
    src,
    /NAV_GROUPS\.map\(\(grupo,\s*grupoIdx\)\s*=>\s*\([\s\S]*?<h2[\s\S]*?\{grupo\.label\}/
  );
  // Classes de cabeçalho do grupo (uma para o primeiro grupo, outra para
  // os seguintes) devem aparecer no menu disclosure.
  assert.match(src, /mobileGroupHeaderFirst/);
  assert.match(src, /mobileGroupHeader/);
});

test('acessibilidade: foco visível e aria-current preservados nos links', () => {
  const src = read(NAV_FILE);
  // focusRing continua aplicado nos links (desktop e mobile).
  assert.match(src, /focus-visible:ring-blue-500/);
  // aria-current derivado de isAtivo continua presente nos dois blocos.
  const ariaCurrents = src.match(/aria-current=\{ativo \? 'page' : undefined\}/g) || [];
  assert.ok(
    ariaCurrents.length >= 2,
    `esperado >=2 aria-current (desktop + mobile), encontrado ${ariaCurrents.length}`
  );
  // Menu mobile mantém role="menu" + role="menuitem" para tecnologia
  // assistiva.
  assert.match(src, /role="menu"/);
  assert.match(src, /role="menuitem"/);
});

test('helper grupoDoItem resolve href para o grupo editorial correto', () => {
  const src = read(NAV_FILE);
  // O helper existe, é exportado e faz lookup em navItems.
  assert.match(src, /export function grupoDoItem/);
  assert.match(src, /return navItems\.find\(\(item\) => item\.href === href\)\?\.group/);
});

test('nenhuma rota do grupo histórico foi classificada como eleicoes ou geral', () => {
  const src = read(NAV_FILE);
  // As 5 rotas históricas da CLDF devem estar marcadas como group: 'cldf'.
  // Lemos cada bloco de item e validamos manualmente.
  const historicas = [
    '/deputados-distritais',
    '/atividade-legislativa',
    '/comparar',
    '/analise',
    '/monitor-instagram',
  ];
  for (const rota of historicas) {
    // Encontra o trecho `href: '<rota>'` e captura o group do mesmo objeto.
    const idxHref = src.indexOf(`href: '${rota}'`);
    assert.ok(
      idxHref >= 0,
      `rota '${rota}' deve estar presente em navItems`
    );
    const re = /group:\s*'(cldf|eleicoes|geral)'/;
    const janela = src.substring(idxHref, idxHref + 250);
    const m = janela.match(re);
    assert.ok(
      m,
      `não foi possível extrair o group da rota '${rota}'`
    );
    assert.equal(
      m[1],
      'cldf',
      `rota '${rota}' deve pertencer ao grupo 'cldf', encontrado '${m[1]}'`
    );
  }
});

test('rotas eleitorais estão classificadas como eleicoes', () => {
  const src = read(NAV_FILE);
  for (const rota of ['/eleicoes-2026', '/cenario-2026']) {
    const idxHref = src.indexOf(`href: '${rota}'`);
    assert.ok(idxHref >= 0);
    const re = /group:\s*'(cldf|eleicoes|geral)'/;
    const janela = src.substring(idxHref, idxHref + 250);
    const m = janela.match(re);
    assert.ok(m);
    assert.equal(
      m[1],
      'eleicoes',
      `rota '${rota}' deve pertencer ao grupo 'eleicoes', encontrado '${m[1]}'`
    );
  }
});

test('rotas transversais estão classificadas como geral', () => {
  const src = read(NAV_FILE);
  for (const rota of ['/noticias', '/atualizacoes', '/metodologia']) {
    const idxHref = src.indexOf(`href: '${rota}'`);
    assert.ok(idxHref >= 0);
    const re = /group:\s*'(cldf|eleicoes|geral)'/;
    const janela = src.substring(idxHref, idxHref + 250);
    const m = janela.match(re);
    assert.ok(m);
    assert.equal(
      m[1],
      'geral',
      `rota '${rota}' deve pertencer ao grupo 'geral', encontrado '${m[1]}'`
    );
  }
});

test('cada grupo tem ao menos 1 item (não há grupos vazios)', () => {
  const src = read(NAV_FILE);
  for (const g of ['eleicoes', 'cldf', 'geral']) {
    // Cada id de grupo deve ter pelo menos um item com esse group.
    const itemRe = new RegExp(`group:\\s*'${g}'`, 'g');
    const matches = src.match(itemRe) || [];
    assert.ok(
      matches.length >= 1,
      `grupo '${g}' deve ter >=1 item, encontrado ${matches.length}`
    );
  }
});

test('todos os itens estão associados a exatamente um grupo', () => {
  const src = read(NAV_FILE);
  // Cada NavItem deve ter um único campo group: '<id>'.
  const itemCount = (src.match(/href:\s*'\//g) || []).length;
  const groupCount = (
    src.match(/group:\s*'(eleicoes|cldf|geral)'/g) || []
  ).length;
  assert.equal(
    itemCount,
    groupCount,
    `cada href deve ter exatamente um group: esperado ${itemCount} === ${groupCount}`
  );
  // E o número de itens em navItems deve bater com o número de hrefs
  // total (10).
  assert.equal(itemCount, 10, `esperado 10 hrefs, encontrado ${itemCount}`);
});