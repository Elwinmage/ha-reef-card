import {css} from 'lit';

export default css`

.sensor{
  border-radius: 30px;
  text-align: center;
  padding-left: 5px;
  padding-right: 5px;
  width: 60%;
margin-left:10%;
}

sensor{
  border-radius: 30px;
  text-align: center;
  padding-left: 5px;
  padding-right: 5px;
}

.scheduler_label_top{
  text-align: center;
//border: 1px solid blue;
grid-column: 1;
grid-row: 1;
color: rgb(250,230,130);
font-weight: bold;
}

.scheduler_label_middle{
text-align:center;
 color: white;
//border: 1px solid blue;
grid-column: 1;
grid-row: 2;
font-weight: bold;
}

.scheduler_label_bottom{
text-align:center;
//border: 1px solid blue;
color: rgb(130,230,250);
grid-column: 1;
grid-row: 3;
font-weight: bold;
}

span.unit{
font-size: 0.6em;
}
`;
