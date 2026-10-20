# Epic Automate Project Handoff

> **Note for Subsequent Agents**: This document tracks the real-time operational status, architectural bindings, credentials status, and incremental modifications for this automation project. Update this document after every major change.

---

## 1. Project Identity & Architecture
- **Project Name**: Doris AI Storyteller & Sentence-Synchronized Video Automation
- **Date Created**: 2026-10-13
- **Last Modified**: 2026-10-20 11:10
- **Modus Operandi**: `epic-automate` (100% Live Cloud Deployment)
  - **Master Skill Registered**: `doris` (`skills/doris/SKILL.md` and `~/.gemini/config/skills/doris/SKILL.md`) — Bound specifically to **[Dr Doris Psych](https://www.youtube.com/@DrDorisPsych)**. Features the **Uninterrupted Autonomous Execution Mandate** (runs 100% autonomously from channel audit & duplicate prevention to final video delivery without user interruption).
  - **Frontend**: Live on Firebase Hosting (`https://dorisautomate.web.app`) — accessible globally from any browser or device.
  - **Tabs & Views**:
    - **Studio / Generator**: Step-by-step studio with image selector, multi-voice picker, script alignment matrix, and live execution monitor.
    - **Execution Logs & Video Library**: Dedicated dashboard tab with full history table of past runs, search/filter controls, direct video preview modal, download buttons, and Hugging Face cloud sync.
  - **Default Voice Model**: `✨ Hope — Professional, Clear & Natural` (cloned from ElevenLabs reference audio). Hope Upbeat and Doris Voice available.
  - **Cloud Orchestration**: GitHub Actions Cloud (`.github/workflows/trigger_pipeline.yml`) with state change monitoring (prevents HF commit rate limits).
  - **Compute Server**: Kaggle T4 GPU (`dorisautomate/doris-storyteller-worker` Kernel Version 10).
  - **Asset Storage & Playback**: Hugging Face Datasets (`Dorisautomate/automation-assets`) with embedded HTML5 video preview player.
  - **Version Control**: GitHub repository (`https://github.com/Dorisautomate/doris-storyteller-automation`).

---

## 2. Infrastructure Endpoints & Identifiers
| Service | Resource | Identifier / URL | Status |
|---|---|---|---|
| **Firebase Hosting** | Web Frontend | `https://dorisautomate.web.app` | 🟢 100% Live (Studio + Execution Logs Tabs) |
| **Cloud Orchestrator** | GitHub Actions | `https://github.com/Dorisautomate/doris-storyteller-automation/actions` | 🟢 Cloud Workflow Verified (Multi-Voice Support) |
| **Kaggle Kernel** | T4 GPU Worker | `https://www.kaggle.com/code/dorisautomate/doris-storyteller-worker` | 🟢 Kernel v10 Deployed |
| **Hugging Face Datasets** | Asset Storage | `https://huggingface.co/datasets/Dorisautomate/automation-assets` | 🟢 Active (Hope & Doris Voice Slices & MP4s Stored) |
| **1-Minute Master Video (Why Your Brain Panics When You Say No)** | 1080p MP4 | `https://huggingface.co/datasets/Dorisautomate/automation-assets/resolve/main/videos/why_your_brain_panics_saying_no_1080p.mp4` | 🟢 Verified & Playing |
| **Master Video (Hope Professional)** | 1080p MP4 | `https://huggingface.co/datasets/Dorisautomate/automation-assets/resolve/main/videos/hope_professional_story_video.mp4` | 🟢 Verified & Playing |
| **Master Video (Hope Upbeat)** | 1080p MP4 | `https://huggingface.co/datasets/Dorisautomate/automation-assets/resolve/main/videos/hope_upbeat_story_video.mp4` | 🟢 Verified & Playing |
| **Master Video (Doris Voice Clone)** | 1080p MP4 | `https://huggingface.co/datasets/Dorisautomate/automation-assets/resolve/main/videos/doris_f5_cloned_story_video.mp4` | 🟢 Verified & Playing |
| **Doris Master Skill Repo** | Public GitHub Repo | `https://github.com/Dorisautomate/Doris` | 🟢 Published & Public |
| **GitHub Repository** | Automation Source Code | `https://github.com/Dorisautomate/doris-storyteller-automation` | 🟢 Synced |

---

## 3. Credentials & Secrets Audit
- [x] **GitHub PAT**: Verified as `@Dorisautomate` (`GITHUB_TOKEN`) with workflow dispatch permissions.
- [x] **GitHub Action Secrets**: Encrypted repository secrets configured for `KAGGLE_API_TOKEN` and `HF_TOKEN`.
- [x] **Hugging Face Token**: Verified as `@Dorisautomate` with write role (`HF_TOKEN`).
- [x] **Kaggle API**: Verified as `@Dorisautomate` with `KAGGLE_API_TOKEN`.
- [x] **Firebase Authentication**: Active session in Firebase CLI for project `dorisautomate`.

---

## 4. Key Architectural Achievements (100% Cloud Hosting)
1. **Zero Local Dependencies**:
   - The user or any public visitor can open `https://dorisautomate.web.app` from their phone, tablet, or another computer. The user's local machine does not need to be running.
2. **Cloud Dispatch Pipeline**:
   - The "Run Execution" button dispatches `.github/workflows/trigger_pipeline.yml` in GitHub's cloud environment.
   - GitHub Actions installs Kaggle CLI, authenticates via encrypted repository secrets, and pushes the worker kernel to Kaggle's T4 GPU accelerator (`--accelerator NvidiaTeslaT4`).
3. **Kaggle Compute & Media Stitching**:
   - The Kaggle worker downloads the Doris voice reference audio, scene images, loads F5-TTS, synthesizes audio line-by-line, and compiles the video with FFmpeg.
   - The output is automatically uploaded to Hugging Face Datasets `Dorisautomate/automation-assets`.
4. **Live Frontend Preview**:
   - The web app monitors cloud status in real-time and embeds the final video directly into the HTML5 video player. State persists on page refresh.

---

## 5. Milestone: Full 15-Minute Production Run (Be So Calm It Makes People Nervous)
- **Title**: *"Be So Calm It Makes People Nervous: The 6 Levels of Psychological Leverage"*
- **Structure**: 11-Beat PSY-Ladder Outlier System (2,424 words / 169 scenes).
- **Scene Assets**: 169 sequentially named images batch-generated via Google Flow (`Doris Image Stylist`) with `🍌 Nano Banana 2 Lite` (16:9) and anchor character reference, extracted directly from DOM memory to `C:\Users\doris\Downloads\be_so_calm_it_makes_people_nervous_images\`.
- **Script Assets**: `be_so_calm_it_makes_people_nervous_15min.csv` and `be_so_calm_it_makes_people_nervous_15min.txt`.
- **Narration Audio**: 100% synthesized sentence-by-sentence with Hope Professional voice profile (**1,024.42 seconds / 17.07 minutes** total spoken duration).
- **Web App Alignment**: Verified on `https://dorisautomate.web.app` (`Job: epic_job_1792522570517`) with `🟢 Aligned: 169 Images ↔ 169 Sentences`.
- **Master Video Rendered**: 1,024.42 seconds (17.07 minutes), 1920x1080 Full HD (22.75 MB), AAC audio.
- **Deliverables**:
  - Local MP4: `C:\Users\doris\Downloads\be_so_calm_it_makes_people_nervous_1080p.mp4`
  - Cloud Playable URL: `https://huggingface.co/datasets/Dorisautomate/automation-assets/resolve/main/videos/be_so_calm_it_makes_people_nervous_1080p.mp4`

---

## 6. Milestone: True 1-Minute Production Run (Why Your Brain Panics When You Say No)
- **Zero Improvisation / No Image Recycling**: All 15 scenes generated fresh on Google Flow tool via user active Chrome session.
- **Scene Assets**: 15 sequentially numbered 16:9 images saved to `C:\Users\doris\Downloads\why_your_brain_panics_saying_no_images\`.
- **Script TXT / CSV**: 15 sentences, full 1-minute+ long-form script (`why_your_brain_panics_saying_no_true_1min.txt` / `.csv`).
- **Web App Alignment**: Verified on `https://dorisautomate.web.app` with `🟢 Aligned: 15 Images ↔ 15 Sentences`.
- **Master Video Rendered**: 105.7 seconds (1.76 minutes), 1920x1080 Full HD, AAC audio with Hope Professional voice.
- **Deliverables**:
  - Local MP4: `C:\Users\doris\Downloads\why_your_brain_panics_saying_no_1080p.mp4`
  - Cloud URL: `https://huggingface.co/datasets/Dorisautomate/automation-assets/resolve/main/videos/why_your_brain_panics_saying_no_1080p.mp4`

---

## 6. Standard Operating Procedures for Subsequent Agents
1. **Public Web URL**: Always use `https://dorisautomate.web.app` as the primary live user interface.
2. **Kaggle Phone Verification**: Ensure the user has completed SMS Phone Verification at `https://www.kaggle.com/settings` to allow Kaggle container GPU access and outbound internet.
3. **Always update this `handoff.md`** file upon completing any task or modification.
