const { chromium } = require('playwright');
const fs = require('fs');

async function main() {
  const content = fs.readFileSync('C:\\Users\\doris\\AppData\\Local\\Google\\Chrome\\User Data\\DevToolsActivePort', 'utf8').trim().split('\n');
  const wsUrl = 'ws://127.0.0.1:' + content[0].trim() + content[1].trim();

  const browser = await chromium.connectOverCDP(wsUrl);
  const context = browser.contexts()[0];
  const pages = context.pages();
  const page = pages.find(p => p.url().includes('97bc05a9-73e5-4e2a-b971-592224eecd14')) || pages[12];

  console.log('[✓] Targeted Page URL:', page.url());
  console.log('[✓] Targeted Page Title:', await page.title());

  await page.screenshot({ path: 'scripts/page12_flow_tool.png', fullPage: true });
  console.log('[✓] Screenshot saved to scripts/page12_flow_tool.png');

  console.log('Frames count in Page 12:', page.frames().length);
  for (let i = 0; i < page.frames().length; i++) {
    const f = page.frames()[i];
    console.log(`Frame ${i}: ${f.url()}`);
    try {
      const inputs = await f.$$eval('input', els => els.map(e => ({ type: e.type, accept: e.accept, id: e.id, placeholder: e.placeholder })));
      const buttons = await f.$$eval('button', els => els.map(b => b.innerText.trim()).filter(Boolean));
      console.log(`  Frame ${i} inputs:`, inputs);
      console.log(`  Frame ${i} buttons:`, buttons);
    } catch(e) {}
  }
}

main().catch(console.error);
