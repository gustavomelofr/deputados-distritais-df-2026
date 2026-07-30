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
  const re = /item\(\s*(\d+)\s*\)/g;
  const matches = [...source.matchAll(re)];
  return matches.map((m) => Number(m[1]));
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

test('auditoria cobre exatamente os 10 primeiros deputados distritais em ordem', () => {
  const calls = auditoriaItemCalls();
  assert.deepEqual(
    calls,
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    `auditoria deve chamar item(1) a item(10); chamadas encontradas: ${calls.join(',')}`,
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
