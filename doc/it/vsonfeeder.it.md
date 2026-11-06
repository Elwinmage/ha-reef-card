[← Torna alla pagina principale](README.it.md)

# Mangiatoia VSON (modificata)

La card controlla una mangiatoia automatica VSON il cui controller è stato sostituito da un ESP32 (Lolin S2 mini) con [ESPHome](https://esphome.io). La mangiatoia conserva il motore, il sensore dello sportello e il sensore del livello del cibo; il firmware aggiunge cinque fasce di alimentazione e un interruttore di alimentazione manuale.

<img src="../img/vsonfeeder/overview.png" width="400"/>

## Modificare la mangiatoia

La mangiatoia (VSON WP8621 V1.2) viene aperta e la sua scheda originale sostituita da un ESP32: il cablaggio del motore, del sensore dello sportello e del sensore di livello, e il flash, sono spiegati in questa discussione della community Home Assistant: [VSON WP8621 V1.2 fish feeder](https://community.home-assistant.io/t/vson-wp8621-v12-fish-feeder/759621).

## Firmware

La configurazione ESPHome è in [doc/esphome/vson-fish-feeder.yaml](../esphome/vson-fish-feeder.yaml). Metti le tue chiavi e password in `secrets.yaml` (`fish_feeder_api_key`, `fish_feeder_ota_password`, `fish_feeder_ap_password`, più `wifi_ssid` e `wifi_password`).

I dispositivi ESPHome non hanno un identificativo su cui la card possa contare, quindi la mangiatoia viene riconosciuta dal **nome del progetto** dichiarato dal firmware:

```yaml
esphome:
  project:
    name: "vson.fish_feeder"
    version: "1.2.0"
```

Home Assistant lo trasforma nel produttore (`vson`) e nel modello (`fish_feeder`) del dispositivo. Dopo il flash, la mangiatoia appare nel selettore dei dispositivi della card. Ogni altro dispositivo ESPHome viene ignorato.

Le entità vengono trovate dalla fine del loro id entità, quindi il dispositivo può essere rinominato liberamente. Mantieni i nomi delle entità del firmware (`Manual Feed`, `Open/Close Sensor`, `Food Level Sensor`, `Slot 1`…`Slot 5`, `Portion slot 1`…`Portion slot 5`).

## La vista

La card è divisa in 2 zone:

1. La mangiatoia
2. Le fasce di alimentazione

### 1. La mangiatoia

L'immagine segue i sensori:

|                      | Riserva OK                                                                 | Riserva bassa                                                               |
| -------------------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| **Sportello chiuso** | <img src="../../src/img/esphome/VSONFEEDER/closed_full.webp" width="120"/> | <img src="../../src/img/esphome/VSONFEEDER/closed_empty.webp" width="120"/> |
| **Sportello aperto** | <img src="../../src/img/esphome/VSONFEEDER/open_full.webp" width="120"/>   | <img src="../../src/img/esphome/VSONFEEDER/open_empty.webp" width="120"/>   |

- Mentre lo sportello è aperto (o il motore gira), cadono i granuli.
- Quattro cose sono applicate sulla mangiatoia, deformate per seguirne le facce:
  - sulla faccia anteriore, sopra lo sportello, un piccolo display indica l'**uptime** del controller (un clic apre il sensore);
  - sul vetro del coperchio, un avviso rosso **lampeggia** quando il sensore di livello segnala che la riserva è bassa (un clic apre il sensore);
  - sulla faccia destra, le **alimentazioni del giorno**: barrate in grigio una volta passata la loro ora, la prossima in arancione, le successive in verde. Solo gli orari dicono quali sono passate: il firmware non tiene traccia delle porzioni date;
  - più in basso sulla faccia destra, il pulsante di **riavvio**: un primo tocco lo arma (diventa arancione), un secondo tocco entro 3 secondi riavvia il controller.
- Un clic sull'immagine apre il sensore dello sportello.
- L'icona <img src="https://raw.githubusercontent.com/Templarian/MaterialDesign/master/svg/wrench-clock.svg" width="16"/> in alto a destra apre le attività di manutenzione della mangiatoia, se ne ha.

<img src="../img/vsonfeeder/feeding.png" width="400"/>

### 2. Le fasce di alimentazione

- **Prossima alimentazione**: l'ora della prossima fascia, il tempo rimanente e le sue porzioni.
- **Fasce**: le cinque fasce del firmware. L'ora si modifica direttamente (`time.set_value`), le porzioni con i pulsanti − e + (`number.set_value`, da 0 a 10). Una fascia con 0 porzioni è spenta e in grigio. La prossima fascia è evidenziata.
- Una fascia alla stessa ora di una precedente appare barrata: il firmware la salta mentre la prima sta ancora alimentando.
- **Porzioni al giorno**: le porzioni effettivamente date in un giorno.
- **Alimenta ora**: dà una porzione (attiva l'interruttore `Manual Feed`; il firmware lo spegne quando lo sportello si è richiuso).

<img src="../img/vsonfeeder/reserve_low.png" width="300"/>

Quando Home Assistant non raggiunge il controller, l'immagine diventa grigia e il titolo indica _Irraggiungibile_.
