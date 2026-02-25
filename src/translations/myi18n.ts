/**
 * Implement a translation mecanism
 */

//----------------------------------------------------------------------------//
//   IMPORT
//----------------------------------------------------------------------------//
import type {
  LanguageDictionary,
  SupportedLanguage,
  I18nConfig,
  NestedTranslation,
} from "../types/index";

// Import synchrone of dictionarys
import de from "./locales/de.json";
import en from "./locales/en.json";
import es from "./locales/es.json";
import fr from "./locales/fr.json";
import it from "./locales/it.json";
import pl from "./locales/pl.json";
import pt from "./locales/pt.json";
//----------------------------------------------------------------------------//

class MyI18n {
  // The fallback language when we can't found the asked language
  private fallbackLanguage: SupportedLanguage;
  // The current selected language
  private currentLanguage: SupportedLanguage;
  // The lsit of suuported dictionnaries
  private dictionaries: Map<SupportedLanguage, LanguageDictionary>;
  // The list of supported languages
  private supportedLanguages: SupportedLanguage[];

  /**
   * Constructor
   * @param config: the current config with fallbackLanguage, efaultLanguage , and supportedLanguages.
   */
  constructor(config: I18nConfig = {}) {
    this.fallbackLanguage = config.fallbackLanguage || "en";
    this.supportedLanguages = config.supportedLanguages || [
      "de",
      "en",
      "es",
      "fr",
      "it",
      "pl",
      "pt",
    ];

    this.dictionaries = new Map<SupportedLanguage, LanguageDictionary>([
      ["de", de as LanguageDictionary],
      ["en", en as LanguageDictionary],
      ["es", es as LanguageDictionary],
      ["fr", fr as LanguageDictionary],
      ["it", it as LanguageDictionary],
      ["pl", pl as LanguageDictionary],
      ["pt", pt as LanguageDictionary],
    ]);

    // Get homeassistant currentlanguage and set to current language
    const homeAssistant = document.querySelector("home-assistant");
    const detectedLang =
      homeAssistant?.hass?.selectedLanguage ||
      homeAssistant?.hass?.language ||
      config.defaultLanguage ||
      this.fallbackLanguage;

    this.currentLanguage = this.normalizeLanguage(detectedLang);

    console.debug(`MyI18n initialized with language: ${this.currentLanguage}`);
  }

  /**
   * Return the id of the language o
   * @param lang: the language to normalize
   * @return : the given normalized language or fallback language
   */
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

  /**
   * Public method to get the translated string
   * @param key: the key to translage
   * @param params: thes parameters to put in string if needed
   *
   */
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

  /**
   * Replace parameters in string
   * @param text : the translated string wihout parameters
   * @param params: the list of parameters
   *  Example:
   *    - in your code:
   *         i18n._("dosing_status", {volume: 5.5, supplement: "NO3PO4-X", time: "14:30" }) → "Dosing 5.5ml of NO3PO4-X at 14:30"
   *       or with entities:
   *         const entity = hass.states["sensor.rsdose_head_1"];
   *        i18n._("stock_alert", {days: entity.state, name: entity.attributes.supplement_name }) // → "NO3PO4-X: 15 days remaining"
   *    - in translation file (ex: en.json)
   *       "dosing_status": "Dosing {volume}ml of {supplement}",
   */
  private replaceParams(
    text: string,
    params: Record<string, string | number>,
  ): string {
    return text.replace(/\{(\w+)\}/g, (match, key) => {
      return key in params ? String(params[key]) : match;
    });
  }

  /**
   * Set current language
   * @param lang: the lang to set the interface to
   */
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
    console.debug(`Language changed to '${normalizedLang}'`);

    window.dispatchEvent(
      new CustomEvent("i18n-language-changed", {
        detail: { language: normalizedLang },
      }),
    );
  }

  /**
   * @return current language
   */
  getLanguage(): SupportedLanguage {
    return this.currentLanguage;
  }

  /**
   * @return fallback language
   */
  getFallbackLanguage(): SupportedLanguage {
    return this.fallbackLanguage;
  }

  /**
   * Test if a translation exists
   * @param key : the key to test if translation exists
   * @param lang: the language you want to translate
   * @return true if key exists in lang, false else
   */
  hasTranslation(key: string, lang?: SupportedLanguage): boolean {
    const targetLang = lang || this.currentLanguage;
    const dict = this.dictionaries.get(targetLang);

    if (!dict) {
      return false;
    }

    return this.getNestedValue(dict, key) !== null;
  }

  /**
   * @return The list of supported langauges
   */
  getSupportedLanguages(): SupportedLanguage[] {
    return [...this.supportedLanguages];
  }

  /**
   * @return the list of loaded langugaes
   */
  getLoadedLanguages(): SupportedLanguage[] {
    return Array.from(this.dictionaries.keys());
  }

  /**
   * List all keys for a given language
   * @param lang: the lang to test
   * @return the list og keys present in lang dictionnary
   */
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

  /**
   * Get the dictionnary for given language
   * @param lang: the lang of the wanted dictionnary
   * @return the dictionnary
   */
  getDictionary(lang?: SupportedLanguage): LanguageDictionary | undefined {
    const targetLang = lang || this.currentLanguage;
    return this.dictionaries.get(targetLang);
  }

  /**
   * Add/update a new dictionnary for given language
   * @param lang: the language to add
   * @param dictionnary: the dictionnary to set or update
   */
  addDictionary(lang: SupportedLanguage, dictionary: LanguageDictionary): void {
    this.dictionaries.set(lang, dictionary);
    if (!this.supportedLanguages.includes(lang)) {
      this.supportedLanguages.push(lang);
    }
    console.debug(`Dictionary for '${lang}' added/updated`);
  }

  /**
   * Merge a dictionnary
   * @param lang: the lang to merge in
   * @param partialDict: the dictionnary to merge to current langauge dictionnary
   */
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
