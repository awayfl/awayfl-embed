import { loadBinary, loadScript } from "./fetcher";
import { IFile, IGameConfigBase } from "./iConfigBase";
import { Reporter } from "./reporter";

export class Loader {
	progress: Reporter;

	constructor(public config: IGameConfigBase ) {};

	run(
		jsFiles: IFile[],
		binaryFiles: IFile[],
		progressEvent = (_f: number) => void 0,
		_debugScripts: boolean = false
	) {
		const jsCount = jsFiles.length;
		const binCount = binaryFiles.length;

		const all: Array<string | IFile> = jsFiles.concat(<any>binaryFiles);

		const reporters = Array.from({ length: jsCount + binCount }, () => new Reporter());
		this.progress = new Reporter(progressEvent, reporters);

		let pendings: Promise<any>[];

		if (!_debugScripts) {
			pendings = all.map((e, i) => loadBinary(<any>e, reporters[i].report));
		} else {
			pendings = binaryFiles.map((e, i) => loadBinary(e, reporters[i].report));
			pendings = pendings.concat(
				jsFiles.map((e, i) => loadScript(e, reporters[i + binCount].report))
			);
		}

		return Promise.all(pendings).then((data) => {
			return data.filter((e) => e && e.type === "swf");
		});
	}
}
