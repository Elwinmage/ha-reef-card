#!/usr/bin/env python3
"""
Update the Supplements section in README.md and all doc/<lang>/README.<lang>.md files.

For each README:
  - Supplements are grouped by brand
  - Each brand is a collapsible <details> block showing:
      * brand name
      * count of supplements with image / total for that brand
  - Image paths are adjusted relative to each README's location
  - Section heading and intro text are localized per language
"""

import os
import re
import sys
from collections import defaultdict
from pathlib import Path

# ---------------------------------------------------------------------------
# Bootstrap: ensure supplements_list.py in scripts/ is importable
# ---------------------------------------------------------------------------
SCRIPT_DIR = Path(__file__).resolve().parent
CARD_DIR   = SCRIPT_DIR.parent
IMG_DIR    = CARD_DIR / "public" / "img" / "supplements"
DOC_DIR    = CARD_DIR / "doc"

sys.path.insert(0, str(SCRIPT_DIR))
from supplements_list import SUPPLEMENTS  # noqa: E402

# ---------------------------------------------------------------------------
# Per-language configuration
# Each entry: (section_heading, intro_text)
# section_heading is the localized "## Supplements" used as start marker
# ---------------------------------------------------------------------------
LANG_CONFIG: dict = {
    "en": (
        "## Supplements",
        (
            "Here is the list of supported images for supplements, grouped by brand. "
            "If yours has a ❌, you can request its addition "
            "[here](https://github.com/Elwinmage/ha-reef-card/discussions/25)."
        ),
    ),
    "fr": (
        "## Suppléments",
        (
            "Voici la liste des images de suppléments supportées, regroupées par marque. "
            "Si la vôtre affiche ❌, vous pouvez demander son ajout "
            "[ici](https://github.com/Elwinmage/ha-reef-card/discussions/25)."
        ),
    ),
    # Add new languages here following the same pattern
}

DEFAULT_LANG = "en"

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def img_path(uid: str, readme_path: Path) -> str:
    """Return the image src path relative to the given README file location."""
    img_file = IMG_DIR / f"{uid}.supplement.png"
    return os.path.relpath(img_file, readme_path.parent).replace("\\", "/")


def has_image(uid: str) -> bool:
    return (IMG_DIR / f"{uid}.supplement.png").exists()


def build_supplement_block(readme_path: Path, heading: str, intro: str) -> str:
    """
    Build the full Supplements section HTML, grouped by brand,
    with one collapsible <details> per brand.
    """
    # Group supplements by brand_name, sorted alphabetically within each brand
    brands: dict = defaultdict(list)
    for s in SUPPLEMENTS:
        brands[s["brand_name"]].append(s)
    for brand in brands:
        brands[brand].sort(key=lambda s: s["fullname"])

    lines = []
    lines.append(f"{heading}\n")
    lines.append(intro + "\n")

    for brand in sorted(brands.keys()):
        supplements = brands[brand]
        total    = len(supplements)
        with_img = sum(1 for s in supplements if has_image(s["uid"]))

        summary = f"{brand} &nbsp; <sup>{with_img}/{total} 🖼️</sup>"

        lines.append("<details>")
        lines.append(f"<summary><b>{summary}</b></summary>\n")
        lines.append("<table>")

        for s in supplements:
            uid  = s["uid"]
            # Display only the product name, without the "Brand - " prefix
            name = s["fullname"].split(" - ", 1)[-1]
            if has_image(uid):
                src = img_path(uid, readme_path)
                lines.append(
                    f"<tr><td>✅</td>"
                    f"<td>{name}</td>"
                    f"<td><img style='width:20%;' src='{src}'/></td></tr>"
                )
            else:
                lines.append(
                    f"<tr><td>❌</td>"
                    f"<td colspan='2'>{name}</td></tr>"
                )

        lines.append("</table>")
        lines.append("</details>\n")

    return "\n".join(lines)


def update_readme(readme_path: Path, lang: str) -> None:
    """Replace the Supplements section in a README file."""
    if not readme_path.exists():
        print(f"  SKIP (not found): {readme_path}")
        return

    heading, intro = LANG_CONFIG.get(lang, LANG_CONFIG[DEFAULT_LANG])

    data = readme_path.read_text(encoding="utf-8")

    # Check that both markers exist before attempting replacement
    if heading not in data:
        print(f"  SKIP (marker '{heading}' not found): {readme_path}")
        return

    new_section = build_supplement_block(readme_path, heading, intro)
    # Replacement ends just before "# ReefLed" — keep that anchor intact
    new_section += "\n# ReefLed"

    # Escape heading for regex (handles accented chars safely)
    heading_escaped = re.escape(heading)
    updated = re.sub(
        rf"{heading_escaped}.+?# ReefLed",
        new_section,
        data,
        flags=re.DOTALL,
    )

    if updated == data:
        print(f"  No change: {readme_path}")
    else:
        readme_path.write_text(updated, encoding="utf-8")
        print(f"  Updated  : {readme_path}")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main() -> None:
    print("Updating Supplements section in READMEs...\n")

    # 1. Main README.md (English)
    update_readme(CARD_DIR / "README.md", "en")

    # 2. All doc/<lang>/README.<lang>.md
    if DOC_DIR.exists():
        for lang_dir in sorted(DOC_DIR.iterdir()):
            if not lang_dir.is_dir():
                continue
            lang   = lang_dir.name
            readme = lang_dir / f"README.{lang}.md"
            update_readme(readme, lang)

    print("\nDone.")


if __name__ == "__main__":
    main()
