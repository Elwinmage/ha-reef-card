[← Zurück zur Hauptseite](README.de.md)

# Notstromversorgung

Die Karte zeichnet die Energieflüsse von [reefbeatEnergyBackup](https://github.com/Elwinmage/reefbeatEnergyBackup): Netz, Batterie, Aquarium und bis zu vier Pumpen mit ihrer Geschwindigkeit.

<img src="../img/energybackup/overview.png"/>

Der Dienst veröffentlicht seine Sensoren über MQTT: Sein Gerät (standardmäßig `Reef Battery Backup`) erscheint in der Geräteauswahl der Karte, sobald Home Assistant es entdeckt hat. Sonst ist nichts zu konfigurieren: Die Karte findet Sensoren und Pumpen selbst.

## Power Flow Card Plus

Die Flüsse werden von [Power Flow Card Plus](https://github.com/flixlix/power-flow-card-plus) gezeichnet, einer separaten Karte, die installiert sein muss (HACS → Frontend). Solange sie fehlt, zeigt die Ansicht einen Link, der sie in HACS öffnet:

<img src="../img/energybackup/install.png"/>

Die Flüsse ersetzen dieses Feld, sobald die Karte geladen ist. Ihre Konfiguration schreibt die Reef Card: weder `power-flow-card-plus`-YAML noch Template-Sensor noch `config-template-card` sind nötig.

## Was angezeigt wird

| Knoten       | Zeigt                                                                                       | Gelesen aus                                  |
| ------------ | ------------------------------------------------------------------------------------------- | -------------------------------------------- |
| **Netz**     | Vom Ladegerät gelieferte Leistung. Bei einem Ausfall: **Stromausfall** und seine Dauer      | Ladegerätleistung, Netzzustand, Ausfalldauer |
| **Batterie** | Lade- oder Entladeleistung, Ladezustand                                                     | Batterieleistung, Batterie-SoC               |
| **Aquarium** | Was die Technik verbraucht (Netz und Batterie zusammen), darunter die verbleibende Laufzeit | Von der Flusskarte berechnet, Laufzeit       |
| **Pumpen**   | Geschwindigkeit in %, Richtung einer Strömungspumpe, Symbol je nach Geschwindigkeit         | ReefWave, ReefRun-Pumpen, Aqua-Medic-Pumpen  |

- Die Ladegerätleistung gibt es nur mit einem Victron-Ladegerät. Ohne sie zeigt der Netzknoten nur, ob das Netz vorhanden ist, und der Aquariumknoten zeigt, was die Batterie liefert: am Netz nichts, da der Batteriemonitor nur den Batteriestrom sieht.
- Ein Klick auf einen Knoten öffnet die zugehörige Entität.
- Das Symbol `mdi:wrench-clock` öffnet die Wartungsaufgaben des Geräts (den Batterie-Entladetest), wie in den anderen Ansichten.

## Pumpen

Die Pumpen werden unter den ReefWave, den ReefRun-Pumpen und den Aqua-Medic-Pumpen der Installation gesucht. Standardmäßig zeigt der Fluss die vom Notstromdienst gesteuerten Pumpen (er veröffentlicht ihre Liste: Eine mit `configure.py` hinzugefügte oder entfernte Pumpe folgt nach einem Neustart des Dienstes). Veröffentlicht der Dienst die Liste nicht, werden die ersten noch antwortenden Pumpen angezeigt, Strömungspumpen zuerst. Die Flusskarte zeichnet höchstens vier Pumpen: Bei mehr die anzuzeigenden im Karteneditor anhaken.

<img src="../img/energybackup/editor.png"/>

Die Auswahl wird mit den Optionen des Geräts gespeichert, als Home-Assistant-Geräte-IDs:

```yaml
type: custom:reef-card
device: reef_battery
conf:
  ENERGYBACKUP:
    devices:
      reef_battery:
        pumps:
          - 0a1b2c3d4e5f60718293a4b5c6d7e8f9
          - 9f8e7d6c5b4a39281706f5e4d3c2b1a0
```
