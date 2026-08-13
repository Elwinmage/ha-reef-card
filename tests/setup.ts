/**
 * Global test setup — executed before any test file is loaded.
 *
 * Registers a minimal <home-assistant> stub in the JSDOM environment so that
 * MyI18n can query it at module load time and detect the "en" language.
 */

// Register the custom element before any src module is imported
class MockHomeAssistant extends HTMLElement {
  hass = { language: "en", selectedLanguage: "en" };
}

if (!customElements.get("home-assistant")) {
  customElements.define("home-assistant", MockHomeAssistant);
}

// Mount a <home-assistant> instance into the document
const haEl = document.createElement("home-assistant") as any;
haEl.hass = { language: "en", selectedLanguage: "en" };
document.body.appendChild(haEl);

// Silence expected console.debug noise from MyI18n initialisation
const originalDebug = console.debug;
console.debug = (...args: any[]) => {
  if (typeof args[0] === "string" && args[0].startsWith("MyI18n")) return;
  originalDebug(...args);
};

// vitest.setup.ts
if (!global.PointerEvent) {
  class PointerEvent extends MouseEvent {
    public pointerId: number;
    public pointerType: string;

    constructor(type: string, params: PointerEventInit = {}) {
      super(type, params);
      this.pointerId = params.pointerId || 0;
      this.pointerType = params.pointerType || "";
    }
  }
  // @ts-ignore
  global.PointerEvent = PointerEvent;
}

// Pre-populate RSDevice._helpersResolved with a minimal mock so that
// hui-*-card tests work without waiting for connectedCallback / loadCardHelpers.
import { RSDevice } from "../src/devices/device";
RSDevice._helpersResolved = {
  createCardElement: (conf: any) => {
    const el = document.createElement("div") as any;
    el.setConfig = () => {};
    el.hass = null;
    el._conf = conf;
    return el;
  },
};

// Mock CSSStyleSheet.replaceSync — not available in jsdom
if (typeof CSSStyleSheet.prototype.replaceSync === "undefined") {
  CSSStyleSheet.prototype.replaceSync = function (_css: string) {};
}
if (typeof CSSStyleSheet.prototype.replace === "undefined") {
  CSSStyleSheet.prototype.replace = function (_css: string) {
    return Promise.resolve();
  };
}
// Mock adoptedStyleSheets if not supported
if (
  !Object.prototype.hasOwnProperty.call(
    Document.prototype,
    "adoptedStyleSheets",
  )
) {
  Object.defineProperty(Document.prototype, "adoptedStyleSheets", {
    get() {
      return [];
    },
    set() {},
  });
}
if (
  !Object.prototype.hasOwnProperty.call(
    ShadowRoot.prototype,
    "adoptedStyleSheets",
  )
) {
  Object.defineProperty(ShadowRoot.prototype, "adoptedStyleSheets", {
    get() {
      return [];
    },
    set() {},
  });
}
