/**
 * The visual editor of the water parameters card: one row per chemistry, a
 * source bound to each ticked one, and the config-changed events it fires.
 */
import { describe, expect, it, vi } from "vitest";

import "../src/base/reef_parameters";
import "../src/base/reef_parameters_editor";
import { ReefParametersCard } from "../src/base/reef_parameters";
import { ReefParametersCardEditor } from "../src/base/reef_parameters_editor";

const KH = "sensor.reefer_425_kh";
const TEMP = "sensor.tank_temp";

function makeHass(): any {
  return {
    language: "en",
    states: {
      [KH]: {
        state: "8.2",
        attributes: {
          unit_of_measurement: "dKH",
          reef_parameter: "kh",
          friendly_name: "Reefer 425 KH",
        },
      },
      [TEMP]: {
        state: "25.4",
        attributes: { unit_of_measurement: "°C", device_class: "temperature" },
      },
    },
    entities: {
      [KH]: { platform: "reeftank" },
      [TEMP]: { platform: "template" },
    },
  };
}

async function makeEditor(config: any = {}, hass: any = makeHass()) {
  const editor = document.createElement(
    "reef-parameters-card-editor",
  ) as ReefParametersCardEditor;
  editor.setConfig(config);
  editor.hass = hass;
  document.body.appendChild(editor);
  await editor.updateComplete;
  return editor;
}

const $$ = (el: Element, selector: string) =>
  Array.from(el.shadowRoot!.querySelectorAll(selector)) as any[];

function nextConfig(editor: ReefParametersCardEditor): Promise<any> {
  return new Promise((resolve) => {
    editor.addEventListener(
      "config-changed",
      (e: any) => resolve(e.detail.config),
      { once: true },
    );
  });
}

/** The same bench, with the KH sensor filed against a named aquarium. */
function makeTankHass(): any {
  const hass = makeHass();
  hass.states[KH].attributes.aquarium = "a1b2";
  hass.entities[KH].device_id = "dev_a1b2";
  hass.devices = { dev_a1b2: { name: "Reefer 425" } };
  return hass;
}

const PROBE = "sensor.my_own_kh_probe";

describe("reef-parameters-card-editor, following one aquarium", () => {
  it("offers the aquariums, and nothing when reeftank backs none", async () => {
    const editor = await makeEditor({}, makeTankHass());
    const select = editor.shadowRoot!.querySelector(
      ".field select",
    ) as HTMLSelectElement;
    expect([...select.options].map((o) => o.value)).toEqual(["", "a1b2"]);
    expect([...select.options].map((o) => o.textContent!.trim())).toEqual([
      "Every aquarium",
      "Reefer 425",
    ]);
    editor.remove();
    // No aquarium known: no picker at all
    const plain = await makeEditor({});
    expect(plain.shadowRoot!.querySelector(".field select")).toBeNull();
    plain.remove();
  });

  it("drops the overrides of the tank being left", async () => {
    const editor = await makeEditor(
      { aquarium: "c3d4", parameters: [{ chemistry: "kh", hide: true }] },
      makeTankHass(),
    );
    const select = editor.shadowRoot!.querySelector(
      ".field select",
    ) as HTMLSelectElement;
    const pending = nextConfig(editor);
    select.value = "a1b2";
    select.dispatchEvent(new Event("change"));
    expect(await pending).toEqual({ aquarium: "a1b2" });
    editor.remove();
  });

  it("goes back to following every aquarium", async () => {
    const editor = await makeEditor({ aquarium: "a1b2" }, makeTankHass());
    const select = editor.shadowRoot!.querySelector(
      ".field select",
    ) as HTMLSelectElement;
    const pending = nextConfig(editor);
    select.value = "";
    select.dispatchEvent(new Event("change"));
    expect(await pending).toEqual({});
    editor.remove();
  });

  it("writes only what differs from the aquarium", async () => {
    const hass = makeTankHass();
    hass.states[PROBE] = {
      state: "8.1",
      attributes: { unit_of_measurement: "dKH" },
    };
    hass.entities[PROBE] = { platform: "template" };
    const editor = await makeEditor({ aquarium: "a1b2" }, hass);
    const pending = nextConfig(editor);
    (editor as any)._source("kh", PROBE);
    expect(await pending).toEqual({
      aquarium: "a1b2",
      parameters: [{ chemistry: "kh", source: PROBE }],
    });
    editor.remove();
  });

  it("records an unticked chemistry of the aquarium as hidden", async () => {
    const editor = await makeEditor({ aquarium: "a1b2" }, makeTankHass());
    const kh = $$(editor, ".row").find((r) =>
      r.textContent.trim().startsWith("KH"),
    );
    const box = kh.querySelector("input[type=checkbox]");
    // The aquarium's chemistries are ticked without being configured
    expect(box.checked).toBe(true);
    const pending = nextConfig(editor);
    box.checked = false;
    box.dispatchEvent(new Event("change"));
    expect(await pending).toEqual({
      aquarium: "a1b2",
      parameters: [{ chemistry: "kh", hide: true }],
    });
    editor.remove();
  });

  it("drops the overrides once nothing differs any more", async () => {
    const editor = await makeEditor(
      { aquarium: "a1b2", parameters: [{ chemistry: "kh", hide: true }] },
      makeTankHass(),
    );
    const kh = $$(editor, ".row").find((r) =>
      r.textContent.trim().startsWith("KH"),
    );
    const box = kh.querySelector("input[type=checkbox]");
    expect(box.checked).toBe(false);
    const pending = nextConfig(editor);
    box.checked = true;
    box.dispatchEvent(new Event("change"));
    expect(await pending).toEqual({ aquarium: "a1b2" });
    editor.remove();
  });
});

describe("reef-parameters-card-editor", () => {
  it("is the card's config element", () => {
    expect(ReefParametersCard.getConfigElement().tagName.toLowerCase()).toBe(
      "reef-parameters-card-editor",
    );
  });

  it("lists every chemistry, ticking the configured ones", async () => {
    const editor = await makeEditor({
      parameters: [{ chemistry: "kh", source: KH }],
    });
    const rows = $$(editor, ".row");
    // One row per chemistry of the catalogue
    expect(rows.length).toBeGreaterThan(10);
    const kh = rows.find((r) => r.textContent.trim().startsWith("KH"));
    expect(kh.querySelector("input[type=checkbox]").checked).toBe(true);
    // Its source select holds the reeftank sensor, by friendly name
    const option = kh.querySelector("select option");
    expect(option.value).toBe(KH);
    expect(option.textContent.trim()).toBe("Reefer 425 KH");
    expect(editor.hass).toBeTruthy();
    editor.remove();
  });

  it("follows a chemistry with its first compatible source", async () => {
    const editor = await makeEditor({});
    const temp = $$(editor, ".row").find((r) =>
      r.textContent.trim().startsWith("Temperature"),
    );
    const box = temp.querySelector("input[type=checkbox]");
    const pending = nextConfig(editor);
    box.checked = true;
    box.dispatchEvent(new Event("change"));
    const config = await pending;
    // The chemistries the card already draws stay followed: ticking one more
    // adds to them instead of silently dropping them.
    expect(config.parameters).toEqual([
      { chemistry: "kh", source: KH },
      { chemistry: "temperature", source: TEMP },
    ]);
    editor.remove();
  });

  it("unfollows a chemistry", async () => {
    const editor = await makeEditor({
      parameters: [{ chemistry: "kh", source: KH }],
    });
    const kh = $$(editor, ".row").find((r) =>
      r.textContent.trim().startsWith("KH"),
    );
    const box = kh.querySelector("input[type=checkbox]");
    const pending = nextConfig(editor);
    box.checked = false;
    box.dispatchEvent(new Event("change"));
    expect((await pending).parameters).toEqual([]);
    editor.remove();
  });

  it("changes the source, any sensor, hand-typed kept", async () => {
    const editor = await makeEditor({
      parameters: [{ chemistry: "kh", source: "sensor.custom_kh" }],
    });
    const kh = $$(editor, ".row").find((r) =>
      r.textContent.trim().startsWith("KH"),
    );
    const select = kh.querySelector("select");
    const values = Array.from(select.querySelectorAll("option")).map(
      (o: any) => o.value,
    );
    // Every sensor is offered, the hand-typed source among them
    expect(values).toContain(KH);
    expect(values).toContain(TEMP);
    expect(values).toContain("sensor.custom_kh");
    const pending = nextConfig(editor);
    select.value = KH;
    select.dispatchEvent(new Event("change"));
    expect((await pending).parameters).toEqual([
      { chemistry: "kh", source: KH },
    ]);
    editor.remove();
  });

  it("offers every sensor as a possible source", async () => {
    const editor = await makeEditor({
      parameters: [{ chemistry: "mg", source: "" }],
    });
    const mg = $$(editor, ".row").find((r) =>
      r.textContent.trim().startsWith("Mg"),
    );
    const values = Array.from(
      mg.querySelector("select").querySelectorAll("option"),
    ).map((o: any) => o.value);
    // Even a probe the card does not recognise for Mg can be picked
    expect(values).toEqual([KH, TEMP]);
    editor.remove();
  });

  it("shows an empty option when there is no sensor at all", async () => {
    const hass = makeHass();
    hass.states = {};
    const editor = await makeEditor(
      { parameters: [{ chemistry: "mg", source: "" }] },
      hass,
    );
    const mg = $$(editor, ".row").find((r) =>
      r.textContent.trim().startsWith("Mg"),
    );
    const empty = mg.querySelector("select option");
    expect(empty.value).toBe("");
    expect(empty.textContent.trim()).toBe("No compatible entity");
    editor.remove();
  });

  it("uses ha-entity-picker when the frontend provides it", async () => {
    if (!customElements.get("ha-entity-picker")) {
      customElements.define("ha-entity-picker", class extends HTMLElement {});
    }
    const editor = await makeEditor({
      parameters: [{ chemistry: "kh", source: KH }],
    });
    const picker: any = editor.shadowRoot!.querySelector("ha-entity-picker");
    expect(picker).toBeTruthy();
    expect(picker.value).toBe(KH);
    const pending = nextConfig(editor);
    picker.dispatchEvent(
      new CustomEvent("value-changed", { detail: { value: "sensor.new " } }),
    );
    expect((await pending).parameters).toEqual([
      { chemistry: "kh", source: "sensor.new" },
    ]);
    editor.remove();
  });

  it("edits the title and the window", async () => {
    const editor = await makeEditor({ title: "Old", days: 30 });
    const [title, days] = $$(editor, ".field input");
    let pending = nextConfig(editor);
    title.value = "Tests";
    title.dispatchEvent(new Event("input"));
    expect((await pending).title).toBe("Tests");
    // Cleared: dropped from the config
    pending = nextConfig(editor);
    title.value = "";
    title.dispatchEvent(new Event("input"));
    expect((await pending).title).toBeUndefined();
    // Days: a number, then cleared
    pending = nextConfig(editor);
    days.value = "60";
    days.dispatchEvent(new Event("input"));
    expect((await pending).days).toBe(60);
    pending = nextConfig(editor);
    days.value = "";
    days.dispatchEvent(new Event("input"));
    expect((await pending).days).toBeUndefined();
    editor.remove();
  });

  it("edits the four bounds of a followed chemistry", async () => {
    const editor = await makeEditor({
      parameters: [{ chemistry: "kh", source: KH }],
    });
    const kh = $$(editor, ".row").find((r) =>
      r.textContent.trim().startsWith("KH"),
    );
    const entry = kh.closest(".entry");
    const bounds = entry.querySelectorAll(".bounds input");
    expect(bounds).toHaveLength(4);
    const pending = nextConfig(editor);
    bounds[0].value = "7.2";
    bounds[0].dispatchEvent(new Event("input"));
    const cfg = await pending;
    // Editing one bound seeds the rest from the defaults
    expect(cfg.parameters[0].ranges).toHaveLength(4);
    expect(cfg.parameters[0].ranges[0]).toBe(7.2);
    // A blank value leaves the bound untouched
    const kept = nextConfig(editor);
    const again = editor.shadowRoot!.querySelector(
      ".entry .bounds input",
    ) as HTMLInputElement;
    again.value = "";
    again.dispatchEvent(new Event("input"));
    expect((await kept).parameters[0].ranges).toHaveLength(4);
    editor.remove();
  });

  it("defers to the integration bounds when the source provides them", async () => {
    const hass = makeHass();
    hass.states[KH].attributes.ranges = [7, 7.8, 9, 10.5];
    const editor = await makeEditor(
      { parameters: [{ chemistry: "kh", source: KH }] },
      hass,
    );
    const kh = $$(editor, ".row").find((r) =>
      r.textContent.trim().startsWith("KH"),
    );
    const entry = kh.closest(".entry");
    expect(entry.querySelector(".bounds.note")).toBeTruthy();
    expect(entry.querySelectorAll(".bounds input")).toHaveLength(0);
    editor.remove();
  });

  it("ignores a source change on a chemistry not followed", async () => {
    const editor = await makeEditor({});
    const changed = vi.fn();
    editor.addEventListener("config-changed", changed);
    // Nothing backs magnesium here, so no row of it is followed
    (editor as any)._source("mg", KH);
    expect(changed).not.toHaveBeenCalled();
    editor.remove();
  });
});
