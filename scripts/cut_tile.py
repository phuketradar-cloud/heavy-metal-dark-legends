"""Cut the outside background (green / magenta screen or fake checkerboard) from a tile image and save 256x256 webp.
usage: python scripts/cut_tile.py <input> <tile index>   (tiles -> public/tiles/tile<N>.webp)
       python scripts/cut_tile.py <input> skills/<name>      (-> public/skills/<name>.webp)"""
import sys
from collections import deque
import numpy as np
from PIL import Image
src, idx = sys.argv[1], sys.argv[2]
OUT = f'public/{idx}.webp' if idx.startswith('skills/') else f'public/tiles/tile{idx}.webp'
a = np.array(Image.open(src).convert('RGB')).astype(int)
H, W, _ = a.shape
R, G, B = a[..., 0], a[..., 1], a[..., 2]
mn, mx = a.min(2), a.max(2)
green = (G > 150) & (G - R > 40) & (G - B > 60)
checker = (mn > 170) & ((mx - mn) < 22)
magenta = (R > 150) & (B > 150) & (G < np.minimum(R, B) - 70)
bg = green | checker | magenta
seen = np.zeros((H, W), bool); q = deque()
for x in range(W):
    for y in (0, H - 1):
        if bg[y, x]: seen[y, x] = True; q.append((y, x))
for y in range(H):
    for x in (0, W - 1):
        if bg[y, x] and not seen[y, x]: seen[y, x] = True; q.append((y, x))
while q:
    y, x = q.popleft()
    for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        ny, nx = y + dy, x + dx
        if 0 <= ny < H and 0 <= nx < W and not seen[ny, nx] and bg[ny, nx]:
            seen[ny, nx] = True; q.append((ny, nx))
# eat the anti-aliased fringe: pixels touching the removed area that are tinted green / very light
fr = np.zeros_like(seen)
for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1), (1, 1), (-1, -1), (1, -1), (-1, 1)):
    s = np.zeros_like(seen)
    s[max(dy, 0):H + min(dy, 0), max(dx, 0):W + min(dx, 0)] = seen[max(-dy, 0):H + min(-dy, 0), max(-dx, 0):W + min(-dx, 0)]
    fr |= s
fringe = fr & ~seen & ((G - np.maximum(R, B) > 10) | (mn > 150) | (np.minimum(R, B) - G > 45))
alpha = np.where(seen | fringe, 0, 255).astype('uint8')
# spill suppression: pull green tint out of semi-edge pixels
out = np.dstack([a.astype('uint8'), alpha])
Image.fromarray(out, 'RGBA').resize((256, 256), Image.LANCZOS).save(OUT, quality=92)
print('removed', round(float(seen.mean()), 3))
