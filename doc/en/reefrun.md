[← Back to the main page](../../README.md)

# ReefRun

ReefRun with ha-reef-card in action:

[![Watch the video](https://img.youtube.com/vi/Xxv38OPqiGI/0.jpg)](https://www.youtube.com/watch?v=Xxv38OPqiGI)

The ReefRun card shows the controller and its two pumps as they are physically
wired, each with its own cable and plumbing. Pump 1 is the one on the left of
the card, pump 2 the one on the right — typically the return pump and the DC
Skimmer, but either socket accepts either model.

<img src="../img/rsrun/rsrun_zones.png"/>

The card is divided into 6 zones:

1. Power state and maintenance mode
2. Battery and Wifi information
3. Controller: operating mode, pump buttons and calibrations
4. Pump 1: daily schedule, body with live water flow, temperature
5. Pump 2: daily schedule, body with live water flow, temperature
6. Last message and last alert

## Power state and maintenance mode

<img src="../img/rsrun/zone_1.png" >

<span>The maintenance switch <img src="../img/mdi/mdi_account-wrench.png" width="20"/> switches to maintenance mode.</span>

<img src="../img/rsrun/maintenance.png" >

<span>The on/off switch <img src="../img/mdi/mdi_power-plug.png" width="20"/> switches the reef dual controler between on and off states.</span>

<img src="../img/rsrun/off_mode.png" >

## Configuration / Wifi Information

<img src="../img/rsrun/zone_2.png"/>

---

<span>This icon <img src="../img/mdi/battery.png" width="30" /> indicate the battery elevel of the Dual Controler.</span>

<span>Click the icon <img src="../img/mdi/wifi_icon.png" width="30" /> to manage the network settings.</span>

<img src="../img/rsrun/zone_2_dialog_wifi.png"/>

## Controller: operating mode, pump buttons and calibrations

<img src="../img/rsrun/zone_3.png"/>

### Pump settings

A click on <img src="../img/mdi/cog-1.png" width="5%"/> or <img src="../img/mdi/cog-2.png" width="5%"/> will open the pump configuration dialog box for pump 1 or 2.

<img src="../img/rsrun/zone_3_return_pump.png"/>
<img src="../img/rsrun/zone_3_skimmer.png"/>

> [!CAUTION]
> **Delete pump** restores the pump settings to their factory defaults: the
> schedule and the sensor control are lost. A confirmation is always asked.

### Sensor settings

A click on <img src="../img/mdi/cog-s.png" width="5%"/> will open the sensor configuration dialog box.
<img src="../img/rsrun/zone_3_sensor.png"/>

### Pump Play/Pause <img src="../img/mdi/play.png" width="5%"/> / <img src="../img/mdi/pause.png" width="5%"/>

A click toggle the individual pump on or off.

The red ring indicates the current speed.
<img src="../img/rsrun/speed.png"/>

To change the current speed hold <img src="../img/mdi/play.png" width="5%"/> / <img src="../img/mdi/pause.png" width="5%"/> or click on the schedule:

<img src="../img/rsrun/schedule.png"/>

## Pump states

The pump body reflects what the device is actually doing, so a glance is enough.
The two pump types do not have the same states, so they are described
separately.

## Pump 1 & 2

### Return pump

<img src="../../src/img/redsea/RSRUN/reefrun_return.png" width="30%"/>

A single artwork covers every state, the card only changes how it is drawn:

- **Running** — full colors, water animated at the current speed.
- **Stopped** — the same artwork greyed out, no flow.
- **Disconnected** — the same greying, plus a blinking power cable.

### Skimmer

Three distinct artworks, one per state of the cup:

<table>
  <tr>
    <td align="center"><img src="../../src/img/redsea/RSRUN/reefrun_skimmer_on.png" width="100%"/><br/><b>Running</b><br/>Foam in the cup, rising bubbles, water animated</td>
    <td align="center"><img src="../../src/img/redsea/RSRUN/reefrun_skimmer_full.png" width="100%"/><br/><b>Full cup</b><br/>Foam reduced to a band under the lid</td>
    <td align="center"><img src="../../src/img/redsea/RSRUN/reefrun_skimmer_off.png" width="100%"/><br/><b>Stopped</b><br/>Empty cup, greyed out, no bubbles</td>
  </tr>
</table>

A disconnected skimmer looks exactly like a stopped one: only the blinking cable
tells them apart. That blink means the ReefRun reports `missing_pump`, so the
pump is configured but the controller no longer sees it. Check the plug before
looking any further.

The full-cup state is reported by the skim sensor in the collection chamber. The
body switches to its own artwork and the foam animation collapses to a thin band
under the lid, whether or not self-leveling is enabled. The blinking warning icon
next to the full-cup switch only appears when `sensor_controlled` is on, since
with the sensor disabled the controller takes no action on a full cup.

### Adding a pump

A port with no pump configured shows an **add** placeholder instead of a pump
body:

<img src="../../src/img/redsea/RSRUN/add_pump.png" width="20%"/>

Clicking it opens the configuration dialog, where **Detect and add** asks the
controller what is connected and registers it in one step. The detected model is
only a suggestion and is occasionally wrong, so the model list stays editable
afterwards: for a DC Skimmer, pick rsk-300, rsk-600 or rsk-900. The pump name can
be edited in the same dialog.

The placeholder sits on every unconfigured port, so it also shows up on a port
you never intend to use. Users running a single pump can hide it entirely from
the card editor.

<img src="../img/rsrun/editor.png"/>

### Schedule

<img src="../img/rsrun/schedule.png"/>

The blue curve is the programmed speed over 24 hours. The vertical red line
marks the current time, and the dot on it the speed the schedule is asking for.

When the pump does not follow its schedule — feed mode, full-cup detection,
overskimming protection — the dot moves down to the **real** speed and a red
segment materializes the gap, labelled with the difference:

<img src="../img/rsrun/schedule_deviation.png"/>

Clicking the chart opens the schedule editor: add or remove points, edit times and speeds, preview a point on the device, then save.

<img src="../img/rsrun/schedule_editor.png"/>

## Messages

<img src="../img/rsrun/zone_6.png"/>

---

This zone displays the latest system messages from the ReefMat. It has two lines:

- The grey line shows the **last message** received.
- The pink line shows the **last alert**, preceded by the ⚠ symbol.

Clicking the <img src="../img/mdi/mdi_delete-empty.png" width="20"/> icon clears the corresponding message.

These lines can be hidden via the card editor interface.

<img src="../img/rsrun/editor_2.png" />

---

[← Back to the main page](../../README.md)
