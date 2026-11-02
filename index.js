#!/usr/bin/env node
// GQY「图片展示」插件：stdio 换行 JSON-RPC 2.0（gqy-jsonrpc-v1）。
// 动作：list 列出全部示例图；show 按名称展示，inline=true 时返回 data URI。
// 零依赖，只用 Node 内置模块；stdin EOF 时自退（04 P8 的最后一道防线）。
'use strict';

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;

// 清单必须与 gqy-images/ 实际文件一一对应（含两个 11 号文件）。
const IMAGES = [
  { name: '01-工笔淡彩', style: '工笔淡彩', file: 'gqy-images/01-工笔淡彩.png' },
  { name: '02-水墨写意', style: '水墨写意', file: 'gqy-images/02-水墨写意.png' },
  { name: '03-海边泳衣', style: '海边泳衣', file: 'gqy-images/03-海边泳衣.png' },
  { name: '04-烛光丝裙', style: '烛光丝裙', file: 'gqy-images/04-烛光丝裙.png' },
  { name: '05-雨夜湿发', style: '雨夜湿发', file: 'gqy-images/05-雨夜湿发.png' },
  { name: '06-白蕾丝晨光', style: '白蕾丝晨光', file: 'gqy-images/06-白蕾丝晨光.png' },
  { name: '07-黑蕾丝烛光', style: '黑蕾丝烛光', file: 'gqy-images/07-黑蕾丝烛光.png' },
  { name: '08-蕾丝面纱', style: '蕾丝面纱', file: 'gqy-images/08-蕾丝面纱.png' },
  { name: '09-冷光白纱', style: '冷光白纱', file: 'gqy-images/09-冷光白纱.png' },
  { name: '10-烛下黑纱', style: '烛下黑纱', file: 'gqy-images/10-烛下黑纱.png' },
  { name: '11-泳池蕾丝', style: '泳池蕾丝', file: 'gqy-images/11-泳池蕾丝.png' },
  { name: '11-风里薄纱', style: '风里薄纱', file: 'gqy-images/11-风里薄纱.png' },
  { name: '12-银灰蕾丝', style: '银灰蕾丝', file: 'gqy-images/12-银灰蕾丝.png' },
];

const byName = new Map();
for (const item of IMAGES) {
  byName.set(item.name, item);
  byName.set(item.file, item);
}

function fileSize(rel) {
  try {
    return fs.statSync(path.join(ROOT, rel)).size;
  } catch {
    return 0;
  }
}

function list() {
  return IMAGES.map((it) => ({ ...it, bytes: fileSize(it.file) }));
}

function show(args) {
  const raw = args && typeof args.name === 'string' ? args.name.trim() : '';
  if (!raw) {
    throw new Error('缺少参数 name');
  }
  const item = byName.get(raw);
  if (!item) {
    throw new Error('图片不存在: ' + raw);
  }
  const out = { name: item.name, style: item.style, file: item.file, bytes: fileSize(item.file) };
  if (args.inline === true) {
    const buf = fs.readFileSync(path.join(ROOT, item.file));
    out.data_uri = 'data:image/png;base64,' + buf.toString('base64');
  }
  return out;
}

function handle(msg) {
  const reply = { jsonrpc: '2.0', id: msg.id };
  const params = msg.params || {};
  switch (msg.method) {
    case 'initialize':
      reply.result = { ok: true, name: 'show-images-default', version: '1.0.0' };
      break;
    case 'call': {
      const action = params.action;
      const args = params.arguments || {};
      try {
        if (action === 'list') {
          reply.result = { content: JSON.stringify({ images: list() }) };
        } else if (action === 'show') {
          reply.result = { content: JSON.stringify(show(args)) };
        } else {
          reply.error = { code: -32601, message: '未知动作: ' + String(action) };
        }
      } catch (err) {
        reply.error = { code: -32000, message: err && err.message ? err.message : '调用失败' };
      }
      break;
    }
    case 'shutdown':
      reply.result = { ok: true };
      writeLine(reply);
      process.exit(0);
    default:
      reply.error = { code: -32601, message: '未知方法: ' + String(msg.method) };
  }
  return reply;
}

function writeLine(obj) {
  process.stdout.write(JSON.stringify(obj) + '\n');
}

const rl = readline.createInterface({ input: process.stdin, crlfDelay: Infinity });

rl.on('line', (line) => {
  const trimmed = line.trim();
  if (!trimmed) {
    return;
  }
  let msg;
  try {
    msg = JSON.parse(trimmed);
  } catch {
    writeLine({ jsonrpc: '2.0', id: null, error: { code: -32700, message: '非法 JSON' } });
    return;
  }
  const reply = handle(msg);
  if (reply) {
    writeLine(reply);
  }
});

rl.on('close', () => process.exit(0));
