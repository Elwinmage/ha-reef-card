[← Powrót do strony głównej](README.pl.md)

# ReefLed

ReefLed z ha-reef-card w akcji:

[![Obejrzyj wideo](https://img.youtube.com/vi/VIDEO_ID/0.jpg)](https://www.youtube.com/watch?v=VIDEO_ID)

ReefLed **G1** (RSLED50, RSLED90, RSLED160) i **G2** (RSLED60, RSLED115,
RSLED170) są obsługiwane, podobnie jak [wirtualne LED](#wirtualna-led).

> [!NOTE]
> Tylko G1 została zweryfikowana na prawdziwych lampach. G2 jest
> zaimplementowana i powinna działać, ale nie była jeszcze testowana:
> uwagi są mile widziane.

<p align="center">
<img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsled/rsled_g1.png" width="45%"/>
<img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsled/rsled_g2.png" width="45%"/>
</p>

## Widok

Karta jest podzielona na 7 stref:

1. Niebo
2. Lewa ścianka
3. Prawa ścianka
4. Snop światła
5. Suwaki
6. Grupa i pogoda
7. Komunikaty

<img src="../img/rsled/rsled_zones.png"/>

## Niebo

<img src="../img/rsled/zone_1.png"/>

Droga słońca między pierwszym wschodem a ostatnim zachodem
dzisiejszego programu (kanały biały i niebieski), z obiema godzinami na
końcach łuku. W nocy niebo staje się fioletowe, jak księżycowa LED lampy:
księżyc wędruje od zachodu do następnego wschodu i pokazuje bieżącą fazę
(`todays_moon_day`). Dotknij trybu na środku, aby go zmienić (auto,
ręczny, timer). Gdy zaprogramowane są chmury, obok trybu pojawia się mała
chmura; gdy przechodzą, przesuwają się przed słońcem.

## Lewa ścianka

<img src="../img/rsled/zone_2.png"/>

Włącz/wyłącz, konserwacja, konfiguracja, bateria i
wifi.

Nazwa lampy (nadana w Home Assistant) jest napisana na górnej
lewej ściance lampy, między otworami wentylacyjnymi a ikonami. Długa nazwa
jest pisana mniejszą czcionką, a potem ucinana (cała nazwa pojawia się po
najechaniu).

## Prawa ścianka

<img src="../img/rsled/zone_3.png"/>

Identyfikacja (lampa miga, a snop światła na karcie
także przez 10 s), faza księżyca i aklimatyzacja. Księżyc i aklimatyzacja
otwierają swoje ustawienia. Podczas aklimatyzacji obok wypisane są
pozostałe dni i bieżąca intensywność.

## Snop światła

<img src="../img/rsled/zone_4.png"/>

Jego kolor i przezroczystość podążają za aktualnie
wytwarzanym światłem (kanały biały, niebieski i księżyc). Przy 0 %
intensywności albo wyłączonej lampie nie ma snopa, a soczewka jest
wyszarzona. Pokazuje bieżącą intensywność, nazwę dzisiejszego programu i
jego wykres (biały, niebieski i księżyc), z czerwonym znacznikiem na
bieżącej godzinie, wypisanej pod wykresem. W trybie pogody GPS w nawiasie
następuje godzina w miejscu pogody: moment dnia tego miejsca, który
odtwarza program (09:04 we Francji może być 04:04 na Malediwach, gdy
wschód jest zakotwiczony na akwarium). Poza trybem automatycznym wykres
jest przygaszony. Na G2 wykres pokazuje intensywność, z linią zabarwioną
według temperatury barwowej (żółta, gdy ciepła, niebieska, gdy zimna), z
wartością każdej strefy koloru. Dotknij snopa, aby edytować program.
Chmury dnia widać jako pionowe pasmo nad ich oknem, tym ciemniejsze, im są
silniejsze (Low, Medium, High); tak samo na wykresie edytora i w tygodniu
pogodowym.

## Suwaki

<img src="../img/rsled/zone_5.png"/>

Zgrupowane po lewej: intensywność, temperatura barwowa i
księżyc. Intensywność i kolor sterują światłem `kelvin_intensity`, suwak
księżyca światłem `moon`; po puszczeniu wysyłane jest jedno wywołanie. Na
G1 mały przełącznik **K | W/B** nad nimi zamienia intensywność i kolor na
kanały biały i niebieski; przeglądarka zapamiętuje wybór dla każdej lampy.
G2 steruje kolorem tylko przez kelwiny i intensywność, więc nie ma tego
przełącznika.

## Grupa i pogoda

<img src="../img/rsled/zone_6.png"/>

Na lampie należącej do grupy lampy jej grupy (zobacz
[Wirtualna LED](#wirtualna-led)): dotknij jednej, aby pokazać jej kartę. Pod
nimi ikona pogody, podświetlona, gdy lampa podąża za pogodą.

## Komunikaty

<img src="../img/rsled/zone_7.png"/>

Ostatni komunikat i ostatni alert pod snopem światła.

## Przesunięty wschód słońca

<img src="../img/rsled/staggered_sunrise.png"/>

Gdy lampa zaczyna dzień później (jej
`Przesunięcie wschodu słońca`, ustawione przez grupę albo ręcznie), niebo
odtwarza program z tym opóźnieniem: położenie słońca, godziny wschodu i
zachodu, chmury. Znaczek pod godziną wschodu („+15 min") otwiera
ustawienie przesunięcia, które jest też w oknie konfiguracji (tylko lampy
odpowiadające na `/offset`).

## Program pogodowy

<img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsled/rsled_weather.png" width="300"/>

Z programem pogodowym ha-reefbeat-component edytor programów ma przełącznik
**Tryb pogody GPS**, a w prawym dolnym rogu pojawia się ikona pogody
(`mdi:weather-partly-cloudy`), podświetlona, gdy lampa podąża za pogodą, a niebieska, gdy tydzień pogodowy
jest zapisywany do lampy. Służy tylko do informacji: tryb wybiera się w
edytorze programów.

Przy włączonym trybie tabela punktów ustępuje ustawieniom: miejsce (wpisane
jako `lat, lon`, wklejone jako link do mapy, wyszukane po nazwie —
„Malediwy", „Fakarava"… —, po czym mapa się tam przenosi, albo wybrane na
mapie Home Assistant, gdy jest dostępna), okres (prognoza na następny
tydzień albo zmierzona pogoda z minionego tygodnia), jak często pobierana
jest pogoda (od 3 do 15 dni), jak dzień miejsca jest ustawiany na akwarium
(czas miejsca, zakotwiczony na godzinie wschodu lub zachodu, albo
rozciągnięty między nimi), minimalna i maksymalna intensywność oraz chmury.
Każda zmiana jest od razu pokazywana w podglądzie: wykres pokazuje dzień,
jaki dałaby pogoda, a tydzień jest wypisany dzień po dniu (słońce na
akwarium, godziny miejsca po najechaniu, nasłonecznienie, zachmurzenie z
chmurami lampy i najwyższa intensywność); dzień z listy jest pokazywany na
wykresie. Przed **Zapisz** nic nie jest zapisywane: edytor pokazuje
„Zapisywanie ustawień…", potem „Ustawienia zapisane", gdy integracja
zapisała ustawienia i tryb oraz utworzyła tydzień, i zamyka się; tydzień
jest zapisywany do lampy zaraz potem, w tle. **Anuluj** niczego nie
zmienia.

Kolory dni pogodowych wybierasz samodzielnie: przy włączonym trybie wykres
pokazuje przedziały dnia i można zmienić tylko ich kolor. Ustawione kolory
stają się kolorami pokazanego dnia pogodowego albo wszystkich dni z
_Wszystkie dni_, zamiast kolorów własnego programu lampy; są
pokazywane w podglądzie i zapisywane razem z pozostałymi ustawieniami.

Po wyłączeniu trybu na lampie w trybie pogody edytor pokazuje odłożony
własny program lampy, do edycji: **Zapisz** go przywraca (z edytowanym
dniem, jeśli jest). Ustawienie zmienione poza kartą (encje Home Assistant,
automatyzacje) pojawia się w ciągu sekundy, a lampa jest zapisywana 30 s po
ostatniej zmianie.

## Wirtualna LED

<img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsled/rsled_virtual.png" width="300"/>

Wirtualna LED steruje kilkoma lampami jak jedną. Pokazuje ten sam widok co
prawdziwa lampa: widok G2, gdy tylko jedna z jej lamp jest G2 (grupa jest
wtedy sterowana wyłącznie przez kelwiny i intensywność), widok G1, gdy
wszystkie jej lampy są G1 (z przełącznikiem **K | W/B**). Wirtualna LED nie
ma baterii, wifi ani komunikatów; zamiast tego jej lampy są wypisane w
prawym dolnym rogu, każda z miniaturą swojej generacji. Dotknij jednej, aby
pokazać jej własną kartę (przycisk wstecz wraca do wirtualnej LED).

Wirtualna LED to grupa, jak „zgrupowane" LED w aplikacji ReefBeat: to, co
zostanie ustawione na niej albo na jednej z jej lamp (tryb, kolor ręczny,
timer, programy, aklimatyzacja, faza księżyca, tryb pogody), jest stosowane
do wszystkich lamp grupy. Lampa należąca do grupy również wypisuje lampy
swojej grupy, sama zakreślona na czerwono. Przy przesuniętym wschodzie
słońca przesunięcie każdej lampy jest wypisane pod jej nazwą (+0 min,
+10 min…). Gdy lampa grupy jest niedostępna, integracja odrzuca zmianę i
wymienia tę lampę: nic nie jest wysyłane, więc grupa pozostaje
zsynchronizowana.

Pokazywany program jest odczytywany z pierwszej lampy grupy (program G1 jest
pokazywany w kelwinach w widoku G2). **Zapisz** zapisuje edytowany
program na każdej lampie, w jej własnym formacie: biały/niebieski dla G1
(przeliczony tabelą jej modelu), punkty `color` dla G2. Zapisy są rozłożone
w czasie, ponieważ lampa odpowiada późno na polecenie wysłane zbyt
wcześnie: w tym czasie edytor pokazuje postęp („Wysyłanie programu do lamp… 3/14").

> [!NOTE]
> Lista lamp wymaga ha-reefbeat-component z sensorem `linked_leds`. Bez
> niego karta wybiera widok G2, gdy wirtualna LED nie ma świateł
> biały/niebieski, i zapisuje programy na wpisie samej wirtualnej LED.

## Edytor programów

<img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsled/rsled_program_editor.png" width="400"/>

Dotknij snopa światła, aby edytować program dnia: na górze wykres, poniżej
punkty wybranego kanału (godzina, intensywność i, na G2, temperatura
barwowa). Punkty można też przeciągać na wykresie. Na G1 przełącznik
**W/B | K** edytora edytuje program kanał po kanale albo jako intensywność +
temperatura barwowa; zawsze jest zapisywany jako biały/niebieski.
Przeliczenie wykonuje integracja (`redsea.led_convert`: tabela modelu i
opcja kompensacji intensywności), z lokalnym zastępstwem dla starszych
wersji integracji. Pierwszy i ostatni wiersz to wschód i zachód kanału: ich
intensywność pozostaje na 0 %. **Zapisz** wysyła program pokazanego
dnia albo każdego dnia z _Wszystkie dni_.

### Biblioteka w chmurze

<img src="../img/rsled/library.png"/>

Gdy lampa jest połączona z kontem w chmurze ReefBeat (wpis cloud
integracji), edytor proponuje programy z jej biblioteki, tak jak przechowuje
je aplikacja ReefBeat (G1: dla akwarium; G2: dla konta, we własnej
bibliotece): wybranie programu go wczytuje (program G1 jest pokazywany w
kelwinach na G2, program G2 jest edytowany w kelwinach na G1 i zapisywany
jako biały/niebieski). Zapisany bez zmian, przekazuje lampie swoją nazwę i
swoje chmury, jak w aplikacji ReefBeat.

Programy są wypisane w dwóch grupach: programy Red Sea (12K, 15K, 18K, 20K,
23K i RS Accelerated Growth na G1; 15K, 23K, Shallow Reef i Deep Reef,
wbudowane w aplikację, na G2) oraz Twoje. Tak jak w aplikacji, program Red
Sea można wczytać, ale nie można go aktualizować ani usuwać; jeden z Twoich
można usunąć (🗑, po potwierdzeniu).

Edytowany program jest zapisywany w bibliotece, zanim zostanie wysłany do
lampy: karta pyta o jego nazwę, domyślnie `prog-YYYYMMDDHHMM`. Gdy pochodzi
z jednego z Twoich programów, nazwa jest nazwą tego programu, a Ty wybierasz
między **Aktualizuj** (program w bibliotece jest zastępowany)
a **Zapisz jako nowy**. Wirtualna LED używa biblioteki swojej pierwszej
połączonej lampy.

> [!NOTE]
> Biblioteka wymaga ha-reefbeat-component z usługami `redsea.led_library`,
> `redsea.led_library_save` i `redsea.led_library_delete`.

> [!NOTE]
> Lampa przechowuje swoje programy na tygodniowej osi czasu (dzień N zaczyna
> się w (N - 1) × 1440 min); karta pokazuje i edytuje każdy dzień na jego
> własnych 24 h. G2 przechowuje swój program jako punkty `color`
> `{t, i1, k1, i2, k2}` (wartość wejściowa i wyjściowa na punkt) plus
> księżyc, a swoje chmury pod `/clouds/<day>` jak G1. Karta odczytuje i
> zapisuje ten format; odczytuje też program tak, jak widzi go parser G1
> aplikacji (biały = intensywności, niebieski = temperatury barwowe).

> [!NOTE]
> Postęp aklimatyzacji wymaga ha-reefbeat-component z sensorami
> `acclimation_remaining_days` i `acclimation_current_intensity_factor`. Z
> jego sensorem `current_program` snop światła pokazuje nazwę programu,
> który lampa zgłasza jako wykonywany.

---

[← Powrót do strony głównej](README.pl.md)
