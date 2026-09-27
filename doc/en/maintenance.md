[← Back to the main page](../../README.md)

# Maintenance

The maintenance view of ha-reef-card in action:

[![Watch the video](https://img.youtube.com/vi/Ko46fHonOP4/0.jpg)](https://www.youtube.com/watch?v=Ko46fHonOP4)

<img src="../img/maintenance/overview.png"/>

Beyond the per-device views, the card offers a **Maintenance** view that gathers
every maintenance task exposed by `ha-reefbeat-component`,
`ha-reef-maintenance-component` and `ha-aquamedic-component` as if the whole
maintenance subsystem were a single device. The view looks for the marker any of
them puts on its entities, not for a particular integration.

Each task is displayed as a progress bar showing how much of its interval has
elapsed, with a color driven by the remaining time:

| Color  | Meaning                                               |
| ------ | ----------------------------------------------------- |
| Green  | Up to date                                            |
| Orange | Due soon (last 20% of the interval, at least one day) |
| Red    | Overdue, the label switches to `+X d`                 |
| Grey   | Never done yet (no reset recorded)                    |

Tasks can be sorted **by equipment** (grouped, with one header per device) or
**by due date** (a flat list, the most urgent first). Never-done tasks are
always listed last. Two filters sit in the toolbar: a checkbox hiding tasks that are still up to
date, and a **Hide muted / Show muted** button hiding the tasks whose
notification switch is off. The button starts in the "show" position, so
silencing an alert never makes a deadline disappear on its own. That default is
configurable from the card editor (or with `hide_muted` below), and the button
still overrides it at any time.

Clicking a row opens the Home Assistant more-info dialog of the task, and the
round button on the right marks the task as done (it presses the underlying
button entity, exactly like the more-info dialog would).

The view only appears in the device selector when at least one maintenance task
exists in your installation. New tasks added to the integration catalogue show
up automatically, no card update needed.

### Notifications

Each task also gets a **notification switch** in the integration
(`switch.*_notify`, shown as "<task name> (notifications)"). Turning it off
mutes the overdue alert of that single task without touching its schedule: the
progress bar keeps running, the row simply dims and the bell turns off.

The bell on the right of each row toggles that switch directly. It is only
shown when the integration exposes the switch. Set `show_notify: false` to hide
the bells.

The alert blueprint reads the very same setting, so muting a task in the card
also silences the automation.

### Changing the interval

The calendar button on each row expands an inline slider that writes to the
task's interval number entity. The slider works in the unit the integration
advertises for that task (days, weeks or months, read from the entity's role),
and the integration converts back to days before storing. Bounds come from the
entity itself, so the card can never write an out-of-range value. Only one
editor stays open at a time. Set `show_interval: false` to hide the buttons.

### Filtering by device

By default the view lists the tasks of every device. The **Filter by device**
block of the card editor restricts it to a subset: tick one or more devices and
only their tasks are kept, counters included.

<img src="../img/maintenance/editor_devices.png"/>

The list holds one entry per controller, with the number of tasks it owns.
Sub-devices (ReefDose heads, ReefRun pumps) are folded into their controller
through the `via_device` link of the Home Assistant registry, so ticking
**RSDose4** keeps the tasks of all four heads. Nothing ticked means "no filter":
every device is shown, which is also what the **Show every device** shortcut
restores.

The selection is stored as device names (see `devices` below), so the YAML stays
readable. A name written by hand also matches its sub-devices by prefix, which
covers the setups where `via_device` is not declared. Devices without a name fall
back to their Home Assistant device id.

### ReefRun pumps

ReefRun sub-devices are named "… pump 1" / "… pump 2", which says nothing about
what each pump actually is. When the device exposes both a `type` and a `model`
sensor, the card appends them in parentheses: **ReefRun pump 1 (return 12000)**,
**ReefRun pump 2 (skimmer 900)**.

The type is localized, and only the trailing figure of the model is kept
(`return-12000` -> `12000`, `rsk-900` -> `900`) since the prefix is either
redundant with the type or cryptic. Devices that are not pumps keep a plain
name.

## Icons

| Icon                                                                                                     | Role                                                                          |
| -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| <img src="../img/mdi/mdi_check.png" width="20"/>                                                         | **Task done.** Marks the task as performed and restarts its countdown.        |
| <img src="../img/mdi/mdi_bell-ring.png" width="20"/> <img src="../img/mdi/mdi_bell-off.png" width="20"/> | **Mute / unmute.** Toggles the notification switch of that single task.       |
| <img src="../img/mdi/mdi_calendar-edit.png" width="20"/>                                                 | **Change the interval.** Expands an inline slider bound to the task interval. |

## Editor

The default state of the filters, the device filter and the visibility of the
three buttons are set from the card editor.

<img src="../img/maintenance/editor.png"/>

## Configuration

```yaml
type: custom:reef-card
device: __maintenance__
maintenance:
  sort: due # "device" (default) or "due"
  devices: # only show the tasks of these devices (empty: all of them)
    - SIMU-RSDOSE4
    - SIMU-RSATO
  hide_ok: false # hide tasks that are neither overdue nor due soon
  hide_muted: false # hide tasks whose notifications are turned off
  warning_ratio: 0.2 # share of the interval displayed in orange
  show_reset: true # show the "mark as done" button on each row
  show_notify: true # show the mute/unmute bell on each row
  show_interval: true # show the interval editor button on each row
```

All `maintenance` keys are optional. `sort` and `hide_ok` only set the initial
state: the user can still change them from the view itself. `devices` accepts
device names as well as Home Assistant device ids; an empty list (the default)
disables the filter.

---

[← Back to the main page](../../README.md)
