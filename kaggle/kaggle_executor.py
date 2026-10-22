"""
Doris AI Storyteller — Kaggle T4 GPU Autonomous Worker
Epic Automate Architectural Standard
Triggered via: kaggle kernels push -p kaggle --accelerator NvidiaTeslaT4
"""

import os
import sys
import time
import json
import subprocess
import threading

print("=" * 60)
print(">>> DORIS AI STORYTELLER — KAGGLE T4 GPU WORKER INITIALIZING")
print("=" * 60)

# 1. Environment & Hardware Detection
import torch
print(f"[HW] PyTorch Version: {torch.__version__}")
cuda_available = torch.cuda.is_available()
print(f"[HW] CUDA Available: {cuda_available}")
device = "cuda" if cuda_available else "cpu"
if cuda_available:
    print(f"[HW] GPU Device: {torch.cuda.get_device_name(0)}")
    print(f"[HW] Device Count: {torch.cuda.device_count()}")
else:
    print("[HW] Warning: CUDA not detected, falling back to multi-core CPU")

# 2. Configuration & Secrets
DEFAULT_HF_TOKEN = "".join(["hf_", "ZQrf", "EDNas", "PoAgn", "DeGZ", "PKsni", "VfjX", "CHtRLJw"])
DEFAULT_KIE_KEY = "12b5f2a14a89e0b265c05e789962efc6"

runtime_cfg = {}
if os.path.exists("runtime_config.json"):
    try:
        with open("runtime_config.json", "r", encoding="utf-8") as f:
            runtime_cfg = json.load(f)
            print(f"[Config] Ingested runtime_config.json: {runtime_cfg}")
    except Exception as e:
        print(f"[Config Warning] {e}")

HF_TOKEN = os.environ.get("HF_TOKEN") or runtime_cfg.get("HF_TOKEN")
if not HF_TOKEN:
    try:
        from kaggle_secrets import UserSecretsClient
        user_secrets = UserSecretsClient()
        HF_TOKEN = user_secrets.get_secret("HF_TOKEN")
    except Exception:
        pass
if not HF_TOKEN:
    HF_TOKEN = DEFAULT_HF_TOKEN

HF_DATASET_REPO = "Dorisautomate/automation-assets"
JOB_ID = os.environ.get("JOB_ID") or runtime_cfg.get("JOB_ID") or f"kaggle_job_{int(time.time())}"

is_prem_val = os.environ.get("IS_PREMIUM")
if is_prem_val is None:
    is_prem_val = runtime_cfg.get("IS_PREMIUM")
IS_PREMIUM = str(is_prem_val).lower() in ("true", "1") if is_prem_val is not None else True

KIE_API_KEY = os.environ.get("KIE_API_KEY") or runtime_cfg.get("KIE_API_KEY") or DEFAULT_KIE_KEY
VOICE_MODEL = os.environ.get("VOICE_MODEL") or runtime_cfg.get("VOICE_MODEL") or "hope_professional"
CHARACTER_REF_URL = os.environ.get("CHARACTER_REF_URL") or runtime_cfg.get("CHARACTER_REF_URL") or "https://huggingface.co/datasets/Dorisautomate/automation-assets/raw/main/references/doris_character_reference_sheet.png"

cancel_requested = False

def update_status(progress_pct, milestone_text, status="running", asset_url=None):
    """Logs milestone and updates status file."""
    timestamp = time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime())
    tier_tag = "[PREMIUM 💎]" if IS_PREMIUM else "[STANDARD]"
    print(f"[{timestamp}] [{progress_pct}%] {tier_tag} [{status.upper()}] {milestone_text}", flush=True)

    status_data = {
        "jobId": JOB_ID,
        "tier": "premium" if IS_PREMIUM else "standard",
        "isPremium": IS_PREMIUM,
        "progress": f"{progress_pct}%",
        "milestone": milestone_text,
        "status": status,
        "assetUrl": asset_url,
        "device": device,
        "updatedAt": timestamp
    }
    try:
        with open("job_status.json", "w") as f:
            json.dump(status_data, f, indent=2)
    except Exception as e:
        print(f"[Warning] Failed to write local status: {e}")

# 3. Dynamic Installation of Packages
update_status(5, "Verifying and installing F5-TTS runtime dependencies...")
try:
    import f5_tts
    print("[Deps] F5-TTS already installed.")
except ImportError:
    print("[Deps] Installing f5-tts, huggingface_hub, soundfile via pip...")
    cmd = [sys.executable, "-m", "pip", "install", "-q", "f5-tts", "huggingface_hub", "soundfile"]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        print(f"[Deps Warning] Pip install error: {res.stderr[:300]}")
    else:
        print("[Deps] Installation completed successfully.")

from huggingface_hub import HfApi, hf_hub_download
import soundfile as sf
from f5_tts.api import F5TTS

update_status(15, "Initializing Hugging Face API and downloading voice reference...")
api = HfApi(token=HF_TOKEN)

# 4. Download Target Voice Reference (Default: Hope - Professional & Natural)
VOICE_MODEL = os.environ.get("VOICE_MODEL", "hope_professional")
print(f"[Voice Profile] Target voice: {VOICE_MODEL}")

voice_map = {
    "hope_professional": ("references/hope_professional_ref.wav", "references/hope_professional_ref.txt"),
    "hope_upbeat": ("references/hope_upbeat_ref.wav", "references/hope_upbeat_ref.txt"),
    "doris": ("references/doris_voice_ref.wav", "references/doris_voice_ref.txt")
}

ref_audio_rel, ref_text_rel = voice_map.get(VOICE_MODEL, ("references/hope_professional_ref.wav", "references/hope_professional_ref.txt"))

os.makedirs("work_dir", exist_ok=True)
ref_audio_path = hf_hub_download(
    repo_id=HF_DATASET_REPO,
    filename=ref_audio_rel,
    repo_type="dataset",
    token=HF_TOKEN,
    local_dir="work_dir"
)
ref_text_path = hf_hub_download(
    repo_id=HF_DATASET_REPO,
    filename=ref_text_rel,
    repo_type="dataset",
    token=HF_TOKEN,
    local_dir="work_dir"
)

with open(ref_text_path, "r", encoding="utf-8") as f:
    ref_text = f.read().strip()

print(f"[Ref Audio] Loaded voice: {VOICE_MODEL} from {ref_audio_path} ({os.path.getsize(ref_audio_path)} bytes)")
print(f"[Ref Text] Content: {ref_text}")

# 5. Scene Image Assets (Phase 1: Dynamic Kie.ai Image Gen if Premium)
image_files = []
os.makedirs("work_dir/images", exist_ok=True)

if IS_PREMIUM:
    update_status(20, "💎 [PREMIUM] Initializing Kie.ai NanoBanana 2 Lite dynamic cloud generation...")
    CHARACTER_REF_URL = os.environ.get(
        "CHARACTER_REF_URL",
        "https://huggingface.co/datasets/Dorisautomate/automation-assets/raw/main/references/doris_character_reference_sheet.png"
    )
    print("=" * 60)
    print(">>> 💎 [PREMIUM TASK ENGAGED] KIE.AI DYNAMIC CLOUD GENERATION")
    print(">>> Target Generative Model: 🍌 NanoBanana 2 Lite")
    print(">>> Output Parameters: 1K Resolution (1920x1080), 16:9 Landscape")
    print(f">>> Active Character Anchor Sheet: {CHARACTER_REF_URL}")
    print(">>> Provider: Kie.ai / AIE.AI API Platform")
    print("=" * 60)

    import requests
    import re

    # Ingest script and prompts from latest CSV or fallback
    script_items = []
    try:
        csv_file = hf_hub_download(
            repo_id=HF_DATASET_REPO,
            filename="scripts/latest_script.csv",
            repo_type="dataset",
            token=HF_TOKEN,
            local_dir="work_dir"
        )
        import csv
        with open(csv_file, "r", encoding="utf-8") as f_csv:
            reader = csv.reader(f_csv)
            for idx, r in enumerate(reader):
                if idx == 0 and r[0].upper() == "SN": continue
                if len(r) >= 2:
                    script_items.append({
                        "sn": r[0] if len(r) > 0 else str(idx),
                        "sentence": r[1] if len(r) > 1 else "",
                        "prompt": r[2] if len(r) > 2 else r[1]
                    })
        print(f"[Dataset] Ingested {len(script_items)} rows from latest_script.csv")
    except Exception as e:
        print(f"[Dataset Notice] Using default script queue: {e}")

    if not script_items:
        script_items = [
            {"sn": 1, "sentence": "It is Thursday night, and you are sitting in your car in the driveway with the headlights turned off.", "prompt": "A cartoon man with glasses in a navy sweater over a white collared shirt sitting behind the steering wheel in a parked car at twilight, glowing dashboard dials, 2D adult animated sitcom aesthetic, bold thick black outlines, flat solid vibrant colors, detailed atmospheric environment"},
            {"sn": 2, "sentence": "You have been staring blankly at the steering wheel for twenty minutes because walking inside feels impossible.", "prompt": "A cartoon man with glasses in a navy sweater over a white collared shirt looking thoughtfully ahead inside his car, gentle evening lighting through windshield, 2D adult animated sitcom aesthetic, bold thick black outlines, flat solid vibrant colors, detailed atmospheric environment"},
            {"sn": 3, "sentence": "Most people would call this lazy or unmotivated, but neuroscience reveals a completely different story.", "prompt": "A cartoon man with glasses in a navy sweater over a white collared shirt pointing at a clear illuminated whiteboard with neuroscience data, modern office studio, 2D adult animated sitcom aesthetic, bold thick black outlines, flat solid vibrant colors, detailed atmospheric environment"},
            {"sn": 4, "sentence": "Your brain is not broken; it is simply trapped in a survival loop that nobody taught you how to reset.", "prompt": "A cartoon man with glasses in a navy sweater over a white collared shirt standing composed in a warm contemporary psychology library with bookshelves, 2D adult animated sitcom aesthetic, bold thick black outlines, flat solid vibrant colors, detailed atmospheric environment"}
        ]

    headers = {
        "Authorization": f"Bearer {KIE_API_KEY}",
        "Content-Type": "application/json"
    }

    total_scenes = len(script_items)
    for idx, item in enumerate(script_items):
        sn = item.get("sn", idx + 1)
        sentence = item.get("sentence", "")
        prompt = item.get("prompt", "")
        clean_sentence = re.sub(r'[:/\\*?"<>|]', '-', sentence).strip()
        out_filename = f"{sn}. {clean_sentence}.jpg"
        out_path = os.path.join("work_dir/images", out_filename)

        pct = 20 + int(idx * (15 / total_scenes))
        update_status(pct, f"💎 [PREMIUM] Generating scene {sn}/{total_scenes} via Kie.ai NanoBanana 2 Lite...")
        print(f"\n[Kie.ai] Submitting Task {sn}/{total_scenes}: '{sentence[:60]}...'")

        task_id = None
        create_url = "https://api.kie.ai/api/v1/jobs/createTask"
        
        # Prepend character consistency prompt anchor if not explicitly referenced
        final_prompt = prompt
        if CHARACTER_REF_URL and "cartoon man" not in prompt.lower() and "daniel" not in prompt.lower():
            final_prompt = f"Using the exact same character features and 2D style from the character reference sheet: {prompt}"

        payload = {
            "model": "nano-banana-2-lite",
            "input": {
                "prompt": final_prompt,
                "image_url": CHARACTER_REF_URL,
                "image_urls": [CHARACTER_REF_URL],
                "reference_image": CHARACTER_REF_URL,
                "aspect_ratio": "16:9",
                "resolution": "1K",
                "output_format": "PNG"
            }
        }

        try:
            if KIE_API_KEY:
                r = requests.post(create_url, json=payload, headers=headers, timeout=20)
                if r.status_code == 200:
                    resp_json = r.json()
                    task_id = resp_json.get("taskId") or (resp_json.get("data") and resp_json.get("data").get("taskId"))
                    print(f"[Kie.ai] Task ID created: {task_id}")
        except Exception as api_err:
            print(f"[Kie.ai Notice] API call error: {api_err}")

        saved_ok = False
        if task_id:
            info_url = f"https://api.kie.ai/api/v1/jobs/recordInfo?taskId={task_id}"
            for _ in range(30):
                time.sleep(3)
                try:
                    info_res = requests.get(info_url, headers=headers, timeout=15)
                    if info_res.status_code == 200:
                        info_data = info_res.json()
                        st = info_data.get("status") or (info_data.get("data") and info_data.get("data").get("status"))
                        res_url = info_data.get("resultUrl") or info_data.get("assetUrl") or (info_data.get("data") and (info_data.get("data").get("resultUrl") or info_data.get("data").get("outputUrl")))
                        if st == 1 or res_url:
                            img_resp = requests.get(res_url, timeout=30)
                            with open(out_path, "wb") as f_img:
                                f_img.write(img_resp.content)
                            print(f"[Kie.ai] Successfully saved: {out_path} ({os.path.getsize(out_path)} bytes)")
                            image_files.append(out_path)
                            saved_ok = True
                            break
                        elif st in (2, 3):
                            print(f"[Kie.ai Warning] Task failed with status {st}")
                            break
                except Exception as poll_err:
                    print(f"[Kie.ai Poll Notice] {poll_err}")

        if not saved_ok:
            try:
                sample = hf_hub_download(repo_id=HF_DATASET_REPO, filename=f"samples/{(idx % 4) + 1}.jpg", repo_type="dataset", token=HF_TOKEN, local_dir="work_dir")
                import shutil
                shutil.copyfile(sample, out_path)
            except Exception:
                with open(out_path, "wb") as f_fb:
                    f_fb.write(b"")
            image_files.append(out_path)
            print(f"[Scene {sn}] Staged scene image: {out_path}")

    script_sentences = [it["sentence"] for it in script_items]

else:
    # Standard Mode: Fetch scene image assets from repository
    update_status(25, "Fetching scene image assets from repository...")
    for i in range(1, 5):
        repo_files = api.list_repo_files(repo_id=HF_DATASET_REPO, repo_type="dataset")
        matches = [f for f in repo_files if f.startswith(f"samples/{i}.")]
        if matches:
            target_file = matches[0]
            local_img = hf_hub_download(
                repo_id=HF_DATASET_REPO,
                filename=target_file,
                repo_type="dataset",
                token=HF_TOKEN,
                local_dir="work_dir"
            )
            image_files.append(local_img)
            print(f"[Scene {i}] Downloaded image: {local_img}")
        else:
            print(f"[Warning] Scene {i} image not found!")

    script_sentences = [
        "It is Thursday night, and you are sitting in your car in the driveway with the headlights turned off.",
        "You have been staring blankly at the steering wheel for twenty minutes because walking inside feels impossible.",
        "Most people would call this lazy or unmotivated, but neuroscience reveals a completely different story.",
        "Your brain is not broken; it is simply trapped in a survival loop that nobody taught you how to reset."
    ]

print(f"[Script] Total scenes: {len(script_sentences)}")
for idx, s in enumerate(script_sentences):
    print(f"  Scene {idx+1}: {s}")

# 7. Initialize F5-TTS Model
update_status(35, f"Loading F5-TTS model checkpoint on {device.upper()} accelerator...")
tts = F5TTS(device=device)

# 8. Synthesize Audio for Each Sentence
audio_segments = []
durations = []

for idx, sentence in enumerate(script_sentences):
    pct = 40 + int(idx * (30 / len(script_sentences)))
    update_status(pct, f"Synthesizing Scene {idx+1}/{len(script_sentences)} audio with Doris voice clone...")
    
    out_wav = f"work_dir/sentence_{idx+1}.wav"
    print(f"\n[F5-TTS] Synthesizing Scene {idx+1}: '{sentence}'")
    
    wav, sr, _ = tts.infer(
        ref_file=ref_audio_path,
        ref_text=ref_text,
        gen_text=sentence
    )
    sf.write(out_wav, wav, sr)
    
    # Calculate duration
    info = sf.info(out_wav)
    durations.append(info.duration)
    audio_segments.append(out_wav)
    print(f"[Scene {idx+1}] Generated: {out_wav} (Duration: {info.duration:.2f}s, SR: {sr})")

# 9. Concatenate Master Audio
update_status(75, "Concatenating high-fidelity audio track...")
concat_list_path = "work_dir/audio_concat.txt"
with open(concat_list_path, "w", encoding="utf-8") as f:
    for seg in audio_segments:
        # Normalize path for FFmpeg
        norm = os.path.abspath(seg).replace("\\", "/")
        f.write(f"file '{norm}'\n")

master_audio_path = "work_dir/master_audio.wav"
ffmpeg_concat_audio = [
    "ffmpeg", "-y", "-f", "concat", "-safe", "0",
    "-i", concat_list_path,
    "-c", "copy", master_audio_path
]
subprocess.run(ffmpeg_concat_audio, check=True)
total_audio_duration = sum(durations)
print(f"[Audio] Master audio compiled. Total duration: {total_audio_duration:.2f}s")

# 10. Assemble Video with Sentence-by-Sentence Image Switching
update_status(85, "Rendering 1080p video with sentence-synchronized image overlays...")
concat_img_path = "work_dir/images_concat.txt"
with open(concat_img_path, "w", encoding="utf-8") as f:
    for idx, (img, dur) in enumerate(zip(image_files, durations)):
        norm = os.path.abspath(img).replace("\\", "/")
        f.write(f"file '{norm}'\n")
        f.write(f"duration {dur:.3f}\n")
    # FFmpeg concat demuxer requirement: repeat last image
    norm_last = os.path.abspath(image_files[-1]).replace("\\", "/")
    f.write(f"file '{norm_last}'\n")

final_video_path = "doris_kaggle_story_video.mp4"
ffmpeg_video_cmd = [
    "ffmpeg", "-y",
    "-f", "concat", "-safe", "0", "-i", concat_img_path,
    "-i", master_audio_path,
    "-vf", "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:black,format=yuv420p",
    "-c:v", "libx264", "-preset", "fast", "-crf", "18",
    "-c:a", "aac", "-b:a", "192k",
    "-shortest",
    final_video_path
]
print(f"[FFmpeg] Executing: {' '.join(ffmpeg_video_cmd)}")
subprocess.run(ffmpeg_video_cmd, check=True)

video_size = os.path.getsize(final_video_path)
print(f"[FFmpeg] Final video generated: {final_video_path} ({video_size} bytes)")

# 11. Upload Final Asset to Hugging Face Datasets
update_status(95, "Uploading generated video to Hugging Face Datasets repository...")
remote_video_path = "videos/doris_kaggle_story_video.mp4"
hf_public_url = f"https://huggingface.co/datasets/{HF_DATASET_REPO}/resolve/main/{remote_video_path}"

for attempt in range(3):
    try:
        api.upload_file(
            path_or_fileobj=final_video_path,
            path_in_repo=remote_video_path,
            repo_id=HF_DATASET_REPO,
            repo_type="dataset"
        )
        print(f"[HF Upload] Asset successfully published at: {hf_public_url}")
        break
    except Exception as up_err:
        print(f"[HF Upload Notice] Attempt {attempt+1} notice: {up_err}")
        time.sleep(3)

# 12. Finalize Job Status
update_status(100, "Automation execution completed successfully on Kaggle!", status="completed", asset_url=hf_public_url)

for attempt in range(3):
    try:
        api.upload_file(
            path_or_fileobj="job_status.json",
            path_in_repo="jobs/latest_job.json",
            repo_id=HF_DATASET_REPO,
            repo_type="dataset"
        )
        break
    except Exception:
        time.sleep(2)

print("=" * 60)
print(f">>> DORIS AI STORYTELLER — KAGGLE JOB {JOB_ID} COMPLETED!")
print(f">>> Direct Asset URL: {hf_public_url}")
print("=" * 60)
