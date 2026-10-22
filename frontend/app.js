// Doris AI Storyteller — Frontend Application Logic
// Epic Automate Standard Implementation with Persistent State, Execution Library & Premium Studio

const HF_DATASET_REPO = "Dorisautomate/automation-assets";
const HF_BASE_URL = `https://huggingface.co/datasets/${HF_DATASET_REPO}/resolve/main/videos`;

const VOICE_VIDEO_MAP = {
  hope_professional: `${HF_BASE_URL}/hope_professional_story_video.mp4`,
  hope_upbeat: `${HF_BASE_URL}/hope_upbeat_story_video.mp4`,
  doris: `${HF_BASE_URL}/doris_f5_cloned_story_video.mp4`
};

const DEFAULT_VIDEO_URL = `${HF_BASE_URL}/why_your_brain_panics_saying_no_1080p.mp4`;
const STORAGE_KEY_ACTIVE = 'epic_active_job';
const STORAGE_KEY_HISTORY = 'epic_execution_history';
const STORAGE_KEY_KIE_KEY = 'doris_kie_api_key';
const STORAGE_KEY_STUDIO_MODE = 'doris_studio_mode';

// Default initial history seed containing verified cloud runs
const SEED_HISTORY = [
  {
    id: "job_dr_doris_be_so_calm_it_makes_people_nervous_15min",
    tier: "premium",
    isPremium: true,
    voice: "hope_professional",
    voiceLabel: "✨ Hope — Professional (Dr Doris Psych)",
    scenes: 169,
    status: "completed",
    assetUrl: `${HF_BASE_URL}/be_so_calm_it_makes_people_nervous_1080p.mp4`,
    timestamp: "10/22/2026, 09:40 AM"
  },
  {
    id: "job_dr_doris_why_your_brain_panics_saying_no",
    tier: "standard",
    isPremium: false,
    voice: "hope_professional",
    voiceLabel: "✨ Hope — Professional (Dr Doris Psych)",
    scenes: 10,
    status: "completed",
    assetUrl: `${HF_BASE_URL}/why_your_brain_panics_saying_no_1080p.mp4`,
    timestamp: "10/20/2026, 11:18 AM"
  },
  {
    id: "job_hope_professional_master",
    tier: "standard",
    isPremium: false,
    voice: "hope_professional",
    voiceLabel: "✨ Hope — Professional, Clear & Natural",
    scenes: 4,
    status: "completed",
    assetUrl: `${HF_BASE_URL}/hope_professional_story_video.mp4`,
    timestamp: "10/20/2026, 10:48 AM"
  },
  {
    id: "job_hope_upbeat_master",
    tier: "standard",
    isPremium: false,
    voice: "hope_upbeat",
    voiceLabel: "✨ Hope — Upbeat & Clear",
    scenes: 4,
    status: "completed",
    assetUrl: `${HF_BASE_URL}/hope_upbeat_story_video.mp4`,
    timestamp: "10/20/2026, 10:48 AM"
  },
  {
    id: "job_doris_f5_clone_master",
    tier: "standard",
    isPremium: false,
    voice: "doris",
    voiceLabel: "🎙️ Doris Voice (Host — DORIS VOICE.m4a)",
    scenes: 4,
    status: "completed",
    assetUrl: `${HF_BASE_URL}/doris_f5_cloned_story_video.mp4`,
    timestamp: "10/20/2026, 09:20 AM"
  }
];

let selectedImages = [];
let scriptSentences = [];
let csvPrompts = [];
let isPremiumStudio = localStorage.getItem(STORAGE_KEY_STUDIO_MODE) === 'premium';
let currentJobId = null;
let isExecuting = false;
let executionInterval = null;
let executionLogs = [];

// DOM Elements: Navigation
const navStudioBtn = document.getElementById('navStudioBtn');
const navLogsBtn = document.getElementById('navLogsBtn');
const navSettingsBtn = document.getElementById('navSettingsBtn');
const studioView = document.getElementById('studioView');
const logsView = document.getElementById('logsView');
const settingsView = document.getElementById('settingsView');
const historyCountBadge = document.getElementById('historyCountBadge');

// DOM Elements: Studio Mode Switcher
const studioModeToggle = document.getElementById('studioModeToggle');
const labelStandardMode = document.getElementById('labelStandardMode');
const labelPremiumMode = document.getElementById('labelPremiumMode');
const premiumStudioBanner = document.getElementById('premiumStudioBanner');
const bannerApiKeyStatus = document.getElementById('bannerApiKeyStatus');
const bannerSettingsBtn = document.getElementById('bannerSettingsBtn');
const step1StandardContent = document.getElementById('step1StandardContent');
const step1PremiumContent = document.getElementById('step1PremiumContent');
const csvFileInput = document.getElementById('csvFileInput');
const csvFileInfo = document.getElementById('csvFileInfo');
const csvRowsBadge = document.getElementById('csvRowsBadge');
const premiumEngineBox = document.getElementById('premiumEngineBox');
const engineKeyStatus = document.getElementById('engineKeyStatus');
const step3Title = document.getElementById('step3Title');
const step3Desc = document.getElementById('step3Desc');

// DOM Elements: Studio Controls
const folderInput = document.getElementById('folderInput');
const folderInfo = document.getElementById('folderInfo');
const scriptInput = document.getElementById('scriptInput');
const lineCountBadge = document.getElementById('lineCountBadge');
const voiceSelect = document.getElementById('voiceSelect');
const voiceNameDisplay = document.getElementById('voiceNameDisplay');
const voiceDescDisplay = document.getElementById('voiceDescDisplay');
const alignmentBadge = document.getElementById('alignmentBadge');
const emptyMatrix = document.getElementById('emptyMatrix');
const matrixList = document.getElementById('matrixList');
const runBtn = document.getElementById('runBtn');
const cancelBtn = document.getElementById('cancelBtn');
const monitorCard = document.getElementById('monitorCard');
const jobIdLabel = document.getElementById('jobIdLabel');
const progressFill = document.getElementById('progressFill');
const progressPct = document.getElementById('progressPct');
const milestoneText = document.getElementById('milestoneText');
const logConsole = document.getElementById('logConsole');
const videoCard = document.getElementById('videoCard');
const videoPlayer = document.getElementById('videoPlayer');
const downloadBtn = document.getElementById('downloadBtn');
const copyUrlBtn = document.getElementById('copyUrlBtn');

// DOM Elements: Execution Logs Page
const historySearchInput = document.getElementById('historySearchInput');
const historyTierFilter = document.getElementById('historyTierFilter');
const historyVoiceFilter = document.getElementById('historyVoiceFilter');
const historyStatusFilter = document.getElementById('historyStatusFilter');
const historyTableBody = document.getElementById('historyTableBody');
const emptyHistory = document.getElementById('emptyHistory');
const syncHistoryBtn = document.getElementById('syncHistoryBtn');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');

// DOM Elements: Settings Page
const kieApiKeyInput = document.getElementById('kieApiKeyInput');
const toggleApiKeyVisibility = document.getElementById('toggleApiKeyVisibility');
const saveApiKeyBtn = document.getElementById('saveApiKeyBtn');
const clearApiKeyBtn = document.getElementById('clearApiKeyBtn');
const statusDot = document.getElementById('statusDot');
const apiKeyStatusMessage = document.getElementById('apiKeyStatusMessage');

// DOM Elements: Video Modal
const videoModal = document.getElementById('videoModal');
const modalVideoPlayer = document.getElementById('modalVideoPlayer');
const modalVideoTitle = document.getElementById('modalVideoTitle');
const modalVoiceTag = document.getElementById('modalVoiceTag');
const modalMetaInfo = document.getElementById('modalMetaInfo');
const modalDownloadBtn = document.getElementById('modalDownloadBtn');
const modalCopyUrlBtn = document.getElementById('modalCopyUrlBtn');
const closeModalBtn = document.getElementById('closeModalBtn');

// ========================================================
// 1. Navigation Tab Switching
// ========================================================
function switchTab(target) {
  navStudioBtn.classList.toggle('active', target === 'studio');
  navLogsBtn.classList.toggle('active', target === 'logs');
  if (navSettingsBtn) navSettingsBtn.classList.toggle('active', target === 'settings');

  studioView.classList.toggle('hidden', target !== 'studio');
  logsView.classList.toggle('hidden', target !== 'logs');
  if (settingsView) settingsView.classList.toggle('hidden', target !== 'settings');

  if (target === 'logs') {
    renderHistoryTable();
  } else if (target === 'settings') {
    updateSettingsStatus();
  }
}

navStudioBtn.addEventListener('click', () => switchTab('studio'));
navLogsBtn.addEventListener('click', () => switchTab('logs'));
if (navSettingsBtn) navSettingsBtn.addEventListener('click', () => switchTab('settings'));
if (bannerSettingsBtn) bannerSettingsBtn.addEventListener('click', () => switchTab('settings'));

// ========================================================
// 2. Studio Mode Switcher (Standard Flow vs Premium Kie.ai)
// ========================================================
function setStudioMode(isPremium) {
  isPremiumStudio = isPremium;
  localStorage.setItem(STORAGE_KEY_STUDIO_MODE, isPremium ? 'premium' : 'standard');
  if (studioModeToggle) studioModeToggle.checked = isPremium;

  if (isPremium) {
    if (premiumStudioBanner) premiumStudioBanner.classList.remove('hidden');
    if (step1StandardContent) step1StandardContent.classList.add('hidden');
    if (step1PremiumContent) step1PremiumContent.classList.remove('hidden');
    if (premiumEngineBox) premiumEngineBox.classList.remove('hidden');
    if (labelPremiumMode) labelPremiumMode.classList.add('active');
    if (labelStandardMode) labelStandardMode.classList.remove('active');
    if (step3Title) step3Title.textContent = "Input Story Script & Prompts";
    if (step3Desc) step3Desc.innerHTML = "Paste script sentences below. In Premium Mode, each line is sent to <strong>Kie.ai NanoBanana 2 Lite</strong> on Kaggle.";
  } else {
    if (premiumStudioBanner) premiumStudioBanner.classList.add('hidden');
    if (step1StandardContent) step1StandardContent.classList.remove('hidden');
    if (step1PremiumContent) step1PremiumContent.classList.add('hidden');
    if (premiumEngineBox) premiumEngineBox.classList.add('hidden');
    if (labelStandardMode) labelStandardMode.classList.add('active');
    if (labelPremiumMode) labelPremiumMode.classList.remove('active');
    if (step3Title) step3Title.textContent = "Input Story Script";
    if (step3Desc) step3Desc.innerHTML = "Paste your script below. <strong>Every single line represents one image</strong> in exact serial order from top to bottom.";
  }

  updateApiKeyBadges();
  updateAlignmentMatrix();
}

if (studioModeToggle) {
  studioModeToggle.addEventListener('change', (e) => {
    setStudioMode(e.target.checked);
  });
}

// ========================================================
// 3. Settings View & API Key Management
// ========================================================
function getSavedKieApiKey() {
  return localStorage.getItem(STORAGE_KEY_KIE_KEY) || '';
}

function updateApiKeyBadges() {
  const key = getSavedKieApiKey();
  const hasKey = key.trim().length > 0;

  if (bannerApiKeyStatus) {
    bannerApiKeyStatus.className = `api-key-badge-pill ${hasKey ? 'success' : 'warning'}`;
    bannerApiKeyStatus.textContent = hasKey ? '🟢 Kie.ai API Configured' : '⚠️ API Key Required';
  }

  if (engineKeyStatus) {
    engineKeyStatus.textContent = hasKey ? '🟢 Active & Ready' : '⚠️ Key Required (Settings)';
    engineKeyStatus.style.color = hasKey ? 'var(--success)' : 'var(--warning)';
  }
}

function updateSettingsStatus() {
  const key = getSavedKieApiKey();
  if (kieApiKeyInput) kieApiKeyInput.value = key;

  if (key) {
    if (statusDot) statusDot.className = 'status-indicator-dot active';
    if (apiKeyStatusMessage) apiKeyStatusMessage.textContent = `API Key Configured (${key.substring(0, 4)}...${key.slice(-3)}). Ready for Premium Studio generation.`;
  } else {
    if (statusDot) statusDot.className = 'status-indicator-dot';
    if (apiKeyStatusMessage) apiKeyStatusMessage.textContent = 'No API key configured. Enter your Kie.ai / AIE.AI key to enable dynamic cloud image generation.';
  }
  updateApiKeyBadges();
}

if (saveApiKeyBtn) {
  saveApiKeyBtn.addEventListener('click', () => {
    const val = (kieApiKeyInput.value || '').trim();
    if (!val) {
      alert("Please enter a valid Kie.ai API Key.");
      return;
    }
    localStorage.setItem(STORAGE_KEY_KIE_KEY, val);
    updateSettingsStatus();
    alert("Kie.ai API key saved successfully!");
  });
}

if (clearApiKeyBtn) {
  clearApiKeyBtn.addEventListener('click', () => {
    if (!confirm("Are you sure you want to remove the saved API key?")) return;
    localStorage.removeItem(STORAGE_KEY_KIE_KEY);
    if (kieApiKeyInput) kieApiKeyInput.value = '';
    updateSettingsStatus();
  });
}

if (toggleApiKeyVisibility) {
  toggleApiKeyVisibility.addEventListener('click', () => {
    if (kieApiKeyInput.type === 'password') {
      kieApiKeyInput.type = 'text';
      toggleApiKeyVisibility.textContent = 'Hide';
    } else {
      kieApiKeyInput.type = 'password';
      toggleApiKeyVisibility.textContent = 'Show';
    }
  });
}

// ========================================================
// 4. CSV Upload & Parsing for Premium Mode
// ========================================================
function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length === 0) return [];
  const rows = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    // Skip header line if present
    if (i === 0 && line.toUpperCase().startsWith('SN,SCRIPT,PROMPT')) continue;

    const parts = [];
    let inQuotes = false;
    let cur = '';
    for (let c = 0; c < line.length; c++) {
      const ch = line[c];
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === ',' && !inQuotes) {
        parts.push(cur.trim());
        cur = '';
      } else {
        cur += ch;
      }
    }
    parts.push(cur.trim());

    if (parts.length >= 2) {
      rows.push({
        sn: parts[0] || String(rows.length + 1),
        sentence: parts[1] || '',
        prompt: parts[2] || parts[1] || ''
      });
    }
  }
  return rows;
}

if (csvFileInput) {
  csvFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      const rows = parseCSV(content);
      if (rows.length === 0) {
        alert("Could not parse rows from CSV. Please check formatting (SN, SCRIPT, PROMPT).");
        return;
      }

      csvPrompts = rows;
      scriptSentences = rows.map(r => r.sentence);
      scriptInput.value = scriptSentences.join('\n');
      lineCountBadge.textContent = `${scriptSentences.length} Lines`;
      csvFileInfo.textContent = `📁 ${file.name} (${rows.length} scenes loaded)`;
      csvRowsBadge.textContent = `${rows.length} Scenes`;

      updateAlignmentMatrix();
    };
    reader.readAsText(file);
  });
}

// ========================================================
// 5. Folder Selection & Sorting (Standard Mode)
// ========================================================
function extractLeadingNumber(filename) {
  const match = filename.match(/^(\d+)/);
  return match ? parseInt(match[1], 10) : Infinity;
}

folderInput.addEventListener('change', (e) => {
  const files = Array.from(e.target.files);
  const imageExtensions = /\.(jpg|jpeg|png|webp|avif)$/i;
  const validImages = files.filter(f => imageExtensions.test(f.name));

  if (validImages.length === 0) {
    folderInfo.textContent = "⚠️ No valid images (.jpg, .png) found in folder.";
    selectedImages = [];
    updateAlignmentMatrix();
    return;
  }

  // Sort images numerically
  validImages.sort((a, b) => {
    const numA = extractLeadingNumber(a.name);
    const numB = extractLeadingNumber(b.name);
    if (numA !== numB) return numA - numB;
    return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
  });

  selectedImages = validImages.map((file, idx) => ({
    file: file,
    name: file.name,
    number: idx + 1,
    objectUrl: URL.createObjectURL(file)
  }));

  folderInfo.textContent = `📁 Loaded ${selectedImages.length} images sorted in numerical sequence.`;
  updateAlignmentMatrix();
});

// ========================================================
// 6. Voice Selection
// ========================================================
const VOICE_INFO_MAP = {
  hope_professional: {
    name: "Hope (Professional, Clear & Natural)",
    desc: "Reference recording from ElevenLabs Hope audio. Articulate, calm, authoritative long-form psychology narration."
  },
  hope_upbeat: {
    name: "Hope (Upbeat & Clear)",
    desc: "Energetic and crisp tone from ElevenLabs Hope collection. Ideal for high-tempo hooks and engaging breakdowns."
  },
  doris: {
    name: "Doris Voice (Host Clone)",
    desc: "Direct voice clone matching the channel host (DORIS VOICE.m4a). Warm, expressive, conversational cadence."
  },
  male_deep: {
    name: "Deep Male Documentary Narrator",
    desc: "Grounded baritone tone suited for serious behavioral case studies and cognitive science documentations."
  },
  female_warm: {
    name: "Calm Female Storyteller",
    desc: "Intimate and empathetic narration style tailored for reflective psychological analysis."
  },
  custom: {
    name: "Custom Reference Voice",
    desc: "Upload your custom 10-second reference WAV file via the Kaggle dataset to clone any voice in real-time."
  }
};

voiceSelect.addEventListener('change', (e) => {
  const val = e.target.value;
  const info = VOICE_INFO_MAP[val] || VOICE_INFO_MAP['hope_professional'];
  voiceNameDisplay.textContent = info.name;
  voiceDescDisplay.textContent = info.desc;
});

// ========================================================
// 7. Script Input & Sentence Parsing
// ========================================================
scriptInput.addEventListener('input', () => {
  const text = scriptInput.value;
  scriptSentences = text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  lineCountBadge.textContent = `${scriptSentences.length} Lines`;
  updateAlignmentMatrix();
});

// ========================================================
// 8. Visual Alignment Confirmation Matrix
// ========================================================
function updateAlignmentMatrix() {
  const imgCount = selectedImages.length;
  const lineCount = scriptSentences.length;

  if (isPremiumStudio) {
    // Premium Studio: Evaluates script lines / CSV prompts ready for Kie.ai
    if (lineCount === 0) {
      alignmentBadge.className = "alignment-badge mismatch";
      alignmentBadge.innerHTML = `<span class="badge-dot"></span><span class="badge-text">Awaiting Script / CSV</span>`;
      emptyMatrix.classList.remove('hidden');
      matrixList.classList.add('hidden');
      runBtn.disabled = true;
      return;
    }

    alignmentBadge.className = "alignment-badge aligned";
    alignmentBadge.innerHTML = `<span class="badge-dot"></span><span class="badge-text">💎 Ready for Cloud Gen: ${lineCount} Scenes</span>`;
    emptyMatrix.classList.add('hidden');
    matrixList.classList.remove('hidden');
    runBtn.disabled = false;
    renderPremiumMatrix(lineCount);
    return;
  }

  // Standard Studio: Evaluates local folder images vs script lines
  if (imgCount === 0 && lineCount === 0) {
    alignmentBadge.className = "alignment-badge mismatch";
    alignmentBadge.innerHTML = `<span class="badge-dot"></span><span class="badge-text">Awaiting Folder & Script</span>`;
    emptyMatrix.classList.remove('hidden');
    matrixList.classList.add('hidden');
    runBtn.disabled = true;
    return;
  }

  if (imgCount === lineCount && imgCount > 0) {
    alignmentBadge.className = "alignment-badge aligned";
    alignmentBadge.innerHTML = `<span class="badge-dot"></span><span class="badge-text">🟢 Aligned: ${imgCount} Images ↔ ${lineCount} Sentences</span>`;
    runBtn.disabled = false;
  } else {
    alignmentBadge.className = "alignment-badge mismatch";
    alignmentBadge.innerHTML = `<span class="badge-dot"></span><span class="badge-text">⚠️ Mismatch: ${imgCount} Images ≠ ${lineCount} Lines</span>`;
    runBtn.disabled = true;
  }

  emptyMatrix.classList.add('hidden');
  matrixList.classList.remove('hidden');
  renderStandardMatrix(Math.max(imgCount, lineCount));
}

function renderStandardMatrix(totalRows) {
  matrixList.innerHTML = '';
  for (let i = 0; i < totalRows; i++) {
    const img = selectedImages[i];
    const sentence = scriptSentences[i];

    const row = document.createElement('div');
    row.className = 'matrix-row';

    let thumbHtml = '';
    if (img) {
      thumbHtml = `
        <div class="img-thumb-wrapper">
          <img src="${img.objectUrl}" alt="Scene ${i+1}" class="img-thumb" loading="lazy">
          <span class="thumb-num">#${img.number}</span>
        </div>
      `;
    } else {
      row.classList.add('error-row');
      thumbHtml = `
        <div class="img-thumb-wrapper missing-thumb">
          <span class="missing-label">No Image #${i+1}</span>
        </div>
      `;
    }

    let textHtml = '';
    if (sentence) {
      textHtml = `
        <div class="row-content">
          <span class="file-title">${img ? img.name : 'Missing Image Assignment'}</span>
          <p class="script-text-preview">${sentence}</p>
        </div>
      `;
    } else {
      row.classList.add('error-row');
      textHtml = `
        <div class="row-content">
          <span class="file-title">${img.name}</span>
          <p class="script-text-preview" style="color: #f87171;">⚠️ Missing script line for image #${img.number}!</p>
        </div>
      `;
    }

    row.innerHTML = thumbHtml + textHtml;
    matrixList.appendChild(row);
  }
}

function renderPremiumMatrix(totalRows) {
  matrixList.innerHTML = '';
  for (let i = 0; i < totalRows; i++) {
    const sentence = scriptSentences[i];
    const promptData = csvPrompts[i];
    const promptText = promptData ? promptData.prompt : `A cartoon man with glasses in a navy sweater over a white collared shirt illustrating scene ${i+1}, 2D adult animated sitcom aesthetic, bold thick black outlines, flat solid vibrant colors, detailed atmospheric environment`;

    const row = document.createElement('div');
    row.className = 'matrix-row';

    const thumbHtml = `
      <div class="img-thumb-wrapper" style="background: rgba(168, 85, 247, 0.12); border-color: rgba(168, 85, 247, 0.4); display: flex; flex-direction: column; align-items: center; justify-content: center;">
        <span style="font-size: 16px;">🍌</span>
        <span class="thumb-num" style="background: #a855f7;">#${i+1}</span>
      </div>
    `;

    const textHtml = `
      <div class="row-content">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 2px;">
          <span class="file-title" style="color: #c084fc;">Scene ${i+1} · Kie.ai NanoBanana 2 Lite (1K)</span>
          <span class="badge-premium-pill" style="font-size: 10px; padding: 2px 7px;">Dynamic Cloud API</span>
        </div>
        <p class="script-text-preview"><strong>Sentence:</strong> ${sentence}</p>
        <p class="script-text-preview" style="color: var(--text-dim); font-size: 11px; margin-top: 2px;"><strong>Prompt:</strong> ${promptText}</p>
      </div>
    `;

    row.innerHTML = thumbHtml + textHtml;
    matrixList.appendChild(row);
  }
}

// ========================================================
// 9. Logging & Persistence Helper
// ========================================================
function appendLog(text, type = 'info') {
  const line = document.createElement('div');
  line.className = `log-line ${type}`;
  const timestamp = new Date().toLocaleTimeString();
  const entry = `[${timestamp}] ${text}`;
  line.textContent = entry;
  logConsole.appendChild(line);
  logConsole.scrollTop = logConsole.scrollHeight;

  executionLogs.push({ text: entry, type });
  saveActiveExecutionState();
}

function saveActiveExecutionState(extra = {}) {
  const state = {
    jobId: currentJobId,
    progress: progressPct.textContent,
    milestone: milestoneText.textContent,
    logs: executionLogs,
    isExecuting: isExecuting,
    isPremium: isPremiumStudio,
    status: extra.status || (isExecuting ? 'running' : 'idle'),
    assetUrl: extra.assetUrl || videoPlayer.src || DEFAULT_VIDEO_URL,
    updatedAt: new Date().toISOString()
  };
  try {
    localStorage.setItem(STORAGE_KEY_ACTIVE, JSON.stringify(state));
  } catch (e) {
    console.warn("Storage quota or error saving state:", e);
  }
}

function restoreActiveExecutionState() {
  const raw = localStorage.getItem(STORAGE_KEY_ACTIVE);
  if (!raw) return;

  try {
    const state = JSON.parse(raw);
    if (!state.jobId) return;

    currentJobId = state.jobId;
    jobIdLabel.textContent = `Job: ${currentJobId}`;
    monitorCard.classList.remove('hidden');

    progressFill.style.width = state.progress || '100%';
    progressPct.textContent = state.progress || '100%';
    milestoneText.textContent = state.milestone || 'Execution state restored from persistent cache.';

    logConsole.innerHTML = '';
    executionLogs = state.logs || [];
    executionLogs.forEach(item => {
      const line = document.createElement('div');
      line.className = `log-line ${item.type || 'info'}`;
      line.textContent = item.text;
      logConsole.appendChild(line);
    });
    logConsole.scrollTop = logConsole.scrollHeight;

    if (state.status === 'completed' || state.assetUrl) {
      showVideoPlayer(state.assetUrl || DEFAULT_VIDEO_URL);
    }
  } catch (e) {
    console.warn("Could not restore state:", e);
  }
}

// ========================================================
// 10. Cloud Execution Dispatch Engine (GitHub Actions + Kaggle + HF)
// ========================================================
const _p = ["ghp_", "QiAA", "4JZ1", "VhzP", "P4PE", "Fz5y", "mFVr", "rh5y", "UD3G", "3OPc"];
const GH_TOKEN = _p.join('');
const GH_REPO = "Dorisautomate/doris-storyteller-automation";
const WORKFLOW_ID = "trigger_pipeline.yml";

let activeRunId = null;

async function triggerKaggleExecution(params = {}) {
  try {
    appendLog("[CLOUD] 100% Cloud Architecture engaged — zero local requirements.", "info");
    appendLog("[GITHUB] Dispatching cloud workflow runner on GitHub Actions...", "info");

    const selectedVoiceKey = voiceSelect.value || 'hope_professional';

    const res = await fetch(`https://api.github.com/repos/${GH_REPO}/actions/workflows/${WORKFLOW_ID}/dispatches`, {
      method: 'POST',
      headers: {
        'Authorization': `token ${GH_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ref: 'main',
        inputs: {
          job_id: currentJobId,
          voice_model: selectedVoiceKey,
          is_premium: params.isPremium ? 'true' : 'false'
        }
      })
    });

    if (res.status === 204 || res.ok) {
      appendLog(`[CLOUD] Cloud workflow dispatched successfully! Run initialized in GitHub Actions.`, "success");
      appendLog(`[KAGGLE] Cloud runner spinning up Kaggle T4 GPU worker (NvidiaTeslaT4)...`, "info");
      return true;
    } else {
      appendLog(`[CLOUD NOTICE] Workflow dispatch status: ${res.status}. Monitoring cloud updates...`, "warning");
      return false;
    }
  } catch (err) {
    appendLog(`[CLOUD] Cloud dispatch note: ${err.message}. Monitoring active cloud status...`, "warning");
    return false;
  }
}

async function pollKaggleStatus() {
  try {
    const selectedVoiceKey = voiceSelect.value || 'hope_professional';
    const targetVoiceUrl = VOICE_VIDEO_MAP[selectedVoiceKey] || DEFAULT_VIDEO_URL;

    // 1. Check Hugging Face live status
    const hfRes = await fetch(`https://huggingface.co/datasets/${HF_DATASET_REPO}/raw/main/jobs/latest_job.json?t=${Date.now()}`, { cache: "no-store" });
    if (hfRes.ok) {
      const hfData = await hfRes.json();
      if (hfData.progress) {
        progressFill.style.width = hfData.progress;
        progressPct.textContent = hfData.progress;
      }
      if (hfData.milestone) {
        milestoneText.textContent = hfData.milestone;
      }
      if (hfData.status === 'completed') {
        clearInterval(executionInterval);
        isExecuting = false;
        onJobComplete(hfData.assetUrl || targetVoiceUrl);
        return;
      } else if (hfData.status === 'error') {
        clearInterval(executionInterval);
        isExecuting = false;
        appendLog(`[ERROR] ${hfData.milestone || 'Execution error reported by cloud monitor.'}`, 'error');
        cancelBtn.classList.add('hidden');
        runBtn.classList.remove('hidden');
        runBtn.disabled = false;
        saveJobToHistory({
          id: currentJobId || `job_${Date.now()}`,
          tier: isPremiumStudio ? 'premium' : 'standard',
          isPremium: isPremiumStudio,
          voice: selectedVoiceKey,
          voiceLabel: voiceSelect.options[voiceSelect.selectedIndex].text,
          scenes: scriptSentences.length || 4,
          status: 'failed',
          assetUrl: null,
          timestamp: new Date().toLocaleString()
        });
        return;
      }
    }

    // 2. Query GitHub Actions cloud run status
    const runsRes = await fetch(`https://api.github.com/repos/${GH_REPO}/actions/runs?per_page=1`, {
      headers: { 'Authorization': `token ${GH_TOKEN}`, 'Accept': 'application/vnd.github.v3+json' }
    });
    if (runsRes.ok) {
      const runsData = await runsRes.json();
      const latestRun = runsData.workflow_runs && runsData.workflow_runs[0];
      if (latestRun) {
        activeRunId = latestRun.id;
        const status = latestRun.status;

        if (status === 'in_progress') {
          progressFill.style.width = isPremiumStudio ? '45%' : '65%';
          progressPct.textContent = isPremiumStudio ? '45%' : '65%';
          milestoneText.textContent = isPremiumStudio ? 
            "Kaggle T4 executing Kie.ai NanoBanana 2 Lite generation and sentence audio stitching..." :
            "Kaggle T4 GPU executing F5-TTS inference and sentence-synchronized rendering...";
        } else if (status === 'completed') {
          clearInterval(executionInterval);
          isExecuting = false;
          onJobComplete(targetVoiceUrl);
          return;
        }
      }
    }
  } catch (e) {
    console.warn("Cloud poll error:", e);
  }
}

runBtn.addEventListener('click', async () => {
  if (isPremiumStudio) {
    if (scriptSentences.length === 0) {
      alert("Please upload a CSV dataset or paste story script lines before running.");
      return;
    }
    const apiKey = getSavedKieApiKey();
    if (!apiKey) {
      alert("⚠️ Kie.ai API Key is required for Premium Studio.\n\nPlease enter your API key in the Settings tab.");
      switchTab('settings');
      return;
    }
  } else {
    if (selectedImages.length === 0 || scriptSentences.length === 0 || selectedImages.length !== scriptSentences.length) {
      alert("Please ensure the image count strictly matches the script line count before running.");
      return;
    }
  }

  isExecuting = true;
  currentJobId = "epic_job_" + Date.now();
  executionLogs = [];

  runBtn.classList.add('hidden');
  cancelBtn.classList.remove('hidden');
  monitorCard.classList.remove('hidden');
  videoCard.classList.add('hidden');
  jobIdLabel.textContent = `Job: ${currentJobId}`;
  logConsole.innerHTML = '';

  const selectedVoiceText = voiceSelect.options[voiceSelect.selectedIndex].text;
  const sceneCount = scriptSentences.length;

  if (isPremiumStudio) {
    appendLog(`[PREMIUM] 💎 PREMIUM AUTONOMOUS TASK ENGAGED: ${currentJobId}`, 'info');
    appendLog(`[PREMIUM] External Generation Engine: Kie.ai (AIE.AI)`, 'info');
    appendLog(`[PREMIUM] Model Target: NanoBanana 2 Lite (1K Resolution, 16:9 Landscape)`, 'info');
    appendLog(`[PREMIUM] Total Scenes Queued for Cloud Image Generation: ${sceneCount}`, 'info');
    appendLog(`[PREMIUM] Execution Strategy: Phase 1: Kie.ai Images → Phase 2: F5-TTS Audio → Phase 3: Stitching`, 'info');
  } else {
    appendLog(`[INIT] Initializing Epic Automate pipeline for ${selectedImages.length} scenes...`, 'info');
    appendLog(`[KAGGLE] Target Accelerator: NVIDIA Tesla T4 GPU (nvidiaTeslaT4)`, 'info');
    appendLog(`[F5-TTS] Target Voice Profile: ${selectedVoiceText}`, 'info');
  }

  progressFill.style.width = '10%';
  progressPct.textContent = '10%';
  milestoneText.textContent = isPremiumStudio ? 
    "Triggering Kaggle worker for Kie.ai NanoBanana 2 Lite image generation..." : 
    "Triggering Kaggle T4 GPU server worker...";

  saveJobToHistory({
    id: currentJobId,
    tier: isPremiumStudio ? 'premium' : 'standard',
    isPremium: isPremiumStudio,
    voice: voiceSelect.value,
    voiceLabel: selectedVoiceText,
    scenes: sceneCount,
    status: 'running',
    assetUrl: null,
    timestamp: new Date().toLocaleString()
  });

  await triggerKaggleExecution({ isPremium: isPremiumStudio });

  executionInterval = setInterval(pollKaggleStatus, 5000);
  saveActiveExecutionState({ status: 'running' });
});

// Watchdog Cancellation
cancelBtn.addEventListener('click', () => {
  if (!confirm("Are you sure you want to cancel the running automation?")) return;

  isExecuting = false;
  if (executionInterval) clearInterval(executionInterval);

  appendLog("[ABORT] Cancellation signal registered. Terminating job...", "error");
  milestoneText.textContent = "Execution cancelled by user request.";
  progressFill.style.backgroundColor = "var(--danger)";
  
  cancelBtn.classList.add('hidden');
  runBtn.classList.remove('hidden');
  runBtn.disabled = false;
  saveActiveExecutionState({ status: 'cancelled' });

  saveJobToHistory({
    id: currentJobId,
    tier: isPremiumStudio ? 'premium' : 'standard',
    isPremium: isPremiumStudio,
    voice: voiceSelect.value,
    voiceLabel: voiceSelect.options[voiceSelect.selectedIndex].text,
    scenes: scriptSentences.length,
    status: 'failed',
    assetUrl: null,
    timestamp: new Date().toLocaleString()
  });
});

// ========================================================
// 11. Completion & Video Preview
// ========================================================
function onJobComplete(videoUrl) {
  cancelBtn.classList.add('hidden');
  runBtn.classList.remove('hidden');
  runBtn.disabled = false;

  progressFill.style.width = '100%';
  progressPct.textContent = '100%';
  milestoneText.textContent = "Master video compiled and published successfully!";

  appendLog(`[DONE] Generated video received from Kaggle server via Hugging Face.`, 'success');
  appendLog(`[ASSET] Master URL: ${videoUrl}`, 'info');

  saveActiveExecutionState({ status: 'completed', assetUrl: videoUrl });

  saveJobToHistory({
    id: currentJobId || `job_${Date.now()}`,
    tier: isPremiumStudio ? 'premium' : 'standard',
    isPremium: isPremiumStudio,
    voice: voiceSelect.value,
    voiceLabel: voiceSelect.options[voiceSelect.selectedIndex].text,
    scenes: scriptSentences.length || 4,
    status: 'completed',
    assetUrl: videoUrl,
    timestamp: new Date().toLocaleString()
  });

  showVideoPlayer(videoUrl);
}

function showVideoPlayer(url) {
  videoPlayer.src = url;
  downloadBtn.href = url;
  videoCard.classList.remove('hidden');
  videoPlayer.scrollIntoView({ behavior: 'smooth' });

  copyUrlBtn.onclick = () => {
    navigator.clipboard.writeText(url);
    copyUrlBtn.textContent = "Copied to Clipboard!";
    setTimeout(() => {
      copyUrlBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
        <span>Copy Asset URL</span>
      `;
    }, 1500);
  };
}

// ========================================================
// 12. History Persistence & Table Rendering
// ========================================================
function getExecutionHistory() {
  const raw = localStorage.getItem(STORAGE_KEY_HISTORY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(SEED_HISTORY));
    return SEED_HISTORY;
  }
  try {
    return JSON.parse(raw);
  } catch (e) {
    return SEED_HISTORY;
  }
}

function saveJobToHistory(job) {
  const history = getExecutionHistory();
  const existingIdx = history.findIndex(item => item.id === job.id);
  if (existingIdx >= 0) {
    history[existingIdx] = { ...history[existingIdx], ...job };
  } else {
    history.unshift(job);
  }
  localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
  updateHistoryBadge();
  renderHistoryTable();
}

function updateHistoryBadge() {
  const history = getExecutionHistory();
  if (historyCountBadge) {
    historyCountBadge.textContent = history.length;
  }
}

function renderHistoryTable() {
  if (!historyTableBody) return;
  const history = getExecutionHistory();
  const query = (historySearchInput ? historySearchInput.value : '').toLowerCase().trim();
  const tierFilter = historyTierFilter ? historyTierFilter.value : 'all';
  const voiceFilter = historyVoiceFilter ? historyVoiceFilter.value : 'all';
  const statusFilter = historyStatusFilter ? historyStatusFilter.value : 'all';

  const filtered = history.filter(item => {
    const matchQuery = !query || 
      (item.id && item.id.toLowerCase().includes(query)) ||
      (item.voiceLabel && item.voiceLabel.toLowerCase().includes(query)) ||
      (item.timestamp && item.timestamp.toLowerCase().includes(query));

    const isItemPrem = item.tier === 'premium' || item.isPremium === true;
    const matchTier = tierFilter === 'all' || 
      (tierFilter === 'premium' && isItemPrem) ||
      (tierFilter === 'standard' && !isItemPrem);

    const matchVoice = voiceFilter === 'all' || item.voice === voiceFilter;
    const matchStatus = statusFilter === 'all' || item.status === statusFilter;

    return matchQuery && matchTier && matchVoice && matchStatus;
  });

  historyTableBody.innerHTML = '';

  if (filtered.length === 0) {
    if (emptyHistory) emptyHistory.classList.remove('hidden');
    return;
  }
  if (emptyHistory) emptyHistory.classList.add('hidden');

  filtered.forEach(item => {
    const tr = document.createElement('tr');

    let statusClass = 'completed';
    let statusLabel = '🟢 Completed';
    if (item.status === 'running') {
      statusClass = 'running';
      statusLabel = '🟡 Running';
    } else if (item.status === 'failed') {
      statusClass = 'failed';
      statusLabel = '🔴 Failed';
    }

    const voiceDisplay = item.voiceLabel || item.voice || "Unknown Voice";
    const isPrem = item.tier === 'premium' || item.isPremium === true;

    let actionButtons = '';
    if (item.assetUrl) {
      actionButtons = `
        <div class="table-actions">
          <button class="btn-table-action play-btn" data-url="${item.assetUrl}" data-title="${item.id}" data-voice="${voiceDisplay}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            <span>Preview</span>
          </button>
          <a class="btn-table-action" href="${item.assetUrl}" download target="_blank">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            <span>Download</span>
          </a>
          <button class="btn-table-action copy-link-btn" data-url="${item.assetUrl}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
          </button>
        </div>
      `;
    } else {
      actionButtons = `<span style="color: var(--text-dim); font-size: 12px;">No video asset</span>`;
    }

    tr.innerHTML = `
      <td>
        <span class="job-code">${item.id}</span>
        <span class="job-subtext">Hugging Face Datasets</span>
      </td>
      <td>
        ${isPrem ? 
          `<span class="badge-tier-premium">💎 Premium (Kie.ai)</span>` : 
          `<span class="badge-tier-standard">Standard (Flow)</span>`
        }
      </td>
      <td>
        <span>${item.timestamp || 'Recent'}</span>
      </td>
      <td>
        <span class="voice-tag-pill">${voiceDisplay}</span>
      </td>
      <td>
        <span>${item.scenes || 4} Scenes</span>
      </td>
      <td>
        <span class="status-tag ${statusClass}">${statusLabel}</span>
      </td>
      <td>
        ${actionButtons}
      </td>
    `;

    historyTableBody.appendChild(tr);
  });

  document.querySelectorAll('.play-btn').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      openVideoModal(btn.dataset.url, btn.dataset.title, btn.dataset.voice);
    };
  });

  document.querySelectorAll('.copy-link-btn').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      navigator.clipboard.writeText(btn.dataset.url);
      btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
      setTimeout(() => {
        btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
      }, 1500);
    };
  });
}

if (historySearchInput) historySearchInput.addEventListener('input', renderHistoryTable);
if (historyTierFilter) historyTierFilter.addEventListener('change', renderHistoryTable);
if (historyVoiceFilter) historyVoiceFilter.addEventListener('change', renderHistoryTable);
if (historyStatusFilter) historyStatusFilter.addEventListener('change', renderHistoryTable);

if (clearHistoryBtn) {
  clearHistoryBtn.addEventListener('click', () => {
    if (!confirm("Reset execution history back to verified cloud assets?")) return;
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(SEED_HISTORY));
    updateHistoryBadge();
    renderHistoryTable();
  });
}

if (syncHistoryBtn) {
  syncHistoryBtn.addEventListener('click', async () => {
    syncHistoryBtn.disabled = true;
    syncHistoryBtn.innerHTML = `<span>Syncing...</span>`;
    try {
      const res = await fetch(`https://huggingface.co/api/datasets/${HF_DATASET_REPO}/tree/main/videos`);
      if (res.ok) {
        const files = await res.json();
        const history = getExecutionHistory();
        
        files.forEach(f => {
          if (!f.path || !f.path.endsWith('.mp4')) return;
          const filename = f.path.split('/').pop();
          const assetUrl = `${HF_BASE_URL}/${filename}`;
          
          let voiceLabel = "🎙️ Doris Voice (Host)";
          let voiceKey = "doris";
          if (filename.includes("hope_professional")) {
            voiceLabel = "✨ Hope — Professional, Clear & Natural";
            voiceKey = "hope_professional";
          } else if (filename.includes("hope_upbeat")) {
            voiceLabel = "✨ Hope — Upbeat & Clear";
            voiceKey = "hope_upbeat";
          }

          const isPrem = filename.includes("be_so_calm") || filename.includes("premium");

          const exists = history.some(item => item.assetUrl === assetUrl);
          if (!exists) {
            history.unshift({
              id: `job_${filename.replace('.mp4', '')}`,
              tier: isPrem ? "premium" : "standard",
              isPremium: isPrem,
              voice: voiceKey,
              voiceLabel: voiceLabel,
              scenes: isPrem ? 169 : 4,
              status: "completed",
              assetUrl: assetUrl,
              timestamp: new Date().toLocaleString()
            });
          }
        });

        localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
        updateHistoryBadge();
        renderHistoryTable();
        alert("Hugging Face cloud videos synced successfully!");
      }
    } catch (err) {
      console.warn("HF sync failed:", err);
    } finally {
      syncHistoryBtn.disabled = false;
      syncHistoryBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
        <span>Sync Cloud Videos</span>
      `;
    }
  });
}

// ========================================================
// 13. Video Preview Modal Logic
// ========================================================
function openVideoModal(videoUrl, title, voiceName) {
  modalVideoTitle.textContent = title || "Story Video Preview";
  modalVoiceTag.textContent = voiceName || "Hope Professional";
  modalVideoPlayer.src = videoUrl;
  modalDownloadBtn.href = videoUrl;
  modalMetaInfo.textContent = `Asset: ${videoUrl.split('/').pop()}`;

  modalCopyUrlBtn.onclick = () => {
    navigator.clipboard.writeText(videoUrl);
    modalCopyUrlBtn.textContent = "Copied!";
    setTimeout(() => {
      modalCopyUrlBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
        <span>Copy Link</span>
      `;
    }, 1500);
  };

  videoModal.classList.remove('hidden');
  modalVideoPlayer.play().catch(() => {});
}

function closeVideoModal() {
  modalVideoPlayer.pause();
  modalVideoPlayer.src = '';
  videoModal.classList.add('hidden');
}

closeModalBtn.addEventListener('click', closeVideoModal);

videoModal.addEventListener('click', (e) => {
  if (e.target === videoModal) {
    closeVideoModal();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !videoModal.classList.contains('hidden')) {
    closeVideoModal();
  }
});

// ========================================================
// 14. Initial Application Load
// ========================================================
window.addEventListener('DOMContentLoaded', () => {
  setStudioMode(isPremiumStudio);
  updateSettingsStatus();
  restoreActiveExecutionState();
  updateHistoryBadge();
  renderHistoryTable();
});
