import { css } from "lit";

export default css`
  .skimmer-body {
    position: relative;
    display: inline-block;
    width: 100%;
  }
  .skimmer-body img.device_img {
    width: 100%;
    display: block;
  }

  /* Water flow overlay — on the transparent body (cone) */
  .water-overlay {
    position: absolute;
    left: 47%;
    transform: translateX(-50%);
    width: 93%;
    bottom: 19%;
    height: 46%;
    clip-path: polygon(
      30% 0%,
      0% 0%,
      70% 0%,
      85% 91%,
      75% 96%,
      50% 98%,
      25% 95%,
      15% 91%,
      25% 30%
    );
    overflow: hidden;
    pointer-events: none;
  }
  .water-inner {
    width: 100%;
    height: 300%;
    animation: skimmerWater 3s linear infinite;
    animation-play-state: var(--water-play-state, paused);
  }
  @keyframes skimmerWater {
    from {
      transform: translateY(0);
    }
    to {
      transform: translateY(-33.33%);
    }
  }

  /* Foam overlay — normal (on): full cup area */
  .foam-overlay {
    position: absolute;
    left: 18%;
    top: 3%;
    width: 64%;
    height: 25%;
    clip-path: polygon(
      19% 13%,
      76% 13%,
      74% 30%,
      99% 38%,
      98% 66%,
      -12% 66%,
      -12% 44%,
      9% 34%
    );
    border-radius: 3px 3px 6px 6px;
    overflow: hidden;
    pointer-events: none;
  }

  /* Foam overlay — full-cup: thin band at top of cup (y=6%..9% of image) */
  .foam-overlay--full {
    position: absolute;
    left: 12%;
    top: 5.5%;
    width: 76%;
    height: 3%;
    border-radius: 2px;
    overflow: hidden;
    pointer-events: none;
  }

  /* Foam bubbles — appear, grow, pop */
  .foam-bubble {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 205, 205, 0.08);
    border: 1.5px solid rgba(205, 255, 255, 0.6);
    transform: scale(0);
    animation: foamPop linear infinite;
    animation-play-state: var(--water-play-state, paused);
  }
  @keyframes foamPop {
    0% {
      transform: scale(0);
      opacity: 0;
    }
    15% {
      opacity: 0.6;
    }
    60% {
      transform: scale(1);
      opacity: 0.6;
    }
    100% {
      transform: scale(4);
      opacity: 0;
    }
  }
`;
