[← Zurück zur Hauptseite](README.de.md)

# ReefLed

ReefLed mit ha-reef-card in Aktion:

[![Video ansehen](https://img.youtube.com/vi/VIDEO_ID/0.jpg)](https://www.youtube.com/watch?v=VIDEO_ID)

ReefLed **G1** (RSLED50, RSLED90, RSLED160) und **G2** (RSLED60, RSLED115,
RSLED170) werden unterstützt, ebenso [virtuelle LEDs](#virtuelle-led).

> [!NOTE]
> Nur die G1 wurde an echten Leuchten validiert. Die G2 ist implementiert
> und sollte funktionieren, wurde aber noch nicht getestet: Rückmeldungen
> sind willkommen.

<p align="center">
<img src="../img/rsled/rsled_g1.png" width="45%"/>
<img src="../img/rsled/rsled_g2.png" width="45%"/>
</p>

## Die Ansicht

Die Karte ist in 7 Zonen gegliedert:

1. Himmel
2. Linke Seite
3. Rechte Seite
4. Lichtkegel
5. Schieberegler
6. Gruppe und Wetter
7. Meldungen

<img src="../img/rsled/rsled_zones.png"/>

## Himmel

<img src="../img/rsled/zone_1.png"/>

Der Lauf der Sonne zwischen dem ersten Aufgang und dem
letzten Untergang des heutigen Programms (Weiß- und Blaukanal), mit beiden
Zeiten an den Enden des Bogens. Nachts wird der Himmel violett, wie die
Mond-LED der Leuchte: Der Mond wandert vom Untergang bis zum nächsten
Aufgang und zeigt die aktuelle Phase (`todays_moon_day`). Tippen Sie auf
den Modus in der Mitte, um ihn zu ändern (Auto, manuell, Timer). Sind
Wolken programmiert, erscheint eine kleine Wolke neben dem Modus; während
sie vorbeiziehen, treiben sie vor der Sonne.

## Linke Seite

<img src="../img/rsled/zone_2.png"/>

Ein/Aus, Wartung, Konfiguration, Batterie und WLAN.

Der Name der Leuchte (der in Home Assistant vergebene) steht
auf der oberen linken Seite der Leuchte, zwischen den Lüftungsschlitzen
und den Symbolen. Ein langer Name wird kleiner gesetzt, dann abgeschnitten
(der ganze Name erscheint beim Überfahren).

## Rechte Seite

<img src="../img/rsled/zone_3.png"/>

Identifizieren (die Leuchte blinkt, und der
Lichtkegel der Karte ebenfalls 10 s lang), Mondphase und Akklimatisierung.
Mond und Akklimatisierung öffnen ihre Einstellungen. Während einer
Akklimatisierung stehen die verbleibenden Tage und die aktuelle Intensität
daneben.

## Lichtkegel

<img src="../img/rsled/zone_4.png"/>

Farbe und Deckkraft folgen dem aktuell erzeugten Licht
(Weiß-, Blau- und Mondkanal). Bei 0 % Intensität oder ausgeschalteter
Leuchte gibt es keinen Lichtkegel und die Linse ist ausgegraut. Er zeigt
die aktuelle Intensität, den Namen des heutigen Programms und dessen
Diagramm (Weiß, Blau und Mond), mit einer roten Markierung bei der
aktuellen Uhrzeit, die unter dem Diagramm steht. Im GPS-Wettermodus folgt
in Klammern die Uhrzeit am Ort des Wetters: der Moment des Tages des
Ortes, den das Programm gerade spielt (09:04 in Frankreich kann 04:04 auf
den Malediven sein, wenn der Sonnenaufgang am Becken verankert ist).
Außerhalb des Automatikmodus ist das Diagramm abgeblendet. Bei einer G2
zeigt das Diagramm die Intensität, die Linie nach der Farbtemperatur
eingefärbt (gelb wenn warm, blau wenn kalt), mit dem Wert jeder Farbzone.
Tippen Sie auf den Lichtkegel, um das Programm zu bearbeiten. Die Wolken
des Tages erscheinen als senkrechtes Band über ihrem Zeitfenster, umso
dunkler, je stärker sie sind (Low, Medium, High); ebenso im Diagramm des
Editors und in der Wetterwoche.

## Schieberegler

<img src="../img/rsled/zone_5.png"/>

Links gruppiert: Intensität, Farbtemperatur und Mond.
Intensität und Farbe steuern das Licht `kelvin_intensity`, der
Mondregler das Licht `moon`; beim Loslassen wird ein einziger Aufruf
gesendet. Bei einer G1 tauscht der kleine Schalter **K | W/B** darüber
Intensität und Farbe gegen den Weiß- und Blaukanal; der Browser merkt
sich die Wahl je Leuchte. Eine G2 steuert ihre Farbe nur über Kelvin und
Intensität und hat diesen Schalter daher nicht.

## Gruppe und Wetter

<img src="../img/rsled/zone_6.png"/>

Bei einer Leuchte einer Gruppe die Leuchten ihrer Gruppe (siehe
[Virtuelle LED](#virtuelle-led)): Tippen Sie auf eine, um ihre Karte zu zeigen.
Darunter das Wettersymbol, das leuchtet, solange die Leuchte dem Wetter folgt.

## Meldungen

<img src="../img/rsled/zone_7.png"/>

Letzte Meldung und letzter Alarm unter dem Lichtkegel.

## Versetzter Sonnenaufgang

<img src="../img/rsled/staggered_sunrise.png"/>

Beginnt die Leuchte ihren Tag später (ihr
`Sonnenaufgang-Versatz`, von einer Gruppe oder von Hand gesetzt),
spielt der Himmel das Programm um diesen Versatz später: Sonnenstand,
Auf- und Untergangszeit, Wolken. Ein Hinweis unter der Aufgangszeit
(„+15 min") öffnet die Einstellung des Versatzes, die sich auch im
Konfigurationsdialog befindet (nur Leuchten, die auf `/offset` antworten).

## Wetterprogramm

<img src="../img/rsled/rsled_weather.png" width="300"/>

Mit dem Wetterprogramm von ha-reefbeat-component hat der Programmeditor
einen Schalter **GPS-Wettermodus**, und unten rechts erscheint ein
Wettersymbol (`mdi:weather-partly-cloudy`), das leuchtet, solange die
Leuchte dem Wetter folgt, und blau, während eine Wetterwoche in
die Leuchte geschrieben wird. Es dient nur der Information: Der Modus wird im
Programmeditor gewählt.

Bei eingeschaltetem Modus weicht die Punktetabelle den Einstellungen: der
Ort (als `lat, lon` eingegeben, als Kartenlink eingefügt, nach seinem Namen
gesucht — „Malediven", „Fakarava"… —, worauf die Karte dorthin springt, oder
auf der Karte von Home Assistant gewählt, wenn sie verfügbar ist), der
Zeitraum (Vorhersage der nächsten Woche oder gemessenes Wetter der letzten
Woche), wie oft das Wetter abgerufen wird (3 bis 15 Tage), wie der Tag des
Ortes auf das Becken gelegt wird (Uhrzeit des Ortes, an einer Aufgangs- oder
Untergangszeit verankert, oder zwischen beiden gestreckt), die minimale und
maximale Intensität und die Wolken. Jede Änderung wird sofort als Vorschau
gezeigt: Das Diagramm zeigt den Tag, den das Wetter ergäbe, und die Woche
wird Tag für Tag aufgelistet (die Sonne am Becken, die Zeiten des Ortes beim
Überfahren, der Sonnenschein, die Bewölkung mit den Wolken der Leuchte und
die höchste Intensität); ein Tag der Liste wird im Diagramm gezeigt. Vor
**Speichern** wird nichts geschrieben: Der Editor zeigt
„Einstellungen werden gespeichert…", dann „Einstellungen gespeichert", sobald die
Integration die Einstellungen und den Modus gespeichert und die Woche
erstellt hat, und schließt sich; die Woche wird gleich danach im Hintergrund
in die Leuchte geschrieben. **Abbrechen** ändert nichts.

Die Farben der Wettertage bestimmen Sie selbst: Bei eingeschaltetem Modus
zeigt das Diagramm die Abschnitte des Tages, und nur ihre Farbe lässt sich
ändern. Die eingestellten Farben werden zu denen des gezeigten Wettertags,
oder aller Tage mit _Alle Tage_, anstelle der Farben des
eigenen Programms der Leuchte; sie werden mit den anderen Einstellungen in
der Vorschau gezeigt und gespeichert.

Wird der Modus auf einer Leuchte im Wettermodus ausgeschaltet, zeigt der
Editor das beiseitegelegte eigene Programm der Leuchte zum Bearbeiten:
**Speichern** stellt es wieder her (gegebenenfalls mit dem bearbeiteten
Tag). Eine außerhalb der Karte geänderte Einstellung (Entitäten von Home
Assistant, Automatisierungen) erscheint innerhalb einer Sekunde, und die
Leuchte wird 30 s nach der letzten Änderung geschrieben.

## Virtuelle LED

<img src="../img/rsled/rsled_virtual.png" width="300"/>

Eine virtuelle LED steuert mehrere Leuchten wie eine. Sie zeigt dieselbe
Ansicht wie eine echte Leuchte: die G2-Ansicht, sobald eine ihrer Leuchten
eine G2 ist (die Gruppe wird dann nur über Kelvin und Intensität gesteuert),
die G1-Ansicht, wenn alle ihre Leuchten G1 sind (mit dem Schalter
**K | W/B**). Eine virtuelle LED hat weder Batterie noch WLAN noch
Meldungen; stattdessen sind ihre Leuchten unten rechts aufgelistet, jede mit
einem Miniaturbild ihrer Generation. Tippen Sie auf eine, um ihre eigene
Karte zu zeigen (die Zurück-Schaltfläche führt zur virtuellen LED zurück).

Eine virtuelle LED ist eine Gruppe, wie die „gruppierten" LEDs der
ReefBeat-App: Was auf ihr oder auf einer ihrer Leuchten eingestellt wird
(Modus, manuelle Farbe, Timer, Programme, Akklimatisierung, Mondphase,
Wettermodus), gilt für alle Leuchten der Gruppe. Auch eine Leuchte einer
Gruppe listet die Leuchten ihrer Gruppe auf, sie selbst rot umrandet. Bei
einem versetzten Sonnenaufgang steht der Versatz jeder Leuchte unter ihrem
Namen (+0 min, +10 min…). Ist eine Leuchte der Gruppe nicht verfügbar,
lehnt die Integration die Änderung ab und nennt die Leuchte: Es wird nichts
gesendet, die Gruppe bleibt also synchron.

Das gezeigte Programm wird von der ersten Leuchte der Gruppe gelesen (ein
G1-Programm wird in der G2-Ansicht in Kelvin gezeigt). **Speichern**
schreibt das bearbeitete Programm auf jede Leuchte, in ihrem eigenen Format:
Weiß/Blau für eine G1 (mit der Tabelle ihres Modells umgerechnet),
`color`-Punkte für eine G2. Die Schreibvorgänge werden getaktet, da eine
Leuchte spät auf einen zu früh gesendeten Befehl antwortet: Währenddessen
zeigt der Editor seinen Fortschritt („Programm wird an die Lampen gesendet… 3/14").

> [!NOTE]
> Die Liste der Leuchten benötigt ha-reefbeat-component mit dem Sensor
> `linked_leds`. Ohne ihn wählt die Karte die G2-Ansicht, wenn die virtuelle
> LED keine Weiß/Blau-Lichter hat, und schreibt die Programme auf den
> Eintrag der virtuellen LED selbst.

## Programmeditor

<img src="../img/rsled/rsled_program_editor.png" width="400"/>

Tippen Sie auf den Lichtkegel, um ein Tagesprogramm zu bearbeiten: oben das
Diagramm, darunter die Punkte des gewählten Kanals (Zeit, Intensität und,
bei einer G2, Farbtemperatur). Punkte lassen sich auch im Diagramm ziehen.
Bei einer G1 bearbeitet der Schalter **W/B | K** des Editors das Programm
entweder Kanal für Kanal oder als Intensität + Farbtemperatur; gespeichert
wird es immer als Weiß/Blau. Die Umrechnung übernimmt die Integration
(`redsea.led_convert`: die Tabelle des Modells und die Option der
Intensitätskompensation), mit einem lokalen Ersatz für ältere Versionen der
Integration. Die erste und die letzte Zeile sind der Aufgang und der
Untergang des Kanals: Ihre Intensität bleibt bei 0 %. **Speichern** sendet
das Programm des gezeigten Tages, oder jedes Tages mit
_Alle Tage_.

### Cloud-Bibliothek

<img src="../img/rsled/library.png"/>

Ist die Leuchte mit einem ReefBeat-Cloud-Konto verknüpft (dem Cloud-Eintrag
der Integration), bietet der Editor die Programme seiner Bibliothek an, wie
die ReefBeat-App sie speichert (G1: je Aquarium; G2: je Konto, in einer
eigenen Bibliothek): Die Wahl eines Programms lädt es (ein G1-Programm wird
auf einer G2 in Kelvin gezeigt, ein G2-Programm wird auf einer G1 in Kelvin
bearbeitet und als Weiß/Blau gespeichert). Unverändert gespeichert, erhält
die Leuchte seinen Namen und seine Wolken, wie mit der ReefBeat-App.

Die Programme sind in zwei Gruppen aufgelistet: die von Red Sea (12K, 15K,
18K, 20K, 23K und RS Accelerated Growth auf einer G1; 15K, 23K, Shallow Reef
und Deep Reef, in der App eingebaut, auf einer G2) und Ihre eigenen. Wie in
der App kann ein Red-Sea-Programm geladen, aber weder aktualisiert noch
gelöscht werden; eines Ihrer eigenen kann gelöscht werden (🗑, nach einer
Bestätigung).

Ein bearbeitetes Programm wird in der Bibliothek gespeichert, bevor es an
die Leuchte gesendet wird: Die Karte fragt nach seinem Namen, standardmäßig
`prog-YYYYMMDDHHMM`. Stammt es von einem Ihrer Programme, ist der Name der
dieses Programms, und Sie wählen zwischen **Aktualisieren** (das
Bibliotheksprogramm wird ersetzt) und **Als neu speichern**. Eine
virtuelle LED verwendet die Bibliothek ihrer ersten verknüpften Leuchte.

> [!NOTE]
> Die Bibliothek benötigt ha-reefbeat-component mit den Diensten
> `redsea.led_library`, `redsea.led_library_save` und
> `redsea.led_library_delete`.

> [!NOTE]
> Die Leuchte speichert ihre Programme auf einer Wochen-Zeitachse (Tag N
> beginnt bei (N - 1) × 1440 min); die Karte zeigt und bearbeitet jeden Tag
> auf seinen eigenen 24 h. Eine G2 speichert ihr Programm als `color`-Punkte
> `{t, i1, k1, i2, k2}` (ein Eingangs- und ein Ausgangswert je Punkt) plus
> den Mond, ihre Wolken unter `/clouds/<day>` wie eine G1. Die Karte liest
> und schreibt dieses Format; sie liest das Programm auch so, wie der
> G1-Parser der App es sieht (Weiß = Intensitäten, Blau = Farbtemperaturen).

> [!NOTE]
> Der Fortschritt der Akklimatisierung benötigt ha-reefbeat-component mit
> den Sensoren `acclimation_remaining_days` und
> `acclimation_current_intensity_factor`. Mit dem Sensor `current_program`
> zeigt der Lichtkegel den Namen des Programms, das die Leuchte nach eigener
> Angabe gerade ausführt.

---

[← Zurück zur Hauptseite](README.de.md)
