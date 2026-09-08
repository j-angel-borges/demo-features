import yt_dlp
import json

ydl = yt_dlp.YoutubeDL({'quiet': True, 'js_runtimes': {'node': {}}})

searches = [
    ('45s_cosmos', 'james webb space telescope deep field universe shorts', 45, 65),
    ('30s_nature', 'ocean marine life underwater diving shorts', 30, 60),
    ('15s_science', 'optical illusion science satisfying shorts', 15, 60),
    ('10s_asmr', 'kinetic sand cutting satisfying asmr shorts', 10, 40),
    ('5s_loop', 'perfect loop satisfying 3d animation render shorts', 5, 30)
]

results = {}
for tag, q, min_d, max_d in searches:
    print(f'Searching {tag}...')
    info = ydl.extract_info(f'ytsearch6:{q}', download=False)
    results[tag] = []
    for entry in info.get('entries', []):
        dur = entry.get('duration') or 0
        title = entry.get('title') or ''
        url = entry.get('webpage_url') or ''
        channel = entry.get('uploader') or ''
        if dur >= min_d and dur <= max_d:
            results[tag].append({
                'title': title,
                'duration': dur,
                'url': url,
                'channel': channel
            })
            print(f'  ✓ [{dur}s] {title[:60]} ({channel})')
            if len(results[tag]) >= 2:
                break

with open('candidates.json', 'w', encoding='utf-8') as f:
    json.dump(results, f, indent=2, ensure_ascii=False)
print('Finished!')
