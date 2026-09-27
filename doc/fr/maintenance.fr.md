[← Retour à la page principale](README.fr.md)

# Maintenance

La vue maintenance de ha-reef-card en action :

[![Voir la vidéo](https://img.youtube.com/vi/Ko46fHonOP4/0.jpg)](https://www.youtube.com/watch?v=Ko46fHonOP4)

<img src="../img/maintenance/overview.png"/>

En plus des vues par appareil, la carte propose une vue **Maintenance** qui
regroupe toutes les échéances de maintenance exposées par
`ha-reefbeat-component`, `ha-reef-maintenance-component` et
`ha-aquamedic-component`, comme si l'ensemble du sous-système de maintenance
était un appareil à part entière. La vue cherche le marqueur que chacune d'elles
pose sur ses entités, pas une intégration en particulier.

Chaque tâche est affichée sous forme de barre de progression indiquant la part
de l'intervalle déjà écoulée, avec une couleur qui dépend du temps restant :

| Couleur | Signification                                                    |
| ------- | ---------------------------------------------------------------- |
| Vert    | À jour                                                           |
| Orange  | Échéance proche (derniers 20% de l'intervalle, au moins un jour) |
| Rouge   | Échéance dépassée, le libellé passe à `+X j`                     |
| Gris    | Jamais effectuée (aucune remise à zéro enregistrée)              |

Les tâches peuvent être triées **par équipement** (regroupées, avec un en-tête
par appareil) ou **par échéance** (liste unique, la plus urgente en premier).
Les tâches jamais effectuées sont toujours placées en fin de liste. Deux filtres se trouvent dans la barre d'outils : une case à cocher masquant
les tâches encore à jour, et un bouton **Masquer / Afficher les silencieuses**
masquant les tâches dont l'interrupteur de notification est coupé. Le bouton
démarre en position « afficher », pour que couper une alerte ne fasse jamais
disparaître une échéance de lui-même. Ce défaut se règle depuis l'éditeur de
carte (ou via `hide_muted` ci-dessous), et le bouton permet toujours de le
contourner ponctuellement.

Un clic sur une ligne ouvre la fenêtre d'informations Home Assistant de la
tâche, et le bouton rond à droite marque la tâche comme effectuée (il actionne
l'entité `button` sous-jacente, exactement comme le ferait la fenêtre
d'informations).

La vue n'apparaît dans le sélecteur d'appareils que si au moins une tâche de
maintenance existe dans votre installation. Les nouvelles tâches ajoutées au
catalogue de l'intégration apparaissent automatiquement, sans mise à jour de la
carte.

### Notifications

Chaque tâche dispose aussi d'un **interrupteur de notification** dans
l'intégration (`switch.*_notify`, affiché « <nom de la tâche> (notifications) »).
Le désactiver coupe l'alerte de retard de cette seule tâche sans toucher à son
échéancier : la barre de progression continue d'avancer, la ligne est
simplement estompée et la cloche s'éteint.

La cloche à droite de chaque ligne bascule directement cet interrupteur. Elle
n'apparaît que si l'intégration expose l'interrupteur. Mettez
`show_notify: false` pour masquer les cloches.

Le blueprint d'alertes lit exactement le même réglage : couper une tâche depuis
la carte fait donc aussi taire l'automatisation.

### Modifier l'intervalle

Le bouton calendrier de chaque ligne déplie un curseur qui écrit dans l'entité
`number` d'intervalle de la tâche. Le curseur travaille dans l'unité que
l'intégration annonce pour cette tâche (jours, semaines ou mois, lue depuis son
rôle), et l'intégration reconvertit en jours avant stockage. Les bornes
proviennent de l'entité elle-même, la carte ne peut donc jamais écrire une
valeur hors plage. Un seul éditeur reste ouvert à la fois. Mettez
`show_interval: false` pour masquer les boutons.

### Filtrer par appareil

Par défaut, la vue liste les tâches de tous les appareils. Le bloc **Filtrer par
appareil** de l'éditeur de carte permet de la restreindre : cochez un ou
plusieurs appareils et seules leurs tâches sont conservées, compteurs compris.

<img src="../img/maintenance/editor_devices.png"/>

La liste contient une entrée par contrôleur, avec le nombre de tâches qui lui
sont rattachées. Les sous-appareils (têtes ReefDose, pompes ReefRun) sont
regroupés sous leur contrôleur grâce au lien `via_device` du registre Home
Assistant : cocher **RSDose4** conserve donc les tâches des quatre têtes. Aucune
case cochée signifie « pas de filtre » : tous les appareils sont affichés, ce que
rétablit aussi le raccourci **Afficher tous les appareils**.

La sélection est enregistrée sous forme de noms d'appareils (voir `devices`
ci-dessous), pour garder un YAML lisible. Un nom saisi à la main correspond aussi
à ses sous-appareils par préfixe, ce qui couvre les installations où
`via_device` n'est pas déclaré. Les appareils sans nom sont identifiés par leur
identifiant Home Assistant.

### Pompes ReefRun

Les sous-appareils ReefRun s'appellent « … pump 1 » / « … pump 2 », ce qui ne
dit rien de ce qu'est réellement chaque pompe. Quand l'appareil expose à la fois
un capteur `type` et un capteur `model`, la carte les ajoute entre parenthèses :
**ReefRun pump 1 (Retour 12000)**, **ReefRun pump 2 (Écumeur 900)**.

Le type est traduit, et seul le nombre final du modèle est conservé
(`return-12000` -> `12000`, `rsk-900` -> `900`), le préfixe étant soit redondant
avec le type, soit obscur. Les appareils qui ne sont pas des pompes gardent leur
nom tel quel.

## Icônes

| Icône                                                                                                    | Rôle                                                                             |
| -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| <img src="../img/mdi/mdi_check.png" width="20"/>                                                         | **Tâche réalisée.** Marque la tâche comme faite et relance son compte à rebours. |
| <img src="../img/mdi/mdi_bell-ring.png" width="20"/> <img src="../img/mdi/mdi_bell-off.png" width="20"/> | **Sourdine.** Bascule l'interrupteur de notification de cette seule tâche.       |
| <img src="../img/mdi/mdi_calendar-edit.png" width="20"/>                                                 | **Changer l'intervalle.** Déplie un curseur relié à l'intervalle de la tâche.    |

## Éditeur

L'état par défaut des filtres, le filtre par appareil et la visibilité des trois
boutons se règlent depuis l'éditeur de carte.

<img src="../img/maintenance/editor.png"/>

## Configuration

```yaml
type: custom:reef-card
device: __maintenance__
maintenance:
  sort: due # "device" (défaut) ou "due"
  devices: # n'afficher que les tâches de ces appareils (vide : tous)
    - SIMU-RSDOSE4
    - SIMU-RSATO
  hide_ok: false # masquer les tâches ni dépassées ni proches
  hide_muted: false # masquer les tâches dont les notifications sont coupées
  warning_ratio: 0.2 # part de l'intervalle affichée en orange
  show_reset: true # afficher le bouton « marquer comme effectuée »
  show_notify: true # afficher la cloche activer/couper les alertes
  show_interval: true # afficher le bouton de modification de l'intervalle
```

Toutes les clés de `maintenance` sont optionnelles. `sort` et `hide_ok` ne
définissent que l'état initial : l'utilisateur peut toujours les modifier
depuis la vue elle-même. `devices` accepte aussi bien des noms d'appareils que
des identifiants Home Assistant ; une liste vide (le défaut) désactive le
filtre.

---

[← Retour à la page principale](README.fr.md)
