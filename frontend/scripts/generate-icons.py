"""Generate PWA icons for Acadrix.

Creates 4 PNG files under frontend/public/:
  - icon-192.png              (required by PWA spec)
  - icon-512.png              (required by PWA spec)
  - icon-maskable-192.png     (maskable — inner 80% safe zone)
  - icon-maskable-512.png     (maskable — inner 80% safe zone)
  - apple-touch-icon.png      (180x180, iOS)

Run: python scripts/generate-icons.py
Needs: Pillow (available in backend/venv — `../backend/venv/bin/python scripts/generate-icons.py`)

These are placeholder icons. Replace with a designer-made SVG rendered to PNG
when you have one. The manifest config doesn't care about the source.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

BRAND_PRIMARY = (43, 90, 181)   # #2b5ab5
BRAND_BG = (255, 255, 255)       # white background for maskable
PUBLIC_DIR = Path(__file__).resolve().parent.parent / 'public'


def _best_font(size: int) -> ImageFont.ImageFont:
    """Try to find a bold system font. Falls back to PIL default if none."""
    candidates = [
        '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
        '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf',
        '/System/Library/Fonts/Helvetica.ttc',
    ]
    for path in candidates:
        if Path(path).exists():
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def make_solid_icon(size: int, letter: str = 'A') -> Image.Image:
    """Solid brand colour square with a big white letter in the middle."""
    img = Image.new('RGB', (size, size), BRAND_PRIMARY)
    draw = ImageDraw.Draw(img)
    font = _best_font(int(size * 0.60))
    bbox = draw.textbbox((0, 0), letter, font=font)
    w = bbox[2] - bbox[0]
    h = bbox[3] - bbox[1]
    x = (size - w) / 2 - bbox[0]
    y = (size - h) / 2 - bbox[1] - int(size * 0.04)
    draw.text((x, y), letter, font=font, fill=(255, 255, 255))
    return img


def make_maskable_icon(size: int, letter: str = 'A') -> Image.Image:
    """Maskable icon: the brand square is centred in a slightly larger safe
    zone so launcher crops (circle, squircle, rounded rect) don't chop the letter.
    """
    # 80% of the canvas is the "safe zone"
    img = Image.new('RGB', (size, size), BRAND_PRIMARY)
    draw = ImageDraw.Draw(img)
    font = _best_font(int(size * 0.42))  # smaller than solid icon — letter stays inside safe zone
    bbox = draw.textbbox((0, 0), letter, font=font)
    w = bbox[2] - bbox[0]
    h = bbox[3] - bbox[1]
    x = (size - w) / 2 - bbox[0]
    y = (size - h) / 2 - bbox[1] - int(size * 0.03)
    draw.text((x, y), letter, font=font, fill=(255, 255, 255))
    return img


def main() -> None:
    PUBLIC_DIR.mkdir(exist_ok=True)

    make_solid_icon(192).save(PUBLIC_DIR / 'icon-192.png')
    make_solid_icon(512).save(PUBLIC_DIR / 'icon-512.png')
    make_maskable_icon(192).save(PUBLIC_DIR / 'icon-maskable-192.png')
    make_maskable_icon(512).save(PUBLIC_DIR / 'icon-maskable-512.png')
    make_solid_icon(180).save(PUBLIC_DIR / 'apple-touch-icon.png')

    # Also overwrite the broken /vite.svg reference with a real favicon
    make_solid_icon(64).save(PUBLIC_DIR / 'favicon.png')

    print('Generated PWA icons in', PUBLIC_DIR)


if __name__ == '__main__':
    main()
