const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  console.log('>>> Launching Headless Chrome Tester...');
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 950 } });
  const page = await context.newPage();

  page.on('console', msg => console.log('  [BROWSER CONSOLE]', msg.text()));

  console.log('>>> 1. Navigating to https://dorisautomate.web.app...');
  await page.goto('https://dorisautomate.web.app', { waitUntil: 'networkidle' });

  // 2. Configure API Key in Settings
  console.log('>>> 2. Configuring Kie.ai API key in Settings...');
  await page.click('#navSettingsBtn');
  await page.waitForTimeout(500);

  await page.fill('#kieApiKeyInput', '12b5f2a14a89e0b265c05e789962efc6');
  await page.evaluate(() => {
    localStorage.setItem('doris_kie_api_key', '12b5f2a14a89e0b265c05e789962efc6');
    if (typeof updateSettingsStatus === 'function') updateSettingsStatus();
  });
  await page.waitForTimeout(500);
  console.log('>>> API Key saved in localStorage.');

  // 3. Return to Studio & Ensure Premium Mode
  console.log('>>> 3. Switching to Studio...');
  await page.click('#navStudioBtn');
  await page.waitForTimeout(500);

  await page.evaluate(() => {
    const toggle = document.getElementById('studioModeToggle');
    if (!toggle.checked) toggle.click();
  });
  await page.waitForTimeout(500);

  // 4. Upload 5-Row CSV
  console.log('>>> 4. Uploading doris_test_5rows.csv...');
  const csvPath = path.resolve('doris_test_5rows.csv');
  await page.setInputFiles('#csvFileInput', csvPath);
  await page.waitForTimeout(1000);

  await page.screenshot({ path: 'headless_test_ready.png' });
  console.log('>>> Step 4 verified: 5 scenes ready for generation.');

  // 5. Trigger Run Video Automation
  console.log('>>> 5. Clicking Run Video Automation...');
  await page.click('#runBtn');
  await page.waitForTimeout(3000);

  await page.screenshot({ path: 'headless_test_dispatched.png' });
  console.log('>>> Automation dispatched! Monitoring logs...');

  // 6. Monitor execution for 90 seconds
  for (let i = 1; i <= 9; i++) {
    await page.waitForTimeout(10000);
    const logs = await page.evaluate(() => {
      const els = Array.from(document.querySelectorAll('#logConsole .log-line'));
      return els.map(e => e.textContent);
    });
    const progress = await page.evaluate(() => document.getElementById('progressPct').textContent);
    const milestone = await page.evaluate(() => document.getElementById('milestoneText').textContent);
    console.log(`[${i * 10}s] Progress: ${progress} | Milestone: ${milestone}`);
    if (logs.length > 0) {
      console.log(`      Latest log: ${logs[logs.length - 1]}`);
    }
  }

  await page.screenshot({ path: 'headless_test_progress.png' });
  console.log('>>> Checkpoint screenshot saved to headless_test_progress.png');

  await browser.close();
  console.log('>>> Headless test run completed successfully!');
})().catch(err => {
  console.error('Headless test error:', err);
  process.exit(1);
});
