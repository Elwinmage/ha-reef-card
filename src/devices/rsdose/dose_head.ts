import { html } from "lit";
import { RSDevice } from "../device";

import styles from "./dose_head.styles";
import style_sensors from "../../base/sensor.styles";

import i18n from "../../translations/myi18n";
import { MyElement } from "../../base/element";
import { OFF_COLOR } from "../../utils/constants";

export class DoseHead extends RSDevice {
  static styles = [styles, style_sensors];

  static get properties() {
    return {
      state_on: {},
      device_state: {},
      head_state: {},
      supplement: {},
    };
  }

  // Déclaration des propriétés d'instance
  state_on: boolean = false;
  device_state: any = null;
  head_state: any = null;
  supplement: any = null;
  stock_alert: number | null = null;
  supplement_info: boolean = false;
  bundle: boolean = false;
  last_state_container_warning: boolean = false;

  constructor() {
    super();
    this.supplement = null;
    this.stock_alert = null;
    this.supplement_info = false;
    this.bundle = false;
  }

  _pipe_path() {
    let color = this.config.color;
    if (!this.state_on) {
      color = OFF_COLOR;
    }
    return html`
      <svg viewBox="0 0 86 56" style="fill:rgb(${color});">
        <path
          d="M 14,0 C 13,12 10,18 7,25 0,34 0,45  0,55 L 12,55 c 0,-8 -0,-16 6,-24 4,-8 8,-17 8,-35 z"
        ></path>
        <path
          d="m 62,0 1,39 c 0,2 1,3 2,5 2,2 2,1 4,2 2,0 4,0 6,-2 2,-2 1,-5 2,-7 l 6,-30 -8,0 -3,8 0,-28 z"
        ></path>
      </svg>
    `;
  }

  _render_container() {
    if (!this.supplement) {
      return html``;
    }
    const supplement_uid = this.supplement.attributes.supplement.uid;
    let img = null;
    let warning: any = html``;
    this.supplement_info = false;
    img =
      "/hacsfiles/ha-reef-card/img/supplements/" +
      supplement_uid +
      ".supplement.png";
    const http = new XMLHttpRequest();
    http.open("HEAD", img, false);
    http.send();
    if (http.status === 404) {
      img =
        "/hacsfiles/ha-reef-card/img/supplements/generic_container.supplement.png";
      this.supplement_info = true;
    }
    let style = html``;
    if (!this.state_on) {
      style = html`<style>
        img#id_${supplement_uid} {
          filter: grayscale(90%);
        }
      </style>`;
    }

    // Vérifier que les entités existent avant d'accéder à leurs propriétés
    try {
      if (this.container_warning()) {
        warning = html`<img class='warning' src='${new URL(
          "../../img/warning.svg",
          import.meta.url,
        )}'/ style="${this.get_style(
          this.config.warning,
        )}" /><div class="warning" style="${this.get_style(
          this.config.warning_label,
        )}">${i18n._("empty")}</div>`;
      }
    } catch (error) {
      console.warn("Could not check stock alert:", error);
    }

    return html`
      <div class="container" style="${this.get_style(this.config.container)}">
        ${style}
        <img id="id_${supplement_uid}" src="${img}" width="100%" />
        ${warning} ${this._render_supplement_info()}
        ${this._render_elements(true, "supplement")} ${this._render_ask()}
      </div>
    `;
  }

  _render_supplement_info() {
    if (this.supplement_info) {
      return html`${this._render_elements(true, "supplement_info")}`;
    } // if
  }

  _render_ask() {
    if (
      this.supplement_info &&
      !this.supplement.attributes.supplement.is_name_editable
    ) {
      return html`<a
        class="addSupplement"
        target="_blank"
        href="https://github.com/Elwinmage/ha-reef-card/issues/new?labels=supplement&title=Add+supplement+picture+for+${this.supplement.attributes.supplement.brand_name.replace(
          " ",
          "+",
        )}+${this.supplement.attributes.supplement.name.replace(
          " ",
          "+",
        )}&body=${JSON.stringify(
          this.supplement.attributes.supplement,
          null,
          "%0D%0A",
        )}"
        >+${i18n._("ask_add_supplement")}+</a
      >`;
    } // if
    return html``;
  }

  is_on() {
    let res = true;

    if (
      "head_state" in this.entities &&
      this._hass &&
      this._hass.states[this.entities["head_state"].entity_id] &&
      (this._hass.states[this.entities["head_state"].entity_id].state ===
        "not-setup" ||
        !this.device_state ||
        (this.entities["schedule_enabled"] &&
          this._hass.states[this.entities["schedule_enabled"].entity_id] &&
          this._hass.states[this.entities["schedule_enabled"].entity_id]
            .state === "off"))
    ) {
      res = false;
    }
    return res;
  }

  update_state(value) {
    if (this.device_state !== value) {
      this.device_state = value;
    }
    this.requestUpdate();
  }

  set hass(obj) {
    let to_update: boolean = false;
    this._setting_hass(obj);
    if (this.is_on() !== this.state_on) {
      this.state_on = this.is_on();
      to_update = true;
    }
    if (
      this.entities &&
      this.entities["head_state"] &&
      this.head_state !== this.entities["head_state"].state
    ) {
      this.head_state = this.entities["head_state"].state;
      to_update = true;
    }
    if (
      this.entities &&
      this.entities["supplement"] &&
      this._hass &&
      this._hass.states[this.entities["supplement"].entity_id] &&
      this.supplement &&
      this._hass.states[this.entities["supplement"].entity_id].attributes
        ?.supplement?.uid !== this.supplement.attributes?.supplement?.uid
    ) {
      this.supplement =
        this._hass.states[this.entities["supplement"].entity_id];
      to_update = true;
    }
    if (this.container_warning() !== this.last_state_container_warning) {
      to_update = true;
      this.last_state_container_warning = this.container_warning();
    }
    if (to_update) {
      this.requestUpdate();
    }
  }

  container_warning() {
    const remainingDaysEntity = this.get_entity("remaining_days");
    const slmEntity = this.get_entity("slm");
    const dailyDoseEntity = this.get_entity("daily_dose");
    return (
      remainingDaysEntity &&
      slmEntity &&
      dailyDoseEntity &&
      this.stock_alert &&
      parseInt(remainingDaysEntity.state) <
        parseInt(this.stock_alert.toString()) &&
      slmEntity.state === "on" &&
      parseFloat(dailyDoseEntity.state) > 0
    );
  }

  override render() {
    return this._render();
  }

  _render(_style = null, _substyle = null) {
    this.to_render = false;
    this.state_on = this.is_on();
    console.debug("Render dose_head n°", this.config.id);

    // Vérifier que l'entité supplement existe
    if (
      !this.entities ||
      !this.entities["supplement"] ||
      !this._hass ||
      !this._hass.states[this.entities["supplement"].entity_id] ||
      !this._hass.states[this.entities["supplement"].entity_id].attributes
        ?.supplement
    ) {
      return html`<p>Waiting for supplement data...</p>`;
    }

    this.supplement = this._hass.states[this.entities["supplement"].entity_id];
    if (this.supplement.attributes.supplement.uid !== "null") {
      let calibration: any = "";
      let color = this.config.color + "," + this.config.alpha;

      if (
        this.entities["head_state"] &&
        this._hass.states[this.entities["head_state"].entity_id] &&
        this._hass.states[this.entities["head_state"].entity_id].state ===
          "not-setup"
      ) {
        this.state_on = false;
        const conf = {
          image: new URL("../../img/configuration.png", import.meta.url),
          type: "click-image",
          class: "calibration",
          stateObj: null,
          tap_action: [
            {
              domain: "redsea_ui",
              action: "dialog",
              data: { type: "head_configuration" },
            },
          ],
          css: this.config.calibration.css,
        };
        calibration = MyElement.create_element(this._hass, conf, this);
      }

      if (!this.state_on) {
        color = OFF_COLOR + "," + this.config.alpha;
      }
      return html`
        ${this._render_container()}
        <div class="pipe" style="${this.get_style(this.config.pipe)}">
          ${this._pipe_path()}
        </div>
        <div
          class="pump_state_head"
          style="${this.get_style(
            this.config.pump_state_head,
          )};background-color:rgba(${color});"
        >
          ${this._render_elements(this.state_on, "pump_state_head")}
          <div
            class="pump_state_labels"
            style="${this.get_style(this.config.pump_state_labels)}"
          >
            ${this._render_elements(this.state_on, "pump_state_labels")}
          </div>
        </div>
        ${this._render_elements(this.state_on)} ${calibration}
      `;
    } // if
    else {
      const conf = {
        type: "click-image",
        stateObj: false,
        image: new URL("../../img/container_add.png", import.meta.url),
        class: "container",
        tap_action: {
          domain: "redsea_ui",
          action: "dialog",
          data: { type: "add_supplement" },
        },
        css: {
          width: "100%",
        },
      };
      const add_img = MyElement.create_element(this._hass, conf, this);
      return html` <div
        class="container"
        style="${this.get_style(this.config.container)}"
      >
        ${add_img}
      </div>`;
    } // else
  }
}
