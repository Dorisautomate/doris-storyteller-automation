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
HF_TOKEN = os.environ.get("HF_TOKEN")
if not HF_TOKEN:
    try:
        from kaggle_secrets import UserSecretsClient
        user_secrets = UserSecretsClient()
        HF_TOKEN = user_secrets.get_secret("HF_TOKEN")
    except Exception:
        pass
HF_DATASET_REPO = "Dorisautomate/automation-assets"
JOB_ID = os.environ.get("JOB_ID", f"kaggle_job_{int(time.time())}")

cancel_requested = False

def update_status(progress_pct, milestone_text, status="running", asset_url=None):
    """Logs milestone and updates status file."""
    timestamp = time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime())
    print(f"[{timestamp}] [{progress_pct}%] [{status.upper()}] {milestone_text}", flush=True)

    status_data = {
        "jobId": JOB_ID,
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

# 4. Download Doris Voice Reference
os.makedirs("work_dir", exist_ok=True)
ref_audio_path = hf_hub_download(
    repo_id=HF_DATASET_REPO,
    filename="references/doris_voice_ref.wav",
    repo_type="dataset",
    token=HF_TOKEN,
    local_dir="work_dir"
)
ref_text_path = hf_hub_download(
    repo_id=HF_DATASET_REPO,
    filename="references/doris_voice_ref.txt",
    repo_type="dataset",
    token=HF_TOKEN,
    local_dir="work_dir"
)

with open(ref_text_path, "r", encoding="utf-8") as f:
    ref_text = f.read().strip()

print(f"[Ref Audio] Path: {ref_audio_path} ({os.path.getsize(ref_audio_path)} bytes)")
print(f"[Ref Text] Content: {ref_text}")

# 5. Download Sample Images
update_status(25, "Fetching scene image assets from repository...")
image_files = []
for i in range(1, 5):
    # Find matching filename in dataset
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

# 6. Define Script Sentences
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
api.upload_file(
    path_or_fileobj=final_video_path,
    path_in_repo=remote_video_path,
    repo_id=HF_DATASET_REPO,
    repo_type="dataset"
)

hf_public_url = f"https://huggingface.co/datasets/{HF_DATASET_REPO}/resolve/main/{remote_video_path}"
print(f"[HF Upload] Asset published at: {hf_public_url}")

# 12. Finalize Job Status
update_status(100, "Automation execution completed successfully on Kaggle!", status="completed", asset_url=hf_public_url)

# Upload job status to Hugging Face
api.upload_file(
    path_or_fileobj="job_status.json",
    path_in_repo=f"jobs/{JOB_ID}.json",
    repo_id=HF_DATASET_REPO,
    repo_type="dataset"
)
api.upload_file(
    path_or_fileobj="job_status.json",
    path_in_repo="jobs/latest_job.json",
    repo_id=HF_DATASET_REPO,
    repo_type="dataset"
)

print("=" * 60)
print(f">>> DORIS AI STORYTELLER — KAGGLE JOB {JOB_ID} COMPLETED!")
print(f">>> Direct Asset URL: {hf_public_url}")
print("=" * 60)
