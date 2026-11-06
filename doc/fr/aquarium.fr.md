[← Retour à la page principale](README.fr.md)

# Vue aquarium

Une seconde carte, `custom:reef-aquarium-card`, montre une photo de votre bac avec ses appareils et ses entités, l'eau éclairée par vos lampes et, si vous le souhaitez, des poissons et des coraux vivants. Elle a besoin de l'[intégration ReefTank](https://github.com/Elwinmage/ha-reeftank-component), qui stocke les aquariums et leurs images.

<img src="../img/aquarium/preview.webp"/>

## Premiers pas

1. Ajoutez une **Reef Aquarium Card** à un tableau de bord (`custom:reef-aquarium-card`).
2. Dans son éditeur, créez un aquarium (**Nouvel aquarium**), puis **Éditer la scène**.
3. **Vues** : envoyez une photo de votre bac, détourez l'eau, tracez la ligne de sable et les roches.
4. **Appareils** et **Lumière et brassage** : posez vos appareils et entités sur l'image, placez vos lampes.
5. **Population** : ajoutez vos poissons et coraux, puis enregistrez.

La configuration de la carte ne contient que l'identifiant de l'aquarium ; tout le reste est stocké par l'intégration :

```yaml
type: custom:reef-aquarium-card
aquarium: a1b2 # chosen in the card editor
render: static # optional: static, light or full; can only lower the aquarium's level
view: front # optional: the view to start on
```

Avec un compte cloud ReefBeat, l'aquarium du cloud préremplit les dimensions, les lampes et les raccourcis de nourrissage, et filtre les appareils Red Sea.

## La vue

La carte est divisée en 3 zones :

1. Image
2. Appareils et entités
3. Zones cliquables

<img src="../img/aquarium/aquarium_zones.png"/>

### 1. Image

<img src="../img/aquarium/zone_1.png"/>

La photo de la vue, ou l'eau dessinée, teintée par vos lampes à partir du niveau `light`.

### 2. Appareils et entités

<img src="../img/aquarium/zone_2.png"/>

Un appui sur un appareil ouvre sa vue dans cette carte ; sur une entité, son action habituelle. Un appareil peut aussi être détouré sur l'image (rectangle, lasso ou polygone) plutôt qu'affiché en vignette.

### 3. Zones cliquables

<img src="../img/aquarium/zone_3.png"/>

Un appui sur une zone cliquable ouvre une autre vue de l'aquarium (la décante dans le meuble, par exemple) ; le bouton ← revient à la précédente.

## L'éditeur de scène

Une fenêtre plein écran, ouverte depuis l'éditeur de la carte, en sept onglets :

### Aquarium

<img src="../img/aquarium/editor_aquarium.png"/>

Nom, dimensions, l'aquarium du cloud correspondant, lumière sous laquelle les photos ont été prises, niveau de rendu, obscurité de l'eau la nuit.

- **Volume d'eau net (L)** : Bac et décantation, sans pierres ni sable. Utilisé par la régulation du dosage de la ReefDose. → [Régulation du dosage](reefdose.fr.md#régulation-du-dosage)

### Vues

<img src="../img/aquarium/editor_views.png"/>

Les images ; pour chaque eau : contour, ligne de sable (avant et arrière), roches et leur profondeur, zones cliquables, fond dessiné et ses textures.

- **Sable et roches** : tracez la ligne de sable contre la vitre avant (et contre la paroi du fond quand l'image montre le dessus du sable) et détourez les roches avec leur profondeur : les poissons restent au-dessus du sable, nagent derrière les roches, et les espèces de fond rampent dessus.
- **Décor dessiné** : quand la photo de l'eau n'est pas exploitable, l'eau peut être dessinée (eau, sable, textures de roche du catalogue), le reste de l'image étant conservé.

### Appareils

<img src="../img/aquarium/editor_devices.png"/>

Vos appareils et entités par étage et par pièce, glissés sur l'image.

Cochez **Masquer le libellé** pour n'afficher que la valeur, et choisissez sa **Couleur du texte** : le libellé reste dans l'éditeur.

### Lumière et brassage

<img src="../img/aquarium/editor_lights.png"/>

Les lampes qui éclairent chaque eau et leur position ; les pompes qui font bouger l'eau.

### Population

<img src="../img/aquarium/editor_livestock.png"/>

Poissons (espèce, nombre, taille, abri) et coraux (espèce, taille, couleurs, position).

- **Comportement** : bancs, nageurs de pleine eau, espèces de fond, poissons vivant autour d'un refuge, gobies sortant de leur terrier ; la nuit, les poissons se cachent ou se reposent, sous un voile qui garde le bac lisible.
- **Espèces** : poissons et coraux viennent du [catalogue ReefTank](https://github.com/Elwinmage/reeftank-catalog), téléchargé et tenu à jour par l'intégration. L'éditeur les liste avec une vignette ; un nom absent du catalogue nage comme un poisson générique.

### Nourrissage

<img src="../img/aquarium/editor_feeding.png"/>

Les entités qui enregistrent un nourrissage, et où tombe la nourriture.

### Surveillance

<img src="../img/aquarium/editor_monitoring.png"/>

Les entités pH, ORP, CO2 de la pièce et tests KH, ce qui signale une calibration, les seuils des alarmes et l'état de la surveillance.

Les alarmes comparent le bac à son propre historique récent.

## Niveaux de rendu

Chaque aquarium s'affiche à l'un de trois niveaux ; une carte peut l'abaisser, par exemple sur une tablette murale lente :

| Niveau                  | Affiche                     |                                                            |
| ----------------------- | --------------------------- | ---------------------------------------------------------- |
| **Statique** (`static`) | image, appareils et entités | <img src="../img/aquarium/render_static.png" width="240"/> |
| **Lumière** (`light`)   | plus la couleur des lampes  | <img src="../img/aquarium/render_light.png" width="240"/>  |
| **Complet** (`full`)    | plus poissons et coraux     | <img src="../img/aquarium/render_full.png" width="240"/>   |

Une photo du local technique avec ses appareils en direct est un très bon aquarium `static`.

Le guide complet (éditeur de scène, entités, services, catalogue) est dans le [README de ReefTank](https://github.com/Elwinmage/ha-reeftank-component/blob/main/doc/fr/README.fr.md).
