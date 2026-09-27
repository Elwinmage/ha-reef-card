[← Torna alla pagina principale](README.it.md)

# ReefControl-Power

ReefControl e ReefControl-Power con ha-reef-card in azione:

[![Guarda il video](https://img.youtube.com/vi/VIDEO_ID/0.jpg)](https://www.youtube.com/watch?v=VIDEO_ID)

La card ReefControl-Power disegna il Power Center con le sue prese, ciò che è
collegato a ciascuna, e alla sua sinistra la propria sonda di temperatura o il
[ReefControl](reefcontrol.it.md#reefcontrol) a cui è abbinato.

Entrambi i modelli sono supportati: differiscono solo per il numero di prese.

<table>
  <tr>
    <th align="center">RSPOWER6</th>
    <th align="center">RSPOWER8</th>
  </tr>
  <tr>
    <td align="center"><img src="../img/rspower/rspower6.png"/></td>
    <td align="center"><img src="../img/rspower/rspower8.png"/></td>
  </tr>
</table>

Il resto di questa sezione è illustrato con l'RSPOWER6: tutto funziona allo
stesso modo sull'RSPOWER8.

<img src="../img/rspower/rspower_zones.png"/>

La card è divisa in 6 zone:

1. Stato di alimentazione e modalità manutenzione
2. Configurazione, Wifi e batteria
3. Prese
4. Sonda di temperatura o collegamento ReefControl
5. Dispositivi collegati
6. Ultimo messaggio e ultimo allarme

## Stato di alimentazione e modalità manutenzione

<img src="../img/rspower/zone_1.png"/>

---

<span>L'interruttore <img src="../img/mdi/mdi_power-plug.png" width="20"/> accende o spegne il ReefControl-Power.</span>

<img src="../img/rspower/off_mode.png" width="50%"/>

Da spenta, la card conserva solo l'interruttore, l'immagine della sonda di
temperatura o del ReefControl abbinato, e i collegamenti agli altri dispositivi:
il nome dell'hub e i dispositivi collegati alle prese aprono ancora la loro
card. Le prese perdono pulsanti, nomi e consumi, e la sonda la sua lettura e le
sue impostazioni.

<span>L'interruttore <img src="../img/mdi/mdi_account-wrench.png" width="20"/> passa alla modalità manutenzione.</span>

<img src="../img/rspower/maintenance.png" width="50%"/>

## Configurazione / Informazioni Wifi

<img src="../img/rspower/zone_2.png"/>

---

<span>Clicca sull'icona <img src="../img/rsdose/cog_icon.png" width="30"/> per gestire la configurazione generale del ReefControl-Power: aggiornare le impostazioni o i dati letti, riavviare il dispositivo, aggiornarne il firmware, e vedere la sua regione e il suo numero di prese.</span>

La stessa finestra aggiunge o rimuove la sonda di temperatura locale, e disabbina
il ReefControl. La sonda e l'hub si escludono: un pulsante che non si applica
appare in grigio invece di essere nascosto, così vedi quali azioni esistono.

<img src="../img/rspower/zone_2_dialog_config.png" width="50%"/>

<span>Clicca sull'icona <img src="../img/mdi/wifi_icon.png" width="30"/> per gestire le impostazioni di rete.</span>

<img src="../img/rspower/zone_2_dialog_wifi.png" width="50%"/>

<span>L'icona <img src="../img/mdi/battery.png" width="30"/> indica il livello della batteria del ReefControl-Power.</span>

## Prese

<img src="../img/rspower/zone_3.png"/>

---

Il testo sul frontale del Power Center è la sua **modalità di funzionamento**
(Auto, Setup…), accanto al **consumo totale** delle sue prese. Un clic sul
consumo apre la sua finestra di informazioni.

Ogni presa mostra, dall'alto verso il basso:

- Il suo **nome**.
- Il suo **pulsante**, incorniciato nel colore della presa, con l'icona rossa
  quando la presa è alimentata e grigia quando è spenta. Mostra una spina, o
  l'icona del dispositivo collegato (vedi [Dispositivi collegati](#dispositivi-collegati)).
- Il suo **consumo**, che apre la sua finestra di informazioni.

Piccole icone nella parte bassa del pulsante indicano come è comandata la presa:

| Icona                                                                                                                                                                                                                                                                                                                               | Significato                                                                       |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| <img src="../img/mdi/mdi_power.png" width="20"/>                                                                                                                                                                                                                                                                                    | Accesa o spenta a mano                                                            |
| <img src="../img/mdi/mdi_clock-time-nine-outline.png" width="20"/>                                                                                                                                                                                                                                                                  | Segue una pianificazione — un clic apre il suo editor                             |
| <img src="../img/mdi/mdi_thermometer.png" width="20"/> <img src="../img/mdi/mdi_ph.png" width="20"/> <img src="../img/mdi/mdi_water-percent.png" width="20"/> <img src="../img/mdi/mdi_flash-triangle.png" width="20"/> <img src="../img/mdi/mdi_water-alert.png" width="20"/> <img src="../img/mdi/mdi_cup-water.png" width="20"/> | Segue una sonda: temperatura, pH, salinità, ORP, perdita o livello dell'acqua ATO |
| <img src="../img/mdi/mdi_hand-back-left-outline.png" width="20"/>                                                                                                                                                                                                                                                                   | La sua pianificazione o la sua sonda è sospesa: la presa è stata spenta a mano    |

Una presa mai configurata mostra un **+** al posto del pulsante: un clic apre le
sue impostazioni per darle una modalità.

Un **clic** sul pulsante apre le impostazioni della presa. Una **pressione
lunga** accende o spegne direttamente la presa.

### Presa

<img src="../img/rspower/zone_3_dialog_socket.png" width="50%"/>

La finestra inizia con il nome, l'interruttore, lo stato e il consumo della
presa, poi offre le sue quattro modalità:

- **Acceso** / **Spento**: la presa resta alimentata, oppure no.
- **Pianificazione**: una linea temporale di 24 ore e l'elenco dei suoi
  intervalli di **accensione**. Aggiungi, modifica o elimina intervalli; un
  intervallo che finisce prima di iniziare, o che si sovrappone al precedente,
  viene spiegato sotto l'elenco e blocca il salvataggio.

<img src="../img/rspower/zone_3_socket_schedule.png" width="50%"/>

- **Sensore**: la presa segue una sonda — la sonda di temperatura locale del
  Power Center, o qualsiasi sonda del ReefControl abbinato, temperature
  integrate comprese. Scegli se la presa si **accende** o si **spegne**, quando
  la lettura passa **sopra** o **sotto** una **soglia**, con un'**isteresi** (una
  banda morta attorno alla soglia, perché la presa non sfarfalli), e cosa fare se
  la sonda viene persa. Una presa che segue una sonda ATO non ha bisogno di
  soglia.

<img src="../img/rspower/zone_3_socket_sensor.png" width="50%"/>

Nulla viene inviato al dispositivo finché non premi **Salva**.

Quando una presa che segue una pianificazione o una sonda è stata spenta a mano,
la finestra si apre su quella modalità automatica, indica che è sospesa e
propone di **riprenderla** senza riscrivere la sua pianificazione o la sua
regola.

<img src="../img/rspower/zone_3_socket_override.png" width="50%"/>

<span>L'icona del cestino <img src="../img/mdi/mdi_delete-empty.png" width="20"/> in alto a destra cancella la configurazione della presa, dopo una conferma: la presa riprende il suo nome di fabbrica e non ha più una modalità.</span>

<img src="../img/rspower/zone_3_dialog_delete.png" width="50%"/>

## Sonda di temperatura o collegamento ReefControl

La parte sinistra della card mostra da dove il Power Center legge la sua
temperatura: dalla propria sonda o dal ReefControl a cui è abbinato. I due si
escludono.

### Sonda di temperatura

<img src="../img/rspower/zone_4_temperature.png"/>

---

La sonda di temperatura locale è disegnata collegata al Power Center, con la sua
lettura nel colore del suo livello e una barra di situazione lungo la sonda (un
punto nella modalità compatta dell'editor della card). Un clic sulla barra apre
le ultime 24 ore della temperatura sopra le sue bande.

Una sonda scollegata lampeggia sotto una leggera tinta rossa.

<span>Un clic sull'ingranaggio <img src="../img/rsdose/cog_icon.png" width="30"/> apre le impostazioni della sonda: il nome, un pulsante per leggerla subito, gli intervalli desiderato e accettabile, la calibrazione con la temperatura reale, e gli interruttori di registrazione e di notifiche.</span>

<img src="../img/rspower/zone_4_dialog_temperature.png" width="50%"/>

### Collegamento ReefControl

<img src="../img/rspower/zone_4_rscontrol.png"/>

---

Un ReefControl abbinato prende il posto della sonda: il suo cavo è disegnato con
il nome dell'hub lungo di esso. Un clic sul nome apre la card dell'hub.

<span>L'icona <img src="../img/mdi/mdi_web.png" width="20"/> apre la finestra del collegamento: l'hub abbinato, il suo tipo e il suo stato, e se è connesso al Power Center e a internet.</span>

<img src="../img/rspower/zone_4_dialog_rscontrol.png" width="50%"/>

Quando l'hub è abbinato ma non risponde, il collegamento lampeggia sotto una
leggera tinta rossa.

## Dispositivi collegati

<img src="../img/rspower/zone_5.png"/>

---

Il Power Center non sa cosa è collegato alle sue prese: la card permette di
indicarlo dall'editor della card. Una presa collegata a un dispositivo Red Sea o
a una pompa Aqua Medic mostra:

- un'immagine del dispositivo sotto la presa, su due file sfalsate perché le
  vicine non si sovrappongano, collegata ad essa da un tubo del colore della
  presa (grigio mentre la presa è spenta);
- l'icona del dispositivo sul pulsante della presa, al posto della spina.

Una pompa ReefRun è rappresentata dalla sua funzione, pompa di risalita o
schiumatoio, invece che dal suo controller. Qualsiasi altro dispositivo noto a
Home Assistant può essere collegato, ma non ha ancora un'immagine.

Per un apparecchio che Home Assistant non conosce (riscaldatore, lampada, ventola…), scegliete **Altro**: il pulsante della presa mostra allora <img src="../img/mdi/mdi_dots-horizontal-circle-outline.png" width="20"/> al posto della spina, senza immagine sotto.

L'immagine segue lo stato del dispositivo:

| Aspetto      | Stato del dispositivo Red Sea                                                      |
| ------------ | ---------------------------------------------------------------------------------- |
| Normale      | Funziona normalmente                                                               |
| In grigio    | Spento                                                                             |
| Lampeggiante | Tutto il resto: modalità manuale, manutenzione, non disponibile, una pompa guasta… |

I dispositivi di altre integrazioni sono sempre disegnati normali.

Un clic sull'immagine apre la card del dispositivo.

## Messaggi

<img src="../img/rspower/zone_6.png"/>

---

Questa zona mostra gli ultimi messaggi di sistema del ReefControl-Power. Ha due righe:

- La riga grigia mostra l'**ultimo messaggio** ricevuto.
- La riga rosa mostra l'**ultimo allarme**, preceduto dal simbolo ⚠.

Cliccando sull'icona <img src="../img/mdi/mdi_delete-empty.png" width="20"/> si cancella il messaggio corrispondente.

Queste righe possono essere nascoste dall'interfaccia dell'editor della card.

## Editor della card

<img src="../img/rspower/editor.png" width="50%"/>

---

Oltre alle due righe di messaggi, il ReefControl-Power ha tre opzioni:

- **Sonde compatte**: la temperatura è mostrata come un punto del colore del suo
  livello invece di una barra di situazione.
- **Colori delle prese**: il colore di ogni presa, usato dal suo pulsante e dal
  tubo verso il suo dispositivo collegato.
- **Dispositivo collegato**: per presa, il dispositivo collegato ad essa, oppure
  **Nessuno**. **Altro** indica un apparecchio che Home Assistant non conosce.

Le opzioni sono salvate sotto il modello come riportato da Home Assistant:

```yaml
type: custom:reef-card
device: MY-RSPOWER
conf:
  RSPOWER6:
    devices:
      MY-RSPOWER:
        compact_probes: false
        sockets:
          socket_1:
            color: "255,0,0"
            linked_device: 0123456789abcdef0123456789abcdef
          socket_3:
            linked_device: fedcba9876543210fedcba9876543210
```

---

[← Torna alla pagina principale](README.it.md)
