#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const NEWS_FILE = path.join(ROOT, 'src/data/noticias.ts');
const DEPUTIES_FILE = path.join(ROOT, 'src/data/deputados.ts');
const MIGRATION_START = '2026-01-30';
const MIGRATION_END = '2026-07-30';

function loadNews(source = fs.readFileSync(NEWS_FILE, 'utf8')) {
  const executable = source
    .replace(/^import[^\n]+\n/m, '')
    .replace('export const noticias: Noticia[] =', 'globalThis.__noticias =');
  const context = {};
  vm.runInNewContext(executable, context, { filename: NEWS_FILE, timeout: 1000 });
  return context.__noticias;
}

function normalizeTitle(value) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\W+/g, ' ').trim();
}

function isSpecificUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.pathname !== '/' && url.pathname !== '';
  } catch {
    return false;
  }
}

function validateNews(news, deputySlugs, options = {}) {
  const expectedCount = options.expectedCount ?? 100;
  const start = options.start ?? MIGRATION_START;
  const end = options.end ?? MIGRATION_END;
  const errors = [];
  const ids = new Set();
  const urls = new Set();
  const titles = new Set();

  if (news.length !== expectedCount) errors.push(`esperadas ${expectedCount} notícias; encontradas ${news.length}`);
  for (const item of news) {
    const label = item.id || '(sem id)';
    if (!item.id || ids.has(item.id)) errors.push(`${label}: ID ausente ou duplicado`);
    ids.add(item.id);

    if (!item.fonte?.trim()) errors.push(`${label}: fonte ausente`);
    if (!isSpecificUrl(item.url)) errors.push(`${label}: URL ausente, genérica ou não HTTPS`);
    if (urls.has(item.url)) errors.push(`${label}: URL duplicada`);
    urls.add(item.url);

    const title = normalizeTitle(item.titulo || '');
    if (!title || titles.has(title)) errors.push(`${label}: título ausente ou duplicado`);
    titles.add(title);

    if (!/^\d{4}-\d{2}-\d{2}$/.test(item.data) || item.data < start || item.data > end) {
      errors.push(`${label}: data ${item.data || '(ausente)'} fora da janela ${start}..${end}`);
    }
    for (const slug of item.deputadosRelacionados || []) {
      if (!deputySlugs.has(slug)) errors.push(`${label}: deputado relacionado inexistente (${slug})`);
    }
  }
  return errors;
}

function main() {
  const news = loadNews();
  const deputiesSource = fs.readFileSync(DEPUTIES_FILE, 'utf8');
  const deputySlugs = new Set([...deputiesSource.matchAll(/\bslug:\s*['"]([^'"]+)['"]/g)].map((match) => match[1]));
  const errors = validateNews(news, deputySlugs);
  if (errors.length) {
    console.error(`Validação editorial falhou (${errors.length}):\n- ${errors.join('\n- ')}`);
    process.exitCode = 1;
    return;
  }
  console.log(`Validação editorial passou: ${news.length} notícias únicas e específicas na janela ${MIGRATION_START}..${MIGRATION_END}.`);
}

if (require.main === module) main();

module.exports = { isSpecificUrl, loadNews, normalizeTitle, validateNews };
