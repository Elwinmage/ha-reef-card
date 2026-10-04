[← Torna alla pagina principale](README.it.md)

# ReefATO

ReefATO+ con ha-reef-card in azione:

[![Guarda il video](https://img.youtube.com/vi/2R0DHp2eqT4/0.jpg)](https://www.youtube.com/watch?v=2R0DHp2eqT4)

La card ReefATO+ permette di gestire visivamente il controller RSATO+, il
serbatoio di acqua osmotica con la sua pompa, la sonda di livello agganciata alla
vasca e la sonda di perdita appoggiata a terra.

La sonda di livello del ReefATO+ è sempre disegnata. La **pompa** e la **sonda di
perdita** sono opzionali. Quella che il dispositivo non segnala non viene
disegnata affatto, e i comandi che ne dipendono spariscono con lei: un ReefATO+
senza sonda di perdita mostra una card senza sonda di perdita, non una sonda in
grigio.

<img src="../img/rsato/rsato_zones.png"/>

La card è divisa in 7 zone:

1. Controller: modalità di funzionamento, accensione, modalità manutenzione, configurazione, Wifi e rabbocco automatico
2. Impostazioni degli accessori: pompa di rabbocco, sonda di perdita, sonda di livello
3. Serbatoio di acqua osmotica: comandi di riempimento, volume rimanente e autonomia
4. Cicalino
5. Sonda di perdita
6. Acquario: livello dell'acqua, temperatura e consumo giornaliero
7. Ultimo messaggio e ultimo allarme

## Controller

<img src="../img/rsato/zone_1.png"/>

---

Il testo sul frontale del controller è la **modalità di funzionamento** riportata
dal dispositivo (Auto, Manuale, Perdita…), tradotta nella lingua di Home
Assistant.

<span>L'interruttore <img src="../img/mdi/mdi_power-plug.png" width="20"/> accende o spegne il ReefATO+.</span>

<img src="../img/rsato/off_mode.png" width="50%"/>

<span>L'interruttore <img src="../img/mdi/mdi_account-wrench.png" width="20"/> passa alla modalità manutenzione.</span>

<img src="../img/rsato/maintenance.png" width="50%"/>

<span>Cliccare sull'icona <img src="../img/rsdose/cog_icon.png" width="30"/> per gestire la configurazione generale del ReefATO+: aggiornare le impostazioni o i dati interrogati, resettare il dispositivo, aggiornarne il firmware.</span>

<img src="../img/rsato/zone_1_dialog_config.png" width="50%"/>

<span>Cliccare sull'icona <img src="../img/mdi/wifi_icon.png" width="30"/> per gestire le impostazioni di rete.</span>

<img src="../img/rsato/zone_1_dialog_wifi.png" width="50%"/>

<span>L'interruttore <img src="../img/mdi/mdi_waves-arrow-up.png" width="20"/> della seconda riga abilita o disabilita il **rabbocco automatico**. Disattivato, il dispositivo non riempie mai da solo e agiscono sulla pompa solo i pulsanti della zona 3. È nascosto quando non è associata alcuna pompa.</span>

## Impostazioni degli accessori

<img src="../img/rsato/zone_2.png"/>

---

Le tre icone seguono le tre prese del pannello frontale, nello stesso ordine: da
sinistra a destra la **pompa di rabbocco**, la **sonda di perdita** e la **sonda
di livello**. Ognuna apre una finestra dedicata a quell'accessorio. Le icone
della pompa e della sonda di perdita spariscono insieme all'accessorio quando la
loro presa non è usata.

<span>L'icona della pompa <img src="../img/mdi/mdi_pump.png" width="30"/> mostra lo stato di funzionamento, il consumo e la portata misurati, le tre soglie di corrente con cui il firmware decide se c'è funzionamento a secco o blocco, e che cosa ha innescato l'ultimo riempimento.</span>

<img src="../img/rsato/zone_2_dialog_pump.png" width="50%"/>

<span>L'icona della sonda di perdita <img src="../img/mdi/mdi_pipe-leak.png" width="30"/> mostra se la sonda è collegata, se è armata, il verdetto asciutto/bagnato e la lettura grezza che c'è dietro, oltre al cicalino che questa sonda comanda.</span>

<img src="../img/rsato/zone_2_dialog_leak.png" width="50%"/>

<span>L'icona della sonda di livello <img src="../img/mdi/mdi_hydraulic-oil-level.png" width="30"/> mostra prima lo stato di salute della sonda — collegata, calibrata, da verificare, in errore — perché una sonda non calibrata o sporca rende prive di valore tutte le letture successive. Poi il livello stesso, i due elettrodi che lo determinano, il sensore di temperatura che condivide lo stesso corpo, e l'identità e le date di servizio della cartuccia.</span>

<img src="../img/rsato/zone_2_dialog_ato_sensor.png" width="50%"/>

## Serbatoio di acqua osmotica

<img src="../img/rsato/zone_3.png"/>

---

Questa zona è il serbatoio da cui attinge il rabbocco, e i tre pulsanti che
comandano la sua pompa a mano:

<table>
  <tr>
    <td align="center"><img src="../img/mdi/mdi_water-pump.png" width="40"/><br/><b>Riempi</b><br/>Avvia un riempimento manuale</td>
    <td align="center"><img src="../img/mdi/mdi_water-pump-off.png" width="40"/><br/><b>Ferma</b><br/>Ferma il riempimento in corso</td>
    <td align="center"><img src="../img/mdi/mdi_play-circle-outline.png" width="40"/><br/><b>Riprendi</b><br/>Riattiva la pompa</td>
  </tr>
</table>

Questa parte mostra il livello della riserva d'acqua, calcolato dalla capacità
dichiarata del serbatoio e dal valore reale. Un serbatoio vuoto mostra comunque
una linea d'acqua: quella che la pompa non riesce ad aspirare. Sotto il 10 %
l'acqua lampeggia, per dire che il serbatoio sarà presto vuoto.

Cliccare sull'acqua apre la finestra del serbatoio, dove si può modificare la
capacità:

<img src="../img/rsato/zone_3_dialog_ato_tank.png" width="50%"/>

Il numero in basso a sinistra del serbatoio è l'**autonomia**: i giorni che
mancano prima che si svuoti, calcolati dall'integrazione a partire dal consumo
giornaliero medio. Cliccandolo si apre la sua scheda informativa.

Durante un riempimento l'acqua esce dall'uscita sopra la sump.

<img src="../img/rsato/zone_3_filling.png"/>

## Cicalino

<img src="../img/mdi/mdi_bell-ring_red.png" width="40"/>

---

<span>La campanella <img src="../img/mdi/mdi_bell-ring_red.png" width="20"/> <img src="../img/mdi/mdi_bell-off_red.png" width="20"/> segue l'impostazione del cicalino del dispositivo, e si spegne in grigio quando è disattivato.</span>

Un clic apre la finestra del cicalino: l'impostazione stessa, se sta suonando in
questo momento, e lo stato della sonda di perdita come contesto.

<img src="../img/rsato/zone_4_dialog_buzzer.png" width="50%"/>

Una **pressione lunga** commuta direttamente il cicalino. I due gesti sono
deliberatamente separati: silenziare l'allarme è un'impostazione di sicurezza,
non qualcosa da fare per sbaglio mentre si cercano i dettagli.

> [!NOTE]
> Il cicalino non è solo l'allarme di perdita: il dispositivo lo fa suonare anche
> sui guasti della pompa, quindi resta disponibile su un ReefATO+ senza sonda di
> perdita. L'icona è nascosta solo sulle versioni dell'integrazione che non
> espongono ancora l'impostazione.

## Sonda di perdita

<img src="../img/rsato/zone_5.png"/>

---

La sonda è disegnata solo quando è fisicamente collegata. Collegata ma disattivata
nell'app, appare in grigio: c'è, ma non rileva nulla.

Quando viene rilevata acqua, la sonda lampeggia e una pozza si allarga ai piedi
dell'immagine.

<table>
  <tr>
    <th align="center">Perdita in acquario</th>
    <th align="center">Perdita sul serbatoio osmotico</th>
    <th align="center">Perdita di origine sconosciuta</th>
  </tr>
  <tr>
    <td align="center"><img src="../img/rsato/zone_5_leak_aquarium.png"/></td>
    <td align="center"><img src="../img/rsato/zone_5_leak_rodi.png"/></td>
    <td align="center"><img src="../img/rsato/zone_5_leak_unknown.png"/></td>
  </tr>
</table>

## Acquario

<img src="../img/rsato/zone_6.png"/>

---

Il livello dell'acqua in questa parte indica lo stato di rilevamento della sonda
ATO.

| Stato            | Significato                                                  |
| ---------------- | ------------------------------------------------------------ |
| Sotto            | La superficie è sotto la sonda: il rabbocco non sta al passo |
| Livello voluto 1 | Prima tacca di rabbocco                                      |
| Livello voluto 2 | Seconda tacca di rabbocco                                    |
| Sopra            | La superficie è sopra la sonda: la vasca è troppo piena      |

Entrambi gli estremi sono anomali, quindi **Sotto** e **Sopra** fanno lampeggiare
l'acqua. Una sonda in errore, o un'entità che non ha ancora riportato nulla, non
ha alcuna altezza: la card disegna il suo segno di lettura assente invece di una
vasca vuota.

<table>
  <tr>
    <th align="center">Sotto</th>
    <th align="center">Livello voluto 1</th>
    <th align="center">Livello voluto 2</th>
    <th align="center">Sopra</th>
    <th align="center">Nessuna lettura</th>
  </tr>
  <tr>
    <td align="center"><img src="../img/rsato/zone_6_water_level_below.png"/></td>
    <td align="center"><img src="../img/rsato/zone_6_water_level_1.png"/></td>
    <td align="center"><img src="../img/rsato/zone_6_water_level_2.png"/></td>
    <td align="center"><img src="../img/rsato/zone_6_water_level_above.png"/></td>
    <td align="center"><img src="../img/rsato/zone_6_water_level_error.png"/></td>
  </tr>
</table>

La temperatura in basso nella vasca viene dal sensore integrato nella sonda di
livello, ed è riportata solo quando è abilitato sul dispositivo.

Il grafico nell'angolo è il **consumo del giorno**: il volume rabboccato da
mezzanotte, riempito in arancione, contro la media giornaliera mobile in rosso.
La finestra è ancorata al giorno di calendario e non a 24 ore mobili, dato che il
contatore si azzera a mezzanotte.

Cliccare sul grafico apre la finestra dei consumi, la stessa storia con i numeri
scritti per esteso: riempimenti e volume, misurati oggi, come media giornaliera e
come totale complessivo, oltre a quanto resta nel serbatoio per alimentarli.

<img src="../img/rsato/zone_6_dialog_usage.png" width="50%"/>

## Guasti

La card non ha una spia di avviso separata: ciò che è in guasto è ciò che
lampeggia, sotto una tinta rossa chiara.

| Elemento che lampeggia | Ciò che il dispositivo riporta                                                                                            |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| La pompa               | Malfunzionamento, pompa bloccata, riempimento troppo lungo, serbatoio vuoto, o sonda di livello assente                   |
| La sonda di perdita    | Acqua rilevata, dal lato osmosi o dal lato acquario                                                                       |
| Il livello dell'acqua  | La superficie è sotto o sopra la sonda                                                                                    |
| Tutta l'immagine       | La sonda di livello chiede di essere verificata, o non riesce più a misurare — ogni livello mostrato diventa inaffidabile |

Una pompa segnalata come assente non è un guasto: la pompa, i pulsanti di
riempimento, il serbatoio e il grafico dei consumi semplicemente non vengono
disegnati.

## Messaggi

<img src="../img/rsato/zone_7.png"/>

---

Questa zona mostra gli ultimi messaggi di sistema del ReefATO+. Ha due righe:

- La riga grigia mostra l'**ultimo messaggio** ricevuto.
- La riga rosa mostra l'**ultimo allarme**, preceduto dal simbolo ⚠.

Cliccando sull'icona <img src="../img/mdi/mdi_delete-empty.png" width="20"/> si cancella il messaggio corrispondente.

Queste righe possono essere nascoste dall'interfaccia dell'editor della card.

## Editor della card

<img src="../img/rsato/editor.png" width="50%"/>

---

Oltre alle due righe di messaggi, il ReefATO+ ha tre opzioni. Esistono per un
circuito di rabbocco per cui il dispositivo non è stato progettato: un impianto a
osmosi collegato direttamente alla sump, con una valvola comandata da Home
Assistant invece che dalla pompa Red Sea.

### Serbatoio osmotico infinito

Disattivata di default. Un impianto a osmosi che rabbocca al volo non ha
contenitore, quindi non c'è nulla che possa esaurirsi — e tutto ciò che la card
dice del serbatoio parla di una tanica che non esiste.

Attivata, la percentuale sul serbatoio e la finestra che c'è dietro vengono tolte,
l'autonomia diventa ∞, e l'icona delle impostazioni della pompa e il pulsante di
ripresa vengono nascosti: un'alimentazione continua non ha un ciclo di riempimento
da restituire al dispositivo. L'acqua, i pulsanti di riempimento e il grafico dei
consumi restano.

### Entità del volume erogato

Un interruttore e un selettore di entità. Attivata, la curva arancione del
grafico giornaliero viene letta da una vostra entità — un flussimetro sulla linea
osmotica — invece che dal contatore del dispositivo. La media mobile rossa resta
quella del dispositivo: si sposta solo l'origine del volume, non il confronto
contro cui è disegnato.

È l'interruttore ad abilitarla, così un'entità rimasta da una configurazione
precedente viene ignorata invece di riprendere il comando in silenzio.

### Entità di riempimento e di arresto

Ciascuno dei due pulsanti può essere collegato a un'entità di un'altra
integrazione, per comandare la propria valvola. Il servizio è dedotto dal dominio
dell'entità, dato che sceglierne una dice già di quale si tratta:

| Dominio dell'entità       | Riempi       | Ferma         |
| ------------------------- | ------------ | ------------- |
| `button`, `input_button`  | `press`      | `press`       |
| `switch`, `input_boolean` | `turn_on`    | `turn_off`    |
| `valve`                   | `open_valve` | `close_valve` |
| `script`                  | `turn_on`    | `turn_on`     |

Un solo interruttore è un comando completo: acceso riempie, spento ferma. Lasciate
vuoto l'altro selettore e il secondo pulsante riusa la stessa entità con il
servizio opposto — lo stesso vale per un `input_boolean` o una `valve`. Due
pulsanti a impulso vanno scelti separatamente, perché una pressione non porta una
direzione.

Un comando collegato non segue più nemmeno la pompa Red Sea: resta visibile su un
ReefATO+ che non segnala alcuna pompa, che è poi il motivo per cui lo si collega.

Le opzioni sono salvate sotto il modello così come Home Assistant lo riporta:

```yaml
type: custom:reef-card
device: "123456789012" # identificativo stabile del dispositivo (funziona anche il nome)
conf:
  RSATO+:
    devices:
      "123456789012":
        name: MY-RSATO # solo etichetta
        infinite_tank: true
        external_usage: true
        external_usage_entity: sensor.rodi_flow_meter
        fill_entity: switch.rodi_valve
        stop_fill_entity: "" # lasciato vuoto: lo ferma l'interruttore qui sopra
```

---

[← Torna alla pagina principale](README.it.md)
