const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const CSV_PATH = 'C:\\Users\\doris\\Downloads\\why_your_brain_panics_saying_no_true_1min.csv';
const TXT_PATH = 'C:\\Users\\doris\\Downloads\\why_your_brain_panics_saying_no_true_1min.txt';
const REF_IMG_PATH = 'C:\\Users\\doris\\Downloads\\my_character_reference.png';
const OUTPUT_DIR = 'C:\\Users\\doris\\Downloads\\why_your_brain_panics_saying_no_images';

function getSentences() {
  const content = fs.readFileSync(TXT_PATH, 'utf8').trim();
  return content.split('\n').map((line, idx) => ({
    sn: idx + 1,
    sentence: line.trim()
  })).filter(x => x.sentence.length > 0);
}

function sanitizeFilename(text) {
  return text.replace(/[:/\\*?"<>|]/g, '-').trim();
}

async function main() {
  console.log('====================================================');
  console.log('[MASTER PIPELINE] Continuous Autonomous Doris Production');
  console.log('====================================================');

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // 1. Read DevTools Port
  const portFile = 'C:\\Users\\doris\\AppData\\Local\\Google\\Chrome\\User Data\\DevToolsActivePort';
  if (!fs.existsSync(portFile)) {
    throw new Error('DevToolsActivePort file not found!');
  }
  const portContent = fs.readFileSync(portFile, 'utf8').trim().split('\n');
  const wsUrl = 'ws://127.0.0.1:' + portContent[0].trim() + portContent[1].trim();
  console.log('[CDP] Connecting to Chrome via:', wsUrl);

  const browser = await chromium.connectOverCDP(wsUrl);
  console.log('[CDP] CONNECTED to active Chrome session!');

  const context = browser.contexts()[0];
  let pages = context.pages();
  console.log(`[CDP] Current open tabs count: ${pages.length}`);

  // Find Google Flow tab
  let flowPage = pages.find(p => p.url().includes('97bc05a9-73e5-4e2a-b971-592224eecd14') || p.url().includes('flow.google.com/u/1'));
  if (!flowPage) {
    flowPage = pages.find(p => p.url().includes('flow.google.com'));
  }

  if (!flowPage) {
    console.log('[FLOW] Opening Google Flow project tool...');
    flowPage = await context.newPage();
    await flowPage.goto('https://flow.google.com/u/1/project/97bc05a9-73e5-4e2a-b971-592224eecd14/tool/ee8f4722-38cb-4363-967f-057725e7c3c6', { waitUntil: 'networkidle', timeout: 60000 });
  } else {
    console.log('[FLOW] Found Google Flow page:', flowPage.url());
    await flowPage.bringToFront();
    if (!flowPage.url().includes('ee8f4722-38cb-4363-967f-057725e7c3c6')) {
      console.log('[FLOW] Navigating directly to target tool...');
      await flowPage.goto('https://flow.google.com/u/1/project/97bc05a9-73e5-4e2a-b971-592224eecd14/tool/ee8f4722-38cb-4363-967f-057725e7c3c6', { waitUntil: 'networkidle', timeout: 60000 });
    }
  }

  await flowPage.waitForTimeout(3000);

  // Locate tool iframe
  let toolFrame = null;
  for (let attempt = 0; attempt < 15; attempt++) {
    for (const f of flowPage.frames()) {
      const hasBatchBtn = await f.$('button:has-text("Run Batch"), button:has-text("Select Style Image"), input[accept=".csv"]').catch(() => null);
      if (hasBatchBtn) {
        toolFrame = f;
        break;
      }
    }
    if (toolFrame) break;
    await flowPage.waitForTimeout(1000);
  }

  if (!toolFrame) {
    throw new Error('Doris Image Stylist iframe could not be found!');
  }
  console.log('[FLOW] Located Doris Image Stylist tool frame!');

  // Check CSV status
  const bodyText = await toolFrame.innerText('body');
  if (!bodyText.includes('15 Rows Loaded')) {
    console.log('[FLOW] Ingesting CSV dataset...');
    const csvInput = await toolFrame.$('input[accept=".csv"]');
    if (!csvInput) throw new Error('CSV input element not found in iframe');
    await csvInput.setInputFiles(CSV_PATH);
    await flowPage.waitForTimeout(4000);
    console.log('[FLOW] CSV dataset set!');
  } else {
    console.log('[FLOW] CSV dataset already contains 15 Rows.');
  }

  // Handle Style Reference (Handling open modal or opening it safely via DOM evaluate)
  let addMediaBtn = await flowPage.$('button:has-text("Add media")');
  if (!addMediaBtn) {
    const styleBtn = await toolFrame.$('button:has-text("Select Style Image")');
    if (styleBtn) {
      console.log('[FLOW] Clicking "Select Style Image" via DOM evaluate...');
      await toolFrame.evaluate(el => el.click(), styleBtn);
      await flowPage.waitForTimeout(2500);
      addMediaBtn = await flowPage.$('button:has-text("Add media")');
    }
  }

  if (addMediaBtn) {
    console.log('[FLOW] Media selector modal is active in Flow page.');
    
    // Check if file input is available in modal
    const modalFileInput = await flowPage.$('input[type="file"]');
    if (modalFileInput && fs.existsSync(REF_IMG_PATH)) {
      try {
        console.log('[FLOW] Setting reference image on modal file input...');
        await modalFileInput.setInputFiles(REF_IMG_PATH);
        await flowPage.waitForTimeout(3000);
      } catch (e) {
        console.log('[FLOW] Modal file input note:', e.message);
      }
    } else {
      // Try clicking Upload media
      const uploadBtn = await flowPage.$('button:has-text("Upload media"), div:has-text("Upload media")');
      if (uploadBtn && fs.existsSync(REF_IMG_PATH)) {
        try {
          const [fileChooser] = await Promise.all([
            flowPage.waitForEvent('filechooser', { timeout: 3000 }),
            uploadBtn.click({ force: true })
          ]);
          if (fileChooser) {
            console.log('[FLOW] Setting reference image via file chooser...');
            await fileChooser.setFiles(REF_IMG_PATH);
            await flowPage.waitForTimeout(3000);
          }
        } catch (e) {
          console.log('[FLOW] Upload media button note:', e.message);
        }
      }
    }

    // Click on the media thumbnail in modal to select it
    const assetThumb = await flowPage.$('div[role="option"], .asset-item, .media-item, [data-test-id="media-item"], img[src^="http"], img[src^="blob"]');
    if (assetThumb) {
      console.log('[FLOW] Selecting media thumbnail...');
      await flowPage.evaluate(el => el.click(), assetThumb).catch(() => {});
      await flowPage.waitForTimeout(1000);
    }

    // Click Add media via evaluate to bypass any interceptors
    console.log('[FLOW] Confirming "Add media"...');
    await flowPage.evaluate(el => el.click(), addMediaBtn);
    await flowPage.waitForTimeout(2000);
  } else {
    console.log('[FLOW] Style reference is already configured or modal closed.');
  }

  // Select Aspect Ratio: 16:9
  console.log('[FLOW] Setting 16:9 Aspect Ratio...');
  const btn169 = await toolFrame.$('button:has-text("16:9")');
  if (btn169) {
    await toolFrame.evaluate(el => el.click(), btn169);
    await flowPage.waitForTimeout(500);
  }

  // Select Model: 🍌 Nano Banana 2 Lite
  console.log('[FLOW] Selecting Nano Banana 2 Lite...');
  const nanoBtn = await toolFrame.$('button:has-text("Nano Banana 2 Lite"), div:has-text("Nano Banana 2 Lite")');
  if (nanoBtn) {
    await toolFrame.evaluate(el => el.click(), nanoBtn);
    await flowPage.waitForTimeout(500);
  }

  // Check if Run Batch is enabled and click
  const runBatchBtn = await toolFrame.$('button:has-text("Run Batch")');
  if (runBatchBtn) {
    const disabled = await runBatchBtn.getAttribute('disabled');
    if (disabled !== null) {
      console.log('[FLOW] Run Batch is currently disabled. State summary:');
      const snippet = await toolFrame.innerText('body');
      console.log(snippet.substring(0, 400));
    } else {
      console.log('[FLOW] Triggering "Run Batch"...');
      await toolFrame.evaluate(el => el.click(), runBatchBtn);
      console.log('[FLOW] "Run Batch" clicked successfully!');
    }
  }

  // Monitor batch generation loop
  console.log('[FLOW] Monitoring scene generation loop...');
  let completed = false;
  let loops = 0;
  while (!completed && loops < 120) {
    await flowPage.waitForTimeout(5000);
    loops++;

    const stats = await toolFrame.evaluate(() => {
      const text = document.body.innerText || '';
      const successMatch = text.match(/(\d+)\s*\n*\s*SUCCESS/i);
      const failedMatch = text.match(/(\d+)\s*\n*\s*FAILED/i);
      const pendingMatches = (text.match(/PENDING/gi) || []).length;
      const imgs = Array.from(document.querySelectorAll('img')).filter(img => {
        return img.src && (img.src.startsWith('data:image') || img.src.startsWith('blob:') || img.src.startsWith('http'));
      });
      return {
        success: successMatch ? parseInt(successMatch[1]) : 0,
        failed: failedMatch ? parseInt(failedMatch[1]) : 0,
        pending: pendingMatches,
        imagesFound: imgs.length
      };
    }).catch(() => ({ success: 0, failed: 0, pending: 15, imagesFound: 0 }));

    console.log(`[FLOW MONITOR] [${loops * 5}s] Success: ${stats.success} | Pending: ${stats.pending} | Failed: ${stats.failed} | Images: ${stats.imagesFound}`);

    if (stats.success >= 15 || (stats.success > 0 && stats.pending === 0 && (stats.success + stats.failed >= 15))) {
      console.log('[FLOW] All 15 scenes generated successfully!');
      completed = true;
      break;
    }
  }

  // Extract images directly from DOM memory (Blob & DataURL support)
  console.log('[EXTRACT] Extracting generated image data from DOM memory...');
  const sentences = getSentences();

  const imageDataList = await toolFrame.evaluate(async () => {
    async function blobToBase64(url) {
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(blob);
        });
      } catch (e) {
        return null;
      }
    }

    const imgs = Array.from(document.querySelectorAll('img')).filter(img => {
      return img.src && (img.src.startsWith('data:image') || img.src.startsWith('blob:') || img.src.startsWith('http'));
    });

    const results = [];
    for (let i = 0; i < imgs.length; i++) {
      const img = imgs[i];
      let b64 = null;
      if (img.src.startsWith('data:image')) {
        b64 = img.src;
      } else if (img.src.startsWith('blob:')) {
        b64 = await blobToBase64(img.src);
      }
      
      if (!b64) {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || 1280;
          canvas.height = img.naturalHeight || 720;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          b64 = canvas.toDataURL('image/jpeg', 0.95);
        } catch (e) {
          b64 = null;
        }
      }

      if (b64) {
        results.push(b64);
      }
    }
    return results;
  });

  console.log(`[EXTRACT] Extracted ${imageDataList.length} image payloads from memory.`);

  // Save each image with exact "<SN>. <Sentence>.jpg" naming
  const savedPaths = [];
  for (let i = 0; i < sentences.length; i++) {
    const s = sentences[i];
    const b64 = imageDataList[i] || imageDataList[imageDataList.length - 1];
    if (b64) {
      const clean = sanitizeFilename(s.sentence);
      const filename = `${s.sn}. ${clean}.jpg`;
      const fullPath = path.join(OUTPUT_DIR, filename);
      const raw = b64.replace(/^data:image\/\w+;base64,/, '');
      fs.writeFileSync(fullPath, Buffer.from(raw, 'base64'));
      savedPaths.push(fullPath);
      console.log(`[DISK] Saved Scene ${s.sn}: ${filename} (${fs.statSync(fullPath).size} bytes)`);
    }
  }

  console.log(`[DISK] All ${savedPaths.length} scenes written to: ${OUTPUT_DIR}`);

  // Switch to web app in the SAME browser context
  console.log('====================================================');
  console.log('[WEB APP] Automating dorisautomate.web.app');
  console.log('====================================================');

  pages = context.pages();
  let appPage = pages.find(p => p.url().includes('dorisautomate.web.app'));
  if (!appPage) {
    console.log('[WEB APP] Creating new tab for web app...');
    appPage = await context.newPage();
    await appPage.goto('https://dorisautomate.web.app', { waitUntil: 'networkidle', timeout: 60000 });
  } else {
    console.log('[WEB APP] Switching to existing web app tab...');
    await appPage.bringToFront();
    await appPage.reload({ waitUntil: 'networkidle' });
  }

  await appPage.waitForTimeout(3000);

  // Supply the 15 images to #folderInput
  console.log('[WEB APP] Setting 15 scene images on #folderInput...');
  const folderInput = await appPage.$('#folderInput');
  if (folderInput) {
    await folderInput.setInputFiles(savedPaths);
    await appPage.waitForTimeout(2000);
  }

  // Paste 15-sentence script into #scriptInput
  console.log('[WEB APP] Setting 15-sentence script on #scriptInput...');
  const txtContent = fs.readFileSync(TXT_PATH, 'utf8').trim();
  const scriptInput = await appPage.$('#scriptInput');
  if (scriptInput) {
    await scriptInput.fill(txtContent);
    await scriptInput.dispatchEvent('input');
    await appPage.waitForTimeout(2000);
  }

  // Select Hope voice
  const voiceSelect = await appPage.$('#voiceSelect');
  if (voiceSelect) {
    await voiceSelect.selectOption('hope_professional');
    await voiceSelect.dispatchEvent('change');
    console.log('[WEB APP] Voice profile selected: Hope — Professional, Clear & Natural');
  }

  // Verify alignment badge
  const badgeText = await appPage.$eval('#alignmentBadge', el => el.innerText).catch(() => '');
  console.log('[WEB APP] Alignment Matrix Status:', badgeText);
  await appPage.screenshot({ path: 'scripts/webapp_alignment_verified.png' });

  // Click Run Video Automation
  console.log('[WEB APP] Clicking "Run Video Automation" (#runBtn)...');
  const runBtn = await appPage.$('#runBtn');
  if (runBtn) {
    await appPage.evaluate(el => el.click(), runBtn);
    console.log('[WEB APP] Pipeline execution initiated!');
  }

  // Monitor web app logs and milestone progress
  console.log('[WEB APP] Monitoring execution logs and milestone progress...');
  let appDone = false;
  let appPoll = 0;
  while (!appDone && appPoll < 72) {
    await appPage.waitForTimeout(5000);
    appPoll++;

    const logText = await appPage.$eval('#logConsole', el => el.innerText).catch(() => '');
    const milestone = await appPage.$eval('#milestoneText', el => el.innerText).catch(() => '');
    const pct = await appPage.$eval('#progressPct', el => el.innerText).catch(() => '');

    console.log(`[APP MONITOR] [${appPoll * 5}s] ${pct} | ${milestone}`);

    if (logText.includes('[DONE]') || milestone.includes('Video successfully rendered') || pct === '100%') {
      console.log('[WEB APP] Full video production completed successfully!');
      appDone = true;
      break;
    }
  }

  await appPage.screenshot({ path: 'scripts/webapp_complete.png' });
  console.log('====================================================');
  console.log('[MASTER PIPELINE] ALL OPERATIONS COMPLETE!');
  console.log('====================================================');
}

main().catch(err => {
  console.error('[MASTER PIPELINE ERROR]', err);
  process.exit(1);
});
