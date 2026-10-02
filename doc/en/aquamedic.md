[← Back to the main page](../../README.md)

# Aqua Medic

Aqua Medic with ha-reef-card in action:

[![Watch the video](https://img.youtube.com/vi/VIDEO_ID/0.jpg)](https://www.youtube.com/watch?v=VIDEO_ID)

Views for the pumps of [ha-aquamedic-component](https://github.com/Elwinmage/ha-aquamedic-component):

| Device                            | Card view              |
| --------------------------------- | ---------------------- |
| EcoDrift / SmartDrift (wavemaker) | `aquamedic-smartdrift` |
| DC Runner (return pump)           | `aquamedic-dcrunner`   |
| DC Runner (skimmer pump)          | `aquamedic-dcskimmer`  |

<p align="center">
<img src="../img/aquamedic/smartdrift.png" width="30%"/>
<img src="../img/aquamedic/dcrunner.png" width="30%"/>
<img src="../img/aquamedic/dcskimmer.png" width="30%"/>
</p>

The return pump and the skimmer pump are the same hardware: the card shows a
role picker until the **Pump role** select of the integration is set, then
switches to the matching view on its own.

<img src="../img/aquamedic/role_picker.png"/>

## What the view shows

The card is divided into 4 zones:

1. Top band
2. Faults
3. Speed
4. Time-slot program

<img src="../img/aquamedic/aquamedic_zones.png"/>

## Top band

<img src="../img/aquamedic/zone_1.png"/>

Power, feeding pause, timer and 0-10V control, each a click
away from being toggled; the cog opens the settings (every entity of the
pump, its role and its fault sensors). A SmartDrift adds the pulse / tide
switch and its wave mode (click: more-info).

## Faults

<img src="../img/aquamedic/zone_2.png"/>

A blinking line names the faults the pump raises (dry run,
locked rotor, overtemperature…). Nothing is drawn while the pump is healthy.

## Speed

<img src="../img/aquamedic/zone_3.png"/>

A ring on the picture and a slider under it (motor speed on a DC
Runner, flow on a SmartDrift, which also gets a wave frequency slider). On
a SmartDrift the ring is fitted on the front cap of the pump, the figure in
its centre. Both disappear while the pump is driven by its 0-10V input,
since the integration then locks the speed. The slider keeps its new value
on release, until the pump reports it.

## Time-slot program

<img src="../img/aquamedic/zone_4.png"/>

The day from 00:00 to 24:00, one block per slot —
its height is the programmed speed, a feeding pause is dashed over the full
height, a stop is a thin bar on the base line. A red cursor marks the
current time. The graph is dimmed while the timer is off, because the pump
then ignores the program.

## Animations

The picture shows what the pump is doing:

- **SmartDrift / EcoDrift**: four wavy jets fan out of the front of the
  pump. They swell at the pace of the wave frequency, and stay steady in
  constant flow mode.
- **DC Runner**: water is drawn into the inlet and pushed up out of the
  outlet.
- **DC Skimmer**: the foaming picture while the pump runs, the idle one when
  it is off or held by the feeding pause; bands rise in the reaction
  chamber, faster with the motor speed, and bubbles pop in the collection
  cup. There is no full-cup state: the Aqua Medic firmware does not detect
  it.

The water travels faster as the speed rises. Nothing is drawn while the pump
is off, held by the feeding pause, or at 0 %.

## Editing the program

<img src="../img/aquamedic/schedule_editor.png"/>

Click the graph (or hold the timer icon) to open the editor: one row per
slot with its start, end, mode and value (speed in %, or minutes for a
feeding pause), plus frequency and tide on a SmartDrift. Slots can be added
and removed. **Save** rewrites the whole program of the pump through
the `aquamedic.set_schedule` service; **Cancel** changes nothing.

The editor enforces what the pump accepts: slots cannot overlap nor cross
midnight (write a night window as two slots), a DC Runner slot runs at 30 %
or more, a feeding pause lasts 1 to 60 minutes, and a pump holds 48 slots.

> [!NOTE]
> The program needs ha-aquamedic-component with the `schedule` sensor. With
> an older version the graph is simply not drawn.

> [!NOTE]
> A DC Runner with the legacy firmware (speed named `flow`, no timer) uses
> the same views: the elements it lacks are hidden.

## Layout

Each view has its own box and its own placement, in the `PICTURE` and
`LAYOUT` constants of its mapping (`dcrunner.mapping.ts`,
`dcskimmer.mapping.ts`, `smartdrift.mapping.ts`): where the picture sits, the
centre of each icon, the centre and size of the speed ring. Points drawn on
the picture are given in percentages of the picture, so resizing or moving
it moves them along. Like any element, they can also be overridden from the
card configuration.

---

[← Back to the main page](../../README.md)
