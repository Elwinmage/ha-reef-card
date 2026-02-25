/**
 * Unit tests — base/dialog.ts (Dialog)
 *
 * Dialog is a LitElement that manages a modal window.
 * Pure-logic methods tested (no shadow-DOM rendering):
 *   - render_shell()          → returns the static HTML structure
 *   - set_conf()              → stores config
 *   - evaluate()              → delegates to SafeEval
 *   - quit()                  → hides dialog or reroutes to overload_quit
 *   - hass setter             → propagates to child elts
 *   - create_form()           → creates HTMLElement stubs
 *   - display()               → wires elt + to_render, calls _fill_content
 *   - createContext()         → builds SafeEval context
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { Dialog } from "../src/base/dialog";

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeHass(extra: Record<string, any> = {}): any {
  return {
    states: {
      "sensor.x": { entity_id: "sensor.x", state: "on", attributes: {} },
      ...extra,
    },
    callService: vi.fn(),
    devices: {},
    entities: [],
  };
}

function makeDevice(): any {
  return {
    entities: {},
    config: { color: "51,151,232", alpha: 0.8 },
    is_on: () => true,
  };
}

function makeElt(type = "default"): any {
  return {
    device: makeDevice(),
    get_entity: (k: string) => ({ entity_id: `sensor.${k}` }),
  };
}

// ── Stub Dialog to avoid abstract class issues ────────────────────────────────

class StubDialog extends Dialog {}

if (!customElements.get("stub-dialog-x"))
  customElements.define("stub-dialog-x", StubDialog);

// ── render_shell() ────────────────────────────────────────────────────────────

describe("Dialog.render_shell()", () => {
  it("returns a string containing #window-mask", () => {
    const d = new StubDialog() as any;
    const shell = d.render_shell();
    expect(shell).toContain("window-mask");
  });

  it("contains #dialog-title and #dialog-content slots", () => {
    const d = new StubDialog() as any;
    const shell = d.render_shell();
    expect(shell).toContain("dialog-title");
    expect(shell).toContain("dialog-content");
  });

  it("contains bt_left, bt_center, bt_right button slots", () => {
    const d = new StubDialog() as any;
    const shell = d.render_shell();
    expect(shell).toContain("bt_left");
    expect(shell).toContain("bt_center");
    expect(shell).toContain("bt_right");
  });
});

// ── set_conf() ────────────────────────────────────────────────────────────────

describe("Dialog.set_conf()", () => {
  it("stores the config object", () => {
    const d = new StubDialog() as any;
    const config = { my_dialog: { title_key: "hello", content: [] } };
    d.set_conf(config);
    expect(d.config).toBe(config);
  });
});

// ── quit() ───────────────────────────────────────────────────────────────────

describe("Dialog.quit()", () => {
  it("calls display() with overload_quit type when set", () => {
    const d = new StubDialog() as any;
    d.overload_quit = "next_screen";
    d.elt = makeElt();
    d.display = vi.fn();
    d.quit();
    expect(d.display).toHaveBeenCalledWith({ type: "next_screen", elt: d.elt });
  });

  it("hides the dialog box when no overload_quit", () => {
    const d = new StubDialog() as any;
    d.overload_quit = null;
    // Simulate a shadow-root with querySelector
    const box = { style: { display: "flex" } };
    d._shadowRoot = { querySelector: () => box };
    d.quit();
    expect(box.style.display).toBe("none");
    expect(d.elt).toBeNull();
    expect(d.to_render).toBeNull();
  });

  it("does nothing when _shadowRoot is null and no overload_quit", () => {
    const d = new StubDialog() as any;
    d.overload_quit = null;
    d._shadowRoot = null;
    expect(() => d.quit()).not.toThrow();
  });
});

// ── hass setter ───────────────────────────────────────────────────────────────

describe("Dialog hass setter", () => {
  it("updates _hass", () => {
    const d = new StubDialog() as any;
    const hass = makeHass();
    d.elts = [];
    d.hass = hass;
    expect(d._hass).toBe(hass);
  });

  it("propagates hass to child elts", () => {
    const d = new StubDialog() as any;
    const child = { hass: null };
    d.elts = [child];
    d.to_render = null;
    const hass = makeHass();
    d.hass = hass;
    expect(child.hass).toBe(hass);
  });
});

// ── create_form() ─────────────────────────────────────────────────────────────

describe("Dialog.create_form()", () => {
  it("returns empty array for empty input", () => {
    const d = new StubDialog() as any;
    d._shadowRoot = {
      ownerDocument: document,
      querySelector: () => null,
    };
    expect(d.create_form([])).toEqual([]);
  });

  it("creates an element for each input entry", () => {
    const d = new StubDialog() as any;
    d._shadowRoot = {
      ownerDocument: document,
      querySelector: () => null,
    };
    const result = d.create_form([
      { type: "input", id: "field_1" },
      { type: "select", id: "field_2" },
    ]);
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe("field_1");
    expect(result[1].id).toBe("field_2");
  });

  it("skips entries when _shadowRoot has no ownerDocument", () => {
    const d = new StubDialog() as any;
    d._shadowRoot = null;
    const result = d.create_form([{ type: "input", id: "x" }]);
    expect(result).toHaveLength(0);
  });
});

// ── evaluate() ────────────────────────────────────────────────────────────────

describe("Dialog.evaluate()", () => {
  it("evaluates a static string through SafeEval", () => {
    const d = new StubDialog() as any;
    d.elt = makeElt();
    const result = d.evaluate("'hello'");
    expect(result).toBe("hello");
  });

  it("evaluates a number expression", () => {
    const d = new StubDialog() as any;
    d.elt = makeElt();
    const result = d.evaluate("1 + 1");
    expect(result).toBe(2);
  });
});
