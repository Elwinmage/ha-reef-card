import { css } from "lit";

export default css`
  .water-level {
    display: block;
    width: 100%;
    height: 100%;
    /* The SVG stretches to whatever box the mapping positions, so the caller
       only ever deals with top/left/width/height — no rotation, no transform
       origin surprises. */
  }

  /* The water body is a full-height rectangle translated down: transform is
     animatable everywhere, whereas y/height geometry properties are not
     animatable on older WebKit (Android companion app). */
  .wl-body {
    transition: transform 0.6s ease;
  }

  /* multiply darkens the backdrop instead of averaging toward the water
     colour. Pumps, probes and the tank graduation keep their contrast and
     read as submerged — which is what real water does: it absorbs light,
     it does not add white. A plain alpha fill greys everything out. */
  .wl-blend {
    mix-blend-mode: multiply;
  }

  /* Keep the blending inside this element: without isolation the multiply
     would reach up to whatever stacking context the card provides and tint
     sibling elements. position: relative anchors the value overlay. */
  .wl-root {
    position: relative;
    isolation: isolate;
    width: 100%;
    height: 100%;
  }

  /* Value overlay, bottom-right of the submerged area. Offsets are in % so
     the label keeps its place whatever size the background picture is
     rendered at. It sits outside .wl-blend: multiply would eat the text. */
  .wl-value {
    position: absolute;
    right: 4%;
    bottom: 2%;
    font-size: 0.8em;
    font-weight: bold;
    line-height: 1;
    white-space: nowrap;
    /* Readable over both the tinted water and the bare picture. */
    text-shadow:
      0 0 3px rgba(0, 0, 0, 0.85),
      0 0 1px rgba(0, 0, 0, 0.95);
    pointer-events: none;
  }

  .wl-wave {
    animation: wl-drift 7s linear infinite;
  }

  /* Alert: the water pulses between its normal tint and the warning tint.
     A CSS fill overrides the presentation attribute, so the attribute can
     stay on the warning colour as the reduced-motion fallback. The wave keeps
     drifting: the two animations run on different properties. */
  .wl-alert {
    animation:
      wl-drift 7s linear infinite,
      wl-alert-fill 1.6s ease-in-out infinite;
  }

  /* A flat surface has no drift animation to compose with. */
  rect.wl-alert {
    animation: wl-alert-fill 1.6s ease-in-out infinite;
  }

  .wl-alert-stroke {
    animation: wl-alert-stroke 1.6s ease-in-out infinite;
  }

  @keyframes wl-alert-fill {
    0%,
    100% {
      fill: var(--wl-water);
    }
    50% {
      fill: var(--wl-warn);
    }
  }

  @keyframes wl-alert-stroke {
    0%,
    100% {
      stroke: var(--wl-water);
    }
    50% {
      stroke: var(--wl-warn);
    }
  }

  /* The wave path repeats every 100 viewBox units, so a -100 drift loops
     seamlessly. */
  @keyframes wl-drift {
    from {
      transform: translateX(0);
    }
    to {
      transform: translateX(-100px);
    }
  }

  /* Unknown / error level: never draw an empty tank, that would read as a
     real — and alarming — empty tank. Show an explicit "no reading" mark. */
  .wl-unknown {
    stroke-dasharray: 4 3;
    stroke-width: 1.5;
    vector-effect: non-scaling-stroke;
  }

  @media (prefers-reduced-motion: reduce) {
    .wl-wave,
    .wl-alert,
    .wl-alert-stroke {
      animation: none;
    }
    .wl-body {
      transition: none;
    }
  }
`;
