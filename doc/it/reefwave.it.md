[← Torna alla pagina principale](README.it.md)

# ReefWave

ReefWave con ha-reef-card in azione:

[![Guarda il video](https://img.youtube.com/vi/sYVeE0zV3eo/0.jpg)](https://www.youtube.com/watch?v=sYVeE0zV3eo)

Le ReefWave **RSWAVE25** e **RSWAVE45** sono supportate.

<img src="../img/rswave/rswave.png"/>

> [!IMPORTANT]
> Le pompe ReefWave dipendono dal cloud ReefBeat più degli altri
> dispositivi: leggi prima [questo](https://github.com/Elwinmage/ha-reefbeat-component/blob/main/doc/it/reefwave.it.md#reefwave). Con un account cloud
> collegato in ha-reefbeat-component, la card lavora sulla libreria delle
> onde e sui gruppi dell'app ReefBeat, e i due restano sincronizzati. Senza
> account, vedi [Senza account cloud](#senza-account-cloud).

## La vista

La card è divisa in 7 zone:

1. Messaggi
2. Clip di fissaggio
3. Striscia LED
4. Calotta
5. Flusso
6. Gruppo
7. Programma del giorno

<img src="../img/rswave/rswave_zones.png"/>

## Messaggi

<img src="../img/rswave/zone_1.png"/>

Ultimo messaggio e ultimo avviso, in alto.

## Clip di fissaggio

<img src="../img/rswave/zone_2.png"/>

Acceso/spento, manutenzione, impostazioni e Wi-Fi.

## Striscia LED

<img src="../img/rswave/zone_3.png"/>

La modalità della pompa, in bianco chiaro (un tocco
apre le sue informazioni), e sotto il nome della pompa.

## Calotta

<img src="../img/rswave/zone_4.png"/>

La velocità, come anello rosso adattato alla calotta:
l'intensità in avanti dell'onda in corso, dell'anteprima durante
un'anteprima, e 0 quando la pompa non gira (spenta, alimentazione,
manutenzione, nessuna onda). Le frecce all'interno danno la direzione:
→ avanti, ← indietro, entrambe per un'onda alternata. Tocca la calotta per
regolare [questa pompa nell'onda in corso](#questa-pompa-nellonda-in-corso).

## Flusso

<img src="../img/rswave/zone_5.png"/>

Sotto la pompa, acqua animata a quella velocità: verso
sinistra per un'onda in avanti, verso destra per una all'indietro, avanti
e indietro per una alternata. Non viene disegnato nulla a pompa ferma.

## Gruppo

<img src="../img/rswave/zone_6.png"/>

Le pompe del gruppo in una riga, ciascuna con la miniatura e
il nome, nell'ordine del gruppo. La pompa della card è cerchiata; toccane
un'altra per mostrare la sua card. Una pompa che Home Assistant non
raggiunge è in grigio. Per una pompa sola non viene mostrato nulla.

## Programma del giorno

<img src="../img/rswave/zone_7.png"/>

La giornata dalle 00:00 alle 24:00, un blocco
per fascia nel colore del suo tipo di onda: l'intensità in avanti sale
sopra la linea centrale, quella all'indietro scende sotto. Una fascia
«senza onda» è una linea tratteggiata. La legenda dei tipi (pittogramma e
nome) è sotto il grafico, e un cursore rosso segna l'ora corrente. Tocca
il grafico per modificare il programma; il pulsante
**Onde** sopra di esso apre la libreria.

Tipi di onda: Uniforme, Casuale, Regolare,
A gradini, Superficie e Nessuna onda, con i
pittogrammi dell'app ReefBeat.

## Editor del programma

<img src="../img/rswave/program_editor.png"/>

Tocca il programma del giorno: in alto il grafico della bozza, poi una riga
per fascia con inizio, fine, l'onda scelta nella libreria, il suo tipo, la
sua direzione e le intensità di questa pompa. Le fasce si possono aggiungere
e rimuovere; **Salva** scrive il programma, **Annulla**
non cambia nulla.

- Il programma viene scritto su **tutte le pompe del gruppo**, ciascuna con
  le proprie intensità. Quando una pompa del gruppo non è disponibile, il
  salvataggio è bloccato, come nell'app ReefBeat: il gruppo resta
  sincronizzato.
- Il programma inizia alle 00:00, due fasce non possono iniziare alla stessa
  ora, e ogni fascia ha bisogno di un'onda.
- Sotto la nota del gruppo, un pulsante raggruppa la pompa con le ReefWave
  del suo acquario (**Raggruppa con le ReefWave dell'acquario**) oppure la separa
  (**Separa questa pompa**). Per un gruppo, l'ordine delle sue pompe si cambia
  con il trascinamento, oppure con le frecce ‹ ›.
- Sotto la tabella, la zona delle onde mostra la libreria sull'onda della
  fascia corrente; la matita di una riga, o la scelta di un'onda, mostra
  quell'onda.

## Libreria delle onde

<img src="../img/rswave/library.png"/>

Il pulsante **Onde** elenca le onde dell'acquario, come
le conserva l'app ReefBeat: quelle di Red Sea e le tue, ciascuna con le
pompe che la usano. Scegliendo un'onda se ne vedono le impostazioni:

- il suo **tipo**, scelto tra i pittogrammi;
- la sua **forma**: tempi in avanti e all'indietro (min), durata
  dell'impulso (s) e passi, secondo ciò che usa il suo tipo. La forma è
  condivisa da tutte le pompe che usano l'onda;
- le intensità in avanti e all'indietro di **questa pompa**, e se è
  sincronizzata con il gruppo.

Poi **Aggiorna l'onda** scrive l'onda (i programmi che la usano vengono
riscritti), **Crea una nuova onda** chiede un nome e aggiunge una copia con
queste impostazioni, e **Elimina** rimuove un'onda che nessun
programma usa. Un'onda Red Sea può solo essere copiata.

**Anteprima su questa pompa**: scegli la direzione e la durata (da 1 a 10 min), poi
**Anteprima**; la pompa esegue l'onda, poi torna al suo
programma. **Ferma l'anteprima** la interrompe subito.

## Questa pompa nell'onda in corso

<img src="../img/rswave/pump_settings.png"/>

Tocca la calotta per cambiare la direzione e le intensità in avanti /
all'indietro di questa pompa nell'onda in corso. Cambia solo questa pompa:
le altre pompe del gruppo mantengono la loro direzione e le loro intensità,
poiché l'app ReefBeat lascia che ogni pompa di un gruppo esegua un'onda a
modo suo.

## Impostazioni

<img src="../img/rswave/dialog_config.png"/>

L'ingranaggio apre le impostazioni della pompa: l'onda in corso (tipo,
direzione, intensità, tempi, passi), `Ritardo spegnimento collegamento rapido`,
`Raggruppata con l'acquario`, le impostazioni e i pulsanti di anteprima
dell'integrazione, e le azioni del dispositivo (aggiornamento dei dati,
reset, aggiornamento del firmware).

## Senza account cloud

La libreria delle onde e i gruppi vivono nel cloud ReefBeat. Senza un
account cloud collegato alla pompa, vengono proposte solo le onde del
programma corrente, il programma viene scritto sulla pompa stessa, e la
libreria non può essere modificata.

> [!NOTE]
> La vista richiede ha-reefbeat-component con l'attributo `schedule` del
> sensore `wave_type`, il sensore `linked_waves` e i servizi
> `redsea.wave_*`.

---

[← Torna alla pagina principale](README.it.md)
