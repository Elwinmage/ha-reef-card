# ha-reef-card 🪸 per HomeAssistant

> Fa parte dell'**[Ecosistema ReefTech Project](https://elwinmage.github.io/reeftank/it.html)**

<p align="center">
  <img src="../../icon.png" width="50%"/>
</p>

[![GH-release](https://img.shields.io/github/v/release/Elwinmage/ha-reef-card.svg?style=flat-square)](https://github.com/Elwinmage/ha-reef-card/releases)
[![GH-last-commit](https://img.shields.io/github/last-commit/Elwinmage/ha-reef-card.svg?style=flat-square)](https://github.com/Elwinmage/ha-reef-card/commits/main)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

<!-- [![hacs_badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg?style=flat-square)](https://github.com/hacs/integration) -->

[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Lit](https://img.shields.io/badge/Lit-3.3-blue?style=flat-square&logo=lit)](https://lit.dev/)
[![codecov](https://codecov.io/gh/Elwinmage/ha-reef-card/branch/main/graph/badge.svg?token=XXXX)](https://codecov.io/gh/Elwinmage/ha-reef-card)
[![BuyMeCoffee][buymecoffeebadge]][buymecoffee]

# Lingue supportate : [<img src="https://flagicons.lipis.dev/flags/4x3/fr.svg" style="width: 5%;"/>](../fr/README.fr.md) [<img src="https://flagicons.lipis.dev/flags/4x3/gb.svg" style="width: 5%"/>](../../README.md) [<img src="https://flagicons.lipis.dev/flags/4x3/es.svg" style="width: 5%"/>](../es/README.es.md) [<img src="https://flagicons.lipis.dev/flags/4x3/pt.svg" style="width: 5%"/>](../pt/README.pt.md) [<img src="https://flagicons.lipis.dev/flags/4x3/de.svg" style="width: 5%"/>](../de/README.de.md) [<img src="https://flagicons.lipis.dev/flags/4x3/it.svg" style="width: 5%"/>](README.it.md) [<img src="https://flagicons.lipis.dev/flags/4x3/pl.svg" style="width: 5%"/>](../pl/README.pl.md)

<!-- Vous souhaitez aider à la traduction, suivez ce [guide](https://github.com/Elwinmage/ha-reef-card/blob/main/doc/TRANSLATION.md). -->

La vostra lingua non è ancora supportata e volete contribuire alla traduzione? Seguite questa [guida](https://github.com/Elwinmage/ha-reef-card/blob/main/doc/TRANSLATION.md).

# Presentazione

La **Reef card** per Home Assistant vi aiuta a gestire il vostro acquario di barriera corallina.

Abbinata a [ha-reefbeat-component](https://github.com/Elwinmage/ha-reefbeat-component), supporta automaticamente i vostri
dispositivi Redsea (ReefBeat), e [ha-reef-maintenance-component](https://github.com/Elwinmage/ha-reef-maintenance-component)
aggiunge alla vista manutenzione le attrezzature con cui Home Assistant non può dialogare.

Il supporto per i dispositivi Aqua Medic di [ha-aquamedic-component](https://github.com/Elwinmage/ha-aquamedic-component) è
in arrivo; le loro attività di manutenzione compaiono già nella stessa vista.

<!-- ecosystem:start -->

## Progetti correlati

I progetti ReefTech si incastrano tra loro: le integrazioni portano la tua attrezzatura in Home Assistant, la scheda la mostra e la pilota, e il backup la mantiene in funzione durante un blackout. Ognuno funziona anche da solo.

<table>
  <tr>
    <th width="100px"></th>
    <th>Progetto</th>
    <th>Ruolo</th>
    <th>Funziona con</th>
  </tr>
  <tr>
    <td><img src="https://raw.githubusercontent.com/Elwinmage/ha-reefbeat-component/main/icon.png" width="64" alt="ha-reefbeat-component" /></td>
    <td>🐠<br /><a href="https://github.com/Elwinmage/ha-reefbeat-component"><b>ha-reefbeat-component</b></a></td>
    <td>Dispositivi Red Sea ReefBeat, pilotati in locale senza cloud: ReefATO+, ReefControl, ReefControl-Power, ReefDose, ReefLed, ReefMat, ReefRun e ReefWave.<br />blueprint di allerta per modalità anomale, calibrazioni e batteria scarica. <a href="https://my.home-assistant.io/redirect/blueprint_import/?blueprint_url=https://raw.githubusercontent.com/Elwinmage/ha-reefbeat-component/refs/heads/main/blueprints/automation/redsea_alerts.en.yaml"><img src="https://my.home-assistant.io/badges/blueprint_import.svg" alt="Open your Home Assistant instance and show the blueprint import dialog with a specific blueprint pre-filled." /></a></td>
    <td>ha-reef-card</td>
  </tr>
  <tr>
    <td><img src="https://raw.githubusercontent.com/Elwinmage/ha-aquamedic-component/main/icon.png" width="64" alt="ha-aquamedic-component" /></td>
    <td>🌊<br /><a href="https://github.com/Elwinmage/ha-aquamedic-component"><b>ha-aquamedic-component</b></a></td>
    <td>Pompe Aqua Medic tramite l'API cloud Gizwits: pompe di movimento EcoDrift e SmartDrift, pompe DC Runner di risalita e dello schiumatoio.</td>
    <td>ha-reef-card</td>
  </tr>
  <tr>
    <td><img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-maintenance-component/main/icon.png" width="64" alt="ha-reef-maintenance-component" /></td>
    <td>🐙<br /><a href="https://github.com/Elwinmage/ha-reef-maintenance-component"><b>ha-reef-maintenance-component</b></a></td>
    <td>Tracciamento di pulizia e usura per l'attrezzatura che Home Assistant non può interrogare: pompe di movimento, pompe di risalita, schiumatoi, reattori, tutto ciò che curi a mano.</td>
    <td>ha-reef-card</td>
  </tr>
  <tr>
    <td><img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/icon.png" width="64" alt="ha-reef-card" /></td>
    <td>🪸<br /><b>ha-reef-card</b><br /><i>(questo repository)</i></td>
    <td>Vista grafica interattiva di ogni dispositivo sulla tua dashboard, e unico modo per modificare le programmazioni avanzate. Legge le tre integrazioni tramite il contratto <code>reef_role</code> comune, senza configurazione lato scheda.</td>
    <td>tutte e tre le integrazioni</td>
  </tr>
  <tr>
    <td><img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-blueprints/main/icon.png" width="64" alt="ha-reef-blueprints" /></td>
    <td>🐬<br /><a href="https://github.com/Elwinmage/ha-reef-blueprints"><b>ha-reef-blueprints</b></a></td>
    <td>Blueprint di notifica comuni a tutto l'ecosistema: manutenzioni scadute trovate tramite il contratto <code>reef_role</code>, e dispositivi diventati irraggiungibili. Otto lingue.</td>
    <td>tutte e tre le integrazioni</td>
  </tr>
  <tr>
    <td><img src="https://raw.githubusercontent.com/Elwinmage/reefbeatEnergyBackup/main/icon.png" width="64" alt="reefbeatEnergyBackup" /></td>
    <td>⚡<br /><a href="https://github.com/Elwinmage/reefbeatEnergyBackup"><b>reefbeatEnergyBackup</b></a></td>
    <td>Backup a batteria in caso di blackout. Un pacco 24V LiFePO₄ gestito da un Raspberry Pi, con degrado progressivo della velocità delle pompe in base allo stato di carica.</td>
    <td>da solo, o insieme a ha-reefbeat-component</td>
  </tr>
</table>

Sono tutti documentati insieme sulla [pagina del progetto ReefTech](https://elwinmage.github.io/reeftank/).

<!-- ecosystem:end -->

# Compatibilità

✅ Implementato ☑️ In corso ❌ Pianificato

<table>
  <th>
    <td ><b>Modello</b></td>
    <td colspan="2"><b>Stato</b></td>
    <td><b>Issues</b>  <br/>📆(Pianificato) <br/> 🐛(Bug)</td>
  </th>
  <tr>
    <td><a href="#reefato">ReefATO+</a></td>
    <td>RSATO+</td><td>☑️</td>
    <td width="200px"><img src="https://raw.githubusercontent.com/Elwinmage/ha-reefbeat-component/main/doc/img/RSATO+.png"/></td>
    <td>
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rsato,all label:enhancement" style="text-decoration:none">📆</a>
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rsato,all label:bug" style="text-decoration:none">🐛</a>
    </td>
  </tr>

  </tr>
    <tr>
    <td><a href="#reefcontrol">ReefControl</a></td>
    <td>RSSENSE<br /> Se ne possedete uno, potete contattarmi <a href="https://github.com/Elwinmage/ha-reefbeat-component/discussions/8">qui</a> e aggiungerò il suo supporto.</td><td>❌</td>
    <td width="200px"><img src="https://raw.githubusercontent.com/Elwinmage/ha-reefbeat-component/main/doc/img/RSCONTROL.png"/></td>
    <td>
      <a href="https://github.com/Elwinmage/ha-reefbeat-component/issues?q=is:issue state:open label:rscontrol,all label:enhancement" style="text-decoration:none">📆</a>
      <a href="https://github.com/Elwinmage/ha-reefbeat-component/issues?q=is:issue state:open label:rscontrol,all label:bug" style="text-decoration:none">🐛</a>
    </td>
      </tr>  
  <tr>
    <td rowspan="2"><a href="#reefdose">ReefDose</a></td>
    <td>RSDOSE2</td>
    <td>✅</td>
    <td width="200px"><img src="https://raw.githubusercontent.com/Elwinmage/ha-reefbeat-component/main/doc/img/RSDOSE2.png"/></td>
      <td rowspan="2">
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rsdose,all label:enhancement" style="text-decoration:none">📆</a>
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rsdose,all label:bug" style="text-decoration:none">🐛</a>
    </td>
  </tr>
  <tr>
    <td>RSDOSE4</td><td>✅</td>
    <td width="200px"><img src="https://raw.githubusercontent.com/Elwinmage/ha-reefbeat-component/main/doc/img/RSDOSE4.png"/></td>
    </tr>
  <tr>
    <td rowspan="2"> <a href="#reefled">ReefLed</a></td>
    <td>G1</td>
    <td>❌</td>
    <td width="200px"><img src="https://raw.githubusercontent.com/Elwinmage/ha-reefbeat-component/main/doc/img/rsled_g1.png"/></td>
<td rowspan="2">   
    <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rsled,all label:enhancement" style="text-decoration:none">📆</a>
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rsled,all label:bug" style="text-decoration:none">🐛</a>
</td>
  </tr>
   <td >G2</td>
    <td>❌</td>
    <td width="200px"><img src="https://raw.githubusercontent.com/Elwinmage/ha-reefbeat-component/main/doc/img/rsled_g2.png"/></td>
  </tr>
  <tr>
    <td rowspan="3"><a href="#reefmat">ReefMat</a></td>
    <td>RSMAT250</td>
    <td>✅</td>
    <td rowspan="3" width="200px"><img src="https://raw.githubusercontent.com/Elwinmage/ha-reefbeat-component/main/doc/img/RSMAT.png"/></td>
    <td rowspan="3">
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rsmat,all label:enhancement" style="text-decoration:none">📆</a>
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rsmat,all label:bug" style="text-decoration:none">🐛</a>
    </td>
  </tr>
  <tr>
    <td>RSMAT500</td>
    <td>✅</td>
  </tr>
  <tr>
    <td>RSMAT1200</td>
    <td>✅</td>
  </tr>
  <tr>
    <td><a href="#reefrun">ReefRun</a></td>
    <td>RSRUN</td><td>✅</td>
    <td width="200px"><img src="https://raw.githubusercontent.com/Elwinmage/ha-reefbeat-component/main/doc/img/RSRUN.png"/></td>
    <td>
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rsrun,all label:enhancement" style="text-decoration:none">📆</a>
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rsrun,all label:bug" style="text-decoration:none">🐛</a>
    </td>
  </tr>
  <tr>
    <td><a href="#reefwave">ReefWave</a></td>
    <td>RSWAVE</td><td>❌</td>
    <td width="200px"><img src="https://raw.githubusercontent.com/Elwinmage/ha-reefbeat-component/main/doc/img/RSWAVE.png"/></td>
    <td>
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rswave,all label:enhancement" style="text-decoration:none">📆</a>
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rswave,all label:bug" style="text-decoration:none">🐛</a>
    </td>
  </tr>
</table>

# Sommario

- [Installazione](https://github.com/Elwinmage/ha-reef-card/#installation)
- [Configurazione](https://github.com/Elwinmage/ha-reef-card/#configuration)
- [ReefATO+](https://github.com/Elwinmage/ha-reef-card/#reefato)
- [ReefControl](https://github.com/Elwinmage/ha-reef-card/#reefcontrol)
- [ReefDose](https://github.com/Elwinmage/ha-reef-card/#reefdose)
- [ReefLED](https://github.com/Elwinmage/ha-reef-card/#reefled)
- [ReefMat](https://github.com/Elwinmage/ha-reef-card/#reefmat)
- [ReefRun](https://github.com/Elwinmage/ha-reef-card/#reefrun)
- [ReefWave](https://github.com/Elwinmage/ha-reef-card/#reefwave)
- [Manutenzione](https://github.com/Elwinmage/ha-reef-card/#maintenance)
- [FAQ](https://github.com/Elwinmage/ha-reef-card/#faq)

# Installazione

## Installazione diretta

Clicca qui per accedere direttamente al repository in HACS e clicca su "Scarica": [![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=Elwinmage&repository=ha-reef-card&category=plugin)

## Cercare in HACS

Oppure cerca «reef-card» in HACS.

<p align="center">
<img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/hacs_search.png" alt="Image">
</p>

# Configurazione

Senza il parametro `device`, la card rileva automaticamente tutti i dispositivi ReefBeat e vi permette di scegliere quello desiderato.

Per rimuovere la selezione del dispositivo e forzarne uno specifico, impostate il parametro `device` con il nome del vostro dispositivo.

<table>
  <tr>
<td><img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/card_rsdose4_config_2.png"/></td>
<td><img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/card_rsdose4_config.png"/></td>
    </tr>
</table>

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
device: MY-RSATO
conf:
  RSATO+:
    devices:
      MY-RSATO:
        infinite_tank: true
        external_usage: true
        external_usage_entity: sensor.rodi_flow_meter
        fill_entity: switch.rodi_valve
        stop_fill_entity: "" # lasciato vuoto: lo ferma l'interruttore qui sopra
```

# ReefControl

Pianificato.

Volete che sia supportato più rapidamente? Votate [qui](https://github.com/Elwinmage/ha-reef-card/discussions/22).

# ReefDose

ReefDose con ha-reef-card in azione:

[![Guarda il video](https://img.youtube.com/vi/Qee5LH0T9wQ/0.jpg)](https://www.youtube.com/watch?v=Qee5LH0T9wQ)

La card ReefDose è suddivisa in 6 zone:

1.  Configurazione/Informazioni Wifi
2.  Stati
3.  Dosaggio Manuale
4.  Configurazione e programmazione delle teste
5.  Gestione degli integratori
6.  Coda delle dosi future

<img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/rsdose4_ex1.png"/>

## Configurazione/Informazioni Wifi

<img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/zone_1.png"/>

---

<span >Cliccate sull'icona <img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/cog_icon.png" width="30" /> per gestire la configurazione generale del ReefDose.</span>

<img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/zone_1_dialog_config.png"/>

<span>Cliccate sull'icona <img width="30px" src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/wifi_icon.png"/> per gestire i parametri di rete.</span>

<img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/zone_1_dialog_wifi.png"/>

## Stati

 <img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/zone_2.png"/>

---

<span>L'interruttore di manutenzione <img width="30px" src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/zone_2_maintenance.png"/> permette di passare alla modalità manutenzione.</span>

 <img  src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/maintenance_view.png"/>

<span>L'interruttore on/off <img width="30px" src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/zone_2_off.png"/> permette di alternare tra gli stati acceso e spento del ReefDose.</span>

 <img  src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/off_view.png"/>

## Dosaggio Manuale

<img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/zone_3.png"/>

---

<span>Il pulsante <img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/zone_3_manula_config_button.png"/> mostra la dose manuale predefinita per questa testa. Un clic apre la finestra di configurazione di questo dosaggio.</span>

<img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/zone_3_dialog_manual_dose_without.png"/>

È possibile aggiungere scorciatoie utilizzando l'editor della card:

<img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/editor.png"/>

Ad esempio, la testa 1 propone come scorciatoie i valori 2, 5 e 10 mL.

Questi valori appariranno nella parte superiore della finestra di dialogo. Un clic su queste scorciatoie invierà un comando per dosare il valore definito.

<img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/zone_3_dialog_manual_dose.png"/>

<span>Premendo il pulsante di dose manuale: <img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/zone_3_manual_button.png"/> verrà inviato un comando di dose con il valore predefinito visibile appena sopra: <img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/zone_3_manual_dose.png"/>, ovvero 10 mL in questo esempio.
</span>

## Configurazione e programmazione delle teste

 <img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/zone_4.png"/>

---

Questa zona permette di visualizzare la programmazione corrente delle teste e di modificarla.

- L'anello circolare colorato indica la percentuale di dose giornaliera già distribuita.
- Il numero giallo in alto indica il cumulato di dose manuale giornaliera.
- La parte centrale indica il volume distribuito rispetto al volume giornaliero programmato totale.
- La parte blu in basso indica il numero di dosi distribuite rispetto al numero totale di dosi della giornata (esempio: 14/24 per il blu perché è una programmazione oraria effettuata alle 14:15). I valori per il viola e il verde indicano 0/0 perché queste dosi devono essere distribuite alle 8h ma l'integrazione è stata avviata dopo le 8h, quindi non ci sarà nessuna dose oggi.
- Un clic lungo su una delle 4 teste la attiverà o disattiverà.
- Un clic su una testa aprirà la finestra di programmazione.
  Da questa finestra è possibile avviare un'innestura, ricalibrare la testa, modificare la dose giornaliera e la sua programmazione. Non dimenticate di salvare la programmazione prima di uscire.

  <img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/zone_4_dialog_schedule.png"/>

## Gestione degli integratori

 <img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/zone_5.png"/>

---

Questa zona permette di gestire gli integratori.
Se un integratore è già dichiarato, un clic su di esso aprirà la finestra di configurazione dove potrete:

- Eliminare l'integratore (icona cestino in alto a destra)
- Indicare il volume totale del contenitore
- Indicare il volume reale dell'integratore
- Decidere se volete monitorare il volume rimanente. Un clic sulle scorciatoie in alto attiverà il controllo e imposterà i valori predefiniti con un contenitore pieno.
- Modificare il nome di visualizzazione dell'integratore.

 <img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/zone_5_dialog_container.png"/>

Se nessun integratore è collegato a una testa, è possibile aggiungerne uno cliccando sul contenitore con un '+' (testa 4 nel nostro esempio).

<img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/zone_5_add_container.png"/>

Seguite quindi le istruzioni:

<img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/zone_5_dialog_add.png"/>

### Integratori

Ecco l'elenco delle immagini supportate per gli integratori, raggruppate per marca. Se il tuo mostra un ❌, puoi richiederne l'aggiunta [qui](https://github.com/Elwinmage/ha-reef-card/discussions/25).

<details>
<summary><b>ATI &nbsp; <sup>2/2 🖼️</sup></b></summary>

<table>
<tr><td>✅</td><td>Essential Pro 1</td><td><img style='width:20%;' src='../../public/img/supplements/69692902-dcf9-4f41-b104-402154dc348a.supplement.png'/></td></tr>
<tr><td>✅</td><td>Essential Pro 2</td><td><img style='width:20%;' src='../../public/img/supplements/e1dbec89-2396-4269-8f28-ab7534cb2d7d.supplement.png'/></td></tr>
</table>
</details>

<details>
<summary><b>Aqua Forest &nbsp; <sup>3/9 🖼️</sup></b></summary>

<table>
<tr><td>✅</td><td>Ca Plus</td><td><img style='width:20%;' src='../../public/img/supplements/9ea6c9f2-b6f3-41ee-9370-06457f286fe5.supplement.png'/></td></tr>
<tr><td>❌</td><td colspan='2'>Calcium </td></tr>
<tr><td>❌</td><td colspan='2'>Component 1+</td></tr>
<tr><td>❌</td><td colspan='2'>Component 2+</td></tr>
<tr><td>❌</td><td colspan='2'>Component 3+</td></tr>
<tr><td>❌</td><td colspan='2'>KH Buffer</td></tr>
<tr><td>✅</td><td>KH Plus</td><td><img style='width:20%;' src='../../public/img/supplements/e391e8d1-0d4c-4355-8887-9231500703ef.supplement.png'/></td></tr>
<tr><td>❌</td><td colspan='2'>Magnesium</td></tr>
<tr><td>✅</td><td>Mg Plus</td><td><img style='width:20%;' src='../../public/img/supplements/deb3a943-68a5-40a9-860b-e6d259eee947.supplement.png'/></td></tr>
</table>
</details>

<details>
<summary><b>BRS &nbsp; <sup>0/4 🖼️</sup></b></summary>

<table>
<tr><td>❌</td><td colspan='2'>Liquid Calcium</td></tr>
<tr><td>❌</td><td colspan='2'>Liquid alkalinity</td></tr>
<tr><td>❌</td><td colspan='2'>Magnesium Mix</td></tr>
<tr><td>❌</td><td colspan='2'>Part C</td></tr>
</table>
</details>

<details>
<summary><b>Brightwell &nbsp; <sup>0/12 🖼️</sup></b></summary>

<table>
<tr><td>❌</td><td colspan='2'>Calcion</td></tr>
<tr><td>❌</td><td colspan='2'>Ferrion</td></tr>
<tr><td>❌</td><td colspan='2'>Hydrate - MG</td></tr>
<tr><td>❌</td><td colspan='2'>KoralAmino</td></tr>
<tr><td>❌</td><td colspan='2'>Koralcolor</td></tr>
<tr><td>❌</td><td colspan='2'>Liquid Reef</td></tr>
<tr><td>❌</td><td colspan='2'>Potassion</td></tr>
<tr><td>❌</td><td colspan='2'>Reef Code A</td></tr>
<tr><td>❌</td><td colspan='2'>Reef Code B</td></tr>
<tr><td>❌</td><td colspan='2'>Replenish</td></tr>
<tr><td>❌</td><td colspan='2'>Restore</td></tr>
<tr><td>❌</td><td colspan='2'>Strontion</td></tr>
</table>
</details>

<details>
<summary><b>ESV &nbsp; <sup>0/5 🖼️</sup></b></summary>

<table>
<tr><td>❌</td><td colspan='2'>B-Ionic Component 1</td></tr>
<tr><td>❌</td><td colspan='2'>B-Ionic Component 2</td></tr>
<tr><td>❌</td><td colspan='2'>B-Ionic Magnesium</td></tr>
<tr><td>❌</td><td colspan='2'>Transition elements </td></tr>
<tr><td>❌</td><td colspan='2'>Transition elements plus</td></tr>
</table>
</details>

<details>
<summary><b>Fauna Marine &nbsp; <sup>0/11 🖼️</sup></b></summary>

<table>
<tr><td>❌</td><td colspan='2'>Amin</td></tr>
<tr><td>❌</td><td colspan='2'>Balling light  trace 1</td></tr>
<tr><td>❌</td><td colspan='2'>Balling light  trace 2</td></tr>
<tr><td>❌</td><td colspan='2'>Balling light  trace 3</td></tr>
<tr><td>❌</td><td colspan='2'>Balling light Ca</td></tr>
<tr><td>❌</td><td colspan='2'>Balling light KH</td></tr>
<tr><td>❌</td><td colspan='2'>Balling light Mg</td></tr>
<tr><td>❌</td><td colspan='2'>Blue trace elements</td></tr>
<tr><td>❌</td><td colspan='2'>Green trace elements</td></tr>
<tr><td>❌</td><td colspan='2'>Min S</td></tr>
<tr><td>❌</td><td colspan='2'>Red trace elements</td></tr>
</table>
</details>

<details>
<summary><b>Quantum &nbsp; <sup>7/7 🖼️</sup></b></summary>

<table>
<tr><td>✅</td><td>Aragonite A</td><td><img style='width:20%;' src='../../public/img/supplements/322c1c47-7259-4fd9-9050-f6157036ea36.supplement.png'/></td></tr>
<tr><td>✅</td><td>Aragonite B</td><td><img style='width:20%;' src='../../public/img/supplements/e6537278-0e0a-4fd7-8146-566334bb74ed.supplement.png'/></td></tr>
<tr><td>✅</td><td>Aragonite C</td><td><img style='width:20%;' src='../../public/img/supplements/5f491b59-4f54-4572-bbce-aa9b708ccb51.supplement.png'/></td></tr>
<tr><td>✅</td><td>Bio Kalium</td><td><img style='width:20%;' src='../../public/img/supplements/8fec18b0-adf6-4dfa-b923-c7226a6fb87d.supplement.png'/></td></tr>
<tr><td>✅</td><td>Bio Metals</td><td><img style='width:20%;' src='../../public/img/supplements/a1d797e3-4679-4be4-9219-22e35822ab97.supplement.png'/></td></tr>
<tr><td>✅</td><td>Bio enhance</td><td><img style='width:20%;' src='../../public/img/supplements/fd8dee42-f3da-4660-b491-880d7dac869a.supplement.png'/></td></tr>
<tr><td>✅</td><td>Gbio Gen</td><td><img style='width:20%;' src='../../public/img/supplements/26a4f030-e78c-459c-90cb-5c6099de10fd.supplement.png'/></td></tr>
</table>
</details>

<details>
<summary><b>Red Sea &nbsp; <sup>10/13 🖼️</sup></b></summary>

<table>
<tr><td>✅</td><td>Bio Active (Colors D)</td><td><img style='width:20%;' src='../../public/img/supplements/7af9b16b-9e63-488e-8c86-261ef8c4a1ce.supplement.png'/></td></tr>
<tr><td>✅</td><td>Calcium (Foundation A)</td><td><img style='width:20%;' src='../../public/img/supplements/7d67412c-fde0-44d4-882a-dc8746fd4acb.supplement.png'/></td></tr>
<tr><td>❌</td><td colspan='2'>Calcium (Powder)</td></tr>
<tr><td>✅</td><td>Iodine (Colors A)</td><td><img style='width:20%;' src='../../public/img/supplements/93e742b0-67c9-4800-9aa9-212e52532343.supplement.png'/></td></tr>
<tr><td>✅</td><td>Iron (Colors C)</td><td><img style='width:20%;' src='../../public/img/supplements/c7a26034-8e40-41bb-bfb5-169089470f1e.supplement.png'/></td></tr>
<tr><td>✅</td><td>KH/Alkalinity (Foundation B)</td><td><img style='width:20%;' src='../../public/img/supplements/76830db3-a0bd-459a-9974-76a57d026893.supplement.png'/></td></tr>
<tr><td>❌</td><td colspan='2'>KH/Alkalinity (Powder)</td></tr>
<tr><td>✅</td><td>Magnesium (Foundation C)</td><td><img style='width:20%;' src='../../public/img/supplements/f524734e-8651-496e-b09b-640b40fc8bab.supplement.png'/></td></tr>
<tr><td>❌</td><td colspan='2'>Magnesium (Powder)</td></tr>
<tr><td>✅</td><td>NO3PO4-X</td><td><img style='width:20%;' src='../../public/img/supplements/ffaf6ff8-bc6d-44eb-9e4b-e679943dc835.supplement.png'/></td></tr>
<tr><td>✅</td><td>Potassium (Colors B)</td><td><img style='width:20%;' src='../../public/img/supplements/2f386917-54bd-4dd4-aa8b-9d1fea37edc5.supplement.png'/></td></tr>
<tr><td>✅</td><td>Reef Energy Plus</td><td><img style='width:20%;' src='../../public/img/supplements/bf9a7da3-741b-4c1d-8542-d9344a95fb70.supplement.png'/></td></tr>
<tr><td>✅</td><td>ReefCare Program</td><td><img style='width:20%;' src='../../public/img/supplements/redsea-reefcare.supplement.png'/></td></tr>
</table>
</details>

<details>
<summary><b>Seachem &nbsp; <sup>0/9 🖼️</sup></b></summary>

<table>
<tr><td>❌</td><td colspan='2'>Reef Calcium</td></tr>
<tr><td>❌</td><td colspan='2'>Reef Carbonate</td></tr>
<tr><td>❌</td><td colspan='2'>Reef Complete</td></tr>
<tr><td>❌</td><td colspan='2'>Reef Fusion 1</td></tr>
<tr><td>❌</td><td colspan='2'>Reef Fusion 2</td></tr>
<tr><td>❌</td><td colspan='2'>Reef Iodine</td></tr>
<tr><td>❌</td><td colspan='2'>Reef Plus</td></tr>
<tr><td>❌</td><td colspan='2'>Reef Strontium</td></tr>
<tr><td>❌</td><td colspan='2'>Reef Trace</td></tr>
</table>
</details>

<details>
<summary><b>Triton &nbsp; <sup>0/4 🖼️</sup></b></summary>

<table>
<tr><td>❌</td><td colspan='2'>Core7 elements 1</td></tr>
<tr><td>❌</td><td colspan='2'>Core7 elements 2</td></tr>
<tr><td>❌</td><td colspan='2'>Core7 elements 3A</td></tr>
<tr><td>❌</td><td colspan='2'>Core7 elements 3B</td></tr>
</table>
</details>

<details>
<summary><b>Tropic Marin &nbsp; <sup>6/14 🖼️</sup></b></summary>

<table>
<tr><td>❌</td><td colspan='2'>A Element</td></tr>
<tr><td>✅</td><td>All-For-Reef</td><td><img style='width:20%;' src='../../public/img/supplements/aff00331-3c23-4357-b6d4-6609dbc4fed1.supplement.png'/></td></tr>
<tr><td>✅</td><td>Amino Organic</td><td><img style='width:20%;' src='../../public/img/supplements/fddbe0a4-02eb-4903-969b-6c27c805bf6b.supplement.png'/></td></tr>
<tr><td>❌</td><td colspan='2'>Balling A</td></tr>
<tr><td>❌</td><td colspan='2'>Balling B</td></tr>
<tr><td>❌</td><td colspan='2'>Balling C</td></tr>
<tr><td>✅</td><td>Bio-Magnesium</td><td><img style='width:20%;' src='../../public/img/supplements/2f04f694-3743-4e12-a45f-a3eb63aef806.supplement.png'/></td></tr>
<tr><td>✅</td><td>Carbo Calcium</td><td><img style='width:20%;' src='../../public/img/supplements/8cdabb9f-ebcf-4675-a10f-f9020941928f.supplement.png'/></td></tr>
<tr><td>❌</td><td colspan='2'>Elimi-NP</td></tr>
<tr><td>❌</td><td colspan='2'>K Element</td></tr>
<tr><td>❌</td><td colspan='2'>Liquid Buffer</td></tr>
<tr><td>✅</td><td>NP-Bacto-Balance</td><td><img style='width:20%;' src='../../public/img/supplements/43b51c1f-0363-4ef5-be89-f129e512e25b.supplement.png'/></td></tr>
<tr><td>❌</td><td colspan='2'>Plus-NP</td></tr>
<tr><td>✅</td><td>Potassium</td><td><img style='width:20%;' src='../../public/img/supplements/964e897e-9668-4fc8-9cd9-e8c42a27cf85.supplement.png'/></td></tr>
</table>
</details>

# ReefLed

Pianificato.

Volete che sia supportato più rapidamente? Votate [qui](https://github.com/Elwinmage/ha-reef-card/discussions/22).

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

# ReefWave

Pianificato.

Volete che sia supportato più rapidamente? Votate [qui](https://github.com/Elwinmage/ha-reef-card/discussions/22).

# Manutenzione

La vista manutenzione di ha-reef-card in azione:

[![Guarda il video](https://img.youtube.com/vi/Ko46fHonOP4/0.jpg)](https://www.youtube.com/watch?v=Ko46fHonOP4)

<img src="../img/maintenance/overview.png"/>

Oltre alle viste per apparecchio, la card offre una vista **Manutenzione** che
raccoglie tutte le attività di manutenzione esposte da `ha-reefbeat-component`,
`ha-reef-maintenance-component` e `ha-aquamedic-component`, come se l'intero
sottosistema di manutenzione fosse un unico dispositivo. La vista cerca il
marcatore che ognuna di esse mette sulle proprie entità, non una particolare
integrazione.

Ogni attività è mostrata come una barra di avanzamento che indica quanta parte
del suo intervallo è trascorsa, con un colore legato al tempo rimanente:

| Colore    | Significato                                                 |
| --------- | ----------------------------------------------------------- |
| Verde     | In regola                                                   |
| Arancione | In scadenza (ultimo 20 % dell'intervallo, almeno un giorno) |
| Rosso     | Scaduta, l'etichetta diventa `+X g`                         |
| Grigio    | Mai eseguita (nessun azzeramento registrato)                |

Le attività si possono ordinare **per apparecchio** (raggruppate, con
un'intestazione per dispositivo) o **per scadenza** (un elenco piatto, la più
urgente per prima). Le attività mai eseguite restano sempre in fondo. Nella
barra degli strumenti ci sono due filtri: una casella che nasconde le attività
ancora in regola e un pulsante **Nascondi silenziate / Mostra silenziate** che
nasconde le attività il cui interruttore di notifica è spento. Il pulsante parte
in posizione «mostra», così silenziare un avviso non fa mai sparire da solo una
scadenza. Questo valore predefinito è configurabile dall'editor della card (o con
`hide_muted` più avanti), e il pulsante ha comunque la precedenza in qualsiasi
momento.

Cliccando una riga si apre la finestra more-info di Home Assistant
dell'attività, e il pulsante rotondo a destra la segna come eseguita (preme
l'entità pulsante sottostante, esattamente come farebbe la finestra more-info).

La vista compare nel selettore dei dispositivi solo quando esiste almeno
un'attività di manutenzione nel tuo impianto. Le nuove attività aggiunte al
catalogo dell'integrazione compaiono automaticamente, senza aggiornare la card.

### Notifiche

Ogni attività riceve anche un **interruttore di notifica** nell'integrazione
(`switch.*_notify`, mostrato come «<nome dell'attività> (notifiche)»).
Spegnerlo silenzia l'avviso di scadenza di quella sola attività senza toccarne
la programmazione: la barra di avanzamento continua a scorrere, la riga si
attenua e la campanella si spegne.

La campanella a destra di ogni riga commuta direttamente quell'interruttore.
Compare solo quando l'integrazione espone l'interruttore. Usa
`show_notify: false` per nascondere le campanelle.

Il blueprint degli avvisi legge esattamente la stessa impostazione, quindi
silenziare un'attività nella card silenzia anche l'automazione.

### Cambiare l'intervallo

Il pulsante calendario di ogni riga apre un cursore in linea che scrive
sull'entità numerica dell'intervallo dell'attività. Il cursore lavora nell'unità
che l'integrazione dichiara per quell'attività (giorni, settimane o mesi, letta
dal ruolo dell'entità), e l'integrazione riconverte in giorni prima di salvare.
I limiti provengono dall'entità stessa, quindi la card non può mai scrivere un
valore fuori intervallo. Resta aperto un solo editor per volta. Usa
`show_interval: false` per nascondere i pulsanti.

### Filtra per dispositivo

Per impostazione predefinita la vista elenca le attività di tutti i dispositivi.
Il blocco **Filtra per dispositivo** dell'editor della card la restringe: spunta
uno o più dispositivi e vengono mantenute solo le loro attività, contatori
compresi.

<img src="../img/maintenance/editor_devices.png"/>

L'elenco contiene una voce per ogni controller, con il numero di attività che gli
appartengono. I sottodispositivi (teste ReefDose, pompe ReefRun) vengono
raggruppati sotto il loro controller grazie al collegamento `via_device` del
registro di Home Assistant: spuntare **RSDose4** conserva quindi le attività di
tutte e quattro le teste. Nessuna casella spuntata significa «nessun filtro»:
vengono mostrati tutti i dispositivi, che è anche ciò che ripristina la
scorciatoia **Mostra tutti i dispositivi**.

La selezione è salvata come nomi di dispositivo (vedi `devices` più sotto), così
lo YAML resta leggibile. Un nome scritto a mano corrisponde anche ai suoi
sottodispositivi per prefisso, il che copre le installazioni in cui `via_device`
non è dichiarato. I dispositivi senza nome sono identificati dal loro id di
dispositivo di Home Assistant.

### Pompe ReefRun

I sottodispositivi ReefRun si chiamano «… pompa 1» / «… pompa 2», il che non
dice nulla su cosa sia davvero ciascuna pompa. Quando il dispositivo espone sia
un sensore `type` sia un sensore `model`, la card li aggiunge tra parentesi:
**ReefRun pompa 1 (risalita 12000)**, **ReefRun pompa 2 (schiumatoio 900)**.

Il tipo viene tradotto e del modello si conserva solo la cifra finale
(`return-12000` -> `12000`, `rsk-900` -> `900`), dato che il prefisso è
ridondante con il tipo oppure criptico. I dispositivi che non sono pompe
mantengono un nome semplice.

## Icone

| Icona                                                                                                    | Ruolo                                                                                     |
| -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| <img src="../img/mdi/mdi_check.png" width="20"/>                                                         | **Attività eseguita.** Segna l'attività come svolta e riavvia il suo conto alla rovescia. |
| <img src="../img/mdi/mdi_bell-ring.png" width="20"/> <img src="../img/mdi/mdi_bell-off.png" width="20"/> | **Silenzia / riattiva.** Commuta l'interruttore di notifica di quella sola attività.      |
| <img src="../img/mdi/mdi_calendar-edit.png" width="20"/>                                                 | **Cambia l'intervallo.** Apre un cursore collegato all'intervallo dell'attività.          |

## Editor

Lo stato predefinito dei filtri, il filtro per dispositivo e la visibilità dei
tre pulsanti si impostano dall'editor della card.

<img src="../img/maintenance/editor.png"/>

## Configurazione

```yaml
type: custom:reef-card
device: __maintenance__
maintenance:
  sort: due # "device" (predefinito) o "due"
  devices: # mostra solo le attività di questi dispositivi (vuoto: tutti)
    - SIMU-RSDOSE4
    - SIMU-RSATO
  hide_ok: false # nascondi le attività né scadute né in scadenza
  hide_muted: false # nascondi le attività con le notifiche spente
  warning_ratio: 0.2 # quota dell'intervallo mostrata in arancione
  show_reset: true # mostra il pulsante "segna come eseguita" su ogni riga
  show_notify: true # mostra la campanella silenzia/riattiva su ogni riga
  show_interval: true # mostra il pulsante di modifica dell'intervallo su ogni riga
```

Tutte le chiavi di `maintenance` sono opzionali. `sort` e `hide_ok` impostano
solo lo stato iniziale: l'utente può cambiarli dalla vista stessa. `devices`
accetta sia nomi di dispositivo sia id di dispositivo di Home Assistant; una
lista vuota (il valore predefinito) disattiva il filtro.

# FAQ

---

[buymecoffee]: https://paypal.me/Elwinmage
[buymecoffeebadge]: https://img.shields.io/badge/buy%20me%20a%20coffee-donate-yellow.svg?style=flat-square
