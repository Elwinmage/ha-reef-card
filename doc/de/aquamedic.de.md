[← Zurück zur Hauptseite](README.de.md)

# Aqua Medic

Aqua Medic mit ha-reef-card in Aktion:

[![Video ansehen](https://img.youtube.com/vi/9Gh4YE6Ck9g/0.jpg)](https://www.youtube.com/watch?v=9Gh4YE6Ck9g)

Ansichten für die Pumpen von [ha-aquamedic-component](https://github.com/Elwinmage/ha-aquamedic-component):

| Gerät                                  | Ansicht der Karte      |
| -------------------------------------- | ---------------------- |
| EcoDrift / SmartDrift (Strömungspumpe) | `aquamedic-smartdrift` |
| DC Runner (Förderpumpe)                | `aquamedic-dcrunner`   |
| DC Runner (Abschäumerpumpe)            | `aquamedic-dcskimmer`  |

<p align="center">
<img src="../img/aquamedic/smartdrift.png" width="30%"/>
<img src="../img/aquamedic/dcrunner.png" width="30%"/>
<img src="../img/aquamedic/dcskimmer.png" width="30%"/>
</p>

Förderpumpe und Abschäumerpumpe sind dieselbe Hardware: Die Karte zeigt eine
Rollenauswahl, bis die Auswahl **Pumpenrolle** der Integration gesetzt ist,
und wechselt dann von selbst zur passenden Ansicht.

<img src="../img/aquamedic/role_picker.png"/>

## Was die Ansicht zeigt

Die Karte ist in 4 Zonen gegliedert:

1. Obere Leiste
2. Fehler
3. Geschwindigkeit
4. Zeitfenster-Programm

<img src="../img/aquamedic/aquamedic_zones.png"/>

## Obere Leiste

<img src="../img/aquamedic/zone_1.png"/>

Ein/Aus, Futterpause, Timer und 0-10V-Steuerung, jeweils
mit einem Klick umgeschaltet; das Zahnrad öffnet die Einstellungen (alle
Entitäten der Pumpe, ihre Rolle und ihre Fehlersensoren). Eine SmartDrift
ergänzt den Schalter Impuls / Gezeiten und ihren Wellenmodus (Klick:
Detailansicht).

## Fehler

<img src="../img/aquamedic/zone_2.png"/>

Eine blinkende Zeile nennt die Fehler, die die Pumpe meldet
(Trockenlauf, blockierter Rotor, Übertemperatur…). Solange die Pumpe
gesund ist, wird nichts gezeichnet.

## Geschwindigkeit

<img src="../img/aquamedic/zone_3.png"/>

Ein Ring auf dem Bild und ein Schieberegler darunter
(Motordrehzahl bei einer DC Runner, Durchfluss bei einer SmartDrift, die
zusätzlich einen Regler für die Wellenfrequenz erhält). Bei einer
SmartDrift sitzt der Ring auf der Frontkappe der Pumpe, die Zahl in seiner
Mitte. Beide verschwinden, solange die Pumpe über ihren 0-10V-Eingang
gesteuert wird, da die Integration die Geschwindigkeit dann sperrt. Beim
Loslassen behält der Regler seinen neuen Wert, bis die Pumpe ihn meldet.

## Zeitfenster-Programm

<img src="../img/aquamedic/zone_4.png"/>

Der Tag von 00:00 bis 24:00, ein Block je
Zeitfenster — seine Höhe ist die programmierte Geschwindigkeit, eine
Futterpause ist über die volle Höhe gestrichelt, ein Stopp ist ein dünner
Balken auf der Grundlinie. Ein roter Cursor markiert die aktuelle Uhrzeit.
Das Diagramm ist abgeblendet, solange der Timer aus ist, weil die Pumpe
das Programm dann ignoriert.

## Animationen

Das Bild zeigt, was die Pumpe gerade tut:

- **SmartDrift / EcoDrift**: Vier gewellte Strahlen fächern sich von der
  Vorderseite der Pumpe auf. Sie schwellen im Takt der Wellenfrequenz an und
  bleiben im Modus mit konstantem Durchfluss gleichmäßig.
- **DC Runner**: Wasser wird in den Einlass gesaugt und aus dem Auslass nach
  oben gedrückt.
- **DC Skimmer**: das schäumende Bild, solange die Pumpe läuft, das ruhende,
  wenn sie aus ist oder von der Futterpause gehalten wird; Bänder steigen in
  der Reaktionskammer auf, schneller mit der Motordrehzahl, und Blasen
  platzen im Schaumtopf. Es gibt keinen Zustand „Topf voll": Die
  Aqua-Medic-Firmware erkennt ihn nicht.

Das Wasser bewegt sich schneller, je höher die Geschwindigkeit ist. Es wird
nichts gezeichnet, solange die Pumpe aus ist, von der Futterpause gehalten
wird oder bei 0 % steht.

## Das Programm bearbeiten

<img src="../img/aquamedic/schedule_editor.png"/>

Klicken Sie auf das Diagramm (oder halten Sie das Timer-Symbol gedrückt), um
den Editor zu öffnen: eine Zeile je Zeitfenster mit Beginn, Ende, Modus und
Wert (Geschwindigkeit in %, oder Minuten für eine Futterpause), dazu
Frequenz und Gezeiten bei einer SmartDrift. Zeitfenster lassen sich
hinzufügen und entfernen. **Speichern** schreibt das gesamte Programm der
Pumpe über den Dienst `aquamedic.set_schedule` neu; **Abbrechen** ändert
nichts.

Der Editor setzt durch, was die Pumpe akzeptiert: Zeitfenster dürfen sich
weder überlappen noch über Mitternacht gehen (schreiben Sie ein Nachtfenster
als zwei Zeitfenster), ein DC-Runner-Zeitfenster läuft mit 30 % oder mehr,
eine Futterpause dauert 1 bis 60 Minuten, und eine Pumpe fasst 48
Zeitfenster.

> [!NOTE]
> Das Programm benötigt ha-aquamedic-component mit dem Sensor `schedule`.
> Mit einer älteren Version wird das Diagramm einfach nicht gezeichnet.

> [!NOTE]
> Eine DC Runner mit der alten Firmware (Geschwindigkeit `flow` genannt,
> kein Timer) verwendet dieselben Ansichten: Die Elemente, die ihr fehlen,
> sind ausgeblendet.

## Anordnung

Jede Ansicht hat ihren eigenen Rahmen und ihre eigene Platzierung, in den
Konstanten `PICTURE` und `LAYOUT` ihres Mappings (`dcrunner.mapping.ts`,
`dcskimmer.mapping.ts`, `smartdrift.mapping.ts`): wo das Bild sitzt, die
Mitte jedes Symbols, Mitte und Größe des Geschwindigkeitsrings. Auf dem Bild
gezeichnete Punkte sind in Prozent des Bildes angegeben, sodass sie beim
Verschieben oder Skalieren mitwandern. Wie jedes Element lassen sie sich
auch in der Konfiguration der Karte überschreiben.

---

[← Zurück zur Hauptseite](README.de.md)
