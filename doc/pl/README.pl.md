# ha-reef-card 🪸 dla HomeAssistant

> Część **[Ekosystemu ReefTech Project](https://elwinmage.github.io/reeftank/pl.html)**

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

# Obsługiwane języki : [<img src="https://flagicons.lipis.dev/flags/4x3/fr.svg" style="width: 5%;"/>](../fr/README.fr.md) [<img src="https://flagicons.lipis.dev/flags/4x3/gb.svg" style="width: 5%"/>](../../README.md) [<img src="https://flagicons.lipis.dev/flags/4x3/es.svg" style="width: 5%"/>](../es/README.es.md) [<img src="https://flagicons.lipis.dev/flags/4x3/pt.svg" style="width: 5%"/>](../pt/README.pt.md) [<img src="https://flagicons.lipis.dev/flags/4x3/de.svg" style="width: 5%"/>](../de/README.de.md) [<img src="https://flagicons.lipis.dev/flags/4x3/it.svg" style="width: 5%"/>](../it/README.it.md) [<img src="https://flagicons.lipis.dev/flags/4x3/pl.svg" style="width: 5%"/>](README.pl.md)

<!-- Vous souhaitez aider à la traduction, suivez ce [guide](https://github.com/Elwinmage/ha-reef-card/blob/main/doc/TRANSLATION.md). -->

Twój język nie jest jeszcze obsługiwany i chcesz pomóc w tłumaczeniu? Postępuj zgodnie z tym [przewodnikiem](https://github.com/Elwinmage/ha-reef-card/blob/main/doc/TRANSLATION.md).

# Prezentacja

**Reef card** dla Home Assistant pomaga zarządzać akwarium rafowym.

W połączeniu z [ha-reefbeat-component](https://github.com/Elwinmage/ha-reefbeat-component) automatycznie obsługuje urządzenia
Redsea (ReefBeat), a [ha-reef-maintenance-component](https://github.com/Elwinmage/ha-reef-maintenance-component) dodaje do
widoku konserwacji sprzęt, z którym Home Assistant nie potrafi się porozumieć.

Obsługuje także pompy Aqua Medic z [ha-aquamedic-component](https://github.com/Elwinmage/ha-aquamedic-component);
ich zadania konserwacyjne pojawiają się w tym samym widoku.

Przepływy energii z [reefbeatEnergyBackup](https://github.com/Elwinmage/reefbeatEnergyBackup) (sieć, bateria, pompy) także mają swój widok, rysowany przez [Power Flow Card Plus](https://github.com/flixlix/power-flow-card-plus).

<!-- ecosystem:start -->

## Powiązane projekty

Projekty ReefTech uzupełniają się: integracje wprowadzają sprzęt do Home Assistant, karta go wyświetla i steruje nim, a zasilanie awaryjne utrzymuje go w ruchu podczas przerwy w zasilaniu. Każdy działa również samodzielnie.

<table>
  <tr>
    <th width="100px"></th>
    <th>Projekt</th>
    <th>Rola</th>
    <th>Współpracuje z</th>
  </tr>
  <tr>
    <td><img src="https://raw.githubusercontent.com/Elwinmage/ha-reefbeat-component/main/icon.png" width="64" alt="ha-reefbeat-component" /></td>
    <td>🐠<br /><a href="https://github.com/Elwinmage/ha-reefbeat-component"><b>ha-reefbeat-component</b></a></td>
    <td>Urządzenia Red Sea ReefBeat, sterowane lokalnie bez chmury: ReefATO+, ReefControl, ReefControl-Power, ReefDose, ReefLed, ReefMat, ReefRun i ReefWave.<br />blueprint alertów dla nietypowych trybów, kalibracji i niskiego poziomu baterii. <a href="https://my.home-assistant.io/redirect/blueprint_import/?blueprint_url=https://raw.githubusercontent.com/Elwinmage/ha-reefbeat-component/refs/heads/main/blueprints/automation/redsea_alerts.en.yaml"><img src="https://my.home-assistant.io/badges/blueprint_import.svg" alt="Open your Home Assistant instance and show the blueprint import dialog with a specific blueprint pre-filled." /></a></td>
    <td>ha-reef-card</td>
  </tr>
  <tr>
    <td><img src="https://raw.githubusercontent.com/Elwinmage/ha-aquamedic-component/main/icon.png" width="64" alt="ha-aquamedic-component" /></td>
    <td>🌊<br /><a href="https://github.com/Elwinmage/ha-aquamedic-component"><b>ha-aquamedic-component</b></a></td>
    <td>Pompy Aqua Medic przez chmurowe API Gizwits: pompy cyrkulacyjne EcoDrift i SmartDrift, pompy DC Runner obiegowe i do odpieniacza.</td>
    <td>ha-reef-card</td>
  </tr>
  <tr>
    <td><img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-maintenance-component/main/icon.png" width="64" alt="ha-reef-maintenance-component" /></td>
    <td>🐙<br /><a href="https://github.com/Elwinmage/ha-reef-maintenance-component"><b>ha-reef-maintenance-component</b></a></td>
    <td>Śledzenie czyszczenia i zużycia sprzętu, do którego Home Assistant nie ma dostępu: pompy cyrkulacyjne, pompy obiegowe, odpieniacze, reaktory, wszystko co obsługujesz ręcznie.</td>
    <td>ha-reef-card</td>
  </tr>
  <tr>
    <td><img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/icon.png" width="64" alt="ha-reef-card" /></td>
    <td>🪸<br /><b>ha-reef-card</b><br /><i>(to repozytorium)</i></td>
    <td>Interaktywny widok graficzny każdego urządzenia na pulpicie i jedyny sposób edycji zaawansowanych harmonogramów. Odczytuje trzy integracje przez wspólny kontrakt <code>reef_role</code>, bez konfiguracji po stronie karty.</td>
    <td>wszystkie trzy integracje</td>
  </tr>
  <tr>
    <td><img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-blueprints/main/icon.png" width="64" alt="ha-reef-blueprints" /></td>
    <td>🐬<br /><a href="https://github.com/Elwinmage/ha-reef-blueprints"><b>ha-reef-blueprints</b></a></td>
    <td>Blueprinty powiadomień wspólne dla całego ekosystemu: zaległe konserwacje znajdowane przez kontrakt <code>reef_role</code> oraz urządzenia, które przestały odpowiadać. Osiem języków.</td>
    <td>wszystkie trzy integracje</td>
  </tr>
  <tr>
    <td><img src="https://raw.githubusercontent.com/Elwinmage/reefbeatEnergyBackup/main/icon.png" width="64" alt="reefbeatEnergyBackup" /></td>
    <td>⚡<br /><a href="https://github.com/Elwinmage/reefbeatEnergyBackup"><b>reefbeatEnergyBackup</b></a></td>
    <td>Zasilanie awaryjne na wypadek przerw w zasilaniu. Pakiet 24V LiFePO₄ sterowany przez Raspberry Pi, ze stopniowym obniżaniem prędkości pomp zależnie od stanu naładowania.</td>
    <td>samodzielnie lub razem z ha-reefbeat-component</td>
  </tr>
</table>

Wszystkie są udokumentowane razem na [stronie projektu ReefTech](https://elwinmage.github.io/reeftank/).

<!-- ecosystem:end -->

# Zgodność

> ✅ Obsługiwane &nbsp;|&nbsp; 🚧 W trakcie &nbsp;|&nbsp; 🧪 Nieprzetestowane (może działać) &nbsp;|&nbsp; ❌ Jeszcze nieobsługiwane

<table>
  <th>
    <td ><b>Model</b></td>
    <td colspan="2"><b>Status</b></td>
    <td><b>Issues</b>  <br/>📆(Zaplanowano) <br/> 🐛(Błędy)</td>
  </th>
  <tr>
    <td><a href="https://github.com/Elwinmage/ha-reef-card/blob/main/doc/pl/reefato.pl.md#reefato">ReefATO+</a></td>
    <td>RSATO+</td><td>✅</td>
    <td width="200px"><img src="https://raw.githubusercontent.com/Elwinmage/ha-reefbeat-component/main/doc/img/RSATO+.png"/></td>
    <td>
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rsato,all label:enhancement" style="text-decoration:none">📆</a>
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rsato,all label:bug" style="text-decoration:none">🐛</a>
    </td>
  </tr>
  <tr>
    <td rowspan="2"><a href="https://github.com/Elwinmage/ha-reef-card/blob/main/doc/pl/reefcontrol.pl.md#reefcontrol">ReefControl</a></td>
    <td>RSCONTROLPRO</td><td>✅</td>
    <td width="200px"><img src="https://raw.githubusercontent.com/Elwinmage/ha-reefbeat-component/main/doc/img/RSCONTROLPRO.png"/></td>
    <td rowspan="2">
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rscontrol,all label:enhancement" style="text-decoration:none">📆</a>
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rscontrol,all label:bug" style="text-decoration:none">🐛</a>
    </td>
  </tr>
  <tr>
    <td>RSCONTROLLITE</td><td>🧪</td>
    <td width="200px"><img src="https://raw.githubusercontent.com/Elwinmage/ha-reefbeat-component/main/doc/img/RSCONTROLLITE.png"/></td>
  </tr>
  <tr>
    <td rowspan="2"><a href="https://github.com/Elwinmage/ha-reef-card/blob/main/doc/pl/reefcontrol-power.pl.md#reefcontrol-power">ReefControl-Power</a></td>
    <td>RSPOWER6</td><td>✅</td>
    <td width="200px"><img src="https://raw.githubusercontent.com/Elwinmage/ha-reefbeat-component/main/doc/img/RSPOWER6.png"/></td>
    <td rowspan="2">
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rspower,all label:enhancement" style="text-decoration:none">📆</a>
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rspower,all label:bug" style="text-decoration:none">🐛</a>
    </td>
  </tr>
  <tr>
    <td>RSPOWER8</td><td>🧪</td>
    <td width="200px"><img src="https://raw.githubusercontent.com/Elwinmage/ha-reefbeat-component/main/doc/img/RSPOWER8.png"/></td>
  </tr>
  <tr>
    <td rowspan="2"><a href="https://github.com/Elwinmage/ha-reef-card/blob/main/doc/pl/reefdose.pl.md#reefdose">ReefDose</a></td>
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
    <td rowspan="2"> <a href="https://github.com/Elwinmage/ha-reef-card/blob/main/doc/pl/reefled.pl.md#reefled">ReefLed</a></td>
    <td>G1</td>
    <td>✅</td>
    <td width="200px"><img src="https://raw.githubusercontent.com/Elwinmage/ha-reefbeat-component/main/doc/img/rsled_g1.png"/></td>
<td rowspan="2">   
    <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rsled,all label:enhancement" style="text-decoration:none">📆</a>
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rsled,all label:bug" style="text-decoration:none">🐛</a>
</td>
  </tr>
  <tr>
    <td>G2</td>
    <td>🧪</td>
    <td width="200px"><img src="https://raw.githubusercontent.com/Elwinmage/ha-reefbeat-component/main/doc/img/rsled_g2.png"/></td>
  </tr>
  <tr>
    <td rowspan="3"><a href="https://github.com/Elwinmage/ha-reef-card/blob/main/doc/pl/reefmat.pl.md#reefmat">ReefMat</a></td>
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
    <td><a href="https://github.com/Elwinmage/ha-reef-card/blob/main/doc/pl/reefrun.pl.md#reefrun">ReefRun</a></td>
    <td>RSRUN</td><td>✅</td>
    <td width="200px"><img src="https://raw.githubusercontent.com/Elwinmage/ha-reefbeat-component/main/doc/img/RSRUN.png"/></td>
    <td>
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rsrun,all label:enhancement" style="text-decoration:none">📆</a>
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rsrun,all label:bug" style="text-decoration:none">🐛</a>
    </td>
  </tr>
  <tr>
    <td><a href="https://github.com/Elwinmage/ha-reef-card/blob/main/doc/pl/reefwave.pl.md#reefwave">ReefWave</a></td>
    <td>RSWAVE25<br />RSWAVE45</td><td>✅</td>
    <td width="200px"><img src="https://raw.githubusercontent.com/Elwinmage/ha-reefbeat-component/main/doc/img/RSWAVE.png"/></td>
    <td>
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rswave,all label:enhancement" style="text-decoration:none">📆</a>
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rswave,all label:bug" style="text-decoration:none">🐛</a>
    </td>
  </tr>
  <tr>
    <td colspan="5"><b>Aqua Medic</b> — przez <a href="https://github.com/Elwinmage/ha-aquamedic-component">ha-aquamedic-component</a></td>
  </tr>
  <tr>
    <td rowspan="3"><a href="https://github.com/Elwinmage/ha-reef-card/blob/main/doc/pl/aquamedic.pl.md#aqua-medic">Aqua Medic</a></td>
    <td>EcoDrift / SmartDrift x.1 / x.3<br />(cyrkulator)</td><td>✅</td>
    <td width="200px"><img src="https://raw.githubusercontent.com/Elwinmage/ha-aquamedic-component/main/doc/img/drift.png" width="120"/></td>
    <td rowspan="3">
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:aquamedic,all label:enhancement" style="text-decoration:none">📆</a>
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:aquamedic,all label:bug" style="text-decoration:none">🐛</a>
    </td>
  </tr>
  <tr>
    <td>DC Runner<br />(pompa powrotna)</td><td>✅</td>
    <td width="200px"><img src="https://raw.githubusercontent.com/Elwinmage/ha-aquamedic-component/main/doc/img/runner.png" width="120"/></td>
  </tr>
  <tr>
    <td>DC Runner<br />(pompa odpieniacza)</td><td>✅</td>
    <td width="200px"><img src="https://raw.githubusercontent.com/Elwinmage/ha-aquamedic-component/main/doc/img/skimmer.png" width="120"/></td>
  </tr>
  <tr>
    <td colspan="5"><b>reefbeatEnergyBackup</b> — przez <a href="https://github.com/Elwinmage/reefbeatEnergyBackup">reefbeatEnergyBackup</a></td>
  </tr>
  <tr>
    <td><a href="https://github.com/Elwinmage/ha-reef-card/blob/main/doc/pl/energybackup.pl.md#zasilanie-awaryjne">Zasilanie awaryjne</a></td>
    <td>Energy Backup System<br />(bateria awaryjna)</td><td>🧪</td>
    <td width="200px"><img src="https://raw.githubusercontent.com/Elwinmage/reefbeatEnergyBackup/main/icon.png" width="64"/></td>
    <td>
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:energybackup,all label:enhancement" style="text-decoration:none">📆</a>
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:energybackup,all label:bug" style="text-decoration:none">🐛</a>
    </td>
  </tr>
</table>

> [!NOTE]
> Pompa powrotna DC Runner i pompa odpieniacza to ten sam sprzęt z różnymi głowicami: ten sam firmware, ten sam klucz produktu Gizwits, identyczne encje. Integracja rozróżnia je za pomocą wyboru **Rola pompy**, a karta podąża za tą rolą.

# Spis treści

- [Instalacja](#instalacja)
- [Konfiguracja](#konfiguracja)
- [ReefATO+](https://github.com/Elwinmage/ha-reef-card/blob/main/doc/pl/reefato.pl.md#reefato)
- [ReefControl](https://github.com/Elwinmage/ha-reef-card/blob/main/doc/pl/reefcontrol.pl.md#reefcontrol)
- [ReefControl-Power](https://github.com/Elwinmage/ha-reef-card/blob/main/doc/pl/reefcontrol-power.pl.md#reefcontrol-power)
- [ReefDose](https://github.com/Elwinmage/ha-reef-card/blob/main/doc/pl/reefdose.pl.md#reefdose)
- [ReefLED](https://github.com/Elwinmage/ha-reef-card/blob/main/doc/pl/reefled.pl.md#reefled)
- [ReefMat](https://github.com/Elwinmage/ha-reef-card/blob/main/doc/pl/reefmat.pl.md#reefmat)
- [ReefRun](https://github.com/Elwinmage/ha-reef-card/blob/main/doc/pl/reefrun.pl.md#reefrun)
- [ReefWave](https://github.com/Elwinmage/ha-reef-card/blob/main/doc/pl/reefwave.pl.md#reefwave)
- [Aqua Medic](https://github.com/Elwinmage/ha-reef-card/blob/main/doc/pl/aquamedic.pl.md#aqua-medic)
- [Konserwacja](https://github.com/Elwinmage/ha-reef-card/blob/main/doc/pl/maintenance.pl.md#konserwacja)
- [Zasilanie awaryjne](https://github.com/Elwinmage/ha-reef-card/blob/main/doc/pl/energybackup.pl.md#zasilanie-awaryjne)
- [FAQ](#faq)

# Instalacja

## Bezpośrednia instalacja

Kliknij tutaj, aby przejść bezpośrednio do repozytorium w HACS i kliknij „Pobierz": [![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=Elwinmage&repository=ha-reef-card&category=plugin)

## Wyszukaj w HACS

Lub wyszukaj «reef-card» w HACS.

<p align="center">
<img src="../img/hacs_search.png" alt="Image">
</p>

# Konfiguracja

Bez parametru `device` karta automatycznie wykrywa wszystkie urządzenia ReefBeat i pozwala wybrać żądane.

Aby usunąć wybór urządzenia i wymusić konkretne, ustaw parametr `device` na nazwę swojego urządzenia.

Edytor karty zapisuje tam stały identyfikator urządzenia (jego identyfikator sprzętowy) i przechowuje opcje każdego urządzenia pod tym samym identyfikatorem: zmiana nazwy urządzenia w Home Assistant niczego nie usuwa. Konfiguracja zapisana z nazwą urządzenia nadal działa i przechodzi na identyfikator przy najbliższej zmianie w edytorze.

<table>
  <tr>
<td><img src="../img/card_rsdose4_config_2.png"/></td>
<td><img src="../img/card_rsdose4_config.png"/></td>
    </tr>
</table>

# FAQ

---

[buymecoffee]: https://paypal.me/Elwinmage
[buymecoffeebadge]: https://img.shields.io/badge/buy%20me%20a%20coffee-donate-yellow.svg?style=flat-square
