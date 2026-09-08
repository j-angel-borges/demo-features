import urllib.request
import re
import json

url = "https://gemini.google.com/share/OYmBNII9XzWn"
req = urllib.request.Request(
    url,
    headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
)

try:
    with urllib.request.urlopen(req) as resp:
        html = resp.read().decode("utf-8", errors="ignore")
        print(f"Fetched HTML size: {len(html)}")
        
        # Look for the shared conversation data inside WIZ_global_data or AF_initDataCallback
        callbacks = re.findall(r"AF_initDataCallback\((.*?)\);</script>", html, re.DOTALL)
        print(f"Found {len(callbacks)} callbacks.")
        
        saved_text = []
        for cb in callbacks:
            if "data:" in cb:
                saved_text.append(cb)
        
        with open(r"C:\Users\jange\.gemini\antigravity-cli\brain\3d61f912-9788-4540-867a-37c02e3a5d6f\gemini_share_raw.txt", "w", encoding="utf-8") as out:
            out.write(html)
            
        print("Raw HTML saved successfully.")
except Exception as e:
    print("Fetch error:", e)
