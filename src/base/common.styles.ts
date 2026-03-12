import { css } from "lit";

export default css`
  .device_bg {
    position: relative;
    top: 0;
    left: 0;
    width: 100%;
    aspect-ratio: 1/1.2;
  }

  .device_img {
    position: relative;
    top: 0;
    left: 0;
    width: 100%;
  }

  .device_img_disabled {
    position: relative;
    top: 0;
    left: 0;
    width: 100%;
    filter: grayscale(80%);
  }

  .disabled_in_ha {
    color: white;
    text-align: center;
    position: absolute;
    width: 100%;
    top: 15%;
    left: 0%;
    background-color: rgba(255, 0, 0, 0.5);
  }

  /* ------------------------------------------------------------------ */
  /* Blink / pulse animations — usable via css: { animation: "..." }     */
  /* or via class: "blink" / "blink-slow" / "blink-fast" / "pulse"       */
  /* ------------------------------------------------------------------ */

  /* Standard blink: full opacity → invisible, 1 s cycle */
  @keyframes blink {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0;
    }
  }

  /* Soft pulse: stays partially visible at minimum (less aggressive) */
  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.25;
    }
  }

  /* Color pulse: alternates between current color and a warning red */
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

  /* --- Convenience classes ------------------------------------------ */

  /* Normal blink — 1 s */
  .blink,
  .blink > * {
    animation: blink 1s linear infinite;
  }

  /* Slow blink — 2 s (less intrusive) */
  .blink-slow,
  .blink-slow > * {
    animation: blink 2s linear infinite;
  }

  /* Fast blink — 0.4 s (urgent alert) */
  .blink-fast,
  .blink-fast > * {
    animation: blink 0.4s linear infinite;
  }

  /* Soft pulse (opacity 1 → 0.25) — 1.5 s */
  .pulse,
  .pulse > * {
    animation: pulse 1.5s ease-in-out infinite;
  }

  /* Color shift pulse — 1 s */
  .blink-color,
  .blink-color > * {
    animation: blink-color 1s ease-in-out infinite;
  }

  /* Scale pulse — 1 s */
  .blink-scale,
  .blink-scale > * {
    animation: blink-scale 1s ease-in-out infinite;
  }
`;
