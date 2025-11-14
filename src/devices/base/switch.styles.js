import {css} from 'lit';

export default css`

:hover{
cursor: pointer;
}

.switch_on{
position :absolute;
border-radius: 30px;
background-color: rgba(255,10,10,0.5);
border: 1px solid red;
width: 100%;
height: 100%;
}

.switch_off{
position :absolute;
border-radius: 30px;
background-color: rgba(175,175,175,0.5);
//border: 1px solid red;
width: 100%;
height: 100%;
}

.switch_in_on{
position :absolute;
left: 38%;
top: -20%;
aspect-ratio: 1/1;
border-radius: 30px;
background-color: rgba(250,250,250,1);
//border: 1px solid red;
width: 60%;
}

.switch_in_off{
position :absolute;
left: 0%;
top: -25%;
aspect-ratio: 1/1;
border-radius: 30px;
background-color: rgba(255,20,20,1);
//border: 1px solid red;
width: 60%;
}

//RSDOSE
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

.switch_button{
aspect-ratio: 1/1;
width: 100%;
height:100%;
 border-radius: 50%;
 color: white;
 text-align:center;
};


`;
