export const config = {
    "name": null,
    "model": "RSDOSE4",
    "background_img": new URL("../img/RSDOSE4.png",import.meta.url),
    "heads_nb": 4,
    "switches": [
	{
	    "name": "device_state",
	    "type":"hacs",
	    "label":false,
	    "class":"on_off",
	    "style": "switch",
	    "tap_action": {
		//"enabled": false,
		//"domain": "switch",
		//"action":"turn_on",
		//"data": {"entity_id":"switch.simu_rsdose4_4647319427_head_4_schedule_enabled"},
	    }
	}
    ],
    "heads": {
	"head_1": {
	    "color": "140,67,148",
	    "alpha": "0.4",
	    "sensors": [
		{
		    "name": "manual_head_volume",
		    "force_integer": true,
		},
		{
		    "name": "manual_dosed_today",
		    "force_integer": true,
		    "put_in": "pump_state_head",
		    "class": "scheduler_label_top",
		    "disabled_if": "value<1",
		    "prefix": "+",
		}
	    ],
	    "sensors_target": [
		{
		    "name": "auto_dosed_today",
		    "target": "daily_dose",
		    "force_integer": true,
		    "put_in": "pump_state_head",
		    "class": "scheduler_label_middle",
		    "type":"common-sensor-target",
		},
		{
		    "name": "doses_today",
		    "target": "daily_doses",
		    "force_integer": true,
		    "put_in": "pump_state_head",
		    "class": "scheduler_label_bottom",
		    "type":"common-sensor-target",
		    "unit": "iconv._('doses')",
		}
	    ],
	    "progress_bar": [
		{
		    "name": "container_volume",
		    "target": "save_initial_container_volume",
		    "type": "progress-bar",
		    "class":"pg-container",
		    "label": "' '+this.get_entity('remaining_days').state+ ' '+iconv._('days_left') ",
		    "disabled_if": "this.get_entity('slm').state==false",
		}
	    ],
	    "switches" : [
		{
		    "name": "schedule_enabled",
		    "type": "hacs",
		    "class": "pump_state_head",
		    "style": "button",
		    "alpha": 0,
		}
		
	    ],
	    "buttons": [
		{
		    "name": "manual_head",
		    "class": "manual_dose_head",
		    "type": "hacs",
		    "config": ["manua_head_volume","manual_head"],
		    "invert_action": true,
		},
		{
		    "name": "supplement",
		    "type": "ui",
		    "class": "supplement_info",
		    "disabled_if": "true",
		}
		
	    ]
	},
	"head_2": {
	    "color": "0,129,197",
	    "alpha": "0.4",
	    "sensors": [
		{
		    "name": "manual_head_volume",
		    "force_integer": true,
		},
		{
		    "name": "manual_dosed_today",
		    "force_integer": true,
		    "put_in": "pump_state_head",
		    "class": "scheduler_label_top",
		    "disabled_if": "value<1",
		    "prefix": "+",
		}
	    ],
	    "sensors_target": [
		{
		    "name": "auto_dosed_today",
		    "target": "daily_dose",
		    "force_integer": true,
		    "put_in": "pump_state_head",
		    "class": "scheduler_label_middle",
		    "type":"common-sensor-target",
		},
		{
		    "name": "doses_today",
		    "target": "daily_doses",
		    "force_integer": true,
		    "put_in": "pump_state_head",
		    "class": "scheduler_label_bottom",
		    "type":"common-sensor-target",
		    "unit": "iconv._('doses')",
		}
	    ],
	    "progress_bar": [
		{
		    "name": "container_volume",
		    "target": "save_initial_container_volume",
		    "type": "progress-bar",
		    "class":"pg-container",
		    "label": "' '+this.get_entity('remaining_days').state+ ' '+iconv._('days_left') ",
		    "disabled_if": "this.get_entity('slm').state==false",
		}
		],
	    "switches" : [
		{
		    "alpha": 0,
		    "name": "schedule_enabled",
		    "type": "hacs",
		    "class": "pump_state_head",
		    "style": "button",
		}
		
	    ],
	    "buttons": [
		{
		    "name": "manual_head",
		    "class": "manual_dose_head",
		}
	    ]
	},
	"head_3": {
	    "color": "0,130,100",
	    "alpha": "0.4",
	    "sensors": [
		{
		    "name": "manual_head_volume",
		    "force_integer": true,
		},
		{
		    "name": "manual_dosed_today",
		    "force_integer": true,
		    "put_in": "pump_state_head",
		    "class": "scheduler_label_top",
		    "disabled_if": "value<1",
		    "prefix": "+",
		}
	    ],
	    "sensors_target": [
		{
		    "name": "auto_dosed_today",
		    "target": "daily_dose",
		    "force_integer": true,
		    "put_in": "pump_state_head",
		    "class": "scheduler_label_middle",
		    "type":"common-sensor-target",
		},
		{
		    "name": "doses_today",
		    "target": "daily_doses",
		    "force_integer": true,
		    "put_in": "pump_state_head",
		    "class": "scheduler_label_bottom",
		    "type":"common-sensor-target",		    
		    "unit": "iconv._('doses')",
		}
	    ],
	    "progress_bar": [
		{
		    "name": "container_volume",
		    "target": "save_initial_container_volume",
		    "type": "progress-bar",
		    "class":"pg-container",
		    "label": "' '+this.get_entity('remaining_days').state+ ' '+iconv._('days_left') ",
		    "disabled_if": "this.get_entity('slm').state==false",
		}
	    ],
	    "switches" : [
		{
		    "alpha": 0,
		    "name": "schedule_enabled",
		    "type": "hacs",
		    "class": "pump_state_head",
		    "style": "button",
		}
		
	    ],
	    "buttons": [
		{
		    "name": "manual_head",
		    "class": "manual_dose_head",
		    "type": "hacs",
		}
	    ]
	},
	"head_4": {
	    "color": "100,160,75",
	    "alpha": "0.4",
	    "sensors": [
		{
		    "name": "manual_head_volume",
		    "force_integer": true,
		},
		{
		    "name": "manual_dosed_today",
		    "force_integer": true,
		    "put_in": "pump_state_head",
		    "class": "scheduler_label_top",
		    "disabled_if": "value<1",
		    "prefix": "+",
		}
	    ],
	    "sensors_target": [
		{
		    "name": "auto_dosed_today",
		    "target": "daily_dose",
		    "force_integer": true,
		    "put_in": "pump_state_head",
		    "class": "scheduler_label_middle",
		    "type":"common-sensor-target",
		},
		{
		    "name": "doses_today",
		    "target": "daily_doses",
		    "force_integer": true,
		    "put_in": "pump_state_head",
		    "class": "scheduler_label_bottom",
		    "type":"common-sensor-target",		    
		    "unit": "iconv._('doses')",
		}
	    ],
	    "progress_bar": [
		{
		    "name": "container_volume",
		    "target": "save_initial_container_volume",
		    "type": "progress-bar",
		    "class":"pg-container",
		    "label": "' '+this.get_entity('remaining_days').state+ ' '+iconv._('days_left') ",
		    "disabled_if": "this.get_entity('slm').state=='off'",
		}
	    ],
	    "switches" : [
		{
		    "name": "schedule_enabled",
		    "type": "hacs",
		    "class": "pump_state_head",
		    "style": "button",
		    "color": "0,0,0",
		    "alpha": "0",
		    //"label": "20mL",
		}
	    ],
	    "buttons": [
		{
		    "name": "manual_head",
		    "class": "manual_dose_head",
		    "type": "hacs",
		}
	    ]
	}
    }
};
