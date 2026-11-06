[← Zurück zur Hauptseite](README.de.md)

# Futterautomat VSON (gehackt)

Die Karte steuert einen VSON-Futterautomaten, dessen Steuerung durch einen ESP32 (Lolin S2 mini) mit [ESPHome](https://esphome.io) ersetzt wurde. Der Automat behält seinen Motor, seinen Klappensensor und seinen Füllstandsensor; die Firmware ergänzt fünf Fütterungsplätze und einen Schalter für manuelles Füttern.

<img src="../img/vsonfeeder/overview.png" width="400"/>

## Den Futterautomaten hacken

Der Automat (VSON WP8621 V1.2) wird geöffnet und seine Originalplatine durch einen ESP32 ersetzt: Die Verdrahtung von Motor, Klappensensor und Füllstandsensor sowie das Flashen werden in diesem Thread der Home-Assistant-Community erklärt: [VSON WP8621 V1.2 fish feeder](https://community.home-assistant.io/t/vson-wp8621-v12-fish-feeder/759621).

## Firmware

Die ESPHome-Konfiguration liegt in [doc/esphome/vson-fish-feeder.yaml](../esphome/vson-fish-feeder.yaml). Tragen Sie Ihre Schlüssel und Passwörter in `secrets.yaml` ein (`fish_feeder_api_key`, `fish_feeder_ota_password`, `fish_feeder_ap_password`, dazu `wifi_ssid` und `wifi_password`).

ESPHome-Geräte haben keine Kennung, auf die sich die Karte verlassen kann, daher wird der Automat am **Projektnamen** erkannt, den seine Firmware angibt:

```yaml
esphome:
  project:
    name: "vson.fish_feeder"
    version: "1.2.0"
```

Home Assistant macht daraus den Hersteller (`vson`) und das Modell (`fish_feeder`) des Geräts. Nach dem Flashen erscheint der Automat in der Geräteauswahl der Karte. Jedes andere ESPHome-Gerät wird ignoriert.

Die Entitäten werden am Ende ihrer Entitäts-ID gefunden, das Gerät lässt sich also frei umbenennen. Behalten Sie die Entitätsnamen der Firmware bei (`Manual Feed`, `Open/Close Sensor`, `Food Level Sensor`, `Slot 1`…`Slot 5`, `Portion slot 1`…`Portion slot 5`).

## Die Ansicht

Die Karte ist in 2 Zonen unterteilt:

1. Der Automat
2. Die Fütterungsplätze

### 1. Der Automat

Das Bild folgt den Sensoren:

|                  | Vorrat OK                                                                  | Vorrat niedrig                                                              |
| ---------------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| **Klappe zu**    | <img src="../../src/img/esphome/VSONFEEDER/closed_full.webp" width="120"/> | <img src="../../src/img/esphome/VSONFEEDER/closed_empty.webp" width="120"/> |
| **Klappe offen** | <img src="../../src/img/esphome/VSONFEEDER/open_full.webp" width="120"/>   | <img src="../../src/img/esphome/VSONFEEDER/open_empty.webp" width="120"/>   |

- Solange die Klappe offen ist (oder der Motor läuft), fallen Pellets heraus.
- Vier Dinge kleben auf dem Automaten, verformt entlang seiner Flächen:
  - auf der Vorderseite, über der Klappe, zeigt ein kleines Display die **Laufzeit** der Steuerung (ein Klick öffnet den Sensor);
  - auf dem Glas des Deckels **blinkt** eine rote Warnung, wenn der Füllstandsensor einen niedrigen Vorrat meldet (ein Klick öffnet den Sensor);
  - auf der rechten Seite die **Fütterungen des Tages**: grau durchgestrichen, sobald ihre Stunde vorbei ist, die nächste orange, die späteren grün. Nur die Uhrzeiten sagen, welche vorbei sind: Die Firmware speichert die gegebenen Portionen nicht;
  - weiter unten auf der rechten Seite die Schaltfläche **Neustart**: Ein erstes Tippen macht sie scharf (sie wird orange), ein zweites innerhalb von 3 Sekunden startet die Steuerung neu.
- Ein Klick auf das Bild öffnet den Klappensensor.
- Das Symbol <img src="https://raw.githubusercontent.com/Templarian/MaterialDesign/master/svg/wrench-clock.svg" width="16"/> oben rechts öffnet die Wartungsaufgaben des Automaten, falls vorhanden.

<img src="../img/vsonfeeder/feeding.png" width="400"/>

### 2. Die Fütterungsplätze

- **Nächste Fütterung**: die Uhrzeit des nächsten Platzes, die verbleibende Zeit und seine Portionen.
- **Plätze**: die fünf Plätze der Firmware. Die Uhrzeit wird direkt bearbeitet (`time.set_value`), die Portionen mit den Tasten − und + (`number.set_value`, 0 bis 10). Ein Platz mit 0 Portionen ist aus und ausgegraut. Der nächste Platz ist hervorgehoben.
- Ein Platz mit derselben Uhrzeit wie ein früherer wird durchgestrichen angezeigt: Die Firmware überspringt ihn, solange der erste noch füttert.
- **Portionen pro Tag**: die an einem Tag tatsächlich gegebenen Portionen.
- **Jetzt füttern**: gibt eine Portion (schaltet den Schalter `Manual Feed` ein; die Firmware schaltet ihn aus, sobald die Klappe wieder zu ist).

<img src="../img/vsonfeeder/reserve_low.png" width="300"/>

Kann Home Assistant die Steuerung nicht erreichen, wird das Bild grau und der Titel zeigt _Nicht erreichbar_.
