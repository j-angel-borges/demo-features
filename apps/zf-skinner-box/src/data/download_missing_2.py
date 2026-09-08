# -*- coding: utf-8 -*-
import os
import sys
import json
import subprocess
import yt_dlp

sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR = r"D:\1_jose_angel\1_GitHub\Zentry\demo-features\apps\skinner-box"
PUBLIC_VIDEOS_DIR = os.path.join(BASE_DIR, "public", "videos")
TEMP_DIR = os.path.join(PUBLIC_VIDEOS_DIR, "temp_raw2")

os.makedirs(PUBLIC_VIDEOS_DIR, exist_ok=True)
os.makedirs(TEMP_DIR, exist_ok=True)

REMAINING_TARGETS = [
    {
        "id": "skinner_30s",
        "target_name": "video_30s_naturaleza.mp4",
        "target_duration": 30.0,
        "queries": [
            "blue whale ocean 4k vertical shorts",
            "relaxing jellyfish aquarium 4k shorts",
            "marine life ocean diving vertical shorts"
        ],
        "topic": "Biologia Marina y Oceano (30s)",
        "accentColor": "#2DD4BF"
    },
    {
        "id": "skinner_15s",
        "target_name": "video_15s_ciencia.mp4",
        "target_duration": 15.0,
        "queries": [
            "why sky is blue rayleigh scattering science shorts",
            "liquid nitrogen experiment satisfying physics shorts",
            "dry ice bubbles science experiment shorts"
        ],
        "topic": "Ciencia y Curiosidad Expres (15s)",
        "accentColor": "#FBBF24"
    }
]

ydl_search_opts = {
    'quiet': True,
    'no_warnings': True,
    'js_runtimes': {'node': {}}
}

results = []

for target in REMAINING_TARGETS:
    print(f"\n[BUSCANDO] {target['topic']}...")
    chosen = None
    
    for q in target["queries"]:
        try:
            with yt_dlp.YoutubeDL(ydl_search_opts) as ydl:
                info = ydl.extract_info(f"ytsearch8:{q}", download=False)
                for entry in info.get("entries", []):
                    dur = entry.get("duration") or 0
                    # Short duration: between target and 90s, and not unavailable
                    if target["target_duration"] <= dur <= 90:
                        chosen = entry
                        break
        except Exception as e:
            continue
        if chosen:
            break
            
    if not chosen:
        print(f"[ERROR] No se hallo video idoneo para {target['topic']}")
        continue
        
    print(f"[SELECCIONADO] {chosen.get('title')} ({chosen.get('duration')}s) - {chosen.get('webpage_url')}")
    
    # Download
    raw_output = os.path.join(TEMP_DIR, f"raw_{target['id']}.%(ext)s")
    dl_opts = {
        'format': 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
        'outtmpl': raw_output,
        'merge_output_format': 'mp4',
        'overwrites': True,
        'quiet': False,
        'no_warnings': True,
        'js_runtimes': {'node': {}}
    }
    
    raw_mp4 = os.path.join(TEMP_DIR, f"raw_{target['id']}.mp4")
    if os.path.exists(raw_mp4):
        try: os.remove(raw_mp4)
        except: pass
        
    with yt_dlp.YoutubeDL(dl_opts) as ydl:
        ydl.download([chosen.get('webpage_url')])
        
    if not os.path.exists(raw_mp4):
        for f in os.listdir(TEMP_DIR):
            if f.startswith(f"raw_{target['id']}"):
                raw_mp4 = os.path.join(TEMP_DIR, f)
                break
                
    # Optimize with FFmpeg
    final_output = os.path.join(PUBLIC_VIDEOS_DIR, target["target_name"])
    poster_output = os.path.join(PUBLIC_VIDEOS_DIR, target["target_name"].replace(".mp4", ".webp"))
    vf = "scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280"
    
    cmd = [
        "ffmpeg", "-y",
        "-ss", "00:00:01.0",
        "-t", str(target["target_duration"]),
        "-i", raw_mp4,
        "-vf", vf,
        "-c:v", "libx264", "-profile:v", "main", "-pix_fmt", "yuv420p",
        "-crf", "23", "-preset", "fast",
        "-c:a", "aac", "-b:a", "128k", "-ar", "44100", "-ac", "2",
        "-movflags", "+faststart",
        final_output
    ]
    res = subprocess.run(cmd, capture_output=True)
    if res.returncode == 0 and os.path.exists(final_output):
        cmd_poster = [
            "ffmpeg", "-y",
            "-ss", "00:00:01.0",
            "-i", final_output,
            "-vframes", "1",
            "-q:v", "75",
            poster_output
        ]
        subprocess.run(cmd_poster, capture_output=True)
        sz_mb = os.path.getsize(final_output) / (1024*1024)
        print(f"[EXITO] {target['target_name']} generado ({sz_mb:.2f} MB, {target['target_duration']}s)")
        results.append({
            "id": target["id"],
            "filename": target["target_name"],
            "poster": os.path.basename(poster_output),
            "duration": target["target_duration"],
            "title": chosen.get("title"),
            "creator": chosen.get("uploader"),
            "size_mb": round(sz_mb, 2)
        })
    else:
        print(f"[ERROR FFmpeg]: {res.stderr.decode('utf-8', errors='ignore')[:300]}")

# Clean
try:
    for f in os.listdir(TEMP_DIR):
        os.remove(os.path.join(TEMP_DIR, f))
    os.rmdir(TEMP_DIR)
except:
    pass

print(f"\nTerminado: {len(results)} videos adicionales listos.")
