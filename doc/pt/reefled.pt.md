[← Voltar à página principal](README.pt.md)

# ReefLed

ReefLed com ha-reef-card em ação:

[![Assistir ao vídeo](https://img.youtube.com/vi/VIDEO_ID/0.jpg)](https://www.youtube.com/watch?v=VIDEO_ID)

As ReefLed **G1** (RSLED50, RSLED90, RSLED160) e **G2** (RSLED60, RSLED115,
RSLED170) são suportadas, tal como os [LED virtuais](#led-virtual).

> [!NOTE]
> Só a G1 foi validada em lâmpadas reais. A G2 está implementada e deve
> funcionar, mas ainda não foi testada: os comentários são bem-vindos.

<p align="center">
<img src="../img/rsled/rsled_g1.png" width="45%"/>
<img src="../img/rsled/rsled_g2.png" width="45%"/>
</p>

## A vista

O cartão está dividido em 7 zonas:

1. Céu
2. Face esquerda
3. Face direita
4. Feixe
5. Cursores
6. Grupo e tempo
7. Mensagens

<img src="../img/rsled/rsled_zones.png"/>

## Céu

<img src="../img/rsled/zone_1.png"/>

O percurso do sol entre o primeiro nascer e o último pôr do sol
do programa de hoje (canais branco e azul), com as duas horas nas
extremidades do arco. À noite o céu fica violeta, como o LED de lua da
lâmpada: a lua vai do pôr do sol ao nascer seguinte e mostra a fase atual
(`todays_moon_day`). Toque no modo ao centro para o alterar (auto, manual,
temporizador). Se houver nuvens programadas, aparece uma pequena nuvem
junto ao modo; enquanto passam, deslizam à frente do sol.

## Face esquerda

<img src="../img/rsled/zone_2.png"/>

Ligar/desligar, manutenção, configuração, bateria e
wifi.

O nome da lâmpada (o que foi dado no Home Assistant) está
escrito na face superior esquerda da lâmpada, entre as grelhas e os
ícones. Um nome longo é escrito mais pequeno e depois cortado (o nome
completo aparece ao passar o cursor).

## Face direita

<img src="../img/rsled/zone_3.png"/>

Identificar (a lâmpada pisca, e o feixe do cartão
também durante 10 s), fase lunar e aclimatação. Lua e aclimatação abrem as
suas definições. Durante uma aclimatação, os dias restantes e a
intensidade atual aparecem ao lado.

## Feixe

<img src="../img/rsled/zone_4.png"/>

A sua cor e a sua opacidade seguem a luz produzida no momento
(canais branco, azul e lua). A 0 % de intensidade, ou com a lâmpada
desligada, não há feixe e a lente fica a cinzento. Mostra a intensidade
atual, o nome do programa de hoje e o seu gráfico (branco, azul e lua),
com uma marca vermelha na hora atual, escrita por baixo do gráfico. Em
modo meteorológico GPS, a hora no local do tempo segue entre parênteses: o
momento do dia do local que o programa está a reproduzir (09:04 em França
podem ser 04:04 nas Maldivas quando o nascer do sol está ancorado ao
aquário). Fora do modo automático o gráfico fica esbatido. Numa G2 o
gráfico mostra a intensidade, com a linha colorida pela temperatura de cor
(amarela se quente, azul se fria), com o valor de cada zona de cor. Toque
no feixe para editar o programa. As nuvens do dia aparecem como uma faixa
vertical sobre a sua janela, mais escura quanto mais fortes são (Low,
Medium, High); o mesmo no gráfico do editor e na semana meteorológica.

## Cursores

<img src="../img/rsled/zone_5.png"/>

Agrupados à esquerda: intensidade, temperatura de cor e
lua. Intensidade e cor controlam a luz `kelvin_intensity`, o cursor da lua
a luz `moon`; é enviada uma única chamada ao largar. Numa G1, o pequeno
interruptor **K | W/B** por cima deles troca intensidade e cor pelos
canais branco e azul; o navegador memoriza a escolha para cada lâmpada.
Uma G2 só controla a sua cor através de kelvin e intensidade, por isso não
tem esse interruptor.

## Grupo e tempo

<img src="../img/rsled/zone_6.png"/>

Numa lâmpada de um grupo, as lâmpadas do seu grupo (ver
[LED virtual](#led-virtual)): toque numa para mostrar o seu cartão. Por baixo,
o ícone do tempo, aceso enquanto a lâmpada segue o tempo.

## Mensagens

<img src="../img/rsled/zone_7.png"/>

Última mensagem e último alerta por baixo do feixe.

## Nascer do sol escalonado

<img src="../img/rsled/staggered_sunrise.png"/>

Quando a lâmpada começa o dia mais tarde (o
seu `Desfasamento do nascer do sol`, definido por um grupo ou à mão), o céu
reproduz o programa com esse atraso: posição do sol, horas de nascer e pôr
do sol, nuvens. Um indicador por baixo da hora do nascer («+15 min») abre
a definição do desfasamento, que também está na janela de configuração
(apenas lâmpadas que respondem a `/offset`).

## Programa meteorológico

<img src="../img/rsled/rsled_weather.png" width="300"/>

Com o programa meteorológico do ha-reefbeat-component, o editor de programas
tem um interruptor **Modo tempo GPS**, e em baixo à direita aparece
um ícone do tempo (`mdi:weather-partly-cloudy`), aceso enquanto a lâmpada
segue o tempo, e azul enquanto uma semana
meteorológica é escrita na lâmpada. É apenas informativo: o modo escolhe-se
no editor de programas.

Com o modo ativado, a tabela de pontos dá lugar às definições: o local
(escrito como `lat, lon`, colado como ligação de mapa, procurado pelo seu
nome — «Maldivas», «Fakarava»… —, indo então o mapa até lá, ou escolhido no
mapa do Home Assistant quando está disponível), o período (previsão da
próxima semana ou tempo medido da semana passada), de quanto em quanto tempo
o tempo é consultado (de 3 a 15 dias), como o dia do local é colocado no
aquário (a hora do local, ancorado a uma hora de nascer ou de pôr do sol, ou
esticado entre ambas), as intensidades mínima e máxima e as nuvens. Cada
alteração é pré-visualizada de imediato: o gráfico mostra o dia que o tempo
daria, e a semana é listada dia a dia (o sol no aquário, as horas do local
ao passar o cursor, as horas de sol, a nebulosidade com as nuvens da lâmpada
e a intensidade máxima); um dia da lista é mostrado no gráfico. Nada é
escrito antes de **Guardar**: o editor mostra «A guardar as definições…»,
depois «Definições guardadas» quando a integração guardou as definições e
o modo e gerou a semana, e fecha-se; a semana é escrita na lâmpada logo a
seguir, em segundo plano. **Cancelar** não altera nada.

As cores dos dias meteorológicos são escolhidas por si: com o modo ativado,
o gráfico mostra os intervalos do dia e só a sua cor pode ser alterada. As
cores definidas passam a ser as do dia meteorológico mostrado, ou de todos
os dias com _Todos os dias_, em vez das cores do programa próprio
da lâmpada; são pré-visualizadas e guardadas com as outras definições.

Desativado numa lâmpada em modo meteorológico, o editor mostra o programa
próprio da lâmpada, posto de lado, para editar: **Guardar** repõe-no (com
o dia editado, se houver). Uma definição alterada fora do cartão (entidades
do Home Assistant, automatizações) aparece num segundo, e a lâmpada é
escrita 30 s após a última alteração.

## LED virtual

<img src="../img/rsled/rsled_virtual.png" width="300"/>

Um LED virtual controla várias lâmpadas como uma só. Mostra a mesma vista
que uma lâmpada real: a de G2 logo que uma das suas lâmpadas seja uma G2 (o
grupo só é então controlado através de kelvin e intensidade), a de G1 quando
todas as suas lâmpadas são G1 (com o interruptor **K | W/B**). Um LED
virtual não tem bateria, wifi nem mensagens; em vez disso, as suas lâmpadas
são listadas em baixo à direita, cada uma com uma miniatura da sua geração.
Toque numa para mostrar o seu próprio cartão (o botão de retroceder volta ao
LED virtual).

Um LED virtual é um grupo, como os LED «agrupados» da aplicação ReefBeat: o
que é definido nele, ou numa das suas lâmpadas (modo, cor manual,
temporizador, programas, aclimatação, fase lunar, modo meteorológico), é
aplicado a todas as lâmpadas do grupo. Uma lâmpada de um grupo também lista
as lâmpadas do seu grupo, ela própria rodeada a vermelho. Com um nascer do
sol escalonado, o desfasamento de cada lâmpada é escrito por baixo do seu
nome (+0 min, +10 min…). Quando uma lâmpada do grupo não está disponível, a
integração recusa a alteração e indica a lâmpada: nada é enviado, pelo que o
grupo se mantém sincronizado.

O programa mostrado é lido da primeira lâmpada do grupo (um programa G1 é
mostrado em kelvin na vista G2). **Guardar** escreve o programa editado
em cada lâmpada, no seu próprio formato: branco/azul para uma G1 (convertido
com a tabela do seu modelo), pontos `color` para uma G2. As escritas são
espaçadas, pois uma lâmpada responde tarde a um comando enviado cedo de
mais: entretanto o editor mostra o seu progresso («A enviar o programa para as lâmpadas… 3/14»).

> [!NOTE]
> A lista de lâmpadas precisa do ha-reefbeat-component com o sensor
> `linked_leds`. Sem ele, o cartão escolhe a vista G2 quando o LED virtual
> não tem luzes branco/azul, e escreve os programas na própria entrada do
> LED virtual.

## Editor de programas

<img src="../img/rsled/rsled_program_editor.png" width="400"/>

Toque no feixe para editar um programa diário: em cima o gráfico, por baixo
os pontos do canal selecionado (hora, intensidade e, numa G2, temperatura de
cor). Os pontos também podem ser arrastados no gráfico. Numa G1, o
interruptor **W/B | K** do editor edita o programa canal a canal ou como
intensidade + temperatura de cor; é sempre guardado como branco/azul. A
conversão é feita pela integração (`redsea.led_convert`: a tabela do modelo
e a opção de compensação de intensidade), com uma alternativa local para
versões mais antigas da integração. A primeira e a última linha são o nascer
e o pôr do sol do canal: a sua intensidade fica em 0 %. **Guardar** envia
o programa do dia mostrado, ou de todos os dias com
_Todos os dias_.

### Biblioteca na nuvem

<img src="../img/rsled/library.png"/>

Quando a lâmpada está associada a uma conta na nuvem ReefBeat (a entrada
cloud da integração), o editor propõe os programas da sua biblioteca, tal
como a aplicação ReefBeat os guarda (G1: por aquário; G2: por conta, numa
biblioteca própria): escolher um carrega-o (um programa G1 é mostrado em
kelvin numa G2, um G2 é editado em kelvin numa G1 e guardado como
branco/azul). Guardado tal como está, a lâmpada recebe o seu nome e as suas
nuvens, como com a aplicação ReefBeat.

Os programas são listados em dois grupos: os da Red Sea (12K, 15K, 18K, 20K,
23K e RS Accelerated Growth numa G1; 15K, 23K, Shallow Reef e Deep Reef,
integrados na aplicação, numa G2) e os seus. Como na aplicação, um programa
Red Sea pode ser carregado, mas não atualizado nem eliminado; um dos seus
pode ser eliminado (🗑, após confirmação).

Um programa editado é guardado na biblioteca antes de ser enviado para a
lâmpada: o cartão pede o seu nome, `prog-YYYYMMDDHHMM` por omissão. Quando
vem de um dos seus programas, o nome é o desse programa e escolhe entre
**Atualizar** (o programa da biblioteca é substituído) e
**Guardar como novo**. Um LED virtual usa a biblioteca da sua primeira
lâmpada associada.

> [!NOTE]
> A biblioteca precisa do ha-reefbeat-component com os serviços
> `redsea.led_library`, `redsea.led_library_save` e
> `redsea.led_library_delete`.

> [!NOTE]
> A lâmpada guarda os seus programas numa linha temporal semanal (o dia N
> começa em (N - 1) × 1440 min); o cartão mostra e edita cada dia nas suas
> próprias 24 h. Uma G2 guarda o seu programa como pontos `color`
> `{t, i1, k1, i2, k2}` (um valor de entrada e um de saída por ponto) mais a
> lua, e as suas nuvens em `/clouds/<day>` como uma G1. O cartão lê e
> escreve esse formato; também lê o programa tal como o analisador G1 da
> aplicação o vê (branco = intensidades, azul = temperaturas de cor).

> [!NOTE]
> O progresso da aclimatação precisa do ha-reefbeat-component com os
> sensores `acclimation_remaining_days` e
> `acclimation_current_intensity_factor`. Com o seu sensor
> `current_program`, o feixe mostra o nome do programa que a lâmpada diz
> estar a executar.

---

[← Voltar à página principal](README.pt.md)
