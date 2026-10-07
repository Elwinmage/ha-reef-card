# ha-reef-card 🪸 para HomeAssistant

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

Combinada con [ha-reefbeat-component](https://github.com/Elwinmage/ha-reefbeat-component), soporta automáticamente sus
dispositivos Redsea (ReefBeat), y [ha-reef-maintenance-component](https://github.com/Elwinmage/ha-reef-maintenance-component)
añade a la vista de mantenimiento el equipo con el que Home Assistant no puede comunicarse.

También es compatible con las bombas Aqua Medic de [ha-aquamedic-component](https://github.com/Elwinmage/ha-aquamedic-component);
sus tareas de mantenimiento aparecen en esa misma vista.

Los flujos de energía de [reefbeatEnergyBackup](https://github.com/Elwinmage/reefbeatEnergyBackup) (red, batería, bombas) también tienen su vista, dibujada con [Power Flow Card Plus](https://github.com/flixlix/power-flow-card-plus).

<!-- generated:demo-videos:start -->

## 🎬 Vídeos de demostración

<table>
<tr>
<td><a href="https://www.youtube.com/watch?v=Qee5LH0T9wQ"><img src="https://img.youtube.com/vi/Qee5LH0T9wQ/0.jpg" alt="Demo ReefDose" width="300"/></a><br/><em>Demo ReefDose</em></td>
<td><a href="https://www.youtube.com/watch?v=yyNyUSitb1E"><img src="https://img.youtube.com/vi/yyNyUSitb1E/0.jpg" alt="Demo ReefMat" width="300"/></a><br/><em>Demo ReefMat</em></td>
</tr>
<tr>
<td><a href="https://www.youtube.com/watch?v=Xxv38OPqiGI"><img src="https://img.youtube.com/vi/Xxv38OPqiGI/0.jpg" alt="Demo ReefRun" width="300"/></a><br/><em>Demo ReefRun</em></td>
<td><a href="https://www.youtube.com/watch?v=Ko46fHonOP4"><img src="https://img.youtube.com/vi/Ko46fHonOP4/0.jpg" alt="Demo Mantenimiento" width="300"/></a><br/><em>Demo Mantenimiento</em></td>
</tr>
<tr>
<td><a href="https://www.youtube.com/watch?v=2R0DHp2eqT4"><img src="https://img.youtube.com/vi/2R0DHp2eqT4/0.jpg" alt="Demo ReefATO+" width="300"/></a><br/><em>Demo ReefATO+</em></td>
<td><a href="https://www.youtube.com/watch?v=voFobfc7Slk"><img src="https://img.youtube.com/vi/voFobfc7Slk/0.jpg" alt="Demo ReefControl & ReefControl-Power" width="300"/></a><br/><em>Demo ReefControl & ReefControl-Power</em></td>
</tr>
<tr>
<td><a href="https://www.youtube.com/watch?v=pA49z8QjTN4"><img src="https://img.youtube.com/vi/pA49z8QjTN4/0.jpg" alt="Demo ReefLed" width="300"/></a><br/><em>Demo ReefLed</em></td>
<td><a href="https://www.youtube.com/watch?v=sYVeE0zV3eo"><img src="https://img.youtube.com/vi/sYVeE0zV3eo/0.jpg" alt="Demo ReefWave" width="300"/></a><br/><em>Demo ReefWave</em></td>
</tr>
<tr>
<td><a href="https://www.youtube.com/watch?v=9Gh4YE6Ck9g"><img src="https://img.youtube.com/vi/9Gh4YE6Ck9g/0.jpg" alt="Demo Aqua Medic" width="300"/></a><br/><em>Demo Aqua Medic</em></td>
</tr>
</table>

<!-- generated:demo-videos:end -->

<!-- ecosystem:start -->

## Proyectos relacionados

Los proyectos ReefTech encajan entre sí: las integraciones traen tu equipo a Home Assistant, la tarjeta lo muestra y lo controla, y el respaldo lo mantiene en marcha durante un corte. Cada uno funciona también por su cuenta.

<table>
  <tr>
    <th width="100px"></th>
    <th>Proyecto</th>
    <th>Función</th>
    <th>Funciona con</th>
  </tr>
  <tr>
    <td><img src="https://raw.githubusercontent.com/Elwinmage/ha-reefbeat-component/main/icon.png" width="64" alt="ha-reefbeat-component" /></td>
    <td>🐠<br /><a href="https://github.com/Elwinmage/ha-reefbeat-component"><b>ha-reefbeat-component</b></a></td>
    <td>Dispositivos Red Sea ReefBeat, controlados localmente sin cloud: ReefATO+, ReefControl, ReefControl-Power, ReefDose, ReefLed, ReefMat, ReefRun y ReefWave.<br />blueprint de alertas para modos anómalos, calibraciones y batería baja. <a href="https://my.home-assistant.io/redirect/blueprint_import/?blueprint_url=https://raw.githubusercontent.com/Elwinmage/ha-reefbeat-component/refs/heads/main/blueprints/automation/redsea_alerts.en.yaml"><img src="https://my.home-assistant.io/badges/blueprint_import.svg" alt="Open your Home Assistant instance and show the blueprint import dialog with a specific blueprint pre-filled." /></a></td>
    <td>ha-reef-card</td>
  </tr>
  <tr>
    <td><img src="https://raw.githubusercontent.com/Elwinmage/ha-aquamedic-component/main/icon.png" width="64" alt="ha-aquamedic-component" /></td>
    <td>🌊<br /><a href="https://github.com/Elwinmage/ha-aquamedic-component"><b>ha-aquamedic-component</b></a></td>
    <td>Bombas Aqua Medic a través de la API cloud Gizwits: bombas de movimiento EcoDrift y SmartDrift, bombas DC Runner de retorno y de skimmer.</td>
    <td>ha-reef-card</td>
  </tr>
  <tr>
    <td><img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-maintenance-component/main/icon.png" width="64" alt="ha-reef-maintenance-component" /></td>
    <td>🐙<br /><a href="https://github.com/Elwinmage/ha-reef-maintenance-component"><b>ha-reef-maintenance-component</b></a></td>
    <td>Seguimiento de limpieza y desgaste del equipo que Home Assistant no puede consultar: bombas de movimiento, bombas de retorno, skimmers, reactores, todo lo que mantienes a mano.</td>
    <td>ha-reef-card</td>
  </tr>
  <tr>
    <td><img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/icon.png" width="64" alt="ha-reef-card" /></td>
    <td>🪸<br /><b>ha-reef-card</b><br /><i>(este repositorio)</i></td>
    <td>Vista gráfica interactiva de cada dispositivo en tu panel, y la única forma de editar programaciones avanzadas. Lee las tres integraciones mediante el contrato <code>reef_role</code> común, sin configuración del lado de la tarjeta. También dibuja los flujos de energía de reefbeatEnergyBackup.</td>
    <td>las tres integraciones</td>
  </tr>
  <tr>
    <td><img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-blueprints/main/icon.png" width="64" alt="ha-reef-blueprints" /></td>
    <td>🐬<br /><a href="https://github.com/Elwinmage/ha-reef-blueprints"><b>ha-reef-blueprints</b></a></td>
    <td>Blueprints de notificación comunes a todo el ecosistema: mantenimientos vencidos encontrados por el contrato <code>reef_role</code>, y dispositivos que dejaron de responder. Ocho idiomas.</td>
    <td>las tres integraciones</td>
  </tr>
  <tr>
    <td><img src="https://raw.githubusercontent.com/Elwinmage/reefbeatEnergyBackup/main/icon.png" width="64" alt="reefbeatEnergyBackup" /></td>
    <td>⚡<br /><a href="https://github.com/Elwinmage/reefbeatEnergyBackup"><b>reefbeatEnergyBackup</b></a></td>
    <td>Respaldo por batería ante cortes de luz. Un pack 24V LiFePO₄ gobernado por una Raspberry Pi, con degradación progresiva de la velocidad de las bombas según el estado de carga.</td>
    <td>por su cuenta, o junto a ha-reefbeat-component y ha-reef-card</td>
  </tr>
</table>

Todos están documentados juntos en la [página del proyecto ReefTech](https://elwinmage.github.io/reeftank/).

<!-- ecosystem:end -->

# Compatibilidad

> ✅ Compatible &nbsp;|&nbsp; 🚧 En curso &nbsp;|&nbsp; 🧪 Sin probar (puede funcionar) &nbsp;|&nbsp; ❌ Aún no compatible

<table>
  <th>
    <td ><b>Modelo</b></td>
    <td colspan="2"><b>Estado</b></td>
    <td><b>Issues</b>  <br/>📆(Planificado) <br/> 🐛(Bugs)</td>
  </th>
  <tr>
    <td><a href="https://github.com/Elwinmage/ha-reef-card/blob/main/doc/es/reefato.es.md#reefato">ReefATO+</a></td>
    <td>RSATO+</td><td>✅</td>
    <td width="200px"><img src="https://raw.githubusercontent.com/Elwinmage/ha-reefbeat-component/main/doc/img/RSATO+.png"/></td>
    <td>
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rsato,all label:enhancement" style="text-decoration:none">📆</a>
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rsato,all label:bug" style="text-decoration:none">🐛</a>
    </td>
  </tr>
  <tr>
    <td rowspan="2"><a href="https://github.com/Elwinmage/ha-reef-card/blob/main/doc/es/reefcontrol.es.md#reefcontrol">ReefControl</a></td>
    <td>RSCONTROLPRO</td><td>✅</td>
    <td width="200px"><img src="https://raw.githubusercontent.com/Elwinmage/ha-reefbeat-component/main/doc/img/RSCONTROLPRO.png"/></td>
    <td rowspan="2">
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rscontrol,all label:enhancement" style="text-decoration:none">📆</a>
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rscontrol,all label:bug" style="text-decoration:none">🐛</a>
    </td>
  </tr>
  <tr>
    <td>RSCONTROLLITE</td><td>🧪</td>
    <td width="200px"><img src="https://raw.githubusercontent.com/Elwinmage/ha-reefbeat-component/main/doc/img/RSCONTROLLITE.png"/></td>
  </tr>
  <tr>
    <td rowspan="2"><a href="https://github.com/Elwinmage/ha-reef-card/blob/main/doc/es/reefcontrol-power.es.md#reefcontrol-power">ReefControl-Power</a></td>
    <td>RSPOWER6</td><td>✅</td>
    <td width="200px"><img src="https://raw.githubusercontent.com/Elwinmage/ha-reefbeat-component/main/doc/img/RSPOWER6.png"/></td>
    <td rowspan="2">
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rspower,all label:enhancement" style="text-decoration:none">📆</a>
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rspower,all label:bug" style="text-decoration:none">🐛</a>
    </td>
  </tr>
  <tr>
    <td>RSPOWER8</td><td>🧪</td>
    <td width="200px"><img src="https://raw.githubusercontent.com/Elwinmage/ha-reefbeat-component/main/doc/img/RSPOWER8.png"/></td>
  </tr>
  <tr>
    <td rowspan="2"><a href="https://github.com/Elwinmage/ha-reef-card/blob/main/doc/es/reefdose.es.md#reefdose">ReefDose</a></td>
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
    <td rowspan="2"> <a href="https://github.com/Elwinmage/ha-reef-card/blob/main/doc/es/reefled.es.md#reefled">ReefLed</a></td>
    <td>G1</td>
    <td>✅</td>
    <td width="200px"><img src="https://raw.githubusercontent.com/Elwinmage/ha-reefbeat-component/main/doc/img/rsled_g1.png"/></td>
<td rowspan="2">   
    <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rsled,all label:enhancement" style="text-decoration:none">📆</a>
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rsled,all label:bug" style="text-decoration:none">🐛</a>
</td>
  </tr>
  <tr>
    <td>G2</td>
    <td>🧪</td>
    <td width="200px"><img src="https://raw.githubusercontent.com/Elwinmage/ha-reefbeat-component/main/doc/img/rsled_g2.png"/></td>
  </tr>
  <tr>
    <td rowspan="3"><a href="https://github.com/Elwinmage/ha-reef-card/blob/main/doc/es/reefmat.es.md#reefmat">ReefMat</a></td>
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
    <td><a href="https://github.com/Elwinmage/ha-reef-card/blob/main/doc/es/reefrun.es.md#reefrun">ReefRun</a></td>
    <td>RSRUN</td><td>✅</td>
    <td width="200px"><img src="https://raw.githubusercontent.com/Elwinmage/ha-reefbeat-component/main/doc/img/RSRUN.png"/></td>
    <td>
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rsrun,all label:enhancement" style="text-decoration:none">📆</a>
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rsrun,all label:bug" style="text-decoration:none">🐛</a>
    </td>
  </tr>
  <tr>
    <td><a href="https://github.com/Elwinmage/ha-reef-card/blob/main/doc/es/reefwave.es.md#reefwave">ReefWave</a></td>
    <td>RSWAVE25<br />RSWAVE45</td><td>✅</td>
    <td width="200px"><img src="https://raw.githubusercontent.com/Elwinmage/ha-reefbeat-component/main/doc/img/RSWAVE.png"/></td>
    <td>
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rswave,all label:enhancement" style="text-decoration:none">📆</a>
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rswave,all label:bug" style="text-decoration:none">🐛</a>
    </td>
  </tr>
  <tr>
    <td colspan="5"><b>Aqua Medic</b> — a través de <a href="https://github.com/Elwinmage/ha-aquamedic-component">ha-aquamedic-component</a></td>
  </tr>
  <tr>
    <td rowspan="3"><a href="https://github.com/Elwinmage/ha-reef-card/blob/main/doc/es/aquamedic.es.md#aqua-medic">Aqua Medic</a></td>
    <td>EcoDrift / SmartDrift x.1 / x.3<br />(bomba de circulación)</td><td>✅</td>
    <td width="200px"><img src="https://raw.githubusercontent.com/Elwinmage/ha-aquamedic-component/main/doc/img/drift.png" width="120"/></td>
    <td rowspan="3">
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:aquamedic,all label:enhancement" style="text-decoration:none">📆</a>
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:aquamedic,all label:bug" style="text-decoration:none">🐛</a>
    </td>
  </tr>
  <tr>
    <td>DC Runner<br />(bomba de retorno)</td><td>✅</td>
    <td width="200px"><img src="https://raw.githubusercontent.com/Elwinmage/ha-aquamedic-component/main/doc/img/runner.png" width="120"/></td>
  </tr>
  <tr>
    <td>DC Runner<br />(bomba del skimmer)</td><td>✅</td>
    <td width="200px"><img src="https://raw.githubusercontent.com/Elwinmage/ha-aquamedic-component/main/doc/img/skimmer.png" width="120"/></td>
  </tr>
  <tr>
    <td colspan="5"><b>reefbeatEnergyBackup</b> — a través de <a href="https://github.com/Elwinmage/reefbeatEnergyBackup">reefbeatEnergyBackup</a></td>
  </tr>
  <tr>
    <td><a href="https://github.com/Elwinmage/ha-reef-card/blob/main/doc/es/energybackup.es.md#respaldo-de-energía">Respaldo de energía</a></td>
    <td>Energy Backup System<br />(batería de respaldo)</td><td>✅</td>
    <td width="200px"><img src="https://raw.githubusercontent.com/Elwinmage/reefbeatEnergyBackup/main/icon.png" width="64"/></td>
    <td>
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:energybackup,all label:enhancement" style="text-decoration:none">📆</a>
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:energybackup,all label:bug" style="text-decoration:none">🐛</a>
    </td>
  </tr>
</table>

> [!NOTE]
> La bomba de retorno DC Runner y la bomba del skimmer son el mismo hardware con cabezales distintos: mismo firmware, misma clave de producto Gizwits, entidades idénticas. La integración las distingue mediante su selector **Rol de la bomba**, y la tarjeta sigue ese rol.

# Índice

- [Instalación](#instalación)
- [Configuración](#configuración)
- [ReefATO+](https://github.com/Elwinmage/ha-reef-card/blob/main/doc/es/reefato.es.md#reefato)
- [ReefControl](https://github.com/Elwinmage/ha-reef-card/blob/main/doc/es/reefcontrol.es.md#reefcontrol)
- [ReefControl-Power](https://github.com/Elwinmage/ha-reef-card/blob/main/doc/es/reefcontrol-power.es.md#reefcontrol-power)
- [ReefDose](https://github.com/Elwinmage/ha-reef-card/blob/main/doc/es/reefdose.es.md#reefdose)
- [ReefLED](https://github.com/Elwinmage/ha-reef-card/blob/main/doc/es/reefled.es.md#reefled)
- [ReefMat](https://github.com/Elwinmage/ha-reef-card/blob/main/doc/es/reefmat.es.md#reefmat)
- [ReefRun](https://github.com/Elwinmage/ha-reef-card/blob/main/doc/es/reefrun.es.md#reefrun)
- [ReefWave](https://github.com/Elwinmage/ha-reef-card/blob/main/doc/es/reefwave.es.md#reefwave)
- [Aqua Medic](https://github.com/Elwinmage/ha-reef-card/blob/main/doc/es/aquamedic.es.md#aqua-medic)
- [Mantenimiento](https://github.com/Elwinmage/ha-reef-card/blob/main/doc/es/maintenance.es.md#mantenimiento)
- [Respaldo de energía](https://github.com/Elwinmage/ha-reef-card/blob/main/doc/es/energybackup.es.md#respaldo-de-energía)
- [FAQ](#faq)

# Instalación

## Instalación directa

Haga clic aquí para acceder directamente al repositorio en HACS y haga clic en "Descargar": [![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=Elwinmage&repository=ha-reef-card&category=plugin)

## Buscar en HACS

O busque «reef-card» en HACS.

<p align="center">
<img src="../img/hacs_search.png" alt="Image">
</p>

# Configuración

Sin el parámetro `device`, la tarjeta detecta automáticamente todos los dispositivos ReefBeat y le permite elegir el que desea.

Para eliminar la selección de dispositivo y forzar uno específico, defina el parámetro `device` con el nombre de su dispositivo.

El editor de la tarjeta guarda ahí el identificador estable del dispositivo (su identificador de hardware) y almacena las opciones de cada dispositivo bajo ese mismo identificador: renombrar un dispositivo en Home Assistant no hace perder nada. Una configuración escrita con el nombre del dispositivo sigue funcionando, y pasa al identificador en la próxima modificación desde el editor.

<table>
  <tr>
<td><img src="../img/card_rsdose4_config_2.png"/></td>
<td><img src="../img/card_rsdose4_config.png"/></td>
    </tr>
</table>

# FAQ

---

[buymecoffee]: https://paypal.me/Elwinmage
[buymecoffeebadge]: https://img.shields.io/badge/buy%20me%20a%20coffee-donate-yellow.svg?style=flat-square
