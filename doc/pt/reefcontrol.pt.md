[← Voltar à página principal](README.pt.md)

# ReefControl

ReefControl e ReefControl-Power com o ha-reef-card em ação:

[![Ver o vídeo](https://img.youtube.com/vi/voFobfc7Slk/0.jpg)](https://www.youtube.com/watch?v=voFobfc7Slk)

O cartão ReefControl desenha o hub tal como está ligado: as sondas ReefSense
penduradas nas suas caixas de extensão, as portas de 12V, a bomba ATO quando uma
porta comanda uma, e o [ReefControl-Power](reefcontrol-power.pt.md#reefcontrol-power) emparelhado por
cima.

Os dois modelos são suportados. O Pro aceita até 7 sondas (uma segunda caixa de
extensão é desenhada assim que uma quinta sonda é ligada) e tem duas portas de
12V; o Lite aceita 2 sondas e tem uma única porta de 12V.

<table>
  <tr>
    <th align="center">RSCONTROLPRO</th>
    <th align="center">RSCONTROLLITE</th>
  </tr>
  <tr>
    <td align="center"><img src="../img/rscontrol/rscontrolpro.png"/></td>
    <td align="center"><img src="../img/rscontrol/rscontrollite.png"/></td>
  </tr>
</table>

O resto desta secção é ilustrado com o Pro: tudo funciona da mesma forma no
Lite.

<img src="../img/rscontrol/rscontrol_zones.png"/>

O cartão está dividido em 7 zonas:

1. Controlador: alimentação, modo de manutenção, configuração, Wifi e besouro
2. Power Center emparelhado (ReefControl-Power)
3. Resumo das leituras
4. Sondas
5. Portas de 12V
6. ATO
7. Última mensagem e último alerta

## Controlador

<img src="../img/rscontrol/zone_1.png"/>

---

O texto na face do hub é o **modo de funcionamento** reportado pelo dispositivo
(Auto, Setup, Manutenção…), traduzido para a língua do Home Assistant.

<span>O interruptor <img src="../img/mdi/mdi_power-plug.png" width="20"/> liga ou desliga o ReefControl.</span>

<img src="../img/rscontrol/off_mode.png" width="50%"/>

Desligado, o hub não mede nem comanda nada: o cartão só conserva o seu
interruptor e as imagens do hardware. As sondas perdem os valores, as barras e
as definições, e o besouro, o resumo, as portas de 12V e os ícones de
configuração ficam ocultos.

<span>O interruptor <img src="../img/mdi/mdi_account-wrench.png" width="20"/> passa para o modo de manutenção.</span>

<img src="../img/rscontrol/maintenance.png" width="50%"/>

<span>Clique no ícone <img src="../img/rsdose/cog_icon.png" width="30"/> para gerir a configuração geral do ReefControl: atualizar as definições ou os dados lidos, reiniciar o dispositivo, atualizar o seu firmware, ajustar a [fusão de temperaturas](https://github.com/Elwinmage/ha-reefbeat-component/blob/main/doc/pt/reefcontrol.pt.md#fusão-de-temperatura-multi-sonda), ver o estado da rede e do cabo, e gerir o emparelhamento com um ReefControl-Power.</span>

<img src="../img/rscontrol/zone_1_dialog_config.png" width="50%"/>

<span>Clique no ícone <img src="../img/mdi/wifi_icon.png" width="30"/> para gerir as definições de rede.</span>

<img src="../img/rscontrol/zone_1_dialog_wifi.png" width="50%"/>

### Besouro

<span>O sino <img src="../img/mdi/mdi_bell-alert.png" width="20"/> fica por cima do LED de estado do hub. É verde enquanto o besouro está em silêncio, vermelho e intermitente enquanto toca, e continua vermelho depois de o alarme ser silenciado.</span>

Um clique abre a janela do besouro: o que está a fazer agora e porquê, e depois
os seus dois alarmes — o alarme de **perigo** (uma leitura fora do seu
intervalo) e o alarme de **fuga** —, cada um com o seu interruptor, a sua
frequência e o seu ciclo de trabalho, o anti-ressalto do perigo e o detetor de
fugas.

<img src="../img/rscontrol/zone_1_dialog_buzzer.png" width="50%"/>

## Power Center emparelhado

<img src="../img/rscontrol/zone_2.png"/>

---

Quando um ReefControl-Power está emparelhado com o hub, é desenhado por cima
dele, com 6 ou 8 tomadas conforme o modelo, ligado ao hub pelo seu cabo. Uma
tomada alimentada acende-se com uma ligeira máscara vermelha.

Um clique no Power Center abre o seu próprio cartão (ver
[ReefControl-Power](reefcontrol-power.pt.md#reefcontrol-power)).

Quando o Power Center está emparelhado mas não responde, pisca sob um ligeiro
tom vermelho. O emparelhamento e o desemparelhamento fazem-se a partir da janela
de configuração do controlador.

## Resumo

<img src="../img/rscontrol/zone_3.png"/>

---

A barra entre o Power Center e as sondas resume todas as leituras do hub, da
esquerda para a direita:

- Um aviso <img src="../img/mdi/mdi_alert.png" width="20"/>, apenas quando algo está errado: laranja quando a pior leitura é aceitável, vermelho quando uma está em perigo. As temperaturas integradas também contam.
- A **temperatura**: o valor fundido quando o hub tem várias fontes de temperatura, senão a da sonda de temperatura, senão a primeira temperatura integrada.
- <span>Um termómetro <img src="../img/mdi/mdi_thermometer-alert.png" width="20"/>, apenas quando o hub suspeita de uma das suas fontes de temperatura; a sua dica indica a sonda em causa.</span>
- O pH, o ORP e a salinidade, uma entrada por sonda.
- <span>Uma gota <img src="../img/mdi/mdi_water-alert.png" width="20"/> por sonda de fugas, vermelha quando está molhada.</span>
- <span>Ondas <img src="../img/mdi/mdi_waves.png" width="20"/> por sonda ATO, verdes num nível desejado, laranja abaixo ou acima.</span>

Cada leitura assume a cor do seu nível: verde para desejado, laranja para
aceitável, vermelho para perigo, branco quando a sonda não dá uma leitura
válida. Um clique numa leitura abre a sua janela de informação.

## Sondas

<img src="../img/rscontrol/zone_4.png"/>

---

Cada sonda do hub pende de uma caixa de extensão, pela ordem em que o hub as
lista. Cada uma mostra:

- A sua **leitura**, e a **temperatura integrada** logo abaixo para as sondas de
  pH, salinidade e ATO, coloridas conforme o seu nível. Um clique num valor abre
  a sua janela de informação.
- Uma **barra de situação** por leitura: as faixas vermelha, laranja e verde são
  os intervalos de perigo, aceitável e desejado definidos na sonda, e a marca
  preta indica onde está a leitura. A leitura principal fica na barra da
  esquerda, a temperatura na da direita. Um clique numa barra abre as últimas 24
  horas da leitura sobre as suas faixas.

<img src="../img/rscontrol/zone_4_history.png" width="50%"/>

- <span>Uma roda dentada <img src="../img/rsdose/cog_icon.png" width="30"/> que abre as definições da sonda.</span>

Uma sonda desligada pisca sob um ligeiro tom vermelho e não dá nenhuma leitura.

### Definições da sonda

<img src="../img/rscontrol/zone_4_dialog_probe.png" width="50%"/>

A janela reúne tudo sobre uma sonda: as suas leituras, o seu estado, os seus
intervalos desejado e aceitável (e os da sua temperatura integrada), a unidade
de apresentação de uma sonda de salinidade, e os seus interruptores — ativada,
besouro, notificações e manutenção, que mantém a sonda fora da fusão de
temperaturas enquanto é limpa ou calibrada.

Numa sonda de salinidade, os limites mostrados são os da unidade de apresentação escolhida: mude a unidade e a janela passa de imediato aos seus limites.

O botão **Ler valor** pede ao hub uma leitura nova em vez de esperar pela
consulta seguinte; os valores da janela atualizam-se no lugar.

Os botões de calibração em baixo só mostram as calibrações do tipo da sonda, e
nenhuma enquanto está desligada. Cada calibração abre a sua própria janela,
descrita abaixo por tipo de sonda.

### Tipos de sondas

#### pH

<img src="../../src/img/redsea/RSSENSE/rssense-ph-temperature.png" width="10%"/> <img src="../../src/img/redsea/RSSENSE/rssense-ph.png" width="10%"/>

A leitura de pH, e a temperatura quando a sonda tem uma — uma sonda de pH sem
temperatura tem a sua própria imagem, com uma única barra.

A calibração faz-se em dois pontos, como na aplicação ReefBeat: primeiro pH 7,
depois pH 10 para água salgada ou pH 4 para água doce, cada solução indicada com
a temperatura a que se refere. Após cada ponto, o hub espera que a leitura
estabilize: a janela mostra a estabilidade e o tempo restante, e o passo
seguinte só é desbloqueado quando o hub terminou. Fechar a janela cancela a
calibração.

<img src="../img/rscontrol/zone_4_calibration_ph.png" width="50%"/>

#### Salinidade

<img src="../../src/img/redsea/RSSENSE/rssense-salinity-temperature.png" width="10%"/>

A salinidade, na unidade escolhida nas definições da sonda, e a temperatura.

A calibração faz-se num único ponto: mergulhe a sonda na solução e introduza o
seu valor em mS/cm (entre 20 e 99).

<img src="../img/rscontrol/zone_4_calibration_ec.png" width="50%"/>

#### ORP

<img src="../../src/img/redsea/RSSENSE/rssense-orp.png" width="10%"/>

O ORP em mV. Para o calibrar, mergulhe a sonda na solução de referência e
introduza o valor da solução: a sonda passa a ler esse valor.

<img src="../img/rscontrol/zone_4_calibration_orp.png" width="50%"/>

#### Temperatura

<img src="../../src/img/redsea/RSSENSE/temperature.png" width="10%"/>

A temperatura, numa única barra. Para a calibrar, coloque a sonda em água cuja
temperatura mediu com um termómetro de referência, espere que a leitura
estabilize e introduza a temperatura real.

A temperatura integrada das sondas de pH, salinidade e ATO calibra-se da mesma
forma, a partir do seu próprio botão **Calibrar a temperatura**.

<img src="../img/rscontrol/zone_4_calibration_temperature.png" width="50%"/>

#### ATO

<img src="../../src/img/redsea/RSSENSE/rssense-ato.png" width="10%"/>

A sonda de nível é desenhada na água da sump, na marca reportada pela sonda,
como no [ReefATO+](reefato.pt.md#aquário). A sua temperatura é mostrada no corpo preto, logo
abaixo do conector.

| Estado           | Significado                                            |
| ---------------- | ------------------------------------------------------ |
| Abaixo           | A superfície está abaixo da sonda: o ATO não acompanha |
| Nível desejado 1 | Primeira marca de reposição                            |
| Nível desejado 2 | Segunda marca de reposição                             |
| Acima            | A superfície está acima da sonda: o aquário está cheio |

**Abaixo** e **Acima** fazem a água piscar. Uma sonda em erro não tem linha de
água.

#### Fuga

<img src="../../src/img/redsea/RSSENSE/rssense-leak.png" width="10%"/>

Quando é detetada água, uma poça espalha-se ao pé da sonda, e um ícone
intermitente indica de onde vem a água, tal como a sonda o reporta:

<table>
  <tr>
    <th align="center">Fuga de água do aquário <img src="../img/mdi/mdi_fish.png" width="20"/></th>
    <th align="center">Fuga de água osmotizada <img src="../img/mdi/mdi_cup-water.png" width="20"/></th>
  </tr>
  <tr>
    <td align="center"><img src="../img/rscontrol/zone_4_leak_aquarium.png"/></td>
    <td align="center"><img src="../img/rscontrol/zone_4_leak_rodi.png"/></td>
  </tr>
</table>

Uma sonda de fugas com a deteção desativada aparece a cinzento: está presente,
mas não deteta nada.

> [!NOTE]
> As sondas adicionam-se, substituem-se e removem-se a partir do menu de opções
> da integração (ver [ha-reefbeat-component](https://github.com/Elwinmage/ha-reefbeat-component/blob/main/doc/pt/reefcontrol.pt.md#gestão-de-sondas-adicionar--substituir--remover)):
> o cartão adapta-se sozinho.

## Portas de 12V

<img src="../img/rscontrol/zone_5.png"/>

---

Cada porta de 12V do hub tem a sua roda dentada por cima do conector, e o seu
consumo por cima dela (um clique abre a sua janela de informação). Uma porta
alimentada ilumina o seu conector. O Pro tem duas portas, com a roda dentada da
segunda desenhada de outra forma; o Lite tem uma.

<span>Um clique na roda dentada <img src="../img/mdi/cog-1.png" width="5%"/> abre as definições da porta: nome, interruptor, estado, tipo e consumo, e depois o editor de modo.</span>

<img src="../img/rscontrol/zone_5_dialog_port.png" width="50%"/>

Uma porta comanda-se como uma [tomada do Power Center](reefcontrol-power.pt.md#tomada), com os mesmos
quatro modos — **Ligado**, **Desligado**, **Agendamento** e **Sensor** — mais a
**potência** que fornece quando ligada, em %. Nada é enviado ao hub até premir
**Guardar**. Uma porta nunca instalada é instalada ao guardar, como faz a
aplicação ReefBeat.

<span>O ícone do caixote do lixo <img src="../img/mdi/mdi_delete-empty.png" width="20"/> no canto superior direito desinstala a porta, após confirmação: volta ao estado de fábrica e perde o nome, o agendamento e a regra de sonda.</span>

<img src="../img/rscontrol/zone_5_dialog_delete.png" width="50%"/>

## ATO

<img src="../img/rscontrol/zone_6.png"/>

---

Quando uma porta de 12V comanda uma bomba ATO — o kit ATO da Red Sea, ou
qualquer bomba que siga uma sonda ATO —, a bomba é desenhada no seu
reservatório, ligada à sua porta. Enquanto a porta está alimentada, a água corre
pela saída por cima da sump.

## Mensagens

<img src="../img/rscontrol/zone_7.png"/>

---

Esta zona mostra as últimas mensagens de sistema do ReefControl. Tem duas linhas:

- A linha cinzenta mostra a **última mensagem** recebida.
- A linha rosa mostra o **último alerta**, precedido do símbolo ⚠.

Clicar no ícone <img src="../img/mdi/mdi_delete-empty.png" width="20"/> apaga a mensagem correspondente.

Estas linhas podem ser ocultadas a partir da interface do editor do cartão.

## Editor do cartão

<img src="../img/rscontrol/editor.png" width="50%"/>

---

Além das duas linhas de mensagens, o ReefControl tem duas opções:

- **Sondas compactas**: cada leitura é mostrada como um ponto da cor do seu nível
  em vez de uma barra de situação. Um sinal no ponto indica de que lado do
  intervalo desejado está a leitura. Um clique no ponto abre as suas últimas 24
  horas, como a barra.
- **Posição das sondas**: as sondas são colocadas pela ordem em que o hub as
  lista. Uma sonda pode ser fixada numa posição das caixas de extensão, para que
  o cartão corresponda à ligação real das sondas. **Auto** devolve-a à ordem do
  hub.

---

[← Voltar à página principal](README.pt.md)
