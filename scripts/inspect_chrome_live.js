const { chromium } = require('playwright');
const fs = require('fs');

async function main() {
  const content = fs.readFileSync('C:\\Users\\doris\\AppData\\Local\\Google\\Chrome\\User Data\\DevToolsActivePort', 'utf8').trim().split('\n');
  const port = content[0].trim();
  const path = content[1].trim();
  const wsUrl = `ws://127.0.0.1:${port}${path}`;
  console.log('[*] Connecting to Chrome WebSocket URL:', wsUrl);

  const browser = await chromium.connectOverCDP(wsUrl);
  console.log('[✓] CONNECTED TO ACTIVE CHROME BROWSER!');

  const contexts = browser.contexts();
  console.log(`[✓] Contexts: ${contexts.length}`);
  for (let i = 0; i < contexts.length; i++) {
    const pages = contexts[i].pages();
    console.log(`Context ${i} has ${pages.length} pages:`);
    for (const p of pages) {
      console.log(`  - "${await p.title()}" (${p.url()})`);
    }
  }
}

main().catch(console.error);
