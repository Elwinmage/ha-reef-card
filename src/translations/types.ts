export type NestedTranslation = {
  [key: string]: string | NestedTranslation;
};

export type LanguageDictionary = NestedTranslation;

export type SupportedLanguage = "en" | "fr";

export interface HomeAssistant {
  hass: {
    selectedLanguage: string;
    language?: string;
  };
}

export interface I18nConfig {
  fallbackLanguage?: SupportedLanguage;
  defaultLanguage?: SupportedLanguage;
  supportedLanguages?: SupportedLanguage[];
}

declare global {
  interface Document {
    querySelector(selector: "home-assistant"): HomeAssistant | null;
  }
}
