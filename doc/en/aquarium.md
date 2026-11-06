[← Back to the main page](../../README.md)

# Aquarium view

The aquarium view in action:

[![Watch the video](https://img.youtube.com/vi/ZtYobmQZf9k/0.jpg)](https://www.youtube.com/watch?v=ZtYobmQZf9k)

A second card, `custom:reef-aquarium-card`, shows a picture of your tank with its devices and entities on it, the water lit by your lamps and, if you wish, fish and corals alive in it. It needs the [ReefTank integration](https://github.com/Elwinmage/ha-reeftank-component), which stores the aquariums and their pictures.

## The view

<img src="../img/aquarium/view_tank.png" width="360"/> <img src="../img/aquarium/view_sump.png" width="360"/>

There are no fixed zones as on the device views: you put your devices and entities wherever you want on your picture.

- **Picture**: the photo of the view, or the drawn water, tinted by your lamps from the `light` level.
- **Devices and entities**: a tap on a device opens its view of this card; on an entity, its usual action. A device can also be outlined on the picture (rectangle, lasso or polygon) rather than shown as a thumbnail.
- **Clickable zones**: a tap on a clickable zone opens another view of the aquarium (the sump in the cabinet, for instance); the ← button comes back to the previous one.

## Getting started

1. Add a **Reef Aquarium Card** to a dashboard (`custom:reef-aquarium-card`).
2. In its editor, create an aquarium (**New aquarium**), then **Edit the scene**.
3. **Views**: upload a photo of your tank, outline the water, trace the sand line and the rocks.
4. **Devices** and **Light & flow**: drop your devices and entities on the picture, place your lamps.
5. **Livestock**: add your fish and corals, then save.

The card configuration only holds the aquarium id; everything else is stored by the integration:

```yaml
type: custom:reef-aquarium-card
aquarium: a1b2 # chosen in the card editor
render: static # optional: static, light or full; can only lower the aquarium's level
view: front # optional: the view to start on
```

With a ReefBeat cloud account, the aquarium of the cloud pre-fills dimensions, lamps, feeding shortcuts, and filters the Red Sea devices.

## The scene editor

A full-screen dialog, opened from the card editor, with seven tabs:

### Aquarium

<img src="../img/aquarium/editor_aquarium.png"/>

Name, dimensions, the matching cloud aquarium, light the photos were taken under, render level, water darkness at night.

- **Net water volume (L)**: Tank and sump, without rock and sand. Used by the dose regulation of the ReefDose. → [Dose regulation](reefdose.md#dose-regulation)

### Views

<img src="../img/aquarium/editor_views.png"/>

Pictures; for each water: outline, sand line (front and back), rocks with their depth, clickable zones, drawn background and its textures.

- **Sand and rocks**: trace the sand line against the front glass (and the back wall when the picture shows the top of the sand) and outline the rocks with their depth: fish keep above the sand, swim behind the rocks, and sand dwellers crawl on it.
- **Drawn decor**: when the photo of the water is not usable, a water can be drawn instead (water, sand, rock textures of the catalog), the rest of the picture kept.

### Devices

<img src="../img/aquarium/editor_devices.png"/>

Your devices and entities by floor and area, dragged onto the picture.

Tick **Hide the label** to draw the value alone, and choose its **Text colour**: the label stays in the editor.

### Light & flow

<img src="../img/aquarium/editor_lights.png"/>

Lamps lighting each water and their position; pumps that make the water move.

- **Light preview**: tick it to try a colour temperature (9,000 to 23,000 K, the range of the ReefLED) and an intensity on the picture. Nothing is sent to the lamps.

### Livestock

<img src="../img/aquarium/editor_livestock.png"/>

Fish (species, count, size, home) and corals (species, size, colours, position).

- **Behaviour**: shoals, open-water cruisers, sand dwellers, fish living around a home, gobies peeking out of their burrow; at night fish hide or rest, under a veil that keeps the tank readable.
- **Species**: fish and corals come from the [ReefTank catalog](https://github.com/Elwinmage/reeftank-catalog), downloaded and kept up to date by the integration. The editor lists them with a thumbnail; a name that is not in the catalog swims as a generic fish.

### Feeding

<img src="../img/aquarium/editor_feeding.png"/>

Entities that record a feeding, and where the food falls.

- **Feeding points**: a device or an entity of the **Devices** tab can be a feeding point, where the fish gather. Making a feeder one also adds its feed entity to the sources and binds the point to it; each source lists its points.

### Monitoring

<img src="../img/aquarium/editor_monitoring.png"/>

The pH, ORP, room CO2 and KH tests entities, what tells a calibration, the alarm thresholds, and the status of the monitoring.

The alarms compare the tank with its own recent history.

## Render levels

Each aquarium renders at one of three levels; a card can lower it, e.g. on a slow wall tablet:

| Level                 | Shows                         |
| --------------------- | ----------------------------- |
| **Static** (`static`) | picture, devices and entities |
| **Light** (`light`)   | plus the colour of the lamps  |
| **Full** (`full`)     | plus fish and corals          |

A picture of the technical room with live devices on it is a perfectly good `static` aquarium.

The full guide (scene editor, entities, services, catalog) is in the [ReefTank README](https://github.com/Elwinmage/ha-reeftank-component).
