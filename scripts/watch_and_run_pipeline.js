const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const CSV_PATH = 'C:\\Users\\doris\\Downloads\\why_your_brain_panics_saying_no_true_1min.csv';
const TXT_PATH = 'C:\\Users\\doris\\Downloads\\why_your_brain_panics_saying_no_true_1min.txt';
const REF_IMAGE = 'C:\\Users\\doris\\Downloads\\my_character_reference.png';
const OUTPUT_DIR = 'C:\\Users\\doris\\Downloads\\why_your_brain_panics_saying_no_images';
const TOOL_URL = 'https://flow.google.com/shared/tool/ee8f4722-38cb-4363-967f-057725e7c3c6';

async function main() {
  console.log('[*] Connecting to live Edge window on port 9222...');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0];

  console.log('[*] Waiting for user to complete Google sign-in on the open window...');
  console.log('[*] Current URL:', page.url());

  // Polling until URL is on flow.google.com and not signin
  let authenticated = false;
  for (let i = 0; i < 120; i++) {
    const url = page.url();
    if (url.includes('flow.google.com') && !url.includes('signin') && !url.includes('ServiceLogin')) {
      console.log(`[✓] Google Sign-In detected! Current URL: ${url}`);
      authenticated = true;
      break;
    }
    await page.waitForTimeout(3000);
  }

  if (!authenticated) {
    console.log('[!] Still waiting for sign-in. Exiting runner loop.');
    return;
  }

  console.log(`[*] Navigating directly to dedicated Flow tool: ${TOOL_URL}`);
  await page.goto(TOOL_URL, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(6000);

  console.log('[✓] Tool Page Loaded: "' + (await page.title()) + '"');
  await page.screenshot({ path: 'scripts/flow_tool_authenticated.png' });

  // Locate tool iframe if present
  let toolFrame = page;
  for (const f of page.frames()) {
    if (f.url().includes('tool') || f.url().includes('project') || f.url().includes('applet')) {
      toolFrame = f;
      break;
    }
  }

  // 1. Upload CSV
  console.log('[*] Uploading script CSV:', CSV_PATH);
  const fileInputs = await page.$$('input[type="file"]');
  console.log(`Found ${fileInputs.length} file inputs on main page`);
  
  // Also check frames
  for (let idx = 0; idx < page.frames().length; idx++) {
    const f = page.frames()[idx];
    const frameInputs = await f.$$('input[type="file"]');
    if (frameInputs.length > 0) {
      console.log(`Frame ${idx} (${f.url()}) has ${frameInputs.length} file input(s)`);
    }
  }

  console.log('[✓] Monitoring and ready for Flow batch execution!');
}

main().catch(console.error);
