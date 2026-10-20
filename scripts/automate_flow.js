const { chromium } = require('playwright');

async function testEdgeFlow() {
  console.log('[*] Connecting to Microsoft Edge on port 9222 via CDP...');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  console.log('[✓] Successfully connected to Edge over CDP!');

  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('msn.com') || p.url().includes('about') || p.url().includes('flow.google.com')) || await context.newPage();

  console.log('[*] Navigating to Google Flow tool link: https://flow.google.com/shared/tool/ee8f4722-38cb-4363-967f-057725e7c3c6');
  await page.goto('https://flow.google.com/shared/tool/ee8f4722-38cb-4363-967f-057725e7c3c6', {
    waitUntil: 'networkidle',
    timeout: 60000
  });

  await page.waitForTimeout(6000);
  console.log('[✓] Page Title:', await page.title());
  console.log('[✓] Page URL:', page.url());

  const body = await page.innerText('body');
  console.log('=== FLOW BODY PREVIEW ===\n', body.substring(0, 800));

  await page.screenshot({ path: 'scripts/edge_flow_success.png' });
  console.log('[✓] Screenshot saved to scripts/edge_flow_success.png');

  // Inspect frames
  console.log('Total frames:', page.frames().length);
  for (let i = 0; i < page.frames().length; i++) {
    const f = page.frames()[i];
    console.log(`Frame ${i}: ${f.url()}`);
    try {
      const btns = await f.$$eval('button', els => els.map(b => b.innerText.trim()).filter(Boolean));
      if (btns.length > 0) console.log(`  Frame ${i} buttons:`, btns.slice(0, 10));
    } catch (e) {}
  }
}

testEdgeFlow().catch(console.error);
