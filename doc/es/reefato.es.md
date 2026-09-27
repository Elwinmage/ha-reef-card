[← Volver a la página principal](README.es.md)

# ReefATO

ReefATO+ con ha-reef-card en acción:

[![Ver el vídeo](https://img.youtube.com/vi/2R0DHp2eqT4/0.jpg)](https://www.youtube.com/watch?v=2R0DHp2eqT4)

La tarjeta ReefATO+ permite gobernar visualmente el controlador RSATO+, el
depósito de agua osmotizada con su bomba, la sonda de nivel sujeta al cristal y
la sonda de fugas en el suelo.

La sonda de nivel del ReefATO+ siempre se dibuja. La **bomba** y la **sonda de
fugas** son opcionales. La que el dispositivo no reporta no se dibuja en
absoluto, y los controles que dependen de ella se ocultan con ella: un ReefATO+
sin sonda de fugas muestra una tarjeta sin sonda de fugas, no una sonda
atenuada.

<img src="../img/rsato/rsato_zones.png"/>

La tarjeta está dividida en 7 zonas:

1. Controlador: modo de funcionamiento, encendido, modo mantenimiento, configuración, Wifi y reposición automática
2. Ajustes de los accesorios: bomba de reposición, sonda de fugas, sonda de nivel
3. Depósito de agua osmotizada: controles de llenado, volumen restante y autonomía
4. Zumbador
5. Sonda de fugas
6. Acuario: nivel de agua, temperatura y consumo diario
7. Último mensaje y última alerta

## Controlador

<img src="../img/rsato/zone_1.png"/>

---

El texto en la cara del controlador es el **modo de funcionamiento** que reporta
el dispositivo (Auto, Manual, Fuga…), traducido al idioma de Home Assistant.

<span>El interruptor <img src="../img/mdi/mdi_power-plug.png" width="20"/> enciende o apaga el ReefATO+.</span>

<img src="../img/rsato/off_mode.png" width="50%"/>

<span>El interruptor <img src="../img/mdi/mdi_account-wrench.png" width="20"/> cambia al modo mantenimiento.</span>

<img src="../img/rsato/maintenance.png" width="50%"/>

<span>Pulse el icono <img src="../img/rsdose/cog_icon.png" width="30"/> para gestionar la configuración general del ReefATO+: actualizar los ajustes o los datos consultados, reiniciar el dispositivo, actualizar su firmware.</span>

<img src="../img/rsato/zone_1_dialog_config.png" width="50%"/>

<span>Pulse el icono <img src="../img/mdi/wifi_icon.png" width="30"/> para gestionar los ajustes de red.</span>

<img src="../img/rsato/zone_1_dialog_wifi.png" width="50%"/>

<span>El interruptor <img src="../img/mdi/mdi_waves-arrow-up.png" width="20"/> de la segunda fila activa o desactiva la **reposición automática**. Desactivado, el dispositivo nunca llena por su cuenta y solo los botones de la zona 3 siguen actuando sobre la bomba. Se oculta cuando no hay ninguna bomba emparejada.</span>

## Ajustes de los accesorios

<img src="../img/rsato/zone_2.png"/>

---

Los tres iconos siguen las tres tomas del panel frontal, en el mismo orden: de
izquierda a derecha la **bomba de reposición**, la **sonda de fugas** y la **sonda
de nivel**. Cada uno abre un diálogo dedicado a ese accesorio. Los iconos de la
bomba y de la sonda de fugas desaparecen junto con el accesorio cuando su toma no
se usa.

<span>El icono de la bomba <img src="../img/mdi/mdi_pump.png" width="30"/> muestra el estado de funcionamiento, el consumo y el caudal medidos, los tres umbrales de corriente con los que el firmware decide si hay marcha en seco o bloqueo, y qué provocó el último llenado.</span>

<img src="../img/rsato/zone_2_dialog_pump.png" width="50%"/>

<span>El icono de la sonda de fugas <img src="../img/mdi/mdi_pipe-leak.png" width="30"/> muestra si la sonda está conectada, si está armada, el veredicto seco/mojado y la lectura bruta que hay detrás, además del zumbador que esta sonda activa.</span>

<img src="../img/rsato/zone_2_dialog_leak.png" width="50%"/>

<span>El icono de la sonda de nivel <img src="../img/mdi/mdi_hydraulic-oil-level.png" width="30"/> muestra primero el estado de salud de la sonda — conectada, calibrada, a revisar, en error — porque una sonda sin calibrar o sucia deja sin valor todas las lecturas siguientes. Después el nivel en sí, los dos electrodos que hay detrás, el sensor de temperatura que comparte el mismo cuerpo, y la identidad y las fechas de servicio del cartucho.</span>

<img src="../img/rsato/zone_2_dialog_ato_sensor.png" width="50%"/>

## Depósito de agua osmotizada

<img src="../img/rsato/zone_3.png"/>

---

Esta zona es el depósito del que toma la reposición, y los tres botones que
gobiernan su bomba a mano:

<table>
  <tr>
    <td align="center"><img src="../img/mdi/mdi_water-pump.png" width="40"/><br/><b>Llenar</b><br/>Inicia un llenado manual</td>
    <td align="center"><img src="../img/mdi/mdi_water-pump-off.png" width="40"/><br/><b>Parar</b><br/>Detiene el llenado en curso</td>
    <td align="center"><img src="../img/mdi/mdi_play-circle-outline.png" width="40"/><br/><b>Reanudar</b><br/>Reactiva la bomba</td>
  </tr>
</table>

Esta parte muestra el nivel de la reserva de agua, calculado a partir de la
capacidad declarada del depósito y del valor real. Un depósito vacío sigue
mostrando una línea de agua: la que la bomba no puede aspirar. Por debajo del
10 % el agua parpadea, para indicar que el depósito pronto estará vacío.

Pulsar sobre el agua abre el diálogo del depósito, donde se puede editar la
capacidad:

<img src="../img/rsato/zone_3_dialog_ato_tank.png" width="50%"/>

La cifra abajo a la izquierda del depósito es la **autonomía**: los días que
quedan antes de que se seque, calculados por la integración a partir del consumo
diario medio. Al pulsarla se abre su ficha de información.

Mientras hay un llenado en curso, el agua sale por la salida sobre el sump.

<img src="../img/rsato/zone_3_filling.png"/>

## Zumbador

<img src="../img/mdi/mdi_bell-ring_red.png" width="40"/>

---

<span>La campana <img src="../img/mdi/mdi_bell-ring_red.png" width="20"/> <img src="../img/mdi/mdi_bell-off_red.png" width="20"/> sigue el ajuste del zumbador del dispositivo, y se atenúa cuando está desactivado.</span>

Al pulsarla se abre el diálogo del zumbador: el ajuste en sí, si está sonando en
este momento, y el estado de la sonda de fugas como contexto.

<img src="../img/rsato/zone_4_dialog_buzzer.png" width="50%"/>

Una **pulsación larga** conmuta el zumbador directamente. Los dos gestos están
separados a propósito: silenciar la alarma es un ajuste de seguridad, no algo que
hacer sin querer mientras se busca el detalle.

> [!NOTE]
> El zumbador no es solo la alarma de fugas: el dispositivo también lo hace sonar
> ante fallos de la bomba, por lo que sigue disponible en un ReefATO+ sin sonda
> de fugas. El icono solo se oculta en las versiones de la integración que aún no
> exponen el ajuste.

## Sonda de fugas

<img src="../img/rsato/zone_5.png"/>

---

La sonda solo se dibuja cuando está físicamente conectada. Conectada pero
desactivada en la aplicación, aparece atenuada: está ahí, no detecta nada.

Cuando se detecta agua, la sonda parpadea y un charco se extiende al pie de la
imagen.

<table>
  <tr>
    <th align="center">Fuga en el acuario</th>
    <th align="center">Fuga en el depósito de agua osmotizada</th>
    <th align="center">Fuga de origen desconocido</th>
  </tr>
  <tr>
    <td align="center"><img src="../img/rsato/zone_5_leak_aquarium.png"/></td>
    <td align="center"><img src="../img/rsato/zone_5_leak_rodi.png"/></td>
    <td align="center"><img src="../img/rsato/zone_5_leak_unknown.png"/></td>
  </tr>
</table>

## Acuario

<img src="../img/rsato/zone_6.png"/>

---

El nivel de agua de esta parte indica el estado de detección de la sonda ATO.

| Estado          | Significado                                                        |
| --------------- | ------------------------------------------------------------------ |
| Por debajo      | La superficie está bajo la sonda: la reposición no da abasto       |
| Nivel deseado 1 | Primera marca de reposición                                        |
| Nivel deseado 2 | Segunda marca de reposición                                        |
| Por encima      | La superficie está sobre la sonda: el acuario está demasiado lleno |

Ambos extremos son anómalos, así que **Por debajo** y **Por encima** hacen
parpadear el agua. Una sonda en error, o una entidad que aún no ha reportado, no
tiene altura alguna: la tarjeta dibuja su marca de falta de lectura en lugar de
un acuario vacío.

<table>
  <tr>
    <th align="center">Por debajo</th>
    <th align="center">Nivel deseado 1</th>
    <th align="center">Nivel deseado 2</th>
    <th align="center">Por encima</th>
    <th align="center">Sin lectura</th>
  </tr>
  <tr>
    <td align="center"><img src="../img/rsato/zone_6_water_level_below.png"/></td>
    <td align="center"><img src="../img/rsato/zone_6_water_level_1.png"/></td>
    <td align="center"><img src="../img/rsato/zone_6_water_level_2.png"/></td>
    <td align="center"><img src="../img/rsato/zone_6_water_level_above.png"/></td>
    <td align="center"><img src="../img/rsato/zone_6_water_level_error.png"/></td>
  </tr>
</table>

La temperatura en la parte baja del acuario viene del sensor integrado en la
sonda de nivel, y solo se reporta cuando está activado en el dispositivo.

El gráfico de la esquina es el **consumo del día**: el volumen repuesto desde
medianoche, relleno en naranja, frente a la media diaria móvil en rojo. La
ventana está fijada al día natural y no a 24 horas móviles, ya que el contador se
pone a cero a medianoche.

Pulsar el gráfico abre el diálogo de consumo, la misma historia con las cifras
escritas: llenados y volumen, medidos hoy, como media diaria y como total
acumulado, además de lo que le queda al depósito para alimentarlos.

<img src="../img/rsato/zone_6_dialog_usage.png" width="50%"/>

## Fallos

La tarjeta no tiene un piloto de aviso aparte: lo que falla es lo que parpadea,
bajo un tinte rojo claro.

| Elemento que parpadea | Lo que reporta el dispositivo                                                                               |
| --------------------- | ----------------------------------------------------------------------------------------------------------- |
| La bomba              | Avería, bomba bloqueada, llenado demasiado largo, depósito vacío, o falta la sonda de nivel                 |
| La sonda de fugas     | Agua detectada, del lado del osmotizador o del lado del acuario                                             |
| El nivel de agua      | La superficie está por debajo o por encima de la sonda                                                      |
| Toda la imagen        | La sonda de nivel pide ser revisada, o no consigue medir — todos los niveles mostrados dejan de ser fiables |

Una bomba reportada como ausente no es un fallo: la bomba, los botones de
llenado, el depósito y el gráfico de consumo simplemente no se dibujan.

## Mensajes

<img src="../img/rsato/zone_7.png"/>

---

Esta zona muestra los últimos mensajes de sistema del ReefATO+. Tiene dos líneas:

- La línea gris muestra el **último mensaje** recibido.
- La línea rosa muestra la **última alerta**, precedida del símbolo ⚠.

Al pulsar el icono <img src="../img/mdi/mdi_delete-empty.png" width="20"/> se borra el mensaje correspondiente.

Estas líneas se pueden ocultar desde la interfaz del editor de la tarjeta.

## Editor de la tarjeta

<img src="../img/rsato/editor.png" width="50%"/>

---

Además de las dos líneas de mensajes, el ReefATO+ tiene tres opciones. Existen
para un circuito de reposición para el que el dispositivo no fue diseñado: un
osmotizador conectado directamente al sump, con una válvula gobernada por Home
Assistant en lugar de por la bomba Red Sea.

### Depósito de agua osmotizada infinito

Desactivado por defecto. Un osmotizador que repone sobre la marcha no tiene
recipiente, así que nada puede vaciarse — y todo lo que la tarjeta dice del
depósito habla de un recipiente que no existe.

Activado, se retiran el porcentaje sobre el depósito y el diálogo que hay detrás,
la autonomía pasa a ser ∞, y se ocultan el icono de ajustes de la bomba y el
botón de reanudar: una alimentación continua no tiene ciclo de llenado que
devolver al dispositivo. El agua, los botones de llenado y el gráfico de consumo
se mantienen.

### Entidad del volumen dosificado

Un interruptor y un selector de entidad. Activado, la curva naranja del gráfico
diario se lee desde una entidad suya — un caudalímetro en la línea osmotizada —
en lugar del contador del dispositivo. La media móvil roja sigue siendo la del
dispositivo: solo cambia el origen del volumen, no la comparación frente a la que
se dibuja.

El interruptor es lo que lo activa, de modo que una entidad que quede de una
configuración anterior se ignora en vez de volver a tomar el mando en silencio.

### Entidades de llenado y de parada

Cualquiera de los dos botones puede vincularse a una entidad de otra integración,
para gobernar su propia válvula. El servicio se deduce del dominio de la entidad,
ya que elegir una ya dice de cuál se trata:

| Dominio de la entidad     | Llenar       | Parar         |
| ------------------------- | ------------ | ------------- |
| `button`, `input_button`  | `press`      | `press`       |
| `switch`, `input_boolean` | `turn_on`    | `turn_off`    |
| `valve`                   | `open_valve` | `close_valve` |
| `script`                  | `turn_on`    | `turn_on`     |

Un solo interruptor es un control completo: encendido llena, apagado para. Deje
el otro selector vacío y el segundo botón reutiliza la misma entidad con el
servicio opuesto — lo mismo vale para un `input_boolean` o una `valve`. Dos
botones de pulsación hay que elegirlos por separado, porque una pulsación no
lleva dirección.

Un control vinculado tampoco sigue ya a la bomba Red Sea: permanece visible en un
ReefATO+ que no reporta ninguna bomba, que es justo el motivo de vincularlo.

Las opciones se guardan bajo el modelo tal y como lo reporta Home Assistant:

```yaml
type: custom:reef-card
device: MY-RSATO
conf:
  RSATO+:
    devices:
      MY-RSATO:
        infinite_tank: true
        external_usage: true
        external_usage_entity: sensor.rodi_flow_meter
        fill_entity: switch.rodi_valve
        stop_fill_entity: "" # vacío: el interruptor de arriba también lo para
```

---

[← Volver a la página principal](README.es.md)
