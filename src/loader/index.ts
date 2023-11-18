import { IGameConfigBase } from "./iConfigBase";
import { Loader } from "./loader";
import { ProgressUI } from "./progressUI";
import { Runner } from "./runner";
import { Reporter } from "./reporter";

export {
	Loader, Runner, ProgressUI, Reporter
}

let runner: Runner;
let loader: Loader;
let ui: ProgressUI;

export const LegacyLoader = {
	init(_gameConfig: IGameConfigBase) {
		loader = new Loader(_gameConfig);
		runner = new Runner(loader, _gameConfig);
		ui = new ProgressUI(document, _gameConfig);

		ui.init();

		window["setStageDimensions"] = function (x, y, w, h) {
			_gameConfig.x = x;
			_gameConfig.y = y;
			_gameConfig.w = w;
			_gameConfig.h = h;

			if (window["AVMPlayerPoki"]) {
				window["AVMPlayerPoki"].setStageDimensions(x, y, w, h);
			}

			ui.onUpdate();
		};
	},

	runGame(progressEvent = (f) => f, completeEvent = (data, gameRunEvent: (a: any) => void) => 0) {
		const conf = runner.config;

		const progress = (f: number) => {
			console.log("progress:", f);
			ui.onProgress(f);
			progressEvent(f); 
		}

		const complete = (func: () => void) => {
			// rereport
			// completeEvent(func);

			if (conf.start) {
				//	start image exists.
				//	hide progressbar, show startimage and wait for user-input to start the game

				ui.ready();

				const onClick = (_e: MouseEvent) => {					
					ui.hide(true);
					if (!func) 
						throw "PokiPlayer did not send a callback for starting game";

					func();
				};

				window.addEventListener("click", onClick, {once: true});

			} else {
				ui.hide(true);
			}
		};

		// make functions avilailable on window, so the loaded js-code can access and execute them
		Object.assign(window, {
			swfParseComplete: complete,
		});
		
		return runner
			.runGame(progress)
			.then((res) => {
				completeEvent(res, complete);
			});
	}
}
