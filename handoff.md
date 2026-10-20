# Epic Automate Project Handoff

> **Note for Subsequent Agents**: This document tracks the real-time operational status, architectural bindings, credentials status, and incremental modifications for this automation project. Update this document after every major change.

---

## 1. Project Identity & Architecture
- **Project Name**: Doris AI Storyteller & Sentence-Synchronized Video Automation
- **Date Created**: 2026-10-13
- **Last Modified**: 2026-10-14 10:25
- **Modus Operandi**: `epic-automate`
  - **Frontend**: Live on Firebase Hosting (`https://dorisautomate.web.app`)
  - **Local Bridge Server**: `server.py` on `http://127.0.0.1:5000` (bridges web frontend directly to Kaggle CLI & Hugging Face)
  - **State & Progress**: Persistent Execution State with localStorage + live polling of Kaggle & Hugging Face datasets
  - **Compute Server**: Kaggle T4 GPU (`dorisautomate/doris-storyteller-worker` with `machine_shape: "NvidiaTeslaT4"`)
  - **Asset Storage**: Hugging Face Datasets (`Dorisautomate/automation-assets`) with embedded HTML5 video preview player
  - **Version Control**: GitHub repository (`https://github.com/Dorisautomate/doris-storyteller-automation`)

---

## 2. Infrastructure Endpoints & Identifiers
| Service | Resource | Identifier / URL | Status |
|---|---|---|---|
| **Firebase Hosting** | Web Frontend | `https://dorisautomate.web.app` | 🟢 Live & Tested |
| **Local Bridge Server** | API Bridge | `http://127.0.0.1:5000/api/status` | 🟢 Running (200 OK) |
| **Kaggle Kernel** | T4 GPU Worker | `https://www.kaggle.com/code/dorisautomate/doris-storyteller-worker` | 🟢 Pushed & Triggerable |
| **Hugging Face Datasets** | Asset Storage | `https://huggingface.co/datasets/Dorisautomate/automation-assets` | 🟢 Active & Verified |
| **Output Video Asset** | Master MP4 (True F5-TTS Doris Voice Clone) | `https://huggingface.co/datasets/Dorisautomate/automation-assets/resolve/main/videos/doris_f5_cloned_story_video.mp4` | 🟢 Verified & Playing |
| **GitHub Repository** | Source Code | `https://github.com/Dorisautomate/doris-storyteller-automation` | 🟢 Synced |

---

## 3. Credentials & Secrets Audit
- [x] **GitHub PAT**: Verified as `@Dorisautomate` with full repo scopes (`GITHUB_TOKEN`).
- [x] **Hugging Face Token**: Verified as `@Dorisautomate` with write role (`HF_TOKEN`).
- [x] **Kaggle API**: Verified as `@Dorisautomate` with `~/.kaggle/access_token` (stripped UTF-8 BOM) and `KAGGLE_API_TOKEN`.
- [x] **Firebase Authentication**: Active session in Firebase CLI for project `dorisautomate`.
- [x] **Local Runtimes**: Python 3.11, Node.js 20, npm, Git 2.47, FFmpeg 9.0.2 installed and on PATH.

---

## 4. Key Architectural Discoveries & Kaggle Specifications
1. **Kaggle CLI 2.2.4 Accelerator Parameter**:
   - Researched via `kagglesdk.kernels.types.kernels_api_service`:
   - Exact accelerator string: `"machine_shape": "NvidiaTeslaT4"` (or CLI `--accelerator NvidiaTeslaT4`).
   - `"enable_gpu": true` and `"enable_internet": true`.
2. **Kaggle Phone Verification Prerequisite**:
   - To unlock the NVIDIA T4 GPU accelerator and outbound internet connectivity for pip/Hugging Face downloads inside Kaggle kernel containers, Kaggle accounts require a **one-time SMS phone verification** at `https://www.kaggle.com/settings`.
   - Without phone verification, Kaggle silently falls back container sessions to CPU-only without external internet DNS resolution.
3. **End-to-End Execution Bridge**:
   - `server.py` runs a lightweight HTTP server on port 5000 that listens for `POST /api/run`.
   - When the user presses "Run Execution" on the web app, `server.py` pushes the kernel to Kaggle with the T4 GPU accelerator, polls kernel status, and returns live progress to `frontend/app.js`.
   - `frontend/app.js` updates the progress bar, streams live console logs, and embeds the final video preview player automatically upon completion.

---

## 5. Work Completed & Modifications Log
- **2026-10-13**: Extracted and installed `epic-automate` agent skill into `C:\Users\doris\.gemini\config\skills\epic-automate`.
- **2026-10-13**: Configured system environment variables and credential files for GitHub, Hugging Face, Kaggle, and Firebase.
- **2026-10-13**: Analyzed sample image sequence in `C:\Users\doris\Downloads\psychology 1` with numbered prefix schema (`1. ...`, `2. ...`).
- **2026-10-13**: Inspected `C:\Users\doris\OneDrive\Documents\Sound Recordings\DORIS VOICE.m4a` and generated reference audio & transcript for F5-TTS cloning.
- **2026-10-14**: Fixed Kaggle token encoding issue (removed UTF-8 BOM from `~/.kaggle/access_token` and set `KAGGLE_API_TOKEN`).
- **2026-10-14**: Tested Kaggle kernel push directly against Kaggle API (`dorisautomate/gpu-environment-test`). Verified execution lifecycle on Kaggle.
- **2026-10-14**: Built autonomous worker `kaggle/kaggle_executor.py` and `kaggle/kernel-metadata.json` configured for T4 GPU (`machine_shape: "NvidiaTeslaT4"`).
- **2026-10-14**: Pushed kernel version 1 to Kaggle: `https://www.kaggle.com/code/dorisautomate/doris-storyteller-worker`.
- **2026-10-14**: Created `server.py` local API bridge and updated `frontend/app.js` with real Kaggle polling logic.
- **2026-10-14**: Redeployed updated frontend live to Firebase Hosting at `https://dorisautomate.web.app`.

---

## 6. Standard Operating Procedures for Subsequent Agents
1. **Triggering Kaggle execution**: Run `python -m kaggle kernels push -p kaggle --accelerator NvidiaTeslaT4` or launch `server.py` and click "Run Execution" in the frontend.
2. **Kaggle GPU unlock**: Prompt user to complete the 1-minute phone verification at `https://www.kaggle.com/settings` if CUDA or internet is blocked in Kaggle container logs.
3. **Always ensure image sequence numbers match script line count** before launching generation jobs.
4. **Always update this `handoff.md`** file upon completing any task or modification.
