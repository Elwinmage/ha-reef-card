[← Powrót do strony głównej](README.pl.md)

# ReefATO

ReefATO+ z ha-reef-card w akcji:

[![Obejrzyj film](https://img.youtube.com/vi/2R0DHp2eqT4/0.jpg)](https://www.youtube.com/watch?v=2R0DHp2eqT4)

Karta ReefATO+ pozwala wizualnie sterować sterownikiem RSATO+, zbiornikiem wody
osmotycznej z pompą, sondą poziomu przypiętą do szyby i sondą zalania leżącą na
podłodze.

Sonda poziomu ReefATO+ jest rysowana zawsze. **Pompa** i **sonda zalania** są
opcjonalne. To, czego urządzenie nie zgłasza, nie jest w ogóle rysowane, a
zależne od tego przyciski znikają razem z nim: ReefATO+ bez sondy zalania
pokazuje kartę bez sondy zalania, a nie sondę wyszarzoną.

<img src="../img/rsato/rsato_zones.png"/>

Karta jest podzielona na 7 stref:

1. Sterownik: tryb pracy, zasilanie, tryb serwisowy, konfiguracja, Wifi i automatyczne uzupełnianie
2. Ustawienia akcesoriów: pompa uzupełniająca, sonda zalania, sonda poziomu
3. Zbiornik wody osmotycznej: przyciski napełniania, pozostała objętość i zapas
4. Brzęczyk
5. Sonda zalania
6. Akwarium: poziom wody, temperatura i dzienne zużycie
7. Ostatni komunikat i ostatni alarm

## Sterownik

<img src="../img/rsato/zone_1.png"/>

---

Tekst na froncie sterownika to **tryb pracy** zgłaszany przez urządzenie (Auto,
Ręczny, Zalanie…), przetłumaczony na język Home Assistant.

<span>Przełącznik <img src="../img/mdi/mdi_power-plug.png" width="20"/> włącza i wyłącza ReefATO+.</span>

<img src="../img/rsato/off_mode.png" width="50%"/>

<span>Przełącznik <img src="../img/mdi/mdi_account-wrench.png" width="20"/> przełącza w tryb serwisowy.</span>

<img src="../img/rsato/maintenance.png" width="50%"/>

<span>Kliknij ikonę <img src="../img/rsdose/cog_icon.png" width="30"/>, aby zarządzać ogólną konfiguracją ReefATO+: odświeżyć ustawienia lub pobierane dane, zresetować urządzenie, zaktualizować jego firmware.</span>

<img src="../img/rsato/zone_1_dialog_config.png" width="50%"/>

<span>Kliknij ikonę <img src="../img/mdi/wifi_icon.png" width="30"/>, aby zarządzać ustawieniami sieci.</span>

<img src="../img/rsato/zone_1_dialog_wifi.png" width="50%"/>

<span>Przełącznik <img src="../img/mdi/mdi_waves-arrow-up.png" width="20"/> w drugim rzędzie włącza lub wyłącza **automatyczne uzupełnianie**. Wyłączone, urządzenie nigdy nie napełnia samo z siebie i na pompę działają już tylko przyciski ze strefy 3. Jest ukryty, gdy nie sparowano żadnej pompy.</span>

## Ustawienia akcesoriów

<img src="../img/rsato/zone_2.png"/>

---

Trzy ikony odpowiadają trzem gniazdom na panelu przednim, w tej samej kolejności:
od lewej do prawej **pompa uzupełniająca**, **sonda zalania** i **sonda
poziomu**. Każda otwiera okno dialogowe poświęcone temu akcesorium. Ikony pompy i
sondy zalania znikają razem z akcesorium, gdy ich gniazdo nie jest używane.

<span>Ikona pompy <img src="../img/mdi/mdi_pump.png" width="30"/> pokazuje stan pracy, zmierzone zużycie i wydajność, trzy progi prądowe, według których firmware rozpoznaje pracę na sucho lub zablokowanie, oraz to, co wywołało ostatnie napełnianie.</span>

<img src="../img/rsato/zone_2_dialog_pump.png" width="50%"/>

<span>Ikona sondy zalania <img src="../img/mdi/mdi_pipe-leak.png" width="30"/> pokazuje, czy sonda jest podłączona, czy jest uzbrojona, werdykt sucho/mokro wraz z surowym odczytem, który za nim stoi, oraz brzęczyk sterowany przez tę sondę.</span>

<img src="../img/rsato/zone_2_dialog_leak.png" width="50%"/>

<span>Ikona sondy poziomu <img src="../img/mdi/mdi_hydraulic-oil-level.png" width="30"/> pokazuje najpierw kondycję sondy — podłączona, skalibrowana, do sprawdzenia, błąd — bo nieskalibrowana lub zabrudzona sonda odbiera wartość wszystkim kolejnym odczytom. Potem sam poziom, dwie elektrody, które go wyznaczają, czujnik temperatury w tej samej obudowie oraz oznaczenie i daty serwisu wkładu.</span>

<img src="../img/rsato/zone_2_dialog_ato_sensor.png" width="50%"/>

## Zbiornik wody osmotycznej

<img src="../img/rsato/zone_3.png"/>

---

Ta strefa to zbiornik, z którego czerpie uzupełnianie, oraz trzy przyciski
sterujące jego pompą ręcznie:

<table>
  <tr>
    <td align="center"><img src="../img/mdi/mdi_water-pump.png" width="40"/><br/><b>Napełnij</b><br/>Uruchamia ręczne napełnianie</td>
    <td align="center"><img src="../img/mdi/mdi_water-pump-off.png" width="40"/><br/><b>Zatrzymaj</b><br/>Przerywa trwające napełnianie</td>
    <td align="center"><img src="../img/mdi/mdi_play-circle-outline.png" width="40"/><br/><b>Wznów</b><br/>Ponownie włącza pompę</td>
  </tr>
</table>

Ta część pokazuje poziom zapasu wody, wyliczony z zadeklarowanej pojemności
zbiornika i rzeczywistej wartości. Pusty zbiornik wciąż pokazuje linię wody — tę,
której pompa nie jest w stanie zassać. Poniżej 10 % woda miga, sygnalizując, że
zbiornik wkrótce się opróżni.

Kliknięcie wody otwiera okno zbiornika, w którym można edytować pojemność:

<img src="../img/rsato/zone_3_dialog_ato_tank.png" width="50%"/>

Liczba w lewym dolnym rogu zbiornika to **zapas**: liczba dni pozostałych do jego
opróżnienia, wyliczona przez integrację ze średniego zużycia dziennego.
Kliknięcie jej otwiera kartę informacyjną.

W trakcie napełniania woda wypływa z wylotu nad sumpem.

<img src="../img/rsato/zone_3_filling.png"/>

## Brzęczyk

<img src="../img/mdi/mdi_bell-ring_red.png" width="40"/>

---

<span>Dzwonek <img src="../img/mdi/mdi_bell-ring_red.png" width="20"/> <img src="../img/mdi/mdi_bell-off_red.png" width="20"/> odzwierciedla ustawienie brzęczyka w urządzeniu i szarzeje, gdy jest on wyłączony.</span>

Kliknięcie otwiera okno brzęczyka: samo ustawienie, informację, czy brzęczyk
właśnie dzwoni, oraz stan sondy zalania jako kontekst.

<img src="../img/rsato/zone_4_dialog_buzzer.png" width="50%"/>

**Długie przytrzymanie** przełącza brzęczyk bezpośrednio. Oba gesty są celowo
rozdzielone: wyciszenie alarmu to ustawienie bezpieczeństwa, a nie coś, co robi
się przypadkiem, sięgając po szczegóły.

> [!NOTE]
> Brzęczyk to nie tylko alarm zalania: urządzenie uruchamia go także przy awariach
> pompy, więc pozostaje dostępny w ReefATO+ bez sondy zalania. Ikona jest ukryta
> tylko w tych wersjach integracji, które nie udostępniają jeszcze tego
> ustawienia.

## Sonda zalania

<img src="../img/rsato/zone_5.png"/>

---

Sonda jest rysowana tylko wtedy, gdy jest fizycznie podłączona. Podłączona, ale
wyłączona w aplikacji, jest wyszarzona: jest na miejscu, ale niczego nie wykrywa.

Gdy woda zostanie wykryta, sonda miga, a u dołu obrazu rozlewa się kałuża.

<table>
  <tr>
    <th align="center">Zalanie od akwarium</th>
    <th align="center">Zalanie od zbiornika osmotycznego</th>
    <th align="center">Zalanie o nieznanym źródle</th>
  </tr>
  <tr>
    <td align="center"><img src="../img/rsato/zone_5_leak_aquarium.png"/></td>
    <td align="center"><img src="../img/rsato/zone_5_leak_rodi.png"/></td>
    <td align="center"><img src="../img/rsato/zone_5_leak_unknown.png"/></td>
  </tr>
</table>

## Akwarium

<img src="../img/rsato/zone_6.png"/>

---

Poziom wody w tej części pokazuje stan wykrywania sondy ATO.

| Stan            | Znaczenie                                               |
| --------------- | ------------------------------------------------------- |
| Poniżej         | Powierzchnia jest pod sondą: uzupełnianie nie nadąża    |
| Poziom żądany 1 | Pierwsza kreska uzupełniania                            |
| Poziom żądany 2 | Druga kreska uzupełniania                               |
| Powyżej         | Powierzchnia jest nad sondą: akwarium jest przepełnione |

Oba skrajne stany są nieprawidłowe, więc **Poniżej** i **Powyżej** powodują
miganie wody. Sonda w stanie błędu albo encja, która jeszcze nic nie zgłosiła,
nie ma żadnej wysokości: karta rysuje wtedy znak braku odczytu zamiast pustego
akwarium.

<table>
  <tr>
    <th align="center">Poniżej</th>
    <th align="center">Poziom żądany 1</th>
    <th align="center">Poziom żądany 2</th>
    <th align="center">Powyżej</th>
    <th align="center">Brak odczytu</th>
  </tr>
  <tr>
    <td align="center"><img src="../img/rsato/zone_6_water_level_below.png"/></td>
    <td align="center"><img src="../img/rsato/zone_6_water_level_1.png"/></td>
    <td align="center"><img src="../img/rsato/zone_6_water_level_2.png"/></td>
    <td align="center"><img src="../img/rsato/zone_6_water_level_above.png"/></td>
    <td align="center"><img src="../img/rsato/zone_6_water_level_error.png"/></td>
  </tr>
</table>

Temperatura na dole akwarium pochodzi z czujnika wbudowanego w sondę poziomu i
jest zgłaszana tylko wtedy, gdy jest on włączony w urządzeniu.

Wykres w rogu to **zużycie dnia**: objętość uzupełniona od północy, wypełniona na
pomarańczowo, na tle kroczącej średniej dziennej na czerwono. Okno jest przypięte
do doby kalendarzowej, a nie do kroczących 24 godzin, ponieważ licznik zeruje się
o północy.

Kliknięcie wykresu otwiera okno zużycia, tę samą historię z wypisanymi liczbami:
napełnienia i objętość, zmierzone dziś, jako średnia dzienna i jako suma od
początku, plus to, co zostało w zbiorniku, żeby je zasilić.

<img src="../img/rsato/zone_6_dialog_usage.png" width="50%"/>

## Usterki

Karta nie ma osobnej kontrolki ostrzegawczej: miga to, co jest uszkodzone, pod
jasnoczerwonym odcieniem.

| Migający element | Co zgłasza urządzenie                                                                                    |
| ---------------- | -------------------------------------------------------------------------------------------------------- |
| Pompa            | Awaria, zablokowana pompa, zbyt długie napełnianie, pusty zbiornik lub brak sondy poziomu                |
| Sonda zalania    | Wykryto wodę, po stronie osmozy albo po stronie akwarium                                                 |
| Poziom wody      | Powierzchnia jest poniżej lub powyżej sondy                                                              |
| Cały obraz       | Sonda poziomu prosi o sprawdzenie albo przestała mierzyć — każdy pokazany poziom staje się niewiarygodny |

Pompa zgłoszona jako nieobecna nie jest usterką: pompa, przyciski napełniania,
zbiornik i wykres zużycia po prostu nie są rysowane.

## Komunikaty

<img src="../img/rsato/zone_7.png"/>

---

Ta strefa pokazuje ostatnie komunikaty systemowe ReefATO+. Ma dwie linie:

- Szara linia pokazuje **ostatni komunikat**.
- Różowa linia pokazuje **ostatni alarm**, poprzedzony symbolem ⚠.

Kliknięcie ikony <img src="../img/mdi/mdi_delete-empty.png" width="20"/> kasuje odpowiedni komunikat.

Te linie można ukryć z poziomu edytora karty.

## Edytor karty

<img src="../img/rsato/editor.png" width="50%"/>

---

Poza dwiema liniami komunikatów ReefATO+ ma trzy opcje. Istnieją z myślą o
obiegu uzupełniania, do którego urządzenie nie zostało zaprojektowane: o osmozie
podłączonej wprost do sumpa, z zaworem sterowanym przez Home Assistant zamiast
przez pompę Red Sea.

### Nieograniczony zbiornik wody osmotycznej

Domyślnie wyłączona. Osmoza uzupełniająca na bieżąco nie ma pojemnika, więc nic
nie może się skończyć — a wszystko, co karta mówi o zbiorniku, dotyczy bańki,
której nie ma.

Po włączeniu znikają procent na zbiorniku i okno pod nim, zapas zmienia się w ∞,
a ikona ustawień pompy i przycisk wznowienia zostają ukryte: ciągłe zasilanie nie
ma cyklu napełniania, który można by oddać urządzeniu. Woda, przyciski
napełniania i wykres zużycia pozostają.

### Encja podanej objętości

Przełącznik i wybór encji. Po włączeniu pomarańczowa krzywa dziennego wykresu
jest odczytywana z Twojej encji — przepływomierza na linii osmotycznej — zamiast
z licznika urządzenia. Czerwona średnia krocząca pozostaje ta z urządzenia:
przenosi się tylko źródło objętości, a nie porównanie, na tle którego jest
rysowana.

To przełącznik włącza tę opcję, dzięki czemu encja pozostała po wcześniejszej
konfiguracji jest ignorowana, zamiast po cichu znów przejmować sterowanie.

### Encje napełniania i zatrzymania

Każdy z dwóch przycisków można powiązać z encją innej integracji, aby sterować
własnym zaworem. Usługa jest wyprowadzana z domeny encji, bo wybór encji już mówi,
o co chodzi:

| Domena encji              | Napełnij     | Zatrzymaj     |
| ------------------------- | ------------ | ------------- |
| `button`, `input_button`  | `press`      | `press`       |
| `switch`, `input_boolean` | `turn_on`    | `turn_off`    |
| `valve`                   | `open_valve` | `close_valve` |
| `script`                  | `turn_on`    | `turn_on`     |

Pojedynczy przełącznik to kompletne sterowanie: włączony napełnia, wyłączony
zatrzymuje. Zostaw drugi wybór pusty, a drugi przycisk użyje tej samej encji z
przeciwną usługą — tak samo działa `input_boolean` lub `valve`. Dwa przyciski
chwilowe trzeba wybrać osobno, bo naciśnięcie nie niesie kierunku.

Powiązany przycisk nie podąża też już za pompą Red Sea: pozostaje widoczny w
ReefATO+, który nie zgłasza żadnej pompy — po to właśnie się go wiąże.

Opcje są zapisywane pod modelem w postaci zgłaszanej przez Home Assistant:

```yaml
type: custom:reef-card
device: "123456789012" # stały identyfikator urządzenia (nazwa też działa)
conf:
  RSATO+:
    devices:
      "123456789012":
        name: MY-RSATO # tylko etykieta
        infinite_tank: true
        external_usage: true
        external_usage_entity: sensor.rodi_flow_meter
        fill_entity: switch.rodi_valve
        stop_fill_entity: "" # puste: powyższy przełącznik zatrzymuje go również
```

---

[← Powrót do strony głównej](README.pl.md)
