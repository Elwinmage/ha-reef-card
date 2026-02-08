export const dialogs_rsdose = {
    "config":{
      "name":"config",
      "title_key":"${i18n._('config')}",
      "close_cross":false,
      "content":[
	{
	  "view": "hui-entities-card",
	  "conf":{
	    "type":"entities",
	    "entities": [
	      {"entity":"stock_alert_days","name":{"type":"entity"}},
	      {"entity":"dosing_waiting_period","name":{"type":"entity"}},
	      {"entity":"battery_level","name":{"type":"entity"}},
	    ]
	  }
	},
      ],
    },
    "head_configuration":{
      "name":"head_configuration",
      "title_key":"${i18n._('head_configuration')}  n°${config.id}",
      "close_cross": false,
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
	      "data":{
		"type":"priming",
		"overload_quit": "head_configuration",
	      },
	    },
	    "label": "${i18n._('priming')}",
	    "class": "dialog_button",
	    "css":{
	      "margin-bottom":"5px",
	      "text-align":"center",
	    },
	    "elt.css":{
	      "background-color":"rgba(0,0,0,0)",
	    }
	  }
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
	      "data":{
		"type":"head_calibration",
		"overload_quit": "head_configuration",
	      }
	    },
	    "label": "${i18n._('calibration')}",
	    "class": "dialog_button",
	    "css":{
	    },
	    "elt.css":{
	      "background-color":"rgba(0,0,0,0)",
	    }
	  },
	},
	{
	  "view":"extend",
	  "extend":"dose_head_dialog_func_ext",
	}
	
      ],
    },
    "head_calibration":{
      "name":"head_calibration",
      "title_key":"${i18n._('calibration')} n°${config.id}",
      "close_cross": false,
      "content":[
	{
	  "view": "click-image",
	  "conf":{
	    "image":'/hacsfiles/ha-reef-card/img/head_calibration.png',
	    "type": "click-image",
	    "stateObj":null,
	    "tap_action":[],
	    "css":{
	      "width":"60%",
	      "margin-left":"20%",
	    }
	  }
	},
	{
	  "view": "text",
	  "value": "${i18n._('calibration_step_1')}"
	},
      ],
      "validate": {
	"label": "${i18n._('start_calibration')}",
	"class": "dialog_button",
	"type": "common-button",
	"stateObj":null,
	"tap_action":[
	  {
	    "domain":"button",
	    "action":"press",
	    "data": {"entity_id":"start_calibration"},
	  },
	  {
	    "domain": "redsea_ui",
	    "action": "dialog",
	    "data": {"type":"head_calibration_step_2"},
	  } 
	]
      }
      
    },
    "head_calibration_step_2":{
      "name":"head_calibration_step_2",
      "title_key":"${i18n._('calibration')} n°${config.id}",
      "close_cross": false,
      "content":[
	{
	  "view": "text",
	  "value": "${i18n._('calibration_step_2')}"
	},
	{
	  "view": "click-image",
	  "conf":{
	    "image":'/hacsfiles/ha-reef-card/img/read_graduated.jpg',
	    "type": "click-image",
	    "stateObj":null,
	    "tap_action":[],
	    "css":{
	      "width":"60%",
	      "margin-left":"20%",
	    }
	  }
	},
	
	{
	  "view": "hui-entities-card",
	  "conf":{
	    "type":"entities",
	    "entities": [
	      {"entity":"calibration_dose_value","name":{"type":"entity"}},
	    ]
	  }
	},
      ],
      "validate": {
	"label": "${i18n._('set_calibration')}",
	"class": "dialog_button",
	"type": "common-button",
	"stateObj":null,
	"tap_action":[
	  {
	    "domain":"button",
	    "action":"press",
	    "data": {"entity_id":"set_calibration_value"},
	  },
	  {
	    "domain": "redsea_ui",
	    "action": "dialog",
	    "data": {"type":"head_calibration_step_3"},
	  } 
	]
      }
    },
    "test_calibration":{
      "name": "test_calibration",
      "title_key":"${i18n._('calibration')} n°${config.id}",
      "content":[
	{
	  "view": "text",
	  "value": "${i18n._('test_calibration_validation')}"
	},
	{
	  "view": "click-image",
	  "conf":{
	    "image":'/hacsfiles/ha-reef-card/img/read_graduated.jpg',
	    "type": "click-image",
	    "stateObj":null,
	    "tap_action":[],
	    "css":{
	      "width":"60%",
	      "margin-left":"20%",
	    }
	  }
	},
      ],
      "other":{
	  "view": "common-button",
	  "conf": {
	    "type": "common-button",
	    "stateObj": null,
	    "tap_action":[
	      {
		"domain":"button",
		"action":"press",
		"data": {"entity_id":"end_calibration"}
	      },
	      {
		"domain":"redsea_ui",
		"action":"dialog",
		"data":{"type": "head_calibration"},
	      },
	    ],
	    "label": "${i18n._('no')}",
	    "class": "dialog_button",
	    "css":{
	      "margin-bottom":"5px",
	      "text-align":"center",
	    },
	    "elt.css":{
	      "background-color":"rgba(0,0,0,0)",
	    }
	  }
      },
      "validate": {
	"label": "${i18n._('yes')}",
	"class": "dialog_button",
	"type": "common-button",
	"stateObj":null,
	"tap_action":[
	  {
	    "domain":"button",
	    "action":"press",
	    "data": {"entity_id":"end_calibration"},
	  },
	  {
	    "domain": "redsea_ui",
	    "action": "exit-dialog",
	  } 
	]
      }
      
    },
    "head_calibration_step_3":{
      "name":"head_calibration_step_3",
      "title_key":"${i18n._('calibration')} n°${config.id}",
      "content":[
	{
	  "view": "text",
	  "value": "${i18n._('test_calibration_description')}"
	},
	{
	  "view": "click-image",
	  "conf":{
	    "image":'/hacsfiles/ha-reef-card/img/head_calibration.png',
	    "type": "click-image",
	    "stateObj":null,
	    "tap_action":[],
	    "css":{
	      "width":"60%",
	      "margin-left":"20%",
	    }
	  }
	},
      ],
      "other":{
	  "view": "common-button",
	  "conf": {
	    "type": "common-button",
	    "stateObj": null,
	    "icon": "mdi:test-tube",
	    "tap_action":[
	      {
		"domain":"button",
		"action":"press",
		"data":{
		  "entity_id":"test_calibration",
		},
	      },
	      {
		"domain":"redsea_ui",
		"action":"dialog",
		"data":{
		  "type":"test_calibration",
		},
	      },
	    ],
	    "label": "${i18n._('test_calibration')}",
	    "class": "dialog_button",
	    "css":{
	      "margin-bottom":"5px",
	      "text-align":"center",
	    },
	  }
      },
      "validate": {
	"label": "${i18n._('finish')}",
	"class": "dialog_button",
	"type": "common-button",
	"stateObj":null,
	"tap_action":[
	  {
	    "domain":"button",
	    "action":"press",
	    "data": {"entity_id":"end_calibration"},
	  },
	  {
	    "domain": "redsea_ui",
	    "action": "exit-dialog",
	  } 
	]
      }
      
    },
    "priming":{
      "name":"priming",
      "title_key":"${i18n._('priming')} n°${config.id}",
      "close_cross": true,
      "content":[
	{
	  "view": "click-image",
	  "conf":{
	    "image":'/hacsfiles/ha-reef-card/img/priming.png',
	    "type": "click-image",
	    "stateObj":null,
	    "tap_action":[],
	    "css":{
	      "width":"60%",
	      "margin-left":"20%",
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
	"label": "${i18n._('next')}",
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
      "title_key":"${i18n._('dialog_edit_container')}  n°${config.id}",
      "close_cross": false,
      "content":[
	{
	  "view":"extend",
	  "extend":"dose_head_dialog_func_ext",
	},
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
	    "image":'/hacsfiles/ha-reef-card/img/trash.svg',
	    "type": "click-image",
	    "stateObj":null,
	    "tap_action":[
	      {
		"domain": "redsea_ui",
		"action": "dialog",
		"data": {"type":"delete_container"},
	      } 
	    ],
	    "css":{
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
      "title_key":"${i18n._('dialog_delete_supplement_title')}  n°${config.id}",
      "close_cross": false,
      "content":[],
      "validate": {
	"label": "${i18n._('delete')}",
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
	    "action": "message_box",
	    "data":"${i18n._('delete_wait')}",
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
      "title_key":"${i18n._('dialog_add_supplement_title')} n°${config.id}",
      "close_cross": true,
      "content":[
	{
	  "view": "hui-entities-card",
	  "conf":{
	    "type":"entities",
	    "entities": [
	      {"entity":"supplements","name":{"type":"entity"}},
	    ]
	  },
	},
	{
	  "view":"extend",
	  "extend":"dose_head_dialog_func_ext",
	  "re_render": true,
	},
	
      ],
      "validate": {
	"label": "${i18n._('next')}",
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
      "title_key": "${i18n._('set_container_volume')}",
      "content":[
	{
	  "view":"extend",
	  "extend":"dose_head_dialog_func_ext",
	},
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
	}
      ],
      "validate": {
	"label": "${i18n._('next')}",
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
      "title_key": "${i18n._('set_manual_head_volume')} n°${config.id}",
      "close_cross": true,
      "content":[
	{
	  "view":"extend",
	  "extend":"dose_head_dialog_func_ext",
	},
	{"view":"hui-entities-card",
	 "conf":{
	   "type":"entities",
	   "entities":[
	     {"entity":"supplement","name":{"type":"entity"}},
	     {"entity":"manual_head_volume","name":{"type":"entity"}},
	     {"entity":"manual_head","name":{"type":"entity"}},
	     // "manual_head", can also be only a string but display name is full
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
}
