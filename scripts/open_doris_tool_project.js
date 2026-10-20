const { chromium } = require('playwright');
const fs = require('fs');

async function main() {
  const content = fs.readFileSync('C:\\Users\\doris\\AppData\\Local\\Google\\Chrome\\User Data\\DevToolsActivePort', 'utf8').trim().split('\n');
  const port = content[0].trim();
  const path = content[1].trim();
  const wsUrl = `ws://127.0.0.1:${port}${path}`;
  console.log('[*] Connecting to Chrome:', wsUrl);

  const browser = await chromium.connectOverCDP(wsUrl);
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('flow.google.com')) || context.pages()[0];

  console.log('[*] Clicking "Try in a project"...');
  await page.click('button:has-text("Try in a project"), a:has-text("Try in a project")');
  console.log('[*] Clicked! Waiting 10 seconds for project workspace to initialize...');
  await page.waitForTimeout(10000);

  console.log('[✓] New Page Title:', await page.title());
  console.log('[✓] New Page URL:', page.url());

  const body = await page.innerText('body');
  console.log('=== WORKSPACE BODY PREVIEW ===\n', body.substring(0, 1000));

  await page.screenshot({ path: 'scripts/doris_project_opened.png', fullPage: true });
  console.log('[✓] Saved screenshot to scripts/doris_project_opened.png');

  // Inspect frames, inputs, buttons
  console.log('Frames count:', page.frames().length);
  for (let i = 0; i < page.frames().length; i++) {
    const f = page.frames()[i];
    console.log(`Frame ${i}: ${f.url()}`);
    try {
      const inputs = await f.$$eval('input', els => els.map(e => ({ type: e.type, accept: e.accept, id: e.id, name: e.name })));
      const buttons = await f.$$eval('button', els => els.map(b => b.innerText.trim()).filter(Boolean));
      console.log(`  Frame ${i} inputs:`, inputs);
      console.log(`  Frame ${i} buttons:`, buttons);
    } catch(e) {}
  }
}

main().catch(console.error);
