/* eslint-disable @typescript-eslint/no-require-imports */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const PAGE_FILE = path.join(
  ROOT,
  'src/app/perfil-eleitoral/[slug]/page.tsx',
);
const PURE_FILE = path.join(ROOT, 'src/lib/perfil-eleitoral.ts');
const COMP_FILE = path.join(ROOT, 'src/components/exploracao-cargo.tsx');
const SITEMAP_FILE = path.join(ROOT, 'src/app/sitemap.ts');
const BASE_FILE = path.join(ROOT, 'src/data/cenario-eleitoral.ts');
const FOTO_PLACEHOLDER_FILE = path.join(ROOT, 'src/data/foto-placeholder.ts');

function read(p) {
  return fs.readFileSync(p, 'utf8');
}

// ---------------------------------------------------------------------------
// Página /perfil-eleitoral/[slug]
// ---------------------------------------------------------------------------

test('página /perfil-eleitoral/[slug] existe e declara generateStaticParams + generateMetadata', () => {
  assert.ok(fs.existsSync(PAGE_FILE), 'página deve existir');
  const src = read(PAGE_FILE);
  assert.match(src, /export async function generateStaticParams/);
  assert.match(src, /export async function generateMetadata/);
  // Params no Next 16 são Promise<{ slug: string }>.
  assert.match(src, /params:\s*Promise<\{\s*slug:\s*string\s*\}>/);
});

test('página importa lógica pura de perfil-eleitoral.ts', () => {
  const src = read(PAGE_FILE);
  assert.match(src, /from '@\/lib\/perfil-eleitoral'/);
  assert.match(src, /perfilEleitoralDePessoa/);
  assert.match(src, /pessoaEleitoralPorSlug/);
  assert.match(src, /slugsPerfilEleitoral/);
});

test('página chama notFound() quando slug não corresponde a pessoa monitorada', () => {
  const src = read(PAGE_FILE);
  // notFound deve ser importado e chamado quando pessoaPorSlug === null.
  assert.match(src, /from 'next\/navigation'/);
  assert.match(src, /import \{ notFound \}/);
  assert.match(src, /if \(!pessoa\) notFound\(\)/);
});

test('página exibe foto atribuída ou placeholder (placeholderFoto)', () => {
  const src = read(PAGE_FILE);
  // A lógica de foto fica em src/lib/perfil-eleitoral.ts; a página apenas
  // consome `perfil.foto.url` e decide entre placeholder e real.
  assert.match(src, /perfil\.foto\.url/);
  assert.match(src, /perfil\.foto\.placeholder/);
});

test('página exibe cargo, estágio, evidências, notícias e links oficiais', () => {
  const src = read(PAGE_FILE);
  // Critério do brief: cargo, estágio, evidências, notícias, links.
  assert.match(src, /rotuloCargo/);
  assert.match(src, /rotuloEstagio/);
  assert.match(src, /historicoEvidencias/);
  assert.match(src, /evidenciaDestaque/);
  assert.match(src, /perfil\.noticias/);
  assert.match(src, /perfil\.linksOficiais/);
});

test('página tem link de navegação de volta para /eleicoes-2026', () => {
  const src = read(PAGE_FILE);
  assert.match(src, /href="\/eleicoes-2026"/);
});

test('página é server component (sem "use client")', () => {
  const src = read(PAGE_FILE);
  assert.doesNotMatch(src, /^\s*'use client'/m);
});

// ---------------------------------------------------------------------------
// Lógica pura src/lib/perfil-eleitoral.ts
// ---------------------------------------------------------------------------

test('lib/perfil-eleitoral.ts existe e exporta API pública', () => {
  const src = read(PURE_FILE);
  assert.match(src, /export function fotoParaPerfil/);
  assert.match(src, /export function evidenciaDestaqueParaPerfil/);
  assert.match(src, /export function noticiasRelacionadasParaPerfil/);
  assert.match(src, /export function linksOficiaisParaPerfil/);
  assert.match(src, /export function perfilEleitoralDePessoa/);
  assert.match(src, /export function pessoaEleitoralPorSlug/);
  assert.match(src, /export function slugsPerfilEleitoral/);
  assert.match(src, /export function formatarDataPerfil/);
  assert.match(src, /export function rotuloCargo/);
  assert.match(src, /export function rotuloEstagio/);
  assert.match(src, /export function classesEstagioPerfil/);
  assert.match(src, /export function rotuloFonteCategoria/);
});

test('fotoParaPerfil usa somente placeholder até existir foto verificada para pessoa e contexto eleitoral', () => {
  const src = read(PURE_FILE);
  assert.match(src, /export function fotoParaPerfil\(_pessoa: PessoaEleitoral\)/);
  assert.doesNotMatch(src, /auditoriaFotosDeputadosDistritaisLote[123]/);
  assert.doesNotMatch(src, /slug === pessoa\.slug/);
  assert.match(src, /PLACEHOLDER_URL/);
  assert.match(src, /PLACEHOLDER_FONTE/);
  assert.match(src, /PLACEHOLDER_LICENCA/);
  assert.match(src, /placeholder:\s*true/);
  assert.match(src, /contexto eleitoral\/cargo monitorado/);
});

test('linksOficiaisParaPerfil aceita Instagram vindo da auditoria de Instagram P4', () => {
  const src = read(PURE_FILE);
  assert.match(src, /auditoriaInstagram/);
  // Evita duplicar quando o link já veio do próprio registro.
  assert.match(src, /links\.some\(\(l\) => l\.url === ig\.url\)/);
});

test('slugsPerfilEleitoral retorna slugs de pessoas com evidência', () => {
  const src = read(PURE_FILE);
  assert.match(
    src,
    /cenarioEleitoral[\s\S]*?filter\(\(p\) => p\.evidencias\.length > 0\)[\s\S]*?\.map\(\(p\) => p\.slug\)/,
  );
});

test('formatarDataPerfil formata ISO 8601 em dd/mm/aaaa', () => {
  const src = read(PURE_FILE);
  assert.match(
    src,
    /export function formatarDataPerfil[\s\S]*?return `\$\{m\[3\]\}\/\$\{m\[2\]\}\/\$\{m\[1\]\}`/,
  );
});

test('rotuloCargo cobre os 5 cargos do schema', () => {
  const src = read(PURE_FILE);
  for (const c of [
    'governador',
    'vice_governador',
    'senador',
    'deputado_federal',
    'deputado_distrital',
  ]) {
    assert.ok(
      src.includes(`case '${c}'`),
      `case '${c}' deve aparecer em rotuloCargo`,
    );
  }
});

test('rotuloEstagio cobre os 5 estágios do schema', () => {
  const src = read(PURE_FILE);
  for (const e of [
    'nome_monitorado',
    'pre_candidatura_declarada',
    'anunciado_pelo_partido',
    'movimentacao_publica',
    'registro_oficial',
  ]) {
    assert.ok(
      src.includes(`case '${e}'`),
      `case '${e}' deve aparecer em rotuloEstagio`,
    );
  }
});

test('classesEstagioPerfil atribui 5 classes Tailwind distintas (incluindo registro_oficial)', () => {
  const src = read(PURE_FILE);
  assert.match(src, /bg-green-100 text-green-700/);
  assert.match(src, /bg-blue-100 text-blue-700/);
  assert.match(src, /bg-amber-100 text-amber-700/);
  assert.match(src, /bg-zinc-200 text-zinc-700/);
});

test('rotuloFonteCategoria cobre as 6 categorias do schema', () => {
  const src = read(PURE_FILE);
  for (const c of [
    'tse_divulcacand_tre',
    'orgaos_publicos',
    'partido_oficial',
    'declaracao_pessoa',
    'veiculo_jornalistico',
    'google_news_rss',
  ]) {
    assert.ok(
      src.includes(`case '${c}'`),
      `case '${c}' deve aparecer em rotuloFonteCategoria`,
    );
  }
});

test('fotoParaPerfil nunca fabrica licença real (todas as licenças vem de auditoria ou são "placeholder")', () => {
  const src = read(PURE_FILE);
  // O retorno da função para o ramo do placeholder usa PLACEHOLDER_LICENCA
  // (sentinela), não um valor hardcoded. Garante que não há string-literal
  // 'institucional_oficial' / 'divulcacand_tse' no retorno do placeholder
  // (vazamento silencioso de licença real).
  const ramoPlaceholder = src.split('PLACEHOLDER_URL')[1] || '';
  assert.doesNotMatch(ramoPlaceholder, /'institucional_oficial'/);
  assert.doesNotMatch(ramoPlaceholder, /'divulcacand_tse'/);
  assert.doesNotMatch(ramoPlaceholder, /'partido_oficial'/);
  assert.doesNotMatch(ramoPlaceholder, /'pessoa_oficial'/);
  assert.doesNotMatch(ramoPlaceholder, /'imprensa_licenca_explicita'/);
});

// ---------------------------------------------------------------------------
// Integração no sitemap e no componente ExploracaoPorCargo
// ---------------------------------------------------------------------------

test('sitemap inclui rotas /perfil-eleitoral/[slug] derivadas da base', () => {
  const src = read(SITEMAP_FILE);
  assert.match(src, /from '@\/lib\/perfil-eleitoral'/);
  assert.match(src, /slugsPerfilEleitoral\(\)/);
  assert.match(src, /`\/perfil-eleitoral\/\$\{slug\}`/);
});

test('componente ExploracaoPorCargo linka cada item ao perfil eleitoral', () => {
  const src = read(COMP_FILE);
  assert.match(
    src,
    /href=\{`\/perfil-eleitoral\/\$\{item\.slug\}`\}/,
  );
  // Texto de chamada coerente com o padrão editorial.
  assert.match(src, /Ver perfil eleitoral/);
});

// ---------------------------------------------------------------------------
// Determinismo: contagens esperadas em build time
// ---------------------------------------------------------------------------

test('base eleitoral possui 49 perfis possíveis (1 por pessoa com evidência)', () => {
  const src = read(BASE_FILE);
  const match = src.match(
    /cenarioEleitoral: PessoaEleitoral\[\] = \[([\s\S]*?)\n\]\;/,
  );
  assert.ok(match, 'array cenarioEleitoral deve estar presente');
  const body = match[1];
  const slugs = [...body.matchAll(/\bslug:\s*'([^']+)'/g)].map((m) => m[1]);
  assert.equal(
    new Set(slugs).size,
    49,
    `esperado 49 slugs únicos, encontrado ${new Set(slugs).size}`,
  );
});

test('placeholder FotoPerfil é o sentinela registrado em foto-placeholder.ts', () => {
  const src = read(FOTO_PLACEHOLDER_FILE);
  assert.match(src, /PLACEHOLDER_URL\s*=\s*'\/foto-placeholder\.svg'/);
  assert.match(src, /PLACEHOLDER_LICENCA:\s*LicencaFoto\s*=\s*'placeholder'/);
});
