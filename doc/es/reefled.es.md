[← Volver a la página principal](README.es.md)

# ReefLed

ReefLed con ha-reef-card en acción:

[![Ver el video](https://img.youtube.com/vi/VIDEO_ID/0.jpg)](https://www.youtube.com/watch?v=VIDEO_ID)

Las ReefLed **G1** (RSLED50, RSLED90, RSLED160) y **G2** (RSLED60, RSLED115,
RSLED170) están soportadas, y también los [LED virtuales](#led-virtual).

> [!NOTE]
> Solo la G1 se ha validado con lámparas reales. La G2 está implementada y
> debería funcionar, pero aún no se ha probado: sus comentarios son
> bienvenidos.

<p align="center">
<img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsled/rsled_g1.png" width="45%"/>
<img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsled/rsled_g2.png" width="45%"/>
</p>

## La vista

La tarjeta se divide en 7 zonas:

1. Cielo
2. Cara izquierda
3. Cara derecha
4. Haz
5. Deslizadores
6. Grupo y tiempo
7. Mensajes

<img src="../img/rsled/rsled_zones.png"/>

## Cielo

<img src="../img/rsled/zone_1.png"/>

El recorrido del sol entre el primer amanecer y el último
atardecer del programa de hoy (canales blanco y azul), con ambas horas en
los extremos del arco. De noche el cielo se vuelve violeta, como el LED de
luna de la lámpara: la luna va del atardecer al siguiente amanecer y
muestra la fase actual (`todays_moon_day`). Toque el modo del centro para
cambiarlo (auto, manual, temporizador). Si hay nubes programadas, aparece
una pequeña nube junto al modo; mientras pasan, se desplazan delante del
sol.

## Cara izquierda

<img src="../img/rsled/zone_2.png"/>

Encendido/apagado, mantenimiento, configuración,
batería y wifi.

El nombre de la lámpara (el que se le dio en Home Assistant)
está escrito en la cara superior izquierda de la lámpara, entre las
rejillas y los iconos. Un nombre largo se escribe más pequeño y luego se
corta (el nombre completo aparece al pasar el cursor).

## Cara derecha

<img src="../img/rsled/zone_3.png"/>

Identificar (la lámpara parpadea, y también el haz de
la tarjeta durante 10 s), fase lunar y aclimatación. Luna y aclimatación
abren sus ajustes. Durante una aclimatación, los días restantes y la
intensidad actual se muestran al lado.

## Haz

<img src="../img/rsled/zone_4.png"/>

Su color y su opacidad siguen la luz producida en ese momento
(canales blanco, azul y luna). Al 0 % de intensidad, o con la lámpara
apagada, no hay haz y la lente aparece en gris. Muestra la intensidad
actual, el nombre del programa de hoy y su gráfico (blanco, azul y luna),
con una marca roja en la hora actual, escrita bajo el gráfico. En modo
meteorológico GPS, la hora del lugar del tiempo sigue entre paréntesis: el
momento del día del lugar que reproduce el programa (las 09:04 en Francia
pueden ser las 04:04 en las Maldivas cuando el amanecer está anclado al
acuario). Fuera del modo automático el gráfico se atenúa. En una G2 el
gráfico muestra la intensidad, con la línea coloreada según la temperatura
de color (amarilla si es cálida, azul si es fría), con el valor de cada
zona de color. Toque el haz para editar el programa. Las nubes del día
aparecen como una banda vertical sobre su franja, más oscura cuanto más
fuertes son (Low, Medium, High); igual en el gráfico del editor y en la
semana meteorológica.

## Deslizadores

<img src="../img/rsled/zone_5.png"/>

Agrupados a la izquierda: intensidad, temperatura de
color y luna. Intensidad y color controlan la luz `kelvin_intensity`, el
deslizador de luna la luz `moon`; se envía una sola llamada al soltar. En
una G1, el pequeño interruptor **K | W/B** situado encima cambia
intensidad y color por los canales blanco y azul; el navegador recuerda la
elección para cada lámpara. Una G2 solo controla su color mediante kelvin
e intensidad, así que no tiene ese interruptor.

## Grupo y tiempo

<img src="../img/rsled/zone_6.png"/>

En una lámpara de un grupo, las lámparas de su grupo (véase
[LED virtual](#led-virtual)): toque una para mostrar su tarjeta. Debajo, el
icono del tiempo, iluminado mientras la lámpara sigue el tiempo.

## Mensajes

<img src="../img/rsled/zone_7.png"/>

Último mensaje y última alerta bajo el haz.

## Amanecer escalonado

<img src="../img/rsled/staggered_sunrise.png"/>

Cuando la lámpara empieza su día con retraso (su
`Desfase del amanecer`, ajustado por un grupo o a mano), el cielo
reproduce el programa con ese retraso: posición del sol, horas de amanecer
y atardecer, nubes. Una insignia bajo la hora del amanecer («+15 min»)
abre el ajuste del desfase, que también está en el diálogo de
configuración (solo lámparas que responden a `/offset`).

## Programa meteorológico

<img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsled/rsled_weather.png" width="300"/>

Con el programa meteorológico de ha-reefbeat-component, el editor de
programas tiene un interruptor **Modo tiempo GPS**, y abajo a la
derecha aparece un icono del tiempo (`mdi:weather-partly-cloudy`),
iluminado mientras la lámpara sigue el tiempo, y azul mientras se escribe una
semana meteorológica en la lámpara. Es solo informativo: el modo se elige en
el editor de programas.

Con el modo activado, la tabla de puntos deja paso a los ajustes: el lugar
(escrito como `lat, lon`, pegado como enlace de mapa, buscado por su nombre
— «Maldivas», «Fakarava»… —, yendo entonces el mapa hasta allí, o elegido en
el mapa de Home Assistant cuando está disponible), el periodo (previsión de
la semana próxima o tiempo medido de la semana pasada), cada cuánto se
consulta el tiempo (de 3 a 15 días), cómo se coloca el día del lugar en el
acuario (la hora del lugar, anclado a una hora de amanecer o de atardecer, o
estirado entre ambas), las intensidades mínima y máxima y las nubes. Cada
cambio se previsualiza al instante: el gráfico muestra el día que daría el
tiempo, y la semana se lista día a día (el sol en el acuario, las horas del
lugar al pasar el cursor, las horas de sol, la nubosidad con las nubes de la
lámpara y la intensidad máxima); un día de la lista se muestra en el
gráfico. No se escribe nada antes de **Guardar**: el editor muestra
«Guardando los ajustes…», luego «Ajustes guardados» cuando la
integración ha guardado los ajustes y el modo y ha generado la semana, y se
cierra; la semana se escribe en la lámpara justo después, en segundo plano.
**Cancelar** no cambia nada.

Los colores de los días meteorológicos los elige usted: con el modo
activado, el gráfico muestra los tramos del día y solo se puede cambiar su
color. Los colores ajustados pasan a ser los del día meteorológico mostrado,
o los de todos los días con _Todos los días_, en lugar de los
colores del programa propio de la lámpara; se previsualizan y se guardan con
los demás ajustes.

Desactivado en una lámpara en modo meteorológico, el editor muestra el
programa propio de la lámpara, apartado, para editarlo: **Guardar** lo
restablece (con el día editado, si lo hay). Un ajuste cambiado fuera de la
tarjeta (entidades de Home Assistant, automatizaciones) aparece en un
segundo, y la lámpara se escribe 30 s después del último cambio.

## LED virtual

<img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsled/rsled_virtual.png" width="300"/>

Un LED virtual controla varias lámparas como una sola. Muestra la misma
vista que una lámpara real: la de G2 en cuanto una de sus lámparas es una G2
(el grupo solo se controla entonces mediante kelvin e intensidad), la de G1
cuando todas sus lámparas son G1 (con el interruptor **K | W/B**). Un LED
virtual no tiene batería, wifi ni mensajes; en su lugar, sus lámparas se
listan abajo a la derecha, cada una con una miniatura de su generación.
Toque una para mostrar su propia tarjeta (el botón de retroceso vuelve al
LED virtual).

Un LED virtual es un grupo, como los LED «agrupados» de la aplicación
ReefBeat: lo que se ajusta en él, o en una de sus lámparas (modo, color
manual, temporizador, programas, aclimatación, fase lunar, modo
meteorológico), se aplica a todas las lámparas del grupo. Una lámpara de un
grupo también lista las lámparas de su grupo, ella misma rodeada en rojo.
Con un amanecer escalonado, el desfase de cada lámpara se escribe bajo su
nombre (+0 min, +10 min…). Cuando una lámpara del grupo no está disponible,
la integración rechaza el cambio y nombra la lámpara: no se envía nada, así
el grupo sigue sincronizado.

El programa mostrado se lee de la primera lámpara del grupo (un programa G1
se muestra en kelvin en la vista G2). **Guardar** escribe el programa
editado en cada lámpara, en su propio formato: blanco/azul para una G1
(convertido con la tabla de su modelo), puntos `color` para una G2. Las
escrituras se espacian, ya que una lámpara responde tarde a una orden
enviada demasiado pronto: mientras tanto el editor muestra su progreso
(«Enviando el programa a las lámparas… 3/14»).

> [!NOTE]
> La lista de lámparas necesita ha-reefbeat-component con el sensor
> `linked_leds`. Sin él, la tarjeta elige la vista G2 cuando el LED virtual
> no tiene luces blanco/azul, y escribe los programas en la propia entrada
> del LED virtual.

## Editor de programas

<img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsled/rsled_program_editor.png" width="400"/>

Toque el haz para editar un programa diario: arriba el gráfico, debajo los
puntos del canal seleccionado (hora, intensidad y, en una G2, temperatura de
color). Los puntos también se pueden arrastrar en el gráfico. En una G1, el
interruptor **W/B | K** del editor edita el programa canal por canal o como
intensidad + temperatura de color; siempre se guarda como blanco/azul. La
conversión la hace la integración (`redsea.led_convert`: la tabla del modelo
y la opción de compensación de intensidad), con una alternativa local para
versiones anteriores de la integración. La primera y la última fila son el
amanecer y el atardecer del canal: su intensidad se queda en 0 %.
**Guardar** envía el programa del día mostrado, o de todos los días con
_Todos los días_.

### Biblioteca en la nube

<img src="../img/rsled/library.png"/>

Cuando la lámpara está vinculada a una cuenta en la nube de ReefBeat (la
entrada cloud de la integración), el editor ofrece los programas de su
biblioteca, tal como los guarda la aplicación ReefBeat (G1: por acuario; G2:
por cuenta, en su propia biblioteca): al elegir uno se carga (un programa G1
se muestra en kelvin en una G2, uno G2 se edita en kelvin en una G1 y se
guarda como blanco/azul). Guardado tal cual, la lámpara recibe su nombre y
sus nubes, como con la aplicación ReefBeat.

Los programas se listan en dos grupos: los de Red Sea (12K, 15K, 18K, 20K,
23K y RS Accelerated Growth en una G1; 15K, 23K, Shallow Reef y Deep Reef,
integrados en la aplicación, en una G2) y los suyos. Como en la aplicación,
un programa Red Sea se puede cargar, pero no actualizar ni eliminar; uno de
los suyos se puede eliminar (🗑, tras una confirmación).

Un programa editado se guarda en la biblioteca antes de enviarse a la
lámpara: la tarjeta pide su nombre, `prog-YYYYMMDDHHMM` por defecto. Cuando
procede de uno de sus programas, el nombre es el de ese programa y usted
elige entre **Actualizar** (se reemplaza el programa de la
biblioteca) y **Guardar como nuevo**. Un LED virtual usa la biblioteca de
su primera lámpara vinculada.

> [!NOTE]
> La biblioteca necesita ha-reefbeat-component con los servicios
> `redsea.led_library`, `redsea.led_library_save` y
> `redsea.led_library_delete`.

> [!NOTE]
> La lámpara guarda sus programas en una línea de tiempo semanal (el día N
> empieza en (N - 1) × 1440 min); la tarjeta muestra y edita cada día en sus
> propias 24 h. Una G2 guarda su programa como puntos `color`
> `{t, i1, k1, i2, k2}` (un valor de entrada y uno de salida por punto) más
> la luna, y sus nubes en `/clouds/<day>` como una G1. La tarjeta lee y
> escribe ese formato; también lee el programa tal como lo ve el analizador
> G1 de la aplicación (blanco = intensidades, azul = temperaturas de color).

> [!NOTE]
> El progreso de la aclimatación necesita ha-reefbeat-component con los
> sensores `acclimation_remaining_days` y
> `acclimation_current_intensity_factor`. Con su sensor `current_program`,
> el haz muestra el nombre del programa que la lámpara dice estar
> ejecutando.

---

[← Volver a la página principal](README.es.md)
