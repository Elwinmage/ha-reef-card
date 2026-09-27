[← Volver a la página principal](README.es.md)

# ReefRun

ReefRun con ha-reef-card en acción:

[![Ver el vídeo](https://img.youtube.com/vi/Xxv38OPqiGI/0.jpg)](https://www.youtube.com/watch?v=Xxv38OPqiGI)

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

---

[← Volver a la página principal](README.es.md)
