[← Torna alla pagina principale](README.it.md)

# Aqua Medic

Aqua Medic con ha-reef-card in azione:

[![Guarda il video](https://img.youtube.com/vi/9Gh4YE6Ck9g/0.jpg)](https://www.youtube.com/watch?v=9Gh4YE6Ck9g)

Viste per le pompe di [ha-aquamedic-component](https://github.com/Elwinmage/ha-aquamedic-component):

| Dispositivo                                | Vista della card       |
| ------------------------------------------ | ---------------------- |
| EcoDrift / SmartDrift (pompa di movimento) | `aquamedic-smartdrift` |
| DC Runner (pompa di risalita)              | `aquamedic-dcrunner`   |
| DC Runner (pompa dello schiumatoio)        | `aquamedic-dcskimmer`  |

<p align="center">
<img src="../img/aquamedic/smartdrift.png" width="30%"/>
<img src="../img/aquamedic/dcrunner.png" width="30%"/>
<img src="../img/aquamedic/dcskimmer.png" width="30%"/>
</p>

La pompa di risalita e la pompa dello schiumatoio sono lo stesso hardware:
la card mostra un selettore di ruolo finché la selezione **Ruolo della
pompa** dell'integrazione non è impostata, poi passa da sola alla vista
corrispondente.

<img src="../img/aquamedic/role_picker.png"/>

## Cosa mostra la vista

La card è divisa in 4 zone:

1. Fascia superiore
2. Guasti
3. Velocità
4. Programma a fasce

<img src="../img/aquamedic/aquamedic_zones.png"/>

## Fascia superiore

<img src="../img/aquamedic/zone_1.png"/>

Accensione, pausa alimentazione, timer e controllo
0-10V, ciascuno commutabile con un clic; l'ingranaggio apre le
impostazioni (tutte le entità della pompa, il suo ruolo e i suoi sensori
di guasto). Una SmartDrift aggiunge l'interruttore impulso / marea e la
sua modalità onda (clic: maggiori informazioni).

## Guasti

<img src="../img/aquamedic/zone_2.png"/>

Una riga lampeggiante nomina i guasti segnalati dalla pompa
(funzionamento a secco, rotore bloccato, sovratemperatura…). Non viene
disegnato nulla finché la pompa è sana.

## Velocità

<img src="../img/aquamedic/zone_3.png"/>

Un anello sull'immagine e un cursore sotto (velocità del
motore su una DC Runner, portata su una SmartDrift, che riceve anche un
cursore per la frequenza delle onde). Su una SmartDrift l'anello è
adattato alla calotta frontale della pompa, con il valore al centro.
Entrambi scompaiono quando la pompa è comandata dal suo ingresso 0-10V,
perché l'integrazione blocca allora la velocità. Al rilascio il cursore
mantiene il nuovo valore finché la pompa non lo conferma.

## Programma a fasce

<img src="../img/aquamedic/zone_4.png"/>

La giornata dalle 00:00 alle 24:00, un blocco per
fascia — la sua altezza è la velocità programmata, una pausa alimentazione
è tratteggiata su tutta l'altezza, uno stop è una barra sottile sulla
linea di base. Un cursore rosso segna l'ora corrente. Il grafico è
attenuato quando il timer è spento, perché la pompa ignora allora il
programma.

## Animazioni

L'immagine mostra cosa sta facendo la pompa:

- **SmartDrift / EcoDrift**: quattro getti ondulati si aprono a ventaglio
  dalla parte anteriore della pompa. Si gonfiano al ritmo della frequenza
  delle onde, e restano stabili in modalità a portata costante.
- **DC Runner**: l'acqua viene aspirata dall'ingresso e spinta verso l'alto
  dall'uscita.
- **DC Skimmer**: l'immagine con la schiuma mentre la pompa gira, quella a
  riposo quando è spenta o trattenuta dalla pausa alimentazione; delle bande
  salgono nella camera di reazione, più veloci con la velocità del motore, e
  delle bolle scoppiano nel bicchiere di raccolta. Non esiste uno stato
  «bicchiere pieno»: il firmware Aqua Medic non lo rileva.

L'acqua si muove più velocemente al crescere della velocità. Non viene
disegnato nulla quando la pompa è spenta, trattenuta dalla pausa
alimentazione, o allo 0 %.

## Modificare il programma

<img src="../img/aquamedic/schedule_editor.png"/>

Fai clic sul grafico (o tieni premuta l'icona del timer) per aprire
l'editor: una riga per fascia con inizio, fine, modalità e valore (velocità
in %, o minuti per una pausa alimentazione), più frequenza e marea su una
SmartDrift. Le fasce si possono aggiungere e rimuovere. **Salva**
riscrive l'intero programma della pompa tramite il servizio
`aquamedic.set_schedule`; **Annulla** non cambia nulla.

L'editor applica ciò che la pompa accetta: le fasce non possono sovrapporsi
né attraversare la mezzanotte (scrivi una finestra notturna come due fasce),
una fascia di una DC Runner gira al 30 % o più, una pausa alimentazione dura
da 1 a 60 minuti, e una pompa contiene 48 fasce.

> [!NOTE]
> Il programma richiede ha-aquamedic-component con il sensore `schedule`.
> Con una versione precedente il grafico semplicemente non viene disegnato.

> [!NOTE]
> Una DC Runner con il vecchio firmware (velocità chiamata `flow`, nessun
> timer) usa le stesse viste: gli elementi che le mancano sono nascosti.

## Disposizione

Ogni vista ha il proprio riquadro e il proprio posizionamento, nelle
costanti `PICTURE` e `LAYOUT` del suo mapping (`dcrunner.mapping.ts`,
`dcskimmer.mapping.ts`, `smartdrift.mapping.ts`): dove si trova l'immagine,
il centro di ogni icona, il centro e la dimensione dell'anello di velocità.
I punti disegnati sull'immagine sono dati in percentuali dell'immagine, così
spostandola o ridimensionandola si spostano con essa. Come ogni elemento,
possono anche essere sovrascritti dalla configurazione della card.

---

[← Torna alla pagina principale](README.it.md)
