<!-- [![hacs_badge](https://img.shields.io/badge/HACS-Default-41BDF5.svg?style=flat-square)](https://github.com/hacs/default) -->

[![GH-release](https://img.shields.io/github/v/release/Elwinmage/ha-reef-card.svg?style=flat-square)](https://github.com/Elwinmage/ha-reef-card/releases)
[![GH-last-commit](https://img.shields.io/github/last-commit/Elwinmage/ha-reef-card.svg?style=flat-square)](https://github.com/Elwinmage/ha-reef-card/commits/main)

[![GitHub Clones](https://img.shields.io/badge/dynamic/json?color=success&label=Clone&query=count&url=https://gist.githubusercontent.com/Elwinmage/dd3b205383103c2e65a7f516003ecbf6/raw/clone.json&logo=github)](https://github.com/MShawon/github-clone-count-badge)
[![GH-code-size](https://img.shields.io/github/languages/code-size/Elwinmage/ha-reef-card.svg?color=red&style=flat-square)](https://github.com/Elwinmage/ha-reef-card)
[![BuyMeCoffee][buymecoffeebadge]][buymecoffee]

> [!NOTE]
> Jede Hilfe ist willkommen, zögern Sie nicht, [mich zu kontaktieren](https://github.com/Elwinmage/ha-reef-card/discussions/1).

# Unterstützte Sprachen : [<img src="https://flagicons.lipis.dev/flags/4x3/fr.svg" style="width: 5%;"/>](../fr/README.fr.md) [<img src="https://flagicons.lipis.dev/flags/4x3/gb.svg" style="width: 5%"/>](../../README.md) [<img src="https://flagicons.lipis.dev/flags/4x3/es.svg" style="width: 5%"/>](../es/README.es.md) [<img src="https://flagicons.lipis.dev/flags/4x3/pt.svg" style="width: 5%"/>](../pt/README.pt.md) [<img src="https://flagicons.lipis.dev/flags/4x3/de.svg" style="width: 5%"/>](README.de.md) [<img src="https://flagicons.lipis.dev/flags/4x3/it.svg" style="width: 5%"/>](../it/README.it.md) [<img src="https://flagicons.lipis.dev/flags/4x3/pl.svg" style="width: 5%"/>](../pl/README.pl.md)

<!-- Vous souhaitez aider à la traduction, suivez ce [guide](https://github.com/Elwinmage/ha-reef-card/blob/main/doc/TRANSLATION.md). -->

Ihre Sprache wird noch nicht unterstützt und Sie möchten bei der Übersetzung helfen? Folgen Sie dieser [Anleitung](https://github.com/Elwinmage/ha-reef-card/blob/main/doc/TRANSLATION.md).

# Vorstellung

Die **Reef card** für Home Assistant hilft Ihnen bei der Verwaltung Ihres Riffaquariums.

In Kombination mit [ha-reefbeat-component](https://github.com/Elwinmage/ha-reefbeat-component) werden Ihre Redsea-Geräte (ReefBeat) automatisch unterstützt.

> [!NOTE]
> Wenn Sie Nicht-Redsea-Geräte haben und möchten, dass diese unterstützt werden, können Sie dies [hier](https://github.com/Elwinmage/ha-reef-card/discussions/2) anfragen.

> [!TIP]
> Die Liste der zukünftigen Funktionen ist [hier](https://github.com/Elwinmage/ha-reef-card/issues?q=is%3Aissue%20state%3Aopen%20label%3Aenhancement) verfügbar<br />
> Die Liste der Fehler ist [hier](https://github.com/Elwinmage/ha-reef-card/issues?q=is%3Aissue%20state%3Aopen%20label%3Abug) verfügbar

# Kompatibilität

✅ Implementiert ☑️ In Bearbeitung ❌ Geplant

<table>
  <th>
    <td ><b>Modell</b></td>
    <td colspan="2"><b>Status</b></td>
    <td><b>Issues</b>  <br/>📆(Geplant) <br/> 🐛(Bugs)</td>
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
    <td>RSSENSE<br /> Wenn Sie eines besitzen, können Sie mich <a href="https://github.com/Elwinmage/ha-reefbeat-component/discussions/8">hier</a> kontaktieren und ich werde die Unterstützung hinzufügen.</td><td>❌</td>
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

# Inhaltsverzeichnis

- [Installation](https://github.com/Elwinmage/ha-reef-card/#installation)
- [Konfiguration](https://github.com/Elwinmage/ha-reef-card/#configuration)
- [ReefATO+](https://github.com/Elwinmage/ha-reef-card/#reefato)
- [ReefControl](https://github.com/Elwinmage/ha-reef-card/#reefcontrol)
- [ReefDose](https://github.com/Elwinmage/ha-reef-card/#reefdose)
- [ReefLED](https://github.com/Elwinmage/ha-reef-card/#reefled)
- [ReefMat](https://github.com/Elwinmage/ha-reef-card/#reefmat)
- [ReefRun](https://github.com/Elwinmage/ha-reef-card/#reefrun)
- [ReefWave](https://github.com/Elwinmage/ha-reef-card/#reefwave)
- [FAQ](https://github.com/Elwinmage/ha-reef-card/#faq)

# Installation

## Direkte Installation

Klicken Sie hier, um direkt zum Repository in HACS zu gelangen, und klicken Sie auf „Herunterladen":  [![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=Elwinmage&repository=ha-reef-card&category=plugin)

## In HACS suchen
Oder suchen Sie in HACS nach «reef-card».

<p align="center">
<img src="../img/hacs_search.png" alt="Image">
</p>

# Konfiguration

Ohne den Parameter `device` erkennt die Karte automatisch alle ReefBeat-Geräte und lässt Sie das gewünschte auswählen.

Um die Geräteauswahl zu entfernen und ein bestimmtes Gerät zu erzwingen, setzen Sie den Parameter `device` auf den Namen Ihres Geräts.

<table>
  <tr>
<td><img src="../img/card_rsdose4_config_2.png"/></td>
<td><img src="../img/card_rsdose4_config.png"/></td>
    </tr>
</table>

# ReefATO

Geplant.
  
Möchten Sie, dass es schneller unterstützt wird? Stimmen Sie [hier](https://github.com/Elwinmage/ha-reef-card/discussions/22) ab.

# ReefControl

Geplant.

Möchten Sie, dass es schneller unterstützt wird? Stimmen Sie [hier](https://github.com/Elwinmage/ha-reef-card/discussions/22) ab.

# ReefDose

ReefDose mit ha-reef-card in Aktion:

[![Video ansehen](https://img.youtube.com/vi/Qee5LH0T9wQ/0.jpg)](https://www.youtube.com/watch?v=Qee5LH0T9wQ)


Die ReefDose-Karte ist in 6 Bereiche unterteilt:

 1. Konfiguration/WLAN-Informationen
 2. Zustände
 3. Manuelle Dosierung
 4. Konfiguration und Zeitplanung der Köpfe
 5. Verwaltung der Ergänzungsmittel
 6. Warteschlange zukünftiger Dosierungen

<img src="../img/rsdose/rsdose4_ex1.png"/>

## Konfiguration/WLAN-Informationen
<img src="../img/rsdose/zone_1.png"/>

***

<span >Klicken Sie auf das Symbol <img src="../img/rsdose/cog_icon.png" width="30" />, um die allgemeine Konfiguration des ReefDose zu verwalten.</span>

<img src="../img/rsdose/zone_1_dialog_config.png"/> 

<span>Klicken Sie auf das Symbol <img width="30px" src="../img/rsdose/wifi_icon.png"/> um die Netzwerkeinstellungen zu verwalten.</span>

<img src="../img/rsdose/zone_1_dialog_wifi.png"/> 

## Zustände

 <img src="../img/rsdose/zone_2.png"/>

***
<span>Der Wartungsschalter <img width="30px" src="../img/rsdose/zone_2_maintenance.png"/> ermöglicht den Wechsel in den Wartungsmodus.</span>

 <img  src="../img/rsdose/maintenance_view.png"/>

<span>Der Ein/Aus-Schalter <img width="30px" src="../img/rsdose/zone_2_off.png"/> ermöglicht das Umschalten zwischen den Ein- und Aus-Zuständen des ReefDose.</span>

 <img  src="../img/rsdose/off_view.png"/>


## Manuelle Dosierung

<img src="../img/rsdose/zone_3.png"/>

***
<span>Die Schaltfläche <img src="../img/rsdose/zone_3_manula_config_button.png"/> zeigt die Standard-Manualdosis für diesen Kopf an. Ein Klick öffnet das Konfigurationsfenster für diese Dosierung.</span>

<img src="../img/rsdose/zone_3_dialog_manual_dose_without.png"/>

Sie können Verknüpfungen über den Karten-Editor hinzufügen:

<img src="../img/rsdose/editor.png"/>

Zum Beispiel bietet Kopf 1 die Werte 2, 5 und 10 mL als Verknüpfungen an.

Diese Werte erscheinen oben im Dialogfeld. Ein Klick auf diese Verknüpfungen sendet einen Befehl zur Dosierung des definierten Wertes.

<img src="../img/rsdose/zone_3_dialog_manual_dose.png"/>

<span>Ein Drücken der Taste für manuelle Dosierung: <img src="../img/rsdose/zone_3_manual_button.png"/> sendet einen Dosierbefehl mit dem direkt darüber sichtbaren Standardwert: <img src="../img/rsdose/zone_3_manual_dose.png"/>, also 10 mL in diesem Beispiel.
</span>


## Konfiguration und Zeitplanung der Köpfe

 <img src="../img/rsdose/zone_4.png"/>

***
Dieser Bereich ermöglicht die Anzeige der aktuellen Kopfprogrammierung und deren Änderung.
- Der farbige Kreisring zeigt den prozentualen Anteil der bereits verabreichten Tagesdosis an.
- Die gelbe Zahl oben zeigt den kumulierten täglichen Manualdosis-Gesamtwert an.
- Der mittlere Teil zeigt das verteilte Volumen im Verhältnis zum insgesamt geplanten Tagesvolumen an.
- Der blaue untere Teil zeigt die Anzahl der verabreichten Dosen im Verhältnis zur Gesamtzahl der Tagesdosen an (Beispiel: 14/24 für Blau, da es eine stündliche Programmierung ist und dieser Screenshot um 14:15 Uhr aufgenommen wurde). Die Werte für Violett und Grün zeigen 0/0, da diese Dosen um 8 Uhr verteilt werden sollten, die Integration aber nach 8 Uhr gestartet wurde, sodass heute keine Dosen erfolgen werden.
- Ein langer Klick auf einen der 4 Köpfe schaltet diesen ein oder aus.
- Ein Klick auf einen Kopf öffnet das Programmierungsfenster.
  Von diesem Fenster aus können Sie eine Befüllung starten, den Kopf kalibrieren, die Tagesdosis und deren Planung ändern. Vergessen Sie nicht, die Programmierung zu speichern, bevor Sie das Fenster schließen.
  
  <img src="../img/rsdose/zone_4_dialog_schedule.png"/>
   

## Verwaltung der Ergänzungsmittel

 <img src="../img/rsdose/zone_5.png"/>

***
Dieser Bereich dient der Verwaltung der Ergänzungsmittel.
Wenn bereits ein Ergänzungsmittel deklariert ist, öffnet ein Klick darauf das Konfigurationsfenster, in dem Sie:
- Das Ergänzungsmittel löschen können (Papierkorb-Symbol oben rechts)
- Das Gesamtvolumen des Behälters angeben können
- Das tatsächliche Volumen des Ergänzungsmittels angeben können
- Entscheiden können, ob Sie das verbleibende Volumen verfolgen möchten. Ein Klick auf die Verknüpfungen oben aktiviert die Steuerung und setzt die Standardwerte mit einem vollen Behälter.
- Den Anzeigenamen des Ergänzungsmittels ändern können.

 <img src="../img/rsdose/zone_5_dialog_container.png"/>


Wenn kein Ergänzungsmittel mit einem Kopf verknüpft ist, können Sie eines hinzufügen, indem Sie auf den Behälter mit einem '+' klicken (Kopf 4 in unserem Beispiel).

<img src="../img/rsdose/zone_5_add_container.png"/>

Folgen Sie dann den Anweisungen:

<img src="../img/rsdose/zone_5_dialog_add.png"/>

### Ergänzungsmittel

Hier ist die Liste der unterstützten Ergänzungsmittelbilder, nach Marken gruppiert. Wenn Ihres ein ❌ anzeigt, können Sie dessen Hinzufügung [hier](https://github.com/Elwinmage/ha-reef-card/discussions/25) anfragen.

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

## Warteschlange zukünftiger Dosierungen

<img src="../img/rsdose/zone_6.png"/>

***
Dieser Bereich zeigt einfach die Liste der zukünftigen Dosierungen Ihres Geräts an, ob automatisch oder manuell (verschobener Zeitplan aufgrund der definierten Wartezeit zwischen zwei verschiedenen Ergänzungsmitteln).

# ReefLed

Geplant.

Möchten Sie, dass es schneller unterstützt wird? Stimmen Sie [hier](https://github.com/Elwinmage/ha-reef-card/discussions/22) ab.

# ReefMat

Geplant.

Möchten Sie, dass es schneller unterstützt wird? Stimmen Sie [hier](https://github.com/Elwinmage/ha-reef-card/discussions/22) ab.

# ReefRun

Geplant.

Möchten Sie, dass es schneller unterstützt wird? Stimmen Sie [hier](https://github.com/Elwinmage/ha-reef-card/discussions/22) ab.

# ReefWave

Geplant.

Möchten Sie, dass es schneller unterstützt wird? Stimmen Sie [hier](https://github.com/Elwinmage/ha-reef-card/discussions/22) ab.

# FAQ

---

[buymecoffee]: https://paypal.me/Elwinmage
[buymecoffeebadge]: https://img.shields.io/badge/buy%20me%20a%20coffee-donate-yellow.svg?style=flat-square
