[← Zurück zur Hauptseite](README.de.md)

# ReefControl-Power

ReefControl und ReefControl-Power mit ha-reef-card in Aktion:

[![Video ansehen](https://img.youtube.com/vi/voFobfc7Slk/0.jpg)](https://www.youtube.com/watch?v=voFobfc7Slk)

Die ReefControl-Power-Karte zeichnet das Power Center mit seinen Steckdosen, was
an jeder angeschlossen ist, und links davon entweder seine eigene
Temperatursonde oder den [ReefControl](reefcontrol.de.md#reefcontrol), mit dem es gekoppelt ist.

Beide Modelle werden unterstützt: Sie unterscheiden sich nur durch die Anzahl
ihrer Steckdosen.

<table>
  <tr>
    <th align="center">RSPOWER6</th>
    <th align="center">RSPOWER8</th>
  </tr>
  <tr>
    <td align="center"><img src="../img/rspower/rspower6.png"/></td>
    <td align="center"><img src="../img/rspower/rspower8.png"/></td>
  </tr>
</table>

Der Rest dieses Abschnitts ist mit dem RSPOWER6 bebildert: Auf dem RSPOWER8
funktioniert alles genauso.

<img src="../img/rspower/rspower_zones.png"/>

Die Karte ist in 6 Bereiche unterteilt:

1. Betriebszustand und Wartungsmodus
2. Konfiguration, WLAN und Batterie
3. Steckdosen
4. Temperatursonde oder ReefControl-Verbindung
5. Verknüpfte Geräte
6. Letzte Meldung und letzter Alarm

## Betriebszustand und Wartungsmodus

<img src="../img/rspower/zone_1.png"/>

---

<span>Der Schalter <img src="../img/mdi/mdi_power-plug.png" width="20"/> schaltet das ReefControl-Power ein oder aus.</span>

<img src="../img/rspower/off_mode.png" width="50%"/>

Ausgeschaltet behält die Karte nur den Ein/Aus-Schalter, das Bild der
Temperatursonde oder des gekoppelten ReefControl und die Verknüpfungen zu anderen
Geräten: Der Name des Hubs und die an den Steckdosen angeschlossenen Geräte öffnen
weiterhin ihre eigene Karte. Die Steckdosen verlieren ihre Schaltflächen, Namen
und ihren Verbrauch, die Sonde ihren Messwert und ihre Einstellungen.

<span>Der Schalter <img src="../img/mdi/mdi_account-wrench.png" width="20"/> wechselt in den Wartungsmodus.</span>

<img src="../img/rspower/maintenance.png" width="50%"/>

## Konfiguration / WLAN-Informationen

<img src="../img/rspower/zone_2.png"/>

---

<span>Ein Klick auf das Symbol <img src="../img/rsdose/cog_icon.png" width="30"/> öffnet die allgemeine Konfiguration des ReefControl-Power: Einstellungen oder abgefragte Daten aktualisieren, das Gerät zurücksetzen, seine Firmware aktualisieren und seine Region und Steckdosenanzahl sehen.</span>

Im selben Dialog wird die lokale Temperatursonde hinzugefügt oder entfernt und der
ReefControl entkoppelt. Sonde und Hub schließen sich gegenseitig aus: Eine
Schaltfläche, die nicht zutrifft, wird ausgegraut statt ausgeblendet, damit Sie
sehen, welche Aktionen es gibt.

<img src="../img/rspower/zone_2_dialog_config.png" width="50%"/>

<span>Ein Klick auf das Symbol <img src="../img/mdi/wifi_icon.png" width="30"/> öffnet die Netzwerkeinstellungen.</span>

<img src="../img/rspower/zone_2_dialog_wifi.png" width="50%"/>

<span>Das Symbol <img src="../img/mdi/battery.png" width="30"/> zeigt den Batteriestand des ReefControl-Power.</span>

## Steckdosen

<img src="../img/rspower/zone_3.png"/>

---

Der Text auf der Front des Power Centers ist sein **Betriebsmodus** (Auto,
Setup…), neben dem **Gesamtverbrauch** seiner Steckdosen. Ein Klick auf den
Verbrauch öffnet seinen Info-Dialog.

Jede Steckdose zeigt, von oben nach unten:

- Ihren **Namen**.
- Ihre **Schaltfläche**, in der Farbe der Steckdose eingerahmt, mit rotem Symbol,
  wenn die Steckdose eingeschaltet ist, und grauem, wenn sie aus ist. Sie zeigt
  einen Stecker oder das Symbol des daran angeschlossenen Geräts (siehe
  [Verknüpfte Geräte](#verknüpfte-geräte)).
- Ihren **Verbrauch**, der seinen Info-Dialog öffnet.

Kleine Symbole unten auf der Schaltfläche zeigen, wie die Steckdose gesteuert wird:

| Symbol                                                                                                                                                                                                                                                                                                                              | Bedeutung                                                                               |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| <img src="../img/mdi/mdi_power.png" width="20"/>                                                                                                                                                                                                                                                                                    | Von Hand ein oder aus                                                                   |
| <img src="../img/mdi/mdi_clock-time-nine-outline.png" width="20"/>                                                                                                                                                                                                                                                                  | Folgt einem Zeitplan — ein Klick öffnet seinen Editor                                   |
| <img src="../img/mdi/mdi_thermometer.png" width="20"/> <img src="../img/mdi/mdi_ph.png" width="20"/> <img src="../img/mdi/mdi_water-percent.png" width="20"/> <img src="../img/mdi/mdi_flash-triangle.png" width="20"/> <img src="../img/mdi/mdi_water-alert.png" width="20"/> <img src="../img/mdi/mdi_cup-water.png" width="20"/> | Folgt einer Sonde: Temperatur, pH, Salinität, ORP, Leck oder ATO-Wasserstand            |
| <img src="../img/mdi/mdi_hand-back-left-outline.png" width="20"/>                                                                                                                                                                                                                                                                   | Ihr Zeitplan oder ihre Sonde ist ausgesetzt: Die Steckdose wurde von Hand ausgeschaltet |

Eine nie konfigurierte Steckdose zeigt ein **+** statt ihrer Schaltfläche: Ein
Klick öffnet ihre Einstellungen, um ihr einen Modus zu geben.

Ein **Klick** auf die Schaltfläche öffnet die Einstellungen der Steckdose. Ein
**langer Druck** schaltet die Steckdose direkt ein oder aus.

### Steckdose

<img src="../img/rspower/zone_3_dialog_socket.png" width="50%"/>

Der Dialog beginnt mit Name, Schalter, Zustand und Verbrauch der Steckdose und
bietet dann ihre vier Modi an:

- **Ein** / **Aus**: Die Steckdose bleibt eingeschaltet oder nicht.
- **Zeitplan**: eine 24-Stunden-Zeitleiste und die Liste ihrer
  **Einschalt**intervalle. Intervalle hinzufügen, bearbeiten oder entfernen; ein
  Intervall, das vor seinem Beginn endet oder das vorherige überlappt, wird unter
  der Liste erklärt und blockiert das Speichern.

<img src="../img/rspower/zone_3_socket_schedule.png" width="50%"/>

- **Sensor**: Die Steckdose folgt einer Sonde — der lokalen Temperatursonde des
  Power Centers oder einer beliebigen Sonde des gekoppelten ReefControl,
  eingebaute Temperaturen inklusive. Wählen Sie, ob die Steckdose **ein**- oder
  **aus**geschaltet wird, wenn der Messwert **über** oder **unter** einen
  **Schwellwert** geht, mit einer **Hysterese** (einem Totband um den
  Schwellwert, damit die Steckdose nicht flackert), und was bei Verlust der Sonde
  geschehen soll. Eine Steckdose, die einer ATO-Sonde folgt, braucht keinen
  Schwellwert.

<img src="../img/rspower/zone_3_socket_sensor.png" width="50%"/>

Nichts wird an das Gerät gesendet, bevor **Speichern** gedrückt wird.

Wurde eine Steckdose, die einem Zeitplan oder einer Sonde folgt, von Hand
ausgeschaltet, öffnet sich der Dialog auf diesem automatischen Modus, zeigt an,
dass er ausgesetzt ist, und bietet an, ihn **fortzusetzen**, ohne Zeitplan oder
Regel neu zu schreiben.

<img src="../img/rspower/zone_3_socket_override.png" width="50%"/>

<span>Das Papierkorbsymbol <img src="../img/mdi/mdi_delete-empty.png" width="20"/> oben rechts löscht nach einer Bestätigung die Konfiguration der Steckdose: Sie erhält ihren Werksnamen zurück und hat keinen Modus mehr.</span>

<img src="../img/rspower/zone_3_dialog_delete.png" width="50%"/>

## Temperatursonde oder ReefControl-Verbindung

Links auf der Karte steht, woher das Power Center seine Temperatur liest: von
seiner eigenen Sonde oder vom gekoppelten ReefControl. Beides schließt sich
gegenseitig aus.

### Temperatursonde

<img src="../img/rspower/zone_4_temperature.png"/>

---

Die lokale Temperatursonde wird am Power Center eingesteckt gezeichnet, mit ihrem
Messwert in der Farbe seiner Stufe und einem Lagebalken entlang der Sonde (einem
Punkt im Kompaktmodus des Karteneditors). Ein Klick auf den Balken öffnet die
letzten 24 Stunden der Temperatur über ihren Bändern.

Eine ausgesteckte Sonde blinkt unter einer leichten roten Tönung.

<span>Ein Klick auf das Zahnrad <img src="../img/rsdose/cog_icon.png" width="30"/> öffnet die Sondeneinstellungen: ihren Namen, eine Schaltfläche zum sofortigen Auslesen, ihren erwünschten und akzeptablen Bereich, ihre Kalibrierung auf die tatsächliche Temperatur und ihre Schalter für Protokollierung und Benachrichtigungen.</span>

<img src="../img/rspower/zone_4_dialog_temperature.png" width="50%"/>

### ReefControl-Verbindung

<img src="../img/rspower/zone_4_rscontrol.png"/>

---

Ein gekoppelter ReefControl nimmt den Platz der Sonde ein: Sein Kabel wird mit dem
Namen des Hubs daran gezeichnet. Ein Klick auf den Namen öffnet die Karte des
Hubs.

<span>Das Symbol <img src="../img/mdi/mdi_web.png" width="20"/> öffnet den Verbindungsdialog: der gekoppelte Hub, sein Typ und Status und ob er mit dem Power Center und dem Internet verbunden ist.</span>

<img src="../img/rspower/zone_4_dialog_rscontrol.png" width="50%"/>

Ist der Hub gekoppelt, aber nicht erreichbar, blinkt die Verbindung unter einer
leichten roten Tönung.

## Verknüpfte Geräte

<img src="../img/rspower/zone_5.png"/>

---

Das Power Center weiß nicht, was an seinen Steckdosen angeschlossen ist: Die
Karte lässt es Sie im Karteneditor angeben. Eine Steckdose, die mit einem Red
Sea-Gerät oder einer Aqua Medic-Pumpe verknüpft ist, zeigt:

- ein Bild des Geräts unter der Steckdose, in zwei versetzten Reihen, damit sich
  Nachbarn nicht überlappen, mit ihr durch ein Rohr in der Farbe der Steckdose
  verbunden (grau, solange die Steckdose aus ist);
- das Symbol des Geräts auf der Schaltfläche der Steckdose statt des Steckers.

Eine ReefRun-Pumpe wird nach ihrer Aufgabe dargestellt, Förderpumpe oder
Abschäumer, statt nach ihrem Controller. Jedes andere in Home Assistant bekannte
Gerät kann ebenfalls verknüpft werden, hat aber noch kein Bild.

Für ein Gerät, das Home Assistant nicht kennt (Heizer, Lampe, Lüfter…), wählen Sie **Andere**: Die Steckdosentaste zeigt dann <img src="../img/mdi/mdi_dots-horizontal-circle-outline.png" width="20"/> statt des Steckers, ohne Bild darunter.

Das Bild folgt dem Zustand des Geräts:

| Aussehen   | Zustand des Red Sea-Geräts                                                         |
| ---------- | ---------------------------------------------------------------------------------- |
| Normal     | Läuft normal                                                                       |
| Ausgegraut | Ausgeschaltet                                                                      |
| Blinkend   | Alles andere: manueller Modus, Wartung, nicht verfügbar, eine Pumpe außer Betrieb… |

Geräte anderer Integrationen werden immer normal gezeichnet.

Ein Klick auf das Bild öffnet die Karte des Geräts.

## Meldungen

<img src="../img/rspower/zone_6.png"/>

---

Diese Zone zeigt die letzten Systemmeldungen des ReefControl-Power. Sie hat zwei Zeilen:

- Die graue Zeile zeigt die **letzte Meldung**.
- Die rosa Zeile zeigt den **letzten Alarm**, dem das Symbol ⚠ vorangeht.

Ein Klick auf das Symbol <img src="../img/mdi/mdi_delete-empty.png" width="20"/> löscht die zugehörige Meldung.

Diese Zeilen lassen sich über den Karteneditor ausblenden.

## Karteneditor

<img src="../img/rspower/editor.png" width="50%"/>

---

Neben den beiden Meldungszeilen hat das ReefControl-Power drei Optionen:

- **Kompakte Sonden**: Die Temperatur wird als Punkt in der Farbe ihrer Stufe
  statt als Lagebalken angezeigt.
- **Steckdosenfarben**: die Farbe jeder Steckdose, verwendet für ihre
  Schaltfläche und das Rohr zu ihrem verknüpften Gerät.
- **Verknüpftes Gerät**: pro Steckdose das daran angeschlossene Gerät oder
  **Keines**. **Andere** steht für ein Gerät, das Home Assistant nicht kennt.

Die Optionen werden unter dem Modell gespeichert, wie Home Assistant es meldet:

```yaml
type: custom:reef-card
device: "210987654321" # stabile Kennung des Geräts (sein Name funktioniert auch)
conf:
  RSPOWER6:
    devices:
      "210987654321":
        name: MY-RSPOWER # nur Beschriftung
        compact_probes: false
        sockets:
          socket_1:
            color: "255,0,0"
            linked_device: 0123456789abcdef0123456789abcdef
          socket_3:
            linked_device: fedcba9876543210fedcba9876543210
```

---

[← Zurück zur Hauptseite](README.de.md)
