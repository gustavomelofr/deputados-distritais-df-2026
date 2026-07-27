/* eslint-disable @typescript-eslint/no-require-imports */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const {
  createPullRequest,
  deliverPullRequest,
  hasPendingBacklog,
  isTransientError,
  pendingBacklogItems,
  runWithRetry,
} = require('../loop-runner');

const delivery = {
  branch: 'loop/test-run',
  title: 'Loop test',
  body: 'Test body',
};

test('detecta somente itens pendentes na fila priorizada', () => {
  const content = `
- [ ] Fora da fila
## Fila de melhorias priorizada
- [x] Concluído
- [ ] Primeiro pendente
- [ ] Segundo pendente
`;
  assert.deepEqual(pendingBacklogItems(content), ['Primeiro pendente', 'Segundo pendente']);
});

test('fila concluída não possui itens pendentes', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'loop-backlog-'));
  const file = path.join(dir, 'AGENT_BRIEF.md');
  fs.writeFileSync(file, '## Fila de melhorias priorizada\n- [x] Concluído\n');
  assert.equal(hasPendingBacklog(file), false);
  fs.rmSync(dir, { recursive: true, force: true });
});

test('falha fechada quando a seção da fila não existe', () => {
  assert.throws(() => pendingBacklogItems('- [ ] tarefa solta'), /não encontrada/);
});

test('repete erros transitórios sem consumir o resultado final', () => {
  let calls = 0;
  const waits = [];
  const result = runWithRetry(() => {
    calls += 1;
    if (calls < 3) throw new Error('HTTP 503 Service Unavailable');
    return 'ok';
  }, { delays: [10, 20], sleepFn: (ms) => waits.push(ms) });
  assert.equal(result, 'ok');
  assert.equal(calls, 3);
  assert.deepEqual(waits, [10, 20]);
});

test('não repete erro permanente', () => {
  let calls = 0;
  assert.throws(() => runWithRetry(() => {
    calls += 1;
    throw new Error('validation failed');
  }, { delays: [0, 0], sleepFn: () => {} }), /validation failed/);
  assert.equal(calls, 1);
  assert.equal(isTransientError(new Error('litellm.APIConnectionError: terminated')), true);
});

test('reutiliza PR aberto e não cria duplicado', () => {
  const calls = [];
  const command = (_bin, args) => {
    calls.push(args);
    if (args[0] === 'pr' && args[1] === 'list') {
      return '[{"url":"https://github.com/example/repo/pull/7"}]';
    }
    throw new Error('não deveria criar PR');
  };
  assert.equal(createPullRequest(delivery, '/tmp', command), 'https://github.com/example/repo/pull/7');
  assert.equal(calls.length, 1);
});

test('recupera PR criado quando a resposta da CLI se perde', () => {
  let listCalls = 0;
  const command = (_bin, args) => {
    if (args[0] === 'pr' && args[1] === 'list') {
      listCalls += 1;
      return listCalls === 1 ? '[]' : '[{"url":"https://github.com/example/repo/pull/8"}]';
    }
    if (args[0] === 'pr' && args[1] === 'create') {
      throw new Error('GraphQL: Something went wrong');
    }
    throw new Error(`comando inesperado: ${args.join(' ')}`);
  };
  const noRetry = (action) => action();
  assert.equal(createPullRequest(delivery, '/tmp', command, noRetry), 'https://github.com/example/repo/pull/8');
});

test('usa REST quando gh pr create falha', () => {
  const command = (_bin, args) => {
    if (args[0] === 'pr' && args[1] === 'list') return '[]';
    if (args[0] === 'pr' && args[1] === 'create') throw new Error('GraphQL indisponível');
    if (args[0] === 'api') return 'https://github.com/example/repo/pull/9\n';
    throw new Error(`comando inesperado: ${args.join(' ')}`);
  };
  const noRetry = (action) => action();
  assert.equal(createPullRequest(delivery, '/tmp', command, noRetry), 'https://github.com/example/repo/pull/9');
});

test('entrega ativa auto-merge após localizar o PR', () => {
  let mergedUrl = null;
  const command = (_bin, args) => {
    if (args[0] === 'pr' && args[1] === 'list') {
      return '[{"url":"https://github.com/example/repo/pull/10"}]';
    }
    if (args[0] === 'pr' && args[1] === 'merge') {
      mergedUrl = args[2];
      return '';
    }
    throw new Error(`comando inesperado: ${args.join(' ')}`);
  };
  const noRetry = (action) => action();
  assert.equal(deliverPullRequest(delivery, '/tmp', command, noRetry), 'https://github.com/example/repo/pull/10');
  assert.equal(mergedUrl, 'https://github.com/example/repo/pull/10');
});
