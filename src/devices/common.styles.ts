import {css} from 'lit';

export default css`
.device_bg{
    position: relative;
    top: 0;
    left : 0;
    width: 100%;
    aspect-ratio: 1/1.2;
    }

.device_img{
    position: relative;
    top: 0;
    left : 0;
    width: 100%;
    }

.device_img_disabled{
    position: relative;
    top: 0;
    left : 0;
    width: 100%;
    filter: grayscale(80%);
    }

.disabled_in_ha{
  color: white;
  text-align: center;
  position : absolute;
  width: 100%;
  top:15%;
  left: 0%;
  background-color:rgba(255,0,0,0.5);
}
`
;
