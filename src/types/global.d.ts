/**
 * Global type declarations for Home Assistant custom cards
 */

declare global {
  interface Window {
    /**
     * Array of custom card definitions for Home Assistant
     */
    customCards?: Array<CustomCardDefinition>;
  }
}

/**
 * Definition of a custom card for Home Assistant
 */
interface CustomCardDefinition {
  /**
   * Unique type identifier for the card
   */
  type: string;

  /**
   * Display name of the card
   */
  name: string;

  /**
   * Optional description of the card
   */
  description?: string;

  /**
   * Whether to show a preview in the card picker
   * @default false
   */
  preview?: boolean;

  /**
   * URL to documentation for the card
   */
  documentationURL?: string;
}

export {};
