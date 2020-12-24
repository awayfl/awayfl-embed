console.debug("AWAY RUNTIME - 0.0.29");

import { LoaderInfo } from "@awayfl/playerglobal"
import { AVMPlayer } from "@awayfl/awayfl-player"


LoaderInfo.DefaultLocation = "http://localhost";
//@ts-ignore
export class DemoPlayer extends AVMPlayer {
    container: HTMLDivElement;
    constructor(container) {
        super({
            x:'0%', y: '0%', w: '100', h: '100%',
            stageScaleMode: 'showAll',
            files: [
                { path: "assets/fonts.swf", resourceType: "FONTS" },                
            ]
        });
        this.container = container;
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