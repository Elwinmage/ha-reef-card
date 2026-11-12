[← Voltar à página principal](README.pt.md)

# ReefDose

ReefDose com ha-reef-card em ação:

[![Ver o vídeo](https://img.youtube.com/vi/Qee5LH0T9wQ/0.jpg)](https://www.youtube.com/watch?v=Qee5LH0T9wQ)

O cartão ReefDose está dividido em 6 zonas:

1.  Configuração/Informação Wifi
2.  Estados
3.  Dosagem Manual
4.  Configuração e programação das cabeças
5.  Gestão de suplementos
6.  Fila de doses futuras

<img src="../img/rsdose/rsdose4_ex1.png"/>

## Configuração/Informação Wifi

<img src="../img/rsdose/zone_1.png"/>

---

<span >Clique no ícone <img src="../img/rsdose/cog_icon.png" width="30" /> para gerir a configuração geral do ReefDose.</span>

<img src="../img/rsdose/zone_1_dialog_config.png"/>

<span>Clique no ícone <img width="30px" src="../img/rsdose/wifi_icon.png"/> para gerir os parâmetros de rede.</span>

<img src="../img/rsdose/zone_1_dialog_wifi.png"/>

## Estados

 <img src="../img/rsdose/zone_2.png"/>

---

<span>O interruptor de manutenção <img width="30px" src="../img/rsdose/zone_2_maintenance.png"/> permite mudar para o modo de manutenção.</span>

 <img  src="../img/rsdose/maintenance_view.png"/>

<span>O interruptor on/off <img width="30px" src="../img/rsdose/zone_2_off.png"/> permite alternar entre os estados ligado e desligado do ReefDose.</span>

 <img  src="../img/rsdose/off_view.png"/>

## Dosagem Manual

<img src="../img/rsdose/zone_3.png"/>

---

<span>O botão <img src="../img/rsdose/zone_3_manula_config_button.png"/> mostra a dose manual predefinida para esta cabeça. Um clique abre a caixa de configuração desta dosagem.</span>

<img src="../img/rsdose/zone_3_dialog_manual_dose_without.png"/>

Pode adicionar atalhos usando o editor do cartão:

<img src="../img/rsdose/editor.png"/>

Por exemplo, a cabeça 1 propõe como atalhos os valores 2, 5 e 10 mL.

Estes valores aparecerão na parte superior da caixa de diálogo. Um clique nestes atalhos enviará um comando para dosar o valor definido.

<img src="../img/rsdose/zone_3_dialog_manual_dose.png"/>

<span>Premir o botão de dose manual: <img src="../img/rsdose/zone_3_manual_button.png"/> enviará um comando de dose com o valor predefinido visível mesmo acima: <img src="../img/rsdose/zone_3_manual_dose.png"/>, ou seja 10 mL neste exemplo.
</span>

## Configuração e programação das cabeças

 <img src="../img/rsdose/zone_4.png"/>

---

Esta zona permite visualizar a programação atual das cabeças e alterá-la.

- O anel circular colorido indica a percentagem de dose diária já distribuída.
- O número amarelo na parte superior indica o acumulado de dose manual diária.
- A parte central indica o volume distribuído em relação ao volume diário programado total.
- A parte azul inferior indica o número de doses distribuídas em relação ao total de doses do dia (exemplo: 14/24 para o azul porque é uma programação horária feita às 14h15). Os valores para o violeta e o verde indicam 0/0 porque essas doses devem ser distribuídas às 8h mas a integração foi iniciada depois das 8h, pelo que não haverá nenhuma dose hoje.
- Um clique longo numa das 4 cabeças ativará ou desativará a cabeça.
- Um clique numa cabeça abrirá a caixa de programação.
  A partir desta caixa pode iniciar um cebamento, recalibrar a cabeça, alterar a dose diária e a sua programação. Não se esqueça de guardar a programação antes de sair.

  <img src="../img/rsdose/zone_4_dialog_schedule.png"/>

### Regulação da dosagem

A configuração da cabeça contém a **Regulação da dosagem** da [integração redsea](https://github.com/Elwinmage/ha-reefbeat-component/blob/main/doc/pt/reefdose.pt.md#regulação-da-dosagem):

- **Dosagem assistida**: o botão **Dosagem assistida** abre uma janela com o gráfico dos resultados de teste, a introdução de um novo resultado, a dose proposta para aplicar ou ignorar, e as definições do cálculo. Nada chega ao doseador até a aplicar.

  <img src="../img/rsdose/assisted_dose_dialog.png" width="300"/> <img src="../img/rsdose/assisted_dose_settings.png" width="300"/>

  A janela mostra a dose em vigor (só leitura) logo acima da proposta. Um resultado é introduzido à mão ou lido na seringa de um kit: escolha o kit (Red Sea, Salifert, Colombo…) e introduza a leitura do reagente em mL, o resultado é calculado. O botão **Resultados dos testes** lista os resultados para adicionar um numa data passada, corrigi-lo ou eliminá-lo; o gráfico acompanha de imediato. Um suplemento que nenhum teste orienta (Red Sea NO3:PO4-X, alimentos) não oferece dosagem assistida e a sua potência fica a cinzento. Uma dose aplicada aparece no programa da cabeça ao voltar a ele.

- **Salmoura**: a cabeça é controlada apenas pelo Home Assistant, com doses manuais, por isso a sua configuração mostra a salmoura em vez do programa: salinidade da última semana, estado e alarme, salmoura prevista, controlo com refratómetro e definições. Na vista principal, o anel e a etiqueta central mostram a salmoura dosada hoje face à prevista, e a etiqueta inferior a salinidade.

  <img src="../img/rsdose/brine_head.png" width="300"/> <img src="../img/rsdose/brine_status.png" width="300"/> <img src="../img/rsdose/brine_settings.png" width="300"/>

### Histórico das doses

Enquanto o doseador está em [modo Poseidon](https://github.com/Elwinmage/ha-reefbeat-component/blob/main/doc/pt/poseidon.pt.md#modo-poseidon), a configuração de uma cabeça tem um botão **Histórico das doses**: as doses da cabeça, da mais recente para a mais antiga, por dia, com início, fim, duração, volume e tipo (programada, manual, compensação). Últimas 24 h, 7 ou 31 dias, ou tudo o que está guardado, com o volume total do período. Um início marcado com «≈» é estimado a partir do caudal da cabeça.

## Gestão de suplementos

 <img src="../img/rsdose/zone_5.png"/>

---

Esta zona permite gerir os suplementos.
Se já houver um suplemento declarado, um clique sobre ele abrirá a caixa de configuração onde poderá:

- Eliminar o suplemento (ícone lixo no canto superior direito)
- Indicar o volume total do contentor
- Indicar o volume real do suplemento
- Decidir se pretende acompanhar o volume restante. Um clique nos atalhos da parte superior ativará o controlo e definirá os valores predefinidos com um contentor cheio.
- Modificar o nome de exibição do suplemento.

 <img src="../img/rsdose/zone_5_dialog_container.png"/>

Se não houver nenhum suplemento ligado a uma cabeça, pode adicionar um clicando no contentor com um '+' (cabeça 4 no nosso exemplo).

<img src="../img/rsdose/zone_5_add_container.png"/>

De seguida, siga as instruções:

<img src="../img/rsdose/zone_5_dialog_add.png"/>

### Suplementos

Aqui está a lista de imagens suportadas para suplementos, agrupadas por marca. Se o seu apresenta um ❌, pode solicitar a sua adição [aqui](https://github.com/Elwinmage/reeftech-catalog/issues/new?labels=supplement).

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

[← Voltar à página principal](README.pt.md)
