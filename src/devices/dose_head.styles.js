import {css} from 'lit';

export default css`

img{
 position: absolute;
 width: 100%;
}

svg{
stroke: black;
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
