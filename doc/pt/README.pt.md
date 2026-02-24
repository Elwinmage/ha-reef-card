<!-- [![hacs_badge](https://img.shields.io/badge/HACS-Default-41BDF5.svg?style=flat-square)](https://github.com/hacs/default) -->

[![GH-release](https://img.shields.io/github/v/release/Elwinmage/ha-reef-card.svg?style=flat-square)](https://github.com/Elwinmage/ha-reef-card/releases)
[![GH-last-commit](https://img.shields.io/github/last-commit/Elwinmage/ha-reef-card.svg?style=flat-square)](https://github.com/Elwinmage/ha-reef-card/commits/main)

[![GitHub Clones](https://img.shields.io/badge/dynamic/json?color=success&label=Clone&query=count&url=https://gist.githubusercontent.com/Elwinmage/dd3b205383103c2e65a7f516003ecbf6/raw/clone.json&logo=github)](https://github.com/MShawon/github-clone-count-badge)
[![GH-code-size](https://img.shields.io/github/languages/code-size/Elwinmage/ha-reef-card.svg?color=red&style=flat-square)](https://github.com/Elwinmage/ha-reef-card)
[![BuyMeCoffee][buymecoffeebadge]][buymecoffee]

> [!NOTE]
> Toda ajuda é bem-vinda, não hesite em [contactar-me](https://github.com/Elwinmage/ha-reef-card/discussions/1).

# Idiomas suportados : [<img src="https://flagicons.lipis.dev/flags/4x3/fr.svg" style="width: 5%;"/>](../fr/README.fr.md) [<img src="https://flagicons.lipis.dev/flags/4x3/gb.svg" style="width: 5%"/>](../../README.md) [<img src="https://flagicons.lipis.dev/flags/4x3/es.svg" style="width: 5%"/>](../es/README.es.md) [<img src="https://flagicons.lipis.dev/flags/4x3/pt.svg" style="width: 5%"/>](README.pt.md) [<img src="https://flagicons.lipis.dev/flags/4x3/de.svg" style="width: 5%"/>](../de/README.de.md) [<img src="https://flagicons.lipis.dev/flags/4x3/it.svg" style="width: 5%"/>](../it/README.it.md) [<img src="https://flagicons.lipis.dev/flags/4x3/pl.svg" style="width: 5%"/>](../pl/README.pl.md)

<!-- Vous souhaitez aider à la traduction, suivez ce [guide](https://github.com/Elwinmage/ha-reef-card/blob/main/doc/TRANSLATION.md). -->

O seu idioma ainda não está disponível e deseja ajudar com a tradução? Siga este [guia](https://github.com/Elwinmage/ha-reef-card/blob/main/doc/TRANSLATION.md).

# Apresentação

O **Reef card** para Home Assistant ajuda-o a gerir o seu aquário de recife.

Combinado com [ha-reefbeat-component](https://github.com/Elwinmage/ha-reefbeat-component), suporta automaticamente os seus dispositivos Redsea (ReefBeat).

> [!NOTE]
> Se tiver dispositivos que não sejam da Redsea e desejar que sejam suportados, pode solicitá-lo [aqui](https://github.com/Elwinmage/ha-reef-card/discussions/2).

> [!TIP]
> A lista de funcionalidades futuras está disponível [aqui](https://github.com/Elwinmage/ha-reef-card/issues?q=is%3Aissue%20state%3Aopen%20label%3Aenhancement)<br />
> A lista de erros está disponível [aqui](https://github.com/Elwinmage/ha-reef-card/issues?q=is%3Aissue%20state%3Aopen%20label%3Abug)

# Compatibilidade

✅ Implementado ☑️ Em curso ❌ Planeado

<table>
  <th>
    <td ><b>Modelo</b></td>
    <td colspan="2"><b>Estado</b></td>
    <td><b>Issues</b>  <br/>📆(Planeado) <br/> 🐛(Bugs)</td>
  </th>
  <tr>
    <td><a href="#reefato">ReefATO+</a></td>
    <td>RSATO+</td><td>❌</td>
    <td width="200px"><img src="https://raw.githubusercontent.com/Elwinmage/ha-reefbeat-component/main/doc/img/RSATO+.png"/></td>
    <td>
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rsato,all label:enhancement" style="text-decoration:none">📆</a>
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rsato,all label:bug" style="text-decoration:none">🐛</a>
    </td>
  </tr>

  </tr>
    <tr>
    <td><a href="#reefcontrol">ReefControl</a></td>
    <td>RSSENSE<br /> Se tiver um, pode contactar-me <a href="https://github.com/Elwinmage/ha-reefbeat-component/discussions/8">aqui</a> e adicionarei o seu suporte.</td><td>❌</td>
    <td width="200px"><img src="https://raw.githubusercontent.com/Elwinmage/ha-reefbeat-component/main/doc/img/RSCONTROL.png"/></td>
    <td>
      <a href="https://github.com/Elwinmage/ha-reefbeat-component/issues?q=is:issue state:open label:rscontrol,all label:enhancement" style="text-decoration:none">📆</a>
      <a href="https://github.com/Elwinmage/ha-reefbeat-component/issues?q=is:issue state:open label:rscontrol,all label:bug" style="text-decoration:none">🐛</a>
    </td>
      </tr>  
  <tr>
    <td rowspan="2"><a href="#reefdose">ReefDose</a></td>
    <td>RSDOSE2</td>
    <td>✅</td>
    <td width="200px"><img src="https://raw.githubusercontent.com/Elwinmage/ha-reefbeat-component/main/doc/img/RSDOSE2.png"/></td>
      <td rowspan="2">
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rsdose,all label:enhancement" style="text-decoration:none">📆</a>
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rsdose,all label:bug" style="text-decoration:none">🐛</a>
    </td>
  </tr>
  <tr>
    <td>RSDOSE4</td><td>✅</td>
    <td width="200px"><img src="https://raw.githubusercontent.com/Elwinmage/ha-reefbeat-component/main/doc/img/RSDOSE4.png"/></td>
    </tr>
  <tr>
    <td rowspan="2"> <a href="#reefled">ReefLed</a></td>
    <td>G1</td>
    <td>❌</td>
    <td width="200px"><img src="https://raw.githubusercontent.com/Elwinmage/ha-reefbeat-component/main/doc/img/rsled_g1.png"/></td>
<td rowspan="2">   
    <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rsled,all label:enhancement" style="text-decoration:none">📆</a>
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rsled,all label:bug" style="text-decoration:none">🐛</a>
</td>
  </tr>
   <td >G2</td>
    <td>❌</td>
    <td width="200px"><img src="https://raw.githubusercontent.com/Elwinmage/ha-reefbeat-component/main/doc/img/rsled_g2.png"/></td>
  </tr>
  <tr>
    <td rowspan="3"><a href="#reefmat">ReefMat</a></td>
    <td>RSMAT250</td>
    <td>☑️</td>
    <td rowspan="3" width="200px"><img src="https://raw.githubusercontent.com/Elwinmage/ha-reefbeat-component/main/doc/img/RSMAT.png"/></td>
    <td rowspan="3">
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rsmat,all label:enhancement" style="text-decoration:none">📆</a>
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rsmat,all label:bug" style="text-decoration:none">🐛</a>
    </td>
  </tr>
  <tr>
    <td>RSMAT500</td>
    <td>☑️</td>
  </tr>
  <tr>
    <td>RSMAT1200</td>
    <td>☑️</td>
  </tr>
  <tr>
    <td><a href="#reefrun">ReefRun</a></td>
    <td>RSRUN</td><td>❌</td>
    <td width="200px"><img src="https://raw.githubusercontent.com/Elwinmage/ha-reefbeat-component/main/doc/img/RSRUN.png"/></td>
    <td>
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rsrun,all label:enhancement" style="text-decoration:none">📆</a>
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rsrun,all label:bug" style="text-decoration:none">🐛</a>
    </td>
  </tr>
  <tr>
    <td><a href="#reefwave">ReefWave</a></td>
    <td>RSWAVE</td><td>❌</td>
    <td width="200px"><img src="https://raw.githubusercontent.com/Elwinmage/ha-reefbeat-component/main/doc/img/RSWAVE.png"/></td>
    <td>
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rswave,all label:enhancement" style="text-decoration:none">📆</a>
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rswave,all label:bug" style="text-decoration:none">🐛</a>
    </td>
  </tr>
</table>

# Índice

- [Instalação](https://github.com/Elwinmage/ha-reef-card/#installation)
- [Configuração](https://github.com/Elwinmage/ha-reef-card/#configuration)
- [ReefATO+](https://github.com/Elwinmage/ha-reef-card/#reefato)
- [ReefControl](https://github.com/Elwinmage/ha-reef-card/#reefcontrol)
- [ReefDose](https://github.com/Elwinmage/ha-reef-card/#reefdose)
- [ReefLED](https://github.com/Elwinmage/ha-reef-card/#reefled)
- [ReefMat](https://github.com/Elwinmage/ha-reef-card/#reefmat)
- [ReefRun](https://github.com/Elwinmage/ha-reef-card/#reefrun)
- [ReefWave](https://github.com/Elwinmage/ha-reef-card/#reefwave)
- [FAQ](https://github.com/Elwinmage/ha-reef-card/#faq)

# Instalação

## Instalação direta

Clique aqui para aceder diretamente ao repositório no HACS e clique em "Descarregar":  [![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=Elwinmage&repository=ha-reef-card&category=plugin)

## Pesquisar no HACS
Ou pesquise «reef-card» no HACS.

<p align="center">
<img src="../img/hacs_search.png" alt="Image">
</p>

# Configuração

Sem o parâmetro `device`, o cartão deteta automaticamente todos os dispositivos ReefBeat e permite-lhe escolher o que deseja.

Para remover a seleção de dispositivo e forçar um específico, defina o parâmetro `device` com o nome do seu dispositivo.

<table>
  <tr>
<td><img src="../img/card_rsdose4_config_2.png"/></td>
<td><img src="../img/card_rsdose4_config.png"/></td>
    </tr>
</table>

# ReefATO

Planeado.
  
Deseja que seja suportado mais rapidamente? Vote [aqui](https://github.com/Elwinmage/ha-reef-card/discussions/22).

# ReefControl

Planeado.

Deseja que seja suportado mais rapidamente? Vote [aqui](https://github.com/Elwinmage/ha-reef-card/discussions/22).

# ReefDose

ReefDose com ha-reef-card em ação:

[![Ver o vídeo](https://img.youtube.com/vi/Qee5LH0T9wQ/0.jpg)](https://www.youtube.com/watch?v=Qee5LH0T9wQ)


O cartão ReefDose está dividido em 6 zonas:

 1. Configuração/Informação Wifi
 2. Estados
 3. Dosagem Manual
 4. Configuração e programação das cabeças
 5. Gestão de suplementos
 6. Fila de doses futuras

<img src="../img/rsdose/rsdose4_ex1.png"/>

## Configuração/Informação Wifi
<img src="../img/rsdose/zone_1.png"/>

***

<span >Clique no ícone <img src="../img/rsdose/cog_icon.png" width="30" /> para gerir a configuração geral do ReefDose.</span>

<img src="../img/rsdose/zone_1_dialog_config.png"/> 

<span>Clique no ícone <img width="30px" src="../img/rsdose/wifi_icon.png"/>  para gerir os parâmetros de rede.</span>

<img src="../img/rsdose/zone_1_dialog_wifi.png"/> 

## Estados

 <img src="../img/rsdose/zone_2.png"/>

***
<span>O interruptor de manutenção  <img width="30px" src="../img/rsdose/zone_2_maintenance.png"/> permite mudar para o modo de manutenção.</span>

 <img  src="../img/rsdose/maintenance_view.png"/>

<span>O interruptor on/off  <img width="30px" src="../img/rsdose/zone_2_off.png"/> permite alternar entre os estados ligado e desligado do ReefDose.</span>

 <img  src="../img/rsdose/off_view.png"/>


## Dosagem Manual

<img src="../img/rsdose/zone_3.png"/>

***
<span>O botão <img src="../img/rsdose/zone_3_manula_config_button.png"/>  mostra a dose manual predefinida para esta cabeça. Um clique abre a caixa de configuração desta dosagem.</span>

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

***
Esta zona permite visualizar a programação atual das cabeças e alterá-la.
- O anel circular colorido indica a percentagem de dose diária já distribuída.
- O número amarelo na parte superior indica o acumulado de dose manual diária.
- A parte central indica o volume distribuído em relação ao volume diário programado total.
- A parte azul inferior indica o número de doses distribuídas em relação ao total de doses do dia (exemplo: 14/24 para o azul porque é uma programação horária feita às 14h15). Os valores para o violeta e o verde indicam 0/0 porque essas doses devem ser distribuídas às 8h mas a integração foi iniciada depois das 8h, pelo que não haverá nenhuma dose hoje.
- Um clique longo numa das 4 cabeças ativará ou desativará a cabeça.
- Um clique numa cabeça abrirá a caixa de programação.
  A partir desta caixa pode iniciar um cebamento, recalibrar a cabeça, alterar a dose diária e a sua programação. Não se esqueça de guardar a programação antes de sair.
  
  <img src="../img/rsdose/zone_4_dialog_schedule.png"/>
   

## Gestão de suplementos

 <img src="../img/rsdose/zone_5.png"/>

***
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

Eis a lista de imagens de suplementos suportados, agrupados por marca. Se o seu mostrar um ❌, pode solicitar a sua adição [aqui](https://github.com/Elwinmage/ha-reef-card/discussions/25).

<details>
<summary><b>ATI &nbsp; <sup>0/2 🖼️</sup></b></summary>

<table>
<tr><td>❌</td><td colspan='2'>Essential Pro 1</td></tr>
<tr><td>❌</td><td colspan='2'>Essential Pro 2</td></tr>
</table>
</details>

<details>
<summary><b>Aqua Forest &nbsp; <sup>0/9 🖼️</sup></b></summary>

<table>
<tr><td>❌</td><td colspan='2'>Ca Plus</td></tr>
<tr><td>❌</td><td colspan='2'>Calcium </td></tr>
<tr><td>❌</td><td colspan='2'>Component 1+</td></tr>
<tr><td>❌</td><td colspan='2'>Component 2+</td></tr>
<tr><td>❌</td><td colspan='2'>Component 3+</td></tr>
<tr><td>❌</td><td colspan='2'>KH Buffer</td></tr>
<tr><td>❌</td><td colspan='2'>KH Plus</td></tr>
<tr><td>❌</td><td colspan='2'>Magnesium</td></tr>
<tr><td>❌</td><td colspan='2'>Mg Plus</td></tr>
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
<summary><b>Quantum &nbsp; <sup>0/7 🖼️</sup></b></summary>

<table>
<tr><td>❌</td><td colspan='2'>Aragonite A</td></tr>
<tr><td>❌</td><td colspan='2'>Aragonite B</td></tr>
<tr><td>❌</td><td colspan='2'>Aragonite C</td></tr>
<tr><td>❌</td><td colspan='2'>Bio Kalium</td></tr>
<tr><td>❌</td><td colspan='2'>Bio Metals</td></tr>
<tr><td>❌</td><td colspan='2'>Bio enhance</td></tr>
<tr><td>❌</td><td colspan='2'>Gbio Gen</td></tr>
</table>
</details>

<details>
<summary><b>Red Sea &nbsp; <sup>0/13 🖼️</sup></b></summary>

<table>
<tr><td>❌</td><td colspan='2'>Bio Active (Colors D)</td></tr>
<tr><td>❌</td><td colspan='2'>Calcium (Foundation A)</td></tr>
<tr><td>❌</td><td colspan='2'>Calcium (Powder)</td></tr>
<tr><td>❌</td><td colspan='2'>Iodine (Colors A)</td></tr>
<tr><td>❌</td><td colspan='2'>Iron (Colors C)</td></tr>
<tr><td>❌</td><td colspan='2'>KH/Alkalinity (Foundation B)</td></tr>
<tr><td>❌</td><td colspan='2'>KH/Alkalinity (Powder)</td></tr>
<tr><td>❌</td><td colspan='2'>Magnesium (Foundation C)</td></tr>
<tr><td>❌</td><td colspan='2'>Magnesium (Powder)</td></tr>
<tr><td>❌</td><td colspan='2'>NO3PO4-X</td></tr>
<tr><td>❌</td><td colspan='2'>Potassium (Colors B)</td></tr>
<tr><td>❌</td><td colspan='2'>Reef Energy Plus</td></tr>
<tr><td>❌</td><td colspan='2'>ReefCare Program</td></tr>
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
<summary><b>Tropic Marin &nbsp; <sup>0/14 🖼️</sup></b></summary>

<table>
<tr><td>❌</td><td colspan='2'>A Element</td></tr>
<tr><td>❌</td><td colspan='2'>All-For-Reef</td></tr>
<tr><td>❌</td><td colspan='2'>Amino Organic</td></tr>
<tr><td>❌</td><td colspan='2'>Balling A</td></tr>
<tr><td>❌</td><td colspan='2'>Balling B</td></tr>
<tr><td>❌</td><td colspan='2'>Balling C</td></tr>
<tr><td>❌</td><td colspan='2'>Bio-Magnesium</td></tr>
<tr><td>❌</td><td colspan='2'>Carbo Calcium</td></tr>
<tr><td>❌</td><td colspan='2'>Elimi-NP</td></tr>
<tr><td>❌</td><td colspan='2'>K Element</td></tr>
<tr><td>❌</td><td colspan='2'>Liquid Buffer</td></tr>
<tr><td>❌</td><td colspan='2'>NP-Bacto-Balance</td></tr>
<tr><td>❌</td><td colspan='2'>Plus-NP</td></tr>
<tr><td>❌</td><td colspan='2'>Potassium</td></tr>
</table>
</details>

## Fila de doses futuras

<img src="../img/rsdose/zone_6.png"/>

***
Esta zona mostra simplesmente a lista de doses futuras do seu equipamento, sejam automáticas ou manuais (horário deslocado pela espera definida entre dois suplementos diferentes).

# ReefLed

Planeado.

Deseja que seja suportado mais rapidamente? Vote [aqui](https://github.com/Elwinmage/ha-reef-card/discussions/22).

# ReefMat

Planeado.

Deseja que seja suportado mais rapidamente? Vote [aqui](https://github.com/Elwinmage/ha-reef-card/discussions/22).

# ReefRun

Planeado.

Deseja que seja suportado mais rapidamente? Vote [aqui](https://github.com/Elwinmage/ha-reef-card/discussions/22).

# ReefWave

Planeado.

Deseja que seja suportado mais rapidamente? Vote [aqui](https://github.com/Elwinmage/ha-reef-card/discussions/22).

# FAQ

---

[buymecoffee]: https://paypal.me/Elwinmage
[buymecoffeebadge]: https://img.shields.io/badge/buy%20me%20a%20coffee-donate-yellow.svg?style=flat-square
