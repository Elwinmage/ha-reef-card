[← Retour à la page principale](README.fr.md)

# ReefLed

Les ReefLed **G1** (RSLED50, RSLED90, RSLED160) et **G2** (RSLED60, RSLED115,
RSLED170) sont prises en charge, ainsi que les [LED virtuelles](#led-virtuelle).

<p align="center">
<img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsled/rsled_g1.png" width="45%"/>
<img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsled/rsled_g2.png" width="45%"/>
</p>

## La vue

- **Ciel** — la course du soleil entre le premier lever et le dernier coucher
  de la programmation du jour (canaux blanc et bleu), avec les deux heures aux
  extrémités de l'arc. La nuit, le ciel passe au violet, comme la LED lune de
  la rampe : la lune va du coucher au lever suivant et affiche sa phase
  (`todays_moon_day`). Touchez le mode au centre pour le
  changer (auto, manuel, minuteur). Si des nuages sont programmés, un petit
  nuage apparaît à côté du mode ; pendant leur passage, ils défilent devant le
  soleil.
- **Nom** — le nom de la rampe (celui donné dans Home Assistant) est écrit
  dans le ciel, le long de l'arête supérieure gauche de la rampe. Un nom long
  est écrit plus petit, puis coupé (le nom complet s'affiche au survol).
- **Face gauche** — marche/arrêt, maintenance, configuration, batterie et wifi.
- **Face droite** — identification (la lampe clignote, et le faisceau de la
  carte aussi pendant 10 s), phase lunaire et acclimatation. Lune et acclimatation ouvrent leurs réglages. Pendant une
  acclimatation, les jours restants et l'intensité courante sont affichés.
- **Faisceau** — sa couleur et son opacité suivent la lumière produite (canaux
  blanc, bleu et lune). Il affiche l'intensité courante, le nom de la
  programmation du jour et son graphique (blanc, bleu, lune), avec un repère
  rouge à l'heure courante. Hors mode automatique, le graphique est estompé.
  Sur une G2, le graphique montre l'intensité, sa ligne colorée selon la
  température de couleur (jaune quand elle est chaude, bleue quand elle est
  froide), avec la valeur de chaque zone. Touchez le faisceau pour éditer la
  programmation.
- **Curseurs** — regroupés à gauche : intensité, température de couleur et
  lune. Intensité et couleur pilotent la lumière `kelvin_intensity`, le
  curseur lune la lumière `moon` ; un seul appel est envoyé au relâchement.
  Sur une G1, le petit interrupteur **K | W/B** au-dessus d'eux remplace
  intensité et couleur par les canaux blanc et bleu ; le navigateur retient le
  choix pour chaque rampe. Une G2 ne pilote sa couleur que par kelvin et
  intensité : elle n'a pas cet interrupteur.
- **Messages** — dernier message et dernière alerte sous le faisceau.

## LED virtuelle

<img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsled/rsled_virtual.png" width="300"/>

Une LED virtuelle pilote plusieurs rampes comme une seule. Elle affiche la
même vue qu'une vraie rampe : celle de la G2 dès qu'une de ses rampes est une
G2 (le groupe ne se pilote alors qu'en kelvin et intensité), celle de la G1
quand toutes ses rampes sont des G1 (avec le sélecteur **K | W/B**). Une LED
virtuelle n'a ni batterie, ni wifi, ni messages ; à la place, ses rampes sont
listées en bas à droite, chacune avec une vignette de sa génération. Un appui
sur l'une d'elles affiche sa propre carte (le bouton retour ramène à la LED
virtuelle).

La programmation affichée est lue sur la première rampe du groupe (une
programmation G1 est affichée en kelvin dans la vue G2). **Enregistrer**
écrit la programmation éditée sur chaque rampe, dans son propre format :
blanc/bleu pour une G1 (convertie avec la table de son modèle), points
`color` pour une G2.

> [!NOTE]
> La liste des rampes nécessite une version de ha-reefbeat-component exposant
> le capteur `linked_leds`. Sans lui, la carte choisit la vue G2 quand la LED
> virtuelle n'a pas de lumières blanc/bleu, et écrit les programmations sur
> l'entrée de la LED virtuelle elle-même.

## Éditeur de programmation

<img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsled/rsled_program_editor.png" width="400"/>

Touchez le faisceau pour éditer la programmation d'un jour : le graphique en
haut, les points du canal choisi en dessous (heure, intensité et, sur une G2,
température de couleur). Les points se déplacent aussi à la souris ou au doigt
sur le graphique. Sur une G1, l'interrupteur **W/B | K** de l'éditeur permet
d'éditer la programmation canal par canal ou en intensité + température de
couleur ; elle est toujours enregistrée en blanc/bleu. La conversion est
faite par l'intégration (`redsea.led_convert` : table du modèle et option de
compensation d'intensité), avec un calcul local de secours pour les versions
plus anciennes de l'intégration. La première et la dernière ligne sont le lever et le
coucher du canal : leur intensité reste à 0 %. **Enregistrer** envoie la
programmation du jour affiché, ou de tous les jours avec _Tous les jours_.

> [!NOTE]
> La rampe stocke ses programmations sur une semaine (le jour N commence à
> (N - 1) × 1440 min) ; la carte affiche et édite chaque jour sur ses 24 h.
> Une G2 stocke sa programmation en points `color` `{t, i1, k1, i2, k2}` (une
> valeur d'entrée et une de sortie par point) plus la lune, ses nuages étant
> sur `/clouds/<jour>` comme pour une G1. La carte lit et écrit ce format ;
> elle lit aussi la programmation telle que le parseur G1 de l'appli la voit
> (blanc = intensités, bleu = températures de couleur).

> [!NOTE]
> La progression de l'acclimatation nécessite une version de
> ha-reefbeat-component exposant les capteurs `acclimation_remaining_days` et
> `acclimation_current_intensity_factor`. Avec son capteur `current_program`,
> le faisceau affiche le nom de la programmation que la rampe déclare
> exécuter.

---

[← Retour à la page principale](README.fr.md)
