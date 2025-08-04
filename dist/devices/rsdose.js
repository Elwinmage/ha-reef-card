import { html,css } from "../lit-core.min.js";
import RSDevice from "./device.js";
import {config} from "./mapping/RSDOSE4.js";

/*
 * RSDose 
 */
export default class RSDose extends RSDevice{

    constructor(hass,device){
				super(hass,device,config);
    }

    _populate_entities(){
				this.entities=[{},{},{},{},{}];
				for (var entity_id in this.hass.entities){
						var entity=this.hass.entities[entity_id];
						for (var d of this.device.elements){
								var fname=d['name'].split("_");
								var head_id=0;
								if (fname[fname.length  - 2 ] == "head"){
										head_id=parseInt(fname[fname.length-1]);
								}
								if(entity.device_id == d.id){
										this.entities[head_id][entity.translation_key]=entity;
								}
								
						}
				}
				
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
				let hd= this.conf.heads['head_'+head];
				let color = hd.color;
				return html`
		<svg viewBox="0 0 86 56" style="fill :rgb(${color});">
		    <path d="m 62.318421,1.8956482 1.39537,38.7913268 c 0.54297,1.680866 1.22439,3.292504 2.50465,4.604726 1.91092,2.04122 2.58392,1.568144 3.77452,1.674446 1.93472,-0.02183 3.81496,0.365021 6.0001,-1.534909 1.87295,-1.809 1.39537,-4.558213 2.09305,-6.83732 l 5.72102,-25.814373 -7.95361,-1.395371 -3.34889,8.093154 0.27907,-17.8607538 z"></path>
		    <path d=${primary_path}></path>
		</svg>
`;
    }


		_render_container(head,container){
				let supplement=this.hass.states[this.entities[head]['supplement'].entity_id];
				let supplement_uid=this.hass.states[this.entities[head]['supplement_uid'].entity_id];
				let img=null;
				console.log(supplement_uid);

				switch (supplement_uid.state){
				case "7d67412c-fde0-44d4-882a-dc8746fd4acb":
						img='/local/community/ha-reef-card/devices/img/redsea_foundation_A.png';
						break;
				case "76830db3-a0bd-459a-9974-76a57d026893":
						img='/local/community/ha-reef-card/devices/img/redsea_foundation_B.png';
						break;
				case "f524734e-8651-496e-b09b-640b40fc8bab":
						img='/local/community/ha-reef-card/devices/img/redsea_foundation_C.png';
						break;
				default:
						img='/local/community/ha-reef-card/devices/img/generic_container.png';
						break;
				}
				return html`
		<img class="container" style="width:${container.width}%;top:${container.top}%;left:${container.left}%;" src='${img}'/>
				`;
		}
		
		_render_action(action){
        return html`
<span id="${action.name}" class="action" style="width:${action.width}%;top:${action.top}%;left:${action.left}%;border-radius:${action.border_radius}%;"> </span>
`;
		}
		
    _render_head(head){
				if (head <= this.conf.heads_nb){
						let hd= this.conf.heads['head_'+head];
						return html`
${this._render_container(head,hd.container)}
   	        <div class="mask${head}">
 		  ${this._pipe_path(head)}
		</div>
${hd.actions.map(action => this._render_action(action))}

   	    `;
				}
    }
    
    render(){
				return html`
	<div class="bg">
	  <img class="device_map" id="rsdose4_img" alt=""  src='/local/community/ha-reef-card/devices/img/RSDOSE4.png' />
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
    }

    .device_map{
    position: relative;
    top: 0;
    left : 0;
    width: 100%;
    }

    .container{
    flex: 0 0 auto;
    position: absolute;
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

.action{
    flex: 0 0 auto;
    aspect-ratio: 1/1;
    position:absolute;
}

.action:hover{
background-color:rgba(250,0,0,0.5);
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
