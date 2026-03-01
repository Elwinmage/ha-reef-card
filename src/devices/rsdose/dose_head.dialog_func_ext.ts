import supplements_list from "./supplements";

import i18n from "../../translations/myi18n";
import * as com from "../../utils/common";

import { MyElement } from "../../base/element";

export function set_manual_head_volume(elt, hass, shadowRoot) {
  if (elt.device.config.shortcut) {
    for (const shortcut of elt.device.config.shortcut.split(",")) {
      const conf = {
        label: shortcut + "mL",
        type: "common-button",
        stateObj: null,
        tap_action: [
          {
            domain: "number",
            action: "set_value",
            data: { entity_id: "manual_head_volume", value: shortcut },
          },
          {
            domain: "button",
            action: "press",
            data: { entity_id: "manual_head" },
          },
          {
            domain: "redsea_ui",
            action: "message_box",
            data: "${i18n._('dosing')}+ ' " + shortcut + "mL'",
          },
        ],
        css: {
          display: "inline-block",
          border: "1px solid gray",
          "border-radius": "15px",
          "padding-left": "10px",
          "padding-right": "10px",
          "margin-bottom": "20px",
          "background-color": "rgb(" + elt.device.config.color + ")",
          color: "white",
        },
      };
      const content = MyElement.create_element(
        hass,
        conf as unknown,
        elt.device,
      );
      shadowRoot.querySelector("#dialog-content").appendChild(content);
    }
  }
}

export function add_supplement(elt, hass, shadowRoot) {
  const selected_supplement = elt.device.get_entity("supplements").state;
  const supplement =
    supplements_list.get_supplement_from_fullname(selected_supplement);

  let img =
    "/hacsfiles/ha-reef-card/img/supplements/generic_container.supplement.png";
  const cc = shadowRoot.querySelector("#add-supplement");

  // Guard: only rebuild the DOM if the selected supplement has actually changed.
  // Without this, the block is destroyed and recreated on every set hass call
  // (~1s), causing visible flicker due to layout recalculation.
  const current_uid = supplement?.uid ?? selected_supplement ?? "__none__";
  if (cc !== null && cc.dataset.supplementUid === current_uid) {
    // Same supplement - just propagate hass to any inner HA elements
    cc.querySelectorAll("*").forEach((el: object) => {
      if ("hass" in el) el.hass = hass;
    });
    return;
  }

  if (cc !== null) {
    cc.remove();
  }

  if (supplement) {
    const t_img =
      "/hacsfiles/ha-reef-card/img/supplements/" +
      supplement.uid +
      ".supplement.png";
    const http = new XMLHttpRequest();
    http.open("HEAD", t_img, false);
    http.send();
    if (http.status !== 404) {
      img = t_img;
    }
    const r_element = customElements.get("click-image");
    const content: any = new r_element();
    const conf_img = {
      name: "supplement",
      type: "click-image",
      image: img,
      css: { display: "inline-block", width: "50%" },
    };
    content.setConfig(conf_img);
    const div = document.createElement("div");
    div.style.cssText = "display: inline-block";
    div.id = "add-supplement";
    div.dataset.supplementUid = current_uid; // used by re-render guard
    shadowRoot.querySelector("#dialog-content").appendChild(div);
    div.appendChild(content);
    const infos = document.createElement("div");
    infos.innerHTML =
      "<h1 style='text-decoration:underline'>" + supplement.fullname + "</h1>";
    infos.innerHTML +=
      "<h2><span style='color:#009ac7'>" +
      i18n._("name") +
      ":</span> " +
      supplement.name +
      "</h2>";
    infos.innerHTML +=
      "<h2><span style='color:#d32625'>" +
      i18n._("brand_name") +
      ":</span> " +
      supplement.brand_name +
      "</h2>";
    infos.innerHTML +=
      "<h2><span style='color:rgb(175,50,175)'>" +
      i18n._("display_name") +
      ":</span> " +
      supplement.display_name +
      "</h2>";
    infos.innerHTML +=
      "<h2><span style='color:rgb(70,170,70)'>" +
      i18n._("short_name") +
      ":</span> " +
      supplement.short_name +
      "</h2>";
    if ("sizes" in supplement && supplement.sizes.length > 0) {
      infos.innerHTML +=
        "<h2><span style='color:#c3d737'>" +
        i18n._("sizes") +
        ":</span> " +
        supplement.sizes +
        " mL</h2>";
    }
    infos.innerHTML +=
      "<h3><span style='color:rgb(190,190,190)'>UID:</span> " +
      supplement.uid +
      "</h3>";
    infos.style.cssText = "display: inline-block;width: 70%;position:relative;";
    div.appendChild(infos);
  } else {
    const r_element = customElements.get("hui-entities-card");
    const content: any = new r_element();

    const conf = {
      type: "entities",
      entities: [
        {
          entity: elt.get_entity("new_supplement_brand_name").entity_id,
          name: { type: "entity" },
        },
        {
          entity: elt.get_entity("new_supplement_name").entity_id,
          name: { type: "entity" },
        },
        {
          entity: elt.get_entity("new_supplement_short_name").entity_id,
          name: { type: "entity" },
        },
      ],
    };
    content.setConfig(conf);
    content.hass = hass;
    content.device = elt.device;
    const div = document.createElement("div");
    div.id = "add-supplement";
    div.dataset.supplementUid = current_uid; // used by re-render guard
    div.appendChild(content);

    shadowRoot.querySelector("#dialog-content").appendChild(div);
  }
}

export function set_container_volume(elt, hass, shadowRoot) {
  let selected_supplement =
    elt.device.get_entity("supplement").attributes.supplement.uid;
  let supplement =
    supplements_list.get_supplement_from_uid(selected_supplement);
  if (!supplement) {
    selected_supplement = elt.device.get_entity("supplements").state;
    supplement =
      supplements_list.get_supplement_from_fullname(selected_supplement);
  }
  if (supplement && supplement.sizes) {
    for (const size of supplement.sizes) {
      let label = size + "mL";
      if (size >= 1000) {
        label = size / 1000 + "L";
      }
      const conf = {
        label: label,
        type: "common-button",
        stateObj: null,
        tap_action: [
          {
            domain: "switch",
            action: "turn_on",
            data: { entity_id: "slm" },
          },
          {
            domain: "number",
            action: "set_value",
            data: { entity_id: "container_volume", value: size },
          },
          {
            domain: "number",
            action: "set_value",
            data: { entity_id: "save_initial_container_volume", value: size },
          },
        ],
        css: {
          display: "inline-block",
          border: "1px solid gray",
          "border-radius": "15px",
          "padding-left": "10px",
          "padding-right": "10px",
          "margin-bottom": "20px",
          "background-color": "rgb(" + elt.device.config.color + ")",
          color: "white",
        },
        "elt.css": {
          "background-color": "rgb(" + elt.device.config.color + ")",
          color: "white",
        },
      };
      const content = MyElement.create_element(hass, conf, elt.device);
      shadowRoot.querySelector("#dialog-content").appendChild(content);
    }
  }
}

export function edit_container(elt, hass, shadowRoot) {
  set_container_volume(elt, hass, shadowRoot);
  const display_name =
    elt.device.get_entity("supplement").attributes.supplement.display_name;
  const text_box = elt.device.get_entity("new_supplement_display_name");
  const supplements_list = elt.device.get_entity("supplements");
  // Get last element: "Other" to activate display_name text box
  const stateObj = elt._hass.states[supplements_list.entity_id];
  const options = stateObj.attributes.options || [];

  if (options.length > 0) {
    const last_option = options[options.length - 1];

    elt._hass.callService("select", "select_option", {
      entity_id: supplements_list.entity_id,
      option: last_option,
    });
  }
  elt._hass.callService("text", "set_value", {
    entity_id: text_box.entity_id,
    value: display_name,
  });
}

export function head_configuration(
  elt,
  hass,
  shadowRoot,
  saved_schedule = null,
) {
  if (elt.device.bundle && elt.device.config.id > 1) {
    return;
  }
  if (
    saved_schedule === null ||
    saved_schedule.type ===
      elt.device.get_entity("schedule_head").attributes.schedule.type
  ) {
    saved_schedule = elt.device.get_entity("schedule_head").attributes.schedule;
  }

  let form = shadowRoot.querySelector("#schedule");
  if (form) {
    form.remove();
  }
  form = shadowRoot.createElement("form");
  form.className = "schedule";
  form.id = "schedule";
  const schedule_type = com.create_select(
    "schedule",
    ["single", "custom", "hourly", "timer"],
    saved_schedule.type,
  );
  schedule_type.addEventListener("change", function (_event: unknown) {
    handle_schedule_type_change(_event, elt, hass, shadowRoot);
  });
  form.appendChild(schedule_type);
  let node = null;
  node = shadowRoot.createElement("label");
  node.innerHTML = i18n._("daily_dose");
  form.appendChild(node);
  const dd = shadowRoot.createElement("input");
  dd.type = "number";
  dd.id = "dailydose";
  dd.min = 0.1;
  dd.step = 0.1;
  dd.max = 300;
  dd.value = elt.device.get_entity("daily_dose").state;
  form.appendChild(dd);

  const fname = "head_configuration_schedule_" + saved_schedule.type;
  const content = local_actions[fname]?.(
    saved_schedule,
    elt,
    hass,
    shadowRoot,
    form,
  );

  node = shadowRoot.createElement("label");
  node.innerHTML = i18n._("days");
  form.appendChild(node);
  for (let day = 1; day < 8; day++) {
    const name = "day_" + String(day);
    node = shadowRoot.createElement("input");
    node.className = "days";
    node.type = "checkbox";
    node.value = name;
    node.id = name;
    if (
      saved_schedule &&
      saved_schedule.days &&
      !saved_schedule.days.includes(day)
    ) {
      node.checked = false;
    } else {
      node.checked = true;
    }
    const label = shadowRoot.createElement("label");
    label.innerHTML = i18n._("day_" + String(day))[0];
    label.className = "days";
    label.htmlFor = name;
    form.appendChild(label);
    form.appendChild(node);
  }
  const save_button = shadowRoot.createElement("button");
  save_button.innerHTML = i18n._("save_schedule");
  save_button.style.width = "100%";
  save_button.type = "button";
  save_button.addEventListener(
    "click",
    function (e: Event) {
      e.preventDefault();
      save_schedule(e, shadowRoot, form, elt, hass);
    },
    false,
  );
  form.appendChild(save_button);
  shadowRoot.querySelector("#dialog-content").appendChild(content);
}

function head_configuration_schedule_single(
  schedule,
  elt,
  hass,
  shadowRoot,
  form,
) {
  form.appendChild(com.create_hour("hour", schedule.time));
  form.appendChild(
    com.create_select("speed", ["whisper", "regular", "quick"], schedule.mode),
  );
  return form;
}

function head_configuration_schedule_custom(
  schedule,
  elt,
  hass,
  shadowRoot,
  form,
) {
  const default_interval = {
    st: 0,
    end: 1440,
    nd: 10,
    mode: "regular",
  };
  if (!schedule.intervals) {
    schedule.intervals = [default_interval];
  }
  const intervals = shadowRoot.createElement("div");
  for (const interval of schedule.intervals) {
    head_configuration_intervals_custom(shadowRoot, interval, intervals);
  }
  form.appendChild(intervals);
  const add_button = shadowRoot.createElement("button");
  add_button.innerHTML = "+";
  add_button.style.width = "100%";
  add_button.addEventListener(
    "click",
    function (e: Event) {
      e.preventDefault();
      head_configuration_intervals_custom(
        shadowRoot,
        default_interval,
        intervals,
      );
    },
    false,
  );
  form.appendChild(add_button);
  return form;
}

function head_configuration_schedule_timer(
  schedule,
  elt,
  hass,
  shadowRoot,
  form,
) {
  const default_interval = {
    st: 0,
    volume: 1,
    mode: "regular",
  };
  if (!schedule.intervals) {
    schedule.intervals = [default_interval];
  }
  const dd = form.querySelector("#dailydose");
  dd.disabled = true;

  const intervals = shadowRoot.createElement("div");
  for (const interval of schedule.intervals) {
    head_configuration_intervals_timer(shadowRoot, interval, intervals);
  }
  form.appendChild(intervals);
  const add_button = shadowRoot.createElement("button");
  add_button.innerHTML = "+";
  add_button.style.width = "100%";
  add_button.addEventListener(
    "click",
    function (e: Event) {
      e.preventDefault();
      head_configuration_intervals_timer(
        shadowRoot,
        default_interval,
        intervals,
      );
    },
    false,
  );
  form.appendChild(add_button);
  update_dd(form);
  return form;
}

function save_schedule(event, shadowRoot, form, elt, hass) {
  console.debug("Save schedule");
  const schedule: any = {};
  schedule.type = shadowRoot.querySelector("#schedule_1").value;
  schedule.days = [];
  for (let day = 1; day < 8; day++) {
    const day_id = "#day_" + String(day);
    if (shadowRoot.querySelector(day_id).checked) {
      schedule.days.push(day);
    }
  }
  const fname = "save_schedule_" + schedule.type;
  const to_schedule = local_actions[fname]?.(shadowRoot, elt, hass, schedule);
  if (to_schedule !== null) {
    const data = {
      access_path: "/head/" + elt.device.config.id + "/settings",
      method: "put",
      data: { schedule_enabled: true, schedule: to_schedule },
      device_id: elt.device.device.device.elements[0].primary_config_entry,
    };
    console.debug("Call service", data);
    hass.callService("redsea", "request", data);
    shadowRoot.dispatchEvent(
      new CustomEvent("hass-notification", {
        bubbles: true,
        composed: true,
        detail: {
          message: i18n._("schedule_saved"),
        },
      }),
    );
  } else {
    console.error("Can not save schedule - to_schedule is null");
  }
}

function save_schedule_single(shadowRoot, elt, hass, schedule) {
  schedule.dd = parseFloat(shadowRoot.querySelector("#dailydose").value);
  schedule.time = com.stringToTime(shadowRoot.querySelector("#hour_1").value);
  schedule.mode = shadowRoot.querySelector("#speed_1").value;
  return schedule;
}

function save_schedule_hourly(shadowRoot, elt, hass, schedule) {
  schedule.dd = parseFloat(shadowRoot.querySelector("#dailydose").value);
  if (schedule.dd < 5.0) {
    shadowRoot.dispatchEvent(
      new CustomEvent("hass-notification", {
        bubbles: true,
        composed: true,
        detail: {
          message: i18n._("can_not_save") + i18n._("min_dose"),
        },
      }),
    );
    return null;
  }
  schedule.min = parseInt(shadowRoot.querySelector("#min_1").value);
  schedule.mode = shadowRoot.querySelector("#speed_1").value;
  return schedule;
}

function save_schedule_custom(shadowRoot, elt, hass, schedule) {
  schedule.dd = parseFloat(shadowRoot.querySelector("#dailydose").value);
  schedule.intervals = [];
  for (const interval of shadowRoot.querySelectorAll(".interval")) {
    const s_id = interval.id.split("_");
    const position = s_id[s_id.length - 1];
    const start = com.stringToTime(
      interval.querySelector("#st_" + position).value,
    );
    const end = com.stringToTime(
      interval.querySelector("#end_" + position).value,
    );
    if (end - start < 30) {
      let msg = i18n._("at_least_30m_between");
      if (end - start < 0) {
        msg = i18n._("end_earlier_than_start");
      }
      shadowRoot.dispatchEvent(
        new CustomEvent("hass-notification", {
          bubbles: true,
          composed: true,
          detail: {
            message: i18n._("can_not_save") + msg,
          },
        }),
      );
      return null;
    }
    const nd = parseInt(interval.querySelector("#nd_" + position).value);
    const speed = interval.querySelector("#speed_" + position).value;
    const json_interval = { st: start, end: end, nd: nd, mode: speed };
    schedule.intervals.push(json_interval);
  }
  schedule.intervals.sort(compare_interval);
  schedule.type = shadowRoot.querySelector("#schedule_1").value;
  return schedule;
}

export function compare_interval(a, b) {
  if (a.st < b.st) {
    return -1;
  }
  if (a.st > b.st) {
    return 1;
  }
  return 0;
}

function save_schedule_timer(shadowRoot, elt, hass, schedule) {
  schedule.intervals = [];
  for (const interval of shadowRoot.querySelectorAll(".interval")) {
    const s_id = interval.id.split("_");
    const position = s_id[s_id.length - 1];
    const start = com.stringToTime(
      interval.querySelector("#st_" + position).value,
    );
    const volume = parseFloat(
      interval.querySelector("#volume_" + position).value,
    );
    const speed = interval.querySelector("#speed_" + position).value;
    const json_interval = { st: start, volume: volume, mode: speed };
    schedule.intervals.push(json_interval);
  }
  schedule.intervals.sort(compare_interval);
  schedule.type = shadowRoot.querySelector("#schedule_1").value;
  return schedule;
}

function head_configuration_intervals_custom(shadowRoot, interval, form) {
  const div = shadowRoot.createElement("div");
  let position = 0;
  for (position = 0; position < 100; position++) {
    const c_elt = form.querySelector("#interval_" + position);
    if (c_elt === null) {
      break;
    }
  }
  div.className = "interval";
  div.id = "interval_" + position;
  const start = com.create_hour("st", interval.st, position);
  const end = com.create_hour("end", interval.end, position);
  console.debug("INTERVAL", interval.nd);
  const nd = com.create_select(
    "nd",
    Array.from({ length: 24 }, (x, i) => (i + 1).toString()),
    interval.nd.toString(),
    false,
    "",
    position,
  );
  div.appendChild(start);
  div.appendChild(end);
  div.appendChild(nd);
  div.appendChild(
    com.create_select(
      "speed",
      ["whisper", "regular", "quick"],
      interval.mode,
      true,
      "",
      position,
    ),
  );

  const delete_button = shadowRoot.createElement("button");
  delete_button.className = "delete_button";
  if (position === 0) {
    delete_button.style.visibility = "hidden";
  }
  delete_button.addEventListener(
    "click",
    function (e: Event) {
      e.preventDefault();
      head_configuration_delete_interval(position, form);
    },
    false,
  );
  div.appendChild(delete_button);
  form.appendChild(div);
}

function head_configuration_intervals_timer(shadowRoot, interval, form) {
  const div = shadowRoot.createElement("div");
  let position = 0;
  for (position = 0; position < 100; position++) {
    const c_elt = form.querySelector("#interval_" + position);
    if (c_elt === null) {
      break;
    }
  }
  div.className = "interval";
  div.id = "interval_" + position;
  const start = com.create_hour("st", interval.st, position);
  const vol = shadowRoot.createElement("div");
  let node = null;
  node = shadowRoot.createElement("label");
  node.innerHTML = i18n._("volume");

  const volume = shadowRoot.createElement("input");
  volume.type = "number";
  volume.min = 0.1;
  volume.set = 0.1;
  volume.max = 300;
  volume.id = "volume_" + position;
  volume.value = "1";
  volume.className = "volume";
  volume.addEventListener("change", () => {
    update_dd(shadowRoot);
  });
  vol.appendChild(node);
  vol.appendChild(volume);

  div.appendChild(start);
  div.appendChild(vol);
  div.appendChild(
    com.create_select(
      "speed",
      ["whisper", "regular", "quick"],
      interval.mode,
      true,
      "",
      position,
    ),
  );

  const delete_button = shadowRoot.createElement("button");
  delete_button.className = "delete_button";
  if (position === 0) {
    delete_button.style.visibility = "hidden";
  }
  delete_button.addEventListener(
    "click",
    function (e: Event) {
      e.preventDefault();
      head_configuration_delete_interval(position, form);
    },
    false,
  );
  div.appendChild(delete_button);
  form.appendChild(div);
}

function head_configuration_delete_interval(position, intervals) {
  const interval = intervals.querySelector("#interval_" + position);
  interval.remove();
}

function head_configuration_schedule_hourly(
  schedule,
  elt,
  hass,
  shadowRoot,
  form,
) {
  const min = com.create_select(
    "min",
    Array.from({ length: 6 }, (x, i) => (i * 10).toString()),
    schedule.min,
    false,
    "min",
  );
  form.appendChild(min);
  form.appendChild(
    com.create_select("speed", ["whisper", "regular", "quick"], schedule.mode),
  );
  return form;
}

function handle_schedule_type_change(event, elt, hass, shadowRoot) {
  console.debug("EVENT", event);
  const schedule = { type: event.target.value };
  head_configuration(elt, hass, shadowRoot, schedule);
}

function update_dd(shadowRoot) {
  const total_volume = shadowRoot.querySelector("#dailydose");
  let total = 0;
  for (const volume of shadowRoot.querySelectorAll(".volume")) {
    total += parseFloat(volume.value);
  }
  total_volume.value = total;
}

const local_actions = {
  head_configuration_schedule_single,
  head_configuration_schedule_custom,
  head_configuration_schedule_timer,
  head_configuration_schedule_hourly,
  save_schedule_single,
  save_schedule_custom,
  save_schedule_timer,
  save_schedule_hourly,
  save_schedule,
};
