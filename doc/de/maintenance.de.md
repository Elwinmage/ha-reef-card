[← Zurück zur Hauptseite](README.de.md)

# Wartung

Die Wartungsansicht von ha-reef-card in Aktion:

[![Video ansehen](https://img.youtube.com/vi/Ko46fHonOP4/0.jpg)](https://www.youtube.com/watch?v=Ko46fHonOP4)

<img src="../img/maintenance/overview.png"/>

Über die gerätebezogenen Ansichten hinaus bietet die Karte eine
**Wartungsansicht**, die alle von `ha-reefbeat-component`,
`ha-reef-maintenance-component` und `ha-aquamedic-component` bereitgestellten
Wartungsaufgaben zusammenfasst, als wäre das gesamte Wartungssystem ein einziges
Gerät. Die Ansicht sucht nach der Markierung, die jede von ihnen auf ihren
Entitäten setzt, nicht nach einer bestimmten Integration.

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

### Nach Gerät filtern

Standardmäßig listet die Ansicht die Aufgaben aller Geräte auf. Der Block
**Nach Gerät filtern** im Karteneditor schränkt sie ein: Haken Sie ein oder
mehrere Geräte an, und nur deren Aufgaben bleiben übrig, Zähler inbegriffen.

<img src="../img/maintenance/editor_devices.png"/>

Die Liste enthält einen Eintrag je Steuergerät samt der Anzahl seiner Aufgaben.
Untergeräte (ReefDose-Köpfe, ReefRun-Pumpen) werden über die `via_device`-
Verknüpfung der Home-Assistant-Registry ihrem Steuergerät zugeordnet: **RSDose4**
anzuhaken behält also die Aufgaben aller vier Köpfe. Kein Haken bedeutet „kein
Filter": alle Geräte werden angezeigt, was auch die Verknüpfung **Alle Geräte
anzeigen** wiederherstellt.

Die Auswahl wird als Gerätename gespeichert (siehe `devices` unten), damit das
YAML lesbar bleibt. Ein von Hand geschriebener Name passt zusätzlich per Präfix
auf seine Untergeräte, was Installationen ohne deklariertes `via_device`
abdeckt. Geräte ohne Namen werden über ihre Home-Assistant-Geräte-ID
identifiziert.

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

Der Standardzustand der Filter, der Gerätefilter und die Sichtbarkeit der drei
Schaltflächen werden im Karteneditor festgelegt.

<img src="../img/maintenance/editor.png"/>

## Konfiguration

```yaml
type: custom:reef-card
device: __maintenance__
maintenance:
  sort: due # "device" (Standard) oder "due"
  devices: # nur die Aufgaben dieser Geräte anzeigen (leer: alle)
    - SIMU-RSDOSE4
    - SIMU-RSATO
  hide_ok: false # Aufgaben ausblenden, die weder überfällig noch bald fällig sind
  hide_muted: false # Aufgaben mit ausgeschalteten Benachrichtigungen ausblenden
  warning_ratio: 0.2 # Anteil des Intervalls, der orange dargestellt wird
  show_reset: true # Schaltfläche "als erledigt markieren" in jeder Zeile anzeigen
  show_notify: true # Glocke zum Stummschalten/Aktivieren in jeder Zeile anzeigen
  show_interval: true # Schaltfläche zur Intervallbearbeitung in jeder Zeile anzeigen
```

Alle `maintenance`-Schlüssel sind optional. `sort` und `hide_ok` legen nur den
Anfangszustand fest: der Nutzer kann sie in der Ansicht selbst ändern. `devices`
akzeptiert sowohl Gerätenamen als auch Home-Assistant-Geräte-IDs; eine leere
Liste (der Standard) schaltet den Filter aus.

---

[← Zurück zur Hauptseite](README.de.md)
