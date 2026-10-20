const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const CSV_FILE = 'C:\\Users\\doris\\Downloads\\why_your_brain_panics_saying_no_true_1min.csv';
const TXT_FILE = 'C:\\Users\\doris\\Downloads\\why_your_brain_panics_saying_no_true_1min.txt';
const REF_IMG = 'C:\\Users\\doris\\Downloads\\my_character_reference.png';
const IMAGES_DIR = 'C:\\Users\\doris\\Downloads\\why_your_brain_panics_saying_no_images';
const TOOL_URL = 'https://flow.google.com/shared/tool/ee8f4722-38cb-4363-967f-057725e7c3c6';

async function runPipeline() {
  console.log('[*] Connecting to live Edge window on port 9222...');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0];

  console.log('[*] Watching for password submission / login completion...');
  let loggedIn = false;
  for (let i = 0; i < 180; i++) {
    const url = page.url();
    if (url.includes('flow.google.com') && !url.includes('signin') && !url.includes('challenge')) {
      console.log(`[✓] SUCCESS: User is logged in! Redirected to: ${url}`);
      loggedIn = true;
      break;
    }
    await page.waitForTimeout(2000);
  }

  if (!loggedIn) {
    console.log('[!] Still on sign-in screen. Please enter password.');
    return;
  }

  console.log(`[*] Navigating to Google Flow tool: ${TOOL_URL}`);
  await page.goto(TOOL_URL, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(5000);

  console.log('[✓] Tool Page loaded: ' + await page.title());
  await page.screenshot({ path: 'scripts/flow_tool_ready.png' });

  // Locate the tool frame or use page
  let targetFrame = page;
  for (const f of page.frames()) {
    if (f.url().includes('tool') || f.url().includes('shared') || f.url().includes('applet')) {
      targetFrame = f;
      break;
    }
  }

  console.log('[*] Looking for CSV upload file input...');
  const fileInputs = await targetFrame.$$('input[type="file"]');
  console.log(`Found ${fileInputs.length} file inputs`);

  if (fileInputs.length > 0) {
    console.log('[*] Uploading CSV dataset...');
    await fileInputs[0].setInputFiles(CSV_FILE);
    await page.waitForTimeout(3000);
  }

  if (fileInputs.length > 1 && fs.existsSync(REF_IMG)) {
    console.log('[*] Uploading character reference image...');
    await fileInputs[1].setInputFiles(REF_IMG);
    await page.waitForTimeout(3000);
  }

  console.log('[*] Checking for Generate All button...');
  const genBtn = await targetFrame.$('button:has-text("Generate All"), button:has-text("Generate all"), button:has-text("Run All")');
  if (genBtn) {
    console.log('[*] Clicking Generate All...');
    await genBtn.click();
    console.log('[*] Batch generation triggered! Monitoring progress...');
  } else {
    console.log('[i] Please check Flow UI to trigger Generate All if needed.');
  }

  await page.screenshot({ path: 'scripts/flow_batch_started.png' });
}

runPipeline().catch(console.error);
