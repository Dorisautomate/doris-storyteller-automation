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

  // 1. Click Nano Banana 2 Lite
  const modelBtn = await f6.$('button:has-text("Nano Banana 2 Lite")');
  if (modelBtn) {
    console.log('[*] Clicking Nano Banana 2 Lite...');
    await modelBtn.click();
    await page.waitForTimeout(1000);
  }

  // 2. Click 16:9
  const ratioBtn = await f6.$('button:has-text("16:9")');
  if (ratioBtn) {
    console.log('[*] Clicking 16:9...');
    await ratioBtn.click();
    await page.waitForTimeout(1000);
  }

  // 3. Inspect Style Image button onclick / state
  const styleBtn = await f6.$('button:has-text("Select Style Image")');
  if (styleBtn) {
    console.log('[*] Style button found. Checking if there is an image input or modal...');
    // Check if clicking it adds a file input or if drag-and-drop is supported
  }

  await page.screenshot({ path: 'scripts/config_ready.png' });
  console.log('[✓] Screenshot saved to scripts/config_ready.png');
}

main().catch(console.error);
