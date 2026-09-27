[← Volver a la página principal](README.es.md)

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

---

[← Volver a la página principal](README.es.md)
