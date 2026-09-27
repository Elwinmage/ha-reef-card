[← Voltar à página principal](README.pt.md)

# ReefRun

ReefRun com ha-reef-card em ação:

[![Ver o vídeo](https://img.youtube.com/vi/Xxv38OPqiGI/0.jpg)](https://www.youtube.com/watch?v=Xxv38OPqiGI)

O cartão ReefRun mostra o controlador e as suas duas bombas tal como estão
fisicamente ligadas, cada uma com o seu cabo e a sua tubagem. A bomba 1 é a da
esquerda e a bomba 2 a da direita — normalmente a bomba de retorno e o DC
Skimmer, mas cada tomada aceita qualquer um dos modelos.

<img src="../img/rsrun/rsrun_zones.png"/>

O cartão está dividido em 6 zonas:

1. Estado de alimentação e modo de manutenção
2. Informações de bateria e Wifi
3. Controlador: modo de funcionamento, botões das bombas e calibrações
4. Bomba 1: programação diária, corpo com caudal de água em direto, temperatura
5. Bomba 2: programação diária, corpo com caudal de água em direto, temperatura
6. Última mensagem e último alerta

## Estado de alimentação e modo de manutenção

<img src="../img/rsrun/zone_1.png" >

<span>O interruptor de manutenção <img src="../img/mdi/mdi_account-wrench.png" width="20"/> muda para o modo de manutenção.</span>

<img src="../img/rsrun/maintenance.png" >

<span>O interruptor ligar/desligar <img src="../img/mdi/mdi_power-plug.png" width="20"/> liga e desliga o Reef Dual Controller.</span>

<img src="../img/rsrun/off_mode.png" >

## Informações de bateria e Wifi

<img src="../img/rsrun/zone_2.png"/>

---

<span>Este ícone <img src="../img/mdi/battery.png" width="30" /> indica o nível de bateria do Dual Controller.</span>

<span>Clique no ícone <img src="../img/mdi/wifi_icon.png" width="30" /> para gerir as definições de rede.</span>

<img src="../img/rsrun/zone_2_dialog_wifi.png"/>

## Controlador: modo de funcionamento, botões das bombas e calibrações

<img src="../img/rsrun/zone_3.png"/>

### Definições das bombas

Um clique em <img src="../img/mdi/cog-1.png" width="5%"/> ou <img src="../img/mdi/cog-2.png" width="5%"/> abre o diálogo de configuração da bomba 1 ou 2.

<img src="../img/rsrun/zone_3_return_pump.png"/>
<img src="../img/rsrun/zone_3_skimmer.png"/>

> [!CAUTION]
> **Eliminar a bomba** repõe as suas definições nos valores de fábrica: a
> programação e o controlo por sonda são perdidos. É sempre pedida uma
> confirmação.

### Definições da sonda

Um clique em <img src="../img/mdi/cog-s.png" width="5%"/> abre o diálogo de configuração da sonda.
<img src="../img/rsrun/zone_3_sensor.png"/>

### Play/pausa de uma bomba <img src="../img/mdi/play.png" width="5%"/> / <img src="../img/mdi/pause.png" width="5%"/>

Um clique liga ou desliga essa bomba.

O anel vermelho indica a velocidade atual.
<img src="../img/rsrun/speed.png"/>

Para alterar a velocidade atual, mantenha premido <img src="../img/mdi/play.png" width="5%"/> / <img src="../img/mdi/pause.png" width="5%"/> ou clique na programação:

<img src="../img/rsrun/schedule.png"/>

## Estados de uma bomba

O corpo da bomba reflete o que o aparelho está mesmo a fazer, basta um relance.
Os dois tipos de bomba não têm os mesmos estados, pelo que são descritos
separadamente.

## Bombas 1 e 2

### Bomba de retorno

<img src="../../src/img/redsea/RSRUN/reefrun_return.png" width="30%"/>

Uma única ilustração cobre todos os estados, o cartão só muda a forma de a
desenhar:

- **Em funcionamento** — cores plenas, água animada à velocidade atual.
- **Parada** — a mesma ilustração acinzentada, sem caudal.
- **Desligada** — o mesmo acinzentado, mais o cabo de alimentação a piscar.

### Escumador

Três ilustrações distintas, uma por estado do copo:

<table>
  <tr>
    <td align="center"><img src="../../src/img/redsea/RSRUN/reefrun_skimmer_on.png" width="100%"/><br/><b>Em funcionamento</b><br/>Espuma no copo, bolhas a subir, água animada</td>
    <td align="center"><img src="../../src/img/redsea/RSRUN/reefrun_skimmer_full.png" width="100%"/><br/><b>Copo cheio</b><br/>Espuma reduzida a uma faixa sob a tampa</td>
    <td align="center"><img src="../../src/img/redsea/RSRUN/reefrun_skimmer_off.png" width="100%"/><br/><b>Parado</b><br/>Copo vazio, acinzentado, sem bolhas</td>
  </tr>
</table>

Um escumador desligado é exatamente igual a um parado: só o cabo a piscar os
distingue. Esse piscar significa que o ReefRun comunica `missing_pump`, ou seja,
a bomba está configurada mas o controlador já não a vê. Verifique a ficha antes
de procurar mais longe.

O estado de copo cheio é comunicado pelo sensor de espuma situado na câmara de
recolha. O corpo muda para a sua própria ilustração e a animação de espuma
reduz-se a uma faixa fina sob a tampa, esteja ou não a autorregulação ativa. O
ícone de alerta a piscar junto ao interruptor de copo cheio só aparece se
`sensor_controlled` estiver ativo, pois com o sensor desativado o controlador
não age perante um copo cheio.

### Adicionar uma bomba

Uma tomada sem bomba configurada mostra um marcador de **adicionar** em vez de um
corpo de bomba:

<img src="../../src/img/redsea/RSRUN/add_pump.png" width="20%"/>

Um clique abre o diálogo de configuração, onde **Detetar e adicionar** pergunta
ao controlador o que está ligado e regista-o numa só operação. O modelo detetado
é apenas uma sugestão e por vezes engana-se, por isso a lista de modelos
permanece editável a seguir: para um DC Skimmer escolha rsk-300, rsk-600 ou
rsk-900. O nome da bomba edita-se no mesmo diálogo.

O marcador está presente em qualquer tomada não configurada, pelo que também
aparece numa tomada que não tenciona usar. Quem tem apenas uma bomba pode
escondê-lo por completo a partir do editor do cartão.

<img src="../img/rsrun/editor.png"/>

### Programação

<img src="../img/rsrun/schedule.png"/>

A curva azul é a velocidade programada ao longo de 24 horas. A linha vermelha
vertical marca a hora atual e o ponto sobre ela a velocidade pedida pela
programação.

Quando a bomba não segue a sua programação — modo alimentação, deteção de copo
cheio, proteção contra sobre-escumação — o ponto desloca-se para a velocidade
**real** e um segmento vermelho materializa a diferença, com o valor ao lado:

<img src="../img/rsrun/schedule_deviation.png"/>

Um clique no gráfico abre o editor de programação: adicionar ou remover pontos, editar horas e velocidades, pré-visualizar um ponto no aparelho e guardar.

<img src="../img/rsrun/schedule_editor.png"/>

## Mensagens

<img src="../img/rsrun/zone_6.png"/>

---

Esta zona apresenta as últimas mensagens de sistema do ReefRun. Tem duas linhas:

- A linha cinzenta mostra a **última mensagem** recebida.
- A linha rosa mostra o **último alerta**, precedido do símbolo ⚠.

Um clique no ícone <img src="../img/mdi/mdi_delete-empty.png" width="20"/> apaga a mensagem correspondente.

Estas linhas podem ser ocultadas a partir do editor do cartão.

<img src="../img/rsrun/editor_2.png" />

---

[← Voltar à página principal](README.pt.md)
