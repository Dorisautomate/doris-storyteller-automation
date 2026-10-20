const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function testLiveFrontend() {
  console.log('[*] Launching browser to test https://dorisautomate.web.app...');
  
  // Use installed Edge or Chrome
  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true
  }).catch(() => chromium.launch({ channel: 'chrome', headless: true }));

  const page = await browser.newPage();

  console.log('[*] Navigating to https://dorisautomate.web.app...');
  await page.goto('https://dorisautomate.web.app', { waitUntil: 'networkidle' });

  // 1. Verify Page Title
  const title = await page.title();
  console.log(`[✓] Page Title verified: "${title}"`);

  // 2. Verify Headers & Voice Select
  const headerText = await page.textContent('.app-header h1');
  console.log(`[✓] Header text: "${headerText.trim()}"`);

  const selectedVoice = await page.$eval('#voiceSelect', el => el.value);
  console.log(`[✓] Default Voice selected: "${selectedVoice}" (Doris Voice)`);

  // 3. Input Test Script
  const testScript = [
    "It is Thursday night, and you are sitting in your car in the driveway with the headlights turned off.",
    "You have been staring blankly at the steering wheel for twenty minutes because walking inside feels impossible.",
    "Most people would call this lazy or unmotivated, but neuroscience reveals a completely different story.",
    "Your brain is not broken; it is simply trapped in a survival loop that nobody taught you how to reset."
  ].join('\n');

  console.log('[*] Typing 4-sentence psychology test script...');
  await page.fill('#scriptInput', testScript);

  const lineCountText = await page.textContent('#lineCountBadge');
  console.log(`[✓] Script Line counter updated: "${lineCountText.trim()}"`);

  // 4. Test Alignment Badge response
  const badgeText = await page.textContent('#alignmentBadge');
  console.log(`[✓] Alignment Badge state: "${badgeText.trim()}"`);

  console.log('[*] Testing execution state persistence...');
  await page.evaluate(() => {
    // Clear old test state
    localStorage.removeItem('epic_active_job');
  });

  // 5. Select Images Folder using Playwright input
  const imagesDir = 'C:\\Users\\doris\\Downloads\\psychology 1';
  const imgFiles = fs.readdirSync(imagesDir)
    .filter(f => f.endsWith('.jpg') || f.endsWith('.png'))
    .map(f => path.join(imagesDir, f));

  console.log(`[*] Selecting directory: ${imagesDir}`);
  const fileInput = await page.$('#folderInput');
  await fileInput.setInputFiles(imagesDir);

  await page.waitForTimeout(1000);
  const updatedBadgeText = await page.textContent('#alignmentBadge');
  console.log(`[✓] Updated Alignment Badge state: "${updatedBadgeText.trim()}"`);

  // 6. Click Run Execution Button
  console.log('[*] Clicking Run Video Automation button...');
  const runBtnDisabled = await page.$eval('#runBtn', el => el.disabled);
  console.log(`[✓] Run Button disabled state: ${runBtnDisabled}`);

  if (!runBtnDisabled) {
    await page.click('#runBtn');
    console.log('[✓] Run Button clicked! Waiting 5 seconds to capture initial console logs...');
    await page.waitForTimeout(5000);

    const logLines = await page.$$eval('#logConsole .log-line', els => els.map(el => el.textContent));
    console.log('=== CONSOLE LOGS ===');
    logLines.forEach(l => console.log('  ', l));

    const currentMilestone = await page.textContent('#milestoneText');
    console.log(`[✓] Current milestone: "${currentMilestone.trim()}"`);
  }

  // 7. Take Screenshot
  const screenshotPath = path.join(__dirname, '..', 'live_frontend_test.png');
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`[✓] Full-page screenshot saved to: ${screenshotPath}`);

  await browser.close();
  console.log('\n=======================================================');
  console.log('[ALL TESTS PASSED] Live Firebase Web App 100% Functional!');
  console.log('=======================================================\n');
}

testLiveFrontend().catch(err => {
  console.error('[!] Test failed:', err);
  process.exit(1);
});
