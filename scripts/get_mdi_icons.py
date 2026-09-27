#!/usr/bin/env python3
"""Download Material Design Icons and render them as PNG for the docs.

Each icon is fetched as SVG from the MDI sources, recoloured, then rendered to
`mdi_<name>.png` (or `mdi_<name>_<suffix>.png` when a colour suffix is given)
in the output directory, which is the current directory by default. Run it
from `doc/img/mdi/` to drop the files where the README expects them.

Icons are red by default, the red of the card's own icons. An icon is given
as `name`, or `name:color` to recolour it. The colour is a
CSS colour (`#e8222a`, `red`, `rgb(...)`); a named colour is also used as the
file suffix, as in the existing `mdi_bell-ring_red.png`, while any other value
needs an explicit suffix: `name:#2ecc40:green`.

Usage:
    python3 scripts/get_mdi_icons.py                    # the default set
    python3 scripts/get_mdi_icons.py bell-alert:green fish cup-water
    python3 scripts/get_mdi_icons.py --size 128 --color "#e8222a" power-plug
    python3 scripts/get_mdi_icons.py --out doc/img/mdi --force

Rendering needs cairosvg (`pip install cairosvg`); without it, the script falls
back to `rsvg-convert` or ImageMagick's `convert` when one of them is on PATH.
"""

from __future__ import annotations

import argparse
import re
import shutil
import subprocess
import sys
import tempfile
import urllib.error
import urllib.request
from pathlib import Path

# Tried in order: the npm package through a CDN, then the GitHub repository
SOURCES = (
    "https://cdn.jsdelivr.net/npm/@mdi/svg@latest/svg/{name}.svg",
    "https://raw.githubusercontent.com/Templarian/MaterialDesign/master/svg/{name}.svg",
)

# Icons referenced by the ReefControl / ReefControl-Power sections of the README
DEFAULT_ICONS = (
    "bell-alert",
    "alert",
    "thermometer-alert",
    "water-alert",
    "waves",
    "fish",
    "cup-water",
    "power",
    "clock-time-nine-outline",
    "thermometer",
    "ph",
    "water-percent",
    "flash-triangle",
    "hand-back-left-outline",
    "web",
)

# Red of the card's own icons (COLOR_ERROR_HEX in src/utils/colors.ts)
DEFAULT_COLOR = "#ec2330"
DEFAULT_SIZE = 96

NAME_RE = re.compile(r"^[a-z0-9]+(-[a-z0-9]+)*$")
COLOR_WORD_RE = re.compile(r"^[a-z]+$")


def parse_icon(spec: str, default_color: str) -> tuple[str, str, str]:
    """Split an icon spec into (name, color, file suffix)."""
    parts = spec.split(":")
    name = parts[0].strip().removeprefix("mdi-").removeprefix("mdi_")
    if not NAME_RE.match(name):
        raise ValueError(f"invalid icon name: {spec!r}")
    color = parts[1].strip() if len(parts) > 1 and parts[1].strip() else default_color
    if len(parts) > 2:
        suffix = parts[2].strip()
    elif len(parts) > 1 and COLOR_WORD_RE.match(color):
        # A named colour doubles as the suffix (mdi_bell-ring_red.png)
        suffix = color
    else:
        suffix = ""
    return name, color, suffix


def fetch_svg(name: str) -> str:
    """Download the SVG of an icon, trying every source in turn."""
    errors = []
    for template in SOURCES:
        url = template.format(name=name)
        try:
            with urllib.request.urlopen(url, timeout=15) as response:
                return response.read().decode("utf-8")
        except (urllib.error.URLError, TimeoutError) as error:
            errors.append(f"{url}: {error}")
    raise RuntimeError("icon not found:\n  " + "\n  ".join(errors))


def colorize(svg: str, color: str) -> str:
    """Fill every path of the icon with the colour (MDI paths carry none)."""
    svg = re.sub(r'\sfill="[^"]*"', "", svg)
    return svg.replace("<path ", f'<path fill="{color}" ')


def render(svg: str, target: Path, size: int) -> None:
    """Render the SVG to a square PNG with a transparent background."""
    try:
        import cairosvg  # type: ignore[import-not-found]

        cairosvg.svg2png(
            bytestring=svg.encode("utf-8"),
            write_to=str(target),
            output_width=size,
            output_height=size,
        )
        return
    except ImportError:
        pass

    with tempfile.NamedTemporaryFile("w", suffix=".svg", delete=False) as tmp:
        tmp.write(svg)
        source = tmp.name
    try:
        if shutil.which("rsvg-convert"):
            cmd = ["rsvg-convert", "-w", str(size), "-h", str(size), "-o", str(target), source]
        elif shutil.which("convert"):
            cmd = [
                "convert", "-background", "none", "-density", "1200",
                source, "-resize", f"{size}x{size}", str(target),
            ]
        else:
            raise RuntimeError(
                "no SVG renderer: pip install cairosvg (or install rsvg-convert)"
            )
        subprocess.run(cmd, check=True, capture_output=True)
    finally:
        Path(source).unlink(missing_ok=True)


def main() -> int:
    parser = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument(
        "icons",
        nargs="*",
        help="icons as name[:color[:suffix]] (default: the README set)",
    )
    parser.add_argument("--out", type=Path, default=Path.cwd(), help="output directory")
    parser.add_argument("--size", type=int, default=DEFAULT_SIZE, help="PNG size in px")
    parser.add_argument("--color", default=DEFAULT_COLOR, help="default colour")
    parser.add_argument("--force", action="store_true", help="overwrite existing files")
    args = parser.parse_args()

    args.out.mkdir(parents=True, exist_ok=True)
    failures = 0
    for spec in args.icons or DEFAULT_ICONS:
        try:
            name, color, suffix = parse_icon(spec, args.color)
            target = args.out / (f"mdi_{name}_{suffix}.png" if suffix else f"mdi_{name}.png")
            if target.exists() and not args.force:
                print(f"skipped:  {target} (exists, use --force)")
                continue
            render(colorize(fetch_svg(name), color), target, args.size)
            print(f"written:  {target}")
        except (ValueError, RuntimeError, subprocess.CalledProcessError) as error:
            failures += 1
            print(f"FAILED:   {spec}: {error}", file=sys.stderr)
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
