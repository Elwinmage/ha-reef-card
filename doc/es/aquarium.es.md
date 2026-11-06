[← Volver a la página principal](README.es.md)

# Vista de acuario

Una segunda tarjeta, `custom:reef-aquarium-card`, muestra una foto de su acuario con sus dispositivos y entidades, el agua iluminada por sus lámparas y, si lo desea, peces y corales vivos. Necesita la [integración ReefTank](https://github.com/Elwinmage/ha-reeftank-component), que guarda los acuarios y sus imágenes.

<img src="../img/aquarium/preview.webp"/>

## Primeros pasos

1. Añada una **Reef Aquarium Card** a un panel (`custom:reef-aquarium-card`).
2. En su editor, cree un acuario (**Nuevo acuario**) y luego **Editar la escena**.
3. **Vistas**: suba una foto de su acuario, contornee el agua, trace la línea de arena y las rocas.
4. **Dispositivos** y **Luz y corriente**: coloque sus dispositivos y entidades en la imagen, sitúe sus lámparas.
5. **Fauna**: añada sus peces y corales y guarde.

La configuración de la tarjeta solo contiene el id del acuario; todo lo demás lo guarda la integración:

```yaml
type: custom:reef-aquarium-card
aquarium: a1b2 # chosen in the card editor
render: static # optional: static, light or full; can only lower the aquarium's level
view: front # optional: the view to start on
```

Con una cuenta en la nube ReefBeat, el acuario de la nube rellena las dimensiones, las lámparas y los atajos de alimentación, y filtra los dispositivos Red Sea.

## La vista

La tarjeta se divide en 3 zonas:

1. Imagen
2. Dispositivos y entidades
3. Zonas clicables

<img src="../img/aquarium/aquarium_zones.png"/>

### 1. Imagen

<img src="../img/aquarium/zone_1.png"/>

La foto de la vista, o el agua dibujada, teñida por sus lámparas a partir del nivel `light`.

### 2. Dispositivos y entidades

<img src="../img/aquarium/zone_2.png"/>

Un toque en un dispositivo abre su vista en esta tarjeta; en una entidad, su acción habitual. Un dispositivo también puede contornearse en la imagen (rectángulo, lazo o polígono) en lugar de mostrarse como miniatura.

### 3. Zonas clicables

<img src="../img/aquarium/zone_3.png"/>

Una pulsación en una zona clicable abre otra vista del acuario (el sump del mueble, por ejemplo); el botón ← vuelve a la anterior.

## El editor de escena

Un diálogo a pantalla completa, abierto desde el editor de la tarjeta, con siete pestañas:

### Acuario

<img src="../img/aquarium/editor_aquarium.png"/>

Nombre, dimensiones, el acuario de la nube correspondiente, luz con la que se tomaron las fotos, nivel de renderizado, oscuridad del agua de noche.

- **Volumen de agua neto (L)**: Acuario y sump, sin rocas ni arena. Lo usa la regulación de dosificación de la ReefDose. → [Regulación de dosificación](reefdose.es.md#regulación-de-dosificación)

### Vistas

<img src="../img/aquarium/editor_views.png"/>

Las imágenes; para cada agua: contorno, línea de arena (delante y detrás), rocas y su profundidad, zonas clicables, fondo dibujado y sus texturas.

- **Arena y rocas**: trace la línea de arena contra el cristal frontal (y contra la pared del fondo cuando la imagen muestra la superficie de la arena) y contornee las rocas con su profundidad: los peces se mantienen sobre la arena, nadan detrás de las rocas y los de fondo se arrastran por ella.
- **Decorado dibujado**: cuando la foto del agua no sirve, el agua puede dibujarse (agua, arena, texturas de roca del catálogo), conservando el resto de la imagen.

### Dispositivos

<img src="../img/aquarium/editor_devices.png"/>

Sus dispositivos y entidades por planta y zona, arrastrados sobre la imagen.

Marque **Ocultar la etiqueta** para mostrar solo el valor y elija su **Color del texto**: la etiqueta se conserva en el editor.

### Luz y corriente

<img src="../img/aquarium/editor_lights.png"/>

Las lámparas que iluminan cada agua y su posición; las bombas que mueven el agua.

### Fauna

<img src="../img/aquarium/editor_livestock.png"/>

Peces (especie, número, tamaño, refugio) y corales (especie, tamaño, colores, posición).

- **Comportamiento**: bancos, nadadores de aguas abiertas, peces de fondo, peces que viven alrededor de un refugio, gobios asomando de su madriguera; de noche los peces se esconden o descansan, bajo un velo que mantiene legible el acuario.
- **Especies**: peces y corales vienen del [catálogo ReefTank](https://github.com/Elwinmage/reeftank-catalog), descargado y actualizado por la integración. El editor los lista con una miniatura; un nombre que no está en el catálogo nada como un pez genérico.

### Alimentación

<img src="../img/aquarium/editor_feeding.png"/>

Las entidades que registran una alimentación, y dónde cae la comida.

### Vigilancia

<img src="../img/aquarium/editor_monitoring.png"/>

Las entidades de pH, ORP, CO2 de la habitación y pruebas de KH, lo que indica una calibración, los umbrales de las alarmas y el estado de la vigilancia.

Las alarmas comparan el acuario con su propio historial reciente.

## Niveles de renderizado

Cada acuario se muestra en uno de tres niveles; una tarjeta puede bajarlo, por ejemplo en una tableta de pared lenta:

| Nivel                   | Muestra                          |                                                            |
| ----------------------- | -------------------------------- | ---------------------------------------------------------- |
| **Estático** (`static`) | imagen, dispositivos y entidades | <img src="../img/aquarium/render_static.png" width="240"/> |
| **Luz** (`light`)       | más el color de las lámparas     | <img src="../img/aquarium/render_light.png" width="240"/>  |
| **Completo** (`full`)   | más peces y corales              | <img src="../img/aquarium/render_full.png" width="240"/>   |

Una foto del cuarto técnico con sus dispositivos en vivo es un acuario `static` perfectamente válido.

La guía completa (editor de escena, entidades, servicios, catálogo) está en el [README de ReefTank](https://github.com/Elwinmage/ha-reeftank-component/blob/main/doc/es/README.es.md).
