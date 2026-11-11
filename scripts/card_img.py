"""Center-crop to 1.6:1, resize to 640x400 and save as public/cards/<id>.webp
usage: python scripts/card_img.py <input> <cardId>"""
import sys
from PIL import Image
src, cid = sys.argv[1], sys.argv[2]
im = Image.open(src).convert('RGB'); w, h = im.size
tw = min(w, int(h * 1.6)); th = int(tw / 1.6)
l, t = (w - tw) // 2, (h - th) // 2
im.crop((l, t, l + tw, t + th)).resize((640, 400), Image.LANCZOS).save(f'public/cards/{cid}.webp', quality=88)
print('saved', cid, (w, h))
