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

interface IBindingConfig {
    version?: string;
    runtimebaseurl: string;
    loaderurl?: string;
    runtimeurl?: string;
    src: string;
    avm1?: boolean;
    width: string | number;
    height: string | number;
    onload?: string;
    onprogress?: string;
    onerror?: string;
    scaleMode?: string;
    autoplay?: boolean;
    
    /**
     * @description Limit stage scale > 0 - force scale to this value, 0.5 - half resolution
     */
    maxstagescale?: number;
    /**
     * @description Hide player content before loading
     */
    hidebeforeload?: boolean;

    /**
     * @kind Runtime
     * @description use smooth as default value for bitmap, by default Flash use is pixilate 
     */
     smoothbitmapdefault?: boolean;
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

    private static BINDING_CONFIG: TBindingScheme  = {
        version: {required: false, default: 'latest'},
        runtimebaseurl: {required: true},
        loaderurl: {required: false, default: 'loader.js'},
        runtimeurl: {required: false, default: 'runtime.js'},
        src: {required: true},
        avm1: {required: false, default: false},
        width: {required: false, default: 550},
        height: {required: false, default: 400},
        onload: {required: false},
        onprogress: {required: false},
        onerror: {required: false},
        scaleMode: {required: false, default: 'all'},
        autoplay: {required: false, default: true},
        hidebeforeload: {required: false, default: false},
        maxstagescale: {required: false, default: undefined},

        // runtime
        smoothbitmapdefault: {required: false, default: false},
    };

    _loaderHolder: HTMLDivElement;
    _runConfig: IBindingConfig = <any>{};
    _gameFrame: HTMLIFrameElement;
    _player: IAwayPlayer;
    _root: ShadowRoot;

    get player() {
        return this._player;
    }

    get runConfig() {
        return this._runConfig;
    }

    get src() {
        return this.getAttribute('src');
    }

    set src (v) {
        this.setAttribute('src', v);
    }

    set width (v: string) {
        this.setAttribute('width', v);
    }

    get width () {
        return this.getAttribute('width');
    }

    set height (v: string) {
        this.setAttribute('height', v);
    }

    get height () {
        return this.getAttribute('height');
    }

    constructor(){
        super();

        this.onError = this.onError.bind(this);
        this._root = this.attachShadow({mode:'closed'});
    }

    _getRuntimeUrl() {
        const baseUrl = this._runConfig.runtimebaseurl;
        const loader  = new URL(this._runConfig.loaderurl, baseUrl).href;
        const runtime = new URL(this._runConfig.runtimeurl, baseUrl).href;
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
        const f = this._runConfig.onerror && self[this._runConfig.onerror];

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
            const f = this._runConfig.onload && self[this._runConfig.onload];

            if (typeof f === 'function') {
                f();
            }

            this.dispatchEvent(new CustomEvent('load'));
            this._gameFrame.style.display = '';

        }, {once: true});

        //@ts-ignore
        fd.addEventListener('awayfl-player-progress', ({detail}) => {
            const f = this._runConfig.onprogress && self[this._runConfig.onprogress];

            if (typeof f === 'function') {
                f(detail);
            }

            
            this.dispatchEvent(new CustomEvent('progress', {detail}));
        });
        
    }

    _buildTemplate(frame: HTMLIFrameElement): string {
        const t: string = template;
        const urls = this._getRuntimeUrl();
        const global = <any>window;
        const globalCfg = global.AWAY_EMBED_CFG;
        const defaultSplash = 'splash.jpg';
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
     
        const gameConfig = {
            width: frame.clientWidth,
            height: frame.clientHeight,
            splash: (typeof globalCfg.splash == 'string' && globalCfg.splash) || defaultSplash,
            progress: globalCfg.progress || defaultProgress,
            runtime: [urls.runtime],
            binary: [{
                path: this._runConfig.src,
                resourceType: 'GAME',
                name: 'Game',
                meta: {}
            }],
            //debug: true,
            baseUrl: urls.baseUrl,
            maxStageScale: +this._runConfig.maxstagescale,
            runtimeFlags: {
                defaultSmoothBitmap: !!this._runConfig.smoothbitmapdefault
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
        frame.style.display = this._runConfig.hidebeforeload ? 'none' : ''

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

        for(const key in scheme) {
            if (scheme[key].required && typeof this._runConfig[key] === 'undefined') {
                throw `Parameter ${key} is required!`;
            }

            if (typeof this._runConfig[key] === 'undefined') {
                this._runConfig[key] = scheme[key].default;
            }
        }
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

    connectedCallback() 
    {
        setTimeout(() => {
            this._loaderHolder = this.querySelector('div.awayfl__loader');
            this._loadGlobalConfig();
            this._mapAttrs();
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