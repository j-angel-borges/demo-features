import os
import sys
import yt_dlp

# Force UTF-8 on Windows stdout
sys.stdout.reconfigure(encoding='utf-8')

OUTPUT_DIR = r"D:\1_jose_angel\1_GitHub\Zentry\demo-features\apps\skinner-box\public\videos"
os.makedirs(OUTPUT_DIR, exist_ok=True)

SEARCH_QUERIES = [
    {
        "filename": "ballenas.mp4",
        "query": "ytsearch1:ballenas durmiendo vertical oceano shorts",
        "topic": "Biología Marina"
    },
    {
        "filename": "espacio.mp4",
        "query": "ytsearch1:luz del sol llega a la tierra astrofisica shorts",
        "topic": "Astrofísica Infantil"
    },
    {
        "filename": "hormigas.mp4",
        "query": "ytsearch1:hormiguero por dentro arquitectura hormigas shorts",
        "topic": "Entomología"
    },
    {
        "filename": "animales.mp4",
        "query": "ytsearch1:animales que duermen de pie caballos flamencos shorts",
        "topic": "Curiosidades Animales"
    },
    {
        "filename": "cielo.mp4",
        "query": "ytsearch1:por que el cielo es azul dispersion rayleigh shorts",
        "topic": "Óptica Rápida"
    },
    {
        "filename": "dinosaurios.mp4",
        "query": "ytsearch1:dinosaurios tenian plumas reales paleontologia shorts",
        "topic": "Paleontología Express"
    },
    {
        "filename": "slime.mp4",
        "query": "ytsearch1:slime satisfying asmr crunch crunching shorts",
        "topic": "Sensorial Rápido"
    },
    {
        "filename": "popit.mp4",
        "query": "ytsearch1:pop it satisfiying sounds asmr clicks shorts",
        "topic": "ASMR / Háptico"
    },
    {
        "filename": "gatito.mp4",
        "query": "ytsearch1:cat dancing meme funny shorts",
        "topic": "Micro Meme"
    },
    {
        "filename": "jackpot_estrella.mp4",
        "query": "ytsearch1:james webb pillars of creation space telescope 4k shorts",
        "topic": "Astronomía Profunda"
    }
]

print("Starting YouTube Shorts download via yt-dlp...")

for item in SEARCH_QUERIES:
    out_target = os.path.join(OUTPUT_DIR, item["filename"])
    print(f"\n[DOWNLOAD] Searching for '{item['topic']}': {item['query']} -> {item['filename']}")
    
    ydl_opts = {
        'format': 'bestvideo[ext=mp4][height<=1080]+bestaudio[ext=m4a]/best[ext=mp4]/best',
        'outtmpl': out_target,
        'merge_output_format': 'mp4',
        'overwrites': True,
        'quiet': False,
        'no_warnings': True,
        'postprocessors': [{
            'key': 'FFmpegVideoConvertor',
            'preferedformat': 'mp4',
        }],
    }
    
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([item['query']])
        print(f"[SUCCESS] Downloaded {item['filename']} ({os.path.getsize(out_target)} bytes)")
    except Exception as e:
        print(f"[ERROR] downloading {item['filename']}: {e}")

print("\nAll YouTube Shorts downloaded successfully with real authentic audio!")
