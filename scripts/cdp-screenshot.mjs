import { mkdir, writeFile } from 'node:fs/promises';

const pages = await fetch('http://127.0.0.1:9222/json').then((response) => response.json());
const page = pages.find((entry) => entry.type === 'page' && entry.url.includes('127.0.0.1:5173'));
if (!page) throw new Error('Hotel Zero page not found');

const socket = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
let id = 0;
const pending = new Map();
const errors = [];
socket.onmessage = ({ data }) => {
  const message = JSON.parse(data);
  if (message.id && pending.has(message.id)) {
    const { resolve, reject } = pending.get(message.id);
    pending.delete(message.id);
    message.error ? reject(new Error(message.error.message)) : resolve(message.result);
  }
  if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.text);
};
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const requestId = ++id;
  pending.set(requestId, { resolve, reject });
  socket.send(JSON.stringify({ id: requestId, method, params }));
});
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const screenshot = async (name) => {
  const result = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  await writeFile(`artifacts/${name}.png`, Buffer.from(result.data, 'base64'));
};

await mkdir('artifacts', { recursive: true });
await send('Runtime.enable');
await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 720, deviceScaleFactor: 1, mobile: false });
await send('Runtime.evaluate', { expression: 'localStorage.clear()' });
await send('Page.reload', { ignoreCache: true });
await delay(1200);
await screenshot('menu-generated-art');
await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: 640, y: 430, button: 'left', clickCount: 1 });
await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: 640, y: 430, button: 'left', clickCount: 1 });
await delay(1600);
await screenshot('game-generated-art');
await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'd', code: 'KeyD', windowsVirtualKeyCode: 68 });
await delay(4900);
await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'd', code: 'KeyD', windowsVirtualKeyCode: 68 });
await delay(250);
await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'e', code: 'KeyE', windowsVirtualKeyCode: 69 });
await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'e', code: 'KeyE', windowsVirtualKeyCode: 69 });
await delay(500);
await screenshot('dialogue-generated-art');
const state = await send('Runtime.evaluate', {
  expression: `JSON.stringify({title:document.title,canvas:[...document.querySelectorAll('canvas')].map(c=>[c.width,c.height]),save:Boolean(localStorage.getItem('hotel-zero-save-v1'))})`,
  returnByValue: true,
});
socket.close();
console.log(state.result.value);
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
