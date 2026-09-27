[← Back to the main page](../../README.md)

# ReefATO

ReefATO+ with ha-reef-card in action:

[![Watch the video](https://img.youtube.com/vi/2R0DHp2eqT4/0.jpg)](https://www.youtube.com/watch?v=2R0DHp2eqT4)

The ReefATO+ card is a visual way to drive the RSATO+ controller, the RO/DI
reservoir and its pump, the water level probe clipped to the tank, and the leak
probe on the floor.

The water level probe of the ReefATO+ is always drawn. The **pump** and the
**leak probe** are optional. The one the device does not report is not drawn at
all, and the controls that depend on it are hidden with it: a ReefATO+ without a
leak probe shows a card without a leak probe, not a greyed-out one.

<img src="../img/rsato/rsato_zones.png"/>

The card is divided into 7 zones:

1. Controller: operating mode, power, maintenance mode, configuration, Wifi and automatic top-off
2. Accessory settings: ATO pump, leak probe, water level probe
3. RO/DI reservoir: fill controls, remaining volume and autonomy
4. Buzzer
5. Leak probe
6. Aquarium: water level, temperature and daily consumption
7. Last message and last alert

## Controller

<img src="../img/rsato/zone_1.png"/>

---

The text on the controller face is the **operating mode** reported by the device
(Auto, Manual, Leak…), translated into the language of Home Assistant.

<span>The on/off switch <img src="../img/mdi/mdi_power-plug.png" width="20"/> switches the ReefATO+ between on and off states.</span>

<img src="../img/rsato/off_mode.png" width="50%"/>

<span>The maintenance switch <img src="../img/mdi/mdi_account-wrench.png" width="20"/> switches to maintenance mode.</span>

<img src="../img/rsato/maintenance.png" width="50%"/>

<span>Click the icon <img src="../img/rsdose/cog_icon.png" width="30"/> to manage the general configuration of the ReefATO+: refresh the settings or the polled data, reset the device, update its firmware.</span>

<img src="../img/rsato/zone_1_dialog_config.png" width="50%"/>

<span>Click the icon <img src="../img/mdi/wifi_icon.png" width="30"/> to manage the network settings.</span>

<img src="../img/rsato/zone_1_dialog_wifi.png" width="50%"/>

<span>The switch <img src="../img/mdi/mdi_waves-arrow-up.png" width="20"/> on the second row enables or disables the **automatic top-off**. Turned off, the device never fills on its own and only the buttons of zone 3 still act on the pump. It is hidden when no pump is paired.</span>

## Accessory settings

<img src="../img/rsato/zone_2.png"/>

---

The three icons follow the three sockets of the front panel, in the same order:
from left to right the **ATO pump**, the **leak probe** and the **water level
probe**. Each one opens a dialog dedicated to that accessory. The pump and the
leak probe icons disappear with the accessory when its socket is unused.

<span>The pump icon <img src="../img/mdi/mdi_pump.png" width="30"/> shows the running state, the measured consumption and flow rate, the three current thresholds the firmware compares against to call a dry run or a blockage, and what triggered the last fill.</span>

<img src="../img/rsato/zone_2_dialog_pump.png" width="50%"/>

<span>The leak probe icon <img src="../img/mdi/mdi_pipe-leak.png" width="30"/> shows whether the probe is plugged in, whether it is armed, the wet/dry verdict and the raw reading behind it, plus the buzzer this probe drives.</span>

<img src="../img/rsato/zone_2_dialog_leak.png" width="50%"/>

<span>The level probe icon <img src="../img/mdi/mdi_hydraulic-oil-level.png" width="30"/> shows the health of the probe first — connected, calibrated, to be checked, in error — since an uncalibrated or fouled probe makes every reading below meaningless. Then the level itself, the two electrodes behind it, the temperature sensor that shares the same body, and the identity and service dates of the cartridge.</span>

<img src="../img/rsato/zone_2_dialog_ato_sensor.png" width="50%"/>

## RO/DI reservoir

<img src="../img/rsato/zone_3.png"/>

---

This zone is the reservoir the ATO draws from, and the three buttons that drive
its pump by hand:

<table>
  <tr>
    <td align="center"><img src="../img/mdi/mdi_water-pump.png" width="40"/><br/><b>Fill</b><br/>Starts a manual fill</td>
    <td align="center"><img src="../img/mdi/mdi_water-pump-off.png" width="40"/><br/><b>Stop</b><br/>Stops the fill in progress</td>
    <td align="center"><img src="../img/mdi/mdi_play-circle-outline.png" width="40"/><br/><b>Resume</b><br/>Re-enables the pump</td>
  </tr>
</table>

This part shows the level of the water reserve, computed from the declared
reservoir capacity and the actual value. An empty reservoir still shows a water
line — the one the pump cannot draw up. Below 10% the water blinks, to say that
the reservoir will soon be empty.

Clicking the water opens the reservoir dialog, where the capacity can be
edited:

<img src="../img/rsato/zone_3_dialog_ato_tank.png" width="50%"/>

The figure at the bottom left of the reservoir is the **autonomy**: the number of
days left before it runs dry, computed by the integration from the average daily
consumption. Clicking it opens its more-info dialog.

While a fill is running, water flows out of the outlet above the sump.

<img src="../img/rsato/zone_3_filling.png"/>

## Buzzer

<img src="../img/mdi/mdi_bell-ring_red.png" width="40"/>

---

<span>The bell <img src="../img/mdi/mdi_bell-ring_red.png" width="20"/> <img src="../img/mdi/mdi_bell-off_red.png" width="20"/> follows the buzzer setting of the device, and greys out when it is off.</span>

A click opens the buzzer dialog: the setting itself, whether it is sounding right
now, and the state of the leak probe as context.

<img src="../img/rsato/zone_4_dialog_buzzer.png" width="50%"/>

A **long press** toggles the buzzer directly. The two gestures are deliberately
split: silencing the alarm is a safety setting, not something to do by accident
while reaching for the details.

> [!NOTE]
> The buzzer is not the leak alarm alone: the device also sounds it on pump
> faults, so it stays available on a ReefATO+ with no leak probe. The icon is
> hidden only on integration versions that do not expose the setting yet.

## Leak probe

<img src="../img/rsato/zone_5.png"/>

---

The probe is drawn only when it is physically plugged in. Plugged in but turned
off in the app, it is greyed out: it is there, it detects nothing.

When water is detected the probe blinks, and a puddle spreads at the foot of the
picture.

<table>
  <tr>
    <th align="center">Leak in the aquarium</th>
    <th align="center">Leak in the RO/DI reservoir</th>
    <th align="center">Leak from an unknown source</th>
  </tr>
  <tr>
    <td align="center"><img src="../img/rsato/zone_5_leak_aquarium.png"/></td>
    <td align="center"><img src="../img/rsato/zone_5_leak_rodi.png"/></td>
    <td align="center"><img src="../img/rsato/zone_5_leak_unknown.png"/></td>
  </tr>
</table>

## Aquarium

<img src="../img/rsato/zone_6.png"/>

---

The water level in this part shows the detection state of the ATO probe.

| State           | Meaning                                                   |
| --------------- | --------------------------------------------------------- |
| Below           | The surface is under the probe: the ATO is not keeping up |
| Desired level 1 | First top-off mark                                        |
| Desired level 2 | Second top-off mark                                       |
| Above           | The surface is over the probe: the tank is overfilled     |

Both ends are abnormal, so **Below** and **Above** make the water blink. A probe
in error, or an entity that has not reported yet, has no height at all: the card
draws its no-reading mark rather than an empty tank.

<table>
  <tr>
    <th align="center">Below</th>
    <th align="center">Desired level 1</th>
    <th align="center">Desired level 2</th>
    <th align="center">Above</th>
    <th align="center">No reading</th>
  </tr>
  <tr>
    <td align="center"><img src="../img/rsato/zone_6_water_level_below.png"/></td>
    <td align="center"><img src="../img/rsato/zone_6_water_level_1.png"/></td>
    <td align="center"><img src="../img/rsato/zone_6_water_level_2.png"/></td>
    <td align="center"><img src="../img/rsato/zone_6_water_level_above.png"/></td>
    <td align="center"><img src="../img/rsato/zone_6_water_level_error.png"/></td>
  </tr>
</table>

The temperature at the bottom of the tank comes from the sensor built into the
level probe, and is only reported when it is enabled on the device.

The chart in the corner is the **consumption of the day**: the volume topped off
since midnight, filled in orange, against the running daily average in red. The
window is pinned to the calendar day rather than to a rolling 24 hours, since the
counter resets at midnight.

Clicking the chart opens the consumption dialog, the same story with the figures
spelled out: fills and volume, each read today, as a daily average and as a
lifetime total, plus what the reservoir has left to feed them.

<img src="../img/rsato/zone_6_dialog_usage.png" width="50%"/>

## Faults

The card has no separate warning light: whatever is at fault is what blinks,
under a light red tint.

| Blinking element  | What the device is reporting                                                                   |
| ----------------- | ---------------------------------------------------------------------------------------------- |
| The pump          | Malfunction, stalled pump, fill timeout, empty reservoir, or a missing level probe             |
| The leak probe    | Water detected, on the RO/DI side or on the aquarium side                                      |
| The water level   | The surface is below or above the probe                                                        |
| The whole picture | The level probe asks to be checked, or fails to read — every level shown becomes untrustworthy |

A pump reported as missing is not a fault: the pump, the fill buttons, the
reservoir and the consumption chart are simply not drawn.

## Messages

<img src="../img/rsato/zone_7.png"/>

---

This zone displays the latest system messages from the ReefATO+. It has two lines:

- The grey line shows the **last message** received.
- The pink line shows the **last alert**, preceded by the ⚠ symbol.

Clicking the <img src="../img/mdi/mdi_delete-empty.png" width="20"/> icon clears the corresponding message.

These lines can be hidden via the card editor interface.

## Card editor

<img src="../img/rsato/editor.png" width="50%"/>

---

Besides the two message lines, the ReefATO+ has three options. They exist for a
top-off loop the device was not designed for: an RO unit plumbed straight to the
sump, with a valve driven by Home Assistant rather than by the Red Sea pump.

### Infinite RO/DI reservoir

Off by default. An RO unit that tops off on the fly has no container, so nothing
can run out — and everything the card says about a reservoir is about a tank
that does not exist.

Turned on, the percentage on the reservoir and the dialog behind it are dropped,
the autonomy becomes ∞, and the pump settings icon and the resume button are
hidden: a continuous feed has no fill cycle to hand back to the device. The
water, the fill controls and the consumption chart stay.

### Dispensed volume entity

A switch and an entity picker. Turned on, the orange curve of the daily chart is
read from an entity of your own — a flow meter on the RO line — instead of the
device counter. The red running average stays the device's: only the source of
the volume moves, not the comparison it is drawn against.

The switch is what enables it, so an entity left over from an earlier
configuration is ignored rather than silently taking over again.

### Fill and Stop fill entities

Either button can be bound to an entity of another integration, to drive your
own valve. The service is derived from the domain of the entity, since picking
one already says which it is:

| Domain of the entity      | Fill         | Stop          |
| ------------------------- | ------------ | ------------- |
| `button`, `input_button`  | `press`      | `press`       |
| `switch`, `input_boolean` | `turn_on`    | `turn_off`    |
| `valve`                   | `open_valve` | `close_valve` |
| `script`                  | `turn_on`    | `turn_on`     |

A single switch is a complete control: on fills, off stops. Leave the other
picker empty and the second button reuses the same entity with the opposite
service — the same goes for an `input_boolean` or a `valve`. Two press-once
buttons have to be picked separately, since a press carries no direction.

A bound control no longer follows the Red Sea pump either: it stays visible on a
ReefATO+ that reports no pump at all, which is the point of binding it.

The options are stored under the model as Home Assistant reports it:

```yaml
type: custom:reef-card
device: MY-RSATO
conf:
  RSATO+:
    devices:
      MY-RSATO:
        infinite_tank: true
        external_usage: true
        external_usage_entity: sensor.rodi_flow_meter
        fill_entity: switch.rodi_valve
        stop_fill_entity: "" # left empty: the switch above stops it too
```

---

[← Back to the main page](../../README.md)
