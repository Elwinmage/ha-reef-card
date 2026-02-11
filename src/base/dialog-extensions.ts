/**
 * Dialog Extension Registry
 * Safe replacement for eval()-based dynamic dialog extensions
 */

import type { DialogExtensionFunction, DialogExtension } from "../types/index";

class DialogExtensionRegistry {
  private extensions: Map<string, DialogExtension> = new Map();

  /**
   * Register a dialog extension module
   */
  register(moduleName: string, extension: DialogExtension): void {
    this.extensions.set(moduleName, extension);
  }

  /**
   * Execute a dialog extension
   */
  execute(
    moduleName: string,
    dialogName: string,
    elt: any,
    hass: any,
    shadowRoot: ShadowRoot | Document,
  ): void | HTMLElement {
    const module = this.extensions.get(moduleName);

    if (!module) {
      console.error(`Dialog extension module '${moduleName}' not found`);
      return;
    }

    const fn = module[dialogName];

    if (!fn || typeof fn !== "function") {
      console.error(
        `Dialog function '${dialogName}' not found in module '${moduleName}'`,
      );
      return;
    }

    return fn(elt, hass, shadowRoot);
  }

  /**
   * Check if an extension exists
   */
  has(moduleName: string, dialogName?: string): boolean {
    const module = this.extensions.get(moduleName);

    if (!module) {
      return false;
    }

    if (dialogName) {
      return dialogName in module && typeof module[dialogName] === "function";
    }

    return true;
  }

  /**
   * Get all registered module names
   */
  getModules(): string[] {
    return Array.from(this.extensions.keys());
  }
}

// Global singleton instance
export const dialogExtensions = new DialogExtensionRegistry();
