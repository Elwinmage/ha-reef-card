# Captures to add

Images the documentation pages reference and that are still to be taken.
Paths are relative to `doc/img/`.

While a file listed here is missing, `scripts/check_doc_images.py` reports its
references as PENDING instead of failing (`--strict` makes them fail). Remove
a line once its capture is in the repository.

The `<device>_zones.png` images are drawn by `scripts/gen_zones.py` over a
capture of the whole card, once the rectangles of the device are filled in its
`ZONE_SETS`; the `zone_N.png` ones are the crops of those zones.

## reefled

| File                          | Section           |
| ----------------------------- | ----------------- |
| `rsled/staggered_sunrise.png` | Staggered sunrise |
| `rsled/library.png`           | Cloud library     |

## reefwave

| File                        | Section                       |
| --------------------------- | ----------------------------- |
| `rswave/program_editor.png` | Program editor                |
| `rswave/library.png`        | Wave library                  |
| `rswave/pump_settings.png`  | This pump in the current wave |
| `rswave/dialog_config.png`  | Settings                      |
| `rswave/dialog_preview.png` | Preview                       |

## aquamedic

| File                            | Section             |
| ------------------------------- | ------------------- |
| `aquamedic/role_picker.png`     | Aqua Medic          |
| `aquamedic/schedule_editor.png` | Editing the program |

## energybackup

`energybackup_zones.png` is drawn with `--device energybackup` over
`overview.png`.

| File                                  | Section               |
| ------------------------------------- | --------------------- |
| `energybackup/overview.png`           | Energy backup         |
| `energybackup/install.png`            | Power Flow Card Plus  |
| `energybackup/energybackup_zones.png` | The view              |
| `energybackup/zone_1.png`             | Title and maintenance |
| `energybackup/zone_2.png`             | Mains                 |
| `energybackup/zone_3.png`             | Battery               |
| `energybackup/zone_4.png`             | Aquarium              |
| `energybackup/zone_5.png`             | Pumps                 |
| `energybackup/editor.png`             | Pumps                 |

## aquarium

| File                             | Section                  |
| -------------------------------- | ------------------------ |
| `aquarium/aquarium_zones.png`    | The view                 |
| `aquarium/zone_1.png`            | The picture              |
| `aquarium/zone_2.png`            | Devices and entities     |
| `aquarium/zone_3.png`            | Clickable zones          |
| `aquarium/editor_aquarium.png`   | Scene editor: aquarium   |
| `aquarium/editor_views.png`      | Scene editor: views      |
| `aquarium/editor_devices.png`    | Scene editor: devices    |
| `aquarium/editor_lights.png`     | Scene editor: lights     |
| `aquarium/editor_livestock.png`  | Scene editor: livestock  |
| `aquarium/editor_feeding.png`    | Scene editor: feeding    |
| `aquarium/editor_monitoring.png` | Scene editor: monitoring |
| `aquarium/render_static.png`     | Render levels            |
| `aquarium/render_light.png`      | Render levels            |
| `aquarium/render_full.png`       | Render levels            |
