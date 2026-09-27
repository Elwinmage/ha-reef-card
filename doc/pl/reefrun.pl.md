[← Powrót do strony głównej](README.pl.md)

# ReefRun

ReefRun z ha-reef-card w akcji:

[![Obejrzyj wideo](https://img.youtube.com/vi/Xxv38OPqiGI/0.jpg)](https://www.youtube.com/watch?v=Xxv38OPqiGI)

Karta ReefRun pokazuje sterownik i jego dwie pompy tak, jak są fizycznie
podłączone, każda z własnym kablem i orurowaniem. Pompa 1 jest po lewej
stronie, pompa 2 po prawej — zwykle pompa powrotna i DC Skimmer, ale każde
gniazdo przyjmuje dowolny z tych modeli.

<img src="../img/rsrun/rsrun_zones.png"/>

Karta jest podzielona na 6 stref:

1. Stan zasilania i tryb konserwacji
2. Informacje o baterii i Wifi
3. Sterownik: tryb pracy, przyciski pomp i kalibracje
4. Pompa 1: harmonogram dobowy, korpus z przepływem wody na żywo, temperatura
5. Pompa 2: harmonogram dobowy, korpus z przepływem wody na żywo, temperatura
6. Ostatni komunikat i ostatni alert

## Stan zasilania i tryb konserwacji

<img src="../img/rsrun/zone_1.png" >

<span>Przełącznik konserwacji <img src="../img/mdi/mdi_account-wrench.png" width="20"/> włącza tryb konserwacji.</span>

<img src="../img/rsrun/maintenance.png" >

<span>Przełącznik wł./wył. <img src="../img/mdi/mdi_power-plug.png" width="20"/> włącza i wyłącza Reef Dual Controller.</span>

<img src="../img/rsrun/off_mode.png" >

## Informacje o baterii i Wifi

<img src="../img/rsrun/zone_2.png"/>

---

<span>Ta ikona <img src="../img/mdi/battery.png" width="30" /> pokazuje poziom baterii Dual Controllera.</span>

<span>Kliknij ikonę <img src="../img/mdi/wifi_icon.png" width="30" />, aby zarządzać ustawieniami sieci.</span>

<img src="../img/rsrun/zone_2_dialog_wifi.png"/>

## Sterownik: tryb pracy, przyciski pomp i kalibracje

<img src="../img/rsrun/zone_3.png"/>

### Ustawienia pomp

Kliknięcie <img src="../img/mdi/cog-1.png" width="5%"/> lub <img src="../img/mdi/cog-2.png" width="5%"/> otwiera okno konfiguracji pompy 1 lub 2.

<img src="../img/rsrun/zone_3_return_pump.png"/>
<img src="../img/rsrun/zone_3_skimmer.png"/>

> [!CAUTION]
> **Usunięcie pompy** przywraca jej ustawienia fabryczne: harmonogram i
> sterowanie czujnikiem zostają utracone. Zawsze wymagane jest potwierdzenie.

### Ustawienia czujnika

Kliknięcie <img src="../img/mdi/cog-s.png" width="5%"/> otwiera okno konfiguracji czujnika.
<img src="../img/rsrun/zone_3_sensor.png"/>

### Play/pauza pompy <img src="../img/mdi/play.png" width="5%"/> / <img src="../img/mdi/pause.png" width="5%"/>

Kliknięcie włącza lub wyłącza daną pompę.

Czerwony pierścień pokazuje bieżącą prędkość.
<img src="../img/rsrun/speed.png"/>

Aby zmienić bieżącą prędkość, przytrzymaj <img src="../img/mdi/play.png" width="5%"/> / <img src="../img/mdi/pause.png" width="5%"/> albo kliknij harmonogram:

<img src="../img/rsrun/schedule.png"/>

## Stany pompy

Korpus pompy odzwierciedla to, co urządzenie naprawdę robi — wystarczy rzut oka.
Oba typy pomp nie mają tych samych stanów, dlatego opisano je osobno.

## Pompy 1 i 2

### Pompa powrotna

<img src="../../src/img/redsea/RSRUN/reefrun_return.png" width="30%"/>

Jedna ilustracja obejmuje wszystkie stany, karta zmienia tylko sposób jej
rysowania:

- **Pracuje** — pełne kolory, woda animowana z bieżącą prędkością.
- **Zatrzymana** — ta sama ilustracja wyszarzona, brak przepływu.
- **Odłączona** — to samo wyszarzenie oraz migający kabel zasilania.

### Odpieniacz

Trzy odrębne ilustracje, po jednej na stan kubka:

<table>
  <tr>
    <td align="center"><img src="../../src/img/redsea/RSRUN/reefrun_skimmer_on.png" width="100%"/><br/><b>Pracuje</b><br/>Piana w kubku, unoszące się pęcherzyki, animowana woda</td>
    <td align="center"><img src="../../src/img/redsea/RSRUN/reefrun_skimmer_full.png" width="100%"/><br/><b>Pełny kubek</b><br/>Piana ograniczona do pasma pod pokrywą</td>
    <td align="center"><img src="../../src/img/redsea/RSRUN/reefrun_skimmer_off.png" width="100%"/><br/><b>Zatrzymany</b><br/>Pusty kubek, wyszarzony, bez pęcherzyków</td>
  </tr>
</table>

Odłączony odpieniacz wygląda dokładnie tak samo jak zatrzymany: rozróżnia je
tylko migający kabel. To miganie oznacza, że ReefRun zgłasza `missing_pump`,
czyli pompa jest skonfigurowana, ale sterownik już jej nie widzi. Sprawdź
wtyczkę, zanim poszukasz dalej.

Stan pełnego kubka zgłasza czujnik piany w komorze zbiorczej. Korpus przełącza
się na własną ilustrację, a animacja piany zmniejsza się do wąskiego pasma pod
pokrywą — niezależnie od tego, czy samopoziomowanie jest włączone. Migająca
ikona ostrzeżenia obok przełącznika pełnego kubka pojawia się tylko wtedy, gdy
`sensor_controlled` jest włączony, ponieważ przy wyłączonym czujniku sterownik
nie reaguje na pełny kubek.

### Dodawanie pompy

Gniazdo bez skonfigurowanej pompy pokazuje symbol **dodawania** zamiast korpusu
pompy:

<img src="../../src/img/redsea/RSRUN/add_pump.png" width="20%"/>

Kliknięcie otwiera okno konfiguracji, w którym **Wykryj i dodaj** pyta sterownik,
co jest podłączone, i rejestruje to w jednym kroku. Wykryty model to tylko
sugestia i czasem bywa błędny, więc lista modeli pozostaje później edytowalna:
dla DC Skimmera wybierz rsk-300, rsk-600 lub rsk-900. Nazwę pompy edytuje się w
tym samym oknie.

Symbol znajduje się na każdym nieskonfigurowanym gnieździe, pojawia się więc też
tam, gdzie nigdy nie zamierzasz nic podłączać. Kto ma tylko jedną pompę, może go
całkowicie ukryć w edytorze karty.

<img src="../img/rsrun/editor.png"/>

### Harmonogram

<img src="../img/rsrun/schedule.png"/>

Niebieska krzywa to zaprogramowana prędkość w ciągu 24 godzin. Pionowa czerwona
linia oznacza bieżącą godzinę, a punkt na niej prędkość wymaganą przez
harmonogram.

Gdy pompa nie realizuje harmonogramu — tryb karmienia, wykrycie pełnego kubka,
ochrona przed nadmiernym odpienianiem — punkt przesuwa się na **rzeczywistą**
prędkość, a czerwony odcinek obrazuje różnicę wraz z jej wartością:

<img src="../img/rsrun/schedule_deviation.png"/>

Kliknięcie wykresu otwiera edytor harmonogramu: dodawanie i usuwanie punktów, zmiana godzin i prędkości, podgląd punktu na urządzeniu oraz zapis.

<img src="../img/rsrun/schedule_editor.png"/>

## Komunikaty

<img src="../img/rsrun/zone_6.png"/>

---

Ta strefa pokazuje najnowsze komunikaty systemowe ReefRun. Ma dwie linie:

- Szara linia pokazuje **ostatni otrzymany komunikat**.
- Różowa linia pokazuje **ostatni alert**, poprzedzony symbolem ⚠.

Kliknięcie ikony <img src="../img/mdi/mdi_delete-empty.png" width="20"/> czyści odpowiedni komunikat.

Te linie można ukryć w edytorze karty.

<img src="../img/rsrun/editor_2.png" />

---

[← Powrót do strony głównej](README.pl.md)
