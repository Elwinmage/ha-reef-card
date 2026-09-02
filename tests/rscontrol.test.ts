// Tests for RSControl device family
// Covers: src/devices/redsea/rscontrol/rscontrol.ts

import { describe, expect, it } from "vitest";
import {
  RSControl,
  RSControlLite,
  RSControlPro,
} from "../src/devices/redsea/rscontrol/rscontrol";

// --- Register stub custom elements so LitElement lifecycle works in jsdom ---
class StubRSControl extends RSControl {}
if (!customElements.get("stub-rscontrol"))
  customElements.define("stub-rscontrol", StubRSControl);

class StubRSControlLite extends RSControlLite {}
if (!customElements.get("stub-rscontrollite"))
  customElements.define("stub-rscontrollite", StubRSControlLite);

class StubRSControlPro extends RSControlPro {}
if (!customElements.get("stub-rscontrolpro"))
  customElements.define("stub-rscontrolpro", StubRSControlPro);

// ─── RSControl (base) ─────────────────────────────────────────────────────────
describe("RSControl", () => {
  it("initial_config uses RSCONTROLLITE model", () => {
    const dev = new StubRSControl() as any;
    expect(dev.initial_config.model).toBe("RSCONTROLLITE");
  });

  it("renderEditor() returns a template", () => {
    expect(new StubRSControl().renderEditor()).toBeDefined();
  });
});

// ─── RSControlLite (direct alias) ─────────────────────────────────────────────
describe("RSControlLite", () => {
  it("inherits RSCONTROLLITE model from RSControl", () => {
    const dev = new StubRSControlLite() as any;
    expect(dev.initial_config.model).toBe("RSCONTROLLITE");
  });
});

// ─── RSControlPro (overrides config) ──────────────────────────────────────────
describe("RSControlPro", () => {
  it("overrides initial_config with RSCONTROLPRO model", () => {
    const dev = new StubRSControlPro() as any;
    expect(dev.initial_config.model).toBe("RSCONTROLPRO");
  });

  it("renderEditor() returns a template", () => {
    expect(new StubRSControlPro().renderEditor()).toBeDefined();
  });
});
