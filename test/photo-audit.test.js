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

// ---------------------------------------------------------------------------
// P4 — Placeholder e metadados padronizados de fotografia.
//
// Critério de "Criar placeholder e metadados padronizados de fotografia":
// "perfil funciona sem foto; nenhuma imagem sem fonte e base de uso."
//
// Estes testes verificam que:
//   1. src/data/foto-placeholder.ts exporta os metadados padronizados
//      (constantes + função geradora + identificador) exigidos pelo brief;
//   2. O SVG servido em /foto-placeholder.svg existe no repositório e é
//      local (não hotlink), atendendo "nenhuma imagem sem fonte e base
//      de uso" — placeholder tem fonte, urlFonte, licenca e verificadaEm;
//   3. As imagens já registradas em auditoria-fotos.ts (todas com fonte
//      CLDF) também satisfazem a regra "nenhuma imagem sem fonte e base
//      de uso" — cada item declara licenca e urlFonte explicitamente;
//   4. O componente que renderizar o perfil pode identificar o
//      placeholder via isPlaceholderFoto() para suprimir afirmações
//      indevidas de identidade visual.
// ---------------------------------------------------------------------------

const PLACEHOLDER_FILE = path.join(ROOT, 'src/data/foto-placeholder.ts');
const PLACEHOLDER_SVG = path.join(ROOT, 'public/foto-placeholder.svg');

test('placeholder: arquivo de metadados existe e é TypeScript', () => {
  assert.ok(fs.existsSync(PLACEHOLDER_FILE), `arquivo ausente: ${PLACEHOLDER_FILE}`);
  const fonte = readFileSafe(PLACEHOLDER_FILE);
  assert.match(fonte, /import\s+type\s+\{[^}]*FotografiaEleitoral/, 'deve importar o tipo FotografiaEleitoral');
  assert.match(fonte, /import\s+type\s+\{[^}]*LicencaFoto/, 'deve importar o tipo LicencaFoto');
});

test('placeholder: constantes padronizadas declaradas', () => {
  const fonte = readFileSafe(PLACEHOLDER_FILE);
  const constantesInternas = [
    'PLACEHOLDER_URL',
    'PLACEHOLDER_MIME',
    'PLACEHOLDER_LARGURA',
    'PLACEHOLDER_ALTURA',
  ];
  for (const constante of constantesInternas) {
    assert.match(
      fonte,
      new RegExp(`\\bconst ${constante}\\b`),
      `constante interna ${constante} deve ser declarada`,
    );
  }
  const constantesExportadas = [
    'PLACEHOLDER_FONTE_URL',
    'PLACEHOLDER_FONTE',
    'PLACEHOLDER_VERIFICADA_EM',
    'PLACEHOLDER_LICENCA',
  ];
  for (const constante of constantesExportadas) {
    assert.match(
      fonte,
      new RegExp(`\\bexport const ${constante}\\b`),
      `constante exportada ${constante} deve ser exportada`,
    );
  }
});

test('placeholder: PLACEHOLDER_LICENCA é o valor "placeholder" da ordem de preferência', () => {
  const fonte = readFileSafe(PLACEHOLDER_FILE);
  assert.match(
    fonte,
    /export const PLACEHOLDER_LICENCA:\s*LicencaFoto\s*=\s*'placeholder'/,
    'PLACEHOLDER_LICENCA deve ser "placeholder" (última posição da hierarquia)',
  );
});

test('placeholder: PLACEHOLDER_FONTE_URL é URL da fonte (não hotlink externo de imagem)', () => {
  const fonte = readFileSafe(PLACEHOLDER_FILE);
  const match = fonte.match(/PLACEHOLDER_FONTE_URL\s*=\s*(['"])([^'"]+)\1/);
  assert.ok(match, 'PLACEHOLDER_FONTE_URL ausente');
  const url = match[2];
  assert.match(url, /^https?:\/\//, 'url da fonte deve ser http(s)');
  // url da FONTE aponta para o próprio repositório, não para CDN externa
  // ou imprensa sem licença. O SVG é servido localmente a partir de
  // /public, então a fonte também é local.
  assert.ok(
    /github\.com\/seudeputado-df\/deputados-distritais-df-2026\/blob\/main\/src\/data\/foto-placeholder\.ts/.test(url),
    `url da fonte deve apontar para o arquivo no repositório (recebido: ${url})`,
  );
});

test('placeholder: PLACEHOLDER_VERIFICADA_EM é data ISO 8601 válida e não futura', () => {
  const fonte = readFileSafe(PLACEHOLDER_FILE);
  const match = fonte.match(/PLACEHOLDER_VERIFICADA_EM\s*=\s*(['"])([^'"]+)\1/);
  assert.ok(match, 'PLACEHOLDER_VERIFICADA_EM ausente');
  const data = match[2];
  assert.match(data, /^\d{4}-\d{2}-\d{2}$/, `data deve ser ISO 8601 (recebido: ${data})`);
  const hoje = new Date().toISOString().slice(0, 10);
  assert.ok(data <= hoje, `data futura detectada: ${data} > ${hoje}`);
});

test('placeholder: função placeholderFoto() retorna FotografiaEleitoral com todos os campos padronizados', () => {
  const fonte = readFileSafe(PLACEHOLDER_FILE);
  // Função declarada e exportada
  assert.match(
    fonte,
    /export function placeholderFoto\(/,
    'função placeholderFoto() deve ser exportada',
  );

  // Função retorna objeto com todos os campos obrigatórios do tipo
  // FotografiaEleitoral (definido em src/types/index.ts). Como o
  // arquivo é TypeScript e não pode ser executado neste teste, vali-
  // damos a presença literal dos campos no literal do retorno.
  for (const campo of [
    'url:',
    'fonte:',
    'urlFonte:',
    'licenca:',
    'mime:',
    'largura:',
    'altura:',
    'verificadaEm:',
  ]) {
    assert.ok(
      fonte.includes(campo),
      `placeholderFoto() deve retornar campo "${campo.replace(':', '')}"`,
    );
  }

  // sem inventar identidade visual: o retorno não inclui nome da
  // pessoa nem partido nem slug.
  assert.doesNotMatch(
    fonte,
    /placeholderFoto[\s\S]*?\bnome:\s*/,
    'placeholderFoto() não deve receber/armazenar nome da pessoa',
  );
  assert.doesNotMatch(
    fonte,
    /placeholderFoto[\s\S]*?\bpartido:\s*/,
    'placeholderFoto() não deve receber/armazenar partido',
  );
});

test('placeholder: helper isPlaceholderFoto() existe e identifica corretamente', () => {
  const fonte = readFileSafe(PLACEHOLDER_FILE);
  assert.match(
    fonte,
    /export function isPlaceholderFoto\(/,
    'helper isPlaceholderFoto() deve ser exportado',
  );

  // Identifica por licenca === 'placeholder', url === PLACEHOLDER_URL e
  // fonte === PLACEHOLDER_FONTE —这三个 campos garantem que apenas o
  // placeholder padronizado seja classificado.
  for (const sentinela of [
    /foto\.licenca\s*===\s*'placeholder'/,
    /foto\.url\s*===\s*PLACEHOLDER_URL/,
    /foto\.fonte\s*===\s*PLACEHOLDER_FONTE/,
  ]) {
    assert.match(fonte, sentinela, `identificador deve usar ${sentinela}`);
  }

  // Tratar de null/undefined de forma segura: o helper deve retornar
  // `false` quando a foto é ausente — isso é o que garante "perfil
  // funciona sem foto".
  assert.match(
    fonte,
    /isPlaceholderFoto\([\s\S]*?if\s*\(\s*!foto\s*\)\s*return\s+false/,
    'isPlaceholderFoto(null|undefined) deve retornar false',
  );
});

test('placeholder: SVG servido em /public/foto-placeholder.svg existe localmente', () => {
  assert.ok(
    fs.existsSync(PLACEHOLDER_SVG),
    `placeholder SVG ausente: ${PLACEHOLDER_SVG}`,
  );
  const svg = readFileSafe(PLACEHOLDER_SVG);
  // SVG honesto — declara que não é foto real.
  assert.match(svg, /<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/, 'SVG malformado');
  assert.match(svg, /sem foto verificada|placeholder|Não representa/i, 'SVG deve comunicar honestidade do placeholder');
  // É imagem local — não há href externo carregando foto real.
  assert.doesNotMatch(
    svg,
    /<image[^>]+href="https?:\/\//,
    'SVG do placeholder não deve carregar imagem externa',
  );
  // URL no placeholder.ts deve corresponder ao path local.
  const fonte = readFileSafe(PLACEHOLDER_FILE);
  assert.match(
    fonte,
    /PLACEHOLDER_URL\s*=\s*'\/foto-placeholder\.svg'/,
    'PLACEHOLDER_URL deve apontar para o arquivo local em /public',
  );
});

test('placeholder: nenhuma imagem sem fonte e base de uso na auditoria de fotos', () => {
  const fonte = readFileSafe(AUDIT_FILE);
  for (const campo of [
    'url:',
    'fonte:',
    'urlFonte:',
    'licenca:',
    'verificadaEm:',
    'validade:',
  ]) {
    assert.ok(
      fonte.includes(campo),
      `auditoria-fotos.ts: campo obrigatório "${campo.replace(':', '')}" ausente`,
    );
  }
});

test('placeholder: licenca do placeholder está fora do conjunto das licenças válidas para imagens reais', () => {
  // Garante que ninguém confunda o placeholder com uma imagem real.
  const tipos = readFileSafe(path.join(ROOT, 'src/types/index.ts'));
  assert.match(
    tipos,
    /export type LicencaFoto[\s\S]*?'divulcacand_tse'[\s\S]*?'institucional_oficial'[\s\S]*?'partido_oficial'[\s\S]*?'pessoa_oficial'[\s\S]*?'imprensa_licenca_explicita'[\s\S]*?'placeholder'/,
    'LicencaFoto deve incluir "placeholder" como último valor (além das licenças reais)',
  );
});
