import subprocess
import os
import json

folder = r"D:\1_jose_angel\1_GitHub\Zentry\demo-features\apps\skinner-box\public\videos"
for f in sorted(os.listdir(folder)):
    if f.endswith(".mp4"):
        p = os.path.join(folder, f)
        cmd = ["ffprobe", "-v", "quiet", "-print_format", "json", "-show_streams", "-show_format", p]
        res = subprocess.run(cmd, capture_output=True, text=True)
        try:
            data = json.loads(res.stdout)
            v = next((s for s in data["streams"] if s["codec_type"] == "video"), {})
            a = next((s for s in data["streams"] if s["codec_type"] == "audio"), {})
            w = v.get("width", 0)
            h = v.get("height", 0)
            dur = float(data.get("format", {}).get("duration", 0))
            ratio = (w / h) if h else 0
            print(f"{f:20s}: {w}x{h} (ratio: {ratio:.2f}) | {dur:.1f}s | video: {v.get('codec_name')} | audio: {a.get('codec_name')} | size: {os.path.getsize(p)/1024/1024:.2f}MB")
        except Exception as e:
            print(f"{f}: probe error {e}")
