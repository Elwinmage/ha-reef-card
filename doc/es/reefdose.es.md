[← Volver a la página principal](README.es.md)

# ReefDose

ReefDose con ha-reef-card en acción:

[![Ver el vídeo](https://img.youtube.com/vi/Qee5LH0T9wQ/0.jpg)](https://www.youtube.com/watch?v=Qee5LH0T9wQ)

La tarjeta ReefDose está dividida en 6 zonas:

1.  Configuración/Información Wifi
2.  Estados
3.  Dosificación Manual
4.  Configuración y programación de las cabezas
5.  Gestión de suplementos
6.  Cola de dosis futuras

<img src="../img/rsdose/rsdose4_ex1.png"/>

## Configuración/Información Wifi

<img src="../img/rsdose/zone_1.png"/>

---

<span >Haga clic en el icono <img src="../img/rsdose/cog_icon.png" width="30" /> para gestionar la configuración general del ReefDose.</span>

<img src="../img/rsdose/zone_1_dialog_config.png"/>

<span>Haga clic en el icono <img width="30px" src="../img/rsdose/wifi_icon.png"/> para gestionar los parámetros de red.</span>

<img src="../img/rsdose/zone_1_dialog_wifi.png"/>

## Estados

 <img src="../img/rsdose/zone_2.png"/>

---

<span>El interruptor de mantenimiento <img width="30px" src="../img/rsdose/zone_2_maintenance.png"/> permite cambiar al modo mantenimiento.</span>

 <img  src="../img/rsdose/maintenance_view.png"/>

<span>El interruptor on/off <img width="30px" src="../img/rsdose/zone_2_off.png"/> permite alternar entre los estados encendido y apagado del ReefDose.</span>

 <img  src="../img/rsdose/off_view.png"/>

## Dosificación Manual

<img src="../img/rsdose/zone_3.png"/>

---

<span>El botón <img src="../img/rsdose/zone_3_manula_config_button.png"/> muestra la dosis manual predeterminada para esta cabeza. Un clic abre el cuadro de configuración de esta dosificación.</span>

<img src="../img/rsdose/zone_3_dialog_manual_dose_without.png"/>

Puede añadir atajos usando el editor de la tarjeta:

<img src="../img/rsdose/editor.png"/>

Por ejemplo, la cabeza 1 propone como atajos los valores 2, 5 y 10 mL.

Estos valores aparecerán en la parte superior del cuadro de diálogo. Un clic en estos atajos enviará un comando para dosificar el valor definido.

<img src="../img/rsdose/zone_3_dialog_manual_dose.png"/>

<span>Presionar el botón de dosis manual: <img src="../img/rsdose/zone_3_manual_button.png"/> enviará un comando de dosis con el valor predeterminado visible justo encima: <img src="../img/rsdose/zone_3_manual_dose.png"/>, es decir 10 mL en este ejemplo.
</span>

## Configuración y programación de las cabezas

 <img src="../img/rsdose/zone_4.png"/>

---

Esta zona permite visualizar la programación actual de las cabezas y modificarla.

- El anillo circular coloreado indica el porcentaje de dosis diaria ya distribuida.
- El número amarillo en la parte superior indica el acumulado de dosis manual diaria.
- La parte central indica el volumen distribuido respecto al volumen diario programado total.
- La parte azul inferior indica el número de dosis distribuidas respecto al total de dosis del día (ejemplo: 14/24 para el azul porque es una programación horaria tomada a las 14:15). Los valores para el violeta y el verde indican 0/0 porque esas dosis deben distribuirse a las 8h pero la integración se inició después de las 8h, por lo que no habrá ninguna dosis hoy.
- Un clic largo en una de las 4 cabezas la activará o desactivará.
- Un clic en una cabeza abrirá el cuadro de programación.
  Desde este cuadro puede iniciar un cebado, recalibrar la cabeza, cambiar la dosis diaria y su programación. No olvide guardar la programación antes de salir.

  <img src="../img/rsdose/zone_4_dialog_schedule.png"/>

### Regulación de dosificación

La configuración del cabezal contiene la **Regulación de dosificación** de la [integración redsea](https://github.com/Elwinmage/ha-reefbeat-component/blob/main/doc/es/reefdose.es.md#regulación-de-dosificación):

- **Dosificación asistida**: el botón **Dosificación asistida** abre un diálogo con el gráfico de sus resultados de test, la entrada de un nuevo resultado, la dosis propuesta para aplicar o descartar, y los ajustes del cálculo. Nada llega al dosificador hasta que usted lo aplica.

  <img src="../img/rsdose/assisted_dose_dialog.png" width="300"/> <img src="../img/rsdose/assisted_dose_settings.png" width="300"/>

  La ventana muestra la dosis actual (solo lectura) justo encima de la propuesta. Un resultado se introduce a mano o se lee en la jeringa de un kit: elija el kit (Red Sea, Salifert, Colombo…) e introduzca la lectura del reactivo en mL, el resultado se calcula. El botón **Resultados de pruebas** lista los resultados para añadir uno con una fecha pasada, corregirlo o eliminarlo; el gráfico se actualiza al instante. Un suplemento que ninguna prueba guía (Red Sea NO3:PO4-X, alimentos) no ofrece dosificación asistida y su potencia aparece en gris. Una dosis aplicada aparece en el programa del cabezal al volver a él.

- **Salmuera**: el cabezal lo controla solo Home Assistant, con dosis manuales, así que su configuración muestra la salmuera en lugar del programa: salinidad de la última semana, estado y alarma, salmuera prevista, control con refractómetro y ajustes. En la vista principal, el anillo y la etiqueta central muestran la salmuera dosificada hoy frente a la prevista, y la etiqueta inferior la salinidad.

  <img src="../img/rsdose/brine_head.png" width="300"/> <img src="../img/rsdose/brine_status.png" width="300"/> <img src="../img/rsdose/brine_settings.png" width="300"/>

### Historial de dosis

Mientras el dosificador está en [modo Poseidon](https://github.com/Elwinmage/ha-reefbeat-component/blob/main/doc/es/poseidon.es.md#modo-poseidon), la configuración de un cabezal tiene un botón **Historial de dosis**: las dosis del cabezal, de la más reciente a la más antigua, por día, con inicio, fin, duración, volumen y tipo (programada, manual, compensación). Últimas 24 h, 7 o 31 días, o todo lo guardado, con el volumen total del periodo. Un inicio marcado con «≈» se estima a partir del caudal del cabezal.

## Gestión de suplementos

 <img src="../img/rsdose/zone_5.png"/>

---

Esta zona permite gestionar los suplementos.
Si ya hay un suplemento declarado, un clic sobre él abrirá el cuadro de configuración donde podrá:

- Eliminar el suplemento (icono papelera en la parte superior derecha)
- Indicar el volumen total del contenedor
- Indicar el volumen real del suplemento
- Decidir si desea hacer seguimiento del volumen restante. Un clic en los atajos de la parte superior activará el control y establecerá los valores predeterminados con un contenedor lleno.
- Modificar el nombre de visualización del suplemento.

 <img src="../img/rsdose/zone_5_dialog_container.png"/>

Si no hay ningún suplemento vinculado a una cabeza, puede añadir uno haciendo clic en el contenedor con un '+' (cabeza 4 en nuestro ejemplo).

<img src="../img/rsdose/zone_5_add_container.png"/>

A continuación, siga las instrucciones:

<img src="../img/rsdose/zone_5_dialog_add.png"/>

### Suplementos

Aquí está la lista de imágenes de suplementos compatibles, agrupadas por marca. Si el tuyo tiene un ❌, puedes solicitar su incorporación [aquí](https://github.com/Elwinmage/reeftech-catalog/issues/new?labels=supplement).

<details>
<summary><b>ATI &nbsp; <sup>2/2 🖼️</sup></b></summary>

<table>
<tr><td>✅</td><td>Essential Pro 1</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/ati-essential-pro-1/image.webp'/></td></tr>
<tr><td>✅</td><td>Essential Pro 2</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/ati-essential-pro-2/image.webp'/></td></tr>
</table>
</details>

<details>
<summary><b>Aqua Forest &nbsp; <sup>3/9 🖼️</sup></b></summary>

<table>
<tr><td>✅</td><td>Ca Plus</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/aqua-forest-ca-plus/image.webp'/></td></tr>
<tr><td>❌</td><td colspan='2'>Calcium </td></tr>
<tr><td>❌</td><td colspan='2'>Component 1+</td></tr>
<tr><td>❌</td><td colspan='2'>Component 2+</td></tr>
<tr><td>❌</td><td colspan='2'>Component 3+</td></tr>
<tr><td>❌</td><td colspan='2'>KH Buffer</td></tr>
<tr><td>✅</td><td>KH Plus</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/aqua-forest-kh-plus/image.webp'/></td></tr>
<tr><td>❌</td><td colspan='2'>Magnesium</td></tr>
<tr><td>✅</td><td>Mg Plus</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/aqua-forest-mg-plus/image.webp'/></td></tr>
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
<summary><b>DIY &nbsp; <sup>1/1 🖼️</sup></b></summary>

<table>
<tr><td>✅</td><td>Brine</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/diy-brine/image.webp'/></td></tr>
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
<tr><td>✅</td><td>Aragonite A</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/quantum-aragonite-a/image.webp'/></td></tr>
<tr><td>✅</td><td>Aragonite B</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/quantum-aragonite-b/image.webp'/></td></tr>
<tr><td>✅</td><td>Aragonite C</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/quantum-aragonite-c/image.webp'/></td></tr>
<tr><td>✅</td><td>Bio Kalium</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/quantum-bio-kalium/image.webp'/></td></tr>
<tr><td>✅</td><td>Bio Metals</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/quantum-bio-metals/image.webp'/></td></tr>
<tr><td>✅</td><td>Bio enhance</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/quantum-bio-enhance/image.webp'/></td></tr>
<tr><td>✅</td><td>Gbio Gen</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/quantum-gbio-gen/image.webp'/></td></tr>
</table>
</details>

<details>
<summary><b>Red Sea &nbsp; <sup>14/17 🖼️</sup></b></summary>

<table>
<tr><td>✅</td><td>Bio Active (Colors D)</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/red-sea-bio-active-colors-d/image.webp'/></td></tr>
<tr><td>✅</td><td>Calcium (Foundation A)</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/red-sea-calcium-foundation-a/image.webp'/></td></tr>
<tr><td>❌</td><td colspan='2'>Calcium (Powder)</td></tr>
<tr><td>✅</td><td>Iodine (Colors A)</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/red-sea-iodine-colors-a/image.webp'/></td></tr>
<tr><td>✅</td><td>Iron (Colors C)</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/red-sea-iron-colors-c/image.webp'/></td></tr>
<tr><td>✅</td><td>KH/Alkalinity (Foundation B)</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/red-sea-kh-alkalinity-foundation-b/image.webp'/></td></tr>
<tr><td>❌</td><td colspan='2'>KH/Alkalinity (Powder)</td></tr>
<tr><td>✅</td><td>Magnesium (Foundation C)</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/red-sea-magnesium-foundation-c/image.webp'/></td></tr>
<tr><td>❌</td><td colspan='2'>Magnesium (Powder)</td></tr>
<tr><td>✅</td><td>NO3PO4-X</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/red-sea-no3po4-x/image.webp'/></td></tr>
<tr><td>✅</td><td>Potassium (Colors B)</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/red-sea-potassium-colors-b/image.webp'/></td></tr>
<tr><td>✅</td><td>Reef Energy Plus</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/red-sea-reef-energy-plus/image.webp'/></td></tr>
<tr><td>✅</td><td>ReefCare Part 1: Calcium & Magnesium</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/red-sea-reefcare-part-1-calcium-magnesium/image.webp'/></td></tr>
<tr><td>✅</td><td>ReefCare Part 2: KH/Alkalinity &PH stabilizer</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/red-sea-reefcare-part-2-kh-alkalinity-ph-stabilizer/image.webp'/></td></tr>
<tr><td>✅</td><td>ReefCare Part 3: Iodine & Potassium</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/red-sea-reefcare-part-3-iodine-potassium/image.webp'/></td></tr>
<tr><td>✅</td><td>ReefCare Part 4: Iron & Bioactive elements</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/red-sea-reefcare-part-4-iron-bioactive-elements/image.webp'/></td></tr>
<tr><td>✅</td><td>ReefCare Program</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/red-sea-reefcare-program/image.webp'/></td></tr>
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
<tr><td>✅</td><td>All-For-Reef</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/tropic-marin-all-for-reef/image.webp'/></td></tr>
<tr><td>✅</td><td>Amino Organic</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/tropic-marin-amino-organic/image.webp'/></td></tr>
<tr><td>❌</td><td colspan='2'>Balling A</td></tr>
<tr><td>❌</td><td colspan='2'>Balling B</td></tr>
<tr><td>❌</td><td colspan='2'>Balling C</td></tr>
<tr><td>✅</td><td>Bio-Magnesium</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/tropic-marin-bio-magnesium/image.webp'/></td></tr>
<tr><td>✅</td><td>Carbo Calcium</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/tropic-marin-carbo-calcium/image.webp'/></td></tr>
<tr><td>❌</td><td colspan='2'>Elimi-NP</td></tr>
<tr><td>❌</td><td colspan='2'>K Element</td></tr>
<tr><td>❌</td><td colspan='2'>Liquid Buffer</td></tr>
<tr><td>✅</td><td>NP-Bacto-Balance</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/tropic-marin-np-bacto-balance/image.webp'/></td></tr>
<tr><td>❌</td><td colspan='2'>Plus-NP</td></tr>
<tr><td>✅</td><td>Potassium</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/tropic-marin-potassium/image.webp'/></td></tr>
</table>
</details>

<!-- supplements:end -->

---

[← Volver a la página principal](README.es.md)
