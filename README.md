<!-- [![hacs_badge](https://img.shields.io/badge/HACS-Default-41BDF5.svg?style=flat-square)](https://github.com/hacs/default) -->
[![GH-release](https://img.shields.io/github/v/release/Elwinmage/ha-reef-card.svg?style=flat-square)](https://github.com/Elwinmage/ha-reef-card/releases)
[![GH-last-commit](https://img.shields.io/github/last-commit/Elwinmage/ha-reef-card.svg?style=flat-square)](https://github.com/Elwinmage/ha-reef-card/commits/master)

[![GitHub Clones](https://img.shields.io/badge/dynamic/json?color=success&label=Clone&query=count&url=https://gist.githubusercontent.com/Elwinmage/dd3b205383103c2e65a7f516003ecbf6/raw/clone.json&logo=github)](https://github.com/MShawon/github-clone-count-badge)
[![GH-code-size](https://img.shields.io/github/languages/code-size/Elwinmage/ha-reef-card.svg?color=red&style=flat-square)](https://github.com/Elwinmage/ha-reef-card) 
[![BuyMeCoffee][buymecoffeebadge]][buymecoffee]

> [!CAUTION]
> This card is on early developpement and should only be install for test purposes.  
> The first version will be published in hacs standard library in few weeks and will support ReefDose 4 from Redsea.<br />
> ***You can vote to choose the next supported device [here](https://github.com/Elwinmage/ha-reef-card/discussions/22).***

> [!NOTE]
> Help is welcome, feel free to [contact me](https://github.com/Elwinmage/ha-reef-card/discussions/1).
# Supported Languages: [<img src="https://flagicons.lipis.dev/flags/4x3/fr.svg" style="width: 5%;"/>](https://github.com/Elwinmage/ha-reefbeat-component/blob/main/doc/fr/README.fr.md) [<img src="https://flagicons.lipis.dev/flags/4x3/gb.svg" style="width: 5%"/>](https://github.com/Elwinmage/ha-reefbeat-component/blob/main/README.md) 
<!-- You want to help with translation, follow this [guide](https://github.com/Elwinmage/ha-reef-card/blob/main/doc/TRANSLATION.md). -->

# Overview
**Reef card** for home assistant help you to manage your reef tank. 

Coupled with [ha-reefbeat-component](https://github.com/Elwinmage/ha-reefbeat-component) it takes your Redsea (ReefBeat) devices automaticaly into account.
> [!NOTE]
> If you have non redsea devices and you want them to be taken into account, you can ask [here](https://github.com/Elwinmage/ha-reef-card/discussions/2).

> [!TIP]
> The list of future implementations can be found [here](https://github.com/Elwinmage/ha-reef-card/issues?q=is%3Aissue%20state%3Aopen%20label%3Aenhancement)<br />
> The list of bugs can be found [here](https://github.com/Elwinmage/ha-reef-card/issues?q=is%3Aissue%20state%3Aopen%20label%3Abug)

# Compatibility

✅ Implemented  ☑️ Current Work ❌ Planned
<table>
  <th>
    <td ><b>Model</b></td>
    <td colspan="2"><b>Status</b></td>
    <td><b>Issues</b>  <br/>📆(Planned) <br/> 🐛(Bugs)</td>
  </th>
  <tr>
    <td><a href="#reefato">ReefATO+</a></td>
    <td>RSATO+</td><td>❌</td>
    <td width="200px"><img src="https://github.com/Elwinmage/ha-reefbeat-component/blob/main/doc/img/RSATO+.png"/></td>
    <td>
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rsato,all label:enhancement" style="text-decoration:none">📆</a>
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rsato,all label:bug" style="text-decoration:none">🐛</a>
    </td>

  </tr>
  <tr>
    <td rowspan="2"><a href="#reefdose">ReefDose</a></td>
    <td>RSDOSE2</td>
    <td>❌</td>
    <td width="200px"><img src="https://github.com/Elwinmage/ha-reefbeat-component/blob/main/doc/img/RSDOSE2.png"/></td>
      <td rowspan="2">
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rsdose,all label:enhancement" style="text-decoration:none">📆</a>
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rsdose,all label:bug" style="text-decoration:none">🐛</a>
    </td>
  </tr>
  <tr>
    <td>RSDOSE4</td><td>☑️</td>
    <td width="200px"><img src="https://github.com/Elwinmage/ha-reefbeat-component/blob/main/doc/img/RSDOSE4.png"/></td>
    </tr>
  <tr>
    <td rowspan="2"> <a href="#reefled">ReefLed</a></td>
    <td>G1</td>
    <td>❌</td>
    <td width="200px"><img src="https://github.com/Elwinmage/ha-reefbeat-component/blob/main/doc/img/rsled_g1.png"/></td>
<td rowspan="2">   
    <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rsled,all label:enhancement" style="text-decoration:none">📆</a>
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rsled,all label:bug" style="text-decoration:none">🐛</a>
</td>
  </tr>
   <td >G2</td>
    <td>❌</td>
    <td width="200px"><img src="https://github.com/Elwinmage/ha-reefbeat-component/blob/main/doc/img/rsled_g2.png"/></td>
  </tr>
  <tr>
    <td rowspan="3"><a href="#reefmat">ReefMat</a></td>
    <td>RSMAT250</td>
    <td>❌</td>
    <td rowspan="3" width="200px"><img src="https://github.com/Elwinmage/ha-reefbeat-component/blob/main/doc/img/RSMAT.png"/></td>
    <td rowspan="3">   
    <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rsmat,all label:enhancement" style="text-decoration:none">📆</a>
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rsmat,all label:bug" style="text-decoration:none">🐛</a>
</td>
  </tr>
  <tr>
    <td>RSMAT500</td><td>❌</td>
  </tr>
  <tr>
    <td>RSMAT1200</td><td>❌</td>
  </tr>
  <tr>
    <td><a href="#reefrun">ReefRun & DC Skimmer</a></td>
    <td>RSRUN</td><td>❌</td>
    <td width="200px"><img src="https://github.com/Elwinmage/ha-reefbeat-component/blob/main/doc/img/RSRUN.png"/></td>
    <td>   
    <a href="https://github.com/Elwinmage/ha-reefbeat-component/issues?q=is:issue state:open label:rsrun,all label:enhancement" style="text-decoration:none">📆</a>
      <a href="https://github.com/Elwinmage/ha-reefbeat-component/issues?q=is:issue state:open label:rsrun,all label:bug" style="text-decoration:none">🐛</a>
</td>
  </tr>  
  <tr>
    <td><a href="#reefwave">ReefWave</a></td>
    <td>RSWAVE25 & RSWAVE45</td>
    <td>❌</td>
    <td width="200px" rowspan="2"><img src="https://github.com/Elwinmage/ha-reefbeat-component/blob/main/doc/img/RSWAVE.png"/></td>
     <td >   
    <a href="https://github.com/Elwinmage/ha-reefbeat-component/issues?q=is:issue state:open label:rswave,all label:enhancement" style="text-decoration:none">📆</a>
      <a href="https://github.com/Elwinmage/ha-reefbeat-component/issues?q=is:issue state:open label:rwave,all label:bug" style="text-decoration:none">🐛</a>
</td>
</table>

# Summary
- [Installation](https://github.com/Elwinmage/ha-reef-card/#installation)
- [Configuration](https://github.com/Elwinmage/ha-reef-card/#configuration)
- [ReefATO+](https://github.com/Elwinmage/ha-reef-card/#reefato)
- [ReefDose](https://github.com/Elwinmage/ha-reef-card/#reefdose)
- [ReefLED](https://github.com/Elwinmage/ha-reef-card/#reefled)
- [ReefMat](https://github.com/Elwinmage/ha-reef-card/#reefmat)
- [ReefRun](https://github.com/Elwinmage/ha-reef-card/#reefrun)
- [ReefWave](https://github.com/Elwinmage/ha-reef-card/#reefwave)
- [FAQ](https://github.com/Elwinmage/ha-reef-card/#faq)

# Installation

> [!CAUTION]
> This card is on early developpement and should only be install for test purposes.  
> The first version will be published in hacs standard library in few weeks.
> For now, if you want to test it, use the "Custom repositary" in hacs parameters.

# Configuration

Without device parameter, the card will detect all reefbeat devices and let you choose the one you want.

To remove device selection and force the device you want, set device parameter to the name of your device.

<table>
  <tr>
<td><img src="https://github.com/Elwinmage/ha-reef-card/blob/main/doc/img/card_rsdose4_config_2.png"/></td>
<td><img src="https://github.com/Elwinmage/ha-reef-card/blob/main/doc/img/card_rsdose4_config.png"/></td>
    </tr>
</table>

# ReefATO
Planned.

You want it to be supported faster? Vote [here](https://github.com/Elwinmage/ha-reef-card/discussions/22).

# ReefDose

<img src="https://github.com/Elwinmage/ha-reef-card/blob/main/doc/img/rsdose4_ex1.png"/>

## Features
**Work in progress**
- ReefDose 4 ([#8](https://github.com/Elwinmage/ha-reef-card/issues/8))
  - [x] Automaticaly detect and set supplements
  - [ ] Basic management (set manual & daily doses, display days left...) [#13](https://github.com/Elwinmage/ha-reef-card/issues/13)
  - [ ] Advanced schedule [#14](https://github.com/Elwinmage/ha-reef-card/issues/14)
- ReefDose 2 ([#9](https://github.com/Elwinmage/ha-reef-card/issues/9))
  - [ ] Automaticaly detect and set supplements
  - [ ] Basic management (set manual & daily doses, display days left...) [#13](https://github.com/Elwinmage/ha-reef-card/issues/13)
  - [ ] Advanced schedule [#14](https://github.com/Elwinmage/ha-reef-card/issues/14)
- Generic dosing pumps

 
# ReefLed
Planned

You want it to be supported faster? Vote [here](https://github.com/Elwinmage/ha-reef-card/discussions/22).

# ReefMat
Planned

You want it to be supported faster? Vote [here](https://github.com/Elwinmage/ha-reef-card/discussions/22).

# ReefRun
Planned

You want it to be supported faster? Vote [here](https://github.com/Elwinmage/ha-reef-card/discussions/22).

# ReefWave
Planned

You want it to be supported faster? Vote [here](https://github.com/Elwinmage/ha-reef-card/discussions/22).

# FAQ

***

[buymecoffee]: https://paypal.me/Elwinmage
[buymecoffeebadge]: https://img.shields.io/badge/buy%20me%20a%20coffee-donate-yellow.svg?style=flat-square
