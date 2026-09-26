/**
 * Dialog definitions for the ReefControl hubs.
 *
 * probe_conf is opened from the cog of a probe: the dialog resolves its
 * entities through the clicked element, whose device is that probe's
 * ControlProbe, so every key below reads the probe's own entity (all probes
 * of a type share the same translation keys).
 *
 * One list serves every probe type: entities a type does not have are
 * skipped by the dialog (a leak probe has no range, a temperature probe no
 * EC unit…).
 */
import { history_dialog } from "../../../utils/history_dialog";

export const dialogs_rscontrol = {
  /**
   * Hub-wide buzzer, opened from the bell on the hub's status LED: what it
   * is doing now, then its two alarm sounds (danger level and leak).
   */
  buzzer_conf: {
    name: "buzzer_conf",
    title_key: "${i18n._('dialog_buzzer_conf')}",
    close_cross: false,
    content: [
      {
        view: "hui-entities-card",
        conf: {
          type: "entities",
          entities: [
            { entity: "buzzer_active", name: { type: "entity" } },
            { entity: "buzzer_cause", name: { type: "entity" } },
            { entity: "buzzer_dismissed", name: { type: "entity" } },
            { type: "divider" },
            { entity: "danger_buzzer_enabled", name: { type: "entity" } },
            { entity: "danger_buzzer_frequency", name: { type: "entity" } },
            { entity: "danger_buzzer_duty_cycle", name: { type: "entity" } },
            { entity: "danger_debounce_seconds", name: { type: "entity" } },
            { type: "divider" },
            // Leak detection itself, then its alarm sound
            { entity: "leak_detector_enabled", name: { type: "entity" } },
            { entity: "leak_detector", name: { type: "entity" } },
            { entity: "leak_buzzer_enabled", name: { type: "entity" } },
            { entity: "leak_buzzer_frequency", name: { type: "entity" } },
            { entity: "leak_buzzer_duty_cycle", name: { type: "entity" } },
          ],
        },
      },
    ],
  },

  /**
   * Last 24 hours of a probe reading over its level bands, opened from its
   * situation bar or its dot. The dialog reads the probe's own entities
   * (see ControlProbe.open_history): the main reading, or the embedded
   * temperature.
   */
  probe_history: history_dialog(
    "probe_history",
    "probe_primary",
    "${i18n._('history_24h')} ${entity.probe_name?.state || ''}",
  ),
  probe_temp_history: history_dialog(
    "probe_temp_history",
    "probe_secondary",
    "${i18n._('history_24h')} ${entity.probe_name?.state || ''} · ${i18n._('temperature')}",
  ),

  /**
   * port_conf is opened from the cog of a 12V port, whose element hands the
   * dialog that port's entities (both ports share the same keys). The mode
   * editor is the power-center socket editor with the hub's endpoints.
   */
  port_conf: {
    name: "port_conf",
    title_key: "${i18n._('port_config')} n°${config.id}",
    close_cross: false,
    content: [
      {
        view: "hui-entities-card",
        conf: {
          type: "entities",
          entities: [
            { entity: "text.port_name", name: { type: "entity" } },
            { type: "divider" },
            { entity: "port_on_off", name: { type: "entity" } },
            { entity: "port_state", name: { type: "entity" } },
            // other, ato, or unknown for a port not installed yet
            { entity: "port_type", name: { type: "entity" } },
            { entity: "port_consumption", name: { type: "entity" } },
          ],
        },
      },
      // On / Off / Schedule / Probe, power, Save. A port not installed
      // yet is installed on save, as the app does.
      {
        view: "port-sensor",
        conf: {
          type: "port-sensor",
          name: "port_mode_editor",
        },
      },
      // Uninstall the port (top-right of the dialog). Only an installed
      // port can be: the integration's button is unavailable otherwise.
      {
        view: "click-image",
        conf: {
          icon: "mdi:delete",
          icon_color: "rgb(51,151,232)",
          type: "click-image",
          stateObj: null,
          disabled_if:
            "!entity.port_delete || entity.port_delete.state === 'unavailable'",
          no_br_if_disabled: true,
          tap_action: [
            {
              domain: "redsea_ui",
              action: "dialog",
              data: { type: "port_delete" },
            },
          ],
          css: {
            position: "absolute",
            top: "7%",
            right: "5%",
          },
        },
      },
    ],
  },

  /**
   * Confirmation before uninstalling a port. The integration's `port_delete`
   * button sends `DELETE /port/<n>` (captured from the app: the port goes
   * back to type "unknown", mode "setup", its factory name and full power,
   * and loses its schedule and probe rule), then hands the hub's physical
   * button over to the port that is left, as the app does.
   */
  port_delete: {
    name: "port_delete",
    title_key: "${i18n._('dialog_port_delete_title')} n°${config.id}",
    close_cross: false,
    content: [
      {
        view: "text",
        value: "${entity.port_name?.state || ''}",
      },
    ],
    validate: {
      label: "${i18n._('delete')}",
      class: "dialog_button",
      type: "common-button",
      stateObj: null,
      tap_action: [
        {
          domain: "button",
          action: "press",
          data: { entity_id: "port_delete" },
        },
        {
          domain: "redsea_ui",
          action: "message_box",
          data: "${i18n._('delete_wait')}",
        },
        {
          domain: "redsea_ui",
          action: "exit-dialog",
        },
      ],
    },
    cancel: true,
  },

  config: {
    name: "config",
    title_key: "${i18n._('config')}",
    close_cross: false,
    content: [
      {
        view: "hui-entities-card",
        conf: {
          type: "entities",
          entities: [
            { entity: "fetch_config", name: { type: "entity" } },
            // Companion to the above: fetch_config only refreshes the sources
            // typed "config", fetch_data forces an early read of the polled
            // ones instead of waiting for the scan interval.
            { entity: "fetch_data", name: { type: "entity" } },
            { entity: "reset", name: { type: "entity" } },
            { entity: "model", name: { type: "entity" } },
            { entity: "position", name: { type: "entity" } },
            { entity: "firmware_update", name: { type: "entity" } },
            { type: "divider" },
            { entity: "temperature_fusion", name: { type: "entity" } },
            { entity: "temperature_spread", name: { type: "entity" } },
            { entity: "temperature_coherent", name: { type: "entity" } },
            {
              entity: "temperature_coherence_threshold",
              name: { type: "entity" },
            },
            { entity: "temperature_fusion_method", name: { type: "entity" } },
            { entity: "temperature_anomaly_source", name: { type: "entity" } },

            { type: "divider" },
            // How the hub reaches the outside (its wifi is in the wifi
            // dialog), then the power center it drives
            { entity: "is_internet_connected", name: { type: "entity" } },
            { entity: "cable_connected", name: { type: "entity" } },
            { type: "divider" },
            { entity: "connected_power", name: { type: "entity" } },
            { entity: "connected_power_state", name: { type: "entity" } },
            { entity: "power_link_up", name: { type: "entity" } },
            { entity: "unpair_power", name: { type: "entity" } },
            { entity: "pair_power", name: { type: "entity" } },
          ],
        },
      },
    ],
  },
  probe_conf: {
    name: "probe_conf",
    title_key:
      "${i18n._('dialog_probe_conf')} ${entity.probe_name?.state || ''}",
    close_cross: false,
    content: [
      {
        view: "hui-entities-card",
        conf: {
          type: "entities",
          entities: [
            { entity: "probe_primary", name: { type: "entity" } },
            { entity: "probe_secondary", name: { type: "entity" } },
            // Leak probes: wet or dry, where the water comes from, and the
            // conductivity the probe measured to tell it
            { entity: "probe_leak_detected", name: { type: "entity" } },
            { entity: "probe_leak_status", name: { type: "entity" } },
            { entity: "probe_leak_conductivity", name: { type: "entity" } },
            { entity: "probe_status", name: { type: "entity" } },
            // The hub's mode: a probe reads nothing while the hub is off,
            // in setup, feeding or maintenance
            { entity: "control_mode", name: { type: "entity" } },
            { type: "divider" },
            { entity: "probe_ec_unit", name: { type: "entity" } },
            { entity: "probe_desired_range_low", name: { type: "entity" } },
            { entity: "probe_desired_range_high", name: { type: "entity" } },
            {
              entity: "probe_acceptable_range_low",
              name: { type: "entity" },
            },
            {
              entity: "probe_acceptable_range_high",
              name: { type: "entity" },
            },
            {
              entity: "probe_temp_desired_range_low",
              name: { type: "entity" },
            },
            {
              entity: "probe_temp_desired_range_high",
              name: { type: "entity" },
            },
            {
              entity: "probe_temp_acceptable_range_low",
              name: { type: "entity" },
            },
            {
              entity: "probe_temp_acceptable_range_high",
              name: { type: "entity" },
            },
            { entity: "probe_offset", name: { type: "entity" } },
            { type: "divider" },
            { entity: "probe_enabled", name: { type: "entity" } },
            { entity: "probe_buzzer", name: { type: "entity" } },
            { entity: "probe_notify", name: { type: "entity" } },
            { entity: "probe_maintenance", name: { type: "entity" } },
          ],
        },
      },
    ],
    // Center button: read the probe now rather than waiting for the next
    // poll. The dialog stays open, so the readings above refresh in place.
    // Hidden while the probe is unplugged: the hub has nothing to read.
    other: {
      conf: {
        type: "common-button",
        stateObj: null,
        icon: "mdi:refresh",
        label: "${i18n._('probe_read_value')}",
        class: "dialog_button",
        disabled_if:
          "!entity.probe_get_value || entity.probe_get_value.state === 'unavailable'",
        no_br_if_disabled: true,
        css: {},
        "elt.css": {
          "background-color": "rgba(0,0,0,0)",
        },
        tap_action: [
          {
            domain: "button",
            action: "press",
            data: { entity_id: "probe_get_value" },
          },
        ],
      },
    },
  },
};
