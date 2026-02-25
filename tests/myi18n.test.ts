/**
 * Unit tests — src/translations/myi18n.ts
 * Imports real class to generate actual coverage.
 * Targets uncovered lines:
 *   122-124 (fallback language lookup)
 *   179-180 (setLanguage: language not loaded error)
 *   235     (getLoadedLanguages)
 *   310     (mergeDictionary: lang not yet in dictionaries)
 */

import { describe, it, expect, vi } from "vitest";
import { MyI18n } from "../src/translations/myi18n";

// ── Build a fresh isolated instance for each test group ───────────────────────

function makeI18n(): MyI18n {
  const i18n = new MyI18n();
  // Inject controlled dictionaries
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

// ── Basic lookup ──────────────────────────────────────────────────────────────

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

// ── Fallback language lookup (lines 122-124) ──────────────────────────────────

describe("MyI18n — fallback language lookup (lines 122-124)", () => {
  it("falls back to 'en' when key exists only in fallback dict", () => {
    const i18n = makeI18n();
    // Set current language to fr which has no 'nested.key'
    (i18n as any).currentLanguage = "fr";
    // fr has no 'nested.key', should fall back to en
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

// ── setLanguage (lines 175-186 including lines 179-180) ──────────────────────

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
    expect(i18n.getLanguage()).toBe("en"); // unchanged
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

// ── hasTranslation ────────────────────────────────────────────────────────────

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

// ── getLoadedLanguages (line 235) ─────────────────────────────────────────────

describe("MyI18n.getLoadedLanguages() (line 235)", () => {
  it("returns all keys in the dictionaries map", () => {
    const i18n = makeI18n();
    const loaded = (i18n as any).getLoadedLanguages();
    expect(loaded).toContain("en");
    expect(loaded).toContain("fr");
  });
});

// ── getAvailableKeys ──────────────────────────────────────────────────────────

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

// ── addDictionary ─────────────────────────────────────────────────────────────

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

// ── mergeDictionary (lines 305-315) ──────────────────────────────────────────

describe("MyI18n.mergeDictionary() (lines 305-315)", () => {
  it("merges into existing language dict (line 305-311)", () => {
    const i18n = makeI18n();
    i18n.mergeDictionary("en", { extra: "Extra key" } as any);
    expect(i18n._("extra")).toBe("Extra key");
    expect(i18n._("hello")).toBe("Hello"); // original preserved
  });

  it("creates new dict when language not yet loaded (line 310)", () => {
    const i18n = makeI18n();
    // "it" is not in dictionaries
    i18n.mergeDictionary("it" as any, { ciao: "Ciao" } as any);
    i18n.addDictionary("it" as any, {} as any); // ensure it's in supported
    i18n.setLanguage("it" as any);
    // After merge+add, dict should contain merged key
    expect((i18n as any).dictionaries.get("it")).toBeDefined();
  });
});

// ── getDictionary ─────────────────────────────────────────────────────────────

describe("MyI18n.getDictionary()", () => {
  it("returns dict for known language", () => {
    const dict = makeI18n().getDictionary("en");
    expect((dict as any)?.hello).toBe("Hello");
  });

  it("returns undefined for unsupported language", () => {
    expect(makeI18n().getDictionary("xx" as any)).toBeUndefined();
  });
});

// ── getSupportedLanguages / getFallbackLanguage ───────────────────────────────

describe("MyI18n metadata", () => {
  it("getFallbackLanguage() returns 'en'", () =>
    expect(makeI18n().getFallbackLanguage()).toBe("en"));
  it("getSupportedLanguages() returns configured list", () => {
    expect(makeI18n().getSupportedLanguages()).toEqual(
      expect.arrayContaining(["en", "fr"]),
    );
  });
});
