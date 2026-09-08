# -*- coding: utf-8 -*-
import os
import sys
import json
import subprocess
import yt_dlp

sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR = r"D:\1_jose_angel\1_GitHub\Zentry\demo-features\apps\skinner-box"
PUBLIC_VIDEOS_DIR = os.path.join(BASE_DIR, "public", "videos")
TEMP_DIR = os.path.join(BASE_DIR, "public", "videos", "temp_raw")

os.makedirs(PUBLIC_VIDEOS_DIR, exist_ok=True)
os.makedirs(TEMP_DIR, exist_ok=True)

VIDEO_TARGETS = [
    {
        "id": "skinner_45s",
        "target_name": "video_45s_cosmos.mp4",
        "target_duration": 45.0,
        "search_query": "james webb space telescope deep universe hd shorts",
        "topic": "Cosmos y Astrofisica Profunda (45s)",
        "category": "educational",
        "stage": 1,
        "accentColor": "#38BDF8",
        "is_loop": False
    },
    {
        "id": "skinner_30s",
        "target_name": "video_30s_naturaleza.mp4",
        "target_duration": 30.0,
        "search_query": "ocean marine life blue whale diving underwater shorts",
        "topic": "Biologia Marina y Oceano (30s)",
        "category": "educational",
        "stage": 1,
        "accentColor": "#2DD4BF",
        "is_loop": False
    },
    {
        "id": "skinner_15s",
        "target_name": "video_15s_ciencia.mp4",
        "target_duration": 15.0,
        "search_query": "satisfying optical illusion science experiment shorts",
        "topic": "Optica y Curiosidad Expres (15s)",
        "category": "trivia",
        "stage": 2,
        "accentColor": "#FBBF24",
        "is_loop": False
    },
    {
        "id": "skinner_10s",
        "target_name": "video_10s_asmr.mp4",
        "target_duration": 10.0,
        "search_query": "kinetic sand cutting asmr crunching satisfying shorts",
        "topic": "ASMR Haptico y Cinetico (10s)",
        "category": "fast_paced",
        "stage": 2,
        "accentColor": "#F472B6",
        "is_loop": False
    },
    {
        "id": "skinner_5s",
        "target_name": "video_5s_loop.mp4",
        "target_duration": 5.0,
        "search_query": "perfect seamless loop satisfying 3d animation render shorts",
        "topic": "Bucle Infinito Hipnotico (5s Loop)",
        "category": "hyper_fragmented",
        "stage": 3,
        "accentColor": "#A855F7",
        "is_loop": True
    }
]

ydl_search_opts = {
    'quiet': True,
    'no_warnings': True,
    'js_runtimes': {'node': {}}
}

downloaded_summary = []

for target in VIDEO_TARGETS:
    print("\n------------------------------------------------------------")
    print(f"[TASK] Buscando y procesando: {target['topic']}")
    print(f"[CRITERIO] Duracion objetivo: {target['target_duration']}s | Loop: {target['is_loop']}")
    
    # 1. Search candidate
    query = f"ytsearch6:{target['search_query']}"
    chosen_entry = None
    with yt_dlp.YoutubeDL(ydl_search_opts) as ydl:
        try:
            info = ydl.extract_info(query, download=False)
            entries = info.get('entries', [])
            for e in entries:
                d = e.get('duration') or 0
                if d >= target['target_duration']:
                    chosen_entry = e
                    break
            if not chosen_entry and entries:
                chosen_entry = entries[0]
        except Exception as e:
            print(f"Error buscando {query}: {e}")
            
    if not chosen_entry:
        print(f"[ERROR] No se encontro candidato para {target['topic']}")
        continue

    video_url = chosen_entry.get('webpage_url')
    raw_title = chosen_entry.get('title', 'Unknown')
    uploader = chosen_entry.get('uploader', 'Unknown Creator')
    print(f"[ENCONTRADO] Titulo: {raw_title}")
    print(f"[CANAL] {uploader} | Duracion original: {chosen_entry.get('duration')}s | URL: {video_url}")
    
    # 2. Download candidate
    raw_output_template = os.path.join(TEMP_DIR, f"raw_{target['id']}.%(ext)s")
    ydl_dl_opts = {
        'format': 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
        'outtmpl': raw_output_template,
        'merge_output_format': 'mp4',
        'overwrites': True,
        'quiet': False,
        'no_warnings': True,
        'js_runtimes': {'node': {}}
    }
    
    raw_file = os.path.join(TEMP_DIR, f"raw_{target['id']}.mp4")
    if os.path.exists(raw_file):
        try: os.remove(raw_file)
        except: pass
        
    try:
        with yt_dlp.YoutubeDL(ydl_dl_opts) as ydl:
            ydl.download([video_url])
    except Exception as e:
        print(f"[ERROR] al descargar {video_url}: {e}")
        continue
        
    if not os.path.exists(raw_file):
        for f in os.listdir(TEMP_DIR):
            if f.startswith(f"raw_{target['id']}"):
                raw_file = os.path.join(TEMP_DIR, f)
                break
                
    if not os.path.exists(raw_file):
        print(f"[ERROR] Archivo raw no encontrado: {raw_file}")
        continue

    # 3. FFmpeg: Strict 9:16 (720x1280), Faststart, optimized H.264 + AAC
    final_output = os.path.join(PUBLIC_VIDEOS_DIR, target['target_name'])
    poster_output = os.path.join(PUBLIC_VIDEOS_DIR, target['target_name'].replace('.mp4', '.webp'))
    
    target_dur = target['target_duration']
    
    # Video filter: scale to fit 720:1280 with smart crop
    vf = "scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280"
    
    # FFmpeg command
    cmd = [
        "ffmpeg", "-y",
        "-ss", "00:00:00.5",
        "-t", str(target_dur),
        "-i", raw_file,
        "-vf", vf,
        "-c:v", "libx264", "-profile:v", "main", "-pix_fmt", "yuv420p",
        "-crf", "22" if target['is_loop'] else "23", "-preset", "fast",
        "-c:a", "aac", "-b:a", "128k", "-ar", "44100", "-ac", "2",
        "-movflags", "+faststart",
        final_output
    ]
        
    print(f"[OPTIMIZANDO FFmpeg] Generando {target['target_name']} ({target_dur}s @ 720x1280, H264, FastStart)... ")
    res = subprocess.run(cmd, capture_output=True)
    if res.returncode != 0:
        print(f"[ERROR FFmpeg]: {res.stderr.decode('utf-8', errors='ignore')[:300]}")
        continue

    # Generate Poster WebP for instant PWA first-frame preview
    cmd_poster = [
        "ffmpeg", "-y",
        "-ss", "00:00:01.0" if target_dur > 2 else "00:00:00.2",
        "-i", final_output,
        "-vframes", "1",
        "-q:v", "75",
        poster_output
    ]
    subprocess.run(cmd_poster, capture_output=True)
    
    file_size_mb = os.path.getsize(final_output) / (1024 * 1024)
    poster_size_kb = os.path.getsize(poster_output) / 1024 if os.path.exists(poster_output) else 0
    
    print(f"[EXITO] Video guardado: {final_output}")
    print(f"  - Peso video: {file_size_mb:.2f} MB")
    print(f"  - Poster WebP: {poster_size_kb:.1f} KB")
    print(f"  - Duracion: {target_dur}s exactos")
    
    downloaded_summary.append({
        "id": target["id"],
        "filename": target["target_name"],
        "poster": os.path.basename(poster_output),
        "duration": target_dur,
        "topic": target["topic"],
        "title": raw_title,
        "creator": uploader,
        "original_url": video_url,
        "size_mb": round(file_size_mb, 2),
        "is_loop": target["is_loop"],
        "local_path": final_output
    })

# Cleanup temp dir
try:
    for f in os.listdir(TEMP_DIR):
        os.remove(os.path.join(TEMP_DIR, f))
    os.rmdir(TEMP_DIR)
except Exception:
    pass

summary_file = os.path.join(PUBLIC_VIDEOS_DIR, "downloaded_manifest.json")
with open(summary_file, 'w', encoding='utf-8') as f:
    json.dump(downloaded_summary, f, indent=2, ensure_ascii=False)

print("\n============================================================")
print(f"PROCESO COMPLETADO: {len(downloaded_summary)}/5 videos listos y optimizados para PWA.")
print(f"Carpeta de salida: {PUBLIC_VIDEOS_DIR}")
print(f"Manifiesto generado en: {summary_file}")
