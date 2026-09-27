[← Volver a la página principal](README.es.md)

# Mantenimiento

La vista de mantenimiento de ha-reef-card en acción:

[![Ver el vídeo](https://img.youtube.com/vi/Ko46fHonOP4/0.jpg)](https://www.youtube.com/watch?v=Ko46fHonOP4)

<img src="../img/maintenance/overview.png"/>

Más allá de las vistas por dispositivo, la tarjeta ofrece una vista
**Mantenimiento** que reúne todas las tareas de mantenimiento expuestas por
`ha-reefbeat-component`, `ha-reef-maintenance-component` y
`ha-aquamedic-component`, como si todo el subsistema de mantenimiento fuera un
único dispositivo. La vista busca la marca que cada una de ellas pone en sus
entidades, no una integración concreta.

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

### Filtrar por dispositivo

Por defecto la vista lista las tareas de todos los dispositivos. El bloque
**Filtrar por dispositivo** del editor de la tarjeta la restringe: marca uno o
varios dispositivos y solo se conservan sus tareas, contadores incluidos.

<img src="../img/maintenance/editor_devices.png"/>

La lista contiene una entrada por controlador, con el número de tareas que le
corresponden. Los subdispositivos (cabezales ReefDose, bombas ReefRun) se
agrupan bajo su controlador gracias al enlace `via_device` del registro de Home
Assistant: marcar **RSDose4** conserva por tanto las tareas de los cuatro
cabezales. Ninguna casilla marcada significa «sin filtro»: se muestran todos los
dispositivos, que es también lo que restaura el atajo **Mostrar todos los
dispositivos**.

La selección se guarda como nombres de dispositivo (ver `devices` más abajo),
para que el YAML siga siendo legible. Un nombre escrito a mano también coincide
con sus subdispositivos por prefijo, lo que cubre las instalaciones donde
`via_device` no está declarado. Los dispositivos sin nombre se identifican por
su id de dispositivo de Home Assistant.

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

El estado por defecto de los filtros, el filtro por dispositivo y la visibilidad
de los tres botones se ajustan desde el editor de la tarjeta.

<img src="../img/maintenance/editor.png"/>

## Configuración

```yaml
type: custom:reef-card
device: __maintenance__
maintenance:
  sort: due # "device" (por defecto) o "due"
  devices: # mostrar solo las tareas de estos dispositivos (vacío: todos)
    - SIMU-RSDOSE4
    - SIMU-RSATO
  hide_ok: false # ocultar las tareas ni vencidas ni próximas a vencer
  hide_muted: false # ocultar las tareas con las notificaciones apagadas
  warning_ratio: 0.2 # parte del intervalo mostrada en naranja
  show_reset: true # mostrar el botón "marcar como hecha" en cada fila
  show_notify: true # mostrar la campana de silenciar/activar en cada fila
  show_interval: true # mostrar el botón de edición del intervalo en cada fila
```

Todas las claves de `maintenance` son opcionales. `sort` y `hide_ok` solo fijan
el estado inicial: el usuario puede cambiarlos desde la propia vista. `devices`
acepta tanto nombres de dispositivo como ids de dispositivo de Home Assistant;
una lista vacía (el valor por defecto) desactiva el filtro.

---

[← Volver a la página principal](README.es.md)
