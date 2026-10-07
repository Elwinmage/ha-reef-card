[← Back to the main page](../../README.md)

# ReefLed

ReefLed with ha-reef-card in action:

[![Watch the video](https://img.youtube.com/vi/pA49z8QjTN4/0.jpg)](https://www.youtube.com/watch?v=pA49z8QjTN4)

ReefLed **G1** (RSLED50, RSLED90, RSLED160) and **G2** (RSLED60, RSLED115,
RSLED170) are supported, and so are [virtual LEDs](#virtual-led).

> [!NOTE]
> Only the G1 has been validated on real lamps. The G2 is implemented and
> should work, but has not been tested yet: feedback is welcome.

<p align="center">
<img src="../img/rsled/rsled_g1.png" width="45%"/>
<img src="../img/rsled/rsled_g2.png" width="45%"/>
</p>

## The view

The card is divided into 7 zones:

1. Sky
2. Left face
3. Right face
4. Beam
5. Sliders
6. Group and weather
7. Messages

<img src="../img/rsled/rsled_zones.png"/>

## Sky

<img src="../img/rsled/zone_1.png"/>

The course of the sun between the first rise and the last set of
today's program (white and blue channels), with both times at the ends of
the arc. At night the sky turns violet, like the moon LED of the lamp: the
moon travels from the set to the next rise and shows the current phase
(`todays_moon_day`). Tap the mode in the middle to change
it (auto, manual, timer). When clouds are programmed a small cloud shows next
to the mode; while they are passing, they drift in front of the sun.

## Left face

<img src="../img/rsled/zone_2.png"/>

On/off, maintenance, configuration, battery and wifi.

The name of the lamp (the one given in Home Assistant) is
written on the upper left face of the lamp, between the vents and the
icons. A long name is set smaller, then cut (the whole name shows on
hover).

## Right face

<img src="../img/rsled/zone_3.png"/>

Identify (the lamp blinks, and so does the beam on the card
for 10 s), moon phase and acclimation.
Moon and acclimation open their settings. While an acclimation runs, its
remaining days and current intensity are written next to it.

## Beam

<img src="../img/rsled/zone_4.png"/>

Its colour and opacity follow the light currently produced
(white, blue and moon channels). At 0 % intensity, or with the lamp off,
there is no beam and the lens is greyed out. It shows the current intensity, the name of
today's program and a chart of it (white, blue and moon), a red marker at
the current time, written under the chart. In GPS weather mode the time at
the weather's place follows in brackets: the moment of the place's day the
program plays (09:04 in France can be 04:04 in the Maldives when the
sunrise is anchored on the tank). Outside the automatic mode the chart is dimmed. On a G2
the chart shows the intensity, its line coloured by the colour temperature
(yellow when warm, blue when cold), with the value of each colour zone.
Tap the beam to edit the program. The clouds of the day show as a vertical
band over their window, darker as they get stronger (Low, Medium, High);
so do they on the editor's chart and on the weather week.

## Sliders

<img src="../img/rsled/zone_5.png"/>

Grouped on the left: intensity, colour temperature and moon.
Intensity and colour drive the `kelvin_intensity` light, the moon slider the
`moon` light; a single call is sent when you release. On a G1, the small
**K | W/B** switch above them swaps intensity and colour for the white and
blue channels; the browser remembers the choice for each lamp. A G2 only
drives its colour through kelvin and intensity, so it has no such switch.

## Group and weather

<img src="../img/rsled/zone_6.png"/>

On a lamp of a group, the lamps of its group (see
[Virtual LED](#virtual-led)): tap one to show its card. Under them, the
weather icon, lit while the lamp follows the weather.

## Messages

<img src="../img/rsled/zone_7.png"/>

Last message and last alert under the beam.

## Staggered sunrise

<img src="../img/rsled/staggered_sunrise.png"/>

When the lamp starts its day late (its
`Sunrise offset`, set by a group or by hand), the sky plays
the program late by that offset: sun position, rise and set times,
clouds. A badge under the rise time ("+15 min") opens the offset
setting, which is also in the configuration dialog (lamps answering
`/offset` only).

## Weather program

<img src="../img/rsled/rsled_weather.png" width="300"/>

With ha-reefbeat-component's weather program, the program editor has a
**GPS weather mode** switch, and a weather icon
(`mdi:weather-partly-cloudy`) shows bottom right, lit while the lamp follows
the weather, and blue while a weather
week is being written to the lamp. It is for information only: the mode is
chosen in the program editor.

With the mode on, the points table gives way to the settings: the place
(typed as `lat, lon`, pasted as a map link, searched by its name —
"Maldives", "Fakarava"… — the map then going there, or picked on Home
Assistant's map when it is available), the period (next week's forecast or last week's
measured weather), how often the weather is fetched (3 to 15 days), how the
place's day is set on the tank (the place's clock, anchored on a sunrise or
a sunset time, or stretched between both), the minimum and maximum intensity
and the clouds. Each change is previewed at once: the chart shows the day
the weather would make, and the week is listed day by day (the sun on the
tank, the place's own times on hover, the sunshine, the cloud cover with the
lamp's clouds and the top intensity); a day of the list shows in the chart.
Nothing is written before **Save**: the editor shows "Saving the
settings…", then "Settings saved" once the integration has saved the
settings and the mode and made the week, and closes; the week is written to
the lamp right after, in the background. **Cancel** changes nothing.

The colours of the weather days are yours to choose: with the mode on, the
chart shows the slots of the day and only their colour can be changed. The
colours set become those of the weather day shown, or of every day with
_All days_, in place of the colours of the lamp's own
program; they are previewed and saved with the other settings.

Turned off on a lamp in weather mode, the editor shows the lamp's own
program kept aside, to edit: **Save** brings it back (with the day edited,
if any). A setting changed outside the card (Home Assistant's entities,
automations) shows within a second, and the lamp is written 30 s after the
last change.

## Virtual LED

<img src="../img/rsled/rsled_virtual.png" width="300"/>

A virtual LED drives several lamps as one. It shows the same view as a real
lamp: the G2 one as soon as one of its lamps is a G2 (the group is then only
driven through kelvin and intensity), the G1 one when all its lamps are G1
(with the **K | W/B** switch). There is no battery, wifi nor messages on a
virtual LED; instead, its lamps are listed bottom right, each with a
thumbnail of its generation. Tap one to show its own card (the back button
returns to the virtual LED).

A virtual LED is a group, as the "grouped" LEDs of the ReefBeat app: what
is set on it, or on one of its lamps (mode, manual colour, timer, programs,
acclimation, moon phase, weather mode), is applied to every lamp of the
group. A lamp of a group lists the lamps of its group too, itself circled
in red. With a staggered sunrise, each lamp's offset is written under its
name (+0 min, +10 min…). When a lamp of the group is not available, the
integration refuses the change and names the lamp: nothing is sent, so the
group stays in sync.

The program shown is read from the first lamp of the group (a G1 program is
shown in kelvin in the G2 view). **Save** writes the edited program to each
lamp, in its own format: white/blue for a G1 (converted with the table of
its model), `color` points for a G2. The writes are paced, as a lamp
answers late to a command sent too soon: meanwhile the editor shows its
progress ("Sending the program to the lamps… 3/14").

> [!NOTE]
> The list of lamps needs ha-reefbeat-component with the `linked_leds`
> sensor. Without it, the card picks the G2 view when the virtual LED has no
> white/blue lights, and writes the programs to the virtual LED entry itself.

## Program editor

<img src="../img/rsled/rsled_program_editor.png" width="400"/>

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

### Cloud library

<img src="../img/rsled/library.png"/>

When the lamp is linked to a ReefBeat cloud account (the cloud entry of the
integration), the editor offers the programs of its library, as the
ReefBeat app keeps them (G1: per aquarium; G2: per account, in their own
library):
choosing one loads it (a G1 program is shown in kelvin on a G2, a G2 one is
edited in kelvin on a G1 and saved as white/blue). Saved as is, the lamp gets
its name and its clouds, as with the ReefBeat app.

The programs are listed in two groups: the Red Sea ones (12K, 15K, 18K, 20K,
23K and RS Accelerated Growth on a G1; 15K, 23K, Shallow Reef and Deep Reef,
built into the app, on a G2) and yours. As in the app, a Red Sea program can
be loaded but neither updated nor deleted; one of yours can be deleted (🗑,
after a confirmation).

An edited program is saved in the library before it is sent to the lamp: the
card asks for its name, `prog-YYYYMMDDHHMM` by default. When it came from one
of your programs, the name is that program's and you choose between
**Update** (the library program is replaced) and **Save as new**. A virtual
LED uses the library of its first linked lamp.

> [!NOTE]
> The library needs ha-reefbeat-component with the `redsea.led_library`,
> `redsea.led_library_save` and `redsea.led_library_delete` services.

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
