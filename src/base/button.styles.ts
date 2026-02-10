/**
 * @file Component styles
 * @module base.button.styles
 */

import {css} from 'lit';

export default css`

:hover{
  cursor: pointer;
}

.button{
  width:100%;
  height:100%;
  border-radius: 30px;
}

.dialog_button:hover{
  background-color: #006787;
}


.dialog_button{
  border-radius: 20px;
  background-color: #009ac7;
  color: white;
font-size: 0.7em;
  font-weight: bold;
  padding-top: 10px;
  padding-bottom: 10px;
  padding-left: 20px;
  padding-right: 20px;
  display:inline-block;
  transition: opacity 0.2s, filter 0.2s;
}

@keyframes timer-spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
.
`;
