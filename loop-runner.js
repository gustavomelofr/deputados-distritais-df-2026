#!/usr/bin/env node
/**
 * Loop Runner — Agente Contínuo Always-On
 * 
 * Este script é o CORAÇÃO do loop. Ele:
 * 1. Lê AGENT_BRIEF.md e STATE.md
 * 2. Num ciclo infinito, checka fontes e chama opencode
 * 3. Reporta via Telegram quando há novidades
 * 4. Commita mudanças no GitHub
 * 
 * systemd mantém isso rodando pra sempre com Restart=always
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');

const ROOT = __dirname;
const POLL_INTERVAL_MS = 15 * 60 * 1000; // 15 min entre ciclos
const LOG_FILE = path.join(ROOT, 'loop-runner.log');
const BRIEF_FILE = path.join(ROOT, 'AGENT_BRIEF.md');
const STATE_FILE = path.join(ROOT, 'STATE.md');
const ENV_FILE = path.join(ROOT, '.env');
const RUN_LOG = path.join(ROOT, 'loop-run-log.md');

// --- Utils ---

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  try { fs.appendFileSync(LOG_FILE, line + '\n'); } catch {}
}

function loadEnv() {
  if (!fs.existsSync(ENV_FILE)) return;
  const content = fs.readFileSync(ENV_FILE, 'utf-8');
  content.split('\n').forEach(line => {
    const [key, ...rest] = line.split('=');
    if (key && rest.length) process.env[key.trim()] = rest.join('=').trim();
  });
}

function loadState() {
  try { return fs.readFileSync(STATE_FILE, 'utf-8'); } catch { return '# State not found'; }
}

function updateState(content) {
  try { fs.writeFileSync(STATE_FILE, content); } catch {}
}

function appendRunLog(entry) {
  try {
    const line = `| ${new Date().toISOString().slice(0, 10)} | ${new Date().toISOString().slice(11, 19)} | ${entry} |\n`;
    fs.appendFileSync(RUN_LOG, line);
  } catch {}
}

function telegramNotify(message) {
  loadEnv();
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  
  if (!token || token === 'cole_aqui_seu_token' || !chatId || chatId === 'cole_aqui_seu_chat_id') {
    log('⚠️  Telegram não configurado. Pulei notificação.');
    return;
  }

  // Escape markdown
  const escaped = message.replace(/([_*\[\]()~`>#+\-=|{}.!])/g, '\\$1');
  const payload = JSON.stringify({
    chat_id: chatId,
    text: escaped,
    parse_mode: 'MarkdownV2',
    disable_web_page_preview: false,
  });

  const req = https.request({
    hostname: 'api.telegram.org',
    path: `/bot${token}/sendMessage`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) },
  }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      const parsed = JSON.parse(data);
      log(parsed.ok ? '✅ Telegram enviado' : `❌ Telegram erro: ${parsed.description}`);
    });
  });
  req.on('error', (err) => log(`❌ Telegram erro conexão: ${err.message}`));
  req.write(payload);
  req.end();
}

// --- Core Logic ---

function runOpencode(instruction) {
  // Chama opencode run com auto-approve para modo unattended
  const cmd = `opencode run "${instruction}" --agent loop-runner --auto`;
  log(`▶️ opencode run...`);
  try {
    const output = execSync(cmd, { cwd: ROOT, timeout: 600000, encoding: 'utf-8' });
    log(`✅ opencode concluído (${output.length} chars)`);
    return { ok: true, output };
  } catch (err) {
    log(`❌ opencode falhou: ${err.stderr?.slice(0, 500) || err.message}`);
    return { ok: false, error: err.message };
  }
}

function gitPush() {
  try {
    // Verifica se há mudanças
    const status = execSync('git status --porcelain', { cwd: ROOT, encoding: 'utf-8' });
    if (!status.trim()) {
      log('ℹ️  Nada pra commitar');
      return true;
    }
    
    execSync('git add -A', { cwd: ROOT, timeout: 30000 });
    execSync('git commit -m "🤖 auto: atualização do agente contínuo"', { cwd: ROOT, timeout: 30000 });
    execSync('git push origin main', { cwd: ROOT, timeout: 60000 });
    log('✅ Push GitHub feito');
    return true;
  } catch (err) {
    log(`❌ Git push falhou: ${err.message?.slice(0, 300)}`);
    return false;
  }
}

// --- Ciclo Principal ---

async function mainLoop() {
  log('🚀 ============= INÍCIO DO CICLO =============');
  log(`📋 Brief: ${BRIEF_FILE}`);

  // 1. Executa opencode com instrução baseada no brief
  const instruction = 'Leia AGENT_BRIEF.md e STATE.md. Faça UM avanço tangível no site: crie/atualize uma página, implemente um componente, colete dados de uma fonte, ou melhore o código. Ao final, produza um resumo de 1-2 linhas do que fez. Se não houver nada a fazer, apenas confirme que está monitorando.';

  const result = runOpencode(instruction);

  // 2. Processa resultado
  let summary = '';
  if (result.ok) {
    // Extrai as últimas 3 linhas como resumo (convenção do prompt)
    const lines = result.output.trim().split('\n').slice(-5);
    summary = lines.filter(l => l.trim()).join(' · ');
    
    if (summary.length > 200) summary = summary.slice(0, 200) + '...';
    
    log(`📝 Resumo do agente: ${summary}`);
    appendRunLog(`Sucesso — ${summary}`);

    // 3. Push se houver mudanças
    gitPush();

    // 4. Notifica Telegram se houver novidades
    if (summary.toLowerCase().includes('nov') || 
        summary.toLowerCase().includes('atualiz') || 
        summary.toLowerCase().includes('encontrei') ||
        summary.toLowerCase().includes('adicionei')) {
      telegramNotify(`🤖 *Agente Deputados Distritais*\n${summary}`);
    }

  } else {
    log(`⚠️  opencode não completou. Tentando de novo no próximo ciclo.`);
    appendRunLog(`Falha — ${result.error?.slice(0, 100)}`);
  }

  // 5. Atualiza STATE.md com último run
  const state = `# Loop State — Deputados Distritais DF 2026

Last run: ${new Date().toISOString()}

## Última ação
${summary || 'Nenhuma ação neste ciclo'}

## Ciclo
- Intervalo: ${POLL_INTERVAL_MS / 60000} min
- Próximo: ${new Date(Date.now() + POLL_INTERVAL_MS).toISOString()}
`;
  updateState(state);

  log('💤 ============= FIM DO CICLO =============');
}

// --- Bootstrap ---

async function start() {
  log('');
  log('🔥🔥🔥 LOOP RUNNER INICIADO 🔥🔥🔥');
  log(`📁 Projeto: ${ROOT}`);
  log(`⏱️  Intervalo: ${POLL_INTERVAL_MS / 60000} min`);
  log(`📄 Log: ${LOG_FILE}`);

  // Primeiro ciclo imediato
  await mainLoop();

  // Loop infinito
  setInterval(async () => {
    try {
      await mainLoop();
    } catch (err) {
      log(`❌ Erro CRÍTICO no ciclo: ${err.message}`);
      log('🔄 Reiniciando ciclo...');
    }
  }, POLL_INTERVAL_MS);

  log(`✅ Primeiro ciclo concluído. Próximo em ${POLL_INTERVAL_MS / 60000} min.`);
}

// Tratamento de erros fatais — nunca morre
process.on('uncaughtException', (err) => {
  log(`💀 Uncaught Exception: ${err.message}`);
  log('🔄 Continuando...');
});
process.on('unhandledRejection', (reason) => {
  log(`💀 Unhandled Rejection: ${reason}`);
  log('🔄 Continuando...');
});

start();
