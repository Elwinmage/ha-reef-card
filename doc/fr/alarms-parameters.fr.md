[← Retour à la page principale](README.fr.md)

# Alarme commune et suivi des paramètres

Deux petites cartes accompagnent la reef card. Elles n'ont pas besoin de choisir un appareil.

## Alarme commune (`custom:reef-alarms-card`)

Un seul indicateur pour toutes les alarmes du bac : vert **OK** tant que tout va bien, rouge avec le nombre d'alarmes dès qu'une est active. Un appui liste les alarmes en cours, avec leur appareil et depuis quand ; un appui sur l'une ouvre son entité.

Une alarme est un capteur binaire d'une intégration du bac (redsea, aquamedic, reeftank, reef_maintenance) dont la classe indique un problème (problem, safety, moisture pour une fuite, battery pour une batterie faible…) et qui est actif.

```yaml
type: custom:reef-alarms-card
title: Aquarium # optionnel
entities: # alarmes en plus, de n'importe quelle intégration
  - binary_sensor.flotteur_decante
exclude: # alarmes à ne pas afficher
  - binary_sensor.reefdose_head_3_regulation_alarm
integrations: [redsea, reeftank] # optionnel, par défaut : les intégrations du bac
device_classes: [problem, moisture] # optionnel
```

Sur une [vue aquarium](aquarium.fr.md), l'éditeur de scène l'ajoute avec **+ Alarme commune** (onglet Éléments) : un repère à placer n'importe où sur la photo (nécessite reeftank avec le rôle `alarms`).

## Suivi des paramètres (`custom:reef-parameters-card`)

Un graphique par paramètre suivi (KH, Ca, Mg, Fe…), tracé sur ses zones verte (souhaitée), orange (acceptable) et rouge (danger) ; la dernière valeur prend la couleur de sa zone.

Sans `parameters`, la carte suit ce que les intégrations portent déjà : d'abord les capteurs de chimie de l'intégration reeftank — la source canonique, celle contre laquelle un test saisi à la main est enregistré —, puis une tête ReefDose en dosage assisté pour une chimie que reeftank ne couvre pas. Dans les deux cas, le graphique est tracé à partir des résultats que garde l'intégration, et le bouton ✎ les ouvre pour en ajouter un à une date passée, en corriger ou en supprimer un. Toute autre entité (un test saisi par une automatisation, un résultat ICP…) est tracée à partir de l'historique.

### Suivre un seul aquarium

Avec `aquarium`, la carte ne suit que ce bac : les capteurs de chimie enregistrés contre lui et les têtes ReefDose qui y sont placées, jamais ceux d'un autre bac. L'éditeur visuel liste les aquariums et écrit leur **id**, pas leur nom : renommer le bac — ou une entité — n'y change rien. Le titre porte alors le nom de l'aquarium, sauf si `title` en impose un autre.

`parameters` est alors lu comme des **surcharges** fusionnées par-dessus la liste du bac : une source à soi, un `name`, des `ranges`, ou `hide: true` pour retirer une chimie. Une chimie testée pour la première fois apparaît toute seule, et la configuration ne porte que ce qui a été changé.

```yaml
type: custom:reef-parameters-card
aquarium: 01HX… # l'id, écrit par l'éditeur
parameters:
  - chemistry: temperature
    source: sensor.ma_sonde # la lire sur ma sonde
  - chemistry: fe
    hide: true # pas dans cette carte
```

Sans `aquarium`, la liste remplace les valeurs par défaut comme auparavant, et les chimies de tous les aquariums sont mélangées dans la même carte.

```yaml
type: custom:reef-parameters-card
title: Tests de l'eau # optionnel
days: 90 # fenêtre des graphiques (90 par défaut)
parameters:
  - parameter: kh
    entity: sensor.reefdose_head_1_last_test_result
  - parameter: fe
    entity: sensor.tests_fer
    name: Fer
    ranges: [0.002, 0.005, 0.02, 0.05] # acceptable bas, souhaité bas, souhaité haut, acceptable haut
```

`ranges` est optionnel pour `kh ca mg k no2 no3 po4 i fe salinity ph`, qui ont des zones usuelles ; l'attribut `ranges` de l'entité l'emporte quand il existe.
