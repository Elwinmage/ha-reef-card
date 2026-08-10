# ha-reef-card 🌊 para HomeAssistant

> Parte del **[Ecosistema ReefTech Project](https://elwinmage.github.io/reeftank/es.html)**

<p align="center">
  <img src="../../icon.png" width="50%"/>
</p>

[![GH-release](https://img.shields.io/github/v/release/Elwinmage/ha-reef-card.svg?style=flat-square)](https://github.com/Elwinmage/ha-reef-card/releases)
[![GH-last-commit](https://img.shields.io/github/last-commit/Elwinmage/ha-reef-card.svg?style=flat-square)](https://github.com/Elwinmage/ha-reef-card/commits/main)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

<!-- [![hacs_badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg?style=flat-square)](https://github.com/hacs/integration) -->

[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Lit](https://img.shields.io/badge/Lit-3.3-blue?style=flat-square&logo=lit)](https://lit.dev/)
[![codecov](https://codecov.io/gh/Elwinmage/ha-reef-card/branch/main/graph/badge.svg?token=XXXX)](https://codecov.io/gh/Elwinmage/ha-reef-card)
[![BuyMeCoffee][buymecoffeebadge]][buymecoffee]

# Idiomas compatibles : [<img src="https://flagicons.lipis.dev/flags/4x3/fr.svg" style="width: 5%;"/>](../fr/README.fr.md) [<img src="https://flagicons.lipis.dev/flags/4x3/gb.svg" style="width: 5%"/>](../../README.md) [<img src="https://flagicons.lipis.dev/flags/4x3/es.svg" style="width: 5%"/>](README.es.md) [<img src="https://flagicons.lipis.dev/flags/4x3/pt.svg" style="width: 5%"/>](../pt/README.pt.md) [<img src="https://flagicons.lipis.dev/flags/4x3/de.svg" style="width: 5%"/>](../de/README.de.md) [<img src="https://flagicons.lipis.dev/flags/4x3/it.svg" style="width: 5%"/>](../it/README.it.md) [<img src="https://flagicons.lipis.dev/flags/4x3/pl.svg" style="width: 5%"/>](../pl/README.pl.md)

<!-- Vous souhaitez aider à la traduction, suivez ce [guide](https://github.com/Elwinmage/ha-reef-card/blob/main/doc/TRANSLATION.md). -->

¿Su idioma aún no está disponible y desea ayudar con la traducción? Siga esta [guía](https://github.com/Elwinmage/ha-reef-card/blob/main/doc/TRANSLATION.md).

# Presentación

La **Reef card** para Home Assistant le ayuda a gestionar su acuario de arrecife.

Combinada con [ha-reefbeat-component](https://github.com/Elwinmage/ha-reefbeat-component), soporta automáticamente sus dispositivos Redsea (ReefBeat).

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
    <td>✅</td>
    <td rowspan="3" width="200px"><img src="https://raw.githubusercontent.com/Elwinmage/ha-reefbeat-component/main/doc/img/RSMAT.png"/></td>
    <td rowspan="3">
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rsmat,all label:enhancement" style="text-decoration:none">📆</a>
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rsmat,all label:bug" style="text-decoration:none">🐛</a>
    </td>
  </tr>
  <tr>
    <td>RSMAT500</td>
    <td>✅</td>
  </tr>
  <tr>
    <td>RSMAT1200</td>
    <td>✅</td>
  </tr>
  <tr>
    <td><a href="#reefrun">ReefRun</a></td>
    <td>RSRUN</td><td>☑</td>
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
- [Mantenimiento](https://github.com/Elwinmage/ha-reef-card/#maintenance)
- [FAQ](https://github.com/Elwinmage/ha-reef-card/#faq)

# Instalación

## Instalación directa

Haga clic aquí para acceder directamente al repositorio en HACS y haga clic en "Descargar": [![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=Elwinmage&repository=ha-reef-card&category=plugin)

## Buscar en HACS

O busque «reef-card» en HACS.

<p align="center">
<img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/hacs_search.png" alt="Image">
</p>

# Configuración

Sin el parámetro `device`, la tarjeta detecta automáticamente todos los dispositivos ReefBeat y le permite elegir el que desea.

Para eliminar la selección de dispositivo y forzar uno específico, defina el parámetro `device` con el nombre de su dispositivo.

<table>
  <tr>
<td><img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/card_rsdose4_config_2.png"/></td>
<td><img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/card_rsdose4_config.png"/></td>
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

1.  Configuración/Información Wifi
2.  Estados
3.  Dosificación Manual
4.  Configuración y programación de las cabezas
5.  Gestión de suplementos
6.  Cola de dosis futuras

<img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/rsdose4_ex1.png"/>

## Configuración/Información Wifi

<img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/zone_1.png"/>

---

<span >Haga clic en el icono <img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/cog_icon.png" width="30" /> para gestionar la configuración general del ReefDose.</span>

<img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/zone_1_dialog_config.png"/>

<span>Haga clic en el icono <img width="30px" src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/wifi_icon.png"/> para gestionar los parámetros de red.</span>

<img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/zone_1_dialog_wifi.png"/>

## Estados

 <img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/zone_2.png"/>

---

<span>El interruptor de mantenimiento <img width="30px" src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/zone_2_maintenance.png"/> permite cambiar al modo mantenimiento.</span>

 <img  src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/maintenance_view.png"/>

<span>El interruptor on/off <img width="30px" src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/zone_2_off.png"/> permite alternar entre los estados encendido y apagado del ReefDose.</span>

 <img  src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/off_view.png"/>

## Dosificación Manual

<img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/zone_3.png"/>

---

<span>El botón <img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/zone_3_manula_config_button.png"/> muestra la dosis manual predeterminada para esta cabeza. Un clic abre el cuadro de configuración de esta dosificación.</span>

<img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/zone_3_dialog_manual_dose_without.png"/>

Puede añadir atajos usando el editor de la tarjeta:

<img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/editor.png"/>

Por ejemplo, la cabeza 1 propone como atajos los valores 2, 5 y 10 mL.

Estos valores aparecerán en la parte superior del cuadro de diálogo. Un clic en estos atajos enviará un comando para dosificar el valor definido.

<img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/zone_3_dialog_manual_dose.png"/>

<span>Presionar el botón de dosis manual: <img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/zone_3_manual_button.png"/> enviará un comando de dosis con el valor predeterminado visible justo encima: <img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/zone_3_manual_dose.png"/>, es decir 10 mL en este ejemplo.
</span>

## Configuración y programación de las cabezas

 <img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/zone_4.png"/>

---

Esta zona permite visualizar la programación actual de las cabezas y modificarla.

- El anillo circular coloreado indica el porcentaje de dosis diaria ya distribuida.
- El número amarillo en la parte superior indica el acumulado de dosis manual diaria.
- La parte central indica el volumen distribuido respecto al volumen diario programado total.
- La parte azul inferior indica el número de dosis distribuidas respecto al total de dosis del día (ejemplo: 14/24 para el azul porque es una programación horaria tomada a las 14:15). Los valores para el violeta y el verde indican 0/0 porque esas dosis deben distribuirse a las 8h pero la integración se inició después de las 8h, por lo que no habrá ninguna dosis hoy.
- Un clic largo en una de las 4 cabezas la activará o desactivará.
- Un clic en una cabeza abrirá el cuadro de programación.
  Desde este cuadro puede iniciar un cebado, recalibrar la cabeza, cambiar la dosis diaria y su programación. No olvide guardar la programación antes de salir.

  <img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/zone_4_dialog_schedule.png"/>

## Gestión de suplementos

 <img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/zone_5.png"/>

---

Esta zona permite gestionar los suplementos.
Si ya hay un suplemento declarado, un clic sobre él abrirá el cuadro de configuración donde podrá:

- Eliminar el suplemento (icono papelera en la parte superior derecha)
- Indicar el volumen total del contenedor
- Indicar el volumen real del suplemento
- Decidir si desea hacer seguimiento del volumen restante. Un clic en los atajos de la parte superior activará el control y establecerá los valores predeterminados con un contenedor lleno.
- Modificar el nombre de visualización del suplemento.

 <img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/zone_5_dialog_container.png"/>

Si no hay ningún suplemento vinculado a una cabeza, puede añadir uno haciendo clic en el contenedor con un '+' (cabeza 4 en nuestro ejemplo).

<img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/zone_5_add_container.png"/>

A continuación, siga las instrucciones:

<img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/zone_5_dialog_add.png"/>

### Suplementos

Aquí está la lista de imágenes de suplementos compatibles, agrupadas por marca. Si el tuyo tiene un ❌, puedes solicitar su incorporación [aquí](https://github.com/Elwinmage/ha-reef-card/discussions/25).

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
<summary><b>Tropic Marin &nbsp; <sup>5/14 🖼️</sup></b></summary>

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
<tr><td>❌</td><td colspan='2'>NP-Bacto-Balance</td></tr>
<tr><td>❌</td><td colspan='2'>Plus-NP</td></tr>
<tr><td>✅</td><td>Potassium</td><td><img style='width:20%;' src='../../public/img/supplements/964e897e-9668-4fc8-9cd9-e8c42a27cf85.supplement.png'/></td></tr>
</table>
</details>

# ReefLed

Planificado.

¿Desea que sea compatible más rápido? Vote [aquí](https://github.com/Elwinmage/ha-reef-card/discussions/22).

# ReefMat

ReefMat con ha-reef-card en acción:

[![Ver el video](https://img.youtube.com/vi/yyNyUSitb1E/0.jpg)](https://www.youtube.com/watch?v=yyNyUSitb1E)

La tarjeta ReefMat está dividida en 7 zonas:

1. Configuración / Información Wifi
2. Estados
3. Información del rollo (longitud total usada, longitud restante, fin de rollo, modo...)
4. Avance manual/automático
5. Sonda
6. Avance programado
7. Gráfico de uso semanal / mensual

<img src="../img/rsmat/rsmat_zones.png"/>

La imagen de fondo cambia según el estado de uso del rollo con 5 imágenes diferentes:

<table>
  <tr>
    <td align="center"><img src="../img/rsmat/RSMAT_100_BASE.png" width="100%"/><br/><b>0%</b></td>
    <td align="center"><img src="../img/rsmat/RSMAT_75_BASE.png" width="100%"/><br/><b>25%</b></td>
    <td align="center"><img src="../img/rsmat/RSMAT_50_BASE.png" width="100%"/><br/><b>50%</b></td>
  </tr>
  <tr>
    <td align="center"><img src="../img/rsmat/RSMAT_25_BASE.png" width="100%"/><br/><b>75%</b></td>
    <td align="center"><img src="../img/rsmat/RSMAT_0_BASE.png" width="100%"/><br/><b>100%</b></td>
    <td></td>
  </tr>
</table>

## Configuración / Información Wifi

<img src="../img/rsmat/zone_1.png"/>

---

<span>Haga clic en el icono <img src="../img/rsdose/cog_icon.png" width="30" /> para gestionar la configuración general del ReefMat.</span>

<img src="../img/rsmat/zone_1_dialog_configuration.png"/>

<span>Haga clic en el icono <img src="../img/rsdose/wifi_icon.png" width="30" /> para gestionar los parámetros de red.</span>

<img src="../img/rsmat/zone_1_dialog_wifi.png"/>

## Estados

<img src="../img/rsmat/zone_2.png"/>

---

<span>El interruptor de mantenimiento <img src="../img/mdi/mdi_account-wrench.png" width="20"/> permite cambiar al modo de mantenimiento.</span>

 <img  src="../img/rsmat/maintenance.png"/>

<span>El interruptor de encendido/apagado <img src="../img/mdi/mdi_power-plug.png" width="20"/> permite alternar entre los estados encendido y apagado del ReefMat.</span>

 <img  src="../img/rsmat/off_mode.png"/>

## Información del rollo

<img src="../img/rsmat/zone_3.png"/>

---

Esta zona muestra el estado en tiempo real del rollo filtrante, de arriba a abajo:

- La **longitud total usada** desde el inicio del rollo (arriba, en rojo)
- La **longitud restante** en el centro en rojo. Cuando el rollo está vacío, aparece un <img src="../img/mdi/mdi_paper-roll.png" width="20"/> icono parpadeante en su lugar y un cuadro de diálogo propone reemplazar el rollo.

<img src="../img/rsmat/zone_3_dialog_new_roll.png"/>

- El **número de días restantes** antes del fin del rollo, estimado según el consumo diario promedio (en negro)
- El **consumo diario promedio** en cm (abajo a la izquierda)
- El **modo de funcionamiento** actual: Auto, Mantenimiento, Apagado… (debajo del logo RedSea)
- El **porcentaje de rollo usado** (arco circular abajo a la derecha)

Si se detecta una anomalía, el logo RedSea se transformará en un <img src="../img/mdi/mdi_alert-decagram.png" width="20"/> icono parpadeante.
Hacer clic en esta alerta abre el cuadro de diálogo de anomalías:

<img src="../img/rsmat/alert.png"/>
<img src="../img/rsmat/zone_3_dialog_alert.png" />

## Avance Manual/Automático

<img src="../img/rsmat/zone_4.png"/>
<img src="../img/rsmat/zone_4_auto_off.png"/>
---

Esta zona permite controlar el avance del rollo.

De izquierda a derecha:

- El botón <img src="../img/mdi/mdi_send.png" width="20"/> lanza un **avance manual** del rollo por la longitud indicada en el centro.
- El **valor de avance** mostrado (en cm) es el valor que se enviará al pulsar el botón. Hacer clic en este número abre el cuadro de edición.

<img src="../img/rsmat/zone_4_dialog_manual_advance.png"/>

- El **botón de avance automático** <img src="../img/mdi/mdi_autorenew.png" width="20"/> <img src="../img/mdi/mdi_autorenew-off.png" width="20"/> activa o desactiva el avance automático del rollo.

## Sonda

<img src="../img/rsmat/zone_5.png"/>

---

Esta zona muestra el estado del sensor de nivel.

Tres estados son posibles:

| Estado              | Imagen                                                          |
| ------------------- | --------------------------------------------------------------- |
| Sensor conectado    | <img src="../img/rsmat/RSMAT_SENSOR_PLUGGED.png" width="80"/>   |
| Sensor desconectado | <img src="../img/rsmat/RSMAT_SENSOR_UNPLUGGED.png" width="80"/> |
| Sensor sucio        | <img src="../img/mdi/mdi_liquid-spot.png" width="80"/>          |

## Avance programado

<img src="../img/rsmat/zone_6.png"/>

---

Este botón <img src="../img/mdi/mdi_auto-mode_red.png" width="20"/><img src="../img/mdi/mdi_auto-mode_black.png" width="20"/> muestra el estado del avance programado y permite editarlo haciendo clic.

<img src="../img/rsmat/zone_6_dialog_schedule.png"/>

## Gráfico de uso

<img src="../img/rsmat/zone_7.png"/> 
<img src="../img/rsmat/monthly.png"/>

---

Esta zona muestra un gráfico del consumo del rollo a lo largo del tiempo.
Hacer clic en el botón alterna entre los dos modos disponibles:

- El modo **Weekly** muestra el consumo de los últimos 7 días.
- El modo **Monthly** muestra el consumo de los últimos 30 días.

Pulsar en la esquina superior izquierda del gráfico abre la vista detallada en Home Assistant.

## Messages

<img src="../img/rsmat/zone_8.png"/>

---

Esta zona muestra los últimos mensajes del sistema del ReefMat. Tiene dos líneas:

- La línea gris muestra el **último mensaje** recibido.
- La línea rosa muestra la **última alerta**, precedida del símbolo ⚠.

Hacer clic en <img src="../img/mdi/mdi_delete-empty.png" width="20"/> borra el mensaje correspondiente.

Estas líneas pueden ocultarse mediante la interfaz del editor de la tarjeta.

<img src="../img/rsmat/editor.png" />

# ReefRun

[![Ver el vídeo](https://img.youtube.com/vi/yyNyUSitb1E/0.jpg)](https://www.youtube.com/watch?v=yyNyUSitb1E)

La tarjeta ReefRun muestra el controlador y sus dos bombas tal y como están
físicamente conectadas, cada una con su cable y su tubería. La bomba 1 es la de
la izquierda y la bomba 2 la de la derecha — normalmente la bomba de retorno y
el DC Skimmer, pero cada toma admite cualquiera de los dos modelos.

<img src="../img/rsrun/rsrun_zones.png"/>

La tarjeta se divide en 6 zonas:

1. Estado de alimentación y modo mantenimiento
2. Información de batería y Wifi
3. Controlador: modo de funcionamiento, botones de las bombas y calibraciones
4. Bomba 1: programación diaria, cuerpo con caudal de agua en directo, temperatura
5. Bomba 2: programación diaria, cuerpo con caudal de agua en directo, temperatura
6. Último mensaje y última alerta

## Estado de alimentación y modo mantenimiento

<img src="../img/rsrun/zone_1.png" >

<span>El interruptor de mantenimiento <img src="../img/mdi/mdi_account-wrench.png" width="20"/> cambia al modo mantenimiento.</span>

<img src="../img/rsrun/maintenance.png" >

<span>El interruptor de encendido/apagado <img src="../img/mdi/mdi_power-plug.png" width="20"/> enciende y apaga el Reef Dual Controller.</span>

<img src="../img/rsrun/off_mode.png" >

## Información de batería y Wifi

<img src="../img/rsrun/zone_2.png"/>

---

<span>Este icono <img src="../img/mdi/battery.png" width="30" /> indica el nivel de batería del Dual Controller.</span>

<span>Haz clic en el icono <img src="../img/mdi/wifi_icon.png" width="30" /> para gestionar los ajustes de red.</span>

<img src="../img/rsrun/zone_2_dialog_wifi.png"/>

## Controlador: modo de funcionamiento, botones de las bombas y calibraciones

<img src="../img/rsrun/zone_3.png"/>

### Ajustes de las bombas

Un clic en <img src="../img/mdi/cog-1.png" width="5%"/> o <img src="../img/mdi/cog-2.png" width="5%"/> abre el diálogo de configuración de la bomba 1 o 2.

<img src="../img/rsrun/zone_3_return_pump.png"/>
<img src="../img/rsrun/zone_3_skimmer.png"/>

> [!CAUTION]
> **Eliminar la bomba** restaura sus ajustes a los valores de fábrica: se
> pierden la programación y el control por sonda. Siempre se pide confirmación.

### Ajustes de la sonda

Un clic en <img src="../img/mdi/cog-s.png" width="5%"/> abre el diálogo de configuración de la sonda.
<img src="../img/rsrun/zone_3_sensor.png"/>

### Play/pausa de una bomba <img src="../img/mdi/play.png" width="5%"/> / <img src="../img/mdi/pause.png" width="5%"/>

Un clic enciende o apaga esa bomba concreta.

El anillo rojo indica la velocidad actual.
<img src="../img/rsrun/speed.png"/>

Para cambiar la velocidad actual, mantén pulsado <img src="../img/mdi/play.png" width="5%"/> / <img src="../img/mdi/pause.png" width="5%"/> o haz clic en la programación:

<img src="../img/rsrun/schedule.png"/>

## Estados de una bomba

El cuerpo de la bomba refleja lo que hace realmente el aparato, basta un vistazo.
Los dos tipos de bomba no tienen los mismos estados, así que se describen por
separado.

## Bombas 1 y 2

### Bomba de retorno

<img src="../../src/img/redsea/RSRUN/reefrun_return.png" width="30%"/>

Una sola ilustración cubre todos los estados, la tarjeta solo cambia la forma de
dibujarla:

- **En marcha** — colores plenos, agua animada a la velocidad actual.
- **Parada** — la misma ilustración en gris, sin caudal.
- **Desconectada** — el mismo gris, más el cable de alimentación parpadeando.

### Skimmer

Tres ilustraciones distintas, una por estado de la copa:

<table>
  <tr>
    <td align="center"><img src="../../src/img/redsea/RSRUN/reefrun_skimmer_on.png" width="100%"/><br/><b>En marcha</b><br/>Espuma en la copa, burbujas subiendo, agua animada</td>
    <td align="center"><img src="../../src/img/redsea/RSRUN/reefrun_skimmer_full.png" width="100%"/><br/><b>Copa llena</b><br/>Espuma reducida a una banda bajo la tapa</td>
    <td align="center"><img src="../../src/img/redsea/RSRUN/reefrun_skimmer_off.png" width="100%"/><br/><b>Parado</b><br/>Copa vacía, en gris, sin burbujas</td>
  </tr>
</table>

Un skimmer desconectado se ve exactamente igual que uno parado: solo el cable
parpadeante los distingue. Ese parpadeo significa que el ReefRun informa
`missing_pump`, es decir, la bomba está configurada pero el controlador ya no la
ve. Comprueba el enchufe antes de buscar más lejos.

El estado de copa llena lo informa el sensor de espuma situado en la cámara de
recogida. El cuerpo cambia a su propia ilustración y la animación de espuma se
reduce a una banda fina bajo la tapa, esté o no activada la autorregulación. El
icono de alerta parpadeante junto al interruptor de copa llena solo aparece si
`sensor_controlled` está activo, ya que con el sensor desactivado el controlador
no actúa ante una copa llena.

### Añadir una bomba

Una toma sin bomba configurada muestra un marcador de **añadir** en lugar de un
cuerpo de bomba:

<img src="../../src/img/redsea/RSRUN/add_pump.png" width="20%"/>

Al hacer clic se abre el diálogo de configuración, donde **Detectar y añadir**
pregunta al controlador qué hay conectado y lo registra en un solo paso. El
modelo detectado es solo una sugerencia y a veces se equivoca, así que la lista
de modelos sigue siendo editable después: para un DC Skimmer elige rsk-300,
rsk-600 o rsk-900. El nombre de la bomba se edita en el mismo diálogo.

El marcador aparece en cualquier toma no configurada, así que también sale en una
toma que no piensas usar. Quien solo tenga una bomba puede ocultarlo por completo
desde el editor de la tarjeta.

<img src="../img/rsrun/editor.png"/>

### Programación

<img src="../img/rsrun/schedule.png"/>

La curva azul es la velocidad programada a lo largo de 24 horas. La línea roja
vertical marca la hora actual, y el punto sobre ella la velocidad que pide la
programación.

Cuando la bomba no sigue su programación — modo alimentación, detección de copa
llena, protección contra el sobreescumado — el punto se desplaza a la velocidad
**real** y un segmento rojo materializa la diferencia, con su valor al lado:

<img src="../img/rsrun/schedule_deviation.png"/>

Al hacer clic en el gráfico se abre el editor de programación: añadir o eliminar puntos, editar horas y velocidades, previsualizar un punto en el aparato y guardar.

<img src="../img/rsrun/schedule_editor.png"/>

## Mensajes

<img src="../img/rsrun/zone_6.png"/>

---

Esta zona muestra los últimos mensajes de sistema del ReefRun. Tiene dos líneas:

- La línea gris muestra el **último mensaje** recibido.
- La línea rosa muestra la **última alerta**, precedida del símbolo ⚠.

Al hacer clic en el icono <img src="../img/mdi/mdi_delete-empty.png" width="20"/> se borra el mensaje correspondiente.

Estas líneas se pueden ocultar desde el editor de la tarjeta.

<img src="../img/rsrun/editor_2.png" />

# ReefWave

Planificado.

¿Desea que sea compatible más rápido? Vote [aquí](https://github.com/Elwinmage/ha-reef-card/discussions/22).

# Mantenimiento

La vista de mantenimiento de ha-reef-card en acción:

[![Watch the video](https://img.youtube.com/vi/VIDEO_ID/0.jpg)](https://www.youtube.com/watch?v=VIDEO_ID)

<img src="../img/maintenance/overview.png"/>

Más allá de las vistas por dispositivo, la tarjeta ofrece una vista
**Mantenimiento** que reúne todas las tareas de mantenimiento expuestas por
`ha-reefbeat-component`, como si todo el subsistema de mantenimiento fuera un
único dispositivo.

Cada tarea se muestra como una barra de progreso que indica qué parte de su
intervalo ha transcurrido, con un color que depende del tiempo restante:

| Color   | Significado                                                   |
| ------- | ------------------------------------------------------------- |
| Verde   | Al día                                                        |
| Naranja | Próxima a vencer (último 20 % del intervalo, al menos un día) |
| Rojo    | Vencida, la etiqueta pasa a `+X d`                            |
| Gris    | Nunca realizada (ningún reinicio registrado)                  |

Las tareas se pueden ordenar **por equipo** (agrupadas, con una cabecera por
dispositivo) o **por vencimiento** (una lista plana, la más urgente primero).
Las tareas nunca realizadas se listan siempre al final. En la barra de
herramientas hay dos filtros: una casilla que oculta las tareas todavía al día y
un botón **Ocultar silenciadas / Mostrar silenciadas** que oculta las tareas
cuyo interruptor de notificación está apagado. El botón arranca en posición
«mostrar», de modo que silenciar una alerta nunca hace desaparecer un
vencimiento por sí solo. Ese valor por defecto se configura desde el editor de
la tarjeta (o con `hide_muted` más abajo), y el botón sigue teniendo prioridad
en cualquier momento.

Al hacer clic en una fila se abre el diálogo more-info de Home Assistant de la
tarea, y el botón redondo de la derecha la marca como hecha (pulsa la entidad
botón subyacente, exactamente como haría el diálogo more-info).

La vista solo aparece en el selector de dispositivos cuando existe al menos una
tarea de mantenimiento en tu instalación. Las nuevas tareas añadidas al catálogo
de la integración aparecen automáticamente, sin actualizar la tarjeta.

### Notificaciones

Cada tarea recibe además un **interruptor de notificación** en la integración
(`switch.*_notify`, mostrado como «<nombre de la tarea> (notificaciones)»).
Apagarlo silencia la alerta de vencimiento de esa única tarea sin tocar su
programación: la barra de progreso sigue avanzando, la fila simplemente se
atenúa y la campana se apaga.

La campana a la derecha de cada fila conmuta ese interruptor directamente. Solo
se muestra cuando la integración expone el interruptor. Usa `show_notify: false`
para ocultar las campanas.

El blueprint de alertas lee exactamente el mismo ajuste, así que silenciar una
tarea en la tarjeta silencia también la automatización.

### Cambiar el intervalo

El botón de calendario de cada fila despliega un control deslizante en línea que
escribe en la entidad numérica del intervalo de la tarea. El control funciona en
la unidad que la integración anuncia para esa tarea (días, semanas o meses,
leída del rol de la entidad), y la integración vuelve a convertir a días antes
de guardar. Los límites vienen de la propia entidad, así que la tarjeta nunca
puede escribir un valor fuera de rango. Solo permanece abierto un editor a la
vez. Usa `show_interval: false` para ocultar los botones.

### Bombas ReefRun

Los subdispositivos ReefRun se llaman «… bomba 1» / «… bomba 2», lo que no dice
nada sobre lo que es realmente cada bomba. Cuando el dispositivo expone a la vez
un sensor `type` y un sensor `model`, la tarjeta los añade entre paréntesis:
**ReefRun bomba 1 (retorno 12000)**, **ReefRun bomba 2 (skimmer 900)**.

El tipo se traduce y solo se conserva la cifra final del modelo (`return-12000`
-> `12000`, `rsk-900` -> `900`), ya que el prefijo o es redundante con el tipo o
es críptico. Los dispositivos que no son bombas conservan un nombre simple.

## Iconos

| Icono                                                                                                    | Función                                                                                    |
| -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| <img src="../img/mdi/mdi_check.png" width="20"/>                                                         | **Tarea realizada.** Marca la tarea como hecha y reinicia su cuenta atrás.                 |
| <img src="../img/mdi/mdi_bell-ring.png" width="20"/> <img src="../img/mdi/mdi_bell-off.png" width="20"/> | **Silenciar / activar.** Conmuta el interruptor de notificación de esa única tarea.        |
| <img src="../img/mdi/mdi_calendar-edit.png" width="20"/>                                                 | **Cambiar el intervalo.** Despliega un control deslizante ligado al intervalo de la tarea. |

## Editor

El estado por defecto de los filtros y la visibilidad de los tres botones se ajustan desde el editor de la tarjeta.

<img src="../img/maintenance/editor.png"/>

## Configuración

```yaml
type: custom:reef-card
device: __maintenance__
maintenance:
  sort: due # "device" (por defecto) o "due"
  hide_ok: false # ocultar las tareas ni vencidas ni próximas a vencer
  hide_muted: false # ocultar las tareas con las notificaciones apagadas
  warning_ratio: 0.2 # parte del intervalo mostrada en naranja
  show_reset: true # mostrar el botón "marcar como hecha" en cada fila
  show_notify: true # mostrar la campana de silenciar/activar en cada fila
  show_interval: true # mostrar el botón de edición del intervalo en cada fila
```

Todas las claves de `maintenance` son opcionales. `sort` y `hide_ok` solo fijan
el estado inicial: el usuario puede cambiarlos desde la propia vista.

# FAQ

---

[buymecoffee]: https://paypal.me/Elwinmage
[buymecoffeebadge]: https://img.shields.io/badge/buy%20me%20a%20coffee-donate-yellow.svg?style=flat-square
