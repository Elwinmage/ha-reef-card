[← Powrót do strony głównej](README.pl.md)

# Konserwacja

Widok konserwacji w ha-reef-card w akcji:

[![Obejrzyj wideo](https://img.youtube.com/vi/Ko46fHonOP4/0.jpg)](https://www.youtube.com/watch?v=Ko46fHonOP4)

<img src="../img/maintenance/overview.png"/>

Poza widokami poszczególnych urządzeń karta oferuje widok **Konserwacja**, który
zbiera wszystkie zadania konserwacyjne udostępniane przez
`ha-reefbeat-component`, `ha-reef-maintenance-component` i
`ha-aquamedic-component`, tak jakby cały podsystem konserwacji był jednym
urządzeniem. Widok szuka znacznika, który każda z nich umieszcza na swoich
encjach, a nie konkretnej integracji.

Każde zadanie jest pokazane jako pasek postępu wskazujący, jaka część jego
interwału już minęła, w kolorze zależnym od pozostałego czasu:

| Kolor        | Znaczenie                                                   |
| ------------ | ----------------------------------------------------------- |
| Zielony      | Aktualne                                                    |
| Pomarańczowy | Wkrótce termin (ostatnie 20 % interwału, co najmniej dzień) |
| Czerwony     | Po terminie, etykieta zmienia się na `+X d`                 |
| Szary        | Nigdy nie wykonane (brak zapisanego zerowania)              |

Zadania można sortować **według sprzętu** (pogrupowane, z nagłówkiem dla każdego
urządzenia) lub **według terminu** (płaska lista, najpilniejsze na górze).
Zadania nigdy niewykonane zawsze trafiają na koniec. Na pasku narzędzi są dwa
filtry: pole wyboru ukrywające zadania wciąż aktualne oraz przycisk **Ukryj
wyciszone / Pokaż wyciszone**, który ukrywa zadania z wyłączonym przełącznikiem
powiadomień. Przycisk startuje w położeniu „pokaż”, więc wyciszenie alertu nigdy
samo z siebie nie sprawia, że termin znika. Tę wartość domyślną ustawia się w
edytorze karty (lub kluczem `hide_muted` poniżej), a przycisk i tak ma
pierwszeństwo w każdej chwili.

Kliknięcie wiersza otwiera okno more-info Home Assistant dla danego zadania, a
okrągły przycisk po prawej oznacza je jako wykonane (naciska leżącą u podstaw
encję przycisku, dokładnie tak jak zrobiłoby okno more-info).

Widok pojawia się w selektorze urządzeń tylko wtedy, gdy w instalacji istnieje
co najmniej jedno zadanie konserwacyjne. Nowe zadania dodane do katalogu
integracji pojawiają się automatycznie, bez aktualizacji karty.

### Powiadomienia

Każde zadanie ma też **przełącznik powiadomień** w integracji
(`switch.*_notify`, wyświetlany jako „<nazwa zadania> (powiadomienia)”).
Wyłączenie go wycisza alert o przekroczeniu terminu tego jednego zadania, nie
zmieniając jego harmonogramu: pasek postępu nadal biegnie, wiersz po prostu
przygasa, a dzwonek gaśnie.

Dzwonek po prawej stronie wiersza przełącza ten przełącznik bezpośrednio.
Pojawia się tylko wtedy, gdy integracja udostępnia przełącznik. Ustaw
`show_notify: false`, aby ukryć dzwonki.

Blueprint alertów czyta dokładnie to samo ustawienie, więc wyciszenie zadania w
karcie wycisza także automatyzację.

### Zmiana interwału

Przycisk kalendarza w każdym wierszu rozwija suwak zapisujący do encji liczbowej
interwału zadania. Suwak działa w jednostce ogłaszanej przez integrację dla tego
zadania (dni, tygodnie lub miesiące, odczytanej z roli encji), a integracja
przelicza z powrotem na dni przed zapisem. Granice pochodzą z samej encji, więc
karta nigdy nie zapisze wartości spoza zakresu. Naraz otwarty pozostaje tylko
jeden edytor. Ustaw `show_interval: false`, aby ukryć przyciski.

### Filtrowanie według urządzenia

Domyślnie widok wyświetla zadania wszystkich urządzeń. Blok **Filtruj według
urządzenia** w edytorze karty go zawęża: zaznacz jedno lub kilka urządzeń, a
pozostaną tylko ich zadania, wraz z licznikami.

<img src="../img/maintenance/editor_devices.png"/>

Lista zawiera jedną pozycję na sterownik, wraz z liczbą przypisanych do niego
zadań. Podurządzenia (głowice ReefDose, pompy ReefRun) są grupowane pod swoim
sterownikiem dzięki powiązaniu `via_device` z rejestru Home Assistant:
zaznaczenie **RSDose4** zachowuje więc zadania wszystkich czterech głowic. Brak
zaznaczeń oznacza „brak filtra": wyświetlane są wszystkie urządzenia, co
przywraca też skrót **Pokaż wszystkie urządzenia**.

Wybór jest zapisywany jako nazwy urządzeń (patrz `devices` poniżej), aby YAML
pozostał czytelny. Nazwa wpisana ręcznie pasuje również do jej podurządzeń przez
przedrostek, co obejmuje instalacje bez zadeklarowanego `via_device`. Urządzenia
bez nazwy są identyfikowane przez swój identyfikator urządzenia Home Assistant.

### Pompy ReefRun

Podurządzenia ReefRun noszą nazwy „… pompa 1” / „… pompa 2”, co nic nie mówi o
tym, czym każda pompa naprawdę jest. Gdy urządzenie udostępnia zarówno sensor
`type`, jak i `model`, karta dopisuje je w nawiasie: **ReefRun pompa 1 (powrotna 12000)**, **ReefRun pompa 2 (odpieniacz 900)**.

Typ jest tłumaczony, a z modelu zachowywana jest tylko końcowa liczba
(`return-12000` -> `12000`, `rsk-900` -> `900`), ponieważ przedrostek jest albo
powtórzeniem typu, albo nieczytelny. Urządzenia niebędące pompami zachowują
zwykłą nazwę.

## Ikony

| Ikona                                                                                                    | Rola                                                                              |
| -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| <img src="../img/mdi/mdi_check.png" width="20"/>                                                         | **Zadanie wykonane.** Oznacza zadanie jako wykonane i restartuje jego odliczanie. |
| <img src="../img/mdi/mdi_bell-ring.png" width="20"/> <img src="../img/mdi/mdi_bell-off.png" width="20"/> | **Wycisz / włącz.** Przełącza przełącznik powiadomień tego jednego zadania.       |
| <img src="../img/mdi/mdi_calendar-edit.png" width="20"/>                                                 | **Zmień interwał.** Rozwija suwak powiązany z interwałem zadania.                 |

## Edytor

Domyślny stan filtrów, filtr według urządzenia oraz widoczność trzech przycisków
ustawia się w edytorze karty.

<img src="../img/maintenance/editor.png"/>

## Konfiguracja

```yaml
type: custom:reef-card
device: __maintenance__
maintenance:
  sort: due # "device" (domyślnie) lub "due"
  devices: # pokaż tylko zadania tych urządzeń (pusto: wszystkie)
    - SIMU-RSDOSE4
    - SIMU-RSATO
  hide_ok: false # ukryj zadania ani po terminie, ani zbliżające się
  hide_muted: false # ukryj zadania z wyłączonymi powiadomieniami
  warning_ratio: 0.2 # część interwału pokazywana na pomarańczowo
  show_reset: true # pokaż przycisk „oznacz jako wykonane” w każdym wierszu
  show_notify: true # pokaż dzwonek wyciszenia/włączenia w każdym wierszu
  show_interval: true # pokaż przycisk edycji interwału w każdym wierszu
```

Wszystkie klucze `maintenance` są opcjonalne. `sort` i `hide_ok` ustalają tylko
stan początkowy: użytkownik może je zmienić z poziomu samego widoku. `devices`
przyjmuje zarówno nazwy urządzeń, jak i identyfikatory urządzeń Home Assistant;
pusta lista (wartość domyślna) wyłącza filtr.

---

[← Powrót do strony głównej](README.pl.md)
