[← Volver a la página principal](README.es.md)

# ReefWave

ReefWave con ha-reef-card en acción:

[![Ver el video](https://img.youtube.com/vi/sYVeE0zV3eo/0.jpg)](https://www.youtube.com/watch?v=sYVeE0zV3eo)

Las ReefWave **RSWAVE25** y **RSWAVE45** están soportadas.

<img src="../img/rswave/rswave.png"/>

> [!IMPORTANT]
> Las bombas ReefWave dependen de la nube de ReefBeat más que los demás
> dispositivos: lea primero [esto](https://github.com/Elwinmage/ha-reefbeat-component/blob/main/doc/es/reefwave.es.md#reefwave). Con una cuenta en la nube
> vinculada en ha-reefbeat-component, la tarjeta trabaja con la biblioteca
> de olas y los grupos de la aplicación ReefBeat, y ambos siguen
> sincronizados. Sin cuenta, vea [Sin cuenta en la nube](#sin-cuenta-en-la-nube).

## La vista

La tarjeta se divide en 7 zonas:

1. Mensajes
2. Clips de fijación
3. Tira LED
4. Tapa
5. Flujo
6. Grupo
7. Programa del día

<img src="../img/rswave/rswave_zones.png"/>

## Mensajes

<img src="../img/rswave/zone_1.png"/>

Último mensaje y última alerta, arriba.

## Clips de fijación

<img src="../img/rswave/zone_2.png"/>

Encendido/apagado, mantenimiento, ajustes y Wi-Fi.

## Tira LED

<img src="../img/rswave/zone_3.png"/>

El modo de la bomba, en blanco claro (un toque abre su
información), y el nombre de la bomba debajo.

## Tapa

<img src="../img/rswave/zone_4.png"/>

La velocidad, como un anillo rojo ajustado a la tapa: la
intensidad de avance de la ola en curso, de la vista previa durante una
vista previa, y 0 cuando la bomba no funciona (apagada, alimentación,
mantenimiento, sin ola). Unas flechas en su interior dan la dirección:
→ avance, ← retroceso, ambas para una ola alterna. Toque la tapa para
ajustar [esta bomba en la ola actual](#esta-bomba-en-la-ola-actual).

## Flujo

<img src="../img/rswave/zone_5.png"/>

Bajo la bomba, agua animada a esa velocidad: hacia la
izquierda para una ola de avance, hacia la derecha para una de retroceso,
de ida y vuelta para una alterna. No se dibuja nada con la bomba parada.

## Grupo

<img src="../img/rswave/zone_6.png"/>

Las bombas del grupo en una fila, cada una con su miniatura y
su nombre, en el orden del grupo. La bomba de la tarjeta aparece rodeada;
toque otra para mostrar su propia tarjeta. Una bomba que Home Assistant no
alcanza aparece atenuada. No se muestra nada para una bomba sola.

## Programa del día

<img src="../img/rswave/zone_7.png"/>

El día de 00:00 a 24:00, un bloque por tramo en el
color de su tipo de ola: la intensidad de avance sube por encima de la
línea central, la de retroceso baja por debajo. Un tramo «sin ola» es una
línea discontinua. La leyenda de los tipos (pictograma y nombre) está bajo
el gráfico, y un cursor rojo marca la hora actual. Toque el gráfico para
editar el programa; el botón **Olas** sobre él abre la
biblioteca.

Tipos de ola: Uniforme, Aleatoria, Regular,
Escalones, Superficie y Sin ola, con los
pictogramas de la aplicación ReefBeat.

## Editor de programa

<img src="../img/rswave/program_editor.png"/>

Toque el programa del día: arriba el gráfico del borrador, luego una fila
por tramo con su inicio, su fin, la ola elegida en la biblioteca, su tipo,
su dirección y las intensidades de esta bomba. Los tramos se pueden añadir y
quitar; **Guardar** escribe el programa, **Cancelar** no
cambia nada.

- El programa se escribe en **todas las bombas del grupo**, cada una con sus
  propias intensidades. Cuando una bomba del grupo no está disponible, el
  guardado queda bloqueado, como en la aplicación ReefBeat: el grupo sigue
  sincronizado.
- El programa empieza a las 00:00, dos tramos no pueden empezar a la misma
  hora, y cada tramo necesita una ola.
- Bajo la nota del grupo, un botón agrupa la bomba con las ReefWave de su
  acuario (**Agrupar con las ReefWave del acuario**) o la desagrupa (**Desagrupar esta bomba**). En
  un grupo, el orden de sus bombas se cambia arrastrando y soltando, o con
  las flechas ‹ ›.
- Bajo la tabla, la zona de olas muestra la biblioteca en la ola del tramo
  actual; el lápiz de una fila, o elegir una ola, muestra esa ola.

## Biblioteca de olas

<img src="../img/rswave/library.png"/>

El botón **Olas** lista las olas del acuario, tal como
las guarda la aplicación ReefBeat: las de Red Sea y las suyas, cada una con
las bombas que la usan. Al elegir una ola se muestran sus ajustes:

- su **tipo**, elegido entre los pictogramas;
- su **forma**: tiempos de avance y de retroceso (min), duración del pulso
  (s) y pasos, según lo que use su tipo. La forma la comparten todas las
  bombas que usan la ola;
- las intensidades de avance y de retroceso de **esta bomba**, y si está
  sincronizada con el grupo.

Después, **Actualizar la ola** escribe la ola (los programas que la usan se
vuelven a escribir), **Crear una ola nueva** pide un nombre y añade una copia
con estos ajustes, y **Eliminar** quita una ola que ningún programa
usa. Una ola Red Sea solo se puede copiar.

**Vista previa en esta bomba**: elija la dirección y la duración (de 1 a 10 min), y
luego **Previsualizar**; la bomba ejecuta la ola y después vuelve
a su programa. **Detener la vista previa** la termina de inmediato.

## Esta bomba en la ola actual

<img src="../img/rswave/pump_settings.png"/>

Toque la tapa para cambiar la dirección y las intensidades de avance /
retroceso de esta bomba en la ola en curso. Solo cambia esta bomba: las
demás bombas del grupo conservan su dirección y sus intensidades, ya que la
aplicación ReefBeat deja que cada bomba de un grupo ejecute una ola a su
manera.

## Ajustes

<img src="../img/rswave/dialog_config.png"/>

La rueda dentada abre los ajustes de la bomba: la ola en curso (tipo,
dirección, intensidades, tiempos, pasos), `Retardo de apagado del acceso directo`,
`Agrupada con el acuario`, los ajustes y botones de vista previa de la
integración, y las acciones del dispositivo (actualizar, reiniciar,
actualización del firmware).

## Sin cuenta en la nube

La biblioteca de olas y los grupos viven en la nube de ReefBeat. Sin una
cuenta en la nube vinculada a la bomba, solo se ofrecen las olas del
programa actual, el programa se escribe en la propia bomba, y la biblioteca
no se puede editar.

> [!NOTE]
> La vista necesita ha-reefbeat-component con el atributo `schedule` del
> sensor `wave_type`, el sensor `linked_waves` y los servicios
> `redsea.wave_*`.

---

[← Volver a la página principal](README.es.md)
