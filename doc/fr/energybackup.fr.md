[← Retour à la page principale](README.fr.md)

# Batterie de secours

La carte dessine les flux d'énergie de [reefbeatEnergyBackup](https://github.com/Elwinmage/reefbeatEnergyBackup) : le secteur, la batterie, l'aquarium et jusqu'à quatre pompes avec leur vitesse.

<img src="../img/energybackup/overview.png"/>

Le service publie ses capteurs en MQTT : son appareil (`Reef Battery Backup` par défaut) apparaît dans le sélecteur d'appareils de la carte dès que Home Assistant l'a découvert. Rien d'autre n'est à configurer : la carte trouve seule les capteurs et les pompes.

## Power Flow Card Plus

Les flux sont dessinés par [Power Flow Card Plus](https://github.com/flixlix/power-flow-card-plus), une carte à part qu'il faut installer (HACS → Interface). Tant qu'elle manque, la vue affiche un lien qui l'ouvre dans HACS :

<img src="../img/energybackup/install.png"/>

Les flux remplacent ce panneau dès que la carte est chargée. Sa configuration est écrite par la reef card : ni YAML `power-flow-card-plus`, ni capteur template, ni `config-template-card` ne sont nécessaires.

## La vue

La carte est divisée en 5 zones :

1. Titre et maintenance
2. Secteur
3. Batterie
4. Aquarium
5. Pompes

<img src="../img/energybackup/energybackup_zones.png"/>

Un clic sur un nœud ouvre l'entité correspondante.

## Titre et maintenance

<img src="../img/energybackup/zone_1.png"/>

Le nom de l'appareil. L'icône `mdi:wrench-clock` ouvre les tâches de maintenance de l'appareil (le test de décharge batterie), comme sur les autres vues.

## Secteur

<img src="../img/energybackup/zone_2.png"/>

Puissance fournie par le chargeur. Pendant une coupure : **Coupure** et sa durée.

La puissance chargeur n'existe qu'avec un chargeur Victron. Sans elle, le nœud secteur indique seulement si le secteur est présent, et le nœud aquarium montre ce que fournit la batterie : rien sur secteur, puisque le moniteur de batterie ne voit que le courant de la batterie.

## Batterie

<img src="../img/energybackup/zone_3.png"/>

Puissance de charge ou de décharge, état de charge.

## Aquarium

<img src="../img/energybackup/zone_4.png"/>

Ce que consomme l'équipement (secteur et batterie réunis), avec l'autonomie restante en dessous.

## Pompes

<img src="../img/energybackup/zone_5.png"/>

Vitesse en %, sens d'une pompe de brassage, icône qui suit la vitesse. Chaque pompe porte son nom dans Home Assistant ; pour une pompe ReefRun, le nom donné à la pompe elle-même. La voie d'un ReefRun sur laquelle rien n'est branché n'est pas affichée.

Les pompes sont cherchées parmi les ReefWave, les pompes ReefRun et les pompes Aqua Medic de l'installation. Par défaut le flux affiche celles que pilote le service de secours (il en publie la liste : une pompe ajoutée ou retirée avec `configure.py` suit après un redémarrage du service). Quand le service ne publie pas la liste, les premières pompes qui répondent encore sont affichées, pompes de brassage en premier. La carte de flux dessine quatre pompes au plus : au-delà, cochez celles à afficher dans l'éditeur de la carte.

<img src="../img/energybackup/editor.png"/>

La sélection est enregistrée avec les options de l'appareil, sous forme d'identifiants d'appareils Home Assistant :

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
