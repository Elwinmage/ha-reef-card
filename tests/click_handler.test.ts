/**
 * Unit tests — src/utils/click_handler.ts
 * Covers: onClick, onDoubleClick, onHold, context-menu prevention
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { attachClickHandlers } from "../src/utils/click_handler";

function makeEl(): HTMLElement {
  return document.createElement("div");
}

function press(el: HTMLElement) {
  el.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
  el.dispatchEvent(new PointerEvent("pointerup", { bubbles: true }));
}

describe("attachClickHandlers", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  // ── onClick ──────────────────────────────────────────────────────────────

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

  // ── onDoubleClick ─────────────────────────────────────────────────────────

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

  // ── onHold ────────────────────────────────────────────────────────────────

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

    press(el); // down + up immediately
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

  // ── Context menu ──────────────────────────────────────────────────────────

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

  // ── Safety ────────────────────────────────────────────────────────────────

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
