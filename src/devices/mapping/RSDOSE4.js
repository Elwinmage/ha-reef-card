export const config = {
    "name": null,
    "model": "RSDOSE4",
    "background_img": new URL("../img/RSDOSE4.png",import.meta.url),
    "heads_nb": 4,
    "heads": {
	"head_1": {
	    "color": "140,67,148",
	    "alpha": "0.4",
	    "sensors": [
		{
		    "name": "supplement",
		    "left":1,
		    "top": 80,
		    "rotate": "-90deg",
		    "border_radius": "5px",
		    "background_color": "140,67,148",
		    "color": "white"
		}
	    ],
	    "switches" : [
		{
		    "name": "schedule_enabled",
		    "type": "hacs",
		    "class": "pump_state_head",
		}
		
	    ],
	    
	    "buttons": [
		{
		    "name": "manual_head",
		    "class": "manual_dose_head",
		    "type": "hacs",
		},
		{
		    "name": "supplement_info",
		    "type": "ui",
		    "class": "supplement_info",
		}
		
	    ]
	},
	"head_2": {
	    "color": "0,129,197",
	    "alpha": "0.4",
	    "sensors": [],
	    "buttons": [
		{
		    "name": "manual_head",
		    "class": "manual_dose_head",
		},
		{
		    "name": "pump_state_head_2",
		    "class": "pump_state_head",
		},
		{
		    "name": "supplement_info",
		    "type": "ui",
		    "class": "supplement_info",
		}

	    ]
	},
	"head_3": {
	    "color": "0,130,100",
	    "alpha": "0.4",
	    "sensors": [],
	    "buttons": [
		{
		    "name": "manual_head",
		    "class": "manual_dose_head",
		    "type": "hacs",
		},
		{
		    "name": "pump_state_head_3",
		    "class": "pump_state_head",
		    "type": "hacs",
		},
		{
		    "name": "supplement_info",
		    "type": "ui",
		    "class": "supplement_info",
		}

		
	    ]
	},
	"head_4": {
	    "color": "100,160,75",
	    "alpha": "0.4",
	    "sensors": [],
	    "buttons": [
		{
		    "name": "manual_head",
		    "class": "manual_dose_head",
		    "type": "hacs",
		},
		{
		    "name": "pump_state_head_4",
		    "class": "pump_state_head",
		    "type": "hacs",
		},
		{
		    "name": "supplement_info",
		    "type": "ui",
		    "class": "supplement_info",
		}


	    ]
	}
    }
};
