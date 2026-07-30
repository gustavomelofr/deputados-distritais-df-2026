/* eslint-disable @typescript-eslint/no-require-imports */
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const { canonicalUrl, loadTsArray, validateElectoralData } = require('../scripts/validate-electoral-data');

const ROOT = path.join(__dirname, '..');

function evidence(overrides = {}) {
  return {
    id: 'ev-1', pessoaId: 'p-1', cargo: 'governador', estagio: 'anunciado_pelo_partido',
    fonte: 'Fonte', url: 'https://example.test/materia/', dataEvidencia: '2026-07-01',
    coletadaEm: '2026-07-02', verificadaEm: '2026-07-02', ...overrides,
  };
}

function person(overrides = {}) {
  return {
    id: 'p-1', slug: 'p-1', nome: 'Pessoa', cargo: 'governador', estagio: 'anunciado_pelo_partido',
    evidencias: [evidence()], noticiasRelacionadas: ['n1'], coletadaEm: '2026-07-02',
    verificadaEm: '2026-07-02', ...overrides,
  };
}

const news = [{ id: 'n1', url: 'https://example.test/materia', fonte: 'Fonte' }];

test('base eleitoral real possui relações determinísticas válidas', () => {
  const people = loadTsArray(path.join(ROOT, 'src/data/cenario-eleitoral.ts'), 'cenarioEleitoral');
  const realNews = loadTsArray(path.join(ROOT, 'src/data/noticias.ts'), 'noticias');
  assert.deepEqual(validateElectoralData(people, realNews), []);
});

test('detecta notícia inexistente e relação ausente para URL conhecida', () => {
  const missing = validateElectoralData([person({ noticiasRelacionadas: ['n404'] })], news, '2026-07-30');
  assert.ok(missing.some((error) => error.includes('notícia relacionada inexistente (n404)')));
  assert.ok(missing.some((error) => error.includes('URL corresponde a n1')));
});

test('normaliza barra final e bloqueia duplicata canônica na mesma pessoa', () => {
  assert.equal(canonicalUrl('https://example.test/materia/'), canonicalUrl('https://example.test/materia'));
  const duplicate = person({ evidencias: [evidence(), evidence({ id: 'ev-2', url: 'https://example.test/materia' })] });
  assert.ok(validateElectoralData([duplicate], news, '2026-07-30').some((error) => error.includes('URL canônica duplicada')));
});

test('permite que a mesma matéria sustente pessoas diferentes', () => {
  const second = person({
    id: 'p-2', slug: 'p-2',
    evidencias: [evidence({ id: 'ev-2', pessoaId: 'p-2', url: 'https://example.test/materia' })],
  });
  assert.deepEqual(validateElectoralData([person(), second], news, '2026-07-30'), []);
});

test('rejeita datas eleitorais inválidas ou futuras', () => {
  const invalid = person({
    evidencias: [evidence({ dataEvidencia: '2026-02-30', coletadaEm: 'amanhã', verificadaEm: '2026-08-01' })],
  });
  const errors = validateElectoralData([invalid], news, '2026-07-30');
  assert.ok(errors.some((error) => error.includes('data da evidência')));
  assert.ok(errors.some((error) => error.includes('data de coleta')));
  assert.ok(errors.some((error) => error.includes('data de verificação')));
});

test('rejeita IDs e URLs canônicas duplicadas na base de notícias', () => {
  const ambiguousNews = [
    ...news,
    { id: 'n1', url: 'https://example.test/outra', fonte: 'Outra' },
    { id: 'n2', url: 'https://example.test/materia/', fonte: 'Fonte' },
  ];
  const errors = validateElectoralData([person()], ambiguousNews, '2026-07-30');
  assert.ok(errors.some((error) => error.includes('ID ausente ou duplicado')));
  assert.ok(errors.some((error) => error.includes('URL canônica duplicada')));
});
