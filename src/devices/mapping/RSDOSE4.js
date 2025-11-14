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
	}
    ],
    "heads": {
	"head_1": {
	    "color": "140,67,148",
	    "alpha": "0.4",
	    "sensors": [
		{
		    "name": "supplement",
		    "disabled": true,
		},
		{
		    "name": "manual_head_volume",
		    "force_integer": true,
		}
	    ],
	    "switches" : [
		{
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
		    "config": ["manua_head_volume","manual_head"],
		    "invert_action": true,
		    
		},
		{
		    "name": "supplement",
		    "type": "ui",
		    "class": "supplement_info",
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
		}
	    ],
	    "switches" : [
		{
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
		},
		{
		    "name": "supplement",
		    "type": "ui",
		    "class": "supplement_info",
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
		}

	    ],
	    "switches" : [
		{
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
		},
		{
		    "name": "supplement",
		    "type": "ui",
		    "class": "supplement_info",
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
		}

	    ],
	    "switches" : [
		{
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
		},
		{
		    "name": "supplement",
		    "type": "ui",
		    "class": "supplement_info",
		}


	    ]
	}
    }
};
