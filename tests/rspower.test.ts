// Tests for RSPower device family
// Covers: src/devices/redsea/rspower/rspower.ts

import { describe, expect, it } from "vitest";
import {
  RSPower,
  RSPower6,
  RSPower8,
} from "../src/devices/redsea/rspower/rspower";

// --- Register stub custom elements so LitElement lifecycle works in jsdom ---
class StubRSPower extends RSPower {}
if (!customElements.get("stub-rspower"))
  customElements.define("stub-rspower", StubRSPower);

class StubRSPower6 extends RSPower6 {}
if (!customElements.get("stub-rspower6"))
  customElements.define("stub-rspower6", StubRSPower6);

class StubRSPower8 extends RSPower8 {}
if (!customElements.get("stub-rspower8"))
  customElements.define("stub-rspower8", StubRSPower8);

// ─── RSPower (base) ───────────────────────────────────────────────────────────
describe("RSPower", () => {
  it("initial_config uses RSPOWER6 model", () => {
    const dev = new StubRSPower() as any;
    expect(dev.initial_config.model).toBe("RSPOWER6");
  });

  it("renderEditor() returns a template", () => {
    expect(new StubRSPower().renderEditor()).toBeDefined();
  });
});

// ─── RSPower6 (direct alias) ─────────────────────────────────────────────────
describe("RSPower6", () => {
  it("inherits RSPOWER6 model from RSPower", () => {
    const dev = new StubRSPower6() as any;
    expect(dev.initial_config.model).toBe("RSPOWER6");
  });
});

// ─── RSPower8 (overrides config) ──────────────────────────────────────────────
describe("RSPower8", () => {
  it("overrides initial_config with RSPOWER8 model", () => {
    const dev = new StubRSPower8() as any;
    expect(dev.initial_config.model).toBe("RSPOWER8");
  });

  it("renderEditor() returns a template", () => {
    expect(new StubRSPower8().renderEditor()).toBeDefined();
  });
});
