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

function recurringTasks(content) {
  const marker = '## Rotinas recorrentes';
  const start = content.indexOf(marker);
  if (start < 0) return [];
  const section = content.slice(start);
  const tasks = [];
  const pattern = /^- \[r\] ([a-z0-9-]+): (.+)\n((?:  .+(?:\n|$))*)/gm;
  for (const match of section.matchAll(pattern)) {
    const fields = match[3];
    const frequency = fields.match(/^  Frequência: (\d+)h$/m);
    const limit = fields.match(/^  Limite por ciclo: (\d+)$/m);
    const instruction = fields.match(/^  Instrução: (.+)$/m);
    const acceptance = fields.match(/^  Critério: (.+)$/m);
    if (!frequency || !limit || !instruction || !acceptance) {
      throw new Error(`Rotina recorrente inválida: ${match[1]}.`);
    }
    tasks.push({
      kind: 'recurring',
      id: match[1],
      title: match[2].trim(),
      intervalMs: Number(frequency[1]) * 60 * 60 * 1000,
      limit: Number(limit[1]),
      instruction: instruction[1].trim(),
      acceptance: acceptance[1].trim(),
    });
  }
  return tasks;
}

function selectTask(content, ledger = {}, now = Date.now()) {
  const pending = pendingBacklogItems(content);
  if (pending.length) {
    return { kind: 'backlog', id: `backlog:${pending[0]}`, title: pending[0] };
  }
  const recurringState = ledger.recurring || {};
  return recurringTasks(content).find((task) => {
    const lastRunAt = recurringState[task.id]?.lastRunAt;
    return !lastRunAt || now - Date.parse(lastRunAt) >= task.intervalMs;
  }) || null;
}

function parseLoopResult(output) {
  const marker = output.match(/LOOP_RESULT:\s*(UPDATED|NO_CHANGE|BLOCKED)(?:\s*[—–:-]\s*(.+))?/i);
  const humanAction = output.match(/HUMAN_ACTION:\s*(.+)/i);
  return {
    status: marker?.[1]?.toUpperCase() || 'UPDATED',
    reason: marker?.[2]?.trim() || null,
    humanAction: humanAction?.[1]?.trim() || null,
  };
}

function compactSummary(value, fallback = 'O ciclo terminou sem resumo detalhado.') {
  const normalized = String(value || fallback).replace(/\s+/g, ' ').trim();
  return normalized.length > 320 ? `${normalized.slice(0, 317)}...` : normalized;
}

function telegramMessage({ icon, title, task, summary, lines = [] }) {
  return [
    `${icon} ${title}`,
    '',
    task ? `Tarefa: ${compactSummary(task, '').slice(0, 140)}` : null,
    `Resumo: ${compactSummary(summary)}`,
    ...lines.filter(Boolean),
  ].filter((line) => line !== null).join('\n').slice(0, 3900);
}

function recurringLedger(ledger, taskSpec, outcome, details = {}) {
  if (taskSpec?.kind !== 'recurring') return ledger.recurring || {};
  return {
    ...(ledger.recurring || {}),
    [taskSpec.id]: {
      ...(ledger.recurring?.[taskSpec.id] || {}),
      lastRunAt: new Date().toISOString(),
      lastOutcome: outcome,
      recordsChanged: details.recordsChanged ?? null,
      summary: details.summary || null,
    },
  };
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
      version: 2,
      totalRuns: 0,
      consecutiveFailures: 0,
      lastOutcome: null,
      active: null,
      recurring: {},
    });
  } else {
    const ledger = readJson(LEDGER_FILE, {});
    if ((ledger.version || 1) < 2) writeJson(LEDGER_FILE, { ...ledger, version: 2, recurring: ledger.recurring || {} });
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
  const saved = { runId, task, taskSpec: active?.taskSpec || null, branch, worktree, status: 'timed_out', attempt, timeouts, timedOutAt: new Date().toISOString(), partialPatch: partial.patch };
  fs.writeFileSync(partial.meta, `${JSON.stringify(saved, null, 2)}\n`);
  if (timeouts >= MAX_TIMEOUTS) {
    appendRun({ runId, outcome: 'escalated', task, reason: `Implementer atingiu ${timeouts} timeouts`, partialPatch: partial.patch });
    updateRuntime({ status: 'escalated', lastError: `Implementer atingiu ${timeouts} timeouts.` }, { lastOutcome: 'escalated', active: null });
    notify(telegramMessage({
      icon: '⚠️', title: 'Ciclo escalado', task: active?.taskSpec?.title || task,
      summary: `O implementer atingiu ${timeouts} timeouts; o trabalho parcial foi preservado.`,
      lines: [`Patch: ${partial.patch}`],
    }));
    discardWorktree(worktree, branch);
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

function discardWorktree(worktree, branch) {
  removeWorktree(worktree);
  try { run('git', ['branch', '-D', branch], { cwd: ROOT, timeout: 60000 }); } catch (error) { log(`Limpeza da branch local ${branch} falhou: ${error.message}`); }
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
        return {
          ...parsed,
          summary: compactSummary(parsed.summary || parsed.reason),
          records_changed: Number.isFinite(parsed.records_changed) ? Math.max(0, parsed.records_changed) : null,
        };
      }
    } catch {}
  }
  return null;
}

function review(worktree, runId, task, tests, loopResult = { status: 'UPDATED' }) {
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
  const instruction = `Você é o reviewer independente. Tarefa: ${task}. Resultado declarado pelo implementer: ${loopResult.status}. Revise o diff anexado e esta evidência de testes:\n${testEvidence}\n\nRegras: não edite arquivos; rejeite caminhos protegidos, dados ou nomes eleitorais sem fonte, links genéricos de notícia, fotos sem origem/licença, regressões de TypeScript, lote acima do limite, mudanças fora de escopo e testes falhos. Uma alteração apenas em AGENT_BRIEF.md pode ser aprovada quando muda exatamente a tarefa atual de [ ] ou [r] para [!] e documenta bloqueio externo real e ação humana necessária. Produza summary em linguagem simples, factual, com até 280 caracteres e quantidade de registros quando aplicável. Responda EXCLUSIVAMENTE com JSON válido em uma única linha: {"verdict":"APPROVE"|"REJECT","reason":"...","summary":"breve resumo do resultado visível","records_changed":0|null|número,"next_prompt":null|"instrução objetiva de correção"}. Para REJECT, next_prompt é obrigatório e deve pedir correção apenas dos problemas apontados.`;
  const result = runAgent('verifier', instruction, worktree, [patchFile]);
  if (!result.ok) return { verdict: 'REJECT', reason: `Verifier indisponível: ${result.error.slice(-300)}`, next_prompt: 'Não faça novas mudanças. Aguarde escalonamento humano.' };
  const parsed = extractReview(result.output);
  if (!parsed) return { verdict: 'REJECT', reason: 'Verifier respondeu em formato inválido; falha fechada.', next_prompt: 'Não faça novas mudanças. Aguarde escalonamento humano.' };
  return parsed;
}

function deliveryMetadata(branch, runId, task, details = {}) {
  const cycleSummary = compactSummary(details.cycleSummary || 'Alteração aprovada pelo verifier.');
  const taskTitle = details.taskSpec?.title || task;
  return {
    branch,
    runId,
    task,
    taskSpec: details.taskSpec || null,
    cycleSummary,
    recordsChanged: details.recordsChanged ?? null,
    resultStatus: details.resultStatus || 'UPDATED',
    humanAction: details.humanAction || null,
    title: `🤖 Loop: ${taskTitle.slice(0, 72)}`,
    body: `Mudança criada pelo loop autônomo.\n\n- Run: \`${runId}\`\n- Tarefa: ${taskTitle}\n- Resumo: ${cycleSummary}\n- Verifier: aprovado\n- Testes: TypeScript e build executados\n- Entrega: auto-merge solicitado após CI.`,
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

function buildTask(state, taskSpec) {
  if (state.pendingFeedback) {
    return `Continue somente a tarefa "${taskSpec.title}" e corrija este feedback:\n${state.pendingFeedback}`;
  }
  const common = 'Leia AGENT_BRIEF.md e cumpra suas regras de fonte, evidência, fotografia e escopo. Não faça exploração ampla, não narre plano, não procure tarefa alternativa, não faça commit/push/merge e não rode TypeScript ou build.';
  if (taskSpec.kind === 'recurring') {
    return `${common}\n\nExecute SOMENTE a rotina recorrente "${taskSpec.title}" (${taskSpec.id}). Limite por ciclo: ${taskSpec.limit}. Instrução: ${taskSpec.instruction} Critério: ${taskSpec.acceptance}\n\nNão altere [r] para [x]. Se não encontrar novidade válida após consultar as fontes permitidas, não edite arquivos e finalize exatamente com "LOOP_RESULT: NO_CHANGE — motivo objetivo". Se houver atualização, reporte arquivos e quantidades objetivamente.`;
  }
  return `${common}\n\nExecute SOMENTE o primeiro item marcado [ ]: "${taskSpec.title}". Atenda integralmente o critério logo abaixo desse item e marque apenas esse checkbox como [x] no mesmo diff. Se existir bloqueio externo real, marque apenas esse item como [!], adicione "Bloqueio:" e "Ação humana necessária:" e finalize com LOOP_RESULT: BLOCKED. Reporte objetivamente arquivos e quantidades alteradas.`;
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
      const currentLedger = readJson(LEDGER_FILE, {});
      const recurring = recurringLedger(currentLedger, previous.taskSpec, 'updated', { recordsChanged: previous.recordsChanged, summary: previous.cycleSummary });
      updateRuntime({ status: 'approved', lastAction: previous.task, pendingFeedback: null, prUrl, lastError: null, cycleSummary: previous.cycleSummary }, { consecutiveFailures: 0, lastOutcome: 'approved', active: null, recurring });
      appendRun({ runId: previous.runId, outcome: 'delivery_recovered', attempt: previous.attempt, task: previous.task, taskSpec: previous.taskSpec, summary: previous.cycleSummary, recordsChanged: previous.recordsChanged, prUrl, tests: previous.tests });
      notify(telegramMessage({
        icon: '✅', title: 'Entrega recuperada', task: previous.taskSpec?.title || previous.task,
        summary: previous.cycleSummary,
        lines: [`Validação: TypeScript e build passaram.`, `PR: ${prUrl}`],
      }));
      if (previous.worktree && fs.existsSync(previous.worktree)) discardWorktree(previous.worktree, previous.branch);
    } catch (error) {
      const deliveryFailures = (previous.deliveryFailures || 0) + 1;
      log(`Entrega ainda pendente (${deliveryFailures}): ${error.message}`);
      updateRuntime({ status: 'delivery_pending', lastError: error.message }, { lastOutcome: 'delivery_pending', active: { ...previous, deliveryFailures } });
      if (deliveryFailures === 1) notify(telegramMessage({
        icon: '⏳', title: 'Entrega pendente', task: previous.taskSpec?.title || previous.task,
        summary: previous.cycleSummary || 'O código foi aprovado, mas o GitHub não confirmou a entrega.',
        lines: [`Situação: branch ${previous.branch} preservada; nova tentativa será automática.`],
      }));
    }
    return;
  }

  if (previous?.status === 'timed_out' && (!fs.existsSync(previous.worktree) || Date.now() - Date.parse(previous.timedOutAt || 0) >= PARTIAL_TTL_MS)) {
    appendRun({ runId: previous.runId, outcome: 'escalated', task: previous.task, reason: 'Trabalho parcial expirou após 24h', partialPatch: previous.partialPatch });
    updateRuntime({ status: 'escalated', lastError: 'Trabalho parcial expirou após 24h.' }, { lastOutcome: 'escalated', active: null });
    notify(telegramMessage({
      icon: '⚠️', title: 'Trabalho parcial expirado', task: previous.taskSpec?.title || previous.task,
      summary: 'O trabalho parcial não foi concluído em 24 horas e precisa de revisão humana.',
      lines: [`Patch: ${previous.partialPatch}`],
    }));
    if (fs.existsSync(previous.worktree)) discardWorktree(previous.worktree, previous.branch);
    return;
  }
  const resumable = previous?.status === 'timed_out' && fs.existsSync(previous.worktree) && (previous.timeouts || 0) < MAX_TIMEOUTS ? previous : null;
  const briefContent = fs.readFileSync(path.join(ROOT, 'AGENT_BRIEF.md'), 'utf8');
  const taskSpec = resumable?.taskSpec || selectTask(briefContent, ledger);
  if (!resumable && !taskSpec) {
    const hasRoutines = recurringTasks(briefContent).length > 0;
    const nextStatus = hasRoutines ? 'waiting' : 'idle';
    const enteringIdle = nextStatus === 'idle' && state.status !== 'idle';
    updateRuntime({ status: nextStatus, pendingFeedback: null, lastError: null }, { lastOutcome: nextStatus, active: null });
    if (enteringIdle) {
      appendRun({ outcome: 'idle', reason: 'Fila e rotinas concluídas' });
      log('Sem tarefas únicas ou rotinas recorrentes; loop em idle.');
      notify(telegramMessage({
        icon: '⏸️', title: 'Loop em espera',
        summary: 'Todos os itens únicos e rotinas configuradas foram concluídos; nenhuma tarefa foi executada.',
      }));
    }
    return;
  }
  if (['idle', 'waiting'].includes(state.status)) log(`Tarefa elegível detectada: ${taskSpec.title}.`);
  const runId = resumable?.runId || new Date().toISOString().replace(/[:.]/g, '-');
  const task = resumable?.task || buildTask(state, taskSpec);
  const created = resumable || createWorktree(runId);
  const worktree = created.worktree;
  const branch = created.branch;
  const firstAttempt = resumable?.attempt || 1;
  updateRuntime({ status: resumable ? 'resuming' : 'running', lastRun: new Date().toISOString() }, { totalRuns: (ledger.totalRuns || 0) + 1, active: { ...(resumable || {}), runId, task, taskSpec, branch, worktree, status: 'running', attempt: firstAttempt, timeouts: resumable?.timeouts || 0 } });
  try {
    for (let attempt = firstAttempt; attempt <= MAX_ATTEMPTS; attempt += 1) {
      const active = readJson(LEDGER_FILE, {}).active;
      updateRuntime({}, { active: { ...(active || {}), runId, task, taskSpec, branch, worktree, status: 'running', attempt } });
      const prompt = resumable && attempt === firstAttempt
        ? `Continue exatamente a tarefa já iniciada: ${task}\n\nLeia o diff atual e o patch em ${resumable.partialPatch}. Preserve alterações válidas, complete apenas os critérios pendentes, não inicie outra tarefa e não rode testes/build.`
        : (attempt === 1 ? task : buildTask(readJson(RUNTIME_STATE, {}), taskSpec));
      const implementation = runAgent('implementer', prompt, worktree);
      if (!implementation.ok) {
        if (implementation.timedOut && preserveTimeout(active, worktree, branch, runId, task, attempt)) return;
        throw new Error(`Implementer falhou: ${implementation.error.slice(-700)}`);
      }
      const loopResult = parseLoopResult(implementation.output);
      const changedFiles = listChangedFiles(worktree);
      if (taskSpec.kind === 'recurring' && !changedFiles.length && loopResult.status === 'NO_CHANGE') {
        const summary = compactSummary(loopResult.reason, 'A rotina consultou as fontes permitidas e não encontrou novidade válida.');
        const currentLedger = readJson(LEDGER_FILE, {});
        const recurring = recurringLedger(currentLedger, taskSpec, 'no_change', { recordsChanged: 0, summary });
        updateRuntime({ status: 'waiting', lastAction: taskSpec.title, pendingFeedback: null, lastError: null, cycleSummary: summary }, { lastOutcome: 'no_change', active: null, recurring });
        appendRun({ runId, outcome: 'no_change', task: taskSpec.title, taskSpec, summary, recordsChanged: 0 });
        log(`Rotina ${taskSpec.id}: sem novidades; nenhum PR criado.`);
        discardWorktree(worktree, branch);
        return;
      }
      if (taskSpec.kind === 'recurring' && !changedFiles.length && loopResult.status === 'BLOCKED') {
        const summary = compactSummary(loopResult.reason, 'A rotina encontrou um bloqueio externo e não alterou arquivos.');
        const currentLedger = readJson(LEDGER_FILE, {});
        const recurring = recurringLedger(currentLedger, taskSpec, 'blocked', { recordsChanged: 0, summary });
        updateRuntime({ status: 'blocked', lastAction: taskSpec.title, pendingFeedback: null, lastError: summary, cycleSummary: summary }, { lastOutcome: 'blocked', active: null, recurring });
        appendRun({ runId, outcome: 'blocked', task: taskSpec.title, taskSpec, summary, humanAction: loopResult.humanAction });
        notify(telegramMessage({
          icon: '⚠️', title: 'Rotina bloqueada', task: taskSpec.title, summary,
          lines: [loopResult.humanAction ? `Ação necessária: ${loopResult.humanAction}` : null],
        }));
        discardWorktree(worktree, branch);
        return;
      }
      if (loopResult.status === 'NO_CHANGE' && changedFiles.length) {
        throw new Error('Implementer declarou NO_CHANGE, mas alterou arquivos.');
      }
      const tests = runTests(worktree);
      let verdict = review(worktree, runId, task, tests, loopResult);
      if (verdict.verdict === 'APPROVE' && taskSpec.kind === 'recurring' && verdict.records_changed !== null && verdict.records_changed > taskSpec.limit) {
        verdict = {
          verdict: 'REJECT',
          reason: `Lote recorrente excedeu o limite de ${taskSpec.limit}: verifier contou ${verdict.records_changed}.`,
          summary: `O lote excedeu o limite de ${taskSpec.limit} registros e não foi entregue.`,
          next_prompt: `Reduza o lote para no máximo ${taskSpec.limit} registros e preserve somente itens verificáveis.`,
        };
      }
      log(`Tentativa ${attempt}/${MAX_ATTEMPTS}: ${verdict.verdict} — ${verdict.reason}`);
      if (verdict.verdict === 'APPROVE') {
        const cycleSummary = compactSummary(verdict.summary || verdict.reason);
        const sha = commitApprovedWork(worktree, branch, runId);
        const delivery = {
          ...deliveryMetadata(branch, runId, task, {
            taskSpec, cycleSummary, recordsChanged: verdict.records_changed,
            resultStatus: loopResult.status, humanAction: loopResult.humanAction,
          }),
          status: 'delivery_pending', worktree, sha, attempt, tests, deliveryFailures: 0,
        };
        updateRuntime({ status: 'delivery_pending', lastAction: taskSpec.title, pendingFeedback: null, lastError: null, cycleSummary }, { lastOutcome: 'delivery_pending', active: delivery });
        const prUrl = deliverPullRequest(delivery, worktree);
        const finalOutcome = loopResult.status === 'BLOCKED' ? 'blocked' : 'approved';
        const currentLedger = readJson(LEDGER_FILE, {});
        const recurring = recurringLedger(currentLedger, taskSpec, finalOutcome === 'approved' ? 'updated' : 'blocked', { recordsChanged: verdict.records_changed, summary: cycleSummary });
        updateRuntime({ status: finalOutcome, lastAction: taskSpec.title, pendingFeedback: null, prUrl, lastError: finalOutcome === 'blocked' ? cycleSummary : null, cycleSummary }, { consecutiveFailures: 0, lastOutcome: finalOutcome, active: null, recurring });
        appendRun({ runId, outcome: finalOutcome, attempt, task: taskSpec.title, taskSpec, summary: cycleSummary, recordsChanged: verdict.records_changed, prUrl, tests });
        notify(telegramMessage({
          icon: finalOutcome === 'blocked' ? '⚠️' : '✅',
          title: finalOutcome === 'blocked' ? 'Tarefa bloqueada' : 'Ciclo concluído',
          task: taskSpec.title,
          summary: cycleSummary,
          lines: [
            loopResult.humanAction ? `Ação necessária: ${loopResult.humanAction}` : null,
            'Validação: TypeScript e build passaram.',
            `PR: ${prUrl}`,
          ],
        }));
        discardWorktree(worktree, branch);
        return;
      }
      updateRuntime({ status: 'review_rejected', pendingFeedback: verdict.next_prompt, lastReview: verdict.reason, cycleSummary: verdict.summary || null }, { lastOutcome: 'review_rejected', active: { runId, task, taskSpec, attempt, review: verdict.reason } });
      if (attempt === MAX_ATTEMPTS) {
        const patch = path.join(RUNTIME_DIR, `${runId}.patch`);
        const evidence = fs.existsSync(patch) ? ` Diff salvo em ${patch}.` : '';
        appendRun({ runId, outcome: 'escalated', attempt, task, reason: verdict.reason, tests });
        updateRuntime({ status: 'escalated' }, { consecutiveFailures: (ledger.consecutiveFailures || 0) + 1, lastOutcome: 'escalated', active: null });
        notify(telegramMessage({
          icon: '⚠️', title: 'Ciclo escalado', task: taskSpec.title,
          summary: verdict.summary || `A tarefa foi rejeitada após ${MAX_ATTEMPTS} tentativas.`,
          lines: [`Motivo: ${compactSummary(verdict.reason)}`, evidence ? evidence.trim() : null],
        }));
        discardWorktree(worktree, branch);
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
      notify(telegramMessage({
        icon: '⏳', title: 'Entrega pendente', task: taskSpec.title,
        summary: active.cycleSummary || 'O código foi aprovado e enviado, mas o GitHub não confirmou o PR.',
        lines: [`Situação: branch ${branch} preservada; o próximo ciclo retomará sem reimplementar.`],
      }));
      return;
    }
    log(`Ciclo falhou: ${error.message}`);
    appendRun({ runId, outcome: 'failed', error: error.message.slice(0, 1000) });
    updateRuntime({ status: 'failed', lastError: error.message }, { consecutiveFailures: (ledger.consecutiveFailures || 0) + 1, lastOutcome: 'failed', active: null });
    notify(telegramMessage({
      icon: '❌', title: 'Ciclo falhou', task: taskSpec?.title || task,
      summary: 'O ciclo foi interrompido antes de produzir uma entrega aprovada; nenhum código foi enviado.',
      lines: [`Motivo: ${compactSummary(error.message)}`],
    }));
    if (worktree) discardWorktree(worktree, branch);
  }
}

async function start() {
  ensureRuntime();
  log(`Loop L3 seguro iniciado; intervalo ${POLL_INTERVAL_MS / 60000} min; implementer ${IMPLEMENTER_TIMEOUT_MS / 60000} min; máximo ${MAX_TIMEOUTS} timeouts.`);
  while (true) {
    try {
      await mainLoop();
    } catch (error) {
      log(`Falha de orquestração: ${error.stack || error.message}`);
      updateRuntime({ status: 'failed', lastError: error.message }, { lastOutcome: 'failed' });
      notify(telegramMessage({
        icon: '❌', title: 'Falha de orquestração',
        summary: 'O ciclo não chegou a iniciar uma tarefa; nenhum código foi enviado.',
        lines: [`Motivo: ${compactSummary(error.message)}`],
      }));
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
}

process.on('uncaughtException', (error) => log(`Uncaught exception: ${error.stack || error.message}`));
process.on('unhandledRejection', (error) => log(`Unhandled rejection: ${error}`));

if (require.main === module) start();

module.exports = {
  compactSummary,
  createPullRequest,
  deliverPullRequest,
  extractReview,
  findPullRequest,
  hasPendingBacklog,
  isTransientError,
  parseLoopResult,
  pendingBacklogItems,
  recurringTasks,
  runWithRetry,
  selectTask,
  telegramMessage,
};
