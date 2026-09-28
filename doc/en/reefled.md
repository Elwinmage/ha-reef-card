[← Back to the main page](../../README.md)

# ReefLed

ReefLed **G1** (RSLED50, RSLED90, RSLED160) and **G2** (RSLED60, RSLED115,
RSLED170) are supported, and so are [virtual LEDs](#virtual-led).

<p align="center">
<img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsled/rsled_g1.png" width="45%"/>
<img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsled/rsled_g2.png" width="45%"/>
</p>

## The view

- **Sky** — the course of the sun between the first rise and the last set of
  today's program (white and blue channels), with both times at the ends of
  the arc. At night the sky turns violet, like the moon LED of the lamp: the
  moon travels from the set to the next rise and shows the current phase
  (`todays_moon_day`). Tap the mode in the middle to change
  it (auto, manual, timer). When clouds are programmed a small cloud shows next
  to the mode; while they are passing, they drift in front of the sun.
- **Name** — the name of the lamp (the one given in Home Assistant) is
  written in the sky, along the upper left edge of the lamp. A long name is
  set smaller, then cut (the whole name shows on hover).
- **Left face** — on/off, maintenance, configuration, battery and wifi.
- **Right face** — identify (the lamp blinks, and so does the beam on the card
  for 10 s), moon phase and acclimation.
  Moon and acclimation open their settings. While an acclimation runs, its
  remaining days and current intensity are written next to it.
- **Beam** — its colour and opacity follow the light currently produced
  (white, blue and moon channels). It shows the current intensity, the name of
  today's program and a chart of it (white, blue and moon), a red marker at
  the current time. Outside the automatic mode the chart is dimmed. On a G2
  the chart shows the intensity, its line coloured by the colour temperature
  (yellow when warm, blue when cold), with the value of each colour zone.
  Tap the beam to edit the program.
- **Sliders** — grouped on the left: intensity, colour temperature and moon.
  Intensity and colour drive the `kelvin_intensity` light, the moon slider the
  `moon` light; a single call is sent when you release. On a G1, the small
  **K | W/B** switch above them swaps intensity and colour for the white and
  blue channels; the browser remembers the choice for each lamp. A G2 only
  drives its colour through kelvin and intensity, so it has no such switch.
- **Messages** — last message and last alert under the beam.

## Virtual LED

<img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsled/rsled_virtual.png" width="300"/>

A virtual LED drives several lamps as one. It shows the same view as a real
lamp: the G2 one as soon as one of its lamps is a G2 (the group is then only
driven through kelvin and intensity), the G1 one when all its lamps are G1
(with the **K | W/B** switch). There is no battery, wifi nor messages on a
virtual LED; instead, its lamps are listed bottom right, each with a
thumbnail of its generation. Tap one to show its own card (the back button
returns to the virtual LED).

The program shown is read from the first lamp of the group (a G1 program is
shown in kelvin in the G2 view). **Save** writes the edited program to each
lamp, in its own format: white/blue for a G1 (converted with the table of
its model), `color` points for a G2.

> [!NOTE]
> The list of lamps needs ha-reefbeat-component with the `linked_leds`
> sensor. Without it, the card picks the G2 view when the virtual LED has no
> white/blue lights, and writes the programs to the virtual LED entry itself.

## Program editor

<img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsled/rsled_program_editor.png" width="400"/>

Tap the beam to edit a day program: the chart on top, the points of the
selected channel below (time, intensity and, on a G2, colour
temperature). Points can also be dragged on the chart. On a G1, the **W/B |
K** switch of the editor edits the program either channel by channel or as
intensity + colour temperature; it is always saved as white/blue. The
conversion is done by the integration (`redsea.led_convert`: the table of
the model and the intensity compensation option), with a local fallback for
older versions of the integration. The first and last
rows are the rise and the set of the channel: their intensity stays at 0 %.
**Save** sends the program of the day shown, or of every day with _All days_.

> [!NOTE]
> The lamp stores its programs on a weekly timeline (day N starts at
> (N - 1) × 1440 min); the card shows and edits each day on its own 24 h.
> A G2 stores its program as `color` points `{t, i1, k1, i2, k2}` (an in
> and an out value per point) plus the moon, its clouds on `/clouds/<day>`
> like a G1. The card reads and writes that format; it also reads the
> program as the app's G1 parser sees it (white = intensities, blue =
> colour temperatures).

> [!NOTE]
> The acclimation progress needs ha-reefbeat-component with the
> `acclimation_remaining_days` and `acclimation_current_intensity_factor`
> sensors. With its `current_program` sensor, the beam shows the name of the
> program the lamp says it is running.

---

[← Back to the main page](../../README.md)
