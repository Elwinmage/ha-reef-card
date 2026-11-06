[← Voltar à página principal](README.pt.md)

# Alimentador VSON (modificado)

O cartão controla um alimentador automático VSON cujo controlador foi substituído por um ESP32 (Lolin S2 mini) com [ESPHome](https://esphome.io). O alimentador mantém o motor, o sensor da portinhola e o sensor do nível de comida; o firmware acrescenta cinco períodos de alimentação e um interruptor de alimentação manual.

<img src="../img/vsonfeeder/overview.png" width="400"/>

## Modificar o alimentador

O alimentador (VSON WP8621 V1.2) é aberto e a sua placa original substituída por um ESP32: a ligação do motor, do sensor da portinhola e do sensor de nível, e a gravação do firmware, são explicadas neste tópico da comunidade Home Assistant: [VSON WP8621 V1.2 fish feeder](https://community.home-assistant.io/t/vson-wp8621-v12-fish-feeder/759621).

## Firmware

A configuração ESPHome está em [doc/esphome/vson-fish-feeder.yaml](../esphome/vson-fish-feeder.yaml). Coloque as suas chaves e palavras-passe em `secrets.yaml` (`fish_feeder_api_key`, `fish_feeder_ota_password`, `fish_feeder_ap_password`, mais `wifi_ssid` e `wifi_password`).

Os dispositivos ESPHome não têm um identificador em que o cartão possa confiar, por isso o alimentador é reconhecido pelo **nome do projeto** que o firmware declara:

```yaml
esphome:
  project:
    name: "vson.fish_feeder"
    version: "1.2.0"
```

O Home Assistant transforma-o no fabricante (`vson`) e no modelo (`fish_feeder`) do dispositivo. Depois de gravado, o alimentador aparece no seletor de dispositivos do cartão. Qualquer outro dispositivo ESPHome é ignorado.

As entidades são encontradas pelo fim do seu id de entidade, por isso o dispositivo pode ser renomeado livremente. Mantenha os nomes de entidade do firmware (`Manual Feed`, `Open/Close Sensor`, `Food Level Sensor`, `Slot 1`…`Slot 5`, `Portion slot 1`…`Portion slot 5`).

## A vista

O cartão está dividido em 2 zonas:

1. O alimentador
2. Os períodos de alimentação

### 1. O alimentador

A imagem segue os sensores:

|                        | Reserva OK                                                                 | Reserva baixa                                                               |
| ---------------------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| **Portinhola fechada** | <img src="../../src/img/esphome/VSONFEEDER/closed_full.webp" width="120"/> | <img src="../../src/img/esphome/VSONFEEDER/closed_empty.webp" width="120"/> |
| **Portinhola aberta**  | <img src="../../src/img/esphome/VSONFEEDER/open_full.webp" width="120"/>   | <img src="../../src/img/esphome/VSONFEEDER/open_empty.webp" width="120"/>   |

- Enquanto a portinhola está aberta (ou o motor funciona), caem grânulos.
- Quatro coisas estão colocadas no alimentador, deformadas para seguir as suas faces:
  - na face frontal, por cima da portinhola, um pequeno ecrã dá o **tempo de funcionamento** do controlador (um clique abre o sensor);
  - no vidro da tampa, um aviso vermelho **pisca** quando o sensor de nível indica que a reserva está baixa (um clique abre o sensor);
  - na face direita, as **alimentações do dia**: riscadas a cinzento depois de passada a hora, a próxima a laranja, as seguintes a verde. Só as horas dizem quais passaram: o firmware não guarda registo das porções dadas;
  - mais abaixo na face direita, o botão de **reinício**: um primeiro toque arma-o (fica laranja), um segundo toque em 3 segundos reinicia o controlador.
- Um clique na imagem abre o sensor da portinhola.
- O ícone <img src="https://raw.githubusercontent.com/Templarian/MaterialDesign/master/svg/wrench-clock.svg" width="16"/> no canto superior direito abre as tarefas de manutenção do alimentador, se as tiver.

<img src="../img/vsonfeeder/feeding.png" width="400"/>

### 2. Os períodos de alimentação

- **Próxima alimentação**: a hora do próximo período, o tempo restante e as suas porções.
- **Períodos**: os cinco períodos do firmware. A hora edita-se no local (`time.set_value`), as porções com os botões − e + (`number.set_value`, de 0 a 10). Um período com 0 porções está desligado e a cinzento. O próximo período fica destacado.
- Um período à mesma hora de um anterior aparece riscado: o firmware ignora-o enquanto o primeiro ainda estiver a alimentar.
- **Porções por dia**: as porções realmente dadas num dia.
- **Alimentar agora**: dá uma porção (liga o interruptor `Manual Feed`; o firmware desliga-o quando a portinhola volta a fechar).

<img src="../img/vsonfeeder/reserve_low.png" width="300"/>

Quando o Home Assistant não consegue alcançar o controlador, a imagem fica cinzenta e o título indica _Inacessível_.
