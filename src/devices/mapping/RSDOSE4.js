export const config = {
    "name": null,
    "model": "RSDOSE4",
    "background_img": new URL("../img/RSDOSE4.png",import.meta.url),
    "heads_nb": 4,
    "dialogs": {
	"head_configuration":{
	    "name":"head_configuration",
	    "title_key":"iconv._('head_configuration') +' n°'+ this.elt.device.config.id",
	    "close_cross": true,
	    "content":[
		{
		    "view": "common-button",
		    "conf": {
			"type": "common-button",
			"stateObj": null,
			"icon": "mdi:cup-water",
			"tap_action":{
			    "domain":"redsea_ui",
			    "action":"dialog",
			    "data":{"type":"priming"}
			},
			"label": "iconv._('priming')",
			"class": "dialog_button",
			"css":{
			    
			    "margin-bottom":"5px",
			    "text-align":"center",
			},
			"elt.css":{
			    "background-color":"rgba(0,0,0,0)",
			}
		    },
		},	
		{
		    "view": "common-button",
		    "conf": {
			"type": "common-button",
			"stateObj": null,
			"icon": "mdi:cog-outline",
			"tap_action":{
			    "domain":"redsea_ui",
			    "action":"dialog",
			    "data":{"type":"head_calibration"}
			},
			"label": "iconv._('calibration')",
			"class": "dialog_button",
			"css":{
			},
			"elt.css":{
			    "background-color":"rgba(0,0,0,0)",
			}
		    },
		},
		{
		    "view": "hui-entities-card",
		    "conf":{
			"type":"entities",
			"entities": [
			    {"entity":"daily_dose","name":{"type":"entity"}},
			]
		    }
		},
	
	    ],
	},
	"head_calibration":{
	    "name":"head_calibration",
	    "title_key":"iconv._('calibration') +' n°'+ this.elt.device.config.id",
	    "close_cross": true,
	    "content":[
		{
		    "view": "click-image",
		    "conf":{
			"image":'/hacsfiles/ha-reef-card/head_calibration.png',
			"type": "clic-_image",
			"stateObj":null,
			"tap_action":[],
			"elt.css":{
			    "width":"30%",
			    "margin-left":"35%",
			}
		    }
		},
		{
		    "view": "hui-entities-card",
		    "conf":{
			"type":"entities",
			"entities": [
			    {"entity":"start_calibration","name":{"type":"entity"}},
			    {"entity":"calibration_dose_value","name":{"type":"entity"}},
			    {"entity":"set_calibration_value","name":{"type":"entity"}},
			    {"entity":"test_calibration","name":{"type":"entity"}},
			    {"entity":"end_calibration","name":{"type":"entity"}},
			]
		    }
		},
	    ],
	},
 	"priming":{
	    "name":"priming",
	    "title_key":"iconv._('priming') +' n°'+ this.elt.device.config.id",
	    "close_cross": true,
	    "content":[
		{
		    "view": "click-image",
		    "conf":{
			"image":'/hacsfiles/ha-reef-card/priming.png',
			"type": "clic-_image",
			"stateObj":null,
			"tap_action":[],
			"elt.css":{
			    "width":"30%",
			    "margin-left":"35%",
			}
		    }
		},
		{
		    "view": "hui-entities-card",
		    "conf":{
			"type":"entities",
			"entities": [
			    {"entity":"start_priming","name":{"type":"entity"}},
			    {"entity":"stop_priming","name":{"type":"entity"}},
			]
		    }
		},
	    ],
	    "validate": {
		"label": "iconv._('next')",
		"class": "dialog_button",
		"type": "common-button",
		"stateObj":null,
		"tap_action":[
		    {
			"domain": "redsea_ui",
			"action": "dialog",
			"data": {"type":"head_calibration"},
		    } 
		]
	    }
	},
 	"edit_container":{
	    "name":"edit_container",
	    "extend":"dose_head_dialog",
	    "title_key":"iconv._('dialog_edit_container') +' n°'+ this.elt.device.config.id",
	    "close_cross": false,
	    "content":[
		{
		    "view": "hui-entities-card",
		    "conf":{
			"type":"entities",
			"entities": [
			    {"entity":"slm","name":{"type":"entity"}},
			    {"entity":"save_initial_container_volume","name":{"type":"entity"}},
			    {"entity":"container_volume","name":{"type":"entity"}},
			]
		    }
		},
		{
		    "view": "click-image",
		    "conf":{
			"image":'/hacsfiles/ha-reef-card/trash.svg',
			"type": "clic-_image",
			"stateObj":null,
			"tap_action":[
			    {
				"domain": "redsea_ui",
				"action": "dialog",
				"data": {"type":"delete_container"},
			    } 
			],
			"elt.css":{
			    "position":"absolute",
			    "top":"7%",
			    "right": "5%",
			}
		    }
		},
	    ],
	},
	"delete_container":{
	    "name": "delete_container",
	    "title_key":"iconv._('dialog_delete_supplement_title') +' n°'+ this.elt.device.config.id",
	    "close_cross": false,
	    "content":[],
	    "validate": {
		"label": "iconv._('delete')",
		"class": "dialog_button",
		"type": "common-button",
		"stateObj":null,
		"tap_action":[
		    {
			"domain": "button",
			"action": "press",
			"data": {"entity_id":"delete_supplement"},
		    },
		    {
			"domain": "redsea_ui",
			"action": "exit-dialog",
		    },
		]
	    },
	    "cancel":true,
	},
	"add_supplement":{
	    "name": "add_supplement",
	    "title_key":"iconv._('dialog_add_supplement_title') +' n°'+ this.elt.device.config.id",
	    "close_cross": true,
	    "extend":"dose_head_dialog",
	    "content":[
		{
		    "view": "hui-entities-card",
		    "conf":{
			"type":"entities",
			"entities": [
			    {"entity":"supplements","name":{"type":"entity"}},
			]
		    }
		}
	    ],
	    "validate": {
		"label": "iconv._('next')",
		"class": "dialog_button",
		"type": "common-button",
		"stateObj":null,
		"tap_action":[
		    {
			"domain": "button",
			"action": "press",
			"data": {"entity_id":"set_supplement"},
		    },
		    {
			"domain": "redsea_ui",
			"action": "dialog",
			"data": {"type":"set_container_volume"},
		    } 
		]
	    }
	},
	"set_container_volume":{
	    "name":"set_container_volume",
	    "close_cross": true,
	    "title_key": "iconv._('set_container_volume')",
	    "extend":"dose_head_dialog",
	    "content":[
		{
		    "view": "hui-entities-card",
		    "conf":{
			"type":"entities",
			"entities": [
			    {"entity":"daily_dose","name":{"type":"entity"}},
			    {"entity":"slm","name":{"type":"entity"}},
			    {"entity":"save_initial_container_volume","name":{"type":"entity"}},
			    {"entity":"container_volume","name":{"type":"entity"}},
			]
		    }
		}
	    ],
	    "validate": {
		"label": "iconv._('next')",
		"class": "dialog_button",
		"type": "common-button",
		"stateObj":null,
		"tap_action":[
		    {
			"domain": "redsea_ui",
			"action": "dialog",
			"data": {"type":"priming"},
		    } 
		]
	    }
	    
	},
 	"set_manual_head_volume":{
	    "name": "set_manual_head_volume",
	    "extend":"dose_head_dialog",
	    "title_key": "iconv._('set_manual_head_volume')",
	    "close_cross": true,
	    "content":[
		{"view":"hui-entities-card",
		 "conf":{
		     "type":"entities",
		     "entities":[
			 {"entity":"supplement","name":{"type":"entity"}},
			 {"entity":"manual_head_volume","name":{"type":"entity"}},
			 {"entity":"manual_head","name":{"type":"entity"}},
			 //"manual_head", can also be only a string but display name is full
		     ]}
		},
	    ],
	},
	"auto_dose":{
	    "title_key": "set_auto_dose",
	    "name": "auto_dose",
	    "close_cross": true,
	    "content":[
		{"view":"hui-entities-card",
		 "conf":{
		     "type":"entities",
		     "entities":[
			 {"entity":"daily_dose","name":{"type":"entity"}},
		     ]}
		},
	    ],
	    "validate": {
		"tap_action": {
		    "domain": "redsea_ui",
		    "action": "exit-dialog",
		}
	    }
	}
    },
    "elements": {
	"last_message":{
	    "name": "last_message",
	    "master": true, // If true, the change of state of this element force a device redraw
	    "type":"redsea-messages",
	    "css":{
		"flex": "0 0 auto",
		"position": "absolute",
		"width": "100%",
		"height": "15px",
		"top": "33%",
		"left": "0px",
	    },
	    "elt.css":{
		"background-color": "rgba(220,220,220,0.7)",
	    }
	},
	"last_alert_message":{
	    "name": "last_alert_message",
	    "master": true, // If true, the change of state of this element force a device redraw
	    "type":"redsea-messages",
	    "label":"⚠",
	    /*	    "tap_action": {
		"domain": "switch",
		"action":"toggle",
		"data": "default",
		//"data": {"entity_id":"switch.simu_rsdose4_4647319427_head_4_schedule_enabled"},
	    },*/
	    "css":{
		"color": "red",
		"flex": "0 0 auto",
		"position": "absolute",
		"width": "100%",
		"height": "20px",
		"top": "37%",
		"left": "0px",
	    },
	    "elt.css":{
		"background-color": "rgba(240,200,200,0.7)",
	    }
	},
/*	"device_state2":{
	    "name": "device_state",
	    "master": true, // If true, the change of state of this element force a device redraw
	    "type":"ha-entity-toggle",
	    "stateObj":"device_state",
	    "label":false,
	    "class":"on_off",
	    "style": "switch",
	    "css":{
		"flex": "0 0 auto",
		"position": "absolute",
		"width": "5.5%",
		"height": "2%",
		"border-radius": "50%",
		"top": "28%",
		"left": "2%",
	    }
	},*/
	"device_state":{
	    "name": "device_state",
	    "master": true, // If true, the change of state of this element force a device redraw
	    "type":"common-switch",
	    "label":false,
	    "class":"on_off",
	    "style": "switch",
	    "tap_action": {
		"domain": "switch",
		"action":"toggle",
		"data": "default",
		//"data": {"entity_id":"switch.simu_rsdose4_4647319427_head_4_schedule_enabled"},
	    },
	    "css":{
		"flex": "0 0 auto",
		"position": "absolute",
		"width": "5.5%",
		"height": "2%",
		"border-radius": "50%",
		"top": "28%",
		"left": "2%",
	    }
	},
	"maintenance":{
	    "name": "maintenance",
	    "type":"common-switch",
	    "master": true,
	    "label":false,
	    "class":"on_off",
	    "style": "switch",
	    "tap_action": {
		"enabled": true,
		"domain": "switch",
		"action":"toggle",
		"data": "default",
	    },
	    "css":{
		"flex": "0 0 auto",
		"position": "absolute",
		"width": "5.5%",
		"height": "2%",
		"border-radius": "50%",
		"top": "22%",
		"left": "2%",
	    }
	},
    },
    "dosing_queue":{
	"type": "dosing-queue",
	"name": "dosing_queue",
	"css":{
	    "text-align": "center",
            "border": "1px solid black",
	    "border-radius": "15px",
            "background-color": "rgb(200,200,200)",
            "position": "absolute",
            "width": "12%",
            "height": "45%",
            "left": "88%",
            "top": "45%",
            "font-size": "x-small",
            "overflow-x": "hidden",
            "overflow-y": "auto",
	    "scrollbar-color": "gray rgb(255,255,255,0)",
	},
    },
    "heads": {
	"common" :{
	    "alpha": "0.6",
	    "shortcuts=":"",
	    "css":{
		"top":"0%",
		"left": "50%",
		"position":"absolute",
		"flex":"0 0 auto",
		"width": "31%",
		"height": "100%",
	    },
	    "container":{
		"css":{
		    "position": "absolute",
		    "top": "41%",
		    "width": "68%",
		    "aspect-ratio": "1/3",
		},
	    },
	    "warning" :{
		"css":{
		    "width": "58%",
		    "position": "absolute",
		    "left": "28%",
		    "top": "30%",
		    "animation": "blink 1s",
		    "animation-iteration-count": "infinite",
		},
	    },
	    "warning_label" :{
		"css":{
		    "width": "58%",
		    "position": "absolute",
		    "left": "28%",
		    "top": "47%",
		    "animation": "blink 1s",
		    "animation-iteration-count": "infinite",
		    "background-color": "#df1800",
		    "text-align": "center",
		    "border-radius": "20px",
		    "color": "#ffff00",
		    "font-weight": "bold",
		},
	    },
	    "pump_state_head":{
		"css":{
		    "position": "absolute",
		    "aspect-ratio": "1/1",
		    "width": "55%",
		    "border-radius": "50%",
		    "top": "9.5%",
		    "left": "32%",
		},
	    },
	    "pump_state_labels":{
		"css":{
		    "aspect-ratio": "1/1",
		    "width": "100%",
		    "display": "grid",
		    "grid-template-columns": "1",
		    "grid-template-rows": "3",
		    "grid-gap": "0px",
		}
	    },
	    "pipe": {
		"css": {
		    "flex":" 0 0 auto",
                    "position":" absolute",
                    "width":" 70%",
                    "top":" 32%",
                    "left":" 30%",
		},
	    },
	    "calibration": {
		"css":{
		    "flex": "0 0 auto",
                    "position": "absolute",
                    "width": "50%",
                    "top": "10%",
                    "left": "35%",
		    "filter": "none",
		    "animation": "blink 1s",
		    "animation-iteration-count": "infinite",
		}
	    },
	    "elements": {
		"supplement":{
		    "name": "supplement",
		    "label": "this.stateObj.attributes.supplement.brand_name+': ' +this.stateObj.state",
		    "type": "common-sensor",
		    "put_in":"supplement_info",
		    "elt.css":{
			"position": "absolute",
			"width": "60%",
			"top": "30%",
			"left": "30%",
			"color": "white",
			"background-color": "rgba(0,0,0,0)",
		    }
		},
		"supplement_bottle":{
		    "name": "supplement_bottle",
		    "label": null,
		    "type": "common-button",
		    "put_in":"supplement",
		    "stateObj":null,
		    "elt.css":{
			"position": "absolute",
			"background-color": "rgba(0,80,120,0)",
		    },
		    "tap_action":{
			"domain": "redsea_ui",
			"action" : "dialog",
			"data": {"type":"edit_container"}
		    }
		},
		"manual_head_volume":{
		    "name": "manual_head_volume",
		    "force_integer": true,
		    "type": "common-sensor",
		    "css":{
			"position": "absolute",
			"width": "60%",
			"top": "0%",
			"left": "20%",
		    },
		    "tap_action": {
			"domain": "redsea_ui",
			"action" : "dialog",
			"data": {"type":"set_manual_head_volume"}
		    }
		},
		"manual_dosed_today":{
		    "name": "manual_dosed_today",
		    "type": "common-sensor",
		    "force_integer": true,
		    "put_in": "pump_state_labels",
		    "class": "scheduler_label_top",
		    "disabled_if": "value<1",
		    "prefix": "+",
		    "css":{
			"text-align": "center",
			"grid-column": "1",
			"grid-row": "1",
			"color": "rgb(250,230,130)",
			"font-weight": "bold",
			"margin-top":"10%",
		    },
		},
		"auto_dosed_today":{
		    "name": "auto_dosed_today",
		    "target": "daily_dose",
		    "force_integer": true,
		    "put_in": "pump_state_labels",
		    "class": "scheduler_label_middle",
		    "type":"common-sensor-target",
		    "css":{
			"text-align":"center",
			"color": "white",
			"grid-column": "1",
			"grid-row": "2",
			"font-weight": "bold",
			"font-size":"1.2em",
			"margin-top":"-20%",
		    },
		},
		"doses_today":{
		    "name": "doses_today",
		    "target": "daily_doses",
		    "force_integer": true,
		    "put_in": "pump_state_labels",
		    "class": "scheduler_label_bottom",
		    "type":"common-sensor-target",
		    "unit": "iconv._('doses')",
		    "css": {
			"text-align": "center",
			"color": "rgb(130,230,250)",
			"grid-column": "1",
			"grid-row": "3",
			"font-weight": "bold",
			"font-size":"0.8em",
			"margin-top":"-20%",
		    },
		},
		"container_volume":{
		    "name": "container_volume",
		    "target": "save_initial_container_volume",
		    "type": "progress-bar",
		    "class":"pg-container",
		    //		    "label": "' '+this.get_entity('remaining_days').state+ ' '+iconv._('days_left') ",
		    "label": "' '+this.get_entity('remaining_days').state+ ' '+iconv._('days_left') ",
		    "disabled_if": "this.get_entity('slm').state=='off'",
		    "css":{
			"position":"absolute",
			"transform":"rotate(-90deg)",
			"top":"69%",
			"left":"-60%",
			"width":"140%",
		    },
		},
		"auto_dosed_today_circle":{
		    "name": "auto_dosed_today",
		    "target": "daily_dose",
		    "force_integer": true,
		    "type":"progress-circle",
		    "class":"today_dosing",
		    "put_in": "pump_state_labels",
		    "no_value":true,
		    "css":{
			"position":"absolute",
			"top":"-23%",
			"left":"-23%",
			"aspect-ratio":"1/1",
			
			"width":"140%",
		    },
		},
		"schedule_enabled":{
		    "alpha": 0,
		    "name": "schedule_enabled",
		    "master": true,
		    "type": "common-switch",
		    "class": "pump_state_head",
		    "style": "button",
		    "css":{
			"position":"absolute",
			"aspect-ratio":"1/1",
			"width":"45%",
			"border-radius":"50%",
			"top":"10%",
			"left":"32.5%",
		    },
		    "hold_action": {
			"enabled": true,
			"domain": "switch",
			"action":"toggle",
			"data": "default",
		    },
		    "tap_action": {
			"domain": "redsea_ui",
			"action":"dialog",
			"data": {"type":"head_configuration"}
		    }
		},
		"manual_head":{
		    "name": "manual_head",
		    "type": "common-button",
		    "class": "manual_dose_head",
		    "css":{
			"position":" absolute",
                        "aspect-ratio":" 1/1",
                        "width":" 15%",
                        "border-radius":" 50%",
                        "top":" 5%",
                        "left":" 33%;",
		    },
		    "tap_action": {
			"domain": "button",
			"action":"press",
			"data": "default",
		    }
		}
	    }
	},
	"head_1": {
	    "id" : 1,
	    "color": "140,67,148",
	    "css":{
		"left":"1%",
	    },
	    "calibration":{
		"css":{
		    "left":"33%",
		},
	    }
	},
	"head_2": {
	    "id" : 2,
	    "color": "0,129,197",
	    "css":{
		"left":"23%",
	    },
	},
	"head_3": {
	    "id" : 3,
	    "color": "0,130,100",
	    "css":{
		"left":"44%",
	    },
	    "pump_state_head":{
		"css":{
		    "left": "37%",
		},
	    },
	    "calibration":{
		"css":{
		    "left":"37%",
		},
	    }

	},
	"head_4": {
	    "id" : 4,
	    "color": "100,160,75",
	    "css":{
		"left":"65%",
	    },
	    "pump_state_head":{
		"css":{
		    "left": "41%",
		},
	    },
	    "calibration":{
		"css":{
		    "left":"41%",
		},
	    }
	    
	}
    }
};
