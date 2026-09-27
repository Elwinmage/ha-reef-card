[← Retour à la page principale](README.fr.md)

# ReefControl

ReefControl et ReefControl-Power avec ha-reef-card en action :

[![Voir la vidéo](https://img.youtube.com/vi/VIDEO_ID/0.jpg)](https://www.youtube.com/watch?v=VIDEO_ID)

La carte ReefControl dessine le hub tel qu'il est câblé : les sondes ReefSense
suspendues à leurs boîtiers d'extension, les ports 12V, la pompe ATO quand un
port en pilote une, et le [ReefControl-Power](reefcontrol-power.fr.md#reefcontrol-power) appairé
au-dessus.

Les deux modèles sont supportés. Le Pro accepte jusqu'à 7 sondes (un second
boîtier d'extension est dessiné dès qu'une cinquième sonde est branchée) et a
deux ports 12V ; le Lite accepte 2 sondes et a un seul port 12V.

<table>
  <tr>
    <th align="center">RSCONTROLPRO</th>
    <th align="center">RSCONTROLLITE</th>
  </tr>
  <tr>
    <td align="center"><img src="../img/rscontrol/rscontrolpro.png"/></td>
    <td align="center"><img src="../img/rscontrol/rscontrollite.png"/></td>
  </tr>
</table>

La suite de cette section est illustrée avec le Pro : tout fonctionne de la même
façon sur le Lite.

<img src="../img/rscontrol/rscontrol_zones.png"/>

La carte est divisée en 7 zones :

1. Contrôleur : alimentation, mode maintenance, configuration, Wifi et buzzer
2. Power Center appairé (ReefControl-Power)
3. Résumé des mesures
4. Sondes
5. Ports 12V
6. ATO
7. Dernier message et dernière alerte

## Contrôleur

<img src="../img/rscontrol/zone_1.png"/>

---

Le texte sur la façade du hub est le **mode de fonctionnement** remonté par
l'appareil (Auto, Setup, Maintenance…), traduit dans la langue de Home
Assistant.

<span>L'interrupteur <img src="../img/mdi/mdi_power-plug.png" width="20"/> allume ou éteint le ReefControl.</span>

<img src="../img/rscontrol/off_mode.png" width="50%"/>

Éteint, le hub ne mesure et ne pilote plus rien : la carte ne garde que son
interrupteur et les images du matériel. Les sondes perdent leurs valeurs, leurs
barres et leurs réglages, et le buzzer, le résumé, les ports 12V et les icônes
de configuration sont masqués.

<span>L'interrupteur <img src="../img/mdi/mdi_account-wrench.png" width="20"/> bascule en mode maintenance.</span>

<img src="../img/rscontrol/maintenance.png" width="50%"/>

<span>Cliquez sur l'icône <img src="../img/rsdose/cog_icon.png" width="30"/> pour gérer la configuration générale du ReefControl : rafraîchir les réglages ou les données interrogées, réinitialiser l'appareil, mettre à jour son firmware, régler la [fusion des températures](https://github.com/Elwinmage/ha-reefbeat-component/blob/main/doc/fr/reefcontrol.fr.md#fusion-de-température-multi-sondes), voir l'état du réseau et du câble, et gérer l'appairage avec un ReefControl-Power.</span>

<img src="../img/rscontrol/zone_1_dialog_config.png" width="50%"/>

<span>Cliquez sur l'icône <img src="../img/mdi/wifi_icon.png" width="30"/> pour gérer les réglages réseau.</span>

<img src="../img/rscontrol/zone_1_dialog_wifi.png" width="50%"/>

### Buzzer

<span>La cloche <img src="../img/mdi/mdi_bell-alert.png" width="20"/> est posée sur la LED d'état du hub. Elle est verte quand le buzzer est silencieux, rouge et clignotante quand il sonne, et reste rouge une fois l'alarme acquittée.</span>

Un clic ouvre la boîte de dialogue du buzzer : ce qu'il fait en ce moment et
pourquoi, puis ses deux alarmes — l'alarme de **danger** (une mesure hors de sa
plage) et l'alarme de **fuite** — chacune avec son interrupteur, sa fréquence et
son rapport cyclique, l'anti-rebond du danger et le détecteur de fuite.

<img src="../img/rscontrol/zone_1_dialog_buzzer.png" width="50%"/>

## Power Center appairé

<img src="../img/rscontrol/zone_2.png"/>

---

Quand un ReefControl-Power est appairé au hub, il est dessiné au-dessus, avec 6
ou 8 prises selon son modèle, relié au hub par son câble. Une prise alimentée est
éclairée d'un léger masque rouge.

Un clic sur le Power Center ouvre sa propre carte (voir
[ReefControl-Power](reefcontrol-power.fr.md#reefcontrol-power)).

Quand le Power Center est appairé mais injoignable, il clignote sous une légère
teinte rouge. L'appairage et le désappairage se font depuis la boîte de dialogue
de configuration du contrôleur.

## Résumé

<img src="../img/rscontrol/zone_3.png"/>

---

La barre entre le Power Center et les sondes résume toutes les mesures du hub,
de gauche à droite :

- Une alerte <img src="../img/mdi/mdi_alert.png" width="20"/>, seulement quand quelque chose ne va pas : orange quand la pire mesure est acceptable, rouge quand l'une est en danger. Les températures intégrées comptent aussi.
- La **température** : la valeur fusionnée quand le hub a plusieurs sources de température, sinon celle de la sonde de température, sinon la première température intégrée.
- <span>Un thermomètre <img src="../img/mdi/mdi_thermometer-alert.png" width="20"/>, seulement quand le hub soupçonne une de ses sources de température ; son infobulle nomme la sonde en cause.</span>
- Le pH, l'ORP et la salinité, une entrée par sonde.
- <span>Une goutte <img src="../img/mdi/mdi_water-alert.png" width="20"/> par sonde de fuite, rouge quand elle est mouillée.</span>
- <span>Des vagues <img src="../img/mdi/mdi_waves.png" width="20"/> par sonde ATO, vertes sur un niveau souhaité, orange en dessous ou au-dessus.</span>

Chaque mesure prend la couleur de son niveau : vert pour souhaité, orange pour
acceptable, rouge pour danger, blanc quand la sonde ne donne pas de mesure
valide. Un clic sur une mesure ouvre sa boîte de dialogue d'informations.

## Sondes

<img src="../img/rscontrol/zone_4.png"/>

---

Chaque sonde du hub pend à un boîtier d'extension, dans l'ordre où le hub les
liste. Chacune affiche :

- Sa **mesure**, et la **température intégrée** juste en dessous pour les sondes
  pH, salinité et ATO, colorées selon leur niveau. Un clic sur une valeur ouvre
  sa boîte de dialogue d'informations.
- Une **barre de situation** par mesure : les bandes rouge, orange et verte sont
  les plages de danger, acceptable et souhaitée réglées sur la sonde, et le
  repère noir indique où se situe la mesure. La mesure principale est sur la
  barre de gauche, la température sur celle de droite. Un clic sur une barre
  ouvre les dernières 24 heures de la mesure sur ses bandes.

<img src="../img/rscontrol/zone_4_history.png" width="50%"/>

- <span>Une roue dentée <img src="../img/rsdose/cog_icon.png" width="30"/> qui ouvre les réglages de la sonde.</span>

Une sonde débranchée clignote sous une légère teinte rouge et ne donne aucune
mesure.

### Réglages de la sonde

<img src="../img/rscontrol/zone_4_dialog_probe.png" width="50%"/>

La boîte de dialogue rassemble tout ce qui concerne une sonde : ses mesures, son
statut, ses plages souhaitée et acceptable (et celles de sa température
intégrée), l'unité d'affichage d'une sonde de salinité, et ses interrupteurs —
activée, buzzer, notifications, et maintenance, qui tient la sonde à l'écart de
la fusion des températures pendant son nettoyage ou son étalonnage.

Le bouton **Lire la valeur** demande une mesure fraîche au hub au lieu
d'attendre la prochaine interrogation ; les valeurs de la boîte de dialogue se
mettent à jour sur place.

Les boutons d'étalonnage en bas n'affichent que les étalonnages du type de la
sonde, et aucun tant qu'elle est débranchée. Chaque étalonnage ouvre sa propre
boîte de dialogue, décrite ci-dessous par type de sonde.

### Types de sondes

#### pH

<img src="../../src/img/redsea/RSSENSE/rssense-ph-temperature.png" width="10%"/> <img src="../../src/img/redsea/RSSENSE/rssense-ph.png" width="10%"/>

La mesure de pH, et la température quand la sonde en a une — une sonde pH sans
température a sa propre image, avec une seule barre.

L'étalonnage se fait en deux points, comme dans l'application ReefBeat : pH 7
d'abord, puis pH 10 pour l'eau de mer ou pH 4 pour l'eau douce, chaque solution
étant donnée avec la température à laquelle elle est étalonnée. Après chaque
point, le hub attend que la mesure se stabilise : la boîte de dialogue affiche
la stabilité et le temps restant, et l'étape suivante ne se débloque qu'une fois
le hub prêt. Fermer la boîte de dialogue annule l'étalonnage.

<img src="../img/rscontrol/zone_4_calibration_ph.png" width="50%"/>

#### Salinité

<img src="../../src/img/redsea/RSSENSE/rssense-salinity-temperature.png" width="10%"/>

La salinité, dans l'unité choisie dans les réglages de la sonde, et la
température.

L'étalonnage se fait en un seul point : plongez la sonde dans la solution et
saisissez sa valeur en mS/cm (entre 20 et 99).

<img src="../img/rscontrol/zone_4_calibration_ec.png" width="50%"/>

#### ORP

<img src="../../src/img/redsea/RSSENSE/rssense-orp.png" width="10%"/>

L'ORP en mV. Pour l'étalonner, plongez la sonde dans la solution de référence et
saisissez la valeur de la solution : la sonde lit ensuite cette valeur.

<img src="../img/rscontrol/zone_4_calibration_orp.png" width="50%"/>

#### Température

<img src="../../src/img/redsea/RSSENSE/temperature.png" width="10%"/>

La température, sur une seule barre. Pour l'étalonner, placez la sonde dans une
eau dont vous avez mesuré la température avec un thermomètre de référence,
attendez que la mesure se stabilise, et saisissez la température réelle.

La température intégrée des sondes pH, salinité et ATO s'étalonne de la même
façon, depuis leur propre bouton **Calibrer la température**.

<img src="../img/rscontrol/zone_4_calibration_temperature.png" width="50%"/>

#### ATO

<img src="../../src/img/redsea/RSSENSE/rssense-ato.png" width="10%"/>

La sonde de niveau est dessinée dans l'eau de la décantation, au repère que la
sonde remonte, comme sur le [ReefATO+](reefato.fr.md#aquarium). Sa température s'affiche sur
le corps noir, juste sous le connecteur.

| État              | Signification                                                 |
| ----------------- | ------------------------------------------------------------- |
| En dessous        | La surface est sous la sonde : l'ATO ne suit pas              |
| Niveau souhaité 1 | Premier repère de remise à niveau                             |
| Niveau souhaité 2 | Second repère de remise à niveau                              |
| Au-dessus         | La surface est au-dessus de la sonde : le bac est trop rempli |

**En dessous** et **Au-dessus** font clignoter l'eau. Une sonde en erreur n'a pas
de ligne d'eau du tout.

#### Fuite

<img src="../../src/img/redsea/RSSENSE/rssense-leak.png" width="10%"/>

Quand de l'eau est détectée, une flaque s'étend au pied de la sonde, et une icône
clignotante indique d'où vient l'eau, telle que la sonde la signale :

<table>
  <tr>
    <th align="center">Fuite d'eau de l'aquarium <img src="../img/mdi/mdi_fish.png" width="20"/></th>
    <th align="center">Fuite d'eau osmosée <img src="../img/mdi/mdi_cup-water.png" width="20"/></th>
  </tr>
  <tr>
    <td align="center"><img src="../img/rscontrol/zone_4_leak_aquarium.png"/></td>
    <td align="center"><img src="../img/rscontrol/zone_4_leak_rodi.png"/></td>
  </tr>
</table>

Une sonde de fuite dont la détection est désactivée est grisée : elle est là,
elle ne détecte rien.

> [!NOTE]
> Les sondes s'ajoutent, se remplacent et se suppriment depuis le menu d'options
> de l'intégration (voir [ha-reefbeat-component](https://github.com/Elwinmage/ha-reefbeat-component/blob/main/doc/fr/reefcontrol.fr.md#gestion-des-sondes-ajout--remplacement--suppression)) :
> la carte suit d'elle-même.

## Ports 12V

<img src="../img/rscontrol/zone_5.png"/>

---

Chaque port 12V du hub a sa roue dentée sur son connecteur, et sa consommation
au-dessus (un clic ouvre sa boîte de dialogue d'informations). Un port alimenté
allume son connecteur. Le Pro a deux ports, la roue dentée du second étant
dessinée différemment ; le Lite en a un.

<span>Un clic sur la roue dentée <img src="../img/mdi/cog-1.png" width="5%"/> ouvre les réglages du port : son nom, son interrupteur, son état, son type et sa consommation, puis l'éditeur de mode.</span>

<img src="../img/rscontrol/zone_5_dialog_port.png" width="50%"/>

Un port se pilote comme une [prise du Power Center](reefcontrol-power.fr.md#prise), avec les mêmes
quatre modes — **Marche**, **Arrêt**, **Horaire** et **Sonde** — plus la
**puissance** qu'il délivre quand il est allumé, en %. Rien n'est envoyé au hub
avant d'appuyer sur **Enregistrer**. Un port jamais installé est installé à
l'enregistrement, comme le fait l'application ReefBeat.

<span>L'icône de corbeille <img src="../img/mdi/mdi_delete-empty.png" width="20"/> en haut à droite désinstalle le port, après confirmation : il revient à son état d'usine et perd son nom, son programme et sa règle de sonde.</span>

<img src="../img/rscontrol/zone_5_dialog_delete.png" width="50%"/>

## ATO

<img src="../img/rscontrol/zone_6.png"/>

---

Quand un port 12V pilote une pompe ATO — le kit ATO Red Sea, ou toute pompe qui
suit une sonde ATO — la pompe est dessinée dans son réservoir, reliée à son port.
Tant que le port est alimenté, l'eau s'écoule de la sortie au-dessus de la
décantation.

## Messages

<img src="../img/rscontrol/zone_7.png"/>

---

Cette zone affiche les derniers messages système du ReefControl. Elle a deux lignes :

- La ligne grise montre le **dernier message** reçu.
- La ligne rose montre la **dernière alerte**, précédée du symbole ⚠.

Cliquer sur l'icône <img src="../img/mdi/mdi_delete-empty.png" width="20"/> efface le message correspondant.

Ces lignes peuvent être masquées depuis l'interface de l'éditeur de carte.

## Éditeur de carte

<img src="../img/rscontrol/editor.png" width="50%"/>

---

En plus des deux lignes de messages, le ReefControl a deux options :

- **Sondes compactes** : chaque mesure est affichée par un rond coloré selon son
  niveau au lieu d'une barre de situation. Un signe sur le rond indique de quel
  côté de la plage souhaitée se trouve la mesure. Un clic sur le rond ouvre ses
  dernières 24 heures, comme la barre.
- **Emplacement des sondes** : les sondes sont placées dans l'ordre où le hub
  les liste. Une sonde peut être épinglée à un emplacement des boîtiers
  d'extension, pour que la carte corresponde au branchement réel des sondes.
  **Auto** la rend à l'ordre du hub.

---

[← Retour à la page principale](README.fr.md)
