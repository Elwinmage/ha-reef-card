[← Retour à la page principale](README.fr.md)

# ReefControl-Power

ReefControl et ReefControl-Power avec ha-reef-card en action :

[![Voir la vidéo](https://img.youtube.com/vi/voFobfc7Slk/0.jpg)](https://www.youtube.com/watch?v=voFobfc7Slk)

La carte ReefControl-Power dessine le Power Center avec ses prises, ce qui est
branché sur chacune d'elles, et à sa gauche soit sa propre sonde de température,
soit le [ReefControl](reefcontrol.fr.md#reefcontrol) auquel il est appairé.

Les deux modèles sont supportés : ils ne diffèrent que par leur nombre de prises.

<table>
  <tr>
    <th align="center">RSPOWER6</th>
    <th align="center">RSPOWER8</th>
  </tr>
  <tr>
    <td align="center"><img src="../img/rspower/rspower6.png"/></td>
    <td align="center"><img src="../img/rspower/rspower8.png"/></td>
  </tr>
</table>

La suite de cette section est illustrée avec le RSPOWER6 : tout fonctionne de la
même façon sur le RSPOWER8.

<img src="../img/rspower/rspower_zones.png"/>

La carte est divisée en 6 zones :

1. État d'alimentation et mode maintenance
2. Configuration, Wifi et batterie
3. Prises
4. Sonde de température ou lien ReefControl
5. Appareils liés
6. Dernier message et dernière alerte

## État d'alimentation et mode maintenance

<img src="../img/rspower/zone_1.png"/>

---

<span>L'interrupteur <img src="../img/mdi/mdi_power-plug.png" width="20"/> allume ou éteint le ReefControl-Power.</span>

<img src="../img/rspower/off_mode.png" width="50%"/>

Éteinte, la carte ne garde que l'interrupteur, l'image de la sonde de
température ou du ReefControl appairé, et les liens vers les autres appareils :
le nom du hub et les appareils branchés sur les prises ouvrent toujours leur
propre carte. Les prises perdent leurs boutons, leurs noms et leur consommation,
et la sonde sa mesure et ses réglages.

<span>L'interrupteur <img src="../img/mdi/mdi_account-wrench.png" width="20"/> bascule en mode maintenance.</span>

<img src="../img/rspower/maintenance.png" width="50%"/>

## Configuration / Informations Wifi

<img src="../img/rspower/zone_2.png"/>

---

<span>Cliquez sur l'icône <img src="../img/rsdose/cog_icon.png" width="30"/> pour gérer la configuration générale du ReefControl-Power : rafraîchir les réglages ou les données interrogées, réinitialiser l'appareil, mettre à jour son firmware, et voir sa région et son nombre de prises.</span>

La même boîte de dialogue ajoute ou supprime la sonde de température locale, et
désappaire le ReefControl. La sonde et le hub s'excluent : un bouton qui ne
s'applique pas est grisé plutôt que masqué, pour que vous voyiez quelles actions
existent.

<img src="../img/rspower/zone_2_dialog_config.png" width="50%"/>

<span>Cliquez sur l'icône <img src="../img/mdi/wifi_icon.png" width="30"/> pour gérer les réglages réseau.</span>

<img src="../img/rspower/zone_2_dialog_wifi.png" width="50%"/>

<span>L'icône <img src="../img/mdi/battery.png" width="30"/> indique le niveau de batterie du ReefControl-Power.</span>

## Prises

<img src="../img/rspower/zone_3.png"/>

---

Le texte sur la façade du Power Center est son **mode de fonctionnement** (Auto,
Setup…), à côté de la **consommation totale** de ses prises. Un clic sur la
consommation ouvre sa boîte de dialogue d'informations.

Chaque prise affiche, de haut en bas :

- Son **nom**.
- Son **bouton**, encadré de la couleur de la prise, avec une icône rouge quand
  la prise est alimentée et grise quand elle est éteinte. Il montre une fiche, ou
  l'icône de l'appareil branché dessus (voir [Appareils liés](#appareils-liés)).
- Sa **consommation**, qui ouvre sa boîte de dialogue d'informations.

De petites icônes au bas du bouton indiquent comment la prise est pilotée :

| Icône                                                                                                                                                                                                                                                                                                                               | Signification                                                                    |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| <img src="../img/mdi/mdi_power.png" width="20"/>                                                                                                                                                                                                                                                                                    | Marche ou arrêt à la main                                                        |
| <img src="../img/mdi/mdi_clock-time-nine-outline.png" width="20"/>                                                                                                                                                                                                                                                                  | Suit un programme — un clic ouvre son éditeur                                    |
| <img src="../img/mdi/mdi_thermometer.png" width="20"/> <img src="../img/mdi/mdi_ph.png" width="20"/> <img src="../img/mdi/mdi_water-percent.png" width="20"/> <img src="../img/mdi/mdi_flash-triangle.png" width="20"/> <img src="../img/mdi/mdi_water-alert.png" width="20"/> <img src="../img/mdi/mdi_cup-water.png" width="20"/> | Suit une sonde : température, pH, salinité, ORP, fuite ou niveau d'eau ATO       |
| <img src="../img/mdi/mdi_hand-back-left-outline.png" width="20"/>                                                                                                                                                                                                                                                                   | Son programme ou sa sonde est suspendu : la prise a été mise à l'arrêt à la main |

Une prise jamais configurée affiche un **+** à la place de son bouton : un clic
ouvre ses réglages pour lui donner un mode.

Un **clic** sur le bouton ouvre les réglages de la prise. Un **appui long**
allume ou éteint directement la prise.

### Prise

<img src="../img/rspower/zone_3_dialog_socket.png" width="50%"/>

La boîte de dialogue commence par le nom, l'interrupteur, l'état et la
consommation de la prise, puis propose ses quatre modes :

- **Marche** / **Arrêt** : la prise reste alimentée, ou non.
- **Horaire** : une frise de 24 heures et la liste de ses intervalles de
  **marche**. Ajoutez, modifiez ou supprimez des intervalles ; un intervalle qui
  se termine avant de commencer, ou qui chevauche le précédent, est expliqué sous
  la liste et bloque l'enregistrement.

<img src="../img/rspower/zone_3_socket_schedule.png" width="50%"/>

- **Sonde** : la prise suit une sonde — la sonde de température locale du Power
  Center, ou n'importe quelle sonde du ReefControl appairé, températures
  intégrées comprises. Choisissez si la prise s'**allume** ou s'**éteint**, quand
  la mesure passe **au-dessus** ou **en dessous** d'un **seuil**, avec une
  **hystérésis** (une zone morte autour du seuil, pour que la prise ne
  clignote pas), et quoi faire si la sonde est perdue. Une prise qui suit une
  sonde ATO n'a pas besoin de seuil.

<img src="../img/rspower/zone_3_socket_sensor.png" width="50%"/>

Rien n'est envoyé à l'appareil avant d'appuyer sur **Enregistrer**.

Quand une prise qui suit un programme ou une sonde a été mise à l'arrêt à la
main, la boîte de dialogue s'ouvre sur ce mode automatique, indique qu'il est
suspendu, et propose de le **reprendre** sans réécrire son programme ni sa
règle.

<img src="../img/rspower/zone_3_socket_override.png" width="50%"/>

<span>L'icône de corbeille <img src="../img/mdi/mdi_delete-empty.png" width="20"/> en haut à droite supprime la configuration de la prise, après confirmation : la prise reprend son nom d'usine et n'a plus de mode.</span>

<img src="../img/rspower/zone_3_dialog_delete.png" width="50%"/>

## Sonde de température ou lien ReefControl

La gauche de la carte montre d'où le Power Center lit sa température : sa propre
sonde, ou le ReefControl auquel il est appairé. Les deux s'excluent.

### Sonde de température

<img src="../img/rspower/zone_4_temperature.png"/>

---

La sonde de température locale est dessinée branchée sur le Power Center, avec
sa mesure colorée selon son niveau, et une barre de situation le long de la sonde
(un rond dans le mode compact de l'éditeur de carte). Un clic sur la barre ouvre
les dernières 24 heures de la température sur ses bandes.

Une sonde débranchée clignote sous une légère teinte rouge.

<span>Un clic sur la roue dentée <img src="../img/rsdose/cog_icon.png" width="30"/> ouvre les réglages de la sonde : son nom, un bouton pour la lire maintenant, ses plages souhaitée et acceptable, son étalonnage sur la température réelle, et ses interrupteurs de journalisation et de notification.</span>

<img src="../img/rspower/zone_4_dialog_temperature.png" width="50%"/>

### Lien ReefControl

<img src="../img/rspower/zone_4_rscontrol.png"/>

---

Un ReefControl appairé prend la place de la sonde : son câble est dessiné avec le
nom du hub le long. Un clic sur le nom ouvre la carte du hub.

<span>L'icône <img src="../img/mdi/mdi_web.png" width="20"/> ouvre la boîte de dialogue du lien : le hub appairé, son type et son statut, et s'il est connecté au Power Center et à internet.</span>

<img src="../img/rspower/zone_4_dialog_rscontrol.png" width="50%"/>

Quand le hub est appairé mais injoignable, le lien clignote sous une légère
teinte rouge.

## Appareils liés

<img src="../img/rspower/zone_5.png"/>

---

Le Power Center ne sait pas ce qui est branché sur ses prises : la carte vous
permet de le lui indiquer, depuis l'éditeur de carte. Une prise liée à un
appareil Red Sea ou à une pompe Aqua Medic affiche :

- une image de l'appareil sous la prise, sur deux rangées décalées pour que les
  voisines ne se chevauchent pas, reliée à elle par un tuyau de la couleur de la
  prise (gris quand la prise est éteinte) ;
- l'icône de l'appareil sur le bouton de la prise, à la place de la fiche.

Une pompe ReefRun est représentée par son rôle, pompe de remontée ou écumeur,
plutôt que par son contrôleur. Tout autre appareil connu de Home Assistant peut
aussi être lié, mais n'a pas encore d'image.

Pour un appareil que Home Assistant ne connaît pas (chauffage, lampe, ventilateur…), choisissez **Autre** : le bouton de la prise affiche alors <img src="../img/mdi/mdi_dots-horizontal-circle-outline.png" width="20"/> au lieu de la fiche, sans image en dessous.

L'image suit l'état de l'appareil :

| Aspect     | État de l'appareil Red Sea                                                      |
| ---------- | ------------------------------------------------------------------------------- |
| Normal     | Fonctionne normalement                                                          |
| Grisé      | Éteint                                                                          |
| Clignotant | Tout le reste : mode manuel, maintenance, indisponible, une pompe hors service… |

Les appareils d'autres intégrations sont toujours dessinés normalement.

Un clic sur l'image ouvre la carte de l'appareil.

## Messages

<img src="../img/rspower/zone_6.png"/>

---

Cette zone affiche les derniers messages système du ReefControl-Power. Elle a deux lignes :

- La ligne grise montre le **dernier message** reçu.
- La ligne rose montre la **dernière alerte**, précédée du symbole ⚠.

Cliquer sur l'icône <img src="../img/mdi/mdi_delete-empty.png" width="20"/> efface le message correspondant.

Ces lignes peuvent être masquées depuis l'interface de l'éditeur de carte.

## Éditeur de carte

<img src="../img/rspower/editor.png" width="50%"/>

---

En plus des deux lignes de messages, le ReefControl-Power a trois options :

- **Sondes compactes** : la température est affichée par un rond coloré selon son
  niveau au lieu d'une barre de situation.
- **Couleur des prises** : la couleur de chaque prise, utilisée par son bouton
  et par le tuyau vers son appareil lié.
- **Appareil lié** : pour chaque prise, l'appareil branché dessus, ou **Aucun**. **Autre** désigne un appareil que Home Assistant ne connaît pas.

Les options sont enregistrées sous le modèle tel que Home Assistant le remonte :

```yaml
type: custom:reef-card
device: "210987654321" # identifiant stable de l'appareil (son nom fonctionne aussi)
conf:
  RSPOWER6:
    devices:
      "210987654321":
        name: MY-RSPOWER # simple libellé
        compact_probes: false
        sockets:
          socket_1:
            color: "255,0,0"
            linked_device: 0123456789abcdef0123456789abcdef
          socket_3:
            linked_device: fedcba9876543210fedcba9876543210
```

---

[← Retour à la page principale](README.fr.md)
