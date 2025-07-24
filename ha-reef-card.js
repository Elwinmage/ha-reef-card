import {
    LitElement,
    html,
    css,
} from "https://unpkg.com/lit-element@2.0.1/lit-element.js?module";

function loadCSS(url) {
    const link = document.createElement("link");
    link.type = "text/css";
    link.rel = "stylesheet";
    link.href = url;
    document.head.appendChild(link);
}

class ReefCard extends LitElement {

    static get properties() {
	return {
	    hass: {},
	    config: {},
	    leds: {type: Array},
	    current_led: {type: String},
	    version: {type: String},
	    progs: {type: Array}
	    
	};
    }

    constructor() {
	super();
	this.version='v0.0.1';
	this.leds=[{value:'unselected',text:"Select a LED"}];
	this.current_led='';
	this.first_init=true;
	this.progs=[];
	this.colors=['white','blue','moon'];
    }
    
    render() {
	console.log(" -- render()");
	if(this.first_init==true){
	    console.log(" -- render.first_init()");
	    this.init_leds();
	    this.first_init=false;
	}

	return html`
          ${this.led_select()}
    `;
    }

    led_select(){
	return html`
        <select id="led" @change="${this.onChange}">
            ${this.leds.map(option => html`
            <option value="${option.value}" ?selected=${this.leds === option.value}>${option.text}</option>
            `)}
        </select>
<div id="colors" class="hidden">
  <select id="color_mode" @change="${() => this.onChangeColorMode()}">
    <option value="auto">Automatique</option>
    <option value="manual">Manual</option>
  </select><br />
  <select id="color_values">
    <option value="12">12.000K</option>
    <option value="15">15.000K</option>
    <option value="20">20.000K</option>
    <option value="23">23.000K</option>
  </select>
${this.colors.map((i) => html`${this.display_led_conf(i)} `)}
</div>
    `;
    }


    display_led_conf(id){
	return html`
<div id="${id}" class="led_conf">
  <h2>${id}</h2>
  Rise: <input type="number" max="24" min="0" id="${id}_rise_h"></input> : <input type="number" min=0 max=59 id="${id}_rise_m"></input><br />
  Set:  <input type="number" min=0 max=24  id="${id}_set_h"></input> : <input type="number"  min=0 max=59 id="${id}_set_m"></input><br />
  <div id="${id}_points" class="hidden">
  </div>
</div>
`;
    }
    

    led_point(color,point){
	return html `Point 0: <input type="number" min=0 max=24 size=2 id="${color}_point_0_h"></input> : <input type="number" min=0 max=59 id="${color}_point_0_m"></input> Intensity<input type="number" min=0 max=100></input>%<br />`;
    }

    // Display form to edit colors points values
    edit_points(color){
	var rise=parseInt(this.progs[0].attributes.data[color].rise);
	var points=this.progs[0].attributes.data[color].points;
	console.log("edit_points");
	console.log(points);
	var elt=this.shadowRoot.getElementById(color+"_points");
	var ul = this.shadowRoot.createElement("ul");
	elt.appendChild(ul);
	for (let point  in points){
	    let values=points[point];
	    console.log(values);
	    //elt.append(this.led_point(color,point));
	    let li = this.shadowRoot.createElement("li");
	    li.setAttribute("id",color+"_point_"+point);
	    /*var name=document.createTextNode("Point "+point);
	    li.appendChild(name);*/
	    let input_h=this.shadowRoot.createElement("input");
	    input_h.setAttribute("type","number");
	    input_h.setAttribute("id",color+"_point_"+point+"_h");
	    input_h.setAttribute("min","0");
	    input_h.setAttribute("max","24");
	    input_h.setAttribute("size","2");
	    input_h.setAttribute("value",this.minutes_to_hours(rise + parseInt(values["t"])));
	    li.appendChild(input_h);
	    let separator= document.createTextNode(" : ");
	    li.appendChild(separator);
	    let input_m=this.shadowRoot.createElement("input");
	    input_m.setAttribute("type","number");
	    input_m.setAttribute("id",color+"_point_"+point+"_m");
	    input_m.setAttribute("min","0");
	    input_m.setAttribute("max","59");
	    input_m.setAttribute("size","2");
	    input_m.setAttribute("value",this.minutes_to_minutes(rise+parseInt(values["t"])));	    
	    li.appendChild(input_m);
	    let input_i=this.shadowRoot.createElement("input");
	    input_i.setAttribute("type","number");
	    input_i.setAttribute("id",color+"_point_"+point+"_i");
	    input_i.setAttribute("min","0");
	    input_i.setAttribute("max","100");
	    input_i.setAttribute("size","3");
	    input_i.setAttribute("value",values["i"]);
	    li.appendChild(input_i);
	    let s_percent= document.createTextNode("%");
	    li.appendChild(s_percent);
	    let delete_button = this.shadowRoot.createElement("input");
	    delete_button.setAttribute("type","button");
	    delete_button.setAttribute("Value","delete");
	    delete_button.setAttribute("id",color+"_delete_point_"+point);
	    console.log(point);
	    delete_button.onclick=()=>this.delete_point(color,point,this.progs[0].attributes.data,li);
	    li.appendChild(delete_button);
	    ul.appendChild(li);
	    if(color=="moon"){
		let div_points_b=this.shadowRoot.getElementById ( "moon_points" ).style.display="block";
	    }
    
	}
	let add_button = this.shadowRoot.createElement("input");
	add_button.setAttribute("type","button");
	add_button.setAttribute("Value","new");
	add_button.setAttribute("id",color+"_add_point");
	add_button.onclick=()=>this.add_point(color,this.progs[0].attributes.data,ul);
	let li_add = this.shadowRoot.createElement("li");
	li_add=elt.appendChild(add_button);
    }


    delete_point(color,point,prog,elt){
	console.log(color);
	console.log(point);
	console.log(prog);
	elt.remove();
	prog[color]['points'].splice(point,1);
    }

    
    add_point(color, prog,list){
	let li = this.shadowRoot.createElement("li");
	let point=prog[color]['points'].length;
	let values={"t":0,"i":0};
	prog[color]['points'].push(values);
	li.setAttribute("id",color+"_point_"+point);
	let input_h=this.shadowRoot.createElement("input");
	input_h.setAttribute("type","number");
	input_h.setAttribute("id",color+"_point_"+point+"_h");
	input_h.setAttribute("min","0");
	input_h.setAttribute("max","24");
	input_h.setAttribute("size","2");
	input_h.setAttribute("value","");
	li.appendChild(input_h);
	let separator= document.createTextNode(" : ");
	li.appendChild(separator);
	let input_m=this.shadowRoot.createElement("input");
	input_m.setAttribute("type","number");
	input_m.setAttribute("id",color+"_point_"+point+"_m");
	input_m.setAttribute("min","0");
	input_m.setAttribute("max","59");
	input_m.setAttribute("size","2");
	input_m.setAttribute("value","");
	li.appendChild(input_m);
	let input_i=this.shadowRoot.createElement("input");
	input_i.setAttribute("type","number");
	input_i.setAttribute("id",color+"_point_"+point+"_i");
	input_i.setAttribute("min","0");
	input_i.setAttribute("max","100");
	input_i.setAttribute("size","3");
	input_i.setAttribute("value","");
	li.appendChild(input_i);
	let s_percent= document.createTextNode("%");
	li.appendChild(s_percent);
	let delete_button = this.shadowRoot.createElement("input");
	delete_button.setAttribute("type","button");
	delete_button.setAttribute("Value","delete");
	delete_button.setAttribute("id",color+"_delete_point_"+point);
	console.log("Adding: "+color+"_point_"+point);
	delete_button.onclick=()=>this.delete_point(color,point,this.progs[0].attributes.data,li);
	li.appendChild(delete_button);
	list.appendChild(li);
    }

    
    init_leds(){
	for (var device_id in this.hass.devices){
	    console.log(this.hass.devices[device_id])
	    let dev=this.hass.devices[device_id].identifiers[0];
	    if (Array.isArray(dev) && dev[0]=='redsea'){// && this.hass.devices[device_id].model=="RSLED160"){
		console.log(device_id);
		this.leds.push({value:device_id,text:this.hass.devices[device_id].name});
		if (this.current_led == ''){
		    this.current_led=device_id;
		}
	    }
	}
    }

    onChangeColorMode(){
	this.selected = this.shadowRoot.getElementById("color_mode").value;
	var div_color_values=this.shadowRoot.getElementById ( "color_values" );
	var div_points_w=this.shadowRoot.getElementById ( "white_points" );
	var div_points_b=this.shadowRoot.getElementById ( "blue_points" );
	if(this.selected=="auto"){
	    div_color_values.style.display="block";
	    div_points_w.style.display="none";
	    div_points_b.style.display="none";
	}
	else{
	    for (var color in this.colors){
		var c=this.colors[color];
		//		this.shadowRoot.getElementById(c+"_points").removeChildren();
		this.shadowRoot.getElementById(c+"_points").textContent='';
		this.edit_points(c);
	    }
	    div_color_values.style.display="none";
	    div_points_w.style.display="block";
	    div_points_b.style.display="block";
	}
    }
    
    onChange(){
	setTimeout(()=>{ 
	    this.selected = this.shadowRoot.querySelector('#led').value;
	    var div_color=this.shadowRoot.getElementById ( "colors" ) ;
	    if (this.selected=="unselected"){
		console.log('Nothing selected');
		div_color.style.display="none";
	    }
	    else{
		console.log('Selected -->', this.selected );
		var entities=this.hass.entities;
		div_color.style.display="block";
		for (var entity in entities){
		    var e=entities[entity];
		    if(e.device_id==this.selected && String(e.entity_id).startsWith('sensor.') && this.hass.states[e.entity_id].attributes.hasOwnProperty('clouds')){
			console.log("  - "+e.entity_id);
			this.progs.push(this.hass.states[e.entity_id]);
		    }
		}
		let prog=this.progs[0];
		let rise=prog.attributes.data.white.rise;
		
		for (var color in this.colors) {
		    let c_name=this.colors[color];
		    this.shadowRoot.getElementById(c_name+"_rise_h").value=this.minutes_to_hours(prog.attributes.data[c_name].rise);
		    this.shadowRoot.getElementById(c_name+"_rise_m").value=this.minutes_to_minutes(prog.attributes.data[c_name].rise);
		    this.shadowRoot.getElementById(c_name+"_set_h").value=this.minutes_to_hours(prog.attributes.data[c_name].set);
		    this.shadowRoot.getElementById(c_name+"_set_m").value=this.minutes_to_minutes(prog.attributes.data[c_name].set);
    		}
		this.edit_points("moon");
		this.shadowRoot.getElementById ( "moon_points" ).style.display="block";

	    }
	},300)
	
    }

    minutes_to_time(mins){
	return Math.floor((mins/60)%24).toString().padStart(2,"0")+":"+(mins%60).toString().padStart(2,"0");
    }

    minutes_to_hours(mins){
	return Math.floor((mins/60)%24).toString().padStart(2,"0");
    }

    minutes_to_minutes(mins){
	return (mins%60).toString().padStart(2,"0");
    }


    
    selectId(){
	return this.version;
    }
    
    setConfig(config) {
	// if (!config.entities) {
	//   throw new Error("You need to define entities");
	//   }
	//   this.config = config;
	
    }

    // The height of your card. Home Assistant uses this to automatically
    // distribute all cards over the available columns.
    getCardSize() {
	return this.config.entities.length + 1;
    }

    static get styles() {
	return css`
      :host {
#        font-family: "Gloria Hallelujah", cursive;
      }
      wired-card {
        background-color: white;
        padding: 16px;
        display: block;
        font-size: 18px;
      }

div.hidden{
display: none;
}

      .state {
        display: flex;
        justify-content: space-between;
        padding: 8px;
        align-items: center;
      }
      .not-found {
        background-color: yellow;
        font-family: sans-serif;
        font-size: 14px;
        padding: 8px;
      }
      wired-toggle {
        margin-left: 8px;
      }
    `;
    }
}
customElements.define("reef-card", ReefCard);
