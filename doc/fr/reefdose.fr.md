[← Retour à la page principale](README.fr.md)

# ReefDose

ReefDose avec ha-reef-card en action:

[![Regarder la vidéo](https://img.youtube.com/vi/Qee5LH0T9wQ/0.jpg)](https://www.youtube.com/watch?v=Qee5LH0T9wQ)

La carte ReefDose est découpée en 6 zones:

1.  Configuration/Informations Wifi
2.  Etats
3.  Dosage Manuel
4.  Configuration et planning des têtes
5.  Gestion des suppléments
6.  File d'attentes des futures doses

<img src="../img/rsdose/rsdose4_ex1.png"/>

## Configuration/Informations Wifi

<img src="../img/rsdose/zone_1.png"/>

---

<span >Cliquez sur l'icône <img src="../img/rsdose/cog_icon.png" width="30" /> pour gérer la configuration générale du ReefDose.</span>

<img src="../img/rsdose/zone_1_dialog_config.png"/>

<span>Cliquez sur l'icône <img width="30px" src="../img/rsdose/wifi_icon.png"/> pour gérer les paramètres réseaux.</span>

<img src="../img/rsdose/zone_1_dialog_wifi.png"/>

## États

 <img src="../img/rsdose/zone_2.png"/>

---

<span>L'interrupteur de maintenance <img width="30px" src="../img/rsdose/zone_2_maintenance.png"/> permet de basculer vers le mode maintenance.</span>

 <img  src="../img/rsdose/maintenance_view.png"/>

<span>L'interrupteur de on/off <img width="30px" src="../img/rsdose/zone_2_off.png"/> permet de basculer entre les états on et off du ReefMat.</span>

 <img  src="../img/rsdose/off_view.png"/>

## Dosage Manuel

<img src="../img/rsdose/zone_3.png"/>

---

<span>Le bouton <img src="../img/rsdose/zone_3_manula_config_button.png"/> affiche la dose manuelle par default pour cette tête. Un clique dessus permet d'ouvrir la boîte de configuration de ce dosage.</span>

<img src="../img/rsdose/zone_3_dialog_manual_dose_without.png"/>

Vous pouvez ajouter des raccourcis en utilisant l'édition de la carte :

<img src="../img/rsdose/editor.png"/>

Par exemple la tête 1 propose comme raccourcis les valeurs 2, 5 et 10mL.

Ces valeurs apparaîtront en haut de la boite de dialogue. Un clic sur ces raccourcis lancera une commande pour doser la valeur définie.

<img src="../img/rsdose/zone_3_dialog_manual_dose.png"/>

<span>Un appui sur le bouton de dose manuel : <img src="../img/rsdose/zone_3_manual_button.png"/> enverra une commande de dose avec la valeur par défaut visible juste au dessus: <img src="../img/rsdose/zone_3_manual_dose.png"/>, soit 10mL dans cet exemple.
</span>

## Configuration et planning des têtes

 <img src="../img/rsdose/zone_4.png"/>

---

Cette zone permet de visualiser la programmation courante des têtes et de la changer.

- La bague circulaire colorée indique le pourcentage de dose journalière déjà distribué.
- le chiffre jaune en haut indique le cumul de dose manuel journalier
- la partie centrale indique le volume distributé par rapport au volume journalier programmé total
- le partie bleue en bas indique le nombre de doses distribuées par rapport au nombre de doses totales de la journées (exemple: 14/24 pour le bleu car c'est une programmation horaire que ce cette capture a été prise a 14h15.) Les valeurs pour le violet et le vert indiquent 0/0 car ces dosent doivent être distribuées à 8h mais l'intégration a été lancée aprés 8h donc il n'y aura aucune dose aujourd'hui.
- un clic long sur une des 4 têtes basculera la tête en on/off
- un clic sur une des têtes ouvrira la boîte de programmation.
  Depuis cette boite vous pouvez lancer un amorçage, recalibrer la tête, changer la dose journalière et sa programmation. N'oubliez pas de sauvegarder la programmation avant de quitter.

  <img src="../img/rsdose/zone_4_dialog_schedule.png"/>

### Régulation du dosage

La configuration de la tête contient la **Régulation du dosage** de l'[intégration redsea](https://github.com/Elwinmage/ha-reefbeat-component/blob/main/doc/fr/reefdose.fr.md#régulation-du-dosage) :

- **Dosage assisté** : le bouton **Dosage assisté** ouvre une fenêtre avec le graphique de vos résultats de test, la saisie d'un nouveau résultat, la dose proposée à appliquer ou à ignorer, et les réglages du calcul. Rien n'est envoyé au doseur tant que vous ne l'appliquez pas.

  <img src="../img/rsdose/assisted_dose_dialog.png" width="300"/> <img src="../img/rsdose/assisted_dose_settings.png" width="300"/>

  La fenêtre affiche la dose en cours (en lecture seule) juste au-dessus de la dose proposée. Un résultat de test se saisit à la main ou se lit sur la seringue d'un kit : choisir le kit (Red Sea, Salifert, Colombo…) et saisir la lecture du réactif en mL, le résultat est calculé. Le bouton **Historique des mesures** liste les résultats pour en ajouter un à une date passée, en corriger ou en supprimer un ; le graphique suit aussitôt. Un supplément qu'aucun test ne pilote (Red Sea NO3:PO4-X, nourritures) n'offre pas de dosage assisté et sa puissance est grisée. Une dose appliquée apparaît dans le programme de la tête en y revenant.

- **Saumure** : la tête est pilotée par Home Assistant seul, avec des doses manuelles ; sa configuration montre donc la saumure à la place du programme : salinité de la dernière semaine, état et alarme, saumure prévue, contrôle au réfractomètre et réglages. Sur la vue principale, l'anneau et le libellé central montrent la saumure dosée aujourd'hui par rapport à la saumure prévue, et le libellé du bas la salinité.

  <img src="../img/rsdose/brine_head.png" width="300"/> <img src="../img/rsdose/brine_status.png" width="300"/> <img src="../img/rsdose/brine_settings.png" width="300"/>

### Historique des doses

Tant que le doseur est en [mode Poseidon](https://github.com/Elwinmage/ha-reefbeat-component/blob/main/doc/fr/poseidon.fr.md#mode-poseidon), la configuration d'une tête a un bouton **Historique des doses** : les doses de la tête, des plus récentes aux plus anciennes, par jour, avec début, fin, durée, volume et type (programmée, manuelle, compensation). Sur 24 h, 7 ou 31 jours, ou tout ce qui est conservé, avec le volume total de la période. Un début marqué « ≈ » est estimé d'après le débit de la tête.

## Gestion des suppléments

 <img src="../img/rsdose/zone_5.png"/>

---

Cette zone permet de gérer les suppléments.
Si un supplément est déjà déclaré, un clic dessus permettra d'ouvrir la boîte de configuration où vous pourrez:

- supprimer le supplément (icone corbeille en haut à droite)
- indiquer le volume total du container
- indiquer le volume réel du supplément
- décider si vous voulez suivre le volume restant. Un clic sur les raccourcis en haut activera le contrôle et positionnera les valeurs par défaut avec un conteneur plein.
- modifier le nom d'affichage du supplément.

 <img src="../img/rsdose/zone_5_dialog_container.png"/>

Si aucun supplément n'est lié à une tête vous pouvez en ajouter un en cliquant sur le container avec un '+' (tête 4 dans notre exemple)

<img src="../img/rsdose/zone_5_add_container.png"/>

Suivez ensuite les instructions:

<img src="../img/rsdose/zone_5_dialog_add.png"/>

### Suppléments

Voici la liste des images de suppléments supportées, regroupées par marque. Si la vôtre affiche ❌, vous pouvez demander son ajout [ici](https://github.com/Elwinmage/reeftech-catalog/issues/new?labels=supplement).

<details>
<summary><b>ATI &nbsp; <sup>2/2 🖼️</sup></b></summary>

<table>
<tr><td>✅</td><td>Essential Pro 1</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/ati-essential-pro-1/image.webp'/></td></tr>
<tr><td>✅</td><td>Essential Pro 2</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/ati-essential-pro-2/image.webp'/></td></tr>
</table>
</details>

<details>
<summary><b>Aqua Forest &nbsp; <sup>3/9 🖼️</sup></b></summary>

<table>
<tr><td>✅</td><td>Ca Plus</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/aqua-forest-ca-plus/image.webp'/></td></tr>
<tr><td>❌</td><td colspan='2'>Calcium </td></tr>
<tr><td>❌</td><td colspan='2'>Component 1+</td></tr>
<tr><td>❌</td><td colspan='2'>Component 2+</td></tr>
<tr><td>❌</td><td colspan='2'>Component 3+</td></tr>
<tr><td>❌</td><td colspan='2'>KH Buffer</td></tr>
<tr><td>✅</td><td>KH Plus</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/aqua-forest-kh-plus/image.webp'/></td></tr>
<tr><td>❌</td><td colspan='2'>Magnesium</td></tr>
<tr><td>✅</td><td>Mg Plus</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/aqua-forest-mg-plus/image.webp'/></td></tr>
</table>
</details>

<details>
<summary><b>BRS &nbsp; <sup>0/4 🖼️</sup></b></summary>

<table>
<tr><td>❌</td><td colspan='2'>Liquid Calcium</td></tr>
<tr><td>❌</td><td colspan='2'>Liquid alkalinity</td></tr>
<tr><td>❌</td><td colspan='2'>Magnesium Mix</td></tr>
<tr><td>❌</td><td colspan='2'>Part C</td></tr>
</table>
</details>

<details>
<summary><b>Brightwell &nbsp; <sup>0/12 🖼️</sup></b></summary>

<table>
<tr><td>❌</td><td colspan='2'>Calcion</td></tr>
<tr><td>❌</td><td colspan='2'>Ferrion</td></tr>
<tr><td>❌</td><td colspan='2'>Hydrate - MG</td></tr>
<tr><td>❌</td><td colspan='2'>KoralAmino</td></tr>
<tr><td>❌</td><td colspan='2'>Koralcolor</td></tr>
<tr><td>❌</td><td colspan='2'>Liquid Reef</td></tr>
<tr><td>❌</td><td colspan='2'>Potassion</td></tr>
<tr><td>❌</td><td colspan='2'>Reef Code A</td></tr>
<tr><td>❌</td><td colspan='2'>Reef Code B</td></tr>
<tr><td>❌</td><td colspan='2'>Replenish</td></tr>
<tr><td>❌</td><td colspan='2'>Restore</td></tr>
<tr><td>❌</td><td colspan='2'>Strontion</td></tr>
</table>
</details>

<details>
<summary><b>DIY &nbsp; <sup>1/1 🖼️</sup></b></summary>

<table>
<tr><td>✅</td><td>Brine</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/diy-brine/image.webp'/></td></tr>
</table>
</details>

<details>
<summary><b>ESV &nbsp; <sup>0/5 🖼️</sup></b></summary>

<table>
<tr><td>❌</td><td colspan='2'>B-Ionic Component 1</td></tr>
<tr><td>❌</td><td colspan='2'>B-Ionic Component 2</td></tr>
<tr><td>❌</td><td colspan='2'>B-Ionic Magnesium</td></tr>
<tr><td>❌</td><td colspan='2'>Transition elements </td></tr>
<tr><td>❌</td><td colspan='2'>Transition elements plus</td></tr>
</table>
</details>

<details>
<summary><b>Fauna Marine &nbsp; <sup>0/11 🖼️</sup></b></summary>

<table>
<tr><td>❌</td><td colspan='2'>Amin</td></tr>
<tr><td>❌</td><td colspan='2'>Balling light  trace 1</td></tr>
<tr><td>❌</td><td colspan='2'>Balling light  trace 2</td></tr>
<tr><td>❌</td><td colspan='2'>Balling light  trace 3</td></tr>
<tr><td>❌</td><td colspan='2'>Balling light Ca</td></tr>
<tr><td>❌</td><td colspan='2'>Balling light KH</td></tr>
<tr><td>❌</td><td colspan='2'>Balling light Mg</td></tr>
<tr><td>❌</td><td colspan='2'>Blue trace elements</td></tr>
<tr><td>❌</td><td colspan='2'>Green trace elements</td></tr>
<tr><td>❌</td><td colspan='2'>Min S</td></tr>
<tr><td>❌</td><td colspan='2'>Red trace elements</td></tr>
</table>
</details>

<details>
<summary><b>Quantum &nbsp; <sup>7/7 🖼️</sup></b></summary>

<table>
<tr><td>✅</td><td>Aragonite A</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/quantum-aragonite-a/image.webp'/></td></tr>
<tr><td>✅</td><td>Aragonite B</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/quantum-aragonite-b/image.webp'/></td></tr>
<tr><td>✅</td><td>Aragonite C</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/quantum-aragonite-c/image.webp'/></td></tr>
<tr><td>✅</td><td>Bio Kalium</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/quantum-bio-kalium/image.webp'/></td></tr>
<tr><td>✅</td><td>Bio Metals</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/quantum-bio-metals/image.webp'/></td></tr>
<tr><td>✅</td><td>Bio enhance</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/quantum-bio-enhance/image.webp'/></td></tr>
<tr><td>✅</td><td>Gbio Gen</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/quantum-gbio-gen/image.webp'/></td></tr>
</table>
</details>

<details>
<summary><b>Red Sea &nbsp; <sup>14/17 🖼️</sup></b></summary>

<table>
<tr><td>✅</td><td>Bio Active (Colors D)</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/red-sea-bio-active-colors-d/image.webp'/></td></tr>
<tr><td>✅</td><td>Calcium (Foundation A)</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/red-sea-calcium-foundation-a/image.webp'/></td></tr>
<tr><td>❌</td><td colspan='2'>Calcium (Powder)</td></tr>
<tr><td>✅</td><td>Iodine (Colors A)</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/red-sea-iodine-colors-a/image.webp'/></td></tr>
<tr><td>✅</td><td>Iron (Colors C)</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/red-sea-iron-colors-c/image.webp'/></td></tr>
<tr><td>✅</td><td>KH/Alkalinity (Foundation B)</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/red-sea-kh-alkalinity-foundation-b/image.webp'/></td></tr>
<tr><td>❌</td><td colspan='2'>KH/Alkalinity (Powder)</td></tr>
<tr><td>✅</td><td>Magnesium (Foundation C)</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/red-sea-magnesium-foundation-c/image.webp'/></td></tr>
<tr><td>❌</td><td colspan='2'>Magnesium (Powder)</td></tr>
<tr><td>✅</td><td>NO3PO4-X</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/red-sea-no3po4-x/image.webp'/></td></tr>
<tr><td>✅</td><td>Potassium (Colors B)</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/red-sea-potassium-colors-b/image.webp'/></td></tr>
<tr><td>✅</td><td>Reef Energy Plus</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/red-sea-reef-energy-plus/image.webp'/></td></tr>
<tr><td>✅</td><td>ReefCare Part 1: Calcium & Magnesium</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/red-sea-reefcare-part-1-calcium-magnesium/image.webp'/></td></tr>
<tr><td>✅</td><td>ReefCare Part 2: KH/Alkalinity &PH stabilizer</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/red-sea-reefcare-part-2-kh-alkalinity-ph-stabilizer/image.webp'/></td></tr>
<tr><td>✅</td><td>ReefCare Part 3: Iodine & Potassium</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/red-sea-reefcare-part-3-iodine-potassium/image.webp'/></td></tr>
<tr><td>✅</td><td>ReefCare Part 4: Iron & Bioactive elements</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/red-sea-reefcare-part-4-iron-bioactive-elements/image.webp'/></td></tr>
<tr><td>✅</td><td>ReefCare Program</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/red-sea-reefcare-program/image.webp'/></td></tr>
</table>
</details>

<details>
<summary><b>Seachem &nbsp; <sup>0/9 🖼️</sup></b></summary>

<table>
<tr><td>❌</td><td colspan='2'>Reef Calcium</td></tr>
<tr><td>❌</td><td colspan='2'>Reef Carbonate</td></tr>
<tr><td>❌</td><td colspan='2'>Reef Complete</td></tr>
<tr><td>❌</td><td colspan='2'>Reef Fusion 1</td></tr>
<tr><td>❌</td><td colspan='2'>Reef Fusion 2</td></tr>
<tr><td>❌</td><td colspan='2'>Reef Iodine</td></tr>
<tr><td>❌</td><td colspan='2'>Reef Plus</td></tr>
<tr><td>❌</td><td colspan='2'>Reef Strontium</td></tr>
<tr><td>❌</td><td colspan='2'>Reef Trace</td></tr>
</table>
</details>

<details>
<summary><b>Triton &nbsp; <sup>0/4 🖼️</sup></b></summary>

<table>
<tr><td>❌</td><td colspan='2'>Core7 elements 1</td></tr>
<tr><td>❌</td><td colspan='2'>Core7 elements 2</td></tr>
<tr><td>❌</td><td colspan='2'>Core7 elements 3A</td></tr>
<tr><td>❌</td><td colspan='2'>Core7 elements 3B</td></tr>
</table>
</details>

<details>
<summary><b>Tropic Marin &nbsp; <sup>6/14 🖼️</sup></b></summary>

<table>
<tr><td>❌</td><td colspan='2'>A Element</td></tr>
<tr><td>✅</td><td>All-For-Reef</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/tropic-marin-all-for-reef/image.webp'/></td></tr>
<tr><td>✅</td><td>Amino Organic</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/tropic-marin-amino-organic/image.webp'/></td></tr>
<tr><td>❌</td><td colspan='2'>Balling A</td></tr>
<tr><td>❌</td><td colspan='2'>Balling B</td></tr>
<tr><td>❌</td><td colspan='2'>Balling C</td></tr>
<tr><td>✅</td><td>Bio-Magnesium</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/tropic-marin-bio-magnesium/image.webp'/></td></tr>
<tr><td>✅</td><td>Carbo Calcium</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/tropic-marin-carbo-calcium/image.webp'/></td></tr>
<tr><td>❌</td><td colspan='2'>Elimi-NP</td></tr>
<tr><td>❌</td><td colspan='2'>K Element</td></tr>
<tr><td>❌</td><td colspan='2'>Liquid Buffer</td></tr>
<tr><td>✅</td><td>NP-Bacto-Balance</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/tropic-marin-np-bacto-balance/image.webp'/></td></tr>
<tr><td>❌</td><td colspan='2'>Plus-NP</td></tr>
<tr><td>✅</td><td>Potassium</td><td><img style='width:20%;' src='https://raw.githubusercontent.com/Elwinmage/reeftech-catalog/main/supplements/items/tropic-marin-potassium/image.webp'/></td></tr>
</table>
</details>

<!-- supplements:end -->

---

[← Retour à la page principale](README.fr.md)
