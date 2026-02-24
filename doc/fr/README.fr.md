<!-- [![hacs_badge](https://img.shields.io/badge/HACS-Default-41BDF5.svg?style=flat-square)](https://github.com/hacs/default) -->

[![GH-release](https://img.shields.io/github/v/release/Elwinmage/ha-reef-card.svg?style=flat-square)](https://github.com/Elwinmage/ha-reef-card/releases)
[![GH-last-commit](https://img.shields.io/github/last-commit/Elwinmage/ha-reef-card.svg?style=flat-square)](https://github.com/Elwinmage/ha-reef-card/commits/main)

[![GitHub Clones](https://img.shields.io/badge/dynamic/json?color=success&label=Clone&query=count&url=https://gist.githubusercontent.com/Elwinmage/dd3b205383103c2e65a7f516003ecbf6/raw/clone.json&logo=github)](https://github.com/MShawon/github-clone-count-badge)
[![GH-code-size](https://img.shields.io/github/languages/code-size/Elwinmage/ha-reef-card.svg?color=red&style=flat-square)](https://github.com/Elwinmage/ha-reef-card)
[![BuyMeCoffee][buymecoffeebadge]][buymecoffee]

> [!NOTE]
> Toute aide est la bienvenue, n'hésitez pas à [me contacter](https://github.com/Elwinmage/ha-reef-card/discussions/1).

# Langues supportées : [<img src="https://flagicons.lipis.dev/flags/4x3/fr.svg" style="width: 5%;"/>](README.fr.md) [<img src="https://flagicons.lipis.dev/flags/4x3/gb.svg" style="width: 5%"/>](../../README.md) [<img src="https://flagicons.lipis.dev/flags/4x3/es.svg" style="width: 5%"/>](../es/README.es.md) [<img src="https://flagicons.lipis.dev/flags/4x3/pt.svg" style="width: 5%"/>](../pt/README.pt.md) [<img src="https://flagicons.lipis.dev/flags/4x3/de.svg" style="width: 5%"/>](../de/README.de.md) [<img src="https://flagicons.lipis.dev/flags/4x3/it.svg" style="width: 5%"/>](../it/README.it.md) [<img src="https://flagicons.lipis.dev/flags/4x3/pl.svg" style="width: 5%"/>](../pl/README.pl.md)

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
    <td width="200px"><img src="https://raw.githubusercontent.com/Elwinmage/ha-reefbeat-component/main/doc/img/RSATO+.png"/></td>
    <td>
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rsato,all label:enhancement" style="text-decoration:none">📆</a>
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rsato,all label:bug" style="text-decoration:none">🐛</a>
    </td>
  </tr>

  </tr>
    <tr>
    <td><a href="#reefcontrol">ReefControl</a></td>
    <td>RSSENSE<br /> Si vous en possédez un, vous pouvez me contacter <a href="https://github.com/Elwinmage/ha-reefbeat-component/discussions/8">ici</a> et j'ajouterai sa prise en charge.</td><td>❌</td>
    <td width="200px"><img src="https://raw.githubusercontent.com/Elwinmage/ha-reefbeat-component/main/doc/img/RSCONTROL.png"/></td>
    <td>
      <a href="https://github.com/Elwinmage/ha-reefbeat-component/issues?q=is:issue state:open label:rscontrol,all label:enhancement" style="text-decoration:none">📆</a>
      <a href="https://github.com/Elwinmage/ha-reefbeat-component/issues?q=is:issue state:open label:rscontrol,all label:bug" style="text-decoration:none">🐛</a>
    </td>
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
   <td >G2</td>
    <td>❌</td>
    <td width="200px"><img src="https://raw.githubusercontent.com/Elwinmage/ha-reefbeat-component/main/doc/img/rsled_g2.png"/></td>
  </tr>
  <tr>
    <td rowspan="3"><a href="#reefmat">ReefMat</a></td>
    <td>RSMAT250</td>
    <td>☑️</td>
    <td rowspan="3" width="200px"><img src="https://raw.githubusercontent.com/Elwinmage/ha-reefbeat-component/main/doc/img/RSMAT.png"/></td>
    <td rowspan="3">
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rsmat,all label:enhancement" style="text-decoration:none">📆</a>
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rsmat,all label:bug" style="text-decoration:none">🐛</a>
    </td>
  </tr>
  <tr>
    <td>RSMAT500</td>
    <td>☑️</td>
  </tr>
  <tr>
    <td>RSMAT1200</td>
    <td>☑️</td>
  </tr>
  <tr>
    <td><a href="#reefrun">ReefRun</a></td>
    <td>RSRUN</td><td>❌</td>
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

## Installation directe

Cliquez ici pour accéder directement au dépôt dans HACS et cliquez sur « Télécharger » :  [![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=Elwinmage&repository=ha-reef-card&category=plugin)

## Rechercher dans HACS
Ou recherchez « reef-card »  dans HACS.

<p align="center">
<img src="../img/hacs_search.png" alt="Image">
</p>

# Configuration

Sans paramètre `device`, la carte détecte automatiquement tous les appareils ReefBeat et vous laisse choisir celui que vous souhaitez.

Pour supprimer la sélection d'appareil et forcer celui de votre choix, définissez le paramètre `device` avec le nom de votre appareil.

<table>
  <tr>
<td><img src="../img/card_rsdose4_config_2.png"/></td>
<td><img src="../img/card_rsdose4_config.png"/></td>
    </tr>
</table>

# ReefATO

Planifié.
  
Vous souhaitez qu'il soit supporté plus rapidement ? Votez [ici](https://github.com/Elwinmage/ha-reef-card/discussions/22).

# ReefControl

Planifié.

Vous souhaitez qu'il soit supporté plus rapidement ? Votez [ici](https://github.com/Elwinmage/ha-reef-card/discussions/22).

# ReefDose

ReefDose avec ha-reef-card en action:

[![Regarder la vidéo](https://img.youtube.com/vi/Qee5LH0T9wQ/0.jpg)](https://www.youtube.com/watch?v=Qee5LH0T9wQ)


La carte ReefDose est découpée en 6 zones:

 1. Configuration/Informations Wifi
 2. Etats
 3. Dosage Manuel
 4. Configuration et planning des têtes
 5. Gestion des suppléments
 6. File d'attentes des futures doses

<img src="../img/rsdose/rsdose4_ex1.png"/>

## Configuration/Informations Wifi 
<img src="../img/rsdose/zone_1.png"/>

***

<span >Cliquez sur l'icône <img src="../img/rsdose/cog_icon.png" width="30" /> pour gérer la configuration générale du ReefDose.</span>

<img src="../img/rsdose/zone_1_dialog_config.png"/> 

<span>Cliquez sur l'icone <img width="30px" src="../img/rsdose/wifi_icon.png"/>  pour gérer les paramètres réseaux.</span>

<img src="../img/rsdose/zone_1_dialog_wifi.png"/> 

## Etats

 <img src="../img/rsdose/zone_2.png"/>

***
<span>L'interrupteur de maintenance  <img width="30px" src="../img/rsdose/zone_2_maintenance.png"/> permet de basculer vers le mode maintenance.</span>

 <img  src="../img/rsdose/maintenance_view.png"/>

<span>L'interrupteur de on/off  <img width="30px" src="../img/rsdose/zone_2_off.png"/> permet de basculer entre les états on et off du ReefDose.</span>

 <img  src="../img/rsdose/off_view.png"/>


## Dosage Manuel

<img src="../img/rsdose/zone_3.png"/>

***
<span>Le boutton <img src="../img/rsdose/zone_3_manula_config_button.png"/>  affiche la dose manuelle par default pour cette tête. Un clique dessus permet d'ouvrir la boite de configuration de ce dosage.</span>

<img src="../img/rsdose/zone_3_dialog_manual_dose_without.png"/>

Vous pouvez ajouter des raccourcis en utilisant l'edition de la carte:

<img src="../img/rsdose/editor.png"/>

Par exmple la tête 1 propose comme raccourcis les valeurs 2, 5 et 10mL.

Ces valeurs appraitrons en haut de la boite de dialogue. Un clique sur ces raccoucis lancera une commande pour doser la valeur définie.

<img src="../img/rsdose/zone_3_dialog_manual_dose.png"/>

<span>Un appuie sur le boutton de dose manuel: <img src="../img/rsdose/zone_3_manual_button.png"/> enverra une commande de dose avec la valeur par default visible juste au dessus: <img src="../img/rsdose/zone_3_manual_dose.png"/>, soit 10mL dans cet exmple.
</span>


## Configuration et planning des têtes

 <img src="../img/rsdose/zone_4.png"/>

***
Cette zone permet de visualiser la programmation courante des têtes et de la changer.
- La bague circulaire colorée indique le pourcentage de dose journalière déjà distribué.
- le chiffre jaune en haut indique le cumul de dose manuel journalier
- la partie centrale  indique le volume distributé par rapport au volume journalier programmé total
- le partie bleue en bas indique le nombre de doses distribuées par rapport au nombre de doses totales de la journées (exemple: 14/24 pour le bleu car c'est une programmation horaire que ce cette capture a été prise a 14h15.) Les valeurs pour le violet et le vert indiquent 0/0 car ces dosent doivent être distribuées à 8h mais l'intégration a été lancée aprés 8h donc il n'y aura aucune dose aujourd'hui.
- un clique long sur une des 4 têtes basculera la tête en on/off
- un clique sur une des tête ouvrira la boite de programmation. 
  Depuis cette boite vous pouvez lancer un amorçage, recalibrer la tête, changer la dose journalière et sa programmation. N'oubliez pas de sauvegarder la programmation avec de quitter.
  
  <img src="../img/rsdose/zone_4_dialog_schedule.png"/>
   

## Gestion des suppléments

 <img src="../img/rsdose/zone_5.png"/>

***
Cette zone permet de gérer les supppléments.
Si un supplément est déjà déclaré, un clique dessus permettra d'ouvrir la boite de configuration où vous pourrez:
- supprimer le supplément (icone corbeille en haut à droite)
- indiquer le volume total du container
- indiquer le volume réél du supplément
- décider si vous voulez suivre le volume restant. Un clique sur les raccourcis  en haut activera le controle et positonnera les valeurs par default avec un conteneur plein.
- modifier le nom d'affichage du supplément.

 <img src="../img/rsdose/zone_5_dialog_container.png"/>


Si aucun supplément n'est lié à une tête vous pouvez en ajouter un en cliquant sur le container avec un '+'  (tête 4 dans notre exemple) 

<img src="../img/rsdose/zone_5_add_container.png"/>

Suivez ensuite les instructions:

<img src="../img/rsdose/zone_5_dialog_add.png"/>

### Suppléments

Voici la liste des images de suppléments supportés, regroupés par marque. Si le vôtre affiche un ❌, vous pouvez demander son ajout  [ici](https://github.com/Elwinmage/ha-reef-card/discussions/25).

<details>
<summary><b>ATI &nbsp; <sup>0/2 🖼️</sup></b></summary>

<table>
<tr><td>❌</td><td colspan='2'>Essential Pro 1</td></tr>
<tr><td>❌</td><td colspan='2'>Essential Pro 2</td></tr>
</table>
</details>

<details>
<summary><b>Aqua Forest &nbsp; <sup>0/9 🖼️</sup></b></summary>

<table>
<tr><td>❌</td><td colspan='2'>Ca Plus</td></tr>
<tr><td>❌</td><td colspan='2'>Calcium </td></tr>
<tr><td>❌</td><td colspan='2'>Component 1+</td></tr>
<tr><td>❌</td><td colspan='2'>Component 2+</td></tr>
<tr><td>❌</td><td colspan='2'>Component 3+</td></tr>
<tr><td>❌</td><td colspan='2'>KH Buffer</td></tr>
<tr><td>❌</td><td colspan='2'>KH Plus</td></tr>
<tr><td>❌</td><td colspan='2'>Magnesium</td></tr>
<tr><td>❌</td><td colspan='2'>Mg Plus</td></tr>
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
<summary><b>Quantum &nbsp; <sup>0/7 🖼️</sup></b></summary>

<table>
<tr><td>❌</td><td colspan='2'>Aragonite A</td></tr>
<tr><td>❌</td><td colspan='2'>Aragonite B</td></tr>
<tr><td>❌</td><td colspan='2'>Aragonite C</td></tr>
<tr><td>❌</td><td colspan='2'>Bio Kalium</td></tr>
<tr><td>❌</td><td colspan='2'>Bio Metals</td></tr>
<tr><td>❌</td><td colspan='2'>Bio enhance</td></tr>
<tr><td>❌</td><td colspan='2'>Gbio Gen</td></tr>
</table>
</details>

<details>
<summary><b>Red Sea &nbsp; <sup>0/13 🖼️</sup></b></summary>

<table>
<tr><td>❌</td><td colspan='2'>Bio Active (Colors D)</td></tr>
<tr><td>❌</td><td colspan='2'>Calcium (Foundation A)</td></tr>
<tr><td>❌</td><td colspan='2'>Calcium (Powder)</td></tr>
<tr><td>❌</td><td colspan='2'>Iodine (Colors A)</td></tr>
<tr><td>❌</td><td colspan='2'>Iron (Colors C)</td></tr>
<tr><td>❌</td><td colspan='2'>KH/Alkalinity (Foundation B)</td></tr>
<tr><td>❌</td><td colspan='2'>KH/Alkalinity (Powder)</td></tr>
<tr><td>❌</td><td colspan='2'>Magnesium (Foundation C)</td></tr>
<tr><td>❌</td><td colspan='2'>Magnesium (Powder)</td></tr>
<tr><td>❌</td><td colspan='2'>NO3PO4-X</td></tr>
<tr><td>❌</td><td colspan='2'>Potassium (Colors B)</td></tr>
<tr><td>❌</td><td colspan='2'>Reef Energy Plus</td></tr>
<tr><td>❌</td><td colspan='2'>ReefCare Program</td></tr>
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
<summary><b>Tropic Marin &nbsp; <sup>0/14 🖼️</sup></b></summary>

<table>
<tr><td>❌</td><td colspan='2'>A Element</td></tr>
<tr><td>❌</td><td colspan='2'>All-For-Reef</td></tr>
<tr><td>❌</td><td colspan='2'>Amino Organic</td></tr>
<tr><td>❌</td><td colspan='2'>Balling A</td></tr>
<tr><td>❌</td><td colspan='2'>Balling B</td></tr>
<tr><td>❌</td><td colspan='2'>Balling C</td></tr>
<tr><td>❌</td><td colspan='2'>Bio-Magnesium</td></tr>
<tr><td>❌</td><td colspan='2'>Carbo Calcium</td></tr>
<tr><td>❌</td><td colspan='2'>Elimi-NP</td></tr>
<tr><td>❌</td><td colspan='2'>K Element</td></tr>
<tr><td>❌</td><td colspan='2'>Liquid Buffer</td></tr>
<tr><td>❌</td><td colspan='2'>NP-Bacto-Balance</td></tr>
<tr><td>❌</td><td colspan='2'>Plus-NP</td></tr>
<tr><td>❌</td><td colspan='2'>Potassium</td></tr>
</table>
</details>

## File d'attentes des futures doses 

<img src="../img/rsdose/zone_6.png"/>

***
Cette zone affiche simplement la liste des futures doses de votre équipement qu'elles soient automatiques ou manuelles  (horaire décalé car attente définie entre deux suppléments différents)

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
