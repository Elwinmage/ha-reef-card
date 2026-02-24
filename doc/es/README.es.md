<!-- [![hacs_badge](https://img.shields.io/badge/HACS-Default-41BDF5.svg?style=flat-square)](https://github.com/hacs/default) -->

[![GH-release](https://img.shields.io/github/v/release/Elwinmage/ha-reef-card.svg?style=flat-square)](https://github.com/Elwinmage/ha-reef-card/releases)
[![GH-last-commit](https://img.shields.io/github/last-commit/Elwinmage/ha-reef-card.svg?style=flat-square)](https://github.com/Elwinmage/ha-reef-card/commits/main)

[![GitHub Clones](https://img.shields.io/badge/dynamic/json?color=success&label=Clone&query=count&url=https://gist.githubusercontent.com/Elwinmage/dd3b205383103c2e65a7f516003ecbf6/raw/clone.json&logo=github)](https://github.com/MShawon/github-clone-count-badge)
[![GH-code-size](https://img.shields.io/github/languages/code-size/Elwinmage/ha-reef-card.svg?color=red&style=flat-square)](https://github.com/Elwinmage/ha-reef-card)
[![BuyMeCoffee][buymecoffeebadge]][buymecoffee]

> [!NOTE]
> Toda ayuda es bienvenida, no dude en [contactarme](https://github.com/Elwinmage/ha-reef-card/discussions/1).

# Idiomas compatibles : [<img src="https://flagicons.lipis.dev/flags/4x3/fr.svg" style="width: 5%;"/>](../fr/README.fr.md) [<img src="https://flagicons.lipis.dev/flags/4x3/gb.svg" style="width: 5%"/>](../../README.md) [<img src="https://flagicons.lipis.dev/flags/4x3/es.svg" style="width: 5%"/>](README.es.md) [<img src="https://flagicons.lipis.dev/flags/4x3/pt.svg" style="width: 5%"/>](../pt/README.pt.md) [<img src="https://flagicons.lipis.dev/flags/4x3/de.svg" style="width: 5%"/>](../de/README.de.md) [<img src="https://flagicons.lipis.dev/flags/4x3/it.svg" style="width: 5%"/>](../it/README.it.md) [<img src="https://flagicons.lipis.dev/flags/4x3/pl.svg" style="width: 5%"/>](../pl/README.pl.md)

<!-- Vous souhaitez aider à la traduction, suivez ce [guide](https://github.com/Elwinmage/ha-reef-card/blob/main/doc/TRANSLATION.md). -->

¿Su idioma aún no está disponible y desea ayudar con la traducción? Siga esta [guía](https://github.com/Elwinmage/ha-reef-card/blob/main/doc/TRANSLATION.md).

# Presentación

La **Reef card** para Home Assistant le ayuda a gestionar su acuario de arrecife.

Combinada con [ha-reefbeat-component](https://github.com/Elwinmage/ha-reefbeat-component), soporta automáticamente sus dispositivos Redsea (ReefBeat).

> [!NOTE]
> Si tiene dispositivos que no son de Redsea y desea que sean compatibles, puede solicitarlo [aquí](https://github.com/Elwinmage/ha-reef-card/discussions/2).

> [!TIP]
> La lista de funcionalidades futuras está disponible [aquí](https://github.com/Elwinmage/ha-reef-card/issues?q=is%3Aissue%20state%3Aopen%20label%3Aenhancement)<br />
> La lista de errores está disponible [aquí](https://github.com/Elwinmage/ha-reef-card/issues?q=is%3Aissue%20state%3Aopen%20label%3Abug)

# Compatibilidad

✅ Implementado ☑️ En curso ❌ Planificado

<table>
  <th>
    <td ><b>Modelo</b></td>
    <td colspan="2"><b>Estado</b></td>
    <td><b>Issues</b>  <br/>📆(Planificado) <br/> 🐛(Bugs)</td>
  </th>
  <tr>
    <td><a href="#reefato">ReefATO+</a></td>
    <td>RSATO+</td><td>❌</td>
    <td width="200px"><img src="https://raw.githubusercontent.com/Elwinmage/ha-reefbeat-component/main/doc/img/RSATO+.png"/></td>
    <td>
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rsato,all label:enhancement" style="text-decoration:none">📆</a>
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rsato,all label:bug" style="text-decoration:none">🐛</a>
    </td>
  </tr>

  </tr>
    <tr>
    <td><a href="#reefcontrol">ReefControl</a></td>
    <td>RSSENSE<br /> Si tiene uno, puede contactarme <a href="https://github.com/Elwinmage/ha-reefbeat-component/discussions/8">aquí</a> y añadiré su soporte.</td><td>❌</td>
    <td width="200px"><img src="https://raw.githubusercontent.com/Elwinmage/ha-reefbeat-component/main/doc/img/RSCONTROL.png"/></td>
    <td>
      <a href="https://github.com/Elwinmage/ha-reefbeat-component/issues?q=is:issue state:open label:rscontrol,all label:enhancement" style="text-decoration:none">📆</a>
      <a href="https://github.com/Elwinmage/ha-reefbeat-component/issues?q=is:issue state:open label:rscontrol,all label:bug" style="text-decoration:none">🐛</a>
    </td>
      </tr>  
  <tr>
    <td rowspan="2"><a href="#reefdose">ReefDose</a></td>
    <td>RSDOSE2</td>
    <td>✅</td>
    <td width="200px"><img src="https://raw.githubusercontent.com/Elwinmage/ha-reefbeat-component/main/doc/img/RSDOSE2.png"/></td>
      <td rowspan="2">
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rsdose,all label:enhancement" style="text-decoration:none">📆</a>
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rsdose,all label:bug" style="text-decoration:none">🐛</a>
    </td>
  </tr>
  <tr>
    <td>RSDOSE4</td><td>✅</td>
    <td width="200px"><img src="https://raw.githubusercontent.com/Elwinmage/ha-reefbeat-component/main/doc/img/RSDOSE4.png"/></td>
    </tr>
  <tr>
    <td rowspan="2"> <a href="#reefled">ReefLed</a></td>
    <td>G1</td>
    <td>❌</td>
    <td width="200px"><img src="https://raw.githubusercontent.com/Elwinmage/ha-reefbeat-component/main/doc/img/rsled_g1.png"/></td>
<td rowspan="2">   
    <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rsled,all label:enhancement" style="text-decoration:none">📆</a>
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rsled,all label:bug" style="text-decoration:none">🐛</a>
</td>
  </tr>
   <td >G2</td>
    <td>❌</td>
    <td width="200px"><img src="https://raw.githubusercontent.com/Elwinmage/ha-reefbeat-component/main/doc/img/rsled_g2.png"/></td>
  </tr>
  <tr>
    <td rowspan="3"><a href="#reefmat">ReefMat</a></td>
    <td>RSMAT250</td>
    <td>☑️</td>
    <td rowspan="3" width="200px"><img src="https://raw.githubusercontent.com/Elwinmage/ha-reefbeat-component/main/doc/img/RSMAT.png"/></td>
    <td rowspan="3">
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rsmat,all label:enhancement" style="text-decoration:none">📆</a>
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rsmat,all label:bug" style="text-decoration:none">🐛</a>
    </td>
  </tr>
  <tr>
    <td>RSMAT500</td>
    <td>☑️</td>
  </tr>
  <tr>
    <td>RSMAT1200</td>
    <td>☑️</td>
  </tr>
  <tr>
    <td><a href="#reefrun">ReefRun</a></td>
    <td>RSRUN</td><td>❌</td>
    <td width="200px"><img src="https://raw.githubusercontent.com/Elwinmage/ha-reefbeat-component/main/doc/img/RSRUN.png"/></td>
    <td>
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rsrun,all label:enhancement" style="text-decoration:none">📆</a>
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rsrun,all label:bug" style="text-decoration:none">🐛</a>
    </td>
  </tr>
  <tr>
    <td><a href="#reefwave">ReefWave</a></td>
    <td>RSWAVE</td><td>❌</td>
    <td width="200px"><img src="https://raw.githubusercontent.com/Elwinmage/ha-reefbeat-component/main/doc/img/RSWAVE.png"/></td>
    <td>
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rswave,all label:enhancement" style="text-decoration:none">📆</a>
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rswave,all label:bug" style="text-decoration:none">🐛</a>
    </td>
  </tr>
</table>

# Índice

- [Instalación](https://github.com/Elwinmage/ha-reef-card/#installation)
- [Configuración](https://github.com/Elwinmage/ha-reef-card/#configuration)
- [ReefATO+](https://github.com/Elwinmage/ha-reef-card/#reefato)
- [ReefControl](https://github.com/Elwinmage/ha-reef-card/#reefcontrol)
- [ReefDose](https://github.com/Elwinmage/ha-reef-card/#reefdose)
- [ReefLED](https://github.com/Elwinmage/ha-reef-card/#reefled)
- [ReefMat](https://github.com/Elwinmage/ha-reef-card/#reefmat)
- [ReefRun](https://github.com/Elwinmage/ha-reef-card/#reefrun)
- [ReefWave](https://github.com/Elwinmage/ha-reef-card/#reefwave)
- [FAQ](https://github.com/Elwinmage/ha-reef-card/#faq)

# Instalación

## Instalación directa

Haga clic aquí para acceder directamente al repositorio en HACS y haga clic en "Descargar":  [![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=Elwinmage&repository=ha-reef-card&category=plugin)

## Buscar en HACS
O busque «reef-card» en HACS.

<p align="center">
<img src="../img/hacs_search.png" alt="Image">
</p>

# Configuración

Sin el parámetro `device`, la tarjeta detecta automáticamente todos los dispositivos ReefBeat y le permite elegir el que desea.

Para eliminar la selección de dispositivo y forzar uno específico, defina el parámetro `device` con el nombre de su dispositivo.

<table>
  <tr>
<td><img src="../img/card_rsdose4_config_2.png"/></td>
<td><img src="../img/card_rsdose4_config.png"/></td>
    </tr>
</table>

# ReefATO

Planificado.
  
¿Desea que sea compatible más rápido? Vote [aquí](https://github.com/Elwinmage/ha-reef-card/discussions/22).

# ReefControl

Planificado.

¿Desea que sea compatible más rápido? Vote [aquí](https://github.com/Elwinmage/ha-reef-card/discussions/22).

# ReefDose

ReefDose con ha-reef-card en acción:

[![Ver el vídeo](https://img.youtube.com/vi/Qee5LH0T9wQ/0.jpg)](https://www.youtube.com/watch?v=Qee5LH0T9wQ)


La tarjeta ReefDose está dividida en 6 zonas:

 1. Configuración/Información Wifi
 2. Estados
 3. Dosificación Manual
 4. Configuración y programación de las cabezas
 5. Gestión de suplementos
 6. Cola de dosis futuras

<img src="../img/rsdose/rsdose4_ex1.png"/>

## Configuración/Información Wifi
<img src="../img/rsdose/zone_1.png"/>

***

<span >Haga clic en el icono <img src="../img/rsdose/cog_icon.png" width="30" /> para gestionar la configuración general del ReefDose.</span>

<img src="../img/rsdose/zone_1_dialog_config.png"/> 

<span>Haga clic en el icono <img width="30px" src="../img/rsdose/wifi_icon.png"/>  para gestionar los parámetros de red.</span>

<img src="../img/rsdose/zone_1_dialog_wifi.png"/> 

## Estados

 <img src="../img/rsdose/zone_2.png"/>

***
<span>El interruptor de mantenimiento  <img width="30px" src="../img/rsdose/zone_2_maintenance.png"/> permite cambiar al modo mantenimiento.</span>

 <img  src="../img/rsdose/maintenance_view.png"/>

<span>El interruptor on/off  <img width="30px" src="../img/rsdose/zone_2_off.png"/> permite alternar entre los estados encendido y apagado del ReefDose.</span>

 <img  src="../img/rsdose/off_view.png"/>


## Dosificación Manual

<img src="../img/rsdose/zone_3.png"/>

***
<span>El botón <img src="../img/rsdose/zone_3_manula_config_button.png"/>  muestra la dosis manual predeterminada para esta cabeza. Un clic abre el cuadro de configuración de esta dosificación.</span>

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

***
Esta zona permite visualizar la programación actual de las cabezas y modificarla.
- El anillo circular coloreado indica el porcentaje de dosis diaria ya distribuida.
- El número amarillo en la parte superior indica el acumulado de dosis manual diaria.
- La parte central indica el volumen distribuido respecto al volumen diario programado total.
- La parte azul inferior indica el número de dosis distribuidas respecto al total de dosis del día (ejemplo: 14/24 para el azul porque es una programación horaria tomada a las 14:15). Los valores para el violeta y el verde indican 0/0 porque esas dosis deben distribuirse a las 8h pero la integración se inició después de las 8h, por lo que no habrá ninguna dosis hoy.
- Un clic largo en una de las 4 cabezas la activará o desactivará.
- Un clic en una cabeza abrirá el cuadro de programación.
  Desde este cuadro puede iniciar un cebado, recalibrar la cabeza, cambiar la dosis diaria y su programación. No olvide guardar la programación antes de salir.
  
  <img src="../img/rsdose/zone_4_dialog_schedule.png"/>
   

## Gestión de suplementos

 <img src="../img/rsdose/zone_5.png"/>

***
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

A continuación se muestra la lista de imágenes de suplementos compatibles, agrupados por marca. Si el suyo muestra un ❌, puede solicitar que se añada [aquí](https://github.com/Elwinmage/ha-reef-card/discussions/25).

<details>
<summary><b>ATI &nbsp; <sup>0/2 🖼️</sup></b></summary>

<table>
<tr><td>❌</td><td colspan='2'>Essential Pro 1</td></tr>
<tr><td>❌</td><td colspan='2'>Essential Pro 2</td></tr>
</table>
</details>

<details>
<summary><b>Aqua Forest &nbsp; <sup>0/9 🖼️</sup></b></summary>

<table>
<tr><td>❌</td><td colspan='2'>Ca Plus</td></tr>
<tr><td>❌</td><td colspan='2'>Calcium </td></tr>
<tr><td>❌</td><td colspan='2'>Component 1+</td></tr>
<tr><td>❌</td><td colspan='2'>Component 2+</td></tr>
<tr><td>❌</td><td colspan='2'>Component 3+</td></tr>
<tr><td>❌</td><td colspan='2'>KH Buffer</td></tr>
<tr><td>❌</td><td colspan='2'>KH Plus</td></tr>
<tr><td>❌</td><td colspan='2'>Magnesium</td></tr>
<tr><td>❌</td><td colspan='2'>Mg Plus</td></tr>
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
<summary><b>Quantum &nbsp; <sup>0/7 🖼️</sup></b></summary>

<table>
<tr><td>❌</td><td colspan='2'>Aragonite A</td></tr>
<tr><td>❌</td><td colspan='2'>Aragonite B</td></tr>
<tr><td>❌</td><td colspan='2'>Aragonite C</td></tr>
<tr><td>❌</td><td colspan='2'>Bio Kalium</td></tr>
<tr><td>❌</td><td colspan='2'>Bio Metals</td></tr>
<tr><td>❌</td><td colspan='2'>Bio enhance</td></tr>
<tr><td>❌</td><td colspan='2'>Gbio Gen</td></tr>
</table>
</details>

<details>
<summary><b>Red Sea &nbsp; <sup>0/13 🖼️</sup></b></summary>

<table>
<tr><td>❌</td><td colspan='2'>Bio Active (Colors D)</td></tr>
<tr><td>❌</td><td colspan='2'>Calcium (Foundation A)</td></tr>
<tr><td>❌</td><td colspan='2'>Calcium (Powder)</td></tr>
<tr><td>❌</td><td colspan='2'>Iodine (Colors A)</td></tr>
<tr><td>❌</td><td colspan='2'>Iron (Colors C)</td></tr>
<tr><td>❌</td><td colspan='2'>KH/Alkalinity (Foundation B)</td></tr>
<tr><td>❌</td><td colspan='2'>KH/Alkalinity (Powder)</td></tr>
<tr><td>❌</td><td colspan='2'>Magnesium (Foundation C)</td></tr>
<tr><td>❌</td><td colspan='2'>Magnesium (Powder)</td></tr>
<tr><td>❌</td><td colspan='2'>NO3PO4-X</td></tr>
<tr><td>❌</td><td colspan='2'>Potassium (Colors B)</td></tr>
<tr><td>❌</td><td colspan='2'>Reef Energy Plus</td></tr>
<tr><td>❌</td><td colspan='2'>ReefCare Program</td></tr>
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
<summary><b>Tropic Marin &nbsp; <sup>0/14 🖼️</sup></b></summary>

<table>
<tr><td>❌</td><td colspan='2'>A Element</td></tr>
<tr><td>❌</td><td colspan='2'>All-For-Reef</td></tr>
<tr><td>❌</td><td colspan='2'>Amino Organic</td></tr>
<tr><td>❌</td><td colspan='2'>Balling A</td></tr>
<tr><td>❌</td><td colspan='2'>Balling B</td></tr>
<tr><td>❌</td><td colspan='2'>Balling C</td></tr>
<tr><td>❌</td><td colspan='2'>Bio-Magnesium</td></tr>
<tr><td>❌</td><td colspan='2'>Carbo Calcium</td></tr>
<tr><td>❌</td><td colspan='2'>Elimi-NP</td></tr>
<tr><td>❌</td><td colspan='2'>K Element</td></tr>
<tr><td>❌</td><td colspan='2'>Liquid Buffer</td></tr>
<tr><td>❌</td><td colspan='2'>NP-Bacto-Balance</td></tr>
<tr><td>❌</td><td colspan='2'>Plus-NP</td></tr>
<tr><td>❌</td><td colspan='2'>Potassium</td></tr>
</table>
</details>

## Cola de dosis futuras

<img src="../img/rsdose/zone_6.png"/>

***
Esta zona muestra simplemente la lista de dosis futuras de su equipo, ya sean automáticas o manuales (horario desplazado por la espera definida entre dos suplementos diferentes).

# ReefLed

Planificado.

¿Desea que sea compatible más rápido? Vote [aquí](https://github.com/Elwinmage/ha-reef-card/discussions/22).

# ReefMat

Planificado.

¿Desea que sea compatible más rápido? Vote [aquí](https://github.com/Elwinmage/ha-reef-card/discussions/22).

# ReefRun

Planificado.

¿Desea que sea compatible más rápido? Vote [aquí](https://github.com/Elwinmage/ha-reef-card/discussions/22).

# ReefWave

Planificado.

¿Desea que sea compatible más rápido? Vote [aquí](https://github.com/Elwinmage/ha-reef-card/discussions/22).

# FAQ

---

[buymecoffee]: https://paypal.me/Elwinmage
[buymecoffeebadge]: https://img.shields.io/badge/buy%20me%20a%20coffee-donate-yellow.svg?style=flat-square
