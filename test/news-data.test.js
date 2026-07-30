/* eslint-disable @typescript-eslint/no-require-imports */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { loadNews, validateNews } = require('../scripts/validate-news-data');

test('base da migração possui 100 notícias editoriais válidas', () => {
  const deputies = fs.readFileSync(path.join(__dirname, '..', 'src/data/deputados.ts'), 'utf8');
  const slugs = new Set([...deputies.matchAll(/\bslug:\s*['"]([^'"]+)['"]/g)].map((match) => match[1]));
  assert.deepEqual(validateNews(loadNews(), slugs), []);
});
