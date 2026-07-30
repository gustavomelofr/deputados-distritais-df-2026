/* eslint-disable @typescript-eslint/no-require-imports */
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');

const ROOT = path.join(__dirname, '..');
const AUDIT_FILE = path.join(ROOT, 'src/data/auditoria-fotos.ts');
const DEPUTADOS_FILE = path.join(ROOT, 'src/data/deputados.ts');

function readFileSafe(file) {
  return fs.readFileSync(file, 'utf8');
}

function deputadosFonte() {
  const source = readFileSafe(DEPUTADOS_FILE);
  const itens = [];
  const reBloco = /\{\s*([\s\S]*?)\s*\},?\s*(?=\{|$)/g;
  const reId = /id:\s*'([^']+)'/;
  const reSlug = /slug:\s*'([^']+)'/;
  const reNome = /nome:\s*'([^']+)'/;
  const reFoto = /foto:\s*'([^']+)'/;
  const rePartido = /partido:\s*'([^']+)'/;
  const matches = [...source.matchAll(/\{\s*id:\s*'\d+'[\s\S]*?\n\s*\},?/g)];
  for (const m of matches) {
    const bloco = m[0];
    const id = (bloco.match(reId) || [])[1];
    const slug = (bloco.match(reSlug) || [])[1];
    const nome = (bloco.match(reNome) || [])[1];
    const foto = (bloco.match(reFoto) || [])[1];
    const partido = (bloco.match(rePartido) || [])[1];
    if (id && slug && nome && foto && partido) {
      itens.push({ id, slug, nome, foto, partido });
    }
  }
  return itens;
}

function auditoriaItemCalls() {
  const source = readFileSafe(AUDIT_FILE);
  const m = source.match(
    /auditoriaFotosDeputadosDistritaisLote1:\s*AuditoriaFoto\[\]\s*=\s*\[([\s\S]*?)\]/,
  );
  if (!m) return [];
  const re = /item\(\s*(\d+)\s*\)/g;
  return [...m[1].matchAll(re)].map((x) => Number(x[1]));
}

function auditoriaLote2Ranges() {
  const source = readFileSafe(AUDIT_FILE);
  const m = source.match(
    /auditoriaFotosDeputadosDistritaisLote2:\s*AuditoriaFoto\[\]\s*=\s*\[([\s\S]*?)\]/,
  );
  if (!m) return [];
  const re = /item\(\s*(\d+)\s*\)/g;
  return [...m[1].matchAll(re)].map((x) => Number(x[1]));
}

const DEPUTADOS_SLUGS_ESPERADOS = [
  'chico-vigilante',
  'daniel-donizet',
  'dayse-amarilio',
  'doutora-jane',
  'eduardo-pedrosa',
  'fabio-felix',
  'gabriel-magno',
  'hermeto',
  'iolando',
  'jaqueline-silva',
];

const DEPUTADOS_SLUGS_ESPERADOS_LOTE2 = [
  'joaquim-roriz-neto',
  'jorge-vianna',
  'joao-cardoso',
  'martins-machado',
  'max-maciel',
  'pastor-daniel-de-castro',
  'paula-belmonte',
  'pepa',
  'ricardo-vale',
  'roberio-negreiros',
];

test('auditoria cobre exatamente os 10 primeiros deputados distritais em ordem', () => {
  const calls = auditoriaItemCalls();
  assert.deepEqual(
    calls,
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    `auditoria deve chamar item(1) a item(10); chamadas encontradas: ${calls.join(',')}`,
  );
});

test('auditoria do lote 2 cobre exatamente os deputados distritais 11–20 em ordem', () => {
  const calls = auditoriaLote2Ranges();
  assert.deepEqual(
    calls,
    [11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
    `auditoria do lote 2 deve chamar item(11) a item(20); chamadas encontradas: ${calls.join(',')}`,
  );
});

test('slugs dos deputados distritais 11–20 batem com a lista oficial', () => {
  const deps = deputadosFonte().slice(10, 20);
  assert.deepEqual(
    deps.map((d) => d.slug),
    DEPUTADOS_SLUGS_ESPERADOS_LOTE2,
    'ordem dos slugs do lote 2 divergente da esperada',
  );
});

test('slugs dos 10 primeiros deputados batem com a lista oficial', () => {
  const deps = deputadosFonte().slice(0, 10);
  assert.deepEqual(
    deps.map((d) => d.slug),
    DEPUTADOS_SLUGS_ESPERADOS,
    'ordem dos slugs divergente da esperada',
  );
});

test('identidade registrada: deputadoId, slug, nome e url por posição', () => {
  const deps = deputadosFonte().slice(0, 10);
  const calls = auditoriaItemCalls();
  assert.equal(calls.length, deps.length);
  for (let i = 0; i < deps.length; i++) {
    const pos = calls[i];
    const dep = deps[pos - 1];
    assert.ok(dep, `posição ${pos} sem deputado correspondente`);
    assert.equal(dep.id, String(pos), `deputado da posição ${pos} tem id divergente`);
    assert.ok(dep.slug, `deputado ${pos}: slug ausente`);
    assert.ok(dep.nome, `deputado ${pos}: nome ausente`);
  }
});

test('URL da foto é HTTPS específica da CLDF', () => {
  const deps = deputadosFonte().slice(0, 10);
  for (const dep of deps) {
    const u = new URL(dep.foto);
    assert.equal(u.protocol, 'https:', `${dep.slug}: foto não HTTPS`);
    assert.match(
      u.hostname,
      /(^|\.)cl\.df\.gov\.br$/,
      `${dep.slug}: host fora da CLDF (${u.hostname})`,
    );
    assert.notEqual(u.pathname, '/', `${dep.slug}: pathname raiz`);
  }
});

test('URL da foto do lote 2 é HTTPS específica da CLDF', () => {
  const deps = deputadosFonte().slice(10, 20);
  for (const dep of deps) {
    const u = new URL(dep.foto);
    assert.equal(u.protocol, 'https:', `${dep.slug}: foto não HTTPS`);
    assert.match(
      u.hostname,
      /(^|\.)cl\.df\.gov\.br$/,
      `${dep.slug}: host fora da CLDF (${u.hostname})`,
    );
    assert.notEqual(u.pathname, '/', `${dep.slug}: pathname raiz`);
  }
});

test('identidade registrada no lote 2: deputadoId, slug, nome e url por posição', () => {
  const deps = deputadosFonte().slice(10, 20);
  const calls = auditoriaLote2Ranges();
  assert.equal(calls.length, deps.length);
  for (let i = 0; i < deps.length; i++) {
    const pos = calls[i];
    const dep = deps[pos - 11];
    assert.ok(dep, `posição ${pos} sem deputado correspondente`);
    assert.equal(dep.id, String(pos), `deputado da posição ${pos} tem id divergente`);
    assert.ok(dep.slug, `deputado ${pos}: slug ausente`);
    assert.ok(dep.nome, `deputado ${pos}: nome ausente`);
  }
});

test('lote 2 exporta validador determinístico 11–20', () => {
  const fonte = readFileSafe(AUDIT_FILE);
  assert.match(
    fonte,
    /export function validarAuditoriaFotosDeputados11a20/,
    'validador do lote 2 ausente',
  );
  assert.match(
    fonte,
    /auditoriaFotosDeputadosDistritaisLote2/,
    'array do lote 2 ausente',
  );
});

test('arquivo de auditoria contém URL da fonte da CLDF e campos obrigatórios', () => {
  const fonte = readFileSafe(AUDIT_FILE);
  assert.match(
    fonte,
    /CLDF_DEPUTADOS_URL\s*=\s*'https:\/\/www\.cl\.df\.gov\.br\/deputados-2023-2026'/,
    'URL da fonte institucional não encontrada',
  );
  for (const campo of [
    'deputadoId',
    'slug',
    'nome',
    'pessoaEleitoralId',
    'url',
    'fonte',
    'urlFonte',
    'licenca',
    'validade',
    'verificadaEm',
  ]) {
    assert.ok(
      new RegExp(`\\b${campo}\\b:`).test(fonte),
      `campo obrigatório "${campo}" ausente do arquivo de auditoria`,
    );
  }
});

test('licença registrada é institucional_oficial e verificadaEm em 2026-07-30', () => {
  const fonte = readFileSafe(AUDIT_FILE);
  assert.match(
    fonte,
    /licenca:\s*'institucional_oficial'/,
    'licença fora de institucional_oficial',
  );
  assert.match(
    fonte,
    /verificadaEm:\s*VERIFICADA_EM/,
    'verificadaEm deve consumir a constante VERIFICADA_EM',
  );
  assert.match(
    fonte,
    /VERIFICADA_EM\s*=\s*'2026-07-30'/,
    'data de verificação fixa deve ser 2026-07-30',
  );
  assert.match(fonte, /validade:\s*'valida'/, 'validade fora de "valida"');
  assert.match(
    fonte,
    /urlFonte:\s*CLDF_DEPUTADOS_URL/,
    'urlFonte deve apontar para a página institucional oficial',
  );
});

test('auditoria preserva mapeamento eleitoral 2026: 8 com, 2 sem', () => {
  const fonte = readFileSafe(AUDIT_FILE);
  assert.match(
    fonte,
    /cenarioEleitoral/,
    'auditoria deve consultar cenarioEleitoral para pessoaEleitoralId',
  );
  assert.match(
    fonte,
    /pessoaEleitoralId:\s*pessoaEleitoralIdPorSlug/,
    'auditoria deve derivar pessoaEleitoralId por slug',
  );
});

const DEPUTADOS_SLUGS_ESPERADOS_LOTE3 = [
  'rogerio-morro-da-cruz',
  'roosevelt-vilela',
  'thiago-manzoni',
  'wellington-luiz',
];

function auditoriaLote3Ranges() {
  const source = readFileSafe(AUDIT_FILE);
  const m = source.match(
    /auditoriaFotosDeputadosDistritaisLote3:\s*AuditoriaFoto\[\]\s*=\s*\[([\s\S]*?)\]/,
  );
  if (!m) return [];
  const re = /itemComComprovacao\(\s*(\d+)\s*,/g;
  return [...m[1].matchAll(re)].map((x) => Number(x[1]));
}

test('slugs dos deputados distritais 21–24 batem com a lista oficial', () => {
  const deps = deputadosFonte().slice(20, 24);
  assert.deepEqual(
    deps.map((d) => d.slug),
    DEPUTADOS_SLUGS_ESPERADOS_LOTE3,
    'ordem dos slugs do lote 3 divergente da esperada',
  );
});

test('auditoria do lote 3 cobre exatamente os deputados distritais 21–24 em ordem', () => {
  const calls = auditoriaLote3Ranges();
  assert.deepEqual(
    calls,
    [21, 22, 23, 24],
    `auditoria do lote 3 deve chamar itemComComprovacao(21) a itemComComprovacao(24); chamadas encontradas: ${calls.join(',')}`,
  );
});

test('identidade registrada no lote 3: deputadoId, slug, nome e url por posição', () => {
  const deps = deputadosFonte().slice(20, 24);
  const calls = auditoriaLote3Ranges();
  assert.equal(calls.length, deps.length);
  for (let i = 0; i < deps.length; i++) {
    const pos = calls[i];
    const dep = deps[pos - 21];
    assert.ok(dep, `posição ${pos} sem deputado correspondente`);
    assert.equal(dep.id, String(pos), `deputado da posição ${pos} tem id divergente`);
    assert.ok(dep.slug, `deputado ${pos}: slug ausente`);
    assert.ok(dep.nome, `deputado ${pos}: nome ausente`);
  }
});

test('URL da foto do lote 3 é HTTPS específica da CLDF', () => {
  const deps = deputadosFonte().slice(20, 24);
  for (const dep of deps) {
    const u = new URL(dep.foto);
    assert.equal(u.protocol, 'https:', `${dep.slug}: foto não HTTPS`);
    assert.match(
      u.hostname,
      /(^|\.)cl\.df\.gov\.br$/,
      `${dep.slug}: host fora da CLDF (${u.hostname})`,
    );
    assert.notEqual(u.pathname, '/', `${dep.slug}: pathname raiz`);
  }
});

test('lote 3 exporta validador determinístico 21–24', () => {
  const fonte = readFileSafe(AUDIT_FILE);
  assert.match(
    fonte,
    /export function validarAuditoriaFotosDeputados21a24/,
    'validador do lote 3 ausente',
  );
  assert.match(
    fonte,
    /auditoriaFotosDeputadosDistritaisLote3/,
    'array do lote 3 ausente',
  );
});

test('lote 3 registra comprovação determinística (HTTP, MIME, dimensões) para cada item', () => {
  const fonte = readFileSafe(AUDIT_FILE);
  assert.match(
    fonte,
    /comprovacao:\s*\{/,
    'lote 3 deve registrar campo comprovacao',
  );
  assert.match(
    fonte,
    /httpStatus:\s*200/,
    'lote 3 deve registrar HTTP 200',
  );
  assert.match(
    fonte,
    /mime:\s*'image\/jpeg'/,
    'lote 3 deve registrar MIME image/jpeg',
  );
  assert.match(
    fonte,
    /largura:\s*\d+/,
    'lote 3 deve registrar largura',
  );
  assert.match(
    fonte,
    /altura:\s*\d+/,
    'lote 3 deve registrar altura',
  );
  assert.match(
    fonte,
    /COMPROVACAO_VERIFICADA_EM\s*=\s*'2026-07-30T23:16:00Z'/,
    'lote 3 deve registrar data/hora ISO 8601 da comprovação',
  );
});

test('lote 3 registra licencaReutilizacao como pendente (não comprovada)', () => {
  const fonte = readFileSafe(AUDIT_FILE);
  assert.match(
    fonte,
    /licencaReutilizacao:\s*'pendente'/,
    'lote 3 deve registrar licencaReutilizacao como pendente',
  );
  assert.doesNotMatch(
    fonte,
    /licencaReutilizacao:\s*'comprovada'/,
    'lote 3 não deve afirmar licencaReutilizacao comprovada',
  );
});

test('lote 3 documenta que licença de reutilização não foi comprovada', () => {
  const fonte = readFileSafe(AUDIT_FILE);
  assert.match(
    fonte,
    /Licença\/autorização de reutilização NÃO comprovada/,
    'lote 3 deve documentar honestamente que a licença de reutilização não foi comprovada',
  );
});
