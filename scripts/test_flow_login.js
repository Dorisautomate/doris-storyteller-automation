const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { chromium } = require('playwright');

async function testProfile2() {
  const srcUserDir = 'C:\\Users\\doris\\AppData\\Local\\Google\\Chrome\\User Data';
  const destDir = 'C:\\Users\\doris\\.chrome-flow-profile2';
  const destDefault = path.join(destDir, 'Default');

  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  if (!fs.existsSync(destDefault)) fs.mkdirSync(destDefault, { recursive: true });

  console.log('[*] Cloning Profile 2 (Thelma Tutorial)...');
  fs.copyFileSync(path.join(srcUserDir, 'Local State'), path.join(destDir, 'Local State'));

  const srcProfile2 = path.join(srcUserDir, 'Profile 2');
  const itemsToCopy = ['Network', 'Preferences', 'Local Storage', 'Session Storage', 'IndexedDB'];
  for (const item of itemsToCopy) {
    const sSrc = path.join(srcProfile2, item);
    const sDest = path.join(destDefault, item);
    if (fs.existsSync(sSrc)) {
      try {
        if (fs.lstatSync(sSrc).isDirectory()) {
          execSync(`robocopy "${sSrc}" "${sDest}" /E /NFL /NDL /NJH /NJS /nc /ns /np`, { stdio: 'ignore' });
        } else {
          fs.copyFileSync(sSrc, sDest);
        }
      } catch (e) {}
    }
  }

  console.log('[✓] Cloned Profile 2! Launching Chrome...');
  const context = await chromium.launchPersistentContext(destDir, {
    channel: 'chrome',
    headless: false,
    args: ['--disable-blink-features=AutomationControlled']
  });

  const page = await context.newPage();
  
  // Test 1: Shared tool URL
  console.log('[*] Trying shared tool URL...');
  await page.goto('https://flow.google.com/shared/tool/ee8f4722-38cb-4363-967f-057725e7c3c6', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(4000);
  let body = await page.innerText('body');
  console.log('[1] Shared URL text preview:\n', body.substring(0, 300));
  await page.screenshot({ path: 'scripts/flow_profile2_shared.png' });

  // Test 2: Project URL
  console.log('[*] Trying direct project tool URL...');
  await page.goto('https://flow.google.com/project/4d83a672-43e9-4fa3-8ba6-a179e326d168/tool/ee8f4722-38cb-4363-967f-057725e7c3c6', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(4000);
  body = await page.innerText('body');
  console.log('[2] Project URL text preview:\n', body.substring(0, 300));
  await page.screenshot({ path: 'scripts/flow_profile2_project.png' });

  await context.close();
}

testProfile2().catch(console.error);
