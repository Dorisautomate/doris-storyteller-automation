const { chromium } = require('playwright');
const fs = require('fs');

async function testBrowserWs() {
  const content = fs.readFileSync('C:\\Users\\doris\\AppData\\Local\\Google\\Chrome\\User Data\\DevToolsActivePort', 'utf8').trim().split('\n');
  const port = content[0].trim();
  const path = content[1].trim();
  const wsUrl = `ws://127.0.0.1:${port}${path}`;
  console.log('[*] Connecting to WebSocket URL:', wsUrl);

  const browser = await chromium.connectOverCDP(wsUrl);
  console.log('[✓] CONNECTED TO ACTIVE CHROME BROWSER!');

  const contexts = browser.contexts();
  console.log(`[✓] Contexts count: ${contexts.length}`);
  for (let i = 0; i < contexts.length; i++) {
    const pages = contexts[i].pages();
    console.log(`Context ${i} has ${pages.length} pages:`);
    for (const p of pages) {
      console.log(`  - "${await p.title()}" (${p.url()})`);
    }
  }

  // Check if any page is Google Flow
  let flowPage = null;
  for (const c of contexts) {
    for (const p of c.pages()) {
      if (p.url().includes('flow.google.com')) {
        flowPage = p;
        break;
      }
    }
    if (flowPage) break;
  }

  if (flowPage) {
    console.log('[✓] Found active Google Flow page:', flowPage.url());
  } else {
    console.log('[i] No open tab on flow.google.com yet. Creating/Navigating to it...');
  }
}

testBrowserWs().catch(console.error);
