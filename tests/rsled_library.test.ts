// Tests for the cloud library of the ReefLED program editor
// Covers: src/devices/redsea/rsled/rsled_program_editor.ts (library, naming)
//         library helpers of rsled_program.ts

import { afterEach, describe, expect, it, vi } from "vitest";

import "../src/devices/index";
import * as P from "../src/devices/redsea/rsled/rsled_program";
import {
  RSLedProgramEditor,
  library_clouds,
  pause,
} from "../src/devices/redsea/rsled/rsled_program_editor";
import { RSLed160 } from "../src/devices/redsea/rsled/rsled";

// G1 program of the lamp, and programs of its aquarium's library
const G1: P.DayProgram = {
  white: { rise: 660, set: 1260, points: [{ t: 120, i: 100 }] },
  blue: { rise: 660, set: 1341, points: [{ t: 60, i: 100 }] },
  moon: { rise: 1345, set: 1523, points: [{ t: 75, i: 10 }] },
};
const CYANO = {
  uid: "b",
  name: "cyano",
  program: {
    white: { rise: 660, set: 1260, points: [] },
    blue: { rise: 660, set: 1341, points: [{ t: 60, i: 100 }] },
    moon: { rise: 1345, set: 1523, points: [{ t: 75, i: 10 }] },
  },
  clouds: null,
};
const PERSO = {
  uid: "c",
  name: "Perso",
  program: CYANO.program,
  clouds: { from: 859, to: 996, intensity: "Medium" },
};
const DEEP = {
  uid: "g2",
  name: "Deep reef",
  program: {
    color: {
      rise: 540,
      set: 1260,
      points: [{ t: 60, i1: 60, k1: 14000, i2: 60, k2: 14000 }],
    },
    moon: { rise: 1245, set: 1410, points: [{ t: 60, i: 10 }] },
  },
  clouds: null,
};
const LIBRARY = [CYANO, PERSO, DEEP];

/** A lamp stub, linked to the cloud or not. */
function makeLed(opts: { linked?: boolean; g2?: boolean; library?: any } = {}) {
  const callWS = vi.fn(async (msg: any) => {
    if (msg.service === "led_library") {
      return {
        response: {
          linked: opts.linked ?? true,
          programs: opts.library ?? LIBRARY,
        },
      };
    }
    if (msg.service === "led_library_save") return { response: { uid: "n" } };
    throw new Error("unknown");
  });
  return {
    program: () => (opts.g2 ? null : G1),
    clouds: () => null,
    has_white_blue: () => !opts.g2,
    kelvin_range: () => ({ min: 8000, max: 23000 }),
    hass: { callService: vi.fn(), callWS },
    device: {
      elements: [
        {
          primary_config_entry: "own",
          model: opts.g2 ? "RSLED170" : "RSLED160",
        },
      ],
    },
  };
}

async function mountEditor(led: any, hint: P.ProgramFormat = "wb") {
  const ed = new RSLedProgramEditor() as any;
  ed.load(led, 1, hint);
  document.body.appendChild(ed);
  await ed.fetch_library(); // the one load() started
  await ed.updateComplete;
  return ed;
}

/** Paths sent through redsea.request, with their target. */
function requests(led: any): string[] {
  return led.hass.callService.mock.calls.map(
    (c: any[]) => `${c[2].device_id} ${c[2].access_path}`,
  );
}

afterEach(() => {
  document.body.innerHTML = "";
  vi.useRealTimers();
});

describe("rsled_program: library helpers", () => {
  it("preset_label() leaves out the app's stamp", () => {
    expect(P.preset_label("15K@11:00-1745049718480")).toBe("15K@11:00");
    expect(P.preset_label("Deep reef mod")).toBe("Deep reef mod");
    expect(P.preset_label("prog-202609281930")).toBe("prog-202609281930");
  });

  it("preset_name() stamps the name in milliseconds", () => {
    expect(P.preset_name("toto", new Date(1745049836266))).toBe(
      "toto-1745049836266",
    );
    expect(P.preset_name("x")).toMatch(/^x-\d{13}$/);
  });

  it("default_program_name() is prog-YYYYMMDDHHMM, local time", () => {
    expect(P.default_program_name(new Date(2026, 8, 3, 7, 5))).toBe(
      "prog-202609030705",
    );
    expect(P.default_program_name()).toMatch(/^prog-\d{12}$/);
  });

  it("device_clouds() shifts the clouds to the weekday", () => {
    expect(P.device_clouds(null, 2)).toBeNull();
    expect(P.device_clouds({ from: 10, to: 20, intensity: "Low" }, 3)).toEqual({
      from: 2890,
      to: 2900,
      intensity: "Low",
    });
    expect(P.device_clouds({ intensity: "Low" }, 3)).toEqual({
      intensity: "Low",
    });
  });
});

describe("fit_clouds() and has_clouds()", () => {
  const prog: any = {
    white: { rise: 600, set: 1200, points: [] },
    blue: { rise: 540, set: 1260, points: [] },
    moon: { rise: 1300, set: 1400, points: [] },
  };
  it("cuts the clouds to the day of light", () => {
    const inside = { from: 700, to: 800, intensity: "Low" };
    expect(P.fit_clouds(inside, prog)).toBe(inside);
    expect(P.fit_clouds({ from: 500, to: 1300 }, prog)).toEqual({
      from: 540,
      to: 1260,
    });
    // The moon does not count
    expect(P.fit_clouds({ from: 1300, to: 1350 }, prog)).toBeNull();
    const g2: any = { intensity: { rise: 600, set: 700, points: [] } };
    expect(P.fit_clouds({ from: 650, to: 800 }, g2)).toEqual({
      from: 650,
      to: 700,
    });
    expect(P.fit_clouds(inside, null)).toBeNull();
    expect(P.fit_clouds({}, prog)).toBeNull();
    expect(P.fit_clouds(null, prog)).toBeNull();
  });
  it("has_clouds(): a window", () => {
    expect(P.has_clouds({ from: 1, to: 2 })).toBe(true);
    expect(P.has_clouds({})).toBe(false);
    expect(P.has_clouds({ from: 1 })).toBe(false);
    expect(P.has_clouds("x")).toBe(false);
    expect(P.has_clouds(null)).toBe(false);
  });
});

describe("library_clouds()", () => {
  it("keeps the window and the intensity only", () => {
    expect(library_clouds(null)).toBeNull();
    expect(
      library_clouds({
        from: 601,
        to: 1182,
        intensity: "Medium",
        cloud_duration: 4,
        no_cloud_duration: 6,
      }),
    ).toEqual({ from: 601, to: 1182, intensity: "Medium" });
    expect(library_clouds({ intensity: "Low" })).toEqual({ intensity: "Low" });
  });
});

describe("RSLedProgramEditor: reading the library", () => {
  it("lists the programs of a linked lamp, once per lamp", async () => {
    const led = makeLed({ library: [...LIBRARY, { name: "x" }, null] });
    const ed = await mountEditor(led);
    expect(ed.library.map((p: any) => p.uid)).toEqual(["b", "c", "g2"]);
    const msg = led.hass.callWS.mock.calls[0][0];
    expect(msg.service).toBe("led_library");
    expect(msg.service_data).toEqual({ device_id: "own" });
    expect(msg.return_response).toBe(true);
    // Another day: the library is not read again
    ed.load(led, 2, "wb");
    expect(led.hass.callWS).toHaveBeenCalledTimes(2); // load + mountEditor
    const options = ed.shadowRoot.querySelectorAll(".library_select option");
    expect(options.length).toBe(4);
    expect(options[0].value).toBe("");
  });

  it("no library for a lamp not linked, or without the service", async () => {
    const ed = await mountEditor(makeLed({ linked: false }));
    expect(ed.library).toBeNull();
    expect(ed.shadowRoot.querySelector(".library")).toBeNull();

    const led: any = makeLed();
    led.hass.callWS = vi.fn().mockRejectedValue(new Error("unknown service"));
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const ed2 = await mountEditor(led);
    expect(ed2.library).toBeNull();
    warn.mockRestore();

    delete led.hass.callWS;
    const ed3 = await mountEditor(led);
    expect(ed3.library).toBeNull();
    const ed4 = await mountEditor({ ...makeLed(), device: { elements: [{}] } });
    expect(ed4.library).toBeNull();
  });

  it("a malformed answer means no library", async () => {
    const led: any = makeLed();
    led.hass.callWS = vi.fn().mockResolvedValue({});
    expect((await mountEditor(led)).library).toBeNull();
    led.hass.callWS = vi
      .fn()
      .mockResolvedValue({ response: { linked: true, programs: "x" } });
    expect((await mountEditor(led)).library).toBeNull();
  });
});

describe("RSLedProgramEditor: loading a library program", () => {
  it("G1 lamp, G1 program: loaded as is, back to the lamp's own", async () => {
    const ed = await mountEditor(makeLed());
    const select = ed.shadowRoot.querySelector(".library_select");
    select.value = "b";
    select.dispatchEvent(new Event("change"));
    await ed.updateComplete;
    expect(ed.library_entry).toBe(CYANO);
    expect(ed.format).toBe("wb");
    expect(ed.points.white.length).toBe(2); // rise and set only
    expect(ed.dirty).toBe(false);
    expect(select.querySelector("option[value='b']").selected).toBe(true);

    await ed.use_library("");
    expect(ed.library_entry).toBeNull();
    expect(ed.program()).toEqual(G1);
    await ed.use_library("unknown");
    expect(ed.library_entry).toBeNull();
  });

  it("G2 lamp, G1 program: shown in kelvin", async () => {
    const ed = await mountEditor(makeLed({ g2: true }), "kelvin");
    await ed.use_library("c");
    expect(ed.format).toBe("kelvin");
    expect(ed.points.intensity.every((p: any) => p.k > 0)).toBe(true);
  });

  it("G1 lamp, G2 program: edited in kelvin, saved as white/blue", async () => {
    const led = makeLed();
    const ed = await mountEditor(led);
    await ed.use_library("g2");
    expect(ed.format).toBe("wb");
    expect(ed.mode).toBe("kelvin");
    expect(ed._channel).toBe("intensity");
    const prog = await ed.program_to_save();
    expect(prog.intensity).toBeUndefined();
    expect(prog.white.rise).toBe(540);
    expect(prog.blue).toBeDefined();
  });

  it("G2 lamp, G2 program", async () => {
    const ed = await mountEditor(makeLed({ g2: true }), "kelvin");
    await ed.use_library("g2");
    expect(ed.points.intensity[1]).toEqual({ m: 600, i: 60, k: 14000 });
  });

  it("without a library, nothing to load", async () => {
    const ed = await mountEditor(makeLed({ linked: false }));
    await ed.use_library("b");
    expect(ed.library_entry).toBeNull();
  });
});

describe("RSLedProgramEditor: saving with the library", () => {
  it("not linked: straight to the lamp, its name kept", async () => {
    const led = makeLed({ linked: false });
    const ed = await mountEditor(led);
    ed.set_intensity(1, 50);
    await ed.save();
    expect(ed.naming).toBeNull();
    expect(requests(led)).toEqual(["own /auto/1", "own /auto/apply"]);
  });

  it("a library program: its name and its clouds go to the lamp", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(1745049836266));
    const led = makeLed();
    const ed = await mountEditor(led);
    await ed.use_library("c");
    await ed.save();
    // The clouds after the program: the lamp checks them against it
    expect(requests(led)).toEqual([
      "own /preset_name/1",
      "own /auto/1",
      "own /clouds/1",
      "own /auto/apply",
    ]);
    const calls = led.hass.callService.mock.calls.map((c: any[]) => c[2].data);
    expect(calls[0]).toEqual({ name: "Perso-1745049836266" });
    // With the durations of their intensity, as the app sends them
    expect(calls[2]).toEqual({
      ...PERSO.clouds,
      cloud_duration: 4,
      no_cloud_duration: 6,
    });
  });

  it("the lamp's clouds go before a program that cuts them", async () => {
    const led = makeLed();
    // The lamp holds clouds from 20:00 to 23:00
    led.clouds = () => ({ from: 1200, to: 1380, intensity: "High" });
    const ed = await mountEditor(led);
    await ed.save();
    const calls = led.hass.callService.mock.calls.map((c: any[]) => c[2]);
    expect(calls.map((c: any) => `${c.method} ${c.access_path}`)).toEqual([
      "delete /clouds/1",
      "post /auto/1",
      "post /clouds/1",
      "post /auto/apply",
    ]);
    // Cut to the day of the program
    const set = Math.max(ed.program().white.set, ed.program().blue.set);
    expect(calls[2].data).toEqual({
      from: 1200,
      to: set,
      intensity: "High",
      cloud_duration: 6,
      no_cloud_duration: 4,
    });
  });

  it("the lamp's clouds inside the new day are left alone", async () => {
    const led = makeLed();
    led.clouds = () => ({ from: 800, to: 900, intensity: "Low" });
    const ed = await mountEditor(led);
    await ed.save();
    expect(requests(led)).toEqual(["own /auto/1", "own /auto/apply"]);
  });

  it("a library program without clouds removes the lamp's", async () => {
    const led = makeLed();
    led.clouds = () => ({ from: 800, to: 900, intensity: "Low" });
    const ed = await mountEditor(led);
    await ed.use_library("b");
    await ed.save();
    const calls = led.hass.callService.mock.calls.map((c: any[]) => c[2]);
    expect(calls.map((c: any) => `${c.method} ${c.access_path}`)).toEqual([
      "post /preset_name/1",
      "delete /clouds/1",
      "post /auto/1",
      "post /auto/apply",
    ]);
  });

  it("a G2 gets the library clouds with its program", async () => {
    const led = makeLed({ g2: true });
    const ed = await mountEditor(led, "kelvin");
    await ed.use_library("c");
    await ed.updateComplete;
    // The colour labels over the points
    const svg = ed.shadowRoot.querySelector(".chart svg");
    expect(svg.lastElementChild.classList.contains("kelvin_labels")).toBe(true);
    expect(svg.querySelectorAll(".kelvin_labels").length).toBe(1);
    ed._all_days = true;
    await ed.save();
    const auto = led.hass.callService.mock.calls
      .map((c: any[]) => c[2])
      .filter((d: any) => d.access_path === "/auto/2")[0];
    expect(auto.data.clouds).toEqual({
      from: 859 + 1440,
      to: 996 + 1440,
      intensity: "Medium",
    });
    expect(requests(led)).not.toContain("own /clouds/1");
    // A G2 is named with the bare name of the program
    expect(led.hass.callService.mock.calls[0][2].data).toEqual({
      name: "Perso",
    });
  });

  it("the lamp's own program, unchanged: nothing to name", async () => {
    const led = makeLed();
    const ed = await mountEditor(led);
    await ed.save();
    expect(requests(led)).toEqual(["own /auto/1", "own /auto/apply"]);
  });

  it("a new program is named, added to the library, then sent", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 8, 28, 19, 30));
    const led = makeLed();
    const ed = await mountEditor(led);
    ed._channel = "blue";
    ed.set_intensity(1, 50); // the lamp's own program, edited: a new one
    await ed.save();
    expect(ed.naming).toBe("prog-202609281930");
    expect(led.hass.callService).not.toHaveBeenCalled();
    await ed.updateComplete;

    const input = ed.shadowRoot.querySelector(".naming_input");
    expect(input.value).toBe("prog-202609281930");
    input.value = "  ";
    input.dispatchEvent(new Event("input"));
    await ed.updateComplete;
    expect(ed.shadowRoot.querySelector(".naming_save").disabled).toBe(true);
    await ed.confirm_name(); // an empty name is not saved
    expect(ed.naming).toBe("  ");

    input.value = "Mon prog";
    input.dispatchEvent(new Event("input"));
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
    await vi.waitFor(() =>
      // Name, program, apply: no library clouds for the lamp's own program
      expect(led.hass.callService).toHaveBeenCalledTimes(3),
    );
    const save = led.hass.callWS.mock.calls
      .map((c: any[]) => c[0])
      .find((m: any) => m.service === "led_library_save");
    expect(save.service_data.device_id).toBe("own");
    expect(save.service_data.name).toBe("Mon prog");
    // On a single day's timeline, in the lamp's format
    expect(save.service_data.program.blue.rise).toBe(660);
    expect(save.service_data.program.blue.points[0].i).toBe(50);
    expect(save.service_data.clouds).toBeNull();
    expect(save.service_data.uid).toBeUndefined();
    expect(led.hass.callService.mock.calls[0][2].data.name).toMatch(
      /^Mon prog-\d{13}$/,
    );
  });

  it("the name can be given up, other keys do nothing", async () => {
    const led = makeLed();
    const ed = await mountEditor(led);
    ed.set_intensity(1, 50);
    await ed.shadowRoot.querySelector("button.save").click();
    await ed.updateComplete;
    const input = ed.shadowRoot.querySelector(".naming_input");
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "a" }));
    ed.shadowRoot.querySelector(".naming_cancel").click();
    await ed.updateComplete;
    expect(ed.naming).toBeNull();
    expect(ed.shadowRoot.querySelector(".naming")).toBeNull();
    expect(led.hass.callService).not.toHaveBeenCalled();
    // Named through the button
    ed.naming = "p";
    await ed.updateComplete;
    ed.shadowRoot.querySelector(".naming_save").click();
    await vi.waitFor(() => expect(led.hass.callService).toHaveBeenCalled());
  });

  it("a library program without clouds, a name confirmed twice", async () => {
    const { clouds: _c, ...no_clouds } = CYANO;
    const led = makeLed({ g2: true, library: [no_clouds] });
    const ed = await mountEditor(led, "kelvin");
    await ed.use_library("b");
    await ed.confirm_name(); // not asking for a name: nothing to do
    expect(led.hass.callService).not.toHaveBeenCalled();
    await ed.save();
    const auto = led.hass.callService.mock.calls[1][2];
    expect(auto.access_path).toBe("/auto/1");
    expect(auto.data.clouds).toBeUndefined();
  });

  it("a lamp with no target writes nothing to the library", async () => {
    const led: any = makeLed();
    const ed = await mountEditor(led);
    led.device = { elements: [{}] };
    await ed.save_to_library("x");
    expect(
      led.hass.callWS.mock.calls.filter(
        (c: any[]) => c[0].service === "led_library_save",
      ),
    ).toEqual([]);
  });
});

describe("RSLedProgramEditor: editing and deleting library programs", () => {
  const RED_SEA = { ...CYANO, uid: "rs", name: "23K", default: true };

  it("the Red Sea and the user's programs are listed apart", async () => {
    const ed = await mountEditor(makeLed({ library: [RED_SEA, PERSO] }));
    const groups = ed.shadowRoot.querySelectorAll(".library_select optgroup");
    expect([...groups].map((g: any) => g.label)).toEqual([
      "Red Sea",
      "My programs",
    ]);
    // Only the user's programs are listed: no Red Sea group
    const ed2 = await mountEditor(makeLed({ library: [PERSO] }));
    expect(
      ed2.shadowRoot.querySelectorAll(".library_select optgroup").length,
    ).toBe(1);
  });

  it("a Red Sea program can be loaded, not deleted nor updated", async () => {
    const led = makeLed({ library: [RED_SEA, PERSO] });
    const ed = await mountEditor(led);
    await ed.use_library("rs");
    await ed.updateComplete;
    expect(ed.own_entry()).toBeNull();
    expect(ed.shadowRoot.querySelector(".library_delete")).toBeNull();
    await ed.delete_from_library(); // refused
    expect(ed.library_entry).toBe(RED_SEA);
    // Edited: saved as a new program only, with a date name
    ed._channel = "blue";
    ed.set_intensity(1, 40);
    await ed.save();
    await ed.updateComplete;
    expect(ed.naming).toMatch(/^prog-\d{12}$/);
    expect(ed.shadowRoot.querySelector(".naming_update")).toBeNull();
    expect(ed.shadowRoot.querySelector(".naming_save").textContent.trim()).toBe(
      "Save",
    );
    ed.deleting = true; // no own program: nothing to confirm
    await ed.updateComplete;
    expect(ed.shadowRoot.querySelector(".deleting_confirm")).toBeNull();
  });

  it("one of the user's programs is updated under its name", async () => {
    const led = makeLed({ library: [RED_SEA, PERSO] });
    const ed = await mountEditor(led);
    await ed.use_library("c");
    ed._channel = "blue";
    ed.set_intensity(1, 40);
    await ed.save();
    await ed.updateComplete;
    expect(ed.naming).toBe("Perso");
    expect(ed.shadowRoot.querySelector(".naming_save").textContent.trim()).toBe(
      "Save as new",
    );
    const update = ed.shadowRoot.querySelector(".naming_update");
    expect(update.textContent.trim()).toBe("Update");
    update.click();
    await vi.waitFor(() => expect(led.hass.callService).toHaveBeenCalled());
    const save = led.hass.callWS.mock.calls
      .map((c: any[]) => c[0])
      .find((m: any) => m.service === "led_library_save");
    expect(save.service_data.uid).toBe("c");
    expect(save.service_data.name).toBe("Perso");
  });

  it("one of the user's programs saved as a new one", async () => {
    const led = makeLed({ library: [PERSO] });
    const ed = await mountEditor(led);
    await ed.use_library("c");
    ed._channel = "blue";
    ed.set_intensity(1, 40);
    await ed.save();
    ed.naming = "Perso bis";
    await ed.confirm_name();
    const save = led.hass.callWS.mock.calls
      .map((c: any[]) => c[0])
      .find((m: any) => m.service === "led_library_save");
    expect(save.service_data.uid).toBeUndefined();
    expect(save.service_data.name).toBe("Perso bis");
  });

  it("one of the user's programs is deleted after a confirmation", async () => {
    const led = makeLed({ library: [RED_SEA, PERSO] });
    const ed = await mountEditor(led);
    await ed.use_library("c");
    await ed.updateComplete;
    ed.shadowRoot.querySelector(".library_delete").click();
    await ed.updateComplete;
    expect(ed.shadowRoot.querySelector(".deleting_name").textContent).toBe(
      "Perso",
    );
    // Given up
    ed.shadowRoot.querySelector(".deleting_cancel").click();
    await ed.updateComplete;
    expect(ed.deleting).toBe(false);
    expect(ed.shadowRoot.querySelector(".deleting_name")).toBeNull();
    // Confirmed
    ed.deleting = true;
    await ed.updateComplete;
    ed.shadowRoot.querySelector(".deleting_confirm").click();
    await vi.waitFor(() => expect(ed.library_entry).toBeNull());
    const del = led.hass.callWS.mock.calls
      .map((c: any[]) => c[0])
      .find((m: any) => m.service === "led_library_delete");
    expect(del.service_data).toEqual({ device_id: "own", uid: "c" });
    // The library is read again and the lamp's program shown back
    expect(
      led.hass.callWS.mock.calls.filter(
        (c: any[]) => c[0].service === "led_library",
      ).length,
    ).toBe(3);
    expect(ed.program()).toEqual(G1);
  });
});

describe("RSLedProgramEditor: GPS weather mode", () => {
  it("in weather mode the day the weather made is shown, colours only", async () => {
    const led: any = makeLed();
    const sunny = {
      white: { rise: 420, set: 1140, points: [{ t: 300, i: 70 }] },
      blue: { rise: 420, set: 1140, points: [{ t: 300, i: 90 }] },
    };
    const entities: Record<string, any> = {
      weather_sync: { entity_id: "switch.led_weather_sync", state: "on" },
      weather_program: {
        attributes: { days: [{ weekday: 1, program: sunny }] },
      },
    };
    led.get_entity = (key: string) => entities[key] ?? null;
    const ed = await mountEditor(led);
    const root = ed.shadowRoot;
    expect(ed.program().white.rise).toBe(420);
    // A G1 shows the colours of the slots as colour temperatures
    await vi.waitFor(() => expect(ed.mode).toBe("kelvin"));
    ed._tick++;
    await ed.updateComplete;
    // Only the colour of each slot can be changed
    expect(
      [...root.querySelectorAll("td input.time, td input.intensity")].every(
        (i: any) => i.disabled,
      ),
    ).toBe(true);
    const kelvins = [...root.querySelectorAll("td input.kelvin")];
    expect(kelvins.length).toBeGreaterThan(0);
    expect(kelvins.every((i: any) => !i.disabled)).toBe(true);
    expect(root.querySelector(".colours_hint")).not.toBeNull();
    expect(root.querySelector("button.add")).toBeNull();
    expect(root.querySelector("button.remove")).toBeNull();
    expect(root.querySelector(".library")).toBeNull();
    expect(root.querySelector(".save").disabled).toBe(true);
    // The colours go to this day, or to every day
    expect(root.querySelector(".all_days").disabled).toBe(false);
    expect(root.querySelector(".handle.locked")).not.toBeNull();
    await ed.save();
    expect(ed.naming).toBeNull();
    expect(led.hass.callService).not.toHaveBeenCalled();
    // A handle cannot be dragged
    const ev = { preventDefault: vi.fn(), stopPropagation: vi.fn() };
    ed._on_handle_down(ev, 1);
    expect(ev.preventDefault).toHaveBeenCalled();

    // A new weather week: the chart follows
    entities.weather_program = {
      attributes: {
        days: [
          {
            weekday: 1,
            program: { ...sunny, white: { ...sunny.white, rise: 480 } },
          },
        ],
      },
    };
    ed.hass_changed();
    await ed.updateComplete;
    expect(ed.program().white.rise).toBe(480);
    ed.hass_changed(); // nothing new
    expect(ed.program().white.rise).toBe(480);

    // Mode off: the lamp's own program comes back, editable
    entities.weather_sync.state = "off";
    ed.hass_changed();
    await ed.updateComplete;
    expect(ed.program().white.rise).toBe(G1.white!.rise);
    expect(root.querySelector("button.add")).not.toBeNull();
    expect(root.querySelector(".save").disabled).toBe(false);
    ed.hass_changed(); // still off
    expect(ed.program().white.rise).toBe(G1.white!.rise);
  });

  it("weather mode without the day generated: what the lamp holds", async () => {
    const led: any = makeLed();
    led.get_entity = (key: string) =>
      key === "weather_sync" ? { entity_id: "switch.x", state: "on" } : null;
    const ed = await mountEditor(led);
    expect(ed.weather_program(1)).toBeNull();
    expect(ed.program().white.rise).toBe(G1.white!.rise);
    expect(ed.shadowRoot.querySelector(".save").disabled).toBe(true);
    const g2: any = makeLed({ g2: true });
    g2.get_entity = (key: string) =>
      key === "weather_sync"
        ? { entity_id: "switch.x", state: "on" }
        : { attributes: { days: [{ weekday: 2 }] } };
    const ed2 = await mountEditor(g2, "kelvin");
    expect(ed2.weather_program(1)).toBeNull();
    expect(ed2.weather_program(2)).toBeNull();
    // Out of the mode, a lamp holding no program: an empty one
    g2.get_entity = () => ({ state: "off" });
    ed2.hass_changed();
    expect(ed2.program()).toEqual({});
  });

  it("the lamp passes its new states to the editor", () => {
    const lamp: any = new RSLed160();
    const editor = { hass_changed: vi.fn() };
    lamp._program_editor = editor;
    lamp._setting_hass({ states: {}, entities: {}, devices: {} });
    expect(editor.hass_changed).toHaveBeenCalled();
    lamp._program_editor = null;
    lamp._setting_hass({ states: {}, entities: {}, devices: {} });
  });

  it("the switch previews the weather week; Save saves it all", async () => {
    const led: any = makeLed();
    const sunny = {
      white: { rise: 420, set: 1140, points: [{ t: 300, i: 70 }] },
    };
    const entities: Record<string, any> = {
      weather_sync: { entity_id: "switch.led_weather_sync", state: "off" },
    };
    led.get_entity = (key: string) => entities[key] ?? null;
    const asked: any[] = [];
    const callWS = led.hass.callWS;
    led.hass.callWS = vi.fn(async (msg: any) => {
      if (msg.service.startsWith("led_weather")) {
        asked.push([msg.service, msg.service_data]);
        const anchor = msg.service_data.settings?.anchor ?? "place";
        return {
          response: {
            status: "ok",
            days: [
              {
                weekday: 1,
                program:
                  anchor === "both"
                    ? { white: { ...sunny.white, rise: 500 } }
                    : sunny,
              },
              { weekday: 2, program: sunny },
            ],
            settings: { anchor: "place", period: "next_week" },
          },
        };
      }
      return callWS(msg);
    });
    const ed = await mountEditor(led);
    const root = ed.shadowRoot;
    expect(root.querySelector(".weather_switch").checked).toBe(false);
    expect(root.querySelector("rsled-weather-settings")).toBeNull();
    expect(asked).toEqual([]); // nothing read for a lamp out of the mode

    // On: the weather is read, its settings shown, nothing written
    ed.set_weather_mode(true);
    expect(ed.preview_loading).toBe(true);
    await ed.updateComplete;
    expect(root.querySelector(".weather_notice.pending").textContent).toContain(
      "Reading the weather",
    );
    expect(root.querySelector(".save").disabled).toBe(true);
    await vi.waitFor(() => expect(ed.preview_loading).toBe(false));
    await ed.updateComplete;
    expect(ed.program().white.rise).toBe(420);
    expect(ed.weather_settings).toEqual({
      anchor: "place",
      period: "next_week",
    });
    const panel = root.querySelector("rsled-weather-settings");
    expect(panel.settings.anchor).toBe("place");
    expect(panel.day).toBe(1);
    expect(root.querySelector("button.add")).toBeNull();
    expect(root.querySelector(".library")).toBeNull();
    expect(root.querySelector(".save").disabled).toBe(false);
    expect(root.querySelector(".weather_notice").textContent).toContain(
      "sent to the lamp on Save",
    );
    expect(led.hass.callService).not.toHaveBeenCalled();

    // A setting changed: previewed once the changes pause
    vi.useFakeTimers();
    panel.dispatchEvent(
      new CustomEvent("weather-setting", {
        detail: { key: "anchor", value: "sunrise" },
      }),
    );
    panel.dispatchEvent(
      new CustomEvent("weather-setting", {
        detail: { key: "anchor", value: "both" },
      }),
    );
    expect(ed.settings_dirty).toBe(true);
    vi.advanceTimersByTime(RSLedProgramEditor.PREVIEW_DELAY_MS);
    vi.useRealTimers();
    await vi.waitFor(() => expect(ed.program().white.rise).toBe(500));
    expect(asked.map((a) => a[1].settings?.anchor)).toEqual([
      undefined,
      "both",
    ]);
    // A day chosen in the week
    panel.dispatchEvent(new CustomEvent("weather-day", { detail: { day: 2 } }));
    expect(ed.day).toBe(2);
    expect(ed.weather_draft).toBe(true);

    // Save: the settings and the mode, told, then the editor closes
    const closed = vi.fn();
    ed.addEventListener("rsled-editor-close", closed);
    vi.useFakeTimers();
    const saving = ed.save();
    await Promise.resolve();
    expect(ed.saving).toBe("saving");
    await ed.updateComplete;
    expect(root.querySelector(".weather_notice").textContent).toContain(
      "Saving the settings",
    );
    expect(root.querySelector(".save").disabled).toBe(true);
    expect(root.querySelector(".cancel").disabled).toBe(true);
    await saving;
    // The integration is given time to start writing the lamp
    expect(ed.saving).toBe("saving");
    await ed.save(); // being saved: nothing more
    vi.advanceTimersByTime(RSLedProgramEditor.WRITE_GRACE_MS);
    // Nothing being written: saved
    expect(ed.saving).toBe("saved");
    await ed.save(); // already saved: nothing more
    await ed.updateComplete;
    expect(root.querySelector(".weather_notice").textContent).toContain(
      "Settings saved",
    );
    expect(closed).not.toHaveBeenCalled();
    vi.advanceTimersByTime(RSLedProgramEditor.SAVED_MS);
    vi.useRealTimers();
    expect(closed).toHaveBeenCalled();
    ed.saving = null;
    await vi.waitFor(() =>
      expect(asked[asked.length - 1]).toEqual([
        "led_weather_save",
        {
          device_id: "own",
          enabled: true,
          settings: { anchor: "both", period: "next_week" },
        },
      ]),
    );
    expect(ed.weather_draft).toBeNull();
    expect(ed.settings_dirty).toBe(false);

    // Back off before Save: the lamp's program, nothing to save
    ed.set_weather_mode(true);
    ed.set_weather_mode(false);
    expect(ed.weather_draft).toBeNull();
    expect(ed.program()).toEqual(G1);
  });

  it("a lamp in weather mode: settings read, saved only when changed", async () => {
    const led: any = makeLed();
    const entities: Record<string, any> = {
      weather_sync: { entity_id: "switch.led_weather_sync", state: "on" },
    };
    led.get_entity = (key: string) => entities[key] ?? null;
    const asked: any[] = [];
    const callWS = led.hass.callWS;
    led.hass.callWS = vi.fn(async (msg: any) => {
      if (msg.service.startsWith("led_weather")) {
        asked.push(msg.service);
        return {
          response: { status: "ok", days: [], settings: { clouds: true } },
        };
      }
      return callWS(msg);
    });
    const ed = await mountEditor(led);
    await vi.waitFor(() =>
      expect(ed.weather_settings).toEqual({ clouds: true }),
    );
    await ed.updateComplete;
    // Nothing changed: nothing to save
    expect(ed.shadowRoot.querySelector(".save").disabled).toBe(true);
    expect(
      ed.shadowRoot.querySelector(".weather_notice").textContent,
    ).toContain("GPS weather mode");
    await ed.save();
    expect(asked).toEqual(["led_weather_preview"]);
    ed.set_weather_setting("clouds", false);
    await ed.updateComplete;
    expect(ed.shadowRoot.querySelector(".save").disabled).toBe(false);
    expect(
      ed.shadowRoot.querySelector(".weather_notice").textContent,
    ).toContain("sent to the lamp on Save");
    await ed.save();
    await vi.waitFor(() => expect(asked).toContain("led_weather_save"));
  });

  it("turning the mode off shows the lamp's own week, to edit", async () => {
    const led: any = makeLed();
    const own = {
      white: { rise: 500, set: 1000, points: [{ t: 100, i: 40 }] },
      blue: { rise: 500, set: 1000, points: [{ t: 100, i: 60 }] },
    };
    const entities: Record<string, any> = {
      weather_sync: { entity_id: "switch.led_weather_sync", state: "on" },
    };
    led.get_entity = (key: string) => entities[key] ?? null;
    const saved: any[] = [];
    const callWS = led.hass.callWS;
    led.hass.callWS = vi.fn(async (msg: any) => {
      if (msg.service === "led_weather_preview")
        return { response: { status: "ok", days: [], standard: { "1": own } } };
      if (msg.service === "led_weather_save") {
        saved.push(msg.service_data);
        return { response: {} };
      }
      return callWS(msg);
    });
    const ed = await mountEditor(led);
    await vi.waitFor(() => expect(ed.preview_loading).toBe(false));
    // The lamp holds the weather's (here the fixture): read only
    expect(ed.locked()).toBe(true);
    ed.set_weather_mode(false);
    await ed.updateComplete;
    expect(ed.program().white.rise).toBe(500);
    expect(ed.locked()).toBe(false);
    expect(
      ed.shadowRoot.querySelector(".weather_notice").textContent,
    ).toContain("comes back on Save");
    expect(ed.shadowRoot.querySelector(".library")).not.toBeNull();
    // Saved unchanged: only the mode, the lamp written in the background
    const closed = vi.fn();
    ed.addEventListener("rsled-editor-close", closed);
    vi.useFakeTimers();
    await ed.save();
    expect(saved).toEqual([{ device_id: "own", enabled: false }]);
    vi.advanceTimersByTime(RSLedProgramEditor.WRITE_GRACE_MS);
    vi.advanceTimersByTime(RSLedProgramEditor.SAVED_MS);
    vi.useRealTimers();
    expect(closed).toHaveBeenCalled();
    expect(led.hass.callService).not.toHaveBeenCalled();
    ed.saving = null;

    // Edited: the mode, waited for, then the program
    ed.set_weather_mode(false);
    ed.set_intensity(1, 55);
    ed.library = null; // no naming step
    await ed.save();
    expect(saved[1]).toEqual({ device_id: "own", enabled: false, wait: true });
    expect(ed.saving).toBeNull();
    const paths = led.hass.callService.mock.calls.map(
      (c: any[]) => c[2].access_path,
    );
    expect(paths).toContain("/auto/1");
    // The switch now off elsewhere: nothing left to save
    ed.weather_draft = false;
    entities.weather_sync.state = "off";
    ed.hass_changed();
    expect(ed.weather_draft).toBeNull();
  });

  it("a preview that fails says why", async () => {
    const led: any = makeLed();
    led.get_entity = (key: string) =>
      key === "weather_sync" ? { entity_id: "switch.x", state: "off" } : null;
    const callWS = led.hass.callWS;
    led.hass.callWS = vi.fn(async (msg: any) =>
      msg.service === "led_weather_preview"
        ? { response: { status: "error", error: "offline" } }
        : callWS(msg),
    );
    const ed = await mountEditor(led);
    await ed.fetch_preview();
    ed.set_weather_mode(true);
    await ed.updateComplete;
    expect(
      ed.shadowRoot.querySelector(".weather_notice").textContent,
    ).toContain("⚠ offline");
    // Saving while the weather is read does nothing
    ed.preview_loading = true;
    await ed.save();
    ed.preview_loading = false;
    ed.preview = { status: "error" };
    ed._tick++;
    await ed.updateComplete;
    expect(
      ed.shadowRoot.querySelector(".weather_notice").textContent.trim(),
    ).toBe("⚠");
    // The switch in the page
    const toggle = ed.shadowRoot.querySelector(".weather_switch");
    toggle.checked = false;
    toggle.dispatchEvent(new Event("change"));
    expect(ed.weather_draft).toBeNull();
    ed.set_weather_mode(true);
    // Without an answer: no preview
    led.hass.callWS = vi.fn(async () => {
      throw new Error("x");
    });
    await ed.fetch_preview();
    expect(ed.preview).toBeNull();
    await ed.updateComplete;
    expect(
      ed.shadowRoot.querySelector(".weather_notice").textContent,
    ).toContain("sent to the lamp on Save");
  });

  it("a Save refused: the editor stays and says why", async () => {
    const led: any = makeLed();
    led.get_entity = (key: string) =>
      key === "weather_sync" ? { entity_id: "switch.x", state: "off" } : null;
    let answer: any = { status: "error", error: "period must be one of" };
    const callWS = led.hass.callWS;
    led.hass.callWS = vi.fn(async (msg: any) => {
      if (msg.service === "led_weather_preview")
        return { response: { status: "ok", days: [], settings: {} } };
      if (msg.service === "led_weather_save") {
        if (answer === "throw") throw new Error("x");
        return { response: answer };
      }
      return callWS(msg);
    });
    const ed = await mountEditor(led);
    ed.set_weather_mode(true);
    await vi.waitFor(() => expect(ed.preview_loading).toBe(false));
    const closed = vi.fn();
    ed.addEventListener("rsled-editor-close", closed);
    await ed.save();
    await ed.updateComplete;
    expect(ed.saving).toBeNull();
    expect(ed.weather_draft).toBe(true); // still to save
    expect(
      ed.shadowRoot.querySelector(".weather_notice").textContent,
    ).toContain("period must be one of");
    // No answer at all
    answer = "throw";
    ed.preview = null;
    await ed.save();
    expect(ed.preview.error).toBe("Saving failed");
    expect(closed).not.toHaveBeenCalled();
    // Leaving the mode, refused: nothing written either
    led.get_entity = (key: string) =>
      key === "weather_sync" ? { entity_id: "switch.x", state: "on" } : null;
    ed.weather_draft = null;
    ed.set_weather_mode(false);
    await ed.save();
    expect(ed.weather_draft).toBe(false);
    expect(led.hass.callService).not.toHaveBeenCalled();
  });
});

describe("RSLedProgramEditor: weather colours, loading and pacing", () => {
  /** A G2 lamp following the weather, its week previewed by the service. */
  function weatherLed() {
    const led: any = makeLed({ g2: true });
    const day = {
      color: {
        rise: 600,
        set: 1200,
        points: [
          { t: 0, i1: 0, k1: 12000, i2: 0, k2: 12000 },
          { t: 300, i1: 80, k1: 15000, i2: 80, k2: 15000 },
          { t: 600, i1: 0, k1: 20000, i2: 0, k2: 20000 },
        ],
      },
    };
    const entities: Record<string, any> = {
      weather_sync: { entity_id: "switch.led_weather_sync", state: "on" },
    };
    led.get_entity = (key: string) => entities[key] ?? null;
    const asked: any[] = [];
    const callWS = led.hass.callWS;
    led.hass.callWS = vi.fn(async (msg: any) => {
      if (msg.service === "led_weather_preview") {
        asked.push(msg.service_data);
        return {
          response: {
            status: "ok",
            days: [{ weekday: 1, program: day }],
            settings: { anchor: "place", colors: {} },
          },
        };
      }
      return callWS(msg);
    });
    return { led, asked };
  }

  it("the weather being read covers the chart and the slots", async () => {
    const { led } = weatherLed();
    const ed = await mountEditor(led, "kelvin");
    ed.preview_loading = true;
    ed._tick++;
    await ed.updateComplete;
    const zone = ed.shadowRoot.querySelector(".body .loading_zone");
    expect(zone.querySelector(".spinner")).not.toBeNull();
    expect(zone.textContent).toContain("Reading the weather");
    // Nothing to change meanwhile
    expect(ed.colour_only()).toBe(false);
    expect(ed.shadowRoot.querySelector(".all_days").disabled).toBe(true);
    await vi.waitFor(() => expect(ed.weather_settings).not.toBeNull());
  });

  it("the colour of a slot becomes the weather day's colour", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const { led, asked } = weatherLed();
    const ed = await mountEditor(led, "kelvin");
    await vi.waitFor(() => expect(ed.preview_loading).toBe(false));
    await ed.updateComplete;
    expect(ed.colour_only()).toBe(true);
    const root = ed.shadowRoot;
    expect(root.querySelector(".colours_hint").textContent).toContain(
      "only the colour",
    );
    const k = root.querySelectorAll("td input.kelvin")[1];
    expect(k.disabled).toBe(false);
    k.value = "17000";
    k.dispatchEvent(new Event("change"));
    // The slots' colours, from the rise (0) to the set (1)
    const pts = ed.points.intensity;
    const profile = ed.weather_settings.colors["1"];
    expect(Object.keys(ed.weather_settings.colors)).toEqual(["1"]);
    expect(profile.length).toBe(pts.length);
    expect(profile[0].at).toBe(0);
    expect(profile.at(-1).at).toBe(1);
    expect(profile[1].k).toBe(17000);
    expect(profile.map((p: any) => p.k)).toEqual(
      pts.map((p: any) => p.k ?? 15000),
    );
    expect(ed.settings_dirty).toBe(true);
    // Every day at once
    ed._all_days = true;
    ed.set_kelvin(0, 9000);
    expect(Object.keys(ed.weather_settings.colors)).toEqual([
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
    ]);
    expect(ed.weather_settings.colors["7"][0]).toEqual({ at: 0, k: 9000 });
    // The week they make is previewed
    await vi.advanceTimersByTimeAsync(RSLedProgramEditor.PREVIEW_DELAY_MS);
    await vi.waitFor(() =>
      expect(asked.at(-1)?.settings?.colors?.["7"]).toBeDefined(),
    );
    // A day without its slots: nothing to take
    ed.points.intensity = [{ m: 600, i: 0, k: 12000 }];
    const before = ed.weather_settings.colors;
    ed._weather_colors();
    expect(ed.weather_settings.colors).toBe(before);
    ed.points.intensity = [];
    ed._weather_colors();
    // Out of weather mode, a colour stays the program's
    ed.weather_draft = false;
    ed.points.intensity = [
      { m: 600, i: 0, k: 12000 },
      { m: 1200, i: 0, k: 12000 },
    ];
    ed._channel = "intensity";
    ed.set_kelvin(1, 15000);
    expect(ed.weather_settings.colors).toBe(before);
    // A slot at the same moment as the rise: at 0
    ed.weather_draft = null;
    ed.points.intensity = [
      { m: 600, i: 0 },
      { m: 600, i: 0, k: 14000 },
    ];
    ed._weather_colors();
    expect(ed.weather_settings.colors["1"]).toEqual([
      { at: 0, k: 15000 },
      { at: 0, k: 14000 },
    ]);
  });

  it("a program is written paced, its progress shown", async () => {
    const led: any = makeLed({ linked: false });
    const ed = await mountEditor(led);
    const seen: any[] = [];
    led.hass.callService = vi.fn(async () => {
      seen.push({ ...ed.writing });
      await ed.updateComplete;
      if (seen.length === 1) {
        const zone = ed.shadowRoot.querySelector(".loading_zone.writing");
        seen.push(zone.textContent.replace(/\s+/g, " ").trim());
        seen.push(zone.querySelector(".progress > div").style.width);
      }
    });
    const pauses: number[] = [];
    const timer = vi.spyOn(globalThis, "setTimeout").mockImplementation(((
      fn: any,
      ms: number,
    ) => {
      pauses.push(ms);
      fn();
      return 0;
    }) as any);
    RSLedProgramEditor.WRITE_DELAY_MS = 2000;
    try {
      await ed.write(null);
    } finally {
      RSLedProgramEditor.WRITE_DELAY_MS = 0;
      timer.mockRestore();
    }
    // /auto/1 and /auto/apply, a pause between them
    expect(led.hass.callService).toHaveBeenCalledTimes(2);
    expect(pauses).toEqual([2000]);
    expect(seen[0]).toEqual({ done: 0, total: 2 });
    expect(seen[1]).toContain("0/2");
    expect(seen[2]).toBe("0%");
    expect(seen[3]).toEqual({ done: 1, total: 2 });
    expect(ed.writing).toBeNull();
    expect(ed.shadowRoot.querySelector(".loading_zone.writing")).toBeNull();
    // Nothing to write: no progress
    ed.writing = { done: 0, total: 0 };
    ed._tick++;
    await ed.updateComplete;
    expect(
      ed.shadowRoot.querySelector(".loading_zone.writing .progress > div").style
        .width,
    ).toBe("0%");
    ed.writing = null;
  });

  it("pause() waits the time asked, nothing for 0", async () => {
    vi.useFakeTimers();
    let done = false;
    const wait = pause(2000).then(() => {
      done = true;
    });
    await vi.advanceTimersByTimeAsync(1999);
    expect(done).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    await wait;
    expect(done).toBe(true);
    await pause(0);
  });
});

describe("RSLedProgramEditor: edge cases of the new helpers", () => {
  it("weather colours without slots nor settings yet", async () => {
    const ed = await mountEditor(makeLed({ g2: true }), "kelvin");
    ed.points.intensity = undefined;
    ed._weather_colors();
    expect(ed.weather_settings).toBeNull();
    ed.weather_settings = null;
    ed.points.intensity = [
      { m: 600, i: 0, k: 12000 },
      { m: 1200, i: 0 },
    ];
    ed._weather_colors();
    expect(ed.weather_settings.colors["1"]).toEqual([
      { at: 0, k: 12000 },
      { at: 1, k: 15000 },
    ]);
  });

  it("a mode switch finished after another program was loaded is dropped", async () => {
    const ed = await mountEditor(makeLed(), "wb");
    await ed.set_mode("kelvin");
    expect(ed.mode).toBe("kelvin");
    const to_wb = ed.set_mode("wb");
    ed._loaded++;
    await to_wb;
    expect(ed.mode).toBe("kelvin");
    ed.mode = "wb";
    const to_k = ed.set_mode("kelvin");
    ed._loaded++;
    await to_k;
    expect(ed.mode).toBe("wb");
  });
});

describe("RSLedProgramEditor: clouds of the day", () => {
  /** The requests sent, as "method path". */
  const sent = (led: any) =>
    led.hass.callService.mock.calls.map((c: any[]) => c[2]);
  const paths = (led: any) =>
    sent(led).map((c: any) => `${c.method} ${c.access_path}`);
  const field = (ed: any, cls: string) =>
    ed.shadowRoot.querySelector(`.clouds_edit .${cls}`) as any;
  const change = async (ed: any, cls: string, set: (el: any) => void) => {
    const el = field(ed, cls);
    set(el);
    el.dispatchEvent(new Event("change"));
    await ed.updateComplete;
  };

  it("with_cloud_durations(): the durations of each intensity", () => {
    expect(
      P.with_cloud_durations({ from: 1, to: 2, intensity: "Low" }),
    ).toEqual({
      from: 1,
      to: 2,
      intensity: "Low",
      cloud_duration: 3,
      no_cloud_duration: 7,
    });
    const odd = { from: 1, to: 2, intensity: "Storm" };
    expect(P.with_cloud_durations(odd)).toBe(odd);
    expect(P.with_cloud_durations(null)).toBeNull();
  });

  it("adds one window of clouds to a day, inside its light", async () => {
    const led = makeLed({ linked: false });
    const ed = await mountEditor(led);
    const window = P.sun_window(ed.chart_program())!;
    expect(field(ed, "clouds_on").checked).toBe(false);
    expect(field(ed, "clouds_from")).toBeNull();
    await change(ed, "clouds_on", (el) => (el.checked = true));
    // The whole day of light, medium
    expect(ed.clouds()).toEqual({
      from: window.rise,
      to: window.set,
      intensity: "Medium",
    });
    expect(ed.dirty).toBe(true);
    expect(ed.shadowRoot.querySelector(".clouds_band")).not.toBeNull();
    expect(field(ed, "clouds_level").value).toBe("Medium");
    await change(ed, "clouds_from", (el) => (el.value = "14:00"));
    await change(ed, "clouds_to", (el) => (el.value = "16:30"));
    await change(ed, "clouds_level", (el) => (el.value = "High"));
    expect(ed.clouds()).toEqual({ from: 840, to: 990, intensity: "High" });
    // Kept inside the day of light; a time leaving nothing is not taken
    ed.set_clouds_time("from", "00:10");
    expect(ed.clouds().from).toBe(window.rise);
    ed.set_clouds_time("to", "23:59");
    expect(ed.clouds().to).toBe(window.set);
    ed.set_clouds_time("from", "14:00");
    ed.set_clouds_time("to", "16:30");
    ed.set_clouds_time("to", "13:00");
    ed.set_clouds_time("to", "nope");
    ed.set_clouds_intensity("Storm");
    expect(ed.clouds()).toEqual({ from: 840, to: 990, intensity: "High" });

    await ed.save();
    expect(paths(led)).toEqual([
      "post /auto/1",
      "post /clouds/1",
      "post /auto/apply",
    ]);
    expect(sent(led)[1].data).toEqual({
      from: 840,
      to: 990,
      intensity: "High",
      cloud_duration: 6,
      no_cloud_duration: 4,
    });
  });

  it("changes or removes the clouds the lamp holds", async () => {
    const led = makeLed({ linked: false });
    led.clouds = () => ({ from: 800, to: 900, intensity: "Low" });
    const ed = await mountEditor(led);
    expect(field(ed, "clouds_on").checked).toBe(true);
    expect(field(ed, "clouds_from").value).toBe("13:20");
    // The intensity alone: written again
    ed.set_clouds_intensity("Medium");
    ed._all_days = true;
    await ed.save();
    expect(paths(led).filter((p: string) => p.includes("clouds")).length).toBe(
      14,
    );
    expect(sent(led)[2].data.intensity).toBe("Medium");
    // Day 2, on the weekly timeline
    expect(sent(led)[5].data.from).toBe(800 + 1440);

    led.hass.callService.mockClear();
    const again = await mountEditor(led);
    await change(again, "clouds_on", (el) => (el.checked = false));
    expect(again.clouds()).toBeNull();
    expect(field(again, "clouds_level")).toBeNull();
    await again.save();
    expect(paths(led)).toEqual([
      "delete /clouds/1",
      "post /auto/1",
      "post /auto/apply",
    ]);
    // Another day loaded: the lamp's own again
    again.load(led, 2, "wb");
    expect(again.clouds_edit).toBeUndefined();
    // Clouds held without an intensity: medium once edited
    led.clouds = () => ({ from: 800, to: 900 });
    again.set_clouds_time("to", "15:10");
    expect(again.clouds()).toEqual({ from: 800, to: 910, intensity: "Medium" });
  });

  it("a G2 takes them in its program; a past-midnight day", async () => {
    const led = makeLed({ g2: true, linked: false });
    const ed = await mountEditor(led, "kelvin");
    // Nothing to put clouds on without a day of light
    expect(field(ed, "clouds_on").disabled).toBe(true);
    ed.set_clouds(true);
    ed.set_clouds_time("from", "10:00");
    ed.set_clouds_intensity("Low");
    expect(ed.clouds()).toBeNull();
    // A day of light from 18:00 to 02:00
    ed.points.intensity = [
      { m: 1080, i: 0, k: 15000 },
      { m: 1200, i: 60, k: 15000 },
      { m: 1560, i: 0, k: 15000 },
    ];
    ed.set_clouds(true);
    ed.set_clouds_time("from", "23:00");
    ed.set_clouds_time("to", "01:00");
    expect(ed.clouds()).toEqual({ from: 1380, to: 1500, intensity: "Medium" });
    await ed.save();
    const auto = sent(led).find((c: any) => c.access_path === "/auto/1");
    expect(auto.data.clouds).toEqual({
      from: 1380,
      to: 1500,
      intensity: "Medium",
    });
    expect(paths(led).some((p: string) => p.includes("/clouds/"))).toBe(false);
  });

  it("is left to the weather in GPS mode", async () => {
    const led: any = makeLed({ linked: false });
    led.get_entity = (name: string) =>
      name === "weather_sync" ? { state: "on" } : undefined;
    const ed = await mountEditor(led);
    await ed.updateComplete;
    expect(ed.shadowRoot.querySelector(".clouds_edit")).toBeNull();
  });
});

describe("RSLedProgramEditor: a G1 grouped with a G2", () => {
  it("is edited as intensity and colour, saved as white/blue", async () => {
    const led: any = makeLed({ linked: false });
    led.can_white_blue = () => false;
    const ed = await mountEditor(led);
    await vi.waitFor(() => expect(ed.mode).toBe("kelvin"));
    await ed.updateComplete;
    expect(ed.white_blue_allowed()).toBe(false);
    expect(ed.format).toBe("wb");
    // No W/B | K choice
    expect(ed.shadowRoot.querySelector(".mode")).toBeNull();
    const prog = await ed.program_to_save();
    expect(prog.white).toBeDefined();
    expect(prog.blue).toBeDefined();
    // A G1 on its own keeps the choice
    const free = await mountEditor(makeLed({ linked: false }));
    expect(free.white_blue_allowed()).toBe(true);
    expect(free.mode).toBe("wb");
    expect(free.shadowRoot.querySelector(".mode")).not.toBeNull();
  });
});

describe("RSLedProgramEditor: the lamp written by the integration", () => {
  /** A lamp whose weather mode and writing progress can be set. */
  function weatherLed(on: boolean) {
    const led: any = makeLed({ linked: false });
    const entities: Record<string, any> = {
      weather_sync: {
        entity_id: "switch.led_weather_sync",
        state: on ? "on" : "off",
      },
      weather_program: {
        entity_id: "sensor.led_weather_program",
        attributes: {},
      },
    };
    led.get_entity = (key: string) => entities[key] ?? null;
    const saved: any[] = [];
    led.hass.callWS = vi.fn(async (msg: any) => {
      if (msg.service === "led_weather_preview") {
        return { response: { status: "ok", days: [], standard: {} } };
      }
      if (msg.service === "led_weather_save") {
        saved.push(msg.service_data);
        return { response: { status: "ok" } };
      }
      return { response: { linked: false, programs: [] } };
    });
    const write = (writing: any) => {
      entities.weather_program.attributes = { writing };
    };
    return { led, saved, write, entities };
  }
  const overlay = (ed: any) =>
    ed.shadowRoot.querySelector(".loading_zone.writing");

  it("standard to GPS: the progress is shown until the week is written", async () => {
    const { led, saved, write } = weatherLed(false);
    const ed = await mountEditor(led);
    ed.set_weather_mode(true);
    await vi.waitFor(() => expect(ed.preview_loading).toBe(false));
    const closed = vi.fn();
    ed.addEventListener("rsled-editor-close", closed);
    vi.useFakeTimers();
    await ed.save();
    expect(saved).toEqual([{ device_id: "own", enabled: true }]);
    expect(ed.saving).toBe("saving");
    // The integration starts writing: seen through the states
    write({ done: 0, total: 7 });
    ed.hass_changed();
    await ed.updateComplete;
    expect(overlay(ed).textContent).toContain("0/7");
    // Past the time given to start: still being written, the editor stays
    vi.advanceTimersByTime(RSLedProgramEditor.WRITE_GRACE_MS);
    write({ done: 3, total: 7 });
    ed.hass_changed();
    await ed.updateComplete;
    expect(overlay(ed).textContent).toContain("3/7");
    expect(overlay(ed).querySelector(".progress div").style.width).toBe("43%");
    expect(ed.saving).toBe("saving");
    expect(closed).not.toHaveBeenCalled();
    // Written: said, then the editor closes
    write(null);
    ed.hass_changed();
    await ed.updateComplete;
    expect(overlay(ed)).toBeNull();
    expect(ed.saving).toBe("saved");
    ed.hass_changed(); // nothing more to follow
    vi.advanceTimersByTime(RSLedProgramEditor.SAVED_MS);
    vi.useRealTimers();
    expect(closed).toHaveBeenCalledTimes(1);
  });

  it("GPS to the lamp's own week: the same, already being written", async () => {
    const { led, saved, write } = weatherLed(true);
    const ed = await mountEditor(led);
    await vi.waitFor(() => expect(ed.preview_loading).toBe(false));
    ed.set_weather_mode(false);
    const closed = vi.fn();
    ed.addEventListener("rsled-editor-close", closed);
    vi.useFakeTimers();
    // The states already tell the week is being written back
    write({ done: 1, total: 14 });
    await ed.save();
    expect(saved).toEqual([{ device_id: "own", enabled: false }]);
    await ed.updateComplete;
    expect(overlay(ed).textContent).toContain("1/14");
    // Done before the time given to start is over
    write(null);
    ed.hass_changed();
    expect(ed.saving).toBe("saved");
    vi.advanceTimersByTime(
      RSLedProgramEditor.WRITE_GRACE_MS + RSLedProgramEditor.SAVED_MS,
    );
    vi.useRealTimers();
    expect(closed).toHaveBeenCalledTimes(1);
  });

  it("started late: still followed after the time given to start", async () => {
    const { led, write } = weatherLed(false);
    const ed = await mountEditor(led);
    ed.set_weather_mode(true);
    await vi.waitFor(() => expect(ed.preview_loading).toBe(false));
    vi.useFakeTimers();
    await ed.save();
    // The states changed for something else: nothing written yet
    ed.hass_changed();
    expect(ed.saving).toBe("saving");
    // Being written when the time is over, the states not followed yet
    write({ done: 0, total: 7 });
    vi.advanceTimersByTime(RSLedProgramEditor.WRITE_GRACE_MS);
    expect(ed.saving).toBe("saving");
    ed.hass_changed();
    write(null);
    ed.hass_changed();
    expect(ed.saving).toBe("saved");
    vi.useRealTimers();
  });

  it("shows a lamp being written when the editor opens; odd progress", async () => {
    const { led, write, entities } = weatherLed(true);
    write({ done: 2, total: 7 });
    const ed = await mountEditor(led);
    await ed.updateComplete;
    expect(overlay(ed).textContent).toContain("2/7");
    write({ total: 0 });
    expect(ed.lamp_writing()).toEqual({ done: 0, total: 0 });
    write("soon");
    expect(ed.lamp_writing()).toBeNull();
    delete entities.weather_program;
    expect(ed.lamp_writing()).toBeNull();
  });
});

describe("RSLedProgramEditor: renaming a library program", () => {
  /** A lamp whose library answers the rename service. */
  function renamable(answer: any = { uid: "c", renamed: 2 }) {
    const led: any = makeLed();
    const asked: any[] = [];
    let library = LIBRARY.map((p) => ({ ...p, default: p.uid === "b" }));
    const callWS = led.hass.callWS;
    led.hass.callWS = vi.fn(async (msg: any) => {
      if (msg.service === "led_library_rename") {
        asked.push(msg.service_data);
        if (answer && !answer.error) {
          library = library.map((p) =>
            p.uid === msg.service_data.uid
              ? { ...p, name: msg.service_data.name }
              : p,
          );
        }
        return { response: answer };
      }
      if (msg.service === "led_library") {
        return { response: { linked: true, programs: library } };
      }
      return callWS(msg);
    });
    return { led, asked };
  }
  const box = (ed: any, cls: string) => ed.shadowRoot.querySelector(cls) as any;

  it("renames the loaded user's program, the lamps following", async () => {
    const { led, asked } = renamable();
    const ed = await mountEditor(led);
    // Nothing to rename on the lamp's own program, nor a Red Sea one
    expect(box(ed, ".library_rename")).toBeNull();
    await ed.use_library("b");
    await ed.updateComplete;
    expect(box(ed, ".library_rename")).toBeNull();
    await ed.rename_in_library();
    expect(asked).toEqual([]);

    await ed.use_library("c");
    await ed.updateComplete;
    box(ed, ".library_rename").click();
    await ed.updateComplete;
    const input = box(ed, ".renaming_input");
    expect(input.value).toBe("Perso");
    // The same name: nothing asked
    await ed.rename_in_library();
    expect(asked).toEqual([]);
    expect(ed.renaming).toBeNull();

    box(ed, ".library_rename").click();
    await ed.updateComplete;
    // An empty name cannot be sent
    const typed = box(ed, ".renaming_input");
    typed.value = "  ";
    typed.dispatchEvent(new Event("input"));
    await ed.updateComplete;
    expect(box(ed, ".renaming_confirm").disabled).toBe(true);
    await ed.rename_in_library();
    typed.value = " Reef ";
    typed.dispatchEvent(new Event("input"));
    typed.dispatchEvent(new KeyboardEvent("keydown", { key: "a" }));
    typed.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
    await vi.waitFor(() => expect(ed.renaming).toBeNull());
    expect(asked).toEqual([{ device_id: "own", uid: "c", name: "Reef" }]);
    // The library is read again, the program still loaded under its name
    expect(ed.library_entry.name).toBe("Reef");
    await ed.updateComplete;
    expect(box(ed, ".renaming_input")).toBeNull();
    expect(
      [...ed.shadowRoot.querySelectorAll(".library_select option")].some(
        (o: any) => o.textContent.trim() === "Reef",
      ),
    ).toBe(true);
    // Cancelled
    box(ed, ".library_rename").click();
    await ed.updateComplete;
    box(ed, ".renaming_cancel").click();
    expect(ed.renaming).toBeNull();
  });

  it("says why a renaming was refused", async () => {
    const { led } = renamable({ error: "Name already used" });
    const ed = await mountEditor(led);
    await ed.use_library("c");
    ed.renaming = "cyano";
    await ed.rename_in_library();
    expect(ed.renaming).toBe("cyano");
    await ed.updateComplete;
    expect(box(ed, ".rename_error").textContent).toContain("Name already used");
    box(ed, ".renaming_confirm").click();
    await vi.waitFor(() => expect(ed.rename_error).not.toBe(""));
    // No answer at all
    const silent = renamable(null);
    const ed2 = await mountEditor(silent.led);
    await ed2.use_library("c");
    ed2.renaming = "x";
    await ed2.rename_in_library();
    expect(ed2.rename_error).toBe("Renaming failed");
  });

  it("keeps the program loaded when the library no longer lists it", async () => {
    const { led } = renamable({ uid: "c", renamed: 0 });
    const ed = await mountEditor(led);
    await ed.use_library("c");
    ed.fetch_library = async () => {
      ed.library = [];
    };
    ed.renaming = "Reef";
    await ed.rename_in_library();
    expect(ed.library_entry.name).toBe("Reef");
    expect(ed.library_entry.uid).toBe("c");
  });
});
