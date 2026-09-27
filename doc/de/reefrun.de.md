[← Zurück zur Hauptseite](README.de.md)

# ReefRun

ReefRun mit ha-reef-card in Aktion:

[![Video ansehen](https://img.youtube.com/vi/Xxv38OPqiGI/0.jpg)](https://www.youtube.com/watch?v=Xxv38OPqiGI)

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

---

[← Zurück zur Hauptseite](README.de.md)
