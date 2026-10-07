[← Powrót do strony głównej](README.pl.md)

# Aqua Medic

Aqua Medic z ha-reef-card w akcji:

[![Obejrzyj wideo](https://img.youtube.com/vi/9Gh4YE6Ck9g/0.jpg)](https://www.youtube.com/watch?v=9Gh4YE6Ck9g)

Widoki pomp z [ha-aquamedic-component](https://github.com/Elwinmage/ha-aquamedic-component):

| Urządzenie                               | Widok karty            |
| ---------------------------------------- | ---------------------- |
| EcoDrift / SmartDrift (pompa cyrkulacji) | `aquamedic-smartdrift` |
| DC Runner (pompa powrotna)               | `aquamedic-dcrunner`   |
| DC Runner (pompa odpieniacza)            | `aquamedic-dcskimmer`  |

<p align="center">
<img src="../img/aquamedic/smartdrift.png" width="30%"/>
<img src="../img/aquamedic/dcrunner.png" width="30%"/>
<img src="../img/aquamedic/dcskimmer.png" width="30%"/>
</p>

Pompa powrotna i pompa odpieniacza to ten sam sprzęt: karta pokazuje wybór
roli, dopóki lista wyboru **Rola pompy** w integracji nie zostanie
ustawiona, a potem sama przełącza się na pasujący widok.

<img src="../img/aquamedic/role_picker.png"/>

## Co pokazuje widok

Karta jest podzielona na 4 stref:

1. Górny pasek
2. Usterki
3. Prędkość
4. Program przedziałów czasowych

<img src="../img/aquamedic/aquamedic_zones.png"/>

## Górny pasek

<img src="../img/aquamedic/zone_1.png"/>

Zasilanie, pauza karmienia, timer i sterowanie 0-10V,
każde przełączane jednym kliknięciem; zębatka otwiera ustawienia
(wszystkie encje pompy, jej rola i czujniki usterek). SmartDrift dodaje
przełącznik impuls / pływ oraz swój tryb fali (kliknięcie: szczegóły).

## Usterki

<img src="../img/aquamedic/zone_2.png"/>

Migająca linia wymienia usterki zgłaszane przez pompę (praca
na sucho, zablokowany wirnik, przegrzanie…). Gdy pompa jest sprawna, nic
nie jest rysowane.

## Prędkość

<img src="../img/aquamedic/zone_3.png"/>

Pierścień na obrazie i suwak pod nim (prędkość silnika w DC
Runner, przepływ w SmartDrift, która dostaje też suwak częstotliwości
fali). W SmartDrift pierścień jest dopasowany do przedniej zaślepki pompy,
z wartością w środku. Oba znikają, gdy pompa jest sterowana wejściem
0-10V, ponieważ integracja blokuje wtedy prędkość. Po puszczeniu suwak
zachowuje nową wartość, dopóki pompa jej nie potwierdzi.

## Program przedziałów czasowych

<img src="../img/aquamedic/zone_4.png"/>

Dzień od 00:00 do 24:00, jeden blok na
przedział — jego wysokość to zaprogramowana prędkość, pauza karmienia
jest zakreskowana na całej wysokości, zatrzymanie to cienki pasek na linii
bazowej. Czerwony kursor wskazuje bieżącą godzinę. Wykres jest
przygaszony, gdy timer jest wyłączony, bo pompa ignoruje wtedy program.

## Animacje

Obraz pokazuje, co robi pompa:

- **SmartDrift / EcoDrift**: cztery faliste strumienie rozchodzą się
  wachlarzem z przodu pompy. Nabrzmiewają w rytm częstotliwości fali, a w
  trybie stałego przepływu pozostają równe.
- **DC Runner**: woda jest zasysana wlotem i wypychana w górę wylotem.
- **DC Skimmer**: obraz z pianą, gdy pompa pracuje, obraz spoczynkowy, gdy
  jest wyłączona lub wstrzymana przez pauzę karmienia; w komorze reakcyjnej
  unoszą się pasma, szybciej wraz z prędkością silnika, a w kubku pękają
  bąbelki. Nie ma stanu „pełny kubek": firmware Aqua Medic go nie wykrywa.

Woda porusza się tym szybciej, im wyższa jest prędkość. Nic nie jest
rysowane, gdy pompa jest wyłączona, wstrzymana przez pauzę karmienia albo
ustawiona na 0 %.

## Edycja programu

<img src="../img/aquamedic/schedule_editor.png"/>

Kliknij wykres (albo przytrzymaj ikonę timera), aby otworzyć edytor: jeden
wiersz na przedział z początkiem, końcem, trybem i wartością (prędkość w %
albo minuty dla pauzy karmienia), a w SmartDrift dodatkowo częstotliwość i
pływ. Przedziały można dodawać i usuwać. **Zapisz** zapisuje od nowa
cały program pompy usługą `aquamedic.set_schedule`; **Anuluj** niczego
nie zmienia.

Edytor pilnuje tego, co pompa akceptuje: przedziały nie mogą się nakładać
ani przechodzić przez północ (okno nocne zapisz jako dwa przedziały),
przedział DC Runner pracuje z prędkością 30 % lub wyższą, pauza karmienia
trwa od 1 do 60 minut, a pompa mieści 48 przedziałów.

> [!NOTE]
> Program wymaga ha-aquamedic-component z sensorem `schedule`. W starszej
> wersji wykres po prostu nie jest rysowany.

> [!NOTE]
> DC Runner ze starym firmware (prędkość nazwana `flow`, brak timera) używa
> tych samych widoków: elementy, których jej brakuje, są ukryte.

## Układ

Każdy widok ma własną ramkę i własne rozmieszczenie, w stałych `PICTURE` i
`LAYOUT` swojego mappingu (`dcrunner.mapping.ts`, `dcskimmer.mapping.ts`,
`smartdrift.mapping.ts`): położenie obrazu, środek każdej ikony, środek i
rozmiar pierścienia prędkości. Punkty rysowane na obrazie są podane w
procentach obrazu, więc jego przesunięcie lub zmiana rozmiaru przesuwa je
razem z nim. Jak każdy element, można je też nadpisać w konfiguracji karty.

---

[← Powrót do strony głównej](README.pl.md)
