[← Zurück zur Hauptseite](README.de.md)

# ReefATO

ReefATO+ mit ha-reef-card in Aktion:

[![Video ansehen](https://img.youtube.com/vi/2R0DHp2eqT4/0.jpg)](https://www.youtube.com/watch?v=2R0DHp2eqT4)

Die ReefATO+-Karte ist eine visuelle Bedienung für den RSATO+-Controller, den
Osmosewasser-Vorratsbehälter mit seiner Pumpe, die am Beckenrand geklemmte
Füllstandssonde und die Lecksonde am Boden.

Die Füllstandssonde des ReefATO+ wird immer gezeichnet. Die **Pumpe** und die
**Lecksonde** sind optional. Was das Gerät nicht meldet, wird gar nicht
gezeichnet, und die davon abhängigen Bedienelemente verschwinden mit ihm: ein
ReefATO+ ohne Lecksonde zeigt eine Karte ohne Lecksonde, keine ausgegraute
Sonde.

<img src="../img/rsato/rsato_zones.png"/>

Die Karte ist in 7 Zonen aufgeteilt:

1. Controller: Betriebsmodus, Ein/Aus, Wartungsmodus, Konfiguration, WLAN und automatisches Nachfüllen
2. Zubehör-Einstellungen: Nachfüllpumpe, Lecksonde, Füllstandssonde
3. Osmosewasser-Vorratsbehälter: Nachfüll-Bedienelemente, Restmenge und Reichweite
4. Summer
5. Lecksonde
6. Aquarium: Wasserstand, Temperatur und Tagesverbrauch
7. Letzte Meldung und letzter Alarm

## Controller

<img src="../img/rsato/zone_1.png"/>

---

Der Text auf der Controller-Front ist der vom Gerät gemeldete **Betriebsmodus**
(Auto, Manuell, Leck…), übersetzt in die Sprache von Home Assistant.

<span>Der Schalter <img src="../img/mdi/mdi_power-plug.png" width="20"/> schaltet den ReefATO+ ein oder aus.</span>

<img src="../img/rsato/off_mode.png" width="50%"/>

<span>Der Schalter <img src="../img/mdi/mdi_account-wrench.png" width="20"/> wechselt in den Wartungsmodus.</span>

<img src="../img/rsato/maintenance.png" width="50%"/>

<span>Ein Klick auf das Symbol <img src="../img/rsdose/cog_icon.png" width="30"/> öffnet die allgemeine Konfiguration des ReefATO+: Einstellungen oder abgefragte Daten neu laden, Gerät zurücksetzen, Firmware aktualisieren.</span>

<img src="../img/rsato/zone_1_dialog_config.png" width="50%"/>

<span>Ein Klick auf das Symbol <img src="../img/mdi/wifi_icon.png" width="30"/> öffnet die Netzwerkeinstellungen.</span>

<img src="../img/rsato/zone_1_dialog_wifi.png" width="50%"/>

<span>Der Schalter <img src="../img/mdi/mdi_waves-arrow-up.png" width="20"/> in der zweiten Reihe aktiviert oder deaktiviert das **automatische Nachfüllen**. Ausgeschaltet füllt das Gerät nie von selbst nach, und nur die Tasten aus Zone 3 wirken noch auf die Pumpe. Er ist ausgeblendet, wenn keine Pumpe gekoppelt ist.</span>

## Zubehör-Einstellungen

<img src="../img/rsato/zone_2.png"/>

---

Die drei Symbole folgen den drei Buchsen der Frontplatte, in derselben
Reihenfolge: von links nach rechts die **Nachfüllpumpe**, die **Lecksonde** und
die **Füllstandssonde**. Jedes öffnet einen eigenen Dialog für dieses Zubehör.
Die Symbole der Pumpe und der Lecksonde verschwinden mit dem Zubehör, wenn dessen
Buchse unbelegt ist.

<span>Das Pumpensymbol <img src="../img/mdi/mdi_pump.png" width="30"/> zeigt den Betriebszustand, den gemessenen Verbrauch und die Fördermenge, die drei Stromschwellen, anhand derer die Firmware Trockenlauf oder Blockade erkennt, und was die letzte Füllung ausgelöst hat.</span>

<img src="../img/rsato/zone_2_dialog_pump.png" width="50%"/>

<span>Das Symbol der Lecksonde <img src="../img/mdi/mdi_pipe-leak.png" width="30"/> zeigt, ob die Sonde eingesteckt und scharfgeschaltet ist, das Urteil trocken/nass samt dem Rohwert dahinter, sowie den Summer, den diese Sonde auslöst.</span>

<img src="../img/rsato/zone_2_dialog_leak.png" width="50%"/>

<span>Das Symbol der Füllstandssonde <img src="../img/mdi/mdi_hydraulic-oil-level.png" width="30"/> zeigt zuerst den Zustand der Sonde — angeschlossen, kalibriert, zu prüfen, Fehler — denn eine unkalibrierte oder verschmutzte Sonde entwertet jede folgende Messung. Danach den Füllstand selbst, die beiden Elektroden dahinter, den Temperatursensor im selben Gehäuse sowie Kennung und Wartungsdaten der Kartusche.</span>

<img src="../img/rsato/zone_2_dialog_ato_sensor.png" width="50%"/>

## Osmosewasser-Vorratsbehälter

<img src="../img/rsato/zone_3.png"/>

---

Diese Zone ist der Behälter, aus dem nachgefüllt wird, samt den drei Tasten, die
seine Pumpe von Hand steuern:

<table>
  <tr>
    <td align="center"><img src="../img/mdi/mdi_water-pump.png" width="40"/><br/><b>Füllen</b><br/>Startet eine manuelle Füllung</td>
    <td align="center"><img src="../img/mdi/mdi_water-pump-off.png" width="40"/><br/><b>Stoppen</b><br/>Bricht die laufende Füllung ab</td>
    <td align="center"><img src="../img/mdi/mdi_play-circle-outline.png" width="40"/><br/><b>Fortsetzen</b><br/>Aktiviert die Pumpe wieder</td>
  </tr>
</table>

Dieser Teil zeigt den Stand des Wasservorrats, berechnet aus der hinterlegten
Behältergröße und dem tatsächlichen Wert. Ein leerer Behälter zeigt weiterhin
eine Wasserlinie — die, die die Pumpe nicht ansaugen kann. Unter 10 % blinkt das
Wasser, um zu sagen, dass der Behälter bald leer ist.

Ein Klick auf das Wasser öffnet den Behälterdialog, in dem sich die Größe
bearbeiten lässt:

<img src="../img/rsato/zone_3_dialog_ato_tank.png" width="50%"/>

Die Zahl unten links am Behälter ist die **Reichweite**: die verbleibenden Tage,
bis er leer ist, von der Integration aus dem mittleren Tagesverbrauch berechnet.
Ein Klick darauf öffnet die zugehörige Info-Ansicht.

Während einer Füllung fließt Wasser aus dem Auslass über dem Technikbecken.

<img src="../img/rsato/zone_3_filling.png"/>

## Summer

<img src="../img/mdi/mdi_bell-ring_red.png" width="40"/>

---

<span>Die Glocke <img src="../img/mdi/mdi_bell-ring_red.png" width="20"/> <img src="../img/mdi/mdi_bell-off_red.png" width="20"/> folgt der Summer-Einstellung des Geräts und wird ausgegraut, wenn er aus ist.</span>

Ein Klick öffnet den Summer-Dialog: die Einstellung selbst, ob er gerade ertönt,
und als Zusammenhang der Zustand der Lecksonde.

<img src="../img/rsato/zone_4_dialog_buzzer.png" width="50%"/>

Ein **langer Druck** schaltet den Summer direkt um. Die beiden Gesten sind bewusst
getrennt: den Alarm stummzuschalten ist eine Sicherheitseinstellung und nichts,
was einem beim Nachsehen der Details versehentlich passieren sollte.

> [!NOTE]
> Der Summer ist nicht nur der Leckalarm: Das Gerät lässt ihn auch bei
> Pumpenfehlern ertönen, er bleibt also auf einem ReefATO+ ohne Lecksonde
> verfügbar. Das Symbol wird nur bei Versionen der Integration ausgeblendet, die
> die Einstellung noch nicht bereitstellen.

## Lecksonde

<img src="../img/rsato/zone_5.png"/>

---

Die Sonde wird nur gezeichnet, wenn sie tatsächlich eingesteckt ist. Eingesteckt,
aber in der App abgeschaltet, erscheint sie ausgegraut: sie ist da, sie erkennt
nichts.

Wird Wasser erkannt, blinkt die Sonde und eine Pfütze breitet sich am Fuß des
Bildes aus.

<table>
  <tr>
    <th align="center">Leck am Aquarium</th>
    <th align="center">Leck am Osmosewasserbehälter</th>
    <th align="center">Leck unbekannter Herkunft</th>
  </tr>
  <tr>
    <td align="center"><img src="../img/rsato/zone_5_leak_aquarium.png"/></td>
    <td align="center"><img src="../img/rsato/zone_5_leak_rodi.png"/></td>
    <td align="center"><img src="../img/rsato/zone_5_leak_unknown.png"/></td>
  </tr>
</table>

## Aquarium

<img src="../img/rsato/zone_6.png"/>

---

Der Wasserstand in diesem Teil zeigt den Erkennungszustand der ATO-Sonde.

| Zustand     | Bedeutung                                                             |
| ----------- | --------------------------------------------------------------------- |
| Darunter    | Die Oberfläche liegt unter der Sonde: das Nachfüllen kommt nicht nach |
| Sollstand 1 | Erste Nachfüllmarke                                                   |
| Sollstand 2 | Zweite Nachfüllmarke                                                  |
| Darüber     | Die Oberfläche liegt über der Sonde: das Becken ist überfüllt         |

Beide Enden sind anormal, deshalb lassen **Darunter** und **Darüber** das Wasser
blinken. Eine Sonde im Fehlerzustand oder eine Entität, die noch nichts gemeldet
hat, hat gar keine Höhe: Die Karte zeichnet ihre Markierung für „keine Messung“
statt eines leeren Beckens.

<table>
  <tr>
    <th align="center">Darunter</th>
    <th align="center">Sollstand 1</th>
    <th align="center">Sollstand 2</th>
    <th align="center">Darüber</th>
    <th align="center">Keine Messung</th>
  </tr>
  <tr>
    <td align="center"><img src="../img/rsato/zone_6_water_level_below.png"/></td>
    <td align="center"><img src="../img/rsato/zone_6_water_level_1.png"/></td>
    <td align="center"><img src="../img/rsato/zone_6_water_level_2.png"/></td>
    <td align="center"><img src="../img/rsato/zone_6_water_level_above.png"/></td>
    <td align="center"><img src="../img/rsato/zone_6_water_level_error.png"/></td>
  </tr>
</table>

Die Temperatur am Beckenboden stammt vom Sensor in der Füllstandssonde und wird
nur gemeldet, wenn er am Gerät aktiviert ist.

Das Diagramm in der Ecke ist der **Tagesverbrauch**: die seit Mitternacht
nachgefüllte Menge, orange gefüllt, gegen den gleitenden Tagesmittelwert in Rot.
Das Fenster ist am Kalendertag verankert und nicht an gleitenden 24 Stunden, da
der Zähler um Mitternacht zurückgesetzt wird.

Ein Klick auf das Diagramm öffnet den Verbrauchsdialog, dieselbe Geschichte mit
ausgeschriebenen Zahlen: Füllungen und Menge, heute gemessen, als Tagesmittel und
als Gesamtsumme, dazu das, was der Behälter noch dafür hergibt.

<img src="../img/rsato/zone_6_dialog_usage.png" width="50%"/>

## Störungen

Die Karte hat keine eigene Warnleuchte: Was gestört ist, ist das, was blinkt —
unter einem hellroten Schleier.

| Blinkendes Element | Was das Gerät meldet                                                                                      |
| ------------------ | --------------------------------------------------------------------------------------------------------- |
| Die Pumpe          | Störung, blockierte Pumpe, zu lange Füllung, leerer Behälter oder fehlende Füllstandssonde                |
| Die Lecksonde      | Wasser erkannt, auf der Osmose- oder auf der Aquarienseite                                                |
| Der Wasserstand    | Die Oberfläche liegt unter oder über der Sonde                                                            |
| Das ganze Bild     | Die Füllstandssonde will geprüft werden oder misst nicht mehr — jeder angezeigte Stand wird unglaubwürdig |

Eine als fehlend gemeldete Pumpe ist keine Störung: Pumpe, Nachfülltasten,
Behälter und Verbrauchsdiagramm werden dann schlicht nicht gezeichnet.

## Meldungen

<img src="../img/rsato/zone_7.png"/>

---

Diese Zone zeigt die letzten Systemmeldungen des ReefATO+. Sie hat zwei Zeilen:

- Die graue Zeile zeigt die **letzte Meldung**.
- Die rosa Zeile zeigt den **letzten Alarm**, dem das Symbol ⚠ vorangeht.

Ein Klick auf das Symbol <img src="../img/mdi/mdi_delete-empty.png" width="20"/> löscht die zugehörige Meldung.

Diese Zeilen lassen sich über den Karteneditor ausblenden.

## Karteneditor

<img src="../img/rsato/editor.png" width="50%"/>

---

Neben den beiden Meldungszeilen hat der ReefATO+ drei Optionen. Sie sind für
einen Nachfüllkreis gedacht, für den das Gerät nicht ausgelegt wurde: eine
Osmoseanlage, die direkt ins Technikbecken speist, mit einem Ventil, das Home
Assistant statt der Red-Sea-Pumpe steuert.

### Unbegrenzter Osmosewasser-Vorratsbehälter

Standardmäßig aus. Eine Osmoseanlage, die laufend nachspeist, hat keinen
Behälter, also kann nichts leer werden — und alles, was die Karte über den
Vorrat sagt, handelt von einem Kanister, den es nicht gibt.

Eingeschaltet entfallen der Prozentwert am Behälter und der Dialog dahinter, die
Reichweite wird zu ∞, und das Symbol der Pumpeneinstellungen sowie die Taste
„Fortsetzen“ werden ausgeblendet: eine kontinuierliche Speisung hat keinen
Füllzyklus, den man dem Gerät zurückgeben könnte. Wasser, Nachfülltasten und
Verbrauchsdiagramm bleiben.

### Entität der abgegebenen Menge

Ein Schalter und eine Entitätsauswahl. Eingeschaltet wird die orange Kurve des
Tagesdiagramms aus einer eigenen Entität gelesen — einem Durchflussmesser in der
Osmoseleitung — statt aus dem Zähler des Geräts. Der rote gleitende Mittelwert
bleibt der des Geräts: nur die Quelle der Menge wandert, nicht der Vergleich, vor
dem sie gezeichnet wird.

Der Schalter ist es, der die Option aktiviert, damit eine aus einer früheren
Konfiguration übrig gebliebene Entität ignoriert wird, statt stillschweigend
wieder zu übernehmen.

### Entitäten zum Nachfüllen und Stoppen

Jede der beiden Tasten kann an eine Entität einer anderen Integration gebunden
werden, um das eigene Ventil zu steuern. Der Dienst wird aus der Domäne der
Entität abgeleitet, denn deren Auswahl sagt bereits, worum es sich handelt:

| Domäne der Entität        | Füllen       | Stoppen       |
| ------------------------- | ------------ | ------------- |
| `button`, `input_button`  | `press`      | `press`       |
| `switch`, `input_boolean` | `turn_on`    | `turn_off`    |
| `valve`                   | `open_valve` | `close_valve` |
| `script`                  | `turn_on`    | `turn_on`     |

Ein einzelner Schalter ist eine vollständige Bedienung: ein füllt, aus stoppt.
Lassen Sie die andere Auswahl leer, und die zweite Taste verwendet dieselbe
Entität mit dem gegenteiligen Dienst — dasselbe gilt für ein `input_boolean` oder
ein `valve`. Zwei Taster müssen getrennt gewählt werden, denn ein Tastendruck
trägt keine Richtung.

Eine gebundene Bedienung folgt auch der Red-Sea-Pumpe nicht mehr: Sie bleibt auf
einem ReefATO+ sichtbar, der gar keine Pumpe meldet — genau dafür bindet man sie.

Die Optionen werden unter dem Modell gespeichert, wie Home Assistant es meldet:

```yaml
type: custom:reef-card
device: "123456789012" # stabile Kennung des Geräts (sein Name funktioniert auch)
conf:
  RSATO+:
    devices:
      "123456789012":
        name: MY-RSATO # nur Beschriftung
        infinite_tank: true
        external_usage: true
        external_usage_entity: sensor.rodi_flow_meter
        fill_entity: switch.rodi_valve
        stop_fill_entity: "" # leer gelassen: der Schalter oben stoppt ihn auch
```

---

[← Zurück zur Hauptseite](README.de.md)
