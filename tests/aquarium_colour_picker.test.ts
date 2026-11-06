import { afterEach, describe, expect, it } from "vitest";
import {
  ReefColourPicker,
  hex_to_hsl,
  hsl_to_hex,
} from "../src/aquarium/editor/colour_picker";

if (!customElements.get("reef-colour-picker"))
  customElements.define("reef-colour-picker", ReefColourPicker);

afterEach(() => {
  document.body.innerHTML = "";
});

describe("hex_to_hsl / hsl_to_hex", () => {
  it("converts both ways", () => {
    const cases: [string, [number, number, number]][] = [
      ["#ff0000", [0, 100, 50]],
      ["#00ff00", [120, 100, 50]],
      ["#0000ff", [240, 100, 50]],
      ["#ff00ff", [300, 100, 50]],
      ["#808080", [0, 0, 50.2]],
      ["#ffffff", [0, 0, 100]],
    ];
    for (const [hex, hsl] of cases) {
      expect(hex_to_hsl(hex)).toEqual(hsl);
      expect(hsl_to_hex(hsl)).toBe(hex);
    }
    // every colour comes back unchanged (no drift when the picker opens)
    for (let n = 0; n < 0x1000000; n += 0x010305)
      expect(
        hsl_to_hex(hex_to_hsl(`#${n.toString(16).padStart(6, "0")}`)),
      ).toBe(`#${n.toString(16).padStart(6, "0")}`);
    // without # and in capitals
    expect(hex_to_hsl("FF0000")).toEqual([0, 100, 50]);
  });

  it("reads anything else as mid grey", () => {
    expect(hex_to_hsl("red")).toEqual([0, 0, 50.2]);
  });
});

async function picker(value: string): Promise<ReefColourPicker> {
  const el = document.createElement("reef-colour-picker") as ReefColourPicker;
  el.value = value;
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

/** Events sent by the picker, as [type, value]. */
function listen(el: HTMLElement): [string, string][] {
  const got: [string, string][] = [];
  for (const type of ["colour-input", "colour-change"])
    el.addEventListener(type, (e) =>
      got.push([type, (e as CustomEvent).detail.value]),
    );
  return got;
}

const sliders = (el: ReefColourPicker) =>
  [
    ...el.shadowRoot!.querySelectorAll("input[type=range]"),
  ] as HTMLInputElement[];
const hex_field = (el: ReefColourPicker) =>
  el.shadowRoot!.querySelector("input[type=text]") as HTMLInputElement;

function move(input: HTMLInputElement, value: number, type: string) {
  input.value = String(value);
  input.dispatchEvent(new Event(type));
}

describe("reef-colour-picker", () => {
  it("sets its sliders and hex field from the value", async () => {
    const el = await picker("#ff0000");
    expect(sliders(el).map((s) => s.value)).toEqual(["0", "100", "50"]);
    expect(sliders(el).map((s) => s.max)).toEqual(["360", "100", "100"]);
    expect(hex_field(el).value).toBe("#ff0000");
    // labels translated
    expect(el.shadowRoot!.querySelector("label")!.textContent).toBe("Hue");
  });

  it("sends the colour while sliding, and when released", async () => {
    const el = await picker("#ff0000");
    const got = listen(el);
    move(sliders(el)[0], 120, "input");
    move(sliders(el)[0], 240, "change");
    expect(got).toEqual([
      ["colour-input", "#00ff00"],
      ["colour-change", "#0000ff"],
    ]);
  });

  it("keeps the hue of a grey it sent, follows a new value", async () => {
    const el = await picker("#ff0000");
    move(sliders(el)[1], 0, "change"); // saturation 0: a grey
    el.value = "#808080"; // the grey comes back from the editor
    await el.updateComplete;
    move(sliders(el)[1], 100, "input");
    // the hue (red) was kept
    await el.updateComplete;
    expect(hex_field(el).value).toBe("#ff0000");

    el.value = "#0000ff"; // changed elsewhere (reset)
    await el.updateComplete;
    expect(sliders(el)[0].value).toBe("240");
  });

  it("takes a typed hex code, and puts back a wrong one", async () => {
    const el = await picker("#ff0000");
    const got = listen(el);
    const field = hex_field(el);
    field.value = " 00FF00 ";
    field.dispatchEvent(new Event("change"));
    expect(got).toEqual([
      ["colour-input", "#00ff00"],
      ["colour-change", "#00ff00"],
    ]);
    await el.updateComplete;
    expect(sliders(el)[0].value).toBe("120");

    field.value = "green";
    field.dispatchEvent(new Event("change"));
    expect(field.value).toBe("#00ff00");
    expect(got).toHaveLength(2);
  });
});
