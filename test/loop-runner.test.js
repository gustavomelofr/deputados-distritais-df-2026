/* eslint-disable @typescript-eslint/no-require-imports */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const {
  compactSummary,
  classifyPullRequest,
  createPullRequest,
  deliverPullRequest,
  extractReview,
  failureState,
  findOpenTaskPullRequest,
  hasPendingBacklog,
  isCapacityError,
  isTransientError,
  parseLoopResult,
  pendingBacklogItems,
  recurringTasks,
  runWithRetry,
  selectTask,
  telegramMessage,
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

test('ignora itens concluídos e bloqueados na seleção da fila', () => {
  const content = `## Fila de melhorias priorizada
- [x] concluído
- [!] bloqueado
- [ ] elegível

## Rotinas recorrentes
`;
  assert.deepEqual(pendingBacklogItems(content), ['elegível']);
  assert.equal(selectTask(content, {}).title, 'elegível');
});

test('interpreta rotina recorrente e respeita frequência', () => {
  const content = `## Fila de melhorias priorizada
- [x] concluído

## Rotinas recorrentes
- [r] noticias-eleitorais: Notícias eleitorais recentes
  Frequência: 24h
  Limite por ciclo: 10
  Instrução: buscar notícias verificadas.
  Critério: sem novidade, retornar NO_CHANGE.
`;
  const [routine] = recurringTasks(content);
  assert.equal(routine.id, 'noticias-eleitorais');
  assert.equal(routine.limit, 10);
  assert.equal(selectTask(content, {}, Date.parse('2026-07-27T12:00:00Z')).id, routine.id);
  const ledger = { recurring: { [routine.id]: { lastRunAt: '2026-07-27T11:00:00Z' } } };
  assert.equal(selectTask(content, ledger, Date.parse('2026-07-27T12:00:00Z')), null);
  assert.equal(selectTask(content, ledger, Date.parse('2026-07-28T12:00:00Z')).id, routine.id);
});

test('brief real possui próxima tarefa e três rotinas diárias válidas', () => {
  const content = fs.readFileSync(path.join(__dirname, '..', 'AGENT_BRIEF.md'), 'utf8');
  assert.equal(pendingBacklogItems(content)[0], 'Mapear nomes para governador e vice-governador do DF.');
  const routines = recurringTasks(content);
  assert.equal(routines.length, 3);
  assert.ok(routines.every((routine) => routine.intervalMs === 24 * 60 * 60 * 1000));
  assert.ok(routines.every((routine) => routine.limit === 10));
});

test('interpreta NO_CHANGE e bloqueio com ação humana', () => {
  assert.deepEqual(parseLoopResult('LOOP_RESULT: NO_CHANGE — nenhuma notícia nova'), {
    status: 'NO_CHANGE', reason: 'nenhuma notícia nova', humanAction: null,
  });
  assert.deepEqual(parseLoopResult('LOOP_RESULT: BLOCKED — licença ausente\nHUMAN_ACTION: fornecer autorização'), {
    status: 'BLOCKED', reason: 'licença ausente', humanAction: 'fornecer autorização',
  });
});

test('extrai resumo e quantidade do verifier', () => {
  const review = extractReview('{"verdict":"APPROVE","reason":"válido","summary":"8 notícias adicionadas.","records_changed":8,"next_prompt":null}');
  assert.equal(review.summary, '8 notícias adicionadas.');
  assert.equal(review.records_changed, 8);
});

test('formata mensagem curta do Telegram com resumo', () => {
  const message = telegramMessage({
    icon: '✅', title: 'Ciclo concluído', task: 'Notícias eleitorais',
    summary: '8 notícias adicionadas com fonte e data.', lines: ['PR: https://example.test/1'],
  });
  assert.match(message, /Resumo: 8 notícias adicionadas/);
  assert.match(message, /Tarefa: Notícias eleitorais/);
  assert.ok(compactSummary('x'.repeat(500)).length <= 320);
  assert.ok(message.length < 3900);
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

test('abre circuit breaker após três falhas ou imediatamente sem créditos', () => {
  assert.deepEqual(failureState(0, new Error('validation failed')), { count: 1, circuitOpen: false });
  assert.deepEqual(failureState(2, new Error('validation failed')), { count: 3, circuitOpen: true });
  assert.deepEqual(failureState(0, new Error('Not Enough Credits')), { count: 1, circuitOpen: true });
  assert.equal(isCapacityError(new Error('insufficient quota')), true);
});

test('classifica PR somente como concluído depois do merge', () => {
  assert.equal(classifyPullRequest({ state: 'OPEN', statusCheckRollup: [] }), 'pending');
  assert.equal(classifyPullRequest({ state: 'MERGED', statusCheckRollup: [] }), 'merged');
  assert.equal(classifyPullRequest({
    state: 'OPEN', statusCheckRollup: [{ conclusion: 'FAILURE' }],
  }), 'failed');
  assert.equal(classifyPullRequest({
    state: 'OPEN', statusCheckRollup: [{ state: 'FAILURE' }],
  }), 'failed');
  assert.equal(classifyPullRequest({ state: 'CLOSED', statusCheckRollup: [] }), 'failed');
});

test('localiza PR aberto pelo ID semântico da tarefa', () => {
  const taskSpec = { id: 'backlog:Tarefa única', title: 'Tarefa única' };
  const marker = encodeURIComponent(taskSpec.id);
  const command = (_bin, args) => {
    assert.deepEqual(args.slice(0, 4), ['pr', 'list', '--repo', 'gustavomelofr/deputados-distritais-df-2026']);
    return JSON.stringify([
      { url: 'https://github.com/example/repo/pull/11', body: '<!-- loop-task-id: outra -->', headRefName: 'loop/other' },
      { url: 'https://github.com/example/repo/pull/12', body: `<!-- loop-task-id: ${marker} -->`, headRefName: 'loop/task' },
    ]);
  };
  assert.equal(findOpenTaskPullRequest(taskSpec, '/tmp', command).url, 'https://github.com/example/repo/pull/12');
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
