# ha-reef-card 🪸 pour HomeAssistant

> Fait partie de l'**[Écosystème ReefTech Project](https://elwinmage.github.io/reeftank/fr.html)**

<p align="center">
  <img src="../../icon.png" width="50%"/>
</p>

[![GH-release](https://img.shields.io/github/v/release/Elwinmage/ha-reef-card.svg?style=flat-square)](https://github.com/Elwinmage/ha-reef-card/releases)
[![GH-last-commit](https://img.shields.io/github/last-commit/Elwinmage/ha-reef-card.svg?style=flat-square)](https://github.com/Elwinmage/ha-reef-card/commits/main)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

<!-- [![hacs_badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg?style=flat-square)](https://github.com/hacs/integration) -->

[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Lit](https://img.shields.io/badge/Lit-3.3-blue?style=flat-square&logo=lit)](https://lit.dev/)
[![codecov](https://codecov.io/gh/Elwinmage/ha-reef-card/branch/main/graph/badge.svg?token=XXXX)](https://codecov.io/gh/Elwinmage/ha-reef-card)
[![BuyMeCoffee][buymecoffeebadge]][buymecoffee]

# Langues supportées : [<img src="https://flagicons.lipis.dev/flags/4x3/fr.svg" style="width: 5%;"/>](README.fr.md) [<img src="https://flagicons.lipis.dev/flags/4x3/gb.svg" style="width: 5%"/>](../../README.md) [<img src="https://flagicons.lipis.dev/flags/4x3/es.svg" style="width: 5%"/>](../es/README.es.md) [<img src="https://flagicons.lipis.dev/flags/4x3/pt.svg" style="width: 5%"/>](../pt/README.pt.md) [<img src="https://flagicons.lipis.dev/flags/4x3/de.svg" style="width: 5%"/>](../de/README.de.md) [<img src="https://flagicons.lipis.dev/flags/4x3/it.svg" style="width: 5%"/>](../it/README.it.md) [<img src="https://flagicons.lipis.dev/flags/4x3/pl.svg" style="width: 5%"/>](../pl/README.pl.md)

<!-- Vous souhaitez aider à la traduction, suivez ce [guide](https://github.com/Elwinmage/ha-reef-card/blob/main/doc/TRANSLATION.md). -->

Votre langue n'est pas encore supportée et vous souhaitez aider à la traduction ? Suivez ce [guide](https://github.com/Elwinmage/ha-reef-card/blob/main/doc/TRANSLATION.md).

# Présentation

La **Reef card** pour Home Assistant vous aide à gérer votre aquarium récifal.

Couplée à [ha-reefbeat-component](https://github.com/Elwinmage/ha-reefbeat-component), elle prend automatiquement en charge
vos appareils Redsea (ReefBeat), et [ha-reef-maintenance-component](https://github.com/Elwinmage/ha-reef-maintenance-component)
ajoute à la vue maintenance le matériel avec lequel Home Assistant ne peut pas dialoguer.

La prise en charge des appareils Aqua Medic de [ha-aquamedic-component](https://github.com/Elwinmage/ha-aquamedic-component)
arrive ; leurs tâches de maintenance apparaissent déjà dans cette même vue.

<!-- ecosystem:start -->

## Projets liés

Les projets ReefTech s'articulent entre eux : les intégrations font entrer votre matériel dans Home Assistant, la carte l'affiche et le pilote, et le secours le maintient en marche pendant une coupure. Chacun fonctionne aussi seul.

<table>
  <tr>
    <th width="100px"></th>
    <th>Projet</th>
    <th>Rôle</th>
    <th>Fonctionne avec</th>
  </tr>
  <tr>
    <td><img src="https://raw.githubusercontent.com/Elwinmage/ha-reefbeat-component/main/icon.png" width="64" alt="ha-reefbeat-component" /></td>
    <td>🐠<br /><a href="https://github.com/Elwinmage/ha-reefbeat-component"><b>ha-reefbeat-component</b></a></td>
    <td>Appareils Red Sea ReefBeat, pilotés en local sans cloud : ReefATO+, ReefControl, ReefControl-Power, ReefDose, ReefLed, ReefMat, ReefRun et ReefWave.<br />blueprint d'alertes pour les modes anormaux, les calibrations et les batteries faibles. <a href="https://my.home-assistant.io/redirect/blueprint_import/?blueprint_url=https://raw.githubusercontent.com/Elwinmage/ha-reefbeat-component/refs/heads/main/blueprints/automation/redsea_alerts.en.yaml"><img src="https://my.home-assistant.io/badges/blueprint_import.svg" alt="Open your Home Assistant instance and show the blueprint import dialog with a specific blueprint pre-filled." /></a></td>
    <td>ha-reef-card</td>
  </tr>
  <tr>
    <td><img src="https://raw.githubusercontent.com/Elwinmage/ha-aquamedic-component/main/icon.png" width="64" alt="ha-aquamedic-component" /></td>
    <td>🌊<br /><a href="https://github.com/Elwinmage/ha-aquamedic-component"><b>ha-aquamedic-component</b></a></td>
    <td>Pompes Aqua Medic via l'API cloud Gizwits : brasseurs EcoDrift et SmartDrift, pompes DC Runner de remontée et d'écumeur.</td>
    <td>ha-reef-card</td>
  </tr>
  <tr>
    <td><img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-maintenance-component/main/icon.png" width="64" alt="ha-reef-maintenance-component" /></td>
    <td>🐙<br /><a href="https://github.com/Elwinmage/ha-reef-maintenance-component"><b>ha-reef-maintenance-component</b></a></td>
    <td>Suivi du nettoyage et de l'usure du matériel que Home Assistant ne peut pas interroger : pompes de brassage, pompes de remontée, écumeurs, réacteurs, tout ce que vous entretenez à la main.</td>
    <td>ha-reef-card</td>
  </tr>
  <tr>
    <td><img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/icon.png" width="64" alt="ha-reef-card" /></td>
    <td>🪸<br /><b>ha-reef-card</b><br /><i>(ce dépôt)</i></td>
    <td>Vue graphique interactive de chaque appareil sur votre tableau de bord, et seul moyen d'éditer les programmes avancés. Lit les trois intégrations ci-dessus via le contrat <code>reef_role</code> commun, sans configuration côté carte.</td>
    <td>les trois intégrations</td>
  </tr>
  <tr>
    <td><img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-blueprints/main/icon.png" width="64" alt="ha-reef-blueprints" /></td>
    <td>🐬<br /><a href="https://github.com/Elwinmage/ha-reef-blueprints"><b>ha-reef-blueprints</b></a></td>
    <td>Blueprints de notification communs à tout l'écosystème : entretiens en retard trouvés via le contrat <code>reef_role</code>, et appareils devenus injoignables. Huit langues.</td>
    <td>les trois intégrations</td>
  </tr>
  <tr>
    <td><img src="https://raw.githubusercontent.com/Elwinmage/reefbeatEnergyBackup/main/icon.png" width="64" alt="reefbeatEnergyBackup" /></td>
    <td>⚡<br /><a href="https://github.com/Elwinmage/reefbeatEnergyBackup"><b>reefbeatEnergyBackup</b></a></td>
    <td>Secours sur batterie en cas de coupure. Pack 24V LiFePO₄ piloté par un Raspberry Pi, avec dégradation progressive de la vitesse des pompes selon l'état de charge.</td>
    <td>seul, ou avec ha-reefbeat-component</td>
  </tr>
</table>

L'ensemble est documenté sur la [page du projet ReefTech](https://elwinmage.github.io/reeftank/).

<!-- ecosystem:end -->

# Compatibilité

> ✅ Supporté &nbsp;|&nbsp; 🚧 En cours &nbsp;|&nbsp; 🧪 Non testé (peut fonctionner) &nbsp;|&nbsp; ❌ Pas encore supporté

<table>
  <th>
    <td ><b>Modèle</b></td>
    <td colspan="2"><b>Statut</b></td>
    <td><b>Issues</b>  <br/>📆(Planifié) <br/> 🐛(Bugs)</td>
  </th>
  <tr>
    <td><a href="https://github.com/Elwinmage/ha-reef-card/blob/main/doc/fr/reefato.fr.md#reefato">ReefATO+</a></td>
    <td>RSATO+</td><td>✅</td>
    <td width="200px"><img src="https://raw.githubusercontent.com/Elwinmage/ha-reefbeat-component/main/doc/img/RSATO+.png"/></td>
    <td>
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rsato,all label:enhancement" style="text-decoration:none">📆</a>
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rsato,all label:bug" style="text-decoration:none">🐛</a>
    </td>
  </tr>
  <tr>
    <td rowspan="2"><a href="https://github.com/Elwinmage/ha-reef-card/blob/main/doc/fr/reefcontrol.fr.md#reefcontrol">ReefControl</a></td>
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
    <td rowspan="2"><a href="https://github.com/Elwinmage/ha-reef-card/blob/main/doc/fr/reefcontrol-power.fr.md#reefcontrol-power">ReefControl-Power</a></td>
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
    <td rowspan="2"><a href="https://github.com/Elwinmage/ha-reef-card/blob/main/doc/fr/reefdose.fr.md#reefdose">ReefDose</a></td>
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
    <td rowspan="2"> <a href="https://github.com/Elwinmage/ha-reef-card/blob/main/doc/fr/reefled.fr.md#reefled">ReefLed</a></td>
    <td>G1</td>
    <td>🚧</td>
    <td width="200px"><img src="https://raw.githubusercontent.com/Elwinmage/ha-reefbeat-component/main/doc/img/rsled_g1.png"/></td>
<td rowspan="2">   
    <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rsled,all label:enhancement" style="text-decoration:none">📆</a>
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rsled,all label:bug" style="text-decoration:none">🐛</a>
</td>
  </tr>
  <tr>
    <td>G2</td>
    <td>🚧</td>
    <td width="200px"><img src="https://raw.githubusercontent.com/Elwinmage/ha-reefbeat-component/main/doc/img/rsled_g2.png"/></td>
  </tr>
  <tr>
    <td rowspan="3"><a href="https://github.com/Elwinmage/ha-reef-card/blob/main/doc/fr/reefmat.fr.md#reefmat">ReefMat</a></td>
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
    <td><a href="https://github.com/Elwinmage/ha-reef-card/blob/main/doc/fr/reefrun.fr.md#reefrun">ReefRun</a></td>
    <td>RSRUN</td><td>✅</td>
    <td width="200px"><img src="https://raw.githubusercontent.com/Elwinmage/ha-reefbeat-component/main/doc/img/RSRUN.png"/></td>
    <td>
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rsrun,all label:enhancement" style="text-decoration:none">📆</a>
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rsrun,all label:bug" style="text-decoration:none">🐛</a>
    </td>
  </tr>
  <tr>
    <td><a href="https://github.com/Elwinmage/ha-reef-card/blob/main/doc/fr/reefwave.fr.md#reefwave">ReefWave</a></td>
    <td>RSWAVE</td><td>❌</td>
    <td width="200px"><img src="https://raw.githubusercontent.com/Elwinmage/ha-reefbeat-component/main/doc/img/RSWAVE.png"/></td>
    <td>
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rswave,all label:enhancement" style="text-decoration:none">📆</a>
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rswave,all label:bug" style="text-decoration:none">🐛</a>
    </td>
  </tr>
  <tr>
    <td colspan="5"><b>Aqua Medic</b> — via <a href="https://github.com/Elwinmage/ha-aquamedic-component">ha-aquamedic-component</a></td>
  </tr>
  <tr>
    <td rowspan="3">Aqua Medic</td>
    <td>EcoDrift / SmartDrift x.1 / x.3<br />(brasseur)</td><td>❌</td>
    <td width="200px"><img src="https://raw.githubusercontent.com/Elwinmage/ha-aquamedic-component/main/doc/img/drift.png" width="120"/></td>
    <td rowspan="3">
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:aquamedic,all label:enhancement" style="text-decoration:none">📆</a>
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:aquamedic,all label:bug" style="text-decoration:none">🐛</a>
    </td>
  </tr>
  <tr>
    <td>DC Runner<br />(pompe de remontée)</td><td>❌</td>
    <td width="200px"><img src="https://raw.githubusercontent.com/Elwinmage/ha-aquamedic-component/main/doc/img/runner.png" width="120"/></td>
  </tr>
  <tr>
    <td>DC Runner<br />(pompe d'écumeur)</td><td>❌</td>
    <td width="200px"><img src="https://raw.githubusercontent.com/Elwinmage/ha-aquamedic-component/main/doc/img/skimmer.png" width="120"/></td>
  </tr>
</table>

> [!NOTE]
> La pompe de remontée DC Runner et la pompe d'écumeur sont le même matériel avec des têtes différentes : même firmware, même clé produit Gizwits, entités identiques. L'intégration les distingue par son sélecteur **Rôle de la pompe**, et la carte suivra ce rôle.

# Sommaire

- [Installation](#installation)
- [Configuration](#configuration)
- [ReefATO+](https://github.com/Elwinmage/ha-reef-card/blob/main/doc/fr/reefato.fr.md#reefato)
- [ReefControl](https://github.com/Elwinmage/ha-reef-card/blob/main/doc/fr/reefcontrol.fr.md#reefcontrol)
- [ReefControl-Power](https://github.com/Elwinmage/ha-reef-card/blob/main/doc/fr/reefcontrol-power.fr.md#reefcontrol-power)
- [ReefDose](https://github.com/Elwinmage/ha-reef-card/blob/main/doc/fr/reefdose.fr.md#reefdose)
- [ReefLED](https://github.com/Elwinmage/ha-reef-card/blob/main/doc/fr/reefled.fr.md#reefled)
- [ReefMat](https://github.com/Elwinmage/ha-reef-card/blob/main/doc/fr/reefmat.fr.md#reefmat)
- [ReefRun](https://github.com/Elwinmage/ha-reef-card/blob/main/doc/fr/reefrun.fr.md#reefrun)
- [ReefWave](https://github.com/Elwinmage/ha-reef-card/blob/main/doc/fr/reefwave.fr.md#reefwave)
- [Aqua Medic](https://github.com/Elwinmage/ha-reef-card/blob/main/doc/fr/aquamedic.fr.md#aqua-medic)
- [Maintenance](https://github.com/Elwinmage/ha-reef-card/blob/main/doc/fr/maintenance.fr.md#maintenance)
- [FAQ](#faq)

# Installation

## Installation directe

Cliquez ici pour accéder directement au dépôt dans HACS et cliquez sur « Télécharger » : [![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=Elwinmage&repository=ha-reef-card&category=plugin)

## Rechercher dans HACS

Ou recherchez « reef-card » dans HACS.

<p align="center">
<img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/hacs_search.png" alt="Image">
</p>

# Configuration

Sans paramètre `device`, la carte détecte automatiquement tous les appareils ReefBeat et vous laisse choisir celui que vous souhaitez.

Pour supprimer la sélection d'appareil et forcer celui de votre choix, définissez le paramètre `device` avec le nom de votre appareil.

<table>
  <tr>
<td><img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/card_rsdose4_config_2.png"/></td>
<td><img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/card_rsdose4_config.png"/></td>
    </tr>
</table>

# FAQ

---

[buymecoffee]: https://paypal.me/Elwinmage
[buymecoffeebadge]: https://img.shields.io/badge/buy%20me%20a%20coffee-donate-yellow.svg?style=flat-square
