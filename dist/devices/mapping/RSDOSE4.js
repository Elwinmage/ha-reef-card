export const config = {
		"name": null,
		"model": "RSDOSE4",
		"background-img": null,
		"heads_nb": 4,
		"heads": {
				"head_1": {
						"color": "140,67,148",
						"alpha": "140,67,148,0.4",
						"container": {
								"width": 20,
								"top": 43,
								"left": 1,
								"img": "/local/community/ha-reef-card/devices/img/generic_container.png"
						},
						"actions": [
								{
										"name": "manual_dose_head_1",
										"width": 5,
										"border_radius":50,
										"left": 10,
										"top": 7
								},
								{
										"name": "pump_state_head_1",
										"width": 15,
										"border_radius":50,
										"left": 10,
										"top": 12
								}
						]
				},
				"head_2": {
						"color": "0,129,197",
						"alpha": "0,129,197,0.4",
						"container": {
								"width": 20,
								"top": 43,
								"left": 21,
								"img": "/local/community/ha-reef-card/devices/img/generic_container.png"
						},
						"actions": [
								{
										"name": "manual_dose_head_2",
										"width": 5,
										"border_radius":50,
										"left": 28,
										"top": 7
								},
								{
										"name": "pump_state_head_2",
										"width": 15,
										"border_radius":50,
										"left": 28,
										"top": 12
								}
						]
				},
				"head_3": {
								"color": "0,130,100",
						"alpha": "0,130,100,0.4",
						"container": {
								"width": 20,
								"top": 43,
								"left": 41,
								"img": "/local/community/ha-reef-card/devices/img/generic_container.png"
						},
						"actions": [
								{
										"name": "manual_dose_head_3",
										"width": 5,
										"border_radius":50,
										"left": 47,
										"top": 7
								},
								{
										"name": "pump_state_head_3",
										"width": 15,
										"border_radius":50,
										"left": 48,
										"top": 12
								}
								
						]
				},
				"head_4": {
						"color": "100,160,75",
						"alpha": "100,160,75,0.4",

						"container": {
								"width": 20,
								"top": 43,
								"left": 61,
								"img": "/local/community/ha-reef-card/devices/img/generic_container.png"
						},

						"actions": [
								{
										"name": "manual_dose_head_4",
										"width": 5,
										"border_radius":50,
										"left": 67,
										"top": 6
								},
								{
										"name": "pump_state_head_4",
										"width": 15,
										"border_radius":50,
										"left": 70,
										"top": 11
								}

						]
				}
		}
};
