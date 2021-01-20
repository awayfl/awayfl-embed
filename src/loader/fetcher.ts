import {supportDecoderApi, isSWC, outputSize, Decoder } from './decompress';
import { IFile } from './iConfigBase';

export function Fetcher(url = '', progress = f => f) {
	let total = 0;
	let reader: ReadableStreamDefaultReader<Uint8Array>;
	let chunks = [];

	progress && progress(0);

	return fetch(url)
		.then((request) => {
			total = +request.headers.get('Content-Length');
			reader = request.body.getReader();
			return reader.read();
		})
		.then( (data) => {
			const firstChunk = data.value; 

			console.debug("[Loader] Header:", String.fromCharCode.apply(null,firstChunk.slice(0, 3).reverse()));

			let loaded = 0;
			let decoder: any;

			if (supportDecoderApi && isSWC(firstChunk)) {
				const totalDecodedSize = outputSize(firstChunk);
				const swcHeader = firstChunk.slice(0, 8);

				swcHeader[0] = 70; // SWC => SWF

				console.debug("[Loader] SWC size:", outputSize(firstChunk));

				decoder = Decoder(totalDecodedSize, 8);
				decoder.buffer.set(swcHeader);

				// push witout header
				decoder.write(firstChunk.slice(8));

			} else {
				chunks.push(firstChunk);
			}

			loaded += firstChunk.length;
			progress && progress( Math.min(1, loaded / total));
	
			// update all other chunks reqursive while !done
			return reader.read().then( function moveNext(state) {
			
				if ( state.done) {
					if(!decoder) {
						let buffer = new Uint8Array(loaded);
						let offset = 0;
						
						chunks.forEach((e) => {
							buffer.set(e, offset);
							offset += e.length;
						});

						return buffer;
					} else {
						return decoder.readAll();
					}
				}

				const value = state.value;

				loaded += value.length;
                progress && progress(loaded / total);

				if (!decoder) {
					chunks.push(value);
				} else {
					decoder.write(value);
				}

				return reader.read().then(moveNext);
			});
		})
}

type tProgress = (p: number) => any;

export function loadBinary(file: IFile, progressEvent: tProgress = f => f): Promise<IFile> {
	const isScript = file.path.indexOf(".js") > -1;

	if (!isScript && supportDecoderApi) {
		return Fetcher(file.path, progressEvent).then((buffer) => {
			return Object.assign(file,
			{
				data: buffer.buffer,
				type: "swf",
			});
		})
	}

	const req = new XMLHttpRequest();

	req.addEventListener("progress", (e) => {
		// get from progress, then from request, and if not valid - from file
		const total = e.total 
			|| +req.getResponseHeader("content-length") 
			|| file.size 
			|| 0;

		if (!total) {
			progressEvent(1);
			return;
		}

		console.log("XHR", e.loaded, total);
		progressEvent(Math.min(1, e.loaded / total));
	});

	req.open("GET", file.path, true);
	req.responseType = isScript ? "text" : "arraybuffer";

	return new Promise((res, rej) => {
		req.addEventListener("error", rej);
		req.addEventListener("load", () => {
			progressEvent(1);

			if (isScript) {
				// unsafe
				//eval(req.response);

				const b = new Blob([req.response], { type: "text/javascript" });
				// use blob
				loadScript(URL.createObjectURL(b)).then(() => res(undefined));

				return;
			}
			res({
				meta: file.meta || {},
				name: file.name,
				path: file.path,
				resourceType: file.resourceType,
				data: req.response,
				type: isScript ? "js" : "swf",
			});
		});

		req.send();
	});
}

export function loadScript(file: string | IFile, progress?: tProgress) {
	const head = document.querySelector("head");
	const script = document.createElement("script");

	return new Promise((res, rej) => {
		Object.assign(script, {
			type: "text/javascript",
			async: true,
			src: typeof file === 'string' ? file :  file.path,
			onload: () => {
				progress && progress(1);
				res(script);
			},
			onerror: rej,
		});

		head.appendChild(script);
	});
}
