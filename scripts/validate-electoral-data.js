#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const SCENARIO_FILE = path.join(ROOT, 'src/data/cenario-eleitoral.ts');
const NEWS_FILE = path.join(ROOT, 'src/data/noticias.ts');
const VALID_CARGOS = new Set(['governador', 'vice_governador', 'senador', 'deputado_federal', 'deputado_distrital']);
const VALID_ESTAGIOS = new Set(['nome_monitorado', 'pre_candidatura_declarada', 'anunciado_pelo_partido', 'movimentacao_publica', 'registro_oficial']);

function loadTsArray(file, exportName) {
  const source = fs.readFileSync(file, 'utf8')
    .replace(/^import[^\n]+\n/gm, '')
    .replace(new RegExp(`export const ${exportName}\\s*:[^=]+=`), `globalThis.__${exportName} =`);
  const context = {};
  vm.runInNewContext(source, context, { filename: file, timeout: 1000 });
  return context[`__${exportName}`];
}

function canonicalUrl(value) {
  try {
    const url = new URL(value);
    url.hash = '';
    url.searchParams.sort();
    url.pathname = url.pathname.replace(/\/+$/, '') || '/';
    return url.toString();
  } catch {
    return value;
  }
}

function isSpecificUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !['', '/'].includes(url.pathname);
  } catch {
    return false;
  }
}

function isValidDate(value, today) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || value > today) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function validateElectoralData(people, news, today = new Date().toISOString().slice(0, 10)) {
  const errors = [];
  const personIds = new Set();
  const slugs = new Set();
  const evidenceIds = new Set();
  const newsIds = new Set();
  const newsUrls = new Set();
  for (const item of news) {
    if (!item.id || newsIds.has(item.id)) errors.push(`notícias: ID ausente ou duplicado (${item.id || '(sem id)'})`);
    newsIds.add(item.id);
    const canonical = canonicalUrl(item.url);
    if (newsUrls.has(canonical)) errors.push(`notícias: URL canônica duplicada (${item.url})`);
    newsUrls.add(canonical);
  }
  const newsById = new Map(news.map((item) => [item.id, item]));
  const newsByUrl = new Map(news.map((item) => [canonicalUrl(item.url), item.id]));

  for (const person of people) {
    const label = person.id || '(sem id)';
    if (!person.id || personIds.has(person.id)) errors.push(`${label}: ID de pessoa ausente ou duplicado`);
    personIds.add(person.id);
    if (!person.slug || slugs.has(person.slug)) errors.push(`${label}: slug ausente ou duplicado`);
    slugs.add(person.slug);
    if (!VALID_CARGOS.has(person.cargo)) errors.push(`${label}: cargo inválido (${person.cargo})`);
    if (!VALID_ESTAGIOS.has(person.estagio)) errors.push(`${label}: estágio inválido (${person.estagio})`);
    if (!isValidDate(person.coletadaEm, today) || !isValidDate(person.verificadaEm, today)) {
      errors.push(`${label}: datas de coleta/verificação ausentes ou futuras`);
    }

    const related = new Set(person.noticiasRelacionadas || []);
    if (related.size !== (person.noticiasRelacionadas || []).length) errors.push(`${label}: notícia relacionada duplicada`);
    for (const id of related) {
      if (!newsById.has(id)) errors.push(`${label}: notícia relacionada inexistente (${id})`);
    }

    const personUrls = new Set();
    for (const evidence of person.evidencias || []) {
      const evidenceLabel = `${label}/${evidence.id || '(sem id)'}`;
      if (!evidence.id || evidenceIds.has(evidence.id)) errors.push(`${evidenceLabel}: ID de evidência ausente ou duplicado`);
      evidenceIds.add(evidence.id);
      if (evidence.pessoaId !== person.id) errors.push(`${evidenceLabel}: pessoaId não corresponde à pessoa`);
      if (!VALID_CARGOS.has(evidence.cargo)) errors.push(`${evidenceLabel}: cargo inválido`);
      if (!VALID_ESTAGIOS.has(evidence.estagio)) errors.push(`${evidenceLabel}: estágio inválido`);
      if (!evidence.fonte?.trim()) errors.push(`${evidenceLabel}: fonte ausente`);
      if (!isSpecificUrl(evidence.url)) errors.push(`${evidenceLabel}: URL ausente, genérica ou não HTTPS`);
      if (!isValidDate(evidence.dataEvidencia, today)) errors.push(`${evidenceLabel}: data da evidência ausente, inválida ou futura`);
      if (!isValidDate(evidence.coletadaEm, today)) errors.push(`${evidenceLabel}: data de coleta ausente, inválida ou futura`);
      if (!isValidDate(evidence.verificadaEm, today)) errors.push(`${evidenceLabel}: data de verificação ausente, inválida ou futura`);

      const canonical = canonicalUrl(evidence.url);
      if (personUrls.has(canonical)) errors.push(`${evidenceLabel}: URL canônica duplicada para a mesma pessoa`);
      personUrls.add(canonical);
      const matchingNews = newsByUrl.get(canonical);
      if (matchingNews && !related.has(matchingNews)) {
        errors.push(`${evidenceLabel}: URL corresponde a ${matchingNews}, mas a notícia não está relacionada`);
      }
    }
    if (!(person.evidencias || []).length) errors.push(`${label}: pessoa sem evidência`);
    if (!(person.evidencias || []).some((evidence) => evidence.cargo === person.cargo)) {
      errors.push(`${label}: nenhuma evidência sustenta o cargo atual`);
    }
    if (!(person.evidencias || []).some((evidence) => evidence.estagio === person.estagio)) {
      errors.push(`${label}: nenhuma evidência sustenta o estágio atual`);
    }
  }
  return errors;
}

function buildEvidenceReport(people, news, errors = validateElectoralData(people, news)) {
  const newsIds = new Set(news.map((item) => item.id));
  const referenced = [...new Set(people.flatMap((person) => person.noticiasRelacionadas || []))].sort();
  return {
    valid: errors.length === 0,
    people: people.length,
    evidence: people.reduce((total, person) => total + (person.evidencias || []).length, 0),
    referencedNews: referenced.map((id) => ({ id, exists: newsIds.has(id) })),
    errors,
  };
}

function main() {
  const people = loadTsArray(SCENARIO_FILE, 'cenarioEleitoral');
  const news = loadTsArray(NEWS_FILE, 'noticias');
  const report = buildEvidenceReport(people, news);
  if (process.argv.includes('--json')) console.log(JSON.stringify(report, null, 2));
  else if (report.valid) console.log(`Validação eleitoral passou: ${report.people} pessoas, ${report.evidence} evidências e ${report.referencedNews.length} notícias relacionadas.`);
  else console.error(`Validação eleitoral falhou (${report.errors.length}):\n- ${report.errors.join('\n- ')}`);
  if (!report.valid) process.exitCode = 1;
}

if (require.main === module) main();

module.exports = { buildEvidenceReport, canonicalUrl, isSpecificUrl, isValidDate, loadTsArray, validateElectoralData };
