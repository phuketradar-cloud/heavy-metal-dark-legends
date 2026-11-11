"""Usage: cut_uiicons.py <sheet> [slots]  (default: 5x2 UI sheet; "slots": 3x2 equipment sheet)
Cut a green-screen icon sheet (green screen) into public/icons/ui_<name>.webp (128px, transparent)."""
import sys, numpy as np
from PIL import Image
NAMES = ['swords','star','star_off','cards','loop','gold','exp','upgrade','lock','unlock']
COLS, ROWS, PFX = 5, 2, 'ui_'
if len(sys.argv) > 2 and sys.argv[2] == 'slots':
    NAMES = ['weapon', 'armor', 'helmet', 'gloves', 'boots', 'accessory']; COLS, ROWS, PFX = 3, 2, 'ui_slot_'
src = Image.open(sys.argv[1]).convert('RGB'); W, H = src.size
for i, n in enumerate(NAMES):
    c, r = i % COLS, i // COLS
    cell = src.crop((c*W//COLS, r*H//ROWS, (c+1)*W//COLS, (r+1)*H//ROWS))
    a = np.asarray(cell).astype(int); R, G, B = a[...,0], a[...,1], a[...,2]
    green = (G > R + 40) & (G > B + 40)
    alpha = np.where(green, 0, 255).astype(np.uint8)
    # despill remaining green fringe
    spill = (G > R + 12) & (G > B * 1.0 + 12) & ~green
    a[...,1] = np.where(spill, np.maximum(R, B), G)
    im = Image.fromarray(np.dstack([a.astype(np.uint8), alpha]), 'RGBA')
    bb = im.getchannel('A').point(lambda v: 255 if v > 40 else 0).getbbox()
    im = im.crop(bb); s = max(im.size); sq = Image.new('RGBA', (s, s), (0,0,0,0))
    sq.paste(im, ((s-im.width)//2, (s-im.height)//2)); sq = sq.resize((128,128), Image.LANCZOS)
    sq.save(f'public/icons/{PFX}{n}.webp', quality=92); print(n, bb)
