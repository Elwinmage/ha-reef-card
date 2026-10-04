[← Powrót do strony głównej](README.pl.md)

# ReefControl-Power

ReefControl i ReefControl-Power z ha-reef-card w akcji:

[![Obejrzyj wideo](https://img.youtube.com/vi/voFobfc7Slk/0.jpg)](https://www.youtube.com/watch?v=voFobfc7Slk)

Karta ReefControl-Power rysuje Power Center z jego gniazdami, tym, co jest
podłączone do każdego z nich, a po lewej jego własną sondę temperatury lub
[ReefControl](reefcontrol.pl.md#reefcontrol), z którym jest sparowane.

Obsługiwane są oba modele: różnią się tylko liczbą gniazd.

<table>
  <tr>
    <th align="center">RSPOWER6</th>
    <th align="center">RSPOWER8</th>
  </tr>
  <tr>
    <td align="center"><img src="../img/rspower/rspower6.png"/></td>
    <td align="center"><img src="../img/rspower/rspower8.png"/></td>
  </tr>
</table>

Dalsza część tej sekcji jest ilustrowana modelem RSPOWER6: wszystko działa tak
samo w RSPOWER8.

<img src="../img/rspower/rspower_zones.png"/>

Karta jest podzielona na 6 stref:

1. Stan zasilania i tryb konserwacji
2. Konfiguracja, Wifi i bateria
3. Gniazda
4. Sonda temperatury lub połączenie z ReefControl
5. Powiązane urządzenia
6. Ostatni komunikat i ostatni alarm

## Stan zasilania i tryb konserwacji

<img src="../img/rspower/zone_1.png"/>

---

<span>Przełącznik <img src="../img/mdi/mdi_power-plug.png" width="20"/> włącza lub wyłącza ReefControl-Power.</span>

<img src="../img/rspower/off_mode.png" width="50%"/>

Po wyłączeniu karta zachowuje tylko przełącznik, obraz sondy temperatury lub
sparowanego ReefControl oraz odnośniki do innych urządzeń: nazwa huba i
urządzenia podłączone do gniazd nadal otwierają swoje karty. Gniazda tracą
przyciski, nazwy i pobór mocy, a sonda swój odczyt i ustawienia.

<span>Przełącznik <img src="../img/mdi/mdi_account-wrench.png" width="20"/> włącza tryb konserwacji.</span>

<img src="../img/rspower/maintenance.png" width="50%"/>

## Konfiguracja / Informacje Wifi

<img src="../img/rspower/zone_2.png"/>

---

<span>Kliknij ikonę <img src="../img/rsdose/cog_icon.png" width="30"/>, aby zarządzać ogólną konfiguracją ReefControl-Power: odświeżyć ustawienia lub odczytane dane, zrestartować urządzenie, zaktualizować jego firmware oraz zobaczyć jego region i liczbę gniazd.</span>

To samo okno dodaje lub usuwa lokalną sondę temperatury i rozparowuje
ReefControl. Sonda i hub wykluczają się wzajemnie: przycisk, który nie ma
zastosowania, jest wyszarzony zamiast ukryty, abyś widział, jakie akcje istnieją.

<img src="../img/rspower/zone_2_dialog_config.png" width="50%"/>

<span>Kliknij ikonę <img src="../img/mdi/wifi_icon.png" width="30"/>, aby zarządzać ustawieniami sieci.</span>

<img src="../img/rspower/zone_2_dialog_wifi.png" width="50%"/>

<span>Ikona <img src="../img/mdi/battery.png" width="30"/> pokazuje poziom baterii ReefControl-Power.</span>

## Gniazda

<img src="../img/rspower/zone_3.png"/>

---

Tekst na froncie Power Center to jego **tryb pracy** (Auto, Setup…), obok
**całkowitego poboru mocy** jego gniazd. Kliknięcie poboru mocy otwiera jego
okno informacji.

Każde gniazdo pokazuje, od góry do dołu:

- Swoją **nazwę**.
- Swój **przycisk**, obramowany kolorem gniazda, z czerwoną ikoną, gdy gniazdo
  jest zasilone, i szarą, gdy jest wyłączone. Pokazuje wtyczkę lub ikonę
  podłączonego urządzenia (zobacz [Powiązane urządzenia](#powiązane-urządzenia)).
- Swój **pobór mocy**, który otwiera jego okno informacji.

Małe ikony w dolnej części przycisku pokazują, jak sterowane jest gniazdo:

| Ikona                                                                                                                                                                                                                                                                                                                               | Znaczenie                                                                     |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| <img src="../img/mdi/mdi_power.png" width="20"/>                                                                                                                                                                                                                                                                                    | Włączone lub wyłączone ręcznie                                                |
| <img src="../img/mdi/mdi_clock-time-nine-outline.png" width="20"/>                                                                                                                                                                                                                                                                  | Działa według harmonogramu — kliknięcie otwiera jego edytor                   |
| <img src="../img/mdi/mdi_thermometer.png" width="20"/> <img src="../img/mdi/mdi_ph.png" width="20"/> <img src="../img/mdi/mdi_water-percent.png" width="20"/> <img src="../img/mdi/mdi_flash-triangle.png" width="20"/> <img src="../img/mdi/mdi_water-alert.png" width="20"/> <img src="../img/mdi/mdi_cup-water.png" width="20"/> | Podąża za sondą: temperatura, pH, zasolenie, ORP, zalanie lub poziom wody ATO |
| <img src="../img/mdi/mdi_hand-back-left-outline.png" width="20"/>                                                                                                                                                                                                                                                                   | Jego harmonogram lub sonda są zawieszone: gniazdo zostało ręcznie wyłączone   |

Gniazdo, które nigdy nie było skonfigurowane, pokazuje **+** zamiast przycisku:
kliknięcie otwiera jego ustawienia, aby nadać mu tryb.

**Kliknięcie** przycisku otwiera ustawienia gniazda. **Długie naciśnięcie**
bezpośrednio włącza lub wyłącza gniazdo.

### Gniazdo

<img src="../img/rspower/zone_3_dialog_socket.png" width="50%"/>

Okno zaczyna się od nazwy, przełącznika, stanu i poboru mocy gniazda, a
następnie oferuje jego cztery tryby:

- **Włączone** / **Wyłączone**: gniazdo pozostaje zasilone lub nie.
- **Harmonogram**: 24-godzinna oś czasu i lista jego przedziałów **włączenia**.
  Dodawaj, edytuj lub usuwaj przedziały; przedział, który kończy się przed
  rozpoczęciem lub nachodzi na poprzedni, jest wyjaśniany pod listą i blokuje
  zapis.

<img src="../img/rspower/zone_3_socket_schedule.png" width="50%"/>

- **Czujnik**: gniazdo podąża za sondą — lokalną sondą temperatury Power Center
  lub dowolną sondą sparowanego ReefControl, łącznie z wbudowanymi
  temperaturami. Wybierz, czy gniazdo się **włącza**, czy **wyłącza**, gdy
  odczyt przekroczy **próg** w górę lub w dół, z **histerezą** (martwą strefą
  wokół progu, aby gniazdo nie migotało), oraz co zrobić, gdy sonda zostanie
  utracona. Gniazdo podążające za sondą ATO nie potrzebuje progu.

<img src="../img/rspower/zone_3_socket_sensor.png" width="50%"/>

Nic nie jest wysyłane do urządzenia, dopóki nie naciśniesz **Zapisz**.

Gdy gniazdo działające według harmonogramu lub sondy zostało ręcznie wyłączone,
okno otwiera się w tym trybie automatycznym, informuje, że jest on zawieszony, i
proponuje jego **wznowienie** bez przepisywania harmonogramu czy reguły.

<img src="../img/rspower/zone_3_socket_override.png" width="50%"/>

<span>Ikona kosza <img src="../img/mdi/mdi_delete-empty.png" width="20"/> w prawym górnym rogu kasuje konfigurację gniazda po potwierdzeniu: gniazdo odzyskuje swoją fabryczną nazwę i nie ma już trybu.</span>

<img src="../img/rspower/zone_3_dialog_delete.png" width="50%"/>

## Sonda temperatury lub połączenie z ReefControl

Lewa strona karty pokazuje, skąd Power Center odczytuje temperaturę: z własnej
sondy lub z ReefControl, z którym jest sparowane. Wykluczają się one wzajemnie.

### Sonda temperatury

<img src="../img/rspower/zone_4_temperature.png"/>

---

Lokalna sonda temperatury jest rysowana podłączona do Power Center, z odczytem w
kolorze jego poziomu i paskiem sytuacji wzdłuż sondy (kropką w trybie
kompaktowym edytora karty). Kliknięcie paska otwiera ostatnie 24 godziny
temperatury na tle jej pasm.

Odłączona sonda miga pod lekkim czerwonym odcieniem.

<span>Kliknięcie zębatki <img src="../img/rsdose/cog_icon.png" width="30"/> otwiera ustawienia sondy: nazwę, przycisk natychmiastowego odczytu, zakresy pożądany i akceptowalny, kalibrację według rzeczywistej temperatury oraz przełączniki rejestrowania i powiadomień.</span>

<img src="../img/rspower/zone_4_dialog_temperature.png" width="50%"/>

### Połączenie z ReefControl

<img src="../img/rspower/zone_4_rscontrol.png"/>

---

Sparowany ReefControl zajmuje miejsce sondy: jego kabel jest rysowany z nazwą
huba wzdłuż niego. Kliknięcie nazwy otwiera kartę huba.

<span>Ikona <img src="../img/mdi/mdi_web.png" width="20"/> otwiera okno połączenia: sparowany hub, jego typ i stan oraz to, czy jest połączony z Power Center i z internetem.</span>

<img src="../img/rspower/zone_4_dialog_rscontrol.png" width="50%"/>

Gdy hub jest sparowany, ale nie odpowiada, połączenie miga pod lekkim czerwonym
odcieniem.

## Powiązane urządzenia

<img src="../img/rspower/zone_5.png"/>

---

Power Center nie wie, co jest podłączone do jego gniazd: karta pozwala to
wskazać w edytorze karty. Gniazdo powiązane z urządzeniem Red Sea lub pompą Aqua
Medic pokazuje:

- obraz urządzenia pod gniazdem, w dwóch przesuniętych rzędach, aby sąsiednie
  obrazy się nie nakładały, połączony z gniazdem rurką w kolorze gniazda (szarą,
  gdy gniazdo jest wyłączone);
- ikonę urządzenia na przycisku gniazda, zamiast wtyczki.

Pompa ReefRun jest przedstawiana przez swoją funkcję, pompę powrotną lub
odpieniacz, a nie przez swój sterownik. Każde inne urządzenie znane Home
Assistant również może zostać powiązane, ale nie ma jeszcze obrazu.

Dla urządzenia, którego Home Assistant nie zna (grzałka, lampa, wentylator…), wybierz **Inne**: przycisk gniazda pokazuje wtedy <img src="../img/mdi/mdi_dots-horizontal-circle-outline.png" width="20"/> zamiast wtyczki, bez obrazu pod spodem.

Obraz odzwierciedla stan urządzenia:

| Wygląd     | Stan urządzenia Red Sea                                                 |
| ---------- | ----------------------------------------------------------------------- |
| Normalny   | Działa normalnie                                                        |
| Wyszarzony | Wyłączone                                                               |
| Migający   | Wszystko inne: tryb ręczny, konserwacja, niedostępne, uszkodzona pompa… |

Urządzenia z innych integracji są zawsze rysowane normalnie.

Kliknięcie obrazu otwiera kartę urządzenia.

## Komunikaty

<img src="../img/rspower/zone_6.png"/>

---

Ta strefa pokazuje ostatnie komunikaty systemowe ReefControl-Power. Ma dwie linie:

- Szara linia pokazuje **ostatni komunikat**.
- Różowa linia pokazuje **ostatni alarm**, poprzedzony symbolem ⚠.

Kliknięcie ikony <img src="../img/mdi/mdi_delete-empty.png" width="20"/> kasuje odpowiedni komunikat.

Te linie można ukryć z poziomu edytora karty.

## Edytor karty

<img src="../img/rspower/editor.png" width="50%"/>

---

Oprócz dwóch linii komunikatów ReefControl-Power ma trzy opcje:

- **Kompaktowe sondy**: temperatura jest pokazywana jako kropka w kolorze jej
  poziomu zamiast paska sytuacji.
- **Kolory gniazd**: kolor każdego gniazda, używany przez jego przycisk i przez
  rurkę do powiązanego urządzenia.
- **Powiązane urządzenie**: dla każdego gniazda urządzenie do niego podłączone
  lub **Brak**. **Inne** oznacza urządzenie, którego Home Assistant nie zna.

Opcje są zapisywane pod modelem zgłaszanym przez Home Assistant:

```yaml
type: custom:reef-card
device: "210987654321" # stały identyfikator urządzenia (nazwa też działa)
conf:
  RSPOWER6:
    devices:
      "210987654321":
        name: MY-RSPOWER # tylko etykieta
        compact_probes: false
        sockets:
          socket_1:
            color: "255,0,0"
            linked_device: 0123456789abcdef0123456789abcdef
          socket_3:
            linked_device: fedcba9876543210fedcba9876543210
```

---

[← Powrót do strony głównej](README.pl.md)
