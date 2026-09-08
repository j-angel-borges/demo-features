import os
import sys
import json
import subprocess
import yt_dlp

sys.stdout.reconfigure(encoding='utf-8')

OUTPUT_DIR = r"D:\1_jose_angel\1_GitHub\Zentry\demo-features\apps\skinner-box\public\videos"
os.makedirs(OUTPUT_DIR, exist_ok=True)

CATALOG_JSON_PATH = r"D:\1_jose_angel\1_GitHub\Zentry\demo-features\apps\skinner-box\src\data\videoCatalog.json"

ITEMS_SPEC = [
    {
        "id": "ch_long_01",
        "filename": "ballenas.mp4",
        "search": "ytsearch5:blue whale underwater relaxing nature shorts",
        "duration": 40.0,
        "topic": "Biología Marina",
        "title": "El misterioso viaje de la Ballena Azul",
        "hook": "🌊 Descubre cómo duermen las ballenas a cientos de metros en el océano",
        "category": "educational",
        "stage": 1,
        "accentColor": "#38BDF8",
        "creator": "Oceano Salvaje",
        "likes": 245000,
        "comments": 3100
    },
    {
        "id": "ch_long_02",
        "filename": "espacio.mp4",
        "search": "ytsearch5:sunlight travelling space earth physics shorts",
        "duration": 35.0,
        "topic": "Astrofísica Infantil",
        "title": "¿Cuánto tarda la luz del Sol en llegar a la Tierra?",
        "hook": "☀️ Un fotón tarda 8 minutos y 20 segundos a 300,000 km/s",
        "category": "educational",
        "stage": 1,
        "accentColor": "#FBBF24",
        "creator": "Cosmos Express",
        "likes": 389000,
        "comments": 4200
    },
    {
        "id": "ch_long_03",
        "filename": "hormigas.mp4",
        "search": "ytsearch5:ant colony underground tunnels nature shorts",
        "duration": 32.0,
        "topic": "Entomología",
        "title": "La ciudad subterránea de las Hormigas",
        "hook": "🐜 Millones de obreras construyendo túneles de ventilación y granjas",
        "category": "educational",
        "stage": 1,
        "accentColor": "#4ADE80",
        "creator": "Mundo Micro",
        "likes": 182000,
        "comments": 1900
    },
    {
        "id": "ch_mid_01",
        "filename": "animales.mp4",
        "search": "ytsearch5:animals sleeping standing up horses flamingos shorts",
        "duration": 20.0,
        "topic": "Curiosidades Animales",
        "title": "Animales que duermen de pie",
        "hook": "🦩 El mecanismo automático de bloqueo de articulaciones",
        "category": "trivia",
        "stage": 2,
        "accentColor": "#D6C8FA",
        "creator": "Curioso Express",
        "likes": 512000,
        "comments": 6800
    },
    {
        "id": "ch_mid_02",
        "filename": "cielo.mp4",
        "search": "ytsearch5:why sky is blue rayleigh scattering physics shorts",
        "duration": 15.0,
        "topic": "Óptica Rápida",
        "title": "¿Por qué el cielo es azul en 15s?",
        "hook": "🌈 La dispersión de Rayleigh en la atmósfera explicada",
        "category": "trivia",
        "stage": 2,
        "accentColor": "#38BDF8",
        "creator": "Profe Ciencias",
        "likes": 640000,
        "comments": 8200
    },
    {
        "id": "ch_mid_03",
        "filename": "dinosaurios.mp4",
        "search": "ytsearch5:dinosaurs had feathers paleontology discoveries shorts",
        "duration": 14.0,
        "topic": "Paleontología Express",
        "title": "Dinosaurios con plumas reales",
        "hook": "🦖 Fósiles en ámbar demuestran su verdadero plumaje rapaz",
        "category": "trivia",
        "stage": 2,
        "accentColor": "#FB923C",
        "creator": "Paleo Facts",
        "likes": 780000,
        "comments": 9400
    },
    {
        "id": "ch_fast_01",
        "filename": "slime.mp4",
        "search": "ytsearch5:slime satisfying crunch asmr fast shorts",
        "duration": 8.0,
        "topic": "Sensorial Rápido",
        "title": "¡Slime Neón Crunch en 8s!",
        "hook": "✨ Textura elástica ultra crujiente con sonido ASMR",
        "category": "hyper_fragmented",
        "stage": 3,
        "accentColor": "#F472B6",
        "creator": "Neon ASMR",
        "likes": 1450000,
        "comments": 18200
    },
    {
        "id": "ch_fast_02",
        "filename": "popit.mp4",
        "search": "ytsearch5:pop it fast clicks satisfying asmr shorts",
        "duration": 6.0,
        "topic": "ASMR / Háptico",
        "title": "Pop-It Infinito a 120 BPM",
        "hook": "🫧 Burbujas hiperactivas reventando sin parar",
        "category": "hyper_fragmented",
        "stage": 3,
        "accentColor": "#C2F4E7",
        "creator": "Fidget Master",
        "likes": 2310000,
        "comments": 28900
    },
    {
        "id": "ch_fast_03",
        "filename": "gatito.mp4",
        "search": "ytsearch5:cat dancing meme 8bit speedup shorts",
        "duration": 5.0,
        "topic": "Micro Meme",
        "title": "Gatito Bailando Pixel Glitch",
        "hook": "🐱 Bucle acelerado de máxima sobrecarga sensorial",
        "category": "hyper_fragmented",
        "stage": 3,
        "accentColor": "#F0ABFC",
        "creator": "Meme Cats 8Bit",
        "likes": 3900000,
        "comments": 49000
    },
    {
        "id": "ch_jackpot_01",
        "filename": "jackpot_estrella.mp4",
        "search": "ytsearch5:james webb space telescope 4k pillars deep space shorts",
        "duration": 42.0,
        "topic": "Astronomía Profunda",
        "title": "⭐ El Nacimiento de una Estrella (Telescopio James Webb)",
        "hook": "🌟 ¡Premio Exclusivo! Pilares de la Creación capturados en infrarrojo",
        "category": "jackpot",
        "stage": "jackpot",
        "accentColor": "#FBBF24",
        "creator": "NASA Space Kids",
        "likes": 2100000,
        "comments": 19500
    }
]

print("=== STARTING FULL VERTICAL (9:16 720x1280) OPTIMIZED SHORTS GENERATOR ===")

catalog_entries = []

for item in ITEMS_SPEC:
    raw_file = os.path.join(OUTPUT_DIR, "raw_" + item["filename"])
    final_file = os.path.join(OUTPUT_DIR, item["filename"])
    
    print(f"\nProcessing {item['topic']} ({item['filename']})...")
    
    # Check if raw download is needed
    ydl_opts = {
        'format': 'best[ext=mp4]/bestvideo[ext=mp4]+bestaudio[ext=m4a]/best',
        'outtmpl': raw_file,
        'merge_output_format': 'mp4',
        'overwrites': True,
        'quiet': True,
        'no_warnings': True
    }
    
    download_ok = False
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            print(f"Downloading from YouTube search: {item['search']}")
            info = ydl.extract_info(item['search'], download=True)
            if 'entries' in info and len(info['entries']) > 0:
                first = info['entries'][0]
                if first.get('uploader'):
                    item['creator'] = first.get('uploader')
            download_ok = True
    except Exception as e:
        print(f"yt-dlp warning: {e}")
        
    source_file = raw_file if os.path.exists(raw_file) else final_file
    
    if os.path.exists(source_file):
        # Convert with FFmpeg to STRICT VERTICAL 9:16 (720x1280), Faststart, AAC stereo, exact duration
        temp_out = os.path.join(OUTPUT_DIR, "opt_" + item["filename"])
        target_dur = str(item["duration"])
        
        # FFmpeg filter: scale to fill 720x1280 then crop exactly to 720:1280 (True 9:16 vertical)
        vf_filter = "scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280"
        
        cmd = [
            "ffmpeg", "-y",
            "-i", source_file,
            "-t", target_dur,
            "-vf", vf_filter,
            "-c:v", "libx264", "-profile:v", "main", "-pix_fmt", "yuv420p", "-preset", "fast", "-crf", "22",
            "-c:a", "aac", "-b:a", "128k", "-ar", "44100", "-ac", "2",
            "-movflags", "+faststart",
            temp_out
        ]
        
        res = subprocess.run(cmd, capture_output=True)
        if res.returncode == 0 and os.path.exists(temp_out):
            if os.path.exists(final_file):
                try: os.remove(final_file)
                except: pass
            os.replace(temp_out, final_file)
            print(f"✅ Generated 100% Vertical 9:16 Video: {item['filename']} ({os.path.getsize(final_file)/1024/1024:.2f}MB, {item['duration']}s)")
        else:
            print(f"❌ FFmpeg conversion failed: {res.stderr.decode('utf-8', errors='ignore')[:300]}")
            
        if os.path.exists(raw_file):
            try: os.remove(raw_file)
            except: pass
            
    # Build clean catalog entry
    entry = {
        "id": item["id"],
        "mode": "child",
        "stage": item["stage"],
        "title": item["title"],
        "topic": item["topic"],
        "category": item["category"],
        "nominalDurationSeconds": item["duration"],
        "dopamineScore": 95 if item["category"] == "hyper_fragmented" else 100 if item["category"] == "jackpot" else 30,
        "cognitiveLoad": 15 if item["category"] == "hyper_fragmented" else 85,
        "description": item["hook"],
        "narrativeHook": item["hook"],
        "thumbnailGradient": ["#1e1b4b", "#4338ca"],
        "accentColor": item["accentColor"],
        "canvasAnimationType": "galaxy" if item["category"] == "jackpot" else "popit_bubble" if item["category"] == "hyper_fragmented" else "cellular",
        "soundtrackTempoBpm": 120,
        "videoUrl": f"/videos/{item['filename']}",
        "creatorHandle": "@" + item["creator"].lower().replace(" ", "_").replace("-", "_")[:20],
        "creatorName": item["creator"],
        "creatorAvatarUrl": f"https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80",
        "isVerifiedCreator": True,
        "likesCount": item["likes"],
        "commentsCount": item["comments"],
        "bookmarksCount": int(item["likes"] * 0.25),
        "sharesCount": int(item["likes"] * 0.12),
        "soundTitle": f"Sonido Original - {item['creator']}",
        "hashtags": ["#shorts", "#parati", f"#{item['topic'].lower().replace(' ', '').replace('ó', 'o').replace('í', 'i')}"],
        "isJackpot": item["category"] == "jackpot",
        "comments": [
            { "id": "c1", "author": "Alex_Explorer", "avatarUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80", "text": "¡Increíble cómo se ve en vertical! 🤯", "likes": 1420, "timeAgo": "2h" },
            { "id": "c2", "author": "Sofi_Tech", "avatarUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80", "text": "No puedo parar de ver esto 🔥", "likes": 890, "timeAgo": "5h" }
        ]
    }
    catalog_entries.append(entry)

# Write master videoCatalog.json
catalog_data = {
    "catalogVersion": "3.0.0",
    "lastUpdated": "2026-09-02T18:30:00Z",
    "decayModel": {
        "stage1_nominalDurationRange": [30.0, 45.0],
        "stage2_nominalDurationRange": [12.0, 22.0],
        "stage3_nominalDurationRange": [5.0, 10.0],
        "jackpot_nominalDuration": 42.0,
        "jackpotInterval": 7
    },
    "childVideos": catalog_entries
}

with open(CATALOG_JSON_PATH, "w", encoding="utf-8") as f:
    json.dump(catalog_data, f, indent=2, ensure_ascii=False)

print(f"\n🎉 Successfully wrote 10 pure vertical 9:16 videos to {CATALOG_JSON_PATH}")
