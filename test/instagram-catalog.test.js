/* eslint-disable @typescript-eslint/no-require-imports */
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');

const ROOT = path.join(__dirname, '..');
const AUDIT_FILE = path.join(ROOT, 'src/data/auditoria-instagram.ts');
const DEPUTADOS_FILE = path.join(ROOT, 'src/data/deputados.ts');
const CENARIO_FILE = path.join(ROOT, 'src/data/cenario-eleitoral.ts');

function readFileSafe(file) {
  return fs.readFileSync(file, 'utf8');
}

function cenarioIds() {
  const source = readFileSafe(CENARIO_FILE);
  const ids = new Set();
  const re = /^[ \t]+id: '([^']+)',/gm;
  let m;
  while ((m = re.exec(source)) !== null) {
    if (!m[1].startsWith('e-')) ids.add(m[1]);
  }
  return ids;
}

function cenarioSlugs() {
  const source = readFileSafe(CENARIO_FILE);
  const slugs = new Set();
  const re = /^[ \t]+slug: '([^']+)',/gm;
  let m;
  while ((m = re.exec(source)) !== null) {
    slugs.add(m[1]);
  }
  return slugs;
}

function deputadoInstagram(slug) {
  const source = readFileSafe(DEPUTADOS_FILE);
  // Encontra o bloco `{ slug: '<slug>', ... }` e extrai o `instagram` interno.
  const re = new RegExp(
    `slug:\\s*'${slug}'[\\s\\S]*?instagram:\\s*'([^']+)'`,
    'm',
  );
  const m = source.match(re);
  return m ? m[1] : null;
}

function auditoriaInstagramLote1Items() {
  const source = readFileSafe(AUDIT_FILE);
  // O array é produzido por PERFIS_INSTAGRAM_CLDF.map(...) — extraímos
  // os pares depSlug + handle da constante-fonte.
  const cfg = source.match(/PERFIS_INSTAGRAM_CLDF:[^=]*=\s*\[([\s\S]*?)\]/);
  if (!cfg) return [];
  const items = [];
  const re = /\{\s*depSlug:\s*'([^']+)'\s*,\s*handle:\s*'([^']+)'\s*\}/g;
  let mm;
  while ((mm = re.exec(cfg[1])) !== null) {
    items.push({ depSlug: mm[1], handle: mm[2] });
  }
  return items;
}

// ---------------------------------------------------------------------------
// Catálogo de Instagram dos nomes monitorados — P4 do AGENT_BRIEF.md.
//
// Tarefa: "Catalogar links oficiais de Instagram dos nomes monitorados."
// Critério: "apenas links confirmados em fonte oficial; sem posts ou métricas."
//
// Estilo determinístico: o test runner não tem rede nem build,
// então validamos a forma (schema, URLs, handles, fonte) e a
// consistência com a base (deputados.ts e cenario-eleitoral.ts), e
// divulgamos honestamente que a verificação HTTP do perfil fica
// pendente. As URLs do Instagram em si são a "página oficial que
// exibe o handle e confirma a perfil" exigida pelo feedback; a fonte
// do handle é a CLDF (cadastro de contatos institucionais).
// ---------------------------------------------------------------------------

const SLUGS_ESPERADOS = [
  'paula-belmonte',
  'fabio-felix',
  'thiago-manzoni',
  'daniel-donizet',
  'chico-vigilante',
  'gabriel-magno',
  'ricardo-vale',
  'max-maciel',
  'hermeto',
  'jaqueline-silva',
  'doutora-jane',
  'eduardo-pedrosa',
  'martins-machado',
];

const HANDLES_ESPERADOS = {
  'paula-belmonte': 'paulabelmontedf',
  'fabio-felix': 'fabiofelix.df',
  'thiago-manzoni': 'thiagomanzoni',
  'daniel-donizet': 'danieldonizet',
  'chico-vigilante': 'chicovigilante',
  'gabriel-magno': 'gabrielmagno.df',
  'ricardo-vale': 'ricardovaledf',
  'max-maciel': 'maxmaciel.df',
  'hermeto': 'hermeto.mdb',
  'jaqueline-silva': 'jaquelinesilvadf',
  'doutora-jane': 'doutorajane',
  'eduardo-pedrosa': 'dudupedrosa',
  'martins-machado': 'martinsmachadodf',
};

test('lote 1 cobre exatamente 13 nomes monitorados (limite do ciclo)', () => {
  const items = auditoriaInstagramLote1Items();
  assert.equal(items.length, 13, `lote deve ter 13 entradas; encontrado ${items.length}`);
});

test('lote 1 registra os 13 nomes esperados em ordem', () => {
  const items = auditoriaInstagramLote1Items();
  assert.deepEqual(
    items.map((i) => i.depSlug),
    SLUGS_ESPERADOS,
    `ordem dos slugs divergente; esperado ${SLUGS_ESPERADOS.join(',')} ; encontrado ${items.map((i) => i.depSlug).join(',')}`,
  );
});

test('lote 1 mantém os handles idênticos ao cadastro oficial CLDF (deputados.ts)', () => {
  for (const slug of SLUGS_ESPERADOS) {
    const esperado = deputadoInstagram(slug);
    assert.ok(esperado, `deputado '${slug}' sem handle em src/data/deputados.ts`);
    assert.equal(
      esperado,
      HANDLES_ESPERADOS[slug],
      `handle esperado divergente para '${slug}': esperado ${HANDLES_ESPERADOS[slug]}, cadastro CLDF=${esperado}`,
    );
  }
});

test('cada slug do lote 1 existe em cenario-eleitoral.ts como nome monitorado', () => {
  const slugs = cenarioSlugs();
  for (const slug of SLUGS_ESPERADOS) {
    assert.ok(slugs.has(slug), `slug '${slug}' não consta em cenario-eleitoral.ts`);
  }
});

test('arquivo exporta array do lote 1 e função de validação', () => {
  const fonte = readFileSafe(AUDIT_FILE);
  assert.match(
    fonte,
    /export const auditoriaInstagramNomesMonitoradosLote1/,
    'array do lote 1 deve ser exportado',
  );
  assert.match(
    fonte,
    /export function validarAuditoriaInstagramNomesMonitoradosLote1/,
    'validador do lote 1 deve ser exportado',
  );
});

test('URL da fonte declarada é HTTPS da CLDF (institucional_oficial)', () => {
  const fonte = readFileSafe(AUDIT_FILE);
  assert.match(
    fonte,
    /CLDF_DEPUTADOS_URL\s*=\s*'https:\/\/www\.cl\.df\.gov\.br\/deputados-2023-2026'/,
    'URL da fonte CLDF ausente ou divergente',
  );
});

test('verificadaEm fixa em 2026-07-30 (consistente com lote de fotos)', () => {
  const fonte = readFileSafe(AUDIT_FILE);
  assert.match(
    fonte,
    /VERIFICADA_EM\s*=\s*'2026-07-30'/,
    'data de verificação fixa deve ser 2026-07-30',
  );
});

test('url do perfil é construída como https://www.instagram.com/<handle>/', () => {
  const fonte = readFileSafe(AUDIT_FILE);
  assert.match(
    fonte,
    /https:\/\/www\.instagram\.com\/\$\{handle\}\//,
    'url do perfil deve ser HTTPS canônica (com barra final) por handle',
  );
});

test('cada item do lote 1 registra os campos obrigatórios do schema', () => {
  const fonte = readFileSafe(AUDIT_FILE);
  const blocoItem = fonte.match(/const item = \([\s\S]*?return\s*\{[\s\S]*?\};/);
  assert.ok(blocoItem, 'função item() deve estar presente');
  for (const campo of [
    'pessoaEleitoralId',
    'slug',
    'nome',
    'handle',
    'url',
    'fonte',
    'urlFonte',
    'validade',
    'verificadaEm',
    'observacao',
  ]) {
    assert.match(
      blocoItem[0],
      new RegExp(`\\b${campo}\\b:`),
      `campo obrigatório '${campo}' ausente do item()`,
    );
  }
});

test('validade do lote 1 é pendente_verificacao_externa (rede/build vedados)', () => {
  const fonte = readFileSafe(AUDIT_FILE);
  const blocoItem = fonte.match(/const item = \([\s\S]*?return\s*\{[\s\S]*?\};/);
  assert.ok(blocoItem, 'função item() ausente');
  assert.match(
    blocoItem[0],
    /validade:\s*'pendente_verificacao_externa'/,
    'validade deve ser pendente_verificacao_externa — determinação HTTP não executada neste ciclo',
  );
});

test('observação documenta honestamente que a verificação HTTP não foi executada', () => {
  const fonte = readFileSafe(AUDIT_FILE);
  assert.match(
    fonte,
    /confirmação HTTP do perfil no Instagram não foi executada neste ciclo/,
    'observação deve documentar a ausência de verificação HTTP automatizada',
  );
});

test('observação registra a fonte primária do handle (CLDF)', () => {
  const fonte = readFileSafe(AUDIT_FILE);
  assert.match(
    fonte,
    /Handle publicado pelo cadastro oficial da CLDF/,
    'observação deve citar a CLDF como fonte primária do handle',
  );
});

test('validador rejeita URL genérica (apenas raiz) do Instagram', () => {
  const fonte = readFileSafe(AUDIT_FILE);
  assert.match(
    fonte,
    /URL do perfil genérica \(apenas raiz\)/,
    'validador deve rejeitar URL genérica do Instagram',
  );
});

test('validador rejeita URL com query string ou hash (canalização)', () => {
  const fonte = readFileSafe(AUDIT_FILE);
  assert.match(
    fonte,
    /URL do perfil contém query\/hash/,
    'validador deve exigir URL canônica sem query/hash',
  );
});

test('validador exige que o pathname da URL exiba o próprio handle', () => {
  const fonte = readFileSafe(AUDIT_FILE);
  assert.match(
    fonte,
    /pathname da URL do perfil não exibe o handle/,
    'validador deve exigir que a URL exiba o handle no pathname',
  );
});

test('validador rejeita handle, slug, url, urlFonte, fonte, validade ausentes ou duplicados', () => {
  const fonte = readFileSafe(AUDIT_FILE);
  for (const msg of [
    /slug ausente ou duplicado/,
    /nome ausente/,
    /handle ausente ou inválido/,
    /handle duplicado/,
    /URL do perfil ausente ou não-HTTP/,
    /URL do perfil duplicada/,
    /urlFonte ausente ou não-HTTP/,
    /fonte ausente/,
    /validade fora do conjunto válido/,
    /verificadaEm ausente ou fora do formato ISO 8601/,
    /pessoaEleitoralId duplicado/,
  ]) {
    assert.match(fonte, msg, `validador deve conter: ${msg}`);
  }
});

test('validador de pessoaEleitoralId verifica existência no cenario-eleitoral.ts', () => {
  const fonte = readFileSafe(AUDIT_FILE);
  assert.match(
    fonte,
    /pessoaEleitoralId '[^']+' não existe em cenario-eleitoral\.ts/,
    'validador deve exigir que pessoaEleitoralId exista em cenario-eleitoral.ts',
  );
  assert.match(
    fonte,
    /mapeia para slug '[^']+'.*item\.slug é/,
    'validador deve exigir que pessoaEleitoralId mapeie para o mesmo slug',
  );
});

test('validador limita o lote a 13 entradas no máximo', () => {
  const fonte = readFileSafe(AUDIT_FILE);
  assert.match(
    fonte,
    /Lote 1 excede o limite de 13 entradas/,
    'validador deve impor o limite de 13 entradas por ciclo',
  );
});

// ---------------------------------------------------------------------------
// Documentação honesta: as URLs do Instagram registradas NÃO foram
// verificadas por HTTP neste ciclo. A tarefa da fila P4 permanece
// como `[ ]` (pendente) até que cada um dos 49 nomes monitorados
// possua uma URL oficial específica com comprovação. Os 36 nomes que
// não têm handle publicado em fonte estão fora deste lote — não
// inventamos handles sem fonte, conforme a regra "nunca invente" do
// AGENT_BRIEF.md.
// ---------------------------------------------------------------------------

test('documentação declara que o lote 1 cobre 13 dos 49 nomes monitorados', () => {
  const fonte = readFileSafe(AUDIT_FILE);
  assert.match(
    fonte,
    /Lote 1:[\s\S]*?13 nomes monitorados/,
    'cabeçalho deve indicar que o lote cobre 13 dos 49 nomes',
  );
  assert.match(
    fonte,
    /demais 36[\s\S]*?\(de um total de 49\)/,
    'cabeçalho deve registrar honestamente os 36 nomes restantes sem comprovação',
  );
});

test('documentação declara que a tarefa permanece como [ ] pendente', () => {
  const fonte = readFileSafe(AUDIT_FILE);
  assert.match(
    fonte,
    /Tarefa permanece como `\[ \]` \(pendente\) na fila P4/,
    'cabeçalho deve registrar que a tarefa permanece pendente',
  );
});

test('documentação não promete catálogo completo (sem inflar números)', () => {
  const fonte = readFileSafe(AUDIT_FILE);
  // Nenhum registro deve ostentar "49" perfis catalogados neste lote.
  const items = auditoriaInstagramLote1Items();
  assert.equal(items.length, 13, 'catálogo atual cobre exatamente 13 nomes');
  assert.ok(
    !/\b49\s+perfis?\s+catalogados?\b/i.test(fonte),
    'não deve afirmar 49 perfis catalogados — divulgação honesta',
  );
});

test('auditoria referencia cenario-eleitoral.ts para pessoaEleitoralId', () => {
  const fonte = readFileSafe(AUDIT_FILE);
  assert.match(
    fonte,
    /import\s+\{[^}]*cenarioEleitoral[^}]*\}\s+from\s+['"]@\/data\/cenario-eleitoral['"]/,
    'deve importar cenarioEleitoral para cruzamento de ids',
  );
});

test('auditoria referencia deputados.ts para validar handles', () => {
  const fonte = readFileSafe(AUDIT_FILE);
  assert.match(
    fonte,
    /import\s+\{[^}]*deputados[^}]*\}\s+from\s+['"]@\/data\/deputados['"]/,
    'deve importar deputados para validar handles publicados pelo cadastro CLDF',
  );
});

test('cross-check: cada slug do lote 1 existe em cenario-eleitoral.ts', () => {
  const ids = cenarioIds();
  const slugs = cenarioSlugs();
  assert.ok(ids.size > 0, 'cenario-eleitoral.ts deve ter ids');
  for (const slug of SLUGS_ESPERADOS) {
    assert.ok(slugs.has(slug), `slug '${slug}' não está em cenario-eleitoral.ts`);
  }
});
