[← Retour à la page principale](README.fr.md)

# ReefRun

ReefRun avec ha-reef-card en action:

[![Voir la vidéo](https://img.youtube.com/vi/Xxv38OPqiGI/0.jpg)](https://www.youtube.com/watch?v=Xxv38OPqiGI)

La carte ReefRun présente le contrôleur et ses deux pompes telles qu'elles sont
physiquement câblées, chacune avec son câble et sa tuyauterie. La pompe 1 est
celle de gauche, la pompe 2 celle de droite — typiquement la pompe de remontée
et le DC Skimmer, mais chaque prise accepte l'un ou l'autre modèle.

<img src="../img/rsrun/rsrun_zones.png"/>

La carte est divisée en 6 zones :

1. État d'alimentation et mode maintenance
2. Informations batterie et Wifi
3. Contrôleur : mode de fonctionnement, boutons des pompes et calibrations
4. Pompe 1 : programme journalier, corps avec débit d'eau en direct, température
5. Pompe 2 : programme journalier, corps avec débit d'eau en direct, température
6. Dernier message et dernière alerte

## État d'alimentation et mode maintenance

<img src="../img/rsrun/zone_1.png" >

<span>L'interrupteur de maintenance <img src="../img/mdi/mdi_account-wrench.png" width="20"/> bascule en mode maintenance.</span>

<img src="../img/rsrun/maintenance.png" >

<span>L'interrupteur marche/arrêt <img src="../img/mdi/mdi_power-plug.png" width="20"/> allume ou éteint le Reef Dual Controller.</span>

<img src="../img/rsrun/off_mode.png" >

## Informations batterie et Wifi

<img src="../img/rsrun/zone_2.png"/>

---

<span>Cette icône <img src="../img/mdi/battery.png" width="30" /> indique le niveau de batterie du Dual Controller.</span>

<span>Cliquez sur l'icône <img src="../img/mdi/wifi_icon.png" width="30" /> pour gérer les paramètres réseau.</span>

<img src="../img/rsrun/zone_2_dialog_wifi.png"/>

## Contrôleur : mode de fonctionnement, boutons des pompes et calibrations

<img src="../img/rsrun/zone_3.png"/>

### Réglages des pompes

Un clic sur <img src="../img/mdi/cog-1.png" width="5%"/> ou <img src="../img/mdi/cog-2.png" width="5%"/> ouvre le dialogue de configuration de la pompe 1 ou 2.

<img src="../img/rsrun/zone_3_return_pump.png"/>
<img src="../img/rsrun/zone_3_skimmer.png"/>

> [!CAUTION]
> **Supprimer la pompe** remet ses réglages aux valeurs d'usine : le programme
> horaire et le pilotage par sonde sont perdus. Une confirmation est toujours
> demandée.

### Réglages de la sonde

Un clic sur <img src="../img/mdi/cog-s.png" width="5%"/> ouvre le dialogue de configuration de la sonde.
<img src="../img/rsrun/zone_3_sensor.png"/>

### Marche/pause d'une pompe <img src="../img/mdi/play.png" width="5%"/> / <img src="../img/mdi/pause.png" width="5%"/>

Un clic démarre ou arrête la pompe concernée.

L'anneau rouge indique la vitesse courante.
<img src="../img/rsrun/speed.png"/>

Pour modifier la vitesse courante, maintenez <img src="../img/mdi/play.png" width="5%"/> / <img src="../img/mdi/pause.png" width="5%"/> ou cliquez sur le programme horaire :

<img src="../img/rsrun/schedule.png"/>

## États d'une pompe

Le corps de la pompe reflète ce que fait réellement l'appareil, un coup d'œil
suffit. Les deux types de pompe n'ont pas les mêmes états, ils sont donc décrits
séparément.

## Pompes 1 & 2

### Pompe de remontée

<img src="../../src/img/redsea/RSRUN/reefrun_return.png" width="30%"/>

Une seule illustration couvre tous les états, la carte ne change que sa façon de
la dessiner :

- **En marche** — couleurs pleines, eau animée à la vitesse courante.
- **Arrêtée** — la même illustration grisée, pas de flux.
- **Débranchée** — le même grisage, plus le câble d'alimentation qui clignote.

### Écumeur

Trois illustrations distinctes, une par état du godet :

<table>
  <tr>
    <td align="center"><img src="../../src/img/redsea/RSRUN/reefrun_skimmer_on.png" width="100%"/><br/><b>En marche</b><br/>Mousse dans le godet, bulles qui montent, eau animée</td>
    <td align="center"><img src="../../src/img/redsea/RSRUN/reefrun_skimmer_full.png" width="100%"/><br/><b>Godet plein</b><br/>Mousse réduite à une bande sous le couvercle</td>
    <td align="center"><img src="../../src/img/redsea/RSRUN/reefrun_skimmer_off.png" width="100%"/><br/><b>Arrêté</b><br/>Godet vide, grisé, plus de bulles</td>
  </tr>
</table>

Un écumeur débranché est visuellement identique à un écumeur arrêté : seul le
câble qui clignote les distingue. Ce clignotement signifie que le ReefRun remonte
`missing_pump`, donc la pompe est configurée mais le contrôleur ne la voit plus.
Vérifiez la prise avant de chercher plus loin.

L'état godet plein est remonté par le capteur d'écume situé dans le godet
collecteur. Le corps bascule sur sa propre illustration et l'animation de mousse
se réduit à une fine bande sous le couvercle, que l'auto-régulation soit activée
ou non. L'icône d'alerte clignotante à côté de l'interrupteur godet plein
n'apparaît que si `sensor_controlled` est actif, puisque capteur désactivé le
contrôleur n'agit pas sur un godet plein.

### Ajouter une pompe

Un emplacement sans pompe configurée affiche un visuel d'**ajout** à la place du
corps de pompe :

<img src="../../src/img/redsea/RSRUN/add_pump.png" width="20%"/>

Un clic ouvre le dialogue de configuration, où **Détecter et ajouter** demande
au contrôleur ce qui est branché et l'enregistre en une seule opération. Le
modèle détecté n'est qu'une suggestion et se trompe parfois : la liste des
modèles reste donc modifiable ensuite, pour un DC Skimmer choisissez rsk-300,
rsk-600 ou rsk-900. Le nom de la pompe s'édite dans le même dialogue.

Le visuel est présent sur tout emplacement non configuré, il apparaît donc aussi
sur un emplacement que vous ne comptez pas utiliser. Ceux qui n'ont qu'une seule
pompe peuvent le masquer complètement depuis l'éditeur de carte.

<img src="../img/rsrun/editor.png"/>

### Programme horaire

<img src="../img/rsrun/schedule.png"/>

La courbe bleue est la vitesse programmée sur 24 heures. Le trait rouge vertical
marque l'heure courante, et le point qui s'y trouve la vitesse demandée par le
programme.

Quand la pompe ne suit pas son programme — mode nourrissage, détection de
coupelle pleine, protection contre le sur-écumage — le point se déplace sur la
vitesse **réelle** et un segment rouge matérialise l'écart, chiffré à côté :

<img src="../img/rsrun/schedule_deviation.png"/>

Un clic sur le graphique ouvre l'éditeur de programme : ajout et suppression de points, modification des heures et des vitesses, aperçu d'un point sur l'appareil, puis enregistrement.

<img src="../img/rsrun/schedule_editor.png"/>

## Messages

<img src="../img/rsrun/zone_6.png"/>

---

Cette zone affiche les derniers messages système du ReefRun. Elle comporte deux lignes :

- La ligne grise affiche le **dernier message** reçu.
- La ligne rose affiche la **dernière alerte**, précédée du symbole ⚠.

Un clic sur l'icône <img src="../img/mdi/mdi_delete-empty.png" width="20"/> efface le message correspondant.

Ces lignes peuvent être masquées depuis l'éditeur de carte.

<img src="../img/rsrun/editor_2.png" />

---

[← Retour à la page principale](README.fr.md)
