[← Voltar à página principal](README.pt.md)

# ReefWave

ReefWave com ha-reef-card em ação:

[![Assistir ao vídeo](https://img.youtube.com/vi/sYVeE0zV3eo/0.jpg)](https://www.youtube.com/watch?v=sYVeE0zV3eo)

As ReefWave **RSWAVE25** e **RSWAVE45** são suportadas.

<img src="../img/rswave/rswave.png"/>

> [!IMPORTANT]
> As bombas ReefWave dependem da nuvem ReefBeat mais do que os outros
> dispositivos: leia primeiro [isto](https://github.com/Elwinmage/ha-reefbeat-component/blob/main/doc/pt/reefwave.pt.md#reefwave). Com uma conta na nuvem
> associada no ha-reefbeat-component, o cartão trabalha com a biblioteca de
> ondas e os grupos da aplicação ReefBeat, e ambos se mantêm sincronizados.
> Sem conta, veja [Sem conta na nuvem](#sem-conta-na-nuvem).

## A vista

O cartão está dividido em 7 zonas:

1. Mensagens
2. Clipes de fixação
3. Fita LED
4. Tampa
5. Fluxo
6. Grupo
7. Programa do dia

<img src="../img/rswave/rswave_zones.png"/>

## Mensagens

<img src="../img/rswave/zone_1.png"/>

Última mensagem e último alerta, em cima.

## Clipes de fixação

<img src="../img/rswave/zone_2.png"/>

Ligar/desligar, manutenção, definições e Wi-Fi.

## Fita LED

<img src="../img/rswave/zone_3.png"/>

O modo da bomba, em branco claro (um toque abre a sua
informação), e o nome da bomba por baixo.

## Tampa

<img src="../img/rswave/zone_4.png"/>

A velocidade, como um anel vermelho ajustado à tampa: a
intensidade de avanço da onda em curso, da pré-visualização durante uma
pré-visualização, e 0 quando a bomba não funciona (desligada,
alimentação, manutenção, sem onda). Setas no interior dão a direção:
→ avanço, ← recuo, ambas para uma onda alternada. Toque na tampa para
definir [esta bomba na onda atual](#esta-bomba-na-onda-atual).

## Fluxo

<img src="../img/rswave/zone_5.png"/>

Por baixo da bomba, água animada a essa velocidade: para a
esquerda numa onda de avanço, para a direita numa de recuo, de um lado
para o outro numa alternada. Nada é desenhado com a bomba parada.

## Grupo

<img src="../img/rswave/zone_6.png"/>

As bombas do grupo numa linha, cada uma com a sua miniatura e
o seu nome, pela ordem do grupo. A bomba do cartão está rodeada; toque
noutra para mostrar o seu próprio cartão. Uma bomba que o Home Assistant
não alcança aparece a cinzento. Nada é mostrado para uma bomba sozinha.

## Programa do dia

<img src="../img/rswave/zone_7.png"/>

O dia das 00:00 às 24:00, um bloco por intervalo na
cor do seu tipo de onda: a intensidade de avanço sobe acima da linha
central, a de recuo desce abaixo dela. Um intervalo «sem onda» é uma linha
tracejada. A legenda dos tipos (pictograma e nome) está por baixo do
gráfico, e um cursor vermelho marca a hora atual. Toque no gráfico para
editar o programa; o botão **Ondas** por cima dele abre
a biblioteca.

Tipos de onda: Uniforme, Aleatória, Regular,
Degraus, Superfície e Sem onda, com os
pictogramas da aplicação ReefBeat.

## Editor de programa

<img src="../img/rswave/program_editor.png"/>

Toque no programa do dia: em cima o gráfico do rascunho, depois uma linha
por intervalo com o seu início, o seu fim, a onda escolhida na biblioteca, o
seu tipo, a sua direção e as intensidades desta bomba. Os intervalos podem
ser adicionados e removidos; **Guardar** escreve o programa,
**Cancelar** não altera nada.

- O programa é escrito em **todas as bombas do grupo**, cada uma com as suas
  próprias intensidades. Quando uma bomba do grupo não está disponível, a
  gravação fica bloqueada, como na aplicação ReefBeat: o grupo mantém-se
  sincronizado.
- O programa começa às 00:00, dois intervalos não podem começar à mesma
  hora, e cada intervalo precisa de uma onda.
- Por baixo da nota do grupo, um botão agrupa a bomba com as ReefWave do seu
  aquário (**Agrupar com as ReefWave do aquário**) ou desagrupa-a (**Desagrupar esta bomba**).
  Num grupo, a ordem das suas bombas muda-se por arrastar e largar, ou com
  as setas ‹ ›.
- Por baixo da tabela, a zona das ondas mostra a biblioteca na onda do
  intervalo atual; o lápis de uma linha, ou a escolha de uma onda, mostra
  essa onda.

## Biblioteca de ondas

<img src="../img/rswave/library.png"/>

O botão **Ondas** lista as ondas do aquário, tal como a
aplicação ReefBeat as guarda: as da Red Sea e as suas, cada uma com as
bombas que a usam. Escolher uma onda mostra as suas definições:

- o seu **tipo**, escolhido entre os pictogramas;
- a sua **forma**: tempos de avanço e de recuo (min), duração do impulso (s)
  e passos, consoante o que o seu tipo usa. A forma é partilhada por todas
  as bombas que usam a onda;
- as intensidades de avanço e de recuo **desta bomba**, e se está
  sincronizada com o grupo.

Depois, **Atualizar a onda** escreve a onda (os programas que a usam são
escritos de novo), **Criar uma nova onda** pede um nome e adiciona uma cópia
com estas definições, e **Eliminar** remove uma onda que nenhum
programa usa. Uma onda Red Sea só pode ser copiada.

**Pré-visualização nesta bomba**: escolha a direção e a duração (de 1 a 10 min), e
depois **Pré-visualizar**; a bomba executa a onda e depois volta
ao seu programa. **Parar a pré-visualização** termina-a de imediato.

## Esta bomba na onda atual

<img src="../img/rswave/pump_settings.png"/>

Toque na tampa para alterar a direção e as intensidades de avanço / recuo
desta bomba na onda em curso. Só esta bomba muda: as outras bombas do grupo
mantêm a sua direção e as suas intensidades, já que a aplicação ReefBeat
deixa cada bomba de um grupo executar uma onda à sua maneira.

## Definições

<img src="../img/rswave/dialog_config.png"/>

A roda dentada abre as definições da bomba: a onda em curso (tipo, direção,
intensidades, tempos, passos), `Atraso de desligamento do atalho`,
`Agrupada com o aquário`, as definições e os botões de pré-visualização
da integração, e as ações do dispositivo (atualizar, repor, atualização do
firmware).

## Sem conta na nuvem

A biblioteca de ondas e os grupos vivem na nuvem ReefBeat. Sem uma conta na
nuvem associada à bomba, só são propostas as ondas do programa atual, o
programa é escrito na própria bomba, e a biblioteca não pode ser editada.

> [!NOTE]
> A vista precisa do ha-reefbeat-component com o atributo `schedule` do
> sensor `wave_type`, o sensor `linked_waves` e os serviços `redsea.wave_*`.

---

[← Voltar à página principal](README.pt.md)
