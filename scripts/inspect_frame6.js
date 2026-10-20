const { chromium } = require('playwright');
const fs = require('fs');

async function inspectAppletFrame() {
  const content = fs.readFileSync('C:\\Users\\doris\\AppData\\Local\\Google\\Chrome\\User Data\\DevToolsActivePort', 'utf8').trim().split('\n');
  const wsUrl = 'ws://127.0.0.1:' + content[0].trim() + content[1].trim();

  const browser = await chromium.connectOverCDP(wsUrl);
  const context = browser.contexts()[0];
  const pages = context.pages();
  const page = pages.find(p => p.url().includes('97bc05a9-73e5-4e2a-b971-592224eecd14'));

  let toolFrame = null;
  for (const f of page.frames()) {
    try {
      const csvInput = await f.$('input[accept=".csv"]');
      if (csvInput) {
        toolFrame = f;
        break;
      }
    } catch(e) {}
  }

  if (!toolFrame) {
    console.error('Tool frame not found!');
    return;
  }

  console.log('[✓] Found Tool Frame:', toolFrame.url());

  const allInputs = await toolFrame.$$eval('input', els => els.map(e => ({ type: e.type, accept: e.accept, id: e.id, class: e.className })));
  console.log('[*] Frame inputs:', allInputs);

  const allButtons = await toolFrame.$$eval('button', els => els.map(b => ({ text: b.innerText.trim(), class: b.className })));
  console.log('[*] Frame buttons:', allButtons);

  const bodySnippet = await toolFrame.innerText('body');
  console.log('=== TOOL BODY SNIPPET ===\n', bodySnippet.substring(0, 500));
}

inspectAppletFrame().catch(console.error);
