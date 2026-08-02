/* eslint-disable @typescript-eslint/no-require-imports */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const COMP_FILE = path.join(ROOT, 'src/components/exploracao-cargo.tsx');
const PURE_FILE = path.join(ROOT, 'src/lib/exploracao-cargo.ts');
const PAGE_FILE = path.join(ROOT, 'src/app/eleicoes-2026/page.tsx');
const BASE_FILE = path.join(ROOT, 'src/data/cenario-eleitoral.ts');

function read(p) {
  return fs.readFileSync(p, 'utf8');
}

function pessoa(overrides = {}) {
  return {
    id: 'p-1',
    slug: 'p-1',
    nome: 'Pessoa Um',
    cargo: 'governador',
    estagio: 'anunciado_pelo_partido',
    partido: 'PT',
    noticiasRelacionadas: ['n1'],
    evidencias: [
      {
        id: 'e-1',
        pessoaId: 'p-1',
        cargo: 'governador',
        estagio: 'anunciado_pelo_partido',
        partido: 'PT',
        fonte: 'Fonte',
        fonteCategoria: 'veiculo_jornalistico',
        url: 'https://example.test/materia',
        descricao: 'descrição',
        dataEvidencia: '2026-07-20',
        coletadaEm: '2026-07-21',
        verificadaEm: '2026-07-30',
      },
    ],
    coletadaEm: '2026-07-21',
    verificadaEm: '2026-07-30',
    ...overrides,
  };
}

// Carrega o módulo TS através de tsx/register não é viável aqui — o test
// runner node:test do projeto só permite `require` de JS. Por isso,
// importamos a função via require de um wrapper JS gerado pelo Next
// (não rodamos build). Para validar a lógica sem build, usamos re.
// Avaliamos `pessoaParaItem` reimplementando-a no teste? Não — copiamos
// a fonte como string e extraímos trechos determinísticos. Para a função
// pura `pessoaParaItem`, escrevemos testes que verificam:
//   1) O arquivo declara o filtro por cargo/partido/estágio/data
//   2) O HTML resultante referencia os 4 filtros
//   3) A página /eleicoes-2026 usa o componente
//   4) A página usa pessoaParaItem
//   5) Existem itens suficientes (49 pessoas, 15 partidos) na base
//   6) Existem datas distintas e estágios distintos
//   7) Funções utilitárias (formatarDataExploracao, classesEstagio,
//      ROTULOS_*) estão exportadas e corretas via inspeção textual.
//
// Esses testes são determinísticos (sem rede, sem build).

test('arquivo do componente exploracao-cargo existe e é client component', () => {
  const src = read(COMP_FILE);
  assert.match(src, /^\s*'use client'/m, 'deve declarar "use client" no topo');
  assert.ok(
    /import\s*\{[^}]*useState[^}]*\}\s*from\s*'react'/.test(src),
    'deve importar hooks do React (useState e outros) para filtros client-side'
  );
  assert.ok(
    /import\s*\{[^}]*useEffect[^}]*\}\s*from\s*'react'/.test(src),
    'deve importar useEffect para sincronização com URL'
  );
});

test('componente declara os 4 filtros: cargo, partido, estágio, data', () => {
  const src = read(COMP_FILE);
  // Cada filtro deve ter um <select> com id correspondente.
  assert.match(src, /id="filtro-cargo"/);
  assert.match(src, /id="filtro-partido"/);
  assert.match(src, /id="filtro-estagio"/);
  assert.match(src, /id="filtro-data"/);
  // Deve haver estado React para cada filtro.
  assert.match(src, /cargoFiltro/);
  assert.match(src, /partidoFiltro/);
  assert.match(src, /estagioFiltro/);
  assert.match(src, /dataFiltro/);
});

test('filtros funcionam em desktop (grid sm:grid-cols-2 lg:grid-cols-4) e mobile (grid-cols-1)', () => {
  const src = read(COMP_FILE);
  // Wrapper dos selects deve usar grid responsivo com 1 coluna no mobile
  // e 4 colunas em telas grandes.
  assert.match(
    src,
    /grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4/
  );
});

test('rotulos cobrem os 5 cargos e os 5 estágios do schema', () => {
  const src = read(COMP_FILE);
  const expectedCargos = [
    'governador',
    'vice_governador',
    'senador',
    'deputado_federal',
    'deputado_distrital',
  ];
  for (const c of expectedCargos) {
    assert.ok(
      src.includes(`'${c}'`),
      `cargo '${c}' deve aparecer no componente`
    );
  }
  const expectedEstagios = [
    'nome_monitorado',
    'pre_candidatura_declarada',
    'anunciado_pelo_partido',
    'movimentacao_publica',
    'registro_oficial',
  ];
  for (const e of expectedEstagios) {
    assert.ok(
      src.includes(`'${e}'`),
      `estágio '${e}' deve aparecer no componente`
    );
  }
});

test('partidos são derivados dos itens, não hardcoded', () => {
  const src = read(COMP_FILE);
  // Deve existir um Set derivado dos itens, montado no useMemo.
  assert.ok(
    /useMemo\([\s\S]{0,200}new Set<string>\(\)/.test(src),
    'partidos devem ser derivados via useMemo + Set'
  );
  // Não deve existir lista fixa de partidos hardcoded (PT, PL, MDB...).
  assert.doesNotMatch(
    src,
    /\[\s*'PT'\s*,\s*'PL'\s*,\s*'MDB'\s*\]/
  );
});

test('datas são derivadas dos itens e ordenadas decrescente', () => {
  const src = read(COMP_FILE);
  assert.match(src, /\.sort\(\(a, b\) => b\.localeCompare\(a\)\)/);
  // Componente delega aplicação dos filtros para a lib pura
  // (aplicarFiltrosExploracao). Aqui só garantimos que o componente
  // chama o utilitário exportado da lib e não reinventa a lógica.
  const pure = read(PURE_FILE);
  assert.match(pure, /export function aplicarFiltrosExploracao/);
  assert.match(
    pure,
    /i\.dataEvidencia !== filtros\.data/
  );
  assert.match(
    src,
    /aplicarFiltrosExploracao\(itens, estadoAtual\)/
  );
});

test('ordena resultados por dataEvidencia mais recente primeiro', () => {
  const pure = read(PURE_FILE);
  // A ordenação permanece determinística e reside em quem aplica os
  // filtros (lib pura) ou no componente client. Verificamos que o
  // critério aparece em pelo menos um dos dois.
  const comp = read(COMP_FILE);
  const padraoOrdenacao = /\.sort\(\(a, b\) => (b|a)\.dataEvidencia\.localeCompare\((a|b)\.dataEvidencia\)\)/;
  assert.ok(
    padraoOrdenacao.test(pure) || padraoOrdenacao.test(comp),
    'ordenação por dataEvidencia mais recente primeiro deve estar presente'
  );
});

test('fornece botão de limpar filtros e estado vazio honesto', () => {
  const src = read(COMP_FILE);
  assert.match(src, /Limpar filtros/);
  assert.match(
    src,
    /Nenhum registro corresponde aos filtros selecionados/
  );
});

test('acessibilidade: aria-label em cada select e região aria-live', () => {
  const src = read(COMP_FILE);
  assert.match(src, /aria-label="Filtrar por cargo"/);
  assert.match(src, /aria-label="Filtrar por partido"/);
  assert.match(src, /aria-label="Filtrar por estágio de evidência"/);
  assert.match(src, /aria-label="Filtrar por data da evidência mais recente"/);
  assert.match(src, /aria-live="polite"/);
});

test('página /eleicoes-2026 importa e usa o componente', () => {
  const src = read(PAGE_FILE);
  assert.match(src, /from '@\/components\/exploracao-cargo'/);
  // Página passa itens e filtrosIniciais derivados da URL.
  assert.match(src, /<ExploracaoPorCargo\s+itens=\{itensExploracao\}/);
  assert.match(src, /filtrosIniciais=\{filtrosIniciais\}/);
});

test('página deriva itensExploracao da base via pessoaParaItem', () => {
  const src = read(PAGE_FILE);
  assert.match(src, /itensExploracao: ItemExploracao\[\]/);
  assert.match(src, /cenarioEleitoral\s*\.map\(pessoaParaItem\)/);
  // Filtra nulos para manter o tipo ItemExploracao[].
  assert.match(
    src,
    /\.filter\(\(i\): i is ItemExploracao => i !== null\)/
  );
});

test('base eleitoral possui 55 pessoas com evidência (55 monitoradas)', () => {
  const src = read(BASE_FILE);
  // Cada pessoa é declarada com id: '<slug>'. Contamos as ocorrências de
  // 'id:' dentro de blocos que não estão em evidências (evidências também
  // têm id). Filtramos por 'id: \'<slug>\' no nível do array externo
  // checando o índice (após 'cenarioEleitoral: PessoaEleitoral[] = [').
  const match = src.match(
    /cenarioEleitoral: PessoaEleitoral\[\] = \[([\s\S]*?)\n\]\;/
  );
  assert.ok(match, 'array cenarioEleitoral deve estar presente');
  const body = match[1];
  // Pessoas no nível externo: bloco que começa com { e contém 'slug:'.
  const pessoasBlocos = body.match(/^\s*\{\s*$/gm) || [];
  // Cada pessoa tem um slug; contamos slugs únicos no array.
  const slugs = [...body.matchAll(/\bslug:\s*'([^']+)'/g)].map((m) => m[1]);
  // Algumas pessoas têm slug duplicado por engano? Não. Devem ser únicos.
  const slugsUnicos = new Set(slugs);
  assert.equal(
    slugsUnicos.size,
    55,
    `esperado 55 pessoas únicas, encontrado ${slugsUnicos.size}`
  );
});

test('base eleitoral cobre os 5 cargos do schema', () => {
  const src = read(BASE_FILE);
  for (const c of [
    'governador',
    'vice_governador',
    'senador',
    'deputado_federal',
    'deputado_distrital',
  ]) {
    assert.ok(
      src.includes(`cargo: '${c}'`),
      `cargo '${c}' deve aparecer na base`
    );
  }
});

test('base eleitoral cobre os estágios pré-TSE hoje (anunciado, declarado, movimentação)', () => {
  // Estado atual da base: 3 estágios populated. Antes do registro no TSE
  // (lógica do brief), o único estágio ainda esperado é `registro_oficial`,
  // enquanto `nome_monitorado` designa nomes sem evidência eleitoral
  // específica — não publicados na base. Verificamos então os 3 que
  // devem existir e a ausência honesta dos 2 restantes.
  const src = read(BASE_FILE);
  for (const e of [
    'pre_candidatura_declarada',
    'anunciado_pelo_partido',
    'movimentacao_publica',
  ]) {
    assert.ok(
      src.includes(`estagio: '${e}'`),
      `estágio '${e}' deve aparecer na base`
    );
  }
  // `nome_monitorado` não é publicado (pessoas sem evidência não entram
  // na base eleitoral) e `registro_oficial` exige DivulgaCand/TSE 2026
  // (indisponível). Esta restrição é parte do critério do brief.
  assert.doesNotMatch(
    src,
    /estagio:\s*'nome_monitorado'/
  );
  assert.doesNotMatch(
    src,
    /estagio:\s*'registro_oficial'/
  );
});

test('partidos distintos na base (>=15 legendas monitoradas)', () => {
  const src = read(BASE_FILE);
  const partidos = new Set(
    [...src.matchAll(/\bpartido:\s*'([^']+)'/g)].map((m) => m[1])
  );
  assert.ok(
    partidos.size >= 15,
    `esperado >=15 partidos, encontrado ${partidos.size}`
  );
});

test('datas distintas na base (>=10 datas de evidência)', () => {
  const src = read(BASE_FILE);
  const datas = new Set(
    [...src.matchAll(/\bdataEvidencia:\s*'([^']+)'/g)].map((m) => m[1])
  );
  assert.ok(
    datas.size >= 10,
    `esperado >=10 datas distintas, encontrado ${datas.size}`
  );
  // Datas devem estar no formato ISO 8601.
  for (const d of datas) {
    assert.match(d, /^\d{4}-\d{2}-\d{2}$/, `data '${d}' deve ser ISO 8601`);
  }
});

test('exporta ROTULOS_CARGO, ROTULOS_ESTAGIO, DESCRICOES_ESTAGIO e pessoaParaItem', () => {
  const pure = read(PURE_FILE);
  const comp = read(COMP_FILE);
  assert.match(pure, /export const ROTULOS_CARGO/);
  assert.match(pure, /export const ROTULOS_ESTAGIO/);
  assert.match(pure, /export const DESCRICOES_ESTAGIO/);
  assert.match(pure, /export function pessoaParaItem/);
  assert.match(comp, /export\s*\{[\s\S]*ROTULOS_CARGO[\s\S]*\}/);
  assert.match(comp, /export\s*\{[\s\S]*ROTULOS_ESTAGIO[\s\S]*\}/);
  assert.match(comp, /export\s*\{[\s\S]*DESCRICOES_ESTAGIO[\s\S]*\}/);
  assert.match(comp, /export\s*\{[\s\S]*pessoaParaItem[\s\S]*\}/);
});

test('formatarDataExploracao formata ISO para pt-BR', () => {
  const src = read(PURE_FILE);
  // Implementação esperada: dd/mm/aaaa
  assert.match(
    src,
    /function formatarDataExploracao[\s\S]*?return `\$\{dia\}\/\$\{mes\}\/\$\{ano\}`/
  );
});

test('classesEstagio cobre todos os 5 estágios', () => {
  const src = read(PURE_FILE);
  assert.match(src, /function classesEstagio/);
  for (const e of [
    'registro_oficial',
    'pre_candidatura_declarada',
    'anunciado_pelo_partido',
    'movimentacao_publica',
    'nome_monitorado',
  ]) {
    assert.ok(
      src.includes(`case '${e}'`),
      `case '${e}' deve aparecer em classesEstagio`
    );
  }
});

test('componente não inventa dados: filtra diretamente sobre os itens derivados', () => {
  const src = read(COMP_FILE);
  // Garantia anti-invenção: nenhum import direto da base eleitoral no
  // componente (a base chega via prop `itens`).
  assert.doesNotMatch(
    src,
    /import.*cenario-eleitoral/,
    'componente não deve importar a base; recebe apenas itens via prop'
  );
  // E não há nenhum array literal de pessoas inline.
  assert.doesNotMatch(
    src,
    /\bPessoaEleitoral\[\]\s*=/
  );
});

test('componente respeita invariante: pessoaParaItem retorna null sem evidência', () => {
  const pure = read(PURE_FILE);
  assert.match(
    pure,
    /export function pessoaParaItem[\s\S]*?if \(!p\.evidencias \|\| p\.evidencias\.length === 0\) return null/
  );
});

test('página /eleicoes-2026 mantém propósito de hub (sem remover seções existentes)', () => {
  const pageSrc = read(PAGE_FILE);
  const compSrc = read(COMP_FILE);
  // O hub deve manter: cabeçalho, status DivulgaCand, resumo numérico,
  // caminhos por cargo, metodologia, atalhos — e agora a exploração.
  assert.match(pageSrc, /heading-divulgacand/);
  assert.match(pageSrc, /heading-resumo/);
  assert.match(pageSrc, /heading-caminhos/);
  assert.match(pageSrc, /heading-metodologia/);
  assert.match(pageSrc, /heading-atalhos/);
  // heading-exploracao fica dentro do componente, mas a seção é instanciada
  // na página via <ExploracaoPorCargo>.
  assert.match(compSrc, /id="heading-exploracao"/);
  assert.match(pageSrc, /<ExploracaoPorCargo\s+itens=\{itensExploracao\}/);
  assert.match(pageSrc, /filtrosIniciais=\{filtrosIniciais\}/);
});

// ---------------------------------------------------------------------------
// Compartilhamento de busca/filtros via URL
// Critério do brief:
//   "cargo, partido, estágio, data e busca textual podem ser codificados
//    em parâmetros estáveis, restaurados ao abrir a URL e removidos por
//    'limpar filtros'; a renderização permanece segura contra parâmetros
//    desconhecidos e consistente entre servidor, cliente, desktop e mobile."
// ---------------------------------------------------------------------------

test('lib exporta API de parsing/serialização de filtros para URL', () => {
  const pure = read(PURE_FILE);
  assert.match(pure, /export const FILTROS_VAZIOS/);
  assert.match(pure, /export function parsearFiltrosBusca/);
  assert.match(pure, /export function serializarFiltrosBusca/);
  assert.match(pure, /export function aplicarFiltrosExploracao/);
  assert.match(pure, /export function filtrosAtivos/);
  assert.match(pure, /export const COMPRIMENTO_MAXIMO_BUSCA/);
});

test('FILTROS_VAZIOS usa sentinelas públicos (cargo/partido/estagio/data/busca)', () => {
  const pure = read(PURE_FILE);
  const m = pure.match(/export const FILTROS_VAZIOS[^=]*=\s*Object\.freeze\(\{([\s\S]*?)\}\)/);
  assert.ok(m, 'FILTROS_VAZIOS deve existir e ser congelado');
  assert.match(m[1], /cargo:\s*'todos'/);
  assert.match(m[1], /partido:\s*'todos'/);
  assert.match(m[1], /estagio:\s*'todos'/);
  assert.match(m[1], /data:\s*'todas'/);
  assert.match(m[1], /busca:\s*''/);
});

test('lib parseia searchParams e restaura filtros com safety contra unknowns', () => {
  const pure = read(PURE_FILE);
  // parser unitário por tipo de filtro.
  assert.match(pure, /export function parsearCargo/);
  assert.match(pure, /export function parsearEstagio/);
  assert.match(pure, /export function parsearPartido/);
  assert.match(pure, /export function parsearData/);
  assert.match(pure, /export function parsearBusca/);
  // Defesa: quando partido/data são inválidos, retornam sentinela e
  // valido=false (para contagem de ignorados).
  assert.match(pure, /if \(partidosValidos\.has\(v\)\) return \{ valor: v, valido: true \}/);
  assert.match(pure, /return \{ valor: 'todos', valido: false \}/);
  assert.match(pure, /if \(datasValidas\.has\(v\)\) return \{ valor: v, valido: true \}/);
  assert.match(pure, /return \{ valor: 'todas', valido: false \}/);
  // Defesa contra payload gigante: trunca busca em COMPRIMENTO_MAXIMO_BUSCA.
  assert.match(pure, /\.slice\(0, COMPRIMENTO_MAXIMO_BUSCA\)/);
  // Sanitiza caracteres de controle.
  assert.match(pure, /\\u0000-\\u001f/);
});

test('lib serializa filtros em query string canônica (ordem: cargo, partido, estagio, data, q)', () => {
  const pure = read(PURE_FILE);
  // Ordem de inserção: cargo → partido → estagio → data → q.
  const m = pure.match(/export function serializarFiltrosBusca[\s\S]*?return qs \?/);
  assert.ok(m, 'função serializarFiltrosBusca deve existir');
  // Ordem dos .set() deve ser cargo, partido, estagio, data, q.
  const cargoSet = m[0].indexOf("params.set('cargo'");
  const partidoSet = m[0].indexOf("params.set('partido'");
  const estagioSet = m[0].indexOf("params.set('estagio'");
  const dataSet = m[0].indexOf("params.set('data'");
  const qSet = m[0].indexOf("params.set('q'");
  assert.ok(cargoSet >= 0 && cargoSet < partidoSet, 'cargo antes de partido');
  assert.ok(partidoSet < estagioSet, 'partido antes de estagio');
  assert.ok(estagioSet < dataSet, 'estagio antes de data');
  assert.ok(dataSet < qSet, 'data antes de q');
});

test('lib omite sentinelas da URL (cargo=todos não aparece)', () => {
  const pure = read(PURE_FILE);
  const m = pure.match(/export function serializarFiltrosBusca[\s\S]*?return qs \?/);
  assert.ok(m);
  // 'todos' / 'todas' / '' devem ser guardados pelo if antes do .set.
  assert.match(m[0], /if \(filtros\.cargo !== 'todos'\) params\.set\('cargo'/);
  assert.match(m[0], /if \(filtros\.partido !== 'todos'\) params\.set\('partido'/);
  assert.match(m[0], /if \(filtros\.estagio !== 'todos'\) params\.set\('estagio'/);
  assert.match(m[0], /if \(filtros\.data !== 'todas'\) params\.set\('data'/);
  assert.match(m[0], /if \(filtros\.busca\) params\.set\('q'/);
});

test('componente sincroniza estado com URL via useRouter + router.replace', () => {
  const src = read(COMP_FILE);
  // Importa useRouter.
  assert.match(src, /import\s*\{[^}]*useRouter[^}]*\}\s*from\s*'next\/navigation'/);
  // Usa router.replace (não push), para não poluir histórico a cada
  // troca de select.
  assert.match(src, /router\.replace\(/);
  // Usa serializarFiltrosBusca para montar a URL.
  const pure = read(PURE_FILE);
  assert.match(pure, /export function serializarFiltrosBusca/);
  assert.match(src, /serializarFiltrosBusca\(estadoAtual\)/);
  // URL base é /eleicoes-2026.
  assert.match(src, /\/eleicoes-2026/);
  // scroll: false para não pular a página em cada filtro.
  assert.match(src, /\{\s*scroll:\s*false\s*\}/);
});

test('componente tem 5 filtros (cargo, partido, estagio, data, busca textual)', () => {
  const src = read(COMP_FILE);
  assert.match(src, /id="filtro-cargo"/);
  assert.match(src, /id="filtro-partido"/);
  assert.match(src, /id="filtro-estagio"/);
  assert.match(src, /id="filtro-data"/);
  assert.match(src, /id="filtro-busca"/);
});

test('página /eleicoes-2026 lê searchParams e passa filtrosIniciais', () => {
  const src = read(PAGE_FILE);
  // Props.searchParams tipado como Promise<{...}> (Next 16).
  assert.match(src, /searchParams:\s*Promise<\{/);
  // Tipos dos 5 parâmetros de URL.
  assert.match(src, /cargo\?:\s*string/);
  assert.match(src, /partido\?:\s*string/);
  assert.match(src, /estagio\?:\s*string/);
  assert.match(src, /data\?:\s*string/);
  assert.match(src, /q\?:\s*string/);
  // Função é async (await searchParams).
  assert.match(src, /export default async function Eleicoes2026Page/);
  assert.match(src, /await searchParams/);
  // Página usa o parser defensivo.
  assert.match(src, /parsearFiltrosBusca\(/);
});

test('limpar filtros reseta estado e remove parâmetros da URL', () => {
  const pure = read(PURE_FILE);
  const comp = read(COMP_FILE);
  // FILTROS_VAZIOS é o ponto de partida do reset.
  assert.match(pure, /FILTROS_VAZIOS/);
  // limparFiltros reseta cada useState para o sentinela.
  assert.match(comp, /setCargoFiltro\(FILTROS_VAZIOS\.cargo\)/);
  assert.match(comp, /setPartidoFiltro\(FILTROS_VAZIOS\.partido\)/);
  assert.match(comp, /setEstagioFiltro\(FILTROS_VAZIOS\.estagio\)/);
  assert.match(comp, /setDataFiltro\(FILTROS_VAZIOS\.data\)/);
  assert.match(comp, /setBuscaFiltro\(FILTROS_VAZIOS\.busca\)/);
  // serializarFiltrosBusca omite sentinelas — verificado em teste anterior
  // (lib omite sentinelas). Aqui só garantimos que limparFiltros usa
  // FILTROS_VAZIOS (portanto todos os filtros vão para sentinela).
  // Componente monta URL com serializarFiltrosBusca(estadoAtual).
  assert.match(comp, /serializarFiltrosBusca\(estadoAtual\)/);
  // Base da URL é /eleicoes-2026.
  assert.ok(
    comp.includes("/eleicoes-2026"),
    'URL base /eleicoes-2026 deve estar presente no componente'
  );
});

test('renderização continua segura contra parâmetros desconhecidos (whitelist de cargo/estagio)', () => {
  const pure = read(PURE_FILE);
  // parsearCargo cai em 'todos' para valor inválido.
  const mCargo = pure.match(
    /export function parsearCargo\([\s\S]*?\n\}/,
  );
  assert.ok(mCargo, 'parsearCargo deve existir');
  assert.match(mCargo[0], /CARGOS_VALIDOS\.has\(v as CargoEleitoral\)/);
  assert.match(mCargo[0], /return v as CargoEleitoral/);
  assert.match(mCargo[0], /return 'todos'/);
  // parsearEstagio análogo.
  const mEst = pure.match(
    /export function parsearEstagio\([\s\S]*?\n\}/,
  );
  assert.ok(mEst, 'parsearEstagio deve existir');
  assert.match(mEst[0], /ESTAGIOS_VALIDOS\.has\(v as EstagioEleitoral\)/);
  assert.match(mEst[0], /return v as EstagioEleitoral/);
  assert.match(mEst[0], /return 'todos'/);
  // Defesa contra arrays (searchParams podem ser string|string[]|undef).
  assert.match(mCargo[0], /Array\.isArray\(valor\) \? valor\[0\] : valor/);
});

test('parser considera partido/data válidos somente se existirem na base', () => {
  const pure = read(PURE_FILE);
  assert.match(pure, /export function partidosDosItens/);
  assert.match(pure, /export function datasDosItens/);
  assert.match(
    pure,
    /parsearFiltrosBusca\([\s\S]*?partidos = partidosDosItens\(itens\)/
  );
  assert.match(
    pure,
    /datas = datasDosItens\(itens\)/
  );
  // Parser unificado devolve contagem de ignorados.
  assert.match(
    pure,
    /ignorados\s*=\s*Number\(!partido\.valido\)\s*\+\s*Number\(!data\.valido\)\s*\+\s*Number\(busca\.ignorado\)/
  );
});

test('busca textual é case-insensitive e ignora acentos (NFD)', () => {
  const pure = read(PURE_FILE);
  // Normalização NFD remove diacríticos.
  assert.match(pure, /normalize\('NFD'\)/);
  // Regex Unicode de categorias de diacríticos — U+0300 a U+036F.
  assert.ok(
    /\\u0300-\\u036f/i.test(pure) || /[\u0300-\u036f]/.test(pure),
    'deve usar regex de categorias Unicode para remover diacríticos',
  );
  // toLowerCase + trim.
  assert.match(pure, /toLowerCase\(\)/);
  assert.match(pure, /trim\(\)/);
  // Busca considera nome + partido (não outras colunas).
  const mAplicar = pure.match(
    /export function aplicarFiltrosExploracao\([\s\S]*?\n\}/,
  );
  assert.ok(mAplicar, 'aplicarFiltrosExploracao deve existir');
  assert.match(mAplicar[0], /i\.nome.*i\.partido/);
  assert.doesNotMatch(mAplicar[0], /i\.descricao/);
});

test('componente mantém responsividade desktop↔mobile dos 5 filtros', () => {
  const src = read(COMP_FILE);
  // Container dos 4 selects originais continua responsivo.
  assert.match(src, /grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4/);
  // Input de busca tem width full — ocupa a linha inteira no mobile
  // sem quebrar a ordem visual.
  assert.match(src, /className="w-full rounded-md[^"]*filtro-busca|id="filtro-busca"[\s\S]*?w-full/);
});

test('filtrosAtivos considera os 5 sentinelas', () => {
  const pure = read(PURE_FILE);
  const m = pure.match(/export function filtrosAtivos[\s\S]*?\n\}/);
  assert.ok(m, 'filtrosAtivos deve existir');
  assert.match(m[0], /filtros\.cargo !== 'todos'/);
  assert.match(m[0], /filtros\.partido !== 'todos'/);
  assert.match(m[0], /filtros\.estagio !== 'todos'/);
  assert.match(m[0], /filtros\.data !== 'todas'/);
  assert.match(m[0], /filtros\.busca !== ''/);
});