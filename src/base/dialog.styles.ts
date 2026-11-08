/**
 * @file Component styles
 * @module base.dialog.styles
 */

import { css, unsafeCSS } from "lit";

import { TRASH_ICON } from "./ui_images";

export default css`
  #window-mask {
    position: absolute;
    top: 0px;
    left: 0px;
    width: 100%;
    height: 100%;
    background-color: rgba(175, 175, 175, 0.8);
    z-index: 6;
    display: none;
    justify-content: center;
    align-items: center;
  }

  #dialog {
    border: 1px solid gray;
    z-index: 7;
    position: absolute;
    top: 100px;
    padding-left: 15px;
    padding-right: 15px;
    padding-top: 20px;
    padding-bottom: 10px;
    background-color: rgba(255, 255, 255, 1);
    border-radius: 15px;
    justify-content: center;
    align-items: center;
    display: grid;
    /* minmax(0, ...): the second column never grows past the dialog to fit
       a wide content (a schedule row), which would push the dialog over
       both sides of the card */
    grid-template-columns: 40px minmax(0, 1fr);
    grid-gap: 10px;
    box-sizing: border-box;
    /* Ensure hui-number-entity-row has enough width to render slider + value,
       but never more than the card: on a phone the card is narrower than
       350px plus the paddings */
    min-width: min(350px, calc(100% - 8px));
    max-width: calc(100% - 8px);
  }

  #dialog-close {
    grid-column: 1;
    grid-row: 1;
    padding-left: 5px;
    padding-right: 5px;
    text-align: center;
  }

  #dialog-title {
    grid-column: 2/4;
    grid-row: 1;
    padding-left: 5px;
    padding-right: 5px;
    font-size: 1.5em;
    font-weight: bold;
    min-width: 0;
    overflow-wrap: anywhere;
  }

  #dialog-content {
    grid-column: 1/4;
    grid-row: 2;
    padding-left: 5px;
    padding-right: 5px;
    width: 90%;
    margin-left: 5%;
    box-sizing: border-box;
    min-width: 0;
    /* Last resort for a content that cannot shrink: scroll it, never the
       whole dialog */
    overflow-x: auto;
  }

  /* Nothing in the content is wider than the dialog */
  #dialog-content > * {
    max-width: 100%;
    box-sizing: border-box;
  }

  #dialog-buttons {
    grid-column: 1/3;
    grid-row: 3;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 10px;
    padding: 10px 5px;
    width: 90%;
    margin-left: 5%;
    min-width: 90%;
    align-items: stretch;
  }

  #bt_left {
    grid-column: 1;
    text-align: center;
    min-height: 33.5%;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  #bt_center {
    grid-column: 2;
    text-align: center;
    min-height: 33%;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  #bt_right {
    grid-column: 3;
    text-align: center;
    min-width: 33.5%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  form.schedule {
    margin-top: 10px;
    padding-left: 5px;
    padding-right: 5px;
    padding-top: 5px;
    padding-bottom: 5px;
    border: 1px solid #e0e0e0;
    border-radius: 30px;
  }

  p.schedule_header {
    font-weight: bold;
  }

  select {
  }

  .days {
    margin-left: 0px;
    margin-right: 0px;
    width: 2em;
    height: 2em;
    background-color: white;
    border-radius: 50%;
    vertical-align: middle;
    border: 1px solid #ddd;
    appearance: none;
    -webkit-appearance: none;
    outline: none;
    cursor: pointer;
  }
  .days:checked {
    background-color: #2196f3;
  }

  label.days {
    position: relative;
    left: 19px;
    top: 2px;
    background-color: rgba(0, 0, 0, 0);
    border: none;
  }

  label.days:hover {
    cursor: pointer;
  }

  .interval {
    font-weight: bolder;
    text-align: center;
    border-radius: 20px;
    display: flex;
    /* On a narrow card the fields of an interval go on two lines rather
       than widening the dialog */
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    gap: 4px;
    padding: 4px;
    margin-top: 5px;
    margin-bottom: 5px;
    background-color: aliceblue;
    border: 1px solid lightgray;
  }

  /* Each field (label + input) shares the row and may shrink */
  .interval > div {
    flex: 1 1 7em;
    min-width: 0;
  }

  .interval input,
  .interval select {
    max-width: 100%;
    box-sizing: border-box;
  }

  .interval input[type="time"] {
    width: 100%;
  }

  form.schedule {
    box-sizing: border-box;
    max-width: 100%;
  }

  form.schedule input[type="number"] {
    max-width: 100%;
    box-sizing: border-box;
  }

  input {
    border-radius: 20px;
    border: 1px solid #009ac7;
  }

  select {
    border-radius: 20px;
    border: 1px solid #009ac7;
  }

  button {
    border-radius: 20px;
    background-color: #009ac7;
    color: white;
    font-weight: bold;
    padding-top: 10px;
    padding-bottom: 10px;
    padding-left: 20px;
    padding-right: 20px;
    display: inline-block;
    margin-top: 5px;
    margin-bott: 5px;
    border: none;
  }

  button:hover {
    cursor: pointer;
  }

  /* Timer animation - used by _wait_timer() in element.ts */
  @keyframes dialog-spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  button.delete_button {
    background-color: red;
    background: url("${unsafeCSS(TRASH_ICON)}");
    background-position: center;
    background-repeat: no-repeat;
  }

  label {
    margin-right: 5px;
  }

  input {
    margin-right: 5px;
  }

  :disabled {
    background-color: rgb(200, 200, 200);
  }

  /* Phones: every pixel counts */
  @media (max-width: 500px) {
    #dialog {
      padding-left: 8px;
      padding-right: 8px;
      grid-gap: 6px;
    }

    #dialog-content {
      width: 100%;
      margin-left: 0;
      padding-left: 2px;
      padding-right: 2px;
    }

    #dialog-buttons {
      width: 100%;
      margin-left: 0;
    }

    button {
      padding-left: 12px;
      padding-right: 12px;
    }
  }
`;
