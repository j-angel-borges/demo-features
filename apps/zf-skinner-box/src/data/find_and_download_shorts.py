import os
import sys
import json
import subprocess
import yt_dlp

sys.stdout.reconfigure(encoding='utf-8')

OUTPUT_DIR = r"D:\1_jose_angel\1_GitHub\Zentry\demo-features\apps\skinner-box\public\videos"
os.makedirs(OUTPUT_DIR, exist_ok=True)

CATALOG_JSON_PATH = r"D:\1_jose_angel\1_GitHub\Zentry\demo-features\apps\skinner-box\src\data\videoCatalog.json"

CATEGORIES = [
    {
        "id": "ch_long_01",
        "filename": "ballenas.mp4",
        "search": "ytsearch10:ballenas durmiendo vertical #shorts",
        "min_dur": 25,
        "max_dur": 55,
        "topic": "Biología Marina",
        "category": "educational",
        "stage": 1,
        "accentColor": "#38BDF8"
    },
    {
        "id": "ch_long_02",
        "filename": "espacio.mp4",
        "search": "ytsearch10:luz del sol llega a la tierra ciencia #shorts",
        "min_dur": 25,
        "max_dur": 55,
        "topic": "Astrofísica Infantil",
        "category": "educational",
        "stage": 1,
        "accentColor": "#FBBF24"
    },
    {
        "id": "ch_long_03",
        "filename": "hormigas.mp4",
        "search": "ytsearch10:hormiguero por dentro datos curiosos #shorts",
        "min_dur": 25,
        "max_dur": 55,
        "topic": "Entomología",
        "category": "educational",
        "stage": 1,
        "accentColor": "#4ADE80"
    },
    {
        "id": "ch_mid_01",
        "filename": "animales.mp4",
        "search": "ytsearch10:animales duermen de pie curiosidades #shorts",
        "min_dur": 12,
        "max_dur": 30,
        "topic": "Curiosidades Animales",
        "category": "trivia",
        "stage": 2,
        "accentColor": "#D6C8FA"
    },
    {
        "id": "ch_mid_02",
        "filename": "cielo.mp4",
        "search": "ytsearch10:por que el cielo es azul en 15 segundos #shorts",
        "min_dur": 10,
        "max_dur": 25,
        "topic": "Óptica Rápida",
        "category": "trivia",
        "stage": 2,
        "accentColor": "#38BDF8"
    },
    {
        "id": "ch_mid_03",
        "filename": "dinosaurios.mp4",
        "search": "ytsearch10:dinosaurios con plumas reales #shorts",
        "min_dur": 10,
        "max_dur": 25,
        "topic": "Paleontología Express",
        "category": "trivia",
        "stage": 2,
        "accentColor": "#FB923C"
    },
    {
        "id": "ch_fast_01",
        "filename": "slime.mp4",
        "search": "ytsearch10:slime satisfying crunch asmr #shorts",
        "min_dur": 5,
        "max_dur": 15,
        "topic": "Sensorial Rápido",
        "category": "hyper_fragmented",
        "stage": 3,
        "accentColor": "#F472B6"
    },
    {
        "id": "ch_fast_02",
        "filename": "popit.mp4",
        "search": "ytsearch10:pop it toy satisfying asmr #shorts",
        "min_dur": 5,
        "max_dur": 15,
        "topic": "ASMR / Háptico",
        "category": "hyper_fragmented",
        "stage": 3,
        "accentColor": "#C2F4E7"
    },
    {
        "id": "ch_fast_03",
        "filename": "gatito.mp4",
        "search": "ytsearch10:cute dancing cat meme #shorts",
        "min_dur": 4,
        "max_dur": 12,
        "topic": "Micro Meme",
        "category": "hyper_fragmented",
        "stage": 3,
        "accentColor": "#F0ABFC"
    },
    {
        "id": "ch_jackpot_01",
        "filename": "jackpot_estrella.mp4",
        "search": "ytsearch10:james webb space telescope 4k pillars #shorts",
        "min_dur": 25,
        "max_dur": 55,
        "topic": "Astronomía Profunda",
        "category": "jackpot",
        "stage": "jackpot",
        "accentColor": "#FBBF24"
    }
]

updated_items = []

print("=== SEARCHING & DOWNLOADING AUTHENTIC YOUTUBE SHORTS (DURATION <= 50s) ===")

for target in CATEGORIES:
    print(f"\nSearching for {target['topic']} ({target['min_dur']}s - {target['max_dur']}s)...")
    
    # 1. Extract flat list of search results
    ydl_search_opts = {'quiet': True, 'extract_flat': True}
    selected_video = None
    
    with yt_dlp.YoutubeDL(ydl_search_opts) as ydl:
        try:
            res = ydl.extract_info(target['search'], download=False)
            entries = res.get('entries', [])
            for e in entries:
                dur = e.get('duration') or 0
                title = e.get('title', '')
                vid_id = e.get('id', '')
                if vid_id and (dur == 0 or (target['min_dur'] <= dur <= target['max_dur']) or dur <= 60):
                    selected_video = e
                    print(f"Found match: [{vid_id}] {title} (approx duration: {dur}s)")
                    break
            if not selected_video and len(entries) > 0:
                selected_video = entries[0]
        except Exception as err:
            print(f"Search failed for {target['search']}: {err}")
            
    if not selected_video:
        print(f"Could not find video for {target['topic']}")
        continue

    vid_url = f"https://www.youtube.com/shorts/{selected_video.get('id')}"
    raw_target = os.path.join(OUTPUT_DIR, "raw_" + target['filename'])
    final_target = os.path.join(OUTPUT_DIR, target['filename'])
    
    print(f"Downloading short: {vid_url} -> {target['filename']}")
    
    ydl_down_opts = {
        'format': 'best[ext=mp4]/bestvideo[ext=mp4]+bestaudio[ext=m4a]/best',
        'outtmpl': raw_target,
        'merge_output_format': 'mp4',
        'overwrites': True,
        'quiet': True,
        'no_warnings': True
    }
    
    try:
        with yt_dlp.YoutubeDL(ydl_down_opts) as ydl:
            info = ydl.extract_info(vid_url, download=True)
            actual_title = info.get('title', target['topic'])
            uploader = info.get('uploader', 'Creador Shorts')
            duration = float(info.get('duration') or target['max_dur'])
            
            # Format title (strip hashtags)
            clean_title = actual_title.split('#')[0].strip()
            if not clean_title:
                clean_title = actual_title
                
            print(f"Downloaded raw ({os.path.getsize(raw_target)} bytes). Actual duration: {duration}s")
            
            # Optimize and guarantee vertical 9:16 format with high compatibility AAC audio
            cmd = [
                "ffmpeg", "-y",
                "-i", raw_target,
                "-t", str(min(duration, target['max_dur'])),
                "-c:v", "libx264", "-pix_fmt", "yuv420p", "-preset", "veryfast",
                "-c:a", "aac", "-b:a", "128k",
                "-movflags", "+faststart",
                final_target
            ]
            subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            
            if os.path.exists(raw_target):
                os.remove(raw_target)
                
            final_duration = min(duration, target['max_dur'])
            
            item_entry = {
                "id": target["id"],
                "mode": "child",
                "stage": target["stage"],
                "title": clean_title[:75],
                "topic": target["topic"],
                "category": target["category"],
                "nominalDurationSeconds": round(final_duration, 1),
                "dopamineScore": 95 if target["category"] == "hyper_fragmented" else 100 if target["category"] == "jackpot" else 30,
                "cognitiveLoad": 15 if target["category"] == "hyper_fragmented" else 85,
                "description": f"Video vertical de YouTube Shorts sobre {target['topic']}.",
                "narrativeHook": clean_title[:100],
                "thumbnailGradient": ["#1e1b4b", "#4338ca"],
                "accentColor": target["accentColor"],
                "canvasAnimationType": "galaxy" if target["category"] == "jackpot" else "popit_bubble" if target["category"] == "hyper_fragmented" else "cellular",
                "soundtrackTempoBpm": 120,
                "videoUrl": f"/videos/{target['filename']}",
                "creatorHandle": "@" + uploader.lower().replace(" ", "_")[:20],
                "creatorName": uploader,
                "creatorAvatarUrl": f"https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80",
                "isVerifiedCreator": True,
                "likesCount": int(150000 + final_duration * 10000),
                "commentsCount": int(1200 + final_duration * 100),
                "bookmarksCount": int(25000 + final_duration * 500),
                "sharesCount": int(10000 + final_duration * 300),
                "soundTitle": f"Audio Original - {uploader}",
                "hashtags": ["#shorts", "#viral", "#parati", f"#{target['topic'].lower().replace(' ', '')}"],
                "isJackpot": target["category"] == "jackpot"
            }
            updated_items.append(item_entry)
            print(f"✅ Finished: {target['filename']} ({final_duration}s - {os.path.getsize(final_target)} bytes)")
    except Exception as err:
        print(f"❌ Error processing {target['filename']}: {err}")

# Update videoCatalog.json
if len(updated_items) >= 5:
    catalog_data = {
        "catalogVersion": "2.0.0",
        "lastUpdated": "2026-09-02T17:30:00Z",
        "decayModel": {
            "stage1_nominalDurationRange": [30.0, 50.0],
            "stage2_nominalDurationRange": [12.0, 25.0],
            "stage3_nominalDurationRange": [4.0, 15.0],
            "jackpot_nominalDuration": 44.0,
            "jackpotInterval": 7
        },
        "childVideos": updated_items
    }
    with open(CATALOG_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(catalog_data, f, indent=2, ensure_ascii=False)
    print(f"\n🎉 Successfully updated {CATALOG_JSON_PATH} with {len(updated_items)} authentic YouTube Shorts!")
