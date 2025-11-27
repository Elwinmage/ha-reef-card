import {css} from 'lit';

export default css`

.supplement_info{
position :absolute;
aspect-ratio: 1/2.6;
width : 62%;
top: 49%;
left: 2%;
border-radius: 30px;
}


.manual_dose_head{
 position: absolute;
aspect-ratio: 1/1;
width: 15%;
border-radius: 50%;
top: 5%;
left: 33%;
}

.pump_state_head{
 position: absolute;
 aspect-ratio: 1/1;
 width: 55%;
 border-radius: 50%;
 top: 10%;
 left: 35%;
  display:grid;
#grid-template-columns: repeat(1, 1fr);
grid-template-columns: 1;
grid-template-rows: 3;

  grid-gap: 0px;
//  grid-auto-rows: minmax(100px, auto);
}

.container{
position: absolute;
top: 41%;
width: 68%;
aspect-ratio: 1/3;
}

img{
 position: absolute;
 width: 100%;
}

.pipe{
  flex: 0 0 auto;
  position: absolute;
  width: 70%;
  top: 32%;
  left: 30%;
//  border : 3px solid gray;
  }

svg{
stroke: black;
}

.manual_head_volume{
position: absolute;
width: 60%;
top: 0%;
left: 20%;
}


`;
