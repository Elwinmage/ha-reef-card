[← Back to the main page](../../README.md)

# ReefDose

ReefDose with ha-reef-card in action:

[![Watch the video](https://img.youtube.com/vi/Qee5LH0T9wQ/0.jpg)](https://www.youtube.com/watch?v=Qee5LH0T9wQ)

The ReefDose card is divided into 6 zones:

1.  Configuration/WiFi Information
2.  States
3.  Manual Dosing
4.  Head configuration and scheduling
5.  Supplement management
6.  Future dose queue

<img src="../img/rsdose/rsdose4_ex1.png"/>

## Configuration/WiFi Information

<img src="../img/rsdose/zone_1.png"/>

---

<span >Click the icon <img src="../img/rsdose/cog_icon.png" width="30" /> to manage the general configuration of the ReefDose.</span>

<img src="../img/rsdose/zone_1_dialog_config.png"/>

<span>Click the icon <img width="30px" src="../img/rsdose/wifi_icon.png"/> to manage the network settings.</span>

<img src="../img/rsdose/zone_1_dialog_wifi.png"/>

## States

 <img src="../img/rsdose/zone_2.png"/>

---

<span>The maintenance switch <img width="30px" src="../img/rsdose/zone_2_maintenance.png"/> switches the device to maintenance mode.</span>

 <img  src="../img/rsdose/maintenance_view.png"/>

<span>The on/off switch <img width="30px" src="../img/rsdose/zone_2_off.png"/> toggles the ReefDose between on and off states.</span>

 <img  src="../img/rsdose/off_view.png"/>

## Manual Dosing

<img src="../img/rsdose/zone_3.png"/>

---

<span>The button <img src="../img/rsdose/zone_3_manula_config_button.png"/> displays the default manual dose for this head. Clicking it opens the configuration dialog for this dosing.</span>

<img src="../img/rsdose/zone_3_dialog_manual_dose_without.png"/>

You can add shortcuts using the card editor:

<img src="../img/rsdose/editor.png"/>

For example, head 1 offers 2, 5, and 10 mL as shortcuts.

These values will appear at the top of the dialog. Clicking a shortcut sends a command to dose the defined value.

<img src="../img/rsdose/zone_3_dialog_manual_dose.png"/>

<span>Pressing the manual dose button: <img src="../img/rsdose/zone_3_manual_button.png"/> sends a dose command with the default value displayed just above: <img src="../img/rsdose/zone_3_manual_dose.png"/>, i.e. 10 mL in this example.
</span>

## Head configuration and scheduling

 <img src="../img/rsdose/zone_4.png"/>

---

This zone allows you to view the current head schedule and change it.

- The colored circular ring indicates the percentage of the daily dose already delivered.
- The yellow number at the top shows the cumulative daily manual dose total.
- The central part shows the volume delivered compared to the total programmed daily volume.
- The blue lower part shows the number of doses delivered compared to the total doses for the day (example: 14/24 for blue because it is an hourly schedule and this screenshot was taken at 14:15). The values for purple and green show 0/0 because these doses are scheduled for 8:00 but the integration was started after 8:00, so there will be no doses today.
- A long press on one of the 4 heads toggles it on/off.
- A click on a head opens the scheduling dialog.
  From this dialog you can run a priming cycle, recalibrate the head, change the daily dose and its schedule. Don't forget to save the schedule before closing.

  <img src="../img/rsdose/zone_4_dialog_schedule.png"/>

## Supplement management

 <img src="../img/rsdose/zone_5.png"/>

---

This zone is used to manage supplements.
If a supplement is already declared, clicking on it will open the configuration dialog where you can:

- Delete the supplement (trash icon at the top right)
- Specify the total volume of the container
- Specify the actual volume of the supplement
- Decide whether you want to track the remaining volume. Clicking the shortcuts at the top will enable tracking and set default values for a full container.
- Change the display name of the supplement.

 <img src="../img/rsdose/zone_5_dialog_container.png"/>

If no supplement is linked to a head, you can add one by clicking on the container with a '+' (head 4 in our example).

<img src="../img/rsdose/zone_5_add_container.png"/>

Then follow the instructions:

<img src="../img/rsdose/zone_5_dialog_add.png"/>

### Supplements

Here is the list of supported images for supplements, grouped by brand. If yours has a ❌, you can request its addition [here](https://github.com/Elwinmage/ha-reef-card/discussions/25).

<details>
<summary><b>ATI &nbsp; <sup>2/2 🖼️</sup></b></summary>

<table>
<tr><td>✅</td><td>Essential Pro 1</td><td><img style='width:20%;' src='../../public/img/supplements/69692902-dcf9-4f41-b104-402154dc348a.supplement.png'/></td></tr>
<tr><td>✅</td><td>Essential Pro 2</td><td><img style='width:20%;' src='../../public/img/supplements/e1dbec89-2396-4269-8f28-ab7534cb2d7d.supplement.png'/></td></tr>
</table>
</details>

<details>
<summary><b>Aqua Forest &nbsp; <sup>3/9 🖼️</sup></b></summary>

<table>
<tr><td>✅</td><td>Ca Plus</td><td><img style='width:20%;' src='../../public/img/supplements/9ea6c9f2-b6f3-41ee-9370-06457f286fe5.supplement.png'/></td></tr>
<tr><td>❌</td><td colspan='2'>Calcium </td></tr>
<tr><td>❌</td><td colspan='2'>Component 1+</td></tr>
<tr><td>❌</td><td colspan='2'>Component 2+</td></tr>
<tr><td>❌</td><td colspan='2'>Component 3+</td></tr>
<tr><td>❌</td><td colspan='2'>KH Buffer</td></tr>
<tr><td>✅</td><td>KH Plus</td><td><img style='width:20%;' src='../../public/img/supplements/e391e8d1-0d4c-4355-8887-9231500703ef.supplement.png'/></td></tr>
<tr><td>❌</td><td colspan='2'>Magnesium</td></tr>
<tr><td>✅</td><td>Mg Plus</td><td><img style='width:20%;' src='../../public/img/supplements/deb3a943-68a5-40a9-860b-e6d259eee947.supplement.png'/></td></tr>
</table>
</details>

<details>
<summary><b>BRS &nbsp; <sup>0/4 🖼️</sup></b></summary>

<table>
<tr><td>❌</td><td colspan='2'>Liquid Calcium</td></tr>
<tr><td>❌</td><td colspan='2'>Liquid alkalinity</td></tr>
<tr><td>❌</td><td colspan='2'>Magnesium Mix</td></tr>
<tr><td>❌</td><td colspan='2'>Part C</td></tr>
</table>
</details>

<details>
<summary><b>Brightwell &nbsp; <sup>0/12 🖼️</sup></b></summary>

<table>
<tr><td>❌</td><td colspan='2'>Calcion</td></tr>
<tr><td>❌</td><td colspan='2'>Ferrion</td></tr>
<tr><td>❌</td><td colspan='2'>Hydrate - MG</td></tr>
<tr><td>❌</td><td colspan='2'>KoralAmino</td></tr>
<tr><td>❌</td><td colspan='2'>Koralcolor</td></tr>
<tr><td>❌</td><td colspan='2'>Liquid Reef</td></tr>
<tr><td>❌</td><td colspan='2'>Potassion</td></tr>
<tr><td>❌</td><td colspan='2'>Reef Code A</td></tr>
<tr><td>❌</td><td colspan='2'>Reef Code B</td></tr>
<tr><td>❌</td><td colspan='2'>Replenish</td></tr>
<tr><td>❌</td><td colspan='2'>Restore</td></tr>
<tr><td>❌</td><td colspan='2'>Strontion</td></tr>
</table>
</details>

<details>
<summary><b>ESV &nbsp; <sup>0/5 🖼️</sup></b></summary>

<table>
<tr><td>❌</td><td colspan='2'>B-Ionic Component 1</td></tr>
<tr><td>❌</td><td colspan='2'>B-Ionic Component 2</td></tr>
<tr><td>❌</td><td colspan='2'>B-Ionic Magnesium</td></tr>
<tr><td>❌</td><td colspan='2'>Transition elements </td></tr>
<tr><td>❌</td><td colspan='2'>Transition elements plus</td></tr>
</table>
</details>

<details>
<summary><b>Fauna Marine &nbsp; <sup>0/11 🖼️</sup></b></summary>

<table>
<tr><td>❌</td><td colspan='2'>Amin</td></tr>
<tr><td>❌</td><td colspan='2'>Balling light  trace 1</td></tr>
<tr><td>❌</td><td colspan='2'>Balling light  trace 2</td></tr>
<tr><td>❌</td><td colspan='2'>Balling light  trace 3</td></tr>
<tr><td>❌</td><td colspan='2'>Balling light Ca</td></tr>
<tr><td>❌</td><td colspan='2'>Balling light KH</td></tr>
<tr><td>❌</td><td colspan='2'>Balling light Mg</td></tr>
<tr><td>❌</td><td colspan='2'>Blue trace elements</td></tr>
<tr><td>❌</td><td colspan='2'>Green trace elements</td></tr>
<tr><td>❌</td><td colspan='2'>Min S</td></tr>
<tr><td>❌</td><td colspan='2'>Red trace elements</td></tr>
</table>
</details>

<details>
<summary><b>Quantum &nbsp; <sup>7/7 🖼️</sup></b></summary>

<table>
<tr><td>✅</td><td>Aragonite A</td><td><img style='width:20%;' src='../../public/img/supplements/322c1c47-7259-4fd9-9050-f6157036ea36.supplement.png'/></td></tr>
<tr><td>✅</td><td>Aragonite B</td><td><img style='width:20%;' src='../../public/img/supplements/e6537278-0e0a-4fd7-8146-566334bb74ed.supplement.png'/></td></tr>
<tr><td>✅</td><td>Aragonite C</td><td><img style='width:20%;' src='../../public/img/supplements/5f491b59-4f54-4572-bbce-aa9b708ccb51.supplement.png'/></td></tr>
<tr><td>✅</td><td>Bio Kalium</td><td><img style='width:20%;' src='../../public/img/supplements/8fec18b0-adf6-4dfa-b923-c7226a6fb87d.supplement.png'/></td></tr>
<tr><td>✅</td><td>Bio Metals</td><td><img style='width:20%;' src='../../public/img/supplements/a1d797e3-4679-4be4-9219-22e35822ab97.supplement.png'/></td></tr>
<tr><td>✅</td><td>Bio enhance</td><td><img style='width:20%;' src='../../public/img/supplements/fd8dee42-f3da-4660-b491-880d7dac869a.supplement.png'/></td></tr>
<tr><td>✅</td><td>Gbio Gen</td><td><img style='width:20%;' src='../../public/img/supplements/26a4f030-e78c-459c-90cb-5c6099de10fd.supplement.png'/></td></tr>
</table>
</details>

<details>
<summary><b>Red Sea &nbsp; <sup>10/13 🖼️</sup></b></summary>

<table>
<tr><td>✅</td><td>Bio Active (Colors D)</td><td><img style='width:20%;' src='../../public/img/supplements/7af9b16b-9e63-488e-8c86-261ef8c4a1ce.supplement.png'/></td></tr>
<tr><td>✅</td><td>Calcium (Foundation A)</td><td><img style='width:20%;' src='../../public/img/supplements/7d67412c-fde0-44d4-882a-dc8746fd4acb.supplement.png'/></td></tr>
<tr><td>❌</td><td colspan='2'>Calcium (Powder)</td></tr>
<tr><td>✅</td><td>Iodine (Colors A)</td><td><img style='width:20%;' src='../../public/img/supplements/93e742b0-67c9-4800-9aa9-212e52532343.supplement.png'/></td></tr>
<tr><td>✅</td><td>Iron (Colors C)</td><td><img style='width:20%;' src='../../public/img/supplements/c7a26034-8e40-41bb-bfb5-169089470f1e.supplement.png'/></td></tr>
<tr><td>✅</td><td>KH/Alkalinity (Foundation B)</td><td><img style='width:20%;' src='../../public/img/supplements/76830db3-a0bd-459a-9974-76a57d026893.supplement.png'/></td></tr>
<tr><td>❌</td><td colspan='2'>KH/Alkalinity (Powder)</td></tr>
<tr><td>✅</td><td>Magnesium (Foundation C)</td><td><img style='width:20%;' src='../../public/img/supplements/f524734e-8651-496e-b09b-640b40fc8bab.supplement.png'/></td></tr>
<tr><td>❌</td><td colspan='2'>Magnesium (Powder)</td></tr>
<tr><td>✅</td><td>NO3PO4-X</td><td><img style='width:20%;' src='../../public/img/supplements/ffaf6ff8-bc6d-44eb-9e4b-e679943dc835.supplement.png'/></td></tr>
<tr><td>✅</td><td>Potassium (Colors B)</td><td><img style='width:20%;' src='../../public/img/supplements/2f386917-54bd-4dd4-aa8b-9d1fea37edc5.supplement.png'/></td></tr>
<tr><td>✅</td><td>Reef Energy Plus</td><td><img style='width:20%;' src='../../public/img/supplements/bf9a7da3-741b-4c1d-8542-d9344a95fb70.supplement.png'/></td></tr>
<tr><td>✅</td><td>ReefCare Program</td><td><img style='width:20%;' src='../../public/img/supplements/redsea-reefcare.supplement.png'/></td></tr>
</table>
</details>

<details>
<summary><b>Seachem &nbsp; <sup>0/9 🖼️</sup></b></summary>

<table>
<tr><td>❌</td><td colspan='2'>Reef Calcium</td></tr>
<tr><td>❌</td><td colspan='2'>Reef Carbonate</td></tr>
<tr><td>❌</td><td colspan='2'>Reef Complete</td></tr>
<tr><td>❌</td><td colspan='2'>Reef Fusion 1</td></tr>
<tr><td>❌</td><td colspan='2'>Reef Fusion 2</td></tr>
<tr><td>❌</td><td colspan='2'>Reef Iodine</td></tr>
<tr><td>❌</td><td colspan='2'>Reef Plus</td></tr>
<tr><td>❌</td><td colspan='2'>Reef Strontium</td></tr>
<tr><td>❌</td><td colspan='2'>Reef Trace</td></tr>
</table>
</details>

<details>
<summary><b>Triton &nbsp; <sup>0/4 🖼️</sup></b></summary>

<table>
<tr><td>❌</td><td colspan='2'>Core7 elements 1</td></tr>
<tr><td>❌</td><td colspan='2'>Core7 elements 2</td></tr>
<tr><td>❌</td><td colspan='2'>Core7 elements 3A</td></tr>
<tr><td>❌</td><td colspan='2'>Core7 elements 3B</td></tr>
</table>
</details>

<details>
<summary><b>Tropic Marin &nbsp; <sup>6/14 🖼️</sup></b></summary>

<table>
<tr><td>❌</td><td colspan='2'>A Element</td></tr>
<tr><td>✅</td><td>All-For-Reef</td><td><img style='width:20%;' src='../../public/img/supplements/aff00331-3c23-4357-b6d4-6609dbc4fed1.supplement.png'/></td></tr>
<tr><td>✅</td><td>Amino Organic</td><td><img style='width:20%;' src='../../public/img/supplements/fddbe0a4-02eb-4903-969b-6c27c805bf6b.supplement.png'/></td></tr>
<tr><td>❌</td><td colspan='2'>Balling A</td></tr>
<tr><td>❌</td><td colspan='2'>Balling B</td></tr>
<tr><td>❌</td><td colspan='2'>Balling C</td></tr>
<tr><td>✅</td><td>Bio-Magnesium</td><td><img style='width:20%;' src='../../public/img/supplements/2f04f694-3743-4e12-a45f-a3eb63aef806.supplement.png'/></td></tr>
<tr><td>✅</td><td>Carbo Calcium</td><td><img style='width:20%;' src='../../public/img/supplements/8cdabb9f-ebcf-4675-a10f-f9020941928f.supplement.png'/></td></tr>
<tr><td>❌</td><td colspan='2'>Elimi-NP</td></tr>
<tr><td>❌</td><td colspan='2'>K Element</td></tr>
<tr><td>❌</td><td colspan='2'>Liquid Buffer</td></tr>
<tr><td>✅</td><td>NP-Bacto-Balance</td><td><img style='width:20%;' src='../../public/img/supplements/43b51c1f-0363-4ef5-be89-f129e512e25b.supplement.png'/></td></tr>
<tr><td>❌</td><td colspan='2'>Plus-NP</td></tr>
<tr><td>✅</td><td>Potassium</td><td><img style='width:20%;' src='../../public/img/supplements/964e897e-9668-4fc8-9cd9-e8c42a27cf85.supplement.png'/></td></tr>
</table>
</details>

<!-- supplements:end -->

---

[← Back to the main page](../../README.md)
