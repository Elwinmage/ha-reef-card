// VSON fish feeder (hacked, ESPHome): entity lookup, slots logic, device
// detection by project name, and the view itself.
import { describe, expect, it, vi, afterEach } from "vitest";

import DeviceList, {
  domain_of,
  project_name_of,
  resolve_device_model,
} from "../src/utils/common";
import { RSDevice } from "../src/devices/device";
import {
  apply_pending,
  pending_settled,
  clamp_portions,
  daily_portions,
  entity_matches,
  feeder_slots,
  format_time,
  next_feeding,
  parse_time,
  resolve_feeder_entities,
  shadowed_slots,
  split_delay,
  split_uptime,
  time_value,
  watched_entities,
} from "../src/utils/fish_feeder";
import "../src/devices/index";

// ── Fixture: an ESPHome feeder as Home Assistant registers it ───────────────

function make_hass(
  over: {
    feed?: string;
    trap?: string;
    low?: string;
    slots?: [string, string][];
    prefix?: string;
    identifiers?: any[];
    uptime?: string;
  } = {},
) {
  const prefix = over.prefix ?? "fish_feeder";
  const device = {
    id: "dev_feeder",
    identifiers: over.identifiers ?? [],
    connections: [["mac", "aa:bb:cc:dd:ee:ff"]],
    manufacturer: "vson",
    model: "fish_feeder",
    name: "Fish Feeder",
    disabled_by: null,
    primary_config_entry: "ce_feeder",
  };
  const other = {
    id: "dev_other",
    identifiers: [],
    connections: [["mac", "11:22:33:44:55:66"]],
    manufacturer: "espressif",
    model: "esp32dev",
    name: "Some ESPHome",
    disabled_by: null,
    primary_config_entry: "ce_other",
  };
  const entities: Record<string, any> = {};
  const states: Record<string, any> = {};
  const add = (id: string, state: string, device_id = "dev_feeder") => {
    entities[id] = { entity_id: id, device_id, translation_key: null };
    states[id] = { entity_id: id, state, attributes: {} };
  };
  add(`switch.${prefix}_manual_feed`, over.feed ?? "off");
  add(`binary_sensor.${prefix}_open_close_sensor`, over.trap ?? "off");
  add(`binary_sensor.${prefix}_food_level_sensor`, over.low ?? "off");
  add(`sensor.${prefix}_system_uptime`, over.uptime ?? "276540");
  add(`switch.${prefix}_system_restart`, "off");
  const slots = over.slots ?? [
    ["08:30:00", "2"],
    ["12:00:00", "1"],
    ["18:45:00", "2"],
    ["12:00:00", "1"],
    ["00:00:00", "0"],
  ];
  slots.forEach(([t, p], i) => {
    add(`time.${prefix}_slot_${i + 1}`, t);
    add(`number.${prefix}_portion_slot_${i + 1}`, p);
  });
  // An entity of another device ending the same way must be ignored
  add("switch.other_manual_feed", "off", "dev_other");
  const callService = vi.fn();
  return {
    states,
    entities,
    devices: { dev_feeder: device, dev_other: other },
    callService,
  } as any;
}

// ── Pure helpers ────────────────────────────────────────────────────────────

describe("fish_feeder helpers", () => {
  it("matches entity ids by domain and end", () => {
    expect(
      entity_matches("switch.fish_feeder_manual_feed", "switch", "manual_feed"),
    ).toBe(true);
    expect(entity_matches("switch.manual_feed", "switch", "manual_feed")).toBe(
      true,
    );
    expect(
      entity_matches("light.fish_feeder_manual_feed", "switch", "manual_feed"),
    ).toBe(false);
    expect(entity_matches("number.x_portion_slot_1", "time", "slot_1")).toBe(
      false,
    );
    expect(entity_matches("time.x_slot_11", "time", "slot_1")).toBe(false);
    expect(entity_matches("nodot", "time", "slot_1")).toBe(false);
  });

  it("finds the entities of the feeder only", () => {
    const hass = make_hass({ prefix: "aquarium_feeder" });
    const found = resolve_feeder_entities(hass, ["dev_feeder"]);
    expect(found.roles.feed).toBe("switch.aquarium_feeder_manual_feed");
    expect(found.roles.trap).toBe(
      "binary_sensor.aquarium_feeder_open_close_sensor",
    );
    expect(found.roles.food_low).toBe(
      "binary_sensor.aquarium_feeder_food_level_sensor",
    );
    expect(found.roles.uptime).toBe("sensor.aquarium_feeder_system_uptime");
    expect(found.slots[0]).toEqual({
      time: "time.aquarium_feeder_slot_1",
      portions: "number.aquarium_feeder_portion_slot_1",
    });
    expect(found.roles.restart).toBe("switch.aquarium_feeder_system_restart");
    expect(watched_entities(found)).toHaveLength(15);
    expect(resolve_feeder_entities(null, []).slots).toHaveLength(5);
  });

  it("parses and formats times", () => {
    expect(parse_time("08:30:00")).toBe(510);
    expect(parse_time("8:05")).toBe(485);
    expect(parse_time("24:00")).toBeNull();
    expect(parse_time("unknown")).toBeNull();
    expect(parse_time(undefined)).toBeNull();
    expect(format_time(510)).toBe("08:30");
    expect(format_time(-1)).toBe("23:59");
    expect(time_value("07:05")).toBe("07:05:00");
    expect(time_value("")).toBeNull();
    expect(clamp_portions(12)).toBe(10);
    expect(clamp_portions(-1)).toBe(0);
    expect(clamp_portions(NaN)).toBe(0);
    expect(split_delay(125)).toEqual({ h: 2, m: 5 });
    expect(split_delay(-3)).toEqual({ h: 0, m: 0 });
  });

  it("computes slots, next feeding, daily total and skipped slots", () => {
    const hass = make_hass();
    const slots = feeder_slots(
      hass,
      resolve_feeder_entities(hass, ["dev_feeder"]),
    );
    expect(slots.map((s) => s.active)).toEqual([true, true, true, true, false]);
    // Slot 4 has the hour of slot 2: the firmware skips it
    expect(shadowed_slots(slots)).toEqual([4]);
    expect(daily_portions(slots)).toBe(5);

    const at = (h: number, m: number) => new Date(2026, 10, 3, h, m);
    expect(next_feeding(slots, at(10, 7))).toMatchObject({
      in_minutes: 113,
      slot: { index: 2 },
    });
    // Due this very minute: it is the next one, and slot 2 wins over slot 4
    expect(next_feeding(slots, at(12, 0))).toMatchObject({
      in_minutes: 0,
      slot: { index: 2 },
    });
    // After the last one: tomorrow morning
    expect(next_feeding(slots, at(20, 0))).toMatchObject({
      in_minutes: 750,
      slot: { index: 1 },
    });
  });

  it("has no next feeding when every slot is off or unreadable", () => {
    const hass = make_hass({
      slots: [
        ["unavailable", "1"],
        ["08:00:00", "unknown"],
        ["09:00:00", "0"],
        ["10:00:00", "abc"],
        ["11:00:00", "0"],
      ],
    });
    const slots = feeder_slots(
      hass,
      resolve_feeder_entities(hass, ["dev_feeder"]),
    );
    expect(slots[0]?.unavailable).toBe(true);
    expect(slots[1]?.unavailable).toBe(true);
    expect(slots[3]?.portions).toBe(0);
    expect(next_feeding(slots, new Date())).toBeNull();
    expect(daily_portions(slots)).toBe(0);
    // Entities missing altogether
    const none = feeder_slots(hass, resolve_feeder_entities(hass, []));
    expect(none.every((s) => s.unavailable && !s.active)).toBe(true);
  });
});

// ── Detection ───────────────────────────────────────────────────────────────

describe("VSON feeder detection", () => {
  it("recognises the feeder by its ESPHome project name", () => {
    const hass = make_hass();
    const dev = hass.devices.dev_feeder;
    expect(project_name_of(dev)).toBe("vson.fish_feeder");
    expect(project_name_of({ manufacturer: "vson" })).toBeUndefined();
    expect(domain_of(dev.identifiers, dev)).toBe("esphome");
    expect(domain_of([], hass.devices.dev_other)).toBeUndefined();
    expect(domain_of(undefined)).toBeUndefined();
    // An identifier tuple still wins
    expect(domain_of([["redsea", "x"]], dev)).toBe("redsea");
  });

  it("lists the feeder, keyed by its MAC address, and nothing else", () => {
    const list = new DeviceList(make_hass());
    expect(list.main_devices).toEqual([
      { value: "dev_feeder", text: "Fish Feeder", uid: "aa:bb:cc:dd:ee:ff" },
    ]);
    const info = list.devices["dev_feeder"]!;
    const model = resolve_device_model(
      make_hass(),
      info,
      "esphome",
      "fish_feeder",
    );
    expect(model).toBe("VSONFEEDER");
    expect(RSDevice.tag_for_model("esphome", model)).toBe("esphome-vsonfeeder");
    expect(customElements.get("esphome-vsonfeeder")).toBeDefined();
  });

  it("falls back on the device id without a MAC address", () => {
    const hass = make_hass();
    delete hass.devices.dev_feeder.connections;
    const list = new DeviceList(hass);
    expect(list.main_devices[0]?.uid).toBe("dev_feeder");
  });

  it("keeps the raw model of a project the domain does not map", () => {
    const hass = make_hass();
    const info = { name: "x", elements: [hass.devices.dev_other] };
    expect(resolve_device_model(hass, info as any, "esphome", "esp32dev")).toBe(
      "esp32dev",
    );
  });
});

// ── View ────────────────────────────────────────────────────────────────────

describe("VSONFeeder view", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  async function mount(hass: any) {
    const info = {
      name: "Fish Feeder",
      key: "dev_feeder",
      uid: "aa:bb:cc:dd:ee:ff",
      elements: [hass.devices.dev_feeder],
    };
    const el: any = RSDevice.create_device(
      "esphome-vsonfeeder",
      hass,
      {},
      info,
    );
    document.body.appendChild(el);
    await el.updateComplete;
    return el;
  }

  it("draws the closed, full feeder with its slots", async () => {
    const el = await mount(make_hass());
    const root = el.shadowRoot;
    expect(el.config_model()).toBe("VSONFEEDER");
    expect(el.is_on()).toBe(true);
    expect(root.querySelector(".ff-img").getAttribute("src")).toContain(
      "closed_full",
    );
    expect(root.querySelectorAll(".ff-slot")).toHaveLength(5);
    expect(
      root.querySelector(".ff-slot.shadowed .ff-slot-index").textContent,
    ).toBe("4");
    expect(root.querySelector(".ff-pellets")).toBeNull();
    expect(root.querySelector(".ff-food-alert")).toBeNull();
    // 276540 s: 3 days 4 hours
    expect(root.querySelector(".ff-uptime").textContent).toContain("3 d 4 h");
    el.remove();
  });

  it("shows the open trap, the falling pellets and the low reserve", async () => {
    const el = await mount(make_hass({ feed: "on", trap: "on", low: "on" }));
    const root = el.shadowRoot;
    expect(root.querySelector(".ff-img").getAttribute("src")).toContain(
      "open_empty",
    );
    expect(root.querySelectorAll(".ff-pellets span")).toHaveLength(9);
    expect(root.querySelector(".ff-food-alert.right")).not.toBeNull();
    expect(root.querySelector(".ff-feed").disabled).toBe(true);
  });

  it("calls the firmware entities", async () => {
    vi.useFakeTimers();
    const hass = make_hass();
    const el = await mount(hass);
    const root = el.shadowRoot;
    root.querySelector(".ff-feed").click();
    expect(hass.callService).toHaveBeenCalledWith("switch", "turn_on", {
      entity_id: "switch.fish_feeder_manual_feed",
    });
    // + on slot 1 (2 portions)
    root
      .querySelectorAll(".ff-slot")[0]
      .querySelectorAll(".ff-step")[1]
      .click();
    vi.advanceTimersByTime(400);
    expect(hass.callService).toHaveBeenCalledWith("number", "set_value", {
      entity_id: "number.fish_feeder_portion_slot_1",
      value: 3,
    });
    const input = root.querySelectorAll(".ff-slot-time")[0];
    input.value = "07:15";
    input.dispatchEvent(new Event("change"));
    expect(hass.callService).toHaveBeenCalledWith("time", "set_value", {
      entity_id: "time.fish_feeder_slot_1",
      time: "07:15:00",
    });
    // An empty time is not sent
    const calls = hass.callService.mock.calls.length;
    input.value = "";
    input.dispatchEvent(new Event("change"));
    expect(hass.callService.mock.calls.length).toBe(calls);
    vi.useRealTimers();
  });

  it("opens the more-info dialog of the trap sensor", async () => {
    const el = await mount(make_hass());
    const spy = vi.fn();
    el.addEventListener("hass-more-info", (e: any) => spy(e.detail.entityId));
    el.shadowRoot.querySelector(".ff-img").click();
    expect(spy).toHaveBeenCalledWith(
      "binary_sensor.fish_feeder_open_close_sensor",
    );
  });

  it("follows the states and goes offline", async () => {
    const hass = make_hass();
    const el = await mount(hass);
    const next = make_hass({ trap: "unavailable", feed: "unavailable" });
    el.hass = next;
    await el.updateComplete;
    expect(el.is_on()).toBe(false);
    expect(el.shadowRoot.querySelector(".ff-offline")).not.toBeNull();
    expect(el.shadowRoot.querySelector(".ff-uptime").textContent).toContain(
      "--",
    );
    expect(el.shadowRoot.querySelector(".ff-restart").disabled).toBe(true);
  });

  it("tells when nothing is scheduled, and when the device is disabled", async () => {
    const hass = make_hass({
      slots: [
        ["08:00:00", "0"],
        ["09:00:00", "0"],
        ["10:00:00", "0"],
        ["11:00:00", "0"],
        ["12:00:00", "0"],
      ],
    });
    const el = await mount(hass);
    expect(el.shadowRoot.querySelector(".ff-next.none")).not.toBeNull();

    const disabled = make_hass();
    disabled.devices.dev_feeder.disabled_by = "user";
    const off = await mount(disabled);
    expect(off.shadowRoot.querySelector(".disabled_in_ha")).not.toBeNull();
  });
});

// ── Remaining paths (coverage) ──────────────────────────────────────────────

describe("VSONFeeder corner cases", () => {
  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = "";
  });

  async function mount(hass: any, name: string | undefined = "Fish Feeder") {
    const info = {
      name,
      key: "dev_feeder",
      elements: [hass.devices.dev_feeder],
    };
    const el: any = RSDevice.create_device(
      "esphome-vsonfeeder",
      hass,
      {},
      info as any,
    );
    document.body.appendChild(el);
    await el.updateComplete;
    return el;
  }

  it("skips connections that are not a MAC address", () => {
    const hass = make_hass();
    hass.devices.dev_feeder.connections = [
      ["bluetooth", "x"],
      "junk",
      ["mac", 12],
      ["mac", "aa:aa"],
    ];
    expect(new DeviceList(hass).main_devices[0]?.uid).toBe("aa:aa");
  });

  it("formats the delay to the next feeding", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    const hass = make_hass();
    const text = async (h: number, m: number) => {
      vi.setSystemTime(new Date(2026, 10, 3, h, m));
      const el = await mount(hass);
      const out = el.shadowRoot.querySelector(".ff-next-delay").textContent;
      el.remove();
      return out;
    };
    expect(await text(12, 0)).toBe("now");
    expect(await text(11, 50)).toBe("in 10 min");
    expect(await text(9, 0)).toBe("in 3 h 00");
  });

  it("refreshes every minute while shown, and stops once removed", async () => {
    vi.useFakeTimers();
    const el = await mount(make_hass());
    const spy = vi.spyOn(el, "requestUpdate");
    vi.advanceTimersByTime(60_000);
    expect(spy).toHaveBeenCalled();
    // A second connection keeps the same clock
    const clock = el._clock;
    el.connectedCallback();
    expect(el._clock).toBe(clock);
    el.remove();
    expect(el._clock).toBeNull();
    el.disconnectedCallback();
    expect(el._clock).toBeNull();
  });

  it("redraws only when a watched state changes", async () => {
    const hass = make_hass();
    const el = await mount(hass);
    el.hass = hass;
    el._watched = [];
    const spy = vi.spyOn(el, "requestUpdate");
    el.hass = hass; // states differ from the empty list: redraw
    expect(spy).toHaveBeenCalledTimes(1);
    el.hass = hass; // same states: nothing
    expect(spy).toHaveBeenCalledTimes(1);
    el.isEditorMode = true;
    el.hass = make_hass({ trap: "on" });
    expect(spy).toHaveBeenCalledTimes(1);
    expect(el.render()).toBeDefined();
    el._populate_entities();
  });

  it("opens the more-info dialogs and steps the portions down", async () => {
    vi.useFakeTimers();
    const hass = make_hass({ low: "on" });
    const el = await mount(hass, null as any);
    const ids: string[] = [];
    el.addEventListener("hass-more-info", (e: any) =>
      ids.push(e.detail.entityId),
    );
    const root = el.shadowRoot;
    root.querySelector(".ff-food-alert").click();
    root.querySelector(".ff-uptime").click();
    expect(ids).toEqual([
      "binary_sensor.fish_feeder_food_level_sensor",
      "sensor.fish_feeder_system_uptime",
    ]);
    root
      .querySelectorAll(".ff-slot")[0]
      .querySelectorAll(".ff-step")[0]
      .click();
    vi.advanceTimersByTime(400);
    expect(hass.callService).toHaveBeenCalledWith("number", "set_value", {
      entity_id: "number.fish_feeder_portion_slot_1",
      value: 1,
    });
    // Nothing to send: same value, unknown entity, no hass
    const calls = hass.callService.mock.calls.length;
    const slot = { portions: 2, portions_entity: "number.x" };
    el._set_portions(slot, 2);
    el._more_info(undefined);
    el._call("switch", "turn_on", undefined);
    el._set_portions({ portions: 2 }, 3);
    el._send_portions("number.unknown");
    expect(hass.callService.mock.calls.length).toBe(calls);
    vi.useRealTimers();
  });

  it("copes with missing entities and a slot without a valid hour", async () => {
    const hass = make_hass({
      slots: [
        ["garbage", "2"],
        ["08:00:00", "1"],
        ["09:00:00", "0"],
        ["10:00:00", "0"],
        ["11:00:00", "0"],
      ],
    });
    delete hass.entities["binary_sensor.fish_feeder_open_close_sensor"];
    delete hass.entities["switch.fish_feeder_manual_feed"];
    const el = await mount(hass);
    expect(el.is_on()).toBe(false);
    expect(el._role_state("feed")).toBeUndefined();
    expect(el.shadowRoot.querySelectorAll(".ff-slot-time")[0].value).toBe("");
    // A configuration without pictures falls back on the mapping ones
    el.config = { ...el.config, images: undefined };
    expect(el._picture(true, true)).toContain("open_empty");
  });
});

describe("VSONFeeder face overlays", () => {
  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = "";
  });

  async function mount(hass: any) {
    const info = {
      name: "F",
      key: "dev_feeder",
      elements: [hass.devices.dev_feeder],
    };
    const el: any = RSDevice.create_device(
      "esphome-vsonfeeder",
      hass,
      {},
      info as any,
    );
    document.body.appendChild(el);
    await el.updateComplete;
    return el;
  }

  it("splits the uptime", () => {
    expect(split_uptime("276540")).toEqual({ d: 3, h: 4, m: 49 });
    expect(split_uptime(-5)).toEqual({ d: 0, h: 0, m: 0 });
    expect(split_uptime("unavailable")).toBeNull();
    expect(split_uptime("")).toBeNull();
    expect(split_uptime(null)).toBeNull();
  });

  it("prints the uptime in hours below a day, and nothing without sensor", async () => {
    const el = await mount(make_hass({ uptime: "4380" }));
    expect(el.shadowRoot.querySelector(".ff-uptime").textContent).toContain(
      "1 h 13",
    );
    const hass = make_hass();
    delete hass.entities["sensor.fish_feeder_system_uptime"];
    delete hass.entities["switch.fish_feeder_system_restart"];
    const bare = await mount(hass);
    expect(bare.shadowRoot.querySelector(".ff-uptime")).toBeNull();
    expect(bare.shadowRoot.querySelector(".ff-restart")).toBeNull();
  });

  it("restarts on a second tap only", async () => {
    vi.useFakeTimers();
    const hass = make_hass();
    const el = await mount(hass);
    const button = () => el.shadowRoot.querySelector(".ff-restart");
    button().click();
    await el.updateComplete;
    expect(button().classList.contains("armed")).toBe(true);
    expect(hass.callService).not.toHaveBeenCalled();
    button().click();
    expect(hass.callService).toHaveBeenCalledWith("switch", "turn_on", {
      entity_id: "switch.fish_feeder_system_restart",
    });
    await el.updateComplete;
    expect(button().classList.contains("armed")).toBe(false);

    // Armed, then left alone: it disarms by itself
    button().click();
    vi.advanceTimersByTime(3000);
    await el.updateComplete;
    expect(button().classList.contains("armed")).toBe(false);
    expect(hass.callService).toHaveBeenCalledTimes(1);

    // Armed, then removed: the timer is dropped
    button().click();
    el.remove();
    expect(el._restart_timer).toBeNull();
    expect(el._restart_armed).toBe(false);
  });
});

describe("VSONFeeder responsiveness", () => {
  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = "";
  });

  async function mount(hass: any) {
    const info = {
      name: "F",
      key: "dev_feeder",
      elements: [hass.devices.dev_feeder],
    };
    const el: any = RSDevice.create_device(
      "esphome-vsonfeeder",
      hass,
      {},
      info as any,
    );
    document.body.appendChild(el);
    await el.updateComplete;
    return el;
  }

  const value = (el: any, pos: number) =>
    el.shadowRoot.querySelectorAll(".ff-portions-value")[pos];
  const plus = (el: any, pos: number) =>
    el.shadowRoot
      .querySelectorAll(".ff-slot")
      [pos].querySelectorAll(".ff-step")[1];

  it("shows the portions at once and sends quick clicks as one call", async () => {
    vi.useFakeTimers();
    const hass = make_hass();
    const el = await mount(hass);
    for (let i = 0; i < 3; i++) {
      plus(el, 0).click();
      await el.updateComplete;
    }
    expect(value(el, 0).textContent).toBe("5");
    expect(value(el, 0).classList.contains("pending")).toBe(true);
    // The daily total follows at once too
    expect(el.shadowRoot.querySelector(".ff-total").textContent).toContain("8");
    expect(hass.callService).not.toHaveBeenCalled();
    // A state update while the clicks go on keeps the value shown
    el.hass = { ...hass, states: { ...hass.states } };
    await el.updateComplete;
    expect(value(el, 0).textContent).toBe("5");
    vi.advanceTimersByTime(400);
    expect(hass.callService).toHaveBeenCalledTimes(1);
    expect(hass.callService).toHaveBeenCalledWith("number", "set_value", {
      entity_id: "number.fish_feeder_portion_slot_1",
      value: 5,
    });

    // Still shown while the feeder has not answered
    el.hass = make_hass();
    await el.updateComplete;
    expect(value(el, 0).textContent).toBe("5");

    // The feeder reports it: the pending mark goes
    const reported = make_hass();
    reported.states["number.fish_feeder_portion_slot_1"].state = "5.0";
    el.hass = reported;
    await el.updateComplete;
    expect(value(el, 0).textContent).toBe("5");
    expect(value(el, 0).classList.contains("pending")).toBe(false);
    expect(el._pending).toEqual({});
  });

  it("falls back on the reported value when the feeder never answers", async () => {
    vi.useFakeTimers();
    const hass = make_hass();
    const el = await mount(hass);
    plus(el, 0).click();
    vi.advanceTimersByTime(400);
    vi.setSystemTime(Date.now() + 21_000);
    el.hass = make_hass();
    await el.updateComplete;
    expect(value(el, 0).textContent).toBe("2");
  });

  it("shows a new hour at once", async () => {
    const hass = make_hass();
    const el = await mount(hass);
    const input = el.shadowRoot.querySelectorAll(".ff-slot-time")[1];
    input.value = "13:30";
    input.dispatchEvent(new Event("change"));
    await el.updateComplete;
    const after = el.shadowRoot.querySelectorAll(".ff-slot-time")[1];
    expect(after.value).toBe("13:30");
    expect(after.classList.contains("pending")).toBe(true);
    // The next feeding uses it as well
    const next = el.shadowRoot.querySelector(".ff-next-time");
    expect(next).not.toBeNull();
  });

  it("sends what is still waiting when the view goes away", async () => {
    vi.useFakeTimers();
    const hass = make_hass();
    const el = await mount(hass);
    plus(el, 2).click();
    el.remove();
    expect(hass.callService).toHaveBeenCalledWith("number", "set_value", {
      entity_id: "number.fish_feeder_portion_slot_3",
      value: 3,
    });
  });

  it("overlays and settles pending values (helpers)", () => {
    const hass = make_hass();
    const slots = feeder_slots(
      hass,
      resolve_feeder_entities(hass, ["dev_feeder"]),
    );
    const out = apply_pending(slots, {
      "number.fish_feeder_portion_slot_5": 3,
      "time.fish_feeder_slot_5": 600,
    });
    expect(out[4]).toMatchObject({ portions: 3, minutes: 600, active: true });
    expect(out[0]).toBe(slots[0]);
    const none = apply_pending(
      feeder_slots(hass, resolve_feeder_entities(hass, [])),
      {
        "number.x": 1,
      },
    );
    expect(none[0]?.portions).toBe(0);
    expect(pending_settled(hass, "time.fish_feeder_slot_1", 510)).toBe(true);
    expect(pending_settled(hass, "time.fish_feeder_slot_1", 511)).toBe(false);
    expect(pending_settled(hass, "number.fish_feeder_portion_slot_1", 2)).toBe(
      true,
    );
    expect(pending_settled(hass, "number.nope", 0)).toBe(false);
    hass.states["number.fish_feeder_portion_slot_1"].state = "";
    expect(pending_settled(hass, "number.fish_feeder_portion_slot_1", 0)).toBe(
      false,
    );
    expect(pending_settled(null, "number.x", 0)).toBe(false);
  });
});
