import { css } from "lit";

export default css`
  /* A square box on the port connector; everything inside is placed in % of
     it, and sized from its width (cqw). */
  :host {
    display: block;
    position: relative;
    width: 100%;
    aspect-ratio: 1 / 1;
    container-type: inline-size;
  }

  .port {
    position: relative;
    width: 100%;
    height: 100%;
  }
`;
