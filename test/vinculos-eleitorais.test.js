/* eslint-disable @typescript-eslint/no-require-imports */
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');

const { loadTsArray, canonicalUrl } = require('../scripts/validate-electoral-data');

const ROOT = path.join(__dirname, '..');
const VINCULOS_FILE = path.join(ROOT, 'src/data/vinculos-eleitorais.ts');
const CENARIO_FILE = path.join(ROOT, 'src/data/cenario-eleitoral.ts');
const TYPES_FILE = path.join(ROOT, 'src/types/index.ts');

const TODAY = '2026-07-30';

function loadVinculos() {
  return loadTsArray(VINCULOS_FILE, 'vinculosEleitorais');
}

// ---------------------------------------------------------------------------
// Tipos em src/types/index.ts
// ---------------------------------------------------------------------------

test('tipos de vínculo eleitoral estão declarados em src/types/index.ts', () => {
  const src = fs.readFileSync(TYPES_FILE, 'utf8');
  assert.match(src, /export type TipoVinculoEleitoral/);
  assert.match(src, /export type StatusVinculoEleitoral/);
  assert.match(src, /export type PapelVinculoEleitoral/);
  assert.match(src, /export interface ParticipacaoVinculo/);
  assert.match(src, /export interface VinculoEleitoral/);

  // Tipos cobrem os 5 formatos esperados (chapa, apoio, federacao, coligacao,
  // frente) e os 5 estados documentais do anúncio.
  assert.match(src, /'chapa'/);
  assert.match(src, /'apoio'/);
  assert.match(src, /'federacao'/);
  assert.match(src, /'coligacao'/);
  assert.match(src, /'frente'/);
  assert.match(src, /'anunciado'/);
  assert.match(src, /'ratificado'/);
  assert.match(src, /'contestado'/);
  assert.match(src, /'divergente'/);
  assert.match(src, /'encerrado'/);
});

test('VinculoEleitoral referencia pessoas com papel, fonte, URL e datas separadas', () => {
  const src = fs.readFileSync(TYPES_FILE, 'utf8');
  // Pessoas vinculadas com papel (sem inferir vínculo sem fonte).
  assert.match(src, /pessoas:\s*ParticipacaoVinculo\[\]/);
  assert.match(src, /papel:\s*PapelVinculoEleitoral/);
  // Fonte obrigatória.
  assert.match(src, /fonte:\s*string/);
  assert.match(src, /fonteCategoria:\s*CategoriaFonte/);
  assert.match(src, /url:\s*string/);
  // Datas separadas (coletadaEm + verificadaEm) — coerentes com o resto.
  assert.match(src, /coletadaEm:\s*string/);
  assert.match(src, /verificadaEm:\s*string/);
  // Período com inicioEm e fimEm opcional.
  assert.match(src, /inicioEm:\s*string/);
  assert.match(src, /fimEm\?:\s*string/);
  // Evidência relacionada opcional + notícias relacionadas.
  assert.match(src, /evidenciaApoioId\?:\s*string/);
  assert.match(src, /noticiasRelacionadas:\s*string\[\]/);
});

// ---------------------------------------------------------------------------
// Carregamento e sanidade da base
// ---------------------------------------------------------------------------

test('base de vínculos carrega como array não vazio', () => {
  const vinculos = loadVinculos();
  assert.ok(Array.isArray(vinculos), 'deve ser array');
  assert.ok(vinculos.length > 0, 'deve haver ao menos um vínculo');
});

test('IDs de vínculo são únicos', () => {
  const vinculos = loadVinculos();
  const ids = new Set();
  for (const v of vinculos) {
    assert.ok(v.id && v.id.trim() !== '', `id ausente em ${JSON.stringify(v)}`);
    assert.ok(!ids.has(v.id), `id duplicado: ${v.id}`);
    ids.add(v.id);
  }
});

test('pessoas referenciadas existem em cenarioEleitoral', () => {
  const vinculos = loadVinculos();
  const cenario = loadTsArray(CENARIO_FILE, 'cenarioEleitoral');
  const pessoas = new Set(cenario.map((p) => p.id));
  for (const v of vinculos) {
    for (const p of v.pessoas) {
      assert.ok(pessoas.has(p.pessoaId), `pessoa ${p.pessoaId} do vínculo ${v.id} não existe em cenarioEleitoral`);
    }
  }
});

test('evidências de apoio referenciadas existem na base eleitoral', () => {
  const vinculos = loadVinculos();
  const cenario = loadTsArray(CENARIO_FILE, 'cenarioEleitoral');
  const evidenciaIds = new Set();
  for (const pessoa of cenario) {
    for (const ev of pessoa.evidencias || []) evidenciaIds.add(ev.id);
  }
  for (const v of vinculos) {
    if (!v.evidenciaApoioId) continue;
    assert.ok(
      evidenciaIds.has(v.evidenciaApoioId),
      `evidência ${v.evidenciaApoioId} do vínculo ${v.id} não existe em cenarioEleitoral`,
    );
  }
});

test('tipo, status e papéis usam somente os literais do schema', () => {
  const vinculos = loadVinculos();
  const tipos = new Set(['chapa', 'apoio', 'federacao', 'coligacao', 'frente']);
  const status = new Set(['anunciado', 'ratificado', 'contestado', 'divergente', 'encerrado']);
  const papeis = new Set(['titular', 'vice', 'apoiador', 'integrante', 'indicado', 'mencionado']);
  for (const v of vinculos) {
    assert.ok(tipos.has(v.tipo), `tipo inválido em ${v.id}: ${v.tipo}`);
    assert.ok(status.has(v.status), `status inválido em ${v.id}: ${v.status}`);
    assert.ok(v.pessoas.length > 0, `vínculo ${v.id} sem pessoas`);
    for (const p of v.pessoas) {
      assert.ok(papeis.has(p.papel), `papel inválido em ${v.id}: ${p.papel}`);
    }
  }
});

test('URL do vínculo é específica, HTTPS e nunca homepage', () => {
  const vinculos = loadVinculos();
  for (const v of vinculos) {
    assert.ok(v.url && /^https?:\/\//.test(v.url), `URL ausente em ${v.id}`);
    let parsed;
    try {
      parsed = new URL(v.url);
    } catch {
      assert.fail(`URL inválida em ${v.id}: ${v.url}`);
    }
    assert.equal(parsed.protocol, 'https:', `URL não-HTTPS em ${v.id}: ${v.url}`);
    const path = parsed.pathname.replace(/\/+$/, '');
    assert.ok(path !== '' && path !== '/', `homepage em ${v.id}: ${v.url}`);
  }
});

test('datas inicioEm/fimEm são ISO 8601 válidas e não futuras; coletadaEm/verificadaEm idem', () => {
  const vinculos = loadVinculos();
  const dateRe = /^\d{4}-\d{2}-\d{2}$/;
  function isValid(s) {
    if (!dateRe.test(s)) return false;
    const parsed = new Date(`${s}T00:00:00Z`);
    return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === s;
  }
  for (const v of vinculos) {
    assert.ok(isValid(v.inicioEm), `inicioEm inválida em ${v.id}: ${v.inicioEm}`);
    assert.ok(!isValid(v.inicioEm) || v.inicioEm <= TODAY, `inicioEm futura em ${v.id}: ${v.inicioEm}`);
    assert.ok(isValid(v.coletadaEm), `coletadaEm inválida em ${v.id}: ${v.coletadaEm}`);
    assert.ok(v.coletadaEm <= TODAY, `coletadaEm futura em ${v.id}: ${v.coletadaEm}`);
    assert.ok(isValid(v.verificadaEm), `verificadaEm inválida em ${v.id}: ${v.verificadaEm}`);
    assert.ok(v.verificadaEm <= TODAY, `verificadaEm futura em ${v.id}: ${v.verificadaEm}`);
    if (v.fimEm) {
      assert.ok(isValid(v.fimEm), `fimEm inválida em ${v.id}: ${v.fimEm}`);
      assert.ok(v.fimEm >= v.inicioEm, `fimEm antes de inicioEm em ${v.id}`);
      assert.ok(v.fimEm <= TODAY, `fimEm futura em ${v.id}: ${v.fimEm}`);
    }
  }
});

test('cargos usam somente os literais do schema e o vínculo cobre ao menos um cargo', () => {
  const vinculos = loadVinculos();
  const cargos = new Set(['governador', 'vice_governador', 'senador', 'deputado_federal', 'deputado_distrital']);
  for (const v of vinculos) {
    assert.ok(Array.isArray(v.cargos) && v.cargos.length > 0, `vínculo ${v.id} sem cargos`);
    for (const cargo of v.cargos) {
      assert.ok(cargos.has(cargo), `cargo inválido em ${v.id}: ${cargo}`);
    }
  }
});

test('descrição, fonte e fonteCategoria são preenchidos e não vazios', () => {
  const vinculos = loadVinculos();
  for (const v of vinculos) {
    assert.ok(v.fonte && v.fonte.trim() !== '', `fonte ausente em ${v.id}`);
    assert.ok(v.fonteCategoria, `fonteCategoria ausente em ${v.id}`);
    assert.ok(v.descricao && v.descricao.trim() !== '', `descricao ausente em ${v.id}`);
  }
});

test('não transforma anúncio em registro oficial (sem uso de "candidato oficial" nem equivalência com DivulgaCand)', () => {
  const vinculos = loadVinculos();
  for (const v of vinculos) {
    assert.notEqual(v.status, 'registro_oficial');
    const lower = (v.descricao || '').toLowerCase();
    assert.ok(!lower.includes('candidato oficial'), `${v.id} qualifica como candidato oficial`);
    assert.ok(!lower.includes('registrado no tse'), `${v.id} afirma registro oficial no TSE`);
  }
});

test('URLs canônicas dos vínculos não colidem com as mesmas pessoas em vínculos diferentes', () => {
  const vinculos = loadVinculos();
  const porPapel = new Map();
  for (const v of vinculos) {
    for (const p of v.pessoas) {
      const chave = p.pessoaId;
      const canon = canonicalUrl(v.url);
      const chaveCompleta = `${chave}::${p.papel}`;
      if (!porPapel.has(chaveCompleta)) porPapel.set(chaveCompleta, []);
      porPapel.get(chaveCompleta).push({ vinculoId: v.id, url: canon });
    }
  }
  // Duas chapas GDF/Vice idênticas no mesmo papel não podem coexistir com a
  // mesma URL canônica — isso indicaria duplicação.
  for (const [chave, lista] of porPapel) {
    const urls = new Set(lista.map((x) => x.url));
    assert.equal(
      urls.size,
      lista.length,
      `pessoa+papel ${chave} aparece em múltiplos vínculos com a mesma URL canônica`,
    );
  }
});

test('divergência "vice-leandro-grass" preserva duas versões distintas (Dora Gomes e Tetê Monteiro)', () => {
  const vinculos = loadVinculos();
  const grupo = vinculos.filter((v) => v.grupoDivergencia === 'vice-leandro-grass');
  assert.equal(grupo.length, 2, 'espera-se exatamente duas versões conflitantes');
  const pessoasVice = grupo.flatMap((v) => v.pessoas.filter((p) => p.papel === 'vice').map((p) => p.pessoaId));
  assert.deepEqual(new Set(pessoasVice), new Set(['dora-gomes', 'tete-monteiro']));
  const statuses = new Set(grupo.map((v) => v.status));
  assert.ok(statuses.has('contestado') || statuses.has('divergente'),
    'ao menos uma versão deve usar status documental de conflito');
  // Versões têm URLs distintas — caso contrário não são versões, são duplicata.
  const urls = new Set(grupo.map((v) => canonicalUrl(v.url)));
  assert.equal(urls.size, 2, 'as versões devem ter URLs distintas');
});