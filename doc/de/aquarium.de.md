[← Zurück zur Hauptseite](README.de.md)

# Aquarienansicht

Eine zweite Karte, `custom:reef-aquarium-card`, zeigt ein Foto Ihres Beckens mit seinen Geräten und Entitäten, das Wasser beleuchtet von Ihren Lampen und, wenn Sie möchten, lebendige Fische und Korallen. Sie benötigt die [ReefTank-Integration](https://github.com/Elwinmage/ha-reeftank-component), die die Aquarien und ihre Bilder speichert.

<img src="../img/aquarium/preview.webp"/>

## Erste Schritte

1. Fügen Sie einem Dashboard eine **Reef Aquarium Card** hinzu (`custom:reef-aquarium-card`).
2. Legen Sie in ihrem Editor ein Aquarium an (**Neues Aquarium**), dann **Szene bearbeiten**.
3. **Ansichten**: ein Foto Ihres Beckens hochladen, das Wasser umranden, Sandlinie und Steine nachzeichnen.
4. **Geräte** und **Licht & Strömung**: Geräte und Entitäten auf das Bild ziehen, Lampen platzieren.
5. **Besatz**: Fische und Korallen hinzufügen, dann speichern.

Die Kartenkonfiguration enthält nur die Aquarium-ID; alles andere speichert die Integration:

```yaml
type: custom:reef-aquarium-card
aquarium: a1b2 # chosen in the card editor
render: static # optional: static, light or full; can only lower the aquarium's level
view: front # optional: the view to start on
```

Mit einem ReefBeat-Cloud-Konto füllt das Cloud-Aquarium Maße, Lampen und Fütterungs-Kurzbefehle vor und filtert die Red-Sea-Geräte.

## Die Ansicht

Die Karte ist in 3 Zonen unterteilt:

1. Bild
2. Geräte und Entitäten
3. Klickbare Zonen

<img src="../img/aquarium/aquarium_zones.png"/>

### 1. Bild

<img src="../img/aquarium/zone_1.png"/>

Das Foto der Ansicht oder das gezeichnete Wasser, ab der Stufe `light` von Ihren Lampen getönt.

### 2. Geräte und Entitäten

<img src="../img/aquarium/zone_2.png"/>

Ein Tippen auf ein Gerät öffnet seine Ansicht in dieser Karte, auf eine Entität ihre übliche Aktion. Ein Gerät kann auch auf dem Bild umrandet werden (Rechteck, Lasso oder Polygon), statt als Miniatur zu erscheinen.

### 3. Klickbare Zonen

<img src="../img/aquarium/zone_3.png"/>

Ein Tippen auf eine klickbare Zone öffnet eine andere Ansicht des Aquariums (zum Beispiel das Technikbecken im Unterschrank); die Schaltfläche ← führt zur vorherigen zurück.

## Der Szeneneditor

Ein Vollbilddialog, aus dem Karteneditor geöffnet, mit sieben Reitern:

### Aquarium

<img src="../img/aquarium/editor_aquarium.png"/>

Name, Maße, das passende Cloud-Aquarium, Licht, unter dem die Fotos entstanden, Darstellungsstufe, Dunkelheit des Wassers nachts.

- **Netto-Wasservolumen (L)**: Becken und Technikbecken, ohne Gestein und Sand. Von der Dosierregelung der ReefDose genutzt. → [Dosierregelung](reefdose.de.md#dosierregelung)

### Ansichten

<img src="../img/aquarium/editor_views.png"/>

Bilder; für jedes Wasser: Umriss, Sandlinie (vorne und hinten), Steine mit ihrer Tiefe, anklickbare Zonen, gezeichneter Hintergrund und seine Texturen.

- **Sand und Felsen**: Zeichnen Sie die Sandlinie an der Frontscheibe (und an der Rückwand, wenn das Bild die Sandoberfläche zeigt) und umranden Sie die Felsen mit ihrer Tiefe: Fische bleiben über dem Sand, schwimmen hinter den Felsen, und Bodenbewohner kriechen darauf.
- **Gezeichnetes Dekor**: Ist das Foto des Wassers unbrauchbar, kann das Wasser gezeichnet werden (Wasser, Sand, Felstexturen des Katalogs), der Rest des Bildes bleibt erhalten.

### Geräte

<img src="../img/aquarium/editor_devices.png"/>

Ihre Geräte und Entitäten nach Etage und Bereich, auf das Bild gezogen.

### Licht & Strömung

<img src="../img/aquarium/editor_lights.png"/>

Lampen, die jedes Wasser beleuchten, und ihre Position; Pumpen, die das Wasser bewegen.

### Besatz

<img src="../img/aquarium/editor_livestock.png"/>

Fische (Art, Anzahl, Größe, Revier) und Korallen (Art, Größe, Farben, Position).

- **Verhalten**: Schwärme, Freiwasserschwimmer, Bodenbewohner, Fische mit festem Revier, Grundeln, die aus ihrem Bau schauen; nachts verstecken sich die Fische oder ruhen, unter einem Schleier, der das Becken lesbar lässt.
- **Arten**: Fische und Korallen stammen aus dem [ReefTank-Katalog](https://github.com/Elwinmage/reeftank-catalog), den die Integration herunterlädt und aktuell hält. Der Editor listet sie mit einer Miniatur auf; ein Name, der nicht im Katalog steht, schwimmt als generischer Fisch.

### Fütterung

<img src="../img/aquarium/editor_feeding.png"/>

Entitäten, die eine Fütterung protokollieren, und wo das Futter fällt.

### Überwachung

<img src="../img/aquarium/editor_monitoring.png"/>

Die Entitäten für pH, ORP, CO2 im Raum und KH-Tests, was eine Kalibrierung anzeigt, die Alarmschwellen und der Status der Überwachung.

Die Alarme vergleichen das Becken mit seinem eigenen jüngsten Verlauf.

## Darstellungsstufen

Jedes Aquarium wird in einer von drei Stufen dargestellt; eine Karte kann sie senken, z. B. auf einem langsamen Wandtablet:

| Stufe                   | Zeigt                      |                                                            |
| ----------------------- | -------------------------- | ---------------------------------------------------------- |
| **Statisch** (`static`) | Bild, Geräte und Entitäten | <img src="../img/aquarium/render_static.png" width="240"/> |
| **Licht** (`light`)     | plus die Farbe der Lampen  | <img src="../img/aquarium/render_light.png" width="240"/>  |
| **Voll** (`full`)       | plus Fische und Korallen   | <img src="../img/aquarium/render_full.png" width="240"/>   |

Ein Foto des Technikraums mit live angezeigten Geräten ist ein vollwertiges `static`-Aquarium.

Die vollständige Anleitung (Szeneneditor, Entitäten, Dienste, Katalog) steht im [ReefTank-README](https://github.com/Elwinmage/ha-reeftank-component/blob/main/doc/de/README.de.md).
