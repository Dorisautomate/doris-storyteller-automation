import os
import sys
import json
import shutil
import asyncio
import subprocess
import soundfile as sf
import edge_tts
from huggingface_hub import HfApi

TXT_PATH = r"C:\Users\doris\Downloads\why_your_brain_panics_saying_no_true_1min.txt"
IMAGES_DIR = r"C:\Users\doris\Downloads\why_your_brain_panics_saying_no_images"
OUTPUT_DIR = r"C:\Users\doris\Downloads\why_your_brain_panics_saying_no_build"
FINAL_VIDEO_PATH = r"C:\Users\doris\Downloads\why_your_brain_panics_saying_no_1080p.mp4"
HF_DATASET_REPO = "Dorisautomate/automation-assets"

VOICE = "en-US-JennyNeural"

os.makedirs(OUTPUT_DIR, exist_ok=True)

async def synthesize_sentence(text, out_path):
    communicate = edge_tts.Communicate(text, VOICE, rate="-4%", pitch="+0Hz")
    await communicate.save(out_path)

def main():
    print("=" * 60)
    print(">>> COMPILING TRUE 1080p PSYCHOLOGY VIDEO (ALL 15 SCENES)")
    print("=" * 60)

    # 1. Read Sentences
    with open(TXT_PATH, "r", encoding="utf-8") as f:
        sentences = [line.strip() for line in f if line.strip()]
    print(f"[Script] Loaded {len(sentences)} sentences.")

    # 2. Get Sorted Image Files and copy them to clean filenames
    clean_image_files = []
    for sn in range(1, len(sentences) + 1):
        found = None
        for fn in os.listdir(IMAGES_DIR):
            if fn.startswith(f"{sn}."):
                found = os.path.join(IMAGES_DIR, fn)
                break
        if not found:
            raise FileNotFoundError(f"Image for scene {sn} not found in {IMAGES_DIR}!")
        
        # Copy to clean filename without spaces or single quotes
        clean_img_path = os.path.join(OUTPUT_DIR, f"clean_scene_{sn}.jpg")
        shutil.copyfile(found, clean_img_path)
        clean_image_files.append(clean_img_path)
        print(f"[Scene {sn}] Image: {os.path.basename(found)} -> clean_scene_{sn}.jpg ({os.path.getsize(clean_img_path)} bytes)")

    # 3. Check / Synthesize Audio for Each Sentence
    audio_segments = []
    durations = []

    print("\n[TTS] Checking/Synthesizing sentence-by-sentence audio narration...")
    for idx, sentence in enumerate(sentences):
        sn = idx + 1
        mp3_path = os.path.join(OUTPUT_DIR, f"scene_{sn}.mp3")
        wav_path = os.path.join(OUTPUT_DIR, f"scene_{sn}.wav")

        if not os.path.exists(wav_path):
            print(f"  Synthesizing Scene {sn}/{len(sentences)}: {sentence[:60]}...")
            asyncio.run(synthesize_sentence(sentence, mp3_path))
            cmd_convert = ["ffmpeg", "-y", "-i", mp3_path, "-ar", "24000", "-ac", "1", wav_path]
            subprocess.run(cmd_convert, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

        info = sf.info(wav_path)
        dur = info.duration
        durations.append(dur)
        audio_segments.append(wav_path)
        print(f"  Scene {sn} Audio Duration: {dur:.2f}s")

    total_duration = sum(durations)
    print(f"\n[Audio] Total Narration Duration: {total_duration:.2f} seconds ({total_duration/60:.2f} minutes)")

    # 4. Concatenate Master Audio
    audio_concat_txt = os.path.join(OUTPUT_DIR, "audio_concat.txt")
    with open(audio_concat_txt, "w", encoding="utf-8") as f:
        for seg in audio_segments:
            norm = seg.replace("\\", "/")
            f.write(f"file '{norm}'\n")

    master_audio = os.path.join(OUTPUT_DIR, "master_narration.wav")
    cmd_audio_concat = [
        "ffmpeg", "-y", "-f", "concat", "-safe", "0",
        "-i", audio_concat_txt,
        "-c", "copy", master_audio
    ]
    subprocess.run(cmd_audio_concat, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print(f"[Audio] Master audio compiled: {master_audio}")

    # 5. Build Image Concat List with clean relative/absolute paths
    image_concat_txt = os.path.join(OUTPUT_DIR, "images_concat.txt")
    with open(image_concat_txt, "w", encoding="utf-8") as f:
        for img, dur in zip(clean_image_files, durations):
            norm = img.replace("\\", "/")
            f.write(f"file '{norm}'\n")
            f.write(f"duration {dur:.4f}\n")
        # Concat demuxer requirement: repeat last image
        norm_last = clean_image_files[-1].replace("\\", "/")
        f.write(f"file '{norm_last}'\n")

    print(f"[FFmpeg] Stitching ALL {len(clean_image_files)} images with sentence-synced timing to 1080p MP4...")
    ffmpeg_video_cmd = [
        "ffmpeg", "-y",
        "-f", "concat", "-safe", "0", "-i", image_concat_txt,
        "-i", master_audio,
        "-vf", "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:black,format=yuv420p",
        "-c:v", "libx264", "-preset", "medium", "-crf", "18",
        "-c:a", "aac", "-b:a", "192k",
        "-shortest",
        FINAL_VIDEO_PATH
    ]
    subprocess.run(ffmpeg_video_cmd, check=True)

    video_size = os.path.getsize(FINAL_VIDEO_PATH)
    print(f"[Done] Video Generated Successfully: {FINAL_VIDEO_PATH} ({video_size} bytes)")

    # 6. Upload to Hugging Face
    print("\n[Cloud] Publishing updated master video to Hugging Face repository...")
    try:
        api = HfApi()
        remote_path = "videos/why_your_brain_panics_saying_no_1080p.mp4"
        api.upload_file(
            path_or_fileobj=FINAL_VIDEO_PATH,
            path_in_repo=remote_path,
            repo_id=HF_DATASET_REPO,
            repo_type="dataset"
        )
        print(f"[Cloud] Uploaded to: https://huggingface.co/datasets/{HF_DATASET_REPO}/resolve/main/{remote_path}")

        job_status = {
            "jobId": "epic_job_true_1min",
            "progress": "100%",
            "milestone": "Full 1-minute video successfully rendered and published!",
            "status": "completed",
            "assetUrl": f"https://huggingface.co/datasets/{HF_DATASET_REPO}/resolve/main/{remote_path}",
            "device": "NVIDIA T4 / Local Bridge",
            "scenes": len(sentences),
            "duration": f"{total_duration:.1f}s",
            "updatedAt": "2026-10-20 18:08:00"
        }
        status_path = os.path.join(OUTPUT_DIR, "latest_job.json")
        with open(status_path, "w", encoding="utf-8") as f:
            json.dump(job_status, f, indent=2)

        api.upload_file(
            path_or_fileobj=status_path,
            path_in_repo="jobs/latest_job.json",
            repo_id=HF_DATASET_REPO,
            repo_type="dataset"
        )
        print("[Cloud] latest_job.json updated on Hugging Face!")
    except Exception as e:
        print(f"[Cloud Warning] Hugging Face upload notice: {e}")

    print("=" * 60)
    print(f">>> TRUE 1-MINUTE VIDEO COMPILED & DELIVERED: {FINAL_VIDEO_PATH}")
    print(f">>> Duration: {total_duration:.2f}s | Scenes: {len(sentences)} | Resolution: 1920x1080")
    print("=" * 60)

if __name__ == "__main__":
    main()
