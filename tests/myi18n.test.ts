// Consolidated tests for myi18n

import { Sensor } from "../src/base/sensor";
import { RSSwitch } from "../src/base/switch";
import { MyI18n } from "../src/translations/myi18n";
import { toTime } from "../src/utils/common";
import { merge } from "../src/utils/merge";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import RSDevice from "../src/devices/device";

function makeI18n(): MyI18n {
  const i18n = new MyI18n();
  (i18n as any).dictionaries = new Map([
    [
      "en",
      {
        hello: "Hello",
        greet: "Hello, {name}!",
        nested: { key: "Nested value" },
        canNotFindTranslation: "Missing: ",
      },
    ],
    [
      "fr",
      {
        hello: "Bonjour",
        greet: "Bonjour, {name}!",
        canNotFindTranslation: "Manquant : ",
      },
    ],
  ]);
  (i18n as any).currentLanguage = "en";
  (i18n as any).fallbackLanguage = "en";
  (i18n as any).supportedLanguages = ["en", "fr"];
  return i18n;
}
const EN_NO_PREFIX = {
  hello: "Hello",
  nested: { key: "Nested value" },
};
const EN_FULL = {
  hello: "Hello",
  greet: "Hello, {name}!",
  nested: { key: "Nested value" },
  canNotFindTranslation: "Missing: ",
};
const FR_FULL = {
  hello: "Bonjour",
  greet: "Bonjour, {name}!",
  canNotFindTranslation: "Manquant : ",
};
function makeI18n_B(enDict = EN_FULL, frDict = FR_FULL): MyI18n {
  const i18n = new MyI18n();
  (i18n as any).dictionaries = new Map([
    ["en", enDict],
    ["fr", frDict],
  ]);
  (i18n as any).currentLanguage = "en";
  (i18n as any).fallbackLanguage = "en";
  (i18n as any).supportedLanguages = ["en", "fr"];
  return i18n;
}
class StubDevice extends RSDevice {
  _render(_style: any = null, _substyle: any = null): any {
    return null;
  }
}
if (!customElements.get("stub-device-b"))
  customElements.define("stub-device-b", StubDevice);
class StubSensor extends Sensor {
  protected override _render(_s = ""): any {
    return null;
  }
}
if (!customElements.get("stub-sensor-b"))
  customElements.define("stub-sensor-b", StubSensor);
class StubSwitch extends RSSwitch {
  protected override _render(_s = ""): any {
    return null;
  }
}
if (!customElements.get("stub-switch-b"))
  customElements.define("stub-switch-b", StubSwitch);
function makeState(
  state: string,
  entity_id = "sensor.test",
  attrs: Record<string, any> = {},
): any {
  return { entity_id, state, attributes: { ...attrs } };
}
function makeHass(
  states: Record<string, any> = {},
  entities: Record<string, any> = {},
): any {
  return {
    states: {
      "sensor.device_state": makeState("on", "sensor.device_state"),
      "sensor.maintenance": makeState("off", "sensor.maintenance"),
      ...states,
    },
    entities,
    devices: {},
    callService: vi.fn(),
  };
}
function makeDevice(
  model = "RSDOSE4",
  name = "my_pump",
  disabled_by: string | null = null,
): any {
  return {
    model,
    name,
    elements: [
      {
        id: "dev-id-001",
        model,
        identifiers: [[null, `${model.toLowerCase()}_1234`]],
        disabled_by,
        primary_config_entry: "cfg-entry-xyz",
      },
    ],
  };
}

describe("MyI18n._()", () => {
  it("returns translation for known key", () =>
    expect(makeI18n()._("hello")).toBe("Hello"));
  it("resolves nested key with dot notation", () =>
    expect(makeI18n()._("nested.key")).toBe("Nested value"));
  it("returns fallback message for unknown key", () =>
    expect(makeI18n()._("does.not.exist")).toContain("does.not.exist"));
  it("replaces {name} placeholder", () =>
    expect(makeI18n()._("greet", { name: "Alice" })).toBe("Hello, Alice!"));
  it("leaves unreplaced placeholders when param is missing", () =>
    expect(makeI18n()._("greet")).toBe("Hello, {name}!"));
});
describe("MyI18n — fallback language lookup (lines 122-124)", () => {
  it("falls back to 'en' when key exists only in fallback dict", () => {
    const i18n = makeI18n();

    (i18n as any).currentLanguage = "fr";

    const result = i18n._("nested.key");
    expect(result).toBe("Nested value");
  });

  it("returns error prefix when key missing in both current and fallback", () => {
    const i18n = makeI18n();
    (i18n as any).currentLanguage = "fr";
    const result = i18n._("totally_missing_key");
    expect(result).toContain("totally_missing_key");
  });
});
describe("MyI18n.setLanguage()", () => {
  it("switches to a loaded language", () => {
    const i18n = makeI18n();
    i18n.setLanguage("fr" as any);
    expect(i18n.getLanguage()).toBe("fr");
    expect(i18n._("hello")).toBe("Bonjour");
  });

  it("does nothing when switching to the same language (line 179)", () => {
    const i18n = makeI18n();
    i18n.setLanguage("en" as any);
    expect(i18n.getLanguage()).toBe("en");
  });

  it("logs error and does nothing for unknown language (line 180)", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const i18n = makeI18n();
    i18n.setLanguage("ja" as any);
    expect(i18n.getLanguage()).toBe("en");
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it("dispatches i18n-language-changed event on switch", () => {
    const i18n = makeI18n();
    const events: string[] = [];
    window.addEventListener("i18n-language-changed", (e: any) =>
      events.push(e.detail?.language),
    );
    i18n.setLanguage("fr" as any);
    expect(events).toContain("fr");
  });
});
describe("MyI18n.hasTranslation()", () => {
  it("returns true for existing top-level key", () =>
    expect(makeI18n().hasTranslation("hello")).toBe(true));
  it("returns true for nested key", () =>
    expect(makeI18n().hasTranslation("nested.key")).toBe(true));
  it("returns false for missing key", () =>
    expect(makeI18n().hasTranslation("unknown.key")).toBe(false));
  it("checks specific language when provided", () => {
    expect(makeI18n().hasTranslation("hello", "fr" as any)).toBe(true);
    expect(makeI18n().hasTranslation("nested.key", "fr" as any)).toBe(false);
  });
  it("returns false for unsupported language", () =>
    expect(makeI18n().hasTranslation("hello", "xx" as any)).toBe(false));
});
describe("MyI18n.getLoadedLanguages() (line 235)", () => {
  it("returns all keys in the dictionaries map", () => {
    const i18n = makeI18n();
    const loaded = (i18n as any).getLoadedLanguages();
    expect(loaded).toContain("en");
    expect(loaded).toContain("fr");
  });
});
describe("MyI18n.getAvailableKeys()", () => {
  it("returns flattened keys for current language", () => {
    const keys = makeI18n().getAvailableKeys();
    expect(keys).toContain("hello");
    expect(keys).toContain("greet");
    expect(keys).toContain("nested.key");
  });

  it("returns empty array for unsupported language", () => {
    expect(makeI18n().getAvailableKeys("xx" as any)).toEqual([]);
  });
});
describe("MyI18n.addDictionary()", () => {
  it("registers a new language", () => {
    const i18n = makeI18n();
    i18n.addDictionary("de" as any, { hello: "Hallo" } as any);
    i18n.setLanguage("de" as any);
    expect(i18n._("hello")).toBe("Hallo");
  });

  it("adds language to supported list", () => {
    const i18n = makeI18n();
    i18n.addDictionary("de" as any, { hello: "Hallo" } as any);
    expect(i18n.getSupportedLanguages()).toContain("de");
  });
});
describe("MyI18n.mergeDictionary() (lines 305-315)", () => {
  it("merges into existing language dict (line 305-311)", () => {
    const i18n = makeI18n();
    i18n.mergeDictionary("en", { extra: "Extra key" } as any);
    expect(i18n._("extra")).toBe("Extra key");
    expect(i18n._("hello")).toBe("Hello");
  });

  it("creates new dict when language not yet loaded (line 310)", () => {
    const i18n = makeI18n();

    i18n.mergeDictionary("it" as any, { ciao: "Ciao" } as any);
    i18n.addDictionary("it" as any, {} as any);
    i18n.setLanguage("it" as any);

    expect((i18n as any).dictionaries.get("it")).toBeDefined();
  });
});
describe("MyI18n.getDictionary()", () => {
  it("returns dict for known language", () => {
    const dict = makeI18n().getDictionary("en");
    expect((dict as any)?.hello).toBe("Hello");
  });

  it("returns undefined for unsupported language", () => {
    expect(makeI18n().getDictionary("xx" as any)).toBeUndefined();
  });
});
describe("MyI18n metadata", () => {
  it("getFallbackLanguage() returns 'en'", () =>
    expect(makeI18n().getFallbackLanguage()).toBe("en"));
  it("getSupportedLanguages() returns configured list", () => {
    expect(makeI18n().getSupportedLanguages()).toEqual(
      expect.arrayContaining(["en", "fr"]),
    );
  });
});
describe("MyI18n constructor — config.fallbackLanguage provided", () => {
  it("uses the supplied fallbackLanguage instead of 'en'", () => {
    const i18n = new MyI18n({ fallbackLanguage: "fr" });
    expect((i18n as any).fallbackLanguage).toBe("fr");
  });
});
describe("MyI18n constructor — config.supportedLanguages provided", () => {
  it("uses the supplied supportedLanguages list", () => {
    const i18n = new MyI18n({ supportedLanguages: ["en", "de"] });
    expect((i18n as any).supportedLanguages).toEqual(["en", "de"]);
  });
});
describe("MyI18n constructor — language detection chain", () => {
  let origQuerySelector: typeof document.querySelector;

  beforeEach(() => {
    origQuerySelector = document.querySelector.bind(document);
  });

  afterEach(() => {
    Object.defineProperty(document, "querySelector", {
      value: origQuerySelector,
      configurable: true,
      writable: true,
    });
  });

  it("falls through to hass.language when selectedLanguage is absent", () => {
    Object.defineProperty(document, "querySelector", {
      value: (_: string) => ({ hass: { language: "fr" } }),
      configurable: true,
      writable: true,
    });
    const i18n = new MyI18n();
    expect((i18n as any).currentLanguage).toBe("fr");
  });

  it("falls through to config.defaultLanguage when hass has no language fields", () => {
    Object.defineProperty(document, "querySelector", {
      value: (_: string) => ({ hass: {} }),
      configurable: true,
      writable: true,
    });
    const i18n = new MyI18n({ defaultLanguage: "de" });
    expect((i18n as any).currentLanguage).toBe("de");
  });

  it("falls through to fallbackLanguage when no home-assistant and no defaultLanguage", () => {
    Object.defineProperty(document, "querySelector", {
      value: (_: string) => null,
      configurable: true,
      writable: true,
    });
    const i18n = new MyI18n({ fallbackLanguage: "fr" });
    expect((i18n as any).currentLanguage).toBe("fr");
  });

  it("uses config.defaultLanguage when home-assistant element is absent", () => {
    Object.defineProperty(document, "querySelector", {
      value: (_: string) => null,
      configurable: true,
      writable: true,
    });
    const i18n = new MyI18n({ defaultLanguage: "es" });
    expect((i18n as any).currentLanguage).toBe("es");
  });
});
describe("MyI18n.normalizeLanguage() — region tag stripping", () => {
  it("strips region subtag and normalizes to base language", () => {
    const i18n = makeI18n_B();

    i18n.setLanguage("fr-FR");
    expect(i18n.getLanguage()).toBe("fr");
  });

  it("warns and returns fallback for completely unsupported base tag", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const i18n = makeI18n_B();
    i18n.setLanguage("ja-JP");
    expect(i18n.getLanguage()).toBe("en");
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
describe("MyI18n getNestedValue() — L104 false branch (value is object, not string)", () => {
  it("returns the error message when key resolves to a nested object instead of a string", () => {
    const i18n = makeI18n_B();

    const result = i18n._("nested");
    expect(result).toContain("nested");
    expect(result).not.toBe("[object Object]");
  });
});
describe("MyI18n._() — L123 false branch (fallback dict absent from Map)", () => {
  it("skips fallback lookup silently when fallback dict is not in dictionaries", () => {
    const i18n = makeI18n_B();

    (i18n as any).currentLanguage = "fr";

    (i18n as any).dictionaries.delete("en");

    const result = i18n._("nested.key");

    expect(result).toBe("Translation not found: nested.key");
  });
});
describe("MyI18n._() — errorPrefix null → default literal used", () => {
  it("uses literal 'Translation not found: ' when fallback dict lacks canNotFindTranslation", () => {
    const i18n = makeI18n_B(EN_NO_PREFIX as any);
    const result = i18n._("totally_unknown_key");
    expect(result).toBe("Translation not found: totally_unknown_key");
  });
});
describe("MyI18n._() — no fallback dict at all → ternary false branch", () => {
  it("returns literal prefix when fallback dictionary is not in the map", () => {
    const i18n = makeI18n_B();

    (i18n as any).dictionaries.delete("en");

    const result = i18n._("missing_key");
    expect(result).toBe("Translation not found: missing_key");
  });
});
describe("MyI18n.setLanguage() — language normalised but not loaded", () => {
  it("logs error and keeps current language when dict is missing", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const i18n = makeI18n_B();

    (i18n as any).supportedLanguages.push("de");

    i18n.setLanguage("de");
    expect(i18n.getLanguage()).toBe("en");
    expect(spy).toHaveBeenCalledWith(expect.stringContaining("de"));
    spy.mockRestore();
  });
});
describe("MyI18n flattenKeys() — null value in dictionary entry", () => {
  it("ignores null values and does not include them in keys", () => {
    const i18n = makeI18n_B();

    (i18n as any).dictionaries.set("en", {
      hello: "Hello",
      broken: null,
      nested: { key: "value" },
    });
    const keys = i18n.getAvailableKeys("en" as any);
    expect(keys).toContain("hello");
    expect(keys).toContain("nested.key");

    expect(keys).not.toContain("broken");
  });
});
describe("MyI18n.addDictionary() — language already supported", () => {
  it("does not duplicate language in supportedLanguages when already present", () => {
    const i18n = makeI18n_B();

    i18n.addDictionary("en" as any, { hello: "Hi" } as any);
    const supported = i18n.getSupportedLanguages();
    const count = supported.filter((l) => l === "en").length;
    expect(count).toBe(1);
  });

  it("updates the dictionary content even when language was already registered", () => {
    const i18n = makeI18n_B();
    i18n.addDictionary("en" as any, { hello: "Hi there" } as any);
    (i18n as any).currentLanguage = "en";
    expect(i18n._("hello")).toBe("Hi there");
  });
});
describe("MyI18n.getAvailableKeys() — lang argument provided", () => {
  it("returns keys for the specified language, not currentLanguage", () => {
    const i18n = makeI18n_B();
    (i18n as any).currentLanguage = "en";
    const keys = i18n.getAvailableKeys("fr" as any);
    expect(keys).toContain("hello");

    expect(keys).not.toContain("nested.key");
  });
});
describe("MyI18n.getDictionary() — no argument uses currentLanguage", () => {
  it("returns the dictionary for currentLanguage when called without argument", () => {
    const i18n = makeI18n_B();
    (i18n as any).currentLanguage = "fr";
    const dict = i18n.getDictionary();
    expect((dict as any)?.hello).toBe("Bonjour");
  });
});
describe("MyI18n replaceParams() — placeholder branches", () => {
  it("substitutes present placeholder with its string value", () => {
    const i18n = makeI18n_B();
    const result = i18n._("greet", { name: "Bob" });
    expect(result).toBe("Hello, Bob!");
  });

  it("substitutes present placeholder with its numeric value via String()", () => {
    const i18n = makeI18n_B();

    (i18n as any).dictionaries.get("en").count = "Count: {n}";
    const result = i18n._("count", { n: 42 });
    expect(result).toBe("Count: 42");
  });

  it("leaves placeholder unchanged when its key is absent from params", () => {
    const i18n = makeI18n_B();

    const result = i18n._("greet", { other: "x" } as any);
    expect(result).toBe("Hello, {name}!");
  });
});
describe("MyI18n.hasTranslation() — dict absent for requested lang", () => {
  it("returns false when the requested language has no loaded dictionary", () => {
    const i18n = makeI18n_B();
    expect(i18n.hasTranslation("hello", "xx" as any)).toBe(false);
  });
});
describe("MyI18n.mergeDictionary() — lang not yet in dictionaries", () => {
  it("creates a new dictionary entry for the language", () => {
    const i18n = makeI18n_B();

    i18n.mergeDictionary("it" as any, { ciao: "Ciao" } as any);
    const dict = (i18n as any).dictionaries.get("it");
    expect(dict).toBeDefined();
    expect((dict as any).ciao).toBe("Ciao");
  });
});
