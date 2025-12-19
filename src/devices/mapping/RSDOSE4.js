export const config = {
    "name": null,
    "model": "RSDOSE4",
    "background_img": new URL("../img/RSDOSE4.png",import.meta.url),
    "heads_nb": 4,
    "dialogs": {
	"set_manual_head_volume":{
	    "title_key": "set_manual_head_volume",
	    "close_cross": true,
	    "content":[
		{
		    "view":"common-button",
		    "conf":{
			"label":"2mL",
			"tap_action": [
			    {
				"domain": "number",
				"action" : "set_value",
				"data":{"entity_id":"manual_head_volume","value":2}
			    },
			    {
				"domain": "button",
				"action" : "press",
				"data": {"entity_id":"manual_head"},
			    },
			    {
				"domain": "redsea_ui",
				"action" : "message_box",
				"data": "Dosing 2mL"
			    }
			],
			"css":{
			    "display": "inline-block",
			    "border":"1px solid gray",
			    "border-radius": "15px",
			    "padding-left":"10px",
			    "padding-right":"10px",
			    "margin-bottom": "20px",			    
			    "background-color": "rgb(220,220,220)",
			}
		    }
		},
		{
		    "view":"common-button",
		    "conf":{
			"label":"5mL",
			"tap_action": [
			    {
				"domain": "number",
				"action" : "set_value",
				"data":{"entity_id":"manual_head_volume","value":5}
			    },
			    {
				"domain": "button",
				"action" : "press",
				"data": {"entity_id":"manual_head"},
			    },
			    {
				"domain": "redsea_ui",
				"action" : "message_box",
				"data": "Dosing 5mL"
			    }
			],
			"css":{
			    "display": "inline-block",
			    "border":"1px solid gray",
			    "border-radius": "15px",
			    "padding-left":"10px",
			    "padding-right":"10px",
			    "margin-bottom": "20px", 
			    "background-color": "rgb(220,220,220)",
			}
			
		    }
		},
		{
		    "view":"common-button",
		    "conf":{
			"label":"10mL",
			"tap_action": [
			    {
				"domain": "number",
				"action" : "set_value",
				"data":{"entity_id":"manual_head_volume","value":10}
			    },
			    {
				"domain": "button",
				"action" : "press",
				"data": {"entity_id":"manual_head"},
			    },
			    {
				"domain": "redsea_ui",
				"action" : "message_box",
				"data": "Dosing 10mL"
			    }
			],
			"css":{
			    "display": "inline-block",
			    "border":"1px solid gray",
			    "border-radius": "15px",
			    "padding-left":"10px",
			    "padding-right":"10px",
			    "margin-bottom": "20px",
			    "background-color": "rgb(220,220,220)",
			}
			
		    }
		},
		{
		    "view":"common-button",
		    "conf":{
			"label":"16mL",
			"tap_action": [
			    {
				"domain": "number",
				"action" : "set_value",
				"data":{"entity_id":"manual_head_volume","value":16}
			    },
			    {
				"domain": "button",
				"action" : "press",
				"data": {"entity_id":"manual_head"},
			    },
			    {
				"domain": "redsea_ui",
				"action" : "message_box",
				"data": "Dosing 16mL"
			    }
			],
			"css":{
			    "display": "inline-block",
			    "border":"1px solid gray",
			    "border-radius": "15px",
			    "padding-left":"10px",
			    "padding-right":"10px",
			    "margin-bottom": "20px",			    
			    "background-color": "rgb(220,220,220)",
			}
		    }
		},
		{
		    "view":"common-button",
		    "conf":{
			"label":"20mL",
			"tap_action": [
			    {
				"domain": "number",
				"action" : "set_value",
				"data":{"entity_id":"manual_head_volume","value":20}
			    },
			    {
				"domain": "button",
				"action" : "press",
				"data": {"entity_id":"manual_head"},
			    },
			    {
				"domain": "redsea_ui",
				"action" : "message_box",
				"data": "Dosing 20mL"
			    }
			],
			"css":{
			    "display": "inline-block",
			    "border":"1px solid gray",
			    "border-radius": "15px",
			    "padding-left":"10px",
			    "padding-right":"10px",
			    "background-color": "rgb(220,220,220)",
			    "margin-bottom": "20px",
			}
		    }
		},
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
	    "validate": [
		{
		    "action": {
			"domain": "redsea_ui",
			"action": "exit-dialog",
		    }
		}
	    ]
	}
    },
    "elements": [
	{
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
	{
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
    ],
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
		    "width": "40%",
		    "position": "absolute",
		    "left": "18%",
		    "top": "60%",
		    "animation": "blink 1s",
		    "animation-iteration-count": "infinite",
		},
	    },
	    "warning_label" :{
		"css":{
		    "width": "40%",
		    "position": "absolute",
		    "left": "18%",
		    "top": "69%",
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
	    "elements": [
		{
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
		{
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
		{
		    "name": "auto_dosed_today",
		    "type": "common-sensor",
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
		{
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
		{
		    "name": "container_volume",
		    "target": "save_initial_container_volume",
		    "type": "progress-bar",
		    "class":"pg-container",
		    "label": "' '+this.get_entity('remaining_days').state+ ' '+iconv._('days_left') ",
		    "disabled_if": "this.get_entity('slm').state==false",
		    "css":{
			"position":"absolute",
			"transform":"rotate(-90deg)",
			"top":"69%",
			"left":"-60%",
			"width":"140%",
		    },
		},
		{
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
		{
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
		    "tap_action": {
			"enabled": true,
			"domain": "switch",
			"action":"toggle",
			"data": "default",
		    }
		},
		{
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
	    ]
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
