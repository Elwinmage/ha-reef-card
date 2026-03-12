/**
 * @file Global CSS animations shared across all custom elements.
 *
 * Usage — two ways:
 *
 * 1. Via YAML config (css inline property):
 *      css:
 *        animation: "blink 1s linear infinite"
 *
 * 2. Via YAML config (class shorthand):
 *      class: "blink"          # 1 s hard blink
 *      class: "blink-slow"     # 2 s soft blink
 *      class: "blink-fast"     # 0.4 s urgent blink
 *      class: "pulse"          # 1.5 s opacity fade (min 25 %)
 *      class: "blink-color"    # 1 s hue-shift
 *      class: "blink-scale"    # 1 s scale grow/shrink
 *
 * These styles are injected into MyElement (base class) so every
 * component (Button, Sensor, ClickImage, …) inherits them automatically.
 */

import { css } from "lit";

export default css`
  /* ------------------------------------------------------------------ */
  /* Keyframe definitions                                                  */
  /* ------------------------------------------------------------------ */

  /* Hard blink: fully visible → fully invisible */
  @keyframes blink {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0;
    }
  }

  /* Soft pulse: stays partially visible (less aggressive than blink) */
  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.25;
    }
  }

  /* Color shift: alternates hue toward warning red */
  @keyframes blink-color {
    0%,
    100% {
      filter: none;
    }
    50% {
      filter: hue-rotate(180deg) saturate(3);
    }
  }

  /* Scale pulse: element gently grows and shrinks */
  @keyframes blink-scale {
    0%,
    100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.15);
    }
  }

  /* ------------------------------------------------------------------ */
  /* Convenience CSS classes                                               */
  /* The animation is applied both to the element itself AND to its       */
  /* first child (img, ha-icon…) so it works whether the class is on      */
  /* the wrapper <div> (render() in element.ts) or on the inner element.  */
  /* ------------------------------------------------------------------ */

  /** Standard blink — 1 s cycle */
  .blink,
  .blink > * {
    animation: blink 1s linear infinite;
  }

  /** Slow blink — 2 s (less intrusive alerts) */
  .blink-slow,
  .blink-slow > * {
    animation: blink 2s linear infinite;
  }

  /** Fast blink — 0.4 s (urgent / critical alerts) */
  .blink-fast,
  .blink-fast > * {
    animation: blink 0.4s linear infinite;
  }

  /** Soft pulse — opacity 1 → 0.25, 1.5 s */
  .pulse,
  .pulse > * {
    animation: pulse 1.5s ease-in-out infinite;
  }

  /** Color shift pulse — 1 s */
  .blink-color,
  .blink-color > * {
    animation: blink-color 1s ease-in-out infinite;
  }

  /** Scale pulse — 1 s */
  .blink-scale,
  .blink-scale > * {
    animation: blink-scale 1s ease-in-out infinite;
  }
`;
