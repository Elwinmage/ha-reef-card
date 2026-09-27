[← Zurück zur Hauptseite](README.de.md)

# ReefMat

ReefMat mit ha-reef-card in Aktion:

[![Video ansehen](https://img.youtube.com/vi/yyNyUSitb1E/0.jpg)](https://www.youtube.com/watch?v=yyNyUSitb1E)

Die ReefMat-Karte ist in 7 Bereiche unterteilt:

1. Konfiguration / WLAN-Informationen
2. Zustände
3. Rolleninformationen (verbrauchte Gesamtlänge, verbleibende Länge, Rollenende, Modus...)
4. Manueller/Automatischer Vorschub
5. Sensor
6. Geplanter Vorschub
7. Wochen- / Monatsverbrauchsdiagramm

<img src="../img/rsmat/rsmat_zones.png"/>

Das Hintergrundbild ändert sich je nach Nutzungszustand der Rolle mit 5 verschiedenen Bildern:

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

## Konfiguration / WLAN-Informationen

<img src="../img/rsmat/zone_1.png"/>

---

<span>Klicken Sie auf das Symbol <img src="../img/rsdose/cog_icon.png" width="30" /> zur Verwaltung der allgemeinen Konfiguration des ReefMat.</span>

<img src="../img/rsmat/zone_1_dialog_configuration.png"/>

<span>Klicken Sie auf das Symbol <img src="../img/rsdose/wifi_icon.png" width="30" /> zur Verwaltung der Netzwerkeinstellungen.</span>

<img src="../img/rsmat/zone_1_dialog_wifi.png"/>

## Zustände

<img src="../img/rsmat/zone_2.png"/>

---

<span>Der Wartungsschalter <img src="../img/mdi/mdi_account-wrench.png" width="20"/> wechselt in den Wartungsmodus.</span>

 <img  src="../img/rsmat/maintenance.png"/>

<span>Der Ein/Aus-Schalter <img src="../img/mdi/mdi_power-plug.png" width="20"/> schaltet den ReefMat zwischen Ein- und Aus-Zustand um.</span>

 <img  src="../img/rsmat/off_mode.png"/>

## Rolleninformationen

<img src="../img/rsmat/zone_3.png"/>

---

Dieser Bereich zeigt den Echtzeitstatus der Filterrolle, von oben nach unten:

- Die **insgesamt verbrauchte Länge** seit Beginn der Rolle (oben, rot)
- Die **verbleibende Länge** in der Mitte in rot. Wenn die Rolle leer ist, erscheint ein <img src="../img/mdi/mdi_paper-roll.png" width="20"/> blinkendes Symbol und ein Dialogfeld schlägt vor, die Rolle zu ersetzen.

<img src="../img/rsmat/zone_3_dialog_new_roll.png"/>

- Die **verbleibenden Tage** bis zum Rollenende, geschätzt anhand des täglichen Durchschnittsverbrauchs (schwarz)
- Der **tägliche Durchschnittsverbrauch** in cm (unten links)
- Der aktuelle **Betriebsmodus**: Auto, Wartung, Aus… (unter dem RedSea-Logo)
- Der **Rollenverbrauchsprozentsatz** (Kreisbogen unten rechts)

Wird eine Anomalie erkannt, verwandelt sich das RedSea-Logo in ein <img src="../img/mdi/mdi_alert-decagram.png" width="20"/> blinkendes Symbol.
Ein Klick auf diesen Alarm öffnet den Anomalie-Dialog:

<img src="../img/rsmat/alert.png"/>
<img src="../img/rsmat/zone_3_dialog_alert.png" />

## Manueller/Automatischer Vorschub

<img src="../img/rsmat/zone_4.png"/>
<img src="../img/rsmat/zone_4_auto_off.png"/>
---

Dieser Bereich steuert den Rollenvorschub.

Von links nach rechts:

- Die Schaltfläche <img src="../img/mdi/mdi_send.png" width="20"/> löst einen **manuellen Vorschub** der Rolle um die angezeigte Länge aus.
- Der angezeigte **Vorschubwert** (in cm) ist der Wert, der beim Drücken der Taste gesendet wird. Ein Klick öffnet den Bearbeitungsdialog.

<img src="../img/rsmat/zone_4_dialog_manual_advance.png"/>

- Die **automatische Vorschubschaltfläche** <img src="../img/mdi/mdi_autorenew.png" width="20"/> <img src="../img/mdi/mdi_autorenew-off.png" width="20"/> aktiviert oder deaktiviert den automatischen Rollenvorschub.

## Sensor

<img src="../img/rsmat/zone_5.png"/>

---

Dieser Bereich zeigt den Status des Niveausensors.

Drei Zustände sind möglich:

| Zustand              | Bild                                                            |
| -------------------- | --------------------------------------------------------------- |
| Sensor angeschlossen | <img src="../img/rsmat/RSMAT_SENSOR_PLUGGED.png" width="80"/>   |
| Sensor getrennt      | <img src="../img/rsmat/RSMAT_SENSOR_UNPLUGGED.png" width="80"/> |
| Schmutziger Sensor   | <img src="../img/mdi/mdi_liquid-spot.png" width="80"/>          |

## Geplanter Vorschub

<img src="../img/rsmat/zone_6.png"/>

---

Diese Schaltfläche <img src="../img/mdi/mdi_auto-mode_red.png" width="20"/><img src="../img/mdi/mdi_auto-mode_black.png" width="20"/> zeigt den Status des geplanten Vorschubs und ermöglicht die Bearbeitung per Klick.

<img src="../img/rsmat/zone_6_dialog_schedule.png"/>

## Verbrauchsdiagramm

<img src="../img/rsmat/zone_7.png"/> 
<img src="../img/rsmat/monthly.png"/>

---

Dieser Bereich zeigt ein Diagramm des Rollenverbrauchs über die Zeit.
Ein Klick auf die Schaltfläche wechselt zwischen den zwei verfügbaren Modi:

- Der Modus **Weekly** zeigt den Verbrauch der letzten 7 Tage.
- Der Modus **Monthly** zeigt den Verbrauch der letzten 30 Tage.

Ein Druck oben links im Diagramm öffnet die Detailansicht in Home Assistant.

## Messages

<img src="../img/rsmat/zone_8.png"/>

---

Dieser Bereich zeigt die letzten Systemmeldungen des ReefMat. Er hat zwei Zeilen:

- Die graue Zeile zeigt die **letzte Nachricht**.
- Die rosa Zeile zeigt die **letzte Warnung**, mit dem Symbol ⚠.

Ein Klick auf <img src="../img/mdi/mdi_delete-empty.png" width="20"/> löscht die entsprechende Nachricht.

Diese Zeilen können über die Karteneditor-Oberfläche ausgeblendet werden.

<img src="../img/rsmat/editor.png" />

---

[← Zurück zur Hauptseite](README.de.md)
