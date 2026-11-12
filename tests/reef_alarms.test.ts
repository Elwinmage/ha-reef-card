/**
 * Common alarm of the reef: what counts as an alarm, the indicator, the list
 * and its card.
 */
import { describe, expect, it, vi } from "vitest";

import {
  ReefAlarms,
  ReefAlarmsCard,
  active_alarms,
} from "../src/base/reef_alarms";

function makeHass(): any {
  return {
    language: "en",
    states: {
      "binary_sensor.ato_leak": {
        state: "on",
        last_changed: "2026-11-10T10:00:00Z",
        attributes: { device_class: "moisture", friendly_name: "ATO leak" },
      },
      "binary_sensor.head_1_regulation_alarm": {
        state: "on",
        last_changed: "2026-11-09T10:00:00Z",
        attributes: { device_class: "problem", friendly_name: "Head 1 alarm" },
      },
      "binary_sensor.ph_low": {
        state: "off",
        attributes: { device_class: "problem" },
      },
      "binary_sensor.cloud": {
        state: "off",
        attributes: { device_class: "connectivity" },
      },
      "binary_sensor.kitchen_door": {
        state: "on",
        attributes: { device_class: "problem" },
      },
      "binary_sensor.hidden": {
        state: "on",
        attributes: { device_class: "problem" },
      },
      "binary_sensor.sump_float": {
        state: "on",
        attributes: {},
      },
      "switch.pump": { state: "on", attributes: {} },
    },
    entities: {
      "binary_sensor.ato_leak": { platform: "redsea", device_id: "ato" },
      "binary_sensor.head_1_regulation_alarm": {
        platform: "redsea",
        device_id: "head1",
      },
      "binary_sensor.ph_low": { platform: "reeftank" },
      "binary_sensor.cloud": { platform: "redsea" },
      "binary_sensor.kitchen_door": { platform: "zha" },
      "binary_sensor.hidden": { platform: "redsea", hidden: true },
      "switch.pump": { platform: "redsea" },
    },
    devices: {
      ato: { name: "ReefATO+", name_by_user: "ATO" },
      head1: { name: "ReefDose head 1" },
    },
  };
}

describe("active_alarms", () => {
  it("gathers the problems of the reef integrations, oldest first", () => {
    const alarms = active_alarms(makeHass());
    expect(alarms.map((a) => a.entity_id)).toEqual([
      "binary_sensor.head_1_regulation_alarm",
      "binary_sensor.ato_leak",
    ]);
    expect(alarms[1]).toEqual({
      entity_id: "binary_sensor.ato_leak",
      name: "ATO leak",
      device: "ATO",
      since: "2026-11-10T10:00:00Z",
    });
    expect(alarms[0]!.device).toBe("ReefDose head 1");
  });

  it("adds and removes entities as configured", () => {
    const alarms = active_alarms(makeHass(), {
      entities: ["binary_sensor.sump_float", "sensor.gone"],
      exclude: ["binary_sensor.head_1_regulation_alarm"],
      integrations: ["redsea", "zha"],
      device_classes: ["problem"],
    });
    expect(alarms.map((a) => a.entity_id).sort()).toEqual([
      "binary_sensor.kitchen_door",
      "binary_sensor.sump_float",
    ]);
    const sump = alarms.find((a) => a.entity_id === "binary_sensor.sump_float");
    expect(sump).toMatchObject({
      name: "binary_sensor.sump_float",
      device: "",
    });
  });

  it("orders the alarms by start, the undated last", () => {
    const at = (iso?: string) => ({
      state: "on",
      ...(iso ? { last_changed: iso } : {}),
      attributes: { device_class: "problem" },
    });
    const ids = ["c", "a", "d", "b", "e"].map((x) => `binary_sensor.${x}`);
    const hass = {
      states: {
        [ids[0]!]: at("2026-11-03T00:00:00Z"),
        [ids[1]!]: at("2026-11-01T00:00:00Z"),
        [ids[2]!]: at(),
        [ids[3]!]: at("2026-11-02T00:00:00Z"),
        [ids[4]!]: at(),
      },
      entities: {},
    };
    expect(
      active_alarms(hass, { entities: ids }).map((a) => a.entity_id.slice(-1)),
    ).toEqual(["a", "b", "c", "d", "e"]);
  });

  it("is empty without hass", () => {
    expect(active_alarms(null)).toEqual([]);
  });
});

async function makeElement(hass: any = makeHass()): Promise<ReefAlarms> {
  const el = document.createElement("reef-alarms") as ReefAlarms;
  el.hass = hass;
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

describe("reef-alarms", () => {
  it("turns red with the number of alarms", async () => {
    const el = await makeElement();
    const button = el.shadowRoot!.querySelector(".indicator")!;
    expect(button.classList.contains("alarm")).toBe(true);
    expect(button.textContent).toContain("2");
    el.remove();
  });

  it("stays green while all is well", async () => {
    const hass = makeHass();
    hass.states["binary_sensor.ato_leak"].state = "off";
    hass.states["binary_sensor.head_1_regulation_alarm"].state = "off";
    const el = await makeElement(hass);
    const button = el.shadowRoot!.querySelector(".indicator")!;
    expect(button.classList.contains("ok")).toBe(true);
    expect(button.textContent).toContain("OK");
    el.open();
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector(".none")).toBeTruthy();
    el.remove();
  });

  it("redraws only when the alarms change", async () => {
    const el = await makeElement();
    const spy = vi.spyOn(el, "requestUpdate");
    el.hass = makeHass();
    expect(spy).not.toHaveBeenCalled();
    const hass = makeHass();
    hass.states["binary_sensor.ato_leak"].state = "off";
    el.hass = hass;
    expect(spy).toHaveBeenCalled();
    expect(el.hass).toBe(hass);
    el.remove();
  });

  it("lists the alarms on a tap, and opens one", async () => {
    const el = document.createElement("reef-alarms") as ReefAlarms;
    // An alarm added by hand, of no device
    el.config = { entities: ["binary_sensor.sump_float"] };
    el.hass = makeHass();
    document.body.appendChild(el);
    await el.updateComplete;
    const dialog: any = el.shadowRoot!.querySelector("dialog");
    dialog.showModal = vi.fn(() => dialog.setAttribute("open", ""));
    dialog.close = vi.fn(() => dialog.removeAttribute("open"));
    (el.shadowRoot!.querySelector(".indicator") as HTMLElement).click();
    expect(dialog.showModal).toHaveBeenCalled();
    const items = el.shadowRoot!.querySelectorAll("li");
    expect(items).toHaveLength(3);
    expect(items[1]!.textContent).toContain("ATO");
    expect(items[2]!.querySelector(".device")).toBeNull();
    const opened = vi.fn();
    el.addEventListener("hass-more-info", (e: any) => opened(e.detail));
    (items[1] as HTMLElement).click();
    expect(opened).toHaveBeenCalledWith({ entityId: "binary_sensor.ato_leak" });
    expect(dialog.close).toHaveBeenCalled();
    // The cross closes it too
    (el.shadowRoot!.querySelector("header button") as HTMLElement).click();
    expect(dialog.close).toHaveBeenCalledTimes(2);
    // A click inside the list does not reach the page under it
    const outside = vi.fn();
    el.addEventListener("click", outside);
    dialog.dispatchEvent(new Event("click", { bubbles: true }));
    expect(outside).not.toHaveBeenCalled();
    el.remove();
  });

  it("works without a modal dialog support", async () => {
    const el = await makeElement();
    const dialog: any = el.shadowRoot!.querySelector("dialog");
    dialog.showModal = undefined;
    dialog.close = undefined;
    el.open();
    expect(dialog.hasAttribute("open")).toBe(true);
    el.close();
    expect(dialog.hasAttribute("open")).toBe(false);
    el.remove();
    // Not drawn yet: nothing to open
    const bare = new ReefAlarms();
    bare.open();
    bare.close();
  });

  it("leaves a date it cannot read blank", async () => {
    const el = await makeElement();
    expect((el as any)._since("nope")).toBe("");
    el.remove();
  });
});

describe("reef-alarms-card", () => {
  it("wraps the indicator with a title", async () => {
    const card = document.createElement("reef-alarms-card") as ReefAlarmsCard;
    card.setConfig({ title: "Reef" });
    card.hass = makeHass();
    document.body.appendChild(card);
    await card.updateComplete;
    expect(card.shadowRoot!.querySelector(".title")!.textContent).toBe("Reef");
    const inner = card.shadowRoot!.querySelector("reef-alarms") as ReefAlarms;
    await inner.updateComplete;
    const hass = makeHass();
    card.hass = hass;
    expect(inner.hass).toBe(hass);
    expect(card.hass).toBe(hass);
    expect(card.getCardSize()).toBe(1);
    expect(ReefAlarmsCard.getStubConfig()).toEqual({});
    card.setConfig(undefined as any);
    await card.updateComplete;
    expect(card.shadowRoot!.querySelector(".title")!.textContent).toBe(
      "Alarms",
    );
    card.remove();
  });
});
