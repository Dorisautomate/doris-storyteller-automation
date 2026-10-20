#!/usr/bin/env python3
"""
Epic Automate - True F5-TTS Doris Voice Cloned Video Generator
=============================================================
Synthesizes all story sentences using real F5-TTS model with Doris's voice,
stitches the 1080p sentence-synced video with FFmpeg, and uploads to Hugging Face.
"""

import os
import sys
import shutil
import subprocess
import json
import re
from pathlib import Path
from gradio_client import Client, handle_file
from huggingface_hub import HfApi

FFMPEG_EXE = r"C:\Users\doris\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-9.0.2-full_build\bin\ffmpeg.exe"
if not os.path.exists(FFMPEG_EXE):
    FFMPEG_EXE = "ffmpeg"

HF_TOKEN = os.environ.get("HF_TOKEN")
HF_REPO = "Dorisautomate/automation-assets"

def get_natural_sort_key(filename):
    match = re.match(r"^(\d+)", filename)
    num = int(match.group(1)) if match else 999999
    return (num, filename)

def get_audio_duration(audio_path: str) -> float:
    cmd = [
        FFMPEG_EXE, "-i", audio_path, "-f", "null", "-"
    ]
    proc = subprocess.run(cmd, stderr=subprocess.PIPE, text=True)
    match = re.search(r"Duration:\s*(\d+):(\d+):(\d+\.\d+)", proc.stderr)
    if match:
        h, m, s = match.groups()
        return int(h) * 3600 + int(m) * 60 + float(s)
    return 5.0

def build_slideshow_video(image_paths, audio_paths, durations, output_video):
    temp_dir = Path("temp_f5_build")
    temp_dir.mkdir(exist_ok=True)
    
    # 1. Create FFmpeg concat demuxer file for images
    concat_txt = temp_dir / "concat_images.txt"
    with open(concat_txt, "w", encoding="utf-8") as f:
        for img, dur in zip(image_paths, durations):
            norm_img = Path(img).resolve().as_posix()
            f.write(f"file '{norm_img}'\n")
            f.write(f"duration {dur:.3f}\n")
        norm_last = Path(image_paths[-1]).resolve().as_posix()
        f.write(f"file '{norm_last}'\n")

    # 2. Concat all sentence audio files into master audio track
    audio_concat_txt = temp_dir / "concat_audio.txt"
    with open(audio_concat_txt, "w", encoding="utf-8") as f:
        for aud in audio_paths:
            norm_aud = Path(aud).resolve().as_posix()
            f.write(f"file '{norm_aud}'\n")

    master_audio = temp_dir / "master_audio_f5.wav"
    concat_audio_cmd = [
        FFMPEG_EXE, "-y", "-f", "concat", "-safe", "0",
        "-i", str(audio_concat_txt),
        "-c:a", "pcm_s16le",
        str(master_audio)
    ]
    subprocess.run(concat_audio_cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

    # 3. Stitch images and master audio into 1080p MP4
    vf_filter = "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,format=yuv420p"
    stitch_cmd = [
        FFMPEG_EXE, "-y",
        "-f", "concat", "-safe", "0", "-i", str(concat_txt),
        "-i", str(master_audio),
        "-vf", vf_filter,
        "-c:v", "libx264", "-preset", "medium", "-crf", "22",
        "-c:a", "aac", "-b:a", "192k",
        "-r", "30",
        "-shortest",
        output_video
    ]
    
    print("[*] Running FFmpeg slideshow stitch with real Doris Voice...")
    result = subprocess.run(stitch_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if result.returncode != 0:
        print(f"[!] FFmpeg error: {result.stderr}")
        raise RuntimeError("FFmpeg stitching failed.")
        
    print(f"[DONE] Rendered video successfully: {output_video}")

def upload_to_huggingface(local_file: str, remote_name: str) -> str:
    print(f"[*] Uploading {local_file} to Hugging Face {HF_REPO}...")
    api = HfApi(token=HF_TOKEN)
    api.create_repo(repo_id=HF_REPO, repo_type="dataset", exist_ok=True, private=False)
    api.upload_file(
        path_or_fileobj=local_file,
        path_in_repo=remote_name,
        repo_id=HF_REPO,
        repo_type="dataset"
    )
    url = f"https://huggingface.co/datasets/{HF_REPO}/resolve/main/{remote_name}"
    print(f"[DONE] Uploaded! Direct URL: {url}")
    return url

def main():
    images_dir = Path(r"C:\Users\doris\Downloads\psychology 1")
    image_files = sorted(
        [p for p in images_dir.glob("*") if p.suffix.lower() in [".jpg", ".jpeg", ".png", ".webp"]],
        key=lambda p: get_natural_sort_key(p.name)
    )

    script_sentences = [
        "It is Thursday night, and you are sitting in your car in the driveway with the headlights turned off.",
        "You have been staring blankly at the steering wheel for twenty minutes because walking inside feels impossible.",
        "Most people would call this lazy or unmotivated, but neuroscience reveals a completely different story.",
        "Your brain is not broken; it is simply trapped in a survival loop that nobody taught you how to reset."
    ]

    print(f"[*] Found {len(image_files)} images and {len(script_sentences)} script sentences.")
    assert len(image_files) == len(script_sentences), "Count mismatch!"

    work_dir = Path("temp_f5_build")
    work_dir.mkdir(exist_ok=True)

    ref_audio_path = r"assets\voice_references\doris_voice_ref.wav"
    ref_text = open(r"assets\voice_references\doris_voice_ref.txt", "r", encoding="utf-8").read().strip()

    print("[*] Connecting to F5-TTS model on Hugging Face (mrfakename/E2-F5-TTS)...")
    client = Client("mrfakename/E2-F5-TTS", token=HF_TOKEN)

    audio_files = []
    durations = []

    for i, sentence in enumerate(script_sentences):
        dest_audio = work_dir / f"f5_sentence_{i+1}.wav"
        
        # Check if already synthesized
        if not dest_audio.exists():
            print(f"[*] [F5-TTS] Synthesizing Scene {i+1} with Doris Voice: '{sentence[:45]}...'")
            generated_temp = client.predict(
                ref_audio=handle_file(ref_audio_path),
                ref_text=ref_text,
                gen_text=sentence,
                remove_silence=True,
                api_name="/predict"
            )
            shutil.copy(generated_temp, dest_audio)
        else:
            print(f"[✓] Using cached F5-TTS audio for Scene {i+1}")

        dur = get_audio_duration(str(dest_audio))
        audio_files.append(str(dest_audio))
        durations.append(dur)
        print(f"    Scene {i+1} Duration: {dur:.2f}s -> {image_files[i].name[:40]}...")

    output_mp4 = "doris_f5_cloned_story_video.mp4"
    build_slideshow_video([str(p) for p in image_files], audio_files, durations, output_mp4)

    # Copy to frontend
    frontend_dir = Path("frontend")
    if frontend_dir.exists():
        shutil.copy(output_mp4, frontend_dir / "doris_story_video.mp4")
        print(f"[DONE] Copied to {frontend_dir / 'doris_story_video.mp4'}")

    # Upload to Hugging Face
    asset_url = upload_to_huggingface(output_mp4, "videos/doris_f5_cloned_story_video.mp4")
    print(f"\n=======================================================")
    print(f"[SUCCESS] True F5-TTS Doris Voice Cloned Video Ready!")
    print(f"Asset URL: {asset_url}")
    print(f"=======================================================\n")

if __name__ == "__main__":
    main()
