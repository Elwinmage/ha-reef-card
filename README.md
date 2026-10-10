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

It also supports the Aqua Medic pumps of [ha-aquamedic-component](https://github.com/Elwinmage/ha-aquamedic-component);
their maintenance tasks show up in that same view.

The power flows of [reefbeatEnergyBackup](https://github.com/Elwinmage/reefbeatEnergyBackup) (mains, battery, pumps) get their own view too, drawn with [Power Flow Card Plus](https://github.com/flixlix/power-flow-card-plus).

<!-- generated:demo-videos:start -->

## 🎬 Demo videos

<table>
<tr>
<td><a href="https://www.youtube.com/watch?v=Qee5LH0T9wQ"><img src="https://img.youtube.com/vi/Qee5LH0T9wQ/0.jpg" alt="ReefDose demo" width="300"/></a><br/><em>ReefDose demo</em></td>
<td><a href="https://www.youtube.com/watch?v=yyNyUSitb1E"><img src="https://img.youtube.com/vi/yyNyUSitb1E/0.jpg" alt="ReefMat demo" width="300"/></a><br/><em>ReefMat demo</em></td>
</tr>
<tr>
<td><a href="https://www.youtube.com/watch?v=Xxv38OPqiGI"><img src="https://img.youtube.com/vi/Xxv38OPqiGI/0.jpg" alt="ReefRun demo" width="300"/></a><br/><em>ReefRun demo</em></td>
<td><a href="https://www.youtube.com/watch?v=Ko46fHonOP4"><img src="https://img.youtube.com/vi/Ko46fHonOP4/0.jpg" alt="Maintenance demo" width="300"/></a><br/><em>Maintenance demo</em></td>
</tr>
<tr>
<td><a href="https://www.youtube.com/watch?v=2R0DHp2eqT4"><img src="https://img.youtube.com/vi/2R0DHp2eqT4/0.jpg" alt="ReefATO+ demo" width="300"/></a><br/><em>ReefATO+ demo</em></td>
<td><a href="https://www.youtube.com/watch?v=voFobfc7Slk"><img src="https://img.youtube.com/vi/voFobfc7Slk/0.jpg" alt="ReefControl & ReefControl-Power demo" width="300"/></a><br/><em>ReefControl & ReefControl-Power demo</em></td>
</tr>
<tr>
<td><a href="https://www.youtube.com/watch?v=pA49z8QjTN4"><img src="https://img.youtube.com/vi/pA49z8QjTN4/0.jpg" alt="ReefLed demo" width="300"/></a><br/><em>ReefLed demo</em></td>
<td><a href="https://www.youtube.com/watch?v=sYVeE0zV3eo"><img src="https://img.youtube.com/vi/sYVeE0zV3eo/0.jpg" alt="ReefWave demo" width="300"/></a><br/><em>ReefWave demo</em></td>
</tr>
<tr>
<td><a href="https://www.youtube.com/watch?v=9Gh4YE6Ck9g"><img src="https://img.youtube.com/vi/9Gh4YE6Ck9g/0.jpg" alt="Aqua Medic demo" width="300"/></a><br/><em>Aqua Medic demo</em></td>
</tr>
</table>

<!-- generated:demo-videos:end -->

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
    <td>Interactive graphical view of each device on your dashboard, and the only way to edit advanced schedules. Reads the three integrations above through the shared <code>reef_role</code> contract, with no card-side configuration. Also draws the power flows of reefbeatEnergyBackup.</td>
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
    <td>standalone, or alongside ha-reefbeat-component and ha-reef-card</td>
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
    <td><a href="https://github.com/Elwinmage/ha-reef-card/blob/main/doc/en/reefato.md#reefato">ReefATO+</a></td>
    <td>RSATO+</td><td>✅</td>
    <td width="200px"><img src="https://raw.githubusercontent.com/Elwinmage/ha-reefbeat-component/main/doc/img/RSATO+.png"/></td>
    <td>
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rsato,all label:enhancement" style="text-decoration:none">📆</a>
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rsato,all label:bug" style="text-decoration:none">🐛</a>
    </td>
  </tr>
  <tr>
    <td rowspan="2"><a href="https://github.com/Elwinmage/ha-reef-card/blob/main/doc/en/reefcontrol.md#reefcontrol">ReefControl</a></td>
    <td>RSCONTROLPRO</td><td>✅</td>
    <td width="200px"><img src="https://raw.githubusercontent.com/Elwinmage/ha-reefbeat-component/main/doc/img/RSCONTROLPRO.png"/></td>
    <td rowspan="2">
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rscontrol,all label:enhancement" style="text-decoration:none">📆</a>
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rscontrol,all label:bug" style="text-decoration:none">🐛</a>
    </td>
  </tr>
  <tr>
    <td>RSCONTROLLITE</td><td>🧪</td>
    <td width="200px"><img src="https://raw.githubusercontent.com/Elwinmage/ha-reefbeat-component/main/doc/img/RSCONTROLLITE.png"/></td>
  </tr>
  <tr>
    <td rowspan="2"><a href="https://github.com/Elwinmage/ha-reef-card/blob/main/doc/en/reefcontrol-power.md#reefcontrol-power">ReefControl-Power</a></td>
    <td>RSPOWER6</td><td>✅</td>
    <td width="200px"><img src="https://raw.githubusercontent.com/Elwinmage/ha-reefbeat-component/main/doc/img/RSPOWER6.png"/></td>
    <td rowspan="2">
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rspower,all label:enhancement" style="text-decoration:none">📆</a>
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rspower,all label:bug" style="text-decoration:none">🐛</a>
    </td>
  </tr>
  <tr>
    <td>RSPOWER8</td><td>🧪</td>
    <td width="200px"><img src="https://raw.githubusercontent.com/Elwinmage/ha-reefbeat-component/main/doc/img/RSPOWER8.png"/></td>
  </tr>
  <tr>
    <td rowspan="2"><a href="https://github.com/Elwinmage/ha-reef-card/blob/main/doc/en/reefdose.md#reefdose">ReefDose</a></td>
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
    <td rowspan="2"> <a href="https://github.com/Elwinmage/ha-reef-card/blob/main/doc/en/reefled.md#reefled">ReefLed</a></td>
    <td>G1</td>
    <td>✅</td>
    <td width="200px"><img src="https://raw.githubusercontent.com/Elwinmage/ha-reefbeat-component/main/doc/img/rsled_g1.png"/></td>
<td rowspan="2">   
    <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rsled,all label:enhancement" style="text-decoration:none">📆</a>
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rsled,all label:bug" style="text-decoration:none">🐛</a>
</td>
  </tr>
  <tr>
    <td>G2</td>
    <td>🧪</td>
    <td width="200px"><img src="https://raw.githubusercontent.com/Elwinmage/ha-reefbeat-component/main/doc/img/rsled_g2.png"/></td>
  </tr>
  <tr>
    <td rowspan="3"><a href="https://github.com/Elwinmage/ha-reef-card/blob/main/doc/en/reefmat.md#reefmat">ReefMat</a></td>
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
    <td><a href="https://github.com/Elwinmage/ha-reef-card/blob/main/doc/en/reefrun.md#reefrun">ReefRun</a></td>
    <td>RSRUN</td><td>✅</td>
    <td width="200px"><img src="https://raw.githubusercontent.com/Elwinmage/ha-reefbeat-component/main/doc/img/RSRUN.png"/></td>
    <td>
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rsrun,all label:enhancement" style="text-decoration:none">📆</a>
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rsrun,all label:bug" style="text-decoration:none">🐛</a>
    </td>
  </tr>
  <tr>
    <td><a href="https://github.com/Elwinmage/ha-reef-card/blob/main/doc/en/reefwave.md#reefwave">ReefWave</a></td>
    <td>RSWAVE25<br />RSWAVE45</td><td>✅</td>
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
    <td rowspan="3"><a href="https://github.com/Elwinmage/ha-reef-card/blob/main/doc/en/aquamedic.md#aqua-medic">Aqua Medic</a></td>
    <td>EcoDrift / SmartDrift x.1 / x.3<br />(wavemaker)</td><td>✅</td>
    <td width="200px"><img src="https://raw.githubusercontent.com/Elwinmage/ha-aquamedic-component/main/doc/img/drift.png" width="120"/></td>
    <td rowspan="3">
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:aquamedic,all label:enhancement" style="text-decoration:none">📆</a>
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:aquamedic,all label:bug" style="text-decoration:none">🐛</a>
    </td>
  </tr>
  <tr>
    <td>DC Runner<br />(return pump)</td><td>✅</td>
    <td width="200px"><img src="https://raw.githubusercontent.com/Elwinmage/ha-aquamedic-component/main/doc/img/runner.png" width="120"/></td>
  </tr>
  <tr>
    <td>DC Runner<br />(skimmer pump)</td><td>✅</td>
    <td width="200px"><img src="https://raw.githubusercontent.com/Elwinmage/ha-aquamedic-component/main/doc/img/skimmer.png" width="120"/></td>
  </tr>
  <tr>
    <td colspan="5"><b>reefbeatEnergyBackup</b> — through <a href="https://github.com/Elwinmage/reefbeatEnergyBackup">reefbeatEnergyBackup</a></td>
  </tr>
  <tr>
    <td><a href="https://github.com/Elwinmage/ha-reef-card/blob/main/doc/en/energybackup.md#energy-backup">Energy backup</a></td>
    <td>Energy Backup System<br />(battery backup)</td><td>✅</td>
    <td width="200px"><img src="https://raw.githubusercontent.com/Elwinmage/reefbeatEnergyBackup/main/icon.png" width="64"/></td>
    <td>
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:energybackup,all label:enhancement" style="text-decoration:none">📆</a>
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:energybackup,all label:bug" style="text-decoration:none">🐛</a>
    </td>
  </tr>
</table>

> [!NOTE]
> The DC Runner return pump and skimmer pump are the same hardware with different pump heads: same firmware, same Gizwits product key, identical entities. The integration tells them apart through its **Pump role** select, and the card follows that role.

# Table of contents

- [Installation](https://github.com/Elwinmage/ha-reef-card/#installation)
- [Configuration](https://github.com/Elwinmage/ha-reef-card/#configuration)
- [ReefATO+](https://github.com/Elwinmage/ha-reef-card/blob/main/doc/en/reefato.md#reefato)
- [ReefControl](https://github.com/Elwinmage/ha-reef-card/blob/main/doc/en/reefcontrol.md#reefcontrol)
- [ReefControl-Power](https://github.com/Elwinmage/ha-reef-card/blob/main/doc/en/reefcontrol-power.md#reefcontrol-power)
- [ReefDose](https://github.com/Elwinmage/ha-reef-card/blob/main/doc/en/reefdose.md#reefdose)
- [ReefLED](https://github.com/Elwinmage/ha-reef-card/blob/main/doc/en/reefled.md#reefled)
- [ReefMat](https://github.com/Elwinmage/ha-reef-card/blob/main/doc/en/reefmat.md#reefmat)
- [ReefRun](https://github.com/Elwinmage/ha-reef-card/blob/main/doc/en/reefrun.md#reefrun)
- [ReefWave](https://github.com/Elwinmage/ha-reef-card/blob/main/doc/en/reefwave.md#reefwave)
- [Aqua Medic](https://github.com/Elwinmage/ha-reef-card/blob/main/doc/en/aquamedic.md#aqua-medic)
- [Maintenance](https://github.com/Elwinmage/ha-reef-card/blob/main/doc/en/maintenance.md#maintenance)
- [Energy backup](https://github.com/Elwinmage/ha-reef-card/blob/main/doc/en/energybackup.md#energy-backup)
- [FAQ](https://github.com/Elwinmage/ha-reef-card/#faq)

# Installation

## Direct installation

Click here to open the repository directly in HACS and click "Download": [![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=Elwinmage&repository=ha-reef-card&category=plugin)

## Search in HACS

Or search for «reef-card» in HACS.

<p align="center">
<img src="doc/img/hacs_search.png" alt="Image">
</p>

# Configuration

Without the `device` parameter, the card automatically detects all ReefBeat devices and lets you choose the one you want.

To remove device selection and force a specific one, set the `device` parameter to the name of your device.

The card editor stores the stable identifier of the device there (its hardware id), and keeps the options of each device under that same identifier, so renaming a device in Home Assistant loses nothing. A configuration written with the device name keeps working, and is moved to the identifier the next time it is changed from the editor.

<table>
  <tr>
<td><img src="doc/img/card_rsdose4_config_2.png"/></td>
<td><img src="doc/img/card_rsdose4_config.png"/></td>
    </tr>
</table>

## Aquarium view

A second card, `custom:reef-aquarium-card`, shows a picture of your tank with its devices and entities on it, the water lit by your lamps and, if you wish, fish and corals alive in it. It needs the [ReefTank integration](https://github.com/Elwinmage/ha-reeftank-component), which stores the aquariums and their pictures.

```yaml
type: custom:reef-aquarium-card
aquarium: a1b2 # chosen in the card editor
render: static # optional: static, light or full; can only lower the aquarium's level
view: front # optional: the view to start on
```

- **Create and edit** an aquarium from the card editor: _New aquarium_ or _Edit the scene_ opens a full-screen editor (pictures, water outline, decor, clickable zones, devices and entities dragged from a tree, lamps, livestock, feeding sources). With a ReefBeat cloud account, the aquarium of the cloud pre-fills dimensions, lamps, feeding shortcuts, and filters the Red Sea devices.
- **Render levels**: `static` (picture, devices, entities, clickable zones), `light` (plus the colour of the lamps on the water), `full` (plus fish, corals and the feeding animation).
- A tap on a device opens its view of this card; on an entity, its usual action.
- **Species**: fish and corals come from the [ReefTank catalog](https://github.com/Elwinmage/reeftank-catalog), downloaded and kept up to date by the integration. The editor lists them with a thumbnail; a name that is not in the catalog swims as a generic fish.

# FAQ

---

[buymecoffee]: https://paypal.me/Elwinmage
[buymecoffeebadge]: https://img.shields.io/badge/buy%20me%20a%20coffee-donate-yellow.svg?style=flat-square
