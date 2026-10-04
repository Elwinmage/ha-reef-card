[← Volver a la página principal](README.es.md)

# Respaldo de energía

La tarjeta dibuja los flujos de energía de [reefbeatEnergyBackup](https://github.com/Elwinmage/reefbeatEnergyBackup): la red, la batería, el acuario y hasta cuatro bombas con su velocidad.

<img src="../img/energybackup/overview.png"/>

El servicio publica sus sensores por MQTT: su dispositivo (`Reef Battery Backup` por defecto) aparece en el selector de dispositivos de la tarjeta en cuanto Home Assistant lo descubre. No hay nada más que configurar: la tarjeta encuentra sola los sensores y las bombas.

## Power Flow Card Plus

Los flujos los dibuja [Power Flow Card Plus](https://github.com/flixlix/power-flow-card-plus), una tarjeta aparte que hay que instalar (HACS → Frontend). Mientras falte, la vista muestra un enlace que la abre en HACS:

<img src="../img/energybackup/install.png"/>

Los flujos sustituyen a ese panel en cuanto la tarjeta está cargada. Su configuración la escribe la reef card: no hace falta YAML de `power-flow-card-plus`, ni sensor de plantilla, ni `config-template-card`.

## Qué se muestra

| Nodo        | Muestra                                                                           | Leído de                                                    |
| ----------- | --------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| **Red**     | Potencia entregada por el cargador. Durante un corte: **Corte** y su duración     | Potencia del cargador, estado de la red, duración del corte |
| **Batería** | Potencia de carga o descarga, estado de carga                                     | Potencia de la batería, SoC de la batería                   |
| **Acuario** | Lo que consume el equipo (red y batería juntas), con la autonomía restante debajo | Calculado por la tarjeta de flujos, autonomía               |
| **Bombas**  | Velocidad en %, sentido de una bomba de olas, icono según la velocidad            | ReefWave, bombas ReefRun, bombas Aqua Medic                 |

- La potencia del cargador solo existe con un cargador Victron. Sin ella, el nodo de red solo indica si hay red, y el nodo acuario muestra lo que entrega la batería: nada con red, ya que el monitor de batería solo ve la corriente de la batería.
- Un clic en un nodo abre la entidad correspondiente.
- El icono `mdi:wrench-clock` abre las tareas de mantenimiento del dispositivo (la prueba de descarga de la batería), como en las demás vistas.

## Bombas

Las bombas se buscan entre los ReefWave, las bombas ReefRun y las bombas Aqua Medic de la instalación. Por defecto el flujo muestra las que controla el servicio de respaldo (publica su lista: una bomba añadida o retirada con `configure.py` se actualiza tras reiniciar el servicio). Si el servicio no publica la lista, se muestran las primeras bombas que aún responden, primero las bombas de olas. La tarjeta de flujos dibuja cuatro bombas como máximo: con más, marque las que mostrar en el editor de la tarjeta.

<img src="../img/energybackup/editor.png"/>

La selección se guarda con las opciones del dispositivo, como identificadores de dispositivo de Home Assistant:

```yaml
type: custom:reef-card
device: reef_battery
conf:
  ENERGYBACKUP:
    devices:
      reef_battery:
        pumps:
          - 0a1b2c3d4e5f60718293a4b5c6d7e8f9
          - 9f8e7d6c5b4a39281706f5e4d3c2b1a0
```
