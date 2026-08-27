#!/usr/bin/env python3
"""Check the images referenced by the README files.

Two problems are reported, each with the file and the line where the reference
sits:

  MISSING   the file does not exist in the repository
  ABSOLUTE  the path starts with "/", which GitHub resolves against the site
            root (https://github.com/img/...) instead of the repository, so the
            image is broken online even though the file exists locally

Remote URLs (http/https) are listed as SKIPPED unless --check-remote is passed,
since verifying them needs network access.

Usage:
    python3 scripts/check_doc_images.py [--check-remote] [paths...]

Exit code is 1 when at least one problem is found, so the script can be wired
into a pre-commit hook or a CI job.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

# Markdown ![alt](path "title") and HTML <img src="path">
MD_IMAGE = re.compile(r"!\[[^\]]*\]\(\s*<?([^)\s>]+)")
HTML_IMAGE = re.compile(r"<img[^>]+?src\s*=\s*[\"']([^\"']+)[\"']", re.I)

RESET, RED, YELLOW, GREEN, DIM = (
    "\033[0m",
    "\033[31m",
    "\033[33m",
    "\033[32m",
    "\033[2m",
)


def iter_references(path: Path):
    """Yield (line_number, reference) for every image of a markdown file."""
    with path.open(encoding="utf-8") as handle:
        for number, line in enumerate(handle, start=1):
            for match in MD_IMAGE.finditer(line):
                yield number, match.group(1)
            for match in HTML_IMAGE.finditer(line):
                yield number, match.group(1)


def default_targets() -> list[Path]:
    """The README files of the repository, English first."""
    targets = []
    if Path("README.md").exists():
        targets.append(Path("README.md"))
    targets.extend(sorted(Path("doc").rglob("README.*.md")))
    return targets


def check(path: Path, check_remote: bool) -> list[tuple[int, str, str]]:
    """Return the problems of one file as (line, kind, reference)."""
    problems: list[tuple[int, str, str]] = []
    for line, ref in iter_references(path):
        target = ref.split("#", 1)[0].split("?", 1)[0]
        if not target:
            continue
        if target.startswith(("http://", "https://", "data:")):
            if check_remote:
                problems.extend(_check_remote(line, target))
            continue
        if target.startswith("/"):
            # GitHub resolves this against the site root, never the repository
            problems.append((line, "ABSOLUTE", ref))
            continue
        if not (path.parent / target).exists():
            problems.append((line, "MISSING", ref))
    return problems


def _check_remote(line: int, url: str) -> list[tuple[int, str, str]]:
    """Probe a remote image. Network failures are reported, not raised."""
    import urllib.error
    import urllib.request

    request = urllib.request.Request(url, method="HEAD")
    try:
        with urllib.request.urlopen(request, timeout=10) as response:
            if response.status >= 400:
                return [(line, f"HTTP {response.status}", url)]
    except urllib.error.HTTPError as err:
        return [(line, f"HTTP {err.code}", url)]
    except Exception as err:  # noqa: BLE001 - network is best effort here
        return [(line, f"UNREACHABLE ({type(err).__name__})", url)]
    return []


def main() -> int:
    args = [a for a in sys.argv[1:] if not a.startswith("-")]
    check_remote = "--check-remote" in sys.argv[1:]
    targets = [Path(a) for a in args] if args else default_targets()

    total = 0
    for path in targets:
        if not path.exists():
            print(f"{RED}no such file: {path}{RESET}")
            total += 1
            continue
        problems = check(path, check_remote)
        if not problems:
            print(f"{GREEN}✓{RESET} {path}")
            continue
        total += len(problems)
        print(f"{RED}✗{RESET} {path} {DIM}({len(problems)}){RESET}")
        width = max(len(kind) for _, kind, _ in problems)
        for line, kind, ref in problems:
            color = RED if kind == "MISSING" else YELLOW
            # "path:line:" is the format editors and CI logs can jump to
            print(f"   {path}:{line}: {color}{kind:<{width}}{RESET}  {ref}")

    print()
    if total:
        print(f"{RED}{total} problem(s) found{RESET}")
        return 1
    print(f"{GREEN}all images resolve{RESET}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
