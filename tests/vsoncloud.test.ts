// VSON cloud feeder (ha-vson-component): reef_role entity resolution, device
// detection by domain/model, and the view itself.
import { describe, expect, it, vi, afterEach } from "vitest";

import { domain_of, resolve_device_model } from "../src/utils/common";
import { RSDevice } from "../src/devices/device";
import {
  device_entity_ids,
  resolve_cloud_feeder_entities,
  watched_cloud_entities,
} from "../src/utils/vson_feeder";
import "../src/devices/index";

// ── Fixture: a cloud VSON feeder as Home Assistant registers it ─────────────

function make_hass(
  over: { online?: string; food?: string; schedule?: string } = {},
) {
  const device = {
    id: "dev_vson",
    identifiers: [["vson", "abc123"]],
    connections: [],
    manufacturer: "VSON",
    model: "WP8621A",
    name: "Intelligent fish feeder",
    disabled_by: null,
    primary_config_entry: "ce_vson",
  };
  const entities: Record<string, any> = {};
  const states: Record<string, any> = {};
  const add = (id: string, role: string, state: string) => {
    entities[id] = { entity_id: id, device_id: "dev_vson" };
    states[id] = { entity_id: id, state, attributes: { reef_role: role } };
  };
  add("binary_sensor.vson_online", "online", over.online ?? "on");
  add("binary_sensor.vson_food_shortage", "food_shortage", over.food ?? "off");
  add("button.vson_feed_now", "feed", "unknown");
  add("button.vson_refresh", "refresh", "unknown");
  add("sensor.vson_firmware", "firmware", "WP8621NK_04");
  add("switch.vson_schedule", "schedule", over.schedule ?? "off");
  // An entity of another device must be ignored.
  entities["button.other_feed"] = {
    entity_id: "button.other_feed",
    device_id: "dev_other",
  };
  states["button.other_feed"] = {
    entity_id: "button.other_feed",
    state: "unknown",
    attributes: { reef_role: "feed" },
  };
  const callService = vi.fn();
  return {
    states,
    entities,
    devices: { dev_vson: device },
    callService,
  } as any;
}

// ── reef_role resolution ────────────────────────────────────────────────────

describe("vson_feeder helpers", () => {
  it("resolves the feeder entities by reef_role", () => {
    const found = resolve_cloud_feeder_entities(make_hass(), ["dev_vson"]);
    expect(found.online).toBe("binary_sensor.vson_online");
    expect(found.food_shortage).toBe("binary_sensor.vson_food_shortage");
    expect(found.feed).toBe("button.vson_feed_now");
    expect(found.refresh).toBe("button.vson_refresh");
    expect(found.firmware).toBe("sensor.vson_firmware");
    expect(found.schedule).toBe("switch.vson_schedule");
    expect(watched_cloud_entities(found)).toHaveLength(6);
  });

  it("ignores entities of other devices and empty input", () => {
    const found = resolve_cloud_feeder_entities(make_hass(), ["dev_vson"]);
    expect(Object.values(found)).not.toContain("button.other_feed");
    expect(resolve_cloud_feeder_entities(undefined, [])).toEqual({});
  });

  it("returns no entities without a registry or matching device", () => {
    expect(device_entity_ids(undefined, ["x"])).toEqual([]);
    expect(device_entity_ids({} as any, ["x"])).toEqual([]);
    const hass = make_hass();
    expect(device_entity_ids(hass, ["nope"])).toEqual([]);
  });
});

// ── Device detection ─────────────────────────────────────────────────────────

describe("vson device detection", () => {
  it("recognises the vson domain and keeps the model as the view", () => {
    const hass = make_hass();
    const dev = hass.devices.dev_vson;
    expect(domain_of(dev.identifiers, dev)).toBe("vson");
    const info = { name: "x", elements: [dev] };
    expect(resolve_device_model(hass, info as any, "vson", "WP8621A")).toBe(
      "WP8621A",
    );
  });
});

// ── View ────────────────────────────────────────────────────────────────────

describe("VSONCloudFeeder view", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  async function mount(hass: any) {
    const info = {
      name: "Intelligent fish feeder",
      key: "dev_vson",
      uid: "abc123",
      elements: [hass.devices.dev_vson],
    };
    const el: any = RSDevice.create_device("vson-wp8621a", hass, {}, info);
    document.body.appendChild(el);
    await el.updateComplete;
    return el;
  }

  it("draws the closed, full feeder online with a feed button", async () => {
    const el = await mount(make_hass());
    const root = el.shadowRoot;
    expect(el.config_model()).toBe("WP8621A");
    expect(el.is_on()).toBe(true);
    expect(root.querySelector(".ff-img").getAttribute("src")).toContain(
      "closed_full",
    );
    expect(root.querySelector(".ff-food-alert")).toBeNull();
    expect(root.querySelector(".ff-feed")).not.toBeNull();
    expect(root.querySelector(".ff-uptime").textContent).toContain(
      "WP8621NK_04",
    );
    el.remove();
  });

  it("shows the low-reserve warning and the offline badge", async () => {
    const el = await mount(make_hass({ food: "on", online: "off" }));
    const root = el.shadowRoot;
    expect(el.is_on()).toBe(false);
    expect(root.querySelector(".ff-img").getAttribute("src")).toContain(
      "closed_empty",
    );
    expect(root.querySelector(".ff-food-alert")).not.toBeNull();
    expect(root.querySelector(".ff-offline")).not.toBeNull();
    el.remove();
  });

  it("feeds now through the button.press action", async () => {
    const hass = make_hass();
    const el = await mount(hass);
    el.shadowRoot.querySelector(".ff-feed").click();
    expect(hass.callService).toHaveBeenCalledWith("button", "press", {
      entity_id: "button.vson_feed_now",
    });
    el.remove();
  });

  it("toggles the schedule switch", async () => {
    const hass = make_hass({ schedule: "off" });
    const el = await mount(hass);
    const btn = [...el.shadowRoot.querySelectorAll(".ff-slot")].find(
      (b: Element) => b.textContent?.includes("Schedule"),
    ) as HTMLElement;
    btn.click();
    expect(hass.callService).toHaveBeenCalledWith("switch", "turn_on", {
      entity_id: "switch.vson_schedule",
    });
    el.remove();
  });
});

// ── Remaining paths (coverage) ──────────────────────────────────────────────

describe("VSONCloudFeeder corner cases", () => {
  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = "";
  });

  async function mount(hass: any) {
    const info = {
      name: "Intelligent fish feeder",
      key: "dev_vson",
      uid: "abc123",
      elements: [hass.devices.dev_vson],
    };
    const el: any = RSDevice.create_device("vson-wp8621a", hass, {}, info);
    document.body.appendChild(el);
    await el.updateComplete;
    return el;
  }

  it("redraws only when a watched state changes", async () => {
    const hass = make_hass();
    const el = await mount(hass);
    el._watched = [];
    const spy = vi.spyOn(el, "requestUpdate");
    el.hass = hass; // states differ from the empty list: redraw
    expect(spy).toHaveBeenCalledTimes(1);
    el.hass = hass; // same states: nothing
    expect(spy).toHaveBeenCalledTimes(1);
    el.isEditorMode = true;
    el.hass = make_hass({ online: "off" }); // editor: no redraw
    expect(spy).toHaveBeenCalledTimes(1);
    expect(el.render()).toBeDefined(); // editor render branch
    el._populate_entities();
    el.remove();
  });

  it("opens the more-info dialogs and refreshes", async () => {
    const hass = make_hass({ food: "on" });
    const el = await mount(hass);
    const ids: string[] = [];
    el.addEventListener("hass-more-info", (e: any) =>
      ids.push(e.detail.entityId),
    );
    const root = el.shadowRoot;
    root.querySelector(".ff-img").click(); // more_info online
    root.querySelector(".ff-food-alert").click(); // more_info food_shortage
    root.querySelector(".ff-uptime").click(); // more_info firmware
    expect(ids).toEqual([
      "binary_sensor.vson_online",
      "binary_sensor.vson_food_shortage",
      "sensor.vson_firmware",
    ]);
    root.querySelector(".ff-refresh").click();
    expect(hass.callService).toHaveBeenCalledWith("button", "press", {
      entity_id: "button.vson_refresh",
    });
    el.remove();
  });

  it("runs the feeding animation then clears it", async () => {
    vi.useFakeTimers();
    const hass = make_hass();
    const el = await mount(hass);
    el._feed_now(); // arm the timer
    el._feed_now(); // re-arm: clears the pending timer first
    el.shadowRoot.querySelector(".ff-feed").click();
    await el.updateComplete;
    expect(el.shadowRoot.querySelector(".ff-pellets")).not.toBeNull();
    expect(el.shadowRoot.querySelector(".ff-feed").disabled).toBe(true);
    vi.advanceTimersByTime(4000); // FEEDING_MS
    await el.updateComplete;
    expect(el.shadowRoot.querySelector(".ff-pellets")).toBeNull();
    el.disconnectedCallback(); // clears the (already fired) timer safely
    el.remove();
  });

  it("shows '--' firmware when offline and guards missing entities", async () => {
    const el = await mount(make_hass({ online: "off" }));
    expect(el.shadowRoot.querySelector(".ff-uptime").textContent).toContain(
      "--",
    );
    // No-ops when the role has no entity / no hass.
    el._more_info("feed"); // present -> dispatches
    const bare = make_hass();
    delete bare.states["sensor.vson_firmware"];
    delete bare.entities["sensor.vson_firmware"];
    const el2 = await mount(bare);
    el2._more_info("firmware"); // absent -> early return
    expect(el2.shadowRoot.querySelector(".ff-uptime")).toBeNull();
    el.remove();
    el2.remove();
  });

  it("renders the disabled placeholder", async () => {
    const hass = make_hass();
    hass.devices.dev_vson.disabled_by = "user";
    const el = await mount(hass);
    expect(el.shadowRoot.querySelector(".disabled_in_ha")).not.toBeNull();
    el.remove();
  });

  it("falls back to WP8621 when no element model is known", async () => {
    const hass = make_hass();
    delete hass.devices.dev_vson.model;
    const el = await mount(hass);
    expect(el.config_model()).toBe("WP8621");
    el.remove();
  });

  it("omits the schedule and refresh when those entities are absent", async () => {
    const hass = make_hass();
    for (const id of ["switch.vson_schedule", "button.vson_refresh"]) {
      delete hass.states[id];
      delete hass.entities[id];
    }
    const el = await mount(hass);
    const root = el.shadowRoot;
    expect(root.querySelector(".ff-refresh")).toBeNull();
    expect(
      [...root.querySelectorAll(".ff-slot")].some((b: Element) =>
        b.textContent?.includes("Schedule"),
      ),
    ).toBe(false);
    // The feed button is still there.
    expect(root.querySelector(".ff-feed")).not.toBeNull();
    el.remove();
  });

  it("shows the schedule as active when the switch is on", async () => {
    const el = await mount(make_hass({ schedule: "on" }));
    const btn = [...el.shadowRoot.querySelectorAll(".ff-slot")].find(
      (b: Element) => b.textContent?.includes("Schedule"),
    ) as HTMLElement;
    expect(btn.querySelector("ha-icon").getAttribute("icon")).toBe(
      "mdi:calendar-check",
    );
    expect(btn.classList.contains("off")).toBe(false);
    btn.click();
    expect(el.hass.callService).toHaveBeenCalledWith("switch", "turn_off", {
      entity_id: "switch.vson_schedule",
    });
    el.remove();
  });

  it("uses the mapping images when the config has none", async () => {
    const el = await mount(make_hass());
    el.config = { ...el.config, images: undefined };
    expect(el._picture(false, false)).toContain("closed_full");
    expect(el._picture(true, true)).toContain("open_empty");
    el.remove();
  });
});
