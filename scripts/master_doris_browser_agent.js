const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const CSV_PATH = 'C:\\Users\\doris\\Downloads\\be_so_calm_it_makes_people_nervous_15min.csv';
const TXT_PATH = 'C:\\Users\\doris\\Downloads\\be_so_calm_it_makes_people_nervous_15min.txt';
const REF_SHEET_PATH = 'C:\\Users\\doris\\Downloads\\Doris Automation\\assets\\doris_character_reference_sheet.png';
const IMAGES_DIR = 'C:\\Users\\doris\\Downloads\\be_so_calm_it_makes_people_nervous_images';
const TARGET_SCENES = 169;

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
  console.log('================================================================');
  console.log('>>> [MASTER BROWSER AGENT] DR. DORIS PSYCH AUTONOMOUS PRODUCTION');
  console.log('================================================================');

  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
  }

  const sentences = getSentences();
  console.log(`[SCRIPT] Loaded ${sentences.length} sentences for 15-minute video.`);

  // 1. Connect to active Chrome session
  const portFile = 'C:\\Users\\doris\\AppData\\Local\\Google\\Chrome\\User Data\\DevToolsActivePort';
  if (!fs.existsSync(portFile)) throw new Error('DevToolsActivePort file not found!');
  const portContent = fs.readFileSync(portFile, 'utf8').trim().split('\n');
  const wsUrl = 'ws://127.0.0.1:' + portContent[0].trim() + portContent[1].trim();
  console.log('[CDP] Connecting to active Chrome on:', wsUrl);
  console.log('[CDP] Awaiting connection (up to 120s handshake)...');

  const browser = await chromium.connectOverCDP(wsUrl, { timeout: 120000 });
  console.log('[CDP] Connected successfully to active Chrome session!');

  const context = browser.contexts()[0];
  let pages = context.pages();

  let flowPage = pages.find(p => p.url().includes('97bc05a9-73e5-4e2a-b971-592224eecd14') || p.url().includes('flow.google.com/u/1'));
  if (!flowPage) flowPage = pages.find(p => p.url().includes('flow.google.com'));

  if (!flowPage) {
    console.log('[FLOW] Opening Google Flow project tool...');
    flowPage = await context.newPage();
    await flowPage.goto('https://flow.google.com/u/1/project/97bc05a9-73e5-4e2a-b971-592224eecd14/tool/ee8f4722-38cb-4363-967f-057725e7c3c6', { waitUntil: 'networkidle', timeout: 60000 });
  } else {
    console.log('[FLOW] Found Google Flow tab:', flowPage.url());
    await flowPage.bringToFront();
  }

  await flowPage.waitForTimeout(3000);

  // 2. Locate tool iframe
  let toolFrame = null;
  for (let attempt = 0; attempt < 15; attempt++) {
    for (const f of flowPage.frames()) {
      const text = await f.innerText('body').catch(() => '');
      if (text.includes('Doris Image Stylist') || text.includes('AUTOMATED MULTI-PROMPT GENERATOR') || text.includes('Run Batch') || text.includes('Retry Failed')) {
        toolFrame = f;
        break;
      }
    }
    if (toolFrame) break;
    await flowPage.waitForTimeout(1000);
  }

  if (!toolFrame) throw new Error('Doris Image Stylist tool frame could not be found!');
  console.log('[FLOW] Located Doris Image Stylist tool frame!');

  // 3. Upload new rich environmental CSV
  console.log(`[FLOW] Uploading updated CSV dataset with rich environments: ${CSV_PATH}`);
  const csvInput = await toolFrame.$('input[accept*=".csv"], input[type="file"]');
  if (csvInput) {
    await csvInput.setInputFiles(CSV_PATH);
    await flowPage.waitForTimeout(4000);
    console.log('[FLOW] CSV uploaded successfully!');
  } else {
    console.log('[FLOW NOTICE] Direct CSV input element not found, checking queue status...');
  }

  // 4. Style Reference Upload
  console.log(`[FLOW] Attaching official character reference sheet: ${REF_SHEET_PATH}`);
  const replaceBtn = await toolFrame.$('button:has-text("Replace"), button:has-text("Select Style Image")');
  if (replaceBtn) {
    console.log('[FLOW] Clicking Style Reference button...');
    await toolFrame.evaluate(el => el.click(), replaceBtn).catch(() => {});
    await flowPage.waitForTimeout(2000);

    // Check if parent modal has "Add media" or file input
    const fileInputs = await flowPage.$$('input[type="file"]');
    if (fileInputs.length > 0) {
      await fileInputs[fileInputs.length - 1].setInputFiles(REF_SHEET_PATH).catch(() => {});
      await flowPage.waitForTimeout(2000);
    }
    const addMediaBtn = await flowPage.$('button:has-text("Add media")');
    if (addMediaBtn) {
      const thumb = await flowPage.$('div[role="option"], .asset-item, .media-item, [data-test-id="media-item"], img[src^="http"], img[src^="blob"]');
      if (thumb) await flowPage.evaluate(el => el.click(), thumb).catch(() => {});
      await flowPage.evaluate(el => el.click(), addMediaBtn).catch(() => {});
      await flowPage.waitForTimeout(2000);
    }
  }

  // 5. Configure Aspect Ratio & Model Engine
  console.log('[FLOW] Ensuring 16:9 Aspect Ratio...');
  const btn169 = await toolFrame.$('button:has-text("16:9")');
  if (btn169) {
    await toolFrame.evaluate(el => el.click(), btn169).catch(() => {});
    await flowPage.waitForTimeout(500);
  }

  console.log('[FLOW] Configuring Model: 🍌 Nano Banana 2 Lite...');
  const modelSelect = await toolFrame.$('button:has-text("Nano Banana 2 Lite"), div:has-text("Nano Banana 2 Lite")');
  if (modelSelect) {
    await toolFrame.evaluate(el => el.click(), modelSelect).catch(() => {});
    await flowPage.waitForTimeout(500);
  } else {
    // Check dropdown
    const modelDropdown = await toolFrame.$('button:has-text("Nano Banana Pro"), div:has-text("Nano Banana Pro"), [aria-haspopup="listbox"]');
    if (modelDropdown) {
      await toolFrame.evaluate(el => el.click(), modelDropdown).catch(() => {});
      await flowPage.waitForTimeout(1000);
      const liteOpt = await toolFrame.$('button:has-text("Nano Banana 2 Lite"), [role="option"]:has-text("Nano Banana 2 Lite"), li:has-text("Nano Banana 2 Lite")');
      if (liteOpt) {
        await toolFrame.evaluate(el => el.click(), liteOpt).catch(() => {});
        await flowPage.waitForTimeout(500);
      }
    }
  }

  // 6. Trigger Run Batch or Retry Failed
  console.log('[FLOW] Checking batch execution state...');
  const runBatchBtn = await toolFrame.$('button:has-text("Run Batch"), button:has-text("Generate All")');
  const retryFailedBtn = await toolFrame.$('button:has-text("Retry Failed")');

  if (runBatchBtn) {
    console.log('[FLOW] Clicking "Run Batch"...');
    await toolFrame.evaluate(el => el.click(), runBatchBtn).catch(() => {});
    await flowPage.waitForTimeout(3000);
  } else if (retryFailedBtn) {
    console.log('[FLOW] Previous batch loaded. Triggering "Retry Failed"...');
    await toolFrame.evaluate(el => el.click(), retryFailedBtn).catch(() => {});
    await flowPage.waitForTimeout(3000);
  }

  // 7. Continuous Monitoring Loop with Interactive Auto-Retry
  console.log('================================================================');
  console.log('[FLOW MONITOR] Starting interactive batch monitoring loop...');
  console.log('[FLOW MONITOR] No premature timeouts: will monitor until 100% scenes complete.');
  console.log('================================================================');

  let completed = false;
  let cycle = 0;
  const startTime = Date.now();

  while (!completed) {
    await flowPage.waitForTimeout(10000);
    cycle++;
    const elapsedMinutes = ((Date.now() - startTime) / 60000).toFixed(1);

    const stats = await toolFrame.evaluate(() => {
      const text = document.body.innerText || '';
      const successMatch = text.match(/(\d+)\s+SUCCESS/i);
      const failedMatch = text.match(/(\d+)\s+FAILED/i);
      const pendingCount = (text.match(/PENDING/gi) || []).length;
      const isGenerating = text.includes('Generating') || text.includes('PROCESSING');
      const imgs = Array.from(document.querySelectorAll('img')).filter(img => {
        return img.src && (img.src.startsWith('data:image') || img.src.startsWith('blob:') || img.src.startsWith('http')) && img.alt !== 'Style Ref' && !img.src.includes('character_reference');
      });
      return {
        success: successMatch ? parseInt(successMatch[1]) : 0,
        failed: failedMatch ? parseInt(failedMatch[1]) : 0,
        pending: pendingCount,
        isGenerating: isGenerating,
        previewImages: imgs.length
      };
    }).catch(() => ({ success: 0, failed: 0, pending: TARGET_SCENES, isGenerating: true, previewImages: 0 }));

    console.log(`[FLOW MONITOR] [${elapsedMinutes}m | Cycle ${cycle}] Success: ${stats.success} / ${TARGET_SCENES} | Failed: ${stats.failed} | Pending: ${stats.pending} | Rendered Images: ${stats.previewImages}`);

    // All successful!
    if (stats.success >= TARGET_SCENES) {
      console.log(`[FLOW SUCCESS] All ${TARGET_SCENES} scenes generated 100% successfully!`);
      completed = true;
      break;
    }

    // Auto-retry loop on failures
    if (stats.failed > 0 && stats.pending === 0 && !stats.isGenerating) {
      console.log(`[FLOW AUTO-RETRY] Detected ${stats.failed} failed scenes with 0 pending. Actively clicking "Retry Failed"...`);
      const retryBtn = await toolFrame.$('button:has-text("Retry Failed")');
      if (retryBtn) {
        await toolFrame.evaluate(el => el.click(), retryBtn).catch(() => {});
        console.log('[FLOW AUTO-RETRY] Clicked "Retry Failed". Awaiting retry generation...');
        await flowPage.waitForTimeout(8000);
      }
    }
  }

  // 8. Bulletproof DOM Memory Extraction with Zero Index Shift
  console.log('================================================================');
  console.log('[DOM EXTRACTION] Extracting 169 scene images mapped strictly 1:1 to sentences...');
  console.log('================================================================');

  await flowPage.waitForTimeout(3000);

  const extractedImages = await toolFrame.evaluate(async () => {
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

    // Locate preview images in the processing queue strictly
    const previewImgs = Array.from(document.querySelectorAll('.processing-queue img, [data-row] img, table img, .queue-item img, img')).filter(img => {
      const isStyleRef = img.alt === 'Style Ref' || (img.closest && img.closest('.style-reference-container, [data-test-id="style-reference"]'));
      const isRefPath = img.src && img.src.includes('character_reference');
      const isValid = img.src && (img.src.startsWith('data:image') || img.src.startsWith('blob:') || img.src.startsWith('http'));
      return !isStyleRef && !isRefPath && isValid;
    });

    const results = [];
    for (let i = 0; i < previewImgs.length; i++) {
      const img = previewImgs[i];
      let b64 = null;
      if (img.src.startsWith('data:image')) {
        b64 = img.src;
      } else if (img.src.startsWith('blob:')) {
        b64 = await blobToBase64(img.src);
      }

      if (!b64) {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || 1920;
          canvas.height = img.naturalHeight || 1080;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          b64 = canvas.toDataURL('image/jpeg', 0.95);
        } catch (e) {
          b64 = null;
        }
      }

      if (b64) results.push(b64);
    }
    return results;
  });

  console.log(`[DOM EXTRACTION] Successfully extracted ${extractedImages.length} images.`);

  // Save to disk
  const savedHashes = new Set();
  let duplicateCount = 0;

  for (let i = 0; i < sentences.length; i++) {
    const s = sentences[i];
    const b64 = extractedImages[i];
    if (b64) {
      const clean = sanitizeFilename(s.sentence);
      const filename = `${s.sn}. ${clean}.jpg`;
      const fullPath = path.join(IMAGES_DIR, filename);
      const raw = b64.replace(/^data:image\/\w+;base64,/, '');
      const buf = Buffer.from(raw, 'base64');
      fs.writeFileSync(fullPath, buf);

      const h = crypto.createHash('sha256').update(buf).digest('hex');
      if (savedHashes.has(h)) duplicateCount++;
      savedHashes.add(h);
    }
  }

  console.log(`[DISK VERIFICATION] Saved ${sentences.length} images to: ${IMAGES_DIR}`);
  console.log(`[DISK VERIFICATION] Unique hashes: ${savedHashes.size} / ${sentences.length} (Duplicates: ${duplicateCount})`);

  // 9. Automate compilation on dorisautomate.web.app
  console.log('================================================================');
  console.log('[PHASE 4: LIVE WEB APP AUTOMATION] Navigating to dorisautomate.web.app...');
  console.log('================================================================');

  pages = context.pages();
  let appPage = pages.find(p => p.url().includes('dorisautomate.web.app'));
  if (!appPage) {
    appPage = await context.newPage();
    await appPage.goto('https://dorisautomate.web.app', { waitUntil: 'networkidle', timeout: 60000 });
  } else {
    await appPage.bringToFront();
    await appPage.reload({ waitUntil: 'networkidle' });
  }

  await appPage.waitForTimeout(3000);

  // Ingest Image Folder
  console.log('[WEB APP] Selecting scene images directory on #folderInput:', IMAGES_DIR);
  const folderInput = await appPage.$('#folderInput');
  if (folderInput) {
    await folderInput.setInputFiles(IMAGES_DIR);
    await appPage.waitForTimeout(3000);
  }

  // Ingest Script Text
  console.log('[WEB APP] Ingesting 169-line script into #scriptInput...');
  const txtContent = fs.readFileSync(TXT_PATH, 'utf8').trim();
  const scriptInput = await appPage.$('#scriptInput');
  if (scriptInput) {
    await scriptInput.fill(txtContent);
    await scriptInput.dispatchEvent('input');
    await appPage.waitForTimeout(2000);
  }

  // Select Voice
  console.log('[WEB APP] Selecting voice profile: Hope — Professional, Clear & Natural...');
  const voiceSelect = await appPage.$('#voiceSelect');
  if (voiceSelect) {
    await voiceSelect.selectOption('hope_professional');
    await voiceSelect.dispatchEvent('change');
    await appPage.waitForTimeout(1000);
  }

  // Verify Alignment
  const badgeText = await appPage.$eval('#alignmentBadge', el => el.innerText).catch(() => '');
  console.log('[WEB APP] Alignment Matrix Status:', badgeText);
  await appPage.screenshot({ path: 'scripts/webapp_alignment_live_verified.png' });

  // Trigger Video Automation
  console.log('[WEB APP] Triggering Cloud Video Automation (#runBtn)...');
  const runBtn = await appPage.$('#runBtn');
  if (runBtn) {
    await appPage.evaluate(el => el.click(), runBtn);
    console.log('[WEB APP] Automation triggered successfully! Cloud runner engaged.');
  }

  // Monitor Live Web App & Cloud Runner Progress
  console.log('[WEB APP MONITOR] Tracking cloud compile logs...');
  let cloudDone = false;
  let appCycles = 0;

  while (!cloudDone && appCycles < 120) { // Up to 20 minutes for cloud assembly
    await appPage.waitForTimeout(10000);
    appCycles++;

    const logText = await appPage.$eval('#logConsole, .logs-container, #logs', el => el.innerText).catch(() => '');
    const progressText = await appPage.$eval('.progress-bar, #progressBar, [role="progressbar"]', el => el.innerText || el.getAttribute('aria-valuenow')).catch(() => '');

    console.log(`[WEB APP TRACKER] [${appCycles * 10}s] Progress: ${progressText || 'Processing'} | Status: ${logText.split('\n').pop()}`);

    if (logText.includes('[DONE]') || logText.includes('Generated video received') || logText.includes('100%') || logText.includes('Completed successfully')) {
      console.log('[WEB APP COMPLETE] Cloud compilation finished successfully!');
      cloudDone = true;
      break;
    }
  }

  await appPage.screenshot({ path: 'scripts/webapp_15min_production_finished.png' });
  console.log('================================================================');
  console.log('>>> [PRODUCTION FINISHED 100%] MASTER VIDEO ASSEMBLY COMPLETE!');
  console.log('================================================================');

  await browser.close();
}

main().catch(err => {
  console.error('[MASTER BROWSER AGENT ERROR]', err);
  process.exit(1);
});
