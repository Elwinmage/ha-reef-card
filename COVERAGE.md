# HA ReefBeat — Entity coverage report

*Generated on 2026-02-26 13:43*

## Summary

| Device | Total | ✅ Found | ⚪ Ignored | ❌ Missing | Coverage |
|--------|------:|---------:|----------:|----------:|----------|
| **rsdose** | 55 | 55 | 0 | 0 | 🟢 100% |
| **rsled_g1** | 39 | 0 | 1 | 38 | 🔴 0% |
| **rsled_g2** | 38 | 0 | 1 | 37 | 🔴 0% |
| **rsled_virtual** | 20 | 0 | 0 | 20 | 🔴 0% |
| **rsato** | 42 | 12 | 1 | 29 | 🔴 29% |
| **rsrun** | 40 | 12 | 1 | 27 | 🔴 30% |
| **rswave** | 39 | 12 | 1 | 26 | 🔴 31% |
| **rsmat** | 36 | 12 | 1 | 23 | 🔴 33% |
| **TOTAL** | **309** | **103** | **6** | **200** | 🔴 **33%** |

## Detail by device

### 🟢 RSDOSE

| Platform | Total | ✅ Found | ⚪ Ignored | ❌ Missing |
|----------|------:|---------:|----------:|----------:|
| ✅ `binary_sensor` | 4 | 4 | 0 | 0 |
| ✅ `button` | 13 | 13 | 0 | 0 |
| ✅ `number` | 7 | 7 | 0 | 0 |
| ✅ `select` | 1 | 1 | 0 | 0 |
| ✅ `sensor` | 19 | 19 | 0 | 0 |
| ✅ `switch` | 6 | 6 | 0 | 0 |
| ✅ `text` | 4 | 4 | 0 | 0 |
| ✅ `update` | 1 | 1 | 0 | 0 |

### 🔴 RSLED_G1

| Platform | Total | ✅ Found | ⚪ Ignored | ❌ Missing |
|----------|------:|---------:|----------:|----------:|
| ❌ `binary_sensor` | 3 | 0 | 0 | 3 |
| ❌ `button` | 4 | 0 | 1 | 3 |
| ❌ `light` | 4 | 0 | 0 | 4 |
| ❌ `number` | 4 | 0 | 0 | 4 |
| ❌ `select` | 1 | 0 | 0 | 1 |
| ❌ `sensor` | 16 | 0 | 0 | 16 |
| ❌ `switch` | 6 | 0 | 0 | 6 |
| ❌ `update` | 1 | 0 | 0 | 1 |

<details>
<summary>❌ Missing entities (38)</summary>

| Platform | Entity key |
|----------|------------|
| `binary_sensor` | `battery_level` |
| `binary_sensor` | `cloud_state` |
| `binary_sensor` | `status` |
| `button` | `fetch_config` |
| `button` | `led_identify` |
| `button` | `reset` |
| `light` | `blue` |
| `light` | `kelvin_intensity` |
| `light` | `moon` |
| `light` | `white` |
| `number` | `acclimation_duration` |
| `number` | `acclimation_start_intensity_factor` |
| `number` | `manual_duration` |
| `number` | `moon_day` |
| `select` | `mode` |
| `sensor` | `acclimation_duration` |
| `sensor` | `acclimation_start_intensity_factor` |
| `sensor` | `cloud_account` |
| `sensor` | `fan` |
| `sensor` | `ip` |
| `sensor` | `last_alert_message` |
| `sensor` | `last_message` |
| `sensor` | `mode` |
| `sensor` | `moon_intensity` |
| `sensor` | `next_full_moon` |
| `sensor` | `next_new_moon` |
| `sensor` | `temperature` |
| `sensor` | `todays_moon_day` |
| `sensor` | `wifi_quality` |
| `sensor` | `wifi_signal` |
| `sensor` | `wifi_ssid` |
| `switch` | `acclimation` |
| `switch` | `cloud_connect` |
| `switch` | `device_state` |
| `switch` | `maintenance` |
| `switch` | `moon_phase` |
| `switch` | `use_cloud_api` |
| `update` | `firmware_update` |

</details>

<details>
<summary>⚪ Ignored entities (1)</summary>

| Platform | Entity key |
|----------|------------|
| `button` | `firmware_update` |

</details>

### 🔴 RSLED_G2

| Platform | Total | ✅ Found | ⚪ Ignored | ❌ Missing |
|----------|------:|---------:|----------:|----------:|
| ❌ `binary_sensor` | 2 | 0 | 0 | 2 |
| ❌ `button` | 4 | 0 | 1 | 3 |
| ❌ `light` | 2 | 0 | 0 | 2 |
| ❌ `number` | 4 | 0 | 0 | 4 |
| ❌ `select` | 1 | 0 | 0 | 1 |
| ❌ `sensor` | 18 | 0 | 0 | 18 |
| ❌ `switch` | 6 | 0 | 0 | 6 |
| ❌ `update` | 1 | 0 | 0 | 1 |

<details>
<summary>❌ Missing entities (37)</summary>

| Platform | Entity key |
|----------|------------|
| `binary_sensor` | `cloud_state` |
| `binary_sensor` | `status` |
| `button` | `fetch_config` |
| `button` | `led_identify` |
| `button` | `reset` |
| `light` | `kelvin_intensity` |
| `light` | `moon` |
| `number` | `acclimation_duration` |
| `number` | `acclimation_start_intensity_factor` |
| `number` | `manual_duration` |
| `number` | `moon_day` |
| `select` | `mode` |
| `sensor` | `acclimation_duration` |
| `sensor` | `acclimation_start_intensity_factor` |
| `sensor` | `blue` |
| `sensor` | `cloud_account` |
| `sensor` | `fan` |
| `sensor` | `ip` |
| `sensor` | `last_alert_message` |
| `sensor` | `last_message` |
| `sensor` | `mode` |
| `sensor` | `moon_intensity` |
| `sensor` | `next_full_moon` |
| `sensor` | `next_new_moon` |
| `sensor` | `temperature` |
| `sensor` | `todays_moon_day` |
| `sensor` | `white` |
| `sensor` | `wifi_quality` |
| `sensor` | `wifi_signal` |
| `sensor` | `wifi_ssid` |
| `switch` | `acclimation` |
| `switch` | `cloud_connect` |
| `switch` | `device_state` |
| `switch` | `maintenance` |
| `switch` | `moon_phase` |
| `switch` | `use_cloud_api` |
| `update` | `firmware_update` |

</details>

<details>
<summary>⚪ Ignored entities (1)</summary>

| Platform | Entity key |
|----------|------------|
| `button` | `firmware_update` |

</details>

### 🔴 RSLED_VIRTUAL

| Platform | Total | ✅ Found | ⚪ Ignored | ❌ Missing |
|----------|------:|---------:|----------:|----------:|
| ❌ `binary_sensor` | 2 | 0 | 0 | 2 |
| ❌ `button` | 1 | 0 | 0 | 1 |
| ❌ `light` | 4 | 0 | 0 | 4 |
| ❌ `number` | 4 | 0 | 0 | 4 |
| ❌ `select` | 1 | 0 | 0 | 1 |
| ❌ `sensor` | 3 | 0 | 0 | 3 |
| ❌ `switch` | 5 | 0 | 0 | 5 |

<details>
<summary>❌ Missing entities (20)</summary>

| Platform | Entity key |
|----------|------------|
| `binary_sensor` | `cloud_state` |
| `binary_sensor` | `status` |
| `button` | `fetch_config` |
| `light` | `blue` |
| `light` | `kelvin_intensity` |
| `light` | `moon` |
| `light` | `white` |
| `number` | `acclimation_duration` |
| `number` | `acclimation_start_intensity_factor` |
| `number` | `manual_duration` |
| `number` | `moon_day` |
| `select` | `mode` |
| `sensor` | `blue` |
| `sensor` | `cloud_account` |
| `sensor` | `white` |
| `switch` | `acclimation` |
| `switch` | `cloud_connect` |
| `switch` | `device_state` |
| `switch` | `maintenance` |
| `switch` | `moon_phase` |

</details>

### 🔴 RSATO

| Platform | Total | ✅ Found | ⚪ Ignored | ❌ Missing |
|----------|------:|---------:|----------:|----------:|
| ❌ `binary_sensor` | 9 | 1 | 0 | 8 |
| ❌ `button` | 6 | 0 | 1 | 5 |
| ❌ `number` | 1 | 0 | 0 | 1 |
| ❌ `sensor` | 20 | 7 | 0 | 13 |
| ❌ `switch` | 5 | 4 | 0 | 1 |
| ❌ `update` | 1 | 0 | 0 | 1 |

<details>
<summary>❌ Missing entities (29)</summary>

| Platform | Entity key |
|----------|------------|
| `binary_sensor` | `buzzer_enabled` |
| `binary_sensor` | `connected` |
| `binary_sensor` | `enabled` |
| `binary_sensor` | `is_pump_on` |
| `binary_sensor` | `is_sensor_error` |
| `binary_sensor` | `is_temp_enabled` |
| `binary_sensor` | `status` |
| `binary_sensor` | `water_level` |
| `button` | `fetch_config` |
| `button` | `fill` |
| `button` | `reset` |
| `button` | `resume` |
| `button` | `stop_fill` |
| `number` | `ato_volume_left` |
| `sensor` | `current_level` |
| `sensor` | `current_read` |
| `sensor` | `daily_fills_average` |
| `sensor` | `daily_volume_average` |
| `sensor` | `mode` |
| `sensor` | `pump_state` |
| `sensor` | `temperature_probe_status` |
| `sensor` | `today_fills` |
| `sensor` | `today_volume_usage` |
| `sensor` | `total_fills` |
| `sensor` | `total_volume_usage` |
| `sensor` | `volume_left` |
| `sensor` | `water_level` |
| `switch` | `auto_fill` |
| `update` | `firmware_update` |

</details>

<details>
<summary>⚪ Ignored entities (1)</summary>

| Platform | Entity key |
|----------|------------|
| `button` | `firmware_update` |

</details>

### 🔴 RSRUN

| Platform | Total | ✅ Found | ⚪ Ignored | ❌ Missing |
|----------|------:|---------:|----------:|----------:|
| ❌ `binary_sensor` | 8 | 1 | 0 | 7 |
| ❌ `button` | 7 | 0 | 1 | 6 |
| ❌ `number` | 3 | 0 | 0 | 3 |
| ❌ `select` | 1 | 0 | 0 | 1 |
| ❌ `sensor` | 13 | 7 | 0 | 6 |
| ❌ `switch` | 7 | 4 | 0 | 3 |
| ❌ `update` | 1 | 0 | 0 | 1 |

<details>
<summary>❌ Missing entities (27)</summary>

| Platform | Entity key |
|----------|------------|
| `binary_sensor` | `battery_level` |
| `binary_sensor` | `constant_speed` |
| `binary_sensor` | `ec_sensor_connected` |
| `binary_sensor` | `missing_pump` |
| `binary_sensor` | `missing_sensor` |
| `binary_sensor` | `schedule_enabled` |
| `binary_sensor` | `sensor_controlled` |
| `button` | `delete_emergency` |
| `button` | `fetch_config` |
| `button` | `preview_save` |
| `button` | `preview_start` |
| `button` | `preview_stop` |
| `button` | `reset` |
| `number` | `overskimming_threshold` |
| `number` | `preview_speed` |
| `number` | `speed` |
| `select` | `model` |
| `sensor` | `mode` |
| `sensor` | `model` |
| `sensor` | `name` |
| `sensor` | `state` |
| `sensor` | `temperature` |
| `sensor` | `type` |
| `switch` | `fullcup_enabled` |
| `switch` | `overskimming_enabled` |
| `switch` | `schedule_enabled` |
| `update` | `firmware_update` |

</details>

<details>
<summary>⚪ Ignored entities (1)</summary>

| Platform | Entity key |
|----------|------------|
| `button` | `firmware_update` |

</details>

### 🔴 RSWAVE

| Platform | Total | ✅ Found | ⚪ Ignored | ❌ Missing |
|----------|------:|---------:|----------:|----------:|
| ✅ `binary_sensor` | 1 | 1 | 0 | 0 |
| ❌ `button` | 7 | 0 | 1 | 6 |
| ❌ `number` | 8 | 0 | 0 | 8 |
| ❌ `select` | 2 | 0 | 0 | 2 |
| ❌ `sensor` | 16 | 7 | 0 | 9 |
| ✅ `switch` | 4 | 4 | 0 | 0 |
| ❌ `update` | 1 | 0 | 0 | 1 |

<details>
<summary>❌ Missing entities (26)</summary>

| Platform | Entity key |
|----------|------------|
| `button` | `fetch_config` |
| `button` | `preview_save` |
| `button` | `preview_set_from_current` |
| `button` | `preview_start` |
| `button` | `preview_stop` |
| `button` | `reset` |
| `number` | `shortcut_off_delay` |
| `number` | `wave_backward_intensity` |
| `number` | `wave_backward_time` |
| `number` | `wave_forward_intensity` |
| `number` | `wave_forward_time` |
| `number` | `wave_preview_duration` |
| `number` | `wave_preview_step` |
| `number` | `wave_preview_wave_duration` |
| `select` | `preview_wave_direction` |
| `select` | `preview_wave_type` |
| `sensor` | `mode` |
| `sensor` | `name` |
| `sensor` | `wave_backward_intensity` |
| `sensor` | `wave_backward_time` |
| `sensor` | `wave_direction` |
| `sensor` | `wave_forward_intensity` |
| `sensor` | `wave_forward_time` |
| `sensor` | `wave_step` |
| `sensor` | `wave_type` |
| `update` | `firmware_update` |

</details>

<details>
<summary>⚪ Ignored entities (1)</summary>

| Platform | Entity key |
|----------|------------|
| `button` | `firmware_update` |

</details>

### 🔴 RSMAT

| Platform | Total | ✅ Found | ⚪ Ignored | ❌ Missing |
|----------|------:|---------:|----------:|----------:|
| ❌ `binary_sensor` | 3 | 1 | 0 | 2 |
| ❌ `button` | 6 | 0 | 1 | 5 |
| ❌ `number` | 3 | 0 | 0 | 3 |
| ❌ `select` | 2 | 0 | 0 | 2 |
| ❌ `sensor` | 14 | 7 | 0 | 7 |
| ❌ `switch` | 6 | 4 | 0 | 2 |
| ❌ `time` | 1 | 0 | 0 | 1 |
| ❌ `update` | 1 | 0 | 0 | 1 |

<details>
<summary>❌ Missing entities (23)</summary>

| Platform | Entity key |
|----------|------------|
| `binary_sensor` | `is_ec_sensor_connected` |
| `binary_sensor` | `unclean_sensor` |
| `button` | `advance` |
| `button` | `delete_emergency` |
| `button` | `fetch_config` |
| `button` | `new_roll` |
| `button` | `reset` |
| `number` | `custom_advance_value` |
| `number` | `schedule_length` |
| `number` | `started_roll_diameter` |
| `select` | `model` |
| `select` | `position` |
| `sensor` | `daily_average_usage` |
| `sensor` | `days_till_end_of_roll` |
| `sensor` | `mode` |
| `sensor` | `model` |
| `sensor` | `remaining_length` |
| `sensor` | `today_usage` |
| `sensor` | `total_usage` |
| `switch` | `auto_advance` |
| `switch` | `scheduled_advance` |
| `time` | `schedule_time` |
| `update` | `firmware_update` |

</details>

<details>
<summary>⚪ Ignored entities (1)</summary>

| Platform | Entity key |
|----------|------------|
| `button` | `firmware_update` |

</details>
