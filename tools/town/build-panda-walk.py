"""Re-pack the panda walk sheet: one connected sprite per cell, feet on a common baseline and the
head centred, so frames do not jitter or bleed into neighbouring cells. Output: 4 x 4 cells of 160 px."""
from pathlib import Path
import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = Path(__file__).resolve().parents[2] / 'source-openfoam/assets/town'
src = np.array(Image.open(ROOT / 'panda-walk.png').convert('RGBA'))
mask = src[:, :, 3] > 30
labels, count = ndimage.label(mask)
cell = src.shape[0] / 4
groups = {}
for index, (centre, size) in enumerate(zip(ndimage.center_of_mass(mask, labels, range(1, count + 1)),
                                           ndimage.sum(mask, labels, range(1, count + 1))), start=1):
    if size >= 20:
        groups.setdefault((int(centre[0] // cell), int(centre[1] // cell)), []).append(index)
SIDE, BASE, MID = 300, 292, 150
sheet = Image.new('RGBA', (SIDE * 4, SIDE * 4), (0, 0, 0, 0))
for (row, col), ids in groups.items():
    part = np.isin(labels, ids)
    ys, xs = np.where(part)
    crop = src[ys.min():ys.max() + 1, xs.min():xs.max() + 1].copy()
    crop[~part[ys.min():ys.max() + 1, xs.min():xs.max() + 1]] = 0
    head = int(xs[ys < ys.min() + (ys.max() - ys.min()) * 0.4].mean()) - xs.min()
    image = Image.fromarray(crop)
    sheet.paste(image, (col * SIDE + MID - head, row * SIDE + BASE - crop.shape[0]), image)
sheet.resize((640, 640), Image.LANCZOS).save(ROOT / 'panda-walk-v2.png', optimize=True)
print('wrote', ROOT / 'panda-walk-v2.png')
