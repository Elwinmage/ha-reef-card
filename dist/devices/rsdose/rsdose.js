import { html,css } from "../../lit-core.min.js";

/*
 * RSDose 
 */
export default class RSDose {

    constructor(device){
	this.device = device
	this.model=this.device.elements[0].model
	this.name=this.device.elements[0].name
	this.heads_nb=parseInt((this.model.charAt(this.model.length-1)));
	console.log("RSDOSE with "+this.heads_nb+" heads");
    }

    get_img(){
	      return "/local/community/ha-reef-card/devices/rsdose/img/"+this.model+".png";
    }

    get_model(){
	      return this.model;
    }



    render(){
	return html`

<div class="bg">
  <div class="device">
    <img class="device_map" id="redose4_img" alt=""  src='/local/community/ha-reef-card/devices/rsdose/img/RSDOSE4.png' usemap="#zones-reactives" />
    <map name="zones-reactives" id="mymap">
      <area shape="circle" coords="156,139,50" alt="toto" href="rouge.png" title="manual_head_1"/>
    </map>
     <span class="dot"> </span>

    <div class="container1">
      <img src='/local/community/ha-reef-card/devices/rsdose/img/redsea_foundation_A.png'/>
    </div>
    <div class="container2">
      <img src='/local/community/ha-reef-card/devices/rsdose/img/redsea_foundation_B.png'/>
    </div>
    <div class="container3">
      <img src='/local/community/ha-reef-card/devices/rsdose/img/redsea_foundation_C.png'/>
    </div>
    <div class="container4">
      <img src='/local/community/ha-reef-card/devices/rsdose/img/redsea_foundation_C.png'/>
    </div>
    <div class="mask">
      <svg class="c1">
	<path
	  d="m 62.318421,1.8956482 1.39537,38.7913268 c 0.54297,1.680866 1.22439,3.292504 2.50465,4.604726 1.91092,2.04122 2.58392,1.568144 3.77452,1.674446 1.93472,-0.02183 3.81496,0.365021 6.0001,-1.534909 1.87295,-1.809 1.39537,-4.558213 2.09305,-6.83732 l 5.72102,-25.814373 -7.95361,-1.395371 -3.34889,8.093154 0.27907,-17.8607538 z"/>
	<path
	  d="M 14.109476,0.60284517 C 13.398889,12.288973 10.29951,18.485597 6.8080681,25.368429 1.2164051,34.290687 0.87427411,44.462833 0.69067311,54.672725 L 12.136122,54.376722 c 0.190393,-8.00341 -0.158639,-15.95778 5.624057,-24.469581 4.28096,-8.58966 8.207356,-17.450457 8.090748,-29.40296283 z"/>
      </svg>
    </div>
    <div class="mask2">
      <svg class="c2">
	<path
	  d="m 62.318421,1.8956482 1.39537,38.7913268 c 0.54297,1.680866 1.22439,3.292504 2.50465,4.604726 1.91092,2.04122 2.58392,1.568144 3.77452,1.674446 1.93472,-0.02183 3.81496,0.365021 6.0001,-1.534909 1.87295,-1.809 1.39537,-4.558213 2.09305,-6.83732 l 5.72102,-25.814373 -7.95361,-1.395371 -3.34889,8.093154 0.27907,-17.8607538 z"/>
	<path
	  d="M 14.109476,0.60284517 C 13.398889,12.288973 10.29951,18.485597 6.8080681,25.368429 1.2164051,34.290687 0.87427411,44.462833 0.69067311,54.672725 L 12.136122,54.376722 c 0.190393,-8.00341 -0.158639,-15.95778 5.624057,-24.469581 4.28096,-8.58966 8.207356,-17.450457 8.090748,-29.40296283 z"/>
      </svg>
    </div>
    <div class="mask3">
      <svg class="c3">
	<path
	  d="m 62.318421,1.8956482 1.39537,38.7913268 c 0.54297,1.680866 1.22439,3.292504 2.50465,4.604726 1.91092,2.04122 2.58392,1.568144 3.77452,1.674446 1.93472,-0.02183 3.81496,0.365021 6.0001,-1.534909 1.87295,-1.809 1.39537,-4.558213 2.09305,-6.83732 l 5.72102,-25.814373 -7.95361,-1.395371 -3.34889,8.093154 0.27907,-17.8607538 z"/>
	<path
	  d="M 14.109476,0.60284517 C 13.398889,12.288973 10.29951,18.485597 6.8080681,25.368429 1.2164051,34.290687 0.87427411,44.462833 0.69067311,54.672725 L 12.136122,54.376722 c 0.190393,-8.00341 -0.158639,-15.95778 5.624057,-24.469581 4.28096,-8.58966 8.207356,-17.450457 8.090748,-29.40296283 z"/>
      </svg>
    </div>
    <div class="mask4">
      <svg class="c4">
	<path
	  d="m 62.318421,1.8956482 1.39537,38.7913268 c 0.54297,1.680866 1.22439,3.292504 2.50465,4.604726 1.91092,2.04122 2.58392,1.568144 3.77452,1.674446 1.93472,-0.02183 3.81496,0.365021 6.0001,-1.534909 1.87295,-1.809 1.39537,-4.558213 2.09305,-6.83732 l 5.72102,-25.814373 -7.95361,-1.395371 -3.34889,8.093154 0.27907,-17.8607538 z"/>
	<path
	  d="M 14.109476,0.60284517 C 13.398889,12.288973 10.29951,18.485597 6.8080681,25.368429 1.2164051,34.290687 0.87427411,44.462833 0.69067311,54.672725 L 12.136122,54.376722 c 0.190393,-8.00341 -0.158639,-15.95778 5.624057,-24.469581 4.28096,-8.58966 8.207356,-17.450457 8.090748,-29.40296283 z"/>
      </svg>
    </div>
  </div>
</div>
`
    }
}






/*
 * CSS
 */
export const style_rsdose = css`

.bg{
  display: flex;
  justify-content: center;
  align-items: center;
}


.container1{
flex: 0 0 auto;
width: 86px;
height: 56px;
position: absolute;
top: +298px;
left: -23px;
transform: scale(0.3);
}

.container2{
flex: 0 0 auto;
width: 86px;
height: 56px;
position: absolute;
top: +305px;
left: 62px;
transform: scale(0.31);
}

.container3{
flex: 0 0 auto;
width: 86px;
height: 56px;
position: absolute;
top: +313px;
left: 155px;
transform: scale(0.32);
}
.container4{
flex: 0 0 auto;
width: 86px;
height: 56px;
position: absolute;
top: +322px;
left: 258px;
transform: scale(0.33);
}

.mask{
flex: 0 0 auto;
width: 86px;
height: 56px;
position: absolute;
top: +272px;
left: 40px;
}

.mask2{
flex: 0 0 auto;
width: 86px;
height: 56px;
position: absolute;
top: +276px;
left: 130px;
transform: scale(1.1);
}

.mask3{
flex: 0 0 auto;
width: 86px;
height: 56px;
position: absolute;
top: +282px;
left: 230px;
transform: scale(1.2);
}
.mask4{
flex: 0 0 auto;
width: 86px;
height: 56px;
position: absolute;
top: +288px;
left: 335px;
transform: scale(1.3);
}

.dot{
height: 30px;
  width: 30px;
  background-color: rgba(200,200,200,0.5);
  border-radius: 50%;
  display: inline-block;

}
.dot:hover{
  background-color: rgba(255,0,0,0.5);
}


.action1{
flex: 0 0 auto;
width:20px;
height:20px;
background-color:rgba(255,0,0,1);
position: absolute;
top: +136px;
left: 43px;
transform: scale(1);
clip-path: circle(50px);
}

}

  p.RSDOSE4{
    color: red;
  }

  img.RSDOSE4 {
    width: 200px;
  }

svg {
stroke: black;
}

.c1 {
  fill: green;
}
.c2 {
  fill: red;
}

.c3 {
  fill: yellow;
}
.c4 {
  fill: purple;
}

`
