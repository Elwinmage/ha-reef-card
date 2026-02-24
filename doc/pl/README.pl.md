<!-- [![hacs_badge](https://img.shields.io/badge/HACS-Default-41BDF5.svg?style=flat-square)](https://github.com/hacs/default) -->

[![GH-release](https://img.shields.io/github/v/release/Elwinmage/ha-reef-card.svg?style=flat-square)](https://github.com/Elwinmage/ha-reef-card/releases)
[![GH-last-commit](https://img.shields.io/github/last-commit/Elwinmage/ha-reef-card.svg?style=flat-square)](https://github.com/Elwinmage/ha-reef-card/commits/main)

[![GitHub Clones](https://img.shields.io/badge/dynamic/json?color=success&label=Clone&query=count&url=https://gist.githubusercontent.com/Elwinmage/dd3b205383103c2e65a7f516003ecbf6/raw/clone.json&logo=github)](https://github.com/MShawon/github-clone-count-badge)
[![GH-code-size](https://img.shields.io/github/languages/code-size/Elwinmage/ha-reef-card.svg?color=red&style=flat-square)](https://github.com/Elwinmage/ha-reef-card)
[![BuyMeCoffee][buymecoffeebadge]][buymecoffee]

> [!NOTE]
> Wszelka pomoc jest mile widziana, nie wahaj się [skontaktować ze mną](https://github.com/Elwinmage/ha-reef-card/discussions/1).

# Obsługiwane języki : [<img src="https://flagicons.lipis.dev/flags/4x3/fr.svg" style="width: 5%;"/>](../fr/README.fr.md) [<img src="https://flagicons.lipis.dev/flags/4x3/gb.svg" style="width: 5%"/>](../../README.md) [<img src="https://flagicons.lipis.dev/flags/4x3/es.svg" style="width: 5%"/>](../es/README.es.md) [<img src="https://flagicons.lipis.dev/flags/4x3/pt.svg" style="width: 5%"/>](../pt/README.pt.md) [<img src="https://flagicons.lipis.dev/flags/4x3/de.svg" style="width: 5%"/>](../de/README.de.md) [<img src="https://flagicons.lipis.dev/flags/4x3/it.svg" style="width: 5%"/>](../it/README.it.md) [<img src="https://flagicons.lipis.dev/flags/4x3/pl.svg" style="width: 5%"/>](README.pl.md)

<!-- Vous souhaitez aider à la traduction, suivez ce [guide](https://github.com/Elwinmage/ha-reef-card/blob/main/doc/TRANSLATION.md). -->

Twój język nie jest jeszcze obsługiwany i chcesz pomóc w tłumaczeniu? Postępuj zgodnie z tym [przewodnikiem](https://github.com/Elwinmage/ha-reef-card/blob/main/doc/TRANSLATION.md).

# Prezentacja

**Reef card** dla Home Assistant pomaga zarządzać akwarium rafowym.

W połączeniu z [ha-reefbeat-component](https://github.com/Elwinmage/ha-reefbeat-component) automatycznie obsługuje urządzenia Redsea (ReefBeat).

> [!NOTE]
> Jeśli masz urządzenia spoza marki Redsea i chcesz, aby były obsługiwane, możesz zgłosić prośbę [tutaj](https://github.com/Elwinmage/ha-reef-card/discussions/2).

> [!TIP]
> Lista planowanych funkcji jest dostępna [tutaj](https://github.com/Elwinmage/ha-reef-card/issues?q=is%3Aissue%20state%3Aopen%20label%3Aenhancement)<br />
> Lista błędów jest dostępna [tutaj](https://github.com/Elwinmage/ha-reef-card/issues?q=is%3Aissue%20state%3Aopen%20label%3Abug)

# Zgodność

✅ Zaimplementowano ☑️ W trakcie ❌ Zaplanowano

<table>
  <th>
    <td ><b>Model</b></td>
    <td colspan="2"><b>Status</b></td>
    <td><b>Issues</b>  <br/>📆(Zaplanowano) <br/> 🐛(Błędy)</td>
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
    <td>RSSENSE<br /> Jeśli go posiadasz, możesz skontaktować się ze mną <a href="https://github.com/Elwinmage/ha-reefbeat-component/discussions/8">tutaj</a>, a dodam jego obsługę.</td><td>❌</td>
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
    <td>☑️</td>
    <td rowspan="3" width="200px"><img src="https://raw.githubusercontent.com/Elwinmage/ha-reefbeat-component/main/doc/img/RSMAT.png"/></td>
    <td rowspan="3">
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rsmat,all label:enhancement" style="text-decoration:none">📆</a>
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rsmat,all label:bug" style="text-decoration:none">🐛</a>
    </td>
  </tr>
  <tr>
    <td>RSMAT500</td>
    <td>☑️</td>
  </tr>
  <tr>
    <td>RSMAT1200</td>
    <td>☑️</td>
  </tr>
  <tr>
    <td><a href="#reefrun">ReefRun</a></td>
    <td>RSRUN</td><td>❌</td>
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

# Spis treści

- [Instalacja](https://github.com/Elwinmage/ha-reef-card/#installation)
- [Konfiguracja](https://github.com/Elwinmage/ha-reef-card/#configuration)
- [ReefATO+](https://github.com/Elwinmage/ha-reef-card/#reefato)
- [ReefControl](https://github.com/Elwinmage/ha-reef-card/#reefcontrol)
- [ReefDose](https://github.com/Elwinmage/ha-reef-card/#reefdose)
- [ReefLED](https://github.com/Elwinmage/ha-reef-card/#reefled)
- [ReefMat](https://github.com/Elwinmage/ha-reef-card/#reefmat)
- [ReefRun](https://github.com/Elwinmage/ha-reef-card/#reefrun)
- [ReefWave](https://github.com/Elwinmage/ha-reef-card/#reefwave)
- [FAQ](https://github.com/Elwinmage/ha-reef-card/#faq)

# Instalacja

## Bezpośrednia instalacja

Kliknij tutaj, aby przejść bezpośrednio do repozytorium w HACS i kliknij „Pobierz":  [![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=Elwinmage&repository=ha-reef-card&category=plugin)

## Wyszukaj w HACS
Lub wyszukaj «reef-card» w HACS.

<p align="center">
<img src="../img/hacs_search.png" alt="Image">
</p>

# Konfiguracja

Bez parametru `device` karta automatycznie wykrywa wszystkie urządzenia ReefBeat i pozwala wybrać żądane.

Aby usunąć wybór urządzenia i wymusić konkretne, ustaw parametr `device` na nazwę swojego urządzenia.

<table>
  <tr>
<td><img src="../img/card_rsdose4_config_2.png"/></td>
<td><img src="../img/card_rsdose4_config.png"/></td>
    </tr>
</table>

# ReefATO

Zaplanowano.
  
Chcesz, żeby było obsługiwane szybciej? Zagłosuj [tutaj](https://github.com/Elwinmage/ha-reef-card/discussions/22).

# ReefControl

Zaplanowano.

Chcesz, żeby było obsługiwane szybciej? Zagłosuj [tutaj](https://github.com/Elwinmage/ha-reef-card/discussions/22).

# ReefDose

ReefDose z ha-reef-card w akcji:

[![Obejrzyj wideo](https://img.youtube.com/vi/Qee5LH0T9wQ/0.jpg)](https://www.youtube.com/watch?v=Qee5LH0T9wQ)


Karta ReefDose jest podzielona na 6 stref:

 1. Konfiguracja/Informacje WiFi
 2. Stany
 3. Dozowanie Manualne
 4. Konfiguracja i harmonogram głowic
 5. Zarządzanie suplementami
 6. Kolejka przyszłych dawek

<img src="../img/rsdose/rsdose4_ex1.png"/>

## Konfiguracja/Informacje WiFi
<img src="../img/rsdose/zone_1.png"/>

***

<span >Kliknij ikonę <img src="../img/rsdose/cog_icon.png" width="30" />, aby zarządzać ogólną konfiguracją ReefDose.</span>

<img src="../img/rsdose/zone_1_dialog_config.png"/> 

<span>Kliknij ikonę <img width="30px" src="../img/rsdose/wifi_icon.png"/>, aby zarządzać ustawieniami sieciowymi.</span>

<img src="../img/rsdose/zone_1_dialog_wifi.png"/> 

## Stany

 <img src="../img/rsdose/zone_2.png"/>

***
<span>Przełącznik konserwacji <img width="30px" src="../img/rsdose/zone_2_maintenance.png"/> umożliwia przejście do trybu konserwacji.</span>

 <img  src="../img/rsdose/maintenance_view.png"/>

<span>Przełącznik wł./wył. <img width="30px" src="../img/rsdose/zone_2_off.png"/> umożliwia przełączanie między stanami włączenia i wyłączenia ReefDose.</span>

 <img  src="../img/rsdose/off_view.png"/>


## Dozowanie Manualne

<img src="../img/rsdose/zone_3.png"/>

***
<span>Przycisk <img src="../img/rsdose/zone_3_manula_config_button.png"/> pokazuje domyślną dawkę manualną dla tej głowicy. Kliknięcie otwiera okno konfiguracji tego dozowania.</span>

<img src="../img/rsdose/zone_3_dialog_manual_dose_without.png"/>

Możesz dodać skróty używając edytora karty:

<img src="../img/rsdose/editor.png"/>

Na przykład głowica 1 proponuje jako skróty wartości 2, 5 i 10 mL.

Te wartości pojawią się na górze okna dialogowego. Kliknięcie tych skrótów wyśle polecenie dozowania zdefiniowanej wartości.

<img src="../img/rsdose/zone_3_dialog_manual_dose.png"/>

<span>Naciśnięcie przycisku dawki manualnej: <img src="../img/rsdose/zone_3_manual_button.png"/> wyśle polecenie dawki z domyślną wartością widoczną tuż powyżej: <img src="../img/rsdose/zone_3_manual_dose.png"/>, czyli 10 mL w tym przykładzie.
</span>


## Konfiguracja i harmonogram głowic

 <img src="../img/rsdose/zone_4.png"/>

***
Ta strefa pozwala wizualizować bieżące programowanie głowic i je zmieniać.
- Kolorowy pierścień kołowy wskazuje procent już wydanej dziennej dawki.
- Żółta liczba na górze wskazuje skumulowaną dzienną dawkę manualną.
- Środkowa część wskazuje wydaną objętość w stosunku do całkowitej zaprogramowanej dziennej objętości.
- Niebieska dolna część wskazuje liczbę wydanych dawek w stosunku do całkowitej liczby dawek dziennych (przykład: 14/24 dla niebieskiego, bo jest to programowanie godzinowe, a zrzut ekranu był zrobiony o 14:15). Wartości dla fioletu i zieleni wskazują 0/0, ponieważ te dawki mają być wydane o 8:00, ale integracja została uruchomiona po 8:00, więc dzisiaj nie będzie żadnych dawek.
- Długie kliknięcie na jedną z 4 głowic przełączy ją między stanem włączenia a wyłączenia.
- Kliknięcie na głowicę otworzy okno programowania.
  Z tego okna możesz uruchomić napełnianie, skalibrować głowicę, zmienić dawkę dzienną i jej harmonogram. Nie zapomnij zapisać programowania przed wyjściem.
  
  <img src="../img/rsdose/zone_4_dialog_schedule.png"/>
   

## Zarządzanie suplementami

 <img src="../img/rsdose/zone_5.png"/>

***
Ta strefa pozwala zarządzać suplementami.
Jeśli suplement jest już zadeklarowany, kliknięcie na niego otworzy okno konfiguracji, gdzie będzie można:
- Usunąć suplement (ikona kosza w prawym górnym rogu)
- Wskazać całkowitą objętość pojemnika
- Wskazać rzeczywistą objętość suplementu
- Zdecydować, czy chcesz śledzić pozostałą objętość. Kliknięcie na skróty na górze aktywuje kontrolę i ustawi wartości domyślne z pełnym pojemnikiem.
- Zmienić nazwę wyświetlaną suplementu.

 <img src="../img/rsdose/zone_5_dialog_container.png"/>


Jeśli żaden suplement nie jest powiązany z głowicą, możesz dodać jeden klikając na pojemnik z '+' (głowica 4 w naszym przykładzie).

<img src="../img/rsdose/zone_5_add_container.png"/>

Następnie postępuj zgodnie z instrukcjami:

<img src="../img/rsdose/zone_5_dialog_add.png"/>

### Suplementy

Oto lista obsługiwanych obrazów suplementów, pogrupowanych według marki. Jeśli Twój wyświetla ❌, możesz poprosić o jego dodanie [tutaj](https://github.com/Elwinmage/ha-reef-card/discussions/25).

<details>
<summary><b>ATI &nbsp; <sup>0/2 🖼️</sup></b></summary>

<table>
<tr><td>❌</td><td colspan='2'>Essential Pro 1</td></tr>
<tr><td>❌</td><td colspan='2'>Essential Pro 2</td></tr>
</table>
</details>

<details>
<summary><b>Aqua Forest &nbsp; <sup>0/9 🖼️</sup></b></summary>

<table>
<tr><td>❌</td><td colspan='2'>Ca Plus</td></tr>
<tr><td>❌</td><td colspan='2'>Calcium </td></tr>
<tr><td>❌</td><td colspan='2'>Component 1+</td></tr>
<tr><td>❌</td><td colspan='2'>Component 2+</td></tr>
<tr><td>❌</td><td colspan='2'>Component 3+</td></tr>
<tr><td>❌</td><td colspan='2'>KH Buffer</td></tr>
<tr><td>❌</td><td colspan='2'>KH Plus</td></tr>
<tr><td>❌</td><td colspan='2'>Magnesium</td></tr>
<tr><td>❌</td><td colspan='2'>Mg Plus</td></tr>
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
<summary><b>Quantum &nbsp; <sup>0/7 🖼️</sup></b></summary>

<table>
<tr><td>❌</td><td colspan='2'>Aragonite A</td></tr>
<tr><td>❌</td><td colspan='2'>Aragonite B</td></tr>
<tr><td>❌</td><td colspan='2'>Aragonite C</td></tr>
<tr><td>❌</td><td colspan='2'>Bio Kalium</td></tr>
<tr><td>❌</td><td colspan='2'>Bio Metals</td></tr>
<tr><td>❌</td><td colspan='2'>Bio enhance</td></tr>
<tr><td>❌</td><td colspan='2'>Gbio Gen</td></tr>
</table>
</details>

<details>
<summary><b>Red Sea &nbsp; <sup>0/13 🖼️</sup></b></summary>

<table>
<tr><td>❌</td><td colspan='2'>Bio Active (Colors D)</td></tr>
<tr><td>❌</td><td colspan='2'>Calcium (Foundation A)</td></tr>
<tr><td>❌</td><td colspan='2'>Calcium (Powder)</td></tr>
<tr><td>❌</td><td colspan='2'>Iodine (Colors A)</td></tr>
<tr><td>❌</td><td colspan='2'>Iron (Colors C)</td></tr>
<tr><td>❌</td><td colspan='2'>KH/Alkalinity (Foundation B)</td></tr>
<tr><td>❌</td><td colspan='2'>KH/Alkalinity (Powder)</td></tr>
<tr><td>❌</td><td colspan='2'>Magnesium (Foundation C)</td></tr>
<tr><td>❌</td><td colspan='2'>Magnesium (Powder)</td></tr>
<tr><td>❌</td><td colspan='2'>NO3PO4-X</td></tr>
<tr><td>❌</td><td colspan='2'>Potassium (Colors B)</td></tr>
<tr><td>❌</td><td colspan='2'>Reef Energy Plus</td></tr>
<tr><td>❌</td><td colspan='2'>ReefCare Program</td></tr>
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
<summary><b>Tropic Marin &nbsp; <sup>0/14 🖼️</sup></b></summary>

<table>
<tr><td>❌</td><td colspan='2'>A Element</td></tr>
<tr><td>❌</td><td colspan='2'>All-For-Reef</td></tr>
<tr><td>❌</td><td colspan='2'>Amino Organic</td></tr>
<tr><td>❌</td><td colspan='2'>Balling A</td></tr>
<tr><td>❌</td><td colspan='2'>Balling B</td></tr>
<tr><td>❌</td><td colspan='2'>Balling C</td></tr>
<tr><td>❌</td><td colspan='2'>Bio-Magnesium</td></tr>
<tr><td>❌</td><td colspan='2'>Carbo Calcium</td></tr>
<tr><td>❌</td><td colspan='2'>Elimi-NP</td></tr>
<tr><td>❌</td><td colspan='2'>K Element</td></tr>
<tr><td>❌</td><td colspan='2'>Liquid Buffer</td></tr>
<tr><td>❌</td><td colspan='2'>NP-Bacto-Balance</td></tr>
<tr><td>❌</td><td colspan='2'>Plus-NP</td></tr>
<tr><td>❌</td><td colspan='2'>Potassium</td></tr>
</table>
</details>

## Kolejka przyszłych dawek

<img src="../img/rsdose/zone_6.png"/>

***
Ta strefa po prostu wyświetla listę przyszłych dawek Twojego urządzenia, czy to automatycznych czy manualnych (przesunięty harmonogram ze względu na zdefiniowane oczekiwanie między dwoma różnymi suplementami).

# ReefLed

Zaplanowano.

Chcesz, żeby było obsługiwane szybciej? Zagłosuj [tutaj](https://github.com/Elwinmage/ha-reef-card/discussions/22).

# ReefMat

Zaplanowano.

Chcesz, żeby było obsługiwane szybciej? Zagłosuj [tutaj](https://github.com/Elwinmage/ha-reef-card/discussions/22).

# ReefRun

Zaplanowano.

Chcesz, żeby było obsługiwane szybciej? Zagłosuj [tutaj](https://github.com/Elwinmage/ha-reef-card/discussions/22).

# ReefWave

Zaplanowano.

Chcesz, żeby było obsługiwane szybciej? Zagłosuj [tutaj](https://github.com/Elwinmage/ha-reef-card/discussions/22).

# FAQ

---

[buymecoffee]: https://paypal.me/Elwinmage
[buymecoffeebadge]: https://img.shields.io/badge/buy%20me%20a%20coffee-donate-yellow.svg?style=flat-square
