[← Retour à la page principale](README.fr.md)

# Distributeur de nourriture VSON (hacké)

La carte pilote un distributeur automatique de nourriture VSON dont le contrôleur a été remplacé par un ESP32 (Lolin S2 mini) sous [ESPHome](https://esphome.io). Le distributeur garde son moteur, son capteur de trappe et son capteur de niveau de nourriture ; le firmware ajoute cinq créneaux de distribution et un interrupteur de distribution manuelle.

<img src="../img/vsonfeeder/overview.png" width="400"/>

## Firmware

La configuration ESPHome se trouve dans [doc/esphome/vson-fish-feeder.yaml](../esphome/vson-fish-feeder.yaml). Mettez vos clés et mots de passe dans `secrets.yaml` (`fish_feeder_api_key`, `fish_feeder_ota_password`, `fish_feeder_ap_password`, ainsi que `wifi_ssid` et `wifi_password`).

Les appareils ESPHome n'ont pas d'identifiant sur lequel la carte puisse s'appuyer : le distributeur est reconnu au **nom de projet** déclaré par son firmware :

```yaml
esphome:
  project:
    name: "vson.fish_feeder"
    version: "1.2.0"
```

Home Assistant en tire le fabricant (`vson`) et le modèle (`fish_feeder`) de l'appareil. Une fois flashé, le distributeur apparaît dans le sélecteur d'appareils de la carte. Les autres appareils ESPHome sont ignorés.

Les entités sont retrouvées par la fin de leur entity id : l'appareil peut donc être renommé librement. Conservez les noms d'entités du firmware (`Manual Feed`, `Open/Close Sensor`, `Food Level Sensor`, `Slot 1`…`Slot 5`, `Portion slot 1`…`Portion slot 5`).

## La vue

La carte est divisée en 2 zones :

1. Le distributeur
2. Les créneaux

### 1. Le distributeur

L'image suit les capteurs :

|                    | Réserve OK                                                                 | Réserve basse                                                               |
| ------------------ | -------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| **Trappe fermée**  | <img src="../../src/img/esphome/VSONFEEDER/closed_full.webp" width="120"/> | <img src="../../src/img/esphome/VSONFEEDER/closed_empty.webp" width="120"/> |
| **Trappe ouverte** | <img src="../../src/img/esphome/VSONFEEDER/open_full.webp" width="120"/>   | <img src="../../src/img/esphome/VSONFEEDER/open_empty.webp" width="120"/>   |

- Tant que la trappe est ouverte (ou que le moteur tourne), des granulés en tombent.
- Trois éléments sont « collés » sur les faces du distributeur, inclinés pour les suivre :
  - sur la face avant, au-dessus de la trappe, un petit afficheur donne le **temps de fonctionnement** du contrôleur (un clic ouvre le capteur) ;
  - sur la face droite, un avertissement rouge **clignote** quand le capteur de niveau signale une réserve basse (un clic ouvre le capteur) ;
  - plus bas sur la face droite, le bouton **redémarrer** : une première touche l'arme (il passe en orange), une seconde dans les 3 secondes redémarre le contrôleur.
- Un clic sur l'image ouvre le capteur de trappe.
- L'icône <img src="https://raw.githubusercontent.com/Templarian/MaterialDesign/master/svg/wrench-clock.svg" width="16"/> en haut à droite ouvre les tâches de maintenance du distributeur, s'il en a.

<img src="../img/vsonfeeder/feeding.png" width="400"/>

### 2. Les créneaux

- **Prochain repas** : l'heure du prochain créneau, le temps restant et ses portions.
- **Créneaux** : les cinq créneaux du firmware. L'heure se modifie directement (`time.set_value`), les portions avec les boutons − et + (`number.set_value`, de 0 à 10). Un créneau à 0 portion est désactivé et grisé. Le prochain créneau est mis en évidence.
- Un créneau réglé à la même heure qu'un créneau précédent est barré : le firmware l'ignore tant que le premier distribue.
- **Portions par jour** : les portions réellement données dans la journée.
- **Nourrir maintenant** : donne une portion (allume l'interrupteur `Manual Feed` ; le firmware l'éteint une fois la trappe refermée).

<img src="../img/vsonfeeder/reserve_low.png" width="300"/>

Quand Home Assistant ne joint plus le contrôleur, l'image passe en gris et le titre indique _Injoignable_.
