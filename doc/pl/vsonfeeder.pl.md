[← Powrót do strony głównej](README.pl.md)

# Karmnik VSON (przerobiony)

Karta steruje automatycznym karmnikiem VSON, którego sterownik zastąpiono układem ESP32 (Lolin S2 mini) z [ESPHome](https://esphome.io). Karmnik zachowuje silnik, czujnik klapki i czujnik poziomu karmy; firmware dodaje pięć slotów karmienia i przełącznik karmienia ręcznego.

<img src="../img/vsonfeeder/overview.png" width="400"/>

## Przeróbka karmnika

Karmnik (VSON WP8621 V1.2) należy otworzyć i zastąpić jego oryginalną płytkę układem ESP32: podłączenie silnika, czujnika klapki i czujnika poziomu karmy oraz flashowanie opisano w tym wątku społeczności Home Assistant: [VSON WP8621 V1.2 fish feeder](https://community.home-assistant.io/t/vson-wp8621-v12-fish-feeder/759621).

## Firmware

Konfiguracja ESPHome znajduje się w [doc/esphome/vson-fish-feeder.yaml](../esphome/vson-fish-feeder.yaml). Klucze i hasła umieść w `secrets.yaml` (`fish_feeder_api_key`, `fish_feeder_ota_password`, `fish_feeder_ap_password` oraz `wifi_ssid` i `wifi_password`).

Urządzenia ESPHome nie mają identyfikatora, na którym karta mogłaby polegać, więc karmnik jest rozpoznawany po **nazwie projektu** deklarowanej przez firmware:

```yaml
esphome:
  project:
    name: "vson.fish_feeder"
    version: "1.2.0"
```

Home Assistant zamienia ją na producenta (`vson`) i model (`fish_feeder`) urządzenia. Po sflashowaniu karmnik pojawia się w wyborze urządzeń karty. Każde inne urządzenie ESPHome jest ignorowane.

Encje są wyszukiwane po końcówce ich identyfikatora, więc nazwę urządzenia można dowolnie zmieniać. Zachowaj nazwy encji z firmware (`Manual Feed`, `Open/Close Sensor`, `Food Level Sensor`, `Slot 1`…`Slot 5`, `Portion slot 1`…`Portion slot 5`).

## Widok

Karta jest podzielona na 2 strefy:

1. Karmnik
2. Sloty karmienia

### 1. Karmnik

Obraz podąża za czujnikami:

|                      | Zapas OK                                                                   | Niski zapas                                                                 |
| -------------------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| **Klapka zamknięta** | <img src="../../src/img/esphome/VSONFEEDER/closed_full.webp" width="120"/> | <img src="../../src/img/esphome/VSONFEEDER/closed_empty.webp" width="120"/> |
| **Klapka otwarta**   | <img src="../../src/img/esphome/VSONFEEDER/open_full.webp" width="120"/>   | <img src="../../src/img/esphome/VSONFEEDER/open_empty.webp" width="120"/>   |

- Gdy klapka jest otwarta (lub pracuje silnik), wypada z niej granulat.
- Na karmniku umieszczono cztery elementy, odkształcone zgodnie z jego ściankami:
  - na przedniej ściance, nad klapką, mały wyświetlacz podaje **czas pracy** sterownika (kliknięcie otwiera sensor);
  - na szybce pokrywy **miga** czerwone ostrzeżenie, gdy czujnik poziomu karmy zgłasza niski zapas (kliknięcie otwiera sensor);
  - na prawej ściance **karmienia dnia**: przekreślone na szaro po upływie godziny, następne na pomarańczowo, późniejsze na zielono. Tylko godziny mówią, które minęły: firmware nie zapisuje podanych porcji;
  - niżej na prawej ściance przycisk **restartu**: pierwsze dotknięcie go uzbraja (robi się pomarańczowy), drugie w ciągu 3 sekund restartuje sterownik.
- Kliknięcie obrazu otwiera sensor klapki.
- Ikona <img src="https://raw.githubusercontent.com/Templarian/MaterialDesign/master/svg/wrench-clock.svg" width="16"/> w prawym górnym rogu otwiera zadania konserwacyjne karmnika, jeśli je ma.

<img src="../img/vsonfeeder/feeding.png" width="400"/>

### 2. Sloty karmienia

- **Następne karmienie**: godzina następnego slotu, pozostały czas i jego porcje.
- **Sloty**: pięć slotów firmware. Godzinę edytuje się na miejscu (`time.set_value`), porcje przyciskami − i + (`number.set_value`, od 0 do 10). Slot z 0 porcji jest wyłączony i wyszarzony. Następny slot jest wyróżniony.
- Slot ustawiony na tę samą godzinę co wcześniejszy jest przekreślony: firmware pomija go, dopóki pierwszy jeszcze karmi.
- **Porcje dziennie**: porcje faktycznie podane w ciągu dnia.
- **Nakarm teraz**: podaje jedną porcję (włącza przełącznik `Manual Feed`; firmware wyłącza go po ponownym zamknięciu klapki).

<img src="../img/vsonfeeder/reserve_low.png" width="300"/>

Gdy Home Assistant nie może połączyć się ze sterownikiem, obraz robi się szary, a tytuł pokazuje _Niedostępny_.
