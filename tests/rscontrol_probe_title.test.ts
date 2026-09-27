/**
 * Probe titles in the language of the card: a name the hub got from the
 * app that installed the probe is translated, a name the user chose is kept.
 */
import { afterEach, describe, expect, it } from "vitest";

import i18n from "../src/translations/myi18n";
import { MyI18n } from "../src/translations/myi18n";
import {
  ControlProbe,
  probe_title,
} from "../src/devices/redsea/rscontrol/control_probe";
import { dialogs_rscontrol } from "../src/devices/redsea/rscontrol/rscontrol.dialogs";

afterEach(() => {
  (i18n as any).currentLanguage = "en";
});

describe("probe_title()", () => {
  it("translates the name a French app gave the probe", () => {
    (i18n as any).currentLanguage = "en";
    expect(probe_title("Salinité 7BF", "ec", "0x007BF")).toBe("Salinity 7BF");
    expect(probe_title("Fuite 32B", "leak", "0x0032B")).toBe("Leak 32B");
    expect(probe_title("Température F7", "temperature", "0x000F7")).toBe(
      "Temperature F7",
    );
  });

  it("translates the integration's own English default too", () => {
    (i18n as any).currentLanguage = "fr";
    expect(probe_title("Leak 32B", "leak", "0x0032B")).toBe("Fuite 32B");
  });

  it("translates the hub's bare type name", () => {
    (i18n as any).currentLanguage = "de";
    expect(probe_title("EC", "ec", "0x007BF")).toBe("Salinität 7BF");
    expect(probe_title("pH", "ph", "0x00B39")).toBe("pH B39");
  });

  it("keeps a name the user chose", () => {
    expect(probe_title("Sump ORP", "orp", "0x0071F")).toBe("Sump ORP");
    // Digits of another probe, or a sentence before them: not a default
    expect(probe_title("Salinité 7BE", "ec", "0x007BF")).toBe("Salinité 7BE");
    expect(probe_title("Display tank left pH B39", "ph", "0x00B39")).toBe(
      "Display tank left pH B39",
    );
  });

  it("falls back on the type and uid digits without a name", () => {
    expect(probe_title("", "orp", "0x0071F")).toBe("ORP 71F");
    expect(probe_title("", "ato", "")).toBe("ATO");
  });

  it("has a label for every probe type in every language", () => {
    const i18n_all = new MyI18n();
    for (const lang of i18n_all.getSupportedLanguages()) {
      for (const type of ["ph", "orp", "ec", "temperature", "ato", "leak"]) {
        expect(i18n_all.hasTranslation(`probe_type_${type}`, lang)).toBe(true);
      }
    }
  });
});

describe("probe dialog titles", () => {
  it("are computed by the probe, with the hub name as fallback", () => {
    const titled = [
      dialogs_rscontrol.probe_conf,
      dialogs_rscontrol.probe_calibration_ec,
      dialogs_rscontrol.probe_history,
      dialogs_rscontrol.probe_temp_history,
    ];
    for (const dialog of titled) {
      expect(dialog.title_key).toContain("device.display_name()");
      expect(dialog.title_key).toContain("entity.probe_name?.state");
    }
  });
});

describe("ControlProbe.display_name()", () => {
  class TitleProbe extends ControlProbe {}
  if (!customElements.get("title-control-probe"))
    customElements.define("title-control-probe", TitleProbe);

  function probe(name: string | undefined): any {
    const p = new TitleProbe() as any;
    p.probe_type = "ec";
    p.probe_uid = "0x007BF";
    p.get_entity = () => (name === undefined ? undefined : { state: name });
    return p;
  }

  it("titles the probe from the name the hub reports", () => {
    (i18n as any).currentLanguage = "en";
    expect(probe("Salinité 7BF").display_name()).toBe("Salinity 7BF");
    expect(probe("Reef salinity").display_name()).toBe("Reef salinity");
  });

  it("falls back on the type without a usable name", () => {
    (i18n as any).currentLanguage = "en";
    expect(probe(undefined).display_name()).toBe("Salinity 7BF");
    expect(probe("unavailable").display_name()).toBe("Salinity 7BF");
  });
});
