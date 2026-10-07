[← Retour à la page principale](README.fr.md)

# ReefATO

ReefATO+ avec ha-reef-card en action :

[![Regarder la vidéo](https://img.youtube.com/vi/2R0DHp2eqT4/0.jpg)](https://www.youtube.com/watch?v=2R0DHp2eqT4)

La carte ReefATO+ permet de gérer visuellement le contrôleur RSATO+, le
réservoir d'eau osmosée et sa pompe, la sonde de niveau clipsée sur la cuve, et
la sonde de fuite posée au sol.

La sonde de niveau du ReefATO+ est toujours dessinée. La **pompe** et la **sonde
de fuite** sont optionnelles. Celle que l'appareil ne signale pas n'est pas
dessinée du tout, et les commandes qui en dépendent sont masquées avec elle : un
ReefATO+ sans sonde de fuite affiche une carte sans sonde de fuite, pas une sonde
grisée.

<img src="../img/rsato/rsato_zones.png"/>

La carte est découpée en 7 zones :

1. Contrôleur : mode de fonctionnement, alimentation, mode maintenance, configuration, Wifi et appoint automatique
2. Réglages des accessoires : pompe d'appoint, sonde de fuite, sonde de niveau
3. Réservoir d'eau osmosée : commandes de remplissage, volume restant et autonomie
4. Buzzer
5. Sonde de fuite
6. Aquarium : niveau d'eau, température et consommation quotidienne
7. Dernier message et dernière alerte

## Contrôleur

<img src="../img/rsato/zone_1.png"/>

---

Le texte sur la face du contrôleur est le **mode de fonctionnement** remonté par
l'appareil (Auto, Manuel, Fuite…), traduit dans la langue de Home Assistant.

<span>L'interrupteur <img src="../img/mdi/mdi_power-plug.png" width="20"/> allume ou éteint le ReefATO+.</span>

<img src="../img/rsato/off_mode.png" width="50%"/>

<span>L'interrupteur <img src="../img/mdi/mdi_account-wrench.png" width="20"/> bascule en mode maintenance.</span>

<img src="../img/rsato/maintenance.png" width="50%"/>

<span>Cliquez sur l'icône <img src="../img/rsdose/cog_icon.png" width="30"/> pour gérer la configuration générale du ReefATO+ : rafraîchir les réglages ou les données interrogées, réinitialiser l'appareil, mettre à jour son firmware.</span>

<img src="../img/rsato/zone_1_dialog_config.png" width="50%"/>

<span>Cliquez sur l'icône <img src="../img/mdi/wifi_icon.png" width="30"/> pour gérer les réglages réseau.</span>

<img src="../img/rsato/zone_1_dialog_wifi.png" width="50%"/>

<span>L'interrupteur <img src="../img/mdi/mdi_waves-arrow-up.png" width="20"/> de la deuxième ligne active ou désactive l'**appoint automatique**. Désactivé, l'appareil ne remplit jamais de lui-même et seuls les boutons de la zone 3 agissent encore sur la pompe. Il est masqué quand aucune pompe n'est appairée.</span>

## Réglages des accessoires

<img src="../img/rsato/zone_2.png"/>

---

Les trois icônes suivent les trois prises de la face avant, dans le même ordre :
de gauche à droite la **pompe d'appoint**, la **sonde de fuite** et la **sonde de
niveau**. Chacune ouvre une boîte de dialogue dédiée à l'accessoire. Les icônes
de la pompe et de la sonde de fuite disparaissent avec l'accessoire quand leur
prise est inutilisée.

<span>L'icône de la pompe <img src="../img/mdi/mdi_pump.png" width="30"/> montre l'état de marche, la consommation et le débit mesurés, les trois seuils de courant auxquels le firmware se réfère pour déclarer une marche à sec ou un blocage, et ce qui a déclenché le dernier remplissage.</span>

<img src="../img/rsato/zone_2_dialog_pump.png" width="50%"/>

<span>L'icône de la sonde de fuite <img src="../img/mdi/mdi_pipe-leak.png" width="30"/> montre si la sonde est branchée, si elle est armée, le verdict sec/mouillé et la mesure brute derrière lui, ainsi que le buzzer que cette sonde pilote.</span>

<img src="../img/rsato/zone_2_dialog_leak.png" width="50%"/>

<span>L'icône de la sonde de niveau <img src="../img/mdi/mdi_hydraulic-oil-level.png" width="30"/> montre d'abord la santé de la sonde — connectée, calibrée, à vérifier, en erreur — car une sonde non calibrée ou encrassée rend toutes les mesures qui suivent sans valeur. Puis le niveau lui-même, les deux électrodes derrière lui, la sonde de température qui partage le même corps, ainsi que l'identité et les dates d'entretien de la cartouche.</span>

<img src="../img/rsato/zone_2_dialog_ato_sensor.png" width="50%"/>

## Réservoir d'eau osmosée

<img src="../img/rsato/zone_3.png"/>

---

Cette zone représente le réservoir dans lequel l'appoint puise, et les trois
boutons qui pilotent sa pompe à la main :

<table>
  <tr>
    <td align="center"><img src="../img/mdi/mdi_water-pump.png" width="40"/><br/><b>Remplir</b><br/>Démarre un remplissage manuel</td>
    <td align="center"><img src="../img/mdi/mdi_water-pump-off.png" width="40"/><br/><b>Arrêter</b><br/>Arrête le remplissage en cours</td>
    <td align="center"><img src="../img/mdi/mdi_play-circle-outline.png" width="40"/><br/><b>Reprendre</b><br/>Réactive la pompe</td>
  </tr>
</table>

Cette partie indique visuellement le niveau de la réserve d'eau, calculé depuis
la capacité du réservoir et la valeur réelle. Un réservoir vide montre toujours
une ligne d'eau, celle que la pompe ne peut pas remonter. En dessous de 10 %,
l'eau clignote pour signifier que le réservoir sera bientôt vide.

Cliquer sur l'eau ouvre la boîte de dialogue du réservoir, où la capacité peut
être éditée :

<img src="../img/rsato/zone_3_dialog_ato_tank.png" width="50%"/>

Le chiffre en bas à gauche du réservoir est l'**autonomie** : le nombre de jours
restants avant qu'il ne soit à sec, calculé par l'intégration à partir de la
consommation quotidienne moyenne. Cliquer dessus ouvre sa fiche détaillée.

Pendant un remplissage, l'eau s'écoule à la sortie au-dessus de la décantation.

<img src="../img/rsato/zone_3_filling.png"/>

## Buzzer

<img src="../img/mdi/mdi_bell-ring_red.png" width="40"/>

---

<span>La cloche <img src="../img/mdi/mdi_bell-ring_red.png" width="20"/> <img src="../img/mdi/mdi_bell-off_red.png" width="20"/> suit le réglage du buzzer de l'appareil, et se grise quand il est coupé.</span>

Un clic ouvre la boîte de dialogue du buzzer : le réglage lui-même, s'il sonne en
ce moment, et l'état de la sonde de fuite en contexte.

<img src="../img/rsato/zone_4_dialog_buzzer.png" width="50%"/>

Un **appui long** bascule directement le buzzer. Les deux gestes sont
volontairement séparés : couper l'alarme est un réglage de sécurité, pas quelque
chose à faire par mégarde en allant chercher le détail.

> [!NOTE]
> Le buzzer n'est pas seulement l'alarme de fuite : l'appareil le fait aussi
> sonner sur les défauts de pompe, il reste donc disponible sur un ReefATO+ sans
> sonde de fuite. L'icône n'est masquée que sur les versions de l'intégration qui
> n'exposent pas encore le réglage.

## Sonde de fuite

<img src="../img/rsato/zone_5.png"/>

---

La sonde n'est dessinée que lorsqu'elle est physiquement branchée. Branchée mais
désactivée dans l'application, elle est grisée : elle est là, elle ne détecte
rien.

Quand de l'eau est détectée, la sonde clignote et une flaque s'étale au pied de
l'image.

<table>
  <tr>
    <th align="center">Fuite sur l'aquarium</th>
    <th align="center">Fuite sur le réservoir d'eau osmosée</th>
    <th align="center">Fuite d'origine inconnue</th>
  </tr>
  <tr>
    <td align="center"><img src="../img/rsato/zone_5_leak_aquarium.png"/></td>
    <td align="center"><img src="../img/rsato/zone_5_leak_rodi.png"/></td>
    <td align="center"><img src="../img/rsato/zone_5_leak_unknown.png"/></td>
  </tr>
</table>

## Aquarium

<img src="../img/rsato/zone_6.png"/>

---

Le niveau de l'eau dans cette partie indique l'état de détection du capteur
ATO.

| État            | Signification                                                   |
| --------------- | --------------------------------------------------------------- |
| En dessous      | La surface est sous la sonde : l'appoint ne suit pas            |
| Niveau désiré 1 | Première marque d'appoint                                       |
| Niveau désiré 2 | Deuxième marque d'appoint                                       |
| Au dessus       | La surface est au-dessus de la sonde : la cuve est trop remplie |

Les deux extrémités sont anormales, donc **En dessous** et **Au dessus** font
clignoter l'eau. Une sonde en erreur, ou une entité qui n'a encore rien remonté,
n'a aucune hauteur : la carte dessine sa marque d'absence de mesure plutôt qu'une
cuve vide.

<table>
  <tr>
    <th align="center">En dessous</th>
    <th align="center">Niveau désiré 1</th>
    <th align="center">Niveau désiré 2</th>
    <th align="center">Au dessus</th>
    <th align="center">Pas de mesure</th>
  </tr>
  <tr>
    <td align="center"><img src="../img/rsato/zone_6_water_level_below.png"/></td>
    <td align="center"><img src="../img/rsato/zone_6_water_level_1.png"/></td>
    <td align="center"><img src="../img/rsato/zone_6_water_level_2.png"/></td>
    <td align="center"><img src="../img/rsato/zone_6_water_level_above.png"/></td>
    <td align="center"><img src="../img/rsato/zone_6_water_level_error.png"/></td>
  </tr>
</table>

La température en bas de la cuve vient du capteur intégré à la sonde de niveau,
et n'est remontée que lorsqu'il est activé sur l'appareil.

Le graphique dans le coin est la **consommation du jour** : le volume d'appoint
depuis minuit, rempli en orange, face à la moyenne quotidienne glissante en
rouge. La fenêtre est calée sur le jour calendaire plutôt que sur 24 heures
glissantes, puisque le compteur est remis à zéro à minuit.

Cliquer sur le graphique ouvre la boîte de dialogue de consommation, la même
histoire avec les chiffres énoncés : remplissages et volume, mesurés aujourd'hui,
en moyenne quotidienne et en cumul depuis l'origine, plus ce qu'il reste au
réservoir pour les alimenter.

<img src="../img/rsato/zone_6_dialog_usage.png" width="50%"/>

## Défauts

La carte n'a pas de voyant d'alerte séparé : ce qui est en défaut est ce qui
clignote, sous une teinte rouge clair.

| Élément clignotant | Ce que l'appareil remonte                                                                                                |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| La pompe           | Dysfonctionnement, pompe bloquée, remplissage trop long, réservoir vide, ou sonde de niveau absente                      |
| La sonde de fuite  | Eau détectée, côté osmoseur ou côté aquarium                                                                             |
| Le niveau d'eau    | La surface est en dessous ou au-dessus de la sonde                                                                       |
| Toute l'image      | La sonde de niveau demande à être vérifiée, ou ne parvient plus à mesurer — tous les niveaux affichés deviennent douteux |

Une pompe signalée absente n'est pas un défaut : la pompe, les boutons de
remplissage, le réservoir et le graphique de consommation ne sont simplement pas
dessinés.

## Messages

<img src="../img/rsato/zone_7.png"/>

---

Cette zone affiche les derniers messages système du ReefATO+. Elle a deux lignes :

- La ligne grise montre le **dernier message** reçu.
- La ligne rose montre la **dernière alerte**, précédée du symbole ⚠.

Cliquer sur l'icône <img src="../img/mdi/mdi_delete-empty.png" width="20"/> efface le message correspondant.

Ces lignes peuvent être masquées depuis l'interface de l'éditeur de carte.

## Éditeur de carte

<img src="../img/rsato/editor.png" width="50%"/>

---

En plus des deux lignes de messages, le ReefATO+ a trois options. Elles existent
pour une boucle d'appoint pour laquelle l'appareil n'a pas été conçu : un
osmoseur branché directement sur la décantation, avec une vanne pilotée par Home
Assistant plutôt que par la pompe Red Sea.

### Réservoir d'eau osmosée infini

Désactivé par défaut. Un osmoseur qui fait l'appoint au fil de l'eau n'a pas de
bidon, donc rien ne peut se vider — et tout ce que la carte dit du réservoir
parle d'un bidon qui n'existe pas.

Activé, le pourcentage sur le réservoir et la boîte de dialogue derrière lui sont
retirés, l'autonomie devient ∞, et l'icône des réglages de la pompe ainsi que le
bouton de reprise sont masqués : une alimentation continue n'a pas de cycle de
remplissage à rendre à l'appareil. L'eau, les boutons de remplissage et le
graphique de consommation restent.

### Entité du volume distribué

Un interrupteur et un sélecteur d'entité. Activé, la courbe orange du graphique
quotidien est lue depuis une de vos entités — un débitmètre sur la ligne osmosée
— au lieu du compteur de l'appareil. La moyenne glissante rouge reste celle de
l'appareil : seule la source du volume change, pas la comparaison à laquelle il
est confronté.

C'est l'interrupteur qui active l'option, de sorte qu'une entité restée d'une
configuration précédente est ignorée plutôt que de reprendre la main en silence.

### Entités de remplissage et d'arrêt

Chacun des deux boutons peut être lié à une entité d'une autre intégration, pour
piloter votre propre vanne. Le service est déduit du domaine de l'entité,
puisqu'en choisir une dit déjà de quoi il s'agit :

| Domaine de l'entité       | Remplir      | Arrêter       |
| ------------------------- | ------------ | ------------- |
| `button`, `input_button`  | `press`      | `press`       |
| `switch`, `input_boolean` | `turn_on`    | `turn_off`    |
| `valve`                   | `open_valve` | `close_valve` |
| `script`                  | `turn_on`    | `turn_on`     |

Un seul interrupteur est une commande complète : activé il remplit, désactivé il
arrête. Laissez l'autre sélecteur vide et le second bouton réutilise la même
entité avec le service opposé — il en va de même pour un `input_boolean` ou une
`valve`. Deux boutons à impulsion doivent être choisis séparément, car une
pression ne porte pas de direction.

Une commande liée ne suit plus non plus la pompe Red Sea : elle reste visible sur
un ReefATO+ qui ne signale aucune pompe, ce qui est tout l'intérêt de la lier.

Les options sont enregistrées sous le modèle tel que Home Assistant le remonte :

```yaml
type: custom:reef-card
device: "123456789012" # identifiant stable de l'appareil (son nom fonctionne aussi)
conf:
  RSATO+:
    devices:
      "123456789012":
        name: MY-RSATO # simple libellé
        infinite_tank: true
        external_usage: true
        external_usage_entity: sensor.rodi_flow_meter
        fill_entity: switch.rodi_valve
        stop_fill_entity: "" # laissé vide : l'interrupteur ci-dessus l'arrête aussi
```

---

[← Retour à la page principale](README.fr.md)
