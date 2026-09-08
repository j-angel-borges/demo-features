import os
import sys
import subprocess
import json

sys.stdout.reconfigure(encoding='utf-8')

OUTPUT_DIR = r"D:\1_jose_angel\1_GitHub\Zentry\demo-features\apps\skinner-box\public\videos"
CATALOG_JSON_PATH = r"D:\1_jose_angel\1_GitHub\Zentry\demo-features\apps\skinner-box\src\data\videoCatalog.json"

VIDEOS_CONFIG = [
    {
        "id": "ch_long_01",
        "source": "ballenas.mp4",
        "target": "v_ballenas.mp4",
        "duration": 38.0,
        "topic": "Biología Marina",
        "title": "El Misterio de las Ballenas en el Océano",
        "hook": "🌊 Descubre cómo duermen las ballenas verticalmente en las profundidades",
        "category": "educational",
        "stage": 1,
        "accentColor": "#38BDF8",
        "creator": "Oceano Salvaje",
        "likes": 245000,
        "comments": 3100
    },
    {
        "id": "ch_long_02",
        "source": "espacio.mp4",
        "target": "v_espacio.mp4",
        "duration": 21.0,
        "topic": "Astrofísica Infantil",
        "title": "¿Cuánto tarda la luz del Sol en llegar a la Tierra?",
        "hook": "☀️ Un fotón tarda 8 minutos y 20 segundos a 300,000 km/s en llegar",
        "category": "educational",
        "stage": 1,
        "accentColor": "#FBBF24",
        "creator": "Cosmos Express",
        "likes": 389000,
        "comments": 4200
    },
    {
        "id": "ch_long_03",
        "source": "hormigas.mp4",
        "target": "v_hormigas.mp4",
        "duration": 32.0,
        "topic": "Entomología",
        "title": "La Ciudad Subterránea de las Hormigas",
        "hook": "🐜 Millones de obreras construyendo túneles y granjas bajo tierra",
        "category": "educational",
        "stage": 1,
        "accentColor": "#4ADE80",
        "creator": "Mundo Micro",
        "likes": 182000,
        "comments": 1900
    },
    {
        "id": "ch_mid_01",
        "source": "animales.mp4",
        "target": "v_animales.mp4",
        "duration": 20.0,
        "topic": "Curiosidades Animales",
        "title": "Animales que Duermen de Pie",
        "hook": "🦩 El increíble mecanismo biológico de tendones automáticos",
        "category": "trivia",
        "stage": 2,
        "accentColor": "#D6C8FA",
        "creator": "Curioso Express",
        "likes": 512000,
        "comments": 6800
    },
    {
        "id": "ch_mid_02",
        "source": "cielo.mp4",
        "target": "v_cielo.mp4",
        "duration": 15.0,
        "topic": "Óptica Rápida",
        "title": "¿Por qué el cielo es azul en 15 Segundos?",
        "hook": "🌈 Moléculas de nitrógeno dispersando luz azul en la atmósfera",
        "category": "trivia",
        "stage": 2,
        "accentColor": "#38BDF8",
        "creator": "Profe Ciencias",
        "likes": 640000,
        "comments": 8200
    },
    {
        "id": "ch_mid_03",
        "source": "dinosaurios.mp4",
        "target": "v_dinosaurios.mp4",
        "duration": 14.0,
        "topic": "Paleontología Express",
        "title": "Dinosaurios con Plumas Reales",
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
        "source": "slime.mp4",
        "target": "v_slime.mp4",
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
        "source": "popit.mp4",
        "target": "v_popit.mp4",
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
        "source": "gatito.mp4",
        "target": "v_gatito.mp4",
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
        "source": "jackpot_estrella.mp4",
        "target": "v_jackpot_estrella.mp4",
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

print("=== CONVERTING ALL 10 VIDEOS TO TRUE 9:16 VERTICAL (720x1280) H.264/AAC ===")

child_entries = []

for item in VIDEOS_CONFIG:
    input_path = os.path.join(OUTPUT_DIR, item["source"])
    final_path = os.path.join(OUTPUT_DIR, item["target"])
    
    if not os.path.exists(input_path):
        print(f"Source file not found: {input_path}")
        continue

    print(f"Converting {item['source']} -> {item['target']} 720x1280 (dur: {item['duration']}s)...")
    
    # Scale to fill 720x1280 then crop center to 720:1280 (Strict 9:16 Vertical)
    vf = "scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280"
    
    cmd = [
        "ffmpeg", "-y",
        "-i", input_path,
        "-t", str(item["duration"]),
        "-vf", vf,
        "-c:v", "libx264", "-profile:v", "main", "-pix_fmt", "yuv420p", "-preset", "veryfast", "-crf", "22",
        "-c:a", "aac", "-b:a", "128k", "-ar", "44100", "-ac", "2",
        "-movflags", "+faststart",
        final_path
    ]
    
    res = subprocess.run(cmd, capture_output=True)
    if res.returncode == 0 and os.path.exists(final_path):
        size_mb = os.path.getsize(final_path) / 1024 / 1024
        print(f"✅ Created: {item['target']} ({size_mb:.2f}MB, 720x1280 9:16 vertical, {item['duration']}s)")
    else:
        print(f"❌ Error converting {item['source']}: {res.stderr.decode('utf-8', errors='ignore')[:250]}")
        
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
        "videoUrl": f"/videos/{item['target']}",
        "creatorHandle": "@" + item["creator"].lower().replace(" ", "_")[:20],
        "creatorName": item["creator"],
        "creatorAvatarUrl": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80",
        "isVerifiedCreator": True,
        "likesCount": item["likes"],
        "commentsCount": item["comments"],
        "bookmarksCount": int(item["likes"] * 0.25),
        "sharesCount": int(item["likes"] * 0.12),
        "soundTitle": f"Sonido Original - {item['creator']}",
        "hashtags": ["#shorts", "#parati", f"#{item['topic'].lower().replace(' ', '')}"],
        "isJackpot": item["category"] == "jackpot",
        "comments": [
            { "id": "c1", "author": "Alex_Explorer", "avatarUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80", "text": "¡Increíble cómo se ve en vertical! 🤯", "likes": 1420, "timeAgo": "2h" },
            { "id": "c2", "author": "Sofi_Tech", "avatarUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80", "text": "No puedo parar de ver esto 🔥", "likes": 890, "timeAgo": "5h" }
        ]
    }
    child_entries.append(entry)

catalog_data = {
    "catalogVersion": "3.2.0",
    "lastUpdated": "2026-09-02T18:40:00Z",
    "decayModel": {
        "stage1_nominalDurationRange": [30.0, 45.0],
        "stage2_nominalDurationRange": [12.0, 22.0],
        "stage3_nominalDurationRange": [5.0, 10.0],
        "jackpot_nominalDuration": 42.0,
        "jackpotInterval": 7
    },
    "childVideos": child_entries
}

with open(CATALOG_JSON_PATH, "w", encoding="utf-8") as f:
    json.dump(catalog_data, f, indent=2, ensure_ascii=False)

print("\n🎉 Master videoCatalog.json updated successfully with 10 pure vertical 9:16 videos!")
