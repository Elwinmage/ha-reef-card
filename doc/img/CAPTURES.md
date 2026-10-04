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

## aquamedic

| File                            | Section             |
| ------------------------------- | ------------------- |
| `aquamedic/role_picker.png`     | Aqua Medic          |
| `aquamedic/schedule_editor.png` | Editing the program |

## energybackup

| File                        | Section              |
| --------------------------- | -------------------- |
| `energybackup/overview.png` | Energy backup        |
| `energybackup/install.png`  | Power Flow Card Plus |
| `energybackup/editor.png`   | Pumps                |
