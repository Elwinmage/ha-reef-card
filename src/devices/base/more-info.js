import { html } from "lit";

import style_moreinfo from "./more-info.styles";

import MyElement from "./element";

/*
 *  MoreInfo
 */
class MoreInfo extends  MyElement {

    static styles = style_moreinfo;

        static get properties(){
	return {
	    _hass:{},
	    shadowRoot:{}
	};
    }

    /*
     * conf the conf in mapping file
     * stateObj the hass element 
     */
    constructor(){
 	super(null);
    }//end of constructor


    init(hass,shadowRoot){
	this._hass = hass;
	this._shadowRoot=shadowRoot;
    }//end of constructor

    set hass( obj ) {
	this._hass = obj; // Don't set it to the same name or you'll cause an infinite loop
	// Add code here that handles a change in the hass object
    }

    display(title,content){
	let more_info=this._shadowRoot.querySelector("#window-mask");
//	more_info.hidden=false;
	let more_info_head=this._shadowRoot.querySelector("#moreinfo-title");
	more_info_head.innerHTML=title;
	let more_info_content=this._shadowRoot.querySelector("#moreinfo-content");
	//more_info_content.innerHTML=content;
	let config={'entity-id':"button.rsdose4_2759459771_fetch_config"}
	more_info_content.innerHTML='<hui-generic-entity-row .hass="${this._hass}" .config="${config}" no-secondary/>';
	more_info.style.display="flex";
	
    }//end of function display
    
    render(){
	//console.debug("MoreInfo render: ");
	return html`
          <div id="window-mask" hidden>
   	    <div id="moreinfo">
Hello i'm here
              <div id="moreinfo-close">X</div>
              <div id="moreinfo-title">Head</div>
              <div id="moreinfo-content"></div>
            </div>
         </div>
`;
    }//end of function render

    async _click(e){
	console.debug("Click ",e.detail," ",e.timeStamp);
    }

    async _longclick(e){
	console.debug("Long Click");
    }//end of function longclick
    
    async _dblclick(e){
	console.debug("Double click");
    }//end of function dblclick
    

}// end of class

window.customElements.define('my-moreinfo', MoreInfo);

var moreinfo = new MoreInfo();
export default moreinfo;
