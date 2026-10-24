// Tetris BD - headless-Chrome smoke test via raw CDP. Run: node tests/smoke.mjs
// Requires /opt/meta-chromium/chrome. Exits non-zero on any failed check.
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const INDEX = 'file://' + path.resolve(DIR, '..', 'index.html');
const PORT = 9336;
const chrome = spawn('/opt/meta-chromium/chrome', [
  '--headless=new', '--no-sandbox', '--disable-gpu',
  '--user-data-dir=/tmp/tetris-smoke-' + process.pid,
  '--remote-debugging-port=' + PORT, 'about:blank',
], { stdio: 'ignore' });

let ws, msgId = 0;
const pending = new Map();
const consoleErrors = [];
function send(method, params = {}) {
  const id = ++msgId;
  return new Promise((resolve) => {
    pending.set(id, resolve);
    ws.send(JSON.stringify({ id, method, params }));
  });
}
async function ev(expr) {
  const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true });
  if (r.result?.subtype === 'error' || r.exceptionDetails) {
    throw new Error('evaluate failed: ' + expr + ' -> ' + JSON.stringify(r.exceptionDetails || r.result));
  }
  return r.result.value;
}
let checks = 0;
function check(name, cond) {
  checks++;
  if (!cond) throw new Error('CHECK FAILED: ' + name);
  console.log('ok - ' + name);
}
try {
  let targets;
  for (let i = 0; i < 50; i++) {
    try { targets = await (await fetch('http://127.0.0.1:' + PORT + '/json')).json(); break; }
    catch { await sleep(200); }
  }
  if (!targets) throw new Error('chrome debugging endpoint never came up');
  ws = new WebSocket(targets[0].webSocketDebuggerUrl);
  await new Promise((res) => { ws.onopen = res; });
  ws.onmessage = (m) => {
    const d = JSON.parse(m.data);
    if (d.id && pending.has(d.id)) { pending.get(d.id)(d.result ?? d); pending.delete(d.id); }
    if (d.method === 'Runtime.consoleAPICalled' && d.params.type === 'error') {
      consoleErrors.push(JSON.stringify(d.params.args));
    }
    if (d.method === 'Runtime.exceptionThrown') consoleErrors.push('exception');
  };
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Page.navigate', { url: INDEX });
  for (let i = 0; i < 50; i++) {
    if (await ev("document.readyState === 'complete' && document.getElementById('board')")) break;
    await sleep(200);
  }
  check('title is Tetris BD', (await ev('document.title')).startsWith('Tetris BD'));
  check('board canvas is 300x600', await ev(
    "document.getElementById('board').width === 300 && document.getElementById('board').height === 600"));
  check('idle overlay visible with Start button', await ev(
    "!document.getElementById('overlay').classList.contains('hidden') && " +
    "document.getElementById('overlayBtn').textContent === 'Start'"));
  check('3 next previews + hold canvas render', await ev(
    "['holdCanvas','next0','next1','next2'].every((id) => !!document.getElementById(id))"));
  check('Start hides overlay and paints a piece', await ev(
    "document.getElementById('overlayBtn').click();" +
    "!document.getElementById('overlay').classList.contains('hidden') === false && " +
    "(() => { const c = document.getElementById('board').getContext('2d');" +
    " const d = c.getImageData(150, 45, 1, 1).data;" +
    " return !(d[0] === 15 && d[1] === 23 && d[2] === 42); })()"));
  check('ArrowLeft key does not crash and game keeps running', await ev(
    "document.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowLeft'}));" +
    "document.getElementById('overlay').classList.contains('hidden')"));
  check('Hold + Rotate pad buttons do not crash', await ev(
    "document.getElementById('holdBtn').click();" +
    "document.getElementById('btnRotate').click();" +
    "document.getElementById('overlay').classList.contains('hidden')"));
  check('language toggle switches tagline to Bengali', await ev(
    "document.getElementById('langBtn').click();" +
    "document.querySelector('.tagline').textContent !== 'Stack the blocks. Clear the lines.'"));
  check('language toggle back restores English tagline', await ev(
    "document.getElementById('langBtn').click();" +
    "document.querySelector('.tagline').textContent === 'Stack the blocks. Clear the lines.'"));
  check('Pause button pauses (overlay shows)', await ev(
    "document.getElementById('pauseBtn').click();" +
    "!document.getElementById('overlay').classList.contains('hidden')"));
  check('Resume button resumes (overlay hides)', await ev(
    "document.getElementById('overlayBtn').click();" +
    "document.getElementById('overlay').classList.contains('hidden')"));
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await sleep(300);
  check('390px mobile: no horizontal overflow', await ev(
    'document.documentElement.scrollWidth <= 391'));
  check('no console errors or page exceptions', consoleErrors.length === 0);
  console.log('ALL ' + checks + ' SMOKE CHECKS PASSED');
} finally {
  try { ws?.close(); } catch {}
  chrome.kill();
}
