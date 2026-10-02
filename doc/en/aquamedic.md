[← Back to the main page](../../README.md)

# Aqua Medic

Views for the pumps of [ha-aquamedic-component](https://github.com/Elwinmage/ha-aquamedic-component):

| Device                            | Card view              |
| --------------------------------- | ---------------------- |
| EcoDrift / SmartDrift (wavemaker) | `aquamedic-smartdrift` |
| DC Runner (return pump)           | `aquamedic-dcrunner`   |
| DC Runner (skimmer pump)          | `aquamedic-dcskimmer`  |

The return pump and the skimmer pump are the same hardware: the card shows a
role picker until the **Pump role** select of the integration is set, then
switches to the matching view on its own.

## What the view shows

- **Top band**: power, feeding pause, timer and 0-10V control, each a click
  away from being toggled; the cog opens the settings (every entity of the
  pump, its role and its fault sensors). A SmartDrift adds the pulse / tide
  switch and its wave mode (click: more-info).
- **Faults**: a blinking line names the faults the pump raises (dry run,
  locked rotor, overtemperature…). Nothing is drawn while the pump is healthy.
- **Speed**: a ring on the picture and a slider under it (motor speed on a DC
  Runner, flow on a SmartDrift, which also gets a wave frequency slider).
  Both disappear while the pump is driven by its 0-10V input, since the
  integration then locks the speed.
- **Time-slot program**: the day from 00:00 to 24:00, one block per slot —
  its height is the programmed speed, a feeding pause is dashed over the full
  height, a stop is a thin bar on the base line. A red cursor marks the
  current time. The graph is dimmed while the timer is off, because the pump
  then ignores the program.

## Editing the program

Click the graph (or hold the timer icon) to open the editor: one row per
slot with its start, end, mode and value (speed in %, or minutes for a
feeding pause), plus frequency and tide on a SmartDrift. **Save** rewrites the
whole program of the pump through the `aquamedic.set_schedule` service.

The editor enforces what the pump accepts: slots cannot overlap nor cross
midnight (write a night window as two slots), a DC Runner slot runs at 30 %
or more, a feeding pause lasts 1 to 60 minutes, and a pump holds 48 slots.

> The program needs ha-aquamedic-component with the `schedule` sensor. With an
> older version the graph is simply not drawn.

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
