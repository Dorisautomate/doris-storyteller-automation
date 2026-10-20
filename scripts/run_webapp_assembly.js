const { chromium } = require('playwright');
const fs = require('fs');

const TXT_PATH = 'C:\\Users\\doris\\Downloads\\why_your_brain_panics_saying_no_true_1min.txt';
const OUTPUT_DIR = 'C:\\Users\\doris\\Downloads\\why_your_brain_panics_saying_no_images';

async function main() {
  console.log('====================================================');
  console.log('[WEB APP STAGE] Live Video Assembly on dorisautomate.web.app');
  console.log('====================================================');

  const portFile = 'C:\\Users\\doris\\AppData\\Local\\Google\\Chrome\\User Data\\DevToolsActivePort';
  const portContent = fs.readFileSync(portFile, 'utf8').trim().split('\n');
  const wsUrl = 'ws://127.0.0.1:' + portContent[0].trim() + portContent[1].trim();

  console.log('[CDP] Connecting to Chrome via:', wsUrl);
  const browser = await chromium.connectOverCDP(wsUrl);
  const context = browser.contexts()[0];
  let pages = context.pages();

  let appPage = pages.find(p => p.url().includes('dorisautomate.web.app'));
  if (!appPage) {
    console.log('[WEB APP] Opening https://dorisautomate.web.app in new tab...');
    appPage = await context.newPage();
    await appPage.goto('https://dorisautomate.web.app', { waitUntil: 'networkidle', timeout: 60000 });
  } else {
    console.log('[WEB APP] Reusing existing web app tab...');
    await appPage.bringToFront();
    await appPage.reload({ waitUntil: 'networkidle' });
  }

  await appPage.waitForTimeout(3000);

  // Supply the directory to folderInput
  console.log('[WEB APP] Setting directory on #folderInput:', OUTPUT_DIR);
  const folderInput = await appPage.$('#folderInput');
  if (folderInput) {
    await folderInput.setInputFiles(OUTPUT_DIR);
    await appPage.waitForTimeout(2000);
  }

  // Paste 15-sentence script into #scriptInput
  console.log('[WEB APP] Setting 15-line script on #scriptInput...');
  const txtContent = fs.readFileSync(TXT_PATH, 'utf8').trim();
  const scriptInput = await appPage.$('#scriptInput');
  if (scriptInput) {
    await scriptInput.fill(txtContent);
    await scriptInput.dispatchEvent('input');
    await appPage.waitForTimeout(2000);
  }

  // Voice selection
  const voiceSelect = await appPage.$('#voiceSelect');
  if (voiceSelect) {
    await voiceSelect.selectOption('hope_professional');
    await voiceSelect.dispatchEvent('change');
    console.log('[WEB APP] Voice set to: Hope — Professional, Clear & Natural');
  }

  // Check alignment status
  const badgeText = await appPage.$eval('#alignmentBadge', el => el.innerText).catch(() => '');
  console.log('[WEB APP] Alignment Badge:', badgeText);
  await appPage.screenshot({ path: 'scripts/webapp_alignment_15_verified.png' });

  // Click Run Video Automation
  console.log('[WEB APP] Clicking "Run Video Automation" (#runBtn)...');
  const runBtn = await appPage.$('#runBtn');
  if (runBtn) {
    await appPage.evaluate(el => el.click(), runBtn);
    console.log('[WEB APP] Execution triggered!');
  }

  // Monitor logs and milestone progress
  console.log('[WEB APP] Monitoring execution logs and milestone progress...');
  let appDone = false;
  let appPoll = 0;
  let finalVideoUrl = null;

  while (!appDone && appPoll < 72) { // 6 minutes max
    await appPage.waitForTimeout(5000);
    appPoll++;

    const logText = await appPage.$eval('#logConsole', el => el.innerText).catch(() => '');
    const milestone = await appPage.$eval('#milestoneText', el => el.innerText).catch(() => '');
    const pct = await appPage.$eval('#progressPct', el => el.innerText).catch(() => '');

    console.log(`[APP MONITOR] [${appPoll * 5}s] ${pct} | ${milestone}`);

    if (logText.includes('[DONE]') || milestone.includes('Video successfully rendered') || pct === '100%') {
      console.log('[WEB APP] Video synthesis completed!');
      appDone = true;
      
      // Get video URL
      finalVideoUrl = await appPage.$eval('#videoPlayer', el => el.src).catch(() => null);
      if (!finalVideoUrl) {
        finalVideoUrl = await appPage.$eval('#downloadBtn', el => el.href).catch(() => null);
      }
      break;
    }
  }

  await appPage.screenshot({ path: 'scripts/webapp_video_completed.png' });
  console.log('[WEB APP] Final Video URL:', finalVideoUrl);
  console.log('====================================================');
  console.log('[WEB APP STAGE] COMPLETE!');
  console.log('====================================================');
}

main().catch(err => {
  console.error('[FATAL ERROR]', err);
  process.exit(1);
});
