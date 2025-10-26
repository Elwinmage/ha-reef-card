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
left: 50%;
top: -75%;
aspect-ratio: 1/1;
border-radius: 30px;
background-color: rgba(250,250,250,1);
//border: 1px solid red;
width: 60%;
}

.switch_in_off{
position :absolute;
left: -10%;
top: -75%;
aspect-ratio: 1/1;
border-radius: 30px;
background-color: rgba(255,20,20,1);
//border: 1px solid red;
width: 60%;
}


`;
