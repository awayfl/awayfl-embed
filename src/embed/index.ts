//@ts-ignore
import template from "./embed.html";
import {AwayPlayerComponent, IBindingConfig} from './AwayPlayerComponent';

const NOT_IMPLEMENTED = (name) =>
    console.warn("AwayFL loader does not support " + name);

const scriptSrc = (<HTMLScriptElement>document.currentScript).src;

const global = <any>window;

let AWAY_EMBED_CFG: IBindingConfig;

if (global.swfObject) {
    console.warn("Replace `swfObject` with AwayFl loader!");
}

function createRuntimeFrame(
    swfUrl: string, 
    target: HTMLElement, 
    width: string, 
    height: string) {

    if (!global.AWAY_EMBED_CFG) {
        console.info('AwayFL configuration not found. To set custom options, define a `AWAY_EMBED_CFG` object as explained in the Readme');
        global.AWAY_EMBED_CFG = {};
    }
    AWAY_EMBED_CFG = global.AWAY_EMBED_CFG;

    const player = new AwayPlayerComponent();
    player.src = swfUrl;
    player.width = width;
    player.height = height;

    let baseUrl = AWAY_EMBED_CFG.runtimeBaseUrl;
    if (baseUrl) {
        player.runtimeBaseUrl = baseUrl;
    }

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

