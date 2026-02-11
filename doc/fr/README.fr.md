<!-- [![hacs_badge](https://img.shields.io/badge/HACS-Default-41BDF5.svg?style=flat-square)](https://github.com/hacs/default) -->

[![GH-release](https://img.shields.io/github/v/release/Elwinmage/ha-reef-card.svg?style=flat-square)](https://github.com/Elwinmage/ha-reef-card/releases)
[![GH-last-commit](https://img.shields.io/github/last-commit/Elwinmage/ha-reef-card.svg?style=flat-square)](https://github.com/Elwinmage/ha-reef-card/commits/main)

[![GitHub Clones](https://img.shields.io/badge/dynamic/json?color=success&label=Clone&query=count&url=https://gist.githubusercontent.com/Elwinmage/dd3b205383103c2e65a7f516003ecbf6/raw/clone.json&logo=github)](https://github.com/MShawon/github-clone-count-badge)
[![GH-code-size](https://img.shields.io/github/languages/code-size/Elwinmage/ha-reef-card.svg?color=red&style=flat-square)](https://github.com/Elwinmage/ha-reef-card)
[![BuyMeCoffee][buymecoffeebadge]][buymecoffee]

> [!CAUTION]
> Cette carte est en cours de développement et ne doit être installée qu'à des fins de test.  
> La première version sera publiée dans la bibliothèque standard HACS dans quelques semaines et supportera le ReefDose 4 de Redsea.<br /> > **_Vous pouvez voter pour choisir le prochain appareil supporté [ici](https://github.com/Elwinmage/ha-reef-card/discussions/22)._**

> [!NOTE]
> L'aide est la bienvenue, n'hésitez pas à [me contacter](https://github.com/Elwinmage/ha-reef-card/discussions/1).

# Langues supportées : [<img src="https://flagicons.lipis.dev/flags/4x3/fr.svg" style="width: 5%;"/>](https://github.com/Elwinmage/ha-reef-card) [<img src="https://flagicons.lipis.dev/flags/4x3/gb.svg" style="width: 5%"/>](https://github.com/Elwinmage/ha-reef-card)

<!-- Vous souhaitez aider à la traduction, suivez ce [guide](https://github.com/Elwinmage/ha-reef-card/blob/main/doc/TRANSLATION.md). -->

Votre langue n'est pas encore supportée et vous souhaitez aider à la traduction ? Suivez ce [guide](https://github.com/Elwinmage/ha-reef-card/blob/main/doc/TRANSLATION.md).

# Présentation

La **Reef card** pour Home Assistant vous aide à gérer votre aquarium récifal.

Couplée à [ha-reefbeat-component](https://github.com/Elwinmage/ha-reefbeat-component), elle prend automatiquement en charge vos appareils Redsea (ReefBeat).

> [!NOTE]
> Si vous avez des appareils non Redsea et souhaitez qu'ils soient pris en charge, vous pouvez en faire la demande [ici](https://github.com/Elwinmage/ha-reef-card/discussions/2).

> [!TIP]
> La liste des fonctionnalités à venir est disponible [ici](https://github.com/Elwinmage/ha-reef-card/issues?q=is%3Aissue%20state%3Aopen%20label%3Aenhancement)<br />
> La liste des bugs est disponible [ici](https://github.com/Elwinmage/ha-reef-card/issues?q=is%3Aissue%20state%3Aopen%20label%3Abug)

# Compatibilité

✅ Implémenté ☑️ En cours ❌ Planifié

<table>
  <th>
    <td ><b>Modèle</b></td>
    <td colspan="2"><b>Statut</b></td>
    <td><b>Issues</b>  <br/>📆(Planifié) <br/> 🐛(Bugs)</td>
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

  </tr>
    <tr>
    <td><a href="#reefcontrol">ReefControl</a></td>
    <td>RSSENSE<br /> Si vous en possédez un, vous pouvez me contacter <a href="https://github.com/Elwinmage/ha-reefbeat-component/discussions/8">ici</a> et j'ajouterai sa prise en charge.</td><td>❌</td>
    <td width="200px"><img src="https://github.com/Elwinmage/ha-reefbeat-component/blob/main/doc/img/RSCONTROL.png"/></td>
    <td>
      <a href="https://github.com/Elwinmage/ha-reefbeat-component/issues?q=is:issue state:open label:rscontrol,all label:enhancement" style="text-decoration:none">📆</a>
      <a href="https://github.com/Elwinmage/ha-reefbeat-component/issues?q=is:issue state:open label:rscontrol,all label:bug" style="text-decoration:none">🐛</a>
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
    <td>RSMAT500</td>
    <td>❌</td>
  </tr>
  <tr>
    <td>RSMAT1200</td>
    <td>❌</td>
  </tr>
  <tr>
    <td><a href="#reefrun">ReefRun</a></td>
    <td>RSRUN</td><td>❌</td>
    <td width="200px"><img src="https://github.com/Elwinmage/ha-reefbeat-component/blob/main/doc/img/RSRUN.png"/></td>
    <td>
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rsrun,all label:enhancement" style="text-decoration:none">📆</a>
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rsrun,all label:bug" style="text-decoration:none">🐛</a>
    </td>
  </tr>
  <tr>
    <td><a href="#reefwave">ReefWave</a></td>
    <td>RSWAVE</td><td>❌</td>
    <td width="200px"><img src="https://github.com/Elwinmage/ha-reefbeat-component/blob/main/doc/img/RSWAVE.png"/></td>
    <td>
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rswave,all label:enhancement" style="text-decoration:none">📆</a>
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rswave,all label:bug" style="text-decoration:none">🐛</a>
    </td>
  </tr>
</table>

# Sommaire

- [Installation](https://github.com/Elwinmage/ha-reef-card/#installation)
- [Configuration](https://github.com/Elwinmage/ha-reef-card/#configuration)
- [ReefATO+](https://github.com/Elwinmage/ha-reef-card/#reefato)
- [ReefControl](https://github.com/Elwinmage/ha-reef-card/#reefcontrol)
- [ReefDose](https://github.com/Elwinmage/ha-reef-card/#reefdose)
- [ReefLED](https://github.com/Elwinmage/ha-reef-card/#reefled)
- [ReefMat](https://github.com/Elwinmage/ha-reef-card/#reefmat)
- [ReefRun](https://github.com/Elwinmage/ha-reef-card/#reefrun)
- [ReefWave](https://github.com/Elwinmage/ha-reef-card/#reefwave)
- [FAQ](https://github.com/Elwinmage/ha-reef-card/#faq)

# Installation

> [!CAUTION]
> Cette carte est en cours de développement et ne doit être installée qu'à des fins de test.  
> La première version sera publiée dans la bibliothèque standard HACS dans quelques semaines.
> Pour l'instant, si vous souhaitez la tester, utilisez le "Dépôt personnalisé" dans les paramètres HACS.

# Configuration

Sans paramètre `device`, la carte détecte automatiquement tous les appareils ReefBeat et vous laisse choisir celui que vous souhaitez.

Pour supprimer la sélection d'appareil et forcer celui de votre choix, définissez le paramètre `device` avec le nom de votre appareil.

<table>
  <tr>
<td><img src="https://github.com/Elwinmage/ha-reef-card/blob/main/doc/img/card_rsdose4_config_2.png"/></td>
<td><img src="https://github.com/Elwinmage/ha-reef-card/blob/main/doc/img/card_rsdose4_config.png"/></td>
    </tr>
</table>

# ReefATO

Planifié.

Vous souhaitez qu'il soit supporté plus rapidement ? Votez [ici](https://github.com/Elwinmage/ha-reef-card/discussions/22).

# ReefControl

Planifié.

Vous souhaitez qu'il soit supporté plus rapidement ? Votez [ici](https://github.com/Elwinmage/ha-reef-card/discussions/22).

# ReefDose

<img src="https://github.com/Elwinmage/ha-reef-card/blob/main/doc/img/rsdose4_ex1.png"/>

## Fonctionnalités

**En cours de développement**

- ReefDose 4 ([#8](https://github.com/Elwinmage/ha-reef-card/issues/8))
  - [x] Détection et configuration automatique des suppléments
  - [ ] Gestion de base (doses manuelles et journalières, affichage des jours restants...) [#13](https://github.com/Elwinmage/ha-reef-card/issues/13)
  - [ ] Planification avancée [#14](https://github.com/Elwinmage/ha-reef-card/issues/14)
- ReefDose 2 ([#9](https://github.com/Elwinmage/ha-reef-card/issues/9))
  - [ ] Détection et configuration automatique des suppléments
  - [ ] Gestion de base (doses manuelles et journalières, affichage des jours restants...) [#13](https://github.com/Elwinmage/ha-reef-card/issues/13)
  - [ ] Planification avancée [#14](https://github.com/Elwinmage/ha-reef-card/issues/14)
- Pompes doseuses génériques

## Suppléments

Voici la liste des images de suppléments supportées. Si le vôtre affiche un ❌, vous pouvez demander son ajout [ici](https://github.com/Elwinmage/ha-reef-card/discussions/25).

<table><tr><td> ❌</td><td colspan='2'>ATI - Essential Pro 1</td></tr><tr><td> ❌</td><td colspan='2'>ATI - Essential Pro 2</td></tr><tr><td> ❌</td><td colspan='2'>Aqua Forest - Ca Plus</td></tr><tr><td> ❌</td><td colspan='2'>Aqua Forest - Calcium </td></tr><tr><td> ❌</td><td colspan='2'>Aqua Forest - Component 1+</td></tr><tr><td> ❌</td><td colspan='2'>Aqua Forest - Component 2+</td></tr><tr><td> ❌</td><td colspan='2'>Aqua Forest - Component 3+</td></tr><tr><td> ❌</td><td colspan='2'>Aqua Forest - KH Buffer</td></tr><tr><td> ❌</td><td colspan='2'>Aqua Forest - KH Plus</td></tr><tr><td> ❌</td><td colspan='2'>Aqua Forest - Magnesium</td></tr><tr><td> ❌</td><td colspan='2'>Aqua Forest - Mg Plus</td></tr><tr><td> ❌</td><td colspan='2'>BRS - Liquid Calcium</td></tr><tr><td> ❌</td><td colspan='2'>BRS - Liquid alkalinity</td></tr><tr><td> ❌</td><td colspan='2'>BRS - Magnesium Mix</td></tr><tr><td> ❌</td><td colspan='2'>BRS - Part C</td></tr><tr><td> ❌</td><td colspan='2'>Brightwell - Calcion</td></tr><tr><td> ❌</td><td colspan='2'>Brightwell - Ferrion</td></tr><tr><td> ❌</td><td colspan='2'>Brightwell - Hydrate - MG</td></tr><tr><td> ❌</td><td colspan='2'>Brightwell - KoralAmino</td></tr><tr><td> ❌</td><td colspan='2'>Brightwell - Koralcolor</td></tr><tr><td> ❌</td><td colspan='2'>Brightwell - Liquid Reef</td></tr><tr><td> ❌</td><td colspan='2'>Brightwell - Potassion</td></tr><tr><td> ❌</td><td colspan='2'>Brightwell - Reef Code A</td></tr><tr><td> ❌</td><td colspan='2'>Brightwell - Reef Code B</td></tr><tr><td> ❌</td><td colspan='2'>Brightwell - Replenish</td></tr><tr><td> ❌</td><td colspan='2'>Brightwell - Restore</td></tr><tr><td> ❌</td><td colspan='2'>Brightwell - Strontion</td></tr><tr><td> ❌</td><td colspan='2'>ESV - B-Ionic Component 1</td></tr><tr><td> ❌</td><td colspan='2'>ESV - B-Ionic Component 2</td></tr><tr><td> ❌</td><td colspan='2'>ESV - B-Ionic Magnesium</td></tr><tr><td> ❌</td><td colspan='2'>ESV - Transition elements </td></tr><tr><td> ❌</td><td colspan='2'>ESV - Transition elements plus</td></tr><tr><td> ❌</td><td colspan='2'>Fauna Marine - Amin</td></tr><tr><td> ❌</td><td colspan='2'>Fauna Marine - Balling light  trace 1</td></tr><tr><td> ❌</td><td colspan='2'>Fauna Marine - Balling light  trace 2</td></tr><tr><td> ❌</td><td colspan='2'>Fauna Marine - Balling light  trace 3</td></tr><tr><td> ❌</td><td colspan='2'>Fauna Marine - Balling light Ca</td></tr><tr><td> ❌</td><td colspan='2'>Fauna Marine - Balling light KH</td></tr><tr><td> ❌</td><td colspan='2'>Fauna Marine - Balling light Mg</td></tr><tr><td> ❌</td><td colspan='2'>Fauna Marine - Blue trace elements</td></tr><tr><td> ❌</td><td colspan='2'>Fauna Marine - Green trace elements</td></tr><tr><td> ❌</td><td colspan='2'>Fauna Marine - Min S</td></tr><tr><td> ❌</td><td colspan='2'>Fauna Marine - Red trace elements</td></tr><tr><td> ❌</td><td colspan='2'>Quantum - Aragonite A</td></tr><tr><td> ❌</td><td colspan='2'>Quantum - Aragonite B</td></tr><tr><td> ❌</td><td colspan='2'>Quantum - Aragonite C</td></tr><tr><td> ❌</td><td colspan='2'>Quantum - Bio Kalium</td></tr><tr><td> ❌</td><td colspan='2'>Quantum - Bio Metals</td></tr><tr><td> ❌</td><td colspan='2'>Quantum - Bio enhance</td></tr><tr><td> ❌</td><td colspan='2'>Quantum - Gbio Gen</td></tr><tr><td>✅</td><td>Red Sea - Bio Active (Colors D)</td><td><img style='width:20%;' src='src/devices/img/7af9b16b-9e63-488e-8c86-261ef8c4a1ce.supplement.png'/></td></tr><tr><td>✅</td><td>Red Sea - Calcium (Foundation A)</td><td><img style='width:20%;' src='src/devices/img/7d67412c-fde0-44d4-882a-dc8746fd4acb.supplement.png'/></td></tr><tr><td> ❌</td><td colspan='2'>Red Sea - Calcium (Powder)</td></tr><tr><td>✅</td><td>Red Sea - Iodine (Colors A)</td><td><img style='width:20%;' src='src/devices/img/93e742b0-67c9-4800-9aa9-212e52532343.supplement.png'/></td></tr><tr><td>✅</td><td>Red Sea - Iron (Colors C)</td><td><img style='width:20%;' src='src/devices/img/c7a26034-8e40-41bb-bfb5-169089470f1e.supplement.png'/></td></tr><tr><td>✅</td><td>Red Sea - KH/Alkalinity (Foundation B)</td><td><img style='width:20%;' src='src/devices/img/76830db3-a0bd-459a-9974-76a57d026893.supplement.png'/></td></tr><tr><td> ❌</td><td colspan='2'>Red Sea - KH/Alkalinity (Powder)</td></tr><tr><td>✅</td><td>Red Sea - Magnesium (Foundation C)</td><td><img style='width:20%;' src='src/devices/img/f524734e-8651-496e-b09b-640b40fc8bab.supplement.png'/></td></tr><tr><td> ❌</td><td colspan='2'>Red Sea - Magnesium (Powder)</td></tr><tr><td>✅</td><td>Red Sea - NO3PO4-X</td><td><img style='width:20%;' src='src/devices/img/ffaf6ff8-bc6d-44eb-9e4b-e679943dc835.supplement.png'/></td></tr><tr><td>✅</td><td>Red Sea - Potassium (Colors B)</td><td><img style='width:20%;' src='src/devices/img/2f386917-54bd-4dd4-aa8b-9d1fea37edc5.supplement.png'/></td></tr><tr><td>✅</td><td>Red Sea - Reef Energy Plus</td><td><img style='width:20%;' src='src/devices/img/bf9a7da3-741b-4c1d-8542-d9344a95fb70.supplement.png'/></td></tr><tr><td> ❌</td><td colspan='2'>Seachem - Reef Calcium</td></tr><tr><td> ❌</td><td colspan='2'>Seachem - Reef Carbonate</td></tr><tr><td> ❌</td><td colspan='2'>Seachem - Reef Complete</td></tr><tr><td> ❌</td><td colspan='2'>Seachem - Reef Fusion 1</td></tr><tr><td> ❌</td><td colspan='2'>Seachem - Reef Fusion 2</td></tr><tr><td> ❌</td><td colspan='2'>Seachem - Reef Iodine</td></tr><tr><td> ❌</td><td colspan='2'>Seachem - Reef Plus</td></tr><tr><td> ❌</td><td colspan='2'>Seachem - Reef Strontium</td></tr><tr><td> ❌</td><td colspan='2'>Seachem - Reef Trace</td></tr><tr><td> ❌</td><td colspan='2'>Triton - Core7 elements 1</td></tr><tr><td> ❌</td><td colspan='2'>Triton - Core7 elements 2</td></tr><tr><td> ❌</td><td colspan='2'>Triton - Core7 elements 3A</td></tr><tr><td> ❌</td><td colspan='2'>Triton - Core7 elements 3B</td></tr><tr><td> ❌</td><td colspan='2'>Tropic Marin - A Element</td></tr><tr><td> ❌</td><td colspan='2'>Tropic Marin - All-For-Reef</td></tr><tr><td> ❌</td><td colspan='2'>Tropic Marin - Amino Organic</td></tr><tr><td> ❌</td><td colspan='2'>Tropic Marin - Balling A</td></tr><tr><td> ❌</td><td colspan='2'>Tropic Marin - Balling B</td></tr><tr><td> ❌</td><td colspan='2'>Tropic Marin - Balling C</td></tr><tr><td> ❌</td><td colspan='2'>Tropic Marin - Bio-Magnesium</td></tr><tr><td> ❌</td><td colspan='2'>Tropic Marin - Carbo Calcium</td></tr><tr><td> ❌</td><td colspan='2'>Tropic Marin - Elimi-NP</td></tr><tr><td> ❌</td><td colspan='2'>Tropic Marin - K Element</td></tr><tr><td> ❌</td><td colspan='2'>Tropic Marin - Liquid Buffer</td></tr><tr><td> ❌</td><td colspan='2'>Tropic Marin - NP-Bacto-Balance</td></tr><tr><td> ❌</td><td colspan='2'>Tropic Marin - Plus-NP</td></tr><tr><td> ❌</td><td colspan='2'>Tropic Marin - Potassium</td></tr></table>

# ReefLed

Planifié.

Vous souhaitez qu'il soit supporté plus rapidement ? Votez [ici](https://github.com/Elwinmage/ha-reef-card/discussions/22).

# ReefMat

Planifié.

Vous souhaitez qu'il soit supporté plus rapidement ? Votez [ici](https://github.com/Elwinmage/ha-reef-card/discussions/22).

# ReefRun

Planifié.

Vous souhaitez qu'il soit supporté plus rapidement ? Votez [ici](https://github.com/Elwinmage/ha-reef-card/discussions/22).

# ReefWave

Planifié.

Vous souhaitez qu'il soit supporté plus rapidement ? Votez [ici](https://github.com/Elwinmage/ha-reef-card/discussions/22).

# FAQ

---

[buymecoffee]: https://paypal.me/Elwinmage
[buymecoffeebadge]: https://img.shields.io/badge/buy%20me%20a%20coffee-donate-yellow.svg?style=flat-square
