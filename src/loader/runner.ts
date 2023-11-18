import { IFile, IGameConfigBase } from "./iConfigBase";
import { Loader } from "./loader";
import { Reporter } from "./reporter";

export class Runner {
	progress: Reporter;

	constructor(public loader: Loader, public config: IGameConfigBase) {};

	runGame(progressEvent = (f) => f) {

		const config = this.config;

		const bins = config.binary = 
			(
				Array.isArray(config.binary) 
					? config.binary 
					: [config.binary]
			).map(e => (typeof e === 'string' ? {path: e} : e) as IFile);
		

		const jss = config.runtime = 
			(
				Array.isArray(config.runtime) 
					? config.runtime 
					: [config.runtime]
			).map(e => (typeof e === 'string' ? {path: e, type: 'js'} : e) as IFile);
		
		const loadReporter = new Reporter(null, null, 4);
		const avmReporter = new Reporter(
			(f) => {
				console.log("AVM Load", f);
			},
			null,
			config.progressParserWeight ? config.progressParserWeight : 0.001
		);

		this.progress = new Reporter(
			progressEvent,
			[loadReporter, avmReporter]
		);

		
		// make functions avilailable on window, so the loaded js-code can access and execute them
		Object.assign(window, {
			updatePokiProgressBar: avmReporter.report,
			//pokiGameParseComplete: complete,
		});

		return this.loader.run(jss, <any>bins, loadReporter.report, config.debug).then((data: IFile[]) => {
			config.files = data;
			return config;
		});
	}
}
