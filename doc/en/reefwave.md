[← Back to the main page](../../README.md)

# ReefWave

ReefWave with ha-reef-card in action:

[![Watch the video](https://img.youtube.com/vi/VIDEO_ID/0.jpg)](https://www.youtube.com/watch?v=VIDEO_ID)

ReefWave **RSWAVE25** and **RSWAVE45** are supported.

<img src="../img/rswave/rswave.png"/>

> [!IMPORTANT]
> ReefWave pumps depend on the ReefBeat cloud more than the other devices:
> read [this](https://github.com/Elwinmage/ha-reefbeat-component/blob/main/doc/en/reefwave.md#reefwave) first. With a cloud account linked in
> ha-reefbeat-component, the card works on the wave library and the groups
> of the ReefBeat app, and both stay in sync. Without one, see
> [Without a cloud account](#without-a-cloud-account).

## The view

The card is divided into 7 zones:

1. Messages
2. Mounting clips
3. LED strip
4. End cap
5. Flow
6. Group
7. Day program

<img src="../img/rswave/rswave_zones.png"/>

## Messages

<img src="../img/rswave/zone_1.png"/>

Last message and last alert, on top.

## Mounting clips

<img src="../img/rswave/zone_2.png"/>

On/off, maintenance, settings and Wi-Fi.

## LED strip

<img src="../img/rswave/zone_3.png"/>

The mode of the pump, in light white (tap it for its
more-info), and the name of the pump under it.

## End cap

<img src="../img/rswave/zone_4.png"/>

The speed, as a red ring fitted on the cap: the forward
intensity of the wave running now, of the preview while previewing, and 0
when the pump does not run (off, feeding, maintenance, no wave). Arrows
inside give the direction: → forward, ← reverse, both for an alternate
wave. Tap the cap to set [this pump in the current wave](#this-pump-in-the-current-wave).

## Flow

<img src="../img/rswave/zone_5.png"/>

Under the pump, water animated at that speed: leftwards for a
forward wave, rightwards for a reverse one, back and forth for an
alternate one. Nothing is drawn while the pump is stopped.

## Group

<img src="../img/rswave/zone_6.png"/>

The pumps of the group in a row, each with its thumbnail and
its name, in the group order. The pump of the card is circled; tap another
one to show its own card. A pump Home Assistant cannot reach is greyed
out. Nothing is shown for a pump alone.

## Day program

<img src="../img/rswave/zone_7.png"/>

The day from 00:00 to 24:00, one block per slot in the
colour of its wave type: the forward intensity rises above the middle
line, the reverse one drops under it. A "no wave" slot is a dashed line.
The legend of the types (pictogram and name) is under the graph, and a red
cursor marks the current time. Tap the graph to edit the program; the
**Waves** button over it opens the library.

Wave types: Uniform, Random, Regular,
Step, Surface and No wave, with the
pictograms of the ReefBeat app.

## Program editor

<img src="../img/rswave/program_editor.png"/>

Tap the day program: the graph of the draft on top, then one row per slot
with its start, its end, the wave picked in the library, its type, its
direction and this pump's intensities. Slots can be added and removed;
**Save** writes the program, **Cancel** changes nothing.

- The program is written to **every pump of the group**, each with its own
  intensities. When a pump of the group is not available, saving is locked,
  as in the ReefBeat app: the group stays in sync.
- The program starts at 00:00, two slots cannot start at the same time, and
  every slot needs a wave.
- Under the group note, a button groups the pump with the ReefWaves of its
  aquarium (**Group with the aquarium's ReefWaves**) or ungroups it (**Ungroup this pump**).
  For a group, the order of its pumps is changed by drag and drop, or with
  the ‹ › arrows.
- Under the table, the wave zone shows the library on the wave of the
  current slot; the pencil of a row, or picking a wave, shows that wave.

## Wave library

<img src="../img/rswave/library.png"/>

The **Waves** button lists the waves of the aquarium, as
the ReefBeat app keeps them: the Red Sea ones and yours, each with the pumps
using it. Picking a wave shows its settings:

- its **type**, picked from the pictograms;
- its **shape**: forward and reverse times (min), pulse duration (s) and
  steps, as its type uses them. The shape is shared by every pump using the
  wave;
- **this pump's** forward and reverse intensities, and whether it is
  synchronised with the group.

Then **Update the wave** writes the wave (the programs using it are
written again), **Create a new wave** asks for a name and adds a copy with
these settings, and **Delete** removes a wave no program uses. A
Red Sea wave can only be copied.

**Preview on this pump**: choose the direction and the duration (1 to 10 min),
then **Preview**; the pump runs the wave, then goes back to
its program. **Stop preview** ends it at once.

## This pump in the current wave

<img src="../img/rswave/pump_settings.png"/>

Tap the end cap to change the direction and the forward / reverse
intensities of this pump in the wave running now. Only this pump changes:
the other pumps of the group keep their own direction and intensities, as
the ReefBeat app lets each pump of a group run a wave its own way.

## Settings

<img src="../img/rswave/dialog_config.png"/>

The cog opens the settings of the pump: the wave running now (type,
direction, intensities, times, steps), `Shortcut OFF delay`,
`Grouped with the aquarium`, the preview settings and buttons of the
integration, and the device actions (refresh, reset, firmware update).

## Without a cloud account

The wave library and the groups live in the ReefBeat cloud. Without a cloud
account linked to the pump, only the waves of the current program are
offered, the program is written to the pump itself, and the library cannot
be edited.

> [!NOTE]
> The view needs ha-reefbeat-component with the `schedule` attribute of the
> `wave_type` sensor, the `linked_waves` sensor and the `redsea.wave_*`
> services.

---

[← Back to the main page](../../README.md)
