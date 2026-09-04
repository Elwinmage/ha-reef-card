# ha-reef-card 🪸 for HomeAssistant

> Part of the [**ReefTech Project Ecosystem**](https://elwinmage.github.io/reeftank/)

<p align="center">
  <img src="icon.png"  width="50%"/>
</p>

[![GH-release](https://img.shields.io/github/v/release/Elwinmage/ha-reef-card.svg?style=flat-square)](https://github.com/Elwinmage/ha-reef-card/releases)
[![GH-last-commit](https://img.shields.io/github/last-commit/Elwinmage/ha-reef-card.svg?style=flat-square)](https://github.com/Elwinmage/ha-reef-card/commits/main)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

<!-- [![hacs_badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg?style=flat-square)](https://github.com/hacs/integration) -->

[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Lit](https://img.shields.io/badge/Lit-3.3-blue?style=flat-square&logo=lit)](https://lit.dev/)
[![codecov](https://codecov.io/gh/Elwinmage/ha-reef-card/branch/main/graph/badge.svg?token=XXXX)](https://codecov.io/gh/Elwinmage/ha-reef-card)
[![BuyMeCoffee][buymecoffeebadge]][buymecoffee]

# Supported languages : [<img src="https://flagicons.lipis.dev/flags/4x3/fr.svg" width="5%"/>](doc/fr/README.fr.md) [<img src="https://flagicons.lipis.dev/flags/4x3/gb.svg" width="5%"/>](README.md) [<img src="https://flagicons.lipis.dev/flags/4x3/es.svg" width="5%"/>](doc/es/README.es.md) [<img src="https://flagicons.lipis.dev/flags/4x3/pt.svg" width="5%"/>](doc/pt/README.pt.md) [<img src="https://flagicons.lipis.dev/flags/4x3/de.svg" width="5%"/>](doc/de/README.de.md) [<img src="https://flagicons.lipis.dev/flags/4x3/it.svg" width="5%"/>](doc/it/README.it.md) [<img src="https://flagicons.lipis.dev/flags/4x3/pl.svg" width="5%"/>](doc/pl/README.pl.md)

<!-- Vous souhaitez aider à la traduction, suivez ce [guide](https://github.com/Elwinmage/ha-reef-card/blob/main/doc/TRANSLATION.md). -->

Your language is not yet supported and you want to help with the translation? Follow this [guide](https://github.com/Elwinmage/ha-reef-card/blob/main/doc/TRANSLATION.md).

# Overview

The **Reef card** for Home Assistant helps you manage your reef aquarium.

Combined with [ha-reefbeat-component](https://github.com/Elwinmage/ha-reefbeat-component), it automatically supports your
Redsea (ReefBeat) devices, and [ha-reef-maintenance-component](https://github.com/Elwinmage/ha-reef-maintenance-component)
adds the equipment Home Assistant cannot talk to to the maintenance view.

Support for the Aqua Medic devices of [ha-aquamedic-component](https://github.com/Elwinmage/ha-aquamedic-component) is on
its way; their maintenance tasks already show up in that same view.

<!-- ecosystem:start -->

## Related projects

The ReefTech projects fit together: the integrations bring your equipment into Home Assistant, the card displays and drives it, and the backup keeps it running through an outage. Each one also works on its own.

<table>
  <tr>
    <th width="100px"></th>
    <th>Project</th>
    <th>What it does</th>
    <th>Works with</th>
  </tr>
  <tr>
    <td><img src="https://raw.githubusercontent.com/Elwinmage/ha-reefbeat-component/main/icon.png" width="64" alt="ha-reefbeat-component" /></td>
    <td>🐠<br /><a href="https://github.com/Elwinmage/ha-reefbeat-component"><b>ha-reefbeat-component</b></a></td>
    <td>Red Sea ReefBeat devices, controlled locally with no cloud: ReefATO+, ReefControl, ReefControl-Power, ReefDose, ReefLed, ReefMat, ReefRun and ReefWave.<br />alert blueprint for abnormal modes, calibrations and low battery. <a href="https://my.home-assistant.io/redirect/blueprint_import/?blueprint_url=https://raw.githubusercontent.com/Elwinmage/ha-reefbeat-component/refs/heads/main/blueprints/automation/redsea_alerts.en.yaml"><img src="https://my.home-assistant.io/badges/blueprint_import.svg" alt="Open your Home Assistant instance and show the blueprint import dialog with a specific blueprint pre-filled." /></a></td>
    <td>ha-reef-card</td>
  </tr>
  <tr>
    <td><img src="https://raw.githubusercontent.com/Elwinmage/ha-aquamedic-component/main/icon.png" width="64" alt="ha-aquamedic-component" /></td>
    <td>🌊<br /><a href="https://github.com/Elwinmage/ha-aquamedic-component"><b>ha-aquamedic-component</b></a></td>
    <td>Aqua Medic pumps through the Gizwits cloud API: EcoDrift and SmartDrift wavemakers, DC Runner return and skimmer pumps.</td>
    <td>ha-reef-card</td>
  </tr>
  <tr>
    <td><img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-maintenance-component/main/icon.png" width="64" alt="ha-reef-maintenance-component" /></td>
    <td>🐙<br /><a href="https://github.com/Elwinmage/ha-reef-maintenance-component"><b>ha-reef-maintenance-component</b></a></td>
    <td>Cleaning and wear tracking for the equipment Home Assistant cannot talk to: flow pumps, return pumps, skimmers, media reactors, anything you service by hand.</td>
    <td>ha-reef-card</td>
  </tr>
  <tr>
    <td><img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/icon.png" width="64" alt="ha-reef-card" /></td>
    <td>🪸<br /><b>ha-reef-card</b><br /><i>(this repository)</i></td>
    <td>Interactive graphical view of each device on your dashboard, and the only way to edit advanced schedules. Reads the three integrations above through the shared <code>reef_role</code> contract, with no card-side configuration.</td>
    <td>all three integrations</td>
  </tr>
  <tr>
    <td><img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-blueprints/main/icon.png" width="64" alt="ha-reef-blueprints" /></td>
    <td>🐬<br /><a href="https://github.com/Elwinmage/ha-reef-blueprints"><b>ha-reef-blueprints</b></a></td>
    <td>Notification blueprints shared by the whole ecosystem: overdue maintenance found through the <code>reef_role</code> contract, and devices that went unreachable. Eight languages.</td>
    <td>all three integrations</td>
  </tr>
  <tr>
    <td><img src="https://raw.githubusercontent.com/Elwinmage/reefbeatEnergyBackup/main/icon.png" width="64" alt="reefbeatEnergyBackup" /></td>
    <td>⚡<br /><a href="https://github.com/Elwinmage/reefbeatEnergyBackup"><b>reefbeatEnergyBackup</b></a></td>
    <td>Battery backup for power outages. A 24V LiFePO₄ pack driven by a Raspberry Pi, with pump speed degraded progressively according to the state of charge.</td>
    <td>standalone, or alongside ha-reefbeat-component</td>
  </tr>
</table>

All of them are documented together on the [ReefTech project page](https://elwinmage.github.io/reeftank/).

<!-- ecosystem:end -->

> [!NOTE]
> If you have non-Redsea devices and want them to be supported, you can request it [here](https://github.com/Elwinmage/ha-reef-card/discussions/2).

> [!TIP]
> The list of upcoming features is available [here](https://github.com/Elwinmage/ha-reef-card/issues?q=is%3Aissue%20state%3Aopen%20label%3Aenhancement)<br />
> The list of bugs is available [here](https://github.com/Elwinmage/ha-reef-card/issues?q=is%3Aissue%20state%3Aopen%20label%3Abug)

# Compatibility

> ✅ Supported &nbsp;|&nbsp; 🚧 In progress &nbsp;|&nbsp; 🧪 Untested (may work) &nbsp;|&nbsp; ❌ Not yet supported

<table>
  <th>
    <td ><b>Model</b></td>
    <td colspan="2"><b>Status</b></td>
    <td><b>Issues</b>  <br/>📆(Planned) <br/> 🐛(Bugs)</td>
  </th>
  <tr>
    <td><a href="#reefato">ReefATO+</a></td>
    <td>RSATO+</td><td>✅</td>
    <td width="200px"><img src="https://raw.githubusercontent.com/Elwinmage/ha-reefbeat-component/main/doc/img/RSATO+.png"/></td>
    <td>
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rsato,all label:enhancement" style="text-decoration:none">📆</a>
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rsato,all label:bug" style="text-decoration:none">🐛</a>
    </td>
  </tr>
  <tr>
    <td rowspan="2"><a href="#reefcontrol">ReefControl</a></td>
    <td>RSCONTROLPRO</td><td>❌</td>
    <td width="200px"><img src="https://raw.githubusercontent.com/Elwinmage/ha-reefbeat-component/main/doc/img/RSCONTROLPRO.png"/></td>
    <td rowspan="2">
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rscontrol,all label:enhancement" style="text-decoration:none">📆</a>
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rscontrol,all label:bug" style="text-decoration:none">🐛</a>
    </td>
  </tr>
  <tr>
    <td>RSCONTROLLITE</td><td>❌</td>
    <td width="200px"><img src="https://raw.githubusercontent.com/Elwinmage/ha-reefbeat-component/main/doc/img/RSCONTROLLITE.png"/></td>
  </tr>
  <tr>
    <td rowspan="2"><a href="#reefcontrol-power">ReefControl-Power</a></td>
    <td>RSPOWER6</td><td>🚧</td>
    <td width="200px"><img src="https://raw.githubusercontent.com/Elwinmage/ha-reefbeat-component/main/doc/img/RSPOWER6.png"/></td>
    <td rowspan="2">
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rspower,all label:enhancement" style="text-decoration:none">📆</a>
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rspower,all label:bug" style="text-decoration:none">🐛</a>
    </td>
  </tr>
  <tr>
    <td>RSPOWER8</td><td>🚧</td>
    <td width="200px"><img src="https://raw.githubusercontent.com/Elwinmage/ha-reefbeat-component/main/doc/img/RSPOWER8.png"/></td>
  </tr>
  <tr>
    <td rowspan="2"><a href="#reefdose">ReefDose</a></td>
    <td>RSDOSE2</td>
    <td>✅</td>
    <td width="200px"><img src="https://raw.githubusercontent.com/Elwinmage/ha-reefbeat-component/main/doc/img/RSDOSE2.png"/></td>
      <td rowspan="2">
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rsdose,all label:enhancement" style="text-decoration:none">📆</a>
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rsdose,all label:bug" style="text-decoration:none">🐛</a>
    </td>
  </tr>
  <tr>
    <td>RSDOSE4</td><td>✅</td>
    <td width="200px"><img src="https://raw.githubusercontent.com/Elwinmage/ha-reefbeat-component/main/doc/img/RSDOSE4.png"/></td>
    </tr>
  <tr>
    <td rowspan="2"> <a href="#reefled">ReefLed</a></td>
    <td>G1</td>
    <td>❌</td>
    <td width="200px"><img src="https://raw.githubusercontent.com/Elwinmage/ha-reefbeat-component/main/doc/img/rsled_g1.png"/></td>
<td rowspan="2">   
    <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rsled,all label:enhancement" style="text-decoration:none">📆</a>
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rsled,all label:bug" style="text-decoration:none">🐛</a>
</td>
  </tr>
  <tr>
    <td>G2</td>
    <td>❌</td>
    <td width="200px"><img src="https://raw.githubusercontent.com/Elwinmage/ha-reefbeat-component/main/doc/img/rsled_g2.png"/></td>
  </tr>
  <tr>
    <td rowspan="3"><a href="#reefmat">ReefMat</a></td>
    <td>RSMAT250</td>
    <td>✅</td>
    <td rowspan="3" width="200px"><img src="https://raw.githubusercontent.com/Elwinmage/ha-reefbeat-component/main/doc/img/RSMAT.png"/></td>
    <td rowspan="3">
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rsmat,all label:enhancement" style="text-decoration:none">📆</a>
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rsmat,all label:bug" style="text-decoration:none">🐛</a>
    </td>
  </tr>
  <tr>
    <td>RSMAT500</td>
    <td>✅</td>
  </tr>
  <tr>
    <td>RSMAT1200</td>
    <td>✅</td>
  </tr>
  <tr>
    <td><a href="#reefrun">ReefRun</a></td>
    <td>RSRUN</td><td>✅</td>
    <td width="200px"><img src="https://raw.githubusercontent.com/Elwinmage/ha-reefbeat-component/main/doc/img/RSRUN.png"/></td>
    <td>
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rsrun,all label:enhancement" style="text-decoration:none">📆</a>
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rsrun,all label:bug" style="text-decoration:none">🐛</a>
    </td>
  </tr>
  <tr>
    <td><a href="#reefwave">ReefWave</a></td>
    <td>RSWAVE</td><td>❌</td>
    <td width="200px"><img src="https://raw.githubusercontent.com/Elwinmage/ha-reefbeat-component/main/doc/img/RSWAVE.png"/></td>
    <td>
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rswave,all label:enhancement" style="text-decoration:none">📆</a>
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rswave,all label:bug" style="text-decoration:none">🐛</a>
    </td>
  </tr>
  <tr>
    <td colspan="5"><b>Aqua Medic</b> — through <a href="https://github.com/Elwinmage/ha-aquamedic-component">ha-aquamedic-component</a></td>
  </tr>
  <tr>
    <td rowspan="3">Aqua Medic</td>
    <td>EcoDrift / SmartDrift x.1 / x.3<br />(wavemaker)</td><td>❌</td>
    <td width="200px"><img src="https://raw.githubusercontent.com/Elwinmage/ha-aquamedic-component/main/doc/img/drift.png" width="120"/></td>
    <td rowspan="3">
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:aquamedic,all label:enhancement" style="text-decoration:none">📆</a>
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:aquamedic,all label:bug" style="text-decoration:none">🐛</a>
    </td>
  </tr>
  <tr>
    <td>DC Runner<br />(return pump)</td><td>❌</td>
    <td width="200px"><img src="https://raw.githubusercontent.com/Elwinmage/ha-aquamedic-component/main/doc/img/runner.png" width="120"/></td>
  </tr>
  <tr>
    <td>DC Runner<br />(skimmer pump)</td><td>❌</td>
    <td width="200px"><img src="https://raw.githubusercontent.com/Elwinmage/ha-aquamedic-component/main/doc/img/skimmer.png" width="120"/></td>
  </tr>
</table>

> [!NOTE]
> The DC Runner return pump and skimmer pump are the same hardware with different pump heads: same firmware, same Gizwits product key, identical entities. The integration tells them apart through its **Pump role** select, and the card will follow that role.

# Table of contents

- [Installation](https://github.com/Elwinmage/ha-reef-card/#installation)
- [Configuration](https://github.com/Elwinmage/ha-reef-card/#configuration)
- [ReefATO+](https://github.com/Elwinmage/ha-reef-card/#reefato)
- [ReefControl](https://github.com/Elwinmage/ha-reef-card/#reefcontrol)
- [ReefDose](https://github.com/Elwinmage/ha-reef-card/#reefdose)
- [ReefLED](https://github.com/Elwinmage/ha-reef-card/#reefled)
- [ReefMat](https://github.com/Elwinmage/ha-reef-card/#reefmat)
- [ReefRun](https://github.com/Elwinmage/ha-reef-card/#reefrun)
- [ReefWave](https://github.com/Elwinmage/ha-reef-card/#reefwave)
- [Maintenance](https://github.com/Elwinmage/ha-reef-card/#maintenance)
- [FAQ](https://github.com/Elwinmage/ha-reef-card/#faq)

# Installation

## Direct installation

Click here to open the repository directly in HACS and click "Download": [![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=Elwinmage&repository=ha-reef-card&category=plugin)

## Search in HACS

Or search for «reef-card» in HACS.

<p align="center">
<img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/hacs_search.png" alt="Image">
</p>

# Configuration

Without the `device` parameter, the card automatically detects all ReefBeat devices and lets you choose the one you want.

To remove device selection and force a specific one, set the `device` parameter to the name of your device.

<table>
  <tr>
<td><img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/card_rsdose4_config_2.png"/></td>
<td><img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/card_rsdose4_config.png"/></td>
    </tr>
</table>

# ReefATO

ReefATO+ with ha-reef-card in action:

<!-- TODO: replace BOEswDYcNO8 by the youtube id of the ReefATO+ video -->
<!-- Issue URL: https://github.com/Elwinmage/ha-reef-card/issues/93 -->

[![Watch the video](https://img.youtube.com/vi/BOEswDYcNO8/0.jpg)](https://www.youtube.com/watch?v=BOEswDYcNO8)

The ReefATO+ card is a visual way to drive the RSATO+ controller, the RO/DI
reservoir and its pump, the water level probe clipped to the tank, and the leak
probe on the floor.

The water level probe of the ReefATO+ is always drawn. The **pump** and the
**leak probe** are optional. The one the device does not report is not drawn at
all, and the controls that depend on it are hidden with it: a ReefATO+ without a
leak probe shows a card without a leak probe, not a greyed-out one.

<img src="doc/img/rsato/rsato_zones.png"/>

The card is divided into 7 zones:

1. Controller: operating mode, power, maintenance mode, configuration, Wifi and automatic top-off
2. Accessory settings: ATO pump, leak probe, water level probe
3. RO/DI reservoir: fill controls, remaining volume and autonomy
4. Buzzer
5. Leak probe
6. Aquarium: water level, temperature and daily consumption
7. Last message and last alert

## Controller

<img src="doc/img/rsato/zone_1.png"/>

---

The text on the controller face is the **operating mode** reported by the device
(Auto, Manual, Leak…), translated into the language of Home Assistant.

<span>The on/off switch <img src="doc/img/mdi/mdi_power-plug.png" width="20"/> switches the ReefATO+ between on and off states.</span>

<img src="doc/img/rsato/off_mode.png" width="50%"/>

<span>The maintenance switch <img src="doc/img/mdi/mdi_account-wrench.png" width="20"/> switches to maintenance mode.</span>

<img src="doc/img/rsato/maintenance.png" width="50%"/>

<span>Click the icon <img src="doc/img/rsdose/cog_icon.png" width="30"/> to manage the general configuration of the ReefATO+: refresh the settings or the polled data, reset the device, update its firmware.</span>

<img src="doc/img/rsato/zone_1_dialog_config.png" width="50%"/>

<span>Click the icon <img src="doc/img/mdi/wifi_icon.png" width="30"/> to manage the network settings.</span>

<img src="doc/img/rsato/zone_1_dialog_wifi.png" width="50%"/>

<span>The switch <img src="doc/img/mdi/mdi_waves-arrow-up.png" width="20"/> on the second row enables or disables the **automatic top-off**. Turned off, the device never fills on its own and only the buttons of zone 3 still act on the pump. It is hidden when no pump is paired.</span>

## Accessory settings

<img src="doc/img/rsato/zone_2.png"/>

---

The three icons follow the three sockets of the front panel, in the same order:
from left to right the **ATO pump**, the **leak probe** and the **water level
probe**. Each one opens a dialog dedicated to that accessory. The pump and the
leak probe icons disappear with the accessory when its socket is unused.

<span>The pump icon <img src="doc/img/mdi/mdi_pump.png" width="30"/> shows the running state, the measured consumption and flow rate, the three current thresholds the firmware compares against to call a dry run or a blockage, and what triggered the last fill.</span>

<img src="doc/img/rsato/zone_2_dialog_pump.png" width="50%"/>

<span>The leak probe icon <img src="doc/img/mdi/mdi_pipe-leak.png" width="30"/> shows whether the probe is plugged in, whether it is armed, the wet/dry verdict and the raw reading behind it, plus the buzzer this probe drives.</span>

<img src="doc/img/rsato/zone_2_dialog_leak.png" width="50%"/>

<span>The level probe icon <img src="doc/img/mdi/mdi_hydraulic-oil-level.png" width="30"/> shows the health of the probe first — connected, calibrated, to be checked, in error — since an uncalibrated or fouled probe makes every reading below meaningless. Then the level itself, the two electrodes behind it, the temperature sensor that shares the same body, and the identity and service dates of the cartridge.</span>

<img src="doc/img/rsato/zone_2_dialog_ato_sensor.png" width="50%"/>

## RO/DI reservoir

<img src="doc/img/rsato/zone_3.png"/>

---

This zone is the reservoir the ATO draws from, and the three buttons that drive
its pump by hand:

<table>
  <tr>
    <td align="center"><img src="doc/img/mdi/mdi_water-pump.png" width="40"/><br/><b>Fill</b><br/>Starts a manual fill</td>
    <td align="center"><img src="doc/img/mdi/mdi_water-pump-off.png" width="40"/><br/><b>Stop</b><br/>Stops the fill in progress</td>
    <td align="center"><img src="doc/img/mdi/mdi_play-circle-outline.png" width="40"/><br/><b>Resume</b><br/>Re-enables the pump</td>
  </tr>
</table>

This part shows the level of the water reserve, computed from the declared
reservoir capacity and the actual value. An empty reservoir still shows a water
line — the one the pump cannot draw up. Below 10% the water blinks, to say that
the reservoir will soon be empty.

Clicking the water opens the reservoir dialog, where the capacity can be
edited:

<img src="doc/img/rsato/zone_3_dialog_ato_tank.png" width="50%"/>

The figure at the bottom left of the reservoir is the **autonomy**: the number of
days left before it runs dry, computed by the integration from the average daily
consumption. Clicking it opens its more-info dialog.

While a fill is running, water flows out of the outlet above the sump.

<img src="doc/img/rsato/zone_3_filling.png"/>

## Buzzer

<img src="doc/img/mdi/mdi_bell-ring_red.png" width="40"/>

---

<span>The bell <img src="doc/img/mdi/mdi_bell-ring_red.png" width="20"/> <img src="doc/img/mdi/mdi_bell-off_red.png" width="20"/> follows the buzzer setting of the device, and greys out when it is off.</span>

A click opens the buzzer dialog: the setting itself, whether it is sounding right
now, and the state of the leak probe as context.

<img src="doc/img/rsato/zone_4_dialog_buzzer.png" width="50%"/>

A **long press** toggles the buzzer directly. The two gestures are deliberately
split: silencing the alarm is a safety setting, not something to do by accident
while reaching for the details.

> [!NOTE]
> The buzzer is not the leak alarm alone: the device also sounds it on pump
> faults, so it stays available on a ReefATO+ with no leak probe. The icon is
> hidden only on integration versions that do not expose the setting yet.

## Leak probe

<img src="doc/img/rsato/zone_5.png"/>

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
    <td align="center"><img src="doc/img/rsato/zone_5_leak_aquarium.png"/></td>
    <td align="center"><img src="doc/img/rsato/zone_5_leak_rodi.png"/></td>
    <td align="center"><img src="doc/img/rsato/zone_5_leak_unknown.png"/></td>
  </tr>
</table>

## Aquarium

<img src="doc/img/rsato/zone_6.png"/>

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
    <td align="center"><img src="doc/img/rsato/zone_6_water_level_below.png"/></td>
    <td align="center"><img src="doc/img/rsato/zone_6_water_level_1.png"/></td>
    <td align="center"><img src="doc/img/rsato/zone_6_water_level_2.png"/></td>
    <td align="center"><img src="doc/img/rsato/zone_6_water_level_above.png"/></td>
    <td align="center"><img src="doc/img/rsato/zone_6_water_level_error.png"/></td>
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

<img src="doc/img/rsato/zone_6_dialog_usage.png" width="50%"/>

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

<img src="doc/img/rsato/zone_7.png"/>

---

This zone displays the latest system messages from the ReefATO+. It has two lines:

- The grey line shows the **last message** received.
- The pink line shows the **last alert**, preceded by the ⚠ symbol.

Clicking the <img src="doc/img/mdi/mdi_delete-empty.png" width="20"/> icon clears the corresponding message.

These lines can be hidden via the card editor interface.

## Card editor

<img src="doc/img/rsato/editor.png" width="50%"/>

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

# ReefControl

Planned.

Want it supported sooner? Vote [here](https://github.com/Elwinmage/ha-reef-card/discussions/22).

# ReefDose

ReefDose with ha-reef-card in action:

[![Watch the video](https://img.youtube.com/vi/Qee5LH0T9wQ/0.jpg)](https://www.youtube.com/watch?v=Qee5LH0T9wQ)

The ReefDose card is divided into 6 zones:

1.  Configuration/WiFi Information
2.  States
3.  Manual Dosing
4.  Head configuration and scheduling
5.  Supplement management
6.  Future dose queue

<img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/rsdose4_ex1.png"/>

## Configuration/WiFi Information

<img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/zone_1.png"/>

---

<span >Click the icon <img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/cog_icon.png" width="30" /> to manage the general configuration of the ReefDose.</span>

<img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/zone_1_dialog_config.png"/>

<span>Click the icon <img width="30px" src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/wifi_icon.png"/> to manage the network settings.</span>

<img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/zone_1_dialog_wifi.png"/>

## States

 <img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/zone_2.png"/>

---

<span>The maintenance switch <img width="30px" src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/zone_2_maintenance.png"/> switches the device to maintenance mode.</span>

 <img  src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/maintenance_view.png"/>

<span>The on/off switch <img width="30px" src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/zone_2_off.png"/> toggles the ReefDose between on and off states.</span>

 <img  src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/off_view.png"/>

## Manual Dosing

<img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/zone_3.png"/>

---

<span>The button <img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/zone_3_manula_config_button.png"/> displays the default manual dose for this head. Clicking it opens the configuration dialog for this dosing.</span>

<img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/zone_3_dialog_manual_dose_without.png"/>

You can add shortcuts using the card editor:

<img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/editor.png"/>

For example, head 1 offers 2, 5, and 10 mL as shortcuts.

These values will appear at the top of the dialog. Clicking a shortcut sends a command to dose the defined value.

<img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/zone_3_dialog_manual_dose.png"/>

<span>Pressing the manual dose button: <img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/zone_3_manual_button.png"/> sends a dose command with the default value displayed just above: <img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/zone_3_manual_dose.png"/>, i.e. 10 mL in this example.
</span>

## Head configuration and scheduling

 <img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/zone_4.png"/>

---

This zone allows you to view the current head schedule and change it.

- The colored circular ring indicates the percentage of the daily dose already delivered.
- The yellow number at the top shows the cumulative daily manual dose total.
- The central part shows the volume delivered compared to the total programmed daily volume.
- The blue lower part shows the number of doses delivered compared to the total doses for the day (example: 14/24 for blue because it is an hourly schedule and this screenshot was taken at 14:15). The values for purple and green show 0/0 because these doses are scheduled for 8:00 but the integration was started after 8:00, so there will be no doses today.
- A long press on one of the 4 heads toggles it on/off.
- A click on a head opens the scheduling dialog.
  From this dialog you can run a priming cycle, recalibrate the head, change the daily dose and its schedule. Don't forget to save the schedule before closing.

  <img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/zone_4_dialog_schedule.png"/>

## Supplement management

 <img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/zone_5.png"/>

---

This zone is used to manage supplements.
If a supplement is already declared, clicking on it will open the configuration dialog where you can:

- Delete the supplement (trash icon at the top right)
- Specify the total volume of the container
- Specify the actual volume of the supplement
- Decide whether you want to track the remaining volume. Clicking the shortcuts at the top will enable tracking and set default values for a full container.
- Change the display name of the supplement.

 <img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/zone_5_dialog_container.png"/>

If no supplement is linked to a head, you can add one by clicking on the container with a '+' (head 4 in our example).

<img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/zone_5_add_container.png"/>

Then follow the instructions:

<img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/zone_5_dialog_add.png"/>

### Supplements

Here is the list of supported images for supplements, grouped by brand. If yours has a ❌, you can request its addition [here](https://github.com/Elwinmage/ha-reef-card/discussions/25).

<details>
<summary><b>ATI &nbsp; <sup>2/2 🖼️</sup></b></summary>

<table>
<tr><td>✅</td><td>Essential Pro 1</td><td><img style='width:20%;' src='public/img/supplements/69692902-dcf9-4f41-b104-402154dc348a.supplement.png'/></td></tr>
<tr><td>✅</td><td>Essential Pro 2</td><td><img style='width:20%;' src='public/img/supplements/e1dbec89-2396-4269-8f28-ab7534cb2d7d.supplement.png'/></td></tr>
</table>
</details>

<details>
<summary><b>Aqua Forest &nbsp; <sup>3/9 🖼️</sup></b></summary>

<table>
<tr><td>✅</td><td>Ca Plus</td><td><img style='width:20%;' src='public/img/supplements/9ea6c9f2-b6f3-41ee-9370-06457f286fe5.supplement.png'/></td></tr>
<tr><td>❌</td><td colspan='2'>Calcium </td></tr>
<tr><td>❌</td><td colspan='2'>Component 1+</td></tr>
<tr><td>❌</td><td colspan='2'>Component 2+</td></tr>
<tr><td>❌</td><td colspan='2'>Component 3+</td></tr>
<tr><td>❌</td><td colspan='2'>KH Buffer</td></tr>
<tr><td>✅</td><td>KH Plus</td><td><img style='width:20%;' src='public/img/supplements/e391e8d1-0d4c-4355-8887-9231500703ef.supplement.png'/></td></tr>
<tr><td>❌</td><td colspan='2'>Magnesium</td></tr>
<tr><td>✅</td><td>Mg Plus</td><td><img style='width:20%;' src='public/img/supplements/deb3a943-68a5-40a9-860b-e6d259eee947.supplement.png'/></td></tr>
</table>
</details>

<details>
<summary><b>BRS &nbsp; <sup>0/4 🖼️</sup></b></summary>

<table>
<tr><td>❌</td><td colspan='2'>Liquid Calcium</td></tr>
<tr><td>❌</td><td colspan='2'>Liquid alkalinity</td></tr>
<tr><td>❌</td><td colspan='2'>Magnesium Mix</td></tr>
<tr><td>❌</td><td colspan='2'>Part C</td></tr>
</table>
</details>

<details>
<summary><b>Brightwell &nbsp; <sup>0/12 🖼️</sup></b></summary>

<table>
<tr><td>❌</td><td colspan='2'>Calcion</td></tr>
<tr><td>❌</td><td colspan='2'>Ferrion</td></tr>
<tr><td>❌</td><td colspan='2'>Hydrate - MG</td></tr>
<tr><td>❌</td><td colspan='2'>KoralAmino</td></tr>
<tr><td>❌</td><td colspan='2'>Koralcolor</td></tr>
<tr><td>❌</td><td colspan='2'>Liquid Reef</td></tr>
<tr><td>❌</td><td colspan='2'>Potassion</td></tr>
<tr><td>❌</td><td colspan='2'>Reef Code A</td></tr>
<tr><td>❌</td><td colspan='2'>Reef Code B</td></tr>
<tr><td>❌</td><td colspan='2'>Replenish</td></tr>
<tr><td>❌</td><td colspan='2'>Restore</td></tr>
<tr><td>❌</td><td colspan='2'>Strontion</td></tr>
</table>
</details>

<details>
<summary><b>ESV &nbsp; <sup>0/5 🖼️</sup></b></summary>

<table>
<tr><td>❌</td><td colspan='2'>B-Ionic Component 1</td></tr>
<tr><td>❌</td><td colspan='2'>B-Ionic Component 2</td></tr>
<tr><td>❌</td><td colspan='2'>B-Ionic Magnesium</td></tr>
<tr><td>❌</td><td colspan='2'>Transition elements </td></tr>
<tr><td>❌</td><td colspan='2'>Transition elements plus</td></tr>
</table>
</details>

<details>
<summary><b>Fauna Marine &nbsp; <sup>0/11 🖼️</sup></b></summary>

<table>
<tr><td>❌</td><td colspan='2'>Amin</td></tr>
<tr><td>❌</td><td colspan='2'>Balling light  trace 1</td></tr>
<tr><td>❌</td><td colspan='2'>Balling light  trace 2</td></tr>
<tr><td>❌</td><td colspan='2'>Balling light  trace 3</td></tr>
<tr><td>❌</td><td colspan='2'>Balling light Ca</td></tr>
<tr><td>❌</td><td colspan='2'>Balling light KH</td></tr>
<tr><td>❌</td><td colspan='2'>Balling light Mg</td></tr>
<tr><td>❌</td><td colspan='2'>Blue trace elements</td></tr>
<tr><td>❌</td><td colspan='2'>Green trace elements</td></tr>
<tr><td>❌</td><td colspan='2'>Min S</td></tr>
<tr><td>❌</td><td colspan='2'>Red trace elements</td></tr>
</table>
</details>

<details>
<summary><b>Quantum &nbsp; <sup>7/7 🖼️</sup></b></summary>

<table>
<tr><td>✅</td><td>Aragonite A</td><td><img style='width:20%;' src='public/img/supplements/322c1c47-7259-4fd9-9050-f6157036ea36.supplement.png'/></td></tr>
<tr><td>✅</td><td>Aragonite B</td><td><img style='width:20%;' src='public/img/supplements/e6537278-0e0a-4fd7-8146-566334bb74ed.supplement.png'/></td></tr>
<tr><td>✅</td><td>Aragonite C</td><td><img style='width:20%;' src='public/img/supplements/5f491b59-4f54-4572-bbce-aa9b708ccb51.supplement.png'/></td></tr>
<tr><td>✅</td><td>Bio Kalium</td><td><img style='width:20%;' src='public/img/supplements/8fec18b0-adf6-4dfa-b923-c7226a6fb87d.supplement.png'/></td></tr>
<tr><td>✅</td><td>Bio Metals</td><td><img style='width:20%;' src='public/img/supplements/a1d797e3-4679-4be4-9219-22e35822ab97.supplement.png'/></td></tr>
<tr><td>✅</td><td>Bio enhance</td><td><img style='width:20%;' src='public/img/supplements/fd8dee42-f3da-4660-b491-880d7dac869a.supplement.png'/></td></tr>
<tr><td>✅</td><td>Gbio Gen</td><td><img style='width:20%;' src='public/img/supplements/26a4f030-e78c-459c-90cb-5c6099de10fd.supplement.png'/></td></tr>
</table>
</details>

<details>
<summary><b>Red Sea &nbsp; <sup>10/13 🖼️</sup></b></summary>

<table>
<tr><td>✅</td><td>Bio Active (Colors D)</td><td><img style='width:20%;' src='public/img/supplements/7af9b16b-9e63-488e-8c86-261ef8c4a1ce.supplement.png'/></td></tr>
<tr><td>✅</td><td>Calcium (Foundation A)</td><td><img style='width:20%;' src='public/img/supplements/7d67412c-fde0-44d4-882a-dc8746fd4acb.supplement.png'/></td></tr>
<tr><td>❌</td><td colspan='2'>Calcium (Powder)</td></tr>
<tr><td>✅</td><td>Iodine (Colors A)</td><td><img style='width:20%;' src='public/img/supplements/93e742b0-67c9-4800-9aa9-212e52532343.supplement.png'/></td></tr>
<tr><td>✅</td><td>Iron (Colors C)</td><td><img style='width:20%;' src='public/img/supplements/c7a26034-8e40-41bb-bfb5-169089470f1e.supplement.png'/></td></tr>
<tr><td>✅</td><td>KH/Alkalinity (Foundation B)</td><td><img style='width:20%;' src='public/img/supplements/76830db3-a0bd-459a-9974-76a57d026893.supplement.png'/></td></tr>
<tr><td>❌</td><td colspan='2'>KH/Alkalinity (Powder)</td></tr>
<tr><td>✅</td><td>Magnesium (Foundation C)</td><td><img style='width:20%;' src='public/img/supplements/f524734e-8651-496e-b09b-640b40fc8bab.supplement.png'/></td></tr>
<tr><td>❌</td><td colspan='2'>Magnesium (Powder)</td></tr>
<tr><td>✅</td><td>NO3PO4-X</td><td><img style='width:20%;' src='public/img/supplements/ffaf6ff8-bc6d-44eb-9e4b-e679943dc835.supplement.png'/></td></tr>
<tr><td>✅</td><td>Potassium (Colors B)</td><td><img style='width:20%;' src='public/img/supplements/2f386917-54bd-4dd4-aa8b-9d1fea37edc5.supplement.png'/></td></tr>
<tr><td>✅</td><td>Reef Energy Plus</td><td><img style='width:20%;' src='public/img/supplements/bf9a7da3-741b-4c1d-8542-d9344a95fb70.supplement.png'/></td></tr>
<tr><td>✅</td><td>ReefCare Program</td><td><img style='width:20%;' src='public/img/supplements/redsea-reefcare.supplement.png'/></td></tr>
</table>
</details>

<details>
<summary><b>Seachem &nbsp; <sup>0/9 🖼️</sup></b></summary>

<table>
<tr><td>❌</td><td colspan='2'>Reef Calcium</td></tr>
<tr><td>❌</td><td colspan='2'>Reef Carbonate</td></tr>
<tr><td>❌</td><td colspan='2'>Reef Complete</td></tr>
<tr><td>❌</td><td colspan='2'>Reef Fusion 1</td></tr>
<tr><td>❌</td><td colspan='2'>Reef Fusion 2</td></tr>
<tr><td>❌</td><td colspan='2'>Reef Iodine</td></tr>
<tr><td>❌</td><td colspan='2'>Reef Plus</td></tr>
<tr><td>❌</td><td colspan='2'>Reef Strontium</td></tr>
<tr><td>❌</td><td colspan='2'>Reef Trace</td></tr>
</table>
</details>

<details>
<summary><b>Triton &nbsp; <sup>0/4 🖼️</sup></b></summary>

<table>
<tr><td>❌</td><td colspan='2'>Core7 elements 1</td></tr>
<tr><td>❌</td><td colspan='2'>Core7 elements 2</td></tr>
<tr><td>❌</td><td colspan='2'>Core7 elements 3A</td></tr>
<tr><td>❌</td><td colspan='2'>Core7 elements 3B</td></tr>
</table>
</details>

<details>
<summary><b>Tropic Marin &nbsp; <sup>6/14 🖼️</sup></b></summary>

<table>
<tr><td>❌</td><td colspan='2'>A Element</td></tr>
<tr><td>✅</td><td>All-For-Reef</td><td><img style='width:20%;' src='public/img/supplements/aff00331-3c23-4357-b6d4-6609dbc4fed1.supplement.png'/></td></tr>
<tr><td>✅</td><td>Amino Organic</td><td><img style='width:20%;' src='public/img/supplements/fddbe0a4-02eb-4903-969b-6c27c805bf6b.supplement.png'/></td></tr>
<tr><td>❌</td><td colspan='2'>Balling A</td></tr>
<tr><td>❌</td><td colspan='2'>Balling B</td></tr>
<tr><td>❌</td><td colspan='2'>Balling C</td></tr>
<tr><td>✅</td><td>Bio-Magnesium</td><td><img style='width:20%;' src='public/img/supplements/2f04f694-3743-4e12-a45f-a3eb63aef806.supplement.png'/></td></tr>
<tr><td>✅</td><td>Carbo Calcium</td><td><img style='width:20%;' src='public/img/supplements/8cdabb9f-ebcf-4675-a10f-f9020941928f.supplement.png'/></td></tr>
<tr><td>❌</td><td colspan='2'>Elimi-NP</td></tr>
<tr><td>❌</td><td colspan='2'>K Element</td></tr>
<tr><td>❌</td><td colspan='2'>Liquid Buffer</td></tr>
<tr><td>✅</td><td>NP-Bacto-Balance</td><td><img style='width:20%;' src='public/img/supplements/43b51c1f-0363-4ef5-be89-f129e512e25b.supplement.png'/></td></tr>
<tr><td>❌</td><td colspan='2'>Plus-NP</td></tr>
<tr><td>✅</td><td>Potassium</td><td><img style='width:20%;' src='public/img/supplements/964e897e-9668-4fc8-9cd9-e8c42a27cf85.supplement.png'/></td></tr>
</table>
</details>

# ReefLed

Planned.

Want it supported sooner? Vote [here](https://github.com/Elwinmage/ha-reef-card/discussions/22).

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

<img src="doc/img/rsmat/rsmat_zones.png"/>

The background image changes according to the roll usage status, with 5 different images:

<table>
  <tr>
    <td align="center"><img src="doc/img/rsmat/RSMAT_100_BASE.png" width="100%"/><br/><b>0%</b></td>
    <td align="center"><img src="doc/img/rsmat/RSMAT_75_BASE.png" width="100%"/><br/><b>25%</b></td>
    <td align="center"><img src="doc/img/rsmat/RSMAT_50_BASE.png" width="100%"/><br/><b>50%</b></td>
  </tr>
  <tr>
    <td align="center"><img src="doc/img/rsmat/RSMAT_25_BASE.png" width="100%"/><br/><b>75%</b></td>
    <td align="center"><img src="doc/img/rsmat/RSMAT_0_BASE.png" width="100%"/><br/><b>100%</b></td>
    <td></td>
  </tr>
</table>

## Configuration / Wifi Information

<img src="doc/img/rsmat/zone_1.png"/>

---

<span>Click the icon <img src="doc/img/rsdose/cog_icon.png" width="30" /> to manage the general configuration of the ReefMat.</span>

<img src="doc/img/rsmat/zone_1_dialog_configuration.png"/>

<span>Click the icon <img src="doc/img/rsdose/wifi_icon.png" width="30" /> to manage the network settings.</span>

<img src="doc/img/rsmat/zone_1_dialog_wifi.png"/>

## States

<img src="doc/img/rsmat/zone_2.png"/>

---

<span>The maintenance switch <img src="doc/img/mdi/mdi_account-wrench.png" width="20"/> switches to maintenance mode.</span>

 <img  src="doc/img/rsmat/maintenance.png"/>

<span>The on/off switch <img src="doc/img/mdi/mdi_power-plug.png" width="20"/> switches the ReefMat between on and off states.</span>

 <img  src="doc/img/rsmat/off_mode.png"/>

## Roll Information

<img src="doc/img/rsmat/zone_3.png"/>

---

This zone displays the real-time status of the filter roll, from top to bottom:

- The **total length used** since the start of the roll (top, in red)
- The **remaining length** in the centre in red. When the roll is empty, a <img src="doc/img/mdi/mdi_paper-roll.png" width="20"/> blinking icon appears instead and a dialog box offers to replace the roll.

<img src="doc/img/rsmat/zone_3_dialog_new_roll.png"/>

- The **number of days remaining** before the end of the roll, estimated from the daily average consumption (in black)
- The **daily average consumption** in cm (bottom left)
- The current **operating mode**: Auto, Maintenance, Off… (below the RedSea logo)
- The **roll usage percentage** (circular arc, bottom right)

If an anomaly is detected, the RedSea logo transforms into a <img src="doc/img/mdi/mdi_alert-decagram.png" width="20"/> blinking icon.
Clicking this alert opens the anomaly dialog box:

<img src="doc/img/rsmat/alert.png"/>
<img src="doc/img/rsmat/zone_3_dialog_alert.png" />

## Manual/Automatic Advance

<img src="doc/img/rsmat/zone_4.png"/>
<img src="doc/img/rsmat/zone_4_auto_off.png"/>
---

This zone controls the roll advance.

From left to right:

- The <img src="doc/img/mdi/mdi_send.png" width="20"/> button triggers a **manual advance** of the roll by the length shown in the centre.
- The displayed **advance value** (in cm) is the value sent when the button is pressed. Clicking this number opens the editing dialog.

<img src="doc/img/rsmat/zone_4_dialog_manual_advance.png"/>

- The **automatic advance button** <img src="doc/img/mdi/mdi_autorenew.png" width="20"/> <img src="doc/img/mdi/mdi_autorenew-off.png" width="20"/> enables or disables the automatic roll advance.

## Sensor

<img src="doc/img/rsmat/zone_5.png"/>

---

This zone shows the status of the level sensor.

Three states are possible:

| State               | Image                                                            |
| ------------------- | ---------------------------------------------------------------- |
| Sensor connected    | <img src="doc/img/rsmat/RSMAT_SENSOR_PLUGGED.png" width="80"/>   |
| Sensor disconnected | <img src="doc/img/rsmat/RSMAT_SENSOR_UNPLUGGED.png" width="80"/> |
| Dirty sensor        | <img src="doc/img/mdi/mdi_liquid-spot.png" width="80"/>          |

## Scheduled Advance

<img src="doc/img/rsmat/zone_6.png"/>

---

This button <img src="doc/img/mdi/mdi_auto-mode_red.png" width="20"/><img src="doc/img/mdi/mdi_auto-mode_black.png" width="20"/> shows the scheduled advance status and allows editing it by clicking on it.

<img src="doc/img/rsmat/zone_6_dialog_schedule.png"/>

## Usage Graph

<img src="doc/img/rsmat/zone_7.png"/> 
<img src="doc/img/rsmat/monthly.png"/>

---

This zone displays a graph of roll consumption over time.
Clicking the button toggles between the two available modes:

- **Weekly** mode shows consumption over the last 7 days.
- **Monthly** mode shows consumption over the last 30 days.

Pressing the top left of the graph opens the detailed view in Home Assistant.

## Messages

<img src="doc/img/rsmat/zone_8.png"/>

---

This zone displays the latest system messages from the ReefMat. It has two lines:

- The grey line shows the **last message** received.
- The pink line shows the **last alert**, preceded by the ⚠ symbol.

Clicking the <img src="doc/img/mdi/mdi_delete-empty.png" width="20"/> icon clears the corresponding message.

These lines can be hidden via the card editor interface.

<img src="doc/img/rsmat/editor.png" />

# ReefRun

ReefRun with ha-reef-card in action:

[![Watch the video](https://img.youtube.com/vi/Xxv38OPqiGI/0.jpg)](https://www.youtube.com/watch?v=Xxv38OPqiGI)

The ReefRun card shows the controller and its two pumps as they are physically
wired, each with its own cable and plumbing. Pump 1 is the one on the left of
the card, pump 2 the one on the right — typically the return pump and the DC
Skimmer, but either socket accepts either model.

<img src="doc/img/rsrun/rsrun_zones.png"/>

The card is divided into 6 zones:

1. Power state and maintenance mode
2. Battery and Wifi information
3. Controller: operating mode, pump buttons and calibrations
4. Pump 1: daily schedule, body with live water flow, temperature
5. Pump 2: daily schedule, body with live water flow, temperature
6. Last message and last alert

## Power state and maintenance mode

<img src="doc/img/rsrun/zone_1.png" >

<span>The maintenance switch <img src="doc/img/mdi/mdi_account-wrench.png" width="20"/> switches to maintenance mode.</span>

<img src="doc/img/rsrun/maintenance.png" >

<span>The on/off switch <img src="doc/img/mdi/mdi_power-plug.png" width="20"/> switches the reef dual controler between on and off states.</span>

<img src="doc/img/rsrun/off_mode.png" >

## Configuration / Wifi Information

<img src="doc/img/rsrun/zone_2.png"/>

---

<span>This icon <img src="doc/img/mdi/battery.png" width="30" /> indicate the battery elevel of the Dual Controler.</span>

<span>Click the icon <img src="doc/img/mdi/wifi_icon.png" width="30" /> to manage the network settings.</span>

<img src="doc/img/rsrun/zone_2_dialog_wifi.png"/>

## Controller: operating mode, pump buttons and calibrations

<img src="doc/img/rsrun/zone_3.png"/>

### Pump settings

A click on <img src="doc/img/mdi/cog-1.png" width="5%"/> or <img src="doc/img/mdi/cog-2.png" width="5%"/> will open the pump configuration dialog box for pump 1 or 2.

<img src="doc/img/rsrun/zone_3_return_pump.png"/>
<img src="doc/img/rsrun/zone_3_skimmer.png"/>

> [!CAUTION]
> **Delete pump** restores the pump settings to their factory defaults: the
> schedule and the sensor control are lost. A confirmation is always asked.

### Sensor settings

A click on <img src="doc/img/mdi/cog-s.png" width="5%"/> will open the sensor configuration dialog box.
<img src="doc/img/rsrun/zone_3_sensor.png"/>

### Pump Play/Pause <img src="doc/img/mdi/play.png" width="5%"/> / <img src="doc/img/mdi/pause.png" width="5%"/>

A click toggle the individual pump on or off.

The red ring indicates the current speed.
<img src="doc/img/rsrun/speed.png"/>

To change the current speed hold <img src="doc/img/mdi/play.png" width="5%"/> / <img src="doc/img/mdi/pause.png" width="5%"/> or click on the schedule:

<img src="doc/img/rsrun/schedule.png"/>

## Pump states

The pump body reflects what the device is actually doing, so a glance is enough.
The two pump types do not have the same states, so they are described
separately.

## Pump 1 & 2

### Return pump

<img src="src/img/redsea/RSRUN/reefrun_return.png" width="30%"/>

A single artwork covers every state, the card only changes how it is drawn:

- **Running** — full colors, water animated at the current speed.
- **Stopped** — the same artwork greyed out, no flow.
- **Disconnected** — the same greying, plus a blinking power cable.

### Skimmer

Three distinct artworks, one per state of the cup:

<table>
  <tr>
    <td align="center"><img src="src/img/redsea/RSRUN/reefrun_skimmer_on.png" width="100%"/><br/><b>Running</b><br/>Foam in the cup, rising bubbles, water animated</td>
    <td align="center"><img src="src/img/redsea/RSRUN/reefrun_skimmer_full.png" width="100%"/><br/><b>Full cup</b><br/>Foam reduced to a band under the lid</td>
    <td align="center"><img src="src/img/redsea/RSRUN/reefrun_skimmer_off.png" width="100%"/><br/><b>Stopped</b><br/>Empty cup, greyed out, no bubbles</td>
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

<img src="src/img/redsea/RSRUN/add_pump.png" width="20%"/>

Clicking it opens the configuration dialog, where **Detect and add** asks the
controller what is connected and registers it in one step. The detected model is
only a suggestion and is occasionally wrong, so the model list stays editable
afterwards: for a DC Skimmer, pick rsk-300, rsk-600 or rsk-900. The pump name can
be edited in the same dialog.

The placeholder sits on every unconfigured port, so it also shows up on a port
you never intend to use. Users running a single pump can hide it entirely from
the card editor.

<img src="doc/img/rsrun/editor.png"/>

### Schedule

<img src="doc/img/rsrun/schedule.png"/>

The blue curve is the programmed speed over 24 hours. The vertical red line
marks the current time, and the dot on it the speed the schedule is asking for.

When the pump does not follow its schedule — feed mode, full-cup detection,
overskimming protection — the dot moves down to the **real** speed and a red
segment materializes the gap, labelled with the difference:

<img src="doc/img/rsrun/schedule_deviation.png"/>

Clicking the chart opens the schedule editor: add or remove points, edit times and speeds, preview a point on the device, then save.

<img src="doc/img/rsrun/schedule_editor.png"/>

## Messages

<img src="doc/img/rsrun/zone_6.png"/>

---

This zone displays the latest system messages from the ReefMat. It has two lines:

- The grey line shows the **last message** received.
- The pink line shows the **last alert**, preceded by the ⚠ symbol.

Clicking the <img src="doc/img/mdi/mdi_delete-empty.png" width="20"/> icon clears the corresponding message.

These lines can be hidden via the card editor interface.

<img src="doc/img/rsrun/editor_2.png" />

# ReefWave

Planned.

Want it supported sooner? Vote [here](https://github.com/Elwinmage/ha-reef-card/discussions/22).

# Maintenance

The maintenance view of ha-reef-card in action:

[![Watch the video](https://img.youtube.com/vi/Ko46fHonOP4/0.jpg)](https://www.youtube.com/watch?v=Ko46fHonOP4)

<img src="doc/img/maintenance/overview.png"/>

Beyond the per-device views, the card offers a **Maintenance** view that gathers
every maintenance task exposed by `ha-reefbeat-component`,
`ha-reef-maintenance-component` and `ha-aquamedic-component` as if the whole
maintenance subsystem were a single device. The view looks for the marker any of
them puts on its entities, not for a particular integration.

Each task is displayed as a progress bar showing how much of its interval has
elapsed, with a color driven by the remaining time:

| Color  | Meaning                                               |
| ------ | ----------------------------------------------------- |
| Green  | Up to date                                            |
| Orange | Due soon (last 20% of the interval, at least one day) |
| Red    | Overdue, the label switches to `+X d`                 |
| Grey   | Never done yet (no reset recorded)                    |

Tasks can be sorted **by equipment** (grouped, with one header per device) or
**by due date** (a flat list, the most urgent first). Never-done tasks are
always listed last. Two filters sit in the toolbar: a checkbox hiding tasks that are still up to
date, and a **Hide muted / Show muted** button hiding the tasks whose
notification switch is off. The button starts in the "show" position, so
silencing an alert never makes a deadline disappear on its own. That default is
configurable from the card editor (or with `hide_muted` below), and the button
still overrides it at any time.

Clicking a row opens the Home Assistant more-info dialog of the task, and the
round button on the right marks the task as done (it presses the underlying
button entity, exactly like the more-info dialog would).

The view only appears in the device selector when at least one maintenance task
exists in your installation. New tasks added to the integration catalogue show
up automatically, no card update needed.

### Notifications

Each task also gets a **notification switch** in the integration
(`switch.*_notify`, shown as "<task name> (notifications)"). Turning it off
mutes the overdue alert of that single task without touching its schedule: the
progress bar keeps running, the row simply dims and the bell turns off.

The bell on the right of each row toggles that switch directly. It is only
shown when the integration exposes the switch. Set `show_notify: false` to hide
the bells.

The alert blueprint reads the very same setting, so muting a task in the card
also silences the automation.

### Changing the interval

The calendar button on each row expands an inline slider that writes to the
task's interval number entity. The slider works in the unit the integration
advertises for that task (days, weeks or months, read from the entity's role),
and the integration converts back to days before storing. Bounds come from the
entity itself, so the card can never write an out-of-range value. Only one
editor stays open at a time. Set `show_interval: false` to hide the buttons.

### Filtering by device

By default the view lists the tasks of every device. The **Filter by device**
block of the card editor restricts it to a subset: tick one or more devices and
only their tasks are kept, counters included.

<img src="doc/img/maintenance/editor_devices.png"/>

The list holds one entry per controller, with the number of tasks it owns.
Sub-devices (ReefDose heads, ReefRun pumps) are folded into their controller
through the `via_device` link of the Home Assistant registry, so ticking
**RSDose4** keeps the tasks of all four heads. Nothing ticked means "no filter":
every device is shown, which is also what the **Show every device** shortcut
restores.

The selection is stored as device names (see `devices` below), so the YAML stays
readable. A name written by hand also matches its sub-devices by prefix, which
covers the setups where `via_device` is not declared. Devices without a name fall
back to their Home Assistant device id.

### ReefRun pumps

ReefRun sub-devices are named "… pump 1" / "… pump 2", which says nothing about
what each pump actually is. When the device exposes both a `type` and a `model`
sensor, the card appends them in parentheses: **ReefRun pump 1 (return 12000)**,
**ReefRun pump 2 (skimmer 900)**.

The type is localized, and only the trailing figure of the model is kept
(`return-12000` -> `12000`, `rsk-900` -> `900`) since the prefix is either
redundant with the type or cryptic. Devices that are not pumps keep a plain
name.

## Icons

| Icon                                                                                                       | Role                                                                          |
| ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| <img src="doc/img/mdi/mdi_check.png" width="20"/>                                                          | **Task done.** Marks the task as performed and restarts its countdown.        |
| <img src="doc/img/mdi/mdi_bell-ring.png" width="20"/> <img src="doc/img/mdi/mdi_bell-off.png" width="20"/> | **Mute / unmute.** Toggles the notification switch of that single task.       |
| <img src="doc/img/mdi/mdi_calendar-edit.png" width="20"/>                                                  | **Change the interval.** Expands an inline slider bound to the task interval. |

## Editor

The default state of the filters, the device filter and the visibility of the
three buttons are set from the card editor.

<img src="doc/img/maintenance/editor.png"/>

## Configuration

```yaml
type: custom:reef-card
device: __maintenance__
maintenance:
  sort: due # "device" (default) or "due"
  devices: # only show the tasks of these devices (empty: all of them)
    - SIMU-RSDOSE4
    - SIMU-RSATO
  hide_ok: false # hide tasks that are neither overdue nor due soon
  hide_muted: false # hide tasks whose notifications are turned off
  warning_ratio: 0.2 # share of the interval displayed in orange
  show_reset: true # show the "mark as done" button on each row
  show_notify: true # show the mute/unmute bell on each row
  show_interval: true # show the interval editor button on each row
```

All `maintenance` keys are optional. `sort` and `hide_ok` only set the initial
state: the user can still change them from the view itself. `devices` accepts
device names as well as Home Assistant device ids; an empty list (the default)
disables the filter.

# FAQ

---

[buymecoffee]: https://paypal.me/Elwinmage
[buymecoffeebadge]: https://img.shields.io/badge/buy%20me%20a%20coffee-donate-yellow.svg?style=flat-square
