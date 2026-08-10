#!/usr/bin/env python3
"""Draw the numbered zone overlay on a card screenshot.

Reproduces the annotation style of `doc/img/rsmat/rsmat_zones.png`: a dashed
rectangle per zone, each with a filled round badge carrying its number in the
top-left corner.

Usage:
    python3 scripts/gen_zones.py <source.png> <output.png> [--offset DX,DY]

ZONES is measured on one reference render. A later export of the same card
usually differs only by its margins, so pass --offset to translate every
rectangle at once rather than editing the constant.
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

# Same hues as the ReefMat reference, in the same order
COLORS = [
    "#e8434b",  # 1 red
    "#2fa84f",  # 2 green
    "#2f7fe8",  # 3 blue
    "#7b5cd6",  # 4 purple
    "#d94ec0",  # 5 magenta
    "#f08a20",  # 6 orange
]

# (x0, y0, x1, y1) on the 541x618 ReefRun render.
# A re-export with different margins only translates these, so use --offset
# instead of re-measuring every rectangle by hand.
ZONES = [
    (19, 14, 101, 60),  # 1 power state / maintenance mode
    (475, 14, 536, 60),  # 2 battery & wifi
    (179, 4, 395, 146),  # 3 controller head: mode, pumps, calibrations
    (19, 184, 245, 548),  # 4 pump 1: schedule + body + temperature
    (275, 160, 536, 548),  # 5 pump 2: schedule + body + temperature
    (15, 552, 538, 615),  # 6 last message / last alert message
]

BADGE_RADIUS = 13
DASH_ON, DASH_OFF = 7, 5
LINE_WIDTH = 2


def dashed_rectangle(draw: ImageDraw.ImageDraw, box, color: str, width: int) -> None:
    """Draw a dashed rectangle: PIL has no dash support."""
    x0, y0, x1, y1 = box
    for y in (y0, y1):
        pos = x0
        while pos < x1:
            stop = min(pos + DASH_ON, x1)
            draw.line([(pos, y), (stop, y)], fill=color, width=width)
            pos = stop + DASH_OFF
    for x in (x0, x1):
        pos = y0
        while pos < y1:
            stop = min(pos + DASH_ON, y1)
            draw.line([(x, pos), (x, stop)], fill=color, width=width)
            pos = stop + DASH_OFF


def load_font(size: int) -> ImageFont.FreeTypeFont:
    """Pick a bold sans-serif, falling back to the PIL default."""
    for path in (
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
    ):
        if Path(path).exists():
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def badge(draw: ImageDraw.ImageDraw, center, number: int, color: str) -> None:
    """Draw the numbered round badge of a zone."""
    cx, cy = center
    draw.ellipse(
        [cx - BADGE_RADIUS, cy - BADGE_RADIUS, cx + BADGE_RADIUS, cy + BADGE_RADIUS],
        fill=color,
        outline="white",
        width=2,
    )
    font = load_font(15)
    text = str(number)
    left, top, right, bottom = draw.textbbox((0, 0), text, font=font)
    draw.text(
        (cx - (right - left) / 2 - left, cy - (bottom - top) / 2 - top),
        text,
        fill="white",
        font=font,
    )


def parse_offset(value: str) -> tuple[int, int]:
    """Parse a "DX,DY" translation applied to every zone."""
    try:
        dx, dy = (int(part) for part in value.split(","))
    except ValueError as error:
        raise argparse.ArgumentTypeError("expected two integers, as in 13,2") from error
    return dx, dy


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--offset", type=parse_offset, default=(0, 0))
    args = parser.parse_args()

    dx, dy = args.offset
    zones = [(x0 + dx, y0 + dy, x1 + dx, y1 + dy) for x0, y0, x1, y1 in ZONES]

    base = Image.open(args.source).convert("RGBA")
    # Draw on a transparent layer so nothing of the original is destroyed
    layer = Image.new("RGBA", base.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)

    for box, color in zip(zones, COLORS):
        dashed_rectangle(draw, box, color, LINE_WIDTH)

    # Badges last, so a neighbouring dashed edge never runs across them
    for index, (box, color) in enumerate(zip(zones, COLORS), start=1):
        x0, y0, _x1, _y1 = box
        cx = max(BADGE_RADIUS + 1, x0)
        cy = max(BADGE_RADIUS + 1, y0)
        badge(draw, (cx, cy), index, color)

    out = Image.alpha_composite(base, layer)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    out.save(args.output, optimize=True)
    print(f"written: {args.output} ({args.output.stat().st_size // 1024} kB)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
