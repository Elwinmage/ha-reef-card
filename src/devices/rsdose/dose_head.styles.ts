import {css} from 'lit';

export default css`
svg{
stroke: black;
}

.addSupplement{
  color:red;
  position:absolute;
  width:60%;
  bottom:15%;
  left:30%;
  text-align:center;
  text-decoration: none;
  animation:blink 1s linear infinite;
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

img{
 position: absolute;
 width: 100%;
}
`;
