//@ts-ignore
import template from "./embed.html";
import {AwayPlayerComponent} from './AwayPlayerComponent';

interface IAWAY_EMBED_CFG {
    loaderUrl: string,
    baseUrl?: string,
    runtimeUrl?: string,
    trackEmbedObjectTags?: boolean,
    splash?: string,
    progress?: {
		back: string;
		rect: [number, number, number, number],
		line: string;
		direction?: 'lr' | 'tb'
	},
}

const NOT_IMPLEMENTED = (name) =>
    console.warn("AwayFL loader not support " + name);

const global = <any>window;

let AWAY_EMBED_CFG: IAWAY_EMBED_CFG;

if (global.swfObject) {
    console.warn("Replace `swfObject` to AwayFl loader!");
}

function createRuntimeFrame(
    swfUrl: string, 
    target: HTMLElement, 
    width: string, 
    height: string) {

    AWAY_EMBED_CFG = global.AWAY_EMBED_CFG;

    if (!AWAY_EMBED_CFG) {
        throw 'AwayFL configuration not found, insert define a `AWAY_AMBED_CFG` as in wiki';
    }

    if(!AWAY_EMBED_CFG.loaderUrl) {
        throw 'AwayFL loader not defined! Runtime will not load correctly!';
    }

    const loaderUrl = AWAY_EMBED_CFG.loaderUrl;
    let baseUrl = AWAY_EMBED_CFG.baseUrl;
    let runtimeUrl = AWAY_EMBED_CFG.runtimeUrl;

    if(!baseUrl) {
        const source = runtimeUrl || loaderUrl;
        baseUrl = loaderUrl.substring(0, source.lastIndexOf('/'));
    }

    if (!runtimeUrl) {
        console.warn('AwayFL Runtime Url not defined, will be used url of base or loader!');

        runtimeUrl = baseUrl  + '/runtime.js';
    }

    const player = new AwayPlayerComponent();
    player.setAttribute('src', swfUrl);
    player.setAttribute('width', width);
    player.setAttribute('height', height);
    player.setAttribute('runtimebaseurl', baseUrl);

    const id = target.id;
    const name = target.className;
    const parent = target.parentElement;

    target.id = null;
    target.className = '';

    player.id = id;
    player.className = name;

    parent.replaceChild(player, target);
    
    return player;
}

function embedSWF (
    swfUrl: string,
    targetId: HTMLElement | string,
    widthStr: string,
    heightStr: string,
    _version?: string,
    _xiSwfUrlStr?: string,
    _flashvarsObj?: any,
    _parObj?: any, 
    _attObj?: any, 
    callbackFn?: (arg:any) => void
) {
    
    const ref = typeof targetId == 'string' ? document.getElementById(targetId) : targetId;
    const frame = createRuntimeFrame(swfUrl, ref, widthStr, heightStr);

    frame.onload = () => {
        callbackFn && callbackFn({
            success: true,
            ref: frame,
            id: ref.id,
        });
    }
};

document.addEventListener('load', () => {
    
});

const swfObject = {
    registerObject: () => NOT_IMPLEMENTED("registerObject"),
    getObjectById: () => NOT_IMPLEMENTED("getObjectById"),
    switchOffAutoHideShow: () => NOT_IMPLEMENTED("switchOffAutoHideShow"),
    enableUriEncoding: () => NOT_IMPLEMENTED("enableUriEncoding"),
    getFlashPlayerVersion: () => NOT_IMPLEMENTED("getFlashPlayerVersion"),
    createSWF: () => NOT_IMPLEMENTED("createSWF"),
    showExpressInstall: () => NOT_IMPLEMENTED("showExpressInstall"),
    createCSS: () => NOT_IMPLEMENTED("createCSS"),
    getQueryParamValue: () => NOT_IMPLEMENTED("getQueryParamValue"),

    get ua(){
        return NOT_IMPLEMENTED('ua');
    },
    embedSWF    
};

global.swfObject = swfObject;

