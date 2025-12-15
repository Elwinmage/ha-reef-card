
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

var $1Um3j = parcelRequire("1Um3j");
parcelRequire("6vZH1");
parcelRequire("5T0tY");
parcelRequire("258Ll");
parcelRequire("M8QIC");
parcelRequire("eW6Np");
parcelRequire("303dX");
parcelRequire("iXBpj");

var $37d5w = parcelRequire("37d5w");

var $7Rfxy = parcelRequire("7Rfxy");
let iconv = (0, $dPhcg.default);
class RSDevice extends (0, $eGUNk.LitElement) {
    static styles = [
        (0, $37d5w.default)
    ];
    // Device is updated when hass is updated
    static get properties() {
        return {
            hass: {}
        };
    }
    /*
     * Construct a new Redsea LitElement of type name
     * @name: type of device: redsea-rsdose2, redsea-rswave...
     * @hass: the homeassistant states
     * @config: the user configuration file
     * @device: the hass redsea device 
     */ static create_device(name, hass, config, device) {
        let Element = customElements.get(name);
        if (typeof Element == "undefined") Element = customElements.get("redsea-nodevice");
        let elt = new Element();
        elt.hass = hass;
        elt.user_config = config;
        elt.device = device;
        return elt;
    }
    /*
     * CONSTRUCTOR
     */ constructor(){
        super();
        this.entities = {};
        this.first_init = true;
        this._dialog_box = null;
    }
    /*
     * Load available dialog box for the current device
     */ config_dialog_box() {
        this._dialog_box = (0, $7Rfxy.default);
        this._dialog_box.set_conf(this.config.dialogs);
        this.hass['redsea_dialog_box'] = this._dialog_box;
    }
    /*
     * Return  the hass entity id according to it's translation key
     * Entities list must be populate before with this._populate_entities()
     * @entity_translation_value: a strign representation the translation key of the entity
     */ get_entity(entity_translation_value) {
        return this.hass.states[this.entities[entity_translation_value].entity_id];
    }
    /*
     * Find leaves on a json configuration object
     * @tree: the current json object to search for
     * @path: the path to search for leaves
     */ find_leaves(tree, path) {
        var keys = Object.keys(tree);
        if (keys[0] == '0') {
            eval(path + '="' + tree + '"');
            return;
        } //if
        for (var key of keys){
            let sep = '.';
            let ipath = path + sep + key;
            this.find_leaves(tree[key], ipath);
        } //for
    }
    /*
     * Update default configuration with user values changes
     */ update_config() {
        this.config = JSON.parse(JSON.stringify(this.initial_config));
        if (this.user_config && "conf" in this.user_config) {
            if (this.device.elements[0].model in this.user_config.conf) {
                let device_conf = this.user_config.conf[this.device.elements[0].model];
                if ('common' in device_conf) this.find_leaves(device_conf['common'], "this.config");
                 //if
                if ('devices' in device_conf && this.device.name in device_conf.devices) this.find_leaves(device_conf['devices'][this.device.name], "this.config");
            } //if
        } //if
    }
    /*
     * Get all entities linked to this redsea device
     */ _populate_entities() {
        for(var entity_id in this.hass.entities){
            var entity = this.hass.entities[entity_id];
            if (entity.device_id == this.device.elements[0].id) this.entities[entity.translation_key] = entity;
             //if
        } //for
    }
    /*
     * Check is the current device is disabled or not
     */ is_disabled() {
        let disabled1 = false;
        let sub_nb = this.device.elements.length;
        for(var i = 0; i < sub_nb; i++)if (this.device.elements[i].disabled_by != null) {
            disabled1 = true;
            break;
        } // if
         // for
        return disabled1;
    }
    /*
     * Get the state of the device on or off.
     */ is_on() {
        return this.hass.states[this.entities['device_state'].entity_id].state == 'on';
    }
    /*
     * Special render if the device is disabled or in maintenance mode in HA
     */ _render_disabled() {
        let reason = null;
        let maintenance = '';
        if (this.is_disabled()) reason = "disabledInHa";
        else if (this.hass.states[this.entities['maintenance'].entity_id].state == 'on') {
            reason = "maintenance";
            // if in maintenance mode, display maintenance switch
            for (let swtch of this.config.elements)if (swtch.name == "maintenance") {
                let maintenance_button = (0, $1Um3j.default).create_element(this.hass, swtch, this.config.color, this.config.alpha, true, this.entities);
                maintenance = (0, $l56HR.html)`
                                    <div class="${swtch.class}" style="${this.get_style(swtch)}">
                                      ${maintenance_button}
                                    </div>
                                    `;
                break;
            } //if
             //for
        } // else if
        if (reason == null) return reason;
        return (0, $l56HR.html)`<div class="device_bg">
                      <img class="device_img_disabled" id=d_img" alt=""  src='${this.config.background_img}'/>
                      <p class='disabled_in_ha'>${(0, $dPhcg.default)._(reason)}</p>
                         ${maintenance}
                    </div">`;
    }
    /*
     * Build a css style string according to given json configuration
     * @conf: the css definition
     */ get_style(conf) {
        let style = '';
        if (conf && 'css' in conf) style = Object.entries(conf.css).map(([k, v])=>`${k}:${v}`).join(';');
        return style;
    }
    /*
     * Render a sungle element: switch, sensor...
     * @conf: the json configuration for the element
     * @state: the state of the device on or off to adapt the render
     * @put_in: a grouping div to put element on
     */ _render_element(conf, state, put_in) {
        let sensor_put_in = null;
        //Element is groupped with others 
        if ("put_in" in conf) sensor_put_in = conf.put_in;
         //if
        //Element is disabled or not i nthe requested group
        if ('disabled' in conf && disabled == true || sensor_put_in != put_in) return (0, $l56HR.html)``;
         //if
        let element = (0, $1Um3j.default).create_element(this.hass, conf, this.config.color, this.config.alpha, state, this.entities);
        return (0, $l56HR.html)`
                     <div class="${conf.class}" style="${this.get_style(conf)}">
                       ${element}
                     </div>
                     `;
    }
    /*
     * Render all elements that are declared in the configuration of the device
     * @state: the state of the device on or off to adapt the render
     * @put_in: a grouping div to put element on
     */ _render_elements(state, put_in = null) {
        return (0, $l56HR.html)`
                     ${this.config.elements.map((conf)=>this._render_element(conf, state, put_in))}
                     `;
    }
} //end of class RSDevice
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
        disabledInHa: "Device disabled in HomeAssistant!",
        head: "Head",
        heads_colors: "Heads Colors",
        doses: "Doses",
        days_left: "Remaining Days",
        empty: "Empty",
        maintenance: "Maintenance in progress..",
        set_manual_head_volume: "Manual volume",
        exit: "Done",
        set_manual_head_volume: "Manual volume dosing"
    },
    fr: {
        canNotFindTranslation: "Traduction introuvable pour: ",
        disabledInHa: "P\xe9riph\xe9rique d\xe9sactiv\xe9 dans HomeAssistant!",
        head: "T\xeate",
        heads_colors: "Couleur des t\xeates",
        doses: "Doses",
        days_left: "Jours restant",
        empty: "Vide",
        maintenance: "Maintenance en cours...",
        set_manual_head_volume: "Volume manuel",
        exit: "Terminer",
        set_manual_head_volume: "Dosage du volume manuel"
    }
};

});


parcelRegister("1Um3j", function(module, exports) {

$parcel$export(module.exports, "default", () => MyElement);
parcelRequire("j0ZcV");
var $l56HR = parcelRequire("l56HR");
var $eGUNk = parcelRequire("eGUNk");

var $iXBpj = parcelRequire("iXBpj");
class MyElement extends (0, $eGUNk.LitElement) {
    static get properties() {
        return {
            //	    conf: {},
            stateObj: {},
            color: {},
            doubleClick: {
                type: Boolean
            },
            mouseDown: {}
        };
    }
    constructor(){
        super();
        // this.hass=hass;
        // this.conf=conf;
        // this.color=color;
        // this.alpha=alpha;
        // this.stateObj=stateObj;
        // this.entities=entities;
        this.mouseDown = 0;
        this.mouseUp = 0;
        this.oldMouseUp = 0;
        this.addEventListener("contextmenu", function(e) {
            e.preventDefault();
        });
        this.addEventListener("mousedown", function(e) {
            this.mouseDown = e.timeStamp;
        });
        this.addEventListener("touchstart", function(e) {
            this.mouseDown = e.timeStamp;
        });
        this.addEventListener("touchend", function(e) {
            this.mouseUp = e.timeStamp;
            if (e.timeStamp - this.mouseDown > 500) this._click_evt(e);
        });
        this.addEventListener("click", function(e) {
            this._handleClick(e);
        });
    }
    // updated(changes){
    // 	console.log("RE-RENDERED element");
    // }
    static create_element(hass, config, color, alpha, state, entities) {
        let Element = customElements.get(config.type);
        let label_name = '';
        // Don not display label
        if ('label' in config) {
            if (typeof config.label === 'string') label_name = config.label;
            else if (typeof config.label === 'boolean' && config.label != false) label_name = config.name;
        }
        if (!state) color = (0, $iXBpj.off_color);
        let elt = new Element();
        elt.hass = hass;
        elt.conf = config;
        elt.color = color;
        elt.alpha = alpha;
        elt.stateObj = hass.states[entities[config.name].entity_id];
        if ("target" in config) {
            elt.stateObjTarget = hass.states[entities[config.target].entity_id];
            elt.entities = entities;
        }
        elt.label = label_name;
        return elt;
    }
    get_entity(entity_translation_value) {
        return this.hass.states[this.entities[entity_translation_value].entity_id];
    }
    _handleClick(e) {
        if (e.pointerType != "touch") {
            if (e.detail === 1) this._click_evt(e);
            else if (e.detail === 2) {
                this.doubleClick = true;
                this._dblclick(e);
            }
        } else {
            if (this.mouseUp - this.oldMouseUp < 400) {
                this.doubleClick = true;
                this._dblclick(e);
            } else this._click_evt(e);
            this.oldMouseUp = this.mouseUp;
        }
    }
    sleep(ms) {
        return new Promise((resolve)=>setTimeout(resolve, ms));
    }
    render() {
        let value = null;
        if (this.stateObj != null) value = this.stateObj.state;
        if ('disabled_if' in this.conf && eval(this.conf.disabled_if)) return (0, $l56HR.html)`<br />`;
        return this._render();
    }
    async run_action(action) {
        if (!("enabled" in action) || action.enabled) {
            if (action.domain == "redsea_ui") switch(action.action){
                case "dialog":
                    this.hass.redsea_dialog_box.display(action.data.type, this);
                    break;
                case "exit-dialog":
                    this.hass.redsea_dialog_box.quit();
                    break;
                case "message_box":
                    this.msgbox(action.data);
                    break;
                default:
                    let error_str = "Error: try to run unknown redsea_ui action: " + action.action;
                    this.msgbox(error_str);
                    console.error(error_str);
                    break;
            } //switch
            else {
                if (action.data == "default") action.data = {
                    "entity_id": this.stateObj.entity_id
                };
                console.debug("Call Service", action.domain, action.action, action.data);
                this.hass.callService(action.domain, action.action, action.data);
            } //else -- ha domain action
        } //if -- enabled
    }
    async _click_evt(e) {
        let timing = e.timeStamp - this.mouseDown;
        if (e.timeStamp - this.mouseDown > 500) this._longclick(e);
        else {
            await this.sleep(300);
            if (this.doubleClick == true) this.doubleClick = false;
            else this._click(e);
        }
        this.mouseDown = e.timeStamp;
    }
    _click(e) {
        if ('tap_action' in this.conf) this.run_action(this.conf.tap_action);
    }
    _longclick(e) {
        if ("hold_action" in this.conf) this.run_action(this.conf.hold_action);
    }
    _dblclick(e) {
        if ("double_tap_action" in this.conf) this.run_action(this.conf.double_tap_action);
    }
    dialog(type) {
        this.hass.redsea_dialog_box.display(type);
    }
    msgbox(msg) {
        this.dispatchEvent(new CustomEvent("hass-notification", {
            bubbles: true,
            composed: true,
            detail: {
                message: msg
            }
        }));
        return;
    }
}
window.customElements.define('my-element', MyElement);

});
parcelRegister("iXBpj", function(module, exports) {

$parcel$export(module.exports, "default", () => $038fea56b681b6a5$export$2e2bcd8739ae039);
$parcel$export(module.exports, "hexToRgb", () => $038fea56b681b6a5$export$5a544e13ad4e1fa5);
$parcel$export(module.exports, "rgbToHex", () => $038fea56b681b6a5$export$34d09c4a771c46ef);
$parcel$export(module.exports, "updateObj", () => $038fea56b681b6a5$export$6fb918aa09a6c9f0);
$parcel$export(module.exports, "off_color", () => $038fea56b681b6a5$export$b0583e47501ff17b);
$parcel$export(module.exports, "toTime", () => $038fea56b681b6a5$export$d33f79e3ffc3dc83);
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
    get_by_name(name) {
        for (var id of this.main_devices){
            if (id.text == name) return this.devices[id.value];
             //if
        } //for
    }
    init_devices() {
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
    }
}
function $038fea56b681b6a5$export$5a544e13ad4e1fa5(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    var rgb = parseInt(result[1], 16) + "," + parseInt(result[2], 16) + "," + parseInt(result[3], 16);
    /*    return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
    } : null;*/ return rgb;
}
function $038fea56b681b6a5$export$34d09c4a771c46ef(orig) {
    var regex_hex, regex_trim, color, regex_rgb, matches, hex;
    // Remove whitespace
    regex_trim = new RegExp(/[^#0-9a-f\.\(\)rgba]+/gim);
    color = orig.replace(regex_trim, ' ').trim();
    // Check if already hex
    regex_hex = new RegExp(/#(([0-9a-f]{1})([0-9a-f]{1})([0-9a-f]{1}))|(([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2}))/gi);
    if (regex_hex.exec(color)) return color;
    // Extract RGB values
    regex_rgb = new RegExp(/rgba?\([\t\s]*([0-9]{1,3})[\t\s]*[, ][\t\s]*([0-9]{1,3})[\t\s]*[, ][\t\s]*([0-9]{1,3})[\t\s]*([,\/][\t\s]*[0-9\.]{1,})?[\t\s]*\);?/gim);
    matches = regex_rgb.exec(orig);
    if (matches) {
        hex = '#' + (matches[1] | 256).toString(16).slice(1) + (matches[2] | 256).toString(16).slice(1) + (matches[3] | 256).toString(16).slice(1);
        return hex;
    } else return orig;
}
function $038fea56b681b6a5$export$6fb918aa09a6c9f0(obj, newVal) {
    var keys = Object.keys(newVal);
    var n = obj;
    if (keys.length > 0) {
        if (!(keys[0] in obj)) {
            obj[keys[0]] = newVal[keys[0]];
            return;
        }
        $038fea56b681b6a5$export$6fb918aa09a6c9f0(obj[keys[0]], newVal[keys[0]]);
    }
    return;
}
var $038fea56b681b6a5$export$b0583e47501ff17b = "150,150,150";
function $038fea56b681b6a5$export$d33f79e3ffc3dc83(time) {
    let seconds = time % 60;
    let minutes = (time - seconds) / 60 % 60;
    let hours = (time - seconds - minutes * 60) / 3600;
    return String(hours).padStart(2, '0') + ":" + String(minutes).padStart(2, '0') + ":" + String(seconds).padStart(2, '0');
}

});


parcelRegister("6vZH1", function(module, exports) {
parcelRequire("j0ZcV");
var $l56HR = parcelRequire("l56HR");

var $ih117 = parcelRequire("ih117");

var $1Um3j = parcelRequire("1Um3j");
class $4be57e4249dc2092$export$b5d5cf8927ab7262 extends (0, $1Um3j.default) {
    static styles = (0, $ih117.default);
    static get properties() {
        return {
            label: {}
        };
    }
    /*
     * conf the conf in mapping file
     * stateObj the hass element 
     */ constructor(hass, conf, stateObj, color = "255,255,255", alpha = 1, label){
        super(hass, conf, stateObj, color, alpha);
        this.label = label;
    }
    _render() {
        if (this.conf.style == "switch") return (0, $l56HR.html)`
        <div class="switch_${this.stateObj.state}">
   	    <div class="switch_in_${this.stateObj.state}"></div>
        </div>`;
        else if (this.conf.style == "button") {
            if ('color' in this.conf) this.color = this.conf.color;
            if ('alpha' in this.conf) this.alpha = this.conf.alpha;
            return (0, $l56HR.html)`
                     <style>
                       #${this.conf.name}{
                          background-color: rgba(${this.color},${this.alpha});
                       }   
                     </style>
                     <div class="switch_button"  id="${this.conf.name}">${this.label}</div>
`;
        } else console.error("Switch style " + this.conf.style + " unknown for " + this.conf.name);
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
  width: 100%;
  height: 100%;
}

.switch_in_on{
  position :absolute;
  left: 38%;
  top: -20%;
  aspect-ratio: 1/1;
  border-radius: 30px;
  background-color: rgba(250,250,250,1);
  width: 60%;
}

.switch_in_off{
  position :absolute;
  left: 0%;
  top: -25%;
  aspect-ratio: 1/1;
  border-radius: 30px;
  background-color: rgba(255,20,20,1);
  width: 60%;
}

.switch_button{
  aspect-ratio: 1/1;
  width: 100%;
  height:100%;
  border-radius: 50%;
  color: white;
  text-align:center;
}
`;

});


parcelRegister("5T0tY", function(module, exports) {
parcelRequire("j0ZcV");
var $l56HR = parcelRequire("l56HR");

var $f5LQx = parcelRequire("f5LQx");

var $1Um3j = parcelRequire("1Um3j");
parcelRequire("9HhHn");
class $4492769e229d8dfa$export$353f5b6fc5456de1 extends (0, $1Um3j.default) {
    static styles = [
        (0, $f5LQx.default)
    ];
    /*
     * conf the conf in mapping file
     * stateObj the hass element 
     */ constructor(hass, conf, stateObj, color = "255,255,255", alpha = 1){
        super(hass, conf, stateObj, color, alpha);
    }
    _render() {
        let label = '';
        let sclass = 'button';
        if ('label' in this.conf) label = this.conf.label;
        if ('class' in this.conf) sclass = this.conf.class;
        return (0, $l56HR.html)`
 <style>
.button{
background-color: rgba(${this.color},${this.alpha});
}
</style>
   	    <div class="button" id="${this.conf.name}">${label}</div>
`;
    }
} // end of class
window.customElements.define('common-button', $4492769e229d8dfa$export$353f5b6fc5456de1);

});
parcelRegister("f5LQx", function(module, exports) {

$parcel$export(module.exports, "default", () => $afcc6ff40448b8c3$export$2e2bcd8739ae039);
parcelRequire("j0ZcV");
var $j8KxL = parcelRequire("j8KxL");
var $afcc6ff40448b8c3$export$2e2bcd8739ae039 = (0, $j8KxL.css)`

:hover{
  cursor: pointer;
}

.button{
  width:100%;
  height:100%;
  border-radius: 30px;
}

.dialog_button:hover{
  background-color: #006787;
}

.dialog_button{
  border-radius: 20px;
  background-color: #009ac7;
  color: white;
  font-weight: bold;
  padding-top: 10px;
  padding-bottom: 10px;
  padding-left: 20px;
  padding-right: 20px;
  display:inline-block;
}
.
`;

});

parcelRegister("9HhHn", function(module, exports) {
parcelRequire("j0ZcV");
var $l56HR = parcelRequire("l56HR");

var $jMR4F = parcelRequire("jMR4F");

var $1Um3j = parcelRequire("1Um3j");
/*
 *  MoreInfo
 */ class $70f5dbc919a9d6f3$var$MoreInfo extends (0, $1Um3j.default) {
    static styles = (0, $jMR4F.default);
    static get properties() {
        return {
            _hass: {},
            shadowRoot: {}
        };
    }
    /*
     * conf the conf in mapping file
     * stateObj the hass element 
     */ constructor(){
        super(null);
    }
    init(hass, shadowRoot) {
        this._hass = hass;
        this._shadowRoot = shadowRoot;
    }
    set hass(obj) {
        this._hass = obj; // Don't set it to the same name or you'll cause an infinite loop
    // Add code here that handles a change in the hass object
    }
    display(title, content) {
        let more_info = this._shadowRoot.querySelector("#window-mask");
        //	more_info.hidden=false;
        let more_info_head = this._shadowRoot.querySelector("#moreinfo-title");
        more_info_head.innerHTML = title;
        let more_info_content = this._shadowRoot.querySelector("#moreinfo-content");
        //more_info_content.innerHTML=content;
        let config = {
            'entity-id': "button.rsdose4_2759459771_fetch_config"
        };
        more_info_content.innerHTML = '<hui-generic-entity-row .hass="${this._hass}" .config="${config}" no-secondary/>';
        more_info.style.display = "flex";
    }
    render() {
        return (0, $l56HR.html)`
          <div id="window-mask" hidden>
   	    <div id="moreinfo">
Hello i'm here
              <div id="moreinfo-close">X</div>
              <div id="moreinfo-title">Head</div>
              <div id="moreinfo-content"></div>
            </div>
         </div>
`;
    }
    async _click(e) {
        console.debug("Click ", e.detail, " ", e.timeStamp);
    }
    async _longclick(e) {
        console.debug("Long Click");
    }
    async _dblclick(e) {
        console.debug("Double click");
    }
} // end of class
window.customElements.define('my-moreinfo', $70f5dbc919a9d6f3$var$MoreInfo);
var $70f5dbc919a9d6f3$var$moreinfo = new $70f5dbc919a9d6f3$var$MoreInfo();
var $70f5dbc919a9d6f3$export$2e2bcd8739ae039 = $70f5dbc919a9d6f3$var$moreinfo;

});
parcelRegister("jMR4F", function(module, exports) {

$parcel$export(module.exports, "default", () => $e67bab7b1c812f74$export$2e2bcd8739ae039);
parcelRequire("j0ZcV");
var $j8KxL = parcelRequire("j8KxL");
var $e67bab7b1c812f74$export$2e2bcd8739ae039 = (0, $j8KxL.css)`

#window-mask{
position: absolute;
top: 0px;
left: 0px;
width: 100%;
height: 100%;
//text-align:center;
background-color: rgba(175,175,175,0.8);
border: 1px solid green;
z-index:98;
//display: flex hidden;
display: none;
justify-content: center;
align-items: center;

}


#moreinfo{
border: 1px solid gray;
z-index:99;
//position:absolute;
//margin-top:15%;
//margin-left:35%;
//margin-right:35%;
//min-height: 200px;
//min-width: 300px;
//width:30%;
background-color: rgba(255,255,255,1);
border-radius:30px;

justify-content: center;
align-items: center; 
}

#moreinfo-title{
height: 50px;
text-align: center;
}

#moreinfo-content{
text-align: center;
}

`;

});



parcelRegister("258Ll", function(module, exports) {

$parcel$export(module.exports, "Sensor", () => Sensor);
parcelRequire("j0ZcV");
var $l56HR = parcelRequire("l56HR");

var $ircx4 = parcelRequire("ircx4");

var $1Um3j = parcelRequire("1Um3j");
parcelRequire("dPhcg");
class Sensor extends (0, $1Um3j.default) {
    static styles = (0, $ircx4.default);
    /*
     * conf the conf in mapping file
     * stateObj the hass element 
     */ constructor(hass, conf, stateObj, color = "255,255,255", alpha = 1){
        super(hass, conf, stateObj, color, alpha);
    }
    _render() {
        let value = this.stateObj.state;
        if (this.conf.force_integer) value = Math.floor(value);
        let sensor_class = "sensor";
        if ("class" in this.conf) sensor_class = this.conf.class;
        let unit = '';
        if ("unit" in this.conf) unit = eval(this.conf.unit);
        else if ('unit_of_measurement' in this.stateObj.attributes) unit = this.stateObj.attributes.unit_of_measurement;
        return (0, $l56HR.html)`
<style>
.sensor{
background-color: rgba(${this.color},${this.alpha});
}   
</style>
   	    <div class="${sensor_class}" id="${this.conf.name}">${this.conf.prefix}${value}<span class="unit">${unit}</span></div>
`;
    }
} // end of class
window.customElements.define('common-sensor', Sensor);

});
parcelRegister("ircx4", function(module, exports) {

$parcel$export(module.exports, "default", () => $d6c47842c28a305f$export$2e2bcd8739ae039);
parcelRequire("j0ZcV");
var $j8KxL = parcelRequire("j8KxL");
var $d6c47842c28a305f$export$2e2bcd8739ae039 = (0, $j8KxL.css)`

:hover{
cursor: pointer;
}

div#manual_head_volume{
  border-radius: 30px;
  text-align: center;
  padding-left: 5px;
  padding-right: 5px;
}

span.unit{
font-size: 0.6em;
}
`;

});


parcelRegister("M8QIC", function(module, exports) {
parcelRequire("j0ZcV");
var $l56HR = parcelRequire("l56HR");

var $3wGyI = parcelRequire("3wGyI");

var $dPhcg = parcelRequire("dPhcg");
parcelRequire("iXBpj");

var $1Um3j = parcelRequire("1Um3j");
class ProgressBar extends (0, $1Um3j.default) {
    static styles = (0, $3wGyI.default);
    static get properties() {
        return {
            stateObjTarget: {}
        };
    }
    /*
     * conf the conf in mapping file
     * stateObj the hass element 
     */ constructor(hass, conf, stateObj, stateObjTarget, entities, color = "255,255,255", alpha = 1){
        super(hass, conf, stateObj, entities, color, alpha);
        this.stateObjTarget = stateObjTarget;
    }
    render() {
        if ('disabled_if' in this.conf && eval(this.conf.disabled_if)) return (0, $l56HR.html)`<br />`;
        let iconv = (0, $dPhcg.default);
        let value = this.stateObj.state;
        let target = this.stateObjTarget.state;
        let percent = Math.floor(this.stateObj.state * 100 / this.stateObjTarget.state);
        let bar_class = this.conf.class;
        let label = '';
        if ('label' in this.conf) label = eval(this.conf.label);
        let unit = "%";
        let fill = percent - 1;
        if (fill < 0) fill = 0;
        return (0, $l56HR.html)`
<style>
div.progress{
background-color: rgba(${this.color},0.8);
}   
</style>
   	    <div class="bar" id="${this.conf.name}" style="background-color:rgba(150,150,150,0.7)">
       	      <div class="progress" id="${this.conf.name}" style="width:${fill}%;height:100;">&nbsp</div>
              <label class="progress-bar"};" >${percent}${unit} - ${label}</label>
            </div>
`;
    }
    async _click(e) {
        console.debug("Click ", e.detail, " ", e.timeStamp);
    }
    async _longclick(e) {
        console.debug("Long Click");
    }
    async _dblclick(e) {
        console.debug("Double click");
    }
} // end of class
window.customElements.define('progress-bar', ProgressBar);

});
parcelRegister("3wGyI", function(module, exports) {

$parcel$export(module.exports, "default", () => $29155f8d556df6b9$export$2e2bcd8739ae039);
parcelRequire("j0ZcV");
var $j8KxL = parcelRequire("j8KxL");
var $29155f8d556df6b9$export$2e2bcd8739ae039 = (0, $j8KxL.css)`

div.bar{
border-radius: 20px;
border: 1px solid white;
}

div.progress{
font-size: 0.8em;
border-radius: 20px;
border: 1px solid black;
font-weight: bold;
}

label.progress-bar{
position: absolute;
top:0px;
color: white;
padding-left: 5px;
}
`;

});


parcelRegister("eW6Np", function(module, exports) {
parcelRequire("j0ZcV");
var $l56HR = parcelRequire("l56HR");

var $8UuCG = parcelRequire("8UuCG");

var $dPhcg = parcelRequire("dPhcg");
parcelRequire("iXBpj");

var $1Um3j = parcelRequire("1Um3j");
class ProgressCircle extends (0, $1Um3j.default) {
    static styles = (0, $8UuCG.default);
    static get properties() {
        return {
            stateObjTarget: {}
        };
    }
    /*
     * conf the conf in mapping file
     * stateObj the hass element 
     */ constructor(hass, conf, stateObj, stateObjTarget, entities, color = "255,255,255", alpha = 1){
        super(hass, conf, stateObj, entities, color, alpha);
        this.stateObjTarget = stateObjTarget;
    }
    render() {
        if ('disabled_if' in this.conf && eval(this.conf.disabled_if)) return (0, $l56HR.html)`<br />`;
        let iconv = (0, $dPhcg.default);
        let value = this.stateObj.state;
        let target = this.stateObjTarget.state;
        let percent = 100;
        if (parseFloat(value) < parseFloat(target)) percent = Math.floor(this.stateObj.state * 100 / this.stateObjTarget.state);
         //if
        let circle_class = this.conf.class;
        let label = '';
        if ('label' in this.conf) label = eval(this.conf.label);
        let style = '';
        if ('no_value' in this.conf && this.conf.no_value) style = "visibility: hidden;";
        let unit = "%";
        let fill = percent - 2;
        if (fill < 0) fill = 0;
        // range 0 to 565 for 200x200
        return (0, $l56HR.html)`
   <svg width="100%" height="100%" viewBox="-25 -25 250 250" version="1.1" xmlns="http://www.w3.org/2000/svg" style="transform:rotate(-90deg)">
    <circle r="90" cx="100" cy="100" fill="transparent" stroke="rgba(150,150,150,0.6)" stroke-width="16px"></circle>
    <circle r="90" cx="100" cy="100" stroke="rgb(${this.color})" stroke-width="16px" stroke-linecap="round" stroke-dashoffset="${565 - percent * 565 / 100}px" fill="transparent" stroke-dasharray="565.48px"></circle>
<text x="71px" y="115px" fill="#6bdba7" font-size="52px" font-weight="bold" style="${style} transform:rotate(90deg) translate(0px, -196px)">${percent}</text>
  </svg>
`;
    }
    async _click(e) {
        console.debug("Click ", e.detail, " ", e.timeStamp);
    }
    async _longclick(e) {
        console.debug("Long Click");
    }
    async _dblclick(e) {
        console.debug("Double click");
    }
} // end of class
window.customElements.define('progress-circle', ProgressCircle);

});
parcelRegister("8UuCG", function(module, exports) {

$parcel$export(module.exports, "default", () => $67cb4ebff6d1e8be$export$2e2bcd8739ae039);
parcelRequire("j0ZcV");
var $j8KxL = parcelRequire("j8KxL");
var $67cb4ebff6d1e8be$export$2e2bcd8739ae039 = (0, $j8KxL.css)`
`;

});


parcelRegister("303dX", function(module, exports) {
parcelRequire("j0ZcV");
var $l56HR = parcelRequire("l56HR");

var $hktH6 = parcelRequire("hktH6");

var $dPhcg = parcelRequire("dPhcg");

var $258Ll = parcelRequire("258Ll");
class SensorTarget extends (0, $258Ll.Sensor) {
    static styles = (0, $hktH6.default);
    static get properties() {
        return {
            stateObjTarget: {}
        };
    }
    /*
     * conf the conf in mapping file
     * stateObj the hass element 
     */ constructor(hass, conf, stateObj, stateObjTarget, color = "255,255,255", alpha = 1){
        super(hass, conf, stateObj, color, alpha);
        this.stateObjTarget = stateObjTarget;
    }
    _render() {
        let value = this.stateObj.state;
        let target = this.stateObjTarget.state;
        if (this.conf.force_integer) {
            value = Math.floor(value);
            target = Math.floor(target);
        }
        let sensor_class = "sensor";
        if ("class" in this.conf) sensor_class = this.conf.class;
        let unit = this.stateObj.attributes.unit_of_measurement;
        if ("unit" in this.conf) {
            let iconv = (0, $dPhcg.default);
            unit = eval(this.conf.unit);
        }
        return (0, $l56HR.html)`
   	    <div class="${sensor_class}" id="${this.conf.name}">${value}/${target}<span class="unit">${unit}</span></div>
`;
    }
    async _click(e) {
        console.debug("Click ", e.detail, " ", e.timeStamp);
    }
    async _longclick(e) {
        console.debug("Long Click");
    }
    async _dblclick(e) {
        console.debug("Double click");
    }
} // end of class
window.customElements.define('common-sensor-target', SensorTarget);

});
parcelRegister("hktH6", function(module, exports) {

$parcel$export(module.exports, "default", () => $c9db568cd005a8f3$export$2e2bcd8739ae039);
parcelRequire("j0ZcV");
var $j8KxL = parcelRequire("j8KxL");
var $c9db568cd005a8f3$export$2e2bcd8739ae039 = (0, $j8KxL.css)`
span.unit{
font-size: 0.6em;
}
`;

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

parcelRegister("7Rfxy", function(module, exports) {

$parcel$export(module.exports, "default", () => $5b89899a4a720bff$export$2e2bcd8739ae039);
parcelRequire("j0ZcV");
var $l56HR = parcelRequire("l56HR");
var $eGUNk = parcelRequire("eGUNk");

var $dPhcg = parcelRequire("dPhcg");

var $4DorC = parcelRequire("4DorC");
parcelRequire("93DQX");

var $kgVGZ = parcelRequire("kgVGZ");
class $5b89899a4a720bff$export$3ddf2d174ce01153 extends (0, $eGUNk.LitElement) {
    static styles = [
        (0, $4DorC.default),
        (0, $kgVGZ.default)
    ];
    static get properties() {
        return {
            _hass: {},
            _shadowRoot: {},
            to_render: {},
            elt: {}
        };
    }
    /*
     * conf the conf in mapping file
     * stateObj the hass element 
     */ constructor(){
        super();
        this._hass = null;
        this._shadowRoot = null;
        this.config = null;
        this.elt = null;
        this.to_render = null;
    }
    init(hass, shadowRoot) {
        this._hass = hass;
        this._shadowRoot = shadowRoot;
    }
    display(type, elt = null) {
        let box = this._shadowRoot.querySelector("#window-mask");
        console.debug("ELEMENT", elt);
        this.elt = elt;
        this.to_render = this.config[type];
        this.render();
        box.style.display = "flex";
    }
    quit() {
        this._shadowRoot.querySelector("#window-mask").style.display = "none";
        this.elt = null;
        this.to_render = null;
    }
    set_conf(config) {
        this.config = config;
    }
    _render_content(content_conf) {
        const r_element = customElements.get(content_conf.view);
        const content = new r_element();
        // translate from translation_key to entity_id
        content.setConfig(content_conf.conf);
        content.hass = this._hass;
        return content;
    }
    render() {
        console.debug("RENDER Dialog", this.to_render);
        let close_conf = {
            "image": new URL("close_cross.73f7b69c.svg", import.meta.url),
            "tap_action": {
                "domain": "redsea_ui",
                "action": "exit-dialog"
            },
            "label": (0, $dPhcg.default)._("exit"),
            "class": "dialog_button"
        };
        let content = (0, $l56HR.html)``;
        if (this.to_render != null) {
            this._shadowRoot.querySelector("#dialog-title").innerHTML = (0, $dPhcg.default)._(this.to_render.title_key);
            content = (0, $l56HR.html)`${this.to_render.content.map((c)=>this._render_content(c))}`;
        }
        /*	const SsRow = customElements.get('hui-entities-card');
	const sssor = new SsRow();
	sssor.setConfig({type:"entities",entities:['switch.rsdose4_338229039_device_state']});
	sssor.hass=this._hass;
	const SRow = customElements.get('hui-toggle-entity-row');
	const ssor = new SRow();
	ssor.setConfig({type:'entity',entity:"switch.rsdose4_338229039_device_state"});
	ssor.hass=this._hass;*/ return (0, $l56HR.html)`
          <div id="window-mask">
   	    <div id="dialog">
              <div id="dialog-close">
                 <click-image .hass=${this._hass} .conf=${close_conf}></click-image>
              </div>
              <div id="dialog-title"></div>
              <div id="dialog-content">${content}</div>
              <div id="dialog-submit">
                 <common-button .hass=${this._hass} .conf=${close_conf}/>
              </div>
            </div>
         </div>
`;
    }
} // end of class
window.customElements.define('common-dialog', $5b89899a4a720bff$export$3ddf2d174ce01153);
var $5b89899a4a720bff$var$dialog_box = new $5b89899a4a720bff$export$3ddf2d174ce01153();
var $5b89899a4a720bff$export$2e2bcd8739ae039 = $5b89899a4a720bff$var$dialog_box;

});
parcelRegister("4DorC", function(module, exports) {

$parcel$export(module.exports, "default", () => $35fdc4185dcd6737$export$2e2bcd8739ae039);
parcelRequire("j0ZcV");
var $j8KxL = parcelRequire("j8KxL");
var $35fdc4185dcd6737$export$2e2bcd8739ae039 = (0, $j8KxL.css)`


#window-mask{
position: absolute;
top: 0px;
left: 0px;
width: 100%;
height: 100%;
//text-align:center;
background-color: rgba(175,175,175,0.8);
z-index:98;
//display: flex hidden;
display: none;
justify-content: center;
align-items: center;
}

#dialog{
border: 1px solid gray;
z-index:99;
position:absolute;
top:100px;
//margin-left:35%;
//margin-right:35%;
//min-height: 200px;
//min-width: 300px;
width:28%;
padding-left:15px;
padding-right:15px;
padding-top: 20px;
padding-bottom: 10px;
background-color: rgba(255,255,255,1);
border-radius:15px;
justify-content: center;
align-items: center; 
display: grid;
grid-template-columns: 40px 90%;
//grid-template-rows: 3;
grid-gap: 10px;
}

#dialog-close{
//border: 1px solid green;
grid-column: 1;
grid-row: 1;
padding-left:5px;
padding-right:5px;
text-align:center;
}

#dialog-title{
//border: 1px solid green;
grid-column: 2/4;
grid-row: 1;
padding-left:5px;
padding-right:5px;
font-size: 1.5em;
font-weight: bold;
}

#dialog-content{
//border: 1px solid green;
grid-column: 1/4;
grid-row: 2;
padding-left:5px;
padding-right:5px;
}

#dialog-submit{
//border: 1px solid green;
grid-column: 1/4;
grid-row: 3;
text-align:right;
}

`;

});

parcelRegister("93DQX", function(module, exports) {
parcelRequire("j0ZcV");
var $l56HR = parcelRequire("l56HR");

var $kgVGZ = parcelRequire("kgVGZ");

var $1Um3j = parcelRequire("1Um3j");
class $69834edd1b5d4a9e$export$de240ccfdb266acb extends (0, $1Um3j.default) {
    static styles = (0, $kgVGZ.default);
    /*
     * conf the conf in mapping file
     * stateObj the hass element 
     */ constructor(hass, conf){
        super(hass, conf, null, null);
    }
    _render() {
        let sclass = "";
        if ("class" in this.conf) sclass = this.conf.class;
        return (0, $l56HR.html)`<img class="${sclass}" src=${this.conf.image} />`;
    }
} // end of class
window.customElements.define('click-image', $69834edd1b5d4a9e$export$de240ccfdb266acb);

});
parcelRegister("kgVGZ", function(module, exports) {

$parcel$export(module.exports, "default", () => $ec220dc7bbd7776a$export$2e2bcd8739ae039);
parcelRequire("j0ZcV");
var $j8KxL = parcelRequire("j8KxL");
var $ec220dc7bbd7776a$export$2e2bcd8739ae039 = (0, $j8KxL.css)`

img:hover{
  cursor: pointer;
  background-color: rgb(235,235,235);
  border-radius: 30px
}

`;

});




parcelRegister("7YMQG", function(module, exports) {
module.exports = new URL("close_cross.73f7b69c.svg?" + Date.now(), import.meta.url).toString();

});

parcelRequire("j0ZcV");
var $l56HR = parcelRequire("l56HR");
var $eGUNk = parcelRequire("eGUNk");

var $iXBpj = parcelRequire("iXBpj");
parcelRequire("j0ZcV");
var $j8KxL = parcelRequire("j8KxL");
var $040001cdf6cad6dd$export$2e2bcd8739ae039 = (0, $j8KxL.css)`
`;



var $5c2Je = parcelRequire("5c2Je");
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
  aspect-ratio: 2/1;
}

.device_img{
  position: relative;
  top: 0;
  left : 0;
  width: 100%;
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
    constructor(){
        super();
        this.initial_config = (0, $0ef451c83bce80a0$export$e506a1d27d1eaa20);
    }
    _populate_entities() {}
    render() {
        this.update_config();
        return (0, $l56HR.html)`
                     <p id="device_name">${this.config.name}</p>
                     <div class="device_bg">
                       <img class="device_img" src="${this.config.background_img}"/>
                     </div>
                     `;
    }
}
window.customElements.define('redsea-nodevice', $020e09b811cd87ab$export$942630849b5196f4);


parcelRequire("j0ZcV");
var $l56HR = parcelRequire("l56HR");

var $5c2Je = parcelRequire("5c2Je");
const $49eb2fac1cfe7013$export$e506a1d27d1eaa20 = {
    "name": null,
    "model": "RSDOSE4",
    "background_img": new URL("RSDOSE4.d62c95e6.png", import.meta.url),
    "heads_nb": 4,
    "dialogs": {
        "set_manual_head_volume": {
            "title_key": "set_manual_head_volume",
            "content": [
                {
                    "view": "hui-entities-card",
                    "conf": {
                        "entities": [
                            "manual_head_volume",
                            "manual_head"
                        ]
                    }
                }
            ],
            "validate": [
                {
                    "action": {
                        "domain": "redsea_ui",
                        "action": "exit-dialog"
                    }
                }
            ]
        }
    },
    "elements": [
        {
            "name": "device_state",
            "type": "common-switch",
            "label": false,
            "class": "on_off",
            "style": "switch",
            "tap_action": {
                "domain": "switch",
                "action": "toggle",
                "data": "default"
            },
            "css": {
                "flex": "0 0 auto",
                "position": "absolute",
                "width": "5.5%",
                "height": "2%",
                "border-radius": "50%",
                "top": "28%",
                "left": "2%"
            }
        },
        {
            "name": "maintenance",
            "type": "common-switch",
            "label": false,
            "class": "on_off",
            "style": "switch",
            "tap_action": {
                "enabled": true,
                "domain": "switch",
                "action": "toggle",
                "data": "default"
            },
            "css": {
                "flex": "0 0 auto",
                "position": "absolute",
                "width": "5.5%",
                "height": "2%",
                "border-radius": "50%",
                "top": "22%",
                "left": "2%"
            }
        }
    ],
    "dosing_queue": {
        "css": {
            "text-align": "center",
            "border": "1px solid black",
            "border-radius": "15px",
            "background-color": "rgb(200,200,200)",
            "position": "absolute",
            "width": "12%",
            "height": "45%",
            "left": "88%",
            "top": "45%",
            "font-size": "x-small",
            "overflow-x": "hidden",
            "overflow-y": "auto",
            "scrollbar-color": "gray rgb(255,255,255,0)"
        }
    },
    "heads": {
        "common": {
            "alpha": "0.6",
            "css": {
                "top": "0%",
                "left": "50%",
                "position": "absolute",
                "flex": "0 0 auto",
                "width": "31%",
                "height": "100%"
            },
            "container": {
                "css": {
                    "position": "absolute",
                    "top": "41%",
                    "width": "68%",
                    "aspect-ratio": "1/3"
                }
            },
            "warning": {
                "css": {
                    "width": "40%",
                    "position": "absolute",
                    "left": "18%",
                    "top": "60%",
                    "animation": "blink 1s",
                    "animation-iteration-count": "infinite"
                }
            },
            "warning_label": {
                "css": {
                    "width": "40%",
                    "position": "absolute",
                    "left": "18%",
                    "top": "69%",
                    "animation": "blink 1s",
                    "animation-iteration-count": "infinite",
                    "background-color": "#df1800",
                    "text-align": "center",
                    "border-radius": "20px",
                    "color": "#ffff00",
                    "font-weight": "bold"
                }
            },
            "pump_state_head": {
                "css": {
                    "position": "absolute",
                    "aspect-ratio": "1/1",
                    "width": "55%",
                    "border-radius": "50%",
                    "top": "9.5%",
                    "left": "32%"
                }
            },
            "pump_state_labels": {
                "css": {
                    "aspect-ratio": "1/1",
                    "width": "100%",
                    "display": "grid",
                    "grid-template-columns": "1",
                    "grid-template-rows": "3",
                    "grid-gap": "0px"
                }
            },
            "pipe": {
                "css": {
                    "flex": " 0 0 auto",
                    "position": " absolute",
                    "width": " 70%",
                    "top": " 32%",
                    "left": " 30%;"
                }
            },
            "calibration": {
                "css": {
                    "flex": "0 0 auto",
                    "position": "absolute",
                    "width": "50%",
                    "top": "10%",
                    "left": "35%",
                    "filter": "none",
                    "animation": "blink 1s",
                    "animation-iteration-count": "infinite"
                }
            },
            "elements": [
                {
                    "name": "manual_head_volume",
                    "force_integer": true,
                    "type": "common-sensor",
                    "css": {
                        "position": "absolute",
                        "width": "60%",
                        "top": "0%",
                        "left": "20%"
                    },
                    "tap_action": {
                        "domain": "redsea_ui",
                        "action": "dialog",
                        "data": {
                            "type": "set_manual_head_volume"
                        }
                    }
                },
                {
                    "name": "manual_dosed_today",
                    "type": "common-sensor",
                    "force_integer": true,
                    "put_in": "pump_state_labels",
                    "class": "scheduler_label_top",
                    "disabled_if": "value<1",
                    "prefix": "+",
                    "css": {
                        "text-align": "center",
                        "grid-column": "1",
                        "grid-row": "1",
                        "color": "rgb(250,230,130)",
                        "font-weight": "bold",
                        "margin-top": "10%"
                    }
                },
                {
                    "name": "auto_dosed_today",
                    "type": "common-sensor",
                    "target": "daily_dose",
                    "force_integer": true,
                    "put_in": "pump_state_labels",
                    "class": "scheduler_label_middle",
                    "type": "common-sensor-target",
                    "css": {
                        "text-align": "center",
                        "color": "white",
                        "grid-column": "1",
                        "grid-row": "2",
                        "font-weight": "bold",
                        "font-size": "1.2em",
                        "margin-top": "-25%"
                    }
                },
                {
                    "name": "doses_today",
                    "target": "daily_doses",
                    "force_integer": true,
                    "put_in": "pump_state_labels",
                    "class": "scheduler_label_bottom",
                    "type": "common-sensor-target",
                    "unit": "iconv._('doses')",
                    "css": {
                        "text-align": "center",
                        "color": "rgb(130,230,250)",
                        "grid-column": "1",
                        "grid-row": "3",
                        "font-weight": "bold",
                        "font-size": "0.8em",
                        "margin-top": "-25%"
                    }
                },
                {
                    "name": "container_volume",
                    "target": "save_initial_container_volume",
                    "type": "progress-bar",
                    "class": "pg-container",
                    "label": "' '+this.get_entity('remaining_days').state+ ' '+iconv._('days_left') ",
                    "disabled_if": "this.get_entity('slm').state==false",
                    "css": {
                        "position": "absolute",
                        "transform": "rotate(-90deg)",
                        "top": "69%",
                        "left": "-60%",
                        "width": "140%"
                    }
                },
                {
                    "name": "auto_dosed_today",
                    "target": "daily_dose",
                    "force_integer": true,
                    "type": "progress-circle",
                    "class": "today_dosing",
                    "put_in": "pump_state_labels",
                    "no_value": true,
                    "css": {
                        "position": "absolute",
                        "top": "-23%",
                        "left": "-23%",
                        "aspect-ratio": "1/1",
                        "width": "140%"
                    }
                },
                {
                    "alpha": 0,
                    "name": "schedule_enabled",
                    "type": "common-switch",
                    "class": "pump_state_head",
                    "style": "button",
                    "css": {
                        "position": "absolute",
                        "aspect-ratio": "1/1",
                        "width": "45%",
                        "border-radius": "50%",
                        "top": "10%",
                        "left": "32.5%"
                    },
                    "tap_action": {
                        "enabled": true,
                        "domain": "switch",
                        "action": "toggle",
                        "data": "default"
                    }
                },
                {
                    "name": "manual_head",
                    "type": "common-button",
                    "class": "manual_dose_head",
                    "css": {
                        "position": " absolute",
                        "aspect-ratio": " 1/1",
                        "width": " 15%",
                        "border-radius": " 50%",
                        "top": " 5%",
                        "left": " 33%;"
                    },
                    "tap_action": {
                        "domain": "button",
                        "action": "press",
                        "data": "default"
                    }
                }
            ]
        },
        "head_1": {
            "color": "140,67,148",
            "css": {
                "left": "1%"
            },
            "calibration": {
                "css": {
                    "left": "33%"
                }
            }
        },
        "head_2": {
            "color": "0,129,197",
            "css": {
                "left": "23%"
            }
        },
        "head_3": {
            "color": "0,130,100",
            "css": {
                "left": "44%"
            },
            "pump_state_head": {
                "css": {
                    "left": "37%"
                }
            },
            "calibration": {
                "css": {
                    "left": "37%"
                }
            }
        },
        "head_4": {
            "color": "100,160,75",
            "css": {
                "left": "65%"
            },
            "pump_state_head": {
                "css": {
                    "left": "41%"
                }
            },
            "calibration": {
                "css": {
                    "left": "41%"
                }
            }
        }
    }
};


parcelRequire("j0ZcV");
var $l56HR = parcelRequire("l56HR");

var $5c2Je = parcelRequire("5c2Je");
parcelRequire("j0ZcV");
var $j8KxL = parcelRequire("j8KxL");
var $12c519d2fc52c039$export$2e2bcd8739ae039 = (0, $j8KxL.css)`

img{
 position: absolute;
 width: 100%;
}

svg{
stroke: black;
}

@keyframes blink {
    0% {
        opacity: 1;
    }
    50% {
        opacity: 0;
    }
    100% {
        opacity: 1;
    }
}
`;



var $ircx4 = parcelRequire("ircx4");
parcelRequire("3wGyI");
parcelRequire("M8QIC");

var $iXBpj = parcelRequire("iXBpj");

var $dPhcg = parcelRequire("dPhcg");
class $52ce4b1a72fac8d0$export$2e2bcd8739ae039 extends (0, $5c2Je.default) {
    static styles = [
        (0, $12c519d2fc52c039$export$2e2bcd8739ae039),
        (0, $ircx4.default)
    ];
    static get properties() {
        return {
            entities: {},
            config: {},
            head_id: {},
            state_on: {},
            supplement: {},
            stock_alert: {}
        };
    }
    constructor(hass, entities, config, state_on, stock_alert){
        super();
        this.supplement = null;
        this.stock_alert = stock_alert;
    }
    _pipe_path() {
        let color = this.config.color;
        if (!this.state_on) color = (0, $iXBpj.off_color);
        return (0, $l56HR.html)`
		<svg viewBox="0 0 86 56" style="fill:rgb(${color});">
		    <path d="M 14,0 C 13,12 10,18 7,25 0,34 0,45  0,55 L 12,55 c 0,-8 -0,-16 6,-24 4,-8 8,-17 8,-35 z"></path>
		    <path d="m 62,0 1,39 c 0,2 1,3 2,5 2,2 2,1 4,2 2,0 4,0 6,-2 2,-2 1,-5 2,-7 l 6,-30 -8,0 -3,8 0,-28 z"></path>
		</svg>
`;
    }
    _render_container() {
        let supplement_uid = this.supplement.attributes.supplement.uid;
        let img = null;
        img = '/hacsfiles/ha-reef-card/' + supplement_uid + '.supplement.png';
        let style = (0, $l56HR.html)``;
        let color = this.config.color;
        if (!this.state_on) {
            style = (0, $l56HR.html)`<style>img{filter: grayscale(90%);}</style>`;
            color = (0, $iXBpj.off_color);
        }
        return (0, $l56HR.html)`
<div class="container" style="${this.get_style(this.config.container)}">
  ${style}
  <img src='${img}' onerror="this.onerror=null; this.src='/hacsfiles/ha-reef-card/generic_container.supplement.png'"/>
</div>
`;
    }
    render() {
        this.supplement = this.hass.states[this.entities['supplement'].entity_id];
        if (this.supplement.attributes.supplement.uid != 'null') {
            let warning = '';
            let calibration = '';
            let color = this.config.color + "," + this.config.alpha;
            if (this.hass.states[this.entities['head_state'].entity_id].state == "not-setup") {
                this.state_on = false;
                calibration = (0, $l56HR.html)`<img class='calibration' style="${this.get_style(this.config.calibration)}" src='${new URL("configuration.b5dbcf16.png", import.meta.url)}'/>`;
            }
            if (!this.state_on) color = (0, $iXBpj.off_color) + "," + this.config.alpha;
            if (parseInt(this.get_entity('remaining_days').state) < parseInt(this.stock_alert) && this.get_entity('slm').state == "on") warning = (0, $l56HR.html)`<img class='warning' src='${new URL("warning.db773b32.svg", import.meta.url)}'/ style="${this.get_style(this.config.warning)}" /><div class="warning" style="${this.get_style(this.config.warning_label)}">${(0, $dPhcg.default)._("empty")}</div>`;
            return (0, $l56HR.html)`
               ${this._render_container()}
   	        <div class="pipe" style="${this.get_style(this.config.pipe)}">
 		  ${this._pipe_path()}
		</div>
<!-- Render schedule background -->
<div class="pump_state_head" style="${this.get_style(this.config.pump_state_head)};background-color:rgba(${color});">
${this._render_elements(this.state_on, "pump_state_head")}
<div class="pump_state_labels" style="${this.get_style(this.config.pump_state_labels)}">
${this._render_elements(this.state_on, "pump_state_labels")}
</div>
</div>
${this._render_elements(this.state_on)}
${warning}
${calibration}
   	    `;
        } else // TODO: add button for new supplement
        // Issue URL: https://github.com/Elwinmage/ha-reef-card/issues/24
        //  labels: enhancement rsdose
        return (0, $l56HR.html)`
   <div class="container" style="${this.get_style(this.config.container)}">
     <img src='${new URL("container_add.d3b2ec21.png", import.meta.url)}' />
   </div>
`;
         //else
    }
}
window.customElements.define('dose-head', $52ce4b1a72fac8d0$export$2e2bcd8739ae039);


parcelRequire("j0ZcV");
var $j8KxL = parcelRequire("j8KxL");
var $9e31fe09da958909$export$2e2bcd8739ae039 = (0, $j8KxL.css)`
`;



var $37d5w = parcelRequire("37d5w");

var $dPhcg = parcelRequire("dPhcg");

var $iXBpj = parcelRequire("iXBpj");
/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */ function $ca8e12d540076a8f$export$a6cdc56e425d0d0a(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
}
function $ca8e12d540076a8f$export$dd702b3c8240390c(target, ...sources) {
    if (!sources.length) return target;
    const source = sources.shift();
    if ($ca8e12d540076a8f$export$a6cdc56e425d0d0a(target) && $ca8e12d540076a8f$export$a6cdc56e425d0d0a(source)) {
        for(const key in source)if ($ca8e12d540076a8f$export$a6cdc56e425d0d0a(source[key])) {
            if (!target[key]) Object.assign(target, {
                [key]: {}
            });
            $ca8e12d540076a8f$export$dd702b3c8240390c(target[key], source[key]);
        } else Object.assign(target, {
            [key]: source[key]
        });
    }
    return $ca8e12d540076a8f$export$dd702b3c8240390c(target, ...sources);
}
function $ca8e12d540076a8f$export$4950aa0f605343fb(target, source) {
    return $ca8e12d540076a8f$export$dd702b3c8240390c(structuredClone(target), source);
}


parcelRequire("j0ZcV");
var $l56HR = parcelRequire("l56HR");
parcelRequire("dPhcg");

var $1Um3j = parcelRequire("1Um3j");
parcelRequire("j0ZcV");
var $j8KxL = parcelRequire("j8KxL");
var $df5b478fc79ba284$export$2e2bcd8739ae039 = (0, $j8KxL.css)`
span.volume_dosing_queue{
font-size: x-small;
width: 100%;
}

.slot{
color: white;
}

`;



var $iXBpj = parcelRequire("iXBpj");
class $141b1a4597f6f7b2$export$2e2bcd8739ae039 extends (0, $1Um3j.default) {
    static styles = [
        (0, $df5b478fc79ba284$export$2e2bcd8739ae039)
    ];
    static get properties() {
        return {
            state_on: {},
            color_list: {}
        };
    }
    constructor(hass, entities, config, state_on, stateObj, color_list){
        super(hass, config, stateObj, entities);
        this.state_on = state_on;
        this.color_list = color_list;
    }
    _render_slot_schedule(slot) {
        let bg_color = this.color_list[slot.head];
        return (0, $l56HR.html)`
<div class="slot" style="background-color: rgb(${this.color_list[slot.head]})">
<span class="dosing_queue">
${slot.head}<br />${slot.volume.toFixed(1)}mL<br />${(0, $iXBpj.toTime)(slot.time)}</span><hr /></div>`;
    }
    render() {
        this.schedule = this.stateObj.attributes.queue;
        if (this.state_on && this.schedule.length != 0) return (0, $l56HR.html)`
${this.schedule.map((slot)=>this._render_slot_schedule(slot))}
   	    `;
        else return (0, $l56HR.html)``;
         //else
    }
}
window.customElements.define('dosing-queue', $141b1a4597f6f7b2$export$2e2bcd8739ae039);


parcelRequire("7Rfxy");
class $205242e0eaceda90$export$2e2bcd8739ae039 extends (0, $5c2Je.default) {
    // TODO: RSDOSE Implement basic services
    // Issue URL: https://github.com/Elwinmage/ha-reef-card/issues/13
    //   labels: enhancement, rsdose
    static styles = [
        (0, $9e31fe09da958909$export$2e2bcd8739ae039),
        (0, $37d5w.default)
    ];
    _heads = [];
    static get properties() {
        return {
            supplement_color: {}
        };
    }
    constructor(){
        super();
        this.supplement_color = {};
        this.initial_config = (0, $49eb2fac1cfe7013$export$e506a1d27d1eaa20);
    }
    _populate_entities() {}
    _populate_entities_with_heads() {
        this.update_config();
        this.config_dialog_box();
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
        let entity = this.hass.states[this.entities[head][entity_id].entity_id];
        return entity.state;
    }
    _render_head(head_id) {
        let schedule_state = this.hass.states[this._heads[head_id].entities['schedule_enabled'].entity_id].state == 'on';
        if (!this.is_on()) schedule_state = false;
        let short_name = this.hass.states[this._heads[head_id].entities['supplement'].entity_id].attributes.supplement.short_name;
        this.supplement_color[short_name] = this.config.heads['head_' + head_id].color;
        let new_conf = (0, $ca8e12d540076a8f$export$4950aa0f605343fb)(this.config.heads.common, this.config.heads["head_" + head_id]);
        return (0, $l56HR.html)`
                    <div class="head" id="head_${head_id}" style="${this.get_style(new_conf)}">
                      <dose-head class="head" head_id="head_${head_id}" hass="${this.hass}" entities="${this._heads[head_id].entities}" config="${new_conf}" state_on=${schedule_state} stock_alert="${this.get_entity('stock_alert_days').state}"/>
                    </div>
                    `;
    }
    // updated(changes){
    // 	console.log("RE-RENDERED");
    // }
    render() {
        this.update_config();
        let style = (0, $l56HR.html)``;
        let dosing_queue = (0, $l56HR.html)``;
        this._populate_entities_with_heads();
        let disabled = this._render_disabled();
        if (disabled != null) return disabled;
        if (!this.is_on()) style = (0, $l56HR.html)`<style>img{filter: grayscale(90%);}</style>`;
        let slots = this.hass.states[this.entities['dosing_queue'].entity_id].attributes.queue.length;
        if (slots > 0) dosing_queue = (0, $l56HR.html)`
                 <div style="${this.get_style(this.config.dosing_queue)}">
                    <dosing-queue id="dosing-queue" .hass="${this.hass}" .state_on="${this.is_on()}" .config=null .entities="${this.entities}" .stateObj="${this.hass.states[this.entities['dosing_queue'].entity_id]}" .color_list="${this.supplement_color}"></dosing-queue>
                 </div>`;
        return (0, $l56HR.html)`
             	<div class="device_bg">
                  ${style}
          	  <img class="device_img" id="rsdose4_img" alt=""  src='${this.config.background_img}' />
                  <div class="heads">
                     ${Array.from({
            length: this.config.heads_nb
        }, (x, i)=>i + 1).map((head)=>this._render_head(head))}
                 </div>
                 ${dosing_queue}
                 ${this._render_elements()}
               </div>`;
    }
    _editor_head_color(head_id) {
        this.update_config();
        let color = (0, $iXBpj.rgbToHex)("rgb\(" + this.config.heads["head_" + head_id].color + "\);");
        return (0, $l56HR.html)`
         <input type="color" id="head_${head_id}" name="head_${head_id}" value="${color}" @change="${this.handleChangedEvent}" @input="${this.handleChangedEvent}" list="RedSeaColors" />
         <datalist id="RedSeaColors">
            <option>#8c4394</option>
            <option>#0081c5</option>
            <option>#008264</option>
            <option>#64a04b</option>
            <option>#582900</option>
            <option>#f04e99</option>
            <option>#f14b4c</option>
            <option>#f08f37</option>
            <option>#d9d326</option>
            <option>#FFFFFF</option>
         </datalist>
         <label class="tab-label">${(0, $dPhcg.default)._("head")} ${head_id}: ${this.hass.states[this._heads[head_id].entities['supplement'].entity_id].state}</label>
         <br />
     `;
    }
    handleChangedEvent(changedEvent) {
        const hex = changedEvent.currentTarget.value;
        var newVal = {
            conf: {
                [this.current_device.config.model]: {
                    devices: {
                        [this.current_device.device.name]: {
                            heads: {
                                [changedEvent.target.id]: {
                                    color: (0, $iXBpj.hexToRgb)(hex)
                                }
                            }
                        }
                    }
                }
            }
        };
        var newConfig = JSON.parse(JSON.stringify(this._config));
        try {
            newConfig.conf[this.current_device.config.model].devices[this.current_device.device.name].heads[changedEvent.target.id].color = (0, $iXBpj.hexToRgb)(hex);
        } catch (error) {
            (0, $iXBpj.updateObj)(newConfig, newVal);
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
    editor(doc) {
        if (this.is_disabled()) return (0, $l56HR.html)``;
        this._populate_entities_with_heads();
        var element = doc.getElementById("heads_colors");
        if (element) element.reset();
        return (0, $l56HR.html)`
                 <hr />
                 <h1>${(0, $dPhcg.default)._("heads_colors")}</h1>
                 <form id="heads_colors">
                   ${Array.from({
            length: this.config.heads_nb
        }, (x, i)=>i + 1).map((head)=>this._editor_head_color(head))}
                </form>`;
    }
}
window.customElements.define('redsea-rsdose4', $205242e0eaceda90$export$2e2bcd8739ae039);



var $7Rfxy = parcelRequire("7Rfxy");

var $4DorC = parcelRequire("4DorC");
class $bf513b85805031e6$export$8a2b7dacab8abd83 extends (0, $eGUNk.LitElement) {
    static styles = [
        (0, $040001cdf6cad6dd$export$2e2bcd8739ae039),
        (0, $4DorC.default)
    ];
    // Card is updated when new device is selected or when hass is updated
    static get properties() {
        return {
            hass: {},
            current_device: {}
        };
    }
    /*
     * CONSTRUCTOR
     */ constructor(){
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
    /*
     * Get user configuration
     */ setConfig(config) {
        this.user_config = config;
    }
    /*
     * RENDER
     */ render() {
        console.debug("render main");
        if (this.first_init == true) {
            this.init_devices();
            this.first_init = false;
            this.no_device = (0, $5c2Je.default).create_device("redsea-nodevice", this.hass, null, null);
            this.current_device = this.no_device;
        } //if
        //Init conf and DOM for dialog box
        (0, $7Rfxy.default).init(this.hass, this.shadowRoot);
        if (this.user_config['device']) {
            this.select_devices.map((dev)=>this._set_current_device_from_name(dev, this.user_config.device));
            //A specific device has been selected
            return (0, $l56HR.html)`
                       ${this.current_device}
                       ${(0, $7Rfxy.default).render()}
                       `;
        } //fi
        // no secific device selected, display select form
        return (0, $l56HR.html)`
          ${this.device_select()}
          ${this.current_device}
          ${(0, $7Rfxy.default).render()}
    `;
    }
    /*
     * display select form to choose wich device to display
     */ device_select() {
        return (0, $l56HR.html)`
           <select id="device" @change="${this.onChange}">
              ${this.select_devices.map((option)=>(0, $l56HR.html)`
              <option value="${option.value}" ?selected=${this.select_devices === option.value}>${option.text}</option>
              `)}
          </select>
    `;
    }
    /*
     * Initialise available redsea devices list
     */ init_devices() {
        this.devices_list = new (0, $iXBpj.default)(this.hass);
        for (var d of this.devices_list.main_devices)this.select_devices.push(d);
         // for
    }
    /*
     * Set the current device to display giving it's name
     */ _set_current_device_from_name(dev, name) {
        if (dev['text'] == name) this._set_current_device(dev['value']);
    }
    /*
     * Set the current device to display giving it's id
     */ _set_current_device(device_id) {
        //No device selected, display redsea logo
        if (device_id == "unselected") {
            this.current_device = this.no_device;
            return;
        }
        var device = this.devices_list.devices[device_id];
        var model = device.elements[0].model;
        this.current_device = (0, $5c2Je.default).create_device("redsea-" + model.toLowerCase(), this.hass, this.user_config, device);
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
    /*
     * When SELECT form change, update the current redsea device to display.
     */ onChange() {
        setTimeout(()=>{
            this.selected = this.shadowRoot.querySelector('#device').value;
            this.current_device = this.no_device;
            if (this.selected == "unselected") console.log('Nothing selected');
            else this._set_current_device(this.selected);
        }, 300);
    }
    /*
     * Card editor
     */ static getConfigElement() {
        return document.createElement("reef-card-editor");
    }
} //end of class ReefCard


parcelRequire("j0ZcV");
var $j8KxL = parcelRequire("j8KxL");
var $l56HR = parcelRequire("l56HR");
var $eGUNk = parcelRequire("eGUNk");

var $iXBpj = parcelRequire("iXBpj");

var $5c2Je = parcelRequire("5c2Je");

class $fc7d6e547b6fcb14$export$d7c6282dbee77504 extends (0, $eGUNk.LitElement) {
    static get properties() {
        return {
            hass: {},
            _config: {
                state: true
            },
            current_device: {}
        }; //end of reactives properties
    }
    /*
     * CONSTRUCTOR
     */ constructor(){
        super();
        this.select_devices = [
            {
                value: 'unselected',
                text: "Select a device"
            }
        ];
        this.first_init = true;
        this.current_device = null;
        this.addEventListener('config-changed', this.render());
    }
    /*
     * Get user configuration
     */ setConfig(config) {
        this._config = config;
    }
    init_devices() {
        this.devices_list = new (0, $iXBpj.default)(this.hass);
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
    /*
     * RENDER
     */ render() {
        if (this._config) {
            if (this.first_init == true) {
                this.first_init = false;
                this.init_devices();
            }
            return (0, $l56HR.html)`
            <div class="card-config">
                <div class="tabs">
                <div class="tab">
                    <label class="rab-label" for="device">Device:</label>
                    <select id="device" class="value cell" @change="${this.handleChangedEvent}">
                      ${this.select_devices.map((option)=>(0, $l56HR.html)`
                      <option value="${option.value}" ?selected=${this._config.device === option.text}>${option.text}</option>
                        `)}
                   </select>
</div>
                ${this.device_conf()}
                </div>
            </div>
        `;
        }
        return (0, $l56HR.html)``;
    }
    /*
     * Display specific configuration for selected device
     */ device_conf() {
        if (this._config.device && this._config.device.length > 0) {
            var device = this.devices_list.get_by_name(this._config.device);
            var model = device.elements[0].model;
            var lit_device = (0, $5c2Je.default).create_device("redsea-" + model.toLowerCase(), this.hass, this._config, device);
            if (lit_device != null && typeof lit_device['editor'] == 'function') {
                this.current_device = lit_device;
                return lit_device.editor(this.shadowRoot);
            } //if
        }
        return ``;
    }
    /*
     * Send event when configuration changed
     */ handleChangedEvent(changedEvent) {
        // this._config is readonly, copy needed
        var newConfig = JSON.parse(JSON.stringify(this._config));
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
} // end of class ReefCardEditor


// import { loadHaComponents, DEFAULT_HA_COMPONENTS } from '@kipk/load-ha-components';
// await loadHaComponents([
//     'ha-form',
//     'hui-sensor-entity-row'
// ]);
customElements.define("reef-card", (0, $bf513b85805031e6$export$8a2b7dacab8abd83));
customElements.define("reef-card-editor", (0, $fc7d6e547b6fcb14$export$d7c6282dbee77504));
window.customCards = window.customCards || [];
window.customCards.push({
    type: "reef-card",
    name: "Reef Tank Card",
    description: "A custom card for reef management."
});
window.customCards = window.customCards || [];
window.customCards.push({
    type: "reef-card-editor",
    name: "Content Card Editor",
    preview: false,
    description: "Reef Card!",
    documentationURL: "https://github.com/Elwinmage/ha-reef-card"
});


//# sourceMappingURL=ha-reef-card.js.map
