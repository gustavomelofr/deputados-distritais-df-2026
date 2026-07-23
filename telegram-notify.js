#!/usr/bin/env node
/**
 * Telegram Notification Script
 * Uso: node telegram-notify.js "mensagem"
 * Lê BOT_TOKEN e CHAT_ID de .env
 */
const https = require('https');
const fs = require('fs');
const path = require('path');

// Load .env if exists
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const [key, ...rest] = line.split('=');
    if (key && rest.length) {
      process.env[key.trim()] = rest.join('=').trim();
    }
  });
}

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || process.env.BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

if (!BOT_TOKEN || !CHAT_ID) {
  console.error('❌ TELEGRAM_BOT_TOKEN e TELEGRAM_CHAT_ID são necessários no .env');
  console.error('   Formato:');
  console.error('   TELEGRAM_BOT_TOKEN=123456:ABC-DEF...');
  console.error('   TELEGRAM_CHAT_ID=123456789');
  process.exit(1);
}

const message = process.argv.slice(2).join(' ');
if (!message) {
  console.error('❌ Uso: node telegram-notify.js "mensagem"');
  process.exit(1);
}

// Escape markdown special characters
function escapeMarkdown(text) {
  return text.replace(/([_*\[\]()~`>#+\-=|{}.!])/g, '\\$1');
}

const payload = JSON.stringify({
  chat_id: CHAT_ID,
  text: escapeMarkdown(message),
  parse_mode: 'MarkdownV2',
  disable_web_page_preview: false,
});

const options = {
  hostname: 'api.telegram.org',
  path: `/bot${BOT_TOKEN}/sendMessage`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload),
  },
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => (data += chunk));
  res.on('end', () => {
    const parsed = JSON.parse(data);
    if (parsed.ok) {
      console.log('✅ Telegram enviado');
      process.exit(0);
    } else {
      console.error('❌ Erro Telegram:', parsed.description);
      process.exit(1);
    }
  });
});

req.on('error', (err) => {
  console.error('❌ Erro de conexão Telegram:', err.message);
  process.exit(1);
});

req.write(payload);
req.end();
