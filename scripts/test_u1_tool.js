const { chromium } = require('playwright');
const fs = require('fs');

async function testU1Tool() {
  const content = fs.readFileSync('C:\\Users\\doris\\AppData\\Local\\Google\\Chrome\\User Data\\DevToolsActivePort', 'utf8').trim().split('\n');
  const port = content[0].trim();
  const path = content[1].trim();
  const wsUrl = `ws://127.0.0.1:${port}${path}`;
  console.log('[*] Connecting to Chrome:', wsUrl);

  const browser = await chromium.connectOverCDP(wsUrl);
  const context = browser.contexts()[0];
  
  // Find the page with flow.google.com/u/1
  const page = context.pages().find(p => p.url().includes('flow.google.com/u/1')) || context.pages().find(p => p.url().includes('flow.google.com'));

  console.log('[*] Found Flow page:', page.url());
  const targetUrl = 'https://flow.google.com/u/1/shared/tool/ee8f4722-38cb-4363-967f-057725e7c3c6';
  console.log('[*] Navigating to target tool on account 1:', targetUrl);
  await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(6000);

  console.log('[✓] Tool Page Title:', await page.title());
  console.log('[✓] Tool Page URL:', page.url());

  const body = await page.innerText('body');
  console.log('=== PAGE BODY SNIPPET ===\n', body.substring(0, 800));

  await page.screenshot({ path: 'scripts/flow_u1_success.png' });
  console.log('[✓] Screenshot saved to scripts/flow_u1_success.png');

  // Check inputs, buttons, frames
  console.log('Frames count:', page.frames().length);
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

testU1Tool().catch(console.error);
