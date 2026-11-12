[← Powrót do strony głównej](README.pl.md)

# ReefDose

ReefDose z ha-reef-card w akcji:

[![Obejrzyj wideo](https://img.youtube.com/vi/Qee5LH0T9wQ/0.jpg)](https://www.youtube.com/watch?v=Qee5LH0T9wQ)

Karta ReefDose jest podzielona na 6 stref:

1.  Konfiguracja/Informacje WiFi
2.  Stany
3.  Dozowanie Manualne
4.  Konfiguracja i harmonogram głowic
5.  Zarządzanie suplementami
6.  Kolejka przyszłych dawek

<img src="../img/rsdose/rsdose4_ex1.png"/>

## Konfiguracja/Informacje WiFi

<img src="../img/rsdose/zone_1.png"/>

---

<span >Kliknij ikonę <img src="../img/rsdose/cog_icon.png" width="30" />, aby zarządzać ogólną konfiguracją ReefDose.</span>

<img src="../img/rsdose/zone_1_dialog_config.png"/>

<span>Kliknij ikonę <img width="30px" src="../img/rsdose/wifi_icon.png"/>, aby zarządzać ustawieniami sieciowymi.</span>

<img src="../img/rsdose/zone_1_dialog_wifi.png"/>

## Stany

 <img src="../img/rsdose/zone_2.png"/>

---

<span>Przełącznik konserwacji <img width="30px" src="../img/rsdose/zone_2_maintenance.png"/> umożliwia przejście do trybu konserwacji.</span>

 <img  src="../img/rsdose/maintenance_view.png"/>

<span>Przełącznik wł./wył. <img width="30px" src="../img/rsdose/zone_2_off.png"/> umożliwia przełączanie między stanami włączenia i wyłączenia ReefDose.</span>

 <img  src="../img/rsdose/off_view.png"/>

## Dozowanie Manualne

<img src="../img/rsdose/zone_3.png"/>

---

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

---

Ta strefa pozwala wizualizować bieżące programowanie głowic i je zmieniać.

- Kolorowy pierścień kołowy wskazuje procent już wydanej dziennej dawki.
- Żółta liczba na górze wskazuje skumulowaną dzienną dawkę manualną.
- Środkowa część wskazuje wydaną objętość w stosunku do całkowitej zaprogramowanej dziennej objętości.
- Niebieska dolna część wskazuje liczbę wydanych dawek w stosunku do całkowitej liczby dawek dziennych (przykład: 14/24 dla niebieskiego, bo jest to programowanie godzinowe, a zrzut ekranu był zrobiony o 14:15). Wartości dla fioletu i zieleni wskazują 0/0, ponieważ te dawki mają być wydane o 8:00, ale integracja została uruchomiona po 8:00, więc dzisiaj nie będzie żadnych dawek.
- Długie kliknięcie na jedną z 4 głowic przełączy ją między stanem włączenia a wyłączenia.
- Kliknięcie na głowicę otworzy okno programowania.
  Z tego okna możesz uruchomić napełnianie, skalibrować głowicę, zmienić dawkę dzienną i jej harmonogram. Nie zapomnij zapisać programowania przed wyjściem.

  <img src="../img/rsdose/zone_4_dialog_schedule.png"/>

### Regulacja dozowania

Konfiguracja głowicy zawiera **Regulację dozowania** [integracji redsea](https://github.com/Elwinmage/ha-reefbeat-component/blob/main/doc/pl/reefdose.pl.md#regulacja-dozowania):

- **Dozowanie wspomagane**: przycisk **Dozowanie wspomagane** otwiera okno z wykresem wyników testów, wpisywaniem nowego wyniku, proponowaną dawką do zastosowania lub odrzucenia oraz ustawieniami obliczeń. Nic nie trafia do dozownika, dopóki jej nie zastosujesz.

  <img src="../img/rsdose/assisted_dose_dialog.png" width="300"/> <img src="../img/rsdose/assisted_dose_settings.png" width="300"/>

  Okno pokazuje bieżącą dawkę (tylko do odczytu) tuż nad proponowaną. Wynik testu wpisuje się ręcznie lub odczytuje ze strzykawki zestawu: wybierz zestaw (Red Sea, Salifert, Colombo…) i wpisz odczyt odczynnika w mL, wynik zostanie obliczony. Przycisk **Wyniki testów** wyświetla wyniki, aby dodać wynik z wcześniejszą datą, poprawić go lub usunąć; wykres od razu się aktualizuje. Suplement, którego nie steruje żaden test (Red Sea NO3:PO4-X, pokarmy), nie oferuje dawkowania wspomaganego, a jego moc jest wyszarzona. Zastosowana dawka pojawia się w harmonogramie głowicy po powrocie do niego.

- **Solanka**: głowicą steruje wyłącznie Home Assistant, dawkami ręcznymi, więc jej konfiguracja pokazuje solankę zamiast harmonogramu: zasolenie z ostatniego tygodnia, stan i alarm, planowaną solankę, kontrolę refraktometrem i ustawienia. W widoku głównym pierścień i środkowa etykieta pokazują solankę dozowaną dziś względem planowanej, a dolna etykieta zasolenie.

  <img src="../img/rsdose/brine_head.png" width="300"/> <img src="../img/rsdose/brine_status.png" width="300"/> <img src="../img/rsdose/brine_settings.png" width="300"/>

### Historia dawek

Gdy dozownik jest w [trybie Poseidon](https://github.com/Elwinmage/ha-reefbeat-component/blob/main/doc/pl/poseidon.pl.md#tryb-poseidon), konfiguracja głowicy ma przycisk **Historia dawek**: dawki głowicy, od najnowszych, według dni, z początkiem, końcem, czasem trwania, objętością i typem (zaplanowana, ręczna, kompensacja). Ostatnie 24 h, 7 lub 31 dni albo wszystko, co zachowano, z łączną objętością okresu. Początek oznaczony „≈” jest szacowany na podstawie przepływu głowicy.

## Zarządzanie suplementami

 <img src="../img/rsdose/zone_5.png"/>

---

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

Oto lista obsługiwanych obrazów dla suplementów, pogrupowanych według marki. Jeśli Twój wyświetla ❌, możesz poprosić o jego dodanie [tutaj](https://github.com/Elwinmage/reeftech-catalog/issues/new?labels=supplement).

<details>
<summary><b>ATI &nbsp; <sup>2/2 🖼️</sup></b></summary>

<table>
<tr><td>✅</td><td>Essential Pro 1</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/ati-essential-pro-1/image.webp'/></td></tr>
<tr><td>✅</td><td>Essential Pro 2</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/ati-essential-pro-2/image.webp'/></td></tr>
</table>
</details>

<details>
<summary><b>Aqua Forest &nbsp; <sup>3/9 🖼️</sup></b></summary>

<table>
<tr><td>✅</td><td>Ca Plus</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/aqua-forest-ca-plus/image.webp'/></td></tr>
<tr><td>❌</td><td colspan='2'>Calcium </td></tr>
<tr><td>❌</td><td colspan='2'>Component 1+</td></tr>
<tr><td>❌</td><td colspan='2'>Component 2+</td></tr>
<tr><td>❌</td><td colspan='2'>Component 3+</td></tr>
<tr><td>❌</td><td colspan='2'>KH Buffer</td></tr>
<tr><td>✅</td><td>KH Plus</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/aqua-forest-kh-plus/image.webp'/></td></tr>
<tr><td>❌</td><td colspan='2'>Magnesium</td></tr>
<tr><td>✅</td><td>Mg Plus</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/aqua-forest-mg-plus/image.webp'/></td></tr>
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
<summary><b>DIY &nbsp; <sup>1/1 🖼️</sup></b></summary>

<table>
<tr><td>✅</td><td>Brine</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/diy-brine/image.webp'/></td></tr>
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
<tr><td>✅</td><td>Aragonite A</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/quantum-aragonite-a/image.webp'/></td></tr>
<tr><td>✅</td><td>Aragonite B</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/quantum-aragonite-b/image.webp'/></td></tr>
<tr><td>✅</td><td>Aragonite C</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/quantum-aragonite-c/image.webp'/></td></tr>
<tr><td>✅</td><td>Bio Kalium</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/quantum-bio-kalium/image.webp'/></td></tr>
<tr><td>✅</td><td>Bio Metals</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/quantum-bio-metals/image.webp'/></td></tr>
<tr><td>✅</td><td>Bio enhance</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/quantum-bio-enhance/image.webp'/></td></tr>
<tr><td>✅</td><td>Gbio Gen</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/quantum-gbio-gen/image.webp'/></td></tr>
</table>
</details>

<details>
<summary><b>Red Sea &nbsp; <sup>14/17 🖼️</sup></b></summary>

<table>
<tr><td>✅</td><td>Bio Active (Colors D)</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/red-sea-bio-active-colors-d/image.webp'/></td></tr>
<tr><td>✅</td><td>Calcium (Foundation A)</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/red-sea-calcium-foundation-a/image.webp'/></td></tr>
<tr><td>❌</td><td colspan='2'>Calcium (Powder)</td></tr>
<tr><td>✅</td><td>Iodine (Colors A)</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/red-sea-iodine-colors-a/image.webp'/></td></tr>
<tr><td>✅</td><td>Iron (Colors C)</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/red-sea-iron-colors-c/image.webp'/></td></tr>
<tr><td>✅</td><td>KH/Alkalinity (Foundation B)</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/red-sea-kh-alkalinity-foundation-b/image.webp'/></td></tr>
<tr><td>❌</td><td colspan='2'>KH/Alkalinity (Powder)</td></tr>
<tr><td>✅</td><td>Magnesium (Foundation C)</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/red-sea-magnesium-foundation-c/image.webp'/></td></tr>
<tr><td>❌</td><td colspan='2'>Magnesium (Powder)</td></tr>
<tr><td>✅</td><td>NO3PO4-X</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/red-sea-no3po4-x/image.webp'/></td></tr>
<tr><td>✅</td><td>Potassium (Colors B)</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/red-sea-potassium-colors-b/image.webp'/></td></tr>
<tr><td>✅</td><td>Reef Energy Plus</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/red-sea-reef-energy-plus/image.webp'/></td></tr>
<tr><td>✅</td><td>ReefCare Part 1: Calcium & Magnesium</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/red-sea-reefcare-part-1-calcium-magnesium/image.webp'/></td></tr>
<tr><td>✅</td><td>ReefCare Part 2: KH/Alkalinity &PH stabilizer</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/red-sea-reefcare-part-2-kh-alkalinity-ph-stabilizer/image.webp'/></td></tr>
<tr><td>✅</td><td>ReefCare Part 3: Iodine & Potassium</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/red-sea-reefcare-part-3-iodine-potassium/image.webp'/></td></tr>
<tr><td>✅</td><td>ReefCare Part 4: Iron & Bioactive elements</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/red-sea-reefcare-part-4-iron-bioactive-elements/image.webp'/></td></tr>
<tr><td>✅</td><td>ReefCare Program</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/red-sea-reefcare-program/image.webp'/></td></tr>
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
<tr><td>✅</td><td>All-For-Reef</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/tropic-marin-all-for-reef/image.webp'/></td></tr>
<tr><td>✅</td><td>Amino Organic</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/tropic-marin-amino-organic/image.webp'/></td></tr>
<tr><td>❌</td><td colspan='2'>Balling A</td></tr>
<tr><td>❌</td><td colspan='2'>Balling B</td></tr>
<tr><td>❌</td><td colspan='2'>Balling C</td></tr>
<tr><td>✅</td><td>Bio-Magnesium</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/tropic-marin-bio-magnesium/image.webp'/></td></tr>
<tr><td>✅</td><td>Carbo Calcium</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/tropic-marin-carbo-calcium/image.webp'/></td></tr>
<tr><td>❌</td><td colspan='2'>Elimi-NP</td></tr>
<tr><td>❌</td><td colspan='2'>K Element</td></tr>
<tr><td>❌</td><td colspan='2'>Liquid Buffer</td></tr>
<tr><td>✅</td><td>NP-Bacto-Balance</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/tropic-marin-np-bacto-balance/image.webp'/></td></tr>
<tr><td>❌</td><td colspan='2'>Plus-NP</td></tr>
<tr><td>✅</td><td>Potassium</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/tropic-marin-potassium/image.webp'/></td></tr>
</table>
</details>

<!-- supplements:end -->

---

[← Powrót do strony głównej](README.pl.md)
