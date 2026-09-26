/**
 * Tests for the 12V ports, the power strip sockets and the summary bar of
 * the ReefControl hub card.
 *
 * - Ports: each port is a ControlPort element (cog on the connector,
 *   consumption above it) fed with that port's entities, found through their
 *   `port` attribute. Its cog opens `port_conf`, whose mode editor is the
 *   power-center socket editor (PortSensor) writing to the hub's endpoints.
 * - Sockets: a powered socket of the paired strip gets a light mask.
 * - Summary: one line recapping the readings, with an alarm when one of them
 *   is out of its desired range and a flag on a faulty temperature source.
 *
 * Covers: src/devices/redsea/rscontrol/control_port.ts
 *         src/devices/redsea/rscontrol/port_sensor.ts
 *         src/devices/redsea/rscontrol/rscontrol.ts (ports, sockets, summary)
 *         src/devices/redsea/rscontrol/rscontrol.common.mapping.ts
 */

import { afterEach, describe, expect, it, vi } from "vitest";
import { render } from "lit";
import { RSControlPro } from "../src/devices/redsea/rscontrol/rscontrol";
import {
  ControlPort,
  port_aliases,
} from "../src/devices/redsea/rscontrol/control_port";
import { PortSensor } from "../src/devices/redsea/rscontrol/port_sensor";
import { RSDevice } from "../src/devices/device";
import { SafeEval } from "../src/utils/SafeEval";
import { config as liteConfig } from "../src/devices/redsea/rscontrol/rscontrollite.mapping";
import { config2 as proConfig } from "../src/devices/redsea/rscontrol/rscontrolpro.mapping";
import { dialogs_rscontrol } from "../src/devices/redsea/rscontrol/rscontrol.dialogs";
import {
  COLOR_LEVEL_ACCEPTABLE_HEX,
  COLOR_LEVEL_DANGER_HEX,
  COLOR_LEVEL_DESIRED_HEX,
} from "../src/utils/colors";
import "../src/devices/index";

class StubHub extends RSControlPro {}
if (!customElements.get("stub-ports-hub"))
  customElements.define("stub-ports-hub", StubHub);

class StubPort extends ControlPort {}
if (!customElements.get("stub-control-port"))
  customElements.define("stub-control-port", StubPort);

class StubPortSensor extends PortSensor {}
if (!customElements.get("stub-port-sensor"))
  customElements.define("stub-port-sensor", StubPortSensor);

afterEach(() => {
  document.body
    .querySelectorAll("stub-port-sensor")
    .forEach((el) => el.remove());
  vi.restoreAllMocks();
});

// ─── Helpers ────────────────────────────────────────────────────────────────

interface Spec {
  id: string;
  key: string;
  state?: string;
  attrs?: Record<string, any>;
  device?: string;
}

function makeHass(specs: Spec[] = [], devices: Record<string, any> = {}): any {
  const entities: Record<string, any> = {};
  const states: Record<string, any> = {};
  for (const spec of specs) {
    entities[spec.id] = {
      entity_id: spec.id,
      device_id: spec.device ?? "hub",
      translation_key: spec.key,
    };
    if (spec.state !== undefined) {
      states[spec.id] = {
        entity_id: spec.id,
        state: spec.state,
        attributes: spec.attrs ?? {},
      };
    }
  }
  return {
    states,
    entities,
    devices,
    callService: vi.fn(),
    formatEntityState: (st: any) =>
      st.attributes?.unit_of_measurement
        ? `${st.state} ${st.attributes.unit_of_measurement}`
        : String(st.state),
  };
}

function makeHub(hass: any, element: any = { id: "hub" }): any {
  const hub = new StubHub() as any;
  hub.device = { name: "Hub", elements: [element] };
  hub._hass = hass;
  hub.update_config();
  hub._scan_entities();
  return hub;
}

function toDom(template: any): HTMLElement {
  const div = document.createElement("div");
  render(template, div);
  return div;
}

function probe(
  id: string,
  key: string,
  state: string,
  type: string,
  uid: string,
  index: number,
  extra: Record<string, any> = {},
): Spec {
  return {
    id,
    key,
    state,
    attrs: { probe_uid: uid, probe_type: type, probe_index: index, ...extra },
  };
}

const PORT_CONFIG = {
  number: 1,
  type: "other",
  mode: "on",
  enabled: true,
  power_on_percent: 70,
  power_detector_enabled: false,
  is_btn_assigned: true,
  user_config_mode: "on",
  sensor: null,
};

// ─── Mapping ────────────────────────────────────────────────────────────────

describe("port mapping", () => {
  it("gives the Lite one port with a plain cog", () => {
    expect(liteConfig.ports.nb).toBe(1);
    const hub = makeHub(makeHass([]));
    hub.initial_config = liteConfig;
    hub.update_config();
    expect(hub._port_config(1).elements.port_conf.icon).toBe("mdi:cog");
  });

  it("numbers the Pro's two cogs", () => {
    const hub = makeHub(makeHass([]));
    expect(proConfig.ports.nb).toBe(2);
    expect(hub._port_config(1).elements.port_conf.icon).toBe("redsea:cog-1");
    expect(hub._port_config(2).elements.port_conf.icon).toBe("mdi:cog-pause");
    expect(hub._port_config(2).id).toBe(2);
    // Shared part merged in
    expect(hub._port_config(2).css.top).toBe("24.1%");
    expect(hub._port_config(3).css.left).toBeUndefined();
  });

  it("opens the port dialog and the consumption more-info", () => {
    const els = (proConfig.ports.common as any).elements;
    expect(els.port_conf.tap_action.data.type).toBe("port_conf");
    expect(els.port_consumption.tap_action).toEqual({
      domain: "redsea_ui",
      action: "more-info",
      data: "port_consumption",
    });
    const dialog = dialogs_rscontrol.port_conf;
    expect(dialog.content[1].view).toBe("port-sensor");
  });

  it("offers to uninstall an installed port only", () => {
    const del = (dialogs_rscontrol.port_conf.content as any[]).find(
      (c) => c.conf?.icon === "mdi:delete",
    );
    expect(del.view).toBe("click-image");
    expect(del.conf.tap_action[0].data.type).toBe("port_delete");
    const hidden = (entity: any): boolean =>
      new SafeEval({ device: {}, entity, config: {} }).evaluate(
        del.conf.disabled_if,
      );
    // No button, or the integration greys it out on an unknown port
    expect(hidden({})).toBe(true);
    expect(hidden({ port_delete: { state: "unavailable" } })).toBe(true);
    expect(hidden({ port_delete: { state: "unknown" } })).toBe(false);
  });

  it("confirms before pressing the port_delete button", () => {
    const dialog = dialogs_rscontrol.port_delete as any;
    expect(dialog.cancel).toBe(true);
    const actions = dialog.validate.tap_action;
    expect(actions[0]).toEqual({
      domain: "button",
      action: "press",
      data: { entity_id: "port_delete" },
    });
    expect(actions[actions.length - 1].action).toBe("exit-dialog");
  });

  it("keeps port entities out of the hub-wide set", () => {
    const hub = makeHub(makeHass([]));
    hub.entities = {
      last_message: { entity_id: "sensor.m" },
      port_delete: { entity_id: "button.d" },
      "button.port_delete_2": { entity_id: "button.d2" },
      probe_name: { entity_id: "text.p" },
    };
    expect(Object.keys(hub._hub_entities())).toEqual(["last_message"]);
  });

  it("describes both strip models, socket by socket", () => {
    expect(proConfig.power_sockets.RSPOWER6.lefts).toHaveLength(6);
    expect(proConfig.power_sockets.RSPOWER8.lefts).toHaveLength(8);
    // Both masks run down past the socket frame, in the same proportion
    const six = proConfig.power_sockets.RSPOWER6;
    const eight = proConfig.power_sockets.RSPOWER8;
    expect((eight.height / eight.width) * (1952 / 2196)).toBeCloseTo(
      (six.height / six.width) * (1952 / 2196),
      1,
    );
    expect(liteConfig.summary).toBe(proConfig.summary);
  });

  it("moves the messages above the power strip", () => {
    const els = proConfig.elements as any;
    expect(els.last_message.css.top).toBe("1%");
    expect(els.last_alert_message.css.top).toBe("4.5%");
  });
});

// ─── ControlPort ────────────────────────────────────────────────────────────

describe("port_aliases", () => {
  it("exposes the port entities under the socket keys", () => {
    const ents = {
      port_mode: { entity_id: "text.nope" },
      "sensor.port_mode": { entity_id: "sensor.mode" },
      port_name: { entity_id: "text.name" },
      port_on_off: { entity_id: "switch.on" },
    };
    const res = port_aliases(ents);
    // The sensor wins: it carries the editor's attributes
    expect(res.socket_mode.entity_id).toBe("sensor.mode");
    expect(res.socket_name.entity_id).toBe("text.name");
    expect(res.socket_on_off.entity_id).toBe("switch.on");
    expect(res.socket_state).toBeUndefined();
    expect((ents as any).socket_mode).toBeUndefined();
  });
});

describe("ControlPort", () => {
  function makePort(states: Record<string, string>): any {
    const port = new StubPort() as any;
    port.entities = {};
    const hass_states: Record<string, any> = {};
    for (const [key, state] of Object.entries(states)) {
      port.entities[key] = { entity_id: "sensor." + key };
      hass_states["sensor." + key] = { state, attributes: {} };
    }
    port._hass = { states: hass_states, entities: {} };
    port.config = { elements: {} };
    return port;
  }

  it("re-renders only when the port's state changes", () => {
    const port = makePort({ port_mode: "on", port_consumption: "2" });
    port.requestUpdate = vi.fn();
    const hass = port._hass;
    port.hass = hass;
    port.hass = hass;
    expect(port.requestUpdate).toHaveBeenCalledTimes(1);
    port.hass = {
      ...hass,
      states: {
        ...hass.states,
        "sensor.port_consumption": { state: "3", attributes: {} },
      },
    };
    expect(port.requestUpdate).toHaveBeenCalledTimes(2);
    expect(port.hass.states["sensor.port_consumption"].state).toBe("3");
  });

  it("update_state() stores the hub state", () => {
    const port = makePort({});
    port.requestUpdate = vi.fn();
    port.update_state(true);
    expect(port.state_on).toBe(true);
    expect(port.requestUpdate).toHaveBeenCalled();
  });

  it("renders its elements, nothing before its setup", () => {
    const port = makePort({});
    port._render_elements = vi.fn(() => "");
    expect(toDom(port.render()).querySelector(".port")).not.toBeNull();
    for (const missing of ["config", "_hass", "entities"]) {
      const p = makePort({});
      p[missing] = null;
      expect(toDom(p._render()).querySelector(".port")).toBeNull();
    }
  });
});

// ─── RSControl ports ────────────────────────────────────────────────────────

describe("RSControl ports", () => {
  const specs: Spec[] = [
    { id: "switch.hub_state", key: "device_state", state: "on" },
    { id: "sensor.m1", key: "port_mode", state: "on", attrs: { port: 0 } },
    { id: "sensor.m2", key: "port_mode", state: "off", attrs: { port: 1 } },
    { id: "text.n2", key: "port_name", state: "Fan", attrs: { port: 1 } },
    { id: "sensor.n2", key: "port_name", state: "Fan", attrs: { port: 1 } },
  ];

  it("groups the entities of each port", () => {
    const hub = makeHub(makeHass(specs));
    expect(hub._ports[1].port_mode.entity_id).toBe("sensor.m1");
    expect(hub._ports[2]["sensor.port_mode"].entity_id).toBe("sensor.m2");
    expect(hub._ports[2]["text.port_name"].entity_id).toBe("text.n2");
    expect(hub.entities["text.port_name_2"].entity_id).toBe("text.n2");
  });

  it("creates one element per port and reuses it", () => {
    const hub = makeHub(makeHass(specs));
    const dom = toDom(hub._render_port(2));
    const elt = hub._port_elements[2];
    expect(elt).toBeInstanceOf(ControlPort);
    expect(dom.querySelector("#port_2")).not.toBeNull();
    expect(elt.port_id).toBe(2);
    expect(elt.entities.socket_mode.entity_id).toBe("sensor.m2");
    expect(elt.entities.device_state.entity_id).toBe("switch.hub_state");

    const marker = { hass: null };
    elt._elements = { cached: marker };
    hub._render_port(2);
    expect(hub._port_elements[2]).toBe(elt);
    expect(elt._elements.cached).toBe(marker);

    // A port with an entity more gets its elements rebuilt
    hub._ports[2].port_state = { entity_id: "sensor.s2" };
    hub._render_port(2);
    expect(elt._elements).toEqual({});
  });

  it("renders a port without entities, and survives a failed creation", () => {
    const hub = makeHub(makeHass([]));
    expect(() => toDom(hub._render_port(1))).not.toThrow();
    const hub2 = makeHub(makeHass([]));
    vi.spyOn(RSDevice, "create_device").mockReturnValue(null);
    expect(() => toDom(hub2._render_port(1))).not.toThrow();
  });

  it("draws both ports of a Pro, and no port without a table", () => {
    const hub = makeHub(makeHass(specs));
    hub._render_elements = vi.fn(() => "");
    let dom = toDom(hub._render("", ""));
    expect(dom.querySelectorAll(".port_slot").length).toBe(2);
    delete hub.config.ports;
    dom = toDom(hub._render("", ""));
    expect(dom.querySelectorAll(".port_slot").length).toBe(0);
  });

  it("shows the cog on every port, a new one included", () => {
    // A port not installed yet must stay configurable: its editor installs it
    const conf = (proConfig.ports.common as any).elements.port_conf;
    expect(conf.disabled_if).toBeUndefined();
  });

  it("keeps the ports up to date between two renders", () => {
    const hub = makeHub(makeHass(specs));
    hub._render_port(1);
    const elt = hub._port_elements[1];
    const hass = makeHass(specs);
    const spy = vi.spyOn(elt, "hass", "set");
    hub.hass = hass;
    expect(spy).toHaveBeenCalledWith(hass);
    // A port element that could not be created is skipped
    hub._port_elements[2] = null;
    expect(() => (hub.hass = hass)).not.toThrow();
  });
});

// ─── PortSensor ─────────────────────────────────────────────────────────────

describe("PortSensor", () => {
  function makeEditor(
    attrs: Record<string, any> = { config: PORT_CONFIG },
    opts: { name?: string | null; entry?: string | null; port?: any } = {},
  ): any {
    const { name = "Fan", entry = "ce1", port = 2 } = opts;
    const states: Record<string, any> = {
      "sensor.mode": { state: "on", attributes: attrs },
    };
    const entities: Record<string, any> = {
      socket_mode: { entity_id: "sensor.mode" },
    };
    if (name !== null) {
      entities.socket_name = { entity_id: "sensor.name" };
      states["sensor.name"] = { state: name };
    }
    const hub = {
      device: {
        name: "Hub",
        elements: entry
          ? [{ primary_config_entry: entry, model_id: "hub1" }]
          : [],
      },
      hub_hwid: () => "hub1",
    };
    const el = new StubPortSensor() as any;
    el.device = { port_id: port, entities, device: hub };
    el.hass = {
      states,
      callService: vi.fn().mockResolvedValue(undefined),
      callWS: vi.fn().mockResolvedValue({ response: { probes: [] } }),
    };
    return el;
  }

  function requests(el: any): any[] {
    return el.hass.callService.mock.calls.map((c: any[]) => c[2]);
  }

  it("reads the power from the port entry", () => {
    const el = makeEditor();
    el.connectedCallback();
    expect(el._power).toBe(70);
    const bare = makeEditor({ config: { number: 1 } });
    bare.connectedCallback();
    expect(bare._power).toBe(100);
    const none = makeEditor({});
    none.connectedCallback();
    expect(none._power).toBe(100);
  });

  it("counts ports from 0 for the hub's API", () => {
    expect(makeEditor()._socketNum()).toBe(1);
    expect(makeEditor(undefined, { port: 1 })._socketNum()).toBe(0);
    expect(makeEditor(undefined, { port: "x" })._socketNum()).toBe(0);
  });

  it("presents the hub as the controller of its own probes", () => {
    const strip = makeEditor()._strip();
    expect(strip.has_control_link()).toBe(true);
    expect(strip.linked_control_hwid()).toBe("hub1");
    expect(strip.linked_control_name()).toBe("Hub");
    expect(strip.linked_control_device().primary_config_entry).toBe("ce1");

    const el = makeEditor();
    el.device.device = { device: null };
    const bare = el._strip();
    expect(bare.linked_control_hwid()).toBeNull();
    expect(bare.linked_control_name()).toBe("");
    expect(bare.linked_control_device()).toBeNull();
    el.device.device = null;
    expect(el._strip()).toBeNull();
  });

  it("resends the whole port entry with the mode and power", () => {
    const el = makeEditor();
    el._power = 55;
    expect(el._entry("schedule")).toEqual({
      number: 1,
      mode: "schedule",
      name: "Fan",
      type: "other",
      enabled: true,
      power_on_percent: 55,
      power_detector_enabled: false,
      is_btn_assigned: true,
    });
    const bare = makeEditor({}, { name: null });
    bare._power = 100;
    expect(bare._entry("on")).toEqual({
      number: 1,
      mode: "on",
      power_on_percent: 100,
    });
  });

  it("saves on/off as a port entry only", async () => {
    const el = makeEditor();
    el._mode = "off";
    const quit = vi.fn();
    el.addEventListener("quit-dialog", quit);
    await el._save();
    expect(requests(el)).toEqual([
      expect.objectContaining({
        device_id: "ce1",
        access_path: "/ports/config",
        method: "put",
        data: [expect.objectContaining({ number: 1, mode: "off" })],
      }),
    ]);
    expect(quit).toHaveBeenCalled();
    expect(el._saving).toBe(false);
  });

  it("writes the schedule before the schedule mode", async () => {
    const el = makeEditor();
    el._mode = "schedule";
    el._intervals = [
      { time: 600, duration: 60 },
      { time: -5, duration: 0 },
      { time: 2000, duration: 0.5 },
      { time: 60, duration: 30 },
    ];
    await el._save();
    const [schedule, mode] = requests(el);
    expect(schedule.access_path).toBe("/port/1/schedule");
    expect(schedule.data).toEqual({
      intervals: [
        { time: 60, duration: 30 },
        { time: 600, duration: 60 },
        { time: 1439, duration: 1 },
      ],
    });
    expect(mode.data[0].mode).toBe("schedule");
  });

  it("writes the probe rule before the probe mode", async () => {
    const el = makeEditor();
    el._mode = "sensor";
    el._probeOptions = [
      { label: "pH", uid: "0x1", type: "ph", sensor: "primary" },
    ];
    el._probeIdx = 0;
    el._value = 8.3;
    el._hysteresis = 0.1;
    el._isAbove = false;
    el._turnOn = false;
    el._fallbackOn = true;
    await el._save();
    const [rule, mode] = requests(el);
    expect(rule.access_path).toBe("/ports/subscribe");
    expect(rule.method).toBe("put");
    expect(rule.data).toEqual({
      ports: [
        {
          number: 1,
          default_state: true,
          type: "ph",
          uid: "0x1",
          sensor: "primary",
          is_above: false,
          value: 8.3,
          hysteresis: 0.1,
          trigger_op: false,
        },
      ],
    });
    expect(mode.data[0].mode).toBe("sensor");
    // An installed port is neither reinstalled nor given a default schedule
    expect(requests(el)).toHaveLength(2);
  });

  it("replays the app when setting up a new port on a water level", async () => {
    // Captured: the ReefBeat app putting port 2 in probe mode on an ATO
    const el = makeEditor(
      {
        config: {
          number: 1,
          type: "unknown",
          mode: "setup",
          enabled: true,
          name: "p2",
          power_on_percent: 100,
          power_detector_enabled: false,
          is_btn_assigned: false,
        },
      },
      { name: "p2" },
    );
    el.connectedCallback();
    el._power = 96;
    el._mode = "sensor";
    el._probeOptions = [
      { label: "ATO", uid: "0x0097E", type: "ato", sensor: "primary" },
    ];
    el._fallbackOn = false;
    await el._save();
    expect(
      requests(el).map((r: any) => [r.method, r.access_path, r.data]),
    ).toEqual([
      [
        "put",
        "/ports/subscribe",
        {
          ports: [
            {
              number: 1,
              default_state: false,
              type: "ato",
              uid: "0x0097E",
              sensor: "primary",
            },
          ],
        },
      ],
      ["post", "/port/1/install", { type: "other" }],
      ["put", "/port/1/schedule", { intervals: [{ time: 0, duration: 1439 }] }],
      [
        "put",
        "/ports/config",
        [
          {
            mode: "sensor",
            number: 1,
            name: "p2",
            power_detector_enabled: false,
            type: "other",
            enabled: true,
            power_on_percent: 96,
            is_btn_assigned: false,
          },
        ],
      ],
    ]);
  });

  it("installs a new port before its own schedule", async () => {
    const el = makeEditor({ config: { number: 1, type: "unknown" } });
    el._mode = "schedule";
    el._intervals = [{ time: 60, duration: 30 }];
    await el._save();
    expect(requests(el).map((r: any) => r.access_path)).toEqual([
      "/port/1/install",
      "/port/1/schedule",
      "/ports/config",
    ]);
    expect(requests(el)[1].data).toEqual({
      intervals: [{ time: 60, duration: 30 }],
    });
  });

  it("knows a port is installed unless the hub says otherwise", () => {
    expect(makeEditor({ config: { type: "other" } }).is_installed()).toBe(true);
    expect(makeEditor({ config: { type: "unknown" } }).is_installed()).toBe(
      false,
    );
    // Missing information: no needless install
    expect(makeEditor({}).is_installed()).toBe(true);
  });

  it("reports a missing probe or a failed request instead of closing", async () => {
    const el = makeEditor();
    el._mode = "sensor";
    el._probeOptions = [];
    const quit = vi.fn();
    el.addEventListener("quit-dialog", quit);
    await el._save();
    expect(el._saveError).toBe("No probe selected");
    expect(quit).not.toHaveBeenCalled();

    const failing = makeEditor();
    failing._mode = "on";
    failing.hass.callService.mockRejectedValue(new Error("503"));
    await failing._save();
    expect(failing._saveError).toBe("503");
    failing.hass.callService.mockRejectedValue(null);
    await failing._save();
    expect(failing._saveError).toBe("Save failed");
    failing.hass.callService.mockRejectedValue("boom");
    await failing._save();
    expect(failing._saveError).toBe("boom");
  });

  it("does nothing without a config entry or hass", async () => {
    const el = makeEditor(undefined, { entry: null });
    await el._save();
    await el._resume();
    expect(el.hass.callService).not.toHaveBeenCalled();
    const nohass = makeEditor();
    const hass = nohass.hass;
    nohass.hass = null;
    await nohass._save();
    expect(hass.callService).not.toHaveBeenCalled();
  });

  it("resumes a suspended mode with its mode only", async () => {
    const el = makeEditor();
    el._override = { mode: "schedule", state: "on" };
    const quit = vi.fn();
    el.addEventListener("quit-dialog", quit);
    await el._resume();
    expect(requests(el)).toHaveLength(1);
    expect(requests(el)[0].access_path).toBe("/ports/config");
    expect(requests(el)[0].data[0].mode).toBe("schedule");
    expect(quit).toHaveBeenCalled();

    const none = makeEditor();
    none._override = null;
    await none._resume();
    expect(none.hass.callService).not.toHaveBeenCalled();

    const failing = makeEditor();
    failing._override = { mode: "sensor", state: "off" };
    failing.hass.callService.mockRejectedValue(new Error("nope"));
    await failing._resume();
    expect(failing._saveError).toBe("nope");
    failing.hass.callService.mockRejectedValue(undefined);
    await failing._resume();
    expect(failing._saveError).toBe("Save failed");
  });

  it("shows the power under the modes, and follows its slider", async () => {
    const el = makeEditor();
    document.body.appendChild(el);
    await el.updateComplete;
    const range = el.shadowRoot.querySelector(
      "input[type=range]",
    ) as HTMLInputElement;
    expect(range.value).toBe("70");
    range.value = "40";
    range.dispatchEvent(new Event("input"));
    expect(el._power).toBe(40);
    await el.updateComplete;
    expect(el.shadowRoot.textContent).toContain("40 %");
  });
});

// ─── Power strip sockets ────────────────────────────────────────────────────

describe("RSControl power strip sockets", () => {
  function hub(model: string | null, sockets: [number, string][] = []): any {
    const specs: Spec[] = [
      { id: "sensor.cp", key: "connected_power", state: "pw1" },
    ];
    for (const [idx, state] of sockets) {
      specs.push({
        id: "switch.s" + idx,
        key: "socket_" + idx + "_on_off",
        state,
        device: "pw",
      });
    }
    specs.push({
      id: "sensor.other",
      key: "socket_0_on_off",
      state: "on",
      device: "else",
    });
    specs.push({
      id: "sensor.odd",
      key: "socket_x",
      state: "on",
      device: "pw",
    });
    const devices: Record<string, any> = {};
    if (model) devices.pw = { id: "pw", model_id: "pw1", model };
    return makeHub(makeHass(specs, devices));
  }

  it("lists the powered sockets, 1-based", () => {
    const h = hub("RSPOWER8", [
      [5, "on"],
      [0, "on"],
      [1, "off"],
    ]);
    expect(h.linked_power_device().id).toBe("pw");
    expect(h.linked_power_sockets_on()).toEqual([1, 6]);
  });

  it("ignores strip entities without a key or a state", () => {
    const h = hub("RSPOWER6", [[2, "on"]]);
    h._hass.entities["switch.nokey"] = {
      entity_id: "switch.nokey",
      device_id: "pw",
    };
    h._hass.entities["switch.nostate"] = {
      entity_id: "switch.nostate",
      device_id: "pw",
      translation_key: "socket_3_on_off",
    };
    expect(h.linked_power_sockets_on()).toEqual([3]);
  });

  it("lists nothing without a resolvable strip", () => {
    expect(hub(null, [[0, "on"]]).linked_power_sockets_on()).toEqual([]);
    const h = hub("RSPOWER6", [[0, "on"]]);
    h._hass.entities = undefined;
    expect(h.linked_power_sockets_on()).toEqual([]);
  });

  it("masks the powered sockets with the strip's own geometry", () => {
    const h = hub("RSPOWER6", [
      [0, "on"],
      [4, "on"],
    ]);
    const dom = toDom(h._render_socket_masks());
    const masks = dom.querySelectorAll(".socket_mask");
    expect(masks.length).toBe(2);
    const geo = proConfig.power_sockets.RSPOWER6;
    expect((masks[1] as HTMLElement).getAttribute("style")).toContain(
      `left:${geo.lefts[4]}%`,
    );
    expect(dom.querySelector("#socket_mask_5")).not.toBeNull();
  });

  it("masks nothing without a link, a geometry or a known socket", () => {
    const unpaired = makeHub(makeHass([]));
    expect(toDom(unpaired._render_socket_masks()).children.length).toBe(0);

    const h = hub("RSPOWER6", [[0, "on"]]);
    h.config.power_sockets = {};
    expect(toDom(h._render_socket_masks()).children.length).toBe(0);

    // Socket 7 on a 6-socket geometry
    const odd = hub("RSPOWER6", [[6, "on"]]);
    expect(
      toDom(odd._render_socket_masks()).querySelectorAll(".socket_mask").length,
    ).toBe(0);
  });
});

describe("RSControl.hub_hwid", () => {
  it("reads the model_id, then the redsea identifier", () => {
    expect(makeHub(makeHass([]), { id: "hub", model_id: "a" }).hub_hwid()).toBe(
      "a",
    );
    expect(
      makeHub(makeHass([]), {
        id: "hub",
        identifiers: [["redsea", "b"]],
      }).hub_hwid(),
    ).toBe("b");
    expect(
      makeHub(makeHass([]), {
        id: "hub",
        identifiers: [["other", "c"]],
      }).hub_hwid(),
    ).toBeNull();
    const hub = makeHub(makeHass([]));
    hub.device = null;
    expect(hub.hub_hwid()).toBeNull();
  });
});

// ─── Summary bar ────────────────────────────────────────────────────────────

describe("RSControl summary", () => {
  const PH = [7.6, 7.9, 8.4, 8.6];
  const TEMP = [21, 23, 26, 28];

  function fullSpecs(): Spec[] {
    return [
      probe("sensor.ph", "probe_ph_value", "8.1", "ph", "0x1", 0, {
        ranges: PH,
      }),
      probe("sensor.ph_t", "probe_temperature", "25", "ph", "0x1", 0, {
        ranges: TEMP,
      }),
      probe("sensor.orp", "probe_orp_value", "300", "orp", "0x2", 1, {
        unit_of_measurement: "mV",
      }),
      probe("sensor.orp_l", "probe_level", "acceptable", "orp", "0x2", 1),
      probe("sensor.ec", "probe_ec_value", "35", "ec", "0x3", 2, {
        unit_of_measurement: "ppt",
        ranges: [30, 32, 36, 40],
      }),
      probe("binary_sensor.lk", "probe_leak_detected", "off", "leak", "0x4", 3),
      probe(
        "sensor.ato",
        "probe_water_level",
        "desired_level_1",
        "ato",
        "0x5",
        4,
      ),
      probe("sensor.t", "probe_temperature", "24.5", "temperature", "0x6", 5, {
        ranges: TEMP,
        unit_of_measurement: "°C",
      }),
    ];
  }

  it("lists the readings in order, coloured by level", () => {
    const hub = makeHub(makeHass(fullSpecs()));
    const items = hub.summary_items();
    expect(items.map((i: any) => i.type)).toEqual([
      "ph",
      "orp",
      "ec",
      "leak",
      "ato",
    ]);
    expect(items[0].text).toBe("8.1 pH");
    expect(items[0].level).toBe("desired");
    expect(items[1].text).toBe("300 mV");
    expect(items[1].level).toBe("acceptable");
    expect(items[3].icon).toBe("mdi:water-check");
    expect(items[3].level).toBe("desired");
    expect(items[4].icon).toBe("mdi:waves");
    expect(items[4].text).toBe("");
    expect(items[4].title).toBe("desired_level_1");
  });

  it("flags a leak, an ATO level off target and an unplugged probe", () => {
    const specs = fullSpecs();
    specs[5].state = "on";
    specs[6].state = "below";
    specs.push(
      probe("sensor.ph2", "probe_ph_value", "7", "ph", "0x7", 6),
      probe("sensor.ph2_s", "probe_status", "disconnected", "ph", "0x7", 6),
      probe("sensor.ato2", "probe_water_level", "error", "ato", "0x8", 7),
      probe(
        "binary_sensor.lk2",
        "probe_leak_detected",
        "off",
        "leak",
        "0x9",
        8,
      ),
      probe("sensor.lk2_s", "probe_status", "offline", "leak", "0x9", 8),
      probe("sensor.ato3", "probe_water_level", "above", "ato", "0xA", 9),
      probe("sensor.ato3_s", "probe_status", "offline", "ato", "0xA", 9),
    );
    const hub = makeHub(makeHass(specs));
    hub.config.probes.max = 20;
    hub._scan_entities();
    const items = hub.summary_items();
    const by = (type: string) => items.filter((i: any) => i.type === type);
    expect(by("leak")[0].icon).toBe("mdi:water-alert");
    expect(by("leak")[0].level).toBe("danger");
    expect(by("leak")[1].level).toBe("error");
    expect(by("ato").map((i: any) => i.level)).toEqual([
      "acceptable",
      "error",
      "error",
    ]);
    expect(by("ph")[1].level).toBe("error");
  });

  it("skips a probe whose main reading has no state yet", () => {
    const hub = makeHub(
      makeHass([
        probe("sensor.s", "probe_status", "auto", "orp", "0x2", 0),
        { id: "sensor.orp", key: "probe_orp_value" },
      ]),
    );
    // Registered but stateless: not grouped (no attributes), so add it
    hub._probes[0].entities.probe_orp_value = { entity_id: "sensor.orp" };
    expect(hub.summary_items()).toEqual([]);
  });

  it("skips a probe without its main reading", () => {
    const hub = makeHub(
      makeHass([probe("sensor.s", "probe_status", "auto", "orp", "0x2", 0)]),
    );
    expect(hub.summary_items()).toEqual([]);
  });

  it("keeps a pH unit a formatter already gave, and formats without one", () => {
    const hub = makeHub(
      makeHass([
        probe("sensor.ph", "probe_ph_value", "8", "ph", "0x1", 0, {
          unit_of_measurement: "pH",
        }),
        probe("sensor.orp", "probe_orp_value", "300", "orp", "0x2", 1),
      ]),
    );
    expect(hub.summary_items()[0].text).toBe("8 pH");
    hub._hass.formatEntityState = undefined;
    expect(hub.summary_items()[0].text).toBe("8 pH");
    expect(hub.summary_items()[1].text).toBe("300");
  });

  it("raises the worst level of every reading, temperatures included", () => {
    // ORP acceptable
    expect(makeHub(makeHass(fullSpecs())).summary_alarm()).toBe("acceptable");
    // A temperature probe in danger
    const specs = fullSpecs();
    specs[7].state = "30";
    expect(makeHub(makeHass(specs)).summary_alarm()).toBe("danger");
    // An embedded temperature, judged by its own level
    const embedded = [
      probe("sensor.ph", "probe_ph_value", "8.1", "ph", "0x1", 0, {
        ranges: PH,
      }),
      probe("sensor.ph_t", "probe_temperature", "25", "ph", "0x1", 0),
      probe("sensor.ph_tl", "probe_temp_level", "danger", "ph", "0x1", 0),
    ];
    expect(makeHub(makeHass(embedded)).summary_alarm()).toBe("danger");
    // All fine
    const fine = [
      probe("sensor.ph", "probe_ph_value", "8.1", "ph", "0x1", 0, {
        ranges: PH,
      }),
    ];
    expect(makeHub(makeHass(fine)).summary_alarm()).toBeNull();
    // An unplugged probe's temperature is not judged
    const unplugged = [
      probe("sensor.t", "probe_temperature", "40", "temperature", "0x6", 0, {
        ranges: TEMP,
      }),
      probe(
        "sensor.t_s",
        "probe_status",
        "disconnected",
        "temperature",
        "0x6",
        0,
      ),
    ];
    expect(makeHub(makeHass(unplugged)).summary_alarm()).toBeNull();
  });

  it("shows the fused temperature, else a probe's", () => {
    const fused = makeHub(
      makeHass([
        ...fullSpecs(),
        { id: "sensor.fus", key: "temperature_fusion", state: "25.2" },
      ]),
    );
    expect(fused.summary_temperature().entity_id).toBe("sensor.fus");

    // No fusion: the temperature probe comes first
    const probes = makeHub(
      makeHass([
        ...fullSpecs(),
        { id: "sensor.fus", key: "temperature_fusion", state: "unavailable" },
      ]),
    );
    expect(probes.summary_temperature().entity_id).toBe("sensor.t");

    // Else an embedded temperature
    const embedded = makeHub(makeHass(fullSpecs().slice(0, 2)));
    expect(embedded.summary_temperature().entity_id).toBe("sensor.ph_t");

    // A reading-less temperature is skipped
    const none = makeHub(
      makeHass([
        probe(
          "sensor.t",
          "probe_temperature",
          "unknown",
          "temperature",
          "0x6",
          0,
        ),
      ]),
    );
    expect(none.summary_temperature()).toBeNull();
  });

  it("flags a faulty temperature source", () => {
    const anomaly = (state: string | null, coherent: string | null) => {
      const specs: Spec[] = [];
      if (state !== null)
        specs.push({
          id: "sensor.anom",
          key: "temperature_anomaly_source",
          state,
        });
      if (coherent !== null)
        specs.push({
          id: "binary_sensor.coh",
          key: "temperature_coherent",
          state: coherent,
        });
      return makeHub(makeHass(specs)).temperature_anomaly();
    };
    expect(anomaly("Sump", null)).toBe(true);
    expect(anomaly("ok", "off")).toBe(false);
    expect(anomaly("unknown", "on")).toBe(true);
    expect(anomaly("unavailable", null)).toBe(false);
    expect(anomaly(null, null)).toBe(false);
  });

  it("renders the bar, each item opening its more-info", () => {
    const hub = makeHub(
      makeHass([
        ...fullSpecs(),
        { id: "sensor.fus", key: "temperature_fusion", state: "25.2" },
        { id: "sensor.anom", key: "temperature_anomaly_source", state: "Sump" },
      ]),
    );
    const opened: string[] = [];
    hub.addEventListener("hass-more-info", (e: any) =>
      opened.push(e.detail.entityId),
    );
    const dom = toDom(hub._render_summary());
    document.body.appendChild(hub);
    const alarm = dom.querySelector(".summary_alarm") as HTMLElement;
    expect(alarm.getAttribute("style")).toContain(COLOR_LEVEL_ACCEPTABLE_HEX);
    for (const cls of ["temperature", "anomaly", "ph", "leak"]) {
      (dom.querySelector(".summary_" + cls) as HTMLElement).click();
    }
    expect(opened).toEqual([
      "sensor.fus",
      "sensor.anom",
      "sensor.ph",
      "binary_sensor.lk",
    ]);
    expect(
      (dom.querySelector(".summary_ph") as HTMLElement).getAttribute("style"),
    ).toContain(COLOR_LEVEL_DESIRED_HEX);
    expect(
      (dom.querySelector(".summary_anomaly") as HTMLElement).getAttribute(
        "style",
      ),
    ).toContain(COLOR_LEVEL_DANGER_HEX);
    hub.remove();
  });

  it("renders a quiet bar, and none without its setup", () => {
    const hub = makeHub(makeHass([]));
    const dom = toDom(hub._render_summary());
    expect(dom.querySelector(".summary")).not.toBeNull();
    expect(dom.querySelector(".summary_alarm")).toBeNull();
    expect(dom.querySelector(".summary_temperature")).toBeNull();
    expect(dom.querySelector(".summary_anomaly")).toBeNull();

    const conf = hub.config.summary;
    delete hub.config.summary;
    expect(toDom(hub._render_summary()).children.length).toBe(0);
    hub.config.summary = conf;
    hub._hass = null;
    expect(toDom(hub._render_summary()).children.length).toBe(0);
  });

  it("is placed in the picture layer with the probes and ports", () => {
    const hub = makeHub(makeHass(fullSpecs()));
    hub._render_elements = vi.fn(() => "");
    const dom = toDom(hub._render("", ""));
    const layer = dom.querySelector(".canvas_layer")!;
    expect(layer.querySelector(".summary")).not.toBeNull();
    expect(layer.querySelectorAll(".probe_slot").length).toBe(6);
    expect(layer.querySelectorAll(".port_slot").length).toBe(2);
  });

  it("evaluates the summary styles from the mapping", () => {
    const hub = makeHub(makeHass([]));
    const evaluator = new SafeEval({ device: hub, entity: {}, config: {} });
    expect(evaluator.evaluate("${device.summary_alarm() === null}")).toBe(true);
  });
});

// ─── Refresh ────────────────────────────────────────────────────────────────

describe("RSControl refresh of what it draws itself", () => {
  function setup(socket_state: string, orp: string): any {
    return makeHass(
      [
        { id: "sensor.cp", key: "connected_power", state: "pw1" },
        {
          id: "switch.s0",
          key: "socket_0_on_off",
          state: socket_state,
          device: "pw",
        },
        probe("sensor.orp", "probe_orp_value", orp, "orp", "0x2", 0, {
          ranges: [100, 200, 400, 480],
        }),
      ],
      { pw: { id: "pw", model_id: "pw1", model: "RSPOWER8" } },
    );
  }

  it("re-renders when a socket of the strip is switched", () => {
    const hub = makeHub(setup("off", "300"));
    hub.requestUpdate = vi.fn();
    hub.hass = setup("off", "300");
    expect(hub.requestUpdate).toHaveBeenCalledTimes(1);
    hub.hass = setup("off", "300");
    expect(hub.requestUpdate).toHaveBeenCalledTimes(1);
    hub.hass = setup("on", "300");
    expect(hub.requestUpdate).toHaveBeenCalledTimes(2);
  });

  it("re-renders when a reading of the summary changes", () => {
    const hub = makeHub(setup("off", "300"));
    hub.requestUpdate = vi.fn();
    hub.hass = setup("off", "300");
    hub.hass = setup("off", "301");
    expect(hub.requestUpdate).toHaveBeenCalledTimes(2);
    // Out of range: the alarm appears
    hub.hass = setup("off", "500");
    expect(hub.requestUpdate).toHaveBeenCalledTimes(3);
  });

  it("follows the temperature and its anomaly", () => {
    const hass = (temp: string, anomaly: string) =>
      makeHass([
        { id: "sensor.fus", key: "temperature_fusion", state: temp },
        { id: "sensor.an", key: "temperature_anomaly_source", state: anomaly },
      ]);
    const hub = makeHub(hass("25", "ok"));
    hub.requestUpdate = vi.fn();
    hub.hass = hass("25", "ok");
    hub.hass = hass("25.1", "ok");
    hub.hass = hass("25.1", "Sump");
    expect(hub.requestUpdate).toHaveBeenCalledTimes(3);
  });

  it("works before the configuration, and without a summary", () => {
    const hub = new StubHub() as any;
    hub.device = { name: "Hub", elements: [{ id: "hub" }] };
    expect(hub._drawn_signature()).toBe("");
    const bare = makeHub(setup("on", "300"));
    delete bare.config.summary;
    expect(bare._drawn_signature()).toBe("RSPOWER8:1");
  });
});

// ─── ATO pump on a port ─────────────────────────────────────────────────────

describe("RSControl ATO ports", () => {
  function hub(ports: Spec[]): any {
    return makeHub(makeHass(ports));
  }

  it("draws the pump for an ATO kit port", () => {
    const h = hub([
      { id: "sensor.t1", key: "port_type", state: "ato", attrs: { port: 0 } },
    ]);
    expect(h.is_ato_port(1)).toBe(true);
  });

  it("draws the pump for a port following an ATO probe", () => {
    // Captured: the app links an ATO probe to port 2 as type "other",
    // mode "sensor", with a hub rule of type "ato"
    const port2 = (mode: string, rule: any): Spec[] => [
      { id: "sensor.t2", key: "port_type", state: "other", attrs: { port: 1 } },
      {
        id: "sensor.m2",
        key: "port_mode",
        state: mode,
        attrs: { port: 1, sensor_config: rule },
      },
    ];
    const ato = { number: 1, type: "ato", uid: "0x0097E", sensor: "primary" };
    expect(hub(port2("sensor", ato)).is_ato_port(2)).toBe(true);
    expect(hub(port2("sensor", ato)).has_ato_link()).toBe(true);
    // Another probe type, a port not in probe mode, no rule
    expect(hub(port2("sensor", { ...ato, type: "ph" })).is_ato_port(2)).toBe(
      false,
    );
    expect(hub(port2("on", ato)).is_ato_port(2)).toBe(false);
    expect(hub(port2("sensor", null)).is_ato_port(2)).toBe(false);
    expect(hub([]).is_ato_port(2)).toBe(false);
  });
});

// ─── Probe slots ────────────────────────────────────────────────────────────

describe("RSControl probe slots", () => {
  function probes(n: number): Spec[] {
    return Array.from({ length: n }, (_, i) =>
      probe("sensor.p" + i, "probe_orp_value", "1", "orp", "0x" + i, i),
    );
  }

  function placed(hub: any): string[] {
    return hub._probes.map((p: any) => p.slot + ":" + p.uid);
  }

  it("follows the hub's order without pins", () => {
    const hub = makeHub(makeHass(probes(3)));
    expect(placed(hub)).toEqual(["1:0x0", "2:0x1", "3:0x2"]);
    expect(hub.max_slot()).toBe(3);
    expect(hub.slot_used(2)).toBe(true);
    expect(hub.slot_used(4)).toBe(false);
  });

  it("puts pinned probes in their slot, the others in the free ones", () => {
    const hub = makeHub(makeHass(probes(3)));
    hub.config.probe_slots = { "orp:0x0": 6, "orp:0x2": 1 };
    hub._scan_entities();
    expect(placed(hub)).toEqual(["1:0x2", "2:0x1", "6:0x0"]);
    expect(hub.max_slot()).toBe(6);
  });

  it("ignores a pin out of range or already taken", () => {
    const hub = makeHub(makeHass(probes(3)));
    hub.config.probe_slots = {
      "orp:0x0": 2,
      "orp:0x1": 2, // taken by the first
      "orp:0x2": 9, // no such slot
    };
    hub._scan_entities();
    expect(placed(hub)).toEqual(["1:0x1", "2:0x0", "3:0x2"]);
  });

  it("leaves out probes beyond the last slot", () => {
    const hub = makeHub(makeHass(probes(9)));
    expect(hub._all_probes).toHaveLength(9);
    expect(hub.probes_nb()).toBe(7);
    expect(hub.max_slot()).toBe(7);
    expect(makeHub(makeHass([])).max_slot()).toBe(0);
  });

  it("draws the cables and the second box by slot", () => {
    const hub = makeHub(makeHass(probes(2)));
    hub.config.probe_slots = { "orp:0x1": 6 };
    hub._scan_entities();
    const shown = Object.entries(proConfig.elements)
      .filter(
        ([key]) => key.startsWith("port_") || key.startsWith("link_sense"),
      )
      .filter(([, elt]: any) => !hub.evaluate_condition(elt.disabled_if, elt))
      .map(([key]) => key);
    expect(shown).toEqual([
      "port_extend_1",
      "port_extend_2",
      "link_sense_1",
      "link_sense_6",
    ]);
  });

  it("re-renders when a probe changes slot", () => {
    const hass = makeHass(probes(2));
    const hub = makeHub(hass);
    hub.requestUpdate = vi.fn();
    hub.hass = hass;
    hub.config.probe_slots = { "orp:0x0": 5 };
    hub.hass = hass;
    expect(hub.requestUpdate).toHaveBeenCalledTimes(2);
  });

  it("names probes by their name, else by their type", () => {
    const hub = makeHub(
      makeHass([
        ...probes(1),
        probe("sensor.n", "probe_name", "Sump ORP", "orp", "0x0", 0),
        probe("sensor.q", "probe_ph_value", "8", "ph", "0x9", 1),
        probe("sensor.qn", "probe_name", "unknown", "ph", "0x9", 1),
      ]),
    );
    expect(hub.probe_label(hub._all_probes[0])).toBe("Sump ORP (0x0)");
    expect(hub.probe_label(hub._all_probes[1])).toBe("ph (0x9)");
  });
});

describe("RSControl editor", () => {
  function editor(pins: Record<string, number> = {}): any {
    const hass = makeHass(
      Array.from({ length: 2 }, (_, i) =>
        probe("sensor.p" + i, "probe_orp_value", "1", "orp", "0x" + i, i),
      ),
    );
    const hub = new StubHub() as any;
    hub.device = { name: "Hub", elements: [{ id: "hub", disabled_by: null }] };
    hub._hass = hass;
    hub.setConfig({
      conf: { RSCONTROLPRO: { devices: { Hub: { probe_slots: pins } } } },
    });
    return hub;
  }

  it("lists every probe with Auto and each slot", () => {
    const hub = editor({ "orp:0x1": 5 });
    const dom = toDom(hub.renderEditor());
    const selects = dom.querySelectorAll("select");
    expect(selects.length).toBe(2);
    const first = selects[0] as HTMLSelectElement;
    expect(first.options.length).toBe(8);
    expect(first.options[0].textContent!.trim()).toMatch(/\(1\)$/);
    expect(first.options[first.selectedIndex].value).toBe("");
    const second = selects[1] as HTMLSelectElement;
    expect(second.options[second.selectedIndex].value).toBe("5");
  });

  it("pins and unpins a probe", () => {
    const hub = editor({ "orp:0x1": 5 });
    const dom = toDom(hub.renderEditor());
    const changes: any[] = [];
    hub.addEventListener("config-changed", (e: any) =>
      changes.push(e.detail.config.conf.RSCONTROLPRO.devices.Hub.probe_slots),
    );
    const selects = dom.querySelectorAll("select");
    (selects[0] as HTMLSelectElement).value = "3";
    selects[0].dispatchEvent(new Event("change"));
    (selects[1] as HTMLSelectElement).value = "";
    selects[1].dispatchEvent(new Event("change"));
    expect(changes).toEqual([{ "orp:0x1": 5, "orp:0x0": 3 }, {}]);
  });

  it("shows Auto without a slot for a probe left out", () => {
    const hub = editor();
    hub._populate_entities();
    hub._all_probes[1].slot = undefined;
    hub._populate_entities = vi.fn();
    const dom = toDom(hub.renderEditor());
    const second = dom.querySelectorAll("select")[1] as HTMLSelectElement;
    expect(second.options[0].textContent!.trim()).toBe("Auto");
  });

  it("works without any pin, and shows nothing for a disabled hub", () => {
    const hub = editor();
    delete hub.user_config.conf;
    expect(toDom(hub.renderEditor()).querySelectorAll("select").length).toBe(2);
    hub.config.probe_slots = undefined;
    const changes: any[] = [];
    hub.addEventListener("config-changed", (e: any) => changes.push(e));
    hub._handle_probe_slot_change("orp:0x0", "4");
    expect(changes).toHaveLength(1);
    hub.device.elements[0].disabled_by = "user";
    expect(toDom(hub.renderEditor()).querySelectorAll("select").length).toBe(0);
  });
});
