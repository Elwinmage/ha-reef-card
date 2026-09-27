[← Voltar à página principal](README.pt.md)

# Manutenção

A vista de manutenção do ha-reef-card em ação:

[![Ver o vídeo](https://img.youtube.com/vi/Ko46fHonOP4/0.jpg)](https://www.youtube.com/watch?v=Ko46fHonOP4)

<img src="../img/maintenance/overview.png"/>

Para além das vistas por aparelho, o cartão oferece uma vista **Manutenção** que
reúne todas as tarefas de manutenção expostas pelo `ha-reefbeat-component`, pelo
`ha-reef-maintenance-component` e pelo `ha-aquamedic-component`, como se todo o
subsistema de manutenção fosse um único aparelho. A vista procura o marcador que
cada um deles coloca nas suas entidades, e não uma integração em particular.

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

---

[← Voltar à página principal](README.pt.md)
