/**
 * Module declarations for ambient imports
 */

declare module "./translations/myi18n" {
  import type { SupportedLanguage, I18nConfig } from "./i18n";

  class MyI18n {
    constructor(config?: I18nConfig);
    _(key: string, params?: Record<string, string | number>): string;
    translate(
      key: string,
      params?: Record<string, string | number>,
    ): Promise<string>;
    setLanguage(lang: string): Promise<void>;
    getLanguage(): SupportedLanguage;
    getFallbackLanguage(): SupportedLanguage;
    hasTranslation(key: string, lang?: SupportedLanguage): boolean;
    getSupportedLanguages(): SupportedLanguage[];
    getLoadedLanguages(): SupportedLanguage[];
    reloadLanguage(lang: SupportedLanguage): Promise<void>;
    clearCache(): void;
    getAvailableKeys(lang?: SupportedLanguage): string[];
  }

  const i18n: MyI18n;
  export default i18n;
  export { MyI18n };
}
