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
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
  }

  .socket_label {
    position: absolute;
    top: 0%;
    width: 100%;
    text-align: center;
    font-size: 0.7em;
    font-weight: bold;
    color: white;
    text-shadow: 0 0 3px rgba(0, 0, 0, 0.7);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .socket_indicator {
    position: absolute;
    bottom: 5%;
    width: 60%;
    text-align: center;
    font-size: 0.6em;
    border-radius: 8px;
    padding: 1px 3px;
  }

  .socket_indicator.on {
    background-color: rgba(0, 180, 0, 0.7);
    color: white;
  }

  .socket_indicator.off {
    background-color: rgba(100, 100, 100, 0.5);
    color: #ccc;
  }

  .socket_indicator.standby {
    background-color: rgba(200, 150, 0, 0.6);
    color: white;
  }

  .socket_consumption {
    position: absolute;
    bottom: 20%;
    width: 80%;
    text-align: center;
    font-size: 0.55em;
    color: rgba(255, 255, 255, 0.8);
  }
`;
