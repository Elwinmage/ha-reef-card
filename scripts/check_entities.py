#!/usr/bin/env python3
"""
check_entities.py
=================
Vérifie que toutes les entités HA déclarées dans ha-reefbeat-component
sont bien référencées dans la custom card ha-reef-card.

Étape 1 : Extraction AST des translation_keys par device et plateforme
Étape 2 : Extraction des entity keys référencées dans les fichiers TS de la card
Étape 3 : Rapport de couverture (présent / manquant)
"""

from __future__ import annotations

import ast
import json
import re
import subprocess
import sys
from collections import defaultdict
from pathlib import Path
from textwrap import indent

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
# Script lives in ha-reef-card/scripts/
# ha-reef-card/           = SCRIPT_DIR.parent
# ha-reefbeat-component/  = SCRIPT_DIR.parent.parent / "ha-reefbeat-component"
SCRIPT_DIR   = Path(__file__).resolve().parent
CARD_ROOT    = SCRIPT_DIR.parent                          # ha-reef-card/
CARD_DIR     = CARD_ROOT / "src"                          # ha-reef-card/src/
COMPONENT_ROOT = CARD_ROOT.parent / "ha-reefbeat-component"  # ../ha-reefbeat-component/
COMPONENT_DIR  = COMPONENT_ROOT / "custom_components" / "redsea"

COMPONENT_GIT_URL = "https://github.com/Elwinmage/ha-reefbeat-component"

# ---------------------------------------------------------------------------
# Coordinator → device mapping
# (from coordinator.py class hierarchy + auto_detect/config_flow context)
# ---------------------------------------------------------------------------
# Maps coordinator class names to canonical device short-names
COORDINATOR_TO_DEVICE: dict[str, list[str]] = {
    "ReefLedCoordinator":        ["rsled_g1"],
    "ReefLedG2Coordinator":      ["rsled_g2"],
    "ReefVirtualLedCoordinator": ["rsled_virtual"],
    "ReefMatCoordinator":        ["rsmat"],
    "ReefDoseCoordinator":       ["rsdose"],
    "ReefATOCoordinator":        ["rsato"],
    "ReefRunCoordinator":        ["rsrun"],
    "ReefWaveCoordinator":       ["rswave"],
    # Cloud coordinator — no card device
    "ReefBeatCloudCoordinator":  ["_cloud"],
    # Base / protocol guards used in isinstance() conditions
    "_CloudLinkedCoordinator":   ["rsled_g1", "rsled_g2", "rsled_virtual", "rsmat", "rsdose", "rsato", "rsrun", "rswave"],
    "ReefBeatCloudLinkedCoordinator": ["rsled_g1", "rsled_g2", "rsled_virtual", "rsmat", "rsdose", "rsato", "rsrun", "rswave"],
}

# Platforms we parse
PLATFORMS = [
    "switch", "sensor", "number", "select",
    "binary_sensor", "button", "light", "text", "time", "update",
]

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def flatten_isinstance_args(node: ast.expr) -> list[str]:
    """Return all class names from isinstance(x, Cls) or isinstance(x, (A, B, C))."""
    if isinstance(node, ast.Name):
        return [node.id]
    if isinstance(node, ast.Tuple):
        names = []
        for elt in node.elts:
            if isinstance(elt, ast.Name):
                names.append(elt.id)
        return names
    return []


def get_translation_key(node: ast.expr | None) -> str | None:
    """Extract translation_key='...' from a keyword arg or from a Call node."""
    if node is None:
        return None
    if isinstance(node, ast.Constant) and isinstance(node.value, str):
        return node.value
    return None


def extract_translation_keys_from_call(call: ast.Call) -> str | None:
    """From a Description(... translation_key='foo' ...) call, extract translation_key."""
    for kw in call.keywords:
        if kw.arg == "translation_key":
            return get_translation_key(kw.value)
    return None


def extract_translation_keys_from_collection(node: ast.expr) -> list[str]:
    """
    Given a tuple/list of description objects, extract all translation_key values.
    Handles:
      - Tuple/List of Call nodes (static lists like COMMON_SWITCHES)
      - A single Call node
    """
    keys: list[str] = []
    if isinstance(node, (ast.Tuple, ast.List)):
        for elt in node.elts:
            if isinstance(elt, ast.Call):
                tk = extract_translation_keys_from_call(elt)
                if tk:
                    keys.append(tk)
    elif isinstance(node, ast.Call):
        tk = extract_translation_keys_from_call(node)
        if tk:
            keys.append(tk)
    return keys


# ---------------------------------------------------------------------------
# Step 1 – AST extraction of component entities
# ---------------------------------------------------------------------------

class EntityExtractor(ast.NodeVisitor):
    """
    Walks a platform file and builds:
        { device_short_name -> { platform -> [translation_key, ...] } }

    Strategy:
    1. Collect all module-level var assignments of Description tuples/lists.
    2. Walk async_setup_entry body statement by statement.
       - Independent `if` blocks each carry their own guard (NOT accumulated).
       - `if/elif/else` chains share consumed context.
    3. When entities.extend() / entities.append() / _add_described_entities() is
       found, collect translation_keys from the iterated list (static var lookup
       or inline Description calls) and record them for active devices.
    """

    # All real device names we care about
    ALL_DEVICES: list[str] = ["rsled_g1", "rsled_g2", "rsled_virtual", "rsmat", "rsdose", "rsato", "rsrun", "rswave"]

    def __init__(self, platform: str) -> None:
        self.platform = platform
        # { var_name -> [translation_key, ...] }
        self.static_descs: dict[str, list[str]] = {}
        # result: device -> platform -> [translation_key]
        self.result: dict[str, dict[str, list[str]]] = defaultdict(lambda: defaultdict(list))

    # ------------------------------------------------------------------ #
    # Pass 1 – collect static description lists from module level         #
    # ------------------------------------------------------------------ #

    def visit_Module(self, node: ast.Module) -> None:
        for stmt in node.body:
            if isinstance(stmt, ast.Assign):
                self._collect_static(stmt)
            elif isinstance(stmt, ast.AnnAssign):
                # e.g. COMMON_SWITCHES: tuple[...] = (...)
                if isinstance(stmt.target, ast.Name) and stmt.value is not None:
                    keys = extract_translation_keys_from_collection(stmt.value)
                    if keys:
                        self.static_descs[stmt.target.id] = keys
        self.generic_visit(node)

    def _collect_static(self, node: ast.Assign) -> None:
        for target in node.targets:
            if not isinstance(target, ast.Name):
                continue
            keys = extract_translation_keys_from_collection(node.value)
            if keys:
                self.static_descs[target.id] = keys

    # ------------------------------------------------------------------ #
    # Pass 2 – walk async_setup_entry                                     #
    # ------------------------------------------------------------------ #

    def visit_AsyncFunctionDef(self, node: ast.AsyncFunctionDef) -> None:
        if node.name == "async_setup_entry":
            self._walk_stmts(node.body, active_devices=set(self.ALL_DEVICES))

    # ---- Core recursive walker ----

    def _walk_stmts(self, stmts: list[ast.stmt], active_devices: set[str]) -> None:
        """
        Walk a list of statements.  `active_devices` is the set of devices that
        could be active at this point in the code.

        Independent `if` blocks are handled by computing their own guard
        *relative to* active_devices — NOT relative to siblings.
        if/elif chains are handled with consumed tracking.
        """
        i = 0
        while i < len(stmts):
            stmt = stmts[i]
            if isinstance(stmt, ast.If):
                self._walk_if_chain(stmt, active_devices)
            else:
                self._walk_single_stmt(stmt, active_devices)
            i += 1

    def _walk_if_chain(self, node: ast.If, active_devices: set[str]) -> None:
        """
        Walk an if / elif* / else? chain.
        consumed tracks which coordinator classes have already matched
        (so elif branches implicitly exclude them).
        """
        consumed_classes: list[str] = []

        current: ast.If | None = node
        while current is not None:
            pos_cls, neg_cls = self._parse_test(current.test)

            # Restrict active to those matching this branch's guard
            branch_devices = self._apply_guard(
                active_devices, pos_cls, neg_cls + consumed_classes
            )
            self._walk_stmts(current.body, branch_devices)
            consumed_classes.extend(pos_cls)

            # Descend into else/elif
            if len(current.orelse) == 1 and isinstance(current.orelse[0], ast.If):
                current = current.orelse[0]
            else:
                if current.orelse:  # plain else
                    else_devices = self._apply_guard(
                        active_devices, [], consumed_classes
                    )
                    self._walk_stmts(current.orelse, else_devices)
                break

    # ---- Guard logic ----

    def _parse_test(self, test: ast.expr) -> tuple[list[str], list[str]]:
        """Return (positive_classes, negative_classes) from isinstance guards."""
        pos: list[str] = []
        neg: list[str] = []
        self._collect_isinstance(test, pos, neg, negated=False)
        return pos, neg

    def _collect_isinstance(
        self,
        node: ast.expr,
        pos: list[str],
        neg: list[str],
        negated: bool,
    ) -> None:
        if isinstance(node, ast.BoolOp) and isinstance(node.op, (ast.And, ast.Or)):
            for v in node.values:
                self._collect_isinstance(v, pos, neg, negated)
        elif isinstance(node, ast.UnaryOp) and isinstance(node.op, ast.Not):
            self._collect_isinstance(node.operand, pos, neg, not negated)
        elif isinstance(node, ast.Call):
            func = node.func
            if isinstance(func, ast.Name) and func.id == "isinstance" and len(node.args) >= 2:
                classes = flatten_isinstance_args(node.args[1])
                (neg if negated else pos).extend(classes)

    def _apply_guard(
        self,
        active: set[str],
        pos_classes: list[str],
        neg_classes: list[str],
    ) -> set[str]:
        """
        Given a set of currently active devices, apply isinstance() filters.

        - pos_classes: device must be one of these coordinator types
        - neg_classes: device must NOT be any of these coordinator types
        """
        def resolve(classes: list[str]) -> set[str]:
            devs: set[str] = set()
            for cls in classes:
                devs.update(COORDINATOR_TO_DEVICE.get(cls, []))
            return devs

        result = set(active)

        if pos_classes:
            allowed = resolve(pos_classes)
            result &= allowed

        if neg_classes:
            excluded = resolve(neg_classes)
            result -= excluded

        return result

    # ---- Call handlers ----

    def _handle_call(self, call: ast.Call, active_devices: set[str]) -> None:
        """Dispatch entities.extend / entities.append / _add_described_entities."""
        if not isinstance(call.func, ast.Attribute):
            return
        attr = call.func.attr

        if attr == "extend" and call.args:
            arg = call.args[0]
            if isinstance(arg, ast.GeneratorExp):
                keys = self._keys_from_generator(arg)
            elif isinstance(arg, (ast.List, ast.Tuple)):
                keys = self._keys_from_collection(arg)
            else:
                keys = []
            for k in keys:
                self._record(k, active_devices)

        elif attr == "append" and call.args:
            arg = call.args[0]
            tk = self._tk_from_entity_ctor(arg)
            if tk:
                self._record(tk, active_devices)

        # _add_described_entities(entities, device, EntityClass, DESCRIPTIONS)
        # The 4th positional arg is the descriptions list/variable
        elif attr == "extend" or (
            isinstance(call.func, ast.Name)
            and call.func.id == "_add_described_entities"  # type: ignore[union-attr]
        ):
            pass  # handled above

    # Also handle _add_described_entities called as a plain function
    def _handle_expr_call(self, call: ast.Call, active_devices: set[str]) -> None:
        """Handle _add_described_entities(entities, device, EntityClass, DESCRIPTIONS)."""
        func = call.func
        if isinstance(func, ast.Name) and func.id == "_add_described_entities":
            if len(call.args) >= 4:
                keys = self._keys_from_name_or_collection(call.args[3])
                for k in keys:
                    self._record(k, active_devices)

    def _walk_single_stmt(self, stmt: ast.stmt, active_devices: set[str]) -> None:
        """Handle a single non-if statement."""
        if isinstance(stmt, ast.Expr) and isinstance(stmt.value, ast.Call):
            call = stmt.value
            self._handle_call(call, active_devices)
            self._handle_expr_call(call, active_devices)
        elif isinstance(stmt, ast.For):
            self._walk_stmts(stmt.body, active_devices)
        elif isinstance(stmt, ast.Assign):
            for target in stmt.targets:
                if isinstance(target, ast.Name):
                    keys = extract_translation_keys_from_collection(stmt.value)
                    if keys:
                        self.static_descs[target.id] = keys
        elif isinstance(stmt, ast.AnnAssign):
            # `descs: list[...] = [...]`
            if isinstance(stmt.target, ast.Name) and stmt.value is not None:
                keys = extract_translation_keys_from_collection(stmt.value)
                if keys:
                    self.static_descs[stmt.target.id] = keys

    # ---- Key extraction helpers ----

    def _keys_from_generator(self, gen: ast.GeneratorExp) -> list[str]:
        keys: list[str] = []
        for comp in gen.generators:
            keys.extend(self._keys_from_name_or_collection(comp.iter))
        return keys

    def _keys_from_name_or_collection(self, node: ast.expr) -> list[str]:
        if isinstance(node, ast.Name):
            return list(self.static_descs.get(node.id, []))
        if isinstance(node, (ast.Tuple, ast.List)):
            return self._keys_from_collection(node)
        if isinstance(node, ast.Call):
            # tuple(ds) or list(ds)
            func = node.func
            if isinstance(func, ast.Name) and func.id in ("tuple", "list") and node.args:
                return self._keys_from_name_or_collection(node.args[0])
        return []

    def _keys_from_collection(self, node: ast.expr) -> list[str]:
        keys: list[str] = []
        if isinstance(node, (ast.Tuple, ast.List)):
            for elt in node.elts:
                if isinstance(elt, ast.Call):
                    tk = extract_translation_keys_from_call(elt)
                    if tk:
                        keys.append(tk)
        return keys

    def _tk_from_entity_ctor(self, node: ast.expr) -> str | None:
        if not isinstance(node, ast.Call):
            return None
        # Direct: DescriptionClass(... translation_key='foo' ...)
        tk = extract_translation_keys_from_call(node)
        if tk:
            return tk
        # Nested: EntityClass(device, DescriptionClass(...))
        if len(node.args) >= 2 and isinstance(node.args[1], ast.Call):
            return extract_translation_keys_from_call(node.args[1])
        return None

    # ---- Record ----

    def _record(self, translation_key: str, devices: set[str]) -> None:
        for dev in devices:
            if dev == "_cloud":
                continue
            lst = self.result[dev][self.platform]
            if translation_key not in lst:
                lst.append(translation_key)


def extract_component_entities(component_dir: Path) -> dict[str, dict[str, list[str]]]:
    """
    Returns: { device: { platform: [translation_key, ...] } }
    """
    result: dict[str, dict[str, list[str]]] = defaultdict(lambda: defaultdict(list))

    for platform in PLATFORMS:
        py_file = component_dir / f"{platform}.py"
        if not py_file.exists():
            continue

        src = py_file.read_text(encoding="utf-8")
        tree = ast.parse(src, filename=str(py_file))

        extractor = EntityExtractor(platform)
        extractor.visit(tree)

        # Merge
        for dev, platforms in extractor.result.items():
            for plat, keys in platforms.items():
                for k in keys:
                    if k not in result[dev][plat]:
                        result[dev][plat].append(k)

    return dict(result)


# ---------------------------------------------------------------------------
# Step 2 – Extract entity keys from the card's TypeScript files
# ---------------------------------------------------------------------------

# ---------------------------------------------------------------------------
# Patterns to find entity references in card TypeScript files
# ---------------------------------------------------------------------------

CARD_ENTITY_PATTERNS: list[re.Pattern[str]] = [
    # {"entity": "key"} ou {entity: "key"} (avec ou sans guillemets autour de la clé)
    re.compile(r'["\']?entity["\']?\s*:\s*["\']([a-z_][a-z0-9_]*)["\']'),
    # get_entity('key') or get_entity("key")
    re.compile(r'get_entity\([\'"]([a-z_][a-z0-9_]*)[\'"]'),
    # entities['key'] or entities["key"]
    re.compile(r"entities\[['\"]([ a-z_][a-z0-9_]*)['\"]"),
    # "name": "snake_case_key"  — element key names in mapping objects
    re.compile(r'["\']?name["\']?\s*:\s*["\']([a-z_][a-z0-9_]+)["\']'),
    # "entity_id": "key"
    re.compile(r'["\']?entity_id["\']?\s*:\s*["\']([a-z_][a-z0-9_]*)["\']'),
    # "target": "key"  — progress-bar / progress-circle / *-target elements
    # The "target" field references a second entity used as the goal value
    re.compile(r'["\']?target["\']?\s*:\s*["\']([a-z_][a-z0-9_]*)["\']'),
    # ${entity.key.state} — inline template expressions
    re.compile(r'\$\{entity\.([a-z_][a-z0-9_]*)'),
]

# Known short entity keys that must not be filtered by the noise exclusion
_SHORT_ENTITY_KEYS: frozenset[str] = frozenset({'ip'})

# Map card device folder name → canonical device name
# rsled folder contains both G1 (rsled.mapping.ts) and G2 (rsled_g2.mapping.ts)
# We map all three logical devices to the same folder; filtering is done by
# restricting which TS files are scanned per variant (see DEVICE_TS_FILTER).
CARD_DEVICE_FOLDERS: dict[str, str] = {
    "rsdose":       "rsdose",
    "rsled_g1":     "rsled",
    "rsled_g2":     "rsled",
    "rsled_virtual":"rsled",
    "rsato":        "rsato",
    "rsrun":        "rsrun",
    "rswave":       "rswave",
    "rsmat":        "rsmat",
}

# Restrict TS file scanning per device variant.
# Key: device name. Value: set of filename patterns to INCLUDE (None = all files).
# This lets us give rsled_g1 only rsled.mapping.ts and rsled_g2 only rsled_g2.mapping.ts.
DEVICE_TS_INCLUDE: dict[str, set[str] | None] = {
    "rsled_g1":      {"rsled.mapping.ts", "rsled.ts", "index.ts"},
    "rsled_g2":      {"rsled_g2.mapping.ts", "rsled.ts", "index.ts"},
    "rsled_virtual": {"rsled.mapping.ts", "rsled.ts", "index.ts"},  # virtual uses same UI as G1 for now
}

# device.dialogs.ts is imported by ALL real devices via:
#   import {dialogs_device} from "../device.dialogs"
# Its entities are therefore available to every device.
SHARED_DIALOG_FILE = "devices/device.dialogs.ts"

# Per-device extra dialog files (in addition to the shared one)
DEVICE_EXTRA_DIALOG_FILES: dict[str, list[str]] = {
    "rsdose": ["devices/rsdose/rsdose.dialogs.ts"],
}


def extract_card_entities(card_src_dir: Path) -> dict[str, set[str]]:
    """
    Returns: { device: set(entity_key) }

    For each device we collect:
      1. All entity/target/name keys from the device folder's .ts files
      2. Keys from device.dialogs.ts (common to ALL devices via import)
      3. Keys from any per-device extra dialog files
    """
    # Step A: shared dialog entities (common to all devices)
    shared_keys: set[str] = set()
    shared_file = card_src_dir / SHARED_DIALOG_FILE
    if shared_file.exists():
        shared_keys = _extract_keys_from_ts_file(shared_file)

    result: dict[str, set[str]] = {}

    for folder, device in CARD_DEVICE_FOLDERS.items():
        device_keys: set[str] = set(shared_keys)
        include_filter = DEVICE_TS_INCLUDE.get(device)  # None = include all

        # Per-device folder: all .ts files (filtered if needed)
        folder_path = card_src_dir / "devices" / folder
        if folder_path.exists():
            for ts_file in folder_path.rglob("*.ts"):
                if "supplements_list" in ts_file.name:
                    continue
                if include_filter is not None and ts_file.name not in include_filter:
                    continue
                device_keys.update(_extract_keys_from_ts_file(ts_file))

        # Extra per-device dialog files
        for rel in DEVICE_EXTRA_DIALOG_FILES.get(device, []):
            extra = card_src_dir / rel
            if extra.exists():
                device_keys.update(_extract_keys_from_ts_file(extra))

        result[device] = device_keys

    return result


def _extract_keys_from_ts_file(path: Path) -> set[str]:
    content = path.read_text(encoding="utf-8")
    keys: set[str] = set()
    for pattern in CARD_ENTITY_PATTERNS:
        for m in pattern.finditer(content):
            k = m.group(1).strip()
            # Keep known short keys (e.g. 'ip'); skip mdi icons, CSS, single chars
            if not k:
                continue
            if k in _SHORT_ENTITY_KEYS:
                keys.add(k)
                continue
            if (len(k) >= 3
                    and not k.startswith('mdi')
                    and not k.startswith('rgb')
                    and not k.startswith('rgba')):
                keys.add(k)
    return keys


# ---------------------------------------------------------------------------
# Step 3 – Cross-check and report
# ---------------------------------------------------------------------------

DEVICES = ["rsdose", "rsled_g1", "rsled_g2", "rsled_virtual", "rsato", "rsrun", "rswave", "rsmat"]

# Some translation_keys are template-based (per head/pump) and the card uses
# the base key without the suffix. We strip known suffixes for comparison.
STRIP_SUFFIXES_RE = re.compile(
    r"_(head|pump|head_\d+|pump_\d+|\d+)$"
    r"|_head_\d+_\w+$"
)


def normalize_key(key: str) -> str:
    """Strip per-instance suffixes to get the base translation key."""
    return STRIP_SUFFIXES_RE.sub("", key)


# ---------------------------------------------------------------------------
# Ignore-list helpers
# ---------------------------------------------------------------------------

IgnoreList = dict[str, dict[str, list[str]]]  # { device: { platform: [key, ...] } }
DevInProgressList = list[str]  # ["rsdose", "rsmat", ...]


def load_ignore_list(path: Path) -> tuple[IgnoreList, DevInProgressList]:
    """
    Load an optional JSON ignore-list.

    Expected format::

        {
          "dev_in_progress": ["rsmat", "rsdose"],
          "ignore": {
            "rsdose": {
              "switch": ["cloud_connect", "use_cloud_api"],
              "sensor": ["mode"]
            },
            "*": {
              "button": ["fetch_config", "firmware_update", "reset"]
            }
          }
        }

    The special device key ``"*"`` applies to every device.
    Devices in "dev_in_progress" will show missing entities but won't cause exit code 1.
    """
    if not path.exists():
        return {}, []
    try:
        raw = json.loads(path.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError) as exc:
        print(f"{YELLOW}Avertissement : impossible de lire {path} : {exc}{RESET}")
        return {}, []
    
    # Support both old format (direct ignore dict) and new format (with dev_in_progress)
    if "ignore" in raw or "dev_in_progress" in raw:
        ignore_list = raw.get("ignore", {})
        dev_in_progress = raw.get("dev_in_progress", [])
    else:
        # Old format: assume entire file is the ignore dict
        ignore_list = raw
        dev_in_progress = []
    
    return ignore_list, dev_in_progress  # type: ignore[return-value]


def _ignored_keys_for(ignore: IgnoreList, device: str, platform: str) -> set[str]:
    """Return the set of keys that are explicitly ignored for (device, platform)."""
    result: set[str] = set()
    for dev_key in (device, "*"):
        dev_block = ignore.get(dev_key, {})
        for k in dev_block.get(platform, []):
            result.add(k)
            result.add(normalize_key(k))  # also match the base key
    return result


def cross_check(
    component: dict[str, dict[str, list[str]]],
    card: dict[str, set[str]],
    ignore: IgnoreList | None = None,
) -> dict[str, dict[str, dict[str, list[str]]]]:
    """
    Returns::

        { device: { platform: { "present": [...], "missing": [...], "ignored": [...] } } }
    """
    if ignore is None:
        ignore = {}
    report: dict[str, dict[str, dict[str, list[str]]]] = {}

    for device in DEVICES:
        report[device] = {}
        card_keys = card.get(device, set())
        platforms_data = component.get(device, {})

        for platform, trans_keys in sorted(platforms_data.items()):
            ignored_keys = _ignored_keys_for(ignore, device, platform)
            present: list[str] = []
            missing: list[str] = []
            ignored: list[str] = []

            for tk in sorted(set(trans_keys)):
                base = normalize_key(tk)
                if tk in card_keys or base in card_keys:
                    present.append(tk)
                elif tk in ignored_keys or base in ignored_keys:
                    ignored.append(tk)
                else:
                    missing.append(tk)

            report[device][platform] = {
                "present": present,
                "missing": missing,
                "ignored": ignored,
            }

    return report


# ---------------------------------------------------------------------------
# Pretty-print helpers
# ---------------------------------------------------------------------------

RESET  = "\033[0m"
GREEN  = "\033[92m"
RED    = "\033[91m"
YELLOW = "\033[93m"
BOLD   = "\033[1m"
CYAN   = "\033[96m"
DIM    = "\033[2m"


def print_report(
    report: dict[str, dict[str, dict[str, list[str]]]],
    component: dict[str, dict[str, list[str]]],
    card: dict[str, set[str]],
    dev_in_progress: DevInProgressList | None = None,
    verbose: bool = True,
) -> int:
    """
    Print the coverage report.
    
    Returns:
        Number of MISSING entities that are NOT in dev_in_progress devices (i.e., actual errors).
    """
    if dev_in_progress is None:
        dev_in_progress = []
    
    print(f"\n{BOLD}{'='*70}{RESET}")
    print(f"{BOLD}  HA ReefBeat  —  Component ↔ Card entity coverage report{RESET}")
    print(f"{BOLD}{'='*70}{RESET}\n")

    total_present = 0
    total_missing = 0
    total_ignored = 0
    total_missing_errors = 0  # Missing entities NOT in dev devices
    # Per-device totals for final summary table
    dev_totals: list[tuple[str, int, int, int, int, bool]] = []  # (device, total, present, ignored, missing, is_dev)

    for device in DEVICES:
        device_data = report[device]
        dev_present = sum(len(v["present"]) for v in device_data.values())
        dev_missing = sum(len(v["missing"]) for v in device_data.values())
        dev_ignored = sum(len(v.get("ignored", [])) for v in device_data.values())
        dev_total = dev_present + dev_ignored + dev_missing
        is_dev = device in dev_in_progress
        
        total_present += dev_present
        total_missing += dev_missing
        total_ignored += dev_ignored
        if not is_dev:
            total_missing_errors += dev_missing
        
        dev_totals.append((device, dev_total, dev_present, dev_ignored, dev_missing, is_dev))

        status_color = GREEN if dev_missing == 0 else (YELLOW if is_dev else RED)
        ignored_note = f"  {DIM}~ {dev_ignored}{RESET}" if dev_ignored else ""
        dev_label = f" {YELLOW}[DEV]{RESET}" if is_dev else ""
        print(
            f"{BOLD}{CYAN}◆ {device.upper()}{RESET}{dev_label}  "
            f"{status_color}{dev_present} présent(s){RESET}  "
            f"{status_color if dev_missing else DIM}{dev_missing} manquant(s){RESET}"
            f"{ignored_note}"
        )

        for platform, data in sorted(device_data.items()):
            present = data["present"]
            missing = data["missing"]
            ignored = data.get("ignored", [])
            p_str = f"{GREEN}✓ {len(present)}{RESET}"
            m_color = YELLOW if is_dev and missing else (RED if missing else DIM)
            m_str = f"{m_color}✗ {len(missing)}{RESET}" if missing else f"{DIM}✗ 0{RESET}"
            i_str = f"  {DIM}~ {len(ignored)}{RESET}" if ignored else ""
            print(f"  {BOLD}{platform:<16}{RESET}  {p_str}  {m_str}{i_str}")

            if verbose and present:
                for k in present:
                    print(f"    {GREEN}✓{RESET} {k}")
            if missing:
                miss_color = YELLOW if is_dev else RED
                miss_label = "MISSING (DEV)" if is_dev else "MISSING"
                for k in missing:
                    print(f"    {miss_color}✗ {miss_label}:{RESET} {BOLD}{k}{RESET}")
            if ignored:
                for k in ignored:
                    print(f"    {DIM}~{RESET} IGNORE  {k}")

        print()

    # ── Summary table ───────────────────────────────────────────────────────
    grand_total = total_present + total_ignored + total_missing
    pct = (total_present / grand_total * 100) if grand_total else 0
    color = GREEN if total_missing == 0 else (YELLOW if pct > 80 else RED)

    W = 10  # column width for numbers
    print(f"{BOLD}{'─'*70}{RESET}")
    print(f"{BOLD}  {'DEVICE':<12}  {'TOTAL':>{W}}  {GREEN}✓ FOUND{RESET}{BOLD}  {DIM}~ IGNORE{RESET}{BOLD}  {RED}✗ MISSING{RESET}{BOLD}{RESET}")
    print(f"{BOLD}  {'─'*12}  {'─'*W}  {'─'*W}  {'─'*W}  {'─'*W}{RESET}")
    for device, dtotal, dpresent, dignored, dmissing, is_dev in dev_totals:
        m_color = YELLOW if is_dev and dmissing else (RED if dmissing else DIM)
        dev_mark = f" {YELLOW}[DEV]{RESET}" if is_dev else ""
        print(
            f"  {BOLD}{CYAN}{device:<12}{RESET}{dev_mark if not is_dev else ''}"
            f"  {dtotal:>{W}}"
            f"  {GREEN}✓{RESET} {dpresent:<{W-2}}"
            f"  {DIM}~{RESET} {dignored:<{W-2}}"
            f"  {m_color}✗{RESET} {dmissing:<{W-2}}"
        )
    print(f"{BOLD}  {'─'*12}  {'─'*W}  {'─'*W}  {'─'*W}  {'─'*W}{RESET}")
    print(
        f"  {BOLD}{'TOTAL':<12}{RESET}"
        f"  {grand_total:>{W}}"
        f"  {GREEN}✓{RESET} {total_present:<{W-2}}"
        f"  {DIM}~{RESET} {total_ignored:<{W-2}}"
        f"  {RED if total_missing else DIM}✗{RESET} {total_missing:<{W-2}}"
    )
    print(f"{BOLD}{'─'*70}{RESET}")
    print(f"  {BOLD}Couverture :{RESET}  {color}{total_present}/{grand_total}  ({pct:.1f}%){RESET}")
    if total_missing_errors == 0:
        print(f"  {GREEN}{BOLD}✓ Toutes les entités sont présentes (ou ignorées) !{RESET}")
    elif total_missing_errors != total_missing:
        print(f"  {YELLOW}{BOLD}⚠ {total_missing - total_missing_errors} entités manquantes dans des devices en développement{RESET}")
        print(f"  {RED}{BOLD}✗ {total_missing_errors} entités manquantes à corriger !{RESET}")
    else:
        print(f"  {RED}{BOLD}✗ {total_missing_errors} entités manquantes à corriger !{RESET}")
    print()
    
    return total_missing_errors


# ---------------------------------------------------------------------------
# JSON dump
# ---------------------------------------------------------------------------

def dump_json(
    component: dict[str, dict[str, list[str]]],
    card: dict[str, set[str]],
    report: dict[str, dict[str, dict[str, list[str]]]],
    out_path: Path,
    ignore: IgnoreList | None = None,
) -> None:
    data = {
        "component_entities": {
            dev: {plat: sorted(set(keys)) for plat, keys in plats.items()}
            for dev, plats in component.items()
            if dev in DEVICES
        },
        "card_entities": {
            dev: sorted(keys) for dev, keys in card.items()
        },
        "coverage_report": report,
        "ignore_list": ignore or {},
    }
    out_path.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Résultat JSON écrit dans : {out_path}\n")


# ---------------------------------------------------------------------------
# Markdown report
# ---------------------------------------------------------------------------

def dump_markdown(
    report: dict[str, dict[str, dict[str, list[str]]]],
    component: dict[str, dict[str, list[str]]],
    out_path: Path,
    ignore: IgnoreList | None = None,
) -> None:
    """Write a GitHub-flavoured Markdown report."""
    from datetime import datetime

    lines: list[str] = []
    a = lines.append

    a("# HA ReefBeat — Entity coverage report")
    a("")
    a(f"*Generated on {datetime.now().strftime('%Y-%m-%d %H:%M')}*")
    a("")

    # ── Global summary table ────────────────────────────────────────────────
    a("## Summary")
    a("")
    a("| Device | Total | ✅ Found | ⚪ Ignored | ❌ Missing | Coverage |")
    a("|--------|------:|---------:|----------:|----------:|----------|")

    grand_total = grand_present = grand_ignored = grand_missing = 0
    for device in DEVICES:
        device_data = report[device]
        dp = sum(len(v["present"]) for v in device_data.values())
        dm = sum(len(v["missing"]) for v in device_data.values())
        di = sum(len(v.get("ignored", [])) for v in device_data.values())
        dt = dp + dm + di
        grand_total += dt
        grand_present += dp
        grand_ignored += di
        grand_missing += dm
        pct = (dp / dt * 100) if dt else 0
        bar = "🟢" if dm == 0 else ("🟡" if pct > 80 else "🔴")
        a(f"| **{device}** | {dt} | {dp} | {di} | {dm} | {bar} {pct:.0f}% |")

    grand_pct = (grand_present / grand_total * 100) if grand_total else 0
    grand_bar = "🟢" if grand_missing == 0 else ("🟡" if grand_pct > 80 else "🔴")
    a(f"| **TOTAL** | **{grand_total}** | **{grand_present}** | **{grand_ignored}** | **{grand_missing}** | {grand_bar} **{grand_pct:.0f}%** |")
    a("")

    # ── Per-device detail ───────────────────────────────────────────────────
    a("## Detail by device")
    a("")

    for device in DEVICES:
        device_data = report[device]
        dp = sum(len(v["present"]) for v in device_data.values())
        dm = sum(len(v["missing"]) for v in device_data.values())
        di = sum(len(v.get("ignored", [])) for v in device_data.values())
        status = "🟢" if dm == 0 else ("🟡" if dm < 5 else "🔴")
        a(f"### {status} {device.upper()}")
        a("")
        a(f"| Platform | Total | ✅ Found | ⚪ Ignored | ❌ Missing |")
        a("|----------|------:|---------:|----------:|----------:|")
        for platform, data in sorted(device_data.items()):
            pp = len(data["present"])
            pm = len(data["missing"])
            pi = len(data.get("ignored", []))
            pt = pp + pm + pi
            row_icon = "✅" if pm == 0 else "❌"
            a(f"| {row_icon} `{platform}` | {pt} | {pp} | {pi} | {pm} |")
        a("")

        # Missing entities detail (only if any)
        all_missing = [
            (plat, k)
            for plat, data in sorted(device_data.items())
            for k in data["missing"]
        ]
        if all_missing:
            a("<details>")
            a(f"<summary>❌ Missing entities ({len(all_missing)})</summary>")
            a("")
            a("| Platform | Entity key |")
            a("|----------|------------|")
            for plat, k in all_missing:
                a(f"| `{plat}` | `{k}` |")
            a("")
            a("</details>")
            a("")

        # Ignored entities detail (only if any)
        all_ignored = [
            (plat, k)
            for plat, data in sorted(device_data.items())
            for k in data.get("ignored", [])
        ]
        if all_ignored:
            a("<details>")
            a(f"<summary>⚪ Ignored entities ({len(all_ignored)})</summary>")
            a("")
            a("| Platform | Entity key |")
            a("|----------|------------|")
            for plat, k in all_ignored:
                a(f"| `{plat}` | `{k}` |")
            a("")
            a("</details>")
            a("")

    out_path.write_text("\n".join(lines), encoding="utf-8")
    print(f"Rapport Markdown écrit dans : {out_path}\n")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def ensure_component() -> None:
    """Clone ha-reefbeat-component from GitHub if the directory doesn't exist."""
    if COMPONENT_ROOT.exists():
        return

    print(f"{YELLOW}ha-reefbeat-component non trouvé à : {COMPONENT_ROOT}{RESET}")
    print(f"Clonage depuis {COMPONENT_GIT_URL} …")
    try:
        subprocess.run(
            ["git", "clone", "--depth=1", COMPONENT_GIT_URL, str(COMPONENT_ROOT)],
            check=True,
        )
        print(f"{GREEN}✓ Clonage terminé.{RESET}")
    except FileNotFoundError:
        print(f"{RED}Erreur : git n'est pas installé ou introuvable dans PATH.{RESET}", file=sys.stderr)
        sys.exit(1)
    except subprocess.CalledProcessError as exc:
        print(f"{RED}Erreur lors du clonage (code {exc.returncode}).{RESET}", file=sys.stderr)
        sys.exit(1)

    if not COMPONENT_DIR.exists():
        print(
            f"{RED}Erreur : le dossier attendu n'existe pas après clonage :\n"
            f"  {COMPONENT_DIR}{RESET}",
            file=sys.stderr,
        )
        sys.exit(1)


def print_help() -> None:
    B, R, C, G, Y, D = BOLD, RESET, CYAN, GREEN, YELLOW, DIM
    script = Path(sys.argv[0]).name
    print(f"""
{B}Usage:{R}
  {G}python3 {script}{R} [options]

{B}Description:{R}
  Checks that every HA entity declared in {C}ha-reefbeat-component{R}
  is referenced in the custom card {C}ha-reef-card{R}.

  The script must be run from {C}ha-reef-card/scripts/{R}.
  If {C}ha-reefbeat-component{R} is not found, it is cloned automatically from:
    {D}{COMPONENT_GIT_URL}{R}

{B}Options:{R}
  {G}--quiet{R}
      Do not list entities that are already present in the card.
      Only missing and ignored entities are shown.

  {G}--ignore=<file.json>{R}
      Load a list of entities intentionally absent from the card.
      Default: {D}scripts/check_entities_ignore.json{R} (if present).
      Format:
        {{
          "dev_in_progress": ["rsmat", "rsdose"],
          "ignore": {{
            "*":      {{ "button": ["fetch_config", "reset"] }},
            "rsdose": {{ "sensor": ["mode", "last_calibration"] }}
          }}
        }}
      
      {B}dev_in_progress{R}: List of devices under active development.
          Missing entities in these devices are shown as {Y}✗ MISSING (DEV){R}
          but do NOT cause exit code 1 (CI/CD will pass).
      
      {B}ignore{R}: Entities intentionally not implemented in the card.
          The special key {C}"*"{R} applies to every device.
          These entities are shown as {D}~ IGNORE{R}.
      
      {B}Old format{R}: For backward compatibility, a file containing only the
          ignore dict (without "dev_in_progress") is still supported.

  {G}--json=<file.json>{R}
      Write the full report as JSON to the given file.
      Default: {D}scripts/check_entities_report.json{R}.

  {G}--markdown{R}
      Generate a GitHub Markdown report at {D}scripts/check_entities_report.md{R}.

  {G}--markdown=<file.md>{R}
      Generate the Markdown report at the given path.

  {G}--help{R}, {G}-h{R}
      Show this message and exit.

{B}Exit Codes:{R}
  {G}0{R}  All entities present or ignored (including dev devices)
  {G}1{R}  One or more entities missing in non-dev devices

{B}Examples:{R}
  {D}# Full report (console + auto JSON){R}
  python3 {script}

  {D}# Suppress the list of already-present entities{R}
  python3 {script} --quiet

  {D}# Also generate a Markdown report{R}
  python3 {script} --markdown

  {D}# Use a custom ignore file{R}
  python3 {script} --ignore=../my_ignore.json

  {D}# All-in-one{R}
  python3 {script} --quiet --markdown=../COVERAGE.md --ignore=check_entities_ignore.json
""")


def main() -> None:
    verbose = "--quiet" not in sys.argv
    json_out: Path | None = None
    md_out: Path | None = None
    ignore_path: Path | None = None

    for arg in sys.argv[1:]:
        if arg in ("--help", "-h"):
            print_help()
            sys.exit(0)
        elif arg.startswith("--json="):
            json_out = Path(arg.split("=", 1)[1])
        elif arg.startswith("--markdown="):
            md_out = Path(arg.split("=", 1)[1])
        elif arg == "--markdown":
            md_out = SCRIPT_DIR / "check_entities_report.md"
        elif arg.startswith("--ignore="):
            ignore_path = Path(arg.split("=", 1)[1])

    # Default ignore file: check_entities_ignore.json next to this script
    if ignore_path is None:
        default_ignore = SCRIPT_DIR / "check_entities_ignore.json"
        if default_ignore.exists():
            ignore_path = default_ignore

    # ---- Ensure the component repo is available ----
    ensure_component()

    print(f"  Composant : {COMPONENT_DIR}")
    print(f"  Card      : {CARD_DIR}")

    ignore: IgnoreList = {}
    dev_in_progress: DevInProgressList = []
    if ignore_path is not None:
        ignore, dev_in_progress = load_ignore_list(ignore_path)
        ignore_count = sum(len(p) for d in ignore.values() for p in d.values())
        if ignore:
            print(f"  Ignore    : {ignore_path}  ({ignore_count} entité(s) ignorée(s))")
        if dev_in_progress:
            print(f"  Dev       : {len(dev_in_progress)} device(s) en développement : {', '.join(dev_in_progress)}")
    print()

    print("Extraction des entités du composant (AST)…")
    component = extract_component_entities(COMPONENT_DIR)

    print("Extraction des entités de la card (TypeScript)…")
    card = extract_card_entities(CARD_DIR)

    print("Vérification croisée…")
    report = cross_check(component, card, ignore=ignore)

    error_count = print_report(report, component, card, dev_in_progress=dev_in_progress, verbose=verbose)

    if json_out:
        dump_json(component, card, report, json_out, ignore=ignore)
    else:
        # Dump JSON next to this script (ha-reef-card/scripts/)
        default_json = SCRIPT_DIR / "check_entities_report.json"
        dump_json(component, card, report, default_json, ignore=ignore)

    if md_out:
        dump_markdown(report, component, md_out, ignore=ignore)

    # Exit with error code 1 if there are missing entities (excluding dev devices)
    if error_count > 0:
        print(f"\n{RED}Échec : {error_count} entité(s) manquante(s) à corriger.{RESET}")
        sys.exit(1)
    else:
        sys.exit(0)


if __name__ == "__main__":
    main()
