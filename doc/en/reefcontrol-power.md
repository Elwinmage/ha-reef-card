[← Back to the main page](../../README.md)

# ReefControl-Power

ReefControl and ReefControl-Power with ha-reef-card in action:

[![Watch the video](https://img.youtube.com/vi/VIDEO_ID/0.jpg)](https://www.youtube.com/watch?v=VIDEO_ID)

The ReefControl-Power card draws the power center with its sockets, what is
plugged into each of them, and on its left either its own temperature probe or
the [ReefControl](reefcontrol.md#reefcontrol) it is paired with.

Both models are supported: they only differ by their number of sockets.

<table>
  <tr>
    <th align="center">RSPOWER6</th>
    <th align="center">RSPOWER8</th>
  </tr>
  <tr>
    <td align="center"><img src="../img/rspower/rspower6.png"/></td>
    <td align="center"><img src="../img/rspower/rspower8.png"/></td>
  </tr>
</table>

The rest of this section is illustrated with the RSPOWER6: everything works the
same way on the RSPOWER8.

<img src="../img/rspower/rspower_zones.png"/>

The card is divided into 6 zones:

1. Power state and maintenance mode
2. Configuration, Wifi and battery
3. Power sockets
4. Temperature probe or ReefControl link
5. Linked devices
6. Last message and last alert

## Power state and maintenance mode

<img src="../img/rspower/zone_1.png"/>

---

<span>The on/off switch <img src="../img/mdi/mdi_power-plug.png" width="20"/> switches the ReefControl-Power between on and off states.</span>

<img src="../img/rspower/off_mode.png" width="50%"/>

Switched off, the card only keeps the on/off switch, the picture of the
temperature probe or of the paired ReefControl, and the links to other devices:
the name of the hub and the devices plugged into the sockets still open their
own card. The sockets lose their buttons, names and consumption, and the probe
its reading and settings.

<span>The maintenance switch <img src="../img/mdi/mdi_account-wrench.png" width="20"/> switches to maintenance mode.</span>

<img src="../img/rspower/maintenance.png" width="50%"/>

## Configuration / Wifi Information

<img src="../img/rspower/zone_2.png"/>

---

<span>Click the icon <img src="../img/rsdose/cog_icon.png" width="30"/> to manage the general configuration of the ReefControl-Power: refresh the settings or the polled data, reset the device, update its firmware, and see its region and number of sockets.</span>

The same dialog adds or removes the local temperature probe, and unpairs the
ReefControl. The probe and the hub exclude each other, so a button that does not
apply is greyed out rather than hidden: you can see which actions exist.

<img src="../img/rspower/zone_2_dialog_config.png" width="50%"/>

<span>Click the icon <img src="../img/mdi/wifi_icon.png" width="30"/> to manage the network settings.</span>

<img src="../img/rspower/zone_2_dialog_wifi.png" width="50%"/>

<span>The icon <img src="../img/mdi/battery.png" width="30"/> shows the battery level of the ReefControl-Power.</span>

## Power sockets

<img src="../img/rspower/zone_3.png"/>

---

The text on the face of the power center is its **operating mode** (Auto,
Setup…), next to the **total consumption** of its sockets. Clicking the
consumption opens its more-info dialog.

Each socket shows, from top to bottom:

- Its **name**.
- Its **button**, framed in the socket's colour, its icon red when the socket is
  powered and grey when it is off. It shows a plug, or the icon of the device
  plugged into it (see [Linked devices](#linked-devices)).
- Its **consumption**, which opens its more-info dialog.

Small icons at the bottom of the button tell how the socket is driven:

| Icon                                                                                                                                                                                                                                                                                                                                | Meaning                                                                     |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| <img src="../img/mdi/mdi_power.png" width="20"/>                                                                                                                                                                                                                                                                                    | On or off by hand                                                           |
| <img src="../img/mdi/mdi_clock-time-nine-outline.png" width="20"/>                                                                                                                                                                                                                                                                  | Follows a schedule — a click opens its editor                               |
| <img src="../img/mdi/mdi_thermometer.png" width="20"/> <img src="../img/mdi/mdi_ph.png" width="20"/> <img src="../img/mdi/mdi_water-percent.png" width="20"/> <img src="../img/mdi/mdi_flash-triangle.png" width="20"/> <img src="../img/mdi/mdi_water-alert.png" width="20"/> <img src="../img/mdi/mdi_cup-water.png" width="20"/> | Follows a probe: temperature, pH, salinity, ORP, leak or ATO water level    |
| <img src="../img/mdi/mdi_hand-back-left-outline.png" width="20"/>                                                                                                                                                                                                                                                                   | Its schedule or its probe is suspended: the socket was switched off by hand |

A socket that was never configured shows a **+** instead of its button: a click
opens its settings to give it a mode.

A **click** on the button opens the socket settings. A **long press** switches
the socket on or off directly.

### Socket

<img src="../img/rspower/zone_3_dialog_socket.png" width="50%"/>

The dialog starts with the name, switch, state and consumption of the socket,
then offers its four modes:

- **On** / **Off**: the socket stays powered, or not.
- **Schedule**: a 24-hour timeline and the list of its **on** intervals. Add,
  edit or remove intervals; an interval that ends before it starts, or overlaps
  the previous one, is explained under the list and blocks the save.

<img src="../img/rspower/zone_3_socket_schedule.png" width="50%"/>

- **Sensor**: the socket follows a probe — the local temperature probe of the
  power center, or any probe of the paired ReefControl, embedded temperatures
  included. Choose whether the socket turns **on** or **off**, when the reading
  goes **above** or **below** a **threshold**, with a **hysteresis** (a dead-band
  around the threshold, so the socket does not flicker), and what to do if the
  probe is lost. A socket following an ATO probe needs no threshold.

<img src="../img/rspower/zone_3_socket_sensor.png" width="50%"/>

Nothing is sent to the device until **Save** is pressed.

When a socket following a schedule or a probe was switched off by hand, the
dialog opens on that automatic mode, says it is suspended, and offers to
**resume** it without rewriting its schedule or its rule.

<img src="../img/rspower/zone_3_socket_override.png" width="50%"/>

<span>The trash icon <img src="../img/mdi/mdi_delete-empty.png" width="20"/> at the top right deletes the socket configuration, after a confirmation: the socket goes back to its factory name and has no mode anymore.</span>

<img src="../img/rspower/zone_3_dialog_delete.png" width="50%"/>

## Temperature probe or ReefControl link

The left of the card shows what the power center reads its temperature from:
its own probe, or the ReefControl it is paired with. The two exclude each other.

### Temperature probe

<img src="../img/rspower/zone_4_temperature.png"/>

---

The local temperature probe is drawn plugged into the power center, with its
reading coloured by its level, and a situation bar along the probe (a dot in the
compact mode of the card editor). Clicking the bar opens the last 24 hours of the
temperature over its bands.

A disconnected probe blinks under a light red tint.

<span>A click on the cog <img src="../img/rsdose/cog_icon.png" width="30"/> opens the probe settings: its name, a button to read it now, its desired and acceptable ranges, its calibration against the real temperature, and its logging and notification switches.</span>

<img src="../img/rspower/zone_4_dialog_temperature.png" width="50%"/>

### ReefControl link

<img src="../img/rspower/zone_4_rscontrol.png"/>

---

A paired ReefControl takes the place of the probe: its cable is drawn with the
name of the hub along it. Clicking the name opens the card of the hub.

<span>The icon <img src="../img/mdi/mdi_web.png" width="20"/> opens the link dialog: the paired hub, its type and status, and whether it is connected to the power center and to the internet.</span>

<img src="../img/rspower/zone_4_dialog_rscontrol.png" width="50%"/>

When the hub is paired but cannot be reached, the link blinks under a light red
tint.

## Linked devices

<img src="../img/rspower/zone_5.png"/>

---

The power center does not know what is plugged into its sockets: the card lets
you tell it, from the card editor. A socket linked to a Red Sea device or to an
Aqua Medic pump shows:

- a picture of the device under the socket, in two staggered rows so that
  neighbours do not overlap, joined to it by a pipe in the socket's colour
  (grey while the socket is off);
- the icon of the device on the socket button, instead of the plug.

A ReefRun pump is pictured by its job, return pump or skimmer, rather than by its
controller. Any other device known to Home Assistant can be linked too, but has
no picture yet.

For an appliance Home Assistant does not know about (a heater, a lamp, a fan…), pick **Other**: the socket button then shows <img src="../img/mdi/mdi_dots-horizontal-circle-outline.png" width="20"/> instead of the plug, with no picture below it.

The picture follows the state of the device:

| Look       | Red Sea device state                                                          |
| ---------- | ----------------------------------------------------------------------------- |
| Plain      | Running normally                                                              |
| Greyed out | Switched off                                                                  |
| Blinking   | Anything else: manual mode, maintenance, unavailable, a pump not operational… |

Devices of other integrations are always drawn plain.

Clicking the picture opens the card of the device.

## Messages

<img src="../img/rspower/zone_6.png"/>

---

This zone displays the latest system messages from the ReefControl-Power. It has two lines:

- The grey line shows the **last message** received.
- The pink line shows the **last alert**, preceded by the ⚠ symbol.

Clicking the <img src="../img/mdi/mdi_delete-empty.png" width="20"/> icon clears the corresponding message.

These lines can be hidden via the card editor interface.

## Card editor

<img src="../img/rspower/editor.png" width="50%"/>

---

Besides the two message lines, the ReefControl-Power has three options:

- **Compact probes**: the temperature is shown as a dot coloured by its level
  instead of a situation bar.
- **Sockets colors**: the colour of each socket, used by its button and by the
  pipe to its linked device.
- **Linked device**: per socket, the device plugged into it, or **None**. **Other** stands for an appliance Home Assistant does not know about.

The options are stored under the model as Home Assistant reports it:

```yaml
type: custom:reef-card
device: MY-RSPOWER
conf:
  RSPOWER6:
    devices:
      MY-RSPOWER:
        compact_probes: false
        sockets:
          socket_1:
            color: "255,0,0"
            linked_device: 0123456789abcdef0123456789abcdef
          socket_3:
            linked_device: fedcba9876543210fedcba9876543210
```

---

[← Back to the main page](../../README.md)
