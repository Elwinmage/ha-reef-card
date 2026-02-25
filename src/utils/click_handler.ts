/**
 * Detect Click, Hold and Double Click event and link them to given action
 * Use:
 *    attachClickHandlers(this, {
 *     onClick: () => {
 *       this._click();
 *     },
 *
 *      onDoubleClick: () => {
 *        this._dblclick();
 *     },
 *
 *      onHold: () => {
 *        this._longclick();
 *      },
 *    });
 * @param element: the lit-element to watch
 * @param handler: the action to run when Click, DoubleClick or Hold is detected
 * @param options : timer for hold and click, default 500ms to treat a click as a hold, 250 for simple click
 */
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
  },
) {
  const holdDelay = options?.holdDelay ?? 500;
  const clickDelay = options?.clickDelay ?? 250;

  let holdTimeout: number | null = null;
  let clickTimeout: number | null = null;
  let holdActive = false;
  let doubleClickDetected = false;

  /**
   * Clear Hold Timer when pointer down is detected
   */
  function clearHold() {
    if (holdTimeout !== null) {
      clearTimeout(holdTimeout);
      holdTimeout = null;
    }
  }

  /**
   * Clear click Timer when pointer down is detected
   */
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

  // ---- CLICK (differed to detect double click) ----
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

  // ---- Disable contextual menu on right click ----
  element.addEventListener("contextmenu", (e) => e.preventDefault());
}
