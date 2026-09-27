import { css } from "lit";

export default css`
  :host {
    display: block;
    position: relative;
    width: 100%;
    height: 100%;
  }

  .socket_container {
    position: relative;
    width: 100%;
    height: 100%;
  }

  /* The pipe to the linked thumbnail is drawn over the socket: it must not
     swallow clicks meant for the elements under it */
  .pipe {
    pointer-events: none;
  }
`;
