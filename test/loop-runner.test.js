/* eslint-disable @typescript-eslint/no-require-imports */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const {
  compactSummary,
  commitApprovedWork,
  classifyPullRequest,
  createPullRequest,
  deliverPullRequest,
  enforceRecurringLimit,
  extractReview,
  failureState,
  findOpenTaskPullRequest,
  hasPendingBacklog,
  isCapacityError,
  isTransientError,
  makePatch,
  parseLoopResult,
  pendingBacklogItems,
  recurringTasks,
  runWithRetry,
  selectTask,
  telegramMessage,
  preserveVerifierReview,
  verifierFailureState,
  verifierRecoveryAction,
  violatesGate,
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

test('brief real mantém seleção dinâmica e três rotinas diárias válidas', () => {
  const content = fs.readFileSync(path.join(__dirname, '..', 'AGENT_BRIEF.md'), 'utf8');
  const pending = pendingBacklogItems(content);
  if (pending.length > 0) assert.equal(selectTask(content, {}).title, pending[0]);
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

test('timeout do verifier repete somente revisão e preserva o estado', () => {
  const active = { runId: 'run-1', worktree: '/tmp/worktree', attempt: 1, status: 'running' };
  assert.equal(verifierRecoveryAction({ infrastructureFailure: true, verdict: 'REJECT' }, 1), 'retry_verifier');
  assert.equal(verifierRecoveryAction({ verdict: 'APPROVE' }, 1), 'deliver');
  assert.equal(verifierRecoveryAction({ verdict: 'REJECT' }, 1), 'implementer_correction');
  assert.equal(verifierRecoveryAction({ verdict: 'REJECT' }, 2), 'escalate');
  const first = verifierFailureState(active);
  assert.equal(first.circuitOpen, false);
  assert.equal(first.saved.status, 'verifier_pending');
  assert.equal(first.saved.worktree, active.worktree);
  assert.equal(verifierFailureState(first.saved).circuitOpen, true);
});

test('transição verifier_pending preserva worktree sem abrir circuito na primeira falha', () => {
  const updates = [];
  const runs = [];
  let paused = false;
  preserveVerifierReview(
    { runId: 'run-1', worktree: '/tmp/worktree', branch: 'loop/run-1', attempt: 1, task: 'tarefa' },
    { infrastructureFailure: true, reason: 'timeout' },
    {
      appendRun: (entry) => runs.push(entry),
      updateRuntime: (state, ledger) => updates.push({ state, ledger }),
      notify: () => { throw new Error('não deve notificar na primeira falha'); },
      writePause: () => { paused = true; },
      log: () => {},
    },
  );
  assert.equal(paused, false);
  assert.equal(runs[0].outcome, 'verifier_pending');
  assert.equal(updates[0].ledger.active.status, 'verifier_pending');
  assert.equal(updates[0].ledger.active.worktree, '/tmp/worktree');
  assert.equal(updates[0].ledger.active.branch, 'loop/run-1');
});

test('limite recorrente também se aplica após retomada do verifier', () => {
  const verdict = enforceRecurringLimit(
    { verdict: 'APPROVE', records_changed: 11, reason: 'ok' },
    { kind: 'recurring', limit: 10 },
  );
  assert.equal(verdict.verdict, 'REJECT');
  assert.match(verdict.reason, /excedeu o limite de 10/);
  assert.equal(enforceRecurringLimit(
    { verdict: 'APPROVE', records_changed: 10 },
    { kind: 'recurring', limit: 10 },
  ).verdict, 'APPROVE');
});

test('patch preservado mantém newline final e pode ser reaplicado', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'loop-patch-'));
  try {
    execFileSync('git', ['init', '-q'], { cwd: dir });
    fs.writeFileSync(path.join(dir, 'arquivo.txt'), 'antes\n');
    execFileSync('git', ['add', 'arquivo.txt'], { cwd: dir });
    execFileSync('git', ['-c', 'user.name=Teste', '-c', 'user.email=teste@example.test', 'commit', '-qm', 'base'], { cwd: dir });
    fs.writeFileSync(path.join(dir, 'arquivo.txt'), 'depois\n');
    const patch = makePatch(dir);
    assert.equal(patch.endsWith('\n'), true);
    execFileSync('git', ['checkout', '--', 'arquivo.txt'], { cwd: dir });
    execFileSync('git', ['apply', '--check', '-'], { cwd: dir, input: patch });
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('gate protege scripts, testes operacionais e package.json', () => {
  assert.equal(violatesGate('test/loop-runner.test.js'), true);
  assert.equal(violatesGate('test/electoral-data.test.js'), true);
  assert.equal(violatesGate('scripts/validate-electoral-data.js'), true);
  assert.equal(violatesGate('package.json'), true);
  assert.equal(violatesGate('src/data/cenario-eleitoral.ts'), false);
});

test('commit aprovado é idempotente após push concluído', () => {
  const parent = fs.mkdtempSync(path.join(os.tmpdir(), 'loop-delivery-'));
  const remote = path.join(parent, 'remote.git');
  const repo = path.join(parent, 'repo');
  const identity = {
    GIT_AUTHOR_NAME: process.env.GIT_AUTHOR_NAME,
    GIT_AUTHOR_EMAIL: process.env.GIT_AUTHOR_EMAIL,
    GIT_COMMITTER_NAME: process.env.GIT_COMMITTER_NAME,
    GIT_COMMITTER_EMAIL: process.env.GIT_COMMITTER_EMAIL,
  };
  try {
    Object.assign(process.env, {
      GIT_AUTHOR_NAME: 'Teste', GIT_AUTHOR_EMAIL: 'teste@example.test',
      GIT_COMMITTER_NAME: 'Teste', GIT_COMMITTER_EMAIL: 'teste@example.test',
    });
    execFileSync('git', ['init', '--bare', '-q', remote]);
    fs.mkdirSync(repo);
    execFileSync('git', ['init', '-q', '-b', 'main'], { cwd: repo });
    execFileSync('git', ['remote', 'add', 'origin', remote], { cwd: repo });
    fs.writeFileSync(path.join(repo, 'produto.txt'), 'base\n');
    execFileSync('git', ['add', 'produto.txt'], { cwd: repo });
    execFileSync('git', ['-c', 'user.name=Teste', '-c', 'user.email=teste@example.test', 'commit', '-qm', 'base'], { cwd: repo });
    execFileSync('git', ['push', '-q', '-u', 'origin', 'main'], { cwd: repo });
    execFileSync('git', ['switch', '-q', '-c', 'loop/test'], { cwd: repo });
    fs.writeFileSync(path.join(repo, 'produto.txt'), 'aprovado\n');
    const firstSha = commitApprovedWork(repo, 'loop/test', 'run-test');
    const secondSha = commitApprovedWork(repo, 'loop/test', 'run-test');
    assert.equal(secondSha, firstSha);
  } finally {
    for (const [key, value] of Object.entries(identity)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
    fs.rmSync(parent, { recursive: true, force: true });
  }
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
