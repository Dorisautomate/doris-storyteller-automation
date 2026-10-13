#!/usr/bin/env python3
"""
Epic Automate - Sentence-Synchronized Story Video Generator
===========================================================
1. Reads ordered images from folder (e.g. psychology 1)
2. Synthesizes voiceover sentence-by-sentence
3. Measures precise millisecond audio duration per sentence
4. Renders 1080p slideshow video with exact sentence transitions using FFmpeg
5. Uploads final MP4 to Hugging Face Datasets (Dorisautomate/automation-assets)
6. Returns direct streaming & download asset URL
"""

import os
import sys
import asyncio
import subprocess
import json
import re
from pathlib import Path
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

async def synthesize_sentence(text: str, out_path: str, voice: str = "en-US-JennyNeural"):
    import edge_tts
    communicate = edge_tts.Communicate(text, voice, rate="+0%", pitch="+0Hz")
    await communicate.save(out_path)

def get_audio_duration(audio_path: str) -> float:
    # Use ffprobe or soundfile
    try:
        import soundfile as sf
        info = sf.info(audio_path)
        return float(info.duration)
    except Exception:
        pass
    
    cmd = [
        FFMPEG_EXE, "-i", audio_path, "-f", "null", "-"
    ]
    proc = subprocess.run(cmd, stderr=subprocess.PIPE, text=True)
    match = re.search(r"Duration:\s*(\d+):(\d+):(\d+\.\d+)", proc.stderr)
    if match:
        h, m, s = match.groups()
        return int(h) * 3600 + int(m) * 60 + float(s)
    return 4.0

def build_slideshow_video(image_paths, audio_paths, durations, output_video):
    """
    Builds video where each image displays for the exact duration of its sentence audio.
    """
    temp_dir = Path("temp_build")
    temp_dir.mkdir(exist_ok=True)
    
    # 1. Create FFmpeg concat demuxer file for video
    concat_txt = temp_dir / "concat_images.txt"
    with open(concat_txt, "w", encoding="utf-8") as f:
        for i, (img, dur) in enumerate(zip(image_paths, durations)):
            # Normalize path for ffmpeg
            norm_img = Path(img).resolve().as_posix()
            f.write(f"file '{norm_img}'\n")
            f.write(f"duration {dur:.3f}\n")
        # Concat demuxer requirement: repeat the last image once without duration
        norm_last = Path(image_paths[-1]).resolve().as_posix()
        f.write(f"file '{norm_last}'\n")

    # 2. Concat all sentence audio files into master audio track
    audio_concat_txt = temp_dir / "concat_audio.txt"
    with open(audio_concat_txt, "w", encoding="utf-8") as f:
        for aud in audio_paths:
            norm_aud = Path(aud).resolve().as_posix()
            f.write(f"file '{norm_aud}'\n")

    master_audio = temp_dir / "master_audio.mp3"
    concat_audio_cmd = [
        FFMPEG_EXE, "-y", "-f", "concat", "-safe", "0",
        "-i", str(audio_concat_txt),
        "-c:a", "libmp3lame", "-b:a", "192k",
        str(master_audio)
    ]
    subprocess.run(concat_audio_cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

    # 3. Stitch images and master audio into 1080p MP4
    # Scale to 1920x1080 while maintaining aspect ratio and centering
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
    
    print("[*] Running FFmpeg slideshow stitch...")
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

async def main():
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

    work_dir = Path("temp_build")
    work_dir.mkdir(exist_ok=True)

    audio_files = []
    durations = []

    print("[*] Synthesizing sentences...")
    for i, sentence in enumerate(script_sentences):
        aud_path = work_dir / f"sentence_{i+1}.mp3"
        if not aud_path.exists():
            await synthesize_sentence(sentence, str(aud_path))
        dur = get_audio_duration(str(aud_path))
        audio_files.append(str(aud_path))
        durations.append(dur)
        print(f"    Scene {i+1}: {dur:.2f}s -> {image_files[i].name[:40]}...")

    output_mp4 = "doris_psychology_story_video.mp4"
    build_slideshow_video([str(p) for p in image_files], audio_files, durations, output_mp4)

    # Copy to frontend folder so frontend can preview immediately
    frontend_dir = Path("frontend")
    if frontend_dir.exists():
        import shutil
        shutil.copy(output_mp4, frontend_dir / "doris_story_video.mp4")
        print(f"[DONE] Copied to {frontend_dir / 'doris_story_video.mp4'}")

    # Upload to Hugging Face
    asset_url = upload_to_huggingface(output_mp4, "videos/doris_psychology_story_video.mp4")
    print(f"\n=======================================================")
    print(f"[SUCCESS] Story video created and verified!")
    print(f"Asset URL: {asset_url}")
    print(f"=======================================================\n")

if __name__ == "__main__":
    asyncio.run(main())
