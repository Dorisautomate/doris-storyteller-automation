---
name: doris
description: >-
  Master end-to-end autonomous YouTube psychology video production engine for Dr Doris Psych (https://www.youtube.com/@DrDorisPsych). Runs continuously without user interruption from initial channel audit and duplicate prevention, through outlier title formulation, 11-beat PSY-Ladder scriptwriting, Google Flow batch image generation via active Chrome OR direct cloud generation bypass via Premium Studio on dorisautomate.web.app (Kie.ai NanoBanana 2 Lite), to final 1080p MP4 delivery. Trigger on '/doris', 'Doris', 'generate for me a video for my channel', 'using my premium studio', 'premium account', or requests to run the complete Doris channel automation pipeline.
---

# Doris — Master YouTube Video Production Pipeline

The unified, 100% autonomous channel production skill specifically configured for **[Dr Doris Psych](https://www.youtube.com/@DrDorisPsych)**.

> [!IMPORTANT]
> ### Strict Process Adherence & Zero Improvisation Mandate
> Once triggered, this skill **MUST NOT STOP, PAUSE, OR IMPROVISE**.
> - **NEVER IMPROVISE OR BYPASS ANY STAGE (UNLESS PREMIUM STUDIO IS SPECIFIED)**: The agent **MUST** follow every step of this pipeline literally and strictly.
> - **💎 PREMIUM STUDIO BYPASS PROTOCOL (NO VEED.IO, NO GOOGLE FLOW)**:
>   If the user mentions **"premium account"**, **"premium studio"**, **"using my premium studio"**, or requests premium generation:
>   - **DO NOT** open Google Flow, **DO NOT** open Veed.io, and **DO NOT** generate or stitch images locally!
>   - **BYPASS PHASE 3 COMPLETELY**: Transition directly from Phase 2 (Scriptwriting & CSV generation) to **Phase 4 Mode B: 💎 Premium Studio directly on `https://dorisautomate.web.app`**.
>   - In Premium Studio, simply upload the CSV, verify the Character Reference Sheet is anchored, select the voice, and click **"Run Video Automation"**.
>   - Kaggle T4 GPU + Kie.ai NanoBanana 2 Lite dynamically generates every 1K 16:9 image line-by-line in the cloud, synthesizes F5-TTS audio, compiles the 1080p MP4, and delivers it automatically.
> - **CANONICAL CHARACTER MODEL SHEET**: Every generation (Flow or Premium Studio) must use the official channel host character model sheet located at:
>   `C:\Users\doris\Downloads\Doris Automation\assets\doris_character_reference_sheet.png` (mirror at `C:\Users\doris\Downloads\doris_character_reference_sheet.png` or HF URL: `https://huggingface.co/datasets/Dorisautomate/automation-assets/raw/main/references/doris_character_reference_sheet.png`).
>   Never generate without anchoring this exact reference sheet.
> - **RICH ENVIRONMENTAL PROMPTS (NO BLANK BACKGROUNDS)**: Characters must NEVER be isolated on a plain white background. Every prompt must describe the character, the specific action, and a rich, detailed environment corresponding directly to what is happening in the sentence narrative (e.g. corporate glass conference room, rainy evening car interior, psychology consultation office, university lecture hall, illuminated neuroscience lab).
> - **BROWSER AGENT EXECUTION (NO HARDCODED TIMEOUT SCRIPTS)**: For standard Google Flow generation, execution must be driven by an active **Browser Agent** inspecting the UI visually, uploading the character reference sheet, monitoring scene cards, and actively clicking the **Retry** button on any failed scene until 100% of rows are green. Never use a blind script with a premature timeout.
> - **NO IMAGE RECYCLING**: Never reuse or copy images from previous runs or older project folders. Every single video requires fresh scene frames.
> - **100% CLOUD VIDEO COMPILATION ON WEB APP (NEVER LOCAL FFMPEG STITCHING)**: Assembly and rendering must be automated on `https://dorisautomate.web.app` using the Kaggle T4 GPU worker container and cloud orchestrator. Never stitch images locally on the desktop with FFmpeg demuxer.
> - **STRICT DURATION CALIBRATION**: If a 1-minute video is requested, the script must be a full 60 seconds (150–240 words, 14–16 sentences). If a 15-minute video is requested, the script must be 2,400–3,100 words (160–190 sentences).
> - The agent **must autonomously execute the entire pipeline end-to-end in one continuous run**, auto-resolving any minor hurdles, and only concluding when the finalized, synchronized 1080p master video is delivered.

```mermaid
flowchart TD
    A["Phase 1: Mandatory Channel Audit & Outlier Mining\n• Check all existing videos on @DrDorisPsych\n• Prevent duplicate topics & cannibalization\n• 3x-10x cross-niche outlier multiplier\n• Psychology niche bending & scarcity audit"] --> B["Phase 2: Scriptwriting & Deliverables\n• 2,400-3,100 word 11-Beat PSY-Ladder script\n• Sentence-by-sentence CSV (SN, SCRIPT, PROMPT)\n• 1-sentence-per-line TXT for audio sync"]
    
    B -->|Standard Mode: Google Flow Batch| C["Phase 3: Google Flow Scene Generation\n• Connect to active Chrome session (Port 9222)\n• Upload CSV to Flow tool\n• Nano Banana 2 Lite (16:9) + host character ref\n• In-memory DOM base64 extraction (0% failure)\n• Save sequential '1. [sentence].jpg' folder"]
    C --> D1["Phase 4 Mode A: Standard Web App Studio\n• Ingest image folder & paste script lines\n• Verify Visual Alignment Matrix\n• Assemble on dorisautomate.web.app"]
    
    B -->|User mentions 'Premium Studio' / 'Premium Account' (FAST-TRACK BYPASS)| D2["Phase 4 Mode B: 💎 Premium Studio Directly on dorisautomate.web.app\n• BYPASS Google Flow, Veed.io & local images completely\n• Upload CSV directly to dorisautomate.web.app\n• Verify Character Anchor (Host Daniel Model Sheet)\n• Trigger Kaggle T4 GPU cloud execution\n• Dynamic Kie.ai NanoBanana 2 Lite (1K 16:9) generation\n• F5-TTS voiceover synthesis & cloud 1080p rendering"]
    
    D1 --> E["Phase 5: Master Video Delivery & Playback\n• Fetch finalized 1080p MP4 from Hugging Face\n• Record job to Execution Logs & Video Library\n• Present playable video & download link to user"]
    D2 --> E
```

---

## Trigger Invocations

Activate this skill whenever the user says:
- `"/doris"`
- `"/doris generate for me a video for my channel"`
- *"Doris, generate for me a video for my channel"*
- *"Doris, generate a video for my channel using my premium studio"*
- *"Doris, make a video with my premium account"*
- *"Use premium studio to generate a video for Dr Doris Psych"*
- *"Run the Doris pipeline to create a video for Dr Doris Psych"*
- *"Generate a complete video from scratch for my channel"*

---

## Required Tool Bindings & Endpoints

| Resource | Identifier / Endpoint | Purpose |
|---|---|---|
| **Official YouTube Channel** | **[Dr Doris Psych (`https://www.youtube.com/@DrDorisPsych`)](https://www.youtube.com/@DrDorisPsych)** | Embedded anchor channel for duplicate prevention, style alignment & performance baseline |
| **Live Automation Web App** | `https://dorisautomate.web.app` | Asset ingestion, visual alignment, voice selection & cloud video assembly |
| **Google Flow Tool** | `https://flow.google.com/shared/tool/ee8f4722-38cb-4363-967f-057725e7c3c6` | High-throughput batch 2D animation scene generation |
| **Active Browser Window** | Remote Debugging on `localhost:9222` | Authenticated session (Edge or Chrome) for Flow and web app interaction |
| **Hugging Face Datasets** | `Dorisautomate/automation-assets` | Cloud asset storage, voice references & rendered master MP4s |
| **Kaggle GPU Accelerator** | `dorisautomate/doris-storyteller-worker` (T4 GPU) | F5-TTS zero-shot voice synthesis & FFmpeg video stitching |
| **Default Voice Profile** | `✨ Hope — Professional, Clear & Natural` | Cloned from ElevenLabs reference recording via F5-TTS |

---

## Detailed 5-Phase Continuous Production Protocol

### Phase 1: Mandatory Channel Audit & Outlier Title Mining

> [!IMPORTANT]
> **Duplicate Prevention Protocol**:
> Before formulating any new topic or writing any script, the agent **MUST FIRST** check all videos currently published on the official channel:
> **`https://www.youtube.com/@DrDorisPsych`**
> Catalog every published title and subject angle to ensure the new video is 100% novel, does not repeat existing lessons, and does not compete with existing uploads.

1. **Step 1 — Audit Existing Channel Uploads**:
   - Navigate to `https://www.youtube.com/@DrDorisPsych/videos` (or search for the channel's published catalog using web search or Chrome DevTools).
   - Log all published video titles, thumbnail themes, and viewer view counts.
   - Establish the channel's **Baseline / Median Views** over the last 90 days.
   - Identify which topics produced above-average viewer retention and comments.
2. **Step 2 — Identify Unaddressed White-Space Topics**:
   - Cross-reference the channel's existing library against audience requests in comments and high-search-intent psychology queries.
   - Disqualify any candidate concept that substantially overlaps with an existing video on `@DrDorisPsych`.
3. **Step 3 — Cross-Niche Outlier Mining**:
   - Scan adjacent non-psychology niches (Personal Finance, Business, Tech Documentaries, Fitness, True Crime).
   - Filter for breakout videos achieving an **Outlier Multiplier of $3.0\text{x}$ to $10.0\text{x}+$**:
     $$\text{Outlier Multiplier} = \frac{\text{Candidate Video Views}}{\text{Candidate Channel Median Views}}$$
4. **Step 4 — Psychology Niche Bending**:
   - Extract the core psychological syntax (status anxiety, boundary defense, cognitive dissonance, counterfeit virtue, silent leverage).
   - Bend the syntax into depth psychology (Jungian shadow, vagal brake, prefrontal regulation, unshakeable composure).
5. **Step 5 — YouTube Scarcity Audit & Final Title Selection**:
   - Verify that YouTube has near-zero direct competition on the coined title (Scarcity Score of **4 or 5 out of 5**).
   - Confirm search intent, lock the winning title, and **immediately transition to Phase 2 without pausing for user approval**.

---

### Phase 2: Scriptwriting & Deliverables Generation

Execute the full long-form psychology script adhering strictly to the **PSY-Ladder Outlier System**:

1. **Script Parameters**:
   - **Length**: 2,400 to 3,100 words (Target: ~2,850 words; 14–16 minutes spoken).
   - **Perspective**: 90% 2nd-person ("You"), 10% anchor character (Daniel) + cited scientific researchers (Author, Institution, Year).
   - **Structure**: 11 mandatory psychological beats (Hook, Stay Line, Pain Deepening, Science Reversal, Ladder Map, Levels 1–2 Trap, Levels 3–4 Turn, Levels 5–6 Apex, 3 Objections Knockdown, The One Tool Install, Payoff & Level Confession CTA).
   - **TTS Pacing**: Short, punchy sentences (8–14 words average). No em dashes (`—`) in spoken lines; use commas and periods.

2. **Sentence-by-Sentence CSV Export**:
   - Deconstruct every single sentence into a CSV row with exact capitalized columns: `SN,SCRIPT,PROMPT`.
   - **Rich Environmental Prompt Formula (NO Blank White Backgrounds)**:
     > `[Subject action with original character + props/infographics], in [rich, specific environment matching the sentence narrative e.g. glass conference room with long table, psychology consultation office with full bookshelves and armchair, rainy evening car interior with glowing dashboard dials, university lecture hall, illuminated neuroscience lab with brain diagram], 2D adult animated sitcom aesthetic, bold thick black outlines, flat solid vibrant colors, detailed atmospheric environment`
   - **Character Anchor**: Always reference `A cartoon man with glasses in a navy sweater over a white collared shirt` (host Daniel).
   - **Environment Requirement**: Every prompt must vividly describe the setting of the scene. Never produce blank, plain white backgrounds or characters floating in void.
   - **Policy Guardrails**: No copyrighted show names (use *"2D adult animated sitcom aesthetic"*), no self-harm/despair triggers, no violent or damage words. Use constructive visual metaphors.

3. **1-Sentence-Per-Line TXT Export**:
   - Save a companion `.txt` file where line $N$ matches row $N$ of the CSV verbatim.
   - Save both files to `C:\Users\doris\Downloads\<Title_Slug>.csv` and `.txt`.

---

### Workflow Branching: Standard Flow vs. 💎 Premium Studio Fast-Track Bypass

Immediately upon completing Phase 2 (Scriptwriting & Deliverables), the agent must evaluate the user's initial instruction:

> [!IMPORTANT]
> **Check for Premium Studio Invocations**:
> Does the prompt mention **"premium studio"**, **"premium account"**, **"using my premium studio"**, or **"premium"**?

- **CASE 1: User Mentioned Premium Studio / Premium Account (FAST-TRACK BYPASS)**:
  - **BYPASS GOOGLE FLOW & VEED.IO COMPLETELY**: Do **NOT** navigate to Google Flow, do **NOT** navigate to Veed.io, and do **NOT** generate or stitch images locally on the desktop!
  - **SKIP PHASE 3**: Transition directly to **Phase 4 Mode B: 💎 Premium Studio on `https://dorisautomate.web.app`**.
  - Upload the generated CSV file directly to the web app (`#csvFileInput`).
  - Verify that the Character Reference Sheet is anchored (default host Daniel at `assets/doris_character_reference_sheet.png`).
  - Select the voice model (Default: Hope — Professional).
  - Click **"Run Video Automation"** (`#runBtn`).
  - Kaggle T4 GPU + Kie.ai NanoBanana 2 Lite (1K 16:9) will dynamically generate all scene images in the cloud, synthesize F5-TTS audio, compile the 1080p MP4, and deliver it via Hugging Face.

- **CASE 2: Standard Request (No Premium Mention)**:
  - Proceed normally through **Phase 3: Google Flow Scene Generation** below, connecting via active Chrome (`localhost:9222`) to batch-generate images, download them to `C:\Users\doris\Downloads\<Title_Folder>`, and assemble them in Phase 4 Mode A.

---

### Phase 3: Google Flow Scene Generation (Browser Agent Driven — Standard Mode Only)

Batch-generate all visual frames using an interactive **Browser Agent** connected to the user's authenticated Google Chrome session:

1. **Connect & Navigate**:
   - Attach browser agent to active Chrome (`localhost:9222`).
   - Navigate to Google Flow: `https://flow.google.com/shared/tool/ee8f4722-38cb-4363-967f-057725e7c3c6`.
   - Switch context to the tool iframe.
2. **Upload Character Model Sheet Reference**:
   - Every Flow session must attach the official channel character reference sheet:
     `C:\Users\doris\Downloads\Doris Automation\assets\doris_character_reference_sheet.png` (mirror: `C:\Users\doris\Downloads\doris_character_reference_sheet.png`).
   - This anchors character anatomy, clothing, and vector style across all 16:9 frames.
3. **Configure Generation Parameters**:
   - Upload the generated CSV from `C:\Users\doris\Downloads\<Title_Slug>.csv`.
   - Select Model: **`🍌 Nano Banana 2 Lite`** (high throughput, crisp vector outlines).
   - Set Aspect Ratio: **`16:9`** (landscape standard).
4. **Execute Batch Generation & Interactive Monitoring**:
   - Click **"Run Batch"** / **"Generate All"**.
   - **No Hardcoded Timeout Scripts**: For a 15-minute video (160–190 scenes), batch generation requires ~40–50 minutes. The browser agent must monitor the batch cards interactively or schedule checkups. Never abort with a premature 20-minute timeout.
   - **Active Retry Protocol on Failed Cards**: The browser agent must visually inspect the scene cards. If any card shows a failed state or retry icon, the agent must actively click the **Retry** button for that specific scene until every single card is completed and green.
5. **Exact 1:1 In-Memory DOM Image Extraction (Zero Index Shift)**:
   > [!IMPORTANT]
   > Do **NOT** use browser bulk downloads (triggers Windows AES / Chrome "Virus scan failed" file lock errors).
   - Filter out the style reference thumbnail and UI assets so that Scene 1 matches row 1 exactly (no off-by-one shifting).
   - Extract image base64 payloads directly from the DOM using DevTools evaluation:
     ```javascript
     (() => {
       // Filter out reference image and style picker assets
       const imgs = Array.from(document.querySelectorAll('img'))
         .filter(img => img.alt !== 'Style Ref' && !img.src.includes('character_reference') && (img.src.startsWith('data:image') || img.src.startsWith('blob:') || img.src.startsWith('http')));
       return imgs.map((img, idx) => ({ sn: idx + 1, src: img.src }));
     })();
     ```
   - Decode base64 payloads directly to disk in `C:\Users\doris\Downloads\<Title_Folder>\`.
   - Apply strict sequential naming:
     $$\mathbf{<SN>.\ <Sentence>.jpg}$$
     *(e.g., `1. It is Thursday night, and you are sitting in your car with the headlights off.jpg`)*.
   - Verify every single file has a unique hash (zero duplicate placeholder images).
   - **Immediately transition to Phase 4 without pausing**.

---

### Phase 4: Web App Automation (`dorisautomate.web.app`) & Studio Modes

> [!CRITICAL]
> **100% Cloud Web App Assembly Only**:
> Never stitch images locally with FFmpeg on the desktop! The compilation and rendering MUST happen through the live production web app: `https://dorisautomate.web.app`.

The web app supports two operating studio modes accessible via the **Studio Mode Toggle** (`#studioModeToggle`):

#### Mode A: Standard Studio (Local Google Flow Ingestion)
1. **Step 1 — Folder Ingestion**:
   - Select the folder containing the downloaded scene images (`C:\Users\doris\Downloads\<Title_Folder>`).
   - Confirm the badge shows: `📁 Loaded N images sorted in numerical sequence`.
2. **Step 2 — Voice Model Selection**:
   - Verify **`✨ Hope — Professional, Clear & Natural (Default)`** is selected.
3. **Step 3 — Script Ingestion**:
   - Paste the complete 1-sentence-per-line `.txt` file into `#scriptInput`.
   - Confirm the line counter matches the image count.
4. **Step 4 — Alignment Matrix**:
   - Verify `🟢 Aligned: N Images ↔ N Sentences` and click `#runBtn`.

#### Mode B: 💎 Premium Studio (Direct Cloud Generation Bypass)

> [!TIP]
> **Zero Local Image Generation & Zero Flow / Veed.io Requirements**:
> Use this mode whenever the user mentions **"premium account"**, **"premium studio"**, or **"using my premium studio"**. This completely bypasses Google Flow, Veed.io, and all desktop image processing.

1. **Navigate Directly to Web App**:
   - Open `https://dorisautomate.web.app` using the browser agent or active Chrome session.
2. **Switch to Premium Studio**:
   - Ensure the **Studio Mode Toggle** (`#studioModeToggle`) is flipped to **💎 Premium**.
   - The UI displays the active badge: `Premium Studio Active · Kie.ai Dynamic Cloud Generation (NanoBanana 2 Lite · 1K)`.
3. **API Key Setup & Status Check**:
   - Verify the status badge displays `🟢 Kie.ai API Configured`.
   - If not yet configured, switch to the **Settings Tab** (`#navSettingsBtn`), paste the API key (`12b5f2a14a89e0b265c05e789962efc6` or user-provided key) into `#kieApiKeyInput`, click **Save API Key**, and return to Studio (`#navStudioBtn`).
4. **Step 1 — Upload Script CSV Dataset**:
   - Click `#csvFileInput` and upload the generated CSV (`C:\Users\doris\Downloads\<Title_Slug>.csv` with `SN, SCRIPT, PROMPT`).
   - The badge updates to: `N Scenes Loaded`.
5. **Step 2 — Character Reference Image (Style Anchor)**:
   - Step 2 card (`#charRefCard`) automatically locks the official host turnaround model sheet:
     `assets/doris_character_reference_sheet.png` / `👤 Dr. Doris Psych Host — Daniel (Model Sheet)`.
   - Verify the green indicator shows: `🟢 Anchor Active`.
   - If a custom character sheet is required, upload it via `#charRefInput`.
6. **Step 3 — Select Voice Model**:
   - Verify Voice Model is set to **`✨ Hope — Professional, Clear & Natural (Default)`** (`#voiceSelect`).
7. **Step 5 — Scene Generation Queue & Review**:
   - Review the generated scene cards. Each scene displays:
     - Locked Anchor: `👤 Daniel Ref Locked`
     - Narration Line: sentence from CSV `SCRIPT` column
     - Environmental Prompt: detailed setting from CSV `PROMPT` column
     - Status: `🟢 Ready for Cloud Gen: N Scenes`
8. **Click "Run Video Automation"**:
   - Click `#runBtn` ("Run Video Automation").
   - The UI engages the Execution Monitor (`#executionMonitor`) with a real-time progress bar, status milestone updates, and a `Cancel Execution` button.
9. **Kaggle Cloud Worker Execution**:
   - Dispatches GitHub Actions workflow (`trigger_pipeline.yml`) with `is_premium: true`, passing the API key and character anchor.
   - Kaggle spins up worker `doris-storyteller-worker` on **NVIDIA Tesla T4 GPU (CUDA)**:
     - **Phase 1: Dynamic Cloud Image Generation**: Submits each prompt to **Kie.ai NanoBanana 2 Lite** (`nano-banana-2-lite`) at 1K resolution (1920x1080, 16:9) with the character reference sheet anchor. Polling downloads each image in ~12–16 seconds and names it `<SN>. <Sentence>.jpg`.
     - **Phase 2: High-Fidelity Audio Synthesis**: Synthesizes sentence-by-sentence audio via F5-TTS zero-shot voice cloning on CUDA.
     - **Phase 3: 1080p Video Compilation**: Stitches the master audio and images into a synchronized 1080p MP4 with FFmpeg and uploads to Hugging Face.
   - Pushes live milestone and percentage updates directly to `dorisautomate.web.app` in real-time.
   - History logs and table record the task with the `💎 Premium (Kie.ai)` tier badge.

---

### Phase 5: Master Video Delivery & Playback

1. **Retrieve Video Asset**:
   - Extract the master 1080p MP4 URL from Hugging Face Datasets repository (`https://huggingface.co/datasets/Dorisautomate/automation-assets/resolve/main/videos/...`).
2. **Library Registration**:
   - Verify that the execution entry appears in the web app's **Execution Logs & History** tab with status `🟢 Completed`.
3. **Final Delivery Message to User**:
   - Once (and only once) all phases are 100% complete, deliver the completion report:
     - **Video Title & Topic Angle**
     - **Channel Attribution**: Dr Doris Psych (`@DrDorisPsych`)
     - **Voice Profile Used**: Hope — Professional, Clear & Natural
     - **Total Scenes / Images Generated**: (e.g. 180 scenes)
     - **Total Script Word Count & Runtime**: (e.g. 2,850 words / 15 mins 40 secs)
     - **Direct Playable Video Link**: [Watch Video](https://huggingface.co/datasets/Dorisautomate/automation-assets/resolve/main/videos/doris_kaggle_story_video.mp4)
     - **Direct MP4 Download Link**
     - **Live Web App Dashboard**: [https://dorisautomate.web.app](https://dorisautomate.web.app)

---

## Standard Operating Procedures for Autonomous Agents

1. **Continuous Autonomy**: Never pause for user input between phases. Execute all phases end-to-end.
2. **Always use active Chrome (Port 9222)**: Never launch a separate unauthenticated headless browser.
3. **Mandatory Duplicate Prevention**: Always check `@DrDorisPsych` before locking the topic.
4. **Enforce 1:1 Image-to-Sentence parity**: Every image must strictly correspond to its numbered script sentence.
5. **Primary Compiler**: Always use `dorisautomate.web.app` as the primary live compiler.
6. **Default Voice**: Default voice is always Hope Professional.
7. **💎 Premium Studio Fast-Track Priority**: Whenever the user mentions "premium studio", "premium account", or "using my premium studio", **NEVER visit Google Flow or Veed.io**. Completely bypass Phase 3 and go directly to `https://dorisautomate.web.app` in 💎 Premium Studio mode. Upload the CSV and let the cloud Kaggle T4 GPU + Kie.ai NanoBanana 2 Lite pipeline generate all images and video automatically.
