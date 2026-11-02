// 图片展示插件的本地握手测试：spawn node index.js，走完
// initialize → list → show → show(inline) → show(不存在) → shutdown，
// 断言回包 id 一一对应、清单 13 条、data URI 前缀正确、错误不崩进程。
import { spawn } from 'node:child_process';

const proc = spawn(process.execPath, ['index.js'], {
  cwd: new URL('..', import.meta.url),
  stdio: ['pipe', 'pipe', 'pipe'],
});
proc.stderr.on('data', (d) => process.stderr.write(d));

let buf = '';
const waiters = new Map();

proc.stdout.on('data', (d) => {
  buf += d.toString('utf8');
  let idx;
  while ((idx = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, idx).trim();
    buf = buf.slice(idx + 1);
    if (!line) continue;
    let msg;
    try {
      msg = JSON.parse(line);
    } catch {
      fail('回包不是合法 JSON: ' + line);
    }
    const w = waiters.get(msg.id);
    if (w) {
      waiters.delete(msg.id);
      w(msg);
    }
  }
});

function fail(why) {
  console.error('FAIL:', why);
  proc.kill('SIGKILL');
  process.exit(1);
}

let nextId = 1;
function send(msg) {
  msg.jsonrpc = '2.0';
  return new Promise((resolve, reject) => {
    const id = msg.id;
    const timer = setTimeout(() => reject(new Error('回包超时: id=' + id)), 15000);
    waiters.set(id, (reply) => {
      clearTimeout(timer);
      resolve(reply);
    });
    proc.stdin.write(JSON.stringify(msg) + '\n');
  });
}

function assert(cond, why) {
  if (!cond) fail(why);
}

async function main() {
  // 1. initialize
  const init = await send({ id: nextId++, method: 'initialize', params: {} });
  assert(init.result && init.result.ok === true, 'initialize 应返回 ok:true');
  assert(init.result.name === 'show-images-default', 'initialize 应返回 name=show-images-default');

  // 2. list
  const listReply = await send({ id: nextId++, method: 'call', params: { action: 'list', arguments: {} } });
  assert(listReply.result && typeof listReply.result.content === 'string', 'list 应返回 content 字符串');
  const listed = JSON.parse(listReply.result.content);
  assert(Array.isArray(listed.images), 'list content 应含 images 数组');
  assert(listed.images.length === 13, 'list 应返回 13 条，实际 ' + listed.images.length);
  for (const it of listed.images) {
    assert(typeof it.name === 'string' && it.name, '每条应有 name');
    assert(typeof it.style === 'string' && it.style, '每条应有 style');
    assert(typeof it.file === 'string' && it.file.startsWith('gqy-images/'), '每条应有 file');
    assert(it.bytes > 0, it.name + ' 的文件应存在且非空');
  }

  // 3. show（不内联）
  const showReply = await send({ id: nextId++, method: 'call', params: { action: 'show', arguments: { name: '01-工笔淡彩' } } });
  assert(showReply.result && typeof showReply.result.content === 'string', 'show 应返回 content 字符串');
  const shown = JSON.parse(showReply.result.content);
  assert(shown.name === '01-工笔淡彩', 'show 返回的 name 不符');
  assert(shown.file === 'gqy-images/01-工笔淡彩.png', 'show 返回的 file 不符');
  assert(!shown.data_uri, '未要求 inline 时不应返回 data_uri');

  // 4. show（内联 data URI）
  const inlineReply = await send({ id: nextId++, method: 'call', params: { action: 'show', arguments: { name: '01-工笔淡彩', inline: true } } });
  const inlined = JSON.parse(inlineReply.result.content);
  assert(typeof inlined.data_uri === 'string', 'inline 时应返回 data_uri');
  assert(inlined.data_uri.startsWith('data:image/png;base64,'), 'data_uri 前缀不对');

  // 5. show（不存在）→ error，且进程继续服务
  const missReply = await send({ id: nextId++, method: 'call', params: { action: 'show', arguments: { name: '不存在' } } });
  assert(missReply.error && /不存在/.test(missReply.error.message), '不存在的图片应返回 error');

  // 6. 非法 JSON 行 → error id null，不崩进程
  proc.stdin.write('{not json}\n');
  await new Promise((r) => setTimeout(r, 150));

  // 7. shutdown → 进程 0 退出
  const shutdown = await send({ id: nextId++, method: 'shutdown', params: {} });
  assert(shutdown.result && shutdown.result.ok === true, 'shutdown 应返回 ok:true');

  const code = await new Promise((resolve) => {
    proc.on('exit', (c) => resolve(c));
    setTimeout(() => resolve(proc.exitCode), 5000);
  });
  assert(code === 0, '进程应以 0 退出，实际 ' + code);

  console.log('OK: 握手测试通过（initialize/list/show/show-inline/show-missing/shutdown）');
}

main().catch((err) => fail(err && err.stack ? err.stack : String(err)));
