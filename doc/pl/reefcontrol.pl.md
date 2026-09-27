[← Powrót do strony głównej](README.pl.md)

# ReefControl

ReefControl i ReefControl-Power z ha-reef-card w akcji:

[![Obejrzyj wideo](https://img.youtube.com/vi/VIDEO_ID/0.jpg)](https://www.youtube.com/watch?v=VIDEO_ID)

Karta ReefControl rysuje hub tak, jak jest podłączony: sondy ReefSense
zwisające z puszek rozszerzeń, porty 12V, pompę ATO, gdy port nią steruje, oraz
sparowany [ReefControl-Power](reefcontrol-power.pl.md#reefcontrol-power) nad nim.

Obsługiwane są oba modele. Pro przyjmuje do 7 sond (druga puszka rozszerzeń
jest rysowana, gdy tylko zostanie podłączona piąta sonda) i ma dwa porty 12V;
Lite przyjmuje 2 sondy i ma jeden port 12V.

<table>
  <tr>
    <th align="center">RSCONTROLPRO</th>
    <th align="center">RSCONTROLLITE</th>
  </tr>
  <tr>
    <td align="center"><img src="../img/rscontrol/rscontrolpro.png"/></td>
    <td align="center"><img src="../img/rscontrol/rscontrollite.png"/></td>
  </tr>
</table>

Dalsza część tej sekcji jest ilustrowana modelem Pro: wszystko działa tak samo
w modelu Lite.

<img src="../img/rscontrol/rscontrol_zones.png"/>

Karta jest podzielona na 7 stref:

1. Sterownik: zasilanie, tryb konserwacji, konfiguracja, Wifi i brzęczyk
2. Sparowane Power Center (ReefControl-Power)
3. Podsumowanie odczytów
4. Sondy
5. Porty 12V
6. ATO
7. Ostatni komunikat i ostatni alarm

## Sterownik

<img src="../img/rscontrol/zone_1.png"/>

---

Tekst na froncie huba to **tryb pracy** zgłaszany przez urządzenie (Auto,
Setup, Konserwacja…), przetłumaczony na język Home Assistant.

<span>Przełącznik <img src="../img/mdi/mdi_power-plug.png" width="20"/> włącza lub wyłącza ReefControl.</span>

<img src="../img/rscontrol/off_mode.png" width="50%"/>

Po wyłączeniu hub niczego nie mierzy ani nie steruje: karta zachowuje tylko jego
przełącznik i obrazy sprzętu. Sondy tracą wartości, paski i ustawienia, a
brzęczyk, podsumowanie, porty 12V i ikony konfiguracji są ukrywane.

<span>Przełącznik <img src="../img/mdi/mdi_account-wrench.png" width="20"/> włącza tryb konserwacji.</span>

<img src="../img/rscontrol/maintenance.png" width="50%"/>

<span>Kliknij ikonę <img src="../img/rsdose/cog_icon.png" width="30"/>, aby zarządzać ogólną konfiguracją ReefControl: odświeżyć ustawienia lub odczytane dane, zrestartować urządzenie, zaktualizować jego firmware, dostroić [fuzję temperatur](https://github.com/Elwinmage/ha-reefbeat-component/blob/main/doc/pl/reefcontrol.pl.md#scalanie-temperatury-z-wielu-sond), zobaczyć stan sieci i kabla oraz zarządzać parowaniem z ReefControl-Power.</span>

<img src="../img/rscontrol/zone_1_dialog_config.png" width="50%"/>

<span>Kliknij ikonę <img src="../img/mdi/wifi_icon.png" width="30"/>, aby zarządzać ustawieniami sieci.</span>

<img src="../img/rscontrol/zone_1_dialog_wifi.png" width="50%"/>

### Brzęczyk

<span>Dzwonek <img src="../img/mdi/mdi_bell-alert.png" width="20"/> znajduje się nad diodą stanu huba. Jest zielony, gdy brzęczyk milczy, czerwony i migający, gdy brzęczy, i pozostaje czerwony po wyciszeniu alarmu.</span>

Kliknięcie otwiera okno brzęczyka: co robi teraz i dlaczego, a następnie jego
dwa alarmy — alarm **zagrożenia** (odczyt poza zakresem) i alarm **zalania** —
każdy z własnym przełącznikiem, częstotliwością i wypełnieniem, opóźnieniem
alarmu zagrożenia oraz detektorem zalania.

<img src="../img/rscontrol/zone_1_dialog_buzzer.png" width="50%"/>

## Sparowane Power Center

<img src="../img/rscontrol/zone_2.png"/>

---

Gdy ReefControl-Power jest sparowany z hubem, jest rysowany nad nim, z 6 lub 8
gniazdami zależnie od modelu, połączony z hubem swoim kablem. Zasilone gniazdo
świeci lekką czerwoną maską.

Kliknięcie Power Center otwiera jego własną kartę (zobacz
[ReefControl-Power](reefcontrol-power.pl.md#reefcontrol-power)).

Gdy Power Center jest sparowane, ale nie odpowiada, miga pod lekkim czerwonym
odcieniem. Parowanie i rozparowanie odbywa się z okna konfiguracji sterownika.

## Podsumowanie

<img src="../img/rscontrol/zone_3.png"/>

---

Pasek między Power Center a sondami podsumowuje wszystkie odczyty huba, od lewej
do prawej:

- Ostrzeżenie <img src="../img/mdi/mdi_alert.png" width="20"/>, tylko gdy coś jest nie tak: pomarańczowe, gdy najgorszy odczyt jest akceptowalny, czerwone, gdy któryś jest w strefie zagrożenia. Wbudowane temperatury też się liczą.
- **Temperatura**: wartość połączona, gdy hub ma kilka źródeł temperatury, w przeciwnym razie z sondy temperatury, a w ostateczności pierwsza wbudowana temperatura.
- <span>Termometr <img src="../img/mdi/mdi_thermometer-alert.png" width="20"/>, tylko gdy hub podejrzewa jedno ze swoich źródeł temperatury; jego podpowiedź wskazuje daną sondę.</span>
- pH, ORP i zasolenie, jedna pozycja na sondę.
- <span>Kropla <img src="../img/mdi/mdi_water-alert.png" width="20"/> na każdą sondę zalania, czerwona, gdy jest mokra.</span>
- <span>Fale <img src="../img/mdi/mdi_waves.png" width="20"/> na każdą sondę ATO, zielone na pożądanym poziomie, pomarańczowe poniżej lub powyżej.</span>

Każdy odczyt przyjmuje kolor swojego poziomu: zielony dla pożądanego,
pomarańczowy dla akceptowalnego, czerwony dla zagrożenia, biały, gdy sonda nie
podaje prawidłowego odczytu. Kliknięcie odczytu otwiera jego okno informacji.

## Sondy

<img src="../img/rscontrol/zone_4.png"/>

---

Każda sonda huba zwisa z puszki rozszerzeń, w kolejności, w jakiej hub je
wymienia. Każda pokazuje:

- Swój **odczyt** oraz **wbudowaną temperaturę** tuż pod nim dla sond pH,
  zasolenia i ATO, pokolorowane według poziomu. Kliknięcie wartości otwiera jej
  okno informacji.
- **Pasek sytuacji** dla każdego odczytu: czerwone, pomarańczowe i zielone pasma
  to zakresy zagrożenia, akceptowalny i pożądany ustawione w sondzie, a czarny
  znacznik pokazuje, gdzie znajduje się odczyt. Główny odczyt jest na lewym
  pasku, temperatura na prawym. Kliknięcie paska otwiera ostatnie 24 godziny
  odczytu na tle jego pasm.

<img src="../img/rscontrol/zone_4_history.png" width="50%"/>

- <span>Zębatkę <img src="../img/rsdose/cog_icon.png" width="30"/>, która otwiera ustawienia sondy.</span>

Odłączona sonda miga pod lekkim czerwonym odcieniem i nie podaje żadnego
odczytu.

### Ustawienia sondy

<img src="../img/rscontrol/zone_4_dialog_probe.png" width="50%"/>

Okno zbiera wszystko o sondzie: jej odczyty, stan, zakresy pożądany i
akceptowalny (oraz te dla wbudowanej temperatury), jednostkę wyświetlania sondy
zasolenia i jej przełączniki — włączona, brzęczyk, powiadomienia i konserwacja,
która wyłącza sondę z fuzji temperatur na czas czyszczenia lub kalibracji.

W sondzie zasolenia wyświetlane są granice wybranej jednostki wyświetlania: po zmianie jednostki okno od razu pokazuje jej granice.

Przycisk **Odczytaj wartość** prosi hub o świeży odczyt zamiast czekać na
następne odpytanie; wartości w oknie odświeżają się na miejscu.

Przyciski kalibracji na dole pokazują tylko kalibracje dla typu sondy, a żadnej,
gdy sonda jest odłączona. Każda kalibracja otwiera własne okno, opisane poniżej
dla każdego typu sondy.

### Typy sond

#### pH

<img src="../../src/img/redsea/RSSENSE/rssense-ph-temperature.png" width="10%"/> <img src="../../src/img/redsea/RSSENSE/rssense-ph.png" width="10%"/>

Odczyt pH oraz temperatura, gdy sonda ją ma — sonda pH bez temperatury ma własny
obraz, z jednym paskiem.

Kalibracja odbywa się w dwóch punktach, jak w aplikacji ReefBeat: najpierw pH 7,
potem pH 10 dla wody morskiej lub pH 4 dla wody słodkiej, każdy roztwór podany z
temperaturą, do której się odnosi. Po każdym punkcie hub czeka, aż odczyt się
ustabilizuje: okno pokazuje stabilność i pozostały czas, a następny krok
odblokowuje się dopiero, gdy hub skończy. Zamknięcie okna anuluje kalibrację.

<img src="../img/rscontrol/zone_4_calibration_ph.png" width="50%"/>

#### Zasolenie

<img src="../../src/img/redsea/RSSENSE/rssense-salinity-temperature.png" width="10%"/>

Zasolenie, w jednostce wybranej w ustawieniach sondy, oraz temperatura.

Kalibracja odbywa się w jednym punkcie: zanurz sondę w roztworze i wpisz jego
wartość w mS/cm (od 20 do 99).

<img src="../img/rscontrol/zone_4_calibration_ec.png" width="50%"/>

#### ORP

<img src="../../src/img/redsea/RSSENSE/rssense-orp.png" width="10%"/>

ORP w mV. Aby go skalibrować, zanurz sondę w roztworze wzorcowym i wpisz wartość
roztworu: sonda będzie wtedy odczytywać tę wartość.

<img src="../img/rscontrol/zone_4_calibration_orp.png" width="50%"/>

#### Temperatura

<img src="../../src/img/redsea/RSSENSE/temperature.png" width="10%"/>

Temperatura, na jednym pasku. Aby ją skalibrować, umieść sondę w wodzie, której
temperaturę zmierzyłeś termometrem wzorcowym, poczekaj, aż odczyt się
ustabilizuje, i wpisz rzeczywistą temperaturę.

Wbudowaną temperaturę sond pH, zasolenia i ATO kalibruje się w ten sam sposób,
za pomocą jej własnego przycisku **Kalibruj temperaturę**.

<img src="../img/rscontrol/zone_4_calibration_temperature.png" width="50%"/>

#### ATO

<img src="../../src/img/redsea/RSSENSE/rssense-ato.png" width="10%"/>

Sonda poziomu jest rysowana w wodzie sumpa, przy znaczniku zgłoszonym przez
sondę, jak w [ReefATO+](reefato.pl.md#akwarium). Jej temperatura jest wyświetlana na czarnym
korpusie, tuż pod złączem.

| Stan              | Znaczenie                                           |
| ----------------- | --------------------------------------------------- |
| Poniżej           | Lustro wody jest poniżej sondy: ATO nie nadąża      |
| Pożądany poziom 1 | Pierwszy znacznik dolewki                           |
| Pożądany poziom 2 | Drugi znacznik dolewki                              |
| Powyżej           | Lustro wody jest powyżej sondy: akwarium jest pełne |

**Poniżej** i **Powyżej** powodują miganie wody. Sonda w stanie błędu nie ma
linii wody.

#### Zalanie

<img src="../../src/img/redsea/RSSENSE/rssense-leak.png" width="10%"/>

Gdy wykryta zostanie woda, u stóp sondy rozlewa się kałuża, a migająca ikona
pokazuje, skąd pochodzi woda, zgodnie z tym, co zgłasza sonda:

<table>
  <tr>
    <th align="center">Wyciek wody z akwarium <img src="../img/mdi/mdi_fish.png" width="20"/></th>
    <th align="center">Wyciek wody osmotycznej <img src="../img/mdi/mdi_cup-water.png" width="20"/></th>
  </tr>
  <tr>
    <td align="center"><img src="../img/rscontrol/zone_4_leak_aquarium.png"/></td>
    <td align="center"><img src="../img/rscontrol/zone_4_leak_rodi.png"/></td>
  </tr>
</table>

Sonda zalania z wyłączonym wykrywaniem jest wyszarzona: jest obecna, ale niczego
nie wykrywa.

> [!NOTE]
> Sondy dodaje się, wymienia i usuwa z menu opcji integracji (zobacz
> [ha-reefbeat-component](https://github.com/Elwinmage/ha-reefbeat-component/blob/main/doc/pl/reefcontrol.pl.md#zarządzanie-sondami-dodawanie--wymiana--usuwanie)): karta dostosowuje się sama.

## Porty 12V

<img src="../img/rscontrol/zone_5.png"/>

---

Każdy port 12V huba ma swoją zębatkę nad złączem, a nad nią swój pobór mocy
(kliknięcie otwiera jego okno informacji). Zasilony port podświetla swoje
złącze. Pro ma dwa porty, z zębatką drugiego narysowaną inaczej; Lite ma jeden.

<span>Kliknięcie zębatki <img src="../img/mdi/cog-1.png" width="5%"/> otwiera ustawienia portu: nazwę, przełącznik, stan, typ i pobór mocy, a następnie edytor trybu.</span>

<img src="../img/rscontrol/zone_5_dialog_port.png" width="50%"/>

Portem steruje się jak [gniazdem Power Center](reefcontrol-power.pl.md#gniazdo), z tymi samymi czterema
trybami — **Włączone**, **Wyłączone**, **Harmonogram** i **Czujnik** — oraz
**mocą** dostarczaną po włączeniu, w %. Nic nie jest wysyłane do huba, dopóki
nie naciśniesz **Zapisz**. Port, który nigdy nie był zainstalowany, jest
instalowany przy zapisie, tak jak robi to aplikacja ReefBeat.

<span>Ikona kosza <img src="../img/mdi/mdi_delete-empty.png" width="20"/> w prawym górnym rogu odinstalowuje port po potwierdzeniu: wraca on do stanu fabrycznego i traci nazwę, harmonogram i regułę sondy.</span>

<img src="../img/rscontrol/zone_5_dialog_delete.png" width="50%"/>

## ATO

<img src="../img/rscontrol/zone_6.png"/>

---

Gdy port 12V steruje pompą ATO — zestawem ATO Red Sea lub dowolną pompą
podążającą za sondą ATO — pompa jest rysowana w swoim zbiorniku, połączona ze
swoim portem. Gdy port jest zasilony, woda płynie z wylotu nad sumpem.

## Komunikaty

<img src="../img/rscontrol/zone_7.png"/>

---

Ta strefa pokazuje ostatnie komunikaty systemowe ReefControl. Ma dwie linie:

- Szara linia pokazuje **ostatni komunikat**.
- Różowa linia pokazuje **ostatni alarm**, poprzedzony symbolem ⚠.

Kliknięcie ikony <img src="../img/mdi/mdi_delete-empty.png" width="20"/> kasuje odpowiedni komunikat.

Te linie można ukryć z poziomu edytora karty.

## Edytor karty

<img src="../img/rscontrol/editor.png" width="50%"/>

---

Oprócz dwóch linii komunikatów ReefControl ma dwie opcje:

- **Kompaktowe sondy**: każdy odczyt jest pokazywany jako kropka w kolorze jego
  poziomu zamiast paska sytuacji. Znak w kropce wskazuje, po której stronie
  zakresu pożądanego znajduje się odczyt. Kliknięcie kropki otwiera jego ostatnie
  24 godziny, jak w przypadku paska.
- **Położenie sond**: sondy są rozmieszczane w kolejności, w jakiej hub je
  wymienia. Sondę można przypiąć do pozycji na puszkach rozszerzeń, aby karta
  odpowiadała rzeczywistemu podłączeniu sond. **Auto** przywraca kolejność huba.

---

[← Powrót do strony głównej](README.pl.md)
