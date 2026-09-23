const { spawn } = require('child_process');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const userDataDir = 'C:\\Users\\itse2\\.gemini\\antigravity\\scratch\\muskan-sky\\tmp_cdp';

const chrome = spawn(chromePath, [
  '--headless=new',
  '--remote-debugging-port=9222',
  `--user-data-dir=${userDataDir}`,
  '--window-size=1280,720',
  'http://localhost:3000'
]);

async function run() {
  await new Promise(r => setTimeout(r, 2000));
  const listRes = await fetch('http://127.0.0.1:9222/json/list');
  const tabs = await listRes.json();
  const tab = tabs.find(t => t.url.includes('localhost:3000')) || tabs[0];
  console.log('Connected to tab:', tab.url);

  const ws = new WebSocket(tab.webSocketDebuggerUrl);
  let id = 1;

  ws.onopen = () => {
    ws.send(JSON.stringify({ id: id++, method: 'Runtime.enable' }));
    ws.send(JSON.stringify({ id: id++, method: 'Log.enable' }));
    ws.send(JSON.stringify({ id: id++, method: 'Page.enable' }));
    ws.send(JSON.stringify({ id: id++, method: 'Page.reload', params: { ignoreCache: true } }));

    setTimeout(() => {
      ws.send(JSON.stringify({ id: 999, method: 'Page.captureScreenshot', params: { format: 'png' } }));
    }, 3500);
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.method === 'Runtime.consoleAPICalled') {
      console.log('BROWSER CONSOLE:', ...data.params.args.map(a => a.value || a.description));
    }
    if (data.method === 'Runtime.exceptionThrown') {
      console.error('BROWSER EXCEPTION:', data.params.exceptionDetails);
    }
    if (data.id === 999 && data.result && data.result.data) {
      const buffer = Buffer.from(data.result.data, 'base64');
      fs.writeFileSync('C:\\Users\\itse2\\.gemini\\antigravity\\brain\\bf485bf4-7683-4c0e-b95b-1863b978f414\\live_3d_night_render.png', buffer);
      console.log('SCREENSHOT SAVED SUCCESSFULLY! Size:', buffer.length);
      ws.close();
      chrome.kill();
      process.exit(0);
    }
  };
}

run().catch(err => {
  console.error('Run error:', err);
  chrome.kill();
  process.exit(1);
});
