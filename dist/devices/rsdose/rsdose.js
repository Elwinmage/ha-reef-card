import { html,css } from "../../lit-core.min.js";
import RSDevice from "../device.js";

/*
 * RSDose 
 */
export default class RSDose extends RSDevice{

    constructor(device){
	super(device);
	this.heads_nb=parseInt((this.model.charAt(this.model.length-1)));
	this.heads = [1,2,3,4];
	console.log("RSDOSE with "+this.heads_nb+" heads");
    }


    _pipe_path(head){
	var primary_path="M 14.109476,0.60284517 C 13.398889,12.288973 10.29951,18.485597 6.8080681,25.368429 1.2164051,34.290687 0.87427411,44.462833 0.69067311,54.672725 L 12.136122,54.376722 c 0.190393,-8.00341 -0.158639,-15.95778 5.624057,-24.469581 4.28096,-8.58966 8.207356,-17.450457 8.090748,-29.40296283 z";
	switch (head){
	case 2:
	    primary_path="M 14,0.5 L 13 46 26 46 26 0 z";
	    break;
	case 3:
	    primary_path="M 14,0.5 L 13 40 26 40 26 0 z";
	    break;
	case 4:
	    primary_path="M 14,0.5 L 13 35 26 35 26 0 z";
	    break;
	case 1:
	default:
	    break;
	}
	return html`
		<svg class="pipe${head}" viewBox="0 0 86 56">
		    <path d="m 62.318421,1.8956482 1.39537,38.7913268 c 0.54297,1.680866 1.22439,3.292504 2.50465,4.604726 1.91092,2.04122 2.58392,1.568144 3.77452,1.674446 1.93472,-0.02183 3.81496,0.365021 6.0001,-1.534909 1.87295,-1.809 1.39537,-4.558213 2.09305,-6.83732 l 5.72102,-25.814373 -7.95361,-1.395371 -3.34889,8.093154 0.27907,-17.8607538 z"></path>
		    <path d=${primary_path}></path>
		</svg>
`;
    }

    _render_head(head){
	if (head <= this.heads_nb){
	    return html`
		<img class="container${head}" src='/local/community/ha-reef-card/devices/rsdose/img/redsea_foundation_A.png'/>
   	        <div class="mask${head}">
 		  ${this._pipe_path(head)}
		</div>
                <span id="manual_dose_${head}" class="head_${head}"> </span>
                <span id="pump_state_${head}" class="head_${head}"> </span>
   	    `;
	}
    }
    
    render(){
	return html`
	<div class="bg">
	  <img class="device_map" id="rsdose4_img" alt=""  src='/local/community/ha-reef-card/devices/rsdose/img/RSDOSE4.png' />
	  ${Array.from({length:4},(x,i) => i+1).map(head => this._render_head(head))}
	</div>`;

    }
}


/*
 * CSS
 */
export const style_rsdose = css`

    .bg{
    position: relative;
    top: 0;
    left : 0;
    width: 100%;
    aspect-ratio: 1/1;
    border: 3px gray solid;
    }

    .device_map{
    position: relative;
    top: 0;
    left : 0;
    width: 100%;
    border: 1px black solid;
    }

    .container1{
    flex: 0 0 auto;
    width:20%;
    position: absolute;
    top: 43%;
    left: 1%;
    }

    .container2{
    flex: 0 0 auto;
    width: 20%;
    position: absolute;
    top: 43%;
    left: 21%;
    }

    .container3{
    flex: 0 0 auto;
    position: absolute;
    width: 20%;
    top: 43%;
    left: 41%;
    }
    
    .container4{
    flex: 0 0 auto;
    position: absolute;
    width: 20%;
    top: 43%;
    left: 61%;
    }

    .mask1{
    flex: 0 0 auto;
    width: 17%;
    position: absolute;
    top: 35%;
    left: 10%;
    }

    .mask2{
    flex: 0 0 auto;
    width: 17%;
    position: absolute;
    top: 36%;
    left: 28%;
    transform: scale(1.1);
    }

    .mask3{
    flex: 0 0 auto;
    width: 17%;
    position: absolute;
    top: 37%;
    left: 48%;
    transform: scale(1.2);
    }
    
    .mask4{
    flex: 0 0 auto;
    width: 17%;
    position: absolute;
    top: 38%;
    left: 69%;
    transform: scale(1.3);
    }

    #manual_dose_1{
    flex: 0 0 auto;
    width:5%;
    aspect-ratio: 1/1;
    border-radius: 50%;
    position:absolute;
    left: 10%;
    top: 7%;
    }

#pump_state_1{
    flex: 0 0 auto;
    width:15%;
    aspect-ratio: 1/1;
    border-radius: 50%;
    position:absolute;
    left: 10%;
    top: 12%;
 
}

.head_1:hover {
   background-color: rgb(140, 67, 148, 0.4);
}

.pipe1 {
    fill: rgb(140,67,148);
}

#manual_dose_2{
    flex: 0 0 auto;
    width: 5%;
    aspect-ratio: 1/1;
    border-radius: 50%;
    position:absolute;
    left: 28%;
    top: 7%;
    }

#pump_state_2{
    flex: 0 0 auto;
    width:15%;
    aspect-ratio: 1/1;
    border-radius: 50%;
    position:absolute;
    left: 28%;
    top: 12%;
}

.head_2:hover {
   background-color: rgb(0, 129, 197, 0.4);
}

    .pipe2 {
    fill: rgb(0,129,197);
    }


#manual_dose_3{
    flex: 0 0 auto;
    width: 5%;
    aspect-ratio: 1/1;
    border-radius: 50%;
    position:absolute;
    left: 47%;
    top: 7%;
    }

#pump_state_3{
    flex: 0 0 auto;
    width:15%;
    aspect-ratio: 1/1;
    border-radius: 50%;
    position:absolute;
    left: 48%;
    top: 12%;
}

.head_3:hover {
   background-color: rgb(0, 130, 100, 0.4);
}

    .pipe3 {
    fill: rgb(0,130,100);
    }
    


#manual_dose_4{
    flex: 0 0 auto;
    width: 5%;
    aspect-ratio: 1/1;
    border-radius: 50%;
    position:absolute;
    left: 67%;
    top: 6%;
    }

#pump_state_4{
    flex: 0 0 auto;
    width:15%;
    aspect-ratio: 1/1;
    border-radius: 50%;
    position:absolute;
    left: 70%;
    top: 11%;
}

.head_4:hover {
   background-color: rgb(100, 160, 75, 0.4);
}
    .pipe4 {
    fill: rgb(100,160,75);
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

    
`
