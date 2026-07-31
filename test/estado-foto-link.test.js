/* eslint-disable @typescript-eslint/no-require-imports */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const PURE_FILE = path.join(ROOT, 'src/lib/perfil-eleitoral.ts');
const EXPLORACAO_LIB_FILE = path.join(ROOT, 'src/lib/exploracao-cargo.ts');
const COMP_FILE = path.join(ROOT, 'src/components/exploracao-cargo.tsx');
const AUDIT_FOTO_FILE = path.join(ROOT, 'src/data/auditoria-fotos.ts');
const CENARIO_FILE = path.join(ROOT, 'src/data/cenario-eleitoral.ts');

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

// ---------------------------------------------------------------------------
// Validação determinística específica da modelagem de FotoPerfil.validade
// e do estado 'pendente' em estadoFotoParaPerfil.
//
// Feedback aplicado (segundo parágrafo da tarefa "Explicitar o estado de
// fotos e links oficiais"):
//   1. Modelar a validade da foto no FotoPerfil;
//   2. Fazer estadoFotoParaPerfil retornar 'pendente' quando houver
//      pendente_verificacao_externa;
//   3. Aplicar os estados de foto e links também aos cards eleitorais
//      pertinentes (ExploracaoPorCargo);
//   4. Adicionar validação determinística específica sem alterar testes
//      operacionais protegidos.
//
// Estes testes NÃO tocam em suites protegidas (perfil-eleitoral.test.js,
// exploracao-cargo.test.js, cenario-2026.test.js, instagram-catalog,
// photo-audit, news-data, electoral-data, loop-runner, site-nav,
// vinculos-eleitorais, vinculos-hub, comparar-eleitoral). Eles apenas
// adicionam nova cobertura determinística para o comportamento novo.
// ---------------------------------------------------------------------------

test('FotoPerfil declara campo validade tipado como ValidadeFoto', () => {
  const src = read(PURE_FILE);
  assert.match(src, /interface FotoPerfil/, 'FotoPerfil deve existir');
  // O campo validade deve aparecer dentro do bloco da interface.
  const bloco = src.split('interface FotoPerfil')[1].split(/\n\}/)[0];
  assert.match(
    bloco,
    /validade:\s*ValidadeFoto/,
    'FotoPerfil.validade deve ser do tipo ValidadeFoto',
  );
});

test('ValidadeFoto (importado de auditoria-fotos) cobre os 3 valores canônicos', () => {
  const src = read(AUDIT_FOTO_FILE);
  assert.match(
    src,
    /export type ValidadeFoto\s*=\s*'valida'\s*\|\s*'invalida'\s*\|\s*'pendente_verificacao_externa'/,
    'ValidadeFoto deve manter os 3 valores canônicos (valida/invalida/pendente_verificacao_externa)',
  );
});

test('fotoParaPerfil retorna validade pendente_verificacao_externa no placeholder', () => {
  const src = read(PURE_FILE);
  // A função fotoParaPerfil deve declarar validade: 'pendente_verificacao_externa'.
  const funcao = src.split('export function fotoParaPerfil')[1];
  assert.match(
    funcao,
    /validade:\s*'pendente_verificacao_externa'/,
    'fotoParaPerfil deve retornar validade pendente_verificacao_externa (placeholder honesto)',
  );
});

test('estadoFotoParaPerfil retorna pendente quando validade é pendente_verificacao_externa', () => {
  const src = read(PURE_FILE);
  const funcao = src.split('export function estadoFotoParaPerfil')[1];
  // A primeira verificação de `validade === 'pendente_verificacao_externa'`
  // deve ocorrer antes da verificação de placeholder/licenca.
  const idxValidade = funcao.indexOf(
    "foto.validade === 'pendente_verificacao_externa'",
  );
  const idxPlaceholder = funcao.indexOf(
    "foto.placeholder || foto.licenca === 'placeholder'",
  );
  assert.ok(idxValidade >= 0, 'função deve testar validade === pendente_verificacao_externa');
  assert.ok(idxPlaceholder >= 0, 'função deve manter o ramo de placeholder/licenca');
  assert.ok(
    idxValidade < idxPlaceholder,
    'validade pendente_verificacao_externa deve prevalecer sobre placeholder/licenca',
  );
  // Cada ramo retorna exatamente o literal esperado.
  assert.match(funcao, /return 'pendente'/);
  assert.match(funcao, /return 'placeholder'/);
  assert.match(funcao, /return 'licenciada'/);
});

test('estadoFotoParaPerfil mantém os 3 estados canônicos (licenciada/placeholder/pendente)', () => {
  const src = read(PURE_FILE);
  // Os 3 literais devem aparecer como retorno da função.
  const funcao = src.split('export function estadoFotoParaPerfil')[1];
  assert.match(funcao, /return 'licenciada'/);
  assert.match(funcao, /return 'placeholder'/);
  assert.match(funcao, /return 'pendente'/);
  // Tipo EstadoFoto exportado com os 3 valores.
  assert.match(
    src,
    /export type EstadoFoto\s*=\s*'licenciada'\s*\|\s*'placeholder'\s*\|\s*'pendente'/,
  );
});

test('ItemExploracao adiciona estadoFoto e estadoLinkOficial', () => {
  const src = read(EXPLORACAO_LIB_FILE);
  const bloco = src.split('export interface ItemExploracao')[1].split(/\n\}/)[0];
  assert.match(bloco, /estadoFoto:\s*EstadoFoto/);
  assert.match(bloco, /estadoLinkOficial:\s*EstadoLinkOficial/);
});

test('pessoaParaItem deriva estadoFoto de fotoParaPerfil + estadoFotoParaPerfil', () => {
  const src = read(EXPLORACAO_LIB_FILE);
  const funcao = src.split('export function pessoaParaItem')[1];
  assert.match(funcao, /fotoParaPerfil\(p\)/);
  assert.match(funcao, /estadoFotoParaPerfil\(foto\)/);
  assert.match(funcao, /estadoFoto,\s*\n\s*estadoLinkOficial/);
});

test('pessoaParaItem deriva estadoLinkOficial de linksOficiaisParaPerfil', () => {
  const src = read(EXPLORACAO_LIB_FILE);
  const funcao = src.split('export function pessoaParaItem')[1];
  assert.match(funcao, /linksOficiaisParaPerfil\(p,\s*\[\]\)/);
  assert.match(funcao, /estadoLinkOficialParaPerfil/);
  // Sem links → estado honesto 'desconhecido' (não inventa URL).
  assert.match(funcao, /'desconhecido'/);
});

test('ExploracaoPorCargo renderiza badges de estado de foto e link em cada card', () => {
  const src = read(COMP_FILE);
  // Badges de estado — devem aparecer tanto visualmente (texto) quanto
  // nos data-attributes (data-estado-foto / data-estado-link) para
  // facilitar a leitura programática.
  assert.match(src, /data-estado-foto=/);
  assert.match(src, /data-estado-link=/);
  // Rótulos humanos das 3 classes Tailwind distintas.
  assert.match(src, /classesEstadoFoto\(item\.estadoFoto\)/);
  assert.match(src, /classesEstadoLinkOficial\(item\.estadoLinkOficial\)/);
  assert.match(src, /rotuloEstadoFoto\(item\.estadoFoto\)/);
  assert.match(src, /rotuloEstadoLinkOficial\(item\.estadoLinkOficial\)/);
  // Acessibilidade — aria-label descritivo para cada badge.
  assert.match(src, /aria-label=\{`Estado da foto: \$\{rotuloEstadoFoto/);
  assert.match(
    src,
    /aria-label=\{`Estado do link oficial: \$\{rotuloEstadoLinkOficial/,
  );
});

test('classesEstadoFoto cobre os 3 estados (licenciada/placeholder/pendente) com cores distintas', () => {
  const src = read(PURE_FILE);
  const funcao = src.split('export function classesEstadoFoto')[1];
  // Três ramos de switch.
  assert.match(funcao, /case 'licenciada'/);
  assert.match(funcao, /case 'placeholder'/);
  assert.match(funcao, /case 'pendente'/);
  // Três classes Tailwind distintas (sem colisão de cor).
  assert.match(funcao, /bg-green-100 text-green-800/);
  assert.match(funcao, /bg-zinc-200 text-zinc-700/);
  assert.match(funcao, /bg-amber-100 text-amber-800/);
});

test('classesEstadoLinkOficial cobre os 3 estados (confirmado/declaracao/desconhecido)', () => {
  const src = read(PURE_FILE);
  const funcao = src.split('export function classesEstadoLinkOficial')[1];
  assert.match(funcao, /case 'confirmado_institucional'/);
  assert.match(funcao, /case 'declaracao_publica'/);
  assert.match(funcao, /case 'desconhecido'/);
  assert.match(funcao, /bg-green-100 text-green-800/);
  assert.match(funcao, /bg-blue-100 text-blue-800/);
  assert.match(funcao, /bg-zinc-200 text-zinc-700/);
});

test('rotuloEstadoFoto usa texto humano-legível (não sigla)', () => {
  const src = read(PURE_FILE);
  const funcao = src.split('export function rotuloEstadoFoto')[1];
  assert.match(funcao, /case 'licenciada'[\s\S]*?Foto licenciada/);
  assert.match(funcao, /case 'placeholder'[\s\S]*?Placeholder honesto/);
  assert.match(
    funcao,
    /case 'pendente'[\s\S]*?Foto pendente de verificação externa/,
  );
});

test('rotuloEstadoLinkOficial usa texto humano-legível', () => {
  const src = read(PURE_FILE);
  const funcao = src.split('export function rotuloEstadoLinkOficial')[1];
  assert.match(
    funcao,
    /case 'confirmado_institucional'[\s\S]*?Link oficial confirmado em fonte institucional/,
  );
  assert.match(
    funcao,
    /case 'declaracao_publica'[\s\S]*?Link registrado em declaração pública/,
  );
  assert.match(
    funcao,
    /case 'desconhecido'[\s\S]*?Fonte do link não classificada/,
  );
});

test('base eleitoral cobre os 5 cargos do schema (consistência com ItemExploracao)', () => {
  const src = read(CENARIO_FILE);
  for (const c of [
    'governador',
    'vice_governador',
    'senador',
    'deputado_federal',
    'deputado_distrital',
  ]) {
    assert.ok(
      src.includes(`cargo: '${c}'`),
      `cargo '${c}' deve aparecer na base`,
    );
  }
});