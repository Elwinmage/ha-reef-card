import { css, html, LitElement } from 'lit';

export class ReefCardEditor extends LitElement {

    static get properties() {
        return {
            // hass: {},
            _config: { state: true },
        };
    }

    setConfig(config) {
        this._config = config;
    }

    static styles = css`
            .table {
                display: table;
            }
            .row {
                display: table-row;
            }
            .cell {
                display: table-cell;
                padding: 0.5em;
            }
        `;

    render() {
	console.log("CONFIG UI");
	console.log(this._config);
	if(this._config){
            return html`
            <form class="table">
                <div class="row">
                    <label class="label cell" for="device">Device:</label>
                    <input
                        @change="${this.handleChangedEvent}"
                        class="value cell" id="device" value="${this._config['device']}"></input>
                </div>
            </form>
        `;
	}
	return html``;
    }


    handleChangedEvent(changedEvent) {
	console.log("CONFIG CHANGED");
        // this._config is readonly, copy needed
        var newConfig = Object.assign({}, this._config);
	if (changedEvent.target.id == "device") {
            newConfig.device = changedEvent.target.value;
        }
        const messageEvent = new CustomEvent("config-changed", {
            detail: { config: newConfig },
            bubbles: true,
            composed: true,
        });
        this.dispatchEvent(messageEvent);
    }
}
