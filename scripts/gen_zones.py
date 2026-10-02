#!/usr/bin/env python3
"""Draw the numbered zone overlay on a card screenshot.

Reproduces the annotation style of `doc/img/rsmat/rsmat_zones.png`: a dashed
rectangle per zone, each with a filled round badge carrying its number in the
top-left corner.

Usage:
    python3 scripts/gen_zones.py <source.png> <output.png> [--device NAME]
                                 [--offset DX,DY] [--scale FACTOR]

Each device has its own zone set in ZONE_SETS, measured on one reference
render. The sets listed in ZONE_SIZES are scaled to the size of the capture. A later export of the same card usually differs only by its margins, so
pass --offset to translate every rectangle at once rather than re-measuring the
constant. --scale keeps the dashes and the badges visually consistent when the
render is bigger than the one the style was designed on.
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
    "#0f9b9b",  # 7 teal
]

# (x0, y0, x1, y1) per device, in the render the zones were measured on.
# A re-export with different margins only translates these, so use --offset
# instead of re-measuring every rectangle by hand.
ZONE_SETS = {
    # 541x618 ReefRun render
    "rsrun": [
        (19, 14, 101, 60),  # 1 power state / maintenance mode
        (475, 14, 536, 60),  # 2 battery & wifi
        (179, 4, 395, 146),  # 3 controller head: mode, pumps, calibrations
        (19, 184, 245, 548),  # 4 pump 1: schedule + body + temperature
        (275, 160, 536, 548),  # 5 pump 2: schedule + body + temperature
        (15, 552, 538, 615),  # 6 last message / last alert message
    ],
    # 876x1006 ReefATO+ render
    "rsato": [
        (594, 1, 873, 156),  # 1 controller head: mode, leak, config, wifi
        (598, 162, 866, 208),  # 2 pump, sensor and leak detector calibrations
        (3, 442, 236, 1005),  # 3 reservoir: pump, autonomy, level, leak state
        (260, 801, 338, 850),  # 4 buzzer
        (253, 859, 420, 1005),  # 5 leak probe
        (449, 550, 875, 1004),  # 6 aquarium: level probe, temperature, usage
        (0, 341, 872, 434),  # 7 last message / last alert message
    ],
    # 596x525 ReefControl-Power (RSPOWER6) render
    "rspower": [
        (95, 45, 160, 76),  # 1 power state / maintenance mode
        (438, 45, 538, 76),  # 2 configuration, wifi & battery
        (95, 78, 586, 188),  # 3 power sockets: mode, consumption, sockets
        (36, 92, 84, 474),  # 4 temperature probe or ReefControl link
        (98, 190, 486, 426),  # 5 linked devices
        (40, 494, 594, 523),  # 6 last message / last alert message
    ],
    # 594x692 ReefControl Pro render
    "rscontrol": [
        (375, 26, 552, 96),  # 1 controller head: state, config, wifi, buzzer
        (46, 85, 326, 149),  # 2 paired power center
        (12, 195, 390, 221),  # 3 summary of the readings
        (12, 223, 444, 682),  # 4 probes
        (444, 100, 512, 182),  # 5 12V ports
        (448, 285, 560, 640),  # 6 ATO pump
        (8, 23, 342, 58),  # 7 last message / last alert message
    ],
    # 591x860 ReefLed G1 render (the design space of the view). A zone made
    # of several rectangles is a list: the first one carries the badge.
    "rsled": [
        # 1 sky: sun or moon, mode, clouds; rise and set times at its ends
        [(28, 22, 563, 222), (32, 244, 92, 272), (498, 244, 560, 272)],
        (14, 228, 252, 404),  # 2 left face: name, on/off, maintenance, config, wifi
        (296, 216, 545, 334),  # 3 right face: identify, moon phase, acclimation
        (116, 400, 486, 798),  # 4 beam: intensity, program name and chart
        (4, 426, 112, 720),  # 5 sliders: intensity, colour, moon (K | W/B)
        (489, 476, 587, 776),  # 6 lamps of the group, weather icon
        (2, 804, 589, 858),  # 7 last message / last alert message
    ],
    # 688x800 ReefWave render (the design space of the view)
    "rswave": [
        (6, 4, 682, 66),  # 1 last message / last alert message
        # 2 mounting clips: on/off, maintenance | settings, wifi
        [(198, 92, 298, 144), (486, 180, 598, 244)],
        (204, 192, 330, 262),  # 3 LED strip: mode and name of the pump
        (568, 304, 656, 438),  # 4 end cap: speed ring and direction
        (46, 266, 512, 388),  # 5 flow under the pump
        (62, 390, 562, 480),  # 6 pumps of the group
        (62, 484, 640, 790),  # 7 day program and wave library button
    ],
    # Aqua Medic render (one view stands for the three: the SmartDrift one):
    # rectangles to measure, in the order of doc/en/aquamedic.md
    "aquamedic": [
        # (x0, y0, x1, y1),  # 1 top band: power, feeding, timer, 0-10V, config
        # (x0, y0, x1, y1),  # 2 faults raised by the pump
        # (x0, y0, x1, y1),  # 3 speed: ring and sliders
        # (x0, y0, x1, y1),  # 4 time-slot program
    ],
}
DEFAULT_DEVICE = "rsrun"

# Size of the render a zone set was measured on, for the sets given in the
# design space of their view: a capture of another size (a wider card, a
# high-density screen) gets the rectangles scaled to it before --offset.
ZONE_SIZES = {
    "rsled": (591, 860),
    "rswave": (688, 800),
}

BADGE_RADIUS = 13
DASH_ON, DASH_OFF = 7, 5
LINE_WIDTH = 2


def dashed_rectangle(
    draw: ImageDraw.ImageDraw, box, color: str, width: int, scale: float = 1.0
) -> None:
    """Draw a dashed rectangle: PIL has no dash support."""
    x0, y0, x1, y1 = box
    dash_on = max(1, round(DASH_ON * scale))
    dash_off = max(1, round(DASH_OFF * scale))
    for y in (y0, y1):
        pos = x0
        while pos < x1:
            stop = min(pos + dash_on, x1)
            draw.line([(pos, y), (stop, y)], fill=color, width=width)
            pos = stop + dash_off
    for x in (x0, x1):
        pos = y0
        while pos < y1:
            stop = min(pos + dash_on, y1)
            draw.line([(x, pos), (x, stop)], fill=color, width=width)
            pos = stop + dash_off


def load_font(size: int) -> ImageFont.FreeTypeFont:
    """Pick a bold sans-serif, falling back to the PIL default."""
    for path in (
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
    ):
        if Path(path).exists():
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def badge(
    draw: ImageDraw.ImageDraw, center, number: int, color: str, scale: float = 1.0
) -> None:
    """Draw the numbered round badge of a zone."""
    cx, cy = center
    radius = round(BADGE_RADIUS * scale)
    draw.ellipse(
        [cx - radius, cy - radius, cx + radius, cy + radius],
        fill=color,
        outline="white",
        width=max(2, round(2 * scale)),
    )
    font = load_font(round(15 * scale))
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
    parser.add_argument(
        "--device",
        choices=sorted(ZONE_SETS),
        default=DEFAULT_DEVICE,
        help="which zone set to draw (default: %(default)s)",
    )
    parser.add_argument("--offset", type=parse_offset, default=(0, 0))
    parser.add_argument(
        "--scale",
        type=float,
        default=1.0,
        help="multiply the dash and badge sizes, for renders larger than the "
        "one the style was designed on",
    )
    args = parser.parse_args()

    dx, dy = args.offset
    scale = args.scale
    if not ZONE_SETS[args.device]:
        parser.error(
            f"the zones of {args.device} are not measured yet: fill its "
            "rectangles in ZONE_SETS"
        )
    base = Image.open(args.source).convert("RGBA")
    fx = fy = 1.0
    if args.device in ZONE_SIZES:
        width, height = ZONE_SIZES[args.device]
        fx, fy = base.width / width, base.height / height

    def place(box):
        x0, y0, x1, y1 = box
        return (
            round(x0 * fx) + dx,
            round(y0 * fy) + dy,
            round(x1 * fx) + dx,
            round(y1 * fy) + dy,
        )

    # Every zone as a list of rectangles: most have a single one
    zones = [
        [place(box) for box in (zone if isinstance(zone, list) else [zone])]
        for zone in ZONE_SETS[args.device]
    ]
    # Draw on a transparent layer so nothing of the original is destroyed
    layer = Image.new("RGBA", base.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)

    line_width = max(1, round(LINE_WIDTH * scale))
    for boxes, color in zip(zones, COLORS):
        for box in boxes:
            dashed_rectangle(draw, box, color, line_width, scale)

    # Badges last, so a neighbouring dashed edge never runs across them
    radius = round(BADGE_RADIUS * scale)
    for index, (boxes, color) in enumerate(zip(zones, COLORS), start=1):
        x0, y0, _x1, _y1 = boxes[0]
        cx = min(max(radius + 1, x0), base.width - radius - 1)
        cy = min(max(radius + 1, y0), base.height - radius - 1)
        badge(draw, (cx, cy), index, color, scale)

    out = Image.alpha_composite(base, layer)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    out.save(args.output, optimize=True)
    print(f"written: {args.output} ({args.output.stat().st_size // 1024} kB)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
