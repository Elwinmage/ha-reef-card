// Tests for the ReefWave editors: program editor, wave library, service
// calls, editing helpers, type pictograms and the speed ring
// Covers: src/devices/redsea/rswave/rswave_api.ts
//         src/devices/redsea/rswave/rswave_icons.ts
//         src/devices/redsea/rswave/rswave_library.ts
//         src/devices/redsea/rswave/rswave_schedule.ts (editor)
//         src/devices/redsea/rswave/rswave_program.ts (editing helpers)
//         src/devices/redsea/rswave/rswave_speed.ts (ring)

import { afterEach, describe, expect, it, vi } from "vitest";

import "../src/devices/index";
import * as API from "../src/devices/redsea/rswave/rswave_api";
import * as P from "../src/devices/redsea/rswave/rswave_program";
import {
  WAVE_TYPE_ICONS,
  WAVE_TYPE_ICON_NAMES,
  type_icon,
} from "../src/devices/redsea/rswave/rswave_icons";
import {
  RSWaveSchedule,
  moved,
  tr,
  type_cell,
} from "../src/devices/redsea/rswave/rswave_schedule";
import { RSWaveLibrary } from "../src/devices/redsea/rswave/rswave_library";
import {
  RSWaveSpeed,
  SPEED_DEFAULTS,
} from "../src/devices/redsea/rswave/rswave_speed";
import { RSWaveLinked } from "../src/devices/redsea/rswave/rswave_linked";
import { config } from "../src/devices/redsea/rswave/rswave.mapping";
import i18n from "../src/translations/myi18n";
import { OFF_COLOR } from "../src/utils/constants";

class StubSchedule extends RSWaveSchedule {}
if (!customElements.get("stub-rswave-editor"))
  customElements.define("stub-rswave-editor", StubSchedule);
class StubLibrary extends RSWaveLibrary {}
if (!customElements.get("stub-rswave-library"))
  customElements.define("stub-rswave-library", StubLibrary);
class StubLinked extends RSWaveLinked {}
if (!customElements.get("stub-rswave-linked"))
  customElements.define("stub-rswave-linked", StubLinked);
class StubSpeed extends RSWaveSpeed {}
if (!customElements.get("stub-rswave-ring"))
  customElements.define("stub-rswave-ring", StubSpeed);

// --- Fixtures ---------------------------------------------------------------

const WAVES: API.LibraryWave[] = [
  {
    uid: "nw",
    name: "No Wave",
    type: "nw",
    default: true,
    frt: null,
    rrt: null,
    pd: null,
    sn: null,
    fti: 50,
    rti: 50,
    sync: false,
  },
  {
    uid: "rsstep",
    name: "RS Step",
    type: "st",
    default: true,
    frt: 10,
    rrt: 2,
    pd: 3,
    sn: 6,
    fti: 40,
    rti: 60,
    sync: true,
  },
  {
    uid: "nuit",
    name: "nuit",
    type: "re",
    default: false,
    frt: 10,
    rrt: 2,
    pd: null,
    sn: null,
    fti: 100,
    rti: 30,
    sync: true,
  },
  {
    uid: "spare",
    name: "spare",
    type: "su",
    default: false,
    frt: null,
    rrt: null,
    pd: 1,
    sn: null,
    fti: 60,
    rti: 60,
    sync: false,
  },
];

const PROGRAM = [
  { st: 0, wave_uid: "nuit", name: "nuit", type: "re", fti: 100, rti: 30 },
  {
    st: 600,
    wave_uid: "rsstep",
    name: "RS Step",
    type: "st",
    direction: "alt",
    fti: 40,
    rti: 60,
  },
];

interface Answer {
  linked?: boolean;
  group?: any[];
  waves?: any;
  fail?: Record<string, string>;
  /** The save answers without a uid */
  noUid?: boolean;
  /** The save answers another uid (a wave replaced) */
  savedUid?: string;
  /** Grouped in the app (absent: not given) */
  grouped?: boolean;
}

/** A device whose hass answers the redsea.wave_* services. */
function makeDevice(answer: Answer = {}) {
  const calls: any[] = [];
  const callWS = vi.fn(async (msg: any) => {
    calls.push(msg);
    const fail = answer.fail?.[msg.service];
    if (fail !== undefined) throw { message: fail };
    if (msg.service === "wave_library") {
      return {
        response: {
          linked: answer.linked ?? true,
          hwid: "hw1",
          waves: answer.waves ?? WAVES,
          usage: { nuit: ["Left", "Right"], rsstep: ["Left"] },
          group: answer.group ?? [
            { hwid: "hw1", name: "Left", in_service: true, available: true },
          ],
          grouped: answer.grouped,
        },
      };
    }
    if (msg.service === "wave_library_save") {
      if (answer.noUid) return { response: {} };
      if (answer.savedUid) return { response: { uid: answer.savedUid } };
      return { response: { uid: msg.service_data.uid ?? "new-uid" } };
    }
    return { response: { saved: true, deleted: true } };
  });
  const intervals = P.normalize_schedule(PROGRAM);
  return {
    calls,
    callWS,
    device: {
      hass: { callWS },
      device: { elements: [{ primary_config_entry: "entry1" }] },
      schedule: () => intervals,
      now_minute: () => 700,
      is_on: () => true,
      display_name: () => "Left",
      state_signature: () => "sig",
      get_entity: () => null,
    } as any,
  };
}

function makeElement(Ctor: any, device: any, conf: any = {}) {
  const el = new Ctor();
  el.device = device;
  el.conf = conf;
  el.stateOn = true;
  el.stateObj = null;
  el.hass = {};
  return el;
}

async function mount(el: any): Promise<ShadowRoot> {
  document.body.appendChild(el);
  await el.updateComplete;
  return el.shadowRoot as ShadowRoot;
}

/** Let the pending service calls and renders settle. */
async function settle(el: any) {
  for (let i = 0; i < 5; i++) {
    await Promise.resolve();
    await el.updateComplete;
  }
}

function change(input: Element, value: string) {
  (input as HTMLInputElement).value = value;
  input.dispatchEvent(new Event("change"));
}

afterEach(() => {
  document.body.innerHTML = "";
});

// ─── Service calls ───────────────────────────────────────────────────────────

describe("rswave_api", () => {
  it("entry_of() and error_message()", () => {
    expect(
      API.entry_of({ device: { elements: [{ primary_config_entry: "e" }] } }),
    ).toBe("e");
    expect(API.entry_of(null)).toBeUndefined();
    expect(API.error_message("plain")).toBe("plain");
    expect(API.error_message({ message: "Refused" })).toBe("Refused");
    expect(API.error_message({ message: "" })).toBe("[object Object]");
    expect(API.error_message(new Error("boom"))).toBe("boom");
  });

  it("ask() calls the service with the pump's entry", async () => {
    const { device, calls } = makeDevice();
    const res = await API.ask(device, "wave_program_save", { slots: [] });
    expect(res).toEqual({ ok: true, value: { saved: true, deleted: true } });
    expect(calls[0]).toEqual({
      type: "call_service",
      domain: "redsea",
      service: "wave_program_save",
      service_data: { device_id: "entry1", slots: [] },
      return_response: true,
    });
    // Default data
    await API.ask(device, "wave_library");
    expect(calls[1].service_data).toEqual({ device_id: "entry1" });
  });

  it("ask() reports a refusal or a missing Home Assistant", async () => {
    const { device } = makeDevice({ fail: { wave_library: "Nope" } });
    expect(await API.ask(device, "wave_library")).toEqual({
      ok: false,
      error: "Nope",
    });
    const unreachable = await API.ask({ hass: {} }, "wave_library");
    expect(unreachable.ok).toBe(false);
    expect(unreachable.error).toContain("not reachable");
  });

  it("fetch_library() normalises the answer", async () => {
    const { device } = makeDevice({
      waves: [...WAVES, null, { uid: "" }, { name: "no uid" }],
    });
    const res = await API.fetch_library(device);
    expect(res.ok).toBe(true);
    expect(res.value!.waves.map((w) => w.uid)).toEqual(WAVES.map((w) => w.uid));
    expect(res.value!.linked).toBe(true);

    const odd = {
      hass: {
        callWS: async () => ({
          response: { waves: "x", usage: "x", group: "x" },
        }),
      },
      device: { elements: [{ primary_config_entry: "e" }] },
    };
    const res2 = await API.fetch_library(odd);
    expect(res2.value).toEqual({
      linked: false,
      hwid: "",
      waves: [],
      usage: {},
      group: [],
      grouped: null,
    });
    expect(
      (await API.fetch_library(makeDevice({ grouped: true }).device)).value!
        .grouped,
    ).toBe(true);
    const empty = {
      ...odd,
      hass: { callWS: async () => ({ response: null }) },
    };
    expect((await API.fetch_library(empty)).value!.waves).toEqual([]);
    const failing = makeDevice({ fail: { wave_library: "x" } }).device;
    expect(await API.fetch_library(failing)).toEqual({
      ok: false,
      error: "x",
    });
  });
});

// ─── Editing helpers ─────────────────────────────────────────────────────────

describe("rswave_program editing helpers", () => {
  it("parse_hhmm()", () => {
    expect(P.parse_hhmm("09:30")).toBe(570);
    expect(P.parse_hhmm("9:05")).toBe(545);
    expect(P.parse_hhmm("24:00")).toBeNull();
    expect(P.parse_hhmm("10:60")).toBeNull();
    expect(P.parse_hhmm("")).toBeNull();
    expect(P.parse_hhmm(undefined as any)).toBeNull();
  });

  it("slots_of() and draft_intervals()", () => {
    const slots = P.slots_of(P.normalize_schedule(PROGRAM));
    expect(slots).toEqual([
      { st: 0, wave_uid: "nuit", direction: "fw" },
      { st: 600, wave_uid: "rsstep", direction: "alt" },
    ]);
    const draft = P.draft_intervals(
      [...slots, { st: 900, wave_uid: "gone", direction: "fw" }],
      WAVES,
    );
    expect(draft.map((i) => [i.start, i.type, i.fti])).toEqual([
      [0, "re", 100],
      [600, "st", 40],
      [900, "nw", 0],
    ]);
    expect(draft[1].sn).toBe(6);
  });

  it("check_draft()", () => {
    const ok = [{ st: 0, wave_uid: "nuit", direction: "fw" }];
    expect(P.check_draft(ok, WAVES)).toBeNull();
    expect(P.check_draft([], WAVES)).toBe("wave_err_empty");
    expect(
      P.check_draft([{ st: 0, wave_uid: "x", direction: "fw" }], WAVES),
    ).toBe("wave_err_no_wave");
    expect(P.check_draft([...ok, ...ok], WAVES)).toBe("wave_err_same_start");
    // A slot shorter than SLOT_GAP, the last one up to midnight included:
    // the pump would leave it out
    const slot = (st: number) => ({ st, wave_uid: "nuit", direction: "fw" });
    expect(P.check_draft([slot(0), slot(1350), slot(1360)], WAVES)).toBe(
      "wave_err_too_short",
    );
    expect(P.check_draft([slot(0), slot(1426)], WAVES)).toBe(
      "wave_err_too_short",
    );
    expect(P.check_draft([slot(0), slot(1410), slot(1425)], WAVES)).toBeNull();
  });

  it("next_slot() adds after the last slot, SLOT_GAP after its start", () => {
    const slot = (st: number, wave_uid = "a") => ({
      st,
      wave_uid,
      direction: "fw",
    });
    expect(
      P.next_slot([
        { st: 0, wave_uid: "a", direction: "fw" },
        { st: 600, wave_uid: "b", direction: "alt" },
      ]),
    ).toEqual({ st: 615, wave_uid: "b", direction: "alt" });
    expect(P.next_slot([])).toBeNull();
    // The new slot keeps SLOT_GAP minutes of its own before midnight
    expect(P.next_slot([slot(0), slot(1410)])!.st).toBe(1425);
    expect(P.next_slot([slot(0), slot(1411)])).toBeNull();
  });

  it("make_room() moves the last slots earlier, SLOT_GAP apart", () => {
    const slot = (st: number) => ({ st, wave_uid: "a", direction: "fw" });
    const starts = (slots: any[] | null) => slots?.map((s) => s.st);
    expect(starts(P.make_room([slot(0), slot(600), slot(1435)]))).toEqual([
      0, 600, 1410,
    ]);
    // Those too close to the moved ones follow
    expect(
      starts(P.make_room([slot(0), slot(1395), slot(1405), slot(1435)])),
    ).toEqual([0, 1380, 1395, 1410]);
    // Then next_slot() has room
    const moved = P.make_room([slot(0), slot(1435)])!;
    expect(P.next_slot(moved)!.st).toBe(1425);
    // The first slot never moves: a day too full has no room
    const full = Array.from({ length: 96 }, (_, i) => slot(i * 15));
    expect(P.make_room(full)).toBeNull();
    expect(P.make_room([])).toBeNull();
  });

  it("wave_settings() keeps the type's fields", () => {
    expect(P.wave_settings({ ...WAVES[1] })).toEqual({
      type: "st",
      fti: 40,
      rti: 60,
      sync: true,
      frt: 10,
      rrt: 2,
      pd: 3,
      sn: 6,
    });
    expect(
      P.wave_settings({ uid: "", name: "", type: "zz", fti: 1, rti: 2 }),
    ).toEqual({ type: "zz", fti: 1, rti: 2, sync: false });
    expect(P.EDITABLE_TYPES).not.toContain("nw");
    expect(P.WAVE_FIELD_LIMITS.pd.step).toBe(0.5);
  });
});

// ─── Pictograms ──────────────────────────────────────────────────────────────

describe("rswave_icons", () => {
  it("one MDI path per type, mirrored in the redsea icon set", () => {
    for (const t of ["nw", "ra", "re", "st", "su", "un"]) {
      expect(type_icon(t)).toMatch(/^M[\d.,]+/);
      expect(WAVE_TYPE_ICON_NAMES[t]).toMatch(/^redsea:wave-/);
    }
    expect(type_icon("zz")).toBe(WAVE_TYPE_ICONS.nw);
  });

  it("type_cell() and tr()", () => {
    expect(type_cell("re").values).toContain(WAVE_TYPE_ICONS.re);
    expect(tr("wave_used_by", { pumps: "A, B" })).toContain("A, B");
    expect(tr("wave_used_by")).toContain("{pumps}");
  });
});

// ─── Speed ring ──────────────────────────────────────────────────────────────

describe("RSWaveSpeed ring", () => {
  it("fills the ellipse of the end cap with the speed", async () => {
    const el = makeElement(
      StubSpeed,
      { speed: () => 63, is_on: () => true },
      {
        target: 100,
      },
    );
    const root = await mount(el);
    const value = root.querySelector("path.speed_value")!;
    expect(value.getAttribute("stroke-dasharray")).toBe("63 100");
    expect(value.getAttribute("stroke")).toBe(`rgb(${SPEED_DEFAULTS.color})`);
    expect(value.getAttribute("stroke-linecap")).toBe("round");
    expect(root.querySelector("text")!.textContent!.trim()).toBe("63%");
    expect(
      root.querySelector("g.speed_click > g")!.getAttribute("transform"),
    ).toContain(`rotate(${SPEED_DEFAULTS.angle})`);
    expect(config.elements.speed.css).toMatchObject({ width: "100%" });
  });

  it("greys out when off, clamps, custom geometry", async () => {
    const off = makeElement(
      StubSpeed,
      { speed: () => 0, is_on: () => false },
      {
        target: 100,
      },
    );
    const r1 = await mount(off);
    const v1 = r1.querySelector("path.speed_value")!;
    expect(v1.getAttribute("stroke")).toBe(`rgb(${OFF_COLOR})`);
    expect(v1.getAttribute("stroke-linecap")).toBe("butt");
    // groupOn wins over the device
    const grouped = makeElement(
      StubSpeed,
      { speed: () => 250, is_on: () => false },
      { target: 100, geometry: { cx: 1, color: "1,2,3" } },
    );
    grouped.groupOn = true;
    const r2 = await mount(grouped);
    expect(r2.querySelector("text")!.textContent!.trim()).toBe("100%");
    expect(r2.querySelector("text")!.getAttribute("x")).toBe("1");
    expect(r2.querySelector("path.speed_value")!.getAttribute("stroke")).toBe(
      "rgb(1,2,3)",
    );
    // A device without on/off reads as on
    const bare = makeElement(StubSpeed, {}, { target: 100 });
    const r3 = await mount(bare);
    expect(r3.querySelector("path.speed_value")!.getAttribute("stroke")).toBe(
      `rgb(${SPEED_DEFAULTS.color})`,
    );
  });
});

// ─── Program editor ──────────────────────────────────────────────────────────

describe("RSWaveSchedule editor", () => {
  async function openEditor(answer: Answer = {}) {
    const ctx = makeDevice(answer);
    const el = makeElement(StubSchedule, ctx.device);
    const root = await mount(el);
    (root.querySelector(".program") as HTMLElement).click();
    await settle(el);
    return { ...ctx, el, root };
  }

  it("opens on the current program with the library", async () => {
    const { el, root, calls } = await openEditor();
    expect(calls[0].service).toBe("wave_library");
    const rows = root.querySelectorAll("tbody tr");
    expect(rows).toHaveLength(2);
    // 11:40: the second slot runs
    expect(rows[1].classList.contains("current")).toBe(true);
    // First slot: midnight, cannot move nor be removed
    expect((rows[0].querySelector("input.start") as any).disabled).toBe(true);
    expect((rows[0].querySelector("button.remove") as any).disabled).toBe(true);
    // Wave choices: the whole library
    expect(rows[0].querySelectorAll("select.wave option")).toHaveLength(4);
    // Regular forward: intensities shown, direction editable
    expect(rows[0].querySelectorAll("td")[5].textContent!.trim()).toBe("100 %");
    expect((rows[1].querySelector("select.direction") as any).value).toBe(
      "alt",
    );
    expect(root.querySelector(".note")).toBeNull();
    expect(root.querySelector("h3")!.textContent).toContain("Left");
    expect(el._error).toBe("");
  });

  it("edits starts, waves and directions, adds and removes slots", async () => {
    const { el, root } = await openEditor();
    const rows = () => root.querySelectorAll("tbody tr");

    // Move the second slot; an unreadable or midnight start is ignored
    change(rows()[1].querySelector("input.start")!, "08:00");
    await el.updateComplete;
    expect(el._slots[1].st).toBe(480);
    change(rows()[1].querySelector("input.start")!, "00:00");
    change(rows()[1].querySelector("input.start")!, "junk");
    await el.updateComplete;
    expect(el._slots[1].st).toBe(480);
    // The refused value does not stay in the field
    expect((rows()[1].querySelector("input.start") as any).value).toBe("08:00");
    expect(el._error).toBe("");

    // Each slot lasts SLOT_GAP minutes at least: a start too close to
    // another one, or to midnight, is refused at once
    for (const bad of ["00:10", "23:50"]) {
      change(rows()[1].querySelector("input.start")!, bad);
      await el.updateComplete;
      expect(el._slots[1].st).toBe(480);
      expect((rows()[1].querySelector("input.start") as any).value).toBe(
        "08:00",
      );
      expect(el._error).not.toBe("");
      expect(root.querySelector(".error")).not.toBeNull();
    }
    // Exactly SLOT_GAP: taken, the message gone
    change(rows()[1].querySelector("input.start")!, "00:15");
    await el.updateComplete;
    expect(el._slots[1].st).toBe(15);
    expect(el._error).toBe("");
    change(rows()[1].querySelector("input.start")!, "08:00");
    await el.updateComplete;
    expect([...rows()].some((r) => r.classList.contains("too_short"))).toBe(
      false,
    );

    // No wave: forward only, direction locked
    change(rows()[1].querySelector("select.wave")!, "nw");
    await el.updateComplete;
    expect(el._slots[1]).toEqual({ st: 480, wave_uid: "nw", direction: "fw" });
    expect((rows()[1].querySelector("select.direction") as any).disabled).toBe(
      true,
    );
    expect(rows()[1].querySelectorAll("td")[5].textContent!.trim()).toBe("–");

    change(rows()[1].querySelector("select.wave")!, "nuit");
    change(rows()[1].querySelector("select.direction")!, "rw");
    await el.updateComplete;
    expect(el._slots[1]).toEqual({
      st: 480,
      wave_uid: "nuit",
      direction: "rw",
    });

    // Add: at the end, SLOT_GAP after the start of the last slot
    (root.querySelector(".btn_add") as HTMLElement).click();
    await el.updateComplete;
    expect(el._slots.map((s: any) => s.st)).toEqual([0, 480, 495]);
    // Remove it; the first one stays
    (rows()[2].querySelector("button.remove") as HTMLElement).click();
    el.remove_slot(0);
    await el.updateComplete;
    expect(el._slots.map((s: any) => s.st)).toEqual([0, 480]);

    // A slot whose wave left the library
    el._slots = [{ st: 0, wave_uid: "gone", direction: "fw" }];
    await el.updateComplete;
    const opts = root.querySelectorAll("tbody tr select.wave option");
    expect(opts[0].textContent!.trim()).not.toBe("");
    expect(
      root
        .querySelectorAll("tbody tr")[0]
        .querySelectorAll("td")[3]
        .textContent!.trim(),
    ).toBe("–");
    // Nothing to add when the day is full
    el.add_slot.call({
      _slots: Array.from({ length: 1440 }, (_, i) => ({ st: i })),
    });
  });

  it("marks a slot shorter than SLOT_GAP read from the pump", async () => {
    const { el, root } = await openEditor();
    el._slots = [
      { st: 0, wave_uid: "nuit", direction: "fw" },
      { st: 1350, wave_uid: "nuit", direction: "fw" },
      { st: 1360, wave_uid: "rsstep", direction: "alt" },
    ];
    await el.updateComplete;
    const rows = [...root.querySelectorAll("tbody tr")];
    expect(rows.map((r) => r.classList.contains("too_short"))).toEqual([
      false,
      true,
      false,
    ]);
    expect(rows[1].getAttribute("title")).not.toBe("");
    // And its save is refused
    (root.querySelector(".btn_save") as HTMLElement).click();
    await settle(el);
    expect(el._error).not.toBe("");
  });

  it("asks to move the last slot when it starts too close to midnight", async () => {
    const { el, root } = await openEditor();
    el._slots = [
      { st: 0, wave_uid: "nuit", direction: "fw" },
      { st: 1435, wave_uid: "rsstep", direction: "alt" },
    ];
    await el.updateComplete;
    const add = root.querySelector(".btn_add") as HTMLButtonElement;
    expect(add.disabled).toBe(false);
    add.click();
    await el.updateComplete;
    // Nothing added yet: the question is asked
    expect(el._slots).toHaveLength(2);
    expect(root.querySelector(".room_ask .error")).not.toBeNull();
    // Cancelled: nothing changes
    (root.querySelector(".room_cancel") as HTMLElement).click();
    await el.updateComplete;
    expect(root.querySelector(".room_ask")).toBeNull();
    expect(el._slots.map((s: any) => s.st)).toEqual([0, 1435]);
    // Accepted: moved earlier, then the slot added after it
    add.click();
    await el.updateComplete;
    (root.querySelector(".room_confirm") as HTMLElement).click();
    await el.updateComplete;
    expect(root.querySelector(".room_ask")).toBeNull();
    expect(el._slots).toEqual([
      { st: 0, wave_uid: "nuit", direction: "fw" },
      { st: 1410, wave_uid: "rsstep", direction: "alt" },
      { st: 1425, wave_uid: "rsstep", direction: "alt" },
    ]);
    // A day too full: the button is disabled, nothing asked
    el._slots = Array.from({ length: 96 }, (_, i) => ({
      st: i * 15,
      wave_uid: "nuit",
      direction: "fw",
    }));
    await el.updateComplete;
    expect(add.disabled).toBe(true);
    el.add_slot();
    el.confirm_room();
    await el.updateComplete;
    expect(el._room_ask).toBe(false);
    expect(el._slots).toHaveLength(96);
  });

  it("saves the draft and closes, or shows the refusal", async () => {
    const { el, root, calls } = await openEditor();
    (root.querySelector(".btn_save") as HTMLElement).click();
    await settle(el);
    const save = calls.find((c) => c.service === "wave_program_save");
    expect(save.service_data.slots).toEqual([
      { st: 0, wave_uid: "nuit", direction: "fw" },
      { st: 600, wave_uid: "rsstep", direction: "alt" },
    ]);
    expect(root.querySelector(".overlay")).toBeNull();

    const refused = await openEditor({
      fail: { wave_program_save: "Pump missing" },
    });
    (refused.root.querySelector(".btn_save") as HTMLElement).click();
    await settle(refused.el);
    expect(refused.root.querySelector(".error")!.textContent).toContain(
      "Pump missing",
    );
    expect(refused.root.querySelector(".overlay")).not.toBeNull();

    // Checked before any call
    refused.el._slots = [
      { st: 0, wave_uid: "nuit", direction: "fw" },
      { st: 0, wave_uid: "nuit", direction: "fw" },
    ];
    const before = refused.calls.length;
    await refused.el.save();
    await refused.el.updateComplete;
    expect(refused.calls.length).toBe(before);
    expect(refused.el._error).not.toBe("");
  });

  it("notes: local mode, group, pumps missing (save locked)", async () => {
    const { root } = await openEditor({
      linked: false,
      group: [
        { hwid: "a", name: "Left", in_service: true, available: true },
        { hwid: "b", name: "Right", in_service: true, available: false },
        { hwid: "c", name: "Spare", in_service: false, available: false },
      ],
    });
    const notes = [...root.querySelectorAll(".note")].map((n) =>
      n.textContent!.trim(),
    );
    expect(notes).toHaveLength(3);
    expect(notes[1]).toContain("Left, Right, Spare");
    expect(notes[2]).toContain("Right");
    expect(notes[2]).not.toContain("Spare");
    expect((root.querySelector(".btn_save") as any).disabled).toBe(true);
  });

  it("loading, read error, overlay and close buttons", async () => {
    const ctx = makeDevice({ fail: { wave_library: "No cloud" } });
    const el = makeElement(StubSchedule, ctx.device);
    const root = await mount(el);
    // Before the answer: loading
    el.openEditor();
    await el.updateComplete;
    expect(root.querySelector(".panel_table .note")).not.toBeNull();
    expect(el.notes()).toEqual([]);
    expect(el.missing()).toEqual([]);
    await settle(el);
    expect(root.querySelector(".error")!.textContent).toContain("No cloud");
    expect(root.querySelector("table")).not.toBeNull();

    // A click in the panel keeps it, the backdrop closes it
    (root.querySelector(".panel") as HTMLElement).click();
    await el.updateComplete;
    expect(root.querySelector(".overlay")).not.toBeNull();
    const overlay = root.querySelector(".overlay") as HTMLElement;
    el._onOverlayClick({
      target: root.querySelector(".panel_graph"),
      currentTarget: overlay,
      stopPropagation: () => {},
    });
    await el.updateComplete;
    expect(root.querySelector(".overlay")).not.toBeNull();
    overlay.click();
    await el.updateComplete;
    expect(root.querySelector(".overlay")).toBeNull();

    for (const button of [".btn_close", ".btn_cancel"]) {
      el.openEditor();
      await settle(el);
      (root.querySelector(button) as HTMLElement).click();
      await el.updateComplete;
      expect(root.querySelector(".overlay")).toBeNull();
    }
  });

  it("saving shows its progress", async () => {
    let release: (v: any) => void = () => {};
    const ctx = makeDevice();
    const el = makeElement(StubSchedule, ctx.device);
    const root = await mount(el);
    el.openEditor();
    await settle(el);
    ctx.callWS.mockImplementationOnce(() => new Promise((r) => (release = r)));
    const pending = el.save();
    await el.updateComplete;
    expect((root.querySelector(".btn_save") as any).disabled).toBe(true);
    release({ response: {} });
    await pending;
    expect(el._busy).toBe(false);
  });

  it("a bare device opens an empty editor", async () => {
    const el = makeElement(StubSchedule, {});
    const root = await mount(el);
    el.openEditor();
    await settle(el);
    expect(root.querySelector("h3")).not.toBeNull();
    expect(el.waves()).toEqual([]);
  });
});

// ─── Wave library ────────────────────────────────────────────────────────────

describe("RSWaveLibrary", () => {
  async function openLibrary(answer: Answer = {}) {
    const ctx = makeDevice(answer);
    const el = makeElement(StubLibrary, ctx.device);
    const root = await mount(el);
    (root.querySelector(".lib_open") as HTMLElement).click();
    await settle(el);
    return { ...ctx, el, root };
  }

  it("is an icon on the pump that never re-renders by itself", async () => {
    const el = makeElement(StubLibrary, {});
    const root = await mount(el);
    expect(root.querySelector(".lib_open svg path")).not.toBeNull();
    expect(el.signature()).toBe("");
    // Placed without a transform: the overlay must cover the screen
    expect(config.elements.library.css).not.toHaveProperty("transform");
  });

  it("lists the waves with their users", async () => {
    const { root } = await openLibrary();
    const items = root.querySelectorAll(".lib_item");
    expect(items).toHaveLength(4);
    expect(items[0].querySelector(".badge")).not.toBeNull();
    expect(items[2].querySelector(".lib_users")!.textContent).toContain(
      "Left, Right",
    );
    expect(items[3].querySelector(".lib_users")).toBeNull();
    expect(root.querySelector(".lib_edit")).toBeNull();
    expect(root.querySelector(".note")).not.toBeNull();
  });

  it("a Red Sea wave can be copied, not updated nor deleted", async () => {
    const { el, root } = await openLibrary();
    el.pick("rsstep");
    await el.updateComplete;
    expect(root.querySelector(".lib_item.selected")).not.toBeNull();
    expect(root.querySelectorAll(".lib_edit .note")).toHaveLength(1);
    expect((root.querySelector(".btn_save.update") as any).disabled).toBe(true);
    expect((root.querySelector(".btn_delete") as any).disabled).toBe(true);
    // Step: all four shape fields
    expect(
      root.querySelectorAll(".lib_fields input[type=number]"),
    ).toHaveLength(6);
    // No wave: no type choice, no intensities
    el.pick("nw");
    await el.updateComplete;
    expect(root.querySelectorAll(".lib_type")).toHaveLength(1);
    expect(root.querySelector(".field_fti")).toBeNull();
    expect(root.querySelector(".hint")).toBeNull();
    // Unknown uid
    el.pick("zz");
    await el.updateComplete;
    expect(root.querySelector(".lib_edit")).toBeNull();
  });

  it("edits a user wave and updates it", async () => {
    const { el, root, calls } = await openLibrary();
    (root.querySelectorAll(".lib_item")[2] as HTMLElement).click();
    await el.updateComplete;
    // Switch to step: its new fields get the Red Sea values
    const step = [...root.querySelectorAll(".lib_type")].find(
      (b) => b.getAttribute("title")!.length,
    ) as HTMLElement;
    el.set_type("st");
    await el.updateComplete;
    expect(el._wave.sn).toBe(P.WAVE_FIELD_DEFAULTS.sn);
    expect(el._wave.pd).toBe(P.WAVE_FIELD_DEFAULTS.pd);
    step.click();
    change(root.querySelector(".field_fti")!, "80");
    const sync = root.querySelector(".field_sync") as HTMLInputElement;
    sync.checked = false;
    sync.dispatchEvent(new Event("change"));
    await el.updateComplete;
    // A user wave in use cannot be deleted
    expect((root.querySelector(".btn_delete") as any).disabled).toBe(true);
    expect(root.querySelector(".btn_delete")!.getAttribute("title")).toContain(
      "Left",
    );
    (root.querySelector(".btn_save.update") as HTMLElement).click();
    await settle(el);
    const save = calls.find((c) => c.service === "wave_library_save");
    expect(save.service_data.uid).toBe("nuit");
    expect(save.service_data.name).toBe("nuit");
    expect(save.service_data.settings.fti).toBe(80);
    expect(save.service_data.settings.sync).toBe(false);
    // Read again, the wave kept selected
    expect(calls.filter((c) => c.service === "wave_library")).toHaveLength(2);
    expect(el._wave.uid).toBe("nuit");
  });

  it("follows the wave replaced when its type changes", async () => {
    const waves = WAVES.map((w) =>
      w.uid === "nuit" ? { ...w, uid: "nuit-su", type: "su" as const } : w,
    );
    const { el, root, calls } = await openLibrary({
      savedUid: "nuit-su",
      waves,
    });
    el._wave = { ...waves.find((w) => w.uid === "nuit-su")!, uid: "nuit" };
    await el.updateComplete;
    (root.querySelector(".btn_save.update") as HTMLElement).click();
    await settle(el);
    const save = calls.find((c) => c.service === "wave_library_save");
    expect(save.service_data.uid).toBe("nuit");
    // Read again, the new wave selected
    expect(el._wave.uid).toBe("nuit-su");
    expect(el._wave.type).toBe("su");
  });

  it("renames a user wave: its name typed over, saved with update", async () => {
    const { el, root, calls } = await openLibrary();
    // A Red Sea wave keeps its title
    el.pick("rsstep");
    await el.updateComplete;
    expect(root.querySelector(".wave_name")).toBeNull();
    expect(root.querySelector(".lib_edit h4")).not.toBeNull();
    el.pick("nuit");
    await el.updateComplete;
    const name = root.querySelector(".wave_name") as HTMLInputElement;
    expect(name.value).toBe("nuit");
    // No longer than the cloud takes
    expect(name.maxLength).toBe(P.WAVE_NAME_MAX);
    expect(root.querySelector(".lib_edit h4")).toBeNull();
    // A wave needs a name
    name.value = "  ";
    name.dispatchEvent(new Event("input"));
    await el.update_wave();
    expect(el._error).not.toBe("");
    expect(calls.some((c) => c.service === "wave_library_save")).toBe(false);
    name.value = " Night swell ";
    name.dispatchEvent(new Event("input"));
    (root.querySelector(".btn_save.update") as HTMLElement).click();
    await settle(el);
    const save = calls.find((c) => c.service === "wave_library_save");
    expect(save.service_data.uid).toBe("nuit");
    expect(save.service_data.name).toBe("Night swell");
    // Without a wave picked: nothing to rename
    el._wave = null;
    el.set_name(new Event("input"));
    expect(el._wave).toBeNull();
  });

  it("creates a copy under a new name", async () => {
    const { el, root, calls } = await openLibrary();
    el.pick("rsstep");
    await el.updateComplete;
    (root.querySelector(".create_start") as HTMLElement).click();
    await el.updateComplete;
    // Without a name: refused
    (root.querySelector(".btn_save.create") as HTMLElement).click();
    await settle(el);
    expect(el._error).not.toBe("");
    const name = root.querySelector("input.new_name") as HTMLInputElement;
    expect(name.maxLength).toBe(P.WAVE_NAME_MAX);
    name.value = " Storm ";
    name.dispatchEvent(new Event("input"));
    (root.querySelector(".btn_save.create") as HTMLElement).click();
    await settle(el);
    const save = calls.find((c) => c.service === "wave_library_save");
    expect(save.service_data).toMatchObject({ name: "Storm" });
    expect(save.service_data.uid).toBeUndefined();
    expect(el._step).toBe("edit");
    // The new wave is not in the (mocked) library read again: none picked
    expect(el._wave).toBeNull();
    // Back to edit without creating
    el.pick("rsstep");
    el._step = "name";
    await el.updateComplete;
    (root.querySelector(".lib_actions .btn_cancel") as HTMLElement).click();
    await el.updateComplete;
    expect(el._step).toBe("edit");
  });

  it("a created wave without uid, an unknown type", async () => {
    const { el } = await openLibrary({ noUid: true });
    el.pick("rsstep");
    el._name = "Calm";
    await el.create_wave();
    expect(el._error).toBe("");
    el.pick("nuit");
    el._wave = { ...el._wave, frt: null };
    await el.updateComplete;
    // A field without value shows empty
    expect((el.shadowRoot.querySelector(".field_frt") as any).value).toBe("");
    el.set_type("zz");
    expect(el._wave.type).toBe("zz");
    await el.updateComplete;
    // Unknown type: no shape field
    expect(el.shadowRoot.querySelector(".field_frt")).toBeNull();
    // The backdrop closes, a click elsewhere in the overlay does not
    const stop = () => {};
    el._onOverlayClick({ target: 1, currentTarget: 2, stopPropagation: stop });
    expect(el._open).toBe(true);
    el._onOverlayClick({ target: 1, currentTarget: 1, stopPropagation: stop });
    expect(el._open).toBe(false);
  });

  it("starts a new wave from scratch", async () => {
    const { el, root } = await openLibrary();
    (root.querySelector(".lib_list .btn_add") as HTMLElement).click();
    await el.updateComplete;
    expect(el._wave).toMatchObject({ uid: "", type: "re" });
    expect(root.querySelector(".lib_edit h4")!.textContent).not.toBe("");
    expect(root.querySelectorAll(".lib_type")).toHaveLength(5);
    // A new wave cannot go back to edit: no cancel next to Create
    expect(root.querySelector(".lib_actions .btn_cancel")).toBeNull();
  });

  it("deletes an unused wave after confirmation", async () => {
    const { el, root, calls } = await openLibrary();
    el.pick("spare");
    await el.updateComplete;
    (root.querySelector(".btn_delete") as HTMLElement).click();
    await el.updateComplete;
    expect(root.querySelector(".lib_actions .warn")!.textContent).toContain(
      "spare",
    );
    (root.querySelector(".lib_actions .btn_cancel") as HTMLElement).click();
    await el.updateComplete;
    expect(el._step).toBe("edit");
    (root.querySelector(".btn_delete") as HTMLElement).click();
    await el.updateComplete;
    (root.querySelector(".btn_delete.confirm") as HTMLElement).click();
    await settle(el);
    const del = calls.find((c) => c.service === "wave_library_delete");
    expect(del.service_data.uid).toBe("spare");
    expect(el._wave).toBeNull();
  });

  it("shows the refusals", async () => {
    const { el } = await openLibrary({
      fail: {
        wave_library_save: "Name taken",
        wave_library_delete: "In use",
      },
    });
    el.pick("nuit");
    await el.update_wave();
    expect(el._error).toBe("Name taken");
    el._name = "x";
    await el.create_wave();
    expect(el._error).toBe("Name taken");
    await el.delete_wave();
    expect(el._error).toBe("In use");
    expect(el._wave.uid).toBe("nuit");
  });

  it("guards: nothing picked, Red Sea, setters without a wave", async () => {
    const { el, calls } = await openLibrary();
    const n = calls.length;
    await el.update_wave();
    await el.delete_wave();
    el.set_type("re");
    el.set_field("fti", { target: { value: "1" } });
    el.set_sync({ target: { checked: true } });
    el.pick("rsstep");
    await el.update_wave();
    expect(calls.length).toBe(n);
    expect(el.users("zz")).toEqual([]);
  });

  it("without a cloud account, read errors, closing", async () => {
    const local = await openLibrary({ linked: false });
    expect(local.root.querySelector(".lib_body")).toBeNull();
    expect(local.root.querySelector(".note")).not.toBeNull();

    const failing = await openLibrary({ fail: { wave_library: "Down" } });
    expect(failing.root.querySelector(".error")!.textContent).toContain("Down");
    expect(failing.root.querySelector(".note")).toBeNull();

    // Loading
    const ctx = makeDevice();
    const el = makeElement(StubLibrary, ctx.device);
    const root = await mount(el);
    el.openEditor();
    await el.updateComplete;
    expect(root.querySelector(".note")).not.toBeNull();
    await settle(el);

    // Panel click keeps it, backdrop and cross close it
    (root.querySelector(".panel") as HTMLElement).click();
    await el.updateComplete;
    expect(root.querySelector(".overlay")).not.toBeNull();
    const overlay = root.querySelector(".overlay") as HTMLElement;
    overlay.firstElementChild!.dispatchEvent(
      new MouseEvent("click", { bubbles: false }),
    );
    overlay.click();
    await el.updateComplete;
    expect(root.querySelector(".overlay")).toBeNull();
    el.openEditor();
    await settle(el);
    (root.querySelector(".btn_close") as HTMLElement).click();
    await el.updateComplete;
    expect(root.querySelector(".overlay")).toBeNull();
    // A click inside the overlay, off its backdrop, does not close
    el.openEditor();
    await settle(el);
    const ov = root.querySelector(".overlay") as HTMLElement;
    const inner = root.querySelector(".panel_header") as HTMLElement;
    const evt = new MouseEvent("click", { bubbles: true, composed: true });
    inner.dispatchEvent(evt);
    expect(root.querySelector(".overlay")).toBe(ov);
  });

  it("a bare device", async () => {
    const el = makeElement(StubLibrary, {});
    const root = await mount(el);
    el.openEditor();
    await settle(el);
    expect(root.querySelector("h3")).not.toBeNull();
  });
});

// ─── Direction arrows and per-pump settings ──────────────────────────────────

describe("RSWaveSpeed arrows and pump settings", () => {
  const ring = (direction: string, extra: any = {}) => ({
    speed: () => 50,
    direction: () => direction,
    is_on: () => true,
    ...extra,
  });

  it("arrows: → forward, ← reverse, both alternate, none stopped", async () => {
    const count = async (dir: string) => {
      const root = await mount(
        makeElement(StubSpeed, ring(dir), { target: 100 }),
      );
      return [
        root.querySelectorAll("path.arrow_fw").length,
        root.querySelectorAll("path.arrow_rw").length,
      ];
    };
    expect(await count("fw")).toEqual([1, 0]);
    expect(await count("rw")).toEqual([0, 1]);
    expect(await count("alt")).toEqual([1, 1]);
    expect(await count("")).toEqual([0, 0]);
    // Reverse is drawn mirrored
    const root = await mount(
      makeElement(StubSpeed, ring("rw"), { target: 100 }),
    );
    expect(
      root.querySelector("path.arrow_rw")!.getAttribute("transform"),
    ).toContain("scale(-1 1)");
    // No direction helper: no arrow
    const bare = await mount(makeElement(StubSpeed, { speed: () => 1 }, {}));
    expect(bare.querySelector("path.arrow_fw")).toBeNull();
  });

  it("re-renders when the direction changes", () => {
    let dir = "fw";
    const el = makeElement(StubSpeed, ring("", { direction: () => dir }), {
      target: 100,
    });
    const spy = vi.spyOn(el, "requestUpdate");
    el.hass = { states: {} };
    expect(spy).not.toHaveBeenCalled();
    dir = "rw";
    el.hass = { states: {} };
    expect(spy).toHaveBeenCalled();
  });

  it("a click on the cap opens this pump's settings and saves them", async () => {
    const ctx = makeDevice();
    const dev = { ...ctx.device, ...ring("alt") };
    const el = makeElement(StubSpeed, dev, { target: 100 });
    const root = await mount(el);
    (root.querySelector("g.speed_click") as any).dispatchEvent(
      new MouseEvent("click"),
    );
    await el.updateComplete;
    // 11:40: the RS Step slot, alternate 40 / 60
    expect(root.querySelector(".current_wave strong")!.textContent).toBe(
      "RS Step",
    );
    expect(root.querySelector(".dir_alt.selected")).not.toBeNull();
    (root.querySelector(".dir_rw") as HTMLElement).click();
    await el.updateComplete;
    // Reverse: the forward intensity is locked
    expect((root.querySelector("input._fti") as any).disabled).toBe(true);
    (root.querySelector(".dir_fw") as HTMLElement).click();
    await el.updateComplete;
    expect((root.querySelector("input._rti") as any).disabled).toBe(true);
    const fti = root.querySelector("input._fti") as HTMLInputElement;
    fti.value = "75";
    fti.dispatchEvent(new Event("input"));
    await el.updateComplete;
    expect(root.querySelector(".pump_field .num")!.textContent).toBe("75 %");
    (root.querySelector(".btn_save") as HTMLElement).click();
    await settle(el);
    const call = ctx.calls.find((c) => c.service === "wave_pump_set");
    expect(call.service_data).toMatchObject({
      direction: "fw",
      fti: 75,
      rti: 60,
    });
    expect(root.querySelector(".overlay")).toBeNull();
  });

  it("shows the settings saved at once, until Home Assistant has them", async () => {
    const ctx = makeDevice();
    // What Home Assistant reports for the current wave
    let now = { type: "st", direction: "alt", fti: 40, rti: 60 };
    const dev = {
      ...ctx.device,
      is_on: () => true,
      current_wave: () => now,
      speed: () => now.fti,
      direction: () => now.direction,
    };
    const el = makeElement(StubSpeed, dev, { target: 100 });
    const root = await mount(el);
    const text = () => root.querySelector(".speed_text")!.textContent!.trim();
    expect(text()).toBe("40%");
    el.openSettings();
    el._dir = "rw";
    el._fti = 80;
    el._rti = 70;
    const saving = el.save();
    // Closed and shown before the integration answers
    await el.updateComplete;
    expect(root.querySelector(".overlay")).toBeNull();
    expect(text()).toBe("80%");
    expect(root.querySelector("path.arrow_rw")).not.toBeNull();
    expect(root.querySelector("path.arrow_fw")).toBeNull();
    await saving;
    // Home Assistant still reports the old values: kept
    el.hass = { states: {} };
    await el.updateComplete;
    expect(text()).toBe("80%");
    // It reports them: Home Assistant's values from now on
    now = { type: "st", direction: "rw", fti: 80, rti: 70 };
    el.hass = { states: {} };
    await el.updateComplete;
    expect(el._pending).toBeNull();
    now = { type: "st", direction: "fw", fti: 30, rti: 70 };
    el.hass = { states: {} };
    await el.updateComplete;
    expect(text()).toBe("30%");

    // Never reported: dropped after PENDING_MS
    el.openSettings();
    el._fti = 90;
    await el.save();
    expect(el.getValue()).toBe(90);
    el._pending.until = Date.now() - 1;
    expect(el.getValue()).toBe(30);
    expect(el._pending).toBeNull();
    // No wave run now: no type, the saved intensity shown
    const bare = makeElement(StubSpeed, { ...ctx.device, ...ring("fw") }, {});
    bare._pending = {
      direction: "fw",
      fti: 55,
      rti: 0,
      until: Date.now() + 1e5,
    };
    expect(bare.getValue()).toBe(55);
    expect(bare.flow()).toBe("fw");
    bare._pending = {
      direction: "fw",
      fti: 0,
      rti: 0,
      until: Date.now() + 1e5,
    };
    expect(bare.flow()).toBe("");
  });

  it("refusal, no program, closing", async () => {
    const ctx = makeDevice({ fail: { wave_pump_set: "Offline" } });
    const el = makeElement(
      StubSpeed,
      { ...ctx.device, ...ring("fw") },
      {
        target: 100,
      },
    );
    const root = await mount(el);
    el.openSettings();
    await el.updateComplete;
    await el.save();
    await el.updateComplete;
    // Refused: opened again with the message, nothing shown as saved
    expect(el._open).toBe(true);
    expect(el._pending).toBeNull();
    expect(root.querySelector(".error")!.textContent).toContain("Offline");
    // Backdrop / panel clicks
    const stop = () => {};
    el._onOverlayClick({ target: 1, currentTarget: 2, stopPropagation: stop });
    expect(el._open).toBe(true);
    el._onOverlayClick({ target: 1, currentTarget: 1, stopPropagation: stop });
    expect(el._open).toBe(false);
    for (const sel of [".btn_close", ".btn_cancel"]) {
      el.openSettings();
      await el.updateComplete;
      (root.querySelector(".panel") as HTMLElement).click();
      (root.querySelector(sel) as HTMLElement).click();
      await el.updateComplete;
      expect(root.querySelector(".overlay")).toBeNull();
    }

    // Without program: a note, nothing to save
    const empty = makeElement(StubSpeed, ring("fw", { schedule: () => [] }), {
      target: 100,
    });
    const r2 = await mount(empty);
    empty.openSettings();
    await empty.updateComplete;
    expect(r2.querySelector(".note")).not.toBeNull();
    expect((r2.querySelector(".btn_save") as any).disabled).toBe(true);
    // A device without program helpers
    const bare = makeElement(StubSpeed, {}, { target: 100 });
    await mount(bare);
    bare.openSettings();
    expect(bare._dir).toBe("fw");
    expect(bare.current()).toBeNull();
  });

  it("a no-wave slot cannot be set", async () => {
    const nw = P.normalize_schedule([{ st: 0, wave_uid: "nw", type: "nw" }]);
    const el = makeElement(
      StubSpeed,
      ring("", { schedule: () => nw, now_minute: () => 10 }),
      { target: 100 },
    );
    const root = await mount(el);
    el.openSettings();
    await el.updateComplete;
    expect(root.querySelector(".dir_buttons")).toBeNull();
  });
});

// ─── Linked ReefWaves ────────────────────────────────────────────────────────

describe("RSWaveLinked", () => {
  const waves = [
    { hwid: "hw1", name: "Left", model: "RSWAVE45", available: true },
    { hwid: "hw2", name: "Right", available: false },
  ];
  const dev = (list: any = waves) => ({
    get_entity: (key: string) =>
      key === "linked_waves" ? { attributes: { waves: list } } : null,
    device: { elements: [{ identifiers: [["redsea", "hw1"]] }] },
  });

  it("lists the group, the pump itself circled, taps show a card", async () => {
    const el = makeElement(StubLinked, dev());
    const root = await mount(el);
    const pumps = root.querySelectorAll(".pump");
    expect(pumps).toHaveLength(2);
    expect(pumps[0].classList.contains("current")).toBe(true);
    expect(pumps[0].getAttribute("title")).toBe("Left (RSWAVE45)");
    expect(pumps[1].classList.contains("unavailable")).toBe(true);
    expect(pumps[1].getAttribute("title")).toBe("Right");
    const shown: any[] = [];
    el.addEventListener("show-device", (e: any) => shown.push(e.detail));
    (pumps[0] as HTMLElement).click();
    (pumps[1] as HTMLElement).click();
    expect(shown).toEqual([{ hwid: "hw2" }]);
    el.show({} as any);
    expect(shown).toHaveLength(1);
    expect(el.signature()).toContain("hw2");
  });

  it("nothing alone, nor without the sensor", async () => {
    const alone = await mount(makeElement(StubLinked, dev([])));
    expect(alone.querySelector(".linked")).toBeNull();
    const bare = makeElement(StubLinked, {});
    await mount(bare);
    expect(bare.pumps()).toEqual([]);
    expect(bare.current()).toBeNull();
    expect(config.elements.linked.type).toBe("rswave-linked");
  });
});

// ─── Wave zone in the program editor, preview ────────────────────────────────

describe("Wave zone and preview", () => {
  it("the program editor embeds the library on the current slot's wave", async () => {
    const ctx = makeDevice();
    const el = makeElement(StubSchedule, ctx.device);
    const root = await mount(el);
    el.openEditor();
    await settle(el);
    // 11:40: RS Step runs
    expect(el._focus).toBe("rsstep");
    const lib = root.querySelector(".wave_zone rswave-library") as any;
    expect(lib).not.toBeNull();
    // Save and cancel belong to the program: under its table, before the
    // waves of the library
    const footer = root.querySelector(".panel_footer")!;
    const zone = root.querySelector(".wave_zone")!;
    expect(
      footer.compareDocumentPosition(zone) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      root.querySelector("table")!.compareDocumentPosition(footer) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    await settle(lib);
    expect(lib._wave.uid).toBe("rsstep");
    // The pencil of a row shows its wave
    const pencil = root.querySelectorAll("button.edit")[0] as HTMLElement;
    pencil.click();
    await settle(el);
    await settle(lib);
    expect(el._focus).toBe("nuit");
    expect(lib._wave.uid).toBe("nuit");
    expect(root.querySelectorAll("button.edit.focused")).toHaveLength(1);
    // Picking a wave in a row shows it too
    change(
      root.querySelectorAll("tbody tr")[1].querySelector("select.wave")!,
      "spare",
    );
    await el.updateComplete;
    expect(el._focus).toBe("spare");
    // A change in the zone reads the library again, the draft kept
    const reads = ctx.calls.filter((c) => c.service === "wave_library").length;
    lib.dispatchEvent(
      new CustomEvent("wave-library-changed", {
        bubbles: true,
        composed: true,
      }),
    );
    await settle(el);
    expect(ctx.calls.filter((c) => c.service === "wave_library").length).toBe(
      reads + 1,
    );
    expect(el._slots[1].wave_uid).toBe("spare");
  });

  it("no zone without a cloud account; empty program focuses nothing", async () => {
    const ctx = makeDevice({ linked: false });
    const el = makeElement(StubSchedule, ctx.device);
    const root = await mount(el);
    el.openEditor();
    await settle(el);
    expect(root.querySelector(".wave_zone")).toBeNull();
    const empty = makeElement(StubSchedule, {
      ...ctx.device,
      schedule: () => [],
    });
    await mount(empty);
    empty.openEditor();
    expect(empty._focus).toBe("");
  });

  it("inline library: no button, loads by itself, tells its changes", async () => {
    const ctx = makeDevice();
    const el = makeElement(StubLibrary, ctx.device, { inline: true });
    el.focus_uid = "spare";
    const root = await mount(el);
    await settle(el);
    expect(root.querySelector(".lib_open")).toBeNull();
    expect(root.querySelector(".lib_inline .lib_body")).not.toBeNull();
    expect(el._wave.uid).toBe("spare");
    const changed: any[] = [];
    el.addEventListener("wave-library-changed", (e: any) => changed.push(e));
    await el.update_wave();
    el._name = "Copy";
    await el.create_wave();
    el.pick("spare");
    await el.delete_wave();
    expect(changed).toHaveLength(3);
    // Same focus again: nothing to do; reconnecting does not read again
    const reads = ctx.calls.filter((c) => c.service === "wave_library").length;
    el.pick("nuit");
    el.focus_uid = "nuit";
    await el.updateComplete;
    el.remove();
    document.body.appendChild(el);
    await settle(el);
    expect(ctx.calls.filter((c) => c.service === "wave_library").length).toBe(
      reads,
    );
    // Error shown inline
    el._error = "Oops";
    await el.updateComplete;
    expect(root.querySelector(".lib_inline .error")).not.toBeNull();
  });

  it("previews the edited wave, stops a running preview", async () => {
    const ctx = makeDevice();
    let mode = "auto";
    const dev = { ...ctx.device, mode: () => mode };
    const el = makeElement(StubLibrary, dev);
    const root = await mount(el);
    el.openEditor();
    await settle(el);
    el.pick("nuit");
    await el.updateComplete;
    change(root.querySelector("select.preview_dir")!, "rw");
    change(root.querySelector("select.preview_min")!, "2");
    await el.updateComplete;
    (root.querySelector(".preview_start") as HTMLElement).click();
    await settle(el);
    const call = ctx.calls.find((c) => c.service === "wave_preview");
    expect(call.service_data).toMatchObject({
      direction: "rw",
      duration: 120000,
      settings: { type: "re", fti: 100, rti: 30 },
    });
    mode = "preview";
    el.requestUpdate();
    await el.updateComplete;
    (root.querySelector(".preview_stop") as HTMLElement).click();
    await settle(el);
    expect(ctx.calls.some((c) => c.service === "wave_preview_stop")).toBe(true);
    // No wave: no preview; nothing picked: nothing sent
    el.pick("nw");
    await el.updateComplete;
    expect(root.querySelector(".lib_preview")).toBeNull();
    el._wave = null;
    const n = ctx.calls.length;
    await el.preview();
    expect(ctx.calls.length).toBe(n);
  });

  it("the main view button is labelled", async () => {
    const el = makeElement(StubLibrary, {});
    const root = await mount(el);
    expect(root.querySelector(".lib_open span")!.textContent!.trim()).not.toBe(
      "",
    );
    expect(config.elements.library.css).toHaveProperty("right");
  });
});

// ─── Group order ─────────────────────────────────────────────────────────────

describe("RSWaveSchedule group", () => {
  const GROUP = [
    { hwid: "hw1", name: "A", in_service: true, available: true },
    { hwid: "hw2", name: "B", in_service: true, available: true },
    { hwid: "hw3", name: "C", in_service: true, available: true },
  ];
  async function openEditor(answer: Answer = {}) {
    const ctx = makeDevice(answer);
    const el = makeElement(StubSchedule, ctx.device);
    const root = await mount(el);
    (root.querySelector(".program") as HTMLElement).click();
    await settle(el);
    return { ...ctx, el, root };
  }
  const count = (calls: any[], service: string) =>
    calls.filter((c) => c.service === service).length;

  it("moved() places a pump", () => {
    expect(moved(["a", "b", "c"], "a", 2)).toEqual(["b", "c", "a"]);
    expect(moved(["a", "b", "c"], "c", 0)).toEqual(["c", "a", "b"]);
    expect(moved(["a", "b", "c"], "b", -5)).toEqual(["b", "a", "c"]);
    expect(moved(["a", "b", "c"], "b", 9)).toEqual(["a", "c", "b"]);
  });

  it("a pump alone: a Group button, no order; it groups", async () => {
    const { el, root, calls } = await openEditor({ grouped: false });
    const btn = root.querySelector(".btn_group") as HTMLButtonElement;
    expect(btn.classList.contains("group")).toBe(true);
    expect(btn.textContent!.trim()).toBe(i18n._("wave_group"));
    expect(root.querySelector(".order")).toBeNull();
    const reads = count(calls, "wave_library");
    btn.click();
    await settle(el);
    const call = calls.find((c) => c.service === "wave_group_set");
    expect(call.service_data).toEqual({ device_id: "entry1", grouped: true });
    // The library (and its group) is read again
    expect(count(calls, "wave_library")).toBe(reads + 1);
    expect(el._busy).toBe(false);
  });

  it("no button without a cloud account", async () => {
    const { root } = await openEditor({ linked: false });
    expect(root.querySelector(".group_tools")).toBeNull();
  });

  it("a group: Ungroup button under the note, and the order", async () => {
    const { el, root, calls } = await openEditor({
      grouped: true,
      group: GROUP,
    });
    const tools = root.querySelector(".group_tools")!;
    expect(tools.previousElementSibling!.textContent).toContain("A, B, C");
    const btn = tools.querySelector(".btn_group") as HTMLButtonElement;
    expect(btn.classList.contains("ungroup")).toBe(true);
    const items = root.querySelectorAll(".order_pump");
    expect(items).toHaveLength(3);
    expect(items[0].classList.contains("current")).toBe(true);
    expect((items[0].querySelector(".move.left") as any).disabled).toBe(true);
    expect((items[2].querySelector(".move.right") as any).disabled).toBe(true);
    (items[1].querySelector(".move.left") as HTMLElement).click();
    await settle(el);
    const call = calls.find((c) => c.service === "wave_group_order");
    expect(call.service_data.hwids).toEqual(["hw2", "hw1", "hw3"]);
    (
      root
        .querySelectorAll(".order_pump")[1]
        .querySelector(".move.right") as HTMLElement
    ).click();
    await settle(el);
    expect(count(calls, "wave_group_order")).toBe(2);
    (root.querySelector(".btn_group") as HTMLElement).click();
    await settle(el);
    expect(calls.at(-2).service_data.grouped).toBe(false);
  });

  it("drag and drop", async () => {
    const { el, root, calls } = await openEditor({
      grouped: true,
      group: GROUP,
    });
    const items = root.querySelectorAll(".order_pump");
    const ev = (type: string) => {
      const e: any = new Event(type, { cancelable: true });
      e.dataTransfer = { setData: vi.fn() };
      return e;
    };
    items[2].dispatchEvent(ev("dragstart"));
    await el.updateComplete;
    expect(items[2].classList.contains("dragging")).toBe(true);
    items[0].dispatchEvent(ev("dragover"));
    await el.updateComplete;
    expect(items[0].classList.contains("drop")).toBe(true);
    items[0].dispatchEvent(ev("dragleave"));
    items[0].dispatchEvent(ev("dragover"));
    items[0].dispatchEvent(ev("drop"));
    await settle(el);
    const call = calls.find((c) => c.service === "wave_group_order");
    expect(call.service_data.hwids).toEqual(["hw3", "hw1", "hw2"]);
    // Dropped on itself, or without a drag: nothing
    const again = root.querySelectorAll(".order_pump");
    again[1].dispatchEvent(ev("dragstart"));
    again[1].dispatchEvent(ev("drop"));
    again[1].dispatchEvent(ev("drop"));
    again[1].dispatchEvent(ev("dragend"));
    await settle(el);
    expect(count(calls, "wave_group_order")).toBe(1);
    // A drag without dataTransfer
    again[1].dispatchEvent(new Event("dragstart"));
    expect(el._drag).toBe("hw2");
  });

  it("same order: nothing sent; refusals are shown", async () => {
    const { el, root, calls } = await openEditor({
      grouped: true,
      group: GROUP,
      fail: { wave_group_order: "Refused", wave_group_set: "No group" },
    });
    await el.reorder(["hw1", "hw2", "hw3"]);
    expect(count(calls, "wave_group_order")).toBe(0);
    await el.reorder(["hw2", "hw1", "hw3"]);
    await el.updateComplete;
    expect(root.querySelector(".error")!.textContent).toContain("Refused");
    await el.set_grouped(false);
    await el.updateComplete;
    expect(root.querySelector(".error")!.textContent).toContain("No group");
    expect(el._busy).toBe(false);
  });

  it("without a library, the order and the steps are empty", () => {
    const el = makeElement(StubSchedule, makeDevice().device);
    el.step("hw1", 1);
    el._drag = "hw1";
    el.drop("hw2");
    expect(el._drag).toBe("");
  });
});
