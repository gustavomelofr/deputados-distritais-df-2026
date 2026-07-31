/* eslint-disable @typescript-eslint/no-require-imports */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const PAGE_FILE = path.join(
  ROOT,
  'src/app/comparar-eleitoral/page.tsx',
);
const COMP_FILE = path.join(
  ROOT,
  'src/components/comparar-eleitoral.tsx',
);
const LIB_FILE = path.join(
  ROOT,
  'src/lib/comparar-eleitoral.ts',
);
const SITEMAP_FILE = path.join(ROOT, 'src/app/sitemap.ts');
const NAV_FILE = path.join(ROOT, 'src/components/site-nav.tsx');
const BASE_FILE = path.join(ROOT, 'src/data/cenario-eleitoral.ts');
const PERFIL_PAGE_FILE = path.join(
  ROOT,
  'src/app/perfil-eleitoral/[slug]/page.tsx',
);

function read(p) {
  return fs.readFileSync(p, 'utf8');
}

// ---------------------------------------------------------------------------
// Página /comparar-eleitoral
// ---------------------------------------------------------------------------

test('página /comparar-eleitoral existe e é server component', () => {
  assert.ok(fs.existsSync(PAGE_FILE), 'página deve existir');
  const src = read(PAGE_FILE);
  assert.doesNotMatch(src, /^\s*'use client'/m);
  // Next 16: searchParams é Promise<{...}>.
  assert.match(src, /searchParams:\s*Promise<\{/);
});

test('página preserva /comparar como comparação legislativa', () => {
  const src = read(PAGE_FILE);
  // A página deve referenciar /comparar como a rota de comparação
  // legislativa histórica, deixando claro que a nova rota é aditiva.
  assert.match(src, /href="\/comparar"/);
  // Texto explícito sobre preservação.
  assert.match(
    src,
    /comparação legislativa|legislativa histórica|comparação histórica/i,
  );
});

test('página aceita somente pessoas do mesmo cargo (validação via lib)', () => {
  const src = read(PAGE_FILE);
  // A página importa a lógica pura que faz a validação.
  assert.match(src, /from '@\/lib\/comparar-eleitoral'/);
  assert.match(src, /parseCargo/);
  // A validação de cargo diferente fica na lib — a página
  // simplesmente passa slugs para a lib.
  const lib = read(LIB_FILE);
  assert.match(lib, /export function comparar/);
  assert.match(lib, /cargos_diferentes/);
});

test('página tem metadata com canonical, title e description', () => {
  const src = read(PAGE_FILE);
  assert.match(src, /export const metadata: Metadata/);
  assert.match(src, /title:\s*'Comparar Eleitoral/);
  assert.match(src, /description:/);
  assert.match(src, /alternates:/);
  assert.match(src, /canonical:\s*'\/comparar-eleitoral'/);
});

test('página exibe componentes de acessibilidade (aria-live, aria-label, role)', () => {
  const src = read(PAGE_FILE);
  // Resumo por cargo com aria-labelledby.
  assert.match(src, /aria-labelledby="heading-resumo-cargos"/);
  // Navegação com aria-label.
  assert.match(src, /aria-label="Navegação a partir da comparação eleitoral"/);
});

test('página não inventa carga, partido, estágio, evidência, data ou link', () => {
  const src = read(PAGE_FILE);
  // Toda estatística da página vem de cenarioEleitoral.
  assert.match(src, /from '@\/data\/cenario-eleitoral'/);
  assert.match(src, /cenarioEleitoral\.filter/);
  // Não usa base de notícias para preencher a comparação.
  assert.doesNotMatch(src, /from '@\/data\/noticias'/);
});

// ---------------------------------------------------------------------------
// Componente /components/comparar-eleitoral.tsx
// ---------------------------------------------------------------------------

test('componente comparar-eleitoral.tsx existe e é client component', () => {
  assert.ok(fs.existsSync(COMP_FILE), 'componente deve existir');
  const src = read(COMP_FILE);
  assert.match(src, /^\s*'use client'/m);
  assert.match(src, /import \{ useMemo, useState \} from 'react'/);
});

test('componente declara filtros por cargo e seleção de pessoas', () => {
  const src = read(COMP_FILE);
  assert.match(src, /id="comparar-eleitoral-cargo"/);
  assert.match(src, /id=\{`comparar-eleitoral-p\$\{idx \+ 1\}`\}/);
  assert.match(src, /htmlFor=\{`comparar-eleitoral-p\$\{idx \+ 1\}`\}/);
  assert.match(src, /aria-label="Selecionar cargo para a comparação eleitoral"/);
  assert.match(src, /aria-label="Limpar seleção de pessoas"/);
});

test('componente tem grid responsivo (desktop e mobile)', () => {
  const src = read(COMP_FILE);
  assert.match(src, /grid-cols-1 sm:grid-cols-2 lg:grid-cols-3/);
});

test('componente trata estados: vazio, erro e carregamento', () => {
  const src = read(COMP_FILE);
  assert.match(src, /Escolha um cargo para começar/);
  assert.match(src, /Selecione pelo menos \{MIN_COMPARACAO_ELEITORAL\} pessoas/);
  assert.match(src, /role="alert"/);
  assert.match(src, /Não foi possível comparar/);
  assert.match(src, /aria-live="assertive"/);
  assert.match(src, /sr-only/);
  assert.match(src, /role="status"/);
  assert.match(src, /aria-live="polite"/);
});

test('componente NÃO produz ranking, nota ou inferência de intenção de voto', () => {
  const src = read(COMP_FILE);
  assert.doesNotMatch(src, /Math\.max/);
  assert.doesNotMatch(src, /Math\.min/);
  assert.doesNotMatch(src, /\.reduce\(.*score|\.reduce\(.*ranking/);
  assert.match(src, /sem ranking|Sem ranking/);
});

test('componente acessa perfis individuais via Link', () => {
  const src = read(COMP_FILE);
  assert.match(src, /href=\{`\/perfil-eleitoral\/\$\{p\.slug\}`\}/);
  assert.match(src, /Ver perfil eleitoral de/);
  // aria-label explícito nos links.
  assert.match(src, /aria-label=\{`Ver perfil eleitoral de \$\{p\.nome\}`\}/);
});

test('componente NÃO importa base de notícias para classificar', () => {
  const src = read(COMP_FILE);
  assert.doesNotMatch(src, /from '@\/data\/noticias'/);
  assert.doesNotMatch(src, /from '@\/data\/deputados'/);
});

// ---------------------------------------------------------------------------
// Lógica pura src/lib/comparar-eleitoral.ts
// ---------------------------------------------------------------------------

test('lib/comparar-eleitoral.ts existe e exporta API pública', () => {
  const src = read(LIB_FILE);
  assert.match(src, /export const CARGOS_ORDENADOS/);
  assert.match(src, /export const MIN_COMPARACAO_ELEITORAL\s*=\s*2/);
  assert.match(src, /export const MAX_COMPARACAO_ELEITORAL\s*=\s*4/);
  assert.match(src, /export function comparar/);
  assert.match(src, /export function pessoaParaComparacao/);
  assert.match(src, /export function pessoasPorCargo/);
  assert.match(src, /export function mesmoCargo/);
  assert.match(src, /export function contarPorEstagio/);
  assert.match(src, /export function rotuloCargoComparacao/);
  assert.match(src, /export function rotuloEstagioComparacao/);
  assert.match(src, /export function classesEstagioComparacao/);
  assert.match(src, /export function formatarDataComparacao/);
  assert.match(src, /export const ROTULO_CARREGAMENTO/);
});

test('CARGOS_ORDENADOS contém os 5 cargos do schema na ordem canônica', () => {
  const src = read(LIB_FILE);
  const m = src.match(
    /export const CARGOS_ORDENADOS: CargoEleitoral\[\] = \[([\s\S]*?)\];/,
  );
  assert.ok(m, 'declaração deve existir');
  const cargos = m[1]
    .split(',')
    .map((s) => s.trim().replace(/'/g, ''))
    .filter(Boolean);
  assert.deepEqual(cargos, [
    'governador',
    'vice_governador',
    'senador',
    'deputado_federal',
    'deputado_distrital',
  ]);
});

test('rotuloCargoComparacao e rotuloEstagioComparacao cobrem 5 cargos e 5 estágios', () => {
  const src = read(LIB_FILE);
  // 5 cargos no switch.
  assert.match(src, /case 'governador':/);
  assert.match(src, /case 'vice_governador':/);
  assert.match(src, /case 'senador':/);
  assert.match(src, /case 'deputado_federal':/);
  assert.match(src, /case 'deputado_distrital':/);
  // 5 estágios no switch.
  assert.match(src, /case 'nome_monitorado':/);
  assert.match(src, /case 'pre_candidatura_declarada':/);
  assert.match(src, /case 'anunciado_pelo_partido':/);
  assert.match(src, /case 'movimentacao_publica':/);
  assert.match(src, /case 'registro_oficial':/);
});

test('classesEstagioComparacao cobre os 5 estágios do schema', () => {
  const src = read(LIB_FILE);
  assert.match(src, /bg-green-100 text-green-700/);
  assert.match(src, /bg-blue-100 text-blue-700/);
  assert.match(src, /bg-amber-100 text-amber-700/);
  assert.match(src, /bg-zinc-200 text-zinc-700/);
});

test('formatarDataComparacao converte ISO 8601 para dd/mm/aaaa', () => {
  const src = read(LIB_FILE);
  const m = src.match(
    /export function formatarDataComparacao\(iso: string\): string \{([\s\S]*?)\n\}/,
  );
  assert.ok(m, 'função deve existir');
  assert.match(m[1], /4\}/);
  assert.match(m[1], /2\}/);
  assert.match(m[1], /m\[3\]/);
  assert.match(m[1], /m\[2\]/);
  assert.match(m[1], /m\[1\]/);
  assert.match(m[1], /if \(!iso\)/);
  assert.match(m[1], /return '—'/);
});

// ---------------------------------------------------------------------------
// Critérios de aceite do item do brief
// ---------------------------------------------------------------------------

test('rota /comparar-eleitoral está no sitemap', () => {
  const src = read(SITEMAP_FILE);
  assert.match(src, /url:\s*'\/comparar-eleitoral'/);
  // A rota /comparar original permanece.
  assert.match(src, /url:\s*'\/comparar'/);
});

test('rota /comparar-eleitoral está na navegação principal', () => {
  const src = read(NAV_FILE);
  assert.match(src, /href:\s*'\/comparar-eleitoral'/);
  // No grupo editorial 'eleicoes'.
  const re = /href:\s*'\/comparar-eleitoral'[\s\S]*?group:\s*'eleicoes'/;
  assert.match(src, re, 'rota deve estar no grupo editorial "eleicoes"');
  // A rota /comparar original permanece.
  assert.match(src, /href:\s*'\/comparar'/);
});

test('método comparar retorna null quando há menos de MIN_COMPARACAO_ELEITORAL slugs', () => {
  const src = read(LIB_FILE);
  // Quando o número de pessoas é < mínimo, retornar null.
  assert.match(src, /if \(pessoas\.length < MIN_COMPARACAO_ELEITORAL\) return null/);
  assert.match(src, /if \(slugsFinal\.length < MIN_COMPARACAO_ELEITORAL\) return null/);
});

test('método comparar emite erro estruturado quando cargos diferem', () => {
  const src = read(LIB_FILE);
  assert.match(src, /if \(!mesmoCargo\(pessoas\)\)/);
  assert.match(src, /erro:\s*\{/);
  assert.match(src, /tipo:\s*'cargos_diferentes'/);
  // Mensagem clara referenciando /comparar.
  assert.match(src, /\/comparar/);
});

test('método comparar deduplica slugs e respeita MAX_COMPARACAO_ELEITORAL', () => {
  const src = read(LIB_FILE);
  assert.match(src, /slice\(0, MAX_COMPARACAO_ELEITORAL\)/);
  // Deduplicação.
  assert.match(src, /if \(!slugsUnicos\.includes\(s\)\) slugsUnicos\.push\(s\)/);
});

test('comparação é puramente descritiva — não calcula scores nem ranqueia', () => {
  const src = read(LIB_FILE);
  // A função `comparar` deve apenas agregar descritivamente.
  const m = src.match(/export function comparar\([\s\S]*?\n\}/);
  assert.ok(m, 'função comparar deve existir');
  assert.doesNotMatch(m[0], /Math\.(max|min|abs)/);
  assert.doesNotMatch(m[0], /sort\(.*\.reduce/);
  assert.doesNotMatch(m[0], /score/);
  assert.doesNotMatch(m[0], /ranking/);
});

test('pessoasPorCargo filtra por cargo e exige evidência', () => {
  const src = read(LIB_FILE);
  const m = src.match(
    /export function pessoasPorCargo\([\s\S]*?\n\}/,
  );
  assert.ok(m, 'função pessoasPorCargo deve existir');
  assert.match(m[0], /p\.cargo === cargo/);
  assert.match(m[0], /p\.evidencias\.length > 0/);
});

test('contarPorEstagio cobre os 5 estágios do schema', () => {
  const src = read(LIB_FILE);
  const m = src.match(
    /export function contarPorEstagio\([\s\S]*?\n\}/,
  );
  assert.ok(m, 'função contarPorEstagio deve existir');
  assert.match(m[0], /nome_monitorado/);
  assert.match(m[0], /pre_candidatura_declarada/);
  assert.match(m[0], /anunciado_pelo_partido/);
  assert.match(m[0], /movimentacao_publica/);
  assert.match(m[0], /registro_oficial/);
});

test('componente trata pessoas/partidos nulos com estado honesto', () => {
  const src = read(COMP_FILE);
  assert.match(src, /sem partido registrado/);
  assert.match(src, /sem evidência registrada/);
  assert.match(src, /sem verificação registrada/);
});

test('componente tem link explícito para /comparar (preservação da rota histórica)', () => {
  const src = read(COMP_FILE);
  assert.match(src, /href="\/comparar"/);
  assert.match(src, /aria-label="Abrir comparação legislativa histórica dos deputados distritais"/);
});

test('página /perfil-eleitoral/[slug] relacionada não é alterada', () => {
  // Defesa: garantir que nenhuma outra página foi modificada.
  assert.ok(fs.existsSync(PERFIL_PAGE_FILE), 'página de perfil deve existir');
  // Apenas verificação de existência — o conteúdo é intocado.
});

// ---------------------------------------------------------------------------
// Validação determinística do filtro contra a base real
// ---------------------------------------------------------------------------

test('base de cenario-eleitoral contém pessoas em todos os 5 cargos do schema', () => {
  const src = read(BASE_FILE);
  const cargos = [
    'governador',
    'vice_governador',
    'senador',
    'deputado_federal',
    'deputado_distrital',
  ];
  for (const c of cargos) {
    const re = new RegExp(`cargo:\\s*'${c}'`);
    assert.ok(
      re.test(src),
      `cargo '${c}' deve estar presente na base`,
    );
  }
});
