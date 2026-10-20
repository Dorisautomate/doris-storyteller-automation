import os
import sys
import json
import shutil
import subprocess
from huggingface_hub import HfApi

BUILD_DIR = r"C:\Users\doris\Downloads\be_so_calm_it_makes_people_nervous_build"
IMAGES_DIR = r"C:\Users\doris\Downloads\be_so_calm_it_makes_people_nervous_images"
FINAL_VIDEO = r"C:\Users\doris\Downloads\be_so_calm_it_makes_people_nervous_1080p.mp4"
HF_DATASET_REPO = "Dorisautomate/automation-assets"

def main():
    print("=" * 60)
    print(">>> COMPILING FINAL 15-MINUTE 1080p PSYCHOLOGY VIDEO")
    print("=" * 60)

    # Load durations
    durations_path = os.path.join(BUILD_DIR, "durations.json")
    with open(durations_path, "r", encoding="utf-8") as f:
        durations = json.load(f)

    scene_count = len(durations)
    print(f"[Assembly] Loaded timings for {scene_count} scenes.")

    # Match images
    clean_images = []
    for sn in range(1, scene_count + 1):
        found = None
        for fn in os.listdir(IMAGES_DIR):
            if fn.startswith(f"{sn}."):
                found = os.path.join(IMAGES_DIR, fn)
                break
        if not found:
            # Fallback to image 1 if a scene is still saving
            found = clean_images[-1] if clean_images else os.path.join(IMAGES_DIR, os.listdir(IMAGES_DIR)[0])
        
        clean_path = os.path.join(BUILD_DIR, f"clean_{sn}.jpg")
        shutil.copyfile(found, clean_path)
        clean_images.append(clean_path)

    print(f"[Assembly] Verified and staged {len(clean_images)} scene images.")

    # Build image concat list
    concat_txt = os.path.join(BUILD_DIR, "images_concat.txt")
    with open(concat_txt, "w", encoding="utf-8") as f:
        for sn in range(1, scene_count + 1):
            img_path = clean_images[sn - 1].replace("\\", "/")
            dur = durations[str(sn)]
            f.write(f"file '{img_path}'\n")
            f.write(f"duration {dur:.4f}\n")
        # Repeat last image
        f.write(f"file '{clean_images[-1].replace(chr(92), '/')}'\n")

    master_audio = os.path.join(BUILD_DIR, "master_narration.wav")
    print("[FFmpeg] Rendering full 15-minute 1080p video...")

    ffmpeg_cmd = [
        "ffmpeg", "-y",
        "-f", "concat", "-safe", "0", "-i", concat_txt,
        "-i", master_audio,
        "-vf", "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:black,format=yuv420p",
        "-c:v", "libx264", "-preset", "fast", "-crf", "18",
        "-c:a", "aac", "-b:a", "192k",
        "-shortest",
        FINAL_VIDEO
    ]
    subprocess.run(ffmpeg_cmd, check=True)

    size = os.path.getsize(FINAL_VIDEO)
    print(f"[Done] Video Generated: {FINAL_VIDEO} ({size} bytes)")

    # Upload to Hugging Face
    print("[Cloud] Uploading to Hugging Face Datasets...")
    try:
        api = HfApi()
        remote_path = "videos/be_so_calm_it_makes_people_nervous_1080p.mp4"
        api.upload_file(
            path_or_fileobj=FINAL_VIDEO,
            path_in_repo=remote_path,
            repo_id=HF_DATASET_REPO,
            repo_type="dataset"
        )
        print(f"[Cloud] Published at: https://huggingface.co/datasets/{HF_DATASET_REPO}/resolve/main/{remote_path}")
    except Exception as e:
        print(f"[Cloud Notice] {e}")

    print("=" * 60)
    print(">>> 15-MINUTE VIDEO PRODUCTION COMPLETE!")
    print("=" * 60)

if __name__ == "__main__":
    main()
