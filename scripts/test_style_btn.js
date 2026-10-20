const { chromium } = require('playwright');
const fs = require('fs');

async function main() {
  const content = fs.readFileSync('C:\\Users\\doris\\AppData\\Local\\Google\\Chrome\\User Data\\DevToolsActivePort', 'utf8').trim().split('\n');
  const wsUrl = 'ws://127.0.0.1:' + content[0].trim() + content[1].trim();
  const browser = await chromium.connectOverCDP(wsUrl);
  const page = browser.contexts()[0].pages().find(p => p.url().includes('97bc05a9-73e5-4e2a-b971-592224eecd14'));

  for (const f of page.frames()) {
    const btn = await f.$('button:has-text("Select Style Image")');
    if (btn) {
      console.log('Button innerHTML:\n', await btn.innerHTML());
      // Check parent or nearby elements for file inputs
      const parent = await btn.$('xpath=..');
      console.log('Parent innerHTML:\n', await parent.innerHTML());
      break;
    }
  }
}

main().catch(console.error);
