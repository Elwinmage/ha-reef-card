/**
 * Banner of the card in the browser console: name and version.
 */
import { version } from "../package.json";

/** Print the banner once, when the card is loaded. */
export function log_banner(): void {
  console.info(
    `%c 🪸 REEF CARD %c ${version} `,
    "color:#fff;background:#0097a7;font-weight:700;padding:2px 4px;border-radius:3px 0 0 3px",
    "color:#0097a7;background:#e0f7fa;font-weight:700;padding:2px 4px;border-radius:0 3px 3px 0",
  );
}
