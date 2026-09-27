[← Zurück zur Hauptseite](README.de.md)

# ReefControl

ReefControl und ReefControl-Power mit ha-reef-card in Aktion:

[![Video ansehen](https://img.youtube.com/vi/VIDEO_ID/0.jpg)](https://www.youtube.com/watch?v=VIDEO_ID)

Die ReefControl-Karte zeichnet den Hub so, wie er verkabelt ist: die
ReefSense-Sonden an ihren Erweiterungsboxen, die 12V-Ports, die ATO-Pumpe, wenn
ein Port eine steuert, und das gekoppelte [ReefControl-Power](reefcontrol-power.de.md#reefcontrol-power)
darüber.

Beide Modelle werden unterstützt. Der Pro nimmt bis zu 7 Sonden auf (eine zweite
Erweiterungsbox wird gezeichnet, sobald eine fünfte Sonde eingesteckt ist) und
hat zwei 12V-Ports; der Lite nimmt 2 Sonden auf und hat einen einzigen 12V-Port.

<table>
  <tr>
    <th align="center">RSCONTROLPRO</th>
    <th align="center">RSCONTROLLITE</th>
  </tr>
  <tr>
    <td align="center"><img src="../img/rscontrol/rscontrolpro.png"/></td>
    <td align="center"><img src="../img/rscontrol/rscontrollite.png"/></td>
  </tr>
</table>

Der Rest dieses Abschnitts ist mit dem Pro bebildert: Auf dem Lite funktioniert
alles genauso.

<img src="../img/rscontrol/rscontrol_zones.png"/>

Die Karte ist in 7 Bereiche unterteilt:

1. Controller: Stromversorgung, Wartungsmodus, Konfiguration, WLAN und Summer
2. Gekoppeltes Power Center (ReefControl-Power)
3. Übersicht der Messwerte
4. Sonden
5. 12V-Ports
6. ATO
7. Letzte Meldung und letzter Alarm

## Controller

<img src="../img/rscontrol/zone_1.png"/>

---

Der Text auf der Front des Hubs ist der vom Gerät gemeldete **Betriebsmodus**
(Auto, Setup, Wartung…), übersetzt in die Sprache von Home Assistant.

<span>Der Schalter <img src="../img/mdi/mdi_power-plug.png" width="20"/> schaltet den ReefControl ein oder aus.</span>

<img src="../img/rscontrol/off_mode.png" width="50%"/>

Ausgeschaltet misst und steuert der Hub nichts mehr: Die Karte behält nur seinen
Ein/Aus-Schalter und die Bilder der Hardware. Die Sonden verlieren ihre Werte,
Balken und Einstellungen, und Summer, Übersicht, 12V-Ports und
Konfigurationssymbole werden ausgeblendet.

<span>Der Schalter <img src="../img/mdi/mdi_account-wrench.png" width="20"/> wechselt in den Wartungsmodus.</span>

<img src="../img/rscontrol/maintenance.png" width="50%"/>

<span>Ein Klick auf das Symbol <img src="../img/rsdose/cog_icon.png" width="30"/> öffnet die allgemeine Konfiguration des ReefControl: Einstellungen oder abgefragte Daten aktualisieren, das Gerät zurücksetzen, seine Firmware aktualisieren, die [Temperatur-Fusion](https://github.com/Elwinmage/ha-reefbeat-component/blob/main/doc/de/reefcontrol.de.md#temperatur-fusion-mehrerer-sonden) einstellen, den Netzwerk- und Kabelzustand sehen und die Kopplung mit einem ReefControl-Power verwalten.</span>

<img src="../img/rscontrol/zone_1_dialog_config.png" width="50%"/>

<span>Ein Klick auf das Symbol <img src="../img/mdi/wifi_icon.png" width="30"/> öffnet die Netzwerkeinstellungen.</span>

<img src="../img/rscontrol/zone_1_dialog_wifi.png" width="50%"/>

### Summer

<span>Die Glocke <img src="../img/mdi/mdi_bell-alert.png" width="20"/> sitzt auf der Status-LED des Hubs. Sie ist grün, solange der Summer still ist, rot und blinkend, wenn er ertönt, und bleibt rot, sobald der Alarm quittiert wurde.</span>

Ein Klick öffnet den Summer-Dialog: was er gerade tut und warum, dann seine
beiden Alarme — den **Gefahren**alarm (ein Messwert außerhalb seines Bereichs)
und den **Leck**alarm —, jeweils mit Schalter, Frequenz und Tastverhältnis, die
Entprellung der Gefahr und den Leckdetektor.

<img src="../img/rscontrol/zone_1_dialog_buzzer.png" width="50%"/>

## Gekoppeltes Power Center

<img src="../img/rscontrol/zone_2.png"/>

---

Ist ein ReefControl-Power mit dem Hub gekoppelt, wird es darüber gezeichnet, mit
6 oder 8 Steckdosen je nach Modell, über sein Kabel mit dem Hub verbunden. Eine
eingeschaltete Steckdose leuchtet mit einer leichten roten Maske.

Ein Klick auf das Power Center öffnet seine eigene Karte (siehe
[ReefControl-Power](reefcontrol-power.de.md#reefcontrol-power)).

Ist das Power Center gekoppelt, aber nicht erreichbar, blinkt es unter einer
leichten roten Tönung. Kopplung und Entkopplung erfolgen im
Konfigurationsdialog des Controllers.

## Übersicht

<img src="../img/rscontrol/zone_3.png"/>

---

Die Leiste zwischen Power Center und Sonden fasst alle Messwerte des Hubs
zusammen, von links nach rechts:

- Ein Alarm <img src="../img/mdi/mdi_alert.png" width="20"/>, nur wenn etwas nicht stimmt: orange, wenn der schlechteste Messwert akzeptabel ist, rot, wenn einer in Gefahr ist. Die eingebauten Temperaturen zählen mit.
- Die **Temperatur**: der fusionierte Wert, wenn der Hub mehrere Temperaturquellen hat, sonst der der Temperatursonde, sonst die erste eingebaute Temperatur.
- <span>Ein Thermometer <img src="../img/mdi/mdi_thermometer-alert.png" width="20"/>, nur wenn der Hub eine seiner Temperaturquellen verdächtigt; sein Tooltip nennt die betroffene Sonde.</span>
- pH, ORP und Salinität, ein Eintrag pro Sonde.
- <span>Ein Tropfen <img src="../img/mdi/mdi_water-alert.png" width="20"/> pro Lecksonde, rot, wenn sie nass ist.</span>
- <span>Wellen <img src="../img/mdi/mdi_waves.png" width="20"/> pro ATO-Sonde, grün auf einem erwünschten Pegel, orange darunter oder darüber.</span>

Jeder Messwert nimmt die Farbe seiner Stufe an: grün für erwünscht, orange für
akzeptabel, rot für Gefahr, weiß, wenn die Sonde keinen gültigen Messwert
liefert. Ein Klick auf einen Messwert öffnet seinen Info-Dialog.

## Sonden

<img src="../img/rscontrol/zone_4.png"/>

---

Jede Sonde des Hubs hängt an einer Erweiterungsbox, in der Reihenfolge, in der
der Hub sie auflistet. Jede zeigt:

- Ihren **Messwert** und direkt darunter die **eingebaute Temperatur** bei den
  pH-, Salinitäts- und ATO-Sonden, eingefärbt nach ihrer Stufe. Ein Klick auf
  einen Wert öffnet seinen Info-Dialog.
- Einen **Lagebalken** pro Messwert: Die roten, orangen und grünen Bänder sind
  die an der Sonde eingestellten Gefahren-, akzeptablen und erwünschten Bereiche,
  und die schwarze Markierung zeigt, wo der Messwert liegt. Der Hauptmesswert
  steht auf dem linken Balken, die Temperatur auf dem rechten. Ein Klick auf
  einen Balken öffnet die letzten 24 Stunden des Messwerts über seinen Bändern.

<img src="../img/rscontrol/zone_4_history.png" width="50%"/>

- <span>Ein Zahnrad <img src="../img/rsdose/cog_icon.png" width="30"/>, das die Einstellungen der Sonde öffnet.</span>

Eine ausgesteckte Sonde blinkt unter einer leichten roten Tönung und liefert
keinen Messwert.

### Sondeneinstellungen

<img src="../img/rscontrol/zone_4_dialog_probe.png" width="50%"/>

Der Dialog fasst alles zu einer Sonde zusammen: ihre Messwerte, ihren Status,
ihren erwünschten und akzeptablen Bereich (und die ihrer eingebauten
Temperatur), die Anzeigeeinheit einer Salinitätssonde und ihre Schalter —
aktiviert, Summer, Benachrichtigungen und Wartung, die die Sonde während der
Reinigung oder Kalibrierung aus der Temperatur-Fusion heraushält.

Bei einer Salinitätssonde sind die angezeigten Grenzen die der gewählten Anzeigeeinheit: Wechseln Sie die Einheit, zeigt der Dialog sofort deren Grenzen.

Die Schaltfläche **Wert lesen** fordert einen frischen Messwert vom Hub an,
statt auf die nächste Abfrage zu warten; die Werte des Dialogs aktualisieren
sich an Ort und Stelle.

Die Kalibrierschaltflächen unten zeigen nur die Kalibrierungen des Sondentyps,
und keine, solange die Sonde ausgesteckt ist. Jede Kalibrierung öffnet ihren
eigenen Dialog, unten pro Sondentyp beschrieben.

### Sondentypen

#### pH

<img src="../../src/img/redsea/RSSENSE/rssense-ph-temperature.png" width="10%"/> <img src="../../src/img/redsea/RSSENSE/rssense-ph.png" width="10%"/>

Der pH-Wert und die Temperatur, wenn die Sonde eine hat — eine pH-Sonde ohne
Temperatur hat ein eigenes Bild mit einem einzigen Balken.

Die Kalibrierung erfolgt an zwei Punkten, wie in der ReefBeat-App: zuerst pH 7,
dann pH 10 für Salzwasser oder pH 4 für Süßwasser, jede Lösung mit der
Temperatur angegeben, für die sie gilt. Nach jedem Punkt wartet der Hub, bis sich
der Messwert stabilisiert: Der Dialog zeigt die Stabilität und die Restzeit, und
der nächste Schritt wird erst freigegeben, wenn der Hub fertig ist. Das Schließen
des Dialogs bricht die Kalibrierung ab.

<img src="../img/rscontrol/zone_4_calibration_ph.png" width="50%"/>

#### Salinität

<img src="../../src/img/redsea/RSSENSE/rssense-salinity-temperature.png" width="10%"/>

Die Salinität, in der in den Sondeneinstellungen gewählten Einheit, und die
Temperatur.

Die Kalibrierung erfolgt an einem einzigen Punkt: Sonde in die Lösung tauchen
und ihren Wert in mS/cm eingeben (zwischen 20 und 99).

<img src="../img/rscontrol/zone_4_calibration_ec.png" width="50%"/>

#### ORP

<img src="../../src/img/redsea/RSSENSE/rssense-orp.png" width="10%"/>

Das ORP in mV. Zum Kalibrieren die Sonde in die Referenzlösung tauchen und den
Wert der Lösung eingeben: Die Sonde zeigt danach diesen Wert.

<img src="../img/rscontrol/zone_4_calibration_orp.png" width="50%"/>

#### Temperatur

<img src="../../src/img/redsea/RSSENSE/temperature.png" width="10%"/>

Die Temperatur, auf einem einzigen Balken. Zum Kalibrieren die Sonde in Wasser
stellen, dessen Temperatur Sie mit einem Referenzthermometer gemessen haben,
warten, bis sich der Messwert stabilisiert, und die tatsächliche Temperatur
eingeben.

Die eingebaute Temperatur der pH-, Salinitäts- und ATO-Sonden wird auf dieselbe
Weise kalibriert, über ihre eigene Schaltfläche **Temperatur kalibrieren**.

<img src="../img/rscontrol/zone_4_calibration_temperature.png" width="50%"/>

#### ATO

<img src="../../src/img/redsea/RSSENSE/rssense-ato.png" width="10%"/>

Die Pegelsonde wird im Wasser des Technikbeckens gezeichnet, an der Markierung,
die die Sonde meldet, wie beim [ReefATO+](reefato.de.md#aquarium). Ihre Temperatur wird auf
dem schwarzen Gehäuse angezeigt, direkt unter dem Stecker.

| Zustand             | Bedeutung                                                      |
| ------------------- | -------------------------------------------------------------- |
| Darunter            | Die Oberfläche liegt unter der Sonde: das ATO kommt nicht nach |
| Erwünschter Pegel 1 | Erste Nachfüllmarke                                            |
| Erwünschter Pegel 2 | Zweite Nachfüllmarke                                           |
| Darüber             | Die Oberfläche liegt über der Sonde: das Becken ist überfüllt  |

**Darunter** und **Darüber** lassen das Wasser blinken. Eine Sonde im Fehler hat
gar keine Wasserlinie.

#### Leck

<img src="../../src/img/redsea/RSSENSE/rssense-leak.png" width="10%"/>

Wird Wasser erkannt, breitet sich eine Pfütze am Fuß der Sonde aus, und ein
blinkendes Symbol zeigt, woher das Wasser kommt, wie die Sonde es meldet:

<table>
  <tr>
    <th align="center">Leck mit Aquariumwasser <img src="../img/mdi/mdi_fish.png" width="20"/></th>
    <th align="center">Leck mit Osmosewasser <img src="../img/mdi/mdi_cup-water.png" width="20"/></th>
  </tr>
  <tr>
    <td align="center"><img src="../img/rscontrol/zone_4_leak_aquarium.png"/></td>
    <td align="center"><img src="../img/rscontrol/zone_4_leak_rodi.png"/></td>
  </tr>
</table>

Eine Lecksonde, deren Erkennung ausgeschaltet ist, wird ausgegraut: Sie ist da,
sie erkennt nichts.

> [!NOTE]
> Sonden werden über das Optionsmenü der Integration hinzugefügt, ersetzt und
> entfernt (siehe [ha-reefbeat-component](https://github.com/Elwinmage/ha-reefbeat-component/blob/main/doc/de/reefcontrol.de.md#sondenverwaltung-hinzufügen--ersetzen--entfernen)):
> Die Karte folgt von selbst.

## 12V-Ports

<img src="../img/rscontrol/zone_5.png"/>

---

Jeder 12V-Port des Hubs hat sein Zahnrad auf seinem Stecker und seinen Verbrauch
darüber (ein Klick öffnet seinen Info-Dialog). Ein eingeschalteter Port lässt
seinen Stecker leuchten. Der Pro hat zwei Ports, wobei das Zahnrad des zweiten
anders gezeichnet ist; der Lite hat einen.

<span>Ein Klick auf das Zahnrad <img src="../img/mdi/cog-1.png" width="5%"/> öffnet die Port-Einstellungen: Name, Schalter, Zustand, Typ und Verbrauch, dann den Modus-Editor.</span>

<img src="../img/rscontrol/zone_5_dialog_port.png" width="50%"/>

Ein Port wird wie eine [Steckdose des Power Centers](reefcontrol-power.de.md#steckdose) gesteuert, mit
denselben vier Modi — **Ein**, **Aus**, **Zeitplan** und **Sensor** — plus der
**Leistung**, die er im eingeschalteten Zustand liefert, in %. Nichts wird an den
Hub gesendet, bevor **Speichern** gedrückt wird. Ein nie installierter Port wird
beim Speichern installiert, wie es die ReefBeat-App tut.

<span>Das Papierkorbsymbol <img src="../img/mdi/mdi_delete-empty.png" width="20"/> oben rechts deinstalliert den Port nach einer Bestätigung: Er kehrt in den Werkszustand zurück und verliert Name, Zeitplan und Sondenregel.</span>

<img src="../img/rscontrol/zone_5_dialog_delete.png" width="50%"/>

## ATO

<img src="../img/rscontrol/zone_6.png"/>

---

Steuert ein 12V-Port eine ATO-Pumpe — das Red Sea ATO-Kit oder jede Pumpe, die
einer ATO-Sonde folgt —, wird die Pumpe in ihrem Vorratsbehälter gezeichnet, mit
ihrem Port verbunden. Solange der Port eingeschaltet ist, fließt Wasser aus dem
Auslauf über dem Technikbecken.

## Meldungen

<img src="../img/rscontrol/zone_7.png"/>

---

Diese Zone zeigt die letzten Systemmeldungen des ReefControl. Sie hat zwei Zeilen:

- Die graue Zeile zeigt die **letzte Meldung**.
- Die rosa Zeile zeigt den **letzten Alarm**, dem das Symbol ⚠ vorangeht.

Ein Klick auf das Symbol <img src="../img/mdi/mdi_delete-empty.png" width="20"/> löscht die zugehörige Meldung.

Diese Zeilen lassen sich über den Karteneditor ausblenden.

## Karteneditor

<img src="../img/rscontrol/editor.png" width="50%"/>

---

Neben den beiden Meldungszeilen hat der ReefControl zwei Optionen:

- **Kompakte Sonden**: Jeder Messwert wird als Punkt in der Farbe seiner Stufe
  statt als Lagebalken angezeigt. Ein Zeichen auf dem Punkt zeigt, auf welcher
  Seite des erwünschten Bereichs der Messwert liegt. Ein Klick auf den Punkt
  öffnet seine letzten 24 Stunden, wie der Balken.
- **Sondenplätze**: Die Sonden werden in der Reihenfolge platziert, in der der
  Hub sie auflistet. Eine Sonde kann stattdessen an einen Platz der
  Erweiterungsboxen geheftet werden, damit die Karte der tatsächlichen Belegung
  entspricht. **Auto** gibt sie der Reihenfolge des Hubs zurück.

---

[← Zurück zur Hauptseite](README.de.md)
