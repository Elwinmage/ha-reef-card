[← Torna alla pagina principale](README.it.md)

# ReefMat

ReefMat con ha-reef-card in azione:

[![Guarda il video](https://img.youtube.com/vi/yyNyUSitb1E/0.jpg)](https://www.youtube.com/watch?v=yyNyUSitb1E)

La scheda ReefMat è divisa in 7 zone:

1. Configurazione / Informazioni Wifi
2. Stati
3. Informazioni sul rotolo (lunghezza totale usata, lunghezza rimanente, fine rotolo, modalità...)
4. Avanzamento manuale/automatico
5. Sensore
6. Avanzamento programmato
7. Grafico di utilizzo settimanale / mensile

<img src="../img/rsmat/rsmat_zones.png"/>

L'immagine di sfondo cambia in base allo stato di utilizzo del rotolo con 5 immagini diverse:

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

## Configurazione / Informazioni Wifi

<img src="../img/rsmat/zone_1.png"/>

---

<span>Fare clic sull'icona <img src="../img/rsdose/cog_icon.png" width="30" /> per gestire la configurazione generale del ReefMat.</span>

<img src="../img/rsmat/zone_1_dialog_configuration.png"/>

<span>Fare clic sull'icona <img src="../img/rsdose/wifi_icon.png" width="30" /> per gestire le impostazioni di rete.</span>

<img src="../img/rsmat/zone_1_dialog_wifi.png"/>

## Stati

<img src="../img/rsmat/zone_2.png"/>

---

<span>L'interruttore di manutenzione <img src="../img/mdi/mdi_account-wrench.png" width="20"/> passa alla modalità manutenzione.</span>

 <img  src="../img/rsmat/maintenance.png"/>

<span>L'interruttore on/off <img src="../img/mdi/mdi_power-plug.png" width="20"/> alterna il ReefMat tra gli stati acceso e spento.</span>

 <img  src="../img/rsmat/off_mode.png"/>

## Informazioni sul rotolo

<img src="../img/rsmat/zone_3.png"/>

---

Questa zona mostra in tempo reale lo stato del rotolo filtrante, dall'alto verso il basso:

- La **lunghezza totale utilizzata** dall'inizio del rotolo (in alto, in rosso)
- La **lunghezza rimanente** al centro in rosso. Quando il rotolo è vuoto, appare un'icona <img src="../img/mdi/mdi_paper-roll.png" width="20"/> lampeggiante al suo posto e una finestra di dialogo propone di sostituire il rotolo.

<img src="../img/rsmat/zone_3_dialog_new_roll.png"/>

- Il **numero di giorni rimanenti** prima della fine del rotolo, stimato in base al consumo giornaliero medio (in nero)
- Il **consumo giornaliero medio** in cm (in basso a sinistra)
- La **modalità operativa** corrente: Auto, Manutenzione, Spento… (sotto il logo RedSea)
- La **percentuale di rotolo utilizzato** (arco circolare in basso a destra)

Se viene rilevata un'anomalia, il logo RedSea si trasformerà in un'icona <img src="../img/mdi/mdi_alert-decagram.png" width="20"/> lampeggiante.
Facendo clic su questo avviso si apre la finestra di dialogo delle anomalie:

<img src="../img/rsmat/alert.png"/>
<img src="../img/rsmat/zone_3_dialog_alert.png" />

## Avanzamento Manuale/Automatico

<img src="../img/rsmat/zone_4.png"/>
<img src="../img/rsmat/zone_4_auto_off.png"/>
---

Questa zona controlla l'avanzamento del rotolo.

Da sinistra a destra:

- Il pulsante <img src="../img/mdi/mdi_send.png" width="20"/> avvia un **avanzamento manuale** del rotolo della lunghezza indicata al centro.
- Il **valore di avanzamento** visualizzato (in cm) è il valore inviato alla pressione del pulsante. Cliccando su questo numero si apre la finestra di modifica.

<img src="../img/rsmat/zone_4_dialog_manual_advance.png"/>

- Il **pulsante di avanzamento automatico** <img src="../img/mdi/mdi_autorenew.png" width="20"/> <img src="../img/mdi/mdi_autorenew-off.png" width="20"/> abilita o disabilita l'avanzamento automatico del rotolo.

## Sensore

<img src="../img/rsmat/zone_5.png"/>

---

Questa zona mostra lo stato del sensore di livello.

Tre stati sono possibili:

| Stato              | Immagine                                                        |
| ------------------ | --------------------------------------------------------------- |
| Sensore collegato  | <img src="../img/rsmat/RSMAT_SENSOR_PLUGGED.png" width="80"/>   |
| Sensore scollegato | <img src="../img/rsmat/RSMAT_SENSOR_UNPLUGGED.png" width="80"/> |
| Sensore sporco     | <img src="../img/mdi/mdi_liquid-spot.png" width="80"/>          |

## Avanzamento programmato

<img src="../img/rsmat/zone_6.png"/>

---

Questo pulsante <img src="../img/mdi/mdi_auto-mode_red.png" width="20"/><img src="../img/mdi/mdi_auto-mode_black.png" width="20"/> mostra lo stato dell'avanzamento programmato e permette di modificarlo cliccando.

<img src="../img/rsmat/zone_6_dialog_schedule.png"/>

## Grafico di utilizzo

<img src="../img/rsmat/zone_7.png"/> 
<img src="../img/rsmat/monthly.png"/>

---

Questa zona mostra un grafico del consumo del rotolo nel tempo.
Cliccando il pulsante si alterna tra le due modalità disponibili:

- La modalità **Weekly** mostra il consumo degli ultimi 7 giorni.
- La modalità **Monthly** mostra il consumo degli ultimi 30 giorni.

Premendo in alto a sinistra del grafico si apre la vista dettagliata in Home Assistant.

## Messages

<img src="../img/rsmat/zone_8.png"/>

---

Questa zona mostra gli ultimi messaggi di sistema del ReefMat. Ha due righe:

- La riga grigia mostra l'**ultimo messaggio** ricevuto.
- La riga rosa mostra l'**ultimo avviso**, preceduto dal simbolo ⚠.

Cliccando su <img src="../img/mdi/mdi_delete-empty.png" width="20"/> si cancella il messaggio corrispondente.

Queste righe possono essere nascoste tramite l'interfaccia dell'editor della scheda.

<img src="../img/rsmat/editor.png" />

---

[← Torna alla pagina principale](README.it.md)
