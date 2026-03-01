import { describe, it, expect } from "vitest";

describe("container_warning", () => {
  it("devrait retourner true si la dose quotidienne est supérieure à 0", () => {
    // Mock des objets nécessaires
    const mockHass = {
      states: {
        "sensor.remaining_days": { state: "2" }, // Moins que stock_alert
        "switch.slm": { state: "on" }, // SLM activé
        "sensor.daily_dose": { state: "1.5" }, // Dose > 0
      },
    };

    const mockEntities = {
      remaining_days: { entity_id: "sensor.remaining_days" },
      slm: { entity_id: "switch.slm" },
      daily_dose: { entity_id: "sensor.daily_dose" },
    };

    // Création de l'objet contenant la fonction
    const component = {
      _hass: mockHass,
      entities: mockEntities,
      stock_alert: 5, // Seuil d'alerte
    };

    // Appel de la fonction
    const result = container_warning.call(component);

    // Vérification
    expect(result).toBe(true);
  });

  it("devrait retourner false si la dose quotidienne est égale à 0", () => {
    const mockHass = {
      states: {
        "sensor.remaining_days": { state: "2" },
        "switch.slm": { state: "on" },
        "sensor.daily_dose": { state: "0" }, // Dose = 0
      },
    };
    const component = {
      _hass: mockHass,
      entities: mockEntities,
      stock_alert: 5,
    };
    expect(container_warning.call(component)).toBe(false);
  });

  it("devrait retourner false si la dose quotidienne est négative", () => {
    const mockHass = {
      states: {
        "sensor.remaining_days": { state: "2" },
        "switch.slm": { state: "on" },
        "sensor.daily_dose": { state: "-1" }, // Dose négative
      },
    };
    const component = {
      _hass: mockHass,
      entities: mockEntities,
      stock_alert: 5,
    };
    expect(container_warning.call(component)).toBe(false);
  });
});
