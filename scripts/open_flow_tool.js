const { chromium } = require('playwright');
const fs = require('fs');

async function openFlowTool() {
  const content = fs.readFileSync('C:\\Users\\doris\\AppData\\Local\\Google\\Chrome\\User Data\\DevToolsActivePort', 'utf8').trim().split('\n');
  const port = content[0].trim();
  const path = content[1].trim();
  const wsUrl = `ws://127.0.0.1:${port}${path}`;
  console.log('[*] Connecting to live browser:', wsUrl);

  const browser = await chromium.connectOverCDP(wsUrl);
  const context = browser.contexts()[0];
  
  // Find the flow page or create one
  let page = context.pages().find(p => p.url().includes('flow.google.com')) || context.pages()[0];
  console.log('[*] Navigating to target tool link: https://flow.google.com/shared/tool/ee8f4722-38cb-4363-967f-057725e7c3c6');
  await page.goto('https://flow.google.com/shared/tool/ee8f4722-38cb-4363-967f-057725e7c3c6', {
    waitUntil: 'networkidle',
    timeout: 45000
  });

  await page.waitForTimeout(6000);
  console.log('[✓] Page Title:', await page.title());
  console.log('[✓] Page URL:', page.url());

  const body = await page.innerText('body');
  console.log('=== PAGE BODY ===\n', body.substring(0, 1000));

  await page.screenshot({ path: 'scripts/flow_tool_live_success.png', fullPage: true });
  console.log('[✓] Saved screenshot to scripts/flow_tool_live_success.png');

  // List all frames in the page
  console.log('Frames count:', page.frames().length);
  for (let i = 0; i < page.frames().length; i++) {
    const f = page.frames()[i];
    console.log(`Frame ${i}: ${f.url()}`);
  }
}

openFlowTool().catch(console.error);
