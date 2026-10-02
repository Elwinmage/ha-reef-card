[← Zurück zur Hauptseite](README.de.md)

# ReefWave

ReefWave mit ha-reef-card in Aktion:

[![Video ansehen](https://img.youtube.com/vi/VIDEO_ID/0.jpg)](https://www.youtube.com/watch?v=VIDEO_ID)

ReefWave **RSWAVE25** und **RSWAVE45** werden unterstützt.

<img src="../img/rswave/rswave.png"/>

> [!IMPORTANT]
> ReefWave-Pumpen hängen stärker von der ReefBeat-Cloud ab als die anderen
> Geräte: Lesen Sie zuerst [dies](https://github.com/Elwinmage/ha-reefbeat-component/blob/main/doc/de/reefwave.de.md#reefwave). Mit einem in
> ha-reefbeat-component verknüpften Cloud-Konto arbeitet die Karte mit der
> Wellenbibliothek und den Gruppen der ReefBeat-App, und beide bleiben
> synchron. Ohne Konto siehe [Ohne Cloud-Konto](#ohne-cloud-konto).

## Die Ansicht

Die Karte ist in 7 Zonen gegliedert:

1. Meldungen
2. Halteclips
3. LED-Streifen
4. Endkappe
5. Strömung
6. Gruppe
7. Tagesprogramm

<img src="../img/rswave/rswave_zones.png"/>

## Meldungen

<img src="../img/rswave/zone_1.png"/>

Letzte Meldung und letzter Alarm, oben.

## Halteclips

<img src="../img/rswave/zone_2.png"/>

Ein/Aus, Wartung, Einstellungen und WLAN.

## LED-Streifen

<img src="../img/rswave/zone_3.png"/>

Der Modus der Pumpe in hellem Weiß (ein Tippen öffnet
seine Detailansicht) und darunter der Name der Pumpe.

## Endkappe

<img src="../img/rswave/zone_4.png"/>

Die Geschwindigkeit als roter Ring auf der Kappe: die
Vorwärtsintensität der laufenden Welle, der Vorschau während einer
Vorschau, und 0, wenn die Pumpe nicht läuft (aus, Fütterung, Wartung,
keine Welle). Pfeile im Inneren geben die Richtung an: → vorwärts,
← rückwärts, beide für eine alternierende Welle. Tippen Sie auf die Kappe,
um [diese Pumpe in der aktuellen Welle](#diese-pumpe-in-der-aktuellen-welle) einzustellen.

## Strömung

<img src="../img/rswave/zone_5.png"/>

Unter der Pumpe, Wasser in dieser Geschwindigkeit animiert:
nach links bei einer Vorwärtswelle, nach rechts bei einer Rückwärtswelle,
hin und her bei einer alternierenden. Steht die Pumpe, wird nichts
gezeichnet.

## Gruppe

<img src="../img/rswave/zone_6.png"/>

Die Pumpen der Gruppe in einer Reihe, jede mit Miniaturbild
und Name, in der Reihenfolge der Gruppe. Die Pumpe der Karte ist umrandet;
tippen Sie auf eine andere, um deren Karte zu zeigen. Eine Pumpe, die Home
Assistant nicht erreicht, ist ausgegraut. Bei einer einzelnen Pumpe wird
nichts gezeigt.

## Tagesprogramm

<img src="../img/rswave/zone_7.png"/>

Der Tag von 00:00 bis 24:00, ein Block je Zeitfenster
in der Farbe seines Wellentyps: Die Vorwärtsintensität steigt über die
Mittellinie, die Rückwärtsintensität fällt darunter. Ein Zeitfenster
„ohne Welle" ist eine gestrichelte Linie. Die Legende der Typen
(Piktogramm und Name) steht unter dem Diagramm, und ein roter Cursor
markiert die aktuelle Uhrzeit. Tippen Sie auf das Diagramm, um das
Programm zu bearbeiten; die Schaltfläche **Wellen**
darüber öffnet die Bibliothek.

Wellentypen: Gleichmäßig, Zufällig, Regelmäßig,
Stufen, Oberfläche und Keine Welle, mit den
Piktogrammen der ReefBeat-App.

## Programmeditor

<img src="../img/rswave/program_editor.png"/>

Tippen Sie auf das Tagesprogramm: oben das Diagramm des Entwurfs, dann eine
Zeile je Zeitfenster mit Beginn, Ende, der in der Bibliothek gewählten
Welle, ihrem Typ, ihrer Richtung und den Intensitäten dieser Pumpe.
Zeitfenster lassen sich hinzufügen und entfernen; **Speichern**
schreibt das Programm, **Abbrechen** ändert nichts.

- Das Programm wird auf **jede Pumpe der Gruppe** geschrieben, jede mit
  ihren eigenen Intensitäten. Ist eine Pumpe der Gruppe nicht verfügbar, ist
  das Speichern gesperrt, wie in der ReefBeat-App: Die Gruppe bleibt
  synchron.
- Das Programm beginnt um 00:00, zwei Zeitfenster können nicht zur selben
  Zeit beginnen, und jedes Zeitfenster braucht eine Welle.
- Unter dem Gruppenhinweis gruppiert eine Schaltfläche die Pumpe mit den
  ReefWaves ihres Aquariums (**Mit den ReefWaves des Aquariums gruppieren**) oder hebt die Gruppierung
  auf (**Diese Pumpe aus der Gruppe lösen**). Bei einer Gruppe wird die Reihenfolge ihrer
  Pumpen per Ziehen und Ablegen oder mit den Pfeilen ‹ › geändert.
- Unter der Tabelle zeigt der Wellenbereich die Bibliothek auf der Welle des
  aktuellen Zeitfensters; der Stift einer Zeile oder die Wahl einer Welle
  zeigt diese Welle.

## Wellenbibliothek

<img src="../img/rswave/library.png"/>

Die Schaltfläche **Wellen** listet die Wellen des
Aquariums auf, wie die ReefBeat-App sie speichert: die von Red Sea und Ihre
eigenen, jede mit den Pumpen, die sie verwenden. Die Wahl einer Welle zeigt
ihre Einstellungen:

- ihren **Typ**, aus den Piktogrammen gewählt;
- ihre **Form**: Vorwärts- und Rückwärtszeit (min), Impulsdauer (s) und
  Stufen, je nachdem, was ihr Typ verwendet. Die Form teilen sich alle
  Pumpen, die die Welle verwenden;
- die Vorwärts- und Rückwärtsintensität **dieser Pumpe** und ob sie mit der
  Gruppe synchronisiert ist.

Dann schreibt **Welle aktualisieren** die Welle (die Programme, die sie
verwenden, werden neu geschrieben), **Neue Welle erstellen** fragt nach einem
Namen und fügt eine Kopie mit diesen Einstellungen hinzu, und
**Löschen** entfernt eine Welle, die kein Programm verwendet. Eine
Red-Sea-Welle kann nur kopiert werden.

**Vorschau auf dieser Pumpe**: Wählen Sie die Richtung und die Dauer (1 bis
10 min), dann **Vorschau**; die Pumpe spielt die Welle und
kehrt dann zu ihrem Programm zurück. **Vorschau beenden** beendet sie
sofort.

## Diese Pumpe in der aktuellen Welle

<img src="../img/rswave/pump_settings.png"/>

Tippen Sie auf die Endkappe, um die Richtung und die Vorwärts- /
Rückwärtsintensität dieser Pumpe in der laufenden Welle zu ändern. Nur diese
Pumpe ändert sich: Die anderen Pumpen der Gruppe behalten ihre Richtung und
ihre Intensitäten, da die ReefBeat-App jede Pumpe einer Gruppe eine Welle
auf ihre Weise spielen lässt.

## Einstellungen

<img src="../img/rswave/dialog_config.png"/>

Das Zahnrad öffnet die Einstellungen der Pumpe: die laufende Welle (Typ,
Richtung, Intensitäten, Zeiten, Stufen), `Verknüpfung AUS-Verzögerung`,
`Mit dem Aquarium gruppiert`, die Vorschau-Einstellungen und -Schaltflächen
der Integration und die Geräteaktionen (Aktualisieren, Zurücksetzen,
Firmware-Update).

## Ohne Cloud-Konto

Die Wellenbibliothek und die Gruppen liegen in der ReefBeat-Cloud. Ohne ein
mit der Pumpe verknüpftes Cloud-Konto werden nur die Wellen des aktuellen
Programms angeboten, das Programm wird auf die Pumpe selbst geschrieben, und
die Bibliothek kann nicht bearbeitet werden.

> [!NOTE]
> Die Ansicht benötigt ha-reefbeat-component mit dem Attribut `schedule` des
> Sensors `wave_type`, dem Sensor `linked_waves` und den Diensten
> `redsea.wave_*`.

---

[← Zurück zur Hauptseite](README.de.md)
