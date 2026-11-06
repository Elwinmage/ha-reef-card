[← Volver a la página principal](README.es.md)

# Comedero VSON (modificado)

La tarjeta controla un comedero automático VSON cuyo controlador se ha sustituido por un ESP32 (Lolin S2 mini) con [ESPHome](https://esphome.io). El comedero conserva su motor, su sensor de trampilla y su sensor de nivel de comida; el firmware añade cinco franjas de alimentación y un interruptor de alimentación manual.

<img src="../img/vsonfeeder/overview.png" width="400"/>

## Modificar el comedero

El comedero (VSON WP8621 V1.2) se abre y su placa original se sustituye por un ESP32: el cableado del motor, del sensor de trampilla y del sensor de nivel, y el flasheo, se explican en este hilo de la comunidad Home Assistant: [VSON WP8621 V1.2 fish feeder](https://community.home-assistant.io/t/vson-wp8621-v12-fish-feeder/759621).

## Firmware

La configuración ESPHome está en [doc/esphome/vson-fish-feeder.yaml](../esphome/vson-fish-feeder.yaml). Ponga sus claves y contraseñas en `secrets.yaml` (`fish_feeder_api_key`, `fish_feeder_ota_password`, `fish_feeder_ap_password`, más `wifi_ssid` y `wifi_password`).

Los dispositivos ESPHome no tienen ningún identificador en el que la tarjeta pueda confiar, así que el comedero se reconoce por el **nombre de proyecto** que declara su firmware:

```yaml
esphome:
  project:
    name: "vson.fish_feeder"
    version: "1.2.0"
```

Home Assistant lo convierte en el fabricante (`vson`) y el modelo (`fish_feeder`) del dispositivo. Una vez flasheado, el comedero aparece en el selector de dispositivos de la tarjeta. Cualquier otro dispositivo ESPHome se ignora.

Las entidades se encuentran por el final de su id de entidad, así que el dispositivo puede renombrarse libremente. Conserve los nombres de entidad del firmware (`Manual Feed`, `Open/Close Sensor`, `Food Level Sensor`, `Slot 1`…`Slot 5`, `Portion slot 1`…`Portion slot 5`).

## La vista

La tarjeta se divide en 2 zonas:

1. El comedero
2. Las franjas de alimentación

### 1. El comedero

La imagen sigue a los sensores:

|                       | Reserva OK                                                                 | Reserva baja                                                                |
| --------------------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| **Trampilla cerrada** | <img src="../../src/img/esphome/VSONFEEDER/closed_full.webp" width="120"/> | <img src="../../src/img/esphome/VSONFEEDER/closed_empty.webp" width="120"/> |
| **Trampilla abierta** | <img src="../../src/img/esphome/VSONFEEDER/open_full.webp" width="120"/>   | <img src="../../src/img/esphome/VSONFEEDER/open_empty.webp" width="120"/>   |

- Mientras la trampilla está abierta (o el motor gira), caen gránulos.
- Cuatro cosas van pegadas al comedero, deformadas para seguir sus caras:
  - en la cara frontal, sobre la trampilla, una pequeña pantalla da el **tiempo de actividad** del controlador (un clic abre el sensor);
  - en el cristal de la tapa, un aviso rojo **parpadea** cuando el sensor de nivel indica que la reserva está baja (un clic abre el sensor);
  - en la cara derecha, las **alimentaciones del día**: tachadas en gris una vez pasada su hora, la siguiente en naranja, las posteriores en verde. Solo las horas dicen cuáles han pasado: el firmware no guarda registro de las porciones dadas;
  - más abajo en la cara derecha, el botón de **reinicio**: un primer toque lo arma (se vuelve naranja), un segundo toque en 3 segundos reinicia el controlador.
- Un clic en la imagen abre el sensor de trampilla.
- El icono <img src="https://raw.githubusercontent.com/Templarian/MaterialDesign/master/svg/wrench-clock.svg" width="16"/> de la esquina superior derecha abre las tareas de mantenimiento del comedero, si las tiene.

<img src="../img/vsonfeeder/feeding.png" width="400"/>

### 2. Las franjas de alimentación

- **Próxima alimentación**: la hora de la próxima franja, el tiempo restante y sus porciones.
- **Franjas**: las cinco franjas del firmware. La hora se edita en el sitio (`time.set_value`), las porciones con los botones − y + (`number.set_value`, de 0 a 10). Una franja con 0 porciones está apagada y en gris. La próxima franja se resalta.
- Una franja a la misma hora que otra anterior se muestra tachada: el firmware la omite mientras la primera sigue alimentando.
- **Porciones al día**: las porciones realmente dadas en un día.
- **Alimentar ahora**: da una porción (activa el interruptor `Manual Feed`; el firmware lo apaga cuando la trampilla se ha vuelto a cerrar).

<img src="../img/vsonfeeder/reserve_low.png" width="300"/>

Cuando Home Assistant no puede alcanzar el controlador, la imagen se vuelve gris y el título indica _Inaccesible_.
