#!/usr/bin/env python3
"""Render a documentation screenshot of the maintenance overview.

The markup and the CSS are transcribed from
`src/devices/redsea/maintenance/maintenance.{ts,styles.ts}`, and the icons come
from the very same `@mdi/js` package the card uses, so the result matches what
Home Assistant draws. Statuses and bar widths are computed with the formulas of
`src/utils/maintenance.ts`.

Three images are produced:
  - overview.png    the default view, sorted by equipment
  - overview_due.png the same tasks sorted by due date (flat list)
  - editor.png      the card editor of the maintenance pseudo device

Usage: python3 scripts/gen_maintenance_doc.py [output_dir]
"""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

from PIL import Image

MDI = json.loads(Path("/tmp/mdi.json").read_text())

WARNING_RATIO = 0.2

# Home Assistant default dark theme, matching the CSS fallbacks of the card
THEME = {
    "ok": "#43a047",
    "warning": "#ffa600",
    "overdue": "#db4437",
    "never": "#9e9e9e",
    "text": "#e1e1e1",
    "soft": "#9b9b9b",
    "divider": "rgba(127, 127, 127, 0.3)",
    "primary": "#03a9f4",
    "card": "#1c1c1c",
}


def icon(name: str, size: int = 20, color: str = "currentColor") -> str:
    """Inline an MDI glyph as SVG, the way <ha-icon> renders it."""
    return (
        f'<svg viewBox="0 0 24 24" width="{size}" height="{size}" '
        f'style="fill:{color};flex:0 0 auto"><path d="{MDI[name]}"/></svg>'
    )


def status_of(days_left: int | None, interval_days: int) -> str:
    """Mirror of compute_status()."""
    if days_left is None:
        return "never"
    if days_left < 0:
        return "overdue"
    if days_left <= max(1, round(interval_days * WARNING_RATIO)):
        return "warning"
    return "ok"


def percent_of(days_left: int | None, interval_days: int) -> int:
    """Mirror of compute_percent()."""
    if days_left is None or interval_days <= 0:
        return 0
    elapsed = (interval_days - days_left) / interval_days * 100
    return min(100, max(0, round(elapsed)))


class Task:
    """One maintenance row."""

    def __init__(
        self,
        name: str,
        icon_name: str,
        interval_days: int,
        days_left: int | None,
        notify: bool = True,
        editor: tuple[int, int, int, str] | None = None,
    ) -> None:
        self.name = name
        self.icon = icon_name
        self.interval_days = interval_days
        self.days_left = days_left
        self.notify = notify
        self.editor = editor  # (value, min, max, unit label)
        self.status = status_of(days_left, interval_days)
        self.percent = 100 if self.status == "overdue" else percent_of(
            days_left, interval_days
        )

    @property
    def remaining(self) -> str:
        """Mirror of _remaining_label()."""
        if self.days_left is None:
            return "never done"
        if self.days_left < 0:
            return f"+{abs(self.days_left)} d"
        if self.days_left == 0:
            return "today"
        return f"{self.days_left} d"


GROUPS = [
    (
        "ReefMat 1200",
        [
            Task("Replace activated carbon", "mdiWrenchCheck", 25, -6),
        ],
    ),
    (
        "ReefRun pump 1 (return 12000)",
        [
            Task("Clean motor and rotor", "mdiWrenchCheck", 135, 96),
            Task("Clean intake strainer", "mdiWrenchCheck", 42, 5),
        ],
    ),
    (
        "ReefRun pump 2 (skimmer 900)",
        [
            Task("Clean venturi & air tube", "mdiWrenchCheck", 35, 3, notify=False),
            Task(
                "Clean skimmer pump rotor",
                "mdiWrenchCheck",
                135,
                74,
                editor=(20, 8, 28, "weeks"),
            ),
            Task("Calibrate fullcup sensor", "mdiWrenchCheck", 28, None),
            Task(
                "Calibrate overskimming sensor",
                "mdiWrenchCheck",
                28,
                21,
                notify=False,
            ),
        ],
    ),
]


def render_row(task: Task, device: str | None = None) -> str:
    muted = "" if task.notify else " muted"
    bell = "mdiBellRing" if task.notify else "mdiBellOff"
    bell_class = "on" if task.notify else "off"
    editor = ""
    if task.editor:
        value, vmin, vmax, unit = task.editor
        ratio = (value - vmin) / (vmax - vmin)
        editor = f"""
        <div class="maint-editor">
          <div class="maint-editor-line">
            <span class="maint-editor-label">Every</span>
            <span class="maint-editor-value">{value} {unit}</span>
          </div>
          <div class="maint-editor-line">
            <span class="maint-editor-bound">{vmin}</span>
            <div class="maint-slider">
              <div class="maint-slider-track">
                <div class="maint-slider-fill" style="width:{ratio * 100:.0f}%"></div>
              </div>
              <div class="maint-slider-thumb" style="left:{ratio * 100:.0f}%"></div>
            </div>
            <span class="maint-editor-bound">{vmax}</span>
          </div>
        </div>"""
    tune_class = " open" if task.editor else ""
    return f"""
      <div class="maint-entry">
        <div class="maint-row{muted}">
          <span class="maint-icon">{icon(task.icon, 20, THEME["soft"])}</span>
          <div class="maint-body">
            <div class="maint-line">
              <span class="maint-name">{task.name}{
                f'<span class="maint-device"> - {device}</span>' if device else ""
              }</span>
              <span class="maint-remaining {task.status}">{task.remaining}</span>
            </div>
            <div class="maint-bar">
              <div class="maint-bar-fill {task.status}" style="width:{task.percent}%"></div>
            </div>
          </div>
          <button class="maint-tune{tune_class}">{icon("mdiCalendarEdit", 16)}</button>
          <button class="maint-bell {bell_class}">{icon(bell, 16)}</button>
          <button class="maint-done">{icon("mdiCheck", 16)}</button>
        </div>{editor}
      </div>"""


def build_rows(sort: str) -> str:
    """Mirror of _render_list(): grouped by device, or flat and due-first."""
    if sort == "device":
        rows = ""
        for device, tasks in GROUPS:
            rows += f'\n      <div class="maint-group-title">{device}</div>'
            rows += "".join(render_row(t) for t in tasks)
        return rows

    # compare_due(): soonest first, never-done tasks always last
    flat = [(d, t) for d, tasks in GROUPS for t in tasks]
    flat.sort(
        key=lambda dt: (
            dt[1].days_left is None,
            dt[1].days_left if dt[1].days_left is not None else 0,
            dt[0],
            dt[1].name,
        )
    )
    return "".join(render_row(t, d) for d, t in flat)


def build_html(sort: str = "device") -> str:
    rows = build_rows(sort)

    every = [t for g in GROUPS for t in g[1]]
    overdue = sum(1 for t in every if t.status == "overdue")
    warning = sum(1 for t in every if t.status == "warning")
    never = sum(1 for t in every if t.status == "never")

    badges = (
        f'<span class="maint-badge overdue">{overdue} overdue</span>'
        f'<span class="maint-badge warning">{warning} due soon</span>'
        f'<span class="maint-badge never">{never} never done</span>'
    )

    return f"""<!doctype html>
<html><head><meta charset="utf-8"><style>
  * {{ box-sizing: border-box; }}
  html {{ zoom: 2; }}
  body {{
    margin: 0; padding: 16px; width: 560px;
    background: #111417;
    font-family: Roboto, "Helvetica Neue", Arial, sans-serif;
  }}
  .ha-card {{
    background: {THEME["card"]};
    border-radius: 12px;
    padding: 12px 16px;
    box-shadow: 0 2px 6px rgba(0,0,0,.45);
  }}
  .maint-root {{
    display: flex; flex-direction: column; gap: 8px;
    padding: 8px 4px 12px 4px;
    color: {THEME["text"]}; font-size: 14px;
  }}
  .maint-header {{
    display: flex; flex-wrap: wrap; align-items: center;
    justify-content: space-between; gap: 8px;
    padding-bottom: 6px; border-bottom: 1px solid {THEME["divider"]};
  }}
  .maint-title {{
    display: flex; align-items: center; gap: 6px;
    font-size: 1.1em; font-weight: 600;
  }}
  .maint-counters {{ display: flex; flex-wrap: wrap; gap: 6px; }}
  .maint-badge {{
    border-radius: 12px; padding: 1px 8px;
    font-size: .75em; font-weight: 600; color: #fff; white-space: nowrap;
  }}
  .maint-badge.overdue {{ background-color: {THEME["overdue"]}; }}
  .maint-badge.warning {{ background-color: {THEME["warning"]}; }}
  .maint-badge.never   {{ background-color: {THEME["never"]}; }}

  .maint-toolbar {{
    display: flex; flex-wrap: wrap; align-items: center;
    justify-content: space-between; gap: 8px;
  }}
  .maint-sort {{
    display: inline-flex; border: 1px solid {THEME["divider"]};
    border-radius: 16px; overflow: hidden;
  }}
  .maint-sort button {{
    background: transparent; border: none; color: {THEME["soft"]};
    font-size: .8em; font-family: inherit; padding: 4px 12px;
  }}
  .maint-sort button.active {{
    background-color: {THEME["primary"]}; color: #fff; font-weight: 600;
  }}
  .maint-filters {{ display: inline-flex; align-items: center; gap: 10px; }}
  .maint-filter {{
    display: inline-flex; align-items: center; gap: 4px;
    color: {THEME["soft"]}; font-size: .8em;
  }}
  .maint-checkbox {{
    width: 12px; height: 12px; border: 1px solid {THEME["soft"]};
    border-radius: 2px; display: inline-block;
  }}
  .maint-mute-filter {{
    display: inline-flex; align-items: center; gap: 4px;
    background: transparent; border: 1px solid {THEME["divider"]};
    border-radius: 16px; color: {THEME["soft"]};
    font-family: inherit; font-size: .8em; padding: 3px 10px;
  }}

  .maint-group-title {{
    display: flex; align-items: center; gap: 6px; margin-top: 6px;
    color: {THEME["soft"]}; font-size: .85em; font-weight: 600;
    text-transform: uppercase; letter-spacing: .04em;
  }}
  .maint-row {{ display: flex; align-items: center; gap: 8px; padding: 4px 0; }}
  .maint-icon {{ display: inline-flex; }}
  .maint-body {{ flex: 1 1 auto; min-width: 0; }}
  .maint-line {{
    display: flex; align-items: baseline; justify-content: space-between; gap: 8px;
  }}
  .maint-name {{
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0;
  }}
  .maint-device {{ color: {THEME["soft"]}; font-size: .8em; }}
  .maint-remaining {{ flex: 0 0 auto; font-size: .85em; font-weight: 600; }}
  .maint-remaining.ok      {{ color: {THEME["ok"]}; }}
  .maint-remaining.warning {{ color: {THEME["warning"]}; }}
  .maint-remaining.overdue {{ color: {THEME["overdue"]}; }}
  .maint-remaining.never   {{ color: {THEME["never"]}; }}

  .maint-bar {{
    position: relative; height: 8px; margin-top: 3px; border-radius: 8px;
    background-color: {THEME["divider"]}; overflow: hidden;
  }}
  .maint-bar-fill {{ height: 100%; border-radius: 8px; }}
  .maint-bar-fill.ok      {{ background-color: {THEME["ok"]}; }}
  .maint-bar-fill.warning {{ background-color: {THEME["warning"]}; }}
  .maint-bar-fill.overdue {{ background-color: {THEME["overdue"]}; }}
  .maint-bar-fill.never   {{ background-color: {THEME["never"]}; }}

  .maint-done {{
    flex: 0 0 auto; background: transparent;
    border: 1px solid {THEME["divider"]}; border-radius: 50%;
    color: {THEME["soft"]}; display: inline-flex;
    align-items: center; justify-content: center;
    height: 26px; width: 26px; padding: 0;
  }}
  .maint-bell, .maint-tune {{
    flex: 0 0 auto; background: transparent; border: none;
    display: inline-flex; align-items: center; justify-content: center;
    height: 26px; width: 22px; padding: 0;
  }}
  .maint-bell.on  {{ color: {THEME["soft"]}; }}
  .maint-bell.off {{ color: {THEME["never"]}; }}
  .maint-tune      {{ color: {THEME["soft"]}; }}
  .maint-tune.open {{ color: {THEME["primary"]}; }}

  .maint-row.muted .maint-name,
  .maint-row.muted .maint-remaining,
  .maint-row.muted .maint-icon {{ opacity: .55; }}
  .maint-row.muted .maint-bar {{ opacity: .45; }}

  .maint-editor {{
    display: flex; flex-direction: column; gap: 4px;
    margin: 0 0 8px 28px; padding: 8px 10px; border-radius: 8px;
    background-color: rgba(127,127,127,.12);
  }}
  .maint-editor-line {{
    display: flex; align-items: center; justify-content: space-between; gap: 8px;
  }}
  .maint-editor-label {{ color: {THEME["soft"]}; font-size: .85em; }}
  .maint-editor-value {{ font-size: .9em; font-weight: 600; }}
  .maint-editor-bound {{
    color: {THEME["soft"]}; font-size: .75em; min-width: 1.5em; text-align: center;
  }}
  .maint-slider {{ flex: 1 1 auto; position: relative; height: 16px; }}
  .maint-slider-track {{
    position: absolute; top: 6px; left: 0; right: 0; height: 4px;
    border-radius: 4px; background: {THEME["divider"]};
  }}
  .maint-slider-fill {{
    height: 4px; border-radius: 4px; background: {THEME["primary"]};
  }}
  .maint-slider-thumb {{
    position: absolute; top: 3px; width: 11px; height: 11px; margin-left: -5px;
    border-radius: 50%; background: {THEME["primary"]};
  }}
</style></head>
<body>
  <div class="ha-card">
    <div class="maint-root">
      <div class="maint-header">
        <div class="maint-title">
          {icon("mdiWrenchClock", 20, THEME["text"])} Maintenance
        </div>
        <div class="maint-counters">{badges}</div>
      </div>
      <div class="maint-toolbar">
        <div class="maint-sort">
          <button class="{"active" if sort == "device" else ""}">By equipment</button>
          <button class="{"active" if sort == "due" else ""}">By due date</button>
        </div>
        <div class="maint-filters">
          <span class="maint-filter">
            <span class="maint-checkbox"></span> Hide up to date tasks
          </span>
          <span class="maint-mute-filter">
            {icon("mdiBell", 15)} <span>Hide muted</span>
          </span>
        </div>
      </div>{rows}
    </div>
  </div>
</body></html>"""


def build_editor_html() -> str:
    """Card editor of the maintenance pseudo device (renderEditor())."""
    return f"""<!doctype html>
<html><head><meta charset="utf-8"><style>
  * {{ box-sizing: border-box; }}
  html {{ zoom: 2; }}
  body {{
    margin: 0; padding: 16px; width: 400px; background: #111417;
    font-family: Roboto, "Helvetica Neue", Arial, sans-serif;
  }}
  .ha-card {{
    background: {THEME["card"]}; border-radius: 12px; padding: 12px 16px;
    box-shadow: 0 2px 6px rgba(0,0,0,.45);
  }}
  .maint-editor-form {{ color: {THEME["text"]}; font-size: .9em; padding: 4px 0; }}
  .maint-editor-form td {{ padding: 6px 0; white-space: nowrap; }}
  .maint-editor-form label {{ vertical-align: middle; }}
  .switch {{
    position: relative; display: inline-block; width: 30px; height: 17px;
    vertical-align: middle; margin-right: 8px;
  }}
  .slider {{
    position: absolute; top: 0; right: 0; bottom: 0; left: 0;
    background-color: {THEME["primary"]}; border-radius: 17px;
  }}
  .slider:before {{
    position: absolute; content: ""; height: 13px; width: 13px;
    left: 2px; bottom: 2px; background-color: #fff; border-radius: 50%;
    transform: translateX(13px);
  }}
</style></head>
<body>
  <div class="ha-card">
    <form class="maint-editor-form">
      <table><tr><td>
        <span class="switch"><span class="slider"></span></span>
        <label>Hide muted tasks by default</label>
      </td></tr></table>
    </form>
  </div>
</body></html>"""


def shoot(html: str, out: Path, width: int) -> None:
    """Render one HTML page to PNG. `width` is the 2x viewport."""
    src = Path("/tmp/maintenance_doc.html")
    src.write_text(html, encoding="utf-8")
    subprocess.run(
        [
            "wkhtmltoimage",
            # 2x viewport, paired with the CSS zoom, for a crisp doc image
            "--width", str(width),
            "--quality", "100",
            "--enable-local-file-access",
            "--transparent",
            str(src),
            str(out),
        ],
        check=True,
        capture_output=True,
    )
    # wkhtmltoimage writes uncompressed PNGs (several MB); repack them
    Image.open(out).save(out, optimize=True)
    print(f"written: {out} ({out.stat().st_size // 1024} kB)")


def main() -> None:
    out_dir = Path(sys.argv[1] if len(sys.argv) > 1 else "doc/img/maintenance")
    out_dir.mkdir(parents=True, exist_ok=True)
    shoot(build_html("device"), out_dir / "overview.png", 1120)
    shoot(build_html("due"), out_dir / "overview_due.png", 1120)
    shoot(build_editor_html(), out_dir / "editor.png", 800)


if __name__ == "__main__":
    main()
