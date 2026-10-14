# Epic Automate Project Handoff

> **Note for Subsequent Agents**: This document tracks the real-time operational status, architectural bindings, credentials status, and incremental modifications for this automation project. Update this document after every major change.

---

## 1. Project Identity & Architecture
- **Project Name**: Doris AI Storyteller & Sentence-Synchronized Video Automation
- **Date Created**: 2026-10-13
- **Last Modified**: 2026-10-13 10:55
- **Modus Operandi**: `epic-automate`
  - **Frontend**: Live on Firebase Hosting (`https://dorisautomate.web.app`)
  - **State & Progress**: Persistent Execution State with localStorage + Firestore REST API
  - **Compute Server**: Kaggle T4 GPU (`nvidiaTeslaT4`) F5-TTS zero-shot voice cloning
  - **Asset Storage**: Hugging Face Datasets (`Dorisautomate/automation-assets`) with embedded HTML5 video preview player
  - **Version Control**: GitHub repository (`https://github.com/Dorisautomate/doris-storyteller-automation`)

---

## 2. Infrastructure Endpoints & Identifiers
| Service | Resource | Identifier / URL | Status |
|---|---|---|---|
| **Firebase Hosting** | Web Frontend | `https://dorisautomate.web.app` | 🟢 Live & Tested |
| **Hugging Face Datasets** | Asset Storage | `https://huggingface.co/datasets/Dorisautomate/automation-assets` | 🟢 Active & Verified |
| **Output Video Asset** | Master MP4 (True F5-TTS Doris Voice Clone) | `https://huggingface.co/datasets/Dorisautomate/automation-assets/resolve/main/videos/doris_f5_cloned_story_video.mp4` | 🟢 Verified & Playing |
| **GitHub Repository** | Source Code | `https://github.com/Dorisautomate/doris-storyteller-automation` | 🟢 Synced |
| **Kaggle Compute** | GPU Accelerator | T4 GPU (`NvidiaTeslaT4`) | 🟢 Verified |

---

## 3. Credentials & Secrets Audit
- [x] **GitHub PAT**: Verified as `@Dorisautomate` with full repo scopes (`GITHUB_TOKEN`).
- [x] **Hugging Face Token**: Verified as `@Dorisautomate` with write role (`HF_TOKEN`).
- [x] **Kaggle API**: Verified as `@Dorisautomate` with `~/.kaggle/access_token` and `kaggle.json`.
- [x] **Firebase Authentication**: Active session in Firebase CLI for project `dorisautomate`.
- [x] **Local Runtimes**: Python 3.11, Node.js 20, npm, Git 2.47, FFmpeg 9.0.2 installed and on PATH.

---

## 4. Work Completed & Modifications Log
- **2026-10-13**: Extracted and installed `epic-automate` agent skill into `C:\Users\doris\.gemini\config\skills\epic-automate`.
- **2026-10-13**: Configured system environment variables and credential files for GitHub, Hugging Face, Kaggle, and Firebase.
- **2026-10-13**: Installed Python 3.11.9, Node.js v20.18.0, npm 10.8.2, FFmpeg 9.0.2, and Firebase CLI v15.33.0.
- **2026-10-13**: Analyzed sample image sequence in `C:\Users\doris\Downloads\psychology 1` with numbered prefix schema (`1. ...`, `2. ...`).
- **2026-10-13**: Inspected `C:\Users\doris\OneDrive\Documents\Sound Recordings\DORIS VOICE.m4a` (20-second clean voice recording) and generated exact reference transcript for F5-TTS cloning.
- **2026-10-13**: Built reactive frontend with natural number image sorting, F5-TTS voice dropdown, script textarea, and visual 1:1 image-sentence alignment confirmation matrix.
- **2026-10-13**: Implemented execution persistence so refreshing or reopening the web page restores the exact progress, logs, and video preview without losing state.
- **2026-10-13**: Deployed frontend to Firebase Hosting at `https://dorisautomate.web.app`.
- **2026-10-13**: Executed full sentence synthesis, audio duration measurement, and 1080p FFmpeg slideshow video rendering (`doris_psychology_story_video.mp4`, 24 seconds, 1.5 MB).
- **2026-10-13**: Uploaded rendered video to Hugging Face Datasets repository `Dorisautomate/automation-assets`.
- **2026-10-13**: Executed live end-to-end browser test against `https://dorisautomate.web.app` using headless browser; verified video playback, line counting, alignment badge, and state persistence upon reload.

---

## 5. Standard Operating Procedures for Subsequent Agents
1. **Never overwrite existing Firebase projects** unless explicitly commanded by user.
2. **Always ensure image sequence numbers match script line count** before launching generation jobs.
3. **Verify audio durations before FFmpeg concatenation** to maintain frame-accurate image transitions on sentence boundaries.
4. **Always update this `handoff.md`** file upon completing any task or modification.
