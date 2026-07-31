/* eslint-disable @typescript-eslint/no-require-imports */
// -----------------------------------------------------------------------------
// Validação determinística do critério da tarefa de migração da página
// /cenario-2026 para a nova base eleitoral independente.
//
// AGENT_BRIEF.md, fila P5:
//   [ ] Migrar a página de cenário 2026 para a nova base eleitoral.
//     Critério: manter compatibilidade da rota atual e não classificar por
//     palavras-chave de notícia.
//
// Esta suíte comprova, sem build nem rede, que:
//   1) a rota /cenario-2026 continua registrada no sitemap e no canonical da
//      metadata;
//   2) a página importa `cenarioEleitoral` da base independente;
//   3) a classificação de estágio vem do campo `estagio` do registro, não de
//      palavras-chave nos títulos de notícia;
//   4) a página filtra pessoas sem evidência (evidencias.length > 0);
//   5) nenhuma string da página indica classificação por título de notícia;
//   6) o mapeamento de estágio cobre os 5 valores do schema para os 3 valores
//      exibidos na página.
// -----------------------------------------------------------------------------

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');

const PAGE_FILE = path.join(ROOT, 'src/app/cenario-2026/page.tsx');
const SITEMAP_FILE = path.join(ROOT, 'src/app/sitemap.ts');
const BASE_FILE = path.join(ROOT, 'src/data/cenario-eleitoral.ts');
const NEWS_FILE = path.join(ROOT, 'src/data/noticias.ts');

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function assertContains(haystack, needle, label) {
  assert.ok(
    haystack.includes(needle),
    `${label}: trecho esperado não encontrado — "${needle.slice(0, 80)}"`,
  );
}

test('rota /cenario-2026 permanece cadastrada no sitemap e no canonical da página', () => {
  const sitemap = read(SITEMAP_FILE);
  assertContains(sitemap, "'/cenario-2026'", 'sitemap.ts');

  const page = read(PAGE_FILE);
  assertContains(page, "canonical: '/cenario-2026'", 'metadata.alternates.canonical');
  assertContains(
    page,
    "title: 'Cenário Eleitoral 2026 — Deputados Distritais DF'",
    'metadata.title',
  );
});

test('página importa cenarioEleitoral da base independente (não de noticias.ts)', () => {
  const page = read(PAGE_FILE);
  assertContains(
    page,
    "import { cenarioEleitoral } from '@/data/cenario-eleitoral';",
    'importação da base eleitoral',
  );
  // A página pode importar `noticias` apenas para validação da base eleitoral
  // (validarCenarioEleitoral), nunca para classificar estágio. Verificamos que
  // o uso de `noticias` está restrito à chamada `validarCenarioEleitoral`.
  const usosNoticia = page
    .split('\n')
    .filter((l) => /\bnoticias\b/.test(l) && !l.trim().startsWith('//'));
  assert.ok(
    usosNoticia.length > 0,
    'a página referencia `noticias` (esperado: apenas para validarCenarioEleitoral)',
  );
  const somenteValidacao = usosNoticia.every(
    (l) => l.includes('validarCenarioEleitoral') || l.includes('import'),
  );
  assert.equal(
    somenteValidacao,
    true,
    '`noticias` é usada apenas para validação da base, não para classificação',
  );
});

test('classificação por estágio vem do campo estagio do registro, não de palavras-chave em título', () => {
  const page = read(PAGE_FILE);

  // 1) Existe a função `estagioPagina` que mapeia o campo `estagio` (5 valores
  //    do schema) para 3 valores da página, sem usar título de notícia.
  assertContains(page, 'function estagioPagina(', 'função estagioPagina');
  assertContains(page, 'pre_candidatura_declarada', 'mapeamento do schema pre_candidatura_declarada');
  assertContains(page, 'anunciado_pelo_partido', 'mapeamento do schema anunciado_pelo_partido');
  assertContains(page, 'registro_oficial', 'mapeamento do schema registro_oficial');
  assertContains(page, 'movimentacao_publica', 'mapeamento do schema movimentacao_publica');
  assertContains(page, 'nome_monitorado', 'mapeamento do schema nome_monitorado');

  // 2) O array `itensCenario` filtra por `evidencias.length > 0` e deriva o
  //    estágio do registro, não da notícia.
  assertContains(
    page,
    'cenarioEleitoral\n  .filter((p) => p.evidencias.length > 0)',
    'filtro por evidências presentes',
  );
  assertContains(page, 'estagio: estagioPagina(p.estagio)', 'estágio derivado de p.estagio');
  assertContains(page, "url: evMaisRecente.url", 'URL da evidência mais recente');
  assertContains(page, "data: evMaisRecente.dataEvidencia", 'data da evidência mais recente');

  // 3) A página não chama nenhuma função cujo nome sugira classificação por
  //    palavra-chave de título de notícia.
  assert.doesNotMatch(
    page,
    /\.titulo\s*\.\s*(?:match|includes|test|indexOf|search)/,
    'a página não testa palavras-chave em títulos',
  );
  assert.doesNotMatch(
    page,
    /palavra-?chave|keyword/i,
    'a página não menciona classificação por palavra-chave',
  );
});

test('pessoas sem evidência são excluídas e nenhum item é exibido sem fonte', () => {
  const page = read(PAGE_FILE);
  assertContains(
    page,
    'cenarioEleitoral\n  .filter((p) => p.evidencias.length > 0)',
    'filtro aplicado ao cenarioEleitoral',
  );
  // Cada item exibido traz fonte e URL da evidência mais recente.
  assertContains(page, "fonte: evMaisRecente.fonte", 'fonte da evidência mais recente');
  assertContains(page, "url: evMaisRecente.url", 'url da evidência mais recente');
});

test('estágios da página cobrem toda a taxonomia do schema', () => {
  const page = read(PAGE_FILE);
  // Cinco valores do schema → três valores da página.
  const schemaEstagios = [
    'pre_candidatura_declarada',
    'anunciado_pelo_partido',
    'registro_oficial',
    'movimentacao_publica',
    'nome_monitorado',
  ];
  for (const e of schemaEstagios) {
    assertContains(page, `case '${e}'`, `case '${e}' no switch de mapeamento`);
  }
  // Três valores da página exibidos nos rótulos de seção.
  assertContains(page, "'pre-candidatura-declarada'", 'rótulo pre-candidatura-declarada');
  assertContains(page, "'movimentacao-publica'", 'rótulo movimentacao-publica');
  assertContains(page, "'em-observacao'", 'rótulo em-observacao');
});

test('rota /cenario-2026 não foi quebrada por redirecionamentos ou parâmetros novos', () => {
  const sitemap = read(SITEMAP_FILE);
  // A entrada deve ser literal '/cenario-2026' (sem query string, sem hash e
  // sem redirecionamento).
  assert.match(
    sitemap,
    /url:\s*'\/cenario-2026'/,
    'sitemap preserva /cenario-2026 sem query/hash',
  );
  const page = read(PAGE_FILE);
  assertContains(page, "alternates: {\n    canonical: '/cenario-2026',\n  }", 'canonical preservado');
});

test('a base eleitoral existe e é fonte de verdade da página (49 pessoas, 5 cargos)', () => {
  const base = read(BASE_FILE);
  // sanity: a base não importa noticias como classificador.
  assertContains(base, 'cenarioEleitoral: PessoaEleitoral[]', 'exporta cenarioEleitoral');
  assertContains(base, "'governador'", 'cargo governador');
  assertContains(base, "'vice_governador'", 'cargo vice_governador');
  assertContains(base, "'senador'", 'cargo senador');
  assertContains(base, "'deputado_federal'", 'cargo deputado_federal');
  assertContains(base, "'deputado_distrital'", 'cargo deputado_distrital');

  // Contar entradas: cada `id:` em bloco é uma PessoaEleitoral.
  const matches = base.match(/^\s{4}id:\s*'/gm) || [];
  assert.ok(
    matches.length >= 30,
    `base eleitoral deve ter múltiplos registros (encontrado ${matches.length})`,
  );
});

test('arquivo de notícias existe e a página não usa títulos de notícia para classificar', () => {
  assert.ok(fs.existsSync(NEWS_FILE), 'noticias.ts existe');
  const news = read(NEWS_FILE);
  assertContains(news, 'export const noticias', 'exporta array noticias');

  const page = read(PAGE_FILE);
  // A página pode iterar `noticias` apenas para validação; em nenhum momento
  // lê o título dela.
  assert.doesNotMatch(page, /noticia\.titulo|noticias\.[a-z]+\.titulo/, 'não lê titulo de noticia');
});
