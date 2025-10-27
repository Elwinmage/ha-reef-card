
function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

      var $parcel$global = globalThis;
    
var $parcel$modules = {};
var $parcel$inits = {};

var parcelRequire = $parcel$global["parcelRequire94c2"];

if (parcelRequire == null) {
  parcelRequire = function(id) {
    if (id in $parcel$modules) {
      return $parcel$modules[id].exports;
    }
    if (id in $parcel$inits) {
      var init = $parcel$inits[id];
      delete $parcel$inits[id];
      var module = {id: id, exports: {}};
      $parcel$modules[id] = module;
      init.call(module.exports, module, module.exports);
      return module.exports;
    }
    var err = new Error("Cannot find module '" + id + "'");
    err.code = 'MODULE_NOT_FOUND';
    throw err;
  };

  parcelRequire.register = function register(id, init) {
    $parcel$inits[id] = init;
  };

  $parcel$global["parcelRequire94c2"] = parcelRequire;
}

var parcelRegister = parcelRequire.register;
parcelRegister("5c2Je", function(module, exports) {

$parcel$export(module.exports, "default", () => RSDevice);
parcelRequire("j0ZcV");
var $l56HR = parcelRequire("l56HR");
var $eGUNk = parcelRequire("eGUNk");

var $dPhcg = parcelRequire("dPhcg");
parcelRequire("6vZH1");

var $37d5w = parcelRequire("37d5w");
class RSDevice extends (0, $eGUNk.LitElement) {
    static styles = [
        (0, $37d5w.default)
    ];
    static get properties() {
        return {
            hass: {},
            config: {},
            device: {},
            user_config: {}
        };
    }
    constructor(config, hass, device, user_config){
        super();
        this.hass = hass;
        this.device = device;
        this.config = config;
        this.user_config = user_config;
        this.entities = {};
        this.first_init = true;
    }
    find_leaves(tree, path) {
        var keys = Object.keys(tree);
        if (keys[0] == '0') {
            eval(path + '="' + tree + '"');
            return;
        }
        for (var key of keys){
            let sep = '.';
            let ipath = path + sep + key;
            this.find_leaves(tree[key], ipath);
        }
    }
    update_config() {
        if (this.first_init) {
            console.debug("RSDevice.update_config for ", this.device);
            if ("conf" in this.user_config) {
                console.debug("User config detected");
                console.debug(this.user_config.conf);
                if (this.device.elements[0].model in this.user_config.conf) {
                    let device_conf = this.user_config.conf[this.device.elements[0].model];
                    if ('common' in device_conf) {
                        this.find_leaves(device_conf['common'], "this.config");
                        if ('devices' in device_conf && this.device.name in device_conf.devices) {
                            console.log(this.device.name);
                            this.find_leaves(device_conf['devices'][this.device.name], "this.config");
                        }
                    } //if
                //apply new params
                } //if
            } //if
            this.first_init = false;
        } //if
    }
    _populate_entities() {
        for(var entity_id in this.hass.entities){
            var entity = this.hass.entities[entity_id];
            if (entity.device_id == this.device.elements[0].id) this.entities[entity.translation_key] = entity;
        }
    }
    _press(button) {
        console.log("button pressed: :" + this.entities[button.name].entity_id);
    //	this.hass.callService("button", "press", {entity_id: this.entities[button.name].entity_id});
    }
    _toggle(swtch) {
        console.log(this.entities);
        console.log(swtch);
        var entity_id = this.entities[swtch.name].entity_id;
        console.log("toggle switch: " + entity_id);
        //	this.hass.callService("switch", "toggle", {entity_id: this.entities[swtch.name].entity_id});
        const actionConfig = {
            entity: entity_id,
            tap_action: {
                action: "more-info"
            }
        };
        // Open more info on tap action
        const event = new Event("hass-action", {
            bubbles: true,
            composed: true
        });
        event.detail = {
            config: actionConfig,
            action: "tap"
        };
        console.log("EVENT ***");
        console.log(event);
        this.dispatchEvent(event);
    /*	let e = new Event('hass-more-info', { composed: true });
	e.detail = { entity_id};
	console.log(e);
	let res=this.dispatchEvent(e);
	console.log(res);*/ }
    _render_switch(swtch) {
        // console.log("RENDER switch");
        // console.log(swtch);
        // console.log(this.config);
        // console.log(this.entities[swtch.name]);
        // console.log(this.hass.states[this.entities[swtch.name].entity_id]);
        //<ha-entity-toggle .hass="${this.hass}" .label="${label_name}" .stateObj="${this.hass.states[this.entities[swtch.name].entity_id]}"></ha-entity-toggle>
        let label_name = swtch.name;
        // Don not display label
        if ('label' in swtch && swtch.label == false) label_name = '';
        //<common-switch class="on_off" .hass="${this.hass}" .label="${label_name}" .stateObj="${this.hass.states[this.entities[swtch.name].entity_id]}></common-switch>
        console.log("**//**/*/*/*/");
        console.log(this.entities[swtch.name].entity_id);
        console.log(this.hass.states[this.entities[swtch.name].entity_id]);
        return (0, $l56HR.html)`
<!--  <style>
      #${swtch.name}:hover {
background-color: rgba(${this.config.color},${this.config.alpha});
}
</style>
<div id="${swtch.name}" class="${swtch.class}" @click="${()=>this._toggle(swtch)}"> -->
<div class="${swtch.class}">
<common-switch class="on_off" .hass="${this.hass}" .label="${label_name}"  .stateObj="${this.hass.states[this.entities[swtch.name].entity_id]}"></common-switch>
</div>
`;
    //         return html`
    //  <style>
    //       #${swtch.name}:hover {
    // background-color: rgba(${this.config.color},${this.config.alpha});
    // }
    // </style>
    // <div id="${swtch.name}" class="${swtch.class}" @click="${() => this._toggle(swtch)}">
    // <ha-entity-toggle width="500px" .hass="${this.hass}" .label="${label_name}" .stateObj="${this.hass.states[this.entities[swtch.name].entity_id]}"></ha-entity-toggle>
    // </div>
    // `;
    }
    _render_button(button) {
        console.log("RENDER button");
        console.log(button);
        console.log(this.config);
        return (0, $l56HR.html)`
 <style>
      #${button.name}:hover {
background-color: rgba(${this.config.color},${this.config.alpha});
}
</style>
<div id="${button.name}" class="${button.class}" @click="${()=>this._press(button)}"></div>
`;
    }
    _render_actuators_type(type) {
        if (type.name in this.config) {
            console.log("Render " + type.name);
            console.log(this.config);
            return (0, $l56HR.html)`${this.config[type.name].map((actuator)=>type.fn.call(this, actuator))}`;
        }
        console.log("No " + type.name);
        return (0, $l56HR.html)``;
    }
    _render_actuators() {
        let actuators = [
            {
                "name": "buttons",
                "fn": this._render_button
            },
            {
                "name": "switches",
                "fn": this._render_switch
            }
        ];
        return (0, $l56HR.html)`
                     ${actuators.map((type)=>this._render_actuators_type(type))}
                      `;
    }
    _render_disabled() {
        return (0, $l56HR.html)`<div class="device_bg">
                          <img class="device_img_disabled" id=d_img" alt=""  src='${this.config.background_img}'/>
                          <p class='disabled_in_ha'>${(0, $dPhcg.default)._("disabledInHa")}</p>
                        </div">`;
    }
}
window.customElements.define('rs-device', RSDevice);

});
parcelRegister("j0ZcV", function(module, exports) {
$parcel$export(module.exports, "css", () => (parcelRequire("j8KxL")).css);
$parcel$export(module.exports, "html", () => (parcelRequire("l56HR")).html);
$parcel$export(module.exports, "LitElement", () => (parcelRequire("eGUNk")).LitElement);
parcelRequire("2emM7");
parcelRequire("l56HR");
parcelRequire("eGUNk");
parcelRequire("dJV7N");

});
parcelRegister("2emM7", function(module, exports) {

$parcel$export(module.exports, "ReactiveElement", () => $19fe8e3abedf4df0$export$c7c07a37856565d);
$parcel$export(module.exports, "css", () => (parcelRequire("j8KxL")).css);

var $j8KxL = parcelRequire("j8KxL");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */ const { is: $19fe8e3abedf4df0$var$i, defineProperty: $19fe8e3abedf4df0$var$e, getOwnPropertyDescriptor: $19fe8e3abedf4df0$var$h, getOwnPropertyNames: $19fe8e3abedf4df0$var$r, getOwnPropertySymbols: $19fe8e3abedf4df0$var$o, getPrototypeOf: $19fe8e3abedf4df0$var$n } = Object, $19fe8e3abedf4df0$var$a = globalThis, $19fe8e3abedf4df0$var$c = $19fe8e3abedf4df0$var$a.trustedTypes, $19fe8e3abedf4df0$var$l = $19fe8e3abedf4df0$var$c ? $19fe8e3abedf4df0$var$c.emptyScript : "", $19fe8e3abedf4df0$var$p = $19fe8e3abedf4df0$var$a.reactiveElementPolyfillSupport, $19fe8e3abedf4df0$var$d = (t, s)=>t, $19fe8e3abedf4df0$export$7312b35fbf521afb = {
    toAttribute (t, s) {
        switch(s){
            case Boolean:
                t = t ? $19fe8e3abedf4df0$var$l : null;
                break;
            case Object:
            case Array:
                t = null == t ? t : JSON.stringify(t);
        }
        return t;
    },
    fromAttribute (t, s) {
        let i = t;
        switch(s){
            case Boolean:
                i = null !== t;
                break;
            case Number:
                i = null === t ? null : Number(t);
                break;
            case Object:
            case Array:
                try {
                    i = JSON.parse(t);
                } catch (t) {
                    i = null;
                }
        }
        return i;
    }
}, $19fe8e3abedf4df0$export$53a6892c50694894 = (t, s)=>!$19fe8e3abedf4df0$var$i(t, s), $19fe8e3abedf4df0$var$b = {
    attribute: !0,
    type: String,
    converter: $19fe8e3abedf4df0$export$7312b35fbf521afb,
    reflect: !1,
    useDefault: !1,
    hasChanged: $19fe8e3abedf4df0$export$53a6892c50694894
};
Symbol.metadata ??= Symbol("metadata"), $19fe8e3abedf4df0$var$a.litPropertyMetadata ??= new WeakMap;
class $19fe8e3abedf4df0$export$c7c07a37856565d extends HTMLElement {
    static addInitializer(t) {
        this._$Ei(), (this.l ??= []).push(t);
    }
    static get observedAttributes() {
        return this.finalize(), this._$Eh && [
            ...this._$Eh.keys()
        ];
    }
    static createProperty(t, s = $19fe8e3abedf4df0$var$b) {
        if (s.state && (s.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((s = Object.create(s)).wrapped = !0), this.elementProperties.set(t, s), !s.noAccessor) {
            const i = Symbol(), h = this.getPropertyDescriptor(t, i, s);
            void 0 !== h && $19fe8e3abedf4df0$var$e(this.prototype, t, h);
        }
    }
    static getPropertyDescriptor(t, s, i) {
        const { get: e, set: r } = $19fe8e3abedf4df0$var$h(this.prototype, t) ?? {
            get () {
                return this[s];
            },
            set (t) {
                this[s] = t;
            }
        };
        return {
            get: e,
            set (s) {
                const h = e?.call(this);
                r?.call(this, s), this.requestUpdate(t, h, i);
            },
            configurable: !0,
            enumerable: !0
        };
    }
    static getPropertyOptions(t) {
        return this.elementProperties.get(t) ?? $19fe8e3abedf4df0$var$b;
    }
    static _$Ei() {
        if (this.hasOwnProperty($19fe8e3abedf4df0$var$d("elementProperties"))) return;
        const t = $19fe8e3abedf4df0$var$n(this);
        t.finalize(), void 0 !== t.l && (this.l = [
            ...t.l
        ]), this.elementProperties = new Map(t.elementProperties);
    }
    static finalize() {
        if (this.hasOwnProperty($19fe8e3abedf4df0$var$d("finalized"))) return;
        if (this.finalized = !0, this._$Ei(), this.hasOwnProperty($19fe8e3abedf4df0$var$d("properties"))) {
            const t = this.properties, s = [
                ...$19fe8e3abedf4df0$var$r(t),
                ...$19fe8e3abedf4df0$var$o(t)
            ];
            for (const i of s)this.createProperty(i, t[i]);
        }
        const t = this[Symbol.metadata];
        if (null !== t) {
            const s = litPropertyMetadata.get(t);
            if (void 0 !== s) for (const [t, i] of s)this.elementProperties.set(t, i);
        }
        this._$Eh = new Map;
        for (const [t, s] of this.elementProperties){
            const i = this._$Eu(t, s);
            void 0 !== i && this._$Eh.set(i, t);
        }
        this.elementStyles = this.finalizeStyles(this.styles);
    }
    static finalizeStyles(s) {
        const i = [];
        if (Array.isArray(s)) {
            const e = new Set(s.flat(1 / 0).reverse());
            for (const s of e)i.unshift((0, $j8KxL.getCompatibleStyle)(s));
        } else void 0 !== s && i.push((0, $j8KxL.getCompatibleStyle)(s));
        return i;
    }
    static _$Eu(t, s) {
        const i = s.attribute;
        return !1 === i ? void 0 : "string" == typeof i ? i : "string" == typeof t ? t.toLowerCase() : void 0;
    }
    constructor(){
        super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
    }
    _$Ev() {
        this._$ES = new Promise((t)=>this.enableUpdating = t), this._$AL = new Map, this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((t)=>t(this));
    }
    addController(t) {
        (this._$EO ??= new Set).add(t), void 0 !== this.renderRoot && this.isConnected && t.hostConnected?.();
    }
    removeController(t) {
        this._$EO?.delete(t);
    }
    _$E_() {
        const t = new Map, s = this.constructor.elementProperties;
        for (const i of s.keys())this.hasOwnProperty(i) && (t.set(i, this[i]), delete this[i]);
        t.size > 0 && (this._$Ep = t);
    }
    createRenderRoot() {
        const t = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
        return (0, $j8KxL.adoptStyles)(t, this.constructor.elementStyles), t;
    }
    connectedCallback() {
        this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((t)=>t.hostConnected?.());
    }
    enableUpdating(t) {}
    disconnectedCallback() {
        this._$EO?.forEach((t)=>t.hostDisconnected?.());
    }
    attributeChangedCallback(t, s, i) {
        this._$AK(t, i);
    }
    _$ET(t, s) {
        const i = this.constructor.elementProperties.get(t), e = this.constructor._$Eu(t, i);
        if (void 0 !== e && !0 === i.reflect) {
            const h = (void 0 !== i.converter?.toAttribute ? i.converter : $19fe8e3abedf4df0$export$7312b35fbf521afb).toAttribute(s, i.type);
            this._$Em = t, null == h ? this.removeAttribute(e) : this.setAttribute(e, h), this._$Em = null;
        }
    }
    _$AK(t, s) {
        const i = this.constructor, e = i._$Eh.get(t);
        if (void 0 !== e && this._$Em !== e) {
            const t = i.getPropertyOptions(e), h = "function" == typeof t.converter ? {
                fromAttribute: t.converter
            } : void 0 !== t.converter?.fromAttribute ? t.converter : $19fe8e3abedf4df0$export$7312b35fbf521afb;
            this._$Em = e;
            const r = h.fromAttribute(s, t.type);
            this[e] = r ?? this._$Ej?.get(e) ?? r, this._$Em = null;
        }
    }
    requestUpdate(t, s, i) {
        if (void 0 !== t) {
            const e = this.constructor, h = this[t];
            if (i ??= e.getPropertyOptions(t), !((i.hasChanged ?? $19fe8e3abedf4df0$export$53a6892c50694894)(h, s) || i.useDefault && i.reflect && h === this._$Ej?.get(t) && !this.hasAttribute(e._$Eu(t, i)))) return;
            this.C(t, s, i);
        }
        !1 === this.isUpdatePending && (this._$ES = this._$EP());
    }
    C(t, s, { useDefault: i, reflect: e, wrapped: h }, r) {
        i && !(this._$Ej ??= new Map).has(t) && (this._$Ej.set(t, r ?? s ?? this[t]), !0 !== h || void 0 !== r) || (this._$AL.has(t) || (this.hasUpdated || i || (s = void 0), this._$AL.set(t, s)), !0 === e && this._$Em !== t && (this._$Eq ??= new Set).add(t));
    }
    async _$EP() {
        this.isUpdatePending = !0;
        try {
            await this._$ES;
        } catch (t) {
            Promise.reject(t);
        }
        const t = this.scheduleUpdate();
        return null != t && await t, !this.isUpdatePending;
    }
    scheduleUpdate() {
        return this.performUpdate();
    }
    performUpdate() {
        if (!this.isUpdatePending) return;
        if (!this.hasUpdated) {
            if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
                for (const [t, s] of this._$Ep)this[t] = s;
                this._$Ep = void 0;
            }
            const t = this.constructor.elementProperties;
            if (t.size > 0) for (const [s, i] of t){
                const { wrapped: t } = i, e = this[s];
                !0 !== t || this._$AL.has(s) || void 0 === e || this.C(s, void 0, i, e);
            }
        }
        let t = !1;
        const s = this._$AL;
        try {
            t = this.shouldUpdate(s), t ? (this.willUpdate(s), this._$EO?.forEach((t)=>t.hostUpdate?.()), this.update(s)) : this._$EM();
        } catch (s) {
            throw t = !1, this._$EM(), s;
        }
        t && this._$AE(s);
    }
    willUpdate(t) {}
    _$AE(t) {
        this._$EO?.forEach((t)=>t.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(t)), this.updated(t);
    }
    _$EM() {
        this._$AL = new Map, this.isUpdatePending = !1;
    }
    get updateComplete() {
        return this.getUpdateComplete();
    }
    getUpdateComplete() {
        return this._$ES;
    }
    shouldUpdate(t) {
        return !0;
    }
    update(t) {
        this._$Eq &&= this._$Eq.forEach((t)=>this._$ET(t, this[t])), this._$EM();
    }
    updated(t) {}
    firstUpdated(t) {}
}
$19fe8e3abedf4df0$export$c7c07a37856565d.elementStyles = [], $19fe8e3abedf4df0$export$c7c07a37856565d.shadowRootOptions = {
    mode: "open"
}, $19fe8e3abedf4df0$export$c7c07a37856565d[$19fe8e3abedf4df0$var$d("elementProperties")] = new Map, $19fe8e3abedf4df0$export$c7c07a37856565d[$19fe8e3abedf4df0$var$d("finalized")] = new Map, $19fe8e3abedf4df0$var$p?.({
    ReactiveElement: $19fe8e3abedf4df0$export$c7c07a37856565d
}), ($19fe8e3abedf4df0$var$a.reactiveElementVersions ??= []).push("2.1.1");

});
parcelRegister("j8KxL", function(module, exports) {

$parcel$export(module.exports, "css", () => $def2de46b9306e8a$export$dbf350e5966cf602);
$parcel$export(module.exports, "adoptStyles", () => $def2de46b9306e8a$export$2ca4a66ec4cecb90);
$parcel$export(module.exports, "getCompatibleStyle", () => $def2de46b9306e8a$export$ee69dfd951e24778);
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */ const $def2de46b9306e8a$var$t = globalThis, $def2de46b9306e8a$export$b4d10f6001c083c2 = $def2de46b9306e8a$var$t.ShadowRoot && (void 0 === $def2de46b9306e8a$var$t.ShadyCSS || $def2de46b9306e8a$var$t.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, $def2de46b9306e8a$var$s = Symbol(), $def2de46b9306e8a$var$o = new WeakMap;
class $def2de46b9306e8a$export$505d1e8739bad805 {
    constructor(t, e, o){
        if (this._$cssResult$ = !0, o !== $def2de46b9306e8a$var$s) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
        this.cssText = t, this.t = e;
    }
    get styleSheet() {
        let t = this.o;
        const s = this.t;
        if ($def2de46b9306e8a$export$b4d10f6001c083c2 && void 0 === t) {
            const e = void 0 !== s && 1 === s.length;
            e && (t = $def2de46b9306e8a$var$o.get(s)), void 0 === t && ((this.o = t = new CSSStyleSheet).replaceSync(this.cssText), e && $def2de46b9306e8a$var$o.set(s, t));
        }
        return t;
    }
    toString() {
        return this.cssText;
    }
}
const $def2de46b9306e8a$export$8d80f9cac07cdb3 = (t)=>new $def2de46b9306e8a$export$505d1e8739bad805("string" == typeof t ? t : t + "", void 0, $def2de46b9306e8a$var$s), $def2de46b9306e8a$export$dbf350e5966cf602 = (t, ...e)=>{
    const o = 1 === t.length ? t[0] : e.reduce((e, s, o)=>e + ((t)=>{
            if (!0 === t._$cssResult$) return t.cssText;
            if ("number" == typeof t) return t;
            throw Error("Value passed to 'css' function must be a 'css' function result: " + t + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
        })(s) + t[o + 1], t[0]);
    return new $def2de46b9306e8a$export$505d1e8739bad805(o, t, $def2de46b9306e8a$var$s);
}, $def2de46b9306e8a$export$2ca4a66ec4cecb90 = (s, o)=>{
    if ($def2de46b9306e8a$export$b4d10f6001c083c2) s.adoptedStyleSheets = o.map((t)=>t instanceof CSSStyleSheet ? t : t.styleSheet);
    else for (const e of o){
        const o = document.createElement("style"), n = $def2de46b9306e8a$var$t.litNonce;
        void 0 !== n && o.setAttribute("nonce", n), o.textContent = e.cssText, s.appendChild(o);
    }
}, $def2de46b9306e8a$export$ee69dfd951e24778 = $def2de46b9306e8a$export$b4d10f6001c083c2 ? (t)=>t : (t)=>t instanceof CSSStyleSheet ? ((t)=>{
        let e = "";
        for (const s of t.cssRules)e += s.cssText;
        return $def2de46b9306e8a$export$8d80f9cac07cdb3(e);
    })(t) : t;

});


parcelRegister("l56HR", function(module, exports) {

$parcel$export(module.exports, "html", () => $f58f44579a4747ac$export$c0bb0b647f701bb5);
$parcel$export(module.exports, "noChange", () => $f58f44579a4747ac$export$9c068ae9cc5db4e8);
$parcel$export(module.exports, "render", () => $f58f44579a4747ac$export$b3890eb0ae9dca99);
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */ const $f58f44579a4747ac$var$t = globalThis, $f58f44579a4747ac$var$i = $f58f44579a4747ac$var$t.trustedTypes, $f58f44579a4747ac$var$s = $f58f44579a4747ac$var$i ? $f58f44579a4747ac$var$i.createPolicy("lit-html", {
    createHTML: (t)=>t
}) : void 0, $f58f44579a4747ac$var$e = "$lit$", $f58f44579a4747ac$var$h = `lit$${Math.random().toFixed(9).slice(2)}$`, $f58f44579a4747ac$var$o = "?" + $f58f44579a4747ac$var$h, $f58f44579a4747ac$var$n = `<${$f58f44579a4747ac$var$o}>`, $f58f44579a4747ac$var$r = document, $f58f44579a4747ac$var$l = ()=>$f58f44579a4747ac$var$r.createComment(""), $f58f44579a4747ac$var$c = (t)=>null === t || "object" != typeof t && "function" != typeof t, $f58f44579a4747ac$var$a = Array.isArray, $f58f44579a4747ac$var$u = (t)=>$f58f44579a4747ac$var$a(t) || "function" == typeof t?.[Symbol.iterator], $f58f44579a4747ac$var$d = "[ \t\n\f\r]", $f58f44579a4747ac$var$f = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, $f58f44579a4747ac$var$v = /-->/g, $f58f44579a4747ac$var$_ = />/g, $f58f44579a4747ac$var$m = RegExp(`>|${$f58f44579a4747ac$var$d}(?:([^\\s"'>=/]+)(${$f58f44579a4747ac$var$d}*=${$f58f44579a4747ac$var$d}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`, "g"), $f58f44579a4747ac$var$p = /'/g, $f58f44579a4747ac$var$g = /"/g, $f58f44579a4747ac$var$$ = /^(?:script|style|textarea|title)$/i, $f58f44579a4747ac$var$y = (t)=>(i, ...s)=>({
            _$litType$: t,
            strings: i,
            values: s
        }), $f58f44579a4747ac$export$c0bb0b647f701bb5 = $f58f44579a4747ac$var$y(1), $f58f44579a4747ac$export$7ed1367e7fa1ad68 = $f58f44579a4747ac$var$y(2), $f58f44579a4747ac$export$47d5b44d225be5b4 = $f58f44579a4747ac$var$y(3), $f58f44579a4747ac$export$9c068ae9cc5db4e8 = Symbol.for("lit-noChange"), $f58f44579a4747ac$export$45b790e32b2810ee = Symbol.for("lit-nothing"), $f58f44579a4747ac$var$A = new WeakMap, $f58f44579a4747ac$var$C = $f58f44579a4747ac$var$r.createTreeWalker($f58f44579a4747ac$var$r, 129);
function $f58f44579a4747ac$var$P(t, i) {
    if (!$f58f44579a4747ac$var$a(t) || !t.hasOwnProperty("raw")) throw Error("invalid template strings array");
    return void 0 !== $f58f44579a4747ac$var$s ? $f58f44579a4747ac$var$s.createHTML(i) : i;
}
const $f58f44579a4747ac$var$V = (t, i)=>{
    const s = t.length - 1, o = [];
    let r, l = 2 === i ? "<svg>" : 3 === i ? "<math>" : "", c = $f58f44579a4747ac$var$f;
    for(let i = 0; i < s; i++){
        const s = t[i];
        let a, u, d = -1, y = 0;
        for(; y < s.length && (c.lastIndex = y, u = c.exec(s), null !== u);)y = c.lastIndex, c === $f58f44579a4747ac$var$f ? "!--" === u[1] ? c = $f58f44579a4747ac$var$v : void 0 !== u[1] ? c = $f58f44579a4747ac$var$_ : void 0 !== u[2] ? ($f58f44579a4747ac$var$$.test(u[2]) && (r = RegExp("</" + u[2], "g")), c = $f58f44579a4747ac$var$m) : void 0 !== u[3] && (c = $f58f44579a4747ac$var$m) : c === $f58f44579a4747ac$var$m ? ">" === u[0] ? (c = r ?? $f58f44579a4747ac$var$f, d = -1) : void 0 === u[1] ? d = -2 : (d = c.lastIndex - u[2].length, a = u[1], c = void 0 === u[3] ? $f58f44579a4747ac$var$m : '"' === u[3] ? $f58f44579a4747ac$var$g : $f58f44579a4747ac$var$p) : c === $f58f44579a4747ac$var$g || c === $f58f44579a4747ac$var$p ? c = $f58f44579a4747ac$var$m : c === $f58f44579a4747ac$var$v || c === $f58f44579a4747ac$var$_ ? c = $f58f44579a4747ac$var$f : (c = $f58f44579a4747ac$var$m, r = void 0);
        const x = c === $f58f44579a4747ac$var$m && t[i + 1].startsWith("/>") ? " " : "";
        l += c === $f58f44579a4747ac$var$f ? s + $f58f44579a4747ac$var$n : d >= 0 ? (o.push(a), s.slice(0, d) + $f58f44579a4747ac$var$e + s.slice(d) + $f58f44579a4747ac$var$h + x) : s + $f58f44579a4747ac$var$h + (-2 === d ? i : x);
    }
    return [
        $f58f44579a4747ac$var$P(t, l + (t[s] || "<?>") + (2 === i ? "</svg>" : 3 === i ? "</math>" : "")),
        o
    ];
};
class $f58f44579a4747ac$var$N {
    constructor({ strings: t, _$litType$: s }, n){
        let r;
        this.parts = [];
        let c = 0, a = 0;
        const u = t.length - 1, d = this.parts, [f, v] = $f58f44579a4747ac$var$V(t, s);
        if (this.el = $f58f44579a4747ac$var$N.createElement(f, n), $f58f44579a4747ac$var$C.currentNode = this.el.content, 2 === s || 3 === s) {
            const t = this.el.content.firstChild;
            t.replaceWith(...t.childNodes);
        }
        for(; null !== (r = $f58f44579a4747ac$var$C.nextNode()) && d.length < u;){
            if (1 === r.nodeType) {
                if (r.hasAttributes()) for (const t of r.getAttributeNames())if (t.endsWith($f58f44579a4747ac$var$e)) {
                    const i = v[a++], s = r.getAttribute(t).split($f58f44579a4747ac$var$h), e = /([.?@])?(.*)/.exec(i);
                    d.push({
                        type: 1,
                        index: c,
                        name: e[2],
                        strings: s,
                        ctor: "." === e[1] ? $f58f44579a4747ac$var$H : "?" === e[1] ? $f58f44579a4747ac$var$I : "@" === e[1] ? $f58f44579a4747ac$var$L : $f58f44579a4747ac$var$k
                    }), r.removeAttribute(t);
                } else t.startsWith($f58f44579a4747ac$var$h) && (d.push({
                    type: 6,
                    index: c
                }), r.removeAttribute(t));
                if ($f58f44579a4747ac$var$$.test(r.tagName)) {
                    const t = r.textContent.split($f58f44579a4747ac$var$h), s = t.length - 1;
                    if (s > 0) {
                        r.textContent = $f58f44579a4747ac$var$i ? $f58f44579a4747ac$var$i.emptyScript : "";
                        for(let i = 0; i < s; i++)r.append(t[i], $f58f44579a4747ac$var$l()), $f58f44579a4747ac$var$C.nextNode(), d.push({
                            type: 2,
                            index: ++c
                        });
                        r.append(t[s], $f58f44579a4747ac$var$l());
                    }
                }
            } else if (8 === r.nodeType) {
                if (r.data === $f58f44579a4747ac$var$o) d.push({
                    type: 2,
                    index: c
                });
                else {
                    let t = -1;
                    for(; -1 !== (t = r.data.indexOf($f58f44579a4747ac$var$h, t + 1));)d.push({
                        type: 7,
                        index: c
                    }), t += $f58f44579a4747ac$var$h.length - 1;
                }
            }
            c++;
        }
    }
    static createElement(t, i) {
        const s = $f58f44579a4747ac$var$r.createElement("template");
        return s.innerHTML = t, s;
    }
}
function $f58f44579a4747ac$var$S(t, i, s = t, e) {
    if (i === $f58f44579a4747ac$export$9c068ae9cc5db4e8) return i;
    let h = void 0 !== e ? s._$Co?.[e] : s._$Cl;
    const o = $f58f44579a4747ac$var$c(i) ? void 0 : i._$litDirective$;
    return h?.constructor !== o && (h?._$AO?.(!1), void 0 === o ? h = void 0 : (h = new o(t), h._$AT(t, s, e)), void 0 !== e ? (s._$Co ??= [])[e] = h : s._$Cl = h), void 0 !== h && (i = $f58f44579a4747ac$var$S(t, h._$AS(t, i.values), h, e)), i;
}
class $f58f44579a4747ac$var$M {
    constructor(t, i){
        this._$AV = [], this._$AN = void 0, this._$AD = t, this._$AM = i;
    }
    get parentNode() {
        return this._$AM.parentNode;
    }
    get _$AU() {
        return this._$AM._$AU;
    }
    u(t) {
        const { el: { content: i }, parts: s } = this._$AD, e = (t?.creationScope ?? $f58f44579a4747ac$var$r).importNode(i, !0);
        $f58f44579a4747ac$var$C.currentNode = e;
        let h = $f58f44579a4747ac$var$C.nextNode(), o = 0, n = 0, l = s[0];
        for(; void 0 !== l;){
            if (o === l.index) {
                let i;
                2 === l.type ? i = new $f58f44579a4747ac$var$R(h, h.nextSibling, this, t) : 1 === l.type ? i = new l.ctor(h, l.name, l.strings, this, t) : 6 === l.type && (i = new $f58f44579a4747ac$var$z(h, this, t)), this._$AV.push(i), l = s[++n];
            }
            o !== l?.index && (h = $f58f44579a4747ac$var$C.nextNode(), o++);
        }
        return $f58f44579a4747ac$var$C.currentNode = $f58f44579a4747ac$var$r, e;
    }
    p(t) {
        let i = 0;
        for (const s of this._$AV)void 0 !== s && (void 0 !== s.strings ? (s._$AI(t, s, i), i += s.strings.length - 2) : s._$AI(t[i])), i++;
    }
}
class $f58f44579a4747ac$var$R {
    get _$AU() {
        return this._$AM?._$AU ?? this._$Cv;
    }
    constructor(t, i, s, e){
        this.type = 2, this._$AH = $f58f44579a4747ac$export$45b790e32b2810ee, this._$AN = void 0, this._$AA = t, this._$AB = i, this._$AM = s, this.options = e, this._$Cv = e?.isConnected ?? !0;
    }
    get parentNode() {
        let t = this._$AA.parentNode;
        const i = this._$AM;
        return void 0 !== i && 11 === t?.nodeType && (t = i.parentNode), t;
    }
    get startNode() {
        return this._$AA;
    }
    get endNode() {
        return this._$AB;
    }
    _$AI(t, i = this) {
        t = $f58f44579a4747ac$var$S(this, t, i), $f58f44579a4747ac$var$c(t) ? t === $f58f44579a4747ac$export$45b790e32b2810ee || null == t || "" === t ? (this._$AH !== $f58f44579a4747ac$export$45b790e32b2810ee && this._$AR(), this._$AH = $f58f44579a4747ac$export$45b790e32b2810ee) : t !== this._$AH && t !== $f58f44579a4747ac$export$9c068ae9cc5db4e8 && this._(t) : void 0 !== t._$litType$ ? this.$(t) : void 0 !== t.nodeType ? this.T(t) : $f58f44579a4747ac$var$u(t) ? this.k(t) : this._(t);
    }
    O(t) {
        return this._$AA.parentNode.insertBefore(t, this._$AB);
    }
    T(t) {
        this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
    }
    _(t) {
        this._$AH !== $f58f44579a4747ac$export$45b790e32b2810ee && $f58f44579a4747ac$var$c(this._$AH) ? this._$AA.nextSibling.data = t : this.T($f58f44579a4747ac$var$r.createTextNode(t)), this._$AH = t;
    }
    $(t) {
        const { values: i, _$litType$: s } = t, e = "number" == typeof s ? this._$AC(t) : (void 0 === s.el && (s.el = $f58f44579a4747ac$var$N.createElement($f58f44579a4747ac$var$P(s.h, s.h[0]), this.options)), s);
        if (this._$AH?._$AD === e) this._$AH.p(i);
        else {
            const t = new $f58f44579a4747ac$var$M(e, this), s = t.u(this.options);
            t.p(i), this.T(s), this._$AH = t;
        }
    }
    _$AC(t) {
        let i = $f58f44579a4747ac$var$A.get(t.strings);
        return void 0 === i && $f58f44579a4747ac$var$A.set(t.strings, i = new $f58f44579a4747ac$var$N(t)), i;
    }
    k(t) {
        $f58f44579a4747ac$var$a(this._$AH) || (this._$AH = [], this._$AR());
        const i = this._$AH;
        let s, e = 0;
        for (const h of t)e === i.length ? i.push(s = new $f58f44579a4747ac$var$R(this.O($f58f44579a4747ac$var$l()), this.O($f58f44579a4747ac$var$l()), this, this.options)) : s = i[e], s._$AI(h), e++;
        e < i.length && (this._$AR(s && s._$AB.nextSibling, e), i.length = e);
    }
    _$AR(t = this._$AA.nextSibling, i) {
        for(this._$AP?.(!1, !0, i); t !== this._$AB;){
            const i = t.nextSibling;
            t.remove(), t = i;
        }
    }
    setConnected(t) {
        void 0 === this._$AM && (this._$Cv = t, this._$AP?.(t));
    }
}
class $f58f44579a4747ac$var$k {
    get tagName() {
        return this.element.tagName;
    }
    get _$AU() {
        return this._$AM._$AU;
    }
    constructor(t, i, s, e, h){
        this.type = 1, this._$AH = $f58f44579a4747ac$export$45b790e32b2810ee, this._$AN = void 0, this.element = t, this.name = i, this._$AM = e, this.options = h, s.length > 2 || "" !== s[0] || "" !== s[1] ? (this._$AH = Array(s.length - 1).fill(new String), this.strings = s) : this._$AH = $f58f44579a4747ac$export$45b790e32b2810ee;
    }
    _$AI(t, i = this, s, e) {
        const h = this.strings;
        let o = !1;
        if (void 0 === h) t = $f58f44579a4747ac$var$S(this, t, i, 0), o = !$f58f44579a4747ac$var$c(t) || t !== this._$AH && t !== $f58f44579a4747ac$export$9c068ae9cc5db4e8, o && (this._$AH = t);
        else {
            const e = t;
            let n, r;
            for(t = h[0], n = 0; n < h.length - 1; n++)r = $f58f44579a4747ac$var$S(this, e[s + n], i, n), r === $f58f44579a4747ac$export$9c068ae9cc5db4e8 && (r = this._$AH[n]), o ||= !$f58f44579a4747ac$var$c(r) || r !== this._$AH[n], r === $f58f44579a4747ac$export$45b790e32b2810ee ? t = $f58f44579a4747ac$export$45b790e32b2810ee : t !== $f58f44579a4747ac$export$45b790e32b2810ee && (t += (r ?? "") + h[n + 1]), this._$AH[n] = r;
        }
        o && !e && this.j(t);
    }
    j(t) {
        t === $f58f44579a4747ac$export$45b790e32b2810ee ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
    }
}
class $f58f44579a4747ac$var$H extends $f58f44579a4747ac$var$k {
    constructor(){
        super(...arguments), this.type = 3;
    }
    j(t) {
        this.element[this.name] = t === $f58f44579a4747ac$export$45b790e32b2810ee ? void 0 : t;
    }
}
class $f58f44579a4747ac$var$I extends $f58f44579a4747ac$var$k {
    constructor(){
        super(...arguments), this.type = 4;
    }
    j(t) {
        this.element.toggleAttribute(this.name, !!t && t !== $f58f44579a4747ac$export$45b790e32b2810ee);
    }
}
class $f58f44579a4747ac$var$L extends $f58f44579a4747ac$var$k {
    constructor(t, i, s, e, h){
        super(t, i, s, e, h), this.type = 5;
    }
    _$AI(t, i = this) {
        if ((t = $f58f44579a4747ac$var$S(this, t, i, 0) ?? $f58f44579a4747ac$export$45b790e32b2810ee) === $f58f44579a4747ac$export$9c068ae9cc5db4e8) return;
        const s = this._$AH, e = t === $f58f44579a4747ac$export$45b790e32b2810ee && s !== $f58f44579a4747ac$export$45b790e32b2810ee || t.capture !== s.capture || t.once !== s.once || t.passive !== s.passive, h = t !== $f58f44579a4747ac$export$45b790e32b2810ee && (s === $f58f44579a4747ac$export$45b790e32b2810ee || e);
        e && this.element.removeEventListener(this.name, this, s), h && this.element.addEventListener(this.name, this, t), this._$AH = t;
    }
    handleEvent(t) {
        "function" == typeof this._$AH ? this._$AH.call(this.options?.host ?? this.element, t) : this._$AH.handleEvent(t);
    }
}
class $f58f44579a4747ac$var$z {
    constructor(t, i, s){
        this.element = t, this.type = 6, this._$AN = void 0, this._$AM = i, this.options = s;
    }
    get _$AU() {
        return this._$AM._$AU;
    }
    _$AI(t) {
        $f58f44579a4747ac$var$S(this, t);
    }
}
const $f58f44579a4747ac$export$8613d1ca9052b22e = {
    M: $f58f44579a4747ac$var$e,
    P: $f58f44579a4747ac$var$h,
    A: $f58f44579a4747ac$var$o,
    C: 1,
    L: $f58f44579a4747ac$var$V,
    R: $f58f44579a4747ac$var$M,
    D: $f58f44579a4747ac$var$u,
    V: $f58f44579a4747ac$var$S,
    I: $f58f44579a4747ac$var$R,
    H: $f58f44579a4747ac$var$k,
    N: $f58f44579a4747ac$var$I,
    U: $f58f44579a4747ac$var$L,
    B: $f58f44579a4747ac$var$H,
    F: $f58f44579a4747ac$var$z
}, $f58f44579a4747ac$var$j = $f58f44579a4747ac$var$t.litHtmlPolyfillSupport;
$f58f44579a4747ac$var$j?.($f58f44579a4747ac$var$N, $f58f44579a4747ac$var$R), ($f58f44579a4747ac$var$t.litHtmlVersions ??= []).push("3.3.1");
const $f58f44579a4747ac$export$b3890eb0ae9dca99 = (t, i, s)=>{
    const e = s?.renderBefore ?? i;
    let h = e._$litPart$;
    if (void 0 === h) {
        const t = s?.renderBefore ?? null;
        e._$litPart$ = h = new $f58f44579a4747ac$var$R(i.insertBefore($f58f44579a4747ac$var$l(), t), t, void 0, s ?? {});
    }
    return h._$AI(t), h;
};

});

parcelRegister("eGUNk", function(module, exports) {
$parcel$export(module.exports, "css", () => (parcelRequire("j8KxL")).css);
$parcel$export(module.exports, "ReactiveElement", () => (parcelRequire("2emM7")).ReactiveElement);
$parcel$export(module.exports, "html", () => (parcelRequire("l56HR")).html);
$parcel$export(module.exports, "noChange", () => (parcelRequire("l56HR")).noChange);
$parcel$export(module.exports, "render", () => (parcelRequire("l56HR")).render);

$parcel$export(module.exports, "LitElement", () => $ab210b2da7b39b9d$export$3f2f9f5909897157);

var $2emM7 = parcelRequire("2emM7");

var $l56HR = parcelRequire("l56HR");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */ const $ab210b2da7b39b9d$var$s = globalThis;
class $ab210b2da7b39b9d$export$3f2f9f5909897157 extends (0, $2emM7.ReactiveElement) {
    constructor(){
        super(...arguments), this.renderOptions = {
            host: this
        }, this._$Do = void 0;
    }
    createRenderRoot() {
        const t = super.createRenderRoot();
        return this.renderOptions.renderBefore ??= t.firstChild, t;
    }
    update(t) {
        const r = this.render();
        this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = (0, $l56HR.render)(r, this.renderRoot, this.renderOptions);
    }
    connectedCallback() {
        super.connectedCallback(), this._$Do?.setConnected(!0);
    }
    disconnectedCallback() {
        super.disconnectedCallback(), this._$Do?.setConnected(!1);
    }
    render() {
        return 0, $l56HR.noChange;
    }
}
$ab210b2da7b39b9d$export$3f2f9f5909897157._$litElement$ = !0, $ab210b2da7b39b9d$export$3f2f9f5909897157["finalized"] = !0, $ab210b2da7b39b9d$var$s.litElementHydrateSupport?.({
    LitElement: $ab210b2da7b39b9d$export$3f2f9f5909897157
});
const $ab210b2da7b39b9d$var$o = $ab210b2da7b39b9d$var$s.litElementPolyfillSupport;
$ab210b2da7b39b9d$var$o?.({
    LitElement: $ab210b2da7b39b9d$export$3f2f9f5909897157
});
const $ab210b2da7b39b9d$export$f5c524615a7708d6 = {
    _$AK: (t, e, r)=>{
        t._$AK(e, r);
    },
    _$AL: (t)=>t._$AL
};
($ab210b2da7b39b9d$var$s.litElementVersions ??= []).push("4.2.1");

});

parcelRegister("dJV7N", function(module, exports) {
/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */ const $a00bca1a101a9088$export$6acf61af03e62db = !1;

});


parcelRegister("dPhcg", function(module, exports) {

$parcel$export(module.exports, "default", () => $a10d60b4def555b4$export$2e2bcd8739ae039);

var $hudnx = parcelRequire("hudnx");
class $a10d60b4def555b4$var$myi18n {
    constructor(){
        this.fallback = "en";
        this.lang = document.querySelector('home-assistant').hass.selectedLanguage;
        this.d = (0, $hudnx.dict);
    }
    _(message, params = []) {
        console.log("Translate " + message + " in " + this.lang);
        let res = this.d[this.lang][message];
        if (res == null) res = this.d[this.fallback][message];
        if (res == null) res = this._("canNotFindTranslation") + message;
        return res;
    }
}
var $a10d60b4def555b4$var$i18n = new $a10d60b4def555b4$var$myi18n();
var $a10d60b4def555b4$export$2e2bcd8739ae039 = $a10d60b4def555b4$var$i18n;

});
parcelRegister("hudnx", function(module, exports) {

$parcel$export(module.exports, "dict", () => $cbaf9dbf0c4a89d3$export$b7eef48498bbd53e);
const $cbaf9dbf0c4a89d3$export$b7eef48498bbd53e = {
    en: {
        canNotFindTranslation: "Can not find translation string: ",
        disabledInHa: "Device disabled in HomeAssistant!"
    },
    fr: {
        canNotFindTranslation: "Traduction introuvable pour: ",
        disabledInHa: "P\xe9riph\xe9rique d\xe9sactiv\xe9 dans HomeAssistant!"
    }
};

});


parcelRegister("6vZH1", function(module, exports) {
parcelRequire("j0ZcV");
var $l56HR = parcelRequire("l56HR");

var $ih117 = parcelRequire("ih117");

var $1Um3j = parcelRequire("1Um3j");
class $4be57e4249dc2092$export$b5d5cf8927ab7262 extends (0, $1Um3j.default) {
    static styles = (0, $ih117.default);
    constructor(hass, label, stateObj){
        super(hass, label, stateObj);
    }
    render() {
        return (0, $l56HR.html)`
        <div class="switch_${this.stateObj.state}" @auxclick="${()=>this.auxclick()}" @contextmenu="${()=>this.contextmenu()}">
   	    <div class="switch_in_${this.stateObj.state}"></div>
        </div>`;
    }
    async _click(e) {
        console.debug("Click ", e.detail, " ", e.timeStamp);
        this._toggle();
    }
    _longclick() {
        console.debug("Long Click");
    }
    _dblclick(e) {
        console.debug("Double click");
    }
    _toggle() {
        if (this.stateObj.state == 'on') this.stateObj.state = 'off';
        else this.stateObj.state = 'on';
         //else
        //TOGGLE switch
        console.debug(this.stateObj.entity_id, " => ", this.stateObj.state);
        this.requestUpdate();
    }
} // end of class
window.customElements.define('common-switch', $4be57e4249dc2092$export$b5d5cf8927ab7262);

});
parcelRegister("ih117", function(module, exports) {

$parcel$export(module.exports, "default", () => $d4da9a7c12391d03$export$2e2bcd8739ae039);
parcelRequire("j0ZcV");
var $j8KxL = parcelRequire("j8KxL");
var $d4da9a7c12391d03$export$2e2bcd8739ae039 = (0, $j8KxL.css)`

:hover{
cursor: pointer;
}

.switch_on{
position :absolute;
border-radius: 30px;
background-color: rgba(255,10,10,0.5);
border: 1px solid red;
width: 100%;
height: 100%;
}

.switch_off{
position :absolute;
border-radius: 30px;
background-color: rgba(175,175,175,0.5);
//border: 1px solid red;
width: 100%;
height: 100%;
}

.switch_in_on{
position :absolute;
left: 50%;
top: -75%;
aspect-ratio: 1/1;
border-radius: 30px;
background-color: rgba(250,250,250,1);
//border: 1px solid red;
width: 60%;
}

.switch_in_off{
position :absolute;
left: -10%;
top: -75%;
aspect-ratio: 1/1;
border-radius: 30px;
background-color: rgba(255,20,20,1);
//border: 1px solid red;
width: 60%;
}


`;

});

parcelRegister("1Um3j", function(module, exports) {

$parcel$export(module.exports, "default", () => $163c208f0715304f$export$2e2bcd8739ae039);
parcelRequire("j0ZcV");
var $eGUNk = parcelRequire("eGUNk");
class $163c208f0715304f$export$2e2bcd8739ae039 extends (0, $eGUNk.LitElement) {
    static get properties() {
        return {
            hass: {},
            label: {
                type: String
            },
            stateObj: {},
            alreadyClicked: {
                type: Boolean
            },
            doubleClick: {
                type: Boolean
            },
            mouseDown: {}
        };
    }
    constructor(hass, label, stateObj){
        super();
        this.hass = hass;
        this.label = label;
        this.stateObj = stateObj;
        //Disable context menu
        this.mouseDown = 0;
        //this.addEventListener("contextmenu", function(e) {e.preventDefault();});
        this.addEventListener("mousedown", function(e) {
            this.mouseDown = e.timeStamp;
        });
        this.addEventListener("click", function(e) {
            if (e.detail === 1) {
                console.debug(e);
                this._click_evt(e);
            } else if (e.detail === 2) {
                this.doubleClick = true;
                this._dblclick(e);
            }
        });
        this.alreadyClicked = false;
        this.doubleClick = false;
    }
    sleep(ms) {
        return new Promise((resolve)=>setTimeout(resolve, ms));
    }
    async _click_evt(e) {
        console.debug(this.mouseDown, '   ', e.timeStamp - this.mouseDown);
        if (e.timeStamp - this.mouseDown > 500) this._longclick(e);
        else {
            await this.sleep(300);
            if (this.doubleClick == true) this.doubleClick = false;
            else this._click(e);
        }
        this.mouseDown = 0;
    }
}
window.customElements.define('my-element', $163c208f0715304f$export$2e2bcd8739ae039);

});


parcelRegister("37d5w", function(module, exports) {

$parcel$export(module.exports, "default", () => $244c2d90fdd5377f$export$2e2bcd8739ae039);
parcelRequire("j0ZcV");
var $j8KxL = parcelRequire("j8KxL");
var $244c2d90fdd5377f$export$2e2bcd8739ae039 = (0, $j8KxL.css)`
.device_bg{
    position: relative;
    top: 0;
    left : 0;
    width: 100%;
    aspect-ratio: 1/1.2;
 //border: 2px solid red;
    }

.device_img{
    position: relative;
    top: 0;
    left : 0;
    width: 100%;
    }

.device_img_disabled{
    position: relative;
    top: 0;
    left : 0;
    width: 100%;
    filter: grayscale(80%);
    }

.disabled_in_ha{
  color: white;
  text-align: center;
  position : absolute;
  width: 100%;
  top:15%;
  left: 0%;
  background-color:rgba(255,0,0,0.5);
}
  
`;

});


parcelRequire("j0ZcV");
var $l56HR = parcelRequire("l56HR");
var $eGUNk = parcelRequire("eGUNk");
class $038fea56b681b6a5$export$2e2bcd8739ae039 {
    constructor(hass){
        this._hass = hass;
        this.main_devices = [];
        this.devices = {};
        this.init_devices();
    }
    device_compare(a, b) {
        if (a.text < b.text) return -1;
        else if (a.text > b.text) return 1;
         // else
        return 0;
    }
    init_devices() {
        console.log(this._hass);
        for(var device_id in this._hass.devices){
            let dev = this._hass.devices[device_id];
            let dev_id = dev.identifiers[0];
            if (Array.isArray(dev_id) && dev_id[0] == 'redsea') {
                // dev.lenght==2 to get only main device, not sub
                if (dev_id.length == 2 && dev.model != 'ReefBeat') this.main_devices.push({
                    value: dev.primary_config_entry,
                    text: dev.name
                });
                if (!Object.getOwnPropertyNames(this.devices).includes(dev.primary_config_entry)) Object.defineProperty(this.devices, dev.primary_config_entry, {
                    value: {
                        name: dev.name,
                        elements: [
                            dev
                        ]
                    }
                });
                else {
                    this.devices[dev.primary_config_entry].elements.push(dev);
                    // Change main device name with main device
                    if (dev_id.length == 2) this.devices[dev.primary_config_entry].name = dev.name;
                     //if
                } //else
            }
        } //for
        this.main_devices.sort(this.device_compare);
        console.log(this.devices);
    }
}


parcelRequire("j0ZcV");
var $j8KxL = parcelRequire("j8KxL");
var $040001cdf6cad6dd$export$2e2bcd8739ae039 = (0, $j8KxL.css)`


.disable{
  background-color: rgba(175,175,175,0.5);
}

div,img{
    flex: 0 0 auto;
    position: absolute;
}

`;


parcelRequire("j0ZcV");
var $l56HR = parcelRequire("l56HR");

var $5c2Je = parcelRequire("5c2Je");
const $0ef451c83bce80a0$export$e506a1d27d1eaa20 = {
    "name": '',
    "model": "NODEVICE",
    "background_img": new URL("NODEVICE.b93b676a.png", import.meta.url)
};


parcelRequire("j0ZcV");
var $j8KxL = parcelRequire("j8KxL");
var $4161d82e68a13a1d$export$2e2bcd8739ae039 = (0, $j8KxL.css)`
.device_bg{
  position: relative;
  top: 0;
  left : 0;
  width: 100%;
//  border: 2px blue solid;
  aspect-ratio: 2/1;
}

.device_img{
  position: relative;
  top: 0;
  left : 0;
  width: 100%;
//  border: 1px black solid;
}
`;


class $020e09b811cd87ab$export$942630849b5196f4 extends (0, $5c2Je.default) {
    static styles = (0, $4161d82e68a13a1d$export$2e2bcd8739ae039);
    device = {
        'elements': [
            {
                'model': 'NODEVICE',
                'name': ''
            }
        ]
    };
    constructor(hass, device){
        //constructor(){
        //var device={'elements':[{'model':'NODEVICE','name':''}]};
        //super(hass,device,config);
        super((0, $0ef451c83bce80a0$export$e506a1d27d1eaa20), hass, device);
    }
    _populate_entities() {}
    render() {
        console.log("pppppp");
        console.log(this.hass);
        console.log(this.device);
        console.log("pppppp");
        return (0, $l56HR.html)`
<p id="device_name">${this.config.name}</p>
<div class="device_bg">
<img class="device_img" src="${this.config.background_img}"/>
</div>
`;
    }
}
window.customElements.define('no-device', $020e09b811cd87ab$export$942630849b5196f4);


parcelRequire("j0ZcV");
var $l56HR = parcelRequire("l56HR");

var $5c2Je = parcelRequire("5c2Je");
const $49eb2fac1cfe7013$export$e506a1d27d1eaa20 = {
    "name": null,
    "model": "RSDOSE4",
    "background_img": new URL("RSDOSE4.d62c95e6.png", import.meta.url),
    "heads_nb": 4,
    "switches": [
        {
            "name": "device_state",
            "type": "hacs",
            "label": false,
            "class": "on_off",
            "style": "switch"
        }
    ],
    "heads": {
        "head_1": {
            "color": "140,67,148",
            "alpha": "0.4",
            "sensors": [
                {
                    "name": "supplement",
                    "left": 1,
                    "top": 80,
                    "rotate": "-90deg",
                    "border_radius": "5px",
                    "background_color": "140,67,148",
                    "color": "white"
                }
            ],
            "switches": [
                {
                    "name": "schedule_enabled",
                    "type": "hacs",
                    "class": "pump_state_head",
                    "style": "button"
                }
            ],
            "buttons": [
                {
                    "name": "manual_head",
                    "class": "manual_dose_head",
                    "type": "hacs"
                },
                {
                    "name": "supplement_info",
                    "type": "ui",
                    "class": "supplement_info"
                }
            ]
        },
        "head_2": {
            "color": "0,129,197",
            "alpha": "0.4",
            "sensors": [],
            "switches": [
                {
                    "name": "schedule_enabled",
                    "type": "hacs",
                    "class": "pump_state_head",
                    "style": "button"
                }
            ],
            "buttons": [
                {
                    "name": "manual_head",
                    "class": "manual_dose_head"
                },
                {
                    "name": "supplement_info",
                    "type": "ui",
                    "class": "supplement_info"
                }
            ]
        },
        "head_3": {
            "color": "0,130,100",
            "alpha": "0.4",
            "sensors": [],
            "switches": [
                {
                    "name": "schedule_enabled",
                    "type": "hacs",
                    "class": "pump_state_head",
                    "style": "button"
                }
            ],
            "buttons": [
                {
                    "name": "manual_head",
                    "class": "manual_dose_head",
                    "type": "hacs"
                },
                {
                    "name": "supplement_info",
                    "type": "ui",
                    "class": "supplement_info"
                }
            ]
        },
        "head_4": {
            "color": "100,160,75",
            "alpha": "0.4",
            "sensors": [],
            "switches": [
                {
                    "name": "schedule_enabled",
                    "type": "hacs",
                    "class": "pump_state_head",
                    "style": "button"
                }
            ],
            "buttons": [
                {
                    "name": "manual_head",
                    "class": "manual_dose_head",
                    "type": "hacs"
                },
                {
                    "name": "supplement_info",
                    "type": "ui",
                    "class": "supplement_info"
                }
            ]
        }
    }
};


parcelRequire("j0ZcV");
var $l56HR = parcelRequire("l56HR");

var $5c2Je = parcelRequire("5c2Je");
parcelRequire("j0ZcV");
var $j8KxL = parcelRequire("j8KxL");
var $12c519d2fc52c039$export$2e2bcd8739ae039 = (0, $j8KxL.css)`


.supplement_info{
position :absolute;
aspect-ratio: 1/2.6;
width : 62%;
top: 49%;
left: 2%;
border-radius: 30px;
}


.manual_dose_head{
 position: absolute;
aspect-ratio: 1/1;
width: 15%;
border-radius: 50%;
top: 5%;
left: 33%;
}

.pump_state_head{
 position: absolute;
 aspect-ratio: 1/1;
 width: 55%;
 border-radius: 50%;
 top: 10%;
 left: 35%;

}

.container{
position: absolute;
top: 41%;
width: 68%;
aspect-ratio: 1/3;
}

img{
 position: absolute;
 width: 100%;
}

.pipe{
  flex: 0 0 auto;
  position: absolute;
  width: 70%;
  top: 32%;
  left: 30%;
//  border : 3px solid gray;
  }

svg{
stroke: black;
}

`;


class $52ce4b1a72fac8d0$export$2e2bcd8739ae039 extends (0, $5c2Je.default) {
    static styles = (0, $12c519d2fc52c039$export$2e2bcd8739ae039);
    static get properties() {
        return {
            entities: {},
            config: {},
            head_id: {}
        };
    }
    constructor(hass, entities, config){
        super();
    }
    _pipe_path() {
        return (0, $l56HR.html)`
		<svg viewBox="0 0 86 56" style="fill:rgb(${this.config.color});">
		    <path d="M 14,0 C 13,12 10,18 7,25 0,34 0,45  0,55 L 12,55 c 0,-8 -0,-16 6,-24 4,-8 8,-17 8,-35 z"></path>
		    <path d="m 62,0 1,39 c 0,2 1,3 2,5 2,2 2,1 4,2 2,0 4,0 6,-2 2,-2 1,-5 2,-7 l 6,-30 -8,0 -3,8 0,-28 z"></path>
		</svg>
`;
    }
    _render_container() {
        console.log(this.hass);
        console.log(this.entities);
        console.log(this.entities['supplement']);
        let supplement = this.hass.states[this.entities['supplement'].entity_id];
        let supplement_uid = this.hass.states[this.entities['supplement_uid'].entity_id];
        let img = null;
        switch(supplement_uid.state){
            case "7d67412c-fde0-44d4-882a-dc8746fd4acb":
                img = new URL("redsea_foundation_A.69ced2e5.png", import.meta.url);
                break;
            case "76830db3-a0bd-459a-9974-76a57d026893":
                img = new URL("redsea_foundation_B.fd69d513.png", import.meta.url);
                break;
            case "f524734e-8651-496e-b09b-640b40fc8bab":
                img = new URL("redsea_foundation_C.3bc03a8d.png", import.meta.url);
                break;
            default:
                img = new URL("generic_container.973c97af.png", import.meta.url);
                break;
        }
        return (0, $l56HR.html)`
<div class="container">
  <img src='${img}'/>
</div>
`;
    }
    render() {
        return (0, $l56HR.html)`
               ${this._render_container()}
   	        <div class="pipe" >
 		  ${this._pipe_path()}
		</div>
${this._render_actuators()}
   	    `;
    }
}
window.customElements.define('dose-head', $52ce4b1a72fac8d0$export$2e2bcd8739ae039);


parcelRequire("j0ZcV");
var $j8KxL = parcelRequire("j8KxL");
var $9e31fe09da958909$export$2e2bcd8739ae039 = (0, $j8KxL.css)`
.on_off{
flex: 0 0 auto;
 position: absolute;
//aspect-ratio: 1/1;
width: 22%;
height: 10%;
border-radius: 50%;
top: 25.8%;
left: 2%;
}

    .head{
    flex: 0 0 auto;
    width: 31%;
height: 100%;
    }

    #head_1{
     left: 1%;
     top: 0%;
//     border: 4px solid red;
     position: absolute;  
    }

    #head_2{
     left: 23%;
     top: 0%;
//border: 4px solid magenta;
position: absolute;
    }

    #head_3{
   left: 44%;
     top: 0%;
//border: 4px solid green;
position: absolute;
    }

    #head_4{
left: 65%;
     top: 0%;
//border: 4px solid blue;
position: absolute;
    }

    .container{
    flex: 0 0 auto;
    position: absolute;
    }

    .mask1{
    flex: 0 0 auto;
    width: 17%;
    position: absolute;
    top: 35%;
    left: 10%;
    }

    .mask2{
    flex: 0 0 auto;
    width: 17%;
    position: absolute;
    top: 36%;
    left: 28%;
    transform: scale(1.1);
    }

    .mask3{
    flex: 0 0 auto;
    width: 17%;
    position: absolute;
    top: 37%;
    left: 48%;
    transform: scale(1.2);
    }
    
    .mask4{
    flex: 0 0 auto;
    width: 17%;
    position: absolute;
    top: 38%;
    left: 69%;
    transform: scale(1.3);
    }

.button{
    flex: 0 0 auto;
    aspect-ratio: 1/1;
    position:absolute;
}

.button:hover{
background-color:rgba(250,0,0,0.5);
}


.sensor {
    flex: 0 0 auto;
position: absolute;
}


    p.RSDOSE4{
    color: red;
    }

    img.RSDOSE4 {
    width: 200px;
    }

    svg {
    stroke: black;
    }
`;



var $37d5w = parcelRequire("37d5w");
class $205242e0eaceda90$export$2e2bcd8739ae039 extends (0, $5c2Je.default) {
    // TODO: RSDOSE Implement basic services
    // Issue URL: https://github.com/Elwinmage/ha-reef-card/issues/13
    //   labels: enhancement, rsdose
    static styles = [
        (0, $9e31fe09da958909$export$2e2bcd8739ae039),
        (0, $37d5w.default)
    ];
    _heads = [];
    constructor(hass, device, user_config){
        super((0, $49eb2fac1cfe7013$export$e506a1d27d1eaa20), hass, device, user_config);
    }
    _populate_entities() {}
    _populate_entities_with_heads() {
        for(let i = 0; i <= this.config.heads_nb; i++)this._heads.push({
            'entities': {}
        });
        for(var entity_id in this.hass.entities){
            var entity = this.hass.entities[entity_id];
            for (var d of this.device.elements){
                var fname = d['name'].split("_");
                var head_id = 0;
                if (fname[fname.length - 2] == "head") head_id = parseInt(fname[fname.length - 1]);
                if (entity.device_id == d.id) {
                    if (head_id == 0) this.entities[entity.translation_key] = entity;
                    else this._heads[head_id].entities[entity.translation_key] = entity;
                }
            }
        }
    }
    _get_val(head, entity_id) {
        console.log("rsdose._get_val: " + entity_id);
        let entity = this.hass.states[this.entities[head][entity_id].entity_id];
        return entity.state;
    }
    _render_head(head_id) {
        return (0, $l56HR.html)`
<div class="head" id="head_${head_id}">
	<dose-head class="head" head_id="head_${head_id}" hass="${this.hass}" entities="${this._heads[head_id].entities}" config="${this.config.heads["head_" + head_id]}" />

</div>
`;
    }
    render() {
        this.update_config();
        // disabled
        let disabled = false;
        let sub_nb = this.device.elements.length;
        for(var i = 0; i < sub_nb; i++)if (this.device.elements[i].disabled_by != null) {
            disabled = true;
            break;
        } // if
         // for
        if (disabled == true) {
            console.log("DISABLED");
            return this._render_disabled();
        } //if
        this._populate_entities_with_heads();
        console.log("000");
        console.log(this.hass);
        console.log(this.device);
        console.log("000");
        return (0, $l56HR.html)`
	<div class="device_bg">
	  <img class="device_img" id="rsdose4_img" alt=""  src='${this.config.background_img}' />
        <div class="heads">
	${Array.from({
            length: this.config.heads_nb
        }, (x, i)=>i + 1).map((head)=>this._render_head(head))}
       </div>
        ${this._render_actuators()}
	</div>`;
    }
}
window.customElements.define('rs-dose4', $205242e0eaceda90$export$2e2bcd8739ae039);


class $bf513b85805031e6$export$8a2b7dacab8abd83 extends (0, $eGUNk.LitElement) {
    static styles = (0, $040001cdf6cad6dd$export$2e2bcd8739ae039);
    static get properties() {
        return {
            hass: {},
            user_config: {},
            select_devices: {
                type: Array
            },
            current_device: {
                type: String
            },
            version: {
                type: String
            },
            progs: {
                type: Array
            },
            devices_list: {},
            current_device: (0, $l56HR.html)``
        };
    }
    constructor(){
        super();
        this.version = 'v0.0.1';
        this.select_devices = [
            {
                value: 'unselected',
                text: "Select a device"
            }
        ];
        this.first_init = true;
    }
    _set_current_device_from_name(dev, name) {
        if (dev['text'] == name) this._set_current_device(dev['value']);
    }
    render() {
        console.log(this.hass);
        if (this.first_init == true) {
            this.init_devices();
            this.first_init = false;
            this.no_device = (0, $l56HR.html)`<no-device id="device" hass="${this.hass}"/>`;
            this.current_device = this.no_device;
        }
        if (this.user_config['device']) {
            this.select_devices.map((dev)=>this._set_current_device_from_name(dev, this.user_config.device));
            return (0, $l56HR.html)`${this.current_device}`;
        }
        return (0, $l56HR.html)`
          ${this.device_select()}
  ${this.current_device}
    `;
    }
    device_select() {
        return (0, $l56HR.html)`
        <select id="device" @change="${this.onChange}">
            ${this.select_devices.map((option)=>(0, $l56HR.html)`
            <option value="${option.value}" ?selected=${this.select_devices === option.value}>${option.text}</option>
            `)}
        </select>
<div class="device">
    `;
    }
    init_devices() {
        this.devices_list = new (0, $038fea56b681b6a5$export$2e2bcd8739ae039)(this.hass);
        for (var d of this.devices_list.main_devices)this.select_devices.push(d);
         // for
    }
    _set_current_device(device_id) {
        console.log('Selected -->', device_id);
        if (device_id == "unselected") {
            this.current_device = this.no_device;
            return;
        }
        var device = this.devices_list.devices[device_id];
        var model = device.elements[0].model;
        //TODO : Implement MAIN tank view support
        //Issue URL: https://github.com/Elwinmage/ha-reef-card/issues/11
        // labels: enhancement
        switch(model){
            //TODO : Implement RSDOSE support
            //Issue URL: https://github.com/Elwinmage/ha-reef-card/issues/10
            // labels: enhancement, rsdose
            case "RSDOSE2":
            //TODO : Implement RSDOSE2 support
            //Issue URL: https://github.com/Elwinmage/ha-reef-card/issues/9
            // labels: enhancement, rsdose, rsdose2
            case "RSDOSE4":
                //TODO : Implement RSDOSE4 support
                //Issue URL: https://github.com/Elwinmage/ha-reef-card/issues/8
                // labels: enhancement, rsdose, rsdose4
                this.current_device = (0, $l56HR.html)`<rs-dose4 id="device" .hass="${this.hass}" .device="${device}" .user_config="${this.user_config}"/>`;
                break;
            case "RSRUN":
                break;
            case "RSWAVE":
                break;
            case "RSMAT":
                break;
            case "RSATO+":
                break;
            //TODO : Implement RSLED support
            //Issue URL: https://github.com/Elwinmage/ha-reef-card/issues/3
            // labels: enhancement, rsled
            case "RSLED50":
            case "RSLED60":
            case "RSLED90":
            case "RSLED115":
            case "RSLED160":
            case "RSLED170":
                break;
            default:
                console.log("Unknow device type: " + model);
        }
    }
    onChange() {
        setTimeout(()=>{
            this.selected = this.shadowRoot.querySelector('#device').value;
            this.current_device = this.no_device;
            if (this.selected == "unselected") console.log('Nothing selected');
            else this._set_current_device(this.selected);
        }, 300);
    }
    // card configuration
    static getConfigElement() {
        return document.createElement("reef-card-editor");
    }
    setConfig(config) {
        console.log("setConfig");
        // if (!config.entities) {
        //   throw new Error("You need to define entities");
        //   }
        this.user_config = config;
    }
}


parcelRequire("j0ZcV");
var $j8KxL = parcelRequire("j8KxL");
var $l56HR = parcelRequire("l56HR");
var $eGUNk = parcelRequire("eGUNk");

class $fc7d6e547b6fcb14$export$d7c6282dbee77504 extends (0, $eGUNk.LitElement) {
    static get properties() {
        return {
            // hass: {},
            _config: {
                state: true
            },
            select_devices: {
                type: Array
            },
            devices_list: {}
        };
    }
    constructor(){
        super();
        this.select_devices = [
            {
                value: 'unselected',
                text: "Select a device"
            }
        ];
        this.first_init = true;
    }
    setConfig(config) {
        this._config = config;
    }
    init_devices() {
        this.devices_list = new (0, $038fea56b681b6a5$export$2e2bcd8739ae039)(this.hass);
        for (var d of this.devices_list.main_devices)this.select_devices.push(d);
         // for
    }
    static styles = (0, $j8KxL.css)`
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
        if (this._config) {
            if (this.first_init == true) {
                this.first_init = false;
                this.init_devices();
            }
            console.log(this._config);
            return (0, $l56HR.html)`
            <form class="table">
                <div class="row">
                    <label class="label cell" for="device">Device:</label>
                    <select id="device" class="value cell" @change="${this.handleChangedEvent}">
                      ${this.select_devices.map((option)=>(0, $l56HR.html)`
                      <option value="${option.value}" ?selected=${this._config.device === option.text}>${option.text}</option>
                        `)}
                   </select>
                </div>
            </form>
        `;
        }
        return (0, $l56HR.html)``;
    }
    handleChangedEvent(changedEvent) {
        // this._config is readonly, copy needed
        var newConfig = Object.assign({}, this._config);
        var elt = this.shadowRoot.getElementById("device");
        let val = 'unselected';
        if (elt.selectedIndex == 0) delete newConfig.device;
        else {
            val = elt.options[elt.selectedIndex].text;
            newConfig.device = val;
        }
        const messageEvent = new CustomEvent("config-changed", {
            detail: {
                config: newConfig
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(messageEvent);
    }
}


customElements.define("reef-card", (0, $bf513b85805031e6$export$8a2b7dacab8abd83));
customElements.define("reef-card-editor", (0, $fc7d6e547b6fcb14$export$d7c6282dbee77504));
window.customCards = window.customCards || [];
window.customCards.push({
    type: "reef-card",
    name: "Reef Tank Card",
    description: "A custom card for reef management."
});


//# sourceMappingURL=ha-reef-card.js.map
