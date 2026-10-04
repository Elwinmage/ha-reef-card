[← Voltar à página principal](README.pt.md)

# Energia de reserva

O cartão desenha os fluxos de energia do [reefbeatEnergyBackup](https://github.com/Elwinmage/reefbeatEnergyBackup): a rede, a bateria, o aquário e até quatro bombas com a sua velocidade.

<img src="../img/energybackup/overview.png"/>

O serviço publica os seus sensores por MQTT: o seu dispositivo (`Reef Battery Backup` por omissão) aparece no seletor de dispositivos do cartão assim que o Home Assistant o descobre. Não há mais nada a configurar: o cartão encontra sozinho os sensores e as bombas.

## Power Flow Card Plus

Os fluxos são desenhados pelo [Power Flow Card Plus](https://github.com/flixlix/power-flow-card-plus), um cartão à parte que tem de ser instalado (HACS → Frontend). Enquanto faltar, a vista mostra uma ligação que o abre no HACS:

<img src="../img/energybackup/install.png"/>

Os fluxos substituem esse painel assim que o cartão é carregado. A sua configuração é escrita pelo reef card: não é preciso YAML `power-flow-card-plus`, sensor de modelo nem `config-template-card`.

## A vista

O cartão está dividido em 5 zonas:

1. Título e manutenção
2. Rede
3. Bateria
4. Aquário
5. Bombas

<img src="../img/energybackup/energybackup_zones.png"/>

Um clique num nó abre a entidade correspondente.

## Título e manutenção

<img src="../img/energybackup/zone_1.png"/>

O nome do dispositivo. O ícone `mdi:wrench-clock` abre as tarefas de manutenção do dispositivo (o teste de descarga da bateria), como nas outras vistas.

## Rede

<img src="../img/energybackup/zone_2.png"/>

Potência fornecida pelo carregador. Durante um corte: **Corte** e a sua duração.

A potência do carregador só existe com um carregador Victron. Sem ela, o nó da rede indica apenas se há rede, e o nó do aquário mostra o que a bateria fornece: nada com rede, pois o monitor da bateria só vê a corrente da bateria.

## Bateria

<img src="../img/energybackup/zone_3.png"/>

Potência de carga ou descarga, estado de carga.

## Aquário

<img src="../img/energybackup/zone_4.png"/>

O que o equipamento consome (rede e bateria juntas), com a autonomia restante por baixo.

## Bombas

<img src="../img/energybackup/zone_5.png"/>

Velocidade em %, sentido de uma bomba de circulação, ícone conforme a velocidade. Cada bomba tem o seu nome no Home Assistant; para uma bomba ReefRun, o nome dado à própria bomba. O canal de um ReefRun sem nada ligado não é mostrado.

As bombas são procuradas entre os ReefWave, as bombas ReefRun e as bombas Aqua Medic da instalação. Por omissão o fluxo mostra as que o serviço de reserva controla (publica a sua lista: uma bomba adicionada ou retirada com `configure.py` acompanha após reiniciar o serviço). Quando o serviço não publica a lista, são mostradas as primeiras bombas que ainda respondem, primeiro as bombas de circulação. O cartão de fluxos desenha quatro bombas no máximo: com mais, assinale as que mostrar no editor do cartão.

<img src="../img/energybackup/editor.png"/>

A seleção é guardada com as opções do dispositivo, como identificadores de dispositivo do Home Assistant:

```yaml
type: custom:reef-card
device: reef_battery
conf:
  ENERGYBACKUP:
    devices:
      reef_battery:
        pumps:
          - 0a1b2c3d4e5f60718293a4b5c6d7e8f9
          - 9f8e7d6c5b4a39281706f5e4d3c2b1a0
```
