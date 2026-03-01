// Consolidated tests for click_handler

import { Dialog } from "../src/base/dialog";
import { MyElement } from "../src/base/element";
import { attachClickHandlers } from "../src/utils/click_handler";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import RSDevice from "../src/devices/device";
import DeviceList from "../src/utils/common";

function makeEl(): HTMLElement {
  return document.createElement("div");
}
function press(el: HTMLElement) {
  el.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
  el.dispatchEvent(new PointerEvent("pointerup", { bubbles: true }));
}
function makeElement(): HTMLElement {
  return document.createElement("div");
}
function firePointerDown(el: HTMLElement, button = 0) {
  el.dispatchEvent(new PointerEvent("pointerdown", { button, bubbles: true }));
}
function firePointerUp(el: HTMLElement) {
  el.dispatchEvent(new PointerEvent("pointerup", { bubbles: true }));
}
function firePointerLeave(el: HTMLElement) {
  el.dispatchEvent(new PointerEvent("pointerleave", { bubbles: true }));
}
function firePointerCancel(el: HTMLElement) {
  el.dispatchEvent(new PointerEvent("pointercancel", { bubbles: true }));
}
function fireClick(el: HTMLElement) {
  el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
}
function fireDblClick(el: HTMLElement) {
  el.dispatchEvent(new MouseEvent("dblclick", { bubbles: true }));
}
function makeHass(devices: Record<string, any>) {
  return { states: {}, entities: {}, devices, callService: vi.fn() } as any;
}
function makeDevice(
  name: string,
  configEntry: string,
  idSuffix = name,
  model = "RSDoser",
  extraIds: string[] = [],
) {
  return {
    name,
    primary_config_entry: configEntry,
    model,
    identifiers: [["redsea", idSuffix, ...extraIds]],
  };
}
beforeAll(() => {
  if (!customElements.get("common-dialog")) {
    customElements.define("common-dialog", Dialog);
  }
});
function uid(p = "t") {
  return `${p}-${Math.random().toString(36).slice(2)}`;
}
function makeHass_B(states: Record<string, any> = {}) {
  return { states, devices: {}, callService: vi.fn(), entities: {} };
}
class StubDev extends RSDevice {
  override _render() {
    return null as any;
  }
}
if (!customElements.get("stub-dev-gaps"))
  customElements.define("stub-dev-gaps", StubDev);
function makeDev() {
  const d = new StubDev() as any;
  d.initial_config = { elements: {}, background_img: "" };
  d.user_config = null;
  d.device = null;
  d.entities = {};
  d._elements = {};
  d.dialogs = null;
  d.requestUpdate = vi.fn();
  return d;
}

describe("attachClickHandlers", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("calls onClick after the default click delay (250 ms)", () => {
    const el = makeEl();
    const onClick = vi.fn();
    attachClickHandlers(el, { onClick });

    press(el);
    el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    vi.advanceTimersByTime(300);

    expect(onClick).toHaveBeenCalledOnce();
  });

  it("does NOT call onClick before the click delay", () => {
    const el = makeEl();
    const onClick = vi.fn();
    attachClickHandlers(el, { onClick });

    press(el);
    el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    vi.advanceTimersByTime(100);

    expect(onClick).not.toHaveBeenCalled();
  });

  it("respects a custom clickDelay", () => {
    const el = makeEl();
    const onClick = vi.fn();
    attachClickHandlers(el, { onClick }, { clickDelay: 100 });

    press(el);
    el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    vi.advanceTimersByTime(110);

    expect(onClick).toHaveBeenCalledOnce();
  });

  it("calls onDoubleClick and NOT onClick on double-click", () => {
    const el = makeEl();
    const onClick = vi.fn();
    const onDoubleClick = vi.fn();
    attachClickHandlers(el, { onClick, onDoubleClick });

    press(el);
    el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    el.dispatchEvent(new MouseEvent("dblclick", { bubbles: true }));
    vi.advanceTimersByTime(300);

    expect(onDoubleClick).toHaveBeenCalledOnce();
    expect(onClick).not.toHaveBeenCalled();
  });

  it("calls onHold when pointer is held beyond the default delay (500 ms)", () => {
    const el = makeEl();
    const onHold = vi.fn();
    attachClickHandlers(el, { onHold });

    el.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    vi.advanceTimersByTime(600);

    expect(onHold).toHaveBeenCalledOnce();
  });

  it("does NOT call onHold when released before the delay", () => {
    const el = makeEl();
    const onHold = vi.fn();
    attachClickHandlers(el, { onHold });

    press(el);
    vi.advanceTimersByTime(600);

    expect(onHold).not.toHaveBeenCalled();
  });

  it("respects a custom holdDelay", () => {
    const el = makeEl();
    const onHold = vi.fn();
    attachClickHandlers(el, { onHold }, { holdDelay: 200 });

    el.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    vi.advanceTimersByTime(250);

    expect(onHold).toHaveBeenCalledOnce();
  });

  it("cancels hold timer on pointerleave", () => {
    const el = makeEl();
    const onHold = vi.fn();
    attachClickHandlers(el, { onHold });

    el.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    el.dispatchEvent(new PointerEvent("pointerleave", { bubbles: true }));
    vi.advanceTimersByTime(600);

    expect(onHold).not.toHaveBeenCalled();
  });

  it("cancels hold timer on pointercancel", () => {
    const el = makeEl();
    const onHold = vi.fn();
    attachClickHandlers(el, { onHold });

    el.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    el.dispatchEvent(new PointerEvent("pointercancel", { bubbles: true }));
    vi.advanceTimersByTime(600);

    expect(onHold).not.toHaveBeenCalled();
  });

  it("prevents the default context menu on right-click", () => {
    const el = makeEl();
    attachClickHandlers(el, {});

    const event = new MouseEvent("contextmenu", {
      bubbles: true,
      cancelable: true,
    });
    el.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
  });

  it("does not throw when no handlers are provided", () => {
    const el = makeEl();
    expect(() => {
      attachClickHandlers(el, {});
      press(el);
      el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      vi.advanceTimersByTime(600);
    }).not.toThrow();
  });
});
describe("attachClickHandlers — hold detection", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("fires onHold after the hold delay elapses", () => {
    const el = makeElement();
    const onHold = vi.fn();
    attachClickHandlers(el, { onHold });

    firePointerDown(el);

    vi.advanceTimersByTime(600);

    expect(onHold).toHaveBeenCalledTimes(1);
  });

  it("does NOT fire onHold when pointer is released before delay", () => {
    const el = makeElement();
    const onHold = vi.fn();
    attachClickHandlers(el, { onHold });

    firePointerDown(el);
    vi.advanceTimersByTime(100);
    firePointerUp(el);
    vi.advanceTimersByTime(600);

    expect(onHold).not.toHaveBeenCalled();
  });

  it("pointerleave cancels hold timer", () => {
    const el = makeElement();
    const onHold = vi.fn();
    attachClickHandlers(el, { onHold });

    firePointerDown(el);
    vi.advanceTimersByTime(100);
    firePointerLeave(el);
    vi.advanceTimersByTime(600);

    expect(onHold).not.toHaveBeenCalled();
  });

  it("pointercancel cancels hold timer", () => {
    const el = makeElement();
    const onHold = vi.fn();
    attachClickHandlers(el, { onHold });

    firePointerDown(el);
    vi.advanceTimersByTime(100);
    firePointerCancel(el);
    vi.advanceTimersByTime(600);

    expect(onHold).not.toHaveBeenCalled();
  });

  it("a completed hold blocks the subsequent click event", () => {
    const el = makeElement();
    const onClick = vi.fn();
    const onHold = vi.fn();
    attachClickHandlers(el, { onClick, onHold });

    firePointerDown(el);
    vi.advanceTimersByTime(600);

    firePointerUp(el);
    fireClick(el);
    vi.advanceTimersByTime(400);

    expect(onHold).toHaveBeenCalledTimes(1);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("right-click (button=2) does not trigger hold", () => {
    const el = makeElement();
    const onHold = vi.fn();
    attachClickHandlers(el, { onHold });

    firePointerDown(el, 2);
    vi.advanceTimersByTime(600);

    expect(() => vi.advanceTimersByTime(100)).not.toThrow();
  });
});
describe("attachClickHandlers — double-click", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("fires onDoubleClick and does NOT fire onClick", () => {
    const el = makeElement();
    const onClick = vi.fn();
    const onDoubleClick = vi.fn();
    attachClickHandlers(el, { onClick, onDoubleClick });

    fireClick(el);
    fireDblClick(el);
    vi.advanceTimersByTime(400);

    expect(onDoubleClick).toHaveBeenCalledTimes(1);
    expect(onClick).not.toHaveBeenCalled();
  });
});
describe("attachClickHandlers — contextmenu", () => {
  it("prevents the default context menu", () => {
    const el = makeElement();
    attachClickHandlers(el, {});
    const event = new MouseEvent("contextmenu", {
      bubbles: true,
      cancelable: true,
    });
    el.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });
});
describe("attachClickHandlers — click_handler.ts branch coverage", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("L81 true: click is ignored when holdActive is true", () => {
    const el = makeEl();
    const onClick = vi.fn();
    const onHold = vi.fn();
    attachClickHandlers(
      el,
      { onClick, onHold },
      { holdDelay: 500, clickDelay: 250 },
    );

    el.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    vi.advanceTimersByTime(600);

    expect(onHold).toHaveBeenCalledOnce();

    el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    vi.advanceTimersByTime(300);

    expect(onClick).not.toHaveBeenCalled();
  });

  it("L86 false: does not call onClick when doubleClickDetected is true at timeout expiry", () => {
    const el = makeEl();
    const onClick = vi.fn();
    const onDoubleClick = vi.fn();
    attachClickHandlers(el, { onClick, onDoubleClick }, { clickDelay: 250 });

    el.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    el.dispatchEvent(new PointerEvent("pointerup", { bubbles: true }));

    el.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    el.dispatchEvent(new MouseEvent("dblclick", { bubbles: true }));

    vi.advanceTimersByTime(300);

    expect(onClick).not.toHaveBeenCalled();
    expect(onDoubleClick).toHaveBeenCalledOnce();
  });

  it("L87 optional chain: does not throw when onClick is undefined and timeout fires normally", () => {
    const el = makeEl();

    attachClickHandlers(el, {}, { clickDelay: 250 });

    el.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    el.dispatchEvent(new PointerEvent("pointerup", { bubbles: true }));
    el.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(() => vi.advanceTimersByTime(300)).not.toThrow();
  });

  it("L96 true: dblclick is silently ignored while a hold is active", () => {
    const el = makeEl();
    const onDoubleClick = vi.fn();
    const onHold = vi.fn();
    attachClickHandlers(
      el,
      { onDoubleClick, onHold },
      { holdDelay: 500, clickDelay: 250 },
    );

    el.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    vi.advanceTimersByTime(600);

    expect(onHold).toHaveBeenCalledOnce();

    el.dispatchEvent(new MouseEvent("dblclick", { bubbles: true }));

    expect(onDoubleClick).not.toHaveBeenCalled();
  });
});
describe("click_handler.ts L86 — doubleClickDetected=true at timeout fire", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("does not call onClick when doubleClickDetected is true when timeout fires", async () => {
    const { attachClickHandlers } = await import("../src/utils/click_handler");
    const el = document.createElement("div");
    const onClick = vi.fn();
    const onDoubleClick = vi.fn();
    attachClickHandlers(el, { onClick, onDoubleClick }, { clickDelay: 250 });

    el.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    el.dispatchEvent(new PointerEvent("pointerup", { bubbles: true }));
    el.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    const realClear = window.clearTimeout;
    window.clearTimeout = () => {};
    el.dispatchEvent(new MouseEvent("dblclick", { bubbles: true }));
    window.clearTimeout = realClear;

    vi.advanceTimersByTime(300);

    expect(onClick).not.toHaveBeenCalled();
    expect(onDoubleClick).toHaveBeenCalledOnce();
  });
});
