[← Torna alla pagina principale](README.it.md)

# ReefControl

ReefControl e ReefControl-Power con ha-reef-card in azione:

[![Guarda il video](https://img.youtube.com/vi/VIDEO_ID/0.jpg)](https://www.youtube.com/watch?v=VIDEO_ID)

La card ReefControl disegna l'hub così com'è cablato: le sonde ReefSense appese
alle loro scatole di estensione, le porte a 12V, la pompa ATO quando una porta ne
comanda una, e il [ReefControl-Power](reefcontrol-power.it.md#reefcontrol-power) abbinato sopra.

Entrambi i modelli sono supportati. Il Pro accetta fino a 7 sonde (una seconda
scatola di estensione viene disegnata non appena si collega una quinta sonda) e
ha due porte a 12V; il Lite accetta 2 sonde e ha una sola porta a 12V.

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

Il resto di questa sezione è illustrato con il Pro: tutto funziona allo stesso
modo sul Lite.

<img src="../img/rscontrol/rscontrol_zones.png"/>

La card è divisa in 7 zone:

1. Controller: alimentazione, modalità manutenzione, configurazione, Wifi e cicalino
2. Power Center abbinato (ReefControl-Power)
3. Riepilogo delle letture
4. Sonde
5. Porte a 12V
6. ATO
7. Ultimo messaggio e ultimo allarme

## Controller

<img src="../img/rscontrol/zone_1.png"/>

---

Il testo sul frontale dell'hub è la **modalità di funzionamento** riportata dal
dispositivo (Auto, Setup, Manutenzione…), tradotta nella lingua di Home
Assistant.

<span>L'interruttore <img src="../img/mdi/mdi_power-plug.png" width="20"/> accende o spegne il ReefControl.</span>

<img src="../img/rscontrol/off_mode.png" width="50%"/>

Da spento, l'hub non misura né comanda nulla: la card conserva solo il suo
interruttore e le immagini dell'hardware. Le sonde perdono valori, barre e
impostazioni, e il cicalino, il riepilogo, le porte a 12V e le icone di
configurazione vengono nascosti.

<span>L'interruttore <img src="../img/mdi/mdi_account-wrench.png" width="20"/> passa alla modalità manutenzione.</span>

<img src="../img/rscontrol/maintenance.png" width="50%"/>

<span>Clicca sull'icona <img src="../img/rsdose/cog_icon.png" width="30"/> per gestire la configurazione generale del ReefControl: aggiornare le impostazioni o i dati letti, riavviare il dispositivo, aggiornarne il firmware, regolare la [fusione delle temperature](https://github.com/Elwinmage/ha-reefbeat-component/blob/main/doc/it/reefcontrol.it.md#fusione-della-temperatura-multi-sonda), vedere lo stato della rete e del cavo, e gestire l'abbinamento con un ReefControl-Power.</span>

<img src="../img/rscontrol/zone_1_dialog_config.png" width="50%"/>

<span>Clicca sull'icona <img src="../img/mdi/wifi_icon.png" width="30"/> per gestire le impostazioni di rete.</span>

<img src="../img/rscontrol/zone_1_dialog_wifi.png" width="50%"/>

### Cicalino

<span>La campanella <img src="../img/mdi/mdi_bell-alert.png" width="20"/> si trova sopra il LED di stato dell'hub. È verde mentre il cicalino tace, rossa e lampeggiante mentre suona, e resta rossa una volta silenziato l'allarme.</span>

Un clic apre la finestra del cicalino: cosa sta facendo ora e perché, poi i suoi
due allarmi — l'allarme di **pericolo** (una lettura fuori dal suo intervallo) e
l'allarme di **perdita** —, ciascuno con il suo interruttore, la sua frequenza e
il suo ciclo di lavoro, l'antirimbalzo del pericolo e il rilevatore di perdite.

<img src="../img/rscontrol/zone_1_dialog_buzzer.png" width="50%"/>

## Power Center abbinato

<img src="../img/rscontrol/zone_2.png"/>

---

Quando un ReefControl-Power è abbinato all'hub, viene disegnato sopra di esso,
con 6 o 8 prese secondo il modello, collegato all'hub dal suo cavo. Una presa
alimentata si illumina con una leggera maschera rossa.

Un clic sul Power Center apre la sua card (vedi
[ReefControl-Power](reefcontrol-power.it.md#reefcontrol-power)).

Quando il Power Center è abbinato ma non risponde, lampeggia sotto una leggera
tinta rossa. L'abbinamento e il disabbinamento si fanno dalla finestra di
configurazione del controller.

## Riepilogo

<img src="../img/rscontrol/zone_3.png"/>

---

La barra tra il Power Center e le sonde riassume tutte le letture dell'hub, da
sinistra a destra:

- Un avviso <img src="../img/mdi/mdi_alert.png" width="20"/>, solo quando qualcosa non va: arancione quando la lettura peggiore è accettabile, rosso quando una è in pericolo. Contano anche le temperature integrate.
- La **temperatura**: il valore fuso quando l'hub ha più fonti di temperatura, altrimenti quella della sonda di temperatura, altrimenti la prima temperatura integrata.
- <span>Un termometro <img src="../img/mdi/mdi_thermometer-alert.png" width="20"/>, solo quando l'hub sospetta una delle sue fonti di temperatura; il suo suggerimento indica la sonda in questione.</span>
- Il pH, l'ORP e la salinità, una voce per sonda.
- <span>Una goccia <img src="../img/mdi/mdi_water-alert.png" width="20"/> per sonda di perdita, rossa quando è bagnata.</span>
- <span>Onde <img src="../img/mdi/mdi_waves.png" width="20"/> per sonda ATO, verdi a un livello desiderato, arancioni sotto o sopra.</span>

Ogni lettura prende il colore del suo livello: verde per desiderato, arancione
per accettabile, rosso per pericolo, bianco quando la sonda non fornisce una
lettura valida. Un clic su una lettura apre la sua finestra di informazioni.

## Sonde

<img src="../img/rscontrol/zone_4.png"/>

---

Ogni sonda dell'hub pende da una scatola di estensione, nell'ordine in cui l'hub
le elenca. Ognuna mostra:

- La sua **lettura**, e la **temperatura integrata** subito sotto per le sonde di
  pH, salinità e ATO, colorate secondo il loro livello. Un clic su un valore apre
  la sua finestra di informazioni.
- Una **barra di situazione** per lettura: le bande rossa, arancione e verde sono
  gli intervalli di pericolo, accettabile e desiderato impostati sulla sonda, e
  il segno nero indica dove si trova la lettura. La lettura principale è sulla
  barra sinistra, la temperatura su quella destra. Un clic su una barra apre le
  ultime 24 ore della lettura sopra le sue bande.

<img src="../img/rscontrol/zone_4_history.png" width="50%"/>

- <span>Un ingranaggio <img src="../img/rsdose/cog_icon.png" width="30"/> che apre le impostazioni della sonda.</span>

Una sonda scollegata lampeggia sotto una leggera tinta rossa e non fornisce
alcuna lettura.

### Impostazioni della sonda

<img src="../img/rscontrol/zone_4_dialog_probe.png" width="50%"/>

La finestra raccoglie tutto di una sonda: le sue letture, il suo stato, i suoi
intervalli desiderato e accettabile (e quelli della sua temperatura integrata),
l'unità di visualizzazione di una sonda di salinità, e i suoi interruttori —
attivata, cicalino, notifiche e manutenzione, che tiene la sonda fuori dalla
fusione delle temperature mentre viene pulita o calibrata.

Su una sonda di salinità, i limiti mostrati sono quelli dell'unità di visualizzazione scelta: cambiate unità e la finestra passa subito ai suoi limiti.

Il pulsante **Leggi valore** chiede all'hub una nuova lettura invece di
attendere la lettura successiva; i valori della finestra si aggiornano sul posto.

I pulsanti di calibrazione in basso mostrano solo le calibrazioni del tipo della
sonda, e nessuna mentre è scollegata. Ogni calibrazione apre la propria finestra,
descritta qui sotto per tipo di sonda.

### Tipi di sonde

#### pH

<img src="../../src/img/redsea/RSSENSE/rssense-ph-temperature.png" width="10%"/> <img src="../../src/img/redsea/RSSENSE/rssense-ph.png" width="10%"/>

La lettura del pH, e la temperatura quando la sonda ne ha una — una sonda di pH
senza temperatura ha la sua immagine, con una sola barra.

La calibrazione si fa in due punti, come nell'app ReefBeat: prima pH 7, poi pH
10 per l'acqua salata o pH 4 per l'acqua dolce, ogni soluzione indicata con la
temperatura a cui è riferita. Dopo ogni punto, l'hub attende che la lettura si
stabilizzi: la finestra mostra la stabilità e il tempo rimanente, e il passo
successivo si sblocca solo quando l'hub ha finito. Chiudere la finestra annulla
la calibrazione.

<img src="../img/rscontrol/zone_4_calibration_ph.png" width="50%"/>

#### Salinità

<img src="../../src/img/redsea/RSSENSE/rssense-salinity-temperature.png" width="10%"/>

La salinità, nell'unità scelta nelle impostazioni della sonda, e la temperatura.

La calibrazione si fa in un solo punto: immergi la sonda nella soluzione e
inserisci il suo valore in mS/cm (tra 20 e 99).

<img src="../img/rscontrol/zone_4_calibration_ec.png" width="50%"/>

#### ORP

<img src="../../src/img/redsea/RSSENSE/rssense-orp.png" width="10%"/>

L'ORP in mV. Per calibrarlo, immergi la sonda nella soluzione di riferimento e
inserisci il valore della soluzione: la sonda legge quindi quel valore.

<img src="../img/rscontrol/zone_4_calibration_orp.png" width="50%"/>

#### Temperatura

<img src="../../src/img/redsea/RSSENSE/temperature.png" width="10%"/>

La temperatura, su una sola barra. Per calibrarla, metti la sonda in acqua la
cui temperatura hai misurato con un termometro di riferimento, attendi che la
lettura si stabilizzi e inserisci la temperatura reale.

La temperatura integrata delle sonde di pH, salinità e ATO si calibra allo stesso
modo, dal suo pulsante **Calibra la temperatura**.

<img src="../img/rscontrol/zone_4_calibration_temperature.png" width="50%"/>

#### ATO

<img src="../../src/img/redsea/RSSENSE/rssense-ato.png" width="10%"/>

La sonda di livello è disegnata nell'acqua della sump, al segno riportato dalla
sonda, come sul [ReefATO+](reefato.it.md#acquario). La sua temperatura è mostrata sul corpo
nero, subito sotto il connettore.

| Stato                | Significato                                              |
| -------------------- | -------------------------------------------------------- |
| Sotto                | La superficie è sotto la sonda: l'ATO non tiene il passo |
| Livello desiderato 1 | Primo segno di rabbocco                                  |
| Livello desiderato 2 | Secondo segno di rabbocco                                |
| Sopra                | La superficie è sopra la sonda: l'acquario è pieno       |

**Sotto** e **Sopra** fanno lampeggiare l'acqua. Una sonda in errore non ha la
linea dell'acqua.

#### Perdita

<img src="../../src/img/redsea/RSSENSE/rssense-leak.png" width="10%"/>

Quando viene rilevata acqua, una pozza si allarga ai piedi della sonda, e
un'icona lampeggiante indica da dove proviene l'acqua, come riportato dalla
sonda:

<table>
  <tr>
    <th align="center">Perdita d'acqua dell'acquario <img src="../img/mdi/mdi_fish.png" width="20"/></th>
    <th align="center">Perdita d'acqua osmotica <img src="../img/mdi/mdi_cup-water.png" width="20"/></th>
  </tr>
  <tr>
    <td align="center"><img src="../img/rscontrol/zone_4_leak_aquarium.png"/></td>
    <td align="center"><img src="../img/rscontrol/zone_4_leak_rodi.png"/></td>
  </tr>
</table>

Una sonda di perdita con il rilevamento disattivato appare in grigio: è
presente, ma non rileva nulla.

> [!NOTE]
> Le sonde si aggiungono, si sostituiscono e si rimuovono dal menu delle opzioni
> dell'integrazione (vedi [ha-reefbeat-component](https://github.com/Elwinmage/ha-reefbeat-component/blob/main/doc/it/reefcontrol.it.md#gestione-delle-sonde-aggiungi--sostituisci--rimuovi)):
> la card si adatta da sola.

## Porte a 12V

<img src="../img/rscontrol/zone_5.png"/>

---

Ogni porta a 12V dell'hub ha il suo ingranaggio sopra il connettore, e il suo
consumo sopra di esso (un clic apre la sua finestra di informazioni). Una porta
alimentata illumina il suo connettore. Il Pro ha due porte, con l'ingranaggio
della seconda disegnato in modo diverso; il Lite ne ha una.

<span>Un clic sull'ingranaggio <img src="../img/mdi/cog-1.png" width="5%"/> apre le impostazioni della porta: nome, interruttore, stato, tipo e consumo, poi l'editor della modalità.</span>

<img src="../img/rscontrol/zone_5_dialog_port.png" width="50%"/>

Una porta si comanda come una [presa del Power Center](reefcontrol-power.it.md#presa), con le stesse
quattro modalità — **Acceso**, **Spento**, **Pianificazione** e **Sensore** —
più la **potenza** che fornisce quando è accesa, in %. Nulla viene inviato
all'hub finché non premi **Salva**. Una porta mai installata viene installata al
salvataggio, come fa l'app ReefBeat.

<span>L'icona del cestino <img src="../img/mdi/mdi_delete-empty.png" width="20"/> in alto a destra disinstalla la porta, dopo una conferma: torna allo stato di fabbrica e perde il nome, la pianificazione e la regola di sonda.</span>

<img src="../img/rscontrol/zone_5_dialog_delete.png" width="50%"/>

## ATO

<img src="../img/rscontrol/zone_6.png"/>

---

Quando una porta a 12V comanda una pompa ATO — il kit ATO di Red Sea, o
qualsiasi pompa che segue una sonda ATO —, la pompa è disegnata nel suo
serbatoio, collegata alla sua porta. Mentre la porta è alimentata, l'acqua
scorre dall'uscita sopra la sump.

## Messaggi

<img src="../img/rscontrol/zone_7.png"/>

---

Questa zona mostra gli ultimi messaggi di sistema del ReefControl. Ha due righe:

- La riga grigia mostra l'**ultimo messaggio** ricevuto.
- La riga rosa mostra l'**ultimo allarme**, preceduto dal simbolo ⚠.

Cliccando sull'icona <img src="../img/mdi/mdi_delete-empty.png" width="20"/> si cancella il messaggio corrispondente.

Queste righe possono essere nascoste dall'interfaccia dell'editor della card.

## Editor della card

<img src="../img/rscontrol/editor.png" width="50%"/>

---

Oltre alle due righe di messaggi, il ReefControl ha due opzioni:

- **Sonde compatte**: ogni lettura è mostrata come un punto del colore del suo
  livello invece di una barra di situazione. Un segno nel punto indica da quale
  lato dell'intervallo desiderato si trova la lettura. Un clic sul punto apre le
  sue ultime 24 ore, come la barra.
- **Posizione delle sonde**: le sonde sono disposte nell'ordine in cui l'hub le
  elenca. Una sonda può essere fissata a una posizione delle scatole di
  estensione, perché la card corrisponda al collegamento reale delle sonde.
  **Auto** la riporta all'ordine dell'hub.

---

[← Torna alla pagina principale](README.it.md)
