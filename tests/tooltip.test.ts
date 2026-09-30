/**
 * Tests for the native tooltips of the card elements.
 *
 * Every element tells, on mouse over, what it shows and what a click, a
 * double click or a hold would do, so nothing has to be pressed to find
 * out. Actionable elements are also exposed as focusable buttons named by
 * that text, for keyboards and screen readers.
 *
 * Covers: tooltip part of src/base/element.ts
 */

import { afterEach, describe, expect, it, vi } from "vitest";
import { html } from "lit";
import { MyElement } from "../src/base/element";

class TipStub extends MyElement {
  protected override _render(_style: string) {
    return html`<span>x</span>`;
  }
}
if (!customElements.get("tip-stub")) customElements.define("tip-stub", TipStub);

afterEach(() => {
  document.body.querySelectorAll("tip-stub").forEach((el) => el.remove());
});

function makeHass(): any {
  return {
    states: {
      "sensor.battery": {
        entity_id: "sensor.battery",
        state: "85",
        attributes: {
          friendly_name: "Battery level",
          unit_of_measurement: "%",
        },
      },
      "switch.maintenance": {
        entity_id: "switch.maintenance",
        state: "off",
        attributes: { friendly_name: "Maintenance" },
      },
      "button.feed": {
        entity_id: "button.feed",
        state: "unknown",
        attributes: { friendly_name: "Feed mode" },
      },
    },
    formatEntityState: (st: any) =>
      `${st.state}${st.attributes.unit_of_measurement ? " " + st.attributes.unit_of_measurement : ""}`,
    callService: vi.fn(),
  };
}

function makeDevice(): any {
  return {
    entities: {
      battery_level: { entity_id: "sensor.battery" },
      maintenance: { entity_id: "switch.maintenance" },
      feed: { entity_id: "button.feed" },
    },
    config: { color: "0,0,0", alpha: 1, id: 3 },
    dialogs: {
      wifi: { title_key: "${i18n._('wifi')}" },
      head: { title_key: "Head <b>n°${config.id}</b>" },
    },
    is_on: () => true,
    masterOn: true,
  };
}

function build(conf: any): any {
  return MyElement.create_element(
    makeHass(),
    { type: "tip-stub", ...conf },
    makeDevice(),
  );
}

async function mount(conf: any): Promise<any> {
  const el = build(conf);
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

describe("tooltip content", () => {
  it("names the entity and its value", () => {
    const el = build({ name: "battery_level", label: false });
    expect(el.get_tooltip()).toBe("Battery level: 85 %");
  });

  it("tells what a click opens, with the dialog title", () => {
    const el = build({
      name: "battery_level",
      tap_action: {
        domain: "redsea_ui",
        action: "dialog",
        data: { type: "wifi" },
      },
    });
    expect(el.get_tooltip()).toBe("Battery level: 85 %\nClick: open Wifi");
  });

  it("evaluates the dialog title against the device, text only", () => {
    const el = build({
      stateObj: null,
      tap_action: {
        domain: "redsea_ui",
        action: "dialog",
        data: { type: "head" },
      },
    });
    expect(el.get_tooltip()).toBe("Click: open Head n°3");
  });

  it("falls back to a generic text for an unknown dialog", () => {
    const el = build({
      stateObj: null,
      tap_action: {
        domain: "redsea_ui",
        action: "dialog",
        data: { type: "nope" },
      },
    });
    expect(el.get_tooltip()).toBe("Click: open a dialog");
  });

  it("describes services, and names the entity they act on", () => {
    const el = build({
      name: "maintenance",
      tap_action: { domain: "switch", action: "toggle", data: "default" },
      hold_action: [
        { domain: "button", action: "press", data: { entity_id: "feed" } },
        { domain: "redsea_ui", action: "wait", data: 2 },
      ],
      double_tap_action: {
        domain: "number",
        action: "set_value",
        data: { entity_id: "feed" },
      },
    });
    expect(el.get_tooltip()).toBe(
      "Maintenance: off\n" +
        "Click: toggle\n" +
        "Double click: run Feed mode\n" +
        "Long press: press Feed mode",
    );
  });

  it("describes the other card actions", () => {
    const el = build({
      stateObj: null,
      tap_action: [
        { domain: "redsea_ui", action: "more-info", data: "battery_level" },
        { domain: "redsea_ui", action: "exit-dialog" },
      ],
      hold_action: { domain: "redsea_ui", action: "show_device", data: "x" },
      double_tap_action: {
        domain: "redsea_ui",
        action: "open_schedule",
        data: "s",
      },
    });
    expect(el.get_tooltip()).toBe(
      "Click: show details, close\n" +
        "Double click: edit the schedule\n" +
        "Long press: show the linked device",
    );
  });

  it("ignores disabled actions", () => {
    const el = build({
      name: "maintenance",
      hold_action: {
        enabled: false,
        domain: "switch",
        action: "toggle",
        data: "default",
      },
    });
    expect(el.get_tooltip()).toBe("Maintenance: off");
    expect(el.is_actionable()).toBe(false);
  });

  it("uses the label of an element without entity", () => {
    const el = build({ stateObj: null, label: "'Save'" });
    el.label = "Save";
    expect(el.get_tooltip()).toBe("Save");
  });

  it("honours a tooltip set in the configuration", () => {
    expect(
      build({ name: "battery_level", tooltip: "wifi" }).get_tooltip(),
    ).toBe("Wifi");
    expect(
      build({ name: "battery_level", tooltip: "Plain text" }).get_tooltip(),
    ).toBe("Plain text");
    expect(
      build({
        name: "battery_level",
        tooltip: "${stateObj.state} left",
      }).get_tooltip(),
    ).toBe("85 left");
    expect(build({ name: "battery_level", tooltip: false }).get_tooltip()).toBe(
      "",
    );
  });
});

describe("tooltip rendering", () => {
  it("puts the tooltip on the wrapper and exposes a button", async () => {
    const el = await mount({
      name: "maintenance",
      tap_action: { domain: "switch", action: "toggle", data: "default" },
    });
    const div = el.shadowRoot.querySelector("div");
    expect(div.getAttribute("title")).toBe("Maintenance: off\nClick: toggle");
    expect(el.getAttribute("role")).toBe("button");
    expect(el.getAttribute("tabindex")).toBe("0");
    expect(el.getAttribute("aria-label")).toBe(
      "Maintenance: off\nClick: toggle",
    );
  });

  it("leaves a passive element out of the tab order", async () => {
    const el = await mount({ stateObj: null });
    const div = el.shadowRoot.querySelector("div");
    expect(div.hasAttribute("title")).toBe(false);
    expect(el.hasAttribute("role")).toBe(false);
    expect(el.hasAttribute("tabindex")).toBe(false);
    expect(el.hasAttribute("aria-label")).toBe(false);
  });

  it("runs the tap action from the keyboard", async () => {
    const el = await mount({
      name: "maintenance",
      tap_action: { domain: "switch", action: "toggle", data: "default" },
    });
    const run = vi.spyOn(el, "run_actions").mockResolvedValue(undefined);
    el.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
    el.dispatchEvent(new KeyboardEvent("keydown", { key: " " }));
    el.dispatchEvent(new KeyboardEvent("keydown", { key: "a" }));
    expect(run).toHaveBeenCalledTimes(2);
  });

  it("ignores the keyboard on a passive element", async () => {
    const el = await mount({ stateObj: null });
    const run = vi.spyOn(el, "run_actions");
    el.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
    expect(run).not.toHaveBeenCalled();
  });
});

describe("pointer cursor", () => {
  const toggle = { domain: "switch", action: "toggle", data: "default" };
  const wrapper = (el: any) => el.shadowRoot.querySelector("div");

  it("shows a pointer over a clickable element", async () => {
    for (const trigger of ["tap_action", "hold_action", "double_tap_action"]) {
      const el = await mount({
        name: "maintenance",
        css: { top: "2%" },
        [trigger]: toggle,
      });
      expect(wrapper(el).getAttribute("style")).toBe("top:2%;cursor:pointer");
      expect(wrapper(el).classList.contains("clickable")).toBe(true);
      el.remove();
    }
  });

  it("keeps another cursor set in the mapping", async () => {
    const el = await mount({
      name: "maintenance",
      css: { cursor: "help" },
      tap_action: toggle,
    });
    expect(wrapper(el).getAttribute("style")).toBe("cursor:help");
  });

  it("shows the default cursor over an element without action", async () => {
    const el = await mount({ stateObj: null, css: { top: "2%" } });
    expect(wrapper(el).getAttribute("style")).toBe("top:2%;cursor:default");
    expect(wrapper(el).classList.contains("clickable")).toBe(false);
  });

  it("overrides a pointer set in the mapping of a passive element", async () => {
    const el = await mount({
      stateObj: null,
      css: { cursor: "pointer" },
      tap_action: { ...toggle, enabled: false },
    });
    expect(wrapper(el).getAttribute("style")).toBe(
      "cursor:pointer;cursor:default",
    );
  });

  it("drops the pointer while the device is off, but on its switch", async () => {
    const off = (conf: any) => {
      const el = build(conf);
      el.device.masterOn = false;
      return el;
    };
    const plain = off({ name: "maintenance", tap_action: toggle });
    document.body.appendChild(plain);
    await plain.updateComplete;
    expect(plain.is_clickable()).toBe(false);
    expect(wrapper(plain).getAttribute("style")).toContain("cursor:default");
    expect(plain.hasAttribute("tabindex")).toBe(false);

    const sw = off({
      name: "device_state",
      stateObj: null,
      tap_action: toggle,
    });
    document.body.appendChild(sw);
    await sw.updateComplete;
    expect(sw.is_clickable()).toBe(true);
    expect(wrapper(sw).getAttribute("style")).toContain("cursor:pointer");

    const forced = off({
      name: "maintenance",
      off_clickable: true,
      tap_action: toggle,
    });
    expect(forced.is_clickable()).toBe(true);
  });
});

describe("tooltip edge cases", () => {
  it("keeps the tab order set once", async () => {
    const el = await mount({
      name: "maintenance",
      tap_action: { domain: "switch", action: "toggle", data: "default" },
    });
    el.setAttribute("tabindex", "3");
    el.requestUpdate();
    await el.updateComplete;
    expect(el.getAttribute("tabindex")).toBe("3");
  });

  it("gives no text for a tooltip expression that fails", () => {
    const el = build({
      name: "battery_level",
      tooltip: { expression: "${nothing_here.at_all}" },
    });
    expect(el.get_tooltip()).toBe("");
  });

  it("gives no text for a plain expression that fails", () => {
    const el = build({
      name: "battery_level",
      tooltip: { expression: "nothing_here.at_all" },
    });
    expect(el.get_tooltip()).toBe("");
  });

  it("resolves a dialog title once", () => {
    const el = build({
      stateObj: null,
      tap_action: {
        domain: "redsea_ui",
        action: "dialog",
        data: { type: "wifi" },
      },
    });
    const first = el.get_tooltip();
    el.device.dialogs.wifi.title_key = "changed";
    expect(el.get_tooltip()).toBe(first);
  });

  it("finds the dialogs of a parent device", () => {
    const el = build({
      stateObj: null,
      tap_action: {
        domain: "redsea_ui",
        action: "dialog",
        data: { type: "wifi" },
      },
    });
    const parent = el.device;
    el.device = { ...parent, dialogs: undefined, device: parent };
    expect(el.get_tooltip()).toBe("Click: open Wifi");
  });

  it("names a service without a known target by the service", () => {
    const el = build({
      stateObj: null,
      tap_action: {
        domain: "number",
        action: "set_value",
        data: { entity_id: "not_in_device" },
      },
    });
    expect(el.get_tooltip()).toBe("Click: run number.set_value");
  });

  it("says nothing of a target without a friendly name", () => {
    const hass = makeHass();
    delete hass.states["button.feed"].attributes.friendly_name;
    const el = MyElement.create_element(
      hass,
      {
        type: "tip-stub",
        stateObj: null,
        tap_action: {
          domain: "button",
          action: "press",
          data: { entity_id: "feed" },
        },
      } as any,
      makeDevice(),
    ) as any;
    expect(el.get_tooltip()).toBe("Click: press");
  });

  it("shows the raw state without formatEntityState", () => {
    const hass = makeHass();
    delete hass.formatEntityState;
    const el = MyElement.create_element(
      hass,
      { type: "tip-stub", name: "battery_level" } as any,
      makeDevice(),
    ) as any;
    expect(el.get_tooltip()).toBe("Battery level: 85");
  });

  it("ignores internal card actions", () => {
    const el = build({
      stateObj: null,
      tap_action: { domain: "redsea_ui", action: "update_conf", data: {} },
    });
    expect(el.get_tooltip()).toBe("");
  });
});
