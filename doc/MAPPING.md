# Mapping Files — Technical Documentation

`*.mapping.ts` files define the visual structure and interactive behaviour of a device inside the card. They are loaded statically and interpreted by the rendering engine (`device.ts` + `element.ts`).

---

## General structure

```ts
export const config = {
  name: null,                    // Always null (filled dynamically)
  model: "RSMAT",                // Model identifier (informational)
  color: "197,91,90",            // Device RGB color (optional)
  background_img: new URL("../../img/RSMAT/RSMAT.png", import.meta.url),
  state_background_imgs: { ... },// Background images per state (optional)
  css: {                         // CSS applied to the root container
    width: "100%",
  },
  elements: {                    // Dictionary of UI elements
    my_element: { ... },
  },
};
```

### Root properties

| Property                | Type                            | Description                                         |
| ----------------------- | ------------------------------- | --------------------------------------------------- |
| `name`                  | `null`                          | Always `null`, filled at instantiation              |
| `model`                 | `string`                        | Model name displayed (e.g. `"RSMAT"`)               |
| `color`                 | `string`                        | Device RGB color as `"r,g,b"`                       |
| `alpha`                 | `number`                        | Opacity used for `$DEVICE-COLOR-ALPHA$`             |
| `background_img`        | `URL`                           | Main background image of the device                 |
| `state_background_imgs` | `Record<string, URL>`           | Conditional background images per state (see below) |
| `css`                   | `Record<string, string>`        | CSS of the root container                           |
| `elements`              | `Record<string, ElementConfig>` | UI elements of the device                           |

### `state_background_imgs`

Allows switching the background image based on a state key. RSMAT example:

```ts
state_background_imgs: {
  percent_100: new URL("../../img/RSMAT/RSMAT_100_BASE.png", import.meta.url),
  percent_75:  new URL("../../img/RSMAT/RSMAT_75_BASE.png",  import.meta.url),
  percent_50:  new URL("../../img/RSMAT/RSMAT_50_BASE.png",  import.meta.url),
  percent_25:  new URL("../../img/RSMAT/RSMAT_25_BASE.png",  import.meta.url),
  percent_0:   new URL("../../img/RSMAT/RSMAT_0_BASE.png",   import.meta.url),
},
```

---

## Element structure

Each key in `elements` is a **declaration identifier** (the dictionary key). The `name` field refers to the associated HA entity (via `device.entities[name]`).

```ts
elements: {
  my_element: {           // ← declaration identifier (cache key)
    name: "entity_key",  // ← key in device.entities (HA translation_key)
    type: "click-image", // ← element type (required)
    // ... other options
  },
}
```

When two entities share the same `translation_key` but belong to different HA domains (e.g. `sensor` vs `select`), prefix `name` with the domain to disambiguate:

```ts
elements: {
  battery_sensor: {
    name: "sensor.battery_level",   // ← "domain.translation_key"
    type: "common-sensor",
  },
  battery_select: {
    name: "select.battery_level",   // ← different domain, same translation_key
    type: "common-switch",
  },
}
```

> **Note**: multiple elements can point to the same entity (identical `name`) but have different declaration identifiers. This is the case for the `ec_sensor` / `ec_sensor_disconnected` pair in RSMAT, which alternately display two images depending on the state of the same entity.

---

## Options common to all types

These options are available on every element regardless of its `type`.

### `name`

**Type**: `string`  
HA entity translation key (`device.entities[name].entity_id`). Determines which `stateObj` is injected into the element and into the evaluation context.

#### Domain-qualified names

When two HA entities share the same `translation_key` but belong to different domains (e.g. `sensor.xxx_battery_level` and `select.xxx_battery_level`), the entity dictionary stores only one of them under that key (last-write wins). To resolve the ambiguity, prefix `name` with the HA domain followed by a dot:

```
name: "domain.translation_key"
```

The engine checks whether `name` contains a dot. If it does, it looks up `device.entities["domain.translation_key"]` (populated by `_populate_entities`). If it doesn't, it falls back to `device.entities["translation_key"]` as before.

```ts
// Ambiguous: if both sensor.battery_level and select.battery_level exist,
// one will shadow the other.
name: "battery_level";

// Explicit: always resolves to the sensor entity
name: "sensor.battery_level";

// Explicit: always resolves to the select entity
name: "select.battery_level";
```

> **Backward compatibility**: plain `translation_key` names (without a dot prefix) continue to work exactly as before. Only add the domain prefix when disambiguation is needed.

### `type`

**Type**: `string` — **Required**  
Determines the rendering class. Possible values:

| Value               | Component        |
| ------------------- | ---------------- |
| `"click-image"`     | `ClickImage`     |
| `"common-sensor"`   | `Sensor`         |
| `"common-button"`   | `Button`         |
| `"common-switch"`   | `Switch`         |
| `"progress-bar"`    | `ProgressBar`    |
| `"progress-circle"` | `ProgressCircle` |
| `"common-schedule"` | `Schedule`       |
| `"redsea-messages"` | `Messages`       |
| `"hui-*"`           | Native HA card   |

### `css`

**Type**: `Record<string, string>`  
CSS applied to the element's **wrapper container** (`<div>`). Supports two special tokens:

| Token                    | Replaced by                                            |
| ------------------------ | ------------------------------------------------------ |
| `"$DEVICE-COLOR$"`       | `rgb(r,g,b)` using the device color                    |
| `"$DEVICE-COLOR-ALPHA$"` | `rgba(r,g,b,alpha)` using the device color and opacity |

```ts
css: {
  position: "absolute",
  top: "10%",
  left: "5%",
  "background-color": "$DEVICE-COLOR-ALPHA$",
}
```

### `elt_css` / `"elt.css"`

**Type**: `Record<string, string>`  
CSS applied to the **inner element** (the image, icon, text…) inside the shadow DOM. Both notations are equivalent; `elt_css` (without dot) is preferred in TypeScript to avoid quoting the key.

```ts
elt_css: {
  width: "100%",
  position: "absolute",
}
```

### `class`

**Type**: `string`  
CSS class applied to the wrapper container. Used to activate built-in animations:

| Class           | Effect                  |
| --------------- | ----------------------- |
| `"blink"`       | Slow blink (opacity)    |
| `"blink-fast"`  | Fast blink              |
| `"blink-color"` | Blink with color change |
| `"blink-icon"`  | Blink on MDI icon       |

```ts
class: "blink-fast"
```

### `disabled_if`

**Type**: `string` (SafeEval expression)  
If the expression evaluates to `true`, the element is hidden. By default it is replaced by `<br/>` to preserve space in the flow. See `no_br_if_disabled` to suppress this behaviour.

```ts
// Hide if the element's own entity is off
disabled_if: "${state}==='off'";

// Hide if the device master is off
disabled_if: "!device.masterOn";

// Hide if another device entity is in a specific state
disabled_if: "${entity.device_state?.state}==='off'";

// Combined condition
disabled_if: "${state}==='auto' || ${state}==='off'";
```

### `no_br_if_disabled`

**Type**: `boolean`  
Changes the behaviour of `disabled_if`: instead of rendering `<br/>`, the element renders an empty fragment. Useful for absolutely-positioned elements (via `put_in` or `position: absolute`) where the `<br/>` would disrupt the parent slot layout.

```ts
{
  name: "sensor_controlled",
  type: "click-image",
  disabled_if: "${state}==='off'",
  no_br_if_disabled: true,   // Render empty fragment instead of <br/>
  put_in: "cables_1",
  elt_css: { ... },
}
```

> **Usage rule**: use `no_br_if_disabled: true` whenever the element is absolutely positioned or injected via `put_in`. Leave the default behaviour (`<br/>`) for elements in normal flow.

### `master`

**Type**: `boolean`  
If `true`, any state change of this entity triggers a full device re-render (not just the element). Use for pivot entities whose state change affects the overall layout.

```ts
master: true;
```

### `put_in`

**Type**: `string`  
Name of an HTML slot in the device template. The element is injected into `<slot name="...">` instead of being rendered in the main flow. Used by sub-devices (RSRUN) to position elements in specific zones of the parent device.

```ts
put_in: "sensor"; // → <slot name="sensor">
put_in: "cables_1"; // → <slot name="cables_1">
```

### `stateObj`

**Type**: `boolean | null`  
Forces `stateObj` handling:

- Absent: `stateObj` is resolved from `device.entities[name]`
- `null`: forces `stateObj` to `null` (element with no entity, e.g. pure UI navigation button)

```ts
stateObj: null; // Button with no associated HA entity
```

### `tap_action` / `hold_action` / `double_tap_action`

**Type**: `Action | Action[]`  
Action(s) triggered on click, hold, or double-click.

```ts
// Simple HA action
tap_action: {
  domain: "switch",
  action: "toggle",
  data: "default",          // Uses the stateObj entity_id
}

// HA action with explicit entity_id
tap_action: {
  domain: "switch",
  action: "toggle",
  data: { entity_id: "device_state" },  // Key in device.entities
}

// UI action: open a dialog
tap_action: {
  domain: "redsea_ui",
  action: "dialog",
  data: { type: "config" },
}

// UI action: display a message
tap_action: {
  domain: "redsea_ui",
  action: "message_box",
  data: "${i18n._('manual_advance')}",
}

// UI action: update element config on the fly
tap_action: {
  domain: "redsea_ui",
  action: "update_conf",
  data: {
    stats_week:  { css: { display: "block" } },
    stats_month: { css: { display: "none" } },
  },
}

// Chained actions (array)
tap_action: [
  { domain: "button", action: "press", data: "default" },
  { domain: "redsea_ui", action: "message_box", data: "OK" },
]
```

### `timer`

**Type**: `number` (seconds)  
Wait delay between HA actions and UI actions. During this delay the button is greyed out with a spinner.

```ts
timer: 3;
```

---

## Type-specific options

### `click-image`

Displays a clickable image (file or MDI icon).

| Option       | Type     | Description                                                   |
| ------------ | -------- | ------------------------------------------------------------- |
| `image`      | `URL`    | Image to display (`new URL("...", import.meta.url)`)          |
| `icon`       | `string` | MDI icon (`"mdi:cog"`) or `"state"` (icon from the HA entity) |
| `icon_color` | `string` | Icon color (CSS, e.g. `"#ec2330"`, `"rgb(...)"`)              |

> `image` and `icon` are mutually exclusive. If `icon` is defined, it takes priority.

> `icon: "state"` displays the icon defined in the HA entity attributes, with a grey color when the state is `"off"`.

```ts
// File image
{
  type: "click-image",
  name: "sensor_controlled",
  image: new URL("../../img/RSRUN/reefrun_sensor.png", import.meta.url),
}

// MDI icon
{
  type: "click-image",
  name: "configuration",
  icon: "mdi:cog",
  icon_color: "#ec2330",
}

// Dynamic icon (from HA entity)
{
  type: "click-image",
  name: "device_state",
  icon: "state",
  icon_color: "red",
}
```

---

### `common-sensor`

Displays the value of a HA entity as text.

| Option             | Type                | Description                                              |
| ------------------ | ------------------- | -------------------------------------------------------- |
| `label`            | `string \| boolean` | `false` = no label. Otherwise an evaluated expression.   |
| `prefix`           | `string`            | Prefix text (can be a `${...}` expression)               |
| `unit`             | `string`            | Unit displayed after the value (can be `${i18n._(...)}`) |
| `icon`             | `boolean \| string` | `true` = entity icon, `"mdi:..."` = fixed icon           |
| `icon_color`       | `string`            | Icon color                                               |
| `force_integer`    | `boolean`           | Rounds the value to the nearest integer                  |
| `translate_values` | `boolean`           | Passes the value through `i18n._()` before display       |

```ts
{
  type: "common-sensor",
  name: "days_till_end_of_roll",
  prefix: "${i18n._('end_of_roll')}",
  unit: "${i18n._('days')}",
  css: { ... },
}

{
  type: "common-sensor",
  name: "wifi_quality",
  icon: true,
  icon_color: "#ec2330",
  label: false,
  master: true,
}

{
  type: "common-sensor",
  name: "mode",
  translate_values: true,   // Displays i18n._("auto") instead of "auto"
}
```

---

### `common-button`

Clickable button with text and/or icon, optionally linked to an entity.

| Option  | Type     | Description                                     |
| ------- | -------- | ----------------------------------------------- |
| `label` | `string` | Displayed text (`${...}` expressions supported) |
| `icon`  | `string` | MDI icon (`"mdi:send"`)                         |

```ts
{
  type: "common-button",
  name: "advance",
  icon: "mdi:send",
  tap_action: { domain: "button", action: "press", data: "default" },
}

{
  type: "common-button",
  stateObj: null,          // No HA entity
  label: "${i18n._('weekly')}",
  tap_action: { domain: "redsea_ui", action: "update_conf", data: { ... } },
}
```

---

### `common-switch`

HA toggle switch (on/off) with two rendering styles.

| Option  | Type                | Description                                              |
| ------- | ------------------- | -------------------------------------------------------- |
| `style` | `string`            | `"switch"` = HA visual toggle, `"button"` = round button |
| `label` | `boolean \| string` | `false` = no label                                       |
| `class` | `string`            | Additional CSS class                                     |

```ts
{
  type: "common-switch",
  name: "schedule_enabled",
  master: true,
  style: "switch",
  tap_action: { domain: "switch", action: "toggle", data: "default" },
}
```

---

### `progress-bar`

Progress bar between a current value and a target value.

| Option                | Type      | Description                                                       |
| --------------------- | --------- | ----------------------------------------------------------------- |
| `name`                | `string`  | Entity for the current value                                      |
| `target`              | `string`  | Entity for the target (max) value                                 |
| `label`               | `string`  | Label displayed on the bar (`${...}` expression)                  |
| `inverted`            | `boolean` | Reverses the fill direction                                       |
| `target_is_remaining` | `boolean` | The `target` value represents the remaining amount, not the total |
| `force_integer`       | `boolean` | Rounds values to integers                                         |
| `no_value`            | `boolean` | Hides the numeric value display                                   |

```ts
{
  type: "progress-bar",
  name: "container_volume",
  target: "save_initial_container_volume",
  label: "${entity.remaining_days.state} ${i18n._('days_left')}",
  disabled_if: "${entity.slm.state}=='off' || ${entity.daily_dose.state}==0",
}
```

---

### `progress-circle`

Progress circle (same logic as `progress-bar`).

| Option                | Type      | Description                                   |
| --------------------- | --------- | --------------------------------------------- |
| `name`                | `string`  | Entity for the current value                  |
| `target`              | `string`  | Entity for the target value                   |
| `inverted`            | `boolean` | Reverses the direction                        |
| `target_is_remaining` | `boolean` | The `target` value is the remaining amount    |
| `no_value`            | `boolean` | Hides the center value                        |
| `colors`              | `object`  | `{ center: "rgba(...)" }` — center fill color |
| `force_integer`       | `boolean` | Rounds values to integers                     |

```ts
{
  type: "progress-circle",
  name: "total_usage",
  target: "remaining_length",
  inverted: false,
  target_is_remaining: true,
  no_value: false,
  colors: {
    center: "rgba(255,255,255,0.5)",
  },
}
```

---

### `common-schedule`

Displays a day-long schedule curve (00:00 → 23:59) on a canvas. Click to open an inline editor overlay with a live chart preview on the left and an editable time/value list on the right.

The linked `stateObj` must expose an attribute (default `"schedule"`) containing an array of point objects, e.g.:

```json
[
  { "pd": 0, "st": 0, "ti": 80 },
  { "pd": 0, "st": 360, "ti": 60 },
  { "pd": 0, "st": 720, "ti": 80 }
]
```

| Option               | Type      | Default         | Description                                                                                                          |
| -------------------- | --------- | --------------- | -------------------------------------------------------------------------------------------------------------------- |
| `schedule_attribute` | `string`  | `"schedule"`    | Attribute key on `stateObj` holding the schedule array                                                               |
| `time_field`         | `string`  | `"st"`          | Field name for minutes since midnight in each point                                                                  |
| `value_field`        | `string`  | `"ti"`          | Field name for the value in each point                                                                               |
| `pulse_field`        | `string`  | —               | Field name for pulsation (e.g. `"pd"`). If set, editor shows a pulse column. Values in seconds: 5 = 5s, 300 = 60min. |
| `min_pulse`          | `number`  | `0`             | Pulse lower bound in the editor input                                                                                |
| `max_pulse`          | `number`  | `100`           | Pulse upper bound in the editor input                                                                                |
| `linear`             | `boolean` | `false`         | `true` = linear interpolation between points, `false` = step curve                                                   |
| `min_value`          | `number`  | `0`             | Y axis minimum (also lower bound in the editor inputs)                                                               |
| `max_value`          | `number`  | `100` / auto    | Y axis maximum (also upper bound in the editor inputs)                                                               |
| `line_color`         | `string`  | device color    | Curve color as `"R,G,B"`                                                                                             |
| `fill_alpha`         | `number`  | `0.15`          | Fill opacity under the curve                                                                                         |
| `bg_color`           | `string`  | transparent     | Chart background as `"R,G,B,A"`                                                                                      |
| `label_color`        | `string`  | `"200,200,200"` | Axis labels & grid color as `"R,G,B"`                                                                                |
| `unit`               | `string`  | entity unit     | Unit label override (displayed on Y axis and in the editor)                                                          |
| `max_points`         | `number`  | `10`            | Maximum number of schedule points allowed in the editor                                                              |

#### Editor behaviour

- **Click** on the chart opens a modal overlay.
- **Left panel**: live preview of the schedule curve, updated in real time as values are edited.
- **Right panel**: list of editable rows. Each row contains a time input (`HH:MM`), a value input (clamped to `min_value`..`max_value`), an optional pulse input (only when `pulse_field` is set, clamped to `min_pulse`..`max_pulse`), and a delete button.
- **Add**: inserts a new point (disabled when `max_points` is reached).
- **Delete**: removes a point (disabled when only one point remains — at least one is always required).
- Points are automatically sorted by time after each edit.
- **Save**: calls `hass.callService("redsea", "request", ...)` with a PUT to `/pump/settings` containing the updated schedule array for the relevant pump. Requires `parent_device` to be set on the pump (done by `rsrun.ts`).
- **Cancel** or clicking the backdrop closes the editor without saving.

```ts
// Return pump: with pulse column (pd ranges 5–300)
{
  type: "common-schedule",
  name: "constant_speed",
  schedule_attribute: "schedule",
  time_field: "st",
  value_field: "ti",
  pulse_field: "pd",
  min_pulse: 5,
  max_pulse: 300,
  linear: false,
  min_value: 0,
  max_value: 100,
  max_points: 10,
  line_color: "0,150,255",
  fill_alpha: 0.15,
  unit: "%",
  label_color: "55,55,55",
  css: { ... },
}

// Skimmer pump: no pulse column (pulse_field omitted)
{
  type: "common-schedule",
  name: "constant_speed",
  schedule_attribute: "schedule",
  time_field: "st",
  value_field: "ti",
  linear: false,
  min_value: 0,
  max_value: 100,
  max_points: 10,
  line_color: "0,150,255",
  fill_alpha: 0.15,
  unit: "%",
  label_color: "55,55,55",
  css: { ... },
}
```

---

### `redsea-messages`

Displays the last message or alert from the device.

| Option  | Type     | Description                              |
| ------- | -------- | ---------------------------------------- |
| `label` | `string` | Prefix before the message (e.g. `"'⚠'"`) |

```ts
{
  type: "redsea-messages",
  name: "last_message",
  css: { width: "100%", height: "15px", ... },
  "elt.css": { "background-color": "rgba(220,220,220,0.7)" },
}
```

---

### `hui-*` (native Home Assistant cards)

Embeds a standard HA card inside the device. The card configuration is passed via `conf`.

| Option | Type     | Description                                         |
| ------ | -------- | --------------------------------------------------- |
| `conf` | `object` | Native HA card configuration (identical to HA YAML) |

Entities referenced in `conf` are **translation keys** (`translation_key`), not raw `entity_id` values — resolution is handled by the engine.

```ts
{
  type: "hui-statistics-graph",
  name: "stats_week",
  conf: {
    type: "statistics-graph",
    entities: [{ entity: "today_usage", color: "#c55b5a" }],
    chart_type: "line",
    period: "hour",
    days_to_show: 7,
    stat_types: ["mean"],
    hide_legend: true,
  },
  css: {
    position: "absolute",
    top: "54%",
    width: "46%",
    display: "block",
  },
}
```

---

## SafeEval evaluation context

Available in `disabled_if`, `label`, `prefix`, `unit`, and any field accepting `${...}`.

| Variable          | Type                          | Description                                                                        |
| ----------------- | ----------------------------- | ---------------------------------------------------------------------------------- |
| `state`           | `string`                      | `stateObj.state` of the current element                                            |
| `stateObj`        | `StateObject`                 | Full object of the entity linked to the element                                    |
| `entity`          | `Record<string, StateObject>` | All device entities indexed by `translation_key` (and by `domain.translation_key`) |
| `device`          | `Device`                      | Full device object                                                                 |
| `device.masterOn` | `boolean`                     | `true` if the device is on                                                         |
| `config`          | `ElementConfig`               | Configuration of the current element                                               |
| `name`            | `string`                      | `config.name` of the element                                                       |
| `i18n._('key')`   | `string`                      | Translation of the key                                                             |

### Expression examples

```ts
// State of the element's own entity
disabled_if: "${state}==='off'";

// Device master state
disabled_if: "!device.masterOn";

// State of another device entity
disabled_if: "${entity.device_state?.state}==='off'";

// Multi-state condition
disabled_if: "${state}==='auto' || ${state}==='off' || ${state}==='maintenance'";

// Dynamic label
label: "${entity.remaining_days.state} ${i18n._('days_left')}";

// Translated prefix
prefix: "${i18n._('daily_average')}  ";
```

> **Note**: `${state}` is shorthand for `${stateObj?.state}` — it is resolved from the entity whose `name` matches the element's `name`. If the element has no own entity (`stateObj: null`), `state` will be `undefined`. In that case, target a specific entity explicitly with `${entity.my_key?.state}`.

---

## Best practices

- **Name color constants** at the top of the file to centralise changes (`const COLOR_RSMAT_HEX = "#c55b5a"`).
- **`master: true`** only on entities whose state change impacts the overall layout (avoids unnecessary re-renders).
- **Complementary `disabled_if` pairs** to alternate two visuals based on a state: one with `${state}==='off'` and the other with `${state}==='on'`.
- **`stateObj: null`** for pure UI buttons with no HA entity, to avoid a failed entity resolution attempt.
- **`no_br_if_disabled: true`** whenever the element is absolutely positioned or injected via `put_in`.
- **`put_in`** is reserved for sub-device elements that need to be inserted into slots of the parent device.
- **Domain-qualified `name`** (`"sensor.my_key"`, `"select.my_key"`) should only be used when two entities share the same `translation_key` across different HA domains. In all other cases, prefer the plain `translation_key` for readability.
