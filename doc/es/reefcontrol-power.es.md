[← Volver a la página principal](README.es.md)

# ReefControl-Power

ReefControl y ReefControl-Power con ha-reef-card en acción:

[![Ver el vídeo](https://img.youtube.com/vi/voFobfc7Slk/0.jpg)](https://www.youtube.com/watch?v=voFobfc7Slk)

La tarjeta ReefControl-Power dibuja el Power Center con sus tomas, lo que está
enchufado en cada una, y a su izquierda su propia sonda de temperatura o el
[ReefControl](reefcontrol.es.md#reefcontrol) con el que está emparejado.

Se admiten los dos modelos: solo difieren en su número de tomas.

<table>
  <tr>
    <th align="center">RSPOWER6</th>
    <th align="center">RSPOWER8</th>
  </tr>
  <tr>
    <td align="center"><img src="../img/rspower/rspower6.png"/></td>
    <td align="center"><img src="../img/rspower/rspower8.png"/></td>
  </tr>
</table>

El resto de esta sección se ilustra con el RSPOWER6: todo funciona igual en el
RSPOWER8.

<img src="../img/rspower/rspower_zones.png"/>

La tarjeta está dividida en 6 zonas:

1. Estado de alimentación y modo mantenimiento
2. Configuración, Wifi y batería
3. Tomas
4. Sonda de temperatura o enlace ReefControl
5. Dispositivos vinculados
6. Último mensaje y última alerta

## Estado de alimentación y modo mantenimiento

<img src="../img/rspower/zone_1.png"/>

---

<span>El interruptor <img src="../img/mdi/mdi_power-plug.png" width="20"/> enciende o apaga el ReefControl-Power.</span>

<img src="../img/rspower/off_mode.png" width="50%"/>

Apagado, la tarjeta solo conserva el interruptor, la imagen de la sonda de
temperatura o del ReefControl emparejado, y los enlaces a otros dispositivos: el
nombre del hub y los dispositivos enchufados en las tomas siguen abriendo su
propia tarjeta. Las tomas pierden sus botones, nombres y consumo, y la sonda su
lectura y sus ajustes.

<span>El interruptor <img src="../img/mdi/mdi_account-wrench.png" width="20"/> cambia al modo mantenimiento.</span>

<img src="../img/rspower/maintenance.png" width="50%"/>

## Configuración / Información Wifi

<img src="../img/rspower/zone_2.png"/>

---

<span>Pulse el icono <img src="../img/rsdose/cog_icon.png" width="30"/> para gestionar la configuración general del ReefControl-Power: actualizar los ajustes o los datos consultados, reiniciar el dispositivo, actualizar su firmware, y ver su región y su número de tomas.</span>

El mismo diálogo añade o elimina la sonda de temperatura local, y desempareja el
ReefControl. La sonda y el hub se excluyen: un botón que no se aplica aparece en
gris en lugar de ocultarse, para que vea qué acciones existen.

<img src="../img/rspower/zone_2_dialog_config.png" width="50%"/>

<span>Pulse el icono <img src="../img/mdi/wifi_icon.png" width="30"/> para gestionar los ajustes de red.</span>

<img src="../img/rspower/zone_2_dialog_wifi.png" width="50%"/>

<span>El icono <img src="../img/mdi/battery.png" width="30"/> indica el nivel de batería del ReefControl-Power.</span>

## Tomas

<img src="../img/rspower/zone_3.png"/>

---

El texto de la cara del Power Center es su **modo de funcionamiento** (Auto,
Setup…), junto al **consumo total** de sus tomas. Un clic en el consumo abre su
diálogo de información.

Cada toma muestra, de arriba abajo:

- Su **nombre**.
- Su **botón**, enmarcado en el color de la toma, con el icono rojo cuando la
  toma está alimentada y gris cuando está apagada. Muestra un enchufe, o el icono
  del dispositivo conectado (ver [Dispositivos vinculados](#dispositivos-vinculados)).
- Su **consumo**, que abre su diálogo de información.

Unos pequeños iconos en la parte baja del botón indican cómo se controla la toma:

| Icono                                                                                                                                                                                                                                                                                                                               | Significado                                                                |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| <img src="../img/mdi/mdi_power.png" width="20"/>                                                                                                                                                                                                                                                                                    | Encendida o apagada a mano                                                 |
| <img src="../img/mdi/mdi_clock-time-nine-outline.png" width="20"/>                                                                                                                                                                                                                                                                  | Sigue un programa — un clic abre su editor                                 |
| <img src="../img/mdi/mdi_thermometer.png" width="20"/> <img src="../img/mdi/mdi_ph.png" width="20"/> <img src="../img/mdi/mdi_water-percent.png" width="20"/> <img src="../img/mdi/mdi_flash-triangle.png" width="20"/> <img src="../img/mdi/mdi_water-alert.png" width="20"/> <img src="../img/mdi/mdi_cup-water.png" width="20"/> | Sigue una sonda: temperatura, pH, salinidad, ORP, fuga o nivel de agua ATO |
| <img src="../img/mdi/mdi_hand-back-left-outline.png" width="20"/>                                                                                                                                                                                                                                                                   | Su programa o su sonda está suspendido: la toma se apagó a mano            |

Una toma nunca configurada muestra un **+** en lugar de su botón: un clic abre
sus ajustes para darle un modo.

Un **clic** en el botón abre los ajustes de la toma. Una **pulsación larga**
enciende o apaga la toma directamente.

### Toma

<img src="../img/rspower/zone_3_dialog_socket.png" width="50%"/>

El diálogo empieza con el nombre, el interruptor, el estado y el consumo de la
toma, y luego ofrece sus cuatro modos:

- **Encendido** / **Apagado**: la toma se queda alimentada, o no.
- **Programar**: una línea de tiempo de 24 horas y la lista de sus intervalos de
  **encendido**. Añada, edite o elimine intervalos; un intervalo que termina
  antes de empezar, o que se solapa con el anterior, se explica bajo la lista y
  bloquea el guardado.

<img src="../img/rspower/zone_3_socket_schedule.png" width="50%"/>

- **Sensor**: la toma sigue una sonda — la sonda de temperatura local del Power
  Center, o cualquier sonda del ReefControl emparejado, temperaturas integradas
  incluidas. Elija si la toma se **enciende** o se **apaga**, cuando la lectura
  pasa **por encima** o **por debajo** de un **umbral**, con una **histéresis**
  (una banda muerta alrededor del umbral, para que la toma no parpadee), y qué
  hacer si se pierde la sonda. Una toma que sigue una sonda ATO no necesita
  umbral.

<img src="../img/rspower/zone_3_socket_sensor.png" width="50%"/>

No se envía nada al dispositivo hasta pulsar **Guardar**.

Cuando una toma que sigue un programa o una sonda se ha apagado a mano, el
diálogo se abre en ese modo automático, indica que está suspendido y ofrece
**reanudarlo** sin reescribir su programa ni su regla.

<img src="../img/rspower/zone_3_socket_override.png" width="50%"/>

<span>El icono de papelera <img src="../img/mdi/mdi_delete-empty.png" width="20"/> arriba a la derecha borra la configuración de la toma, tras una confirmación: la toma recupera su nombre de fábrica y ya no tiene modo.</span>

<img src="../img/rspower/zone_3_dialog_delete.png" width="50%"/>

## Sonda de temperatura o enlace ReefControl

La izquierda de la tarjeta muestra de dónde lee el Power Center su temperatura:
de su propia sonda o del ReefControl con el que está emparejado. Ambos se
excluyen.

### Sonda de temperatura

<img src="../img/rspower/zone_4_temperature.png"/>

---

La sonda de temperatura local se dibuja enchufada al Power Center, con su lectura
del color de su nivel y una barra de situación a lo largo de la sonda (un punto
en el modo compacto del editor de la tarjeta). Un clic en la barra abre las
últimas 24 horas de la temperatura sobre sus bandas.

Una sonda desconectada parpadea bajo un ligero tono rojo.

<span>Un clic en la rueda dentada <img src="../img/rsdose/cog_icon.png" width="30"/> abre los ajustes de la sonda: su nombre, un botón para leerla ahora, sus rangos deseado y aceptable, su calibración con la temperatura real, y sus interruptores de registro y de notificaciones.</span>

<img src="../img/rspower/zone_4_dialog_temperature.png" width="50%"/>

### Enlace ReefControl

<img src="../img/rspower/zone_4_rscontrol.png"/>

---

Un ReefControl emparejado ocupa el lugar de la sonda: su cable se dibuja con el
nombre del hub a lo largo. Un clic en el nombre abre la tarjeta del hub.

<span>El icono <img src="../img/mdi/mdi_web.png" width="20"/> abre el diálogo del enlace: el hub emparejado, su tipo y su estado, y si está conectado al Power Center y a internet.</span>

<img src="../img/rspower/zone_4_dialog_rscontrol.png" width="50%"/>

Cuando el hub está emparejado pero no responde, el enlace parpadea bajo un ligero
tono rojo.

## Dispositivos vinculados

<img src="../img/rspower/zone_5.png"/>

---

El Power Center no sabe qué está enchufado en sus tomas: la tarjeta le permite
indicarlo desde el editor de la tarjeta. Una toma vinculada a un dispositivo Red
Sea o a una bomba Aqua Medic muestra:

- una imagen del dispositivo bajo la toma, en dos filas escalonadas para que las
  vecinas no se solapen, unida a ella por un tubo del color de la toma (gris
  mientras la toma está apagada);
- el icono del dispositivo en el botón de la toma, en lugar del enchufe.

Una bomba ReefRun se representa por su función, bomba de retorno o skimmer, en
lugar de por su controlador. Cualquier otro dispositivo conocido por Home
Assistant también puede vincularse, pero aún no tiene imagen.

Para un aparato que Home Assistant no conoce (calentador, lámpara, ventilador…), elija **Otro**: el botón de la toma muestra entonces <img src="../img/mdi/mdi_dots-horizontal-circle-outline.png" width="20"/> en lugar del enchufe, sin imagen debajo.

La imagen sigue el estado del dispositivo:

| Aspecto     | Estado del dispositivo Red Sea                                                         |
| ----------- | -------------------------------------------------------------------------------------- |
| Normal      | Funciona normalmente                                                                   |
| En gris     | Apagado                                                                                |
| Parpadeante | Todo lo demás: modo manual, mantenimiento, no disponible, una bomba fuera de servicio… |

Los dispositivos de otras integraciones siempre se dibujan normales.

Un clic en la imagen abre la tarjeta del dispositivo.

## Mensajes

<img src="../img/rspower/zone_6.png"/>

---

Esta zona muestra los últimos mensajes de sistema del ReefControl-Power. Tiene dos líneas:

- La línea gris muestra el **último mensaje** recibido.
- La línea rosa muestra la **última alerta**, precedida del símbolo ⚠.

Al pulsar el icono <img src="../img/mdi/mdi_delete-empty.png" width="20"/> se borra el mensaje correspondiente.

Estas líneas se pueden ocultar desde la interfaz del editor de la tarjeta.

## Editor de la tarjeta

<img src="../img/rspower/editor.png" width="50%"/>

---

Además de las dos líneas de mensajes, el ReefControl-Power tiene tres opciones:

- **Sondas compactas**: la temperatura se muestra como un punto del color de su
  nivel en lugar de una barra de situación.
- **Colores de las tomas**: el color de cada toma, usado por su botón y por el
  tubo hacia su dispositivo vinculado.
- **Dispositivo vinculado**: por toma, el dispositivo enchufado en ella, o
  **Ninguno**. **Otro** designa un aparato que Home Assistant no conoce.

Las opciones se guardan bajo el modelo tal como lo informa Home Assistant:

```yaml
type: custom:reef-card
device: MY-RSPOWER
conf:
  RSPOWER6:
    devices:
      MY-RSPOWER:
        compact_probes: false
        sockets:
          socket_1:
            color: "255,0,0"
            linked_device: 0123456789abcdef0123456789abcdef
          socket_3:
            linked_device: fedcba9876543210fedcba9876543210
```

---

[← Volver a la página principal](README.es.md)
