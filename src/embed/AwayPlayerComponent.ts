//@ts-ignore
import template from "./embed.html";

import { IGameConfigBase } from "../loader/iConfigBase";

interface IAwayPlayer {
    new(config: IGameConfigBase);
    loadAndPlay(): Promise<void>;
    loadBuffer(buffer: ArrayBuffer): Promise<void>;
    play(): void;
    stop(): void;
}

const scriptSrc = (<HTMLScriptElement>document.currentScript).src;
const scriptBaseUrl = new URL('.', scriptSrc).href;
const defaultSplashUrl = new URL('./assets/splash.jpg', scriptBaseUrl).href;
const defaultProgress = {
    "direction": "lr",
    "back": "#130d02",
    "line": "#f29f01",
    "rect": [
        0.25,
        0.77,
        0.5,
        0.01
    ]
};

export interface IBindingConfig {
    version?: string;
    runtimeBaseUrl: string;
    src: string;
    avm1?: boolean;
    width: string | number;
    height: string | number;
    onLoad?: string;
    onProgress?: string;
    onError?: string;
    scaleMode?: string;
    autoplay?: boolean;
    backgroundColor?: string;
    splash?: string | boolean,
    progress?: boolean | {
		back: string;
		rect: [number, number, number, number],
		line: string;
		direction?: 'lr' | 'tb'
	},
    
    /**
     * @description A decimal value between 0 and 1. Limits stage scale to improve performance.
     * For example, 0.5 limits the player to half resolution.
     */
    maxStageScale?: number;
    /**
     * @description Hide player content before loading
     */
    hideBeforeLoad?: boolean;

    /**
     * @kind Runtime
     * @description Smooth bitmaps by default, by default Flash use is pixilate 
     */
     smoothBitmaps?: boolean;
}

type TBindingScheme = {[key in keyof IBindingConfig]: {required?: boolean, default?: any}};


export class AwayPlayerComponent extends HTMLElement {
    static get observedAttributes() {
        return [
            'src',
            'width',
            'height'
        ];
    }

    private static BINDING_CONFIG: TBindingScheme = {
        version: {required: false, default: 'latest'},
        runtimeBaseUrl: {required: false, default: scriptBaseUrl},
        src: {required: true},
        avm1: {required: false, default: false},
        width: {required: false, default: 550},
        height: {required: false, default: 400},
        onLoad: {required: false},
        onProgress: {required: false},
        onError: {required: false},
        scaleMode: {required: false, default: 'all'},
        autoplay: {required: false, default: true},
        hideBeforeLoad: {required: false, default: false},
        maxStageScale: {required: false, default: undefined},
        backgroundColor: {required: false, default: 'black'},
        splash: {required: false, default: defaultSplashUrl},
        progress: {required: false, default: defaultProgress},

        // runtime
        smoothBitmaps: {required: false, default: false},
    };

    _loaderHolder: HTMLDivElement;
    _runConfig: IBindingConfig = <any>{};
    _gameFrame: HTMLIFrameElement;
    _player: IAwayPlayer;
    _root: ShadowRoot;

    get player() {
        return this._player;
    }

    get config() {
        return this._runConfig;
    }
    set config(cfg) {
        this._runConfig = cfg;
    } 

    get src() {
        return this._runConfig.src || this.getAttribute('src');
    }
    set src(v) {
        this._runConfig.src = v;
    }

    set width(v: number | string) {
        this._runConfig.width = v;
    }
    get width() {
        return this._runConfig.width || this.getAttribute('width');
    }

    set height(v: number | string) {
        this._runConfig.height = v;
    }
    get height() {
        return this._runConfig.height || this.getAttribute('height');
    }

    set runtimeBaseUrl(v: string) {
        this._runConfig.runtimeBaseUrl = v;
    }
    get runtimeBaseUrl() {
        return this._runConfig.runtimeBaseUrl;
    }

    constructor(){
        super();

        this.onError = this.onError.bind(this);
        this._root = this.attachShadow({mode:'closed'});
    }

    _getRuntimeUrl() {
        const baseUrl = this._runConfig.runtimeBaseUrl;
        const loader  = new URL('loader.js', baseUrl).href;
        const runtime = new URL('runtime.js', baseUrl).href;
        /**
         * @todo support runtime version
         **/
        return {
            loader,
            runtime,
            baseUrl,
        }
    }

    _dropPlayer() {
        if (this._gameFrame) {
            this._gameFrame.remove();
            this._player = null;
        }
    }

    onError(_arg: any) {
        const f = this._runConfig.onError && self[this._runConfig.onError];

        if (typeof f === 'function') {
            f(_arg);
        }

        this.dispatchEvent(new ErrorEvent('error', {
            error: new Error('Awayfl runtime error'),
            message: _arg?.message || _arg,
        }));
    }

    _attachRuntimeEvents() {
        const fd = this._gameFrame.contentWindow;
        //@ts-ignore
        fd.addEventListener('awayfl-player-init', ({detail}) =>{
            this._player = detail;
        }, {once: true});

        fd.addEventListener('awayfl-player-load', () => {
            const f = this._runConfig.onLoad && self[this._runConfig.onLoad];

            if (typeof f === 'function') {
                f();
            }

            this.dispatchEvent(new CustomEvent('load'));
            this._gameFrame.style.display = '';

        }, {once: true});

        //@ts-ignore
        fd.addEventListener('awayfl-player-progress', ({detail}) => {
            const f = this._runConfig.onProgress && self[this._runConfig.onProgress];

            if (typeof f === 'function') {
                f(detail);
            }

            
            this.dispatchEvent(new CustomEvent('progress', {detail}));
        });
        
    }

    _buildTemplate(frame: HTMLIFrameElement): string {
        const t: string = template;
        const urls = this._getRuntimeUrl();
     
        const gameConfig = {
            width: frame.clientWidth,
            height: frame.clientHeight,
            backgroundColor: this._runConfig.backgroundColor,
            splash: this._runConfig.splash,
            progress: this._runConfig.progress,
            runtime: [urls.runtime],
            binary: [{
                path: this._runConfig.src,
                resourceType: 'GAME',
                name: 'Game',
                meta: {}
            }],
            //debug: true,
            baseUrl: urls.baseUrl,
            maxStageScale: +this._runConfig.maxStageScale,
            runtimeFlags: {
                defaultSmoothBitmap: !!this._runConfig.smoothBitmaps
            }
        }
    
        return t
            .replace(/__LOADER_URL__/, urls.loader)
            .replace(/__GAME_CONFIG__/, JSON.stringify(JSON.stringify(gameConfig))); 
    }

    _constructPlayer() {
        const root = this._root;
        const frame = document.createElement('iframe');

        frame.style.border = 'none';
        frame.style.display = this._runConfig.hideBeforeLoad ? 'none' : ''

        frame.width = '' + this._runConfig.width;
        frame.height = '' + this._runConfig.height;

        this._gameFrame = frame;
        
        root.appendChild(frame);

        frame.addEventListener('load', this._attachRuntimeEvents.bind(this), {
            once: true
        });

        frame.addEventListener('error', this.onError);
        frame.srcdoc = this._buildTemplate(frame);
    }

    _mapAttrs() {
        const params: NodeListOf<HTMLParamElement> = this.querySelectorAll('param');
        const attrs = this.getAttributeNames();

        const scheme = AwayPlayerComponent.BINDING_CONFIG;

        params.forEach(node => {
            if (node.name in scheme) {
                this._runConfig[node.name] = node.value;
            }
        });

        attrs.forEach(name => {
            if (name in scheme) {
                this._runConfig[name] = this.getAttribute(name);
            }
        });
    }

    _loadGlobalConfig() {
        const global = <any>window;
        const globalCfg = global.AWAY_EMBED_CFG;
        const scheme = AwayPlayerComponent.BINDING_CONFIG;
        
        for(const [key, value] of Object.entries(globalCfg)) {
            if (key in scheme) {
                this._runConfig[key] = value;
            }
        }
    }

    _setDefaults() {
        const scheme = AwayPlayerComponent.BINDING_CONFIG;
        for(const key in scheme) {
            if (scheme[key].required && typeof this._runConfig[key] === 'undefined') {
                throw `Parameter ${key} is required!`;
            }

            if (typeof this._runConfig[key] === 'undefined') {
                this._runConfig[key] = scheme[key].default;
            }
        }
    }

    connectedCallback() {
        setTimeout(() => {
            this._loaderHolder = this.querySelector('div.awayfl__loader');
            this._loadGlobalConfig();
            this._mapAttrs();
            this._setDefaults();
            this._constructPlayer();

            const style = document.createElement('style');
            style.textContent = `
            :host {
                display: block;
                contain: content;
                width: ${this._runConfig.width};
                height: ${this._runConfig.height};
            }
            `;

            this._root.appendChild(style); 
        });
    }

    disconnectedCallback() {
        this._dropPlayer();
    }

    attributeChangedCallback(name: string, _oldValue: any, newValue: any) {
        if(!this.isConnected) {
            return;
        }

        // if SRC changed, drop runtime and load again
        if (name === 'src' && this._player) {
            this._dropPlayer();
            this._runConfig.src = newValue;
            this._constructPlayer();

            return;
        }

        if (name === 'width' || name === 'height') {
            this._root.styleSheets[0].insertRule(`:host { ${name}: ${newValue};}`);
        }
    }
}

customElements.define('awayfl-player', AwayPlayerComponent);