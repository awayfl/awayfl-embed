const s = [ 
    "border: solid 4px #fb5900",
    "border-radius: 8px",
    "color: white",
    "backround-color: black",
    "padding: 10px",
    "font-size: 20px",
    "font-weigth: bold"
].join(";");

console.log("%cAWAYFL: __VERSION__\nBUILD: __DATE__", s);

import { AVM1Handler } from "@awayfl/avm1";
import { AVM2Handler } from "@awayfl/avm2";
import { LoaderInfo, PlayerGlobal } from "@awayfl/playerglobal";
import { AVMStage } from "@awayfl/swf-loader";

//@ts-ignore;
export const VERSION = __VERSION__;
//@ts-ignore
export const RUNTIME = JSON.parse(__RUNTIME__);
export class Player extends AVMStage {
    constructor(public container: HTMLDivElement, conf: any) {
        super(Object.assign({
            x:'0%', y: '0%', w: '100', h: '100%',
            stageScaleMode: 'showAll',
            files: [
                { path: "assets/fonts.swf", resourceType: <any>"FONTS" },                
            ]
        }, conf || {}));

        this.registerAVMStageHandler( new AVM1Handler());
        this.registerAVMStageHandler( new AVM2Handler(new PlayerGlobal()));

        LoaderInfo.DefaultLocation = conf?.location || "http://localhost";
    }

    loadBuffer(buffer: ArrayBuffer): Promise<void> {
        this._gameConfig.files.push({
            //@ts-ignore
            data: buffer, path: 'assets/game.swf', resourceType: "GAME"
        });

        return new Promise((res)=>{
            this.addEventListener('loaderComplete', () => res());
            this.loadNextResource();	
        });
    }

    play() {
        super.play();
        //@ts-ignore
        this.resizeCallback();
    }

    stop() {
        //@ts-ignore
        this._timer.stop();
        //@ts-ignore
        this._timer.setCallback(undefined, undefined);
    }
}