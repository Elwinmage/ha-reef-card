[← Voltar à página principal](README.pt.md)

# ReefMat

ReefMat com ha-reef-card em ação:

[![Assistir ao vídeo](https://img.youtube.com/vi/yyNyUSitb1E/0.jpg)](https://www.youtube.com/watch?v=yyNyUSitb1E)

O cartão ReefMat está dividido em 7 zonas:

1. Configuração / Informações Wifi
2. Estados
3. Informações do rolo (comprimento total usado, comprimento restante, fim do rolo, modo...)
4. Avanço manual/automático
5. Sensor
6. Avanço programado
7. Gráfico de utilização semanal / mensal

<img src="../img/rsmat/rsmat_zones.png"/>

A imagem de fundo muda de acordo com o estado de utilização do rolo, com 5 imagens diferentes:

<table>
  <tr>
    <td align="center"><img src="../img/rsmat/RSMAT_100_BASE.png" width="100%"/><br/><b>0%</b></td>
    <td align="center"><img src="../img/rsmat/RSMAT_75_BASE.png" width="100%"/><br/><b>25%</b></td>
    <td align="center"><img src="../img/rsmat/RSMAT_50_BASE.png" width="100%"/><br/><b>50%</b></td>
  </tr>
  <tr>
    <td align="center"><img src="../img/rsmat/RSMAT_25_BASE.png" width="100%"/><br/><b>75%</b></td>
    <td align="center"><img src="../img/rsmat/RSMAT_0_BASE.png" width="100%"/><br/><b>100%</b></td>
    <td></td>
  </tr>
</table>

## Configuração / Informações Wifi

<img src="../img/rsmat/zone_1.png"/>

---

<span>Clique no ícone <img src="../img/rsdose/cog_icon.png" width="30" /> para gerir a configuração geral do ReefMat.</span>

<img src="../img/rsmat/zone_1_dialog_configuration.png"/>

<span>Clique no ícone <img src="../img/rsdose/wifi_icon.png" width="30" /> para gerir as definições de rede.</span>

<img src="../img/rsmat/zone_1_dialog_wifi.png"/>

## Estados

<img src="../img/rsmat/zone_2.png"/>

---

<span>O interruptor de manutenção <img src="../img/mdi/mdi_account-wrench.png" width="20"/> permite mudar para o modo de manutenção.</span>

 <img  src="../img/rsmat/maintenance.png"/>

<span>O interruptor on/off <img src="../img/mdi/mdi_power-plug.png" width="20"/> alterna o ReefMat entre os estados ligado e desligado.</span>

 <img  src="../img/rsmat/off_mode.png"/>

## Informações do rolo

<img src="../img/rsmat/zone_3.png"/>

---

Esta zona apresenta o estado em tempo real do rolo filtrante, de cima para baixo:

- O **comprimento total utilizado** desde o início do rolo (em cima, a vermelho)
- O **comprimento restante** ao centro a vermelho. Quando o rolo está vazio, aparece um <img src="../img/mdi/mdi_paper-roll.png" width="20"/> ícone a piscar e uma caixa de diálogo propõe substituir o rolo.

<img src="../img/rsmat/zone_3_dialog_new_roll.png"/>

- O **número de dias restantes** até ao fim do rolo, estimado com base no consumo diário médio (a preto)
- O **consumo diário médio** em cm (em baixo à esquerda)
- O **modo de funcionamento** atual: Auto, Manutenção, Desligado… (abaixo do logo RedSea)
- A **percentagem de rolo utilizado** (arco circular em baixo à direita)

Se for detetada uma anomalia, o logo RedSea transforma-se num <img src="../img/mdi/mdi_alert-decagram.png" width="20"/> ícone a piscar.
Clicar neste alerta abre a caixa de diálogo de anomalias:

<img src="../img/rsmat/alert.png"/>
<img src="../img/rsmat/zone_3_dialog_alert.png" />

## Avanço Manual/Automático

<img src="../img/rsmat/zone_4.png"/>
<img src="../img/rsmat/zone_4_auto_off.png"/>
---

Esta zona controla o avanço do rolo.

Da esquerda para a direita:

- O botão <img src="../img/mdi/mdi_send.png" width="20"/> inicia um **avanço manual** do rolo pelo comprimento indicado ao centro.
- O **valor de avanço** apresentado (em cm) é o valor enviado ao premir o botão. Clicar neste número abre a caixa de edição.

<img src="../img/rsmat/zone_4_dialog_manual_advance.png"/>

- O **botão de avanço automático** <img src="../img/mdi/mdi_autorenew.png" width="20"/> <img src="../img/mdi/mdi_autorenew-off.png" width="20"/> ativa ou desativa o avanço automático do rolo.

## Sensor

<img src="../img/rsmat/zone_5.png"/>

---

Esta zona indica o estado do sensor de nível.

Três estados são possíveis:

| Estado           | Imagem                                                          |
| ---------------- | --------------------------------------------------------------- |
| Sensor ligado    | <img src="../img/rsmat/RSMAT_SENSOR_PLUGGED.png" width="80"/>   |
| Sensor desligado | <img src="../img/rsmat/RSMAT_SENSOR_UNPLUGGED.png" width="80"/> |
| Sensor sujo      | <img src="../img/mdi/mdi_liquid-spot.png" width="80"/>          |

## Avanço programado

<img src="../img/rsmat/zone_6.png"/>

---

Este botão <img src="../img/mdi/mdi_auto-mode_red.png" width="20"/><img src="../img/mdi/mdi_auto-mode_black.png" width="20"/> mostra o estado do avanço programado e permite editá-lo clicando.

<img src="../img/rsmat/zone_6_dialog_schedule.png"/>

## Gráfico de utilização

<img src="../img/rsmat/zone_7.png"/> 
<img src="../img/rsmat/monthly.png"/>

---

Esta zona apresenta um gráfico do consumo do rolo ao longo do tempo.
Clicar no botão alterna entre os dois modos disponíveis:

- O modo **Weekly** apresenta o consumo dos últimos 7 dias.
- O modo **Monthly** apresenta o consumo dos últimos 30 dias.

Premir no canto superior esquerdo do gráfico abre a vista detalhada no Home Assistant.

## Messages

<img src="../img/rsmat/zone_8.png"/>

---

Esta zona apresenta as últimas mensagens do sistema do ReefMat. Tem duas linhas:

- A linha cinzenta mostra a **última mensagem** recebida.
- A linha rosa mostra o **último alerta**, precedido pelo símbolo ⚠.

Clicar em <img src="../img/mdi/mdi_delete-empty.png" width="20"/> apaga a mensagem correspondente.

Linie te można ukryć za pomocą interfejsu edytora karty.

<img src="../img/rsmat/editor.png" />

---

[← Voltar à página principal](README.pt.md)
