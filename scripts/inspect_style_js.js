const { chromium } = require('playwright');
const fs = require('fs');

async function main() {
  const content = fs.readFileSync('C:\\Users\\doris\\AppData\\Local\\Google\\Chrome\\User Data\\DevToolsActivePort', 'utf8').trim().split('\n');
  const wsUrl = 'ws://127.0.0.1:' + content[0].trim() + content[1].trim();
  const browser = await chromium.connectOverCDP(wsUrl);
  const page = browser.contexts()[0].pages().find(p => p.url().includes('97bc05a9-73e5-4e2a-b971-592224eecd14'));

  let f6 = null;
  for (const f of page.frames()) {
    if (await f.$('button:has-text("16:9")')) {
      f6 = f;
      break;
    }
  }

  const scripts = await f6.$$eval('script', scs => scs.map(s => s.innerHTML.substring(0, 300)));
  console.log('Frame 6 inline scripts count:', scripts.length);

  // Check all buttons and elements inside the style section
  const styleSection = await f6.$eval('h3:has-text("Style Reference") + *', el => el.outerHTML);
  console.log('Style Reference HTML:\n', styleSection);
}

main().catch(console.error);
