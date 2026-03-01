// On importe la classe juste pour récupérer la méthode
import { DoseCard } from "../src/devies/rsdose/dose_head";

const container_warning = DoseCard.prototype.container_warning;

it("force coverage of line 227", () => {
  const fakeContext = {
    _hass: {
      states: {
        "s.rem": { state: "5" },
        "s.slm": { state: "on" },
        "s.dose": { state: "1.5" },
      },
    },
    entities: {
      remaining_days: { entity_id: "s.rem" },
      slm: { entity_id: "s.slm" },
      daily_dose: { entity_id: "s.dose" },
    },
    stock_alert: 10,
  };

  // Test du cas TRUE
  expect(container_warning.call(fakeContext)).toBe(true);

  // Test du cas FALSE (La branche manquante !)
  fakeContext._hass.states["s.dose"].state = "0";
  expect(container_warning.call(fakeContext)).toBe(false);
});
