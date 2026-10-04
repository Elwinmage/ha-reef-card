[← Torna alla pagina principale](README.it.md)

# Backup energetico

La card disegna i flussi di energia di [reefbeatEnergyBackup](https://github.com/Elwinmage/reefbeatEnergyBackup): la rete, la batteria, l'acquario e fino a quattro pompe con la loro velocità.

<img src="../img/energybackup/overview.png"/>

Il servizio pubblica i suoi sensori via MQTT: il suo dispositivo (`Reef Battery Backup` per impostazione predefinita) compare nel selettore dei dispositivi della card non appena Home Assistant lo scopre. Non c'è altro da configurare: la card trova da sola i sensori e le pompe.

## Power Flow Card Plus

I flussi sono disegnati da [Power Flow Card Plus](https://github.com/flixlix/power-flow-card-plus), una card separata che va installata (HACS → Frontend). Finché manca, la vista mostra un link che la apre in HACS:

<img src="../img/energybackup/install.png"/>

I flussi sostituiscono quel pannello non appena la card è caricata. La sua configurazione è scritta dalla reef card: non servono YAML `power-flow-card-plus`, sensori template né `config-template-card`.

## La vista

La card è divisa in 5 zone:

1. Titolo e manutenzione
2. Rete
3. Batteria
4. Acquario
5. Pompe

<img src="../img/energybackup/energybackup_zones.png"/>

Un clic su un nodo apre l'entità corrispondente.

## Titolo e manutenzione

<img src="../img/energybackup/zone_1.png"/>

Il nome del dispositivo. L'icona `mdi:wrench-clock` apre le attività di manutenzione del dispositivo (il test di scarica della batteria), come nelle altre viste.

## Rete

<img src="../img/energybackup/zone_2.png"/>

Potenza fornita dal caricatore. Durante un blackout: **Blackout** e la sua durata.

La potenza del caricatore esiste solo con un caricatore Victron. Senza, il nodo rete indica solo se la rete è presente, e il nodo acquario mostra ciò che fornisce la batteria: nulla con la rete, perché il monitor della batteria vede solo la corrente della batteria.

## Batteria

<img src="../img/energybackup/zone_3.png"/>

Potenza di carica o scarica, stato di carica.

## Acquario

<img src="../img/energybackup/zone_4.png"/>

Ciò che consuma l'attrezzatura (rete e batteria insieme), con l'autonomia residua sotto.

## Pompe

<img src="../img/energybackup/zone_5.png"/>

Velocità in %, verso di una pompa di movimento, icona che segue la velocità. Ogni pompa porta il suo nome in Home Assistant; per una pompa ReefRun, il nome dato alla pompa stessa. Il canale di un ReefRun a cui non è collegato nulla non viene mostrato.

Le pompe vengono cercate tra i ReefWave, le pompe ReefRun e le pompe Aqua Medic dell'impianto. Per impostazione predefinita il flusso mostra quelle pilotate dal servizio di backup (ne pubblica l'elenco: una pompa aggiunta o rimossa con `configure.py` segue dopo un riavvio del servizio). Se il servizio non pubblica l'elenco, vengono mostrate le prime pompe che rispondono ancora, prima le pompe di movimento. La card dei flussi disegna al massimo quattro pompe: se sono di più, spuntare quelle da mostrare nell'editor della card.

<img src="../img/energybackup/editor.png"/>

La selezione è salvata con le opzioni del dispositivo, come identificativi di dispositivo di Home Assistant:

```yaml
type: custom:reef-card
device: reef_battery
conf:
  ENERGYBACKUP:
    devices:
      reef_battery:
        pumps:
          - 0a1b2c3d4e5f60718293a4b5c6d7e8f9
          - 9f8e7d6c5b4a39281706f5e4d3c2b1a0
```
