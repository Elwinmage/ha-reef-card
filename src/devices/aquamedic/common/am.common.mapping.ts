/**
 * Elements shared by every Aqua Medic view, and the geometry placing them.
 *
 * Each view is a box one unit wide and `box` units high (see `am_box_styles`
 * in am_device.ts). The pump picture sits somewhere inside it, the controls
 * go on the picture or next to it, and the time-slot program takes the
 * bottom band:
 *
 *   ┌──────────────────────────────┐
 *   │   ⏻  🐟  ⏲  ⎓          ⚙   │  power, feeding, timer, 0-10V | settings
 *   │        pump picture   (%)    │  speed ring
 *   │ ⚠ faults                     │  only while a fault is raised
 *   │  speed                       │
 *   │  ━━━━━━━●━━━━━━━━━━━━━━━━━   │  speed slider
 *   │  ┌────────────────────────┐  │
 *   │  │ time-slot program      │  │  click: program editor
 *   │  └────────────────────────┘  │
 *   └──────────────────────────────┘
 *
 * A view describes where things go with an `AMLayout`, in percentages of
 * its box. Points that belong to the picture (an icon on the motor, a ring
 * around the impeller) are easier to give in percentages of the picture
 * itself: `picture_point()` converts them, so moving or resizing the
 * picture moves everything drawn on it.
 *
 * Entities are named by the translation keys of ha-aquamedic-component.
 */
import { COLOR_AM_HEX, COLOR_AM_RGB } from "../../../utils/colors";

/** Where the pump picture sits in the box. */
export interface AMPicture {
  /** Height of the box, the width being 1 */
  box: number;
  /** Height / width of the PNG */
  ratio: number;
  /** Width of the picture, in % of the box width */
  width: number;
  /** Left and top margins of the picture, in % of the box width */
  left: number;
  top: number;
}

/** A point of the box, as [x, y] in % of its width and of its height. */
export type AMPoint = [number, number];

/**
 * CSS of the picture itself. Margins rather than offsets: a percentage
 * margin is always taken from the box width, whichever side it is on.
 * @param picture: where the picture sits
 */
export function picture_css(picture: AMPicture) {
  return {
    width: picture.width + "%",
    "margin-left": picture.left + "%",
    "margin-top": picture.top + "%",
  };
}

/**
 * Convert a point of the picture into a point of the box.
 * @param picture: where the picture sits
 * @param x: horizontal position, in % of the picture width
 * @param y: vertical position, in % of the picture height
 * @return the same point, in % of the box
 */
export function picture_point(
  picture: AMPicture,
  x: number,
  y: number,
): AMPoint {
  const round = (value: number) => Math.round(value * 10) / 10;
  return [
    round(picture.left + (picture.width * x) / 100),
    round(
      (picture.top + (picture.width * picture.ratio * y) / 100) / picture.box,
    ),
  ];
}

/**
 * CSS of an overlay covering exactly the picture, for what is drawn in the
 * picture's own pixels (a ring fitted on a cap, say). It lets clicks through.
 * @param picture: where the picture sits
 */
export function picture_rect(picture: AMPicture) {
  const round = (value: number) => Math.round(value * 10) / 10;
  return {
    flex: "0 0 auto",
    position: "absolute",
    left: picture.left + "%",
    top: round(picture.top / picture.box) + "%",
    width: picture.width + "%",
    height: round((picture.width * picture.ratio) / picture.box) + "%",
    "pointer-events": "none",
  };
}

/** Where a view puts the shared elements, in % of its box. */
export interface AMLayout {
  /** Centre of each icon */
  icons: {
    power: AMPoint;
    feed_switch: AMPoint;
    timer_on: AMPoint;
    control_0_10v: AMPoint;
    configuration: AMPoint;
  };
  /** Speed ring: its centre, the width of its element (the ring itself is
   *  0.72 of it) and whether the figure is written inside. A view drawing
   *  its own ring (the SmartDrift, on its cap) leaves it out. */
  ring?: {
    center: AMPoint;
    width: number;
    value: boolean;
    /** Colours of the track and of the disc inside the ring, when the
     *  defaults do not stand out on what the ring is drawn over */
    colors?: { background?: string; center?: string };
  };
  /** Fault line: its top, left and width */
  faults: { top: number; left: number; width: number };
  /** Top of the speed slider row (label, then slider) */
  slider_top: number;
  /** Time-slot program: its top and height (full width) */
  schedule: { top: number; height: number };
}

/**
 * CSS of an element centred on a point of the box.
 * @param point: the centre, in % of the box
 */
export function centred_at(point: AMPoint) {
  return {
    flex: "0 0 auto",
    position: "absolute",
    left: point[0] + "%",
    top: point[1] + "%",
    transform: "translate(-50%,-50%)",
  };
}

/**
 * Text written over the picture: white on a dark pill, so it stays legible
 * whatever the picture shows behind it. Sized from the card width (the
 * device box is a size container), within readable bounds.
 */
export const LABEL_CSS = {
  flex: "0 0 auto",
  position: "absolute",
  color: "white",
  "background-color": "rgba(0,0,0,0.45)",
  "border-radius": "8px",
  padding: "0 6px",
  "font-size": "clamp(10px, 3.2cqw, 15px)",
  "white-space": "nowrap",
};

/**
 * Condition hiding what shows a speed: the number is unavailable while the
 * pump is driven by its 0-10V input (the integration then disables it), or
 * simply absent on this model.
 * @param name: translation key of the number entity
 */
export function speed_hidden(name: string): string {
  return `entity.${name}?.state === undefined || entity.${name}?.state === 'unavailable'`;
}

/**
 * A slider row: its label and the slider under it.
 * @param key: prefix of the two element keys
 * @param name: translation key of the number entity
 * @param label: translation key of the label
 * @param top: top of the label, in % of the box
 */
export function slider_row(
  key: string,
  name: string,
  label: string,
  top: number,
) {
  const hidden = speed_hidden(name);
  return {
    [key + "_label"]: {
      name: key + "_label",
      type: "common-sensor",
      stateObj: null,
      value: "${i18n._('" + label + "')}",
      disabled_if: hidden,
      no_br_if_disabled: true,
      css: { ...LABEL_CSS, left: "6%", top: top + "%" },
    },
    [key + "_slider"]: {
      name,
      type: "common-slider",
      slider_color: COLOR_AM_RGB,
      disabled_if: hidden,
      no_br_if_disabled: true,
      css: {
        flex: "0 0 auto",
        position: "absolute",
        top: top + 3.5 + "%",
        left: "6%",
        width: "88%",
        height: "30px",
      },
    },
  };
}

/**
 * A switch drawn as its state icon, toggled on a click.
 * @param name: translation key of the switch
 * @param point: centre of the icon, in % of the box
 */
function switch_icon(name: string, point: AMPoint) {
  return {
    name,
    type: "click-image",
    icon: "state",
    icon_color: COLOR_AM_HEX,
    disabled_if: `entity.${name} === undefined`,
    no_br_if_disabled: true,
    tap_action: { domain: "switch", action: "toggle", data: "default" },
    css: centred_at(point),
  };
}

/**
 * The elements every Aqua Medic pump has.
 * @param speed: translation key of the number entity driving the speed
 * @param speed_label: translation key of the speed slider label
 * @param layout: where the view puts them
 */
export function common_elements(
  speed: string,
  speed_label: string,
  layout: AMLayout,
) {
  return {
    // ── Switches ─────────────────────────────────────────────────────
    power: {
      ...switch_icon("power", layout.icons.power),
      master: true,
      // The on/off switch must stay usable while the pump is off
      off_clickable: true,
    },
    feed_switch: switch_icon("feed_switch", layout.icons.feed_switch),
    timer_on: {
      ...switch_icon("timer_on", layout.icons.timer_on),
      // Long press jumps straight to the program editor
      hold_action: {
        domain: "redsea_ui",
        action: "open_schedule",
        data: "schedule",
      },
    },
    control_0_10v: switch_icon("control_0_10v", layout.icons.control_0_10v),
    configuration: {
      name: "configuration",
      type: "click-image",
      icon: "mdi:cog",
      icon_color: COLOR_AM_HEX,
      // Settings hold the pump role and the maintenance of a stopped pump
      off_clickable: true,
      tap_action: {
        domain: "redsea_ui",
        action: "dialog",
        data: { type: "config" },
      },
      css: centred_at(layout.icons.configuration),
    },

    // ── Faults ───────────────────────────────────────────────────────
    faults: {
      name: "faults",
      type: "aquamedic-faults",
      stateObj: null,
      css: {
        flex: "0 0 auto",
        position: "absolute",
        top: layout.faults.top + "%",
        left: layout.faults.left + "%",
        width: layout.faults.width + "%",
      },
    },

    // ── Speed: a ring on the picture, a slider under it ──────────────
    ...(layout.ring
      ? {
          speed: {
            name: speed,
            type: "progress-circle",
            target: 100,
            force_integer: true,
            no_value: !layout.ring.value,
            colors: layout.ring.colors ?? {},
            disabled_if: speed_hidden(speed),
            css: {
              ...centred_at(layout.ring.center),
              width: layout.ring.width + "%",
              // The ring is an indicator: clicks go to what it surrounds
              "pointer-events": "none",
            },
          },
        }
      : {}),
    ...slider_row("speed", speed, speed_label, layout.slider_top),

    // ── Time-slot program, click opens its editor ────────────────────
    schedule: {
      name: "sensor.schedule",
      type: "aquamedic-schedule",
      disabled_if: "entity.schedule === undefined",
      no_br_if_disabled: true,
      // No transform here: it would trap the editor's fixed overlay inside
      // the graph instead of covering the screen
      css: {
        flex: "0 0 auto",
        position: "absolute",
        left: "3%",
        top: layout.schedule.top + "%",
        width: "94%",
        height: layout.schedule.height + "%",
      },
    },
  };
}
