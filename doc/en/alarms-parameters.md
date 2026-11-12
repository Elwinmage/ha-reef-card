[← Back to the main page](../../README.md)

# Common alarm and water parameters

Two small cards come with the reef card. They need no device selection.

## Common alarm (`custom:reef-alarms-card`)

One indicator for every alarm of the reef: green **OK** while nothing is wrong, red with the number of alarms as soon as one is on. A tap lists the alarms in progress, with their device and since when; a tap on one opens its entity.

An alarm is a binary sensor of a reef integration (redsea, aquamedic, reeftank, reef_maintenance) whose device class tells a problem (problem, safety, moisture for a leak, battery for a low battery…) and which is on.

```yaml
type: custom:reef-alarms-card
title: Aquarium # optional
entities: # more alarms, from any integration
  - binary_sensor.sump_float
exclude: # alarms not to show
  - binary_sensor.reefdose_head_3_regulation_alarm
integrations: [redsea, reeftank] # optional, default: the reef integrations
device_classes: [problem, moisture] # optional
```

On an [aquarium view](aquarium.md), the scene editor adds it with **+ Common alarm** (Elements tab): a marker you place anywhere on the picture (needs reeftank with the `alarms` role).

## Water parameters (`custom:reef-parameters-card`)

One chart per parameter followed (KH, Ca, Mg, Fe…), drawn over its green (desired), orange (acceptable) and red (danger) zones; the last value takes the colour of its zone.

Without `parameters`, the card follows every ReefDose head in assisted dosing. For the heads, the chart is drawn from the results the integration keeps, and the ✎ button opens them to add one at a past date, correct or delete one. Any other entity (a test logged by an automation, an ICP result…) is drawn from the recorder.

```yaml
type: custom:reef-parameters-card
title: Water tests # optional
days: 90 # window of the charts (default 90)
parameters:
  - parameter: kh
    entity: sensor.reefdose_head_1_last_test_result
  - parameter: fe
    entity: sensor.iron_tests
    name: Iron
    ranges: [0.002, 0.005, 0.02, 0.05] # acceptable low, desired low, desired high, acceptable high
```

`ranges` are optional for `kh ca mg k no3 po4 i fe salinity ph`, which have usual zones; the `ranges` attribute of the entity wins when it has one.
