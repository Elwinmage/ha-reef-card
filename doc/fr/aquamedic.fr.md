[← Retour à la page principale](README.fr.md)

# Aqua Medic

Vues des pompes de [ha-aquamedic-component](https://github.com/Elwinmage/ha-aquamedic-component) :

| Appareil                         | Vue de la carte        |
| -------------------------------- | ---------------------- |
| EcoDrift / SmartDrift (brassage) | `aquamedic-smartdrift` |
| DC Runner (pompe de remontée)    | `aquamedic-dcrunner`   |
| DC Runner (pompe d'écumeur)      | `aquamedic-dcskimmer`  |

La pompe de remontée et la pompe d'écumeur sont le même matériel : la carte
affiche un sélecteur de rôle tant que la liste **Rôle de la pompe** de
l'intégration n'est pas renseignée, puis bascule d'elle-même sur la vue
correspondante.

## Ce que montre la vue

- **Bandeau du haut** : marche/arrêt, pause nourrissage, minuterie et
  pilotage 0-10V, chacun basculé d'un clic ; la roue dentée ouvre les
  réglages (toutes les entités de la pompe, son rôle et ses capteurs de
  défaut). Un SmartDrift ajoute l'interrupteur impulsion / marée et son mode
  de vague (clic : plus d'infos).
- **Défauts** : une ligne clignotante nomme les défauts remontés par la pompe
  (marche à vide, rotor bloqué, surchauffe…). Rien n'est affiché tant que la
  pompe est saine.
- **Vitesse** : un anneau sur l'image et un curseur dessous (vitesse moteur
  sur une DC Runner, débit sur un SmartDrift, qui reçoit aussi un curseur de
  fréquence des vagues). Les deux disparaissent quand la pompe est pilotée
  par son entrée 0-10V, l'intégration verrouillant alors la vitesse.
- **Programme par créneaux** : la journée de 00:00 à 24:00, un bloc par
  créneau — sa hauteur est la vitesse programmée, une pause nourrissage est
  en pointillés sur toute la hauteur, un arrêt est une barre fine sur la
  ligne de base. Un curseur rouge marque l'heure courante. Le graphe est
  estompé quand la minuterie est désactivée, la pompe ignorant alors le
  programme.

## Modifier le programme

Cliquez sur le graphe (ou maintenez l'icône de minuterie) pour ouvrir
l'éditeur : une ligne par créneau avec son début, sa fin, son mode et sa
valeur (vitesse en %, ou minutes pour une pause nourrissage), plus fréquence
et marée sur un SmartDrift. **Enregistrer** réécrit tout le programme de la
pompe via le service `aquamedic.set_schedule`.

L'éditeur applique ce que la pompe accepte : les créneaux ne peuvent ni se
chevaucher ni passer minuit (écrivez une plage de nuit en deux créneaux), un
créneau DC Runner tourne à 30 % ou plus, une pause nourrissage dure de 1 à
60 minutes, et une pompe contient 48 créneaux.

> Le programme nécessite ha-aquamedic-component avec le capteur `schedule`.
> Avec une version plus ancienne, le graphe n'est simplement pas dessiné.

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
