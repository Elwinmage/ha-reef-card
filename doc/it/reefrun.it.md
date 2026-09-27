[← Torna alla pagina principale](README.it.md)

# ReefRun

ReefRun con ha-reef-card in azione:

[![Guarda il video](https://img.youtube.com/vi/Xxv38OPqiGI/0.jpg)](https://www.youtube.com/watch?v=Xxv38OPqiGI)

La card ReefRun mostra il controller e le sue due pompe così come sono
fisicamente collegate, ciascuna con il proprio cavo e le proprie tubazioni. La
pompa 1 è quella di sinistra, la pompa 2 quella di destra — di solito la pompa
di risalita e il DC Skimmer, ma ogni presa accetta entrambi i modelli.

<img src="../img/rsrun/rsrun_zones.png"/>

La card è divisa in 6 zone:

1. Stato di alimentazione e modalità manutenzione
2. Informazioni batteria e Wifi
3. Controller: modalità di funzionamento, pulsanti delle pompe e calibrazioni
4. Pompa 1: programmazione giornaliera, corpo con flusso d'acqua in tempo reale, temperatura
5. Pompa 2: programmazione giornaliera, corpo con flusso d'acqua in tempo reale, temperatura
6. Ultimo messaggio e ultimo allarme

## Stato di alimentazione e modalità manutenzione

<img src="../img/rsrun/zone_1.png" >

<span>L'interruttore di manutenzione <img src="../img/mdi/mdi_account-wrench.png" width="20"/> attiva la modalità manutenzione.</span>

<img src="../img/rsrun/maintenance.png" >

<span>L'interruttore acceso/spento <img src="../img/mdi/mdi_power-plug.png" width="20"/> accende e spegne il Reef Dual Controller.</span>

<img src="../img/rsrun/off_mode.png" >

## Informazioni batteria e Wifi

<img src="../img/rsrun/zone_2.png"/>

---

<span>Questa icona <img src="../img/mdi/battery.png" width="30" /> indica il livello di batteria del Dual Controller.</span>

<span>Clicca sull'icona <img src="../img/mdi/wifi_icon.png" width="30" /> per gestire le impostazioni di rete.</span>

<img src="../img/rsrun/zone_2_dialog_wifi.png"/>

## Controller: modalità di funzionamento, pulsanti delle pompe e calibrazioni

<img src="../img/rsrun/zone_3.png"/>

### Impostazioni delle pompe

Un clic su <img src="../img/mdi/cog-1.png" width="5%"/> o <img src="../img/mdi/cog-2.png" width="5%"/> apre la finestra di configurazione della pompa 1 o 2.

<img src="../img/rsrun/zone_3_return_pump.png"/>
<img src="../img/rsrun/zone_3_skimmer.png"/>

> [!CAUTION]
> **Eliminare la pompa** riporta le sue impostazioni ai valori di fabbrica: la
> programmazione e il controllo tramite sonda vengono persi. Viene sempre
> chiesta una conferma.

### Impostazioni della sonda

Un clic su <img src="../img/mdi/cog-s.png" width="5%"/> apre la finestra di configurazione della sonda.
<img src="../img/rsrun/zone_3_sensor.png"/>

### Play/pausa di una pompa <img src="../img/mdi/play.png" width="5%"/> / <img src="../img/mdi/pause.png" width="5%"/>

Un clic accende o spegne la singola pompa.

L'anello rosso indica la velocità attuale.
<img src="../img/rsrun/speed.png"/>

Per modificare la velocità attuale tieni premuto <img src="../img/mdi/play.png" width="5%"/> / <img src="../img/mdi/pause.png" width="5%"/> oppure clicca sulla programmazione:

<img src="../img/rsrun/schedule.png"/>

## Stati di una pompa

Il corpo della pompa riflette ciò che l'apparecchio sta davvero facendo, basta
un'occhiata. I due tipi di pompa non hanno gli stessi stati, quindi sono
descritti separatamente.

## Pompe 1 e 2

### Pompa di risalita

<img src="../../src/img/redsea/RSRUN/reefrun_return.png" width="30%"/>

Una sola illustrazione copre tutti gli stati, la card cambia soltanto il modo di
disegnarla:

- **In funzione** — colori pieni, acqua animata alla velocità attuale.
- **Ferma** — la stessa illustrazione in grigio, nessun flusso.
- **Scollegata** — lo stesso grigio, più il cavo di alimentazione lampeggiante.

### Schiumatoio

Tre illustrazioni distinte, una per stato del bicchiere:

<table>
  <tr>
    <td align="center"><img src="../../src/img/redsea/RSRUN/reefrun_skimmer_on.png" width="100%"/><br/><b>In funzione</b><br/>Schiuma nel bicchiere, bolle che salgono, acqua animata</td>
    <td align="center"><img src="../../src/img/redsea/RSRUN/reefrun_skimmer_full.png" width="100%"/><br/><b>Bicchiere pieno</b><br/>Schiuma ridotta a una banda sotto il coperchio</td>
    <td align="center"><img src="../../src/img/redsea/RSRUN/reefrun_skimmer_off.png" width="100%"/><br/><b>Fermo</b><br/>Bicchiere vuoto, in grigio, nessuna bolla</td>
  </tr>
</table>

Uno schiumatoio scollegato è identico a uno fermo: solo il cavo lampeggiante li
distingue. Quel lampeggio significa che il ReefRun segnala `missing_pump`,
quindi la pompa è configurata ma il controller non la vede più. Controlla la
spina prima di cercare altrove.

Lo stato di bicchiere pieno è segnalato dal sensore di schiuma nella camera di
raccolta. Il corpo passa alla propria illustrazione e l'animazione della schiuma
si riduce a una banda sottile sotto il coperchio, che l'autoregolazione sia
attiva o meno. L'icona di avviso lampeggiante accanto all'interruttore bicchiere
pieno compare solo se `sensor_controlled` è attivo, perché con il sensore
disattivato il controller non interviene.

### Aggiungere una pompa

Una presa senza pompa configurata mostra un segnaposto di **aggiunta** al posto
del corpo pompa:

<img src="../../src/img/redsea/RSRUN/add_pump.png" width="20%"/>

Un clic apre la finestra di configurazione, dove **Rileva e aggiungi** chiede al
controller cosa è collegato e lo registra in un solo passaggio. Il modello
rilevato è solo un suggerimento e a volte sbaglia, perciò l'elenco dei modelli
resta modificabile: per un DC Skimmer scegli rsk-300, rsk-600 o rsk-900. Il nome
della pompa si modifica nella stessa finestra.

Il segnaposto è presente su ogni presa non configurata, quindi compare anche su
una presa che non intendi usare. Chi ha una sola pompa può nasconderlo del tutto
dall'editor della card.

<img src="../img/rsrun/editor.png"/>

### Programmazione

<img src="../img/rsrun/schedule.png"/>

La curva blu è la velocità programmata sulle 24 ore. La linea rossa verticale
segna l'ora corrente e il punto su di essa la velocità richiesta dalla
programmazione.

Quando la pompa non segue la programmazione — modalità alimentazione,
rilevamento di bicchiere pieno, protezione dalla sovraschiumazione — il punto si
sposta sulla velocità **reale** e un segmento rosso materializza lo scarto, con
il valore accanto:

<img src="../img/rsrun/schedule_deviation.png"/>

Un clic sul grafico apre l'editor della programmazione: aggiungere o rimuovere punti, modificare orari e velocità, provare un punto sull'apparecchio e salvare.

<img src="../img/rsrun/schedule_editor.png"/>

## Messaggi

<img src="../img/rsrun/zone_6.png"/>

---

Questa zona mostra gli ultimi messaggi di sistema del ReefRun. Ha due righe:

- La riga grigia mostra l'**ultimo messaggio** ricevuto.
- La riga rosa mostra l'**ultimo allarme**, preceduto dal simbolo ⚠.

Un clic sull'icona <img src="../img/mdi/mdi_delete-empty.png" width="20"/> cancella il messaggio corrispondente.

Queste righe possono essere nascoste dall'editor della card.

<img src="../img/rsrun/editor_2.png" />

---

[← Torna alla pagina principale](README.it.md)
