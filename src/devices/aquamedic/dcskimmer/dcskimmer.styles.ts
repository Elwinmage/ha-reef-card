import { css } from "lit";

/**
 * Activity of the DC Skimmer, drawn over its picture.
 *
 * Every position is a percentage of the picture (641×1024), measured on
 * am-dcskimmer-on.png: the reaction chamber is the cone between the neck
 * (32 % down) and the base ring (70 %), the foam sits in the collection cup
 * between 9 % and 24 %.
 */
export default css`
  /* Takes the place the picture alone had: same width and margins */
  .skimmer-picture {
    position: relative;
  }
  .skimmer-picture img.device_img {
    display: block;
    width: 100%;
  }

  /* Rising water: translucent bands scrolling up the reaction chamber */
  .water-overlay {
    position: absolute;
    left: 15%;
    top: 32%;
    width: 48%;
    height: 38%;
    /* The cone: narrow at the neck, full width from two thirds down */
    clip-path: polygon(
      25% 0%,
      81% 0%,
      83% 10%,
      92% 34%,
      98% 60%,
      100% 87%,
      100% 100%,
      0% 100%,
      0% 87%,
      4% 60%,
      12.5% 34%,
      23% 10%
    );
    overflow: hidden;
    pointer-events: none;
  }
  .water-inner {
    width: 100%;
    height: 300%;
    animation: amSkimmerWater 3s linear infinite;
  }
  @keyframes amSkimmerWater {
    from {
      transform: translateY(0);
    }
    to {
      transform: translateY(-33.33%);
    }
  }

  /* Foam: bubbles growing and popping in the collection cup */
  .foam-overlay {
    position: absolute;
    left: 27%;
    top: 9%;
    width: 33%;
    height: 15%;
    overflow: hidden;
    pointer-events: none;
  }
  .foam-bubble {
    position: absolute;
    border-radius: 50%;
    transform: scale(0);
    animation: amFoamPop linear infinite;
  }
  @keyframes amFoamPop {
    0% {
      transform: scale(0);
      opacity: 0;
    }
    15% {
      opacity: 0.7;
    }
    60% {
      transform: scale(1);
      opacity: 0.7;
    }
    100% {
      transform: scale(3.5);
      opacity: 0;
    }
  }
`;
