# HA ReefBeat — Entity coverage report

_Generated on 2026-02-11 17:37_

## Summary

| Device            |   Total | ✅ Found | ⚪ Ignored | ❌ Missing | Coverage   |
| ----------------- | ------: | -------: | ---------: | ---------: | ---------- |
| **rsdose**        |      54 |       46 |          0 |          8 | 🟡 85%     |
| **rsled_g1**      |      40 |        0 |          0 |         40 | 🔴 0%      |
| **rsled_g2**      |      39 |        0 |          0 |         39 | 🔴 0%      |
| **rsled_virtual** |      21 |        0 |          0 |         21 | 🔴 0%      |
| **rsato**         |      44 |       12 |          0 |         32 | 🔴 27%     |
| **rsrun**         |      41 |       12 |          0 |         29 | 🔴 29%     |
| **rswave**        |      40 |       12 |          0 |         28 | 🔴 30%     |
| **rsmat**         |      36 |       12 |          0 |         24 | 🔴 33%     |
| **TOTAL**         | **315** |   **94** |      **0** |    **221** | 🔴 **30%** |

## Detail by device

### 🔴 RSDOSE

| Platform           | Total | ✅ Found | ⚪ Ignored | ❌ Missing |
| ------------------ | ----: | -------: | ---------: | ---------: |
| ❌ `binary_sensor` |     4 |        3 |          0 |          1 |
| ❌ `button`        |    12 |        9 |          0 |          3 |
| ✅ `number`        |     7 |        7 |          0 |          0 |
| ✅ `select`        |     1 |        1 |          0 |          0 |
| ❌ `sensor`        |    19 |       17 |          0 |          2 |
| ✅ `switch`        |     6 |        6 |          0 |          0 |
| ✅ `text`          |     3 |        3 |          0 |          0 |
| ❌ `time`          |     1 |        0 |          0 |          1 |
| ❌ `update`        |     1 |        0 |          0 |          1 |

<details>
<summary>❌ Missing entities (8)</summary>

| Platform        | Entity key               |
| --------------- | ------------------------ |
| `binary_sensor` | `recalibration_required` |
| `button`        | `fetch_config`           |
| `button`        | `firmware_update`        |
| `button`        | `reset`                  |
| `sensor`        | `last_calibration`       |
| `sensor`        | `mode`                   |
| `time`          | `schedule_time`          |
| `update`        | `firmware_update`        |

</details>

### 🔴 RSLED_G1

| Platform           | Total | ✅ Found | ⚪ Ignored | ❌ Missing |
| ------------------ | ----: | -------: | ---------: | ---------: |
| ❌ `binary_sensor` |     3 |        0 |          0 |          3 |
| ❌ `button`        |     4 |        0 |          0 |          4 |
| ❌ `light`         |     4 |        0 |          0 |          4 |
| ❌ `number`        |     4 |        0 |          0 |          4 |
| ❌ `select`        |     1 |        0 |          0 |          1 |
| ❌ `sensor`        |    16 |        0 |          0 |         16 |
| ❌ `switch`        |     6 |        0 |          0 |          6 |
| ❌ `time`          |     1 |        0 |          0 |          1 |
| ❌ `update`        |     1 |        0 |          0 |          1 |

<details>
<summary>❌ Missing entities (40)</summary>

| Platform        | Entity key                           |
| --------------- | ------------------------------------ |
| `binary_sensor` | `battery_level`                      |
| `binary_sensor` | `cloud_state`                        |
| `binary_sensor` | `status`                             |
| `button`        | `fetch_config`                       |
| `button`        | `firmware_update`                    |
| `button`        | `led_identify`                       |
| `button`        | `reset`                              |
| `light`         | `blue`                               |
| `light`         | `kelvin_intensity`                   |
| `light`         | `moon`                               |
| `light`         | `white`                              |
| `number`        | `acclimation_duration`               |
| `number`        | `acclimation_start_intensity_factor` |
| `number`        | `manual_duration`                    |
| `number`        | `moon_day`                           |
| `select`        | `mode`                               |
| `sensor`        | `acclimation_duration`               |
| `sensor`        | `acclimation_start_intensity_factor` |
| `sensor`        | `cloud_account`                      |
| `sensor`        | `fan`                                |
| `sensor`        | `ip`                                 |
| `sensor`        | `last_alert_message`                 |
| `sensor`        | `last_message`                       |
| `sensor`        | `mode`                               |
| `sensor`        | `moon_intensity`                     |
| `sensor`        | `next_full_moon`                     |
| `sensor`        | `next_new_moon`                      |
| `sensor`        | `temperature`                        |
| `sensor`        | `todays_moon_day`                    |
| `sensor`        | `wifi_quality`                       |
| `sensor`        | `wifi_signal`                        |
| `sensor`        | `wifi_ssid`                          |
| `switch`        | `acclimation`                        |
| `switch`        | `cloud_connect`                      |
| `switch`        | `device_state`                       |
| `switch`        | `maintenance`                        |
| `switch`        | `moon_phase`                         |
| `switch`        | `use_cloud_api`                      |
| `time`          | `schedule_time`                      |
| `update`        | `firmware_update`                    |

</details>

### 🔴 RSLED_G2

| Platform           | Total | ✅ Found | ⚪ Ignored | ❌ Missing |
| ------------------ | ----: | -------: | ---------: | ---------: |
| ❌ `binary_sensor` |     2 |        0 |          0 |          2 |
| ❌ `button`        |     4 |        0 |          0 |          4 |
| ❌ `light`         |     2 |        0 |          0 |          2 |
| ❌ `number`        |     4 |        0 |          0 |          4 |
| ❌ `select`        |     1 |        0 |          0 |          1 |
| ❌ `sensor`        |    18 |        0 |          0 |         18 |
| ❌ `switch`        |     6 |        0 |          0 |          6 |
| ❌ `time`          |     1 |        0 |          0 |          1 |
| ❌ `update`        |     1 |        0 |          0 |          1 |

<details>
<summary>❌ Missing entities (39)</summary>

| Platform        | Entity key                           |
| --------------- | ------------------------------------ |
| `binary_sensor` | `cloud_state`                        |
| `binary_sensor` | `status`                             |
| `button`        | `fetch_config`                       |
| `button`        | `firmware_update`                    |
| `button`        | `led_identify`                       |
| `button`        | `reset`                              |
| `light`         | `kelvin_intensity`                   |
| `light`         | `moon`                               |
| `number`        | `acclimation_duration`               |
| `number`        | `acclimation_start_intensity_factor` |
| `number`        | `manual_duration`                    |
| `number`        | `moon_day`                           |
| `select`        | `mode`                               |
| `sensor`        | `acclimation_duration`               |
| `sensor`        | `acclimation_start_intensity_factor` |
| `sensor`        | `blue`                               |
| `sensor`        | `cloud_account`                      |
| `sensor`        | `fan`                                |
| `sensor`        | `ip`                                 |
| `sensor`        | `last_alert_message`                 |
| `sensor`        | `last_message`                       |
| `sensor`        | `mode`                               |
| `sensor`        | `moon_intensity`                     |
| `sensor`        | `next_full_moon`                     |
| `sensor`        | `next_new_moon`                      |
| `sensor`        | `temperature`                        |
| `sensor`        | `todays_moon_day`                    |
| `sensor`        | `white`                              |
| `sensor`        | `wifi_quality`                       |
| `sensor`        | `wifi_signal`                        |
| `sensor`        | `wifi_ssid`                          |
| `switch`        | `acclimation`                        |
| `switch`        | `cloud_connect`                      |
| `switch`        | `device_state`                       |
| `switch`        | `maintenance`                        |
| `switch`        | `moon_phase`                         |
| `switch`        | `use_cloud_api`                      |
| `time`          | `schedule_time`                      |
| `update`        | `firmware_update`                    |

</details>

### 🔴 RSLED_VIRTUAL

| Platform           | Total | ✅ Found | ⚪ Ignored | ❌ Missing |
| ------------------ | ----: | -------: | ---------: | ---------: |
| ❌ `binary_sensor` |     2 |        0 |          0 |          2 |
| ❌ `button`        |     1 |        0 |          0 |          1 |
| ❌ `light`         |     4 |        0 |          0 |          4 |
| ❌ `number`        |     4 |        0 |          0 |          4 |
| ❌ `select`        |     1 |        0 |          0 |          1 |
| ❌ `sensor`        |     3 |        0 |          0 |          3 |
| ❌ `switch`        |     5 |        0 |          0 |          5 |
| ❌ `time`          |     1 |        0 |          0 |          1 |

<details>
<summary>❌ Missing entities (21)</summary>

| Platform        | Entity key                           |
| --------------- | ------------------------------------ |
| `binary_sensor` | `cloud_state`                        |
| `binary_sensor` | `status`                             |
| `button`        | `fetch_config`                       |
| `light`         | `blue`                               |
| `light`         | `kelvin_intensity`                   |
| `light`         | `moon`                               |
| `light`         | `white`                              |
| `number`        | `acclimation_duration`               |
| `number`        | `acclimation_start_intensity_factor` |
| `number`        | `manual_duration`                    |
| `number`        | `moon_day`                           |
| `select`        | `mode`                               |
| `sensor`        | `blue`                               |
| `sensor`        | `cloud_account`                      |
| `sensor`        | `white`                              |
| `switch`        | `acclimation`                        |
| `switch`        | `cloud_connect`                      |
| `switch`        | `device_state`                       |
| `switch`        | `maintenance`                        |
| `switch`        | `moon_phase`                         |
| `time`          | `schedule_time`                      |

</details>

### 🔴 RSATO

| Platform           | Total | ✅ Found | ⚪ Ignored | ❌ Missing |
| ------------------ | ----: | -------: | ---------: | ---------: |
| ❌ `binary_sensor` |     9 |        1 |          0 |          8 |
| ❌ `button`        |     6 |        0 |          0 |          6 |
| ❌ `number`        |     1 |        0 |          0 |          1 |
| ❌ `sensor`        |    21 |        7 |          0 |         14 |
| ❌ `switch`        |     5 |        4 |          0 |          1 |
| ❌ `time`          |     1 |        0 |          0 |          1 |
| ❌ `update`        |     1 |        0 |          0 |          1 |

<details>
<summary>❌ Missing entities (32)</summary>

| Platform        | Entity key                 |
| --------------- | -------------------------- |
| `binary_sensor` | `buzzer_enabled`           |
| `binary_sensor` | `connected`                |
| `binary_sensor` | `enabled`                  |
| `binary_sensor` | `is_pump_on`               |
| `binary_sensor` | `is_sensor_error`          |
| `binary_sensor` | `is_temp_enabled`          |
| `binary_sensor` | `status`                   |
| `binary_sensor` | `water_level`              |
| `button`        | `fetch_config`             |
| `button`        | `fill`                     |
| `button`        | `firmware_update`          |
| `button`        | `reset`                    |
| `button`        | `resume`                   |
| `button`        | `stop_fill`                |
| `number`        | `ato_volume_left`          |
| `sensor`        | `ato_mode`                 |
| `sensor`        | `current_level`            |
| `sensor`        | `current_read`             |
| `sensor`        | `daily_fills_average`      |
| `sensor`        | `daily_volume_average`     |
| `sensor`        | `mode`                     |
| `sensor`        | `pump_state`               |
| `sensor`        | `temperature_probe_status` |
| `sensor`        | `today_fills`              |
| `sensor`        | `today_volume_usage`       |
| `sensor`        | `total_fills`              |
| `sensor`        | `total_volume_usage`       |
| `sensor`        | `volume_left`              |
| `sensor`        | `water_level`              |
| `switch`        | `auto_fill`                |
| `time`          | `schedule_time`            |
| `update`        | `firmware_update`          |

</details>

### 🔴 RSRUN

| Platform           | Total | ✅ Found | ⚪ Ignored | ❌ Missing |
| ------------------ | ----: | -------: | ---------: | ---------: |
| ❌ `binary_sensor` |     8 |        1 |          0 |          7 |
| ❌ `button`        |     7 |        0 |          0 |          7 |
| ❌ `number`        |     3 |        0 |          0 |          3 |
| ❌ `select`        |     1 |        0 |          0 |          1 |
| ❌ `sensor`        |    13 |        7 |          0 |          6 |
| ❌ `switch`        |     7 |        4 |          0 |          3 |
| ❌ `time`          |     1 |        0 |          0 |          1 |
| ❌ `update`        |     1 |        0 |          0 |          1 |

<details>
<summary>❌ Missing entities (29)</summary>

| Platform        | Entity key               |
| --------------- | ------------------------ |
| `binary_sensor` | `battery_level`          |
| `binary_sensor` | `constant_speed`         |
| `binary_sensor` | `ec_sensor_connected`    |
| `binary_sensor` | `missing_pump`           |
| `binary_sensor` | `missing_sensor`         |
| `binary_sensor` | `schedule_enabled`       |
| `binary_sensor` | `sensor_controlled`      |
| `button`        | `delete_emergency`       |
| `button`        | `fetch_config`           |
| `button`        | `firmware_update`        |
| `button`        | `preview_save`           |
| `button`        | `preview_start`          |
| `button`        | `preview_stop`           |
| `button`        | `reset`                  |
| `number`        | `overskimming_threshold` |
| `number`        | `preview_speed`          |
| `number`        | `speed`                  |
| `select`        | `model`                  |
| `sensor`        | `mode`                   |
| `sensor`        | `model`                  |
| `sensor`        | `name`                   |
| `sensor`        | `state`                  |
| `sensor`        | `temperature`            |
| `sensor`        | `type`                   |
| `switch`        | `fullcup_enabled`        |
| `switch`        | `overskimming_enabled`   |
| `switch`        | `schedule_enabled`       |
| `time`          | `schedule_time`          |
| `update`        | `firmware_update`        |

</details>

### 🔴 RSWAVE

| Platform           | Total | ✅ Found | ⚪ Ignored | ❌ Missing |
| ------------------ | ----: | -------: | ---------: | ---------: |
| ✅ `binary_sensor` |     1 |        1 |          0 |          0 |
| ❌ `button`        |     7 |        0 |          0 |          7 |
| ❌ `number`        |     8 |        0 |          0 |          8 |
| ❌ `select`        |     2 |        0 |          0 |          2 |
| ❌ `sensor`        |    16 |        7 |          0 |          9 |
| ✅ `switch`        |     4 |        4 |          0 |          0 |
| ❌ `time`          |     1 |        0 |          0 |          1 |
| ❌ `update`        |     1 |        0 |          0 |          1 |

<details>
<summary>❌ Missing entities (28)</summary>

| Platform | Entity key                   |
| -------- | ---------------------------- |
| `button` | `fetch_config`               |
| `button` | `firmware_update`            |
| `button` | `preview_save`               |
| `button` | `preview_set_from_current`   |
| `button` | `preview_start`              |
| `button` | `preview_stop`               |
| `button` | `reset`                      |
| `number` | `shortcut_off_delay`         |
| `number` | `wave_backward_intensity`    |
| `number` | `wave_backward_time`         |
| `number` | `wave_forward_intensity`     |
| `number` | `wave_forward_time`          |
| `number` | `wave_preview_duration`      |
| `number` | `wave_preview_step`          |
| `number` | `wave_preview_wave_duration` |
| `select` | `preview_wave_direction`     |
| `select` | `preview_wave_type`          |
| `sensor` | `mode`                       |
| `sensor` | `name`                       |
| `sensor` | `wave_backward_intensity`    |
| `sensor` | `wave_backward_time`         |
| `sensor` | `wave_direction`             |
| `sensor` | `wave_forward_intensity`     |
| `sensor` | `wave_forward_time`          |
| `sensor` | `wave_step`                  |
| `sensor` | `wave_type`                  |
| `time`   | `schedule_time`              |
| `update` | `firmware_update`            |

</details>

### 🔴 RSMAT

| Platform           | Total | ✅ Found | ⚪ Ignored | ❌ Missing |
| ------------------ | ----: | -------: | ---------: | ---------: |
| ❌ `binary_sensor` |     3 |        1 |          0 |          2 |
| ❌ `button`        |     6 |        0 |          0 |          6 |
| ❌ `number`        |     3 |        0 |          0 |          3 |
| ❌ `select`        |     2 |        0 |          0 |          2 |
| ❌ `sensor`        |    14 |        7 |          0 |          7 |
| ❌ `switch`        |     6 |        4 |          0 |          2 |
| ❌ `time`          |     1 |        0 |          0 |          1 |
| ❌ `update`        |     1 |        0 |          0 |          1 |

<details>
<summary>❌ Missing entities (24)</summary>

| Platform        | Entity key               |
| --------------- | ------------------------ |
| `binary_sensor` | `is_ec_sensor_connected` |
| `binary_sensor` | `unclean_sensor`         |
| `button`        | `advance`                |
| `button`        | `delete_emergency`       |
| `button`        | `fetch_config`           |
| `button`        | `firmware_update`        |
| `button`        | `new_roll`               |
| `button`        | `reset`                  |
| `number`        | `custom_advance_value`   |
| `number`        | `schedule_length`        |
| `number`        | `started_roll_diameter`  |
| `select`        | `model`                  |
| `select`        | `position`               |
| `sensor`        | `daily_average_usage`    |
| `sensor`        | `days_till_end_of_roll`  |
| `sensor`        | `mode`                   |
| `sensor`        | `model`                  |
| `sensor`        | `remaining_length`       |
| `sensor`        | `today_usage`            |
| `sensor`        | `total_usage`            |
| `switch`        | `auto_advance`           |
| `switch`        | `scheduled_advance`      |
| `time`          | `schedule_time`          |
| `update`        | `firmware_update`        |

</details>
