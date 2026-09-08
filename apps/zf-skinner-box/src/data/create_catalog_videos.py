import os
import subprocess

OUTPUT_DIR = r"D:\1_jose_angel\1_GitHub\Zentry\demo-features\apps\skinner-box\public\videos"
os.makedirs(OUTPUT_DIR, exist_ok=True)

VIDEOS = [
    {
        "filename": "ballenas.mp4",
        "duration": 42,
        "video_filter": "mandelbrot=size=720x1280:rate=30:maxiter=140,hue=H=210+t*10:s=2.5",
        "audio_filter": "aevalsrc=exprs='0.25*sin(2*PI*110*t)+0.15*sin(2*PI*220*t)+0.08*sin(2*PI*330*t)*sin(2*PI*0.5*t)':s=44100"
    },
    {
        "filename": "espacio.mp4",
        "duration": 38,
        "video_filter": "cellauto=size=720x1280:rate=30:rule=30,format=rgb24,colorchannelmixer=rr=0.8:gg=0.3:bb=1.0",
        "audio_filter": "aevalsrc=exprs='0.2*sin(2*PI*(220+40*sin(2*PI*0.2*t))*t)+0.1*sin(2*PI*440*t)':s=44100"
    },
    {
        "filename": "hormigas.mp4",
        "duration": 35,
        "video_filter": "life=size=720x1280:rate=30:mold=10,format=rgb24,colorchannelmixer=rr=0.2:gg=0.9:bb=0.4",
        "audio_filter": "aevalsrc=exprs='0.2*sin(2*PI*180*t)*(0.5+0.5*sin(2*PI*4*t))+0.1*sin(2*PI*360*t)':s=44100"
    },
    {
        "filename": "animales.mp4",
        "duration": 22,
        "video_filter": "testsrc=size=720x1280:rate=30,hue=H=280+t*25:s=1.8",
        "audio_filter": "aevalsrc=exprs='0.25*sin(2*PI*(330+50*sin(2*PI*1.5*t))*t)*(0.6+0.4*sin(2*PI*6*t))':s=44100"
    },
    {
        "filename": "cielo.mp4",
        "duration": 16,
        "video_filter": "smptehdbars=size=720x1280:rate=30,hue=H=190+t*15:s=1.5",
        "audio_filter": "aevalsrc=exprs='0.2*sin(2*PI*440*t)+0.15*sin(2*PI*660*t)':s=44100"
    },
    {
        "filename": "dinosaurios.mp4",
        "duration": 14,
        "video_filter": "testsrc=size=720x1280:rate=30,hue=H=25+t*30:s=2.0",
        "audio_filter": "aevalsrc=exprs='0.3*sin(2*PI*(150+100*sin(2*PI*2*t))*t)*(0.5+0.5*sin(2*PI*8*t))':s=44100"
    },
    {
        "filename": "slime.mp4",
        "duration": 8,
        "video_filter": "smptehdbars=size=720x1280:rate=30,hue=H=320+t*50:s=2.5",
        "audio_filter": "aevalsrc=exprs='0.3*sin(2*PI*(500+200*sin(2*PI*5*t))*t)*(0.5+0.5*sin(2*PI*12*t))':s=44100"
    },
    {
        "filename": "popit.mp4",
        "duration": 6,
        "video_filter": "testsrc=size=720x1280:rate=30,hue=H=t*60:s=1.5",
        "audio_filter": "aevalsrc=exprs='0.35*sin(2*PI*880*t)*(0.5+0.5*sin(2*PI*16*t))':s=44100"
    },
    {
        "filename": "gatito.mp4",
        "duration": 5,
        "video_filter": "smptehdbars=size=720x1280:rate=30,hue=H=300+t*80:s=2.0",
        "audio_filter": "aevalsrc=exprs='0.3*sin(2*PI*(600+300*sin(2*PI*8*t))*t)':s=44100"
    },
    {
        "filename": "jackpot_estrella.mp4",
        "duration": 44,
        "video_filter": "mandelbrot=size=720x1280:rate=30:maxiter=160,hue=H=45+t*8:s=2.0",
        "audio_filter": "aevalsrc=exprs='0.25*sin(2*PI*130.81*t)+0.2*sin(2*PI*196*t)+0.15*sin(2*PI*261.63*t)+0.1*sin(2*PI*392*t)':s=44100"
    }
]

for item in VIDEOS:
    out_path = os.path.join(OUTPUT_DIR, item["filename"])
    print(f"Generating {item['filename']} ({item['duration']}s)...")
    cmd = [
        "ffmpeg", "-y",
        "-f", "lavfi", "-i", item["video_filter"],
        "-f", "lavfi", "-i", item["audio_filter"],
        "-t", str(item["duration"]),
        "-c:v", "libx264", "-pix_fmt", "yuv420p", "-preset", "ultrafast",
        "-b:v", "1200k", "-maxrate", "1500k", "-bufsize", "2500k",
        "-c:a", "aac", "-b:a", "128k",
        out_path
    ]
    subprocess.run(cmd, check=True)
    print(f"Done: {out_path} ({os.path.getsize(out_path)} bytes)")

print("\nAll 10 videos with audio generated successfully!")
