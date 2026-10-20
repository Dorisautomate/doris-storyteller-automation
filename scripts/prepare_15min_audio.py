import os
import sys
import json
import asyncio
import subprocess
import soundfile as sf
import edge_tts

TXT_PATH = r"C:\Users\doris\Downloads\be_so_calm_it_makes_people_nervous_15min.txt"
BUILD_DIR = r"C:\Users\doris\Downloads\be_so_calm_it_makes_people_nervous_build"
VOICE = "en-US-JennyNeural" # Hope - Professional, Clear & Natural

os.makedirs(BUILD_DIR, exist_ok=True)

async def synthesize_one(text, out_mp3):
    comm = edge_tts.Communicate(text, VOICE, rate="-4%", pitch="+0Hz")
    await comm.save(out_mp3)

def main():
    print("=" * 60)
    print(">>> 15-MINUTE PSYCHOLOGY NARRATION SYNTHESIZER")
    print("=" * 60)

    with open(TXT_PATH, "r", encoding="utf-8") as f:
        sentences = [line.strip() for line in f if line.strip()]

    print(f"[Script] Total sentences to synthesize: {len(sentences)}")

    durations = {}
    total_sec = 0.0

    for idx, sentence in enumerate(sentences):
        sn = idx + 1
        mp3_path = os.path.join(BUILD_DIR, f"scene_{sn}.mp3")
        wav_path = os.path.join(BUILD_DIR, f"scene_{sn}.wav")

        if not os.path.exists(wav_path) or os.path.getsize(wav_path) < 1000:
            asyncio.run(synthesize_one(sentence, mp3_path))
            cmd = ["ffmpeg", "-y", "-i", mp3_path, "-ar", "24000", "-ac", "1", wav_path]
            subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

        info = sf.info(wav_path)
        dur = info.duration
        durations[sn] = dur
        total_sec += dur

        if sn % 15 == 0 or sn == len(sentences):
            print(f"  [Progress] Synthesized {sn}/{len(sentences)} scenes | Elapsed audio: {total_sec:.1f}s ({total_sec/60:.2f} mins)")

    # Save timing manifest
    manifest_path = os.path.join(BUILD_DIR, "durations.json")
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(durations, f, indent=2)

    # Master audio concat
    concat_txt = os.path.join(BUILD_DIR, "audio_concat.txt")
    with open(concat_txt, "w", encoding="utf-8") as f:
        for sn in range(1, len(sentences) + 1):
            wav_path = os.path.join(BUILD_DIR, f"scene_{sn}.wav").replace("\\", "/")
            f.write(f"file '{wav_path}'\n")

    master_audio = os.path.join(BUILD_DIR, "master_narration.wav")
    cmd_audio = ["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", concat_txt, "-c", "copy", master_audio]
    subprocess.run(cmd_audio, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    print("=" * 60)
    print(f">>> 15-MINUTE NARRATION COMPLETE!")
    print(f">>> Total Duration: {total_sec:.2f}s ({total_sec/60:.2f} minutes)")
    print(f">>> Master Audio: {master_audio} ({os.path.getsize(master_audio)} bytes)")
    print("=" * 60)

if __name__ == "__main__":
    main()
