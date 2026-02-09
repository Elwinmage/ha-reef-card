type ClickHandlers = {
  onClick?: (event: PointerEvent) => void;
  onDoubleClick?: (event: PointerEvent) => void;
  onHold?: (event: PointerEvent) => void;
};

export function attachClickHandlers(
  element: HTMLElement,
  handlers: {
    onClick?: (e: MouseEvent) => void;
    onDoubleClick?: (e: MouseEvent) => void;
    onHold?: (e: PointerEvent) => void;
  },
  options?: {
    holdDelay?: number;
    clickDelay?: number;
  }
) {
  const holdDelay = options?.holdDelay ?? 500;
  const clickDelay = options?.clickDelay ?? 250;

  let holdTimeout: number | null = null;
  let clickTimeout: number | null = null;
  let holdActive = false;
  let doubleClickDetected = false;

  function clearHold() {
    if (holdTimeout !== null) {
      clearTimeout(holdTimeout);
      holdTimeout = null;
    }
  }

  function clearClick() {
    if (clickTimeout !== null) {
      clearTimeout(clickTimeout);
      clickTimeout = null;
    }
  }

  // ---- HOLD ----
  element.addEventListener("pointerdown", (e) => {
    holdActive = false;
    doubleClickDetected = false;

    clearHold();
    clearClick();

    holdTimeout = window.setTimeout(() => {
      holdActive = true;
      handlers.onHold?.(e);
    }, holdDelay);
  });

  element.addEventListener("pointerup", clearHold);
  element.addEventListener("pointerleave", clearHold);
  element.addEventListener("pointercancel", clearHold);

  // ---- CLICK (différé) ----
  element.addEventListener("click", (e) => {
    if (holdActive) return;

    clearClick();

    clickTimeout = window.setTimeout(() => {
      if (!doubleClickDetected) {
        handlers.onClick?.(e);
      }
      clickTimeout = null;
      doubleClickDetected = false;
    }, clickDelay);
  });

  // ---- DOUBLE CLICK ----
  element.addEventListener("dblclick", (e) => {
    if (holdActive) return;

    doubleClickDetected = true;
    clearClick();
    handlers.onDoubleClick?.(e);
  });

  element.addEventListener("contextmenu", e => e.preventDefault());
}
