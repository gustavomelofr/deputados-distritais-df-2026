#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * L3 loop orchestrator: isolated maker/checker workflow.
 * The model never commits or pushes. Only this process delivers approved work.
 */
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');

const ROOT = __dirname;
const BASE_BRANCH = process.env.LOOP_BASE_BRANCH || 'main';
const POLL_INTERVAL_MS = Number(process.env.LOOP_INTERVAL_MS || 15 * 60 * 1000);
const MAX_ATTEMPTS = 2;
const MAX_TIMEOUTS = 2;
const IMPLEMENTER_TIMEOUT_MS = 45 * 60 * 1000;
const VERIFIER_TIMEOUT_MS = 3 * 60 * 1000;
const PARTIAL_TTL_MS = 24 * 60 * 60 * 1000;
const WORKTREE_ROOT = path.join(path.dirname(ROOT), 'deputados-loop-worktrees');
const RUNTIME_DIR = path.join(ROOT, '.loop');
const PARTIAL_DIR = path.join(RUNTIME_DIR, 'partial');
const RUNTIME_STATE = path.join(RUNTIME_DIR, 'state.json');
const LEDGER_FILE = path.join(RUNTIME_DIR, 'ledger.json');
const RUN_LOG = path.join(RUNTIME_DIR, 'run-log.jsonl');
const LOG_FILE = path.join(ROOT, 'loop-runner.log');
const PAUSE_FILE = path.join(ROOT, '.loop-pause');
const GATE_FILE = path.join(ROOT, 'loop-gate.json');
const REPO = 'gustavomelofr/deputados-distritais-df-2026';
const DELIVERY_RETRY_DELAYS_MS = (process.env.LOOP_DELIVERY_RETRY_DELAYS_MS || '5000,15000')
  .split(',').map(Number).filter((value) => Number.isFinite(value) && value >= 0);
const AGENT_RETRY_DELAYS_MS = (process.env.LOOP_AGENT_RETRY_DELAYS_MS || '5000,15000')
  .split(',').map(Number).filter((value) => Number.isFinite(value) && value >= 0);

function log(message) {
  const line = `[${new Date().toISOString()}] ${message}`;
  console.log(line);
  fs.appendFileSync(LOG_FILE, `${line}\n`);
}

function run(bin, args, options = {}) {
  return execFileSync(bin, args, {
    cwd: options.cwd || ROOT,
    encoding: 'utf8',
    timeout: options.timeout || 120000,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; }
}

function sleep(ms) {
  if (ms > 0) Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function errorText(error) {
  return `${error?.stderr || ''}\n${error?.stdout || ''}\n${error?.message || error || ''}`;
}

function isTransientError(error) {
  return /APIConnectionError|terminated|ECONNRESET|ETIMEDOUT|EAI_AGAIN|socket hang up|HTTP (?:429|5\d\d)|status (?:429|5\d\d)|GraphQL: Something went wrong|Internal Server Error|Service Unavailable|Bad Gateway/i.test(errorText(error));
}

function runWithRetry(action, options = {}) {
  const delays = options.delays || DELIVERY_RETRY_DELAYS_MS;
  const shouldRetry = options.shouldRetry || isTransientError;
  const sleepFn = options.sleepFn || sleep;
  let lastError;
  for (let attempt = 0; attempt <= delays.length; attempt += 1) {
    try { return action(attempt + 1); } catch (error) {
      lastError = error;
      if (attempt >= delays.length || !shouldRetry(error)) throw error;
      sleepFn(delays[attempt]);
    }
  }
  throw lastError;
}

function pendingBacklogItems(content) {
  const marker = '## Fila de melhorias priorizada';
  const start = content.indexOf(marker);
  if (start < 0) throw new Error(`Seção "${marker}" não encontrada em AGENT_BRIEF.md.`);
  return [...content.slice(start).matchAll(/^- \[ \] (.+)$/gm)].map((match) => match[1].trim());
}

function hasPendingBacklog(file = path.join(ROOT, 'AGENT_BRIEF.md')) {
  return pendingBacklogItems(fs.readFileSync(file, 'utf8')).length > 0;
}

function writeJson(file, value) {
  const temp = `${file}.tmp`;
  fs.writeFileSync(temp, `${JSON.stringify(value, null, 2)}\n`);
  fs.renameSync(temp, file);
}

function ensureRuntime() {
  fs.mkdirSync(RUNTIME_DIR, { recursive: true });
  fs.mkdirSync(PARTIAL_DIR, { recursive: true });
  fs.mkdirSync(WORKTREE_ROOT, { recursive: true });
  if (!fs.existsSync(RUNTIME_STATE)) {
    writeJson(RUNTIME_STATE, {
      lastRun: null,
      status: 'ready',
      lastAction: null,
      pendingFeedback: null,
    });
  }
  if (!fs.existsSync(LEDGER_FILE)) {
    writeJson(LEDGER_FILE, {
      version: 1,
      totalRuns: 0,
      consecutiveFailures: 0,
      lastOutcome: null,
      active: null,
    });
  }
}

function appendRun(entry) {
  fs.appendFileSync(RUN_LOG, `${JSON.stringify({ at: new Date().toISOString(), ...entry })}\n`);
}

function loadEnv() {
  const file = path.join(ROOT, '.env');
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const index = line.indexOf('=');
    if (index > 0 && !line.trim().startsWith('#')) {
      process.env[line.slice(0, index).trim()] = line.slice(index + 1).trim();
    }
  }
}

function notify(message) {
  loadEnv();
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    log('Telegram não configurado; notificação registrada somente no log.');
    return;
  }
  const escaped = message.replace(/([_*\[\]()~`>#+\-=|{}.!])/g, '\\$1');
  const payload = JSON.stringify({ chat_id: chatId, text: escaped, parse_mode: 'MarkdownV2', disable_web_page_preview: true });
  const request = https.request({
    hostname: 'api.telegram.org', path: `/bot${token}/sendMessage`, method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) },
  });
  request.on('error', (error) => log(`Telegram falhou: ${error.message}`));
  request.write(payload);
  request.end();
}

function git(cwd, args, timeout = 120000) {
  return run('git', args, { cwd, timeout }).trim();
}

function getGate() {
  return readJson(GATE_FILE, { denyPaths: [] });
}

function violatesGate(file) {
  const normalized = file.replace(/^\.\//, '');
  const gate = getGate();
  return gate.denyPaths.some((rule) => {
    if (rule.endsWith('/**')) return normalized.startsWith(rule.slice(0, -3));
    if (rule.startsWith('*.')) return normalized.endsWith(rule.slice(1));
    if (rule.endsWith('*')) return normalized.startsWith(rule.slice(0, -1));
    return normalized === rule;
  });
}

function listChangedFiles(worktree) {
  const changed = git(worktree, ['diff', '--name-only', 'HEAD']).split('\n').filter(Boolean);
  const untracked = git(worktree, ['ls-files', '--others', '--exclude-standard']).split('\n').filter(Boolean);
  return [...new Set([...changed, ...untracked])];
}


function makePatch(worktree) {
  const untracked = git(worktree, ['ls-files', '--others', '--exclude-standard']).split('\n').filter(Boolean);
  if (untracked.length) run('git', ['add', '-N', '--', ...untracked], { cwd: worktree });
  return git(worktree, ['diff', '--binary', 'HEAD']);
}

function partialPaths(runId) {
  return { patch: path.join(PARTIAL_DIR, `${runId}.patch`), meta: path.join(PARTIAL_DIR, `${runId}.json`) };
}

function preserveTimeout(active, worktree, branch, runId, task, attempt) {
  const files = listChangedFiles(worktree);
  if (!files.length) return false;
  const timeouts = (active?.timeouts || 0) + 1;
  const partial = partialPaths(runId);
  fs.writeFileSync(partial.patch, makePatch(worktree));
  const saved = { runId, task, branch, worktree, status: 'timed_out', attempt, timeouts, timedOutAt: new Date().toISOString(), partialPatch: partial.patch };
  fs.writeFileSync(partial.meta, `${JSON.stringify(saved, null, 2)}\n`);
  if (timeouts >= MAX_TIMEOUTS) {
    appendRun({ runId, outcome: 'escalated', task, reason: `Implementer atingiu ${timeouts} timeouts`, partialPatch: partial.patch });
    updateRuntime({ status: 'escalated', lastError: `Implementer atingiu ${timeouts} timeouts.` }, { lastOutcome: 'escalated', active: null });
    notify(`⚠️ Loop escalado após ${timeouts} timeouts\nTarefa: ${task}\nPatch salvo: ${partial.patch}`);
    removeWorktree(worktree);
    return true;
  }
  appendRun({ runId, outcome: 'partial_saved', task, timeouts, partialPatch: partial.patch });
  updateRuntime({ status: 'timed_out', lastAction: task, partialPatch: partial.patch }, { lastOutcome: 'timed_out', active: saved });
  log(`Timeout com diff: patch salvo e worktree preservado (${timeouts}/${MAX_TIMEOUTS}).`);
  return true;
}

function createWorktree(runId) {
  git(ROOT, ['fetch', 'origin', BASE_BRANCH]);
  const branch = `loop/${runId}`;
  const worktree = path.join(WORKTREE_ROOT, runId);
  run('git', ['worktree', 'add', '-b', branch, worktree, `origin/${BASE_BRANCH}`], { cwd: ROOT, timeout: 120000 });
  const sourceModules = path.join(ROOT, 'node_modules');
  const targetModules = path.join(worktree, 'node_modules');
  if (fs.existsSync(sourceModules) && !fs.existsSync(targetModules)) fs.symlinkSync(sourceModules, targetModules, 'dir');
  return { branch, worktree };
}

function removeWorktree(worktree) {
  try { run('git', ['worktree', 'remove', '--force', worktree], { cwd: ROOT, timeout: 60000 }); } catch (error) { log(`Limpeza de worktree falhou: ${error.message}`); }
}

function runAgent(agent, instruction, cwd, files = []) {
  const args = ['run', instruction, '--agent', agent, '--auto', '--title', `loop-${agent}`];
  for (const file of files) args.push('--file', file);
  const timeout = agent === 'verifier' ? VERIFIER_TIMEOUT_MS : IMPLEMENTER_TIMEOUT_MS;
  for (let attempt = 0; attempt <= AGENT_RETRY_DELAYS_MS.length; attempt += 1) {
    try {
      return { ok: true, output: run('opencode', args, { cwd, timeout }) };
    } catch (error) {
      const timedOut = error?.code === 'ETIMEDOUT' || /ETIMEDOUT|timed out/i.test(errorText(error));
      if (!timedOut && isTransientError(error) && attempt < AGENT_RETRY_DELAYS_MS.length) {
        log(`Falha transitória do agente ${agent}; nova tentativa em ${AGENT_RETRY_DELAYS_MS[attempt]}ms.`);
        sleep(AGENT_RETRY_DELAYS_MS[attempt]);
        continue;
      }
      return { ok: false, timedOut, error: errorText(error).slice(-2000) };
    }
  }
  return { ok: false, timedOut: false, error: `Agente ${agent} esgotou tentativas.` };
}

function runTests(worktree) {
  const results = [];
  for (const test of [
    { name: 'TypeScript', bin: 'npx', args: ['tsc', '--noEmit'], timeout: 180000 },
    { name: 'Build', bin: 'npm', args: ['run', 'build'], timeout: 300000 },
  ]) {
    try {
      const output = run(test.bin, test.args, { cwd: worktree, timeout: test.timeout });
      results.push({ name: test.name, passed: true, output: output.slice(-1200) });
    } catch (error) {
      const output = `${error.stdout || ''}\n${error.stderr || ''}\n${error.message || ''}`.slice(-1800);
      results.push({ name: test.name, passed: false, output });
      break;
    }
  }
  return results;
}

function extractReview(output) {
  const candidates = [];
  const fenced = output.match(/```(?:json)?\s*([\s\S]*?)```/gi) || [];
  for (const block of fenced) candidates.push(block.replace(/^```(?:json)?\s*/i, '').replace(/```$/, '').trim());
  const objectMatches = output.match(/\{[\s\S]*\}/g) || [];
  candidates.push(...objectMatches.reverse());
  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate);
      if (['APPROVE', 'REJECT'].includes(parsed.verdict) && typeof parsed.reason === 'string') {
        if (parsed.verdict === 'REJECT' && typeof parsed.next_prompt !== 'string') continue;
        return parsed;
      }
    } catch {}
  }
  return null;
}

function review(worktree, runId, task, tests) {
  const changed = listChangedFiles(worktree);
  const blocked = changed.filter(violatesGate);
  if (blocked.length) return { verdict: 'REJECT', reason: `Caminhos protegidos alterados: ${blocked.join(', ')}`, next_prompt: 'Desfaça as alterações em caminhos protegidos. Trabalhe somente em arquivos de produto permitidos.' };
  if (!changed.length) return { verdict: 'REJECT', reason: 'Nenhuma alteração de produto foi produzida.', next_prompt: 'Implemente uma alteração mínima e verificável para a tarefa atual. Não modifique apenas arquivos de estado ou log.' };

  const untracked = git(worktree, ['ls-files', '--others', '--exclude-standard']).split('\n').filter(Boolean);
  if (untracked.length) run('git', ['add', '-N', '--', ...untracked], { cwd: worktree });
  const patch = git(worktree, ['diff', '--binary', 'HEAD']);
  const patchFile = path.join(RUNTIME_DIR, `${runId}.patch`);
  fs.writeFileSync(patchFile, patch);
  const testEvidence = tests.map((item) => `${item.name}: ${item.passed ? 'PASSOU' : 'FALHOU'}\n${item.output}`).join('\n\n');
  const instruction = `Você é o reviewer independente. Tarefa: ${task}. Revise o diff anexado e esta evidência de testes:\n${testEvidence}\n\nRegras: não edite arquivos; rejeite caminhos protegidos, dados não atribuídos sobre deputados, regressões de TypeScript, mudanças fora de escopo, testes falhos e alterações sem valor de produto. Responda EXCLUSIVAMENTE com JSON válido em uma única linha: {"verdict":"APPROVE"|"REJECT","reason":"...","next_prompt":null|"instrução objetiva de correção"}. Para REJECT, next_prompt é obrigatório e deve pedir correção apenas dos problemas apontados.`;
  const result = runAgent('verifier', instruction, worktree, [patchFile]);
  if (!result.ok) return { verdict: 'REJECT', reason: `Verifier indisponível: ${result.error.slice(-300)}`, next_prompt: 'Não faça novas mudanças. Aguarde escalonamento humano.' };
  const parsed = extractReview(result.output);
  if (!parsed) return { verdict: 'REJECT', reason: 'Verifier respondeu em formato inválido; falha fechada.', next_prompt: 'Não faça novas mudanças. Aguarde escalonamento humano.' };
  return parsed;
}

function deliveryMetadata(branch, runId, task) {
  return {
    branch,
    runId,
    task,
    title: `🤖 Loop: ${task.slice(0, 72)}`,
    body: `Mudança criada pelo loop autônomo.\n\n- Run: \`${runId}\`\n- Verifier: aprovado\n- Testes: TypeScript e build executados\n- Entrega: auto-merge solicitado após CI.`,
  };
}

function findPullRequest(branch, cwd, command = run) {
  const output = command('gh', ['pr', 'list', '--repo', REPO, '--head', branch, '--state', 'all', '--limit', '1', '--json', 'url'], { cwd, timeout: 120000 });
  return JSON.parse(output || '[]')[0]?.url || null;
}

function safelyFindPullRequest(branch, cwd, command, retry) {
  try { return retry(() => findPullRequest(branch, cwd, command)); } catch { return null; }
}

function createPullRequest(delivery, cwd, command = run, retry = runWithRetry) {
  const existing = safelyFindPullRequest(delivery.branch, cwd, command, retry);
  if (existing) return existing;
  let cliError;
  try {
    const output = retry(() => command('gh', [
      'pr', 'create', '--repo', REPO, '--base', BASE_BRANCH, '--head', delivery.branch,
      '--title', delivery.title, '--body', delivery.body,
    ], { cwd, timeout: 120000 }));
    const url = output.split('\n').find((line) => line.startsWith('https://'));
    if (url) return url;
  } catch (error) { cliError = error; }

  const afterCli = safelyFindPullRequest(delivery.branch, cwd, command, retry);
  if (afterCli) return afterCli;
  try {
    const output = retry(() => command('gh', [
      'api', '--method', 'POST', `repos/${REPO}/pulls`,
      '-f', `base=${BASE_BRANCH}`, '-f', `head=${delivery.branch}`,
      '-f', `title=${delivery.title}`, '-f', `body=${delivery.body}`, '--jq', '.html_url',
    ], { cwd, timeout: 120000 }));
    const url = output.trim();
    if (url.startsWith('https://')) return url;
    throw new Error('API REST criou PR sem URL identificável.');
  } catch (restError) {
    const afterRest = safelyFindPullRequest(delivery.branch, cwd, command, retry);
    if (afterRest) return afterRest;
    throw new Error(`Falha ao criar PR via CLI e REST. CLI: ${errorText(cliError).slice(-400)} REST: ${errorText(restError).slice(-400)}`);
  }
}

function enableAutoMerge(url, cwd, command = run, retry = runWithRetry) {
  retry(() => command('gh', ['pr', 'merge', url, '--auto', '--squash'], { cwd, timeout: 120000 }));
}

function deliverPullRequest(delivery, cwd, command = run, retry = runWithRetry) {
  const url = createPullRequest(delivery, cwd, command, retry);
  enableAutoMerge(url, cwd, command, retry);
  return url;
}

function commitApprovedWork(worktree, branch, runId) {
  const files = listChangedFiles(worktree);
  const blocked = files.filter(violatesGate);
  if (blocked.length) throw new Error(`Gate bloqueou entrega: ${blocked.join(', ')}`);
  run('git', ['add', '--', ...files], { cwd: worktree });
  run('git', ['commit', '-m', `feat(loop): atualização aprovada ${runId}`], { cwd: worktree, timeout: 60000 });
  run('git', ['push', '--set-upstream', 'origin', branch], { cwd: worktree, timeout: 120000 });
  return git(worktree, ['rev-parse', 'HEAD']);
}

function buildTask(state) {
  if (state.pendingFeedback) return state.pendingFeedback;
  return 'Leia AGENT_BRIEF.md e execute SOMENTE o primeiro item não concluído da seção Fila de melhorias priorizada, começando por P0. Não faça exploração ampla, não narre plano e não pesquise tarefas alternativas: leia apenas os arquivos diretamente necessários para esse item e comece a editar. Atenda todos os critérios de aceite com dados reais ou estados honestos de indisponibilidade. Ao concluir, marque o checkbox correspondente como [x] no AGENT_BRIEF.md. Não faça commit, push ou merge. Não rode TypeScript, build ou testes pesados: o orquestrador validará a mudança depois. Reporte objetivamente os arquivos alterados.';
}

function updateRuntime(statePatch, ledgerPatch) {
  const state = { ...readJson(RUNTIME_STATE, {}), ...statePatch, updatedAt: new Date().toISOString() };
  const ledger = { ...readJson(LEDGER_FILE, {}), ...ledgerPatch, updatedAt: new Date().toISOString() };
  writeJson(RUNTIME_STATE, state);
  writeJson(LEDGER_FILE, ledger);
}

function syncServingCheckout() {
  const dirty = git(ROOT, ['status', '--porcelain']);
  if (dirty.trim()) throw new Error('Checkout principal está sujo; recusa sincronização automática.');
  git(ROOT, ['fetch', 'origin', BASE_BRANCH]);
  const local = git(ROOT, ['rev-parse', 'HEAD']);
  const remote = git(ROOT, ['rev-parse', `origin/${BASE_BRANCH}`]);
  if (local !== remote) {
    run('git', ['reset', '--hard', remote], { cwd: ROOT, timeout: 60000 });
    log(`Checkout do site sincronizado para ${remote.slice(0, 7)}.`);
  }
}

async function mainLoop() {
  ensureRuntime();
  if (fs.existsSync(PAUSE_FILE)) { log('Loop pausado por .loop-pause.'); return; }
  syncServingCheckout();
  const state = readJson(RUNTIME_STATE, {});
  const ledger = readJson(LEDGER_FILE, {});
  const previous = ledger.active;

  if (previous?.status === 'delivery_pending') {
    try {
      const prUrl = deliverPullRequest(previous, previous.worktree || ROOT);
      updateRuntime({ status: 'approved', lastAction: previous.task, pendingFeedback: null, prUrl, lastError: null }, { consecutiveFailures: 0, lastOutcome: 'approved', active: null });
      appendRun({ runId: previous.runId, outcome: 'delivery_recovered', attempt: previous.attempt, task: previous.task, prUrl, tests: previous.tests });
      notify(`✅ Entrega recuperada\nPR: ${prUrl}\nAuto-merge ativado após CI.`);
      if (previous.worktree && fs.existsSync(previous.worktree)) removeWorktree(previous.worktree);
    } catch (error) {
      const deliveryFailures = (previous.deliveryFailures || 0) + 1;
      log(`Entrega ainda pendente (${deliveryFailures}): ${error.message}`);
      updateRuntime({ status: 'delivery_pending', lastError: error.message }, { lastOutcome: 'delivery_pending', active: { ...previous, deliveryFailures } });
      if (deliveryFailures === 1) notify(`⚠️ Entrega pendente; será retomada automaticamente\nBranch: ${previous.branch}\n${error.message.slice(0, 300)}`);
    }
    return;
  }

  if (previous?.status === 'timed_out' && (!fs.existsSync(previous.worktree) || Date.now() - Date.parse(previous.timedOutAt || 0) >= PARTIAL_TTL_MS)) {
    appendRun({ runId: previous.runId, outcome: 'escalated', task: previous.task, reason: 'Trabalho parcial expirou após 24h', partialPatch: previous.partialPatch });
    updateRuntime({ status: 'escalated', lastError: 'Trabalho parcial expirou após 24h.' }, { lastOutcome: 'escalated', active: null });
    notify(`⚠️ Loop escalado: trabalho parcial expirou após 24h\nPatch: ${previous.partialPatch}`);
    if (fs.existsSync(previous.worktree)) removeWorktree(previous.worktree);
    return;
  }
  const resumable = previous?.status === 'timed_out' && fs.existsSync(previous.worktree) && (previous.timeouts || 0) < MAX_TIMEOUTS ? previous : null;
  if (!resumable && !hasPendingBacklog()) {
    const enteringIdle = state.status !== 'idle';
    updateRuntime({ status: 'idle', pendingFeedback: null, lastError: null }, { lastOutcome: 'idle', active: null });
    if (enteringIdle) {
      appendRun({ outcome: 'idle', reason: 'Fila de melhorias concluída' });
      log('Fila de melhorias concluída; loop em idle.');
      notify('⏸️ Loop em idle\nTodos os itens da fila foram concluídos. Adicione um novo checkbox pendente para retomar.');
    }
    return;
  }
  if (state.status === 'idle') log('Novo item pendente detectado; loop retomado.');
  const runId = resumable?.runId || new Date().toISOString().replace(/[:.]/g, '-');
  const task = resumable?.task || buildTask(state);
  const created = resumable || createWorktree(runId);
  const worktree = created.worktree;
  const branch = created.branch;
  const firstAttempt = resumable?.attempt || 1;
  updateRuntime({ status: resumable ? 'resuming' : 'running', lastRun: new Date().toISOString() }, { totalRuns: (ledger.totalRuns || 0) + 1, active: { ...(resumable || {}), runId, task, branch, worktree, status: 'running', attempt: firstAttempt, timeouts: resumable?.timeouts || 0 } });
  try {
    for (let attempt = firstAttempt; attempt <= MAX_ATTEMPTS; attempt += 1) {
      const active = readJson(LEDGER_FILE, {}).active;
      updateRuntime({}, { active: { ...(active || {}), runId, task, branch, worktree, status: 'running', attempt } });
      const prompt = resumable && attempt === firstAttempt
        ? `Continue exatamente a tarefa já iniciada: ${task}\n\nLeia o diff atual e o patch em ${resumable.partialPatch}. Preserve alterações válidas, complete apenas os critérios pendentes, não inicie outra tarefa e não rode testes/build.`
        : (attempt === 1 ? task : readJson(RUNTIME_STATE, {}).pendingFeedback);
      const implementation = runAgent('implementer', prompt, worktree);
      if (!implementation.ok) {
        if (implementation.timedOut && preserveTimeout(active, worktree, branch, runId, task, attempt)) return;
        throw new Error(`Implementer falhou: ${implementation.error.slice(-700)}`);
      }
      const tests = runTests(worktree);
      const verdict = review(worktree, runId, task, tests);
      log(`Tentativa ${attempt}/${MAX_ATTEMPTS}: ${verdict.verdict} — ${verdict.reason}`);
      if (verdict.verdict === 'APPROVE') {
        const sha = commitApprovedWork(worktree, branch, runId);
        const delivery = { ...deliveryMetadata(branch, runId, task), status: 'delivery_pending', worktree, sha, attempt, tests, deliveryFailures: 0 };
        updateRuntime({ status: 'delivery_pending', lastAction: task, pendingFeedback: null, lastError: null }, { lastOutcome: 'delivery_pending', active: delivery });
        const prUrl = deliverPullRequest(delivery, worktree);
        updateRuntime({ status: 'approved', lastAction: task, pendingFeedback: null, prUrl, lastError: null }, { consecutiveFailures: 0, lastOutcome: 'approved', active: null });
        appendRun({ runId, outcome: 'approved', attempt, task, prUrl, tests });
        notify(`✅ Loop aprovado\nPR: ${prUrl}\nTentativas: ${attempt}\nAuto-merge ativado após CI.`);
        removeWorktree(worktree);
        return;
      }
      updateRuntime({ status: 'review_rejected', pendingFeedback: verdict.next_prompt, lastReview: verdict.reason }, { lastOutcome: 'review_rejected', active: { runId, task, attempt, review: verdict.reason } });
      if (attempt === MAX_ATTEMPTS) {
        const patch = path.join(RUNTIME_DIR, `${runId}.patch`);
        const evidence = fs.existsSync(patch) ? ` Diff salvo em ${patch}.` : '';
        appendRun({ runId, outcome: 'escalated', attempt, task, reason: verdict.reason, tests });
        updateRuntime({ status: 'escalated' }, { consecutiveFailures: (ledger.consecutiveFailures || 0) + 1, lastOutcome: 'escalated', active: null });
        notify(`⚠️ Loop escalado após ${MAX_ATTEMPTS} tentativas\nMotivo: ${verdict.reason.slice(0, 500)}.${evidence}`);
        removeWorktree(worktree);
        return;
      }
    }
  } catch (error) {
    const active = readJson(LEDGER_FILE, {}).active;
    if (active?.status === 'delivery_pending') {
      const deliveryFailures = (active.deliveryFailures || 0) + 1;
      log(`Entrega pendente após aprovação (${deliveryFailures}): ${error.message}`);
      appendRun({ runId, outcome: 'delivery_pending', task, branch, sha: active.sha, error: error.message.slice(0, 1000) });
      updateRuntime({ status: 'delivery_pending', lastError: error.message }, { lastOutcome: 'delivery_pending', active: { ...active, deliveryFailures } });
      notify(`⚠️ Código aprovado e enviado, mas a entrega está pendente\nBranch: ${branch}\nO próximo ciclo retomará sem reimplementar.`);
      return;
    }
    log(`Ciclo falhou: ${error.message}`);
    appendRun({ runId, outcome: 'failed', error: error.message.slice(0, 1000) });
    updateRuntime({ status: 'failed', lastError: error.message }, { consecutiveFailures: (ledger.consecutiveFailures || 0) + 1, lastOutcome: 'failed', active: null });
    notify(`❌ Loop falhou sem enviar código\n${error.message.slice(0, 500)}`);
    if (worktree) removeWorktree(worktree);
  }
}

async function start() {
  ensureRuntime();
  log(`Loop L3 seguro iniciado; intervalo ${POLL_INTERVAL_MS / 60000} min; implementer ${IMPLEMENTER_TIMEOUT_MS / 60000} min; máximo ${MAX_TIMEOUTS} timeouts.`);
  while (true) {
    await mainLoop();
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
}

process.on('uncaughtException', (error) => log(`Uncaught exception: ${error.stack || error.message}`));
process.on('unhandledRejection', (error) => log(`Unhandled rejection: ${error}`));

if (require.main === module) start();

module.exports = {
  createPullRequest,
  deliverPullRequest,
  findPullRequest,
  hasPendingBacklog,
  isTransientError,
  pendingBacklogItems,
  runWithRetry,
};
