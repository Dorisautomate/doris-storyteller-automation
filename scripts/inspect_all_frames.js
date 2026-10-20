const { chromium } = require('playwright');
const fs = require('fs');

async function main() {
  const content = fs.readFileSync('C:\\Users\\doris\\AppData\\Local\\Google\\Chrome\\User Data\\DevToolsActivePort', 'utf8').trim().split('\n');
  const port = content[0].trim();
  const path = content[1].trim();
  const wsUrl = `ws://127.0.0.1:${port}${path}`;

  const browser = await chromium.connectOverCDP(wsUrl);
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('flow.google.com')) || context.pages()[0];

  console.log('Current URL:', page.url());
  console.log('Current Title:', await page.title());

  for (let i = 0; i < page.frames().length; i++) {
    const f = page.frames()[i];
    console.log(`Frame ${i} URL: ${f.url()}`);
    try {
      const btns = await f.$$eval('button', els => els.map(b => ({ text: b.innerText.trim(), class: b.className })));
      console.log(`Frame ${i} buttons:`, btns);
    } catch(e) {
      console.log(`Frame ${i} error:`, e.message);
    }
  }

  await page.screenshot({ path: 'scripts/current_flow_page.png' });
  console.log('Screenshot saved to scripts/current_flow_page.png');
}

main().catch(console.error);
