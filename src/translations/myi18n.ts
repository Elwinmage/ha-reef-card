import type {
  LanguageDictionary,
  SupportedLanguage,
  I18nConfig,
  NestedTranslation,
} from "./types";

// Import synchrone des dictionarys
import en from "./locales/en.json";
import fr from "./locales/fr.json";

class MyI18n {
  private fallbackLanguage: SupportedLanguage;
  private currentLanguage: SupportedLanguage;
  private dictionaries: Map<SupportedLanguage, LanguageDictionary>;
  private supportedLanguages: SupportedLanguage[];

  constructor(config: I18nConfig = {}) {
    this.fallbackLanguage = config.fallbackLanguage || "en";
    this.supportedLanguages = config.supportedLanguages || ["en", "fr"];

    this.dictionaries = new Map<SupportedLanguage, LanguageDictionary>([
      ["en", en as LanguageDictionary],
      ["fr", fr as LanguageDictionary],
    ]);

    const homeAssistant = document.querySelector("home-assistant");
    const detectedLang =
      homeAssistant?.hass?.selectedLanguage ||
      homeAssistant?.hass?.language ||
      config.defaultLanguage ||
      this.fallbackLanguage;

    this.currentLanguage = this.normalizeLanguage(detectedLang);

    console.debug(`MyI18n initialized with language: ${this.currentLanguage}`);
  }

  private normalizeLanguage(lang: string): SupportedLanguage {
    const normalized = lang.toLowerCase().split("-")[0] as SupportedLanguage;

    if (this.supportedLanguages.includes(normalized)) {
      return normalized;
    }

    console.warn(
      `Language '${lang}' not supported, falling back to '${this.fallbackLanguage}'`,
    );
    return this.fallbackLanguage;
  }

  private getNestedValue(obj: NestedTranslation, path: string): string | null {
    const keys = path.split(".");
    let current: any = obj;

    for (const key of keys) {
      if (current && typeof current === "object" && key in current) {
        current = current[key];
      } else {
        return null;
      }
    }

    return typeof current === "string" ? current : null;
  }

  _(key: string, params?: Record<string, string | number>): string {
    let result: string | null = null;

    const currentDict = this.dictionaries.get(this.currentLanguage);
    if (currentDict) {
      result = this.getNestedValue(currentDict, key);
    }

    if (result === null && this.currentLanguage !== this.fallbackLanguage) {
      const fallbackDict = this.dictionaries.get(this.fallbackLanguage);
      if (fallbackDict) {
        result = this.getNestedValue(fallbackDict, key);
      }
    }

    if (result === null) {
      const errorPrefix = this.dictionaries.get(this.fallbackLanguage)
        ? this.getNestedValue(
            this.dictionaries.get(this.fallbackLanguage),
            "canNotFindTranslation",
          )
        : "Translation not found: ";
      result = (errorPrefix || "Translation not found: ") + key;
    }

    if (params) {
      result = this.replaceParams(result, params);
    }

    return result;
  }

  private replaceParams(
    text: string,
    params: Record<string, string | number>,
  ): string {
    return text.replace(/\{(\w+)\}/g, (match, key) => {
      return key in params ? String(params[key]) : match;
    });
  }

  setLanguage(lang: string): void {
    const normalizedLang = this.normalizeLanguage(lang);

    if (normalizedLang === this.currentLanguage) {
      return;
    }

    if (!this.dictionaries.has(normalizedLang)) {
      console.error(`Language '${normalizedLang}' is not loaded`);
      return;
    }

    this.currentLanguage = normalizedLang;
    console.debug(`Language changesd to '${normalizedLang}'`);

    window.dispatchEvent(
      new CustomEvent("i18n-language-changesd", {
        detail: { language: normalizedLang },
      }),
    );
  }

  getLanguage(): SupportedLanguage {
    return this.currentLanguage;
  }

  getFallbackLanguage(): SupportedLanguage {
    return this.fallbackLanguage;
  }

  hasTranslation(key: string, lang?: SupportedLanguage): boolean {
    const targetLang = lang || this.currentLanguage;
    const dict = this.dictionaries.get(targetLang);

    if (!dict) {
      return false;
    }

    return this.getNestedValue(dict, key) !== null;
  }

  getSupportedLanguages(): SupportedLanguage[] {
    return [...this.supportedLanguages];
  }

  getLoadedLanguages(): SupportedLanguage[] {
    return Array.from(this.dictionaries.keys());
  }

  getAvailableKeys(lang?: SupportedLanguage): string[] {
    const targetLang = lang || this.currentLanguage;
    const dict = this.dictionaries.get(targetLang);

    if (!dict) {
      return [];
    }

    return this.flattenKeys(dict);
  }

  private flattenKeys(obj: NestedTranslation, prefix = ""): string[] {
    const keys: string[] = [];

    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (typeof value === "string") {
        keys.push(fullKey);
      } else if (typeof value === "object" && value !== null) {
        keys.push(...this.flattenKeys(value as NestedTranslation, fullKey));
      }
    }

    return keys;
  }

  getDictionary(lang?: SupportedLanguage): LanguageDictionary | undefined {
    const targetLang = lang || this.currentLanguage;
    return this.dictionaries.get(targetLang);
  }

  addDictionary(lang: SupportedLanguage, dictionary: LanguageDictionary): void {
    this.dictionaries.set(lang, dictionary);
    if (!this.supportedLanguages.includes(lang)) {
      this.supportedLanguages.push(lang);
    }
    console.debug(`Dictionary for '${lang}' added/updated`);
  }

  mergeDictionary(
    lang: SupportedLanguage,
    partialDict: Partial<LanguageDictionary>,
  ): void {
    const existingDict = this.dictionaries.get(lang);
    if (existingDict) {
      const merged: LanguageDictionary = {
        ...existingDict,
        ...partialDict,
      } as LanguageDictionary;
      this.dictionaries.set(lang, merged);
    } else {
      this.dictionaries.set(lang, partialDict as LanguageDictionary);
    }
    console.debug(`Dictionary for '${lang}' merged`);
  }
}

const i18n = new MyI18n();
export default i18n;
export { MyI18n };
