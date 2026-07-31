/* eslint-disable @typescript-eslint/no-require-imports */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const HUB_FILE = path.join(ROOT, 'src/lib/vinculos-hub.ts');
const HUB_PAGE_FILE = path.join(ROOT, 'src/app/eleicoes-2026/page.tsx');
const PERFIL_PAGE_FILE = path.join(
  ROOT,
  'src/app/perfil-eleitoral/[slug]/page.tsx',
);
const VINCULOS_DATA_FILE = path.join(
  ROOT,
  'src/data/vinculos-eleitorais.ts',
);
const CENARIO_DATA_FILE = path.join(ROOT, 'src/data/cenario-eleitoral.ts');
const TYPES_FILE = path.join(ROOT, 'src/types/index.ts');

function read(p) {
  return fs.readFileSync(p, 'utf8');
}

// ---------------------------------------------------------------------------
// src/lib/vinculos-hub.ts — API pública
// ---------------------------------------------------------------------------

test('lib/vinculos-hub.ts existe e exporta API pública', () => {
  const src = read(HUB_FILE);
  assert.match(src, /export function rotuloTipoVinculo/);
  assert.match(src, /export function rotuloStatusVinculo/);
  assert.match(src, /export function classesStatusVinculo/);
  assert.match(src, /export function classesTipoVinculo/);
  assert.match(src, /export function statusIndicamConflito/);
  assert.match(src, /export function statusIndicamConfirmacao/);
  assert.match(src, /export function formatarDataVinculo/);
  assert.match(src, /export function itemVinculoDeVinculo/);
  assert.match(src, /export function vinculosParaHub/);
  assert.match(src, /export function vinculosParaPessoa/);
  assert.match(src, /export function agruparDivergencias/);
  assert.match(src, /export function totalDivergencias/);
});

test('rotuloTipoVinculo cobre os 5 tipos do schema', () => {
  const src = read(HUB_FILE);
  for (const t of [
    'chapa',
    'apoio',
    'federacao',
    'coligacao',
    'frente',
  ]) {
    assert.ok(
      src.includes(`case '${t}'`),
      `case '${t}' deve aparecer em rotuloTipoVinculo`,
    );
  }
});

test('rotuloStatusVinculo cobre os 5 status do schema', () => {
  const src = read(HUB_FILE);
  for (const s of [
    'anunciado',
    'ratificado',
    'contestado',
    'divergente',
    'encerrado',
  ]) {
    assert.ok(
      src.includes(`case '${s}'`),
      `case '${s}' deve aparecer em rotuloStatusVinculo`,
    );
  }
});

test('classesStatusVinculo diferencia confirmação de divergência (cores distintas)', () => {
  const src = read(HUB_FILE);
  assert.match(src, /bg-green-100 text-green-700/);
  assert.match(src, /bg-blue-100 text-blue-700/);
  assert.match(src, /bg-orange-100 text-orange-800/);
  assert.match(src, /bg-amber-100 text-amber-800/);
  assert.match(src, /bg-zinc-200 text-zinc-700/);
});

test('statusIndicamConflito retorna true apenas para contestado/divergente', () => {
  const src = read(HUB_FILE);
  const fn = src.split('export function statusIndicamConflito')[1];
  assert.match(fn, /'contestado'/);
  assert.match(fn, /'divergente'/);
  assert.match(fn, /return status === 'contestado' \|\| status === 'divergente'/);
});

test('statusIndicamConfirmacao retorna true apenas para anunciado/ratificado', () => {
  const src = read(HUB_FILE);
  const fn = src.split('export function statusIndicamConfirmacao')[1];
  assert.match(fn, /'anunciado'/);
  assert.match(fn, /'ratificado'/);
  assert.match(fn, /return status === 'anunciado' \|\| status === 'ratificado'/);
});

test('formatarDataVinculo formata ISO 8601 em dd/mm/aaaa', () => {
  const src = read(HUB_FILE);
  assert.match(
    src,
    /export function formatarDataVinculo[\s\S]*?return `\$\{m\[3\]\}\/\$\{m\[2\]\}\/\$\{m\[1\]\}`/,
  );
});

test('vinculosParaHub descarta vínculos com referência quebrada (defesa)', () => {
  const src = read(HUB_FILE);
  // Quando pessoa referenciada não existe em cenarioEleitoral, retorna null
  // em vez de inventar nome.
  assert.match(src, /if \(!pessoa\) \{[\s\S]*?return null/);
});

test('agruparDivergencias preserva versões conflitantes no mesmo grupo', () => {
  const src = read(HUB_FILE);
  // O grupoDivergencia une versões conflitantes; vínculos isolados ficam
  // em grupos unitários para tratamento uniforme.
  assert.match(src, /grupos\.set\(item\.grupoDivergencia, lista\)/);
  assert.match(src, /resultado\.push\(\{ grupoId, versoes \}\)/);
});

test('totalDivergencias conta apenas grupos com mais de uma versão', () => {
  const src = read(HUB_FILE);
  const fn = src.split('export function totalDivergencias')[1];
  assert.match(fn, /if \(n > 1\) total \+= 1/);
});

// ---------------------------------------------------------------------------
// Integração na página hub /eleicoes-2026
// ---------------------------------------------------------------------------

test('página hub /eleicoes-2026 importa a lógica de vínculos', () => {
  const src = read(HUB_PAGE_FILE);
  assert.match(src, /from '@\/lib\/vinculos-hub'/);
  assert.match(src, /vinculosParaHub/);
  assert.match(src, /agruparDivergencias/);
  assert.match(src, /totalDivergencias/);
});

test('página hub importa a base de vínculos e a base eleitoral', () => {
  const src = read(HUB_PAGE_FILE);
  assert.match(src, /from '@\/data\/vinculos-eleitorais'/);
  assert.match(src, /vinculosEleitorais/);
  assert.match(src, /from '@\/data\/cenario-eleitoral'/);
});

test('página hub renderiza seção "Chapas, vínculos e divergências"', () => {
  const src = read(HUB_PAGE_FILE);
  assert.match(src, /Chapas, vínculos e divergências/);
  assert.match(src, /heading-vinculos/);
  assert.match(src, /aria-labelledby="heading-vinculos"/);
});

test('página hub mostra fonte, URL e categoria da fonte de cada vínculo', () => {
  const src = read(HUB_PAGE_FILE);
  assert.match(src, /rotuloFonteCategoria\(item\.fonteCategoria\)/);
  assert.match(src, /href=\{item\.url\}/);
  assert.match(src, /target="_blank"/);
});

test('página hub mostra data início/fim e datas separadas', () => {
  const src = read(HUB_PAGE_FILE);
  assert.match(src, /formatarDataVinculo\(item\.inicioEm\)/);
  assert.match(src, /formatarDataVinculo\(item\.verificadaEm\)/);
  assert.match(src, /item\.fimEm/);
});

test('página hub diferencia confirmação de divergência (badge + classe)', () => {
  const src = read(HUB_PAGE_FILE);
  assert.match(src, /classesStatusVinculo\([\s\S]*?item\.status[\s\S]*?\)/);
  assert.match(src, /statusIndicamConflito\([\s\S]*?item\.status[\s\S]*?\)/);
  assert.match(src, /Versões divergentes preservadas/);
});

test('página hub tem estado vazio honesto quando não há vínculos', () => {
  const src = read(HUB_PAGE_FILE);
  assert.match(src, /vinculosHub\.length === 0/);
  assert.match(src, /Nenhuma chapa, aliança ou divergência verificável/);
});

test('página hub é server component (sem "use client")', () => {
  const src = read(HUB_PAGE_FILE);
  assert.doesNotMatch(src, /^\s*'use client'/m);
});

test('página hub lista pessoas do vínculo com papel', () => {
  const src = read(HUB_PAGE_FILE);
  assert.match(src, /listaPessoas\(item\.pessoas\)/);
});

// ---------------------------------------------------------------------------
// Integração na página de perfil /perfil-eleitoral/[slug]
// ---------------------------------------------------------------------------

test('página de perfil importa a lógica de vínculos e a base', () => {
  const src = read(PERFIL_PAGE_FILE);
  assert.match(src, /from '@\/lib\/vinculos-hub'/);
  assert.match(src, /from '@\/data\/vinculos-eleitorais'/);
  assert.match(src, /from '@\/data\/cenario-eleitoral'/);
  assert.match(src, /vinculosParaPessoa/);
});

test('página de perfil chama vinculosParaPessoa com pessoa.id', () => {
  const src = read(PERFIL_PAGE_FILE);
  assert.match(src, /vinculosParaPessoa\(\s*pessoa\.id\s*,/);
});

test('página de perfil renderiza seção "Chapas, vínculos e divergências"', () => {
  const src = read(PERFIL_PAGE_FILE);
  assert.match(src, /Chapas, vínculos e divergências/);
  assert.match(src, /titulo-vinculos/);
  assert.match(src, /aria-labelledby="titulo-vinculos"/);
});

test('página de perfil destaca papel da pessoa monitorada no vínculo', () => {
  const src = read(PERFIL_PAGE_FILE);
  assert.match(src, /p\.id === pessoa\.id/);
  assert.match(src, /\$\{p\.nome\} \(\$\{p\.papel\}\)/);
});

test('página de perfil exibe fonte, URL e categoria da fonte', () => {
  const src = read(PERFIL_PAGE_FILE);
  assert.match(src, /href=\{v\.url\}/);
  assert.match(src, /target="_blank"/);
  assert.match(src, /rotuloFonteCategoria\(v\.fonteCategoria\)/);
});

test('página de perfil mostra datas inicioEm/fimEm/verificadaEm', () => {
  const src = read(PERFIL_PAGE_FILE);
  assert.match(src, /formatarDataVinculo\(v\.inicioEm\)/);
  assert.match(src, /formatarDataVinculo\(v\.verificadaEm\)/);
  assert.match(src, /v\.fimEm/);
});

test('página de perfil diferencia confirmação de divergência (badge + nota)', () => {
  const src = read(PERFIL_PAGE_FILE);
  assert.match(src, /classesStatusVinculo\([\s\S]*?v\.status[\s\S]*?\)/);
  assert.match(src, /statusIndicamConflito\([\s\S]*?v\.status[\s\S]*?\)/);
  assert.match(src, /versão[\s\S]*?divergente[\s\S]*?preservada/);
  assert.match(src, /Esta versão está em conflito/);
});

test('página de perfil tem estado vazio honesto quando pessoa sem vínculo', () => {
  const src = read(PERFIL_PAGE_FILE);
  assert.match(src, /vinculosPessoa\.length === 0/);
  assert.match(src, /Nenhuma chapa, aliança ou divergência verificável para esta pessoa/);
});

test('página de perfil preserva navegação acessível (voltar para hub)', () => {
  const src = read(PERFIL_PAGE_FILE);
  assert.match(src, /href="\/eleicoes-2026"/);
});

// ---------------------------------------------------------------------------
// Compatibilidade com a base existente
// ---------------------------------------------------------------------------

test('schema VinculoEleitoral preserva tipos usados por vinculos-hub', () => {
  const src = read(TYPES_FILE);
  assert.match(src, /export type TipoVinculoEleitoral/);
  assert.match(src, /export type StatusVinculoEleitoral/);
  assert.match(src, /export interface VinculoEleitoral/);
  assert.match(src, /grupoDivergencia\?:\s*string/);
});

test('base de vínculos é consumida apenas como fonte de verdade', () => {
  const data = read(VINCULOS_DATA_FILE);
  const cenario = read(CENARIO_DATA_FILE);
  // Confirma que os arquivos existem e o hub referencia ambos.
  assert.ok(data.includes('export const vinculosEleitorais'));
  assert.ok(cenario.includes('export const cenarioEleitoral'));
});
