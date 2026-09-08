import json
import re

file_path = r"C:\Users\jange\.gemini\antigravity-cli\brain\3d61f912-9788-4540-867a-37c02e3a5d6f\.system_generated\steps\559\content.md"

with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
    content = f.read()

# Look for large text chunks
blocks = re.findall(r'"([^"]{200,})"', content)
print(f"Found {len(blocks)} large string blocks.")

# Save meaningful text blocks to a markdown file
output_file = r"C:\Users\jange\.gemini\antigravity-cli\brain\3d61f912-9788-4540-867a-37c02e3a5d6f\extracted_research_summary.md"
with open(output_file, "w", encoding="utf-8") as out:
    for i, b in enumerate(blocks):
        # unescape standard escaped characters
        clean_b = b.replace(r"\n", "\n").replace(r"\"", '"').replace(r"\/", "/").replace(r"\u003c", "<").replace(r"\u003e", ">").replace(r"\u0026", "&")
        if any(keyword in clean_b.lower() for keyword in ["dopamina", "skinner", "tiktok", "recompensa", "decaimiento", "atención", "algoritmo", "ratio variable", "jackpot", "prefrontal", "neurobiología"]):
            out.write(f"## Block {i}\n\n")
            out.write(clean_b + "\n\n---\n\n")

print(f"Extracted relevant research to {output_file}")
