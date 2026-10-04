[← Powrót do strony głównej](README.pl.md)

# Zasilanie awaryjne

Karta rysuje przepływy energii z [reefbeatEnergyBackup](https://github.com/Elwinmage/reefbeatEnergyBackup): sieć, baterię, akwarium i do czterech pomp z ich prędkością.

<img src="../img/energybackup/overview.png"/>

Usługa publikuje swoje czujniki przez MQTT: jej urządzenie (domyślnie `Reef Battery Backup`) pojawia się w selektorze urządzeń karty, gdy tylko Home Assistant je wykryje. Nic więcej nie trzeba konfigurować: karta sama znajduje czujniki i pompy.

## Power Flow Card Plus

Przepływy rysuje [Power Flow Card Plus](https://github.com/flixlix/power-flow-card-plus), osobna karta, którą trzeba zainstalować (HACS → Frontend). Dopóki jej brakuje, widok pokazuje link otwierający ją w HACS:

<img src="../img/energybackup/install.png"/>

Przepływy zastępują ten panel, gdy tylko karta zostanie załadowana. Jej konfigurację zapisuje reef card: nie potrzeba YAML `power-flow-card-plus`, czujnika szablonowego ani `config-template-card`.

## Widok

Karta jest podzielona na 5 stref:

1. Tytuł i konserwacja
2. Sieć
3. Bateria
4. Akwarium
5. Pompy

<img src="../img/energybackup/energybackup_zones.png"/>

Kliknięcie węzła otwiera odpowiadającą mu encję.

## Tytuł i konserwacja

<img src="../img/energybackup/zone_1.png"/>

Nazwa urządzenia. Ikona `mdi:wrench-clock` otwiera zadania konserwacji urządzenia (test rozładowania baterii), jak w pozostałych widokach.

## Sieć

<img src="../img/energybackup/zone_2.png"/>

Moc dostarczana przez ładowarkę. Podczas awarii: **Awaria** i czas jej trwania.

Moc ładowarki istnieje tylko z ładowarką Victron. Bez niej węzeł sieci pokazuje jedynie, czy sieć jest obecna, a węzeł akwarium pokazuje to, co oddaje bateria: nic przy zasilaniu z sieci, bo monitor baterii widzi tylko prąd baterii.

## Bateria

<img src="../img/energybackup/zone_3.png"/>

Moc ładowania lub rozładowania, stan naładowania.

## Akwarium

<img src="../img/energybackup/zone_4.png"/>

Pobór sprzętu (sieć i bateria razem), a pod nim pozostały czas pracy.

## Pompy

<img src="../img/energybackup/zone_5.png"/>

Prędkość w %, kierunek pompy falującej, ikona zależna od prędkości. Każda pompa nosi swoją nazwę z Home Assistant; w przypadku pompy ReefRun nazwę nadaną samej pompie. Kanał ReefRun, do którego nic nie jest podłączone, jest pomijany.

Pompy są wyszukiwane wśród ReefWave, pomp ReefRun i pomp Aqua Medic w instalacji. Domyślnie przepływ pokazuje te, którymi steruje usługa zasilania awaryjnego (publikuje ich listę: pompa dodana lub usunięta przez `configure.py` pojawia się po restarcie usługi). Gdy usługa nie publikuje listy, pokazywane są pierwsze pompy, które nadal odpowiadają, najpierw pompy falujące. Karta przepływów rysuje najwyżej cztery pompy: przy większej liczbie zaznacz te do pokazania w edytorze karty.

<img src="../img/energybackup/editor.png"/>

Wybór jest zapisywany z opcjami urządzenia, jako identyfikatory urządzeń Home Assistant:

```yaml
type: custom:reef-card
device: reef_battery
conf:
  ENERGYBACKUP:
    devices:
      reef_battery:
        pumps:
          - 0a1b2c3d4e5f60718293a4b5c6d7e8f9
          - 9f8e7d6c5b4a39281706f5e4d3c2b1a0
```
