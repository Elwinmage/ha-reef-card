#!/usr/bin/env python3
"""
Update supplements_list.ts for ha-reef-card from ha-reefbeat-component.

Paths are resolved relative to this script's location:
  ha-reef-card/
    scripts/
      update_supplements_list.py   <- this file
      supplements_list.py          <- local copy (synced from component)
    src/devices/rsdose/
      supplements_list.ts          <- generated TypeScript output

  ha-reefbeat-component/           <- sibling directory of ha-reef-card
    custom_components/redsea/
      supplements_list.py          <- source of truth (local)
"""

import argparse
import re
import sys
import urllib.request
from pathlib import Path

# ---------------------------------------------------------------------------
# Path resolution
# ---------------------------------------------------------------------------
SCRIPT_DIR    = Path(__file__).resolve().parent
CARD_DIR      = SCRIPT_DIR.parent
COMPONENT_DIR = CARD_DIR.parent / "ha-reefbeat-component"

ONLINE_URL = (
    "https://github.com/Elwinmage/ha-reefbeat-component"
    "/raw/refs/heads/main/custom_components/redsea/supplements_list.py"
)
LOCAL_SOURCE = COMPONENT_DIR / "custom_components" / "redsea" / "supplements_list.py"
CURRENT_COPY = SCRIPT_DIR / "supplements_list.py"
TS_OUTPUT    = CARD_DIR / "src" / "devices" / "rsdose" / "supplements_list.ts"

# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------
def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        prog="update_supplements_list.py",
        description=(
            "Sync supplements_list.py from ha-reefbeat-component (local or GitHub)\n"
            "and convert it to a TypeScript module for ha-reef-card."
        ),
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=(
            "Resolved paths (relative to this script):\n"
            "  Source  : <sibling>/ha-reefbeat-component/custom_components/redsea/supplements_list.py\n"
            "  Copy    : scripts/supplements_list.py\n"
            "  Output  : src/devices/rsdose/supplements_list.ts\n"
            "\n"
            "Examples:\n"
            "  python update_supplements_list.py\n"
            "  python update_supplements_list.py --indent 4\n"
            "  python update_supplements_list.py --indent 4 --output /tmp/out.ts\n"
        ),
    )
    parser.add_argument(
        "--indent",
        type=int,
        default=2,
        metavar="N",
        help="Number of spaces per indentation level in the output (default: 2)",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=None,
        metavar="FILE",
        help="Override output file path (default: src/devices/rsdose/supplements_list.ts)",
    )
    return parser.parse_args()


# ---------------------------------------------------------------------------
# Step 1 — sync supplements_list.py
# ---------------------------------------------------------------------------
def sync_source() -> None:
    """Copy from local component repo if present, otherwise download from GitHub."""
    if LOCAL_SOURCE.exists():
        source_text = LOCAL_SOURCE.read_text(encoding="utf-8")
        if CURRENT_COPY.exists():
            if source_text == CURRENT_COPY.read_text(encoding="utf-8"):
                print("supplements_list.py is already up to date.")
                return
            print(f"Updating from local component: {LOCAL_SOURCE}")
        else:
            print(f"Copying from local component: {LOCAL_SOURCE}")
        CURRENT_COPY.write_text(source_text, encoding="utf-8")
    else:
        print("Local component not found, downloading from GitHub...")
        try:
            with urllib.request.urlopen(ONLINE_URL) as resp:
                content = resp.read().decode("utf-8")
            CURRENT_COPY.write_text(content, encoding="utf-8")
            print("Download complete.")
        except Exception as exc:
            print(f"ERROR: Failed to download supplements list: {exc}", file=sys.stderr)
            sys.exit(1)


# ---------------------------------------------------------------------------
# Step 2 — convert Python -> TypeScript
# ---------------------------------------------------------------------------
def python_to_ts(indent: int, output: Path) -> None:
    """
    Extract the SUPPLEMENTS list from the Python file and emit a TypeScript
    module, converting Python literals to JS equivalents.
    """
    py_text = CURRENT_COPY.read_text(encoding="utf-8")

    # Find the line where SUPPLEMENTS = [ starts
    lines = py_text.splitlines()
    start_line = None
    for i, line in enumerate(lines):
        if re.match(r"^SUPPLEMENTS\s*[:=]", line):
            start_line = i
            break

    if start_line is None:
        print("ERROR: Could not find SUPPLEMENTS constant in source.", file=sys.stderr)
        sys.exit(1)

    # Take everything after the SUPPLEMENTS declaration line
    body = "\n".join(lines[start_line + 1:])

    # Python -> JS literal conversions
    body = body.replace("None",  "null")
    body = body.replace("True",  "true")
    body = body.replace("False", "false")

    # Remove quotes around object keys: "key": -> key:
    body = re.sub(r'"([\w]+)"(\s*):', r'\1\2:', body)

    # Re-indent: original Python uses 4-space indent -> convert to `indent` spaces
    indent_str = " " * indent
    def reindent(line: str) -> str:
        n = len(line) - len(line.lstrip(" "))
        levels, remainder = divmod(n, 4)
        return indent_str * levels + " " * remainder + line.lstrip(" ")

    body = "\n".join(reindent(line) for line in body.splitlines())

    ts_content = (
        'import { Supplement } from "../../types/supplement";\n\n'
        "export const SUPPLEMENTS: Supplement[] = [\n"
        + body
        + "\n"
    )

    output.write_text(ts_content, encoding="utf-8")
    print(f"TypeScript output written to: {output}")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    args = parse_args()
    output = args.output or TS_OUTPUT

    print(f"Card dir      : {CARD_DIR}")
    print(f"Component dir : {COMPONENT_DIR}")
    print(f"Indent        : {args.indent} spaces")
    print(f"Output        : {output}")

    sync_source()
    python_to_ts(indent=args.indent, output=output)
    print("Done.")
