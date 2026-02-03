type ClickHandlers = {
  onClick?: (event: PointerEvent) => void;
  onDoubleClick?: (event: PointerEvent) => void;
  onHold?: (event: PointerEvent) => void;
};

export function attachClickHandlers(
  element: HTMLElement,
  handlers: ClickHandlers,
  options?: {
    holdDelay?: number;        // durée pour hold (ms)
    doubleClickDelay?: number; // délai double click (ms)
  }
) {
  const holdDelay = options?.holdDelay ?? 500;
  const doubleClickDelay = options?.doubleClickDelay ?? 250;

  let holdTimeout: number | null = null;
  let clickTimeout: number | null = null;
  let clickCount = 0;
  let holdTriggered = false;

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

  element.addEventListener("contextmenu", (event: Event) => {
    event.preventDefault();
  });
  
  element.addEventListener("pointerdown", (event) => {
    holdTriggered = false;

    holdTimeout = window.setTimeout(() => {
      holdTriggered = true;
      handlers.onHold?.(event);
    }, holdDelay);
  });

  element.addEventListener("pointerup", (event) => {
    clearHold();

    // Si hold déclenché → on ignore click/double click
    if (holdTriggered) return;

    clickCount++;

    if (clickCount === 1) {
      clickTimeout = window.setTimeout(() => {
        handlers.onClick?.(event);
        clickCount = 0;
      }, doubleClickDelay);
    }

    if (clickCount === 2) {
      clearClick();
      handlers.onDoubleClick?.(event);
      clickCount = 0;
    }
  });

  element.addEventListener("pointerleave", () => {
    clearHold();
  });
}
