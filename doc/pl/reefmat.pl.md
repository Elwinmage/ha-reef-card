[← Powrót do strony głównej](README.pl.md)

# ReefMat

ReefMat z ha-reef-card w akcji:

[![Obejrzyj wideo](https://img.youtube.com/vi/yyNyUSitb1E/0.jpg)](https://www.youtube.com/watch?v=yyNyUSitb1E)

Karta ReefMat jest podzielona na 7 stref:

1. Konfiguracja / Informacje Wifi
2. Stany
3. Informacje o rolce (całkowita zużyta długość, pozostała długość, koniec rolki, tryb...)
4. Ręczne/automatyczne posuwanie
5. Czujnik
6. Zaplanowane posuwanie
7. Tygodniowy / miesięczny wykres zużycia

<img src="../img/rsmat/rsmat_zones.png"/>

Obraz tła zmienia się w zależności od stanu zużycia rolki, dostępne 5 różnych obrazów:

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

## Konfiguracja / Informacje Wifi

<img src="../img/rsmat/zone_1.png"/>

---

<span>Kliknij ikonę <img src="../img/rsdose/cog_icon.png" width="30" /> aby zarządzać ogólną konfiguracją ReefMat.</span>

<img src="../img/rsmat/zone_1_dialog_configuration.png"/>

<span>Kliknij ikonę <img src="../img/rsdose/wifi_icon.png" width="30" /> aby zarządzać ustawieniami sieciowymi.</span>

<img src="../img/rsmat/zone_1_dialog_wifi.png"/>

## Stany

<img src="../img/rsmat/zone_2.png"/>

---

<span>Przełącznik konserwacji <img src="../img/mdi/mdi_account-wrench.png" width="20"/> przełącza w tryb konserwacji.</span>

 <img  src="../img/rsmat/maintenance.png"/>

<span>Przełącznik włącz/wyłącz <img src="../img/mdi/mdi_power-plug.png" width="20"/> przełącza ReefMat między stanami włączonym i wyłączonym.</span>

 <img  src="../img/rsmat/off_mode.png"/>

## Informacje o rolce

<img src="../img/rsmat/zone_3.png"/>

---

Ta strefa wyświetla stan rolki filtrującej w czasie rzeczywistym, od góry do dołu:

- **Całkowita zużyta długość** od początku rolki (na górze, czerwony)
- **Pozostała długość** na środku w kolorze czerwonym. Gdy rolka jest pusta, pojawia się <img src="../img/mdi/mdi_paper-roll.png" width="20"/> migająca ikona, a okno dialogowe proponuje wymianę rolki.

<img src="../img/rsmat/zone_3_dialog_new_roll.png"/>

- **Liczba pozostałych dni** do końca rolki, szacowana na podstawie średniego dziennego zużycia (czarny)
- **Średnie dzienne zużycie** w cm (lewy dolny)
- Bieżący **tryb pracy**: Auto, Konserwacja, Wyłączony… (pod logo RedSea)
- **Procent zużytej rolki** (łuk kołowy w prawym dolnym rogu)

W przypadku wykrycia anomalii logo RedSea zamieni się w <img src="../img/mdi/mdi_alert-decagram.png" width="20"/> migającą ikonę.
Kliknięcie tego alertu otwiera okno dialogowe anomalii:

<img src="../img/rsmat/alert.png"/>
<img src="../img/rsmat/zone_3_dialog_alert.png" />

## Ręczne/Automatyczne posuwanie

<img src="../img/rsmat/zone_4.png"/>
<img src="../img/rsmat/zone_4_auto_off.png"/>
---

Ta strefa steruje posuwaniem rolki.

Od lewej do prawej:

- Przycisk <img src="../img/mdi/mdi_send.png" width="20"/> uruchamia **ręczne posuwanie** rolki o długość wskazaną w środku.
- Wyświetlana **wartość posuwu** (w cm) to wartość wysyłana po naciśnięciu przycisku. Kliknięcie tej liczby otwiera okno edycji.

<img src="../img/rsmat/zone_4_dialog_manual_advance.png"/>

- **Przycisk automatycznego posuwania** <img src="../img/mdi/mdi_autorenew.png" width="20"/> <img src="../img/mdi/mdi_autorenew-off.png" width="20"/> włącza lub wyłącza automatyczne posuwanie rolki.

## Czujnik

<img src="../img/rsmat/zone_5.png"/>

---

Ta strefa pokazuje stan czujnika poziomu.

Możliwe są trzy stany:

| Stan               | Obraz                                                           |
| ------------------ | --------------------------------------------------------------- |
| Czujnik podłączony | <img src="../img/rsmat/RSMAT_SENSOR_PLUGGED.png" width="80"/>   |
| Czujnik odłączony  | <img src="../img/rsmat/RSMAT_SENSOR_UNPLUGGED.png" width="80"/> |
| Brudny czujnik     | <img src="../img/mdi/mdi_liquid-spot.png" width="80"/>          |

## Zaplanowane posuwanie

<img src="../img/rsmat/zone_6.png"/>

---

Ten przycisk <img src="../img/mdi/mdi_auto-mode_red.png" width="20"/><img src="../img/mdi/mdi_auto-mode_black.png" width="20"/> pokazuje stan zaplanowanego posuwania i umożliwia jego edycję po kliknięciu.

<img src="../img/rsmat/zone_6_dialog_schedule.png"/>

## Wykres zużycia

<img src="../img/rsmat/zone_7.png"/> 
<img src="../img/rsmat/monthly.png"/>

---

Ta strefa wyświetla wykres zużycia rolki w czasie.
Kliknięcie przycisku przełącza między dwoma dostępnymi trybami:

- Tryb **Weekly** pokazuje zużycie z ostatnich 7 dni.
- Tryb **Monthly** pokazuje zużycie z ostatnich 30 dni.

Naciśnięcie lewego górnego rogu wykresu otwiera widok szczegółowy w Home Assistant.

## Messages

<img src="../img/rsmat/zone_8.png"/>

---

Ta strefa wyświetla ostatnie komunikaty systemowe ReefMat. Ma dwie linie:

- Szara linia pokazuje **ostatnią wiadomość**.
- Różowa linia pokazuje **ostatni alert**, poprzedzony symbolem ⚠.

Kliknięcie <img src="../img/mdi/mdi_delete-empty.png" width="20"/> usuwa odpowiednią wiadomość.

Linie te można ukryć za pomocą interfejsu edytora karty.

<img src="../img/rsmat/editor.png" />

---

[← Powrót do strony głównej](README.pl.md)
