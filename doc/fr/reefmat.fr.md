[← Retour à la page principale](README.fr.md)

# ReefMat

ReefMat avec ha-reef-card en action:

[![Regarder la vidéo](https://img.youtube.com/vi/yyNyUSitb1E/0.jpg)](https://www.youtube.com/watch?v=yyNyUSitb1E)

La carte ReefMat est découpée en 7 zones :

1. Configuration / Informations Wifi
2. Etats
3. Informations du rouleau (longueur totale utilisée, longueur restante, fin de rouleau, mode...)
4. Avance manuelle/automatique
5. Sonde
6. Avance programmée
7. Graphique d'utilisation hebdomadaire / mensuel

<img src="../img/rsmat/rsmat_zones.png"/>

L'image de fond change en fonction de l'état d'utilisation du rouleau avec 5 images différentes:

<table>
  <tr>
    <td align="center"><img src="../img/rsmat/RSMAT_100_BASE.png" width="100%"/><br/><b>0%</b></td>
    <td align="center"><img src="../img/rsmat/RSMAT_75_BASE.png" width="100%"/><br/><b>25%</b></td>
    <td align="center"><img src="../img/rsmat/RSMAT_50_BASE.png" width="100%"/><br/><b>50%</b></td>
  </tr>
  <tr>
    <td align="center"><img src="../img/rsmat/RSMAT_25_BASE.png" width="100%"/><br/><b>75%</b></td>
    <td align="center"><img src="../img/rsmat/RSMAT_0_BASE.png" width="100%"/><br/><b>100%</b></td>
    <td></td>
  </tr>
</table>

## Configuration / Informations Wifi

<img src="../img/rsmat/zone_1.png"/>

---

<span>Cliquez sur l'icône <img src="../img/rsdose/cog_icon.png" width="30" /> pour gérer la configuration générale du ReefMat.</span>

<img src="../img/rsmat/zone_1_dialog_configuration.png"/>

<span>Cliquez sur l'icône <img src="../img/rsdose/wifi_icon.png" width="30" /> pour gérer les paramètres réseau.</span>

<img src="../img/rsmat/zone_1_dialog_wifi.png"/>

## États

<img src="../img/rsmat/zone_2.png"/>

---

<span>L'interrupteur de maintenance <img src="../img/mdi/mdi_account-wrench.png" width="20"/> permet de basculer vers le mode maintenance.</span>

 <img  src="../img/rsmat/maintenance.png"/>

<span>L'interrupteur de on/off <img src="../img/mdi/mdi_power-plug.png" width="20"/> permet de basculer entre les états on et off du ReefMat.</span>

 <img  src="../img/rsmat/off_mode.png"/>

## Informations du rouleau

<img src="../img/rsmat/zone_3.png"/>

---

Cette zone affiche en temps réel l'état du rouleau filtrant, avec de haut en bas :

- La **longueur totale utilisée** depuis le début du rouleau (en haut, en rouge)
- La **longueur restante** au centre en rouge. Si le rouleau est vide, une icône <img src="../img/mdi/mdi_paper-roll.png" width="20"/> clignotante s'affiche à la place et une boîte de dialogue propose de remplacer le rouleau.

<img src="../img/rsmat/zone_3_dialog_new_roll.png"/>

- Le **nombre de jours restants** avant la fin du rouleau estimé selon la consommation journalière moyenne (en noir)
- La **consommation journalière moyenne** en cm (en bas à gauche)
- Le **mode de fonctionnement** courant: Auto, Maintenance, Off… (sous le logo RedSea)
- Le **pourcentage de rouleau utilisé** (arc de cercle en bas à droite)

Si une anomalie est détectée le logo RedSea se transformera en <img src="../img/mdi/mdi_alert-decagram.png" width="20"/> clignotant.
Un clic sur cette alerte ouvre la boîte de dialogue des anomalies :

<img src="../img/rsmat/alert.png"/>
<img src="../img/rsmat/zone_3_dialog_alert.png" />

## Avance Manuelle/Automatique

<img src="../img/rsmat/zone_4.png"/>
<img src="../img/rsmat/zone_4_auto_off.png"/>
---

Cette zone permet de contrôler l'avance du rouleau.

De gauche à droite :

- Le bouton <img src="../img/mdi/mdi_send.png" width="20"/> permet de lancer une **avance manuelle** du rouleau de la longueur indiquée par le chiffre au centre.
- La **valeur d'avance** affichée (en cm) correspond à la valeur qui sera envoyée lors d'un appui sur le bouton. Un clic sur ce chiffre ouvre la boîte d'édition.

<img src="../img/rsmat/zone_4_dialog_manual_advance.png"/>

- Le **bouton de d'avance automatiquement** <img src="../img/mdi/mdi_autorenew.png" width="20"/> <img src="../img/mdi/mdi_autorenew-off.png" width="20"/> permet d'activer/désactiver l'avance automatique du rouleau.

## Sonde

<img src="../img/rsmat/zone_5.png"/>

---

Cette zone indique l'état de la sonde de niveau.

Trois états sont possibles :

| État              | Image                                                           |
| ----------------- | --------------------------------------------------------------- |
| Capteur branché   | <img src="../img/rsmat/RSMAT_SENSOR_PLUGGED.png" width="80"/>   |
| Capteur débranché | <img src="../img/rsmat/RSMAT_SENSOR_UNPLUGGED.png" width="80"/> |
| Capteur sale      | <img src="../img/mdi/mdi_liquid-spot.png" width="80"/>          |

## Avance programmée

<img src="../img/rsmat/zone_6.png"/>

---

Ce bouton <img src="../img/mdi/mdi_auto-mode_red.png" width="20"/><img src="../img/mdi/mdi_auto-mode_black.png" width="20"/> permet de donner l'état de l'avance programmée et de l'éditer en cliquant dessus.

<img src="../img/rsmat/zone_6_dialog_schedule.png"/>

## Graphique d'utilisation

<img src="../img/rsmat/zone_7.png"/> 
<img src="../img/rsmat/monthly.png"/>

---

Cette zone affiche un graphique de la consommation du rouleau dans le temps.
Un clic sur le bouton bascule entre les deux modes disponibles:

- Le mode **Weekly** affiche la consommation sur les 7 derniers jours.
- Le mode **Monthly** affiche la consommation sur les 30 derniers jours.

Un appui en haut à gauche du graphique ouvre la vue détaillée dans Home Assistant.

## Messages

<img src="../img/rsmat/zone_8.png"/>

---

Cette zone affiche les derniers messages système du ReefMat. Elle comporte deux lignes :

- La ligne grise affiche le **dernier message** reçu.
- La ligne rose affiche la **dernière alerte**, précédée du symbole ⚠.

Un clic sur l'icône <img src="../img/mdi/mdi_delete-empty.png" width="20"/> efface le message correspondant.

Ces lignes peuvent être masquées via l'intefrace d'edition de la carte.

<img src="../img/rsmat/editor.png" />

---

[← Retour à la page principale](README.fr.md)
