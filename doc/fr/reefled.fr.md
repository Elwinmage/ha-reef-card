[← Retour à la page principale](README.fr.md)

# ReefLed

ReefLed avec ha-reef-card en action :

[![Regarder la vidéo](https://img.youtube.com/vi/pA49z8QjTN4/0.jpg)](https://www.youtube.com/watch?v=pA49z8QjTN4)

Les ReefLed **G1** (RSLED50, RSLED90, RSLED160) et **G2** (RSLED60, RSLED115,
RSLED170) sont prises en charge, ainsi que les [LED virtuelles](#led-virtuelle).

> [!NOTE]
> Seule la G1 a été validée sur de vraies rampes. La G2 est implémentée et
> doit fonctionner, mais n'a pas encore été testée : vos retours sont les
> bienvenus.

<p align="center">
<img src="../img/rsled/rsled_g1.png" width="45%"/>
<img src="../img/rsled/rsled_g2.png" width="45%"/>
</p>

## La vue

La carte est divisée en 7 zones :

1. Ciel
2. Face gauche
3. Face droite
4. Faisceau
5. Curseurs
6. Groupe et météo
7. Messages

<img src="../img/rsled/rsled_zones.png"/>

## Ciel

<img src="../img/rsled/zone_1.png"/>

La course du soleil entre le premier lever et le dernier coucher
de la programmation du jour (canaux blanc et bleu), avec les deux heures aux
extrémités de l'arc. La nuit, le ciel passe au violet, comme la LED lune de
la rampe : la lune va du coucher au lever suivant et affiche sa phase
(`todays_moon_day`). Touchez le mode au centre pour le
changer (auto, manuel, minuteur). Si des nuages sont programmés, un petit
nuage apparaît à côté du mode ; pendant leur passage, ils défilent devant le
soleil.

## Face gauche

<img src="../img/rsled/zone_2.png"/>

Marche/arrêt, maintenance, configuration, batterie et wifi.

Le nom de la rampe (celui donné dans Home Assistant) est écrit
sur la face supérieure gauche de la rampe, entre les aérations et les
icônes. Un nom long est écrit plus petit, puis coupé (le nom complet
s'affiche au survol).

## Face droite

<img src="../img/rsled/zone_3.png"/>

Identification (la lampe clignote, et le faisceau de la
carte aussi pendant 10 s), phase lunaire et acclimatation. Lune et acclimatation ouvrent leurs réglages. Pendant une
acclimatation, les jours restants et l'intensité courante sont affichés.

## Faisceau

<img src="../img/rsled/zone_4.png"/>

Sa couleur et son opacité suivent la lumière produite (canaux
blanc, bleu et lune). À 0 % d'intensité, ou rampe éteinte, il n'y a pas de
faisceau et la lentille est grisée. Il affiche l'intensité courante, le nom de la
programmation du jour et son graphique (blanc, bleu, lune), avec un repère
rouge à l'heure courante, écrite sous le graphique. En mode météo GPS,
l'heure du lieu de la météo suit entre parenthèses : le moment de la
journée du lieu que joue la programmation (09:04 en France peut être
04:04 aux Maldives quand le lever est calé sur le bac). Hors mode automatique, le graphique est estompé.
Sur une G2, le graphique montre l'intensité, sa ligne colorée selon la
température de couleur (jaune quand elle est chaude, bleue quand elle est
froide), avec la valeur de chaque zone. Touchez le faisceau pour éditer la
programmation. Les nuages du jour apparaissent en bande verticale sur leur
plage horaire, d'autant plus sombre qu'ils sont forts (Low, Medium, High) ;
de même sur le graphique de l'éditeur et sur la semaine météo.

## Curseurs

<img src="../img/rsled/zone_5.png"/>

Regroupés à gauche : intensité, température de couleur et
lune. Intensité et couleur pilotent la lumière `kelvin_intensity`, le
curseur lune la lumière `moon` ; un seul appel est envoyé au relâchement.
Sur une G1, le petit interrupteur **K | W/B** au-dessus d'eux remplace
intensité et couleur par les canaux blanc et bleu ; le navigateur retient le
choix pour chaque rampe. Une G2 ne pilote sa couleur que par kelvin et
intensité : elle n'a pas cet interrupteur.

## Groupe et météo

<img src="../img/rsled/zone_6.png"/>

Sur une rampe d'un groupe, les rampes de son groupe (voir
[LED virtuelle](#led-virtuelle)) : touchez-en une pour afficher sa carte.
Dessous, l'icône météo, allumée quand la rampe suit la météo.

## Messages

<img src="../img/rsled/zone_7.png"/>

Dernier message et dernière alerte sous le faisceau.

## Lever de soleil décalé

<img src="../img/rsled/staggered_sunrise.png"/>

Quand la rampe commence sa journée en retard
(son `Décalage du lever de soleil`, réglé par un groupe ou à la main), le
ciel joue la programmation avec ce retard : position du soleil, heures
de lever et de coucher, nuages. Un badge sous l'heure du lever
(« +15 min ») ouvre le réglage du décalage, qui se trouve aussi dans la
fenêtre de configuration (rampes répondant à `/offset` uniquement).

## Programme météo

<img src="../img/rsled/rsled_weather.png" width="300"/>

Avec le programme météo de ha-reefbeat-component, l'éditeur de programmation
a un interrupteur **mode météo GPS**, et une icône météo
(`mdi:weather-partly-cloudy`) apparaît en bas à droite, allumée quand la
rampe suit la météo, et bleue pendant
l'écriture d'une semaine météo dans la rampe. Elle est purement informative :
le mode se choisit dans l'éditeur de programmation.

Mode activé, le tableau des points laisse place aux réglages : le lieu
(saisi en `lat, lon`, collé en lien de carte, cherché par son nom —
« Maldives », « Fakarava »… — la carte s'y rendant alors, ou choisi sur la
carte de Home Assistant quand elle est disponible), la période (prévisions de la semaine à
venir ou météo mesurée de la semaine passée), la fréquence de récupération
(de 3 à 15 jours), la façon de caler la journée du lieu sur le bac (heure du
lieu, calée sur une heure de lever ou de coucher, ou étirée entre les deux),
les intensités minimale et maximale, et les nuages. Chaque changement est
aussitôt prévisualisé : le graphe montre la journée que ferait la météo, et
la semaine est listée jour par jour (le soleil sur le bac, les horaires du
lieu au survol, l'ensoleillement, la couverture nuageuse avec les nuages de
la rampe et l'intensité maximale) ; un jour de la liste s'affiche dans le
graphe. Rien n'est écrit avant **Enregistrer** : l'éditeur affiche
« Enregistrement des paramètres en cours… », puis « Paramètres enregistrés »
une fois que l'intégration a enregistré les réglages et le mode et fait la
semaine, et se ferme ; la semaine est écrite dans la rampe juste après, en
arrière-plan. **Annuler** ne change rien.

Les couleurs des journées météo sont à votre main : mode activé, le graphe
montre les créneaux de la journée et seule leur couleur peut être changée.
Les couleurs réglées deviennent celles de la journée météo affichée, ou de
tous les jours avec _Tous les jours_, à la place des couleurs de
la programmation de la rampe ; elles sont prévisualisées et enregistrées
avec les autres réglages.

Désactivé sur une rampe en mode météo, l'éditeur montre sa programmation
mise de côté, modifiable : **Enregistrer** la remet (avec la journée
modifiée, le cas échéant). Un réglage changé hors de la carte (entités de
Home Assistant, automatisations) s'affiche en une seconde et la rampe est
écrite 30 s après le dernier changement.

## LED virtuelle

<img src="../img/rsled/rsled_virtual.png" width="300"/>

Une LED virtuelle pilote plusieurs rampes comme une seule. Elle affiche la
même vue qu'une vraie rampe : celle de la G2 dès qu'une de ses rampes est une
G2 (le groupe ne se pilote alors qu'en kelvin et intensité), celle de la G1
quand toutes ses rampes sont des G1 (avec le sélecteur **K | W/B**). Une LED
virtuelle n'a ni batterie, ni wifi, ni messages ; à la place, ses rampes sont
listées en bas à droite, chacune avec une vignette de sa génération. Un appui
sur l'une d'elles affiche sa propre carte (le bouton retour ramène à la LED
virtuelle).

Une LED virtuelle est un groupe, comme les LED « groupées » de l'application
ReefBeat : ce qui est réglé sur elle, ou sur l'une de ses rampes (mode,
couleur manuelle, minuteur, programmations, acclimatation, phase lunaire,
mode météo), est appliqué à toutes les rampes du groupe. Une rampe d'un
groupe liste elle aussi les rampes de son groupe, elle-même entourée en
rouge. Avec un lever de soleil décalé, le décalage de chaque rampe est
écrit sous son nom (+0 min, +10 min…). Quand une rampe du groupe n'est pas
disponible, l'intégration refuse le changement et nomme la rampe : rien
n'est envoyé, le groupe reste donc synchronisé.

La programmation affichée est lue sur la première rampe du groupe (une
programmation G1 est affichée en kelvin dans la vue G2). **Enregistrer**
écrit la programmation éditée sur chaque rampe, dans son propre format :
blanc/bleu pour une G1 (convertie avec la table de son modèle), points
`color` pour une G2. Les écritures sont espacées, une rampe répondant tard
à une commande envoyée trop tôt : l'éditeur affiche pendant ce temps sa
progression (« Envoi du programme aux lampes… 3/14 »).

> [!NOTE]
> La liste des rampes nécessite une version de ha-reefbeat-component exposant
> le capteur `linked_leds`. Sans lui, la carte choisit la vue G2 quand la LED
> virtuelle n'a pas de lumières blanc/bleu, et écrit les programmations sur
> l'entrée de la LED virtuelle elle-même.

## Éditeur de programmation

<img src="../img/rsled/rsled_program_editor.png" width="400"/>

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

### Bibliothèque cloud

<img src="../img/rsled/library.png"/>

Quand la rampe est liée à un compte cloud ReefBeat (l'entrée cloud de
l'intégration), l'éditeur propose les programmations de sa bibliothèque,
rangées comme dans l'appli ReefBeat (G1 : par aquarium ; G2 : par compte,
dans une bibliothèque à part) : en choisir une la charge (une programmation G1 s'affiche en
kelvin sur une G2, une G2 s'édite en kelvin sur une G1 et s'enregistre en
blanc/bleu). Enregistrée telle quelle, la rampe prend son nom et ses nuages,
comme avec l'appli ReefBeat.

Les programmations sont listées en deux groupes : celles de Red Sea (12K,
15K, 18K, 20K, 23K et RS Accelerated Growth sur une G1 ; 15K, 23K, Shallow
Reef et Deep Reef, intégrées à l'appli, sur une G2) et les vôtres. Comme dans
l'appli, une programmation Red Sea peut être chargée mais ni modifiée ni
supprimée ; une des vôtres peut être supprimée (🗑, après confirmation).

Une programmation modifiée est enregistrée dans la bibliothèque avant d'être
envoyée à la rampe : la carte demande son nom, `prog-AAAAMMJJHHMM` par
défaut. Quand elle vient d'une de vos programmations, le nom est le sien et
vous choisissez entre **Mettre à jour** (la programmation de la bibliothèque
est remplacée) et **Nouveau programme**. Une LED virtuelle utilise la
bibliothèque de sa première rampe liée.

> [!NOTE]
> La bibliothèque nécessite une version de ha-reefbeat-component exposant les
> services `redsea.led_library`, `redsea.led_library_save` et
> `redsea.led_library_delete`.

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
