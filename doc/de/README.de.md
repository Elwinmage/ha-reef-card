# ha-reef-card 🌊 für HomeAssistant

> Teil des **[ReefTech Project Ökosystems](https://elwinmage.github.io/reeftank/de.html)**

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

# Unterstützte Sprachen : [<img src="https://flagicons.lipis.dev/flags/4x3/fr.svg" style="width: 5%;"/>](../fr/README.fr.md) [<img src="https://flagicons.lipis.dev/flags/4x3/gb.svg" style="width: 5%"/>](../../README.md) [<img src="https://flagicons.lipis.dev/flags/4x3/es.svg" style="width: 5%"/>](../es/README.es.md) [<img src="https://flagicons.lipis.dev/flags/4x3/pt.svg" style="width: 5%"/>](../pt/README.pt.md) [<img src="https://flagicons.lipis.dev/flags/4x3/de.svg" style="width: 5%"/>](README.de.md) [<img src="https://flagicons.lipis.dev/flags/4x3/it.svg" style="width: 5%"/>](../it/README.it.md) [<img src="https://flagicons.lipis.dev/flags/4x3/pl.svg" style="width: 5%"/>](../pl/README.pl.md)

<!-- Vous souhaitez aider à la traduction, suivez ce [guide](https://github.com/Elwinmage/ha-reef-card/blob/main/doc/TRANSLATION.md). -->

Ihre Sprache wird noch nicht unterstützt und Sie möchten bei der Übersetzung helfen? Folgen Sie dieser [Anleitung](https://github.com/Elwinmage/ha-reef-card/blob/main/doc/TRANSLATION.md).

# Vorstellung

Die **Reef card** für Home Assistant hilft Ihnen bei der Verwaltung Ihres Riffaquariums.

In Kombination mit [ha-reefbeat-component](https://github.com/Elwinmage/ha-reefbeat-component) werden Ihre Redsea-Geräte
(ReefBeat) automatisch unterstützt.

## Verwandte Projekte

Diese Karte gehört zu einer Reihe von Projekten für ein aus Home Assistant
gesteuertes Riffaquarium:

| Projekt                                                                           | Aufgabe                                                                                                                                                                |
| --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [**ha-reef-card**](https://github.com/Elwinmage/ha-reef-card)                     | Diese Karte. Eine interaktive grafische Ansicht jedes Geräts auf Ihrem Dashboard und der einzige Weg, erweiterte Zeitpläne zu bearbeiten.                              |
| [**ha-reefbeat-component**](https://github.com/Elwinmage/ha-reefbeat-component)   | Integration der Red-Sea-ReefBeat-Geräte, lokal und ohne Cloud gesteuert: ReefATO+, ReefDose, ReefLed, ReefMat, ReefRun und ReefWave. Sie versorgt die Karte mit Daten. |
| [**ha-aquamedic-component**](https://github.com/Elwinmage/ha-aquamedic-component) | Integration der Aqua-Medic-Pumpen über die Gizwits-Cloud-API: Strömungspumpen EcoDrift und SmartDrift, Rückförderpumpen DC Runner.                                     |
| [**reefbeatEnergyBackup**](https://github.com/Elwinmage/reefbeatEnergyBackup)     | Batteriepuffer bei Stromausfall. 24V-LiFePO₄-Pack, gesteuert von einem Raspberry Pi, mit stufenweiser Drosselung der Pumpen je nach Ladezustand.                       |

Alle sind gemeinsam auf der [Projektseite](https://elwinmage.github.io/reeftank/) dokumentiert.

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
    <td>RSATO+</td><td>☑️</td>
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
- [Wartung](https://github.com/Elwinmage/ha-reef-card/#maintenance)
- [FAQ](https://github.com/Elwinmage/ha-reef-card/#faq)

# Installation

## Direkte Installation

Klicken Sie hier, um direkt zum Repository in HACS zu gelangen, und klicken Sie auf „Herunterladen": [![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=Elwinmage&repository=ha-reef-card&category=plugin)

## In HACS suchen

Oder suchen Sie in HACS nach «reef-card».

<p align="center">
<img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/hacs_search.png" alt="Image">
</p>

# Konfiguration

Ohne den Parameter `device` erkennt die Karte automatisch alle ReefBeat-Geräte und lässt Sie das gewünschte auswählen.

Um die Geräteauswahl zu entfernen und ein bestimmtes Gerät zu erzwingen, setzen Sie den Parameter `device` auf den Namen Ihres Geräts.

<table>
  <tr>
<td><img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/card_rsdose4_config_2.png"/></td>
<td><img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/card_rsdose4_config.png"/></td>
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

1.  Konfiguration/WLAN-Informationen
2.  Zustände
3.  Manuelle Dosierung
4.  Konfiguration und Zeitplanung der Köpfe
5.  Verwaltung der Ergänzungsmittel
6.  Warteschlange zukünftiger Dosierungen

<img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/rsdose4_ex1.png"/>

## Konfiguration/WLAN-Informationen

<img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/zone_1.png"/>

---

<span >Klicken Sie auf das Symbol <img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/cog_icon.png" width="30" />, um die allgemeine Konfiguration des ReefDose zu verwalten.</span>

<img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/zone_1_dialog_config.png"/>

<span>Klicken Sie auf das Symbol <img width="30px" src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/wifi_icon.png"/> um die Netzwerkeinstellungen zu verwalten.</span>

<img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/zone_1_dialog_wifi.png"/>

## Zustände

 <img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/zone_2.png"/>

---

<span>Der Wartungsschalter <img width="30px" src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/zone_2_maintenance.png"/> ermöglicht den Wechsel in den Wartungsmodus.</span>

 <img  src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/maintenance_view.png"/>

<span>Der Ein/Aus-Schalter <img width="30px" src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/zone_2_off.png"/> ermöglicht das Umschalten zwischen den Ein- und Aus-Zuständen des ReefDose.</span>

 <img  src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/off_view.png"/>

## Manuelle Dosierung

<img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/zone_3.png"/>

---

<span>Die Schaltfläche <img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/zone_3_manula_config_button.png"/> zeigt die Standard-Manualdosis für diesen Kopf an. Ein Klick öffnet das Konfigurationsfenster für diese Dosierung.</span>

<img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/zone_3_dialog_manual_dose_without.png"/>

Sie können Verknüpfungen über den Karten-Editor hinzufügen:

<img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/editor.png"/>

Zum Beispiel bietet Kopf 1 die Werte 2, 5 und 10 mL als Verknüpfungen an.

Diese Werte erscheinen oben im Dialogfeld. Ein Klick auf diese Verknüpfungen sendet einen Befehl zur Dosierung des definierten Wertes.

<img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/zone_3_dialog_manual_dose.png"/>

<span>Ein Drücken der Taste für manuelle Dosierung: <img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/zone_3_manual_button.png"/> sendet einen Dosierbefehl mit dem direkt darüber sichtbaren Standardwert: <img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/zone_3_manual_dose.png"/>, also 10 mL in diesem Beispiel.
</span>

## Konfiguration und Zeitplanung der Köpfe

 <img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/zone_4.png"/>

---

Dieser Bereich ermöglicht die Anzeige der aktuellen Kopfprogrammierung und deren Änderung.

- Der farbige Kreisring zeigt den prozentualen Anteil der bereits verabreichten Tagesdosis an.
- Die gelbe Zahl oben zeigt den kumulierten täglichen Manualdosis-Gesamtwert an.
- Der mittlere Teil zeigt das verteilte Volumen im Verhältnis zum insgesamt geplanten Tagesvolumen an.
- Der blaue untere Teil zeigt die Anzahl der verabreichten Dosen im Verhältnis zur Gesamtzahl der Tagesdosen an (Beispiel: 14/24 für Blau, da es eine stündliche Programmierung ist und dieser Screenshot um 14:15 Uhr aufgenommen wurde). Die Werte für Violett und Grün zeigen 0/0, da diese Dosen um 8 Uhr verteilt werden sollten, die Integration aber nach 8 Uhr gestartet wurde, sodass heute keine Dosen erfolgen werden.
- Ein langer Klick auf einen der 4 Köpfe schaltet diesen ein oder aus.
- Ein Klick auf einen Kopf öffnet das Programmierungsfenster.
  Von diesem Fenster aus können Sie eine Befüllung starten, den Kopf kalibrieren, die Tagesdosis und deren Planung ändern. Vergessen Sie nicht, die Programmierung zu speichern, bevor Sie das Fenster schließen.

  <img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/zone_4_dialog_schedule.png"/>

## Verwaltung der Ergänzungsmittel

 <img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/zone_5.png"/>

---

Dieser Bereich dient der Verwaltung der Ergänzungsmittel.
Wenn bereits ein Ergänzungsmittel deklariert ist, öffnet ein Klick darauf das Konfigurationsfenster, in dem Sie:

- Das Ergänzungsmittel löschen können (Papierkorb-Symbol oben rechts)
- Das Gesamtvolumen des Behälters angeben können
- Das tatsächliche Volumen des Ergänzungsmittels angeben können
- Entscheiden können, ob Sie das verbleibende Volumen verfolgen möchten. Ein Klick auf die Verknüpfungen oben aktiviert die Steuerung und setzt die Standardwerte mit einem vollen Behälter.
- Den Anzeigenamen des Ergänzungsmittels ändern können.

 <img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/zone_5_dialog_container.png"/>

Wenn kein Ergänzungsmittel mit einem Kopf verknüpft ist, können Sie eines hinzufügen, indem Sie auf den Behälter mit einem '+' klicken (Kopf 4 in unserem Beispiel).

<img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/zone_5_add_container.png"/>

Folgen Sie dann den Anweisungen:

<img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/zone_5_dialog_add.png"/>

### Ergänzungsmittel

Hier ist die Liste der unterstützten Bilder für Ergänzungsmittel, nach Marke gruppiert. Wenn Ihres ein ❌ anzeigt, können Sie dessen Hinzufügung [hier](https://github.com/Elwinmage/ha-reef-card/discussions/25) beantragen.

<details>
<summary><b>ATI &nbsp; <sup>2/2 🖼️</sup></b></summary>

<table>
<tr><td>✅</td><td>Essential Pro 1</td><td><img style='width:20%;' src='../../public/img/supplements/69692902-dcf9-4f41-b104-402154dc348a.supplement.png'/></td></tr>
<tr><td>✅</td><td>Essential Pro 2</td><td><img style='width:20%;' src='../../public/img/supplements/e1dbec89-2396-4269-8f28-ab7534cb2d7d.supplement.png'/></td></tr>
</table>
</details>

<details>
<summary><b>Aqua Forest &nbsp; <sup>3/9 🖼️</sup></b></summary>

<table>
<tr><td>✅</td><td>Ca Plus</td><td><img style='width:20%;' src='../../public/img/supplements/9ea6c9f2-b6f3-41ee-9370-06457f286fe5.supplement.png'/></td></tr>
<tr><td>❌</td><td colspan='2'>Calcium </td></tr>
<tr><td>❌</td><td colspan='2'>Component 1+</td></tr>
<tr><td>❌</td><td colspan='2'>Component 2+</td></tr>
<tr><td>❌</td><td colspan='2'>Component 3+</td></tr>
<tr><td>❌</td><td colspan='2'>KH Buffer</td></tr>
<tr><td>✅</td><td>KH Plus</td><td><img style='width:20%;' src='../../public/img/supplements/e391e8d1-0d4c-4355-8887-9231500703ef.supplement.png'/></td></tr>
<tr><td>❌</td><td colspan='2'>Magnesium</td></tr>
<tr><td>✅</td><td>Mg Plus</td><td><img style='width:20%;' src='../../public/img/supplements/deb3a943-68a5-40a9-860b-e6d259eee947.supplement.png'/></td></tr>
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
<tr><td>✅</td><td>Aragonite A</td><td><img style='width:20%;' src='../../public/img/supplements/322c1c47-7259-4fd9-9050-f6157036ea36.supplement.png'/></td></tr>
<tr><td>✅</td><td>Aragonite B</td><td><img style='width:20%;' src='../../public/img/supplements/e6537278-0e0a-4fd7-8146-566334bb74ed.supplement.png'/></td></tr>
<tr><td>✅</td><td>Aragonite C</td><td><img style='width:20%;' src='../../public/img/supplements/5f491b59-4f54-4572-bbce-aa9b708ccb51.supplement.png'/></td></tr>
<tr><td>✅</td><td>Bio Kalium</td><td><img style='width:20%;' src='../../public/img/supplements/8fec18b0-adf6-4dfa-b923-c7226a6fb87d.supplement.png'/></td></tr>
<tr><td>✅</td><td>Bio Metals</td><td><img style='width:20%;' src='../../public/img/supplements/a1d797e3-4679-4be4-9219-22e35822ab97.supplement.png'/></td></tr>
<tr><td>✅</td><td>Bio enhance</td><td><img style='width:20%;' src='../../public/img/supplements/fd8dee42-f3da-4660-b491-880d7dac869a.supplement.png'/></td></tr>
<tr><td>✅</td><td>Gbio Gen</td><td><img style='width:20%;' src='../../public/img/supplements/26a4f030-e78c-459c-90cb-5c6099de10fd.supplement.png'/></td></tr>
</table>
</details>

<details>
<summary><b>Red Sea &nbsp; <sup>10/13 🖼️</sup></b></summary>

<table>
<tr><td>✅</td><td>Bio Active (Colors D)</td><td><img style='width:20%;' src='../../public/img/supplements/7af9b16b-9e63-488e-8c86-261ef8c4a1ce.supplement.png'/></td></tr>
<tr><td>✅</td><td>Calcium (Foundation A)</td><td><img style='width:20%;' src='../../public/img/supplements/7d67412c-fde0-44d4-882a-dc8746fd4acb.supplement.png'/></td></tr>
<tr><td>❌</td><td colspan='2'>Calcium (Powder)</td></tr>
<tr><td>✅</td><td>Iodine (Colors A)</td><td><img style='width:20%;' src='../../public/img/supplements/93e742b0-67c9-4800-9aa9-212e52532343.supplement.png'/></td></tr>
<tr><td>✅</td><td>Iron (Colors C)</td><td><img style='width:20%;' src='../../public/img/supplements/c7a26034-8e40-41bb-bfb5-169089470f1e.supplement.png'/></td></tr>
<tr><td>✅</td><td>KH/Alkalinity (Foundation B)</td><td><img style='width:20%;' src='../../public/img/supplements/76830db3-a0bd-459a-9974-76a57d026893.supplement.png'/></td></tr>
<tr><td>❌</td><td colspan='2'>KH/Alkalinity (Powder)</td></tr>
<tr><td>✅</td><td>Magnesium (Foundation C)</td><td><img style='width:20%;' src='../../public/img/supplements/f524734e-8651-496e-b09b-640b40fc8bab.supplement.png'/></td></tr>
<tr><td>❌</td><td colspan='2'>Magnesium (Powder)</td></tr>
<tr><td>✅</td><td>NO3PO4-X</td><td><img style='width:20%;' src='../../public/img/supplements/ffaf6ff8-bc6d-44eb-9e4b-e679943dc835.supplement.png'/></td></tr>
<tr><td>✅</td><td>Potassium (Colors B)</td><td><img style='width:20%;' src='../../public/img/supplements/2f386917-54bd-4dd4-aa8b-9d1fea37edc5.supplement.png'/></td></tr>
<tr><td>✅</td><td>Reef Energy Plus</td><td><img style='width:20%;' src='../../public/img/supplements/bf9a7da3-741b-4c1d-8542-d9344a95fb70.supplement.png'/></td></tr>
<tr><td>✅</td><td>ReefCare Program</td><td><img style='width:20%;' src='../../public/img/supplements/redsea-reefcare.supplement.png'/></td></tr>
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
<summary><b>Tropic Marin &nbsp; <sup>5/14 🖼️</sup></b></summary>

<table>
<tr><td>❌</td><td colspan='2'>A Element</td></tr>
<tr><td>✅</td><td>All-For-Reef</td><td><img style='width:20%;' src='../../public/img/supplements/aff00331-3c23-4357-b6d4-6609dbc4fed1.supplement.png'/></td></tr>
<tr><td>✅</td><td>Amino Organic</td><td><img style='width:20%;' src='../../public/img/supplements/fddbe0a4-02eb-4903-969b-6c27c805bf6b.supplement.png'/></td></tr>
<tr><td>❌</td><td colspan='2'>Balling A</td></tr>
<tr><td>❌</td><td colspan='2'>Balling B</td></tr>
<tr><td>❌</td><td colspan='2'>Balling C</td></tr>
<tr><td>✅</td><td>Bio-Magnesium</td><td><img style='width:20%;' src='../../public/img/supplements/2f04f694-3743-4e12-a45f-a3eb63aef806.supplement.png'/></td></tr>
<tr><td>✅</td><td>Carbo Calcium</td><td><img style='width:20%;' src='../../public/img/supplements/8cdabb9f-ebcf-4675-a10f-f9020941928f.supplement.png'/></td></tr>
<tr><td>❌</td><td colspan='2'>Elimi-NP</td></tr>
<tr><td>❌</td><td colspan='2'>K Element</td></tr>
<tr><td>❌</td><td colspan='2'>Liquid Buffer</td></tr>
<tr><td>❌</td><td colspan='2'>NP-Bacto-Balance</td></tr>
<tr><td>❌</td><td colspan='2'>Plus-NP</td></tr>
<tr><td>✅</td><td>Potassium</td><td><img style='width:20%;' src='../../public/img/supplements/964e897e-9668-4fc8-9cd9-e8c42a27cf85.supplement.png'/></td></tr>
</table>
</details>

# ReefLed

Geplant.

Möchten Sie, dass es schneller unterstützt wird? Stimmen Sie [hier](https://github.com/Elwinmage/ha-reef-card/discussions/22) ab.

# ReefMat

ReefMat mit ha-reef-card in Aktion:

[![Video ansehen](https://img.youtube.com/vi/yyNyUSitb1E/0.jpg)](https://www.youtube.com/watch?v=yyNyUSitb1E)

Die ReefMat-Karte ist in 7 Bereiche unterteilt:

1. Konfiguration / WLAN-Informationen
2. Zustände
3. Rolleninformationen (verbrauchte Gesamtlänge, verbleibende Länge, Rollenende, Modus...)
4. Manueller/Automatischer Vorschub
5. Sensor
6. Geplanter Vorschub
7. Wochen- / Monatsverbrauchsdiagramm

<img src="../img/rsmat/rsmat_zones.png"/>

Das Hintergrundbild ändert sich je nach Nutzungszustand der Rolle mit 5 verschiedenen Bildern:

<table>
  <tr>
    <td align="center"><img src="../img/rsmat/RSMAT_100_BASE.png" width="100%"/><br/><b>0%</b></td>
    <td align="center"><img src="../img/rsmat/RSMAT_75_BASE.png" width="100%"/><br/><b>25%</b></td>
    <td align="center"><img src="../img/rsmat/RSMAT_50_BASE.png" width="100%"/><br/><b>50%</b></td>
  </tr>
  <tr>
    <td align="center"><img src="../img/rsmat/RSMAT_25_BASE.png" width="100%"/><br/><b>75%</b></td>
    <td align="center"><img src="../img/rsmat/RSMAT_0_BASE.png" width="100%"/><br/><b>100%</b></td>
    <td></td>
  </tr>
</table>

## Konfiguration / WLAN-Informationen

<img src="../img/rsmat/zone_1.png"/>

---

<span>Klicken Sie auf das Symbol <img src="../img/rsdose/cog_icon.png" width="30" /> zur Verwaltung der allgemeinen Konfiguration des ReefMat.</span>

<img src="../img/rsmat/zone_1_dialog_configuration.png"/>

<span>Klicken Sie auf das Symbol <img src="../img/rsdose/wifi_icon.png" width="30" /> zur Verwaltung der Netzwerkeinstellungen.</span>

<img src="../img/rsmat/zone_1_dialog_wifi.png"/>

## Zustände

<img src="../img/rsmat/zone_2.png"/>

---

<span>Der Wartungsschalter <img src="../img/mdi/mdi_account-wrench.png" width="20"/> wechselt in den Wartungsmodus.</span>

 <img  src="../img/rsmat/maintenance.png"/>

<span>Der Ein/Aus-Schalter <img src="../img/mdi/mdi_power-plug.png" width="20"/> schaltet den ReefMat zwischen Ein- und Aus-Zustand um.</span>

 <img  src="../img/rsmat/off_mode.png"/>

## Rolleninformationen

<img src="../img/rsmat/zone_3.png"/>

---

Dieser Bereich zeigt den Echtzeitstatus der Filterrolle, von oben nach unten:

- Die **insgesamt verbrauchte Länge** seit Beginn der Rolle (oben, rot)
- Die **verbleibende Länge** in der Mitte in rot. Wenn die Rolle leer ist, erscheint ein <img src="../img/mdi/mdi_paper-roll.png" width="20"/> blinkendes Symbol und ein Dialogfeld schlägt vor, die Rolle zu ersetzen.

<img src="../img/rsmat/zone_3_dialog_new_roll.png"/>

- Die **verbleibenden Tage** bis zum Rollenende, geschätzt anhand des täglichen Durchschnittsverbrauchs (schwarz)
- Der **tägliche Durchschnittsverbrauch** in cm (unten links)
- Der aktuelle **Betriebsmodus**: Auto, Wartung, Aus… (unter dem RedSea-Logo)
- Der **Rollenverbrauchsprozentsatz** (Kreisbogen unten rechts)

Wird eine Anomalie erkannt, verwandelt sich das RedSea-Logo in ein <img src="../img/mdi/mdi_alert-decagram.png" width="20"/> blinkendes Symbol.
Ein Klick auf diesen Alarm öffnet den Anomalie-Dialog:

<img src="../img/rsmat/alert.png"/>
<img src="../img/rsmat/zone_3_dialog_alert.png" />

## Manueller/Automatischer Vorschub

<img src="../img/rsmat/zone_4.png"/>
<img src="../img/rsmat/zone_4_auto_off.png"/>
---

Dieser Bereich steuert den Rollenvorschub.

Von links nach rechts:

- Die Schaltfläche <img src="../img/mdi/mdi_send.png" width="20"/> löst einen **manuellen Vorschub** der Rolle um die angezeigte Länge aus.
- Der angezeigte **Vorschubwert** (in cm) ist der Wert, der beim Drücken der Taste gesendet wird. Ein Klick öffnet den Bearbeitungsdialog.

<img src="../img/rsmat/zone_4_dialog_manual_advance.png"/>

- Die **automatische Vorschubschaltfläche** <img src="../img/mdi/mdi_autorenew.png" width="20"/> <img src="../img/mdi/mdi_autorenew-off.png" width="20"/> aktiviert oder deaktiviert den automatischen Rollenvorschub.

## Sensor

<img src="../img/rsmat/zone_5.png"/>

---

Dieser Bereich zeigt den Status des Niveausensors.

Drei Zustände sind möglich:

| Zustand              | Bild                                                            |
| -------------------- | --------------------------------------------------------------- |
| Sensor angeschlossen | <img src="../img/rsmat/RSMAT_SENSOR_PLUGGED.png" width="80"/>   |
| Sensor getrennt      | <img src="../img/rsmat/RSMAT_SENSOR_UNPLUGGED.png" width="80"/> |
| Schmutziger Sensor   | <img src="../img/mdi/mdi_liquid-spot.png" width="80"/>          |

## Geplanter Vorschub

<img src="../img/rsmat/zone_6.png"/>

---

Diese Schaltfläche <img src="../img/mdi/mdi_auto-mode_red.png" width="20"/><img src="../img/mdi/mdi_auto-mode_black.png" width="20"/> zeigt den Status des geplanten Vorschubs und ermöglicht die Bearbeitung per Klick.

<img src="../img/rsmat/zone_6_dialog_schedule.png"/>

## Verbrauchsdiagramm

<img src="../img/rsmat/zone_7.png"/> 
<img src="../img/rsmat/monthly.png"/>

---

Dieser Bereich zeigt ein Diagramm des Rollenverbrauchs über die Zeit.
Ein Klick auf die Schaltfläche wechselt zwischen den zwei verfügbaren Modi:

- Der Modus **Weekly** zeigt den Verbrauch der letzten 7 Tage.
- Der Modus **Monthly** zeigt den Verbrauch der letzten 30 Tage.

Ein Druck oben links im Diagramm öffnet die Detailansicht in Home Assistant.

## Messages

<img src="../img/rsmat/zone_8.png"/>

---

Dieser Bereich zeigt die letzten Systemmeldungen des ReefMat. Er hat zwei Zeilen:

- Die graue Zeile zeigt die **letzte Nachricht**.
- Die rosa Zeile zeigt die **letzte Warnung**, mit dem Symbol ⚠.

Ein Klick auf <img src="../img/mdi/mdi_delete-empty.png" width="20"/> löscht die entsprechende Nachricht.

Diese Zeilen können über die Karteneditor-Oberfläche ausgeblendet werden.

<img src="../img/rsmat/editor.png" />

# ReefMat

ReefMat con ha-reef-card en acción:

[![Ver el video](https://img.youtube.com/vi/XXXX/0.jpg)](https://www.youtube.com/watch?v=XXXX)

La tarjeta ReefMat está dividida en 7 zonas:

1. Configuración / Información Wifi
2. Estados
3. Información del rollo (longitud total usada, longitud restante, fin de rollo, modo...)
4. Avance manual/automático
5. Sonda
6. Avance programado
7. Gráfico de uso semanal / mensual

<img src="../img/rsmat/rsmat_zones.png"/>

La imagen de fondo cambia según el estado de uso del rollo con 5 imágenes diferentes:

<table>
  <tr>
    <td align="center"><img src="../img/rsmat/RSMAT_100_BASE.png" width="100%"/><br/><b>0%</b></td>
    <td align="center"><img src="../img/rsmat/RSMAT_75_BASE.png" width="100%"/><br/><b>25%</b></td>
    <td align="center"><img src="../img/rsmat/RSMAT_50_BASE.png" width="100%"/><br/><b>50%</b></td>
  </tr>
  <tr>
    <td align="center"><img src="../img/rsmat/RSMAT_25_BASE.png" width="100%"/><br/><b>75%</b></td>
    <td align="center"><img src="../img/rsmat/RSMAT_0_BASE.png" width="100%"/><br/><b>100%</b></td>
    <td></td>
  </tr>
</table>

## Configuración / Información Wifi

<img src="../img/rsmat/zone_1.png"/>

---

<span>Haga clic en el icono <img src="../img/rsdose/cog_icon.png" width="30" /> para gestionar la configuración general del ReefMat.</span>

<img src="../img/rsmat/zone_1_dialog_configuration.png"/>

<span>Haga clic en el icono <img src="../img/rsdose/wifi_icon.png" width="30" /> para gestionar los parámetros de red.</span>

<img src="../img/rsmat/zone_1_dialog_wifi.png"/>

## Estados

<img src="../img/rsmat/zone_2.png"/>

---

<span>El interruptor de mantenimiento <img src="../img/mdi/mdi_account-wrench.png" width="20"/> permite cambiar al modo de mantenimiento.</span>

 <img  src="../img/rsmat/maintenance.png"/>

<span>El interruptor de encendido/apagado <img src="../img/mdi/mdi_power-plug.png" width="20"/> permite alternar entre los estados encendido y apagado del ReefMat.</span>

 <img  src="../img/rsmat/off_mode.png"/>

## Información del rollo

<img src="../img/rsmat/zone_3.png"/>

---

Esta zona muestra el estado en tiempo real del rollo filtrante, de arriba a abajo:

- La **longitud total usada** desde el inicio del rollo (arriba, en rojo)
- La **longitud restante** en el centro en rojo. Cuando el rollo está vacío, aparece un <img src="../img/mdi/mdi_paper-roll.png" width="20"/> icono parpadeante en su lugar y un cuadro de diálogo propone reemplazar el rollo.

<img src="../img/rsmat/zone_3_dialog_new_roll.png"/>

- El **número de días restantes** antes del fin del rollo, estimado según el consumo diario promedio (en negro)
- El **consumo diario promedio** en cm (abajo a la izquierda)
- El **modo de funcionamiento** actual: Auto, Mantenimiento, Apagado… (debajo del logo RedSea)
- El **porcentaje de rollo usado** (arco circular abajo a la derecha)

Si se detecta una anomalía, el logo RedSea se transformará en un <img src="../img/mdi/mdi_alert-decagram.png" width="20"/> icono parpadeante.
Hacer clic en esta alerta abre el cuadro de diálogo de anomalías:

<img src="../img/rsmat/alert.png"/>
<img src="../img/rsmat/zone_3_dialog_alert.png" />

## Avance Manual/Automático

<img src="../img/rsmat/zone_4.png"/>
<img src="../img/rsmat/zone_4_auto_off.png"/>
---

Esta zona permite controlar el avance del rollo.

De izquierda a derecha:

- El botón <img src="../img/mdi/mdi_send.png" width="20"/> lanza un **avance manual** del rollo por la longitud indicada en el centro.
- El **valor de avance** mostrado (en cm) es el valor que se enviará al pulsar el botón. Hacer clic en este número abre el cuadro de edición.

<img src="../img/rsmat/zone_4_dialog_manual_advance.png"/>

- El **botón de avance automático** <img src="../img/mdi/mdi_autorenew.png" width="20"/> <img src="../img/mdi/mdi_autorenew-off.png" width="20"/> activa o desactiva el avance automático del rollo.

## Sonda

<img src="../img/rsmat/zone_5.png"/>

---

Esta zona muestra el estado del sensor de nivel.

Tres estados son posibles:

| Estado              | Imagen                                                          |
| ------------------- | --------------------------------------------------------------- |
| Sensor conectado    | <img src="../img/rsmat/RSMAT_SENSOR_PLUGGED.png" width="80"/>   |
| Sensor desconectado | <img src="../img/rsmat/RSMAT_SENSOR_UNPLUGGED.png" width="80"/> |
| Sensor sucio        | <img src="../img/mdi/mdi_liquid-spot.png" width="80"/>          |

## Avance programado

<img src="../img/rsmat/zone_6.png"/>

---

Este botón <img src="../img/mdi/mdi_auto-mode_red.png" width="20"/><img src="../img/mdi/mdi_auto-mode_black.png" width="20"/> muestra el estado del avance programado y permite editarlo haciendo clic.

<img src="../img/rsmat/zone_6_dialog_schedule.png"/>

## Gráfico de uso

<img src="../img/rsmat/zone_7.png"/> 
<img src="../img/rsmat/monthly.png"/>

---

Esta zona muestra un gráfico del consumo del rollo a lo largo del tiempo.
Hacer clic en el botón alterna entre los dos modos disponibles:

- El modo **Weekly** muestra el consumo de los últimos 7 días.
- El modo **Monthly** muestra el consumo de los últimos 30 días.

Pulsar en la esquina superior izquierda del gráfico abre la vista detallada en Home Assistant.

## Messages

<img src="../img/rsmat/zone_8.png"/>

---

Esta zona muestra los últimos mensajes del sistema del ReefMat. Tiene dos líneas:

- La línea gris muestra el **último mensaje** recibido.
- La línea rosa muestra la **última alerta**, precedida del símbolo ⚠.

Hacer clic en <img src="../img/mdi/mdi_delete-empty.png" width="20"/> borra el mensaje correspondiente.

# ReefRun

[![Video ansehen](https://img.youtube.com/vi/yyNyUSitb1E/0.jpg)](https://www.youtube.com/watch?v=yyNyUSitb1E)

Die ReefRun-Karte zeigt den Controller und seine beiden Pumpen so, wie sie
physisch angeschlossen sind, jede mit eigenem Kabel und eigener Verrohrung.
Pumpe 1 ist die linke, Pumpe 2 die rechte — typischerweise die Rückförderpumpe
und der DC Skimmer, aber jeder Anschluss nimmt beide Modelle auf.

<img src="../img/rsrun/rsrun_zones.png"/>

Die Karte ist in 6 Zonen gegliedert:

1. Versorgungszustand und Wartungsmodus
2. Batterie- und WLAN-Informationen
3. Controller: Betriebsart, Pumpentasten und Kalibrierungen
4. Pumpe 1: Tagesprogramm, Körper mit Wasserfluss in Echtzeit, Temperatur
5. Pumpe 2: Tagesprogramm, Körper mit Wasserfluss in Echtzeit, Temperatur
6. Letzte Meldung und letzte Warnung

## Versorgungszustand und Wartungsmodus

<img src="../img/rsrun/zone_1.png" >

<span>Der Wartungsschalter <img src="../img/mdi/mdi_account-wrench.png" width="20"/> wechselt in den Wartungsmodus.</span>

<img src="../img/rsrun/maintenance.png" >

<span>Der Ein/Aus-Schalter <img src="../img/mdi/mdi_power-plug.png" width="20"/> schaltet den Reef Dual Controller ein und aus.</span>

<img src="../img/rsrun/off_mode.png" >

## Batterie- und WLAN-Informationen

<img src="../img/rsrun/zone_2.png"/>

---

<span>Dieses Symbol <img src="../img/mdi/battery.png" width="30" /> zeigt den Batteriestand des Dual Controllers an.</span>

<span>Klicke auf das Symbol <img src="../img/mdi/wifi_icon.png" width="30" />, um die Netzwerkeinstellungen zu verwalten.</span>

<img src="../img/rsrun/zone_2_dialog_wifi.png"/>

## Controller: Betriebsart, Pumpentasten und Kalibrierungen

<img src="../img/rsrun/zone_3.png"/>

### Pumpeneinstellungen

Ein Klick auf <img src="../img/mdi/cog-1.png" width="5%"/> oder <img src="../img/mdi/cog-2.png" width="5%"/> öffnet den Konfigurationsdialog von Pumpe 1 bzw. 2.

<img src="../img/rsrun/zone_3_return_pump.png"/>
<img src="../img/rsrun/zone_3_skimmer.png"/>

> [!CAUTION]
> **Pumpe löschen** setzt ihre Einstellungen auf die Werkswerte zurück: das
> Tagesprogramm und die Sensorsteuerung gehen verloren. Es wird immer eine
> Bestätigung verlangt.

### Sensoreinstellungen

Ein Klick auf <img src="../img/mdi/cog-s.png" width="5%"/> öffnet den Konfigurationsdialog des Sensors.
<img src="../img/rsrun/zone_3_sensor.png"/>

### Pumpe Play/Pause <img src="../img/mdi/play.png" width="5%"/> / <img src="../img/mdi/pause.png" width="5%"/>

Ein Klick schaltet die einzelne Pumpe ein oder aus.

Der rote Ring zeigt die aktuelle Drehzahl.
<img src="../img/rsrun/speed.png"/>

Um die aktuelle Drehzahl zu ändern, halte <img src="../img/mdi/play.png" width="5%"/> / <img src="../img/mdi/pause.png" width="5%"/> gedrückt oder klicke auf das Tagesprogramm:

<img src="../img/rsrun/schedule.png"/>

## Zustände einer Pumpe

Der Pumpenkörper spiegelt wider, was das Gerät tatsächlich tut — ein Blick
genügt. Die beiden Pumpentypen haben nicht dieselben Zustände, deshalb werden
sie getrennt beschrieben.

## Pumpen 1 & 2

### Rückförderpumpe

<img src="../../src/img/redsea/RSRUN/reefrun_return.png" width="30%"/>

Eine einzige Darstellung deckt alle Zustände ab, die Karte ändert nur, wie sie
gezeichnet wird:

- **In Betrieb** — volle Farben, Wasser mit der aktuellen Drehzahl animiert.
- **Gestoppt** — dieselbe Darstellung ausgegraut, kein Fluss.
- **Getrennt** — dieselbe Ausgrauung, dazu ein blinkendes Stromkabel.

### Abschäumer

Drei eigene Darstellungen, eine je Becherzustand:

<table>
  <tr>
    <td align="center"><img src="../../src/img/redsea/RSRUN/reefrun_skimmer_on.png" width="100%"/><br/><b>In Betrieb</b><br/>Schaum im Becher, aufsteigende Blasen, Wasser animiert</td>
    <td align="center"><img src="../../src/img/redsea/RSRUN/reefrun_skimmer_full.png" width="100%"/><br/><b>Voller Becher</b><br/>Schaum auf ein Band unter dem Deckel reduziert</td>
    <td align="center"><img src="../../src/img/redsea/RSRUN/reefrun_skimmer_off.png" width="100%"/><br/><b>Gestoppt</b><br/>Leerer Becher, ausgegraut, keine Blasen</td>
  </tr>
</table>

Ein getrennter Abschäumer sieht genauso aus wie ein gestoppter: nur das
blinkende Kabel unterscheidet sie. Dieses Blinken bedeutet, dass der ReefRun
`missing_pump` meldet, die Pumpe ist also konfiguriert, aber der Controller
sieht sie nicht mehr. Prüfe den Stecker, bevor du weiter suchst.

Der Zustand „voller Becher" wird vom Skim-Sensor in der Sammelkammer gemeldet.
Der Körper wechselt auf seine eigene Darstellung und die Schaumanimation
schrumpft auf ein schmales Band unter dem Deckel — unabhängig davon, ob die
Selbstnivellierung aktiv ist. Das blinkende Warnsymbol neben dem Schalter für
den vollen Becher erscheint nur, wenn `sensor_controlled` eingeschaltet ist,
denn bei deaktiviertem Sensor unternimmt der Controller nichts.

### Eine Pumpe hinzufügen

Ein Anschluss ohne konfigurierte Pumpe zeigt statt eines Pumpenkörpers einen
**Hinzufügen**-Platzhalter:

<img src="../../src/img/redsea/RSRUN/add_pump.png" width="20%"/>

Ein Klick öffnet den Konfigurationsdialog, in dem **Erkennen und hinzufügen** den
Controller fragt, was angeschlossen ist, und es in einem Schritt registriert. Das
erkannte Modell ist nur ein Vorschlag und liegt gelegentlich daneben, deshalb
bleibt die Modellliste danach änderbar: für einen DC Skimmer wählst du rsk-300,
rsk-600 oder rsk-900. Der Pumpenname lässt sich im selben Dialog bearbeiten.

Der Platzhalter steht auf jedem nicht konfigurierten Anschluss, er erscheint also
auch dort, wo du nie eine Pumpe anschließen willst. Wer nur eine Pumpe betreibt,
kann ihn im Karteneditor vollständig ausblenden.

<img src="../img/rsrun/editor.png"/>

### Tagesprogramm

<img src="../img/rsrun/schedule.png"/>

Die blaue Kurve ist die programmierte Drehzahl über 24 Stunden. Die senkrechte
rote Linie markiert die aktuelle Uhrzeit, der Punkt darauf die vom Programm
geforderte Drehzahl.

Folgt die Pumpe ihrem Programm nicht — Fütterungsmodus, Erkennung eines vollen
Bechers, Überschäumschutz — wandert der Punkt auf die **tatsächliche** Drehzahl
und ein rotes Segment stellt die Abweichung dar, mit dem Zahlenwert daneben:

<img src="../img/rsrun/schedule_deviation.png"/>

Ein Klick auf das Diagramm öffnet den Programmeditor: Punkte hinzufügen oder entfernen, Zeiten und Drehzahlen ändern, einen Punkt am Gerät vorab testen und speichern.

<img src="../img/rsrun/schedule_editor.png"/>

## Meldungen

<img src="../img/rsrun/zone_6.png"/>

---

Dieser Bereich zeigt die letzten Systemmeldungen des ReefRun. Er hat zwei Zeilen:

- Die graue Zeile zeigt die **letzte empfangene Meldung**.
- Die rosa Zeile zeigt die **letzte Warnung**, eingeleitet vom Symbol ⚠.

Ein Klick auf das Symbol <img src="../img/mdi/mdi_delete-empty.png" width="20"/> löscht die jeweilige Meldung.

Diese Zeilen lassen sich über den Karteneditor ausblenden.

<img src="../img/rsrun/editor_2.png" />

# ReefWave

Geplant.

Möchten Sie, dass es schneller unterstützt wird? Stimmen Sie [hier](https://github.com/Elwinmage/ha-reef-card/discussions/22) ab.

# Wartung

Die Wartungsansicht von ha-reef-card in Aktion:

[![Watch the video](https://img.youtube.com/vi/VIDEO_ID/0.jpg)](https://www.youtube.com/watch?v=VIDEO_ID)

<img src="../img/maintenance/overview.png"/>

Über die gerätebezogenen Ansichten hinaus bietet die Karte eine
**Wartungsansicht**, die alle von `ha-reefbeat-component` bereitgestellten
Wartungsaufgaben zusammenfasst, als wäre das gesamte Wartungssystem ein einziges
Gerät.

Jede Aufgabe erscheint als Fortschrittsbalken, der zeigt, welcher Teil ihres
Intervalls verstrichen ist, mit einer Farbe je nach Restzeit:

| Farbe  | Bedeutung                                                    |
| ------ | ------------------------------------------------------------ |
| Grün   | Aktuell                                                      |
| Orange | Bald fällig (letzte 20 % des Intervalls, mindestens ein Tag) |
| Rot    | Überfällig, die Beschriftung wechselt zu `+X d`              |
| Grau   | Nie ausgeführt (kein Zurücksetzen erfasst)                   |

Aufgaben lassen sich **nach Gerät** (gruppiert, mit einer Überschrift je Gerät)
oder **nach Fälligkeit** (flache Liste, die dringendste zuerst) sortieren. Nie
ausgeführte Aufgaben stehen immer am Ende. In der Werkzeugleiste gibt es zwei
Filter: ein Kontrollkästchen, das noch aktuelle Aufgaben ausblendet, und eine
Schaltfläche **Stumme ausblenden / Stumme anzeigen**, die Aufgaben mit
ausgeschaltetem Benachrichtigungsschalter ausblendet. Die Schaltfläche startet in
der Stellung „anzeigen“, sodass das Stummschalten einer Meldung nie von selbst
eine Frist verschwinden lässt. Dieser Standardwert ist im Karteneditor (oder über
`hide_muted` weiter unten) einstellbar, und die Schaltfläche hat jederzeit
Vorrang.

Ein Klick auf eine Zeile öffnet den more-info-Dialog von Home Assistant für die
Aufgabe; die runde Schaltfläche rechts hakt sie ab (sie drückt die
zugrundeliegende Button-Entität, genau wie es der more-info-Dialog täte).

Die Ansicht erscheint nur dann in der Geräteauswahl, wenn in deiner Installation
mindestens eine Wartungsaufgabe existiert. Neue Aufgaben im Katalog der
Integration tauchen automatisch auf, ohne Aktualisierung der Karte.

### Benachrichtigungen

Jede Aufgabe erhält zusätzlich einen **Benachrichtigungsschalter** in der
Integration (`switch.*_notify`, angezeigt als „<Aufgabenname>
(Benachrichtigungen)“). Ihn auszuschalten macht die Überfälligkeitsmeldung genau
dieser Aufgabe stumm, ohne ihren Zeitplan zu ändern: der Fortschrittsbalken läuft
weiter, die Zeile wird nur blasser und die Glocke erlischt.

Die Glocke rechts in jeder Zeile schaltet diesen Schalter direkt um. Sie wird nur
angezeigt, wenn die Integration den Schalter bereitstellt. Mit
`show_notify: false` blendest du die Glocken aus.

Das Alarm-Blueprint liest exakt dieselbe Einstellung: eine in der Karte
stummgeschaltete Aufgabe schweigt also auch in der Automatisierung.

### Intervall ändern

Die Kalenderschaltfläche jeder Zeile klappt einen Schieberegler aus, der in die
Zahlen-Entität des Aufgabenintervalls schreibt. Der Regler arbeitet in der
Einheit, die die Integration für diese Aufgabe angibt (Tage, Wochen oder Monate,
aus der Rolle der Entität gelesen), und die Integration rechnet vor dem Speichern
wieder in Tage um. Die Grenzen stammen aus der Entität selbst, sodass die Karte
nie einen Wert außerhalb des Bereichs schreiben kann. Es bleibt immer nur ein
Editor geöffnet. Mit `show_interval: false` blendest du die Schaltflächen aus.

### ReefRun-Pumpen

ReefRun-Untergeräte heißen „… Pumpe 1“ / „… Pumpe 2“, was nichts darüber aussagt,
was die jeweilige Pumpe wirklich ist. Stellt das Gerät sowohl einen `type`- als
auch einen `model`-Sensor bereit, ergänzt die Karte beides in Klammern:
**ReefRun Pumpe 1 (Rückförderung 12000)**, **ReefRun Pumpe 2 (Abschäumer 900)**.

Der Typ wird übersetzt, vom Modell bleibt nur die abschließende Zahl
(`return-12000` -> `12000`, `rsk-900` -> `900`), da das Präfix entweder den Typ
wiederholt oder kryptisch ist. Geräte, die keine Pumpen sind, behalten einen
schlichten Namen.

## Symbole

| Symbol                                                                                                   | Rolle                                                                             |
| -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| <img src="../img/mdi/mdi_check.png" width="20"/>                                                         | **Aufgabe erledigt.** Hakt die Aufgabe ab und startet ihren Countdown neu.        |
| <img src="../img/mdi/mdi_bell-ring.png" width="20"/> <img src="../img/mdi/mdi_bell-off.png" width="20"/> | **Stumm / laut.** Schaltet den Benachrichtigungsschalter genau dieser Aufgabe um. |
| <img src="../img/mdi/mdi_calendar-edit.png" width="20"/>                                                 | **Intervall ändern.** Klappt einen Schieberegler für das Aufgabenintervall aus.   |

## Editor

Der Standardzustand der Filter und die Sichtbarkeit der drei Schaltflächen werden im Karteneditor festgelegt.

<img src="../img/maintenance/editor.png"/>

## Konfiguration

```yaml
type: custom:reef-card
device: __maintenance__
maintenance:
  sort: due # "device" (Standard) oder "due"
  hide_ok: false # Aufgaben ausblenden, die weder überfällig noch bald fällig sind
  hide_muted: false # Aufgaben mit ausgeschalteten Benachrichtigungen ausblenden
  warning_ratio: 0.2 # Anteil des Intervalls, der orange dargestellt wird
  show_reset: true # Schaltfläche "als erledigt markieren" in jeder Zeile anzeigen
  show_notify: true # Glocke zum Stummschalten/Aktivieren in jeder Zeile anzeigen
  show_interval: true # Schaltfläche zur Intervallbearbeitung in jeder Zeile anzeigen
```

Alle `maintenance`-Schlüssel sind optional. `sort` und `hide_ok` legen nur den
Anfangszustand fest: der Nutzer kann sie in der Ansicht selbst ändern.

# FAQ

---

[buymecoffee]: https://paypal.me/Elwinmage
[buymecoffeebadge]: https://img.shields.io/badge/buy%20me%20a%20coffee-donate-yellow.svg?style=flat-square
