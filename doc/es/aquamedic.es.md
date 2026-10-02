[← Volver a la página principal](README.es.md)

# Aqua Medic

Aqua Medic con ha-reef-card en acción:

[![Ver el video](https://img.youtube.com/vi/VIDEO_ID/0.jpg)](https://www.youtube.com/watch?v=VIDEO_ID)

Vistas de las bombas de [ha-aquamedic-component](https://github.com/Elwinmage/ha-aquamedic-component):

| Dispositivo                                  | Vista de la tarjeta    |
| -------------------------------------------- | ---------------------- |
| EcoDrift / SmartDrift (bomba de circulación) | `aquamedic-smartdrift` |
| DC Runner (bomba de retorno)                 | `aquamedic-dcrunner`   |
| DC Runner (bomba de skimmer)                 | `aquamedic-dcskimmer`  |

<p align="center">
<img src="../img/aquamedic/smartdrift.png" width="30%"/>
<img src="../img/aquamedic/dcrunner.png" width="30%"/>
<img src="../img/aquamedic/dcskimmer.png" width="30%"/>
</p>

La bomba de retorno y la bomba de skimmer son el mismo hardware: la tarjeta
muestra un selector de rol hasta que se define la selección **Rol de la
bomba** de la integración, y entonces cambia por sí sola a la vista
correspondiente.

<img src="../img/aquamedic/role_picker.png"/>

## Lo que muestra la vista

La tarjeta se divide en 4 zonas:

1. Banda superior
2. Fallos
3. Velocidad
4. Programa por tramos

<img src="../img/aquamedic/aquamedic_zones.png"/>

## Banda superior

<img src="../img/aquamedic/zone_1.png"/>

Encendido, pausa de alimentación, temporizador y
control 0-10V, cada uno conmutable con un clic; la rueda dentada abre los
ajustes (todas las entidades de la bomba, su rol y sus sensores de fallo).
Una SmartDrift añade el interruptor pulso / marea y su modo de ola (clic:
más información).

## Fallos

<img src="../img/aquamedic/zone_2.png"/>

Una línea parpadeante nombra los fallos que señala la bomba
(marcha en seco, rotor bloqueado, sobretemperatura…). No se dibuja nada
mientras la bomba está sana.

## Velocidad

<img src="../img/aquamedic/zone_3.png"/>

Un anillo sobre la imagen y un deslizador debajo (velocidad
del motor en una DC Runner, caudal en una SmartDrift, que recibe además un
deslizador de frecuencia de ola). En una SmartDrift el anillo se ajusta a
la tapa frontal de la bomba, con la cifra en su centro. Ambos desaparecen
mientras la bomba se controla por su entrada 0-10V, ya que la integración
bloquea entonces la velocidad. Al soltarlo, el deslizador conserva su
nuevo valor hasta que la bomba lo confirma.

## Programa por tramos

<img src="../img/aquamedic/zone_4.png"/>

El día de 00:00 a 24:00, un bloque por tramo — su
altura es la velocidad programada, una pausa de alimentación va rayada en
toda la altura, una parada es una barra fina sobre la línea base. Un
cursor rojo marca la hora actual. El gráfico se atenúa mientras el
temporizador está apagado, porque la bomba ignora entonces el programa.

## Animaciones

La imagen muestra lo que hace la bomba:

- **SmartDrift / EcoDrift**: cuatro chorros ondulados salen en abanico del
  frente de la bomba. Se hinchan al ritmo de la frecuencia de ola, y se
  mantienen estables en modo de caudal constante.
- **DC Runner**: el agua es aspirada por la entrada e impulsada hacia arriba
  por la salida.
- **DC Skimmer**: la imagen con espuma mientras la bomba funciona, la de
  reposo cuando está apagada o retenida por la pausa de alimentación; unas
  bandas suben por la cámara de reacción, más rápido con la velocidad del
  motor, y unas burbujas estallan en la copa de recogida. No hay estado de
  «copa llena»: el firmware de Aqua Medic no lo detecta.

El agua se mueve más rápido cuanto mayor es la velocidad. No se dibuja nada
mientras la bomba está apagada, retenida por la pausa de alimentación, o al
0 %.

## Editar el programa

<img src="../img/aquamedic/schedule_editor.png"/>

Haga clic en el gráfico (o mantenga pulsado el icono del temporizador) para
abrir el editor: una fila por tramo con su inicio, fin, modo y valor
(velocidad en %, o minutos para una pausa de alimentación), más frecuencia y
marea en una SmartDrift. Los tramos se pueden añadir y quitar.
**Guardar** reescribe todo el programa de la bomba mediante el servicio
`aquamedic.set_schedule`; **Cancelar** no cambia nada.

El editor aplica lo que la bomba acepta: los tramos no pueden solaparse ni
cruzar la medianoche (escriba una franja nocturna como dos tramos), un tramo
de DC Runner funciona al 30 % o más, una pausa de alimentación dura de 1 a
60 minutos, y una bomba admite 48 tramos.

> [!NOTE]
> El programa necesita ha-aquamedic-component con el sensor `schedule`. Con
> una versión anterior, el gráfico simplemente no se dibuja.

> [!NOTE]
> Una DC Runner con el firmware antiguo (velocidad llamada `flow`, sin
> temporizador) usa las mismas vistas: los elementos que le faltan se
> ocultan.

## Disposición

Cada vista tiene su propia caja y su propia colocación, en las constantes
`PICTURE` y `LAYOUT` de su mapping (`dcrunner.mapping.ts`,
`dcskimmer.mapping.ts`, `smartdrift.mapping.ts`): dónde se sitúa la imagen,
el centro de cada icono, el centro y el tamaño del anillo de velocidad. Los
puntos dibujados sobre la imagen se dan en porcentajes de la imagen, de modo
que al moverla o redimensionarla se mueven con ella. Como cualquier
elemento, también se pueden sobrescribir desde la configuración de la
tarjeta.

---

[← Volver a la página principal](README.es.md)
