/**
 * Internationalization types
 */

export type NestedTranslation = {
  [key: string]: string | NestedTranslation;
};

export type LanguageDictionary = NestedTranslation;

export type SupportedLanguage =
  | "en"
  | "fr"
  | "de"
  | "es"
  | "it"
  | "nl"
  | "pt"
  | "pl";

export interface I18nConfig {
  fallbackLanguage?: SupportedLanguage;
  defaultLanguage?: SupportedLanguage;
  supportedLanguages?: SupportedLanguage[];
}

export interface HomeAssistant {
  hass: {
    selectedLanguage: string;
    language?: string;
  };
}

declare global {
  interface Document {
    querySelector(selector: "home-assistant"): HomeAssistant | null;
  }
}

export {};
