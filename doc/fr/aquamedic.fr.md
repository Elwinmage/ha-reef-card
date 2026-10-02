[← Retour à la page principale](README.fr.md)

# Aqua Medic

Aqua Medic avec ha-reef-card en action :

[![Regarder la vidéo](https://img.youtube.com/vi/VIDEO_ID/0.jpg)](https://www.youtube.com/watch?v=VIDEO_ID)

Vues des pompes de [ha-aquamedic-component](https://github.com/Elwinmage/ha-aquamedic-component) :

| Appareil                         | Vue de la carte        |
| -------------------------------- | ---------------------- |
| EcoDrift / SmartDrift (brassage) | `aquamedic-smartdrift` |
| DC Runner (pompe de remontée)    | `aquamedic-dcrunner`   |
| DC Runner (pompe d'écumeur)      | `aquamedic-dcskimmer`  |

<p align="center">
<img src="../img/aquamedic/smartdrift.png" width="30%"/>
<img src="../img/aquamedic/dcrunner.png" width="30%"/>
<img src="../img/aquamedic/dcskimmer.png" width="30%"/>
</p>

La pompe de remontée et la pompe d'écumeur sont le même matériel : la carte
affiche un sélecteur de rôle tant que la liste **Rôle de la pompe** de
l'intégration n'est pas renseignée, puis bascule d'elle-même sur la vue
correspondante.

<img src="../img/aquamedic/role_picker.png"/>

## Ce que montre la vue

La carte est divisée en 4 zones :

1. Bandeau du haut
2. Défauts
3. Vitesse
4. Programme par créneaux

<img src="../img/aquamedic/aquamedic_zones.png"/>

## Bandeau du haut

<img src="../img/aquamedic/zone_1.png"/>

Marche/arrêt, pause nourrissage, minuterie et
pilotage 0-10V, chacun basculé d'un clic ; la roue dentée ouvre les
réglages (toutes les entités de la pompe, son rôle et ses capteurs de
défaut). Un SmartDrift ajoute l'interrupteur impulsion / marée et son mode
de vague (clic : plus d'infos).

## Défauts

<img src="../img/aquamedic/zone_2.png"/>

Une ligne clignotante nomme les défauts remontés par la pompe
(marche à vide, rotor bloqué, surchauffe…). Rien n'est affiché tant que la
pompe est saine.

## Vitesse

<img src="../img/aquamedic/zone_3.png"/>

Un anneau sur l'image et un curseur dessous (vitesse moteur
sur une DC Runner, débit sur un SmartDrift, qui reçoit aussi un curseur de
fréquence des vagues). Sur un SmartDrift, l'anneau est ajusté sur le capot
avant de la pompe, la valeur en son centre. Les deux disparaissent quand
la pompe est pilotée par son entrée 0-10V, l'intégration verrouillant
alors la vitesse. Au relâchement, le curseur garde sa nouvelle valeur
jusqu'à ce que la pompe la confirme.

## Programme par créneaux

<img src="../img/aquamedic/zone_4.png"/>

La journée de 00:00 à 24:00, un bloc par
créneau — sa hauteur est la vitesse programmée, une pause nourrissage est
en pointillés sur toute la hauteur, un arrêt est une barre fine sur la
ligne de base. Un curseur rouge marque l'heure courante. Le graphe est
estompé quand la minuterie est désactivée, la pompe ignorant alors le
programme.

## Animations

L'image montre ce que fait la pompe :

- **SmartDrift / EcoDrift** : quatre jets ondulés partent en éventail de
  l'avant de la pompe. Ils gonflent au rythme de la fréquence des vagues, et
  restent stables en mode débit constant.
- **DC Runner** : l'eau est aspirée par l'entrée et refoulée vers le haut
  par la sortie.
- **DC Skimmer** : l'image avec écume quand la pompe tourne, l'image au
  repos quand elle est arrêtée ou tenue par la pause nourrissage ; des
  bandes montent dans la chambre de réaction, plus vite avec la vitesse du
  moteur, et des bulles éclatent dans le godet. Il n'y a pas d'état « godet
  plein » : le firmware Aqua Medic ne le détecte pas.

L'eau va plus vite quand la vitesse augmente. Rien n'est dessiné quand la
pompe est arrêtée, tenue par la pause nourrissage, ou à 0 %.

## Modifier le programme

<img src="../img/aquamedic/schedule_editor.png"/>

Cliquez sur le graphe (ou maintenez l'icône de minuterie) pour ouvrir
l'éditeur : une ligne par créneau avec son début, sa fin, son mode et sa
valeur (vitesse en %, ou minutes pour une pause nourrissage), plus fréquence
et marée sur un SmartDrift. Les créneaux peuvent être ajoutés et supprimés.
**Sauvegarder** réécrit tout le programme de la pompe via le service
`aquamedic.set_schedule` ; **Annuler** ne change rien.

L'éditeur applique ce que la pompe accepte : les créneaux ne peuvent ni se
chevaucher ni passer minuit (écrivez une plage de nuit en deux créneaux), un
créneau DC Runner tourne à 30 % ou plus, une pause nourrissage dure de 1 à
60 minutes, et une pompe contient 48 créneaux.

> [!NOTE]
> Le programme nécessite ha-aquamedic-component avec le capteur `schedule`.
> Avec une version plus ancienne, le graphe n'est simplement pas dessiné.

> [!NOTE]
> Une DC Runner avec l'ancien firmware (vitesse nommée `flow`, pas de
> minuterie) utilise les mêmes vues : les éléments qui lui manquent sont
> masqués.

## Disposition

Chaque vue a sa propre boîte et son propre placement, dans les constantes
`PICTURE` et `LAYOUT` de son mapping (`dcrunner.mapping.ts`,
`dcskimmer.mapping.ts`, `smartdrift.mapping.ts`) : emplacement de l'image,
centre de chaque icône, centre et taille de l'anneau de vitesse. Les points
dessinés sur l'image sont donnés en pourcentages de l'image : la déplacer ou
la redimensionner les déplace avec elle. Comme pour tout élément, ils peuvent
aussi être surchargés depuis la configuration de la carte.

---

[← Retour à la page principale](README.fr.md)
