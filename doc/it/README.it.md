# ha-reef-card 🌊 per HomeAssistant

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

Abbinata a [ha-reefbeat-component](https://github.com/Elwinmage/ha-reefbeat-component), supporta automaticamente i vostri dispositivi Redsea (ReefBeat).

> [!TIP]
> La lista delle funzionalità future è disponibile [qui](https://github.com/Elwinmage/ha-reef-card/issues?q=is%3Aissue%20state%3Aopen%20label%3Aenhancement)<br />
> La lista dei bug è disponibile [qui](https://github.com/Elwinmage/ha-reef-card/issues?q=is%3Aissue%20state%3Aopen%20label%3Abug)

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
    <td>RSATO+</td><td>❌</td>
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
    <td>RSRUN</td><td>☑</td>
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

Pianificato.

Volete che sia supportato più rapidamente? Votate [qui](https://github.com/Elwinmage/ha-reef-card/discussions/22).

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
<summary><b>Tropic Marin &nbsp; <sup>5/14 🖼️</sup></b></summary>

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
<tr><td>❌</td><td colspan='2'>NP-Bacto-Balance</td></tr>
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

Pianificato.

Volete che sia supportato più rapidamente? Votate [qui](https://github.com/Elwinmage/ha-reef-card/discussions/22).

# ReefWave

Pianificato.

Volete che sia supportato più rapidamente? Votate [qui](https://github.com/Elwinmage/ha-reef-card/discussions/22).

# FAQ

---

[buymecoffee]: https://paypal.me/Elwinmage
[buymecoffeebadge]: https://img.shields.io/badge/buy%20me%20a%20coffee-donate-yellow.svg?style=flat-square
