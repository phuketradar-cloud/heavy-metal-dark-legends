"""Cut a green/magenta-screen enemy image, crop tight, save public/enemies/<id>.webp and print data for enemies.ts
usage: python scripts/cut_enemy.py <input> <enemyId> [--all]
--magenta removes magenta everywhere (for magenta-screen images where the character has green)
--key removes only the exact key colour everywhere (safest way to clear enclosed pockets)
--all also removes green pockets enclosed by the character and green halos (only for characters with no green of their own)"""
import sys
from collections import deque
import numpy as np
from PIL import Image
src, eid = sys.argv[1], sys.argv[2]
ALL = '--all' in sys.argv
KEY = '--key' in sys.argv     # remove the exact key colour everywhere (enclosed pockets) without the looser --all rule
MAG = '--magenta' in sys.argv   # remove magenta everywhere (keeps the character's own green, e.g. moss)
a = np.array(Image.open(src).convert('RGB')).astype(int)
H, W, _ = a.shape
R, G, B = a[..., 0], a[..., 1], a[..., 2]
mn, mx = a.min(2), a.max(2)
bg = ((G > 140) & (G - R > 40) & (G - B > 50)) | ((mn > 235) & ((mx - mn) < 12)) | ((R > 150) & (B > 150) & (G < np.minimum(R, B) - 70))
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
fr = np.zeros_like(seen)
for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1), (1, 1), (-1, -1), (1, -1), (-1, 1)):
    s = np.zeros_like(seen)
    s[max(dy, 0):H + min(dy, 0), max(dx, 0):W + min(dx, 0)] = seen[max(-dy, 0):H + min(-dy, 0), max(-dx, 0):W + min(-dx, 0)]
    fr |= s
if KEY:
    seen |= bg
if MAG:
    seen |= (R > 150) & (B > 120) & (G < np.minimum(R, B) - 70)
    fr = np.zeros_like(seen)
    for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        s2 = np.zeros_like(seen)
        s2[max(dy, 0):H + min(dy, 0), max(dx, 0):W + min(dx, 0)] = seen[max(-dy, 0):H + min(-dy, 0), max(-dx, 0):W + min(-dx, 0)]
        fr |= s2
if ALL:
    seen |= (G - np.maximum(R, B) > 22) | ((R > 150) & (B > 120) & (G < np.minimum(R, B) - 70))
    # soften: drop pixels next to removed ones that still lean green
    fr = np.zeros_like(seen)
    for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        s2 = np.zeros_like(seen)
        s2[max(dy, 0):H + min(dy, 0), max(dx, 0):W + min(dx, 0)] = seen[max(-dy, 0):H + min(-dy, 0), max(-dx, 0):W + min(-dx, 0)]
        fr |= s2
fringe = fr & ~seen & ((G - np.maximum(R, B) > 25) | (np.minimum(R, B) - G > 45))
alpha = np.where(seen | fringe, 0, 255).astype('uint8')
ys, xs = np.where(alpha > 0)
x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
pad = 6
x0, y0 = max(0, x0 - pad), max(0, y0 - pad); x1, y1 = min(W, x1 + pad), min(H, y1 + pad)
img = Image.fromarray(np.dstack([a.astype('uint8'), alpha]), 'RGBA').crop((x0, y0, x1, y1))
w, h = img.size
if h > 1100: img = img.resize((round(w * 1100 / h), 1100), Image.LANCZOS)
w, h = img.size
if eid.startswith('icons/'):   # map-node icon: pad to a square and save at 256x256
    side = max(w, h); sq = Image.new('RGBA', (side, side), (0, 0, 0, 0)); sq.paste(img, ((side - w) // 2, (side - h) // 2))
    sq.resize((256, 256), Image.LANCZOS).save(f'public/{eid}.webp', quality=92)
else:
    img.save(f'public/enemies/{eid}.webp', quality=90)
# face = centroid of the topmost opaque rows (head)
al = np.array(img.getchannel('A')) > 0
top = al[: max(8, h // 10)]
tx = np.where(top)[1].mean() / w if top.any() else 0.5
print(f"{eid}: size={w}x{h} aspect={w}/{h} face=[{tx:.2f}, 0.10] removed={seen.mean():.2f}")
