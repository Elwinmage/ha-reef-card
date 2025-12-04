import {css} from 'lit';

export default css`

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

svg{
stroke: black;
}

.manual_head_volume{
position: absolute;
width: 60%;
top: 0%;
left: 20%;
}

img.warning{
width: 40%;
position: absolute;
left: 18%;
top: 60%;
    animation: blink 1s;
    animation-iteration-count: infinite;
}

@keyframes blink {
    0% {
        opacity: 1;
    }
    50% {
        opacity: 0;
    }
    100% {
        opacity: 1;
    }
}

`;
