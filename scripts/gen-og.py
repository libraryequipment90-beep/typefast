#!/usr/bin/env python3
"""Generate the 1200x630 Open Graph / Twitter card PNG.

SOCIAL platforms (Facebook, X, LinkedIn) do not render SVG, so we ship a
rasterised PNG. Re-run this script whenever the branding changes:

    python3 scripts/gen-og.py
"""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "og-image.png"

W, H = 1200, 630
BLUE = (47, 107, 255)
INK = (27, 36, 55)
MUTED = (107, 118, 144)
WHITE = (255, 255, 255)


def font(size):
    return ImageFont.load_default(size=size)


def main():
    img = Image.new("RGB", (W, H), (234, 241, 255))
    d = ImageDraw.Draw(img)

    # Soft vertical wash from tinted blue to near-white.
    for y in range(H):
        t = y / (H - 1)
        r = int(234 + (246 - 234) * t)
        g = int(241 + (249 - 241) * t)
        b = int(255 + (252 - 255) * t)
        d.line([(0, y), (W, y)], fill=(r, g, b))

    # Logo mark.
    d.rounded_rectangle([80, 84, 144, 148], radius=16, fill=BLUE)
    d.rectangle([96, 100, 112, 112], fill=WHITE)
    d.rectangle([118, 100, 130, 112], fill=WHITE)
    d.rectangle([96, 120, 128, 130], fill=WHITE)
    d.text((164, 96), "TypeFast", font=font(46), fill=BLUE)

    d.text((80, 244), "Type Faster,", font=font(76), fill=INK)
    d.text((80, 328), "Achieve More", font=font(76), fill=BLUE)
    d.text(
        (80, 428),
        "Free typing tests. WPM, accuracy, and practice drills.",
        font=font(30),
        fill=MUTED,
    )

    d.rounded_rectangle([80, 486, 396, 556], radius=35, fill=BLUE)
    d.text((238, 508), "Start Typing Test", font=font(26), fill=WHITE)

    img.save(OUT, "PNG", optimize=True)
    print(f"wrote {OUT} ({OUT.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
