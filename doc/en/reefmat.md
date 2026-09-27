[← Back to the main page](../../README.md)

# ReefMat

ReefMat with ha-reef-card in action:

[![Watch the video](https://img.youtube.com/vi/yyNyUSitb1E/0.jpg)](https://www.youtube.com/watch?v=yyNyUSitb1E)

The ReefMat card is divided into 7 zones:

1. Configuration / Wifi Information
2. States
3. Roll information (total length used, remaining length, end of roll, mode...)
4. Manual/Automatic Advance
5. Sensor
6. Scheduled Advance
7. Weekly / Monthly Usage Graph

<img src="../img/rsmat/rsmat_zones.png"/>

The background image changes according to the roll usage status, with 5 different images:

<table>
  <tr>
    <td align="center"><img src="../img/rsmat/RSMAT_100_BASE.png" width="100%"/><br/><b>0%</b></td>
    <td align="center"><img src="../img/rsmat/RSMAT_75_BASE.png" width="100%"/><br/><b>25%</b></td>
    <td align="center"><img src="../img/rsmat/RSMAT_50_BASE.png" width="100%"/><br/><b>50%</b></td>
  </tr>
  <tr>
    <td align="center"><img src="../img/rsmat/RSMAT_25_BASE.png" width="100%"/><br/><b>75%</b></td>
    <td align="center"><img src="../img/rsmat/RSMAT_0_BASE.png" width="100%"/><br/><b>100%</b></td>
    <td></td>
  </tr>
</table>

## Configuration / Wifi Information

<img src="../img/rsmat/zone_1.png"/>

---

<span>Click the icon <img src="../img/rsdose/cog_icon.png" width="30" /> to manage the general configuration of the ReefMat.</span>

<img src="../img/rsmat/zone_1_dialog_configuration.png"/>

<span>Click the icon <img src="../img/rsdose/wifi_icon.png" width="30" /> to manage the network settings.</span>

<img src="../img/rsmat/zone_1_dialog_wifi.png"/>

## States

<img src="../img/rsmat/zone_2.png"/>

---

<span>The maintenance switch <img src="../img/mdi/mdi_account-wrench.png" width="20"/> switches to maintenance mode.</span>

 <img  src="../img/rsmat/maintenance.png"/>

<span>The on/off switch <img src="../img/mdi/mdi_power-plug.png" width="20"/> switches the ReefMat between on and off states.</span>

 <img  src="../img/rsmat/off_mode.png"/>

## Roll Information

<img src="../img/rsmat/zone_3.png"/>

---

This zone displays the real-time status of the filter roll, from top to bottom:

- The **total length used** since the start of the roll (top, in red)
- The **remaining length** in the centre in red. When the roll is empty, a <img src="../img/mdi/mdi_paper-roll.png" width="20"/> blinking icon appears instead and a dialog box offers to replace the roll.

<img src="../img/rsmat/zone_3_dialog_new_roll.png"/>

- The **number of days remaining** before the end of the roll, estimated from the daily average consumption (in black)
- The **daily average consumption** in cm (bottom left)
- The current **operating mode**: Auto, Maintenance, Off… (below the RedSea logo)
- The **roll usage percentage** (circular arc, bottom right)

If an anomaly is detected, the RedSea logo transforms into a <img src="../img/mdi/mdi_alert-decagram.png" width="20"/> blinking icon.
Clicking this alert opens the anomaly dialog box:

<img src="../img/rsmat/alert.png"/>
<img src="../img/rsmat/zone_3_dialog_alert.png" />

## Manual/Automatic Advance

<img src="../img/rsmat/zone_4.png"/>
<img src="../img/rsmat/zone_4_auto_off.png"/>
---

This zone controls the roll advance.

From left to right:

- The <img src="../img/mdi/mdi_send.png" width="20"/> button triggers a **manual advance** of the roll by the length shown in the centre.
- The displayed **advance value** (in cm) is the value sent when the button is pressed. Clicking this number opens the editing dialog.

<img src="../img/rsmat/zone_4_dialog_manual_advance.png"/>

- The **automatic advance button** <img src="../img/mdi/mdi_autorenew.png" width="20"/> <img src="../img/mdi/mdi_autorenew-off.png" width="20"/> enables or disables the automatic roll advance.

## Sensor

<img src="../img/rsmat/zone_5.png"/>

---

This zone shows the status of the level sensor.

Three states are possible:

| State               | Image                                                           |
| ------------------- | --------------------------------------------------------------- |
| Sensor connected    | <img src="../img/rsmat/RSMAT_SENSOR_PLUGGED.png" width="80"/>   |
| Sensor disconnected | <img src="../img/rsmat/RSMAT_SENSOR_UNPLUGGED.png" width="80"/> |
| Dirty sensor        | <img src="../img/mdi/mdi_liquid-spot.png" width="80"/>          |

## Scheduled Advance

<img src="../img/rsmat/zone_6.png"/>

---

This button <img src="../img/mdi/mdi_auto-mode_red.png" width="20"/><img src="../img/mdi/mdi_auto-mode_black.png" width="20"/> shows the scheduled advance status and allows editing it by clicking on it.

<img src="../img/rsmat/zone_6_dialog_schedule.png"/>

## Usage Graph

<img src="../img/rsmat/zone_7.png"/> 
<img src="../img/rsmat/monthly.png"/>

---

This zone displays a graph of roll consumption over time.
Clicking the button toggles between the two available modes:

- **Weekly** mode shows consumption over the last 7 days.
- **Monthly** mode shows consumption over the last 30 days.

Pressing the top left of the graph opens the detailed view in Home Assistant.

## Messages

<img src="../img/rsmat/zone_8.png"/>

---

This zone displays the latest system messages from the ReefMat. It has two lines:

- The grey line shows the **last message** received.
- The pink line shows the **last alert**, preceded by the ⚠ symbol.

Clicking the <img src="../img/mdi/mdi_delete-empty.png" width="20"/> icon clears the corresponding message.

These lines can be hidden via the card editor interface.

<img src="../img/rsmat/editor.png" />

---

[← Back to the main page](../../README.md)
