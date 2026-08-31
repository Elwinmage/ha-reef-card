# ha-reef-card 🌊 para HomeAssistant

> Parte do **[Ecossistema ReefTech Project](https://elwinmage.github.io/reeftank/pt.html)**

<p align="center">
  <img src="../../icon.png" width="50%"/>
</p>

[![GH-release](https://img.shields.io/github/v/release/Elwinmage/ha-reef-card.svg?style=flat-square)](https://github.com/Elwinmage/ha-reef-card/releases)
[![GH-last-commit](https://img.shields.io/github/last-commit/Elwinmage/ha-reef-card.svg?style=flat-square)](https://github.com/Elwinmage/ha-reef-card/commits/main)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

<!-- [![hacs_badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg?style=flat-square)](https://github.com/hacs/integration) -->

[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Lit](https://img.shields.io/badge/Lit-3.3-blue?style=flat-square&logo=lit)](https://lit.dev/)
[![codecov](https://codecov.io/gh/Elwinmage/ha-reef-card/branch/main/graph/badge.svg?token=XXXX)](https://codecov.io/gh/Elwinmage/ha-reef-card)
[![BuyMeCoffee][buymecoffeebadge]][buymecoffee]

# Idiomas suportados : [<img src="https://flagicons.lipis.dev/flags/4x3/fr.svg" style="width: 5%;"/>](../fr/README.fr.md) [<img src="https://flagicons.lipis.dev/flags/4x3/gb.svg" style="width: 5%"/>](../../README.md) [<img src="https://flagicons.lipis.dev/flags/4x3/es.svg" style="width: 5%"/>](../es/README.es.md) [<img src="https://flagicons.lipis.dev/flags/4x3/pt.svg" style="width: 5%"/>](README.pt.md) [<img src="https://flagicons.lipis.dev/flags/4x3/de.svg" style="width: 5%"/>](../de/README.de.md) [<img src="https://flagicons.lipis.dev/flags/4x3/it.svg" style="width: 5%"/>](../it/README.it.md) [<img src="https://flagicons.lipis.dev/flags/4x3/pl.svg" style="width: 5%"/>](../pl/README.pl.md)

<!-- Vous souhaitez aider à la traduction, suivez ce [guide](https://github.com/Elwinmage/ha-reef-card/blob/main/doc/TRANSLATION.md). -->

O seu idioma ainda não está disponível e deseja ajudar com a tradução? Siga este [guia](https://github.com/Elwinmage/ha-reef-card/blob/main/doc/TRANSLATION.md).

# Apresentação

O **Reef card** para Home Assistant ajuda-o a gerir o seu aquário de recife.

Combinado com [ha-reefbeat-component](https://github.com/Elwinmage/ha-reefbeat-component), suporta automaticamente os seus
dispositivos Redsea (ReefBeat).

<!-- ecosystem:start -->

## Projetos relacionados

Os projetos ReefTech encaixam-se entre si: as integrações trazem o seu equipamento para o Home Assistant, o cartão mostra-o e comanda-o, e o backup mantém-no a funcionar durante um corte. Cada um funciona também sozinho.

<table>
  <tr>
    <th width="100px"></th>
    <th>Projeto</th>
    <th>Função</th>
    <th>Funciona com</th>
  </tr>
  <tr>
    <td><img src="https://raw.githubusercontent.com/Elwinmage/ha-reefbeat-component/main/icon.png" width="64" alt="ha-reefbeat-component" /></td>
    <td><a href="https://github.com/Elwinmage/ha-reefbeat-component"><b>ha-reefbeat-component</b></a></td>
    <td>Aparelhos Red Sea ReefBeat, comandados localmente sem cloud: ReefATO+, ReefControl, ReefControl-Power, ReefDose, ReefLed, ReefMat, ReefRun e ReefWave.<br />blueprint de alertas para modos anómalos, calibrações e bateria fraca. <a href="https://my.home-assistant.io/redirect/blueprint_import/?blueprint_url=https://raw.githubusercontent.com/Elwinmage/ha-reefbeat-component/refs/heads/main/blueprints/automation/redsea_alerts.en.yaml"><img src="https://my.home-assistant.io/badges/blueprint_import.svg" alt="Open your Home Assistant instance and show the blueprint import dialog with a specific blueprint pre-filled." /></a></td>
    <td>ha-reef-card</td>
  </tr>
  <tr>
    <td><img src="https://raw.githubusercontent.com/Elwinmage/ha-aquamedic-component/main/icon.png" width="64" alt="ha-aquamedic-component" /></td>
    <td><a href="https://github.com/Elwinmage/ha-aquamedic-component"><b>ha-aquamedic-component</b></a></td>
    <td>Bombas Aqua Medic através da API cloud Gizwits: bombas de circulação EcoDrift e SmartDrift, bombas DC Runner de retorno e do escumador.</td>
    <td>ha-reef-card</td>
  </tr>
  <tr>
    <td><img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-maintenance-component/main/icon.png" width="64" alt="ha-reef-maintenance-component" /></td>
    <td><a href="https://github.com/Elwinmage/ha-reef-maintenance-component"><b>ha-reef-maintenance-component</b></a></td>
    <td>Acompanhamento da limpeza e do desgaste do equipamento que o Home Assistant não consegue interrogar: bombas de circulação, bombas de retorno, escumadores, reatores, tudo o que trata à mão.</td>
    <td>ha-reef-card</td>
  </tr>
  <tr>
    <td><img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/icon.png" width="64" alt="ha-reef-card" /></td>
    <td><b>ha-reef-card</b><br /><i>(este repositório)</i></td>
    <td>Vista gráfica interativa de cada aparelho no seu painel, e a única forma de editar os programas avançados. Lê as três integrações através do contrato <code>reef_role</code> comum, sem configuração do lado do cartão.</td>
    <td>as três integrações</td>
  </tr>
  <tr>
    <td><img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-blueprints/main/icon.png" width="64" alt="ha-reef-blueprints" /></td>
    <td><a href="https://github.com/Elwinmage/ha-reef-blueprints"><b>ha-reef-blueprints</b></a></td>
    <td>Blueprints de notificação comuns a todo o ecossistema: manutenções em atraso encontradas pelo contrato <code>reef_role</code>, e aparelhos que ficaram inacessíveis. Oito idiomas.</td>
    <td>as três integrações</td>
  </tr>
  <tr>
    <td><img src="https://raw.githubusercontent.com/Elwinmage/reefbeatEnergyBackup/main/icon.png" width="64" alt="reefbeatEnergyBackup" /></td>
    <td><a href="https://github.com/Elwinmage/reefbeatEnergyBackup"><b>reefbeatEnergyBackup</b></a></td>
    <td>Backup por bateria em caso de corte. Um pack 24V LiFePO₄ comandado por um Raspberry Pi, com degradação progressiva da velocidade das bombas conforme o estado de carga.</td>
    <td>sozinho, ou a par do ha-reefbeat-component</td>
  </tr>
</table>

Estão todos documentados em conjunto na [página do projeto ReefTech](https://elwinmage.github.io/reeftank/).

<!-- ecosystem:end -->

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
    <td>RSATO+</td><td>☑️</td>
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
    <td>✅</td>
    <td rowspan="3" width="200px"><img src="https://raw.githubusercontent.com/Elwinmage/ha-reefbeat-component/main/doc/img/RSMAT.png"/></td>
    <td rowspan="3">
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rsmat,all label:enhancement" style="text-decoration:none">📆</a>
      <a href="https://github.com/Elwinmage/ha-reef-card/issues?q=is:issue state:open label:rsmat,all label:bug" style="text-decoration:none">🐛</a>
    </td>
  </tr>
  <tr>
    <td>RSMAT500</td>
    <td>✅</td>
  </tr>
  <tr>
    <td>RSMAT1200</td>
    <td>✅</td>
  </tr>
  <tr>
    <td><a href="#reefrun">ReefRun</a></td>
    <td>RSRUN</td><td>✅</td>
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
- [Manutenção](https://github.com/Elwinmage/ha-reef-card/#maintenance)
- [FAQ](https://github.com/Elwinmage/ha-reef-card/#faq)

# Instalação

## Instalação direta

Clique aqui para aceder diretamente ao repositório no HACS e clique em "Descarregar": [![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=Elwinmage&repository=ha-reef-card&category=plugin)

## Pesquisar no HACS

Ou pesquise «reef-card» no HACS.

<p align="center">
<img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/hacs_search.png" alt="Image">
</p>

# Configuração

Sem o parâmetro `device`, o cartão deteta automaticamente todos os dispositivos ReefBeat e permite-lhe escolher o que deseja.

Para remover a seleção de dispositivo e forçar um específico, defina o parâmetro `device` com o nome do seu dispositivo.

<table>
  <tr>
<td><img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/card_rsdose4_config_2.png"/></td>
<td><img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/card_rsdose4_config.png"/></td>
    </tr>
</table>

# ReefATO

ReefATO+ com o ha-reef-card em ação:

<!-- TODO: replace RSATO_VIDEO_ID by the youtube id of the ReefATO+ video -->

[![Ver o vídeo](https://img.youtube.com/vi/RSATO_VIDEO_ID/0.jpg)](https://www.youtube.com/watch?v=RSATO_VIDEO_ID)

O cartão ReefATO+ desenha todo o circuito de reposição tal como está montado: o
controlador e as suas três tomadas, o reservatório de água osmotizada com a sua
bomba, a sonda de nível presa ao vidro e a sonda de fugas pousada no chão.

A sonda de nível é o próprio ReefATO+ e é sempre desenhada. A **bomba** e a
**sonda de fugas** são opcionais, e cada uma é uma camada transparente colocada
sobre a imagem de fundo, não uma parte dela. Aquela que o dispositivo não reporta
não é desenhada de todo, e os controlos que dependem dela desaparecem com ela: um
ReefATO+ sem sonda de fugas mostra um cartão sem sonda de fugas, não uma sonda
esbatida.

<img src="../img/rsato/rsato_zones.png"/>

O cartão está dividido em 7 zonas:

1. Controlador: modo de funcionamento, ligação, modo de manutenção, configuração, Wifi e reposição automática
2. Definições dos acessórios: bomba de reposição, sonda de fugas, sonda de nível
3. Reservatório de água osmotizada: comandos de enchimento, volume restante e autonomia
4. Besouro
5. Sonda de fugas
6. Aquário: nível de água, temperatura e consumo diário
7. Última mensagem e último alerta

## Controlador

<img src="../img/rsato/zone_1.png"/>

---

O texto na face do controlador é o **modo de funcionamento** reportado pelo
dispositivo (Auto, Manual, Fuga…), traduzido para o idioma do Home Assistant.

<span>O interruptor <img src="../img/mdi/mdi_power-plug.png" width="20"/> liga ou desliga o ReefATO+.</span>

<img src="../img/rsato/off_mode.png" width="50%"/>

<span>O interruptor <img src="../img/mdi/mdi_account-wrench.png" width="20"/> passa para o modo de manutenção.</span>

<img src="../img/rsato/maintenance.png" width="50%"/>

<span>Clique no ícone <img src="../img/rsdose/cog_icon.png" width="30"/> para gerir a configuração geral do ReefATO+: atualizar as definições ou os dados consultados, reiniciar o dispositivo, atualizar o seu firmware.</span>

<img src="../img/rsato/zone_1_dialog_config.png" width="50%"/>

<span>Clique no ícone <img src="../img/mdi/wifi_icon.png" width="30"/> para gerir as definições de rede.</span>

<img src="../img/rsato/zone_1_dialog_wifi.png" width="50%"/>

<span>O interruptor <img src="../img/mdi/mdi_waves-arrow-up.png" width="20"/> da segunda linha ativa ou desativa a **reposição automática**. Desativado, o dispositivo nunca enche por si próprio e só os botões da zona 3 continuam a agir sobre a bomba. Fica oculto quando não há nenhuma bomba emparelhada.</span>

## Definições dos acessórios

<img src="../img/rsato/zone_2.png"/>

---

Os três ícones seguem as três tomadas do painel frontal, pela mesma ordem: da
esquerda para a direita a **bomba de reposição**, a **sonda de fugas** e a **sonda
de nível**. Cada um abre o que o dispositivo reporta sobre esse acessório, aquilo
que a imagem só pode sugerir. Os ícones da bomba e da sonda de fugas desaparecem
com o acessório quando a sua tomada não é usada.

<span>O ícone da bomba <img src="../img/mdi/mdi_pump.png" width="30"/> mostra o estado de funcionamento, o consumo e o caudal medidos, os três limiares de corrente com que o firmware decide se há funcionamento em seco ou bloqueio, e o que despoletou o último enchimento.</span>

<img src="../img/rsato/zone_2_dialog_pump.png" width="50%"/>

<span>O ícone da sonda de fugas <img src="../img/mdi/mdi_pipe-leak.png" width="30"/> mostra se a sonda está ligada, se está armada, o veredicto seco/molhado e a leitura em bruto que está por trás, além do besouro que esta sonda comanda.</span>

<img src="../img/rsato/zone_2_dialog_leak.png" width="50%"/>

<span>O ícone da sonda de nível <img src="../img/mdi/mdi_hydraulic-oil-level.png" width="30"/> mostra primeiro o estado da sonda — ligada, calibrada, a verificar, em erro — porque uma sonda descalibrada ou suja torna sem valor todas as leituras seguintes. Depois o nível em si, os dois elétrodos por trás dele, o sensor de temperatura que partilha o mesmo corpo, e a identidade e as datas de serviço do cartucho.</span>

<img src="../img/rsato/zone_2_dialog_ato_sensor.png" width="50%"/>

## Reservatório de água osmotizada

<img src="../img/rsato/zone_3.png"/>

---

Esta zona é o reservatório de onde a reposição tira água, e os três botões que
comandam a sua bomba à mão:

<table>
  <tr>
    <td align="center"><img src="../img/mdi/mdi_water-pump.png" width="40"/><br/><b>Encher</b><br/>Inicia um enchimento manual</td>
    <td align="center"><img src="../img/mdi/mdi_water-pump-off.png" width="40"/><br/><b>Parar</b><br/>Para o enchimento em curso</td>
    <td align="center"><img src="../img/mdi/mdi_play-circle-outline.png" width="40"/><br/><b>Retomar</b><br/>Devolve a bomba ao dispositivo</td>
  </tr>
</table>

A água no reservatório é uma verdadeira razão de volumes: o volume restante sobre
a capacidade do reservatório declarada na integração. O fundo da escala é o
resíduo que a bomba não consegue aspirar, por isso um reservatório vazio mostra
na mesma uma linha de água, e o topo da escala é o rebordo do recipiente na
imagem. Abaixo de 10 % a água pisca.

Clicar na água abre a caixa de diálogo do reservatório, onde a capacidade pode
ser corrigida:

<img src="../img/rsato/zone_3_dialog_ato_tank.png" width="50%"/>

O número em baixo à esquerda do reservatório é a **autonomia**: os dias que faltam
até ficar seco, calculados pela integração a partir do consumo diário médio.
Clicar nele abre a sua ficha de informação.

Durante um enchimento, a água corre da saída por cima da sump — a animação segue a
velocidade da bomba e para com ela, por isso uma imagem parada significa uma bomba
parada.

<img src="../img/rsato/zone_3_filling.png"/>

## Besouro

<img src="../img/mdi/mdi_bell-ring_red.png" width="40"/>

---

<span>A campainha <img src="../img/mdi/mdi_bell-ring_red.png" width="20"/> <img src="../img/mdi/mdi_bell-off_red.png" width="20"/> segue a definição do besouro do dispositivo, e fica esbatida quando está desligado.</span>

Um clique abre a caixa de diálogo do besouro: a definição em si, se está a tocar
neste momento, e o estado da sonda de fugas como contexto.

<img src="../img/rsato/zone_4_dialog_buzzer.png" width="50%"/>

Uma **pressão longa** comuta diretamente o besouro. Os dois gestos estão
separados de propósito: silenciar o alarme é uma definição de segurança, não algo
para fazer por engano enquanto se procura o detalhe.

> [!NOTE]
> O besouro não é apenas o alarme de fugas: o dispositivo também o faz tocar em
> falhas da bomba, pelo que continua disponível num ReefATO+ sem sonda de fugas.
> O ícone só fica oculto nas versões da integração que ainda não expõem a
> definição.

## Sonda de fugas

<img src="../img/rsato/zone_5.png"/>

---

A sonda só é desenhada quando está fisicamente ligada. Ligada mas desativada na
aplicação, aparece esbatida: está lá, não deteta nada.

Quando é detetada água, a sonda pisca e uma poça alastra ao pé da imagem. O
dispositivo diz de que lado veio a água, e é essa a metade da informação que vale
a pena mostrar — água doce da linha osmotizada não é o mesmo problema que água
salgada do aquário — por isso a poça é desenhada do lado correspondente: à
esquerda por baixo do reservatório, à direita por baixo do aquário. Uma fuga
reportada sem um lado legível alastra por toda a largura em vez de adivinhar um.

<table>
  <tr>
    <th align="center">Fuga no aquário</th>
    <th align="center">Fuga no reservatório osmotizado</th>
    <th align="center">Fuga de origem desconhecida</th>
  </tr>
  <tr>
    <td align="center"><img src="../img/rsato/zone_5_leak_aquarium.png"/></td>
    <td align="center"><img src="../img/rsato/zone_5_leak_rodi.png"/></td>
    <td align="center"><img src="../img/rsato/zone_5_leak_unknown.png"/></td>
  </tr>
</table>

## Aquário

<img src="../img/rsato/zone_6.png"/>

---

Aqui o nível de água não é uma percentagem: a sonda diz qual das suas marcas a
superfície atingiu, e cada estado é desenhado à altura dessa marca no vidro.

| Estado           | Significado                                                   |
| ---------------- | ------------------------------------------------------------- |
| Abaixo           | A superfície está abaixo da sonda: a reposição não dá conta   |
| Nível desejado 1 | Primeira marca de reposição                                   |
| Nível desejado 2 | Segunda marca de reposição                                    |
| Acima            | A superfície está acima da sonda: o aquário está cheio a mais |

Ambos os extremos são anómalos, por isso **Abaixo** e **Acima** fazem a água
piscar. Uma sonda em erro, ou uma entidade que ainda não reportou nada, não tem
altura nenhuma: o cartão desenha a sua marca de leitura ausente em vez de um
aquário vazio.

<table>
  <tr>
    <th align="center">Abaixo</th>
    <th align="center">Nível desejado 1</th>
    <th align="center">Nível desejado 2</th>
    <th align="center">Acima</th>
    <th align="center">Sem leitura</th>
  </tr>
  <tr>
    <td align="center"><img src="../img/rsato/zone_6_water_level_below.png"/></td>
    <td align="center"><img src="../img/rsato/zone_6_water_level_1.png"/></td>
    <td align="center"><img src="../img/rsato/zone_6_water_level_2.png"/></td>
    <td align="center"><img src="../img/rsato/zone_6_water_level_above.png"/></td>
    <td align="center"><img src="../img/rsato/zone_6_water_level_error.png"/></td>
  </tr>
</table>

A temperatura no fundo do aquário vem do sensor integrado na sonda de nível, e só
é reportada quando está ativado no dispositivo.

O gráfico ao canto é o **consumo do dia**: o volume reposto desde a meia-noite,
preenchido a laranja, contra a média diária móvel a vermelho. A janela está
fixada ao dia de calendário e não a 24 horas móveis, já que o contador é reposto
a zero à meia-noite.

Clicar no gráfico abre a caixa de diálogo de consumo, a mesma história com os
números por extenso: enchimentos e volume, medidos hoje, como média diária e como
total acumulado, mais o que resta ao reservatório para os alimentar.

<img src="../img/rsato/zone_6_dialog_usage.png" width="50%"/>

## Falhas

O cartão não tem um sinalizador de aviso à parte: o que está em falha é o que
pisca, sob um tom vermelho claro.

| Elemento que pisca | O que o dispositivo reporta                                                                                           |
| ------------------ | --------------------------------------------------------------------------------------------------------------------- |
| A bomba            | Avaria, bomba bloqueada, enchimento demasiado longo, reservatório vazio, ou sonda de nível em falta                   |
| A sonda de fugas   | Água detetada, do lado da osmose ou do lado do aquário                                                                |
| O nível de água    | A superfície está abaixo ou acima da sonda                                                                            |
| Toda a imagem      | A sonda de nível pede para ser verificada, ou já não consegue medir — todos os níveis mostrados deixam de ser fiáveis |

Uma bomba reportada como ausente não é uma falha: a bomba, os botões de
enchimento, o reservatório e o gráfico de consumo simplesmente não são
desenhados.

## Mensagens

<img src="../img/rsato/zone_7.png"/>

---

Esta zona mostra as últimas mensagens de sistema do ReefATO+. Tem duas linhas:

- A linha cinzenta mostra a **última mensagem** recebida.
- A linha rosa mostra o **último alerta**, precedido do símbolo ⚠.

Clicar no ícone <img src="../img/mdi/mdi_delete-empty.png" width="20"/> apaga a mensagem correspondente.

Estas linhas podem ser ocultadas a partir da interface do editor do cartão.

## Editor do cartão

<img src="../img/rsato/editor.png" width="50%"/>

---

Além das duas linhas de mensagens, o ReefATO+ tem três opções. Existem para um
circuito de reposição para o qual o dispositivo não foi concebido: um osmosador
ligado diretamente à sump, com uma válvula comandada pelo Home Assistant em vez
da bomba Red Sea.

### Reservatório osmotizado infinito

Desativada por omissão. Um osmosador que repõe água continuamente não tem
recipiente, por isso nada se pode esgotar — e tudo o que o cartão diz sobre o
reservatório fala de um bidão que não existe.

Ativada, a percentagem sobre o reservatório e a caixa de diálogo que está por trás
são retiradas, a autonomia passa a ∞, e o ícone das definições da bomba e o botão
de retomar ficam ocultos: uma alimentação contínua não tem ciclo de enchimento
para devolver ao dispositivo. A água, os botões de enchimento e o gráfico de
consumo mantêm-se.

### Entidade do volume doseado

Um interruptor e um seletor de entidade. Ativada, a curva laranja do gráfico
diário é lida a partir de uma entidade sua — um caudalímetro na linha osmotizada
— em vez do contador do dispositivo. A média móvel vermelha continua a ser a do
dispositivo: só muda a origem do volume, não a comparação contra a qual é
desenhado.

É o interruptor que a ativa, de modo que uma entidade que tenha sobrado de uma
configuração anterior é ignorada em vez de voltar a assumir o comando em
silêncio.

### Entidades de enchimento e de paragem

Qualquer um dos dois botões pode ser ligado a uma entidade de outra integração,
para comandar a sua própria válvula. O serviço é deduzido do domínio da entidade,
já que escolher uma diz logo de qual se trata:

| Domínio da entidade       | Encher       | Parar         |
| ------------------------- | ------------ | ------------- |
| `button`, `input_button`  | `press`      | `press`       |
| `switch`, `input_boolean` | `turn_on`    | `turn_off`    |
| `valve`                   | `open_valve` | `close_valve` |
| `script`                  | `turn_on`    | `turn_on`     |

Um único interruptor é um comando completo: ligado enche, desligado para. Deixe o
outro seletor vazio e o segundo botão reutiliza a mesma entidade com o serviço
oposto — o mesmo vale para um `input_boolean` ou uma `valve`. Dois botões de
impulso têm de ser escolhidos separadamente, porque uma pressão não traz direção.

Um comando ligado também deixa de seguir a bomba Red Sea: continua visível num
ReefATO+ que não reporta bomba nenhuma, que é justamente a razão para o ligar.

As opções são guardadas sob o modelo tal como o Home Assistant o reporta:

```yaml
type: custom:reef-card
device: MY-RSATO
conf:
  RSATO+:
    devices:
      MY-RSATO:
        infinite_tank: true
        external_usage: true
        external_usage_entity: sensor.rodi_flow_meter
        fill_entity: switch.rodi_valve
        stop_fill_entity: "" # deixado vazio: o interruptor acima também o para
```

# ReefControl

Planeado.

Deseja que seja suportado mais rapidamente? Vote [aqui](https://github.com/Elwinmage/ha-reef-card/discussions/22).

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

<img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/rsdose4_ex1.png"/>

## Configuração/Informação Wifi

<img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/zone_1.png"/>

---

<span >Clique no ícone <img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/cog_icon.png" width="30" /> para gerir a configuração geral do ReefDose.</span>

<img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/zone_1_dialog_config.png"/>

<span>Clique no ícone <img width="30px" src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/wifi_icon.png"/> para gerir os parâmetros de rede.</span>

<img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/zone_1_dialog_wifi.png"/>

## Estados

 <img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/zone_2.png"/>

---

<span>O interruptor de manutenção <img width="30px" src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/zone_2_maintenance.png"/> permite mudar para o modo de manutenção.</span>

 <img  src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/maintenance_view.png"/>

<span>O interruptor on/off <img width="30px" src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/zone_2_off.png"/> permite alternar entre os estados ligado e desligado do ReefDose.</span>

 <img  src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/off_view.png"/>

## Dosagem Manual

<img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/zone_3.png"/>

---

<span>O botão <img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/zone_3_manula_config_button.png"/> mostra a dose manual predefinida para esta cabeça. Um clique abre a caixa de configuração desta dosagem.</span>

<img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/zone_3_dialog_manual_dose_without.png"/>

Pode adicionar atalhos usando o editor do cartão:

<img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/editor.png"/>

Por exemplo, a cabeça 1 propõe como atalhos os valores 2, 5 e 10 mL.

Estes valores aparecerão na parte superior da caixa de diálogo. Um clique nestes atalhos enviará um comando para dosar o valor definido.

<img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/zone_3_dialog_manual_dose.png"/>

<span>Premir o botão de dose manual: <img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/zone_3_manual_button.png"/> enviará um comando de dose com o valor predefinido visível mesmo acima: <img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/zone_3_manual_dose.png"/>, ou seja 10 mL neste exemplo.
</span>

## Configuração e programação das cabeças

 <img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/zone_4.png"/>

---

Esta zona permite visualizar a programação atual das cabeças e alterá-la.

- O anel circular colorido indica a percentagem de dose diária já distribuída.
- O número amarelo na parte superior indica o acumulado de dose manual diária.
- A parte central indica o volume distribuído em relação ao volume diário programado total.
- A parte azul inferior indica o número de doses distribuídas em relação ao total de doses do dia (exemplo: 14/24 para o azul porque é uma programação horária feita às 14h15). Os valores para o violeta e o verde indicam 0/0 porque essas doses devem ser distribuídas às 8h mas a integração foi iniciada depois das 8h, pelo que não haverá nenhuma dose hoje.
- Um clique longo numa das 4 cabeças ativará ou desativará a cabeça.
- Um clique numa cabeça abrirá a caixa de programação.
  A partir desta caixa pode iniciar um cebamento, recalibrar a cabeça, alterar a dose diária e a sua programação. Não se esqueça de guardar a programação antes de sair.

  <img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/zone_4_dialog_schedule.png"/>

## Gestão de suplementos

 <img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/zone_5.png"/>

---

Esta zona permite gerir os suplementos.
Se já houver um suplemento declarado, um clique sobre ele abrirá a caixa de configuração onde poderá:

- Eliminar o suplemento (ícone lixo no canto superior direito)
- Indicar o volume total do contentor
- Indicar o volume real do suplemento
- Decidir se pretende acompanhar o volume restante. Um clique nos atalhos da parte superior ativará o controlo e definirá os valores predefinidos com um contentor cheio.
- Modificar o nome de exibição do suplemento.

 <img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/zone_5_dialog_container.png"/>

Se não houver nenhum suplemento ligado a uma cabeça, pode adicionar um clicando no contentor com um '+' (cabeça 4 no nosso exemplo).

<img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/zone_5_add_container.png"/>

De seguida, siga as instruções:

<img src="https://raw.githubusercontent.com/Elwinmage/ha-reef-card/main/doc/img/rsdose/zone_5_dialog_add.png"/>

### Suplementos

Aqui está a lista de imagens suportadas para suplementos, agrupadas por marca. Se o seu apresenta um ❌, pode solicitar a sua adição [aqui](https://github.com/Elwinmage/ha-reef-card/discussions/25).

<details>
<summary><b>ATI &nbsp; <sup>2/2 🖼️</sup></b></summary>

<table>
<tr><td>✅</td><td>Essential Pro 1</td><td><img style='width:20%;' src='../../public/img/supplements/69692902-dcf9-4f41-b104-402154dc348a.supplement.png'/></td></tr>
<tr><td>✅</td><td>Essential Pro 2</td><td><img style='width:20%;' src='../../public/img/supplements/e1dbec89-2396-4269-8f28-ab7534cb2d7d.supplement.png'/></td></tr>
</table>
</details>

<details>
<summary><b>Aqua Forest &nbsp; <sup>3/9 🖼️</sup></b></summary>

<table>
<tr><td>✅</td><td>Ca Plus</td><td><img style='width:20%;' src='../../public/img/supplements/9ea6c9f2-b6f3-41ee-9370-06457f286fe5.supplement.png'/></td></tr>
<tr><td>❌</td><td colspan='2'>Calcium </td></tr>
<tr><td>❌</td><td colspan='2'>Component 1+</td></tr>
<tr><td>❌</td><td colspan='2'>Component 2+</td></tr>
<tr><td>❌</td><td colspan='2'>Component 3+</td></tr>
<tr><td>❌</td><td colspan='2'>KH Buffer</td></tr>
<tr><td>✅</td><td>KH Plus</td><td><img style='width:20%;' src='../../public/img/supplements/e391e8d1-0d4c-4355-8887-9231500703ef.supplement.png'/></td></tr>
<tr><td>❌</td><td colspan='2'>Magnesium</td></tr>
<tr><td>✅</td><td>Mg Plus</td><td><img style='width:20%;' src='../../public/img/supplements/deb3a943-68a5-40a9-860b-e6d259eee947.supplement.png'/></td></tr>
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
<summary><b>Quantum &nbsp; <sup>7/7 🖼️</sup></b></summary>

<table>
<tr><td>✅</td><td>Aragonite A</td><td><img style='width:20%;' src='../../public/img/supplements/322c1c47-7259-4fd9-9050-f6157036ea36.supplement.png'/></td></tr>
<tr><td>✅</td><td>Aragonite B</td><td><img style='width:20%;' src='../../public/img/supplements/e6537278-0e0a-4fd7-8146-566334bb74ed.supplement.png'/></td></tr>
<tr><td>✅</td><td>Aragonite C</td><td><img style='width:20%;' src='../../public/img/supplements/5f491b59-4f54-4572-bbce-aa9b708ccb51.supplement.png'/></td></tr>
<tr><td>✅</td><td>Bio Kalium</td><td><img style='width:20%;' src='../../public/img/supplements/8fec18b0-adf6-4dfa-b923-c7226a6fb87d.supplement.png'/></td></tr>
<tr><td>✅</td><td>Bio Metals</td><td><img style='width:20%;' src='../../public/img/supplements/a1d797e3-4679-4be4-9219-22e35822ab97.supplement.png'/></td></tr>
<tr><td>✅</td><td>Bio enhance</td><td><img style='width:20%;' src='../../public/img/supplements/fd8dee42-f3da-4660-b491-880d7dac869a.supplement.png'/></td></tr>
<tr><td>✅</td><td>Gbio Gen</td><td><img style='width:20%;' src='../../public/img/supplements/26a4f030-e78c-459c-90cb-5c6099de10fd.supplement.png'/></td></tr>
</table>
</details>

<details>
<summary><b>Red Sea &nbsp; <sup>10/13 🖼️</sup></b></summary>

<table>
<tr><td>✅</td><td>Bio Active (Colors D)</td><td><img style='width:20%;' src='../../public/img/supplements/7af9b16b-9e63-488e-8c86-261ef8c4a1ce.supplement.png'/></td></tr>
<tr><td>✅</td><td>Calcium (Foundation A)</td><td><img style='width:20%;' src='../../public/img/supplements/7d67412c-fde0-44d4-882a-dc8746fd4acb.supplement.png'/></td></tr>
<tr><td>❌</td><td colspan='2'>Calcium (Powder)</td></tr>
<tr><td>✅</td><td>Iodine (Colors A)</td><td><img style='width:20%;' src='../../public/img/supplements/93e742b0-67c9-4800-9aa9-212e52532343.supplement.png'/></td></tr>
<tr><td>✅</td><td>Iron (Colors C)</td><td><img style='width:20%;' src='../../public/img/supplements/c7a26034-8e40-41bb-bfb5-169089470f1e.supplement.png'/></td></tr>
<tr><td>✅</td><td>KH/Alkalinity (Foundation B)</td><td><img style='width:20%;' src='../../public/img/supplements/76830db3-a0bd-459a-9974-76a57d026893.supplement.png'/></td></tr>
<tr><td>❌</td><td colspan='2'>KH/Alkalinity (Powder)</td></tr>
<tr><td>✅</td><td>Magnesium (Foundation C)</td><td><img style='width:20%;' src='../../public/img/supplements/f524734e-8651-496e-b09b-640b40fc8bab.supplement.png'/></td></tr>
<tr><td>❌</td><td colspan='2'>Magnesium (Powder)</td></tr>
<tr><td>✅</td><td>NO3PO4-X</td><td><img style='width:20%;' src='../../public/img/supplements/ffaf6ff8-bc6d-44eb-9e4b-e679943dc835.supplement.png'/></td></tr>
<tr><td>✅</td><td>Potassium (Colors B)</td><td><img style='width:20%;' src='../../public/img/supplements/2f386917-54bd-4dd4-aa8b-9d1fea37edc5.supplement.png'/></td></tr>
<tr><td>✅</td><td>Reef Energy Plus</td><td><img style='width:20%;' src='../../public/img/supplements/bf9a7da3-741b-4c1d-8542-d9344a95fb70.supplement.png'/></td></tr>
<tr><td>✅</td><td>ReefCare Program</td><td><img style='width:20%;' src='../../public/img/supplements/redsea-reefcare.supplement.png'/></td></tr>
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
<tr><td>✅</td><td>All-For-Reef</td><td><img style='width:20%;' src='../../public/img/supplements/aff00331-3c23-4357-b6d4-6609dbc4fed1.supplement.png'/></td></tr>
<tr><td>✅</td><td>Amino Organic</td><td><img style='width:20%;' src='../../public/img/supplements/fddbe0a4-02eb-4903-969b-6c27c805bf6b.supplement.png'/></td></tr>
<tr><td>❌</td><td colspan='2'>Balling A</td></tr>
<tr><td>❌</td><td colspan='2'>Balling B</td></tr>
<tr><td>❌</td><td colspan='2'>Balling C</td></tr>
<tr><td>✅</td><td>Bio-Magnesium</td><td><img style='width:20%;' src='../../public/img/supplements/2f04f694-3743-4e12-a45f-a3eb63aef806.supplement.png'/></td></tr>
<tr><td>✅</td><td>Carbo Calcium</td><td><img style='width:20%;' src='../../public/img/supplements/8cdabb9f-ebcf-4675-a10f-f9020941928f.supplement.png'/></td></tr>
<tr><td>❌</td><td colspan='2'>Elimi-NP</td></tr>
<tr><td>❌</td><td colspan='2'>K Element</td></tr>
<tr><td>❌</td><td colspan='2'>Liquid Buffer</td></tr>
<tr><td>✅</td><td>NP-Bacto-Balance</td><td><img style='width:20%;' src='../../public/img/supplements/43b51c1f-0363-4ef5-be89-f129e512e25b.supplement.png'/></td></tr>
<tr><td>❌</td><td colspan='2'>Plus-NP</td></tr>
<tr><td>✅</td><td>Potassium</td><td><img style='width:20%;' src='../../public/img/supplements/964e897e-9668-4fc8-9cd9-e8c42a27cf85.supplement.png'/></td></tr>
</table>
</details>

# ReefLed

Planeado.

Deseja que seja suportado mais rapidamente? Vote [aqui](https://github.com/Elwinmage/ha-reef-card/discussions/22).

# ReefMat

ReefMat com ha-reef-card em ação:

[![Assistir ao vídeo](https://img.youtube.com/vi/yyNyUSitb1E/0.jpg)](https://www.youtube.com/watch?v=yyNyUSitb1E)

O cartão ReefMat está dividido em 7 zonas:

1. Configuração / Informações Wifi
2. Estados
3. Informações do rolo (comprimento total usado, comprimento restante, fim do rolo, modo...)
4. Avanço manual/automático
5. Sensor
6. Avanço programado
7. Gráfico de utilização semanal / mensal

<img src="../img/rsmat/rsmat_zones.png"/>

A imagem de fundo muda de acordo com o estado de utilização do rolo, com 5 imagens diferentes:

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

## Configuração / Informações Wifi

<img src="../img/rsmat/zone_1.png"/>

---

<span>Clique no ícone <img src="../img/rsdose/cog_icon.png" width="30" /> para gerir a configuração geral do ReefMat.</span>

<img src="../img/rsmat/zone_1_dialog_configuration.png"/>

<span>Clique no ícone <img src="../img/rsdose/wifi_icon.png" width="30" /> para gerir as definições de rede.</span>

<img src="../img/rsmat/zone_1_dialog_wifi.png"/>

## Estados

<img src="../img/rsmat/zone_2.png"/>

---

<span>O interruptor de manutenção <img src="../img/mdi/mdi_account-wrench.png" width="20"/> permite mudar para o modo de manutenção.</span>

 <img  src="../img/rsmat/maintenance.png"/>

<span>O interruptor on/off <img src="../img/mdi/mdi_power-plug.png" width="20"/> alterna o ReefMat entre os estados ligado e desligado.</span>

 <img  src="../img/rsmat/off_mode.png"/>

## Informações do rolo

<img src="../img/rsmat/zone_3.png"/>

---

Esta zona apresenta o estado em tempo real do rolo filtrante, de cima para baixo:

- O **comprimento total utilizado** desde o início do rolo (em cima, a vermelho)
- O **comprimento restante** ao centro a vermelho. Quando o rolo está vazio, aparece um <img src="../img/mdi/mdi_paper-roll.png" width="20"/> ícone a piscar e uma caixa de diálogo propõe substituir o rolo.

<img src="../img/rsmat/zone_3_dialog_new_roll.png"/>

- O **número de dias restantes** até ao fim do rolo, estimado com base no consumo diário médio (a preto)
- O **consumo diário médio** em cm (em baixo à esquerda)
- O **modo de funcionamento** atual: Auto, Manutenção, Desligado… (abaixo do logo RedSea)
- A **percentagem de rolo utilizado** (arco circular em baixo à direita)

Se for detetada uma anomalia, o logo RedSea transforma-se num <img src="../img/mdi/mdi_alert-decagram.png" width="20"/> ícone a piscar.
Clicar neste alerta abre a caixa de diálogo de anomalias:

<img src="../img/rsmat/alert.png"/>
<img src="../img/rsmat/zone_3_dialog_alert.png" />

## Avanço Manual/Automático

<img src="../img/rsmat/zone_4.png"/>
<img src="../img/rsmat/zone_4_auto_off.png"/>
---

Esta zona controla o avanço do rolo.

Da esquerda para a direita:

- O botão <img src="../img/mdi/mdi_send.png" width="20"/> inicia um **avanço manual** do rolo pelo comprimento indicado ao centro.
- O **valor de avanço** apresentado (em cm) é o valor enviado ao premir o botão. Clicar neste número abre a caixa de edição.

<img src="../img/rsmat/zone_4_dialog_manual_advance.png"/>

- O **botão de avanço automático** <img src="../img/mdi/mdi_autorenew.png" width="20"/> <img src="../img/mdi/mdi_autorenew-off.png" width="20"/> ativa ou desativa o avanço automático do rolo.

## Sensor

<img src="../img/rsmat/zone_5.png"/>

---

Esta zona indica o estado do sensor de nível.

Três estados são possíveis:

| Estado           | Imagem                                                          |
| ---------------- | --------------------------------------------------------------- |
| Sensor ligado    | <img src="../img/rsmat/RSMAT_SENSOR_PLUGGED.png" width="80"/>   |
| Sensor desligado | <img src="../img/rsmat/RSMAT_SENSOR_UNPLUGGED.png" width="80"/> |
| Sensor sujo      | <img src="../img/mdi/mdi_liquid-spot.png" width="80"/>          |

## Avanço programado

<img src="../img/rsmat/zone_6.png"/>

---

Este botão <img src="../img/mdi/mdi_auto-mode_red.png" width="20"/><img src="../img/mdi/mdi_auto-mode_black.png" width="20"/> mostra o estado do avanço programado e permite editá-lo clicando.

<img src="../img/rsmat/zone_6_dialog_schedule.png"/>

## Gráfico de utilização

<img src="../img/rsmat/zone_7.png"/> 
<img src="../img/rsmat/monthly.png"/>

---

Esta zona apresenta um gráfico do consumo do rolo ao longo do tempo.
Clicar no botão alterna entre os dois modos disponíveis:

- O modo **Weekly** apresenta o consumo dos últimos 7 dias.
- O modo **Monthly** apresenta o consumo dos últimos 30 dias.

Premir no canto superior esquerdo do gráfico abre a vista detalhada no Home Assistant.

## Messages

<img src="../img/rsmat/zone_8.png"/>

---

Esta zona apresenta as últimas mensagens do sistema do ReefMat. Tem duas linhas:

- A linha cinzenta mostra a **última mensagem** recebida.
- A linha rosa mostra o **último alerta**, precedido pelo símbolo ⚠.

Clicar em <img src="../img/mdi/mdi_delete-empty.png" width="20"/> apaga a mensagem correspondente.

Linie te można ukryć za pomocą interfejsu edytora karty.

<img src="../img/rsmat/editor.png" />

# ReefRun

ReefRun com ha-reef-card em ação:

[![Ver o vídeo](https://img.youtube.com/vi/Xxv38OPqiGI/0.jpg)](https://www.youtube.com/watch?v=Xxv38OPqiGI)

O cartão ReefRun mostra o controlador e as suas duas bombas tal como estão
fisicamente ligadas, cada uma com o seu cabo e a sua tubagem. A bomba 1 é a da
esquerda e a bomba 2 a da direita — normalmente a bomba de retorno e o DC
Skimmer, mas cada tomada aceita qualquer um dos modelos.

<img src="../img/rsrun/rsrun_zones.png"/>

O cartão está dividido em 6 zonas:

1. Estado de alimentação e modo de manutenção
2. Informações de bateria e Wifi
3. Controlador: modo de funcionamento, botões das bombas e calibrações
4. Bomba 1: programação diária, corpo com caudal de água em direto, temperatura
5. Bomba 2: programação diária, corpo com caudal de água em direto, temperatura
6. Última mensagem e último alerta

## Estado de alimentação e modo de manutenção

<img src="../img/rsrun/zone_1.png" >

<span>O interruptor de manutenção <img src="../img/mdi/mdi_account-wrench.png" width="20"/> muda para o modo de manutenção.</span>

<img src="../img/rsrun/maintenance.png" >

<span>O interruptor ligar/desligar <img src="../img/mdi/mdi_power-plug.png" width="20"/> liga e desliga o Reef Dual Controller.</span>

<img src="../img/rsrun/off_mode.png" >

## Informações de bateria e Wifi

<img src="../img/rsrun/zone_2.png"/>

---

<span>Este ícone <img src="../img/mdi/battery.png" width="30" /> indica o nível de bateria do Dual Controller.</span>

<span>Clique no ícone <img src="../img/mdi/wifi_icon.png" width="30" /> para gerir as definições de rede.</span>

<img src="../img/rsrun/zone_2_dialog_wifi.png"/>

## Controlador: modo de funcionamento, botões das bombas e calibrações

<img src="../img/rsrun/zone_3.png"/>

### Definições das bombas

Um clique em <img src="../img/mdi/cog-1.png" width="5%"/> ou <img src="../img/mdi/cog-2.png" width="5%"/> abre o diálogo de configuração da bomba 1 ou 2.

<img src="../img/rsrun/zone_3_return_pump.png"/>
<img src="../img/rsrun/zone_3_skimmer.png"/>

> [!CAUTION]
> **Eliminar a bomba** repõe as suas definições nos valores de fábrica: a
> programação e o controlo por sonda são perdidos. É sempre pedida uma
> confirmação.

### Definições da sonda

Um clique em <img src="../img/mdi/cog-s.png" width="5%"/> abre o diálogo de configuração da sonda.
<img src="../img/rsrun/zone_3_sensor.png"/>

### Play/pausa de uma bomba <img src="../img/mdi/play.png" width="5%"/> / <img src="../img/mdi/pause.png" width="5%"/>

Um clique liga ou desliga essa bomba.

O anel vermelho indica a velocidade atual.
<img src="../img/rsrun/speed.png"/>

Para alterar a velocidade atual, mantenha premido <img src="../img/mdi/play.png" width="5%"/> / <img src="../img/mdi/pause.png" width="5%"/> ou clique na programação:

<img src="../img/rsrun/schedule.png"/>

## Estados de uma bomba

O corpo da bomba reflete o que o aparelho está mesmo a fazer, basta um relance.
Os dois tipos de bomba não têm os mesmos estados, pelo que são descritos
separadamente.

## Bombas 1 e 2

### Bomba de retorno

<img src="../../src/img/redsea/RSRUN/reefrun_return.png" width="30%"/>

Uma única ilustração cobre todos os estados, o cartão só muda a forma de a
desenhar:

- **Em funcionamento** — cores plenas, água animada à velocidade atual.
- **Parada** — a mesma ilustração acinzentada, sem caudal.
- **Desligada** — o mesmo acinzentado, mais o cabo de alimentação a piscar.

### Escumador

Três ilustrações distintas, uma por estado do copo:

<table>
  <tr>
    <td align="center"><img src="../../src/img/redsea/RSRUN/reefrun_skimmer_on.png" width="100%"/><br/><b>Em funcionamento</b><br/>Espuma no copo, bolhas a subir, água animada</td>
    <td align="center"><img src="../../src/img/redsea/RSRUN/reefrun_skimmer_full.png" width="100%"/><br/><b>Copo cheio</b><br/>Espuma reduzida a uma faixa sob a tampa</td>
    <td align="center"><img src="../../src/img/redsea/RSRUN/reefrun_skimmer_off.png" width="100%"/><br/><b>Parado</b><br/>Copo vazio, acinzentado, sem bolhas</td>
  </tr>
</table>

Um escumador desligado é exatamente igual a um parado: só o cabo a piscar os
distingue. Esse piscar significa que o ReefRun comunica `missing_pump`, ou seja,
a bomba está configurada mas o controlador já não a vê. Verifique a ficha antes
de procurar mais longe.

O estado de copo cheio é comunicado pelo sensor de espuma situado na câmara de
recolha. O corpo muda para a sua própria ilustração e a animação de espuma
reduz-se a uma faixa fina sob a tampa, esteja ou não a autorregulação ativa. O
ícone de alerta a piscar junto ao interruptor de copo cheio só aparece se
`sensor_controlled` estiver ativo, pois com o sensor desativado o controlador
não age perante um copo cheio.

### Adicionar uma bomba

Uma tomada sem bomba configurada mostra um marcador de **adicionar** em vez de um
corpo de bomba:

<img src="../../src/img/redsea/RSRUN/add_pump.png" width="20%"/>

Um clique abre o diálogo de configuração, onde **Detetar e adicionar** pergunta
ao controlador o que está ligado e regista-o numa só operação. O modelo detetado
é apenas uma sugestão e por vezes engana-se, por isso a lista de modelos
permanece editável a seguir: para um DC Skimmer escolha rsk-300, rsk-600 ou
rsk-900. O nome da bomba edita-se no mesmo diálogo.

O marcador está presente em qualquer tomada não configurada, pelo que também
aparece numa tomada que não tenciona usar. Quem tem apenas uma bomba pode
escondê-lo por completo a partir do editor do cartão.

<img src="../img/rsrun/editor.png"/>

### Programação

<img src="../img/rsrun/schedule.png"/>

A curva azul é a velocidade programada ao longo de 24 horas. A linha vermelha
vertical marca a hora atual e o ponto sobre ela a velocidade pedida pela
programação.

Quando a bomba não segue a sua programação — modo alimentação, deteção de copo
cheio, proteção contra sobre-escumação — o ponto desloca-se para a velocidade
**real** e um segmento vermelho materializa a diferença, com o valor ao lado:

<img src="../img/rsrun/schedule_deviation.png"/>

Um clique no gráfico abre o editor de programação: adicionar ou remover pontos, editar horas e velocidades, pré-visualizar um ponto no aparelho e guardar.

<img src="../img/rsrun/schedule_editor.png"/>

## Mensagens

<img src="../img/rsrun/zone_6.png"/>

---

Esta zona apresenta as últimas mensagens de sistema do ReefRun. Tem duas linhas:

- A linha cinzenta mostra a **última mensagem** recebida.
- A linha rosa mostra o **último alerta**, precedido do símbolo ⚠.

Um clique no ícone <img src="../img/mdi/mdi_delete-empty.png" width="20"/> apaga a mensagem correspondente.

Estas linhas podem ser ocultadas a partir do editor do cartão.

<img src="../img/rsrun/editor_2.png" />

# ReefWave

Planeado.

Deseja que seja suportado mais rapidamente? Vote [aqui](https://github.com/Elwinmage/ha-reef-card/discussions/22).

# Manutenção

A vista de manutenção do ha-reef-card em ação:

[![Ver o vídeo](https://img.youtube.com/vi/Ko46fHonOP4/0.jpg)](https://www.youtube.com/watch?v=Ko46fHonOP4)

<img src="../img/maintenance/overview.png"/>

Para além das vistas por aparelho, o cartão oferece uma vista **Manutenção** que
reúne todas as tarefas de manutenção expostas pelo `ha-reefbeat-component`, como
se todo o subsistema de manutenção fosse um único aparelho.

Cada tarefa é apresentada como uma barra de progresso que indica que parte do
seu intervalo já decorreu, com uma cor determinada pelo tempo restante:

| Cor      | Significado                                                     |
| -------- | --------------------------------------------------------------- |
| Verde    | Em dia                                                          |
| Laranja  | A vencer em breve (últimos 20 % do intervalo, no mínimo um dia) |
| Vermelho | Em atraso, a etiqueta passa a `+X d`                            |
| Cinzento | Nunca realizada (nenhuma reposição registada)                   |

As tarefas podem ser ordenadas **por equipamento** (agrupadas, com um cabeçalho
por aparelho) ou **por prazo** (uma lista simples, a mais urgente primeiro). As
tarefas nunca realizadas ficam sempre no fim. Na barra de ferramentas há dois
filtros: uma caixa que esconde as tarefas ainda em dia e um botão **Esconder
silenciadas / Mostrar silenciadas** que esconde as tarefas cujo interruptor de
notificação está desligado. O botão arranca na posição «mostrar», por isso
silenciar um alerta nunca faz desaparecer um prazo por si só. Esse valor por
omissão é configurável no editor do cartão (ou com `hide_muted` mais abaixo), e
o botão continua a ter prioridade em qualquer momento.

Clicar numa linha abre o diálogo more-info do Home Assistant da tarefa, e o
botão redondo à direita marca-a como feita (prime a entidade botão subjacente,
exatamente como faria o diálogo more-info).

A vista só aparece no seletor de aparelhos quando existe pelo menos uma tarefa
de manutenção na sua instalação. As novas tarefas acrescentadas ao catálogo da
integração aparecem automaticamente, sem atualizar o cartão.

### Notificações

Cada tarefa recebe também um **interruptor de notificação** na integração
(`switch.*_notify`, apresentado como «<nome da tarefa> (notificações)»).
Desligá-lo silencia o alerta de atraso apenas dessa tarefa, sem alterar o seu
prazo: a barra de progresso continua a avançar, a linha simplesmente esmorece e
o sino apaga-se.

O sino à direita de cada linha comuta esse interruptor diretamente. Só é
mostrado quando a integração expõe o interruptor. Use `show_notify: false` para
esconder os sinos.

O blueprint de alertas lê exatamente a mesma definição, por isso silenciar uma
tarefa no cartão silencia também a automação.

### Alterar o intervalo

O botão de calendário de cada linha abre um cursor em linha que escreve na
entidade numérica do intervalo da tarefa. O cursor funciona na unidade que a
integração anuncia para essa tarefa (dias, semanas ou meses, lida do papel da
entidade), e a integração volta a converter para dias antes de guardar. Os
limites vêm da própria entidade, por isso o cartão nunca pode escrever um valor
fora do intervalo. Apenas um editor fica aberto de cada vez. Use
`show_interval: false` para esconder os botões.

### Filtrar por aparelho

Por omissão a vista lista as tarefas de todos os aparelhos. O bloco **Filtrar
por dispositivo** do editor do cartão restringe-a: assinala um ou vários
aparelhos e apenas as suas tarefas são mantidas, contadores incluídos.

<img src="../img/maintenance/editor_devices.png"/>

A lista contém uma entrada por controlador, com o número de tarefas que lhe
pertencem. Os subaparelhos (cabeças ReefDose, bombas ReefRun) são agrupados sob
o seu controlador graças à ligação `via_device` do registo do Home Assistant:
assinalar **RSDose4** conserva assim as tarefas das quatro cabeças. Nenhuma
caixa assinalada significa «sem filtro»: são apresentados todos os aparelhos, o
que o atalho **Mostrar todos os dispositivos** também repõe.

A seleção é guardada como nomes de aparelho (ver `devices` abaixo), para que o
YAML se mantenha legível. Um nome escrito à mão corresponde também aos seus
subaparelhos por prefixo, o que cobre as instalações onde `via_device` não está
declarado. Os aparelhos sem nome são identificados pelo seu id de dispositivo do
Home Assistant.

### Bombas ReefRun

Os subaparelhos ReefRun chamam-se «… bomba 1» / «… bomba 2», o que nada diz
sobre o que cada bomba realmente é. Quando o aparelho expõe simultaneamente um
sensor `type` e um sensor `model`, o cartão acrescenta-os entre parênteses:
**ReefRun bomba 1 (retorno 12000)**, **ReefRun bomba 2 (escumador 900)**.

O tipo é traduzido e apenas o número final do modelo é mantido (`return-12000`
-> `12000`, `rsk-900` -> `900`), já que o prefixo ou é redundante com o tipo ou
é críptico. Os aparelhos que não são bombas mantêm um nome simples.

## Ícones

| Ícone                                                                                                    | Função                                                                                 |
| -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| <img src="../img/mdi/mdi_check.png" width="20"/>                                                         | **Tarefa realizada.** Marca a tarefa como feita e reinicia a sua contagem decrescente. |
| <img src="../img/mdi/mdi_bell-ring.png" width="20"/> <img src="../img/mdi/mdi_bell-off.png" width="20"/> | **Silenciar / ativar.** Comuta o interruptor de notificação apenas dessa tarefa.       |
| <img src="../img/mdi/mdi_calendar-edit.png" width="20"/>                                                 | **Alterar o intervalo.** Abre um cursor ligado ao intervalo da tarefa.                 |

## Editor

O estado por omissão dos filtros, o filtro por aparelho e a visibilidade dos três
botões definem-se no editor do cartão.

<img src="../img/maintenance/editor.png"/>

## Configuração

```yaml
type: custom:reef-card
device: __maintenance__
maintenance:
  sort: due # "device" (por omissão) ou "due"
  devices: # mostrar apenas as tarefas destes aparelhos (vazio: todos)
    - SIMU-RSDOSE4
    - SIMU-RSATO
  hide_ok: false # esconder as tarefas nem em atraso nem a vencer
  hide_muted: false # esconder as tarefas com as notificações desligadas
  warning_ratio: 0.2 # parte do intervalo apresentada a laranja
  show_reset: true # mostrar o botão "marcar como feita" em cada linha
  show_notify: true # mostrar o sino de silenciar/ativar em cada linha
  show_interval: true # mostrar o botão de edição do intervalo em cada linha
```

Todas as chaves de `maintenance` são opcionais. `sort` e `hide_ok` apenas fixam
o estado inicial: o utilizador pode alterá-los a partir da própria vista.
`devices` aceita tanto nomes de aparelho como ids de dispositivo do Home
Assistant; uma lista vazia (a predefinição) desativa o filtro.

# FAQ

---

[buymecoffee]: https://paypal.me/Elwinmage
[buymecoffeebadge]: https://img.shields.io/badge/buy%20me%20a%20coffee-donate-yellow.svg?style=flat-square
