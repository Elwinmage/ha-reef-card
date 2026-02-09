export const config = {
  "name": null,
  "model": "RSWAVE",
  "background_img": new URL("../../img/RSWAVE.png", import.meta.url),
  "css":{
    "width":"100%",
  },
  "dialogs": {
    "wifi": {
      "name": "wifi",
      "title_key": "${i18n._('wifi')}",
      "close_cross": false,
      "content": [
        {
          "view": "hui-entities-card",
          "conf": {
            "type": "entities",
            "entities": [
              {"entity": "wifi_ssid", "name": {"type": "entity"}},
              {"entity": "ip", "name": {"type": "entity"}},
              {"entity": "wifi_signal", "name": {"type": "entity"}},
              {"entity": "wifi_quality", "name": {"type": "entity"}},
              {"entity": "cloud_connect", "name": {"type": "entity"}},
              {"entity": "cloud_state", "name": {"type": "entity"}},
              {"entity": "cloud_account", "name": {"type": "entity"}},
              {"entity": "use_cloud_api", "name": {"type": "entity"}},
            ]
          }
        },
      ],
    },
  },
  
  "elements": {
    "last_message": {
      "name": "last_message",
      "type": "redsea-messages",
      "css": {
        "flex": "0 0 auto",
        "position": "absolute",
        "width": "100%",
        "height": "15px",
        "top": "33%",
        "left": "0px",
      },
      "elt.css": {
        "background-color": "rgba(220,220,220,0.7)",
      }
    },
    
    "last_alert_message": {
      "name": "last_alert_message",
      "type": "redsea-messages",
      "label": "'⚠'",
      "css": {
        "color": "red",
        "flex": "0 0 auto",
        "position": "absolute",
        "width": "100%",
        "height": "20px",
        "top": "37%",
        "left": "0px",
      },
      "elt.css": {
        "background-color": "rgba(240,200,200,0.7)",
      }
    },
    "device_states":{
      "type": "hui-entities-card",
      "conf":{
	"type":"entities",
	"entities": [
	  {"entity":"device_state","name":{"type":"entity"}},
	  {"entity":"maintenance","name":{"type":"entity"}},
	]
      }
    },
    "wifi_quality": {
      "name": "wifi_quality",
      "type": "common-sensor",
      "master": true,
      "label": false,
      "icon": true,
      "icon_color": "#ec2330",
      "tap_action": {
        "domain": "redsea_ui",
        "action": "dialog",
        "data": {"type": "wifi"},
      },
      "css": {
        "flex": "0 0 auto",
        "position": "absolute",
        "width": "5.5%",
        "height": "2%",
        "top": "0%",
        "right": "0%",
      }
    },
  }
};
