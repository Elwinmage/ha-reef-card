[← Zurück zur Hauptseite](README.de.md)

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

<img src="../img/rsdose/rsdose4_ex1.png"/>

## Konfiguration/WLAN-Informationen

<img src="../img/rsdose/zone_1.png"/>

---

<span >Klicken Sie auf das Symbol <img src="../img/rsdose/cog_icon.png" width="30" />, um die allgemeine Konfiguration des ReefDose zu verwalten.</span>

<img src="../img/rsdose/zone_1_dialog_config.png"/>

<span>Klicken Sie auf das Symbol <img width="30px" src="../img/rsdose/wifi_icon.png"/> um die Netzwerkeinstellungen zu verwalten.</span>

<img src="../img/rsdose/zone_1_dialog_wifi.png"/>

## Zustände

 <img src="../img/rsdose/zone_2.png"/>

---

<span>Der Wartungsschalter <img width="30px" src="../img/rsdose/zone_2_maintenance.png"/> ermöglicht den Wechsel in den Wartungsmodus.</span>

 <img  src="../img/rsdose/maintenance_view.png"/>

<span>Der Ein/Aus-Schalter <img width="30px" src="../img/rsdose/zone_2_off.png"/> ermöglicht das Umschalten zwischen den Ein- und Aus-Zuständen des ReefDose.</span>

 <img  src="../img/rsdose/off_view.png"/>

## Manuelle Dosierung

<img src="../img/rsdose/zone_3.png"/>

---

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

---

Dieser Bereich ermöglicht die Anzeige der aktuellen Kopfprogrammierung und deren Änderung.

- Der farbige Kreisring zeigt den prozentualen Anteil der bereits verabreichten Tagesdosis an.
- Die gelbe Zahl oben zeigt den kumulierten täglichen Manualdosis-Gesamtwert an.
- Der mittlere Teil zeigt das verteilte Volumen im Verhältnis zum insgesamt geplanten Tagesvolumen an.
- Der blaue untere Teil zeigt die Anzahl der verabreichten Dosen im Verhältnis zur Gesamtzahl der Tagesdosen an (Beispiel: 14/24 für Blau, da es eine stündliche Programmierung ist und dieser Screenshot um 14:15 Uhr aufgenommen wurde). Die Werte für Violett und Grün zeigen 0/0, da diese Dosen um 8 Uhr verteilt werden sollten, die Integration aber nach 8 Uhr gestartet wurde, sodass heute keine Dosen erfolgen werden.
- Ein langer Klick auf einen der 4 Köpfe schaltet diesen ein oder aus.
- Ein Klick auf einen Kopf öffnet das Programmierungsfenster.
  Von diesem Fenster aus können Sie eine Befüllung starten, den Kopf kalibrieren, die Tagesdosis und deren Planung ändern. Vergessen Sie nicht, die Programmierung zu speichern, bevor Sie das Fenster schließen.

  <img src="../img/rsdose/zone_4_dialog_schedule.png"/>

### Dosierregelung

Die Kopfkonfiguration enthält die **Dosierregelung** der [redsea-Integration](https://github.com/Elwinmage/ha-reefbeat-component/blob/main/doc/de/reefdose.de.md#dosierregelung):

- **Assistierte Dosierung**: Die Schaltfläche **Assistierte Dosierung** öffnet einen Dialog mit dem Diagramm Ihrer Testergebnisse, der Eingabe eines neuen Ergebnisses, der vorgeschlagenen Dosis zum Übernehmen oder Verwerfen und den Einstellungen der Berechnung. Nichts erreicht den Dosierer, bevor Sie es übernehmen.

  <img src="../img/rsdose/assisted_dose_dialog.png" width="300"/> <img src="../img/rsdose/assisted_dose_settings.png" width="300"/>

  Das Fenster zeigt die aktuelle Dosis (nur lesbar) direkt über der vorgeschlagenen. Ein Testergebnis wird von Hand eingegeben oder an der Spritze eines Testkits abgelesen: Kit wählen (Red Sea, Salifert, Colombo…) und die Reagenz-Ablesung in mL eingeben, das Ergebnis wird berechnet. Die Schaltfläche **Testergebnisse** listet die Ergebnisse, um eines mit einem früheren Datum hinzuzufügen, zu korrigieren oder zu löschen; das Diagramm folgt sofort. Ein Zusatz, den kein Test steuert (Red Sea NO3:PO4-X, Futter), bietet keine assistierte Dosierung, seine Wirksamkeit ist ausgegraut. Eine angewendete Dosis erscheint im Programm des Kopfes, wenn man dorthin zurückkehrt.

- **Salzlösung**: Der Kopf wird allein von Home Assistant mit manuellen Dosen gesteuert, daher zeigt seine Konfiguration statt des Programms die Salzlösung: Salinität der letzten Woche, Zustand und Alarm, geplante Salzlösung, Refraktometerprüfung und Einstellungen. In der Hauptansicht zeigen Ring und mittlere Beschriftung die heute dosierte gegenüber der geplanten Salzlösung, die untere Beschriftung die Salinität.

  <img src="../img/rsdose/brine_head.png" width="300"/> <img src="../img/rsdose/brine_status.png" width="300"/> <img src="../img/rsdose/brine_settings.png" width="300"/>

### Dosierverlauf

Solange der Dosierer im [Poseidon-Modus](https://github.com/Elwinmage/ha-reefbeat-component/blob/main/doc/de/poseidon.de.md#poseidon-modus) ist, hat die Kopfkonfiguration eine Schaltfläche **Dosierverlauf**: die Dosen des Kopfes, neueste zuerst, nach Tagen, mit Beginn, Ende, Dauer, Menge und Art (geplant, manuell, Kompensation). Letzte 24 h, 7 oder 31 Tage oder alles Gespeicherte, mit der Gesamtmenge des Zeitraums. Ein mit „≈“ markierter Beginn ist aus dem Durchfluss des Kopfes geschätzt.

## Verwaltung der Ergänzungsmittel

 <img src="../img/rsdose/zone_5.png"/>

---

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

Hier ist die Liste der unterstützten Bilder für Ergänzungsmittel, nach Marke gruppiert. Wenn Ihres ein ❌ anzeigt, können Sie dessen Hinzufügung [hier](https://github.com/Elwinmage/reeftech-catalog/issues/new?labels=supplement) beantragen.

<details>
<summary><b>ATI &nbsp; <sup>2/2 🖼️</sup></b></summary>

<table>
<tr><td>✅</td><td>Essential Pro 1</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/ati-essential-pro-1/image.webp'/></td></tr>
<tr><td>✅</td><td>Essential Pro 2</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/ati-essential-pro-2/image.webp'/></td></tr>
</table>
</details>

<details>
<summary><b>Aqua Forest &nbsp; <sup>3/9 🖼️</sup></b></summary>

<table>
<tr><td>✅</td><td>Ca Plus</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/aqua-forest-ca-plus/image.webp'/></td></tr>
<tr><td>❌</td><td colspan='2'>Calcium </td></tr>
<tr><td>❌</td><td colspan='2'>Component 1+</td></tr>
<tr><td>❌</td><td colspan='2'>Component 2+</td></tr>
<tr><td>❌</td><td colspan='2'>Component 3+</td></tr>
<tr><td>❌</td><td colspan='2'>KH Buffer</td></tr>
<tr><td>✅</td><td>KH Plus</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/aqua-forest-kh-plus/image.webp'/></td></tr>
<tr><td>❌</td><td colspan='2'>Magnesium</td></tr>
<tr><td>✅</td><td>Mg Plus</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/aqua-forest-mg-plus/image.webp'/></td></tr>
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
<summary><b>DIY &nbsp; <sup>1/1 🖼️</sup></b></summary>

<table>
<tr><td>✅</td><td>Brine</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/diy-brine/image.webp'/></td></tr>
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
<tr><td>✅</td><td>Aragonite A</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/quantum-aragonite-a/image.webp'/></td></tr>
<tr><td>✅</td><td>Aragonite B</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/quantum-aragonite-b/image.webp'/></td></tr>
<tr><td>✅</td><td>Aragonite C</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/quantum-aragonite-c/image.webp'/></td></tr>
<tr><td>✅</td><td>Bio Kalium</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/quantum-bio-kalium/image.webp'/></td></tr>
<tr><td>✅</td><td>Bio Metals</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/quantum-bio-metals/image.webp'/></td></tr>
<tr><td>✅</td><td>Bio enhance</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/quantum-bio-enhance/image.webp'/></td></tr>
<tr><td>✅</td><td>Gbio Gen</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/quantum-gbio-gen/image.webp'/></td></tr>
</table>
</details>

<details>
<summary><b>Red Sea &nbsp; <sup>14/17 🖼️</sup></b></summary>

<table>
<tr><td>✅</td><td>Bio Active (Colors D)</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/red-sea-bio-active-colors-d/image.webp'/></td></tr>
<tr><td>✅</td><td>Calcium (Foundation A)</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/red-sea-calcium-foundation-a/image.webp'/></td></tr>
<tr><td>❌</td><td colspan='2'>Calcium (Powder)</td></tr>
<tr><td>✅</td><td>Iodine (Colors A)</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/red-sea-iodine-colors-a/image.webp'/></td></tr>
<tr><td>✅</td><td>Iron (Colors C)</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/red-sea-iron-colors-c/image.webp'/></td></tr>
<tr><td>✅</td><td>KH/Alkalinity (Foundation B)</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/red-sea-kh-alkalinity-foundation-b/image.webp'/></td></tr>
<tr><td>❌</td><td colspan='2'>KH/Alkalinity (Powder)</td></tr>
<tr><td>✅</td><td>Magnesium (Foundation C)</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/red-sea-magnesium-foundation-c/image.webp'/></td></tr>
<tr><td>❌</td><td colspan='2'>Magnesium (Powder)</td></tr>
<tr><td>✅</td><td>NO3PO4-X</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/red-sea-no3po4-x/image.webp'/></td></tr>
<tr><td>✅</td><td>Potassium (Colors B)</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/red-sea-potassium-colors-b/image.webp'/></td></tr>
<tr><td>✅</td><td>Reef Energy Plus</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/red-sea-reef-energy-plus/image.webp'/></td></tr>
<tr><td>✅</td><td>ReefCare Part 1: Calcium & Magnesium</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/red-sea-reefcare-part-1-calcium-magnesium/image.webp'/></td></tr>
<tr><td>✅</td><td>ReefCare Part 2: KH/Alkalinity &PH stabilizer</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/red-sea-reefcare-part-2-kh-alkalinity-ph-stabilizer/image.webp'/></td></tr>
<tr><td>✅</td><td>ReefCare Part 3: Iodine & Potassium</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/red-sea-reefcare-part-3-iodine-potassium/image.webp'/></td></tr>
<tr><td>✅</td><td>ReefCare Part 4: Iron & Bioactive elements</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/red-sea-reefcare-part-4-iron-bioactive-elements/image.webp'/></td></tr>
<tr><td>✅</td><td>ReefCare Program</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/red-sea-reefcare-program/image.webp'/></td></tr>
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
<tr><td>✅</td><td>All-For-Reef</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/tropic-marin-all-for-reef/image.webp'/></td></tr>
<tr><td>✅</td><td>Amino Organic</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/tropic-marin-amino-organic/image.webp'/></td></tr>
<tr><td>❌</td><td colspan='2'>Balling A</td></tr>
<tr><td>❌</td><td colspan='2'>Balling B</td></tr>
<tr><td>❌</td><td colspan='2'>Balling C</td></tr>
<tr><td>✅</td><td>Bio-Magnesium</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/tropic-marin-bio-magnesium/image.webp'/></td></tr>
<tr><td>✅</td><td>Carbo Calcium</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/tropic-marin-carbo-calcium/image.webp'/></td></tr>
<tr><td>❌</td><td colspan='2'>Elimi-NP</td></tr>
<tr><td>❌</td><td colspan='2'>K Element</td></tr>
<tr><td>❌</td><td colspan='2'>Liquid Buffer</td></tr>
<tr><td>✅</td><td>NP-Bacto-Balance</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/tropic-marin-np-bacto-balance/image.webp'/></td></tr>
<tr><td>❌</td><td colspan='2'>Plus-NP</td></tr>
<tr><td>✅</td><td>Potassium</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/tropic-marin-potassium/image.webp'/></td></tr>
</table>
</details>

<!-- supplements:end -->

---

[← Zurück zur Hauptseite](README.de.md)
