[← Back to the main page](../../README.md)

# ReefControl

ReefControl and ReefControl-Power with ha-reef-card in action:

[![Watch the video](https://img.youtube.com/vi/VIDEO_ID/0.jpg)](https://www.youtube.com/watch?v=VIDEO_ID)

The ReefControl card draws the hub as it is wired: the ReefSense probes hanging
from their extension boxes, the 12V ports, the ATO pump when a port drives one,
and the paired [ReefControl-Power](reefcontrol-power.md#reefcontrol-power) above it.

Both models are supported. The Pro takes up to 7 probes (a second extension box
is drawn as soon as a fifth probe is plugged in) and has two 12V ports; the Lite
takes 2 probes and has a single 12V port.

<table>
  <tr>
    <th align="center">RSCONTROLPRO</th>
    <th align="center">RSCONTROLLITE</th>
  </tr>
  <tr>
    <td align="center"><img src="../img/rscontrol/rscontrolpro.png"/></td>
    <td align="center"><img src="../img/rscontrol/rscontrollite.png"/></td>
  </tr>
</table>

The rest of this section is illustrated with the Pro: everything works the same
way on the Lite.

<img src="../img/rscontrol/rscontrol_zones.png"/>

The card is divided into 7 zones:

1. Controller: power, maintenance mode, configuration, Wifi and buzzer
2. Paired power center (ReefControl-Power)
3. Summary of the readings
4. Probes
5. 12V ports
6. ATO
7. Last message and last alert

## Controller

<img src="../img/rscontrol/zone_1.png"/>

---

The text on the hub face is the **operating mode** reported by the device
(Auto, Setup, Maintenance…), translated into the language of Home Assistant.

<span>The on/off switch <img src="../img/mdi/mdi_power-plug.png" width="20"/> switches the ReefControl between on and off states.</span>

<img src="../img/rscontrol/off_mode.png" width="50%"/>

Switched off, the hub measures and drives nothing, so the card only keeps its
on/off switch and the pictures of the hardware: the probes lose their values,
bars and settings, and the buzzer, the summary, the 12V ports and the
configuration icons are hidden.

<span>The maintenance switch <img src="../img/mdi/mdi_account-wrench.png" width="20"/> switches to maintenance mode.</span>

<img src="../img/rscontrol/maintenance.png" width="50%"/>

<span>Click the icon <img src="../img/rsdose/cog_icon.png" width="30"/> to manage the general configuration of the ReefControl: refresh the settings or the polled data, reset the device, update its firmware, the [temperature fusion](https://github.com/Elwinmage/ha-reefbeat-component/blob/main/doc/en/reefcontrol.md#multi-probe-temperature-fusion) settings, the network and cable state, and the pairing with a ReefControl-Power.</span>

<img src="../img/rscontrol/zone_1_dialog_config.png" width="50%"/>

<span>Click the icon <img src="../img/mdi/wifi_icon.png" width="30"/> to manage the network settings.</span>

<img src="../img/rscontrol/zone_1_dialog_wifi.png" width="50%"/>

### Buzzer

<span>The bell <img src="../img/mdi/mdi_bell-alert.png" width="20"/> sits on the status LED of the hub. It is green while the buzzer is quiet, red and blinking while it sounds, and stays red once the alarm has been dismissed.</span>

A click opens the buzzer dialog: what it is doing now and why, then its two
alarm sounds — the **danger** alarm (a reading out of its range) and the
**leak** alarm — each with its switch, frequency and duty cycle, the danger
debounce and the leak detector.

<img src="../img/rscontrol/zone_1_dialog_buzzer.png" width="50%"/>

## Paired power center

<img src="../img/rscontrol/zone_2.png"/>

---

When a ReefControl-Power is paired with the hub, it is drawn above it, 6 or 8
sockets according to its model, linked to the hub by its cable. A powered socket
is lit with a light red mask.

Clicking the power center opens its own card (see
[ReefControl-Power](reefcontrol-power.md#reefcontrol-power)).

When the power center is paired but cannot be reached, it blinks under a light
red tint. Pairing and unpairing are done from the configuration dialog of the
controller.

## Summary

<img src="../img/rscontrol/zone_3.png"/>

---

The bar between the power center and the probes sums up every reading of the
hub, from left to right:

- An alert <img src="../img/mdi/mdi_alert.png" width="20"/>, only when something is wrong: orange when the worst reading is acceptable, red when one is in danger. Embedded temperatures count too.
- The **temperature**: the fused value when the hub has several temperature sources, else the one of the temperature probe, else the first embedded temperature.
- <span>A thermometer <img src="../img/mdi/mdi_thermometer-alert.png" width="20"/>, only when the hub suspects one of its temperature sources; its tooltip names the probe at fault.</span>
- pH, ORP and salinity, one entry per probe.
- <span>A drop <img src="../img/mdi/mdi_water-alert.png" width="20"/> per leak probe, red when it is wet.</span>
- <span>Waves <img src="../img/mdi/mdi_waves.png" width="20"/> per ATO probe, green on a desired level, orange below or above it.</span>

Each reading takes the colour of its level: green for desired, orange for
acceptable, red for danger, white when the probe gives no valid reading.
Clicking a reading opens its more-info dialog.

## Probes

<img src="../img/rscontrol/zone_4.png"/>

---

Every probe of the hub hangs from an extension box, in the order the hub lists
them. Each one shows:

- Its **reading**, and the **embedded temperature** right under it for the pH,
  salinity and ATO probes, coloured by their level. Clicking a value opens its
  more-info dialog.
- A **situation bar** per reading: the red, orange and green bands are the
  danger, acceptable and desired ranges set on the probe, and the black marker
  is where the reading stands. The main reading goes on the left bar, the
  temperature on the right one. Clicking a bar opens the last 24 hours of the
  reading over its bands.

<img src="../img/rscontrol/zone_4_history.png" width="50%"/>

- <span>A cog <img src="../img/rsdose/cog_icon.png" width="30"/> opening the settings of the probe.</span>

An unplugged probe blinks under a light red tint, and gives no reading.

### Probe settings

<img src="../img/rscontrol/zone_4_dialog_probe.png" width="50%"/>

The dialog gathers everything about one probe: its readings, its status, its
desired and acceptable ranges (and those of its embedded temperature), the
display unit of a salinity probe, and its switches — enabled, buzzer,
notifications, and maintenance, which keeps the probe out of the temperature
fusion while it is cleaned or calibrated.

On a salinity probe, the bounds shown are those of the selected display unit: change the unit and the dialog switches to its bounds straight away.

The **Read now** button asks the hub for a fresh reading rather than waiting for
the next poll; the values of the dialog refresh in place.

The calibration buttons at the bottom only show the calibrations of the probe's
type, and none while it is unplugged. Each calibration opens its own dialog,
described per probe type below.

### Probe types

#### pH

<img src="../../src/img/redsea/RSSENSE/rssense-ph-temperature.png" width="10%"/> <img src="../../src/img/redsea/RSSENSE/rssense-ph.png" width="10%"/>

The pH reading, and the temperature when the probe has one — a pH probe without
temperature has a picture of its own, with a single bar.

The calibration takes two points, as in the ReefBeat app: pH 7 first, then pH 10
for salt water or pH 4 for fresh water, each solution given with the temperature
it is rated at. After each point the hub waits for the reading to settle: the
dialog shows the stability and the time left, and the next step only unlocks
once the hub is done. Closing the dialog cancels the calibration.

<img src="../img/rscontrol/zone_4_calibration_ph.png" width="50%"/>

#### Salinity

<img src="../../src/img/redsea/RSSENSE/rssense-salinity-temperature.png" width="10%"/>

The salinity, in the unit chosen in the probe settings, and the temperature.

The calibration takes a single point: dip the probe in the solution and enter
its value in mS/cm (between 20 and 99).

<img src="../img/rscontrol/zone_4_calibration_ec.png" width="50%"/>

#### ORP

<img src="../../src/img/redsea/RSSENSE/rssense-orp.png" width="10%"/>

The ORP in mV. To calibrate it, dip the probe in the reference solution and
enter the value of the solution: the probe then reads that value.

<img src="../img/rscontrol/zone_4_calibration_orp.png" width="50%"/>

#### Temperature

<img src="../../src/img/redsea/RSSENSE/temperature.png" width="10%"/>

The temperature, on a single bar. To calibrate it, put the probe in water whose
temperature you measured with a reference thermometer, wait for the reading to
settle, and enter the real temperature.

The embedded temperature of the pH, salinity and ATO probes is calibrated the
same way, from their own **Calibrate temperature** button.

<img src="../img/rscontrol/zone_4_calibration_temperature.png" width="50%"/>

#### ATO

<img src="../../src/img/redsea/RSSENSE/rssense-ato.png" width="10%"/>

The water level probe is drawn in the sump water, at the mark the probe
reports, as on the [ReefATO+](reefato.md#aquarium). Its temperature is shown on the black
body, just under the connector.

| State           | Meaning                                                   |
| --------------- | --------------------------------------------------------- |
| Below           | The surface is under the probe: the ATO is not keeping up |
| Desired level 1 | First top-off mark                                        |
| Desired level 2 | Second top-off mark                                       |
| Above           | The surface is over the probe: the tank is overfilled     |

**Below** and **Above** make the water blink. A probe in error has no water
line at all.

#### Leak

<img src="../../src/img/redsea/RSSENSE/rssense-leak.png" width="10%"/>

When water is detected, a puddle spreads at the foot of the probe, and a
blinking icon tells where the water comes from, as the probe reports it:

<table>
  <tr>
    <th align="center">Leak of aquarium water <img src="../img/mdi/mdi_fish.png" width="20"/></th>
    <th align="center">Leak of RO/DI water <img src="../img/mdi/mdi_cup-water.png" width="20"/></th>
  </tr>
  <tr>
    <td align="center"><img src="../img/rscontrol/zone_4_leak_aquarium.png"/></td>
    <td align="center"><img src="../img/rscontrol/zone_4_leak_rodi.png"/></td>
  </tr>
</table>

A leak probe whose detection is turned off is greyed out: it is there, it
detects nothing.

> [!NOTE]
> Probes are added, replaced and removed from the integration's options menu
> (see [ha-reefbeat-component](https://github.com/Elwinmage/ha-reefbeat-component/blob/main/doc/en/reefcontrol.md#probe-management-add--replace--remove)):
> the card follows on its own.

## 12V ports

<img src="../img/rscontrol/zone_5.png"/>

---

Each 12V port of the hub has its cog on its connector, and its consumption
above it (a click opens its more-info dialog). A powered port lights its
connector. The Pro has two ports, the cog of the second one being drawn
differently; the Lite has one.

<span>A click on the cog <img src="../img/mdi/cog-1.png" width="5%"/> opens the port settings: its name, switch, state, type and consumption, then the mode editor.</span>

<img src="../img/rscontrol/zone_5_dialog_port.png" width="50%"/>

A port is driven like a [socket of the power center](reefcontrol-power.md#socket), with the same
four modes — **On**, **Off**, **Schedule** and **Sensor** — plus the **power**
it delivers when on, in %. Nothing is sent to the hub until **Save** is pressed.
A port that was never installed is installed on save, as the ReefBeat app does.

<span>The trash icon <img src="../img/mdi/mdi_delete-empty.png" width="20"/> at the top right uninstalls the port, after a confirmation: it goes back to its factory state and loses its name, schedule and probe rule.</span>

<img src="../img/rscontrol/zone_5_dialog_delete.png" width="50%"/>

## ATO

<img src="../img/rscontrol/zone_6.png"/>

---

When a 12V port drives an ATO pump — the Red Sea ATO kit, or any pump following
an ATO probe — the pump is drawn in its reservoir, wired to its port. While the
port is powered, water flows out of the outlet above the sump.

## Messages

<img src="../img/rscontrol/zone_7.png"/>

---

This zone displays the latest system messages from the ReefControl. It has two lines:

- The grey line shows the **last message** received.
- The pink line shows the **last alert**, preceded by the ⚠ symbol.

Clicking the <img src="../img/mdi/mdi_delete-empty.png" width="20"/> icon clears the corresponding message.

These lines can be hidden via the card editor interface.

## Card editor

<img src="../img/rscontrol/editor.png" width="50%"/>

---

Besides the two message lines, the ReefControl has two options:

- **Compact probes**: each reading is shown as a dot coloured by its level
  instead of a situation bar. A sign on the dot tells on which side of the
  desired range the reading lies. Clicking the dot opens its last 24 hours, as
  the bar does.
- **Probe slots**: the probes are placed in the order the hub lists them. A
  probe can be pinned to a slot of the extension boxes instead, so the card
  matches the way the probes are actually plugged in. **Auto** gives it back to
  the hub's order.

---

[← Back to the main page](../../README.md)
