// Tests for the name of the ReefLED written along its edge
// Covers: src/devices/redsea/rsled/rsled_name.ts
//         RSLed.display_name() and the lamp_name mapping entries

import { afterEach, describe, expect, it, vi } from "vitest";

import "../src/devices/index";
import { RSLed160 } from "../src/devices/redsea/rsled/rsled";
import {
  RSLedName,
  NAME_DEFAULTS,
  fit_name,
} from "../src/devices/redsea/rsled/rsled_name";
import { config } from "../src/devices/redsea/rsled/rsled_g1.mapping";
import { config2, G2_NAME } from "../src/devices/redsea/rsled/rsled_g2.mapping";
import { config_virtual_g2 } from "../src/devices/redsea/rsled/rsled_virtual.mapping";

class StubName extends RSLedName {}
if (!customElements.get("stub-rsled-name"))
  customElements.define("stub-rsled-name", StubName);

async function mountName(led: any, geometry?: any) {
  const el = new StubName() as any;
  el.device = led;
  el.conf = { type: "rsled-name", stateObj: null, geometry };
  el.stateOn = true;
  el.stateObj = null;
  el.hass = {};
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

afterEach(() => {
  document.body.innerHTML = "";
});

describe("fit_name()", () => {
  const g = { max_width: 118, font_size: 20, min_font_size: 10 };

  it("keeps a short name at full size", () => {
    expect(fit_name("Bac", g)).toEqual({ size: 20, text: "Bac" });
  });

  it("sets a longer name smaller", () => {
    // 118 / (20 × 0.58) = 10 characters at full size
    const fit = fit_name("Bac du salon", g);
    expect(fit.size).toBeLessThan(20);
    expect(fit.size).toBeGreaterThanOrEqual(10);
    expect(fit.text).toBe("Bac du salon");
  });

  it("cuts a very long name with an ellipsis", () => {
    const fit = fit_name("Rampes du bac principal du salon", g);
    expect(fit.size).toBe(10);
    // 118 / (10 × 0.58) = 20 characters, the ellipsis included
    expect(fit.text).toBe("Rampes du bac princ…");
    expect(fit.text.length).toBe(20);
  });
});

describe("RSLedName", () => {
  it("writes the name along the edge, slanted", async () => {
    const el = await mountName({
      display_name: () => "Bac",
      is_on: () => true,
    });
    const text = el.shadowRoot.querySelector("text.lamp_name");
    expect(text.textContent.replace(/\s+/g, "")).toBe("BacBac");
    expect(text.querySelector("title").textContent).toBe("Bac");
    expect(text.getAttribute("x")).toBe(String(NAME_DEFAULTS.x));
    expect(text.getAttribute("font-size")).toBe(
      String(NAME_DEFAULTS.font_size),
    );
    expect(text.getAttribute("transform")).toBe(
      `rotate(${NAME_DEFAULTS.angle} ${NAME_DEFAULTS.x} ${NAME_DEFAULTS.y})`,
    );
    expect(text.classList.contains("sky_mode_off")).toBe(false);
  });

  it("follows the model's geometry, greys out when off", async () => {
    const el = await mountName(
      { display_name: () => "X", is_on: () => false },
      G2_NAME,
    );
    const text = el.shadowRoot.querySelector("text");
    expect(text.getAttribute("y")).toBe(String(G2_NAME.y));
    expect(text.getAttribute("transform")).toContain(`rotate(${G2_NAME.angle}`);
    expect(text.classList.contains("sky_mode_off")).toBe(true);
  });

  it("a lamp without an on/off state is drawn on", async () => {
    const el = await mountName({ display_name: () => "Bac" });
    const text = el.shadowRoot.querySelector("text");
    expect(text.classList.contains("sky_mode_off")).toBe(false);
  });

  it("draws nothing without a name, re-renders when it changes", async () => {
    let name = "  ";
    const led = { display_name: () => name };
    const el = await mountName(led);
    expect(el.shadowRoot.querySelector("text")).toBeNull();
    const spy = vi.spyOn(el, "requestUpdate");
    el.hass = {};
    expect(spy).not.toHaveBeenCalled();
    name = "Bac";
    el.hass = {};
    expect(spy).toHaveBeenCalled();
    el.device = null;
    expect(el.signature()).toBe("|true");
  });
});

describe("lamp name in the mappings", () => {
  it("every view has it, kept when the lamp is off", () => {
    expect(config.elements.lamp_name.type).toBe("rsled-name");
    expect(config.elements.lamp_name).not.toHaveProperty("geometry");
    expect(config2.elements.lamp_name.geometry).toBe(G2_NAME);
    expect(config_virtual_g2.elements.lamp_name.geometry).toBe(G2_NAME);
    expect(config.off_keep).toContain("lamp_name");
    expect(config_virtual_g2.off_keep).toContain("lamp_name");
  });
});

describe("RSLed.display_name()", () => {
  it("prefers the name given by the user, then the device's", () => {
    const led = new RSLed160() as any;
    led.device = {
      name: "dev",
      elements: [{ name: "RSLED160", name_by_user: "Bac" }],
    };
    expect(led.display_name()).toBe("Bac");
    led.device.elements[0].name_by_user = null;
    expect(led.display_name()).toBe("RSLED160");
    led.device.elements = [{}];
    expect(led.display_name()).toBe("dev");
    led.device = null;
    expect(led.display_name()).toBe("");
  });
});
