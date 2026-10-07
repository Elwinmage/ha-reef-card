[← Powrót do strony głównej](README.pl.md)

# ReefWave

ReefWave z ha-reef-card w akcji:

[![Obejrzyj wideo](https://img.youtube.com/vi/sYVeE0zV3eo/0.jpg)](https://www.youtube.com/watch?v=sYVeE0zV3eo)

ReefWave **RSWAVE25** i **RSWAVE45** są obsługiwane.

<img src="../img/rswave/rswave.png"/>

> [!IMPORTANT]
> Pompy ReefWave zależą od chmury ReefBeat bardziej niż inne urządzenia:
> najpierw przeczytaj [to](https://github.com/Elwinmage/ha-reefbeat-component/blob/main/doc/pl/reefwave.pl.md#reefwave). Z kontem w chmurze połączonym w
> ha-reefbeat-component karta pracuje na bibliotece fal i grupach aplikacji
> ReefBeat, a obie strony pozostają zsynchronizowane. Bez konta zobacz
> [Bez konta w chmurze](#bez-konta-w-chmurze).

## Widok

Karta jest podzielona na 7 stref:

1. Komunikaty
2. Klipsy mocujące
3. Pasek LED
4. Zaślepka
5. Przepływ
6. Grupa
7. Program dnia

<img src="../img/rswave/rswave_zones.png"/>

## Komunikaty

<img src="../img/rswave/zone_1.png"/>

Ostatni komunikat i ostatni alert, na górze.

## Klipsy mocujące

<img src="../img/rswave/zone_2.png"/>

Włącz/wyłącz, konserwacja, ustawienia i Wi-Fi.

## Pasek LED

<img src="../img/rswave/zone_3.png"/>

Tryb pompy, jasną bielą (dotknięcie otwiera jego
szczegóły), a pod nim nazwa pompy.

## Zaślepka

<img src="../img/rswave/zone_4.png"/>

Prędkość jako czerwony pierścień dopasowany do zaślepki:
intensywność do przodu bieżącej fali, podglądu podczas podglądu, oraz 0,
gdy pompa nie pracuje (wyłączona, karmienie, konserwacja, brak fali).
Strzałki w środku pokazują kierunek: → do przodu, ← do tyłu, obie dla fali
naprzemiennej. Dotknij zaślepki, aby ustawić
[tę pompę w bieżącej fali](#ta-pompa-w-bieżącej-fali).

## Przepływ

<img src="../img/rswave/zone_5.png"/>

Pod pompą, woda animowana z tą prędkością: w lewo dla fali
do przodu, w prawo dla fali do tyłu, tam i z powrotem dla naprzemiennej.
Gdy pompa stoi, nic nie jest rysowane.

## Grupa

<img src="../img/rswave/zone_6.png"/>

Pompy grupy w rzędzie, każda z miniaturą i nazwą, w kolejności
grupy. Pompa tej karty jest zakreślona; dotknij innej, aby pokazać jej
własną kartę. Pompa, do której Home Assistant nie ma dostępu, jest
wyszarzona. Dla pojedynczej pompy nic nie jest pokazywane.

## Program dnia

<img src="../img/rswave/zone_7.png"/>

Dzień od 00:00 do 24:00, jeden blok na przedział w
kolorze jego typu fali: intensywność do przodu rośnie ponad linię
środkową, do tyłu opada pod nią. Przedział „bez fali" to linia
przerywana. Legenda typów (piktogram i nazwa) jest pod wykresem, a
czerwony kursor wskazuje bieżącą godzinę. Dotknij wykresu, aby edytować
program; przycisk **Fale** nad nim otwiera bibliotekę.

Typy fal: Jednostajna, Losowa, Regularna,
Schodkowa, Powierzchniowa i Brak fali, z piktogramami
aplikacji ReefBeat.

## Edytor programu

<img src="../img/rswave/program_editor.png"/>

Dotknij programu dnia: na górze wykres szkicu, potem jeden wiersz na
przedział z początkiem, końcem, falą wybraną z biblioteki, jej typem,
kierunkiem i intensywnościami tej pompy. Przedziały można dodawać i usuwać;
**Zapisz** zapisuje program, **Anuluj** niczego nie
zmienia.

- Program jest zapisywany na **każdej pompie grupy**, każda z własnymi
  intensywnościami. Gdy pompa grupy jest niedostępna, zapis jest
  zablokowany, tak jak w aplikacji ReefBeat: grupa pozostaje
  zsynchronizowana.
- Program zaczyna się o 00:00, dwa przedziały nie mogą zaczynać się o tej
  samej godzinie, a każdy przedział potrzebuje fali.
- Pod notatką o grupie przycisk grupuje pompę z ReefWave jej akwarium
  (**Grupuj z ReefWave akwarium**) albo ją rozgrupowuje (**Rozgrupuj tę pompę**). W
  grupie kolejność jej pomp zmienia się przeciąganiem albo strzałkami ‹ ›.
- Pod tabelą strefa fal pokazuje bibliotekę na fali bieżącego przedziału;
  ołówek w wierszu albo wybór fali pokazuje tę falę.

## Biblioteka fal

<img src="../img/rswave/library.png"/>

Przycisk **Fale** wyświetla fale akwarium, tak jak
przechowuje je aplikacja ReefBeat: fale Red Sea i Twoje, każda z pompami,
które jej używają. Wybranie fali pokazuje jej ustawienia:

- jej **typ**, wybierany z piktogramów;
- jej **kształt**: czasy do przodu i do tyłu (min), czas impulsu (s) i
  kroki, zależnie od tego, czego używa jej typ. Kształt jest wspólny dla
  wszystkich pomp używających fali;
- intensywności do przodu i do tyłu **tej pompy** oraz to, czy jest
  zsynchronizowana z grupą.

Następnie **Zaktualizuj falę** zapisuje falę (programy, które jej używają,
są zapisywane ponownie), **Utwórz nową falę** pyta o nazwę i dodaje kopię z
tymi ustawieniami, a **Usuń** usuwa falę, której nie używa
żaden program. Falę Red Sea można tylko skopiować.

**Podgląd na tej pompie**: wybierz kierunek i czas trwania (od 1 do 10 min), a
potem **Podgląd**; pompa odtwarza falę, a następnie wraca
do swojego programu. **Zatrzymaj podgląd** kończy ją od razu.

## Ta pompa w bieżącej fali

<img src="../img/rswave/pump_settings.png"/>

Dotknij zaślepki, aby zmienić kierunek oraz intensywności do przodu / do
tyłu tej pompy w bieżącej fali. Zmienia się tylko ta pompa: pozostałe pompy
grupy zachowują swój kierunek i swoje intensywności, ponieważ aplikacja
ReefBeat pozwala każdej pompie grupy odtwarzać falę po swojemu.

## Ustawienia

<img src="../img/rswave/dialog_config.png"/>

Zębatka otwiera ustawienia pompy: bieżącą falę (typ, kierunek,
intensywności, czasy, kroki), `Opóźnienie wyłączenia skrótu`,
`Zgrupowana z akwarium`, ustawienia i przyciski podglądu z integracji
oraz akcje urządzenia (odświeżenie, reset, aktualizacja firmware).

## Bez konta w chmurze

Biblioteka fal i grupy znajdują się w chmurze ReefBeat. Bez konta w chmurze
połączonego z pompą proponowane są tylko fale bieżącego programu, program
jest zapisywany na samej pompie, a biblioteki nie można edytować.

> [!NOTE]
> Widok wymaga ha-reefbeat-component z atrybutem `schedule` sensora
> `wave_type`, sensorem `linked_waves` i usługami `redsea.wave_*`.

---

[← Powrót do strony głównej](README.pl.md)
