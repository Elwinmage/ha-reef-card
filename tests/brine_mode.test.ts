// A ReefDose head in brine mode: driven by Home Assistant with manual doses,
// the schedule gives way to the brine in its dialog and on the main view

import { describe, expect, it, vi } from "vitest";
import { Dialog } from "../src/base/dialog";
import { MyElement } from "../src/base/element";
import { SafeEval } from "../src/utils/SafeEval";
import { DoseHead } from "../src/devices/redsea/rsdose/dose_head";
import { with_brine_mode } from "../src/devices/redsea/rsdose/brine.mapping";
import { dialogs_rsdose } from "../src/devices/redsea/rsdose/rsdose.dialogs";
import { config4 as rsdose4_mapping } from "../src/devices/redsea/rsdose/rsdose4.mapping";
import { config2 as rsdose2_mapping } from "../src/devices/redsea/rsdose/rsdose2.mapping";
import "../src/base/index";

vi.mock("../src/utils/actions", () => ({ run_action: vi.fn() }));

const MODE = "select.head_1_regulation_mode";
const SLM = "switch.head_1_slm";

function hass(mode: string | null, slm = "on"): any {
  const states: Record<string, any> = {
    [SLM]: { entity_id: SLM, state: slm, attributes: {} },
  };
  if (mode !== null) {
    states[MODE] = { entity_id: MODE, state: mode, attributes: {} };
  }
  return { states, devices: {}, entities: {}, callService: vi.fn() };
}

const device = {
  config: { id: 1, color: "0,0,0", alpha: 1 },
  entities: {
    regulation_mode: { entity_id: MODE },
    slm: { entity_id: SLM },
  },
  is_on: () => true,
};

/** Whether a mapping element is shown, after its `disabled_if`. */
function shown(conf: any, mode: string | null, slm = "on"): boolean {
  return !new SafeEval({
    entity: MyElement.createEntitiesContext(device, hass(mode, slm)),
    state: "5",
  } as any).evaluateCondition(conf.disabled_if);
}

// -- main view ----------------------------------------------------------------

describe("with_brine_mode", () => {
  const head = (rsdose4_mapping as any).heads.common.elements;

  it("puts each brine element right after the one it stands for", () => {
    const keys = Object.keys(head);
    for (const key of [
      "auto_dosed_today",
      "auto_dosed_today_circle",
      "doses_today",
      "container_volume",
    ]) {
      expect(keys[keys.indexOf(key) + 1]).toBe(`brine_${key}`);
    }
    expect(keys).not.toContain("brine_manual_dosed_today");
  });

  it("shows the brine dosed today against the brine planned", () => {
    for (const key of ["auto_dosed_today", "auto_dosed_today_circle"]) {
      const brine = head[`brine_${key}`];
      expect(brine).toMatchObject({
        name: "manual_dosed_today",
        target: "brine_daily_volume",
        type: head[key].type,
        put_in: "pump_state_labels",
        remove_if_disabled: true,
      });
      expect(head[key].remove_if_disabled).toBe(true);
    }
    expect(head.brine_doses_today).toMatchObject({
      name: "brine_salinity",
      type: "common-sensor",
    });
    // Options of the dose counter that mean nothing for a salinity
    for (const key of ["target", "unit", "force_integer"]) {
      expect(head.brine_doses_today).not.toHaveProperty(key);
    }
    // The days left come from the schedule's daily dose
    expect(head.brine_container_volume.label).toBe(false);
  });

  it("shows one of each pair, after the mode", () => {
    for (const mode of [null, "off", "assisted"]) {
      expect(shown(head.auto_dosed_today, mode)).toBe(true);
      expect(shown(head.brine_auto_dosed_today, mode)).toBe(false);
      expect(shown(head.auto_dosed_today_circle, mode)).toBe(true);
      expect(shown(head.brine_auto_dosed_today_circle, mode)).toBe(false);
      expect(shown(head.doses_today, mode)).toBe(true);
      expect(shown(head.brine_doses_today, mode)).toBe(false);
      expect(shown(head.brine_container_volume, mode)).toBe(false);
    }
    expect(shown(head.auto_dosed_today, "brine")).toBe(false);
    expect(shown(head.brine_auto_dosed_today, "brine")).toBe(true);
    expect(shown(head.auto_dosed_today_circle, "brine")).toBe(false);
    expect(shown(head.brine_auto_dosed_today_circle, "brine")).toBe(true);
    expect(shown(head.doses_today, "brine")).toBe(false);
    expect(shown(head.brine_doses_today, "brine")).toBe(true);
    // The "+n" of manual doses: the dosed volume itself in brine mode
    expect(shown(head.manual_dosed_today, "off")).toBe(true);
    expect(shown(head.manual_dosed_today, "brine")).toBe(false);
    // The container level, without stock management: nothing
    expect(shown(head.container_volume, "brine")).toBe(false);
    expect(shown(head.brine_container_volume, "brine")).toBe(true);
    expect(shown(head.brine_container_volume, "brine", "off")).toBe(false);
  });

  it("applies to both dosers", () => {
    const head2 = (rsdose2_mapping as any).heads.common.elements;
    expect(Object.keys(head2)).toEqual(
      expect.arrayContaining(["brine_auto_dosed_today_circle"]),
    );
  });

  it("leaves the other elements alone", () => {
    const elements = { other: { name: "x" } };
    expect(with_brine_mode(elements)).toEqual(elements);
  });
});

describe("remove_if_disabled", () => {
  it("takes the element out of the layout while disabled", async () => {
    const elt = MyElement.create_element(
      hass("brine"),
      {
        type: "common-sensor",
        name: "regulation_mode",
        disabled_if: "${entity.regulation_mode.state}==='brine'",
        remove_if_disabled: true,
      },
      device,
    ) as any;
    document.body.appendChild(elt);
    await elt.updateComplete;
    expect(elt.style.display).toBe("none");
    elt.hass = hass("off");
    await elt.updateComplete;
    expect(elt.style.display).toBe("");
    // Shown and not hidden before: left as it is
    elt.style.display = "block";
    elt.requestUpdate();
    await elt.updateComplete;
    expect(elt.style.display).toBe("block");
    elt.remove();
  });
});

describe("DoseHead in brine mode", () => {
  class StubHead extends DoseHead {}
  if (!customElements.get("stub-brine-head"))
    customElements.define("stub-brine-head", StubHead);

  function head(mode: string | null) {
    const dh = new StubHead() as any;
    dh.entities = {
      head_state: { entity_id: "sensor.hs" },
      schedule_enabled: { entity_id: "switch.sched" },
      regulation_mode: { entity_id: MODE },
    };
    const h = hass(mode);
    h.states["sensor.hs"] = { state: "ready", attributes: {} };
    h.states["switch.sched"] = { state: "off", attributes: {} };
    dh._hass = h;
    dh.device_state = { state: "on" };
    return dh;
  }

  it("is on with its schedule off", () => {
    expect(head("brine").brine_mode()).toBe(true);
    expect(head("brine").is_on()).toBe(true);
    for (const mode of [null, "off", "assisted"]) {
      expect(head(mode).brine_mode()).toBe(false);
      expect(head(mode).is_on()).toBe(false);
    }
    const dh = head("brine");
    dh.entities = {};
    expect(dh.brine_mode()).toBe(false);
  });
});

// -- head configuration dialog ------------------------------------------------

class StubDialog extends Dialog {
  override _fill_content(): void {
    this.shown = this._visibility();
  }
}
if (!customElements.get("stub-brine-dialog"))
  customElements.define("stub-brine-dialog", StubDialog);

function dialog(mode: string | null): any {
  const dlg = new StubDialog() as any;
  dlg._hass = hass(mode);
  dlg.elt = { device };
  dlg.to_render = dialogs_rsdose.head_configuration;
  dlg._fill_content();
  return dlg;
}

describe("Dialog content disabled_if", () => {
  it("shows the schedule or the brine, after the mode", () => {
    const items = dialogs_rsdose.head_configuration.content as any[];
    const flags = (dlg: any) =>
      items.map((item, i) => [item, dlg.shown[i] === "1"]);
    const brine = dialog("brine");
    for (const [item, on] of flags(brine)) {
      if (item.view === "extend") expect(on).toBe(false);
      if (item.view === "history-chart") expect(on).toBe(true);
    }
    const off = dialog("off");
    for (const [item, on] of flags(off)) {
      if (item.view === "extend") expect(on).toBe(true);
      if (item.view === "history-chart") expect(on).toBe(false);
    }
  });

  it("rebuilds the dialog when the mode changes", () => {
    const dlg = dialog("off");
    const fill = vi.spyOn(dlg, "_fill_content");
    const refresh = vi.spyOn(dlg, "_refresh_live_contents");
    // Nothing shown or hidden: only the cards are refreshed
    dlg.hass = hass("assisted");
    expect(fill).not.toHaveBeenCalled();
    expect(refresh).toHaveBeenCalledTimes(1);
    dlg.hass = hass("brine");
    expect(fill).toHaveBeenCalledTimes(1);
    expect(refresh).toHaveBeenCalledTimes(1);
    // Closed: nothing to rebuild
    dlg.to_render = null;
    dlg.hass = hass("off");
    expect(fill).toHaveBeenCalledTimes(1);
  });

  it("shows items without a condition", () => {
    const dlg = new StubDialog() as any;
    expect(dlg._hidden({ view: "text" })).toBe(false);
    expect(dlg._visibility()).toBe("");
  });
});
